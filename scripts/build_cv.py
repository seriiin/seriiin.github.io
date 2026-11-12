"""Build the downloadable CV from the portfolio's existing content.

Run: python scripts/build_cv.py
Dependencies: reportlab, lxml (pip install reportlab lxml)
The final PDF is committed with the site; visitors need no Python or JavaScript.
"""

from datetime import date
from html import escape
from pathlib import Path
import argparse
from copy import deepcopy
import re
import shutil

from lxml import html
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import reportlab
from reportlab.platypus import HRFlowable, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
NAVY = colors.HexColor("#222d82")
INK = colors.HexColor("#263449")
MUTED = colors.HexColor("#5d647d")
LINE = colors.HexColor("#dce4ed")
SKY = colors.HexColor("#539ed4")
PAGE_WIDTH, PAGE_HEIGHT = A4
MARGIN = 17 * mm
# SimpleDocTemplate's frame has six points of padding on either side.
WIDTH = PAGE_WIDTH - 2 * MARGIN - 12
DATE_WIDTH = 88

# Embed the fonts bundled with ReportLab so every PDF viewer uses the same metrics.
FONT_DIR = Path(reportlab.__file__).parent / "fonts"
pdfmetrics.registerFont(TTFont("CVSans", str(FONT_DIR / "Vera.ttf")))
pdfmetrics.registerFont(TTFont("CVSans-Bold", str(FONT_DIR / "VeraBd.ttf")))
pdfmetrics.registerFontFamily("CVSans", normal="CVSans", bold="CVSans-Bold")


def by_class(node, name):
    return node.xpath(f'.//*[contains(concat(" ", normalize-space(@class), " "), " {name} ")]')


def text(node):
    node = deepcopy(node)
    for br in node.xpath('.//br'):
        br.tail = " " + (br.tail or "")
    value = "".join(node.itertext())
    return re.sub(r"\s+", " ", value).strip().replace("\u2013", "-").replace("\u2014", "-")


def first(node, class_name):
    return by_class(node, class_name)[0]


def plain(value):
    return escape(value)


def link(label, url):
    return f'<a href="{escape(url, quote=True)}" color="#222d82">{plain(label)}</a>'


STYLES = {
    "name": ParagraphStyle("name", fontName="Times-Roman", fontSize=32, leading=34, textColor=NAVY, spaceAfter=4),
    "role": ParagraphStyle("role", fontName="CVSans-Bold", fontSize=9.2, leading=13, textColor=INK, spaceAfter=2),
    "body": ParagraphStyle("body", fontName="CVSans", fontSize=8.6, leading=11.8, textColor=INK, spaceAfter=1),
    "muted": ParagraphStyle("muted", fontName="CVSans", fontSize=8, leading=11, textColor=MUTED, spaceAfter=1),
    "title": ParagraphStyle("title", fontName="CVSans-Bold", fontSize=9, leading=12.3, textColor=INK, spaceAfter=1),
    "date": ParagraphStyle("date", fontName="CVSans", fontSize=7.5, leading=11, textColor=MUTED, spaceAfter=2),
    "section": ParagraphStyle("section", fontName="CVSans-Bold", fontSize=10, leading=14, textColor=NAVY, spaceBefore=9, spaceAfter=3, keepWithNext=True),
    "subsection": ParagraphStyle("subsection", fontName="CVSans-Bold", fontSize=8.6, leading=12, textColor=MUTED, spaceBefore=7, spaceAfter=9, keepWithNext=True),
    "page-title": ParagraphStyle("page-title", fontName="Times-Roman", fontSize=27, leading=32, textColor=NAVY, spaceAfter=10, keepWithNext=True),
    "contacts": ParagraphStyle("contacts", fontName="CVSans", fontSize=7.8, leading=12, textColor=MUTED, spaceAfter=2),
    "paper-title": ParagraphStyle("paper-title", fontName="CVSans-Bold", fontSize=8.2, leading=10.8, textColor=INK, spaceAfter=2),
    "paper-body": ParagraphStyle("paper-body", fontName="CVSans", fontSize=6.8, leading=8.8, textColor=INK, spaceAfter=1.5),
    "paper-meta": ParagraphStyle("paper-meta", fontName="CVSans", fontSize=6.6, leading=8.6, textColor=MUTED, spaceAfter=1.5),
    "paper-date": ParagraphStyle("paper-date", fontName="CVSans", fontSize=6.6, leading=9, textColor=MUTED),
    "tools": ParagraphStyle("tools", fontName="CVSans", fontSize=6.8, leading=9.5, textColor=MUTED),
}


