/*
  comment-unused-css.js
  Reads `unused-report.json` and comments out candidate CSS rule blocks in-place.

  Safety measures:
  - Creates a backup copy of every modified CSS file named `<file>.bak.timestamp`.
  - Only operates on candidates where `rule` is non-null and looks like a complete selector+body fragment.
  - Attempts to match the rule followed by the closing '}' and removes the whole block.
  - Logs skipped candidates for manual review.

  Usage:
    node scripts/comment-unused-css.js --report=unused-report.json

  Review the console output and the backups before committing.
*/

const fs = require('fs');
const path = require('path');

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function findAndRemove(content, ruleText) {
  // We expect ruleText to be like ".selector { ..." without trailing '}'
  // Build a regex to find the rule block up to the matching '}' (first occurrence)
  const pat = escapeRegex(ruleText) + '\\s*\\}';
  const re = new RegExp(pat, 'm');
  const m = content.match(re);
  if (!m) return null;
  const found = m[0];
  // Remove the matched block entirely. Preserve a single newline to keep file readable.
  const newContent = content.replace(re, '\n');
  return { newContent, found };
}

function looksSafe(ruleText) {
  if (!ruleText) return false;
  // skip tiny fragments
  if (ruleText.length < 25) return false;
  // skip selectors that are probably generated numbers like ".3s" or ".98" (report had many)
  const sel = ruleText.split('{')[0].trim();
  if (/^[.#]?\d/.test(sel)) return false;
  return true;
}

async function main() {
  const argv = process.argv.slice(2);
  const reportArg = argv.find(a => a.startsWith('--report='));
  const reportFile = reportArg ? reportArg.split('=')[1] : 'unused-report.json';
  if (!fs.existsSync(reportFile)) {
    console.error('Report file not found:', reportFile);
    process.exit(1);
  }
  const report = readJSON(reportFile);
  const candidates = report.candidates || [];

  // Group candidates by cssFile
  const byFile = {};
  for (const c of candidates) {
    if (!c.rule) continue; // skip null rules
    if (!looksSafe(c.rule)) continue; // skip unsafe fragments
    const file = c.cssFile;
    if (!byFile[file]) byFile[file] = [];
    // store unique rule strings
    if (!byFile[file].some(x => x.rule === c.rule)) byFile[file].push({ selector: c.selector, rule: c.rule });
  }

  const summary = { modified: [], skipped: [], errors: [] };

  for (const [file, entries] of Object.entries(byFile)) {
    if (!fs.existsSync(file)) {
      summary.errors.push({ file, reason: 'file-not-found' });
      continue;
    }
    let content = fs.readFileSync(file, 'utf8');
    const backupName = file + '.bak.' + timestamp();
    fs.writeFileSync(backupName, content, 'utf8');
    let modified = false;
    const details = [];
    for (const e of entries) {
      try {
        const result = findAndRemove(content, e.rule);
        if (result && result.newContent) {
          content = result.newContent;
          modified = true;
          details.push({ selector: e.selector, status: 'removed' });
        } else {
          summary.skipped.push({ file, selector: e.selector, reason: 'pattern-not-found' });
        }
      } catch (err) {
        summary.errors.push({ file, selector: e.selector, reason: String(err) });
      }
    }
    if (modified) {
      fs.writeFileSync(file, content, 'utf8');
      summary.modified.push({ file, backup: backupName, details });
    } else {
      // If nothing modified, remove backup to avoid noise
      try { fs.unlinkSync(backupName); } catch (_) {}
    }
  }

  console.log('Comment-unused-css completed (removal mode). Summary:');
  console.log(JSON.stringify(summary, null, 2));
  console.log('\nPlease review backups for each modified file before committing.');
}

main().catch(e => { console.error('Fatal', e); process.exit(2); });
