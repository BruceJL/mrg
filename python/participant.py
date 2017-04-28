"""Deals with Participants"""

from abc import ABCMeta, abstractmethod

from utilities import requiredFieldIsGood, optionalFieldIsGood

class Participant(object):
    """Super class to hopefully make organizing things easier later"""
    # __metaclass__ = ABCMeta

    # @abstractmethod
    # def isEqualTo(self, obj):
    #     """check if obj is equal to this Participant"""
    #     pass

    # @abstractmethod
    # def addToDB(self):
    #     """add this thing to the database"""
    #     pass

# class SoloParticipant(Participant):
    """Holds participant data (name, address, contact info, etc) as strings"""
    def __init__(self, first="", last="", address="", city="", postal="", home="", cell="", email="", dob="", schoolAttending="", parent="", age="", schoolGrade="", groupName="", numberParticipants="", averageAge="", participants="", contact="", earliestPerformanceTime="", latestPerformanceTime=""):
        self.first = first
        self.last = last
        self.address = address
        self.city = city
        self.postal = postal
        self.home = home
        self.cell = cell
        self.email = email
        self.dob = dob
        self.schoolAttending = schoolAttending
        self.parent = parent
        self.age = age
        self.schoolGrade = schoolGrade
        self.groupName = groupName
        self.numberParticipants = numberParticipants
        self.averageAge = averageAge
        self.participants = participants
        self.contact = contact
        self.earliestPerformanceTime = earliestPerformanceTime
        self.latestPerformanceTime = latestPerformanceTime

    def isEqualTo(self, obj):
        """check if obj is equal to this SoloParticipant"""
        if isinstance(obj, Participant):
            if (requiredFieldIsGood(self.first, obj.first) and
                    requiredFieldIsGood(self.last, obj.last) and
                    optionalFieldIsGood(self.address, obj.address) and
                    optionalFieldIsGood(self.city, obj.city) and
                    optionalFieldIsGood(self.postal, obj.postal) and
                    optionalFieldIsGood(self.home, obj.home) and
                    optionalFieldIsGood(self.cell, obj.cell) and
                    optionalFieldIsGood(self.email, obj.email) and
                    requiredFieldIsGood(self.dob, obj.dob) and
                    optionalFieldIsGood(self.schoolAttending, obj.schoolAttending) and
                    optionalFieldIsGood(self.parent, obj.parent)):
                return True
            else:
                return False
        else:
            return False

    def __str__(self):
        return '{0} {1}'.format(self.first, self.last)

class SoloParticipant(Participant):
    """Only here to prevent compile errors"""

# leave this for now to prevent compile errors
class GroupParticipant(Participant):
    """Holds GroupParticipant data (name, size, age, etc) as strings"""
    def __init__(self, groupName="", groupSize="", schoolGrade="", averageAge="", participants="", contact="", earliestPerformanceTime="", latestPerformanceTime=""):
        self.groupName = groupName
        self.groupSize = groupSize
        self.schoolGrade = schoolGrade
        self.averageAge = averageAge
        self.participants = participants
        self.contact = contact
        self.earliestPerformanceTime = earliestPerformanceTime
        self.latestPerformanceTime = latestPerformanceTime

    def isEqualTo(self, obj):
        """check if obj is equal to this GroupParticipant"""
        if isinstance(obj, GroupParticipant):
            if (requiredFieldIsGood(self.groupName, obj.groupName) and
                    optionalFieldIsGood(self.groupSize, obj.groupSize) and
                    optionalFieldIsGood(self.schoolGrade, obj.schoolGrade) and
                    optionalFieldIsGood(self.averageAge, obj.averageAge) and
                    optionalFieldIsGood(self.participants, obj.participants) and
                    optionalFieldIsGood(self.contact, obj.contact)):
                return True
            else:
                return False
        else:
            return False

    def __str__(self):
        return self.groupName
