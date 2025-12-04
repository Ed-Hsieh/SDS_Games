/**
 * DungeonScene.js
 * 副本場景控制器 - 棋盤式 UI
 */

import DungeonMap, { DungeonTileType, DungeonTileIcons } from '../utils/DungeonMap.js';
import { DungeonDatabase, DungeonEntranceConfig } from '../data/Dungeons.js';
import GameManager from '../managers/GameManager.js';

class DungeonSceneClass {
    constructor() {
        this.dungeonType = null;
        this.dungeonMap = null;
        this.currentFloor = 1;
        this.totalFloors = 3;
        
        // 戰鬥狀態
        this.isInCombat = false;
        this.currentMonster = null;
        
        // Canvas 相關
        this.canvas = null;
        this.ctx = null;
        this.container = null;
        
        // DOM 緩存
        this.dom = {};
        
        // 綁定的事件處理器
        this.boundKeyHandler = null;
    }
    
    // ==================== 初始化 ====================
    
    init(dungeonType) {
        console.log(`[DungeonScene] 初始化副本: ${dungeonType}`);
        
        this.dungeonType = dungeonType;
        this.container = document.getElementById('dungeon-container') || document.body;
        
        const dungeonData = DungeonDatabase[dungeonType];
        if (!dungeonData) {
            console.error('[DungeonScene] 找不到副本資料:', dungeonType);
            alert(`錯誤：找不到副本資料 "${dungeonType}"`);
            return;
        }
        
        this.totalFloors = dungeonData.bossFloor || dungeonData.floors || 4;
        this.currentFloor = 1;
        
        // 初始化地圖
        this.initDungeonMap();
        
        // 緩存 DOM
        this.cacheElements();
        
        // 初始化 Canvas
        const canvasReady = this.initCanvas();
        if (!canvasReady) {
            console.error('[DungeonScene] Canvas 初始化失敗');
            alert('錯誤：無法初始化遊戲畫面');
            return;
        }
        
        // 綁定事件
        this.bindEvents();
        
        // 初始渲染
        this.updateUI();
        this.renderMap();
        
        // 顯示進入訊息
        this.addMessage(`📍 進入 ${dungeonData.name} 第 ${this.currentFloor} 層`);
        this.addMessage(`💡 ${dungeonData.environment?.ambiance || '小心前進...'}`);
        
        // 雪峰特殊提示
        if (dungeonType === 'snow') {
            this.addMessage('❄️ 天寒地凍：此副本無法使用技能！', 'warning');
        }
        
        console.log('[DungeonScene] 初始化完成');
    }
    
    initDungeonMap() {
        const isBossFloor = this.currentFloor === this.totalFloors;
        
        this.dungeonMap = new DungeonMap(this.dungeonType, this.currentFloor, {
            isBossFloor,
            gridSize: 50,
            screenWidth: 800,
            screenHeight: 500
        });
    }
    
    cacheElements() {
        // 使用統一的 ID 結構
        this.dom = {
            // 副本資訊
            dungeonName: document.getElementById('dungeon-name'),
            dungeonIcon: document.getElementById('dungeon-icon'),
            floorInfo: document.getElementById('floor-info'),
            
            // 玩家狀態
            playerLevel: document.getElementById('player-level'),
            playerHp: document.getElementById('player-hp'),
            playerHpBar: document.getElementById('player-hp-bar'),
            playerMp: document.getElementById('player-mp'),
            playerMpBar: document.getElementById('player-mp-bar'),
            
            // 機制面板
            mechanicPanel: document.getElementById('mechanic-panel'),
            mechanicIcon: document.getElementById('mechanic-icon'),
            mechanicName: document.getElementById('mechanic-name'),
            mechanicStatus: document.getElementById('mechanic-status'),
            mechanicBar: document.getElementById('mechanic-bar'),
            
            // 地圖 Canvas - 統一使用 dungeon-canvas
            mapCanvas: document.getElementById('dungeon-canvas'),
            
            // 訊息日誌
            messageLog: document.getElementById('combat-log'),
            
            // 戰鬥 UI - 統一使用 combat-overlay 結構
            combatOverlay: document.getElementById('combat-overlay'),
            monsterIcon: document.getElementById('enemy-icon'),
            monsterName: document.getElementById('enemy-name'),
            monsterHp: document.getElementById('enemy-hp-text'),
            monsterHpBar: document.getElementById('enemy-hp-fill'),
            
            // 行動按鈕
            btnAttack: document.getElementById('btn-attack'),
            btnSkill: document.getElementById('btn-skill'),
            btnItem: document.getElementById('btn-item'),
            btnFlee: document.getElementById('btn-flee'),
            btnExit: document.getElementById('btn-exit'),
            
            // 層級完成
            floorCompleteOverlay: document.getElementById('floor-complete-overlay'),
            floorCompleteText: document.getElementById('floor-complete-text'),
            btnNextFloor: document.getElementById('btn-next-floor'),
            btnStay: document.getElementById('btn-stay')
        };
        
        // 驗證必要元素
        if (!this.dom.mapCanvas) {
            console.error('[DungeonScene] 找不到 canvas 元素 #dungeon-canvas');
        }
        if (!this.dom.combatOverlay) {
            console.warn('[DungeonScene] 找不到戰鬥遮罩 #combat-overlay');
        }
    }
    
