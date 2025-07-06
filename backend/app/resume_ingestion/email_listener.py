# backend/app/resume_ingestion/email_listener.py

import imaplib
import email
from email.header import decode_header
import os
import logging
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.db_models import ResumeScore
from app.db.database import Base
from app.utils.extract_text import extract_text_from_file
from app.utils.extract_name import extract_candidate_details
from app.utils.score_resume import (
    compute_relevance_score,
    compute_ats_score,
    compute_readability_score,
)

# Load environment
load_dotenv()

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")
IMAP_SERVER = os.getenv("IMAP_SERVER", "imap.gmail.com")
ALLOWED_SENDER = "tanvir.anna00@gmail.com"

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

# Setup logging
LOG_DIR = "logs"
os.makedirs(LOG_DIR, exist_ok=True)
logging.basicConfig(
    filename=os.path.join(LOG_DIR, "resume_ingestion.log"),
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

def clean_subject(subject):
    decoded = decode_header(subject)[0]
    if isinstance(decoded[0], bytes):
        return decoded[0].decode(decoded[1] or "utf-8")
    return decoded[0]

def process_resume(part, filename):
    contents = part.get_payload(decode=True)
    logging.info(f"[>] Processing: {filename}")
    
    try:
        resume_text = extract_text_from_file(filename, contents)
        logging.debug(f"Extracted resume text preview: {resume_text[:200]}")
    except Exception as e:
        logging.error(f"Failed to extract text from {filename}: {e}")
        return

    if not resume_text or len(resume_text.strip()) < 50:
        logging.warning(f"Skipped processing for {filename}: resume text too short or empty.")
        return

    # Extract details
    candidate_name, email_, phone_number = extract_candidate_details(resume_text)
    relevance_score = compute_relevance_score(resume_text, "AI/Cloud Engineer")
    ats_score = compute_ats_score(resume_text)
    readability_score = compute_readability_score(resume_text)

    db = SessionLocal()
    try:
        new_entry = ResumeScore(
            candidate_name=candidate_name,
            filename=filename,
            relevance_score=relevance_score,
            ats_score=ats_score,
            readability_score=readability_score,
            email=email_,
            phone_number=phone_number,
        )
        db.add(new_entry)
        db.commit()
        msg = f"[✓] Inserted resume: {candidate_name} ({filename}) | Relevance: {relevance_score:.2f}%"
        print(msg)
        logging.info(msg)
    except Exception as e:
        db.rollback()
        logging.error(f"DB insert failed for {filename}: {e}")
    finally:
        db.close()

def fetch_and_process_resumes():
    print("[*] Starting Email Listener...")
    logging.info("[*] Starting Email Listener...")

    try:
        mail = imaplib.IMAP4_SSL(IMAP_SERVER)
        mail.login(EMAIL_USER, EMAIL_PASS)
        mail.select("inbox")
        result, data = mail.search(None, "UNSEEN")
        email_ids = data[0].split()
    except Exception as e:
        logging.error(f"IMAP connection error: {e}")
        return

    for email_id in email_ids:
        try:
            result, msg_data = mail.fetch(email_id, "(RFC822)")
        except Exception as e:
            logging.error(f"Error fetching email ID {email_id}: {e}")
            continue

        for response_part in msg_data:
            if isinstance(response_part, tuple):
                msg = email.message_from_bytes(response_part[1])
                sender = msg.get("From", "")
                subject = clean_subject(msg.get("Subject", "No Subject"))

                if ALLOWED_SENDER not in sender:
                    logging.info(f"Ignored email from: {sender}")
                    continue

                logging.info(f"[📩] New email from {sender} | Subject: {subject}")

                for part in msg.walk():
                    if part.get_content_maintype() == "multipart":
                        continue
                    if part.get("Content-Disposition") is None:
                        continue

                    filename = part.get_filename()
                    if filename and filename.lower().endswith((".pdf", ".docx")):
                        process_resume(part, filename)
                    else:
                        logging.warning(f"[×] Skipped unsupported file: {filename}")

                # Mark as seen
                mail.store(email_id, '+FLAGS', '\\Seen')

    mail.logout()
    logging.info("Completed checking inbox.")

if __name__ == "__main__":
    fetch_and_process_resumes() 
