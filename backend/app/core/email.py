import smtplib
from email.mime.text import MIMEText

from app.core.config import settings


def send_reset_password_email(to_email: str, reset_token: str) -> None:
    """
    Reset link banata hai aur email bhejta hai.

    Agar .env mein SMTP_HOST set nahi hai, link sirf console mein print
    hoga — taake dev mein bina real email service ke test kar sako.
    Production mein SMTP_HOST/USER/PASSWORD set karo (Gmail, SendGrid,
    Resend, Mailgun — jo bhi use karo).
    """
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"

    if not settings.SMTP_HOST:
        print("=" * 60)
        print(f"[DEV MODE] Password reset link for {to_email}:")
        print(reset_link)
        print("=" * 60)
        return

    body = f"""
    Hi,

    We received a request to reset your Meta IT Services account password.
    Click the link below to set a new password (valid for {settings.RESET_TOKEN_EXPIRE_MINUTES} minutes):

    {reset_link}

    If you didn't request this, you can safely ignore this email.

    — Meta IT Services
    """

    msg = MIMEText(body)
    msg["Subject"] = "Reset your Meta IT Services password"
    msg["From"] = settings.SMTP_FROM_EMAIL
    msg["To"] = to_email

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_FROM_EMAIL, [to_email], msg.as_string())
