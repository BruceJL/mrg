class RingAssignment(object):
    def __init__(
        self,
        id: int = 0,
        competition: str = "",
        robot: int = -1,
        letter: str = "",
        placed: int = -1,
        ring: int = -1,
    ):
        self.id = id
        self.competition = competition
        self.robot = robot
        self.letter = letter
        self.placed = placed
        self.ring = ring

    def __eq__(self, other):
        return self.id == other.id
