from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.database import engine, Base

# --- Routers ---
# In imports ke through respective models bhi register ho jate hain
# (har route file apna model import karti hai). Isliye create_all inke NEECHE hai.
from app.routes import auth, dashboard
from app.routes.faqs import router as faq_router
from app.routes.testimonial import router as testimonial_router
from app.routes.kpi_sections import router as kpi_router
from app.routes.categories import router as category_router
from app.routes.portfolios import router as portfolio_router
from app.routes.media import router as media_router
from app.routes import seo_meta
from app.routes.teams import router as team_router
from app.routes.industries import router as industry_router
from app.routes.blogs import router as blog_router
from app.routes.case_studies import router as case_study_router
from app.routes.legal_pages import router as legal_page_router
from app.routes.brands import router as brand_router
from app.routes import services
from app.routes import sub_services  # Service.sub_services relationship isi par depend karti hai
# from app.routes import chatbot
from app.routes import contacts
from app.routes import contact_messages
from app.routes import case_study_leads
from app.routes import site_settings

try:
    Base.metadata.create_all(bind=engine)
    print("Database tables verified/created successfully.")
except Exception as e:
    print(f"Error creating tables on startup: {e}")


app = FastAPI(
    title="Meta IT Services API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Uploaded images serve karne ke liye
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# --- Routers registration ---
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(faq_router)
app.include_router(testimonial_router)
app.include_router(kpi_router)
app.include_router(category_router)
app.include_router(portfolio_router)
app.include_router(media_router)
app.include_router(seo_meta.router)
app.include_router(team_router)
app.include_router(industry_router)
app.include_router(blog_router)
app.include_router(case_study_router)
app.include_router(legal_page_router)
app.include_router(brand_router)

app.include_router(services.router)               # /services
app.include_router(services.public_router)        # /public/services
app.include_router(sub_services.router)           # /sub-services
app.include_router(sub_services.public_router)    # /public/sub-services
# app.include_router(chatbot.router)              
app.include_router(contacts.router)               # /contacts (services form)
app.include_router(contact_messages.router)       # /contact-messages (contact page)
app.include_router(case_study_leads.router)       # /case-study-leads
app.include_router(site_settings.router)          # /site-settings
app.include_router(site_settings.public_router)   # /public/site-settings


@app.get("/")
def root():
    return {"status": "ok", "message": "Meta IT Services API is running"}