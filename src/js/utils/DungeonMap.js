/**
 * DungeonMap.js
 * 副本地圖生成器 - 棋盤式迷宮地圖
 */

// ===== 副本地形類型 =====
export const DungeonTileType = {
    EMPTY: 'empty',
    WALL: 'wall',
    MONSTER: 'monster',
    ELITE: 'elite',
    BOSS: 'boss',
    TREASURE: 'treasure',
    STAIRS: 'stairs',
    ENTRANCE: 'entrance',
    HEALING: 'healing',
    KEY: 'key',
    LOCKED_DOOR: 'locked_door',
    // 特殊地形
    DARK: 'dark',           // 洞窟：暗區
    ICE: 'ice',             // 雪峰：冰面（裝飾用）
    PRESSURE_PLATE: 'pressure_plate', // 遺跡：壓力板
    PORTAL: 'portal',       // 叢林：傳送點
    LAVA: 'lava'            // 地獄：岩漿
};

// ===== 地形圖標 =====
export const DungeonTileIcons = {
    [DungeonTileType.EMPTY]: '',
    [DungeonTileType.WALL]: '🧱',
    [DungeonTileType.MONSTER]: '👾',
    [DungeonTileType.ELITE]: '👹',
    [DungeonTileType.BOSS]: '👑',
    [DungeonTileType.TREASURE]: '🏺',
    [DungeonTileType.STAIRS]: '🪜',
    [DungeonTileType.ENTRANCE]: '🚪',
    [DungeonTileType.HEALING]: '⛲',
    [DungeonTileType.KEY]: '🗝️',
    [DungeonTileType.LOCKED_DOOR]: '🔒',
    [DungeonTileType.DARK]: '⬛',
    [DungeonTileType.ICE]: '🧊',
    [DungeonTileType.PRESSURE_PLATE]: '🔘',
    [DungeonTileType.PORTAL]: '🌀',
    [DungeonTileType.LAVA]: '🟧'
};

// ===== 副本地圖生成器 =====
export default class DungeonMap {
    constructor(dungeonType, floor, config = {}) {
        this.dungeonType = dungeonType;
        this.floor = floor;
        this.isBossFloor = config.isBossFloor || false;
        
        // 地圖尺寸隨樓層增加
        const baseSize = 12;
        const sizeIncrease = Math.min(floor - 1, 4) * 2;
        this.rows = config.rows || baseSize + sizeIncrease;
        this.cols = config.cols || baseSize + sizeIncrease + 4;
        
        this.gridSize = config.gridSize || 50;
        this.screenWidth = config.screenWidth || 800;
        this.screenHeight = config.screenHeight || 500;
        
        // 玩家位置（入口）
        this.playerPos = { x: 1, y: Math.floor(this.rows / 2) };
        this.stairsPos = null;
        this.bossPos = null;
        
        // 迷霧戰爭
        this.fogOfWar = config.fogOfWar !== false;
        this.visionRange = this.getVisionRange();
        this.explored = []; // 已探索的格子
        
        // 特殊機制狀態
        this.hasKey = false;
        this.pressurePlatesActivated = new Set();
        this.doorsOpened = new Set();
        
        // 生成地圖
        this.mapData = this.generateMap();
        this.initExplored();
        
        // 相機
        this.cameraOffsetX = 0;
        this.cameraOffsetY = 0;
        this.updateCamera();
        
        // 當前互動目標
        this.currentMonster = null;
        this.currentTreasure = null;
        this.currentHealing = null;
    }
    
    // 根據副本類型獲取視野範圍
    getVisionRange() {
        switch (this.dungeonType) {
            case 'cave': return 2; // 洞窟視野最小
            case 'snow': return 4;
            case 'ruins': return 3;
            case 'jungle': return 3;
            case 'hell': return 4;
            default: return 3;
        }
    }
    
    // 初始化已探索區域
    initExplored() {
        this.explored = [];
        for (let r = 0; r < this.rows; r++) {
            this.explored.push(new Array(this.cols).fill(false));
        }
        this.updateExplored();
    }
    
