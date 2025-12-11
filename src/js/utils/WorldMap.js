/**
 * WorldMap.js
 * Handles map generation, movement, monster encounters, and map events.
 */
import GameManager from '../managers/GameManager.js';
import EventManager from '../managers/EventManager.js';
import MonsterManager from '../managers/MonsterManager.js';
import { DungeonEntranceConfig } from '../managers/DungeonManager.js';

// NOTE: DungeonEntranceConfig 已移至 managers/DungeonManager.js
// 這裡重新導出以保持向後相容
export { DungeonEntranceConfig };

// ===== 地圖事件系統 =====
export class MapEventFactory {
    static createEvent(zoneType) {
        const eventRoll = Math.random();
        
        // 根據區域決定事件類型機率 (加入 story 類型)
        if (zoneType === 'low') {
            if (eventRoll < 0.4) return this._createTreasureChest('low');
            else if (eventRoll < 0.6) return this._createHealingSpring();
            else if (eventRoll < 0.75) return this._createTrap('low');
            else return this._createStoryEvent('low');
        } else if (zoneType === 'medium') {
            if (eventRoll < 0.3) return this._createTreasureChest('medium');
            else if (eventRoll < 0.45) return this._createHealingSpring();
            else if (eventRoll < 0.65) return this._createTrap('medium');
            else return this._createStoryEvent('medium');
        } else if (zoneType === 'high') {
            if (eventRoll < 0.25) return this._createTreasureChest('high');
            else if (eventRoll < 0.35) return this._createHealingSpring();
            else if (eventRoll < 0.55) return this._createTrap('high');
            else return this._createStoryEvent('high');
        } else { // boss
            if (eventRoll < 0.4) return this._createTreasureChest('boss');
            else if (eventRoll < 0.5) return this._createTrap('boss');
            else return this._createStoryEvent('boss');
        }
    }
    
    static _createStoryEvent(zone) {
        return {
            type: 'story',
            name: '神秘事件',
            icon: '🔮',
            zone: zone
        };
    }
    
    static _createTreasureChest(zone) {
        const chestTypes = {
            'low': { name: '木製寶箱', icon: '📦', goldMin: 10, goldMax: 30, itemChance: 0.3 },
            'medium': { name: '鐵製寶箱', icon: '🗃️', goldMin: 30, goldMax: 80, itemChance: 0.5 },
            'high': { name: '黃金寶箱', icon: '💰', goldMin: 80, goldMax: 200, itemChance: 0.7 },
            'boss': { name: '傳說寶箱', icon: '👑', goldMin: 200, goldMax: 500, itemChance: 0.9 }
        };
        const chest = chestTypes[zone];
        return {
            type: 'treasure',
            name: chest.name,
            icon: chest.icon,
            zone: zone,
            goldMin: chest.goldMin,
            goldMax: chest.goldMax,
            itemChance: chest.itemChance
        };
    }
    
    static _createHealingSpring() {
        return {
            type: 'healing',
            name: '治療之泉',
            icon: '⛲',
            healPercent: 0.3 // 恢復 30% HP
        };
    }
    
    static _createTrap(zone) {
        const trapTypes = {
            'low': { name: '小型陷阱', icon: '⚠️', damageMin: 5, damageMax: 15 },
            'medium': { name: '尖刺陷阱', icon: '🔺', damageMin: 15, damageMax: 30 },
            'high': { name: '毒氣陷阱', icon: '☠️', damageMin: 30, damageMax: 50 },
            'boss': { name: '死亡陷阱', icon: '💀', damageMin: 50, damageMax: 100 }
        };
        const trap = trapTypes[zone];
        return {
            type: 'trap',
            name: trap.name,
            icon: trap.icon,
            damageMin: trap.damageMin,
            damageMax: trap.damageMax
        };
    }
}

// NOTE: MonsterFactory 已移除，改用 MonsterManager.createRandomMonsterForZone 從資料庫獲取怪物

export class Monster {
    constructor(template) {
        this.id = template.id;
        this.name = template.name;
        this.icon = template.icon;
        this.level = template.level;
        this.hp = template.hp;
        this.maxHp = template.maxHp;
        this.attack = template.attack;
        this.defense = template.defense;
        this.exp = template.exp || 0;
        this.gold = template.gold || 0;
        this.drops = template.drops || [];
        this.equipmentDrops = template.equipmentDrops || [];
        this.element = template.element || null;
        this.type = template.type || 'normal';
    }
    
