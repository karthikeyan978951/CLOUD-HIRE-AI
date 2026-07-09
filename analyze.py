import io
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

from app.database import get_db
from app.models import User, Resume, JobRole, Report, Roadmap
from app.schemas import ReportCreateRequest, ReportResponse, ResumeQualityResponse
from app.auth import get_current_user, get_current_user_for_download
from app.analyzer import analyze_resume_match, evaluate_resume_quality
from app.roadmap import generate_personalized_roadmap

router = APIRouter(prefix="/analyze", tags=["Analysis"])

@router.post("", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def run_analysis(request: ReportCreateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 1. Fetch Resume and Job Role
    resume = db.query(Resume).filter(Resume.id == request.resume_id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
        
    if resume.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
    job_role = db.query(JobRole).filter(JobRole.id == request.job_role_id).first()
    if not job_role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job Role not found")
        
    # 2. Execute matching calculations
    analysis_result = analyze_resume_match(resume.parsed_content, job_role)
    
    # 3. Check if report already exists for this resume and job role
    existing_report = db.query(Report).filter(
        Report.resume_id == resume.id,
        Report.job_role_id == job_role.id
    ).first()
    
    if existing_report:
        existing_report.scores = analysis_result["scores"]
        existing_report.gap_analysis = analysis_result["gap_analysis"]
        db.commit()
        db.refresh(existing_report)
        report = existing_report
    else:
        report = Report(
            user_id=current_user.id,
            resume_id=resume.id,
            job_role_id=job_role.id,
            scores=analysis_result["scores"],
            gap_analysis=analysis_result["gap_analysis"]
        )
        db.add(report)
        db.commit()
        db.refresh(report)

    # 4. Simultaneously generate learning roadmap
    roadmap_data = generate_personalized_roadmap(
        analysis_result["gap_analysis"]["missing"], 
        job_role.title
    )
    
    # Save/update Roadmap
    existing_roadmap = db.query(Roadmap).filter(
        Roadmap.resume_id == resume.id,
        Roadmap.job_role_id == job_role.id
    ).first()
    
    if existing_roadmap:
        existing_roadmap.roadmap_data = roadmap_data
        db.commit()
    else:
        new_roadmap = Roadmap(
            user_id=current_user.id,
            resume_id=resume.id,
            job_role_id=job_role.id,
            roadmap_data=roadmap_data
        )
        db.add(new_roadmap)
        db.commit()

    # Wrap schema response manually because job_role_title is queried
    return {
        "id": report.id,
        "user_id": report.user_id,
        "resume_id": report.resume_id,
        "job_role_id": report.job_role_id,
        "job_role_title": job_role.title,
        "scores": report.scores,
        "gap_analysis": report.gap_analysis,
        "created_at": report.created_at
    }

@router.get("/report/{report_id}", response_model=ReportResponse)
def get_report(report_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
        
    if report.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
    return {
        "id": report.id,
        "user_id": report.user_id,
        "resume_id": report.resume_id,
        "job_role_id": report.job_role_id,
        "job_role_title": report.job_role.title,
        "scores": report.scores,
        "gap_analysis": report.gap_analysis,
        "created_at": report.created_at
    }

@router.get("/list", response_model=List[ReportResponse])
def list_reports(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    reports = db.query(Report).filter(Report.user_id == current_user.id).order_by(Report.created_at.desc()).all()
    results = []
    for r in reports:
        results.append({
            "id": r.id,
            "user_id": r.user_id,
            "resume_id": r.resume_id,
            "job_role_id": r.job_role_id,
            "job_role_title": r.job_role.title,
            "scores": r.scores,
            "gap_analysis": r.gap_analysis,
            "created_at": r.created_at
        })
    return results

@router.get("/report/{report_id}/download")
def download_pdf_report(report_id: int, current_user: User = Depends(get_current_user_for_download), db: Session = Depends(get_db)):
    # 1. Load report, resume, and roadmap details
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
        
    if report.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
    resume = report.resume
    roadmap = db.query(Roadmap).filter(
        Roadmap.resume_id == resume.id,
        Roadmap.job_role_id == report.job_role_id
    ).first()

    # 2. Build PDF in memory using ReportLab
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=letter,
        rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Palette and Typography styles
    primary_color = colors.HexColor("#1A365D")   # Deep Corporate Navy
    secondary_color = colors.HexColor("#2B6CB0") # Slate Blue
    dark_neutral = colors.HexColor("#2D3748")    # Charcoal Text
    light_bg = colors.HexColor("#EDF2F7")        # Cool Grey
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        textColor=primary_color,
        spaceAfter=15,
        alignment=TA_LEFT
    )
    
    h2_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=15,
        textColor=primary_color,
        spaceBefore=15,
        spaceAfter=8,
        borderPadding=2
    )

    body_style = ParagraphStyle(
        'ReportBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        textColor=dark_neutral,
        spaceAfter=6,
        leading=14
    )

    header_style = ParagraphStyle(
        'TableHeader',
        fontName='Helvetica-Bold',
        fontSize=10,
        textColor=colors.white,
        alignment=TA_LEFT
    )

    story = []
    
    # --- Header Block ---
    story.append(Paragraph("CLOUDHIRE AI — RESUME SKILL AUDIT", title_style))
    story.append(Paragraph(f"<b>Candidate:</b> {resume.parsed_content.get('name', 'N/A')}", body_style))
    story.append(Paragraph(f"<b>Email:</b> {resume.parsed_content.get('email', 'N/A')} | <b>Phone:</b> {resume.parsed_content.get('phone', 'N/A')}", body_style))
    story.append(Paragraph(f"<b>Target Cloud Role:</b> {report.job_role.title} (Level: {report.job_role.difficulty})", body_style))
    story.append(Paragraph(f"<b>Date of Evaluation:</b> {report.created_at.strftime('%B %d, %Y')}", body_style))
    story.append(Spacer(1, 15))
    
    # --- Scores Matrix Table ---
    story.append(Paragraph("Evaluation Scorecard", h2_style))
    scores = report.scores
    table_data = [
        [Paragraph("Category Metric", header_style), Paragraph("Score", ParagraphStyle('ThRight', fontName='Helvetica-Bold', textColor=colors.white, alignment=TA_RIGHT))],
        [Paragraph("Skill Overlap Match Score", body_style), Paragraph(f"{scores.get('skill_match_score')}%", ParagraphStyle('TbRight', alignment=TA_RIGHT))],
        [Paragraph("Project Context Relevance", body_style), Paragraph(f"{scores.get('project_score')}%", ParagraphStyle('TbRight', alignment=TA_RIGHT))],
        [Paragraph("Certifications Match Score", body_style), Paragraph(f"{scores.get('certification_score')}%", ParagraphStyle('TbRight', alignment=TA_RIGHT))],
        [Paragraph("Experience Requirement Match", body_style), Paragraph(f"{scores.get('experience_score')}%", ParagraphStyle('TbRight', alignment=TA_RIGHT))],
        [Paragraph("<b>OVERALL MATCH SCORE</b>", ParagraphStyle('BodyBold', parent=body_style, fontName='Helvetica-Bold')), 
         Paragraph(f"<b>{scores.get('overall_score')}%</b>", ParagraphStyle('TbRightB', fontName='Helvetica-Bold', alignment=TA_RIGHT))]
    ]
    
    score_table = Table(table_data, colWidths=[380, 160])
    score_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('ALIGN', (1,1), (-1,-1), 'RIGHT'),
        ('BOTTOMPADDING', (0,0), (-1,0), 6),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, light_bg]),
        ('GRID', (0,0), (-1,-1), 0.5, colors.lightgrey),
        ('BOTTOMPADDING', (0,1), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(score_table)
    story.append(Spacer(1, 15))

    # --- Strengths and Missing Skills ---
    story.append(Paragraph("Skill Alignment Analysis", h2_style))
    strengths_list = ", ".join(report.gap_analysis.get("strengths", [])) or "None detected"
    missing_list = ", ".join(report.gap_analysis.get("missing", [])) or "None (100% matched!)"
    
    story.append(Paragraph(f"<b>Key Strengths Found:</b> {strengths_list}", body_style))
    story.append(Paragraph(f"<b>Missing Target Skills:</b> {missing_list}", body_style))
    story.append(Spacer(1, 15))

    # --- Gap Analysis Priority ---
    story.append(Paragraph("Skill Gap Priority Breakdown", h2_style))
    gap_details = report.gap_analysis.get("details", [])
    
    gap_table_data = [[
        Paragraph("Skill", header_style), 
        Paragraph("Status", header_style), 
        Paragraph("Priority Urgency", header_style)
    ]]
    for item in gap_details:
        status_text = f"<font color='green'><b>{item.get('status')}</b></font>" if item.get('status') == 'Matched' else f"<font color='red'><b>{item.get('status')}</b></font>"
        prio = item.get('priority', 'None')
        prio_text = prio
        if prio == "High":
            prio_text = "<font color='red'><b>High</b></font>"
        elif prio == "Medium":
            prio_text = "<font color='orange'><b>Medium</b></font>"
            
        gap_table_data.append([
            Paragraph(item.get("skill"), body_style),
            Paragraph(status_text, body_style),
            Paragraph(prio_text, body_style)
        ])
        
    gap_table = Table(gap_table_data, colWidths=[220, 160, 160])
    gap_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), secondary_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, light_bg]),
        ('GRID', (0,0), (-1,-1), 0.5, colors.lightgrey),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(gap_table)
    
    # --- Learning Roadmap (Second Page if applicable) ---
    if roadmap:
        story.append(PageBreak())
        story.append(Paragraph("PERSONALIZED CLOUD TRAINING ROADMAP", title_style))
        story.append(Paragraph(f"Target Role: {roadmap.roadmap_data.get('job_role')}", body_style))
        story.append(Paragraph("The following week-by-week curriculum focuses specifically on bridging your detected cloud skill gaps.", body_style))
        story.append(Spacer(1, 10))
        
        schedule = roadmap.roadmap_data.get("schedule", {})
        for week_num, info in schedule.items():
            week_story = []
            week_story.append(Paragraph(f"<b>{week_num}: {info.get('title')}</b>", h2_style))
            week_story.append(Paragraph(f"<b>Focus Tool:</b> {info.get('focus')}", body_style))
            
            topics = info.get("topics", [])
            topics_html = "".join([f"<li>{topic}</li>" for topic in topics])
            week_story.append(Paragraph(f"<b>Key Concepts:</b><br/><ul>{topics_html}</ul>", body_style))
            week_story.append(Paragraph(f"<b>Hands-On Practice Lab:</b> {info.get('lab')}", body_style))
            week_story.append(Spacer(1, 10))
            story.append(KeepTogether(week_story))

    # --- Build Document ---
    doc.build(story)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer, 
        media_type="application/pdf", 
        headers={"Content-Disposition": f"attachment; filename=CloudHire_Report_{report_id}.pdf"}
    )

@router.post("/quick-quality-check/{resume_id}", response_model=ResumeQualityResponse, status_code=status.HTTP_200_OK)
def evaluate_resume_quality_endpoint(
    resume_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """
    Quickly evaluates a resume for quality without requiring a job role.
    Returns quality rating (Excellent/Good/Average/Poor), score, suggestions, and company alignment.
    """
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
        
    if resume.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    # Evaluate resume quality
    quality_result = evaluate_resume_quality(resume.parsed_content)
    
    return quality_result
