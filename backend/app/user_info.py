from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from app.database import get_mongo_client, MONGO_DB, MONGO_COLLECTION

# REST API Router
router = APIRouter()


class ProfileRequest(BaseModel):
    email: EmailStr


@router.post("/get_profile")
async def get_info(request: ProfileRequest, mongo_client=Depends(get_mongo_client)):
    db = mongo_client[MONGO_DB]
    users_collection = db[MONGO_COLLECTION]
    user = users_collection.find_one(
        {"user_email": request.email},
        {
            "unique_id": 1,
            "name": 1,
            "user_phone": 1,
            "given_name": 1,
            "family_name": 1,
            "gender": 1,
            "dob": 1,
            "isprofileUpdated": 1,
            "_id": 0
        }
    )

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return {"success": True, "data": user}