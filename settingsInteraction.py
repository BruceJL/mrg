"""Handles all interactions with the QSettings"""

# import sys
import datetime
from time import strptime, mktime

from PyQt4.QtCore import QSettings, QCoreApplication

class SettingsInteraction(object):
    """Handles all interactions with the QSettings file"""
    def __init__(self):
        QCoreApplication.setOrganizationName("DLC")
        QCoreApplication.setApplicationName("AFS")
        self.settings = QSettings("settings.ini", QSettings.IniFormat)

    ##### Store #####

    def storeJudgingTimePerEntry(self, value):
        """takes mm:ss formatted string"""
        self.settings.setValue("scheduleOptions/judgingTimePerEntry", value)

    def storeFinalAdjudicationTime(self, value):
        """takes mm:ss formatted string"""
        self.settings.setValue("scheduleOptions/finalAdjudicationTime", value)

    def storeTolerance(self, value):
        """takes mm:ss formatted string"""
        self.settings.setValue("scheduleOptions/tolerance", value)

    def storeDiscipline(self, value):
        """takes string"""
        self.settings.setValue("scheduleOptions/discipline", value)

    def storeSessionDatetimes(self, value):
        """takes [(startString, endString), ...] formatted list"""
        string = ""
        for start, end in value:
            string += start + ", " + end + ", "
        string = string[:-2] # hack to get rid of extraneous comma
        print("***storing sessionDatetimes string: " + string)
        self.settings.setValue("scheduleOptions/sessionDatetimes", string)

    ##### Load #####

    def loadJudgingTimePerEntry(self):
        """returns timedelta"""
        tokens = str(self.settings.value("scheduleOptions/judgingTimePerEntry").toString()).split(":")
        return datetime.timedelta(minutes=int(tokens[0]), seconds=int(tokens[1]))

    def loadFinalAdjudicationTime(self):
        """returns timedelta"""
        tokens = str(self.settings.value("scheduleOptions/finalAdjudicationTime").toString()).split(":")
        return datetime.timedelta(minutes=int(tokens[0]), seconds=int(tokens[1]))

    def loadTolerance(self):
        """returns timedelta"""
        tokens = str(self.settings.value("scheduleOptions/tolerance").toString()).split(":")
        return datetime.timedelta(minutes=int(tokens[0]), seconds=int(tokens[1]))

    def loadDiscipline(self):
        """returns string"""
        return str(self.settings.value("scheduleOptions/discipline").toString())

    def loadSessionDatetimes(self):
        """returns [(startDatetime, endDatetime), ...] formatted list"""
        tokens = str(self.settings.value("scheduleOptions/sessionDatetimes").toString()).split(", ")
        result = []
        for i in xrange(0, len(tokens), 2):
            start = datetime.datetime.fromtimestamp(mktime(strptime(tokens[i], "%d/%m/%Y %I:%M %p")))
            end = datetime.datetime.fromtimestamp(mktime(strptime(tokens[i+1], "%d/%m/%Y %I:%M %p")))
            result.append((start, end))
        print("***loaded session datetimes: ")
        print(result)
        return result

# Global variable
settingsInteractionInstance = SettingsInteraction()
