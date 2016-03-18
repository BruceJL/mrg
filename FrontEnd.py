from Entry import Entry
from Event import Event
from Resource import Resource
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
    events['MS1'].checksString = "[ ] Weight  [ ] Size"
    
    events['MS2'] = Event("MS2", 4, 6, 10)
    events['MS2'].checksString = "[ ] Weight  [ ] Size"
    
    events['MS3'] = Event("MS3", 4, 6, 10)
    events['MS3'].checksString = "[ ] Weight  [ ] Size"
    
    events['MSA'] = Event("MSA", 4, 6, 10)
    events['MSA'].checksString = "[ ] Weight  [ ] Size  [   sec] Delay"
    
    events['PST'] = Event("PST", 4, 8, 4)
    events['PST'].checksString = "[ ] Weight  [ ] Size"
    
    events['PSA'] = Event("PSA", 4, 8, 4)
    events['PSA'].checksString = "[ ] Weight  [ ] Size  [   sec] Delay"
    
    events['SSA'] = Event("SSA", 0, 0, 0) #Superscramble only has one course.
    events['SSA'].checksString = "[ ] Weight  [ ] Size"
    
    events['SSB'] = Event("SSB", 0, 0, 0)
    events['SSB'].checksString = "[ ] Weight  [ ] Size"
    
    events['JC1'] = Event("JC1", 0, 0, 0)
    events['JC1'].checksString = "[ ] Weight  [ ] Size"
    
    events['LFA'] = Event("LFA", 0, 0, 0)
    events['LFA'].checksString = "[ ] Weight  [ ] Size"
    
    events['TPM'] = Event("TPM", 0, 0, 0)
    events['TPM'].checksString = "[ ] Weight  [ ] Size"
    
    events['NXT'] = Event("NXT", 0, 0, 0)
    events['NXT'].checksString = "[ ] Weight  [ ] Size"
    
    return events

def createResources():
    resources = []
    resources.append(Resource("Mini Ring 01", 12, 12, "mini_ring"))
    resources.append(Resource("Mini Ring 02", 12, 12, "mini_ring"))
    resources.append(Resource("Mini Ring 03", 12, 12, "mini_ring"))
    resources.append(Resource("Mini Ring 04", 12, 12, "mini_ring"))
    resources.append(Resource("Mini Ring 05", 12, 12, "mini_ring"))
    resources.append(Resource("Mini Ring 06", 12, 12, "mini_ring"))
    resources.append(Resource("Mini Ring 07", 12, 12, "mini_ring"))
    resources.append(Resource("Mini Ring 08", 12, 12, "mini_ring"))
    resources.append(Resource("Mini Ring 09", 12, 12, "mini_ring"))
    resources.append(Resource("Mini Ring 10", 12, 12, "mini_ring"))
    resources.append(Resource("Prairie Ring 01", 18, 18, "prairie_ring"))
    resources.append(Resource("Prairie Ring 02", 18, 18, "prairie_ring"))
    resources.append(Resource("Prairie Ring 03", 18, 18, "prairie_ring"))
    resources.append(Resource("Prairie Ring 04", 18, 18, "prairie_ring"))
    resources.append(Resource("Line Follower Track 01", 18, 18, "line_follower_track"))
    resources.append(Resource("Line Follower Track 02", 18, 18, "line_follower_track"))
    resources.append(Resource("Tractor Pull Track", 18, 18, "tractor_pull_track"))
    return resources
    

#Script execution starts here.
entry_list = importEntries('2015_Registration_Test4.csv')
event_list = createEvents()
resource_list = createResources()

for entry in entry_list:
    event_list[entry.competition].addEntry(entry)

event_list['MS1'].createRoundRobinTournaments()
event_list['MS1'].makeNewOdfSchedules()
event_list['MS1'].makeOdf5160Labels()
print("\n")

event_list['MS2'].createRoundRobinTournaments()
event_list['MS2'].makeNewOdfSchedules()
event_list['MS2'].makeOdf5160Labels()   
print("\n")

event_list['MS3'].createRoundRobinTournaments()
event_list['MS3'].makeNewOdfSchedules()
event_list['MS3'].makeOdf5160Labels()
print("\n")

event_list['MSA'].createRoundRobinTournaments()
event_list['MSA'].makeNewOdfSchedules()
event_list['MSA'].makeOdf5160Labels()
print("\n")

event_list['PST'].createRoundRobinTournaments()
event_list['PST'].makeNewOdfSchedules()
event_list['PST'].makeOdf5160Labels()
print("\n")

event_list['PSA'].createRoundRobinTournaments()
event_list['PSA'].makeNewOdfSchedules()
event_list['PSA'].makeOdf5160Labels()
print("\n")

    
#for key, Event in event_list.items():
#    print("Competition: " + Event.competition)
    #for Entry in Event.entries:
        #print("\t" + Entry.robotName)
