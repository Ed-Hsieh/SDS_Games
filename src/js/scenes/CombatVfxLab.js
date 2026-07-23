import { EquipmentDatabase } from '../data/Equipment.js';
import RealtimeCombatSession, { CombatSessionPhase } from '../managers/RealtimeCombatSession.js';
import CombatVfxEngine from '../utils/CombatVfxEngine.js';
import RhythmBarSystem from '../utils/RhythmBarSystem.js';
import { getWeaponCombatProfile } from '../utils/WeaponCombatProfile.js';
import { MonsterDatabase } from '../data/Monsters.js';
import { buildMonsterCombatActions, ChapterOneTwoCombatMonsterIds } from '../data/MonsterCombatProfiles.js';
import { getGeneratedItemImage, getGeneratedMonsterImage } from '../data/AssetManifest.js';
import { mountSharedCombatPreview } from '../components/CombatStageView.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const ITEM_ASSETS = Object.freeze({
    mainWeapon: 'src/assets/images/art/items/equipment/frostbite_dueling_blade.webp',
    offhandWeapon: 'src/assets/images/art/items/equipment/hydra_spine_spear.webp',
    powerBuff: 'src/assets/images/art/items/equipment/elemental_badge.webp',
    guardBuff: 'src/assets/images/art/items/equipment/cave_ward_shield.webp'
});

function buildRhythmWeapon(itemId, weaponForm) {
    const item = EquipmentDatabase[itemId] || { id: itemId, name: itemId, type: 'weapon', rarity: 'common' };
    const stats = item.stats || {};
    const attack = Number(stats.attack ?? item.attack ?? 10) || 10;
    return Object.freeze({
        ...item,
        ...stats,
        type: 'weapon',
        weaponForm,
        attack,
        critChance: Number(stats.critChance ?? item.critChance ?? 0.05) || 0.05,
        critDamage: Number(stats.critDamage ?? item.critDamage ?? 1.5) || 1.5,
        weaponSpeed: Number(stats.weaponSpeed ?? item.weaponSpeed ?? 1) || 1,
        attackSpeed: Number(stats.attackSpeed ?? item.attackSpeed ?? 1) || 1
    });
}

const RHYTHM_WEAPONS = Object.freeze({
    main: buildRhythmWeapon('frostbite_dueling_blade', 'sword'),
    offhand: buildRhythmWeapon('hydra_spine_spear', 'lance')
});

function buildLoadoutEntry(slot, options) {
    const weapon = RHYTHM_WEAPONS[slot];
    const profile = getWeaponCombatProfile({ equipment: { weapon } });
    const attackInterval = 1 / Math.max(0.1, weapon.attackSpeed);
    return Object.freeze({
        id: weapon.id,
        name: weapon.name,
        icon: options.icon,
        effect: profile.id,
        profile,
        element: String(weapon.element || weapon.affinity || '').toLowerCase(),
        hasArmor: slot === 'main',
        monsterDefense: 14,
        damage: options.damage,
        cooldown: Math.max(0.18, attackInterval * profile.cooldownMultiplier),
        windup: options.windup,
        critDamage: weapon.critDamage,
        damageMultiplier: profile.damageMultiplier,
        critDamageMultiplier: profile.critDamageMultiplier,
        triggerBuff: options.triggerBuff || null
    });
}

const BUFF_LIBRARY = Object.freeze({
    power: Object.freeze({
        id: 'power_tonic',
        name: '元素增幅',
        icon: ITEM_ASSETS.powerBuff,
        duration: 14,
        modifiers: { damage: 1.18 }
    }),
    guard: Object.freeze({
        id: 'guard_tonic',
        name: '礦燈護壁',
        icon: ITEM_ASSETS.guardBuff,
        duration: 14,
        modifiers: { incomingDamage: 0.72 }
    })
});

const LOADOUT = Object.freeze({
    main: buildLoadoutEntry('main', {
        icon: ITEM_ASSETS.mainWeapon,
        damage: 96,
        windup: 0.09,
        triggerBuff: Object.freeze({
            id: 'frostbite_weapon_effect',
            name: '霜吻附著',
            icon: ITEM_ASSETS.mainWeapon,
            duration: 6,
            modifiers: Object.freeze({})
        })
    }),
    offhand: buildLoadoutEntry('offhand', {
        icon: ITEM_ASSETS.offhandWeapon,
        damage: 122,
        windup: 0.2,
        triggerBuff: Object.freeze({
            id: 'hydra_weapon_effect',
            name: '九頭毒脈',
            icon: ITEM_ASSETS.offhandWeapon,
            duration: 6,
            modifiers: Object.freeze({})
        })
    })
});

function createRhythmCharacter() {
    const main = RHYTHM_WEAPONS.main;
    const character = {
        equipment: {
            weapon: main,
            offhand: RHYTHM_WEAPONS.offhand
        },
        getWeaponSpeed: () => character.equipment.weapon?.weaponSpeed || 1,
        getAttackSpeed: () => character.equipment.weapon?.attackSpeed || 1,
        getAttackInterval: () => 1 / Math.max(0.1, character.equipment.weapon?.attackSpeed || 1),
        getCritChance: () => clamp(0.04 + (character.equipment.weapon?.critChance || 0.05), 0, 0.45),
        getCritDamage: () => character.equipment.weapon?.critDamage || 1.5,
        getTotalAtk: () => LOADOUT.main.damage
    };
    return character;
}

const SHOWCASE_MONSTERS = Object.freeze({
    demon: Object.freeze({
        name: '黑鐵先鋒',
        className: '精英 · 魔族',
        level: 42,
        maxHp: 1840,
        image: 'src/assets/images/art/entities/monsters/demon_general.webp',
        background: 'src/assets/images/art/scenes/world/landmarks/obsidian_keep_gate.webp',
        backgroundAlt: '黑曜要塞入口',
        visualScale: '1.01',
        feed: '黑鐵先鋒壓低武器，甲片間滲出暗紅火光',
        initialDelay: 1.25,
        attacks: Object.freeze([
            Object.freeze({ id: 'claw', name: '裂甲三連爪', effect: 'claw', damage: 52, telegraph: 1.05, impactDelay: 0.27, recovery: 1.2 }),
            Object.freeze({ id: 'projectile', name: '魔能投射', effect: 'projectile', damage: 41, telegraph: 1.35, impactDelay: 0.76, recovery: 1.45 }),
            Object.freeze({ id: 'crush', name: '煉獄重壓', effect: 'crush', damage: 78, telegraph: 1.5, impactDelay: 0.29, recovery: 1.85 }),
            Object.freeze({ id: 'breath', name: '灼熱吐息', effect: 'breath', damage: 66, telegraph: 1.65, impactDelay: 0.84, recovery: 2.05 })
        ])
    }),
    mantis: Object.freeze({
        name: '伏獵螳螂',
        className: '支線 Boss · 蟲族',
        level: 18,
        maxHp: 1260,
        image: 'src/assets/images/art/entities/monsters/ambush_mantis.webp',
        background: 'src/assets/images/art/scenes/world/landmarks/silver_snare_pass.webp',
        backgroundAlt: '銀絲伏獵道',
        visualScale: '1.04',
        feed: '鐮肢沿著地面緩慢張開，正在計算你的距離',
        initialDelay: 0.95,
        attacks: Object.freeze([
            Object.freeze({ id: 'mantis_claw', name: '交錯鐮斬', effect: 'claw', damage: 44, telegraph: 0.78, impactDelay: 0.27, recovery: 0.9 }),
            Object.freeze({ id: 'silk_curse', name: '獵絲拘束', effect: 'curse', damage: 32, telegraph: 1.15, impactDelay: 0.78, recovery: 1.25 }),
            Object.freeze({ id: 'execution_crush', name: '斷頭鐮落', effect: 'crush', damage: 64, telegraph: 1.22, impactDelay: 0.29, recovery: 1.48 })
        ])
    }),
    golem: Object.freeze({
        name: '晶礦巨像',
        className: '精英 · 構裝體',
        level: 36,
        maxHp: 2360,
        image: 'src/assets/images/art/entities/monsters/crystal_golem.webp',
        background: 'src/assets/images/art/scenes/world/landmarks/black_iron_storehouse.webp',
        backgroundAlt: '黑鐵儲藏所',
        visualScale: '0.96',
        feed: '晶礦巨像的核心逐節亮起，沉重腳步震動地面',
        initialDelay: 1.45,
        attacks: Object.freeze([
            Object.freeze({ id: 'golem_crush', name: '晶核震地', effect: 'crush', damage: 82, telegraph: 1.55, impactDelay: 0.29, recovery: 1.9 }),
            Object.freeze({ id: 'crystal_projectile', name: '晶刺投射', effect: 'projectile', damage: 48, telegraph: 1.2, impactDelay: 0.76, recovery: 1.5 }),
            Object.freeze({ id: 'core_curse', name: '核心過載', effect: 'curse', damage: 58, telegraph: 1.65, impactDelay: 0.78, recovery: 2.1 })
        ])
    })
});

