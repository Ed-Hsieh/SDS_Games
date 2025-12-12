/**
 * FightManager.js
 * Centralized fight/damage/special-effect manager.
 *
 * Purpose:
 * - Provide a single place for computing attack damage, elemental bonuses,
 *   special effects (lifesteal, damage reduction, dodge, thunder attack-speed buff),
 *   and applying the resulting damage to targets.
 * - Replace/adapt the existing DamageManager logic and expose a clearer
 *   API for battle systems.
 *
 * Enums used (from `src/js/models/Enums.js`):
 * - AffixStat: canonical keys for affix/effect names. We mainly read element
 *   keys such as `fire`, `ice`, `thunder`, `poison`, and effect keys like
 *   `lifesteal`, `damageReduction`, etc. This manager expects equipment
 *   objects to store effects in `specialEffects`, `affixBonuses`, or `affixes`.
 *
 * Exposed API:
 * - computePlayerAttack(player, hitType) -> { damage, isCrit, thunderBuffPercent, breakdown }
 * - computeMonsterAttack(monster, player) -> { damage }
 * - applyDamage(attacker, target, damageObj) -> { finalDamage, beforeHP, afterHP, lifestealRecovered }
 * - utilities exported for tests: _toPercentValue, _sumPercentFromEquipment
 */

import GameManager from './GameManager.js';
import { AffixStat } from '../models/Enums.js';

function toPercentValue(raw) {
    const n = Number(raw || 0);
    if (n === 0) return 0;
    if (Math.abs(n) <= 1) return n * 100;
    return n;
}

function _getValueFromItem(item, wantedKeys = []) {
    // returns numeric total (not percent) from a single item for matched keys
    let total = 0;
    if (!item) return 0;

    // specialEffects: array of { type, value }
    if (item.specialEffects && Array.isArray(item.specialEffects)) {
        for (const eff of item.specialEffects) {
            if (!eff || !eff.type) continue;
            const t = String(eff.type).toLowerCase();
            for (const k of wantedKeys) {
                if (t === String(k).toLowerCase() || t.indexOf(String(k).toLowerCase()) !== -1) {
                    total += Number(eff.value || 0);
                }
            }
        }
    }

    // affixBonuses: plain object map
    if (item.affixBonuses && typeof item.affixBonuses === 'object') {
        for (const prop of Object.keys(item.affixBonuses)) {
            for (const k of wantedKeys) {
                if (prop.toLowerCase() === String(k).toLowerCase() || prop.toLowerCase().indexOf(String(k).toLowerCase()) !== -1) {
                    total += Number(item.affixBonuses[prop] || 0);
                }
            }
        }
    }

    // affixes: array of { stats: { key: value } }
    if (item.affixes && Array.isArray(item.affixes)) {
        for (const a of item.affixes) {
            if (!a || !a.stats) continue;
            for (const prop of Object.keys(a.stats)) {
                for (const k of wantedKeys) {
                    if (prop.toLowerCase() === String(k).toLowerCase() || prop.toLowerCase().indexOf(String(k).toLowerCase()) !== -1) {
                        total += Number(a.stats[prop] || 0);
                    }
                }
            }
        }
    }

    return total;
}

function sumPercentFromEquipment(equipmentSlots, keys) {
    let total = 0;
    for (const item of equipmentSlots) {
        if (!item) continue;
        const v = _getValueFromItem(item, keys);
        total += toPercentValue(v);
    }
    return total;
}

/**
 * Compute player attack damage (includes elemental bonuses and crit handling)
 * hitType: 'crit' | 'hit' | 'miss'
 */
