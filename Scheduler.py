"""Contains the scheduling algorithm and all its bits"""

# import datetime

from schedule import Schedule
from event import Event
from settingsInteraction import settingsInteractionInstance
import datetime

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
                    event.add_entry(entry)
                    break
            else:
                # if we get here, there was no Event for that classNumber, so make one
                newEvent = Event(entry.classNumber, entry.className)
                newEvent.add_entry(entry)
                eventList.append(newEvent)
        eventList.sort(key=lambda x: x.classNumber, reverse=False) # Magic code from stackoverflow
        return eventList

    def process(self, entriesInDiscipline, sessionDatetimes):
        """Starts a backtracking search for a solution, returns a valid Schedule or None if no solution exists"""
        print "Working..."
        schedule = Schedule(sessionDatetimes)
        self.possibleEvents = self.sortEntriesByClass(entriesInDiscipline)

        # Check that there is enough time in the Schedule to fit all the events
        eventTime = datetime.timedelta(seconds=0)
        for event in self.possibleEvents:
            event.calculate_total_time()
            eventTime += event.total_time

        if eventTime <= schedule.totalAvailableTime():
            result = self.recursiveProcess(schedule)
        else:
            result = None
        print "Finished"
        return result

    def recursiveProcess(self, schedule):
        """Performs a backtracking search for a solution, returns a valid Schedule or None if no solution exists"""
        # Check if there are any more events to add
        if not self.possibleEvents:
            return schedule

        # # select next space to fill
        # session = Schedule.findNextFit()

        for event in self.possibleEvents:
            # select next space to fill
            session = schedule.findNextFit(event.total_time)
            if session is None:
                # can't fit the Event in this Schedule
                print "can't fit " + event.classNumber + " in Schedule"
                return None
            if Scheduler.satisfiesContraints(session, event):
                # add Event to the space in Schedule
                print "adding Event " + event.classNumber + " to session at " + str(session.startDatetime)
                session.add(event)
                self.possibleEvents.remove(event)
                result = self.recursiveProcess(schedule)
                if result is not None:
                    return result
                else:
                    # remove Event from space in Schedule
                    session.remove(event)
                    self.possibleEvents.append(event)
        print "gone through all events"
        return None

    @staticmethod
    def satisfiesContraints(session, event):
        """Returns true if adding this Event to this session is valid"""
        valid = True
        
        if event.total_time > session.emptyTime() + settingsInteractionInstance.loadTolerance():
            valid = False

        return valid
