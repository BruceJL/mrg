from Event import Event
from Entry import Entry

fake_event = Event(
    id="MS1",
    min_entries_per_ring=4,
    max_entries_per_ring=8,
    max_rings=8,
    max_entries=64,
    long_name="Mini Sumo 1",
)

fake_entries = [
    Entry(
        id=1,
        robotName="Davey Robot",
        coach="Mr. Coach",
        school="Happy School",
        competition="MS1",
        driver1="Bob Dog",
        driver1Grade=10,
        driver2="Jeff Dog",
        driver2Grade=9,
        driver3="Joe Dog",
        driver3Grade=8,
    ),
    Entry(
        id=2,
        robotName="Disco Robot",
        coach="Mr. Coach",
        school="Happy School",
        competition="MS1",
        driver1="Cool Cat",
        driver1Grade=10,
        driver2="Jeff Cat",
        driver2Grade=9,
        driver3="Joe Cat",
        driver3Grade=8,
    ),
    Entry(
        id=3,
        robotName="Dancing Robot",
        coach="Mr. Coach",
        school="Happy School",
        competition="MS1",
        driver1="Bunny Rabbit",
        driver1Grade=10,
        driver2="Jeff Rabbit",
        driver2Grade=9,
        driver3="Joe Rabbit",
        driver3Grade=8,
    ),
]
