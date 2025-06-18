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
    if not all([HR_EMAIL, EMAIL_USER, EMAIL_PASS, EMAIL_HOST]):
        print("❌ Resume email configuration is incomplete.")
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

    _send_email(subject, body, candidate_name, context="Resume")


def send_hr_interview_notification(candidate_name: str, job_title: str, score: float, email: str = "", phone_number: str = ""):
    if not all([HR_EMAIL, EMAIL_USER, EMAIL_PASS, EMAIL_HOST]):
        print("❌ Interview email configuration is incomplete.")
        return

    subject = f"🎯 Interview Alert: {candidate_name} scored {score}% for {job_title}"
    body = (
        f"A candidate has completed the interview assessment with a high performance.\n\n"
        f"🧑 Candidate Name: {candidate_name}\n"
        f"🛠️ Job Title: {job_title}\n"
        f"📊 Grand Score: {score}%\n"
        f"📧 Email: {email or 'N/A'}\n"
        f"📱 Phone: {phone_number or 'N/A'}\n\n"
        f"Kindly review the candidate's submission in the dashboard."
    )

    _send_email(subject, body, candidate_name, context="Interview")


def _send_email(subject: str, body: str, candidate_name: str, context: str = "Notification"):
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
            print(f"📧 {context} email sent to HR: {HR_EMAIL} for {candidate_name}")
    except Exception as e:
        print(f"❌ Failed to send {context.lower()} email: {e}") 
