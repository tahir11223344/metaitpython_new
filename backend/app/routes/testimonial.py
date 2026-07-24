from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

# --- adjust these two imports to match your project ---
from app.database import get_db
from app.core.deps import get_current_user
# ------------------------------------------------------

from app.models.testimonial import Testimonial
from app.models.user import User
from app.schemas.testimonial import (
    TestimonialCreate,
    TestimonialListResponse,
    TestimonialResponse,
    TestimonialUpdate,
)

router = APIRouter(prefix="/testimonials", tags=["Testimonials"])


@router.get("", response_model=TestimonialListResponse)
def list_testimonials(
    search: Optional[str] = Query(None, description="Search in description/title"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    sort_dir: str = Query("desc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    # 🔓 Yahan se authentication hatayein taake public website par slider data load ho sake
):
    query = db.query(Testimonial)

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Testimonial.short_description.ilike(term),
                Testimonial.highlight_title.ilike(term),
            )
        )

    if is_active is not None:
        query = query.filter(Testimonial.is_active == is_active)

    total = query.count()

    order = (
        Testimonial.created_at.asc()
        if sort_dir == "asc"
        else Testimonial.created_at.desc()
    )
    items = query.order_by(order).offset((page - 1) * size).limit(size).all()

    return {"items": items, "total": total, "page": page, "size": size}


@router.post("", response_model=TestimonialResponse, status_code=status.HTTP_201_CREATED)
def create_testimonial(
    payload: TestimonialCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user), # 🔒 Admin/User authentication required
):
    testimonial = Testimonial(
        rating=payload.rating,
        is_active=payload.is_active,
        highlight_percentage=(payload.highlight_percentage or None),
        highlight_title=(payload.highlight_title or None),
        short_description=payload.short_description.strip(),
        created_by_id=current_user.id,
        updated_by_id=current_user.id,
    )
    db.add(testimonial)
    db.commit()
    db.refresh(testimonial)
    return testimonial


@router.get("/{testimonial_id}", response_model=TestimonialResponse)
def get_testimonial(
    testimonial_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user), # 🔒 Authentication required
):
    testimonial = (
        db.query(Testimonial).filter(Testimonial.id == testimonial_id).first()
    )
    if not testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return testimonial


@router.put("/{testimonial_id}", response_model=TestimonialResponse)
def update_testimonial(
    testimonial_id: UUID,
    payload: TestimonialUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user), # 🔒 Authentication required
):
    testimonial = (
        db.query(Testimonial).filter(Testimonial.id == testimonial_id).first()
    )
    if not testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found")

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        if isinstance(value, str):
            value = value.strip()
        setattr(testimonial, key, value)

    testimonial.updated_by_id = current_user.id
    db.commit()
    db.refresh(testimonial)
    return testimonial


@router.delete("/{testimonial_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_testimonial(
    testimonial_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user), # 🔒 Authentication required
):
    testimonial = (
        db.query(Testimonial).filter(Testimonial.id == testimonial_id).first()
    )
    if not testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    db.delete(testimonial)
    db.commit()
    return None