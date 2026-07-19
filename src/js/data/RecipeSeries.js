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
        defaultKnown: false,
        unlockSceneId: 'ch1_s08_cold_forge_smoke',
        levelBand: [5, 9],
        materialTheme: ['slime_jelly', 'iron_shard'],
        description: '以史萊姆凝膠固定粗鐵，成品不強，但便宜、好補、壞了也不心疼。',
        discovery: {
            source: '第一章鐵匠回報',
            clue: '擊敗銀鐮伏獵者並把銀線帶回鐵匠鋪；風箱修復後會一次解鎖五種青凝武器。'
        }
    },
    bone_series: {
        id: 'bone_series',
        name: '白骨工藝',
        rarity: ItemRarity.UNCOMMON,
        role: 'fallback',
        strength: 'weak',
        unlockSceneId: 'ch2_s03_ledger_that_would_not_close',
        levelBand: [11, 20],
        materialTheme: ['bone_fragment', 'iron_ore'],
        description: '用骨片與粗鐵拼成的系列武器，性能平實，適合撐過中段裝備空窗。',
        discovery: {
            source: '第二章鍛造階段',
            clue: '整理骷髏群落的骨片後，鐵匠能穩定製作五種白骨武器。'
        }
    },
    expedition_series: {
        id: 'expedition_series',
        name: '遠征工藝',
        rarity: ItemRarity.UNCOMMON,
        role: 'fallback',
        strength: 'weak',
        unlockSceneId: 'ch3_s01_dead_checkpoint',
        levelBand: [21, 30],
        materialTheme: ['iron_ore', 'expedition_steel_fragment'],
        description: '依照遠征軍制式規格重建的五種武器，可靠、容易維修，不追求特殊能力。',
        discovery: { source: '第三章鍛造階段', clue: '回收制式武器殘件後，鐵匠能重建遠征軍的完整五型規格。' }
    },
    runic_series: {
        id: 'runic_series',
        name: '刻紋工藝',
        rarity: ItemRarity.UNCOMMON,
        role: 'fallback',
        strength: 'weak',
        unlockSceneId: 'ch4_s02_fourfold_countergear',
        levelBand: [31, 40],
        materialTheme: ['mithril_ore', 'rune_stone', 'earth_essence'],
        description: '利用淺層符文穩定結構的五種武器，效果克制但能承受第四章戰鬥。',
        discovery: { source: '第四章鍛造階段', clue: '符文石與地脈紀錄讓鐵匠完成五型刻紋武器。' }
    },
    fourfold_series: {
        id: 'fourfold_series',
        name: '四象工藝',
        rarity: ItemRarity.RARE,
        role: 'fallback',
        strength: 'weak',
        unlockSceneId: 'ch5_s02_forge_contracts',
        levelBand: [41, 50],
        materialTheme: ['high_ore', 'fire_essence', 'ice_essence', 'thunder_essence', 'poison_gland'],
        description: '以低濃度元素素材製作的完整五型武器，提供第五章穩定而不超格的元素過渡。',
        discovery: { source: '第五章鍛造階段', clue: '四種元素的安全處理紀錄使鐵匠能完成五型四象武器。' }
    },
    sealstone_series: {
        id: 'sealstone_series',
        name: '封脈工藝',
        rarity: ItemRarity.RARE,
        role: 'fallback',
        strength: 'weak',
        unlockSceneId: 'ch6_s02_scar_aftermath',
        levelBand: [51, 60],
        materialTheme: ['drake_scale', 'stone_fragment', 'rune_stone'],
        description: '結合封石與低階龍鱗的五種武器，用來承受龍域壓力而非取代龍族珍品。',
        discovery: { source: '第六章鍛造階段', clue: '封印遺構的受力紀錄讓鐵匠補齊五型封脈武器。' }
    },
    helliron_series: {
        id: 'helliron_series',
        name: '獄鐵工藝',
        rarity: ItemRarity.RARE,
        role: 'fallback',
        strength: 'weak',
        unlockSceneId: 'ch6_s09_the_old_note_answers',
        levelBand: [61, 70],
        materialTheme: ['demonic_steel', 'demon_horn', 'soul_fragment'],
        description: '以獄鐵製成的末章五型武器，確保所有流派能進入終局，但仍低於特殊與魔王裝備。',
        discovery: { source: '第七章鍛造階段', clue: '掌握獄鐵退火後，鐵匠能為五種流派提供最後一套保底武器。' }
    }
});

function weaponStats({ attack, defense = 0, critChance, critDamage, weaponSpeed, durability }) {
    return {
        attack,
        defense,
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
            canElementAttune: form === WeaponForms.FOCUS,
            desc: data.desc,
            description: data.desc,
            maxDurability: data.stats.durability,
            durability: data.stats.durability
        }
    };
}

