from pymongo import MongoClient
from sqlalchemy.orm import Session
from app.migrate_users import migrate_users
from app.login import router as login_router
from app.user_info import router as user_router
from app.sms_service import router as sms_router
from app.database import get_db, get_mongo_client
from app.mail_service import router as send_email
from app.register import router as register_router
from fastapi import FastAPI, HTTPException, Depends
from app.utils import router as generate_txn_number
from starlette.middleware.cors import CORSMiddleware
from app.client_service import router as client_router
from app.google_auth import router as google_auth_router
from app.update_profile import router as update_profile_router
from app.elk_data import get_states_list, CountryRequest, StateRequest, get_district_list

app = FastAPI()


@app.get("/", tags=["Basic"])
def read_root():
    return {"Hello": "FastSSO.git checkout "}


@app.get("/migrate_users", tags=["Basic"])
async def migrate_users_endpoint(
    mysql_db: Session = Depends(get_db),
    mongo_client: MongoClient = Depends(get_mongo_client)
):
    return await migrate_users(mysql_db, mongo_client)


# Allow CORS for development
app.add_middleware(
    CORSMiddleware,  # type: ignore
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the Google auth router
app.include_router(google_auth_router)

# Include the router from register.py
app.include_router(register_router)

# Include the login router
app.include_router(login_router)

# Include the router from user_info.py
app.include_router(user_router)

# Include the router from client_service.py
app.include_router(client_router)

# Include the router from update_profile.py
app.include_router(update_profile_router)

app.include_router(send_email)

app.include_router(sms_router)

app.include_router(generate_txn_number)


@app.post("/states", tags=["ELK"])
async def fetch_states(country_request: CountryRequest):
    response = get_states_list(country_request.country_id)
    if response.get("status") == 500:
        raise HTTPException(status_code=500, detail=response.get("message"))

    # Extract the 'name' field from each hit
    states = [hit["_source"]["name"] for hit in response.get("hits", {}).get("hits", [])]

    return {"states": states}


@app.post("/districts", tags=["ELK"])
async def fetch_districts(state_request: StateRequest):
    response = get_district_list(state_request.state_id)
    print(response)
    if response.get("status") == 500:
        raise HTTPException(status_code=500, detail=response.get("message"))

    # Extract the 'name' field from each hit
    districts = [hit["_source"]["name"] for hit in response.get("hits", {}).get("hits", [])]

    return {"districts": districts}
