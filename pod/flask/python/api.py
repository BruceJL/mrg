import os
import subprocess
import logging
from flask import Flask, request, send_file, jsonify
from flask_restx import Resource, Api, Namespace
from utilities import (
    connect_to_database,
    get_event_list_from_database,
    get_robot_entry_from_database,
    get_event_entries_from_database,
    get_all_entries_from_database,
    load_ring_assignments_from_database,
    update_round_robin_assignments,
    reset_round_robin_tournaments,
)
from RobocritterCertificate import make_odf_certificate
from VolunteerCertificate import make_odf_volunteer_certificate
from EventScoresheet import make_odf_score_sheets
from EventCertificate import make_odf_winners_certificates
from EventLabels import make_odf5160_labels, make_odf5160_all_event_labels
from ParticipationCertificate import make_odf_participation_certificates

DEBUGMODE = True

if DEBUGMODE:
    logging.basicConfig(level=logging.DEBUG)
else:
    logging.basicConfig(level=logging.WARNING)

app = Flask(__name__)
api = Api(app)

ns = Namespace("competitions", description="Competitions related operations")
api.add_namespace(ns, path="/")

# Set up the database connection
DB_USERNAME = os.environ.get("DB_USERNAME")
DB_PASSWORD = os.environ.get("DB_PASSWORD")
DB_CONNECTION = connect_to_database(DB_USERNAME, DB_PASSWORD)

eventlist = []
"""
Endpoints
"""


@ns.route("/generate-robotcritter-certificate")
class RobotCritterCertificate(Resource):

    def post(self):

        # Get JSON data from POST request body
        data = request.get_json()
        minutes = data.get("minutes")
        seconds = data.get("seconds")
        place = data.get("place")
        robot = data.get("robot")
        pdf = data.get("pdf")

        # Generate certificate
        file_name = make_odf_certificate(minutes, seconds, place, robot)

        if pdf:
            file_name = convert_odt_to_pdf(file_name)

        response = send_file(
            file_name,
            as_attachment=True,
            download_name=file_name,
        )

        # Remove the file after sending
        os.remove(file_name)

        return response


# Generate certificates for 1st, 2nd and 3rd places for a chosen Competition
@ns.route("/generate-event-certificates")
class EventCertificate(Resource):

    def post(self):
        # Get JSON data from POST request body
        data = request.get_json()
        competition = data.get("competition")
        pdf = data.get("pdf")
        place1 = data.get("place1")
        place2 = data.get("place2")
        place3 = data.get("place3")

        # Get the current competition
        cursor = get_cursor()

        events = eventlist
        event = events[competition]

        winners = []

        if len(place1):
            winners.append(get_robot_entry_from_database(cursor, place1))
        if len(place2):
            winners.append(get_robot_entry_from_database(cursor, place2))
        if len(place3):
            winners.append(get_robot_entry_from_database(cursor, place3))

        if not winners:
            print("No winners found")

        file_name = make_odf_winners_certificates(
            event=event,
            winners=winners,
        )

        if pdf:
            file_name = convert_odt_to_pdf(file_name)

        response = send_file(
            file_name,
            as_attachment=True,
            download_name=file_name,
        )

        # Remove the file after sending
        os.remove(file_name)

        return response


# Generate scoresheets for robots
@ns.route("/generate-scoresheet")
class ScoreSheet(Resource):

    def post(self):
        # Get JSON data from POST request body
        data = request.get_json()
        competition = data.get("competition")
        pdf = data.get("pdf")

        cursor = get_cursor()

        events = eventlist
        event = events[competition]

        event.entries.clear()
        get_event_entries_from_database(cursor, event)

        event.round_robin_tournaments.clear()
        load_ring_assignments_from_database(cursor, event)

        event.rebuild_matches()
        file_name = make_odf_score_sheets(
            event=event,
        )

        if pdf:
            file_name = convert_odt_to_pdf(file_name)

        response = send_file(
            file_name,
            as_attachment=True,
            download_name=file_name,
        )

        # Remove the file after sending
        os.remove(file_name)

        return response


# Make labels for robots in a competition
@ns.route("/generate-label-sheets")
class LabelSheet(Resource):

    def post(self):
        # Get JSON data from POST request body
        data = request.get_json()
        competition = data.get("competition")
        pdf = data.get("pdf")

        cursor = get_cursor()

        events = eventlist
        event = events[competition]

        get_event_entries_from_database(cursor, event)
        file_name = make_odf5160_labels(competition, event.entries)

        if pdf:
            file_name = convert_odt_to_pdf(file_name)

        response = send_file(
            file_name,
            as_attachment=True,
            download_name=file_name,
        )

        # Remove the file after sending
        os.remove(file_name)

        return response


