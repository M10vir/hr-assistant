import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")
HR_EMAIL = os.getenv("HR_EMAIL")

def send_score_email(candidate_name, filename, score):
    # ✅ Validate config first
    if not all([EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, HR_EMAIL]):
        print("❌ Email config missing: Please set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, HR_EMAIL")
        return

    subject = f"🚀 High-Scoring Resume: {candidate_name}"
    body = f"""
    A new candidate has achieved a high relevance score!

    Candidate Name: {candidate_name}
    Resume File: {filename}
    Relevance Score: {score}

    Please review this candidate for further evaluation.
    """

    msg = MIMEMultipart()
    msg["From"] = EMAIL_USER
    msg["To"] = HR_EMAIL
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASS)
            server.sendmail(EMAIL_USER, HR_EMAIL, msg.as_string())
        print(f"✅ Email sent for {candidate_name}")
    except Exception as e:
        print(f"❌ Email failed for {candidate_name}: {e}")
