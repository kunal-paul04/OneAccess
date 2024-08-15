import os
import time
import uuid
from dotenv import load_dotenv
from google.oauth2 import id_token
from pydantic import BaseModel, EmailStr
from google.auth.transport import requests
from fastapi.responses import JSONResponse
from fastapi import APIRouter, HTTPException, Depends
from app.database import get_mongo_client, MONGO_DB, MONGO_COLLECTION
from app.register import generate_unique_id


router = APIRouter()

load_dotenv()

# Google Client ID from .env file
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_AUTH_CLIENT_ID")


class GoogleLoginRequest(BaseModel):
    id_token: str


class LogoutRequest(BaseModel):
    txn: str
    email: EmailStr
    isGoogleLogin: int


def generate_txn_number():
    # Option 1: Generate a UUID-based transaction number
    txn_number = str(uuid.uuid4())
    return txn_number


@router.post("/google-login")
async def google_login(request: GoogleLoginRequest, mongo_client=Depends(get_mongo_client)):
    try:
        db = mongo_client[MONGO_DB]  # Get the database
        users_collection = db[MONGO_COLLECTION]  # Get the collection
        # Verify the token with Google
        sleep_time = float(os.getenv("AUTH_SLEEP_TIME"))  # Wait time before verification
        time.sleep(sleep_time)
        info = id_token.verify_oauth2_token(request.id_token, requests.Request(), GOOGLE_CLIENT_ID)

        # Ensure that the token is intended for this app
        if info['aud'] != GOOGLE_CLIENT_ID:
            raise HTTPException(status_code=401, detail="Token was not issued for this app.")

        # Check if the token is expired
        if info['exp'] < time.time():
            raise HTTPException(status_code=401, detail="Token has expired.")

        txn = generate_txn_number()
        email = info["email"]
        name = info.get("name")
        profile_pic = info.get("picture")

        # Check if the user already exists
        existing_user = users_collection.find_one({"user_email": email})
        if existing_user is None:

            name_parts = name.split()
            given_name = ' '.join(name_parts[:-1]) if len(name_parts) > 1 else name_parts[0]
            family_name = name_parts[-1] if len(name_parts) > 1 else ''

            # Hash the password and save the user
            hashed_password = ''
            unique_id = generate_unique_id(users_collection)
            user_data = {
                "unique_id": unique_id,
                "user_email": email,
                "name": name,
                "given_name": given_name,
                "family_name": family_name,
                "passkey": hashed_password,
                "profile_pic": profile_pic,
                "googleLogin": 1
            }
            result = users_collection.insert_one(user_data)
            if result.inserted_id is None:
                raise HTTPException(status_code=500, detail="User registration failed")

        # Handle user creation or authentication logic here
        return {
            "success": True,
            "message": "Login successful",
            "txn": txn,
            "email": email,
            "name": name,
            "profile_pic": profile_pic
        }

    except ValueError as e:
        # This exception is raised if the token is invalid
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")

    except HTTPException as e:
        # Pass through HTTP exceptions
        raise e

    except Exception as e:
        # Catch any other exceptions and return a generic error message
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {str(e)}. Please try again later.")


@router.post("/logout")
async def logout(request: LogoutRequest):
    try:
        # Invalidate the server-side session or token here
        # This might involve deleting a session from your database or cache
        g_login = bool(request.isGoogleLogin)
        if g_login:
            return JSONResponse(content={
                "success": True,
                "message": "Logged out from server, please sign out from Google client-side.",
                "google_signout_required": True
            })
        else:
            return {"success": True, "message": "Logout successful"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred during logout: {str(e)}. Try again later!")
