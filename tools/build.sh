#!/usr/bin/env bash
#
# Regenerate the entire Qilvayas Symphony corpus from the generator scripts.
#
#   corpus/      markdown  — the scripts run through tools/docx-md-shim
#   documents/   PDF       — docx-js -> template (transplant.py) -> LibreOffice
#                            -> tools/normalize_pdf.py
#
# The .docx is a build intermediate, never committed. PDF is the deliverable:
# it embeds its fonts, so it reads identically on any device, and the normalize
# pass makes it byte-reproducible, so an unchanged document produces an unchanged
# file and the git history stays clean.
#
# Both outputs come from the same untouched scripts, so they cannot drift apart.
# Nothing in corpus/ or documents/ is ever edited by hand: edit scripts/ instead.
#
# Usage:  tools/build.sh [--no-verify]
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPTS="$ROOT/scripts"
SHIM="$ROOT/tools/docx-md-shim"
DOCS="$ROOT/documents"
CORPUS="$ROOT/corpus"
NORMALIZE="$ROOT/tools/normalize_pdf.py"
VERIFY=1
[[ "${1:-}" == "--no-verify" ]] && VERIFY=0

# Where the generators stage their .docx build intermediate. They read this from
# $QS_STAGE via scripts/stage.js and fall back to <repo>/.stage when run standalone,
# so the path is a parameter rather than a constant repeated in nine files.
STAGE="${QS_STAGE:-$ROOT/.stage}"
export QS_STAGE="$STAGE"
mkdir -p "$STAGE" "$DOCS" "$CORPUS"

GENERATORS=(campaign gazetteer companion sessions session34 s56 s78 refguide playerguide)
# Only the DM Reference Guide stays single-column; its value is wide tables.
SINGLE_COL_MATCH="QS_DM_Reference_Guide"

# There is deliberately no Ghostscript pass. It used to sit between LibreOffice and
# normalize_pdf.py to collapse LibreOffice's nondeterministic font subsetting, but
# pdfwrite rebuilds every embedded font and loses the ToUnicode entries for the
# ligature glyphs while doing it: the page still LOOKED right, and the text layer
# underneath read "OfÏce" for Office and "getÝng" for getting -- 328 corrupted words
# across the thirteen documents, so searching a published PDF for "Office of Omens"
# found nothing. normalize_pdf.py already canonicalises the subset tags that were the
# real source of run-to-run churn, and three builds are byte-identical without gs, so
# the pass bought nothing that survived it. The PDFs are about half again larger
# without gs's recompression; correct, searchable text is worth the megabyte.

banner() { # $1 = source script basename
  printf '%s\n' '<!-- GENERATED FILE - DO NOT EDIT.'
  printf '%s\n' "     Source:     scripts/$1"
  printf '%s\n' '     Regenerate: tools/build.sh'
  printf '%s\n' '     Hand edits here are overwritten and never reach the published documents.'
  printf '%s\n\n' '-->'
}

echo "==> checking prerequisites"
command -v node >/dev/null    || { echo "FATAL: node not found"; exit 1; }
command -v python3 >/dev/null || { echo "FATAL: python3 not found"; exit 1; }
node -e "require('docx')" 2>/dev/null || { echo "FATAL: 'docx' not installed - run: npm install docx"; exit 1; }
command -v soffice >/dev/null || { echo "FATAL: soffice not found - apt-get install libreoffice-writer"; exit 1; }
if [[ $VERIFY -eq 1 ]]; then
  command -v pdftotext >/dev/null || { echo "FATAL: pdftotext not found - apt-get install poppler-utils"; exit 1; }
  for f in "Alegreya SC" "Alegreya Sans SC" "Lato"; do
    fc-match "$f" 2>/dev/null | grep -qi dejavu && \
      { echo "FATAL: font '$f' is not installed - layout verification would be meaningless"; exit 1; }
  done
fi

echo "==> generating markdown (scripts via the docx shim)"
rm -f "$STAGE"/*.docx "$STAGE"/*.md
for g in "${GENERATORS[@]}"; do
  node -e "
    const M=require('module'), orig=M._resolveFilename;
    M._resolveFilename=function(r,...a){ return r==='docx' ? require.resolve('$SHIM') : orig.call(this,r,...a); };
    require('$SCRIPTS/$g.js');
  " >/dev/null
  # the shim writes markdown bytes into the .docx filenames the scripts expect
  for f in "$STAGE"/*.docx; do
    [[ -e "$f" ]] || continue
    if ! head -c2 "$f" | grep -q PK; then
      base="$(basename "${f%.docx}")"
      { banner "$g.js"; cat "$f"; } > "$CORPUS/$base.md"
      rm -f "$f"
    fi
  done
done
echo "    $(ls -1 "$CORPUS"/*.md | wc -l) markdown files -> corpus/"

echo "==> generating documents (docx-js -> template -> PDF)"
WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT
rm -f "$STAGE"/*.docx "$DOCS"/*.docx "$DOCS"/*.pdf
for g in "${GENERATORS[@]}"; do
  ( cd "$SCRIPTS" && node "$g.js" >/dev/null )
done
for f in "$STAGE"/*.docx; do
  base="$(basename "${f%.docx}")"
  args=()
  [[ "$base" == *"$SINGLE_COL_MATCH"* ]] && args+=(--single)
  ( cd "$SCRIPTS" && python3 transplant.py "$f" "$WORK/$base.docx" "${args[@]}" >/dev/null )
  # styled docx -> PDF (LibreOffice) -> reproducible PDF (normalize)
  soffice --headless -env:UserInstallation="file://$WORK/lo" \
          --convert-to pdf --outdir "$WORK" "$WORK/$base.docx" >/dev/null 2>&1 || true
  # soffice swallows its own failures above, so say so here rather than letting the
  # next step fail on a file that was never written.
  [[ -s "$WORK/$base.pdf" ]] || { echo "FATAL: LibreOffice produced no PDF for $base"; exit 1; }
  cp "$WORK/$base.pdf" "$DOCS/$base.pdf"
  python3 "$NORMALIZE" "$DOCS/$base.pdf"
done
rm -rf "$SCRIPTS/work_tpl" "$SCRIPTS/work_src" "$SCRIPTS/_template_decoded.docx"
echo "    $(ls -1 "$DOCS"/*.pdf | wc -l) PDFs -> documents/"

if [[ $VERIFY -eq 0 ]]; then echo "==> verification skipped"; exit 0; fi

echo "==> verifying the published PDFs"
fail=0
for pdf in "$DOCS"/*.pdf; do
  base="$(basename "${pdf%.pdf}")"
  leaks=$(pdftotext "$pdf" - 2>/dev/null | grep -c '\\u' || true)
  subst=$(pdffonts "$pdf" 2>/dev/null | grep -c DejaVu || true)
  pages=$(pdfinfo "$pdf" 2>/dev/null | awk '/^Pages/{print $2}')
  status="ok"
  [[ "$leaks" -ne 0 ]] && { status="ESCAPE LEAKS: $leaks"; fail=1; }
  [[ "$subst" -ne 0 ]] && { status="$status; FONT SUBSTITUTION: $subst"; fail=1; }
  printf "    %-52s %3s pages  %s\n" "$base" "$pages" "$status"
done
[[ $fail -eq 0 ]] && echo "==> all documents verified clean" || { echo "==> VERIFICATION FAILED"; exit 1; }
