from typing import Dict, Any, List
import numpy as np
from app.models import JobRole

# Try optional sklearn imports; provide graceful fallback when unavailable
try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    _HAVE_SKLEARN = True
except Exception:
    TfidfVectorizer = None
    cosine_similarity = None
    _HAVE_SKLEARN = False

def calculate_text_similarity(source_text: str, target_text: str) -> float:
    """
    Utility using TF-IDF and Cosine Similarity to compute semantic match between texts.
    Falls back to simple word overlap if TF-IDF fails.
    """
    if not source_text or not target_text:
        return 0.0
        
    try:
        if _HAVE_SKLEARN and TfidfVectorizer is not None and cosine_similarity is not None:
            vectorizer = TfidfVectorizer(stop_words='english')
            tfidf = vectorizer.fit_transform([source_text, target_text])
            sim = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
            return float(sim)
        # else fall through to simple overlap
    except Exception:
        # Fallback to Jaccard-like word overlap if sklearn is missing or errors
        words_source = set(source_text.lower().split())
        words_target = set(target_text.lower().split())
        if not words_target:
            return 0.0
        intersection = words_source.intersection(words_target)
        return float(len(intersection) / len(words_target))

def evaluate_resume_quality(parsed_content: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluates overall resume quality independent of any job role.
    Returns quality rating (Excellent, Good, Average, Poor), score, and suggestions.
    """
    score = 0.0
    max_score = 100.0
    issues = []
    suggestions = []
    strengths = []
    
    # 1. Contact Information (10 points)
    contact_score = 0
    contact_info = parsed_content.get("contact_info", {})
    if contact_info.get("name"):
        contact_score += 3
        strengths.append("Has complete name")
    else:
        issues.append("Missing name/header")
    
    if contact_info.get("email"):
        contact_score += 3
        strengths.append("Has email address")
    else:
        issues.append("Missing email")
        suggestions.append("Add professional email address")
    
    if contact_info.get("phone"):
        contact_score += 2
        strengths.append("Has phone number")
    else:
        suggestions.append("Consider adding phone number for better contact options")
    
    if contact_info.get("linkedin_url") or contact_info.get("portfolio_url"):
        contact_score += 2
        strengths.append("Has professional links (LinkedIn/Portfolio)")
    else:
        suggestions.append("Add LinkedIn profile or portfolio URL to showcase your work")
    
    score += min(contact_score, 10)
    
    # 2. Professional Summary/Objective (10 points)
    summary = parsed_content.get("summary", "").strip()
    if summary and len(summary) > 50:
        score += 10
        strengths.append("Has well-written professional summary")
    elif summary:
        score += 5
        suggestions.append("Expand professional summary to better highlight career goals and value proposition")
    else:
        issues.append("Missing professional summary")
        suggestions.append("Add a professional summary (2-3 lines) highlighting your key strengths and career goals")
    
    # 3. Experience Section (25 points)
    experience = parsed_content.get("experience", [])
    exp_years = parsed_content.get("experience_years", 0)
    experience_text = parsed_content.get("experience_text", "").strip()
    
    if not experience or len(experience) == 0:
        issues.append("Missing or empty experience section")
        suggestions.append("Add your work experience with detailed bullet points about achievements")
    else:
        exp_bullets = len([e for e in experience if isinstance(e, dict) and e.get("description")])
        if len(experience) >= 3:
            score += 10
            strengths.append(f"Has {len(experience)} relevant work experiences")
        else:
            score += 5 if len(experience) > 0 else 0
            
        if exp_years >= 3:
            score += 10
            strengths.append(f"Good experience level ({exp_years}+ years)")
        elif exp_years > 0:
            score += 5
            suggestions.append("Build more professional experience to strengthen candidacy")
        else:
            issues.append("No quantifiable experience years")
            
        if experience_text and len(experience_text) > 200:
            score += 5
            strengths.append("Detailed work descriptions with achievements")
        else:
            suggestions.append("Add quantifiable achievements and metrics to experience descriptions (e.g., 'improved performance by X%')")
    
    # 4. Skills Section (20 points)
    skills = parsed_content.get("skills", [])
    if len(skills) == 0:
        issues.append("Missing skills section")
        suggestions.append("Add a comprehensive skills section with technical and soft skills")
    elif len(skills) < 5:
        score += 5
        suggestions.append("Add more skills to showcase broader expertise")
    elif len(skills) < 15:
        score += 12
        strengths.append(f"Good skill diversity ({len(skills)} skills listed)")
    else:
        score += 20
        strengths.append(f"Excellent skill diversity ({len(skills)} skills, industry-relevant)")
    
    # Check for cloud/industry skills
    cloud_skills = [s.lower() for s in skills if any(cloud in s.lower() for cloud in ["aws", "azure", "gcp", "kubernetes", "docker", "terraform"])]
    prog_skills = [s.lower() for s in skills if any(lang in s.lower() for lang in ["python", "java", "javascript", "c++", "go", "rust"])]
    devops_skills = [s.lower() for s in skills if any(devops in s.lower() for devops in ["ci/cd", "jenkins", "gitlab", "github", "devops", "monitoring"])]
    
    if cloud_skills:
        strengths.append(f"Has cloud technologies: {', '.join(cloud_skills[:3])}")
    if prog_skills:
        strengths.append(f"Has programming languages: {', '.join(prog_skills[:3])}")
    if devops_skills:
        strengths.append(f"Has DevOps expertise")
    
    # 5. Education Section (15 points)
    education = parsed_content.get("education", [])
    if len(education) == 0:
        suggestions.append("Add educational background and degrees")
    else:
        score += 15
        strengths.append(f"Has {len(education)} educational qualification(s)")
    
    # 6. Certifications (10 points)
    certifications = parsed_content.get("certifications", [])
    if len(certifications) > 0:
        score += min(len(certifications) * 3, 10)
        strengths.append(f"Has {len(certifications)} professional certification(s)")
    else:
        suggestions.append("Consider pursuing relevant industry certifications (AWS, Azure, GCP, etc.)")
    
    # 7. Format & Presentation (10 points)
    format_score = 10  # Assuming parsed correctly
    score += format_score
    
    # Determine quality rating
    if score >= 85:
        quality_rating = "Excellent"
        quality_color = "excellent"
    elif score >= 70:
        quality_rating = "Good"
        quality_color = "good"
    elif score >= 55:
        quality_rating = "Average"
        quality_color = "average"
    else:
        quality_rating = "Poor"
        quality_color = "poor"
    
    # Company alignment suggestions
    company_alignment = generate_company_alignment(skills, experience, certifications, quality_rating)
    
    return {
        "quality_score": round(score, 1),
        "quality_rating": quality_rating,
        "quality_color": quality_color,
        "max_score": max_score,
        "issues": issues,
        "suggestions": suggestions,
        "strengths": strengths,
        "company_alignment": company_alignment,
        "resume_breakdown": {
            "contact_info": contact_score,
            "summary": 10 if summary and len(summary) > 50 else (5 if summary else 0),
            "experience": min(score - contact_score - 40, 25),
            "skills": min(len(skills) * 1.5, 20),
            "education": 15 if education else 0,
            "certifications": min(len(certifications) * 3, 10),
        }
    }


def generate_company_alignment(skills: List[str], experience: List[Dict], certifications: List[str], quality_rating: str) -> Dict[str, Any]:
    """
    Generates company alignment insights based on skills, experience, and quality.
    """
    skills_lower = [s.lower() for s in skills]
    
    # Determine company type alignment
    faang_skills = ["python", "java", "javascript", "system design", "dsa", "leetcode"]
    startup_skills = ["full stack", "mvp", "agile", "rapid development", "hack", "bootstrap"]
    enterprise_skills = ["enterprise", "sap", "oracle", "compliance", "governance", "risk"]
    fintech_skills = ["finance", "payments", "blockchain", "cryptocurrency", "trading"]
    
    faang_match = sum(1 for s in skills_lower if any(fs in s for fs in faang_skills))
    startup_match = sum(1 for s in skills_lower if any(ss in s for ss in startup_skills))
    enterprise_match = sum(1 for s in skills_lower if any(es in s for es in enterprise_skills))
    fintech_match = sum(1 for s in skills_lower if any(fs in s for fs in fintech_skills))
    
    company_types = []
    if faang_match >= 2:
        company_types.append({"type": "FAANG/Large Tech", "match": "High", "note": "Strong in algorithmic thinking & system design"})
    if startup_match >= 2:
        company_types.append({"type": "Startup", "match": "High", "note": "Good for fast-paced, full-stack environments"})
    if enterprise_match >= 2:
        company_types.append({"type": "Enterprise", "match": "High", "note": "Well-suited for large-scale, regulated systems"})
    if fintech_match >= 2:
        company_types.append({"type": "FinTech", "match": "High", "note": "Strong financial tech background"})
    
    # Cloud provider alignment
    aws_count = sum(1 for s in skills_lower if any(x in s for x in ["aws", "ec2", "s3", "lambda", "dynamodb"]))
    azure_count = sum(1 for s in skills_lower if any(x in s for x in ["azure", "cosmos", "function app"]))
    gcp_count = sum(1 for s in skills_lower if any(x in s for x in ["gcp", "bigquery", "dataflow"]))
    
    primary_cloud = None
    if aws_count >= azure_count and aws_count >= gcp_count and aws_count > 0:
        primary_cloud = "AWS"
    elif azure_count >= aws_count and azure_count >= gcp_count and azure_count > 0:
        primary_cloud = "Azure"
    elif gcp_count > 0:
        primary_cloud = "GCP"
    
    return {
        "company_types": company_types if company_types else [{"type": "Mid-size/Consulting", "match": "Moderate", "note": "Well-rounded skill set"}],
        "primary_cloud_provider": primary_cloud,
        "quality_recommendation": f"Your resume is rated {quality_rating}. {'You are well-positioned for competitive roles.' if quality_rating in ['Excellent', 'Good'] else 'Consider implementing suggestions to strengthen your candidacy.'}"
    }


def analyze_resume_match(parsed_content: Dict[str, Any], job_role: JobRole) -> Dict[str, Any]:
    """
    Analyzes resume content against a job role.
    """
    candidate_skills = [s.lower() for s in parsed_content.get("skills", [])]
    candidate_certs = [c.lower() for c in parsed_content.get("certifications", [])]
    experience_years = parsed_content.get("experience_years", 1.0)
    experience_text = parsed_content.get("experience_text", "")
    
    # 1. Skill Match Score (Weighted)
    req_skills = job_role.required_skills
    weights = job_role.weightage or {}
    
    # If weights are empty, assign default equal weight
    if not weights:
        weights = {skill: 1.0 for skill in req_skills}
        
    total_req_weight = sum(weights.get(skill, 1.0) for skill in req_skills)
    matched_weight = 0.0
    matched_skills = []
    missing_skills = []
    
    gap_details = []
    
    for skill in req_skills:
        skill_lower = skill.lower()
        # Find if it is in candidate skills
        is_matched = False
        for c_skill in candidate_skills:
            if skill_lower == c_skill or skill_lower in c_skill:
                is_matched = True
                break
                
        skill_weight = weights.get(skill, 1.0)
        
        # Categorize gap priority based on weight
        priority = "None"
        if not is_matched:
            if skill_weight >= 0.8:
                priority = "High"
            elif skill_weight >= 0.5:
                priority = "Medium"
            else:
                priority = "Low"
                
        gap_details.append({
            "skill": skill,
            "status": "Matched" if is_matched else "Missing",
            "priority": priority
        })
        
        if is_matched:
            matched_weight += skill_weight
            matched_skills.append(skill)
        else:
            missing_skills.append(skill)
            
    skill_score = (matched_weight / total_req_weight * 100.0) if total_req_weight > 0 else 100.0
    
    # 2. Experience Score
    difficulty = job_role.difficulty.lower()
    if difficulty == "beginner":
        exp_score = 100.0
    elif difficulty == "intermediate":
        # Target: 3 years
        exp_score = min((experience_years / 3.0) * 100.0, 100.0)
    else: # Advanced
        # Target: 6 years
        exp_score = min((experience_years / 6.0) * 100.0, 100.0)
        
    # 3. Certification Score
    recommended_certs = job_role.recommended_certifications or []
    if not recommended_certs:
        cert_score = 100.0
    else:
        matched_certs_count = 0
        for r_cert in recommended_certs:
            r_cert_lower = r_cert.lower()
            if any(r_cert_lower in c_cert for c_cert in candidate_certs):
                matched_certs_count += 1
        cert_score = (matched_certs_count / len(recommended_certs)) * 100.0
        # Give partial credit (at least 20%) if they have general certifications, max 100
        if cert_score == 0 and len(candidate_certs) > 0:
            cert_score = 30.0

    # 4. Project Score (TF-IDF similarity between job description + required skills and resume experience text)
    job_profile_text = f"{job_role.description} {' '.join(req_skills)}"
    project_score = calculate_text_similarity(experience_text, job_profile_text) * 100.0
    # Boost/normalize score: similarity can be low in TF-IDF, let's rescale
    # A similarity of 0.3 is actually quite high. Let's scale up.
    project_score = min(project_score * 2.5, 100.0)
    if not experience_text.strip():
        project_score = 10.0 # base score for empty history
        
    # 5. Overall Match Score
    # Weights: Skill=50%, Project=20%, Experience=15%, Certifications=15%
    overall_score = (skill_score * 0.50) + (project_score * 0.20) + (exp_score * 0.15) + (cert_score * 0.15)
    overall_score = round(overall_score, 1)
    
    gap_percentage = round((len(missing_skills) / len(req_skills) * 100.0) if req_skills else 0.0, 1)

    return {
        "scores": {
            "skill_match_score": round(skill_score, 1),
            "experience_score": round(exp_score, 1),
            "certification_score": round(cert_score, 1),
            "project_score": round(project_score, 1),
            "overall_score": overall_score
        },
        "gap_analysis": {
            "gap_percentage": gap_percentage,
            "details": gap_details,
            "strengths": matched_skills,
            "missing": missing_skills
        }
    }
