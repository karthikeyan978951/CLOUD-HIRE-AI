import re
import io
import datetime
from typing import List, Dict, Any, Optional, Tuple
import pdfplumber
import docx
import spacy
from sqlalchemy.orm import Session
from app.models import Skill, Certification

# Load spaCy English model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    # Fallback if model not downloaded yet
    import subprocess
    import sys
    try:
        subprocess.run([sys.executable, "-m", "spacy", "download", "en_core_web_sm"], check=True)
        nlp = spacy.load("en_core_web_sm")
    except Exception:
        # Minimal dummy class if download completely fails
        class DummyNLP:
            def __call__(self, text):
                class DummyDoc:
                    def __init__(self, t):
                        self.text = t
                        self.ents = []
                return DummyDoc(text)
        nlp = DummyNLP()

# Default skill list to match if DB is empty
DEFAULT_SKILLS = [
    # AWS
    "EC2", "S3", "Lambda", "DynamoDB", "CloudWatch", "VPC", "IAM", "RDS", "Route53", "API Gateway", "ECS", "EKS",
    # Azure
    "Virtual Machines", "Blob Storage", "Azure Functions", "Azure SQL",
    # GCP
    "Compute Engine", "Cloud Storage", "BigQuery",
    # Programming
    "Python", "Java", "JavaScript", "SQL", "TypeScript", "C#", "C++", "Go",
    # DevOps
    "Docker", "Kubernetes", "Jenkins", "Terraform", "GitHub Actions", "Ansible", "Git", "CI/CD", "Linux"
]

DEFAULT_CERTS = [
    "AWS Certified Cloud Practitioner",
    "AWS Certified Solutions Architect",
    "AWS Certified Developer",
    "AWS Certified SysOps Administrator",
    "AWS Certified DevOps Engineer",
    "Microsoft Certified: Azure Fundamentals",
    "Microsoft Certified: Azure Administrator",
    "Microsoft Certified: Azure Developer",
    "Google Cloud Certified Associate Cloud Engineer",
    "Google Cloud Certified Professional Cloud Architect",
    "Certified Kubernetes Administrator", "CKA",
    "Certified Kubernetes Application Developer", "CKAD",
    "HashiCorp Certified: Terraform Associate"
]

def extract_text_from_pdf(file_bytes: bytes) -> str:
    text = ""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text

def extract_text_from_docx(file_bytes: bytes) -> str:
    doc = docx.Document(io.BytesIO(file_bytes))
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                full_text.append(cell.text)
    return "\n".join(full_text)

def extract_email(text: str) -> Optional[str]:
    email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
    match = re.search(email_pattern, text)
    return match.group(0) if match else None

def extract_phone(text: str) -> Optional[str]:
    # Match standard formats: +1-123-456-7890, (123) 456-7890, 1234567890, etc.
    phone_pattern = r'(?:(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})'
    match = re.search(phone_pattern, text)
    return match.group(0) if match else None

def extract_name(text: str) -> Optional[str]:
    # Attempt spaCy NER
    doc = nlp(text[:1000]) # Scan first 1000 chars for name
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            name = ent.text.strip()
            # Clean up newlines or extra spaces
            name = re.sub(r'\s+', ' ', name)
            if len(name.split()) >= 2 and len(name) < 50:
                return name
                
    # Fallback: check first non-empty lines
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    if lines:
        first_line = lines[0]
        # Names usually don't have emails or long text
        if len(first_line) < 40 and "@" not in first_line and not any(char.isdigit() for char in first_line):
            return first_line
            
    return "Candidate"

