/**
 * AdventureScene.js
 * Logic for the Adventure scene (Map, Battle, Events, etc.)
 */
import GameManager, { Weapon, Armor, Accessory, Consumable, Item, ItemType, ItemRarity } from '../managers/GameManager.js';
import WorldMap from '../utils/WorldMap.js';
import { eventManager, getWorldEventJournalRecords } from '../managers/EventManager.js';
import { questManager, ObjectiveType, QuestStatus } from '../managers/QuestManager.js';
import { resolveDropSources, generateDropsFromSources } from '../managers/DropManager.js';
import { getRewardEffectTotals } from '../managers/EquipmentEffectResolver.js';
import { createRecipeBlueprintDisplayItems, rollRecipeBlueprintDrops } from '../managers/BlueprintManager.js';
import { markBlueprintKnown, markItemKnown, markMonsterKnown } from '../managers/EncyclopediaManager.js';
import { worldStoryManager } from '../managers/WorldStoryManager.js';
import { resolveItemById } from '../utils/ItemResolver.js';
import { getSellPrice } from '../models/ItemSchema.js';
import { buildItemModalOptions, escapeHtml, getItemVisualHtml } from '../utils/ItemDisplay.js';
import { attachItemTooltip, closeItemTooltip, detachItemTooltip } from '../utils/ItemTooltip.js';
import { isDevModeEnabled } from '../utils/DevMode.js';
import { confirmAction, showGlobalToast } from '../utils/UIFeedback.js';
import audioManager from '../utils/AudioManager.js';
import RhythmBarSystem from '../utils/RhythmBarSystem.js';
import { getLandmark } from '../data/WorldStories.js';
import { getQuestStory } from '../data/QuestStories.js';
import { getTownPlaces } from '../data/TownPlaces.js';
import {
    renderCombatMonster,
    renderCombatPlayer,
    renderCombatBuffIndicators,
    renderCombatActionDeck,
    clearCombatActionCooldown,
    isCombatActionCooling,
    startCombatActionCooldown,
    showCombatDamageNumber,
    showCombatPlayerHitFeedback,
    showCombatKillFreeze
} from '../utils/CombatUI.js';
import {
    getGeneratedBackgroundImage,
    getGeneratedDungeonImage,
    getGeneratedLandmarkFullImage,
    getGeneratedLandmarkImage,
    getGeneratedMapPropImage,
    getGeneratedStoryRelicImage,
    getGeneratedTownPlaceImage
} from '../data/AssetManifest.js';

const AMBUSH_MANTIS_CHAIN_ID = 'ambush_mantis';
const AMBUSH_MANTIS_BOSS_ID = 'ambush_mantis';
const AMBUSH_MANTIS_BAIT_ITEM_ID = 'silver_thread_bait';
const AMBUSH_MANTIS_TRIGGER_LANDMARK_ID = 'silver_snare_pass';
const ADVENTURE_TRAVEL_COSTS = {
    low: { fatigue: 1 },
    medium: { fatigue: 2 },
    high: { fatigue: 4 },
    death: { fatigue: 7 },
    boss: { fatigue: 7 }
};
const AMBUSH_MANTIS_RELATED_LANDMARKS = new Set([
    'hunter_boardwalk',
    'old_campfire_site',
    'cut_roadsign',
    AMBUSH_MANTIS_TRIGGER_LANDMARK_ID
]);
const LANDMARK_BOSS_TRIGGERS = {
    forest_guardian: {
        chainId: 'forest_guardian',
        bossId: 'forest_guardian',
        landmarkId: 'old_wolf_den',
        flag: 'world.story.forest_guardian.enteredRootHeart',
        readyTitle: '古樹根心',
        pendingTitle: '根心仍被霧遮住',
        defeatedTitle: '根心暫時安靜',
        actionLabel: '進入古樹根心',
        readyBody: '狼牙痕、霧碑拓印與發黑樹皮終於接成一條路。焦黑根鬚向地底張開，古樹守衛就在裡面痛苦喘息。',
        pendingBody: '根鬚在岩縫裡緩慢收縮，但痕跡還沒足以判斷核心入口。先補齊狼群、溪谷與霧碑的紀錄。',
        defeatedBody: '古樹守衛已被擊敗。根心仍有餘溫，但不再主動排斥靠近的人。'
    },
    blood_moon_stag: {
        chainId: 'blood_moon_stag',
        bossId: 'blood_moon_stag',
        landmarkId: 'moon_moss_slope',
        flag: 'world.story.blood_moon_stag.completedMoonBait',
        readyTitle: '月苔誘導',
        pendingTitle: '月苔痕跡不足',
        defeatedTitle: '血月已退',
        actionLabel: '完成月苔誘導',
        readyBody: '月苔、斷角路線與獵人告示對上了。只要把誘導標記放在坡面暗紅處，血月角鹿今晚一定會撞進這裡。',
        pendingBody: '坡面苔蘚泛著紅光，但還缺少能推回今晚路線的證據。先確認月苔樣本與斷角營地的遷徙記錄。',
        defeatedBody: '血月角鹿已倒下。坡面紅光慢慢熄滅，只剩被撞裂的石頭提醒你牠曾經多痛。'
    }
};
const LANDMARK_BOSS_TRIGGER_BY_LANDMARK = Object.values(LANDMARK_BOSS_TRIGGERS)
    .reduce((map, config) => {
        map[config.landmarkId] = config;
        return map;
    }, {});

// Preload FightManager for unified management (fallback to promise if not ready)
let FightManager = null;
const FightManagerReady = import('../managers/FightManager.js')
    .then(mod => { FightManager = mod; return mod; })
    .catch(err => { console.error('Failed to preload FightManager:', err); return null; });

// Centralized zone color definitions used by both rendering layers
const ZONE_COLORS = {
    low: { hex: '#31583b', fill: 'rgba(32, 74, 44, 0.22)', stroke: 'rgba(109, 142, 93, 0.055)', texture: 'rgba(153, 190, 131, 0.13)' },
    medium: { hex: '#394f4b', fill: 'rgba(42, 63, 59, 0.24)', stroke: 'rgba(118, 145, 135, 0.055)', texture: 'rgba(141, 169, 154, 0.12)' },
    high: { hex: '#685a43', fill: 'rgba(82, 71, 52, 0.26)', stroke: 'rgba(190, 166, 116, 0.06)', texture: 'rgba(216, 181, 95, 0.12)' },
    death: { hex: '#5b332e', fill: 'rgba(83, 45, 39, 0.28)', stroke: 'rgba(207, 98, 79, 0.07)', texture: 'rgba(228, 120, 95, 0.11)' }
};

const LANDMARK_REGION_STYLES = {
    safe_camp: {
        fill: 'rgba(214, 174, 91, 0.085)',
        edge: 'rgba(232, 190, 99, 0.24)',
        texture: 'rgba(232, 190, 99, 0.13)'
    },
    rot_mist: {
        fill: 'rgba(85, 162, 121, 0.09)',
        edge: 'rgba(120, 210, 158, 0.22)',
        texture: 'rgba(168, 226, 190, 0.11)'
    },
    thick_fog: {
        fill: 'rgba(190, 182, 142, 0.085)',
        edge: 'rgba(231, 216, 159, 0.22)',
        texture: 'rgba(245, 231, 178, 0.1)'
    },
    old_seal: {
        fill: 'rgba(151, 128, 214, 0.085)',
        edge: 'rgba(184, 164, 240, 0.22)',
        texture: 'rgba(212, 194, 255, 0.1)'
    },
    lair_pressure: {
        fill: 'rgba(190, 73, 73, 0.09)',
        edge: 'rgba(244, 114, 114, 0.24)',
        texture: 'rgba(248, 145, 145, 0.1)'
    },
    open_trail: {
        fill: 'rgba(123, 155, 112, 0.075)',
        edge: 'rgba(176, 207, 142, 0.2)',
        texture: 'rgba(206, 232, 170, 0.09)'
    },
    default: {
        fill: 'rgba(216, 181, 95, 0.075)',
        edge: 'rgba(216, 181, 95, 0.2)',
        texture: 'rgba(245, 221, 160, 0.09)'
    }
};

function getLandmarkRegionStyle(landmark = {}) {
    const effectIds = Array.isArray(landmark.effectIds) ? landmark.effectIds : [];
    const effectId = effectIds.find(id => LANDMARK_REGION_STYLES[id]);
    return LANDMARK_REGION_STYLES[effectId] || LANDMARK_REGION_STYLES.default;
}

export default class AdventureScene {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.worldMap = null;
        this.canvas = null;
        this.ctx = null;
        this.currentBattle = null;
        this.currentBattleZone = null;
        this.rhythmSystem = null;
        this.offhandRhythmSystem = null;
        this.animationFrameId = null;
        this.lootCloseHandler = null;
        this.clueBookOpen = false;
        this.handbookTab = 'commissions';
        this.bossTestOpen = false;
        this.devMode = isDevModeEnabled();
        this.currentLocationKey = null;
        this.locationToastRecentKeys = new Map();
        this.locationToastRepeatCooldownMs = 12000;
        this.locationToastTimer = null;
        this.smallLocationHintKey = null;
        this.smallLocationHintRecentKeys = new Map();
        this.smallLocationHintRepeatCooldownMs = 7000;
        this.smallLocationHintTimer = null;
        this.travelCostToastAt = 0;
        this.mapImageCache = new Map();
        this.isLocked = false; // 移動鎖定狀態（事件/戰鬥中鎖定）

