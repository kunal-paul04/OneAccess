import os
import hmac
import time
import secrets
import hashlib
from uuid import uuid4
from pymongo import MongoClient
from cryptography.fernet import Fernet
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr
from app.utils import get_ist_time, generate_jwt_token
from fastapi import APIRouter, HTTPException, Depends, status
from app.database import get_mongo_client, MONGO_DB, MONGO_SERVICE_COLLECTION, MONGO_COLLECTION, MONGO_CLIENT_COLLECTION, MONGO_TOKEN_COLLECTION


router = APIRouter()

# Load a key for encryption/decryption
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
cipher_suite = Fernet(ENCRYPTION_KEY)


# Function to encrypt a given app_key
@router.post("/encrypt_clientid", tags=["Service Management"])
def encrypt_app_key(app_key: str) -> str:
    encrypted_key = cipher_suite.encrypt(app_key.encode("utf-8"))
    return encrypted_key.decode("utf-8")


# Function to decrypt a given encrypted app_key
@router.post("/decrypt_clientid", tags=["Service Management"])
def decrypt_app_key(encrypted_key: str) -> str:
    decrypted_key = cipher_suite.decrypt(encrypted_key.encode("utf-8"))
    return decrypted_key.decode("utf-8")


class ClientServiceListRequest(BaseModel):
    client_email: EmailStr


# Endpoint to generate and store client_id and client_secret
@router.post("/generate_client", tags=["Service Management"])
async def generate_client_id(request: ClientServiceListRequest, mongo_client=Depends(get_mongo_client)):

    db = mongo_client[MONGO_DB]
    service_collection = db[MONGO_SERVICE_COLLECTION]
    sso_users_collection = db[MONGO_CLIENT_COLLECTION]
    sso_client_collection = db[MONGO_COLLECTION]

    HMAC_SECRET_KEY = secrets.token_bytes(32)

    if not request.client_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Client email is required!")

    # Generate unique app_key and ensure it's not in use
    while True:
        combine_data = f"{uuid4()}_{time.time()}_{secrets.token_hex(16)}"

        # Use HMAC with SHA-256
        appkey_hash = hmac.new(HMAC_SECRET_KEY, combine_data.encode(), hashlib.sha256).hexdigest()
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

    # get client's record from user master and prepare to insert in a client collection
    user = sso_client_collection.find_one({"user_email": request.client_email})

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid! Data not found")

    client_rec = {
        "app_key": app_key,
        "app_secret": app_secret,
        "user_email": request.client_email,
        "passkey": user.get("passkey"),
        "user_role": "CL-ADMIN",
        "address": user.get("address"),
        "city_id": user.get("city_id"),
        "country_id": user.get("country_id"),
        "dob": user.get("dob"),
        "gender": user.get("gender"),
        "name": user.get("name"),
        "state_id": user.get("state_id"),
        "user_phone": user.get("user_phone"),
        "zip": user.get("zip")
    }
    try:
        service_collection.insert_one(client_data)
        sso_users_collection.insert_one(client_rec)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to insert data into the database {str(e)}")

    return {
        "success": True,
        "status_code": 200,
        "message": "Unique App Key generated and inserted successfully!",
        "app_key": app_key,
        "app_secret": app_secret,
        "created_at": created_at
    }


@router.post("/get_service_list", tags=["Service Management"])
async def get_service_list(request: ClientServiceListRequest, mongo_client=Depends(get_mongo_client)):

    db = mongo_client[MONGO_DB]
    service_collection = db[MONGO_SERVICE_COLLECTION]
    sso_users_collection = db[MONGO_COLLECTION]

    requested_email = request.client_email.lower()

    if not requested_email:
        raise HTTPException(status_code=400, detail="Client's email is required")

    user = sso_users_collection.find_one({"user_email": requested_email}, {"_id": 0, "user_email": 1, "user_role": 1})

    if not user:
        raise HTTPException(status_code=400, detail="Data not found in User Collection")

    user_role = user.get("user_role")

    if user_role == "CL-USER":
        services = list(service_collection.find({"client_email": requested_email}, {
            "_id": 0,
            "service_domain": 1,
            "service_name": 1,
            "app_key": 1,
            "service_uri": 1,
            "is_approved": 1,
            "created_at": 1,
        }))
    elif user_role == "ADMIN-USER":
        services = list(service_collection.find({}, {
            "_id": 0,
            "service_domain": 1,
            "service_name": 1,
            "app_key": 1,
            "service_uri": 1,
            "is_approved": 1,
            "created_at": 1,
        }))
    else:
        raise HTTPException(status_code=403, detail="Unauthorized role")
    if not services:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found!")

    for service in services:
        service["enc_app_key"] = encrypt_app_key(service["app_key"])

    return {"success": True, "message": "Service found", "service_details": services}


