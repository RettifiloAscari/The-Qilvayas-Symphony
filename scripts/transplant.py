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
