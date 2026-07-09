from sqlalchemy.orm import Session
from app.database import engine, Base
from app.models import Skill, JobRole, Certification, InterviewQuestion

def seed_database(db: Session):
    # 1. Seed Skills
    skills_data = [
        # AWS
        ("EC2", "AWS"), ("S3", "AWS"), ("Lambda", "AWS"), ("DynamoDB", "AWS"), 
        ("CloudWatch", "AWS"), ("VPC", "AWS"), ("IAM", "AWS"), ("RDS", "AWS"), 
        ("Route53", "AWS"), ("API Gateway", "AWS"), ("ECS", "AWS"), ("EKS", "AWS"),
        # Azure
        ("Virtual Machines", "Azure"), ("Blob Storage", "Azure"), 
        ("Azure Functions", "Azure"), ("Azure SQL", "Azure"),
        # GCP
        ("Compute Engine", "GCP"), ("Cloud Storage", "GCP"), ("BigQuery", "GCP"),
        # Programming
        ("Python", "Programming"), ("Java", "Programming"), 
        ("JavaScript", "Programming"), ("SQL", "Programming"),
        # DevOps
        ("Docker", "DevOps"), ("Kubernetes", "DevOps"), ("Jenkins", "DevOps"), 
        ("Terraform", "DevOps"), ("GitHub Actions", "DevOps")
    ]
    
    existing_skills = db.query(Skill).count()
    if existing_skills == 0:
        for name, cat in skills_data:
            skill = Skill(name=name, category=cat)
            db.add(skill)
        db.commit()
        print("Seeded skills successfully.")

    # 2. Seed Certifications
    certs_data = [
        # AWS
        ("AWS Cloud Practitioner", "AWS", "Beginner", "AWS"),
        ("AWS Solutions Architect Associate", "AWS", "Intermediate", "AWS"),
        ("AWS Developer Associate", "AWS", "Intermediate", "AWS"),
        ("AWS SysOps Administrator Associate", "AWS", "Intermediate", "AWS"),
        ("AWS Solutions Architect Professional", "AWS", "Advanced", "AWS"),
        ("AWS DevOps Engineer Professional", "AWS", "Advanced", "AWS"),
        # Azure
        ("Microsoft Certified: Azure Fundamentals", "Microsoft", "Beginner", "Azure"),
        ("Microsoft Certified: Azure Administrator Associate", "Microsoft", "Intermediate", "Azure"),
        ("Microsoft Certified: Azure Developer Associate", "Microsoft", "Intermediate", "Azure"),
        ("Microsoft Certified: Azure Solutions Architect Expert", "Microsoft", "Advanced", "Azure"),
        # GCP
        ("Google Cloud Digital Leader", "Google", "Beginner", "GCP"),
        ("Google Associate Cloud Engineer", "Google", "Intermediate", "GCP"),
        ("Google Professional Cloud Architect", "Google", "Advanced", "GCP"),
        # DevOps / Cloud Native
        ("Certified Kubernetes Administrator (CKA)", "CNCF", "Advanced", "None"),
        ("Certified Kubernetes Application Developer (CKAD)", "CNCF", "Advanced", "None"),
        ("HashiCorp Certified: Terraform Associate", "HashiCorp", "Intermediate", "None")
    ]

    existing_certs = db.query(Certification).count()
    if existing_certs == 0:
        for name, issuer, diff, cloud in certs_data:
            cert = Certification(name=name, issuer=issuer, difficulty=diff, cloud_provider=cloud)
            db.add(cert)
        db.commit()
        print("Seeded certifications successfully.")

    # 3. Seed Job Roles
    existing_roles = db.query(JobRole).count()
    if existing_roles == 0:
        roles_data = [
            JobRole(
                title="Cloud Engineer",
                description="Responsible for building, managing, and maintaining cloud infrastructure systems. Collaborates closely with software development groups to deploy services securely.",
                difficulty="Intermediate",
                required_skills=["EC2", "S3", "Lambda", "VPC", "IAM", "Python", "Docker", "CloudWatch", "API Gateway", "SQL"],
                weightage={
                    "EC2": 1.0, "S3": 1.0, "Lambda": 0.8, "VPC": 0.9, "IAM": 0.9,
                    "Python": 0.7, "Docker": 0.7, "CloudWatch": 0.6, "API Gateway": 0.6, "SQL": 0.5
                },
                recommended_certifications=["AWS Cloud Practitioner", "AWS Solutions Architect Associate", "AWS Developer Associate"]
            ),
            JobRole(
                title="DevOps Engineer",
                description="Focuses on automation, CI/CD pipelines, containerization orchestrations, and Infrastructure as Code configurations to accelerate software delivery cycles.",
                difficulty="Intermediate",
                required_skills=["Docker", "Kubernetes", "Jenkins", "Terraform", "GitHub Actions", "Python", "CloudWatch", "VPC", "IAM"],
                weightage={
                    "Docker": 0.9, "Kubernetes": 1.0, "Jenkins": 0.7, "Terraform": 1.0,
                    "GitHub Actions": 0.8, "Python": 0.8, "CloudWatch": 0.6, "VPC": 0.7, "IAM": 0.8
                },
                recommended_certifications=["AWS DevOps Engineer Professional", "Certified Kubernetes Administrator (CKA)", "HashiCorp Certified: Terraform Associate"]
            ),
            JobRole(
                title="Solutions Architect",
                description="Designs highly-available, fault-tolerant, secure, and cost-efficient cloud architectures. Translates business requirements into cloud solutions blueprints.",
                difficulty="Advanced",
                required_skills=["EC2", "S3", "RDS", "VPC", "Route53", "IAM", "CloudWatch", "API Gateway", "DynamoDB", "Terraform"],
                weightage={
                    "EC2": 0.9, "S3": 0.9, "RDS": 0.8, "VPC": 1.0, "Route53": 0.7,
                    "IAM": 1.0, "CloudWatch": 0.7, "API Gateway": 0.7, "DynamoDB": 0.8, "Terraform": 0.8
                },
                recommended_certifications=["AWS Solutions Architect Associate", "AWS Solutions Architect Professional", "Microsoft Certified: Azure Solutions Architect Expert"]
            ),
            JobRole(
                title="Cloud Security Engineer",
                description="Implements security controls, audits configurations, manages user identities and access, and monitors cloud services for security threats.",
                difficulty="Advanced",
                required_skills=["IAM", "VPC", "CloudWatch", "Route53", "Docker", "Kubernetes", "EKS", "EC2"],
                weightage={
                    "IAM": 1.0, "VPC": 0.9, "CloudWatch": 0.8, "Route53": 0.6,
                    "Docker": 0.6, "Kubernetes": 0.7, "EKS": 0.8, "EC2": 0.6
                },
                recommended_certifications=["AWS Solutions Architect Associate", "AWS Certified Security - Specialty"]
            ),
            JobRole(
                title="Site Reliability Engineer (SRE)",
                description="Applies software engineering practices to infrastructure operations problems. Focuses on system uptime, error budgets, automated responses, and monitoring.",
                difficulty="Advanced",
                required_skills=["Python", "Docker", "Kubernetes", "Terraform", "GitHub Actions", "CloudWatch", "VPC", "Lambda"],
                weightage={
                    "Python": 1.0, "Docker": 0.9, "Kubernetes": 1.0, "Terraform": 0.8,
                    "GitHub Actions": 0.7, "CloudWatch": 0.9, "VPC": 0.8, "Lambda": 0.7
                },
                recommended_certifications=["Certified Kubernetes Administrator (CKA)", "AWS SysOps Administrator Associate", "AWS DevOps Engineer Professional"]
            ),
            JobRole(
                title="Data Engineer",
                description="Designs, builds, and manages pipelines that extract, transform, and load (ETL) data into database systems, object storage, and analytics data warehouses.",
                difficulty="Intermediate",
                required_skills=["Python", "SQL", "BigQuery", "DynamoDB", "RDS", "S3", "Cloud Storage", "Blob Storage"],
                weightage={
                    "Python": 1.0, "SQL": 1.0, "BigQuery": 0.9, "DynamoDB": 0.7,
                    "RDS": 0.8, "S3": 0.8, "Cloud Storage": 0.7, "Blob Storage": 0.6
                },
                recommended_certifications=["Google Professional Data Engineer", "AWS Certified Data Analytics - Specialty"]
            )
        ]
        for role in roles_data:
            db.add(role)
        db.commit()
        print("Seeded Job Roles successfully.")

    # 4. Seed Interview Questions
    existing_questions = db.query(InterviewQuestion).count()
    if existing_questions == 0:
        questions_data = [
            # AWS Lambda
            ("AWS Lambda", "What is AWS Lambda?", "AWS Lambda is a serverless event-driven compute service that lets you run code for virtually any type of application or backend service without provisioning or managing servers. You simply upload your code, and Lambda takes care of everything required to run and scale it with high availability.", "Easy"),
            ("AWS Lambda", "What is the difference between AWS Lambda and Amazon EC2?", "EC2 is an Infrastructure as a Service (IaaS) offering that provides virtual servers that you must configure, patch, and scale yourself. Lambda is a Function as a Service (FaaS) serverless offering. Lambda scales automatically and charges only for the exact milliseconds your code runs, removing OS administration overhead.", "Medium"),
            ("AWS Lambda", "Explain AWS Lambda execution limits and how you handle cold starts.", "Lambda functions have limits: a 15-minute maximum timeout, up to 10GB of memory, and concurrency quotas (default 1,000 per region). A cold start happens when Lambda spins up a new container instance to run your function, adding latency. We mitigate this using Provisioned Concurrency, choosing lighter runtimes (Python/Node vs Java), or keeping dependencies minimal.", "Hard"),
            
            # Docker
            ("Docker", "What is Docker?", "Docker is an open-source platform that automates the deployment of applications inside lightweight, portable containers. Containers bundle an application's code, runtime, system tools, and libraries so it runs consistently on any machine.", "Easy"),
            ("Docker", "What is the difference between a Docker Image and a Docker Container?", "A Docker Image is a read-only template with instructions for creating a Docker container. A Docker Container is a running, writeable instance of an image. You can run multiple containers from a single image.", "Easy"),
            ("Docker", "How do you optimize a Dockerfile to reduce build times and image sizes?", "We optimize images by: using small base images (like Alpine or distroless), leveraging multi-stage builds to keep build tools out of final packages, ordering steps to maximize docker layer caching (placing static steps at top, changing files like source code at the bottom), and minimizing run layers (chaining commands with &&).", "Hard"),

            # Kubernetes
            ("Kubernetes", "What is Kubernetes?", "Kubernetes (K8s) is an open-source container orchestration platform that automates the deployment, scaling, management, and networking of containerized applications across clusters of host machines.", "Easy"),
            ("Kubernetes", "What is a Kubernetes Pod?", "A Pod is the smallest deployable unit in Kubernetes. It represents a single instance of a running process in your cluster and can contain one or more tightly coupled containers that share storage, network resources, and specifications.", "Easy"),
            ("Kubernetes", "Explain the difference between a Deployment, a ReplicaSet, and a StatefulSet.", "A Deployment provides declarative updates for Pods and ReplicaSets. A ReplicaSet ensures that a specified number of pod replicas are running at any given time. A StatefulSet manages stateful pods, assigning a unique, persistent identity and stable storage volume mapping to each pod.", "Medium"),
            ("Kubernetes", "How does a Kubernetes Service discovery mechanism work?", "Kubernetes assigns each Service a stable IP address (ClusterIP) and DNS name. Inside the cluster, the DNS service resolves the Service name. CoreDNS keeps track of active pods selected by the Service's selector rules. kube-proxy updates iptables/IPVS rules on each node to forward traffic to pod endpoints.", "Hard"),

            # Terraform
            ("Terraform", "What is Terraform?", "Terraform is an open-source Infrastructure as Code (IaC) tool created by HashiCorp. It allows developers to define cloud and on-premise resources in human-readable, declarative configuration files using HashiCorp Configuration Language (HCL).", "Easy"),
            ("Terraform", "What is the purpose of the Terraform state file?", "The state file (terraform.tfstate) records the mapping of resources defined in your code to real-world infrastructure instances. It is used to calculate change diffs, track resource dependencies, and improve performance when applying modifications.", "Medium"),
            ("Terraform", "How do you handle secrets and collaborative state locks in production Terraform environments?", "For collaboration, we store state files in remote backends (like AWS S3) and use a state locking service (like DynamoDB) to prevent concurrent executions. For secrets, we avoid hardcoding them, instead loading them via environment variables (TF_VAR_xxxx), CLI input files, or integrating secret stores like AWS Secrets Manager or HashiCorp Vault.", "Hard"),

            # Python
            ("Python", "What makes Python suitable for DevOps and Cloud Engineering?", "Python is highly readable, contains a vast ecosystem of standard packages, and is pre-installed on most Linux environments. Libraries like Boto3 (AWS SDK) or subprocess make scripting API integrations, automating backups, and writing deployment scripts very straightforward.", "Easy"),
            ("Python", "Explain the difference between multithreading and multiprocessing in Python.", "Python's Global Interpreter Lock (GIL) permits only one thread to execute Python bytecode at a time, making multithreading ideal for I/O-bound tasks (network requests, disk writes). Multiprocessing spawns separate OS processes with unique memory spaces, bypassing the GIL to utilize multiple CPU cores for CPU-bound computations.", "Medium"),
            
            # S3
            ("S3", "What is Amazon S3?", "Amazon Simple Storage Service (S3) is an object storage service offering industry-leading scalability, data availability, security, and performance. You store data in containers called buckets, which contain files (objects).", "Easy"),
            ("S3", "Explain S3 Storage Classes and lifecycle management policies.", "S3 offers classes like Standard (frequent access), IA (infrequent access), Glacier Flexible (archives), and Intelligent-Tiering. Lifecycle policies automate transitioning objects to cheaper storage classes based on age, or deleting old object versions to minimize costs.", "Medium")
        ]
        for skill_name, q, a, diff in questions_data:
            question_obj = InterviewQuestion(skill_name=skill_name, question=q, answer=a, difficulty=diff)
            db.add(question_obj)
        db.commit()
        print("Seeded Interview Questions successfully.")
