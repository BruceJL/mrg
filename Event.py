"""The Event object used by a Schedule"""

# import sys
import datetime
import math
import random

from Entry import Entry
from RoundRobinMatch import RoundRobinMatch


#from settingsInteraction import settingsInteractionInstance

# JUDGINGTIMEPERENTRY = datetime.timedelta(seconds=60)
# FINALADJUDICATIONTIMEPERENTRY = datetime.timedelta(seconds=180)

class Event(object):
    """Used by a Schedule"""
    def __init__(self, competition, minEntriesPerRing, maxEntriesPerRing, maxRings):
        self.competition = competition
        self.entries = []
        self.roundRobinMatches = []
        self.minEntriesPerRing = minEntriesPerRing
        self.maxEntriesPerRing = maxEntriesPerRing
        self.maxRings = maxRings
        #self.totalTime = datetime.timedelta(seconds=0)

    def createRoundRobinTournaments(self):                
        bestRemainder = len(self.entries)
        bestRings = 0
        self.rings = 0
        numEntries = len(self.entries)
    
        #Locate a solution that uses the maximum number of rings with a zero remainder
        for i in range(self.maxRings, 1, -1):
            if(numEntries/i < self.minEntriesPerRing):
                #print(str(i) + " rings has " + str(numEntries/i) + " robots per ring, which is too few.")
                continue
            if(numEntries/i > self.maxEntriesPerRing):
                #print(str(i) + " rings has " + str(numEntries/i) + " robots per ring, which is too many.")
                continue
            elif(numEntries % i == 0):
                self.rings = i
                #print(str(i) + " rings works perfectly.")
                break
            elif(numEntries % i < bestRemainder):
                #print(str(i) + " rings has a better remainder of " + str(numEntries % i))
                bestRemainder = len(self.entries) % i
                bestRings = i
        
        if(self.rings == 0):
            self.rings = bestRings
        
        print(self.competition + " - using " + str(self.rings) + " rings with an average of " + str(len(self.entries)/self.rings) + " robots per ring." )
            
        #Build the array to hold the rings and their entries.    
        self.roundRobinMatches = []
        for i in range(0, self.rings, 1):
            self.roundRobinMatches.append(RoundRobinMatch(self.competition + " Ring " + str(i+1)))
            
        i=0
        j=0
        
        #Make arrays containing the entries from a given shcool
        self.schoolEntries = {}
        for entry in self.entries:
            if(not entry.school in self.schoolEntries.keys()):
                self.schoolEntries[entry.school] = []
            self.schoolEntries[entry.school].append(entry)
        
        #Slot the entries into the rings based upon school. This will minimize the number of entries from the same school in a given ring.
        for key, item in self.schoolEntries.items():
            entries = self.schoolEntries[key]
            while len(entries):
                index = math.floor(random.random()*len(entries))
                self.roundRobinMatches[i].addEntry(entries[index])
                entries.remove(entries[index])
                i = i+1
                if(i == self.rings):
                    i=0
                    j=j+1

            
                       
    def printRingAssignments(self):
        for i in range(0, len(self.roundRobinMatches)):
            self.roundRobinMatches[i].makeOdfScoreSheet()
            print(self.roundRobinMatches[i].name)
            for j in range(0, len(self.roundRobinMatches[i].entries)):
                print("\t" + self.roundRobinMatches[i].entries[j].robotName + " : " + self.roundRobinMatches[i].entries[j].school)
                    
    def calculateTotalTime(self):
        """calculate the total time this Event is likely to take"""
        performanceTime = datetime.timedelta()
        #for Entry in self.entries:
        #    performanceTime += Entry.totalTime()    
        # TODO is the following correct for multiple pieces? Fine for now probably.
        #judgingTime = settingsInteractionInstance.loadJudgingTimePerEntry() * len(self.entries)
        #finalAdjudicationTime = settingsInteractionInstance.loadFinalAdjudicationTime() * len(self.entries)
        #self.totalTime = performanceTime + judgingTime + finalAdjudicationTime

    def addEntry(self, entry):
        """add an Entry to this Event and recalculate the totalTime"""
        self.entries.append(entry)
        #self.calculateTotalTime()

    def getParticipantIds(self):
        """returns a list of the participantIds for the Entries"""
        idList = []
        for entry in self.entries:
            idList.append(entry.participantID)
        return idList

    def export(self, csvFile, depth=0):
        """Export this event to a csv file as part of the export procedure. \
        csvFile must be a file opened with w permissions.  <depth> empty columns \
        are added to the beginning to serve as indentation"""
        
        leadingCommas = ''
        for _ in range(depth):
            leadingCommas = leadingCommas+','
            
        s = '{indent}{number},"{name}","Total Time: {time}"\n'.format(
            indent=leadingCommas,
            number=self.classNumber,
            name=self.className,
            time=self.totalTime
        )
        csvFile.write(s)
        
        s = '{indent},{header}\n'.format(
            indent=leadingCommas,
            header=Entry.getCsvHeader()
        )
        csvFile.write(s)
        
        for e in self.entries:
            e.export(csvFile, depth+1)

    def toWordFile(self, document):
        """Export to docx for printer, document is from docx module"""
        # Number the entries like 1.
        for i in range(len(self.entries)):
            entry = self.entries[i]
            p = document.add_paragraph("{0}.\t".format(i+1))
            entry.toWordFile(p)
