from datetime import datetime


class Entry(object):
    def __init__(
        self,
        id: "int" = 0,
        robotName: str = "",
        coach: str = "",
        school: str = "",
        competition: str = "",
        driver1: str = "",
        driver1Grade: int = 0,
        driver2: str = "",
        driver2Grade: int = 0,
        driver3: str = "",
        driver3Grade: int = 0,
        checkInStatus: str = "",
        measured: str = "",
        registered: datetime = datetime.min,
        paymentType: str = "UNPAID",
    ):
        self.id = id
        self.robotName = robotName
        self.coach = coach
        self.school = school
        self.competition = competition
        self.driver1 = driver1
        self.driver1Grade = driver1Grade
        self.driver2 = driver2
        self.driver1Grade = driver2Grade
        self.driver3 = driver3
        self.driver3Grade = driver3Grade
        self.checkInStatus = checkInStatus
        self.measured = measured
        self.registered = registered
        self.paymentType = paymentType

    def __eq__(self, other):
        return self.id == other.id

    def __lt__(self, other):
        return self.registered < other.registered

    def __cmp__(self, other):
        if hasattr(other, "robotName"):
            return self.robotName.__cmp__(other.robotName)
        else:
            return False
