"""SubService schemas (Pydantic v2)."""

import re
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


def slugify(value: str) -> str:
    """schemas/services.py wali copy.

    Yahan alag rakhi hai kyunke services us file se SubServiceBrief import karti
    hai — dono ek doosre se import karein to circular import ban jata hai.
    """
    value = (value or "").strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


# ---------------------------------------------------------------- pieces


class HeroSection(BaseModel):
    heading: str = Field(default="", max_length=255)
    short_description: str = Field(default="")


class CampaignSection(BaseModel):
    title: str = Field(default="", max_length=255)
    points: List[str] = Field(default_factory=list)


class ProcessStep(BaseModel):
    title: str = Field(default="", max_length=255)
    description: str = Field(default="")


class DevelopmentProcess(BaseModel):
    title: str = Field(default="", max_length=255)
    steps: List[ProcessStep] = Field(default_factory=list)


class CommitmentPoint(BaseModel):
    image: Optional[str] = None
    title: str = Field(default="", max_length=255)
    sub_title: str = Field(default="")


class CommitmentsSection(BaseModel):
    title: str = Field(default="", max_length=255)
    description: str = Field(default="")
    points: List[CommitmentPoint] = Field(default_factory=list)


class WhyChoosePoint(BaseModel):
    strong_text: str = Field(default="", max_length=255)
    description: str = Field(default="")


class WhyChooseSection(BaseModel):
    title: str = Field(default="", max_length=255)
    points: List[WhyChoosePoint] = Field(default_factory=list)


class Faq(BaseModel):
    question: str = Field(default="", max_length=500)
    answer: str = Field(default="")


# ---------------------------------------------------------------- sub-service


class SubServiceBase(BaseModel):
    service_id: int
    title: str = Field(min_length=1, max_length=255)
    slug: Optional[str] = Field(default=None, max_length=255)
    short_description: str = Field(default="")

    # Naya file upload na ho to frontend purana path wapas bhejta hai
    icon: Optional[str] = None

    is_active: bool = True
    show_on_services_page: bool = False
    show_on_landing_page: bool = False
    sort_order: int = 0

    main_points: List[str] = Field(default_factory=list)

    hero_section: HeroSection = Field(default_factory=HeroSection)
    campaign_section: CampaignSection = Field(default_factory=CampaignSection)
    development_process: DevelopmentProcess = Field(default_factory=DevelopmentProcess)
    commitments_section: CommitmentsSection = Field(default_factory=CommitmentsSection)
    why_choose_section: WhyChooseSection = Field(default_factory=WhyChooseSection)

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
        return slugify(v) or None

    @field_validator("main_points")
    @classmethod
    def _drop_blank_points(cls, v: List[str]) -> List[str]:
        return [p.strip() for p in v if p and p.strip()]

    @field_validator("faqs")
    @classmethod
    def _drop_empty_faqs(cls, v: List[Faq]) -> List[Faq]:
        return [f for f in v if f.question.strip() or f.answer.strip()]

    def resolved_slug(self) -> str:
        if self.slug:
            return self.slug
        generated = slugify(self.title)
        if not generated:
            raise ValueError("Slug is required - it could not be generated from the title")
        return generated


class SubServiceCreate(SubServiceBase):
    pass


class SubServiceUpdate(SubServiceBase):
    pass


class SubServiceRead(SubServiceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    created_at: datetime
    updated_at: datetime


class SubServiceBrief(BaseModel):
    """Service detail page ke cards ke liye — poora page content nahi."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    service_id: int
    title: str
    slug: str
    short_description: str = ""
    icon: Optional[str] = None
    main_points: List[str] = Field(default_factory=list)
    sort_order: int = 0


class SubServiceListItem(BaseModel):
    """Admin list page ke liye."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    service_id: int
    title: str
    slug: str
    icon: Optional[str] = None
    is_active: bool
    show_on_services_page: bool
    show_on_landing_page: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime

    # Route se bhara jata hai taake list me parent ka naam dikhe
    service_title: Optional[str] = None
    service_slug: Optional[str] = None


class SubServiceListResponse(BaseModel):
    items: List[SubServiceListItem]
    total: int
    page: int
    per_page: int