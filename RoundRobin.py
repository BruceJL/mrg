from Entry import Entry
from math import floor
from EventEntry import EventEntry

byeEntry = EventEntry(Entry(0, 'bye', 'bye', 'bye', 'bye', 'bye', 'bye', 'bye', 'bye', 'bye', 'bye'))

class RoundRobinError(Exception):
    pass

class RoundRobinTournament(object):
    def __init__(self, name, ring, event):
        self.name = name
        self.ring = ring
        self.round = round
        self.event_entries = []
        self.matches = []
        self.event = event

    def add_entry(self, entry):
        letter = self.get_next_free_letter()
        event_entry = EventEntry(entry, letter)
        self.event_entries.append(event_entry)
        return event_entry

    def get_next_free_letter(self):
        letter = ""
        letters = []
        for event_entry in self.event_entries:
            letters.append(event_entry.letter)

        letter_index = 65  # The letter 'A'
        while letter == "":
            if not letters.__contains__(chr(letter_index)):
                letter = chr(letter_index)
            else:
                letter_index += 1
        return letter

    def add_event_entry(self, event_entry):
        self.event_entries.append(event_entry)

    def remove_event_entry(self, event_entry):
        self.event_entries.remove(event_entry)

    def create_round_robin_matches(self):
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

            if not (self.event_entries[rhs] == byeEntry or self.event_entries[lhs] == byeEntry):
                # This is the bye condition.
                self.matches.append(RoundRobinMatch(self.event_entries[lhs], self.event_entries[rhs]))

            for j in range(0, floor(length / 2), 1):
                lhs = (j - i + length) % length + 1
                rhs = (-i - j + length - 2) % length + 1
                # print(str(lhs) + " vs " + str(rhs) + " length: " + str(length))
                if not (self.event_entries[rhs] == byeEntry or self.event_entries[lhs] == byeEntry):
                    # This is the bye condition.
                    self.matches.append(RoundRobinMatch(self.event_entries[lhs], self.event_entries[rhs]))

        # clean out the bye entry if it's still in there:
        if self.event_entries[length] == byeEntry:
            self.event_entries.remove(byeEntry)

        if len(self.matches) != num_matches:
            s = "DID NOT CALCULATE THE CORRECT NUMBER OF MATCHES. Should have got {}, got {}."
            s = s.format(str(num_matches), str(self.matches))
            raise RoundRobinError(s)


class RoundRobinMatch(object):
    def __init__(self, contestant1, contestant2):
        self.contestant1 = contestant1
        self.contestant2 = contestant2
