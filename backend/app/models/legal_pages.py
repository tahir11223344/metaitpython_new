from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func

from app.database import Base


class LegalPage(Base):
    """
    Privacy Policy / Terms / Disclaimer — teenon ke fields same hain, isliye
    ek hi table hai aur `page_type` se farq hota hai.

    Har type ka sirf EK record hota hai (page_type unique). Isliye create/delete
    nahi — sirf "upsert" (PUT) hai: record na ho to ban jata hai, ho to update.

    Naya legal page (jaise Cookie Policy) add karna ho to sirf
    schemas/legal_pages.py ki LEGAL_PAGE_TYPES list mein entry add karein.
    """

    __tablename__ = "legal_pages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # "privacy-policy" | "terms" | "disclaimer"
    page_type = Column(String(50), nullable=False, unique=True, index=True)

    heading = Column(String(255), nullable=True)
    subtitle = Column(String(500), nullable=True)
    content = Column(Text, nullable=True)  # rich text HTML

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )