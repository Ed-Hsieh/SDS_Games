/**
 * DropPools.js
 * 中央化的掉落池系統：區域（Zone）與副本（Dungeon）掉落池
 * 提供可註冊的池、範例資料與一個主入口 `generateDrops`。
 */

// 基本池資料格式：
// {
//   items: [ { id: 'wood', weight: 50, quantity: [1,3] , chance?: 1.0 }, ... ],
//   defaultQuantity: [1,1]
// }

export const ZoneDropPools = {
    low_forest: {
        items: [
            { id: 'wood', weight: 50, quantity: [1, 3] },
            { id: 'cloth', weight: 30, quantity: [1, 2] },
            { id: 'low_stone', weight: 20, quantity: [1, 2] }
        ],
        defaultQuantity: [1, 1]
    },

    volcano: {
        items: [
            { id: 'armor_shard', weight: 40, quantity: [1, 2] },
            { id: 'lava_stone', weight: 35, quantity: [1, 2] },
            { id: 'high_ore', weight: 25, quantity: [1, 1] }
        ],
        defaultQuantity: [1, 1]
    },

    ice_field: {
        items: [
            { id: 'ice_crystal', weight: 50, quantity: [1, 2] },
            { id: 'cold_iron', weight: 30, quantity: [1, 1] },
            { id: 'frost_core', weight: 20, quantity: [1, 1] }
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

// Note: Pool helpers (register/get/roll) are implemented in `managers/DropManager.js`.
// This file contains only the pool data so it remains a pure data module.

// Monster-unique drop definitions live here so all drop items are declared in this file.
export const MonsterUniqueDrops = {
    // Migration tip: move boss guaranteed drops or monster-specific uniques here keyed by monsterId.
    // e.g. forest_guardian: [ { id: 'forest_guardian_staff', chance: 0.15 } ]
};