    initCanvas() {
        this.canvas = this.dom.mapCanvas;
        if (!this.canvas) {
            console.error('[DungeonScene] Canvas 元素不存在，無法初始化');
            return false;
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('[DungeonScene] 無法獲取 Canvas 2D Context');
            return false;
        }
        
        // 設置 Canvas 尺寸
        const container = this.canvas.parentElement;
        if (container) {
            // 使用固定尺寸或容器尺寸
            const width = container.clientWidth > 0 ? container.clientWidth : 800;
            const height = container.clientHeight > 0 ? container.clientHeight : 500;
            
            this.canvas.width = width;
            this.canvas.height = height;
            
            if (this.dungeonMap) {
                this.dungeonMap.screenWidth = width;
                this.dungeonMap.screenHeight = height;
            }
        } else {
            // 使用預設尺寸
            this.canvas.width = 800;
            this.canvas.height = 500;
        }
        
        console.log(`[DungeonScene] Canvas 初始化完成: ${this.canvas.width}x${this.canvas.height}`);
        return true;
    }
    
    bindEvents() {
        // 鍵盤移動
        this.boundKeyHandler = (e) => this.handleKeyPress(e);
        document.addEventListener('keydown', this.boundKeyHandler);
        
        // 戰鬥按鈕
        this.dom.btnAttack?.addEventListener('click', () => this.playerAttack());
        this.dom.btnSkill?.addEventListener('click', () => this.playerUseSkill());
        this.dom.btnItem?.addEventListener('click', () => this.playerUseItem());
        this.dom.btnFlee?.addEventListener('click', () => this.playerFlee());
        
        // 離開按鈕
        this.dom.btnExit?.addEventListener('click', () => this.exitDungeon());
        
        // 層級完成按鈕
        this.dom.btnNextFloor?.addEventListener('click', () => {
            this.hideFloorCompleteOverlay();
            this.advanceFloor();
        });
        this.dom.btnStay?.addEventListener('click', () => {
            this.hideFloorCompleteOverlay();
        });
    }
    
    destroy() {
        if (this.boundKeyHandler) {
            document.removeEventListener('keydown', this.boundKeyHandler);
            this.boundKeyHandler = null;
        }
    }
    
    // ==================== 鍵盤控制 ====================
    
    handleKeyPress(e) {
        if (this.isInCombat) return;
        
        let dx = 0, dy = 0;
        
        switch (e.key.toLowerCase()) {
            case 'w': case 'arrowup': dy = -1; break;
            case 's': case 'arrowdown': dy = 1; break;
            case 'a': case 'arrowleft': dx = -1; break;
            case 'd': case 'arrowright': dx = 1; break;
            default: return;
        }
        
        if (dx !== 0 || dy !== 0) {
            e.preventDefault();
            this.movePlayer(dx, dy);
        }
    }
    
    // ==================== 玩家移動 ====================
    
    movePlayer(dx, dy) {
        const result = this.dungeonMap.movePlayer(dx, dy);
        this.renderMap();
        
        if (!result) return;
        this.handleMoveResult(result);
    }
    
