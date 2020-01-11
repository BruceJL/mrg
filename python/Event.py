"""The Event object used by a Schedule"""
import math
import random
from RoundRobin import RoundRobinTournament


class Event(object):

    def __init__(self,
                 competition,
                 min_entries_per_ring,
                 max_entries_per_ring,
                 max_rings,
                 max_entries,
                 ):
        self.competition = competition
        self.entries = []
        self.round_robin_tournaments = {}
        self.min_entries_per_ring = min_entries_per_ring
        self.max_entries_per_ring = max_entries_per_ring
        self.max_rings = max_rings
        self.max_entries = max_entries
        self.version = 0
        self.rings = 0
        self.checksString = ""

    def reset_round_robin_tournaments(self):
        self.round_robin_tournaments = {}

    def create_ring(self, ring_number):
        self.round_robin_tournaments[ring_number] = \
          RoundRobinTournament(self.competition + " Ring " + str(ring_number),
                               ring_number, self)

    def create_round_robin_tournaments(self, number_rings):
        best_remainder = len(self.entries)
        best_rings = 1
        self.version += 1
        num_entries = 0
        for entry in self.entries:
            if entry.signedIn:
                num_entries += 1

        # max_entries =  self.max_entries_per_ring * self.max_rings

        assert num_entries != 0, "There are no entries to slot!"

        if number_rings == 0:
            # Locate a solution that uses the maximum number of rings with a zero remainder
            for i in range(self.max_rings, 1, -1):
                if num_entries / i < self.min_entries_per_ring:
                    # print(str(i) + " rings has " + str(num_entries/i) + " robots per ring, which is too few.")
                    continue
                if num_entries / i > self.max_entries_per_ring:
                    # print(str(i) + " rings has " + str(num_entries/i) + " robots per ring, which is too many.")
                    continue
                elif num_entries % i == 0:
                    self.rings = i
                    # print(str(i) + " rings works perfectly.")
                    break
                elif num_entries % i < best_remainder:
                    # print(str(i) + " rings has a better remainder of " + str(num_entries % i))
                    best_remainder = len(self.entries) % i
                    best_rings = i

            if self.rings == 0:
                self.rings = best_rings
        else:
            self.rings = number_rings

        print(self.competition + " - using " + str(self.rings)
          + " rings with an average of " + str(
            float(num_entries) / float(self.rings)) + " robots per ring.")

        # Build the dict to hold the rings and their entries.
        for i in range(1, self.rings+1, 1):
            self.create_ring(i)

        # Make dict containing the entries from a given school
        school_entries = {}
        for entry in self.entries:
            if entry.signedIn:
                if entry.school not in school_entries.keys():
                    school_entries[entry.school] = []
                school_entries[entry.school].append(entry)

        # Slot the entries into the rings based upon school.
        # This will minimize the number of entries from the same school in a given ring.
        i = 0
        round_robin_keys = list(self.round_robin_tournaments.keys())
        length = len(round_robin_keys)
        for key, item in school_entries.items():
            entries = school_entries[key]
            while len(entries):
                index = math.floor(random.random() * len(entries))
                found = 0

                #TODO fix the following logic as it may paint itself into a corner. e.g. the only entry remaining
                #is a duplicate entry
                #for tournament in self.round_robin_tournaments:
                #    for event_entry in tournament.event_entries:
                #        if event_entry.entry.driver1 == entries[index].driver1:
                #            found = 1

                if not found:
                    self.round_robin_tournaments[round_robin_keys[i % length]].add_entry(entries[index])
                    entries.remove(entries[index])
                    i += 1

    def update_round_robin_assignments(self, number_rings):
        sql = []

        if len(list(self.round_robin_tournaments.keys())) == 0:
            print("Doing inital ring assignment for " + self.competition)
            # There not been any slotting done. Do initial assignments.
            self.create_round_robin_tournaments(number_rings)

            query = "INSERT into `ring-assignment` " \
                "(robot, competition, ring, letter) " \
                "VALUES " \

            for key, tournament in self.round_robin_tournaments.items():
                for event_entry in tournament.event_entries:
                    s = "({}, '{}', {}, '{}'),"
                    query += s.format(str(event_entry.entry.id),
                                      self.competition,
                                      str(tournament.ring),
                                      event_entry.letter)

            # get rid of that last comma.
            query = query[:-1]
            query += ";"
            sql.append(query)
            return sql

        # There are already existing assignments.
        else:
            print("Amending ring assignments for " + self.competition)
            # locate checked-in entries that were assigned a ring but have since been removed.
            for key, tournament in self.round_robin_tournaments.items():
                for event_entry in tournament.event_entries:
                    remove = 0
                    name = ""
                    for entry in self.entries:
                        if event_entry.entry.id == entry.id:
                            name = entry.robotName
                            if not entry.signedIn:
                                remove = 1
                            break

                    if remove:
                        # The competitor exists in the assignment data, but not in the checked-in entries;
                        # The assignment data needs to be removed.
                        print("\tRemoving " + name + " from ring " + str(tournament.ring))
                        tournament.remove_event_entry(event_entry)
                        s = "DELETE from `ring-assignment` where robot = {};"
                        s = s.format(str(event_entry.entry.id))
                        sql.append(s)

            # locate checked-in competitors that have not been assigned a ring.
            for entry in self.entries:
                if entry.signedIn:
                    add = 1
                    for key, tournament in self.round_robin_tournaments.items():
                        if 0 == add:
                            break
                        for event_entry in tournament.event_entries:
                            if event_entry.entry.id == entry.id:
                                #We found the competitor, we don't need to add them
                                add = 0
                                break
                else:
                    add = 0

                if add:
                    # The competitor is checked in, but no ring assignment exists. Find the ring with the fewest
                    # competitors and assign the competitor to the first free position.

                    smallest_tournament_size = 999
                    smallest_tournament = 0
                    for key, inner_tournament in self.round_robin_tournaments.items():
                        size = len(inner_tournament.event_entries)
                        if size < smallest_tournament_size:
                            smallest_tournament_size = size
                            smallest_tournament = inner_tournament

                    # Now that we know the ring to slot into, place the competitor in the ring
                    print("\tAdding " + entry.robotName + " to " + self.competition + " " + smallest_tournament.name)
                    event_entry = smallest_tournament.add_entry(entry)
                    s = "INSERT into `ring-assignment` " \
                        "(robot, competition, ring, letter) " \
                        "VALUES " \
                        "({}, '{}', {}, '{}')"

                    s = s.format(str(event_entry.entry.id),
                                 self.competition,
                                 str(smallest_tournament.ring),
                                 event_entry.letter)

                    sql.append(s)

            print("All done amending " + self.competition)
            return sql

    # Rebuild the round robin match list.
    def rebuild_matches(self):
        for key, tournament in self.round_robin_tournaments.items():
            tournament.create_round_robin_matches()

    def add_entry(self, entry):
        # add an Entry to this Event and recalculate the totalTime
        self.entries.append(entry)

    '''
    def add_event_entry(self, event_entry):
        for i in range(len(self.round_robin_tournaments), event_entry.ring, 1):
            self.round_robin_tournaments.append(RoundRobinTournament(self.competition + " Ring " + str(i + 1),
                                                                     i + 1, self))
        self.round_robin_tournaments[event_entry.ring-1].add_event_entry(event_entry)
    '''

    def make_participation_csv(self):
        fout = open('./ScoreSheets/' + self.competition
          + '-participation.csv', 'w')

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