class ClientServiceAddRequest(BaseModel):
    client_email: EmailStr
    app_key: str
    service_name: str
    service_domain: str
    service_uri: str


@router.post("/add_service", tags=["Service Management"])
async def add_client_service(request: ClientServiceAddRequest, mongo_client=Depends(get_mongo_client)):
    db = mongo_client[MONGO_DB]
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


class FetchClientRequest(BaseModel):
    client_id: str


@router.post("/fetch_client", tags=["Service Management"])
async def fetch_client_detail(request: FetchClientRequest, mongo_client=Depends(get_mongo_client)):

    db = mongo_client[MONGO_DB]
    service_collection = db[MONGO_SERVICE_COLLECTION]

    if not request.client_id:
        raise HTTPException(status_code=400, detail="Client ID is required")

    # Decrypt the client_id
    decrypted_client_id = decrypt_app_key(request.client_id)

    # Check and fetch a list of services
    services = service_collection.find_one({"app_key": decrypted_client_id}, {
        "_id": 0,
        "client_email": 1,
        "service_domain": 1,
        "service_name": 1,
        "app_key": 1,
        "app_secret": 1,
        "service_uri": 1,
        "created_at": 1,
        "is_approved": 1
    })

    if not services:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found!")

    return {
        "success": True,
        "status_code": 200,
        "message": "Service found",
        "data": services
    }


class ClientServiceApproveRequest(BaseModel):
    client_email: EmailStr
    client_id: str


@router.post("/approve_service", tags=["Service Management"])
async def approve_service_key(request: ClientServiceApproveRequest, mongo_client=Depends(get_mongo_client)):

    db = mongo_client[MONGO_DB]
    service_collection = db[MONGO_SERVICE_COLLECTION]

    if not request.client_email:
        raise HTTPException(status_code=400, detail="Client's email is required")
    if not request.client_id:
        raise HTTPException(status_code=400, detail="App Key is required")

    # Check if the combination of client_email and app_key exists
    existing_service = service_collection.find_one({"client_email": request.client_email, "app_key": request.client_id})

    if not existing_service:
        raise HTTPException(status_code=400, detail="The provided Client ID is not associated with requested email")

    service_data = {
        "is_approved": 1
    }
    result = service_collection.update_one({"client_email": request.client_email, "app_key": request.client_id},
                                           {"$set": service_data})

    if result.modified_count == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No changes were made")
    else:
        return {
            "success": True,
            "status_code": 200,
            "message": "Service Approved successfully"
        }


class TokenValidation(BaseModel):
    app_key: str
    app_secret: str
    token: str


@router.post("/validate_token", tags=["Client Login & Registration"])
async def validate_token(validation_request: TokenValidation, mongo_client: MongoClient = Depends(get_mongo_client)):

    sso_token_collection = mongo_client[MONGO_DB][MONGO_TOKEN_COLLECTION]

    client = sso_token_collection.find_one(
        {
            "app_key": validation_request.app_key,
            "app_secret": validation_request.app_secret,
            "id_token": validation_request.token
        }
    )

    if not client:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid client - UNKNOWN CLIENT ID")

    request_time = datetime.utcnow()
    expire_time = client.get("expire_time")

    if request_time > expire_time:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Token!")

    jwt_token = client.get("jwt_token")
    if jwt_token is not None:
        return {
            "success": True,
            "status_code": 200,
            "message": "Transaction successful",
            "jwt_token": jwt_token
        }
    else:
        return {
            "success": False,
            "status_code": 400,
            "message": "Transaction failed!"
        }


class ClientVerificationValidation(BaseModel):
    client_id: str
    origin: str


