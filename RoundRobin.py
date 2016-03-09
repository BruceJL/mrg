from Entry import Entry
from math import floor

class RoundRobinTournament(object):

    def __init__(self, name, event):
        self.name = name
        self.entries = []
        self.matches = []
        self.letterIndex = 65 # The Letter A
        self.event = event
        
    def addEntry(self, entry):
        self.entries.append(entry)
        entry.letter = chr(self.letterIndex)
        self.letterIndex += 1
        
    def createRoundRobinMatches(self): 
        #0-3    0-2    0-1
        #1-2    3-1    2-3
        length = len(self.entries)-1
        #print("length: " + str(length))
        for i in range(0, length, 1):
            lhs=0
            rhs=length-i
            #print (str(lhs) + " vs " + str(rhs))
            self.matches.append(RoundRobinMatch(self.entries[lhs], self.entries[rhs]))
            for j in range(0, floor((length)/2), 1):
                lhs = (j-i+length)%(length)+1
                rhs = (-i-j+length-2)%(length)+1
                if(rhs != lhs): #This is the bye condition.
                    #TODO do something to so that each player gets the same number of back to back matches.
                    #print (str(lhs) + " vs " + str(rhs))
                    self.matches.append(RoundRobinMatch(self.entries[lhs], self.entries[rhs]))
        
        
class RoundRobinMatch(object):
    def __init__(self, contestant1, contestant2):
        self.contestant1 = contestant1
        self.contestant2 = contestant2
        
    
    