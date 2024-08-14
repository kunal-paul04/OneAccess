from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from pymongo import MongoClient
from app.login import router as login_router
from fastapi.middleware.cors import CORSMiddleware
from app.google_auth import router as google_auth_router
from app.database import get_db, get_mongo_client
from app.migrate_users import migrate_users
from app.register import router as register_router

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "FastSSO.git checkout "}


@app.get("/migrate_users")
async def migrate_users_endpoint(
    mysql_db: Session = Depends(get_db),
    mongo_client: MongoClient = Depends(get_mongo_client)
):
    return await migrate_users(mysql_db, mongo_client)


# Allow CORS for development
app.add_middleware(
    CORSMiddleware,
    # allow_origins=["http://localhost:3000","https://adequate-renewed-hen.ngrok-free.app/","https://adequate-renewed-hen.ngrok-free.app/"],
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the Google auth router
app.include_router(google_auth_router)

# Include the router from register.py
app.include_router(register_router)

# Include the login router
app.include_router(login_router)