def p(value, style="body"):
    return Paragraph(value, STYLES[style])


def section(label):
    return [p(plain(label), "section"), HRFlowable(width="100%", thickness=.6, color=LINE, spaceAfter=5)]


def entry(when, title, details, *, gap=3, date_width=DATE_WIDTH, width=WIDTH, title_style="title", date_style="date"):
    content = [p(title, title_style)]
    content.extend(p(value, style) for value, style in details if value)
    date_label = "<br/>".join(plain(line) for line in when.splitlines())
    row = Table([[p(date_label, date_style), content]], colWidths=[date_width, width - date_width], hAlign="LEFT")
    row.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (0, 0), 8),
        ("RIGHTPADDING", (1, 0), (1, 0), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    row.spaceAfter = gap
    return row


def build(updated):
    document = html.fromstring((ROOT / "index.html").read_bytes())
    story = []
    role = text(first(document, "hero-role"))
    affiliation = text(first(document, "affiliation"))
    email = document.xpath('//a[starts-with(@href,"mailto:")]/@href')[0].removeprefix("mailto:")

    story.extend([
        p("Selin Choi", "name"), p(plain(role), "role"),
        p(plain(affiliation) + " · Daejeon, South Korea", "muted"),
        p(link(email, "mailto:" + email) + " &nbsp; / &nbsp; " + link("selinchoi.com", "https://selinchoi.com/")
          + " &nbsp; / &nbsp; " + link("Google Scholar", document.xpath('//a[contains(@href,"citations?user=")]/@href')[0])
          + " &nbsp; / &nbsp; " + link("GitHub", "https://github.com/seriiin")
          + " &nbsp; / &nbsp; " + link("LinkedIn", "https://www.linkedin.com/in/selinchoi/"), "contacts"),
        Spacer(1, 5), HRFlowable(width="100%", thickness=1.3, color=SKY, spaceAfter=8),
        p(plain(text(first(document, "intro")))),
        Spacer(1, 5),
    ])

    academic = section("Education")
    activities = section("Awards & scholarships")
    timelines = by_class(document, "timeline")
    for item in timelines[0].xpath('./li'):
        title = text(item.xpath('./h4')[0])
        if title.startswith("Ph.D.") and "Present" in text(first(item, "date")):
            title = "Ph.D. student in Culture Technology"
        details = [(plain(text(node)), "body" if i == 0 else "muted")
                   for i, node in enumerate(item.xpath('./p[not(@class="date")]'))]
        academic.append(entry(text(first(item, "date")), plain(title), details))

    academic.extend(section("Research experience"))
    for item in timelines[1].xpath('./li'):
        details = [(plain(text(node)), "body" if i == 0 else "muted")
                   for i, node in enumerate(item.xpath('./p[not(@class="date")]'))]
        academic.append(entry(text(first(item, "date")), plain(text(item.xpath('./h4')[0])), details))

    academic.extend(section("Research projects & funding"))
    funding = first(document, "funding-entry")
    program = first(funding, "funding-program").text.strip()
    academic.append(entry(first(funding, "funding-year").text.strip() + " · Selected", plain(program), [
        (plain(text(first(funding, "funding-details").xpath('./h4')[0])), "body"),
        (plain(text(first(funding, "funding-funder"))), "muted"),
    ]))
    for item in by_class(document, "project-entry"):
        details = [(plain(text(first(item, "project-role"))), "body")]
        details.extend((plain(text(node)), "muted") for node in by_class(item, "detail"))
        academic.append(entry(text(first(item, "date")), plain(text(item.xpath('./h4')[0])), details))

    for item in by_class(document, "award-row"):
        description = item.xpath('./p')[0]
        activities.append(entry(text(item.xpath('./span')[0]), plain(text(description.xpath('./strong')[0])), [
            (plain(text(description.xpath('./span')[0])), "body")
        ]))

    activities.extend(section("Teaching · KAIST"))
    for item in first(document, "teaching-courses").xpath('./li'):
        terms = "\n".join(value.strip() for value in item.xpath('./span')[0].itertext())
        activities.append(entry(terms, plain(text(item.xpath('./div/strong')[0])), [
            (plain(text(first(item, "course-code"))), "muted")
        ]))

    story.extend(academic)
    story.extend(activities)

    story.extend([PageBreak(), p("Publications", "page-title")])
    publications = by_class(document, "publication")
    for category, label in [("international", "International journals & conferences"), ("domestic", "Domestic conferences")]:
        story.append(p(label, "subsection"))
        for item in publications:
            if item.get("data-category") != category:
                continue
            body = first(item, "publication-body")
            authors = plain(text(first(item, "authors"))).replace("Selin Choi", "<b>Selin Choi</b>")
            venue = first(item, "venue")
            award = by_class(venue, "award-label")
            venue_text = plain((venue.text or "").strip().replace("\u2013", "-"))
            urls = body.xpath('.//a[starts-with(@href,"https://")]/@href')
            if urls:
                venue_text += " &nbsp; / &nbsp; " + link("Paper", urls[0])
            details = [(authors, "paper-body"), (venue_text, "paper-meta")]
            if award:
                details.append((plain(text(award[0])), "paper-meta"))
            story.append(entry(item.get("data-year"), plain(text(body.xpath('./h3')[0])), details,
                               gap=8, date_width=34, title_style="paper-title", date_style="paper-date"))

    story.extend([
        Spacer(1, 12),
        HRFlowable(width="100%", thickness=.5, color=LINE, spaceAfter=7),
        p("<b>Tools &amp; technologies</b> &nbsp; " + plain(text(first(document, "skills-line").xpath('./p')[0])), "tools"),
    ])

    output = ROOT / "output" / "pdf" / "Selin_Choi_CV.pdf"
    output.parent.mkdir(parents=True, exist_ok=True)
    draft = ROOT / "tmp" / "pdfs" / "Selin_Choi_CV.build.pdf"
    draft.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(str(draft), pagesize=A4, rightMargin=MARGIN, leftMargin=MARGIN,
                            topMargin=14 * mm, bottomMargin=15 * mm,
                            title="Selin Choi | Curriculum Vitae", author="Selin Choi",
                            subject="Academic curriculum vitae - AR/VR research", pageCompression=1)

    def page_frame(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(MUTED)
        canvas.setFont("CVSans", 7)
        if doc.page == 1:
            canvas.drawRightString(PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 17 * mm, "CURRICULUM VITAE")
        else:
            canvas.drawString(MARGIN, PAGE_HEIGHT - 10 * mm, "SELIN CHOI  /  CURRICULUM VITAE")
        canvas.setStrokeColor(LINE)
        canvas.setLineWidth(.5)
        canvas.line(MARGIN, 13 * mm, PAGE_WIDTH - MARGIN, 13 * mm)
        canvas.drawString(MARGIN, 8.5 * mm, "selinchoi.com")
        canvas.drawCentredString(PAGE_WIDTH / 2, 8.5 * mm, f"Updated {updated:%B %Y}")
        canvas.drawRightString(PAGE_WIDTH - MARGIN, 8.5 * mm, str(doc.page))
        canvas.restoreState()

    doc.build(story, onFirstPage=page_frame, onLaterPages=page_frame)
    if doc.page != 2:
        raise ValueError(f"Expected a two-page CV, got {doc.page}. Review the layout before publishing.")
    web_output = ROOT / "assets" / output.name
    shutil.copyfile(draft, output)
    shutil.copyfile(output, web_output)
    draft.unlink()
    print(f"Created {output.relative_to(ROOT)} and {web_output.relative_to(ROOT)}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--updated", type=date.fromisoformat, default=date.today(), help="CV revision date (YYYY-MM-DD)")
    build(parser.parse_args().updated)
