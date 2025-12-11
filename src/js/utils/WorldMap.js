/**
 * WorldMap.js
 * Handles map generation, movement, monster encounters, and map events.
 */
import GameManager from '../managers/GameManager.js';
import EventManager, { eventManager } from '../managers/EventManager.js';
import MonsterManager from '../managers/MonsterManager.js';
import { DungeonEntranceConfig } from '../managers/DungeonManager.js';

// NOTE: DungeonEntranceConfig 已移至 managers/DungeonManager.js
// 這裡重新導出以保持向後相容
export { DungeonEntranceConfig };

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

        const rows = this.rows;
        const cols = this.cols;
        const px = this.playerPos.x;
        const py = this.playerPos.y;

        // 準備資料與各 zone 的候選清單（用於放置副本）
        const data = new Array(rows);
        const zoneCandidates = { low: [], medium: [], high: [], boss: [] };

        for (let r = 0; r < rows; r++) {
            const row = new Array(cols);
            for (let c = 0; c < cols; c++) {
                const dx = c - px;
                const dy = r - py;
                const distanceSq = dx * dx + dy * dy;

                let zone;
                if (distanceSq < lowMaxSq) zone = 'low';
                else if (distanceSq < mediumMaxSq) zone = 'medium';
                else if (distanceSq < highMaxSq) zone = 'high';
                else zone = 'boss';

                const cell = { type: 'empty', zone };
                row[c] = cell;

                // 若不在玩家起點附近，加入 zone 候選（供副本放置）
                if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
                    zoneCandidates[zone].push({ r, c });
                }
            }
            data[r] = row;
        }

        // 生成副本入口（每種副本只生成一個）
        const dungeonTypes = Object.keys(DungeonEntranceConfig);
        for (const dungeonType of dungeonTypes) {
            const config = DungeonEntranceConfig[dungeonType];
            // 從 config.zones 聚合可放置的候選格
            const validCells = [];
            for (const z of config.zones) {
                const list = zoneCandidates[z] || [];
                for (let i = 0; i < list.length; i++) {
                    const pos = list[i];
                    const cell = data[pos.r][pos.c];
                    if (cell.type === 'empty') validCells.push(pos);
                }
            }

            if (validCells.length > 0) {
                const randomIndex = Math.floor(Math.random() * validCells.length);
                const cellPos = validCells[randomIndex];
                const target = data[cellPos.r][cellPos.c];
                target.type = 'dungeon';
                target.dungeonType = dungeonType;
                target.dungeonData = config;
            }
        }

        // 生成其他內容（怪物、事件） — 已移除牆壁生成
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = data[r][c];
                if (cell.type === 'dungeon') continue;
                const random = Math.random();
                if (random < 0.30) cell.type = 'monster';
                else if (random < 0.38) cell.type = 'event';
                else cell.type = 'empty';
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
        // 如果沒有移動，直接返回
        if (dx === 0 && dy === 0) return null;
        const newX = Math.max(0, Math.min(this.cols - 1, this.playerPos.x + dx));
        const newY = Math.max(0, Math.min(this.rows - 1, this.playerPos.y + dy));
        
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
                // Generate the event at encounter time via the EventManager singleton
                try {
                    const ev = eventManager.triggerRandomEvent(cell.zone);
                    this.currentEvent = ev;
                } catch (e) {
                    // fallback to stateless getter if triggerRandomEvent isn't available
                    try {
                        const ev2 = EventManager.getEventForZone(cell.zone);
                        this.currentEvent = ev2;
                        // also set singleton currentEvent if possible
                        if (eventManager) eventManager.currentEvent = ev2;
                    } catch (err) {
                        console.error('Failed to generate event for zone:', cell.zone, err);
                        this.currentEvent = null;
                    }
                }

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
        const gs = this.gridSize;
        const startCol = Math.floor(this.cameraOffsetX / gs);
        const endCol = Math.min(this.cols, Math.ceil((this.cameraOffsetX + this.screenWidth) / gs));
        const startRow = Math.floor(this.cameraOffsetY / gs);
        const endRow = Math.min(this.rows, Math.ceil((this.cameraOffsetY + this.screenHeight) / gs));

        for (let r = startRow; r < endRow; r++) {
            if (r < 0 || r >= this.rows) continue;
            const row = this.mapData[r];
            for (let c = startCol; c < endCol; c++) {
                if (c < 0 || c >= this.cols) continue;
                visibleCells.push({ x: c, y: r, data: row[c] });
            }
        }
        return visibleCells;
    }
}
