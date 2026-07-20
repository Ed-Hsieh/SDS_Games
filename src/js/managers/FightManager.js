
import GameManager from './GameManager.js';
import { getEquipmentEffectTotals } from './EquipmentEffectResolver.js';
import { getWeaponCombatProfile } from '../utils/WeaponCombatProfile.js';

function getPassiveCombatBonus(character, stat) {
    return typeof character?.getPassiveCombatBonus === 'function'
        ? Math.max(0, Number(character.getPassiveCombatBonus(stat)) || 0)
        : 0;
}

function applyMonsterDamagePassiveMitigation(monster, player, damage) {
    let mitigation = getPassiveCombatBonus(player, 'monsterDamageReduction');
    if (monster?.isBoss) mitigation += getPassiveCombatBonus(player, 'bossDamageReduction');
    const clamped = Math.min(0.75, mitigation);
    return clamped > 0 ? Math.max(1, Math.floor(damage * (1 - clamped))) : damage;
}

function getCurrentHp(entity) {
    if (typeof entity?.hp === 'number') return entity.hp;
    return entity?.getHP ? entity.getHP() : 0;
}

function getMaxHp(entity) {
    if (typeof entity?.maxHp === 'number') return entity.maxHp;
    return entity?.getMaxHP ? entity.getMaxHP() : 0;
}

function getEntityDefense(entity) {
    if (!entity) return 0;
    if (typeof entity.getTotalDef === 'function') return Number(entity.getTotalDef()) || 0;
    return Number(entity.defense ?? 0) || 0;
}

function isBossLike(target) {
    return Boolean(
        target?.isBoss
        || target?.type === 'boss'
        || target?.type === 'world_boss'
        || target?.rank === 'boss'
    );
}

function setEntityHp(entity, hp) {
    const nextHp = Math.max(0, Math.floor(Number(hp) || 0));
    if (typeof entity?.hp === 'number') {
        entity.hp = nextHp;
    } else if (entity?.setHP) {
        entity.setHP(nextHp);
    } else if (entity) {
        entity.hp = nextHp;
    }
}

function getStatusRemainingSeconds(effect, now = Date.now()) {
    if (!effect?.expiresAt) return 0;
    return Math.max(0, (effect.expiresAt - now) / 1000);
}

function syncActiveStatusEffects(entity, now = Date.now()) {
    if (!entity) return [];
    const effects = Array.isArray(entity.statusEffects) ? entity.statusEffects : [];
    const active = effects
        .filter(effect => !effect.expiresAt || effect.expiresAt > now)
        .map(effect => ({
            ...effect,
            duration: getStatusRemainingSeconds(effect, now)
        }));
    entity.statusEffects = active;
    return active;
}

function getTargetArmorBreakPercent(target, now = Date.now()) {
    return Math.min(
        75,
        syncActiveStatusEffects(target, now)
            .filter(effect => effect.type === 'armorBreak')
            .reduce((sum, effect) => sum + (Number(effect.percent) || 0), 0)
    );
}

function getPoisonAccumulated(target, now = Date.now()) {
    return syncActiveStatusEffects(target, now)
        .filter(effect => effect.type === 'poison')
        .reduce((sum, effect) => sum + (Number(effect.accumulated) || 0), 0);
}

function getStatusLabel(effect) {
    const labels = {
        stun: '暈眩',
        slow: '緩速',
        poison: '中毒',
        armorBreak: '破甲'
    };
    return effect?.name || labels[effect?.type] || '狀態';
}

function getStatusIcon(effect) {
    const icons = {
        stun: '⚡',
        slow: '❄️',
        poison: '☠️',
        armorBreak: '🛡️',
        attackSpeed: '✨',
        hpRegen: '💚'
    };
    return effect?.icon || icons[effect?.type] || '◆';
}

function getPlayerHpRegenAmount(player, effects = null) {
    const hpRegenPercent = Number(effects?.hpRegen ?? getEquipmentEffectTotals(player).hpRegen) || 0;
    if (hpRegenPercent <= 0) return 0;

    const maxHp = getMaxHp(player);
    const currentHp = getCurrentHp(player);
    if (maxHp <= 0 || currentHp >= maxHp) return 0;

    return Math.min(maxHp - currentHp, Math.max(1, Math.floor(maxHp * (hpRegenPercent / 100))));
}

function shouldTriggerArmorPenetration(profile, hitType, target) {
    if (!profile?.armorPenetrationBonus) return false;
    if (hitType === 'crit') return true;
    const minDefense = Number(profile.armorPenetrationMinDefense) || Infinity;
    return getEntityDefense(target) >= minDefense;
}

const WEAPON_TRIGGER_VISUAL_DURATION = 2;

function formatTriggerPercent(value) {
    const numeric = Math.max(0, Number(value) || 0);
    return Math.round(numeric);
}

const ARCANE_RESONANCE_ELEMENT_LABELS = {
    fire: '火焰',
    ice: '冰霜',
    thunder: '雷霆',
    poison: '毒素'
};

const ARCANE_RESONANCE_ELEMENT_ASSETS = {
    fire: 'burn',
    ice: 'freeze',
    thunder: 'critical',
    poison: 'poison'
};

function getStrongestResonanceElement(breakdown = {}, allowedElements = []) {
    const allowed = allowedElements.length > 0
        ? allowedElements
        : ['fire', 'ice', 'thunder', 'poison'];
    let strongest = null;
    allowed.forEach(element => {
        const value = Math.max(0, Number(breakdown[`${element}Percent`]) || 0);
        if (value <= 0) return;
        if (!strongest || value > strongest.value) {
            strongest = {
                element,
                value,
                label: ARCANE_RESONANCE_ELEMENT_LABELS[element] || element
            };
        }
    });
    return strongest;
}

function isEquippedArmor(item) {
    if (!item) return false;
    const type = String(item.type || item.category || '').toLowerCase();
    return type === 'armor' || type === 'equipment';
}

