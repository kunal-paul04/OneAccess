import uuid
from fastapi import APIRouter
from datetime import datetime
import pytz
import os
import jwt

router = APIRouter()


def generate_txn_number():
    return str(uuid.uuid4())


@router.get("/generate_txn_number", tags=["Basic"])
def generate_txn_number_route():
    return generate_txn_number()


def get_ist_time():
    ist = pytz.timezone(os.getenv("TIMEZONE"))
    utc_time = datetime.utcnow()
    ist_time = utc_time.replace(tzinfo=pytz.utc).astimezone(ist)
    return ist_time.replace(tzinfo=None)


def generate_jwt_token(jwt_record: dict) -> dict:
    secret_key = os.getenv("SECRET_KEY")
    algorithm = os.getenv("ALGORITHM")

    # Ensure they are loaded correctly
    if not secret_key or not algorithm:
        raise ValueError("SECRET_KEY or ALGORITHM environment variable is not set properly.")

    token = jwt.encode(jwt_record, secret_key, algorithm=algorithm)
    return token
