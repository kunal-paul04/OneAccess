import bcrypt
from pydantic import BaseModel
from pymongo import MongoClient
from app.utils import generate_txn_number
from fastapi import APIRouter, Depends, HTTPException, status
from app.database import get_mongo_client, MONGO_DB, MONGO_COLLECTION


router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login", tags=["Login & Registration"])
async def login(login_request: LoginRequest, mongo_client: MongoClient = Depends(get_mongo_client)):
    sso_users_collection = mongo_client[MONGO_DB][MONGO_COLLECTION]

    user = sso_users_collection.find_one({"user_email": login_request.email})

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    stored_password = user.get("passkey")

    # Securely check if the provided password matches the stored hashed password
    if not bcrypt.checkpw(login_request.password.encode(), stored_password.encode()):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    txn = generate_txn_number()
    user_role = user.get("user_role")
    googleLogin = user.get("googleLogin")
    name = user.get("name")
    # Optionally, create a session or JWT token here
    return {
        "success": True,
        "message": "Login successful",
        "email": login_request.email,
        "googleLogin": googleLogin,
        "name": name,
        "txn": txn,
        "user_role": user_role  # Include user_role in the response
    }