function createWeaponTriggerVisual(profile, triggerType, details = {}) {
    if (!profile?.id || !triggerType) return null;

    const label = details.label || profile.label || '武器能力';
    const percent = formatTriggerPercent(details.percent);
    const duration = Math.max(1, Number(details.visualDuration ?? WEAPON_TRIGGER_VISUAL_DURATION) || WEAPON_TRIGGER_VISUAL_DURATION);
    const base = {
        id: `weapon-trigger:${profile.id}:${triggerType}`,
        type: 'weaponTrigger',
        source: `weapon:${profile.id}`,
        name: label,
        icon: '⚔️',
        duration,
        visualOnly: true,
        triggerType
    };

    if (triggerType === 'steadyStance') {
        const stacks = Math.max(0, Math.floor(Number(details.stacks) || 0));
        const maxStacks = Math.max(1, Math.floor(Number(details.maxStacks) || 1));
        const widthPercent = formatTriggerPercent(details.percent);
        return {
            ...base,
            assetId: 'hit',
            persistent: true,
            durationText: `${stacks}/${maxStacks}`,
            value: stacks,
            description: `穩定架勢 ${stacks}/${maxStacks}：命中區加寬 ${widthPercent}%，失誤後清空。`
        };
    }
    if (triggerType === 'combo') {
        const amount = Math.max(0, Math.floor(Number(details.amount) || 0));
        return {
            ...base,
            assetId: 'double_strike',
            value: amount,
            description: `連續命中觸發追擊，追加 ${amount} 傷害。`
        };
    }
    if (triggerType === 'bulwarkGuard') {
        return {
            ...base,
            assetId: 'defense_up',
            persistent: true,
            durationText: '1次',
            value: percent,
            description: `重勢守護已架起：下次受擊減少 ${percent}% 傷害。`
        };
    }
    if (triggerType === 'arcaneResonance') {
        const stacks = Math.max(0, Math.floor(Number(details.stacks) || 0));
        const maxStacks = Math.max(1, Math.floor(Number(details.maxStacks) || 2));
        return {
            ...base,
            assetId: 'attack_up',
            persistent: true,
            durationText: `${stacks}/${maxStacks}`,
            value: stacks,
            description: `法術共鳴 ${stacks}/${maxStacks}：滿層後強化火、冰、雷、毒；沒有元素時釋放魔法彈。`
        };
    }
    if (triggerType === 'arcaneElement') {
        const element = String(details.element || '').toLowerCase();
        const elementLabel = ARCANE_RESONANCE_ELEMENT_LABELS[element] || details.elementLabel || '元素';
        return {
            ...base,
            id: `weapon-trigger:${profile.id}:arcaneElement:${element}`,
            assetId: ARCANE_RESONANCE_ELEMENT_ASSETS[element] || 'attack_up',
            value: details.amount ?? percent,
            description: `法術共鳴釋放，強化本次 ${elementLabel} 效果。`
        };
    }
    if (triggerType === 'magicBolt') {
        const amount = Math.max(0, Math.floor(Number(details.amount) || 0));
        return {
            ...base,
            assetId: 'hit',
            value: amount,
            description: `法術共鳴釋放魔法彈，追加 ${amount} 傷害。`
        };
    }
    if (triggerType === 'armorPenetration') {
        return {
            ...base,
            assetId: 'armor_break',
            value: percent,
            description: `武器能力觸發，本次攻擊穿透 ${percent}% 防禦。`
        };
    }
    if (triggerType === 'lifesteal') {
        const amount = Math.max(0, Math.floor(Number(details.amount) || 0));
        return {
            ...base,
            assetId: 'lifesteal',
            value: amount > 0 ? amount : null,
            description: amount > 0
                ? `武器能力觸發，回復 ${amount} 生命。`
                : '武器能力觸發，但生命已滿。'
        };
    }

    return {
        ...base,
        assetId: 'hit',
        value: details.value ?? 0,
        description: '武器能力已觸發。'
    };
}

/**
 * Compute player attack damage (includes elemental bonuses and crit handling)
 * hitType: 'crit' | 'hit' | 'miss'
 */
export function computePlayerAttack(player, hitType, target = null) {
    if (!player) return { damage: 0, isCrit: false, breakdown: {} };

    const playerAtk = player.getTotalAtk ? player.getTotalAtk() : (player.atk || 0);
    const weaponProfile = getWeaponCombatProfile(player);
    if (hitType === 'miss') {
        return {
            damage: 0,
            isCrit: false,
            breakdown: {
                base: 0,
                weaponProfileId: weaponProfile.id,
                weaponProfileLabel: weaponProfile.label
            }
        };
    }

    let damage = 0;
    let isCrit = false;
    const damageMultiplier = Math.max(0.1, Number(weaponProfile.damageMultiplier) || 1);
    const critDamageMultiplier = Math.max(0.1, Number(weaponProfile.critDamageMultiplier) || 1);
    if (hitType === 'crit') {
        const critMult = (player.getCritDamage ? player.getCritDamage() : 1.5) * critDamageMultiplier;
        damage = Math.floor(playerAtk * critMult);
        isCrit = true;
    } else {
        damage = Math.floor(playerAtk);
    }

    if (damage > 0 && damageMultiplier !== 1) {
        damage = Math.max(1, Math.floor(damage * damageMultiplier));
    }

    const equipmentEffects = getEquipmentEffectTotals(player);
    const firePercent = equipmentEffects.fire;
    const icePercent = equipmentEffects.ice;
    const thunderPercent = equipmentEffects.thunder;
    const poisonPercent = equipmentEffects.poison;
    const lightPercent = equipmentEffects.light;
    const voidPerSecond = equipmentEffects.void;

    // Apply only fire as extra damage; other elements produce special effects
    let elementalBonus = 0;
    if (firePercent > 0 && damage > 0) {
        elementalBonus = Math.floor(damage * (firePercent / 100));
        damage += elementalBonus;
    }

    const profileArmorPenetrationBonus = shouldTriggerArmorPenetration(weaponProfile, hitType, target)
        ? (weaponProfile.armorPenetrationBonus || 0)
        : 0;

    const breakdown = {
        base: Math.floor(playerAtk),
        crit: isCrit,
        firePercent,
        icePercent,
        thunderPercent,
        poisonPercent,
        lightPercent,
        voidPerSecond,
        elementalBonus,
        weaponProfileId: weaponProfile.id,
        weaponProfileLabel: weaponProfile.label,
        profileArmorPenetrationBonus
    };

    return { damage, isCrit, breakdown };
}

/**
 * Compute monster attack damage against a player
 * This uses player's total defense if available
 */
export function computeMonsterAttack(monster, player) {
    if (!monster || !player) return { damage: 1 };
    const def = player.getTotalDef ? player.getTotalDef() : (player.def || 0);
    const raw = (monster.attack || 0) - def;
    let damage = Math.max(1, Math.floor(raw));
    const damageReduction = typeof player.getDamageReduction === 'function'
        ? Number(player.getDamageReduction()) || 0
        : 0;
    if (damageReduction > 0) {
        damage = Math.max(1, Math.floor(damage * (1 - Math.min(damageReduction, 0.75))));
    }
    damage = applyMonsterDamagePassiveMitigation(
        monster,
        player,
        damage
    );
    return { damage };
}

/**
 * Apply damage to a target, handling damage reduction, lifesteal, and minimum damage.
 * attacker may be null; target is expected to have `hp` (or `getHP`/`setHP`).
 * damageObj: { damage, isCrit, breakdown }
 * Returns: { finalDamage, beforeHP, afterHP, lifestealRecovered }
 */
