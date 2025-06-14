import re

def extract_candidate_details(text: str):
    """
    Extract candidate name, email, and phone number from resume text.
    """

    # Extract candidate name from the first line that looks like a name
    lines = text.splitlines()
    candidate_name = "Candidate"
    for line in lines:
        line = line.strip()
        if len(line.split()) >= 2 and all(word.istitle() or word.isupper() for word in line.split()):
            candidate_name = re.sub(r'[^a-zA-Z\s\-]', '', line).strip()
            break

    # Extract email address
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    email = email_match.group(0) if email_match else None

    # Extract phone number (common international + local formats)
    phone_match = re.search(
        r'(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3}[-.\s]?\d{4}',
        text
    )
    phone_number = phone_match.group(0) if phone_match else None

    return candidate_name, email, phone_number
