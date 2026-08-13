#!/usr/bin/env bash
#
# Regenerate the entire Qilvayas Symphony corpus from the generator scripts.
#
#   documents/   styled .docx  — docx-js, then the template via transplant.py
#   corpus/      markdown      — the same scripts run through tools/docx-md-shim
#
# Both outputs come from the same untouched scripts, so they cannot drift apart.
# Nothing in documents/ or corpus/ is ever edited by hand: edit scripts/ instead.
#
# Usage:  tools/build.sh [--no-verify]
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPTS="$ROOT/scripts"
SHIM="$ROOT/tools/docx-md-shim"
DOCS="$ROOT/documents"
CORPUS="$ROOT/corpus"
VERIFY=1
[[ "${1:-}" == "--no-verify" ]] && VERIFY=0

# The generator scripts write to a hardcoded /home/claude. They are kept
# byte-identical to the copies in the Claude Chat project so files round-trip
# between the two surfaces without edits, so the path is accommodated, not patched.
STAGE=/home/claude
mkdir -p "$STAGE" "$DOCS" "$CORPUS"

GENERATORS=(campaign_v11 sessions session34 s56 s78 refguide playerguide)
# Only the DM Reference Guide stays single-column; its value is wide tables.
SINGLE_COL_MATCH="QS_DM_Reference_Guide"

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
if [[ $VERIFY -eq 1 ]]; then
  command -v soffice >/dev/null    || { echo "FATAL: soffice not found - apt-get install libreoffice-writer"; exit 1; }
  command -v pdftotext >/dev/null  || { echo "FATAL: pdftotext not found - apt-get install poppler-utils"; exit 1; }
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

echo "==> generating documents (docx-js + template transplant)"
rm -f "$STAGE"/*.docx
for g in "${GENERATORS[@]}"; do
  ( cd "$SCRIPTS" && node "$g.js" >/dev/null )
done
for f in "$STAGE"/*.docx; do
  base="$(basename "$f")"
  args=()
  [[ "$base" == *"$SINGLE_COL_MATCH"* ]] && args+=(--single)
  ( cd "$SCRIPTS" && python3 transplant.py "$f" "$DOCS/$base" "${args[@]}" >/dev/null )
done
rm -rf "$SCRIPTS/work_tpl" "$SCRIPTS/work_src" "$SCRIPTS/_template_decoded.docx"
echo "    $(ls -1 "$DOCS"/*.docx | wc -l) documents -> documents/"

if [[ $VERIFY -eq 0 ]]; then echo "==> verification skipped"; exit 0; fi

echo "==> verifying renders"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
fail=0
for f in "$DOCS"/*.docx; do
  base="$(basename "${f%.docx}")"
  soffice --headless -env:UserInstallation="file://$TMP/lo" \
          --convert-to pdf --outdir "$TMP" "$f" >/dev/null 2>&1 || true
  pdf="$TMP/$base.pdf"
  if [[ ! -f "$pdf" ]]; then echo "    FAIL  $base - did not render"; fail=1; continue; fi
  leaks=$(pdftotext "$pdf" - 2>/dev/null | grep -c '\\u' || true)
  subst=$(pdffonts "$pdf" 2>/dev/null | grep -c DejaVu || true)
  pages=$(pdfinfo "$pdf" 2>/dev/null | awk '/^Pages/{print $2}')
  status="ok"
  [[ "$leaks" -ne 0 ]] && { status="ESCAPE LEAKS: $leaks"; fail=1; }
  [[ "$subst" -ne 0 ]] && { status="$status; FONT SUBSTITUTION: $subst"; fail=1; }
  printf "    %-52s %3s pages  %s\n" "$base" "$pages" "$status"
done
[[ $fail -eq 0 ]] && echo "==> all documents verified clean" || { echo "==> VERIFICATION FAILED"; exit 1; }
