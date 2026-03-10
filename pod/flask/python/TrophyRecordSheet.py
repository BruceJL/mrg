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
)
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
        margintop="0.75in",
        marginbottom="0.75in",
        marginleft="0.75in",
        marginright="0.75in",
    ))
    doc.automaticstyles.addElement(page_layout)

    masterpage = MasterPage(name="Standard", pagelayoutname=page_layout)
    doc.masterstyles.addElement(masterpage)

    # Styles
    heading_style = Style(name="TrophyHeading", family="paragraph")
    heading_style.addElement(ParagraphProperties(textalign="center"))
    heading_style.addElement(TextProperties(fontsize="16pt", fontweight="bold"))
    doc.automaticstyles.addElement(heading_style)

    subheading_style = Style(name="TrophySubHeading", family="paragraph")
    subheading_style.addElement(ParagraphProperties(textalign="center"))
    subheading_style.addElement(TextProperties(fontsize="13pt", fontweight="bold"))
    doc.automaticstyles.addElement(subheading_style)

    label_style = Style(name="TrophyLabel", family="paragraph")
    label_style.addElement(TextProperties(fontsize="11pt", fontweight="bold"))
    doc.automaticstyles.addElement(label_style)

    value_style = Style(name="TrophyValue", family="paragraph")
    value_style.addElement(TextProperties(fontsize="11pt"))
    doc.automaticstyles.addElement(value_style)

    body = doc.text

    for i, winner in enumerate(winners):
        place_num = i + 1
        place_str = str(place_num) + _ordinal_suffix(place_num) + " Place"
        drivers = [d for d in [winner.driver1, winner.driver2, winner.driver3] if d]
        drivers_str = ", ".join(drivers) if drivers else ""

        if i > 0:
            # Page break before each sheet after the first
            pb_style_name = f"TrophyPageBreak{i}"
            pb_style = Style(name=pb_style_name, family="paragraph")
            pb_style.addElement(ParagraphProperties(breakbefore="page"))
            doc.automaticstyles.addElement(pb_style)
            body.addElement(P(stylename=pb_style, text=""))

        _add_sheet(
            body=body,
            event=event,
            winner=winner,
            place_str=place_str,
            drivers_str=drivers_str,
            date_str=date_str,
            year_str=year_str,
            heading_style=heading_style,
            subheading_style=subheading_style,
            label_style=label_style,
            value_style=value_style,
        )

    return doc


def _p(body, style, text=""):
    p = P(stylename=style, text=text)
    body.addElement(p)
    return p


def _field_row(body, label_style, value_style, label: str, value: str):
    _p(body, label_style, label)
    _p(body, value_style, value if value else "")
    _p(body, value_style, "_______________________________________________")


def _blank_row(body, label_style, value_style, label: str):
    _p(body, label_style, label)
    _p(body, value_style, "_______________________________________________")


def _add_sheet(
    body, event, winner, place_str, drivers_str,
    date_str, year_str, heading_style, subheading_style,
    label_style, value_style,
):
    _p(body, heading_style, "MRG Trophy Record Sheet")
    _p(body, subheading_style, f"Year: {year_str}")
    _p(body, subheading_style, f"Trophy/Competition: {event.long_name} — {place_str}")
    _p(body, value_style, "")

    _p(body, label_style, "The above trophy has been received by: [PRINT]")
    _p(body, value_style, "_______________________________________________")
    _p(body, value_style, "")

    _p(body, value_style, "I agree that the trophy was received in excellent condition.")
    _p(body, value_style, "")

    _field_row(body, label_style, value_style, "Date:", date_str)
    _p(body, value_style, "")

    _blank_row(body, label_style, value_style, "Signature:")
    _p(body, value_style, "")

    _p(body, label_style, "On behalf of: A member of a school robotics team")
    _p(body, value_style, "")

    _field_row(body, label_style, value_style, "School/Team:", winner.school)
    _p(body, value_style, "")

    _field_row(body, label_style, value_style, "Phone:", winner.ph)
    _p(body, value_style, "")

    _field_row(body, label_style, value_style, "Email:", winner.email)
    _p(body, value_style, "")

    _blank_row(body, label_style, value_style, "Trophy Location (Where it will be kept):")
    _p(body, value_style, "")

    _p(body, label_style, "Trophy Engraving Information — Print Clearly:")
    _p(body, value_style, "")

    _field_row(body, label_style, value_style, "Driver's Name(s):", drivers_str)
    _p(body, value_style, "")

    _field_row(body, label_style, value_style, "Robot Name:", winner.robotName)
    _p(body, value_style, "")

    _blank_row(body, label_style, value_style, "T-Shirt Size:")
    _p(body, value_style, "")
