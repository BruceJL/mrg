import unittest
from ParticipationCertificate import make_odf_participation_certificates_odoc
from fake_data import fake_entries, fake_event


class testParticipationGeneration(unittest.TestCase):
    def test_participation_generation(self):
        doc = make_odf_participation_certificates_odoc(
            event=fake_event,
            competitors=fake_entries,
        )
        self.assertIsNotNone(doc)
