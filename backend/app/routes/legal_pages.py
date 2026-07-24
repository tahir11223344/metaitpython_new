from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

# --- adjust these two imports to match your project ---
from app.database import get_db
from app.core.deps import get_current_user
# ------------------------------------------------------

from app.models.legal_pages import LegalPage
from app.models.user import User
from app.schemas.legal_pages import (
    LEGAL_PAGE_TYPES,
    VALID_TYPE_KEYS,
    LegalPageListResponse,
    LegalPageResponse,
    LegalPageType,
    LegalPageUpsert,
    label_for,
)

router = APIRouter(prefix="/legal-pages", tags=["Legal Pages"])


def _check_type(page_type: str) -> None:
    if page_type not in VALID_TYPE_KEYS:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown page type. Allowed: {', '.join(VALID_TYPE_KEYS)}",
        )


# ---------------------------------------------------------------------------
# NOTE: /types route /{page_type} se PEHLE hona chahiye, warna "types" ko
# page_type samajh liya jayega.
# ---------------------------------------------------------------------------


@router.get("/types", response_model=List[LegalPageType])
def list_types():
    """Available legal pages (key + label)."""
    return LEGAL_PAGE_TYPES


@router.get("", response_model=LegalPageListResponse)
def list_legal_pages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Admin list — saare defined types return karta hai, chahe DB mein abhi record
    na bhi ho (`exists: false`). Isse dashboard mein pata chalta hai kaunsa page
    abhi tak nahi bhara gaya.
    """
    rows = db.query(LegalPage).all()
    by_type = {r.page_type: r for r in rows}

    items = []
    for t in LEGAL_PAGE_TYPES:
        row = by_type.get(t["key"])
        items.append(
            {
                "page_type": t["key"],
                "label": t["label"],
                "heading": row.heading if row else None,
                "exists": bool(row),
                "updated_at": row.updated_at if row else None,
            }
        )

    return {"items": items}


@router.get("/{page_type}", response_model=LegalPageResponse)
def get_legal_page(page_type: str, db: Session = Depends(get_db)):
    """
    PUBLIC — website ke privacy-policy / terms / disclaimer pages ke liye.
    """
    _check_type(page_type)

    page = db.query(LegalPage).filter(LegalPage.page_type == page_type).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not configured yet")

    page.label = label_for(page_type)  # response ke liye
    return page


@router.put("/{page_type}", response_model=LegalPageResponse)
def upsert_legal_page(
    page_type: str,
    payload: LegalPageUpsert,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Record na ho to bana deta hai, ho to update kar deta hai."""
    _check_type(page_type)

    page = db.query(LegalPage).filter(LegalPage.page_type == page_type).first()

    if not page:
        page = LegalPage(page_type=page_type)
        db.add(page)

    page.heading = (payload.heading or "").strip() or None
    page.subtitle = (payload.subtitle or "").strip() or None
    page.content = payload.content or None

    db.commit()
    db.refresh(page)

    page.label = label_for(page_type)
    return page


@router.delete("/{page_type}", status_code=status.HTTP_204_NO_CONTENT)
def delete_legal_page(
    page_type: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Content clear karne ke liye (page type khud kabhi delete nahi hota)."""
    _check_type(page_type)

    page = db.query(LegalPage).filter(LegalPage.page_type == page_type).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    db.delete(page)
    db.commit()
    return None