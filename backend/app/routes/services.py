"""
Service routes.

Storage convention aap ke media router jaisi hi hai:
    files  -> uploads/services/<uuid><ext>
    stored -> "/uploads/services/<uuid><ext>"
    served -> main.py ke StaticFiles mount ("/uploads") se

Request format (create/update):
    multipart/form-data
      payload             -> JSON string (poora service object)
      thumbnail           -> file (optional)
      section_one_image   -> file (optional)
      section_two_image   -> file (optional)

Ek hi request me sab kuch jaata hai, is liye image upload aur record create
atomic rehte hain (orphan files nahi bantin).

main.py me:
    from app.routes import services
    app.include_router(services.router)
    app.include_router(services.public_router)
"""

import json
import os
import shutil
import uuid
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from pydantic import ValidationError
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db  # <-- adjust if your dependency lives elsewhere
from app.models.services import Service
from app.models.user import User
from app.schemas.services import (
    ServiceCreate,
    ServiceListResponse,
    ServiceRead,
    ServiceUpdate,
)
from app.schemas.sub_services import SubServiceBrief

router = APIRouter(prefix="/services", tags=["Services"])
public_router = APIRouter(prefix="/public/services", tags=["Public • Services"])


# ---------------------------------------------------------------- uploads

SERVICE_DIR = "uploads/services"

ALLOWED_IMAGE_EXT = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".avif"}
MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 5 MB


def _save_image(file: UploadFile, field: str) -> str:
    """Image save kar ke stored path return karta hai."""
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_IMAGE_EXT:
        raise HTTPException(
            status_code=400,
            detail=f"{field}: unsupported file type: {ext or 'unknown'}. "
            f"Allowed: {', '.join(sorted(ALLOWED_IMAGE_EXT))}",
        )

    os.makedirs(SERVICE_DIR, exist_ok=True)
    stored_name = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(SERVICE_DIR, stored_name)

    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    if os.path.getsize(path) > MAX_IMAGE_BYTES:
        os.remove(path)
        raise HTTPException(
            status_code=400, detail=f"{field}: image must be 5MB or smaller"
        )

    return f"/{SERVICE_DIR}/{stored_name}"


def _delete_file(stored_path: Optional[str]) -> None:
    """Safety: sirf 'uploads/' ke andar wali files delete hoti hain."""
    if not stored_path or not isinstance(stored_path, str):
        return
    if stored_path.startswith("http"):
        return
    rel = stored_path.lstrip("/")
    upload_root = os.path.abspath("uploads")
    target = os.path.abspath(rel)
    if not target.startswith(upload_root + os.sep):
        return
    try:
        if os.path.isfile(target):
            os.remove(target)
    except OSError:
        pass


# ---------------------------------------------------------------- helpers


def _parse_payload(raw: str, schema):
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="payload is not valid JSON")
    try:
        return schema(**data)
    except ValidationError as exc:
        # pydantic v2 ke errors() me `ctx` / `url` bhi hote hain jo hamesha
        # JSON-serializable nahi hote — sirf kaam ki cheezein bhejte hain.
        raise HTTPException(
            status_code=422,
            detail=[
                {
                    "loc": ["payload", *[str(x) for x in err.get("loc", ())]],
                    "msg": err.get("msg", "Invalid value"),
                    "type": err.get("type", "value_error"),
                }
                for err in exc.errors()
            ],
        )


def _slug_taken(db: Session, slug: str, exclude_id: Optional[int] = None) -> bool:
    q = db.query(Service).filter(Service.slug == slug)
    if exclude_id is not None:
        q = q.filter(Service.id != exclude_id)
    return db.query(q.exists()).scalar()


def _resolve_slug(payload, db: Session, exclude_id: Optional[int] = None) -> str:
    try:
        slug = payload.resolved_slug()
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    if _slug_taken(db, slug, exclude_id):
        raise HTTPException(
            status_code=409, detail=f"Slug '{slug}' is already in use"
        )
    return slug


