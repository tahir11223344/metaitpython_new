from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, computed_field


# Create/Update ka INPUT multipart/form-data hota hai (files ke saath), isliye woh
# route mein Form(...) / File(...) se aata hai — yahan sirf RESPONSE schemas hain.


class CategoryBrief(BaseModel):
    id: int
    name: str
    slug: str

    model_config = {"from_attributes": True}


class PortfolioResponse(BaseModel):
    id: int
    category_id: Optional[int] = None
    category: Optional[CategoryBrief] = None
    title: str
    slug: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    thumbnail: Optional[str] = None
    gallery_images: List[str] = []
    image_alt: Optional[str] = None
    is_active: bool
    show_on_landing: bool
    created_at: datetime
    updated_at: datetime

    @computed_field
    @property
    def gallery_count(self) -> int:
        return len(self.gallery_images or [])

    model_config = {"from_attributes": True}


class PortfolioListResponse(BaseModel):
    items: List[PortfolioResponse]
    total: int
    page: int
    size: int