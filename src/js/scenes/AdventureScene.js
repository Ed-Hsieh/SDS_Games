import GameManager from '../managers/GameManager.js';
import MonsterManager from '../managers/MonsterManager.js';
import CombatFlowController from '../managers/CombatFlowController.js?v=dialogue-flow-20260712w';
import {
    createLocationEncounter,
    resolveEncounterDrop,
    settleEncounterVictory
} from '../managers/AdventureEncounterManager.js?v=dialogue-flow-20260712w';
import AdventurePanelsController from '../components/AdventurePanelsController.js';
import WorldMap from '../utils/WorldMap.js';
import {
    OverworldMapConfig,
    SecondRunOvercapBossReserves
} from '../data/OverworldMapRegistry.js';
import { getGeneratedMonsterImage } from '../data/AssetManifest.js';
import { storySceneManager } from '../managers/StorySceneManager.js?v=chapter1-art-20260713a';
import { storyJournalManager } from '../managers/StoryJournalManager.js';
import {
    PROLOGUE_TUTORIAL_OUTCOME_FLAG,
    PROLOGUE_TUTORIAL_RESOLVED_FLAG,
    PROLOGUE_WAKE_DIALOGUE_PENDING_FLAG
} from '../data/StoryStateContract.js?v=dialogue-flow-20260712w';
import storyDialogueController from '../managers/StoryDialogueController.js?v=dialogue-read-cue-20260715b';
import { isDevModeEnabled } from '../utils/DevMode.js';
import { ItemUseAction, ItemUseContext } from '../data/UtilityItems.js';

const THREE_LANDMARK_IDS = Object.freeze([
    'south_gate_farmland',
    'hunter_boardwalk',
    'old_campfire_site'
]);

const LANDMARK_STORY_SCENES = Object.freeze({
    silver_snare_pass: 'ch1_s07_silver_snare',
    rotroot_ravine: 'ch1_s09_rotroot_approach',
    old_wolf_den: 'ch1_s10_forest_guardian',
    mist_tablet_hill: 'ch2_s04_mist_and_tomb_route',
    moon_moss_slope: 'ch2_s05_moon_moss_trace',
    opened_ancient_tomb: 'ch2_s06_keeper_of_names',
    north_checkpoint_marker: 'ch2_s08_shadow_at_the_checkpoint'
});

const MOVE_REPEAT_MS = 80;

