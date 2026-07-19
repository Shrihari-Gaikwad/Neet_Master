from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_analytics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    
    from app.models.test import Test, TestAttempt, Question
    
    # Get recent tests
    tests = db.query(Test).filter(
        Test.user_id == current_user.id,
        Test.completed_at.isnot(None)
    ).order_by(Test.completed_at.desc()).limit(2).all()
    
    recent_test = None
    if tests:
        latest = tests[0]
        diff = 0
        if len(tests) > 1:
            diff = latest.score - tests[1].score
            
        days_ago = (datetime.utcnow() - latest.completed_at).days
        comp_str = f"Completed {days_ago} days ago" if days_ago > 0 else "Completed today"
            
        recent_test = {
            "title": latest.title,
            "completed_at": comp_str,
            "score": latest.score,
            "total_marks": latest.total_marks,
            "diff": diff
        }

    # Get subject progress / accuracy
    subject_stats = {
        "Physics": {"correct": 0, "total": 0},
        "Chemistry": {"correct": 0, "total": 0},
        "Biology": {"correct": 0, "total": 0}
    }
    
    attempts = db.query(TestAttempt).join(Test).filter(
        Test.user_id == current_user.id,
        Test.completed_at.isnot(None)
    ).all()
    
    for attempt in attempts:
        q = db.query(Question).filter(Question.id == attempt.question_id).first()
        if q:
            subj = q.subject
            if subj in subject_stats:
                subject_stats[subj]["total"] += 1
                if attempt.is_correct:
                    subject_stats[subj]["correct"] += 1
                    
    subject_accuracy = {}
    for subj, stat in subject_stats.items():
        if stat["total"] > 0:
            subject_accuracy[subj] = round((stat["correct"] / stat["total"]) * 100)
        else:
            subject_accuracy[subj] = 0
            
    return {
        "recent_test": recent_test,
        "progress": subject_accuracy
    }

@router.get("/global")
def get_global_analytics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from app.models.test import Test, TestAttempt, Question
    from app.models.syllabus import Chapter
    
    # Fetch all completed tests
    tests = db.query(Test).filter(Test.user_id == current_user.id, Test.completed_at != None).order_by(Test.completed_at.asc()).all()
    
    if not tests:
        return {
            "history": [],
            "subject_accuracy": {"Physics": 0, "Chemistry": 0, "Biology": 0},
            "strong_zones": [],
            "weak_zones": [],
            "mistakes": {"unattempted": 0, "incorrect": 0, "correct": 0, "total": 0}
        }
        
    history = []
    for t in tests:
        history.append({
            "id": t.id,
            "title": t.title,
            "score": t.score,
            "total_marks": t.total_marks,
            "date": t.completed_at.isoformat()
        })
        
    # Analyze all attempts across all completed tests
    test_ids = [t.id for t in tests]
    attempts = db.query(TestAttempt).filter(TestAttempt.test_id.in_(test_ids)).all()
    
    subject_stats = {"Physics": {"correct": 0, "total": 0}, "Chemistry": {"correct": 0, "total": 0}, "Biology": {"correct": 0, "total": 0}}
    chapter_stats = {} # chapter_id -> {"correct": 0, "total": 0}
    
    unattempted = 0
    incorrect = 0
    correct = 0
    total_qs = len(attempts)
    
    for attempt in attempts:
        q = db.query(Question).filter(Question.id == attempt.question_id).first()
        if not q: continue
        
        # Mistake counts
        if attempt.selected_option is None:
            unattempted += 1
        elif attempt.is_correct:
            correct += 1
        else:
            incorrect += 1
            
        # If it was attempted, calculate accuracy
        if attempt.selected_option is not None:
            subj = q.subject
            if subj in subject_stats:
                subject_stats[subj]["total"] += 1
                if attempt.is_correct:
                    subject_stats[subj]["correct"] += 1
                    
            if q.chapter_id:
                if q.chapter_id not in chapter_stats:
                    chapter_stats[q.chapter_id] = {"correct": 0, "total": 0, "subject": q.subject}
                chapter_stats[q.chapter_id]["total"] += 1
                if attempt.is_correct:
                    chapter_stats[q.chapter_id]["correct"] += 1
                    
    # Format subject accuracy
    subject_accuracy = {}
    for subj, stat in subject_stats.items():
        if stat["total"] > 0:
            subject_accuracy[subj] = round((stat["correct"] / stat["total"]) * 100)
        else:
            subject_accuracy[subj] = 0
            
    # Format chapter strong/weak zones
    chapter_scores = []
    for cid, stat in chapter_stats.items():
        if stat["total"] >= 5: # Only consider chapters with at least 5 attempted questions
            acc = (stat["correct"] / stat["total"]) * 100
            chapter_scores.append({"id": cid, "accuracy": acc, "total": stat["total"], "subject": stat["subject"]})
            
    # Sort to find strong/weak
    chapter_scores.sort(key=lambda x: x["accuracy"])
    
    weak_zones_data = chapter_scores[:3] # Lowest accuracy
    strong_zones_data = sorted(chapter_scores, key=lambda x: x["accuracy"], reverse=True)[:3]
    
    # Attach names
    def format_zone(z_list):
        res = []
        for z in z_list:
            c = db.query(Chapter).filter(Chapter.id == z["id"]).first()
            if c:
                res.append({
                    "chapter": c.name,
                    "subject": z["subject"],
                    "accuracy": round(z["accuracy"])
                })
        return res
        
    weak_zones = format_zone(weak_zones_data)
    strong_zones = format_zone(strong_zones_data)
    
    return {
        "history": history,
        "subject_accuracy": subject_accuracy,
        "strong_zones": strong_zones,
        "weak_zones": weak_zones,
        "mistakes": {
            "unattempted": unattempted,
            "incorrect": incorrect,
            "correct": correct,
            "total": total_qs
        }
    }
