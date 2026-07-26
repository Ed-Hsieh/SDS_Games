import { ensureCombatStage } from '../components/CombatStageView.js';
import { CombatVfxLab } from '../scenes/CombatVfxLab.js';
import { CombatSessionPhase } from './RealtimeCombatSession.js';
import { buildCombatWeaponEntry } from './AdventureEncounterManager.js';
import { buildMonsterCombatActions } from '../data/MonsterCombatProfiles.js';
import { calculateDrops } from './DropManager.js';
import { createMonsterInstance, getMonster } from './MonsterManager.js';
import { resolveItemById } from '../utils/ItemResolver.js';
import { getGeneratedItemImage, getGeneratedMonsterImage } from '../data/AssetManifest.js';

function prepareEquipment(itemId) {
    const item = resolveItemById(itemId);
    if (!item) return null;
    const stats = item.stats || {};
    return {
        ...item,
        ...stats,
        attack: Number(item.attack ?? stats.attack) || 1,
        defense: Number(item.defense ?? stats.defense) || 0,
        attackSpeed: Number(item.attackSpeed ?? stats.attackSpeed) || 1,
        weaponSpeed: Number(item.weaponSpeed ?? stats.weaponSpeed) || 1,
        critChance: Number(item.critChance ?? stats.critChance) || 0.05,
        critDamage: Number(item.critDamage ?? stats.critDamage) || 1.5,
        durability: Number(item.durability ?? item.maxDurability) || 20,
        maxDurability: Number(item.maxDurability ?? item.durability) || 20,
        type: 'weapon'
    };
}

function createCharacter(state) {
    const main = state.loadout.main;
    const offhand = state.loadout.offhand;
    const data = {
        baseAtk: 7,
        baseDef: 3,
        equipment: { weapon: main, armor: offhand }
    };
    return {
        ...data,
        getTotalAtk: () => data.baseAtk + (Number(main?.attack) || 0),
        getTotalDef: () => data.baseDef,
        getWeaponSpeed: () => Number(main?.weaponSpeed) || 1,
        getAttackSpeed: () => Number(main?.attackSpeed) || 1,
        getAttackInterval: () => 1 / Math.max(0.1, Number(main?.attackSpeed) || 1),
        getCritChance: () => 0.04 + (Number(main?.critChance) || 0),
        getCritDamage: () => Math.max(1.5, Number(main?.critDamage) || 1.5)
    };
}

function mergeDrops(drops) {
    const totals = new Map();
    drops.forEach(drop => {
        if (!drop?.itemId) return;
        totals.set(
            drop.itemId,
            (totals.get(drop.itemId) || 0) + Math.max(1, Number(drop.quantity) || 1)
        );
    });
    return [...totals].map(([itemId, quantity]) => ({ itemId, quantity }));
}

function openingBuffs(openingState) {
    if (openingState !== 'player_advantage') return [];
    return [{
        id: 'hunt-demo-opening',
        name: '先手',
        icon: '⚔',
        duration: 5,
        modifiers: { hitZoneBonus: 0.14 }
    }];
}

export default class HuntDemoCombatAdapter {
    constructor(host, state, options = {}) {
        this.host = host;
        this.state = state;
        this.options = options;
        this.lab = null;
        this.overlay = null;
        this.combatRoot = null;
        this.pendingResolve = null;
        this.pendingResult = null;
        this.activeEncounter = null;
        this.ensureStyles();
        ensureCombatStage(host);
        this.overlay = host.querySelector('[data-combat-stage]');
        this.combatRoot = host.querySelector('[data-combat-root]');
    }

    ensureStyles() {
        if (document.querySelector('#hunt-demo-combat-style')) return;
        const link = document.createElement('link');
        link.id = 'hunt-demo-combat-style';
        link.rel = 'stylesheet';
        link.href = 'src/style/combat-vfx-lab.css?v=hunt-canvas-south-20260726b';
        document.head.appendChild(link);
        this.ownsStylesheet = true;
    }

    ensureLoadout() {
        if (!this.state.loadout) {
            this.state.loadout = {
                main: prepareEquipment('slime_sword'),
                offhand: prepareEquipment('goblin_dagger')
            };
        }
        return this.state.loadout;
    }

