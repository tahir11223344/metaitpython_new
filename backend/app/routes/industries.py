import os
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

# --- adjust these two imports to match your project ---
from app.database import get_db
from app.core.deps import get_current_user
# ------------------------------------------------------

from app.models.industries import Industry
from app.models.user import User
from app.schemas.industries import (
    IndustryCreate,
    IndustryListResponse,
    IndustryResponse,
    IndustryUpdate,
)

router = APIRouter(prefix="/industries", tags=["Industries"])


def _delete_file(stored_path: Optional[str]) -> None:
    """Safety: sirf 'uploads/' ke andar wali files delete hoti hain."""
    if not stored_path or not isinstance(stored_path, str):
        return
    if stored_path.startswith("http"):
        return  # external URL — hamari file nahi
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


def _collect_images(industry: Industry) -> List[str]:
    """
    Industry se juri saari image paths nikalta hai (delete ke waqt cleanup ke liye).
    NOTE: rich-text description ke ANDAR embed ki hui images yahan shaamil nahi hain.
    """
    paths: List[str] = []
    if industry.image:
        paths.append(industry.image)

    sub = industry.sub_details or {}
    if not isinstance(sub, dict):
        return paths

    hero = sub.get("hero") or {}
    for slide in hero.get("slides") or []:
        if isinstance(slide, dict):
            if slide.get("image"):
                paths.append(slide["image"])
            for g in slide.get("gallery_images") or []:
                if g:
                    paths.append(g)

    accordion = sub.get("accordion") or {}
    if accordion.get("image"):
        paths.append(accordion["image"])

    experience = sub.get("experience") or {}
    for img in experience.get("images") or []:
        if img:
            paths.append(img)

    return paths


def _slug_taken(db: Session, slug: str, exclude_id: Optional[int] = None) -> bool:
    q = db.query(Industry).filter(Industry.slug == slug)
    if exclude_id is not None:
        q = q.filter(Industry.id != exclude_id)
    return db.query(q.exists()).scalar()


@router.get("", response_model=IndustryListResponse)
def list_industries(
    search: Optional[str] = Query(None, description="Search in name/slug"),
    is_active: Optional[bool] = Query(None),
    sort_dir: str = Query("desc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user),
):
    query = db.query(Industry)

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(Industry.name.ilike(term), Industry.slug.ilike(term))
        )

    if is_active is not None:
        query = query.filter(Industry.is_active == is_active)

    total = query.count()

    order = (
        Industry.created_at.asc() if sort_dir == "asc" else Industry.created_at.desc()
    )
    items = query.order_by(order).offset((page - 1) * size).limit(size).all()

    return {"items": items, "total": total, "page": page, "size": size}


@router.post("", response_model=IndustryResponse, status_code=status.HTTP_201_CREATED)
def create_industry(
    payload: IndustryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if _slug_taken(db, payload.slug):
        raise HTTPException(status_code=400, detail="Slug already exists")

    industry = Industry(
        name=payload.name.strip(),
        slug=payload.slug,  # schema ne normalize kar diya
        description=payload.description or None,
        image=payload.image or None,
        image_alt=payload.image_alt or None,
        is_active=payload.is_active,
        sub_details=payload.sub_details.model_dump(),
        meta_title=payload.meta_title or None,
        meta_keyword=payload.meta_keyword or None,
        meta_description=payload.meta_description or None,
    )
    db.add(industry)
    db.commit()
    db.refresh(industry)
    return industry


@router.get("/slug/{slug}", response_model=IndustryResponse)
def get_industry_by_slug(slug: str, db: Session = Depends(get_db)):
    """
    PUBLIC — website ke detail page (/industries/[slug]) ke liye.
    Sirf active industries hi milti hain.
    """
    industry = (
        db.query(Industry)
        .filter(Industry.slug == slug, Industry.is_active.is_(True))
        .first()
    )
    if not industry:
        raise HTTPException(status_code=404, detail="Industry not found")
    return industry


@router.get("/{industry_id}", response_model=IndustryResponse)
def get_industry(
    industry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    industry = db.query(Industry).filter(Industry.id == industry_id).first()
    if not industry:
        raise HTTPException(status_code=404, detail="Industry not found")
    return industry


@router.put("/{industry_id}", response_model=IndustryResponse)
def update_industry(
    industry_id: int,
    payload: IndustryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    industry = db.query(Industry).filter(Industry.id == industry_id).first()
    if not industry:
        raise HTTPException(status_code=404, detail="Industry not found")

    data = payload.model_dump(exclude_unset=True)

    if "slug" in data and _slug_taken(db, data["slug"], exclude_id=industry_id):
        raise HTTPException(status_code=400, detail="Slug already exists")

    if "name" in data and data["name"]:
        data["name"] = data["name"].strip()

    for key, value in data.items():
        setattr(industry, key, value)

    db.commit()
    db.refresh(industry)
    return industry


@router.delete("/{industry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_industry(
    industry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    industry = db.query(Industry).filter(Industry.id == industry_id).first()
    if not industry:
        raise HTTPException(status_code=404, detail="Industry not found")

    images = _collect_images(industry)

    db.delete(industry)
    db.commit()

    for path in images:
        _delete_file(path)

    return None