    handleMoveResult(result) {
        switch (result.type) {
            case 'blocked':
                this.addMessage(`🔒 ${result.message}`, 'warning');
                break;
            case 'battle':
                this.startBattle(result.monsterType);
                break;
            case 'treasure':
                this.showTreasure();
                break;
            case 'healing':
                this.useHealingSpring();
                break;
            case 'stairs':
                this.showStairsPrompt();
                break;
            case 'key':
                this.addMessage('🗝️ 獲得了鑰匙！', 'success');
                break;
            case 'pressure_plate':
                this.addMessage('🔘 踩到壓力板，遠處傳來門打開的聲音！', 'info');
                this.renderMap();
                break;
            case 'portal':
                this.addMessage('🌀 傳送到了新位置！', 'info');
                break;
            case 'lava':
                const char = GameManager.getCharacter();
                char.hp = Math.max(1, char.hp - result.damage);
                this.addMessage(`🔥 岩漿灼燒！受到 ${result.damage} 點傷害！`, 'danger');
                this.updateUI();
                this.checkPlayerDeath();
                break;
        }
    }
    
    // ==================== 戰鬥系統 ====================
    
    startBattle(monsterType) {
        const dungeonData = DungeonDatabase[this.dungeonType];
        let monster;
        
        switch (monsterType) {
            case 'elite':
                const elites = dungeonData.monsters.elite;
                monster = { ...elites[Math.floor(Math.random() * elites.length)], isElite: true };
                break;
            case 'boss':
                monster = { ...dungeonData.monsters.boss, isBoss: true };
                break;
            default:
                const commons = dungeonData.monsters.common;
                monster = { ...commons[Math.floor(Math.random() * commons.length)] };
        }
        
        // 樓層加成
        const floorBonus = 1 + (this.currentFloor - 1) * 0.15;
        monster.hp = Math.floor(monster.hp * floorBonus);
        monster.maxHp = monster.hp;
        monster.atk = Math.floor(monster.atk * floorBonus);
        monster.def = Math.floor(monster.def * floorBonus);
        
        this.currentMonster = monster;
        this.isInCombat = true;
        
        this.showBattleModal();
        
        const prefix = monster.isBoss ? '👑 Boss: ' : monster.isElite ? '⭐ 精英: ' : '';
        this.addMessage(`⚔️ 遭遇 ${prefix}${monster.name}！`, 'combat');
        
        if (monster.special) {
            this.addMessage(`💡 ${monster.special}`, 'info');
        }
    }
    
    showBattleModal() {
        // 統一使用 combat-overlay
        if (this.dom.combatOverlay) {
            this.dom.combatOverlay.classList.remove('hidden');
        } else {
            console.warn('[DungeonScene] 找不到戰鬥遮罩元素');
        }
        this.updateMonsterDisplay();
    }
    
    hideBattleModal() {
        if (this.dom.combatOverlay) {
            this.dom.combatOverlay.classList.add('hidden');
        }
    }
    
    updateMonsterDisplay() {
        if (!this.currentMonster) return;
        
        const m = this.currentMonster;
        if (this.dom.monsterIcon) this.dom.monsterIcon.textContent = m.icon;
        if (this.dom.monsterName) {
            const prefix = m.isBoss ? '👑 ' : m.isElite ? '⭐ ' : '';
            this.dom.monsterName.textContent = prefix + m.name;
        }
        if (this.dom.monsterHp) this.dom.monsterHp.textContent = `${m.hp}/${m.maxHp}`;
        if (this.dom.monsterHpBar) {
            this.dom.monsterHpBar.style.width = `${(m.hp / m.maxHp) * 100}%`;
        }
    }
    
    playerAttack() {
        if (!this.isInCombat || !this.currentMonster) return;
        
        const char = GameManager.getCharacter();
        const damage = Math.max(1, char.getTotalAtk() - this.currentMonster.def);
        
        this.currentMonster.hp -= damage;
        this.addMessage(`⚔️ 造成 ${damage} 點傷害`, 'player-action');
        
        this.updateMonsterDisplay();
        
        if (this.currentMonster.hp <= 0) {
            this.endBattle(true);
            return;
        }
        
        setTimeout(() => this.monsterAttack(), 500);
    }
    
    playerUseSkill() {
        if (this.dungeonType === 'snow') {
            this.addMessage('❄️ 天寒地凍！無法使用技能！', 'warning');
            return;
        }
        this.addMessage('⚡ 技能系統整合中...', 'info');
    }
    
    playerUseItem() {
        this.addMessage('🎒 道具系統整合中...', 'info');
    }
    
