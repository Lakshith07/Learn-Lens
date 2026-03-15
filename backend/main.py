from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from utils import extract_text_from_pdf, extract_text_from_image, analyze_with_gemini
from firebase_service import upload_file_to_storage, save_analysis_to_firestore, get_user_history
from report_generator import generate_report_pdf
import uvicorn
import logging
from typing import Optional
from pydantic import BaseModel
from typing import List

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="LearnLens Backend", description="AI Academic Performance Analysis System")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to LearnLens AI Analysis API"}

@app.get("/test-config")
async def test_config():
    from utils import get_gemini_api_key
    import google.generativeai as genai
    key = get_gemini_api_key()
    available_models = []
    if key:
        try:
            genai.configure(api_key=key)
            available_models = [m.name for m in genai.list_models() if "generateContent" in m.supported_generation_methods]
        except Exception as e:
            available_models = [f"Error listing models: {str(e)}"]
            
    return {
        "api_key_status": "Loaded" if key else "Missing",
        "key_preview": f"{key[:5]}...{key[-3:]}" if key and len(key) > 10 else "N/A",
        "available_models": available_models
    }

@app.post("/analyze-marks")
async def analyze_marks(
    file: UploadFile = File(...),
    user_id: Optional[str] = Form(None)
):
    """
    Endpoint to upload a PDF or image of academic marks and get AI-driven insights.
    Optionally stores results in Firebase if user_id is provided.
    """
    content_type = file.content_type
    file_bytes = await file.read()
    
    logger.info(f"Received file: {file.filename}, Content-Type: {content_type}, User: {user_id or 'anonymous'}")
    
    extracted_text = ""
    
    # 1. Detect file type and handle analysis
    if content_type == "application/pdf":
        logger.info("Processing PDF...")
        extracted_text = extract_text_from_pdf(file_bytes)
        if not extracted_text:
            raise HTTPException(status_code=422, detail="Failed to extract text from PDF.")
        analysis_result = analyze_with_gemini(extracted_text=extracted_text)
        
    elif content_type in ["image/png", "image/jpeg", "image/jpg"]:
        logger.info("Processing Image with Multimodal Vision...")
        analysis_result = analyze_with_gemini(image_bytes=file_bytes, mime_type=content_type)
        
    else:
        # Fallback for extensions
        filename = file.filename.lower()
        if filename.endswith(".pdf"):
            extracted_text = extract_text_from_pdf(file_bytes)
            analysis_result = analyze_with_gemini(extracted_text=extracted_text)
        elif filename.endswith((".png", ".jpg", ".jpeg")):
            mtype = "image/png" if filename.endswith(".png") else "image/jpeg"
            analysis_result = analyze_with_gemini(image_bytes=file_bytes, mime_type=mtype)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type.")

    if "error" in analysis_result:
        raise HTTPException(status_code=500, detail=f"AI Analysis failed: {analysis_result['error']}")

    # 2. Firebase Storage & Firestore (if user_id provided)
    file_url = None
    history_id = None
    
    if user_id:
        try:
            # Upload file to Firebase Storage
            file_url = upload_file_to_storage(
                file_bytes=file_bytes,
                filename=file.filename,
                content_type=content_type or "application/octet-stream",
                user_id=user_id
            )
            logger.info(f"📁 File URL: {file_url}")
            
            # Save analysis to Firestore
            history_id = save_analysis_to_firestore(
                user_id=user_id,
                file_url=file_url,
                filename=file.filename,
                analysis_result=analysis_result
            )
            logger.info(f"📝 History ID: {history_id}")
        except Exception as e:
            logger.error(f"Firebase operations failed (non-blocking): {e}")

    # 3. Return results
    return {
        "filename": file.filename,
        "analysis": analysis_result,
        "file_url": file_url,
        "history_id": history_id
    }

@app.get("/analysis-history/{user_id}")
async def get_analysis_history(user_id: str, limit: int = 20):
    """
    Retrieves analysis history for a specific user.
    Returns the most recent analyses first.
    """
    logger.info(f"Fetching history for user: {user_id}")
    
    history = get_user_history(user_id, limit=limit)
    
    return {
        "user_id": user_id,
        "count": len(history),
        "history": history
    }

class ReportData(BaseModel):
    subjects: List[str] = []
    marks: List[int] = []
    weak_subjects: List[str] = []
    average_percentage: str = "0%"
    performance_trend: str = "N/A"
    predicted_next_exam_score: str = "N/A"
    study_plan: List[str] = []
    recommendations: List[str] = []

@app.post("/generate-report")
async def generate_report(data: ReportData):
    """
    Generates a PDF report from analysis data sent by the frontend.
    """
    logger.info("Generating PDF report from submitted data...")
    
    analysis = data.model_dump()
    
    if not analysis.get('subjects'):
        raise HTTPException(status_code=400, detail="No analysis data provided.")
    
    try:
        pdf_buffer = generate_report_pdf(analysis)
        logger.info("✅ PDF report generated successfully.")
        
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=LearnLens_Insights_Report.pdf"
            }
        )
    except Exception as e:
        logger.error(f"❌ Report generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

@app.get("/download-report/{user_id}")
async def download_report(user_id: str):
    """
    Fetches latest analysis from Firestore and generates a PDF report.
    """
    logger.info(f"Generating report for user: {user_id}")
    
    history = get_user_history(user_id, limit=1)
    
    if not history:
        raise HTTPException(status_code=404, detail="No analysis history found. Upload a marksheet first.")
    
    latest = history[0]
    
    try:
        pdf_buffer = generate_report_pdf(latest)
        logger.info("✅ PDF report generated from Firestore data.")
        
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=LearnLens_Insights_Report.pdf"
            }
        )
    except Exception as e:
        logger.error(f"❌ Report generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

@app.delete("/delete-analysis/{doc_id}")
async def delete_analysis(doc_id: str):
    """
    Deletes an analysis record and its associated file.
    """
    from firebase_service import delete_analysis_from_firebase
    success = delete_analysis_from_firebase(doc_id)
    if success:
        return {"status": "success", "message": f"Record {doc_id} deleted."}
    else:
        raise HTTPException(status_code=500, detail="Failed to delete record.")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
