"""The Event object used by a Schedule"""

# import sys
import datetime
import math
import random

from Entry import Entry
from RoundRobinMatch import RoundRobinMatch

from odf.opendocument import OpenDocumentText
from odf.table import Table, TableColumn, TableRow, TableCell
from odf.style import Style, TextProperties, ParagraphProperties, ListLevelProperties, FontFace,\
    TableCellProperties, TableRowProperties, TableColumnProperties, TableProperties
from odf import text
from odf.text import P, H, A, S, List, ListItem, ListStyle, ListLevelStyleBullet, ListLevelStyleNumber, ListLevelStyleBullet, Span
from odf.draw import Frame, Image


#from settingsInteraction import settingsInteractionInstance

# JUDGINGTIMEPERENTRY = datetime.timedelta(seconds=60)
# FINALADJUDICATIONTIMEPERENTRY = datetime.timedelta(seconds=180)

class Event(object):
    """Used by a Schedule"""
    def __init__(self, competition, minEntriesPerRing, maxEntriesPerRing, maxRings):
        self.competition = competition
        self.entries = []
        self.roundRobinMatches = []
        self.minEntriesPerRing = minEntriesPerRing
        self.maxEntriesPerRing = maxEntriesPerRing
        self.maxRings = maxRings
        #self.totalTime = datetime.timedelta(seconds=0)

    def createRoundRobinTournaments(self):                
        bestRemainder = len(self.entries)
        bestRings = 0
        self.rings = 0
        numEntries = len(self.entries)
    
        #Locate a solution that uses the maximum number of rings with a zero remainder
        for i in range(self.maxRings, 1, -1):
            if(numEntries/i < self.minEntriesPerRing):
                #print(str(i) + " rings has " + str(numEntries/i) + " robots per ring, which is too few.")
                continue
            if(numEntries/i > self.maxEntriesPerRing):
                #print(str(i) + " rings has " + str(numEntries/i) + " robots per ring, which is too many.")
                continue
            elif(numEntries % i == 0):
                self.rings = i
                #print(str(i) + " rings works perfectly.")
                break
            elif(numEntries % i < bestRemainder):
                #print(str(i) + " rings has a better remainder of " + str(numEntries % i))
                bestRemainder = len(self.entries) % i
                bestRings = i
        
        if(self.rings == 0):
            self.rings = bestRings
        
        print(self.competition + " - using " + str(self.rings) + " rings with an average of " + str(len(self.entries)/self.rings) + " robots per ring." )
            
        #Build the array to hold the rings and their entries.    
        self.roundRobinMatches = []
        for i in range(0, self.rings, 1):
            self.roundRobinMatches.append(RoundRobinMatch(self.competition + " Ring " + str(i+1)))
            
        i=0
        j=0
        
        #Make arrays containing the entries from a given shcool
        self.schoolEntries = {}
        for entry in self.entries:
            if(not entry.school in self.schoolEntries.keys()):
                self.schoolEntries[entry.school] = []
            self.schoolEntries[entry.school].append(entry)
        
        #Slot the entries into the rings based upon school. This will minimize the number of entries from the same school in a given ring.
        for key, item in self.schoolEntries.items():
            entries = self.schoolEntries[key]
            while len(entries):
                index = math.floor(random.random()*len(entries))
                self.roundRobinMatches[i].addEntry(entries[index])
                entries.remove(entries[index])
                i = i+1
                if(i == self.rings):
                    i=0
                    j=j+1

            
                       
    def makeOdfSchedules(self):
        document = OpenDocumentText()
        
        #Load necessary Graphics objects and constants
        diagonalImagePath = "diagonal.png"
        diagonalImageHref = document.addPicture(diagonalImagePath)
        diagonalImage = Image(href=diagonalImageHref, type="simple", show="embed", actuate="onLoad")
        nameColumnWidth = 1.75
        nameRowHeight = 1.75
        normalColumnWidth = 0.75
        normalRowHeight= 0.75
        
        #Document style object. Libreoffice only seems to work with automaticStyles and not plain ol' Styles.
        styles = document.automaticstyles

        #Top Row Style
        topRowStyleName = "TopRowStyle"
        s = Style(name=topRowStyleName, family="table-row", displayname="Regular Table Row")
        t = TableRowProperties(minrowheight=str(nameRowHeight) + "in")
        s.addElement(t)
        styles.addElement(s)
        
        #Regular Row Style
        normalRowStyleName = "NormalRowStyle"
        s = Style(name = normalRowStyleName, family="table-row", displayname="Normal Table Row")
        t = TableRowProperties(minrowheight=str(normalRowHeight) + "in")
        s.addElement(t)
        styles.addElement(s)
        
        #Left Column Style
        leftColumnStyleName = "LeftColumnStyle"
        s = Style(name=leftColumnStyleName, family="table-column", displayname="Left Table Column")
        t = TableColumnProperties(columnwidth=str(nameColumnWidth) + "in")
        s.addElement(t)
        styles.addElement(s)
        
        #Normal Column Style
        normalColumnStyleName = "NormalColumnStyle"
        s = Style(name=normalColumnStyleName, family="table-column", displayname="Normal Table Column")
        t = TableColumnProperties(columnwidth=str(normalColumnWidth) + "in")
        s.addElement(t)
        styles.addElement(s)
             
        #Text Cell Style
        textCellStyleName = "TextCellStyle"  
        s = Style(name=textCellStyleName, family="table-cell", displayname="Text Cell")
        t = TableCellProperties(verticalalign="middle", padding="0.1in", borderright="0.05pt solid #000000", bordertop="0.05pt solid #000000", borderleft='0.05pt solid #000000', borderbottom='0.05pt solid #000000')        
        s.addElement(t)
        styles.addElement(s)
        
        #Image Cell style
        imageCellStyleName = "ImageCellStyle"
        s = Style(name=imageCellStyleName, family="table-cell", displayname="Image Cell")
        t = TableCellProperties(verticalalign="middle", borderright="0.05pt solid #000000", bordertop="0.05pt solid #000000", borderleft='0.05pt solid #000000', borderbottom='0.05pt solid #000000')
        s.addElement(t)
        styles.addElement(s)
         
        #top row robot name cell
        topRowRobotNameCellStyleName = "TopRowRobotNameTableCellStyle"  
        s = Style(name=topRowRobotNameCellStyleName, family="table-cell", displayname="Top Row Robot Name Cell Style")
        t = TableCellProperties(writingmode="tb-rl", verticalalign="middle", padding="0.1in", borderright="0.05pt solid #000000", bordertop="0.05pt solid #000000", borderleft='0.05pt solid #000000', borderbottom='0.05pt solid #000000')        
        s.addElement(t)
        styles.addElement(s)
        
        #Greyed out table cell style
        greyTableCellStyleName = "GreyTableCell"
        s = Style(name=greyTableCellStyleName, family="table-cell", displayname="Greyed Out Table Cell Style") 
        t = TableCellProperties(backgroundcolor='#808080', borderright="0.05pt solid #000000", bordertop="0.05pt solid #000000", borderleft='0.05pt solid #000000', borderbottom='0.05pt solid #000000')
        s.addElement(t)
        styles.addElement(s)
        
        #Robot Name Paragraph Style
        robotNameParagraphStyleName = "RobotNameParagraphStyle"
        s = Style(name = robotNameParagraphStyleName, family="paragraph", displayname="Robot Name Paragraph Style")
        t = ParagraphProperties(textalign="end")
        s.addElement(t)
        t = TextProperties(fontsize="16pt", fontsizecomplex="16pt", fontsizeasian="16pt")
        s.addElement(t)
        styles.addElement(s)       
        
        #Heading Text
        headingParagraphStyleName = "HeadingParagraphStyle"
        s = Style(name = headingParagraphStyleName, family="paragraph", displayname="Robot Name Paragraph Style")
        t = ParagraphProperties(breakbefore="page")
        s.addElement(t)
        t = TextProperties(fontsize="20pt", fontsizecomplex="20pt", fontsizeasian="20pt")
        s.addElement(t)
        styles.addElement(s)
        
        for i in range(0, len(self.roundRobinMatches)):
            print(self.roundRobinMatches[i].name)
            for j in range(0, len(self.roundRobinMatches[i].entries)):
                print("\t" + self.roundRobinMatches[i].entries[j].robotName + " : " + self.roundRobinMatches[i].entries[j].school)

            #Table Style
            scoreCardTableStyleName = "ScoreCardTableStyle" + str(i)
            tableWidth = nameColumnWidth + (len(self.roundRobinMatches[i].entries)-1) * normalColumnWidth
            s = Style(name=scoreCardTableStyleName, family="table", displayname="Score Card Table " + str(i) )
            t = TableProperties(align="center", width=str(tableWidth) + "in")
            s.addElement(t)
            styles.addElement(s)
                
            #Make the table
            #The table has room for n-1 robots on any row/column to minimize the size of the table.
            #The cells which are of no use are greyed out.       
        
            h=H(outlinelevel=1, text=self.roundRobinMatches[i].name + " Scoresheet", stylename=headingParagraphStyleName)
            document.text.addElement(h)
            p = P(text="Mark the winner with a 'W' in the triangle nearest to the winners name.")
            document.text.addElement(p)
        
            table = Table(name="Table" + str(i), stylename=scoreCardTableStyleName)
            table.addElement(TableColumn(stylename=leftColumnStyleName))
            table.addElement(TableColumn(stylename=normalColumnStyleName, numbercolumnsrepeated=len(self.roundRobinMatches[i].entries)-1))
        
            #Row 1
            tr = TableRow(stylename=topRowStyleName)
            table.addElement(tr)
            #Add a greyed out cell here
            tc = TableCell(valuetype="string", stylename=greyTableCellStyleName)
            tr.addElement(tc)
                
            #Populate the first row with  the rest of the robot names (1 per column).
            for j in range(1,len(self.roundRobinMatches[i].entries),1):
                tc = TableCell(valuetype="string", stylename=topRowRobotNameCellStyleName)
                tc.addElement(P(text=self.roundRobinMatches[i].entries[j].robotName, stylename=robotNameParagraphStyleName))
                tr.addElement(tc)
                    
             #Populate the remaining cells
            for j in range(0,len(self.roundRobinMatches[i].entries)-1,1):
                tr = TableRow(stylename=normalRowStyleName)
                table.addElement(tr)
                tc = TableCell(valuetype="string", stylename=textCellStyleName)
                tc.addElement(P(text=self.roundRobinMatches[i].entries[j].robotName, stylename=robotNameParagraphStyleName))
                tr.addElement(tc)
                for k in range(0,len(self.roundRobinMatches[i].entries),1):
                    if(k<j):
                        tc = TableCell(stylename=greyTableCellStyleName)
                    else:
                        tc = TableCell(valuetype="string", stylename=imageCellStyleName)
                        p = P()
                        tc.addElement(p)
                        f = Frame(name="diagonal", anchortype="as-char", width=str(normalColumnWidth) + "in", height=str(normalRowHeight) + "in")
                        p.addElement(f)
                        diagonalImage = Image(href=diagonalImageHref, type="simple", show="embed", actuate="onLoad")
                        f.addElement(diagonalImage)
                    tr.addElement(tc)
                                        
            document.text.addElement(table)
            document.text.addElement(text.SoftPageBreak())
            
        document.save("./ScoreSheets/" + self.competition, True)
                
    def makeOdfLabels(self):
        print("Making Labels.")
        
                    
    def calculateTotalTime(self):
        """calculate the total time this Event is likely to take"""
        performanceTime = datetime.timedelta()
        #for Entry in self.entries:
        #    performanceTime += Entry.totalTime()    
        # TODO is the following correct for multiple pieces? Fine for now probably.
        #judgingTime = settingsInteractionInstance.loadJudgingTimePerEntry() * len(self.entries)
        #finalAdjudicationTime = settingsInteractionInstance.loadFinalAdjudicationTime() * len(self.entries)
        #self.totalTime = performanceTime + judgingTime + finalAdjudicationTime

    def addEntry(self, entry):
        """add an Entry to this Event and recalculate the totalTime"""
        self.entries.append(entry)
        #self.calculateTotalTime()

    def getParticipantIds(self):
        """returns a list of the participantIds for the Entries"""
        idList = []
        for entry in self.entries:
            idList.append(entry.participantID)
        return idList

    def export(self, csvFile, depth=0):
        """Export this event to a csv file as part of the export procedure. \
        csvFile must be a file opened with w permissions.  <depth> empty columns \
        are added to the beginning to serve as indentation"""
        
        leadingCommas = ''
        for _ in range(depth):
            leadingCommas = leadingCommas+','
            
        s = '{indent}{number},"{name}","Total Time: {time}"\n'.format(
            indent=leadingCommas,
            number=self.classNumber,
            name=self.className,
            time=self.totalTime
        )
        csvFile.write(s)
        
        s = '{indent},{header}\n'.format(
            indent=leadingCommas,
            header=Entry.getCsvHeader()
        )
        csvFile.write(s)
        
        for e in self.entries:
            e.export(csvFile, depth+1)

    def toWordFile(self, document):
        """Export to docx for printer, document is from docx module"""
        # Number the entries like 1.
        for i in range(len(self.entries)):
            entry = self.entries[i]
            p = document.add_paragraph("{0}.\t".format(i+1))
            entry.toWordFile(p)
