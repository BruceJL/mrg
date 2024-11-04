import unittest
from VolunteerCertificate import make_odf_volunteer_certificates_odoc
from pathlib import Path


class testVolunteerCertificate(unittest.TestCase):
    def test_volunteer_certificate(self):
        volunteer_name = "Tracy Huang"
        doc = make_odf_volunteer_certificates_odoc(
            name=volunteer_name,
        )

        filename = Path(__file__).parent / f"{volunteer_name}_volunteer_certificate.odg"
        # doc.save(filename)
        self.assertIsNotNone(doc)
