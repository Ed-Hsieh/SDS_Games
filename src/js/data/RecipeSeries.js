/**
 * RecipeSeries.js
 * Series craft recipes are weak, easy-to-replace fallback gear.
 * They keep weapon choice available without multiplying blueprint drops.
 */

import { EquipmentType, ItemRarity, WeaponForm } from '../models/Enums.js';

export const WeaponForms = WeaponForm;

export const RecipeSeriesDatabase = Object.freeze({
    slime_series: {
        id: 'slime_series',
        name: '青凝工藝',
        rarity: ItemRarity.COMMON,
        role: 'fallback',
        strength: 'weak',
        defaultKnown: true,
        levelBand: [5, 9],
        materialTheme: ['slime_jelly', 'iron_shard'],
        description: '以史萊姆凝膠固定粗鐵，成品不強，但便宜、好補、壞了也不心疼。',
        discovery: {
            source: '史萊姆群落',
            clue: '史萊姆凝膠可以把粗鐵暫時黏成可用武器，是旅人最早能依靠的保底工藝。',
            interactionId: 'default_series'
        }
    },
    bone_series: {
        id: 'bone_series',
        name: '白骨工藝',
        rarity: ItemRarity.UNCOMMON,
        role: 'fallback',
        strength: 'weak',
        levelBand: [10, 16],
        materialTheme: ['bone_fragment', 'iron_ore'],
        description: '用骨片與粗鐵拼成的系列武器，性能平實，適合撐過中段裝備空窗。',
        discovery: {
            source: '骷髏群落',
            clue: '骷髏身上的骨片能被鐵匠修成一整套簡易型制，不是名器，卻很可靠。',
            interactionId: 'monster_series_drop'
        }
    }
});

function weaponStats({ attack, critChance, critDamage, weaponSpeed, durability }) {
    return {
        attack,
        defense: 0,
        critChance,
        critDamage,
        weaponSpeed,
        attackSpeed: weaponSpeed,
        maxDurability: durability,
        durability
    };
}

function createSeriesWeaponRecipe(seriesId, form, data) {
    const series = RecipeSeriesDatabase[seriesId];
    const id = `${seriesId}_${data.idSuffix || form}`;
    return {
        id,
        name: data.name,
        icon: data.icon,
        type: EquipmentType.WEAPON,
        rarity: data.rarity || series.rarity,
        level: data.level,
        requiredLevel: data.level,
        craftLine: 'series',
        seriesId,
        blueprintGroupId: seriesId,
        weaponForm: form,
        formLabel: data.formLabel,
        strength: 'weak',
        materials: data.materials,
        cost: data.cost,
        successRate: data.successRate ?? 100,
        result: {
            id: `crafted_${id}`,
            name: data.name,
            icon: data.icon,
            type: EquipmentType.WEAPON,
            rarity: data.rarity || series.rarity,
            level: data.level,
            requiredLevel: data.level,
            craftLine: 'series',
            seriesId,
            blueprintGroupId: seriesId,
            weaponForm: form,
            formLabel: data.formLabel,
            balanceIntent: 'weak_fallback_series',
            stats: weaponStats(data.stats),
            specialEffects: [],
            desc: data.desc,
            description: data.desc,
            maxDurability: data.stats.durability,
            durability: data.stats.durability
        }
    };
}

