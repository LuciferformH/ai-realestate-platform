from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

connect_args = {}
pool_kwargs = {}

if settings.database_url_sync.startswith("sqlite"):
    connect_args["check_same_thread"] = False
elif settings.is_production:
    pool_kwargs = {"pool_size": 5, "max_overflow": 10}

engine = create_engine(
    settings.database_url_sync,
    pool_pre_ping=True,
    connect_args=connect_args,
    **pool_kwargs,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
