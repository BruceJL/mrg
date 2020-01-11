class Entry(object):
    def __init__(self,
                 id="",
                 robotName="",
                 coach="",
                 school="",
                 competition="",
                 driver1="",
                 driver1Grade="",
                 driver2="",
                 driver2Grade="",
                 driver3="",
                 driver3Grade="",
                 status="",
                 measured=""
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
        self.status = status
        self.measured = measured

    def __eq__(self, other):
        return self.id == other.id

    def __cmp__(self, other):
        if hasattr(other, 'robotName'):
            return self.robotName.__cmp__(other.robotName)
        else:
            return False
