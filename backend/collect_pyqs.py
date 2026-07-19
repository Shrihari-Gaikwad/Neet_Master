import sys
import os
import json
sys.path.append(os.getcwd())

import app.models.user
import app.models.syllabus
import app.models.test
import app.models.progress
from app.db.database import SessionLocal
from app.models.test import Question

def collect_unique_pyqs():
    db = SessionLocal()
    # Fetch all PYQs
    pyqs = db.query(Question).filter(Question.is_pyq == True).all()
    
    seen_texts = set()
    unique_pyqs = []
    
    for q in pyqs:
        # We use the lowercased text and strip whitespace to deduplicate robustly
        normalized_text = q.text.strip().lower() if q.text else ""
        if normalized_text not in seen_texts:
            seen_texts.add(normalized_text)
            unique_pyqs.append({
                "id": q.id,
                "text": q.text,
                "options": q.options,
                "correct_answer": q.correct_answer,
                "year": q.year,
                "subject": q.subject,
                "explanation": q.explanation
            })
            
    output_file = 'unique_pyqs.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(unique_pyqs, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully collected {len(unique_pyqs)} unique PYQs out of {len(pyqs)} total PYQs.")
    print(f"Data saved to {os.path.abspath(output_file)}")

if __name__ == "__main__":
    collect_unique_pyqs()
