import os
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

# --- adjust these two imports to match your project ---
from app.database import get_db
from app.core.deps import get_current_user
# ------------------------------------------------------

from app.models.blogs import Blog
from app.models.categories import Category
from app.models.user import User
from app.schemas.blogs import (
    BLOG_TYPES,
    BlogCreate,
    BlogListResponse,
    BlogResponse,
    BlogUpdate,
)

router = APIRouter(prefix="/blogs", tags=["Blogs"])


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


def _slug_taken(db: Session, slug: str, exclude_id: Optional[int] = None) -> bool:
    q = db.query(Blog).filter(Blog.slug == slug)
    if exclude_id is not None:
        q = q.filter(Blog.id != exclude_id)
    return db.query(q.exists()).scalar()


# ---------------------------------------------------------------------------
# NOTE: /types aur /slug/{slug} routes /{blog_id} se PEHLE hone chahiye,
# warna FastAPI "types" ko int blog_id samajh kar 422 dega.
# ---------------------------------------------------------------------------


@router.get("/types", response_model=List[str])
def list_types():
    """Type dropdown ke allowed options."""
    return BLOG_TYPES


@router.get("", response_model=BlogListResponse)
def list_blogs(
    search: Optional[str] = Query(None, description="Search in title/slug/short desc"),
    category_id: Optional[int] = Query(None),
    type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    sort_dir: str = Query("desc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user),
):
    query = db.query(Blog)

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Blog.title.ilike(term),
                Blog.slug.ilike(term),
                Blog.short_description.ilike(term),
            )
        )

    if category_id is not None:
        query = query.filter(Blog.category_id == category_id)

    if type:
        query = query.filter(Blog.type == type)

    if is_active is not None:
        query = query.filter(Blog.is_active == is_active)

    total = query.count()

    order = Blog.created_at.asc() if sort_dir == "asc" else Blog.created_at.desc()
    items = query.order_by(order).offset((page - 1) * size).limit(size).all()

    return {"items": items, "total": total, "page": page, "size": size}


@router.post("", response_model=BlogResponse, status_code=status.HTTP_201_CREATED)
def create_blog(
    payload: BlogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if _slug_taken(db, payload.slug):
        raise HTTPException(status_code=400, detail="Slug already exists")

    if payload.category_id is not None:
        category = db.query(Category).filter(Category.id == payload.category_id).first()
        if not category:
            raise HTTPException(status_code=400, detail="Category not found")

    blog = Blog(
        title=payload.title.strip(),
        slug=payload.slug,
        category_id=payload.category_id,
        is_active=payload.is_active,
        type=payload.type,
        read_time=payload.read_time or None,
        image=payload.image or None,
        image_alt=payload.image_alt or None,
        short_description=payload.short_description or None,
        description=payload.description or None,
        meta_title=payload.meta_title or None,
        meta_keyword=payload.meta_keyword or None,
        meta_description=payload.meta_description or None,
    )
    db.add(blog)
    db.commit()
    db.refresh(blog)
    return blog


@router.get("/slug/{slug}", response_model=BlogResponse)
def get_blog_by_slug(slug: str, db: Session = Depends(get_db)):
    """PUBLIC — website ke blog detail page (/blog/[slug]) ke liye. Sirf active blogs."""
    blog = (
        db.query(Blog).filter(Blog.slug == slug, Blog.is_active.is_(True)).first()
    )
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return blog


@router.get("/{blog_id}", response_model=BlogResponse)
def get_blog(
    blog_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return blog


@router.put("/{blog_id}", response_model=BlogResponse)
def update_blog(
    blog_id: int,
    payload: BlogUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    data = payload.model_dump(exclude_unset=True)

    if "slug" in data and _slug_taken(db, data["slug"], exclude_id=blog_id):
        raise HTTPException(status_code=400, detail="Slug already exists")

    if data.get("category_id") is not None:
        category = db.query(Category).filter(Category.id == data["category_id"]).first()
        if not category:
            raise HTTPException(status_code=400, detail="Category not found")

    if "title" in data and data["title"]:
        data["title"] = data["title"].strip()

    # Image badli to purani file delete karni hai (commit ke baad)
    old_image = None
    if "image" in data and data["image"] != blog.image:
        old_image = blog.image

    for key, value in data.items():
        setattr(blog, key, value)

    db.commit()
    db.refresh(blog)

    if old_image:
        _delete_file(old_image)

    return blog


@router.delete("/{blog_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_blog(
    blog_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    image = blog.image

    db.delete(blog)
    db.commit()

    _delete_file(image)

    return None