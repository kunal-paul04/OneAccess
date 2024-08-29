import uuid
from fastapi import APIRouter
from datetime import datetime
import pytz
import os

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
