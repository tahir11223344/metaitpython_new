from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.sql import func

from app.database import Base


class CaseStudy(Base):
    """
    Case study entry.

    - image / document sirf URL strings hain; files pehle /media/image aur
      /media/file pe upload hoti hain (Industry/Blog jaisa pattern).
    - document_name original filename rakhta hai (UI mein "report.pdf" dikhane ke liye,
      kyunki disk pe naam random hota hai).
    - description: rich text HTML (editor se).
    """

    __tablename__ = "case_studies"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    title = Column(String(255), nullable=False)
    subtitle = Column(String(500), nullable=True)

    image = Column(String(500), nullable=True)
    image_alt = Column(String(255), nullable=True)

    document = Column(String(500), nullable=True)
    document_name = Column(String(255), nullable=True)

    description = Column(Text, nullable=True)  

    
    is_active = Column(Boolean, nullable=False, default=True)

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )