/**
 * DropPools.js
 * 中央化的掉落池系統：區域（Zone）與副本（Dungeon）掉落池
 * 只定義區域、副本與怪物專屬掉落資料；掉落行為由 DropManager 負責。
 */

// 基本池資料格式：
// {
//   items: [ { id: 'iron_shard', weight: 50, quantity: [1,3] , chance?: 1.0 }, ... ],
//   defaultQuantity: [1,1]
// }

export const ZoneDropPools = {
    low_forest: {
        items: [
            { id: 'iron_shard', weight: 55, quantity: [2, 3], chance: 0.75 },
            { id: 'iron_ore', weight: 25, quantity: [1, 2], chance: 0.18 },
            { id: 'slime_jelly', weight: 20, quantity: [1, 3], chance: 0.28 }
        ],
        defaultQuantity: [1, 1]
    },

    volcano: {
        items: [
            { id: 'high_ore', weight: 45, quantity: [1, 1] },
            { id: 'forge_core', weight: 30, quantity: [1, 1] },
            { id: 'fire_essence', weight: 25, quantity: [1, 2] }
        ],
        defaultQuantity: [1, 1]
    },

    ice_field: {
        items: [
            { id: 'high_ore', weight: 35, quantity: [1, 1] },
            { id: 'frost_crystal', weight: 35, quantity: [1, 2] },
            { id: 'frost_core', weight: 30, quantity: [1, 1] }
        ],
        defaultQuantity: [1, 1]
    },

    death_wastes: {
        items: [
            { id: 'forge_core', weight: 40, quantity: [1, 1] },
            { id: 'rare_metal', weight: 35, quantity: [1, 1] },
            { id: 'void_essence', weight: 25, quantity: [1, 1] }
        ],
        defaultQuantity: [1, 1]
    }
};

export const DungeonDropPools = {
    forge_cavern: {
        items: [
            { id: 'iron_shard', weight: 50, quantity: [1, 3] },
            { id: 'forge_core', weight: 30, quantity: [1, 1] },
            { id: 'rare_metal', weight: 20, quantity: [1, 2] }
        ],
        defaultQuantity: [1, 1],
        guaranteed: [ { id: 'forge_core', chance: 0.1 } ]
    }
};

// Monster-unique drop definitions live here so all drop items are declared in this file.
export const MonsterUniqueDrops = {
    // Migration tip: move boss guaranteed drops or monster-specific uniques here keyed by monsterId.
    // e.g. forest_guardian: [ { id: 'forest_guardian_staff', chance: 0.15 } ]
};
