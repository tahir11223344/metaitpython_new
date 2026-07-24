from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel




class TeamResponse(BaseModel):
    id: int
    name: str
    designation: str
    sort_order: int
    is_active: bool
    email: Optional[str] = None
    phone: Optional[str] = None
    profile_image: Optional[str] = None
    image_alt: Optional[str] = None
    facebook_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    instagram_url: Optional[str] = None
    twitter_url: Optional[str] = None
    bio: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TeamListResponse(BaseModel):
    items: List[TeamResponse]
    total: int
    page: int
    size: int