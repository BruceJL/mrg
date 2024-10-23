#!/usr/bin/python3

import os
import sys
import subprocess
import tkinter
import math
import random

from typing import TYPE_CHECKING
from pgdb import connect, Cursor
from tkinter import messagebox, simpledialog

from EventCertificate import make_odf_certificates
from ParticipationCertificate import make_odf_participation_certificates
from EventLabels import make_odf5160_labels
from EventScoresheet import make_odf_score_sheets

from Entry import Entry
from Event import Event
from EventEntry import EventEntry
from RingAssignment import RingAssignment
from Resource import Resource
from RoundRobin import RoundRobinTournament


if TYPE_CHECKING:
    from typing import Dict, Any


class Frontend:

    number_rings: tkinter.IntVar
    selected_competition: tkinter.StringVar
    username = ""
    password = ""

    def __init__(self) -> "None":

        def loginDialog():
            self.username = username_field.get()
            self.password = password_field.get()
            window.destroy()

        # Login prompt.
        window = tkinter.Tk()
        window.title("Countries Generation")

        frame = tkinter.Frame(window)

        Label1 = tkinter.Label(window, text="Username:")
        Label1.pack(padx=15, pady=5)

        username_field = tkinter.Entry(window, bd=5)
        username_field.pack(padx=15, pady=5)

        Label2 = tkinter.Label(window, text="Password: ")
        Label2.pack(padx=15, pady=6)

        password_field = tkinter.Entry(window, show="*", bd=5)
        password_field.pack(padx=15, pady=7)

        btn = tkinter.Button(frame, text="Check Login", command=loginDialog)

        btn.pack(side=tkinter.RIGHT, padx=5)
        frame.pack(padx=100, pady=19)
        window.mainloop()

        with connect(
            dsn="check-in:mrg",
            user=self.username,
            password=self.password,
        ) as conn:

            conn.autocommit = True
            self.cursor = conn.cursor()
            self.events = get_event_list_from_database(cursor=self.cursor)

            self.event_list = [v for v in self.events.keys()]
            self.event_list.sort()

            window = tkinter.Tk()
            window.title("MRG Administrative Interface")

            # Window state variables.
            self.number_rings = tkinter.IntVar()
            self.selected_competition = tkinter.StringVar()

            self.selected_competition.trace_add("write", self.gui_competition_changed)
            self.selected_competition.set(self.event_list[0])

            # competition selection option
            tkinter.OptionMenu(
                window,
                self.selected_competition,
                *self.event_list,
            ).pack()

            # Make labels button
            tkinter.Button(
                window,
                text="Create labels",
                command=lambda: self.gui_make_odf_label_sheets(self.cursor),
            ).pack()

            tkinter.Label(window, text="Number of Rings:").pack()

            self.number_rings_spinbox = tkinter.Spinbox(
                master=window,
                textvariable=self.number_rings,
                from_=0,
                to=20,
            ).pack()

            # Reset Ring assignments butotn
            tkinter.Button(
                master=window,
                text="Reset Ring Assignments",
                command=lambda: self.gui_reset_competition_ring_assignments(
                    self.cursor
                ),
            ).pack()

            # Slot entries button
            tkinter.Button(
                master=window,
                text="Slot Checked-in entries",
                command=lambda: self.gui_slot_checked_in_entries(self.cursor),
            ).pack()

            # Create score sheets button
            tkinter.Button(
                master=window,
                text="Create scoresheets",
                command=lambda: self.gui_make_odf_score_sheet(self.cursor),
            ).pack()

            # Create certificates button
            tkinter.Button(
                window,
                text="Create certificates",
                command=lambda: self.gui_make_odf_certificates(self.cursor),
            ).pack()

            # Create participation certificates button
            tkinter.Button(
                window,
                text="Create Participation Certificates",
                command=lambda: self.gui_make_odf_participation_certificates(
                    self.cursor
                ),
            ).pack()

            # Run the window
            window.mainloop()

    def gui_competition_changed(self, var, index, mode) -> None:
        self.events = get_event_list_from_database(cursor=self.cursor)
        competition: "str" = self.selected_competition.get()
        event = self.events[competition]
        self.number_rings.set(event.max_rings)

    # Slot all the checked in entries.
    def gui_slot_checked_in_entries(self, cursor: Cursor) -> None:
        competition: "str" = self.selected_competition.get()
        number_rings: "int" = int(self.number_rings.get())

        event = self.events[competition]

        # get all the entries for a given event.
        event.entries.clear()
        get_event_entries_from_database(cursor, event)

        # Fetch the current ring assignements from the database for the event.
        event.round_robin_tournaments.clear()
        load_ring_assignments_from_database(cursor, event)

        update_round_robin_assignments(cursor, event, number_rings)

        print("All done!")

    # Delete all of the ring assignments for a given competition
    def gui_reset_competition_ring_assignments(self, cursor: Cursor) -> None:
        result = messagebox.askokcancel(
            "Are you sure? This will delete all the current ring assignments "
            + " and cannot be undone."
        )

        if result:
            # Clear out all ring assignements.
            competition = self.selected_competition.get()
            event = self.events[competition]
            query = reset_round_robin_tournaments(event)
            for q in query:
                print(q)
                cursor.execute(q)
            event.round_robin_tournaments = {}

    # Make labels for robots
    def gui_make_odf_label_sheets(self, cursor: Cursor) -> None:
        competition = self.selected_competition.get()
        event = self.events[competition]

        get_event_entries_from_database(cursor, event)
        filename = make_odf5160_labels(competition, event.entries)
        filename = os.path.realpath(filename) + ".odt"
        open_file(filename)

    # Make scoresheets for robots
    def gui_make_odf_score_sheet(self, cursor: Cursor) -> None:
        # Get the current competition
        competition = self.selected_competition.get()
        event = self.events[competition]

        event.entries.clear()
        get_event_entries_from_database(cursor, event)

        event.round_robin_tournaments.clear()
        load_ring_assignments_from_database(cursor, event)

        event.rebuild_matches()
        filename: "str" = make_odf_score_sheets(
            event=event,
        )
        filename = os.path.realpath(filename) + ".odt"
        open_file(filename)

    # Make certificates for 1st, 2nd and 3rd places for chosen Competition
    def gui_make_odf_certificates(self, cursor: Cursor) -> None:
        competition: "str" = self.selected_competition.get()
        event = self.events[competition]

        place1 = simpledialog.askstring(
            f"{competition}'s winners",
            "1st place Robot's ID?",
        )

        place2 = simpledialog.askstring(
            f"{competition}'s winners",
            "2nd place Robot's ID? \nClick 'OK' if no 2nd place",
        )

        place3 = simpledialog.askstring(
            f"{competition}'s winners",
            "3rd place Robot's ID? \nClick 'OK' if no 3rd place",
        )

        if place1 is not None:
            winners = [get_robot_entry_from_database(cursor, place1)]
        if place2 is not None:
            winners.append(get_robot_entry_from_database(cursor, place2))
        if place3 is not None:
            winners.append(get_robot_entry_from_database(cursor, place3))

        filename = make_odf_certificates(
            event=event,
            winners=winners,
        )
        filename = os.path.realpath(filename) + ".odg"
        open_file(filename)

    # Make participation certificates for the chosen Competition
    def gui_make_odf_participation_certificates(self, cursor: Cursor) -> None:
        competition: "str" = self.selected_competition.get()
        event = self.events[competition]

        event.entries.clear()
        get_event_entries_from_database(cursor, event)

        filename = make_odf_participation_certificates(
            event=event,
            competitors=event.entries,
        )
        filename = os.path.realpath(filename) + ".odg"
        open_file(filename)

    def makeParticipationCSV(self, event):
        self.event_list[event].make_participation_csv()


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


