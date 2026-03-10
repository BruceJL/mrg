from Entry import Entry


def test_entry_has_email_and_ph():
    e = Entry(email="test@example.com", ph="555-1234")
    assert e.email == "test@example.com"
    assert e.ph == "555-1234"


def test_entry_defaults_email_and_ph_to_empty_string():
    e = Entry()
    assert e.email == ""
    assert e.ph == ""
