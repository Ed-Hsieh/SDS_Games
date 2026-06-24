import fs from 'node:fs';
import path from 'node:path';

function readPngDimensions(filePath) {
    const buffer = fs.readFileSync(filePath);
    const signature = '89504e470d0a1a0a';
    if (buffer.length < 24 || buffer.subarray(0, 8).toString('hex') !== signature) return null;
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function readWebpDimensions(filePath) {
    const buffer = fs.readFileSync(filePath);
    if (
        buffer.length < 30
        || buffer.subarray(0, 4).toString('ascii') !== 'RIFF'
        || buffer.subarray(8, 12).toString('ascii') !== 'WEBP'
    ) return null;

    const chunk = buffer.subarray(12, 16).toString('ascii');
    if (chunk === 'VP8X') {
        return { width: 1 + buffer.readUIntLE(24, 3), height: 1 + buffer.readUIntLE(27, 3) };
    }
    if (chunk === 'VP8L') {
        const b0 = buffer[21];
        const b1 = buffer[22];
        const b2 = buffer[23];
        const b3 = buffer[24];
        return {
            width: 1 + (b0 | ((b1 & 0x3f) << 8)),
            height: 1 + (((b1 & 0xc0) >> 6) | (b2 << 2) | ((b3 & 0x0f) << 10))
        };
    }
    if (chunk === 'VP8 ') {
        const dataStart = 20;
        if (
            buffer[dataStart + 3] === 0x9d
            && buffer[dataStart + 4] === 0x01
            && buffer[dataStart + 5] === 0x2a
        ) {
            return {
                width: buffer.readUInt16LE(dataStart + 6) & 0x3fff,
                height: buffer.readUInt16LE(dataStart + 8) & 0x3fff
            };
        }
    }
    return null;
}

function readImageDimensions(filePath) {
    const extension = path.extname(filePath).toLowerCase();
    if (extension === '.png') return readPngDimensions(filePath);
    if (extension === '.webp') return readWebpDimensions(filePath);
    return null;
}

function usage() {
    console.error('Usage: node scripts/build-grid-crop-manifest.mjs <grid-config.json> [output-manifest.json]');
    process.exit(1);
}

const configPath = process.argv[2];
const outputPath = process.argv[3];
if (!configPath) usage();

const projectRoot = process.cwd();
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const source = config.source;
if (!source) throw new Error('Grid config is missing source.');

const sourcePath = path.resolve(projectRoot, source);
if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source image does not exist: ${sourcePath}`);
}

const dimensions = readImageDimensions(sourcePath);
if (!dimensions) {
    throw new Error(`Unsupported source image format: ${sourcePath}`);
}

const columns = Number(config.columns || 5);
const rows = Number(config.rows || 5);
const cellWidth = dimensions.width / columns;
const cellHeight = dimensions.height / rows;
const outputSize = config.outputSize || {};
const outputWidth = Number(outputSize.width || config.outputWidth || 512);
const outputHeight = Number(outputSize.height || config.outputHeight || outputWidth);
const ids = Array.isArray(config.ids) ? config.ids : [];
const entries = [];

ids.forEach((id, index) => {
    if (!id) return;
    const col = index % columns;
    const row = Math.floor(index / columns);
    if (row >= rows) {
        throw new Error(`Too many ids for ${columns}x${rows} sheet. First overflow id: ${id}`);
    }
    entries.push({
        id,
        category: config.category,
        source,
        format: config.format || 'webp',
        crop: {
            x: Math.round(col * cellWidth),
            y: Math.round(row * cellHeight),
            width: Math.round(cellWidth),
            height: Math.round(cellHeight)
        },
        resize: {
            width: outputWidth,
            height: outputHeight
        }
    });
});

const manifest = {
    version: 1,
    source,
    grid: { columns, rows, width: dimensions.width, height: dimensions.height },
    entries
};

const json = JSON.stringify(manifest, null, 2) + '\n';
if (outputPath) {
    const resolvedOutput = path.resolve(projectRoot, outputPath);
    fs.mkdirSync(path.dirname(resolvedOutput), { recursive: true });
    fs.writeFileSync(resolvedOutput, json, 'utf8');
    console.log(`Wrote ${entries.length} entries -> ${outputPath}`);
} else {
    process.stdout.write(json);
}
