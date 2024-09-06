import os
from mailjet_rest import Client
from pydantic import BaseModel, EmailStr
from datetime import datetime,  timedelta
from fastapi import HTTPException, APIRouter, Depends
from app.utils import generate_otp, generate_txn_number
from app.database import get_mongo_client, MONGO_DB, MONGO_OPT_GENERATE

router = APIRouter()


def get_mailjet_client():
    mailjet_api_key = os.getenv("MAILJET_API_KEY")
    mailjet_secret_key = os.getenv("MAILJET_SECRET_KEY")
    mailjet_welcome_template = os.getenv("MAILJET_WELCOME_TEMPLATE")
    mailjet_otp_template = os.getenv("MAILJET_OTP_TEMPLATE")
    mailjet_sender_id = os.getenv("MAILJET_SENDER_ID")

    # Ensure all environment variables are set correctly
    if not all([mailjet_api_key, mailjet_secret_key, mailjet_welcome_template, mailjet_otp_template, mailjet_sender_id]):
        raise ValueError("Missing one or more required Mailjet environment variables")

    # Convert MAILJET_TEMPLATE_IDs to integers and handle ValueError
    try:
        mailjet_welcome_template = int(mailjet_welcome_template)
        mailjet_otp_template = int(mailjet_otp_template)
    except ValueError:
        raise ValueError("Invalid Mailjet template ID environment variable")

    # Create and return a Mailjet client instance
    mailjet_client = Client(auth=(mailjet_api_key, mailjet_secret_key), version='v3.1')
    return mailjet_client, mailjet_welcome_template, mailjet_otp_template, mailjet_sender_id


class WelcomeEmailRequest(BaseModel):
    to_email: EmailStr
    to_name: str


@router.post("/welcome_email", tags=["Third party Services"])
async def welcome_email(email_request: WelcomeEmailRequest, mailjet_data: tuple = Depends(get_mailjet_client)):

    mailjet_client, mailjet_welcome_template, mailjet_sender_id = mailjet_data

    # Prepare the email data
    data = {
        'Messages': [
            {
                "From": {
                    "Email": mailjet_sender_id,
                    "Name": "Streamify"
                },
                "To": [
                    {
                        "Email": email_request.to_email,
                        "Name": email_request.to_name
                    }
                ],
                "TemplateID": mailjet_welcome_template,
                "TemplateLanguage": True,
                "Subject": "Welcome to Streamify",
                "Variables": {
                    "to_name": email_request.to_name
                }
            }
        ]
    }

    result = mailjet_client.send.create(data=data)

    if result.status_code == 200:
        return {"message": "Email sent successfully!"}
    else:
        raise HTTPException(status_code=result.status_code, detail=result.json())


class OtpEmailRequest(BaseModel):
    to_email: EmailStr


@router.post("/send_otp", tags=["Third party Services"])
async def send_otp(email_request: OtpEmailRequest, mongo_client=Depends(get_mongo_client), mailjet_data: tuple = Depends(get_mailjet_client)):

    mailjet_client, _, mailjet_otp_template, mailjet_sender_id = mailjet_data

    otp_code = generate_otp()
    txn_number = generate_txn_number()

    otp_generation_time = datetime.now()
    otp_expiry_time = otp_generation_time + timedelta(minutes=1)
    formatted_expiry_time = otp_expiry_time.strftime("%d-%m-%Y %H:%M:%S")

    try:
        db = mongo_client[MONGO_DB]
        otp_collection = db[MONGO_OPT_GENERATE]

        otp_data = {
            "user_email": email_request.to_email,
            "otp_random_id": txn_number,
            "otp": otp_code,
            "otp_generation_time": otp_generation_time.strftime("%d-%m-%Y %H:%M:%S"),
            "otp_expiry_time": formatted_expiry_time
        }

        otp_collection.insert_one(otp_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to insert OTP data: {str(e)}")

        # Prepare the email data
    data = {
        'Messages': [
            {
                "From": {
                    "Email": mailjet_sender_id,
                    "Name": "Streamify"
                },
                "To": [
                    {
                        "Email": email_request.to_email
                    }
                ],
                "TemplateID": mailjet_otp_template,
                "TemplateLanguage": True,
                "Subject": "Streamify-OTP Verification",
                "Variables": {
                    "to_email": email_request.to_email,
                    "otp": otp_code,
                    "expiry_time": formatted_expiry_time
                }
            }
        ]
    }

    result = mailjet_client.send.create(data=data)

    if result.status_code == 200:
        return {
            "status_code": 200,
            "message": "OTP email sent successfully!",
            # "otp": otp_code,
            "otp_random_id": txn_number
        }
    else:
        print("Mailjet API response:", result.json())
        raise HTTPException(status_code=result.status_code, detail=result.json())


class OtpVerificationRequest(BaseModel):
    email: str
    otp: int
    otp_random_id: str


@router.post("/verify_otp", tags=["Third party Services"])
async def verify_otp(otp_request: OtpVerificationRequest, mongo_client=Depends(get_mongo_client)):
    try:
        db = mongo_client[MONGO_DB]
        otp_collection = db[MONGO_OPT_GENERATE]

        otp_record = otp_collection.find_one({"user_email": otp_request.email, "otp_random_id": otp_request.otp_random_id})

        if not otp_record:
            raise HTTPException(status_code=404, detail="OTP not found for the given email and transaction ID.")

        if otp_record['otp'] != otp_request.otp:
            raise HTTPException(status_code=400, detail="Invalid OTP.")

        otp_expiry_time = datetime.strptime(otp_record['otp_expiry_time'], "%d-%m-%Y %H:%M:%S")
        if datetime.now() > otp_expiry_time:
            otp_collection.update_one({"_id": otp_record["_id"]}, {"$set": {"status": 2}})
            raise HTTPException(status_code=400, detail="OTP has expired.")

        otp_collection.update_one({"_id": otp_record["_id"]}, {"$set": {"status": 1}})

        return {
            "status_code": 200,
            "email": otp_request.email,
            "message": "OTP verification successful."
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred while verifying OTP: {str(e)}")
