import re
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


ALLOWED_STATUS = ["active", "inactive"]


def slugify(value: str) -> str:
    """'AI System' -> 'ai-system'"""
    value = (value or "").strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    slug: str = Field(..., min_length=1, max_length=150)
    status: str = Field(default="active")
    show_on_header: bool = False

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        v = (v or "").strip().lower()
        if v not in ALLOWED_STATUS:
            raise ValueError(f"Status must be one of: {', '.join(ALLOWED_STATUS)}")
        return v

    @field_validator("slug")
    @classmethod
    def normalize_slug(cls, v: str) -> str:
        s = slugify(v)
        if not s:
            raise ValueError("Invalid slug")
        return s


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    slug: Optional[str] = Field(None, min_length=1, max_length=150)
    status: Optional[str] = None
    show_on_header: Optional[bool] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        if v is None:
            return v
        v = v.strip().lower()
        if v not in ALLOWED_STATUS:
            raise ValueError(f"Status must be one of: {', '.join(ALLOWED_STATUS)}")
        return v

    @field_validator("slug")
    @classmethod
    def normalize_slug(cls, v):
        if v is None:
            return v
        s = slugify(v)
        if not s:
            raise ValueError("Invalid slug")
        return s


class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    status: str
    show_on_header: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CategoryListResponse(BaseModel):
    items: List[CategoryResponse]
    total: int
    page: int
    size: int