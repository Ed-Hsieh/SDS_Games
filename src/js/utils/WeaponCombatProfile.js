import { WeaponForm } from '../models/Enums.js';

function getEquippedWeapon(character) {
    return character?.equipment?.weapon || character?.data?.equipment?.weapon || null;
}

function normalizeWeaponForm(form) {
    const value = String(form || '').trim().toLowerCase();
    return Object.values(WeaponForm).includes(value) ? value : '';
}

const BASE_PROFILES = {
    unarmed: {
        id: 'unarmed',
        label: '徒手',
        needleSpeedMultiplier: 0.92,
        cooldownMultiplier: 1.12,
        hitZoneMultiplier: 0.92,
        critZoneMultiplier: 0.55,
        damageMultiplier: 0.86,
        critDamageMultiplier: 0.80
    },
    sword: {
        id: 'sword',
        label: '穩定架勢',
        triggerCondition: '命中或暴擊後穩定架勢，失誤時清空',
        needleSpeedMultiplier: 1.00,
        cooldownMultiplier: 1.00,
        hitZoneMultiplier: 1.10,
        critZoneMultiplier: 0.58,
        damageMultiplier: 1.00,
        critDamageMultiplier: 0.82,
        steadyStanceHitZoneBonus: 0.06,
        steadyStanceMaxStacks: 4
    },
    dagger: {
        id: 'dagger',
        label: '爆擊追擊',
        triggerCondition: '連續命中 2 次後發動爆擊追擊',
        needleSpeedMultiplier: 1.18,
        cooldownMultiplier: 0.82,
        hitZoneMultiplier: 0.84,
        critZoneMultiplier: 0.62,
        damageMultiplier: 0.84,
        critDamageMultiplier: 0.82,
        comboEvery: 2,
        comboDamageRatio: 0.70,
        comboLabel: '爆擊追擊'
    },
    heavy: {
        id: 'heavy',
        label: '壁壘防守',
        triggerCondition: '命中且穿戴護甲時獲得一次減傷',
        needleSpeedMultiplier: 0.78,
        cooldownMultiplier: 1.22,
        hitZoneMultiplier: 0.94,
        critZoneMultiplier: 0.58,
        damageMultiplier: 1.14,
        critDamageMultiplier: 0.80,
        bulwarkGuardReductionPercent: 22,
        bulwarkGuardDuration: 4,
        bulwarkRequiresArmor: true
    },
    focus: {
        id: 'focus',
        label: '元素共鳴',
        triggerCondition: '命中累積 2 層共鳴後強化元素；無元素時發射魔法彈',
        needleSpeedMultiplier: 0.95,
        cooldownMultiplier: 1.08,
        hitZoneMultiplier: 0.96,
        critZoneMultiplier: 0.74,
        damageMultiplier: 0.96,
        critDamageMultiplier: 0.86,
        resonanceStacksRequired: 2,
        resonanceElementBonusPercent: 30,
        resonanceElements: ['fire', 'ice', 'thunder', 'poison'],
        magicBoltDamageRatio: 0.45,
        magicBoltLabel: '元素彈'
    },
    lance: {
        id: 'lance',
        label: '貫穿戰線',
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

const COMBAT_VFX_ELEMENTS = new Set([
    'fire',
    'ice',
    'thunder',
    'poison',
    'shadow',
    'glimmer',
    'light'
]);

function normalizeCombatElement(value) {
    const element = String(value || '').trim().toLowerCase();
    return COMBAT_VFX_ELEMENTS.has(element) ? element : '';
}

export function getWeaponCombatElement(item) {
    if (!item) return '';

    const directElement = normalizeCombatElement(
        item.elementAttunement?.element || item.element || item.affinity
    );
    if (directElement) return directElement;

    for (const effect of item.specialEffects || []) {
        const effectElement = normalizeCombatElement(effect?.type);
        if (effectElement) return effectElement;
    }

    return '';
}

export function getWeaponCombatProfile(character) {
    const weapon = getEquippedWeapon(character);
    if (!weapon) return { ...BASE_PROFILES.unarmed };

    const declaredForm = normalizeWeaponForm(weapon.weaponForm);
    if (!declaredForm || !BASE_PROFILES[declaredForm]) {
        throw new Error(`Weapon ${weapon.id || '(unknown)'} is missing a valid weaponForm`);
    }
    const profile = BASE_PROFILES[declaredForm];

    return { ...profile };
}

export function getWeaponProfileTriggerText(character) {
    const profile = getWeaponCombatProfile(character);
    return profile.triggerCondition || '';
}

export default {
    getWeaponCombatProfile,
    getWeaponProfileTriggerText,
    getWeaponCombatElement
};
