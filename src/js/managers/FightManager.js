
import GameManager from './GameManager.js';
import { getEquipmentEffectTotals } from './EquipmentEffectResolver.js';
import { applyMonsterCombatBalance } from '../data/CombatBalance.js';
import { getWeaponCombatProfile, getWeaponLifestealBounds } from '../utils/WeaponCombatProfile.js';

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
    return (typeof entity?.hp === 'number') ? entity.hp : (entity?.getHP ? entity.getHP() : 0);
}

function getMaxHp(entity) {
    return (typeof entity?.maxHp === 'number') ? entity.maxHp : (entity?.getMaxHP ? entity.getMaxHP() : 0);
}

function getEntityDefense(entity) {
    if (!entity) return 0;
    if (typeof entity.getTotalDef === 'function') return Number(entity.getTotalDef()) || 0;
    return Number(entity.defense ?? entity.def ?? entity.armor ?? 0) || 0;
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
        if ('currentHp' in entity) entity.currentHp = nextHp;
    } else if (entity?.setHP) {
        entity.setHP(nextHp);
        if ('currentHp' in entity) entity.currentHp = nextHp;
    } else if (entity) {
        entity.hp = nextHp;
        entity.currentHp = nextHp;
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

function rollFlatLifestealBonus(bounds) {
    if (!bounds) return 0;
    const min = Math.max(0, Math.floor(Number(bounds.min) || 0));
    const max = Math.max(min, Math.floor(Number(bounds.max) || min));
    if (max <= 0) return 0;
    return min + Math.floor(Math.random() * (max - min + 1));
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

export function normalizeMonsterCombatStats(monster) {
    if (!monster) return monster;

    const attack = monster.attack ?? monster.atk ?? 0;
    const defense = monster.defense ?? monster.def ?? 0;
    const hp = monster.hp ?? monster.currentHp ?? monster.maxHp ?? 0;
    const maxHp = monster.maxHp ?? monster.hp ?? hp;

    monster.attack = attack;
    monster.atk = attack;
    monster.defense = defense;
    monster.def = defense;
    monster.hp = hp;
    monster.maxHp = maxHp;
    if (monster.currentHp === undefined) monster.currentHp = hp;

    return applyMonsterCombatBalance(monster);
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
    const normalizedMonster = normalizeMonsterCombatStats(monster);
    const raw = (normalizedMonster.attack || 0) - def;
    let damage = Math.max(1, Math.floor(raw));
    const damageReduction = typeof player.getDamageReduction === 'function'
        ? Number(player.getDamageReduction()) || 0
        : 0;
    if (damageReduction > 0) {
        damage = Math.max(1, Math.floor(damage * (1 - Math.min(damageReduction, 0.75))));
    }
    damage = applyMonsterDamagePassiveMitigation(
        normalizedMonster,
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
    const targetDef = (typeof target.getTotalDef === 'function') ? (target.getTotalDef()) : (target.def || target.defense || 0);
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
    if (typeof target.hp === 'number') {
        target.hp = Math.max(0, target.hp - finalDamage);
        if ('currentHp' in target) target.currentHp = target.hp;
    } else if (target.setHP) {
        const newHP = Math.max(0, beforeHP - finalDamage);
        target.setHP(newHP);
        if ('currentHp' in target) target.currentHp = newHP;
    }

    // Lifesteal: apply to attacker if present
    let lifestealRecovered = 0;
    if (attacker) {
        const lifestealPercent = attackerEffects.lifesteal;
        const lifestealBaseDamage = poisonExecuted ? directDamage : finalDamage;
        if (lifestealPercent > 0 && lifestealBaseDamage > 0) {
            const currentHp = getCurrentHp(attacker);
            const maxHp = getMaxHp(attacker) || Infinity;
            const missingHp = Math.max(0, maxHp - currentHp);
            const flatLifesteal = rollFlatLifestealBonus(getWeaponLifestealBounds(attacker));
            const percentLifesteal = Math.max(1, Math.floor(lifestealBaseDamage * (lifestealPercent / 100)));
            // Small early-game hits should still visibly trigger lifesteal.
            lifestealRecovered = missingHp > 0
                ? Math.min(missingHp, Math.max(percentLifesteal, flatLifesteal))
                : 0;
            if (typeof attacker.hp === 'number') {
                attacker.hp = Math.min((attacker.maxHp || Infinity), attacker.hp + lifestealRecovered);
            } else if (attacker.setHP) {
                attacker.setHP(Math.min(maxHp, currentHp + lifestealRecovered));
            }
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
        this.monster = normalizeMonsterCombatStats(monster);
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

    _resolveWeaponProfileEffects(profile, hitType, computeRes, applyRes) {
        const effects = {
            statusEffects: [],
            attackerStatusEffects: [],
            extraStrike: null
        };

        if (!profile || hitType === 'miss' || !applyRes?.finalDamage) {
            this._weaponProfileCombo = 0;
            return effects;
        }

        this._weaponProfileCombo += 1;

        const targetDefense = getEntityDefense(this.monster);
        const canArmorBreak = profile.armorBreakPercent > 0
            && (
                hitType === 'crit'
                || targetDefense >= (Number(profile.armorBreakMinDefense) || Infinity)
            );
        if (canArmorBreak) {
            effects.statusEffects.push({
                type: 'armorBreak',
                percent: profile.armorBreakPercent,
                duration: profile.armorBreakDuration || 4,
                source: `weapon:${profile.id}`,
                value: profile.armorBreakPercent
            });
        }

        if (profile.slowChance > 0 && (!profile.slowRequiresCrit || hitType === 'crit')) {
            const chance = hitType === 'crit'
                ? Math.max(profile.slowChance, 75)
                : profile.slowChance;
            if (Math.random() * 100 < chance) {
                effects.statusEffects.push({
                    type: 'slow',
                    percent: profile.slowPercent || 20,
                    duration: profile.slowDuration || 2.5,
                    source: `weapon:${profile.id}`,
                    value: chance
                });
            }
        }

        if (profile.critTempoPercent > 0 && hitType === 'crit') {
            effects.attackerStatusEffects.push({
                type: 'attackSpeed',
                percent: profile.critTempoPercent,
                stacking: 'infinite',
                source: `weapon:${profile.id}`
            });
        }

        if (
            profile.comboEvery > 0
            && this._weaponProfileCombo > 0
            && this._weaponProfileCombo % profile.comboEvery === 0
        ) {
            effects.extraStrike = {
                damage: Math.max(1, Math.floor((computeRes.damage || 1) * (profile.comboDamageRatio || 0.45))),
                label: profile.comboLabel || profile.label || 'Weapon Chain'
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
                const profileEffects = this._resolveWeaponProfileEffects(weaponProfile, hitType, computeRes, applyRes);
                pendingStatusEffects.push(...profileEffects.statusEffects);
                applyRes.attackerEffects = [
                    ...(applyRes.attackerEffects || []),
                    ...profileEffects.attackerStatusEffects
                ];

                if (profileEffects.extraStrike && this._isMonsterAlive()) {
                    const profileStrikeRes = applyDamage(this.player, this.monster, {
                        damage: profileEffects.extraStrike.damage,
                        isCrit: false,
                        breakdown: {
                            ...computeRes.breakdown,
                            profileStrike: true,
                            profileStrikeSource: weaponProfile.id
                        }
                    });
                    applyRes.finalDamage += profileStrikeRes.finalDamage;
                    applyRes.afterHP = profileStrikeRes.afterHP;
                    applyRes.lifestealRecovered += profileStrikeRes.lifestealRecovered || 0;
                    pendingStatusEffects.push(...(profileStrikeRes.appliedEffects || []));
                    applyRes.profileStrike = {
                        ...profileStrikeRes,
                        label: profileEffects.extraStrike.label
                    };
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
                if (attackerStatusEvents.length > 0) {
                    try {
                        if (typeof this._onStatusApplied === 'function') this._onStatusApplied(attackerStatusEvents);
                    } catch (e) {
                        console.warn('onStatusApplied listener failed:', e);
                    }
                }

                if (getCurrentHp(this.monster) <= 0 || (this.monster && typeof this.monster.isDead === 'function' && this.monster.isDead())) {
                    this.battleEnded = true;
                }
            } catch (e) {
                console.error('applyDamage failed:', e);
            }
        } else if (hitType === 'miss') {
            // nothing else to do
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
            const monsterAttack = (this.monster.attack ?? this.monster.atk ?? 0);
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
                if ('currentHp' in this.monster) this.monster.currentHp = this.monster.hp;
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
        }

        return {
            damage,
            destroyedArmor,
            playerHp: getCurrentHp(this.player),
            dodged: false,
            reflectedDamage,
            revived
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
        this.stopAutoAttack();
        this.stopStatusTicker();
    }
}

export default {
    computePlayerAttack,
    computeMonsterAttack,
    applyDamage
};
