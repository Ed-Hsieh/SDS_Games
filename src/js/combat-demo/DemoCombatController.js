import { EquipmentDatabase } from '../data/Equipment.js';
import { StandaloneRecipeDatabase } from '../data/RecipeCatalog.js';
import {
    DemoWeaponForms,
    getAttackWindow,
    getDemoWeaponProfile
} from './DemoWeaponActions.js';

const PLAYER_ARMOR = StandaloneRecipeDatabase.leather_armor?.result;

const PLAYER_RULES = Object.freeze({
    maxHealth: 120,
    maxStamina: 100,
    moveSpeed: 4.8,
    dodgeSpeed: 10.2,
    dodgeDuration: 0.46,
    dodgeInvulnerability: 0.3,
    dodgeCost: 25,
    staminaRecovery: 27,
    potionHeal: 42,
    maxPotions: 3
});

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export default class DemoCombatController {
    constructor(hooks = {}) {
        this.hooks = hooks;
        this.weaponForm = 'sword';
        this.weaponProfile = getDemoWeaponProfile(this.weaponForm);
        this.resetPlayer();
        this.clearEnemy();
    }

    resetPlayer() {
        this.playerEffects = new Map();
        this.player = {
            maxHealth: PLAYER_RULES.maxHealth,
            health: PLAYER_RULES.maxHealth,
            maxStamina: PLAYER_RULES.maxStamina,
            stamina: PLAYER_RULES.maxStamina,
            potions: PLAYER_RULES.maxPotions,
            state: 'free',
            timer: 0,
            invulnerable: 0,
            comboIndex: 0,
            comboQueued: false,
            hitConnected: false,
            charge: 0,
            weaponForm: this.weaponForm,
            statuses: []
        };
        this.emitPlayer();
    }

    rest() {
        this.resetPlayer();
    }

    clearEnemy() {
        this.enemy = null;
    }

    setEnemy(monster) {
        this.enemy = {
            data: monster,
            health: monster.maxHp,
            maxHealth: monster.maxHp,
            state: 'idle',
            timer: 0,
            action: null,
            actionConnected: false,
            cooldowns: new Map(),
            effects: new Map(),
            visible: true
        };
        this.emitEnemy();
    }

    get playerAttack() {
        return Number(this.weaponProfile.item?.stats?.attack)
            || Number(EquipmentDatabase.slime_sword?.stats?.attack)
            || 6;
    }

    get playerDefense() {
        return Number(PLAYER_ARMOR?.stats?.defense) || 8;
    }

    setWeaponForm(form) {
        if (!DemoWeaponForms.includes(form) || this.player.state !== 'free') return false;
        this.weaponForm = form;
        this.weaponProfile = getDemoWeaponProfile(form);
        this.player.weaponForm = form;
        this.player.comboIndex = 0;
        this.player.comboQueued = false;
        this.hooks.onWeaponChanged?.(this.weaponProfile);
        this.emitPlayer();
        return true;
    }

    getCurrentAttack() {
        if (this.player.state === 'attack') {
            return getAttackWindow(this.weaponProfile, 'light', this.player.comboIndex);
        }
        if (this.player.state === 'heavy') return getAttackWindow(this.weaponProfile, 'heavy');
        return null;
    }

    tryLightAttack() {
        if (this.player.health <= 0) return false;
        if (this.player.state === 'attack') {
            if (this.player.comboIndex < this.weaponProfile.lightCombo.length - 1) {
                this.player.comboQueued = true;
            }
            return true;
        }
        if (this.player.state !== 'free'
            || this.player.stamina < this.weaponProfile.lightCost) return false;
        this.player.stamina -= this.weaponProfile.lightCost;
        this.player.state = 'attack';
        this.player.timer = 0;
        this.player.hitConnected = false;
        this.hooks.onAttackStart?.(
            'light',
            this.player.comboIndex,
            getAttackWindow(this.weaponProfile, 'light', this.player.comboIndex),
            this.weaponProfile
        );
        return true;
    }

    beginHeavyCharge() {
        if (this.player.state !== 'free'
            || this.player.stamina < this.weaponProfile.heavyCost
            || this.player.health <= 0) return false;
        this.player.state = 'heavy-charge';
        this.player.timer = 0;
        this.player.charge = 0;
        return true;
    }

    releaseHeavy() {
        if (this.player.state !== 'heavy-charge') return false;
        this.player.stamina -= this.weaponProfile.heavyCost;
        this.player.state = 'heavy';
        this.player.timer = 0;
        this.player.hitConnected = false;
        this.hooks.onAttackStart?.(
            'heavy',
            0,
            getAttackWindow(this.weaponProfile, 'heavy'),
            this.weaponProfile
        );
        return true;
    }

    tryDodge() {
        if (this.player.state !== 'free'
            || this.player.stamina < PLAYER_RULES.dodgeCost
            || this.player.health <= 0) return false;
        this.player.stamina -= PLAYER_RULES.dodgeCost;
        this.player.state = 'dodge';
        this.player.timer = 0;
        this.player.invulnerable = PLAYER_RULES.dodgeInvulnerability;
        return true;
    }

    tryPotion() {
        if (this.player.state !== 'free'
            || this.player.potions <= 0
            || this.player.health >= this.player.maxHealth) return false;
        this.player.potions -= 1;
        this.player.state = 'drink';
        this.player.timer = 0;
        return true;
    }

    updatePlayer(delta, distanceToEnemy) {
        const player = this.player;
        let effectsChanged = false;
        player.timer += delta;
        player.invulnerable = Math.max(0, player.invulnerable - delta);
        for (const [id, effect] of this.playerEffects) {
            effect.remaining -= delta;
            effect.tickProgress += delta;
            while (effect.damagePerSecond > 0
                && effect.tickProgress >= 1
                && player.health > 0) {
                effect.tickProgress -= 1;
                const damage = Math.max(1, Math.floor(effect.damagePerSecond));
                player.health = Math.max(0, player.health - damage);
                this.hooks.onPlayerHit?.(damage, { effect: 'poison', isStatus: true });
            }
            if (effect.remaining <= 0) {
                this.playerEffects.delete(id);
                effectsChanged = true;
            }
        }
        if (effectsChanged) player.statuses = [...this.playerEffects.values()];
        if (player.health <= 0 && player.state !== 'dead') {
            player.state = 'dead';
            player.timer = 0;
            this.hooks.onPlayerDefeated?.();
        }
        if (player.state === 'free') {
            player.stamina = Math.min(
                player.maxStamina,
                player.stamina + PLAYER_RULES.staminaRecovery * delta
            );
        }

        if (player.state === 'attack') {
            const attack = getAttackWindow(this.weaponProfile, 'light', player.comboIndex);
            const progress = player.timer / attack.duration;
            if (!player.hitConnected
                && progress >= attack.activeStart
                && progress <= attack.activeEnd
                && this.resolvePlayerHit(attack, distanceToEnemy, progress)) {
                player.hitConnected = true;
                this.damageEnemy(
                    Math.max(1, Math.round(this.playerAttack * attack.multiplier)),
                    false,
                    attack
                );
            }
            if (progress >= 1) {
                if (player.comboQueued
                    && player.comboIndex < this.weaponProfile.lightCombo.length - 1) {
                    player.comboIndex += 1;
                    player.comboQueued = false;
                    player.hitConnected = false;
                    player.timer = 0;
                    this.hooks.onAttackStart?.(
                        'light',
                        player.comboIndex,
                        getAttackWindow(this.weaponProfile, 'light', player.comboIndex),
                        this.weaponProfile
                    );
                } else {
                    player.state = 'free';
                    player.comboIndex = 0;
                    player.comboQueued = false;
                    player.timer = 0;
                }
            }
        } else if (player.state === 'heavy-charge') {
            player.charge = clamp(player.timer / 1.15, 0, 1);
        } else if (player.state === 'heavy') {
            const attack = getAttackWindow(this.weaponProfile, 'heavy');
            const progress = player.timer / attack.duration;
            if (!player.hitConnected
                && progress >= attack.activeStart
                && progress <= attack.activeEnd
                && this.resolvePlayerHit(attack, distanceToEnemy, progress)) {
                player.hitConnected = true;
                const multiplier = attack.multiplier + player.charge * 0.7;
                this.damageEnemy(
                    Math.max(1, Math.round(this.playerAttack * multiplier)),
                    true,
                    attack
                );
            }
            if (progress >= 1) {
                player.state = 'free';
                player.timer = 0;
                player.charge = 0;
            }
        } else if (player.state === 'dodge' && player.timer >= PLAYER_RULES.dodgeDuration) {
            player.state = 'free';
            player.timer = 0;
        } else if (player.state === 'drink' && player.timer >= 0.72) {
            player.health = Math.min(player.maxHealth, player.health + PLAYER_RULES.potionHeal);
            player.state = 'free';
            player.timer = 0;
            this.hooks.onHeal?.(PLAYER_RULES.potionHeal);
        }
        this.emitPlayer();
    }

    resolvePlayerHit(attack, distanceToEnemy, progress) {
        const result = this.hooks.resolvePlayerHit?.(attack, progress);
        if (typeof result === 'boolean') return result;
        return distanceToEnemy <= Number(attack.hitbox?.reach || 2.25);
    }

    updateEnemy(delta, distanceToPlayer) {
        const enemy = this.enemy;
        if (!enemy || enemy.health <= 0) return;
        enemy.timer += delta;
        for (const [id, value] of enemy.cooldowns) {
            enemy.cooldowns.set(id, Math.max(0, value - delta));
        }
        for (const [id, effect] of enemy.effects) {
            effect.remaining -= delta;
            if (effect.remaining <= 0) enemy.effects.delete(id);
        }

        if (enemy.state === 'idle' && distanceToPlayer < 8.5) {
            enemy.state = 'chase';
            enemy.timer = 0;
        }
        if (enemy.state === 'chase' && distanceToPlayer <= 2.15) {
            enemy.action = this.selectEnemyAction();
            enemy.state = 'windup';
            enemy.timer = 0;
            enemy.actionConnected = false;
            this.hooks.onEnemyWindup?.(enemy.action);
        } else if (enemy.state === 'windup' && enemy.timer >= enemy.action.telegraph) {
            enemy.state = enemy.action.effect === 'vanish' ? 'vanish' : 'active';
            enemy.timer = 0;
            if (enemy.action.effect === 'vanish') {
                enemy.visible = false;
                this.hooks.onEnemyVanish?.(enemy.action);
            }
        } else if (enemy.state === 'active') {
            if (!enemy.actionConnected
                && enemy.timer >= enemy.action.impactDelay
                && distanceToPlayer <= 2.6) {
                enemy.actionConnected = true;
                this.damagePlayer(enemy.action.damage, enemy.action);
            }
            if (enemy.timer >= Math.max(0.3, enemy.action.impactDelay + 0.18)) {
                this.finishEnemyAction();
            }
        } else if (enemy.state === 'vanish' && enemy.timer >= 0.85) {
            enemy.visible = true;
            if (enemy.action.monsterEffect) {
                enemy.effects.set(enemy.action.monsterEffect.id, {
                    ...enemy.action.monsterEffect,
                    remaining: enemy.action.monsterEffect.duration
                });
            }
            this.hooks.onEnemyReappear?.(enemy.action);
            this.finishEnemyAction();
        } else if (enemy.state === 'recovery' && enemy.timer >= enemy.action.recovery) {
            enemy.state = 'chase';
            enemy.timer = 0;
            enemy.action = null;
        }
        this.emitEnemy();
    }

    selectEnemyAction() {
        const enemy = this.enemy;
        const available = enemy.data.actions.filter(action => (
            (enemy.cooldowns.get(action.id) || 0) <= 0
        ));
        const skills = available.filter(action => action.isSkill);
        if (skills.length && Math.random() < 0.42) {
            return skills[Math.floor(Math.random() * skills.length)];
        }
        return available.find(action => !action.isSkill) || available[0] || enemy.data.actions[0];
    }

    finishEnemyAction() {
        const enemy = this.enemy;
        if (enemy.action?.cooldown) enemy.cooldowns.set(enemy.action.id, enemy.action.cooldown);
        if (enemy.action?.monsterEffect) {
            enemy.effects.set(enemy.action.monsterEffect.id, {
                ...enemy.action.monsterEffect,
                remaining: enemy.action.monsterEffect.duration
            });
        }
        enemy.state = 'recovery';
        enemy.timer = 0;
    }

    damageEnemy(rawDamage, heavy = false, attack = null) {
        const enemy = this.enemy;
        if (!enemy || enemy.health <= 0) return;
        const evasion = [...enemy.effects.values()]
            .reduce((value, effect) => Math.max(value, Number(effect.modifiers?.dodgeChance) || 0), 0);
        if (evasion > 0 && Math.random() < evasion) {
            this.hooks.onEnemyEvade?.();
            return;
        }
        const defense = Number(enemy.data.defense) || 0;
        const damage = Math.max(1, Math.round(rawDamage - defense));
        enemy.health = Math.max(0, enemy.health - damage);
        this.hooks.onEnemyHit?.(damage, heavy, attack);
        if (enemy.health <= 0) {
            enemy.state = 'dead';
            this.hooks.onEnemyDefeated?.(enemy.data);
        }
        this.emitEnemy();
    }

    damagePlayer(rawDamage, action) {
        if (this.player.invulnerable > 0 || this.player.health <= 0) {
            this.hooks.onPlayerEvade?.();
            return;
        }
        const criticalChance = [...this.enemy.effects.values()]
            .reduce((value, effect) => Math.max(
                value,
                Number(effect.modifiers?.critChance) || 0
            ), 0);
        const critical = criticalChance > 0 && Math.random() < criticalChance;
        const damage = Math.max(
            1,
            Math.round((Number(rawDamage) || 0) * (critical ? 1.5 : 1))
        );
        this.player.health = Math.max(0, this.player.health - damage);
        if (action?.playerEffect) {
            const effect = {
                ...action.playerEffect,
                remaining: action.playerEffect.duration,
                tickProgress: 0
            };
            this.playerEffects.set(action.playerEffect.id, effect);
            this.player.statuses = [...this.playerEffects.values()];
        }
        this.hooks.onPlayerHit?.(damage, { ...action, critical });
        if (this.player.health <= 0) {
            this.player.state = 'dead';
            this.player.timer = 0;
            this.hooks.onPlayerDefeated?.();
        }
        this.emitPlayer();
    }

    getMoveSpeed() {
        if (this.player.state === 'dodge') return PLAYER_RULES.dodgeSpeed;
        if (['attack', 'heavy', 'heavy-charge', 'drink', 'dead'].includes(this.player.state)) return 0;
        return PLAYER_RULES.moveSpeed * this.weaponProfile.moveScale;
    }

    emitPlayer() {
        this.hooks.onPlayerState?.(this.player);
    }

    emitEnemy() {
        if (!this.enemy) return;
        this.hooks.onEnemyState?.(this.enemy);
    }
}
