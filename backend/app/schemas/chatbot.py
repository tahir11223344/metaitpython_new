"""Chatbot schemas."""

import re
from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

MAX_MESSAGE_CHARS = 2000
MAX_HISTORY = 20

# Halka sa email check. `EmailStr` jaan boojh kar use nahi kiya kyunke wo
# `email-validator` package mangta hai — ek aur dependency ki zaroorat nahi.
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$")


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=MAX_MESSAGE_CHARS)

    @field_validator("content")
    @classmethod
    def _not_blank(cls, v: str) -> str:
        v = (v or "").strip()
        if not v:
            raise ValueError("Message cannot be empty")
        return v


class ChatRequest(BaseModel):
    """Frontend poori conversation bhejta hai — server stateless rehta hai."""

    messages: List[ChatMessage] = Field(min_length=1)
    source_page: str = Field(default="", max_length=500)

    @field_validator("messages")
    @classmethod
    def _limit_history(cls, v: List[ChatMessage]) -> List[ChatMessage]:
        if v[-1].role != "user":
            raise ValueError("Last message must be from the user")
        # Sirf aakhri MAX_HISTORY messages — token cost aur latency control me
        return v[-MAX_HISTORY:]


# ---------------------------------------------------------------- leads


class LeadCapture(BaseModel):
    """Model ka tool call isi shape me aata hai."""

    name: str = Field(max_length=255)
    email: str = Field(max_length=255)
    phone: str = Field(default="", max_length=64)
    interest: str = Field(default="", max_length=255)
    summary: str = Field(default="")

    @field_validator("name")
    @classmethod
    def _clean_name(cls, v: str) -> str:
        v = (v or "").strip()
        if not v:
            raise ValueError("Name is required")
        return v

    @field_validator("email")
    @classmethod
    def _valid_email(cls, v: str) -> str:
        v = (v or "").strip().lower()
        if not EMAIL_RE.match(v):
            raise ValueError("A valid email is required")
        return v


class LeadRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    phone: Optional[str] = ""
    interest: Optional[str] = ""
    summary: Optional[str] = ""
    source_page: Optional[str] = ""
    is_read: bool
    created_at: datetime


class LeadListResponse(BaseModel):
    items: List[LeadRead]
    total: int
    unread: int
    page: int
    per_page: int