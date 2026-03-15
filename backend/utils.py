import os
import io
import pdfplumber
import pytesseract
from PIL import Image
import google.generativeai as genai
from dotenv import load_dotenv
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_gemini_api_key():
    """Dynamically loads the API key from environment."""
    load_dotenv(override=True)
    key = os.getenv("GEMINI_API_KEY")
    if not key or "your_" in key:
        logger.error("❌ CRITICAL: GEMINI_API_KEY is missing or is still a placeholder in .env !")
        return None
    return key

# Initial config
api_key = get_gemini_api_key()
if api_key:
    genai.configure(api_key=api_key)
    logger.info("✅ Gemini API Initialized.")

# Configure Tesseract path
tesseract_path = os.getenv("TESSERACT_PATH")
if tesseract_path:
    pytesseract.pytesseract.tesseract_cmd = tesseract_path
else:
    # Try common Windows installation paths if TESSERACT_PATH is not set
    common_paths = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        os.path.expanduser(r"~\AppData\Local\Tesseract-OCR\tesseract.exe")
    ]
    for p in common_paths:
        if os.path.exists(p):
            pytesseract.pytesseract.tesseract_cmd = p
            logger.info(f"Auto-detected Tesseract at: {p}")
            break

def extract_text_from_pdf(file_bytes):
    """Extracts text from a PDF file using pdfplumber."""
    text = ""
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text.strip()
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        return None

def extract_text_from_image(file_bytes):
    """Extracts text from an image file using OCR (pytesseract)."""
    try:
        image = Image.open(io.BytesIO(file_bytes))
        text = pytesseract.image_to_string(image)
        return text.strip()
    except Exception as e:
        logger.error(f"Error extracting text from image: {e}")
        # Optionally print to console for visibility if logger is not configured for console
        print(f"OCR ERROR: {e}")
        return None

def analyze_with_gemini(extracted_text=None, image_bytes=None, mime_type=None):
    """
    Analyzes academic data using Gemini 2.0 Flash.
    Supports either extracted text or direct image input (Multimodal).
    """
    import base64
    import time
    
    # Force refresh API key from .env
    current_key = get_gemini_api_key()
    if not current_key:
        return {"error": "GEMINI_API_KEY not configured correctly in .env"}
    
    genai.configure(api_key=current_key)

    prompt = """Analyze this academic marksheet. Return ONLY raw JSON (no markdown):
{"subjects":["Name1","Name2"],"marks":[78,85],"weak_subjects":["Low scoring subject"],"average_percentage":"75%","performance_trend":"Stable","predicted_next_exam_score":"78%","study_plan":["Tip 1","Tip 2"],"recommendations":["Rec 1","Rec 2"]}
Extract all subjects and marks. Weak = below 60. Include study plan and predictions."""

    model_names = ["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-flash-latest"]
    
    for model_name in model_names:
        try:
            logger.info(f"Trying model: {model_name}")
            model = genai.GenerativeModel(model_name)
            
            if image_bytes and mime_type:
                logger.info("Sending image directly to Gemini Vision...")
                # Use PIL to create a proper image object for the SDK
                image = Image.open(io.BytesIO(image_bytes))
                response = model.generate_content([prompt, image])
            else:
                logger.info("Sending extracted text to Gemini...")
                response = model.generate_content(f"{prompt}\n\nExtracted Text:\n{extracted_text}")
            
            result_text = response.text.strip()
            logger.info(f"Raw Gemini response (first 200 chars): {result_text[:200]}")
            
            # Clean up common AI markdown output
            if result_text.startswith("```json"):
                result_text = result_text.replace("```json", "", 1).rsplit("```", 1)[0].strip()
            elif result_text.startswith("```"):
                result_text = result_text.replace("```", "", 1).rsplit("```", 1)[0].strip()
                
            parsed = json.loads(result_text)
            logger.info(f"✅ Analysis successful with model: {model_name}")
            return parsed
            
        except Exception as e:
            error_str = str(e)
            logger.error(f"Model {model_name} failed: {error_str}")
            if "404" in error_str or "not found" in error_str.lower():
                logger.warning(f"Model {model_name} not available, trying next...")
                continue
            elif "429" in error_str or "quota" in error_str.lower():
                logger.warning("Rate limited, waiting 5 seconds...")
                time.sleep(5)
                continue
            else:
                return {"error": error_str}
    
    return {"error": "All model attempts failed. Please check your API key and try again."}