export function applyDamage(attacker, target, damageObj) {
    if (!target || !damageObj) return { finalDamage: 0, beforeHP: 0, afterHP: 0, lifestealRecovered: 0 };

    const beforeHP = getCurrentHp(target);
    let damage = Math.max(0, Math.floor(damageObj.damage || 0));
    const attackerEffects = attacker ? getEquipmentEffectTotals(attacker) : null;

    // Damage reduction on target from equipment (percent)
    const targetEffects = getEquipmentEffectTotals(target);
    const targetDamageReduction = targetEffects.damageReduction;
    if (targetDamageReduction > 0) {
        const red = Math.min(100, targetDamageReduction);
        damage = Math.floor(damage * (1 - red / 100));
    }

    if (attackerEffects?.bossBonus > 0 && isBossLike(target) && damage > 0) {
        damage += Math.floor(damage * (attackerEffects.bossBonus / 100));
    }

    const maxTargetHp = getMaxHp(target);
    if (attackerEffects?.execute > 0 && maxTargetHp > 0 && beforeHP <= maxTargetHp * 0.5 && damage > 0) {
        damage += Math.floor(damage * (attackerEffects.execute / 100));
    }

    // Subtract flat defense if present (ensure consistency with Monster.takeDamage)
    const targetDef = getEntityDefense(target);
    if (targetDef && damage > 0) {
        // Calculate armor penetration from attacker equipment (reduces target armor before subtraction)
        const profilePenPercent = Number(damageObj.breakdown?.profileArmorPenetrationBonus) || 0;
        const armorPenPercent = (attackerEffects?.armorPenetration || 0) + profilePenPercent;
        const armorBreakPercent = getTargetArmorBreakPercent(target);
        const pen = Math.max(0, Math.min(90, armorPenPercent || 0));
        const brokenDef = Math.max(0, Math.floor(targetDef * (1 - armorBreakPercent / 100)));
        const effectiveDef = Math.max(0, Math.floor(brokenDef * (1 - pen / 100)));
        damage = Math.max(0, Math.floor(damage - effectiveDef));
    }

    // Ensure at least 1 damage if original damage > 0.
    const directDamage = damage > 0 ? Math.max(1, damage) : 0;
    const poisonAccumulated = getPoisonAccumulated(target);
    const poisonExecuteThreshold = directDamage + poisonAccumulated;
    const poisonExecuted = beforeHP > 0
        && directDamage > 0
        && poisonAccumulated > 0
        && poisonExecuteThreshold >= beforeHP;
    const finalDamage = poisonExecuted ? beforeHP : directDamage;
    const poisonExecutionDamage = poisonExecuted ? Math.max(0, finalDamage - directDamage) : 0;

    // Apply HP change
    setEntityHp(target, Math.max(0, beforeHP - finalDamage));

    // Lifesteal: apply to attacker if present
    let lifestealRecovered = 0;
    if (attacker) {
        const lifestealPercent = attackerEffects.lifesteal;
        const lifestealBaseDamage = poisonExecuted ? directDamage : finalDamage;
        if (lifestealPercent > 0 && lifestealBaseDamage > 0) {
            const currentHp = getCurrentHp(attacker);
            const maxHp = getMaxHp(attacker) || Infinity;
            const missingHp = Math.max(0, maxHp - currentHp);
            const percentLifesteal = Math.max(1, Math.floor(lifestealBaseDamage * (lifestealPercent / 100)));
            // Small early-game hits should still visibly trigger lifesteal.
            lifestealRecovered = missingHp > 0
                ? Math.min(missingHp, percentLifesteal)
                : 0;
            setEntityHp(attacker, Math.min(maxHp, currentHp + lifestealRecovered));
        }
    }

    const afterHP = getCurrentHp(target);

    // Elemental effects (from damageObj.breakdown)
    const breakdown = damageObj.breakdown || {};
    const icePercent = breakdown.icePercent || 0;
    const thunderPercent = breakdown.thunderPercent || 0;
    const poisonPercent = breakdown.poisonPercent || 0;
    const lightPercent = breakdown.lightPercent || 0;
    const voidPerSecond = breakdown.voidPerSecond || 0;
    const canApplyTargetStatus = afterHP > 0 && directDamage > 0;

    const appliedEffects = [];
    const attackerStatusEffects = [];

    // Thunder: chance to stun on hit
    if (thunderPercent > 0 && canApplyTargetStatus) {
        const roll = Math.random() * 100;
        if (roll < thunderPercent) {
            // stun duration: 1.5s (configurable later)
            appliedEffects.push({ type: 'stun', duration: 1.5, source: 'thunder', value: thunderPercent });
        }
    }

    if (attackerEffects?.stunChance > 0 && canApplyTargetStatus) {
        const chance = Math.min(100, Math.max(0, Number(attackerEffects.stunChance) || 0));
        if (Math.random() * 100 < chance) {
            appliedEffects.push({ type: 'stun', duration: 1.2, source: 'stunChance', value: chance });
        }
    }

    // Ice: apply slow to target for 3 seconds
    if (icePercent > 0 && canApplyTargetStatus) {
        appliedEffects.push({ type: 'slow', percent: icePercent, duration: 3, source: 'ice' });
    }

    if (attackerEffects?.slowChance > 0 && canApplyTargetStatus) {
        const chance = Math.min(100, Math.max(0, Number(attackerEffects.slowChance) || 0));
        if (Math.random() * 100 < chance) {
            const slowPercent = Math.max(15, Math.min(55, chance));
            appliedEffects.push({ type: 'slow', percent: slowPercent, duration: 3, source: 'slowChance', value: chance });
        }
    }

    // Poison accumulates pressure instead of dealing direct tick damage.
    if (poisonPercent > 0 && canApplyTargetStatus) {
        appliedEffects.push({ type: 'poison', accumulatePerSecond: poisonPercent, duration: 3, source: 'poison' });
    }

    if (voidPerSecond > 0 && canApplyTargetStatus) {
        appliedEffects.push({ type: 'void', damagePerSecond: voidPerSecond, duration: 3, source: 'void' });
    }

    // Light: attack speed buff applied to attacker (stacking).
    // We do not mutate attacker stats directly here; instead return the buff for caller to apply.
    if (lightPercent > 0 && attacker) {
        attackerStatusEffects.push({ type: 'attackSpeed', percent: lightPercent, stacking: 'infinite', source: 'light' });
    }

    return {
        finalDamage,
        directDamage,
        beforeHP,
        afterHP,
        lifestealRecovered,
        appliedEffects,
        attackerEffects: attackerStatusEffects,
        poisonAccumulated,
        poisonExecuteThreshold,
        poisonExecuted,
        poisonExecutionDamage
    };
}

/**
 * BattleController encapsulates a single-player vs single-monster battle flow.
 * It performs durability checks, computes player damage via computePlayerAttack,
 * applies damage via applyDamage, and runs the monster counter-attack.
 *
 * This class intentionally does not manipulate DOM. Callers (scenes) should
 * observe the return values and update UI accordingly.
 */
