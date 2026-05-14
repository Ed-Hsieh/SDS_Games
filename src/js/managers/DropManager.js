/**
 * DropManager.js
 * 管理掉落邏輯（系統行為） — 把行為移出 data，放入 managers
 */

import { ZoneDropPools, DungeonDropPools, MonsterUniqueDrops } from '../data/DropPools.js';
import { DropSourceType } from '../models/Enums.js';
import { weightedPick } from '../utils/WeightedPick.js';

// Pool helpers (kept in manager so data file stays logic-free)
export function registerZonePool(zoneId, pool) {
    ZoneDropPools[zoneId] = pool;
}

export function registerDungeonPool(dungeonId, pool) {
    DungeonDropPools[dungeonId] = pool;
}

export function getZonePool(zoneId) {
    return ZoneDropPools[zoneId] || null;
}

export function getDungeonPool(dungeonId) {
    return DungeonDropPools[dungeonId] || null;
}

// Map simple world zone types (as emitted by WorldMap) to ZoneDropPools keys.
const ZoneTypeToPoolKey = {
    low: 'low_forest',
    medium: 'ice_field',
    high: 'volcano',
    boss: 'volcano'
};

function resolveZonePoolKey(zoneIdOrType) {
    if (!zoneIdOrType) return null;
    if (ZoneDropPools[zoneIdOrType]) return zoneIdOrType;
    const mapped = ZoneTypeToPoolKey[zoneIdOrType];
    if (mapped && ZoneDropPools[mapped]) return mapped;
    return null;
}

// DropSource type enum
// DropSourceType moved to `src/js/models/Enums.js`

function resolveQuantity(qty, rng = Math.random) {
    if (qty == null) return 1;
    if (!Array.isArray(qty)) return qty;
    const [min, max] = qty;
    if (max <= min) return min;
    return min + Math.floor(rng() * (max - min + 1));
}

// Roll implementation for a generic entries array (DropEntry[])
function rollFromEntries(entries, defaultQuantity = [1, 1], rng = Math.random) {
    if (!Array.isArray(entries) || entries.length === 0) return null;
    const candidates = entries.filter(it => it.chance == null || rng() <= it.chance);
    if (candidates.length === 0) return null;
    const picked = weightedPick(candidates, rng);
    if (!picked) return null;
    const qty = resolveQuantity(picked.quantity != null ? picked.quantity : defaultQuantity, rng);
    return { itemId: picked.id || picked.itemId || picked.equipmentId, quantity: qty };
}

// Legacy helper kept for compatibility with DropPools pool objects
export function rollFromPool(pool, rng = Math.random) {
    if (!pool || !pool.items || pool.items.length === 0) return null;
    return rollFromEntries(pool.items, pool.defaultQuantity || [1, 1], rng);
}

// Resolve drop sources from context (monster, zoneId, dungeonId)
export function resolveDropSources({ monster = null, zoneId = null, dungeonId = null } = {}) {
    const sources = [];

    const monsterId = monster && monster.id;

    // A. Monster unique drops
    const uniqueList = MonsterUniqueDrops[monsterId];
    if (Array.isArray(uniqueList) && uniqueList.length > 0) {
        // Normalize entries to { id, chance, quantity }
        const entries = uniqueList.map(d => ({ id: d.id, chance: d.chance, quantity: d.quantity }));
        sources.push({ type: DropSourceType.MonsterUnique, entries, rolls: 1 });
    }

    // B. Monster equipment drops
    if (monster && Array.isArray(monster.equipmentDrops) && monster.equipmentDrops.length > 0) {
        const entries = monster.equipmentDrops.map(d => ({ id: d.equipmentId, chance: d.chance, quantity: 1 }));
        sources.push({ type: DropSourceType.MonsterEquipment, entries, rolls: 1 });
    }

    // C. Monster simple item drops (materials / consumables)
    if (monster && Array.isArray(monster.drops) && monster.drops.length > 0) {
        const entries = monster.drops.map(d => ({ id: d.itemId, chance: d.chance, quantity: d.quantity }));
        sources.push({ type: DropSourceType.MonsterUnique, entries, rolls: 1 });
    }

    // C. Zone / Dungeon pools
    let poolRolls = 1;
    if (monster && monster.type) {
        if (monster.type === 'elite') poolRolls = 2;
        if (monster.type === 'boss' || monster.type === 'world_boss') poolRolls = 3;
    }

    const resolvedZoneKey = resolveZonePoolKey(zoneId);
    const zonePool = resolvedZoneKey ? getZonePool(resolvedZoneKey) : null;
    const dungeonPool = dungeonId ? getDungeonPool(dungeonId) : null;

    if (zonePool) {
        const entries = (zonePool.items || []).map(it => ({ id: it.id, weight: it.weight, chance: it.chance, quantity: it.quantity }));
        sources.push({ type: DropSourceType.Zone, entries, rolls: poolRolls, defaultQuantity: zonePool.defaultQuantity || [1, 1] });
    }

    if (dungeonPool) {
        const entries = (dungeonPool.items || []).map(it => ({ id: it.id, weight: it.weight, chance: it.chance, quantity: it.quantity }));
        sources.push({ type: DropSourceType.Dungeon, entries, rolls: poolRolls, defaultQuantity: dungeonPool.defaultQuantity || [1, 1] });
    }

    return sources;
}

