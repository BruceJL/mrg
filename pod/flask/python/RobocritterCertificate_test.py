import unittest
from RobocritterCertificate import make_odf_certificate_odoc
import os

class RobocritterCertificateTest(unittest.TestCase):
  def test_certificate_generation(self):
    doc = make_odf_certificate_odoc(1, 2, "Tracy", "Minions")
    self.assertIsNotNone(doc)