function loadImage(src) {
    if (!src) return Promise.resolve(null);
    return new Promise(resolve => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => resolve(null);
        image.src = src;
    });
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export default class AdventureScene {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.canvas = null;
        this.context = null;
        this.worldMap = null;
        this.images = new Map();
        this.animationFrame = 0;
        this.lastMoveAt = 0;
        this.regionToastTimer = 0;
        this.modalOpen = false;
        this.modalConfirmHandler = null;
        this.panels = null;
        this.combat = null;
        this.showOvercapReserves = false;
        this.storyCombatResolution = null;
        this.devMode = isDevModeEnabled()
            || new URLSearchParams(window.location.search).has('map-test');

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.renderFrame = this.renderFrame.bind(this);
        this.handleDevReturnToLobby = this.handleDevReturnToLobby.bind(this);
    }

    async init() {
        this.cacheDom();
        if (!this.canvas || !this.context) {
            throw new Error('Adventure map canvas is missing');
        }

        this.worldMap = new WorldMap(GameManager.getCharacter(), 1280, 720);
        this.panels = new AdventurePanelsController(this.container, {
            onPlayerStateChange: () => this.renderPlayerStats(),
            onUseContextItem: stack => this.useContextItem(stack),
            getStoryHintContext: () => ({
                discoveredLandmarkIds: [...(this.worldMap?.discoveredLandmarks || [])]
            })
        });
        this.combat = new CombatFlowController(this.container, {
            scene: { type: 'overworld', id: this.worldMap.config.id },
            settleVictory: encounter => encounter?.context?.prologueTutorial
                ? { exp: 0, gold: 0, drops: [] }
                : settleEncounterVictory(encounter),
            resolveDrop: (drop, decision) => resolveEncounterDrop(drop, decision),
            isSceneComplete: encounter => Boolean(encounter?.storyBoss),
            onBattleStateChange: (result) => {
                if (result === 'victory' && this.activeEncounter?.storyBoss?.bossId) {
                    GameManager.setFlag(`boss.${this.activeEncounter.storyBoss.bossId}.defeated`, true);
                }
                const storyContract = this.activeEncounter?.storyContract;
                if (storyContract && result === 'victory') {
                    this.storyCombatResolution = storySceneManager.resolveEncounter(storyContract.id, { victory: true });
                }
                this.renderPlayerStats();
            },
            onReturnToScene: (phase, completedEncounter) => {
                if (completedEncounter?.context?.prologueTutorial) {
                    this.resolvePrologueTutorial('victory');
                    return;
                }
                this.worldMap.suppressEncounters(4);
                this.activeEncounter = null;
                this.renderPlayerStats();
                this.canvas?.focus();
            },
            onSceneComplete: () => {
                this.worldMap.suppressEncounters(4);
                this.activeEncounter = null;
                this.renderPlayerStats();
                this.canvas?.focus();
                const resolution = this.storyCombatResolution;
                this.storyCombatResolution = null;
                if (resolution?.presentation) {
                    window.setTimeout(() => this.showStoryPresentation(resolution.presentation), 60);
                }
            },
            onDefeat: completedEncounter => {
                if (completedEncounter?.context?.prologueTutorial) {
                    this.resolvePrologueTutorial('defeat');
                    return;
                }
                const storyContract = this.activeEncounter?.storyContract;
                if (storyContract) storySceneManager.resolveEncounter(storyContract.id, { victory: false });
                GameManager.restoreCharacterAtHome('battle-defeat');
                this.app?.navigateTo?.('lobby');
            }
        });
        window.currentAdventureScene = this;
        this.bindEvents();
        this.panels.init();
        this.handleResize();
        this.renderPlayerStats();
        this.renderBossReserveList();
        await this.loadMapAssets();
        this.updateLocationUi({ forceToast: true });
        this.requestRender();
        this.tryStartPendingFieldStory();
    }

    cacheDom() {
        this.canvas = this.container.querySelector('#world-map-canvas');
        this.context = this.canvas?.getContext('2d') || null;
        this.regionTitle = this.container.querySelector('#adventure-region-title');
        this.regionSubtitle = this.container.querySelector('#adventure-region-subtitle');
        this.habitatName = this.container.querySelector('#adventure-habitat-name');
        this.playerLevel = this.container.querySelector('#adv-player-level');
        this.playerHp = this.container.querySelector('#adv-player-hp');
        this.playerGold = this.container.querySelector('#adv-player-gold');
        this.playerFatigue = this.container.querySelector('#adv-player-fatigue');
        this.locationHint = this.container.querySelector('#map-location-hint');
        this.locationHintTitle = this.container.querySelector('#map-location-hint-title');
        this.locationHintText = this.container.querySelector('#map-location-hint-text');
        this.regionToast = this.container.querySelector('#map-region-toast');
        this.regionToastTitle = this.container.querySelector('#map-region-toast-title');
        this.regionToastText = this.container.querySelector('#map-region-toast-text');
        this.modal = this.container.querySelector('#map-landmark-modal');
        this.modalImage = this.container.querySelector('#map-landmark-image');
        this.modalKicker = this.container.querySelector('#map-landmark-kicker');
        this.modalTitle = this.container.querySelector('#map-landmark-title');
        this.modalText = this.container.querySelector('#map-landmark-text');
        this.devPanel = this.container.querySelector('#map-test-panel');
        this.devBossList = this.container.querySelector('#map-test-boss-list');
        this.devSample = this.container.querySelector('#map-test-sample');
        this.devReturnButton = this.container.querySelector('#btn-return-to-lobby');

        if (this.devPanel) this.devPanel.hidden = !this.devMode;
        if (this.devReturnButton) this.devReturnButton.hidden = !this.devMode;
    }

    bindEvents() {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('resize', this.handleResize);

        if (this.devMode) {
            this.devReturnButton?.addEventListener('click', this.handleDevReturnToLobby);
        }
        this.container.querySelector('#map-landmark-close')?.addEventListener('click', () => this.closeModal());
        this.container.querySelector('#map-landmark-confirm')?.addEventListener('click', () => this.confirmModal());
        this.modal?.addEventListener('click', event => {
            if (event.target === this.modal) this.closeModal();
        });

        this.devPanel?.addEventListener('click', event => {
            const button = event.target.closest('[data-map-test-action]');
            if (!button) return;
            this.handleDevAction(button.dataset.mapTestAction);
        });
    }

    cleanup() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('resize', this.handleResize);
        this.devReturnButton?.removeEventListener('click', this.handleDevReturnToLobby);
        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
        if (this.regionToastTimer) window.clearTimeout(this.regionToastTimer);
        this.panels?.destroy?.();
        this.combat?.destroy?.();
        if (window.currentAdventureScene === this) delete window.currentAdventureScene;
    }

    handleDevReturnToLobby() {
        if (!this.devMode) return;
        this.returnToTown('adventure-dev-return', { restore: true });
    }

    returnToTown(reason, options = {}) {
        if (options.restore) GameManager.restoreCharacterAtHome(reason);
        else {
            GameManager.requestTownNarrativeReset(reason);
            GameManager.markSaveDirty(reason);
        }
        this.app?.navigateTo?.('lobby');
    }

    useContextItem(stack) {
        if (!stack || this.combat?.isActive()) return false;
        const item = stack.item || {};
        if (item.useContext !== ItemUseContext.ADVENTURE_MAP
            || item.useAction !== ItemUseAction.RETURN_TO_TOWN) return false;
        const consumed = GameManager.consumeContextItem(
            stack.instanceId,
            ItemUseContext.ADVENTURE_MAP,
            ItemUseAction.RETURN_TO_TOWN
        );
        if (!consumed) return false;
        this.panels?.closeDrawers();
        this.returnToTown('adventure-wolf-smoke');
        return true;
    }

    async loadMapAssets() {
        const assetEntries = [];
        for (const tile of OverworldMapConfig.tiles) {
            assetEntries.push([`tile:${tile.id}`, tile.image]);
        }
        for (const landmark of OverworldMapConfig.landmarks) {
            assetEntries.push([`landmark:${landmark.id}`, landmark.image]);
        }
        for (const gate of OverworldMapConfig.routeGates) {
            assetEntries.push([`gate-blocked:${gate.id}`, gate.blockedImage]);
            assetEntries.push([`gate-repaired:${gate.id}`, gate.repairedImage]);
        }
        if (OverworldMapConfig.townReturn?.image) {
            assetEntries.push([
                `landmark:${OverworldMapConfig.townReturn.id}`,
                OverworldMapConfig.townReturn.image
            ]);
        }

        await Promise.all(assetEntries.map(async ([key, src]) => {
            const image = await loadImage(src);
            if (image) this.images.set(key, image);
        }));
    }

    handleResize() {
        if (!this.canvas || !this.worldMap) return;
        const bounds = this.canvas.getBoundingClientRect();
        const width = Math.max(1, Math.round(bounds.width));
        const height = Math.max(1, Math.round(bounds.height));
        const pixelRatio = clamp(window.devicePixelRatio || 1, 1, 2);
        this.canvas.width = Math.round(width * pixelRatio);
        this.canvas.height = Math.round(height * pixelRatio);
        this.worldMap.setViewport(width, height);
        this.requestRender();
    }

    handleKeyDown(event) {
        if (event.defaultPrevented) return;
        if (event.ctrlKey || event.altKey || event.metaKey) return;
        if (storyDialogueController.isOpen()) return;
        if (this.combat?.isActive()) return;
        const tagName = event.target?.tagName?.toLowerCase();
        if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') return;

        if (event.key === 'Escape') {
            if (this.modalOpen) {
                event.preventDefault();
                this.closeModal();
                return;
            }
            if (this.panels?.isOpen()) {
                event.preventDefault();
                this.panels.closeDrawers();
                return;
            }
        }
        if (this.modalOpen || this.panels?.isOpen()) return;

        if (event.key.toLowerCase() === 'q') {
            event.preventDefault();
            this.panels?.toggleDrawer('quest');
            return;
        }
        if (event.key.toLowerCase() === 'b') {
            event.preventDefault();
            this.panels?.toggleDrawer('inventory');
            return;
        }

        if (event.key.toLowerCase() === 'f' || event.key === 'Enter') {
            event.preventDefault();
            this.interact();
            return;
        }

        const directions = {
            ArrowUp: [0, -1],
            ArrowDown: [0, 1],
            ArrowLeft: [-1, 0],
            ArrowRight: [1, 0],
            w: [0, -1],
            s: [0, 1],
            a: [-1, 0],
            d: [1, 0]
        };
        const direction = directions[event.key] || directions[event.key.toLowerCase()];
        if (!direction) return;

        const now = performance.now();
        if (event.repeat && now - this.lastMoveAt < MOVE_REPEAT_MS) return;
        this.lastMoveAt = now;
        event.preventDefault();
        this.move(...direction);
    }

    move(dx, dy) {
        const result = this.worldMap.movePlayer(dx, dy);
        if (result.type === 'blocked' && result.gate) {
            this.showInteractionHint(result.gate, '前方道路中斷，靠近後調查。');
            this.requestRender();
            return;
        }
        if (result.type !== 'moved') return;

        GameManager.consumeAdventureFatigue(result.habitat?.fatigueCost || 1);
        if (result.enteredHabitat) this.showRegionToast(result.habitat);
        this.updateLocationUi();
        this.renderPlayerStats();
        this.requestRender();

        if (!result.interaction) {
            const encounter = this.worldMap.rollEncounter();
            if (encounter) this.beginEncounter(encounter);
        }
    }

    interact() {
        const entry = this.worldMap.getNearbyInteraction();
        if (!entry) return;
        if (entry.kind === 'town_return') {
            this.openModal({
                kicker: '回程',
                title: entry.name,
                text: entry.text,
                image: this.images.get(`landmark:${entry.id}`),
                actionLabel: '返回城鎮',
                onConfirm: () => {
                    this.closeModal();
                    this.returnToTown('adventure-walk-return');
                    return false;
                }
            });
            return;
        }
        const firstDiscovery = this.worldMap.discoverLandmark(entry);
        this.panels?.renderQuestTracker();
        storyJournalManager.recordLocationDiscoveries(entry.id, {
            chapter: this.worldMap.getCurrentTile()?.chapter,
            firstDiscovery
        });

        const completesChapterOneSurvey = firstDiscovery
            && THREE_LANDMARK_IDS.includes(entry.id)
            && this.hasThreeLandmarkEvidence()
            && storySceneManager.getNextAvailableSceneId() === 'ch1_s06_three_landmarks';

        if (entry.kind === 'route_gate') {
            this.openModal({
                kicker: firstDiscovery ? '道路障礙已發現' : '道路仍然中斷',
                title: entry.name,
                text: firstDiscovery ? entry.blockedText : entry.repeatText,
                image: this.images.get(`gate-blocked:${entry.id}`)
            });
        } else if (firstDiscovery && THREE_LANDMARK_IDS.includes(entry.id)) {
            this.openModal({
                kicker: '現場調查',
                title: entry.name,
                text: entry.firstText,
                image: this.images.get(`landmark:${entry.id}`),
                actionLabel: completesChapterOneSurvey ? '整理三處紀錄' : '記入手札',
                onConfirm: completesChapterOneSurvey
                    ? () => {
                        this.closeModal();
                        this.startMapStoryScene('ch1_s06_three_landmarks', { entry });
                        return false;
                    }
                    : null
            });
        } else if (!this.tryStartLandmarkStory(entry)) {
            const authoredStoryBoss = Boolean(entry.bossId && LANDMARK_STORY_SCENES[entry.id]);
            this.openModal({
                kicker: entry.bossId ? '劇情交會地' : '地標已記錄',
                title: entry.name,
                text: firstDiscovery ? entry.firstText : (entry.repeatText || entry.firstText),
                image: this.images.get(`landmark:${entry.id}`),
                actionLabel: authoredStoryBoss ? '收起手札' : entry.bossId ? '進入戰鬥' : '繼續探索',
                onConfirm: entry.bossId && !authoredStoryBoss ? () => this.beginBossEncounter(entry) : null
            });
        }
        this.updateLocationUi();
        this.requestRender();
    }

    openModal({ kicker, title, text, image, actionLabel = '繼續探索', onConfirm = null }) {
        if (!this.modal) return;
        this.modalKicker.textContent = kicker || '地標';
        this.modalTitle.textContent = title || '';
        this.modalText.textContent = text || '';
        const confirm = this.container.querySelector('#map-landmark-confirm');
        if (confirm) confirm.textContent = actionLabel;
        this.modalConfirmHandler = onConfirm;
        if (image?.src) {
            this.modalImage.style.backgroundImage = `url("${image.src}")`;
            this.modalImage.classList.add('has-image');
        } else {
            this.modalImage.style.backgroundImage = '';
            this.modalImage.classList.remove('has-image');
        }
        this.modal.hidden = false;
        this.modalOpen = true;
        this.container.querySelector('#map-landmark-confirm')?.focus();
    }

    closeModal() {
        if (!this.modal) return;
        this.modal.hidden = true;
        this.modalOpen = false;
        this.modalConfirmHandler = null;
        this.canvas?.focus();
    }

    confirmModal() {
        const handler = this.modalConfirmHandler;
        if (handler && handler() === false) return;
        this.closeModal();
    }

    tryStartPendingFieldStory() {
        const nextSceneId = storySceneManager.getNextAvailableSceneId();
        if (nextSceneId === 'ch1_s01_road_collapse') {
            if (!GameManager.getFlag(PROLOGUE_TUTORIAL_RESOLVED_FLAG)) {
                const opening = storySceneManager.startScene(nextSceneId, { force: true });
                if (opening?.success) {
                    this.showStoryPresentation({
                        ...opening,
                        lines: opening.lines.filter(line => line.presentationPhase === 'pre_battle')
                    }, { completionAction: 'prologue_combat' });
                }
            } else {
                this.showPrologueRescueStory();
            }
            return true;
        }
        if (nextSceneId === 'ch1_s06_three_landmarks' && this.hasThreeLandmarkEvidence()) {
            this.startMapStoryScene(nextSceneId);
            return true;
        }
        return false;
    }

    hasThreeLandmarkEvidence() {
        return THREE_LANDMARK_IDS.every(id => this.worldMap.discoveredLandmarks.has(id));
    }

    tryStartLandmarkStory(entry) {
        const nextSceneId = storySceneManager.getNextAvailableSceneId();
        const sceneId = LANDMARK_STORY_SCENES[entry.id];
        if (!sceneId || storySceneManager.isSceneComplete(sceneId)) return false;

        const optionalMoonMossTrace = sceneId === 'ch2_s05_moon_moss_trace';
        if (optionalMoonMossTrace) {
            if (!storySceneManager.isSceneComplete('ch2_s04_mist_and_tomb_route')) return false;
            return this.startMapStoryScene(sceneId, { entry, force: true });
        }
        if (sceneId !== nextSceneId) return false;
        return this.startMapStoryScene(sceneId, { entry });
    }

    startMapStoryScene(sceneId, options = {}) {
        const outcome = storySceneManager.startScene(sceneId, { force: Boolean(options.force) });
        if (!outcome?.success) return false;
        this.showStoryPresentation(outcome, options);
        return true;
    }

    showStoryPresentation(outcome, options = {}) {
        const lines = (outcome.lines || []).filter(line => line?.text);
        if (!lines.length) return false;
        const story = {
            sceneId: outcome.sceneId,
            scene: outcome.scene,
            encounter: outcome.encounter,
            lines,
            entry: options.entry || this.worldMap.getNearbyInteraction() || null,
            completionAction: options.completionAction || 'complete_scene'
        };
        const image = story.entry?.id ? this.images.get(`landmark:${story.entry.id}`) : null;
        storyDialogueController.play({ ...outcome, lines }, {
            closable: false,
            backgroundImage: image?.src || outcome.backgroundImage || ''
        }).then(result => {
            if (result.status === 'complete') this.completeStoryPresentation(story);
        });
        return true;
    }

    completeStoryPresentation(story) {
        if (story.completionAction === 'prologue_combat') {
            this.beginPrologueTutorialEncounter();
            return;
        }

        const completion = storySceneManager.completeScene(story.sceneId);
        this.panels?.renderQuestTracker();
        const entry = story.entry;
        if (story.completionAction === 'prologue_rescue') {
            this.finishPrologueTransition();
            return;
        }
        if (completion?.transition === 'encounter_required') {
            const started = storySceneManager.beginEncounter(completion.encounter.id);
            if (started?.success && entry) {
                this.beginBossEncounter(entry, { storyContract: started.encounter });
            }
        }
        this.updateLocationUi();
        this.requestRender();
    }

    beginPrologueTutorialEncounter() {
        const habitat = this.worldMap.getCurrentHabitat() || {
            id: 'prologue_south_road',
            name: '南門外斷路',
            chapter: 1,
            threat: 'overcap'
        };
        return this.beginEncounter({
            monsterId: 'blood_moon_stag',
            targetLevel: 15,
            habitat
        }, { prologueTutorial: true });
    }

    resolvePrologueTutorial(outcome = 'defeat') {
        if (GameManager.getFlag(PROLOGUE_TUTORIAL_RESOLVED_FLAG)) return;
        GameManager.setFlag(PROLOGUE_TUTORIAL_RESOLVED_FLAG, true);
        GameManager.setFlag(PROLOGUE_TUTORIAL_OUTCOME_FLAG, outcome);
        const character = GameManager.getCharacter();
        if (character) character.hp = 1;
        GameManager.notify('all');
        this.activeEncounter = null;
        window.setTimeout(() => this.showPrologueRescueStory(), 80);
    }

    showPrologueRescueStory() {
        const outcome = storySceneManager.startScene('ch1_s01_road_collapse', { force: true });
        if (!outcome?.success) {
            this.finishPrologueTransition();
            return;
        }
        this.showStoryPresentation({
            ...outcome,
            lines: outcome.lines.filter(line => line.presentationPhase === 'post_battle')
        }, { completionAction: 'prologue_rescue' });
    }

    finishPrologueTransition() {
        GameManager.setFlag(PROLOGUE_WAKE_DIALOGUE_PENDING_FLAG, true);
        GameManager.restoreCharacterAtHome('prologue-rescue');
        window.setTimeout(() => this.app?.navigateTo?.('lobby'), 80);
    }

    showInteractionHint(entry, overrideText = '') {
        if (!this.locationHint) return;
        this.locationHintTitle.textContent = this.worldMap.isLandmarkDiscovered(entry)
            ? entry.name
            : '未知地點';
        this.locationHintText.textContent = overrideText || '靠近後調查。';
        this.locationHint.classList.add('is-visible');
    }

    hideInteractionHint() {
        this.locationHint?.classList.remove('is-visible');
    }

    updateLocationUi(options = {}) {
        const tile = this.worldMap.getCurrentTile();
        const habitat = this.worldMap.getCurrentHabitat();
        if (this.regionTitle) this.regionTitle.textContent = tile?.title || '未知區域';
        if (this.regionSubtitle) this.regionSubtitle.textContent = tile?.subtitle || '';
        if (this.habitatName) this.habitatName.textContent = habitat?.name || '區域邊界';

        const interaction = this.worldMap.getNearbyInteraction();
        if (interaction) this.showInteractionHint(interaction);
        else this.hideInteractionHint();

        if (options.forceToast) this.showRegionToast(habitat);
    }

    showRegionToast(habitat) {
        if (!this.regionToast || !habitat) return;
        this.regionToastTitle.textContent = habitat.name;
        this.regionToastText.textContent = `當地遭遇將從「${habitat.name}」的怪物群落抽樣。`;
        this.regionToast.classList.add('is-visible');
        if (this.regionToastTimer) window.clearTimeout(this.regionToastTimer);
        this.regionToastTimer = window.setTimeout(() => {
            this.regionToast?.classList.remove('is-visible');
        }, 2200);
    }

    renderPlayerStats() {
        const character = GameManager.getCharacter();
        if (this.playerLevel) this.playerLevel.textContent = character?.level ?? 1;
        if (this.playerHp) this.playerHp.textContent = `${character?.hp ?? 0}/${character?.maxHp ?? 0}`;
        if (this.playerGold) this.playerGold.textContent = character?.gold ?? 0;
        const fatigue = GameManager.getAdventureFatigueStatus({ recover: true });
        if (this.playerFatigue) this.playerFatigue.textContent = `${fatigue.current}/${fatigue.max}`;
    }

    beginEncounter(sample, options = {}) {
        if (this.combat?.isActive()) return false;
        this.panels?.closeDrawers();
        const encounter = createLocationEncounter(sample, this.worldMap.getCurrentTile());
        if (!encounter) return false;
        if (options.storyBoss) encounter.storyBoss = options.storyBoss;
        if (options.storyContract) encounter.storyContract = options.storyContract;
        if (options.prologueTutorial) {
            encounter.context = { ...(encounter.context || {}), prologueTutorial: true };
            encounter.canFlee = false;
            encounter.defeatActionLabel = '失去意識';
            encounter.victoryActionLabel = '繼續前進';
            encounter.visual.name = '迷霧中的巨影';
            encounter.visual.className = '未知巨獸 · 異常個體';
            encounter.visual.level = '??';
            encounter.visual.maxHp = 1200;
            encounter.visual.background = 'src/assets/images/art/scenes/world/landmarks/south-road-broken.webp';
            encounter.visual.backgroundAlt = '黑根蔓延的南路斷坡';
            encounter.visual.visualScale = '1.08';
            encounter.visual.concealIdentity = true;
            encounter.visual.feed = '霧裡的巨角壓低了。牠沒有退路，也沒有理智。';
            encounter.visual.initialDelay = 2.2;
            encounter.visual.attacks = [
                {
                    id: 'prologue_stag_rake',
                    name: '裂土踏擊',
                    effect: 'crush',
                    damage: 14,
                    telegraph: 1.45,
                    impactDelay: 0.3,
                    recovery: 1.7,
                    breakThreshold: 180
                },
                {
                    id: 'prologue_stag_sweep',
                    name: '亂角橫掃',
                    effect: 'claw',
                    damage: 18,
                    telegraph: 1.65,
                    impactDelay: 0.28,
                    recovery: 1.8,
                    breakThreshold: 220
                },
                {
                    id: 'prologue_stag_charge',
                    name: '斷坡衝撞',
                    effect: 'crush',
                    damage: 999,
                    telegraph: 2.1,
                    impactDelay: 0.42,
                    recovery: 2,
                    breakThreshold: 999
                }
            ];
            encounter.player.hp = Math.min(encounter.player.maxHp, 72);
            encounter.player.potions = 1;
            encounter.player.potionHeal = 30;
            encounter.loadout.main = {
                ...encounter.loadout.main,
                id: 'prologue_hunter_blade',
                name: '公會制式獵刀',
                damage: 9,
                cooldown: 0.9,
                windup: 0.09,
                breakPower: 10,
                critDamage: 1.5,
                enabled: true,
                triggerBuff: null
            };
            encounter.loadout.offhand = {
                ...encounter.loadout.offhand,
                id: 'prologue_empty_offhand',
                name: '空手',
                enabled: false,
                triggerBuff: null
            };
            encounter.context.prologueIssuedGear = Object.freeze({
                weapon: '公會制式獵刀',
                armor: '公會外勤皮甲'
            });
            encounter.monster.exp = 0;
            encounter.monster.gold = 0;
            encounter.monster.drops = [];
            encounter.monster.equipmentDrops = [];
        }
        this.activeEncounter = encounter;
        return this.combat.start(encounter);
    }

    beginBossEncounter(entry, options = {}) {
        const monster = MonsterManager.getMonster(entry.bossId);
        if (!monster) return false;
        return this.beginEncounter({
            monsterId: entry.bossId,
            targetLevel: monster.level,
            habitat: this.worldMap.getCurrentHabitat()
        }, { storyBoss: entry, storyContract: options.storyContract || null });
    }

    handleDevAction(action) {
        const gate = OverworldMapConfig.routeGates[0];
        switch (action) {
            case 'goto-start':
                this.worldMap.teleportTo(6, 16);
                this.setDevStatus('已移動到第一區起點');
                break;
            case 'goto-gate':
                this.worldMap.teleportTo(46, 16);
                this.setDevStatus('已移動到腐根斷橋前');
                break;
            case 'goto-chapter-two':
                if (!this.worldMap.isGateOpen(gate)) this.worldMap.setGateOpen(gate.id, true);
                this.worldMap.teleportTo(53, 16);
                this.setDevStatus('已移動到第二區起點');
                break;
            case 'repair-gate':
                this.worldMap.discoverLandmark(gate);
                this.worldMap.setGateOpen(gate.id, true);
                this.openModal({
                    kicker: '道路已恢復',
                    title: gate.name,
                    text: gate.resolvedText,
                    image: this.images.get(`gate-repaired:${gate.id}`)
                });
                this.setDevStatus('腐根斷橋已修復，中央通路開放');
                break;
            case 'reset-gate':
                this.worldMap.setGateOpen(gate.id, false);
                this.worldMap.discoveredLandmarks.delete(gate.id);
                GameManager.setFlag(gate.discoveryFlag, false);
                this.worldMap.teleportTo(46, 16);
                this.worldMap.saveState();
                this.setDevStatus('腐根斷橋已重置');
                break;
            case 'reveal-all':
                this.worldMap.revealAll();
                this.setDevStatus(`迷霧已揭開：${this.worldMap.exploredCells.size} 格`);
                break;
            case 'reset-fog':
                this.worldMap.resetFog();
                this.setDevStatus(`迷霧已重置：${this.worldMap.exploredCells.size} 格可見`);
                break;
            case 'sample-monster':
                this.sampleMonsterForTest();
                break;
            case 'force-encounter': {
                const encounter = this.worldMap.rollEncounter(Math.random, { force: true });
                if (encounter) this.beginEncounter(encounter);
                break;
            }
            case 'toggle-reserves':
                this.showOvercapReserves = !this.showOvercapReserves;
                this.setDevStatus(this.showOvercapReserves ? '顯示目前已定位的預留點' : '隱藏預留點');
                break;
            default:
                return;
        }
        this.updateLocationUi();
        this.requestRender();
    }

    setDevStatus(text) {
        if (this.devSample) this.devSample.textContent = text;
    }

    async sampleMonsterForTest() {
        const result = this.worldMap.sampleCurrentMonster();
        if (!result) return;
        const monster = MonsterManager.getMonster(result.monsterId);
        const image = await loadImage(getGeneratedMonsterImage(result.monsterId));
        if (this.devSample) {
            this.devSample.textContent = `${result.habitat.name}：Lv.${result.targetLevel} ${monster?.name || result.monsterId}`;
        }
        this.openModal({
            kicker: '當地怪物抽樣',
            title: monster?.name || result.monsterId,
            text: `這次抽樣只使用「${result.habitat.name}」的怪物池，並依地點強度調整為 Lv.${result.targetLevel}。`,
            image
        });
    }

    renderBossReserveList() {
        if (!this.devBossList) return;
        this.devBossList.innerHTML = SecondRunOvercapBossReserves.map(entry => (
            `<li><b>第 ${entry.chapter} 章</b><span>${entry.workingName}</span><small>${entry.anchor}</small></li>`
        )).join('');
    }

    requestRender() {
        if (this.animationFrame) return;
        this.animationFrame = requestAnimationFrame(this.renderFrame);
    }

    renderFrame(time) {
        this.animationFrame = 0;
        this.renderMap(time);
    }

    renderMap(time) {
        const ctx = this.context;
        const canvas = this.canvas;
        if (!ctx || !canvas || !this.worldMap) return;

        const pixelRatio = clamp(window.devicePixelRatio || 1, 1, 2);
        const width = canvas.width / pixelRatio;
        const height = canvas.height / pixelRatio;
        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#070b0b';
        ctx.fillRect(0, 0, width, height);

        this.renderTiles(ctx);
        this.renderBlockedCells(ctx);
        this.renderFog(ctx);
        this.renderLandmarks(ctx, time);
        if (this.devMode && this.showOvercapReserves) this.renderReserveMarkers(ctx, time);
        this.renderPlayer(ctx, time);
    }

    renderTiles(ctx) {
        const cellSize = this.worldMap.gridSize;
        for (const tile of OverworldMapConfig.tiles) {
            const image = this.images.get(`tile:${tile.id}`);
            const x = tile.x * cellSize - this.worldMap.cameraOffsetX;
            const y = tile.y * cellSize - this.worldMap.cameraOffsetY;
            const width = tile.cols * cellSize;
            const height = tile.rows * cellSize;
            if (image) {
                ctx.drawImage(image, x, y, width, height);
            } else {
                ctx.fillStyle = tile.chapter === 1 ? '#293126' : '#2c302b';
                ctx.fillRect(x, y, width, height);
            }
        }
    }

    renderBlockedCells(ctx) {
        const cellSize = this.worldMap.gridSize;
        const bounds = this.worldMap.getVisibleCellBounds();
        ctx.lineWidth = 1;
        for (let y = bounds.startY; y <= bounds.endY; y += 1) {
            for (let x = bounds.startX; x <= bounds.endX; x += 1) {
                if (!this.worldMap.isCellBlocked(x, y)) continue;
                const drawX = x * cellSize - this.worldMap.cameraOffsetX;
                const drawY = y * cellSize - this.worldMap.cameraOffsetY;
                ctx.fillStyle = 'rgba(42, 45, 45, 0.62)';
                ctx.fillRect(drawX, drawY, cellSize, cellSize);
                ctx.strokeStyle = 'rgba(176, 185, 181, 0.2)';
                ctx.strokeRect(drawX + 0.5, drawY + 0.5, cellSize - 1, cellSize - 1);
            }
        }
    }

    renderFog(ctx) {
        const cellSize = this.worldMap.gridSize;
        const bounds = this.worldMap.getVisibleCellBounds();
        for (let y = bounds.startY; y <= bounds.endY; y += 1) {
            for (let x = bounds.startX; x <= bounds.endX; x += 1) {
                if (!this.worldMap.isInsideWorld(x, y) || this.worldMap.isCellExplored(x, y)) continue;
                const drawX = x * cellSize - this.worldMap.cameraOffsetX;
                const drawY = y * cellSize - this.worldMap.cameraOffsetY;
                ctx.fillStyle = 'rgba(3, 5, 6, 0.9)';
                ctx.fillRect(drawX, drawY, cellSize + 1, cellSize + 1);
            }
        }
    }

    renderLandmarks(ctx, time) {
        const entries = [
            ...(this.worldMap.getTownReturn() ? [this.worldMap.getTownReturn()] : []),
            ...this.worldMap.getActiveLandmarks(),
            ...this.worldMap.getVisibleRouteGates()
        ];
        for (const entry of entries) {
            if (!this.worldMap.isCellExplored(entry.x, entry.y)) continue;
            this.renderLandmarkMarker(ctx, entry, time);
        }
    }

    renderLandmarkMarker(ctx, entry, time) {
        const cellSize = this.worldMap.gridSize;
        const centerX = entry.x * cellSize + cellSize / 2 - this.worldMap.cameraOffsetX;
        const centerY = entry.y * cellSize + cellSize / 2 - this.worldMap.cameraOffsetY;
        const discovered = this.worldMap.isLandmarkDiscovered(entry);
        const size = discovered ? 48 : 38;
        const pulse = 1 + Math.sin(time / 320) * 0.04;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(pulse, pulse);
        ctx.shadowColor = discovered ? 'rgba(229, 195, 112, 0.65)' : 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = discovered ? 14 : 8;

        if (!discovered) {
            ctx.fillStyle = '#050606';
            ctx.fillRect(-size / 2, -size / 2, size, size);
            ctx.strokeStyle = '#9ca3a0';
            ctx.lineWidth = 2;
            ctx.strokeRect(-size / 2 + 1, -size / 2 + 1, size - 2, size - 2);
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#f3f4ef';
            ctx.font = '700 24px Georgia, serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('?', 0, 1);
        } else {
            const imageKey = entry.kind === 'route_gate'
                ? `gate-blocked:${entry.id}`
                : `landmark:${entry.id}`;
            const image = this.images.get(imageKey);
            ctx.beginPath();
            ctx.rect(-size / 2, -size / 2, size, size);
            ctx.clip();
            if (image) ctx.drawImage(image, -size / 2, -size / 2, size, size);
            else {
                ctx.fillStyle = '#433c2a';
                ctx.fillRect(-size / 2, -size / 2, size, size);
            }
            ctx.restore();
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.strokeStyle = '#e5c370';
            ctx.lineWidth = 2;
            ctx.strokeRect(-size / 2, -size / 2, size, size);
        }
        ctx.restore();
    }

    renderReserveMarkers(ctx, time) {
        const prototypePositions = [
            { chapter: 1, x: 8, y: 28 },
            { chapter: 2, x: 90, y: 5 }
        ];
        for (const position of prototypePositions) {
            const entry = SecondRunOvercapBossReserves.find(candidate => candidate.chapter === position.chapter);
            if (!entry) continue;
            const x = position.x * this.worldMap.gridSize + 16 - this.worldMap.cameraOffsetX;
            const y = position.y * this.worldMap.gridSize + 16 - this.worldMap.cameraOffsetY;
            const radius = 11 + Math.sin(time / 260) * 2;
            ctx.save();
            ctx.fillStyle = 'rgba(135, 29, 25, 0.9)';
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#f0b36a';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#fff5df';
            ctx.font = '700 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`EX${entry.chapter}`, x, y - 18);
            ctx.restore();
        }
    }

    renderPlayer(ctx, time) {
        const cellSize = this.worldMap.gridSize;
        const centerX = this.worldMap.playerPos.x * cellSize + cellSize / 2 - this.worldMap.cameraOffsetX;
        const centerY = this.worldMap.playerPos.y * cellSize + cellSize / 2 - this.worldMap.cameraOffsetY;
        const bob = Math.sin(time / 180) * 1.5;
        const facing = this.worldMap.playerFacing;

        ctx.save();
        ctx.translate(centerX, centerY + bob);
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#e7d18a';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#18201e';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#8f3f32';
        ctx.beginPath();
        ctx.moveTo(facing.x * 14, facing.y * 14);
        ctx.lineTo(-facing.y * 5, facing.x * 5);
        ctx.lineTo(facing.y * 5, -facing.x * 5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}
