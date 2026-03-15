# LearnLens - AI Academic Analysis Backend

This is the backend system for LearnLens, responsible for extracting marks from mark sheets (PDFs and Images) and providing AI-driven analysis using Google Gemini 1.5 Flash.

## Prerequisites

1.  **Python 3.8+**
2.  **Tesseract OCR**: You must have Tesseract OCR installed on your system.
    *   **Windows**: Download and install from [UB Mannheim](https://github.com/UB-Mannheim/tesseract/wiki). Note the installation path (usually `C:\Program Files\Tesseract-OCR\tesseract.exe`).
    *   **Linux**: `sudo apt install tesseract-ocr`
3.  **Google Gemini API Key**: Get it from the [Google AI Studio](https://aistudio.google.com/).

## Setup Instructions

1.  **Create a Virtual Environment**:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Configure Environment Variables**:
    *   Copy `.env.example` to `.env`:
        ```bash
        cp .env.example .env
        ```
    *   Edit `.env` and add your `GEMINI_API_KEY`.
    *   If Tesseract is not in your system PATH, add its path to `TESSERACT_PATH` in `.env`.

## Running the Server

Start the FastAPI server using uvicorn:

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.
You can view the interactive documentation at `http://localhost:8000/docs`.

## API Endpoint: `/analyze-marks`

- **Method**: `POST`
- **Body**: `multipart/form-data`
- **Field**: `file` (PDF, PNG, JPG)

### Sample Output Response

```json
{
  "filename": "marksheet.pdf",
  "analysis": {
    "subjects": ["Mathematics", "Physics", "Chemistry"],
    "marks": [85, 62, 78],
    "weak_subjects": ["Physics"],
    "average_percentage": "75%",
    "performance_trend": "Improving",
    "predicted_next_exam_score": "80-82%",
    "study_plan": [
      "Dedicate 2 hours daily to Physics mechanics",
      "Solve previous year Math papers"
    ],
    "recommendations": [
      "Join a Chemistry study group",
      "Focus on concept clarity in Physics"
    ]
  }
}
```