    getDrops() {
        // 使用 DropManager 處理掉落
        // 這裡只返回基本金幣，物品掉落由 DropManager.calculateDrops 處理
        return { 
            items: [], 
            gold: this.gold 
        };
    }
    
    takeDamage(damage, defenseOverride) {
        const def = (typeof defenseOverride === 'number') ? defenseOverride : this.defense;
        const actualDamage = Math.max(1, damage - def);
        this.hp = Math.max(0, this.hp - actualDamage);
        return actualDamage;
    }
    
    isDead() {
        return this.hp <= 0;
    }
}

export default class WorldMap {
    constructor(player, gridSize = 60, rows = 20, cols = 30, screenWidth = 1000, screenHeight = 600) {
        this.player = player;
        this.gridSize = gridSize;
        this.rows = rows;
        this.cols = cols;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        // 每向外一個圓環增加的格數（固定為 10）
        this.ringIncrement = 10;
        // 確保地圖尺寸至少能容納三個向外圈（low/medium/high）
        const highRadius = this.ringIncrement * 3;
        const minSize = highRadius * 2 + 1;
        if (this.rows < minSize) this.rows = minSize;
        if (this.cols < minSize) this.cols = minSize;

        this.mapWidth = this.cols * gridSize;
        this.mapHeight = this.rows * gridSize;
        
        this.playerPos = { x: Math.floor(this.cols / 2), y: Math.floor(this.rows / 2) };
        this.mapData = this.generateMap();
        
        // 玩家出生在家的位置（由 generateMap 設定）
        // homePos 在 generateMap 中被設定
        
        this.cameraOffsetX = 0;
        this.cameraOffsetY = 0;
        this.currentMonster = null;
        this.currentEvent = null;
        this.currentDungeon = null; // 新增：當前副本入口
        this.hasLeftHome = false; // 新增：玩家是否已經離開過家（用於判斷是否觸發回家事件）
        this.currentRift = null; // 當前互動的裂縫
        this.rifts = [];
        // 記錄已解鎖的區域（玩家抵達過即視為解鎖）
        this.unlockedZones = new Set(['low']);

        // 嘗試從 GameManager 載入持久化的地圖狀態（rifts / unlockedZones）
        try {
            const gm = GameManager.getInstance();
            const persisted = gm.state.mapState;
            if (persisted) {
                if (Array.isArray(persisted.unlockedZones)) {
                    this.unlockedZones = new Set(persisted.unlockedZones);
                }
                // 暫存已儲存的 rifts 供 generateMap 使用
                if (Array.isArray(persisted.rifts)) {
                    this._persistedRifts = persisted.rifts.slice();
                }
            }
        } catch (e) {
            console.warn('無法讀取 GameManager mapState:', e);
        }
        this.updateCamera();
    }

