from math import floor
from typing import TYPE_CHECKING
from EventEntry import EventEntry
from Entry import Entry

if TYPE_CHECKING:
    from Event import Event


byeEntry = EventEntry(
    Entry(
        id=0,
        robotName="bye",
        coach="bye",
        school="bye",
        competition="bye",
        driver1="bye",
        driver1Grade=0,
        driver2="bye",
        driver2Grade=0,
        driver3="bye",
        driver3Grade=0,
    )
)


class RoundRobinTournament(object):
    def __init__(
        self,
        name: str,
        ring: int,
        event: "Event",
    ) -> "None":
        self.name = name
        self.ring = ring
        self.event = event

        self.judge: str = ""
        self.event_entries: list[EventEntry] = []
        self.matches: list[RoundRobinMatch] = []

    def to_json(self):
        return {
            "type": "tournament",
            "id": self.name,
            "attributes": {
                "ring": self.ring,
                "event": self.event.id,
                "judge": self.judge if self.judge else "No Judge",
            },
        }

    def add_entry(
        self,
        entry: Entry,
    ) -> EventEntry:
        letter = self.get_next_free_letter()
        event_entry = EventEntry(entry, letter)
        self.event_entries.append(event_entry)
        return event_entry

    def get_next_free_letter(self) -> "str":
        letter: str = ""
        letters: list[str] = []

        for event_entry in self.event_entries:
            letters.append(event_entry.letter)

        letter_index = 65  # The letter 'A'
        while letter == "":
            if not letters.__contains__(chr(letter_index)):
                letter = chr(letter_index)
            else:
                letter_index += 1
        return letter

    def add_event_entry(self, event_entry) -> "None":
        self.event_entries.append(event_entry)

    def remove_event_entry(self, event_entry) -> "None":
        self.event_entries.remove(event_entry)

    def create_round_robin_matches(self) -> "None":
        self.event_entries = sorted(self.event_entries, key=lambda x: x.letter)
        n = len(self.event_entries)
        if n % 2 == 1:
            num_matches = n * (n - 1) / 2
            self.event_entries.append(byeEntry)
        else:
            num_matches = n / 2 * (n - 1)

        length = len(self.event_entries) - 1

        for i in range(0, length, 1):
            lhs = 0
            rhs = length - i

            if not (
                self.event_entries[rhs] == byeEntry
                or self.event_entries[lhs] == byeEntry
            ):
                # This is the bye condition.
                self.matches.append(
                    RoundRobinMatch(
                        f"{self.event.id}-{self.ring}-{len(self.matches)+1}",
                        self.event_entries[lhs],
                        self.event_entries[rhs],
                    )
                )

            for j in range(0, floor(length / 2), 1):
                lhs = (j - i + length) % length + 1
                rhs = (-i - j + length - 2) % length + 1

                if not (
                    self.event_entries[rhs] == byeEntry
                    or self.event_entries[lhs] == byeEntry
                ):
                    # This is the bye condition.
                    self.matches.append(
                        RoundRobinMatch(
                            f"{self.event.id}-{self.ring}-{len(self.matches)+1}",
                            self.event_entries[lhs],
                            self.event_entries[rhs],
                        )
                    )

        # clean out the bye entry if it's still in there:
        if self.event_entries[length] == byeEntry:
            self.event_entries.remove(byeEntry)

        assert len(self.matches) == num_matches, (
            "DID NOT CALCULATE THE CORRECT NUMBER OF MATCHES. "
            + "Should have got "
            + str(num_matches)
            + ", got "
            + str(self.matches)
        )


class RoundRobinMatch(object):
    def __init__(self, id, contestant1: EventEntry, contestant2):
        self.id = id
        self.contestant1 = contestant1
        self.contestant2 = contestant2
        self.round1winner: int = 0  # 1 = contestant1, 2 = contestant2, 0 = not played
        self.round2winner: int = 0

    def to_json(self):
        return {
            "type": "match",
            "id": self.id,
            "attributes": {
                "contestant1": self.contestant1.entry.id,
                "contestant2": self.contestant2.entry.id,
                "round1winner": self.round1winner,
                "round2winner": self.round2winner,
            },
        }
