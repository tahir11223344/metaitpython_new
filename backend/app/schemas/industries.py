import re
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


def slugify(value: str) -> str:
    value = (value or "").strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


# ---------------------------------------------------------------------------
# sub_details ke nested pieces
# Har image field sirf ek URL STRING hai (file /media/image se pehle hi upload ho
# chuki hoti hai). Isliye ye poora payload plain JSON hai — multipart nahi.
# ---------------------------------------------------------------------------


class HeroSlide(BaseModel):
    title: Optional[str] = None
    excerpt: Optional[str] = None
    description: Optional[str] = None  # rich text HTML
    image: Optional[str] = None
    image_alt: Optional[str] = None
    sort_order: int = 0
    gallery_images: List[str] = Field(default_factory=list)


class HeroSection(BaseModel):
    kicker: Optional[str] = None
    title: Optional[str] = None
    side_title: Optional[str] = None
    side_description: Optional[str] = None
    bottom_text: Optional[str] = None
    slides: List[HeroSlide] = Field(default_factory=list)


class SortableItem(BaseModel):
    """Accordion item / Tab / Service item — teenon ka shape same hai."""

    title: Optional[str] = None
    content: Optional[str] = None
    sort_order: int = 0


class AccordionSection(BaseModel):
    section_title: Optional[str] = None
    section_description: Optional[str] = None
    image: Optional[str] = None
    items: List[SortableItem] = Field(default_factory=list)


class TabsSection(BaseModel):
    section_title: Optional[str] = None
    items: List[SortableItem] = Field(default_factory=list)


class ServicesSection(BaseModel):
    title: Optional[str] = None
    highlight_text: Optional[str] = None
    description: Optional[str] = None
    items: List[SortableItem] = Field(default_factory=list)


class ExperienceSection(BaseModel):
    title: Optional[str] = None
    cta_label: Optional[str] = None
    cta_url: Optional[str] = None
    # Screenshot mein 4 fixed slots the; list rakhi hai taake aage kam/zyada ho sakein
    images: List[str] = Field(default_factory=list)


class SubDetails(BaseModel):
    hero: HeroSection = Field(default_factory=HeroSection)
    accordion: AccordionSection = Field(default_factory=AccordionSection)
    tabs: TabsSection = Field(default_factory=TabsSection)
    services: ServicesSection = Field(default_factory=ServicesSection)
    experience: ExperienceSection = Field(default_factory=ExperienceSection)


# ---------------------------------------------------------------------------
# Industry
# ---------------------------------------------------------------------------


class IndustryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    slug: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    image: Optional[str] = None
    image_alt: Optional[str] = None
    is_active: bool = True

    sub_details: SubDetails = Field(default_factory=SubDetails)

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


class IndustryCreate(IndustryBase):
    pass


class IndustryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    slug: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    image: Optional[str] = None
    image_alt: Optional[str] = None
    is_active: Optional[bool] = None
    sub_details: Optional[SubDetails] = None
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


class IndustryResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    image: Optional[str] = None
    image_alt: Optional[str] = None
    is_active: bool
    sub_details: SubDetails = Field(default_factory=SubDetails)
    meta_title: Optional[str] = None
    meta_keyword: Optional[str] = None
    meta_description: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class IndustryListItem(BaseModel):
    """
    List page ke liye halka response — bhaari sub_details ke bina.
    (description shaamil hai kyunki public list page usko card text mein dikhata hai.)
    """

    id: int
    name: str
    slug: str
    description: Optional[str] = None
    image: Optional[str] = None
    image_alt: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class IndustryListResponse(BaseModel):
    items: List[IndustryListItem]
    total: int
    page: int
    size: int