import os
import sys
import argparse
import re
from sqlalchemy.orm import Session
from datasets import load_dataset
import traceback

# Add the project root to sys.path if needed
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import ALL models before accessing DB so relationships resolve correctly
import app.models.syllabus
import app.models.user
import app.models.test

from app.db.database import SessionLocal
from app.models.test import Question

def parse_conversational_row(row):
    """
    Parses a Hugging Face conversational row:
    row['messages'][1]['content'] contains the question and options.
    row['metadata']['correct_answer'] contains the answer.
    """
    try:
        user_msg = None
        assistant_msg = None
        for msg in row.get('messages', []):
            if msg['role'] == 'user':
                user_msg = msg['content']
            elif msg['role'] == 'assistant':
                assistant_msg = msg['content']
                
        if not user_msg:
            return None
            
        # The user message usually looks like:
        # [NEET PYQ | Chemistry]
        # What is the density...
        # (A) Option A text
        # (B) Option B text
        # (C) Option C text
        # (D) Option D text
        
        # Split by (A), (B), (C), (D)
        # Using regex to carefully extract question and options
        parts = re.split(r'\([A-D]\)', user_msg)
        if len(parts) < 5:
            # Not a standard 4-option question
            return None
            
        q_text = parts[0].strip()
        # Clean up tags like [NEET PYQ | Chemistry]
        q_text = re.sub(r'\[.*?\]', '', q_text).strip()
        
        optA = parts[1].strip()
        optB = parts[2].strip()
        optC = parts[3].strip()
        optD = parts[4].strip()
        
        meta = row.get('metadata', {})
        correct_answer = meta.get('correct_answer', 'A')
        subject = meta.get('subject', 'Biology')
        difficulty = meta.get('difficulty', 'Medium').capitalize()
        
        explanation = ""
        if assistant_msg:
            explanation = assistant_msg.strip()
            
        return {
            'text': q_text,
            'options': [optA, optB, optC, optD],
            'correct_answer': correct_answer,
            'explanation': explanation,
            'difficulty': difficulty,
            'subject': subject
        }
        
    except Exception as e:
        return None

def seed_dataset(limit: int = 1000):
    db = SessionLocal()
    try:
        print("Loading dataset from Hugging Face...")
        ds = load_dataset("catchshubham/neet-dataset")
        train_ds = ds['train']
        
        print(f"Dataset loaded. Total rows: {len(train_ds)}")
        count = 0
        
        # Pre-fetch existing questions to prevent duplicates
        existing_questions = db.query(Question.text).all()
        existing_texts = set(q[0].strip().lower() for q in existing_questions if q[0])
        print(f"Loaded {len(existing_texts)} existing question texts for deduplication.")
        
        for idx, row in enumerate(train_ds):
            if count >= limit:
                break
                
            parsed = parse_conversational_row(row)
            if not parsed:
                continue
                
            normalized_text = parsed['text'].strip().lower()
            if normalized_text in existing_texts:
                continue
                
            try:
                q = Question(
                    text=parsed['text'],
                    options=parsed['options'],
                    correct_answer=parsed['correct_answer'],
                    explanation=parsed['explanation'],
                    difficulty=parsed['difficulty'],
                    subject=parsed['subject'],
                    is_pyq=True  # Mark as PYQ since user requested collecting PYQs
                )
                db.add(q)
                existing_texts.add(normalized_text)
                count += 1
                
                if count % 100 == 0:
                    db.commit()
                    print(f"Inserted {count} questions...")
                    
            except Exception as e:
                print(f"Error inserting row {idx}: {e}")
                
        db.commit()
        print(f"Successfully seeded {count} Mock Test questions into the database!")
        
    except Exception as e:
        print("Failed to seed dataset.")
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=1000, help="Number of questions to seed")
    args = parser.parse_args()
    seed_dataset(limit=args.limit)
