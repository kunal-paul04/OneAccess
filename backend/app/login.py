import bcrypt
from pydantic import BaseModel
from pymongo import MongoClient
from app.utils import generate_txn_number
from app.mail_service import welcome_email
from fastapi import APIRouter, Depends, HTTPException, status
from app.database import get_mongo_client, MONGO_DB, MONGO_COLLECTION


router = APIRouter()


class LoginRequest(BaseModel):
    email: str


@router.post("/login", tags=["Login & Registration"])
async def login(login_request: LoginRequest, mongo_client: MongoClient = Depends(get_mongo_client)):
    sso_users_collection = mongo_client[MONGO_DB][MONGO_COLLECTION]

    user = sso_users_collection.find_one({"user_email": login_request.email})

    if not user:
        return {
            "success": False,
            "status_code": 404,
            "message": "user not found",
            "email": login_request.email,
        }

    txn = generate_txn_number()
    user_role = user.get("user_role")
    name = user.get("name")

    # Set googleLogin to 0 if it's blank (None or falsy)
    googleLogin = user.get("googleLogin") or 0

    # Optionally, create a session or JWT token here
    return {
        "success": True,
        "status_code": 200,
        "message": "Login successful",
        "email": login_request.email,
        "googleLogin": googleLogin,
        "name": name,
        "txn": txn,
        "user_role": user_role
    }
