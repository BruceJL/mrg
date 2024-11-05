import unittest
from VolunteerCertificate import make_odf_volunteer_certificate_odoc
from pathlib import Path


class testVolunteerCertificate(unittest.TestCase):
    def test_volunteer_certificate(self):
        volunteer_name = "Tracy Huang"
        doc = make_odf_volunteer_certificate_odoc(
            name=volunteer_name,
        )
        self.assertIsNotNone(doc)
