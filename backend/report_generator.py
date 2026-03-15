"""
LearnLens PDF Report Generator
Generates comprehensive academic performance reports with charts.
"""
import io
import logging
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    Image as RLImage, PageBreak, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from datetime import datetime

logger = logging.getLogger(__name__)

# Brand colors
DARK = HexColor("#1a2332")
BLUE = HexColor("#4A90D9")
PALE_BLUE = HexColor("#E8F0FE")
GREEN = HexColor("#10B981")
RED = HexColor("#EF4444")
ORANGE = HexColor("#F59E0B")
GRAY = HexColor("#64748B")
LIGHT_GRAY = HexColor("#F1F5F9")


def generate_bar_chart(subjects, marks):
    """Generate a subject-wise marks bar chart."""
    fig, ax = plt.subplots(figsize=(7, 3.5))
    
    colors = []
    for m in marks:
        if m >= 80:
            colors.append('#10B981')
        elif m >= 60:
            colors.append('#4A90D9')
        elif m >= 50:
            colors.append('#F59E0B')
        else:
            colors.append('#EF4444')
    
    # Truncate long subject names
    short_names = [s[:12] + '...' if len(s) > 12 else s for s in subjects]
    
    bars = ax.barh(short_names, marks, color=colors, height=0.6, edgecolor='white', linewidth=0.5)
    
    for bar, mark in zip(bars, marks):
        ax.text(bar.get_width() + 1, bar.get_y() + bar.get_height()/2,
                f'{mark}', va='center', fontsize=9, fontweight='bold', color='#1a2332')
    
    ax.set_xlim(0, 110)
    ax.set_xlabel('Marks', fontsize=10, color='#64748B')
    ax.set_title('Subject-wise Performance', fontsize=13, fontweight='bold', color='#1a2332', pad=15)
    ax.axvline(x=60, color='#EF4444', linestyle='--', alpha=0.3, label='Pass Line (60)')
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['bottom'].set_color('#E2E8F0')
    ax.spines['left'].set_color('#E2E8F0')
    ax.tick_params(colors='#64748B')
    ax.legend(fontsize=8, loc='lower right')
    
    plt.tight_layout()
    buf = io.BytesIO()
    fig.savefig(buf, format='png', dpi=150, bbox_inches='tight', facecolor='white')
    plt.close(fig)
    buf.seek(0)
    return buf


def generate_performance_pie(subjects, marks):
    """Generate a pie chart showing performance distribution."""
    fig, ax = plt.subplots(figsize=(4, 3.5))
    
    strong = sum(1 for m in marks if m >= 75)
    avg = sum(1 for m in marks if 50 <= m < 75)
    weak = sum(1 for m in marks if m < 50)
    
    sizes = [strong, avg, weak]
    labels = [f'Strong ({strong})', f'Average ({avg})', f'Weak ({weak})']
    colors_pie = ['#10B981', '#4A90D9', '#EF4444']
    explode = (0.05, 0.02, 0.05)
    
    # Filter out zero categories
    filtered = [(s, l, c, e) for s, l, c, e in zip(sizes, labels, colors_pie, explode) if s > 0]
    if not filtered:
        plt.close(fig)
        return None
    
    sizes, labels, colors_pie, explode = zip(*filtered)
    
    wedges, texts, autotexts = ax.pie(sizes, explode=explode, labels=labels, colors=colors_pie,
                                       autopct='%1.0f%%', startangle=90, textprops={'fontsize': 9})
    for t in autotexts:
        t.set_fontweight('bold')
        t.set_color('white')
    
    ax.set_title('Performance Distribution', fontsize=12, fontweight='bold', color='#1a2332', pad=10)
    plt.tight_layout()
    
    buf = io.BytesIO()
    fig.savefig(buf, format='png', dpi=150, bbox_inches='tight', facecolor='white')
    plt.close(fig)
    buf.seek(0)
    return buf


