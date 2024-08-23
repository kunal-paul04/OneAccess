import uuid
from fastapi import APIRouter

router = APIRouter()


@router.get("/generate_txn_number", tags=["Basic"])
def generate_txn_number():
    # Option 1: Generate a UUID-based transaction number
    txn_number = str(uuid.uuid4())
    return txn_number
