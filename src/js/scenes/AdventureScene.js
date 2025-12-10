/**
 * AdventureScene.js
 * Logic for the Adventure scene (Map, Battle, Events, etc.)
 */
import GameManager from '../managers/GameManager.js';
import WorldMap from '../utils/WorldMap.js';
import { Weapon, Armor, Accessory, Consumable, Item, ItemType, ItemRarity } from '../models/DataModel.js';
import { eventSystem } from './EventSystem.js';
import { questSystem } from './QuestSystem.js';
import { ObjectiveType } from '../data/Quests.js';

export default class AdventureScene {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.worldMap = null;
        this.canvas = null;
        this.ctx = null;
        this.currentBattle = null;
        this.rhythmSystem = null;
        this.animationFrameId = null;
        this.isLocked = false; // 移動鎖定狀態（事件/戰鬥中鎖定）
        
        // Bindings
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.updateUI = this.updateUI.bind(this);
    }

    init() {
        console.log('Adventure Scene Initialized');
        
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
        
        this.unbindEvents();
        console.log('Adventure Scene Cleaned up');
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
            questSystem.updateProgress(ObjectiveType.EXPLORE, zone, 1);
            
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
            const zoneNames = { 'low': '安全區', 'medium': '普通區', 'high': '危險區', 'boss': 'Boss區' };
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
        
        const zoneColors = { 'low': '#4caf50', 'medium': '#ffc107', 'high': '#ff9800', 'boss': '#f44336' };
        const terrainIcons = { 'monster': '👾', 'player': '🧙', 'event': '❓', 'dungeon': '🏰' };

        const visibleCells = this.worldMap.getVisibleCells();
        
        // Draw dynamic icons (monsters, events, dungeon, rift, home)
        visibleCells.forEach(cell => {
            const x = cell.x * gridSize - cameraX;
            const y = cell.y * gridSize - cameraY;
            if (cell.data.type === 'monster') {
                ctx.font = `${gridSize * 0.6}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#fff';
                ctx.fillText(terrainIcons.monster, x + gridSize / 2, y + gridSize / 2);
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
                questSystem.updateProgress(ObjectiveType.EVENT, 'random', 1);
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

        const zoneNames = { 'low': '安全區', 'medium': '普通區', 'high': '危險區', 'boss': 'Boss區' };

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
            alert('找不到可傳送的位置。');
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
        const event = eventSystem.triggerRandomEvent(zone);
        
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
                    if (choice.cost.gold) costText += `💰 -${choice.cost.gold}G `;
                    if (choice.cost.hp) {
                        const hpCost = choice.cost.isPercent 
                            ? `${Math.floor(choice.cost.hp * 100)}% HP`
                            : `${choice.cost.hp} HP`;
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
        const result = eventSystem.executeChoice(choiceIndex);
        
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
            'boss': [ItemRarity.EPIC, ItemRarity.LEGENDARY]
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
            return new Item(`treasure_material_${timestamp}`, '神秘寶石', ItemType.MATERIAL, rarity, '💎', '從寶箱中發現的神秘寶石', 100);
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
        console.log('Encounter:', monster);
        
        this.battleLog = []; // 清空戰鬥日誌
        this.currentBattle = new BattleController(GameManager.getCharacter(), monster, this);
        this.dom.battleModal.style.display = 'flex';
        
        this.updateMonsterDisplay();
        this.updatePlayerHUD();
        this.updateActionDeck();
        this.updateBuffIndicators();
        // battle log removed
        
        this.rhythmSystem = new RhythmBarSystem(GameManager.getCharacter(), this.container);
        this.rhythmSystem.start();
    }

    endBattle(victory) {
        this.dom.battleModal.style.display = 'none';
        if (this.rhythmSystem) {
            this.rhythmSystem.stop();
            this.rhythmSystem = null;
        }
        this.worldMap.clearCurrentMonster();
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
    
    // battle log UI removed - method kept as noop for compatibility
    addBattleLog(message) { /* removed */ }
    
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
        if (nameEl) nameEl.textContent = char.name || 'Adventurer';
        
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
        this.container.querySelector('#exp-gained').textContent = `+${exp} EXP`;
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
                inventoryPanel.innerHTML = '<div class="empty-state">背包是空的<br><span class="hint-arrow">←</span> 點擊右側戰利品拾取</div>';
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
            if (countBadge) countBadge.textContent = `${lootPool.length} items`;
            if (!lootContainer) return;
            lootContainer.innerHTML = '';

            if (lootPool.length === 0) {
                lootContainer.innerHTML = '<div class="empty-state">沒有戰利品</div>';
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
                        alert('背包已滿！請先將左側物品移回右側或擴充背包');
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
            const handler = () => {
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
                closeBtn.removeEventListener('click', handler);
            };
            // ensure we don't add multiple handlers
            closeBtn.removeEventListener('click', handler);
            closeBtn.addEventListener('click', handler);
        }
    }
}

class BattleController {
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

        const playerAtk = this.player.getTotalAtk();
        let damage = 0;
        let isCrit = false;
        
        if (hitType === 'miss') {
            this.showDamageNumber(0, false, true);
            this.scene.addBattleLog('攻擊落空！MISS');
        } else if (hitType === 'crit') {
            damage = Math.floor(playerAtk * this.player.getCritDamage());
            isCrit = true;
            this.showDamageNumber(damage, true, false);
            this.scene.addBattleLog(`爆擊！造成 ${damage} 點傷害！`);
        } else {
            damage = playerAtk;
            this.showDamageNumber(damage, false, false);
            this.scene.addBattleLog(`攻擊命中，造成 ${damage} 點傷害。`);
        }

        // 武器耐久度消耗（無論命中與否都消耗）
        const destroyedWeapon = GameManager.reduceWeaponDurability();
        if (destroyedWeapon) {
            this.scene.addBattleLog(`💔 ${destroyedWeapon.name} 已損壞！`);
            this.scene.updateEquipmentDisplay();
        }

        if (damage > 0) {
            this.monster.takeDamage(damage);
            this.scene.updateMonsterDisplay();
            if (this.monster.isDead()) {
                this.handleVictory();
                return;
            }
        }
        
        // 注意：節奏條冷卻由 RhythmBarSystem 自己處理
        // 這裡只處理武器卡片的視覺冷卻效果（可選）
        // const cooldownTime = this.player.getAttackInterval();
        // this.startCooldown(cooldownTime);
        
        // 怪物反擊延遲
        setTimeout(() => this.monsterAttack(), 1000);
    }
    
    // 技能戰鬥 API 已移除（Adventure 的 BattleController 中）
    
    showDamageNumber(damage, isCrit, isMiss) {
        const battleHeader = this.scene.container.querySelector('.battle-header');
        if (!battleHeader) return;
        
        const damageEl = document.createElement('div');
        damageEl.className = 'damage-number';
        
        if (isMiss) {
            damageEl.textContent = 'MISS';
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
        
        const damage = Math.max(1, this.monster.attack - this.player.getTotalDef());
        this.player.hp = Math.max(0, this.player.hp - damage);
        
        this.scene.addBattleLog(`${this.monster.name} 發動攻擊，造成 ${damage} 點傷害！`);
        
        // 防具耐久度消耗
        const destroyedArmor = GameManager.reduceArmorDurability();
        if (destroyedArmor) {
            this.scene.addBattleLog(`💔 ${destroyedArmor.name} 已損壞！`);
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
        this.scene.addBattleLog(`擊敗了 ${this.monster.name}！`);
        
        const drops = this.monster.getDrops();
        this.player.exp += this.monster.exp;
        this.player.checkLevelUp();
        GameManager.addGold(drops.gold);
        
        // 任務系統：更新擊殺進度
        questSystem.updateProgress(ObjectiveType.KILL, this.monster.type, 1);
        
        setTimeout(() => {
            this.scene.endBattle(true);
            this.scene.showLoot(this.monster.exp, drops.gold, drops.items);
        }, 1500);
    }

    handleDefeat() {
        this.battleEnded = true;
        this.scene.addBattleLog('你被擊敗了...');
        
        const penalty = Math.floor(this.player.gold * 0.1);
        GameManager.removeGold(penalty);
        this.player.hp = Math.floor(this.player.maxHp * 0.3);
        
        // 任務系統：更新死亡統計
        questSystem.updateStats('death');
        
        setTimeout(() => {
            this.scene.endBattle(false);
            alert(`你被擊敗了，損失了 ${penalty} 金幣。`);
        }, 1500);
    }

    flee() {
        if (Math.random() < 0.5) {
            this.battleEnded = true;
            this.scene.addBattleLog('成功逃跑！');
            setTimeout(() => this.scene.endBattle(false), 200);
        } else {
            this.scene.addBattleLog('逃跑失敗！');
            setTimeout(() => this.monsterAttack(), 500);
        }
    }
}

/**
 * RhythmBarSystem - 動態攻擊判定條系統
 * 
 * 規則說明：
 * 1. 游標在長條內左右來回移動，速度由 weaponSpeed 決定
 * 2. 爆擊區(Crit Zone)：寬度 = critChance * 100%，位置隨機
 * 3. 有效區(Hit Zone)：寬度根據武器稀有度從20%到40%線性增加
 * 4. 兩區域不可重疊
 * 5. 攻擊後進入冷卻，冷卻時間 = attackSpeed 秒
 */
class RhythmBarSystem {
    constructor(character, container) {
        this.character = character;
        this.container = container;
        this.barElement = container.querySelector('#rhythm-bar');
        this.needleElement = container.querySelector('#rhythm-needle');
        this.critZoneElement = container.querySelector('#crit-zone');
        this.hitZoneElement = container.querySelector('#hit-zone');
        this.attackBtn = container.querySelector('#btn-attack');
        
        // 節奏條總寬度（百分比）
        this.barWidth = 100;
        
        // 指針狀態
        this.needlePosition = 0;      // 當前位置 (0-100%)
        this.needleDirection = 1;      // 移動方向 (1=右, -1=左)
        
        // 從角色/武器獲取數據
        this.updateEquipmentStats();
        
        // 動畫控制
        this.animationId = null;
        this.lastTime = 0;
        this.isRunning = false;
        this.isPaused = false;
        
        // 擊中標記
        this.hitMarker = null;
        
        // 生成判定區域
        this.generateZones();
    }

    /**
     * 從角色裝備更新節奏條參數
     */
    updateEquipmentStats() {
        // 取得武器速度（控制指針移動速度）
        // weaponSpeed 越高，指針移動越快
        this.weaponSpeed = this.character.getWeaponSpeed() || 1.0;
        
        // 取得攻擊速度（控制冷卻時間）
        // attackSpeed 是冷卻秒數
        this.attackSpeed = this.character.getAttackSpeed() || 1.0;
        
        // 取得爆擊機率（決定 Crit Zone 寬度）
        this.critChance = this.character.getCritChance() || 0.05;
        
        // 取得爆擊傷害倍率
        this.critDamage = this.character.getCritDamage() || 1.5;
        
        // 取得攻擊力（使用 getTotalAtk 方法）
        this.attackPower = this.character.getTotalAtk() || 10;
        
        // 取得武器稀有度（決定 Hit Zone 寬度）
        this.weaponRarity = this._getWeaponRarity();
        
        // 冷卻系統
        this.isOnCooldown = false;
        this.cooldownTimer = null;
    }

    /**
     * 取得武器稀有度
     * @returns {string} 稀有度名稱
     */
    _getWeaponRarity() {
        const weapon = this.character.equipment?.weapon;
        if (weapon && weapon.rarity) {
            return weapon.rarity;
        }
        return 'common';
    }

    /**
     * 根據稀有度計算 Hit Zone 寬度
     * common: 20%, uncommon: 24%, rare: 28%, epic: 32%, legendary: 36%, mythic: 40%
     */
    _calculateHitZoneWidth() {
        const rarityWidths = {
            'common': 20,
            'uncommon': 24,
            'rare': 28,
            'epic': 32,
            'legendary': 36,
            'mythic': 40
        };
        return rarityWidths[this.weaponRarity] || 20;
    }

    /**
     * 生成判定區域位置
     * Crit Zone 和 Hit Zone 隨機放置，但不可重疊
     */
    generateZones() {
        // ===== 計算區域寬度 =====
        // Crit Zone 寬度 = critChance * 100%（例：12% 暴擊率 = 12% 寬度）
        const critWidth = Math.max(5, Math.min(30, this.critChance * 100));
        
        // Hit Zone 寬度根據武器稀有度（20% ~ 40%）
        const hitWidth = this._calculateHitZoneWidth();
        
        // 安全間距，確保區域不重疊
        const safeGap = 3;
        
        // 可用範圍（留出兩端邊距）
        const marginLeft = 3;
        const marginRight = 3;
        const availableWidth = 100 - marginLeft - marginRight;
        
        // ===== 隨機決定區域位置 =====
        // 隨機決定哪個區域在左邊
        const critOnLeft = Math.random() > 0.5;
        
        let critStart, hitStart;
        
        if (critOnLeft) {
            // Crit 在左，Hit 在右
            const maxCritStart = availableWidth - critWidth - safeGap - hitWidth;
            critStart = marginLeft + Math.random() * Math.max(0, maxCritStart);
            
            // Hit 區域在 Crit 區域右側
            const hitMinStart = critStart + critWidth + safeGap;
            const hitMaxStart = 100 - marginRight - hitWidth;
            hitStart = hitMinStart + Math.random() * Math.max(0, hitMaxStart - hitMinStart);
        } else {
            // Hit 在左，Crit 在右
            const maxHitStart = availableWidth - hitWidth - safeGap - critWidth;
            hitStart = marginLeft + Math.random() * Math.max(0, maxHitStart);
            
            // Crit 區域在 Hit 區域右側
            const critMinStart = hitStart + hitWidth + safeGap;
            const critMaxStart = 100 - marginRight - critWidth;
            critStart = critMinStart + Math.random() * Math.max(0, critMaxStart - critMinStart);
        }
        
        // 保存區域資料
        this.critZone = { start: critStart, width: critWidth };
        this.hitZone = { start: hitStart, width: hitWidth };
        
        // 更新 DOM - 使用 transform 以避免觸發重排
        const parentWidth = this.barElement ? this.barElement.offsetWidth : 1;
        if (this.critZoneElement) {
            const critTranslate = (this.critZone.start / 100) * parentWidth;
            this.critZoneElement.style.transform = `translateX(${critTranslate}px)`;
            this.critZoneElement.style.width = this.critZone.width + '%';
            this.critZoneElement.style.willChange = 'transform';
        }
        if (this.hitZoneElement) {
            const hitTranslate = (this.hitZone.start / 100) * parentWidth;
            this.hitZoneElement.style.transform = `translateX(${hitTranslate}px)`;
            this.hitZoneElement.style.width = this.hitZone.width + '%';
            this.hitZoneElement.style.willChange = 'transform';
        }
        
        // Debug log
        console.log(`[RhythmBar] Zones generated - Crit: ${critWidth.toFixed(1)}% at ${critStart.toFixed(1)}%, Hit: ${hitWidth}% at ${hitStart.toFixed(1)}%`);
    }

    /**
     * 創建冷卻環 UI
     * 注意：使用 CSS 的旋轉動畫來顯示冷卻狀態
     */
    createCooldownRing() {
        // 舊版使用 CSS ::before 偽元素顯示旋轉冷卻環
        // 不需要額外創建 DOM 元素
    }

    /**
     * 開始節奏條動畫
     */
    start() {
        if (this.isRunning) return;
        
        // 更新裝備參數
        this.updateEquipmentStats();
        
        this.isRunning = true;
        this.isPaused = false;
        this.lastTime = performance.now();
        this.animate();
        
        console.log(`[RhythmBar] Started - Speed: ${this.weaponSpeed}, Cooldown: ${this.attackSpeed}s`);
    }

    /**
     * 停止節奏條動畫
     */
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * 動畫循環 - 更新指針位置
     */
    animate() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000; // 轉換為秒
        this.lastTime = currentTime;
        
        // 暫停或冷卻中不更新位置
        if (!this.isPaused && !this.isOnCooldown) {
            // 計算指針移動速度
            // 公式：指針速度 = (barWidth * weaponSpeed) per second
            // weaponSpeed = 1.0 表示 1 秒走完整個條
            // weaponSpeed = 2.0 表示 0.5 秒走完
            // weaponSpeed = 0.5 表示 2 秒走完
            const pixelsPerSecond = this.barWidth * this.weaponSpeed;
            const movement = pixelsPerSecond * deltaTime;
            
            this.needlePosition += movement * this.needleDirection;
            
            // 邊界反彈
            if (this.needlePosition >= this.barWidth) {
                this.needlePosition = this.barWidth;
                this.needleDirection = -1;
            } else if (this.needlePosition <= 0) {
                this.needlePosition = 0;
                this.needleDirection = 1;
            }
            
            // 更新指針 DOM - 使用 transform
            if (this.needleElement && this.barElement) {
                const parentWidth = this.barElement.offsetWidth || 1;
                const translateX = (this.needlePosition / 100) * parentWidth;
                this.needleElement.style.transform = `translateX(${translateX}px)`;
            }
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    /**
     * 判定攻擊結果
     * @returns {object} { type: 'crit'|'hit'|'miss', damage: number }
     */
    judgeHit() {
        // 冷卻中無法攻擊
        if (this.isOnCooldown) {
            return { type: 'cooldown', damage: 0 };
        }
        
        const pos = this.needlePosition;
        let hitType = 'miss';
        let damage = 0;
        
        // ===== 判定邏輯（Crit 優先） =====
        // Condition A: Crit - 游標在 Crit Zone 內
        if (pos >= this.critZone.start && pos <= this.critZone.start + this.critZone.width) {
            hitType = 'crit';
            damage = Math.floor(this.attackPower * this.critDamage);
        }
        // Condition B: Hit - 游標在 Hit Zone 內（且不在 Crit 內）
        else if (pos >= this.hitZone.start && pos <= this.hitZone.start + this.hitZone.width) {
            hitType = 'hit';
            damage = this.attackPower;
        }
        // Condition C: Miss - 其他區域
        else {
            hitType = 'miss';
            damage = 0;
        }
        
        // 顯示擊中標記
        this.showHitMarker(pos, hitType);
        
        // 顯示判定文字特效
        this.showJudgmentText(hitType, damage);
        
        // 啟動冷卻
        this.startCooldown();
        
        console.log(`[RhythmBar] Judge: ${hitType} at ${pos.toFixed(1)}%, Damage: ${damage}`);
        
        return { type: hitType, damage: damage };
    }
    
    /**
     * 顯示擊中位置標記
     */
    showHitMarker(position, hitType) {
        // 移除舊標記
        if (this.hitMarker) {
            this.hitMarker.remove();
        }
        
        // 創建新標記
        this.hitMarker = document.createElement('div');
        this.hitMarker.className = `hit-marker hit-marker-${hitType}`;
        // 使用 transform 定位以避免觸發重排
        const parentW = this.barElement ? this.barElement.offsetWidth : 1;
        const hitTranslate = (position / 100) * parentW;
        this.hitMarker.style.transform = `translateX(${hitTranslate}px)`;
        this.hitMarker.innerHTML = '<div class="marker-pulse"></div>';
        
        if (this.barElement) {
            this.barElement.appendChild(this.hitMarker);
        }
        
        // 特效播放完後移除
        setTimeout(() => {
            if (this.hitMarker) {
                this.hitMarker.remove();
                this.hitMarker = null;
            }
        }, 800);
    }
    
    /**
     * 顯示判定文字特效
     */
    showJudgmentText(hitType, damage) {
        const textConfig = {
            'crit': { text: 'CRITICAL!', color: '#4caf50', size: '28px' },
            'hit': { text: 'HIT', color: '#ffd700', size: '22px' },
            'miss': { text: 'MISS', color: '#ff4444', size: '20px' }
        };
        
        const config = textConfig[hitType];
        if (!config) return;
        
        const textEl = document.createElement('div');
        textEl.className = `judgment-text judgment-${hitType}`;
        textEl.textContent = config.text;
        textEl.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: ${config.size};
            font-weight: 900;
            color: ${config.color};
            text-shadow: 0 0 20px ${config.color}, 0 0 40px ${config.color};
            z-index: 100;
            pointer-events: none;
            animation: judgmentPop 0.8s ease-out forwards;
        `;
        
        if (this.barElement) {
            this.barElement.appendChild(textEl);
        }
        
        // 動畫結束後移除
        setTimeout(() => textEl.remove(), 800);
    }

    /**
     * 啟動冷卻系統
     */
    startCooldown() {
        if (this.isOnCooldown) return;
        
        this.isOnCooldown = true;
        
        // 添加冷卻樣式（使用 CSS 的旋轉動畫）
        if (this.barElement) {
            this.barElement.classList.add('cooldown');
        }
        
        // 冷卻時間結束後恢復
        const cooldownDuration = this.attackSpeed * 1000; // 轉換為毫秒
        
        this.cooldownTimer = setTimeout(() => {
            this.endCooldown();
        }, cooldownDuration);
    }

    /**
     * 結束冷卻
     */
    endCooldown() {
        this.isOnCooldown = false;
        
        // 移除冷卻樣式
        if (this.barElement) {
            this.barElement.classList.remove('cooldown');
        }
        
        // 重新隨機化區域位置
        this.generateZones();
        
        // 取消冷卻計時器
        if (this.cooldownTimer) {
            clearTimeout(this.cooldownTimer);
            this.cooldownTimer = null;
        }
        
        console.log('[RhythmBar] Cooldown ended, zones regenerated');
    }
    
    /**
     * 暫停節奏條
     */
    pause() {
        this.isPaused = true;
    }
    
    /**
     * 恢復節奏條
     */
    resume() {
        this.isPaused = false;
    }
    
    /**
     * 重置節奏條
     */
    reset() {
        this.needlePosition = 0;
        this.needleDirection = 1;
        this.isPaused = false;
        this.isOnCooldown = false;
        
        if (this.barElement) {
            this.barElement.classList.remove('cooldown');
        }
        
        this.updateEquipmentStats();
        this.generateZones();
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
    
    // Render inventory items using simple virtualization + DOM reuse
    if (!this.dom.inventoryList) return;

    const container = this.dom.inventoryList;
    const items = state.inventory || [];

    // Simple fixed height virtualization
    const ITEM_HEIGHT = 84; // px per item (tweak in CSS if needed)
    const totalHeight = items.length * ITEM_HEIGHT;

    // Ensure container is set up for virtualization
    container.style.position = 'relative';
    container.style.overflowY = 'auto';

    // Spacer element ensures scroll height
    let spacer = container.querySelector('.inv-spacer');
    if (!spacer) {
        spacer = document.createElement('div');
        spacer.className = 'inv-spacer';
        container.appendChild(spacer);
    }
    spacer.style.height = totalHeight + 'px';

    // Pool wrapper holds reused item nodes
    let pool = container.querySelector('.inv-pool');
    if (!pool) {
        pool = document.createElement('div');
        pool.className = 'inv-pool';
        pool.style.position = 'absolute';
        pool.style.top = '0';
        pool.style.left = '0';
        pool.style.right = '0';
        container.appendChild(pool);
    }

    // If no items, show empty hint and clear pool
    if (!items || items.length === 0) {
        pool.innerHTML = '';
        spacer.style.height = '0px';
        container.innerHTML = '<div class="empty-hint">背包空空如也...</div>';
        return;
    }

    // Store state for updates
    this._invItems = items;
    this._invItemHeight = ITEM_HEIGHT;
    this._invContainer = container;
    this._invPoolWrapper = pool;

    // Determine number of nodes to create in pool (visible + buffer)
    const viewportHeight = container.clientHeight || 400;
    const visibleCount = Math.ceil(viewportHeight / ITEM_HEIGHT);
    const buffer = 4;
    const poolSize = visibleCount + buffer * 2;

    // Create or reuse pool nodes
    if (!this._invPool || this._invPool.length !== poolSize) {
        // clear existing
        this._invPool = [];
        pool.innerHTML = '';
        for (let i = 0; i < poolSize; i++) {
            const node = document.createElement('div');
            node.className = 'item-card inventory-item';
            node.style.position = 'absolute';
            node.style.left = '0';
            node.style.right = '0';
            node.style.height = ITEM_HEIGHT + 'px';
            pool.appendChild(node);
            this._invPool.push(node);
        }
    }

    // Initial render of visible items
    this.updateVisibleInventoryItems();
};

// Update visible inventory items (virtualization renderer)
AdventureScene.prototype.updateVisibleInventoryItems = function() {
    const container = this._invContainer;
    const items = this._invItems || [];
    const ITEM_HEIGHT = this._invItemHeight || 84;
    const pool = this._invPool || [];
    if (!container || pool.length === 0) return;

    const scrollTop = container.scrollTop || 0;
    const viewportHeight = container.clientHeight || 400;
    const firstIndex = Math.floor(scrollTop / ITEM_HEIGHT);
    const visibleCount = Math.ceil(viewportHeight / ITEM_HEIGHT);
    const buffer = Math.floor(pool.length - visibleCount > 0 ? (pool.length - visibleCount) / 2 : 2);
    const start = Math.max(0, firstIndex - buffer);

    for (let i = 0; i < pool.length; i++) {
        const dataIndex = start + i;
        const node = pool[i];
        if (dataIndex >= 0 && dataIndex < items.length) {
            const stack = items[dataIndex];
            const item = stack.item;
            node.style.display = '';
            node.dataset.instanceId = stack.instanceId;
            node.className = `item-card inventory-item rarity-${item.rarity}`;
            node.style.transform = `translateY(${dataIndex * ITEM_HEIGHT}px)`;

            // Build inner HTML (cheap, but reused nodes minimize layout churn)
            let iconHTML = item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: contain;">` : (item.icon || '📦');
            node.innerHTML = `
                <div class="item-icon">
                    ${iconHTML}
                    ${stack.quantity > 1 ? `<span class="quantity-badge">x${stack.quantity}</span>` : ''}
                </div>
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                </div>
            `;
        } else {
            node.style.display = 'none';
        }
    }
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

        const zoneColors = { 'low': '#4caf50', 'medium': '#ffc107', 'high': '#ff9800', 'boss': '#f44336' };

        // Draw tiles (zones and walls) – avoid dynamic icons
        for (let r = 0; r < map.rows; r++) {
            for (let c = 0; c < map.cols; c++) {
                const cell = map.mapData[r][c];
                const x = c * gridSize;
                const y = r * gridSize;
                const zone = cell.zone;

                // Zone background
                octx.fillStyle = (zoneColors[zone] || '#666') + '20';
                octx.fillRect(x, y, gridSize, gridSize);

                // Grid stroke
                octx.strokeStyle = (zoneColors[zone] || '#666') + '40';
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

    // Build statsHtml
    let statsHtml = '';
    if (item.atk || item.attack) {
        const atk = item.atk || item.attack;
        statsHtml += `<div class="item-detail-stat"><span>⚔️ 攻擊力</span><span class="value">+${atk}</span></div>`;
    }
    if (item.def || item.defense) {
        const def = item.def || item.defense;
        statsHtml += `<div class="item-detail-stat"><span>🛡️ 防禦力</span><span class="value">+${def}</span></div>`;
    }
    if (item.critChance) statsHtml += `<div class="item-detail-stat"><span>💥 爆擊率</span><span class="value">${(item.critChance * 100).toFixed(0)}%</span></div>`;
    if (item.critDamage) statsHtml += `<div class="item-detail-stat"><span>⚡ 爆擊傷害</span><span class="value">${(item.critDamage * 100).toFixed(0)}%</span></div>`;
    if (item.weaponSpeed) statsHtml += `<div class="item-detail-stat"><span>⏱️ 武器速度</span><span class="value">${item.weaponSpeed.toFixed(1)}x</span></div>`;
    if (item.attackSpeed) statsHtml += `<div class="item-detail-stat"><span>⚡ 攻擊速度</span><span class="value">${item.attackSpeed.toFixed(1)}x</span></div>`;
    if (item.hp) statsHtml += `<div class="item-detail-stat"><span>❤️ 恢復 HP</span><span class="value">+${item.hp}</span></div>`;
    if (item.mp) statsHtml += `<div class="item-detail-stat"><span>💙 恢復 MP</span><span class="value">+${item.mp}</span></div>`;

    // Actions
    const actions = [];
    if (isEquipment) {
        const equipBtn = document.createElement('button');
        equipBtn.className = 'btn btn-primary';
        equipBtn.textContent = '✅ 裝備';
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
        useBtn.textContent = '✅ 使用';
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
    sellBtn.addEventListener('click', () => {
        const sellPrice = Math.floor(stack.item.price * 0.5) * stack.quantity;
        if (confirm(`確定要賣掉 ${stack.item.name} x${stack.quantity}？\n將獲得 ${sellPrice} 金幣。`)) {
            GameManager.sellItem(stack.instanceId, false);
            this.closeItemDetailModal();
            this.renderInventory();
        }
    });
    actions.push(sellBtn);

    const discardBtn = document.createElement('button');
    discardBtn.className = 'btn btn-danger';
    discardBtn.textContent = '🗑️ 丟棄';
    discardBtn.addEventListener('click', () => {
        if (confirm(`確定要丟棄 ${stack.item.name}？`)) {
            const index = GameManager.state.inventory.findIndex(s => s.instanceId === stack.instanceId);
            if (index > -1) {
                GameManager.state.inventory.splice(index, 1);
                GameManager.notify('inventory');
            }
            this.closeItemDetailModal();
            this.renderInventory();
        }
    });
    actions.push(discardBtn);

    if (window.ItemDetailModal) {
        window.ItemDetailModal.open(item, {
            typeText: this.getItemTypeText(item.type),
            description: item.desc || item.description || '無描述',
            statsHtml: statsHtml,
            actions: actions
        });
    }
};

AdventureScene.prototype.showEquipmentModal = function(item, slotType) {
    // Build statsHtml
    let statsHtml = '';
    if (item.atk || item.attack) statsHtml += `<div class="item-detail-stat"><span>⚔️ 攻擊力</span><span class="value">+${item.atk || item.attack}</span></div>`;
    if (item.def || item.defense) statsHtml += `<div class="item-detail-stat"><span>🛡️ 防禦力</span><span class="value">+${item.def || item.defense}</span></div>`;
    if (item.critChance) statsHtml += `<div class="item-detail-stat"><span>💥 爆擊率</span><span class="value">${(item.critChance * 100).toFixed(0)}%</span></div>`;
    if (item.critDamage) statsHtml += `<div class="item-detail-stat"><span>⚡ 爆擊傷害</span><span class="value">${(item.critDamage * 100).toFixed(0)}%</span></div>`;
    if (item.weaponSpeed) statsHtml += `<div class="item-detail-stat"><span>⏱️ 武器速度</span><span class="value">${item.weaponSpeed.toFixed(1)}x</span></div>`;
    if (item.attackSpeed) statsHtml += `<div class="item-detail-stat"><span>⚡ 攻擊速度</span><span class="value">${item.attackSpeed.toFixed(1)}x</span></div>`;
    if (item.durability !== undefined) statsHtml += `<div class="item-detail-stat"><span>🔧 耐久度</span><span class="value">${item.durability}/${item.maxDurability || 50}</span></div>`;

    if (item.affixes && item.affixes.length > 0) {
        statsHtml += `<div class="item-affixes-section"><div class="affixes-title">✨ 詞綴</div>`;
        item.affixes.forEach(affix => {
            const affixDesc = this.formatAffixStats(affix.stats);
            statsHtml += `<div class="item-affix ${affix.rarity}"><span class="affix-name">${affix.name}</span><span class="affix-stats">${affixDesc}</span></div>`;
        });
        statsHtml += `</div>`;
    }

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
            typeText: this.getItemTypeText(item.type),
            description: item.desc || item.description || '無描述',
            statsHtml: statsHtml,
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
AdventureScene.prototype.formatAffixStats = function(stats) {
    if (!stats) return '';
    const statNames = {
        atk: '攻擊力', def: '防禦力', hp: '生命', mp: '魔力',
        critChance: '暴擊率', critDamage: '暴擊傷害', attackSpeed: '攻擊速度',
        lifesteal: '生命偷取', damageReduction: '傷害減免', hpRegen: '生命回復', mpRegen: '魔力回復',
        fireDamage: '火焰傷害', iceDamage: '冰霜傷害', thunderDamage: '雷電傷害', voidDamage: '虛空傷害',
        slowChance: '減速', stunChance: '暈眩', dodgeChance: '閃避', armorPenetration: '穿甲',
        bossBonus: 'Boss傷害', allStats: '全屬性', noDurabilityLoss: '不損耐久'
    };
    
    const parts = [];
    for (const [key, value] of Object.entries(stats)) {
        const name = statNames[key] || key;
        if (key === 'noDurabilityLoss') {
            parts.push('不損耐久');
        } else if (key.includes('Chance') || key.includes('Reduction') || key.includes('steal')) {
            parts.push(`${name}+${(value * 100).toFixed(0)}%`);
        } else {
            parts.push(`${name}+${typeof value === 'number' ? value.toFixed(value % 1 === 0 ? 0 : 1) : value}`);
        }
    }
    return parts.join(', ');
};

AdventureScene.prototype.getItemTypeText = function(type) {
    const typeMap = {
        'weapon': '武器',
        'armor': '防具',
        'accessory': '飾品',
        'potion': '藥水',
        'scroll': '卷軸',
        'material': '素材'
    };
    return typeMap[type] || type || '未知';
};

// Global functions for adventure item actions (for backward compatibility)
window.adventureEquipItem = function(instanceId) {
    GameManager.equipItem(instanceId, false);
    window.adventureRefreshInventory();
};

window.adventureUseItem = function(instanceId) {
    GameManager.useConsumable(instanceId, false);
    window.adventureRefreshInventory();
};

window.adventureSellItem = function(instanceId) {
    const stack = GameManager.state.inventory.find(s => s.instanceId === instanceId);
    if (!stack) return;
    
    const sellPrice = Math.floor(stack.item.price * 0.5) * stack.quantity;
    if (confirm(`確定要賣掉 ${stack.item.name} x${stack.quantity}？\n將獲得 ${sellPrice} 金幣。`)) {
        GameManager.sellItem(instanceId, false);
        window.adventureRefreshInventory();
    }
};

window.adventureDiscardItem = function(instanceId) {
    const stack = GameManager.state.inventory.find(s => s.instanceId === instanceId);
    if (!stack) return;
    
    if (confirm(`確定要丟棄 ${stack.item.name}？`)) {
        const index = GameManager.state.inventory.findIndex(s => s.instanceId === instanceId);
        if (index > -1) {
            GameManager.state.inventory.splice(index, 1);
            GameManager.notify('inventory');
        }
    }
    window.adventureRefreshInventory();
};

window.adventureRefreshInventory = function() {
    const adventureScene = window.currentAdventureScene;
    if (adventureScene && adventureScene.renderInventory) {
        adventureScene.renderInventory();
    }
};
