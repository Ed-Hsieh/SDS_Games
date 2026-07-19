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
        damage: Math.max(1, Math.floor(Number(raw.damage) || (slot === 'main' ? 96 : 121))),
        cooldown: Math.max(0.1, Number(raw.cooldown) || (slot === 'main' ? 0.72 : 1.05)),
        windup: Math.max(0, Number(raw.windup) || (slot === 'main' ? 0.09 : 0.2)),
        critDamage: clamp(numberOr(raw.critDamage, 1.5), 1, 4),
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
        modifiers: {
            damage: clamp(numberOr(raw.modifiers?.damage, 1), 0.1, 5),
            incomingDamage: clamp(numberOr(raw.modifiers?.incomingDamage, 1), 0.1, 5)
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

        this.emit('player:hit', {
            slot,
            hitType,
            critical: hitType === 'crit',
            weapon: { ...weapon },
            damage: beforeHp - this.monster.hp
        });
        if (weapon.triggerBuff) this.addBuff(weapon.triggerBuff);

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
