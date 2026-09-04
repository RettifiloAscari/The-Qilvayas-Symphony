#!/usr/bin/env python3
"""Transplant QS document content into the DnD 5e Style Template package."""
import re, shutil, zipfile, os, sys

# --- self-bootstrapping template location ---
# Looks for an already-extracted template dir; if absent, extracts it from the
# .docx sitting alongside this script (or in the project/uploads directories).
_HERE = os.path.dirname(os.path.abspath(__file__))
TPL = os.path.join(_HERE, "tpl", "DnD_5e_StyleTemplate")

def _decode_template(md_path):
    """Rebuild the template .docx from a base64-encoded markdown carrier."""
    import base64
    txt = open(md_path, encoding="utf-8").read()
    m = re.search(r"```base64\s*(.*?)```", txt, re.S)
    if not m:
        return None
    raw = base64.b64decode("".join(m.group(1).split()))
    tmp = os.path.join(_HERE, "_template_decoded.docx")
    open(tmp, "wb").write(raw)
    return tmp

if not os.path.exists(os.path.join(TPL, "word", "document.xml")):
    # Prefer a real .docx if one is present (chat upload retains binaries);
    # otherwise decode the base64 carrier, which is what survives project storage.
    _docx = [
        os.path.join(_HERE, "DnD_5e_StyleTemplate.docx"),
        "/mnt/user-data/uploads/DnD_5e_StyleTemplate.docx",
    ]
    _b64 = [
        os.path.join(_HERE, "QS_Style_Template_encoded.md"),
        "/mnt/project/QS_Style_Template_encoded.md",
        "/mnt/user-data/uploads/QS_Style_Template_encoded.md",
    ]
    _src = None
    for p in _docx:
        if os.path.exists(p):
            try:
                zipfile.ZipFile(p).namelist()   # must be a real zip, not text
                _src = p
                break
            except Exception:
                pass
    if _src is None:
        for p in _b64:
            if os.path.exists(p):
                _src = _decode_template(p)
                if _src:
                    break
    if _src is None:
        raise SystemExit(
            "Template not found. Provide QS_Style_Template_encoded.md (project "
            "knowledge) or a genuine DnD_5e_StyleTemplate.docx (chat upload)."
        )
    os.makedirs(TPL, exist_ok=True)
    with zipfile.ZipFile(_src) as _z:
        _z.extractall(TPL)

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"

# --- read template plumbing ---
tpl_doc = open(f"{TPL}/word/document.xml", encoding="utf-8").read()
tpl_rels = open(f"{TPL}/word/_rels/document.xml.rels", encoding="utf-8").read()

# footer1 rId
m = re.search(r'Id="(rId\d+)"[^>]*Target="footer1\.xml"', tpl_rels)
FOOTER_RID = m.group(1)

# template margins from its second (content) sectPr
sects = re.findall(r"<w:sectPr.*?</w:sectPr>", tpl_doc, re.S)
mg = re.search(r"<w:pgMar[^>]*/>", sects[1] if len(sects) > 1 else sects[0])
PGMAR = mg.group(0)
PGSZ = '<w:pgSz w:h="16838" w:w="11906" w:orient="portrait"/>'

def sect_xml(cols, with_footer):
    foot = (f'<w:footerReference w:type="default" r:id="{FOOTER_RID}"/>'
            f'<w:footerReference w:type="even" r:id="{FOOTER_RID}"/>') if with_footer else ""
    c = f'<w:cols w:num="{cols}" w:space="360"/>' if cols > 1 else '<w:cols w:num="1"/>'
    return foot + PGSZ + PGMAR + c

# --- breathing room under a table ---
# A table carries no "space after" in OOXML, and the body paragraphs are authored with
# spacing.after only, so prose immediately following a table butts against its bottom
# border with no gap at all. Headings already look right, because their style supplies
# spacing.before -- which is why the defect only ever showed up on table-then-prose and
# never on table-then-heading.
#
# Fixing it here rather than in the generators is deliberate: table() returns a single
# Table object, so a per-call fix would mean changing every call site in every generator
# (forty-four in one repository, seventy-one in the other) and remembering it forever
# after. One pass over the assembled XML covers every table, including any added later.
TABLE_GAP = 180   # twips; a shade under the 200 that separates two body paragraphs

_PARA_AFTER_TBL = re.compile(r'(</w:tbl>\s*)(<w:p\b(?:(?!</w:p>).)*?</w:p>)', re.S)
_IS_HEADING = re.compile(r'w:pStyle w:val="(Heading\d|Title|Subtitle)"')
_SPACING = re.compile(r'<w:spacing\b([^/>]*)/>')
_TEXT = re.compile(r'<w:t[^>]*>([^<]*)</w:t>')