const CHAPTER_MONSTERS = Object.fromEntries(ChapterOneTwoCombatMonsterIds.map(id => {
    const monster = MonsterDatabase[id];
    const chapter = Number(monster?.level || 1) <= 10 ? 1 : 2;
    return [id, Object.freeze({
        id,
        name: monster.name,
        className: `${monster.type === 'boss' ? 'Boss' : '一般怪物'} · 第 ${chapter} 章`,
        level: monster.level,
        maxHp: monster.maxHp,
        image: getGeneratedMonsterImage(id),
        background: chapter === 1
            ? 'src/assets/images/art/scenes/world/landmarks/south-road-broken.webp'
            : 'src/assets/images/art/scenes/world/landmarks/opened_ancient_tomb.webp',
        backgroundAlt: chapter === 1 ? '第一章野外' : '第二章古墓路線',
        visualScale: monster.type === 'boss' ? '1.03' : '0.94',
        feed: `${monster.name}進入測試距離`,
        initialDelay: 1.15,
        attacks: Object.freeze(buildMonsterCombatActions(monster, 2).map(Object.freeze))
    })];
}));

const MONSTERS = Object.freeze({ ...SHOWCASE_MONSTERS, ...CHAPTER_MONSTERS });

const ELEMENT_LABELS = Object.freeze({
    neutral: '無屬性',
    fire: '火',
    ice: '冰',
    thunder: '雷',
    poison: '毒',
    shadow: '暗影',
    glimmer: '微光',
    light: '光'
});

const EFFECT_LABELS = Object.freeze({
    sword: '劍 · 弧斬',
    dagger: '匕首 · 連斬',
    heavy: '重武器 · 震擊',
    lance: '槍矛 · 穿刺',
    focus: '法器 · 共鳴',
    critical: '破綻暴擊',
    claw: '裂甲三連爪',
    crush: '煉獄重壓',
    projectile: '魔能投射',
    breath: '灼熱吐息',
    curse: '暗影拘束',
    body: '身體撞擊',
    slash: '武器斬擊',
    bite: '撕咬',
    poison: '毒素侵入',
    sonic: '音波尖嘯',
    roots: '根鬚束縛',
    ambush: '伏擊斬擊',
    vanish: '藏匿',
    nature: '自然之怒',
    regeneration: '再生',
    phase: '相位穿透',
    drain: '生命汲取',
    lightning: '閃電箭',
    harden: '硬化',
    'dark-projectile': '黑暗箭',
    summon: '召喚骷髏',
    'boss-phase': '戰意解放'
});

const PHASE_LABELS = Object.freeze({
    [CombatSessionPhase.IDLE]: '待機',
    [CombatSessionPhase.RUNNING]: '交戰中',
    [CombatSessionPhase.PAUSED]: '已暫停',
    [CombatSessionPhase.VICTORY]: '勝利',
    [CombatSessionPhase.DEFEAT]: '敗北',
    [CombatSessionPhase.ESCAPED]: '已撤離'
});

export class CombatVfxLab {
    constructor(root, options = {}) {
        this.root = root;
        this.options = options;
        this.stage = root.querySelector('#battle-preview');
        this.enemyStage = root.querySelector('#enemy-stage');
        this.enemyVisual = root.querySelector('#enemy-visual');
        this.background = root.querySelector('#battle-background');
        this.screenFlash = root.querySelector('#screen-flash');
        this.damageVignette = root.querySelector('#damage-vignette');
        this.skillBanner = root.querySelector('#skill-banner');
        this.floatLayer = root.querySelector('#float-layer');
        this.playerDebuffList = root.querySelector('#player-debuff-list');
        this.monsterStatusRow = root.querySelector('#monster-status-row');
        this.intentPanel = root.querySelector('#enemy-intent');
        this.resultPanel = root.querySelector('#combat-result');
        this.buffList = root.querySelector('#player-buff-list');
        this.settings = { shake: true, hitStop: true, numbers: true };
        this.labMode = 'combat';
        this.currentMonsterId = options.monster?.id || root.querySelector('#monster-select')?.value || 'demon';
        this.currentElement = 'neutral';
        this.uiTimers = new Set();
        this.triggerVfxReadyAt = 0;
        this.showcaseTimers = new Set();
        this.showcaseRunning = false;
        this.lastHealth = { player: null, monster: null };
        this.rhythmCharacter = options.rhythmCharacter || createRhythmCharacter();
        this.secondaryEquipment = options.secondaryEquipment || this.rhythmCharacter?.equipment?.offhand || null;

        this.engine = new CombatVfxEngine({
            rearCanvas: root.querySelector('#vfx-canvas-rear'),
            frontCanvas: root.querySelector('#vfx-canvas-front'),
            stage: this.stage,
            onFps: fps => {
                const label = root.querySelector('#frame-rate');
                if (label) label.textContent = `${fps} FPS`;
            }
        });

        this.session = new RealtimeCombatSession(this.buildSessionConfig());
        this.unsubscribeSession = this.session.subscribe(event => this.handleCombatEvent(event));
        this.initializeRhythmSystems();
        this.handleKeyboard = this.handleKeyboard.bind(this);
        this.handleStageMouseDown = this.handleStageMouseDown.bind(this);
        this.handleContextMenu = this.handleContextMenu.bind(this);
        this.handlePotionClick = event => {
            event.stopPropagation();
            this.activatePotion();
        };
        this.handleFleeClick = event => {
            event.stopPropagation();
            this.activateFlee();
        };
        this.handleResultClick = () => {
            if (this.options.onResultAction) this.options.onResultAction(this.session.getSnapshot());
            else this.restartCombat();
        };

        this.bindControls();
        this.applyLoadoutVisual();
        this.applyMonsterVisual();
        this.renderSnapshot(this.session.getSnapshot(), { immediate: true });
        this.setMode('combat', { announce: false });
        this.setFeed(this.getMonsterConfig().feed || '等待交戰指令');
        if (options.autoStart) {
            this.session.start();
            if (options.startMonsterPaused) this.session.setMonsterFlowPaused(true);
        }
    }

    getMonsterConfig() {
        return this.options.monster || MONSTERS[this.currentMonsterId] || MONSTERS.demon;
    }

    getLoadout() {
        return this.options.loadout || LOADOUT;
    }

    getRuntimeLoadout() {
        return this.session?.getSnapshot?.().loadout || this.getLoadout();
    }

    buildSessionConfig() {
        const monster = this.getMonsterConfig();
        const player = this.options.player || {};
        return {
            player: {
                name: player.name || '玩家',
                maxHp: player.maxHp || 420,
                hp: player.hp || player.maxHp || 420,
                potions: player.potions ?? 5,
                potionHeal: player.potionHeal || 118,
                potionCooldown: player.potionCooldown || 1.2,
                buffs: player.buffs || []
            },
            monster: {
                id: monster.id || this.currentMonsterId,
                name: monster.name,
                maxHp: monster.maxHp,
                healthFloorRatio: monster.healthFloorRatio,
                initialDelay: monster.initialDelay,
                attacks: monster.attacks
            },
            loadout: this.getLoadout(),
            fleeChance: this.options.fleeChance ?? 0.5,
            fleeCooldown: this.options.fleeCooldown ?? 2,
            tempo: Number(this.root.querySelector('#tempo-control')?.value || 100) / 100
        };
    }

    initializeRhythmSystems() {
        this.mainRhythmSystem = new RhythmBarSystem(this.rhythmCharacter, this.root, {
            ringMode: true,
            barSelector: '#lab-main-rhythm-ring',
            needleSelector: '#lab-main-rhythm-needle',
            hitZoneSelector: '#lab-main-hit-zone',
            critZoneSelector: '#lab-main-crit-zone',
            attackSelector: '#lab-main-rhythm-action'
        });
        this.offhandRhythmSystem = new RhythmBarSystem(this.rhythmCharacter, this.root, {
            weaponSlot: 'offhand',
            windowMode: true,
            windowCycles: 2,
            ringMode: true,
            barSelector: '#lab-offhand-rhythm-ring',
            needleSelector: '#lab-offhand-rhythm-needle',
            hitZoneSelector: '#lab-offhand-hit-zone',
            critZoneSelector: '#lab-offhand-crit-zone',
            attackSelector: '#lab-offhand-rhythm-action',
            onWindowStateChange: () => {
                const snapshot = this.session?.getSnapshot?.();
                if (snapshot) this.renderRhythmState(snapshot);
            }
        });
        this.mainRhythmSystem.start();
        this.mainRhythmSystem.pause();
        this.offhandRhythmSystem.start();
    }

