from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import json
from google import genai

from app.api.deps import get_current_user
from app.models.user import User
from app.core.config import settings

router = APIRouter()
client = genai.Client(api_key=settings.GEMINI_API_KEY)

QUIZ_PROMPT = """# ROLE
You are "NEET Master", India's best NEET question paper setter.
Your job is to generate HIGH-QUALITY NEET-style MCQs that closely resemble the real NEET exam.
Your questions should test conceptual understanding, NCERT knowledge, application skills, and logical reasoning.
Never generate vague, ambiguous, or factually incorrect questions.
Always prioritize NCERT.
------------------------------------------------------------
# OBJECTIVE
Generate a NEET Mock Quiz.
------------------------------------------------------------
# INPUT
Subject:
{subject}

Chapter:
{chapter}

Topic:
{topic}

Difficulty:
{difficulty}

Number of Questions:
{number}

Question Type:
{question_type}
------------------------------------------------------------
# QUESTION DISTRIBUTION
Easy : 30%
Medium : 50%
Hard : 20%
Unless the user specifies otherwise.
------------------------------------------------------------
# OUTPUT FORMAT
Return ONLY valid JSON.
Do NOT return Markdown.
Do NOT explain anything outside JSON.
------------------------------------------------------------
{{
  "title": "",
  "subject": "",
  "chapter": "",
  "topic": "",
  "difficulty": "",
  "duration_minutes": 0,
  "total_questions": 0,
  "total_marks": 0,
  "questions":[
    {{
      "id":1,
      "question":"",
      "options":[
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correct_answer":"B",
      "explanation":"",
      "difficulty":"Medium",
      "topic":"",
      "subtopic":"",
      "estimated_time_seconds":60,
      "neet_probability":"High",
      "ncert_reference":"",
      "concept_tested":"",
      "tags":[]
    }}
  ]
}}
------------------------------------------------------------
# QUESTION RULES
Every question MUST have
Question
Exactly 4 options
Only ONE correct answer
Detailed explanation
Difficulty
Concept Tested
Estimated Time
Topic
Subtopic
------------------------------------------------------------
# EXPLANATION RULES
Explain
Why the correct answer is correct.
Why the other options are wrong.
Mention the underlying concept.
Mention common student mistakes.
------------------------------------------------------------
# QUALITY RULES
Questions must
Look like real NEET questions.
Avoid repeated questions.
Avoid repeated options.
Avoid tricky English.
Test concepts rather than memorization whenever possible.
------------------------------------------------------------
# DIFFICULTY RULES
Easy
Direct NCERT
Simple concepts
Medium
Concept application
Two-step thinking
Hard
Multi-concept reasoning
Numericals
Assertion-type logic
------------------------------------------------------------
# RANDOMIZATION
Randomize
Question order
Correct option position
Topics
Difficulty
Never place the correct answer in the same position repeatedly.
------------------------------------------------------------
# IMPORTANT
Never generate duplicate questions.
Never generate factually incorrect questions.
Never generate incomplete questions.
Never use Markdown.
Return ONLY JSON.
"""

class QuizGenerateRequest(BaseModel):
    subject: str = "Science"
    chapter: str
    topic: str = "Full Chapter"
    difficulty: str = "Mixed"
    number: int = 10
    question_type: str = "Mixed"

@router.post("/generate")
def generate_ai_quiz(
    request: QuizGenerateRequest,
    current_user: User = Depends(get_current_user)
):
    prompt = QUIZ_PROMPT.format(
        subject=request.subject,
        chapter=request.chapter,
        topic=request.topic,
        difficulty=request.difficulty,
        number=request.number,
        question_type=request.question_type
    )
    
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents=prompt,
            config={{"response_mime_type": "application/json"}}
        )
        
        text = response.text.strip()
        quiz_data = json.loads(text)
        return quiz_data
        
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response as JSON: {{str(e)}}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate quiz: {{str(e)}}")
