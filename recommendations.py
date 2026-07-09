from typing import List, Dict, Any

def recommend_certifications(overall_score: float, candidate_skills: List[str]) -> List[Dict[str, Any]]:
    """
    Recommends certifications based on candidate's overall score and primary cloud provider.
    """
    # 1. Determine cloud provider affinity
    aws_count = sum(1 for s in candidate_skills if s.lower() in ["aws", "ec2", "s3", "lambda", "dynamodb", "cloudwatch", "vpc", "iam", "rds", "route53", "api gateway", "ecs", "eks"])
    azure_count = sum(1 for s in candidate_skills if s.lower() in ["azure", "virtual machines", "blob storage", "azure functions", "azure sql"])
    gcp_count = sum(1 for s in candidate_skills if s.lower() in ["gcp", "compute engine", "cloud storage", "bigquery"])
    
    provider = "AWS"
    if azure_count > aws_count and azure_count >= gcp_count:
        provider = "Azure"
    elif gcp_count > aws_count and gcp_count >= azure_count:
        provider = "GCP"
        
    # 2. Assign recommended certifications based on score
    recommendations = []
    
    # Check if they have general DevOps skills for Kubernetes recommendations
    has_devops = any(s.lower() in ["docker", "kubernetes", "jenkins", "terraform", "github actions", "devops"] for s in candidate_skills)
    
    if overall_score < 50.0:
        # Beginner certifications
        if provider == "AWS":
            recommendations.append({
                "name": "AWS Certified Cloud Practitioner",
                "issuer": "Amazon Web Services (AWS)",
                "difficulty": "Beginner",
                "focus": "Cloud Fundamentals, Global Infrastructure, Basic Services, Cost and Billing models.",
                "link": "https://aws.amazon.com/certification/certified-cloud-practitioner/"
            })
        elif provider == "Azure":
            recommendations.append({
                "name": "Microsoft Certified: Azure Fundamentals (AZ-900)",
                "issuer": "Microsoft Azure",
                "difficulty": "Beginner",
                "focus": "Azure Cloud Concepts, Architecture, Security, Governance, and Management Tools.",
                "link": "https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/"
            })
        else: # GCP
            recommendations.append({
                "name": "Google Cloud Digital Leader",
                "issuer": "Google Cloud Platform (GCP)",
                "difficulty": "Beginner",
                "focus": "Google Cloud Products, Services, Benefits, and Business Capabilities.",
                "link": "https://cloud.google.com/learn/certification/cloud-digital-leader"
            })
            
    elif overall_score < 80.0:
        # Intermediate certifications
        if provider == "AWS":
            recommendations.append({
                "name": "AWS Certified Solutions Architect – Associate",
                "issuer": "Amazon Web Services (AWS)",
                "difficulty": "Intermediate",
                "focus": "Designing Resilient, High-Performing, Secure, and Cost-Optimized Architectures.",
                "link": "https://aws.amazon.com/certification/certified-solutions-architect-associate/"
            })
            recommendations.append({
                "name": "AWS Certified Developer – Associate",
                "issuer": "Amazon Web Services (AWS)",
                "difficulty": "Intermediate",
                "focus": "Developing, Deploying, and Debugging serverless and containerized cloud applications.",
                "link": "https://aws.amazon.com/certification/certified-developer-associate/"
            })
        elif provider == "Azure":
            recommendations.append({
                "name": "Microsoft Certified: Azure Administrator Associate (AZ-104)",
                "issuer": "Microsoft Azure",
                "difficulty": "Intermediate",
                "focus": "Managing Azure Identity, Storage, Virtual Networks, and Compute Resources.",
                "link": "https://learn.microsoft.com/en-us/credentials/certifications/azure-administrator/"
            })
        else: # GCP
            recommendations.append({
                "name": "Google Associate Cloud Engineer",
                "issuer": "Google Cloud Platform (GCP)",
                "difficulty": "Intermediate",
                "focus": "Deploying apps, monitoring operations, managing enterprise projects, and security controls.",
                "link": "https://cloud.google.com/learn/certification/associate-cloud-engineer"
            })
            
        if has_devops:
            recommendations.append({
                "name": "HashiCorp Certified: Terraform Associate",
                "issuer": "HashiCorp",
                "difficulty": "Intermediate",
                "focus": "Infrastructure as Code syntax, state configuration, dynamic modules, and workflows.",
                "link": "https://www.hashicorp.com/certification/terraform-associate"
            })
            
    else:
        # Advanced certifications
        if provider == "AWS":
            recommendations.append({
                "name": "AWS Certified DevOps Engineer – Professional",
                "issuer": "Amazon Web Services (AWS)",
                "difficulty": "Advanced",
                "focus": "Provisioning, operating, and managing distributed application systems on AWS.",
                "link": "https://aws.amazon.com/certification/certified-devops-engineer-professional/"
            })
            recommendations.append({
                "name": "AWS Certified Solutions Architect – Professional",
                "issuer": "Amazon Web Services (AWS)",
                "difficulty": "Advanced",
                "focus": "Designing complex distributed applications, scalability strategies, and cost-reduction plans.",
                "link": "https://aws.amazon.com/certification/certified-solutions-architect-professional/"
            })
        elif provider == "Azure":
            recommendations.append({
                "name": "Microsoft Certified: Azure Solutions Architect Expert (AZ-305)",
                "issuer": "Microsoft Azure",
                "difficulty": "Advanced",
                "focus": "Designing cloud infrastructure, data storage, identity audits, and high availability systems.",
                "link": "https://learn.microsoft.com/en-us/credentials/certifications/azure-solutions-architect-expert/"
            })
        else: # GCP
            recommendations.append({
                "name": "Google Professional Cloud Architect",
                "issuer": "Google Cloud Platform (GCP)",
                "difficulty": "Advanced",
                "focus": "Designing robust, secure, scalable, and dynamic Google Cloud solutions.",
                "link": "https://cloud.google.com/learn/certification/professional-cloud-architect"
            })
            
        recommendations.append({
            "name": "Certified Kubernetes Administrator (CKA)",
            "issuer": "Cloud Native Computing Foundation (CNCF)",
            "difficulty": "Advanced",
            "focus": "Kubernetes core setup, cluster networking, service routing, troubleshooting, and volume mounts.",
            "link": "https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/"
        })
        
    return recommendations
