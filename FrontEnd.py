import tkinter
from tkinter import messagebox

from Entry import Entry
from Event import Event
from Event import EventError
from RoundRobin import RoundRobinError
from EventEntry import EventEntry
from Resource import Resource
from pymysql import connect, cursors
import os


# Defines and returns the database connection
def createDatabaseConnection():
    return connect(
                   host='192.168.11.2',
                   # host='localhost',
                   port=3306,
                   # port=9999,
                   user='mrg-sign-in',
                   passwd='Swordfish',
                   db='mrg_db',
                   autocommit=True)


# Creates the static resources which can be assigned for the competitions. Not currently used.
def create_resources():
    resources = [Resource("Mini Ring 01", 12, 12, "mini_ring"), Resource("Mini Ring 02", 12, 12, "mini_ring"),
                 Resource("Mini Ring 03", 12, 12, "mini_ring"), Resource("Mini Ring 04", 12, 12, "mini_ring"),
                 Resource("Mini Ring 05", 12, 12, "mini_ring"), Resource("Mini Ring 06", 12, 12, "mini_ring"),
                 Resource("Mini Ring 07", 12, 12, "mini_ring"), Resource("Mini Ring 08", 12, 12, "mini_ring"),
                 Resource("Mini Ring 09", 12, 12, "mini_ring"), Resource("Mini Ring 10", 12, 12, "mini_ring"),
                 Resource("Prairie Ring 01", 18, 18, "prairie_ring"),
                 Resource("Prairie Ring 02", 18, 18, "prairie_ring"),
                 Resource("Prairie Ring 03", 18, 18, "prairie_ring"),
                 Resource("Prairie Ring 04", 18, 18, "prairie_ring"),
                 Resource("Line Follower Track 01", 18, 18, "line_follower_track"),
                 Resource("Line Follower Track 02", 18, 18, "line_follower_track"),
                 Resource("Tractor Pull Track", 18, 18, "tractor_pull_track")]
    return resources


'''def import_entries(file):
    """import entries from a CSV file"""
    entries = []
    with open(file, 'rt') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            if row['robot'] != '':
                entry = Entry(row['Entry Id'], row['robot'], row['coach'], row['school'], row['comp'], row['driver1'],
                              row['1stGr'], row['driver2'], row['2Gr'], row['driver3'], row['3Gr'])
                entries.append(entry)
    return entries'''


