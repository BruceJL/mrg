"""
Tests for the _interleave_cert_and_trophy_pages helper added to api.py.

The Flask test client approach is not viable in this environment because
Flask (and pgdb) are container-only dependencies. Instead we unit-test the
standalone helper function directly.

The stubs for container-only modules are registered in sys.modules only for
the duration of the api module import and are cleaned up afterwards so they
don't pollute other test modules.
"""
import os
import sys
import tempfile
import pytest
from unittest.mock import MagicMock


# ---------------------------------------------------------------------------
# Stub out all container-only modules so that api.py can be imported, then
# clean up the stubs that belong to modules also tested elsewhere.
# ---------------------------------------------------------------------------

_STUB_NAMES = [
    "pgdb",
    "flask",
    "flask_restx",
    "Entry",
    "utilities",
    "RobocritterCertificate",
    "VolunteerCertificate",
    "EventScoresheet",
    "EventCertificate",
    "EventLabels",
    "ParticipationCertificate",
    "TrophyRecordSheet",
]

# Track which stubs we inserted (vs already-present real modules)
_inserted = {}

for _name in _STUB_NAMES:
    if _name not in sys.modules:
        _mock = MagicMock()
        # Special cases needed for api.py top-level code to not crash
        if _name == "flask_restx":
            _mock.Resource = object
        sys.modules[_name] = _mock
        _inserted[_name] = _mock

# Now import api; its module-level code will use the stubs
import api  # noqa: E402

# Clean up stubs for modules that have their own real test files, so those
# tests can import the real implementations later in the same pytest session.
for _name in ("TrophyRecordSheet", "Entry"):
    if _name in _inserted:
        del sys.modules[_name]
        del _inserted[_name]

# Pull the helper under test
_interleave = api._interleave_cert_and_trophy_pages


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_simple_pdf(path: str):
    """Write a minimal valid single-page PDF to *path*."""
    from pypdf import PdfWriter
    writer = PdfWriter()
    writer.add_blank_page(width=612, height=792)
    with open(path, "wb") as f:
        writer.write(f)


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

def test_interleave_returns_existing_file():
    """Result path points to a real file."""
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as c, \
         tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as t:
        cert_path = c.name
        trophy_path = t.name

    _make_simple_pdf(cert_path)
    _make_simple_pdf(trophy_path)

    result = _interleave(cert_path, trophy_path)
    try:
        assert os.path.isfile(result), "Merged PDF file should exist"
    finally:
        if os.path.exists(result):
            os.remove(result)


def test_interleave_removes_inputs():
    """cert and trophy PDFs are removed after merging."""
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as c, \
         tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as t:
        cert_path = c.name
        trophy_path = t.name

    _make_simple_pdf(cert_path)
    _make_simple_pdf(trophy_path)

    result = _interleave(cert_path, trophy_path)
    try:
        assert not os.path.exists(cert_path), "cert PDF should be removed"
        assert not os.path.exists(trophy_path), "trophy PDF should be removed"
    finally:
        if os.path.exists(result):
            os.remove(result)


def test_interleave_page_count_two_pages_each():
    """Two cert pages + two trophy pages → four interleaved pages."""
    from pypdf import PdfWriter, PdfReader

    def make_two_page_pdf(path):
        writer = PdfWriter()
        writer.add_blank_page(width=612, height=792)
        writer.add_blank_page(width=612, height=792)
        with open(path, "wb") as f:
            writer.write(f)

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as c, \
         tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as t:
        cert_path = c.name
        trophy_path = t.name

    make_two_page_pdf(cert_path)
    make_two_page_pdf(trophy_path)

    result = _interleave(cert_path, trophy_path)
    try:
        reader = PdfReader(result)
        assert len(reader.pages) == 4
    finally:
        if os.path.exists(result):
            os.remove(result)
