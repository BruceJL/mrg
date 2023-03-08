#!/usr/bin/python3

from Volunteer import Volunteer, job, priority
import csv
import random
# import time


class Slotter():
    def __init__(self) -> 'None':
        volunteers: list[Volunteer] = []
        slottedVolunteers: dict[job, list[Volunteer]] = {}
        requiredVolunteers: dict[job, int] = {}

        requiredVolunteers[job.TIMER] = 22
        requiredVolunteers[job.JUDGE] = 22
        requiredVolunteers[job.SIGN_IN] = 8
        requiredVolunteers[job.JIGS_AND_MEASURES] = 8
        requiredVolunteers[job.SECURITY] = 6
        requiredVolunteers[job.NONE] = 0
        requiredVolunteers[job.SPECIAL] = 0
        requiredVolunteers[job.WITHDRAWN] = 0

        # flesh out the dicts.
        for j in job:
            slottedVolunteers[j] = []

        # Load the csv file into memory
        with open('volunteers.csv') as csv_file:
            csv_reader = csv.DictReader(csv_file, delimiter=',')
            for row in csv_reader:
                preferred_job = job.NONE
                if row['Preferred Job'] != "":
                    preferred_job = job[row['Preferred Job']]

                volunteers.append(
                    Volunteer(
                      first_name=row['name (First)'],
                      last_name=row['name (Last)'],
                      will_train=bool(row['Wednesday']),
                      will_setup=bool(row['Friday']),
                      saturday_games=bool(row['Saturday']),
                      saturday_takedown=bool(row['Saturday Takedown']),
                      prior_security=bool(row['Security']),
                      prior_timer=bool(row['Timer']),
                      prior_judge=bool(row['Judge']),
                      prior_signin=bool(row['Sign-in']),
                      prior_measure=bool(row['Jigs and Measure']),
                      preferred_job=preferred_job,
                      # start_time=time.strptime(row['Start Time'], '%H:%M'),
                      # end_time=time.strptime(row['End Time'], '%H:%M'),
                    )
                )

        # start by slotting in the "PREFERRED" positions. i.e. people who've
        # explicitly asked to do this. This also includes people with a
        # WITHDRAWN status.
        for j in job:
            slot(
              sourceVolunteers=volunteers,
              targetVolunteers=slottedVolunteers[j],
              priority=[priority.PREFERRED],
              job=j,
              maxAssignment=0,
            )

        # Slot people who can only be timers as timers.
        for v in volunteers:
            if v.canDoArray == [job.TIMER] and v.slotted == job.NONE:
                j = job.TIMER
                slottedVolunteers[j].append(v)
                v.slotted = j
                # print(f"restricted slotted {v.first_name} {v.last_name} " +
                #       f"as {j.name}")

        # Slot people who an only do 1 other job into those positions.
        for j in [job.JIGS_AND_MEASURES, job.SIGN_IN]:
            for v in volunteers:
                if (
                  j in v.canDoArray
                  and len(v.canDoArray) == 2
                  and v.slotted == job.NONE
                ):
                    slottedVolunteers[j].append(v)
                    v.slotted = j
                    # print(f"restricted slotted {v.first_name} " +
                    #       f"{v.last_name} as {j.name}")

        # Shuffle the volunteer order such that people are randomly slotted
        random.shuffle(volunteers)

        # Slot people into the jobs in the most need of volunteers.
        while True:
            neededVolunteers: float = -99999999
            i = 0.0
            needy_job: job = job.NONE
            # find the job with the biggest gap
            for j in [job.TIMER, job.JUDGE, job.JIGS_AND_MEASURES,
                      job.SIGN_IN, job.SECURITY]:

                # is will be the biggest for the job that has the thinnest
                # selction of volunteers. Note that if exceeds 1, slotting
                # will not succeed, as not enough volunteers are available to
                # fill that job.

                if availableVolunteerCount(volunteers, j) > 0:
                    i = (requiredVolunteers[j] - len(slottedVolunteers[j])) / \
                        availableVolunteerCount(volunteers, j)

                if i > neededVolunteers:
                    neededVolunteers = i
                    needy_job = j

            # print(
            #   f"{needy_job.name} needs " +
            #   f"{requiredVolunteers[needy_job] - len(slottedVolunteers[needy_job])} " +
            #   f"more people. {availableVolunteerCount(volunteers, needy_job)} " +
            #   "are available."
            # )

            # done when all jobs have the minimum allotment.
            if i == 0.0:
                break

            for v in volunteers:
                # print(f"Can {v.first_name} {v.last_name} " +
                #       f"do {needy_job.name}: {v.canDo(needy_job)} " +
                #       f"current slotting: {v.slotted}")

                if v.canDo(needy_job) and v.slotted == job.NONE:
                    # print(f"needy slotted {v.first_name} {v.last_name} " +
                    #       f"as {needy_job.name}")

                    slottedVolunteers[needy_job].append(v)
                    v.slotted = needy_job
                    break

        # slot the cross training positions. Note that we'll limit the
        # number of volunteers slotted at this point.
        for j in job:
            slot(
              sourceVolunteers=volunteers,
              targetVolunteers=slottedVolunteers[j],
              priority=[priority.CROSS_TRAINING],
              job=j,
              maxAssignment=requiredVolunteers[j],
            )

        # slot in the experienced or trained volunteers
        for j in job:
            slot(
              sourceVolunteers=volunteers,
              targetVolunteers=slottedVolunteers[j],
              priority=[priority.EXPERIENCE_OR_TRAINING, priority.PRIOR_JUDGE],
              job=j,
              maxAssignment=requiredVolunteers[j],
            )

        # Slot all the people who can judge now.
        slot(
          sourceVolunteers=volunteers,
          targetVolunteers=slottedVolunteers[job.JUDGE],
          priority=[priority.EXPERIENCE_OR_TRAINING],
          job=job.JUDGE,
          maxAssignment=0,
        )

        # Slot timers such that there are the same number of timers and judges
        slot(
          sourceVolunteers=volunteers,
          targetVolunteers=slottedVolunteers[job.TIMER],
          priority=[priority.EXPERIENCE_OR_TRAINING],
          job=job.TIMER,
          maxAssignment=len(slottedVolunteers[job.JUDGE]),
        )

        # See who we've failed to slot
        for v in volunteers:
            if v.slotted == job.NONE:
                slottedVolunteers[job.NONE].append(v)

        # Print out the assignments
        for j in job:
            print(f"Volunteers for {j.name} - {len(slottedVolunteers[j])}")
            for v in slottedVolunteers[j]:
                print(f"    {v.first_name} {v.last_name} - "
                      f"{v.slotted.name} - {v.jobPriority(v.slotted).name}")


# Slot volunteers into positions.
def slot(
    sourceVolunteers: list[Volunteer],
    targetVolunteers: list[Volunteer],
    priority: list[priority],
    job: job,
    maxAssignment: int,
) -> None:
    for v in sourceVolunteers:
        if (maxAssignment > 0 and maxAssignment == len(targetVolunteers)):
            break
        if v.jobPriority(job) in priority and v.slotted == job.NONE:
            targetVolunteers.append(v)
            v.slotted = job


def availableVolunteerCount(
    volunteers: list[Volunteer],
    j: job,
) -> int:
    count = 0
    for v in volunteers:
        if v.canDo(j) and v.slotted == job.NONE:
            count = count + 1
    return count


Slotter()