# docx-js stamps every numbered paragraph with <w:pStyle w:val="ListParagraph"/>, and the
# visual template defines no such style. LibreOffice answers the dangling reference by
# dropping the numbering along with it: no glyph, no hanging indent, and the bullet renders
# as an ordinary body paragraph carrying the first-line indent docDefaults gives everything.
# Every bullet in the corpus was doing this, in all thirteen documents, invisibly -- the
# Markdown half of the build reads the numbering property directly and emits "- " either
# way, so corpus and PDF disagreed and only the PDF was wrong.
#
# The style therefore has to exist for the numbering to survive the transplant. It sets no
# left or hanging of its own, so the measure stays where each generator declares it, and it
# zeroes the inherited first-line indent, which would otherwise push the glyph's own line
# out of the hang it is supposed to sit in.
LIST_STYLE = (
    '<w:style w:type="paragraph" w:styleId="ListParagraph">'
    '<w:name w:val="List Paragraph"/><w:basedOn w:val="Normal"/><w:qFormat/>'
    '<w:pPr><w:ind w:firstLine="0"/><w:contextualSpacing/></w:pPr>'
    '</w:style>'
)

def ensure_list_style(work):
    """Give the template the ListParagraph style docx-js's bullets refer to."""
    path = os.path.join(work, "word", "styles.xml")
    s = open(path, encoding="utf-8").read()
    if 'w:styleId="ListParagraph"' in s:
        return
    open(path, "w", encoding="utf-8").write(
        s.replace("</w:styles>", LIST_STYLE + "</w:styles>", 1))

# A heading is bound to what follows it by keepNext, in the template's heading styles
# and again directly on every H1/H2/H3 the generators emit. That guarantees exactly one
# line, which is enough while the paragraph beneath is ordinary prose: it runs to several
# lines, and the Normal style's orphan control (2) keeps two of them with the heading or
# moves the lot.
#
# It is not enough when the paragraph beneath is a single line -- a gazetteer entry's
# "Population 6,000. Four days east of Aenodira.", a locator, a one-line gloss. There is
# no second line for orphan control to hold back, the chain ends at that line, and the
# section's actual content starts in the next column. The heading then sits at the foot of
# a column with a scrap under it, which is the defect this fixes: bind the short lead
# forward too, so the heading keeps its first real line of prose as well.
#
# Only short paragraphs qualify. About 55 characters fill the 3.36in two-column measure at
# 11pt, so 110 is at most two lines there and fewer on the Reference Guide's wide one.
# Above that the paragraph brings its own two lines and needs no help; binding it would
# only pin its last line to the next paragraph for nothing.
LEAD_MAX = 110
_HEAD_THEN_LEAD = re.compile(
    r'(<w:p\b(?:(?!</w:p>).)*?w:pStyle w:val="Heading\d"(?:(?!</w:p>).)*?</w:p>\s*)'
    r'(<w:p\b(?:(?!</w:p>).)*?</w:p>)', re.S)

def keep_lead_with_heading(doc):
    """Bind a one-line paragraph under a heading to the paragraph after it."""
    def fix(m):
        head, lead = m.group(1), m.group(2)
        if _IS_HEADING.search(lead) or 'w:keepNext' in lead:
            return m.group(0)
        text = ''.join(_TEXT.findall(lead)).strip()
        if not text or len(text) > LEAD_MAX:
            return m.group(0)
        ppr = re.search(r'<w:pPr>', lead)
        if ppr:
            # keepNext follows pStyle in the pPr child order the schema fixes
            style = re.search(r'<w:pStyle\b[^/]*/>', lead)
            at = style.end() if style else ppr.end()
            lead = lead[:at] + '<w:keepNext/>' + lead[at:]
        else:
            open_tag = re.match(r'<w:p\b[^>]*>', lead)
            lead = (lead[:open_tag.end()] + '<w:pPr><w:keepNext/></w:pPr>'
                    + lead[open_tag.end():])
        return head + lead
    return _HEAD_THEN_LEAD.sub(fix, doc)

