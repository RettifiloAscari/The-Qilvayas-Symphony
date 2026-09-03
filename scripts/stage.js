// Where generators write their .docx build intermediate.
//
// This used to be a hardcoded /home/claude in every generator -- a leftover from
// when the scripts round-tripped to a second surface. Hardcoding it meant the path
// could only be changed in all generators at once, and a generator missed in that
// pass writes somewhere nothing reads, producing a partial corpus silently. It is
// a parameter now. Ported from the sister repository, which solved this first.
//
// Resolution order:
//   1. $QS_STAGE     -- what tools/build.sh sets
//   2. <repo>/.stage -- so `node scripts/<gen>.js` works standalone
//
// The directory holds build intermediates only. It is gitignored, and
// tools/build.sh clears it before each run.

const fs = require('fs');
const path = require('path');

const STAGE = process.env.QS_STAGE || path.join(__dirname, '..', '.stage');

// Resolve a filename inside the stage directory, creating the directory if needed.
function stagePath(filename) {
  fs.mkdirSync(STAGE, { recursive: true });
  return path.join(STAGE, filename);
}

module.exports = { STAGE, stagePath };
