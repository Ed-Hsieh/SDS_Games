import { SetDatabase } from './Equipment.js';
import { PassiveCombatEffectDatabase } from './PassiveCombatEffects.js';

export const CombatEffectAssetScope = Object.freeze({
    CURRENT: 'current_runtime',
    PAUSED_EXTERNAL: 'paused_external'
});

const effectRequirement = (id, label, family, owner, scope = CombatEffectAssetScope.CURRENT) => Object.freeze({
    id,
    label,
    family,
    owner,
    scope,
    status: 'pending_generation',
    targetPath: `effects/combat/${id}.webp`
});

const CoreCombatEffectRequirements = Object.freeze([
    effectRequirement('hit', '命中', 'combat_feedback', 'weapon_trigger'),
    effectRequirement('critical', '暴擊', 'combat_feedback', 'weapon_trigger'),
    effectRequirement('attack_up', '攻擊提升', 'buff', 'combat_and_item_effect'),
    effectRequirement('attack_speed_up', '攻擊速度提升', 'buff', 'combat_and_item_effect'),
    effectRequirement('defense_up', '防禦提升', 'buff', 'combat_and_item_effect'),
    effectRequirement('critical_chance_up', '暴擊率提升', 'buff', 'item_effect'),
    effectRequirement('critical_damage_up', '暴擊傷害提升', 'buff', 'item_effect'),
    effectRequirement('health_up', '生命提升', 'buff', 'item_effect'),
    effectRequirement('health_regen', '生命恢復', 'buff', 'combat_and_item_effect'),
    effectRequirement('boss_damage_up', '首領傷害提升', 'buff', 'item_effect'),
    effectRequirement('dodge_up', '迴避提升', 'buff', 'item_effect'),
    effectRequirement('lifesteal', '生命偷取', 'buff', 'combat_and_item_effect'),
    effectRequirement('double_strike', '連續追擊', 'buff', 'combat_and_item_effect'),
    effectRequirement('execute', '處決', 'buff', 'item_effect'),
    effectRequirement('counter', '反擊', 'buff', 'combat_and_item_effect'),
    effectRequirement('revive', '復甦', 'buff', 'item_effect'),
    effectRequirement('armor_break', '破甲', 'debuff', 'combat_and_item_effect'),
    effectRequirement('attack_speed_down', '攻擊速度降低', 'debuff', 'combat_status'),
    effectRequirement('stun', '暈眩', 'debuff', 'combat_status'),
    effectRequirement('fatigue_weakness', '疲勞虛弱', 'debuff', 'adventure_fatigue'),
    effectRequirement('poison', '中毒', 'ailment', 'combat_and_item_effect'),
    effectRequirement('burn', '燃燒', 'ailment', 'combat_and_item_effect'),
    effectRequirement('freeze', '冰凍與緩速', 'ailment', 'combat_and_item_effect'),
    effectRequirement('void', '虛空吞噬', 'ailment', 'external_item_effect', CombatEffectAssetScope.PAUSED_EXTERNAL),
    effectRequirement('light', '光明增幅', 'buff', 'external_item_effect', CombatEffectAssetScope.PAUSED_EXTERNAL)
]);

const PausedExternalSetIds = new Set([
    'abyss_precursor',
    'radiant_vow',
    'void_king'
]);

const PassiveBuffRequirements = Object.freeze(Object.values(PassiveCombatEffectDatabase).map(effect =>
    effectRequirement(
        effect.assetId || effect.id,
        effect.name,
        'passive_buff',
        `passive:${effect.id}`
    )
));

const SetEffectRequirements = Object.freeze(Object.values(SetDatabase).flatMap(set => {
    const scope = PausedExternalSetIds.has(set.id)
        ? CombatEffectAssetScope.PAUSED_EXTERNAL
        : CombatEffectAssetScope.CURRENT;
    const bonuses = Array.isArray(set.bonuses)
        ? set.bonuses
        : Object.entries(set.bonuses || {}).map(([required, bonus]) => ({ required, ...bonus }));

    return [
        effectRequirement(`set_${set.id}`, `${set.name}徽記`, 'set_identity', `set:${set.id}`, scope),
        ...bonuses
            .map(bonus => Number(bonus.required) || 0)
            .filter(required => required > 0)
            .map(required => effectRequirement(
                `setbonus_${set.id}_${required}`,
                `${set.name} ${required} 件效果`,
                'set_bonus',
                `set:${set.id}:${required}`,
                scope
            ))
    ];
}));

const requirements = [
    ...CoreCombatEffectRequirements,
    ...PassiveBuffRequirements,
    ...SetEffectRequirements
];

const duplicateIds = requirements
    .map(requirement => requirement.id)
    .filter((id, index, ids) => ids.indexOf(id) !== index);

if (duplicateIds.length > 0) {
    throw new Error(`Duplicate combat-effect asset requirements: ${[...new Set(duplicateIds)].join(', ')}`);
}

export const CombatEffectAssetRequirements = Object.freeze(requirements);

export function getCombatEffectAssetRequirement(effectId) {
    return CombatEffectAssetRequirements.find(requirement => requirement.id === effectId) || null;
}