const FormDefaults = Object.freeze({
    [WeaponForms.SWORD]: Object.freeze({ idSuffix: 'sword', icon: '⚔️', formLabel: '劍型', attackScale: 1, defense: 2, critChance: 0.08, critDamage: 1.55, weaponSpeed: 1, durability: 24 }),
    [WeaponForms.DAGGER]: Object.freeze({ idSuffix: 'dagger', icon: '🗡️', formLabel: '匕首型', attackScale: 0.82, defense: 0, critChance: 0.15, critDamage: 1.7, weaponSpeed: 1.25, durability: 18 }),
    [WeaponForms.HEAVY]: Object.freeze({ idSuffix: 'hammer', icon: '🔨', formLabel: '重武器型', attackScale: 1.28, defense: 5, critChance: 0.05, critDamage: 1.75, weaponSpeed: 0.76, durability: 28 }),
    [WeaponForms.LANCE]: Object.freeze({ idSuffix: 'spear', icon: '🔱', formLabel: '槍型', attackScale: 1.06, defense: 2, critChance: 0.07, critDamage: 1.62, weaponSpeed: 0.94, durability: 23 }),
    [WeaponForms.FOCUS]: Object.freeze({ idSuffix: 'staff', icon: '🪄', formLabel: '法杖型', attackScale: 0.96, defense: 4, critChance: 0.09, critDamage: 1.62, weaponSpeed: 0.98, durability: 21 })
});

const SeriesWeaponSpecs = Object.freeze({
    slime_series: Object.freeze({
        level: 5, baseAttack: 9, cost: 40,
        sharedMaterials: Object.freeze([{ id: 'slime_jelly', quantity: 3 }, { id: 'iron_shard', quantity: 2 }]),
        names: Object.freeze({ sword: '青凝短劍', dagger: '青凝匕首', heavy: '青凝木槌', lance: '青凝短槍', focus: '青凝枝杖' }),
        descriptions: Object.freeze({ sword: '凝膠固定的粗鐵短劍，平實而容易維修。', dagger: '以凝膠包住握柄的薄刃，提供最早的匕首型選擇。', heavy: '粗鐵與木柄被凝膠綁在一起，慢但扎實。', lance: '凝膠固定的短槍，沒有漂亮工藝，勝在便宜可補。', focus: '以凝膠穩住簡陋導片的枝杖，可維持最低限度的法術導引。' })
    }),
    bone_series: Object.freeze({
        level: 15, baseAttack: 16, cost: 95,
        sharedMaterials: Object.freeze([{ id: 'bone_fragment', quantity: 4 }, { id: 'iron_ore', quantity: 2 }]),
        names: Object.freeze({ sword: '白骨短劍', dagger: '骨牙匕首', heavy: '骸骨戰槌', lance: '白骨短槍', focus: '枯骨法杖' }),
        descriptions: Object.freeze({ sword: '以骨片包覆鐵刃的穩定過渡劍。', dagger: '將長骨磨成貼近金屬刃口的短匕首。', heavy: '以粗骨加固槌頭的樸素重武器。', lance: '骨節固定槍刃與長柄，適合對付有護甲的敵人。', focus: '骨節與簡單導石構成的法杖，可承受早期術式。' })
    }),
    expedition_series: Object.freeze({
        level: 25, baseAttack: 29, cost: 380,
        sharedMaterials: Object.freeze([{ id: 'iron_ore', quantity: 3 }, { id: 'expedition_steel_fragment', quantity: 1 }]),
        names: Object.freeze({ sword: '遠征短劍', dagger: '遠征側刃', heavy: '遠征戰槌', lance: '遠征制式槍', focus: '遠征導杖' }),
        descriptions: Object.freeze({ sword: '依遠征軍制式重建的耐用短劍。', dagger: '遠征隊近身備用的窄身側刃。', heavy: '便於拆換槌面的遠征制式戰槌。', lance: '使用回收制式槍頭重建的可靠長槍。', focus: '將遠征軍測量桿改成的穩定導杖。' })
    }),
    runic_series: Object.freeze({
        level: 35, baseAttack: 38, cost: 660,
        sharedMaterials: Object.freeze([{ id: 'mithril_ore', quantity: 2 }, { id: 'rune_stone', quantity: 1 }, { id: 'earth_essence', quantity: 1 }]),
        names: Object.freeze({ sword: '刻紋長劍', dagger: '刻紋鑿刃', heavy: '刻紋戰槌', lance: '刻紋長槍', focus: '石脈導杖' }),
        descriptions: Object.freeze({ sword: '淺層符紋穩住劍身，不追求過度增幅。', dagger: '像鑿具般精準的刻紋短刃。', heavy: '利用地脈刻紋分散反震的戰槌。', lance: '符紋沿槍脊延伸，保持刺擊結構穩定。', focus: '只導引低量地脈回聲的基礎法杖。' })
    }),
    fourfold_series: Object.freeze({
        level: 45, baseAttack: 48, cost: 960,
        sharedMaterials: Object.freeze([{ id: 'high_ore', quantity: 2 }]),
        formMaterials: Object.freeze({ sword: Object.freeze([{ id: 'fire_essence', quantity: 1 }]), dagger: Object.freeze([{ id: 'ice_essence', quantity: 1 }]), heavy: Object.freeze([{ id: 'thunder_essence', quantity: 1 }]), lance: Object.freeze([{ id: 'poison_gland', quantity: 1 }]), focus: Object.freeze([{ id: 'fire_essence', quantity: 1 }, { id: 'ice_essence', quantity: 1 }]) }),
        names: Object.freeze({ sword: '餘燼淬劍', dagger: '霜晶短刃', heavy: '引雷戰槌', lance: '毒藤長槍', focus: '四象導杖' }),
        descriptions: Object.freeze({ sword: '以低濃度火質淬鍊的保底劍型。', dagger: '用寒質穩定薄刃的保底匕首。', heavy: '只保留微量導雷紋路的重槌。', lance: '將低濃度毒質封在槍脊的長槍。', focus: '以兩枚對置導片維持四象工藝的中性法術框架。' })
    }),
    sealstone_series: Object.freeze({
        level: 55, baseAttack: 59, cost: 1360,
        sharedMaterials: Object.freeze([{ id: 'drake_scale', quantity: 2 }, { id: 'stone_fragment', quantity: 2 }, { id: 'rune_stone', quantity: 1 }]),
        names: Object.freeze({ sword: '封脈長劍', dagger: '封脈短刃', heavy: '封石戰槌', lance: '封脈長槍', focus: '封印導杖' }),
        descriptions: Object.freeze({ sword: '以封石紋路約束龍域壓力的長劍。', dagger: '輕量封紋短刃，適合在龍域維持速度。', heavy: '封石構件加固的高耐久戰槌。', lance: '沿槍身排列封紋的穩定長槍。', focus: '只承載低階封印術式的導杖。' })
    }),
    helliron_series: Object.freeze({
        level: 65, baseAttack: 70, cost: 1850,
        sharedMaterials: Object.freeze([{ id: 'demonic_steel', quantity: 3 }, { id: 'demon_horn', quantity: 1 }, { id: 'soul_fragment', quantity: 1 }]),
        names: Object.freeze({ sword: '獄鐵長劍', dagger: '獄鐵短刃', heavy: '獄鐵戰槌', lance: '獄鐵長槍', focus: '獄鐵法杖' }),
        descriptions: Object.freeze({ sword: '能承受墜落地壓力的末章保底長劍。', dagger: '保持窄身與速度的獄鐵短刃。', heavy: '以厚重獄鐵鍛成的終局保底戰槌。', lance: '不依賴特殊掉落也能製作的獄鐵長槍。', focus: '以魂質隔層保護持有者的獄鐵法杖。' })
    })
});

