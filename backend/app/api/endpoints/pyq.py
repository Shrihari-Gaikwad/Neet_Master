from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.models.test import Question
from pydantic import BaseModel

router = APIRouter()

class PYQResponse(BaseModel):
    id: int
    text: str
    options: List[str]
    correct_answer: str
    explanation: Optional[str]
    difficulty: str
    year: int
    subject: str

    class Config:
        orm_mode = True

@router.get("/", response_model=List[PYQResponse])
def get_pyqs(
    year: Optional[int] = None,
    subject: Optional[str] = None,
    difficulty: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Question).filter(Question.is_pyq == True)
    if year:
        query = query.filter(Question.year == year)
    if subject:
        query = query.filter(Question.subject == subject)
    if difficulty:
        query = query.filter(Question.difficulty == difficulty)
        
    return query.order_by(Question.year.desc()).all()
