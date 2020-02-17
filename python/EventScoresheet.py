from typing import TYPE_CHECKING
from odf.opendocument import OpenDocumentText
from odf.table import Table, TableColumn, TableRow, TableCell
from odf.style import Style, TextProperties, ParagraphProperties, \
  TableCellProperties, TableRowProperties, TableColumnProperties, \
  TableProperties, SectionProperties, Columns, Column
from odf import style
from odf.text import P, H
from time import strftime, gmtime

if TYPE_CHECKING:
    # from typing import List, Dict
    from Event import Event


def make_odf_score_sheets(
  event: 'Event',
) -> 'str':
    document = OpenDocumentText()

    name_column_width = 1.25
    row_height = 0.25
    letter_column_width = 0.25
    wl_column_width = 0.25

    styles = document.automaticstyles
    # Page layout style
    page_layout_style_name = "PageLayoutStyleName"
    s = style.PageLayout(name=page_layout_style_name)
    t = style.PageLayoutProperties(
      writingmode="lr-tb",
      margintop="0.5in",
      marginbottom="0.5in",
      marginleft="0.5in",
      marginright="0.5in",
      printorientation="portrait",
      pageheight="11in",
      pagewidth="8.5in")
    s.addElement(t)
    styles.addElement(s)

    masterpage = style.MasterPage(
      name="Standard",
      pagelayoutname=page_layout_style_name,
    )
    document.masterstyles.addElement(masterpage)

    # Section Style
    section_style_name = "SectionStyleName"
    s = Style(
      name=section_style_name,
      family="section",
      displayname="Section Style",
    )
    t = SectionProperties(
      editable="false",
      dontbalancetextcolumns="false",
    )
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
    table_width = 2 * \
        (2 * name_column_width + 2 * letter_column_width + 2 * wl_column_width)

    s = Style(
      name=score_card_table_style_name,
      family="table",
      displayname="Score Card Table ",
    )
    t = TableProperties(
      align="center",
      width=str(table_width) + "in",
      maybreakbetweenrows="true",
    )
    s.addElement(t)
    s.addElement(t)
    styles.addElement(s)

    # Row style
    row_style_name = "RowStyleName"
    s = Style(
      name=row_style_name,
      family="table-row",
      displayname="Normal Table Row",
    )
    t = TableRowProperties(minrowheight=str(row_height) + "in")
    s.addElement(t)
    styles.addElement(s)

    # Even Row cell style
    even_row_cell_style_name = "EvenRowCellStyleName"
    s = Style(
      name=even_row_cell_style_name,
      family="table-cell",
      displayname="Text Cell",
    )
    t = TableCellProperties(
      backgroundcolor='#C0C0C0',
      verticalalign="middle",
      padding="0.05in",
      borderright="0.05pt solid #000000",
      bordertop="0.05pt solid #000000",
      borderleft='0.05pt solid #000000',
      borderbottom='0.05pt solid #000000',
    )
    s.addElement(t)
    styles.addElement(s)

    # Odd row cell style
    odd_row_cell_style_name = "OddRowCellStyleName"
    s = Style(
      name=odd_row_cell_style_name,
      family="table-cell",
      displayname="Text Cell",
    )
    t = TableCellProperties(
      verticalalign="middle",
      padding="0.05in",
      borderright="0.05pt solid #000000",
      bordertop="0.05pt solid #000000",
      borderleft='0.05pt solid #000000',
      borderbottom='0.05pt solid #000000',
    )
    s.addElement(t)
    styles.addElement(s)

    # Spacer cell style
    spacer_cell_style_name = "SpacerCellStyleName"
    s = Style(
      name=spacer_cell_style_name,
      family="table-cell",
      displayname="Text Cell")
    t = TableCellProperties(verticalalign="middle")
    s.addElement(t)
    styles.addElement(s)

    # letter Column Style
    letter_column_style_name = "LetterColumnStyle"
    s = Style(
      name=letter_column_style_name,
      family="table-column",
      displayname="Left Table Column",
    )
    t = TableColumnProperties(columnwidth=str(letter_column_width) + "in")
    s.addElement(t)
    styles.addElement(s)

    # letter Column Style
    wl_column_style_name = "WLColumnStyle"
    s = Style(
      name=wl_column_style_name,
      family="table-column",
      displayname="Left Table Column",
    )

    t = TableColumnProperties(columnwidth=str(wl_column_width) + "in")
    s.addElement(t)
    styles.addElement(s)

    # Name Column Style
    name_column_style_name = "NameColumnStyle"
    s = Style(
      name=name_column_style_name,
      family="table-column",
      displayname="Left Table Column",
    )

    t = TableColumnProperties(columnwidth=str(name_column_width) + "in")
    s.addElement(t)
    styles.addElement(s)

    # Spacer column style
    spacer_column_style_name = "SpacerColumnStyle"
    s = Style(
      name=spacer_column_style_name,
      family="table-column",
      displayname="Left Table Column",
    )
    t = TableColumnProperties(columnwidth=str(0.1) + "in")
    s.addElement(t)
    styles.addElement(s)

    # Robot Name Paragraph Style
    robot_name_paragraph_style_name = "RobotNameParagraphStyle"
    s = Style(
      name=robot_name_paragraph_style_name,
      family="paragraph",
      displayname="Robot Name Paragraph Style",
    )
    t = ParagraphProperties(textalign="center")
    s.addElement(t)

    t = TextProperties(
      fontsize="12pt",
      fontsizecomplex="12pt",
      fontsizeasian="12pt",
    )
    s.addElement(t)
    styles.addElement(s)

    # Summary Robot Name paragraph style
    robot_summary_name_paragraph_style_name = "RobotSummaryNameParagraphStyle"
    s = Style(
      name=robot_summary_name_paragraph_style_name,
      family="paragraph",
      displayname="Robot detail Paragraph Style",
    )
    t = ParagraphProperties(textalign="left")
    s.addElement(t)
    t = TextProperties(
      fontsize="10pt",
      fontsizecomplex="10pt",
      fontsizeasian="10pt",
      fontweightcomplex="Bold",
      fontweightasian="bold",
      fontweight="bold",
    )
    s.addElement(t)
    styles.addElement(s)

    # Summary Robot Detail paragraph style
    robot_summary_detail_paragraph_style_name = \
        "RobotSummaryDetailParagraphStyle"
    s = Style(
      name=robot_summary_detail_paragraph_style_name,
      family="paragraph",
      displayname="Robot detail Paragraph Style",
    )
    t = ParagraphProperties(textalign="left")
    s.addElement(t)
    t = TextProperties(
      fontsize="8pt",
      fontsizecomplex="8pt",
      fontsizeasian="8pt",
    )
    s.addElement(t)
    styles.addElement(s)

    # Judge/Timer paragraph style
    judge_timer_style_name = "JudgeTimerStyleName"
    s = Style(
      name=judge_timer_style_name,
      family="paragraph",
      displayname="Judge Timer Paragraph Style",
    )
    t = ParagraphProperties(textalign="right")
    s.addElement(t)
    t = TextProperties(fontsize="12pt")
    s.addElement(t)
    styles.addElement(s)

    # Heading Text
    heading_paragraph_style_name = "HeadingParagraphStyle"
    s = Style(
      name=heading_paragraph_style_name,
      family="paragraph",
      displayname="Robot Name Paragraph Style",
    )
    t = ParagraphProperties(
      breakbefore="page",
      textalign="center",
    )
    s.addElement(t)
    t = TextProperties(
      fontsize="20pt",
      fontsizecomplex="20pt",
      fontsizeasian="20pt",
    )
    s.addElement(t)
    styles.addElement(s)

    wl_paragraph_style_name = "WLParagraphStyle"
    s = Style(
      name=wl_paragraph_style_name,
      family="paragraph",
      displayname="WL Paragraph Style",
    )
    t = ParagraphProperties(
      breakbefore="page",
      textalign="center",
    )
    s.addElement(t)
    t = TextProperties(fontsize="6pt", )
    s.addElement(t)
    styles.addElement(s)

    for tournament in event.round_robin_tournaments.values():

        print("building sheet for tournament: " + str(tournament.ring))
        h = H(
          outlinelevel=1,
          text=event.competition + " - Ring " + str(tournament.ring)
          + " - Score Sheet -  " + strftime("%H:%M", gmtime()),
          stylename=heading_paragraph_style_name,
        )
        document.text.addElement(h)
        document.text.addElement(P(text=""))
        p=P(
          text =
          "Judge:_____________________________________   "
          + "Timer:_____________________________________",
          stylename = judge_timer_style_name,
        )
        document.text.addElement(p)
        document.text.addElement(P(text=""))

        score_table=Table(
          name = "Table" + str(tournament.ring),
          stylename = score_card_table_style_name,
        )
        score_table.addElement(
          TableColumn(stylename=letter_column_style_name))
        score_table.addElement(
          TableColumn(stylename=name_column_style_name))
        score_table.addElement(
          TableColumn(stylename=wl_column_style_name))
        score_table.addElement(
          TableColumn(stylename=wl_column_style_name))
        score_table.addElement(
          TableColumn(stylename=name_column_style_name))
        score_table.addElement(
          TableColumn(stylename=letter_column_style_name))

        score_table.addElement(
          TableColumn(stylename=spacer_column_style_name))

        score_table.addElement(
          TableColumn(stylename=letter_column_style_name))
        score_table.addElement(
          TableColumn(stylename=name_column_style_name))
        score_table.addElement(
          TableColumn(stylename=wl_column_style_name))
        score_table.addElement(
          TableColumn(stylename=wl_column_style_name))
        score_table.addElement(
          TableColumn(stylename=name_column_style_name))
        score_table.addElement(
          TableColumn(stylename=letter_column_style_name))

        # Populate the first row with  the rest of the robot names
        # (1 per column).
        for j in range(0, len(tournament.matches)):
            print(
              "building entry for match: "
              + tournament.matches[j].contestant1.entry.robotName + " vs "
              + tournament.matches[j].contestant2.entry.robotName
            )
            if j % 2 == 0:
                # Only add a new row for every 2nd competition
                tr1 = TableRow(stylename=row_style_name)
                tr2 = TableRow(stylename=row_style_name)

                score_table.addElement(tr1)
                score_table.addElement(tr2)
            else:
                # Add in the blank spacer columns
                tc = TableCell(
                  valuetype="string",
                  stylename=spacer_column_style_name,
                  numberrowsspanned="2",
                )
                tc.addElement(P(
                  text="",
                  stylename=spacer_cell_style_name,
                ))
                tr1.addElement(tc)

                tc = TableCell(
                  valuetype="string",
                  stylename=spacer_column_style_name,
                )
                tc.addElement(P(text="", stylename=spacer_cell_style_name))
                tr2.addElement(tc)

            if j % 4 == 0 or j % 4 == 1:
                column_style = even_row_cell_style_name
            else:
                column_style = odd_row_cell_style_name

            # Letter Column
            tc = TableCell(
              valuetype="string",
              stylename=column_style,
              numberrowsspanned="2",
            )
            tc.addElement(P(
              text=tournament.matches[j].contestant1.letter,
              stylename=robot_name_paragraph_style_name,
            ))
            tr1.addElement(tc)

            tc = TableCell(
              valuetype="string",
              stylename=column_style,
            )
            tc.addElement(P(
              text="",
              stylename=wl_paragraph_style_name,
            ))
            tr2.addElement(tc)

            # Name Column
            tc = TableCell(
              valuetype="string",
              stylename=column_style,
              numberrowsspanned="2",
            )
            tc.addElement(P(
              text=tournament.matches[j].contestant1.entry.robotName,
              stylename=robot_name_paragraph_style_name,
            ))
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
            tc = TableCell(
              valuetype="string",
              stylename=column_style,
              numberrowsspanned="2",
            )
            tc.addElement(P(
              text=tournament.matches[j].contestant2.entry.robotName,
              stylename=robot_name_paragraph_style_name,
            ))
            tr1.addElement(tc)

            tc = TableCell(valuetype="string", stylename=column_style)
            tc.addElement(P(text="", stylename=wl_paragraph_style_name))
            tr2.addElement(tc)

            # Letter column
            tc = TableCell(
              valuetype="string",
              stylename=column_style,
              numberrowsspanned="2",
            )
            tc.addElement(P(
              text=tournament.matches[j].contestant2.letter,
              stylename=robot_name_paragraph_style_name,
            ))
            tr1.addElement(tc)

            tc = TableCell(
              valuetype="string",
              stylename=column_style,
            )
            tc.addElement(P(
              text="",
              stylename=wl_paragraph_style_name,
            ))
            tr2.addElement(tc)

            # put in a blank entry if the last line only has one entry.
            if j % 2 == 0 and j == len(tournament.matches) - 1:
                tc = TableCell(
                  valuetype="string",
                  stylename=spacer_column_style_name,
                  numberrowsspanned="2",
                  numbercolumnsspanned="7",
                )
                tc.addElement(P(
                  text="",
                  stylename=spacer_cell_style_name,
                ))
                tr1.addElement(tc)

                # If the score_table is two long break it into two columns.
                # if (2 * len(tournament.matches) * row_height > 5.0):
                #    section = text.Section(name="Section" + str(i), \
                #      stylename=section_style_name)
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

        summary_table_style_name = "SummaryTableStyleName" \
            + str(tournament.ring)

        s = Style(
          name=summary_table_style_name,
          family="table",
          displayname="Summary Table" + str(tournament.ring),
        )
        t = TableProperties(
          align="center",
          width=str(summary_table_width) + "in",
        )
        s.addElement(t)
        s.addElement(t)
        styles.addElement(s)

        summary_info_column_style_name = "SummaryInfoColumnStyle" \
            + str(tournament.ring)

        s = Style(
          name=summary_info_column_style_name,
          family="table-column",
          displayname="Summary Info Table Column " + str(tournament.ring),
        )

        t = TableColumnProperties(
          columnwidth=str(summary_column_width-0.375) + "in"
        )
        s.addElement(t)
        styles.addElement(s)

        summary_spacer_column_style_name = "SummarySpacerColumnStyle" + \
            str(tournament.ring)

        s = Style(
          name=summary_spacer_column_style_name,
          family="table-column",
          displayname="Summary Spacer Table Column " + str(tournament.ring),
        )
        t = TableColumnProperties(columnwidth="0.375in")
        s.addElement(t)
        styles.addElement(s)

        summary_cell_style_name = "SummaryCellStyleName"
        s = Style(
          name=summary_cell_style_name,
          family="table-cell",
          displayname="Text Cell",
        )
        t = TableCellProperties(
          verticalalign="",
          padding="0.01in",
          borderright="0.05pt solid #000000",
          bordertop="0.05pt solid #000000",
          borderleft='0.05pt solid #000000',
          borderbottom='0.05pt solid #000000',
        )
        s.addElement(t)
        styles.addElement(s)

        summary_table = Table(
          name="SummaryTable" + str(tournament.ring),
          stylename=summary_table_style_name,
        )

        for i in range(0, 4):
            summary_table.addElement(
              TableColumn(stylename=summary_info_column_style_name)
            )
            summary_table.addElement(
              TableColumn(stylename=summary_spacer_column_style_name)
            )

        for j in range(0, len(tournament.event_entries), 1):
            if j % 4 == 0:
                tr1 = TableRow(stylename=row_style_name)
                summary_table.addElement(tr1)

            tc = TableCell(
              valuetype="string",
              stylename=summary_cell_style_name,
            )
            tc.addElement(
                P(text=tournament.event_entries[j].letter + " -  "
                  + tournament.event_entries[j].entry.robotName,
                  stylename=robot_summary_name_paragraph_style_name,
                ))

            tc.addElement(
                P(text=tournament.event_entries[j].entry.driver1,
                  stylename=robot_summary_detail_paragraph_style_name))

            tc.addElement(
                P(text=tournament.event_entries[j].entry.school,
                  stylename=robot_summary_detail_paragraph_style_name))
            tr1.addElement(tc)
            tc = TableCell(
              valuetype="string",
              stylename=summary_cell_style_name,
            )
            tr1.addElement(tc)

        document.text.addElement(P(text=""))
        document.text.addElement(summary_table)
        document.text.addElement(P(text=""))
        document.text.addElement(P(
            text="1st:________________     2nd:________________  "
            + "   3rd:________________     4th:________________"))
        document.text.addElement(P(text=""))
        document.text.addElement(P(
            text="5th:________________     6th:________________  "
            + "   7th:________________     8th:________________"))

        # TODO add checkboxes for the "Entered on Scoreboard" and
        # "Entered on spreadsheet."

    filename = "./ScoreSheets/" + event.competition
    document.save(filename, True)

    return filename
