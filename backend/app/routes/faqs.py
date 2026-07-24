from typing import Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session
from fastapi import Depends

from app.database import get_db
from app.models.faqs import FAQ
from app.schemas.faqs import (
    FAQ_PAGES,
    FAQCreate,
    FAQListResponse,
    FAQResponse,
    FAQUpdate,
)

router = APIRouter(prefix="/faqs", tags=["FAQs"])


@router.get("/pages", response_model=list[str])
def list_pages():
    """Allowed page options for the FAQ dropdown."""
    return FAQ_PAGES


@router.get("", response_model=FAQListResponse)
def list_faqs(
    search: Optional[str] = Query(None, description="Search in question/answer"),
    page_name: Optional[str] = Query(None, description="Filter by page"),
    sort_dir: str = Query("desc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(FAQ)

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(or_(FAQ.question.ilike(term), FAQ.answer.ilike(term)))

    if page_name:
        query = query.filter(FAQ.page == page_name)

    total = query.count()

    order = FAQ.created_at.asc() if sort_dir == "asc" else FAQ.created_at.desc()
    items = query.order_by(order).offset((page - 1) * size).limit(size).all()

    return {"items": items, "total": total, "page": page, "size": size}


@router.post("", response_model=FAQResponse, status_code=status.HTTP_201_CREATED)
def create_faq(
    payload: FAQCreate,
    db: Session = Depends(get_db),
):
    faq = FAQ(
        page=payload.page,
        question=payload.question.strip(),
        answer=payload.answer.strip(),
        # created_by_id / updated_by_id ab None rahenge kyunki koi logged-in user nahi hai
    )
    db.add(faq)
    db.commit()
    db.refresh(faq)
    return faq


@router.get("/{faq_id}", response_model=FAQResponse)
def get_faq(
    faq_id: UUID,
    db: Session = Depends(get_db),
):
    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    return faq


@router.put("/{faq_id}", response_model=FAQResponse)
def update_faq(
    faq_id: UUID,
    payload: FAQUpdate,
    db: Session = Depends(get_db),
):
    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        if isinstance(value, str):
            value = value.strip()
        setattr(faq, key, value)

    db.commit()
    db.refresh(faq)
    return faq


@router.delete("/{faq_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_faq(
    faq_id: UUID,
    db: Session = Depends(get_db),
):
    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    db.delete(faq)
    db.commit()
    return None