import asyncio
from app.core.config import settings
from google import genai
import json
from app.api.endpoints.flashcards import FLASHCARD_PROMPT, Flashcard

client = genai.Client(api_key=settings.GEMINI_API_KEY)

prompt = FLASHCARD_PROMPT.format(
    subject="Science",
    chapter="General",
    topic="Biology",
    count=2
)

try:
    print("Generating...")
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
        
    print("JSON:", clean_text)
    data = json.loads(clean_text.strip())
    
    cards = []
    for c in data.get("flashcards", []):
        cards.append(Flashcard(**c))
    print("Success! Generated", len(cards), "cards.")
except Exception as e:
    import traceback
    traceback.print_exc()