    applyLoadoutVisual() {
        const mainItem = this.rhythmCharacter?.equipment?.weapon || null;
        const offhandItem = mainItem ? (this.rhythmCharacter?.equipment?.offhand || null) : null;
        const secondaryItem = offhandItem || this.secondaryEquipment || null;
        const secondaryIsWeapon = String(secondaryItem?.type || '').toLowerCase() === 'weapon';
        const offhandControl = this.root.querySelector('.rhythm-control-offhand');
        offhandControl?.classList.toggle('is-armor', Boolean(secondaryItem && !secondaryIsWeapon));
        offhandControl?.classList.toggle('is-empty', !secondaryItem);
        const secondaryLabel = this.root.querySelector('#secondary-slot-label');
        const secondaryControl = this.root.querySelector('#secondary-slot-control');
        if (secondaryLabel) secondaryLabel.textContent = secondaryIsWeapon ? '副武器' : '副裝備';
        if (secondaryControl) secondaryControl.textContent = secondaryIsWeapon ? '滑鼠右鍵' : (secondaryItem ? '防護' : '空缺');
        const slots = [
            ['main', mainItem, this.getRuntimeLoadout().main, '#lab-main-rhythm-icon', '#lab-main-rhythm-name'],
            ['offhand', secondaryItem, this.getRuntimeLoadout().offhand, '#lab-offhand-rhythm-icon', '#lab-offhand-rhythm-name']
        ];
        slots.forEach(([slot, item, weapon, ringIconSelector, ringNameSelector]) => {
            const ringIcon = this.root.querySelector(ringIconSelector);
            if (ringIcon) {
                const icon = item ? getGeneratedItemImage(item) : weapon?.icon;
                if (icon) ringIcon.src = icon;
                else ringIcon.removeAttribute('src');
                ringIcon.alt = '';
                ringIcon.hidden = !icon;
            }
            const ringName = this.root.querySelector(ringNameSelector);
            if (ringName) ringName.textContent = item?.name || (slot === 'main' ? weapon?.name || '拳頭' : '未裝備');
        });
        this.renderWeaponDurability('main');
        this.renderWeaponDurability('offhand');
    }

    getEquippedItem(slot) {
        return slot === 'offhand'
            ? this.rhythmCharacter?.equipment?.offhand || this.secondaryEquipment || null
            : this.rhythmCharacter?.equipment?.weapon || null;
    }

    renderWeaponDurability(slot) {
        const item = this.getEquippedItem(slot);
        const panel = this.root.querySelector(`#${slot === 'offhand' ? 'offhand' : 'main'}-weapon-durability`);
        const value = this.root.querySelector(`#${slot === 'offhand' ? 'offhand' : 'main'}-weapon-durability-value`);
        const fill = this.root.querySelector(`#${slot === 'offhand' ? 'offhand' : 'main'}-weapon-durability-fill`);
        if (!panel || !value || !fill) return;
        const usesDurability = item && item.usesDurability !== false;
        panel.hidden = !usesDurability;
        if (!usesDurability) return;

        const max = Math.max(1, Number(item.maxDurability) || 18);
        const current = Math.max(0, Math.min(max, Number.isFinite(Number(item.durability)) ? Number(item.durability) : max));
        const ratio = current / max;
        value.textContent = `${current} / ${max}`;
        fill.style.width = `${ratio * 100}%`;
        panel.classList.toggle('is-low', ratio > 0 && ratio <= 0.3);
        panel.classList.toggle('is-broken', current <= 0);
    }

    replaceCombatEquipment(slot, item, weaponEntry, options = {}) {
        const normalizedSlot = slot === 'offhand' ? 'offhand' : 'main';
        const createUnarmedItem = targetSlot => ({
            id: `unarmed_${targetSlot}`,
            name: '拳頭',
            type: 'weapon',
            weaponForm: 'unarmed',
            rarity: 'common',
            attack: targetSlot === 'main' ? 5 : 3,
            attackSpeed: 1,
            weaponSpeed: 1,
            critChance: 0.05,
            critDamage: 1.5,
            usesDurability: false
        });
        if (normalizedSlot === 'main') {
            const nextItem = item || createUnarmedItem('main');
            this.rhythmCharacter.equipment.weapon = nextItem;
            if (weaponEntry) this.session?.replaceWeapon('main', weaponEntry, options);
            else this.session?.equipUnarmed('main');
            this.mainRhythmSystem?.updateCharacter?.(this.rhythmCharacter);
        } else {
            const isWeapon = String(item?.type || '').toLowerCase() === 'weapon';
            this.secondaryEquipment = item || null;
            this.rhythmCharacter.equipment.offhand = isWeapon ? item : null;
            if (isWeapon && weaponEntry) this.session?.replaceWeapon('offhand', weaponEntry, options);
            else this.session?.disableWeapon('offhand');
            this.session?.updateWeaponContext('main', { hasArmor: Boolean(item && !isWeapon) });
            this.offhandRhythmSystem?.expireWindow?.();
            this.offhandRhythmSystem?.updateCharacter?.(this.rhythmCharacter);
        }
        const control = this.root.querySelector(`.rhythm-control-${normalizedSlot}`);
        control?.classList.remove('is-broken');
        control?.classList.toggle('is-unarmed', normalizedSlot === 'main' && !item);
        this.applyLoadoutVisual();
        this.renderSnapshot(this.session.getSnapshot(), { immediate: true });
        return true;
    }

    handleWeaponBroken(slot, weapon) {
        const normalizedSlot = slot === 'offhand' ? 'offhand' : 'main';
        this.replaceCombatEquipment(normalizedSlot, null, null, { fullCooldown: true });
        this.setFeed(`${weapon?.name || '裝備'}已損壞`);
    }

    resetRhythmSystems() {
        this.mainRhythmSystem?.reset();
        if (this.mainRhythmSystem && !this.mainRhythmSystem.isRunning) this.mainRhythmSystem.start();
        this.offhandRhythmSystem?.expireWindow?.();
        this.offhandRhythmSystem?.reset();
        this.offhandRhythmSystem?.start();
    }

    syncRhythmPhase(phase) {
        const running = this.labMode === 'combat' && phase === CombatSessionPhase.RUNNING;
        if (running) {
            if (this.mainRhythmSystem && !this.mainRhythmSystem.isRunning) this.mainRhythmSystem.start();
            this.mainRhythmSystem?.resume();
            if (this.offhandRhythmSystem?.isWindowActive) this.offhandRhythmSystem.resume();
            return;
        }
        this.mainRhythmSystem?.pause();
        this.offhandRhythmSystem?.pause();
    }

    renderRhythmState(snapshot) {
        const active = snapshot.phase === CombatSessionPhase.RUNNING && this.labMode === 'combat';
        const mainState = this.root.querySelector('#lab-main-rhythm-state');
        const offhandState = this.root.querySelector('#lab-offhand-rhythm-state');
        if (mainState) {
            mainState.textContent = this.root.querySelector('.rhythm-control-main')?.classList.contains('is-broken')
                ? '損壞'
                : !active
                ? '暫停'
                : snapshot.cooldowns.main > 0.001 ? '恢復中' : '就緒';
        }
        if (offhandState) {
            const secondary = this.getEquippedItem('offhand');
            const secondaryIsWeapon = String(secondary?.type || '').toLowerCase() === 'weapon';
            offhandState.textContent = !secondary
                ? '空缺'
                : !secondaryIsWeapon
                    ? '防護中'
                    : this.root.querySelector('.rhythm-control-offhand')?.classList.contains('is-broken')
                ? '損壞'
                : !active
                ? '暫停'
                : this.offhandRhythmSystem?.isWindowActive
                    ? '連擊窗口'
                    : snapshot.cooldowns.offhand > 0.001 ? '恢復中' : '等待';
        }
    }

