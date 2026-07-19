from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
from pydantic import BaseModel
from typing import List, Optional
import os
import json
from google import genai
from pinecone import Pinecone

from app.core.config import settings
from app.db.database import get_db
from app.models.test import Question

router = APIRouter()

# Initialize Pinecone
pc = Pinecone(api_key=settings.PINECONE_API_KEY)
index_name = "neet-pyq-index"

# Initialize Gemini Client
client = genai.Client(api_key=settings.GEMINI_API_KEY)

class SearchResult(BaseModel):
    id: str
    question: str
    options: str
    answer: str
    year: int
    subject: str
    chapter: str
    score: float
    is_pyq: bool = True

class SearchResponse(BaseModel):
    results: List[SearchResult]

@router.get("/", response_model=SearchResponse)
def search_pyqs(
    query: str = Query(..., description="The concept or PYQ you are looking for"), 
    limit: int = Query(5, description="Number of results"),
    db: Session = Depends(get_db)
):
    try:
        results = []
        
        # 1. Pinecone Semantic Search for PYQs
        try:
            if index_name in [idx.name for idx in pc.list_indexes()]:
                index = pc.Index(index_name)
                
                # Embed the query
                embed_response = client.models.embed_content(
                    model='gemini-embedding-2',
                    contents=query
                )
                query_embedding = embed_response.embeddings[0].values
                
                # Search Pinecone
                search_res = index.query(
                    vector=query_embedding,
                    top_k=limit,
                    include_metadata=True
                )
                
                for match in search_res.matches:
                    if match.score > 0.4: # Arbitrary relevance threshold
                        results.append(
                            SearchResult(
                                id=match.id,
                                question=match.metadata.get("question", ""),
                                options=match.metadata.get("options", ""),
                                answer=match.metadata.get("answer", ""),
                                year=int(match.metadata.get("year", 0)),
                                subject=match.metadata.get("subject", ""),
                                chapter=match.metadata.get("chapter", ""),
                                score=float(match.score),
                                is_pyq=True
                            )
                        )
        except Exception as e:
            print("Pinecone search failed:", e)

        # 2. SQLite Keyword Search for Mock Questions
        # Search the text or subject of mock questions
        search_term = f"%{query}%"
        mock_questions = db.query(Question).filter(
            Question.is_pyq == False,
            or_(
                Question.text.ilike(search_term),
                Question.subject.ilike(search_term)
            )
        ).limit(limit).all()
        
        for mq in mock_questions:
            # Reconstruct options string from JSON list
            opts_str = ", ".join(mq.options) if isinstance(mq.options, list) else str(mq.options)
            chap_name = mq.chapter.name if mq.chapter else "General"
            
            results.append(
                SearchResult(
                    id=f"mock_{mq.id}",
                    question=mq.text,
                    options=opts_str,
                    answer=mq.correct_answer,
                    year=0,
                    subject=mq.subject,
                    chapter=chap_name,
                    score=1.0, # Exact keyword match score
                    is_pyq=False
                )
            )
            
        # Sort combined results by score
        results.sort(key=lambda x: x.score, reverse=True)
        
        # Respect the limit for combined results
        return SearchResponse(results=results[:limit*2])
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
