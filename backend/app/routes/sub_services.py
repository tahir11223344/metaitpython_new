"""
SubService routes.

Request format (create/update): multipart/form-data
    payload                    -> JSON string (poora sub-service object)
    icon                       -> file (optional)
    commitment_images          -> file list (optional)
    commitment_image_indexes   -> JSON array, e.g. "[0,2]"

Commitments Section ke har point ki apni image ho sakti hai, aur points ki
tadaad fix nahi. Is liye files ek list me jati hain aur `commitment_image_indexes`
batata hai ke kaunsi file kis point ki hai (dono ka order same hota hai).

main.py me:
    from app.routes import sub_services
    app.include_router(sub_services.router)
    app.include_router(sub_services.public_router)
"""

import json
import os
import shutil
import uuid
from typing import List, Optional

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
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_current_user
from app.database import get_db
from app.models.services import Service
from app.models.sub_services import SubService
from app.models.user import User
from app.schemas.sub_services import (
    SubServiceCreate,
    SubServiceListResponse,
    SubServiceRead,
    SubServiceUpdate,
)

router = APIRouter(prefix="/sub-services", tags=["Sub Services"])
public_router = APIRouter(prefix="/public/sub-services", tags=["Public • Sub Services"])

SUB_SERVICE_DIR = "uploads/sub-services"

ALLOWED_IMAGE_EXT = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".avif"}
MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 5 MB


def save_image(file: UploadFile, folder: str, field: str) -> str:
    """Image save kar ke stored path return karta hai: /<folder>/<uuid><ext>"""
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_IMAGE_EXT:
        raise HTTPException(
            status_code=400,
            detail=f"{field}: unsupported file type: {ext or 'unknown'}. "
            f"Allowed: {', '.join(sorted(ALLOWED_IMAGE_EXT))}",
        )

    os.makedirs(folder, exist_ok=True)
    stored_name = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(folder, stored_name)

    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    if os.path.getsize(path) > MAX_IMAGE_BYTES:
        os.remove(path)
        raise HTTPException(
            status_code=400, detail=f"{field}: image must be 5MB or smaller"
        )

    return f"/{folder}/{stored_name}"


def delete_file(stored_path: Optional[str]) -> None:
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


def _get_or_404(db: Session, sub_id: int) -> SubService:
    obj = db.get(SubService, sub_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Sub-service not found")
    return obj


def _ensure_service_exists(db: Session, service_id: int) -> Service:
    service = db.get(Service, service_id)
    if not service:
        raise HTTPException(status_code=422, detail="Selected service does not exist")
    return service


def _resolve_slug(payload, db: Session, exclude_id: Optional[int] = None) -> str:
    """Slug ek service ke andar unique hota hai, poori site me nahi."""
    try:
        slug = payload.resolved_slug()
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    q = db.query(SubService).filter(
        SubService.service_id == payload.service_id,
        SubService.slug == slug,
    )
    if exclude_id is not None:
        q = q.filter(SubService.id != exclude_id)

    if db.query(q.exists()).scalar():
        raise HTTPException(
            status_code=409,
            detail=f"Slug '{slug}' is already used by another sub-service of this service",
        )
    return slug


def _apply_images(
    payload,
    icon: Optional[UploadFile],
    commitment_images: List[UploadFile],
    commitment_image_indexes: str,
) -> dict:
    """Payload ko dict banata hai aur nayi uploaded images set karta hai."""
    data = payload.model_dump()

    if icon is not None:
        data["icon"] = save_image(icon, SUB_SERVICE_DIR, "icon")

    files = [f for f in (commitment_images or []) if f is not None]
    if files:
        try:
            indexes = json.loads(commitment_image_indexes or "[]")
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=400, detail="commitment_image_indexes is not valid JSON"
            )

        if len(indexes) != len(files):
            raise HTTPException(
                status_code=400,
                detail="commitment_image_indexes length does not match uploaded files",
            )

        points = data["commitments_section"]["points"]
        for file, idx in zip(files, indexes):
            if not isinstance(idx, int) or not 0 <= idx < len(points):
                raise HTTPException(
                    status_code=400, detail=f"Invalid commitment point index: {idx}"
                )
            points[idx]["image"] = save_image(
                file, SUB_SERVICE_DIR, f"commitment point {idx + 1} image"
            )

    return data


# ---------------------------------------------------------------- admin CRUD


