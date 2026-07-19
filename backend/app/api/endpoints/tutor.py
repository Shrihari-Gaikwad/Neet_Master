from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import os
from google import genai

from app.core.config import settings

router = APIRouter()

# Initialize Gemini Client
client = genai.Client(api_key=settings.GEMINI_API_KEY)

class ChatMessage(BaseModel):
    role: str
    parts: List[dict]

class TutorRequest(BaseModel):
    messages: List[ChatMessage]
    chapter_name: str
    
class TutorResponse(BaseModel):
    response: str

@router.post("/chat", response_model=TutorResponse)
def chat_with_tutor(request: TutorRequest):
    try:
        # Convert frontend messages to the format expected by the SDK
        contents = []
        for msg in request.messages:
            # Gemini API requires the conversation to start with a 'user' message.
            # We skip any leading 'model' messages (like the initial greeting).
            if len(contents) == 0 and msg.role == "model":
                continue
            contents.append({
                "role": msg.role,
                "parts": msg.parts
            })
            
        system_instruction = f"""
        You are a highly knowledgeable, encouraging, and friendly NEET UG AI Tutor.
        The student is currently studying: {request.chapter_name}.
        
        Your goals:
        1. Answer their doubts concisely but thoroughly.
        2. Keep the tone encouraging and academic.
        3. Use formatting (markdown) to make it easy to read (bullet points, bold text).
        4. Do not hallucinate formulas; if you are unsure, say you don't know.
        5. If the user's question is unrelated to NEET preparation or science, politely redirect them back to studying.
        """
        
        # We append a final system instruction or just use it as system instruction if the API supports it.
        # In google-genai, we can pass system_instruction in config.
        response = client.models.generate_content(
            model='gemini-2.0-flash-lite',
            contents=contents,
            config={
                'system_instruction': system_instruction
            }
        )
        
        return TutorResponse(response=response.text)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class MindMapRequest(BaseModel):
    chapter_name: str

class MindMapResponse(BaseModel):
    mermaid_code: str

@router.post("/mindmap", response_model=MindMapResponse)
def generate_mindmap(request: MindMapRequest):
    try:
        system_instruction = f"""
        You are an expert educational content creator.
        Your task is to generate a comprehensive Mind Map for the NEET UG chapter: "{request.chapter_name}".
        
        CRITICAL RULES:
        1. You MUST output ONLY valid Mermaid.js `mindmap` syntax.
        2. Start the code exactly with `mindmap`.
        3. Use indentation (spaces or tabs) to define the hierarchy.
        4. The root node should be the chapter name.
        5. **MAKE IT INTERESTING (EMOJIS & SHAPES):** We want the mind map to be highly engaging! 
           - Prefix EVERY node text with a relevant emoji (e.g. 🧬 DNA, ⚡ Electricity).
           - Use different shapes for nodes! Use `((" "))` for the root, `[" "]` for main branches, and `(" ")` for sub-branches.
           - **CRITICAL:** ALWAYS enclose the inner text in double quotes to prevent lexical errors with emojis and spaces.
        6. **EXTREMELY MINIMALIST:** Limit the map to MAXIMUM 4 main branches, and MAXIMUM 2 sub-branches each. STRICT LIMIT: No more than 10-12 nodes total.
        7. Keep node text concise. Each node MUST be on a new line.
        8. **CRITICAL NODE ID RULES:** The Node ID (the text before the shape brackets) MUST be a single alphanumeric word with NO SPACES (e.g. `topic1`, `subnode2`). DO NOT use spaces in Node IDs.
        8. Do NOT wrap the output in markdown blocks. Output raw code only.
        9. Do not include any explanations.
        10. **CRITICAL SYNTAX:** DO NOT use arrows (`->` or `-->`). Mindmaps rely STRICTLY on indentation (2 spaces per level).
        
        Example format (STRICTLY FOLLOW THIS):
        mindmap
          root(("🧬 Chapter Name"))
            topic1["🔬 Topic 1"]
              sub1("⚡ Subtopic A")
              sub2("🌡️ Subtopic B")
            topic2["🧲 Topic 2"]
              sub3("🌌 Subtopic C")
        """
        
        response = client.models.generate_content(
            model='gemini-2.0-flash-lite',
            contents=["Generate the mind map now."],
            config={
                'system_instruction': system_instruction,
                'temperature': 0.2,
                'max_output_tokens': 400
            }
        )
        
        # Clean up in case Gemini still outputs markdown blocks
        code = response.text.strip()
        if code.startswith("```mermaid"):
            code = code.replace("```mermaid", "", 1)
        if code.startswith("```"):
            code = code.replace("```", "", 1)
        if code.endswith("```"):
            code = code[:-3]
            
        return MindMapResponse(mermaid_code=code.strip())
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class TopicsRequest(BaseModel):
    chapter_name: str

class TopicItem(BaseModel):
    title: str
    description: str
    importance: str # "High", "Medium", "Low"

class TopicsResponse(BaseModel):
    topics: List[TopicItem]

@router.post("/topics", response_model=TopicsResponse)
def generate_topics(request: TopicsRequest):
    try:
        system_instruction = f"""
        You are an expert NEET UG curriculum designer.
        Your task is to generate a structured syllabus of the most important topics for the chapter: "{request.chapter_name}".
        
        CRITICAL RULES:
        1. Break the chapter down into 5 to 8 core topics.
        2. Provide a short, 1-sentence description for each topic.
        3. Rate the importance of each topic from a NEET exam perspective as "High", "Medium", or "Low".
        4. You MUST output ONLY valid JSON matching this schema:
        {{
            "topics": [
                {{
                    "title": "Topic Name",
                    "description": "Short description...",
                    "importance": "High"
                }}
            ]
        }}
        5. Do not include markdown blocks like ```json. Output raw JSON only.
        """
        
        response = client.models.generate_content(
            model='gemini-2.0-flash-lite',
            contents=["Generate the topics JSON now."],
            config={
                'system_instruction': system_instruction,
                'temperature': 0.1,
                'max_output_tokens': 600,
                'response_mime_type': 'application/json'
            }
        )
        
        # Parse the JSON response
        import json
        try:
            data = json.loads(response.text.strip())
            return TopicsResponse(topics=data.get("topics", []))
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Failed to parse AI response as JSON")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
