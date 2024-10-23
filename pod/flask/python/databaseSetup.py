from pgdb import connect, DatabaseError


def connect_to_database(username, password):
    try:
        # Connect to the database
        with connect(
            dsn="localhost:mrg",
            user=username,
            password=password,
        ) as conn:
            conn.autocommit = True
            cursor = conn.cursor()
            print("Connected to the database")
            return cursor

    except DatabaseError as e:
        print("Failed to connect:", e)


if __name__ == "__main__":
    connect_to_database("tracyhuang", "password")
