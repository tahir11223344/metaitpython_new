import os
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

# --- adjust these two imports to match your project ---
from app.database import get_db
from app.core.deps import get_current_user
# ------------------------------------------------------

from app.models.case_studies import CaseStudy
from app.models.user import User
from app.schemas.case_studies import (
    CaseStudyCreate,
    CaseStudyListResponse,
    CaseStudyResponse,
    CaseStudyUpdate,
)

router = APIRouter(prefix="/case-studies", tags=["Case Studies"])


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


@router.get("", response_model=CaseStudyListResponse)
def list_case_studies(
    search: Optional[str] = Query(None, description="Search in title/subtitle"),
    is_active: Optional[bool] = Query(None),
    sort_dir: str = Query("desc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user),
):
    query = db.query(CaseStudy)

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(CaseStudy.title.ilike(term), CaseStudy.subtitle.ilike(term))
        )

    if is_active is not None:
        query = query.filter(CaseStudy.is_active == is_active)

    total = query.count()

    order = (
        CaseStudy.created_at.asc()
        if sort_dir == "asc"
        else CaseStudy.created_at.desc()
    )
    items = query.order_by(order).offset((page - 1) * size).limit(size).all()

    return {"items": items, "total": total, "page": page, "size": size}


@router.post("", response_model=CaseStudyResponse, status_code=status.HTTP_201_CREATED)
def create_case_study(
    payload: CaseStudyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    case_study = CaseStudy(
        title=payload.title.strip(),
        subtitle=payload.subtitle or None,
        image=payload.image or None,
        image_alt=payload.image_alt or None,
        document=payload.document or None,
        document_name=payload.document_name or None,
        description=payload.description or None,
        is_active=payload.is_active,
    )
    db.add(case_study)
    db.commit()
    db.refresh(case_study)
    return case_study


@router.get("/{case_study_id}", response_model=CaseStudyResponse)
def get_case_study(
    case_study_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    case_study = db.query(CaseStudy).filter(CaseStudy.id == case_study_id).first()
    if not case_study:
        raise HTTPException(status_code=404, detail="Case study not found")
    return case_study


@router.put("/{case_study_id}", response_model=CaseStudyResponse)
def update_case_study(
    case_study_id: int,
    payload: CaseStudyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    case_study = db.query(CaseStudy).filter(CaseStudy.id == case_study_id).first()
    if not case_study:
        raise HTTPException(status_code=404, detail="Case study not found")

    data = payload.model_dump(exclude_unset=True)

    if "title" in data and data["title"]:
        data["title"] = data["title"].strip()

    # Purani files jo replace ho rahi hain — commit ke BAAD delete karenge
    old_files = []
    if "image" in data and data["image"] != case_study.image and case_study.image:
        old_files.append(case_study.image)
    if (
        "document" in data
        and data["document"] != case_study.document
        and case_study.document
    ):
        old_files.append(case_study.document)

    for key, value in data.items():
        setattr(case_study, key, value)

    db.commit()
    db.refresh(case_study)

    for f in old_files:
        _delete_file(f)

    return case_study


@router.delete("/{case_study_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_case_study(
    case_study_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    case_study = db.query(CaseStudy).filter(CaseStudy.id == case_study_id).first()
    if not case_study:
        raise HTTPException(status_code=404, detail="Case study not found")

    files = [f for f in (case_study.image, case_study.document) if f]

    db.delete(case_study)
    db.commit()

    for f in files:
        _delete_file(f)

    return None