    bindControls() {
        document.addEventListener('keydown', this.handleKeyboard);
        this.stage.addEventListener('mousedown', this.handleStageMouseDown);
        this.stage.addEventListener('contextmenu', this.handleContextMenu);

        this.root.querySelector('#use-potion')?.addEventListener('click', this.handlePotionClick);
        this.root.querySelector('#flee-battle')?.addEventListener('click', this.handleFleeClick);

        this.root.querySelectorAll('[data-lab-mode]').forEach(button => {
            button.addEventListener('click', () => this.setMode(button.dataset.labMode));
        });
        this.root.querySelector('#toggle-combat')?.addEventListener('click', () => this.toggleCombat());
        this.root.querySelector('#combat-result-restart')?.addEventListener('click', this.handleResultClick);

        this.root.querySelectorAll('[data-add-buff]').forEach(button => {
            button.addEventListener('click', () => {
                const buff = BUFF_LIBRARY[button.dataset.addBuff];
                if (buff) this.session.addBuff(buff);
            });
        });

        this.root.querySelectorAll('[data-effect]').forEach(button => {
            button.addEventListener('click', () => this.triggerManualEffect(button.dataset.effect));
        });
        this.root.querySelectorAll('[data-element]').forEach(button => {
            button.addEventListener('click', () => this.setElement(button.dataset.element));
        });
        this.root.querySelector('#monster-select')?.addEventListener('change', event => {
            this.setMonster(event.target.value);
        });

        const tempo = this.root.querySelector('#tempo-control');
        tempo?.addEventListener('input', () => {
            const value = Number(tempo.value);
            this.session.setTempo(value / 100);
            this.root.querySelector('#tempo-value').textContent = `${value}%`;
        });

        const intensity = this.root.querySelector('#intensity-control');
        intensity?.addEventListener('input', () => {
            const value = Number(intensity.value);
            this.engine.setIntensity(value / 100);
            this.root.querySelector('#intensity-value').textContent = `${value}%`;
        });

        const density = this.root.querySelector('#density-control');
        density?.addEventListener('input', () => {
            this.engine.setDensity(Number(density.value) / 100);
        });

        this.bindToggle('#toggle-shake', 'shake');
        this.bindToggle('#toggle-hitstop', 'hitStop');
        this.bindToggle('#toggle-numbers', 'numbers');

        this.root.querySelector('#play-showcase')?.addEventListener('click', () => this.playShowcase());
        this.root.querySelector('#clear-effects')?.addEventListener('click', () => this.clearEffects());
        this.root.querySelector('#reset-stage')?.addEventListener('click', () => this.resetStage());
    }

    bindToggle(selector, setting) {
        const input = this.root.querySelector(selector);
        input?.addEventListener('change', () => {
            this.settings[setting] = input.checked;
        });
    }

    handleKeyboard(event) {
        if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
        if (event.target?.matches?.('input, select, textarea, button')) return;
        if (event.code === 'Space') {
            event.preventDefault();
            this.activatePotion();
        } else if (event.key?.toLowerCase() === 'f') {
            event.preventDefault();
            this.activateFlee();
        }
    }

    handleStageMouseDown(event) {
        if (event.target.closest('input, select, label')) return;
        if (event.button === 0) {
            if (event.target.closest('button')) return;
            event.preventDefault();
            this.activateWeapon('main');
        } else if (event.button === 2) {
            if (event.target.closest('button')) return;
            event.preventDefault();
            this.activateWeapon('offhand');
        }
    }

    handleContextMenu(event) {
        event.preventDefault();
    }

    activateWeapon(slot) {
        if (this.labMode !== 'combat') {
            const loadout = this.getLoadout();
            this.triggerManualEffect(slot === 'main' ? loadout.main.effect : loadout.offhand.effect);
            return;
        }

        const snapshot = this.session.getSnapshot();
        if (this.options.onWeaponAttempt?.(slot, snapshot) === true) return;
        if (snapshot.phase !== CombatSessionPhase.RUNNING || snapshot.cooldowns[slot] > 0.001) {
            this.session.playerAttack(slot);
            return;
        }

        const rhythm = slot === 'main' ? this.mainRhythmSystem : this.offhandRhythmSystem;
        const judgement = rhythm?.judgeHit?.() || { type: 'inactive' };
        if (judgement.type === 'cooldown') {
            this.setFeed(`${this.getLoadout()[slot].name}仍在回復`);
            return;
        }
        if (judgement.type === 'inactive') {
            this.setFeed('副武器節奏窗口尚未開啟');
            return;
        }

        const accepted = this.session.playerAttack(slot, judgement.type);
        if (!accepted) {
            rhythm?.cancelCooldown?.();
            return;
        }
        const attackSucceeded = judgement.type === 'hit' || judgement.type === 'crit';
        if (
            slot === 'main'
            && attackSucceeded
            && this.session.getSnapshot().phase === CombatSessionPhase.RUNNING
        ) {
            this.offhandRhythmSystem?.activateWindow?.();
        }
    }

    activatePotion() {
        if (this.labMode === 'combat') {
            if (this.options.onPotionAttempt?.(this.session.getSnapshot()) === true) return;
            this.session.usePotion();
            return;
        }
        this.engine.heal({ target: 'player' });
        this.flash('rgba(120, 202, 146, 0.24)');
        this.showFloatNumber(118, { target: 'player', heal: true, label: '恢復' });
        this.setFeed('生命藥水回饋正在播放');
    }

    activateFlee() {
        if (this.labMode === 'combat') {
            if (this.options.onFleeAttempt?.(this.session.getSnapshot()) === true) return;
            if (this.options.canFlee && !this.options.canFlee()) {
                this.setFeed(this.options.fleeRejectedText || '這場戰鬥無法撤離。');
                return;
            }
            this.session.flee();
        } else this.playFleeFeedback();
    }

    setMonsterFlowPaused(paused) {
        return this.session.setMonsterFlowPaused(paused);
    }

    forceMonsterAttack(attackId) {
        return this.session.forceMonsterAttack(attackId);
    }

    replaceMonsterAttacks(attacks) {
        return this.session.replaceMonsterAttacks(attacks);
    }

    setMode(mode, { announce = true } = {}) {
        if (!['combat', 'effects'].includes(mode)) return;
        if (mode === 'effects' && this.session.phase === CombatSessionPhase.RUNNING) this.session.pause();
        this.labMode = mode;
        this.root.dataset.labMode = mode;
        this.root.querySelectorAll('[data-lab-mode]').forEach(button => {
            button.classList.toggle('is-active', button.dataset.labMode === mode);
        });
        this.stage.setAttribute('aria-label', mode === 'combat' ? '戰鬥實戰模擬' : '單項戰鬥特效預覽');
        this.clearEffects();
        const snapshot = this.session.getSnapshot();
        this.renderSnapshot(snapshot, { immediate: true });
        this.syncRhythmPhase(snapshot.phase);
        if (mode === 'effects') {
            this.resultPanel.hidden = true;
            if (announce) this.setFeed('單項特效驗收模式');
            return;
        }
        if ([CombatSessionPhase.VICTORY, CombatSessionPhase.DEFEAT, CombatSessionPhase.ESCAPED].includes(snapshot.phase)) {
            this.showResult(snapshot.phase);
        } else if (announce) {
            this.setFeed(snapshot.phase === CombatSessionPhase.PAUSED ? '戰鬥已暫停' : '實戰模擬已就緒');
        }
    }

    toggleCombat() {
        const phase = this.session.phase;
        if (phase === CombatSessionPhase.RUNNING) this.session.pause();
        else if (phase === CombatSessionPhase.PAUSED) this.session.resume();
        else if (phase === CombatSessionPhase.IDLE) this.session.start();
        else this.restartCombat();
    }

    restartCombat() {
        this.clearEffects();
        this.resultPanel.hidden = true;
        this.session.configure(this.buildSessionConfig());
        this.session.start();
        this.stage.focus({ preventScroll: true });
    }

    setMonster(monsterId) {
        if (!MONSTERS[monsterId]) return;
        this.clearEffects();
        this.currentMonsterId = monsterId;
        this.applyMonsterVisual();
        this.resultPanel.hidden = true;
        this.lastHealth = { player: null, monster: null };
        this.session.configure(this.buildSessionConfig());
        this.renderSnapshot(this.session.getSnapshot(), { immediate: true });
        this.setFeed(MONSTERS[monsterId].feed);
    }

    applyMonsterVisual() {
        const config = this.getMonsterConfig();
        this.root.classList.toggle('is-unknown-monster', Boolean(config.concealIdentity));
        this.root.querySelector('#enemy-name').textContent = config.name;
        this.root.querySelector('#enemy-class').textContent = config.className;
        this.root.querySelector('#enemy-level').textContent = config.level;
        this.root.querySelector('#enemy-max-hp').textContent = config.maxHp;
        this.enemyVisual.src = config.image;
        this.enemyVisual.alt = config.name;
        this.enemyVisual.style.setProperty('--monster-scale', config.visualScale);
        this.background.src = config.background;
        this.background.alt = config.backgroundAlt;
    }

