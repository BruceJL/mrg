"""Contains the scheduling algorithm and all its bits"""

# import datetime

from schedule import Schedule
from event import Event
from settingsInteraction import settingsInteractionInstance

# TOLERANCE = datetime.timedelta(minutes=10)

class Scheduler(object):
    """Handles the scheduling of all the Events"""
    def __init__(self):
        self.possibleEvents = []

    @staticmethod
    def sortEntriesByClass(entryList):
        """Sorts entryList into Events by class and returns a list sorted by ascending class number"""
        eventList = []
        for entry in entryList:
            for event in eventList:
                if event.classNumber == entry.classNumber:
                    event.addEntry(entry)
                    break
            else:
                # if we get here, there was no Event for that classNumber, so make one
                newEvent = Event(entry.classNumber, entry.className)
                newEvent.addEntry(entry)
                eventList.append(newEvent)
        eventList.sort(key=lambda x: x.classNumber, reverse=False) # Magic code from stackoverflow
        return eventList

    def process(self, entriesInDiscipline, sessionDatetimes):
        """Starts a backtracking search for a solution, returns a valid Schedule or None if no solution exists"""
        print "Working..."
        schedule = Schedule(sessionDatetimes)
        self.possibleEvents = self.sortEntriesByClass(entriesInDiscipline)

        result = self.recursiveProcess(schedule)
        print "Finished"
        return result

    def recursiveProcess(self, schedule):
        """Performs a backtracking search for a solution, returns a valid Schedule or None if no solution exists"""
        # Check if there are any more events to add
        if not self.possibleEvents:
            return schedule

        # # select next space to fill
        # session = schedule.findNextFit()

        for event in self.possibleEvents:
            # select next space to fill
            session = schedule.findNextFit(event.totalTime)
            if session is None:
                # can't fit the event in this schedule
                print "can't fit " + event.classNumber + " in schedule"
                return None
            if Scheduler.satisfiesContraints(session, event):
                # add event to the space in schedule
                print "adding event " + event.classNumber + " to session at " + str(session.startDatetime)
                session.add(event)
                self.possibleEvents.remove(event)
                result = self.recursiveProcess(schedule)
                if result is not None:
                    return result
                else:
                    # remove event from space in schedule
                    session.remove(event)
                    self.possibleEvents.append(event)
        print "gone through all events"
        return None

    @staticmethod
    def satisfiesContraints(session, event):
        """Returns true if adding this event to this session is valid"""
        valid = True
        
        if event.totalTime > session.emptyTime() + settingsInteractionInstance.loadTolerance():
            valid = False

        return valid