@router.post("/client_verification", tags=["Client Login & Registration"])
async def client_verification(client_request: ClientVerificationValidation, mongo_client: MongoClient = Depends(get_mongo_client)):

    client_service = mongo_client[MONGO_DB][MONGO_SERVICE_COLLECTION]

    client = client_service.find_one(
        {
            "app_key": client_request.client_id,
            "service_domain": client_request.origin,
            "is_approved": 1
        }
    )

    if not client:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid client credentials - UNKNOWN CLIENT ID")
    return {
        "success": True,
        "status_code": 200,
        "message": "Client Verified",
        "client_id": client_request.client_id,
        "origin": client_request.origin
    }


class LoginRequest(BaseModel):
    email: str
    clientId: str
    transactionId: str
    origin: str


@router.post("/client_login", tags=["Client Login & Registration"])
async def client_login(login_request: LoginRequest, mongo_client: MongoClient = Depends(get_mongo_client)):

    sso_users_collection = mongo_client[MONGO_DB][MONGO_COLLECTION]
    token_collection = mongo_client[MONGO_DB][MONGO_TOKEN_COLLECTION]
    client_service = mongo_client[MONGO_DB][MONGO_SERVICE_COLLECTION]
    client_collection = mongo_client[MONGO_DB][MONGO_CLIENT_COLLECTION]

    client = client_service.find_one({"app_key": login_request.clientId, "is_approved": 1})

    if not client:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid client - UNKNOWN CLIENT ID")

    txn = login_request.transactionId
    app_secret = client.get("app_secret")
    service_domain = client.get("service_domain")
    service_name = client.get("service_name")
    service_uri = client.get("service_uri")
    redirect_uri = client.get("service_uri")

    user_master = sso_users_collection.find_one({"user_email": login_request.email})

    if not user_master:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found in User Master Table")

    user_role = "CL-USER"

    user_client = client_collection.find_one({"user_email": login_request.email, "app_key": login_request.clientId})

    if not user_client:
        client_data = {
            "user_email": login_request.email,
            "user_role": user_role,
            "app_key": login_request.clientId,
            "app_secret": app_secret
        }

        client = client_collection.insert_one(client_data)

        if not client.inserted_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Insertion failed in Client Collection")
    else :
        user_role = user_client.get("user_role")

    dob = user_master.get("dob")
    username = user_master.get("name")
    user_email = user_master.get("user_email")
    user_role = user_role

    # Convert time in IST Format
    clock_time = get_ist_time()

    request_time = clock_time
    expire_time = clock_time + timedelta(minutes=float(os.getenv("JWT_EXPIRATION_MINUTES")))

    # Create JWT claims
    jwt_data = {
        "service_name": service_name,
        "service_domain": service_domain,
        "username": username,
        "user_email": user_email,
        "dob": dob,
        "exp": int((clock_time + timedelta(minutes=float(os.getenv("JWT_EXPIRATION_MINUTES")))).timestamp())
    }

    # Generate tokens
    jwt_record = {
        "iss": service_domain,
        "sub": service_name,
        "aud": login_request.clientId,
        "iat": int(request_time.timestamp()),
        "exp": int(expire_time.timestamp()),
        "auth_time": int(request_time.timestamp()),
        "given_name": username,
        "preferred_username": username,
        "email": user_email,
        "birthdate": dob,
        "user_role": user_role,
        "auth_txn": txn,
        "auth_mode": "ONEACCESS_AUTH"
    }

    id_token = generate_jwt_token(jwt_data)
    jwt_token = generate_jwt_token(jwt_record)

    # Insert token data into the database
    token_data = {
        "app_key": login_request.clientId,
        "app_secret": app_secret,
        "txn": txn,
        "user_email": user_email,
        "id_token": id_token,
        "jwt_token": jwt_token,
        "request_time": request_time,
        "expire_time": expire_time,
        "redirect_url": service_uri
    }
    result = token_collection.insert_one(token_data)

    # Return response
    if result.inserted_id:
        return {
            "success": True,
            "status_code": status.HTTP_200_OK,
            "detail": "Transaction successful",
            "id_token": id_token,
            "redirect_uri": redirect_uri
        }
    else:
        return {
            "success": False,
            "status_code": status.HTTP_400_BAD_REQUEST,
            "detail": "Transaction failed!",
            "redirect_uri": redirect_uri
        }