def generate_report_pdf(analysis_data, filename="report"):
    """
    Generates a comprehensive PDF report from analysis data.
    Returns a BytesIO buffer containing the PDF.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=50,
        leftMargin=50,
        topMargin=40,
        bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle', parent=styles['Title'],
        fontSize=26, textColor=DARK, spaceAfter=6,
        fontName='Helvetica-Bold', alignment=TA_CENTER
    )
    subtitle_style = ParagraphStyle(
        'CustomSubtitle', parent=styles['Normal'],
        fontSize=10, textColor=GRAY, spaceAfter=20,
        fontName='Helvetica', alignment=TA_CENTER,
        leading=14
    )
    heading_style = ParagraphStyle(
        'CustomHeading', parent=styles['Heading2'],
        fontSize=16, textColor=DARK, spaceBefore=20, spaceAfter=10,
        fontName='Helvetica-Bold', borderColor=BLUE, borderWidth=0,
        leftIndent=0
    )
    body_style = ParagraphStyle(
        'CustomBody', parent=styles['Normal'],
        fontSize=11, textColor=HexColor("#334155"), leading=16,
        fontName='Helvetica', spaceAfter=6
    )
    highlight_style = ParagraphStyle(
        'Highlight', parent=styles['Normal'],
        fontSize=11, textColor=BLUE, fontName='Helvetica-Bold',
        spaceAfter=4
    )
    
    elements = []
    
    subjects = analysis_data.get('subjects', [])
    marks = analysis_data.get('marks', [])
    weak_subjects = analysis_data.get('weak_subjects', [])
    avg_pct = analysis_data.get('average_percentage', 'N/A')
    trend = analysis_data.get('performance_trend', 'N/A')
    prediction = analysis_data.get('predicted_next_exam_score', 'N/A')
    study_plan = analysis_data.get('study_plan', [])
    recommendations = analysis_data.get('recommendations', [])
    
    avg_num = 0
    try:
        avg_num = float(str(avg_pct).replace('%', ''))
    except:
        pass
    
    # --- HEADER ---
    elements.append(Spacer(1, 10))
    elements.append(HRFlowable(width="100%", thickness=3, color=BLUE, spaceAfter=15))
    elements.append(Paragraph("LearnLens", title_style))
    elements.append(Paragraph("Academic Performance Report", ParagraphStyle(
        'Sub', parent=subtitle_style, fontSize=14, textColor=BLUE, fontName='Helvetica-Bold', spaceAfter=4
    )))
    elements.append(Paragraph(
        f"Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')} &bull; Powered by Gemini AI",
        subtitle_style
    ))
    elements.append(HRFlowable(width="100%", thickness=1, color=LIGHT_GRAY, spaceAfter=20))
    
    # --- 1. PERFORMANCE OVERVIEW ---
    elements.append(Paragraph("📊 Performance Overview", heading_style))
    
    # Stats cards as table
    if avg_num >= 75:
        perf_label = "Excellent"
        perf_color = GREEN
    elif avg_num >= 60:
        perf_label = "Good"
        perf_color = BLUE
    elif avg_num >= 50:
        perf_label = "Average"
        perf_color = ORANGE
    else:
        perf_label = "Needs Improvement"
        perf_color = RED
    
    best_subject = ""
    best_marks = 0
    if subjects and marks:
        best_idx = marks.index(max(marks))
        best_subject = subjects[best_idx]
        best_marks = marks[best_idx]
    
    stats_data = [
        ['Average Score', 'Total Subjects', 'Performance', 'Best Subject'],
        [
            Paragraph(f'<font size="18" color="{BLUE.hexval()}">{avg_pct}</font>', styles['Normal']),
            Paragraph(f'<font size="18" color="{DARK.hexval()}">{len(subjects)}</font>', styles['Normal']),
            Paragraph(f'<font size="14" color="{perf_color.hexval()}">{perf_label}</font>', styles['Normal']),
            Paragraph(f'<font size="11" color="{DARK.hexval()}">{best_subject}<br/><font color="{GREEN.hexval()}">{best_marks} marks</font></font>', styles['Normal']),
        ]
    ]
    
    stats_table = Table(stats_data, colWidths=[doc.width/4]*4)
    stats_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PALE_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), DARK),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 1), (-1, -1), white),
        ('BOX', (0, 0), (-1, -1), 1, LIGHT_GRAY),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, LIGHT_GRAY),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(stats_table)
    elements.append(Spacer(1, 15))
    
    # --- 2. SUBJECT ANALYSIS TABLE ---
    elements.append(Paragraph("📋 Subject Analysis", heading_style))
    
    table_header = ['#', 'Subject', 'Marks', 'Grade', 'Status']
    table_data = [table_header]
    
    for i, (subj, mark) in enumerate(zip(subjects, marks)):
        grade = 'O' if mark >= 90 else 'A+' if mark >= 80 else 'A' if mark >= 70 else 'B' if mark >= 60 else 'C' if mark >= 50 else 'F'
        status = '🟢 Strong' if mark >= 75 else '🟡 Average' if mark >= 50 else '🔴 Weak'
        table_data.append([str(i+1), subj, str(mark), grade, status])
    
    subj_table = Table(table_data, colWidths=[30, doc.width*0.35, 60, 50, doc.width*0.2])
    subj_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DARK),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('ALIGN', (1, 1), (1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, LIGHT_GRAY]),
        ('BOX', (0, 0), (-1, -1), 1, LIGHT_GRAY),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, LIGHT_GRAY),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(subj_table)
    elements.append(Spacer(1, 15))
    
    # --- 3. CHARTS ---
    elements.append(Paragraph("📈 Visual Analytics", heading_style))
    
    if subjects and marks:
        # Bar Chart
        bar_buf = generate_bar_chart(subjects, marks)
        bar_img = RLImage(bar_buf, width=6.5*inch, height=3.2*inch)
        elements.append(bar_img)
        elements.append(Spacer(1, 10))
        
        # Pie Chart
        pie_buf = generate_performance_pie(subjects, marks)
        if pie_buf:
            pie_img = RLImage(pie_buf, width=4*inch, height=3.2*inch)
            elements.append(pie_img)
    
    elements.append(Spacer(1, 10))
    
    # --- 4. WEAK SUBJECTS ---
    if weak_subjects:
        elements.append(Paragraph("⚠️ Weak Subjects (Below 60)", heading_style))
        for ws in weak_subjects:
            elements.append(Paragraph(f"  •  <font color='{RED.hexval()}'><b>{ws}</b></font> — Needs focused attention", body_style))
        elements.append(Spacer(1, 10))
    
    # --- 5. PREDICTIONS ---
    elements.append(Paragraph("🔮 Predictions", heading_style))
    elements.append(Paragraph(f"<b>Performance Trend:</b> {trend}", body_style))
    elements.append(Paragraph(f"<b>Predicted Next Exam Score:</b> <font color='{BLUE.hexval()}'>{prediction}</font>", body_style))
    elements.append(Spacer(1, 10))
    
    # --- 6. AI STUDY PLAN ---
    elements.append(Paragraph("📚 AI-Generated Study Plan", heading_style))
    for i, tip in enumerate(study_plan, 1):
        elements.append(Paragraph(f"<b>{i}.</b> {tip}", body_style))
    elements.append(Spacer(1, 10))
    
    # --- 7. RECOMMENDATIONS ---
    elements.append(Paragraph("💡 Recommendations", heading_style))
    for rec in recommendations:
        elements.append(Paragraph(f"  ✦  {rec}", body_style))
    elements.append(Spacer(1, 15))
    
    # --- FOOTER ---
    elements.append(HRFlowable(width="100%", thickness=1, color=LIGHT_GRAY, spaceBefore=20, spaceAfter=10))
    elements.append(Paragraph(
        "This report was generated by <b>LearnLens AI</b> — Your intelligent academic companion. "
        "Data analyzed using Google Gemini Flash.",
        ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=GRAY,
                       alignment=TA_CENTER, leading=12)
    ))
    
    doc.build(elements)
    buffer.seek(0)
    return buffer
