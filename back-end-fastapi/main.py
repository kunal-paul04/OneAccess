from fastapi import FastAPI
from lib.mongo_lib import database_connection
conn = database_connection()

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "Everyone"}
