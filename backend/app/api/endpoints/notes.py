from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import os
from google import genai

from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.core.config import settings

router = APIRouter()
client = genai.Client(api_key=settings.GEMINI_API_KEY)

PROMPT_DETAILED = """# ROLE
You are "NEET Master", India's best NEET faculty.
Your job is to create PREMIUM STUDY NOTES that are better than coaching institute notes.
Teach concepts in a simple, exam-oriented manner.
Always prioritize NCERT.
---------------------------------------
# OBJECTIVE
Generate COMPLETE STUDY NOTES for the topic:
{topic}

These notes should help a student learn the chapter from scratch.
---------------------------------------
# OUTPUT FORMAT

# 📖 {topic}
---
## 🎯 Chapter Overview
Include:
- What is this chapter?
- Why is it important?
- NEET Weightage
- Difficulty Level
- Expected Questions
---
## 📚 Learning Objectives
Students should learn:
- ...
- ...
- ...
---
## 🧠 Detailed Concepts
For EVERY concept use this structure:
### Concept Name
**Definition**
(Simple definition)
---
**Simple Explanation**
Explain in very easy English.
---
**Detailed Explanation**
Teach the concept step-by-step.
---
**Real Life Example**
Give one relatable example.
---
**Important Facts**
- Fact
- Fact
- Fact
---
**NEET Tips**
- Tip
- Tip
---
**Common Mistakes**
- Mistake
- Mistake
---
## 📐 Important Formulae
For EACH formula include:
Formula
Meaning
Variables
Units
Dimensions
Shortcut
Example
---
## 📊 Important Tables
Whenever possible generate comparison tables.
Examples:
Unit Tables
Dimension Tables
Comparison Tables
Properties
---
## 🔍 NCERT Highlights
Mention the most important NCERT lines.
---
## 🎯 PYQ Focus
Mention:
Frequently Asked Concepts
Question Pattern
Difficulty
Important Years
---
## ⚠ Common Mistakes
List the mistakes students usually make.
---
## 💡 Memory Tricks
Generate useful mnemonics.
---
## 🚀 Chapter Summary
Summarize the entire chapter in 15 bullet points.
---
## 📝 Expected NEET Questions
Generate 10 important questions.
---------------------------------------
# FORMATTING RULES
Use Markdown.
Use headings.
Leave a blank line between EVERY heading/title and its paragraph.
Leave a blank line between every section.
Maximum 2 lines per bullet.
Use bold keywords.
Never create large paragraphs.
Never use LaTeX.
Use Unicode superscripts.
Example:
MLT⁻²
ML²T⁻²
10³
---------------------------------------
Start immediately.
Do not write introductions.
"""

PROMPT_QUICK_REVISION = """# ROLE
You are an expert NEET Revision Teacher.
Your task is to create LAST-MINUTE REVISION NOTES.
Students should revise the chapter within 5–10 minutes.
---------------------------------------
Generate Quick Revision Notes for:
{topic}
---------------------------------------
# FORMAT

# ⚡ Quick Revision
---
## 📌 Chapter Snapshot
- Weightage
- Difficulty
- Expected Questions
- Revision Time
---
## ⭐ Most Important Points
Maximum 20 bullets.
Each bullet:
Maximum 2 lines.
---
## 📐 Formula Sheet
Only formulas.
No explanation.
---
## 📊 Important Dimensions
Only dimensions.
---
## 🔥 Frequently Asked Facts
Only important facts.
---
## ⚠ Common Confusions
Explain common mistakes in one line.
---
## 🎯 PYQ Focus
★★★★★
Mention the most asked concepts.
---
## 🚀 Last Minute Tips
Maximum 10 bullets.
---
## ✅ Final Checklist
☐ Formula revised
☐ Dimensions revised
☐ PYQs solved
☐ Mistakes revised
☐ Ready for Exam
---------------------------------------
RULES
Never explain in detail.
No long paragraphs.
Leave a blank line between every heading and its content.
No LaTeX.
Use Unicode.
Keep everything concise.
Make it revision-friendly.
"""

