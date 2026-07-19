from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
import os
import shutil
from google import genai
from uuid import uuid4

from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.core.config import settings

router = APIRouter()
client = genai.Client(api_key=settings.GEMINI_API_KEY)

class SolverResponse(BaseModel):
    solution: str

@router.post("/", response_model=SolverResponse)
async def solve_question_image(
    image: UploadFile = File(...),
    context: str = Form(default=""),
    current_user: User = Depends(get_current_user)
):
    if not image.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    # Save uploaded file temporarily
    file_ext = os.path.splitext(image.filename)[1]
    temp_filename = f"{uuid4().hex}{file_ext}"
    temp_filepath = os.path.join("uploads", temp_filename)
    
    with open(temp_filepath, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    try:
        # Upload to Gemini using the File API
        uploaded_file = client.files.upload(file=temp_filepath)
        
        prompt = "Act as an expert NEET faculty. Analyze the provided image which contains a question (Physics/Chemistry/Biology). Provide a detailed, step-by-step solution to solve the question. "
        if context:
            prompt += f"\nAdditional context from student: {context}"
            
        response = client.models.generate_content(
            model='gemini-2.0-flash-lite',
            contents=[uploaded_file, prompt]
        )
        
        return SolverResponse(solution=response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process image: {str(e)}")
    finally:
        # Clean up local file
        if os.path.exists(temp_filepath):
            os.remove(temp_filepath)
