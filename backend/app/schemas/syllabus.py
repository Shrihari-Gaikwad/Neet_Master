from pydantic import BaseModel
from typing import List, Optional

# Topics
class TopicBase(BaseModel):
    name: str

class TopicResponse(TopicBase):
    id: int
    chapter_id: int
    
    class Config:
        from_attributes = True

# Chapters
class ChapterBase(BaseModel):
    name: str
    pdf_url: Optional[str] = None

class ChapterResponse(ChapterBase):
    id: int
    unit_id: int
    weightage: float
    pyq_count: int
    difficulty_level: str
    estimated_time_minutes: int
    importance_rating: int
    subject_name: Optional[str] = None
    topics: List[TopicResponse] = []
    
    class Config:
        from_attributes = True

# Units
class UnitBase(BaseModel):
    name: str
    grade: str

class UnitResponse(UnitBase):
    id: int
    subject_id: int
    chapters: List[ChapterResponse] = []
    
    class Config:
        from_attributes = True

# Subjects
class SubjectBase(BaseModel):
    name: str

class SubjectResponse(SubjectBase):
    id: int
    units: List[UnitResponse] = []
    
    class Config:
        from_attributes = True
