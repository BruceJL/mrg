from Entry import Entry


class EventEntry():
    entry: Entry
    letter: str = ""
    position: int = -1
    round: int = -1
    placed: int = -1

    def __init__(
      self,
      entry: Entry,
      letter: str = "",
      position: int = -1,
      placed: int = -1,
    ) -> 'None':
        self.entry = entry
        self.letter = letter
        self.position = position
        self.placed = placed
