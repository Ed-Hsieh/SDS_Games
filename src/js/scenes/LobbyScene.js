/**
 * LobbyScene.js
 * Logic for the Lobby scene (Hall).
 */
import GameManager from '../managers/GameManager.js';
import { buildItemModalOptions, escapeHtml, getItemVisualHtml } from '../utils/ItemDisplay.js';
import { attachItemTooltip, detachItemTooltip } from '../utils/ItemTooltip.js';
import { buildEquippedSetSummaryHtml } from '../utils/SetDisplay.js';
import { confirmAction, showGlobalToast } from '../utils/UIFeedback.js';
import audioManager from '../utils/AudioManager.js';
import { worldInteractionManager } from '../managers/WorldInteractionManager.js';
import { dialogueManager } from '../managers/DialogueManager.js';
import { storySceneManager } from '../managers/StorySceneManager.js';
import { questManager } from '../managers/QuestManager.js';
import { getTownNPC } from '../data/NPCDialogues.js';
import { getStoryActor, getStoryExpressionLayer } from '../data/StoryActors.js';
import { getTownPlaceDisplay } from '../data/TownPlaces.js';
import { getGeneratedMapPropImage } from '../data/AssetManifest.js';
import {
    getResolvedTownPlace,
    getResolvedTownPlaces,
    getTownOverviewPresentation
} from '../managers/TownStateResolver.js';
import storyDialogueController from '../managers/StoryDialogueController.js';
import { storyGuidanceManager } from '../managers/StoryGuidanceManager.js';
import { resetSavedOverworldPlayerToEntry } from '../utils/WorldMap.js';
import { chapterOneProgressionManager } from '../managers/ChapterOneProgressionManager.js';
import { navigationIntentManager } from '../managers/NavigationIntentManager.js';
import itemDetailModal from '../components/ItemDetailModal.js';
import { getQuestStory } from '../data/QuestStories.js';
import { GuildTutorialFlag } from '../data/GuildTutorial.js';

const AchievementPlaceholders = [
    { id: 'first-commission', icon: '🏅', title: '第一份委託', text: '完成第一份城鎮委託。', unlocked: false },
    { id: 'slime-notes', icon: '🥉', title: '黏液筆記', text: '把史萊姆異常記入手札。', unlocked: false },
    { id: 'craftsman-path', icon: '🔨', title: '鍛造起步', text: '打造第一件可用裝備。', unlocked: false },
    { id: 'boss-trace', icon: '🏆', title: '首領痕跡', text: '追蹤並擊敗第一個首領。', unlocked: false },
    { id: 'set-awakening', icon: '🎖️', title: '套裝啟動', text: '穿戴並啟用第一個套裝效果。', unlocked: false },
    { id: 'living-index', icon: '🏵️', title: '活人索引', text: '讓書記完成最後索引。', unlocked: false }
];

export default class LobbyScene {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.updateUI = this.updateUI.bind(this);
        this.handleWorldInteraction = this.handleWorldInteraction.bind(this);
        this.handleWorldRoute = this.handleWorldRoute.bind(this);
        this.handleTownStageClick = this.handleTownStageClick.bind(this);
        this.handleTownNpc = this.handleTownNpc.bind(this);
        this.handleQuestEvent = this.handleQuestEvent.bind(this);
        this.openAchievementModal = this.openAchievementModal.bind(this);
        this.closeAchievementModal = this.closeAchievementModal.bind(this);
        this.handleSaveExport = this.handleSaveExport.bind(this);
        this.handleSaveImport = this.handleSaveImport.bind(this);
        this.handleSaveFileSelected = this.handleSaveFileSelected.bind(this);
        this.handleSaveReset = this.handleSaveReset.bind(this);
        this.handlePassiveEffectKeydown = this.handlePassiveEffectKeydown.bind(this);
        this.handlePrepTabClick = this.handlePrepTabClick.bind(this);
        this.closePrepModal = this.closePrepModal.bind(this);
        
        // Warehouse filter state
        this.currentWarehouseFilter = 'all';
        this.currentWarehouseSort = 'time-desc';
        