    setElement(element) {
        if (!ELEMENT_LABELS[element]) return;
        this.currentElement = element;
        this.engine.setElement(element);
        const label = this.root.querySelector('#element-label');
        if (label) label.textContent = ELEMENT_LABELS[element];
        this.root.querySelectorAll('[data-element]').forEach(button => {
            button.classList.toggle('is-active', button.dataset.element === element);
        });
        this.setFeed(element === 'neutral'
            ? '武器回到無屬性的物理回饋'
            : `${ELEMENT_LABELS[element]}屬性已附著`);
        this.engine.elementalImpact(this.engine.enemyPoint, { scale: 0.75 });
    }

    syncWeaponElement(weapon) {
        if (!this.options.loadout) {
            this.engine.setElement(this.currentElement);
            return this.currentElement;
        }
        const element = ELEMENT_LABELS[weapon?.element] ? weapon.element : 'neutral';
        this.currentElement = element;
        this.engine.setElement(element);
        const label = this.root.querySelector('#element-label');
        if (label) label.textContent = ELEMENT_LABELS[element];
        this.root.querySelectorAll('[data-element]').forEach(button => {
            button.classList.toggle('is-active', button.dataset.element === element);
        });
        return element;
    }

    handleCombatEvent(event) {
        this.options.onCombatEvent?.(event);
        const immediate = event.type === 'session:configured' || event.type === 'battle:reset';
        if (immediate) this.resetRhythmSystems();
        this.syncRhythmPhase(event.snapshot.phase);
        this.renderSnapshot(event.snapshot, { immediate });

        if (event.type === 'battle:start') {
            this.resultPanel.hidden = true;
            this.setFeed(`${event.snapshot.monster.name}進入攻擊距離`);
        } else if (event.type === 'battle:pause') {
            this.setFeed('戰鬥流程已暫停');
        } else if (event.type === 'battle:resume') {
            this.setFeed('戰鬥流程繼續');
        } else if (event.type === 'player:attack-start') {
            const attackElement = this.syncWeaponElement(event.weapon);
            const shouldPlayAttackVfx = !(event.hitType === 'miss' && event.weapon.effect === 'focus');
            if (shouldPlayAttackVfx) {
                const duration = {
                    sword: 280,
                    dagger: 360,
                    heavy: 420,
                    lance: 380,
                    focus: 700,
                    unarmed: 240
                }[event.weapon.effect] || 320;
                this.queueTriggerVfx(() => {
                    this.engine.setElement(attackElement);
                    this.playWeaponEffect(event.weapon.effect);
                }, duration);
            }
            const judgementLabel = event.hitType === 'crit' ? '暴擊節點' : event.hitType === 'hit' ? '命中節點' : '失誤節點';
            this.setFeed(`${event.weapon.name}於${judgementLabel}出手`);
        } else if (event.type === 'player:hit') {
            if (!event.intercepted) {
                const element = this.syncWeaponElement(event.weapon);
                if (element !== 'neutral') {
                    this.queueTriggerVfx(() => {
                        this.engine.setElement(element);
                        this.engine.elementalImpact(this.engine.enemyPoint, {
                            scale: 0.72,
                            particleScale: 0.72
                        });
                    }, 360);
                }
                if (event.critical) this.queueTriggerVfx(() => this.playWeaponEffect('critical'), 360);
                this.enemyImpactFeedback(event.damage, {
                    critical: event.critical,
                    label: event.critical
                        ? '暴擊'
                        : '命中',
                    heavy: event.weapon.effect === 'heavy'
                });
            }
            if (!event.intercepted) this.setFeed(`${event.weapon.name}${event.critical ? '暴擊' : '命中'}，造成 ${event.damage} 點傷害`);
        } else if (event.type === 'player:miss') {
            this.showFloatNumber(0, { target: 'enemy', label: event.evaded ? '閃避' : '失誤' });
            this.setFeed(event.evaded ? `${event.snapshot.monster.name}避開了攻擊` : `${event.weapon.name}揮空`);
        } else if (event.type === 'player:potion') {
            this.engine.heal({ target: 'player' });
            this.flash('rgba(120, 202, 146, 0.24)');
            this.showFloatNumber(event.amount, { target: 'player', heal: true, label: '恢復' });
            this.setFeed(`生命藥水恢復 ${event.amount} 點生命`);
        } else if (event.type === 'player:lifesteal') {
            this.engine.playerLifesteal();
            this.showSkill('武器', '生命汲取');
            if (event.amount > 0) {
                this.showFloatNumber(event.amount, { target: 'player', heal: true, label: '吸血' });
                this.setFeed(`${event.weapon.name}吸取 ${event.amount} 點生命`);
            } else {
                this.setFeed(`${event.weapon.name}的吸血效果已觸發，但生命已滿`);
            }
        } else if (event.type === 'player:buff-added') {
            this.setFeed(`${event.buff.name}${event.refreshed ? '已刷新' : '已生效'}`);
        } else if (event.type === 'player:weapon-trigger') {
            this.handleWeaponProfileTrigger(event);
        } else if (event.type === 'player:buff-expired') {
            this.setFeed(`${event.buff.name}效果結束`);
        } else if (event.type === 'player:status-added') {
            this.setFeed(`${event.status.name}${event.refreshed ? '延長' : '生效'}`);
        } else if (event.type === 'player:status-damage') {
            this.playerImpactFeedback(event.damage, { label: event.status.name, light: true });
        } else if (event.type === 'monster:status-added') {
            if (event.status.tone === 'heal') this.engine.heal({ target: 'enemy' });
        } else if (event.type === 'monster:heal') {
            this.engine.heal({ target: 'enemy' });
            this.showFloatNumber(event.amount, { target: 'enemy', heal: true, label: '恢復' });
        } else if (event.type === 'monster:summon-hit') {
            this.playMonsterEffect('slash');
            this.playerImpactFeedback(event.damage, { label: event.status.name });
        } else if (event.type === 'monster:summon-block') {
            this.enemyImpactFeedback(event.damage, { label: '侍從擋下' });
        } else if (event.type === 'monster:summon-defeated') {
        } else if (event.type === 'player:flee') {
            this.showSkill('戰術', '脫離交戰');
        } else if (event.type === 'player:flee-failed') {
            this.showSkill('戰術', '撤離失敗');
            this.setFeed('退路被封住了，撐過攻勢後再找機會。');
        } else if (event.type === 'monster:telegraph') {
            this.restartClass(this.enemyStage, 'is-casting', Math.ceil(event.attack.telegraph * 1000));
            this.setFeed(`${event.snapshot.monster.name}正在準備「${event.attack.name}」`);
        } else if (event.type === 'monster:flow-paused') {
            this.setFeed('敵方行動暫停，等待完成教學指令');
        } else if (event.type === 'monster:flow-resumed') {
            this.setFeed('敵方恢復行動');
        } else if (event.type === 'monster:attack-release') {
            this.playMonsterEffect(event.attack.effect);
            if (event.attack.effect === 'claw') this.restartClass(this.enemyStage, 'is-lunging', 650);
            this.setFeed(`${event.attack.name}已釋放`);
        } else if (event.type === 'monster:hit') {
            if (event.damage > 0) {
                this.playerImpactFeedback(event.damage, {
                    label: event.critical ? '暴擊' : event.attack.name,
                    critical: event.critical
                });
                this.setFeed(`${event.snapshot.monster.name}${event.critical ? '暴擊，' : ''}造成 ${event.damage} 點傷害`);
            }
        } else if (event.type === 'action:rejected') {
            this.handleRejectedAction(event);
        } else if (event.type === 'battle:end') {
            this.showResult(event.result);
            this.options.onBattleEnd?.(event);
        }
    }

    handleRejectedAction(event) {
        const messages = {
            battle_not_running: '請先開始交戰',
            cooldown: '動作仍在冷卻',
            weapon_disabled: '武器目前無法使用',
            empty: '生命藥水已用盡',
            full_hp: '生命已滿'
        };
        this.setFeed(messages[event.reason] || '目前無法執行這個動作');
    }

