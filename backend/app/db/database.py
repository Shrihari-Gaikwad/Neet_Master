from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# In a serverless/neon environment, you might want connection pooling configured specially
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    # echo=True  # Uncomment for debugging SQL queries
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
