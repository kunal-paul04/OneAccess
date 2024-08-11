# library file mongo connection
from pymongo import MongoClient
import os
from configparser import ConfigParser

# load config file
filename = os.path.join(os.path.dirname(__file__), 'config.ini')
config_object = ConfigParser()
config_object.read(filename)
# load connection credentials from config file
db_config = config_object["database"]

# Extract the database configuration
connection_uri = db_config['connection_uri']


def database_connection():
    # Construct the MongoDB URI
    mongo_con_uri = f"{connection_uri}"
    # Connect to MongoDB
    conn_client = MongoClient(mongo_con_uri)
    return conn_client
