from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class TestimonialBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    is_active: bool = True
    highlight_percentage: Optional[str] = Field(None, max_length=50)
    highlight_title: Optional[str] = Field(None, max_length=255)
    short_description: str = Field(..., min_length=1)


class TestimonialCreate(TestimonialBase):
    pass


class TestimonialUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    is_active: Optional[bool] = None
    highlight_percentage: Optional[str] = Field(None, max_length=50)
    highlight_title: Optional[str] = Field(None, max_length=255)
    short_description: Optional[str] = Field(None, min_length=1)


class UserBrief(BaseModel):
    # UUID ko badal kar int kar diya gaya hai taake database id se match ho sake
    id: int  
    full_name: Optional[str] = None
    email: Optional[str] = None

    model_config = {"from_attributes": True}


class TestimonialResponse(BaseModel):
    id: UUID
    rating: int
    is_active: bool
    highlight_percentage: Optional[str] = None
    highlight_title: Optional[str] = None
    short_description: str
    created_at: datetime
    updated_at: datetime
    created_by: Optional[UserBrief] = None
    updated_by: Optional[UserBrief] = None

    model_config = {"from_attributes": True}


class TestimonialListResponse(BaseModel):
    items: List[TestimonialResponse]
    total: int
    page: int
    size: int