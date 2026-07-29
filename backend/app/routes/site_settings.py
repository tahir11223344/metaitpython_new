"""
Site settings routes.

Singleton pattern: hamesha id=1 wali row. Na ho to pehli baar khud ban jati
hai. Is liye "create" endpoint nahi — sirf get aur update.

Public:
    GET   /public/site-settings     header/footer ke liye (auth nahi)

Admin:
    GET   /site-settings            form ke liye
    PUT   /site-settings            update

Logo/favicon aap ke mojooda /media/image endpoint se upload karein (jaisa
case studies me hota hai), phir milne wala URL yahan `logo`/`favicon` me
bhej dein.

main.py:
    from app.routes import site_settings
    app.include_router(site_settings.router)
    app.include_router(site_settings.public_router)
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models.site_settings import SiteSettings
from app.models.user import User
from app.schemas.site_settings import SiteSettingsRead, SiteSettingsUpdate

router = APIRouter(prefix="/site-settings", tags=["Site Settings"])
public_router = APIRouter(prefix="/public/site-settings", tags=["Site Settings"])


def _get_or_create(db: Session) -> SiteSettings:
    """Ek hi row honi chahiye. Na ho to bana do — pehli baar khali settings."""
    settings = db.get(SiteSettings, 1)
    if settings is None:
        settings = SiteSettings(id=1)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


# ---------------------------------------------------------------- public


@public_router.get("", response_model=SiteSettingsRead)
def get_public_settings(db: Session = Depends(get_db)):
    """Header/footer isay call karte hain — logo, phone, social links waghera."""
    return _get_or_create(db)


# ---------------------------------------------------------------- admin


@router.get("", response_model=SiteSettingsRead)
def get_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _get_or_create(db)


@router.put("", response_model=SiteSettingsRead)
def update_settings(
    body: SiteSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    settings = _get_or_create(db)

    # Sirf wo fields update karein jo bheji gayin (exclude_unset).
    # Is se ek field bhejne par baqi khali nahi hotin.
    data = body.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(settings, key, value)

    db.commit()
    db.refresh(settings)
    return settings