    generateMap() {
        // 使用 ringIncrement 決定各圈半徑
        const lowRadius = this.ringIncrement * 1;
        const mediumRadius = this.ringIncrement * 2;
        const highRadius = this.ringIncrement * 3;
        const lowMaxSq = lowRadius * lowRadius;
        const mediumMaxSq = mediumRadius * mediumRadius;
        const highMaxSq = highRadius * highRadius;
        
        const data = [];
        for (let r = 0; r < this.rows; r++) {
            const row = [];
            for (let c = 0; c < this.cols; c++) {
                row.push({ type: 'empty', zone: 'low' });
            }
            data.push(row);
        }
        
        // 先設置區域
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const dx = c - this.playerPos.x;
                const dy = r - this.playerPos.y;
                const distanceSq = dx * dx + dy * dy;
                
                let zone;
                if (distanceSq < lowMaxSq) zone = 'low';
                else if (distanceSq < mediumMaxSq) zone = 'medium';
                else if (distanceSq < highMaxSq) zone = 'high';
                else zone = 'boss';
                
                data[r][c].zone = zone;
            }
        }
        
        // 生成副本入口（每種副本只生成一個）
        const dungeonTypes = Object.keys(DungeonEntranceConfig);
        const placedDungeons = new Set();
        
        for (const dungeonType of dungeonTypes) {
            const config = DungeonEntranceConfig[dungeonType];
            const validCells = [];
            
            // 找出符合條件的格子
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    // 跳過玩家起點附近
                    const dx = c - this.playerPos.x;
                    const dy = r - this.playerPos.y;
                    if (Math.abs(dx) <= 2 && Math.abs(dy) <= 2) continue;
                    
                    // 檢查區域是否符合
                    if (config.zones.includes(data[r][c].zone) && data[r][c].type === 'empty') {
                        validCells.push({ r, c });
                    }
                }
            }
            
            // 隨機選擇一個格子放置副本入口
            if (validCells.length > 0) {
                const randomIndex = Math.floor(Math.random() * validCells.length);
                const cell = validCells[randomIndex];
                data[cell.r][cell.c].type = 'dungeon';
                data[cell.r][cell.c].dungeonType = dungeonType;
                data[cell.r][cell.c].dungeonData = config;
                placedDungeons.add(dungeonType);
            }
        }
        
        // 生成其他內容（牆壁、怪物、事件）
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                // 跳過已經放置了副本入口的格子
                if (data[r][c].type === 'dungeon') continue;
                
                const random = Math.random();
                let cellType;
                if (random < 0.15) cellType = 'wall';
                else if (random < 0.30) cellType = 'monster';
                else if (random < 0.38) cellType = 'event';
                else cellType = 'empty';
                
                data[r][c].type = cellType;
                
                // 為事件格子生成具體事件（使用本檔的 MapEventFactory，產生 'treasure'/'healing'/'trap'/'story' 等型別）
                if (cellType === 'event') {
                    data[r][c].eventData = MapEventFactory.createEvent(data[r][c].zone);
                }
            }
        }
        
        // 設置出生點為「家」
        data[this.playerPos.y][this.playerPos.x] = { 
            type: 'home', 
            zone: 'low',
            homeData: {
                name: '溫暖的家',
                icon: '🏠',
                description: '回到大廳並完全恢復所有狀態'
            }
        };
        
        // 記錄家的位置（玩家出生點）
        this.homePos = { x: this.playerPos.x, y: this.playerPos.y };

        // 生成裂縫（每個 Layer 一個），避免覆蓋副本或出生點
        this._generateRifts(data);
        
        return data;
    }

    _generateRifts(data) {
        this.rifts = [];
        const zoneLayers = ['low', 'medium', 'high', 'boss'];

        // 如果有持久化的 rifts，優先使用它們（並做基本的有效性檢查）
        if (Array.isArray(this._persistedRifts) && this._persistedRifts.length > 0) {
            for (const rift of this._persistedRifts) {
                const { x, y, zone } = rift;
                if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
                    // 只在該格仍為 empty 且 zone 相符時還原裂縫
                    if (data[y][x].type === 'empty' && data[y][x].zone === zone) {
                        data[y][x].type = 'rift';
                        data[y][x].riftData = { zone };
                        this.rifts.push({ x, y, zone });
                    }
                }
            }
        } else {
            for (const zone of zoneLayers) {
                const validCells = [];
                for (let r = 0; r < this.rows; r++) {
                    for (let c = 0; c < this.cols; c++) {
                        // 跳過玩家起點附近與家
                        const dx = c - this.playerPos.x;
                        const dy = r - this.playerPos.y;
                        if (Math.abs(dx) <= 2 && Math.abs(dy) <= 2) continue;
                        // 只放在空格，避免蓋到副本或事件或牆
                        if (data[r][c].zone === zone && data[r][c].type === 'empty') {
                            validCells.push({ r, c });
                        }
                    }
                }

                if (validCells.length > 0) {
                    const idx = Math.floor(Math.random() * validCells.length);
                    const cell = validCells[idx];
                    data[cell.r][cell.c].type = 'rift';
                    data[cell.r][cell.c].riftData = { zone };
                    this.rifts.push({ x: cell.c, y: cell.r, zone });
                }
            }
            // 儲存新生成的裂縫到 GameManager
            this._saveMapState();
        }
    }

    _saveMapState() {
        try {
            const gm = GameManager.getInstance();
            gm.state.mapState = {
                rifts: this.rifts.slice(),
                unlockedZones: Array.from(this.unlockedZones)
            };
            gm.notify('mapState');
        } catch (e) {
            console.warn('無法儲存 mapState 到 GameManager:', e);
        }
    }

    updateCamera() {
        let x = this.playerPos.x * this.gridSize - this.screenWidth / 2 + this.gridSize / 2;
        let y = this.playerPos.y * this.gridSize - this.screenHeight / 2 + this.gridSize / 2;
        this.cameraOffsetX = Math.max(0, Math.min(x, this.mapWidth - this.screenWidth));
        this.cameraOffsetY = Math.max(0, Math.min(y, this.mapHeight - this.screenHeight));
    }

    movePlayer(dx, dy) {
        const newX = Math.max(0, Math.min(this.cols - 1, this.playerPos.x + dx));
        const newY = Math.max(0, Math.min(this.rows - 1, this.playerPos.y + dy));
        
        if (this.mapData[newY][newX].type !== 'wall') {
            this.playerPos.x = newX;
            this.playerPos.y = newY;
            this.updateCamera();
            // 抵達任何區域視為解鎖（避免重新進入冒險時被重置）
            try {
                const arrivedZone = this.mapData[newY][newX].zone;
                if (arrivedZone && !this.unlockedZones.has(arrivedZone)) {
                    this.unlockedZones.add(arrivedZone);
                    this._saveMapState();
                }
            } catch (e) {
                // ignore
            }
            
            const cell = this.mapData[newY][newX];
            
            if (cell.type === 'monster') {
                // Create monster using data-driven manager and local Monster class
                const template = MonsterManager.createRandomMonsterForZone(cell.zone);
                if (template) {
                    this.currentMonster = new Monster(template);
                } else {
                    console.error('No monster template found for zone:', cell.zone);
                    return null;
                }
                cell.type = 'empty';
                return 'battle';
            }
            
            if (cell.type === 'event') {
                this.currentEvent = cell.eventData;
                cell.type = 'empty';
                return 'event';
            }
            
            if (cell.type === 'dungeon') {
                this.currentDungeon = {
                    type: cell.dungeonType,
                    data: cell.dungeonData
                };
                // 副本入口不會消失，可以重複進入
                return 'dungeon';
            }

            // 裂縫互動
            if (cell.type === 'rift') {
                this.currentRift = cell.riftData || { zone: cell.zone };
                // 當玩家抵達該區域，也視為已解鎖
                if (this.currentRift && this.currentRift.zone) {
                    this.unlockedZones.add(this.currentRift.zone);
                    this._saveMapState();
                }
                return 'rift';
            }
            
            // 回到家 - 只有離開過家之後再回來才觸發
            if (cell.type === 'home') {
                if (this.hasLeftHome) {
                    return 'home';
                }
                // 如果還沒離開過家，不觸發事件
                return null;
            }
            
            // 檢查是否離開了家（用於之後回家觸發事件）
            if (this.homePos && (newX !== this.homePos.x || newY !== this.homePos.y)) {
                this.hasLeftHome = true;
            }
        }
        return null;
    }

    getCurrentMonster() { return this.currentMonster; }
    clearCurrentMonster() { this.currentMonster = null; }
    getCurrentEvent() { return this.currentEvent; }
    clearCurrentEvent() { this.currentEvent = null; }
    getCurrentDungeon() { return this.currentDungeon; }
    clearCurrentDungeon() { this.currentDungeon = null; }
    getCurrentZone() { return this.mapData[this.playerPos.y][this.playerPos.x].zone; }

    // 裂縫相關 API
    getCurrentRift() { return this.currentRift; }
    clearCurrentRift() { this.currentRift = null; }
    // 回傳玩家可以傳送到的已解鎖區域（排除當前區域）
    getRiftOptions() {
        const current = this.getCurrentZone();
        return Array.from(this.unlockedZones).filter(z => z !== current);
    }
    getUnlockedZones() { return Array.from(this.unlockedZones); }

    getVisibleCells() {
        const visibleCells = [];
        const startCol = Math.floor(this.cameraOffsetX / this.gridSize);
        const endCol = Math.min(this.cols, Math.ceil((this.cameraOffsetX + this.screenWidth) / this.gridSize));
        const startRow = Math.floor(this.cameraOffsetY / this.gridSize);
        const endRow = Math.min(this.rows, Math.ceil((this.cameraOffsetY + this.screenHeight) / this.gridSize));
        
        for (let r = startRow; r < endRow; r++) {
            for (let c = startCol; c < endCol; c++) {
                if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
                    visibleCells.push({ x: c, y: r, data: this.mapData[r][c] });
                }
            }
        }
        return visibleCells;
    }
}
