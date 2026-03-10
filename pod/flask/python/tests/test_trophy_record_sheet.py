import os
from Entry import Entry
from Event import Event
from TrophyRecordSheet import make_trophy_record_sheet

def make_test_event():
    return Event(
        id="MSR",
        long_name="Mini Sumo Tethered Rookie",
        min_entries_per_ring=2,
        max_entries_per_ring=4,
        max_rings=2,
        max_entries=16,
    )

def make_test_winner():
    return Entry(
        id=1,
        robotName="Destructor",
        school="Prairie View School",
        driver1="Alice Smith",
        driver2="Bob Jones",
        driver3="",
        email="coach@prairie.edu",
        ph="555-9876",
    )

def test_make_trophy_record_sheet_creates_file():
    event = make_test_event()
    winners = [make_test_winner()]
    file_name = make_trophy_record_sheet(event=event, winners=winners)
    assert os.path.exists(file_name)
    os.remove(file_name)

def test_make_trophy_record_sheet_returns_odt_path():
    event = make_test_event()
    winners = [make_test_winner()]
    file_name = make_trophy_record_sheet(event=event, winners=winners)
    assert file_name.endswith(".odt")
    os.remove(file_name)

def test_make_trophy_record_sheet_multiple_winners():
    event = make_test_event()
    winner2 = Entry(id=2, robotName="Crusher", school="Oak School", driver1="Carol", email="oak@school.ca", ph="555-0001")
    winners = [make_test_winner(), winner2]
    file_name = make_trophy_record_sheet(event=event, winners=winners)
    assert os.path.exists(file_name)
    os.remove(file_name)
