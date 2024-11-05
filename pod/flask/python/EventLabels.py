from odf.opendocument import OpenDocumentText, OpenDocument
from odf.table import Table, TableColumn, TableRow, TableCell
from odf.style import (
    Style,
    TextProperties,
    ParagraphProperties,
    TableCellProperties,
    TableRowProperties,
    TableColumnProperties,
    TableProperties,
    FontFace,
    PageLayout,
    PageLayoutProperties,
    MasterPage,
)
from odf.text import P
from datetime import date
import math
from Entry import Entry


# Generate labels for all events at once
def make_odf5160_all_event_labels(
    entries: list[Entry],
) -> str:

    file_name = f"all({len(entries)})_labels.odt"

    entries.sort(key=lambda x: (x.competition, x.robotName))

    doc = make_odf5160_labels_odt(
        entries=entries,
    )
    doc.save(file_name)
    return file_name


# Generate labels for a given event
def make_odf5160_labels(
    competition: str,
    entries: list[Entry],
) -> str:
    file_name = f"{competition}_labels.odt"

    entries = sorted(entries, key=lambda x: x.robotName)

    doc = make_odf5160_labels_odt(
        entries=entries,
    )
    doc.save(file_name)
    return file_name


def make_odf5160_labels_odt(
    entries: list[Entry],
) -> OpenDocument:
    # This will generate an ODF files for 5160 labels for a given event.
    # global table
    label_width = 2.625
    label_height = 1.0
    num_label_columns = 3
    label_sheet_width = 8.5
    label_sheet_height = 11

    competition_column_width = 0.35
    ring_column_width = 0.75
    info_column_width = label_width - competition_column_width - ring_column_width

    left_right_margin = 0.2
    top_margin = 7 / 16
    bottom_margin = 0.2
    label_spacing_width = 1 / 8

    table_width = (
        num_label_columns * label_width + (num_label_columns - 1) * label_spacing_width
    )

    document = OpenDocumentText()

    # Font declarations in font-face-decls
    styles = document.fontfacedecls

    # arial font
    arial_font_style_name = "Arial"
    s = FontFace(
        name=arial_font_style_name,
        fontfamily=arial_font_style_name,
    )
    styles.addElement(s)

    # wingdings font
    wingdings_font_style_name = "Wingdings"
    s = FontFace(
        name=wingdings_font_style_name,
        fontfamily=wingdings_font_style_name,
    )

    styles.addElement(s)

    # Automatic styles from here on down.
    styles = document.automaticstyles

    # Setup the page layout.
    page_layout_style_name = "PageLayoutStyleName"
    s = PageLayout(name=page_layout_style_name)
    t = PageLayoutProperties(
        writingmode="lr-tb",
        margintop=str(top_margin) + "in",
        marginbottom=str(bottom_margin) + "in",
        marginleft=str(left_right_margin) + "in",
        marginright=str(left_right_margin) + "in",
        printorientation="portrait",
        pageheight=str(label_sheet_height) + "in",
        pagewidth=str(label_sheet_width) + "in",
    )

    s.addElement(t)
    styles.addElement(s)

    masterpage = MasterPage(name="Standard", pagelayoutname=page_layout_style_name)

    document.masterstyles.addElement(masterpage)

    # Setup the table layout
    # Table Style
    label_table_style_name = "LabelTableStyle"
    s = Style(
        name=label_table_style_name,
        family="table",
        displayname="Label Table",
    )

    t = TableProperties(
        align="center",
        width=str(table_width) + "in",
    )

    s.addElement(t)
    styles.addElement(s)

    # label Row style
    label_row_style_name = "LabelRowStyleName"
    s = Style(
        name=label_row_style_name,
        family="table-row",
        displayname="Label Row",
    )

    t = TableRowProperties(minrowheight=str(label_height) + "in")
    s.addElement(t)
    styles.addElement(s)

    # label Column Style
    label_column_style_name = "labelColumnStyle"
    s = Style(
        name=label_column_style_name,
        family="table-column",
        displayname="Label Table Column",
    )

    t = TableColumnProperties(columnwidth=str(label_width) + "in")
    s.addElement(t)
    styles.addElement(s)

    # Spacer column Style
    spacer_column_style_name = "spacerColumnStyle"
    s = Style(
        name=spacer_column_style_name,
        family="table-column",
        displayname="Label Spacer Column",
    )

    t = TableColumnProperties(columnwidth=str(label_spacing_width) + "in")
    s.addElement(t)
    styles.addElement(s)

    # cell style
    label_cell_style_name = "LabelCellStyleName"
    s = Style(
        name=label_cell_style_name,
        family="table-cell",
        displayname="Text Cell",
    )

    t = TableCellProperties(
        verticalalign="middle",
        padding="0.00in",
    )
    s.addElement(t)
    styles.addElement(s)

    # Ring cell Style
    ring_cell_style_name = "RingCellStyleName"
    s = Style(
        name=ring_cell_style_name,
        family="table-cell",
        displayname="Text Cell",
    )

    t = TableCellProperties(
        verticalalign="top",
        padding="0.05in",
        borderleft="0.05pt solid",
    )
    s.addElement(t)
    styles.addElement(s)

    # Sub-table, which is be located in each label cell
    sub_table_style_name = "SubTableStyle"
    s = Style(
        name=sub_table_style_name,
        family="table",
        displayname="Sub Table",
    )

    t = TableProperties(width=str(label_width) + "in")
    s.addElement(t)
    styles.addElement(s)

    # Sub-table competition column style
    sub_table_competition_column_style_name = "subTableCompetitionSytle"
    s = Style(
        name=sub_table_competition_column_style_name,
        family="table-column",
        displayname="Sub-Table compeition Style",
    )

    t = TableColumnProperties(columnwidth=str(competition_column_width) + "in")

    s.addElement(t)
    styles.addElement(s)

    # Sub-table info column style
    sub_table_info_column_style_name = "subTableInfoSytle"
    s = Style(
        name=sub_table_info_column_style_name,
        family="table-column",
        displayname="Sub-Table compeition Style",
    )
    t = TableColumnProperties(columnwidth=str(info_column_width) + "in")
    s.addElement(t)
    styles.addElement(s)

    # sub-table ring column style
    sub_table_ring_column_style_name = "subTableRingSytle"
    s = Style(
        name=sub_table_ring_column_style_name,
        family="table-column",
        displayname="Sub-Table compeition Style",
    )

    t = TableColumnProperties(columnwidth=str(ring_column_width) + "in")
    s.addElement(t)
    styles.addElement(s)

    # Sub-table competition cell style
    sub_table_competition_cell_style_name = "SubTableCompetitionSytleName"
    s = Style(
        name=sub_table_competition_cell_style_name,
        family="table-cell",
        displayname="Competition Cell",
    )

    t = TableCellProperties(
        verticalalign="middle",
        backgroundcolor="#000000",
        padding="0.00in",
        writingmode="tb-lr",
    )

    s.addElement(t)
    styles.addElement(s)

    # Competition Paragraph Style
    competition_paragraph_style_name = "competitionParagraphStyle"
    s = Style(
        name=competition_paragraph_style_name,
        family="paragraph",
        displayname="Competition Paragraph Style",
    )

    t = ParagraphProperties(textalign="center")
    s.addElement(t)
    t = TextProperties(
        fontname=arial_font_style_name,
        fontsize="14pt",
        fontsizecomplex="14pt",
        fontsizeasian="14pt",
        color="#FFFFFF",
        fontweightcomplex="Bold",
        fontweightasian="bold",
        fontweight="bold",
    )

    s.addElement(t)
    styles.addElement(s)

    # year Paragraph Style
    year_paragraph_style_name = "yearParagraphStyle"
    s = Style(
        name=year_paragraph_style_name,
        family="paragraph",
        displayname="Year Paragraph Style",
    )

    t = ParagraphProperties(textalign="center")
    s.addElement(t)
    t = TextProperties(
        fontname=arial_font_style_name,
        fontsize="10pt",
        fontsizecomplex="10pt",
        fontsizeasian="10pt",
        color="#FFFFFF",
        fontweightcomplex="Bold",
        fontweightasian="bold",
        fontweight="bold",
    )

    s.addElement(t)
    styles.addElement(s)

    # Robot Name Style Name
    robot_name_style_name = "robotNameStyleName"
    s = Style(
        name=robot_name_style_name,
        family="paragraph",
        displayname="Robot Name Paragraph Style",
    )

    t = ParagraphProperties(textalign="center")
    s.addElement(t)
    t = TextProperties(
        fontname=arial_font_style_name,
        fontsize="10pt",
        fontsizecomplex="10pt",
        fontsizeasian="10pt",
        fontweightcomplex="Bold",
        fontweightasian="bold",
        fontweight="bold",
    )

    s.addElement(t)
    styles.addElement(s)

    # Driver Name Style Name
    driver_style_name = "driverNameStyleName"
    s = Style(
        name=driver_style_name,
        family="paragraph",
        displayname="Driver Name Paragraph Style",
    )

    t = ParagraphProperties(textalign="center")
    s.addElement(t)
    t = TextProperties(
        fontname=arial_font_style_name,
        fontsize="10pt",
        fontsizecomplex="10pt",
        fontsizeasian="10pt",
    )

    s.addElement(t)
    styles.addElement(s)

    school_style_name = "schoolNameStyleName"
    s = Style(
        name=school_style_name,
        family="paragraph",
        displayname="Driver Name Paragraph Style",
    )

    t = ParagraphProperties(textalign="center")
    s.addElement(t)
    t = TextProperties(
        fontname=arial_font_style_name,
        fontsize="8pt",
        fontsizecomplex="8pt",
        fontsizeasian="8pt",
    )

    s.addElement(t)
    styles.addElement(s)

    measurement_style_name = "measurementStyleName"
    s = Style(
        name=measurement_style_name,
        family="paragraph",
        displayname="Driver Name Paragraph Style",
    )

    t = ParagraphProperties(textalign="center")
    s.addElement(t)
    t = TextProperties(
        fontname=arial_font_style_name,
        fontsize="8pt",
        fontsizecomplex="8pt",
        fontsizeasian="7pt",
    )

    s.addElement(t)
    styles.addElement(s)

    # Info Paragraph Style
    label_paragraph_style_name = "LabelParagraphStyle"
    s = Style(
        name=label_paragraph_style_name,
        family="paragraph",
        displayname="Label Paragraph Style",
    )

    t = ParagraphProperties(textalign="center")
    s.addElement(t)
    t = TextProperties(
        fontsize="10pt",
        fontsizecomplex="10pt",
        fontsizeasian="10pt",
    )

    s.addElement(t)
    styles.addElement(s)

    wingdings_text_style = "WingdingsTextStyle"
    s = Style(name=wingdings_text_style, family="text", displayname="wingdingsStyle")

    t = TextProperties(
        fontsize="12pt",
        fontsizecomplex="12pt",
        fontsizeasian="12pt",
        fontname="Wingdings",
    )

    s.addElement(t)
    styles.addElement(s)

    def make_label(competition, robot_id, robot_name, driver_name, school_name):

        # Create the sub-table in the cell.
        sub_table = Table(name="Table", stylename=sub_table_style_name)
        sub_table.addElement(
            TableColumn(stylename=sub_table_competition_column_style_name)
        )
        sub_table.addElement(TableColumn(stylename=sub_table_info_column_style_name))
        sub_table.addElement(TableColumn(stylename=sub_table_ring_column_style_name))

        # Add the row to the sub-table
        sub_table_tr = TableRow(stylename=label_row_style_name)
        sub_table.addElement(sub_table_tr)

        # Create the competition cell
        table_cell = TableCell(
            valuetype="string",
            stylename=sub_table_competition_cell_style_name,
        )

        table_cell.addElement(
            P(
                text=str(date.today().year),
                stylename=year_paragraph_style_name,
            )
        )

        table_cell.addElement(
            P(
                text=competition,
                stylename=competition_paragraph_style_name,
            )
        )

        sub_table_tr.addElement(table_cell)

        # Create the info cell
        table_cell = TableCell(
            valuetype="string",
            stylename=label_cell_style_name,
        )

        table_cell.addElement(
            P(
                text=f"#{robot_id}",
                stylename=robot_name_style_name,
            )
        )

        table_cell.addElement(
            P(
                text=robot_name,
                stylename=robot_name_style_name,
            )
        )

        table_cell.addElement(
            P(
                text=driver_name,
                stylename=driver_style_name,
            )
        )

        table_cell.addElement(
            P(
                text=school_name,
                stylename=school_style_name,
            )
        )

        # def add_mass_checkbox(p):
        #     p.addText("Mass")
        #     p.addElement(Span(text="r", stylename=wingdings_text_style))
        #     return p
        #
        # def add_size_checkbox(p):
        #     p.addText("Size")
        #     p.addElement(Span(text="r", stylename=wingdings_text_style))
        #     return p
        #
        # def add_delay_checkbox(p):
        #     p.addText("Delay")
        #     p.addElement(Span(text="r", stylename=wingdings_text_style))
        #     return p
        #
        # def add_lipo_checkbox(p):
        #     p.addText("Li")
        #     p.addElement(Span(text="r", stylename=wingdings_text_style))
        #     return p
        #
        # def add_space(p):
        #     p.addText(" ")
        #     return p
        #
        # p = P(text="", stylename=measurement_style_name)
        # if competition == "PST":
        #     p = add_mass_checkbox(p)
        #     p = add_space(p)
        #     p = add_size_checkbox(p)
        #     p = add_space(p)
        #     p = add_lipo_checkbox(p)
        #
        # elif competition == "PSA":
        #     p = add_mass_checkbox(p)
        #     p = add_space(p)
        #     p = add_size_checkbox(p)
        #     p = add_space(p)
        #     p = add_delay_checkbox(p)
        #     p = add_space(p)
        #     p = add_lipo_checkbox(p)
        #
        # elif competition == "MS1":
        #     p = add_mass_checkbox(p)
        #     p = add_space(p)
        #     p = add_lipo_checkbox(p)
        #
        # elif competition == "MS2":
        #     p = add_mass_checkbox(p)
        #     p = add_space(p)
        #     p = add_lipo_checkbox(p)
        #
        # elif competition == "MS3":
        #     p = add_mass_checkbox(p)
        #     p = add_space(p)
        #     p = add_lipo_checkbox(p)
        #
        # elif competition == "MSR":
        #     p = add_mass_checkbox(p)
        #
        # elif competition == "MSA":
        #     p = add_mass_checkbox(p)
        #     p = add_space(p)
        #     p = add_delay_checkbox(p)
        #     p = add_space(p)
        #     p = add_lipo_checkbox(p)
        #
        # elif competition == 'TPM':
        #     p = add_mass_checkbox(p)
        #     p = add_space(p)
        #     p = add_size_checkbox(p)
        #     p = add_space(p)
        #     p = add_lipo_checkbox(p)
        #
        # elif competition == 'LFA':
        #     p = add_size_checkbox(p)
        #     p = add_space(p)
        #     p = add_lipo_checkbox(p)
        #
        # elif competition == 'SSA':
        #     p = add_mass_checkbox(p)
        #     p = add_space(p)
        #     p = add_size_checkbox(p)
        #     p = add_space(p)
        #     p = add_lipo_checkbox(p)
        #
        # elif competition == 'SSB':
        #     p = add_mass_checkbox(p)
        #     p = add_space(p)
        #     p = add_size_checkbox(p)
        #     p = add_space(p)
        #     p = add_lipo_checkbox(p)
        #
        # elif competition == 'JC1':
        #     p = add_mass_checkbox(p)
        #     p = add_space(p)
        #     p = add_size_checkbox(p)
        #     p = add_space(p)
        #     p = add_lipo_checkbox(p)
        #
        # elif competition == 'NXT':
        #     pass

        # table_cell.addElement(p)

        sub_table_tr.addElement(table_cell)

        # Create the ring cell
        table_cell = TableCell(
            valuetype="string",
            stylename=ring_cell_style_name,
        )

        table_cell.addElement(
            P(
                text="Ring",
                stylename=robot_name_style_name,
            )
        )

        sub_table_tr.addElement(table_cell)

        return sub_table

    table = 0
    tr = 0

    for j in range(0, len(entries), 1):

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
            tc = TableCell(
                valuetype="string",
                stylename=label_cell_style_name,
            )
            tr.addElement(tc)

        # Add another cell to the table.
        tc = TableCell(
            valuetype="string",
            stylename=label_cell_style_name,
        )
        tr.addElement(tc)

        tc.addElement(
            make_label(
                competition=entries[j].competition,
                robot_id=entries[j].id,
                robot_name=entries[j].robotName,
                driver_name=entries[j].driver1,
                school_name=entries[j].school,
            )
        )

    for j in range(len(entries), math.ceil(float(len(entries)) / 30.0) * 30, 1):
        # Start a new row of labels
        if j % 3 == 0:
            tr = TableRow(stylename=label_row_style_name)
            table.addElement(tr)

        # insert a spacer column
        else:
            tc = TableCell(
                valuetype="string",
                stylename=label_cell_style_name,
            )
            tr.addElement(tc)

        # Add another cell to the table.
        tc = TableCell(
            valuetype="string",
            stylename=label_cell_style_name,
        )
        tc.addElement(
            make_label(
                "",
                "______",
                "_______________",
                "__________________",
                "___________________",
            )
        )
        tr.addElement(tc)

        return document
