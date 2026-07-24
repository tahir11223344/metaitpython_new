import os
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

# --- adjust these two imports to match your project ---
from app.database import get_db
from app.core.deps import get_current_user
# ------------------------------------------------------

from app.models.brands import Brand
from app.models.user import User
from app.schemas.brands import (
    BrandCreate,
    BrandListResponse,
    BrandResponse,
    BrandUpdate,
)

router = APIRouter(prefix="/brands", tags=["Brands"])

SORTABLE = {
    "sort_order": Brand.sort_order,
    "company_name": Brand.company_name,
    "created_at": Brand.created_at,
    "updated_at": Brand.updated_at,
}


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


@router.get("", response_model=BrandListResponse)
def list_brands(
    search: Optional[str] = Query(None, description="Search in company name/website"),
    is_active: Optional[bool] = Query(None),
    sort_by: str = Query("sort_order", pattern="^(sort_order|company_name|created_at|updated_at)$"),
    sort_dir: str = Query("asc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user),
):
    query = db.query(Brand)

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(Brand.company_name.ilike(term), Brand.website.ilike(term))
        )

    if is_active is not None:
        query = query.filter(Brand.is_active == is_active)

    total = query.count()

    column = SORTABLE[sort_by]
    order = column.asc() if sort_dir == "asc" else column.desc()
    items = query.order_by(order).offset((page - 1) * size).limit(size).all()

    return {"items": items, "total": total, "page": page, "size": size}


@router.post("", response_model=BrandResponse, status_code=status.HTTP_201_CREATED)
def create_brand(
    payload: BrandCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    brand = Brand(
        company_name=payload.company_name.strip(),
        website=payload.website,
        logo=payload.logo or None,
        logo_alt=payload.logo_alt or None,
        sort_order=payload.sort_order or 0,
        is_active=payload.is_active,
    )
    db.add(brand)
    db.commit()
    db.refresh(brand)
    return brand


@router.get("/{brand_id}", response_model=BrandResponse)
def get_brand(
    brand_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return brand


@router.put("/{brand_id}", response_model=BrandResponse)
def update_brand(
    brand_id: int,
    payload: BrandUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    data = payload.model_dump(exclude_unset=True)

    if "company_name" in data and data["company_name"]:
        data["company_name"] = data["company_name"].strip()

    # Logo badla to purani file delete karni hai (commit ke BAAD)
    old_logo = None
    if "logo" in data and data["logo"] != brand.logo and brand.logo:
        old_logo = brand.logo

    for key, value in data.items():
        setattr(brand, key, value)

    db.commit()
    db.refresh(brand)

    if old_logo:
        _delete_file(old_logo)

    return brand


@router.delete("/{brand_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_brand(
    brand_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    logo = brand.logo

    db.delete(brand)
    db.commit()

    _delete_file(logo)

    return None