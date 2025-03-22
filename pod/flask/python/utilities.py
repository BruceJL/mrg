from pgdb import connect, DatabaseError, Cursor
import logging
import math
import random
from EventEntry import EventEntry
from RingAssignment import RingAssignment
from RoundRobin import RoundRobinTournament
from Event import Event
from Entry import Entry
from retrying import retry


def get_db_password():
    """Extract password from the environment variable file."""
    try:
        # Read the content of the password file
        with open("pod/passwords.txt", "r") as f:
            lines = f.readlines()

        # Find the line that sets the POSTGRESPWD variable
        for line in lines:
            if line.startswith("export FLASKDBPWD="):
                # Extract the password part after '='
                password = line.split("=")[1].strip()
                print(f"Password found in the file: {password}")
                return password

        # If the password is not found in the file
        print("Password not found in the file.")
        return None
    except Exception as e:
        print(f"Error reading password from file: {e}")
        return None


@retry(wait_fixed=2000, stop_max_attempt_number=10)
def connect_to_database(username, password, db_port):
    print("Attempting database connection...")
    # try:
    # Connect to the database
    conn = connect(
        # localhost cause contacting postgres on ::1
        dsn="127.0.0.1:mrg",
        user=username,
        password=password,
        port=db_port,
    )
    conn.autocommit = True
    print("Conencted!")
    return conn


# except DatabaseError as e:
#     logging.error(f"Database error occurred: {e}")
# except Exception as e:
#     logging.error(f"An error occurred: {e}")


# stolen from:
# https://stackoverflow.com/questions/9647202/ordinal-numbers-replacement
def make_ordinal(n: "int") -> str:
    """
    Convert an integer into its ordinal representation::

        make_ordinal(0)   => '0th'
        make_ordinal(3)   => '3rd'
        make_ordinal(122) => '122nd'
        make_ordinal(213) => '213th'
    """
    n = int(n)
    suffix = ["th", "st", "nd", "rd", "th"][min(n % 10, 4)]
    if 11 <= (n % 100) <= 13:
        suffix = "th"
    return suffix


# Gets the list of events types from the database.
def get_event_list_from_database(
    cursor: Cursor,
) -> dict[str, Event]:
    cursor.execute("SELECT * FROM robots.competition;")
    data = cursor.fetchall()
    events: dict[str, Event] = {}

    for row in data:
        if row.name != "":
            event = Event(
                id=row.name,
                min_entries_per_ring=row.minRobotsPerRing,
                max_entries_per_ring=row.maxRobotsPerRing,
                max_rings=row.rings,
                max_entries=row.maxEntries,
                long_name=row.longName,
            )
        # event.check_string = row['checkString']
        events[row.name] = event
    return events


# Get Robot's info by its ID from the database
def get_robot_entry_from_database(
    cursor: Cursor,
    robot_id: str,
) -> Entry:
    sql = f'SELECT * FROM robots."robot" WHERE id = {robot_id};'
    cursor.execute(sql)
    data = cursor.fetchall()
    return make_entry(data[0])


def make_entry(row: tuple[str, "Any"]) -> Entry:
    return Entry(
        id=row.id,
        robotName=row.name,
        coach=row.coach,
        school=row.school,
        competition=row.competition,
        driver1=row.driver1,
        driver1Grade=row.driver1gr,
        driver2=row.driver2,
        driver2Grade=row.driver2gr,
        driver3=row.driver3,
        driver3Grade=row.driver3gr,
        checkInStatus=row.checkInStatus,
        measured=row.measured,
        registered=row.registered,
        paymentType=row.paymentType,
    )


# Gets all the entries from the database
def get_all_entries_from_database(cursor: Cursor) -> list[Entry]:
    cursor.execute("SELECT * FROM robots.robot ORDER BY school;")
    data = cursor.fetchall()
    entries: list[Entry] = []

    for row in data:
        if row.name != "":
            entries.append(make_entry(row))

    # sort the entries by school
    entries.sort(key=lambda x: x.school)

    return entries


# Gets all the entries for a given event from the database
def get_event_entries_from_database(
    cursor: Cursor,
    event: Event,
) -> None:
    sql = (
        "SELECT * FROM robots.robot WHERE competition = "
        + f"'{event.id}' ORDER BY registered;"
    )

    cursor.execute(sql)

    data = cursor.fetchall()

    for row in data:
        if row.name != "":
            event.add_entry(make_entry(row))


