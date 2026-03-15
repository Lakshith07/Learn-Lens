"""
Firebase service module for LearnLens Backend.
Handles Firebase Storage (file uploads) and Firestore (analysis history).
"""
import os
import io
import json
import uuid
import logging
from datetime import datetime, timezone
from dotenv import load_dotenv

import firebase_admin
from firebase_admin import credentials, firestore, storage

logger = logging.getLogger(__name__)

# --- Firebase Initialization ---

_firebase_initialized = False

def init_firebase():
    """Initialize Firebase Admin SDK. Safe to call multiple times."""
    global _firebase_initialized
    if _firebase_initialized:
        return True
    
    load_dotenv(override=True)
    
    service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
    storage_bucket = os.getenv("FIREBASE_STORAGE_BUCKET", "learnlens-5d200.firebasestorage.app")
    
    try:
        if service_account_path and os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred, {"storageBucket": storage_bucket})
            logger.info("✅ Firebase initialized with service account.")
        else:
            # Try default credentials (for cloud environments)
            firebase_admin.initialize_app(options={"storageBucket": storage_bucket})
            logger.info("✅ Firebase initialized with default credentials.")
        
        _firebase_initialized = True
        return True
    except ValueError:
        # Already initialized
        _firebase_initialized = True
        return True
    except Exception as e:
        logger.error(f"❌ Firebase init failed: {e}")
        return False

# --- Firebase Storage ---

def upload_file_to_storage(file_bytes, filename, content_type, user_id):
    """
    Uploads a file to Firebase Storage and returns the public URL.
    Files are organized by user: marksheets/{user_id}/{unique_filename}
    """
    if not init_firebase():
        return None
    
    try:
        bucket = storage.bucket()
        unique_name = f"{uuid.uuid4().hex[:8]}_{filename}"
        blob_path = f"marksheets/{user_id}/{unique_name}"
        blob = bucket.blob(blob_path)
        
        blob.upload_from_string(file_bytes, content_type=content_type)
        
        # Make publicly accessible
        blob.make_public()
        file_url = blob.public_url
        
        logger.info(f"✅ File uploaded to Storage: {blob_path}")
        return file_url
    except Exception as e:
        logger.error(f"❌ Storage upload failed: {e}")
        return None

# --- Firestore ---

def save_analysis_to_firestore(user_id, file_url, filename, analysis_result):
    """
    Saves analysis results to Firestore under: analysis_history/{auto_id}
    """
    if not init_firebase():
        return None
    
    try:
        db = firestore.client()
        
        doc_data = {
            "user_id": user_id,
            "file_url": file_url or "",
            "filename": filename,
            "subjects": analysis_result.get("subjects", []),
            "marks": analysis_result.get("marks", []),
            "weak_subjects": analysis_result.get("weak_subjects", []),
            "average_percentage": analysis_result.get("average_percentage", ""),
            "performance_trend": analysis_result.get("performance_trend", ""),
            "predicted_next_exam_score": analysis_result.get("predicted_next_exam_score", ""),
            "study_plan": analysis_result.get("study_plan", []),
            "recommendations": analysis_result.get("recommendations", []),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        doc_ref = db.collection("analysis_history").add(doc_data)
        doc_id = doc_ref[1].id
        
        logger.info(f"✅ Analysis saved to Firestore: {doc_id}")
        return doc_id
    except Exception as e:
        logger.error(f"❌ Firestore save failed: {e}")
        return None

def get_user_history(user_id, limit=20):
    """
    Retrieves analysis history for a specific user from Firestore.
    Returns most recent analyses first.
    """
    if not init_firebase():
        return []
    
    try:
        db = firestore.client()
        # Simple query without ordering (avoids needing composite index)
        docs = (
            db.collection("analysis_history")
            .where("user_id", "==", user_id)
            .limit(limit)
            .stream()
        )
        
        history = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            history.append(data)
        
        # Sort by timestamp in Python (most recent first)
        history.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        
        logger.info(f"✅ Retrieved {len(history)} records for user: {user_id}")
        return history
    except Exception as e:
        logger.error(f"❌ Firestore read failed: {e}")
        logger.error(f"   Details: {type(e).__name__}: {str(e)}")
        return []

def delete_analysis_from_firebase(doc_id):
    """
    Deletes an analysis record from Firestore and its associated file from Storage.
    """
    if not init_firebase():
        return False
    
    try:
        db = firestore.client()
        doc_ref = db.collection("analysis_history").document(doc_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            logger.warning(f"⚠️ Document {doc_id} not found.")
            return False
        
        data = doc.to_dict()
        file_url = data.get("file_url")
        user_id = data.get("user_id")
        
        # 1. Delete from Storage if file_url exists
        if file_url and "firebasestorage.app" in file_url:
            try:
                # Extract blob path from URL
                # Example: https://storage.googleapis.com/learnlens-5d200.firebasestorage.app/marksheets/USER_ID/FILENAME
                # Or parsing it from the known structure if possible
                bucket = storage.bucket()
                
                # The file_url for public blobs is usually:
                # https://storage.googleapis.com/{bucket_name}/{blob_path}
                bucket_name = bucket.name
                blob_path = file_url.split(f"{bucket_name}/")[-1]
                
                blob = bucket.blob(blob_path)
                if blob.exists():
                    blob.delete()
                    logger.info(f"🗑️ Deleted blob from Storage: {blob_path}")
            except Exception as e:
                logger.error(f"⚠️ Failed to delete Storage blob: {e}")
        
        # 2. Delete from Firestore
        doc_ref.delete()
        logger.info(f"🗑️ Deleted record from Firestore: {doc_id}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Deletion failed for {doc_id}: {e}")
        return False
