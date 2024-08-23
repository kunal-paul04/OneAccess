import hashlib
from pydantic import BaseModel
from pymongo import MongoClient
from app.utils import generate_txn_number
from fastapi import APIRouter, Depends, HTTPException, status
from app.database import get_mongo_client, MONGO_DB, MONGO_COLLECTION


router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


@router.post("/login", tags=["Login & Registration"])
async def login(login_request: LoginRequest, mongo_client: MongoClient = Depends(get_mongo_client)):
    sso_users_collection = mongo_client[MONGO_DB][MONGO_COLLECTION]

    hashed_password = hash_password(login_request.password)

    user = sso_users_collection.find_one({"user_email": login_request.email, "passkey": hashed_password})

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    txn = generate_txn_number()
    user_role = user.get("user_role")
    googleLogin = user.get("googleLogin")
    # Optionally, create a session or JWT token here
    return {
        "success": True,
        "message": "Login successful",
        "email": login_request.email,
        "googleLogin": googleLogin,
        "txn": txn,
        "user_role": user_role  # Include user_role in the response
    }
