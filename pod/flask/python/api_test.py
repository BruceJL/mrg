from api import api
import unittest
import os


class testApiLoad(unittest.TestCase):
    def test_api_load(self):
        self.assertIsNotNone(api)


class testSlotCheckedInEntries(unittest.TestCase):

    def test_slot_checked_in_entries(self):
        """Test POST /slot-checked-in-entries"""
        client = api.app.test_client()
        api.app.testing = True
        client.testing = True

        data = {
            "competition": "MSR",
            "number_rings": 2,
        }
        response = client.post("/slot-checked-in-entries", json=data)

        self.assertEqual(response.status_code, 200)


class testResetRingAssignment(unittest.TestCase):

    def test_reset_round_robin_tournament(self):
        """Test POST /reset-round-robin-tournament"""
        client = api.app.test_client()
        api.app.testing = True
        client.testing = True

        data = {
            "competition": "MSR",
        }

        response = client.post("/reset-ring-assignments", json=data)

        self.assertEqual(response.status_code, 200)
