import os
import re
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
from sqlalchemy import or_
from sqlalchemy.orm import Session

# --- adjust these two imports to match your project ---
from app.database import get_db
from app.core.deps import get_current_user
# ------------------------------------------------------

from app.models.portfolios import Portfolio
from app.models.categories import Category
from app.models.user import User
from app.schemas.portfolios import PortfolioListResponse, PortfolioResponse

router = APIRouter(prefix="/portfolios", tags=["Portfolios"])

UPLOAD_DIR = "uploads/portfolios"
ALLOWED_IMAGE_EXT = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".avif"}


def slugify(value: str) -> str:
    value = (value or "").strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def _save_upload(file: UploadFile) -> str:
    """File ko disk pe save karke uska relative URL path return karta hai."""
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_IMAGE_EXT:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    name = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_DIR, name)
    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return f"/{UPLOAD_DIR}/{name}"


def _delete_file(stored_path: str) -> None:
   
    if not stored_path:
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


def _slug_taken(db: Session, slug: str, exclude_id: Optional[int] = None) -> bool:
    q = db.query(Portfolio).filter(Portfolio.slug == slug)
    if exclude_id is not None:
        q = q.filter(Portfolio.id != exclude_id)
    return db.query(q.exists()).scalar()


@router.get("", response_model=PortfolioListResponse)
def list_portfolios(
    search: Optional[str] = Query(None, description="Search in title/slug/subtitle"),
    category_id: Optional[int] = Query(None),
    sort_dir: str = Query("desc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Portfolio)

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Portfolio.title.ilike(term),
                Portfolio.slug.ilike(term),
                Portfolio.subtitle.ilike(term),
            )
        )

    if category_id is not None:
        query = query.filter(Portfolio.category_id == category_id)

    total = query.count()

    order = (
        Portfolio.created_at.asc() if sort_dir == "asc" else Portfolio.created_at.desc()
    )
    items = query.order_by(order).offset((page - 1) * size).limit(size).all()

    return {"items": items, "total": total, "page": page, "size": size}


@router.post("", response_model=PortfolioResponse, status_code=status.HTTP_201_CREATED)
def create_portfolio(
    category_id: int = Form(...),
    title: str = Form(...),
    slug: str = Form(...),
    subtitle: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    image_alt: Optional[str] = Form(None),
    is_active: bool = Form(True),
    show_on_landing: bool = Form(False),
    thumbnail: Optional[UploadFile] = File(None),
    gallery_images: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=400, detail="Category not found")

    norm_slug = slugify(slug)
    if not norm_slug:
        raise HTTPException(status_code=400, detail="Invalid slug")
    if _slug_taken(db, norm_slug):
        raise HTTPException(status_code=400, detail="Slug already exists")

    thumb_path = None
    if thumbnail and thumbnail.filename:
        thumb_path = _save_upload(thumbnail)

    gallery_paths = [
        _save_upload(f) for f in (gallery_images or []) if f and f.filename
    ]

    portfolio = Portfolio(
        category_id=category_id,
        title=title.strip(),
        slug=norm_slug,
        subtitle=(subtitle or None),
        description=(description or None),
        thumbnail=thumb_path,
        gallery_images=gallery_paths,
        image_alt=(image_alt or None),
        is_active=is_active,
        show_on_landing=show_on_landing,
    )
    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)
    return portfolio


@router.get("/{portfolio_id}", response_model=PortfolioResponse)
def get_portfolio(
    portfolio_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return portfolio


@router.put("/{portfolio_id}", response_model=PortfolioResponse)
def update_portfolio(
    portfolio_id: int,
    category_id: Optional[int] = Form(None),
    title: Optional[str] = Form(None),
    slug: Optional[str] = Form(None),
    subtitle: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    image_alt: Optional[str] = Form(None),
    is_active: Optional[bool] = Form(None),
    show_on_landing: Optional[bool] = Form(None),
    thumbnail: Optional[UploadFile] = File(None),
    gallery_images: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    if category_id is not None:
        category = db.query(Category).filter(Category.id == category_id).first()
        if not category:
            raise HTTPException(status_code=400, detail="Category not found")
        portfolio.category_id = category_id

    if title is not None:
        portfolio.title = title.strip()

    if slug is not None:
        norm_slug = slugify(slug)
        if not norm_slug:
            raise HTTPException(status_code=400, detail="Invalid slug")
        if _slug_taken(db, norm_slug, exclude_id=portfolio_id):
            raise HTTPException(status_code=400, detail="Slug already exists")
        portfolio.slug = norm_slug

    if subtitle is not None:
        portfolio.subtitle = subtitle or None
    if description is not None:
        portfolio.description = description or None
    if image_alt is not None:
        portfolio.image_alt = image_alt or None
    if is_active is not None:
        portfolio.is_active = is_active
    if show_on_landing is not None:
        portfolio.show_on_landing = show_on_landing

    # Purani files jinhe replace kiya ja raha hai — successful commit ke BAAD delete karenge
    old_files_to_delete = []

    # Nayi thumbnail di gayi to replace (purani hata do)
    if thumbnail and thumbnail.filename:
        if portfolio.thumbnail:
            old_files_to_delete.append(portfolio.thumbnail)
        portfolio.thumbnail = _save_upload(thumbnail)

    # Nayi gallery files di gayi to poori list replace (purani hata do)
    new_gallery = [_save_upload(f) for f in (gallery_images or []) if f and f.filename]
    if new_gallery:
        if portfolio.gallery_images:
            old_files_to_delete.extend(portfolio.gallery_images)
        portfolio.gallery_images = new_gallery

    db.commit()
    db.refresh(portfolio)

    # Commit ke baad purani (replaced) files disk se delete
    for f in old_files_to_delete:
        _delete_file(f)

    return portfolio


@router.delete("/{portfolio_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_portfolio(
    portfolio_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    # Delete karne se pehle is portfolio ki saari image files jama kar lo
    files_to_delete = []
    if portfolio.thumbnail:
        files_to_delete.append(portfolio.thumbnail)
    if portfolio.gallery_images:
        files_to_delete.extend(portfolio.gallery_images)

    db.delete(portfolio)
    db.commit()

    # DB record delete hone ke baad disk se files bhi delete
    for f in files_to_delete:
        _delete_file(f)

    return None