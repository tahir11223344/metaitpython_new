from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field



LEGAL_PAGE_TYPES: List[Dict[str, str]] = [
    {"key": "privacy-policy", "label": "Privacy Policy"},
    {"key": "terms", "label": "Terms & Conditions"},
    {"key": "disclaimer", "label": "Disclaimer"},
]

VALID_TYPE_KEYS = [t["key"] for t in LEGAL_PAGE_TYPES]


def label_for(page_type: str) -> str:
    for t in LEGAL_PAGE_TYPES:
        if t["key"] == page_type:
            return t["label"]
    return page_type


class LegalPageType(BaseModel):
    key: str
    label: str


class LegalPageUpsert(BaseModel):
    """PUT ka body — record na ho to ban jata hai, ho to update."""

    heading: Optional[str] = Field(None, max_length=255)
    subtitle: Optional[str] = Field(None, max_length=500)
    content: Optional[str] = None  # HTML


class LegalPageResponse(BaseModel):
    id: int
    page_type: str
    label: Optional[str] = None  
    heading: Optional[str] = None
    subtitle: Optional[str] = None
    content: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class LegalPageListItem(BaseModel):
   

    page_type: str
    label: str
    heading: Optional[str] = None
    exists: bool = False
    updated_at: Optional[datetime] = None


class LegalPageListResponse(BaseModel):
    items: List[LegalPageListItem]