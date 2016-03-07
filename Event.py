"""The Event object used by a Schedule"""

# import sys
import datetime
import math
import random

from Entry import Entry
from RoundRobin import RoundRobinTournament

from odf.opendocument import OpenDocumentText
from odf.table import Table, TableColumn, TableRow, TableCell
from odf.style import Style, TextProperties, ParagraphProperties, ListLevelProperties, FontFace,\
    TableCellProperties, TableRowProperties, TableColumnProperties, TableProperties,\
    PageLayoutProperties, SectionProperties, Columns, Column
from odf import text, draw, table, style, text
from odf.text import P, H, A, S, List, ListItem, ListStyle, ListLevelStyleBullet, ListLevelStyleNumber, ListLevelStyleBullet, Span
from odf.draw import Frame, Image
from odf.office import MasterStyles


#from settingsInteraction import settingsInteractionInstance

# JUDGINGTIMEPERENTRY = datetime.timedelta(seconds=60)
# FINALADJUDICATIONTIMEPERENTRY = datetime.timedelta(seconds=180)

class Event(object):
    """Used by a Schedule"""
    def __init__(self, competition, minEntriesPerRing, maxEntriesPerRing, maxRings):
        self.competition = competition
        self.entries = []
        self.roundRobinTournaments = []
        self.minEntriesPerRing = minEntriesPerRing
        self.maxEntriesPerRing = maxEntriesPerRing
        self.maxRings = maxRings
        self.version = 0
        self.checksString = ""
        #self.totalTime = datetime.timedelta(seconds=0)

    def createRoundRobinTournaments(self):                
        bestRemainder = len(self.entries)
        bestRings = 0
        self.rings = 0
        self.version += 1
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
        self.roundRobinTournaments = []
        for i in range(0, self.rings, 1):
            self.roundRobinTournaments.append(RoundRobinTournament(self.competition + " Ring " + str(i+1)))
            
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
                self.roundRobinTournaments[i].addEntry(entries[index])
                entries.remove(entries[index])
                i = i+1
                if(i == self.rings):
                    i=0
                    j=j+1
                    
        #Build the match Schedule
        for i in range(0, len(self.roundRobinTournaments), 1):
            print("Ring " + str(i) + " schedule")
            self.roundRobinTournaments[i].createRoundRobinMatches()
            for j in range(0, len(self.roundRobinTournaments[i].matches)):
                print("\t" + self.roundRobinTournaments[i].matches[j].contestant1.robotName + " VS " + self.roundRobinTournaments[i].matches[j].contestant2.robotName)
        
        
    def makeOdf5160Labels(self):
        #This will generate an ODF files for 5160 labels for a given event.
        labelWidth = 2.625
        labelHeight = 1
        numLabelRows = 10
        numLabelColumns = 3
        labelSheetWidth = 8.5
        labelSheetHeight = 11
        
        leftRightMargin = (labelSheetWidth - numLabelColumns * labelWidth)/2
        topBottomMargin = (labelSheetHeight - numLabelRows * labelHeight)/2
        
        tableWidth = numLabelColumns * labelWidth
        tableHeight = numLabelRows * labelHeight
        
        document = OpenDocumentText()
        styles = document.automaticstyles    
        
        #Setup the page layout.
        pageLayoutStyleName = "PageLayoutStyleName"
        s = style.PageLayout(name=pageLayoutStyleName)
        t = style.PageLayoutProperties(writingmode="lr-tb", margintop=str(topBottomMargin) + "in", marginbottom=str(topBottomMargin) + "in",
                                        marginleft=str(leftRightMargin) + "in", marginright=str(leftRightMargin) + "in", printorientation="portrait",
                                        pageheight=str(labelSheetHeight) + "in", pagewidth=str(labelSheetWidth) + "in")
        s.addElement(t)
        styles.addElement(s)
        
        masterpage = style.MasterPage(name="Standard", pagelayoutname=pageLayoutStyleName)
        document.masterstyles.addElement(masterpage)
        
        #Setup the table layout
        #Table Style
        labelTableStyleName = "LabelTableStyle"
        s = Style(name=labelTableStyleName, family="table", displayname="Label Table")
        t = TableProperties(align="center", width=str(tableWidth) + "in")
        s.addElement(t)
        styles.addElement(s)
        
        #label Row style
        labelRowStyleName = "LabelRowStyleName"
        s = Style(name = labelRowStyleName, family="table-row", displayname="Label Row")
        t = TableRowProperties(minrowheight=str(labelHeight) + "in")        
        s.addElement(t)
        styles.addElement(s)
        
        #label Column Style
        labelColumnStyleName = "labelColumnStyle"
        s = Style(name=labelColumnStyleName, family="table-column", displayname="Label Table Column")
        t = TableColumnProperties(columnwidth=str(labelWidth) + "in")
        s.addElement(t)
        styles.addElement(s)
        
        #cell style
        labelCellStyleName = "LabelCellStyleName"
        s = Style(name=labelCellStyleName, family="table-cell", displayname="Text Cell")
        t = TableCellProperties(verticalalign="middle", padding="0.05in")        
        s.addElement(t)
        styles.addElement(s)
        
        #Paragraph Style
        labelParagraphStyleName = "LabelParagraphStyle"
        s = Style(name = labelParagraphStyleName, family="paragraph", displayname="Label Paragraph Style")
        t = ParagraphProperties(textalign="center")
        s.addElement(t)
        t = TextProperties(fontsize="10pt", fontsizecomplex="10pt", fontsizeasian="10pt")
        s.addElement(t)
        styles.addElement(s)
        
        index = 0
        for i in range(0, len(self.roundRobinTournaments), 1):
            for j in range(0, len(self.roundRobinTournaments[i].entries),1):
                if(index % 30 == 0): #Start a new page.
                    table = Table(name="Table" + str(i), stylename=labelTableStyleName)
                    table.addElement(TableColumn(stylename=labelColumnStyleName, numbercolumnsrepeated=str(numLabelColumns)))
                    document.text.addElement(table)
                if(index % 3 == 0): #Start a new row
                    tr = TableRow(stylename=labelRowStyleName)
                    table.addElement(tr)
                tc = TableCell(valuetype="string", stylename=labelCellStyleName)
                tr.addElement(tc)
                tc.addElement(P(text="MRG 2016 - " + self.roundRobinTournaments[i].name + " - "  + "V" + str(self.version), stylename=labelParagraphStyleName))
                tc.addElement(P(text= self.roundRobinTournaments[i].entries[j].letter + " - " + self.roundRobinTournaments[i].entries[j].robotName, stylename=labelParagraphStyleName))
                tc.addElement(P(text="[ ]Weight  [ ]Size", stylename=labelParagraphStyleName))
                index += 1
        
        document.save("./ScoreSheets/" + self.competition + "-labels", True)
        
    def makeNewOdfSchedules(self):
        document = OpenDocumentText()
        
        nameColumnWidth = 1.25
        rowHeight = 0.25
        letterColumnWidth = 0.25
        wlColumnWidth = 0.25
        
        styles = document.automaticstyles
        #Page layout style
        pageLayoutStyleName = "PageLayoutStyleName"
        s = style.PageLayout(name=pageLayoutStyleName)
        t = style.PageLayoutProperties(writingmode="lr-tb", margintop ="0.5in", marginbottom="0.5in", marginleft="0.5in", marginright="0.5in", printorientation="portrait", pageheight="11in", pagewidth="8.5in")
        s.addElement(t)
        styles.addElement(s)
        
        masterpage = style.MasterPage(name="Standard", pagelayoutname=pageLayoutStyleName)
        document.masterstyles.addElement(masterpage)
        
        #Section Style
        sectionStyleName = "SectionStyleName"
        s = Style(name=sectionStyleName, family="section", displayname="Section Style")
        t = SectionProperties(editable="false", dontbalancetextcolumns="false")
        c = Columns(columngap="0in", columncount="2")
        c1 = Column(endindent="0in", startindent="0in", relwidth="5400*")
        c2 = Column(endindent="0in", startindent="0in", relwidth="5400*")
        c.addElement(c1)
        c.addElement(c2)
        t.addElement(c)
        s.addElement(t)
        styles.addElement(s)
        
        #Table Style
        scoreCardTableStyleName = "ScoreCardTableStyle"
        tableWidth = 2*nameColumnWidth  + 2*letterColumnWidth + 2*wlColumnWidth
        s = Style(name=scoreCardTableStyleName, family="table", displayname="Score Card Table ")
        t = TableProperties(align="center", width=str(tableWidth) + "in")
        s.addElement(t)
        s.addElement(t)
        styles.addElement(s)
        
        #Row style
        rowStyleName = "RowStyleName"
        s = Style(name = rowStyleName, family="table-row", displayname="Normal Table Row")
        t = TableRowProperties(minrowheight=str(rowHeight) + "in")        
        s.addElement(t)
        styles.addElement(s)
        
        #Even Row cell style
        evenRowCellStyleName = "EvenRowCellStyleName"
        s = Style(name=evenRowCellStyleName, family="table-cell", displayname="Text Cell")
        t = TableCellProperties(backgroundcolor='#C0C0C0', verticalalign="middle", padding="0.05in", borderright="0.05pt solid #000000", bordertop="0.05pt solid #000000", borderleft='0.05pt solid #000000', borderbottom='0.05pt solid #000000')        
        s.addElement(t)
        styles.addElement(s)
        
        #Odd row cell style
        oddRowCellStyleName = "OddRowCellStyleName"
        s = Style(name=oddRowCellStyleName, family="table-cell", displayname="Text Cell")
        t = TableCellProperties(verticalalign="middle", padding="0.05in", borderright="0.05pt solid #000000", bordertop="0.05pt solid #000000", borderleft='0.05pt solid #000000', borderbottom='0.05pt solid #000000')        
        s.addElement(t)
        styles.addElement(s)
        
        #letter Column Style
        letterColumnStyleName = "LetterColumnStyle"
        s = Style(name=letterColumnStyleName, family="table-column", displayname="Left Table Column")
        t = TableColumnProperties(columnwidth=str(letterColumnWidth) + "in")
        s.addElement(t)
        styles.addElement(s)
        
        #letter Column Style
        wlColumnStyleName = "WLColumnStyle"
        s = Style(name=wlColumnStyleName, family="table-column", displayname="Left Table Column")
        t = TableColumnProperties(columnwidth=str(wlColumnWidth) + "in")
        s.addElement(t)
        styles.addElement(s)
        
        #letter Column Style
        nameColumnStyleName = "NameColumnStyle"
        s = Style(name=nameColumnStyleName, family="table-column", displayname="Left Table Column")
        t = TableColumnProperties(columnwidth=str(nameColumnWidth) + "in")
        s.addElement(t)
        styles.addElement(s)
        
        #Robot Name Paragraph Style
        robotNameParagraphStyleName = "RobotNameParagraphStyle"
        s = Style(name = robotNameParagraphStyleName, family="paragraph", displayname="Robot Name Paragraph Style")
        t = ParagraphProperties(textalign="center")
        s.addElement(t)
        t = TextProperties(fontsize="12pt", fontsizecomplex="12pt", fontsizeasian="12pt")
        s.addElement(t)
        styles.addElement(s)
        
        #Heading Text
        headingParagraphStyleName = "HeadingParagraphStyle"
        s = Style(name = headingParagraphStyleName, family="paragraph", displayname="Robot Name Paragraph Style")
        t = ParagraphProperties(breakbefore="page", textalign="center")
        s.addElement(t)
        t = TextProperties(fontsize="20pt", fontsizecomplex="20pt", fontsizeasian="20pt")
        s.addElement(t)
        styles.addElement(s)
        
        for i in range(0, len(self.roundRobinTournaments), 1):
            h=H(outlinelevel=1, text=self.roundRobinTournaments[i].name + " Score Sheet - Revision " + str (self.version), stylename=headingParagraphStyleName)
            document.text.addElement(h)
            p = P(text="Mark the winner with a 'W' in the box next to the winners name. Best 2 out of 3.")
            document.text.addElement(p)
            
            table = Table(name="Table" + str(i), stylename=scoreCardTableStyleName)
            table.addElement(TableColumn(stylename=letterColumnStyleName))
            table.addElement(TableColumn(stylename=nameColumnStyleName))
            table.addElement(TableColumn(stylename=wlColumnStyleName))
            table.addElement(TableColumn(stylename=wlColumnStyleName))
            table.addElement(TableColumn(stylename=nameColumnStyleName))
            table.addElement(TableColumn(stylename=letterColumnStyleName))
        
                
            #Populate the first row with  the rest of the robot names (1 per column).
            for j in range(0, len(self.roundRobinTournaments[i].matches)):
                if(j%2==0):
                    columnStyle = evenRowCellStyleName
                else:
                    columnStyle = oddRowCellStyleName
                    
                tr1 = TableRow(stylename=rowStyleName)
                tr2 = TableRow(stylename=rowStyleName)
                
                table.addElement(tr1)
                table.addElement(tr2)
                
                tc = TableCell(valuetype="string", stylename=columnStyle, numberrowsspanned="2")
                tr1.addElement(tc)
                tc.addElement(P(text=self.roundRobinTournaments[i].matches[j].contestant1.letter, stylename=robotNameParagraphStyleName))
                tc = TableCell(valuetype="string", stylename=columnStyle)
                tr2.addElement(tc)
                
                tc = TableCell(valuetype="string", stylename=columnStyle, numberrowsspanned="2") 
                tr1.addElement(tc)
                tc.addElement(P(text=self.roundRobinTournaments[i].matches[j].contestant1.robotName, stylename=robotNameParagraphStyleName))
                tc = TableCell(valuetype="string", stylename=columnStyle)
                tr2.addElement(tc)
                
                tc = TableCell(valuetype="string", stylename=columnStyle)
                tr1.addElement(tc)
                tc = TableCell(valuetype="string", stylename=columnStyle)
                tr2.addElement(tc)
                
                tc = TableCell(valuetype="string", stylename=columnStyle)
                tr1.addElement(tc)
                tc = TableCell(valuetype="string", stylename=columnStyle)
                tr2.addElement(tc)
                
                tc = TableCell(valuetype="string", stylename=columnStyle, numberrowsspanned="2") 
                tr1.addElement(tc) 
                tc.addElement(P(text=self.roundRobinTournaments[i].matches[j].contestant2.robotName, stylename=robotNameParagraphStyleName))
                tc = TableCell(valuetype="string", stylename=columnStyle)
                tr2.addElement(tc)
                
                tc = TableCell(valuetype="string", stylename=columnStyle, numberrowsspanned="2")
                tr1.addElement(tc)
                tc.addElement(P(text=self.roundRobinTournaments[i].matches[j].contestant2.letter, stylename=robotNameParagraphStyleName))
                tc = TableCell(valuetype="string", stylename=columnStyle)
                tr2.addElement(tc)
                
            #If the table is two long break it into two columns.
            if(len(self.roundRobinTournaments[i].matches)*rowHeight>6.5):    
                section = text.Section(name="Section" + str(i), stylename=sectionStyleName)
                section.addElement(table)
                document.text.addElement(section)
            else:
                document.text.addElement(table)
            
            #Add a score summary table on the bottom of the page.     
            summaryColumnWidth = 7.5/len(self.roundRobinTournaments[i].entries)
            if(summaryColumnWidth >1.5):
                summaryColumnWidth=1.5
            summaryTableWidth = summaryColumnWidth*len(self.roundRobinTournaments[i].entries)
            
            summaryTableStyleName = "SummaryTableStyleName" + str(i)
            s = Style(name=summaryTableStyleName, family="table", displayname="Summary Table" + str(i))
            t = TableProperties(align="center", width=str(summaryTableWidth) + "in")
            s.addElement(t)
            s.addElement(t)
            styles.addElement(s)
            
            summaryColumnStyleName = "SummaryColumnStyle" + str(i)
            s = Style(name=summaryColumnStyleName, family="table-column", displayname="Summary Table Column " + str(i))
            t = TableColumnProperties(columnwidth=str(summaryColumnWidth) + "in")
            s.addElement(t)
            styles.addElement(s)
            
            table = Table(name="SummaryTable" + str(i), stylename=summaryTableStyleName)
            table.addElement(TableColumn(stylename=summaryColumnStyleName, numbercolumnsrepeated=len(self.roundRobinTournaments[i].entries)))
            tr1 = TableRow(stylename=rowStyleName)
            tr2 = TableRow(stylename=rowStyleName)
            table.addElement(tr1)
            for j in range(0,len(self.roundRobinTournaments[i].entries),1):
                tc = TableCell(valuetype="string", stylename=oddRowCellStyleName)
                tc.addElement(P(text=self.roundRobinTournaments[i].entries[j].robotName, stylename=robotNameParagraphStyleName))
                tr1.addElement(tc)
                tc = TableCell(valuetype="string", stylename=oddRowCellStyleName)
                tr2.addElement(tc)
            table.addElement(tr1)
            table.addElement(tr2)
            document.text.addElement(P(text=""))
            document.text.addElement(table)
            
         #TODO add a section to record the 1st through 4th place finishers
         
         #TODO add checkboxes for the "Entered on Scoreboard" and "Entered on spreadsheet."   
            
        document.save("./ScoreSheets/" + self.competition, True)
            
                       
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
            p = P(text="Mark the winner with a 'W' in the box next to the winners name. Best 2 out of 3.")
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