export class BattleController {
    constructor(player, monster) {
        this.player = player;
        this.monster = monster;
        this.monster.statusEffects = Array.isArray(this.monster.statusEffects) ? this.monster.statusEffects : [];
        this.battleEnded = false;
        this.attackCooldown = false;
        this.turnCount = 0;
        // Whether the scene has signalled the battle has actually begun (UI enabled)
        this._battleActive = false;
        // If startAutoAttack() was called before battle began, remember to start later
        this._pendingAutoStart = false;
        // Optional callback invoked when auto-attack runs (scene may register)
        this._onAutoAttack = null;
        // Optional callbacks for equipment-driven status effects.
        this._onStatusApplied = null;
        this._onStatusTick = null;
        this._autoAttackIntervalId = null;
        this._statusTickIntervalId = null;
        this._nextPlayerRegenAt = 0;
        this._playerAttackSpeedBonusPercent = 0;
        this._weaponProfileCombo = 0;
        this._weaponProfileSlotState = {};
        this._bulwarkGuard = null;
    }

    _getActiveMonsterStatusEffects(now = Date.now()) {
        return syncActiveStatusEffects(this.monster, now);
    }

    _getMonsterSlowPercent(now = Date.now()) {
        return Math.min(
            75,
            this._getActiveMonsterStatusEffects(now)
                .filter(effect => effect.type === 'slow')
                .reduce((sum, effect) => sum + (Number(effect.percent) || 0), 0)
        );
    }

    _isMonsterStunned(now = Date.now()) {
        return this._getActiveMonsterStatusEffects(now).some(effect => effect.type === 'stun');
    }

    _getPlayerHpRegenAmount() {
        return getPlayerHpRegenAmount(this.player, getEquipmentEffectTotals(this.player));
    }

    _hasStatusTickerWork(now = Date.now()) {
        return this._getActiveMonsterStatusEffects(now).length > 0 || this._getPlayerHpRegenAmount() > 0;
    }

    getPlayerAttackSpeedBonusPercent() {
        return Math.max(0, Number(this._playerAttackSpeedBonusPercent) || 0);
    }

    _getWeaponProfileSlotState(slotType = 'weapon') {
        const normalizedSlot = slotType || 'weapon';
        if (!this._weaponProfileSlotState[normalizedSlot]) {
            this._weaponProfileSlotState[normalizedSlot] = {
                steadyStanceStacks: 0,
                steadyStanceHitZoneBonusPercent: 0,
                arcaneResonanceStacks: 0
            };
        }
        return this._weaponProfileSlotState[normalizedSlot];
    }

    getPlayerHitZoneBonusPercent(slotType = 'weapon') {
        const state = this._getWeaponProfileSlotState(slotType);
        return Math.max(0, Number(state.steadyStanceHitZoneBonusPercent) || 0);
    }

    _removeWeaponTriggerVisuals(predicate = null) {
        if (!Array.isArray(this.player?.activeBuffs)) return;
        this.player.activeBuffs = this.player.activeBuffs.filter(buff => {
            if (buff?.type !== 'weaponTrigger') return true;
            return predicate ? !predicate(buff) : false;
        });
    }

    _clearSteadyStance(slotType = 'weapon') {
        const state = this._getWeaponProfileSlotState(slotType);
        state.steadyStanceStacks = 0;
        state.steadyStanceHitZoneBonusPercent = 0;
        this._removeWeaponTriggerVisuals(buff => buff.triggerType === 'steadyStance');
    }

    _clearWeaponProfileState(slotType = null) {
        if (slotType) {
            this._weaponProfileSlotState[slotType] = {
                steadyStanceStacks: 0,
                steadyStanceHitZoneBonusPercent: 0,
                arcaneResonanceStacks: 0
            };
        } else {
            this._weaponProfileSlotState = {};
        }
        this._weaponProfileCombo = 0;
        this._bulwarkGuard = null;
        this._removeWeaponTriggerVisuals();
    }

    _hasEquippedArmor() {
        return isEquippedArmor(this.player?.equipment?.armor);
    }

    _setBulwarkGuard(profile, slotType = 'weapon') {
        const percent = Math.max(1, Number(profile?.bulwarkGuardReductionPercent) || 0);
        if (percent <= 0 || !this._hasEquippedArmor()) return null;
        this._bulwarkGuard = {
            profileId: profile.id,
            slotType,
            percent,
            name: profile.label || 'Bulwark Guard'
        };
        return this._bulwarkGuard;
    }

    _consumeBulwarkGuard(damage) {
        if (!this._bulwarkGuard || damage <= 0) {
            return { damage, event: null };
        }
        const guard = this._bulwarkGuard;
        const percent = Math.max(1, Math.min(80, Number(guard.percent) || 0));
        const reducedDamage = Math.max(1, Math.floor(damage * (1 - percent / 100)));
        const prevented = Math.max(0, damage - reducedDamage);
        this._bulwarkGuard = null;
        this._removeWeaponTriggerVisuals(buff => buff.triggerType === 'bulwarkGuard');
        return {
            damage: reducedDamage,
            event: {
                type: 'bulwarkGuard',
                percent,
                prevented,
                source: guard.profileId,
                name: guard.name
            }
        };
    }

    getPlayerActionCooldownSeconds(baseSeconds = null) {
        const intervalFromSpeed = this.player?.getAttackSpeed
            ? 1 / Math.max(0.1, Number(this.player.getAttackSpeed()) || 1)
            : 1;
        const baseInterval = Number(baseSeconds ?? this.player?.getAttackInterval?.() ?? intervalFromSpeed) || 1;
        const profile = getWeaponCombatProfile(this.player);
        const profileCooldown = Math.max(0.1, Number(profile.cooldownMultiplier) || 1);
        const base = baseInterval * profileCooldown;
        const multiplier = 1 + this.getPlayerAttackSpeedBonusPercent() / 100;
        return Math.max(0.18, base / Math.max(0.1, multiplier));
    }

    _getWeaponInSlot(slotType = 'weapon') {
        const item = this.player?.equipment?.[slotType];
        return item && String(item.type || '').toLowerCase() === 'weapon' ? item : null;
    }

    _getMonsterAttackDelayMs() {
        const attackSpeedSec = (this.monster && (this.monster.attackSpeed || this.monster.attack_speed)) || 1.5;
        const baseMs = Math.max(200, Math.floor(attackSpeedSec * 1000));
        const slowPercent = this._getMonsterSlowPercent();
        return Math.max(250, Math.floor(baseMs * (1 + slowPercent / 100)));
    }

