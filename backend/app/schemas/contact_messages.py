"""Contact Us page form schemas."""

import re
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$")
MIN_MESSAGE = 10


class ContactMessageCreate(BaseModel):
    first_name: str = Field(min_length=1, max_length=120)
    last_name: str = Field(default="", max_length=120)

    email: str = Field(max_length=255)
    phone: str = Field(default="", max_length=40)

    company_name: str = Field(default="", max_length=255)
    company_url: str = Field(default="", max_length=500)

    message: str = Field(min_length=MIN_MESSAGE)
    consent: bool = False

    source_page: str = Field(default="", max_length=500)

    # --- spam traps (visitor ko nazar nahi aate) ---
    website: str = Field(default="")
    elapsed_ms: int = Field(default=0)
    turnstile_token: str = Field(default="")

    @field_validator("first_name", "last_name", "company_name")
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

    @field_validator("message")
    @classmethod
    def _clean_message(cls, v: str) -> str:
        v = (v or "").strip()
        if len(v) < MIN_MESSAGE:
            raise ValueError(f"Message must be at least {MIN_MESSAGE} characters")
        return v

    @field_validator("company_url")
    @classmethod
    def _normalise_url(cls, v: str) -> str:
        v = (v or "").strip()
        # Log aksar "example.com" likhte hain — link click karne layak bana dein
        if v and not v.lower().startswith(("http://", "https://")):
            v = f"https://{v}"
        return v


class ContactMessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: Optional[str] = ""
    email: str
    phone: Optional[str] = ""
    company_name: Optional[str] = ""
    company_url: Optional[str] = ""
    message: str
    consent: bool
    source_page: Optional[str] = ""
    is_read: bool
    created_at: datetime


class ContactMessageListResponse(BaseModel):
    items: List[ContactMessageRead]
    total: int
    unread: int
    page: int
    per_page: int