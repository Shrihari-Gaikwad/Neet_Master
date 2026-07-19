import asyncio
import json
import traceback
from app.core.config import settings
from google import genai
import app.models.syllabus
import app.models.user
from app.db.database import SessionLocal
from app.models.test import Question

client = genai.Client(api_key=settings.GEMINI_API_KEY)

PROMPT_TEMPLATE = """
You are an expert NEET faculty and data entry specialist.
Your task is to recall authentic Previous Year Questions (PYQs) from the NEET {year} paper for the subject {subject}.
Please generate 20 highly authentic, exact questions from the NEET {year} {subject} paper.

IMPORTANT RULES:
1. Return ONLY valid JSON.
2. Ensure options are in a JSON array of 4 strings.
3. The correct_answer must be exactly one of: "A", "B", "C", "D" (corresponding to index 0, 1, 2, 3 in the options array).
4. Difficulty should be "Easy", "Medium", or "Hard".
5. Provide a short explanation for the correct answer.

FORMAT:
[
  {{
    "text": "Question text here...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "A",
    "explanation": "Short explanation",
    "difficulty": "Medium"
  }}
]
"""

def fetch_and_seed():
    db = SessionLocal()
    years = list(range(2008, 2021)) # 2008 to 2020
    subjects = ["Physics", "Chemistry", "Biology"]
    
    total_added = 0
    
    for year in years:
        for subject in subjects:
            print(f"[*] Generating {subject} PYQs for NEET {year}...")
            prompt = PROMPT_TEMPLATE.format(year=year, subject=subject)
            
            try:
                response = client.models.generate_content(
                    model="gemini-3.1-flash-lite",
                    contents=prompt,
                    config={"response_mime_type": "application/json"}
                )
                
                clean_text = response.text.strip()
                if clean_text.startswith("```json"):
                    clean_text = clean_text[7:]
                if clean_text.startswith("```"):
                    clean_text = clean_text[3:]
                if clean_text.endswith("```"):
                    clean_text = clean_text[:-3]
                    
                data = json.loads(clean_text.strip())
                
                count = 0
                for item in data:
                    q = Question(
                        text=item.get("text", ""),
                        options=item.get("options", []),
                        correct_answer=item.get("correct_answer", "A"),
                        explanation=item.get("explanation", ""),
                        difficulty=item.get("difficulty", "Medium"),
                        year=year,
                        subject=subject,
                        is_pyq=True
                    )
                    db.add(q)
                    count += 1
                
                db.commit()
                total_added += count
                print(f"    [+] Successfully added {count} questions.")
                
            except Exception as e:
                print(f"    [-] Failed for {year} {subject}: {e}")
                traceback.print_exc()
                
    db.close()
    print(f"\n[Done] Successfully seeded {total_added} PYQs in total!")

if __name__ == "__main__":
    fetch_and_seed()
