import os
import json
import http.client
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException

router = APIRouter()

# Load Infobip credentials from environment variables
INFOBIP_API_KEY = os.getenv("INFOBIP_API_KEY")
INFOBIP_BASE_URL = os.getenv("INFOBIP_BASE_URL")
SENDER_ID = os.getenv("SENDER_ID")

if not INFOBIP_API_KEY:
    raise ValueError("Missing INFOBIP_API_KEY environment variable")


def send_sms(to_phone_number: str, message: str):
    conn = http.client.HTTPSConnection(INFOBIP_BASE_URL)

    payload = json.dumps({
        "messages": [
            {
                "destinations": [{"to": to_phone_number}],
                "from": SENDER_ID,  # Replace with your sender ID
                "text": message
            }
        ]
    })

    headers = {
        'Authorization': f'App {INFOBIP_API_KEY}',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }

    conn.request("POST", "/sms/2/text/advanced", payload, headers)

    res = conn.getresponse()
    data = res.read()

    return data.decode("utf-8")


class SendSmsRequest(BaseModel):
    to_phone_number: str
    message: str


@router.post("/send-sms/", tags=["Third party Services"])
async def send_sms_endpoint(request: SendSmsRequest):
    try:
        sms_response = send_sms(request.to_phone_number, request.message)
        return {"message": "SMS sent successfully!", "sms_response": sms_response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))