"""Contact form schemas."""

import re
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$")
MIN_MESSAGE = 10


class ContactCreate(BaseModel):
    first_name: str = Field(min_length=1, max_length=120)
    last_name: str = Field(default="", max_length=120)

    email: str = Field(max_length=255)
    phone_code: str = Field(default="", max_length=8)
    phone: str = Field(default="", max_length=40)

    has_website: Optional[bool] = None
    subjects: List[str] = Field(default_factory=list)
    message: str = Field(min_length=MIN_MESSAGE)

    source_page: str = Field(default="", max_length=500)

    # --- spam traps (visitor ko nazar nahi aate) ---
    # Honeypot: asli banda ise kabhi nahi bharta, bot har field bhar deta hai
    website: str = Field(default="")
    # Form khulne se submit tak kitne milliseconds lage
    elapsed_ms: int = Field(default=0)
    # Cloudflare Turnstile ka token (agar enable ho)
    turnstile_token: str = Field(default="")

    @field_validator("first_name", "last_name")
    @classmethod
    def _clean_name(cls, v: str) -> str:
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

    @field_validator("subjects")
    @classmethod
    def _clean_subjects(cls, v: List[str]) -> List[str]:
        return [s.strip() for s in (v or []) if s and s.strip()][:20]


class ContactRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: Optional[str] = ""
    email: str
    phone_code: Optional[str] = ""
    phone: Optional[str] = ""
    has_website: Optional[bool] = None
    subjects: List[str] = Field(default_factory=list)
    message: str
    source_page: Optional[str] = ""
    is_read: bool
    created_at: datetime


class ContactListResponse(BaseModel):
    items: List[ContactRead]
    total: int
    unread: int
    page: int
    per_page: int