export const SeriesRecipeDatabase = Object.freeze({
    slime_series_sword: createSeriesWeaponRecipe('slime_series', WeaponForms.SWORD, {
        name: '青凝短劍',
        icon: '🗡️',
        formLabel: '劍型',
        level: 5,
        materials: [{ id: 'slime_jelly', quantity: 4 }, { id: 'iron_shard', quantity: 2 }],
        cost: 35,
        stats: { attack: 8, critChance: 0.08, critDamage: 1.45, weaponSpeed: 1.05, durability: 18 },
        desc: '用凝膠固定的短劍，手感普通，但能快速補上劍型武器的空缺。'
    }),
    slime_series_dagger: createSeriesWeaponRecipe('slime_series', WeaponForms.DAGGER, {
        name: '青凝匕首',
        icon: '🔪',
        formLabel: '匕首型',
        level: 5,
        materials: [{ id: 'slime_jelly', quantity: 3 }, { id: 'iron_shard', quantity: 2 }],
        cost: 35,
        stats: { attack: 6, critChance: 0.16, critDamage: 1.65, weaponSpeed: 1.35, durability: 17 },
        desc: '輕巧的凝膠匕首，傷害偏低，但節奏快，適合嘗試高速打法。'
    }),
    slime_series_hammer: createSeriesWeaponRecipe('slime_series', WeaponForms.HEAVY, {
        idSuffix: 'hammer',
        name: '青凝木槌',
        icon: '🔨',
        formLabel: '槌型',
        level: 5,
        materials: [{ id: 'slime_jelly', quantity: 5 }, { id: 'iron_shard', quantity: 3 }],
        cost: 40,
        stats: { attack: 11, critChance: 0.04, critDamage: 1.45, weaponSpeed: 0.75, durability: 20 },
        desc: '粗鐵與木柄被凝膠綁在一起，慢但扎實，是最低限度的大槌選擇。'
    }),
    slime_series_staff: createSeriesWeaponRecipe('slime_series', WeaponForms.FOCUS, {
        idSuffix: 'staff',
        name: '青凝枝杖',
        icon: '🪄',
        formLabel: '杖型',
        level: 5,
        materials: [{ id: 'slime_jelly', quantity: 4 }, { id: 'ancient_bark', quantity: 1 }],
        cost: 40,
        stats: { attack: 7, critChance: 0.08, critDamage: 1.5, weaponSpeed: 0.95, durability: 18 },
        desc: '以凝膠封住枝杖裂縫的簡易法杖，足以讓玩家嘗試法杖節奏。'
    }),
    slime_series_spear: createSeriesWeaponRecipe('slime_series', WeaponForms.LANCE, {
        idSuffix: 'spear',
        name: '青凝短槍',
        icon: '🪓',
        formLabel: '槍型',
        level: 5,
        materials: [{ id: 'slime_jelly', quantity: 4 }, { id: 'iron_shard', quantity: 3 }],
        cost: 40,
        stats: { attack: 9, critChance: 0.07, critDamage: 1.55, weaponSpeed: 0.95, durability: 19 },
        desc: '凝膠固定的短槍，沒有漂亮工藝，勝在便宜可補。'
    }),

    bone_series_sword: createSeriesWeaponRecipe('bone_series', WeaponForms.SWORD, {
        name: '白骨短劍',
        icon: '🗡️',
        formLabel: '劍型',
        level: 10,
        materials: [{ id: 'bone_fragment', quantity: 8 }, { id: 'iron_ore', quantity: 2 }],
        cost: 95,
        successRate: 95,
        stats: { attack: 16, critChance: 0.09, critDamage: 1.55, weaponSpeed: 1.05, durability: 20 },
        desc: '以骨片磨成刃口的劍型武器，是骷髏群落提供的穩定過渡品。'
    }),
    bone_series_dagger: createSeriesWeaponRecipe('bone_series', WeaponForms.DAGGER, {
        name: '骨牙匕首',
        icon: '🔪',
        formLabel: '匕首型',
        level: 10,
        materials: [{ id: 'bone_fragment', quantity: 6 }, { id: 'iron_ore', quantity: 2 }],
        cost: 95,
        successRate: 95,
        stats: { attack: 13, critChance: 0.18, critDamage: 1.75, weaponSpeed: 1.35, durability: 19 },
        desc: '短而尖的骨刃，強度有限，但能銜接匕首玩家的中段空窗。'
    }),
    bone_series_hammer: createSeriesWeaponRecipe('bone_series', WeaponForms.HEAVY, {
        idSuffix: 'hammer',
        name: '骸骨木槌',
        icon: '🔨',
        formLabel: '槌型',
        level: 10,
        materials: [{ id: 'bone_fragment', quantity: 10 }, { id: 'iron_ore', quantity: 3 }],
        cost: 110,
        successRate: 92,
        stats: { attack: 22, critChance: 0.05, critDamage: 1.55, weaponSpeed: 0.72, durability: 22 },
        desc: '把厚骨綁上木柄的粗槌，攻擊慢，卻能讓大槌路線不中斷。'
    }),
    bone_series_staff: createSeriesWeaponRecipe('bone_series', WeaponForms.FOCUS, {
        idSuffix: 'staff',
        name: '枯骨杖',
        icon: '🪄',
        formLabel: '杖型',
        level: 10,
        materials: [{ id: 'bone_fragment', quantity: 6 }, { id: 'ectoplasm', quantity: 2 }],
        cost: 110,
        successRate: 92,
        stats: { attack: 15, critChance: 0.1, critDamage: 1.6, weaponSpeed: 0.92, durability: 20 },
        desc: '骨片與靈質拼成的杖，效果樸素，但給法杖玩家一條可製作的中段選擇。'
    }),
    bone_series_spear: createSeriesWeaponRecipe('bone_series', WeaponForms.LANCE, {
        idSuffix: 'spear',
        name: '白骨短槍',
        icon: '🪓',
        formLabel: '槍型',
        level: 10,
        materials: [{ id: 'bone_fragment', quantity: 8 }, { id: 'iron_ore', quantity: 3 }],
        cost: 105,
        successRate: 94,
        stats: { attack: 18, critChance: 0.08, critDamage: 1.6, weaponSpeed: 0.95, durability: 21 },
        desc: '用骨片補強槍尖的短槍，作為槍型玩家的保底武器。'
    })
});

const RecipeIdToSeriesId = Object.freeze(
    Object.fromEntries(Object.values(SeriesRecipeDatabase).map(recipe => [recipe.id, recipe.seriesId]))
);

export function getRecipeSeries(seriesId) {
    return RecipeSeriesDatabase[seriesId] || null;
}

export function getRecipeSeriesForRecipe(recipeId) {
    return getRecipeSeries(RecipeIdToSeriesId[recipeId]);
}

export function getSeriesRecipeIds(seriesId) {
    return Object.values(SeriesRecipeDatabase)
        .filter(recipe => recipe.seriesId === seriesId)
        .map(recipe => recipe.id);
}

export function getDefaultKnownSeriesRecipeIds() {
    return Object.values(SeriesRecipeDatabase)
        .filter(recipe => RecipeSeriesDatabase[recipe.seriesId]?.defaultKnown)
        .map(recipe => recipe.id);
}
