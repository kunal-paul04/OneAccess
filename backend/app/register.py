import uuid
import hmac
from pydantic import BaseModel, EmailStr
from fastapi import APIRouter, HTTPException, Depends
from app.utils import generate_txn_number, hash_password
from app.database import get_mongo_client, MONGO_DB, MONGO_COLLECTION

router = APIRouter()


def generate_unique_id(collection) -> str:
    while True:
        unique_id = f"DL-{uuid.uuid4()}"
        if collection.find_one({"unique_id": unique_id}) is None:
            return unique_id


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    confirmPassword: str


@router.post("/register", tags=["Login & Registration"])
async def register(request: RegisterRequest, mongo_client=Depends(get_mongo_client)):
    db = mongo_client[MONGO_DB]  # Get the database
    users_collection = db[MONGO_COLLECTION]  # Get the collection

    if not hmac.compare_digest(request.password, request.confirmPassword):
        raise HTTPException(status_code=400, detail="Passwords do not match")

    # Check if the user already exists
    existing_user = users_collection.find_one({"user_email": request.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    # Hash the password and save the user
    hashed_password = hash_password(request.password)
    unique_id = generate_unique_id(users_collection)
    user_role = "CL-USER"
    googleLogin = 0
    user_data = {
        "unique_id": unique_id,
        "user_email": request.email,
        "passkey": hashed_password,
        "googleLogin": googleLogin,
        "user_role": user_role
    }
    result = users_collection.insert_one(user_data)
    txn = generate_txn_number()
    if result.inserted_id:
        return {
            "status_code": 200,
            "success": True,
            "message": "User registered successfully",
            "email": request.email,
            "googleLogin": googleLogin,
            "txn": txn,
            "user_role": user_role
        }
    else:
        raise HTTPException(status_code=500, detail="User registration failed")