class Frontend(object):
    def __init__(self):
        self.resource_list = {}

        conn = createDatabaseConnection()
        self.cursor = conn.cursor(cursors.DictCursor)
        self.events = self.get_event_list_from_database()

        self.event_list = list(self.events)
        self.event_list.sort()

        window = tkinter.Tk()
        window.title("MRG Administrative Interface")
        self.selected_competition = tkinter.StringVar()
        self.selected_competition.set(self.event_list[0])

        # competition selection option
        option_menu_competition = tkinter.OptionMenu(window, self.selected_competition, *self.event_list)
        option_menu_competition.pack()

        # Make labels button
        btn_create_label_sheets = tkinter.Button(window, text="Create labels", command=self.gui_make_odf_label_sheets)
        btn_create_label_sheets.pack()

        # Number of rings entry
        number_rings_label = tkinter.Label(window, text="Number of Rings:")
        number_rings_label.pack()

        self.number_rings = tkinter.Spinbox(window, from_=0, to=20)
        self.number_rings.pack()

        # Reset competition rings
        btn_reset_competition_ring_assignments = tkinter.Button(window, text="Reset Ring Assignments",
                                                                command=self.gui_reset_competition_ring_assignments)
        btn_reset_competition_ring_assignments.pack()

        # Slot entries button
        btn_slot_checked_in_entries = tkinter.Button(window, text="Slot Checked-in entries",
                                                     command=self.gui_slot_checked_in_entries)
        btn_slot_checked_in_entries.pack()

        # Create score sheets button
        btn_create_score_sheets = tkinter.Button(window, text="Create scoresheets",
                                                 command=self.gui_make_odf_score_sheet)
        btn_create_score_sheets.pack()

        # Run the window
        window.mainloop()
        print("Closing connection")
        conn.close()

    # Slot all the checked in entries.
    def gui_slot_checked_in_entries(self):
        competition = self.selected_competition.get()
        number_rings = int(self.number_rings.get())

        self.get_event_entries_from_database(competition)
        self.build_ring_assignments_from_database(competition)

        event = self.events[competition]

        try:
            sql = event.update_round_robin_assignments(number_rings)
            for query in sql:
                print(query)
                self.cursor.execute(query)
        except EventError as err:
            tkinter.messagebox.showinfo("Failed", err)

    print("All done!")

    # Delete all of the ring assignments for a given competition
    def gui_reset_competition_ring_assignments(self):
        result = tkinter.messagebox.askokcancel("Are you sure",
                                                "This will delete all the current ring assignments and "
                                                "cannot be undone.")
        if result:
            competition = self.selected_competition.get()
            s = "DELETE from `ring-assignment` where competition='{}'"
            s = s.format(competition)
            print(s)
            self.cursor.execute(s)

    # Make labels for robots
    def gui_make_odf_label_sheets(self):
        competition = self.selected_competition.get()
        self.get_event_entries_from_database(competition)
        event = self.events[competition]

        filename = event.make_odf5160_labels()
        filename = os.path.realpath(filename) + ".odt"
        print(filename)
        os.startfile(filename)

    # Make scoresheets for robots
    def gui_make_odf_score_sheet(self):
        # Get the current competition
        competition = self.selected_competition.get()
        self.get_event_entries_from_database(competition)
        self.build_ring_assignments_from_database(competition)
        event = self.events[competition]
        try:
            event.rebuild_matches()
            filename = event.make_odf_schedules()
            filename = os.path.realpath(filename) + ".odt"
            print(filename)
            os.startfile(filename)
        except RoundRobinError as err:
            tkinter.messagebox.showinfo("Failed", err)

    # Gets the list of events types from the database.
    def get_event_list_from_database(self):
        self.cursor.execute("""SELECT * FROM competition""")
        data = self.cursor.fetchall()
        events = {}

        for row in data:
            if row['name'] != '':
                event = Event(row['name'], row['minRobotsPerRing'], row['maxRobotsPerRing'], row['rings'])
                #event.checksString = row['checkString']
                events[row['name']] = event
        return events

    # Gets all the entries for a given event from the database
    def get_event_entries_from_database(self, competition):
        sql = "SELECT * FROM robot WHERE comp = %s;"
        self.cursor.execute(sql, competition)
        data = self.cursor.fetchall()

        entries = []
        for row in data:
            if row['robot'] != '':
                entry = Entry(row['id'], row['robot'], row['coach'], row['school'], row['comp'], row['driver1'],
                              row['driver1Gr'], row['driver2'], row['driver2Gr'], row['driver3'], row['driver3Gr'],
                              row['signedIn'], row['measured'])
                entries.append(entry)

        # Note that this rebuilds the entries data form the database every time.
        self.events[competition].entries = entries

    # Gets the ring assignments (EventEntry's) for a given competition from the database
    def build_ring_assignments_from_database(self, competition):
        event = self.events[competition]
        event.reset_round_robin_tournaments()
        sql = "SELECT * FROM `ring-assignment` WHERE competition=%s;"
        self.cursor.execute(sql, competition)
        data = self.cursor.fetchall()

        for row in data:
            robot_id = row['robot']
            found_entry = None
            event = self.events[competition]

            for entry in event.entries:
                if entry.id == robot_id:
                    found_entry = entry
                    break

            if found_entry is not None:
                event_entry = EventEntry(found_entry, row['letter'], row['placed'])
                # Crashes here cause this tournament may not exist.
                if not row['ring'] in event.round_robin_tournaments:
                    event.create_ring(row['ring'])
                event.round_robin_tournaments[row['ring']].event_entries.append(event_entry)

    def makeParticipationCSV(self, event):
        self.event_list[event].make_participation_csv()

fe = Frontend()