# Creates the ring assignments (EventEntry's) for a given competition from
# the database
def load_ring_assignments_from_database(
    cursor: Cursor,
    event: Event,
) -> None:

    # get all tournaments for the event
    sql = f"SELECT * FROM robots.tournament WHERE competition = '{event.id}';"
    cursor.execute(sql)
    data = cursor.fetchall()

    # loop through the tournaments and get corresponding ring assignments by tournament id
    for row in data:
        tournament_id: int = row.id
        ring: int = row.ring
        q = f'SELECT * FROM robots."ringAssignment" WHERE tournament = {tournament_id};'
        cursor.execute(q)
        ring_assignment_data = cursor.fetchall()

        for assignment in ring_assignment_data:
            found_entry = None
            # Associate a robot with the entry
            for entry in event.entries:
                if entry.id == assignment.robot:
                    found_entry = entry
                    break

            assert (
                found_entry is not None
            ), f"No matching robot for id: {entry.id} found."

            event_entry = EventEntry(
                entry=found_entry,
                letter=assignment.letter,
                placed=assignment.rank,
            )

            if ring not in event.round_robin_tournaments:
                event.create_ring(ring)

            event.round_robin_tournaments[ring].event_entries.append(event_entry)


def update_round_robin_assignments(
    cursor: Cursor,
    event: Event,
    number_rings: int,
) -> None:
    slotted_entries: list[Entry] = []
    num_entries = 0
    max_entries = event.max_entries_per_ring * event.max_rings

    # Sort the entries by date registered.
    event.entries.sort()

    for entry in event.entries:
        if entry.checkInStatus == "CHECKED-IN":
            num_entries = num_entries + 1
            if num_entries > max_entries:
                break
            slotted_entries.append(entry)

    assert num_entries != 0, "There are no entries to slot!"

    if not event.round_robin_tournaments:
        logging.debug(f"Doing inital ring assignment for {event.id}")
        best_remainder: int = len(event.entries)
        best_rings: int = 1
        event.version += 1

        if number_rings == 0:
            # Locate a solution that uses the maximum number of rings with
            # a zero remainder
            for i in range(event.max_rings, 1, -1):
                if num_entries / i < event.min_entries_per_ring:
                    # logging.debug(str(i) + " rings has " + str(num_entries/i) +
                    # robots per ring, which is too few.")
                    continue
                if num_entries / i > event.max_entries_per_ring:
                    # logging.debug(str(i) + " rings has " + str(num_entries/i) +
                    # " robots per ring, which is too many.")
                    continue
                elif num_entries % i == 0:
                    event.rings = i
                    # logging.debug(str(i) + " rings works perfectly.")
                    break
                elif num_entries % i < best_remainder:
                    # logging.debug(str(i) + " rings has a better remainder of "
                    # + str(num_entries % i))
                    best_remainder = num_entries % i
                    best_rings = i

            if event.rings == 0:
                event.rings = best_rings
        else:
            event.rings = number_rings

        logging.debug(
            f"{event.id} - using {number_rings} rings with an average of "
            + f"{float(num_entries) / float(event.rings)} robots per ring."
        )

        # Build the dict to hold the rings and their entries.
        for i in range(1, int(event.rings) + 1, 1):
            event.create_ring(i)

        # Make dict containing the entries from a given school
        school_entries: dict[str, list[Entry]] = {}
        slotted: int = 0
        slotted_entries.sort()
        for entry in slotted_entries:
            if entry.school not in school_entries.keys():
                school_entries[entry.school] = []
            school_entries[entry.school].append(entry)
            if slotted == max_entries:
                break

        # Slot the entries into the rings based upon school.
        # This will minimize the number of entries from the same school in
        # a given ring.
        i = 0
        round_robin_keys = list(event.round_robin_tournaments.keys())
        length = len(round_robin_keys)
        for key in school_entries.keys():
            entries = school_entries[key]
            while len(entries):
                index = math.floor(random.random() * len(entries))
                found = 0

                if not found:
                    event.round_robin_tournaments[
                        round_robin_keys[i % length]
                    ].add_entry(entries[index])
                    entries.remove(entries[index])
                    i += 1

        ring_assignment_query = (
            'INSERT into robots."ringAssignment" '
            "(robot, letter, rank, tournament) "
            "VALUES "
        )

        participation_query = "UPDATE robots.robot SET participated=TRUE WHERE id in ("

        for tournament in event.round_robin_tournaments.values():
            tournament_query = (
                'INSERT into robots."tournament" '
                "(competition, ring, judge, timer) "
                "VALUES "
                f"('{event.id}', {tournament.ring}, '', '');"
            )

            logging.debug(tournament_query)
            cursor.execute(tournament_query)
            # get tournamnet id
            q = f"SELECT id FROM robots.tournament WHERE competition = '{event.id}' AND ring = {tournament.ring};"
            cursor.execute(q)
            tournament_id = cursor.fetchone()[0]

            for event_entry in tournament.event_entries:
                ring_assignment_query += (
                    f"('{event_entry.entry.id}', '{event_entry.letter}', "
                    f"{event_entry.placed}, {tournament_id}),"
                )

                participation_query += f"{event_entry.entry.id},"

        # get rid of that last comma.
        ring_assignment_query = ring_assignment_query[:-1]
        ring_assignment_query += ";"

        # get rid of the last 'OR'
        participation_query = participation_query[:-1]
        participation_query += ");"

        logging.debug(ring_assignment_query)
        logging.debug(participation_query)

        cursor.execute(ring_assignment_query)
        cursor.execute(participation_query)
    # There are already existing assignments.
    else:
        logging.debug("Amending ring assignments for " + event.id)
        # locate checked-in entries that were assigned a ring but have
        # since been removed.
        for tournament in event.round_robin_tournaments.values():
            for event_entry in tournament.event_entries:
                remove = 1
                name = ""
                for entry in slotted_entries:
                    if event_entry.entry.id == entry.id:
                        remove = 0
                        name = entry.robotName
                        break

                if remove:
                    # The competitor exists in the assignment data, but not
                    # in the checked-in entries;
                    # The assignment data needs to be removed.
                    logging.debug(f"\tRemoving {name} from ring {tournament.ring}")

                    # Remove the event entry from the tournament
                    tournament.remove_event_entry(event_entry)

                    # delete the ringAssignment entry
                    s = (
                        'DELETE from robots."ringAssignment" WHERE '
                        f"robot={event_entry.entry.id};"
                    )
                    cursor.execute(s)

                    # clear the participated flag.
                    s = (
                        'UPDATE robots."robot" set participated=FALSE '
                        + f"WHERE `id`={event_entry.entry.id};"
                    )
                    cursor.execute(s)

        # locate checked-in competitors that have not been assigned a ring.
        for entry in slotted_entries:
            add = 1
            for tournament in event.round_robin_tournaments.values():
                if 0 == add:
                    break
                for event_entry in tournament.event_entries:
                    if event_entry.entry.id == entry.id:
                        # We found the competitor, we don't need to
                        # add them
                        add = 0
                        break

            if add:
                # The competitor is checked in, but no ring assignment
                # exists. Find the ring with the fewest competitors and
                # assign the competitor to the first free position.

                smallest_tournament_size = 999
                smallest_tournament: RoundRobinTournament
                for inner_tournament in event.round_robin_tournaments.values():
                    size = len(inner_tournament.event_entries)
                    if size < smallest_tournament_size:
                        smallest_tournament_size = size
                        smallest_tournament = inner_tournament

                # Now that we know the ring to slot into, place the
                # competitor in the ring
                logging.debug(
                    f"\tAdding {entry.robotName} to {event.id} "
                    f"{smallest_tournament.name}"
                )

                event_entry = smallest_tournament.add_entry(entry)

                # get tournament id
                q = (
                    "SELECT id FROM robots.tournament "
                    f"WHERE competition = '{event.id}' "
                    f"AND ring = {smallest_tournament.ring};"
                )

                logging.debug(q)

                cursor.execute(q)
                tournament_id = cursor.fetchone()[0]

                s = (
                    'INSERT into robots."ringAssignment" '
                    "(robot, letter, rank, tournament) "
                    "VALUES "
                    f"('{event_entry.entry.id}', '{event_entry.letter}', "
                    f"'{event_entry.placed}', {tournament_id});"
                )

                logging.debug(s)
                cursor.execute(s)

                s = (
                    "UPDATE robots.robot SET participated=true "
                    f"WHERE id = {event_entry.entry.id};"
                )

                cursor.execute(s)

        logging.debug("All done amending " + event.id)

    # update slotted rings number in the competition database
    q = f"UPDATE robots.competition SET \"slottedRings\" = {event.rings} WHERE id = '{event.id}';"
    cursor.execute(q)


def reset_round_robin_tournaments(
    cursor: Cursor,
    event: Event,
):
    sql = []
    # get all tournaments_id for the event
    q = f"SELECT id FROM robots.tournament WHERE competition = '{event.id}';"
    cursor.execute(q)
    data = cursor.fetchall()
    logging.debug(f"Resetting {event.id}, with {len(data)} tournaments.")

    for row in data:
        tournament_id = row.id
        s = (
            'DELETE from robots."ringAssignment" '
            + f"WHERE tournament={tournament_id};"
        )
        sql.append(s)

        s = "DELETE from robots.match " + f"WHERE tournament={tournament_id};"
        sql.append(s)

    # Clear all participated flags.
    s = (
        "UPDATE robots.robot SET participated=FALSE "
        + f"WHERE competition='{event.id}';"
    )
    sql.append(s)

    # Clear all tournament data.
    s = f"DELETE from robots.tournament WHERE competition='{event.id}';"
    sql.append(s)

    for q in sql:
        cursor.execute(q)
