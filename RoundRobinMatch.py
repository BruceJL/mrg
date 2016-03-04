class RoundRobinMatch(object):

    def __init__(self, name):
        self.name = name
        self.entries = []
        
    def addEntry(self, entry):
        self.entries.append(entry)