// Generate drops from resolved sources. Preserves previous behavior where zone/dungeon
// compete per roll via zoneWeight/dungeonWeight when both are present.
export function generateDropsFromSources(sources = [], options = {}) {
    const rng = options.rng || Math.random;
    const zoneWeight = options.zoneWeight != null ? options.zoneWeight : 0.8;
    const dungeonWeight = options.dungeonWeight != null ? options.dungeonWeight : 0.15;

    const drops = [];

    // 1) Handle monster_unique and monster_equip: each entry is an independent chance roll
    for (const src of sources) {
        if (src.type === DropSourceType.MonsterUnique || src.type === DropSourceType.MonsterEquipment) {
            for (const e of src.entries) {
                const roll = rng();
                if (roll <= (e.chance || 0)) {
                    const qty = resolveQuantity(e.quantity, rng);
                    drops.push({ itemId: e.id, quantity: qty, source: src.type });
                }
            }
        }
    }

    // 2) Handle zone/dungeon pools
    const zoneSource = sources.find(s => s.type === DropSourceType.Zone) || null;
    const dungeonSource = sources.find(s => s.type === DropSourceType.Dungeon) || null;

    // Determine rolls: prefer zoneSource.rolls if present, else dungeonSource.rolls, else 0
    const rolls = (zoneSource && zoneSource.rolls) || (dungeonSource && dungeonSource.rolls) || 0;

    for (let i = 0; i < rolls; i++) {
        if (zoneSource && dungeonSource) {
            const denom = zoneWeight + dungeonWeight;
            const pickDungeonProb = dungeonWeight / denom;
            if (rng() <= pickDungeonProb) {
                const r = rollFromEntries(dungeonSource.entries, dungeonSource.defaultQuantity, rng);
                if (r) drops.push({ ...r, source: DropSourceType.Dungeon });
            } else {
                const r = rollFromEntries(zoneSource.entries, zoneSource.defaultQuantity, rng);
                if (r) drops.push({ ...r, source: DropSourceType.Zone });
            }
        } else if (dungeonSource) {
            const r = rollFromEntries(dungeonSource.entries, dungeonSource.defaultQuantity, rng);
            if (r) drops.push({ ...r, source: DropSourceType.Dungeon });
        } else if (zoneSource) {
            const r = rollFromEntries(zoneSource.entries, zoneSource.defaultQuantity, rng);
            if (r) drops.push({ ...r, source: DropSourceType.Zone });
        }
    }

    return drops;
}

/**
 * Compatibility wrapper: resolve + generate in one call (used by existing code)
 */
export function generateDrops(options = {}) {
    const { monster = null, zoneId = null, dungeonId = null, rng = Math.random, zoneWeight = 0.8, dungeonWeight = 0.15 } = options;
    const sources = resolveDropSources({ monster, zoneId, dungeonId });
    return generateDropsFromSources(sources, { rng, zoneWeight, dungeonWeight });
}

/**
 * Legacy-friendly wrapper: calculateDrops(monster, { zoneId, dungeonId })
 */
export function calculateDrops(monster, options = {}) {
    const { zoneId = null, dungeonId = null, rng = Math.random } = options;
    return generateDrops({ monster, zoneId, dungeonId, rng });
}