    renderSnapshot(snapshot, { immediate = false } = {}) {
        this.stage.dataset.phase = snapshot.phase;
        this.stage.dataset.enemyFlow = snapshot.monsterFlowPaused ? 'paused' : 'active';
        this.renderHealth('monster', snapshot.monster.hp, snapshot.monster.maxHp, immediate);
        this.renderHealth('player', snapshot.player.hp, snapshot.player.maxHp, immediate);
        this.root.querySelector('#enemy-hp').textContent = snapshot.monster.hp;
        this.root.querySelector('#enemy-max-hp').textContent = snapshot.monster.maxHp;
        this.root.querySelector('#player-hp').textContent = snapshot.player.hp;
        this.root.querySelector('#player-max-hp').textContent = snapshot.player.maxHp;
        this.root.querySelector('#potion-count').textContent = snapshot.player.potions;
        this.renderPotionCooldown(snapshot.cooldowns.potion, 1.2);
        this.renderFleeCooldown(snapshot.cooldowns.flee, this.session?.config?.fleeCooldown || 2);
        this.renderWeaponDurability('main');
        this.renderWeaponDurability('offhand');
        this.renderBuffs(snapshot.player.buffs || []);
        this.renderPlayerDebuffs(snapshot.player.statuses || []);
        this.renderMonsterStatuses(snapshot.monster.statuses || []);
        this.renderIntent(snapshot.monsterIntent, snapshot.phase);
        this.renderSessionState(snapshot.phase);
        this.renderRhythmState(snapshot);
        const mainHitZoneBonus = (snapshot.player.buffs || [])
            .filter(buff => String(buff.id || '').startsWith('weapon-form:main:'))
            .reduce((sum, buff) => sum + (Number(buff.modifiers?.hitZoneBonus) || 0), 0);
        const offhandHitZoneBonus = (snapshot.player.buffs || [])
            .filter(buff => String(buff.id || '').startsWith('weapon-form:offhand:'))
            .reduce((sum, buff) => sum + (Number(buff.modifiers?.hitZoneBonus) || 0), 0);
        if (this.lastHitZoneBonus?.main !== mainHitZoneBonus) {
            this.mainRhythmSystem?.setBattleHitZoneBonus(mainHitZoneBonus);
        }
        if (this.lastHitZoneBonus?.offhand !== offhandHitZoneBonus) {
            this.offhandRhythmSystem?.setBattleHitZoneBonus(offhandHitZoneBonus);
        }
        this.lastHitZoneBonus = { main: mainHitZoneBonus, offhand: offhandHitZoneBonus };
    }

    handleWeaponProfileTrigger(event) {
        const labels = {
            steadyStance: '穩定架勢',
            quickChainCharge: '追擊蓄勢',
            quickChain: '爆擊追擊',
            bulwarkGuard: '壁壘防守',
            arcaneResonanceCharge: '元素共鳴',
            arcaneElement: '元素共鳴',
            magicBolt: '元素彈',
            piercingLine: '貫穿戰線'
        };
        const label = labels[event.triggerType] || event.profile?.label || '武器效果';
        this.showSkill('武器', label);
        if (event.damage > 0) {
            this.queueTriggerVfx(() => {
                const effect = event.triggerType === 'magicBolt'
                    ? 'focus'
                    : event.triggerType === 'quickChain'
                        ? 'critical'
                        : event.weapon?.effect;
                this.playWeaponEffect(effect);
                this.enemyImpactFeedback(event.damage, {
                    label,
                    critical: event.triggerType === 'quickChain',
                    heavy: ['heavy', 'lance'].includes(event.weapon?.effect)
                });
            }, event.triggerType === 'magicBolt' ? 700 : 420);
        } else if (event.triggerType === 'bulwarkGuard') {
            this.queueTriggerVfx(() => this.engine.guard?.({ target: 'player' }), 360);
        } else if (event.triggerType === 'arcaneElement') {
            this.queueTriggerVfx(() => {
                this.engine.setElement(event.element || 'neutral');
                this.engine.elementalImpact(this.engine.enemyPoint, { scale: 0.72 });
            }, 420);
        }
    }

    queueTriggerVfx(callback, duration = 420) {
        const now = performance.now();
        const delay = Math.max(0, this.triggerVfxReadyAt - now);
        this.triggerVfxReadyAt = Math.max(now, this.triggerVfxReadyAt) + duration;
        return this.scheduleUi(callback, delay);
    }

    renderHealth(target, current, max, immediate) {
        if (!immediate && this.lastHealth[target] === current) return;
        const fill = this.root.querySelector(`#${target === 'monster' ? 'enemy' : 'player'}-health-fill`);
        const loss = this.root.querySelector(`#${target === 'monster' ? 'enemy' : 'player'}-health-loss`);
        const percent = clamp(current / Math.max(1, max) * 100, 0, 100);
        const previous = this.lastHealth[target];
        this.lastHealth[target] = current;
        fill.style.width = `${percent}%`;
        if (immediate || previous === null || current >= previous) {
            loss.style.width = `${percent}%`;
        } else {
            this.scheduleUi(() => { loss.style.width = `${percent}%`; }, 130);
        }
    }

    renderPotionCooldown(remaining, total) {
        const button = this.root.querySelector('#use-potion');
        const mask = this.root.querySelector('#potion-cooldown-mask');
        const ratio = clamp(remaining / Math.max(total, 0.001), 0, 1);
        button.classList.toggle('is-cooling', ratio > 0.001);
        mask.style.setProperty('--cooldown-height', `${ratio * 100}%`);
    }

    renderFleeCooldown(remaining, total) {
        const button = this.root.querySelector('#flee-battle');
        const ring = this.root.querySelector('#flee-cooldown-ring');
        const value = this.root.querySelector('#flee-cooldown-value');
        if (!button || !ring || !value) return;
        const ratio = clamp(remaining / Math.max(total, 0.001), 0, 1);
        const cooling = ratio > 0.001;
        button.classList.toggle('is-cooling', cooling);
        ring.style.setProperty('--cooldown-progress', `${ratio * 360}deg`);
        value.textContent = cooling ? remaining.toFixed(1) : '';
    }

    renderBuffs(buffs) {
        const activeIds = new Set(buffs.map(buff => buff.id));
        this.buffList.querySelectorAll('[data-buff-id]').forEach(node => {
            if (!activeIds.has(node.dataset.buffId)) node.remove();
        });

        buffs.forEach(buff => {
            let node = this.buffList.querySelector(`[data-buff-id="${buff.id}"]`);
            if (!node) {
                node = document.createElement('span');
                node.className = 'buff-icon';
                node.dataset.buffId = buff.id;
                const image = document.createElement('img');
                image.src = buff.icon || '';
                image.alt = buff.name;
                image.hidden = !buff.icon || !String(buff.icon).includes('/');
                const glyph = document.createElement('span');
                glyph.className = 'buff-glyph';
                glyph.textContent = image.hidden ? (buff.icon || '•') : '';
                const time = document.createElement('span');
                time.className = 'buff-time';
                node.append(image, glyph, time);
                this.buffList.appendChild(node);
            }
            const consumed = clamp(1 - buff.remaining / Math.max(buff.duration, 0.001), 0, 1);
            node.style.setProperty('--buff-consumed', `${consumed * 100}%`);
            node.title = `${buff.name} · ${buff.remaining.toFixed(1)} 秒`;
            node.querySelector('.buff-time').textContent = Math.ceil(buff.remaining);
        });

        const empty = this.buffList.querySelector('.buff-empty');
        if (buffs.length === 0 && !empty) {
            const placeholder = document.createElement('span');
            placeholder.className = 'buff-empty';
            placeholder.textContent = 'NONE';
            this.buffList.appendChild(placeholder);
        } else if (buffs.length > 0) {
            empty?.remove();
        }
    }

    renderMonsterStatuses(statuses) {
        const activeIds = new Set(statuses.map(status => status.id));
        this.monsterStatusRow.querySelectorAll('[data-monster-status-id]').forEach(node => {
            if (!activeIds.has(node.dataset.monsterStatusId)) node.remove();
        });
        statuses.forEach(status => {
            let node = this.monsterStatusRow.querySelector(`[data-monster-status-id="${status.id}"]`);
            if (!node) {
                node = document.createElement('span');
                node.className = `status-chip is-${status.tone || 'neutral'}`;
                node.dataset.monsterStatusId = status.id;
                this.monsterStatusRow.appendChild(node);
            }
            node.textContent = `${status.icon || '•'} ${status.name} ${Math.ceil(status.remaining)}`;
            node.title = `${status.name} · ${status.remaining.toFixed(1)} 秒`;
        });
    }