@router.get("", response_model=SubServiceListResponse)
def list_sub_services(
    db: Session = Depends(get_db),
    service_id: Optional[int] = Query(None, description="Parent service se filter"),
    search: str = Query("", description="Title ya slug me search"),
    is_active: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
):
    # Filters ek jagah bana kar dono queries (count + page) par lagate hain
    filters = []
    if service_id is not None:
        filters.append(SubService.service_id == service_id)
    if search.strip():
        needle = f"%{search.strip()}%"
        filters.append(
            or_(SubService.title.ilike(needle), SubService.slug.ilike(needle))
        )
    if is_active is not None:
        filters.append(SubService.is_active.is_(is_active))

    total = db.query(func.count(SubService.id)).filter(*filters).scalar() or 0

    rows = (
        db.query(SubService)
        .options(joinedload(SubService.service))
        .filter(*filters)
        .order_by(SubService.sort_order.asc(), SubService.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    items = []
    for row in rows:
        item = {
            "id": row.id,
            "service_id": row.service_id,
            "title": row.title,
            "slug": row.slug,
            "icon": row.icon,
            "is_active": row.is_active,
            "show_on_services_page": row.show_on_services_page,
            "show_on_landing_page": row.show_on_landing_page,
            "sort_order": row.sort_order,
            "created_at": row.created_at,
            "updated_at": row.updated_at,
            "service_title": row.service.title if row.service else None,
            "service_slug": row.service.slug if row.service else None,
        }
        items.append(item)

    return {"items": items, "total": total, "page": page, "per_page": per_page}


@router.get("/{sub_id}", response_model=SubServiceRead)
def get_sub_service(
    sub_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _get_or_404(db, sub_id)


@router.post("", response_model=SubServiceRead, status_code=status.HTTP_201_CREATED)
def create_sub_service(
    payload: str = Form(...),
    icon: Optional[UploadFile] = File(None),
    commitment_images: Optional[List[UploadFile]] = File(None),
    commitment_image_indexes: str = Form("[]"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    parsed = _parse_payload(payload, SubServiceCreate)
    _ensure_service_exists(db, parsed.service_id)
    slug = _resolve_slug(parsed, db)

    data = _apply_images(parsed, icon, commitment_images, commitment_image_indexes)
    data["slug"] = slug

    obj = SubService(**data)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.put("/{sub_id}", response_model=SubServiceRead)
def update_sub_service(
    sub_id: int,
    payload: str = Form(...),
    icon: Optional[UploadFile] = File(None),
    commitment_images: Optional[List[UploadFile]] = File(None),
    commitment_image_indexes: str = Form("[]"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    obj = _get_or_404(db, sub_id)

    parsed = _parse_payload(payload, SubServiceUpdate)
    _ensure_service_exists(db, parsed.service_id)
    slug = _resolve_slug(parsed, db, exclude_id=sub_id)

    old_paths = obj.media_paths()
    data = _apply_images(parsed, icon, commitment_images, commitment_image_indexes)
    data["slug"] = slug

    for key, value in data.items():
        setattr(obj, key, value)

    db.commit()
    db.refresh(obj)

    for path in set(old_paths) - set(obj.media_paths()):
        delete_file(path)

    return obj


@router.delete("/{sub_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sub_service(
    sub_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    obj = _get_or_404(db, sub_id)
    paths = obj.media_paths()

    db.delete(obj)
    db.commit()

    for path in paths:
        delete_file(path)
    return None


# ---------------------------------------------------------------- public


@public_router.get("/landing", response_model=List[SubServiceRead])
def public_landing_sub_services(db: Session = Depends(get_db)):
    """Home page ke liye — jin par 'Show on Landing Page' = Yes hai."""
    return (
        db.query(SubService)
        .filter(
            SubService.is_active.is_(True),
            SubService.show_on_landing_page.is_(True),
        )
        .order_by(SubService.sort_order.asc(), SubService.created_at.desc())
        .all()
    )


@public_router.get("/{service_slug}/{sub_slug}", response_model=SubServiceRead)
def public_get_sub_service(
    service_slug: str, sub_slug: str, db: Session = Depends(get_db)
):
    obj = (
        db.query(SubService)
        .join(Service, SubService.service_id == Service.id)
        .filter(
            Service.slug == service_slug,
            Service.is_active.is_(True),
            SubService.slug == sub_slug,
            SubService.is_active.is_(True),
        )
        .first()
    )
    if not obj:
        raise HTTPException(status_code=404, detail="Sub-service not found")
    return obj