def estimate_experience_years(text: str) -> float:
    # 1. Search for explicit text like "5+ years of experience" or "7 years experience"
    exp_pattern = r'(\d+(?:\.\d+)?)\+?\s*years?\s+(?:of\s+)?experience'
    match = re.search(exp_pattern, text, re.IGNORECASE)
    if match:
        return float(match.group(1))

    # 2. Extract date ranges (e.g. 2018 - 2022, Jan 2019 to Present) and calculate sum
    year_range_pattern = r'\b(19\d{2}|20\d{2})\s*[-–—to]+\s*(19\d{2}|20\d{2}|present|current)\b'
    matches = re.findall(year_range_pattern, text, re.IGNORECASE)
    
    current_year = datetime.datetime.now().year
    total_years = 0.0
    
    for start, end in matches:
        start_year = int(start)
        if end.lower() in ["present", "current"]:
            end_year = current_year
        else:
            try:
                end_year = int(end)
            except ValueError:
                end_year = current_year
        
        diff = end_year - start_year
        if 0 < diff <= 45: # Filter out bogus intervals
            total_years += diff
            
    if total_years > 0:
        return min(total_years, 40.0)
        
    return 1.0 # Default fallback if not found

def extract_education(text: str) -> List[str]:
    degrees = ["bachelor", "master", "phd", "b.tech", "m.tech", "b.s", "m.s", "b.e", "ph.d", "bsc", "msc", "diploma", "degree"]
    found = []
    lines = text.split('\n')
    for line in lines:
        line_lower = line.lower()
        if any(degree in line_lower for degree in degrees):
            cleaned = line.strip()
            if len(cleaned) < 150: # Avoid capturing whole paragraphs
                found.append(cleaned)
    return found[:3]

def parse_resume(file_bytes: bytes, filename: str, db: Session) -> Dict[str, Any]:
    # Extract raw text based on file format
    if filename.endswith(".pdf"):
        text = extract_text_from_pdf(file_bytes)
    elif filename.endswith(".docx"):
        text = extract_text_from_docx(file_bytes)
    else:
        raise ValueError("Unsupported file format. Please upload PDF or DOCX.")

    # Base extractions
    name = extract_name(text)
    email = extract_email(text)
    phone = extract_phone(text)
    education = extract_education(text)
    experience_years = estimate_experience_years(text)

    # Load Skills from database
    db_skills = db.query(Skill).all()
    skill_keywords = [s.name for s in db_skills] if db_skills else DEFAULT_SKILLS
    
    # Load Certifications from database
    db_certs = db.query(Certification).all()
    cert_keywords = [c.name for c in db_certs] if db_certs else DEFAULT_CERTS

    # Detect skills in text
    extracted_skills = []
    text_lower = text.lower()
    for skill in skill_keywords:
        # Match whole words to avoid sub-string errors (e.g. matching "Go" inside "Google")
        # Ensure we escape special characters in regex (like C++, C#)
        escaped_skill = re.escape(skill)
        # Word boundary rules for alphabetic vs symbols
        if re.search(r'\w', skill):
            pattern = r'\b' + escaped_skill + r'\b'
        else:
            pattern = escaped_skill
            
        if re.search(pattern, text_lower, re.IGNORECASE):
            extracted_skills.append(skill)

    # Detect certifications in text
    extracted_certs = []
    for cert in cert_keywords:
        if cert.lower() in text_lower:
            extracted_certs.append(cert)
            
    # Compile experience paragraphs
    experience_sections = []
    lines = text.split('\n')
    is_exp_sec = False
    for line in lines:
        l_strip = line.strip()
        if not l_strip:
            continue
        # Detect start of experience section
        if re.search(r'\b(experience|employment|work history|career history|projects)\b', l_strip.lower()):
            is_exp_sec = True
            continue
        # Detect start of other sections to stop
        if re.search(r'\b(education|skills|certifications|awards|languages|interests)\b', l_strip.lower()) and is_exp_sec:
            is_exp_sec = False
            
        if is_exp_sec:
            experience_sections.append(l_strip)

    experience_text = "\n".join(experience_sections[:25]) # Cap it to prevent overflow

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "education": education,
        "experience_years": experience_years,
        "experience_text": experience_text,
        "skills": list(set(extracted_skills)),
        "certifications": list(set(extracted_certs)),
        "raw_text": text[:5000] # store first 5k chars for debugging
    }