export function computePlayerAttack(player, hitType) {
    if (!player) return { damage: 0, isCrit: false, thunderBuffPercent: 0, breakdown: {} };

    const playerAtk = player.getTotalAtk ? player.getTotalAtk() : (player.atk || 0);
    if (hitType === 'miss') return { damage: 0, isCrit: false, thunderBuffPercent: 0, breakdown: { base: 0 } };

    let damage = 0;
    let isCrit = false;
    if (hitType === 'crit') {
        const critMult = player.getCritDamage ? player.getCritDamage() : 1.5;
        damage = Math.floor(playerAtk * critMult);
        isCrit = true;
    } else {
        damage = Math.floor(playerAtk);
    }

    // Gather element percent bonuses from equipped items
    const equipmentSlots = Object.values(player.equipment || {});
    const firePercent = sumPercentFromEquipment(equipmentSlots, [AffixStat.FIRE]);
    const icePercent = sumPercentFromEquipment(equipmentSlots, [AffixStat.ICE]);
    const thunderPercent = sumPercentFromEquipment(equipmentSlots, [AffixStat.THUNDER]);
    const poisonPercent = sumPercentFromEquipment(equipmentSlots, [AffixStat.POISON]);
    // light used as attack-speed buff in some systems
    const lightPercent = sumPercentFromEquipment(equipmentSlots, [AffixStat.LIGHT]);

    const elementalPercentTotal = firePercent + icePercent + thunderPercent + poisonPercent;
    let elementalBonus = 0;
    if (elementalPercentTotal > 0 && damage > 0) {
        elementalBonus = Math.floor(damage * (elementalPercentTotal / 100));
        damage += elementalBonus;
    }

    const thunderBuffPercent = thunderPercent; // returned for callers to apply temporary attack-speed buffs

    const breakdown = {
        base: Math.floor(playerAtk),
        crit: isCrit,
        elementalPercentTotal,
        elementalBonus,
        thunderBuffPercent,
        lightPercent
    };

    return { damage, isCrit, thunderBuffPercent, breakdown };
}

/**
 * Compute monster attack damage against a player
 * This uses player's total defense if available
 */
export function computeMonsterAttack(monster, player) {
    if (!monster || !player) return { damage: 1 };
    const def = player.getTotalDef ? player.getTotalDef() : (player.def || 0);
    const raw = (monster.attack || 0) - def;
    const damage = Math.max(1, Math.floor(raw));
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

    const beforeHP = (typeof target.hp === 'number') ? target.hp : (target.getHP ? target.getHP() : 0);
    let damage = Math.max(0, Math.floor(damageObj.damage || 0));

    // Damage reduction on target from equipment (percent)
    const targetEquip = Object.values(target.equipment || {});
    const targetDamageReduction = sumPercentFromEquipment(targetEquip, ['damageReduction', 'damage_reduction', AffixStat.DAMAGE_REDUCTION]);
    if (targetDamageReduction > 0) {
        const red = Math.min(100, targetDamageReduction);
        damage = Math.floor(damage * (1 - red / 100));
    }

    // Ensure at least 1 damage if original damage > 0
    const finalDamage = damage > 0 ? Math.max(1, damage) : 0;

    // Apply HP change
    if (typeof target.hp === 'number') {
        target.hp = Math.max(0, target.hp - finalDamage);
    } else if (target.setHP) {
        const newHP = Math.max(0, beforeHP - finalDamage);
        target.setHP(newHP);
    }

    // Lifesteal: apply to attacker if present
    let lifestealRecovered = 0;
    if (attacker) {
        const atkEquip = Object.values(attacker.equipment || {});
        const lifestealPercent = sumPercentFromEquipment(atkEquip, ['lifesteal', AffixStat.LIFE_STEAL]);
        if (lifestealPercent > 0 && finalDamage > 0) {
            // lifestealPercent is in percent units
            lifestealRecovered = Math.floor(finalDamage * (lifestealPercent / 100));
            if (typeof attacker.hp === 'number') {
                attacker.hp = Math.min((attacker.maxHp || Infinity), attacker.hp + lifestealRecovered);
            } else if (attacker.setHP) {
                const cur = attacker.getHP ? attacker.getHP() : 0;
                attacker.setHP(cur + lifestealRecovered);
            }
        }
    }

    const afterHP = (typeof target.hp === 'number') ? target.hp : (target.getHP ? target.getHP() : 0);

    return { finalDamage, beforeHP, afterHP, lifestealRecovered };
}

export default {
    computePlayerAttack,
    computeMonsterAttack,
    applyDamage,
    // exposed helpers
    _toPercentValue: toPercentValue,
    _sumPercentFromEquipment: sumPercentFromEquipment
};
