from backend.models.schemas import AnalysisResponse
from backend.services.fallback_service import fallback_service
from backend.services.supabase_service import supabase_service
from backend.services.ocr_service import ocr_service
from backend.services.groq_service import groq_service
from backend.utils.auth import get_current_user
from fastapi import APIRouter, UploadFile, File, HTTPException, Request, Depends
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()

@router.post("/analyze-image", response_model=AnalysisResponse)
@limiter.limit("3/minute")
async def analyze_image(request: Request, file: UploadFile = File(...), user_id: str = Depends(get_current_user)):
    # Check file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read file content
        image_content = await file.read()
        
        # Step 1: Extract Text using OCR
        extracted_text = ocr_service.extract_text(image_content)
        
        if not extracted_text:
            return {
                "scam_probability": 0.0,
                "tactics_detected": [],
                "explanation": "No text could be extracted from the image. Please ensure the image is clear.",
                "recommended_action": "Try uploading a clearer screenshot."
            }
        
        # Step 2: Analyze with Groq (with fallback)
        try:
            analysis_result = groq_service.analyze_scam(extracted_text)
            if "Error calling AI service" in analysis_result.get("explanation", ""):
                analysis_result = fallback_service.analyze_fallback(extracted_text)
        except Exception:
            analysis_result = fallback_service.analyze_fallback(extracted_text)
        
        # Step 3: Save to Supabase
        report_to_save = analysis_result.copy()
        report_to_save["extracted_text"] = extracted_text
        supabase_service.save_scan_report(user_id, report_to_save)
        
        return analysis_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
