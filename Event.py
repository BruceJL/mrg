"""The Event object used by a Schedule"""
import math
import random

from RoundRobin import RoundRobinTournament

from odf.opendocument import OpenDocumentText
from odf.table import Table, TableColumn, TableRow, TableCell
from odf.style import Style, TextProperties, ParagraphProperties, \
    TableCellProperties, TableRowProperties, TableColumnProperties, TableProperties, \
    SectionProperties, Columns, Column
from odf import style
from odf.text import P, H, Span
from datetime import date
from time import gmtime, strftime


class EventError(Exception):
    pass

class Event(object):

    def __init__(self, competition, min_entries_per_ring, max_entries_per_ring, max_rings):
        self.competition = competition
        self.entries = []
        self.round_robin_tournaments = {}
        self.min_entries_per_ring = min_entries_per_ring
        self.max_entries_per_ring = max_entries_per_ring
        self.max_rings = max_rings
        self.version = 0
        self.rings = 0
        self.checksString = ""

    def reset_round_robin_tournaments(self):
        self.round_robin_tournaments = {}

    def create_ring(self, ring_number):
        self.round_robin_tournaments[ring_number] = RoundRobinTournament(self.competition + " Ring " + str(ring_number),
                                                                         ring_number, self)

    def create_round_robin_tournaments(self, number_rings):
        best_remainder = len(self.entries)
        best_rings = 1
        self.version += 1
        num_entries = 0
        for entry in self.entries:
            if entry.signedIn:
                num_entries += 1

        max_entries =  self.max_entries_per_ring * self.max_rings
        if num_entries > max_entries:
            raise EventError("There are more entries than allowed! ({} > {})".format(str(num_entries), str(max_entries)))

        if num_entries == 0:
            raise EventError("There are no entries to slot!")

        if number_rings == 0:
            # Locate a solution that uses the maximum number of rings with a zero remainder
            for i in range(self.max_rings, 1, -1):
                if num_entries / i < self.min_entries_per_ring:
                    # print(str(i) + " rings has " + str(num_entries/i) + " robots per ring, which is too few.")
                    continue
                if num_entries / i > self.max_entries_per_ring:
                    # print(str(i) + " rings has " + str(num_entries/i) + " robots per ring, which is too many.")
                    continue
                elif num_entries % i == 0:
                    self.rings = i
                    # print(str(i) + " rings works perfectly.")
                    break
                elif num_entries % i < best_remainder:
                    # print(str(i) + " rings has a better remainder of " + str(num_entries % i))
                    best_remainder = len(self.entries) % i
                    best_rings = i

            if self.rings == 0:
                self.rings = best_rings
        else:
            self.rings = number_rings

        print(self.competition + " - using " + str(self.rings) + " rings with an average of " + str(
            float(num_entries) / float(self.rings)) + " robots per ring.")

        # Build the dict to hold the rings and their entries.
        for i in range(1, self.rings+1, 1):
            self.create_ring(i)

        # Make dict containing the entries from a given school
        school_entries = {}
        for entry in self.entries:
            if entry.signedIn:
                if entry.school not in school_entries.keys():
                    school_entries[entry.school] = []
                school_entries[entry.school].append(entry)

        # Slot the entries into the rings based upon school.
        # This will minimize the number of entries from the same school in a given ring.
        i = 0
        round_robin_keys = list(self.round_robin_tournaments.keys())
        length = len(round_robin_keys)
        for key, item in school_entries.items():
            entries = school_entries[key]
            while len(entries):
                index = math.floor(random.random() * len(entries))
                found = 0

                #TODO fix the following logic as it may paint itself into a corner. e.g. the only entry remaining
                #is a duplicate entry
                #for tournament in self.round_robin_tournaments:
                #    for event_entry in tournament.event_entries:
                #        if event_entry.entry.driver1 == entries[index].driver1:
                #            found = 1

                if not found:
                    self.round_robin_tournaments[round_robin_keys[i % length]].add_entry(entries[index])
                    entries.remove(entries[index])
                    i += 1

    def update_round_robin_assignments(self, number_rings):
        sql = []

        if len(list(self.round_robin_tournaments.keys())) == 0:
            print("Doing inital ring assignment for " + self.competition)
            # There not been any slotting done. Do initial assignments.
            self.create_round_robin_tournaments(number_rings)

            query = "INSERT into `ring-assignment` " \
                "(robot, competition, ring, letter) " \
                "VALUES " \

            for key, tournament in self.round_robin_tournaments.items():
                for event_entry in tournament.event_entries:
                    s = "({}, '{}', {}, '{}'),"
                    query += s.format(str(event_entry.entry.id),
                                      self.competition,
                                      str(tournament.ring),
                                      event_entry.letter)

            # get rid of that last comma.
            query = query[:-1]
            query += ";"
            sql.append(query)
            return sql

        # There are already existing assignments.
        else:
            print("Amending ring assignments for " + self.competition)
            # locate checked-in entries that were assigned a ring but have since been removed.
            for key, tournament in self.round_robin_tournaments.items():
                for event_entry in tournament.event_entries:
                    remove = 0
                    name = ""
                    for entry in self.entries:
                        if event_entry.entry.id == entry.id:
                            name = entry.robotName
                            if not entry.signedIn:
                                remove = 1
                            break

                    if remove:
                        # The competitor exists in the assignment data, but not in the checked-in entries;
                        # The assignment data needs to be removed.
                        print("\tRemoving " + name + " from ring " + str(tournament.ring))
                        tournament.remove_event_entry(event_entry)
                        s = "DELETE from `ring-assignment` where robot = {};"
                        s = s.format(str(event_entry.entry.id))
                        sql.append(s)

            # locate checked-in competitors that have not been assigned a ring.
            for entry in self.entries:
                if entry.signedIn:
                    add = 1
                    for key, tournament in self.round_robin_tournaments.items():
                        if 0 == add:
                            break
                        for event_entry in tournament.event_entries:
                            if event_entry.entry.id == entry.id:
                                #We found the competitor, we don't need to add them
                                add = 0
                                break
                else:
                    add = 0

                if add:
                    # The competitor is checked in, but no ring assignment exists. Find the ring with the fewest
                    # competitors and assign the competitor to the first free position.

                    smallest_tournament_size = 999
                    smallest_tournament = 0
                    for key, inner_tournament in self.round_robin_tournaments.items():
                        size = len(inner_tournament.event_entries)
                        if size < smallest_tournament_size:
                            smallest_tournament_size = size
                            smallest_tournament = inner_tournament

                    # Now that we know the ring to slot into, place the competitor in the ring
                    print("\tAdding " + entry.robotName + " to " + self.competition + " " + smallest_tournament.name)
                    event_entry = smallest_tournament.add_entry(entry)
                    s = "INSERT into `ring-assignment` " \
                        "(robot, competition, ring, letter) " \
                        "VALUES " \
                        "({}, '{}', {}, '{}')"

                    s = s.format(str(event_entry.entry.id),
                                 self.competition,
                                 str(smallest_tournament.ring),
                                 event_entry.letter)

                    sql.append(s)

            print("All done amending " + self.competition)
            return sql

    # Rebuild the round robin match list.
    def rebuild_matches(self):
        for key, tournament in self.round_robin_tournaments.items():
            tournament.create_round_robin_matches()

    def add_entry(self, entry):
        # add an Entry to this Event and recalculate the totalTime
        self.entries.append(entry)

    '''
    def add_event_entry(self, event_entry):
        for i in range(len(self.round_robin_tournaments), event_entry.ring, 1):
            self.round_robin_tournaments.append(RoundRobinTournament(self.competition + " Ring " + str(i + 1),
                                                                     i + 1, self))
        self.round_robin_tournaments[event_entry.ring-1].add_event_entry(event_entry)
    '''

    def make_odf5160_labels(self):
        # This will generate an ODF files for 5160 labels for a given event.
        # global table
        label_width = 2.625
        label_height = 1.0
        num_label_columns = 3
        label_sheet_width = 8.5
        label_sheet_height = 11

        competition_column_width = 0.35
        ring_column_width = 0.75
        info_column_width = label_width-competition_column_width - ring_column_width

        left_right_margin = 0.2
        top_margin = 7/16
        bottom_margin = 0.2
        label_spacing_width = 1/8

        table_width = num_label_columns * label_width + (num_label_columns-1) * label_spacing_width

        document = OpenDocumentText()

        # Font declarations in font-face-decls
        styles = document.fontfacedecls

        # arial font
        arial_font_style_name = "Arial"
        s = style.FontFace(name=arial_font_style_name, fontfamily=arial_font_style_name)
        styles.addElement(s)

        # wingdings font
        wingdings_font_style_name = "Wingdings"
        s = style.FontFace(name=wingdings_font_style_name, fontfamily=wingdings_font_style_name)
        styles.addElement(s)

        # Automatic styles from here on down.
        styles = document.automaticstyles

        # Setup the page layout.
        page_layout_style_name = "PageLayoutStyleName"
        s = style.PageLayout(name=page_layout_style_name)
        t = style.PageLayoutProperties(writingmode="lr-tb", margintop=str(top_margin) + "in",
                                       marginbottom=str(bottom_margin) + "in",
                                       marginleft=str(left_right_margin) + "in",
                                       marginright=str(left_right_margin) + "in",
                                       printorientation="portrait",
                                       pageheight=str(label_sheet_height) + "in",
                                       pagewidth=str(label_sheet_width) + "in")
        s.addElement(t)
        styles.addElement(s)

        masterpage = style.MasterPage(name="Standard", pagelayoutname=page_layout_style_name)
        document.masterstyles.addElement(masterpage)

        # Setup the table layout
        # Table Style
        label_table_style_name = "LabelTableStyle"
        s = Style(name=label_table_style_name, family="table", displayname="Label Table")
        t = TableProperties(align="center", width=str(table_width) + "in")
        s.addElement(t)
        styles.addElement(s)

        # label Row style
        label_row_style_name = "LabelRowStyleName"
        s = Style(name=label_row_style_name, family="table-row", displayname="Label Row")
        t = TableRowProperties(minrowheight=str(label_height) + "in")
        s.addElement(t)
        styles.addElement(s)

        # label Column Style
        label_column_style_name = "labelColumnStyle"
        s = Style(name=label_column_style_name, family="table-column", displayname="Label Table Column")
        t = TableColumnProperties(columnwidth=str(label_width) + "in")
        s.addElement(t)
        styles.addElement(s)

        # Spacer column Style
        spacer_column_style_name = "spacerColumnStyle"
        s = Style(name=spacer_column_style_name, family="table-column", displayname="Label Spacer Column")
        t = TableColumnProperties(columnwidth=str(label_spacing_width) + "in")
        s.addElement(t)
        styles.addElement(s)

        # cell style
        label_cell_style_name = "LabelCellStyleName"
        s = Style(name=label_cell_style_name, family="table-cell", displayname="Text Cell")
        t = TableCellProperties(verticalalign="middle", padding="0.00in")
        s.addElement(t)
        styles.addElement(s)

        # Ring cell Style
        ring_cell_style_name = "RingCellStyleName"
        s = Style(name=ring_cell_style_name, family="table-cell", displayname="Text Cell")
        t = TableCellProperties(verticalalign="top", padding="0.05in", borderleft="0.05pt solid",)
        s.addElement(t)
        styles.addElement(s)

        # Sub-table, which is be located in each label cell
        sub_table_style_name = "SubTableStyle"
        s = Style(name=sub_table_style_name, family="table", displayname="Sub Table")
        t = TableProperties(width=str(label_width) + "in")
        s.addElement(t)
        styles.addElement(s)

        # Sub-table competition column style
        sub_table_competition_column_style_name = "subTableCompetitionSytle"
        s = Style(name=sub_table_competition_column_style_name, family="table-column",
                  displayname="Sub-Table compeition Style")
        t = TableColumnProperties(columnwidth=str(competition_column_width) + "in")
        s.addElement(t)
        styles.addElement(s)

        # Sub-table info column style
        sub_table_info_column_style_name = "subTableInfoSytle"
        s = Style(name=sub_table_info_column_style_name, family="table-column",
                  displayname="Sub-Table compeition Style")
        t = TableColumnProperties(columnwidth=str(info_column_width) + "in")
        s.addElement(t)
        styles.addElement(s)

        # sub-table ring column style
        sub_table_ring_column_style_name = "subTableRingSytle"
        s = Style(name=sub_table_ring_column_style_name, family="table-column",
                  displayname="Sub-Table compeition Style")
        t = TableColumnProperties(columnwidth=str(ring_column_width) + "in")
        s.addElement(t)
        styles.addElement(s)

        # Sub-table competition cell style
        sub_table_competition_cell_style_name = "SubTableCompetitionSytleName"
        s = Style(name=sub_table_competition_cell_style_name, family="table-cell", displayname="Competition Cell")
        t = TableCellProperties(verticalalign="middle", backgroundcolor="#000000", padding="0.00in",
                                writingmode="tb-lr")
        s.addElement(t)
        styles.addElement(s)

        # Competition Paragraph Style
        competition_paragraph_style_name = "competitionParagraphStyle"
        s = Style(name=competition_paragraph_style_name, family="paragraph", displayname="Competition Paragraph Style")
        t = ParagraphProperties(textalign="center")
        s.addElement(t)
        t = TextProperties(fontname=arial_font_style_name, fontsize="14pt", fontsizecomplex="14pt",
                           fontsizeasian="14pt", color="#FFFFFF", fontweightcomplex="Bold", fontweightasian="bold",
                           fontweight="bold")
        s.addElement(t)
        styles.addElement(s)

        # year Paragraph Style
        year_paragraph_style_name = "yearParagraphStyle"
        s = Style(name=year_paragraph_style_name, family="paragraph", displayname="Year Paragraph Style")
        t = ParagraphProperties(textalign="center")
        s.addElement(t)
        t = TextProperties(fontname=arial_font_style_name, fontsize="10pt", fontsizecomplex="10pt",
                           fontsizeasian="10pt", color="#FFFFFF", fontweightcomplex="Bold", fontweightasian="bold",
                           fontweight="bold")
        s.addElement(t)
        styles.addElement(s)

        # Robot Name Style Name
        robot_name_style_name = "robotNameStyleName"
        s = Style(name=robot_name_style_name, family="paragraph", displayname="Robot Name Paragraph Style")
        t = ParagraphProperties(textalign="center")
        s.addElement(t)
        t = TextProperties(fontname=arial_font_style_name, fontsize="10pt", fontsizecomplex="10pt",
                           fontsizeasian="10pt", fontweightcomplex="Bold", fontweightasian="bold",
                           fontweight="bold")
        s.addElement(t)
        styles.addElement(s)

        # Driver Name Style Name
        driver_style_name = "driverNameStyleName"
        s = Style(name=driver_style_name, family="paragraph", displayname="Driver Name Paragraph Style")
        t = ParagraphProperties(textalign="center")
        s.addElement(t)
        t = TextProperties(fontname=arial_font_style_name, fontsize="10pt", fontsizecomplex="10pt",
                           fontsizeasian="10pt")
        s.addElement(t)
        styles.addElement(s)

        school_style_name = "schoolNameStyleName"
        s = Style(name=school_style_name, family="paragraph", displayname="Driver Name Paragraph Style")
        t = ParagraphProperties(textalign="center")
        s.addElement(t)
        t = TextProperties(fontname=arial_font_style_name, fontsize="8pt", fontsizecomplex="8pt",
                           fontsizeasian="8pt")
        s.addElement(t)
        styles.addElement(s)

        measurement_style_name = "measurementStyleName"
        s = Style(name=measurement_style_name, family="paragraph", displayname="Driver Name Paragraph Style")
        t = ParagraphProperties(textalign="center")
        s.addElement(t)
        t = TextProperties(fontname=arial_font_style_name, fontsize="8pt", fontsizecomplex="8pt",
                           fontsizeasian="7pt")
        s.addElement(t)
        styles.addElement(s)

        # Info Paragraph Style
        label_paragraph_style_name = "LabelParagraphStyle"
        s = Style(name=label_paragraph_style_name, family="paragraph", displayname="Label Paragraph Style")
        t = ParagraphProperties(textalign="center")
        s.addElement(t)
        t = TextProperties(fontsize="10pt", fontsizecomplex="10pt", fontsizeasian="10pt")
        s.addElement(t)
        styles.addElement(s)

        wingdings_text_style = "WingdingsTextStyle"
        s = Style(name=wingdings_text_style, family="text", displayname="wingdingsStyle")
        t = TextProperties(fontsize="12pt", fontsizecomplex="12pt", fontsizeasian="12pt", fontname="Wingdings")
        s.addElement(t)
        styles.addElement(s)

        def make_label(robot_name, driver_name, school_name):

            # Create the sub-table in the cell.
            sub_table = Table(name="Table", stylename=sub_table_style_name)
            sub_table.addElement(TableColumn(stylename=sub_table_competition_column_style_name))
            sub_table.addElement(TableColumn(stylename=sub_table_info_column_style_name))
            sub_table.addElement(TableColumn(stylename=sub_table_ring_column_style_name))

            # Add the row to the sub-table
            sub_table_tr = TableRow(stylename=label_row_style_name)
            sub_table.addElement(sub_table_tr)

            # Create the competition cell
            table_cell = TableCell(valuetype="string", stylename=sub_table_competition_cell_style_name)
            table_cell.addElement(P(text=str(date.today().year), stylename=year_paragraph_style_name))
            table_cell.addElement(P(text=self.competition, stylename=competition_paragraph_style_name))
            sub_table_tr.addElement(table_cell)

            # Create the info cell
            table_cell = TableCell(valuetype="string", stylename=label_cell_style_name)
            table_cell.addElement(P(text=robot_name, stylename=robot_name_style_name))
            table_cell.addElement(P(text=driver_name, stylename=driver_style_name))
            table_cell.addElement(P(text=school_name, stylename=school_style_name))
            p = P(text="Mass", stylename=measurement_style_name)
            p.addElement(Span(text="r", stylename=wingdings_text_style))
            p.addText(" Size")
            p.addElement(Span(text="r", stylename=wingdings_text_style))
            if self.competition == "MSA" or self.competition == "PSA":
                p.addText(" Delay")
                p.addElement(Span(text="r", stylename=wingdings_text_style))
            p.addText(" Li")
            p.addElement(Span(text="r", stylename=wingdings_text_style))

            table_cell.addElement(p)
            sub_table_tr.addElement(table_cell)

            # Create the ring cell
            table_cell = TableCell(valuetype="string", stylename=ring_cell_style_name)
            table_cell.addElement(P(text="Ring", stylename=robot_name_style_name))
            sub_table_tr.addElement(table_cell)

            return sub_table

        table = 0
        tr = 0

        self.entries = sorted(self.entries, key=lambda x: x.robotName)
        for j in range(0, len(self.entries), 1):

            # Start a new page of labels
            if j % 30 == 0:
                table = Table(name="Table", stylename=label_table_style_name)

                table.addElement(TableColumn(stylename=label_column_style_name))
                table.addElement(TableColumn(stylename=spacer_column_style_name))
                table.addElement(TableColumn(stylename=label_column_style_name))
                table.addElement(TableColumn(stylename=spacer_column_style_name))
                table.addElement(TableColumn(stylename=label_column_style_name))

                document.text.addElement(table)

            # Start a new row of labels
            if j % 3 == 0:
                tr = TableRow(stylename=label_row_style_name)
                table.addElement(tr)

            # insert a spacer column
            else:
                tc = TableCell(valuetype="string", stylename=label_cell_style_name)
                tr.addElement(tc)

            # Add another cell to the table.
            tc = TableCell(valuetype="string", stylename=label_cell_style_name)
            tr.addElement(tc)

            tc.addElement(make_label(self.entries[j].robotName, self.entries[j].driver1, self.entries[j].school))

        for j in range(len(self.entries), math.ceil(float(len(self.entries))/30.0)*30, 1):
            # Start a new row of labels
            if j % 3 == 0:
                tr = TableRow(stylename=label_row_style_name)
                table.addElement(tr)

            # insert a spacer column
            else:
                tc = TableCell(valuetype="string", stylename=label_cell_style_name)
                tr.addElement(tc)

            # Add another cell to the table.
            tc = TableCell(valuetype="string", stylename=label_cell_style_name)
            tc.addElement(make_label("_______________", "__________________", "___________________"))
            tr.addElement(tc)

        file_name = "./ScoreSheets/" + self.competition + "-labels"
        document.save(file_name, True)
        return file_name

    def make_odf_schedules(self):
        document = OpenDocumentText()

        name_column_width = 1.25
        row_height = 0.25
        letter_column_width = 0.25
        wl_column_width = 0.25

        styles = document.automaticstyles
        # Page layout style
        page_layout_style_name = "PageLayoutStyleName"
        s = style.PageLayout(name=page_layout_style_name)
        t = style.PageLayoutProperties(writingmode="lr-tb", margintop="0.5in", marginbottom="0.5in", marginleft="0.5in",
                                       marginright="0.5in", printorientation="portrait", pageheight="11in",
                                       pagewidth="8.5in")
        s.addElement(t)
        styles.addElement(s)

        masterpage = style.MasterPage(name="Standard", pagelayoutname=page_layout_style_name)
        document.masterstyles.addElement(masterpage)

        # Section Style
        section_style_name = "SectionStyleName"
        s = Style(name=section_style_name, family="section", displayname="Section Style")
        t = SectionProperties(editable="false", dontbalancetextcolumns="false")
        c = Columns(columngap="0in", columncount="2")
        c1 = Column(endindent="0in", startindent="0in", relwidth="5400*")
        c2 = Column(endindent="0in", startindent="0in", relwidth="5400*")
        c.addElement(c1)
        c.addElement(c2)
        t.addElement(c)
        s.addElement(t)
        styles.addElement(s)

        # Table Style
        score_card_table_style_name = "ScoreCardTableStyle"
        table_width = 2 * (2 * name_column_width + 2 * letter_column_width + 2 * wl_column_width)
        s = Style(name=score_card_table_style_name, family="table", displayname="Score Card Table ")
        t = TableProperties(align="center", width=str(table_width) + "in", maybreakbetweenrows="false")
        s.addElement(t)
        s.addElement(t)
        styles.addElement(s)

        # Row style
        row_style_name = "RowStyleName"
        s = Style(name=row_style_name, family="table-row", displayname="Normal Table Row")
        t = TableRowProperties(minrowheight=str(row_height) + "in")
        s.addElement(t)
        styles.addElement(s)

        # Even Row cell style
        even_row_cell_style_name = "EvenRowCellStyleName"
        s = Style(name=even_row_cell_style_name, family="table-cell", displayname="Text Cell")
        t = TableCellProperties(backgroundcolor='#C0C0C0', verticalalign="middle", padding="0.05in",
                                borderright="0.05pt solid #000000", bordertop="0.05pt solid #000000",
                                borderleft='0.05pt solid #000000', borderbottom='0.05pt solid #000000')
        s.addElement(t)
        styles.addElement(s)

        # Odd row cell style
        odd_row_cell_style_name = "OddRowCellStyleName"
        s = Style(name=odd_row_cell_style_name, family="table-cell", displayname="Text Cell")
        t = TableCellProperties(verticalalign="middle", padding="0.05in", borderright="0.05pt solid #000000",
                                bordertop="0.05pt solid #000000", borderleft='0.05pt solid #000000',
                                borderbottom='0.05pt solid #000000')
        s.addElement(t)
        styles.addElement(s)

        # Spacer cell style
        spacer_cell_style_name = "SpacerCellStyleName"
        s = Style(name=spacer_cell_style_name, family="table-cell", displayname="Text Cell")
        t = TableCellProperties(verticalalign="middle")
        s.addElement(t)
        styles.addElement(s)

        # letter Column Style
        letter_column_style_name = "LetterColumnStyle"
        s = Style(name=letter_column_style_name, family="table-column", displayname="Left Table Column")
        t = TableColumnProperties(columnwidth=str(letter_column_width) + "in")
        s.addElement(t)
        styles.addElement(s)

        # letter Column Style
        wl_column_style_name = "WLColumnStyle"
        s = Style(name=wl_column_style_name, family="table-column", displayname="Left Table Column")
        t = TableColumnProperties(columnwidth=str(wl_column_width) + "in")
        s.addElement(t)
        styles.addElement(s)

        # Name Column Style
        name_column_style_name = "NameColumnStyle"
        s = Style(name=name_column_style_name, family="table-column", displayname="Left Table Column")
        t = TableColumnProperties(columnwidth=str(name_column_width) + "in")
        s.addElement(t)
        styles.addElement(s)

        # Spacer column style
        spacer_column_style_name = "SpacerColumnStyle"
        s = Style(name=spacer_column_style_name, family="table-column", displayname="Left Table Column")
        t = TableColumnProperties(columnwidth=str(0.1) + "in")
        s.addElement(t)
        styles.addElement(s)

        # Robot Name Paragraph Style
        robot_name_paragraph_style_name = "RobotNameParagraphStyle"
        s = Style(name=robot_name_paragraph_style_name, family="paragraph", displayname="Robot Name Paragraph Style")
        t = ParagraphProperties(textalign="center")
        s.addElement(t)
        t = TextProperties(fontsize="12pt",  fontsizecomplex="12pt",  fontsizeasian="12pt")
        s.addElement(t)
        styles.addElement(s)

        # Summary Robot Name paragraph style
        robot_summary_name_paragraph_style_name = "RobotSummaryNameParagraphStyle"
        s = Style(name=robot_summary_name_paragraph_style_name, family="paragraph",
                  displayname="Robot detail Paragraph Style")
        t = ParagraphProperties(textalign="left")
        s.addElement(t)
        t = TextProperties(fontsize="10pt", fontsizecomplex="10pt", fontsizeasian="10pt",
                           fontweightcomplex="Bold", fontweightasian="bold", fontweight="bold")
        s.addElement(t)
        styles.addElement(s)

        # Summary Robot Detail paragraph style
        robot_summary_detail_paragraph_style_name = "RobotSummaryDetailParagraphStyle"
        s = Style(name=robot_summary_detail_paragraph_style_name, family="paragraph", displayname="Robot detail Paragraph Style")
        t = ParagraphProperties(textalign="left")
        s.addElement(t)
        t = TextProperties(fontsize="8pt", fontsizecomplex="8pt", fontsizeasian="8pt")
        s.addElement(t)
        styles.addElement(s)

        # Judge/Timer paragraph style
        judge_timer_style_name = "JudgeTimerStyleName"
        s = Style(name=judge_timer_style_name, family="paragraph", displayname="Judge Timer Paragraph Style")
        t = ParagraphProperties(textalign="right")
        s.addElement(t)
        t = TextProperties(fontsize="12pt")
        s.addElement(t)
        styles.addElement(s)

        # Heading Text
        heading_paragraph_style_name = "HeadingParagraphStyle"
        s = Style(name=heading_paragraph_style_name, family="paragraph", displayname="Robot Name Paragraph Style")
        t = ParagraphProperties(breakbefore="page", textalign="center")
        s.addElement(t)
        t = TextProperties(fontsize="20pt", fontsizecomplex="20pt", fontsizeasian="20pt")
        s.addElement(t)
        styles.addElement(s)

        wl_paragraph_style_name = "WLParagraphStyle"
        s = Style(name=wl_paragraph_style_name, family="paragraph", displayname="WL Paragraph Style")
        t = ParagraphProperties(breakbefore="page", textalign="center")
        s.addElement(t)
        t = TextProperties(fontsize="6pt", )
        s.addElement(t)
        styles.addElement(s)

        # for i in range(0, len(self.round_robin_tournaments), 1):
        for key, tournament in self.round_robin_tournaments.items():
            # tournament = self.round_robin_tournaments[i]

            h = H(outlinelevel=1, text=tournament.name + " Score Sheet -  " + strftime("%H:%M", gmtime()),
                  stylename=heading_paragraph_style_name)
            document.text.addElement(h)
            document.text.addElement(P(text=""))
            p = P(text="Judge:_____________________________________   Timer:_____________________________________",
                  stylename=judge_timer_style_name)
            document.text.addElement(p)
            document.text.addElement(P(text=""))

            score_table = Table(name="Table" + str(tournament.ring), stylename=score_card_table_style_name)
            score_table.addElement(TableColumn(stylename=letter_column_style_name))
            score_table.addElement(TableColumn(stylename=name_column_style_name))
            score_table.addElement(TableColumn(stylename=wl_column_style_name))
            score_table.addElement(TableColumn(stylename=wl_column_style_name))
            score_table.addElement(TableColumn(stylename=name_column_style_name))
            score_table.addElement(TableColumn(stylename=letter_column_style_name))

            score_table.addElement(TableColumn(stylename=spacer_column_style_name))

            score_table.addElement(TableColumn(stylename=letter_column_style_name))
            score_table.addElement(TableColumn(stylename=name_column_style_name))
            score_table.addElement(TableColumn(stylename=wl_column_style_name))
            score_table.addElement(TableColumn(stylename=wl_column_style_name))
            score_table.addElement(TableColumn(stylename=name_column_style_name))
            score_table.addElement(TableColumn(stylename=letter_column_style_name))

            # Populate the first row with  the rest of the robot names (1 per column).
            for j in range(0, len(tournament.matches)):
                if j % 2 == 0:
                    # Only add a new row for every 2nd competition
                    tr1 = TableRow(stylename=row_style_name)
                    tr2 = TableRow(stylename=row_style_name)

                    score_table.addElement(tr1)
                    score_table.addElement(tr2)
                else:
                    # Add in the blank spacer columns
                    tc = TableCell(valuetype="string", stylename=spacer_column_style_name, numberrowsspanned="2")
                    tc.addElement(P(text="", stylename=spacer_cell_style_name))
                    tr1.addElement(tc)

                    tc = TableCell(valuetype="string", stylename=spacer_column_style_name)
                    tc.addElement(P(text="", stylename=spacer_cell_style_name))
                    tr2.addElement(tc)

                if j % 4 == 0 or j % 4 == 1:
                    column_style = even_row_cell_style_name
                else:
                    column_style = odd_row_cell_style_name

                # Letter Column
                tc = TableCell(valuetype="string", stylename=column_style, numberrowsspanned="2")
                tc.addElement(P(text=tournament.matches[j].contestant1.letter,
                                stylename=robot_name_paragraph_style_name))
                tr1.addElement(tc)

                tc = TableCell(valuetype="string", stylename=column_style)
                tc.addElement(P(text="", stylename=wl_paragraph_style_name))
                tr2.addElement(tc)

                # Name Column
                tc = TableCell(valuetype="string", stylename=column_style, numberrowsspanned="2")
                tc.addElement(P(text=tournament.matches[j].contestant1.entry.robotName,
                                stylename=robot_name_paragraph_style_name))
                tr1.addElement(tc)

                tc = TableCell(valuetype="string", stylename=column_style)
                tc.addElement(P(text="", stylename=wl_paragraph_style_name))
                tr2.addElement(tc)

                # W/L column
                tc = TableCell(valuetype="string", stylename=column_style)
                tc.addElement(P(text="", stylename=wl_paragraph_style_name))
                tr1.addElement(tc)

                tc = TableCell(valuetype="string", stylename=column_style)
                tc.addElement(P(text="", stylename=wl_paragraph_style_name))
                tr2.addElement(tc)

                # W/L column
                tc = TableCell(valuetype="string", stylename=column_style)
                tc.addElement(P(text="", stylename=wl_paragraph_style_name))
                tr1.addElement(tc)

                tc = TableCell(valuetype="string", stylename=column_style)
                tc.addElement(P(text="", stylename=wl_paragraph_style_name))
                tr2.addElement(tc)

                # Name column
                tc = TableCell(valuetype="string", stylename=column_style, numberrowsspanned="2")
                tc.addElement(P(text=tournament.matches[j].contestant2.entry.robotName,
                                stylename=robot_name_paragraph_style_name))
                tr1.addElement(tc)

                tc = TableCell(valuetype="string", stylename=column_style)
                tc.addElement(P(text="", stylename=wl_paragraph_style_name))
                tr2.addElement(tc)

                # Letter column
                tc = TableCell(valuetype="string", stylename=column_style, numberrowsspanned="2")
                tc.addElement(P(text=tournament.matches[j].contestant2.letter,
                                stylename=robot_name_paragraph_style_name))
                tr1.addElement(tc)

                tc = TableCell(valuetype="string", stylename=column_style)
                tc.addElement(P(text="", stylename=wl_paragraph_style_name))
                tr2.addElement(tc)

                # put in a blank entry if the last line only has one entry.
                if j % 2 == 0 and j == len(tournament.matches) - 1:
                    tc = TableCell(valuetype="string", stylename=spacer_column_style_name, numberrowsspanned="2",
                                   numbercolumnsspanned="7")
                    tc.addElement(P(text="", stylename=spacer_cell_style_name))
                    tr1.addElement(tc)

                    # If the score_table is two long break it into two columns.
                    # if (2 * len(tournament.matches) * row_height > 5.0):
                    #    section = text.Section(name="Section" + str(i), stylename=section_style_name)
                    #    section.addElement(score_table)
                    #    document.text.addElement(section)
                    # else:
                document.text.addElement(score_table)

            # Add a score summary table on the bottom of the page.
            if len(tournament.event_entries) < 4:
                summary_column_width = 7.5 / len(tournament.event_entries)
            else:
                summary_column_width = 7.5 / 4.0

            summary_table_width = summary_column_width * 4

            summary_table_style_name = "SummaryTableStyleName" + str(tournament.ring)
            s = Style(name=summary_table_style_name, family="table", displayname="Summary Table" + str(tournament.ring))
            t = TableProperties(align="center", width=str(summary_table_width) + "in")
            s.addElement(t)
            s.addElement(t)
            styles.addElement(s)

            summary_info_column_style_name = "SummaryInfoColumnStyle" + str(tournament.ring)
            s = Style(name=summary_info_column_style_name, family="table-column",
                      displayname="Summary Info Table Column " + str(tournament.ring))
            t = TableColumnProperties(columnwidth=str(summary_column_width-0.375) + "in")
            s.addElement(t)
            styles.addElement(s)

            summary_spacer_column_style_name = "SummarySpacerColumnStyle" + str(tournament.ring)
            s = Style(name=summary_spacer_column_style_name, family="table-column",
                      displayname="Summary Spacer Table Column " + str(tournament.ring))
            t = TableColumnProperties(columnwidth="0.375in")
            s.addElement(t)
            styles.addElement(s)

            summary_cell_style_name = "SummaryCellStyleName"
            s = Style(name=summary_cell_style_name, family="table-cell", displayname="Text Cell")
            t = TableCellProperties(verticalalign="", padding="0.01in", borderright="0.05pt solid #000000",
                                    bordertop="0.05pt solid #000000", borderleft='0.05pt solid #000000',
                                    borderbottom='0.05pt solid #000000')
            s.addElement(t)
            styles.addElement(s)

            summary_table = Table(name="SummaryTable" + str(tournament.ring), stylename=summary_table_style_name)
            for i in range(0, 4):
                summary_table.addElement(TableColumn(stylename=summary_info_column_style_name))
                summary_table.addElement(TableColumn(stylename=summary_spacer_column_style_name))


            for j in range(0, len(tournament.event_entries), 1):
                if j % 4 == 0:
                    tr1 = TableRow(stylename=row_style_name)
                    summary_table.addElement(tr1)

                tc = TableCell(valuetype="string", stylename=summary_cell_style_name)
                tc.addElement(
                    P(text=tournament.event_entries[j].letter + " -  " + tournament.event_entries[j].entry.robotName,
                      stylename=robot_summary_name_paragraph_style_name))
                tc.addElement(
                    P(text=tournament.event_entries[j].entry.driver1,
                      stylename=robot_summary_detail_paragraph_style_name))
                tc.addElement(
                    P(text=tournament.event_entries[j].entry.school,
                      stylename=robot_summary_detail_paragraph_style_name))
                tr1.addElement(tc)
                tc = TableCell(valuetype="string", stylename=summary_cell_style_name)
                tr1.addElement(tc)

            document.text.addElement(P(text=""))
            document.text.addElement(summary_table)
            document.text.addElement(P(text=""))
            document.text.addElement(P(
                text="1st:________________     2nd:________________     3rd:________________     4th:________________"))
            document.text.addElement(P(text=""))
            document.text.addElement(P(
                text="5th:________________     6th:________________     7th:________________     8th:________________"))

            # TODO add checkboxes for the "Entered on Scoreboard" and "Entered on spreadsheet."

        filename = "./ScoreSheets/" + self.competition
        document.save(filename, True)

        return filename

    def make_participation_csv(self):
        fout = open('./ScoreSheets/' + self.competition + '-participation.csv', 'w')
        # for entry in copy of self.entries sorted by school
        for entry in sorted(self.entries, key=lambda x: x.school):
            s = ""
            if entry.driver1:
                s += "{driver},{robot},{school},{competition}\n".format(driver=entry.driver1, robot=entry.robotName,
                                                                        school=entry.school,
                                                                        competition=self.competition)
            if entry.driver2:
                s += "{driver},{robot},{school},{competition}\n".format(driver=entry.driver2, robot=entry.robotName,
                                                                        school=entry.school,
                                                                        competition=self.competition)
            if entry.driver3:
                s += "{driver},{robot},{school},{competition}\n".format(driver=entry.driver3, robot=entry.robotName,
                                                                        school=entry.school,
                                                                        competition=self.competition)
            fout.write(s)
        fout.close()