# Get Robot's info by its ID from the database
def get_robot_entry_from_database(
    cursor: Cursor,
    robot_id: str,
) -> "Entry":
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


# Creates the ring assignments (EventEntry's) for a given competition from
# the database
def load_ring_assignments_from_database(
    cursor: Cursor,
    event: Event,
) -> None:

    sql = 'SELECT * FROM robots."ringAssignment" ' f"WHERE competition = '{event.id}';"
    cursor.execute(sql)
    data = cursor.fetchall()
    found_entry: Entry | None = None
    found_row: RingAssignment

    for row in data:
        found_row = row
        robot_id: int = row.robot
        found_entry = None

        # Associate a robot with the entry
        for entry in event.entries:
            if entry.id == robot_id:
                found_entry = entry
                break

        assert found_entry is not None, f"No matching robot for id: {entry.id} found."

        event_entry = EventEntry(
            entry=found_entry,
            letter=found_row.letter,
            placed=found_row.placed,
        )

        if found_row.ring not in event.round_robin_tournaments:
            event.create_ring(found_row.ring)

        event.round_robin_tournaments[found_row.ring].event_entries.append(event_entry)


# Gets the list of events types from the database.
def get_event_list_from_database(
    cursor: Cursor,
) -> dict[str, Event]:
    cursor.execute("SELECT * FROM robots.competition;")
    data = cursor.fetchall()
    events: Dict[str, Event] = {}

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


def reset_round_robin_tournaments(event: Event) -> list[str]:
    sql = []
    s = 'DELETE from robots."ringAssignment" ' + f"WHERE competition='{event.id}';"
    sql.append(s)

    # Clear all participated flags.
    s = (
        "UPDATE robots.robot SET participated=FALSE "
        + f"WHERE competition='{event.id}';"
    )
    sql.append(s)

    # clear out the object data.
    # self.round_robin_tournaments = {}

    return sql


