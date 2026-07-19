import os
from pinecone import Pinecone, ServerlessSpec
from google import genai
from app.core.config import settings

def seed_pyqs():
    # Initialize Pinecone
    pc = Pinecone(api_key=settings.PINECONE_API_KEY)
    
    index_name = "neet-pyq-index"
    
    # Create index if it doesn't exist
    if index_name not in [idx.name for idx in pc.list_indexes()]:
        print(f"Creating Pinecone index: {index_name}...")
        pc.create_index(
            name=index_name,
            dimension=3072,  # Gemini embeddings are 3072 dimensions
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1")
        )
        print("Index created successfully!")
    
    index = pc.Index(index_name)
    
    # Initialize Gemini
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    
    # Mock PYQs
    mock_pyqs = [
        {
            "id": "pyq-1",
            "question": "Which of the following is responsible for the formation of the peat?",
            "options": ["Riccia", "Sphagnum", "Marchantia", "Funaria"],
            "answer": "Sphagnum",
            "year": 2014,
            "subject": "Biology",
            "chapter": "Plant Kingdom"
        },
        {
            "id": "pyq-2",
            "question": "Two cylinders A and B of equal capacity are connected to each other via a stopcock. A contains an ideal gas at standard temperature and pressure. B is completely evacuated. The entire system is thermally insulated. The stopcock is suddenly opened. The process is:",
            "options": ["adiabatic", "isochoric", "isobaric", "isothermal"],
            "answer": "adiabatic",
            "year": 2020,
            "subject": "Physics",
            "chapter": "Thermodynamics"
        },
        {
            "id": "pyq-3",
            "question": "The number of protons, neutrons and electrons in 175Lu71, respectively, are:",
            "options": ["71, 104, 71", "104, 71, 71", "71, 71, 104", "175, 104, 71"],
            "answer": "71, 104, 71",
            "year": 2020,
            "subject": "Chemistry",
            "chapter": "Structure of Atom"
        },
        {
            "id": "pyq-4",
            "question": "Which of the following elements is responsible for maintaining turgor in cells?",
            "options": ["Magnesium", "Sodium", "Potassium", "Calcium"],
            "answer": "Potassium",
            "year": 2018,
            "subject": "Biology",
            "chapter": "Mineral Nutrition"
        },
        {
            "id": "pyq-5",
            "question": "In a p-n junction diode, change in temperature due to heating:",
            "options": ["affects only forward resistance", "does not affect resistance of p-n junction", "affects only reverse resistance", "affects the overall V-I characteristics of p-n junction"],
            "answer": "affects the overall V-I characteristics of p-n junction",
            "year": 2018,
            "subject": "Physics",
            "chapter": "Semiconductor Electronics"
        }
    ]
    
    print("Embedding and inserting PYQs into Pinecone...")
    
    vectors = []
    for q in mock_pyqs:
        # We embed the question and options so semantic search works best
        text_to_embed = f"Question: {q['question']} Options: {', '.join(q['options'])} Answer: {q['answer']}"
        
        response = client.models.embed_content(
            model='gemini-embedding-2',
            contents=text_to_embed
        )
        embedding = response.embeddings[0].values
        
        vectors.append({
            "id": q["id"],
            "values": embedding,
            "metadata": {
                "question": q["question"],
                "options": ", ".join(q["options"]),
                "answer": q["answer"],
                "year": q["year"],
                "subject": q["subject"],
                "chapter": q["chapter"]
            }
        })
        
    index.upsert(vectors=vectors)
    print("Successfully seeded Pinecone index with mock PYQs!")

if __name__ == "__main__":
    seed_pyqs()