    _upsertMonsterStatusEffect(effect) {
        if (!effect?.type || !this.monster) return null;

        const now = Date.now();
        const duration = Math.max(0.5, Number(effect.duration) || 1);
        const expiresAt = now + duration * 1000;
        const existing = this.monster.statusEffects.find(status => status.type === effect.type && status.source === effect.source);

        const status = {
            ...(existing || {}),
            type: effect.type,
            source: effect.source || 'equipment',
            name: getStatusLabel(effect),
            icon: getStatusIcon(effect),
            duration,
            expiresAt,
            value: effect.value
        };

        if (effect.type === 'stun') {
            status.description = `敵人無法行動 ${duration.toFixed(1)} 秒`;
        } else if (effect.type === 'slow') {
            const percent = Math.max(0, Number(effect.percent) || 0);
            status.percent = percent;
            status.description = `攻擊頻率降低 ${Math.round(percent)}%，持續 ${Math.ceil(duration)} 秒`;
        } else if (effect.type === 'poison') {
            const accumulatePerSecond = Math.max(1, Math.floor(Number(
                effect.accumulatePerSecond ?? effect.accumulate ?? effect.dps ?? effect.value
            ) || 1));
            status.accumulatePerSecond = accumulatePerSecond;
            status.accumulated = Math.max(0, Math.floor(Number(existing?.accumulated) || 0));
            status.nextTickAt = existing?.nextTickAt && existing.nextTickAt > now
                ? existing.nextTickAt
                : now + 1000;
            status.description = `每秒累積 ${accumulatePerSecond} 毒素；毒素與攻擊足以覆蓋剩餘生命時處決。`;
        } else if (effect.type === 'void') {
            const damagePerSecond = Math.max(1, Math.floor(Number(effect.damagePerSecond ?? effect.value) || 1));
            status.damagePerSecond = damagePerSecond;
            status.nextTickAt = existing?.nextTickAt && existing.nextTickAt > now
                ? existing.nextTickAt
                : now + 1000;
            status.name = effect.name || '虛空吞噬';
            status.icon = effect.icon || '◈';
            status.description = `每秒造成 ${damagePerSecond} 點虛空傷害，造成的傷害會回復生命。`;
        } else if (effect.type === 'armorBreak') {
            const percent = Math.max(0, Number(effect.percent) || 0);
            status.percent = percent;
            status.description = `防禦降低 ${Math.round(percent)}%，持續 ${Math.ceil(duration)} 秒`;
        }

        if (existing) {
            Object.assign(existing, status);
        } else {
            this.monster.statusEffects.push(status);
        }

        return {
            ...status,
            applied: true,
            duration,
            remaining: duration
        };
    }

    applyMonsterStatusEffects(effects = []) {
        const statusEvents = [];
        for (const effect of effects || []) {
            const event = this._upsertMonsterStatusEffect(effect);
            if (event) statusEvents.push(event);
        }

        if (statusEvents.length > 0) {
            this._getActiveMonsterStatusEffects();
            this.startStatusTicker();
            this._rescheduleAutoAttack();
            try {
                if (typeof this._onStatusApplied === 'function') this._onStatusApplied(statusEvents);
            } catch (e) {
                console.warn('onStatusApplied listener failed:', e);
            }
        }

        return statusEvents;
    }

    applyAttackerStatusEffects(effects = []) {
        const statusEvents = [];
        for (const effect of effects || []) {
            if (effect?.type !== 'attackSpeed') continue;

            const percent = Math.max(0, Number(effect.percent) || 0);
            if (percent <= 0) continue;

            this._playerAttackSpeedBonusPercent = Math.min(35, this._playerAttackSpeedBonusPercent + percent);
            statusEvents.push({
                type: 'attackSpeed',
                source: effect.source || 'equipment',
                name: '攻速提升',
                icon: getStatusIcon({ type: 'attackSpeed' }),
                percent,
                totalPercent: this.getPlayerAttackSpeedBonusPercent(),
                applied: true
            });
        }
        return statusEvents;
    }

    applyWeaponTriggerVisuals(events = []) {
        if (!this.player || !Array.isArray(events) || events.length === 0) return [];
        if (!Array.isArray(this.player.activeBuffs)) this.player.activeBuffs = [];

        const visuals = events
            .map(event => createWeaponTriggerVisual(event.profile, event.type, event))
            .filter(Boolean);

        visuals.forEach(visual => {
            const existingIndex = this.player.activeBuffs.findIndex(buff => buff.id === visual.id);
            if (existingIndex >= 0) {
                this.player.activeBuffs[existingIndex] = {
                    ...this.player.activeBuffs[existingIndex],
                    ...visual
                };
                return;
            }
            this.player.activeBuffs.push(visual);
        });

        return visuals;
    }

    tickStatusEffects(now = Date.now()) {
        if (this.battleEnded || !this.monster) return [];

        const effects = this._getActiveMonsterStatusEffects(now);
        const events = [];

        for (const effect of effects) {
            if (effect.type !== 'poison' && effect.type !== 'void') continue;
            if (!effect.nextTickAt || effect.nextTickAt > now) continue;
            if (getCurrentHp(this.monster) <= 0) continue;

            if (effect.type === 'void') {
                const damage = Math.max(1, Math.floor(Number(effect.damagePerSecond) || 1));
                const beforeHP = getCurrentHp(this.monster);
                setEntityHp(this.monster, beforeHP - damage);
                const afterHP = getCurrentHp(this.monster);
                const actualDamage = Math.max(0, beforeHP - afterHP);
                const playerBeforeHP = getCurrentHp(this.player);
                const playerMaxHP = getMaxHp(this.player) || Infinity;
                if (actualDamage > 0) setEntityHp(this.player, Math.min(playerMaxHP, playerBeforeHP + actualDamage));
                const playerAfterHP = getCurrentHp(this.player);
                effect.nextTickAt = now + 1000;
                effect.description = `每秒造成 ${damage} 點虛空傷害，造成的傷害會回復生命。`;

                events.push({
                    type: 'void',
                    source: effect.source,
                    damage: actualDamage,
                    amount: actualDamage,
                    healAmount: Math.max(0, playerAfterHP - playerBeforeHP),
                    beforeHP,
                    afterHP,
                    playerBeforeHP,
                    playerAfterHP,
                    targetDefeated: afterHP <= 0
                });

                if (afterHP <= 0) {
                    this.battleEnded = true;
                    break;
                }
                continue;
            }

            const amount = Math.max(1, Math.floor(Number(effect.accumulatePerSecond ?? effect.dps) || 1));
            const beforeAccumulated = Math.max(0, Math.floor(Number(effect.accumulated) || 0));
            effect.accumulated = beforeAccumulated + amount;
            effect.nextTickAt = now + 1000;
            effect.description = `每秒累積 ${amount} 毒素；已累積 ${effect.accumulated}。`;

            events.push({
                type: 'poison',
                source: effect.source,
                amount,
                beforeAccumulated,
                afterAccumulated: effect.accumulated,
                accumulated: effect.accumulated,
                targetHp: getCurrentHp(this.monster),
                executeReady: effect.accumulated >= getCurrentHp(this.monster),
                targetDefeated: false
            });
        }

        if (this._getPlayerHpRegenAmount() > 0 && (!this._nextPlayerRegenAt || this._nextPlayerRegenAt <= now)) {
            const beforeHP = getCurrentHp(this.player);
            const amount = this._getPlayerHpRegenAmount();
            if (amount > 0) {
                setEntityHp(this.player, beforeHP + amount);
                events.push({
                    type: 'hpRegen',
                    source: 'equipment',
                    amount,
                    beforeHP,
                    afterHP: getCurrentHp(this.player)
                });
            }
            this._nextPlayerRegenAt = now + 1000;
        }

        this._getActiveMonsterStatusEffects(now);

        if (events.length > 0) {
            try {
                if (typeof this._onStatusTick === 'function') this._onStatusTick(events);
            } catch (e) {
                console.warn('onStatusTick listener failed:', e);
            }
        }

        if (this.battleEnded) {
            this.stopAutoAttack();
            this.stopStatusTicker();
        }

        return events;
    }

