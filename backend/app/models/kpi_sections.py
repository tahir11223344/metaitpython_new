from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.sql import func

from app.database import Base


class KPISection(Base):
    __tablename__ = "kpi_sections"          # DB mein table ka naam

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    tag = Column(String(150), nullable=False)
    title = Column(String(255), nullable=False)
    subtitle = Column(Text, nullable=False)

    points = Column(JSON, nullable=False, default=list)   # list[str] JSON ke roop mein

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(),
                        onupdate=func.now(), nullable=False)