from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
import json
import random

from app.db.database import get_db
from app.models.test import Test, Question, TestAttempt
from app.models.syllabus import Chapter
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

class TestGenerateRequest(BaseModel):
    subjects: List[str]
    type: str = "full" # "full" or "mini"
    chapters: Optional[List[str]] = None

class QuestionResponse(BaseModel):
    id: int
    text: str
    options: List[str]
    subject: str

class TestResponse(BaseModel):
    id: int
    title: str
    total_marks: int
    questions: List[QuestionResponse]

@router.post("/generate", response_model=TestResponse)
def generate_mock_test(
    request: TestGenerateRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Determine marks and counts
    is_mini = (request.type == "mini")
    total_marks = 360 if is_mini else 720
    
    # Question distribution
    # Full: Bio 90, Phy 45, Chem 45
    # Mini (360 marks = 90 Qs): Bio 45, Phy 22, Chem 23
    dist = {
        "Biology": 45 if is_mini else 90,
        "Physics": 22 if is_mini else 45,
        "Chemistry": 23 if is_mini else 45
    }
    
    final_questions = []
    
    # If chapters are provided, find their IDs
    chapter_ids = []
    if request.chapters and len(request.chapters) > 0:
        chapter_objs = db.query(Chapter).filter(Chapter.name.in_(request.chapters)).all()
        chapter_ids = [c.id for c in chapter_objs]
    
    for subject in request.subjects:
        total_needed = dist.get(subject, 0)
        if total_needed == 0:
            continue
            
        pyq_needed = int(total_needed * 0.6)
        mock_needed = total_needed - pyq_needed
        
        # 1. Fetch PYQs from DB
        pyq_query = db.query(Question).filter(Question.subject == subject, Question.is_pyq == True)
        if chapter_ids:
            pyq_query = pyq_query.filter(Question.chapter_id.in_(chapter_ids))
            
        pyqs = pyq_query.order_by(func.random()).limit(pyq_needed).all()
        
        # If chapter filtering was too strict for PYQs, pad with other PYQs for this subject
        if len(pyqs) < pyq_needed:
            pad_pyqs = db.query(Question).filter(
                Question.subject == subject, 
                Question.is_pyq == True,
                Question.id.notin_([q.id for q in pyqs])
            ).order_by(func.random()).limit(pyq_needed - len(pyqs)).all()
            pyqs.extend(pad_pyqs)
        
        # 2. Fetch Non-PYQ (Mock Practice) from DB
        mock_query = db.query(Question).filter(Question.subject == subject, Question.is_pyq == False)
        # Attempt chapter filtering for mock questions too, but many won't have chapter_id
        if chapter_ids:
            mock_query = mock_query.filter(Question.chapter_id.in_(chapter_ids))
            
        mock_qs = mock_query.order_by(func.random()).limit(mock_needed).all()
        
        # If chapter filtering was too strict for Mock Questions, pad with other Mock Questions
        if len(mock_qs) < mock_needed:
            pad_mocks = db.query(Question).filter(
                Question.subject == subject, 
                Question.is_pyq == False,
                Question.id.notin_([q.id for q in mock_qs])
            ).order_by(func.random()).limit(mock_needed - len(mock_qs)).all()
            mock_qs.extend(pad_mocks)
        
        subject_qs = pyqs + mock_qs
        
        # If we still fall short, pad with ANYTHING from the subject
        shortfall = total_needed - len(subject_qs)
        if shortfall > 0:
            padding = db.query(Question).filter(
                Question.subject == subject, 
                Question.id.notin_([q.id for q in subject_qs])
            ).order_by(func.random()).limit(shortfall).all()
            subject_qs.extend(padding)
            
        final_questions.extend(subject_qs)
        
    random.shuffle(final_questions)
    
    if len(final_questions) == 0:
        raise HTTPException(
            status_code=400, 
            detail="Not enough questions in the database to generate a mock test for the selected subjects. Please wait until more questions are added."
        )
    
    # Create the test record
    title = f"{'Mini ' if is_mini else 'Full '} Mock Test"
    new_test = Test(
        user_id=current_user.id,
        title=title,
        total_marks=total_marks
    )
    db.add(new_test)
    db.commit()
    db.refresh(new_test)
    
    # Create Test Attempts (empty answers)
    attempts = []
    for q in final_questions:
        attempt = TestAttempt(
            test_id=new_test.id,
            question_id=q.id
        )
        db.add(attempt)
        attempts.append(attempt)
    
    db.commit()
    
    # Format response
    response_qs = []
    for q in final_questions:
        response_qs.append(
            QuestionResponse(
                id=q.id,
                text=q.text,
                options=q.options,
                subject=q.subject
            )
        )
        
    return TestResponse(
        id=new_test.id,
        title=new_test.title,
        total_marks=new_test.total_marks,
        questions=response_qs
    )

@router.get("/{test_id}")
def get_test(
    test_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    test = db.query(Test).filter(Test.id == test_id, Test.user_id == current_user.id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
        
    attempts = db.query(TestAttempt).filter(TestAttempt.test_id == test_id).all()
    questions = []
    
    for attempt in attempts:
        q = db.query(Question).filter(Question.id == attempt.question_id).first()
        if q:
            questions.append({
                "id": q.id,
                "text": q.text,
                "options": q.options,
                "subject": q.subject,
                "selected_option": attempt.selected_option,
                "is_correct": attempt.is_correct,
                "correct_answer": q.correct_answer,
                "explanation": q.explanation
            })
            
    return {
        "id": test.id,
        "title": test.title,
        "total_marks": test.total_marks,
        "score": test.score,
        "time_taken_seconds": test.time_taken_seconds,
        "completed": test.completed_at is not None,
        "questions": questions
    }

class TestSubmissionRequest(BaseModel):
    answers: Dict[int, str] # question_id -> selected_option (A, B, C, D)
    time_taken_seconds: int

@router.post("/{test_id}/submit")
def submit_test(
    test_id: int,
    request: TestSubmissionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    test = db.query(Test).filter(Test.id == test_id, Test.user_id == current_user.id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
        
    score = 0
    correct_count = 0
    incorrect_count = 0
    
    attempts = db.query(TestAttempt).filter(TestAttempt.test_id == test_id).all()
    
    for attempt in attempts:
        selected_option = request.answers.get(attempt.question_id)
        if selected_option:
            attempt.selected_option = selected_option
            q = db.query(Question).filter(Question.id == attempt.question_id).first()
            
            # selected_option is "A", "B", "C", "D"
            if q and q.correct_answer == selected_option:
                attempt.is_correct = True
                score += 4
                correct_count += 1
            else:
                attempt.is_correct = False
                score -= 1
                incorrect_count += 1
        else:
            attempt.is_correct = None
            
    test.score = score
    test.completed_at = datetime.utcnow()
    test.time_taken_seconds = request.time_taken_seconds
    
    db.commit()
    
    return {
        "message": "Test submitted successfully", 
        "score": test.score, 
        "total": test.total_marks,
        "correct": correct_count,
        "incorrect": incorrect_count
    }

@router.delete("/{test_id}")
def delete_test(
    test_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    test = db.query(Test).filter(Test.id == test_id, Test.user_id == current_user.id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
        
    db.delete(test)
    db.commit()
    
    return {"message": "Test deleted successfully"}