function createSeriesRecipes() {
    const recipes = {};
    for (const [seriesId, spec] of Object.entries(SeriesWeaponSpecs)) {
        for (const [form, defaults] of Object.entries(FormDefaults)) {
            const materials = [
                ...spec.sharedMaterials,
                ...(spec.formMaterials?.[form] || [])
            ];
            recipes[`${seriesId}_${defaults.idSuffix}`] = createSeriesWeaponRecipe(seriesId, form, {
                ...defaults,
                name: spec.names[form],
                level: spec.level,
                materials,
                cost: spec.cost,
                stats: {
                    attack: Math.round(spec.baseAttack * defaults.attackScale),
                    defense: defaults.defense,
                    critChance: defaults.critChance,
                    critDamage: defaults.critDamage,
                    weaponSpeed: defaults.weaponSpeed,
                    durability: defaults.durability + Math.floor(spec.level / 10) * 2
                },
                desc: spec.descriptions[form]
            });
        }
    }
    return recipes;
}

export const SeriesRecipeDatabase = Object.freeze(createSeriesRecipes());

const RecipeIdToSeriesId = Object.freeze(
    Object.fromEntries(Object.values(SeriesRecipeDatabase).map(recipe => [recipe.id, recipe.seriesId]))
);

export function getRecipeSeries(seriesId) {
    return RecipeSeriesDatabase[seriesId] || null;
}

export function getRecipeSeriesForUnlockScene(sceneId) {
    if (!sceneId) return [];
    return Object.values(RecipeSeriesDatabase)
        .filter(series => series.unlockSceneId === sceneId);
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
