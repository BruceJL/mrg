import unittest
from EventCertificate import make_odf_winners_certificates_odoc
from fake_data import fake_event, fake_entries


class testCertificateGeneration(unittest.TestCase):
    def test_certificate_generation(self):
        doc = make_odf_winners_certificates_odoc(event=fake_event, winners=fake_entries)
        self.assertIsNotNone(doc)