    startStatusTicker() {
        if (this._statusTickIntervalId || this.battleEnded) return;
        this._statusTickIntervalId = setInterval(() => {
            if (this.battleEnded) {
                this.stopStatusTicker();
                return;
            }
            this.tickStatusEffects();
            if (!this._hasStatusTickerWork()) {
                this.stopStatusTicker();
            }
        }, 250);
    }

    stopStatusTicker() {
        if (this._statusTickIntervalId) {
            clearInterval(this._statusTickIntervalId);
            this._statusTickIntervalId = null;
        }
    }

    _scheduleNextAutoAttack() {
        if (this._autoAttackIntervalId || this.battleEnded || !this._battleActive) return;

        this._autoAttackIntervalId = setTimeout(() => {
            this._autoAttackIntervalId = null;
            if (this.battleEnded || !this._battleActive) return;

            try {
                const res = this.monsterAttack();
                try {
                    if (this._onAutoAttack && typeof this._onAutoAttack === 'function') this._onAutoAttack(res);
                } catch (e) {
                    console.warn('onAutoAttack listener failed:', e);
                }

                if (getCurrentHp(this.monster) <= 0 || (this.monster && typeof this.monster.isDead === 'function' && this.monster.isDead())) {
                    this.battleEnded = true;
                    this.stopAutoAttack();
                }
                if (res && res.playerHp <= 0) {
                    this.battleEnded = true;
                    this.stopAutoAttack();
                }
            } catch (e) {
                console.error('Auto monsterAttack failed:', e);
            }

            if (!this.battleEnded) {
                this._scheduleNextAutoAttack();
            }
        }, this._getMonsterAttackDelayMs());
    }

    _rescheduleAutoAttack() {
        if (!this._battleActive || this.battleEnded) return;
        if (!this._autoAttackIntervalId) return;
        clearTimeout(this._autoAttackIntervalId);
        this._autoAttackIntervalId = null;
        this._scheduleNextAutoAttack();
    }

    _isMonsterAlive() {
        return Boolean(
            this.monster
            && getCurrentHp(this.monster) > 0
            && !(typeof this.monster.isDead === 'function' && this.monster.isDead())
        );
    }

    _resolveWeaponProfileEffects(profile, hitType, computeRes, applyRes, slotType = 'weapon') {
        const effects = {
            statusEffects: [],
            attackerStatusEffects: [],
            triggerEvents: [],
            extraStrike: null
        };

        if (!profile) return effects;

        if (hitType === 'miss') {
            this._weaponProfileCombo = 0;
            if (profile.steadyStanceHitZoneBonus > 0) {
                this._clearSteadyStance(slotType);
            }
            return effects;
        }

        if (!applyRes?.finalDamage) return effects;

        this._weaponProfileCombo += 1;

        const armorPenetrationPercent = Number(computeRes?.breakdown?.profileArmorPenetrationBonus) || 0;
        if (armorPenetrationPercent > 0) {
            effects.triggerEvents.push({
                type: 'armorPenetration',
                profile,
                percent: armorPenetrationPercent
            });
        }

        if (profile.steadyStanceHitZoneBonus > 0) {
            const state = this._getWeaponProfileSlotState(slotType);
            const maxStacks = Math.max(1, Math.floor(Number(profile.steadyStanceMaxStacks) || 1));
            const bonusPerStack = Math.max(0, Number(profile.steadyStanceHitZoneBonus) || 0);
            state.steadyStanceStacks = Math.min(maxStacks, (Number(state.steadyStanceStacks) || 0) + 1);
            state.steadyStanceHitZoneBonusPercent = state.steadyStanceStacks * bonusPerStack * 100;
            effects.triggerEvents.push({
                type: 'steadyStance',
                profile,
                stacks: state.steadyStanceStacks,
                maxStacks,
                percent: state.steadyStanceHitZoneBonusPercent
            });
        }

        if (profile.bulwarkGuardReductionPercent > 0 && this._setBulwarkGuard(profile, slotType)) {
            effects.triggerEvents.push({
                type: 'bulwarkGuard',
                profile,
                percent: profile.bulwarkGuardReductionPercent
            });
        }

        const resonanceRequired = Math.max(0, Math.floor(Number(profile.resonanceStacksRequired) || 0));
        if (resonanceRequired > 0) {
            const state = this._getWeaponProfileSlotState(slotType);
            state.arcaneResonanceStacks = Math.min(
                resonanceRequired,
                (Number(state.arcaneResonanceStacks) || 0) + 1
            );

            if (state.arcaneResonanceStacks >= resonanceRequired) {
                state.arcaneResonanceStacks = 0;
                this._removeWeaponTriggerVisuals(buff => buff.triggerType === 'arcaneResonance');
                const element = getStrongestResonanceElement(
                    computeRes?.breakdown,
                    Array.isArray(profile.resonanceElements) ? profile.resonanceElements : []
                );
                const bonusPercent = Math.max(0, Number(profile.resonanceElementBonusPercent) || 0);

                if (element?.element === 'fire') {
                    effects.extraStrike = {
                        damage: Math.max(1, Math.floor((computeRes.damage || 1) * (bonusPercent / 100))),
                        label: '共鳴火焰',
                        triggerType: 'arcaneElement',
                        element: element.element,
                        elementLabel: element.label,
                        useElementBreakdown: false
                    };
                } else if (element?.element === 'ice') {
                    const percent = Math.max(8, Math.floor(element.value * (1 + bonusPercent / 100)));
                    effects.statusEffects.push({
                        type: 'slow',
                        percent,
                        duration: 2.5,
                        source: `weapon:${profile.id}:arcane_resonance`,
                        value: percent
                    });
                    effects.triggerEvents.push({
                        type: 'arcaneElement',
                        profile,
                        element: element.element,
                        elementLabel: element.label,
                        percent
                    });
                } else if (element?.element === 'thunder') {
                    const chance = Math.min(100, element.value + bonusPercent);
                    if (Math.random() * 100 < chance) {
                        effects.statusEffects.push({
                            type: 'stun',
                            duration: 1.0,
                            source: `weapon:${profile.id}:arcane_resonance`,
                            value: chance
                        });
                    }
                    effects.triggerEvents.push({
                        type: 'arcaneElement',
                        profile,
                        element: element.element,
                        elementLabel: element.label,
                        percent: chance
                    });
                } else if (element?.element === 'poison') {
                    const accumulate = Math.max(1, Math.floor(element.value * (bonusPercent / 100)));
                    effects.statusEffects.push({
                        type: 'poison',
                        accumulatePerSecond: accumulate,
                        duration: 3,
                        source: `weapon:${profile.id}:arcane_resonance`,
                        value: accumulate
                    });
                    effects.triggerEvents.push({
                        type: 'arcaneElement',
                        profile,
                        element: element.element,
                        elementLabel: element.label,
                        amount: accumulate
                    });
                } else {
                    effects.extraStrike = {
                        damage: Math.max(1, Math.floor((computeRes.damage || 1) * (profile.magicBoltDamageRatio || 0.45))),
                        label: profile.magicBoltLabel || 'Magic Bolt',
                        triggerType: 'magicBolt',
                        useElementBreakdown: false
                    };
                }
            } else {
                effects.triggerEvents.push({
                    type: 'arcaneResonance',
                    profile,
                    stacks: state.arcaneResonanceStacks,
                    maxStacks: resonanceRequired
                });
            }
        }

        if (
            profile.comboEvery > 0
            && this._weaponProfileCombo > 0
            && this._weaponProfileCombo % profile.comboEvery === 0
        ) {
            effects.extraStrike = {
                damage: Math.max(1, Math.floor((computeRes.damage || 1) * (profile.comboDamageRatio || 0.45))),
                label: profile.comboLabel || profile.label || 'Weapon Chain',
                triggerType: 'combo'
            };
        }

        return effects;
    }

