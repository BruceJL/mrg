"""The Event object used by a Schedule"""


# JUDGINGTIMEPERENTRY = datetime.timedelta(seconds=60)
# FINALADJUDICATIONTIMEPERENTRY = datetime.timedelta(seconds=180)

class Resource(object):
    """Used by a Schedule"""
    def __init__(self, name, lengthX, lengthY, resourceType):
        self.name = name
        self.lengthX = lengthX
        self.lengthY = lengthY
        self.resourceType = resourceType
        # self.totalTime = datetime.timedelta(seconds=0)

    # def booking(self, time, duration):