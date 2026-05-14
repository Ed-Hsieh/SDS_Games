/**
 * AdventureScene.js
 * Logic for the Adventure scene (Map, Battle, Events, etc.)
 */
import GameManager, { Weapon, Armor, Accessory, Consumable, Item, ItemType, ItemRarity } from '../managers/GameManager.js';
import WorldMap from '../utils/WorldMap.js';
import { eventManager } from '../managers/EventManager.js';
import { questManager, ObjectiveType } from '../managers/QuestManager.js';
import { resolveDropSources, generateDropsFromSources } from '../managers/DropManager.js';
import { resolveItemById } from '../utils/ItemResolver.js';
import { getSellPrice } from '../models/ItemSchema.js';
import { buildItemModalOptions } from '../utils/ItemDisplay.js';
import { renderVirtualInventoryList, updateVirtualInventoryList } from '../utils/VirtualInventoryList.js';
import { confirmAction, showGlobalToast } from '../utils/UIFeedback.js';
import RhythmBarSystem from '../utils/RhythmBarSystem.js';

// Preload FightManager for unified management (fallback to promise if not ready)
let FightManager = null;
const FightManagerReady = import('../managers/FightManager.js')
    .then(mod => { FightManager = mod; return mod; })
    .catch(err => { console.error('Failed to preload FightManager:', err); return null; });

