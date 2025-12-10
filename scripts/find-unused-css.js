/*
  find-unused-css.js
  Simple scanner to find possibly-unused CSS class and id selectors in the project.

  How it works (best-effort):
  - Parses .css files under ./src/ to extract class selectors (.foo) and id selectors (#bar).
  - Scans project files (.html, .js, .ts, .jsx, .tsx) under project root for literal occurrences
    of the selector name (e.g. "foo" or "#bar"), including in strings and attributes.
  - Produces a JSON report listing candidates that were NOT found anywhere (possible unused).

  Limitations / warnings:
  - This tool is heuristic. It can produce false positives for selectors that are dynamically
    constructed at runtime (e.g. `element.classList.add('prefix-' + id)`), or used by
    third-party libraries by pattern. Always review the report before deleting CSS.
  - It intentionally does NOT modify any files. After you review the report and confirm,
    we can produce a patch to comment or remove specific rules.

  Usage:
    node scripts/find-unused-css.js > unused-report.json

  Node: no external dependencies required. Run from project root.
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src');

const CSS_EXT = '.css';
const SEARCH_FILE_EXTS = ['.html', '.js', '.ts', '.jsx', '.tsx'];

async function walk(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules' || ent.name === '.git') continue;
      files.push(...await walk(full));
    } else if (ent.isFile()) {
      files.push(full);
    }
  }
  return files;
}

function extractSelectorsFromCss(text) {
  // split by { to get selector groups (naive but practical)
  const candidates = new Set();
  const parts = text.split('{');
  for (let i = 0; i < parts.length - 1; i++) {
    const sel = parts[i].trim();
    // selectors might be comma separated; keep each chunk
    const groups = sel.split(',');
    for (let g of groups) {
      g = g.trim();
      // find class selectors and id selectors in the group
      const classRe = /\.([A-Za-z0-9_:\-]+)/g; // allow pseudo-class like :-- etc
      const idRe = /#([A-Za-z0-9_\-]+)/g;
      let m;
      while ((m = classRe.exec(g)) !== null) {
        candidates.add({ type: 'class', name: m[1], raw: '.' + m[1] });
      }
      while ((m = idRe.exec(g)) !== null) {
        candidates.add({ type: 'id', name: m[1], raw: '#' + m[1] });
      }
    }
  }
  return Array.from(candidates);
}

function readFileSyncSafe(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (e) {
    return '';
  }
}

(async function main(){
  try {
    const allFiles = await walk(SRC_DIR);
    const cssFiles = allFiles.filter(f => path.extname(f).toLowerCase() === CSS_EXT);
    const searchFiles = allFiles.filter(f => SEARCH_FILE_EXTS.includes(path.extname(f).toLowerCase()));

    const selectorsByFile = {};
    for (const cssFile of cssFiles) {
      const txt = readFileSyncSafe(cssFile);
      const sels = extractSelectorsFromCss(txt);
      if (sels.length) selectorsByFile[cssFile] = sels;
    }

    // load search files content
    const searchContents = {};
    for (const sf of searchFiles) {
      searchContents[sf] = readFileSyncSafe(sf);
    }

    const report = { generatedAt: new Date().toISOString(), candidates: [] };

    for (const [cssFile, sels] of Object.entries(selectorsByFile)) {
      const cssText = readFileSyncSafe(cssFile);
      // For better context, map selectors to their rule block text
      const blocks = cssText.split('}');
      const blockMap = {};
      for (const block of blocks) {
        const i = block.indexOf('{');
        if (i === -1) continue;
        const sel = block.slice(0, i).trim();
        const body = block.slice(i + 1).trim();
        // gather class/id names present in sel
        const classRe = /\.([A-Za-z0-9_:\-]+)/g;
        const idRe = /#([A-Za-z0-9_\-]+)/g;
        let m;
        const names = [];
        while ((m = classRe.exec(sel)) !== null) names.push({type:'class', name: m[1]});
        while ((m = idRe.exec(sel)) !== null) names.push({type:'id', name: m[1]});
        if (names.length) {
          for (const nm of names) {
            blockMap[nm.name] = block.trim();
          }
        }
      }

      for (const s of sels) {
        const name = s.name;
        let found = false;
        // Search heuristics: look for "class=..", .classname in JS strings, querySelector, classList, and raw occurrences
        const patterns = [
          new RegExp('class(?:Name)?\\s*=\\s*["\'`][^"\'`]*\\b' + escapeRegExp(name) + '\\b', 'i'),
          new RegExp('\\.' + escapeRegExp(name) + '\\b', 'i'),
          new RegExp('\\b' + escapeRegExp(name) + '\\b', 'i'),
          new RegExp("querySelector(All)?\\s*\\(\\s*['\"][.#]" + escapeRegExp(name) + "['\"]\\s*\\)", 'i'),
          new RegExp("classList\\.(add|remove|toggle)\\s*\\(\\s*['\"]" + escapeRegExp(name) + "['\"]\\s*\\)", 'i')
        ];

        for (const [sf, content] of Object.entries(searchContents)) {
          for (const pat of patterns) {
            if (pat.test(content)) { found = true; break; }
          }
          if (found) break;
        }

        if (!found) {
          report.candidates.push({ cssFile, selector: s.raw, name, type: s.type, rule: blockMap[name] || null });
        }
      }
    }

    console.log(JSON.stringify(report, null, 2));
  } catch (e) {
    console.error('Error during scan:', e);
    process.exit(2);
  }
})();

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
}
