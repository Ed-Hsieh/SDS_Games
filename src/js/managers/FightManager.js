
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

    return monster;
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

    // Apply only fire as extra damage; other elements produce special effects
    let elementalBonus = 0;
    if (firePercent > 0 && damage > 0) {
        elementalBonus = Math.floor(damage * (firePercent / 100));
        damage += elementalBonus;
    }

    const breakdown = {
        base: Math.floor(playerAtk),
        crit: isCrit,
        firePercent,
        icePercent,
        thunderPercent,
        poisonPercent,
        lightPercent,
        elementalBonus
    };

    const thunderBuffPercent = breakdown.thunderPercent || 0;
    return { damage, isCrit, thunderBuffPercent, breakdown };
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

    // Subtract flat defense if present (ensure consistency with Monster.takeDamage)
    const targetDef = (typeof target.getTotalDef === 'function') ? (target.getTotalDef()) : (target.def || target.defense || 0);
    if (targetDef && damage > 0) {
        // Calculate armor penetration from attacker equipment (reduces target armor before subtraction)
        const atkEquipForPen = attacker ? Object.values(attacker.equipment || {}) : [];
        const armorPenPercent = sumPercentFromEquipment(atkEquipForPen, ['armorPenetration', 'armor_penetration', AffixStat.ARMOR_PENETRATION, 'armor_pierce', 'armorPierce']);
        const pen = Math.max(0, Math.min(100, armorPenPercent || 0));
        const effectiveDef = Math.max(0, Math.floor(targetDef * (1 - pen / 100)));
        damage = Math.max(0, Math.floor(damage - effectiveDef));
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

    // Elemental effects (from damageObj.breakdown)
    const breakdown = damageObj.breakdown || {};
    const icePercent = breakdown.icePercent || 0;
    const thunderPercent = breakdown.thunderPercent || 0;
    const poisonPercent = breakdown.poisonPercent || 0;
    const lightPercent = breakdown.lightPercent || 0;

    const appliedEffects = [];
    const attackerEffects = [];

    // Thunder: chance to stun on hit
    if (thunderPercent > 0 && finalDamage > 0) {
        const roll = Math.random() * 100;
        if (roll < thunderPercent) {
            // stun duration: 1.5s (configurable later)
            appliedEffects.push({ type: 'stun', duration: 1.5, source: 'thunder', value: thunderPercent });
        }
    }

    // Ice: apply slow to target for 3 seconds
    if (icePercent > 0 && finalDamage > 0) {
        appliedEffects.push({ type: 'slow', percent: icePercent, duration: 3, source: 'ice' });
    }

    // Poison: apply damage-over-time (DPS) for 3 seconds
    if (poisonPercent > 0 && finalDamage > 0) {
        appliedEffects.push({ type: 'poison', dps: poisonPercent, duration: 3, source: 'poison' });
    }

    // Light: attack speed buff applied to attacker (stacking).
    // We do not mutate attacker stats directly here; instead return the buff for caller to apply.
    if (lightPercent > 0 && attacker) {
        attackerEffects.push({ type: 'attackSpeed', percent: lightPercent, stacking: 'infinite', source: 'light' });
    }

    return { finalDamage, beforeHP, afterHP, lifestealRecovered, appliedEffects, attackerEffects };
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
        this.battleEnded = false;
        this.attackCooldown = false;
        this.turnCount = 0;
        // Whether the scene has signalled the battle has actually begun (UI enabled)
        this._battleActive = false;
        // If startAutoAttack() was called before battle began, remember to start later
        this._pendingAutoStart = false;
        // Optional callback invoked when auto-attack runs (scene may register)
        this._onAutoAttack = null;
    }

    /**
     * Execute a player attack. Returns an object with computation and application results.
     * The method will schedule a monsterAttack() call after 1s if the battle hasn't ended.
     */
    playerAttack(hitType) {
        if (this.attackCooldown || this.battleEnded) return null;

        // Weapon durability consumed regardless of hit
        let destroyedWeapon = null;
        try {
            destroyedWeapon = GameManager.reduceWeaponDurability();
        } catch (e) {
            // ignore; GameManager may not expose durability in some contexts
            console.warn('reduceWeaponDurability error:', e);
        }

        // Compute damage
        let computeRes = { damage: 0, isCrit: false, breakdown: {} };
        try {
            computeRes = computePlayerAttack(this.player, hitType);
        } catch (e) {
            console.error('computePlayerAttack failed:', e);
        }

        let applyRes = null;
        if (computeRes.damage > 0) {
            try {
                applyRes = applyDamage(this.player, this.monster, { damage: computeRes.damage, isCrit: computeRes.isCrit, breakdown: computeRes.breakdown });

                if (this.monster && typeof this.monster.isDead === 'function' && this.monster.isDead()) {
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

        return { destroyedWeapon, computeRes, applyRes };
    }

    /**
     * Monster performs its attack on player. Returns attack result.
     */
    monsterAttack() {
        if (this.battleEnded) return null;

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

        // Apply to player
        if (typeof this.player.hp === 'number') {
            this.player.hp = Math.max(0, this.player.hp - damage);
        } else if (this.player.setHP) {
            const cur = this.player.getHP ? this.player.getHP() : 0;
            this.player.setHP(Math.max(0, cur - damage));
        }

        // Armor durability
        let destroyedArmor = null;
        try {
            destroyedArmor = GameManager.reduceArmorDurability();
        } catch (e) {
            console.warn('reduceArmorDurability error:', e);
        }

        this.turnCount++;

        if ((this.player.hp || (this.player.getHP ? this.player.getHP() : 0)) <= 0) {
            this.battleEnded = true;
        }

        return { damage, destroyedArmor, playerHp: this.player.hp || (this.player.getHP ? this.player.getHP() : 0) };
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

        const attackSpeedSec = (this.monster && (this.monster.attackSpeed || this.monster.attack_speed)) || 1.5;
        const ms = Math.max(200, Math.floor(attackSpeedSec * 1000));

        this._autoAttackIntervalId = setInterval(() => {
            if (this.battleEnded) {
                this.stopAutoAttack();
                return;
            }

            try {
                const res = this.monsterAttack();
                // Notify listener (scene) so UI can be updated
                try {
                    if (this._onAutoAttack && typeof this._onAutoAttack === 'function') this._onAutoAttack(res);
                } catch (e) {
                    console.warn('onAutoAttack listener failed:', e);
                }
                // If monster died or player died, stop auto-attack
                if (this.monster && typeof this.monster.isDead === 'function' && this.monster.isDead()) {
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
        }, ms);
    }

    stopAutoAttack() {
        if (this._autoAttackIntervalId) {
            clearInterval(this._autoAttackIntervalId);
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
    }

    /**
     * End the battle explicitly: mark ended and stop auto-attack.
     */
    endBattle() {
        this.battleEnded = true;
        this._battleActive = false;
        this._pendingAutoStart = false;
        this.stopAutoAttack();
    }
}

export default {
    computePlayerAttack,
    computeMonsterAttack,
    applyDamage,
    // exposed helpers
    _toPercentValue: toPercentValue,
    _sumPercentFromEquipment: sumPercentFromEquipment
};
