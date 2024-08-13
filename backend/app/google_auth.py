from fastapi import APIRouter, HTTPException
from google.oauth2 import id_token
from google.auth.transport import requests
from pydantic import BaseModel

router = APIRouter()

# Replace YOUR_GOOGLE_CLIENT_ID with your actual client ID
GOOGLE_CLIENT_ID = "703966748664-06lfs5d36m4638v5k83n9t6j8mgtrf7k.apps.googleusercontent.com"


class GoogleLoginRequest(BaseModel):
    id_token: str


@router.post("/google-login")
async def google_login(request: GoogleLoginRequest):
    try:
        # Verify the token with Google
        idinfo = id_token.verify_oauth2_token(
            request.id_token, requests.Request(), GOOGLE_CLIENT_ID
        )

        # Extract user information from the token
        user_id = idinfo["sub"]
        email = idinfo["email"]
        name = idinfo.get("name")

        # Here, you can handle user creation or authentication
        # For demonstration, we'll assume the login is successful
        return {"success": True, "message": "Login successful", "user_id": user_id, "email": email, "name": name}

    except ValueError:
        # Invalid token
        raise HTTPException(status_code=401, detail="Invalid Google token")