    renderPlayerDebuffs(statuses) {
        const activeIds = new Set(statuses.map(status => status.id));
        this.playerDebuffList.querySelectorAll('[data-player-status-id]').forEach(node => {
            if (!activeIds.has(node.dataset.playerStatusId)) node.remove();
        });
        statuses.forEach(status => {
            let node = this.playerDebuffList.querySelector(`[data-player-status-id="${status.id}"]`);
            if (!node) {
                node = document.createElement('span');
                node.className = `status-chip is-${status.tone || 'neutral'}`;
                node.dataset.playerStatusId = status.id;
                this.playerDebuffList.appendChild(node);
            }
            node.textContent = `${status.icon || '•'} ${status.name} ${Math.ceil(status.remaining)}`;
            node.title = `${status.name} · ${status.remaining.toFixed(1)} 秒`;
        });
    }

    renderIntent(intent, phase) {
        if (this.labMode !== 'combat' || phase !== CombatSessionPhase.RUNNING || !intent) {
            this.intentPanel.hidden = true;
            return;
        }
        this.intentPanel.hidden = false;
        this.intentPanel.classList.toggle('is-skill', Boolean(intent.attack.isSkill));
        this.root.querySelector('#intent-name').textContent = intent.attack.name;
        this.root.querySelector('#intent-time').textContent = `${Math.max(0, intent.remaining).toFixed(2)} 秒`;
        this.root.querySelector('#intent-fill').style.width = `${intent.progress * 100}%`;
    }

    renderSessionState(phase) {
        const state = this.root.querySelector('#session-state');
        if (state) state.textContent = PHASE_LABELS[phase] || phase;
        const button = this.root.querySelector('#toggle-combat');
        if (!button) return;
        if (phase === CombatSessionPhase.RUNNING) button.textContent = '暫停';
        else if (phase === CombatSessionPhase.PAUSED) button.textContent = '繼續交戰';
        else if (phase === CombatSessionPhase.IDLE) button.textContent = '開始交戰';
        else button.textContent = '重新交戰';
    }

    playWeaponEffect(effect) {
        if (effect === 'sword') this.engine.swordSlash();
        else if (effect === 'dagger') this.engine.daggerChain();
        else if (effect === 'heavy') this.engine.heavyImpact();
        else if (effect === 'lance') this.engine.lanceThrust({ fromRight: true });
        else if (effect === 'focus') this.engine.focusResonance();
        else if (effect === 'unarmed') this.engine.unarmedStrike();
        else if (effect === 'critical') this.engine.swordSlash({ mirrored: true, critical: true });
    }

    playMonsterEffect(effect) {
        if (effect === 'claw') this.engine.monsterClaw();
        else if (effect === 'crush') this.engine.monsterCrush();
        else if (effect === 'projectile') this.engine.monsterProjectile();
        else if (effect === 'breath') this.engine.monsterBreath();
        else if (effect === 'curse') this.engine.monsterCurse();
        else if (effect === 'body') this.engine.monsterBodyImpact();
        else if (effect === 'slash' || effect === 'ambush') this.engine.monsterSlash();
        else if (effect === 'bite') this.engine.monsterBite();
        else if (effect === 'poison') this.engine.monsterBite({ poison: true });
        else if (effect === 'sonic') this.engine.monsterSonic();
        else if (effect === 'roots') this.engine.monsterRoots();
        else if (effect === 'vanish' || effect === 'phase') this.engine.monsterVanish();
        else if (effect === 'nature') this.engine.monsterNatureWrath();
        else if (effect === 'regeneration') this.engine.heal({ target: 'enemy' });
        else if (effect === 'lightning') this.engine.monsterLightning();
        else if (effect === 'dark-projectile') this.engine.monsterDarkProjectile();
        else if (effect === 'drain') this.engine.monsterDrain();
        else if (effect === 'harden') this.engine.monsterHarden();
        else if (effect === 'summon') this.engine.monsterSummon();
    }

    triggerManualEffect(effectId, options = {}) {
        if (this.labMode !== 'effects' || !EFFECT_LABELS[effectId]) return;
        if (!options.keepShowcase) this.stopShowcaseOnly();
        if (!options.quiet) this.setFeed(`${EFFECT_LABELS[effectId]}正在播放`);

        if (['sword', 'dagger', 'heavy', 'lance', 'focus', 'critical'].includes(effectId)) {
            this.playWeaponEffect(effectId);
            const delayMap = { sword: 90, dagger: 250, heavy: 100, lance: 260, focus: 580, critical: 90 };
            const damageMap = { sword: 96, dagger: 98, heavy: 168, lance: 122, focus: 146, critical: 284 };
            this.scheduleUi(() => this.enemyImpactFeedback(damageMap[effectId], {
                critical: ['lance', 'critical'].includes(effectId),
                heavy: effectId === 'heavy',
                label: effectId === 'critical' ? '暴擊' : null
            }), delayMap[effectId]);
            return;
        }

        if (effectId === 'boss-phase') {
            this.showSkill('首領階段', EFFECT_LABELS[effectId]);
            this.restartClass(this.enemyStage, 'is-phase', 1800);
            this.engine.bossPhase();
            this.flash('rgba(219, 91, 58, 0.42)');
            this.shake('light');
            return;
        }

        this.showSkill('敵人', EFFECT_LABELS[effectId]);
        this.restartClass(this.enemyStage, effectId === 'claw' ? 'is-lunging' : 'is-casting', 860);
        this.playMonsterEffect(effectId);
        if (['vanish', 'phase', 'harden', 'summon', 'regeneration'].includes(effectId)) {
            this.addStatus(EFFECT_LABELS[effectId], effectId === 'regeneration' ? '#8fd39b' : '#d4bd7f', 1800, 'monster');
            return;
        }
        const delayMap = {
            claw: 270, crush: 290, projectile: 760, breath: 840, curse: 780,
            body: 240, slash: 250, bite: 260, poison: 260, sonic: 620,
            roots: 650, ambush: 250, nature: 520, lightning: 590,
            'dark-projectile': 680, drain: 680
        };
        const damageMap = {
            claw: 52, crush: 78, projectile: 41, breath: 66, curse: 24,
            body: 28, slash: 42, bite: 34, poison: 26, sonic: 24,
            roots: 18, ambush: 58, nature: 72, lightning: 48,
            'dark-projectile': 46, drain: 38
        };
        this.scheduleUi(() => this.playerImpactFeedback(damageMap[effectId], {
            label: EFFECT_LABELS[effectId]
        }), delayMap[effectId] ?? 300);
    }

    enemyImpactFeedback(damage, { critical = false, heavy = false, label = null } = {}) {
        const hitClass = heavy ? 'is-heavy-hit' : (critical ? 'is-critical-hit' : 'is-hit');
        this.restartClass(this.enemyStage, hitClass, heavy ? 430 : 380);
        this.flash(critical ? 'rgba(255, 211, 112, 0.58)' : 'rgba(255, 248, 225, 0.38)');
        this.shake(heavy ? 'heavy' : 'light');
        this.hitStop(heavy ? 86 : 55);
        this.showFloatNumber(damage, { target: 'enemy', critical, label });
    }

    playerImpactFeedback(damage, { label = null, light = false, critical = false } = {}) {
        this.flash(critical ? 'rgba(230, 88, 54, 0.56)' : 'rgba(210, 68, 48, 0.4)');
        this.restartClass(this.damageVignette, 'is-active', 540);
        this.shake(light ? 'light' : 'heavy');
        this.hitStop(critical ? 92 : (light ? 42 : 72));
        this.showFloatNumber(damage, { target: 'player', playerDamage: true, critical, label });
    }

    showResult(phase) {
        if (this.labMode !== 'combat') return;
        const titles = {
            [CombatSessionPhase.VICTORY]: ['戰鬥結束', '勝利'],
            [CombatSessionPhase.DEFEAT]: ['戰鬥失敗', '敗北'],
            [CombatSessionPhase.ESCAPED]: ['已脫離戰鬥', '撤離成功']
        };
        const result = titles[phase];
        if (!result) return;
        this.root.querySelector('#combat-result-kicker').textContent = result[0];
        this.root.querySelector('#combat-result-title').textContent = result[1];
        this.resultPanel.hidden = false;
        const action = this.root.querySelector('#combat-result-restart');
        if (action && this.options.resultActionLabels) {
            action.textContent = this.options.resultActionLabels[phase] || '返回地圖';
        }
        if (phase === CombatSessionPhase.VICTORY) {
            this.flash('rgba(227, 197, 116, 0.32)');
            this.setFeed(`${this.getMonsterConfig().name}已被擊破`);
        } else if (phase === CombatSessionPhase.DEFEAT) {
            this.restartClass(this.damageVignette, 'is-active', 900);
            this.setFeed('玩家失去戰鬥能力');
        } else {
            this.playFleeFeedback({ quiet: true });
            this.setFeed('已脫離交戰範圍');
        }
    }

