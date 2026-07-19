from pinecone import Pinecone
from app.core.config import settings

pc = Pinecone(api_key=settings.PINECONE_API_KEY)
pc.delete_index("neet-pyq-index")
print("Deleted!")
