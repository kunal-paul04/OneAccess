from typing import Optional
from pydantic import BaseModel
from pymongo import MongoClient
from fastapi import APIRouter, HTTPException, Depends, status
from app.database import get_mongo_client, MONGO_DB, MONGO_COLLECTION

router = APIRouter()


# Pydantic model for request body validation
class UpdateProfileRequest(BaseModel):
    name: Optional[str]
    dob: str
    gender: str
    country_id: int
    state_id: str
    city_id: str
    zip: str
    address: str
    user_phone: int


@router.put("/update-profile/{email}", tags=["Get & Update Details"])
async def update_profile(email: str, profile_data: UpdateProfileRequest, mongo_client: MongoClient = Depends(get_mongo_client)):
    db = mongo_client[MONGO_DB]
    collection = db[MONGO_COLLECTION]

    # Check if the user exists
    user = collection.find_one({"user_email": email})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Prepare update data
    update_data = {k: v for k, v in profile_data.model_dump().items() if v is not None}

    update_data['isprofileUpdated'] = 1

    # Update the user's profile
    result = collection.update_one({"user_email": email}, {"$set": update_data})

    if result.modified_count == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No changes were made")

    return {"status_code": 200, "message": "Profile updated successfully"}
