/**
 * DropManager.js
 * 管理掉落邏輯（系統行為） — 把行為移出 data，放入 managers
 */

import { ZoneDropPools, DungeonDropPools, MonsterUniqueDrops } from '../data/DropPools.js';

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
// Keeps world generator unchanged while DropPools keys remain descriptive.
const ZoneTypeToPoolKey = {
    // world map -> drop pool key
    low: 'low_forest',
    medium: 'ice_field',
    high: 'volcano',
    boss: 'volcano'
};

function resolveZonePoolKey(zoneIdOrType) {
    if (!zoneIdOrType) return null;
    // If caller already passed a pool key that exists in data, use it directly
    if (ZoneDropPools[zoneIdOrType]) return zoneIdOrType;
    // Otherwise, try mapping from world zone type
    const mapped = ZoneTypeToPoolKey[zoneIdOrType];
    if (mapped && ZoneDropPools[mapped]) return mapped;
    return null;
}

function weightedPick(items, rng=Math.random) {
    const total = items.reduce((s, it) => s + (it.weight || 0), 0);
    if (total <= 0) return null;
    let r = rng() * total;
    for (const it of items) {
        r -= (it.weight || 0);
        if (r <= 0) return it;
    }
    return items[items.length - 1];
}

function pickQuantity(item, defaultQty, rng=Math.random) {
    const q = item && item.quantity ? item.quantity : defaultQty;
    if (!Array.isArray(q)) return q;
    const min = q[0];
    const max = q[1];
    if (max <= min) return min;
    return Math.floor(rng() * (max - min + 1)) + min;
}

export function rollFromPool(pool, rng=Math.random) {
    if (!pool || !pool.items || pool.items.length === 0) return null;

    const candidates = pool.items.filter(it => it.chance == null || rng() <= it.chance);
    if (candidates.length === 0) return null;

    const picked = weightedPick(candidates, rng);
    if (!picked) return null;
    const qty = pickQuantity(picked, pool.defaultQuantity || [1,1], rng);
    return { itemId: picked.id, quantity: qty };
}

export function generateDrops(options = {}) {
    const {
        monster = null,
        monsterId = monster && monster.id,
        zoneId = null,
        dungeonId = null,
        isBoss = false,
        rng = Math.random,
        zoneWeight = 0.8,
        dungeonWeight = 0.15
    } = options;

    const drops = [];

    // 1) Monster-unique drops (defined centrally in DropPools.MonsterUniqueDrops)
    const uniqueList = MonsterUniqueDrops[monsterId];
    if (Array.isArray(uniqueList)) {
        for (const d of uniqueList) {
            const roll = rng();
            if (roll <= (d.chance || 0)) {
                const qty = d.quantity && Array.isArray(d.quantity)
                    ? Math.floor(rng() * (d.quantity[1] - d.quantity[0] + 1)) + d.quantity[0]
                    : (d.quantity || 1);
                drops.push({ itemId: d.id, quantity: qty, source: 'monster_unique' });
            }
        }
    }

    // 2) Monster equipment drops (kept on monster definition)
    if (monster && Array.isArray(monster.equipmentDrops)) {
        for (const d of monster.equipmentDrops) {
            const roll = rng();
            if (roll <= (d.chance || 0)) {
                drops.push({ itemId: d.equipmentId, quantity: 1, source: 'monster_unique' });
            }
        }
    }

    // 3) Pool draws from zone/dungeon for common materials
    let poolRolls = 1;
    if (monster && monster.type) {
        if (monster.type === 'elite') poolRolls = 2;
        if (monster.type === 'boss' || monster.type === 'world_boss') poolRolls = 3;
    }

    const resolvedZoneKey = resolveZonePoolKey(zoneId);
    const zonePool = resolvedZoneKey ? getZonePool(resolvedZoneKey) : null;
    const dungeonPool = dungeonId ? getDungeonPool(dungeonId) : null;

    for (let i = 0; i < poolRolls; i++) {
        if (zonePool && dungeonPool) {
            const denom = zoneWeight + dungeonWeight;
            const pickDungeonProb = dungeonWeight / denom;
            if (rng() <= pickDungeonProb) {
                const r = rollFromPool(dungeonPool, rng);
                if (r) drops.push({ ...r, source: 'dungeon' });
            } else {
                const r = rollFromPool(zonePool, rng);
                if (r) drops.push({ ...r, source: 'zone' });
            }
        } else if (dungeonPool) {
            const r = rollFromPool(dungeonPool, rng);
            if (r) drops.push({ ...r, source: 'dungeon' });
        } else if (zonePool) {
            const r = rollFromPool(zonePool, rng);
            if (r) drops.push({ ...r, source: 'zone' });
        }
    }

    // 4) Dungeon guaranteed is already handled in DropPools via the pool object; managers may call it separately if needed.
    // (If you prefer guaranteed handling here, we can add it.)

    return drops;
}

/**
 * Legacy-friendly wrapper: calculateDrops(monster, { zoneId, dungeonId })
 */
export function calculateDrops(monster, options = {}) {
    const { zoneId = null, dungeonId = null, rng = Math.random } = options;
    return generateDrops({ monster, zoneId, dungeonId, rng });
}
