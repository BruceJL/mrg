"""The Event object used by a Schedule"""
from typing import TYPE_CHECKING, List, Dict
from RoundRobin import RoundRobinTournament

if TYPE_CHECKING:
    from Entry import Entry


class Event(object):

    def __lt__(self, other):
        return self.competition < other.competition

    def __init__(
      self,
      id: str,
      min_entries_per_ring: int,
      max_entries_per_ring: int,
      max_rings: int,
      max_entries: int,
      long_name: str,
    ) -> 'None':

        self.id = id
        self.min_entries_per_ring = min_entries_per_ring
        self.max_entries_per_ring = max_entries_per_ring
        self.max_rings = max_rings
        self.max_entries = max_entries
        self.long_name = long_name

        self.rings: int = 0
        self.version: int = 0
        self.check_string: str = ""
        self.entries: List[Entry] = []
        self.round_robin_tournaments: Dict[int, RoundRobinTournament] = {}

    def create_ring(
      self,
      ring_number: int,
    ) -> 'None':
        self.round_robin_tournaments[ring_number] = \
          RoundRobinTournament(
            self.id + " Ring " + str(ring_number),
            ring_number,
            self,
          )

    # Rebuild the round robin match list.
    def rebuild_matches(self) -> 'None':
        for tournament in self.round_robin_tournaments.values():
            tournament.create_round_robin_matches()

    def add_entry(self, entry):
        # add an Entry to this Event and recalculate the totalTime
        self.entries.append(entry)

    # def add_event_entry(self, event_entry):
    #   for i in range(len(self.round_robin_tournaments), event_entry.ring, 1):
    #        self.round_robin_tournaments.append(
    #          RoundRobinTournament(self.competition + " Ring " + str(i + 1),
    #          i + 1, self))
    #          self.round_robin_tournaments[event_entry.ring-1].
    #            add_event_entry(event_entry)

    def make_participation_csv(self):
        fout = open(
          './ScoreSheets/' + self.competition + '-participation.csv', 'w')

        # for entry in copy of self.entries sorted by school
        for entry in sorted(self.entries, key=lambda x: x.school):
            s = ""
            if entry.driver1:
                s += "{driver},{robot},{school},{competition}\n".format(
                  driver=entry.driver1,
                  robot=entry.robotName,
                  school=entry.school,
                  competition=self.competition,
                )

            if entry.driver2:
                s += "{driver},{robot},{school},{competition}\n".format(
                  driver=entry.driver2,
                  robot=entry.robotName,
                  school=entry.school,
                  competition=self.competition,
                )

            if entry.driver3:
                s += "{driver},{robot},{school},{competition}\n".format(
                  driver=entry.driver3,
                  robot=entry.robotName,
                  school=entry.school,
                  competition=self.competition,
                )
            fout.write(s)
        fout.close()
