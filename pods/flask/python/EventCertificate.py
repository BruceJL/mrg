import datetime
import calendar
from typing import TYPE_CHECKING
from odf.opendocument import OpenDocumentDrawing
from odf.style import Style, MasterPage, PageLayout, PageLayoutProperties, \
  TextProperties, ParagraphProperties, FontFace, GraphicProperties
from odf.text import P, Span
from odf.draw import Page, Frame, TextBox, Image
from odf import teletype

if TYPE_CHECKING:
    from Entry import Entry
    from typing import List


# stolen from:
# https://stackoverflow.com/questions/9647202/ordinal-numbers-replacement
def make_ordinal(n: 'int'):
    '''
    Convert an integer into its ordinal representation::

        make_ordinal(0)   => '0th'
        make_ordinal(3)   => '3rd'
        make_ordinal(122) => '122nd'
        make_ordinal(213) => '213th'
    '''
    n = int(n)
    suffix = ['th', 'st', 'nd', 'rd', 'th'][min(n % 10, 4)]
    if 11 <= (n % 100) <= 13:
        suffix = 'th'
    return suffix


def make_odf_certificates(event, winners: 'List[Entry]'):

    now = datetime.datetime.now()
    games_iteration: 'int' = now.year - 1998

    competition_name: 'str' = event.long_name

    document = OpenDocumentDrawing()

    drawing_page = "DP1"
    drawing_page_style = Style(
      family="drawing-page",
      name=drawing_page,
    )
    document.automaticstyles.addElement(drawing_page_style)

    # Page layout style
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
    frame_style.addElement(GraphicProperties(
      fill='none',
      stroke='none',
      textareaverticalalign='middle',
    ))
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
    big_caslon_font_name = "Big Caslon"
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
    sponsors_paragraph_style = "sponsorsParagraphStyle"
    s = Style(
      name=sponsors_paragraph_style,
      family="paragraph",
      displayname="Big Caslon Pro 12pt",
    )
    s.addElement(ParagraphProperties(textalign="center"))
    s.addElement(TextProperties(
      fontname=big_caslon_pro_font_name,
      fontsize="12pt",
    ))
    styles.addElement(s)

    # TEXT - Big Caslon Pro 12pt Superscript
    big_caslon_pro_12pt_bold = "bigCaslon12ptBold"
    s = Style(
      name=big_caslon_pro_12pt_bold,
      family="text",
      displayname="Big Caslon Pro 12pt Bold",
    )
    s.addElement(TextProperties(
      fontname=big_caslon_pro_font_name,
      fontsize="12pt",
      fontweight="bold",
    ))
    styles.addElement(s)

    # TEXT - Big Caslon Pro 12pt Superscript
    big_caslon_pro_12pt_superscript = "bigCaslon12ptSuperscript"
    s = Style(
      name=big_caslon_pro_12pt_superscript,
      family="text",
      displayname="Big Caslon Pro 12pt Superscript",
    )
    s.addElement(TextProperties(
      fontname=big_caslon_pro_font_name,
      fontsize="12pt",
      textposition="33% 58%",
    ))
    styles.addElement(s)

    # TEXT - Big Caslon Pro 18pt
    big_caslon_pro_18pt = "bigCaslonPro18pt"
    s = Style(
      name=big_caslon_pro_18pt,
      family="text",
      displayname="Big Caslon Pro 18pt",
    )
    s.addElement(ParagraphProperties(textalign="center"))
    s.addElement(TextProperties(
      fontname=big_caslon_pro_font_name,
      fontsize="18pt"
    ))
    styles.addElement(s)

    # TEXT - Big Caslon Pro 18pt superscript
    big_caslon_pro_18pt_superscript = "bigCaslonPro18ptsuperscript"
    s = Style(
      name=big_caslon_pro_18pt_superscript,
      family="text",
      displayname="Big Caslon Pro 18pt Superscript",
    )
    s.addElement(TextProperties(
      fontname=big_caslon_pro_font_name,
      fontsize="18pt",
      textposition="33% 58%",
    ))
    styles.addElement(s)

    # Paragraph - Winners
    winners_paragraph_style = "winnersParagraphStyle"
    s = Style(
      name=winners_paragraph_style,
      family="paragraph",
      displayname="Big Caslon 22pt",
    )
    s.addElement(ParagraphProperties(
      textalign="center",
      lineheight="180%",
    ))
    s.addElement(TextProperties(
      fontname=big_caslon_font_name,
      fontsize="22pt",
    ))
    styles.addElement(s)

    # Paragraph - competition
    competition_paragraph_style = "competitionParagraphStyle"
    s = Style(
      name=competition_paragraph_style,
      family="paragraph",
      displayname="Big Caslon 22pt",
    )
    s.addElement(ParagraphProperties(
      textalign="center",
      lineheight="140%",
    ))
    s.addElement(TextProperties(
      fontname=big_caslon_font_name,
      fontsize="22pt",
    ))
    styles.addElement(s)

    # TEXT - Big Caslon 22pt Bold Style Name
    big_caslon_22pt_bold = "bigCaslon22ptBold"
    s = Style(
      name=big_caslon_22pt_bold,
      family="text",
      displayname="Big Caslon 22pt Bold",
    )
    s.addElement(TextProperties(
      fontname=big_caslon_font_name,
      fontsize="22pt",
      fontweight="bold",
    ))
    styles.addElement(s)

    # TEXT - Big Caslon Pro 22pt
    big_caslon_pro_22pt = "bigCaslonPro22pt"
    s = Style(
      name=big_caslon_pro_22pt,
      family="text",
      displayname="Big Caslon Pro 22pt",
    )
    s.addElement(TextProperties(
      fontname=big_caslon_pro_font_name,
      fontsize="22pt",
    ))
    styles.addElement(s)

    # TEXT - Big Caslon Pro 22pt superscript
    big_caslon_pro_22pt_superscript = "bigCaslonPro22ptSuperscript"
    s = Style(
      name=big_caslon_pro_22pt_superscript,
      family="text",
      displayname="Big Caslon Pro 22pt",
    )
    s.addElement(TextProperties(
      fontname=big_caslon_pro_font_name,
      fontsize="22pt",
      textposition="33% 58%",
    ))
    styles.addElement(s)

    # TEXT - Big Caslon Pro 22pt Bold
    big_caslon_pro_22pt_bold = "bigCaslonPro22ptbold"
    s = Style(
      name=big_caslon_pro_22pt_bold,
      family="text",
      displayname="Big Caslon Pro 22pt bold",
    )
    s.addElement(TextProperties(
      fontname=big_caslon_pro_font_name,
      fontsize="22pt",
      fontweight="bold",
    ))
    styles.addElement(s)

    # TEXT - Big Caslon Pro 22pt bold superscript
    big_caslon_pro_22pt_bold_superscript = "bigCaslonPro22ptboldSuperscript"
    s = Style(
      name=big_caslon_pro_22pt_bold_superscript,
      family="text",
      displayname="Big Caslon Pro 22pt bold superscript",
    )
    s.addElement(TextProperties(
      fontname=big_caslon_pro_font_name,
      fontsize="22pt",
      fontweight="bold",
      textposition="33% 58%",
    ))
    styles.addElement(s)

    # TEXT - Cooper Black 22pt
    cooper_black_22pt = "CooperBlack22pt"
    s = Style(
      name=cooper_black_22pt,
      family="text",
      displayname="Cooper Black 22pt",
    )
    s.addElement(TextProperties(
      fontname=cooper_black_font_name,
      fontsize="22pt",
    ))
    styles.addElement(s)

    # TEXT - Big Caslon Pro 26pt Bold Style Name
    big_caslon_pro_26pt_bold = "bigCaslonPro26ptBold"
    s = Style(
      name=big_caslon_pro_26pt_bold,
      family="text",
      displayname="Big Caslon Pro 26pt Bold",
    )
    s.addElement(TextProperties(
      fontname=big_caslon_pro_font_name,
      fontsize="26pt",
      fontweight="bold",
    ))
    styles.addElement(s)

    # TEXT - Big Caslon Pro 26pt Bold superscript Style Name
    big_caslon_pro_26pt_bold_superscript = "bigCaslonPro26ptBoldSuperScript"
    s = Style(
      name=big_caslon_pro_26pt_bold_superscript,
      family="text",
      displayname="Big Caslon Pro 26pt Bold",
    )
    s.addElement(TextProperties(
      fontname=big_caslon_pro_font_name,
      fontsize="26pt",
      fontweight="bold",
      textposition="33% 58%",
    ))
    styles.addElement(s)

    # Add in the robot logo picture.
    robot_logo_href = document.addPicture('robot.png')

    for i in range(len(winners)):
        place = i + 1

        # Create a page to contain the drawing
        page = Page(
          masterpagename=masterpage,
          name="page-" + str(place),
          stylename=drawing_page,
        )
        document.drawing.addElement(page)

        # Replace winner's information
        competitorname = winners[i].driver1
        robotname = '"' + winners[i].robotName + '"'

        # Add image
        photoframe = Frame(
          stylename=frame_style,
          width="2.08in",
          height="3.28in",
          x="1.75in",
          y="1.67in",
        )

        winner_frame = Frame(
          width="5.00in",
          height="4.50in",
          x="4.25in",
          y="1.00in",
          stylename=frame_style,
        )
        winner_text_box = TextBox()
        winner_frame.addElement(winner_text_box)

        competition_frame = Frame(
          width="8.50in",
          height="1.00in",
          x="1.25in",
          y="5.00in",
          stylename=frame_style,
        )
        competition_text_box = TextBox()
        competition_frame.addElement(competition_text_box)

        sponsors_frame = Frame(
          width="6.50in",
          height="1.34in",
          x="2.25in",
          y="6.00in",
          stylename=frame_style,
        )
        sponsors_text_box = TextBox()
        sponsors_frame.addElement(sponsors_text_box)

        page.addElement(photoframe)
        page.addElement(winner_frame)
        page.addElement(competition_frame)
        page.addElement(sponsors_frame)

        photoframe.addElement(Image(href=robot_logo_href))

        # Winner Information text box
        p = P(
          text="",
          stylename=winners_paragraph_style,
        )

        teletype.addTextToElement(p, "This is to certify that\n")
        p.addElement(Span(
          stylename=big_caslon_22pt_bold,
          text=competitorname
        ))
        teletype.addTextToElement(p, "\n")

        p.addElement(Span(
          stylename=big_caslon_pro_22pt, text="With\n"
        ))
        teletype.addTextToElement(p, "\n")

        p.addElement(Span(
          text=robotname,
          stylename=big_caslon_pro_26pt_bold,
        ))
        teletype.addTextToElement(p, "\n")

        p.addElement(Span(
          text="\ntook " + str(place),
          stylename=big_caslon_pro_22pt,
        ))

        p.addElement(Span(
          text=make_ordinal(place),
          stylename=big_caslon_pro_22pt_superscript,
        ))

        p.addElement(Span(
          text=" place in",
          stylename=big_caslon_pro_22pt,
        ))
        teletype.addTextToElement(p, "\n")

        p.addElement(Span(
          text=competition_name,
          stylename=big_caslon_pro_26pt_bold,
        ))

        winner_text_box.addElement(p)

        # Competition text box.
        p = P(
          text="",
          stylename=competition_paragraph_style,
        )

        p.addElement(Span(
          text=games_iteration,
          stylename=big_caslon_pro_22pt_bold,
        ))

        p.addElement(Span(
          text=make_ordinal(games_iteration),
          stylename=big_caslon_pro_22pt_bold_superscript,
        ))

        p.addElement(Span(
          text=" Annual ",
          stylename=big_caslon_pro_22pt,
        ))

        p.addElement(Span(
          text="Manitoba Robot Games",
          stylename=cooper_black_22pt,
        ))
        teletype.addTextToElement(p, "\n")

        p.addElement(Span(
          text="held " + calendar.month_name[now.month] + " " + str(now.day),
          stylename=big_caslon_pro_18pt,
        ))

        p.addElement(Span(
          text=make_ordinal(now.day),
          stylename=big_caslon_pro_18pt_superscript,
        ))

        p.addElement(Span(
          text=", " + str(now.year) + " at Tec Voc High School",
          stylename=big_caslon_pro_18pt,
        ))

        competition_text_box.addElement(p)

        # Sponsors text box
        p = P(
          text="",
          stylename=sponsors_paragraph_style,
        )
        teletype.addTextToElement(p, "The " + str(games_iteration))

        p.addElement(Span(
          text=make_ordinal(games_iteration),
          stylename=big_caslon_pro_12pt_superscript,
        ))

        teletype.addTextToElement(
          p,
          " Annual Manitoba Robot Games was made possible by\n"
          + "SCIENCE COUNCIL MANITOBA\n"
          + "and the generous support and "
          + "contributions of: CTTAM, EGM, Emergent BioSolutions, IEEE, "
        )

        teletype.addTextToElement(
          p,
          ", U of M Faculty of Engineering,\n"
          + "and the Winnipeg School Division."
        )
        sponsors_text_box.addElement(p)

    # Save document
    file_name = "./ScoreSheets/" + event.id + "-certificates"
    document.save(file_name, True)
    return file_name
