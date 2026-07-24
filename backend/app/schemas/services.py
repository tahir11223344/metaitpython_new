"""
Service schemas (Pydantic v2).

NOTE: `slugify` yahan aur sub_services/schemas dono me hai. Ye jaan boojh kar
      duplicate hai — services yahan se SubServiceBrief import karti hai, is liye
      agar sub_services yahan se slugify import kare to circular import ban jata.
"""

import re
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.sub_services import SubServiceBrief


def slugify(value: str) -> str:
    value = (value or "").strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


# ---------------------------------------------------------------- pieces


class Point(BaseModel):
    """Section ke andar ek bullet point."""

    title: str = Field(default="", max_length=255)
    sub_title: str = Field(default="")


class SectionOne(BaseModel):
    heading: str = Field(default="", max_length=255)
    image: Optional[str] = None
    image_alt: str = Field(default="", max_length=255)
    points: List[Point] = Field(default_factory=list)


class SectionTwo(SectionOne):
    description: str = Field(default="")


class Faq(BaseModel):
    question: str = Field(default="", max_length=500)
    answer: str = Field(default="")


# ---------------------------------------------------------------- service


class ServiceBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    slug: Optional[str] = Field(default=None, max_length=255)
    short_description: str = Field(default="")

    # Edit ke waqt frontend purana path wapas bhejta hai taake image preserve rahe.
    # Naya file upload hone par route ise override kar deta hai.
    thumbnail: Optional[str] = None
    thumbnail_alt: str = Field(default="", max_length=255)

    is_active: bool = True
    sort_order: int = 0

    section_one: SectionOne = Field(default_factory=SectionOne)
    section_two: SectionTwo = Field(default_factory=SectionTwo)
    faqs: List[Faq] = Field(default_factory=list)

    meta_title: str = Field(default="", max_length=255)
    meta_keyword: str = Field(default="", max_length=500)
    meta_description: str = Field(default="")

    # ---- validators ----

    @field_validator("title")
    @classmethod
    def _title_not_blank(cls, v: str) -> str:
        v = (v or "").strip()
        if not v:
            raise ValueError("Title is required")
        return v

    @field_validator("slug")
    @classmethod
    def _clean_slug(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        v = slugify(v)
        return v or None

    @field_validator("faqs")
    @classmethod
    def _drop_empty_faqs(cls, v: List[Faq]) -> List[Faq]:
        return [f for f in v if f.question.strip() or f.answer.strip()]

    def resolved_slug(self) -> str:
        """Slug khali ho to title se bana lo. Non-latin title ke liye fallback."""
        if self.slug:
            return self.slug
        generated = slugify(self.title)
        if not generated:
            # Urdu/Arabic title -> slugify khali string deta hai
            raise ValueError(
                "Slug is required - it could not be generated from the title"
            )
        return generated


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(ServiceBase):
    pass


class ServiceRead(ServiceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    created_at: datetime
    updated_at: datetime

    # Public detail endpoint bharta hai — sirf wo sub-services jo active hain
    # AUR jin par "Show on Services Page" = Yes hai.
    sub_services: List[SubServiceBrief] = Field(default_factory=list)


class ServiceListItem(BaseModel):
    """List page ke liye halka payload — nested content shamil nahi."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    slug: str
    short_description: str = ""
    thumbnail: Optional[str] = None
    thumbnail_alt: str = ""
    is_active: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime


class ServiceListResponse(BaseModel):
    items: List[ServiceListItem]
    total: int
    page: int
    per_page: int