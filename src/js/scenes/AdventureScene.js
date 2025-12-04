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
        this.battleLog = [];  // 新增：戰鬥日誌
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
            battleLog: this.container.querySelector('#battle-log'),
            skillDeck: this.container.querySelector('#skill-deck'),
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
            
            // Item Detail Modal (for equipment interaction in inventory)
            itemModal: this.container.querySelector('#item-detail-modal')
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
            // 技能快捷鍵 1-3
            if (event.key >= '1' && event.key <= '3') {
                event.preventDefault();
                const skillIndex = parseInt(event.key) - 1;
                this.handleSkillUse(skillIndex);
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
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const zoneColors = { 'low': '#4caf50', 'medium': '#ffc107', 'high': '#ff9800', 'boss': '#f44336' };
        const terrainIcons = { 'monster': '👾', 'player': '🧙', 'event': '❓', 'dungeon': '🏰' };

        const visibleCells = this.worldMap.getVisibleCells();
        
        visibleCells.forEach(cell => {
            const x = cell.x * gridSize - cameraX;
            const y = cell.y * gridSize - cameraY;
            
            const zone = cell.data.zone;
            ctx.fillStyle = zoneColors[zone] + '20';
            ctx.fillRect(x, y, gridSize, gridSize);
            
            ctx.strokeStyle = zoneColors[zone] + '40';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, gridSize, gridSize);
            
            if (cell.data.type === 'wall') {
                ctx.fillStyle = '#555';
                ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
            } else if (cell.data.type === 'monster') {
                ctx.font = `${gridSize * 0.6}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#fff';
                ctx.fillText(terrainIcons.monster, x + gridSize / 2, y + gridSize / 2);
            } else if (cell.data.type === 'event') {
                // 顯示事件圖示
                ctx.font = `${gridSize * 0.6}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#fff';
                const eventIcon = cell.data.eventData ? cell.data.eventData.icon : terrainIcons.event;
                ctx.fillText(eventIcon, x + gridSize / 2, y + gridSize / 2);
            } else if (cell.data.type === 'dungeon') {
                // 顯示副本入口圖示
                ctx.font = `${gridSize * 0.6}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // 副本入口有特殊發光效果
                const dungeonIcon = cell.data.dungeonData?.icon || terrainIcons.dungeon;
                
                // 繪製發光背景
                ctx.save();
                ctx.shadowColor = cell.data.dungeonData?.color || '#ff6b6b';
                ctx.shadowBlur = 10;
                ctx.fillStyle = '#fff';
                ctx.fillText(dungeonIcon, x + gridSize / 2, y + gridSize / 2);
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
        this.updateSkillDeck();
        this.updateBuffIndicators();
        this.addBattleLog(`遭遇了 ${monster.name}！`);
        
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
        
        const hitType = this.rhythmSystem.judgeHit();
        this.currentBattle.playerAttack(hitType);
    }

    handleFleeClick() {
        if (!this.currentBattle || this.currentBattle.battleEnded) return;
        this.currentBattle.flee();
    }
    
    // 新增：技能使用
    handleSkillUse(skillIndex) {
        if (!this.currentBattle || this.currentBattle.battleEnded) return;
        this.currentBattle.useSkill(skillIndex);
    }

    handlePotionUse() {
        if (!this.currentBattle || this.currentBattle.battleEnded) return;
        
        const inventory = GameManager.state.inventory;
        const potionStack = inventory.find(stack => stack.item.type === 'potion');
        
        if (!potionStack || potionStack.quantity <= 0) {
            this.addBattleLog('沒有可用的藥水！');
            return;
        }
        
        const potion = potionStack.item;
        const char = GameManager.getCharacter();
        
        // 使用藥水
        if (potion.effect?.hp) {
            const healAmount = Math.min(potion.effect.hp, char.maxHp - char.hp);
            char.hp += healAmount;
            this.addBattleLog(`使用 ${potion.name}，恢復 ${healAmount} HP！`);
        }
        if (potion.effect?.mp) {
            const mpAmount = Math.min(potion.effect.mp, char.maxMp - char.mp);
            char.mp += mpAmount;
            this.addBattleLog(`使用 ${potion.name}，恢復 ${mpAmount} MP！`);
        }
        
        // 處理 Buff 藥水
        if (potion.buff) {
            char.addBuff(potion.buff.type, potion.buff.value, potion.buff.duration);
            const buffNames = { 'atk': '攻擊力', 'def': '防禦力', 'critChance': '爆擊率' };
            this.addBattleLog(`使用 ${potion.name}，${buffNames[potion.buff.type] || potion.buff.type} +${potion.buff.value}！`);
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
    
    // 新增：戰鬥日誌
    addBattleLog(message) {
        this.battleLog.push(message);
        if (this.battleLog.length > 10) {
            this.battleLog.shift();
        }
        this.renderBattleLog();
    }
    
    renderBattleLog() {
        if (!this.dom.battleLog) return;
        this.dom.battleLog.innerHTML = this.battleLog.map(msg => 
            `<div class="log-entry">${msg}</div>`
        ).join('');
        this.dom.battleLog.scrollTop = this.dom.battleLog.scrollHeight;
    }
    
    // 新增：更新技能面板
    updateSkillDeck() {
        if (!this.dom.skillDeck) return;
        
        const char = GameManager.getCharacter();
        this.dom.skillDeck.innerHTML = '';
        
        char.skills.forEach((skill, index) => {
            const skillEl = document.createElement('div');
            const canUse = skill.canUse(char);
            skillEl.className = `skill-card ${canUse ? '' : 'disabled'}`;
            skillEl.innerHTML = `
                <div class="skill-key">[${index + 1}]</div>
                <div class="skill-icon">${skill.icon}</div>
                <div class="skill-name">${skill.name}</div>
                <div class="skill-cost">MP: ${skill.mpCost}</div>
                ${skill.currentCooldown > 0 ? `<div class="skill-cooldown">CD: ${skill.currentCooldown}</div>` : ''}
            `;
            skillEl.addEventListener('click', () => {
                if (canUse) this.handleSkillUse(index);
            });
            this.dom.skillDeck.appendChild(skillEl);
        });
    }
    
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

    showLoot(exp, gold, items) {
        this.dom.lootModal.style.display = 'flex';
        this.container.querySelector('#exp-gained').textContent = `+${exp} EXP`;
        this.container.querySelector('#gold-gained').textContent = `+${gold}`;
        
        const lootContainer = this.dom.lootItems;
        lootContainer.innerHTML = '';
        
        if (items.length === 0) {
            lootContainer.innerHTML = '<div class="empty-state">沒有戰利品</div>';
        } else {
            items.forEach(item => {
                const el = document.createElement('div');
                el.className = `loot-slot ${item.rarity}`;
                el.innerHTML = `
                    <div class="slot-icon">${item.icon}</div>
                    <div class="slot-info">
                        <div class="slot-name">${item.name}</div>
                    </div>
                `;
                el.onclick = () => {
                    GameManager.addToInventory(item);
                    el.remove();
                    if (lootContainer.children.length === 0) {
                        lootContainer.innerHTML = '<div class="empty-state">已全部拾取</div>';
                    }
                };
                lootContainer.appendChild(el);
            });
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

        if (damage > 0) {
            this.monster.takeDamage(damage);
            this.scene.updateMonsterDisplay();
            if (this.monster.isDead()) {
                this.handleVictory();
                return;
            }
        }
        
        // 開始冷卻倒數
        const cooldownTime = this.player.getAttackInterval();
        this.startCooldown(cooldownTime);
        
        // 怪物反擊延遲
        setTimeout(() => this.monsterAttack(), 1000);
    }
    
    // 新增：技能使用
    useSkill(skillIndex) {
        if (this.battleEnded) return;
        
        const skill = this.player.skills[skillIndex];
        if (!skill || !skill.canUse(this.player)) {
            this.scene.addBattleLog('無法使用該技能！');
            return;
        }
        
        const result = skill.use(this.player, this.monster);
        if (!result) return;
        
        this.scene.addBattleLog(result.message);
        
        // 處理攻擊技能
        if (result.damage > 0) {
            this.monster.takeDamage(result.damage);
            this.showDamageNumber(result.damage, false, false);
            this.scene.updateMonsterDisplay();
            
            if (this.monster.isDead()) {
                this.handleVictory();
                return;
            }
        }
        
        // 處理治療技能
        if (result.heal > 0) {
            this.scene.updatePlayerHUD();
        }
        
        // 處理 Buff 技能
        if (result.buff) {
            this.player.addBuff(result.buff.type, result.buff.value, result.buff.duration);
            this.scene.updateBuffIndicators();
        }
        
        // 更新技能面板（顯示冷卻）
        this.scene.updateSkillDeck();
        this.scene.updatePlayerHUD();
        
        // 使用技能後怪物反擊
        setTimeout(() => this.monsterAttack(), 800);
    }
    
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
            
            damageEl.style.left = (rect.left - headerRect.left + rect.width / 2) + 'px';
            damageEl.style.top = (rect.top - headerRect.top - 10) + 'px';
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
        this.scene.updateSkillDeck();
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

class RhythmBarSystem {
    constructor(character, container) {
        this.character = character;
        this.container = container;
        this.barElement = container.querySelector('#rhythm-bar');
        this.needleElement = container.querySelector('#rhythm-needle');
        this.critZoneElement = container.querySelector('#crit-zone');
        this.hitZoneElement = container.querySelector('#hit-zone');
        this.attackBtn = container.querySelector('#btn-attack');
        
        this.barWidth = 100;
        this.needlePosition = 0;
        this.needleDirection = 1;
        this.weaponSpeed = character.getWeaponSpeed();
        this.animationId = null;
        this.lastTime = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.hitMarker = null;
        
        this.generateZones();
    }

    generateZones() {
        // 爆擊區域大小受 critChance 影響（5% ~ 30% critChance → 8% ~ 20% 寬度）
        const critChance = this.character.getCritChance();
        const critWidth = Math.max(8, Math.min(20, critChance * 60)); // 8-20%寬度
        
        // Hit區域固定寬度
        const hitWidth = 25;
        const safeGap = 5; // 安全間距，確保不重疊
        
        // 隨機決定左右順序
        const critOnLeft = Math.random() > 0.5;
        let critStart, hitStart;
        
        if (critOnLeft) {
            // Crit在左，Hit在右
            // Crit區域：5% ~ (75% - critWidth)
            const critMaxStart = 75 - critWidth;
            critStart = 5 + Math.random() * Math.max(0, critMaxStart - 5);
            
            // Hit區域：Crit結束後 + 安全間距
            const hitMinStart = critStart + critWidth + safeGap;
            const hitMaxStart = Math.min(90 - hitWidth, hitMinStart + 30);
            hitStart = hitMinStart + Math.random() * Math.max(0, hitMaxStart - hitMinStart);
        } else {
            // Hit在左，Crit在右
            // Hit區域：5% ~ (65% - hitWidth)
            const hitMaxStart = 65 - hitWidth;
            hitStart = 5 + Math.random() * Math.max(0, hitMaxStart - 5);
            
            // Crit區域：Hit結束後 + 安全間距
            const critMinStart = hitStart + hitWidth + safeGap;
            const critMaxStart = Math.min(90 - critWidth, critMinStart + 30);
            critStart = critMinStart + Math.random() * Math.max(0, critMaxStart - critMinStart);
        }
        
        this.critZone = { start: critStart, width: critWidth };
        this.hitZone = { start: hitStart, width: hitWidth };
        
        this.critZoneElement.style.left = this.critZone.start + '%';
        this.critZoneElement.style.width = this.critZone.width + '%';
        this.hitZoneElement.style.left = this.hitZone.start + '%';
        this.hitZoneElement.style.width = this.hitZone.width + '%';
    }

    start() {
        if (this.isRunning) return; // Prevent multiple loops
        this.isRunning = true;
        this.lastTime = performance.now();
        this.animate();
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    animate() {
        if (!this.isRunning) return; // Exit if stopped
        
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // 暫停時不更新位置
        if (!this.isPaused) {
            // Correct formula: pointer_speed = base_length / wep_speed
            // wep_speed 1.0 = 1 second for full bar
            // wep_speed 2.0 = 0.5 second for full bar
            // wep_speed 0.5 = 2 seconds for full bar
            const pixelsPerSecond = this.barWidth / this.weaponSpeed;
            const speed = pixelsPerSecond * deltaTime;
            this.needlePosition += speed * this.needleDirection;
            
            if (this.needlePosition >= this.barWidth) {
                this.needlePosition = this.barWidth;
                this.needleDirection = -1;
            } else if (this.needlePosition <= 0) {
                this.needlePosition = 0;
                this.needleDirection = 1;
            }
            
            if (this.needleElement) {
                this.needleElement.style.left = this.needlePosition + '%';
            }
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    judgeHit() {
        // 暫停節奏條
        this.isPaused = true;
        
        const pos = this.needlePosition;
        let hitType = 'miss';
        
        // 精準判定：指針位置必須在區域內
        if (pos >= this.critZone.start && pos <= this.critZone.start + this.critZone.width) {
            hitType = 'crit';
        } else if (pos >= this.hitZone.start && pos <= this.hitZone.start + this.hitZone.width) {
            hitType = 'hit';
        }
        
        // 顯示按下位置標記
        this.showHitMarker(pos, hitType);
        
        return hitType;
    }
    
    showHitMarker(position, hitType) {
        // 移除舊標記
        if (this.hitMarker) {
            this.hitMarker.remove();
        }
        
        // 創建新標記（只顯示短暫特效）
        this.hitMarker = document.createElement('div');
        this.hitMarker.className = `hit-marker hit-marker-${hitType}`;
        this.hitMarker.style.left = position + '%';
        this.hitMarker.innerHTML = '<div class="marker-pulse"></div>';
        this.barElement.appendChild(this.hitMarker);
        
        // 特效播放完後移除（脈衝動畫0.8秒）
        setTimeout(() => {
            if (this.hitMarker) {
                this.hitMarker.remove();
                this.hitMarker = null;
            }
        }, 800);
    }
    
    resume() {
        // 恢復節奏條運行
        this.isPaused = false;
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
    if (!this.dom.inventoryList) return;
    
    const state = GameManager.state;
    
    // Update capacity
    if (this.dom.inventoryCapacity) {
        this.dom.inventoryCapacity.textContent = `${state.inventory.length}/${state.inventoryCapacity}`;
    }
    
    // Render items
    this.dom.inventoryList.innerHTML = '';
    if (state.inventory && state.inventory.length > 0) {
        state.inventory.forEach(stack => {
            const item = stack.item;
            const itemEl = document.createElement('div');
            itemEl.className = `item-card inventory-item rarity-${item.rarity}`;
            
            let iconHTML;
            if (item.image) {
                iconHTML = `<img src=\"${item.image}\" alt=\"${item.name}\" style=\"width: 100%; height: 100%; object-fit: contain;\">`;
            } else {
                iconHTML = item.icon || '\ud83d\udce6';
            }
            
            itemEl.innerHTML = `
                <div class=\"item-icon\">
                    ${iconHTML}
                    ${stack.quantity > 1 ? `<span class=\"quantity-badge\">x${stack.quantity}</span>` : ''}
                </div>
                <div class=\"item-info\">
                    <div class=\"item-name\">${item.name}</div>
                </div>
            `;
            
            itemEl.addEventListener('click', () => {
                this.showInventoryItemModal(stack);
            });
            
            this.dom.inventoryList.appendChild(itemEl);
        });
    } else {
        this.dom.inventoryList.innerHTML = '<div class=\"empty-hint\">\u80cc\u5305\u7a7a\u7a7a\u5982\u4e5f...</div>';
    }
};

AdventureScene.prototype.showInventoryItemModal = function(stack) {
    // Create a temporary modal for adventure scene
    const item = stack.item;
    const isEquipment = item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory';
    const isConsumable = item.type === 'potion' || item.type === 'scroll';
    
    let actions = '';
    
    if (isEquipment) {
        actions += `<button class=\"btn btn-primary\" onclick=\"window.adventureEquipItem('${stack.instanceId}')\">✅ 裝備</button>`;
    }
    
    if (isConsumable) {
        actions += `<button class=\"btn btn-info\" onclick=\"window.adventureUseItem('${stack.instanceId}')\">✅ 使用</button>`;
    }
    
    // In adventure, can't move to warehouse, only sell or discard
    actions += `<button class=\"btn btn-warning\" onclick=\"window.adventureSellItem('${stack.instanceId}')\">✅ 販售</button>`;
    actions += `<button class=\"btn btn-danger\" onclick=\"window.adventureDiscardItem('${stack.instanceId}')\">✅ 丟棄</button>`;
    
    // Simple modal display
    const modalHTML = `
        <div class=\"adventure-item-modal\" id=\"temp-item-modal\" style=\"position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 10000;\">
            <div class=\"modal-card\" style=\"background: #1a1f2e; padding: 20px; border-radius: 12px; max-width: 400px; width: 90%;\">
                <h3 style=\"text-align: center;\">${item.name}</h3>
                <p style=\"text-align: center; color: #888;\">${item.desc || item.description || ''}</p>
                <div style=\"margin: 20px 0; display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;\">
                    ${actions}
                </div>
                <button class=\"btn btn-secondary\" onclick=\"document.getElementById('temp-item-modal').remove(); window.adventureRefreshInventory();\">關閉</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
};

// Global functions for adventure item actions
window.adventureEquipItem = function(instanceId) {
    GameManager.equipItem(instanceId, false);
    document.getElementById('temp-item-modal').remove();
    window.adventureRefreshInventory();
};

window.adventureUseItem = function(instanceId) {
    GameManager.useConsumable(instanceId, false);
    document.getElementById('temp-item-modal').remove();
    window.adventureRefreshInventory();
};

window.adventureSellItem = function(instanceId) {
    const stack = GameManager.state.inventory.find(s => s.instanceId === instanceId);
    if (!stack) return;
    
    const sellPrice = Math.floor(stack.item.price * 0.5) * stack.quantity;
    if (confirm(`確定要賣掉 ${stack.item.name} x${stack.quantity}？\n將獲得 ${sellPrice} 金幣。`)) {
        GameManager.sellItem(instanceId, false);
        document.getElementById('temp-item-modal').remove();
        window.adventureRefreshInventory();
    }
};

window.adventureDiscardItem = function(instanceId) {
    const stack = GameManager.state.inventory.find(s => s.instanceId === instanceId);
    if (!stack) return;
    
    const result = GameManager.discardItem(instanceId, false);
    if (result === 'confirm') {
        if (confirm(`「${stack.item.name}」是 ${stack.item.rarity} 稀有度物品！\n確定要丟棄嗎？`)) {
            const index = GameManager.state.inventory.findIndex(s => s.instanceId === instanceId);
            if (index > -1) {
                GameManager.state.inventory.splice(index, 1);
                GameManager.notify('inventory');
            }
        }
    }
    document.getElementById('temp-item-modal').remove();
    window.adventureRefreshInventory();
};

window.adventureRefreshInventory = function() {
    // Find adventure scene instance and refresh
    const adventureScene = window.currentAdventureScene;
    if (adventureScene && adventureScene.renderInventory) {
        adventureScene.renderInventory();
    }
};
