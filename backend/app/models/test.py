from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, nullable=False)
    options = Column(JSON, nullable=False) # List of strings e.g. ["A", "B", "C", "D"]
    correct_answer = Column(String, nullable=False)
    explanation = Column(String, nullable=True)
    
    difficulty = Column(String, default="Medium") # Easy, Medium, Hard
    year = Column(Integer, nullable=True) # e.g. 2023 for PYQs
    
    subject = Column(String, nullable=False) # Physics, Chemistry, Biology
    chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True)
    
    # Is it a real PYQ or AI-generated?
    is_pyq = Column(Boolean, default=True)
    
    chapter = relationship("Chapter")
    topic = relationship("Topic")

class Test(Base):
    __tablename__ = "tests"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    title = Column(String, nullable=False) # E.g., "Full Syllabus Mock Test 1"
    
    # 720 for full mock test
    total_marks = Column(Integer, default=720)
    score = Column(Integer, nullable=True) # Null means in-progress
    
    # Subject breakdown e.g., {"Physics": 120, "Chemistry": 140, "Biology": 300}
    subject_scores = Column(JSON, nullable=True)
    
    time_taken_seconds = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    user = relationship("User", backref="tests")
    attempts = relationship("TestAttempt", back_populates="test", cascade="all, delete-orphan")

class TestAttempt(Base):
    __tablename__ = "test_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    
    selected_option = Column(String, nullable=True)
    is_correct = Column(Boolean, nullable=True)
    time_spent_seconds = Column(Integer, default=0)
    
    test = relationship("Test", back_populates="attempts")
    question = relationship("Question")
