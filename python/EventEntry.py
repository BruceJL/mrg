from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from Entry import Entry

class EventEntry():
    entry: 'Entry'
    letter: 'str' = ""
    position: 'str' = ""
    round  = ""

    def __init__(
      self,
      entry: 'Entry',
      letter: 'str' = "",
      position: 'str' = ""
    ) -> 'None':
        self.entry = entry
        self.letter = letter
        self.position = position
