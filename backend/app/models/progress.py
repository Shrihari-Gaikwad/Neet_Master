from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class UserProgress(Base):
    __tablename__ = "user_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable=False)
    
    is_completed = Column(Boolean, default=False)
    completion_percentage = Column(Float, default=0.0)
    time_spent_minutes = Column(Integer, default=0)
    last_accessed = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", backref="progress")
    chapter = relationship("Chapter")

class UserBookmark(Base):
    __tablename__ = "user_bookmarks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Polymorphic-like association to allow bookmarking different things
    item_type = Column(String, nullable=False) # 'question', 'note', 'topic', 'flashcard'
    item_id = Column(String, nullable=False) # Can be integer ID or string ID (like Pinecone UUID)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", backref="bookmarks")
