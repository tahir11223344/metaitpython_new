from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class SeoMetaBase(BaseModel):
    page_name: str = Field(..., max_length=150)
    meta_title: str = Field(..., max_length=255)
    meta_keyword: Optional[str] = None
    meta_description: Optional[str] = None
    is_active: bool = True


class SeoMetaCreate(SeoMetaBase):
    pass


class SeoMetaUpdate(BaseModel):
    page_name: Optional[str] = None
    meta_title: Optional[str] = None
    meta_keyword: Optional[str] = None
    meta_description: Optional[str] = None
    is_active: Optional[bool] = None


class SeoMetaOut(SeoMetaBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SeoMetaListOut(BaseModel):
    total: int
    items: list[SeoMetaOut]