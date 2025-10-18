from sqlalchemy import (
    ForeignKey,
    Integer,
)
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
)

from datetime import datetime


class Competition(DeclarativeBase):
    __tablename__ = "competition"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    longNAme: Mapped[str]
    rings: Mapped[int]
    minRobotPerRing: Mapped[int]
    maxRobotsPerRing: Mapped[int]
    checkstring: Mapped[str]
    registrationTime: Mapped[datetime]
    measureMass: Mapped[bool]
    measureSize: Mapped[bool]
    measureTime: Mapped[bool]
    measureDeadman: Mapped[bool]
    maxEntries: Mapped[int]
    robotCount: Mapped[int]
    robotCheckedInCount: Mapped[int]


class Robot(DeclarativeBase):
    __tablename__ = "robot"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    competition = mapped_column(Integer(), ForeignKey(Competition.id))
    driver1: Mapped[str]
    driver1gr: Mapped[int]
    driver2: Mapped[str]
    driver2gr: Mapped[int]
    driver3: Mapped[str]
    driver3gr: Mapped[int]
    school: Mapped[str]
    coach: Mapped[str]
    email: Mapped[str]
    ph: Mapped[str]
    fee: Mapped[bool]
    paid: Mapped[int]
    late: Mapped[bool]
    checkinStatus: Mapped[str]
    paymentType: Mapped[str]
    registered: Mapped[datetime]
    participated: Mapped[bool]
    slottedStatus: Mapped[str]
    measured: Mapped[bool]

    def __repr__(self) -> str:
        return f"Robot {self.name} - id: {self.id}"


class Measurement(DeclarativeBase):
    __tablename__ = "measurement"
    id: Mapped[int] = mapped_column(primary_key=True)
    robot = mapped_column(Integer(), ForeignKey(Competition.id))
    datetime: Mapped[datetime]
    result: Mapped[bool]
    type: Mapped[str]
    volunteer: Mapped[str]

    def __repr__(self) -> str:
        return f"Measurement: {self.type} - {self.result} - {self.robot.name}"


class Tournament(DeclarativeBase):
    __tablename__ = "tournament"
    id: Mapped[int] = mapped_column(primary_key=True)
    competition = mapped_column(Integer(), ForeignKey(Competition.id))
    ring: Mapped[int]
    judge: Mapped[str]
    timer: Mapped[str]


class RingAssignment(DeclarativeBase):
    __tablename__ = "ringAssignment"
    id: Mapped[int] = mapped_column(primary_key=True)
    robot = mapped_column(Integer(), ForeignKey(Robot.id))
    letter: Mapped[str]
    rank: Mapped[int]
    tournament = mapped_column(Integer(), ForeignKey(Tournament.id))


class Match(DeclarativeBase):
    __tablename__ = "match"
    id: Mapped[int] = mapped_column(primary_key=True)
    competitor1 = mapped_column(Integer(), ForeignKey(Robot.id))
    competitor2 = mapped_column(Integer(), ForeignKey(Robot.id))
    tournament = mapped_column(Integer(), ForeignKey(Tournament.id))
    round1winner: Mapped[int]
    round2winner: Mapped[int]
    round3winner: Mapped[int]


class ActivityLog(DeclarativeBase):
    __tablename__ = "activity-log"
    id: Mapped[int] = mapped_column(primary_key=True)
    volunteer: Mapped[str]
    datetime: Mapped[datetime]
    robot = mapped_column(Integer(), ForeignKey(Robot.id))
    function: Mapped[str]
    action: Mapped[str]