    playerFlee() {
        if (!this.isInCombat) return;
        
        if (this.currentMonster.isBoss) {
            this.addMessage('👑 無法從 Boss 戰中逃跑！', 'danger');
            return;
        }
        
        if (Math.random() < 0.5) {
            this.addMessage('🏃 成功逃跑！', 'success');
            this.endBattle(false, true);
        } else {
            this.addMessage('❌ 逃跑失敗！', 'danger');
            this.monsterAttack();
        }
    }
    
    monsterAttack() {
        if (!this.isInCombat || !this.currentMonster) return;
        
        const char = GameManager.getCharacter();
        const damage = Math.max(1, this.currentMonster.atk - char.getTotalDef());
        
        char.hp = Math.max(0, char.hp - damage);
        this.addMessage(`💥 ${this.currentMonster.name} 造成 ${damage} 點傷害`, 'enemy-action');
        
        this.updateUI();
        
        if (char.hp <= 0) {
            this.handlePlayerDeath();
        }
    }
    
    endBattle(victory, fled = false) {
        if (victory) {
            const m = this.currentMonster;
            const gold = m.gold[0] + Math.floor(Math.random() * (m.gold[1] - m.gold[0]));
            const exp = m.exp;
            
            this.addMessage(`🎉 擊敗 ${m.name}！`, 'success');
            this.addMessage(`💰 +${gold}G  ⭐ +${exp} EXP`, 'reward');
            
            GameManager.addGold(gold);
            const char = GameManager.getCharacter();
            char.exp += exp;
            char.checkLevelUp();
            
            this.dungeonMap.clearMonster();
            
            if (m.isBoss) {
                this.handleBossVictory();
            }
        }
        
        this.isInCombat = false;
        this.currentMonster = null;
        this.hideBattleModal();
        this.renderMap();
        this.updateUI();
    }
    
    handleBossVictory() {
        const dungeonData = DungeonDatabase[this.dungeonType];
        this.addMessage(`🏆 通關 ${dungeonData.name}！`, 'legendary');
        
        setTimeout(() => {
            alert(`恭喜通關 ${dungeonData.name}！`);
            this.exitDungeon();
        }, 2000);
    }
    
    handlePlayerDeath() {
        this.addMessage('💀 你被擊敗了...', 'danger');
        this.isInCombat = false;
        this.hideBattleModal();
        
        setTimeout(() => {
            const dungeonData = DungeonDatabase[this.dungeonType];
            alert(`你在 ${dungeonData.name} 第 ${this.currentFloor} 層被擊敗了...`);
            
            const char = GameManager.getCharacter();
            char.hp = Math.floor(char.maxHp * 0.3);
            const penalty = Math.floor(GameManager.state.gold * 0.1);
            GameManager.removeGold(penalty);
            
            this.exitDungeon();
        }, 1500);
    }
    
    checkPlayerDeath() {
        const char = GameManager.getCharacter();
        if (char.hp <= 0) this.handlePlayerDeath();
    }
    
    // ==================== 互動事件 ====================
    
    showTreasure() {
        const goldMin = 20 + this.currentFloor * 10;
        const goldMax = 50 + this.currentFloor * 20;
        const gold = goldMin + Math.floor(Math.random() * (goldMax - goldMin));
        
        this.addMessage(`🏺 寶箱！+${gold} 金幣`, 'success');
        GameManager.addGold(gold);
        
        this.dungeonMap.clearTreasure();
        this.renderMap();
    }
    
    useHealingSpring() {
        const char = GameManager.getCharacter();
        const healAmount = Math.floor(char.maxHp * 0.3);
        char.hp = Math.min(char.maxHp, char.hp + healAmount);
        
        this.addMessage(`⛲ 恢復 ${healAmount} HP`, 'success');
        
        this.dungeonMap.clearHealing();
        this.updateUI();
        this.renderMap();
    }
    
    showStairsPrompt() {
        const nextFloor = this.currentFloor + 1;
        const isBossFloor = nextFloor === this.totalFloors;
        
        // 使用 floor-complete-overlay
        if (this.dom.floorCompleteOverlay) {
            if (this.dom.floorCompleteText) {
                this.dom.floorCompleteText.textContent = isBossFloor 
                    ? '前方是 Boss 房間，準備好了嗎？' 
                    : `是否前往第 ${nextFloor} 層？`;
            }
            this.dom.floorCompleteOverlay.classList.remove('hidden');
            return;
        }
        
        // 回退到 confirm
        const msg = isBossFloor 
            ? '🪜 前往 Boss 房間？'
            : `🪜 前往第 ${nextFloor} 層？`;
        
        if (confirm(msg)) {
            this.advanceFloor();
        }
    }
    
