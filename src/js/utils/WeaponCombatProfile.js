function getEquippedWeapon(character) {
    return character?.equipment?.weapon || character?.data?.equipment?.weapon || null;
}

function textIncludesAny(text, keys) {
    return keys.some(key => text.includes(key));
}

const BASE_PROFILES = {
    unarmed: {
        id: 'unarmed',
        label: 'Unarmed',
        needleSpeedMultiplier: 0.92,
        cooldownMultiplier: 1.12,
        hitZoneMultiplier: 0.92,
        critZoneMultiplier: 0.55,
        damageMultiplier: 0.86,
        critDamageMultiplier: 0.80
    },
    sword: {
        id: 'sword',
        label: 'Blade Tempo',
        triggerCondition: '暴擊時獲得攻速節奏',
        needleSpeedMultiplier: 1.00,
        cooldownMultiplier: 1.00,
        hitZoneMultiplier: 1.00,
        critZoneMultiplier: 0.82,
        damageMultiplier: 1.00,
        critDamageMultiplier: 0.90,
        critTempoPercent: 6
    },
    dagger: {
        id: 'dagger',
        label: 'Quick Chain',
        triggerCondition: '連續命中第 3 下追擊',
        needleSpeedMultiplier: 1.18,
        cooldownMultiplier: 0.82,
        hitZoneMultiplier: 0.84,
        critZoneMultiplier: 0.62,
        damageMultiplier: 0.84,
        critDamageMultiplier: 0.82,
        comboEvery: 3,
        comboDamageRatio: 0.45,
        comboLabel: 'Quick Chain'
    },
    heavy: {
        id: 'heavy',
        label: 'Guard Break',
        triggerCondition: '暴擊或命中重甲目標時破甲',
        needleSpeedMultiplier: 0.78,
        cooldownMultiplier: 1.22,
        hitZoneMultiplier: 0.94,
        critZoneMultiplier: 0.58,
        damageMultiplier: 1.14,
        critDamageMultiplier: 0.80,
        armorBreakPercent: 18,
        armorBreakDuration: 4,
        armorBreakMinDefense: 10
    },
    focus: {
        id: 'focus',
        label: 'Focus Cast',
        triggerCondition: '暴擊時有高機率緩速',
        needleSpeedMultiplier: 0.95,
        cooldownMultiplier: 1.08,
        hitZoneMultiplier: 0.96,
        critZoneMultiplier: 0.74,
        damageMultiplier: 0.96,
        critDamageMultiplier: 0.86,
        slowChance: 35,
        slowRequiresCrit: true,
        slowPercent: 22,
        slowDuration: 2.6
    },
    lance: {
        id: 'lance',
        label: 'Piercing Line',
        triggerCondition: '暴擊或命中高防目標時穿甲',
        needleSpeedMultiplier: 1.08,
        cooldownMultiplier: 0.95,
        hitZoneMultiplier: 0.90,
        critZoneMultiplier: 0.68,
        damageMultiplier: 0.97,
        critDamageMultiplier: 0.86,
        armorPenetrationBonus: 16,
        armorPenetrationMinDefense: 8
    }
};

export function getWeaponCombatProfile(character) {
    const weapon = getEquippedWeapon(character);
    if (!weapon) return { ...BASE_PROFILES.unarmed };

    const haystack = [
        weapon.id,
        weapon.name,
        weapon.type,
        weapon.subtype,
        weapon.category
    ].filter(Boolean).join(' ').toLowerCase();

    let profile = BASE_PROFILES.sword;
    if (textIncludesAny(haystack, ['dagger', 'knife', 'assassin', 'goblin_dagger', 'shadow'])) {
        profile = BASE_PROFILES.dagger;
    } else if (textIncludesAny(haystack, ['axe', 'hammer', 'mace', 'club', 'gauntlet', 'titan'])) {
        profile = BASE_PROFILES.heavy;
    } else if (textIncludesAny(haystack, ['staff', 'wand', 'orb', 'tome', 'book'])) {
        profile = BASE_PROFILES.focus;
    } else if (textIncludesAny(haystack, ['spear', 'lance', 'pike'])) {
        profile = BASE_PROFILES.lance;
    }

    if (haystack.includes('slime_sword') || haystack.includes('slime')) {
        return {
            ...profile,
            id: 'slime_sword',
            label: 'Slime Drain',
            triggerCondition: '命中且自身受傷時吸血',
            lifestealMin: 3,
            lifestealMax: 5
        };
    }

    return { ...profile };
}

export function getWeaponLifestealBounds(character) {
    const profile = getWeaponCombatProfile(character);
    if (profile.lifestealMin == null && profile.lifestealMax == null) return null;
    return {
        min: Math.max(0, Number(profile.lifestealMin) || 0),
        max: Math.max(0, Number(profile.lifestealMax) || Number(profile.lifestealMin) || 0)
    };
}

export function getWeaponProfileTriggerText(character) {
    const profile = getWeaponCombatProfile(character);
    return profile.triggerCondition || '';
}

export default {
    getWeaponCombatProfile,
    getWeaponLifestealBounds,
    getWeaponProfileTriggerText
};
