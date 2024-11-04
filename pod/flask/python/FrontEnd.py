#!/usr/bin/python3

import os
import sys
import subprocess
import tkinter
from pgdb import Cursor, connect

# from pgdb import connect, Cursor
from tkinter import messagebox, simpledialog

from EventCertificate import make_odf_winners_certificates
from ParticipationCertificate import make_odf_participation_certificates
from EventLabels import make_odf5160_labels
from EventScoresheet import make_odf_score_sheets
from utilities import (
    get_event_list_from_database,
    get_robot_entry_from_database,
    get_event_entries_from_database,
    load_ring_assignments_from_database,
    update_round_robin_assignments,
    reset_round_robin_tournaments,
)


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
                command=lambda: self.gui_make_odf_winners_certificates(self.cursor),
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
    def gui_make_odf_winners_certificates(self, cursor: Cursor) -> None:
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

        filename = make_odf_winners_certificates(
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


def open_file(filename: "str") -> None:
    print(filename)
    if sys.platform == "win32":
        os.startfile(filename)
    else:
        opener = "open" if sys.platform == "darwin" else "xdg-open"
    subprocess.call([opener, filename])


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
