import datetime
import os
import tempfile
from zoneinfo import ZoneInfo

from odf.opendocument import OpenDocumentText
from odf.style import (
    Style,
    PageLayout,
    PageLayoutProperties,
    MasterPage,
    TextProperties,
    ParagraphProperties,
    TableCellProperties,
    TableRowProperties,
    TableColumnProperties,
    TableProperties,
)
from odf.table import Table, TableColumn, TableRow, TableCell
from odf.text import P

from Entry import Entry
from Event import Event


def _ordinal_suffix(n: int) -> str:
    """Return the ordinal suffix for an integer (e.g. 1 -> 'st', 2 -> 'nd')."""
    n = int(n)
    suffix = ["th", "st", "nd", "rd", "th"][min(n % 10, 4)]
    if 11 <= (n % 100) <= 13:
        suffix = "th"
    return suffix


def make_trophy_record_sheet(
    event: Event,
    winners: list,
) -> str:
    doc = _build_document(event=event, winners=winners)
    fd, file_name = tempfile.mkstemp(suffix=f"-{event.id}-trophy-sheets.odt")
    os.close(fd)
    doc.save(file_name)
    return file_name


def _build_document(event: Event, winners: list) -> OpenDocumentText:
    cst = ZoneInfo("America/Chicago")
    now = datetime.datetime.now(tz=cst)
    date_str = now.strftime("%B %d, %Y")
    year_str = str(now.year)

    doc = OpenDocumentText()

    # Page layout — portrait 8.5x11
    page_layout = PageLayout(name="TrophyPageLayout")
    page_layout.addElement(PageLayoutProperties(
        printorientation="portrait",
        pageheight="11in",
        pagewidth="8.5in",
        margintop="0.6in",
        marginbottom="0.6in",
        marginleft="0.75in",
        marginright="0.75in",
    ))
    doc.automaticstyles.addElement(page_layout)

    masterpage = MasterPage(name="Standard", pagelayoutname=page_layout)
    doc.masterstyles.addElement(masterpage)

    # Paragraph styles
    heading_style = Style(name="TrophyHeading", family="paragraph")
    heading_style.addElement(ParagraphProperties(textalign="center"))
    heading_style.addElement(TextProperties(fontsize="15pt", fontweight="bold"))
    doc.automaticstyles.addElement(heading_style)

    subheading_style = Style(name="TrophySubHeading", family="paragraph")
    subheading_style.addElement(ParagraphProperties(textalign="center"))
    subheading_style.addElement(TextProperties(fontsize="12pt", fontweight="bold"))
    doc.automaticstyles.addElement(subheading_style)

    body_style = Style(name="TrophyBody", family="paragraph")
    body_style.addElement(TextProperties(fontsize="11pt"))
    doc.automaticstyles.addElement(body_style)

    spacer_style = Style(name="TrophySpacer", family="paragraph")
    spacer_style.addElement(TextProperties(fontsize="4pt"))
    doc.automaticstyles.addElement(spacer_style)

    # Cell label style (bold, inside cell)
    cell_label_style = Style(name="TrophyCellLabel", family="paragraph")
    cell_label_style.addElement(TextProperties(fontsize="9pt", fontweight="bold"))
    doc.automaticstyles.addElement(cell_label_style)

    # Cell value style (inside cell)
    cell_value_style = Style(name="TrophyCellValue", family="paragraph")
    cell_value_style.addElement(TextProperties(fontsize="11pt"))
    doc.automaticstyles.addElement(cell_value_style)

    # Table cell style with border
    border = "0.05pt solid #000000"
    cell_style = Style(name="TrophyCell", family="table-cell")
    cell_style.addElement(TableCellProperties(
        border=border,
        padding="0.05in",
    ))
    doc.automaticstyles.addElement(cell_style)

    # Borderless cell style (for text-only rows)
    cell_plain_style = Style(name="TrophyCellPlain", family="table-cell")
    cell_plain_style.addElement(TableCellProperties(
        border="none",
        padding="0.05in",
    ))
    doc.automaticstyles.addElement(cell_plain_style)

    # Table style
    table_style = Style(name="TrophyTable", family="table")
    table_style.addElement(TableProperties(width="7in", align="margins"))
    doc.automaticstyles.addElement(table_style)

    # Table column style
    col_style = Style(name="TrophyCol", family="table-column")
    col_style.addElement(TableColumnProperties(columnwidth="7in"))
    doc.automaticstyles.addElement(col_style)

    # Row height styles — small for label+value fields, larger for blank fields
    def _row_style(doc, name, height):
        s = Style(name=name, family="table-row")
        s.addElement(TableRowProperties(minrowheight=height))
        doc.automaticstyles.addElement(s)
        return s

    row_sm = _row_style(doc, "RowSm", "0.55in")
    row_md = _row_style(doc, "RowMd", "0.65in")
    row_lg = _row_style(doc, "RowLg", "0.75in")

    body = doc.text

    for i, winner in enumerate(winners):
        place_num = i + 1
        place_str = str(place_num) + _ordinal_suffix(place_num) + " Place"
        drivers = [d for d in [winner.driver1, winner.driver2, winner.driver3] if d]
        drivers_str = ", ".join(drivers) if drivers else ""

        if i > 0:
            pb_style_name = f"TrophyPageBreak{i}"
            pb_style = Style(name=pb_style_name, family="paragraph")
            pb_style.addElement(ParagraphProperties(breakbefore="page"))
            pb_style.addElement(TextProperties(fontsize="4pt"))
            doc.automaticstyles.addElement(pb_style)
            body.addElement(P(stylename=pb_style, text=""))

        _add_sheet(
            body=body,
            doc=doc,
            event=event,
            winner=winner,
            place_str=place_str,
            drivers_str=drivers_str,
            date_str=date_str,
            year_str=year_str,
            heading_style=heading_style,
            subheading_style=subheading_style,
            body_style=body_style,
            spacer_style=spacer_style,
            cell_label_style=cell_label_style,
            cell_value_style=cell_value_style,
            cell_style=cell_style,
            cell_plain_style=cell_plain_style,
            table_style=table_style,
            col_style=col_style,
            row_sm=row_sm,
            row_md=row_md,
            row_lg=row_lg,
        )

    return doc


