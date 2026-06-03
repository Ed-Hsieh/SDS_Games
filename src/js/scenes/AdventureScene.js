/**
 * AdventureScene.js
 * Logic for the Adventure scene (Map, Battle, Events, etc.)
 */
import GameManager, { Weapon, Armor, Accessory, Consumable, Item, ItemType, ItemRarity } from '../managers/GameManager.js';
import WorldMap from '../utils/WorldMap.js';
import { eventManager } from '../managers/EventManager.js';
import { questManager, ObjectiveType } from '../managers/QuestManager.js';
import { resolveDropSources, generateDropsFromSources } from '../managers/DropManager.js';
import { getRewardEffectTotals } from '../managers/EquipmentEffectResolver.js';
import { createRecipeBlueprintDisplayItems, rollRecipeBlueprintDrops } from '../managers/BlueprintManager.js';
import { markBlueprintKnown, markItemKnown, markMonsterKnown } from '../managers/EncyclopediaManager.js';
import { worldStoryManager } from '../managers/WorldStoryManager.js';
import { resolveItemById } from '../utils/ItemResolver.js';
import { getSellPrice } from '../models/ItemSchema.js';
import { buildItemModalOptions, escapeHtml } from '../utils/ItemDisplay.js';
import { attachItemTooltip, closeItemTooltip, detachItemTooltip } from '../utils/ItemTooltip.js';
import { confirmAction, showGlobalToast } from '../utils/UIFeedback.js';
import RhythmBarSystem from '../utils/RhythmBarSystem.js';
import { getLandmark } from '../data/WorldStories.js';
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