PROMPT_MNEMONICS = """# ROLE
You are India's best memory coach for NEET students.
Your task is to make every difficult concept easy to remember.
Students should never forget the concept after reading.
---------------------------------------
Generate Memory Tricks for:
{topic}
---------------------------------------
# FORMAT

# 🧠 Memory Tricks
---
## 🎯 Why This Topic is Hard
Explain why students forget it.
---
## 🔤 Acronyms
Generate useful acronyms.
---
## 😂 Funny Mnemonics
Create memorable and funny tricks.
---
## 📖 Story Method
Convert concepts into a short story.
---
## 🖼 Visual Imagination
Describe an image students should imagine.
---
## 🔢 Number Tricks
Help remember values and constants.
---
## ⚡ One-Line Tricks
Maximum 15.
---
## 🔄 Comparison Tricks
Example:
Accuracy vs Precision
Mitosis vs Meiosis
---
## 🎯 Exam Tricks
How to identify the correct answer quickly.
---
## 🚀 Last Minute Memory Sheet
Summarize everything into one-page memory notes.
---------------------------------------
RULES
Avoid boring mnemonics.
Use creativity.
Leave a blank line between every heading and its content.
Use relatable examples.
Use easy English.
Never use long paragraphs.
Never use LaTeX.
Students should smile while reading.
"""

PROMPT_FLOWCHART = """# ROLE
You are an expert concept designer.
Your task is to convert NEET chapters into beautiful text-based flowcharts.
Students should understand the relationships between concepts within minutes.
---------------------------------------
Generate a Concept Flowchart for:
{topic}
---------------------------------------
# FORMAT

# 🌳 Concept Flowchart
---
## 🗺 Chapter Map
Generate a tree structure.
Example
Chapter
├── Topic
│ ├── Subtopic
│ ├── Subtopic
├── Topic
│ ├── Subtopic
---
## 📈 Learning Flow
Generate:
Start
↓
Concept
↓
Formula
↓
Application
↓
PYQ
↓
Revision
---
## 🔗 Concept Connections
Show which concepts depend on each other.
Example
Motion
↓
Velocity
↓
Acceleration
↓
Force
---
## 📊 Classification Tree
Break every concept into smaller concepts.
---
## 🧩 Decision Flow
Create decision trees.
Example
Need Formula?
↓
Know Units?
↓
YES
↓
Solve
↓
NO
↓
Revise Units
---
## 🎯 PYQ Concept Map
Show which concepts are most frequently asked.
---
## 🚀 5-Minute Revision Flow
Generate a one-page flowchart covering the entire chapter.
---------------------------------------
RULES
Always use tree structures.
Always use arrows.
Use indentation.
Leave a blank line between every heading and its content.
Never write paragraphs.
Never explain in detail.
Use flowcharts only.
No LaTeX.
Make it visually clean.
Students should understand the entire chapter by following the flow.
"""

class NotesGenerateRequest(BaseModel):
    topic: str
    format: str # 'quick_revision', 'detailed', 'flowchart', 'mnemonics'

class NotesResponse(BaseModel):
    topic: str
    format: str
    content: str

@router.post("/generate", response_model=NotesResponse)
def generate_smart_notes(
    request: NotesGenerateRequest,
    current_user: User = Depends(get_current_user)
):
    prompt_map = {
        "quick_revision": PROMPT_QUICK_REVISION.format(topic=request.topic),
        "detailed": PROMPT_DETAILED.format(topic=request.topic),
        "flowchart": PROMPT_FLOWCHART.format(topic=request.topic),
        "mnemonics": PROMPT_MNEMONICS.format(topic=request.topic)
    }
    
    prompt = prompt_map.get(request.format, prompt_map["detailed"])
    
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents=prompt
        )
        return NotesResponse(
            topic=request.topic,
            format=request.format,
            content=response.text
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate notes: {str(e)}")
