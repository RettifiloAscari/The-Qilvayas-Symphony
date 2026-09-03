#!/usr/bin/env bash
#
# Every check that should pass before a corpus change is committed, in one call.
#
#   tools/verify.sh            source and single-build checks (fast, ~2 min)
#   tools/verify.sh --full     the above, plus three builds and a byte comparison
#
# build.sh already fails on escape leaks and font substitution. This adds the
# checks it cannot make: source conventions, reproducibility across repeated
# builds, spoiler leaks into the player-facing documents, and column starvation.
#
# The Ghostscript trailer failure mode is intermittent, which is why --full builds
# three times rather than twice.
#
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
FULL=0
[[ "${1:-}" == "--full" ]] && FULL=1
fail=0

note() { printf '\n== %s\n' "$1"; }
ok()   { printf '   ok    %s\n' "$1"; }
bad()  { printf '   FAIL  %s\n' "$1"; fail=1; }

note "generators run (node --check validates syntax, not identifiers)"
for f in scripts/*.js; do
  g="$(basename "$f" .js)"
  node --check "$f" >/dev/null 2>&1 || { bad "$g: syntax"; continue; }
  ( cd scripts && node "$g.js" >/dev/null 2>&1 ) && ok "$g" || bad "$g: threw at runtime"
done

note "escape conventions in scripts/"
n=$(grep -Plc '[^\x00-\x7F]' scripts/*.js 2>/dev/null | wc -l)
[[ "$n" -eq 0 ]] && ok "no literal non-ASCII" || bad "$n file(s) contain literal non-ASCII - run tools/normalize_escapes.py"
n=$(grep -Plc "(\w)'(\w)" scripts/*.js 2>/dev/null | wc -l)
[[ "$n" -eq 0 ]] && ok "no straight apostrophes between word characters" || bad "$n file(s) have straight apostrophes"
n=$(grep -Plc '\\\\u[0-9a-fA-F]{4}' scripts/*.js 2>/dev/null | wc -l)
[[ "$n" -eq 0 ]] && ok "no doubled \\uXXXX escapes" || bad "$n file(s) have doubled escapes - these leak literal text into the PDF"

note "table columns"
out="$(python3 tools/check_columns.py 2>&1)"; rc=$?
printf '%s\n' "$out" | sed 's/^/   /'
if [[ $rc -ne 0 ]]; then bad "a column will certainly break mid-word - fix before committing"
elif grep -q 'likely' <<<"$out"; then printf '   note  a likely finding above: render that page and look\n'
else ok "no column will break"; fi

note "build"
if tools/build.sh >/tmp/qs_build.log 2>&1; then ok "$(grep -c 'pages  ok' /tmp/qs_build.log) documents built and verified clean"
else bad "build failed - see /tmp/qs_build.log"; fi

note "corpus and documents match scripts"
n=$(git status --porcelain corpus documents | wc -l)
[[ "$n" -eq 0 ]] && ok "no drift (a rebuild changed nothing uncommitted)" \
                 || printf '   note  %d generated file(s) changed by this build - commit them with the script change\n' "$n"

note "player-facing documents carry no DM material"
for f in corpus/QS_Player_Guide.md corpus/QS_Players_Companion.md; do
  [[ -f "$f" ]] || continue
  b="$(basename "$f")"
  dm=$(grep -ic 'DM Only\|DM note' "$f")
  mech=$(grep -ic 'the party\|the DM should\|pacing budget\|the module' "$f")
  spoil=$(grep -c 'Threnvos\|Undercourt\|Cold Door\|binding site\|Vosthren' "$f")
  if [[ "$dm" -eq 0 && "$mech" -eq 0 && "$spoil" -eq 0 ]]; then ok "$b"
  else bad "$b: DM=$dm mechanical=$mech spoiler=$spoil"; fi
done

if [[ $FULL -eq 1 ]]; then
  note "reproducibility: three builds, byte comparison"
  w="$(mktemp -d)"; trap 'rm -rf "$w"' EXIT
  mkdir -p "$w/1" "$w/2" "$w/3"
  cp documents/*.pdf "$w/1/"
  tools/build.sh >/dev/null 2>&1 && cp documents/*.pdf "$w/2/"
  tools/build.sh >/dev/null 2>&1 && cp documents/*.pdf "$w/3/"
  drift=0
  for p in "$w"/1/*.pdf; do
    b="$(basename "$p")"
    cmp -s "$w/1/$b" "$w/2/$b" && cmp -s "$w/2/$b" "$w/3/$b" || { bad "$b differs between builds"; drift=1; }
  done
  [[ $drift -eq 0 ]] && ok "all documents byte-identical across three builds"
fi

note "page census"
tp=0
for p in documents/*.pdf; do
  n=$(pdfinfo "$p" 2>/dev/null | awk '/^Pages:/{print $2}')
  printf '   %-52s %3s pages\n' "$(basename "$p" .pdf)" "$n"; tp=$((tp+n))
done
printf '   %-52s %3s pages\n' "TOTAL" "$tp"

echo
if [[ $fail -eq 0 ]]; then echo "==> verified clean"; else echo "==> VERIFICATION FAILED"; fi
exit $fail
