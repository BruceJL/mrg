from pgdb import connect, DatabaseError
import logging


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
            cursor = conn.cursor()
            return cursor
    except DatabaseError as e:
        logging.debug(f"Database error occurred: {e}")
    except Exception as e:
        logging.debug(f"An error occurred: {e}")


if __name__ == "__main__":
    connect_to_database("postgres", "password")
