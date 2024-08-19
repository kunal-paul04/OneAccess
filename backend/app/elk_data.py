import os
import json
import requests
import time
from pydantic import BaseModel, Field, validator

ELK_URL = os.getenv("ELK_URL")
ELK_TOKEN = os.getenv("ELK_TOKEN")
CITY_INDEX = os.getenv("CITY_INDEX")


class CountryRequest(BaseModel):
    country_id: int = Field(..., example=99, description="Enter country id")

    @validator('country_id')
    def validate_country_id(cls, v):
        if not isinstance(v, int) or v <= 0:
            raise ValueError('Enter a valid country id!')
        return v


def get_states_list(country_id: int):
    start_time = time.time()
    batch_size = 100

    # Elasticsearch query using GET request
    query = {
        "query": {
            "bool": {
                "must": [
                    {"term": {"country_id": country_id}},
                    {"term": {"parent_id": 0}}
                ]
            }
        },
        "_source": ["name"],
        "sort": [{"name.keyword": {"order": "asc"}}],
        "size": batch_size
    }

    payload = json.dumps(query)
    headers = {
        'Authorization': f'Bearer {ELK_TOKEN}', # Uncomment if authentication is needed
        'Content-Type': 'application/json'
    }

    # Note the change to GET and adding the '_search' endpoint
    response = requests.get(f"{ELK_URL}/{CITY_INDEX}/_search", headers=headers, data=payload)

    try:
        curl_response = response.json()
    except json.JSONDecodeError:
        curl_response = {"message": "Failed to decode JSON response from ELK service.", "status": 500}

    end_time = time.time()
    curl_response['execution_time'] = end_time - start_time

    return curl_response


class StateRequest(BaseModel):
    state_id: int = Field(..., example=1, description="Enter state id")

    @validator('state_id')
    def validate_state_id(cls, v):
        if not isinstance(v, int) or v <= 0:
            raise ValueError('Enter a valid state id!')
        return v


def get_district_list(state_id: int):
    start_time = time.time()

    # The query in the JSON body format ELK expects
    query_body = {
        "query": {
            "bool": {
                "must": [
                    {"term": {"parent_id": state_id}}
                ]
            }
        },
        "_source": ["name"],
        "sort": [
            {"name.keyword": {"order": "asc"}}
        ]
    }

    headers = {
        'Content-Type': 'application/json'
    }

    # Send POST request to ELK
    response = requests.post(f"{ELK_URL}/{CITY_INDEX}/_search", headers=headers, data=json.dumps(query_body))

    try:
        curl_response = response.json()
    except json.JSONDecodeError:
        curl_response = {"message": "Failed to decode JSON response from ELK service.", "status": 500}

    end_time = time.time()
    curl_response['execution_time'] = end_time - start_time

    return curl_response