    start(encounter) {
        if (!encounter?.monsterId || this.pendingResolve) return Promise.resolve(null);
        const template = getMonster(encounter.monsterId);
        if (!template) throw new Error(`Unknown hunt demo monster: ${encounter.monsterId}`);
        const monster = createMonsterInstance(template);
        const loadoutItems = this.ensureLoadout();
        const character = createCharacter(this.state);
        const mainEntry = buildCombatWeaponEntry(loadoutItems.main, character, monster, 'main');
        const offhandEntry = buildCombatWeaponEntry(loadoutItems.offhand, character, monster, 'offhand');
        const openingState = encounter.openingState || 'neutral';
        const initialDelay = openingState === 'player_advantage'
            ? 2.35
            : openingState === 'enemy_advantage'
                ? 0.38
                : 1.2;
        const canRetreat = encounter.canRetreat !== false;

        this.activeEncounter = { ...encounter, monster };
        this.overlay.hidden = false;
        this.overlay.classList.add('hunt-demo-combat-overlay');
        this.options.onActiveChange?.(true);

        this.lab = new CombatVfxLab(this.combatRoot, {
            monster: {
                id: monster.id,
                name: monster.name,
                className: encounter.className || (
                    encounter.isBoss ? '首領' : encounter.isElite ? '菁英' : '野外'
                ),
                level: monster.level,
                maxHp: monster.maxHp,
                image: getGeneratedMonsterImage(monster.id),
                background: encounter.background,
                backgroundAlt: encounter.roomName || '',
                visualScale: encounter.isBoss ? '1.02' : '0.9',
                feed: openingState === 'player_advantage'
                    ? '你先一步掌握了出手距離。'
                    : openingState === 'enemy_advantage'
                        ? '危險從視線外逼近，敵人已經取得先機。'
                        : `${monster.name}擋住了前路。`,
                initialDelay,
                attacks: buildMonsterCombatActions(monster, 3)
            },
            player: {
                name: '遮面旅人',
                maxHp: this.state.maxHp,
                hp: this.state.hp,
                potions: this.state.potions,
                potionHeal: 30,
                potionCooldown: 1.2,
                buffs: openingBuffs(openingState)
            },
            loadout: { main: mainEntry, offhand: offhandEntry },
            rhythmCharacter: {
                equipment: { weapon: loadoutItems.main, offhand: loadoutItems.offhand },
                getWeaponSpeed: () => character.getWeaponSpeed(),
                getAttackSpeed: () => character.getAttackSpeed(),
                getAttackInterval: () => character.getAttackInterval(),
                getCritChance: () => character.getCritChance(),
                getCritDamage: () => character.getCritDamage(),
                getTotalAtk: () => character.getTotalAtk()
            },
            secondaryEquipment: loadoutItems.offhand,
            autoStart: true,
            fleeChance: 0.5,
            canFlee: () => canRetreat,
            fleeRejectedText: '首領戰無法撤離。',
            resultActionLabels: {
                [CombatSessionPhase.VICTORY]: '返回探索',
                [CombatSessionPhase.DEFEAT]: '在南門醒來',
                [CombatSessionPhase.ESCAPED]: '退回危險區前'
            },
            onCombatEvent: event => this.handleCombatEvent(event),
            onBattleEnd: event => this.handleBattleEnd(event),
            onResultAction: snapshot => this.finish(snapshot)
        });
        const fleeButton = this.combatRoot.querySelector('#flee-battle');
        if (fleeButton && !canRetreat) {
            fleeButton.disabled = true;
            fleeButton.title = '首領戰無法撤離';
        }
        this.combatRoot.querySelector('#battle-preview')?.focus({ preventScroll: true });
        return new Promise(resolve => {
            this.pendingResolve = resolve;
        });
    }

    handleCombatEvent(event) {
        if (event.type !== 'player:attack-resolved' || event.weapon?.effect === 'unarmed') return;
        const slot = event.slot === 'offhand' ? 'offhand' : 'main';
        const item = this.state.loadout?.[slot];
        if (!item || item.usesDurability === false) return;
        item.durability = Math.max(0, (Number(item.durability) || 0) - 1);
        if (item.durability > 0) return;
        this.lab?.handleWeaponBroken(slot, item);
    }

    handleBattleEnd(event) {
        const victory = event.result === CombatSessionPhase.VICTORY;
        const drops = victory
            ? mergeDrops(calculateDrops(this.activeEncounter.monster, {
                dungeonId: this.activeEncounter.dungeonId || null
            }))
            : [];
        this.pendingResult = {
            phase: event.result,
            drops,
            exp: victory ? Number(this.activeEncounter.monster.exp) || 0 : 0
        };
        this.renderRewards(drops, this.pendingResult.exp);
    }

    renderRewards(drops, exp) {
        const panel = this.combatRoot.querySelector('#adventure-combat-rewards');
        if (!panel) return;
        if (!drops.length && !exp) {
            panel.innerHTML = '<p class="hunt-combat-no-loot">沒有可帶走的戰利品。</p>';
            return;
        }
        const entries = drops.map(drop => {
            const item = resolveItemById(drop.itemId);
            const image = getGeneratedItemImage(item || { id: drop.itemId });
            return `<span class="hunt-combat-loot">${image ? `<img src="${image}" alt="">` : ''}<b>${item?.name || drop.itemId}</b><small>x${drop.quantity}</small></span>`;
        });
        if (exp) {
            entries.push(`<span class="hunt-combat-loot is-exp"><b>經驗</b><small>+${exp}</small></span>`);
        }
        panel.innerHTML = entries.join('');
    }

    finish(snapshot) {
        if (!this.pendingResolve) return;
        const resolve = this.pendingResolve;
        const result = {
            phase: snapshot.phase,
            hp: snapshot.player.hp,
            potions: snapshot.player.potions,
            drops: this.pendingResult?.drops || [],
            exp: this.pendingResult?.exp || 0,
            durability: {
                main: this.state.loadout?.main?.durability ?? null,
                offhand: this.state.loadout?.offhand?.durability ?? null
            }
        };
        this.lab?.destroy();
        this.lab = null;
        this.pendingResolve = null;
        this.pendingResult = null;
        this.activeEncounter = null;
        this.overlay.hidden = true;
        this.overlay.classList.remove('hunt-demo-combat-overlay');
        this.options.onActiveChange?.(false);
        resolve(result);
    }

    destroy() {
        this.lab?.destroy();
        this.lab = null;
        if (this.pendingResolve) {
            this.pendingResolve(null);
            this.pendingResolve = null;
        }
        this.overlay?.remove();
        if (this.ownsStylesheet) document.querySelector('#hunt-demo-combat-style')?.remove();
    }
}
