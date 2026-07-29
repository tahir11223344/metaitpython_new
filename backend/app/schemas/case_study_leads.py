"""Case study lead schemas."""

import re
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, ConfigDict, Field, field_validator

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$")


class CaseStudyLeadCreate(BaseModel):
    case_study_id: Optional[int] = None

    name: str = Field(min_length=1, max_length=255)
    email: str = Field(max_length=255)
    phone: str = Field(default="", max_length=40)
    location: str = Field(default="", max_length=255)

    source_page: str = Field(default="", max_length=500)

    # --- spam traps ---
    website: str = Field(default="")
    elapsed_ms: int = Field(default=0)

    @field_validator("name", "location")
    @classmethod
    def _clean(cls, v: str) -> str:
        return (v or "").strip()

    @field_validator("email")
    @classmethod
    def _valid_email(cls, v: str) -> str:
        v = (v or "").strip().lower()
        if not EMAIL_RE.match(v):
            raise ValueError("Please enter a valid email address")
        return v


class CaseStudyLeadCreated(BaseModel):
    """Submit ke jawab me — download ka URL bhi wapas jata hai."""

    ok: bool = True
    id: Optional[int] = None
    document_url: str = ""
    document_name: str = ""


class CaseStudyLeadRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    case_study_id: Optional[int] = None
    case_study_title: Optional[str] = ""
    name: str
    email: str
    phone: Optional[str] = ""
    location: Optional[str] = ""
    source_page: Optional[str] = ""
    is_read: bool
    created_at: datetime


class CaseStudyLeadListResponse(BaseModel):
    items: List[CaseStudyLeadRead]
    total: int
    unread: int
    page: int
    per_page: int