const AMBUSH_MANTIS_CHAIN_ID = 'ambush_mantis';
const AMBUSH_MANTIS_BOSS_ID = 'ambush_mantis';
const AMBUSH_MANTIS_BAIT_ITEM_ID = 'silver_thread_bait';
const AMBUSH_MANTIS_TRIGGER_LANDMARK_ID = 'silver_snare_pass';
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
    low: { hex: '#31583b', fill: 'rgba(32, 74, 44, 0.46)', stroke: 'rgba(109, 142, 93, 0.08)', texture: 'rgba(153, 190, 131, 0.18)' },
    medium: { hex: '#394f4b', fill: 'rgba(42, 63, 59, 0.48)', stroke: 'rgba(118, 145, 135, 0.08)', texture: 'rgba(141, 169, 154, 0.16)' },
    high: { hex: '#685a43', fill: 'rgba(82, 71, 52, 0.5)', stroke: 'rgba(190, 166, 116, 0.09)', texture: 'rgba(216, 181, 95, 0.16)' },
    death: { hex: '#5b332e', fill: 'rgba(83, 45, 39, 0.54)', stroke: 'rgba(207, 98, 79, 0.1)', texture: 'rgba(228, 120, 95, 0.15)' }
};

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
        this.animationFrameId = null;
        this.lootCloseHandler = null;
        this.clueBookOpen = false;
        this.bossTestOpen = false;
        this.currentLocationKey = null;
        this.locationToastRecentKeys = new Map();
        this.locationToastRepeatCooldownMs = 12000;
        this.locationToastTimer = null;
        this.smallLocationHintKey = null;
        this.smallLocationHintRecentKeys = new Map();
        this.smallLocationHintRepeatCooldownMs = 7000;
        this.smallLocationHintTimer = null;
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
            locationToast: this.container.querySelector('#location-toast'),
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
        const potionCard = this.container.querySelector('#action-potion');
        const fleeCard = this.container.querySelector('#action-flee');
        
        if (weaponCard) weaponCard.addEventListener('click', () => this.handleAttackClick());
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

        if (this.dom.btnToggleBossTest) {
            this.dom.btnToggleBossTest.addEventListener('click', () => this.toggleBossTestPanel());
        }

        if (this.dom.btnCloseBossTest) {
            this.dom.btnCloseBossTest.addEventListener('click', () => this.toggleBossTestPanel(false));
        }

        if (this.dom.bossTestPanel) {
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

        const result = this.worldMap.movePlayer(dx, dy);
        this.handleMapMoveResult(result);
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
        // If modal is open, handle battle keys or ignore
        if (this.dom.battleModal?.style.display === 'flex') {
            const key = event.key?.toLowerCase?.();
            if (event.code === 'Space' || key === 'a') {
                event.preventDefault();
                this.handleAttackClick();
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
        if (this.isLocked) {
            return;
        }

        let dx = 0;
        let dy = 0;
        
        switch(event.key) {
            case 'ArrowUp': case 'w': case 'W': dy = -1; break;
            case 'ArrowDown': case 's': case 'S': dy = 1; break;
            case 'ArrowLeft': case 'a': case 'A': dx = -1; break;
            case 'ArrowRight': case 'd': case 'D': dx = 1; break;
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
        
        this.updateWorldNarrativePanel();
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
                locationKey
            });
        }
        this.renderClueBook();
        this.renderBossTestPanel();
        this.updateSmallLocationHint();
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
        if (this.dom.locationToastTitle) {
            this.dom.locationToastTitle.textContent = narrative.title || '未知地點';
        }
        if (this.dom.locationToastDescription) {
            this.dom.locationToastDescription.textContent = narrative.description || '';
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
        if (this.dom.smallLocationHintTitle) {
            this.dom.smallLocationHintTitle.textContent = `${landmark.icon || '◆'} ${landmark.name || '未知地點'}`;
        }
        if (this.dom.smallLocationHintText) {
            const hintText = landmark.mapHint || landmark.arrival || '再靠近即可調查。';
            this.dom.smallLocationHintText.textContent = `${hintText} 再靠近即可調查。`;
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
        const clueCount = notebook.clues.length;
        const hasClues = clueCount > 0;

        if (this.dom.btnToggleClueBook) {
            this.dom.btnToggleClueBook.classList.toggle('is-available', hasClues);
            this.dom.btnToggleClueBook.disabled = !hasClues;
            this.dom.btnToggleClueBook.setAttribute('aria-hidden', String(!hasClues));
        }
        if (!hasClues && this.clueBookOpen) {
            this.toggleClueBook(false);
        }
        if (this.dom.clueBookSummary) {
            this.dom.clueBookSummary.textContent = '首領痕跡會依照你發現的順序留下，不會預先列出未知情報。';
        }
        if (!this.dom.clueBookContent) return;

        const chainHTML = notebook.chains.map(chain => {
            const totalClues = chain.totalClues || chain.clues.length;
            const chainProgress = `${chain.clues.length}/${totalClues}`;
            const knownClues = chain.clues.map(clue => `
                <article class="notebook-clue">
                    <div class="notebook-clue-source">痕跡 ${clue.notebookIndex}</div>
                    <h4>${escapeHtml(clue.title)}</h4>
                    <div class="notebook-clue-origin">${escapeHtml(this.formatTraceSource(clue))}</div>
                    <p>${escapeHtml(clue.text)}</p>
                    <small>${escapeHtml(clue.lead || '')}</small>
                </article>
            `).join('');

            return `
                <section class="notebook-chain">
                    <div class="notebook-chain-header">
                        <div>
                            <span>${escapeHtml(chain.method)}</span>
                            <h3>${escapeHtml(chain.title)}</h3>
                        </div>
                        <strong>${escapeHtml(chainProgress)}</strong>
                    </div>
                    <p class="notebook-chain-text">${escapeHtml(chain.text)}</p>
                    <div class="notebook-clue-list">${knownClues}</div>
                </section>
            `;
        }).join('');

        const landmarkHTML = notebook.landmarks.length > 0
            ? `<section class="notebook-landmarks">
                <h3>踏查地點</h3>
                ${notebook.landmarks.map(landmark => `<span>${escapeHtml(landmark.name)}</span>`).join('')}
            </section>`
            : '';

        this.dom.clueBookContent.innerHTML = chainHTML + landmarkHTML;
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
        const event = mode === 'random'
            ? eventManager.triggerRandomEvent(targetZone)
            : eventManager.triggerMapQuestionEvent(targetZone);

        if (!event) return null;
        if (this.worldMap) this.worldMap.currentEvent = event;
        this.isLocked = true;
        this.toggleBossTestPanel(false);
        this.handleMapEvent();
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
        const center = (x, y) => ({ cx: x + gridSize / 2, cy: y + gridSize / 2 });
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
            const x = cell.x * gridSize - cameraX;
            const y = cell.y * gridSize - cameraY;
            drawTerrainDecoration(cell, x, y);
        });

        visibleCells.forEach(cell => {
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

    renderAmbushMantisBaitPanel(landmarkId) {
        const state = this.getAmbushMantisBaitState(landmarkId);
        if (!state) return '';

        const clueText = `${state.status?.discoveredClues?.length || 0}/${state.status?.requiredClues || 2}`;
        const progressText = `${state.status?.completedProgress || 0}/${state.status?.requiredProgress || 2}`;

        let title = '銀絲伏擊';
        let body = '銀絲在路邊收束，像是在等待某個足夠貪心的人把脖子伸過去。';
        let action = '';

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

        if (state.defeated) {
            title = config.defeatedTitle;
            body = config.defeatedBody;
        } else if (!status?.finalReady) {
            title = config.pendingTitle;
            body = `${config.pendingBody} 目前痕跡 ${clueText}，推進 ${progressText}。`;
        } else {
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
                ${action}
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
            outcome.icon || '◆',
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
        const storyHTML = storyPickup ? `
                    <section class="dungeon-story-hook">
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
                <div class="dungeon-entrance-card dungeon-${escapeHtml(dungeonType)}" style="--dungeon-accent: ${escapeHtml(entranceConfig?.color || '#67d8ff')}">
                    <header class="dungeon-entrance-header">
                        <div class="dungeon-entrance-icon">${escapeHtml(dungeonData.icon || '')}</div>
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
    
    triggerStoryEvent() {
        const zone = this.worldMap.getCurrentZone();
        const event = eventManager.triggerRandomEvent(zone);
        
        if (!event) {
            this.worldMap.clearCurrentEvent();
            return;
        }
        
        this.showStoryEventModal(event);
    }
    
    showStoryEventModal(event) {
        if (!this.dom.storyEventModal) return;
        
        // 設置標題和描述
        if (this.dom.storyEventIcon) this.dom.storyEventIcon.textContent = event.icon;
        if (this.dom.storyEventTitle) this.dom.storyEventTitle.textContent = event.name;
        if (this.dom.storyEventType) this.dom.storyEventType.textContent = event.type.toUpperCase();
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
                
                btn.innerHTML = `
                    <span class="choice-text">${choice.text}</span>
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
        
        if (this.dom.eventIcon) this.dom.eventIcon.textContent = icon;
        if (this.dom.eventTitle) this.dom.eventTitle.textContent = title;
        if (this.dom.eventDescription) this.dom.eventDescription.textContent = description;
        if (this.dom.eventResult) this.dom.eventResult.innerHTML = resultHTML;
        
        this.dom.eventModal.style.display = 'flex';
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
        this.currentBattle.playerAttack(result.type);
    }

    handleFleeClick() {
        if (!this.currentBattle || this.currentBattle.battleEnded) return;
        const fleeCard = this.container.querySelector('#action-flee');
        if (isCombatActionCooling(fleeCard)) return;
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
        renderCombatActionDeck(this.container, GameManager.getCharacter(), {
            inventory: GameManager.state.inventory,
            unarmedName: '拳頭',
            emptyPotionName: '沒有補給'
        });
    }

    clearActionCooldowns() {
        ['#action-weapon', '#action-potion', '#action-flee', '#btn-attack', '#btn-item', '#btn-flee']
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
                const dur = weapon.durability ?? 50;
                const maxDur = weapon.maxDurability ?? 50;
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
        const getIconHtml = item => item?.image
            ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name || '')}">`
            : escapeHtml(item?.icon || (item?.autoUnlockedBlueprint ? '📜' : '◇'));
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
                slot.setAttribute('aria-label', `${it.name || '未知物品'}，點擊移回戰利品暫存`);
                slot.innerHTML = `
                    <div class="slot-icon">${getIconHtml(it)}</div>
                    ${quantity > 1 ? `<span class="slot-quantity">x${quantity}</span>` : ''}
                    <div class="slot-name">${escapeHtml(it.name || '未知')}</div>
                    <span class="slot-action" aria-hidden="true">→</span>
                `;
                attachLootTooltip(slot, { ...it, quantity }, { hint: '點擊移回戰利品暫存' });
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

        // Close button behavior: collect remaining loot into warehouse then close modal
        const closeBtn = this.dom.lootCloseBtn || this.container.querySelector('#btn-close-loot');
        if (closeBtn) {
            if (this.lootCloseHandler) {
                closeBtn.removeEventListener('click', this.lootCloseHandler);
            }

            this.lootCloseHandler = () => {
                // send remaining loot to warehouse
                lootPool.forEach(it => {
                    if (it.autoUnlockedBlueprint || it.type === 'blueprint') return;
                    try { GameManager.addToWarehouse(it, getQuantity(it)); } catch (e) { console.warn('addToWarehouse failed', e); }
                });
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

    playerAttack(hitType) {
        if (this.attackCooldown || this.battleEnded) return;

        if (!this._engine) {
            console.error('Fight engine not initialized; cannot perform player attack.');
            return;
        }

        const res = this._engine.playerAttack(hitType);
        if (!res) return;

        // Update equipment UI if weapon was destroyed
        if (res.destroyedWeapon) this.scene.updateEquipmentDisplay();

        const computeRes = res.computeRes || {};
        const applyRes = res.applyRes || {};

        // show miss
        if (hitType === 'miss') this.showDamageNumber(0, false, true);

        // show actual final damage
        if (applyRes && typeof applyRes.finalDamage === 'number') {
            const doubleStrikeDamage = Math.max(0, Number(applyRes.doubleStrike?.finalDamage) || 0);
            const primaryDamage = Math.max(0, applyRes.finalDamage - doubleStrikeDamage);
            this.showDamageNumber(primaryDamage || applyRes.finalDamage, computeRes.isCrit, false);
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
            poison: `☠️ 中毒 ${effect.dps || 0}/秒`
        };
        const typeMap = {
            stun: 'statusStun',
            slow: 'statusSlow',
            poison: 'statusPoison'
        };
        showCombatDamageNumber(this.scene.container, 0, {
            type: typeMap[effect.type] || 'status',
            label: textMap[effect.type] || effect.name || '狀態'
        });
    }

    showStatusTickFeedback(event) {
        if (!event) return;
        if (event.type === 'poison') {
            showCombatDamageNumber(this.scene.container, event.damage || 0, {
                type: 'dot',
                label: `☠️ -${event.damage || 0}`
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

        // 回合結束處理
        this.endTurn();

        if (this.player.hp <= 0) {
            this.handleDefeat();
        }
    }
    
    // 新增：回合結束處理
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
        blueprintUnlocks.forEach(unlock => markBlueprintKnown(unlock.recipeId));
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
        
        const penalty = Math.floor(this.player.gold * 0.1);
        GameManager.removeGold(penalty);
        this.player.hp = Math.floor(this.player.maxHp * 0.3);
        
        // 任務系統：更新死亡統計
        questManager.updateStats('death');
        
        setTimeout(() => {
            this.scene.endBattle(false);
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

        const iconHtml = item.image
            ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name || '')}">`
            : escapeHtml(item.icon || '📦');

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

        // Draw background
        octx.fillStyle = '#09100f';
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
                iconEl.innerHTML = item.image
                    ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name || '')}">`
                    : escapeHtml(item.icon || fallbackIcon);
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
        const equipBtn = document.createElement('button');
        equipBtn.className = 'btn btn-primary';
        equipBtn.textContent = '⚔️ 裝備';
        equipBtn.addEventListener('click', () => {
            GameManager.equipItem(stack.instanceId, false);
            this.closeItemDetailModal();
            this.renderInventory();
        });
        actions.push(equipBtn);
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
    sellBtn.className = 'btn btn-warning';
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

    const discardBtn = document.createElement('button');
    discardBtn.className = 'btn btn-danger';
    discardBtn.textContent = '🗑️ 回收';
    discardBtn.addEventListener('click', async () => {
        const confirmed = await confirmAction({
            title: '確認回收',
            message: `回收「${stack.item.name}」後會永久移除。`,
            confirmText: '回收',
            type: 'danger'
        });
        if (!confirmed) return;

        const index = GameManager.state.inventory.findIndex(s => s.instanceId === stack.instanceId);
        if (index > -1) {
            GameManager.state.inventory.splice(index, 1);
            GameManager.notify('inventory');
        }
        this.closeItemDetailModal();
        this.renderInventory();
        showGlobalToast('已回收物品', `「${stack.item.name}」已移除。`, 'info');
    });
    actions.push(discardBtn);

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
    unequipBtn.className = 'btn btn-warning';
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
