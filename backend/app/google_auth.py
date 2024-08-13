from fastapi import APIRouter, HTTPException
from google.oauth2 import id_token
from google.auth.transport import requests
from pydantic import BaseModel
import time, os

router = APIRouter()

# Replace with your actual Google Client ID
GOOGLE_CLIENT_ID = "703966748664-06lfs5d36m4638v5k83n9t6j8mgtrf7k.apps.googleusercontent.com"

class GoogleLoginRequest(BaseModel):
    id_token: str

@router.post("/google-login")
async def google_login(request: GoogleLoginRequest):
    try:
        # Verify the token with Google
        sleep_time = float(os.getenv("AUTH_SLEEP_TIME")) # Wait time before verification
        time.sleep(sleep_time)
        idinfo = id_token.verify_oauth2_token(request.id_token, requests.Request(), GOOGLE_CLIENT_ID)

        # Ensure that the token is intended for this app
        if idinfo['aud'] != GOOGLE_CLIENT_ID:
            raise HTTPException(status_code=401, detail="Token was not issued for this app.")

        # Check if the token is expired
        if idinfo['exp'] < time.time():
            raise HTTPException(status_code=401, detail="Token has expired.")

        # Extract user information from the token
        user_id = idinfo["sub"]
        email = idinfo["email"]
        name = idinfo.get("name")
        detail = idinfo

        # Handle user creation or authentication logic here
        return {"success": True, "message": "Login successful", "user_id": user_id, "email": email, "name": name, "complete_detail": detail}

    except ValueError as e:
        # This exception is raised if the token is invalid
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")

    except HTTPException as e:
        # Pass through HTTP exceptions
        raise e

    except Exception as e:
        # Catch any other exceptions and return a generic error message
        raise HTTPException(status_code=500, detail="An internal error occurred. Please try again later.")
