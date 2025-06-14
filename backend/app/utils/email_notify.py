# backend/app/utils/email_notify.py

import smtplib
from email.message import EmailMessage
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")
HR_EMAIL = os.getenv("HR_EMAIL")

def send_hr_notification(candidate_name: str, score: float, filename: str, email: str = "", phone_number: str = ""):
    if not HR_EMAIL or not EMAIL_USER or not EMAIL_PASS:
        print("❌ Email configuration is incomplete.")
        return

    subject = f"✅ High-Scoring Resume: {candidate_name} ({score}%)"
    body = (
        f"A resume has been scored with a high relevance score.\n\n"
        f"🧑 Candidate: {candidate_name}\n"
        f"📄 Resume File: {filename}\n"
        f"📊 Relevance Score: {score}%\n"
        f"📧 Email: {email or 'N/A'}\n"
        f"📱 Phone: {phone_number or 'N/A'}\n\n"
        f"Please log in to the dashboard for further evaluation."
    )

    try:
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = EMAIL_USER
        msg["To"] = HR_EMAIL
        msg.set_content(body)

        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASS)
            server.send_message(msg)
            print(f"📧 Email sent to HR: {HR_EMAIL} for {candidate_name}")

    except Exception as e:
        print(f"❌ Failed to send email: {e}")