def gap_after_tables(doc):
    """Give the first paragraph after each table a space-before."""
    def fix(m):
        head, para = m.group(1), m.group(2)
        if _IS_HEADING.search(para):
            return m.group(0)          # its style already supplies the gap
        if 'w:before=' in para:
            return m.group(0)          # author asked for something specific; respect it
        if not ''.join(_TEXT.findall(para)).strip():
            # A blank paragraph IS already the gap. The stat-block helper pushes one after
            # its ability table, and it emits <w:t></w:t> rather than no run at all, so the
            # test has to be on the text content and not on the tag.
            return m.group(0)
        s = _SPACING.search(para)
        if s:
            # add the attribute to the spacing element that is already there
            para = para[:s.start()] + '<w:spacing w:before="%d"%s/>' % (TABLE_GAP, s.group(1)) + para[s.end():]
        else:
            open_tag = re.match(r'<w:p\b[^>]*>', para)
            if '<w:pPr>' in para:
                para = para.replace('<w:pPr>', '<w:pPr><w:spacing w:before="%d"/>' % TABLE_GAP, 1)
            else:
                para = (para[:open_tag.end()]
                        + '<w:pPr><w:spacing w:before="%d"/></w:pPr>' % TABLE_GAP
                        + para[open_tag.end():])
        return head + para
    return _PARA_AFTER_TBL.sub(fix, doc)

def convert(src, dst, two_col=True):
    work = os.path.join(_HERE, "work_tpl")
    shutil.rmtree(work, ignore_errors=True)
    shutil.copytree(TPL, work)

    # bring in OUR content + numbering
    srcdir = os.path.join(_HERE, "work_src")
    shutil.rmtree(srcdir, ignore_errors=True)
    os.makedirs(srcdir)
    with zipfile.ZipFile(src) as z:
        z.extractall(srcdir)
    doc = open(f"{srcdir}/word/document.xml", encoding="utf-8").read()
    shutil.copy(f"{srcdir}/word/numbering.xml", f"{work}/word/numbering.xml")
    ensure_list_style(work)

    # --- section surgery on our document.xml ---
    # replace final sectPr with template-derived one (continuous so body starts on the title page)
    cont = '<w:type w:val="continuous"/>' if two_col else ''
    doc = re.sub(r"<w:sectPr.*?</w:sectPr>",
                 "<w:sectPr>" + cont + sect_xml(2 if two_col else 1, True) + "</w:sectPr>",
                 doc, count=1, flags=re.S)

    # restyle title block: first paragraph -> Title style, second -> Subtitle
    paras = list(re.finditer(r"<w:p\b.*?</w:p>", doc, re.S))
    def restyle(pblock, style):
        blk = pblock
        blk = re.sub(r"<w:sz w:val=\"\d+\"/>", "", blk)
        blk = re.sub(r"<w:szCs w:val=\"\d+\"/>", "", blk)
        blk = re.sub(r"<w:b/>", "", blk)
        if "<w:pPr>" in blk:
            blk = blk.replace("<w:pPr>", '<w:pPr><w:pStyle w:val="%s"/>' % style, 1)
        else:
            blk = blk.replace(">", '><w:pPr><w:pStyle w:val="%s"/></w:pPr>' % style, 1)
        return blk
    if len(paras) >= 2:
        p0, p1 = paras[0].group(0), paras[1].group(0)
        doc = doc.replace(p0, restyle(p0, "Title"), 1)
        doc = doc.replace(p1, restyle(p1, "Subtitle"), 1)

    doc = gap_after_tables(doc)
    doc = keep_lead_with_heading(doc)

    # ability-table cells: sz 20 -> 17 so headers fit two-column width
    doc = doc.replace('<w:sz w:val="20"/>', '<w:sz w:val="17"/>')

    if two_col:
        # insert a single-column section break before the FIRST Heading1 paragraph
        h1 = re.search(r'<w:p\b[^>]*>(?:(?!</w:p>).)*?w:val="Heading1"', doc, re.S)
        if h1:
            brk = ('<w:p><w:pPr><w:sectPr>' + sect_xml(1, True) + '</w:sectPr></w:pPr></w:p>')
            doc = doc[:h1.start()] + brk + doc[h1.start():]

    open(f"{work}/word/document.xml", "w", encoding="utf-8").write(doc)

    # --- repackage ---
    if os.path.exists(dst):
        os.remove(dst)
    with zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED) as z:
        for root, _, files in os.walk(work):
            for f in files:
                full = os.path.join(root, f)
                arc = os.path.relpath(full, work)
                z.write(full, arc)
    print("converted:", os.path.basename(dst))

if __name__ == "__main__":
    src, dst = sys.argv[1], sys.argv[2]
    two_col = "--single" not in sys.argv
    convert(src, dst, two_col)
