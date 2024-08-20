from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from app.database import get_mongo_client, MONGO_DB, MONGO_SERVICE_COLLECTION

router = APIRouter()


class ClientServiceListRequest(BaseModel):
    client_email: EmailStr


class ClientServiceAddRequest(BaseModel):
    client_email: EmailStr
    service_domain: str



@router.post("/get_services", tags=["Get Details"])
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


@router.post("/add_service", tags=["Add New Service"])
async def add_client_service(request: ClientServiceAddRequest, mongo_client=Depends(get_mongo_client)):
    db = mongo_client[MONGO_DB]  # Get the database
    service_collection = db[MONGO_SERVICE_COLLECTION]

    if not request.client_email:
        raise HTTPException(status_code=400, detail="Client's email is required")

    # Check if the user already exists
    existing_app = service_collection.find_one({"app_key": request.app_key})
    if existing_app:
        raise HTTPException(status_code=400, detail="App Key already exists")

    service_data = {
        "client_email": request.client_email,
        "service_name": request.service_name,
        "service_domain": request.service_domain,
        "service_uri": request.service_uri,
        "app_key": request.app_key,
        "app_secret": request.app_secret,
        "updation_date": request.client_email
    }
    result = service_collection.insert_one(service_data)
    if result.inserted_id:
        return {"success": True, "status_code": 200, "message": "Service registered successfully"}
    else:
        raise HTTPException(status_code=500, detail="Service registration failed")
