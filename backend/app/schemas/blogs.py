import re
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# "Type" dropdown ke options — sirf yahan add/remove karein.
# Ye list GET /blogs/types se frontend ko milti hai, aur validation bhi isi se hai.
# ---------------------------------------------------------------------------
BLOG_TYPES: List[str] = [
    "Marketing",
]


def slugify(value: str) -> str:
    value = (value or "").strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


class CategoryBrief(BaseModel):
    id: int
    name: str
    slug: str

    model_config = {"from_attributes": True}


class BlogBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=255)
    category_id: Optional[int] = None
    is_active: bool = True
    type: Optional[str] = Field(None, max_length=100)
    read_time: Optional[str] = Field(None, max_length=50)
    image: Optional[str] = None
    image_alt: Optional[str] = Field(None, max_length=255)
    short_description: Optional[str] = None
    description: Optional[str] = None  # HTML

    meta_title: Optional[str] = Field(None, max_length=255)
    meta_keyword: Optional[str] = None
    meta_description: Optional[str] = None

    @field_validator("slug")
    @classmethod
    def normalize_slug(cls, v: str) -> str:
        s = slugify(v)
        if not s:
            raise ValueError("Invalid slug")
        return s

    @field_validator("type")
    @classmethod
    def validate_type(cls, v):
        if v in (None, ""):
            return None
        if v not in BLOG_TYPES:
            raise ValueError(f"Type must be one of: {', '.join(BLOG_TYPES)}")
        return v


class BlogCreate(BlogBase):
    pass


class BlogUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    slug: Optional[str] = Field(None, min_length=1, max_length=255)
    category_id: Optional[int] = None
    is_active: Optional[bool] = None
    type: Optional[str] = Field(None, max_length=100)
    read_time: Optional[str] = Field(None, max_length=50)
    image: Optional[str] = None
    image_alt: Optional[str] = Field(None, max_length=255)
    short_description: Optional[str] = None
    description: Optional[str] = None

    meta_title: Optional[str] = Field(None, max_length=255)
    meta_keyword: Optional[str] = None
    meta_description: Optional[str] = None

    @field_validator("slug")
    @classmethod
    def normalize_slug(cls, v):
        if v is None:
            return v
        s = slugify(v)
        if not s:
            raise ValueError("Invalid slug")
        return s

    @field_validator("type")
    @classmethod
    def validate_type(cls, v):
        if v in (None, ""):
            return None
        if v not in BLOG_TYPES:
            raise ValueError(f"Type must be one of: {', '.join(BLOG_TYPES)}")
        return v


class BlogResponse(BaseModel):
    id: int
    title: str
    slug: str
    category_id: Optional[int] = None
    category: Optional[CategoryBrief] = None
    is_active: bool
    type: Optional[str] = None
    read_time: Optional[str] = None
    image: Optional[str] = None
    image_alt: Optional[str] = None
    short_description: Optional[str] = None
    description: Optional[str] = None
    meta_title: Optional[str] = None
    meta_keyword: Optional[str] = None
    meta_description: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BlogListItem(BaseModel):
    """List page ke liye — bhaari `description` (HTML) ke bina."""

    id: int
    title: str
    slug: str
    category: Optional[CategoryBrief] = None
    is_active: bool
    type: Optional[str] = None
    read_time: Optional[str] = None
    image: Optional[str] = None
    image_alt: Optional[str] = None
    short_description: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BlogListResponse(BaseModel):
    items: List[BlogListItem]
    total: int
    page: int
    size: int