    hideFloorCompleteOverlay() {
        if (this.dom.floorCompleteOverlay) {
            this.dom.floorCompleteOverlay.classList.add('hidden');
        }
    }
    
    advanceFloor() {
        this.currentFloor++;
        
        if (this.currentFloor > this.totalFloors) {
            this.exitDungeon();
            return;
        }
        
        this.initDungeonMap();
        this.renderMap();
        this.updateUI();
        
        const isBossFloor = this.currentFloor === this.totalFloors;
        
        if (isBossFloor) {
            const dungeonData = DungeonDatabase[this.dungeonType];
            this.addMessage('⚠️ Boss 層！', 'warning');
            this.addMessage(`👑 ${dungeonData.monsters.boss.name} 在等待...`, 'boss');
        } else {
            this.addMessage(`📍 第 ${this.currentFloor} 層`, 'info');
        }
    }
    
    exitDungeon() {
        this.destroy();
        window.location.hash = '#adventure';
    }
    
    // ==================== 渲染 ====================
    
    renderMap() {
        if (!this.ctx || !this.dungeonMap) {
            console.warn('[DungeonScene] renderMap: ctx 或 dungeonMap 不存在');
            return;
        }
        
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        if (!canvas || !canvas.width || !canvas.height) {
            console.warn('[DungeonScene] renderMap: canvas 尺寸無效');
            return;
        }
        
        const gridSize = this.dungeonMap.gridSize || 50;
        const cameraX = this.dungeonMap.cameraOffsetX || 0;
        const cameraY = this.dungeonMap.cameraOffsetY || 0;
        
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const themeColors = {
            cave: { floor: '#3d3d3d', wall: '#1a1a1a', accent: '#8b7355' },
            snow: { floor: '#e8f4f8', wall: '#b0c4de', accent: '#87ceeb' },
            ruins: { floor: '#4a4a3a', wall: '#2a2a20', accent: '#daa520' },
            jungle: { floor: '#2d4a2d', wall: '#1a2e1a', accent: '#228b22' },
            hell: { floor: '#4a2020', wall: '#2a1010', accent: '#dc143c' }
        };
        const theme = themeColors[this.dungeonType] || themeColors.cave;
        
        const visibleCells = this.dungeonMap.getVisibleCells();
        
        visibleCells.forEach(cell => {
            const x = cell.x * gridSize - cameraX;
            const y = cell.y * gridSize - cameraY;
            
            // 迷霧戰爭
            if (!cell.explored) {
                ctx.fillStyle = '#000';
                ctx.fillRect(x, y, gridSize, gridSize);
                return;
            }
            
            if (!cell.visible) {
                ctx.fillStyle = theme.floor + '40';
                ctx.fillRect(x, y, gridSize, gridSize);
                if (cell.data.type === DungeonTileType.WALL) {
                    ctx.fillStyle = theme.wall + '60';
                    ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
                }
                return;
            }
            
            // 地板
            ctx.fillStyle = theme.floor;
            ctx.fillRect(x, y, gridSize, gridSize);
            
            // 格線
            ctx.strokeStyle = theme.accent + '30';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, gridSize, gridSize);
            
            // 冰面裝飾
            if (cell.data.decoration === DungeonTileType.ICE) {
                ctx.fillStyle = 'rgba(135, 206, 235, 0.3)';
                ctx.fillRect(x, y, gridSize, gridSize);
            }
            
            const tileType = cell.data.type;
            
            if (tileType === DungeonTileType.WALL) {
                ctx.fillStyle = theme.wall;
                ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
            } else if (tileType === DungeonTileType.LOCKED_DOOR) {
                const isOpen = this.dungeonMap.doorsOpened.has(cell.data.doorId);
                if (isOpen) {
                    ctx.font = `${gridSize * 0.5}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#666';
                    ctx.fillText('🚪', x + gridSize / 2, y + gridSize / 2);
                } else {
                    ctx.fillStyle = theme.wall;
                    ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
                    ctx.font = `${gridSize * 0.5}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('🔒', x + gridSize / 2, y + gridSize / 2);
                }
            } else if (tileType === DungeonTileType.LAVA) {
                ctx.fillStyle = '#ff4500';
                ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
                ctx.font = `${gridSize * 0.4}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('🔥', x + gridSize / 2, y + gridSize / 2);
            } else if (tileType !== DungeonTileType.EMPTY && tileType !== DungeonTileType.ENTRANCE) {
                const icon = DungeonTileIcons[tileType] || '❓';
                ctx.font = `${gridSize * 0.6}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#fff';
                ctx.fillText(icon, x + gridSize / 2, y + gridSize / 2);
            }
        });
        
