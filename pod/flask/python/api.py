import os
import subprocess
import logging
from flask import Flask, request, send_file
from flask_restx import Resource, Api, Namespace, fields
from utilities import (
    connect_to_database,
    get_event_list_from_database,
    get_robot_entry_from_database,
    get_event_entries_from_database,
    load_ring_assignments_from_database,
    update_round_robin_assignments,
    reset_round_robin_tournaments,
)
from RobocritterCertificate import make_odf_certificate
from EventScoresheet import make_odf_score_sheets
from EventCertificate import make_odf_winners_certificates
from EventLabels import make_odf5160_labels

# from ParticipationCertificate import make_odf_participation_certificates


logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
# CORS(app)

api = Api(app)

ns = Namespace("competitions", description="Competitions related operations")
api.add_namespace(ns, path="/")

# Set up the database connection
DB_USERNAME = os.environ.get("DB_USERNAME")
DB_PASSWORD = os.environ.get("DB_PASSWORD")
DB_CONNECTION = connect_to_database(DB_USERNAME, DB_PASSWORD)

# Define the model for input validation and documentation
robocritter_model = api.model(
    "RobocritterModel",
    {
        "minutes": fields.Integer(
            required=True, description="Minutes for the competition"
        ),
        "seconds": fields.Integer(
            required=True, description="Seconds for the competition"
        ),
        "place": fields.String(required=True, description="Name of the place"),
        "robot": fields.String(required=True, description="Name of the robot"),
        "pdf": fields.Boolean(required=False, description="PDF file requested"),
    },
)

event_model = api.model(
    "EventModel",
    {
        "competition": fields.String(
            required=True, description="Name of the competition"
        ),
        "place1": fields.String(
            required=True, description="Name of the first place place"
        ),
        "place2": fields.String(
            required=True, description="Name of the second place place"
        ),
        "place3": fields.String(
            required=True, description="Name of the third place place"
        ),
        "pdf": fields.Boolean(required=False, description="PDF file requested"),
    },
)

scoresheet_model = api.model(
    "ScoresheetModel",
    {
        "competition": fields.String(
            required=True, description="Name of the competition"
        ),
        "pdf": fields.Boolean(required=False, description="PDF file requested"),
    },
)

reset_ring_model = labelsheet_model = scoresheet_model

checked_in_model = api.model(
    "CheckedInModel",
    {
        "competition": fields.String(
            required=True, description="Name of the competition"
        ),
        "number_rings": fields.Integer(
            required=True, description="Number of rings to slot"
        ),
    },
)


"""
Endpoints
"""


@ns.route("/generate-robotcritter-certificate")
class RobotCritterCertificate(Resource):
    @api.expect(robocritter_model)
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
    @api.expect(event_model)
    def post(self):
        # Get JSON data from POST request body
        data = request.get_json()
        competition = data.get("competition")
        pdf = data.get("pdf")
        place1 = data.get("place1")
        place2 = data.get("place2")
        place3 = data.get("place3")

        # Get the current competition
        cursor = getCursor()
        events = get_event_list_from_database(cursor)
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
    @api.expect(scoresheet_model)
    def post(self):
        # Get JSON data from POST request body
        data = request.get_json()
        competition = data.get("competition")
        pdf = data.get("pdf")

        cursor = getCursor()
        events = get_event_list_from_database(cursor)
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


# Make labels for robots
@ns.route("/generate-label-sheets")
class LabelSheet(Resource):
    @api.expect(labelsheet_model)
    def post(self):
        # Get JSON data from POST request body
        data = request.get_json()
        competition = data.get("competition")
        pdf = data.get("pdf")

        cursor = getCursor()
        events = get_event_list_from_database(cursor)
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


# Slot all the checked in entries
@ns.route("/slot-checked-in-entries")
class SlotCheckedInEntries(Resource):
    @api.expect(checked_in_model)
    def post(self):

        # Get JSON data from POST request body
        data = request.get_json()
        competition = data.get("competition")
        number_rings = data.get("number_rings")

        cursor = getCursor()
        events = get_event_list_from_database(cursor)
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
    @api.expect(reset_ring_model)
    def post(self):
        # Get JSON data from POST request body
        data = request.get_json()
        competition = data.get("competition")

        cursor = getCursor()
        events = get_event_list_from_database(cursor)
        event = events[competition]

        # Clear out all ring assignements.
        query = reset_round_robin_tournaments(event)
        for q in query:
            cursor.execute(q)
        event.round_robin_tournaments = {}

        return 200


def getCursor():
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
    app.run(debug=True)