// Centralized zone color definitions used by both rendering layers
const ZONE_COLORS = {
    low:  { hex: '#2e7d32', fill: 'rgba(77, 233, 84, 0.12)', stroke: 'rgba(43, 231, 52, 0.18)' },
    medium:{ hex: '#2196f3', fill: 'rgba(33,150,243,0.12)', stroke: 'rgba(33,150,243,0.18)' },
    high: { hex: '#ca521bff', fill: 'rgba(216, 166, 91, 0.12)', stroke: 'rgba(233, 169, 150, 0.18)' },
    death: { hex: '#9b0909ff', fill: 'rgba(183,28,28,0.16)', stroke: 'rgba(183,28,28,0.22)' }
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
        this.isLocked = false; // 移動鎖定狀態（事件/戰鬥中鎖定）
        
        // Bindings
        this.handleKeyPress = this.handleKeyPress.bind(this);
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

        this.unbindEvents();
    }

    cacheDOM() {
        this.dom = {
            canvas: this.container.querySelector('#world-map-canvas'),
            playerLevel: this.container.querySelector('#adv-player-level'),
            playerHp: this.container.querySelector('#adv-player-hp'),
            playerGold: this.container.querySelector('#adv-player-gold'),
            currentZone: this.container.querySelector('#current-zone'),
            
            // Battle Modal
            battleModal: this.container.querySelector('#battle-modal'),
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
        const containerWidth = Math.min(window.innerWidth, window.innerWidth - 40);
        const containerHeight = Math.min(window.innerHeight, window.innerHeight - 100);
        this.canvas.width = containerWidth;
        this.canvas.height = containerHeight;
    }

    bindEvents() {
        document.addEventListener('keydown', this.handleKeyPress);
        window.addEventListener('resize', this.handleResize);
        
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
        if (returnBtn) returnBtn.addEventListener('click', () => this.app.loadScene('lobby'));
        
        if (this.dom.fleeBtn) this.dom.fleeBtn.addEventListener('click', () => this.handleFleeClick());
        if (this.dom.lootCloseBtn) this.dom.lootCloseBtn.addEventListener('click', () => {
            this.dom.lootModal.style.display = 'none';
        });
    }

    unbindEvents() {
        document.removeEventListener('keydown', this.handleKeyPress);
        window.removeEventListener('resize', this.handleResize);
    }

    handleResize() {
        if (this.canvas && this.worldMap) {
            const containerWidth = Math.min(window.innerWidth, window.innerWidth - 40);
            const containerHeight = Math.min(window.innerHeight, window.innerHeight - 100);
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

    handleKeyPress(event) {
        // If modal is open, handle battle keys or ignore
        if (this.dom.battleModal.style.display === 'flex') {
            if (event.code === 'Space') {
                event.preventDefault();
                this.handleAttackClick();
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
            const result = this.worldMap.movePlayer(dx, dy);
            this.renderMap();
            this.updateUI();
            
            // 追蹤探索進度（任務系統）
            const zone = this.worldMap.getCurrentZone();
            questManager.updateProgress(ObjectiveType.EXPLORE, zone, 1);
            
            if (result === 'battle') {
                this.isLocked = true;
                this.startBattle();
            } else if (result === 'event') {
                this.isLocked = true;
                this.handleMapEvent();
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
        
        if (this.worldMap && this.dom.currentZone) {
            const zone = this.worldMap.getCurrentZone();
            const zoneNames = { 'low': '安全區', 'medium': '普通區', 'high': '危險區', 'death': '死亡區' };
            this.dom.currentZone.textContent = zoneNames[zone] || '未知區域';
            this.dom.currentZone.className = `info-value zone-indicator ${zone}`;
        }
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
        
        // Use centralized ZONE_COLORS (defined at module top)
        const terrainIcons = { 'monster': '👾', 'player': '🧙', 'event': '❓', 'dungeon': '🏰' };
        const monsterIcons = {
            normal: '👾',
            elite: '👹',
            boss: '👿'
        };

        const visibleCells = this.worldMap.getVisibleCells();
        
        // Draw dynamic icons (monsters, events, dungeon, rift, home)
        visibleCells.forEach(cell => {
            const x = cell.x * gridSize - cameraX;
            const y = cell.y * gridSize - cameraY;
            if (cell.data.type === 'monster') {
                ctx.font = `${gridSize * 0.6}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                // Use unified icons based on monster type/rank only
                const rank = (cell.data && (cell.data.monsterType || cell.data.rank)) || 'normal';
                const icon = monsterIcons[rank] || monsterIcons.normal;
                // give elites and bosses extra glow
                if (rank === 'elite') {
                    ctx.save();
                    ctx.shadowColor = 'rgba(255,165,0,0.6)';
                    ctx.shadowBlur = 12;
                    ctx.fillStyle = '#fff';
                    ctx.fillText(icon, x + gridSize / 2, y + gridSize / 2);
                    ctx.restore();
                } else if (rank === 'boss') {
                    ctx.save();
                    ctx.shadowColor = 'rgba(183,28,28,0.8)';
                    ctx.shadowBlur = 18;
                    ctx.fillStyle = '#fff';
                    ctx.fillText(icon, x + gridSize / 2, y + gridSize / 2);
                    ctx.restore();
                } else {
                    ctx.fillStyle = '#fff';
                    ctx.fillText(icon, x + gridSize / 2, y + gridSize / 2);
                }
            } else if (cell.data.type === 'event') {
                ctx.font = `${gridSize * 0.6}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#fff';
                const eventIcon = cell.data.eventData ? cell.data.eventData.icon : terrainIcons.event;
                ctx.fillText(eventIcon, x + gridSize / 2, y + gridSize / 2);
            } else if (cell.data.type === 'dungeon') {
                ctx.font = `${gridSize * 0.6}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const dungeonIcon = cell.data.dungeonData?.icon || terrainIcons.dungeon;
                ctx.save();
                ctx.shadowColor = cell.data.dungeonData?.color || '#ff6b6b';
                ctx.shadowBlur = 10;
                ctx.fillStyle = '#fff';
                ctx.fillText(dungeonIcon, x + gridSize / 2, y + gridSize / 2);
                ctx.restore();
            } else if (cell.data.type === 'rift') {
                ctx.font = `${gridSize * 0.6}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.save();
                ctx.shadowColor = '#7b61ff';
                ctx.shadowBlur = 12;
                ctx.fillStyle = '#fff';
                const riftIcon = cell.data.riftData?.icon || '🌀';
                ctx.fillText(riftIcon, x + gridSize / 2, y + gridSize / 2);
                ctx.restore();
            } else if (cell.data.type === 'home') {
                ctx.font = `${gridSize * 0.6}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.save();
                ctx.shadowColor = '#ffb347';
                ctx.shadowBlur = 15;
                ctx.fillStyle = '#fff';
                ctx.fillText('🏠', x + gridSize / 2, y + gridSize / 2);
                ctx.restore();
            }
        });
        
        // Player
        const playerX = this.worldMap.playerPos.x * gridSize - cameraX;
        const playerY = this.worldMap.playerPos.y * gridSize - cameraY;
        
        ctx.fillStyle = 'rgba(79, 172, 254, 0.3)';
        ctx.fillRect(playerX, playerY, gridSize, gridSize);
        ctx.strokeStyle = '#4facfe';
        ctx.lineWidth = 3;
        ctx.strokeRect(playerX, playerY, gridSize, gridSize);
        
        ctx.font = `${gridSize * 0.7}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.fillText(terrainIcons.player, playerX + gridSize / 2, playerY + gridSize / 2);
    }

    // ===== 地圖事件處理 =====
    
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
                const healAmount = Math.floor(char.maxHp * event.healPercent);
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
        
        const modalHTML = `
            <div class="dungeon-entrance-modal" id="dungeon-entrance-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 10000;">
                <div class="dungeon-entrance-card" style="background: linear-gradient(145deg, #1a1f2e, #252b3d); padding: 24px; border-radius: 16px; max-width: 450px; width: 90%; border: 2px solid ${entranceConfig?.color || '#888'}; box-shadow: 0 0 30px ${entranceConfig?.color || '#888'}40;">
                    <div class="dungeon-entrance-header" style="text-align: center; margin-bottom: 20px;">
                        <div style="font-size: 48px; margin-bottom: 10px;">${dungeonData.icon}</div>
                        <h2 style="color: ${entranceConfig?.color || '#fff'}; margin: 0 0 8px 0; font-size: 24px;">${dungeonData.name}</h2>
                        <div style="color: #888; font-size: 14px;">等級需求: Lv.${dungeonData.recommendLevel}+ ${isLevelOK ? '✅' : '❌'}</div>
                    </div>
                    
                    <div class="dungeon-entrance-info" style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                        <p style="color: #ccc; font-size: 14px; margin: 0 0 12px 0;">${dungeonData.description}</p>
                        <div style="display: flex; justify-content: space-between; font-size: 13px; color: #aaa;">
                            <span>🏰 樓層數: ${dungeonData.floors || dungeonData.bossFloor || 5}</span>
                            <span>⚔️ 難度: ${'⭐'.repeat(dungeonData.difficulty || Math.min(5, Math.ceil(dungeonData.recommendLevel / 5)))}</span>
                        </div>
                    </div>
                    
                    <div class="dungeon-mechanic-info" style="background: rgba(255,165,0,0.1); border: 1px solid rgba(255,165,0,0.3); border-radius: 8px; padding: 12px; margin-bottom: 20px;">
                        <div style="color: #ffa500; font-size: 13px; font-weight: bold; margin-bottom: 6px;">⚠️ 特殊機制: ${mechanicInfo.name}</div>
                        <div style="color: #ccc; font-size: 12px;">${mechanicInfo.description}</div>
                    </div>
                    
                    <div class="dungeon-entrance-actions" style="display: flex; gap: 12px; justify-content: center;">
                        <button id="btn-enter-dungeon" class="btn btn-primary" style="flex: 1; padding: 12px; font-size: 16px; background: ${entranceConfig?.color || '#4a90d9'}; border: none; border-radius: 8px; color: white; cursor: pointer; ${!isLevelOK ? 'opacity: 0.5; cursor: not-allowed;' : ''}" ${!isLevelOK ? 'disabled' : ''}>
                            ⚔️ 進入副本
                        </button>
                        <button id="btn-cancel-dungeon" class="btn btn-secondary" style="flex: 1; padding: 12px; font-size: 16px; background: #444; border: none; border-radius: 8px; color: white; cursor: pointer;">
                            🚪 離開
                        </button>
                    </div>
                    
                    ${!isLevelOK ? '<div style="text-align: center; color: #ff6b6b; font-size: 12px; margin-top: 12px;">等級不足，無法進入此副本！</div>' : ''}
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
            // 使用 main.js 的 enterDungeon 方法或直接跳轉
            window.location.hash = `#dungeon-${dungeonType}`;
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
                description: '寒氣逐漸累積，滿100點時會造成凍傷。需要定期取暖或使用抗寒藥劑。'
            },
            puzzle: {
                name: '古代謎題',
                description: '每層都有謎題需要解開才能前進。解題可獲得額外獎勵。'
            },
            maze: {
                name: '迷霧迷宮',
                description: '濃霧使人迷失方向，需要收集路標才能找到出口。'
            },
            burn: {
                name: '灼熱地獄',
                description: '持續受到灼燒傷害，HP會逐漸減少。建議攜帶大量治療道具。'
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
                            <li style="margin-bottom: 6px;">💙 完全恢復魔力值</li>
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
                char.mp = char.maxMp || 50;
                char.currentMP = char.maxMp || 50;
                
                // 清除負面狀態（如果有的話）
                if (char.debuffs) {
                    char.debuffs = [];
                }
                if (char.statusEffects) {
                    char.statusEffects = char.statusEffects.filter(e => e.positive);
                }
            }
            // 返回大廳
            this.app.loadScene('lobby');
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
                new Consumable(`treasure_mp_${timestamp}`, '魔力藥水', ItemType.POTION, rarity, '💙', '恢復魔力值的藥水', 60, { mp: 30 })
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

    // ===== Battle Logic =====

    startBattle() {
        const monster = this.worldMap.getCurrentMonster();
        this.currentBattleZone = monster?.zoneId || this.worldMap?.getCurrentZone?.() || null;
        if (monster && !monster.zoneId) {
            monster.zoneId = this.currentBattleZone;
        }
        
        this.battleLog = []; // 清空戰鬥日誌
        this.currentBattle = new AdventureBattleViewController(GameManager.getCharacter(), monster, this);
        this.dom.battleModal.style.display = 'flex';
        
        this.updateMonsterDisplay();
        this.updatePlayerHUD();
        this.updateActionDeck();
        this.updateBuffIndicators();
        // battle log removed
        
        this.rhythmSystem = new RhythmBarSystem(GameManager.getCharacter(), this.container);
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
                    // Register auto-attack callback so the scene updates UI when engine attacks
                    try {
                        if (this.currentBattle._engine) {
                            this.currentBattle._engine._onAutoAttack = (res) => {
                                if (!res) return;
                                try {
                                    if (res.destroyedArmor) this.updateEquipmentDisplay();
                                    this.updateUI();
                                    this.updatePlayerHUD();
                                    this.showPlayerHitFeedback(res.damage);
                                    this.endTurn();
                                    if (res.playerHp <= 0) this.handleDefeat();
                                } catch (e) {
                                    console.warn('Error handling auto-attack UI update:', e);
                                }
                            };
                        }
                    } catch (e) {}
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
                            try {
                                if (this.currentBattle._engine) {
                                    this.currentBattle._engine._onAutoAttack = (res) => {
                                        if (!res) return;
                                        try {
                                            if (res.destroyedArmor) this.updateEquipmentDisplay();
                                            this.updateUI();
                                            this.updatePlayerHUD();
                                            this.showPlayerHitFeedback(res.damage);
                                            this.endTurn();
                                            if (res.playerHp <= 0) this.handleDefeat();
                                        } catch (e) {
                                            console.warn('Error handling auto-attack UI update:', e);
                                        }
                                    };
                                }
                            } catch (e) {}
                    }
                }).catch(err => console.warn('Failed to initialize FightManager engine:', err));
            }
        } catch (e) {
            console.warn('Error initializing FightManager engine:', e);
        }
    }

    endBattle(victory) {
        this.dom.battleModal.style.display = 'none';
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
        this.isLocked = false;
        
        this.updateUI();
    }

    handleAttackClick() {
        if (!this.currentBattle || this.currentBattle.battleEnded) return;
        if (!this.rhythmSystem) return;
        
        // judgeHit() 返回 { type: 'crit'|'hit'|'miss'|'cooldown', damage: number }
        const result = this.rhythmSystem.judgeHit();
        
        // 冷卻中無法攻擊
        if (result.type === 'cooldown') {
            // battle log removed
            return;
        }
        
        // 傳遞 hitType 給戰鬥系統
        this.currentBattle.playerAttack(result.type);
    }

    handleFleeClick() {
        if (!this.currentBattle || this.currentBattle.battleEnded) return;
        this.currentBattle.flee();
    }
    
    // 技能使用：已由 UI 移除（保留空位以避免破壞原本結構）

    handlePotionUse() {
        if (!this.currentBattle || this.currentBattle.battleEnded) return;
        
        const inventory = GameManager.state.inventory;
        const potionStack = inventory.find(stack => stack.item.type === 'potion');
        
        if (!potionStack || potionStack.quantity <= 0) {
            // battle log removed
            return;
        }
        
        const potion = potionStack.item;
        const char = GameManager.getCharacter();
        
        // 使用藥水
        if (potion.effect?.hp) {
            const healAmount = Math.min(potion.effect.hp, char.maxHp - char.hp);
            char.hp += healAmount;
            // battle log removed
        }
        if (potion.effect?.mp) {
            const mpAmount = Math.min(potion.effect.mp, char.maxMp - char.mp);
            char.mp += mpAmount;
            // battle log removed
        }
        
        // 處理 Buff 藥水
        if (potion.buff) {
            char.addBuff(potion.buff.type, potion.buff.value, potion.buff.duration);
            const buffNames = { 'atk': '攻擊力', 'def': '防禦力', 'critChance': '爆擊率' };
            // battle log removed
            this.updateBuffIndicators();
        }
        
        // 減少數量
        potionStack.quantity--;
        if (potionStack.quantity <= 0) {
            const index = inventory.indexOf(potionStack);
            if (index > -1) inventory.splice(index, 1);
        }
        
        // 更新UI
        this.updatePlayerHUD();
        this.updateActionDeck();
        this.updateUI();
    }
    
    // 技能面板 UI 已移除 - 不再在 DOM 中渲染技能卡
    
    // 新增：更新 Buff 顯示
    updateBuffIndicators() {
        if (!this.dom.buffIndicators) return;
        
        const char = GameManager.getCharacter();
        this.dom.buffIndicators.innerHTML = '';
        
        const buffIcons = {
            'atk': '⚔️',
            'def': '🛡️',
            'critChance': '🎯',
            'critDamage': '💥'
        };
        
        char.activeBuffs.forEach(buff => {
            const buffEl = document.createElement('div');
            buffEl.className = 'buff-indicator';
            buffEl.innerHTML = `
                <span class="buff-icon">${buffIcons[buff.type] || '✨'}</span>
                <span class="buff-duration">${buff.duration}</span>
            `;
            buffEl.title = `${buff.type} +${buff.value} (${buff.duration}回合)`;
            this.dom.buffIndicators.appendChild(buffEl);
        });
    }

    updateMonsterDisplay() {
        if (!this.currentBattle) return;
        const monster = this.currentBattle.monster;
        
        this.container.querySelector('#battle-monster-icon').textContent = monster.icon;
        this.container.querySelector('#battle-monster-name').textContent = monster.name;
        this.container.querySelector('#battle-monster-level').textContent = monster.level;
        this.container.querySelector('#battle-monster-hp-text').textContent = `${monster.hp}/${monster.maxHp}`;
        this.container.querySelector('#battle-monster-atk').textContent = monster.attack;
        this.container.querySelector('#battle-monster-def').textContent = monster.defense;
        
        const hpPercent = (monster.hp / monster.maxHp) * 100;
        this.container.querySelector('#battle-monster-hp-bar').style.width = hpPercent + '%';
    }

    updatePlayerHUD() {
        const char = GameManager.getCharacter();
        
        // 更新等級
        const levelEl = this.container.querySelector('#hud-player-level');
        if (levelEl) levelEl.textContent = char.level;
        
        // 更新玩家名稱
        const nameEl = this.container.querySelector('#hud-player-name');
        if (nameEl) nameEl.textContent = char.name || '冒險者';
        
        // 更新HP條
        const hpBarEl = this.container.querySelector('#hud-hp-bar');
        const hpTextEl = this.container.querySelector('#hud-hp-text');
        if (hpBarEl) {
            const hpPercent = (char.hp / char.maxHp) * 100;
            hpBarEl.style.width = hpPercent + '%';
        }
        if (hpTextEl) hpTextEl.textContent = `${char.hp}/${char.maxHp}`;
        
        // 更新MP條
        const mpBarEl = this.container.querySelector('#hud-mp-bar');
        const mpTextEl = this.container.querySelector('#hud-mp-text');
        if (mpBarEl) {
            const mpPercent = (char.mp / char.maxMp) * 100;
            mpBarEl.style.width = mpPercent + '%';
        }
        if (mpTextEl) mpTextEl.textContent = `${char.mp}/${char.maxMp}`;
    }

    updateActionDeck() {
        const char = GameManager.getCharacter();
        const inventory = GameManager.state.inventory;
        
        // Slot A: 武器卡片
        const weapon = char.equipment.weapon;
        const weaponIconEl = this.container.querySelector('#weapon-icon');
        const weaponNameEl = this.container.querySelector('#weapon-name');
        const weaponDamageEl = this.container.querySelector('#weapon-damage');
        
        if (weapon) {
            if (weaponIconEl) {
                if (weapon.image) {
                    weaponIconEl.innerHTML = `<img src="${weapon.image}" alt="${weapon.name}" style="width: 100%; height: 100%; object-fit: contain;">`;
                } else {
                    weaponIconEl.textContent = weapon.icon || '⚔️';
                }
            }
            if (weaponNameEl) weaponNameEl.textContent = weapon.name;
        } else {
            if (weaponIconEl) weaponIconEl.textContent = '✊';
            if (weaponNameEl) weaponNameEl.textContent = '拳頭';
        }
        if (weaponDamageEl) weaponDamageEl.textContent = char.getTotalAtk();
        
        // Slot B: 藥水快捷槽
        const potionStack = inventory.find(stack => stack.item.type === 'potion');
        const potionIconEl = this.container.querySelector('#potion-icon');
        const potionNameEl = this.container.querySelector('#potion-name');
        const potionHealEl = this.container.querySelector('#potion-heal');
        const potionQtyEl = this.container.querySelector('#potion-quantity');
        const potionCard = this.container.querySelector('#action-potion');
        
        if (potionStack) {
            const potion = potionStack.item;
            if (potionIconEl) {
                if (potion.image) {
                    potionIconEl.innerHTML = `<img src="${potion.image}" alt="${potion.name}" style="width: 100%; height: 100%; object-fit: contain;">`;
                } else {
                    potionIconEl.textContent = potion.icon || '🧪';
                }
            }
            if (potionNameEl) potionNameEl.textContent = potion.name;
            if (potionHealEl) potionHealEl.textContent = `+${potion.effect?.hp || 0}`;
            if (potionQtyEl) potionQtyEl.textContent = `x${potionStack.quantity}`;
            if (potionCard) potionCard.classList.remove('disabled');
        } else {
            if (potionIconEl) potionIconEl.textContent = '🧪';
            if (potionNameEl) potionNameEl.textContent = 'No Potion';
            if (potionHealEl) potionHealEl.textContent = '+0';
            if (potionQtyEl) potionQtyEl.textContent = 'x0';
            if (potionCard) potionCard.classList.add('disabled');
        }
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
        this.dom.lootModal.style.display = 'flex';
        this.container.querySelector('#exp-gained').textContent = `+${exp} 經驗`;
        this.container.querySelector('#gold-gained').textContent = `+${gold}`;

        // Local lootPool (array of item objects)
        let lootPool = Array.isArray(items) ? items.slice() : [];

        const lootContainer = this.dom.lootItems;
        const inventoryPanel = this.container.querySelector('#loot-current-inventory');
        const capacityBadge = this.container.querySelector('#loot-inventory-capacity');
        const countBadge = this.container.querySelector('#loot-count');

        // Helper to render player's current inventory (left panel)
        const updatePlayerInventory = () => {
            const stateInv = GameManager.state.inventory || [];
            const capacity = GameManager.state.inventoryCapacity || 0;

            if (capacityBadge) capacityBadge.textContent = `${stateInv.length}/${capacity}`;

            if (!inventoryPanel) return;
            inventoryPanel.innerHTML = '';

            if (stateInv.length === 0) {
                inventoryPanel.innerHTML = '<div class="empty-state">背包是空的<br><span class="hint-arrow">←</span> 點擊右側戰利品放入背包</div>';
                return;
            }

            stateInv.forEach(stack => {
                const it = stack.item || {};
                const slot = document.createElement('div');
                slot.className = `loot-slot ${it.rarity || ''}`;
                slot.dataset.instanceId = stack.instanceId || '';
                slot.innerHTML = `
                    <div class="slot-icon">${it.image ? `<img src="${it.image}" alt="${it.name}" style="width:100%;height:100%;object-fit:contain;">` : (it.icon || '📦')}</div>
                    <div class="slot-info">
                        <div class="slot-name">${it.name || '未知'}</div>
                        <div class="slot-type">${it.type || ''} ${stack.quantity && stack.quantity > 1 ? ` x${stack.quantity}` : ''}</div>
                    </div>
                    <div class="slot-action"><div class="action-icon">→</div></div>
                `;

                // Move from inventory back to loot pool
                slot.onclick = () => {
                    const instanceId = slot.dataset.instanceId;
                    if (!instanceId) return;
                    const removed = GameManager.removeItemByInstanceId(instanceId, false);
                    if (removed) {
                        // removed is the item instance
                        lootPool.push(removed);
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
                lootContainer.innerHTML = '<div class="empty-state">戰利品已整理完畢</div>';
                return;
            }

            lootPool.forEach((it, idx) => {
                const slot = document.createElement('div');
                slot.className = `loot-slot ${it.rarity || ''}`;
                slot.innerHTML = `
                    <div class="slot-action"><div class="action-icon">←</div></div>
                    <div class="slot-info">
                        <div class="slot-name">${it.name}</div>
                        <div class="slot-type">${it.type || ''}</div>
                    </div>
                    <div class="slot-icon">${it.image ? `<img src="${it.image}" alt="${it.name}" style="width:100%;height:100%;object-fit:contain;">` : (it.icon || '')}</div>
                `;

                // Click to take from loot to inventory
                slot.onclick = () => {
                    const success = GameManager.addToInventory(it, 1);
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
                    try { GameManager.addToWarehouse(it, 1); } catch (e) { console.warn('addToWarehouse failed', e); }
                });
                // hide modal
                this.dom.lootModal.style.display = 'none';
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

        // thunder (attack speed) visual
        const thunderBuffPercent = computeRes.thunderBuffPercent || computeRes.breakdown?.thunderPercent || 0;
        if (thunderBuffPercent && thunderBuffPercent > 0) {
            const buffVal = thunderBuffPercent / 100;
            this.player.addBuff('attackSpeed', buffVal, 1);
            const header = this.scene.container.querySelector('.battle-header');
            if (header) {
                const el = document.createElement('div');
                el.className = 'player-status-thunder';
                el.textContent = `⚡ 攻速 +${thunderBuffPercent}%`;
                el.style.position = 'absolute';
                el.style.right = '12px';
                el.style.top = '8px';
                el.style.padding = '4px 8px';
                el.style.background = 'rgba(255,215,0,0.95)';
                el.style.color = '#000';
                el.style.borderRadius = '6px';
                header.appendChild(el);
                setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 900);
            }
        }

        // show miss
        if (hitType === 'miss') this.showDamageNumber(0, false, true);

        // show actual final damage
        if (applyRes && typeof applyRes.finalDamage === 'number') {
            this.showDamageNumber(applyRes.finalDamage, computeRes.isCrit, false);
            this.scene.updateMonsterDisplay();
        }

        // lifesteal feedback
        if (applyRes && applyRes.lifestealRecovered && applyRes.lifestealRecovered > 0) {
            const header = this.scene.container.querySelector('.battle-header');
            if (header) {
                const el = document.createElement('div');
                el.className = 'player-status-lifesteal';
                el.textContent = `❤ 恢復 ${applyRes.lifestealRecovered}`;
                el.style.position = 'absolute';
                el.style.left = '12px';
                el.style.top = '8px';
                el.style.padding = '4px 8px';
                el.style.background = 'rgba(255,105,180,0.95)';
                el.style.color = '#000';
                el.style.borderRadius = '6px';
                header.appendChild(el);
                setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 900);
            }
        }

        // Victory handled by scene when engine marks monster dead
        if (this.monster.isDead && this.monster.isDead()) {
            this.handleVictory();
        }
    }
    
    // 技能戰鬥 API 已移除（Adventure 的 BattleController 中）
    
    showDamageNumber(damage, isCrit, isMiss) {
        const battleHeader = this.scene.container.querySelector('.battle-header');
        if (!battleHeader) return;
        
        const damageEl = document.createElement('div');
        damageEl.className = 'damage-number';
        
        if (isMiss) {
            damageEl.textContent = '失誤';
            damageEl.classList.add('miss');
        } else if (isCrit) {
            damageEl.textContent = `-${damage}!!`;
            damageEl.classList.add('critical');
        } else {
            damageEl.textContent = `-${damage}`;
        }
        
        // 定位在怪物HP條上方中心
        const hpContainer = battleHeader.querySelector('.monster-hp-container');
        if (hpContainer) {
            const rect = hpContainer.getBoundingClientRect();
            const headerRect = battleHeader.getBoundingClientRect();
            
            const dx = (rect.left - headerRect.left + rect.width / 2);
            const dy = (rect.top - headerRect.top - 10);
            // Use transform instead of left/top to avoid layout thrash
            damageEl.style.transform = `translate(0px, 0px)`;
            damageEl.style.transform = `translate(${dx}px, ${dy}px)`;
            damageEl.style.willChange = 'transform';
        }
        
        battleHeader.appendChild(damageEl);
        
        // 0.8秒後移除
        setTimeout(() => {
            if (damageEl.parentNode) {
                damageEl.parentNode.removeChild(damageEl);
            }
        }, 800);
    }
    
    startCooldown(duration) {
        this.attackCooldown = true;
        const attackBtn = this.scene.container.querySelector('#action-weapon');
        
        // 禁用按鈕
        attackBtn.disabled = true;
        
        // 創建冷卻遮罩 (Fan Scan Mode)
        let cooldownOverlay = attackBtn.querySelector('.cooldown-overlay');
        if (!cooldownOverlay) {
            cooldownOverlay = document.createElement('div');
            cooldownOverlay.className = 'cooldown-overlay';
            cooldownOverlay.innerHTML = '<span class="cooldown-timer"></span>';
            attackBtn.appendChild(cooldownOverlay);
        }
        
        const timer = cooldownOverlay.querySelector('.cooldown-timer');
        cooldownOverlay.style.display = 'flex';
        
        const startTime = Date.now();
        const updateCooldown = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            const remaining = Math.max(0, duration - elapsed);
            const progress = (remaining / duration) * 100; // 100% -> 0%
            
            // 更新 CSS 變數以驅動扇形掃描
            attackBtn.style.setProperty('--cooldown-progress', `${progress}%`);
            
            // 更新數字
            timer.textContent = remaining.toFixed(1);
            
            if (remaining > 0) {
                requestAnimationFrame(updateCooldown);
            } else {
                // 冷卻結束
                cooldownOverlay.style.display = 'none';
                attackBtn.disabled = false;
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

                // Player hit feedback
                this.showPlayerHitFeedback(res.damage);

                // End turn housekeeping
                this.endTurn();

                if (res.playerHp <= 0) {
                    this.handleDefeat();
                }

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
        
        // 減少技能冷卻
        this.player.tickSkillCooldowns();
        // 技能面板已移除，無需更新 UI
    }
    
    showPlayerHitFeedback(damage) {
        const battleModal = this.scene.container.querySelector('.battle-modal');
        if (!battleModal) return;
        
        // 計算傷害百分比
        const damagePercent = (damage / this.player.maxHp) * 100;
        
        // 1. 紅色vignette效果
        let vignetteEl = battleModal.querySelector('.hit-vignette');
        if (!vignetteEl) {
            vignetteEl = document.createElement('div');
            vignetteEl.className = 'hit-vignette';
            battleModal.appendChild(vignetteEl);
        }
        
        // 低血量時強度提高
        const hpPercent = (this.player.hp / this.player.maxHp) * 100;
        const intensity = hpPercent < 30 ? 'high' : 'normal';
        
        vignetteEl.className = 'hit-vignette active ' + intensity;
        setTimeout(() => {
            vignetteEl.classList.remove('active');
        }, 100);
        
        // 2. 鏡頭震動效果
        const battleContent = battleModal.querySelector('.battle-content');
        if (battleContent) {
            let shakeClass = 'shake-small';
            if (damagePercent > 40) {
                shakeClass = 'shake-large';
            } else if (damagePercent > 15) {
                shakeClass = 'shake-medium';
            }
            
            battleContent.classList.add(shakeClass);
            setTimeout(() => {
                battleContent.classList.remove(shakeClass);
            }, 400);
        }
    }

    handleVictory() {
        this.battleEnded = true;
        
        // 使用 DropManager 的 resolve + generate 流程取得掉落物品
        const zoneId = this.monster.zoneId
            || this.scene?.currentBattleZone
            || this.scene?.worldMap?.getCurrentZone?.()
            || null;
        const sources = resolveDropSources({ monster: this.monster, zoneId });
        const drops = generateDropsFromSources(sources, { rng: Math.random });
        const gold = this.monster.gold || 0;
        
        // 將掉落 ID 轉換成物品實例
        const droppedItems = [];
        for (const drop of drops) {
            // 嘗試從材料資料庫獲取
            const item = resolveItemById(drop.itemId, {
                order: ['material', 'equipment', 'shop', 'bossEquipment', 'questReward']
            });
            // 如果不是材料，嘗試從裝備資料庫獲取
            if (item) {
                droppedItems.push({
                    ...item,
                    quantity: drop.quantity,
                    instanceId: Date.now() + Math.random().toString(36).substr(2, 9)
                });
            }
        }
        
        this.player.exp += this.monster.exp;
        this.player.checkLevelUp();
        GameManager.addGold(gold);
        
        // 任務系統：更新擊殺進度
        questManager.updateProgress(ObjectiveType.KILL, this.monster.id || this.monster.type, 1);
        
        setTimeout(() => {
            this.scene.endBattle(true);
            this.scene.showLoot(this.monster.exp, gold, droppedItems);
        }, 1500);
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
                this._engine.monsterAttack();
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
    
    // Render inventory items using shared virtualization + DOM reuse
    if (!this.dom.inventoryList) return;

    renderVirtualInventoryList(this, this.dom.inventoryList, state.inventory || [], {
        stateKey: '_adventureInventoryList'
    });
};

// Update visible inventory items (virtualization renderer)
AdventureScene.prototype.updateVisibleInventoryItems = function() {
    updateVirtualInventoryList(this, '_adventureInventoryList');
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
        octx.fillStyle = '#0a0a0a';
        octx.fillRect(0, 0, width, height);

        // Use centralized ZONE_COLORS (defined at module top)

        // Draw tiles (zones and walls) – avoid dynamic icons
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

                // Walls rendered in static layer
                if (cell.type === 'wall') {
                    octx.fillStyle = '#555';
                    octx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
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
    
    // Weapon slot
    if (this.dom.slotWeapon) {
        const weapon = equipment.weapon;
        if (weapon) {
            this.dom.slotWeapon.classList.remove('empty');
            this.dom.slotWeapon.classList.add('equipped');
            const iconEl = this.dom.slotWeapon.querySelector('.equipment-slot-icon');
            const nameEl = this.dom.slotWeapon.querySelector('.equipment-slot-name');
            if (iconEl) {
                if (weapon.image) {
                    iconEl.innerHTML = `<img src="${weapon.image}" alt="${weapon.name}">`;
                } else {
                    iconEl.textContent = weapon.icon || '⚔️';
                }
            }
            if (nameEl) nameEl.textContent = weapon.name;
        } else {
            this.dom.slotWeapon.classList.add('empty');
            this.dom.slotWeapon.classList.remove('equipped');
            const iconEl = this.dom.slotWeapon.querySelector('.equipment-slot-icon');
            const nameEl = this.dom.slotWeapon.querySelector('.equipment-slot-name');
            if (iconEl) iconEl.textContent = '⚔️';
            if (nameEl) nameEl.textContent = '未裝備';
        }
    }
    
    // Armor slot
    if (this.dom.slotArmor) {
        const armor = equipment.armor;
        if (armor) {
            this.dom.slotArmor.classList.remove('empty');
            this.dom.slotArmor.classList.add('equipped');
            const iconEl = this.dom.slotArmor.querySelector('.equipment-slot-icon');
            const nameEl = this.dom.slotArmor.querySelector('.equipment-slot-name');
            if (iconEl) {
                if (armor.image) {
                    iconEl.innerHTML = `<img src="${armor.image}" alt="${armor.name}">`;
                } else {
                    iconEl.textContent = armor.icon || '🛡️';
                }
            }
            if (nameEl) nameEl.textContent = armor.name;
        } else {
            this.dom.slotArmor.classList.add('empty');
            this.dom.slotArmor.classList.remove('equipped');
            const iconEl = this.dom.slotArmor.querySelector('.equipment-slot-icon');
            const nameEl = this.dom.slotArmor.querySelector('.equipment-slot-name');
            if (iconEl) iconEl.textContent = '🛡️';
            if (nameEl) nameEl.textContent = '未裝備';
        }
    }
    
    // Accessory slot
    if (this.dom.slotAccessory) {
        const accessory = equipment.accessory;
        if (accessory) {
            this.dom.slotAccessory.classList.remove('empty');
            this.dom.slotAccessory.classList.add('equipped');
            const iconEl = this.dom.slotAccessory.querySelector('.equipment-slot-icon');
            const nameEl = this.dom.slotAccessory.querySelector('.equipment-slot-name');
            if (iconEl) {
                if (accessory.image) {
                    iconEl.innerHTML = `<img src="${accessory.image}" alt="${accessory.name}">`;
                } else {
                    iconEl.textContent = accessory.icon || '💍';
                }
            }
            if (nameEl) nameEl.textContent = accessory.name;
        } else {
            this.dom.slotAccessory.classList.add('empty');
            this.dom.slotAccessory.classList.remove('equipped');
            const iconEl = this.dom.slotAccessory.querySelector('.equipment-slot-icon');
            const nameEl = this.dom.slotAccessory.querySelector('.equipment-slot-name');
            if (iconEl) iconEl.textContent = '💍';
            if (nameEl) nameEl.textContent = '未裝備';
        }
    }
};

AdventureScene.prototype.showInventoryItemModal = function(stack) {
    const item = stack.item;
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
    const modal = this.dom.itemModal;
    if (!modal) return;
    
    modal.classList.remove('active');
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