class RegistrationRequest(BaseModel):
    user_email: str
    city_id: str
    country_id: str
    dob: str
    name: str
    state_id: str
    user_phone: str
    clientId: str
    transactionId: str
    origin: str


@router.post("/client_registration", tags=["Client Login & Registration"])
async def client_registration(registration_request: RegistrationRequest, mongo_client: MongoClient = Depends(get_mongo_client)):

    service_collection = mongo_client[MONGO_DB][MONGO_SERVICE_COLLECTION]
    sso_users_collection = mongo_client[MONGO_DB][MONGO_COLLECTION]
    client_collection = mongo_client[MONGO_DB][MONGO_CLIENT_COLLECTION]
    token_collection = mongo_client[MONGO_DB][MONGO_TOKEN_COLLECTION]

    client = service_collection.find_one({"app_key": registration_request.clientId, "is_approved": 1})

    if not client:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid client - UNKNOWN CLIENT ID")

    txn = registration_request.transactionId
    service_name = client.get("service_name")
    service_domain = client.get("service_domain")
    service_uri = client.get("service_uri")
    app_secret = client.get("app_secret")
    redirect_uri = client.get("service_uri")

    user_role = "CL-USER"

    user_data = {
        "user_email": registration_request.user_email,
        "city_id": registration_request.city_id,
        "country_id": registration_request.country_id,
        "dob": registration_request.dob,
        "name": registration_request.name,
        "state_id": registration_request.state_id,
        "user_phone": registration_request.user_phone,
        "user_role": user_role,
    }
    # Insert in main user collection
    user = sso_users_collection.insert_one(user_data)

    if not user.inserted_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Insertion failed in User Collection")

    client_data = {
        "user_email": registration_request.user_email,
        "user_role": user_role,
        "app_key": registration_request.clientId,
        "app_secret": app_secret
    }

    client = client_collection.insert_one(client_data)

    if not client.inserted_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Insertion failed in Client Collection")

    dob = user_data['dob']
    username = user_data['name']
    user_email = user_data['user_email']
    user_role = user_data['user_role']

    # Convert time in IST Format
    clock_time = get_ist_time()

    request_time = clock_time
    expire_time = clock_time + timedelta(minutes=float(os.getenv("JWT_EXPIRATION_MINUTES")))

    # Create JWT claims
    jwt_data = {
        "service_name": service_name,
        "service_domain": service_domain,
        "username": username,
        "user_email": user_email,
        "dob": dob,
        "exp": int((clock_time + timedelta(minutes=float(os.getenv("JWT_EXPIRATION_MINUTES")))).timestamp())
    }

    # Generate tokens
    jwt_record = {
        "iss": service_domain,
        "sub": service_name,
        "aud": registration_request.clientId,
        "iat": int(request_time.timestamp()),
        "exp": int(expire_time.timestamp()),
        "auth_time": int(request_time.timestamp()),
        "given_name": username,
        "preferred_username": username,
        "email": user_email,
        "birthdate": dob,
        "user_role": user_role,
        "auth_txn": txn,
        "auth_mode": "ONEACCESS_AUTH"
    }

    id_token = generate_jwt_token(jwt_data)
    jwt_token = generate_jwt_token(jwt_record)

    # Insert token data into the database
    token_data = {
        "app_key": registration_request.clientId,
        "app_secret": app_secret,
        "txn": txn,
        "user_email": user_email,
        "id_token": id_token,
        "jwt_token": jwt_token,
        "request_time": request_time,
        "expire_time": expire_time,
        "redirect_url": service_uri
    }
    result = token_collection.insert_one(token_data)

    # Return response
    if result.inserted_id:
        return {
            "success": True,
            "status_code": status.HTTP_200_OK,
            "detail": "Transaction successful",
            "id_token": id_token,
            "redirect_uri": redirect_uri
        }
    else:
        return {
            "success": False,
            "status_code": status.HTTP_400_BAD_REQUEST,
            "detail": "Transaction failed!",
            "redirect_uri": redirect_uri
        }
