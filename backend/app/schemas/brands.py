from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


def normalize_url(value: Optional[str]) -> Optional[str]:
    """'example.com' -> 'https://example.com' (warna link relative ban jata hai)."""
    if not value:
        return None
    v = value.strip()
    if not v:
        return None
    if not v.startswith(("http://", "https://")):
        v = f"https://{v}"
    return v


class BrandBase(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=200)
    website: Optional[str] = Field(None, max_length=500)
    logo: Optional[str] = None
    logo_alt: Optional[str] = Field(None, max_length=255)
    sort_order: int = 0
    is_active: bool = True

    @field_validator("website")
    @classmethod
    def clean_website(cls, v):
        return normalize_url(v)


class BrandCreate(BrandBase):
    pass


class BrandUpdate(BaseModel):
    company_name: Optional[str] = Field(None, min_length=1, max_length=200)
    website: Optional[str] = Field(None, max_length=500)
    logo: Optional[str] = None
    logo_alt: Optional[str] = Field(None, max_length=255)
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None

    @field_validator("website")
    @classmethod
    def clean_website(cls, v):
        return normalize_url(v)


class BrandResponse(BaseModel):
    id: int
    company_name: str
    website: Optional[str] = None
    logo: Optional[str] = None
    logo_alt: Optional[str] = None
    sort_order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BrandListResponse(BaseModel):
    items: List[BrandResponse]
    total: int
    page: int
    size: int