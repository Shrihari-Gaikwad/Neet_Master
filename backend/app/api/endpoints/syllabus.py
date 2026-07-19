from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.db.database import get_db
from app.models.syllabus import Subject, Unit, Chapter
from app.schemas.syllabus import SubjectResponse, UnitResponse, ChapterResponse

router = APIRouter()

@router.get("/subjects", response_model=List[SubjectResponse])
def get_subjects(db: Session = Depends(get_db)):
    subjects = db.query(Subject).all()
    return subjects

@router.get("/tree")
def get_syllabus_tree(db: Session = Depends(get_db)):
    subjects = db.query(Subject).all()
    tree = []
    
    for subject in subjects:
        subj_data = {
            "id": subject.id,
            "name": subject.name,
            "units": []
        }
        
        for unit in subject.units:
            unit_data = {
                "id": unit.id,
                "name": unit.name,
                "grade": unit.grade,
                "chapters": []
            }
            
            for chapter in unit.chapters:
                unit_data["chapters"].append({
                    "id": chapter.id,
                    "name": chapter.name
                })
                
            subj_data["units"].append(unit_data)
            
        tree.append(subj_data)
        
    return tree

@router.get("/subjects/{subject_id}/units", response_model=List[UnitResponse])
def get_units(subject_id: int, db: Session = Depends(get_db)):
    units = db.query(Unit).filter(Unit.subject_id == subject_id).all()
    return units

@router.get("/units/{unit_id}", response_model=UnitResponse)
def get_unit(unit_id: int, db: Session = Depends(get_db)):
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    return unit

@router.get("/units/{unit_id}/chapters", response_model=List[ChapterResponse])
def get_chapters(unit_id: int, db: Session = Depends(get_db)):
    chapters = db.query(Chapter).filter(Chapter.unit_id == unit_id).all()
    return chapters

@router.get("/chapters/{chapter_id}", response_model=ChapterResponse)
def get_chapter(chapter_id: int, db: Session = Depends(get_db)):
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    return chapter
