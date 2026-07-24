from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base


class SeoMeta(Base):
    __tablename__ = "seo_metas"

    id = Column(Integer, primary_key=True, index=True)
    page_name = Column(String(150), unique=True, nullable=False, index=True)
    meta_title = Column(String(255), nullable=False)
    meta_keyword = Column(String(500), nullable=True)
    meta_description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())