def _p(parent, style, text=""):
    p = P(stylename=style, text=text)
    parent.addElement(p)
    return p


def _field_cell(doc, cell_style, cell_label_style, cell_value_style, row_style, label, value=""):
    """A bordered table row with a bold label and optional pre-filled value."""
    row = TableRow(stylename=row_style)
    cell = TableCell(stylename=cell_style, numbercolumnsspanned="1")
    _p(cell, cell_label_style, label)
    _p(cell, cell_value_style, value if value else "")
    row.addElement(cell)
    return row


def _add_sheet(
    body, doc, event, winner, place_str, drivers_str,
    date_str, year_str, heading_style, subheading_style,
    body_style, spacer_style,
    cell_label_style, cell_value_style, cell_style, cell_plain_style,
    table_style, col_style, row_sm, row_md, row_lg,
):
    # Header
    _p(body, heading_style, "MRG Trophy Record Sheet")
    _p(body, subheading_style, f"Year: {year_str}  |  {event.long_name} — {place_str}")
    _p(body, spacer_style, "")

    table = Table(stylename=table_style)
    table.addElement(TableColumn(stylename=col_style))

    table.addElement(_field_cell(doc, cell_style, cell_label_style, cell_value_style, row_sm, "Date:", date_str))
    table.addElement(_field_cell(doc, cell_style, cell_label_style, cell_value_style, row_sm, "On behalf of (School/Team):", winner.school))
    table.addElement(_field_cell(doc, cell_style, cell_label_style, cell_value_style, row_sm, "Phone:", winner.ph))
    table.addElement(_field_cell(doc, cell_style, cell_label_style, cell_value_style, row_sm, "Email:", winner.email))
    table.addElement(_field_cell(doc, cell_style, cell_label_style, cell_value_style, row_md, "Trophy Location (where it will be kept):", ""))
    table.addElement(_field_cell(doc, cell_style, cell_label_style, cell_value_style, row_sm, "Driver's Name(s) — print clearly for engraving:", drivers_str))
    table.addElement(_field_cell(doc, cell_style, cell_label_style, cell_value_style, row_sm, "Robot Name — print clearly for engraving:", winner.robotName))
    table.addElement(_field_cell(doc, cell_style, cell_label_style, cell_value_style, row_sm, "T-Shirt Size:", ""))
    # "I agree" statement row (no border)
    agree_row = TableRow()
    agree_cell = TableCell(stylename=cell_plain_style)
    _p(agree_cell, body_style, "I agree that the trophy was received in excellent condition.")
    agree_row.addElement(agree_cell)
    table.addElement(agree_row)

    table.addElement(_field_cell(doc, cell_style, cell_label_style, cell_value_style, row_lg, "Received by (PRINT NAME):", ""))
    table.addElement(_field_cell(doc, cell_style, cell_label_style, cell_value_style, row_md, "Signature:", ""))

    body.addElement(table)
