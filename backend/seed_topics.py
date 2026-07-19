import sys
from app.db.database import SessionLocal
from app.models.syllabus import Topic, Chapter

def seed_topics_for_chapter(chapter_id: int, topics_list: list[str]):
    db = SessionLocal()
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        print(f"Chapter with id {chapter_id} not found.")
        db.close()
        return

    for topic_name in topics_list:
        # Check if topic already exists to avoid duplicates
        existing_topic = db.query(Topic).filter(Topic.name == topic_name, Topic.chapter_id == chapter_id).first()
        if not existing_topic:
            topic = Topic(name=topic_name, chapter_id=chapter_id)
            db.add(topic)
    
    db.commit()
    print(f"Seeded topics for chapter '{chapter.name}'.")
    db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python seed_topics.py <chapter_id>")
        sys.exit(1)
        
    chapter_id = int(sys.argv[1])
    topics_list = [
        "Introduction",
        "Core Concepts"
    ]
    seed_topics_for_chapter(chapter_id, topics_list)
