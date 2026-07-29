from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    RESET_TOKEN_EXPIRE_MINUTES: int = 30
    # ACCESS_TOKEN_EXPIRE_MINUTES: int = 5
    FRONTEND_ORIGINS: str = "http://localhost:3000"
    FRONTEND_URL: str = "http://localhost:3000"

    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "no-reply@metaitservices.co"

    # --- Chatbot (Groq) ---
    # Key: https://console.groq.com/keys
    GROQ_API_KEY: str = ""
    # Models: https://console.groq.com/docs/models
    #   llama-3.1-8b-instant     - sasta, free tier ke liye behtareen
    #   openai/gpt-oss-20b       - tez aur sasta
    #   llama-3.3-70b-versatile  - behtareen quality (paid tier)
    GROQ_MODEL: str = "llama-3.1-8b-instant"
    # Free tier par chhota prompt, kam history, chhote jawab
    GROQ_FREE_TIER: bool = True

    # Chatbot se aane wali leads kis email par jayein.
    # Khali chhorein to lead sirf DB me jayegi (admin panel me nazar aayegi).
    LEAD_NOTIFY_EMAIL: str = ""

    # --- Contact form ---
    CONTACT_NOTIFY_EMAIL: str = ""

    # Cloudflare Turnstile (optional). Khali chhorein to captcha skip ho jata
    # hai aur honeypot + timing + rate limit hi kaam karte hain.
    # Keys: https://dash.cloudflare.com/?to=/:account/turnstile
    TURNSTILE_SECRET_KEY: str = ""

    # Case study download leads kis email par jayein (khali = LEAD_NOTIFY_EMAIL)
    CASE_STUDY_NOTIFY_EMAIL: str = ""

    # Relative upload paths (/uploads/...) ko full URL banane ke liye. Backend
    # ka apna public URL. Local par http://localhost:8000, prod me asli domain.
    PUBLIC_BASE_URL: str = "http://localhost:8000"

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.FRONTEND_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        # NOTE: `ignore` ka matlab hai .env ka koi bhi variable jo yahan declare
        # nahi, chup chaap nazar-andaz ho jata hai — na error, na value. Is liye
        # har naya env variable is class me add karna zaroori hai.
        extra = "ignore"


settings = Settings()