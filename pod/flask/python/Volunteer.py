# import time
from enum import Enum


class priority(Enum):
    PREFERRED = (5,)
    CROSS_TRAINING = (4,)
    EXPERIENCE_OR_TRAINING = (3,)
    PRIOR_JUDGE = (2,)
    TIMER_NO_TRAINING = (1,)
    UNABLE = (0,)


class job(Enum):
    TIMER = (1,)
    JUDGE = (2,)
    SIGN_IN = (3,)
    JIGS_AND_MEASURES = (4,)
    SECURITY = (5,)
    NONE = (0,)
    WITHDRAWN = (-1,)
    SPECIAL = (6,)


class Volunteer(object):
    def __init__(
        self,
        first_name: str = "",
        last_name: str = "",
        will_train: bool = False,
        will_setup: bool = False,
        saturday_games: bool = False,
        saturday_takedown: bool = False,
        prior_security: bool = False,
        prior_timer: bool = False,
        prior_judge: bool = False,
        prior_signin: bool = False,
        prior_measure: bool = False,
        preferred_job: job = job.NONE,
        # start_time: time = time(hour=8),
        # end_time: time = time(hour=6),
    ):
        self.first_name = first_name
        self.last_name = last_name
        self.will_train = will_train
        self.will_setup = will_setup
        self.saturday_games = saturday_games
        self.saturday_takedown = saturday_takedown
        self.prior_security = prior_security
        self.prior_timer = prior_timer
        self.prior_judge = prior_judge
        self.prior_signin = prior_signin
        self.prior_measure = prior_measure
        self.preferred_job = preferred_job
        # self.start_time = start_time
        # self.end_time = end_time

        self.slotted: job = job.NONE

    # The "Can do" properties are meant to create a priority for a person
    # Doing a particular job. The higher the priority, the more emphasis
    # will be placed on putting a person in that job.
    @property
    def timerPriority(self) -> priority:

        # Grant people thier preferneces.
        if self.preferred_job == job.TIMER:
            return priority.PREFERRED

        # Make people who've only worked other jobs timers.
        elif not (self.prior_timer or self.prior_judge) and (
            self.prior_security or self.prior_measure or self.prior_signin
        ):
            return priority.CROSS_TRAINING

        return priority.TIMER_NO_TRAINING

    @property
    def canDoTiming(self) -> bool:
        return self.preferred_job in [job.TIMER, job.NONE]

    @property
    def jigsAndMeasuresPriority(self) -> priority:
        # Grant people thier preferneces.
        if self.preferred_job == job.JIGS_AND_MEASURES:
            return priority.PREFERRED

        elif self.will_train and not self.prior_measure:
            return priority.CROSS_TRAINING

        elif self.will_train or self.prior_measure:
            return priority.EXPERIENCE_OR_TRAINING

        return priority.UNABLE

    @property
    def canDoJigsAndMeasures(self) -> bool:
        return (
            self.preferred_job in [job.JIGS_AND_MEASURES, job.NONE]
            and self.jigsAndMeasuresPriority != priority.UNABLE
        )

    @property
    def signInPriority(self) -> priority:
        # Grant People thier preferences.
        if self.preferred_job == job.SIGN_IN:
            return priority.PREFERRED

        # top priority is cross-training
        elif self.will_train and not self.prior_signin:
            return priority.CROSS_TRAINING

        elif self.will_train or self.prior_signin:
            return priority.EXPERIENCE_OR_TRAINING

        return priority.UNABLE

    @property
    def canDoSignIn(self) -> bool:
        return (
            self.preferred_job in [job.SIGN_IN, job.NONE]
            and self.signInPriority != priority.UNABLE
        )

    @property
    def securityPriority(self) -> priority:

        if self.preferred_job == job.SECURITY:
            return priority.PREFERRED

        # don't make people do security twice.
        elif self.prior_security:
            return priority.UNABLE

        elif self.will_train:
            return priority.EXPERIENCE_OR_TRAINING

        return priority.UNABLE

    @property
    def canDoSecurity(self) -> bool:
        return (
            self.preferred_job in [job.SECURITY, job.NONE]
            and self.securityPriority != priority.UNABLE
        )

    @property
    def judgingPriority(self) -> priority:
        if self.preferred_job == job.JUDGE:
            return priority.PREFERRED

        # Promote prior timers with updated training
        if self.prior_timer and self.will_train and not self.prior_judge:
            return priority.CROSS_TRAINING

        elif self.prior_judge:
            return priority.PRIOR_JUDGE

        return priority.UNABLE

    @property
    def canDoJudging(self) -> bool:
        return (
            self.preferred_job in [job.JUDGE, job.NONE]
            and self.judgingPriority != priority.UNABLE
        )

    @property
    def specialPriority(self) -> priority:
        if self.preferred_job == job.SPECIAL:
            return priority.PREFERRED
        return priority.UNABLE

    @property
    def canDoSpecial(self) -> bool:
        return self.preferred_job == job.SPECIAL

    def jobPriority(self, job: job) -> priority:
        if job == job.JIGS_AND_MEASURES:
            return self.jigsAndMeasuresPriority
        elif job == job.JUDGE:
            return self.judgingPriority
        elif job == job.SECURITY:
            return self.securityPriority
        elif job == job.SIGN_IN:
            return self.signInPriority
        elif job == job.TIMER:
            return self.timerPriority
        elif job == job.SPECIAL:
            return self.specialPriority
        elif job == job.WITHDRAWN:
            if self.preferred_job == job.WITHDRAWN:
                return priority.PREFERRED
        return priority.UNABLE

    def canDo(self, job: job) -> bool:
        if job == job.JIGS_AND_MEASURES:
            return self.canDoJigsAndMeasures
        elif job == job.JUDGE:
            return self.canDoJudging
        elif job == job.SECURITY:
            return self.canDoSecurity
        elif job == job.SIGN_IN:
            return self.canDoSignIn
        elif job == job.TIMER:
            return self.canDoTiming
        elif job == job.SPECIAL:
            return self.canDoSpecial
        return False

    @property
    def canDoArray(self) -> list[job]:
        a: list[job] = []
        if self.canDoJigsAndMeasures:
            a.append(job.JIGS_AND_MEASURES)
        if self.canDoJudging:
            a.append(job.JUDGE)
        if self.canDoSecurity:
            a.append(job.SECURITY)
        if self.canDoSignIn:
            a.append(job.SIGN_IN)
        if self.canDoTiming:
            a.append(job.TIMER)
        if self.canDoSpecial:
            a.append(job.SPECIAL)
        return a
