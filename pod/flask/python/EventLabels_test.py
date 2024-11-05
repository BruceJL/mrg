import unittest
from EventLabels import make_odf5160_labels_odt
from fake_data import fake_entries, fake_event
from pathlib import Path


class testLabelGeneration(unittest.TestCase):
    def test_label_generation(self):
        doc = make_odf5160_labels_odt(
            entries=fake_entries,
        )

        self.assertIsNotNone(doc)