        // 玩家
        const playerX = this.dungeonMap.playerPos.x * gridSize - cameraX;
        const playerY = this.dungeonMap.playerPos.y * gridSize - cameraY;
        
        ctx.fillStyle = `${theme.accent}40`;
        ctx.fillRect(playerX, playerY, gridSize, gridSize);
        ctx.strokeStyle = theme.accent;
        ctx.lineWidth = 3;
        ctx.strokeRect(playerX, playerY, gridSize, gridSize);
        
        ctx.font = `${gridSize * 0.7}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.fillText('🧙', playerX + gridSize / 2, playerY + gridSize / 2);
    }
    
    updateUI() {
        const char = GameManager.getCharacter();
        if (!char) {
            console.warn('[DungeonScene] GameManager.getCharacter() 返回 null');
            return;
        }
        
        const dungeonData = DungeonDatabase[this.dungeonType];
        
        if (this.dom.dungeonName) this.dom.dungeonName.textContent = dungeonData?.name || '未知副本';
        if (this.dom.dungeonIcon) this.dom.dungeonIcon.textContent = dungeonData?.icon || '🏰';
        if (this.dom.floorInfo) {
            this.dom.floorInfo.textContent = `第 ${this.currentFloor}/${this.totalFloors} 層`;
        }
        
        // 玩家狀態
        if (this.dom.playerLevel) this.dom.playerLevel.textContent = char.level || 1;
        if (this.dom.playerHp) this.dom.playerHp.textContent = `${char.hp || 0}/${char.maxHp || 100}`;
        if (this.dom.playerHpBar) this.dom.playerHpBar.style.width = `${((char.hp || 0) / (char.maxHp || 100)) * 100}%`;
        if (this.dom.playerMp) this.dom.playerMp.textContent = `${char.mp || 0}/${char.maxMp || 50}`;
        if (this.dom.playerMpBar) this.dom.playerMpBar.style.width = `${((char.mp || 0) / (char.maxMp || 50)) * 100}%`;
        
        this.updateMechanicPanel();
    }
    
    updateMechanicPanel() {
        const dungeonData = DungeonDatabase[this.dungeonType];
        if (!dungeonData?.mechanic) return;
        
        const mechanic = dungeonData.mechanic;
        
        if (this.dom.mechanicIcon) this.dom.mechanicIcon.textContent = mechanic.icon;
        
        // 使用 mechanic-status 元素顯示機制狀態
        const statusEl = this.dom.mechanicStatus;
        
        if (!statusEl) return;
        
        switch (this.dungeonType) {
            case 'cave':
                statusEl.textContent = `黑暗籠罩：視野 ${this.dungeonMap?.visionRange || 3}`;
                break;
            case 'snow':
                statusEl.textContent = '天寒地凍：無法使用技能';
                break;
            case 'ruins':
                statusEl.textContent = '機關解謎：找到壓力板開啟門';
                break;
            case 'jungle':
                statusEl.textContent = '傳送點：可能被隨機傳送';
                break;
            case 'hell':
                statusEl.textContent = '熔岩地形：踩到會持續灼燒';
                break;
            default:
                statusEl.textContent = mechanic.name;
        }
    }
    
    addMessage(text, type = 'normal') {
        // 嘗試使用 combat-log
        const logEl = this.dom.messageLog;
        if (!logEl) {
            console.log(`[DungeonScene] ${text}`);
            return;
        }
        
        const msg = document.createElement('div');
        msg.className = `message message-${type}`;
        msg.innerHTML = text;
        
        logEl.appendChild(msg);
        logEl.scrollTop = logEl.scrollHeight;
        
        // 限制訊息數量
        while (logEl.children.length > 50) {
            logEl.removeChild(logEl.firstChild);
        }
    }
}

export const DungeonScene = new DungeonSceneClass();
