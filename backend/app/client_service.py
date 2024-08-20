import time
import secrets
import hashlib
from uuid import uuid4
from pydantic import BaseModel, EmailStr
from fastapi import APIRouter, HTTPException, Depends, status
from app.database import get_mongo_client, MONGO_DB, MONGO_SERVICE_COLLECTION

router = APIRouter()


class ClientServiceListRequest(BaseModel):
    client_email: EmailStr


@router.post("/get_services", tags=["Client Management"])
async def get_service_list(request: ClientServiceListRequest, mongo_client=Depends(get_mongo_client)):
    db = mongo_client[MONGO_DB]  # Get the database
    service_collection = db[MONGO_SERVICE_COLLECTION]

    if not request.client_email:
        raise HTTPException(status_code=400, detail="Client's email is required")

    # Check and fetch a list of services
    services = list(service_collection.find({"client_email": request.client_email}, {
        "_id": 0,  # Exclude the MongoDB ObjectID from the results
        "domain": 1,
        "app_name": 1,
        "service_id": 1,
        "callback_url": 1,
        "last_modified": 1,
    }))

    if not services:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found!")

    return {"success": True, "message": "Service found", "service_details": services}


# Pydantic model for creating a client
class ClientCreateRequest(BaseModel):
    client_email: EmailStr


# Endpoint to generate and store client_id and client_secret
@router.post("/generate_client", tags=["Client Management"])
async def generate_client_id(request: ClientServiceListRequest, mongo_client=Depends(get_mongo_client)):
    db = mongo_client[MONGO_DB]
    service_collection = db[MONGO_SERVICE_COLLECTION]

    if not request.client_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Client email is required!")

    # Generate unique app_key and ensure it's not in use
    while True:
        combine_data = f"{uuid4()}_{time.time()}_{secrets.token_hex(16)}"
        appkey_hash = hashlib.sha256(combine_data.encode()).hexdigest()
        app_key = '-'.join(appkey_hash[i:i + 8] for i in range(0, len(appkey_hash), 8))
        existing_client = service_collection.find_one({"app_key": app_key})
        if not existing_client:
            break

    app_secret = secrets.token_hex(40)

    return {
        "success": True,
        "message": "Unique App Key generated successfully!",
        "Application_Key": app_key,
        "Application_Secret": app_secret
    }