    /**
     * Execute a player attack. Returns an object with computation and application results.
     * The method will schedule a monsterAttack() call after 1s if the battle hasn't ended.
     */
    playerAttack(hitType, options = {}) {
        if (this.attackCooldown || this.battleEnded) return null;

        const slotType = options.slotType || 'weapon';
        const attackWeapon = this._getWeaponInSlot(slotType);
        if (slotType !== 'weapon' && !attackWeapon) return null;

        // Weapon durability consumed regardless of hit
        let destroyedWeapon = null;
        try {
            destroyedWeapon = GameManager.reduceWeaponDurability(slotType);
        } catch (e) {
            // ignore; GameManager may not expose durability in some contexts
            console.warn('reduceWeaponDurability error:', e);
        }

        const equipmentAfterDurability = this.player?.equipment || {};
        const shouldUseTemporaryWeapon = Boolean(attackWeapon);
        if (shouldUseTemporaryWeapon) {
            this.player.equipment = {
                ...equipmentAfterDurability,
                weapon: attackWeapon,
                armor: slotType === 'armor' ? null : equipmentAfterDurability.armor
            };
        }

        try {

        // Compute damage
        let computeRes = { damage: 0, isCrit: false, breakdown: {} };
        try {
            computeRes = computePlayerAttack(this.player, hitType, this.monster);
        } catch (e) {
            console.error('computePlayerAttack failed:', e);
        }

        let applyRes = null;
        if (computeRes.damage > 0) {
            try {
                applyRes = applyDamage(this.player, this.monster, { damage: computeRes.damage, isCrit: computeRes.isCrit, breakdown: computeRes.breakdown });
                const pendingStatusEffects = [...(applyRes.appliedEffects || [])];
                const weaponProfile = getWeaponCombatProfile(this.player);
                const profileEffects = this._resolveWeaponProfileEffects(weaponProfile, hitType, computeRes, applyRes, slotType);
                const weaponTriggerEvents = [...(profileEffects.triggerEvents || [])];
                pendingStatusEffects.push(...profileEffects.statusEffects);
                applyRes.attackerEffects = [
                    ...(applyRes.attackerEffects || []),
                    ...profileEffects.attackerStatusEffects
                ];

                if (profileEffects.extraStrike && this._isMonsterAlive()) {
                    const strikeBreakdown = profileEffects.extraStrike.useElementBreakdown === false
                        ? {
                            profileStrike: true,
                            profileStrikeSource: weaponProfile.id,
                            weaponProfileId: weaponProfile.id,
                            weaponProfileLabel: weaponProfile.label
                        }
                        : {
                            ...computeRes.breakdown,
                            profileStrike: true,
                            profileStrikeSource: weaponProfile.id
                        };
                    const profileStrikeRes = applyDamage(this.player, this.monster, {
                        damage: profileEffects.extraStrike.damage,
                        isCrit: false,
                        breakdown: strikeBreakdown
                    });
                    applyRes.finalDamage += profileStrikeRes.finalDamage;
                    applyRes.afterHP = profileStrikeRes.afterHP;
                    applyRes.lifestealRecovered += profileStrikeRes.lifestealRecovered || 0;
                    pendingStatusEffects.push(...(profileStrikeRes.appliedEffects || []));
                    applyRes.profileStrike = {
                        ...profileStrikeRes,
                        label: profileEffects.extraStrike.label
                    };
                    weaponTriggerEvents.push({
                        type: profileEffects.extraStrike.triggerType || 'combo',
                        profile: weaponProfile,
                        amount: profileStrikeRes.finalDamage,
                        label: profileEffects.extraStrike.label,
                        element: profileEffects.extraStrike.element,
                        elementLabel: profileEffects.extraStrike.elementLabel
                    });
                }

                const effects = getEquipmentEffectTotals(this.player);
                if (
                    effects.doubleStrike > 0
                    && this.monster
                    && getCurrentHp(this.monster) > 0
                    && !(typeof this.monster.isDead === 'function' && this.monster.isDead())
                    && Math.random() * 100 < effects.doubleStrike
                ) {
                    const secondaryDamage = Math.max(1, Math.floor(computeRes.damage * 0.5));
                    const secondaryRes = applyDamage(this.player, this.monster, {
                        damage: secondaryDamage,
                        isCrit: false,
                        breakdown: { ...computeRes.breakdown, doubleStrike: true }
                    });
                    applyRes.finalDamage += secondaryRes.finalDamage;
                    applyRes.afterHP = secondaryRes.afterHP;
                    applyRes.lifestealRecovered += secondaryRes.lifestealRecovered || 0;
                    pendingStatusEffects.push(...(secondaryRes.appliedEffects || []));
                    applyRes.appliedEffects = pendingStatusEffects;
                    applyRes.doubleStrike = secondaryRes;
                }

                applyRes.appliedEffects = pendingStatusEffects;
                const statusEvents = this.applyMonsterStatusEffects(pendingStatusEffects);
                applyRes.statusEvents = statusEvents;
                const attackerStatusEvents = this.applyAttackerStatusEffects(applyRes.attackerEffects);
                applyRes.attackerStatusEvents = attackerStatusEvents;
                applyRes.weaponTriggerEvents = this.applyWeaponTriggerVisuals(weaponTriggerEvents);
                if (destroyedWeapon) {
                    this._clearWeaponProfileState(slotType);
                }
                if (attackerStatusEvents.length > 0) {
                    try {
                        if (typeof this._onStatusApplied === 'function') this._onStatusApplied(attackerStatusEvents);
                    } catch (e) {
                        console.warn('onStatusApplied listener failed:', e);
                    }
                }

                if (getCurrentHp(this.monster) <= 0 || (this.monster && typeof this.monster.isDead === 'function' && this.monster.isDead())) {
                    this.battleEnded = true;
                    this._clearWeaponProfileState();
                }
            } catch (e) {
                console.error('applyDamage failed:', e);
            }
        } else if (hitType === 'miss') {
            const weaponProfile = getWeaponCombatProfile(this.player);
            this._resolveWeaponProfileEffects(weaponProfile, hitType, computeRes, null, slotType);
            if (destroyedWeapon) {
                this._clearWeaponProfileState(slotType);
            }
        }

        // NOTE: counter-attack scheduling removed. Monster auto-attacks are handled
        // by startAutoAttack()/stopAutoAttack() using monster.attackSpeed.

        return { destroyedWeapon, computeRes, applyRes, slotType };
        } finally {
            if (shouldUseTemporaryWeapon) {
                this.player.equipment = equipmentAfterDurability;
            }
        }
    }