        this.selectedPassiveSlot = 0;
        this.activeTownPlaceId = null;
        this.narrativeLines = [];
        this.renderedNarrativeCount = 0;
        this.prepTutorialProvider = null;
        this.townArrivalReason = null;
    }

    init() {
        try {
            this.cacheDOM();
            this.bindEvents();
            
            // Subscribe to GameManager updates
            GameManager.subscribe(this.updateUI);
            questManager.subscribe(this.handleQuestEvent);

            this.townArrivalReason = navigationIntentManager.getTownArrivalReason();
            this.restoreTownPlaceReturn();
            this.initializeTownNarrative();
            // Force initial UI update with current state
            this.updateUI(null, 'all');
            this.openInitialStoryFlow();
        } catch (error) {
            console.error('Error initializing Lobby Scene:', error);
        }
    }

    cacheDOM() {
        this.dom = {
            townNarrative: this.container.querySelector('#town-narrative'),
            townNarrativeTitle: this.container.querySelector('#town-narrative-title'),
            townDialogueStream: this.container.querySelector('#town-dialogue-stream'),
            worldStage: this.container.querySelector('#world-stage'),
            worldStageBackdrop: this.container.querySelector('.world-stage-backdrop'),
            worldStoryLog: this.container.querySelector('#world-story-log'),
            townPlaceMap: this.container.querySelector('#town-place-map'),
            townPlaceView: this.container.querySelector('#town-place-view'),
            townPlaceIcon: this.container.querySelector('#town-place-icon'),
            townPlaceTag: this.container.querySelector('#town-place-tag'),
            townPlaceName: this.container.querySelector('#town-place-name'),
            townPlaceDescription: this.container.querySelector('#town-place-description'),
            townPlaceResidents: this.container.querySelector('#town-place-residents'),
            townPlaceActions: this.container.querySelector('#town-place-actions'),
            townPlaceResidentCount: this.container.querySelector('#town-place-resident-count'),
            townPlaceActionCount: this.container.querySelector('#town-place-action-count'),
            achievementModal: this.container.querySelector('#achievement-modal'),
            achievementClose: this.container.querySelector('#achievement-close'),
            achievementList: this.container.querySelector('#achievement-list'),
            saveExport: this.container.querySelector('#btn-save-export'),
            saveImport: this.container.querySelector('#btn-save-import'),
            saveReset: this.container.querySelector('#btn-save-reset'),
            saveFileInput: this.container.querySelector('#save-file-input'),
            prepAudioSettings: this.container.querySelector('#btn-prep-audio-settings'),
            prepSystemBack: this.container.querySelector('#btn-prep-system-back'),
            prepSystemLayers: this.container.querySelectorAll('[data-system-layer]'),
            prepSfxVolume: this.container.querySelector('#prep-sfx-volume'),
            prepSfxValue: this.container.querySelector('#prep-sfx-value'),
            prepSfxOutput: this.container.querySelector('#prep-sfx-output'),
            prepMusicVolume: this.container.querySelector('#prep-music-volume'),
            prepMusicValue: this.container.querySelector('#prep-music-value'),
            prepMusicOutput: this.container.querySelector('#prep-music-output'),
            prepMusicEnabled: this.container.querySelector('#prep-music-enabled'),
            prepMusicState: this.container.querySelector('#prep-music-state'),
            prepSfxPreview: this.container.querySelector('#btn-prep-sfx-preview'),
            prepMusicPreview: this.container.querySelector('#btn-prep-music-preview'),
            prepModal: this.container.querySelector('#lobby-prep-modal'),
            prepDialog: this.container.querySelector('.lobby-prep-dialog'),
            prepClose: this.container.querySelector('#lobby-prep-close'),
            prepTitle: this.container.querySelector('#lobby-prep-title'),
            
            // Character info
            characterLevel: this.container.querySelector('#character-level'),
            characterGold: this.container.querySelector('#character-gold'),
            characterAtk: this.container.querySelector('#character-atk'),
            characterDef: this.container.querySelector('#character-def'),
            hpBar: this.container.querySelector('#hp-bar'),
            hpText: this.container.querySelector('#hp-text'),
            expBar: this.container.querySelector('#exp-bar'),
            expText: this.container.querySelector('#exp-text'),
            // Inventory and warehouse
            warehouseList: this.container.querySelector('#warehouse-list'),
            warehouseCount: this.container.querySelector('#warehouse-count'),
            inventoryList: this.container.querySelector('#inventory-list'),
            lobbyInventoryPane: this.container.querySelector('#lobby-field-pack-pane'),
            inventoryUsed: this.container.querySelector('#inventory-used'),
            inventoryMax: this.container.querySelector('#inventory-max'),
            storeMaterials: this.container.querySelector('#btn-store-materials'),
            
            // Equipment slots
            slotWeapon: this.container.querySelector('#slot-weapon'),
            slotArmor: this.container.querySelector('#slot-armor'),
            slotAccessory: this.container.querySelector('#slot-accessory'),
            // Active set bonuses display
            activeSetBonuses: this.container.querySelector('#active-set-bonuses'),
            passiveEffectSlots: this.container.querySelector('#passive-effect-slots'),
            passiveEffectLibrary: this.container.querySelector('#passive-effect-library'),
            passiveEffectModal: this.container.querySelector('#passive-effect-modal'),
            passiveEffectClose: this.container.querySelector('#passive-effect-close'),
            
            // Modal is provided by centralized ItemDetailModal component
        };
    }

    bindEvents() {
        this.container.querySelectorAll('[data-interaction-id]').forEach(hotspot => {
            hotspot.addEventListener('click', this.handleWorldInteraction);
        });

        this.container.querySelectorAll('[data-route]').forEach(route => {
            route.addEventListener('click', this.handleWorldRoute);
        });

        this.container.querySelectorAll('[data-npc-id]').forEach(npc => {
            npc.addEventListener('click', this.handleTownNpc);
        });

        this.dom.worldStage?.addEventListener('click', this.handleTownStageClick);

        this.dom.achievementClose?.addEventListener('click', this.closeAchievementModal);
        this.dom.achievementModal?.addEventListener('click', event => {
            if (event.target === this.dom.achievementModal) this.closeAchievementModal();
        });

        this.dom.saveExport?.addEventListener('click', this.handleSaveExport);
        this.dom.saveImport?.addEventListener('click', this.handleSaveImport);
        this.dom.saveReset?.addEventListener('click', this.handleSaveReset);
        this.dom.saveFileInput?.addEventListener('change', this.handleSaveFileSelected);
        this.dom.prepAudioSettings?.addEventListener('click', () => {
            audioManager.unlock?.();
            this.showPrepSystemLayer('audio');
            this.syncPrepAudioControls();
        });
        this.dom.prepSystemBack?.addEventListener('click', () => {
            this.showPrepSystemLayer('main');
            this.syncPrepAudioControls();
        });
        this.dom.prepSfxVolume?.addEventListener('input', event => {
            audioManager.setSfxVolume(event.target.value);
            this.syncPrepAudioControls();
        });
        this.dom.prepMusicVolume?.addEventListener('input', event => {
            audioManager.setMusicVolume(event.target.value);
            this.syncPrepAudioControls();
        });
        this.dom.prepMusicEnabled?.addEventListener('change', event => {
            audioManager.unlock?.();
            audioManager.setMusicEnabled(event.target.checked);
            this.syncPrepAudioControls();
        });
        this.dom.prepSfxPreview?.addEventListener('click', () => {
            audioManager.unlock?.();
            audioManager.play('reward', { throttleKey: 'prep-sfx-preview', throttleMs: 180 });
        });
        this.dom.prepMusicPreview?.addEventListener('click', () => {
            audioManager.unlock?.();
            if (!audioManager.settings?.musicEnabled) audioManager.setMusicEnabled(true);
            audioManager.playMusicPreview?.();
            this.syncPrepAudioControls();
        });
        this.container.querySelectorAll('[data-prep-tab]').forEach(tabButton => {
            tabButton.addEventListener('click', this.handlePrepTabClick);
        });
        this.dom.prepClose?.addEventListener('click', this.closePrepModal);
        this.dom.prepModal?.addEventListener('click', event => {
            if (event.target === this.dom.prepModal) this.closePrepModal();
        });

        this.dom.passiveEffectSlots?.addEventListener('click', (event) => {
            const slotEl = event.target.closest?.('[data-passive-slot]');
            if (!slotEl) return;
            this.selectedPassiveSlot = Number(slotEl.dataset.passiveSlot) || 0;
            this.renderPassiveCombatEffects();
            this.openPassiveEffectModal();
        });

        this.dom.passiveEffectLibrary?.addEventListener('click', (event) => {
            const effectEl = event.target.closest?.('[data-passive-effect-id]');
            if (!effectEl) return;
            this.equipPassiveCombatEffect(effectEl.dataset.passiveEffectId);
        });
        this.dom.passiveEffectLibrary?.addEventListener('mouseover', (event) => {
            const effectEl = event.target.closest?.('[data-passive-effect-id]');
            if (!effectEl) return;
            GameManager.clearPassiveCombatEffectNotice?.(effectEl.dataset.passiveEffectId);
        });
        this.dom.passiveEffectLibrary?.addEventListener('focusin', (event) => {
            const effectEl = event.target.closest?.('[data-passive-effect-id]');
            if (!effectEl) return;
            GameManager.clearPassiveCombatEffectNotice?.(effectEl.dataset.passiveEffectId);
        });
        this.dom.passiveEffectClose?.addEventListener('click', () => this.closePassiveEffectModal());
        this.dom.passiveEffectModal?.addEventListener('click', (event) => {
            if (event.target === this.dom.passiveEffectModal) this.closePassiveEffectModal();
        });
        document.addEventListener('keydown', this.handlePassiveEffectKeydown);

        // Warehouse filters
        const warehouseFilters = this.container.querySelectorAll('.warehouse-filter');
        warehouseFilters.forEach(filter => {
            filter.addEventListener('click', () => this.switchWarehouseFilter(filter.dataset.filter));
        });

        // Warehouse sort
        const warehouseSort = this.container.querySelector('#warehouse-sort');
        if (warehouseSort) warehouseSort.addEventListener('change', (e) => {
            this.currentWarehouseSort = e.target.value;
            this.renderWarehouse();
        });

        // Equipment slot click events
        if (this.dom.slotWeapon) {
            this.dom.slotWeapon.addEventListener('click', () => {
                const weapon = GameManager.getCharacter()?.equipment?.weapon;
                if (weapon) this.showEquipmentModal(weapon, 'weapon');
            });
        }
        if (this.dom.slotArmor) {
            this.dom.slotArmor.addEventListener('click', () => {
                const armor = GameManager.getCharacter()?.equipment?.armor;
                if (armor) this.showEquipmentModal(armor, 'armor');
            });
        }
        if (this.dom.slotAccessory) {
            this.dom.slotAccessory.addEventListener('click', () => {
                const accessory = GameManager.getCharacter()?.equipment?.accessory;
                if (accessory) this.showEquipmentModal(accessory, 'accessory');
            });
        }

        // Inventory event delegation: single click handler for performance
        if (this.dom.lobbyInventoryPane) {
            this.dom.lobbyInventoryPane.addEventListener('click', (e) => this.onInventoryClick(e));
        }
        this.dom.storeMaterials?.addEventListener('click', () => this.storeAllMaterials());
    }

    onInventoryClick(e) {
        const target = e.target;
        const itemEl = target.closest && target.closest('.inventory-item');
        if (!itemEl) return;
        const instanceId = itemEl.dataset.instanceId;
        if (!instanceId) return;

        const preview = GameManager.getStoredItemTransactionPreview(instanceId);
        if (preview) {
            this.showItemModal({ ...preview, instanceId }, 'inventory');
        }
    }

    showItemModal(stack, source) {
        const item = stack.item;
        const isEquipment = GameManager.canEquipItemToSlot(item);
        const isConsumable = item.type === 'potion' || item.type === 'scroll';
        const buttons = [];
        const tutorial = this.getPrepTutorialDirective();
        const isTutorialItem = tutorial?.targetItemIds?.includes(item.id);

        if (isEquipment) {
            if (item.type === 'weapon') {
                const mainButton = this.createButton('⚔️ 裝備主手', 'btn-primary', () => this.equipItem(stack.instanceId, source, 'weapon'));
                mainButton.dataset.equipSlot = 'weapon';
                if (isTutorialItem && tutorial.targetSlot === 'weapon') mainButton.classList.add('is-prep-tutorial-target');
                buttons.push(mainButton);
                if (GameManager.canEquipItemToSlot(item, 'armor')) {
                    const offhandButton = this.createButton('🗡️ 裝備副手', 'btn-primary', () => this.equipItem(stack.instanceId, source, 'armor'));
                    offhandButton.dataset.equipSlot = 'armor';
                    if (isTutorialItem && tutorial.targetSlot === 'armor') offhandButton.classList.add('is-prep-tutorial-target');
                    buttons.push(offhandButton);
                }
            } else {
                const equipButton = this.createButton('⚔️ 裝備', 'btn-primary', () => this.equipItem(stack.instanceId, source));
                equipButton.dataset.equipSlot = item.type;
                if (isTutorialItem && tutorial.targetSlot === item.type) equipButton.classList.add('is-prep-tutorial-target');
                buttons.push(equipButton);
            }
        }
        if (isConsumable) {
            buttons.push(this.createButton('🧪 使用', 'btn-info', () => this.useItem(stack.instanceId, source)));
        }
        buttons.push(source === 'warehouse'
            ? this.createButton('🎒 放入背包', 'btn-info', () => this.moveToInventory(stack.instanceId))
            : this.createButton('🏦 放入倉庫', 'btn-info', () => this.moveToWarehouse(stack.instanceId)));
        buttons.push(this.createButton('💰 販售', 'btn-info', () => this.sellItem(stack.instanceId, source)));

        itemDetailModal.open(item, {
            ...buildItemModalOptions(item),
            actions: buttons
        });
    }

    updateUI(_state, type) {
        const state = {
            character: GameManager.getCharacter(),
            inventory: GameManager.getInventory() || [],
            warehouse: GameManager.getWarehouse() || [],
            inventoryCapacity: GameManager.getInventoryCapacity()
        };
        if (!state.character) return;
        
        if (type === 'all' || type === 'character') {
            // Update character display
            if (this.dom.characterLevel) {
                this.dom.characterLevel.textContent = state.character.level || 1;
            }
            if (this.dom.characterGold) {
                this.dom.characterGold.textContent = state.character.gold || 0;
            }
            
            // Sync attack/defense
            const totalAtk = state.character.getTotalAtk ? state.character.getTotalAtk() : (state.character.attack || state.character.baseAtk || 10);
            const totalDef = state.character.getTotalDef ? state.character.getTotalDef() : (state.character.defense || state.character.baseDef || 5);
            
            if (this.dom.characterAtk) {
                this.dom.characterAtk.textContent = totalAtk;
            }
            if (this.dom.characterDef) {
                this.dom.characterDef.textContent = totalDef;
            }
            
            // HP bar
            if (this.dom.hpBar && this.dom.hpText) {
                const currentHp = Math.max(0, Number(state.character.hp) || 0);
                const maxHp = Math.max(1, Number(state.character.maxHp) || 100);
                const hpPercent = (currentHp / maxHp) * 100;
                this.dom.hpBar.style.width = `${hpPercent}%`;
                this.dom.hpText.textContent = `生命：${currentHp} / ${maxHp}`;
            }
            
            // EXP bar
            if (this.dom.expBar && this.dom.expText) {
                const currentExp = Math.max(0, Number(state.character.exp) || 0);
                const maxExp = Math.max(1, Number(state.character.maxExp) || 100);
                const expPercent = (currentExp / maxExp) * 100;
                this.dom.expBar.style.width = `${expPercent}%`;
                this.dom.expText.textContent = `經驗：${currentExp} / ${maxExp}`;
            }
            
            // Update equipment slots
            this.updateEquipmentSlots(state.character.equipment);
            this.renderPassiveCombatEffects();

            // Show equipped set hints inside the equipment card.
            try {
                if (this.dom.activeSetBonuses) {
                    this.dom.activeSetBonuses.innerHTML = buildEquippedSetSummaryHtml(state);
                }
            } catch (e) {
                console.warn('Failed to render set hints:', e);
            }
        }

        if (type === 'all' || type === 'gold') {
            if (this.dom.characterGold) {
                this.dom.characterGold.textContent = state.character.gold || 0;
            }
        }
        
        if (type === 'all' || type === 'warehouse') {
            this.renderWarehouse();
        }
        
        if (type === 'all' || type === 'inventory') {
            // Update inventory display
            if (this.dom.inventoryUsed && this.dom.inventoryMax) {
                this.dom.inventoryUsed.textContent = state.inventory.length;
                this.dom.inventoryMax.textContent = state.inventoryCapacity || 10;
            }
            
            this.renderLobbyInventoryGrid(state.inventory || []);
            if (this.dom.storeMaterials) {
                const materialStacks = state.inventory.filter(stack => String(stack.item?.type || '').toLowerCase() === 'material');
                const materialQuantity = materialStacks.reduce((total, stack) => total + Math.max(1, Number(stack.quantity) || 1), 0);
                this.dom.storeMaterials.disabled = materialStacks.length === 0;
                this.dom.storeMaterials.title = materialStacks.length > 0
                    ? `將 ${materialStacks.length} 種、共 ${materialQuantity} 個素材放入倉庫`
                    : '背包內沒有可存放的素材';
            }
        }

        if (type === 'all' || type === 'flags') {
            this.renderWorldStage();
        }

    }

    handleQuestEvent(eventType, data = {}) {
        const townRefreshEvents = new Set([
            'quest_ready',
            'quest_completed',
            'quest_unlocked',
            'quest_accepted'
        ]);
        if (!townRefreshEvents.has(eventType)) return;
        if (eventType === 'quest_ready') {
            this.showFirstQuestReportGuidance(data.quest);
        }
        if (eventType === 'quest_completed' && data?.townStateUpdate?.changed) {
            const title = data.townStateUpdate.title || (data.quest?.name ? `完成：${data.quest.name}` : '城鎮有了變化');
            const message = data.townStateUpdate.text || '這件事被城鎮記住了。';
            this.pushTownNarrativeOnce(
                `quest-town-state:${data.townStateUpdate.flag}`,
                title,
                message,
                'discovery'
            );
        }
        this.renderWorldStage();
    }

    handleWorldInteraction(event) {
        const hotspot = event.currentTarget;
        const interactionId = hotspot?.dataset?.interactionId;
        this.triggerTownInteraction(interactionId);
    }

    handleWorldRoute(event) {
        const route = event.currentTarget?.dataset?.route;
        this.navigateTownRoute(route);
    }

    handleTownStageClick(event) {
        const backButton = event.target?.closest?.('[data-town-back]');
        if (backButton) {
            this.activeTownPlaceId = null;
            this.renderWorldStage();
            return;
        }

        const placeButton = event.target?.closest?.('[data-town-place-id]');
        if (placeButton) {
            this.enterTownPlace(placeButton.dataset.townPlaceId);
            return;
        }

        const interactionButton = event.target?.closest?.('[data-interaction-id]');
        if (interactionButton && this.dom.worldStage?.contains(interactionButton)) {
            this.triggerTownInteraction(interactionButton.dataset.interactionId);
            return;
        }

        const achievementButton = event.target?.closest?.('[data-achievements-open]');
        if (achievementButton && this.dom.worldStage?.contains(achievementButton)) {
            this.openAchievementModal();
            return;
        }

        const routeButton = event.target?.closest?.('[data-route]');
        if (routeButton && this.dom.worldStage?.contains(routeButton)) {
            this.navigateTownRoute(routeButton.dataset.route);
            return;
        }

        const storySceneButton = event.target?.closest?.('[data-story-scene-id]');
        if (storySceneButton && this.dom.worldStage?.contains(storySceneButton)) {
            this.openStoryScene(storySceneButton.dataset.storySceneId);
            return;
        }

        const npcButton = event.target?.closest?.('[data-npc-id]');
        if (npcButton && this.dom.worldStage?.contains(npcButton)) {
            this.openTownNpc(npcButton.dataset.npcId);
        }
    }

    handleTownNpc(event) {
        const npcId = event.currentTarget?.dataset?.npcId;
        this.openTownNpc(npcId);
    }

    triggerTownInteraction(interactionId) {
        if (!interactionId) return;

        const outcome = worldInteractionManager.trigger(interactionId, {
            source: 'lobby',
            toast: false
        });
        const title = outcome.interaction?.title || '紀錄';
        const message = outcome.messages?.join(' ') || '這裡暫時沒有新的變化。';

        this.pushTownNarrative(title, message, outcome.success ? 'discovery' : 'ambient');
        this.renderWorldStage();
    }

    navigateTownRoute(route) {
        if (!route) return;

        if (route === 'shop') {
            navigationIntentManager.setTownReturnPlace('market');
        }
        if (route === 'adventure') {
            resetSavedOverworldPlayerToEntry();
        }

        if (typeof this.app?.navigateTo === 'function') {
            this.app.navigateTo(route);
        } else {
            this.app.loadScene(route);
        }
    }

    restoreTownPlaceReturn() {
        const placeId = navigationIntentManager.consumeTownReturnPlace();
        if (!placeId || !getResolvedTownPlace(placeId)) return;

        this.activeTownPlaceId = placeId;
    }

    async openTownNpc(npcId) {
        if (!npcId) return;

        const action = storyGuidanceManager.getTownNpcAction(npcId);
        const dialogues = dialogueManager.getAvailableDialogues(npcId);
        const ambientDialogue = dialogueManager.getAmbientDialogue(npcId);
        const dialogueTopics = dialogues
            .filter(dialogue => !dialogueManager.isFallbackDialogue(dialogue))
            .map(dialogue => dialogueManager.getDialogueTopic(dialogue));
        const hasStoryAction = action.type !== 'dialogue';
        const shouldChooseTopic = hasStoryAction
            || dialogueTopics.length > 1
            || dialogueTopics.some(topic => topic.category === 'side');

        if (shouldChooseTopic) {
            const npc = getTownNPC(npcId);
            const actor = getStoryActor(npcId, { isFlagSet: flag => GameManager.getFlag(flag) });
            const choices = [
                ...(hasStoryAction ? [{
                    id: '__story_action__',
                    label: action.title,
                    title: action.title,
                    summary: action.summary,
                    kind: 'main-story',
                    kindLabel: '主線事件',
                    isPrimary: true
                }] : []),
                ...dialogueTopics
            ];
            let selection;
            if (ambientDialogue) {
                const ambientOutcome = dialogueManager.startDialogue(npcId, {
                    source: 'lobby',
                    dialogueId: ambientDialogue.id
                });
                const presentation = this.enrichDialoguePresentation(ambientOutcome);
                selection = await storyDialogueController.play({
                    ...presentation,
                    choiceTitle: '現在想談什麼？',
                    choices
                }, {
                    closable: true,
                    backgroundImage: this.getTownDialogueBackground(),
                    backgroundPosition: this.getTownDialogueBackgroundPosition(),
                    scopeElement: this.getTownDialogueScopeElement()
                });
                if (selection.status === 'selected') dialogueManager.commitDialogue(ambientOutcome);
            } else {
                selection = await storyDialogueController.choose({
                    title: '現在想談什麼？',
                    choices,
                    standing: actor?.standing || '',
                    standingFacing: actor?.standingFacing || 'center',
                    standingScale: actor?.standingScale || 1,
                    standingOffsetY: actor?.standingOffsetY || 0,
                    portrait: npc?.portrait || npc?.image || '',
                    name: npc?.name || '居民',
                    role: npc?.role || npc?.location || '',
                    backgroundImage: this.getTownDialogueBackground(),
                    backgroundPosition: this.getTownDialogueBackgroundPosition(),
                    scopeElement: this.getTownDialogueScopeElement(),
                    closable: true
                });
            }
            if (selection.status !== 'selected') return;
            if (selection.choiceId === '__story_action__') {
                await this.executeTownNpcAction(action);
                this.renderWorldStage();
                return;
            }
            const outcome = dialogueManager.startDialogue(npcId, {
                source: 'lobby',
                dialogueId: selection.choiceId
            });
            await this.playTownDialogueOutcome(outcome);
            return;
        }

        await this.executeTownNpcAction(action);
        if (hasStoryAction) {
            this.renderWorldStage();
            return;
        }

        const outcome = dialogueManager.startDialogue(npcId, {
            source: 'lobby',
            dialogueId: dialogues[0]?.id || null
        });
        await this.playTownDialogueOutcome(outcome);
        this.renderWorldStage();
    }

    async executeTownNpcAction(action) {
        if (action.type === 'chapter-one-first-report') {
            await this.playChapterOneFirstReturnReport();
            return true;
        }
        if (action.type === 'chapter-one-home-recovery') {
            await this.playChapterOneMiaRecovery();
            return true;
        }
        if (action.type === 'chapter-one-closing-report') {
            await this.playChapterOneClosingReport(action.stage);
            return true;
        }
        if (action.type === 'story-scene') {
            this.openStoryScene(action.sceneId);
            return true;
        }
        if (action.type === 'mia-emergency-potions') {
            await this.playMiaEmergencyPotionSupport();
            return true;
        }
        return false;
    }

    openInitialStoryFlow() {
        const action = storyGuidanceManager.getInitialTownAction({
            townArrivalReason: this.townArrivalReason
        });
        if (!action) return;
        window.setTimeout(() => {
            if (storyDialogueController.isOpen()) return;
            if (action.type === 'chapter-one-first-report') {
                this.playChapterOneFirstReturnReport();
                return;
            }
            if (action.type === 'navigate') {
                this.app?.navigateTo?.(action.route);
                return;
            }
            if (action.type === 'story-scene') {
                if (action.placeId) this.enterTownPlace(action.placeId);
                const result = this.openStoryScene(action.sceneId);
                if (result?.success && this.townArrivalReason) {
                    navigationIntentManager.clearTownArrivalReason();
                    this.townArrivalReason = null;
                }
            }
        }, 120);
    }

    openStoryScene(sceneId, options = {}) {
        const outcome = dialogueManager.startStoryScene(sceneId, options);
        if (!outcome?.success) return outcome;
        this.playTownDialogueOutcome(outcome);
        return outcome;
    }

    enrichDialogueActor(actor) {
        if (!actor) return actor;
        const actorId = actor.id || actor.actorId;
        const npc = getTownNPC(actorId);
        const storyActor = getStoryActor(actorId, { isFlagSet: flag => GameManager.getFlag(flag) });
        if (!npc && !storyActor) return actor;
        return {
            ...npc,
            ...storyActor,
            ...actor,
            portrait: actor.portrait || storyActor?.portrait || npc?.portrait || npc?.image || '',
            standing: actor.standing || storyActor?.standing || ''
        };
    }

    enrichDialoguePresentation(outcome) {
        return {
            ...outcome,
            npc: this.enrichDialogueActor(outcome.npc),
            participants: (outcome.participants || []).map(actor => this.enrichDialogueActor(actor)),
            lines: (outcome.lines || []).map(line => this.enrichDialogueActor(line))
        };
    }

    getTownDialogueBackground() {
        const place = getResolvedTownPlace(this.activeTownPlaceId);
        return place?.sceneImage || place?.cardImage || '';
    }

    getTownDialogueBackgroundPosition() {
        const place = getResolvedTownPlace(this.activeTownPlaceId);
        return place?.scenePosition || 'center';
    }

    getTownDialogueScopeElement() {
        const placeView = this.dom.townPlaceView;
        if (placeView && !placeView.hidden && placeView.isConnected) return placeView;
        return this.dom.worldStage;
    }

    async playTownDialogueOutcome(outcome) {
        if (!outcome?.success || !outcome?.npc) return outcome;
        const presentation = this.enrichDialoguePresentation(outcome);
        const usesFullViewport = presentation.lines.some(line => line.visualMode === 'blackout');
        const result = await storyDialogueController.play(presentation, {
            closable: !presentation.sceneId,
            backgroundImage: this.getTownDialogueBackground(),
            backgroundPosition: this.getTownDialogueBackgroundPosition(),
            scopeElement: usesFullViewport ? null : this.getTownDialogueScopeElement()
        });
        if (result.status !== 'complete') return presentation;

        if (presentation.decision) {
            const accepted = await this.playTownDialogueDecision(presentation);
            if (!accepted) return presentation;
        }

        if (presentation.sceneId) {
            dialogueManager.completeStoryScene(presentation.sceneId);
            if (presentation.sceneId === 'ch1_s02_wake_under_bitter_bottles') {
                storySceneManager.consumePrologueWakeDialogue();
                await this.playMiaEmergencyPotionSupport({ initial: true });
            }
        } else {
            dialogueManager.commitDialogue(outcome);
        }

        if (outcome.narrativeSummary) {
            this.pushTownNarrative(
                outcome.narrativeTitle || '交談片刻',
                outcome.narrativeSummary,
                outcome.tone || 'discovery'
            );
        }
        this.renderWorldStage();
        const continuation = presentation.sceneId
            ? storyGuidanceManager.getSceneContinuation(presentation.sceneId)
            : null;
        if (continuation) {
            window.setTimeout(() => {
                if (storyDialogueController.isOpen()) return;
                if (continuation.placeId) this.enterTownPlace(continuation.placeId);
                this.openStoryScene(continuation.sceneId);
            }, 120);
        }
        return presentation;
    }

    async playTownDialogueDecision(presentation) {
        const decision = presentation.decision;
        if (!decision?.choices?.length) return true;
        const npc = presentation.npc || {};

        while (true) {
            const selection = await storyDialogueController.choose({
                title: decision.title || '你要怎麼回覆？',
                choices: decision.choices,
                standing: npc.standing || '',
                standingFacing: npc.standingFacing || 'center',
                standingScale: npc.standingScale || 1,
                standingOffsetY: npc.standingOffsetY || 0,
                portrait: npc.portrait || npc.image || '',
                name: npc.name || '',
                role: npc.role || npc.location || '',
                backgroundImage: this.getTownDialogueBackground(),
                backgroundPosition: this.getTownDialogueBackgroundPosition(),
                scopeElement: this.getTownDialogueScopeElement(),
                closable: true
            });
            if (selection.status !== 'selected') return false;

            const choice = decision.choices.find(entry => entry.id === selection.choiceId);
            if (!choice || choice.kind === 'leave') return false;

            if (choice.responseLines?.length) {
                const response = await storyDialogueController.play({
                    participants: presentation.participants,
                    lines: choice.responseLines
                }, {
                    closable: true,
                    backgroundImage: this.getTownDialogueBackground(),
                    backgroundPosition: this.getTownDialogueBackgroundPosition(),
                    scopeElement: this.getTownDialogueScopeElement()
                });
                if (response.status !== 'complete') return false;
            }

            if (choice.commitsEffects) return true;
            if (!choice.returnsToDecision) return false;
        }
    }

    async playChapterOneFirstReturnReport() {
        const presentation = storySceneManager.buildCheckpointPresentation(
            'ch1_s06_three_landmarks',
            'south_gate_farmland_report'
        );
        if (!presentation?.success) return false;

        this.enterTownPlace('gate');
        const result = await storyDialogueController.play(presentation, {
            closable: false,
            backgroundImage: this.getTownDialogueBackground(),
            backgroundPosition: this.getTownDialogueBackgroundPosition(),
            scopeElement: this.getTownDialogueScopeElement()
        });
        if (result.status !== 'complete') return false;

        chapterOneProgressionManager.completeFirstReport();
        this.pushTownNarrative(
            '第一份道路紀錄',
            '田埂證據已交回。芙蕾要你先去米婭的工作間接受檢查，再前往獵人棧道。',
            'discovery'
        );
        this.renderWorldStage();
        return true;
    }

    async playChapterOneMiaRecovery() {
        const presentation = storySceneManager.buildCheckpointPresentation(
            'ch1_s06_three_landmarks',
            'south_gate_farmland_recovery'
        );
        if (!presentation?.success) return false;

        this.enterTownPlace('mia_workroom');
        const result = await storyDialogueController.play(presentation, {
            closable: false,
            backgroundImage: this.getTownDialogueBackground(),
            backgroundPosition: this.getTownDialogueBackgroundPosition(),
            scopeElement: this.getTownDialogueScopeElement()
        });
        if (result.status !== 'complete') return false;

        chapterOneProgressionManager.completeHomeRecovery();
        const needsSupply = chapterOneProgressionManager.needsMiaEmergencyPotionSupport();
        this.pushTownNarrative(
            '米婭的檢查',
            '米婭確認舊傷沒有惡化，可以繼續巡路。',
            'discovery'
        );
        if (needsSupply) await this.playMiaEmergencyPotionSupport();
        this.renderWorldStage();
        return true;
    }

    async playChapterOneClosingReport(stage = chapterOneProgressionManager.getClosingReportStage()) {
        if (!stage) return false;
        const sceneId = 'ch1_s11_roads_breathe_again';
        if (storySceneManager.getNextAvailableSceneId() !== sceneId) return false;

        const presentation = storySceneManager.buildCheckpointPresentation(sceneId, stage.checkpointId);
        if (!presentation?.success) return false;

        this.enterTownPlace(stage.placeId);
        const result = await storyDialogueController.play(presentation, {
            closable: false,
            backgroundImage: presentation.backgroundImage || this.getTownDialogueBackground(),
            backgroundPosition: this.getTownDialogueBackgroundPosition(),
            scopeElement: this.getTownDialogueScopeElement()
        });
        if (result.status !== 'complete') return false;

        const progress = chapterOneProgressionManager.completeClosingReportStage(stage.id);
        if (!progress.success) return false;
        if (progress.complete) {
            storySceneManager.completeScene(sceneId);
        }

        this.pushTownNarrative(
            presentation.narrativeTitle,
            progress.next?.text || '道路結果已分別交到需要處理它的人手上。',
            'discovery'
        );
        this.renderWorldStage();
        return true;
    }

    async playMiaEmergencyPotionSupport({ initial = false } = {}) {
        const current = GameManager.getEmergencyPotionCount();
        if (current >= 3) return { refilled: false, added: 0, current, limit: 3 };
        const npc = getTownNPC('herbalist');
        const actor = this.enrichDialogueActor({
            ...getStoryActor('herbalist', { isFlagSet: flag => GameManager.getFlag(flag) }),
            ...npc,
            id: 'herbalist',
            actorId: 'herbalist',
            expression: 'soft'
        });
        const expression = actor.expression;
        const line = {
            ...actor,
            actorId: 'herbalist',
            expression,
            expressionLayer: getStoryExpressionLayer('herbalist', expression),
            text: initial
                ? '先等等。你現在這個樣子不能空手出去。這三瓶應急藥帶著，用完就回來找我。'
                : `只剩 ${current} 瓶了？空瓶給我。我替你補回三瓶。`
        };

        await storyDialogueController.play({
            success: true,
            npc: actor,
            participants: [actor],
            lines: [line]
        }, {
            closable: false,
            backgroundImage: this.getTownDialogueBackground(),
            backgroundPosition: this.getTownDialogueBackgroundPosition(),
            scopeElement: this.getTownDialogueScopeElement()
        });

        const claim = await storyDialogueController.choose({
            title: '米婭把藥瓶放到你手邊。',
            choices: [{
                id: 'claim-mia-potions',
                label: '接過應急藥',
                description: '將小型生命藥水補足到三瓶。'
            }],
            standing: actor.standing || '',
            standingFacing: actor.standingFacing || 'center',
            standingScale: actor.standingScale || 1,
            standingOffsetY: actor.standingOffsetY || 0,
            portrait: actor.portrait || actor.image || '',
            name: actor.name || '米婭',
            role: actor.role || '',
            backgroundImage: this.getTownDialogueBackground(),
            backgroundPosition: this.getTownDialogueBackgroundPosition(),
            scopeElement: this.getTownDialogueScopeElement(),
            closable: false
        });
        if (claim.status !== 'selected') {
            return { refilled: false, added: 0, current, limit: 3 };
        }

        const supply = GameManager.refillMiaEmergencyPotions();
        if (supply.refilled) {
            this.pushTownNarrative(
                '米婭的應急藥',
                '應急藥已補足三瓶。少於三瓶時，可再次找米婭補足。',
                'discovery'
            );
        } else if (supply.current < supply.limit) {
            this.pushTownNarrative('背包沒有空位', '先整理背包，再回來接過米婭準備的藥水。', 'warning');
        }
        return supply;
    }

    async handleSaveExport() {
        try {
            const result = await GameManager.writeSaveFile();
            const actionText = result?.mode === 'file-system' ? '已寫入 JSON 存檔' : '已下載 JSON 存檔';
            this.pushTownNarrative('存檔', `${actionText}：${result?.filename || 'sds-save.json'}`, 'discovery');
        } catch (error) {
            if (error?.name === 'AbortError') return;
            console.warn('Save export failed:', error);
            this.pushTownNarrative('存檔失敗', error?.message || '無法匯出存檔。', 'warning');
        }
    }

    handleSaveImport() {
        this.dom.saveFileInput?.click();
    }

    async handleSaveFileSelected(event) {
        const file = event.target?.files?.[0];
        if (!file) return;

        const confirmed = await confirmAction({
            title: '讀取存檔',
            message: '這會覆蓋目前進度，請先確認已經匯出備份。',
            confirmText: '讀取',
            cancelText: '取消',
            type: 'warning'
        });

        if (!confirmed) {
            event.target.value = '';
            return;
        }

        try {
            const saveData = await GameManager.importSaveFile(file);
            this.pushTownNarrative('讀取存檔', `已讀取 ${file.name}，版本 ${saveData.schemaVersion || 1}。`, 'discovery');
        } catch (error) {
            console.warn('Save import failed:', error);
            this.pushTownNarrative('讀取失敗', error?.message || '存檔 JSON 格式不正確。', 'warning');
        } finally {
            event.target.value = '';
        }
    }

    async handleSaveReset() {
        const confirmed = await confirmAction({
            title: '重置進度',
            message: '這會清空角色、背包、倉庫、任務、塔與副本進度。',
            confirmText: '重置',
            cancelText: '取消',
            type: 'danger'
        });

        if (!confirmed) return;

        GameManager.resetSaveData();
        this.app?.navigateTo?.('guild');
    }

    initializeTownNarrative() {
        this.narrativeLines = [];
        this.renderedNarrativeCount = 0;

        if (this.dom.townNarrativeTitle) {
            this.dom.townNarrativeTitle.textContent = this.getTownTitle();
        }

        const character = GameManager.getCharacter();
        const currentHp = Math.max(0, Number(character?.hp) || 0);
        const maxHp = Math.max(1, Number(character?.maxHp) || 1);
        const recoveryText = currentHp >= maxHp
            ? '你回到裂痕廣場，傷勢已經處理好了。'
            : '你回到裂痕廣場，先在城裡喘口氣。';
        this.pushTownNarrative('抵達', recoveryText, 'ambient', { sourceKey: 'town:arrival' });

        this.consumeHandbookRouteIntent();
        this.showFirstQuestReportGuidance();
    }

    showFirstQuestReportGuidance(readyQuest = null) {
        if (GameManager.getFlag(GuildTutorialFlag.FIRST_QUEST_REPORT_GUIDANCE_SEEN)) return;

        const quest = readyQuest || questManager.getCompletedQuests?.()[0];
        if (!quest) return;

        const story = getQuestStory(quest, quest.state) || {};
        const reportName = story.reportTo?.name || quest.reportTo?.name || '委託人';
        this.pushTownNarrative(
            '任務可以回報',
            `「${quest.name}」的紀錄已補齊。找到${reportName}頭上的 !，點擊後選擇「回報任務」，親自交代結果。`,
            'discovery',
            { sourceKey: 'tutorial:first-quest-report' }
        );
        GameManager.setFlag(GuildTutorialFlag.FIRST_QUEST_REPORT_GUIDANCE_SEEN, true, {
            reason: 'first-quest-report-guidance-seen'
        });
    }


    consumeHandbookRouteIntent() {
        const intent = navigationIntentManager.consumeHandbookRouteIntent();
        if (!intent || typeof intent !== 'object') return;

        if (intent.route !== 'lobby') return;

        const subject = intent.title ? `「${intent.title}」` : '手札裡的這段紀錄';
        const target = intent.reportToName || '相關的人';
        const title = intent.reportToName ? `手札：找${intent.reportToName}` : '手札：回城確認';
        const message = intent.reportToName
            ? `你翻到${subject}。紀錄已經整理好，接下來該去找${target}把結果說清楚。`
            : `你翻到${subject}。這段紀錄指向城鎮裡的人或場所，先回來確認反應。`;

        this.pushTownNarrativeOnce(
            `handbook-route:${intent.kind || 'record'}:${intent.title || ''}:${intent.reportToName || intent.label || ''}`,
            title,
            message,
            'discovery'
        );
    }

    getTownTitle() {
        const activePlace = getResolvedTownPlace(this.activeTownPlaceId);
        if (activePlace) return activePlace.name;
        return getTownOverviewPresentation().title;
    }

    pushTownNarrative(title, message, tone = 'ambient', options = {}) {
        if (!this.dom?.townDialogueStream) return;

        const allowedTones = new Set(['ambient', 'discovery', 'warning']);
        const safeTone = allowedTones.has(tone) ? tone : 'ambient';
        const safeTitle = String(title || '城鎮片刻').trim();
        const safeMessage = String(message || '街道暫時安靜下來。').trim();
        const sourceKey = options.sourceKey || null;
        const alreadyLogged = this.narrativeLines.some(line => (
            (sourceKey && line?.sourceKey === sourceKey)
            || line?.message === safeMessage
        ));

        if (alreadyLogged) return;

        this.narrativeLines.push({
            title: safeTitle,
            message: safeMessage,
            tone: safeTone,
            sourceKey,
            createdAt: Date.now()
        });

        const removedOldest = this.narrativeLines.length > 30;
        if (removedOldest) {
            this.narrativeLines.shift();
        }

        if (this.dom.townNarrativeTitle) {
            this.dom.townNarrativeTitle.textContent = this.getTownTitle();
        }
        this.renderTownNarrative({ animateNew: !removedOldest, removedOldest });
    }

    createTownNarrativeEntry(line, { isNew = false } = {}) {
        const article = document.createElement('article');
        article.className = `town-story-entry is-${line.tone || 'ambient'}${isNew ? ' is-new' : ''}`;

        const title = document.createElement('span');
        title.className = 'world-log-title';
        title.textContent = line.title || '城鎮片刻';

        const message = document.createElement('p');
        message.className = 'world-log-message';
        message.textContent = line.message || '街道暫時安靜下來。';

        article.appendChild(title);
        article.appendChild(message);

        if (isNew) {
            setTimeout(() => {
                article.classList.remove('is-new');
            }, 480);
        }

        return article;
    }

    renderTownNarrative({ animateNew = false, removedOldest = false } = {}) {
        if (!this.dom?.townDialogueStream) return;

        const latestLine = this.narrativeLines[this.narrativeLines.length - 1];
        if (!latestLine) return;

        const stream = this.dom.townDialogueStream;

        if (removedOldest) {
            stream.querySelector('.town-story-entry')?.remove();
            this.renderedNarrativeCount = Math.max(0, this.renderedNarrativeCount - 1);
        }

        if (this.renderedNarrativeCount > this.narrativeLines.length) {
            stream.innerHTML = '';
            this.renderedNarrativeCount = 0;
        }

        for (let index = this.renderedNarrativeCount; index < this.narrativeLines.length; index += 1) {
            const isNewest = index === this.narrativeLines.length - 1;
            stream.appendChild(this.createTownNarrativeEntry(this.narrativeLines[index], {
                isNew: animateNew && isNewest
            }));
        }

        this.renderedNarrativeCount = this.narrativeLines.length;

        stream.scrollTop = stream.scrollHeight;

        if (this.dom.worldStoryLog) {
            this.dom.worldStoryLog.classList.toggle('is-discovery', latestLine.tone === 'discovery');
            this.dom.worldStoryLog.classList.toggle('is-warning', latestLine.tone === 'warning');
        }
    }

    renderWorldStage() {
        if (!this.dom?.worldStage) return;

        this.renderTownPlaceStage();

        this.dom.worldStage.querySelectorAll('[data-interaction-id]').forEach(hotspot => {
            const interactionId = hotspot.dataset.interactionId;
            const isResolved = worldInteractionManager.hasResolved(interactionId);
            const marker = storyGuidanceManager.getInformationMarker({
                hasUnreadInteraction: !isResolved
            });
            hotspot.classList.toggle('is-resolved', isResolved);
            hotspot.classList.toggle('is-ready', marker.visible);
        });

        this.dom.worldStage.querySelectorAll('[data-npc-id]').forEach(hotspot => {
            const npcId = hotspot.dataset.npcId;
            const marker = storyGuidanceManager.getInformationMarker({
                actorId: npcId,
                hasUnreadDialogue: dialogueManager.hasFreshDialogue(npcId)
            });
            hotspot.classList.toggle('is-ready', marker.visible);
        });
    }

    renderTownPlaceStage() {
        if (!this.dom?.townPlaceMap || !this.dom?.townPlaceView) return;

        const activePlace = getResolvedTownPlace(this.activeTownPlaceId);
        if (!activePlace || !this.shouldShowTownPlaceCard(activePlace)) {
            this.activeTownPlaceId = null;
            this.renderTownPlaceMap();
            return;
        }

        this.renderTownPlaceView(activePlace);
    }

    renderTownPlaceMap() {
        const map = this.dom.townPlaceMap;
        const view = this.dom.townPlaceView;
        if (!map || !view) return;

        map.hidden = false;
        view.hidden = true;
        delete view.dataset.placeId;
        map.innerHTML = '';
        this.applyTownOverviewImage();

        getResolvedTownPlaces().filter(place => this.shouldShowTownPlaceCard(place)).forEach(place => {
            const readyCount = this.getTownPlaceReadyCount(place);
            const hasStoryObjective = this.hasPendingTownStoryAtPlace(place);
            const hasNewInformation = readyCount > 0 || hasStoryObjective;
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `town-place-card ${place.mapClass || ''}${hasNewInformation ? ' is-ready' : ''}`;
            button.dataset.townPlaceId = place.id;
            const cardImage = place.cardImage || place.sceneImage;
            if (cardImage) {
                button.style.setProperty('--town-place-card-image', this.formatSceneAssetUrl(cardImage));
            }
            if (place.scenePosition) {
                button.style.setProperty('--town-place-card-image-position', place.scenePosition);
            }
            const alertText = hasNewInformation ? '!' : '';
            const placeDisplay = getTownPlaceDisplay(place);

            button.innerHTML = `
                <span class="town-place-card-copy">
                    <small>${escapeHtml(placeDisplay.tag)}</small>
                    <strong>${escapeHtml(placeDisplay.name)}</strong>
                </span>
                ${alertText ? `<span class="town-place-card-signal">${escapeHtml(alertText)}</span>` : ''}
            `;
            button.title = placeDisplay.fullName;
            button.setAttribute('aria-label', `${placeDisplay.fullName}${hasNewInformation ? '，有新資訊' : ''}`);
            button.addEventListener('click', event => {
                event.stopPropagation();
                this.enterTownPlace(place.id);
            });
            map.appendChild(button);
        });

        if (this.dom.townNarrativeTitle) {
            this.dom.townNarrativeTitle.textContent = this.getTownTitle();
        }
    }

    applyTownOverviewImage() {
        const backdrop = this.dom?.worldStageBackdrop;
        if (!backdrop) return;

        const overview = getTownOverviewPresentation();
        backdrop.dataset.townStage = overview.stage;
        backdrop.style.setProperty('--town-overview-image', this.formatSceneAssetUrl(overview.image));
    }

    renderTownPlaceView(place) {
        const map = this.dom.townPlaceMap;
        const view = this.dom.townPlaceView;
        if (!map || !view) return;

        map.hidden = true;
        view.hidden = false;
        view.dataset.placeId = place.id || '';
        this.applyTownPlaceScene(view, place);
        const placeDisplay = getTownPlaceDisplay(place);

        if (this.dom.townPlaceIcon) this.dom.townPlaceIcon.innerHTML = this.renderTownPlaceCardIcon(place);
        if (this.dom.townPlaceTag) this.dom.townPlaceTag.textContent = placeDisplay.tag;
        if (this.dom.townPlaceName) this.dom.townPlaceName.textContent = placeDisplay.name;
        if (this.dom.townPlaceDescription) {
            this.dom.townPlaceDescription.textContent = '';
            this.dom.townPlaceDescription.hidden = true;
        }
        if (this.dom.townNarrativeTitle) this.dom.townNarrativeTitle.textContent = this.getTownTitle();
        this.syncTownPlaceNarrative(place);

        const residents = place.residents || [];
        const authoredActions = place.actions || [];
        const storyAction = storyGuidanceManager.getTownPlaceAction(place.id);
        const actions = storyAction
            ? [
                ...authoredActions.filter(action => action.sceneId !== storyAction.sceneId),
                storyAction
            ]
            : authoredActions;

        if (this.dom.townPlaceResidentCount) this.dom.townPlaceResidentCount.textContent = String(residents.length);
        if (this.dom.townPlaceActionCount) this.dom.townPlaceActionCount.textContent = String(actions.length);

        this.renderTownPlaceResidents(residents);
        this.renderTownPlaceActions(actions);
    }

    applyTownPlaceScene(view, place = {}) {
        if (!view) return;
        const sceneImage = String(place.sceneImage || '').trim();
        view.classList.toggle('has-scene-image', Boolean(sceneImage));

        if (sceneImage) {
            view.style.setProperty('--town-place-image', this.formatSceneAssetUrl(sceneImage));
        } else {
            view.style.removeProperty('--town-place-image');
        }

        if (place.scenePosition) {
            view.style.setProperty('--town-place-image-position', place.scenePosition);
        } else {
            view.style.removeProperty('--town-place-image-position');
        }

    }

    renderTownPlaceCardIcon(place = {}) {
        const image = String(place.cardImage || place.sceneImage || '').trim();
        if (image) {
            return `<img src="${escapeHtml(this.formatAssetSrc(image))}" alt="${escapeHtml(place.name || '')}" loading="lazy">`;
        }
        return escapeHtml(place.icon || '⌂');
    }

    formatSceneAssetUrl(rawUrl = '') {
        const normalized = this.formatAssetSrc(rawUrl);
        return `url("${normalized.replace(/"/g, '\\"')}")`;
    }

    formatAssetSrc(rawUrl = '') {
        const normalized = String(rawUrl || '')
            .trim()
            .replace(/\\/g, '/')
            .replace(/^src\//, '/src/');
        return normalized;
    }

    renderTownPlaceResidents(residents = []) {
        const list = this.dom.townPlaceResidents;
        if (!list) return;

        list.innerHTML = '';
        const section = list.closest('.town-place-section');
        if (section) section.hidden = residents.length === 0;
        if (residents.length === 0) {
            return;
        }

        residents.forEach((resident, index) => {
            const npc = getTownNPC(resident.npcId) || {};
            const button = document.createElement('button');
            const label = resident.label || npc.name || '居民';
            const role = resident.role || npc.role || npc.location || '城鎮居民';
            const hasFreshDialogue = dialogueManager.hasFreshDialogue(resident.npcId);
            const hasStoryObjective = this.hasPendingTownStoryForResident(resident.npcId);
            const isReady = storyGuidanceManager.getInformationMarker({
                actorId: resident.npcId,
                hasUnreadDialogue: hasFreshDialogue
            }).visible;
            const iconHTML = this.renderTownEntryIcon(resident, npc, '💬');
            button.type = 'button';
            button.className = `town-place-entry town-place-resident${isReady ? ' is-ready' : ''}`;
            button.dataset.npcId = resident.npcId;
            button.setAttribute('aria-label', `${label}，${role}${hasStoryObjective ? '，主線可推進' : ''}`);
            this.applyTownPlaceEntryPosition(button, resident, index, 'resident');
            button.innerHTML = `
                <span class="town-place-entry-icon">${iconHTML}</span>
                <span class="town-place-entry-copy">
                    <strong>${escapeHtml(label)}</strong>
                </span>
                <span class="town-place-entry-mark">${isReady ? '!' : ''}</span>
            `;
            list.appendChild(button);
        });
    }

    renderTownEntryIcon(entry = {}, npc = {}, fallbackIcon = '•') {
        const image = entry.portrait || entry.image || npc.portrait || npc.image;
        const label = entry.label || npc.name || '';
        if (image) {
            return `<img src="${escapeHtml(image)}" alt="${escapeHtml(label)}" loading="lazy">`;
        }
        return escapeHtml(entry.icon || npc.avatar || fallbackIcon);
    }


    renderTownPlaceActions(actions = []) {
        const list = this.dom.townPlaceActions;
        if (!list) return;

        list.innerHTML = '';
        const section = list.closest('.town-place-section');
        if (section) section.hidden = actions.length === 0;
        if (actions.length === 0) {
            return;
        }

        actions.forEach((action, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            const isInteraction = action.type === 'interaction';
            const isAchievement = action.type === 'achievement';
            const isStoryScene = action.type === 'story-scene';
            const isResolved = isInteraction && worldInteractionManager.hasResolved(action.id);
            const hasNewInformation = storyGuidanceManager.getInformationMarker({
                hasUnreadInteraction: (isInteraction && !isResolved) || isStoryScene
            }).visible;
            const label = action.shortLabel || action.label || '行動';
            const description = action.description || '';
            button.className = `town-place-entry town-place-action${isAchievement ? ' town-achievement-action' : ''}${isResolved ? ' is-resolved' : ''}${hasNewInformation ? ' is-ready' : ''}`;
            if (action.type === 'route') button.dataset.route = action.route;
            if (isInteraction) button.dataset.interactionId = action.id;
            if (isAchievement) button.dataset.achievementsOpen = action.id || 'achievements';
            if (isStoryScene) button.dataset.storySceneId = action.sceneId;
            button.setAttribute('aria-label', description ? `${label}，${description}` : label);
            this.applyTownPlaceEntryPosition(button, action, index, 'action');
            const actionIcon = this.renderTownActionIcon(action);
            button.innerHTML = `
                <span class="town-place-entry-icon">${actionIcon}</span>
                <span class="town-place-entry-copy">
                    <strong>${escapeHtml(label)}</strong>
                </span>
                <span class="town-place-entry-mark">${hasNewInformation ? '!' : ''}</span>
            `;
            list.appendChild(button);
        });
    }

    renderTownActionIcon(action = {}) {
        if (action.iconOnly) {
            return escapeHtml(action.icon || '•');
        }

        const interactionImages = {
            crossroads_notice_board: 'notice_board',
            merchant_ancient_coin: 'hidden_stash_mound'
        };
        const routeImages = {
            adventure: 'dirt_road',
            shop: 'merchant_wagon',
            forge: 'ore_vein',
            quest: 'notice_board',
            encyclopedia: 'encyclopedia_tome',
            casino: 'random_event_spark',
            tower: 'charred_obelisk_mini'
        };
        const propId = action.imageId || interactionImages[action.id] || routeImages[action.route];
        const image = propId ? getGeneratedMapPropImage(propId) : '';
        const label = action.shortLabel || action.label || '';
        if (image) {
            return `<img src="${escapeHtml(this.formatAssetSrc(image))}" alt="${escapeHtml(label)}" loading="lazy">`;
        }
        return escapeHtml(action.icon || '•');
    }

    applyTownPlaceEntryPosition(element, entry = {}, index = 0, kind = 'action') {
        if (!element) return;
        const fallbackPositions = {
            resident: [
                { x: 32, y: 58 },
                { x: 24, y: 70 },
                { x: 42, y: 46 }
            ],
            action: [
                { x: 68, y: 58 },
                { x: 78, y: 72 },
                { x: 58, y: 42 },
                { x: 46, y: 72 }
            ]
        };
        const fallbackList = fallbackPositions[kind] || fallbackPositions.action;
        const fallback = fallbackList[index % fallbackList.length] || { x: 50, y: 58 };
        const position = entry.position || fallback;
        element.style.setProperty('--scene-x', `${Number(position.x) || fallback.x}%`);
        element.style.setProperty('--scene-y', `${Number(position.y) || fallback.y}%`);
    }

    shouldShowTownPlaceCard(place = {}) {
        return Boolean(place?.id);
    }

    getTownPlaceReadyCount(place) {
        const residentReady = (place?.residents || [])
            .filter(resident => resident?.npcId && storyGuidanceManager.getInformationMarker({
                actorId: resident.npcId,
                hasUnreadDialogue: dialogueManager.hasFreshDialogue(resident.npcId)
            }).visible)
            .length;
        const interactionReady = (place?.actions || [])
            .filter(action => action?.type === 'interaction'
                && action.id
                && storyGuidanceManager.getInformationMarker({
                    hasUnreadInteraction: !worldInteractionManager.hasResolved(action.id)
                }).visible)
            .length;
        return residentReady + interactionReady;
    }

    hasPendingTownStoryForResident(npcId) {
        return storyGuidanceManager.isActorTarget(npcId);
    }

    hasPendingTownStoryAtPlace(place = {}) {
        return storyGuidanceManager.isPlaceTarget(place.id);
    }

    syncTownPlaceNarrative(place = {}) {
        if (!place?.id) return;

        const placeName = place.name || '未命名場所';
        const description = String(place.description || '').trim();
        if (description) {
            this.pushTownNarrativeOnce(
                `place:${place.id}:arrival`,
                `抵達：${placeName}`,
                description,
                'ambient'
            );
        }

        (place.states || []).forEach((state, index) => {
            const resolvedVisible = state?.runtimeVisibility === 'visible';
            if (!resolvedVisible) return;
            const title = state.title || `${placeName}的變化`;
            const text = String(state.text || '').trim();
            if (!text) return;
            this.pushTownNarrativeOnce(
                `place:${place.id}:state:${state.id || index}`,
                title,
                text,
                'discovery'
            );
        });
    }

    pushTownNarrativeOnce(key, title, message, tone = 'ambient') {
        const safeKey = String(key || `${title}:${message}`);
        const alreadyLogged = this.narrativeLines.some(line => (
            line?.sourceKey === safeKey
            || line?.message === message
        ));

        if (alreadyLogged) return;

        this.pushTownNarrative(title, message, tone, { sourceKey: safeKey });
    }

    enterTownPlace(placeId) {
        const place = getResolvedTownPlace(placeId);
        if (!place || !this.shouldShowTownPlaceCard(place)) return;
        this.activeTownPlaceId = placeId;
        this.renderWorldStage();
    }

    cleanup() {
        // Unsubscribe from GameManager
        GameManager.unsubscribe(this.updateUI);
        questManager.unsubscribe(this.handleQuestEvent);
        document.removeEventListener('keydown', this.handlePassiveEffectKeydown);
    }

    renderAchievementPlaceholders() {
        if (!this.dom?.achievementList) return;

        this.dom.achievementList.innerHTML = AchievementPlaceholders.map(achievement => `
            <article class="achievement-card ${achievement.unlocked ? 'is-unlocked' : 'is-locked'}">
                <span class="achievement-medal" aria-hidden="true">${escapeHtml(achievement.icon)}</span>
                <span class="achievement-copy">
                    <strong>${escapeHtml(achievement.title)}</strong>
                    <small>${escapeHtml(achievement.unlocked ? achievement.text : `尚未解鎖 · ${achievement.text}`)}</small>
                </span>
            </article>
        `).join('');
    }

    openAchievementModal() {
        if (!this.dom?.achievementModal) return;
        this.renderAchievementPlaceholders();
        this.dom.achievementModal.hidden = false;
        this.dom.achievementModal.classList.add('active');
        this.dom.achievementClose?.focus?.();
    }

    closeAchievementModal() {
        if (!this.dom?.achievementModal) return;
        this.dom.achievementModal.classList.remove('active');
        this.dom.achievementModal.hidden = true;
    }

    handlePassiveEffectKeydown(event) {
        if (event.key === 'Escape' && this.dom?.achievementModal && !this.dom.achievementModal.hidden) {
            this.closeAchievementModal();
            return;
        }
        if (event.key === 'Escape' && this.dom?.prepModal?.classList.contains('active')) {
            this.closePrepModal();
            return;
        }
        if (event.key === 'Escape' && this.dom?.passiveEffectModal?.classList.contains('active')) {
            this.closePassiveEffectModal();
        }
    }

    handlePrepTabClick(event) {
        const tab = event.currentTarget?.dataset?.prepTab || 'character';
        if (this.dom?.prepModal?.classList.contains('active')) {
            this.switchPrepTab(tab);
            return;
        }
        this.openPrepModal(tab);
    }

    openPrepModal(tab = 'character') {
        if (!this.dom?.prepModal) return;
        this.dom.prepModal.hidden = false;
        this.renderPrepTutorial();
        this.switchPrepTab(tab);
        this.dom.prepModal.classList.add('active');
        this.dom.prepModal.setAttribute('aria-hidden', 'false');
        this.dom.prepClose?.focus?.();
    }

    setPrepTutorialProvider(provider) {
        this.prepTutorialProvider = typeof provider === 'function' ? provider : null;
        this.renderPrepTutorial();
        this.renderLobbyInventoryGrid(GameManager.getInventory() || []);
    }

    getPrepTutorialDirective() {
        return this.prepTutorialProvider?.() || null;
    }

    renderPrepTutorial() {
        const pane = this.dom?.lobbyInventoryPane;
        if (!pane) return;
        let guide = pane.querySelector('.prep-tutorial-guide');
        const directive = this.getPrepTutorialDirective();
        if (!directive) {
            guide?.remove();
            return;
        }
        if (!guide) {
            guide = document.createElement('aside');
            guide.className = 'prep-tutorial-guide';
            guide.setAttribute('aria-live', 'polite');
            pane.prepend(guide);
        }
        guide.innerHTML = `
            <span>${escapeHtml(directive.progress || '裝備教學')}</span>
            <strong>${escapeHtml(directive.title || '')}</strong>
            <p>${escapeHtml(directive.text || '')}</p>
        `;
    }

    closePrepModal() {
        if (!this.dom?.prepModal) return;
        this.dom.prepModal.classList.remove('active');
        this.dom.prepModal.setAttribute('aria-hidden', 'true');
        this.dom.prepModal.hidden = true;
        this.container.querySelectorAll('[data-prep-tab]').forEach(button => {
            button.classList.remove('is-active');
        });
    }

    switchPrepTab(tab = 'character') {
        const targetTab = tab || 'character';
        const titleMap = {
            character: '冒險者管理',
            inventory: '背包整理',
            warehouse: '倉庫整理',
            system: '系統設定'
        };

        this.container.querySelectorAll('[data-prep-tab]').forEach(button => {
            const active = button.dataset.prepTab === targetTab;
            button.classList.toggle('is-active', active);
            if (button.classList.contains('lobby-prep-tab')) {
                button.setAttribute('aria-selected', active ? 'true' : 'false');
            }
        });

        this.container.querySelectorAll('[data-prep-pane]').forEach(pane => {
            const active = pane.dataset.prepPane === targetTab;
            pane.classList.toggle('is-active', active);
            pane.hidden = !active;
        });

        if (this.dom?.prepTitle) {
            this.dom.prepTitle.textContent = titleMap[targetTab] || titleMap.character;
        }

        if (targetTab === 'system') {
            this.showPrepSystemLayer('main');
            this.syncPrepAudioControls();
        }
    }

    showPrepSystemLayer(layer = 'main') {
        const targetLayer = layer === 'audio' ? 'audio' : 'main';
        this.dom?.prepSystemLayers?.forEach(layerEl => {
            const active = layerEl.dataset.systemLayer === targetLayer;
            layerEl.classList.toggle('is-active', active);
            layerEl.hidden = !active;
        });
    }

    syncPrepAudioControls() {
        const settings = audioManager.settings || {};
        const sfxVolume = Math.round(Number(settings.sfxVolume ?? 50));
        const musicVolume = Math.round(Number(settings.musicVolume ?? 50));
        if (this.dom.prepSfxVolume) this.dom.prepSfxVolume.value = String(sfxVolume);
        if (this.dom.prepSfxValue) this.dom.prepSfxValue.textContent = String(sfxVolume);
        if (this.dom.prepSfxOutput) this.dom.prepSfxOutput.textContent = String(sfxVolume);
        if (this.dom.prepMusicVolume) this.dom.prepMusicVolume.value = String(musicVolume);
        if (this.dom.prepMusicValue) this.dom.prepMusicValue.textContent = String(musicVolume);
        if (this.dom.prepMusicOutput) this.dom.prepMusicOutput.textContent = String(musicVolume);
        if (this.dom.prepMusicEnabled) this.dom.prepMusicEnabled.checked = settings.musicEnabled !== false;
        if (this.dom.prepMusicState) this.dom.prepMusicState.textContent = settings.musicEnabled !== false ? '開' : '關';
    }

    openPassiveEffectModal() {
        if (!this.dom?.passiveEffectModal) return;
        this.dom.passiveEffectModal.classList.add('active');
        this.dom.passiveEffectModal.setAttribute('aria-hidden', 'false');
        this.dom.passiveEffectLibrary?.querySelector('.passive-effect-choice.is-equipped')?.focus?.();
    }

    closePassiveEffectModal() {
        if (!this.dom?.passiveEffectModal) return;
        this.dom.passiveEffectModal.classList.remove('active');
        this.dom.passiveEffectModal.setAttribute('aria-hidden', 'true');
    }

    formatPassiveBonusText(effect) {
        const bonuses = effect?.bonuses || {};
        const percent = (value) => `+${Math.round(Number(value || 0) * 100)}%`;
        const reduction = (value) => `-${Math.round(Number(value || 0) * 100)}%`;
        const rows = [];
        if (bonuses.critChance) rows.push(`爆擊率 ${percent(bonuses.critChance)}`);
        if (bonuses.critDamage) rows.push(`爆擊傷害 ${percent(bonuses.critDamage)}`);
        if (bonuses.attackSpeed) rows.push(`攻擊頻率 ${percent(bonuses.attackSpeed)}`);
        if (bonuses.atkPercent) rows.push(`攻擊 ${percent(bonuses.atkPercent)}`);
        if (bonuses.defPercent) rows.push(`防禦 ${percent(bonuses.defPercent)}`);
        if (bonuses.atk) rows.push(`攻擊 +${bonuses.atk}`);
        if (bonuses.def) rows.push(`防禦 +${bonuses.def}`);
        if (bonuses.poisonMitigation) rows.push(`中毒傷害 ${reduction(bonuses.poisonMitigation)}`);
        if (bonuses.coldGainReduction) rows.push(`寒冷累積 ${reduction(bonuses.coldGainReduction)}`);
        if (bonuses.coldMitigation) rows.push(`冰雪傷害 ${reduction(bonuses.coldMitigation)}`);
        if (bonuses.snowSupplySaving) rows.push(`補給節省 ${Math.round(Number(bonuses.snowSupplySaving || 0) * 100)}%`);
        if (bonuses.burnMitigation) rows.push(`灼熱傷害 ${reduction(bonuses.burnMitigation)}`);
        if (bonuses.durabilityLossReduction) rows.push(`耐久磨耗 ${reduction(bonuses.durabilityLossReduction)}`);
        if (bonuses.lostChanceReduction) rows.push(`迷路機率 ${reduction(bonuses.lostChanceReduction)}`);
        if (bonuses.markerRequirementReduction) rows.push(`路標需求 -${bonuses.markerRequirementReduction}`);
        if (bonuses.fleeChanceBonus) rows.push(`撤退成功 ${percent(bonuses.fleeChanceBonus)}`);
        if (bonuses.puzzleClueBonus) rows.push(`石碑判讀 +${bonuses.puzzleClueBonus}`);
        if (bonuses.trapDamageReduction) rows.push(`陷阱傷害 ${reduction(bonuses.trapDamageReduction)}`);
        if (bonuses.healingReceived) rows.push(`恢復量 ${percent(bonuses.healingReceived)}`);
        if (bonuses.bossDamageReduction) rows.push(`Boss 傷害 ${reduction(bonuses.bossDamageReduction)}`);
        return rows.join(' / ') || '無效果';
    }

    renderPassiveCombatEffects() {
        if (!this.dom?.passiveEffectSlots || !this.dom?.passiveEffectLibrary) return;

        const loadout = GameManager.getPassiveCombatEffectLoadout();
        const { slotCount, slots, catalog, hasUnread } = loadout;
        if (slotCount < 1) return;
        this.selectedPassiveSlot = Math.max(0, Math.min(slotCount - 1, this.selectedPassiveSlot || 0));

        this.dom.passiveEffectSlots.closest?.('.passive-effect-panel')?.classList.toggle('has-unread-passive', hasUnread);

        this.dom.passiveEffectSlots.innerHTML = Array.from({ length: slotCount }, (_, index) => {
            const effect = slots[index];
            const selectedClass = '';
            if (!effect) {
                return `
                    <button class="passive-effect-slot is-empty${selectedClass}" type="button" data-passive-slot="${index}" aria-haspopup="dialog">
                        <span class="passive-effect-slot-index">${index + 1}</span>
                        <span class="passive-effect-copy">
                            <strong>未裝備技能</strong>
                            <small>選擇一個常駐效果</small>
                        </span>
                        <span class="passive-effect-action">選擇</span>
                    </button>
                `;
            }

            return `
                <button class="passive-effect-slot rarity-frame rarity-${escapeHtml(effect.rarity || 'common')}${selectedClass}" type="button" data-passive-slot="${index}" aria-haspopup="dialog">
                    <span class="passive-effect-icon">${escapeHtml(effect.icon || '◆')}</span>
                    <span class="passive-effect-copy">
                        <strong>${escapeHtml(effect.name)}</strong>
                        <small>${escapeHtml(this.formatPassiveBonusText(effect))}</small>
                    </span>
                    <span class="passive-effect-action">更換</span>
                </button>
            `;
        }).join('');

        this.dom.passiveEffectLibrary.innerHTML = catalog.map(entry => {
            const { effect, unlocked, equipped, unread, sourceText } = entry;
            const detailText = unlocked
                ? this.formatPassiveBonusText(effect)
                : (sourceText || '透過主線、支線、副本或特殊道具解鎖');
            const disabledClass = unlocked ? '' : ' is-locked';
            const equippedClass = equipped ? ' is-equipped' : '';
            const newClass = unread ? ' is-new' : '';
            return `
                <button class="passive-effect-choice rarity-frame rarity-${escapeHtml(effect.rarity || 'common')}${disabledClass}${equippedClass}${newClass}"
                    type="button"
                    data-passive-effect-id="${escapeHtml(effect.id)}"
                    ${unlocked ? '' : 'disabled'}>
                    <span class="passive-effect-icon">${escapeHtml(effect.icon || '◆')}</span>
                    <span class="passive-effect-choice-copy">
                        <strong>${escapeHtml(effect.name)}</strong>
                        <small>${escapeHtml(detailText)}</small>
                    </span>
                    ${newClass ? '<span class="passive-effect-new">NEW</span>' : ''}
                    <span class="passive-effect-state">${equipped ? '已裝備' : (unlocked ? '可替換' : '未解鎖')}</span>
                </button>
            `;
        }).join('');
    }

    equipPassiveCombatEffect(effectId) {
        const result = GameManager.equipPassiveCombatEffect(effectId, this.selectedPassiveSlot);
        if (!result.success) {
            showGlobalToast('無法替換', '這個戰術技能尚未解鎖。', 'warning');
            return;
        }

        this.renderPassiveCombatEffects();
        this.closePassiveEffectModal();
        showGlobalToast('戰術技能已替換', '新的常駐效果會直接套用在接下來的探索與戰鬥。', 'success');
    }
    
    updateEquipmentSlots(equipment = {}) {
        this.updateEquipmentSlot(this.dom.slotWeapon, equipment.weapon, {
            label: '武器',
            icon: '⚔️',
            emptyName: '未裝備武器'
        });
        this.updateEquipmentSlot(this.dom.slotArmor, equipment.armor, {
            label: '防具',
            icon: '🛡️',
            emptyName: '未裝備防具'
        });
        this.updateEquipmentSlot(this.dom.slotAccessory, equipment.accessory, {
            label: '飾品',
            icon: '💍',
            emptyName: '未裝備飾品'
        });
    }

    updateEquipmentSlot(slotEl, item, fallback) {
        if (!slotEl) return;

        const iconEl = slotEl.querySelector('.equipment-slot-icon');
        const nameEl = slotEl.querySelector('.equipment-slot-name');
        const rarityClasses = ['common', 'uncommon', 'rare', 'epic', 'legendary']
            .flatMap(rarity => [`rarity-${rarity}`, rarity]);

        slotEl.classList.remove('rarity-frame', ...rarityClasses);

        if (item) {
            const rarity = item.rarity || 'common';
            slotEl.classList.remove('empty');
            slotEl.classList.add('rarity-frame', `rarity-${rarity}`);
            slotEl.setAttribute('aria-label', `${fallback.label}：${item.name || '未知裝備'}，點擊開啟操作`);

            if (iconEl) {
                iconEl.innerHTML = getItemVisualHtml(item, fallback.icon);
            }
            if (nameEl) nameEl.textContent = item.name || '未知裝備';
            attachItemTooltip(slotEl, item, { hint: '點擊開啟操作' });
            return;
        }

        slotEl.classList.add('empty');
        slotEl.setAttribute('aria-label', fallback.emptyName);
        if (iconEl) iconEl.innerHTML = fallback.icon;
        if (nameEl) nameEl.textContent = '未裝備';
        detachItemTooltip(slotEl);
    }

    createEmptyStorageCell() {
        const emptySlot = document.createElement('button');
        emptySlot.type = 'button';
        emptySlot.disabled = true;
        emptySlot.className = 'field-item-cell is-empty';
        emptySlot.setAttribute('aria-label', '空白欄位');
        return emptySlot;
    }

    renderLobbyInventoryGrid(inventory = []) {
        if (!this.dom.inventoryList) return;

        const container = this.dom.inventoryList;
        container.innerHTML = '';

        const capacity = Math.max(5, GameManager.getInventoryCapacity() || inventory.length || 5);
        const slotCount = Math.ceil(Math.max(capacity, inventory.length) / 5) * 5;
        const slots = Array.from({ length: slotCount }, (_, index) => inventory[index] || null);

        slots.forEach(stack => {
            if (!stack) {
                container.appendChild(this.createEmptyStorageCell());
                return;
            }
            const item = stack.item || {};
            const quantity = Math.max(1, Number(stack.quantity) || 1);
            const rarity = item.rarity || 'common';
            const itemEl = document.createElement('button');
            itemEl.type = 'button';
            itemEl.className = 'inventory-item field-item-cell';
            itemEl.dataset.rarity = rarity;
            itemEl.dataset.instanceId = stack.instanceId || '';
            const tutorial = this.getPrepTutorialDirective();
            if (tutorial?.targetItemIds?.includes(item.id)) {
                itemEl.classList.add('is-prep-tutorial-target');
            }
            itemEl.setAttribute('aria-label', `${item.name || '未知物品'}，點擊查看與操作`);

            const iconHTML = getItemVisualHtml(item, '📦');

            itemEl.innerHTML = `
                <div class="item-icon">${iconHTML}</div>
                ${quantity > 1 ? `<span class="quantity-badge">${quantity}</span>` : ''}
            `;

            attachItemTooltip(itemEl, item, { quantity, hint: '點擊查看與操作' });
            itemEl.dataset.itemTooltipPayload = JSON.stringify({
                item,
                options: { quantity, hint: '點擊查看與操作' }
            });
            container.appendChild(itemEl);
        });
    }
    
    // ===== Warehouse Methods =====
    
    renderWarehouse() {
        const warehouse = GameManager.getWarehouse() || [];
        if (!this.dom.warehouseList) return;
        let filteredItems = [...warehouse];
        const totalItems = filteredItems.length;

        // Apply filter
        if (this.currentWarehouseFilter !== 'all') {
            filteredItems = filteredItems.filter(stack => stack.item.type === this.currentWarehouseFilter);
        }

        // Apply sort
        const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
        filteredItems.sort((a, b) => {
            switch (this.currentWarehouseSort) {
                case 'time-desc': return (b.item.acquiredTime || 0) - (a.item.acquiredTime || 0);
                case 'time-asc': return (a.item.acquiredTime || 0) - (b.item.acquiredTime || 0);
                case 'rarity-desc': return (rarityOrder[b.item.rarity] || 0) - (rarityOrder[a.item.rarity] || 0);
                case 'rarity-asc': return (rarityOrder[a.item.rarity] || 0) - (rarityOrder[b.item.rarity] || 0);
                default: return 0;
            }
        });

        if (this.dom.warehouseCount) {
            this.dom.warehouseCount.textContent = filteredItems.length === totalItems
                ? `${totalItems} 件`
                : `${filteredItems.length} / ${totalItems} 件`;
        }

        const container = this.dom.warehouseList;
        container.innerHTML = '';
        const fragment = document.createDocumentFragment();
        filteredItems.forEach(stack => fragment.appendChild(this.createWarehouseItemElement(stack)));

        const slotCount = Math.ceil(Math.max(10, filteredItems.length) / 5) * 5;
        for (let index = filteredItems.length; index < slotCount; index += 1) {
            fragment.appendChild(this.createEmptyStorageCell());
        }
        container.appendChild(fragment);
    }

    createWarehouseItemElement(stack) {
        const item = stack.item || {};
        const quantity = Math.max(1, Number(stack.quantity) || 1);
        const rarity = item.rarity || 'common';
        const itemEl = document.createElement('button');
        itemEl.type = 'button';
        itemEl.className = 'warehouse-item field-item-cell';
        itemEl.dataset.rarity = rarity;
        itemEl.setAttribute('aria-label', `${item.name || '未知物品'}，點擊開啟操作`);

        const iconHTML = getItemVisualHtml(item, '📦');

        itemEl.innerHTML = `
            <div class="item-icon">${iconHTML}</div>
            ${quantity > 1 ? `<span class="quantity-badge">${quantity}</span>` : ''}
        `;

        attachItemTooltip(itemEl, item, { quantity, hint: '點擊開啟操作' });
        itemEl.addEventListener('click', () => this.showItemModal(stack, 'warehouse'));
        return itemEl;
    }
    
    switchWarehouseFilter(filter) {
        this.currentWarehouseFilter = filter;
        
        // Update active state
        const filters = this.container.querySelectorAll('.warehouse-filter');
        filters.forEach(f => {
            if (f.dataset.filter === filter) {
                f.classList.add('active');
            } else {
                f.classList.remove('active');
            }
        });
        
        this.renderWarehouse();
    }
    
    showEquipmentModal(item, slotType) {
        const actions = [];
        actions.push(this.createButton('🔓 卸下裝備', 'btn-info', () => this.unequipItem(slotType)));

        itemDetailModal.open(item, {
            ...buildItemModalOptions(item),
            actions
        });
    }
    
    createButton(text, className, onClick) {
        const btn = document.createElement('button');
        btn.className = `btn ${className}`;
        btn.textContent = text;
        btn.addEventListener('click', onClick);
        return btn;
    }

    closeItemDetailModal() {
        itemDetailModal.close();
    }
    
    // ===== Item Actions =====
    
    equipItem(instanceId, source, slotType = null) {
        const success = slotType
            ? GameManager.equipItemToSlot(instanceId, slotType, source === 'warehouse')
            : GameManager.equipItem(instanceId, source === 'warehouse');
        if (success) {
            this.closeItemDetailModal();
        }
    }
    
    useItem(instanceId, source) {
        const success = GameManager.useConsumable(instanceId, source === 'warehouse');
        if (success) {
            this.closeItemDetailModal();
        } else {
            showGlobalToast('無法使用物品', '這個物品目前不能使用。', 'error');
        }
    }
    
    moveToWarehouse(instanceId) {
        const success = GameManager.moveToWarehouse(instanceId);
        if (success) {
            this.closeItemDetailModal();
        } else {
            showGlobalToast('移動失敗', '無法將物品放入倉庫。', 'error');
        }
    }
    
    moveToInventory(instanceId) {
        const success = GameManager.moveToInventory(instanceId);
        if (success) {
            this.closeItemDetailModal();
        } else {
            showGlobalToast('背包已滿', '請先整理背包或移動物品到倉庫。', 'warning');
        }
    }
    
    async sellItem(instanceId, source) {
        const fromWarehouse = source === 'warehouse';
        const preview = GameManager.getStoredItemTransactionPreview(instanceId, fromWarehouse);
        if (!preview) return;

        const confirmed = await confirmAction({
            title: '確認出售',
            message: `出售「${preview.item.name}」x${preview.quantity} 後會從${fromWarehouse ? '倉庫' : '背包'}移除。`,
            details: [`可獲得 ${preview.sellPrice} 金幣`],
            confirmText: '出售',
            type: 'warning'
        });
        
        if (confirmed) {
            const earnedGold = GameManager.sellItem(instanceId, fromWarehouse);
            if (earnedGold !== false) {
                this.closeItemDetailModal();
                showGlobalToast('出售完成', `已出售「${preview.item.name}」，獲得 ${earnedGold} 金幣。`, 'success');
            }
        }
    }

    storeAllMaterials() {
        const result = GameManager.moveAllMaterialsToWarehouse();
        if (!result.movedStacks) {
            showGlobalToast('沒有可存放的素材', '背包內目前沒有素材。', 'info');
            return;
        }

        showGlobalToast(
            '素材已放入倉庫',
            `已存放 ${result.movedStacks} 種素材，共 ${result.movedQuantity} 個。`,
            'success'
        );
    }
    
    unequipItem(slotType) {
        const success = GameManager.unequipItem(slotType);
        if (!success) {
            showGlobalToast('背包已滿', '請先整理背包再卸下裝備。', 'warning');
            return;
        }
        
        this.closeItemDetailModal();
    }
    
}
