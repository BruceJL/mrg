from odf.opendocument import OpenDocumentText
from odf.text import P
from odf.table import Table, TableColumn, TableRow, TableCell
from odf.style import Style, TextProperties, ParagraphProperties, ListLevelProperties, FontFace,\
    TableCellProperties, TableRowProperties, TableColumnProperties,\
    TableProperties
from odf.draw import Frame, Image


class RoundRobinMatch(object):

    def __init__(self, name):
        self.name = name
        self.entries = []
        
    def addEntry(self, entry):
        self.entries.append(entry)

    def makeOdfScoreSheet(self):
        #Create the document
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

        #Table Style
        scoreCardTableStyleName = "ScoreCardTableStyle"
        tableWidth = nameColumnWidth + (len(self.entries)-1) * normalColumnWidth
        s = Style(name=scoreCardTableStyleName, family="table", displayname="Score Card Table")
        t = TableProperties(align="center", width=str(tableWidth) + "in")
        s.addElement(t)
        styles.addElement(s)

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
        
             
        #Make the table
        #The table has room for n-1 robots on any row/column to minimize the size of the table.
        #The cells which are of no use are greyed out.       
        
        table = Table(name="Table 1", stylename=scoreCardTableStyleName)
        table.addElement(TableColumn(stylename=leftColumnStyleName))
        table.addElement(TableColumn(stylename=normalColumnStyleName, numbercolumnsrepeated=len(self.entries)-1))
        
        #Row 1
        tr = TableRow(stylename=topRowStyleName)
        table.addElement(tr)
        #Add a greyed out cell here
        tc = TableCell(valuetype="string", stylename=greyTableCellStyleName)
        tr.addElement(tc)
        
        #Populate the first row with  the rest of the robot names (1 per column).
        for i in range(1,len(self.entries),1):
            tc = TableCell(valuetype="string", stylename=topRowRobotNameCellStyleName)
            tc.addElement(P(text=self.entries[i].robotName, stylename=robotNameParagraphStyleName))
            tr.addElement(tc)
            
        #Populate the remaining cells
        for i in range(0,len(self.entries)-1,1):
            tr = TableRow(stylename=normalRowStyleName)
            table.addElement(tr)
            tc = TableCell(valuetype="string", stylename=textCellStyleName)
            tc.addElement(P(text=self.entries[i].robotName, stylename=robotNameParagraphStyleName))
            tr.addElement(tc)
            for j in range(0,len(self.entries),1):
                if(j<i):
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
        
        document.save("./ScoreSheets/" + self.name, True)
