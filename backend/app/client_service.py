from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from app.database import get_mongo_client, MONGO_DB, MONGO_SERVICE_COLLECTION

router = APIRouter()


class ClientServiceListRequest(BaseModel):
    client_email: EmailStr


@router.post("/get_services")
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
