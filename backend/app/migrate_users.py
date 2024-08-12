from sqlalchemy.orm import Session
from pymongo import MongoClient
from sqlalchemy import text
from fastapi import HTTPException


async def migrate_users(mysql_db: Session, mongo_client: MongoClient, batch_size: int = 100000):
    try:
        # Access the MongoDB collection
        mongo_collection = mongo_client['masterDB']['sso_users_master']

        # List to store inserted user details
        inserted_users = []

        offset = 0

        while True:
            # MySQL query to fetch data in batches
            query = text(f"""
                SELECT dl_id, screen_name, first_name, last_name, gender, dob, user_email, user_phone, address, state_id, city_id, zip, user_verification, age_bracket
                FROM vms_users
                LIMIT :limit OFFSET :offset
            """)

            result = mysql_db.execute(query, {"limit": batch_size, "offset": offset})

            # Fetch rows
            rows = result.fetchall()
            if not rows:
                break

            batch = []
            for row in rows:
                user = {
                    "dl_id": row[0],
                    "screen_name": row[1],
                    "first_name": row[2],
                    "last_name": row[3],
                    "gender": row[4],
                    "dob": row[5],
                    "user_email": row[6],
                    "user_phone": row[7],
                    "address": row[8],
                    "state_id": row[9],
                    "city_id": row[10],
                    "zip": row[11],
                    "user_verification": row[12],
                    "age_bracket": row[13],
                }

                # Add the user to the batch
                batch.append(user)

            if batch:
                # Insert the batch into MongoDB
                mongo_collection.insert_many(batch)

                # Collect the inserted user details
                inserted_users.extend({
                    "dl_id": u["dl_id"],
                    "user_phone": u["user_phone"]
                } for u in batch)

                print(f"Inserted batch of {len(batch)} users into MongoDB")

            # Move to the next batch
            offset += batch_size

        # Check if any users were inserted
        if not inserted_users:
            raise HTTPException(status_code=404, detail="No users found")

        return {
            "status_code": 200,
            "message": f"Successfully inserted {len(inserted_users)} users into MongoDB",
            "inserted_users": inserted_users  # Include the list of inserted users
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
