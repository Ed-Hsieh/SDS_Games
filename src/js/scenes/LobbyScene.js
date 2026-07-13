/**
 * LobbyScene.js
 * Logic for the Lobby scene (Hall).
 */
import GameManager from '../managers/GameManager.js';
import { getSellPrice } from '../models/ItemSchema.js';
import { buildItemModalOptions, escapeHtml, getItemVisualHtml } from '../utils/ItemDisplay.js';
import { attachItemTooltip, detachItemTooltip } from '../utils/ItemTooltip.js';
import { buildEquippedSetSummaryHtml } from '../utils/SetDisplay.js';
import { isDevModeEnabled } from '../utils/DevMode.js';
import { confirmAction, showGlobalToast } from '../utils/UIFeedback.js';
import audioManager from '../utils/AudioManager.js';
import { worldInteractionManager } from '../managers/WorldInteractionManager.js';
import { dialogueManager } from '../managers/DialogueManager.js?v=mia-layer-test-20260712x';
import {
    PROLOGUE_TUTORIAL_RESOLVED_FLAG,
    PROLOGUE_WAKE_DIALOGUE_PENDING_FLAG
} from '../data/StoryStateContract.js?v=dialogue-flow-20260712w';
import { questManager } from '../managers/QuestManager.js?v=dialogue-flow-20260712w';
import { getAllPassiveCombatEffects, getPassiveCombatEffectUnlockSource } from '../data/PassiveCombatEffects.js';
import { MaterialDatabase } from '../data/Materials.js';
import { getTownNPC } from '../data/NPCDialogues.js';
import { getTownPlace } from '../data/TownPlaces.js?v=dialogue-flow-20260712w';
import { getGeneratedMapPropImage } from '../data/AssetManifest.js';
import { getResolvedTownPlace, getResolvedTownPlaces } from '../managers/TownStateResolver.js?v=dialogue-flow-20260712w';
import storyDialogueController from '../managers/StoryDialogueController.js';

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
        this.handleGrantTestSets = this.handleGrantTestSets.bind(this);
        this.handlePassiveEffectKeydown = this.handlePassiveEffectKeydown.bind(this);
        this.handlePrepTabClick = this.handlePrepTabClick.bind(this);
        this.closePrepModal = this.closePrepModal.bind(this);
        
        // Warehouse filter state
        this.currentWarehouseFilter = 'all';
        this.currentWarehouseSort = 'time-desc';
        
        // Selected item for modal
        this.selectedItem = null;
        this.selectedItemSource = null; // 'warehouse' or 'inventory'
        this.selectedPassiveSlot = 0;
        this.activeTownPlaceId = null;
        this.fatigueTimer = null;

        this.narrativeLines = [];
        this.lastNarrativeAt = 0;
        this.lastNarrativeTone = null;
        this.renderedNarrativeCount = 0;
        this.syncedTownPlaceNarrativeKeys = new Set();
        this.devMode = isDevModeEnabled();
    }

    init() {
        try {
            this.cacheDOM();
            this.bindEvents();
            
            // Subscribe to GameManager updates
            GameManager.subscribe(this.updateUI);
            questManager.subscribe(this.handleQuestEvent);

            this.restoreTownPlaceReturn();
            this.initializeTownNarrative();
            this.startFatigueRecoveryLoop();

            // Force initial UI update with current state
            this.updateUI(GameManager.state, 'all');
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
            grantTestSets: this.container.querySelector('#btn-grant-test-sets'),
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
            fatigueBar: this.container.querySelector('#fatigue-bar'),
            fatigueText: this.container.querySelector('#fatigue-text'),
            // Inventory and warehouse
            warehouseList: this.container.querySelector('#warehouse-list'),
            warehouseCount: this.container.querySelector('#warehouse-count'),
            inventoryList: this.container.querySelector('#inventory-list'),
            lobbyInventoryPane: this.container.querySelector('#lobby-field-pack-pane'),
            inventoryUsed: this.container.querySelector('#inventory-used'),
            inventoryMax: this.container.querySelector('#inventory-max'),
            
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
        if (this.dom.grantTestSets) this.dom.grantTestSets.hidden = !this.devMode;
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
        if (this.devMode) this.dom.grantTestSets?.addEventListener('click', this.handleGrantTestSets);
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
            this.renderPassiveCombatEffects(GameManager.state.character);
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
                const weapon = GameManager.state.character.equipment.weapon;
                if (weapon) this.showEquipmentModal(weapon, 'weapon');
            });
        }
        if (this.dom.slotArmor) {
            this.dom.slotArmor.addEventListener('click', () => {
                const armor = GameManager.state.character.equipment.armor;
                if (armor) this.showEquipmentModal(armor, 'armor');
            });
        }
        if (this.dom.slotAccessory) {
            this.dom.slotAccessory.addEventListener('click', () => {
                const accessory = GameManager.state.character.equipment.accessory;
                if (accessory) this.showEquipmentModal(accessory, 'accessory');
            });
        }

        // Inventory event delegation: single click handler for performance
        if (this.dom.lobbyInventoryPane) {
            this.dom.lobbyInventoryPane.addEventListener('click', (e) => this.onInventoryClick(e));
        }
        if (this.dom.inventoryList) {
            // virtualization: update visible items on scroll
            this.dom.inventoryList.addEventListener('scroll', () => {
                if (this._invUpdateRAF) return;
                this._invUpdateRAF = requestAnimationFrame(() => {
                    this._invUpdateRAF = null;
                    if (typeof this.updateVisibleInventoryItemsLobby === 'function') this.updateVisibleInventoryItemsLobby();
                });
            });
        }
    }

    onInventoryClick(e) {
        const target = e.target;
        const itemEl = target.closest && target.closest('.inventory-item');
        if (!itemEl) return;
        const instanceId = itemEl.dataset.instanceId;
        if (!instanceId) return;

        const stack = GameManager.state.inventory.find(entry => entry.instanceId === instanceId);
        if (stack) this.showItemModal(stack, 'inventory');
    }

    showItemModal(stack, source) {
        this.selectedItem = stack;
        this.selectedItemSource = source;

        const item = stack.item;
        const isEquipment = item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory';
        const isConsumable = item.type === 'potion' || item.type === 'scroll';
        // Initial action buttons from shared helper (global) if available
        let buttons = [];
        try {
            if (typeof getItemActionButtons === 'function') buttons = getItemActionButtons(stack, source) || [];
        } catch (e) {
            buttons = [];
        }

        // Add source-specific actions
        if (source === 'warehouse') {
            if (isEquipment) {
                if (item.type === 'weapon') {
                    buttons.push(this.createButton('⚔️ 裝備主手', 'btn-primary', () => this.equipItem(stack.instanceId, source, 'weapon')));
                    buttons.push(this.createButton('🗡️ 裝備副手', 'btn-primary', () => this.equipItem(stack.instanceId, source, 'armor')));
                } else {
                    buttons.push(this.createButton('⚔️ 裝備', 'btn-primary', () => this.equipItem(stack.instanceId, source)));
                }
                buttons.push(this.createButton('🎒 放入背包', 'btn-info', () => this.moveToInventory(stack.instanceId)));
                buttons.push(this.createButton('💰 販售', 'btn-info', () => this.sellItem(stack.instanceId, source)));
            } else {
                if (isConsumable) buttons.push(this.createButton('🧪 使用', 'btn-info', () => this.useItem(stack.instanceId, source)));
                buttons.push(this.createButton('🎒 放入背包', 'btn-info', () => this.moveToInventory(stack.instanceId)));
                buttons.push(this.createButton('💰 販售', 'btn-info', () => this.sellItem(stack.instanceId, source)));
            }
        } else if (source === 'inventory') {
            if (isEquipment) {
                if (item.type === 'weapon') {
                    buttons.push(this.createButton('⚔️ 裝備主手', 'btn-primary', () => this.equipItem(stack.instanceId, source, 'weapon')));
                    buttons.push(this.createButton('🗡️ 裝備副手', 'btn-primary', () => this.equipItem(stack.instanceId, source, 'armor')));
                } else {
                    buttons.push(this.createButton('⚔️ 裝備', 'btn-primary', () => this.equipItem(stack.instanceId, source)));
                }
                buttons.push(this.createButton('🏦 放入倉庫', 'btn-info', () => this.moveToWarehouse(stack.instanceId)));
                buttons.push(this.createButton('💰 販售', 'btn-info', () => this.sellItem(stack.instanceId, source)));
            } else {
                if (isConsumable) buttons.push(this.createButton('🧪 使用', 'btn-info', () => this.useItem(stack.instanceId, source)));
                buttons.push(this.createButton('🏦 放入倉庫', 'btn-info', () => this.moveToWarehouse(stack.instanceId)));
                buttons.push(this.createButton('💰 販售', 'btn-info', () => this.sellItem(stack.instanceId, source)));
            }
        }

        // Open centralized modal
        if (window.ItemDetailModal) {
            window.ItemDetailModal.open(item, {
                ...buildItemModalOptions(item),
                actions: buttons
            });
        }
    }

    updateUI(state, type) {
        if (!state || !state.character) {
            console.error('Invalid state in LobbyScene.updateUI:', state);
            return;
        }
        
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
                const currentHP = state.character.hp || state.character.currentHP || 100;
                const maxHP = state.character.maxHp || 100;
                const hpPercent = (currentHP / maxHP) * 100;
                this.dom.hpBar.style.width = `${hpPercent}%`;
                this.dom.hpText.textContent = `生命：${currentHP} / ${maxHP}`;
            }
            
            // EXP bar
            if (this.dom.expBar && this.dom.expText) {
                const currentEXP = state.character.exp || state.character.currentEXP || 0;
                const maxEXP = state.character.maxExp || state.character.maxEXP || 100;
                const expPercent = (currentEXP / maxEXP) * 100;
                this.dom.expBar.style.width = `${expPercent}%`;
                this.dom.expText.textContent = `經驗：${currentEXP} / ${maxEXP}`;
            }
            
            // Update equipment slots
            this.updateEquipmentSlots(state.character.equipment);
            this.renderPassiveCombatEffects(state.character);

            // Show equipped set hints inside the equipment card.
            try {
                if (this.dom.activeSetBonuses) {
                    this.dom.activeSetBonuses.innerHTML = buildEquippedSetSummaryHtml(state);
                }
            } catch (e) {
                console.warn('Failed to render set hints:', e);
            }
        }

        if (type === 'all' || type === 'character' || type === 'fatigue') {
            const fatigue = GameManager.getAdventureFatigueStatus?.();
            if (fatigue && this.dom.fatigueBar && this.dom.fatigueText) {
                this.dom.fatigueBar.style.width = `${Math.max(0, Math.min(100, fatigue.percent))}%`;
                this.dom.fatigueText.textContent = `疲勞：${fatigue.current} / ${fatigue.max}`;
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
            this.rememberTownPlaceReturn('market');
        }

        if (typeof this.app?.navigateTo === 'function') {
            this.app.navigateTo(route);
        } else {
            this.app.loadScene(route);
        }
    }

    rememberTownPlaceReturn(placeId) {
        if (!placeId || !getTownPlace(placeId)) return;
        if (!GameManager.state.ui || typeof GameManager.state.ui !== 'object') {
            GameManager.state.ui = {};
        }
        GameManager.state.ui.returnTownPlaceId = placeId;
        GameManager.markSaveDirty?.('town-place-return');
    }

    restoreTownPlaceReturn() {
        const placeId = GameManager.state?.ui?.returnTownPlaceId;
        if (!placeId || !getResolvedTownPlace(placeId)) return;

        this.activeTownPlaceId = placeId;
        delete GameManager.state.ui.returnTownPlaceId;
        GameManager.markSaveDirty?.('town-place-return-consumed');
    }

    async openTownNpc(npcId) {
        if (!npcId) return;

        const storySceneId = dialogueManager.getNextStorySceneForActor(npcId, {
            stageClass: 'town_scene'
        });
        if (storySceneId) {
            this.openStoryScene(storySceneId);
            this.renderWorldStage();
            return;
        }

        const dialogues = dialogueManager.getAvailableDialogues(npcId);
        if (dialogues.length > 1) {
            const npc = getTownNPC(npcId);
            const selection = await storyDialogueController.choose({
                title: '現在想談什麼？',
                choices: dialogues.map(dialogue => dialogueManager.getDialogueTopic(dialogue)),
                portrait: npc?.portrait || npc?.image || '',
                name: npc?.name || '居民',
                role: npc?.role || npc?.location || '',
                backgroundImage: this.getTownDialogueBackground(),
                closable: true
            });
            if (selection.status !== 'selected') return;
            const outcome = dialogueManager.startDialogue(npcId, {
                source: 'lobby',
                dialogueId: selection.choiceId
            });
            this.playTownDialogueOutcome(outcome);
            return;
        }

        const outcome = dialogueManager.startDialogue(npcId, {
            source: 'lobby',
            dialogueId: dialogues[0]?.id || null
        });
        this.playTownDialogueOutcome(outcome);

        this.renderWorldStage();
    }

    openInitialStoryFlow() {
        const sceneId = dialogueManager.getNextStorySceneId();
        if (sceneId === 'ch1_s01_road_collapse') {
            window.setTimeout(() => {
                if (storyDialogueController.isOpen()) return;
                this.app?.navigateTo?.('adventure');
            }, 120);
            return;
        }
        if (sceneId !== 'ch1_s02_wake_under_bitter_bottles'
            || !GameManager.getFlag(PROLOGUE_WAKE_DIALOGUE_PENDING_FLAG)) return;
        window.setTimeout(() => {
            if (storyDialogueController.isOpen()) return;
            this.enterTownPlace('mia_workroom');
            this.openStoryScene(sceneId);
        }, 120);
    }

    openStoryScene(sceneId, options = {}) {
        const outcome = dialogueManager.startStoryScene(sceneId, options);
        if (!outcome?.success) return outcome;
        const enrichActor = actor => {
            const npc = getTownNPC(actor?.id || actor?.actorId);
            return npc ? { ...npc, ...actor, portrait: actor?.portrait || npc.portrait } : actor;
        };
        outcome.npc = enrichActor(outcome.npc);
        outcome.participants = (outcome.participants || []).map(enrichActor);
        outcome.lines = (outcome.lines || []).map(line => enrichActor(line));
        this.playTownDialogueOutcome(outcome);
        return outcome;
    }

    getTownDialogueBackground() {
        const place = getTownPlace(this.activeTownPlaceId);
        return place?.sceneImage || place?.cardImage || '';
    }

    async playTownDialogueOutcome(outcome) {
        if (!outcome?.success || !outcome?.npc) return outcome;
        const result = await storyDialogueController.play(outcome, {
            closable: !outcome.sceneId,
            backgroundImage: this.getTownDialogueBackground()
        });
        if (result.status !== 'complete') return outcome;

        if (outcome.sceneId) {
            dialogueManager.completeStoryScene(outcome.sceneId);
            if (outcome.sceneId === 'ch1_s02_wake_under_bitter_bottles') {
                GameManager.setFlag(PROLOGUE_WAKE_DIALOGUE_PENDING_FLAG, false);
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
        return outcome;
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

    handleGrantTestSets() {
        if (typeof GameManager.grantSetEquipmentForTesting !== 'function') {
            showGlobalToast('測試套裝失敗', '目前版本沒有套裝測試入口。', 'warning');
            return;
        }

        const result = GameManager.grantSetEquipmentForTesting(['wolf_hunter', 'ancient_relic'], 'wolf_hunter');
        this.updateUI(GameManager.state, 'all');
        this.switchPrepTab('character');
        showGlobalToast(
            '已加入測試套裝',
            `已穿上狼獵套裝，遠古遺物套裝放入倉庫。新增 ${result.added.length} 件，穿上 ${result.equipped.length} 件。`,
            'success'
        );
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
            this.updateUI(GameManager.state, 'all');
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
        this.updateUI(GameManager.state, 'all');
        if (!GameManager.getFlag(PROLOGUE_TUTORIAL_RESOLVED_FLAG)) {
            window.setTimeout(() => this.app?.navigateTo?.('adventure'), 120);
        }
        this.pushTownNarrative('進度重置', '已重置為新遊戲狀態。需要保留時請再匯出 JSON 存檔。', 'warning');
    }

    initializeTownNarrative() {
        const narrativeState = GameManager.getTownNarrativeState();
        const shouldResetForAdventureReturn = Boolean(narrativeState.resetOnNextLobby);

        if (shouldResetForAdventureReturn) {
            GameManager.resetTownNarrativeState();
        }

        const activeNarrativeState = GameManager.getTownNarrativeState();
        this.narrativeLines = activeNarrativeState.lines;
        this.lastNarrativeAt = Number(activeNarrativeState.lastNarrativeAt) || 0;
        this.lastNarrativeTone = activeNarrativeState.lastNarrativeTone || null;

        if (this.dom.townNarrativeTitle) {
            this.dom.townNarrativeTitle.textContent = this.getTownTitle();
        }

        if (this.narrativeLines.length === 0) {
            this.pushTownNarrative(
                shouldResetForAdventureReturn ? '返城' : '抵達',
                this.getReturnNarrative(),
                'ambient'
            );
        } else {
            this.renderTownNarrative({ force: true });
        }

        this.consumeHandbookRouteIntent();
    }


    consumeHandbookRouteIntent() {
        const intent = GameManager.state?.ui?.handbookRouteIntent;
        if (!intent || typeof intent !== 'object') return;

        if (!GameManager.state.ui || typeof GameManager.state.ui !== 'object') {
            GameManager.state.ui = {};
        }

        delete GameManager.state.ui.handbookRouteIntent;
        GameManager.markSaveDirty?.('handbook-route-intent-consumed');

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

    getTownFlags() {
        return {
            board: Boolean(GameManager.getFlag('readCrossroadsNoticeBoard')),
            southRoute: Boolean(GameManager.getFlag('town.chapter1.south_route_recorded')),
            slimeAnomaly: Boolean(GameManager.getFlag('town.chapter1.slime_anomaly_named')),
            forgeProblem: Boolean(GameManager.getFlag('town.forge.problem_named')),
            forgeOpen: Boolean(GameManager.getFlag('town.blacksmith.forge_open')),
            boardwalkReopened: Boolean(GameManager.getFlag('town.chapter1.boardwalk_reopened')),
            forestWound: Boolean(GameManager.getFlag('town.chapter1.forest_wound_named')),
            bloodMoonSettled: Boolean(GameManager.getFlag('town.chapter1.blood_moon_settled')),
            towerGlyph: Boolean(GameManager.getFlag('foundTowerGlyphMemory')),
            dungeonForge: Boolean(GameManager.getFlag('foundDungeonForgeRelic')),
            secretShop: Boolean(GameManager.getFlag('secretShopUnlocked'))
        };
    }

    getReturnNarrative() {
        const flags = this.getTownFlags();

        if (flags.secretShop) {
            return '你從街角回到廣場，市集的燈影裡多了一條不在地圖上的窄路。有人把古代錢幣的符號刻在門框內側。';
        }
        if (flags.bloodMoonSettled) {
            return '你回到城鎮。夜色退得很慢，南門火盆裡有鹿角磨出的白粉。沒有人說結束。';
        }
        if (flags.forestWound) {
            return '你回到廣場。腐根溪谷的黑線被釘在地圖邊上，紙面乾著，指尖卻像沾到灰。';
        }
        if (flags.boardwalkReopened) {
            return '你回到南門內側。有人提起獵人棧道的風聲，說那條路終於不像一張閉上的嘴。';
        }
        if (flags.forgeOpen) {
            return '你回到城鎮。冷爐那邊有火聲，短促、穩定，像有人終於願意把夜晚敲碎一點。';
        }
        if (flags.forgeProblem) {
            return '你回到廣場。冷爐鐵匠鋪的煙囪沒有煙，門縫裡有鐵鏽味。那裡不再只是關著的店。';
        }
        if (flags.slimeAnomaly) {
            return '你回到書桌旁。凝膠瓶還在，甜味悶著，銀絲在瓶底細細發亮。';
        }
        if (flags.southRoute) {
            return '你回到廣場。南門外三處路標被抄在公告板上，紙角被風吹得發抖。';
        }
        if (flags.board) {
            return '公告欄上的新紙被風吹得沙沙作響，南門路標的拓印讓安全區外的異常變得更難忽略。';
        }

        return '你回到城鎮十字路。火盆低低響著，公告欄上幾張新紙還沒被人讀過。南門外的風帶著土味。';
    }

    getTownTitle() {
        const activePlace = getTownPlace(this.activeTownPlaceId);
        if (activePlace) return activePlace.name;

        const flags = this.getTownFlags();
        if (flags.secretShop) return '十字路與暗巷';
        return '城鎮十字路';
    }

    pushTownNarrative(title, message, tone = 'ambient', options = {}) {
        if (!this.dom?.townDialogueStream) return;

        const allowedTones = new Set(['ambient', 'discovery', 'warning']);
        const safeTone = allowedTones.has(tone) ? tone : 'ambient';
        const narrativeState = GameManager.getTownNarrativeState();
        if (this.narrativeLines !== narrativeState.lines) {
            this.narrativeLines = narrativeState.lines;
        }

        this.narrativeLines.push({
            title: title || '城鎮片刻',
            message: message || '街道暫時安靜下來。',
            tone: safeTone,
            sourceKey: options.sourceKey || null,
            createdAt: Date.now()
        });
        this.lastNarrativeAt = Date.now();
        this.lastNarrativeTone = safeTone;
        narrativeState.lastNarrativeAt = this.lastNarrativeAt;
        narrativeState.lastNarrativeTone = this.lastNarrativeTone;
        GameManager.markSaveDirty?.('town-narrative');

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

    renderTownNarrative({ animateNew = false, removedOldest = false, force = false } = {}) {
        if (!this.dom?.townDialogueStream) return;

        const latestLine = this.narrativeLines[this.narrativeLines.length - 1];
        if (!latestLine) return;

        const stream = this.dom.townDialogueStream;

        if (force) {
            stream.innerHTML = '';
            this.renderedNarrativeCount = 0;
        } else if (removedOldest) {
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
            hotspot.classList.toggle('is-resolved', worldInteractionManager.hasResolved(interactionId));
        });

        this.dom.worldStage.querySelectorAll('[data-npc-id]').forEach(hotspot => {
            const npcId = hotspot.dataset.npcId;
            hotspot.classList.toggle('is-ready', dialogueManager.hasFreshDialogue(npcId));
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

        getResolvedTownPlaces().filter(place => this.shouldShowTownPlaceCard(place)).forEach(place => {
            const readyCount = this.getTownPlaceReadyCount(place);
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `town-place-card ${place.mapClass || ''}${readyCount > 0 ? ' is-ready' : ''}`;
            button.dataset.townPlaceId = place.id;
            const cardImage = place.cardImage || place.sceneImage;
            if (cardImage) {
                button.style.setProperty('--town-place-card-image', this.formatSceneAssetUrl(cardImage));
            }
            if (place.scenePosition) {
                button.style.setProperty('--town-place-card-image-position', place.scenePosition);
            }

            const alertText = readyCount > 0
                ? `${readyCount} 個動向`
                : '';

            button.innerHTML = `
                <span class="town-place-card-copy">
                    <small>${escapeHtml(place.tag || '場所')}</small>
                    <strong>${escapeHtml(place.name || '未命名場所')}</strong>
                </span>
                ${alertText ? `<span class="town-place-card-signal">${escapeHtml(alertText)}</span>` : ''}
            `;
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

    renderTownPlaceView(place) {
        const map = this.dom.townPlaceMap;
        const view = this.dom.townPlaceView;
        if (!map || !view) return;

        map.hidden = true;
        view.hidden = false;
        view.dataset.placeId = place.id || '';
        this.applyTownPlaceScene(view, place);

        if (this.dom.townPlaceIcon) this.dom.townPlaceIcon.innerHTML = this.renderTownPlaceCardIcon(place);
        if (this.dom.townPlaceTag) this.dom.townPlaceTag.textContent = place.tag || '場所';
        if (this.dom.townPlaceName) this.dom.townPlaceName.textContent = place.name || '未命名場所';
        if (this.dom.townPlaceDescription) {
            this.dom.townPlaceDescription.textContent = '';
            this.dom.townPlaceDescription.hidden = true;
        }
        if (this.dom.townNarrativeTitle) this.dom.townNarrativeTitle.textContent = this.getTownTitle();
        this.syncTownPlaceNarrative(place);

        const residents = place.residents || [];
        const actions = place.actions || [];

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
            const iconHTML = this.renderTownEntryIcon(resident, npc, '💬');
            button.type = 'button';
            button.className = `town-place-entry town-place-resident${hasFreshDialogue ? ' is-ready' : ''}`;
            button.dataset.npcId = resident.npcId;
            button.setAttribute('aria-label', `${label}，${role}`);
            this.applyTownPlaceEntryPosition(button, resident, index, 'resident');
            button.innerHTML = `
                <span class="town-place-entry-icon">${iconHTML}</span>
                <span class="town-place-entry-copy">
                    <strong>${escapeHtml(label)}</strong>
                </span>
                <span class="town-place-entry-mark">${hasFreshDialogue ? '新' : ''}</span>
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
            const isResolved = isInteraction && worldInteractionManager.hasResolved(action.id);
            const label = action.shortLabel || action.label || '行動';
            const description = action.description || '';
            button.className = `town-place-entry town-place-action${isAchievement ? ' town-achievement-action' : ''}${isResolved ? ' is-resolved' : ''}`;
            if (action.type === 'route') button.dataset.route = action.route;
            if (isInteraction) button.dataset.interactionId = action.id;
            if (isAchievement) button.dataset.achievementsOpen = action.id || 'achievements';
            button.setAttribute('aria-label', description ? `${label}，${description}` : label);
            this.applyTownPlaceEntryPosition(button, action, index, 'action');
            const actionIcon = this.renderTownActionIcon(action);
            button.innerHTML = `
                <span class="town-place-entry-icon">${actionIcon}</span>
                <span class="town-place-entry-copy">
                    <strong>${escapeHtml(label)}</strong>
                </span>
                <span class="town-place-entry-mark">${isAchievement ? '☆' : (isResolved ? '✓' : '→')}</span>
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
            .filter(resident => resident?.npcId && dialogueManager.hasFreshDialogue(resident.npcId))
            .length;
        const interactionReady = (place?.actions || [])
            .filter(action => action?.type === 'interaction' && action.id && !worldInteractionManager.hasResolved(action.id))
            .length;
        return residentReady + interactionReady;
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
            const legacyFlagVisible = Boolean(state?.flag && GameManager.getFlag(state.flag));
            if (!resolvedVisible && !legacyFlagVisible) return;
            const title = state.title || `${placeName}的變化`;
            const text = String(state.text || '').trim();
            if (!text) return;
            this.pushTownNarrativeOnce(
                `place:${place.id}:state:${state.flag || index}`,
                title,
                text,
                'discovery'
            );
        });
    }

    pushTownNarrativeOnce(key, title, message, tone = 'ambient') {
        const safeKey = String(key || `${title}:${message}`);
        if (this.syncedTownPlaceNarrativeKeys.has(safeKey)) return;

        const narrativeState = GameManager.getTownNarrativeState();
        const existingLines = Array.isArray(narrativeState?.lines) ? narrativeState.lines : this.narrativeLines;
        const alreadyLogged = (existingLines || []).some(line => (
            line?.sourceKey === safeKey
            || (line?.title === title && line?.message === message)
        ));

        this.syncedTownPlaceNarrativeKeys.add(safeKey);
        if (alreadyLogged) return;

        this.pushTownNarrative(title, message, tone, { sourceKey: safeKey });
    }

    enterTownPlace(placeId) {
        const place = getResolvedTownPlace(placeId);
        if (!place || !this.shouldShowTownPlaceCard(place)) return;
        this.activeTownPlaceId = placeId;
        this.renderWorldStage();
    }

    startFatigueRecoveryLoop() {
        if (this.fatigueTimer) {
            clearInterval(this.fatigueTimer);
            this.fatigueTimer = null;
        }

        GameManager.resetAdventureFatigueRecoveryClock?.();
        this.fatigueTimer = setInterval(() => {
            const result = GameManager.recoverAdventureFatigue?.();
            if (result?.recovered > 0) {
                this.updateUI(GameManager.state, 'fatigue');
            }
        }, 1000);
    }

    cleanup() {
        // Unsubscribe from GameManager
        GameManager.unsubscribe(this.updateUI);
        questManager.unsubscribe(this.handleQuestEvent);
        if (this._invUpdateRAF) {
            cancelAnimationFrame(this._invUpdateRAF);
            this._invUpdateRAF = null;
        }
        if (this.fatigueTimer) {
            clearInterval(this.fatigueTimer);
            this.fatigueTimer = null;
        }
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
        this.switchPrepTab(tab);
        this.dom.prepModal.classList.add('active');
        this.dom.prepModal.setAttribute('aria-hidden', 'false');
        this.dom.prepClose?.focus?.();
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

    renderPassiveCombatEffects(character) {
        if (!this.dom?.passiveEffectSlots || !this.dom?.passiveEffectLibrary || !character) return;

        GameManager.syncPassiveCombatEffectUnlocks?.('lobby-render');

        const slotCount = Math.max(1, Number(character.passiveEffectSlots) || 1);
        this.selectedPassiveSlot = Math.max(0, Math.min(slotCount - 1, this.selectedPassiveSlot || 0));

        const equippedIds = Array.isArray(character.equippedPassiveEffectIds)
            ? character.equippedPassiveEffectIds
            : (character.getActivePassiveCombatEffects?.() || []).map(effect => effect.id);
        const unlockedIds = new Set(Array.isArray(character.unlockedPassiveEffectIds) ? character.unlockedPassiveEffectIds : []);
        const effects = getAllPassiveCombatEffects();
        const hasUnreadPassive = Boolean(GameManager.hasUnreadPassiveCombatEffects?.());
        this.dom.passiveEffectSlots.closest?.('.passive-effect-panel')?.classList.toggle('has-unread-passive', hasUnreadPassive);

        this.dom.passiveEffectSlots.innerHTML = Array.from({ length: slotCount }, (_, index) => {
            const effectId = equippedIds[index];
            const effect = effects.find(item => item.id === effectId);
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

        this.dom.passiveEffectLibrary.innerHTML = effects.map(effect => {
            const unlocked = unlockedIds.has(effect.id);
            const equipped = equippedIds.includes(effect.id);
            const source = getPassiveCombatEffectUnlockSource(effect.id);
            const detailText = unlocked
                ? this.formatPassiveBonusText(effect)
                : (source.sourceText || '透過主線、支線、副本或特殊道具解鎖');
            const disabledClass = unlocked ? '' : ' is-locked';
            const equippedClass = equipped ? ' is-equipped' : '';
            const newClass = GameManager.hasUnreadPassiveCombatEffect?.(effect.id) ? ' is-new' : '';
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
        const character = GameManager.state.character;
        if (!character?.equipPassiveCombatEffect) return;

        const ok = character.equipPassiveCombatEffect(effectId, this.selectedPassiveSlot);
        if (!ok) {
            showGlobalToast('無法替換', '這個戰術技能尚未解鎖。', 'warning');
            return;
        }

        GameManager.markSaveDirty?.('passive-combat-effect');
        GameManager.notify('all');
        this.renderPassiveCombatEffects(character);
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

    // Update visible inventory items for Lobby virtualization
    updateVisibleInventoryItemsLobby() {
        // Lobby inventory is rendered as a compact icon grid.
    }

    renderLobbyInventoryGrid(inventory = []) {
        if (!this.dom.inventoryList) return;

        const container = this.dom.inventoryList;
        container.innerHTML = '';

        const capacity = Math.max(5, Number(GameManager.state.inventoryCapacity) || inventory.length || 5);
        const slotCount = Math.ceil(Math.max(capacity, inventory.length) / 5) * 5;
        const slots = Array.from({ length: slotCount }, (_, index) => inventory[index] || null);

        slots.forEach(stack => {
            if (!stack) {
                const emptySlot = document.createElement('button');
                emptySlot.type = 'button';
                emptySlot.disabled = true;
                emptySlot.className = 'field-item-cell is-empty';
                emptySlot.setAttribute('aria-label', '空白欄位');
                container.appendChild(emptySlot);
                return;
            }
            const item = stack.item || {};
            const quantity = Math.max(1, Number(stack.quantity) || 1);
            const rarity = item.rarity || 'common';
            const itemEl = document.createElement('button');
            itemEl.type = 'button';
            itemEl.className = `inventory-item field-item-cell rarity-frame rarity-${rarity}`;
            itemEl.dataset.instanceId = stack.instanceId || '';
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
        const state = GameManager.state;
        if (!this.dom.warehouseList || !state.warehouse) return;
        let filteredItems = [...state.warehouse];
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

        // Chunked rendering using PerformanceUtils
        const container = this.dom.warehouseList;
        container.innerHTML = '';
        if (!filteredItems || filteredItems.length === 0) {
            container.innerHTML = '<div class="empty-hint inventory-grid-empty">倉庫空空如也...</div>';
            return;
        }

        // Use processInChunks to avoid long main-thread tasks
        if (window.PerformanceUtils && typeof window.PerformanceUtils.processInChunks === 'function') {
            window.PerformanceUtils.processInChunks(filteredItems, (stack) => {
                container.appendChild(this.createWarehouseItemElement(stack));
            }, {chunkSize: 40}).then(() => {
                // done
            });
        } else {
            // Fallback synchronous render
            filteredItems.forEach(stack => {
                container.appendChild(this.createWarehouseItemElement(stack));
            });
        }
    }

    createWarehouseItemElement(stack) {
        const item = stack.item || {};
        const quantity = Math.max(1, Number(stack.quantity) || 1);
        const rarity = item.rarity || 'common';
        const itemEl = document.createElement('button');
        itemEl.type = 'button';
        itemEl.className = `warehouse-item field-item-cell rarity-frame rarity-${rarity}`;
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

        if (window.ItemDetailModal) {
            window.ItemDetailModal.open(item, {
                ...buildItemModalOptions(item),
                actions
            });
        }
    }
    
    createButton(text, className, onClick) {
        const btn = document.createElement('button');
        btn.className = `btn ${className}`;
        btn.textContent = text;
        btn.addEventListener('click', onClick);
        return btn;
    }
    
    closeItemModal() {
        if (this.dom.itemModal) {
            this.dom.itemModal.classList.remove('active');
        }
        this.selectedItem = null;
        this.selectedItemSource = null;
    }

    canRepairItem(item) {
        return Boolean(GameManager.getRepairRequirement?.(item));
    }

    repairItem(item) {
        const requirement = GameManager.getRepairRequirement?.(item);
        if (!requirement) {
            showGlobalToast('不需要修復', '這件裝備耐久已滿。', 'info');
            return;
        }

        const result = GameManager.repairEquipmentItem?.(item);
        if (result?.success) {
            if (window.ItemDetailModal && typeof window.ItemDetailModal.close === 'function') window.ItemDetailModal.close();
            const materialText = requirement.materials.map(mat => {
                const material = MaterialDatabase[mat.id];
                return `${material?.name || mat.id} x${mat.quantity}`;
            }).join('、');
            showGlobalToast('修復完成', `消耗 ${requirement.gold} 金幣、${materialText}。`, 'success');
            return;
        }

        if (result?.reason === 'gold') {
            showGlobalToast('金幣不足', `修復需要 ${requirement.gold} 金幣。`, 'warning');
        } else if (result?.reason === 'materials') {
            showGlobalToast('材料不足', '修復需要對應鍛造材料，先去收集或整理倉庫。', 'warning');
        } else {
            showGlobalToast('修復失敗', '目前無法修復這件裝備。', 'error');
        }
    }
    
    // ===== Item Actions =====
    
    equipItem(instanceId, source, slotType = null) {
        const success = slotType
            ? GameManager.equipItemToSlot(instanceId, slotType, source === 'warehouse')
            : GameManager.equipItem(instanceId, source === 'warehouse');
        if (success) {
            this.closeItemModal();
            if (window.ItemDetailModal && typeof window.ItemDetailModal.close === 'function') window.ItemDetailModal.close();
        }
    }
    
    useItem(instanceId, source) {
        const success = GameManager.useConsumable(instanceId, source === 'warehouse');
        if (success) {
            this.closeItemModal();
            if (window.ItemDetailModal && typeof window.ItemDetailModal.close === 'function') window.ItemDetailModal.close();
        } else {
            showGlobalToast('無法使用物品', '這個物品目前不能使用。', 'error');
        }
    }
    
    moveToWarehouse(instanceId) {
        const success = GameManager.moveToWarehouse(instanceId);
        if (success) {
            this.closeItemModal();
            if (window.ItemDetailModal && typeof window.ItemDetailModal.close === 'function') window.ItemDetailModal.close();
        } else {
            showGlobalToast('移動失敗', '無法將物品放入倉庫。', 'error');
        }
    }
    
    moveToInventory(instanceId) {
        const success = GameManager.moveToInventory(instanceId);
        if (success) {
            this.closeItemModal();
            if (window.ItemDetailModal && typeof window.ItemDetailModal.close === 'function') window.ItemDetailModal.close();
        } else {
            showGlobalToast('背包已滿', '請先整理背包或移動物品到倉庫。', 'warning');
        }
    }
    
    async sellItem(instanceId, source) {
        const sourceArray = source === 'warehouse' ? GameManager.state.warehouse : GameManager.state.inventory;
        const stack = sourceArray.find(s => s.instanceId === instanceId);
        
        if (!stack) return;
        
        const sellPrice = getSellPrice(stack.item, stack.quantity);
        const confirmed = await confirmAction({
            title: '確認出售',
            message: `出售「${stack.item.name}」x${stack.quantity} 後會從${source === 'warehouse' ? '倉庫' : '背包'}移除。`,
            details: [`可獲得 ${sellPrice} 金幣`],
            confirmText: '出售',
            type: 'warning'
        });
        
        if (confirmed) {
            const earnedGold = GameManager.sellItem(instanceId, source === 'warehouse');
            if (earnedGold !== false) {
                this.closeItemModal();
                if (window.ItemDetailModal && typeof window.ItemDetailModal.close === 'function') window.ItemDetailModal.close();
                showGlobalToast('出售完成', `已出售「${stack.item.name}」，獲得 ${earnedGold} 金幣。`, 'success');
            }
        }
    }
    
    async discardItem(instanceId, source) {
        const sourceArray = source === 'warehouse' ? GameManager.state.warehouse : GameManager.state.inventory;
        const stack = sourceArray.find(s => s.instanceId === instanceId);
        
        if (!stack) return;
        
        const result = GameManager.discardItem(instanceId, source === 'warehouse');
        
        if (result === 'confirm') {
            const confirmed = await confirmAction({
                title: '確認回收稀有物品',
                message: `「${stack.item.name}」是 ${stack.item.rarity} 稀有度物品，回收後會永久移除。`,
                confirmText: '回收',
                type: 'danger'
            });
            if (confirmed) {
                // Force discard
                const index = sourceArray.findIndex(s => s.instanceId === instanceId);
                if (index > -1) {
                    sourceArray.splice(index, 1);
                    GameManager.notify(source === 'warehouse' ? 'warehouse' : 'inventory');
                    this.closeItemModal();
                    if (window.ItemDetailModal && typeof window.ItemDetailModal.close === 'function') window.ItemDetailModal.close();
                    showGlobalToast('已回收物品', `「${stack.item.name}」已移除。`, 'info');
                }
            }
        } else if (result === true) {
            this.closeItemModal();
            if (window.ItemDetailModal && typeof window.ItemDetailModal.close === 'function') window.ItemDetailModal.close();
            showGlobalToast('已回收物品', `「${stack.item.name}」已移除。`, 'info');
        }
    }
    
    unequipItem(slotType) {
        const item = GameManager.state.character.equipment[slotType];
        if (!item) return;
        
        // Check inventory capacity
        if (GameManager.state.inventory.length >= GameManager.state.inventoryCapacity) {
            showGlobalToast('背包已滿', '請先整理背包再卸下裝備。', 'warning');
            return;
        }
        
        // Unequip and add to inventory
        GameManager.state.character.equipment[slotType] = null;
        GameManager.addToInventory(item, 1);
        
        // 通知 UI 更新
        GameManager.notify('all');
        
        this.closeItemModal();
        if (window.ItemDetailModal && typeof window.ItemDetailModal.close === 'function') window.ItemDetailModal.close();
        this.updateUI(GameManager.state, 'all');
    }
    
}
