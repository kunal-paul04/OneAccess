from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from app.database import get_mongo_client, MONGO_DB, MONGO_COLLECTION

router = APIRouter()


class ProfileRequest(BaseModel):
    email: EmailStr


@router.post("/get_profile")
async def get_info(request: ProfileRequest, mongo_client=Depends(get_mongo_client)):
    return MONGO_COLLECTION
    # db = mongo_client[MONGO_DB]  # Get the database
    # users_collection = db[MONGO_COLLECTION]  # Get the collection
    #
    # # Check if the user already exists
    # check_user = users_collection.find_one({"user_email": request.email})
    # return {"success": True, "message": check_user}
    # print(check_user)
    # exit()
    # if check_user: