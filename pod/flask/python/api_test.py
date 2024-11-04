from api import api
import unittest


class testApiLoad(unittest.TestCase):
    def test_api_load(self):
        self.assertIsNotNone(api)
