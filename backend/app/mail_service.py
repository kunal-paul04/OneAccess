from fastapi import HTTPException, APIRouter
from pydantic import BaseModel
from mailjet_rest import Client
import os

router = APIRouter()

# Load Mailjet API credentials from environment variables
MAILJET_API_KEY = os.getenv("MAILJET_API_KEY")
MAILJET_SECRET_KEY = os.getenv("MAILJET_SECRET_KEY")
MAILJET_TEMPLATE_ID = os.getenv("MAILJET_TEMPLATE_ID")
MAILJET_SENDER = os.getenv("MAILJET_SENDER_ID")

if not MAILJET_API_KEY or not MAILJET_SECRET_KEY or not MAILJET_TEMPLATE_ID:
    raise ValueError("Missing required environment variables")

# Convert MAILJET_TEMPLATE_ID to integer and handle ValueError
try:
    MAILJET_TEMPLATE_ID = int(MAILJET_TEMPLATE_ID)
except ValueError:
    raise ValueError("Invalid MAILJET_TEMPLATE_ID environment variable")


mailjet = Client(auth=(MAILJET_API_KEY, MAILJET_SECRET_KEY), version='v3.1')


class EmailRequest(BaseModel):
    to_email: str
    to_name: str


@router.post("/send-email/", tags=["Third party Services"])
async def send_email(email_request: EmailRequest):
    data = {
        'Messages': [
            {
                "From": {
                    "Email": MAILJET_SENDER,
                    "Name": "OneAccess"
                },
                "To": [
                    {
                        "Email": email_request.to_email,
                        "Name": email_request.to_name
                    }
                ],
                "TemplateID": MAILJET_TEMPLATE_ID,
                "TemplateLanguage": True,
                "Subject": "Welcome to OneAccess",
                "Variables": {
                    "to_name": email_request.to_name  # Ensure this matches the template variable
                }
            }
        ]
    }

    result = mailjet.send.create(data=data)

    if result.status_code == 200:
        return {"message": "Email sent successfully!"}
    else:
        raise HTTPException(status_code=result.status_code, detail=result.json())
