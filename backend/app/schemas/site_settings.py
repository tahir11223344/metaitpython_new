"""Site settings schemas."""

from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class SiteSettingsUpdate(BaseModel):
    """Sab optional — admin jo bheje wahi update hota hai (partial update)."""

    site_name: Optional[str] = Field(default=None, max_length=255)
    logo: Optional[str] = Field(default=None, max_length=500)
    favicon: Optional[str] = Field(default=None, max_length=500)

    phone: Optional[str] = Field(default=None, max_length=64)
    email: Optional[str] = Field(default=None, max_length=255)
    whatsapp: Optional[str] = Field(default=None, max_length=64)
    address: Optional[str] = Field(default=None, max_length=500)

    facebook: Optional[str] = Field(default=None, max_length=500)
    instagram: Optional[str] = Field(default=None, max_length=500)
    twitter: Optional[str] = Field(default=None, max_length=500)
    linkedin: Optional[str] = Field(default=None, max_length=500)

    @field_validator("facebook", "instagram", "twitter", "linkedin")
    @classmethod
    def _normalise_url(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        # Admin "facebook.com/..." likhe to bhi link theek rahe
        if v and not v.lower().startswith(("http://", "https://")):
            v = f"https://{v}"
        return v

    @field_validator("email")
    @classmethod
    def _clean_email(cls, v: Optional[str]) -> Optional[str]:
        return v.strip().lower() if v else v


class SiteSettingsRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    site_name: Optional[str] = ""
    logo: Optional[str] = ""
    favicon: Optional[str] = ""
    phone: Optional[str] = ""
    email: Optional[str] = ""
    whatsapp: Optional[str] = ""
    address: Optional[str] = ""
    facebook: Optional[str] = ""
    instagram: Optional[str] = ""
    twitter: Optional[str] = ""
    linkedin: Optional[str] = ""