# Make labels for robots in all events at once
@ns.route("/generate-all-label-sheets")
class AllLabelSheets(Resource):
    def post(self):
        data = request.get_json()
        pdf = data.get("pdf")

        cursor = get_cursor()
        entries = get_all_entries_from_database(cursor)

        file_name = make_odf5160_all_event_labels(entries)

        if pdf:
            file_name = convert_odt_to_pdf(file_name)

        response = send_file(
            file_name,
            as_attachment=True,
            download_name=file_name,
        )

        # Remove the file after sending
        os.remove(file_name)

        return response


# Slot all the checked in entries
@ns.route("/slot-checked-in-entries")
class SlotCheckedInEntries(Resource):

    def post(self):

        # Get JSON data from POST request body
        data = request.get_json()
        competition = data.get("competition")
        number_rings = data.get("number_rings")

        cursor = get_cursor()

        events = eventlist
        event = events[competition]
        event.rings = number_rings

        # get all the entries for a given event.
        event.entries.clear()
        get_event_entries_from_database(cursor, event)

        # Fetch the current ring assignements from the database for the event.
        event.round_robin_tournaments.clear()
        load_ring_assignments_from_database(cursor, event)

        update_round_robin_assignments(
            cursor=cursor,
            event=event,
            number_rings=number_rings,
        )

        return 200


# Delete all of the ring assignments for a given competition
@ns.route("/reset-ring-assignments")
class ResetCompetitionRingAssignments(Resource):

    def post(self):
        # Get JSON data from POST request body
        data = request.get_json()
        competition = data.get("competition")

        cursor = get_cursor()

        events = eventlist
        event = events[competition]

        # Clear out all ring assignements.
        query = reset_round_robin_tournaments(event)
        for q in query:
            cursor.execute(q)
        event.round_robin_tournaments = {}

        return 200


# Generate participation certificates for all competitors.
@ns.route("/generate-participation-certificates")
class ParticipationCertificate(Resource):
    def post(self):
        data = request.get_json()
        pdf = data.get("pdf")

        cursor = get_cursor()

        # get all the entries
        entries = get_all_entries_from_database(cursor)

        file_name = make_odf_participation_certificates(competitors=entries)

        if pdf:
            file_name = convert_odt_to_pdf(file_name)

        response = send_file(file_name, as_attachment=True, download_name=file_name)

        # Remove the file after sending
        os.remove(file_name)

        return response


# Generate volunteer certificate for a given volunteer
@ns.route("/generate-volunteer-certificate")
class VolunteerCertificate(Resource):
    def post(self):
        data = request.get_json()
        volunteer = data.get("volunteer")
        pdf = data.get("pdf")

        file_name = make_odf_volunteer_certificate(volunteer)

        if pdf:
            file_name = convert_odt_to_pdf(file_name)

        response = send_file(file_name, as_attachment=True, download_name=file_name)

        # Remove the file after sending
        os.remove(file_name)

        return response


# Assign a judge to a tournament(ring) of a given competition
@ns.route("/assign-judge")
class AssignJudge(Resource):
    def post(self):
        data = request.get_json()
        competition = data.get("competition")
        tournament = int(data.get("ring"))
        judge = data.get("judge")

        events = eventlist
        event = events[competition]

        assert tournament < len(event.round_robin_tournaments) + 1, logging.debug(
            f"Tournament number {tournament} is out of range for the number of rings in the competition : {len(event.round_robin_tournaments) + 1}"
        )

        event.round_robin_tournaments[tournament].judge = judge

        return 200


# Get all the judges for a given competition
@ns.route("/get-judges")
class GetJudges(Resource):
    def post(self):
        data = request.get_json()
        competition = data.get("competition")

        events = eventlist
        event = events[competition]

        return jsonify(event.get_judges())


"""
Functions
"""


def setup_events():
    cursor = get_cursor()
    global eventlist
    eventlist = get_event_list_from_database(cursor)


# Get the cursor to interact with the database
def get_cursor():
    global DB_CONNECTION
    if DB_CONNECTION is None or DB_CONNECTION.closed:
        logging.debug("=== Reconnecting to the database====")
        DB_CONNECTION = connect_to_database(DB_USERNAME, DB_PASSWORD)
    return DB_CONNECTION.cursor()


def convert_odt_to_pdf(
    input_file: str,
) -> str:
    """
    Convert an ODT file to a PDF file using LibreOffice.
    If the file already exists, it will be overwritten.

    Args:
        input_file (str): The path to the input ODT file.
        output_file (str): The path to save the output PDF file.

    Returns:
        None
    """
    output_file = os.path.splitext(input_file)[0] + ".pdf"

    cmd = [
        "libreoffice",
        "--headless",
        "--convert-to",
        "pdf",
        input_file,
    ]

    subprocess.run(args=cmd)
    os.remove(input_file)

    return output_file


if __name__ == "__main__":
    setup_events()
    app.run(debug=DEBUGMODE)
