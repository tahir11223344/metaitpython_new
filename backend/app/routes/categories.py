from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

# --- adjust these two imports to match your project ---
from app.database import get_db
from app.core.deps import get_current_user
# ------------------------------------------------------

from app.models.categories import Category
from app.models.user import User
from app.schemas.categories import (
    CategoryCreate,
    CategoryListResponse,
    CategoryResponse,
    CategoryUpdate,
)

router = APIRouter(prefix="/categories", tags=["Categories"])


def _slug_taken(db: Session, slug: str, exclude_id: Optional[int] = None) -> bool:
    q = db.query(Category).filter(Category.slug == slug)
    if exclude_id is not None:
        q = q.filter(Category.id != exclude_id)
    return db.query(q.exists()).scalar()


@router.get("", response_model=CategoryListResponse)
def list_categories(
    search: Optional[str] = Query(None, description="Search in name/slug"),
    status_filter: Optional[str] = Query(None, alias="status"),
    sort_dir: str = Query("desc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Category)

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(or_(Category.name.ilike(term), Category.slug.ilike(term)))

    if status_filter:
        query = query.filter(Category.status == status_filter.strip().lower())

    total = query.count()

    order = (
        Category.created_at.asc() if sort_dir == "asc" else Category.created_at.desc()
    )
    items = query.order_by(order).offset((page - 1) * size).limit(size).all()

    return {"items": items, "total": total, "page": page, "size": size}


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if _slug_taken(db, payload.slug):
        raise HTTPException(status_code=400, detail="Slug already exists")

    category = Category(
        name=payload.name.strip(),
        slug=payload.slug,  # already normalized by schema
        status=payload.status,
        show_on_header=payload.show_on_header,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    payload: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    data = payload.model_dump(exclude_unset=True)

    if "slug" in data and _slug_taken(db, data["slug"], exclude_id=category_id):
        raise HTTPException(status_code=400, detail="Slug already exists")

    for key, value in data.items():
        if isinstance(value, str) and key == "name":
            value = value.strip()
        setattr(category, key, value)

    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(category)
    db.commit()
    return None