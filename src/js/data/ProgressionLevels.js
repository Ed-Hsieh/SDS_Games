/**
 * ProgressionLevels.js
 * Shared first-pass stretch from the original short demo curve to a longer Lv.70 curve.
 */

const LEVEL_MARKER = '__legacyLevelProgressionApplied';

export const ProgressionLevelConfig = Object.freeze({
    legacyCap: 30,
    targetCap: 70,
    earlyFixedMax: 3
});

export function stretchLegacyLevel(level, config = ProgressionLevelConfig) {
    const numeric = Math.max(1, Number(level) || 1);
    if (numeric <= config.earlyFixedMax) return Math.round(numeric);
    if (numeric >= config.legacyCap) return config.targetCap;

    const progress = (numeric - config.earlyFixedMax) / (config.legacyCap - config.earlyFixedMax);
    const stretched = config.earlyFixedMax + progress * (config.targetCap - config.earlyFixedMax);
    return Math.max(1, Math.min(config.targetCap, Math.round(stretched)));
}

function hasLevel(value) {
    return Number.isFinite(Number(value));
}

function markApplied(target) {
    Object.defineProperty(target, LEVEL_MARKER, {
        value: true,
        enumerable: false,
        configurable: true
    });
}

function rememberLegacyLevel(target, level) {
    if (Object.prototype.hasOwnProperty.call(target, 'legacyLevel')) return;
    Object.defineProperty(target, 'legacyLevel', {
        value: level,
        enumerable: false,
        configurable: true
    });
}

export function applyLegacyLevelProgressionToItem(item, options = {}) {
    if (!item || item[LEVEL_MARKER]) return item;
    if (options.skipSeries && item.craftLine === 'series') return item;

    const sourceLevel = hasLevel(item.level)
        ? Number(item.level)
        : hasLevel(item.requiredLevel)
            ? Number(item.requiredLevel)
            : null;

    if (sourceLevel == null) return item;

    const level = stretchLegacyLevel(sourceLevel, options.config || ProgressionLevelConfig);
    rememberLegacyLevel(item, sourceLevel);

    if (hasLevel(item.level)) item.level = level;
    if (hasLevel(item.requiredLevel)) item.requiredLevel = level;

    markApplied(item);
    return item;
}

export function applyLegacyLevelProgressionToRecipe(recipe, options = {}) {
    if (!recipe || (options.skipSeries && recipe.craftLine === 'series')) return recipe;
    applyLegacyLevelProgressionToItem(recipe, options);
    if (recipe.result) applyLegacyLevelProgressionToItem(recipe.result, options);
    return recipe;
}

export function applyLegacyLevelProgressionToDatabase(database, options = {}) {
    Object.values(database || {}).forEach(item => applyLegacyLevelProgressionToItem(item, options));
    return database;
}

export function applyLegacyLevelProgressionToRecipeDatabase(database, options = {}) {
    Object.values(database || {}).forEach(recipe => applyLegacyLevelProgressionToRecipe(recipe, options));
    return database;
}

export function applyLegacyLevelProgressionToDungeonDatabase(database, options = {}) {
    Object.values(database || {}).forEach(dungeon => {
        if (hasLevel(dungeon.recommendLevel)) {
            const legacyLevel = Number(dungeon.recommendLevel);
            dungeon.recommendLevel = stretchLegacyLevel(legacyLevel, options.config || ProgressionLevelConfig);
            rememberLegacyLevel(dungeon, legacyLevel);
        }
    });
    return database;
}
