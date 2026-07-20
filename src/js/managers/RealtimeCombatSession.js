import { getWeaponCombatProfile } from '../utils/WeaponCombatProfile.js';

export const CombatSessionPhase = Object.freeze({
    IDLE: 'idle',
    RUNNING: 'running',
    PAUSED: 'paused',
    VICTORY: 'victory',
    DEFEAT: 'defeat',
    ESCAPED: 'escaped'
});

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const copyAction = action => action ? { ...action } : null;

function numberOr(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeWeapon(raw = {}, slot = 'main') {
    return {
        id: raw.id || `${slot}_weapon`,
        name: raw.name || (slot === 'main' ? '主武器' : '副武器'),
        effect: raw.effect || (slot === 'main' ? 'sword' : 'lance'),
        icon: raw.icon || '',
        profile: raw.profile ? { ...raw.profile } : null,
        element: String(raw.element || '').toLowerCase(),
        hasArmor: Boolean(raw.hasArmor),
        monsterDefense: Math.max(0, numberOr(raw.monsterDefense, 0)),
        damage: Math.max(1, Math.floor(Number(raw.damage) || (slot === 'main' ? 96 : 121))),
        cooldown: Math.max(0.1, Number(raw.cooldown) || (slot === 'main' ? 0.72 : 1.05)),
        windup: Math.max(0, Number(raw.windup) || (slot === 'main' ? 0.09 : 0.2)),
        critDamage: clamp(numberOr(raw.critDamage, 1.5), 1, 4),
        lifesteal: clamp(numberOr(raw.lifesteal, 0), 0, 500),
        damageMultiplier: clamp(numberOr(raw.damageMultiplier, 1), 0.1, 5),
        critDamageMultiplier: clamp(numberOr(raw.critDamageMultiplier, 1), 0.1, 5),
        triggerBuff: raw.triggerBuff ? normalizeBuff(raw.triggerBuff) : null,
        enabled: raw.enabled !== false
    };
}

function normalizeMonsterAttack(raw = {}, index = 0) {
    return {
        id: raw.id || `monster_attack_${index + 1}`,
        name: raw.name || `敵方招式 ${index + 1}`,
        effect: raw.effect || 'claw',
        damage: Math.max(0, Math.floor(numberOr(raw.damage, 35))),
        telegraph: Math.max(0.25, Number(raw.telegraph) || 0.85),
        impactDelay: Math.max(0, numberOr(raw.impactDelay, 0.18)),
        recovery: Math.max(0.35, Number(raw.recovery) || 1.15),
        cooldown: Math.max(0, numberOr(raw.cooldown, 0)),
        isSkill: Boolean(raw.isSkill),
        skillId: raw.skillId || null,
        playerEffect: raw.playerEffect ? normalizeStatus(raw.playerEffect) : null,
        monsterEffect: raw.monsterEffect ? normalizeStatus(raw.monsterEffect) : null,
        healFromDamagePercent: Math.max(0, numberOr(raw.healFromDamagePercent, 0))
    };
}

function normalizeStatus(raw = {}, index = 0) {
    const duration = Math.max(0.1, numberOr(raw.duration, 3));
    return {
        id: raw.id || `combat_status_${index + 1}`,
        name: raw.name || '狀態效果',
        icon: raw.icon || '•',
        tone: raw.tone || 'neutral',
        duration,
        remaining: clamp(numberOr(raw.remaining, duration), 0, duration),
        damagePerSecond: Math.max(0, numberOr(raw.damagePerSecond, 0)),
        healPerSecond: Math.max(0, numberOr(raw.healPerSecond, 0)),
        tickProgress: numberOr(raw.tickProgress, 0),
        attackInterval: Math.max(0, numberOr(raw.attackInterval, 0)),
        summonDamage: Math.max(0, numberOr(raw.summonDamage, 0)),
        interceptHits: Math.max(0, Math.floor(numberOr(raw.interceptHits, 0))),
        summonProgress: numberOr(raw.summonProgress, 0),
        modifiers: {
            damage: clamp(numberOr(raw.modifiers?.damage, 1), 0.1, 5),
            incomingDamage: clamp(numberOr(raw.modifiers?.incomingDamage, 1), 0.1, 5),
            attackCooldown: clamp(numberOr(raw.modifiers?.attackCooldown, 1), 0.25, 4),
            dodgeChance: clamp(numberOr(raw.modifiers?.dodgeChance, 0), 0, 0.9),
            critChance: clamp(numberOr(raw.modifiers?.critChance, 0), 0, 0.9)
        }
    };
}

function normalizeBuff(raw = {}, index = 0) {
    const duration = Math.max(0.1, numberOr(raw.duration, 8));
    return {
        id: raw.id || `player_buff_${index + 1}`,
        name: raw.name || `增益效果 ${index + 1}`,
        icon: raw.icon || '',
        duration,
        remaining: clamp(numberOr(raw.remaining, duration), 0, duration),
        stacks: Math.max(0, Math.floor(numberOr(raw.stacks, 0))),
        maxStacks: Math.max(0, Math.floor(numberOr(raw.maxStacks, 0))),
        modifiers: {
            damage: clamp(numberOr(raw.modifiers?.damage, 1), 0.1, 5),
            incomingDamage: clamp(numberOr(raw.modifiers?.incomingDamage, 1), 0.1, 5),
            hitZoneBonus: Math.max(0, numberOr(raw.modifiers?.hitZoneBonus, 0))
        }
    };
}

function normalizeConfig(config = {}) {
    const playerMaxHp = Math.max(1, Math.floor(Number(config.player?.maxHp) || 420));
    const monsterMaxHp = Math.max(1, Math.floor(Number(config.monster?.maxHp) || 1840));
    const attacks = Array.isArray(config.monster?.attacks) && config.monster.attacks.length > 0
        ? config.monster.attacks.map(normalizeMonsterAttack)
        : [normalizeMonsterAttack()];

    return {
        player: {
            name: config.player?.name || '玩家',
            maxHp: playerMaxHp,
            hp: clamp(Math.floor(Number(config.player?.hp) || playerMaxHp), 1, playerMaxHp),
            maxPotions: Math.max(0, Math.floor(numberOr(config.player?.potions ?? config.player?.maxPotions, 5))),
            potionHeal: Math.max(1, Math.floor(Number(config.player?.potionHeal) || 118)),
            potionCooldown: Math.max(0.1, Number(config.player?.potionCooldown) || 1.2),
            buffs: Array.isArray(config.player?.buffs)
                ? config.player.buffs.map(normalizeBuff)
                : []
        },
        monster: {
            id: config.monster?.id || 'combat_target',
            name: config.monster?.name || '敵人',
            maxHp: monsterMaxHp,
            hp: monsterMaxHp,
            attacks,
            initialDelay: Math.max(0.35, Number(config.monster?.initialDelay) || 1.25)
        },
        loadout: {
            main: normalizeWeapon(config.loadout?.main, 'main'),
            offhand: normalizeWeapon(config.loadout?.offhand, 'offhand')
        },
        fleeChance: clamp(numberOr(config.fleeChance, 0.35), 0, 1),
        fleeCooldown: Math.max(0.5, numberOr(config.fleeCooldown, 2)),
        random: typeof config.random === 'function' ? config.random : Math.random,
        tempo: clamp(Number(config.tempo) || 1, 0.5, 2)
    };
}

export default class RealtimeCombatSession {
    constructor(config = {}) {
        this.listeners = new Set();
        this.frameId = null;
        this.lastTickAt = 0;
        this.configure(config);
        this.tick = this.tick.bind(this);
    }

    configure(config = {}) {
        this.stopLoop();
        this.config = normalizeConfig(config);
        this.phase = CombatSessionPhase.IDLE;
        this.player = {
            name: this.config.player.name,
            maxHp: this.config.player.maxHp,
            hp: this.config.player.hp,
            potions: this.config.player.maxPotions,
            maxPotions: this.config.player.maxPotions,
            potionHeal: this.config.player.potionHeal
        };
        this.player.buffs = this.config.player.buffs.map(buff => ({
            ...buff,
            modifiers: { ...buff.modifiers }
        }));
        this.player.statuses = [];
        this.monster = {
            id: this.config.monster.id,
            name: this.config.monster.name,
            maxHp: this.config.monster.maxHp,
            hp: this.config.monster.hp,
            statuses: []
        };
        this.loadout = {
            main: { ...this.config.loadout.main },
            offhand: { ...this.config.loadout.offhand }
        };
        this.weaponStates = {
            main: { combo: 0, steadyStacks: 0, resonanceStacks: 0 },
            offhand: { combo: 0, steadyStacks: 0, resonanceStacks: 0 }
        };
        this.cooldowns = { main: 0, offhand: 0, potion: 0, flee: 0 };
        this.pendingPlayerAttacks = [];
        this.monsterIntent = null;
        this.pendingMonsterImpact = null;
        this.monsterFlowPaused = Boolean(config.monsterFlowPaused);
        this.nextMonsterActionIn = this.config.monster.initialDelay;
        this.monsterAttackIndex = 0;
        this.monsterAttackCooldowns = Object.fromEntries(
            this.config.monster.attacks.map(attack => [attack.id, attack.isSkill ? Math.min(2.5, attack.cooldown * 0.5) : 0])
        );
        this.emit('session:configured');
    }

    subscribe(listener) {
        if (typeof listener !== 'function') return () => {};
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    emit(type, payload = {}) {
        const event = { type, ...payload, snapshot: this.getSnapshot() };
        this.listeners.forEach(listener => {
            try {
                listener(event);
            } catch (error) {
                console.error(`RealtimeCombatSession listener failed for ${type}:`, error);
            }
        });
        return event;
    }

    getSnapshot() {
        const intent = this.monsterIntent
            ? {
                attack: copyAction(this.monsterIntent.attack),
                remaining: this.monsterIntent.remaining,
                total: this.monsterIntent.total,
                progress: clamp(1 - this.monsterIntent.remaining / this.monsterIntent.total, 0, 1)
            }
            : null;

        const pendingMonsterImpact = this.pendingMonsterImpact
            ? {
                attack: copyAction(this.pendingMonsterImpact.attack),
                remaining: this.pendingMonsterImpact.remaining,
                total: this.pendingMonsterImpact.total,
                progress: clamp(
                    1 - this.pendingMonsterImpact.remaining / Math.max(this.pendingMonsterImpact.total, 0.001),
                    0,
                    1
                )
            }
            : null;

        return {
            phase: this.phase,
            tempo: this.config.tempo,
            player: {
                ...this.player,
                buffs: this.player.buffs.map(buff => ({
                    ...buff,
                    modifiers: { ...buff.modifiers }
                })),
                statuses: this.player.statuses.map(status => ({ ...status, modifiers: { ...status.modifiers } }))
            },
            monster: {
                ...this.monster,
                statuses: this.monster.statuses.map(status => ({ ...status, modifiers: { ...status.modifiers } }))
            },
            loadout: {
                main: { ...this.loadout.main },
                offhand: { ...this.loadout.offhand }
            },
            cooldowns: { ...this.cooldowns },
            monsterIntent: intent,
            pendingMonsterImpact,
            monsterFlowPaused: this.monsterFlowPaused,
            nextMonsterActionIn: this.nextMonsterActionIn,
            pendingPlayerAttacks: this.pendingPlayerAttacks.map(entry => ({
                slot: entry.slot,
                hitType: entry.hitType,
                remaining: entry.remaining,
                total: entry.total
            }))
        };
    }

    setTempo(value) {
        this.config.tempo = clamp(Number(value) || 1, 0.5, 2);
        this.emit('session:tempo');
    }

    start() {
        if (this.phase === CombatSessionPhase.RUNNING) return false;
        if (
            this.phase === CombatSessionPhase.VICTORY
            || this.phase === CombatSessionPhase.DEFEAT
            || this.phase === CombatSessionPhase.ESCAPED
        ) {
            this.reset();
        }
        this.phase = CombatSessionPhase.RUNNING;
        this.lastTickAt = performance.now();
        this.emit('battle:start');
        this.startLoop();
        return true;
    }

    pause() {
        if (this.phase !== CombatSessionPhase.RUNNING) return false;
        this.phase = CombatSessionPhase.PAUSED;
        this.stopLoop();
        this.emit('battle:pause');
        return true;
    }

    resume() {
        if (this.phase !== CombatSessionPhase.PAUSED) return false;
        this.phase = CombatSessionPhase.RUNNING;
        this.lastTickAt = performance.now();
        this.emit('battle:resume');
        this.startLoop();
        return true;
    }

    reset() {
        const config = this.config;
        this.configure(config);
        this.emit('battle:reset');
    }

    destroy() {
        this.stopLoop();
        this.listeners.clear();
    }

    startLoop() {
        if (this.frameId !== null) return;
        this.frameId = requestAnimationFrame(this.tick);
    }

    stopLoop() {
        if (this.frameId !== null) cancelAnimationFrame(this.frameId);
        this.frameId = null;
    }

    tick(now) {
        this.frameId = null;
        if (this.phase !== CombatSessionPhase.RUNNING) return;

        const delta = clamp((now - this.lastTickAt) / 1000, 0, 0.05);
        this.lastTickAt = now;
        this.updateCooldowns(delta);
        this.updateBuffs(delta);
        this.updateStatuses(delta);
        this.updatePlayerAttacks(delta);
        this.updateMonsterFlow(delta);
        this.emit('battle:tick');

        if (this.phase === CombatSessionPhase.RUNNING) this.startLoop();
    }

    updateCooldowns(delta) {
        Object.keys(this.cooldowns).forEach(key => {
            this.cooldowns[key] = Math.max(0, this.cooldowns[key] - delta);
        });
        Object.keys(this.monsterAttackCooldowns).forEach(key => {
            this.monsterAttackCooldowns[key] = Math.max(0, this.monsterAttackCooldowns[key] - delta);
        });
    }

    updateStatuses(delta) {
        this.updatePlayerStatuses(delta);
        this.updateMonsterStatuses(delta);
    }

    updatePlayerStatuses(delta) {
        for (let index = this.player.statuses.length - 1; index >= 0; index -= 1) {
            const status = this.player.statuses[index];
            status.remaining = Math.max(0, status.remaining - delta);
            status.tickProgress += delta;
            while (status.damagePerSecond > 0 && status.tickProgress >= 1 && this.phase === CombatSessionPhase.RUNNING) {
                status.tickProgress -= 1;
                const damage = Math.max(1, Math.floor(status.damagePerSecond));
                const beforeHp = this.player.hp;
                this.player.hp = Math.max(0, this.player.hp - damage);
                this.emit('player:status-damage', { status: { ...status }, damage: beforeHp - this.player.hp });
                if (this.player.hp <= 0) {
                    this.finish(CombatSessionPhase.DEFEAT, 'player_status_damage');
                    return;
                }
            }
            if (status.remaining > 0) continue;
            this.player.statuses.splice(index, 1);
            this.emit('player:status-expired', { status: { ...status, modifiers: { ...status.modifiers } } });
        }
    }

    updateMonsterStatuses(delta) {
        for (let index = this.monster.statuses.length - 1; index >= 0; index -= 1) {
            const status = this.monster.statuses[index];
            status.remaining = Math.max(0, status.remaining - delta);
            status.tickProgress += delta;
            status.summonProgress += delta;
            while (status.healPerSecond > 0 && status.tickProgress >= 1) {
                status.tickProgress -= 1;
                const beforeHp = this.monster.hp;
                this.monster.hp = Math.min(this.monster.maxHp, this.monster.hp + status.healPerSecond);
                const amount = this.monster.hp - beforeHp;
                if (amount > 0) this.emit('monster:heal', { status: { ...status }, amount });
            }
            while (status.summonDamage > 0 && status.attackInterval > 0 && status.summonProgress >= status.attackInterval) {
                status.summonProgress -= status.attackInterval;
                const beforeHp = this.player.hp;
                this.player.hp = Math.max(0, this.player.hp - status.summonDamage);
                this.emit('monster:summon-hit', { status: { ...status }, damage: beforeHp - this.player.hp });
                if (this.player.hp <= 0) {
                    this.finish(CombatSessionPhase.DEFEAT, 'summon_attack');
                    return;
                }
            }
            if (status.remaining > 0) continue;
            this.monster.statuses.splice(index, 1);
            this.emit('monster:status-expired', { status: { ...status, modifiers: { ...status.modifiers } } });
        }
    }

    updateBuffs(delta) {
        for (let index = this.player.buffs.length - 1; index >= 0; index -= 1) {
            const buff = this.player.buffs[index];
            buff.remaining = Math.max(0, buff.remaining - delta);
            if (buff.remaining > 0) continue;
            this.player.buffs.splice(index, 1);
            this.emit('player:buff-expired', { buff: { ...buff, modifiers: { ...buff.modifiers } } });
        }
    }

    getPlayerModifier(key) {
        return [...this.player.buffs, ...this.player.statuses].reduce((total, buff) => {
            return total * numberOr(buff.modifiers?.[key], 1);
        }, 1);
    }

    getMonsterModifier(key, additive = false) {
        if (additive) return this.monster.statuses.reduce((total, status) => total + numberOr(status.modifiers?.[key], 0), 0);
        return this.monster.statuses.reduce((total, status) => total * numberOr(status.modifiers?.[key], 1), 1);
    }

    updatePlayerAttacks(delta) {
        for (let index = this.pendingPlayerAttacks.length - 1; index >= 0; index -= 1) {
            const pending = this.pendingPlayerAttacks[index];
            pending.remaining -= delta;
            if (pending.remaining > 0) continue;
            this.pendingPlayerAttacks.splice(index, 1);
            this.resolvePlayerHit(pending);
            if (this.phase !== CombatSessionPhase.RUNNING) break;
        }
    }

    updateMonsterFlow(delta) {
        if (this.phase !== CombatSessionPhase.RUNNING) return;
        if (this.monsterFlowPaused) return;
        const scaledDelta = delta * this.config.tempo;

        if (this.pendingMonsterImpact) {
            this.pendingMonsterImpact.remaining -= scaledDelta;
            if (this.pendingMonsterImpact.remaining <= 0) this.resolveMonsterImpact();
            return;
        }

        if (this.monsterIntent) {
            this.monsterIntent.remaining -= scaledDelta;
            if (this.monsterIntent.remaining <= 0) this.releaseMonsterAttack();
            return;
        }

        this.nextMonsterActionIn -= scaledDelta;
        if (this.nextMonsterActionIn <= 0) this.beginMonsterIntent();
    }

    playerAttack(slot = 'main', judgement = 'hit') {
        if (this.phase !== CombatSessionPhase.RUNNING) {
            this.emit('action:rejected', { action: slot, reason: 'battle_not_running' });
            return false;
        }

        const weapon = this.loadout[slot];
        if (!weapon?.enabled) {
            this.emit('action:rejected', { action: slot, reason: 'weapon_disabled' });
            return false;
        }
        if (this.cooldowns[slot] > 0) {
            this.emit('action:rejected', { action: slot, reason: 'cooldown' });
            return false;
        }

        const requestedHitType = typeof judgement === 'object' ? judgement.type : judgement;
        const hitType = ['miss', 'hit', 'crit'].includes(requestedHitType) ? requestedHitType : 'hit';
        this.cooldowns[slot] = weapon.cooldown * this.getPlayerModifier('attackCooldown');
        const pending = {
            slot,
            hitType,
            weapon: { ...weapon },
            remaining: weapon.windup,
            total: weapon.windup
        };
        this.pendingPlayerAttacks.push(pending);
        this.emit('player:attack-start', { slot, hitType, weapon: { ...weapon } });
        if (weapon.windup <= 0) {
            this.pendingPlayerAttacks.pop();
            this.resolvePlayerHit(pending);
        }
        return true;
    }

    disableWeapon(slot = 'main') {
        if (!this.loadout[slot]) return false;
        this.loadout[slot] = { ...this.loadout[slot], enabled: false };
        this.cooldowns[slot] = 0;
        this.pendingPlayerAttacks = this.pendingPlayerAttacks.filter(entry => entry.slot !== slot);
        this.emit('player:weapon-disabled', { slot, weapon: { ...this.loadout[slot] } });
        return true;
    }

    equipUnarmed(slot = 'main') {
        const normalizedSlot = slot === 'offhand' ? 'offhand' : 'main';
        const previous = this.loadout[normalizedSlot] || {};
        const profile = getWeaponCombatProfile({ equipment: { weapon: null } });
        const damageRatio = normalizedSlot === 'main' ? 0.35 : 0.25;
        const unarmed = normalizeWeapon({
            id: `unarmed_${normalizedSlot}`,
            name: '拳頭',
            effect: 'unarmed',
            icon: '',
            profile,
            damage: Math.max(1, Math.round((Number(previous.damage) || 5) * damageRatio)),
            cooldown: Math.max(0.55, Number(previous.cooldown) || 0.9),
            windup: 0.08,
            critDamage: previous.critDamage || 1.5,
            damageMultiplier: profile.damageMultiplier,
            critDamageMultiplier: profile.critDamageMultiplier,
            enabled: true
        }, normalizedSlot);
        this.loadout[normalizedSlot] = unarmed;
        this.cooldowns[normalizedSlot] = 0;
        this.pendingPlayerAttacks = this.pendingPlayerAttacks.filter(entry => entry.slot !== normalizedSlot);
        this.weaponStates[normalizedSlot] = { combo: 0, steadyStacks: 0, resonanceStacks: 0 };
        this.emit('player:weapon-replaced', {
            slot: normalizedSlot,
            previous: { ...previous },
            weapon: { ...unarmed }
        });
        return { ...unarmed };
    }

    resolvePlayerHit(pending) {
        if (this.phase !== CombatSessionPhase.RUNNING) return;
        const { slot, weapon, hitType = 'hit' } = pending;
        const baseDamage = weapon.damage * weapon.damageMultiplier * this.getPlayerModifier('damage');
        const evaded = hitType !== 'miss' && Math.random() < this.getMonsterModifier('dodgeChance', true);
        const resolvedDamage = hitType === 'miss' || evaded
            ? 0
            : Math.max(1, Math.floor(hitType === 'crit'
                ? baseDamage * weapon.critDamage * weapon.critDamageMultiplier
                : baseDamage) * this.getMonsterModifier('incomingDamage'));
        if (hitType === 'miss' || evaded) {
            this.resetWeaponChain(slot, weapon);
            this.emit('player:miss', {
                slot,
                hitType,
                weapon: { ...weapon },
                damage: 0,
                evaded
            });
            return;
        }

        const summonIndex = this.monster.statuses.findIndex(status => status.interceptHits > 0);
        if (summonIndex >= 0) {
            const summon = this.monster.statuses[summonIndex];
            summon.interceptHits -= 1;
            this.emit('player:hit', {
                slot,
                hitType,
                critical: hitType === 'crit',
                weapon: { ...weapon },
                damage: 0,
                intercepted: true
            });
            this.emit('monster:summon-block', { status: { ...summon }, damage: resolvedDamage });
            if (summon.interceptHits <= 0) {
                this.monster.statuses.splice(summonIndex, 1);
                this.emit('monster:summon-defeated', { status: { ...summon } });
            }
            return;
        }

        const beforeHp = this.monster.hp;
        this.monster.hp = Math.max(0, this.monster.hp - resolvedDamage);
        const damageDealt = beforeHp - this.monster.hp;

        this.emit('player:hit', {
            slot,
            hitType,
            critical: hitType === 'crit',
            weapon: { ...weapon },
            damage: damageDealt
        });
        if (weapon.lifesteal > 0 && damageDealt > 0) {
            const requestedAmount = Math.max(1, Math.floor(damageDealt * weapon.lifesteal / 100));
            const beforePlayerHp = this.player.hp;
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + requestedAmount);
            this.emit('player:lifesteal', {
                slot,
                weapon: { ...weapon },
                amount: this.player.hp - beforePlayerHp,
                requestedAmount
            });
        }
        if (weapon.triggerBuff) this.addBuff(weapon.triggerBuff);
        this.resolveWeaponProfileTrigger(slot, weapon, hitType, damageDealt);

        if (this.monster.hp <= 0) {
            this.finish(CombatSessionPhase.VICTORY, 'monster_defeated');
            return;
        }

    }

    usePotion() {
        if (this.phase !== CombatSessionPhase.RUNNING) {
            this.emit('action:rejected', { action: 'potion', reason: 'battle_not_running' });
            return false;
        }
        if (this.cooldowns.potion > 0) {
            this.emit('action:rejected', { action: 'potion', reason: 'cooldown' });
            return false;
        }
        if (this.player.potions <= 0) {
            this.emit('action:rejected', { action: 'potion', reason: 'empty' });
            return false;
        }
        if (this.player.hp >= this.player.maxHp) {
            this.emit('action:rejected', { action: 'potion', reason: 'full_hp' });
            return false;
        }

        const beforeHp = this.player.hp;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + this.player.potionHeal);
        this.player.potions -= 1;
        this.cooldowns.potion = this.config.player.potionCooldown;
        this.emit('player:potion', {
            amount: this.player.hp - beforeHp,
            remaining: this.player.potions
        });
        return true;
    }

    addBuff(rawBuff) {
        if (!rawBuff) return false;
        const buff = normalizeBuff(rawBuff, this.player.buffs.length);
        const existingIndex = this.player.buffs.findIndex(entry => entry.id === buff.id);
        if (existingIndex >= 0) this.player.buffs.splice(existingIndex, 1, buff);
        else this.player.buffs.push(buff);
        this.emit('player:buff-added', {
            buff: { ...buff, modifiers: { ...buff.modifiers } },
            refreshed: existingIndex >= 0
        });
        return true;
    }

    removeBuff(buffId) {
        const index = this.player.buffs.findIndex(buff => buff.id === buffId);
        if (index < 0) return false;
        const [buff] = this.player.buffs.splice(index, 1);
        this.emit('player:buff-expired', { buff: { ...buff, modifiers: { ...buff.modifiers } } });
        return true;
    }

    resetWeaponChain(slot, weapon) {
        const state = this.weaponStates[slot];
        if (!state) return;
        state.combo = 0;
        state.steadyStacks = 0;
        state.resonanceStacks = 0;
        if (weapon?.profile?.id === 'sword') this.removeBuff(`weapon-form:${slot}:steady-stance`);
        if (weapon?.profile?.id === 'dagger') this.removeBuff(`weapon-form:${slot}:quick-chain`);
        if (weapon?.profile?.id === 'focus') this.removeBuff(`weapon-form:${slot}:arcane-resonance`);
    }

    resolveWeaponProfileTrigger(slot, weapon, hitType, dealtDamage) {
        const profile = weapon?.profile;
        const state = this.weaponStates[slot];
        if (!profile || !state || dealtDamage <= 0) return;
        const icon = weapon.icon || '';
        const addFormBuff = buff => this.addBuff({ icon, ...buff });
        const emitTrigger = detail => this.emit('player:weapon-trigger', {
            slot,
            weapon: { ...weapon },
            profile: { ...profile },
            ...detail
        });
        const applyExtraStrike = (ratio, triggerType, label) => {
            const damage = Math.max(1, Math.floor(dealtDamage * ratio));
            const beforeHp = this.monster.hp;
            this.monster.hp = Math.max(0, this.monster.hp - damage);
            emitTrigger({ triggerType, label, damage: beforeHp - this.monster.hp });
        };

        if (profile.id === 'sword') {
            const maxStacks = Math.max(1, Math.floor(numberOr(profile.steadyStanceMaxStacks, 1)));
            state.steadyStacks = Math.min(maxStacks, state.steadyStacks + 1);
            const bonus = state.steadyStacks * Math.max(0, numberOr(profile.steadyStanceHitZoneBonus, 0)) * 100;
            addFormBuff({
                id: `weapon-form:${slot}:steady-stance`,
                name: profile.label,
                duration: 30,
                stacks: state.steadyStacks,
                maxStacks,
                modifiers: { hitZoneBonus: bonus }
            });
            emitTrigger({ triggerType: 'steadyStance', stacks: state.steadyStacks, maxStacks, percent: bonus });
            return;
        }

        if (profile.id === 'dagger') {
            const comboEvery = Math.max(1, Math.floor(numberOr(profile.comboEvery, 2)));
            state.combo = (state.combo + 1) % comboEvery;
            if (state.combo === 0) {
                this.removeBuff(`weapon-form:${slot}:quick-chain`);
                applyExtraStrike(numberOr(profile.comboDamageRatio, 0.70), 'quickChain', profile.comboLabel || profile.label);
            } else {
                addFormBuff({
                    id: `weapon-form:${slot}:quick-chain`,
                    name: profile.label,
                    duration: 12,
                    stacks: state.combo,
                    maxStacks: comboEvery,
                    modifiers: {}
                });
                emitTrigger({ triggerType: 'quickChainCharge', stacks: state.combo, maxStacks: comboEvery });
            }
            return;
        }

        if (profile.id === 'heavy' && (!profile.bulwarkRequiresArmor || weapon.hasArmor)) {
            const reduction = Math.max(0, numberOr(profile.bulwarkGuardReductionPercent, 0));
            addFormBuff({
                id: `weapon-form:${slot}:bulwark-guard`,
                name: profile.label,
                duration: Math.max(0.1, numberOr(profile.bulwarkGuardDuration, 4)),
                modifiers: { incomingDamage: Math.max(0.1, 1 - reduction / 100) }
            });
            emitTrigger({ triggerType: 'bulwarkGuard', percent: reduction });
            return;
        }

        if (profile.id === 'focus') {
            const required = Math.max(1, Math.floor(numberOr(profile.resonanceStacksRequired, 2)));
            state.resonanceStacks += 1;
            if (state.resonanceStacks < required) {
                addFormBuff({
                    id: `weapon-form:${slot}:arcane-resonance`,
                    name: profile.label,
                    duration: 12,
                    stacks: state.resonanceStacks,
                    maxStacks: required,
                    modifiers: {}
                });
                emitTrigger({ triggerType: 'arcaneResonanceCharge', stacks: state.resonanceStacks, maxStacks: required });
                return;
            }
            state.resonanceStacks = 0;
            this.removeBuff(`weapon-form:${slot}:arcane-resonance`);
            if (Array.isArray(profile.resonanceElements) && profile.resonanceElements.includes(weapon.element)) {
                const percent = Math.max(0, numberOr(profile.resonanceElementBonusPercent, 0));
                addFormBuff({
                    id: `weapon-form:${slot}:arcane-${weapon.element}`,
                    name: `${profile.label} - ${weapon.element}`,
                    duration: 4,
                    modifiers: { damage: 1 + percent / 100 }
                });
                emitTrigger({ triggerType: 'arcaneElement', element: weapon.element, percent });
            } else {
                applyExtraStrike(numberOr(profile.magicBoltDamageRatio, 0.45), 'magicBolt', profile.magicBoltLabel || profile.label);
            }
            return;
        }

        if (profile.id === 'lance' && (hitType === 'crit' || weapon.monsterDefense >= numberOr(profile.armorPenetrationMinDefense, 8))) {
            const percent = Math.max(0, numberOr(profile.armorPenetrationBonus, 0));
            addFormBuff({
                id: `weapon-form:${slot}:piercing-line`,
                name: profile.label,
                duration: 3,
                modifiers: {}
            });
            applyExtraStrike(percent / 100, 'piercingLine', profile.label);
        }
    }

    flee() {
        if (this.phase !== CombatSessionPhase.RUNNING) {
            this.emit('action:rejected', { action: 'flee', reason: 'battle_not_running' });
            return false;
        }
        if (this.cooldowns.flee > 0) {
            this.emit('action:rejected', { action: 'flee', reason: 'cooldown' });
            return false;
        }

        this.cooldowns.flee = this.config.fleeCooldown;
        const roll = this.config.random();
        if (roll >= this.config.fleeChance) {
            this.emit('player:flee-failed', { roll, chance: this.config.fleeChance });
            return true;
        }

        this.emit('player:flee', { roll, chance: this.config.fleeChance });
        this.finish(CombatSessionPhase.ESCAPED, 'player_fled');
        return true;
    }

    setMonsterFlowPaused(paused) {
        const next = Boolean(paused);
        if (this.monsterFlowPaused === next) return false;
        this.monsterFlowPaused = next;
        this.emit(next ? 'monster:flow-paused' : 'monster:flow-resumed');
        return true;
    }

    addStatus(target, rawStatus) {
        if (!rawStatus) return false;
        const status = normalizeStatus(rawStatus);
        const list = target === 'monster' ? this.monster.statuses : this.player.statuses;
        const existingIndex = list.findIndex(entry => entry.id === status.id);
        if (existingIndex >= 0) list.splice(existingIndex, 1, status);
        else list.push(status);
        this.emit(`${target}:status-added`, {
            status: { ...status, modifiers: { ...status.modifiers } },
            refreshed: existingIndex >= 0
        });
        return true;
    }

    forceMonsterAttack(attackId) {
        if (this.phase !== CombatSessionPhase.RUNNING) return false;
        const attack = this.config.monster.attacks.find(entry => entry.id === attackId);
        if (!attack) return false;
        this.monsterFlowPaused = false;
        this.monsterIntent = null;
        this.pendingMonsterImpact = null;
        this.nextMonsterActionIn = 0;
        this.beginMonsterIntent(attack);
        return true;
    }

    beginMonsterIntent(forcedAttack = null) {
        if (this.phase !== CombatSessionPhase.RUNNING) return;
        const attacks = this.config.monster.attacks;
        const readySkills = attacks.filter(entry => entry.isSkill && this.monsterAttackCooldowns[entry.id] <= 0);
        const attack = forcedAttack || (readySkills.length > 0
            ? readySkills[this.monsterAttackIndex % readySkills.length]
            : attacks.find(entry => !entry.isSkill) || attacks[0]);
        if (!forcedAttack && readySkills.length > 0) this.monsterAttackIndex += 1;
        this.monsterIntent = {
            attack: { ...attack },
            total: attack.telegraph,
            remaining: attack.telegraph
        };
        this.emit('monster:telegraph', { attack: { ...attack } });
    }

    releaseMonsterAttack() {
        if (!this.monsterIntent || this.phase !== CombatSessionPhase.RUNNING) return;
        const attack = { ...this.monsterIntent.attack };
        this.monsterIntent = null;
        this.pendingMonsterImpact = {
            attack,
            total: attack.impactDelay,
            remaining: attack.impactDelay
        };
        this.emit('monster:attack-release', { attack });
        if (attack.cooldown > 0) this.monsterAttackCooldowns[attack.id] = attack.cooldown;
        if (attack.impactDelay <= 0) this.resolveMonsterImpact();
    }

    resolveMonsterImpact() {
        if (!this.pendingMonsterImpact || this.phase !== CombatSessionPhase.RUNNING) return;
        const attack = { ...this.pendingMonsterImpact.attack };
        this.pendingMonsterImpact = null;
        const critical = attack.damage > 0 && Math.random() < this.getMonsterModifier('critChance', true);
        const resolvedDamage = attack.damage > 0
            ? Math.max(1, Math.floor(attack.damage * (critical ? 1.5 : 1) * this.getPlayerModifier('incomingDamage')))
            : 0;
        const beforeHp = this.player.hp;
        this.player.hp = Math.max(0, this.player.hp - resolvedDamage);
        this.nextMonsterActionIn = attack.recovery;
        this.emit('monster:hit', {
            attack,
            damage: beforeHp - this.player.hp,
            critical
        });
        if (attack.playerEffect) this.addStatus('player', attack.playerEffect);
        if (attack.monsterEffect) this.addStatus('monster', attack.monsterEffect);
        if (attack.healFromDamagePercent > 0 && resolvedDamage > 0) {
            const beforeMonsterHp = this.monster.hp;
            this.monster.hp = Math.min(this.monster.maxHp, this.monster.hp + Math.max(1, Math.round(resolvedDamage * attack.healFromDamagePercent / 100)));
            const amount = this.monster.hp - beforeMonsterHp;
            if (amount > 0) this.emit('monster:heal', { attack, amount });
        }
        if (this.player.hp <= 0) this.finish(CombatSessionPhase.DEFEAT, 'player_defeated');
    }

    finish(phase, reason) {
        this.phase = phase;
        this.pendingPlayerAttacks.length = 0;
        this.monsterIntent = null;
        this.pendingMonsterImpact = null;
        this.stopLoop();
        this.emit('battle:end', { result: phase, reason });
    }
}