        // Bindings
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleMapClick = this.handleMapClick.bind(this);
        this.handleMapPointerMove = this.handleMapPointerMove.bind(this);
        this.handleMapPointerLeave = this.handleMapPointerLeave.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.updateUI = this.updateUI.bind(this);
    }

    init() {
        // Set global reference for adventure item actions
        window.currentAdventureScene = this;
        
        try {
            this.cacheDOM();
            
            // Initialize Canvas
            this.initCanvas();
            
            // Create World Map
            const char = GameManager.getCharacter();
            this.worldMap = new WorldMap(
                char,
                60, 20, 30,
                this.canvas.width, this.canvas.height
            );

            this.updateUI();
            // Build static layer cache for map (improves render performance)
            this.staticCanvas = null;
            this.staticCtx = null;
            this.staticDirty = true;
            this.buildStaticLayer && this.buildStaticLayer();
            this.renderMap();
            this.bindEvents();
        } catch (error) {
            console.error('Error initializing Adventure Scene:', error);
        }
    }

    cleanup() {
        // Cancel any running animation frames
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        // Stop rhythm system if active
        if (this.rhythmSystem) {
            this.rhythmSystem.stop();
            this.rhythmSystem = null;
        }
        if (this.offhandRhythmSystem) {
            this.offhandRhythmSystem.stop();
            this.offhandRhythmSystem = null;
        }

        // Clean up battle
        if (this.currentBattle) {
            this.currentBattle.battleEnded = true;
            this.currentBattle = null;
        }
        
        if (this._invUpdateRAF) {
            cancelAnimationFrame(this._invUpdateRAF);
            this._invUpdateRAF = null;
        }

        if (this.locationToastTimer) {
            clearTimeout(this.locationToastTimer);
            this.locationToastTimer = null;
        }
        if (this.smallLocationHintTimer) {
            clearTimeout(this.smallLocationHintTimer);
            this.smallLocationHintTimer = null;
        }

        this.unbindEvents();
    }

    cacheDOM() {
        this.dom = {
            canvas: this.container.querySelector('#world-map-canvas'),
            playerLevel: this.container.querySelector('#adv-player-level'),
            playerHp: this.container.querySelector('#adv-player-hp'),
            playerGold: this.container.querySelector('#adv-player-gold'),
            playerFatigue: this.container.querySelector('#adv-player-fatigue'),
            locationToast: this.container.querySelector('#location-toast'),
            locationToastImage: this.container.querySelector('#location-toast-image'),
            locationToastKicker: this.container.querySelector('#location-toast-kicker'),
            locationToastTitle: this.container.querySelector('#location-toast-title'),
            locationToastDescription: this.container.querySelector('#location-toast-description'),
            smallLocationHint: this.container.querySelector('#small-location-hint'),
            smallLocationHintKicker: this.container.querySelector('#small-location-hint-kicker'),
            smallLocationHintTitle: this.container.querySelector('#small-location-hint-title'),
            smallLocationHintText: this.container.querySelector('#small-location-hint-text'),
            btnToggleClueBook: this.container.querySelector('#btn-toggle-clue-book'),
            btnCloseClueBook: this.container.querySelector('#btn-close-clue-book'),
            clueBookPanel: this.container.querySelector('#clue-book-panel'),
            clueBookSummary: this.container.querySelector('#clue-book-summary'),
            clueBookContent: this.container.querySelector('#clue-book-content'),
            clueBookTabs: this.container.querySelector('#clue-book-tabs'),
            clueBookTabButtons: Array.from(this.container.querySelectorAll('[data-adventure-handbook-tab]')),
            clueBookTabCounts: Array.from(this.container.querySelectorAll('[data-adventure-handbook-count]')),
            btnToggleBossTest: this.container.querySelector('#btn-toggle-boss-test'),
            btnCloseBossTest: this.container.querySelector('#btn-close-boss-test'),
            bossTestPanel: this.container.querySelector('#boss-test-panel'),
            bossTestContent: this.container.querySelector('#boss-test-content'),
            
            // Battle Modal
            battleModal: this.container.querySelector('#battle-modal'),
            battleBody: this.container.querySelector('#battle-modal .battle-body'),
            attackBtn: this.container.querySelector('#btn-attack'),
            fleeBtn: this.container.querySelector('#btn-flee'),
            buffIndicators: this.container.querySelector('#buff-indicators'),
            
            // Event Modal (新增)
            eventModal: this.container.querySelector('#event-modal'),
            eventIcon: this.container.querySelector('#event-icon'),
            eventTitle: this.container.querySelector('#event-title'),
            eventDescription: this.container.querySelector('#event-description'),
            eventResult: this.container.querySelector('#event-result'),
            btnCloseEvent: this.container.querySelector('#btn-close-event'),
            
            // Story Event Modal (Slay the Spire 風格)
            storyEventModal: this.container.querySelector('#story-event-modal'),
            storyEventIcon: this.container.querySelector('#story-event-icon'),
            storyEventTitle: this.container.querySelector('#story-event-title'),
            storyEventType: this.container.querySelector('#story-event-type'),
            storyEventDescription: this.container.querySelector('#story-event-description'),
            storyEventChoices: this.container.querySelector('#story-event-choices'),
            storyEventResult: this.container.querySelector('#story-event-result'),
            storyResultMessages: this.container.querySelector('#story-result-messages'),
            btnCloseStoryEvent: this.container.querySelector('#btn-close-story-event'),
            
            // Loot Modal
            lootModal: this.container.querySelector('#loot-modal'),
            lootItems: this.container.querySelector('#loot-items'),
            lootCloseBtn: this.container.querySelector('#btn-close-loot'),
            
            // Inventory Modal
            btnOpenInventory: this.container.querySelector('#btn-open-inventory'),
            inventoryModal: this.container.querySelector('#inventory-modal'),
            inventoryList: this.container.querySelector('#adventure-inventory-list'),
            inventoryCapacity: this.container.querySelector('#inventory-capacity'),
            btnCloseInventory: this.container.querySelector('#btn-close-inventory'),
            
            // Equipment Slots in Inventory
            equipmentSlots: this.container.querySelector('#adv-equipment-slots'),
            slotWeapon: this.container.querySelector('#adv-slot-weapon'),
            slotArmor: this.container.querySelector('#adv-slot-armor'),
            slotAccessory: this.container.querySelector('#adv-slot-accessory'),
            
            // Item Detail Modal (for equipment interaction in inventory)
            itemModal: this.container.querySelector('#adv-item-detail-modal'),
            btnCloseItemModal: this.container.querySelector('#btn-close-adv-item-modal')
        };
        this.applyDevVisibility();

        if (!this.dom.canvas) {
            throw new Error('Canvas element not found in Adventure Scene');
        }
        
        this.canvas = this.dom.canvas;
        this.ctx = this.canvas.getContext('2d');
    }

    initCanvas() {
        const { width: containerWidth, height: containerHeight } = this.getMapViewportSize();
        this.canvas.width = containerWidth;
        this.canvas.height = containerHeight;
    }

    getMapViewportSize() {
        const mapContainer = this.container.querySelector('#map-container');
        const rect = mapContainer?.getBoundingClientRect?.();
        const width = Math.max(320, Math.floor(rect?.width || window.innerWidth));
        const height = Math.max(320, Math.floor(rect?.height || (window.innerHeight - 180)));
        return { width, height };
    }

    bindEvents() {
        document.addEventListener('keydown', this.handleKeyPress);
        window.addEventListener('resize', this.handleResize);

        if (this.canvas) {
            this.canvas.addEventListener('click', this.handleMapClick);
            this.canvas.addEventListener('mousemove', this.handleMapPointerMove);
            this.canvas.addEventListener('mouseleave', this.handleMapPointerLeave);
        }

        // Inventory button
        if (this.dom.btnOpenInventory) {
            this.dom.btnOpenInventory.addEventListener('click', () => {
                this.openInventoryModal();
            });
        }

        if (this.dom.btnCloseInventory) {
            this.dom.btnCloseInventory.addEventListener('click', () => {
                this.closeInventoryModal();
            });
        }

        // Inventory list virtualization: delegate scroll/click handling
        if (this.dom.inventoryList) {
            // Scroll handler for virtualization
            this.dom.inventoryList.addEventListener('scroll', () => {
                if (this._invUpdateRAF) return;
                this._invUpdateRAF = requestAnimationFrame(() => {
                    this._invUpdateRAF = null;
                    if (typeof this.updateVisibleInventoryItems === 'function') this.updateVisibleInventoryItems();
                });
            });

            // Click delegation
            this.dom.inventoryList.addEventListener('click', (e) => {
                const itemEl = e.target.closest && e.target.closest('.inventory-item');
                if (!itemEl) return;
                const instanceId = itemEl.dataset.instanceId;
                if (!instanceId) return;
                const stack = GameManager.state.inventory.find(s => s.instanceId === instanceId);
                if (stack) this.showInventoryItemModal(stack);
            });
        }
        
        // Item Detail Modal close button
        if (this.dom.btnCloseItemModal) {
            this.dom.btnCloseItemModal.addEventListener('click', () => {
                this.closeItemDetailModal();
            });
        }
        
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
        
        // Event modal close button (新增)
        if (this.dom.btnCloseEvent) {
            this.dom.btnCloseEvent.addEventListener('click', () => {
                this.closeEventModal();
            });
        }
        
        // Story Event modal close button
        if (this.dom.btnCloseStoryEvent) {
            this.dom.btnCloseStoryEvent.addEventListener('click', () => {
                this.closeStoryEventModal();
            });
        }
        
        // 新：行動卡片事件
        const weaponCard = this.container.querySelector('#action-weapon');
        const offhandCard = this.container.querySelector('#action-offhand');
        const potionCard = this.container.querySelector('#action-potion');
        const fleeCard = this.container.querySelector('#action-flee');

        if (weaponCard) weaponCard.addEventListener('click', () => this.handleAttackClick());
        if (offhandCard) offhandCard.addEventListener('click', () => this.handleOffhandAttackClick());
        if (potionCard) potionCard.addEventListener('click', () => this.handlePotionUse());
        if (fleeCard) fleeCard.addEventListener('click', () => this.handleFleeClick());
        
        // 保留舊按鈕兼容性
        if (this.dom.attackBtn) this.dom.attackBtn.addEventListener('click', () => this.handleAttackClick());
        
        const returnBtn = this.container.querySelector('#btn-return-to-lobby');
        if (returnBtn) returnBtn.addEventListener('click', () => this.app.navigateTo('lobby'));

        if (this.dom.btnToggleClueBook) {
            this.dom.btnToggleClueBook.addEventListener('click', () => this.toggleClueBook());
        }

        if (this.dom.btnCloseClueBook) {
            this.dom.btnCloseClueBook.addEventListener('click', () => this.toggleClueBook(false));
        }

        if (this.dom.clueBookTabButtons?.length) {
            this.dom.clueBookTabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    this.selectAdventureHandbookTab(button.dataset.adventureHandbookTab);
                });
            });
        }

        if (this.devMode && this.dom.btnToggleBossTest) {
            this.dom.btnToggleBossTest.addEventListener('click', () => this.toggleBossTestPanel());
        }

        if (this.devMode && this.dom.btnCloseBossTest) {
            this.dom.btnCloseBossTest.addEventListener('click', () => this.toggleBossTestPanel(false));
        }

        if (this.devMode && this.dom.bossTestPanel) {
            this.dom.bossTestPanel.addEventListener('click', event => this.handleBossTestPanelClick(event));
        }
        
        if (this.dom.fleeBtn) this.dom.fleeBtn.addEventListener('click', () => this.handleFleeClick());
        if (this.dom.lootCloseBtn) this.dom.lootCloseBtn.addEventListener('click', () => {
            if (!this.lootCloseHandler) this.closeBattleResult();
        });
    }

    unbindEvents() {
        document.removeEventListener('keydown', this.handleKeyPress);
        window.removeEventListener('resize', this.handleResize);
        if (this.canvas) {
            this.canvas.removeEventListener('click', this.handleMapClick);
            this.canvas.removeEventListener('mousemove', this.handleMapPointerMove);
            this.canvas.removeEventListener('mouseleave', this.handleMapPointerLeave);
            this.canvas.style.cursor = 'default';
        }
    }

    handleResize() {
        if (this.canvas && this.worldMap) {
            const { width: containerWidth, height: containerHeight } = this.getMapViewportSize();
            this.canvas.width = containerWidth;
            this.canvas.height = containerHeight;
            
            this.worldMap.screenWidth = containerWidth;
            this.worldMap.screenHeight = containerHeight;
            this.worldMap.updateCamera();
            // Mark static layer dirty and rebuild
            this.staticDirty = true;
            this.buildStaticLayer && this.buildStaticLayer();
            this.renderMap();
        }
    }

    getMapCellFromPointer(event) {
        if (!this.canvas || !this.worldMap) return null;

        const rect = this.canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return null;

        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const canvasX = (event.clientX - rect.left) * scaleX;
        const canvasY = (event.clientY - rect.top) * scaleY;
        const mapX = Math.floor((canvasX + this.worldMap.cameraOffsetX) / this.worldMap.gridSize);
        const mapY = Math.floor((canvasY + this.worldMap.cameraOffsetY) / this.worldMap.gridSize);

        if (mapX < 0 || mapY < 0 || mapX >= this.worldMap.cols || mapY >= this.worldMap.rows) {
            return null;
        }

        return { x: mapX, y: mapY };
    }

    getStepTowardMapCell(target) {
        if (!target || !this.worldMap) return null;

        const dx = target.x - this.worldMap.playerPos.x;
        const dy = target.y - this.worldMap.playerPos.y;
        if (dx === 0 && dy === 0) return null;

        if (Math.abs(dx) >= Math.abs(dy)) {
            return { dx: Math.sign(dx), dy: 0 };
        }

        return { dx: 0, dy: Math.sign(dy) };
    }

    isMapCellActionable(target) {
        return Boolean(target && this.getStepTowardMapCell(target));
    }

    isTypingTarget(target) {
        if (!target || typeof target.closest !== 'function') return false;
        return Boolean(target.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]'));
    }

    isElementVisible(element) {
        if (!element || element.hidden) return false;
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden';
    }

    closeKeyboardOverlay() {
        if (window.ItemDetailModal?.isOpen?.() && typeof window.ItemDetailModal.close === 'function') {
            window.ItemDetailModal.close();
            return true;
        }

        if (this.dom.itemModal?.classList.contains('active')) {
            this.closeItemDetailModal?.();
            return true;
        }

        if (this.isElementVisible(this.dom.inventoryModal)) {
            this.closeInventoryModal?.();
            return true;
        }

        if (this.clueBookOpen) {
            this.toggleClueBook(false);
            return true;
        }

        if (this.dom.bossTestPanel?.classList.contains('is-open')) {
            this.toggleBossTestPanel?.(false);
            return true;
        }

        return false;
    }

    handleKeyboardInvestigate() {
        if (!this.worldMap || this.isLocked) return false;

        const cell = this.worldMap.getCurrentCell?.();
        if (!cell) return false;

        const zone = cell.zone || this.worldMap.getCurrentZone?.();

        if (cell.type === 'landmark') {
            this.worldMap.currentLandmark = {
                id: cell.landmarkId,
                data: cell.landmarkData,
                zone
            };
            this.hideSmallLocationHint();
            this.isLocked = true;
            this.handleLandmarkInteraction();
            return true;
        }

        if (cell.type === 'dungeon') {
            this.worldMap.currentDungeon = {
                type: cell.dungeonType,
                data: cell.dungeonData
            };
            this.hideSmallLocationHint();
            this.isLocked = true;
            this.handleDungeonEntrance();
            return true;
        }

        if (cell.type === 'rift') {
            this.worldMap.currentRift = cell.riftData || { zone };
            if (zone && this.worldMap.unlockedZones) {
                this.worldMap.unlockedZones.add(zone);
                this.worldMap._saveMapState?.();
            }
            this.hideSmallLocationHint();
            this.isLocked = true;
            this.handleRiftInteraction();
            return true;
        }

        if (cell.type === 'home') {
            if (!this.worldMap.hasLeftHome) {
                showGlobalToast('城鎮在身後', '先踏出城門，回程時再按 F 返回大廳。', 'info', { duration: 1800 });
                return false;
            }
            this.isLocked = true;
            this.handleReturnHome();
            return true;
        }

        const nearby = this.getNearbyLandmarkHint?.(1);
        if (nearby) {
            this.showSmallLocationHint(nearby);
            showGlobalToast('靠近地點', '再往地點走一步後按 F 調查。', 'info', { duration: 1800 });
            return false;
        }

        showGlobalToast('沒有可調查的事物', '附近沒有能立刻調查的地點。', 'info', { duration: 1600 });
        return false;
    }

    handleMapClick(event) {
        if (this.isLocked || !this.worldMap) return;
        if (this.dom.battleModal?.style.display === 'flex') return;

        const target = this.getMapCellFromPointer(event);
        const step = this.getStepTowardMapCell(target);
        if (!step) return;

        event.preventDefault();
        this.movePlayerBy(step.dx, step.dy);
    }

    handleMapPointerMove(event) {
        if (!this.canvas) return;
        if (this.isLocked || !this.worldMap) {
            this.canvas.style.cursor = 'default';
            return;
        }

        const target = this.getMapCellFromPointer(event);
        this.canvas.style.cursor = this.isMapCellActionable(target) ? 'pointer' : 'default';
    }

    handleMapPointerLeave() {
        if (this.canvas) {
            this.canvas.style.cursor = 'default';
        }
    }

    movePlayerBy(dx, dy) {
        if (this.isLocked || !this.worldMap || (dx === 0 && dy === 0)) return;

        const travelZone = this.worldMap.getCurrentZone?.() || 'low';
        if (!this.hasAdventureTravelCost(travelZone)) return;

        const before = { ...this.worldMap.playerPos };
        const result = this.worldMap.movePlayer(dx, dy);
        const moved = before.x !== this.worldMap.playerPos.x || before.y !== this.worldMap.playerPos.y;
        if (moved && result !== 'home') {
            this.consumeAdventureTravelCost(travelZone);
        }
        this.handleMapMoveResult(result);
    }

    hasAdventureTravelCost(zone) {
        const cost = ADVENTURE_TRAVEL_COSTS[zone] || ADVENTURE_TRAVEL_COSTS.low;
        const fatigueCost = Math.max(0, Number(cost?.fatigue) || 0);
        if (fatigueCost <= 0) return true;
        return true;
    }

    consumeAdventureTravelCost(zone) {
        const cost = ADVENTURE_TRAVEL_COSTS[zone] || ADVENTURE_TRAVEL_COSTS.low;
        if (!cost) return;

        const before = GameManager.getAdventureFatigueStatus?.({ recover: false });
        GameManager.consumeAdventureFatigue?.(cost.fatigue || 0);
        const after = GameManager.getAdventureFatigueStatus?.({ recover: false });
        if (after?.depleted && before?.current > 0) {
            const now = Date.now();
            if (now - this.travelCostToastAt > 5000) {
                this.travelCostToastAt = now;
                showGlobalToast('疲勞耗盡', '角色進入虛弱狀態，全屬性暫時降低 20%。', 'warning');
            }
        }
    }

    handleMapMoveResult(result) {
        this.renderMap();
        this.updateUI();

        const zone = this.worldMap.getCurrentZone();
        questManager.updateProgress(ObjectiveType.EXPLORE, zone, 1);
        this.showWorldDiscovery(worldStoryManager.recordZoneExploration(zone, {
            source: 'adventure_map'
        }));

        if (result) {
            this.hideSmallLocationHint();
        }

        if (result === 'battle') {
            this.isLocked = true;
            this.startBattle();
        } else if (result === 'event') {
            this.isLocked = true;
            this.handleMapEvent();
        } else if (result === 'landmark') {
            this.isLocked = true;
            this.handleLandmarkInteraction();
        } else if (result === 'dungeon') {
            this.isLocked = true;
            this.handleDungeonEntrance();
        } else if (result === 'home') {
            this.isLocked = true;
            this.handleReturnHome();
        } else if (result === 'rift') {
            this.isLocked = true;
            this.handleRiftInteraction();
        }
    }

    handleKeyPress(event) {
        if (this.isTypingTarget(event.target)) return;

        const key = event.key?.toLowerCase?.();

        // If modal is open, handle battle keys or ignore
        if (this.dom.battleModal?.style.display === 'flex') {
            if (event.code === 'Space' || key === 'a') {
                event.preventDefault();
                this.handleAttackClick();
            } else if (key === 's') {
                event.preventDefault();
                this.handleOffhandAttackClick();
            } else if (key === 'd') {
                event.preventDefault();
                this.handlePotionUse();
            } else if (key === 'f') {
                event.preventDefault();
                this.handleFleeClick();
            }
            return;
        }
        
        // 如果被鎖定（事件/副本入口彈窗開啟時），不允許移動
        if (key === 'escape') {
            if (this.closeKeyboardOverlay()) {
                event.preventDefault();
            }
            return;
        }

        if (key === 'j') {
            if (this.dom.btnToggleClueBook && !this.dom.btnToggleClueBook.disabled) {
                event.preventDefault();
                this.toggleClueBook();
            }
            return;
        }

        if (key === 'i' || key === 'b') {
            event.preventDefault();
            if (this.isElementVisible(this.dom.inventoryModal)) {
                this.closeInventoryModal?.();
            } else {
                this.openInventoryModal?.();
            }
            return;
        }

        if (this.isLocked) {
            return;
        }

        if (key === 'f') {
            event.preventDefault();
            this.handleKeyboardInvestigate();
            return;
        }

        let dx = 0;
        let dy = 0;
        
        switch (key) {
            case 'arrowup': case 'w': dy = -1; break;
            case 'arrowdown': case 's': dy = 1; break;
            case 'arrowleft': case 'a': dx = -1; break;
            case 'arrowright': case 'd': dx = 1; break;
            default: return;
        }
        
        if (dx !== 0 || dy !== 0) {
            event.preventDefault();
            this.movePlayerBy(dx, dy);
        }
    }

    updateUI() {
        const char = GameManager.getCharacter();
        if (!char) {
            console.error('Character not found in GameManager');
            return;
        }
        
        if (this.dom.playerLevel) {
            this.dom.playerLevel.textContent = char.level || 1;
        }
        if (this.dom.playerHp) {
            const currentHP = char.hp || char.currentHP || 100;
            const maxHP = char.maxHp || 100;
            this.dom.playerHp.textContent = `${currentHP}/${maxHP}`;
        }
        if (this.dom.playerGold) {
            this.dom.playerGold.textContent = char.gold || 0;
        }
        if (this.dom.playerFatigue) {
            const fatigue = GameManager.getAdventureFatigueStatus?.({ recover: false });
            if (fatigue) this.dom.playerFatigue.textContent = `${fatigue.current}/${fatigue.max}`;
        }
        
        this.updateWorldNarrativePanel();
    }

    normalizeCanvasAssetSrc(src = '') {
        return String(src || '')
            .trim()
            .replace(/\\/g, '/')
            .replace(/^src\//, '/src/');
    }

    getCanvasImage(src = '') {
        const normalized = this.normalizeCanvasAssetSrc(src);
        if (!normalized) return null;

        const cached = this.mapImageCache.get(normalized);
        if (cached) {
            return cached.complete && cached.naturalWidth > 0 ? cached : null;
        }

        const image = new Image();
        image.onload = () => {
            if (normalized.includes('/backgrounds/')) {
                this.staticDirty = true;
                this.buildStaticLayer?.();
            }
            this.renderMap();
        };
        image.onerror = () => this.mapImageCache.delete(normalized);
        this.mapImageCache.set(normalized, image);
        image.src = normalized;
        return null;
    }

    drawCanvasStretchedImage(ctx, image, x, y, width, height, alpha = 1) {
        if (!ctx || !image || !image.complete || image.naturalWidth <= 0) return false;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.drawImage(image, x, y, width, height);
        ctx.restore();
        return true;
    }

    drawCanvasImageMarker(ctx, src, cx, cy, size, options = {}) {
        const image = this.getCanvasImage(src);
        if (!image) return false;

        const radius = size / 2;
        ctx.save();
        ctx.shadowColor = options.shadowColor || 'rgba(0, 0, 0, 0.35)';
        ctx.shadowBlur = options.shadowBlur ?? 10;
        ctx.fillStyle = options.background || 'rgba(7, 12, 18, 0.82)';
        ctx.strokeStyle = options.stroke || 'rgba(216, 181, 95, 0.72)';
        ctx.lineWidth = options.lineWidth || 2;
        ctx.beginPath();
        ctx.roundRect(cx - radius, cy - radius, size, size, Math.max(6, size * 0.18));
        ctx.fill();
        ctx.stroke();
        ctx.clip();
        ctx.drawImage(image, cx - radius, cy - radius, size, size);
        ctx.restore();
        return true;
    }

    getLandmarkImage(landmarkOrId = null, options = {}) {
        const landmark = typeof landmarkOrId === 'object' && landmarkOrId
            ? landmarkOrId
            : { id: landmarkOrId };
        if (options.full) {
            return landmark?.fullImage
                || getGeneratedLandmarkFullImage(landmark?.id)
                || landmark?.image
                || getGeneratedLandmarkImage(landmark?.id);
        }
        return landmark?.image || getGeneratedLandmarkImage(landmark?.id);
    }

    getLandmarkVisitedFlag(landmarkId) {
        return worldStoryManager.getLandmarkVisitedFlag?.(landmarkId)
            || `world.landmark.${landmarkId}.visited`;
    }

    isLandmarkDiscovered(landmarkId) {
        if (!landmarkId) return false;
        const currentLandmarkId = this.worldMap?.getCurrentLandmark?.()?.id;
        if (currentLandmarkId === landmarkId) return true;
        return Boolean(GameManager.getFlag(this.getLandmarkVisitedFlag(landmarkId)));
    }

    drawUnknownLandmarkMarker(ctx, cx, cy, size) {
        if (!ctx) return;
        const radius = size / 2;
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.72)';
        ctx.shadowBlur = 12;
        ctx.fillStyle = 'rgba(2, 4, 8, 0.96)';
        ctx.strokeStyle = 'rgba(229, 231, 235, 0.34)';
        ctx.lineWidth = Math.max(1.5, size * 0.07);
        ctx.beginPath();
        ctx.roundRect(cx - radius, cy - radius, size, size, Math.max(3, size * 0.12));
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.font = `900 ${Math.max(16, Math.floor(size * 0.64))}px Rajdhani, Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', cx, cy + size * 0.02);
        ctx.restore();
    }

    updateWorldNarrativePanel(override = null) {
        if (!this.worldMap) return;

        const currentCell = this.worldMap.getCurrentCell?.();
        const landmarkId = override?.landmark?.id || currentCell?.landmarkId || null;
        const zoneId = override?.zoneId || currentCell?.zone || this.worldMap.getCurrentZone?.();
        const narrative = override?.narrative || worldStoryManager.getNarrative({ zoneId, landmarkId });
        const locationKey = `${zoneId || 'unknown'}:${landmarkId || 'zone'}`;

        if (locationKey !== this.currentLocationKey) {
            this.currentLocationKey = locationKey;
            this.showLocationToast(narrative, {
                force: Boolean(override),
                locationKey,
                zoneId
            });
        }
        this.renderClueBook();
        this.renderBossTestPanel();
        this.updateSmallLocationHint();
    }

    getZoneRiskLine(zoneId) {
        const lines = {
            low: '風險很低，適合確認路線與收集基礎材料。',
            medium: '這一帶開始有穩定遭遇，請確認生命與藥水。',
            high: '高威脅區會出現更強敵人與首領線索，撤退前先看好回城路。',
            death: '死亡區會壓迫補給與裝備耐久，建議準備抗性與足夠藥水。',
            boss: '黑焰邊境接近終局事件，進入前請確認裝備、藥水與首領痕跡。'
        };
        return lines[zoneId] || '';
    }

    showLocationToast(narrative, options = {}) {
        if (!this.dom.locationToast) return;

        const locationKey = options.locationKey || `${narrative?.title || 'unknown'}:${narrative?.description || ''}`;
        const now = Date.now();
        const lastShownAt = this.locationToastRecentKeys.get(locationKey) || 0;
        if (!options.force && now - lastShownAt < this.locationToastRepeatCooldownMs) {
            return;
        }

        this.locationToastRecentKeys.set(locationKey, now);
        for (const [key, shownAt] of this.locationToastRecentKeys.entries()) {
            if (now - shownAt > this.locationToastRepeatCooldownMs * 2) {
                this.locationToastRecentKeys.delete(key);
            }
        }

        if (this.dom.locationToastKicker) {
            this.dom.locationToastKicker.textContent = narrative.landmark ? '發現地點' : '進入區域';
        }
        if (this.dom.locationToastImage) {
            const image = narrative.landmark ? this.getLandmarkImage(narrative.landmark, { full: true }) : '';
            this.dom.locationToast.classList.toggle('has-location-image', Boolean(image));
            this.dom.locationToastImage.style.backgroundImage = image
                ? `url("${this.normalizeCanvasAssetSrc(image)}")`
                : '';
            this.dom.locationToastImage.setAttribute('aria-hidden', 'true');
        }
        if (this.dom.locationToastTitle) {
            this.dom.locationToastTitle.textContent = narrative.title || '未知地點';
        }
        if (this.dom.locationToastDescription) {
            const riskLine = this.getZoneRiskLine(options.zoneId);
            const description = narrative.description || '';
            this.dom.locationToastDescription.textContent = riskLine
                ? `${description} ${riskLine}`.trim()
                : description;
        }

        this.dom.locationToast.classList.remove('is-visible');
        void this.dom.locationToast.offsetWidth;
        this.dom.locationToast.classList.add('is-visible');

        if (this.locationToastTimer) clearTimeout(this.locationToastTimer);
        this.locationToastTimer = setTimeout(() => {
            this.dom.locationToast?.classList.remove('is-visible');
            this.locationToastTimer = null;
        }, 3200);
    }

    getNearbyLandmarkHint(radius = 2) {
        if (!this.worldMap?.playerPos || !Array.isArray(this.worldMap.landmarks)) return null;

        const currentCell = this.worldMap.getCurrentCell?.();
        if (currentCell?.type === 'landmark') return null;

        const player = this.worldMap.playerPos;
        const candidates = this.worldMap.landmarks
            .map(site => {
                const cell = this.worldMap.mapData?.[site.y]?.[site.x];
                const landmark = cell?.landmarkData;
                if (!landmark) return null;
                const distance = Math.abs(site.x - player.x) + Math.abs(site.y - player.y);
                const hintRadius = Number.isFinite(landmark.hintRadius)
                    ? Math.max(1, landmark.hintRadius)
                    : radius;
                if (distance <= 0 || distance > hintRadius) return null;
                return { site, landmark, distance };
            })
            .filter(Boolean)
            .sort((a, b) => a.distance - b.distance || a.site.y - b.site.y || a.site.x - b.site.x);

        return candidates[0] || null;
    }

    updateSmallLocationHint() {
        if (!this.dom.smallLocationHint || this.isLocked) return;

        const hint = this.getNearbyLandmarkHint();
        if (!hint) {
            this.hideSmallLocationHint();
            return;
        }

        this.showSmallLocationHint(hint);
    }

    showSmallLocationHint(hint) {
        const { landmark, distance } = hint || {};
        if (!landmark || !this.dom.smallLocationHint) return;

        const key = landmark.id;
        const now = Date.now();
        const lastShownAt = this.smallLocationHintRecentKeys.get(key) || 0;
        const isSameVisible = this.smallLocationHintKey === key && this.dom.smallLocationHint.classList.contains('is-visible');
        if (isSameVisible) return;
        if (now - lastShownAt < this.smallLocationHintRepeatCooldownMs) return;

        this.smallLocationHintKey = key;
        this.smallLocationHintRecentKeys.set(key, now);
        for (const [recentKey, shownAt] of this.smallLocationHintRecentKeys.entries()) {
            if (now - shownAt > this.smallLocationHintRepeatCooldownMs * 2) {
                this.smallLocationHintRecentKeys.delete(recentKey);
            }
        }

        if (this.dom.smallLocationHintKicker) {
            this.dom.smallLocationHintKicker.textContent = distance <= 1 ? '近在眼前' : '附近地點';
        }
        const isDiscovered = this.isLandmarkDiscovered(landmark.id);
        if (this.dom.smallLocationHintTitle) {
            const image = isDiscovered ? this.getLandmarkImage(landmark) : '';
            this.dom.smallLocationHintTitle.innerHTML = image
                ? `<span class="small-location-hint-image"><img src="${escapeHtml(image)}" alt="${escapeHtml(landmark.name || '')}"></span><span>${escapeHtml(landmark.name || '未知地點')}</span>`
                : `<span class="small-location-hint-image is-unknown" aria-hidden="true">?</span><span>${isDiscovered ? escapeHtml(landmark.name || '未知地點') : '未知路標'}</span>`;
        }
        if (this.dom.smallLocationHintText) {
            const hintText = isDiscovered
                ? (landmark.mapHint || landmark.arrival || '再靠近即可調查。')
                : '前方有尚未記錄的路標。';
            const actionHint = distance <= 1 ? '按 F 調查。' : '靠近後按 F 調查。';
            this.dom.smallLocationHintText.textContent = `${hintText} ${actionHint}`;
        }

        this.dom.smallLocationHint.classList.remove('is-visible');
        void this.dom.smallLocationHint.offsetWidth;
        this.dom.smallLocationHint.classList.add('is-visible');

        if (this.smallLocationHintTimer) clearTimeout(this.smallLocationHintTimer);
        this.smallLocationHintTimer = setTimeout(() => {
            this.hideSmallLocationHint({ keepCooldown: true });
        }, 3600);
    }

    hideSmallLocationHint(options = {}) {
        if (!this.dom?.smallLocationHint) return;
        this.dom.smallLocationHint.classList.remove('is-visible');
        if (!options.keepCooldown) {
            this.smallLocationHintKey = null;
        }
        if (this.smallLocationHintTimer) {
            clearTimeout(this.smallLocationHintTimer);
            this.smallLocationHintTimer = null;
        }
    }

    toggleClueBook(forceOpen = null) {
        this.clueBookOpen = forceOpen === null ? !this.clueBookOpen : Boolean(forceOpen);
        audioManager.play(this.clueBookOpen ? 'book-open' : 'book-close', {
            throttleKey: 'adventure-clue-book-toggle',
            throttleMs: 180
        });
        if (this.dom.clueBookPanel) {
            this.dom.clueBookPanel.classList.toggle('is-open', this.clueBookOpen);
            this.dom.clueBookPanel.setAttribute('aria-hidden', String(!this.clueBookOpen));
        }
        if (this.dom.btnToggleClueBook) {
            this.dom.btnToggleClueBook.classList.toggle('is-open', this.clueBookOpen);
            this.dom.btnToggleClueBook.classList.remove('has-new');
            this.dom.btnToggleClueBook.setAttribute('aria-expanded', String(this.clueBookOpen));
        }
        this.renderClueBook();
    }

    renderClueBook() {
        if (!this.dom.clueBookContent && !this.dom.btnToggleClueBook) return;

        const notebook = worldStoryManager.getNotebookData();
        const records = this.getAdventureHandbookRecords(notebook);
        const counts = this.getAdventureHandbookCountMap(records);
        const hasContent = Object.values(counts).some(count => count > 0);
        const activeTabHasContent = (records[this.handbookTab] || []).length > 0;
        if (!activeTabHasContent) {
            this.handbookTab = Object.keys(records).find(tabId => records[tabId].length > 0) || this.handbookTab;
        }

        if (this.dom.btnToggleClueBook) {
            this.dom.btnToggleClueBook.classList.toggle('is-available', hasContent);
            this.dom.btnToggleClueBook.disabled = !hasContent;
            this.dom.btnToggleClueBook.setAttribute('aria-hidden', String(!hasContent));
        }
        if (!hasContent && this.clueBookOpen) {
            this.toggleClueBook(false);
        }
        if (this.dom.clueBookSummary) {
            this.dom.clueBookSummary.textContent = '手札只整理你已經知道的事；完整內容可回城到書記小屋翻閱。';
        }
        if (this.dom.clueBookTabButtons?.length) {
            this.dom.clueBookTabButtons.forEach(button => {
                const tabId = button.dataset.adventureHandbookTab;
                const isActive = tabId === this.handbookTab;
                button.classList.toggle('is-active', isActive);
                button.setAttribute('aria-selected', String(isActive));
                button.disabled = !counts[tabId];
            });
        }
        if (this.dom.clueBookTabCounts?.length) {
            this.dom.clueBookTabCounts.forEach(node => {
                const tabId = node.dataset.adventureHandbookCount;
                node.textContent = String(counts[tabId] || 0);
            });
        }
        if (!this.dom.clueBookContent) return;

        const tabRecords = records[this.handbookTab] || [];
        this.dom.clueBookContent.innerHTML = tabRecords.length > 0
            ? `<div class="handbook-quick-list">${tabRecords.map(record => this.renderAdventureHandbookRecord(record)).join('')}</div>`
            : this.renderAdventureHandbookEmpty(this.handbookTab);
    }

    selectAdventureHandbookTab(tabId) {
        if (!tabId || this.handbookTab === tabId) return;
        this.handbookTab = tabId;
        this.renderClueBook();
    }

    getAdventureHandbookRecords(notebook = worldStoryManager.getNotebookData()) {
        const visibleQuestGroups = questManager.getVisibleQuests?.() || {};
        const quests = Object.values(visibleQuestGroups)
            .flat()
            .filter(quest => quest?.state?.status && quest.state.status !== QuestStatus.LOCKED);
        const statusRank = {
            [QuestStatus.COMPLETED]: 0,
            [QuestStatus.ACTIVE]: 1,
            [QuestStatus.AVAILABLE]: 2,
            [QuestStatus.FINISHED]: 3
        };
        const activeQuests = quests
            .filter(quest => quest.state.status !== QuestStatus.FINISHED)
            .sort((a, b) => (statusRank[a.state.status] ?? 9) - (statusRank[b.state.status] ?? 9));

        const commissions = activeQuests.slice(0, 8).map(quest => {
            const story = getQuestStory(quest, quest.state);
            const objectiveText = this.getAdventureQuestObjectiveText(quest);
            return {
                key: `quest:${quest.id}`,
                icon: quest.icon || story.speaker?.avatar || '📖',
                kicker: this.formatAdventureQuestStatus(quest.state.status),
                title: story.source || quest.name,
                meta: story.arc || quest.name,
                text: story.current || story.active || story.available || objectiveText || quest.description,
                note: objectiveText
            };
        });

        const boss = (notebook.chains || []).map(chain => {
            const latestClue = [...(chain.clues || [])].sort((a, b) => (b.notebookIndex || 0) - (a.notebookIndex || 0))[0];
            const totalClues = chain.totalClues || chain.clues.length || 1;
            return {
                key: `boss:${chain.id || chain.title}`,
                icon: '☠',
                kicker: `痕跡 ${chain.clues.length}/${totalClues}`,
                title: chain.title,
                meta: chain.method,
                text: latestClue ? latestClue.text : chain.text,
                note: latestClue ? `${this.formatTraceSource(latestClue)}｜${latestClue.lead || '繼續追蹤相關地點。'}` : chain.text
            };
        });

        const journalRecords = getWorldEventJournalRecords()
            .slice(0, 8)
            .map(record => ({
                key: `event:${record.key}`,
                icon: record.icon || '✦',
                kicker: record.roleLabel || '旅途事件',
                title: record.title || '旅途事件',
                meta: record.zoneLabel || '世界見聞',
                text: record.resultSummary || record.description,
                note: record.reflection || record.intent
            }));
        const landmarkRecords = (notebook.landmarks || [])
            .slice(0, 8)
            .map(landmark => ({
                key: `landmark:${landmark.id || landmark.name}`,
                icon: '⌖',
                kicker: '踏查地點',
                title: landmark.name,
                meta: '已到達',
                text: landmark.description || '這個地點已被記進手札。',
                note: '之後的線索會以實際發現順序補進來。'
            }));

        const forge = activeQuests
            .filter(quest => (quest.objectives || []).some(objective => [ObjectiveType.CRAFT, ObjectiveType.ENHANCE].includes(objective.type)))
            .slice(0, 6)
            .map(quest => {
                const story = getQuestStory(quest, quest.state);
                return {
                    key: `forge:${quest.id}`,
                    icon: quest.icon || '⚒',
                    kicker: this.formatAdventureQuestStatus(quest.state.status),
                    title: story.source || quest.name,
                    meta: '鍛造備忘',
                    text: story.current || story.active || quest.description,
                    note: this.getAdventureQuestObjectiveText(quest)
                };
            });

        const town = getTownPlaces()
            .flatMap(place => (place.states || [])
                .filter(state => GameManager.getFlag(state.flag))
                .map(state => ({
                    key: `town:${place.id}:${state.flag}`,
                    icon: place.icon || '⌂',
                    kicker: place.name,
                    title: state.title,
                    meta: place.tag || '城鎮記憶',
                    text: state.text,
                    note: place.description
                })))
            .slice(0, 8);

        return {
            commissions,
            boss,
            world: [...journalRecords, ...landmarkRecords].slice(0, 10),
            forge,
            town
        };
    }

    getAdventureHandbookCountMap(records = {}) {
        return {
            commissions: records.commissions?.length || 0,
            boss: records.boss?.length || 0,
            world: records.world?.length || 0,
            forge: records.forge?.length || 0,
            town: records.town?.length || 0
        };
    }

    formatAdventureQuestStatus(status) {
        const labels = {
            [QuestStatus.AVAILABLE]: '已聽聞',
            [QuestStatus.ACTIVE]: '紀錄中',
            [QuestStatus.COMPLETED]: '可回報',
            [QuestStatus.FINISHED]: '已記錄'
        };
        return labels[status] || '待辨認';
    }

    getAdventureQuestObjectiveText(quest) {
        const objective = (quest.objectives || []).find(item => item?.description) || quest.objectives?.[0];
        return objective?.description || quest.description || '';
    }

    renderAdventureHandbookRecord(record) {
        return `
            <article class="handbook-quick-card">
                <div class="handbook-quick-card-head">
                    <span class="handbook-quick-icon">${escapeHtml(record.icon || '📖')}</span>
                    <div>
                        <span class="handbook-quick-kicker">${escapeHtml(record.kicker || '旅人手札')}</span>
                        <h3>${escapeHtml(record.title || '未命名紀錄')}</h3>
                    </div>
                </div>
                ${record.meta ? `<div class="handbook-quick-meta">${escapeHtml(record.meta)}</div>` : ''}
                <p>${escapeHtml(record.text || '這段紀錄還需要補上更多現場證據。')}</p>
                ${record.note ? `<small>${escapeHtml(record.note)}</small>` : ''}
            </article>
        `;
    }

    renderAdventureHandbookEmpty(tabId) {
        const emptyCopy = {
            commissions: '目前沒有正在推進的委託。回城與居民交談，或在地圖上發現新的狀況後，這裡會留下摘要。',
            boss: '你還沒有取得任何首領痕跡。足跡、異常物件與戰鬥紀錄會依照發現順序補上。',
            world: '尚未記下值得回看的旅途事件。真正改變路線、物資或情報的遭遇會被收在這裡。',
            forge: '目前沒有需要追蹤的鍛造備忘。取得圖紙或接到鍛造相關委託後再回來看。',
            town: '城鎮還沒有留下新的變化。完成主線或支線後，居民與場所的改變會被記錄。'
        };
        return `<div class="handbook-quick-empty">${escapeHtml(emptyCopy[tabId] || '目前沒有紀錄。')}</div>`;
    }

    formatTraceSource(clue) {
        const meta = clue?.meta || {};
        const landmarkId = meta.landmarkId || clue?.context?.landmarkId;
        if (landmarkId) {
            const landmark = getLandmark(landmarkId);
            return `地點調查｜${landmark?.name || landmarkId}`;
        }

        const monsterId = meta.monsterId || clue?.context?.monsterId;
        if (monsterId) return `戰鬥紀錄｜${monsterId}`;

        const source = String(meta.source || clue?.source || '');
        const sourceLabels = {
            adventure_map: '地圖探索',
            landmark: '地點調查',
            zone_explored: '區域探索',
            world_interaction: '特殊互動',
            boss_test_panel: '開發測試',
            battle: '戰鬥紀錄',
            monster_kill: '戰鬥紀錄'
        };
        if (sourceLabels[source]) return sourceLabels[source];
        if (source.startsWith('dialogue')) return '城鎮聽聞';
        return source || '未知來源';
    }

    toggleBossTestPanel(forceOpen = null) {
        if (!this.devMode) return;
        this.bossTestOpen = forceOpen === null ? !this.bossTestOpen : Boolean(forceOpen);
        if (this.dom.bossTestPanel) {
            this.dom.bossTestPanel.classList.toggle('is-open', this.bossTestOpen);
            this.dom.bossTestPanel.setAttribute('aria-hidden', String(!this.bossTestOpen));
        }
        if (this.dom.btnToggleBossTest) {
            this.dom.btnToggleBossTest.classList.toggle('is-open', this.bossTestOpen);
            this.dom.btnToggleBossTest.setAttribute('aria-expanded', String(this.bossTestOpen));
        }
        this.renderBossTestPanel();
    }

    getBossTestDebugState() {
        const char = GameManager.getCharacter();
        const readNumber = (value, fallback = 0) => {
            const number = Number(value);
            return Number.isFinite(number) ? number : fallback;
        };

        return {
            noAmbientEncounters: Boolean(GameManager.getFlag('debug.noAmbientEncounters')),
            noBattles: Boolean(GameManager.getFlag('debug.noBattles')),
            forcedEncounter: GameManager.getFlag('debug.forceNextEncounter') || null,
            level: readNumber(char?.level, 1),
            exp: readNumber(char?.exp),
            maxExp: readNumber(char?.maxExp, 100),
            baseAtk: readNumber(char?.baseAtk),
            baseDef: readNumber(char?.baseDef),
            totalAtk: typeof char?.getTotalAtk === 'function' ? char.getTotalAtk() : readNumber(char?.baseAtk),
            totalDef: typeof char?.getTotalDef === 'function' ? char.getTotalDef() : readNumber(char?.baseDef),
            hp: readNumber(char?.hp ?? char?.currentHP),
            maxHp: readNumber(char?.maxHp ?? char?.maxHP, 1),
            gold: readNumber(char?.gold)
        };
    }

    adjustPlayerTestStat(stat, delta) {
        const char = GameManager.getCharacter();
        if (!char) return null;

        const property = stat === 'def' ? 'baseDef' : 'baseAtk';
        const minimum = stat === 'def' ? 0 : 1;
        char[property] = Math.max(minimum, Math.round((Number(char[property]) || 0) + delta));
        if (typeof char.syncProperties === 'function') char.syncProperties();
        GameManager.markSaveDirty?.('boss-test-panel');
        GameManager.notify('all');
        return char[property];
    }

    healPlayerForTesting() {
        const char = GameManager.getCharacter();
        if (!char) return;
        char.hp = char.maxHp || char.maxHP || char.hp || 1;
        GameManager.markSaveDirty?.('boss-test-panel');
        GameManager.notify('all');
    }

    resetPlayerTestStats() {
        const char = GameManager.getCharacter();
        if (!char) return;
        char.level = 1;
        char.maxHp = typeof char.calculateMaxHp === 'function' ? char.calculateMaxHp() : 120;
        char.maxExp = 100;
        char.exp = 0;
        char.baseAtk = 5;
        char.baseDef = 2;
        char.hp = char.maxHp || char.maxHP || 120;
        if (typeof char.syncProperties === 'function') char.syncProperties();
        GameManager.markSaveDirty?.('boss-test-panel');
        GameManager.notify('all');
    }

    setPlayerTestLevel(level) {
        const char = GameManager.getCharacter();
        if (!char) return null;

        const nextLevel = Math.max(1, Math.min(99, Math.round(Number(level) || 1)));
        char.level = nextLevel;
        char.maxHp = typeof char.calculateMaxHp === 'function' ? char.calculateMaxHp() : 100 + nextLevel * 20;
        char.hp = char.maxHp;
        char.maxExp = Math.floor(100 * Math.pow(1.2, nextLevel - 1));
        char.exp = 0;
        if (typeof char.syncProperties === 'function') char.syncProperties();
        GameManager.markSaveDirty?.('boss-test-panel');
        GameManager.notify('all');
        return nextLevel;
    }

    adjustPlayerTestLevel(delta) {
        const char = GameManager.getCharacter();
        return this.setPlayerTestLevel((Number(char?.level) || 1) + delta);
    }

    getTestZone(zone) {
        if (zone && zone !== 'current') return zone;
        return this.worldMap?.getCurrentZone?.() || 'low';
    }

    triggerTestMonster(zone) {
        const targetZone = this.getTestZone(zone);
        if (!this.worldMap?.createRandomMonsterEncounter?.(targetZone)) return null;
        this.isLocked = true;
        this.toggleBossTestPanel(false);
        this.startBattle();
        return targetZone;
    }

    triggerTestEvent(zone, mode = 'question') {
        const targetZone = this.getTestZone(zone);
        const eventContext = this.worldMap?.getEventContext?.() || { stepCount: this.worldMap?.travelStep };
        const event = mode === 'random'
            ? eventManager.triggerRandomEvent(targetZone, eventContext)
            : eventManager.triggerMapQuestionEvent(targetZone, eventContext);

        if (!event) return null;
        if (this.worldMap) this.worldMap.currentEvent = event;
        this.isLocked = true;
        this.toggleBossTestPanel(false);
        if (event.choices && Array.isArray(event.choices) && event.choices.length > 0) {
            this.showStoryEventModal(event);
        } else {
            this.handleMapEvent();
        }
        return targetZone;
    }

    triggerTestDungeon(dungeonType) {
        const site = this.worldMap?.teleportToDungeon?.(dungeonType);
        if (!site) return null;
        this.isLocked = true;
        this.toggleBossTestPanel(false);
        this.renderMap();
        this.handleDungeonEntrance();
        return site;
    }

    teleportToBossLairForTesting(chainId) {
        const status = worldStoryManager.getBossFlowStatus(chainId);
        if (!status?.finalReady || !status?.battleTemplateLinked) return null;

        const manualTrigger = chainId === AMBUSH_MANTIS_CHAIN_ID
            ? { landmarkId: AMBUSH_MANTIS_TRIGGER_LANDMARK_ID, bossId: status.bossId, manualTrigger: true }
            : Object.values(LANDMARK_BOSS_TRIGGERS).find(config => config.chainId === chainId);

        if (manualTrigger) {
            const landmark = this.worldMap?.teleportToLandmark?.(manualTrigger.landmarkId);
            if (!landmark) return null;
            this.currentLocationKey = null;
            this.renderMap();
            this.updateWorldNarrativePanel();
            return { ...landmark, bossId: manualTrigger.bossId || status.bossId, manualTrigger: true };
        }

        const site = this.worldMap?.teleportToBossSite?.(status.bossId);
        if (!site) return null;
        this.currentLocationKey = null;
        this.renderMap();
        this.updateWorldNarrativePanel();
        return { ...site, bossId: status.bossId };
    }

    challengeBossLairForTesting(chainId) {
        const status = worldStoryManager.getBossFlowStatus(chainId);
        const site = this.teleportToBossLairForTesting(chainId);
        if (!site || !status) return null;

        GameManager.setFlag('debug.noAmbientEncounters', false);
        GameManager.setFlag('debug.noBattles', false);
        GameManager.setFlag('debug.forceNextEncounter', null);

        const cell = this.worldMap?.mapData?.[site.y]?.[site.x];
        const zone = cell?.zone || this.worldMap?.getCurrentZone?.() || 'low';
        if (!this.worldMap?.createBossEncounter?.(status.bossId, zone)) return null;

        this.isLocked = true;
        this.toggleBossTestPanel(false);
        this.startBattle();
        return site;
    }

    handleBossTestPanelClick(event) {
        const button = event.target.closest?.('[data-boss-action]');
        if (!button) return;

        const action = button.dataset.bossAction;
        const chainId = button.dataset.chainId;
        const methodId = button.dataset.methodId;
        const testZone = button.dataset.testZone;
        const testMode = button.dataset.testMode;
        let toastTitle = 'BOSS 測試';
        let toastMessage = '已更新故事測試狀態。';

        if (action === 'reset-all') {
            worldStoryManager.resetWorldStoryProgress();
            this.toggleClueBook(false);
            toastMessage = '所有首領痕跡與 BOSS 測試狀態已重置。';
        } else if (action === 'reset-chain' && chainId) {
            worldStoryManager.resetStoryChain(chainId);
            toastMessage = '此 BOSS 流程已重置。';
        } else if (action === 'unlock-next' && chainId) {
            const clue = worldStoryManager.revealNextClue(chainId, { source: 'boss_test_panel' });
            if (clue) {
                this.showWorldDiscovery({ newClues: [clue] });
                toastMessage = `解鎖：${clue.title}`;
            } else {
                toastMessage = '這條流程已沒有未解鎖痕跡。';
            }
        } else if (action === 'unlock-all' && chainId) {
            const clues = worldStoryManager.revealAllClues(chainId, { source: 'boss_test_panel' });
            if (clues.length > 0) this.showWorldDiscovery({ newClues: clues });
            toastMessage = clues.length > 0 ? `解鎖 ${clues.length} 條痕跡。` : '所有痕跡都已解鎖。';
        } else if (action === 'progress' && chainId && methodId) {
            worldStoryManager.recordProgress(chainId, methodId, { source: 'boss_test_panel' });
            toastMessage = '已模擬一項推進方式。';
        } else if (action === 'final-ready' && chainId) {
            worldStoryManager.markFinalReady(chainId, { source: 'boss_test_panel' });
            toastTitle = '最終觸發';
            toastMessage = '已強制標記此 BOSS 可進入最終觸發測試。';
        } else if (action === 'toggle-no-encounters') {
            const enabled = !GameManager.getFlag('debug.noAmbientEncounters');
            GameManager.setFlag('debug.noAmbientEncounters', enabled);
            if (enabled) GameManager.setFlag('debug.forceNextEncounter', null);
            toastTitle = '世界測試';
            toastMessage = enabled ? '已開啟和平探索：移動不會觸發敵人或隨機事件。' : '已恢復世界隨機遭遇。';
        } else if (action === 'toggle-no-battles') {
            const enabled = !GameManager.getFlag('debug.noBattles');
            GameManager.setFlag('debug.noBattles', enabled);
            if (enabled && GameManager.getFlag('debug.forceNextEncounter') === 'battle') {
                GameManager.setFlag('debug.forceNextEncounter', null);
            }
            toastTitle = '世界測試';
            toastMessage = enabled ? '已停用戰鬥遭遇，地圖事件仍可觸發。' : '已恢復戰鬥遭遇。';
        } else if (action === 'force-next-event') {
            GameManager.setFlag('debug.noAmbientEncounters', false);
            GameManager.setFlag('debug.forceNextEncounter', 'event');
            toastTitle = '世界測試';
            toastMessage = '下一次踏入可遭遇格時會優先觸發隨機事件。';
        } else if (action === 'force-next-battle') {
            GameManager.setFlag('debug.noAmbientEncounters', false);
            GameManager.setFlag('debug.noBattles', false);
            GameManager.setFlag('debug.forceNextEncounter', 'battle');
            toastTitle = '世界測試';
            toastMessage = '下一次踏入可遭遇格時會優先觸發戰鬥。';
        } else if (action === 'reset-debug') {
            GameManager.setFlag('debug.noAmbientEncounters', null);
            GameManager.setFlag('debug.noBattles', null);
            GameManager.setFlag('debug.forceNextEncounter', null);
            toastTitle = '世界測試';
            toastMessage = '測試旗標已重置。';
        } else if (action === 'atk-plus') {
            const value = this.adjustPlayerTestStat('atk', 10);
            toastTitle = '角色測試';
            toastMessage = `基礎攻擊已調整為 ${value}。`;
        } else if (action === 'atk-minus') {
            const value = this.adjustPlayerTestStat('atk', -10);
            toastTitle = '角色測試';
            toastMessage = `基礎攻擊已調整為 ${value}。`;
        } else if (action === 'def-plus') {
            const value = this.adjustPlayerTestStat('def', 10);
            toastTitle = '角色測試';
            toastMessage = `基礎防禦已調整為 ${value}。`;
        } else if (action === 'def-minus') {
            const value = this.adjustPlayerTestStat('def', -10);
            toastTitle = '角色測試';
            toastMessage = `基礎防禦已調整為 ${value}。`;
        } else if (action === 'heal-full') {
            this.healPlayerForTesting();
            toastTitle = '角色測試';
            toastMessage = '已回滿生命。';
        } else if (action === 'gold-plus') {
            GameManager.addGold(1000);
            GameManager.markSaveDirty?.('boss-test-panel');
            toastTitle = '角色測試';
            toastMessage = '已增加 1000 金幣。';
        } else if (action === 'reset-player-test-stats') {
            this.resetPlayerTestStats();
            toastTitle = '角色測試';
            toastMessage = '已重置測試用等級、攻防並回滿生命。';
        } else if (action === 'level-plus') {
            const value = this.adjustPlayerTestLevel(1);
            toastTitle = '角色測試';
            toastMessage = `等級已調整為 ${value}。`;
        } else if (action === 'level-plus-five') {
            const value = this.adjustPlayerTestLevel(5);
            toastTitle = '角色測試';
            toastMessage = `等級已調整為 ${value}。`;
        } else if (action === 'level-dungeon-ready') {
            const value = this.setPlayerTestLevel(20);
            toastTitle = '角色測試';
            toastMessage = `已調整到副本測試等級 ${value}。`;
        } else if (action === 'test-monster') {
            const zone = this.triggerTestMonster(testZone);
            toastTitle = '怪物測試';
            toastMessage = zone ? `已觸發 ${zone} 區怪物戰鬥。` : '這個區域沒有可用怪物。';
        } else if (action === 'test-event') {
            const zone = this.triggerTestEvent(testZone, testMode);
            toastTitle = '事件測試';
            toastMessage = zone ? `已觸發 ${zone} 區${testMode === 'random' ? '一般' : '問號'}事件。` : '這個區域沒有可用事件。';
        } else if (action === 'test-dungeon') {
            const site = this.triggerTestDungeon(button.dataset.dungeonType);
            toastTitle = '副本測試';
            toastMessage = site ? `已定位並開啟 ${site.dungeonType} 副本入口。` : '找不到這個副本入口。';
        } else if (action === 'teleport-boss-lair' && chainId) {
            const site = this.teleportToBossLairForTesting(chainId);
            toastTitle = 'BOSS 巢穴';
            toastMessage = site ? `已定位到 ${site.bossId} 的巢穴。` : '此 BOSS 尚未達到可顯示巢穴的條件。';
        } else if (action === 'challenge-boss-lair' && chainId) {
            const site = this.challengeBossLairForTesting(chainId);
            toastTitle = 'BOSS 挑戰';
            toastMessage = site ? `已直接挑戰 ${site.bossId}。` : '此 BOSS 尚未完成巢穴顯示或缺少戰鬥模板。';
        }

        showGlobalToast(toastTitle, toastMessage, 'info');
        this.updateUI();
        this.renderMap();
        this.renderClueBook();
        this.renderBossTestPanel();
    }

    renderBossTestPanel() {
        if (!this.devMode) return;
        if (!this.dom.bossTestContent) return;

        const debugState = this.getBossTestDebugState();
        const statuses = worldStoryManager.getBossTestData();
        const testerPanel = `
            <section class="boss-tester-card">
                <div class="boss-tester-head">
                    <div>
                        <span>世界測試者</span>
                        <h3>探索與角色控制</h3>
                    </div>
                    <strong>${debugState.noAmbientEncounters ? '和平探索中' : debugState.noBattles ? '戰鬥停用中' : '正常遭遇'}</strong>
                </div>
                <div class="boss-tester-grid">
                    <div class="boss-tester-block">
                        <b>地圖遭遇</b>
                        <div class="boss-tester-status">
                            <span>隨機遭遇：${debugState.noAmbientEncounters ? '關' : '開'}</span>
                            <span>戰鬥：${debugState.noBattles ? '停用' : '啟用'}</span>
                            <span>下次強制：${debugState.forcedEncounter === 'battle' ? '戰鬥' : debugState.forcedEncounter === 'event' ? '事件' : '無'}</span>
                        </div>
                        <div class="boss-tester-actions">
                            <button class="boss-test-action ${debugState.noAmbientEncounters ? 'is-active' : ''}" type="button" data-boss-action="toggle-no-encounters">不遇敵/事件</button>
                            <button class="boss-test-action ${debugState.noBattles ? 'is-active' : ''}" type="button" data-boss-action="toggle-no-battles">停用戰鬥</button>
                            <button class="boss-test-action" type="button" data-boss-action="force-next-event">下次事件</button>
                            <button class="boss-test-action" type="button" data-boss-action="force-next-battle">下次戰鬥</button>
                            <button class="boss-test-action" type="button" data-boss-action="reset-debug">重置旗標</button>
                        </div>
                    </div>
                    <div class="boss-tester-block">
                        <b>角色數值</b>
                        <div class="boss-tester-stats">
                            <span>等級 ${debugState.level}</span>
                            <span>攻擊 ${debugState.totalAtk}（基礎 ${debugState.baseAtk}）</span>
                            <span>防禦 ${debugState.totalDef}（基礎 ${debugState.baseDef}）</span>
                            <span>HP ${debugState.hp}/${debugState.maxHp}</span>
                            <span>金幣 ${debugState.gold}</span>
                        </div>
                        <div class="boss-tester-actions">
                            <button class="boss-test-action" type="button" data-boss-action="atk-plus">攻擊 +10</button>
                            <button class="boss-test-action" type="button" data-boss-action="atk-minus">攻擊 -10</button>
                            <button class="boss-test-action" type="button" data-boss-action="def-plus">防禦 +10</button>
                            <button class="boss-test-action" type="button" data-boss-action="def-minus">防禦 -10</button>
                            <button class="boss-test-action" type="button" data-boss-action="level-plus">等級 +1</button>
                            <button class="boss-test-action" type="button" data-boss-action="level-plus-five">等級 +5</button>
                            <button class="boss-test-action" type="button" data-boss-action="level-dungeon-ready">副本 Lv20</button>
                            <button class="boss-test-action" type="button" data-boss-action="heal-full">補滿生命</button>
                            <button class="boss-test-action" type="button" data-boss-action="gold-plus">金幣 +1000</button>
                            <button class="boss-test-action" type="button" data-boss-action="reset-player-test-stats">重置角色測試</button>
                        </div>
                    </div>
                    <div class="boss-tester-block">
                        <b>怪物測試</b>
                        <div class="boss-tester-actions">
                            <button class="boss-test-action" type="button" data-boss-action="test-monster" data-test-zone="current">目前區域怪物</button>
                            <button class="boss-test-action" type="button" data-boss-action="test-monster" data-test-zone="low">低威脅</button>
                            <button class="boss-test-action" type="button" data-boss-action="test-monster" data-test-zone="medium">普通威脅</button>
                            <button class="boss-test-action" type="button" data-boss-action="test-monster" data-test-zone="high">高威脅</button>
                            <button class="boss-test-action" type="button" data-boss-action="test-monster" data-test-zone="death">死亡區</button>
                            <button class="boss-test-action" type="button" data-boss-action="test-monster" data-test-zone="boss">隨機 BOSS</button>
                        </div>
                    </div>
                    <div class="boss-tester-block">
                        <b>事件測試</b>
                        <div class="boss-tester-actions">
                            <button class="boss-test-action" type="button" data-boss-action="test-event" data-test-zone="current" data-test-mode="question">目前問號事件</button>
                            <button class="boss-test-action" type="button" data-boss-action="test-event" data-test-zone="current" data-test-mode="random">目前一般事件</button>
                            <button class="boss-test-action" type="button" data-boss-action="test-event" data-test-zone="low" data-test-mode="question">低區問號</button>
                            <button class="boss-test-action" type="button" data-boss-action="test-event" data-test-zone="medium" data-test-mode="question">中區問號</button>
                            <button class="boss-test-action" type="button" data-boss-action="test-event" data-test-zone="high" data-test-mode="question">高區問號</button>
                            <button class="boss-test-action" type="button" data-boss-action="test-event" data-test-zone="death" data-test-mode="question">死亡區問號</button>
                            <button class="boss-test-action" type="button" data-boss-action="test-event" data-test-zone="low" data-test-mode="random">低區一般</button>
                            <button class="boss-test-action" type="button" data-boss-action="test-event" data-test-zone="medium" data-test-mode="random">中區一般</button>
                            <button class="boss-test-action" type="button" data-boss-action="test-event" data-test-zone="high" data-test-mode="random">高區一般</button>
                            <button class="boss-test-action" type="button" data-boss-action="test-event" data-test-zone="death" data-test-mode="random">死亡區一般</button>
                        </div>
                    </div>
                    <div class="boss-tester-block">
                        <b>副本測試</b>
                        <div class="boss-tester-actions">
                            <button class="boss-test-action" type="button" data-boss-action="test-dungeon" data-dungeon-type="cave">幽暗洞窟</button>
                            <button class="boss-test-action" type="button" data-boss-action="test-dungeon" data-dungeon-type="snow">冰封雪峰</button>
                            <button class="boss-test-action" type="button" data-boss-action="test-dungeon" data-dungeon-type="ruins">遠古遺跡</button>
                            <button class="boss-test-action" type="button" data-boss-action="test-dungeon" data-dungeon-type="jungle">迷霧叢林</button>
                            <button class="boss-test-action" type="button" data-boss-action="test-dungeon" data-dungeon-type="hell">煉獄深淵</button>
                        </div>
                    </div>
                </div>
            </section>
        `;

        const bossCards = statuses.map(status => {
            const lairReady = Boolean(status.finalReady && status.battleTemplateLinked);
            const lairStatusText = !status.battleTemplateLinked
                ? '缺戰鬥模板，暫不能顯示可戰鬥巢穴'
                : lairReady
                    ? (status.requiresManualTrigger ? '在指定地標觸發' : '已顯示在地圖')
                    : `痕跡 ${status.discoveredClues.length}/${status.requiredClues}｜推進 ${status.completedProgress}/${status.requiredProgress}`;
            const checks = (status.validation?.checks || []).map(check => `
                <span class="boss-check ${check.passed ? 'is-pass' : 'is-fail'}">
                    ${check.passed ? 'OK' : '缺'} ${escapeHtml(check.label)}
                </span>
            `).join('');
            const sources = (status.infoSources || []).map(source => `<span>${escapeHtml(source)}</span>`).join('');
            const reveals = (status.revealMethods || []).map(method => `<span>${escapeHtml(method)}</span>`).join('');
            const progressButtons = (status.progressMethods || []).map(method => `
                <button class="boss-progress-btn ${method.completed ? 'is-complete' : ''}" type="button"
                    data-boss-action="progress" data-chain-id="${escapeHtml(status.id)}" data-method-id="${escapeHtml(method.id)}">
                    ${method.completed ? '完成' : '模擬'}｜${escapeHtml(method.type)}：${escapeHtml(method.label)}
                </button>
            `).join('');
            const clueList = status.discoveredClues.length > 0
                ? status.discoveredClues.map(clue => `<li>痕跡 ${clue.notebookIndex}｜${escapeHtml(clue.title)}</li>`).join('')
                : '<li>尚未取得任何痕跡</li>';

            return `
                <article class="boss-test-card ${status.finalReady ? 'is-ready' : ''}">
                    <div class="boss-test-card-head">
                        <div>
                            <span>${escapeHtml(status.archetype || status.method)}</span>
                            <h3>${escapeHtml(status.title)}</h3>
                        </div>
                        <div class="boss-test-state">
                            <strong>${status.finalReady ? '可測最終觸發' : '流程測試中'}</strong>
                            <span class="boss-link-badge ${status.battleTemplateLinked ? 'is-linked' : 'is-missing'}">
                                ${status.battleTemplateLinked ? '戰鬥模板已接' : '缺戰鬥模板'}
                            </span>
                        </div>
                    </div>
                    <p>${escapeHtml(status.text || '')}</p>
                    <div class="boss-rule-checks">${checks}</div>
                    <div class="boss-test-grid">
                        <div><b>入口</b><span>${(status.entries || []).length} 個</span></div>
                        <div><b>戰鬥模板</b><span>${status.battleTemplateLinked ? `已接上｜${escapeHtml(status.bossId)}` : `尚未建立｜${escapeHtml(status.bossId)}`}</span></div>
                        <div><b>巢穴顯示</b><span>${escapeHtml(lairStatusText)}</span></div>
                        <div><b>情報來源</b><span>${sources}</span></div>
                        <div><b>揭露方式</b><span>${reveals}</span></div>
                        <div><b>地圖謎題</b><span>${escapeHtml(status.mapPuzzle?.label || '未設定')}</span></div>
                        <div><b>捷徑</b><span>${escapeHtml(status.shortcut?.label || '未設定')}</span></div>
                        <div><b>最終觸發</b><span>${escapeHtml(status.finalTrigger?.type || '未設定')}｜${escapeHtml(status.finalTrigger?.label || '')}</span></div>
                    </div>
                    <ul class="boss-clue-list">${clueList}</ul>
                    <div class="boss-progress-list">${progressButtons}</div>
                    <div class="boss-test-actions">
                        <button type="button" data-boss-action="unlock-next" data-chain-id="${escapeHtml(status.id)}">解鎖下一痕跡</button>
                        <button type="button" data-boss-action="unlock-all" data-chain-id="${escapeHtml(status.id)}">解鎖全部痕跡</button>
                        <button type="button" data-boss-action="final-ready" data-chain-id="${escapeHtml(status.id)}">強制最終觸發</button>
                        <button type="button" data-boss-action="teleport-boss-lair" data-chain-id="${escapeHtml(status.id)}" ${lairReady ? '' : 'disabled'}>定位巢穴</button>
                        <button type="button" data-boss-action="challenge-boss-lair" data-chain-id="${escapeHtml(status.id)}" ${lairReady ? '' : 'disabled'}>挑戰 BOSS</button>
                        <button type="button" data-boss-action="reset-chain" data-chain-id="${escapeHtml(status.id)}">重置此流程</button>
                    </div>
                </article>
            `;
        }).join('');

        this.dom.bossTestContent.innerHTML = testerPanel + bossCards;
    }

    renderMap() {
        if (!this.ctx || !this.worldMap) return;
        
        const ctx = this.ctx;
        const canvas = this.canvas;
        const gridSize = this.worldMap.gridSize;
        const cameraX = this.worldMap.cameraOffsetX;
        const cameraY = this.worldMap.cameraOffsetY;
        
        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw cached static layer (background, grid, walls)
        if (this.staticCanvas && this.staticCtx) {
            // Draw portion of staticCanvas corresponding to camera
            ctx.drawImage(
                this.staticCanvas,
                Math.floor(cameraX), Math.floor(cameraY), // sx, sy
                canvas.width, canvas.height,               // sWidth, sHeight
                0, 0,                                       // dx, dy
                canvas.width, canvas.height                // dWidth, dHeight
            );
        } else {
            // fallback: fill background
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        const visibleCells = this.worldMap.getVisibleCells();
        const devRevealMap = Boolean(this.devMode);
        const exploredCells = devRevealMap ? visibleCells : visibleCells.filter(cell => cell.explored);
        const center = (x, y) => ({ cx: x + gridSize / 2, cy: y + gridSize / 2 });
        const drawUnexploredCell = (x, y) => {
            ctx.fillStyle = '#020305';
            ctx.fillRect(x, y, gridSize + 1, gridSize + 1);
        };
        const drawMapStone = (x, y, radius, color = 'rgba(214, 194, 145, 0.72)') => {
            ctx.beginPath();
            ctx.ellipse(x, y, radius * 0.9, radius * 0.62, -0.35, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = 'rgba(25, 20, 14, 0.42)';
            ctx.lineWidth = 1;
            ctx.stroke();
        };
        const drawTerrainDecoration = (cell, x, y) => {
            const { cx, cy } = center(x, y);
            if (cell.data.type === 'home' || cell.data.type === 'wall') return;

            const seed = ((cell.x + 3) * 37 + (cell.y + 7) * 53) % 19;
            if (seed > 10) return;

            ctx.save();
            if (seed % 4 === 0) {
                ctx.strokeStyle = 'rgba(188, 220, 158, 0.5)';
                ctx.lineWidth = 2;
                for (let i = 0; i < 4; i += 1) {
                    const ox = (i - 1.5) * gridSize * 0.08;
                    ctx.beginPath();
                    ctx.moveTo(cx + ox, cy + gridSize * 0.18);
                    ctx.quadraticCurveTo(cx + ox * 0.5, cy, cx + ox * 1.4, cy - gridSize * 0.16);
                    ctx.stroke();
                }
            } else if (seed % 4 === 1) {
                drawMapStone(cx - gridSize * 0.08, cy + gridSize * 0.08, gridSize * 0.09, 'rgba(155, 147, 123, 0.52)');
                drawMapStone(cx + gridSize * 0.12, cy - gridSize * 0.04, gridSize * 0.07, 'rgba(155, 147, 123, 0.42)');
            } else if (seed % 4 === 2) {
                ctx.strokeStyle = 'rgba(211, 188, 133, 0.38)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(cx - gridSize * 0.2, cy + gridSize * 0.08);
                ctx.bezierCurveTo(cx - gridSize * 0.06, cy - gridSize * 0.02, cx + gridSize * 0.08, cy + gridSize * 0.2, cx + gridSize * 0.24, cy + gridSize * 0.04);
                ctx.stroke();
            } else {
                ctx.strokeStyle = 'rgba(170, 138, 83, 0.42)';
                ctx.fillStyle = 'rgba(64, 48, 29, 0.32)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(cx - gridSize * 0.16, cy - gridSize * 0.12, gridSize * 0.32, gridSize * 0.2, 4);
                ctx.fill();
                ctx.stroke();
            }
            ctx.restore();
        };
        const drawLandmarkMarker = (cell, x, y) => {
            const { cx, cy } = center(x, y);
            const landmarkId = cell.data.landmarkId;
            if (!this.isLandmarkDiscovered(landmarkId)) {
                this.drawUnknownLandmarkMarker(ctx, cx, cy, gridSize * 0.66);
                return;
            }

            const landmarkImage = this.getLandmarkImage(cell.data.landmarkData || landmarkId);
            if (this.drawCanvasImageMarker(ctx, landmarkImage, cx, cy, gridSize * 0.66, {
                shadowColor: 'rgba(216, 181, 95, 0.58)',
                stroke: 'rgba(222, 195, 126, 0.86)'
            })) return;
            ctx.save();
            ctx.shadowColor = 'rgba(216, 181, 95, 0.58)';
            ctx.shadowBlur = 18;
            ctx.fillStyle = 'rgba(222, 195, 126, 0.88)';
            ctx.beginPath();
            ctx.moveTo(cx, cy - gridSize * 0.28);
            ctx.lineTo(cx + gridSize * 0.16, cy + gridSize * 0.2);
            ctx.lineTo(cx - gridSize * 0.16, cy + gridSize * 0.2);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = 'rgba(69, 49, 25, 0.72)';
            ctx.stroke();
            ctx.restore();
        };
        const drawDungeonMarker = (cell, x, y) => {
            const { cx, cy } = center(x, y);
            const dungeonImage = getGeneratedDungeonImage(cell.data.dungeonType);
            if (this.drawCanvasImageMarker(ctx, dungeonImage, cx, cy, gridSize * 0.72, {
                shadowColor: cell.data.dungeonData?.color || 'rgba(125, 211, 252, 0.5)',
                stroke: 'rgba(192, 207, 204, 0.84)'
            })) return;
            ctx.save();
            ctx.shadowColor = cell.data.dungeonData?.color || 'rgba(125, 211, 252, 0.5)';
            ctx.shadowBlur = 12;
            ctx.strokeStyle = 'rgba(192, 207, 204, 0.78)';
            ctx.fillStyle = 'rgba(18, 24, 28, 0.82)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx - gridSize * 0.22, cy + gridSize * 0.22);
            ctx.lineTo(cx - gridSize * 0.22, cy - gridSize * 0.02);
            ctx.quadraticCurveTo(cx, cy - gridSize * 0.3, cx + gridSize * 0.22, cy - gridSize * 0.02);
            ctx.lineTo(cx + gridSize * 0.22, cy + gridSize * 0.22);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        };
        const drawBossLairMarker = (cell, x, y) => {
            const { cx, cy } = center(x, y);
            const status = worldStoryManager.getBossLairStatus(cell.data.bossSiteId);
            const lairImage = getGeneratedMapPropImage('boss_lair_silhouette');
            if (this.drawCanvasImageMarker(ctx, lairImage, cx, cy, gridSize * 0.7, {
                shadowColor: 'rgba(248, 113, 113, 0.72)',
                stroke: status.finalReady ? 'rgba(248, 113, 113, 0.92)' : 'rgba(248, 113, 113, 0.45)'
            })) return;
            ctx.save();
            ctx.shadowColor = 'rgba(248, 113, 113, 0.72)';
            ctx.shadowBlur = 18;
            ctx.fillStyle = 'rgba(42, 18, 18, 0.9)';
            ctx.strokeStyle = status.finalReady ? 'rgba(248, 113, 113, 0.92)' : 'rgba(248, 113, 113, 0.45)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(cx, cy + gridSize * 0.05, gridSize * 0.26, gridSize * 0.18, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = 'rgba(248, 113, 113, 0.88)';
            ctx.beginPath();
            ctx.arc(cx - gridSize * 0.08, cy, gridSize * 0.035, 0, Math.PI * 2);
            ctx.arc(cx + gridSize * 0.08, cy, gridSize * 0.035, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        };
        const drawRiftMarker = (x, y) => {
            const { cx, cy } = center(x, y);
            const riftImage = getGeneratedMapPropImage('abyss_crack');
            if (this.drawCanvasImageMarker(ctx, riftImage, cx, cy, gridSize * 0.66, {
                shadowColor: 'rgba(123, 97, 255, 0.5)',
                stroke: 'rgba(155, 135, 255, 0.7)'
            })) return;
            ctx.save();
            ctx.strokeStyle = 'rgba(155, 135, 255, 0.66)';
            ctx.shadowColor = 'rgba(123, 97, 255, 0.5)';
            ctx.shadowBlur = 14;
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let i = 0; i < 18; i += 1) {
                const t = i / 3;
                const r = gridSize * 0.03 * i;
                const px = cx + Math.cos(t) * r;
                const py = cy + Math.sin(t) * r;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.stroke();
            ctx.restore();
        };
        const drawHomeMarker = (x, y) => {
            const { cx, cy } = center(x, y);
            const homeImage = getGeneratedTownPlaceImage('crossroads');
            if (this.drawCanvasImageMarker(ctx, homeImage, cx, cy, gridSize * 0.7, {
                shadowColor: 'rgba(208, 169, 94, 0.62)',
                stroke: 'rgba(216, 181, 95, 0.86)'
            })) return;
            ctx.save();
            ctx.fillStyle = 'rgba(208, 169, 94, 0.9)';
            ctx.strokeStyle = 'rgba(61, 42, 21, 0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy - gridSize * 0.26);
            ctx.lineTo(cx + gridSize * 0.24, cy - gridSize * 0.04);
            ctx.lineTo(cx + gridSize * 0.18, cy + gridSize * 0.22);
            ctx.lineTo(cx - gridSize * 0.18, cy + gridSize * 0.22);
            ctx.lineTo(cx - gridSize * 0.24, cy - gridSize * 0.04);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        };

        visibleCells.forEach(cell => {
            if (devRevealMap) return;
            if (cell.explored) return;
            const x = cell.x * gridSize - cameraX;
            const y = cell.y * gridSize - cameraY;
            drawUnexploredCell(x, y);
        });

        exploredCells.forEach(cell => {
            const x = cell.x * gridSize - cameraX;
            const y = cell.y * gridSize - cameraY;
            drawTerrainDecoration(cell, x, y);
        });

        exploredCells.forEach(cell => {
            const x = cell.x * gridSize - cameraX;
            const y = cell.y * gridSize - cameraY;
            if (cell.data.type === 'landmark') {
                drawLandmarkMarker(cell, x, y);
            } else if (cell.data.type === 'dungeon') {
                drawDungeonMarker(cell, x, y);
            } else if (cell.data.type === 'rift') {
                drawRiftMarker(x, y);
            } else if (cell.data.type === 'home') {
                drawHomeMarker(x, y);
            }
            if (cell.data.bossSiteId && cell.data.bossSiteId !== AMBUSH_MANTIS_BOSS_ID && worldStoryManager.isBossLairVisible(cell.data.bossSiteId)) {
                drawBossLairMarker(cell, x, y);
            }
        });
        
        const playerX = this.worldMap.playerPos.x * gridSize - cameraX;
        const playerY = this.worldMap.playerPos.y * gridSize - cameraY;
        const { cx: pcx, cy: pcy } = center(playerX, playerY);
        ctx.save();
        ctx.shadowColor = 'rgba(125, 211, 252, 0.66)';
        ctx.shadowBlur = 16;
        ctx.fillStyle = 'rgba(37, 99, 130, 0.82)';
        ctx.strokeStyle = 'rgba(191, 219, 254, 0.92)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pcx, pcy, gridSize * 0.23, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'rgba(236, 253, 245, 0.94)';
        ctx.beginPath();
        ctx.moveTo(pcx, pcy - gridSize * 0.17);
        ctx.lineTo(pcx + gridSize * 0.08, pcy + gridSize * 0.08);
        ctx.lineTo(pcx, pcy + gridSize * 0.04);
        ctx.lineTo(pcx - gridSize * 0.08, pcy + gridSize * 0.08);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    // ===== 地圖事件處理 =====
    
    getInventoryItemCount(itemId) {
        return (GameManager.state?.inventory || [])
            .filter(stack => stack?.item?.id === itemId)
            .reduce((sum, stack) => sum + (Number(stack.quantity) || 1), 0);
    }

    getPotionSupplyCount() {
        return (GameManager.state?.inventory || [])
            .filter(stack => {
                const item = stack?.item;
                if (!item) return false;
                return item.type === ItemType.POTION
                    || item.type === 'potion'
                    || Boolean(item.effects?.hp)
                    || Boolean(item.hp);
            })
            .reduce((sum, stack) => sum + (Number(stack.quantity) || 1), 0);
    }

    consumeInventoryItem(itemId, quantity = 1) {
        const inventory = GameManager.state?.inventory || [];
        let remaining = Math.max(1, Number(quantity) || 1);

        for (let index = inventory.length - 1; index >= 0 && remaining > 0; index -= 1) {
            const stack = inventory[index];
            if (stack?.item?.id !== itemId) continue;

            const stackQuantity = Math.max(1, Number(stack.quantity) || 1);
            const used = Math.min(stackQuantity, remaining);
            const nextQuantity = stackQuantity - used;
            remaining -= used;

            if (nextQuantity <= 0) {
                inventory.splice(index, 1);
            } else {
                stack.quantity = nextQuantity;
            }
        }

        if (remaining > 0) return false;

        GameManager.markSaveDirty?.('consume-adventure-item');
        GameManager.notify('inventory');
        return true;
    }

    getAmbushMantisBaitState(landmarkId) {
        if (!AMBUSH_MANTIS_RELATED_LANDMARKS.has(landmarkId)) return null;

        const status = worldStoryManager.getBossFlowStatus(AMBUSH_MANTIS_CHAIN_ID);
        const baitCount = this.getInventoryItemCount(AMBUSH_MANTIS_BAIT_ITEM_ID);
        const defeated = worldStoryManager.hasMonsterDefeated?.(AMBUSH_MANTIS_BOSS_ID);
        const atTriggerLandmark = landmarkId === AMBUSH_MANTIS_TRIGGER_LANDMARK_ID;

        return {
            status,
            baitCount,
            defeated,
            atTriggerLandmark,
            canTrigger: Boolean(status?.finalReady && status?.battleTemplateLinked && atTriggerLandmark && baitCount > 0 && !defeated)
        };
    }

    applyDevVisibility() {
        if (!this.dom) return;
        const hidden = !this.devMode;
        if (this.dom.btnToggleBossTest) {
            this.dom.btnToggleBossTest.hidden = hidden;
            this.dom.btnToggleBossTest.setAttribute('aria-hidden', String(hidden));
        }
        if (this.dom.bossTestPanel) {
            this.dom.bossTestPanel.hidden = hidden;
            this.dom.bossTestPanel.setAttribute('aria-hidden', String(hidden || !this.bossTestOpen));
        }
        if (hidden) {
            this.bossTestOpen = false;
            this.dom.bossTestPanel?.classList.remove('is-open');
            this.dom.btnToggleBossTest?.classList.remove('is-open');
        }
    }

    renderAmbushMantisBaitPanel(landmarkId) {
        const state = this.getAmbushMantisBaitState(landmarkId);
        if (!state) return '';

        const clueText = `${state.status?.discoveredClues?.length || 0}/${state.status?.requiredClues || 2}`;
        const progressText = `${state.status?.completedProgress || 0}/${state.status?.requiredProgress || 2}`;

        let title = '銀絲伏擊';
        let body = '銀絲在路邊收束，像是在等待某個足夠貪心的人把脖子伸過去。';
        let action = '';
        let challengeBrief = '';

        if (state.defeated) {
            title = '伏道已靜';
            body = '銀鐮伏獵者已被擊敗。銀絲仍掛在枝葉間，但不再像活物一樣重新丈量你的腳步。';
        } else if (!state.status?.finalReady) {
            title = '痕跡尚未收束';
            body = `目前痕跡 ${clueText}，推進 ${progressText}。你還無法判斷牠會在哪一段回程路出手。`;
        } else if (!state.atTriggerLandmark) {
            title = '不是設陷位置';
            body = '這裡能讀到銀絲的方向，但誘餌不能隨便丟。痕跡指向銀絲最密的伏道。';
        } else if (state.baitCount <= 0) {
            title = '缺少銀絲誘餌';
            body = '你已經知道牠會怎麼觀察路線，但還需要銀絲誘餌才能把牠從暗處逼出來。旅行商人也許願意賣這種不太吉利的小玩意。';
        } else {
            body = `你手上有 ${state.baitCount} 個銀絲誘餌。把它掛在回程路上，銀鐮伏獵者就會以為自己才是獵人。`;
            challengeBrief = this.renderBossChallengeBrief('銀絲誘餌會立刻引出伏擊，請先確認生命、藥水與撤退成本。');
            action = `
                <button class="btn btn-primary ambush-bait-action" type="button" data-ambush-mantis-bait="true">
                    設置銀絲誘餌
                </button>
            `;
        }

        return `
            <div class="ambush-bait-panel">
                <div>
                    <strong>${escapeHtml(title)}</strong>
                    <p>${escapeHtml(body)}</p>
                </div>
                ${challengeBrief}
                ${action}
            </div>
        `;
    }

    bindAmbushMantisBaitAction(landmarkId, zoneId) {
        const button = this.dom.eventResult?.querySelector?.('[data-ambush-mantis-bait="true"]');
        if (!button) return;
        button.addEventListener('click', () => this.triggerAmbushMantisFromBait(landmarkId, zoneId), { once: true });
    }

    triggerAmbushMantisFromBait(landmarkId, zoneId) {
        const state = this.getAmbushMantisBaitState(landmarkId);
        if (!state?.canTrigger) {
            showGlobalToast('無法設置誘餌', '這裡還不是銀鐮伏獵者會出手的位置，或是你缺少誘餌。', 'warning');
            return;
        }

        if (!this.consumeInventoryItem(AMBUSH_MANTIS_BAIT_ITEM_ID, 1)) {
            showGlobalToast('缺少銀絲誘餌', '背包裡沒有可用的銀絲誘餌。', 'warning');
            return;
        }

        if (this.dom.eventModal) this.dom.eventModal.style.display = 'none';
        if (!this.worldMap?.createBossEncounter?.(AMBUSH_MANTIS_BOSS_ID, zoneId || 'low')) {
            showGlobalToast('伏擊失敗', '銀絲劇烈震動，但沒有任何東西現身。', 'error');
            this.isLocked = false;
            return;
        }

        GameManager.setFlag('world.story.ambush_mantis.usedSilverBait', {
            landmarkId,
            usedAt: Date.now()
        });
        GameManager.markSaveDirty?.('ambush-mantis-bait-trigger');
        this.isLocked = true;
        this.startBattle();
    }

    getLandmarkBossState(landmarkId) {
        const config = LANDMARK_BOSS_TRIGGER_BY_LANDMARK[landmarkId];
        if (!config) return null;

        const status = worldStoryManager.getBossFlowStatus(config.chainId);
        const defeated = worldStoryManager.hasMonsterDefeated?.(config.bossId);
        return {
            config,
            status,
            defeated,
            canTrigger: Boolean(status?.finalReady && status?.battleTemplateLinked && !defeated)
        };
    }

    renderLandmarkBossPanel(landmarkId) {
        const state = this.getLandmarkBossState(landmarkId);
        if (!state) return '';

        const { config, status } = state;
        const clueText = `${status?.discoveredClues?.length || 0}/${status?.requiredClues || 2}`;
        const progressText = `${status?.completedProgress || 0}/${status?.requiredProgress || 2}`;
        let title = config.readyTitle;
        let body = config.readyBody;
        let action = '';
        let challengeBrief = '';

        if (state.defeated) {
            title = config.defeatedTitle;
            body = config.defeatedBody;
        } else if (!status?.finalReady) {
            title = config.pendingTitle;
            body = `${config.pendingBody} 目前痕跡 ${clueText}，推進 ${progressText}。`;
        } else {
            challengeBrief = this.renderBossChallengeBrief(`${config.actionLabel}後會立刻進入首領戰。`);
            action = `
                <button class="btn btn-primary landmark-boss-action" type="button"
                    data-landmark-boss="${escapeHtml(config.chainId)}">
                    ${escapeHtml(config.actionLabel)}
                </button>
            `;
        }

        return `
            <div class="ambush-bait-panel landmark-boss-panel">
                <div>
                    <strong>${escapeHtml(title)}</strong>
                    <p>${escapeHtml(body)}</p>
                </div>
                ${challengeBrief}
                ${action}
            </div>
        `;
    }

    renderBossChallengeBrief(triggerText = '') {
        const character = GameManager.getCharacter?.();
        const currentHp = Number(character?.hp ?? character?.currentHP ?? 0);
        const maxHp = Number(character?.maxHp ?? character?.maxHP ?? 0);
        const hpText = maxHp > 0 ? `生命 ${Math.max(0, currentHp)}/${maxHp}` : '確認生命狀態';
        const potionCount = this.getPotionSupplyCount();
        const lines = [
            triggerText || '確認後會直接進入首領戰。',
            `風險：死亡會被送回城鎮，背包物品可能損失。`,
            `準備：${hpText}，藥水 ${potionCount} 瓶，先確認裝備耐久。`
        ].filter(Boolean);

        return `
            <div class="challenge-risk-brief">
                ${lines.map(line => `<span>${escapeHtml(line)}</span>`).join('')}
            </div>
        `;
    }

    bindLandmarkBossAction(landmarkId, zoneId) {
        const button = this.dom.eventResult?.querySelector?.('[data-landmark-boss]');
        if (!button) return;
        button.addEventListener('click', () => this.triggerLandmarkBoss(landmarkId, zoneId), { once: true });
    }

    triggerLandmarkBoss(landmarkId, zoneId) {
        const state = this.getLandmarkBossState(landmarkId);
        if (!state?.canTrigger) {
            showGlobalToast('無法觸發首領', '這裡的痕跡還沒有收束，或是首領已經被擊敗。', 'warning');
            return;
        }

        const { config } = state;
        if (this.dom.eventModal) this.dom.eventModal.style.display = 'none';
        if (!this.worldMap?.createBossEncounter?.(config.bossId, zoneId || 'medium')) {
            showGlobalToast('首領觸發失敗', '地標有反應，但戰鬥模板沒有正確接上。', 'error');
            this.isLocked = false;
            return;
        }

        GameManager.setFlag(config.flag, {
            landmarkId,
            usedAt: Date.now()
        });
        GameManager.markSaveDirty?.('landmark-boss-trigger');
        this.isLocked = true;
        this.startBattle();
    }

    handleLandmarkInteraction() {
        const landmarkRef = this.worldMap.getCurrentLandmark?.();
        if (!landmarkRef) {
            this.isLocked = false;
            return;
        }

        const outcome = worldStoryManager.visitLandmark(landmarkRef.id, {
            zoneId: landmarkRef.zone,
            source: 'adventure_map'
        });
        this.renderMap();
        if ((outcome.newClues || []).length > 0 && this.dom.btnToggleClueBook && !this.clueBookOpen) {
            this.dom.btnToggleClueBook.classList.add('has-new');
        }
        const clueHTML = (outcome.newClues || []).map(clue => `
            <div class="event-reward">
                <strong>新痕跡：${escapeHtml(clue.title)}</strong>
                <p>${escapeHtml(clue.text)}</p>
                <small>${escapeHtml(clue.lead || '')}</small>
            </div>
        `).join('');
        const effectHTML = (outcome.effects || []).map(effect => `
            <div class="event-reward">
                <strong>${escapeHtml(effect.name)}</strong>
                <p>${escapeHtml(effect.summary)}</p>
            </div>
        `).join('');
        const ambushBaitHTML = this.renderAmbushMantisBaitPanel(landmarkRef.id);
        const landmarkBossHTML = this.renderLandmarkBossPanel(landmarkRef.id);
        const resultHTML = `${clueHTML}${effectHTML}${ambushBaitHTML}${landmarkBossHTML}` || '<div class="event-reward">你把這裡的位置記進旅途紀錄。</div>';

        this.updateWorldNarrativePanel({
            landmark: outcome.landmark,
            zoneId: landmarkRef.zone,
            narrative: worldStoryManager.getNarrative({
                zoneId: landmarkRef.zone,
                landmarkId: landmarkRef.id
            })
        });
        this.worldMap.clearCurrentLandmark();
        this.showEventModal(
            {
                type: 'landmark',
                icon: outcome.icon || '◆',
                name: outcome.title,
                landmarkId: landmarkRef.id,
                image: this.getLandmarkImage(outcome.landmark || landmarkRef.data || landmarkRef.id, { full: true })
            },
            outcome.title || '未知地標',
            outcome.description || '你抵達一處值得記錄的地方。',
            resultHTML
        );
        this.bindAmbushMantisBaitAction(landmarkRef.id, landmarkRef.zone);
        this.bindLandmarkBossAction(landmarkRef.id, landmarkRef.zone);
    }

    handleMapEvent() {
        const event = this.worldMap.getCurrentEvent();
        if (!event) return;

        // If this event is a Slay-the-Spire style event (has choices), show story modal
        if (event.choices && Array.isArray(event.choices) && event.choices.length > 0) {
            this.showStoryEventModal(event);
            return;
        }
        
        const char = GameManager.getCharacter();
        let resultHTML = '';
        
        switch (event.type) {
            case 'treasure':
                const gold = Math.floor(Math.random() * (event.goldMax - event.goldMin + 1)) + event.goldMin;
                GameManager.addGold(gold);
                resultHTML = `<div class="event-reward">💰 獲得 ${gold} 金幣！</div>`;
                
                // 根據機率掉落物品
                if (Math.random() < event.itemChance) {
                    const item = this.generateTreasureItem(event.zone);
                    if (item) {
                        GameManager.addToInventory(item);
                        resultHTML += `<div class="event-reward">🎁 獲得 ${item.name}！</div>`;
                    }
                }
                
                this.showEventModal(event.icon, event.name, '你打開了寶箱，發現了寶物！', resultHTML);
                break;
                
            case 'healing':
                const healingBonus = typeof char.getPassiveCombatBonus === 'function'
                    ? Math.max(0, Number(char.getPassiveCombatBonus('healingReceived')) || 0)
                    : 0;
                const healAmount = Math.floor(char.maxHp * event.healPercent * (1 + healingBonus));
                const actualHeal = Math.min(healAmount, char.maxHp - char.hp);
                char.hp += actualHeal;
                resultHTML = `<div class="event-heal">💚 恢復了 ${actualHeal} 點生命！</div>`;
                this.showEventModal(event.icon, event.name, '你發現了一處神秘的治療之泉，泉水散發著淡淡的光芒。', resultHTML);
                break;
                
            case 'trap':
                const damage = Math.floor(Math.random() * (event.damageMax - event.damageMin + 1)) + event.damageMin;
                const actualDamage = Math.max(1, damage - char.getTotalDef());
                char.hp = Math.max(1, char.hp - actualDamage); // 陷阱不會殺死玩家
                resultHTML = `<div class="event-damage">💔 受到 ${actualDamage} 點傷害！</div>`;
                this.showEventModal(event.icon, event.name, '糟糕！你觸發了陷阱！', resultHTML);
                break;
                
            case 'story':
                // 觸發劇情事件 (Slay the Spire 風格)
                this.triggerStoryEvent();
                // 任務系統：觸發事件
                questManager.updateProgress(ObjectiveType.EVENT, 'random', 1);
                return; // 不要清除事件，讓玩家選擇後再清除
        }
        
        this.worldMap.clearCurrentEvent();
        this.updateUI();
    }
    
    // ===== 副本入口處理 =====
    
    handleDungeonEntrance() {
        const dungeon = this.worldMap.getCurrentDungeon();
        if (!dungeon) return;
        
        // 導入副本資料
        import('../data/Dungeons.js').then(module => {
            const { DungeonDatabase, DungeonEntranceConfig } = module;
            const dungeonType = dungeon.type; // 正確讀取 type 屬性
            const dungeonData = DungeonDatabase[dungeonType];
            const entranceConfig = DungeonEntranceConfig[dungeonType];
            
            if (!dungeonData) {
                console.error('找不到副本資料:', dungeonType);
                return;
            }
            
            // 顯示副本入口確認彈窗
            this.showDungeonEntranceModal(dungeonType, dungeonData, entranceConfig);
        }).catch(err => {
            console.error('載入副本資料失敗:', err);
        });
    }

    // ===== 裂縫互動 (傳送 UI) =====
    handleRiftInteraction() {
        const rift = this.worldMap.getCurrentRift();
        const options = this.worldMap.getRiftOptions();

        const zoneNames = { 'low': '安全區', 'medium': '普通區', 'high': '危險區', 'death': '死亡區' };

        const modalHTML = `
            <div class="rift-modal" id="rift-modal" style="position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.85); display:flex; align-items:center; justify-content:center; z-index:11000;">
                <div style="background: linear-gradient(145deg,#1a1f2e,#252b3d); padding:20px; border-radius:12px; width: 380px; max-width:94%;">
                    <h3 style="margin:0 0 8px 0; color:#9aa;">🌀 裂縫傳送</h3>
                    <p style="color:#ccc; margin:0 0 12px 0;">你站在裂縫旁，裂縫可以將你傳送到其他已解鎖的區域。選擇目的地：</p>
                    <div id="rift-options" style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">
                    </div>
                    <div style="display:flex; gap:8px; justify-content:flex-end;">
                        <button id="rift-cancel" class="btn btn-secondary" style="padding:8px 12px;">取消</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = document.getElementById('rift-modal');
        const optionsContainer = document.getElementById('rift-options');

        if (options.length === 0) {
            optionsContainer.innerHTML = `<div style="color:#ccc;">目前沒有其他已解鎖的區域可供傳送。</div>`;
        } else {
            options.forEach(zone => {
                const btn = document.createElement('button');
                btn.className = 'btn btn-primary';
                btn.style.padding = '10px';
                btn.style.textAlign = 'left';
                btn.textContent = zoneNames[zone] || zone;
                btn.addEventListener('click', () => {
                    modal.remove();
                    this.teleportPlayerToZone(zone);
                });
                optionsContainer.appendChild(btn);
            });
        }

        const cancelBtn = document.getElementById('rift-cancel');
        cancelBtn.addEventListener('click', () => {
            modal.remove();
            this.worldMap.clearCurrentRift();
            this.isLocked = false;
        });

        // 點擊背景關閉
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                this.worldMap.clearCurrentRift();
                this.isLocked = false;
            }
        });
    }

    teleportPlayerToZone(zone) {
        const target = this.findRandomEmptyCellInZone(zone);
        if (!target) {
            showGlobalToast('傳送失敗', '找不到可傳送的位置。', 'error');
            this.worldMap.clearCurrentRift();
            this.isLocked = false;
            return;
        }

        this.worldMap.playerPos.x = target.c;
        this.worldMap.playerPos.y = target.r;
        // 抵達目的地視為解鎖
        this.worldMap.unlockedZones.add(zone);
        if (typeof this.worldMap._saveMapState === 'function') this.worldMap._saveMapState();
        this.worldMap.updateCamera();
        this.renderMap();
        this.updateUI();
        this.worldMap.clearCurrentRift();
        this.isLocked = false;
    }

    findRandomEmptyCellInZone(zone) {
        const cells = [];
        for (let r = 0; r < this.worldMap.rows; r++) {
            for (let c = 0; c < this.worldMap.cols; c++) {
                const cell = this.worldMap.mapData[r][c];
                if (cell.zone === zone && cell.type === 'empty') {
                    // 避免傳到玩家出生點或副本
                    if (this.worldMap.homePos && c === this.worldMap.homePos.x && r === this.worldMap.homePos.y) continue;
                    cells.push({ r, c });
                }
            }
        }
        if (cells.length === 0) return null;
        return cells[Math.floor(Math.random() * cells.length)];
    }
    
    showDungeonEntranceModal(dungeonType, dungeonData, entranceConfig) {
        // 建立彈窗 HTML
        const char = GameManager.getCharacter();
        const isLevelOK = char.level >= dungeonData.recommendLevel;
        const mechanicInfo = this.getDungeonMechanicDescription(dungeonData.mechanic?.type || dungeonType);
        const story = dungeonData.story || null;
        const storyPickup = story?.pickup || null;
        const dungeonImage = dungeonData.image || getGeneratedDungeonImage(dungeonType);
        const dungeonVisual = `<span class="dungeon-entrance-mark" aria-hidden="true">${escapeHtml(entranceConfig?.icon || dungeonData.icon || '◆')}</span>`;
        const dungeonSceneStyle = dungeonImage
            ? `; --dungeon-scene: url('/${escapeHtml(dungeonImage)}')`
            : '';
        const storyRelicIds = {
            cave: 'bran_bloodied_diary',
            jungle: 'weaving_clan_scroll',
            ruins: 'julian_tablet_rubbing',
            snow: 'frozen_anvil_inscription',
            hell: 'burned_knight_diary'
        };
        const storyRelicImage = storyPickup ? getGeneratedStoryRelicImage(storyRelicIds[dungeonType]) : '';
        const storyRelicHTML = storyRelicImage
            ? `<div class="dungeon-story-relic"><img src="${escapeHtml(storyRelicImage)}" alt="${escapeHtml(storyPickup?.title || '')}"></div>`
            : '';
        const riskBriefHTML = this.renderDungeonRiskBrief(this.getDungeonRiskBrief(dungeonType, dungeonData, mechanicInfo, isLevelOK));
        const storyHTML = storyPickup ? `
                    <section class="dungeon-story-hook ${storyRelicImage ? 'has-relic' : ''}">
                        ${storyRelicHTML}
                        <div class="dungeon-story-meta">
                            <span>${escapeHtml(story.chapterType || '副本故事')}</span>
                            <b>${escapeHtml(story.subtitle || '')}</b>
                        </div>
                        <div class="dungeon-story-title">${escapeHtml(storyPickup.label || '拾獲物件')}｜${escapeHtml(storyPickup.title || '')}</div>
                        <p class="dungeon-story-quote">「${escapeHtml(storyPickup.quote || '')}」</p>
                        ${story.synopsis ? `<p>${escapeHtml(story.synopsis)}</p>` : ''}
                        ${story.mechanicUnlock ? `<div class="dungeon-unlock-note">通關解鎖｜${escapeHtml(story.mechanicUnlock.title || '')}</div>` : ''}
                    </section>
        ` : '';

        const modalHTML = `
            <div class="dungeon-entrance-modal" id="dungeon-entrance-modal" role="dialog" aria-modal="true">
                <div class="dungeon-entrance-card dungeon-${escapeHtml(dungeonType)} ${dungeonImage ? 'has-dungeon-scene' : ''}" style="--dungeon-accent: ${escapeHtml(entranceConfig?.color || '#67d8ff')}${dungeonSceneStyle}">
                    <header class="dungeon-entrance-header">
                        <div class="dungeon-entrance-icon">${dungeonVisual}</div>
                        <div>
                            <span>副本入口</span>
                            <h2>${escapeHtml(dungeonData.name)}</h2>
                            <p>${isLevelOK ? '等級符合' : '等級不足'} / Lv.${dungeonData.recommendLevel}+</p>
                        </div>
                    </header>

                    <section class="dungeon-entrance-info">
                        <p>${escapeHtml(dungeonData.description || '')}</p>
                        <div class="dungeon-entrance-stats">
                            <span><b>難度</b>${escapeHtml(dungeonData.difficulty || '-')}</span>
                            <span><b>層數</b>${dungeonData.floors || dungeonData.bossFloor || 5}</span>
                            <span><b>Boss 層</b>${dungeonData.bossFloor || '-'}</span>
                            <span><b>建議</b>Lv.${dungeonData.recommendLevel}</span>
                        </div>
                    </section>

                    ${riskBriefHTML}

                    ${storyHTML}

                    <section class="dungeon-mechanic-info">
                        <b>${escapeHtml(mechanicInfo.name)}</b>
                        <span>${escapeHtml(mechanicInfo.description)}</span>
                    </section>

                    <div class="dungeon-entrance-actions">
                        <button id="btn-enter-dungeon" class="btn btn-primary" type="button" ${!isLevelOK ? 'disabled' : ''}>進入副本</button>
                        <button id="btn-cancel-dungeon" class="btn btn-secondary" type="button">離開</button>
                    </div>

                    ${!isLevelOK ? '<div class="dungeon-entrance-warning">等級不足，無法進入此副本。</div>' : ''}
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 綁定按鈕事件
        const modal = document.getElementById('dungeon-entrance-modal');
        const enterBtn = document.getElementById('btn-enter-dungeon');
        const cancelBtn = document.getElementById('btn-cancel-dungeon');
        
        enterBtn.addEventListener('click', () => {
            if (!isLevelOK) return;
            modal.remove();
            this.worldMap.clearCurrentDungeon();
            if (this.app?.enterDungeon) {
                this.app.enterDungeon(dungeonType);
            } else {
                window.location.hash = `#dungeon-${dungeonType}`;
            }
        });
        
        cancelBtn.addEventListener('click', () => {
            modal.remove();
            this.worldMap.clearCurrentDungeon();
            // 解除移動鎖定
            this.isLocked = false;
        });
        
        // 點擊背景關閉
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                this.worldMap.clearCurrentDungeon();
                // 解除移動鎖定
                this.isLocked = false;
            }
        });
    }
    
    getDungeonMechanicDescription(mechanic) {
        const mechanics = {
            darkness: {
                name: '黑暗籠罩',
                description: '視野受限，可能遭遇突襲。攜帶火把可減輕效果。'
            },
            cold: {
                name: '極寒侵襲',
                description: '寒氣逐漸累積，會定期消耗補給；寒冷滿100點時造成凍傷。'
            },
            puzzle: {
                name: '古代謎題',
                description: '需要收集石碑線索才能辨認機關順序，貿然啟動會觸發陷阱。'
            },
            maze: {
                name: '迷霧迷宮',
                description: '濃霧使人迷失方向，需要收集路標才能找到出口。'
            },
            burn: {
                name: '灼熱地獄',
                description: '持續受到灼燒傷害，並加速裝備耐久消耗。建議準備治療與抗火手段。'
            }
        };
        
        return mechanics[mechanic] || { name: '未知', description: '未知的副本機制' };
    }

    getDungeonRiskBrief(dungeonType, dungeonData = {}, mechanicInfo = {}, isLevelOK = true) {
        const mechanicType = dungeonData.mechanic?.type || dungeonType;
        const counterItemNames = {
            torch: '火把',
            warm_cloak: '保暖披風',
            ancient_codex: '古代典籍',
            antidote: '解毒劑',
            fire_charm: '抗火護符'
        };
        const prepByMechanic = {
            darkness: '帶上火把或提高防禦，黑暗中容易被連續消耗。',
            cold: '準備保暖披風、藥水與冰寒抗性，寒冷累積會拖長戰線。',
            puzzle: '先收集石碑或符文線索，亂碰機關會直接吃陷阱。',
            maze: '準備解毒與毒素減免，迷霧會讓路線與戰鬥一起變麻煩。',
            burn: '確認火焰減免、藥水與裝備耐久，灼熱會把失誤放大。'
        };
        const riskByMechanic = {
            darkness: '視野縮小，遭遇與陷阱會更晚被看見。',
            cold: '移動會累積寒冷，補給消耗會比普通地區更快。',
            puzzle: '機關判讀失誤會造成額外傷害或錯過獎勵。',
            maze: '迷霧會干擾前進方向，毒素壓力會持續堆高。',
            burn: '熔岩與熱浪會造成持續傷害，裝備耐久也會更快下降。'
        };

        const hazards = Array.isArray(dungeonData.environment?.hazards)
            ? dungeonData.environment.hazards.slice(0, 2).join('、')
            : '';
        const guaranteed = dungeonData.treasures?.guaranteed?.name || '';
        const counterItem = dungeonData.mechanic?.counterItem;
        const counterText = counterItem ? counterItemNames[counterItem] || counterItem : '';
        const levelLine = `建議 Lv.${dungeonData.recommendLevel || '?'}；目前${isLevelOK ? '可以進入' : '等級不足，先升級或更換裝備'}。`;

        return {
            risks: [
                levelLine,
                riskByMechanic[mechanicType] || mechanicInfo.description || '副本內會有比野外更集中的危險。',
                hazards ? `常見危害：${hazards}。` : ''
            ].filter(Boolean),
            rewards: [
                dungeonData.story?.rewardFocus || '',
                dungeonData.story?.mechanicUnlock?.title ? `通關解鎖：${dungeonData.story.mechanicUnlock.title}。` : '',
                guaranteed ? `首通或核心獎勵方向：${guaranteed}。` : ''
            ].filter(Boolean),
            preparations: [
                prepByMechanic[mechanicType] || '',
                counterText ? `對策物品：${counterText}。` : '',
                '進入前整理背包，保留藥水與裝備替換空間。'
            ].filter(Boolean)
        };
    }

    renderDungeonRiskBrief(brief = {}) {
        const groups = [
            { key: 'risks', title: '風險', tone: 'risk', items: brief.risks || [] },
            { key: 'rewards', title: '獎勵方向', tone: 'reward', items: brief.rewards || [] },
            { key: 'preparations', title: '建議準備', tone: 'prep', items: brief.preparations || [] }
        ].filter(group => group.items.length > 0);

        if (groups.length === 0) return '';

        const compact = typeof window !== 'undefined' && window.innerHeight <= 680;
        const itemLimit = compact ? 2 : 3;

        return `
            <section class="dungeon-risk-brief">
                ${groups.map(group => `
                    <div class="dungeon-risk-card is-${escapeHtml(group.tone)}">
                        <b>${escapeHtml(group.title)}</b>
                        <ul>
                            ${group.items.slice(0, itemLimit).map(item => `<li>${escapeHtml(item)}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </section>
        `;
    }
    
    // ===== 返回家處理 =====
    
    handleReturnHome() {
        // 顯示確認彈窗
        const modalHTML = `
            <div class="home-modal" id="home-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 10000;">
                <div class="home-card" style="background: linear-gradient(145deg, #2d1f1a, #3d2b20); padding: 24px; border-radius: 16px; max-width: 400px; width: 90%; border: 2px solid #ffb347; box-shadow: 0 0 30px rgba(255, 179, 71, 0.4);">
                    <div class="home-header" style="text-align: center; margin-bottom: 20px;">
                        <div style="font-size: 64px; margin-bottom: 10px;">🏠</div>
                        <h2 style="color: #ffb347; margin: 0 0 8px 0; font-size: 24px;">溫暖的家</h2>
                        <div style="color: #aaa; font-size: 14px;">回到這裡可以完全恢復</div>
                    </div>
                    
                    <div class="home-info" style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                        <p style="color: #ccc; font-size: 14px; margin: 0 0 12px 0; text-align: center;">
                            返回大廳將會：
                        </p>
                        <ul style="color: #8cc63f; font-size: 13px; margin: 0; padding-left: 20px;">
                            <li style="margin-bottom: 6px;">💚 完全恢復生命值</li>
                            <li>✨ 清除所有負面狀態</li>
                        </ul>
                    </div>
                    
                    <div class="home-actions" style="display: flex; gap: 12px; justify-content: center;">
                        <button id="btn-return-home" class="btn btn-primary" style="flex: 1; padding: 12px; font-size: 16px; background: linear-gradient(145deg, #ffb347, #ff8c00); border: none; border-radius: 8px; color: white; cursor: pointer; font-weight: bold;">
                            🏠 回家休息
                        </button>
                        <button id="btn-cancel-home" class="btn btn-secondary" style="flex: 1; padding: 12px; font-size: 16px; background: #444; border: none; border-radius: 8px; color: white; cursor: pointer;">
                            ❌ 繼續探索
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 綁定按鈕事件
        const modal = document.getElementById('home-modal');
        const returnBtn = document.getElementById('btn-return-home');
        const cancelBtn = document.getElementById('btn-cancel-home');
        
        returnBtn.addEventListener('click', () => {
            modal.remove();
            
            // 恢復玩家所有狀態
            const char = GameManager.getCharacter();
            if (char) {
                char.hp = char.maxHp || 100;
                char.currentHP = char.maxHp || 100;
                
                // 清除負面狀態（如果有的話）
                if (char.debuffs) {
                    char.debuffs = [];
                }
                if (char.statusEffects) {
                    char.statusEffects = char.statusEffects.filter(e => e.positive);
                }
            }
            // 返回大廳
            this.app.navigateTo('lobby');
        });
        
        cancelBtn.addEventListener('click', () => {
            modal.remove();
            this.isLocked = false;
        });
        
        // 點擊背景關閉
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                this.isLocked = false;
            }
        });
    }
    
    // ===== 劇情事件系統 (Slay the Spire 風格) =====
    
    handlePlayerDeathReturnHome(reason = 'adventure-death') {
        const char = GameManager.getCharacter();
        if (char) {
            const safeHp = Math.max(1, Math.floor((char.maxHp || 100) * 0.3));
            char.hp = safeHp;
            char.currentHP = safeHp;
        }

        GameManager.setFlag?.('death.pendingPenalty', true);
        GameManager.setFlag?.('death.lastReason', reason);
        GameManager.requestTownNarrativeReset?.('death_return');
        GameManager.markSaveDirty?.(reason);
        GameManager.notify?.('all');

        if (this.app?.navigateTo) {
            this.app.navigateTo('lobby');
        } else if (this.app?.loadScene) {
            this.app.loadScene('lobby');
        } else {
            window.location.hash = '#lobby';
        }
    }

    triggerStoryEvent() {
        const zone = this.worldMap.getCurrentZone();
        const event = eventManager.triggerRandomEvent(
            zone,
            this.worldMap?.getEventContext?.() || { stepCount: this.worldMap?.travelStep }
        );
        
        if (!event) {
            this.worldMap.clearCurrentEvent();
            return;
        }
        
        this.showStoryEventModal(event);
    }
    
    showStoryEventModal(event) {
        if (!this.dom.storyEventModal) return;
        
        // 設置標題和描述
        if (this.dom.storyEventIcon) this.dom.storyEventIcon.innerHTML = this.renderEventVisual(event);
        if (this.dom.storyEventTitle) this.dom.storyEventTitle.textContent = event.name;
        if (this.dom.storyEventType) this.dom.storyEventType.textContent = this.getStoryEventLabel(event);
        if (this.dom.storyEventDescription) this.dom.storyEventDescription.textContent = event.description;
        
        // 生成選項按鈕
        if (this.dom.storyEventChoices) {
            this.dom.storyEventChoices.innerHTML = '';
            
            event.choices.forEach((choice, index) => {
                const btn = document.createElement('button');
                btn.className = 'story-choice-btn';
                
                let costText = '';
                if (choice.cost) {
                    if (choice.cost.gold) costText += `💰 -${choice.cost.gold} 金幣 `;
                    if (choice.cost.hp) {
                        const hpCost = choice.cost.isPercent 
                            ? `${Math.floor(choice.cost.hp * 100)}% 生命`
                            : `${choice.cost.hp} 生命`;
                        costText += `❤️ -${hpCost} `;
                    }
                }
                
                let chanceText = '';
                if (choice.chance !== undefined) {
                    chanceText = `<span class="choice-chance">(${Math.floor(choice.chance * 100)}% 成功)</span>`;
                }

                const intentText = this.getStoryChoiceIntent(choice);
                const choiceMeta = this.getStoryChoiceMeta(choice);
                costText = choiceMeta.costText;
                chanceText = choiceMeta.chanceText;
                
                btn.innerHTML = `
                    <span class="choice-text">${choice.text}</span>
                    ${intentText ? `<span class="choice-intent">${intentText}</span>` : ''}
                    ${costText ? `<span class="choice-cost">${costText}</span>` : ''}
                    ${chanceText}
                `;
                
                btn.addEventListener('click', () => this.executeStoryChoice(index));
                this.dom.storyEventChoices.appendChild(btn);
            });
        }
        
        // 隱藏結果區域
        if (this.dom.storyEventResult) {
            this.dom.storyEventResult.style.display = 'none';
        }
        
        // 顯示選項區域
        if (this.dom.storyEventChoices) {
            this.dom.storyEventChoices.style.display = 'flex';
        }
        
        this.dom.storyEventModal.style.display = 'flex';
    }

    getStoryChoiceMeta(choice = {}) {
        let costText = '';
        if (choice.cost?.gold) costText += `金幣 -${choice.cost.gold} `;
        if (choice.cost?.hp) {
            const hpCost = choice.cost.isPercent
                ? `${Math.floor(choice.cost.hp * 100)}% 生命`
                : `${choice.cost.hp} 生命`;
            costText += `生命 -${hpCost} `;
        }

        const chanceText = choice.chance !== undefined
            ? `<span class="choice-chance">(${Math.floor(choice.chance * 100)}% 成功)</span>`
            : '';

        return { costText, chanceText };
    }

    getStoryEventLabel(event = {}) {
        const cleanTypeLabels = {
            blessing: '補給',
            curse: '危機',
            gamble: '抉擇',
            trade: '交易',
            mystery: '謎團',
            encounter: '遭遇'
        };

        const cleanRoleLabels = {
            resource: '資源',
            risk_reward: '風險回報',
            trade: '交易',
            story_seed: '故事線索',
            side_story: '支線',
            world_lore: '世界見聞',
            pressure: '壓力'
        };

        const cleanType = cleanTypeLabels[event.type] || '事件';
        const cleanRole = cleanRoleLabels[event.eventRole] || '';
        return cleanRole ? `${cleanType} / ${cleanRole}` : cleanType;
    }

    getStoryChoiceIntent(choice = {}) {
        if (choice.intent || choice.hint) return choice.intent || choice.hint;

        const collectCleanResults = (entry) => {
            if (!entry) return [];
            if (Array.isArray(entry)) return entry.flatMap(collectCleanResults);
            if (Array.isArray(entry.results)) return collectCleanResults(entry.results);
            if (Array.isArray(entry.successResults) || Array.isArray(entry.failResults)) {
                return [
                    ...collectCleanResults(entry.successResults),
                    ...collectCleanResults(entry.failResults)
                ];
            }
            if (Array.isArray(entry.randomResults)) return collectCleanResults(entry.randomResults);
            return [entry];
        };

        if (choice.cost?.gold || choice.cost?.hp) {
            return '需要付出代價，適合想換取更明確回報時選擇。';
        }
        if (choice.chance !== undefined || choice.isRandom) {
            return '結果不穩定，可能帶來額外收穫或損失。';
        }

        const cleanTypes = new Set(collectCleanResults(choice).map(result => String(result?.type || '')));
        if (cleanTypes.has('world_interaction')) return '會推動地圖、線索或世界狀態。';
        if (cleanTypes.has('unlock_quest')) return '會打開新的委託或故事紀錄。';
        if (cleanTypes.has('item')) return '可能取得可用物資。';
        if (cleanTypes.has('gold')) return '可能取得金幣。';
        if (cleanTypes.has('exp')) return '可能取得經驗。';
        if (cleanTypes.has('heal')) return '可以恢復生命，適合整理狀態。';
        if (cleanTypes.has('buff')) return '會帶來短時間戰鬥強化。';
        if (cleanTypes.has('damage') || cleanTypes.has('debuff')) return '可能承受傷害或不利狀態。';
        return '觀察這件事，讓旅途留下新的判斷。';
    }
    
    executeStoryChoice(choiceIndex) {
        const result = eventManager.executeChoiceByIndex(choiceIndex);
        
        // 隱藏選項，顯示結果
        if (this.dom.storyEventChoices) {
            this.dom.storyEventChoices.style.display = 'none';
        }
        
        if (this.dom.storyEventResult && this.dom.storyResultMessages) {
            this.dom.storyResultMessages.innerHTML = result.messages.map(msg => 
                `<div class="result-message-item">${msg}</div>`
            ).join('');
            
            if (result.messages.length === 0) {
                this.dom.storyResultMessages.innerHTML = '<div class="result-message-item">什麼都沒發生...</div>';
            }
            
            this.dom.storyEventResult.style.display = 'block';
        }
        
        this.updateUI();
    }
    
    closeStoryEventModal() {
        if (this.dom.storyEventModal) {
            this.dom.storyEventModal.style.display = 'none';
        }
        this.worldMap.clearCurrentEvent();
        // 解除移動鎖定
        this.isLocked = false;
        this.updateUI();
    }
    
    generateTreasureItem(zone) {
        const rarityByZone = {
            'low': [ItemRarity.COMMON, ItemRarity.UNCOMMON],
            'medium': [ItemRarity.UNCOMMON, ItemRarity.RARE],
            'high': [ItemRarity.RARE, ItemRarity.EPIC],
            'death': [ItemRarity.EPIC, ItemRarity.LEGENDARY]
        };
        
        const possibleRarities = rarityByZone[zone] || [ItemRarity.COMMON];
        const rarity = possibleRarities[Math.floor(Math.random() * possibleRarities.length)];
        
        // 隨機生成物品類型
        const itemType = Math.random();
        const timestamp = Date.now();
        
        if (itemType < 0.3) {
            // 生成藥水
            const potions = [
                new Consumable(`treasure_hp_${timestamp}`, '生命藥水', ItemType.POTION, rarity, '🧪', '恢復生命值的藥水', 50, { hp: 50 }),
                new Consumable(`treasure_medkit_${timestamp}`, '急救藥水', ItemType.POTION, rarity, '🩹', '恢復大量生命值的藥水', 60, { hp: 80 })
            ];
            return potions[Math.floor(Math.random() * potions.length)];
        } else if (itemType < 0.6) {
            // 生成材料
            return new Item(`treasure_material_${timestamp}`, '神秘礦晶', ItemType.MATERIAL, rarity, '🔮', '從寶箱中發現的神秘礦晶', 100);
        }
        
        return null;
    }
    
    showEventModal(icon, title, description, resultHTML) {
        if (!this.dom.eventModal) return;
        
        const isLandmarkEvent = Boolean(icon && typeof icon === 'object' && icon.type === 'landmark');
        this.dom.eventModal.classList.toggle('is-landmark-event', isLandmarkEvent);
        if (this.dom.eventIcon) {
            this.dom.eventIcon.classList.toggle('is-scene-image', isLandmarkEvent);
            this.dom.eventIcon.innerHTML = this.renderEventVisual(icon, title);
        }
        if (this.dom.eventTitle) this.dom.eventTitle.textContent = title;
        if (this.dom.eventDescription) this.dom.eventDescription.textContent = description;
        if (this.dom.eventResult) this.dom.eventResult.innerHTML = resultHTML;
        
        this.dom.eventModal.style.display = 'flex';
    }

    renderEventVisual(eventOrIcon, title = '') {
        const event = typeof eventOrIcon === 'object' && eventOrIcon ? eventOrIcon : null;
        const icon = event?.icon || eventOrIcon || '◆';
        const imageId = this.getEventMapPropId(event, title);
        const image = event?.image
            || (event?.landmarkId ? this.getLandmarkImage(event.landmarkId, { full: true }) : '')
            || (imageId ? getGeneratedMapPropImage(imageId) : '');
        const label = event?.name || title || '';
        if (image) {
            return `<img src="${escapeHtml(image)}" alt="${escapeHtml(label)}">`;
        }
        return escapeHtml(icon);
    }

    getEventMapPropId(event = null, title = '') {
        const id = event?.id || '';
        const type = event?.type || '';
        const byId = {
            ancient_shrine: 'sealed_altar',
            healing_spring: 'herb_patch',
            cursed_chest: 'hidden_stash_mound',
            dark_spirit: 'random_event_spark',
            mysterious_merchant: 'merchant_wagon',
            dice_demon: 'random_event_spark',
            wandering_blacksmith: 'ore_vein',
            fairy_deal: 'herb_patch',
            mysterious_statue: 'carved_stone_tablet',
            dimensional_rift: 'abyss_crack',
            foragers_emergency_stash: 'hidden_stash_mound',
            leyline_splinter: 'random_event_spark',
            ash_scout_report: 'blackflame_tile',
            abandoned_blueprint_cache: 'hidden_stash_mound',
            field_notice_board: 'notice_board',
            special_bounty_notice: 'notice_board',
            weathered_route_tablet: 'carved_stone_tablet',
            injured_adventurer: 'campfire_ashes',
            ancient_guardian: 'ancient_ruin_arch'
        };
        if (byId[id]) return byId[id];
        const titleText = String(title || '');
        if (titleText.includes('寶箱')) return 'hidden_stash_mound';
        if (titleText.includes('泉')) return 'herb_patch';
        if (titleText.includes('陷阱')) return 'silver_silk_trap';
        const byType = {
            blessing: 'sealed_altar',
            curse: 'abyss_crack',
            gamble: 'random_event_spark',
            trade: 'merchant_wagon',
            mystery: 'random_event_spark',
            encounter: 'campfire_ashes'
        };
        return byType[type] || '';
    }
    
    closeEventModal() {
        if (this.dom.eventModal) {
            this.dom.eventModal.style.display = 'none';
        }
        // 解除移動鎖定
        this.isLocked = false;
    }

    showWorldDiscovery(outcome = {}) {
        const newClues = outcome.newClues || [];
        if (newClues.length === 0) return;

        const firstClue = newClues[0];
        showGlobalToast('新痕跡', firstClue.title, 'info');
        if (this.dom.btnToggleClueBook && !this.clueBookOpen) {
            this.dom.btnToggleClueBook.classList.add('has-new');
        }
        this.updateWorldNarrativePanel();
    }

    // ===== Battle Logic =====

    startBattle() {
        const monster = this.worldMap.getCurrentMonster();
        audioManager.play('combat-start', { throttleKey: 'adventure-combat-start', throttleMs: 650 });
        audioManager.playBgm('combat');
        this.currentBattleZone = monster?.zoneId || this.worldMap?.getCurrentZone?.() || null;
        if (monster && !monster.zoneId) {
            monster.zoneId = this.currentBattleZone;
        }
        
        this.battleLog = []; // 清空戰鬥日誌
        this.currentBattle = new AdventureBattleViewController(GameManager.getCharacter(), monster, this);
        this.dom.battleModal.classList.remove('battle-result-mode');
        if (this.dom.battleBody) this.dom.battleBody.hidden = false;
        if (this.dom.lootModal) {
            this.dom.lootModal.classList.remove('is-entering');
            this.dom.lootModal.style.display = 'none';
        }
        this.clearActionCooldowns();
        this.dom.battleModal.style.display = 'flex';
        
        this.updateMonsterDisplay();
        this.updatePlayerHUD();
        this.updateActionDeck();
        this.updateBuffIndicators();        this.rhythmSystem = new RhythmBarSystem(GameManager.getCharacter(), this.container);
        this.rhythmSystem.start();
        this.offhandRhythmSystem = new RhythmBarSystem(GameManager.getCharacter(), this.container, {
            weaponSlot: 'armor',
            windowMode: true,
            windowCycles: 2,
            ringMode: true,
            barSelector: '#offhand-rhythm-ring',
            needleSelector: '#offhand-rhythm-needle',
            hitZoneSelector: '#offhand-hit-zone',
            critZoneSelector: '#offhand-crit-zone',
            attackSelector: '#action-offhand'
        });
        this.offhandRhythmSystem.start();

        // Disable attack button until engine is ready to avoid race conditions
        try {
            if (this.dom && this.dom.attackBtn) this.dom.attackBtn.disabled = true;
        } catch (e) {}

        // If FightManager engine is available, create an engine instance and start monster auto-attack
        try {
            if (FightManager && FightManager.BattleController) {
                this.currentBattle._engine = new FightManager.BattleController(this.currentBattle.player, this.currentBattle.monster);
                if (typeof this.currentBattle._engine.startAutoAttack === 'function') {
                    this.currentBattle._engine.startAutoAttack();
                }
                    try { if (this.dom && this.dom.attackBtn) this.dom.attackBtn.disabled = false; } catch (e) {}
                    try { if (this.currentBattle._engine && typeof this.currentBattle._engine.beginBattle === 'function') this.currentBattle._engine.beginBattle(); } catch (e) {}
                    this.configureFightEngineCallbacks(this.currentBattle._engine);
            } else {
                // If not ready yet, wait for the dynamic import to resolve
                FightManagerReady.then(mod => {
                    if (mod && mod.BattleController && this.currentBattle) {
                        this.currentBattle._engine = new mod.BattleController(this.currentBattle.player, this.currentBattle.monster);
                        if (typeof this.currentBattle._engine.startAutoAttack === 'function') {
                            this.currentBattle._engine.startAutoAttack();
                        }
                            try { if (this.dom && this.dom.attackBtn) this.dom.attackBtn.disabled = false; } catch (e) {}
                            try { if (this.currentBattle._engine && typeof this.currentBattle._engine.beginBattle === 'function') this.currentBattle._engine.beginBattle(); } catch (e) {}
                            this.configureFightEngineCallbacks(this.currentBattle._engine);
                    }
                }).catch(err => console.warn('Failed to initialize FightManager engine:', err));
            }
        } catch (e) {
            console.warn('Error initializing FightManager engine:', e);
        }
    }

    configureFightEngineCallbacks(engine) {
        if (!engine) return;

        engine._onAutoAttack = (res) => {
            if (!res) return;
            try {
                if (res.destroyedArmor) this.updateEquipmentDisplay();
                this.updateUI();
                this.updatePlayerHUD();

                if (res.stunned) {
                    this.currentBattle?.showStatusFeedback?.({ type: 'stun', name: '暈眩', icon: '⚡' });
                    this.updateMonsterDisplay();
                } else if (res.damage > 0) {
                    this.currentBattle?.showPlayerHitFeedback?.(res.damage);
                }

                if (res.reflectedDamage > 0) {
                    this.currentBattle?.showEffectNumber?.('reflect', res.reflectedDamage, `🛡 反傷 -${res.reflectedDamage}`);
                    this.updateMonsterDisplay();
                }
                if (res.revived) {
                    this.currentBattle?.showEffectNumber?.('revive', 0, '✨ 復甦');
                    this.updatePlayerHUD();
                }

                this.currentBattle?.endTurn?.();
                if (res.playerHp <= 0 && !res.revived) this.currentBattle?.handleDefeat?.();
                if (this.currentBattle?.monster?.isDead?.()) this.currentBattle?.handleVictory?.();
            } catch (e) {
                console.warn('Error handling auto-attack UI update:', e);
            }
        };

        engine._onStatusApplied = (events = []) => {
            events.forEach(event => this.currentBattle?.showStatusFeedback?.(event));
            this.updateMonsterDisplay();
        };

        engine._onStatusTick = (events = []) => {
            events.forEach(event => {
                this.currentBattle?.showStatusTickFeedback?.(event);
                this.updateMonsterDisplay();
                if (event.type === 'hpRegen' || event.type === 'void') {
                    this.updateUI();
                    this.updatePlayerHUD();
                }
                if (event.targetDefeated) {
                    this.currentBattle?.handleVictory?.();
                }
            });
        };
    }

    endBattle(victory, options = {}) {
        const { keepModalOpen = false, keepLocked = false } = options;
        if (!keepModalOpen) {
            this.dom.battleModal.classList.remove('battle-result-mode');
            if (this.dom.battleBody) this.dom.battleBody.hidden = false;
            if (this.dom.lootModal) {
                this.dom.lootModal.classList.remove('is-entering');
                this.dom.lootModal.style.display = 'none';
            }
            this.dom.battleModal.style.display = 'none';
        }
        if (this.rhythmSystem) {
            this.rhythmSystem.stop();
            this.rhythmSystem = null;
        }
        if (this.offhandRhythmSystem) {
            this.offhandRhythmSystem.stop();
            this.offhandRhythmSystem = null;
        }
        audioManager.restoreSceneBgm();
        this.worldMap.clearCurrentMonster();
        // Stop engine auto-attack if running
        try {
            if (this.currentBattle && this.currentBattle._engine && typeof this.currentBattle._engine.stopAutoAttack === 'function') {
                this.currentBattle._engine.stopAutoAttack();
            }
        } catch (e) {
            console.warn('Error stopping engine auto-attack:', e);
        }

        // Ensure attack button disabled after battle ends
        try { if (this.dom && this.dom.attackBtn) this.dom.attackBtn.disabled = true; } catch (e) {}

        this.currentBattle = null;

        // 清除戰鬥結束時的 Buff
        const char = GameManager.getCharacter();
        char.clearAllBuffs();

        // 解除移動鎖定
        if (!keepLocked) this.isLocked = false;

        this.updateUI();
    }

    handleAttackClick() {
        if (!this.currentBattle || this.currentBattle.battleEnded) return;
        if (!this.rhythmSystem) return;
        
        // judgeHit() 返回 { type: 'crit'|'hit'|'miss'|'cooldown', damage: number }
        const result = this.rhythmSystem.judgeHit();
        
        // 冷卻中無法攻擊
        if (result.type === 'cooldown') {            return;
        }
        
        // 傳遞 hitType 給戰鬥系統
        const attackResult = this.currentBattle.playerAttack(result.type);
        if (attackResult && !this.currentBattle?.battleEnded) {
            this.offhandRhythmSystem?.activateWindow?.();
        }
    }

    handleOffhandAttackClick() {
        if (!this.currentBattle || this.currentBattle.battleEnded) return;
        if (!this.offhandRhythmSystem) return;

        const result = this.offhandRhythmSystem.judgeHit();
        if (result.type === 'cooldown' || result.type === 'inactive') {
            return;
        }

        this.currentBattle.playerAttack(result.type, { slotType: 'armor', offhand: true });
    }

    handleFleeClick() {
        if (!this.currentBattle || this.currentBattle.battleEnded) return;
        const fleeCard = this.container.querySelector('#action-flee');
        if (isCombatActionCooling(fleeCard)) return;
        audioManager.play('flee', { throttleKey: 'adventure-flee', throttleMs: 180 });
        startCombatActionCooldown(fleeCard, 1);
        this.currentBattle.flee();
    }
    
    // 技能使用：已由 UI 移除（保留空位以避免破壞原本結構）

    handlePotionUse() {
        if (!this.currentBattle || this.currentBattle.battleEnded) return;
        const potionCard = this.container.querySelector('#action-potion');
        if (isCombatActionCooling(potionCard)) return;

        const inventory = GameManager.state.inventory;
        const potionStack = inventory.find(stack => stack.item.type === 'potion');
        
        if (!potionStack || potionStack.quantity <= 0) {            return;
        }
        
        const potion = potionStack.item;
        const char = GameManager.getCharacter();
        
        // 使用藥水
        if (potion.effect?.hp) {
            const healingBonus = typeof char.getPassiveCombatBonus === 'function'
                ? Math.max(0, Number(char.getPassiveCombatBonus('healingReceived')) || 0)
                : 0;
            const healAmount = Math.min(
                Math.max(1, Math.floor(potion.effect.hp * (1 + healingBonus))),
                char.maxHp - char.hp
            );
            char.hp += healAmount;
        }
        // 處理 Buff 藥水
        if (potion.buff) {
            char.addBuff(potion.buff.type, potion.buff.value, potion.buff.duration);
            const buffNames = { 'atk': '攻擊力', 'def': '防禦力', 'critChance': '爆擊率' };            this.updateBuffIndicators();
        }
        
        // 減少數量
        potionStack.quantity--;
        if (potionStack.quantity <= 0) {
            const index = inventory.indexOf(potionStack);
            if (index > -1) inventory.splice(index, 1);
        }
        audioManager.play('heal', { throttleKey: 'adventure-potion', throttleMs: 180 });
        startCombatActionCooldown(potionCard, 1);

        // 更新UI
        this.updatePlayerHUD();
        this.updateActionDeck();
        this.updateUI();
    }
    
    // 玩家戰鬥操作維持攻擊、道具、逃跑；戰術技能顯示於 Buff 區。
    
    // 新增：更新 Buff 顯示
    updateBuffIndicators() {
        renderCombatBuffIndicators(this.dom.buffIndicators, GameManager.getCharacter());
    }

    updateMonsterDisplay() {
        if (!this.currentBattle) return;
        renderCombatMonster(this.container, this.currentBattle.monster);
    }

    updatePlayerHUD() {
        renderCombatPlayer(this.container, GameManager.getCharacter(), {
            inventory: GameManager.state.inventory,
            fallbackName: '冒險者'
        });
    }

    updateActionDeck() {
        const character = GameManager.getCharacter();
        renderCombatActionDeck(this.container, character, {
            inventory: GameManager.state.inventory,
            unarmedName: '拳頭',
            emptyPotionName: '沒有補給'
        });
        this.rhythmSystem?.updateCharacter?.(character);
        this.offhandRhythmSystem?.updateCharacter?.(character);
    }

    clearActionCooldowns() {
        ['#action-weapon', '#action-offhand', '#action-potion', '#action-flee', '#btn-attack', '#btn-item', '#btn-flee']
            .map(selector => this.container.querySelector(selector))
            .filter(Boolean)
            .forEach(card => clearCombatActionCooldown(card));
    }
    
    /**
     * 更新裝備顯示（包括耐久度）
     */
    updateEquipmentDisplay() {
        const char = GameManager.getCharacter();
        
        // 更新武器顯示
        const weapon = char.equipment.weapon;
        const weaponCard = this.container.querySelector('#action-weapon');
        const weaponDamageEl = this.container.querySelector('#weapon-damage');
        const weaponIconEl = this.container.querySelector('#weapon-icon');
        const weaponNameEl = this.container.querySelector('#weapon-name');
        
        if (weapon) {
            if (weaponDamageEl) weaponDamageEl.textContent = char.getTotalAtk();
            
            // 顯示耐久度
            let durabilityEl = weaponCard?.querySelector('.durability-display');
            if (!durabilityEl && weaponCard) {
                durabilityEl = document.createElement('div');
                durabilityEl.className = 'durability-display';
                weaponCard.appendChild(durabilityEl);
            }
            if (durabilityEl) {
                const dur = weapon.durability ?? 18;
                const maxDur = weapon.maxDurability ?? 18;
                const durPercent = (dur / maxDur) * 100;
                const durClass = durPercent <= 20 ? 'critical' : durPercent <= 50 ? 'warning' : '';
                durabilityEl.className = `durability-display ${durClass}`;
                durabilityEl.textContent = `🔧 ${dur}/${maxDur}`;
            }
        } else {
            // 沒有武器
            if (weaponIconEl) weaponIconEl.textContent = '✊';
            if (weaponNameEl) weaponNameEl.textContent = '拳頭';
            if (weaponDamageEl) weaponDamageEl.textContent = char.getTotalAtk();
            
            // 移除耐久度顯示
            const durabilityEl = weaponCard?.querySelector('.durability-display');
            if (durabilityEl) durabilityEl.remove();
        }
        
        // 更新防具顯示（如果有顯示的話）
        const armor = char.equipment.armor;
        const defenseEl = this.container.querySelector('#player-defense');
        if (defenseEl) {
            defenseEl.textContent = char.getTotalDef();
        }
    }

    showLoot(exp, gold, items) {
        audioManager.play('loot', { throttleKey: 'adventure-loot-open', throttleMs: 300 });
        this.dom.battleModal?.classList.add('battle-result-mode');
        if (this.dom.battleBody) this.dom.battleBody.hidden = true;
        this.dom.lootModal.classList.remove('is-entering');
        this.dom.lootModal.style.display = 'flex';

        const lootTitle = this.dom.lootModal.querySelector('.modal-header h2');
        const expEl = this.container.querySelector('#exp-gained');
        const goldEl = this.container.querySelector('#gold-gained');
        if (lootTitle) lootTitle.textContent = '戰鬥結算';
        if (expEl) expEl.textContent = `+${exp} 經驗`;
        if (goldEl) goldEl.textContent = `+${gold}`;

        // Local lootPool (array of item objects)
        let lootPool = Array.isArray(items) ? items.slice() : [];

        const lootContainer = this.dom.lootItems;
        const inventoryPanel = this.container.querySelector('#loot-current-inventory');
        const capacityBadge = this.container.querySelector('#loot-inventory-capacity');
        const countBadge = this.container.querySelector('#loot-count');
        const revealStrip = this.container.querySelector('#loot-reveal-strip');

        const rarityLabel = {
            common: '普通',
            uncommon: '優良',
            rare: '稀有',
            epic: '史詩',
            legendary: '傳說'
        };
        const getRarity = item => String(item?.rarity || 'common').toLowerCase();
        const getQuantity = item => Math.max(1, Number(item?.quantity) || 1);
        const getTypeLabel = item => {
            if (item?.autoUnlockedBlueprint || item?.type === 'blueprint') return '圖紙';
            const typeLabels = {
                material: '材料',
                potion: '藥水',
                consumable: '消耗品',
                weapon: '武器',
                armor: '防具',
                accessory: '飾品',
                scroll: '卷軸'
            };
            return typeLabels[item?.type] || String(item?.type || '物品').toUpperCase();
        };
        const getIconHtml = item => getItemVisualHtml(item, item?.autoUnlockedBlueprint ? '📜' : '◇');
        const attachLootTooltip = (element, item, options = {}) => {
            attachItemTooltip(element, item, {
                quantity: getQuantity(item),
                typeText: getTypeLabel(item),
                rarityText: rarityLabel[getRarity(item)] || getRarity(item),
                ...options
            });
        };
        if (revealStrip) {
            revealStrip.hidden = true;
            revealStrip.innerHTML = '';
        }

        // Helper to render player's current inventory (left panel)
        const updatePlayerInventory = () => {
            const stateInv = GameManager.state.inventory || [];
            const capacity = GameManager.state.inventoryCapacity || 0;

            if (capacityBadge) capacityBadge.textContent = `${stateInv.length}/${capacity}`;

            if (!inventoryPanel) return;
            inventoryPanel.innerHTML = '';

            if (stateInv.length === 0) {
                inventoryPanel.innerHTML = '<div class="empty-state loot-grid-empty">背包是空的</div>';
                return;
            }

            stateInv.forEach(stack => {
                const it = stack.item || {};
                const quantity = Math.max(1, Number(stack.quantity) || 1);
                const rarity = getRarity(it);
                const slot = document.createElement('button');
                slot.type = 'button';
                slot.className = `loot-slot loot-grid-cell rarity-frame rarity-${rarity} ${rarity}`;
                slot.dataset.instanceId = stack.instanceId || '';
                slot.setAttribute('aria-label', `${it.name || '未知物品'}，點擊放到地上騰出背包格`);
                slot.innerHTML = `
                    <div class="slot-icon">${getIconHtml(it)}</div>
                    ${quantity > 1 ? `<span class="slot-quantity">x${quantity}</span>` : ''}
                    <div class="slot-name">${escapeHtml(it.name || '未知')}</div>
                    <span class="slot-action" aria-hidden="true">→</span>
                `;
                attachLootTooltip(slot, { ...it, quantity }, { hint: '放到地上騰出背包格；離開時未帶走會遺失' });
                // Move from inventory back to loot pool
                slot.onclick = () => {
                    const instanceId = slot.dataset.instanceId;
                    if (!instanceId) return;
                    const removed = GameManager.removeItemByInstanceId(instanceId, false);
                    if (removed) {
                        // removed is the item instance
                        closeItemTooltip();
                        lootPool.push({ ...removed, quantity });
                        updatePlayerInventory();
                        updateLootPool();
                    }
                };

                inventoryPanel.appendChild(slot);
            });
        };

        // Helper to render loot pool (right panel)
        const updateLootPool = () => {
            if (countBadge) countBadge.textContent = `${lootPool.length} 件`;
            if (!lootContainer) return;
            lootContainer.innerHTML = '';

            if (lootPool.length === 0) {
                lootContainer.innerHTML = '<div class="empty-state loot-grid-empty">戰利品已整理完畢</div>';
                return;
            }

            lootPool.forEach((it, idx) => {
                const isBlueprint = it.autoUnlockedBlueprint || it.type === 'blueprint';
                const rarity = getRarity(it);
                const quantity = getQuantity(it);
                const slot = document.createElement('button');
                slot.type = 'button';
                slot.className = `loot-slot loot-grid-cell rarity-frame rarity-${rarity} ${rarity} ${isBlueprint ? 'is-blueprint' : ''}`;
                slot.style.setProperty('--reveal-delay', `${Math.min(idx, 8) * 45}ms`);
                slot.setAttribute('aria-label', `${it.name || '未知物品'}，${isBlueprint ? '點擊整理圖紙紀錄' : '點擊放入背包'}`);
                slot.innerHTML = `
                    <div class="slot-icon">${getIconHtml(it)}</div>
                    ${quantity > 1 ? `<span class="slot-quantity">x${quantity}</span>` : ''}
                    <div class="slot-name">${escapeHtml(it.name || '未知物品')}</div>
                    <span class="slot-action" aria-hidden="true">${isBlueprint ? '✓' : '←'}</span>
                `;
                attachLootTooltip(slot, it, { hint: isBlueprint ? '圖紙已登錄，點擊收起紀錄' : '點擊放入背包' });
                // Click to take from loot to inventory
                slot.onclick = () => {
                    closeItemTooltip();
                    if (isBlueprint) {
                        lootPool.splice(idx, 1);
                        updateLootPool();
                        return;
                    }

                    const success = GameManager.addToInventory(it, quantity);
                    if (!success) {
                        showGlobalToast('背包已滿', '請先將左側物品移回右側或擴充背包。', 'warning');
                        return;
                    }
                    // remove from lootPool
                    lootPool.splice(idx, 1);
                    updatePlayerInventory();
                    updateLootPool();
                };

                lootContainer.appendChild(slot);
            });
        };

        // Initialize panels
        updatePlayerInventory();
        updateLootPool();

        // Close button behavior: remaining loot is abandoned. Adventure cannot use warehouse storage.
        const closeBtn = this.dom.lootCloseBtn || this.container.querySelector('#btn-close-loot');
        if (closeBtn) {
            if (this.lootCloseHandler) {
                closeBtn.removeEventListener('click', this.lootCloseHandler);
            }

            this.lootCloseHandler = () => {
                const lostCount = lootPool.filter(it => !(it.autoUnlockedBlueprint || it.type === 'blueprint')).length;
                closeItemTooltip();
                // hide result stage
                this.closeBattleResult();
                // cleanup
                lootPool = [];
                updatePlayerInventory();
                updateLootPool();
                // Remove this listener to avoid duplicates
                closeBtn.removeEventListener('click', this.lootCloseHandler);
                this.lootCloseHandler = null;
                if (lostCount > 0) {
                    showGlobalToast('戰利品留在原地', `未放入背包的 ${lostCount} 件物品已遺失。`, 'warning');
                }
            };
            closeBtn.addEventListener('click', this.lootCloseHandler);
        }
    }

    closeBattleResult() {
        if (this.dom.lootModal) {
            this.dom.lootModal.classList.remove('is-entering');
            this.dom.lootModal.style.display = 'none';
        }
        if (this.dom.battleBody) this.dom.battleBody.hidden = false;
        if (this.dom.battleModal) {
            this.dom.battleModal.classList.remove('battle-result-mode');
            this.dom.battleModal.style.display = 'none';
        }
        this.isLocked = false;
        this.updateUI();
    }
}

class AdventureBattleViewController {
    constructor(player, monster, scene) {
        this.player = player;
        this.monster = monster;
        this.scene = scene;
        this.battleEnded = false;
        this.attackCooldown = false;
        this.turnCount = 0;
    }

    playerAttack(hitType, options = {}) {
        if (this.attackCooldown || this.battleEnded) return;

        if (!this._engine) {
            console.error('Fight engine not initialized; cannot perform player attack.');
            return;
        }

        const res = this._engine.playerAttack(hitType, options);
        if (!res) return;
        this.scene.rhythmSystem?.setBattleAttackSpeedBonus?.(
            this._engine.getPlayerAttackSpeedBonusPercent?.() || 0
        );
        this.scene.offhandRhythmSystem?.setBattleAttackSpeedBonus?.(
            this._engine.getPlayerAttackSpeedBonusPercent?.() || 0
        );

        // Update equipment UI if weapon was destroyed
        if (res.destroyedWeapon) {
            this.scene.updateEquipmentDisplay();
            this.scene.updateActionDeck();
        }

        const computeRes = res.computeRes || {};
        const applyRes = res.applyRes || {};

        // show miss
        if (hitType === 'miss') this.showDamageNumber(0, false, true);

        // show actual final damage
        if (applyRes && typeof applyRes.finalDamage === 'number') {
            const doubleStrikeDamage = Math.max(0, Number(applyRes.doubleStrike?.finalDamage) || 0);
            const profileStrikeDamage = Math.max(0, Number(applyRes.profileStrike?.finalDamage) || 0);
            const primaryDamage = Math.max(0, applyRes.finalDamage - doubleStrikeDamage - profileStrikeDamage);
            this.showDamageNumber(primaryDamage || applyRes.finalDamage, computeRes.isCrit, false);
            if (applyRes.poisonExecuted) {
                this.showEffectNumber('statusPoison', applyRes.poisonAccumulated || 0, '☠️ 毒素處決');
            }
            if (profileStrikeDamage > 0) {
                this.showEffectNumber('doubleStrike', profileStrikeDamage, `${applyRes.profileStrike?.label || '武器追擊'} -${profileStrikeDamage}`);
            }
            if (doubleStrikeDamage > 0) {
                this.showEffectNumber('doubleStrike', doubleStrikeDamage, `⚡ 連擊 -${doubleStrikeDamage}`);
            }
            this.scene.updateMonsterDisplay();
        }

        // lifesteal feedback
        if (applyRes && applyRes.lifestealRecovered && applyRes.lifestealRecovered > 0) {
            this.showEffectNumber('lifesteal', applyRes.lifestealRecovered, `❤ 吸血 +${applyRes.lifestealRecovered}`);
            this.scene.updateUI();
            this.scene.updatePlayerHUD();
        }

        // Victory handled by scene when engine marks monster dead
        if (this.monster.isDead && this.monster.isDead()) {
            this.handleVictory();
        }

        return res;
    }
    
    // 技能戰鬥 API 已移除（Adventure 的 BattleController 中）
    
    showDamageNumber(damage, isCrit, isMiss) {
        showCombatDamageNumber(this.scene.container, damage, {
            type: isMiss ? 'dodge' : damage <= 0 ? 'block' : isCrit ? 'critical' : 'normal',
            isCrit,
            isMiss
        });
    }

    showEffectNumber(type, amount = 0, label = null) {
        showCombatDamageNumber(this.scene.container, amount, { type, label });
    }

    showStatusFeedback(effect) {
        if (!effect) return;
        const textMap = {
            stun: '⚡ 暈眩',
            slow: `❄️ 緩速 ${Math.round(effect.percent || 0)}%`,
            poison: `☠️ 毒素 +${effect.accumulatePerSecond || 0}/秒`,
            void: `◈ 虛空吞噬 ${effect.damagePerSecond || 0}/秒`,
            attackSpeed: `✨ 攻速 +${Math.round(effect.totalPercent || effect.percent || 0)}%`,
            hpRegen: `💚 回復 +${effect.amount || 0}`
        };
        const typeMap = {
            stun: 'statusStun',
            slow: 'statusSlow',
            poison: 'statusPoison',
            void: 'dot',
            attackSpeed: 'statusBuff',
            hpRegen: 'lifesteal'
        };
        showCombatDamageNumber(this.scene.container, 0, {
            type: typeMap[effect.type] || 'status',
            label: textMap[effect.type] || effect.name || '狀態'
        });
    }

    showStatusTickFeedback(event) {
        if (!event) return;
        if (event.type === 'poison') {
            showCombatDamageNumber(this.scene.container, event.amount || 0, {
                type: 'statusPoison',
                label: `☠️ 毒素 ${event.accumulated || event.afterAccumulated || 0}`
            });
        } else if (event.type === 'void') {
            showCombatDamageNumber(this.scene.container, event.damage || event.amount || 0, {
                type: 'dot',
                label: `◈ 虛空 -${event.damage || event.amount || 0}`
            });
            if ((event.healAmount || 0) > 0) {
                showCombatDamageNumber(this.scene.container, event.healAmount || 0, {
                    type: 'lifesteal',
                    label: `◈ 吞噬 +${event.healAmount || 0}`
                });
            }
        } else if (event.type === 'hpRegen') {
            showCombatDamageNumber(this.scene.container, event.amount || 0, {
                type: 'lifesteal',
                label: `💚 回復 +${event.amount || 0}`
            });
        }
    }
    
    startCooldown(duration) {
        this.attackCooldown = true;
        const attackBtn = this.scene.container.querySelector('#action-weapon');
        if (!attackBtn) return;

        let cooldownRing = attackBtn.querySelector('.action-cooldown-ring');
        if (!cooldownRing) {
            cooldownRing = document.createElement('span');
            cooldownRing.className = 'action-cooldown-ring';
            cooldownRing.innerHTML = '<span class="action-cooldown-value">0</span>';
            attackBtn.appendChild(cooldownRing);
        }
        const timer = cooldownRing.querySelector('.action-cooldown-value');
        attackBtn.classList.add('is-cooling');
        attackBtn.setAttribute('aria-disabled', 'true');

        const startTime = Date.now();
        const updateCooldown = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            const remaining = Math.max(0, duration - elapsed);
            const progress = duration > 0 ? (1 - remaining / duration) * 100 : 100;

            attackBtn.style.setProperty('--cooldown-progress', `${progress}%`);
            if (timer) timer.textContent = remaining >= 1 ? String(Math.ceil(remaining)) : remaining.toFixed(1);

            if (remaining > 0) {
                requestAnimationFrame(updateCooldown);
            } else {
                attackBtn.classList.remove('is-cooling');
                attackBtn.removeAttribute('aria-disabled');
                attackBtn.style.removeProperty('--cooldown-progress');
                this.attackCooldown = false;

                // 恢復節奏條並生成新的隨機區域
                if (this.scene.rhythmSystem) {
                    this.scene.rhythmSystem.resume();
                    this.scene.rhythmSystem.generateZones();
                }
            }
        };
        
        requestAnimationFrame(updateCooldown);
    }

    monsterAttack() {
        if (this.battleEnded) return;

        // If engine present, delegate
        try {
            if (this._engine && typeof this._engine.monsterAttack === 'function') {
                const res = this._engine.monsterAttack();
                if (!res) return;

                // Update UI / equipment when armor destroyed
                if (res.destroyedArmor) this.scene.updateEquipmentDisplay();

                // Refresh UI
                this.scene.updateUI();
                this.scene.updatePlayerHUD();

                if (res.stunned) {
                    this.showStatusFeedback({ type: 'stun', name: '暈眩', icon: '⚡' });
                    this.scene.updateMonsterDisplay();
                } else if (res.damage > 0) {
                    this.showPlayerHitFeedback(res.damage);
                }

                if (res.reflectedDamage > 0) {
                    this.showEffectNumber('reflect', res.reflectedDamage, `🛡 反傷 -${res.reflectedDamage}`);
                    this.scene.updateMonsterDisplay();
                }
                if (res.revived) {
                    this.showEffectNumber('revive', 0, '✨ 復甦');
                    this.scene.updatePlayerHUD();
                }

                // End turn housekeeping
                this.endTurn();

                if (res.playerHp <= 0 && !res.revived) {
                    this.handleDefeat();
                }
                if (this.monster.isDead?.()) this.handleVictory();

                return;
            }
        } catch (e) {
            console.error('Delegated monsterAttack failed:', e);
        }

        // Fallback original behavior
        if (this.battleEnded) return;

        const damage = Math.max(1, this.monster.attack - this.player.getTotalDef());
        this.player.hp = Math.max(0, this.player.hp - damage);

        // 防具耐久度消耗
        const destroyedArmor = GameManager.reduceArmorDurability();
        if (destroyedArmor) {
            this.scene.updateEquipmentDisplay();
        }

        this.scene.updateUI();
        this.scene.updatePlayerHUD();

        // 玩家受擊反饋
        this.showPlayerHitFeedback(damage);

        // 戰鬥節奏結算處理
        this.endTurn();

        if (this.player.hp <= 0) {
            this.handleDefeat();
        }
    }
    
    // 新增：戰鬥節奏結算處理
    endTurn() {
        this.turnCount++;
        
        // 減少 Buff 持續時間
        this.player.tickBuffs();
        this.scene.updateBuffIndicators();
        
        // 玩家主動技能已移除；戰術技能不需要冷卻更新。
    }
    
    showPlayerHitFeedback(damage) {
        const battleModal = this.scene.container.querySelector('.battle-modal');
        showCombatPlayerHitFeedback(battleModal, this.player, damage);
    }

    handleVictory() {
        if (this.battleEnded) return;
        this.battleEnded = true;
        showCombatKillFreeze(this.scene.container.querySelector('.battle-modal') || this.scene.container);
        
        // 使用 DropManager 的 resolve + generate 流程取得掉落物品
        const zoneId = this.monster.zoneId
            || this.scene?.currentBattleZone
            || this.scene?.worldMap?.getCurrentZone?.()
            || null;
        const sources = resolveDropSources({ monster: this.monster, zoneId });
        const rewardEffects = getRewardEffectTotals(this.player);
        const drops = generateDropsFromSources(sources, {
            rng: Math.random,
            dropBonus: rewardEffects.dropBonus
        });
        const baseGold = this.monster.gold || 0;
        const gold = Math.floor(baseGold * (1 + (rewardEffects.goldBonus || 0) / 100));
        
        // 將掉落 ID 轉換成物品實例
        const droppedItems = [];
        markMonsterKnown(this.monster, { zoneId });
        for (const drop of drops) {
            // 嘗試從材料資料庫獲取
            const item = resolveItemById(drop.itemId, {
                order: ['material', 'equipment', 'shop', 'bossEquipment', 'questReward']
            });
            // 如果不是材料，嘗試從裝備資料庫獲取
            if (item) {
                markItemKnown(drop.itemId);
                droppedItems.push({
                    ...item,
                    quantity: drop.quantity,
                    instanceId: Date.now() + Math.random().toString(36).substr(2, 9)
                });
            }
        }

        const blueprintUnlocks = rollRecipeBlueprintDrops({
            monster: this.monster,
            zoneId
        });
        const blueprintItems = createRecipeBlueprintDisplayItems(blueprintUnlocks);
        blueprintUnlocks.forEach(unlock => markBlueprintKnown(unlock.seriesId || unlock.recipeId));
        if (blueprintItems.length > 0) {
            droppedItems.push(...blueprintItems);
            showGlobalToast('取得製作圖', blueprintItems.map(item => item.recipeName).join('、'), 'success');
        }
        
        const exp = Math.floor((this.monster.exp || 0) * (1 + (rewardEffects.expBonus || 0) / 100));
        this.player.exp += exp;
        this.player.checkLevelUp();
        GameManager.addGold(gold);

        // 任務系統：更新擊殺進度
        questManager.updateProgress(ObjectiveType.KILL, this.monster.id || this.monster.type, 1);
        const storyOutcome = worldStoryManager.recordMonsterKill(this.monster, { zoneId });
        this.scene.showWorldDiscovery(storyOutcome);

        setTimeout(() => {
            this.scene.endBattle(true, { keepModalOpen: true, keepLocked: true });
            this.scene.showLoot(exp, gold, droppedItems);
        }, 360);
    }

    handleDefeat() {
        this.battleEnded = true;
        audioManager.play('defeat', { throttleKey: 'adventure-defeat', throttleMs: 600 });
        
        this.player.hp = Math.max(1, Math.floor(this.player.maxHp * 0.3));
        
        // 任務系統：更新死亡統計
        questManager.updateStats('death');
        
        setTimeout(() => {
            this.scene.endBattle(false, { keepLocked: true });
            showGlobalToast('戰敗回城', '你被送回大廳。死亡懲罰規則保留待定。', 'warning');
            this.scene.handlePlayerDeathReturnHome?.('adventure-death');
            return;
            showGlobalToast('戰鬥失敗', `你被擊敗了，損失了 ${penalty} 金幣。`, 'warning');
        }, 1500);
    }

    flee() {
        if (Math.random() < 0.5) {
            this.battleEnded = true;
            setTimeout(() => this.scene.endBattle(false), 200);
        } else {
            // If engine present, invoke its monsterAttack immediately.
            // Do not fallback to scheduling the old scene monsterAttack to avoid duplicate
            // countdowns or unexpected extra hits during engine transition.
            if (this._engine && typeof this._engine.monsterAttack === 'function') {
                const res = this._engine.monsterAttack();
                if (res?.stunned) {
                    this.showStatusFeedback({ type: 'stun', name: '暈眩', icon: '⚡' });
                    this.scene.updateMonsterDisplay();
                } else if (res) {
                    if (res.destroyedArmor) this.scene.updateEquipmentDisplay();
                    this.scene.updateUI();
                    this.scene.updatePlayerHUD();
                    if (res.damage > 0) this.showPlayerHitFeedback(res.damage);
                    if (res.reflectedDamage > 0) {
                        this.showEffectNumber('reflect', res.reflectedDamage, `🛡 反傷 -${res.reflectedDamage}`);
                        this.scene.updateMonsterDisplay();
                    }
                    if (res.revived) {
                        this.showEffectNumber('revive', 0, '✨ 復甦');
                        this.scene.updatePlayerHUD();
                    }
                    if (res.playerHp <= 0 && !res.revived) this.handleDefeat();
                    if (this.monster.isDead?.()) this.handleVictory();
                }
            } else {
                console.warn('Fight engine not initialized; cannot perform monster attack after failed flee.');
            }
        }
    }
}

// Export AdventureScene with inventory management methods
AdventureScene.prototype.openInventoryModal = function() {
    if (!this.dom.inventoryModal) return;
    
    this.renderInventory();
    this.dom.inventoryModal.style.display = 'flex';
    setTimeout(() => {
        this.dom.inventoryModal.classList.add('active');
    }, 10);
};

AdventureScene.prototype.closeInventoryModal = function() {
    if (!this.dom.inventoryModal) return;

    this.dom.inventoryModal.classList.remove('active');
    setTimeout(() => {
        this.dom.inventoryModal.style.display = 'none';
    }, 300);
};

AdventureScene.prototype.renderInventory = function() {
    const state = GameManager.state;

    // Update capacity
    if (this.dom.inventoryCapacity) {
        this.dom.inventoryCapacity.textContent = `${state.inventory.length}/${state.inventoryCapacity}`;
    }
    
    // Render equipment slots
    this.renderEquipmentSlots();
    
    if (!this.dom.inventoryList) return;

    const inventory = state.inventory || [];
    this.dom.inventoryList.innerHTML = '';

    if (inventory.length === 0) {
        this.dom.inventoryList.innerHTML = '<div class="empty-hint inventory-grid-empty">背包空空如也...</div>';
        return;
    }

    inventory.forEach(stack => {
        const item = stack.item || {};
        const quantity = Math.max(1, Number(stack.quantity) || 1);
        const rarity = item.rarity || 'common';
        const itemEl = document.createElement('button');
        itemEl.type = 'button';
        itemEl.className = `item-card inventory-item adventure-inventory-cell rarity-frame rarity-${rarity}`;
        itemEl.dataset.instanceId = stack.instanceId || '';
        itemEl.setAttribute('aria-label', `${item.name || '未知物品'}，點擊開啟操作`);

        const iconHtml = getItemVisualHtml(item, '📦');

        itemEl.innerHTML = `
            <div class="item-icon">${iconHtml}</div>
            ${quantity > 1 ? `<span class="quantity-badge">x${quantity}</span>` : ''}
            <div class="item-name">${escapeHtml(item.name || '未知')}</div>
        `;

        attachItemTooltip(itemEl, item, { quantity, hint: '點擊開啟操作' });
        this.dom.inventoryList.appendChild(itemEl);
    });
};

// Update visible inventory items (virtualization renderer)
AdventureScene.prototype.updateVisibleInventoryItems = function() {
    // The adventure inventory is now a compact icon grid, so no virtualization refresh is needed.
};

// Build static layer canvas for the whole map (backgrounds, grid, walls)
AdventureScene.prototype.buildStaticLayer = function() {
    if (!this.worldMap) return;

    try {
        const map = this.worldMap;
        const gridSize = map.gridSize;
        const width = map.mapWidth;
        const height = map.mapHeight;

        // Create offscreen canvas
        const off = document.createElement('canvas');
        off.width = width;
        off.height = height;
        const octx = off.getContext('2d');

        // Draw the authored world-map backdrop first, then keep data-driven overlays above it.
        const worldMapBackground = this.getCanvasImage(getGeneratedBackgroundImage('adventure-world-map'));
        if (!this.drawCanvasStretchedImage(octx, worldMapBackground, 0, 0, width, height, 0.86)) {
            octx.fillStyle = '#09100f';
            octx.fillRect(0, 0, width, height);
        }
        octx.fillStyle = 'rgba(3, 7, 8, 0.28)';
        octx.fillRect(0, 0, width, height);

        // Draw tiles as a painted map surface, not a visible debug grid.
        for (let r = 0; r < map.rows; r++) {
            for (let c = 0; c < map.cols; c++) {
                const cell = map.mapData[r][c];
                const x = c * gridSize;
                const y = r * gridSize;
                const zone = cell.zone;

                // Zone background / stroke using centralized ZONE_COLORS
                const zInfo = ZONE_COLORS[zone] || { fill: 'rgba(100,100,100,0.08)', stroke: 'rgba(100,100,100,0.14)' };
                octx.fillStyle = zInfo.fill;
                octx.fillRect(x, y, gridSize, gridSize);

                octx.strokeStyle = zInfo.stroke;
                octx.lineWidth = 1;
                octx.strokeRect(x, y, gridSize, gridSize);

                const seed = ((c + 11) * 97 + (r + 5) * 57) % 17;
                if (seed % 4 === 0) {
                    octx.fillStyle = zInfo.texture || 'rgba(255,255,255,0.08)';
                    octx.beginPath();
                    octx.ellipse(
                        x + gridSize * (0.28 + (seed % 3) * 0.16),
                        y + gridSize * (0.32 + (seed % 5) * 0.08),
                        gridSize * 0.04,
                        gridSize * 0.025,
                        seed * 0.28,
                        0,
                        Math.PI * 2
                    );
                    octx.fill();
                }

                if (seed % 7 === 0) {
                    octx.strokeStyle = zInfo.texture || 'rgba(255,255,255,0.08)';
                    octx.lineWidth = 1;
                    octx.beginPath();
                    octx.moveTo(x + gridSize * 0.18, y + gridSize * 0.68);
                    octx.bezierCurveTo(
                        x + gridSize * 0.34,
                        y + gridSize * 0.54,
                        x + gridSize * 0.58,
                        y + gridSize * 0.76,
                        x + gridSize * 0.82,
                        y + gridSize * 0.58
                    );
                    octx.stroke();
                }

                // Walls rendered in static layer
                if (cell.type === 'wall') {
                    octx.fillStyle = 'rgba(26, 28, 29, 0.86)';
                    octx.fillRect(x + 4, y + 4, gridSize - 8, gridSize - 8);
                    octx.strokeStyle = 'rgba(160, 150, 122, 0.2)';
                    octx.strokeRect(x + 4, y + 4, gridSize - 8, gridSize - 8);
                }
            }
        }

        const landmarkSites = Array.isArray(map.landmarks) ? map.landmarks : [];
        const getNearestLandmarkDistance = (site) => {
            let nearest = Infinity;
            for (const other of landmarkSites) {
                if (!other || other === site || other.landmarkId === site?.landmarkId) continue;
                const distance = Math.hypot((other.x || 0) - (site.x || 0), (other.y || 0) - (site.y || 0));
                if (distance > 0 && distance < nearest) nearest = distance;
            }
            return nearest;
        };

        const drawLandmarkRegion = (site) => {
            const landmark = getLandmark(site?.landmarkId);
            if (!landmark) return;

            const baseRadius = Number(landmark.regionRadius || landmark.encounterRadius || landmark.hintRadius || 2.4);
            const nearestDistance = getNearestLandmarkDistance(site);
            const neighborLimit = Number.isFinite(nearestDistance) ? nearestDistance * 0.42 : 3.2;
            const radiusCells = Math.max(1.15, Math.min(3.4, baseRadius, neighborLimit));
            const cx = (site.x + 0.5) * gridSize;
            const cy = (site.y + 0.5) * gridSize;
            const rx = radiusCells * gridSize * 0.92;
            const ry = radiusCells * gridSize * 0.62;
            const style = getLandmarkRegionStyle(landmark);
            const zone = map.mapData?.[site.y]?.[site.x]?.zone;
            const zoneStyle = ZONE_COLORS[zone] || ZONE_COLORS.low;

            octx.save();
            octx.translate(cx, cy);
            octx.rotate((((site.x + 5) * 17 + (site.y + 3) * 11) % 14 - 7) * Math.PI / 180);

            const gradient = octx.createRadialGradient(0, 0, gridSize * 0.3, 0, 0, Math.max(rx, ry));
            gradient.addColorStop(0, style.fill);
            gradient.addColorStop(0.58, style.fill);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            octx.fillStyle = gradient;
            octx.beginPath();
            octx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
            octx.fill();

            octx.strokeStyle = style.edge;
            octx.lineWidth = 1.25;
            octx.setLineDash([gridSize * 0.12, gridSize * 0.12]);
            octx.beginPath();
            octx.ellipse(0, 0, rx * 0.88, ry * 0.82, 0, 0, Math.PI * 2);
            octx.stroke();
            octx.setLineDash([]);

            octx.strokeStyle = style.texture || zoneStyle.texture || 'rgba(255,255,255,0.1)';
            octx.lineWidth = 1.4;
            for (let i = -1; i <= 1; i += 1) {
                const offset = i * ry * 0.24;
                octx.beginPath();
                octx.moveTo(-rx * 0.58, offset);
                octx.bezierCurveTo(
                    -rx * 0.22,
                    offset - ry * 0.18,
                    rx * 0.12,
                    offset + ry * 0.16,
                    rx * 0.58,
                    offset - ry * 0.04
                );
                octx.stroke();
            }
            octx.restore();
        };

        for (const site of map.landmarks || []) {
            drawLandmarkRegion(site);
        }

        // Save to instance
        this.staticCanvas = off;
        this.staticCtx = octx;
        this.staticDirty = false;
    } catch (e) {
        console.warn('buildStaticLayer failed:', e);
        this.staticCanvas = null;
        this.staticCtx = null;
        this.staticDirty = true;
    }
};

AdventureScene.prototype.renderEquipmentSlots = function() {
    const state = GameManager.state;
    const equipment = state.character.equipment;

    const renderSlot = (slotEl, item, fallbackIcon) => {
        if (!slotEl) return;

        const iconEl = slotEl.querySelector('.equipment-slot-icon');
        const nameEl = slotEl.querySelector('.equipment-slot-name');

        if (item) {
            slotEl.classList.remove('empty');
            slotEl.classList.add('equipped');
            slotEl.setAttribute('aria-label', `查看 ${item.name || '裝備'}`);

            if (iconEl) {
                iconEl.innerHTML = getItemVisualHtml(item, fallbackIcon);
            }
            if (nameEl) nameEl.textContent = item.name || '已裝備';

            attachItemTooltip(slotEl, item, { hint: '點擊開啟操作' });
            return;
        }

        slotEl.classList.add('empty');
        slotEl.classList.remove('equipped');
        slotEl.removeAttribute('aria-label');
        detachItemTooltip(slotEl);
        if (iconEl) iconEl.textContent = fallbackIcon;
        if (nameEl) nameEl.textContent = '未裝備';
    };

    renderSlot(this.dom.slotWeapon, equipment.weapon, '⚔️');
    renderSlot(this.dom.slotArmor, equipment.armor, '🛡️');
    renderSlot(this.dom.slotAccessory, equipment.accessory, '💍');
};

AdventureScene.prototype.showInventoryItemModal = function(stack) {
    const item = stack.item;
    closeItemTooltip();
    const isEquipment = item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory';
    const isConsumable = item.type === 'potion' || item.type === 'scroll';
    // Actions
    const actions = [];
    if (isEquipment) {
        const addEquipButton = (label, className, slotType = null) => {
            const equipBtn = document.createElement('button');
            equipBtn.className = className;
            equipBtn.textContent = label;
            equipBtn.addEventListener('click', () => {
                if (slotType) {
                    GameManager.equipItemToSlot(stack.instanceId, slotType, false);
                } else {
                    GameManager.equipItem(stack.instanceId, false);
                }
                this.closeItemDetailModal();
                this.renderInventory();
                this.updateEquipmentDisplay();
                this.updateActionDeck();
            });
            actions.push(equipBtn);
        };

        if (item.type === 'weapon') {
            addEquipButton('⚔️ 裝備主手', 'btn btn-primary', 'weapon');
            addEquipButton('🗡️ 裝備副手', 'btn btn-primary', 'armor');
        } else {
            addEquipButton('⚔️ 裝備', 'btn btn-primary');
        }
    }
    if (isConsumable) {
        const useBtn = document.createElement('button');
        useBtn.className = 'btn btn-info';
        useBtn.textContent = '🧪 使用';
        useBtn.addEventListener('click', () => {
            GameManager.useConsumable(stack.instanceId, false);
            this.closeItemDetailModal();
            this.renderInventory();
        });
        actions.push(useBtn);
    }

    const sellBtn = document.createElement('button');
    sellBtn.className = 'btn btn-info';
    sellBtn.textContent = '💰 販售';
    sellBtn.addEventListener('click', async () => {
        const sellPrice = getSellPrice(stack.item, stack.quantity);
        const confirmed = await confirmAction({
            title: '確認出售',
            message: `出售「${stack.item.name}」x${stack.quantity} 後會從背包移除。`,
            details: [`可獲得 ${sellPrice} 金幣`],
            confirmText: '出售',
            type: 'warning'
        });
        if (!confirmed) return;

        const earnedGold = GameManager.sellItem(stack.instanceId, false);
        this.closeItemDetailModal();
        this.renderInventory();
        if (earnedGold !== false) {
            showGlobalToast('出售完成', `已出售「${stack.item.name}」，獲得 ${earnedGold} 金幣。`, 'success');
        }
    });
    actions.push(sellBtn);

    if (window.ItemDetailModal) {
        window.ItemDetailModal.open(item, {
            ...buildItemModalOptions(item),
            actions: actions
        });
    }
};

AdventureScene.prototype.showEquipmentModal = function(item, slotType) {
    closeItemTooltip();
    const actions = [];
    const unequipBtn = document.createElement('button');
    unequipBtn.className = 'btn btn-info';
    unequipBtn.textContent = '🔓 卸下裝備';
    unequipBtn.addEventListener('click', () => {
        GameManager.unequipItem(slotType, false);
        this.closeItemDetailModal();
        this.renderInventory();
    });
    actions.push(unequipBtn);

    if (window.ItemDetailModal) {
        window.ItemDetailModal.open(item, {
            ...buildItemModalOptions(item),
            actions: actions
        });
    }
};

AdventureScene.prototype.closeItemDetailModal = function() {
    closeItemTooltip();
    if (window.ItemDetailModal && typeof window.ItemDetailModal.close === 'function') {
        window.ItemDetailModal.close();
        return;
    }

    const modal = this.dom.itemModal;
    if (modal) modal.classList.remove('active');
};

/**
 * 格式化詞綴屬性為可讀文字
 */
// Global functions for adventure item actions (for backward compatibility)
window.adventureEquipItem = function(instanceId) {
    GameManager.equipItem(instanceId, false);
    window.adventureRefreshInventory();
};

window.adventureUseItem = function(instanceId) {
    GameManager.useConsumable(instanceId, false);
    window.adventureRefreshInventory();
};

window.adventureSellItem = async function(instanceId) {
    const stack = GameManager.state.inventory.find(s => s.instanceId === instanceId);
    if (!stack) return;
    
    const sellPrice = getSellPrice(stack.item, stack.quantity);
    const confirmed = await confirmAction({
        title: '確認出售',
        message: `出售「${stack.item.name}」x${stack.quantity} 後會從背包移除。`,
        details: [`可獲得 ${sellPrice} 金幣`],
        confirmText: '出售',
        type: 'warning'
    });
    if (confirmed) {
        const earnedGold = GameManager.sellItem(instanceId, false);
        window.adventureRefreshInventory();
        if (earnedGold !== false) {
            showGlobalToast('出售完成', `已出售「${stack.item.name}」，獲得 ${earnedGold} 金幣。`, 'success');
        }
    }
};

window.adventureDiscardItem = async function(instanceId) {
    const stack = GameManager.state.inventory.find(s => s.instanceId === instanceId);
    if (!stack) return;
    
    const confirmed = await confirmAction({
        title: '確認回收',
        message: `回收「${stack.item.name}」後會永久移除。`,
        confirmText: '回收',
        type: 'danger'
    });
    if (confirmed) {
        const index = GameManager.state.inventory.findIndex(s => s.instanceId === instanceId);
        if (index > -1) {
            GameManager.state.inventory.splice(index, 1);
            GameManager.notify('inventory');
        }
        showGlobalToast('已回收物品', `「${stack.item.name}」已移除。`, 'info');
    }
    window.adventureRefreshInventory();
};

window.adventureRefreshInventory = function() {
    const adventureScene = window.currentAdventureScene;
    if (adventureScene && adventureScene.renderInventory) {
        adventureScene.renderInventory();
    }
};
