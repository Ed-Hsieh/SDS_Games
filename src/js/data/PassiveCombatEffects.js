export const PassiveCombatEffectSlotCount = 1;

export const PassiveCombatEffectDatabase = {
    sharp_focus: {
        id: 'sharp_focus',
        name: '銳利專注',
        icon: '🎯',
        rarity: 'common',
        description: '戰鬥中永久提高爆擊率。',
        bonuses: { critChance: 0.10 }
    },
    heavy_grip: {
        id: 'heavy_grip',
        name: '沉穩握法',
        icon: '✊',
        rarity: 'common',
        description: '戰鬥中永久提高攻擊力。',
        bonuses: { atkPercent: 0.08 }
    },
    guard_memory: {
        id: 'guard_memory',
        name: '守勢記憶',
        icon: '🛡️',
        rarity: 'common',
        description: '戰鬥中永久提高防禦力。',
        bonuses: { defPercent: 0.10 }
    },
    quick_rhythm: {
        id: 'quick_rhythm',
        name: '迅捷節奏',
        icon: '⚡',
        rarity: 'uncommon',
        description: '戰鬥中永久提高攻擊頻率。',
        bonuses: { attackSpeed: 0.08 }
    },
    fatal_reading: {
        id: 'fatal_reading',
        name: '致命判讀',
        icon: '💥',
        rarity: 'rare',
        description: '戰鬥中永久提高爆擊傷害。',
        bonuses: { critDamage: 0.20 }
    },
    venom_resolve: {
        id: 'venom_resolve',
        name: '抗毒調息',
        icon: '☘️',
        rarity: 'uncommon',
        description: '降低中毒、毒沼與毒箭造成的傷害，適合迷霧叢林與遺跡毒箭機關。',
        bonuses: { poisonMitigation: 0.35 }
    },
    frost_pacing: {
        id: 'frost_pacing',
        name: '雪行節拍',
        icon: '❄️',
        rarity: 'uncommon',
        description: '降低寒冷累積與冰雪環境傷害，並有機率節省雪地補給。',
        bonuses: { coldGainReduction: 0.35, coldMitigation: 0.20, snowSupplySaving: 0.20 }
    },
    ember_tempering: {
        id: 'ember_tempering',
        name: '餘燼淬身',
        icon: '🔥',
        rarity: 'rare',
        description: '降低灼熱與岩漿傷害，並減少火山副本造成的裝備耐久磨耗。',
        bonuses: { burnMitigation: 0.30, durabilityLossReduction: 0.35 }
    },
    swamp_pathfinding: {
        id: 'swamp_pathfinding',
        name: '沼徑判讀',
        icon: '🧭',
        rarity: 'rare',
        description: '降低叢林迷路機率，減少撤退代價，讓危險地形更容易被控制。',
        bonuses: { lostChanceReduction: 0.12, markerRequirementReduction: 1, retreatCostReduction: 0.50, fleeChanceBonus: 0.08 }
    },
    ruin_literacy: {
        id: 'ruin_literacy',
        name: '碑文識讀',
        icon: '📜',
        rarity: 'rare',
        description: '減少遺跡石碑所需線索，並降低機關、陷阱與錯誤解謎造成的傷害。',
        bonuses: { puzzleClueBonus: 1, trapDamageReduction: 0.25 }
    },
    field_medic: {
        id: 'field_medic',
        name: '野戰醫術',
        icon: '💚',
        rarity: 'uncommon',
        description: '提高藥水、草藥、營火與治療事件的恢復量。',
        bonuses: { healingReceived: 0.20 }
    },
    boss_composure: {
        id: 'boss_composure',
        name: '王敵定心',
        icon: '👑',
        rarity: 'epic',
        description: '面對 Boss 與菁英時降低承受傷害，適合挑戰流程最終戰。',
        bonuses: { bossDamageReduction: 0.10, eliteDamageReduction: 0.06 }
    }
};

export const DefaultUnlockedPassiveCombatEffectIds = Object.keys(PassiveCombatEffectDatabase);

export const DefaultEquippedPassiveCombatEffectIds = [
    'sharp_focus'
];

export function getPassiveCombatEffect(effectId) {
    return PassiveCombatEffectDatabase[effectId] || null;
}

export function getPassiveCombatEffects(effectIds = []) {
    return effectIds
        .map(effectId => getPassiveCombatEffect(effectId))
        .filter(Boolean);
}

export function getAllPassiveCombatEffects() {
    return Object.values(PassiveCombatEffectDatabase);
}