    /**
     * Monster performs its attack on player. Returns attack result.
     */
    monsterAttack() {
        if (this.battleEnded) return null;

        if (this._isMonsterStunned()) {
            this.turnCount++;
            return {
                damage: 0,
                destroyedArmor: null,
                playerHp: getCurrentHp(this.player),
                dodged: false,
                stunned: true,
                statusBlocked: 'stun'
            };
        }

        // Prefer the compute helper but fall back to simple subtraction
        let dmgObj = null;
        try {
            dmgObj = computeMonsterAttack(this.monster, this.player);
        } catch (e) {
            console.warn('computeMonsterAttack failed, falling back:', e);
        }

        let damage = 0;
        if (dmgObj && typeof dmgObj.damage === 'number') {
            damage = Math.max(1, Math.floor(dmgObj.damage));
        } else {
            const def = this.player.getTotalDef ? this.player.getTotalDef() : (this.player.def || 0);
            const monsterAttack = this.monster.attack ?? 0;
            damage = Math.max(1, Math.floor(monsterAttack - def));
        }

        const playerEffects = getEquipmentEffectTotals(this.player);
        if (playerEffects.dodgeChance > 0 && Math.random() * 100 < playerEffects.dodgeChance) {
            this.turnCount++;
            return {
                damage: 0,
                dodged: true,
                playerHp: getCurrentHp(this.player)
            };
        }

        const bulwarkResult = this._consumeBulwarkGuard(damage);
        damage = bulwarkResult.damage;

        // Apply to player
        if (typeof this.player.hp === 'number') {
            this.player.hp = Math.max(0, this.player.hp - damage);
        } else if (this.player.setHP) {
            const cur = this.player.getHP ? this.player.getHP() : 0;
            this.player.setHP(Math.max(0, cur - damage));
        }

        if (this._getPlayerHpRegenAmount() > 0) {
            this.startStatusTicker();
        }

        // Armor durability
        let destroyedArmor = null;
        try {
            destroyedArmor = GameManager.reduceArmorDurability();
        } catch (e) {
            console.warn('reduceArmorDurability error:', e);
        }

        let reflectedDamage = 0;
        if (damage > 0 && playerEffects.damageReflect > 0 && this.monster) {
            reflectedDamage = Math.max(1, Math.floor(damage * (playerEffects.damageReflect / 100)));
            if (typeof this.monster.hp === 'number') {
                this.monster.hp = Math.max(0, this.monster.hp - reflectedDamage);
            }
        }

        this.turnCount++;

        let revived = false;
        if (getCurrentHp(this.player) <= 0 && playerEffects.revive > 0 && Math.random() * 100 < playerEffects.revive) {
            const reviveHp = Math.max(1, Math.floor((getMaxHp(this.player) || 1) * 0.3));
            if (typeof this.player.hp === 'number') this.player.hp = reviveHp;
            else if (this.player.setHP) this.player.setHP(reviveHp);
            revived = true;
        }

        if (getCurrentHp(this.player) <= 0) {
            this.battleEnded = true;
            this._clearWeaponProfileState();
        }

        return {
            damage,
            destroyedArmor,
            playerHp: getCurrentHp(this.player),
            dodged: false,
            reflectedDamage,
            revived,
            bulwarkGuard: bulwarkResult.event
        };
    }

    /**
     * Start automatic monster attacks driven by the monster's `attackSpeed` (in seconds).
     * If `attackSpeed` is not set on the monster, a sensible default (1.5s) is used.
     */
    startAutoAttack() {
        // Avoid duplicate timers
        if (this._autoAttackIntervalId) return;
        // If the scene hasn't signalled that the battle is active (e.g. attack button
        // still disabled while waiting for engine), defer the actual interval start
        // to avoid monsters counting down and hitting the player during UI lag.
        if (!this._battleActive) {
            this._pendingAutoStart = true;
            return;
        }
        this._scheduleNextAutoAttack();
        if (this._hasStatusTickerWork()) this.startStatusTicker();
    }

    stopAutoAttack() {
        if (this._autoAttackIntervalId) {
            clearTimeout(this._autoAttackIntervalId);
            this._autoAttackIntervalId = null;
        }
        // clear pending flag as well
        this._pendingAutoStart = false;
    }

    /**
     * Mark the battle as begun (called by scene when attack UI is enabled).
     * If startAutoAttack() was called earlier, this will start the interval now.
     */
    beginBattle() {
        this._battleActive = true;
        // If startAutoAttack() was requested before battle activation, start it now
        if (this._pendingAutoStart) {
            this._pendingAutoStart = false;
            // startAutoAttack will no-op if interval already exists
            this.startAutoAttack();
        }
        if (this._hasStatusTickerWork()) this.startStatusTicker();
    }

    /**
     * End the battle explicitly: mark ended and stop auto-attack.
     */
    endBattle() {
        this.battleEnded = true;
        this._battleActive = false;
        this._pendingAutoStart = false;
        this._clearWeaponProfileState();
        this.stopAutoAttack();
        this.stopStatusTicker();
    }
}

export default {
    computePlayerAttack,
    computeMonsterAttack,
    applyDamage
};
