import time
import secrets
import hashlib, os
from uuid import uuid4
from datetime import datetime
from pydantic import BaseModel, EmailStr
from fastapi import APIRouter, HTTPException, Depends, status
from app.database import get_mongo_client, MONGO_DB, MONGO_SERVICE_COLLECTION
from cryptography.fernet import Fernet
import base64

router = APIRouter()


# Load a key for encryption/decryption
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
cipher_suite = Fernet(ENCRYPTION_KEY)


class ClientServiceListRequest(BaseModel):
    client_email: EmailStr


class ClientServiceAddRequest(BaseModel):
    client_email: EmailStr
    app_key: str
    service_name: str
    service_domain: str
    service_uri: str


class ClientCreateRequest(BaseModel):
    client_email: EmailStr


class ClientServiceAppRequest(BaseModel):
    client_id: str


# Function to encrypt a given app_key
def encrypt_app_key(app_key: str) -> str:
    encrypted_key = cipher_suite.encrypt(app_key.encode("utf-8"))
    return encrypted_key.decode("utf-8")

# Function to decrypt a given encrypted app_key
def decrypt_app_key(encrypted_key: str) -> str:
    decrypted_key = cipher_suite.decrypt(encrypted_key.encode("utf-8"))
    return decrypted_key.decode("utf-8")


@router.post("/get_service_list", tags=["Service Management"])
async def get_service_list(request: ClientServiceListRequest, mongo_client=Depends(get_mongo_client)):
    db = mongo_client[MONGO_DB]  # Get the database
    service_collection = db[MONGO_SERVICE_COLLECTION]

    if not request.client_email:
        raise HTTPException(status_code=400, detail="Client's email is required")

    # Check and fetch a list of services
    services = list(service_collection.find({"client_email": request.client_email}, {
        "_id": 0,  # Exclude the MongoDB ObjectID from the results
        "service_domain": 1,
        "service_name": 1,
        "app_key": 1,
        "service_uri": 1,
        "created_at": 1,
    }))

    if not services:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found!")

    # Encrypt the app_key for each service
    for service in services:
        service["enc_app_key"] = encrypt_app_key(service["app_key"])

    return {"success": True, "message": "Service found", "service_details": services}


@router.post("/add_service", tags=["Service Management"])
async def add_client_service(request: ClientServiceAddRequest, mongo_client=Depends(get_mongo_client)):
    db = mongo_client[MONGO_DB]  # Get the database
    service_collection = db[MONGO_SERVICE_COLLECTION]

    if not request.client_email:
        raise HTTPException(status_code=400, detail="Client's email is required")
    if not request.app_key:
        raise HTTPException(status_code=400, detail="App Key is required")
    if not request.service_name:
        raise HTTPException(status_code=400, detail="Service name is required")
    if not request.service_domain:
        raise HTTPException(status_code=400, detail="Service domain required")
    if not request.service_uri:
        raise HTTPException(status_code=400, detail="Redirect URI is required")

    service_data = {
        "service_name": request.service_name,
        "service_domain": request.service_domain,
        "service_uri": request.service_uri,
        "is_approved": 0
    }
    result = service_collection.update_one({"client_email": request.client_email, "app_key": request.app_key}, {"$set": service_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No changes were made")
    else:
        return {"success": True, "status_code": 200, "message": "Service registered successfully"}


# Endpoint to generate and store client_id and client_secret
@router.post("/generate_client", tags=["Service Management"])
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
    created_at = datetime.now().strftime('%d-%m-%Y %H:%M:%S')

    client_data = {
        "client_email": request.client_email,
        "app_key": app_key,
        "app_secret": app_secret,
        "created_at": created_at
    }
    try:
        service_collection.insert_one(client_data)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to insert data into the database")

    return {
        "success": True,
        "status_code": 200,
        "message": "Unique App Key generated and inserted successfully!",
        "app_key": app_key,
        "app_secret": app_secret,
        "created_at": created_at
    }


@router.post("/fetch_client", tags=["Service Management"])
async def fetch_client_detail(request: ClientServiceAppRequest, mongo_client=Depends(get_mongo_client)):
    db = mongo_client[MONGO_DB]
    service_collection = db[MONGO_SERVICE_COLLECTION]

    if not request.client_id:
        raise HTTPException(status_code=400, detail="APP Key is required")

    # Decrypt the client_id
    decrypted_client_id = decrypt_app_key(request.client_id)

    # Check and fetch a list of services
    services = service_collection.find_one({"app_key": decrypted_client_id}, {
        "_id": 0,  # Exclude the MongoDB ObjectID from the results
        "service_domain": 1,
        "service_name": 1,
        "app_key": 1,
        "app_secret": 1,
        "service_uri": 1,
        "created_at": 1,
    })

    if not services:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found!")

    return {"success": True, "status_code": 200, "message": "Service found", "data": services}
