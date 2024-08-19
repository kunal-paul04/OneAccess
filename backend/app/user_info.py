# app/user_info.py

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from graphene import ObjectType, String, Field, Schema
from ariadne.asgi import GraphQL
from app.database import get_mongo_client, MONGO_DB, MONGO_COLLECTION

# REST API Router
router = APIRouter()


class ProfileRequest(BaseModel):
    email: EmailStr


@router.post("/get_profile")
async def get_info(request: ProfileRequest, mongo_client=Depends(get_mongo_client)):
    db = mongo_client[MONGO_DB]
    users_collection = db[MONGO_COLLECTION]

    user = await users_collection.find_one(
        {"user_email": request.email},
        {
            "unique_id": 1,
            "name": 1,
            "given_name": 1,
            "family_name": 1,
            "gender": 1,
            "dob": 1,
            "_id": 0
        }
    )

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return {"success": True, "data": user}


# GraphQL Type and Query
class UserProfile(ObjectType):
    unique_id = String()
    name = String()
    given_name = String()
    family_name = String()
    gender = String()
    dob = String()


class Query(ObjectType):
    user_profile = Field(UserProfile, email=String(required=True))

    async def resolve_user_profile(self, info, email):
        mongo_client = info.context["mongo_client"]
        db = mongo_client[MONGO_DB]
        users_collection = db[MONGO_COLLECTION]

        user = await users_collection.find_one(
            {"user_email": email},
            {
                "unique_id": 1,
                "name": 1,
                "given_name": 1,
                "family_name": 1,
                "gender": 1,
                "dob": 1,
                "_id": 0
            }
        )

        if user:
            return UserProfile(**user)
        return None


# Create the GraphQL schema
schema = Schema(query=Query)

# GraphQL Router using Ariadne's GraphQL
graphql_router = GraphQL(schema, context_value=lambda request: {"mongo_client": get_mongo_client()})
