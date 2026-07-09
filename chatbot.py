import re
from typing import Dict, Any, List

def get_career_guidance_reply(message: str) -> Dict[str, Any]:
    """
    Simulates a career guidance chatbot response.
    """
    msg_lower = message.lower().strip()
    
    # 1. Check for specific cloud career intents
    if re.search(r'\b(devops|sre|site reliability|kubernetes|docker|terraform|jenkins)\b', msg_lower):
        reply = (
            "DevOps and Site Reliability Engineering (SRE) are critical pillars of cloud engineering. "
            "To break into DevOps, prioritize: \n"
            "1. Infrastructure as Code (IaC) - Terraform is the industry standard.\n"
            "2. Containerization - Docker and Kubernetes orchestrations.\n"
            "3. CI/CD automation - GitHub Actions or Jenkins.\n\n"
            "Would you like me to highlight the skill gaps between your current resume and our standard DevOps Engineer role?"
        )
        suggestions = ["Analyze DevOps gaps", "Show Kubernetes questions", "Generate a roadmap"]
        
    elif re.search(r'\b(aws|amazon|lambda|s3|ec2|dynamodb)\b', msg_lower):
        reply = (
            "Amazon Web Services (AWS) remains the largest cloud provider by market share. "
            "For cloud developer and engineering roles, focus heavily on:\n"
            "- Serverless architectures (AWS Lambda, API Gateway)\n"
            "- Managed databases (RDS, DynamoDB)\n"
            "- Infrastructure security (IAM Roles, VPC isolation)\n\n"
            "I recommend aiming for the AWS Solutions Architect Associate or AWS Developer Associate certification to solidify these concepts."
        )
        suggestions = ["AWS cert recommendations", "AWS Lambda interview prep", "AWS Developer salary trends"]
        
    elif re.search(r'\b(azure|microsoft|gcp|google|bigquery|cloud storage)\b', msg_lower):
        reply = (
            "Both Microsoft Azure and Google Cloud Platform (GCP) are growing rapidly, especially in enterprise and data analytics. "
            "Azure is massive in hybrid cloud and Active Directory integrations, while GCP excels in Big Data (BigQuery), Machine Learning, and Kubernetes (GKE).\n\n"
            "If your resume already lists Azure or GCP tools, doubling down on their associate-level certs is a great way to stand out."
        )
        suggestions = ["Azure Administrator details", "GCP Engineer certs", "Compare cloud providers"]
        
    elif re.search(r'\b(cert|certification|exam|practitioner|associate|professional)\b', msg_lower):
        reply = (
            "Certifications are a fantastic way to validate your skills to recruiters. Here is the general roadmap:\n"
            "1. **Beginner**: AWS Cloud Practitioner or Azure Fundamentals (AZ-900) - focus on concepts, not code.\n"
            "2. **Associate**: AWS Solutions Architect Associate or Azure Administrator - focus on designing scalable architectures.\n"
            "3. **Specialized**: Certified Kubernetes Administrator (CKA) or Terraform Associate - validate tool proficiency.\n\n"
            "Which cloud provider are you targeting?"
        )
        suggestions = ["AWS certification details", "Azure certification details", "Terraform certification details"]
        
    elif re.search(r'\b(resume|cv|improve|ats|score)\b', msg_lower):
        reply = (
            "To optimize your resume for applicant tracking systems (ATS):\n"
            "1. **Include keywords**: Make sure terms like 'Terraform', 'CI/CD', and 'Docker' match exactly.\n"
            "2. **Quantify achievements**: Write 'Migrated applications to AWS ECS reducing latency by 20%' instead of 'Managed docker containers'.\n"
            "3. **Clean structure**: Avoid complex grid layouts or graphic symbols that parser scanners struggle to process."
        )
        suggestions = ["Show ATS Score calculator", "Review my strength areas", "View resume summary report"]
        
    elif re.search(r'\b(hello|hi|hey|greetings|help)\b', msg_lower):
        reply = (
            "Hello! I am CloudHire AI's Career Guidance Coach. 🚀\n"
            "I can help you review your resume, discover gaps for cloud roles, suggest certification pathways, provide mock interview questions, or analyze cloud hiring trends.\n\n"
            "What cloud role are you preparing for?"
        )
        suggestions = ["Cloud Engineer roadmap", "DevOps prep cards", "Show hiring trends"]
        
    else:
        reply = (
            "That's a great question. In cloud computing, success is built on hands-on practice. "
            "To advance your career, try building a capstone project that features:\n"
            "- Cloud infrastructure provisioned using Terraform.\n"
            "- Application containers deployed using Kubernetes.\n"
            "- Dynamic code deployment automated via GitHub Actions pipelines.\n\n"
            "Feel free to ask me details about any specific cloud service or job role!"
        )
        suggestions = ["Show all job roles", "Show interview preparation", "Mock job trends"]

    return {
        "reply": reply,
        "suggestions": suggestions
    }
