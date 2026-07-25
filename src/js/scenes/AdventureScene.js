import GameManager from '../managers/GameManager.js';
import MonsterManager from '../managers/MonsterManager.js';
import CombatFlowController from '../managers/CombatFlowController.js';
import {
    createPrologueTutorialEncounter,
    createLocationEncounter,
    resolveEncounterDrop,
    settleEncounterVictory
} from '../managers/AdventureEncounterManager.js';
import AdventurePanelsController from '../components/AdventurePanelsController.js';
import { ensureCombatStage } from '../components/CombatStageView.js';
import WorldMap from '../utils/WorldMap.js';
import {
    OverworldMapConfig,
    SecondRunOvercapBossReserves
} from '../data/OverworldMapRegistry.js';
import { getGeneratedMonsterImage } from '../data/AssetManifest.js';
import { storySceneManager } from '../managers/StorySceneManager.js';
import { storyJournalManager } from '../managers/StoryJournalManager.js';
import storyDialogueController from '../managers/StoryDialogueController.js';
import { isDevModeEnabled } from '../utils/DevMode.js';
import { ItemUseAction, ItemUseContext } from '../data/UtilityItems.js';
import { showGlobalToast } from '../utils/UIFeedback.js';
import { chapterOneProgressionManager } from '../managers/ChapterOneProgressionManager.js';
import { storyGuidanceManager } from '../managers/StoryGuidanceManager.js';
import { questManager } from '../managers/QuestManager.js';
import { ObjectiveType, QuestStatus } from '../data/Quests.js';
import {
    getRegionSceneBindingsForTarget,
    getSceneRegionBinding,
    isOptionalStoryScene,
    RegionSceneTrigger
} from '../data/ChapterRegionRegistry.js';
import { navigationIntentManager } from '../managers/NavigationIntentManager.js';
import { GuildTutorialFlag } from '../data/GuildTutorial.js';

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
        const navigationState = this.app?.consumeNavigationState?.('adventure') || null;
        this.cacheDom();
        if (!this.canvas || !this.context) {
            throw new Error('Adventure map canvas is missing');
        }

        this.worldMap = new WorldMap(GameManager.getCharacter(), 1280, 720);
        this.container.querySelector('.adventure-scene')?.classList.toggle(
            'is-prologue-route',
            this.isPrologueInvestigationPending()
        );
        this.panels = new AdventurePanelsController(this.container, {
            onPlayerStateChange: () => this.renderPlayerStats(),
            onUseContextItem: stack => this.useContextItem(stack),
            getStoryHintContext: () => this.getStoryGuidanceContext()
        });
        ensureCombatStage(this.container);
        this.combat = new CombatFlowController(this.container, {
            scene: { type: 'overworld', id: this.worldMap.config.id },
            settleVictory: encounter => {
                if (encounter?.context?.prologueTutorial) return { exp: 0, gold: 0, drops: [] };
                return chapterOneProgressionManager.settleGuaranteedRewards(
                    encounter,
                    settleEncounterVictory(encounter)
                );
            },
            resolveDrop: (drop, decision) => resolveEncounterDrop(drop, decision),
            isSceneComplete: encounter => Boolean(encounter?.storyBoss),
            onBattleStateChange: (result) => {
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
                if (phase === 'victory' && completedEncounter?.context?.chapterOneInvestigationId) {
                    window.setTimeout(() => this.showChapterOneEvidence(
                        completedEncounter.context.chapterOneInvestigationId
                    ), 60);
                } else if (phase === 'victory' && completedEncounter?.context?.chapterOneRotrootTrialId) {
                    window.setTimeout(() => this.showRotrootTrialResult(
                        completedEncounter.context.chapterOneRotrootTrialId
                    ), 60);
                }
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
                this.returnToTown('battle-defeat');
            }
        });
        this.bindEvents();
        this.panels.init();
        this.handleResize();
        this.renderPlayerStats();
        this.renderBossReserveList();
        await this.loadMapAssets();
        this.updateLocationUi({ forceToast: true });
        this.requestRender();
        if (this.isMovementTutorialPending()) {
            this.showMovementTutorial();
            this.canvas?.focus();
        }
        if (this.devMode && navigationState?.devEncounterMonsterId) {
            window.setTimeout(() => {
                this.beginBossEncounter({
                    id: `dev-${navigationState.devEncounterMonsterId}`,
                    name: 'DEV 戰鬥驗證',
                    bossId: navigationState.devEncounterMonsterId
                });
            }, 80);
        } else if (!this.resumeResolvedPrologueIfNeeded()) {
            this.tryStartCurrentRegionStory();
        }
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
    }

    handleDevReturnToLobby() {
        if (!this.devMode) return;
        this.returnToTown('adventure-dev-return', { restore: true });
    }

    returnToTown(reason, _options = {}) {
        this.worldMap?.returnPlayerToEntry();
        GameManager.restoreCharacterAtHome(reason);
        navigationIntentManager.setTownArrivalReason(reason);
        chapterOneProgressionManager.queueFirstReportOnTownReturn({
            autoStart: reason === 'adventure-walk-return' || reason === 'adventure-wolf-smoke'
        });
        this.app?.navigateTo?.('lobby');
    }

    getStoryGuidanceContext() {
        return {
            discoveredLandmarkIds: [...(this.worldMap?.discoveredLandmarks || [])],
            ...chapterOneProgressionManager.getObjectiveContext(),
            playerLevel: Number(GameManager.getCharacter()?.level) || 1
        };
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

        const directions = {
            w: [0, -1],
            s: [0, 1],
            a: [-1, 0],
            d: [1, 0]
        };
        const direction = directions[event.key] || directions[event.key.toLowerCase()];
        if (this.isMovementTutorialPending() && !direction) {
            event.preventDefault();
            this.showMovementTutorial();
            return;
        }

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

        if (!direction) return;

        const now = performance.now();
        if (event.repeat && now - this.lastMoveAt < MOVE_REPEAT_MS) return;
        this.lastMoveAt = now;
        event.preventDefault();
        this.move(...direction);
    }

    move(dx, dy) {
        if (this.isPrologueInvestigationPending()) {
            const targetX = this.worldMap.playerPos.x + Math.sign(Number(dx) || 0);
            const targetY = this.worldMap.playerPos.y + Math.sign(Number(dy) || 0);
            const staysOnApproach = (OverworldMapConfig.prologueRouteBounds || []).some(bounds => (
                targetX >= bounds.x
                && targetY >= bounds.y
                && targetX < bounds.x + bounds.width
                && targetY < bounds.y + bounds.height
            ));
            if (!staysOnApproach) {
                this.showInteractionHint({ name: '濃霧封路' }, '霧裡看不清落腳處。先沿著還能辨認的南路前進。');
                this.requestRender();
                return;
            }
        }
        const result = this.worldMap.movePlayer(dx, dy);
        if (result.type === 'blocked' && result.chapterLocked) {
            this.showInteractionHint(
                { name: `第 ${result.requiredChapter} 章區域` },
                '目前的道路與事件尚未推進到這個區域。'
            );
            this.requestRender();
            return;
        }
        if (result.type === 'blocked' && result.gate) {
            this.showInteractionHint(result.gate, '前方道路中斷，靠近後調查。');
            this.requestRender();
            return;
        }
        if (result.type !== 'moved') return;

        if (this.isMovementTutorialPending()) {
            GameManager.setFlag(GuildTutorialFlag.OVERWORLD_MOVEMENT_LEARNED, true, {
                reason: 'prologue-overworld-first-move'
            });
        }
        if (result.enteredHabitat) this.showRegionToast(result.habitat);
        this.updateLocationUi();
        this.renderPlayerStats();
        this.requestRender();

        if (this.tryStartMovementStory(result)) return;
        if (!result.interaction && !this.isPrologueInvestigationPending()) {
            const encounter = this.worldMap.rollEncounter();
            if (encounter) this.beginEncounter(encounter);
        }
    }

    tryStartCurrentRegionStory() {
        const nextSceneId = storySceneManager.getNextAvailableSceneId();
        const binding = getSceneRegionBinding(nextSceneId);
        const chapter = Number(this.worldMap?.getCurrentTile()?.chapter) || null;
        if (!binding
            || binding.chapter !== chapter
            || binding.trigger !== RegionSceneTrigger.REGION_ENTRY) return false;
        return this.startMapStoryScene(nextSceneId);
    }

    tryStartMovementStory(result) {
        const nextSceneId = storySceneManager.getNextAvailableSceneId();
        const binding = getSceneRegionBinding(nextSceneId);
        if (!binding || binding.chapter !== Number(result?.tile?.chapter)) return false;

        let shouldStart = false;
        if (binding.trigger === RegionSceneTrigger.REGION_ENTRY) {
            shouldStart = Boolean(result.enteredChapter);
        } else if (binding.trigger === RegionSceneTrigger.SEGMENT_ENTER
            || binding.trigger === RegionSceneTrigger.RETURN_ROUTE) {
            shouldStart = (result.segmentIds || []).includes(binding.targetId);
        } else if (binding.trigger === RegionSceneTrigger.LOCATION_ENTER) {
            shouldStart = (result.arrivedInteractionIds || []).includes(binding.targetId);
        }
        if (!shouldStart) return false;
        const storyEntry = (result.arrivedInteractionIds || []).includes(binding.targetId)
            ? result.interaction
            : null;
        return this.startMapStoryScene(nextSceneId, {
            entry: storyEntry
        });
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

        questManager.updateProgress(ObjectiveType.EXPLORE, entry.id, 1);

        if (entry.dungeonId) {
            this.openDungeonEntrance(entry);
            return;
        }

        if (this.tryHandleChapterOneProgression(entry)) return;

        const pendingEncounter = storySceneManager.getPendingEncounter();
        const pendingEncounterMatchesEntry = pendingEncounter?.locationId === entry.id
            || (entry.bossId && pendingEncounter?.monsterId === entry.bossId);
        if (pendingEncounterMatchesEntry) {
            this.showBossWarning(entry, pendingEncounter);
            return;
        }
        const firstDiscovery = this.worldMap.discoverLandmark(entry);
        this.panels?.renderStoryGuidance();
        storyJournalManager.recordLocationDiscoveries(entry.id, {
            chapter: this.worldMap.getCurrentTile()?.chapter,
            firstDiscovery
        });

        if (entry.kind === 'route_gate') {
            this.openModal({
                kicker: firstDiscovery ? '道路障礙已發現' : '道路仍然中斷',
                title: entry.name,
                text: firstDiscovery ? entry.blockedText : entry.repeatText,
                image: this.images.get(`gate-blocked:${entry.id}`)
            });
        } else if (!this.tryStartLandmarkStory(entry)) {
            const authoredStoryBoss = Boolean(entry.bossId
                && entry.sceneIds?.some(sceneId => !storySceneManager.isSceneComplete(sceneId)));
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

    openDungeonEntrance(entry) {
        const questState = questManager.getQuestState('vein_beneath_the_roots');
        const questReady = [QuestStatus.ACTIVE, QuestStatus.COMPLETED, QuestStatus.FINISHED]
            .includes(questState.status);
        const firstDiscovery = this.worldMap.discoverLandmark(entry);
        storyJournalManager.recordLocationDiscoveries(entry.id, {
            chapter: this.worldMap.getCurrentTile()?.chapter,
            firstDiscovery
        });

        this.openModal({
            kicker: '副本入口',
            title: entry.name,
            text: questReady
                ? (firstDiscovery ? entry.firstText : entry.repeatText)
                : '岩縫下方傳來空洞回音，但手札還沒有足夠資訊判斷入口是否穩定。先回檔案室整理腐根溪谷的紀錄。',
            image: this.images.get(`landmark:${entry.id}`),
            actionLabel: questReady ? '進入幽暗洞窟' : '收起手札',
            onConfirm: questReady ? () => {
                this.closeModal();
                this.app?.enterDungeon?.(entry.dungeonId);
                return false;
            } : null
        });
        this.panels?.renderStoryGuidance();
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

    isPrologueInvestigationPending() {
        return !storySceneManager.isPrologueTutorialResolved()
            && !storySceneManager.isSceneComplete('ch1_s01_road_collapse');
    }

    resumeResolvedPrologueIfNeeded() {
        if (storySceneManager.isPrologueTutorialResolved()
            && !storySceneManager.isSceneComplete('ch1_s01_road_collapse')) {
            this.showPrologueRescueStory();
            return true;
        }
        return false;
    }

    tryStartLandmarkStory(entry) {
        const nextSceneId = storySceneManager.getNextAvailableSceneId();
        const nextBinding = getSceneRegionBinding(nextSceneId);
        let sceneId = nextBinding?.targetId === entry.id ? nextSceneId : null;

        if (!sceneId) {
            const optionalBinding = getRegionSceneBindingsForTarget(
                entry.id,
                Number(this.worldMap?.getCurrentChapter?.()) || null
            ).find(binding => (
                isOptionalStoryScene(binding.sceneId)
                && !storySceneManager.isSceneComplete(binding.sceneId)
                && storySceneManager.canStartScene(binding.sceneId).success
            ));
            sceneId = optionalBinding?.sceneId || null;
        }
        if (!sceneId || storySceneManager.isSceneComplete(sceneId)) return false;

        if (sceneId === 'ch1_s01_road_collapse' && this.isPrologueInvestigationPending()) {
            const opening = storySceneManager.startScene(sceneId, { force: true });
            if (!opening?.success) return false;
            return this.showStoryPresentation({
                ...opening,
                lines: opening.lines.filter(line => line.presentationPhase === 'pre_battle')
            }, { entry, completionAction: 'prologue_combat' });
        }

        if (isOptionalStoryScene(sceneId)) {
            const gate = storySceneManager.canStartScene(sceneId);
            if (!gate.success) return false;
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

    playDevStoryScene(sceneId) {
        if (!this.devMode || sceneId !== 'ch1_s01_road_collapse') {
            return this.startMapStoryScene(sceneId, { force: true });
        }
        const opening = storySceneManager.startScene(sceneId, { force: true });
        if (!opening?.success) return opening;
        const started = this.showStoryPresentation({
            ...opening,
            lines: opening.lines.filter(line => line.presentationPhase === 'pre_battle')
        }, { completionAction: 'prologue_combat' });
        return started ? opening : { success: false, reason: 'empty_presentation' };
    }

    showStoryPresentation(outcome, options = {}) {
        const lines = (outcome.lines || []).filter(line => line?.text);
        if (!lines.length) return false;
        const presentationPhases = new Set(
            lines.map(line => line.presentationPhase).filter(Boolean)
        );
        const timeline = (outcome.timeline || lines).filter(entry => (
            presentationPhases.size === 0
            || !entry.presentationPhase
            || presentationPhases.has(entry.presentationPhase)
        ));
        const story = {
            sceneId: outcome.sceneId,
            scene: outcome.scene,
            checkpointId: outcome.checkpointId || null,
            encounter: outcome.encounter,
            lines,
            entry: options.entry || this.worldMap.getNearbyInteraction() || null,
            completionAction: options.completionAction || 'complete_scene'
        };
        const image = story.entry?.id ? this.images.get(`landmark:${story.entry.id}`) : null;
        storyDialogueController.play({ ...outcome, lines, timeline }, {
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

        if (story.completionAction === 'chapter_one_evidence') {
            this.completeChapterOneEvidence(story.checkpointId, story.entry);
            return;
        }

        const completion = storySceneManager.completeScene(story.sceneId);
        if (completion?.blueprintUnlocks?.length) {
            const seriesNames = completion.blueprintUnlocks
                .map(unlock => unlock.series?.name)
                .filter(Boolean)
                .join('、');
            showGlobalToast(
                '工藝系列解鎖',
                `${seriesNames}的五種武器已加入鍛造清單。`,
                'success'
            );
        }
        this.panels?.renderStoryGuidance();
        const entry = story.entry;
        if (story.completionAction === 'prologue_rescue') {
            this.finishPrologueTransition();
            return;
        }
        if (completion?.transition === 'encounter_required') {
            if (entry) this.showBossWarning(entry, completion.encounter);
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
            habitat
        }, { prologueTutorial: true });
    }

    resolvePrologueTutorial(outcome = 'defeat') {
        const result = storySceneManager.resolvePrologueTutorial(outcome);
        if (!result.success) return;
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
        storySceneManager.completePrologueRescue();
        questManager.updateProgress(ObjectiveType.EVENT, 'prologue_investigation_report', 1);
        window.setTimeout(() => this.app?.navigateTo?.('lobby'), 80);
    }

    isMovementTutorialPending() {
        return this.isPrologueInvestigationPending()
            && GameManager.getFlag(GuildTutorialFlag.COMPLETE)
            && !GameManager.getFlag(GuildTutorialFlag.OVERWORLD_MOVEMENT_LEARNED);
    }

    showMovementTutorial() {
        this.showInteractionHint(
            { name: '沿南路前進' },
            '使用 W、A、S、D 移動。先沿著仍看得清的路往前走。',
            'WASD'
        );
    }

    showInteractionHint(entry, overrideText = '', keyLabel = 'F') {
        if (!this.locationHint) return;
        this.locationHint.classList.toggle('is-movement-tutorial', keyLabel !== 'F');
        const key = this.locationHint.querySelector('.map-location-key');
        if (key) {
            key.textContent = keyLabel;
            key.classList.toggle('is-wide', keyLabel.length > 1);
        }
        this.locationHintTitle.textContent = this.worldMap.isLandmarkDiscovered(entry)
            ? entry.name
            : '未知地點';
        if (keyLabel !== 'F') this.locationHintTitle.textContent = entry?.name || '移動';
        const defaultText = entry?.kind === 'town_return'
            ? '按 F 返回城鎮。'
            : '按 F 調查。';
        this.locationHintText.textContent = overrideText || defaultText;
        this.locationHint.classList.add('is-visible');
    }

    hideInteractionHint() {
        this.locationHint?.classList.remove('is-visible', 'is-movement-tutorial');
    }

    updateLocationUi(options = {}) {
        const tile = this.worldMap.getCurrentTile();
        const habitat = this.worldMap.getCurrentHabitat();
        if (this.regionTitle) this.regionTitle.textContent = tile?.title || '未知區域';
        if (this.regionSubtitle) this.regionSubtitle.textContent = tile?.subtitle || '';
        if (this.habitatName) this.habitatName.textContent = habitat?.name || '區域邊界';

        const interaction = this.worldMap.getNearbyInteraction();
        if (this.isMovementTutorialPending()) this.showMovementTutorial();
        else if (interaction) this.showInteractionHint(interaction);
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
    }

    beginEncounter(sample, options = {}) {
        if (this.combat?.isActive()) return false;
        this.panels?.closeDrawers();
        const encounter = options.prologueTutorial
            ? createPrologueTutorialEncounter(sample?.habitat, this.worldMap.getCurrentTile())
            : createLocationEncounter(sample, this.worldMap.getCurrentTile());
        if (!encounter) return false;
        if (options.storyBoss) encounter.storyBoss = options.storyBoss;
        if (options.storyContract) encounter.storyContract = options.storyContract;
        if (options.context) {
            encounter.context = { ...(encounter.context || {}), ...options.context };
        }
        this.activeEncounter = encounter;
        return this.combat.start(encounter);
    }

    beginBossEncounter(entry, options = {}) {
        const monsterId = options.storyContract?.monsterId || entry.bossId;
        const monster = MonsterManager.getMonster(monsterId);
        if (!monster) return false;
        return this.beginEncounter({
            monsterId,
            habitat: this.worldMap.getCurrentHabitat()
        }, { storyBoss: entry, storyContract: options.storyContract || null });
    }

    showBossWarning(entry, encounterContract) {
        const monsterId = encounterContract?.monsterId || entry?.bossId;
        const monster = MonsterManager.getMonster(monsterId);
        if (!entry || !monster || !encounterContract) return false;
        const isMantisTest = monsterId === 'ambush_mantis';
        const isBossEncounter = entry.bossId === monsterId;
        this.openModal({
            kicker: isBossEncounter ? '強敵警告' : '遭遇',
            title: `等級 ${monster.level} ${monster.name}`,
            text: isMantisTest
                ? '路標背對城鎮，銀線也封住了原路。伏獵者已經記住你走過的順序；現在踏進去，牠就會收緊陷阱。'
                : isBossEncounter
                    ? '前方已經進入首領的攻擊範圍。現在可以迎戰，也可以關閉畫面返回村落，恢復生命並整理裝備後再來。'
                    : '前方的敵人封住了去路。可以立即迎戰，也可以先退開整理裝備。',
            image: this.images.get(`landmark:${entry.id}`),
            actionLabel: isBossEncounter ? '做好準備，進入戰鬥' : '迎戰',
            onConfirm: () => {
                const started = storySceneManager.beginEncounter(encounterContract.id);
                if (!started?.success) return false;
                this.closeModal();
                this.beginBossEncounter(entry, { storyContract: started.encounter });
                return false;
            }
        });
        return true;
    }

    tryHandleChapterOneProgression(entry) {
        const action = chapterOneProgressionManager.getLandmarkAction(entry?.id);
        if (!action) return false;

        if (action.type === 'investigation-blocked-previous') {
            const previousLandmark = OverworldMapConfig.landmarks.find(item => item.id === action.previous.id);
            this.openModal({
                kicker: '手札缺頁',
                title: entry.name,
                text: `手札裡關於「${previousLandmark?.name || '前一處痕跡'}」的紀錄仍是空白。缺少那段方向，眼前的痕跡還無法判讀。`,
                image: this.images.get(`landmark:${entry.id}`),
                actionLabel: '收起手札'
            });
            return true;
        }

        if (action.type === 'investigation-return-home') {
            this.openModal({
                kicker: '先返城',
                title: '把第一份證據帶回南門',
                text: '先回去。城裡需要確認你帶回了什麼。',
                image: this.images.get(`landmark:${entry.id}`),
                actionLabel: '返回地圖'
            });
            return true;
        }

        if (action.type === 'investigation-evidence') {
            this.showChapterOneEvidence(action.investigation.id, entry);
            return true;
        }
        if (action.type === 'investigation-recorded') return true;

        if (action.type === 'investigation-encounter') {
            const investigation = action.investigation;
            this.openModal({
                kicker: '調查方式',
                title: investigation.methodTitle,
                text: investigation.methodText,
                image: this.images.get(`landmark:${entry.id}`),
                actionLabel: '按這個方法開始調查',
                onConfirm: () => {
                    this.closeModal();
                    this.beginEncounter({
                        monsterId: investigation.monsterId,
                        habitat: this.worldMap.getCurrentHabitat()
                    }, { context: { chapterOneInvestigationId: investigation.id } });
                    return false;
                }
            });
            return true;
        }

        if (action.type === 'rotroot-needs-gear') {
            this.openModal({
                kicker: '黑根深處',
                title: '麻意越過了舊護具',
                text: action.ownedGear
                    ? '鐵匠整理好的武器還收在行囊裡。越往前，黑根的麻意越重；先把真正要依靠的東西拿在手上。'
                    : '手裡的舊裝備已經被黑根汁蝕出裂痕。鐵匠說過，深入林子以前先回冷爐找他。',
                image: this.images.get(`landmark:${entry.id}`),
                actionLabel: '返回準備'
            });
            return true;
        }

        if (action.type === 'rotroot-trial') {
            this.openRotrootTrial(action.trial);
            return true;
        }

        if (action.type === 'rotroot-story') {
            this.startMapStoryScene(action.sceneId, { entry });
            return true;
        }

        return false;
    }

    showChapterOneEvidence(investigationId, entry = null) {
        const investigation = chapterOneProgressionManager.getInvestigation(investigationId);
        if (!investigation || chapterOneProgressionManager.isInvestigationEvidenceRecorded(investigationId)) return false;
        const target = entry || OverworldMapConfig.landmarks.find(item => item.id === investigationId);
        const presentation = storySceneManager.buildCheckpointPresentation(
            'ch1_s06_three_landmarks',
            investigationId
        );
        if (!presentation) return false;
        return this.showStoryPresentation(presentation, {
            entry: target,
            completionAction: 'chapter_one_evidence'
        });
    }

    completeChapterOneEvidence(investigationId, entry = null) {
        const investigation = chapterOneProgressionManager.getInvestigation(investigationId);
        if (!investigation) return;
        const target = entry || OverworldMapConfig.landmarks.find(item => item.id === investigationId);
        if (target) {
            const firstDiscovery = this.worldMap.discoverLandmark(target);
            storyJournalManager.recordLocationDiscoveries(target.id, {
                chapter: 1,
                firstDiscovery
            });
        }
        const progression = chapterOneProgressionManager.completeEvidence(investigationId);
        this.panels?.renderStoryGuidance();
        this.updateLocationUi();
        this.requestRender();

        if (progression.complete
            && storySceneManager.getNextAvailableSceneId() === 'ch1_s06_three_landmarks') {
            window.setTimeout(() => this.startMapStoryScene('ch1_s06_three_landmarks'), 60);
        }
    }

    showRotrootTrialResult(trialId) {
        const progression = chapterOneProgressionManager.completeRotrootTrial(trialId);
        if (!progression.success) return;
        const { next } = progression;
        this.panels?.renderStoryGuidance();
        this.openModal({
            kicker: '根脈仍在前方',
            title: next ? '蛛網後面還有石殼' : '石殼下面沒有巢穴',
            text: next
                ? '蛛網被割開後，武器刃口沒有再被黑根汁咬出缺口。網上的獸毛全朝林外，根脈則穿過石層繼續向北。'
                : '石殼散開後，底下只有被向上頂裂的岩層。黑根沒有在這裡停下，仍一下一下朝北收縮；真正承受壓力的地方還在前面。',
            image: this.images.get('landmark:rotroot_ravine'),
            actionLabel: next ? '繼續沿根脈前進' : '整理根脈證據',
            onConfirm: () => {
                this.closeModal();
                if (next) this.openRotrootTrial(next);
                else this.startMapStoryScene('ch1_s09_rotroot_approach', {
                    entry: OverworldMapConfig.landmarks.find(item => item.id === 'rotroot_ravine')
                });
                return false;
            }
        });
    }

    openRotrootTrial(trial) {
        if (!trial) return false;
        this.openModal({
            kicker: '沿根脈深入',
            title: trial.title,
            text: trial.text,
            image: this.images.get('landmark:rotroot_ravine'),
            actionLabel: '繼續深入',
            onConfirm: () => {
                this.closeModal();
                this.beginEncounter({
                    monsterId: trial.monsterId,
                    habitat: this.worldMap.getCurrentHabitat()
                }, { context: { chapterOneRotrootTrialId: trial.id } });
                return false;
            }
        });
        return true;
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
                this.worldMap.teleportTo(53, 16, { ignoreChapterLock: true });
                this.setDevStatus('已移動到第二區起點');
                break;
            case 'goto-chapter-three':
                this.worldMap.teleportTo(99, 18, { ignoreChapterLock: true });
                this.setDevStatus('已移動到第三區起點');
                break;
            case 'goto-chapter-four':
                this.worldMap.teleportTo(147, 18, { ignoreChapterLock: true });
                this.setDevStatus('已移動到第四區起點');
                break;
            case 'goto-chapter-five':
                this.worldMap.teleportTo(195, 18, { ignoreChapterLock: true });
                this.setDevStatus('已移動到第五區起點');
                break;
            case 'goto-chapter-six':
                this.worldMap.teleportTo(243, 18, { ignoreChapterLock: true });
                this.setDevStatus('已移動到第六區起點');
                break;
            case 'goto-chapter-seven':
                this.worldMap.teleportTo(291, 18, { ignoreChapterLock: true });
                this.setDevStatus('已移動到第七區起點');
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
                this.worldMap.resetGate(gate.id);
                this.worldMap.teleportTo(46, 16);
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
            this.devSample.textContent = `${result.habitat.name}：Lv.${monster?.level ?? '?'} ${monster?.name || result.monsterId}`;
        }
        this.openModal({
            kicker: '當地怪物抽樣',
            title: monster?.name || result.monsterId,
            text: `這次抽樣只使用「${result.habitat.name}」的怪物池；${monster?.name || result.monsterId}固定為 Lv.${monster?.level ?? '?'}。`,
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
            const isPendingPrologueTarget = this.isPrologueInvestigationPending()
                && entry.id === 'prologue_impact_site';
            if (!isPendingPrologueTarget && !this.worldMap.isCellExplored(entry.x, entry.y)) continue;
            this.renderLandmarkMarker(ctx, entry, time);
        }
    }

    renderLandmarkMarker(ctx, entry, time) {
        const cellSize = this.worldMap.gridSize;
        const centerX = entry.x * cellSize + cellSize / 2 - this.worldMap.cameraOffsetX;
        const centerY = entry.y * cellSize + cellSize / 2 - this.worldMap.cameraOffsetY;
        const discovered = this.worldMap.isLandmarkDiscovered(entry);
        const size = discovered ? 48 : 38;
        const hasNewInformation = storyGuidanceManager.isAdventureTarget(
            entry.id,
            this.getStoryGuidanceContext()
        );

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 8;

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
        if (hasNewInformation) this.renderNewInformationMarker(ctx, centerX, centerY, size, time);
    }

    renderNewInformationMarker(ctx, centerX, centerY, landmarkSize, time) {
        const pulse = 1 + Math.sin(time / 360) * 0.06;
        const badgeX = centerX + landmarkSize / 2 - 2;
        const badgeY = centerY - landmarkSize / 2 + 2;
        ctx.save();
        ctx.translate(badgeX, badgeY);
        ctx.scale(pulse, pulse);
        ctx.fillStyle = '#d8b45f';
        ctx.strokeStyle = '#17140d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#17140d';
        ctx.font = '800 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', 0, 1);
        ctx.restore();
    }

    renderReserveMarkers(ctx, time) {
        const prototypePositions = [
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
