from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, computed_field, field_validator


# (A) Base — common fields + validation, taake dobara na likhna pade
class KPISectionBase(BaseModel):
    tag: str = Field(..., min_length=1, max_length=150)
    title: str = Field(..., min_length=1, max_length=255)
    subtitle: str = Field(..., min_length=1)
    points: List[str] = Field(default_factory=list)

    @field_validator("points")
    @classmethod
    def clean_points(cls, v):
        # khaali points hata do, aur kam se kam 1 zaroori
        cleaned = [p.strip() for p in (v or []) if p and p.strip()]
        if not cleaned:
            raise ValueError("At least one point is required")
        return cleaned


# (B) Create — jab naya KPI banega to input ye hoga (Base jaisa hi)
class KPISectionCreate(KPISectionBase):
    pass


# (C) Update — sab fields optional, taake sirf jo bhejo wahi update ho
class KPISectionUpdate(BaseModel):
    tag: Optional[str] = Field(None, min_length=1, max_length=150)
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    subtitle: Optional[str] = Field(None, min_length=1)
    points: Optional[List[str]] = None

    @field_validator("points")
    @classmethod
    def clean_points(cls, v):
        if v is None:
            return v
        cleaned = [p.strip() for p in v if p and p.strip()]
        if not cleaned:
            raise ValueError("At least one point is required")
        return cleaned


# (D) Response — jo data API bahar bhejegi (id, dates + computed count)
class KPISectionResponse(BaseModel):
    id: int
    tag: str
    title: str
    subtitle: str
    points: List[str]
    created_at: datetime
    updated_at: datetime

    @computed_field
    @property
    def points_count(self) -> int:      # points list ki length -> "Points Count"
        return len(self.points or [])

    model_config = {"from_attributes": True}   # ORM object se bana sake


# (E) List response — pagination ke saath (list page ke liye)
class KPISectionListResponse(BaseModel):
    items: List[KPISectionResponse]
    total: int
    page: int
    size: int