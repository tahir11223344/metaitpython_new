
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# Single source of truth for the "Pages" dropdown.
# Add / remove pages here. This same list is served by GET /faqs/pages
# (so the frontend dropdown stays in sync) and is used to validate input.
# Edit these to match your real site pages.
# ---------------------------------------------------------------------------
FAQ_PAGES: List[str] = [
    "Home Page",
    "Services Main Page",
    "Industry Main Page",
    "About Page",
    "Contact Page",
]


class FAQBase(BaseModel):
    page: str = Field(..., max_length=150)
    question: str = Field(..., min_length=1, max_length=500)
    answer: str = Field(..., min_length=1)

    @field_validator("page")
    @classmethod
    def validate_page(cls, v: str) -> str:
        if v not in FAQ_PAGES:
            raise ValueError(f"Invalid page. Allowed: {', '.join(FAQ_PAGES)}")
        return v


class FAQCreate(FAQBase):
    pass


class FAQUpdate(BaseModel):
    page: Optional[str] = Field(None, max_length=150)
    question: Optional[str] = Field(None, min_length=1, max_length=500)
    answer: Optional[str] = Field(None, min_length=1)

    @field_validator("page")
    @classmethod
    def validate_page(cls, v):
        if v is not None and v not in FAQ_PAGES:
            raise ValueError(f"Invalid page. Allowed: {', '.join(FAQ_PAGES)}")
        return v


class UserBrief(BaseModel):
    """
    Minimal user info shown in the 'Created By' / 'Updated By' columns.

    Adjust the fields below to match YOUR User model:
      - if your users table has `name` instead of `full_name`, rename it here
      - if your User.id is an Integer, change `id: UUID` -> `id: int`
    """

    id: UUID
    full_name: Optional[str] = None
    email: Optional[str] = None

    model_config = {"from_attributes": True}


class FAQResponse(BaseModel):
    id: UUID
    page: str
    question: str
    answer: str
    created_at: datetime
    updated_at: datetime
    created_by: Optional[UserBrief] = None
    updated_by: Optional[UserBrief] = None

    model_config = {"from_attributes": True}


class FAQListResponse(BaseModel):
    items: List[FAQResponse]
    total: int
    page: int
    size: int