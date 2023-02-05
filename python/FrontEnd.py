#!/usr/bin/python3

import os
import sys
import subprocess
import tkinter
from typing import TYPE_CHECKING

from EventCertificate import make_odf_certificates
from EventLabels import make_odf5160_labels
from EventScoresheet import make_odf_score_sheets

from Entry import Entry
from Event import Event
from EventEntry import EventEntry
from Resource import Resource
# from pymysql import connect, cursors
from pgdb import connect, Cursor

if TYPE_CHECKING:
    from typing import List, Dict, Any


class Frontend():
    def __init__(self) -> 'None':

        username = 'username'
        password = 'password'

        with (connect(
          dns='check-in:mrg',
          user=username,  # 'mrg-sign-in',
          password=password,  # 'Swordfish',
        ) as conn):

            cursor = conn.cursor()
            self.events = \
                get_event_list_from_database(cursor=cursor)

            self.event_list = [v for v in self.events.keys()]
            self.event_list.sort()

            window = tkinter.Tk()
            window.title("MRG Administrative Interface")
            self.selected_competition = tkinter.StringVar()
            self.selected_competition.trace("w", self.gui_competition_changed)
            self.selected_competition.set(self.event_list[0])

            # competition selection option
            option_menu_competition = tkinter.OptionMenu(
              window,
              self.selected_competition,
              *self.event_list,
            )

            option_menu_competition.pack()

            # Make labels button
            btn_create_label_sheets = \
                tkinter.Button(
                  window,
                  text="Create labels",
                  command=lambda: self.gui_make_odf_label_sheets(cursor),
                )

            btn_create_label_sheets.pack()

            # Number of rings entry
            self.number_rings = tkinter.IntVar()
            number_rings_label = tkinter.Label(window, text="Number of Rings:")
            number_rings_label.pack()

            self.number_rings_spinbox = tkinter.Spinbox(
              master=window,
              textvariable=self.number_rings,
              from_=0,
              to=20,
            )

            self.number_rings_spinbox.pack()

            # Reset competition rings
            btn_reset_competition_ring_assignments = \
                tkinter.Button(
                  master=window,
                  text="Reset Ring Assignments",
                  command=lambda:
                    self.gui_reset_competition_ring_assignments(cursor),
                )

            btn_reset_competition_ring_assignments.pack()

            # Slot entries button
            btn_slot_checked_in_entries = \
                tkinter.Button(
                  master=window,
                  text="Slot Checked-in entries",
                  command=lambda: self.gui_slot_checked_in_entries(cursor),
                )

            btn_slot_checked_in_entries.pack()

            # Create score sheets button
            btn_create_score_sheets = \
                tkinter.Button(
                  master=window,
                  text="Create scoresheets",
                  command=lambda: self.gui_make_odf_score_sheet(cursor),
                )

            btn_create_score_sheets.pack()

            # Create certificates button
            btn_create_certificates = tkinter.Button(
              window,
              text="Create certificates",
              command=lambda: self.gui_make_odf_certificates(cursor),
            )
            btn_create_certificates.pack()

            # Run the window
            window.mainloop()

    def gui_competition_changed(self, cursor: Cursor) -> 'None':
        self.events = get_event_list_from_database(cursor=cursor)
        competition: 'str' = self.selected_competition.get()
        event = self.events[competition]
        self.number_rings.set(event.max_rings)

    # Slot all the checked in entries.
    def gui_slot_checked_in_entries(self, cursor: Cursor) -> 'None':
        competition: 'str' = self.selected_competition.get()
        number_rings: 'int' = int(self.number_rings.get())

        event = self.events[competition]

        # get all the entries for a given event.
        event.entries = get_event_entries_from_database(cursor, event)

        # Fetch the current ring assignements from the database for the event.
        load_ring_assignments_from_database(cursor, event)

        try:
            sql = event.update_round_robin_assignments(number_rings)
            for query in sql:
                print(query)
                cursor.execute(query)
        except AssertionError as err:
            tkinter.messagebox.showinfo("Failed", err)

        print("All done!")

    # Delete all of the ring assignments for a given competition
    def gui_reset_competition_ring_assignments(self, cursor: Cursor) -> 'None':
        result = tkinter.messagebox.askokcancel(
          "Are you sure? This will delete all the current ring assignments "
          + " and cannot be undone.")

        if result:
            # Clear out all ring assignements.
            competition = self.selected_competition.get()
            event = self.events[competition]
            query = event.reset_round_robin_tournaments()
            for q in query:
                print(q)
                cursor.execute(q)

    # Make labels for robots
    def gui_make_odf_label_sheets(self, cursor: Cursor) -> 'None':
        competition = self.selected_competition.get()
        event = self.events[competition]
        event.entries = \
            get_event_entries_from_database(cursor, event)

        filename = make_odf5160_labels(competition, event.entries)
        filename = os.path.realpath(filename) + ".odt"
        open_file(filename)

    # Make scoresheets for robots
    def gui_make_odf_score_sheet(self, cursor: Cursor) -> 'None':
        # Get the current competition
        competition = self.selected_competition.get()
        event = self.events[competition]
        event.entries = get_event_entries_from_database(
          cursor,
          event,
        )

        load_ring_assignments_from_database(cursor, event)

        event.rebuild_matches()
        filename: 'str' = make_odf_score_sheets(
          event=event,
        )
        filename = os.path.realpath(filename) + ".odt"
        open_file(filename)

    # Make certificates for 1st, 2nd and 3rd places for chosen Competition
    def gui_make_odf_certificates(self, cursor: Cursor) -> 'None':
        competition: 'str' = self.selected_competition.get()
        event = self.events[competition]

        place1 = tkinter.simpledialog.askstring(
          competition + "'s winners", "1st place Robot's ID?", )

        place2 = tkinter.simpledialog.askstring(
          competition + "'s winners",
          "2nd place Robot's ID? \nClick 'OK' if no 2nd place", )

        place3 = tkinter.simpledialog.askstring(
          competition + "'s winners",
          "3rd place Robot's ID? \nClick 'OK' if no 3rd place", )

        if place1 is not None:
            winners = [get_robot_entry_from_database(cursor, place1)]
        if place2 is not None:
            winners.append(
              get_robot_entry_from_database(cursor, place2))
        if place3 is not None:
            winners.append(
              get_robot_entry_from_database(cursor, place3))

        filename = make_odf_certificates(
          event=event,
          winners=winners,
        )
        filename = os.path.realpath(filename) + ".odg"
        open_file(filename)

    def makeParticipationCSV(self, event):
        self.event_list[event].make_participation_csv()


