import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const problems = [];

function push(section, message) {
    problems.push({ section, message });
}

function walk(dir, predicate = () => true) {
    const result = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            result.push(...walk(fullPath, predicate));
        } else if (predicate(fullPath)) {
            result.push(fullPath);
        }
    }
    return result;
}

function rel(file) {
    return path.relative(root, file).replace(/\\/g, '/');
}

function read(file) {
    return fs.readFileSync(file, 'utf8');
}

const jsFiles = walk(path.join(root, 'src/js'), file => file.endsWith('.js'));

for (const file of jsFiles) {
    const source = read(file);
    const lines = source.split(/\r?\n/);

    lines.forEach((line, index) => {
        if (line.includes('console.log')) {
            push('debug-log', `${rel(file)}:${index + 1} contains console.log`);
        }
        if (rel(file) === 'src/js/components/ItemDetailModal.js' && /\sstyle=/.test(line)) {
            push('component-inline-style', `${rel(file)}:${index + 1} keeps modal CSS inline; use scoped CSS`);
        }
        if (/from\s+['"][^'"]*DataModel\.js['"]/.test(line) && /\bItem(Type|Rarity|Category)\b|\bSkillType\b/.test(line)) {
            push('enum-import', `${rel(file)}:${index + 1} imports enums from DataModel.js; use Enums.js`);
        }
    });

    const importSources = lines
        .filter(line => /^import\s/.test(line.trim()))
        .map(line => line.match(/from\s+['"]([^'"]+)['"]/)?.[1])
        .filter(Boolean);
    const seenSources = new Set();
    for (const sourcePath of importSources) {
        if (seenSources.has(sourcePath)) {
            push('duplicate-import', `${rel(file)} imports ${sourcePath} more than once`);
        }
        seenSources.add(sourcePath);
    }
}

const viewFiles = fs.readdirSync(path.join(root, 'src/views'));
for (const file of viewFiles) {
    if (/^dungeon-(cave|snow|ruins|jungle|hell)\.html$/.test(file)) {
        push('dungeon-view', `src/views/${file} should use shared dungeon.html instead`);
    }
}

const globalCss = path.join(root, 'src/css/global.css');
if (fs.existsSync(globalCss)) {
    const lines = read(globalCss).split(/\r?\n/);
    const unscopedSelectors = [
        /^\s*\.item-detail-/,
        /^\s*\.stat-row\b/,
        /^\s*\.stat-left\b/,
        /^\s*\.stat-label\b/,
        /^\s*\.stat-right\b/,
        /^\s*\.stats-compare\b/,
        /^\s*\.affix-pill\b/,
        /^\s*\.modal-footer\b/,
        /^\s*\.modal-close-btn\b/
    ];

    lines.forEach((line, index) => {
        if (unscopedSelectors.some(pattern => pattern.test(line))) {
            push('global-css-scope', `${rel(globalCss)}:${index + 1} has unscoped component selector`);
        }
    });
}

for (const file of [
    path.join(root, 'src/css/global.css'),
    path.join(root, 'src/css/scenes.css'),
    path.join(root, 'src/css/ui-foundation.css'),
    path.join(root, 'src/style/hall.css'),
    path.join(root, 'src/style/marketplace.css')
]) {
    if (!fs.existsSync(file)) continue;
    const source = read(file).replace(/\/\*[\s\S]*?\*\//g, '');
    let depth = 0;
    let minDepth = 0;
    for (const char of source) {
        if (char === '{') depth += 1;
        if (char === '}') depth -= 1;
        minDepth = Math.min(minDepth, depth);
    }
    if (depth !== 0 || minDepth < 0) {
        push('css-braces', `${rel(file)} has unbalanced CSS braces`);
    }
}

const indexHtml = path.join(root, 'index.html');
if (fs.existsSync(indexHtml)) {
    const cssLinks = [...read(indexHtml).matchAll(/<link\s+rel="stylesheet"\s+href="([^"]+)"/g)].map(match => match[1]);
    const normalizedCssLinks = cssLinks.map(link => link.split('?')[0]);
    if (!normalizedCssLinks.includes('src/css/ui-foundation.css')) {
        push('ui-foundation', 'index.html should load src/css/ui-foundation.css');
    } else if (normalizedCssLinks[normalizedCssLinks.length - 1] !== 'src/css/ui-foundation.css') {
        push('ui-foundation', 'src/css/ui-foundation.css should be the final stylesheet so layout fixes win');
    }
}

if (problems.length === 0) {
    console.log('Structure consistency check passed.');
} else {
    console.error(`Structure consistency check found ${problems.length} issue(s):`);
    for (const problem of problems) console.error(`- [${problem.section}] ${problem.message}`);
    process.exitCode = 1;
}
