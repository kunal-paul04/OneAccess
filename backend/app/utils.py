import uuid
from fastapi import APIRouter

router = APIRouter()


def generate_txn_number():
    return str(uuid.uuid4())


@router.get("/generate_txn_number", tags=["Basic"])
def generate_txn_number_route():
    return generate_txn_number()
