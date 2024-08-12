from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from pymongo import MongoClient
from app.database import get_db, get_mongo_client  # Importing database configurations
from app.migrate_users import migrate_users  # Import the migrate_users function

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "Everyone"}


@app.get("/migrate_users")
async def migrate_users_endpoint(
    mysql_db: Session = Depends(get_db),
    mongo_client: MongoClient = Depends(get_mongo_client)
):
    return await migrate_users(mysql_db, mongo_client)