def open_file(filename: "str") -> None:
    print(filename)
    if sys.platform == "win32":
        os.startfile(filename)
    else:
        opener = "open" if sys.platform == "darwin" else "xdg-open"
    subprocess.call([opener, filename])


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
        print(f"Doing inital ring assignment for {event.id}")
        best_remainder: int = len(event.entries)
        best_rings: int = 1
        event.version += 1

        if number_rings == 0:
            # Locate a solution that uses the maximum number of rings with
            # a zero remainder
            for i in range(event.max_rings, 1, -1):
                if num_entries / i < event.min_entries_per_ring:
                    # print(str(i) + " rings has " + str(num_entries/i) +
                    # robots per ring, which is too few.")
                    continue
                if num_entries / i > event.max_entries_per_ring:
                    # print(str(i) + " rings has " + str(num_entries/i) +
                    # " robots per ring, which is too many.")
                    continue
                elif num_entries % i == 0:
                    event.rings = i
                    # print(str(i) + " rings works perfectly.")
                    break
                elif num_entries % i < best_remainder:
                    # print(str(i) + " rings has a better remainder of "
                    # + str(num_entries % i))
                    best_remainder = num_entries % i
                    best_rings = i

            if event.rings == 0:
                event.rings = best_rings
        else:
            event.rings = number_rings

        print(
            f"{event.id} - using {event.rings} rings with an average of "
            + f"{float(num_entries) / float(event.rings)} robots per ring."
        )

        # Build the dict to hold the rings and their entries.
        for i in range(1, event.rings + 1, 1):
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
            "(robot, competition, ring, letter) "
            "VALUES "
        )

        participation_query = "UPDATE robots.robot SET participated=TRUE WHERE id in ("

        for tournament in event.round_robin_tournaments.values():
            for event_entry in tournament.event_entries:
                ring_assignment_query += (
                    f"('{event_entry.entry.id}', '{event.id}', "
                    f"{tournament.ring}, '{event_entry.letter}'),"
                )

                participation_query += f"{event_entry.entry.id},"

        # get rid of that last comma.
        ring_assignment_query = ring_assignment_query[:-1]
        ring_assignment_query += ";"

        # get rid of the last 'OR'
        participation_query = participation_query[:-1]
        participation_query += ");"

        print(ring_assignment_query)
        print(participation_query)
        cursor.execute(ring_assignment_query)
        cursor.execute(participation_query)

    # There are already existing assignments.
    else:
        print("Amending ring assignments for " + event.id)
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
                    print(f"\tRemoving {name} from ring {tournament.ring}")

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
                print(
                    f"\tAdding {entry.robotName} to {event.id} "
                    f"{smallest_tournament.name}"
                )

                event_entry = smallest_tournament.add_entry(entry)

                s = (
                    'INSERT into robots."ringAssignment" '
                    "(robot, competition, ring, letter) "
                    "VALUES "
                    f"('{event_entry.entry.id}', '{event.id}', "
                    f"'{smallest_tournament.ring}', '{event_entry.letter}');"
                )

                cursor.execute(s)

                s = (
                    "UPDATE robots.robot SET participated=true "
                    f"WHERE id = {event_entry.entry.id};"
                )

                cursor.execute(s)

        print("All done amending " + event.id)


# Creates the static resources which can be assigned for the competitions.
# Not currently used.
def create_resources():
    resources = [
        Resource("Mini Ring 01", 12, 12, "mini_ring"),
        Resource("Mini Ring 02", 12, 12, "mini_ring"),
        Resource("Mini Ring 03", 12, 12, "mini_ring"),
        Resource("Mini Ring 04", 12, 12, "mini_ring"),
        Resource("Mini Ring 05", 12, 12, "mini_ring"),
        Resource("Mini Ring 06", 12, 12, "mini_ring"),
        Resource("Mini Ring 07", 12, 12, "mini_ring"),
        Resource("Mini Ring 08", 12, 12, "mini_ring"),
        Resource("Mini Ring 09", 12, 12, "mini_ring"),
        Resource("Mini Ring 10", 12, 12, "mini_ring"),
        Resource("Prairie Ring 01", 18, 18, "prairie_ring"),
        Resource("Prairie Ring 02", 18, 18, "prairie_ring"),
        Resource("Prairie Ring 03", 18, 18, "prairie_ring"),
        Resource("Prairie Ring 04", 18, 18, "prairie_ring"),
        Resource("Line Follower Track 01", 18, 18, "line_follower_track"),
        Resource("Line Follower Track 02", 18, 18, "line_follower_track"),
        Resource("Tractor Pull Track", 18, 18, "tractor_pull_track"),
    ]
    return resources


# def import_entries(file):
#    """import entries from a CSV file"""
#    entries = []
#    with open(file, 'rt') as csvfile:
#        reader = csv.DictReader(csvfile)
#        for row in reader:
#            if row['robot'] != '':
#                entry = Entry(
#                  row['Entry Id'],
#                  row['robot'],
#                  row['coach'],
#                  row['school'],
#                  row['comp'],
#                  row['driver1'],
#                  row['1stGr'],
#                  row['driver2'],
#                  row['2Gr'],
#                  row['driver3'],
#                  row['3Gr'])
#                entries.append(entry)
#    return entries


# Frontend()
