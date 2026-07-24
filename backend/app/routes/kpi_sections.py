from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

# --- adjust these two imports to match your project ---
from app.database import get_db
from app.core.deps import get_current_user
# ------------------------------------------------------

from app.models.kpi_sections import KPISection
from app.models.user import User
from app.schemas.kpi_sections import (
    KPISectionCreate,
    KPISectionListResponse,
    KPISectionResponse,
    KPISectionUpdate,
)

router = APIRouter(prefix="/kpi-sections", tags=["KPI Sections"])


@router.get("", response_model=KPISectionListResponse)
def list_kpi_sections(
    search: Optional[str] = Query(None, description="Search in tag/title/subtitle"),
    sort_dir: str = Query("desc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(KPISection)

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                KPISection.tag.ilike(term),
                KPISection.title.ilike(term),
                KPISection.subtitle.ilike(term),
            )
        )

    total = query.count()

    order = (
        KPISection.created_at.asc()
        if sort_dir == "asc"
        else KPISection.created_at.desc()
    )
    items = query.order_by(order).offset((page - 1) * size).limit(size).all()

    return {"items": items, "total": total, "page": page, "size": size}


@router.post("", response_model=KPISectionResponse, status_code=status.HTTP_201_CREATED)
def create_kpi_section(
    payload: KPISectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    kpi = KPISection(
        tag=payload.tag.strip(),
        title=payload.title.strip(),
        subtitle=payload.subtitle.strip(),
        points=payload.points,  # already cleaned by schema validator
    )
    db.add(kpi)
    db.commit()
    db.refresh(kpi)
    return kpi


@router.get("/{kpi_id}", response_model=KPISectionResponse)
def get_kpi_section(
    kpi_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    kpi = db.query(KPISection).filter(KPISection.id == kpi_id).first()
    if not kpi:
        raise HTTPException(status_code=404, detail="KPI section not found")
    return kpi


@router.put("/{kpi_id}", response_model=KPISectionResponse)
def update_kpi_section(
    kpi_id: int,
    payload: KPISectionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    kpi = db.query(KPISection).filter(KPISection.id == kpi_id).first()
    if not kpi:
        raise HTTPException(status_code=404, detail="KPI section not found")

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        if isinstance(value, str):
            value = value.strip()
        setattr(kpi, key, value)

    db.commit()
    db.refresh(kpi)
    return kpi


@router.delete("/{kpi_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_kpi_section(
    kpi_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    kpi = db.query(KPISection).filter(KPISection.id == kpi_id).first()
    if not kpi:
        raise HTTPException(status_code=404, detail="KPI section not found")
    db.delete(kpi)
    db.commit()
    return None