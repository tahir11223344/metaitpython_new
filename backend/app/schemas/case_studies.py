from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class CaseStudyBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    subtitle: Optional[str] = Field(None, max_length=500)
    image: Optional[str] = None
    image_alt: Optional[str] = Field(None, max_length=255)
    document: Optional[str] = None
    document_name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None  # HTML
    is_active: bool = True


class CaseStudyCreate(CaseStudyBase):
    pass


class CaseStudyUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    subtitle: Optional[str] = Field(None, max_length=500)
    image: Optional[str] = None
    image_alt: Optional[str] = Field(None, max_length=255)
    document: Optional[str] = None
    document_name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    is_active: Optional[bool] = None


class CaseStudyResponse(BaseModel):
    id: int
    title: str
    subtitle: Optional[str] = None
    image: Optional[str] = None
    image_alt: Optional[str] = None
    document: Optional[str] = None
    document_name: Optional[str] = None
    description: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CaseStudyListItem(BaseModel):
 

    id: int
    title: str
    subtitle: Optional[str] = None
    image: Optional[str] = None
    image_alt: Optional[str] = None
    document: Optional[str] = None
    document_name: Optional[str] = None
    description: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CaseStudyListResponse(BaseModel):
    items: List[CaseStudyListItem]
    total: int
    page: int
    size: int