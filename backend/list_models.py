from google import genai
from app.core.config import settings

c = genai.Client(api_key=settings.GEMINI_API_KEY)
for m in c.models.list():
    if "embed" in m.name:
        print(m.name)
