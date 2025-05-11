import datetime
import calendar
from odf.opendocument import OpenDocumentDrawing, OpenDocument
from odf.style import (
    Style,
    MasterPage,
    PageLayout,
    PageLayoutProperties,
    TextProperties,
    ParagraphProperties,
    FontFace,
    GraphicProperties,
)
from odf.text import P, Span
from odf.draw import Page, Frame, TextBox, Image
from odf import teletype
from pathlib import Path
from utilities import make_ordinal
import logging


def make_odf_certificate(minutes: int, seconds, player, robot) -> str:

    logging.info(f"Generating certificate for {player} with {robot}")
    doc = make_odf_certificate_odoc(minutes, seconds, player, robot)
    file_name = (
        Path(__file__).parent / f"{player} with {robot}-robotcritter-certificate.odg"
    )
    doc.save(file_name)
    return str(file_name)


def make_odf_certificate_odoc(
    minutes: int,
    seconds: int,
    player: str,
    robot: str,
) -> OpenDocument:
    now = datetime.datetime.now()
    games_iteration: "int" = now.year - 1995

    document = OpenDocumentDrawing()

    drawing_page = "DP1"
    drawing_page_style = Style(
        family="drawing-page",
        name=drawing_page,
    )
    document.automaticstyles.addElement(drawing_page_style)

    page_layout_ = "PageLayout"
    page_layout_style = PageLayout(name=page_layout_)
    page_layout_properties = PageLayoutProperties(
        writingmode="lr-tb",
        margintop="1.25in",
        marginbottom="1.25in",
        marginleft="1.25in",
        marginright="1.25in",
        printorientation="landscape",
        pageheight="8.5in",
        pagewidth="11in",
    )

    page_layout_style.addElement(page_layout_properties)
    document.automaticstyles.addElement(page_layout_style)

    masterpage = MasterPage(
        stylename=drawing_page,
        name="Standard",
        pagelayoutname=page_layout_style,
    )

    document.masterstyles.addElement(masterpage)

    # frame style
    frame_style_name = "frameStyle"
    frame_style = Style(name=frame_style_name, family="graphic")
    frame_style.addElement(
        GraphicProperties(
            fill="none",
            stroke="none",
            textareaverticalalign="middle",
        )
    )
    document.styles.addElement(frame_style)

    # Font declarations in font-face-decls
    font_styles = document.fontfacedecls

    # Cooper Black font
    cooper_black_font_name = "Cooper Black"
    s = FontFace(
        name=cooper_black_font_name,
        fontfamily=cooper_black_font_name,
    )
    font_styles.addElement(s)

    # Big Caslon font
    big_caslon_font_name = "Big Caslon FB"
    s = FontFace(
        name=big_caslon_font_name,
        fontfamily=big_caslon_font_name,
    )
    font_styles.addElement(s)

    # Big Caslon Pro font
    big_caslon_pro_font_name = "Adobe Caslon Pro"
    s = FontFace(
        name=big_caslon_pro_font_name,
        fontfamily=big_caslon_pro_font_name,
    )
    font_styles.addElement(s)

    # Automatic styles from here on down.
    styles = document.automaticstyles

    # PARAGRAPH - Big Caslon Pro 12pt
    information_paragraph_style = "informationParagraphStyle"
    s = Style(
        name=information_paragraph_style,
        family="paragraph",
        displayname="Big Caslon Pro 12pt",
    )
    s.addElement(ParagraphProperties(textalign="center"))
    s.addElement(
        TextProperties(
            fontname=big_caslon_pro_font_name,
            fontsize="12pt",
        )
    )
    styles.addElement(s)

    # TEXT - Big Caslon Pro 12pt Superscript
    big_caslon_pro_12pt_bold = "bigCaslon12ptBold"
    s = Style(
        name=big_caslon_pro_12pt_bold,
        family="text",
        displayname="Big Caslon Pro 12pt Bold",
    )
    s.addElement(
        TextProperties(
            fontname=big_caslon_pro_font_name,
            fontsize="12pt",
            fontweight="bold",
        )
    )
    styles.addElement(s)

    # TEXT - Big Caslon Pro 12pt Superscript
    big_caslon_pro_12pt_superscript = "bigCaslon12ptSuperscript"
    s = Style(
        name=big_caslon_pro_12pt_superscript,
        family="text",
        displayname="Big Caslon Pro 12pt Superscript",
    )
    s.addElement(
        TextProperties(
            fontname=big_caslon_pro_font_name,
            fontsize="12pt",
            textposition="33% 58%",
        )
    )
    styles.addElement(s)

    # TEXT - Big Caslon Pro 18pt
    big_caslon_pro_18pt = "bigCaslonPro18pt"
    s = Style(
        name=big_caslon_pro_18pt,
        family="text",
        displayname="Big Caslon Pro 18pt",
    )
    s.addElement(ParagraphProperties(textalign="center"))
    s.addElement(TextProperties(fontname=big_caslon_pro_font_name, fontsize="18pt"))
    styles.addElement(s)

    # TEXT - Big Caslon Pro 18pt superscript
    big_caslon_pro_18pt_superscript = "bigCaslonPro18ptsuperscript"
    s = Style(
        name=big_caslon_pro_18pt_superscript,
        family="text",
        displayname="Big Caslon Pro 18pt Superscript",
    )
    s.addElement(
        TextProperties(
            fontname=big_caslon_pro_font_name,
            fontsize="18pt",
            textposition="33% 58%",
        )
    )
    styles.addElement(s)

    # Paragraph - Competition Time
    competition_time_paragraph_style = "competitionTimeParagraphStyle"
    s = Style(
        name=competition_time_paragraph_style,
        family="paragraph",
        displayname="Big Caslon 22pt",
    )
    s.addElement(
        ParagraphProperties(
            textalign="center",
            #   lineheight="100%",
        )
    )
    s.addElement(
        TextProperties(
            fontname=big_caslon_font_name,
            fontsize="22pt",
        )
    )
    styles.addElement(s)

    # Paragraph - competition
    competition_paragraph_style = "competitionParagraphStyle"
    s = Style(
        name=competition_paragraph_style,
        family="paragraph",
        displayname="Big Caslon 22pt",
    )
    s.addElement(
        ParagraphProperties(
            textalign="center",
            lineheight="140%",
        )
    )
    s.addElement(
        TextProperties(
            fontname=big_caslon_font_name,
            fontsize="22pt",
        )
    )
    styles.addElement(s)

    # TEXT - Big Caslon 22pt Bold Style Name
    big_caslon_22pt_bold = "bigCaslon22ptBold"
    s = Style(
        name=big_caslon_22pt_bold,
        family="text",
        displayname="Big Caslon 22pt Bold",
    )
    s.addElement(
        TextProperties(
            fontname=big_caslon_font_name,
            fontsize="22pt",
            fontweight="bold",
            letterspacing="0.1em",
        )
    )
    styles.addElement(s)

    # TEXT - Big Caslon Pro 22pt
    big_caslon_pro_22pt = "bigCaslonPro22pt"
    s = Style(
        name=big_caslon_pro_22pt,
        family="text",
        displayname="Big Caslon Pro 22pt",
    )
    s.addElement(
        TextProperties(
            fontname=big_caslon_pro_font_name,
            fontsize="22pt",
        )
    )
    styles.addElement(s)

    # TEXT - Big Caslon Pro 22pt superscript
    big_caslon_pro_22pt_superscript = "bigCaslonPro22ptSuperscript"
    s = Style(
        name=big_caslon_pro_22pt_superscript,
        family="text",
        displayname="Big Caslon Pro 22pt",
    )
    s.addElement(
        TextProperties(
            fontname=big_caslon_pro_font_name,
            fontsize="22pt",
            textposition="33% 58%",
        )
    )
    styles.addElement(s)

    # TEXT - Big Caslon Pro 22pt Bold
    big_caslon_pro_22pt_bold = "bigCaslonPro22ptbold"
    s = Style(
        name=big_caslon_pro_22pt_bold,
        family="text",
        displayname="Big Caslon Pro 22pt bold",
    )
    s.addElement(
        TextProperties(
            fontname=big_caslon_pro_font_name,
            fontsize="22pt",
            fontweight="bold",
        )
    )
    styles.addElement(s)

    # TEXT - Big Caslon Pro 22pt bold superscript
    big_caslon_pro_22pt_bold_superscript = "bigCaslonPro22ptboldSuperscript"
    s = Style(
        name=big_caslon_pro_22pt_bold_superscript,
        family="text",
        displayname="Big Caslon Pro 22pt bold superscript",
    )
    s.addElement(
        TextProperties(
            fontname=big_caslon_pro_font_name,
            fontsize="22pt",
            fontweight="bold",
            textposition="33% 58%",
        )
    )
    styles.addElement(s)

    # TEXT - Cooper Black 22pt
    cooper_black_22pt = "CooperBlack22pt"
    s = Style(
        name=cooper_black_22pt,
        family="text",
        displayname="Cooper Black 22pt",
    )
    s.addElement(
        TextProperties(
            fontname=cooper_black_font_name,
            fontsize="22pt",
        )
    )
    styles.addElement(s)

    # TEXT - Big Caslon Pro 26pt Bold Style Name
    big_caslon_pro_26pt_bold = "bigCaslonPro26ptBold"
    s = Style(
        name=big_caslon_pro_26pt_bold,
        family="text",
        displayname="Big Caslon Pro 26pt Bold",
    )
    s.addElement(
        TextProperties(
            fontname=big_caslon_pro_font_name,
            fontsize="26pt",
            fontweight="bold",
        )
    )
    styles.addElement(s)

    # TEXT - Big Caslon Pro 26pt Bold superscript Style Name
    big_caslon_pro_26pt_bold_superscript = "bigCaslonPro26ptBoldSuperScript"
    s = Style(
        name=big_caslon_pro_26pt_bold_superscript,
        family="text",
        displayname="Big Caslon Pro 26pt Bold",
    )
    s.addElement(
        TextProperties(
            fontname=big_caslon_pro_font_name,
            fontsize="26pt",
            fontweight="bold",
            textposition="33% 58%",
        )
    )
    styles.addElement(s)

    # Add in the robot logo picture.
    picture_path = Path(__file__).parent / "logos/robocritters_logo.png"
    robot_logo_href = document.addPicture(picture_path)

    # Create a page to contain the drawing
    page = Page(
        masterpagename=masterpage,
        name="page",
        stylename=drawing_page,
    )
    document.drawing.addElement(page)

    # Add image
    photoframe = Frame(
        stylename=frame_style,
        width="4.00in",
        height="2.67in",
        x="3.5in",
        y="1.67in",
    )

    competition_time_frame = Frame(
        width="4.00in",
        height="1.00in",
        x="3.5in",
        y="4.37in",
        stylename=frame_style,
    )
    competition_time_text_box = TextBox()
    competition_time_frame.addElement(competition_time_text_box)

    competitor_frame = Frame(
        width="8.50in",
        height="0.90in",
        x="1.25in",
        y="5.17in",
        stylename=frame_style,
    )
    competitor_text_box = TextBox()
    competitor_frame.addElement(competitor_text_box)

    information_frame = Frame(
        width="8.50in",
        height="1.85in",
        x="1.25in",
        y="5.50in",
        stylename=frame_style,
    )
    information_text_box = TextBox()
    information_frame.addElement(information_text_box)

    page.addElement(photoframe)
    page.addElement(competition_time_frame)
    page.addElement(competitor_frame)
    page.addElement(information_frame)

    photoframe.addElement(Image(href=robot_logo_href))

    # Competition Time Information text box

    p = P(
        text="",
        stylename=competition_time_paragraph_style,
    )

    teletype.addTextToElement(p, "This is to certify that in\n")

    p.addElement(
        Span(
            stylename=competition_time_paragraph_style,
            text=f"{minutes} min. {seconds} sec.\n",
        )
    )

    competition_time_text_box.addElement(p)

    # Competitor text box.
    p = P(
        text="",
        stylename=competition_paragraph_style,
    )

    p.addElement(
        Span(
            text=player,
            stylename=competition_paragraph_style,
        )
    )

    p.addElement(
        Span(
            text=" with ",
            stylename=big_caslon_pro_22pt,
        )
    )

    p.addElement(
        Span(
            text=f'"{robot}"',
            stylename=competition_paragraph_style,
        )
    )

    teletype.addTextToElement(p, "\n")
    competitor_text_box.addElement(p)

    # Information text box
    p = P(
        text="",
        stylename=information_paragraph_style,
    )

    teletype.addTextToElement(p, "did successfully eliminate all the targets in the \n")

    p.addElement(
        Span(
            text="Robo-Critter ",
            stylename=big_caslon_pro_12pt_bold,
        )
    )

    p.addElement(
        Span(
            text="Competition",
            stylename=information_paragraph_style,
        )
    )

    teletype.addTextToElement(p, "\n")

    teletype.addTextToElement(
        p, f"during the {games_iteration}{make_ordinal(games_iteration)} Annual "
    )

    p.addElement(
        Span(
            text="Manitoba Robot Games",
            stylename=big_caslon_pro_12pt_bold,
        )
    )

    teletype.addTextToElement(
        p,
        f"\nHeld {calendar.month_name[now.month]} {now.day}{make_ordinal(now.day)}, {now.year} at ",
    )

    p.addElement(
        Span(
            text="Tec Voc High School",
            stylename=big_caslon_pro_12pt_bold,
        )
    )

    # teletype.addTextToElement(p, "\n")
    information_text_box.addElement(p)

    return document
