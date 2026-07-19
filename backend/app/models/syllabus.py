from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from app.db.database import Base

class Subject(Base):
    __tablename__ = "subjects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False) # Physics, Chemistry, Biology
    
    units = relationship("Unit", back_populates="subject", cascade="all, delete-orphan")

class Unit(Base):
    __tablename__ = "units"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    grade = Column(String, nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    
    subject = relationship("Subject", back_populates="units")
    chapters = relationship("Chapter", back_populates="unit", cascade="all, delete-orphan")

class Chapter(Base):
    __tablename__ = "chapters"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    unit_id = Column(Integer, ForeignKey("units.id"))
    pdf_url = Column(String, nullable=True)
    
    # New Analytics Fields
    weightage = Column(Float, default=0.0) # E.g., 5.5% of exam
    pyq_count = Column(Integer, default=0)
    difficulty_level = Column(String, default="Medium") # Easy, Medium, Hard
    estimated_time_minutes = Column(Integer, default=120)
    importance_rating = Column(Integer, default=3) # 1 to 5 stars
    
    unit = relationship("Unit", back_populates="chapters")
    topics = relationship("Topic", back_populates="chapter", cascade="all, delete-orphan")

    @property
    def subject_name(self):
        if self.unit and self.unit.subject:
            return self.unit.subject.name
        return None

class Topic(Base):
    __tablename__ = "topics"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    chapter_id = Column(Integer, ForeignKey("chapters.id"))
    
    chapter = relationship("Chapter", back_populates="topics")
    subtopics = relationship("Subtopic", back_populates="topic", cascade="all, delete-orphan")

class Subtopic(Base):
    __tablename__ = "subtopics"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    topic_id = Column(Integer, ForeignKey("topics.id"))
    
    topic = relationship("Topic", back_populates="subtopics")
