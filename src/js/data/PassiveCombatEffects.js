export const PassiveCombatEffectSlotCount = 3;

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
    }
};

export const DefaultUnlockedPassiveCombatEffectIds = [
    'sharp_focus',
    'heavy_grip',
    'guard_memory',
    'quick_rhythm',
    'fatal_reading'
];

export const DefaultEquippedPassiveCombatEffectIds = [
    'sharp_focus',
    'heavy_grip',
    'guard_memory'
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
