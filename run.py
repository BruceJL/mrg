from entry import Entry
from event import Event
import csv

def importEntries(file):
    """import entries from a CSV file"""
    entries = []
    with open(file, 'rt') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            if(row['robot'] != ''):
                entry = Entry(row['robot'], row['coach'], row['school'], row['comp'], row['driver1'], row['1stGr'], row['driver2'], row['2Gr'], row['driver3'], row['3Gr'])
                entries.append(entry)
    return entries

def createEvents():
    events = {}
    events['MS1'] = Event("MS1", 4, 6, 10) #minimum 4 robots per ring, max 6 robots, max 10 rings.
    events['MS2'] = Event("MS2", 4, 6, 10)
    events['MS3'] = Event("MS3", 4, 6, 10)
    events['MSA'] = Event("MSA", 4, 6, 10)
    events['PST'] = Event("PST", 4, 5, 8)
    events['PSA'] = Event("PSA", 4, 5, 8)
    events['SSA'] = Event("SSA", 0, 0, 0) #Superscramble only has one course.
    events['SSB'] = Event("SSB", 0, 0, 0)
    events['JC1'] = Event("JC1", 0, 0, 0)
    events['LFA'] = Event("LFA", 0, 0, 0)
    events['TPM'] = Event("TPM", 0, 0, 0)
    events['NXT'] = Event("NXT", 0, 0, 0)
    return events

entry_list = importEntries('2015_Registration_Test4.csv')
event_list = createEvents()

for entry in entry_list:
    event_list[entry.competition].addEntry(entry)
    
event_list['MS1'].createRoundRobinTournaments()
event_list['MS1'].printRingAssignments()
print("\n")

event_list['MS2'].createRoundRobinTournaments()
event_list['MS2'].printRingAssignments()   
print("\n")

event_list['MS3'].createRoundRobinTournaments()
event_list['MS3'].printRingAssignments()
print("\n")

event_list['MSA'].createRoundRobinTournaments()
event_list['MSA'].printRingAssignments()
print("\n")

event_list['PST'].createRoundRobinTournaments()
event_list['PST'].printRingAssignments()
print("\n")

event_list['PSA'].createRoundRobinTournaments()
event_list['PSA'].printRingAssignments()
print("\n")

    
#for key, event in event_list.items():
#    print("Competition: " + event.competition)
    #for entry in event.entries:
        #print("\t" + entry.robotName)
