from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON
from sqlalchemy.sql import func

from app.database import Base


class Industry(Base):
    """
    Industry page (main info + poora detail page content).

    DESIGN DECISION — sub_details JSON kyun?
    ----------------------------------------
    Hero slider, accordion items, tabs, services items waghera sirf CONTENT hain —
    inpe koi query/filter/join nahi karna. Har ek ke liye alag table banate to
    5-6 extra tables + FK + ordering ka jhanjhat hota, aur ek save mein multiple
    tables sync karni padtin. Isliye poora nested structure ek JSON column mein hai.
    Agar kabhi "saare industries ke slides ek saath dhundo" jaisi zaroorat pade,
    tab alag table mein todna behtar hoga.

    IMAGES — form multipart nahi, JSON hai:
    Frontend har image ko select hote hi /media/image pe upload karta hai aur
    sirf URL string (e.g. "/uploads/editor/abc.jpg") is JSON mein rakhta hai.
    Isse nested repeatable items ke andar file upload ka masla khatam ho jata hai.
    """

    __tablename__ = "industries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # --- Main info ---
    name = Column(String(200), nullable=False)
    slug = Column(String(200), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    image = Column(String(500), nullable=True)
    image_alt = Column(String(255), nullable=True)

    # Screenshot mein nahi tha, par baaki modules (portfolio/team/category) jaisa
    # consistent rakhne ke liye. Na chahiye to ye column aur form ka field hata dein.
    is_active = Column(Boolean, nullable=False, default=True)

    # --- Detail page ka poora content (hero, slider, accordion, tabs, services, experience) ---
    sub_details = Column(JSON, nullable=False, default=dict)

    # --- SEO ---
    meta_title = Column(String(255), nullable=True)
    meta_keyword = Column(Text, nullable=True)
    meta_description = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )