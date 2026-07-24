from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional

from app.database import get_db
from app.models.seo_meta import SeoMeta
from app.schemas.seo_meta import SeoMetaCreate, SeoMetaUpdate, SeoMetaOut, SeoMetaListOut

router = APIRouter(prefix="/api/seo-meta", tags=["SEO Meta"])


@router.get("/", response_model=SeoMetaListOut)
def get_all_seo_meta(
    search: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    query = db.query(SeoMeta)

    if search:
        query = query.filter(
            or_(
                SeoMeta.page_name.ilike(f"%{search}%"),
                SeoMeta.meta_title.ilike(f"%{search}%"),
                SeoMeta.meta_keyword.ilike(f"%{search}%"),
            )
        )

    total = query.count()
    items = query.order_by(SeoMeta.id.desc()).offset(skip).limit(limit).all()
    return {"total": total, "items": items}


@router.get("/{seo_meta_id}", response_model=SeoMetaOut)
def get_seo_meta(seo_meta_id: int, db: Session = Depends(get_db)):
    item = db.query(SeoMeta).filter(SeoMeta.id == seo_meta_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="SEO Meta not found")
    return item


@router.post("/", response_model=SeoMetaOut, status_code=201)
def create_seo_meta(payload: SeoMetaCreate, db: Session = Depends(get_db)):
    existing = db.query(SeoMeta).filter(SeoMeta.page_name == payload.page_name).first()
    if existing:
        raise HTTPException(status_code=400, detail="SEO Meta for this page already exists")

    item = SeoMeta(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{seo_meta_id}", response_model=SeoMetaOut)
def update_seo_meta(seo_meta_id: int, payload: SeoMetaUpdate, db: Session = Depends(get_db)):
    item = db.query(SeoMeta).filter(SeoMeta.id == seo_meta_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="SEO Meta not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, key, value)

    db.commit()
    db.refresh(item)
    return item


@router.delete("/{seo_meta_id}")
def delete_seo_meta(seo_meta_id: int, db: Session = Depends(get_db)):
    item = db.query(SeoMeta).filter(SeoMeta.id == seo_meta_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="SEO Meta not found")

    db.delete(item)
    db.commit()
    return {"message": "SEO Meta deleted successfully"}