def _get_or_404(db: Session, service_id: int) -> Service:
    """ORM object return karta hai — update/delete isi par setattr karte hain."""
    obj = db.get(Service, service_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Service not found")
    return obj


def _apply_images(
    payload,
    thumbnail: Optional[UploadFile],
    section_one_image: Optional[UploadFile],
    section_two_image: Optional[UploadFile],
) -> dict:
    """Payload ko dict me badal kar nayi uploaded images set karta hai.

    Naya file na aaye to payload ka purana path waisa hi rehta hai — is tarah
    edit par image preserve ho jati hai.
    """
    data = payload.model_dump()

    if thumbnail is not None:
        data["thumbnail"] = _save_image(thumbnail, "thumbnail")
    if section_one_image is not None:
        data["section_one"]["image"] = _save_image(
            section_one_image, "section_one_image"
        )
    if section_two_image is not None:
        data["section_two"]["image"] = _save_image(
            section_two_image, "section_two_image"
        )
    return data


# ---------------------------------------------------------------- admin CRUD


@router.get("", response_model=ServiceListResponse)
def list_services(
    db: Session = Depends(get_db),
    search: str = Query("", description="Title ya slug me search"),
    is_active: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Service)

    if search.strip():
        needle = f"%{search.strip()}%"
        q = q.filter(or_(Service.title.ilike(needle), Service.slug.ilike(needle)))
    if is_active is not None:
        q = q.filter(Service.is_active.is_(is_active))

    total = q.with_entities(func.count(Service.id)).scalar() or 0
    items = (
        q.order_by(Service.sort_order.asc(), Service.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )
    return {"items": items, "total": total, "page": page, "per_page": per_page}


@router.get("/{service_id}", response_model=ServiceRead)
def get_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _get_or_404(db, service_id)


@router.post("", response_model=ServiceRead, status_code=status.HTTP_201_CREATED)
def create_service(
    payload: str = Form(...),
    thumbnail: Optional[UploadFile] = File(None),
    section_one_image: Optional[UploadFile] = File(None),
    section_two_image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    parsed = _parse_payload(payload, ServiceCreate)
    slug = _resolve_slug(parsed, db)

    data = _apply_images(parsed, thumbnail, section_one_image, section_two_image)
    data["slug"] = slug

    obj = Service(**data)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.put("/{service_id}", response_model=ServiceRead)
def update_service(
    service_id: int,
    payload: str = Form(...),
    thumbnail: Optional[UploadFile] = File(None),
    section_one_image: Optional[UploadFile] = File(None),
    section_two_image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    obj = _get_or_404(db, service_id)

    parsed = _parse_payload(payload, ServiceUpdate)
    slug = _resolve_slug(parsed, db, exclude_id=service_id)

    old_paths = obj.media_paths()
    data = _apply_images(parsed, thumbnail, section_one_image, section_two_image)
    data["slug"] = slug

    for key, value in data.items():
        setattr(obj, key, value)

    db.commit()
    db.refresh(obj)

    # jo images ab kahin use nahi ho rahin, unhe disk se hata do
    for path in set(old_paths) - set(obj.media_paths()):
        _delete_file(path)

    return obj


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    obj = _get_or_404(db, service_id)
    paths = obj.media_paths()

    db.delete(obj)  # sub-services cascade se chali jati hain
    db.commit()

    for path in paths:
        _delete_file(path)
    return None


# ---------------------------------------------------------------- public


@public_router.get("", response_model=ServiceListResponse)
def public_list_services(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
):
    q = db.query(Service).filter(Service.is_active.is_(True))
    total = q.with_entities(func.count(Service.id)).scalar() or 0
    items = (
        q.order_by(Service.sort_order.asc(), Service.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )
    return {"items": items, "total": total, "page": page, "per_page": per_page}


@public_router.get("/{slug}", response_model=ServiceRead)
def public_get_service(slug: str, db: Session = Depends(get_db)):
    obj = (
        db.query(Service)
        .filter(Service.slug == slug, Service.is_active.is_(True))
        .first()
    )
    if not obj:
        raise HTTPException(status_code=404, detail="Service not found")

    # Sub-services yahin filter hoti hain: sirf active + "Show on Services Page" = Yes.
    # Ye service detail page ke cards ke liye hai.
    data = ServiceRead.model_validate(obj).model_dump()
    data["sub_services"] = [
        SubServiceBrief.model_validate(sub).model_dump()
        for sub in obj.sub_services
        if sub.is_active and sub.show_on_services_page
    ]
    return data