    // 更新已探索區域
    updateExplored() {
        const range = this.visionRange;
        for (let dy = -range; dy <= range; dy++) {
            for (let dx = -range; dx <= range; dx++) {
                const nx = this.playerPos.x + dx;
                const ny = this.playerPos.y + dy;
                if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows) {
                    // 圓形視野
                    if (dx * dx + dy * dy <= range * range) {
                        this.explored[ny][nx] = true;
                    }
                }
            }
        }
    }
    
    // 生成迷宮地圖
    generateMap() {
        // 初始化全牆壁
        const data = [];
        for (let r = 0; r < this.rows; r++) {
            const row = [];
            for (let c = 0; c < this.cols; c++) {
                row.push({ 
                    type: DungeonTileType.WALL, 
                    visited: false,
                    monsterData: null,
                    treasureData: null
                });
            }
            data.push(row);
        }
        
        // 使用遞迴回溯法生成迷宮
        this.generateMaze(data, 1, Math.floor(this.rows / 2));
        
        // 設置入口
        data[this.playerPos.y][this.playerPos.x].type = DungeonTileType.ENTRANCE;
        
        // 放置樓梯或 Boss
        this.placeStairsOrBoss(data);
        
        // 放置內容物（怪物、寶箱等）
        this.populateMap(data);
        
        // 副本特殊地形
        this.addSpecialTerrain(data);
        
        return data;
    }
    
    // 遞迴回溯迷宮生成
    generateMaze(data, startX, startY) {
        const stack = [{ x: startX, y: startY }];
        data[startY][startX].type = DungeonTileType.EMPTY;
        data[startY][startX].visited = true;
        
        const directions = [
            { dx: 0, dy: -2 }, // 上
            { dx: 0, dy: 2 },  // 下
            { dx: -2, dy: 0 }, // 左
            { dx: 2, dy: 0 }   // 右
        ];
        
        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            
            // 找到未訪問的鄰居
            const neighbors = [];
            for (const dir of directions) {
                const nx = current.x + dir.dx;
                const ny = current.y + dir.dy;
                if (nx > 0 && nx < this.cols - 1 && ny > 0 && ny < this.rows - 1) {
                    if (!data[ny][nx].visited) {
                        neighbors.push({ x: nx, y: ny, midX: current.x + dir.dx / 2, midY: current.y + dir.dy / 2 });
                    }
                }
            }
            
            if (neighbors.length > 0) {
                // 隨機選擇一個鄰居
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                
                // 打通牆壁
                data[next.midY][next.midX].type = DungeonTileType.EMPTY;
                data[next.y][next.x].type = DungeonTileType.EMPTY;
                data[next.y][next.x].visited = true;
                
                stack.push({ x: next.x, y: next.y });
            } else {
                stack.pop();
            }
        }
        
        // 額外打通一些牆壁，讓迷宮不那麼線性
        this.addExtraPassages(data);
    }
    
    // 增加額外通道
    addExtraPassages(data) {
        const extraPassages = Math.floor((this.rows * this.cols) * 0.03);
        for (let i = 0; i < extraPassages; i++) {
            const x = 1 + Math.floor(Math.random() * (this.cols - 2));
            const y = 1 + Math.floor(Math.random() * (this.rows - 2));
            if (data[y][x].type === DungeonTileType.WALL) {
                // 確保不會打破邊界
                const emptyNeighbors = this.countEmptyNeighbors(data, x, y);
                if (emptyNeighbors >= 2) {
                    data[y][x].type = DungeonTileType.EMPTY;
                }
            }
        }
    }
    
    countEmptyNeighbors(data, x, y) {
        let count = 0;
        const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
        for (const [dx, dy] of dirs) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows) {
                if (data[ny][nx].type !== DungeonTileType.WALL) {
                    count++;
                }
            }
        }
        return count;
    }
    
    // 放置樓梯或 Boss
    placeStairsOrBoss(data) {
        // 找到離入口最遠的空格
        let maxDist = 0;
        let farPos = { x: this.cols - 2, y: Math.floor(this.rows / 2) };
        
        for (let r = 1; r < this.rows - 1; r++) {
            for (let c = 1; c < this.cols - 1; c++) {
                if (data[r][c].type === DungeonTileType.EMPTY) {
                    const dist = Math.abs(c - this.playerPos.x) + Math.abs(r - this.playerPos.y);
                    if (dist > maxDist) {
                        maxDist = dist;
                        farPos = { x: c, y: r };
                    }
                }
            }
        }
        
        if (this.isBossFloor) {
            // Boss 層：放置 Boss
            data[farPos.y][farPos.x].type = DungeonTileType.BOSS;
            this.bossPos = farPos;
        } else {
            // 普通層：放置樓梯
            data[farPos.y][farPos.x].type = DungeonTileType.STAIRS;
            this.stairsPos = farPos;
        }
    }
    
    // 放置內容物
    populateMap(data) {
        const emptyTiles = [];
        
        // 收集所有空格（排除入口、樓梯、Boss）
        for (let r = 1; r < this.rows - 1; r++) {
            for (let c = 1; c < this.cols - 1; c++) {
                if (data[r][c].type === DungeonTileType.EMPTY) {
                    // 排除玩家附近
                    const dist = Math.abs(c - this.playerPos.x) + Math.abs(r - this.playerPos.y);
                    if (dist > 3) {
                        emptyTiles.push({ x: c, y: r });
                    }
                }
            }
        }
        
        // 洗牌
        this.shuffle(emptyTiles);
        
        // 放置內容
        let index = 0;
        const monsterCount = Math.floor(emptyTiles.length * 0.15) + this.floor;
        const eliteCount = Math.max(1, Math.floor(this.floor / 2));
        const treasureCount = Math.floor(emptyTiles.length * 0.05) + 1;
        const healingCount = Math.max(1, 2 - Math.floor(this.floor / 3));
        
        // 放置普通怪物
        for (let i = 0; i < monsterCount && index < emptyTiles.length; i++) {
            const pos = emptyTiles[index++];
            data[pos.y][pos.x].type = DungeonTileType.MONSTER;
        }
        
        // 放置精英怪
        for (let i = 0; i < eliteCount && index < emptyTiles.length; i++) {
            const pos = emptyTiles[index++];
            data[pos.y][pos.x].type = DungeonTileType.ELITE;
        }
        
        // 放置寶箱
        for (let i = 0; i < treasureCount && index < emptyTiles.length; i++) {
            const pos = emptyTiles[index++];
            data[pos.y][pos.x].type = DungeonTileType.TREASURE;
        }
        
        // 放置恢復點
        for (let i = 0; i < healingCount && index < emptyTiles.length; i++) {
            const pos = emptyTiles[index++];
            data[pos.y][pos.x].type = DungeonTileType.HEALING;
        }
    }
    
    // 添加副本特殊地形
    addSpecialTerrain(data) {
        switch (this.dungeonType) {
            case 'cave':
                // 洞窟：部分區域是暗區（視覺效果，探索後才亮）
                // 已經通過迷霧戰爭實現
                break;
                
            case 'snow':
                // 雪峰：添加冰面裝飾（技能禁用在戰鬥系統處理）
                this.addDecorativeTerrain(data, DungeonTileType.ICE, 0.1);
                break;
                
            case 'ruins':
                // 遺跡：添加壓力板和鎖門
                this.addPressurePlateSystem(data);
                break;
                
            case 'jungle':
                // 叢林：添加傳送點
                this.addPortals(data);
                break;
                
            case 'hell':
                // 地獄：添加岩漿
                this.addLavaTerrain(data);
                break;
        }
    }
    
    // 添加裝飾性地形
    addDecorativeTerrain(data, type, ratio) {
        for (let r = 1; r < this.rows - 1; r++) {
            for (let c = 1; c < this.cols - 1; c++) {
                if (data[r][c].type === DungeonTileType.EMPTY && Math.random() < ratio) {
                    data[r][c].decoration = type;
                }
            }
        }
    }
    
    // 遺跡：壓力板系統
    addPressurePlateSystem(data) {
        // 在樓梯/Boss 前放置鎖門
        const target = this.isBossFloor ? this.bossPos : this.stairsPos;
        if (!target) return;
        
        // 找到通往目標的路徑上的一個點放鎖門
        const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
        for (const [dx, dy] of dirs) {
            const doorX = target.x + dx;
            const doorY = target.y + dy;
            if (doorX > 0 && doorX < this.cols - 1 && doorY > 0 && doorY < this.rows - 1) {
                if (data[doorY][doorX].type === DungeonTileType.EMPTY) {
                    data[doorY][doorX].type = DungeonTileType.LOCKED_DOOR;
                    data[doorY][doorX].doorId = 'main_door';
                    break;
                }
            }
        }
        
        // 隨機放置壓力板
        const emptyTiles = [];
        for (let r = 1; r < this.rows - 1; r++) {
            for (let c = 1; c < this.cols - 1; c++) {
                if (data[r][c].type === DungeonTileType.EMPTY) {
                    const dist = Math.abs(c - this.playerPos.x) + Math.abs(r - this.playerPos.y);
                    if (dist > 5) {
                        emptyTiles.push({ x: c, y: r });
                    }
                }
            }
        }
        
        if (emptyTiles.length > 0) {
            const platePos = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
            data[platePos.y][platePos.x].type = DungeonTileType.PRESSURE_PLATE;
            data[platePos.y][platePos.x].plateId = 'main_door';
        }
    }
    
    // 叢林：傳送點
    addPortals(data) {
        const portalCount = 2 + Math.floor(this.floor / 2);
        const emptyTiles = [];
        
        for (let r = 1; r < this.rows - 1; r++) {
            for (let c = 1; c < this.cols - 1; c++) {
                if (data[r][c].type === DungeonTileType.EMPTY) {
                    emptyTiles.push({ x: c, y: r });
                }
            }
        }
        
        this.shuffle(emptyTiles);
        const portals = [];
        
        for (let i = 0; i < Math.min(portalCount, emptyTiles.length); i++) {
            const pos = emptyTiles[i];
            data[pos.y][pos.x].type = DungeonTileType.PORTAL;
            portals.push(pos);
        }
        
        // 記錄傳送點位置
        this.portals = portals;
    }
    
    // 地獄：岩漿
    addLavaTerrain(data) {
        const lavaRatio = 0.08 + (this.floor * 0.02);
        
        for (let r = 1; r < this.rows - 1; r++) {
            for (let c = 1; c < this.cols - 1; c++) {
                if (data[r][c].type === DungeonTileType.EMPTY && Math.random() < lavaRatio) {
                    // 確保不會堵死路
                    const emptyNeighbors = this.countEmptyNeighbors(data, c, r);
                    if (emptyNeighbors >= 3) {
                        data[r][c].type = DungeonTileType.LAVA;
                    }
                }
            }
        }
    }
    
    // 洗牌
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    // 更新相機
    updateCamera() {
        let x = this.playerPos.x * this.gridSize - this.screenWidth / 2 + this.gridSize / 2;
        let y = this.playerPos.y * this.gridSize - this.screenHeight / 2 + this.gridSize / 2;
        this.cameraOffsetX = Math.max(0, Math.min(x, this.cols * this.gridSize - this.screenWidth));
        this.cameraOffsetY = Math.max(0, Math.min(y, this.rows * this.gridSize - this.screenHeight));
    }
    
    // 移動玩家
    movePlayer(dx, dy) {
        const newX = this.playerPos.x + dx;
        const newY = this.playerPos.y + dy;
        
        // 邊界檢查
        if (newX < 0 || newX >= this.cols || newY < 0 || newY >= this.rows) {
            return null;
        }
        
        const cell = this.mapData[newY][newX];
        
        // 牆壁阻擋
        if (cell.type === DungeonTileType.WALL) {
            return null;
        }
        
        // 鎖門阻擋
        if (cell.type === DungeonTileType.LOCKED_DOOR && !this.doorsOpened.has(cell.doorId)) {
            return { type: 'blocked', message: '門是鎖著的，需要找到開關！' };
        }
        
        // 移動玩家
        this.playerPos.x = newX;
        this.playerPos.y = newY;
        this.updateCamera();
        this.updateExplored();
        
        // 處理踩到的格子
        return this.handleTileInteraction(cell, newX, newY);
    }
    
    // 處理格子互動
    handleTileInteraction(cell, x, y) {
        switch (cell.type) {
            case DungeonTileType.MONSTER:
                this.currentMonster = { type: 'normal', x, y };
                return { type: 'battle', monsterType: 'normal' };
                
            case DungeonTileType.ELITE:
                this.currentMonster = { type: 'elite', x, y };
                return { type: 'battle', monsterType: 'elite' };
                
            case DungeonTileType.BOSS:
                this.currentMonster = { type: 'boss', x, y };
                return { type: 'battle', monsterType: 'boss' };
                
            case DungeonTileType.TREASURE:
                this.currentTreasure = { x, y };
                return { type: 'treasure' };
                
            case DungeonTileType.HEALING:
                this.currentHealing = { x, y };
                return { type: 'healing' };
                
            case DungeonTileType.STAIRS:
                return { type: 'stairs' };
                
            case DungeonTileType.KEY:
                this.hasKey = true;
                this.mapData[y][x].type = DungeonTileType.EMPTY;
                return { type: 'key' };
                
            case DungeonTileType.PRESSURE_PLATE:
                this.pressurePlatesActivated.add(cell.plateId);
                this.doorsOpened.add(cell.plateId);
                return { type: 'pressure_plate', doorId: cell.plateId };
                
            case DungeonTileType.PORTAL:
                return this.handlePortal(x, y);
                
            case DungeonTileType.LAVA:
                return { type: 'lava', damage: 10 + this.floor * 5 };
                
            default:
                return null;
        }
    }
    
    // 處理傳送點
    handlePortal(currentX, currentY) {
        if (!this.portals || this.portals.length < 2) return null;
        
        // 找到其他傳送點
        const otherPortals = this.portals.filter(p => p.x !== currentX || p.y !== currentY);
        if (otherPortals.length === 0) return null;
        
        // 隨機傳送到另一個傳送點
        const target = otherPortals[Math.floor(Math.random() * otherPortals.length)];
        this.playerPos.x = target.x;
        this.playerPos.y = target.y;
        this.updateCamera();
        this.updateExplored();
        
        return { type: 'portal', targetX: target.x, targetY: target.y };
    }
    
    // 清除已擊敗的怪物
    clearMonster() {
        if (this.currentMonster) {
            const { x, y } = this.currentMonster;
            this.mapData[y][x].type = DungeonTileType.EMPTY;
            this.currentMonster = null;
        }
    }
    
    // 清除已開啟的寶箱
    clearTreasure() {
        if (this.currentTreasure) {
            const { x, y } = this.currentTreasure;
            this.mapData[y][x].type = DungeonTileType.EMPTY;
            this.currentTreasure = null;
        }
    }
    
    // 清除已使用的恢復點
    clearHealing() {
        if (this.currentHealing) {
            const { x, y } = this.currentHealing;
            this.mapData[y][x].type = DungeonTileType.EMPTY;
            this.currentHealing = null;
        }
    }
    
    // 獲取可見格子
    getVisibleCells() {
        const visibleCells = [];
        const startCol = Math.floor(this.cameraOffsetX / this.gridSize);
        const endCol = Math.min(this.cols, Math.ceil((this.cameraOffsetX + this.screenWidth) / this.gridSize));
        const startRow = Math.floor(this.cameraOffsetY / this.gridSize);
        const endRow = Math.min(this.rows, Math.ceil((this.cameraOffsetY + this.screenHeight) / this.gridSize));
        
        for (let r = startRow; r < endRow; r++) {
            for (let c = startCol; c < endCol; c++) {
                if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
                    const isExplored = this.explored[r][c];
                    const isVisible = this.isInVision(c, r);
                    visibleCells.push({ 
                        x: c, 
                        y: r, 
                        data: this.mapData[r][c],
                        explored: isExplored,
                        visible: isVisible
                    });
                }
            }
        }
        return visibleCells;
    }
    
    // 檢查是否在視野內
    isInVision(x, y) {
        const dx = x - this.playerPos.x;
        const dy = y - this.playerPos.y;
        return dx * dx + dy * dy <= this.visionRange * this.visionRange;
    }
    
    // 擴大視野（火把效果）
    extendVision(bonus) {
        this.visionRange += bonus;
        this.updateExplored();
    }
}
