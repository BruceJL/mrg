from flask import Flask, request, send_file
from flask_restx import Resource, Api, Namespace, fields
from RobocritterCertificate import make_odf_certificate
from flask_cors import CORS

import os

app = Flask(__name__)
CORS(app)
api = Api(app)

ns = Namespace("robocritters", description="Robocritters related operations")
api.add_namespace(ns, path="/api")


# Define the model for input validation and documentation
certificate_model = api.model(
    "CertificateModel",
    {
        "minutes": fields.Integer(
            required=True, description="Minutes for the competition"
        ),
        "seconds": fields.Integer(
            required=True, description="Seconds for the competition"
        ),
        "player": fields.String(required=True, description="Name of the player"),
        "robot": fields.String(required=True, description="Name of the robot"),
    },
)


@ns.route("/generate-certificate")
class RobotCritterCertificate(Resource):
    @api.expect(certificate_model)
    def post(self):

        # Get JSON data from POST request body
        data = request.get_json()
        minutes = data.get("minutes")
        seconds = data.get("seconds")
        player = data.get("player")
        robot = data.get("robot")

        # Generate certificate
        file_name = make_odf_certificate(minutes, seconds, player, robot)

        response = send_file(file_name, as_attachment=True, download_name=file_name)

        # Remove the file after sending
        os.remove(file_name)

        return response


if __name__ == "__main__":
    app.run(debug=True)