    scheduleUi(callback, delay) {
        const timer = window.setTimeout(() => {
            this.uiTimers.delete(timer);
            callback();
        }, delay);
        this.uiTimers.add(timer);
        return timer;
    }

    scheduleShowcase(callback, delay) {
        const timer = window.setTimeout(() => {
            this.showcaseTimers.delete(timer);
            callback();
        }, delay);
        this.showcaseTimers.add(timer);
        return timer;
    }

    showFloatNumber(amount, { target = 'enemy', critical = false, playerDamage = false, heal = false, label = null } = {}) {
        if (!this.settings.numbers) return;
        const number = document.createElement('span');
        number.className = 'float-number';
        if (critical) number.classList.add('is-critical');
        if (playerDamage) number.classList.add('is-player-damage');
        if (heal) number.classList.add('is-heal');
        number.classList.add(target === 'enemy' ? 'is-enemy-target' : 'is-player-target');
        number.dataset.target = target;
        const targetPoint = target === 'enemy'
            ? {
                x: this.engine.enemyPoint.x + this.engine.width * 0.12,
                y: this.engine.enemyPoint.y - this.engine.height * 0.07
            }
            : this.engine.playerPoint;
        const base = {
            x: targetPoint.x / Math.max(1, this.engine.width) * 100,
            y: targetPoint.y / Math.max(1, this.engine.height) * 100
        };
        number.style.left = `${base.x + (Math.random() - 0.5) * 7}%`;
        number.style.top = `${base.y + (Math.random() - 0.5) * 4}%`;
        const sign = heal ? '+' : (amount > 0 ? '−' : '');
        number.innerHTML = `${sign}${amount || ''}${label ? `<small>${label}</small>` : ''}`;
        this.floatLayer.appendChild(number);
        this.scheduleUi(() => number.remove(), 960);
    }

    addStatus(label, color = '#d7b277', duration = 2200, target = 'player') {
        const chip = document.createElement('span');
        chip.className = 'status-chip';
        chip.textContent = label;
        chip.style.color = color;
        const container = target === 'monster' ? this.monsterStatusRow : this.playerDebuffList;
        container.appendChild(chip);
        while (container.children.length > 3) container.firstElementChild.remove();
        this.scheduleUi(() => chip.remove(), duration);
    }

    showSkill(source, name) {
        this.root.querySelector('#skill-source').textContent = source;
        this.root.querySelector('#skill-name').textContent = name;
        this.restartClass(this.skillBanner, 'is-active', 1210);
    }

    setFeed(text) {
        this.options.onFeed?.(text);
    }

    flash(color) {
        this.screenFlash.style.setProperty('--flash-color', color);
        this.restartClass(this.screenFlash, 'is-active', 190);
    }

    shake(strength = 'light') {
        if (!this.settings.shake) return;
        const className = strength === 'heavy' ? 'is-shaking-heavy' : 'is-shaking-light';
        this.restartClass(this.stage, className, strength === 'heavy' ? 340 : 190);
    }

    hitStop(duration = 60) {
        if (!this.settings.hitStop) return;
        const canvases = [
            this.root.querySelector('#vfx-canvas-front'),
            this.root.querySelector('#vfx-canvas-rear')
        ];
        canvases.forEach(canvas => { canvas.style.filter = 'brightness(1.28) contrast(1.08)'; });
        this.scheduleUi(() => canvases.forEach(canvas => { canvas.style.filter = ''; }), duration);
    }

    restartClass(element, className, duration) {
        element.classList.remove(className);
        void element.offsetWidth;
        element.classList.add(className);
        this.scheduleUi(() => element.classList.remove(className), duration);
    }

    playFleeFeedback({ quiet = false } = {}) {
        if (!quiet) {
            this.setFeed('撤離回饋正在播放');
            this.showSkill('戰術', '脫離交戰');
        }
        this.stage.animate([
            { filter: 'brightness(1)', opacity: 1 },
            { filter: 'brightness(0.2)', opacity: 0.42, offset: 0.58 },
            { filter: 'brightness(1)', opacity: 1 }
        ], { duration: 760, easing: 'ease-in-out' });
    }

    playShowcase() {
        if (this.showcaseRunning || this.labMode !== 'effects') return;
        this.clearEffects({ preserveShowcase: true });
        this.showcaseRunning = true;
        const button = this.root.querySelector('#play-showcase');
        button.disabled = true;
        button.textContent = '展示播放中';
        const cues = [
            [0, () => this.setElement('neutral')],
            [180, () => this.triggerManualEffect('sword', { keepShowcase: true })],
            [920, () => this.setElement('fire')],
            [1120, () => this.triggerManualEffect('heavy', { keepShowcase: true })],
            [2250, () => this.triggerManualEffect('projectile', { keepShowcase: true })],
            [3550, () => this.setElement('ice')],
            [3760, () => this.triggerManualEffect('lance', { keepShowcase: true })],
            [4700, () => this.triggerManualEffect('curse', { keepShowcase: true })],
            [5900, () => this.setElement('glimmer')],
            [6100, () => this.triggerManualEffect('focus', { keepShowcase: true })],
            [7480, () => this.triggerManualEffect('boss-phase', { keepShowcase: true })],
            [9300, () => this.triggerManualEffect('critical', { keepShowcase: true })],
            [10500, () => {
                this.showcaseRunning = false;
                button.disabled = false;
                button.textContent = '播放完整展示';
                this.setFeed('完整展示播放完畢');
            }]
        ];
        cues.forEach(([delay, callback]) => this.scheduleShowcase(callback, delay));
    }

    stopShowcaseOnly() {
        if (!this.showcaseRunning) return;
        this.showcaseTimers.forEach(timer => window.clearTimeout(timer));
        this.showcaseTimers.clear();
        this.showcaseRunning = false;
        const button = this.root.querySelector('#play-showcase');
        button.disabled = false;
        button.textContent = '播放完整展示';
    }

    cancelUiTimers() {
        this.uiTimers.forEach(timer => window.clearTimeout(timer));
        this.uiTimers.clear();
    }

    clearEffects({ preserveShowcase = false } = {}) {
        if (!preserveShowcase) this.stopShowcaseOnly();
        this.cancelUiTimers();
        this.triggerVfxReadyAt = 0;
        this.engine.clear();
        this.floatLayer.innerHTML = '';
        this.playerDebuffList.innerHTML = '';
        this.monsterStatusRow.innerHTML = '';
        ['is-hit', 'is-critical-hit', 'is-heavy-hit', 'is-casting', 'is-lunging', 'is-phase', 'is-healing']
            .forEach(className => this.enemyStage.classList.remove(className));
        this.stage.classList.remove('is-shaking-light', 'is-shaking-heavy');
        this.screenFlash.classList.remove('is-active');
        this.damageVignette.classList.remove('is-active');
        this.skillBanner.classList.remove('is-active');
    }

    resetStage() {
        this.stopShowcaseOnly();
        this.clearEffects();
        this.currentElement = 'neutral';
        this.engine.setElement('neutral');
        const elementLabel = this.root.querySelector('#element-label');
        if (elementLabel) elementLabel.textContent = ELEMENT_LABELS.neutral;
        this.root.querySelectorAll('[data-element]').forEach(button => {
            button.classList.toggle('is-active', button.dataset.element === 'neutral');
        });
        this.resultPanel.hidden = true;
        this.lastHealth = { player: null, monster: null };
        this.session.configure(this.buildSessionConfig());
        this.renderSnapshot(this.session.getSnapshot(), { immediate: true });
        this.setFeed(this.getMonsterConfig().feed);
    }

    destroy() {
        document.removeEventListener('keydown', this.handleKeyboard);
        this.stage?.removeEventListener('mousedown', this.handleStageMouseDown);
        this.stage?.removeEventListener('contextmenu', this.handleContextMenu);
        this.root.querySelector('#use-potion')?.removeEventListener('click', this.handlePotionClick);
        this.root.querySelector('#flee-battle')?.removeEventListener('click', this.handleFleeClick);
        this.root.querySelector('#combat-result-restart')?.removeEventListener('click', this.handleResultClick);
        this.unsubscribeSession?.();
        this.session?.destroy?.();
        this.mainRhythmSystem?.stop?.();
        this.offhandRhythmSystem?.stop?.();
        this.clearEffects();
        this.engine?.destroy?.();
    }
}

const root = document.querySelector('#vfx-lab');
if (root) {
    mountSharedCombatPreview(root);
    new CombatVfxLab(root);
}
