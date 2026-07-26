import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import SouthGateMapPackage, {
    ExplorationSpriteAtlas
} from '../src/js/data/SouthGateMapPackage.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const requiredAssets = [
    ...Object.values(SouthGateMapPackage.assets),
    ExplorationSpriteAtlas.image,
    ExplorationSpriteAtlas.metadata
];

for (const asset of requiredAssets) {
    if (!fs.existsSync(path.join(root, asset))) errors.push(`Missing asset: ${asset}`);
}

if (SouthGateMapPackage.worldSize.width !== 4096
    || SouthGateMapPackage.worldSize.height !== 2304) {
    errors.push('South Gate world size must remain 4096x2304.');
}

if (SouthGateMapPackage.props.length !== 4) {
    errors.push('South Gate must contain rest, evidence, resource, and secret interactions.');
}

for (const prop of SouthGateMapPackage.props) {
    if (!prop.image || !fs.existsSync(path.join(root, prop.image))) {
        errors.push(`Missing prop image: ${prop.id}`);
    }
    if (!Number.isFinite(prop.x) || !Number.isFinite(prop.y)) {
        errors.push(`Invalid prop anchor: ${prop.id}`);
    }
}

const metadataPath = path.join(root, ExplorationSpriteAtlas.metadata);
if (fs.existsSync(metadataPath)) {
    const atlas = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    const expected = {
        idle: { frames: 4, fps: 6, loop: true },
        walk: { frames: 8, fps: 10, loop: true },
        roll: { frames: 8, fps: 14, loop: false }
    };
    if (atlas.directions?.length !== 8) errors.push('Traveler atlas must contain eight directions.');
    for (const [name, contract] of Object.entries(expected)) {
        const animation = atlas.animations?.[name];
        if (!animation) {
            errors.push(`Missing traveler animation: ${name}`);
            continue;
        }
        if (animation.frameCount !== contract.frames
            || animation.fps !== contract.fps
            || animation.loop !== contract.loop) {
            errors.push(`Traveler animation contract mismatch: ${name}`);
        }
        if (Object.keys(animation.rows || {}).length !== 8) {
            errors.push(`Traveler animation lacks eight direction rows: ${name}`);
        }
    }
}

if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
}

console.log('South Gate Canvas slice contract passed.');
