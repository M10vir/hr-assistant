# backend/app/utils/email_notify.py

import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

# Load environment variables once
load_dotenv()

EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")
HR_EMAIL   = os.getenv("HR_EMAIL")
FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "http://localhost:5173")


def _send_email(subject: str, body: str, to_email: str, context: str = "Notification"):
    if not all([EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, to_email]):
        print(f"❌ {context}: incomplete SMTP config or missing recipient.")
        return False

    try:
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = EMAIL_USER
        msg["To"] = to_email
        msg.set_content(body)

        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASS)
            server.send_message(msg)

        print(f"📧 {context} email sent to {to_email}")
        return True
    except Exception as e:
        print(f"❌ Failed to send {context.lower()} email to {to_email}: {e}")
        return False


# ------------------------------------------------------------------
# Existing APIs (kept for compatibility)
# ------------------------------------------------------------------

def send_hr_notification(candidate_name: str, score: float, filename: str, email: str = "", phone_number: str = ""):
    """
    Legacy: simple HR resume score notice (relevance only).
    """
    if not HR_EMAIL:
        print("❌ Resume email configuration is incomplete.")
        return False

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
    return _send_email(subject, body, HR_EMAIL, context="Resume")


def send_hr_interview_notification(candidate_name: str, job_title: str, score: float, email: str = "", phone_number: str = ""):
    """
    Legacy: HR interview result notice (grand score only).
    """
    if not HR_EMAIL:
        print("❌ Interview email configuration is incomplete.")
        return False

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
    return _send_email(subject, body, HR_EMAIL, context="Interview")


# ------------------------------------------------------------------
# New APIs for ≥90% resume matches
# ------------------------------------------------------------------

def send_hr_high_match_alert(*,
                             candidate_name: str,
                             filename: str,
                             relevance_score: int,
                             ats_score: int,
                             readability_score: int,
                             job_title: str,
                             email: str = "",
                             phone_number: str = "",
                             feedback_short: str = "") -> bool:
    """
    Notify HR when a resume meets/exceeds the relevance threshold.
    Includes all scores and concise feedback (optional).
    """
    if not HR_EMAIL:
        print("❌ HR alert: HR_EMAIL not configured.")
        return False

    subject = f"[HR Alert] High-Match Resume ({relevance_score}%) - {filename}"
    feedback_line = (f"\n📝 Feedback: {feedback_short}" if feedback_short else "")
    body = (
        f"High-match resume detected.\n\n"
        f"🧑 Candidate: {candidate_name or '—'}\n"
        f"📧 Email: {email or '—'}\n"
        f"📱 Phone: {phone_number or '—'}\n"
        f"📄 File: {filename}\n"
        f"💼 JD: {job_title}\n\n"
        f"Scores:\n"
        f"• Relevance: {relevance_score}%\n"
        f"• ATS: {ats_score}\n"
        f"• Readability: {readability_score}\n"
        f"{feedback_line}\n"
        f"Please review in the dashboard."
    )
    return _send_email(subject, body, HR_EMAIL, context="HR High-Match Alert")


def send_candidate_invite(*,
                          candidate_email: str,
                          job_title: str,
                          assessment_url: str) -> bool:
    """
    Send an online assessment invitation to the candidate.
    """
    if not candidate_email:
        print("❌ Candidate invite: missing candidate email.")
        return False

    subject = "Interview Assessment Invitation"
    body = (
        f"Dear Candidate,\n\n"
        f"Thank you for your application. We'd like to invite you to complete the online assessment "
        f"for '{job_title}'.\n\n"
        f"Start here: {assessment_url}\n\n"
        f"Best regards,\nHR Team"
    )
    return _send_email(subject, body, candidate_email, context="Candidate Invite") 
