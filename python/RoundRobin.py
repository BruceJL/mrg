from typing import TYPE_CHECKING
from math import floor
from Entry import Entry
from EventEntry import EventEntry

if TYPE_CHECKING:
    from typing import List
    from Event import Event

byeEntry = EventEntry(
  Entry(
    id=0,
    robotName='bye',
    coach='bye',
    school='bye',
    competition='bye',
    driver1='bye',
    driver1Grade=0,
    driver2='bye',
    driver2Grade=0,
    driver3='bye',
    driver3Grade=0,
  ))


class RoundRobinTournament(object):
    def __init__(
      self,
      name: str,
      ring: int,
      event: Event,
    ) -> 'None':
        self.name = name
        self.ring = ring
        self.event = event

        self.event_entries: List[EventEntry] = []
        self.matches: List[RoundRobinMatch] = []

    def add_entry(
      self,
      entry: Entry,
    ) -> EventEntry:
        letter = self.get_next_free_letter()
        event_entry = EventEntry(entry, letter)
        self.event_entries.append(event_entry)
        return event_entry

    def get_next_free_letter(self) -> 'str':
        letter: str = ""
        letters: List[str] = []

        for event_entry in self.event_entries:
            letters.append(event_entry.letter)

        letter_index = 65  # The letter 'A'
        while letter == "":
            if not letters.__contains__(chr(letter_index)):
                letter = chr(letter_index)
            else:
                letter_index += 1
        return letter

    def add_event_entry(self, event_entry) -> 'None':
        self.event_entries.append(event_entry)

    def remove_event_entry(self, event_entry) -> 'None':
        self.event_entries.remove(event_entry)

    def create_round_robin_matches(self) -> 'None':
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
              or self.event_entries[lhs] == byeEntry):
                # This is the bye condition.
                self.matches.append(
                  RoundRobinMatch(
                    self.event_entries[lhs],
                    self.event_entries[rhs],
                  ))

            for j in range(0, floor(length / 2), 1):
                lhs = (j - i + length) % length + 1
                rhs = (-i - j + length - 2) % length + 1

                if not (
                  self.event_entries[rhs] == byeEntry
                  or self.event_entries[lhs] == byeEntry):
                    # This is the bye condition.
                    self.matches.append(
                      RoundRobinMatch(
                        self.event_entries[lhs],
                        self.event_entries[rhs]))

        # clean out the bye entry if it's still in there:
        if self.event_entries[length] == byeEntry:
            self.event_entries.remove(byeEntry)

        assert len(self.matches) == num_matches, \
            "DID NOT CALCULATE THE CORRECT NUMBER OF MATCHES. " \
            + "Should have got " + str(num_matches) + ", got " \
            + str(self.matches)


class RoundRobinMatch(object):
    def __init__(self, contestant1, contestant2):
        self.contestant1 = contestant1
        self.contestant2 = contestant2
