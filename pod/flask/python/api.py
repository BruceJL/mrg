from flask import Flask, request, send_file
from flask_restx import Resource, Api, Namespace, fields
from RobocritterCertificate import make_odf_certificate
from flask_cors import CORS
from EventCertificate import make_odf_certificates
from EventScoresheet import make_odf_score_sheets
from databaseSetup import connect_to_database
from Event import Event
from FrontEnd import (
    get_event_list_from_database,
    get_robot_entry_from_database,
    get_event_entries_from_database,
    load_ring_assignments_from_database,
)


import os

app = Flask(__name__)
CORS(app)
api = Api(app)

ns = Namespace("competitions", description="Competitions related operations")
api.add_namespace(ns, path="/api")

# Set up the database connection
cursor = connect_to_database("tracyhuang", "password")


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
    },
)

scoresheet_model = api.model(
    "ScoresheetModel",
    {
        "competition": fields.String(
            required=True, description="Name of the competition"
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

        # Generate certificate
        file_name = make_odf_certificate(minutes, seconds, place, robot)

        response = send_file(file_name, as_attachment=True, download_name=file_name)

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
        place1 = data.get("place1")
        place2 = data.get("place2")
        place3 = data.get("place3")

        # Get the current competition
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

        file_name = make_odf_certificates(
            event=event,
            winners=winners,
        )

        response = send_file(file_name, as_attachment=True, download_name=file_name)

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

        events = get_event_list_from_database(cursor)
        event = events[competition]

        event.entries.clear()
        get_event_entries_from_database(cursor, event)

        event.round_robin_tournaments.clear()
        load_ring_assignments_from_database(cursor, event)

        event.rebuild_matches()
        filename = make_odf_score_sheets(
            event=event,
        )

        response = send_file(filename, as_attachment=True, download_name=filename)

        # Remove the file after sending
        os.remove(filename)

        return response


if __name__ == "__main__":
    app.run(debug=True)
