from pgdb import connect, DatabaseError
import logging
import os

# Set up the database connection
DB_USERNAME = os.environ.get("DB_USERNAME")
DB_PASSWORD = os.environ.get("DB_PASSWORD")


def connect_to_database(username, password):
    try:
        # Connect to the database
        with connect(
            # localhost cause contacting postgres on ::1
            dsn="127.0.0.1:mrg",
            user=username,
            password=password,
        ) as conn:
            conn.autocommit = True
            return conn
    except DatabaseError as e:
        logging.debug(f"Database error occurred: {e}")
    except Exception as e:
        logging.debug(f"An error occurred: {e}")
