import os
from dotenv import load_dotenv
from pymongo import MongoClient
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

# MySQL configuration
MYSQL_USER = os.getenv("MYSQL_USER")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")
MYSQL_HOST = os.getenv("MYSQL_HOST")
MYSQL_PORT = os.getenv("MYSQL_PORT")
MYSQL_DB = os.getenv("MYSQL_DB")

# MongoDB configuration
MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB = os.getenv("MONGO_DB")
MONGO_COLLECTION = os.getenv("MONGO_COLLECTION")
MONGO_SERVICE_COLLECTION = os.getenv("MONGO_SERVICE_COLLECTION")
MONGO_CLIENT_COLLECTION = os.getenv("MONGO_CLIENT_COLLECTION")
MONGO_TOKEN_COLLECTION = os.getenv("MONGO_TOKEN_COLLECTION")
MONGO_OPT_GENERATE = os.getenv("MONGO_OPT_GENERATE")

# MySQL database setup
DATABASE_URL = f"mysql+mysqlconnector://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# MongoDB client setup (create once and reuse)
mongo_client = MongoClient(MONGO_URI)


# Dependency to get the MySQL DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Dependency to get the MongoDB client
def get_mongo_client():
    try:
        yield mongo_client
    except Exception as e:
        raise e  # Log or handle exceptions as needed