# Gets all the entries for a given event from the database
def get_event_entries_from_database(
  cursor: Cursor,
  event: "Event",
) -> 'List[Entry]':
    sql = "SELECT * FROM robot WHERE competition = %s " \
          + "ORDER BY registered"

    cursor.execute(
      sql,
      event.competition,
    )

    data = cursor.fetchall()

    entries = []
    for row in data:
        if row['robot'] != '':
            entries.append(make_entry(row))

    # Note that this rebuilds the entries data form the database every
    # time.
    return entries


# Get Robot's info by its ID from the database
def get_robot_entry_from_database(
  cursor: Cursor,
  robot_id: str,
) -> 'Entry':
    sql = "SELECT * FROM robot WHERE id = %s;"
    cursor.execute(sql, robot_id)
    data = cursor.fetchall()
    return make_entry(data)


def make_entry(row: 'Dict[str, Any]') -> 'Entry':
    return Entry(
      id=row['id'],
      robotName=row['robot'],
      coach=row['coach'],
      school=row['school'],
      competition=row['competition'],
      driver1=row['driver1'],
      driver1Grade=row['driver1Gr'],
      driver2=row['driver2'],
      driver2Grade=row['driver2Gr'],
      driver3=row['driver3'],
      driver3Grade=row['driver3Gr'],
      status=row['status'],
      measured=row['measured'],
      registered=row['registered']
    )


# Creates the ring assignments (EventEntry's) for a given competition from
# the database
def load_ring_assignments_from_database(
  cursor: Cursor,
  event: Event,
) -> 'None':
    event.reset_round_robin_tournaments()
    sql = "SELECT * FROM `ringAssignment` WHERE competition=%s;"
    cursor.execute(sql, event.competition)
    data = cursor.fetchall()
    found_entry: Entry | None = None
    found_row: int = -1

    for row in data:
        found_row = row
        robot_id: int = row['robot']
        found_entry = None

        for entry in event.entries:
            if entry.id == robot_id:
                found_entry = entry
                break

        if found_entry is not None:
            event_entry: EventEntry = EventEntry(
              found_entry,
              found_row['letter'],
              found_row['placed'],
            )

        if not found_row['ring'] in event.round_robin_tournaments:
            event.create_ring(found_row['ring'])
        event.round_robin_tournaments[
            found_row['ring']].event_entries.append(event_entry)


# Gets the list of events types from the database.
def get_event_list_from_database(
  cursor: Cursor,
) -> 'Dict[str, Event]':
    cursor.execute("""SELECT * FROM competition""")
    data = cursor.fetchall()
    events: 'Dict[str, Event]' = {}

    for row in data:
        if row['name'] != '':
            event = Event(
              competition=row['name'],
              min_entries_per_ring=row['minRobotsPerRing'],
              max_entries_per_ring=row['maxRobotsPerRing'],
              max_rings=row['rings'],
              max_entries=row['maxEntries'],
              long_name=row['longName']
            )
        # event.check_string = row['checkString']
        events[row['name']] = event
    return events


def open_file(filename: 'str') -> 'None':
    print(filename)
    if sys.platform == "win32":
        os.startfile(filename)
    else:
        opener = "open" if sys.platform == "darwin" else "xdg-open"
    subprocess.call([opener, filename])


# Defines and returns the database connection
def create_database_connection(
  username: 'str',
  password: 'str',
) -> Cursor:
    return connect(
      dns='check-in:mrg',
      user=username,  # 'mrg-sign-in',
      password=password,  # 'Swordfish',
    ).cursor()


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
      Resource("Tractor Pull Track", 18, 18, "tractor_pull_track")]
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


Frontend()
