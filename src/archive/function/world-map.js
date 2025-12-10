// ===== 世界地圖模型 =====

/**
 * 怪物工廠類別
 */
class MonsterFactory {
    /**
     * 根據區域類型創建怪物
     */
    static createMonster(zoneType) {
        switch (zoneType) {
            case 'low':
                return this._createLowLevelMonster();
            case 'medium':
                return this._createMediumLevelMonster();
            case 'high':
                return this._createHighLevelMonster();
            case 'boss':
                return this._createBossMonster();
            default:
                return null;
        }
    }

    /**
     * 創建低等級怪物
     */
    static _createLowLevelMonster() {
        const monsters = [
            {
                name: '小史萊姆',
                icon: '🟢',
                level: 1,
                hp: 50,
                maxHp: 50,
                attack: 10,
                defense: 5,
                exp: 10,
                drops: [
                    { 
                        item: new Consumable('slime_gel_' + Date.now(), '史萊姆凝膠', ItemType.POTION, ItemRarity.COMMON, '🧪', '普通的史萊姆凝膠', 10, { hp: 20 }), 
                        probability: 0.8 
                    },
                    { 
                        item: new Consumable('slime_core_' + Date.now(), '史萊姆核心', ItemType.MATERIAL, ItemRarity.RARE, '💎', '較少見的史萊姆核心', 50, {}), 
                        probability: 0.2 
                    }
                ]
            },
            {
                name: '弱小哥布林',
                icon: '👺',
                level: 2,
                hp: 60,
                maxHp: 60,
                attack: 15,
                defense: 8,
                exp: 15,
                drops: [
                    { 
                        item: new Equipment('goblin_sword_' + Date.now(), '破舊短劍', ItemType.WEAPON, ItemRarity.COMMON, '🗡️', '哥布林使用的破舊短劍', 15, 5, 0), 
                        probability: 0.7 
                    },
                    { 
                        item: new Consumable('goblin_pouch_' + Date.now(), '哥布林零錢袋', ItemType.MATERIAL, ItemRarity.COMMON, '💰', '裝有一些錢的袋子', 20, {}), 
                        probability: 0.3 
                    }
                ]
            },
            {
                name: '野狼',
                icon: '🐺',
                level: 2,
                hp: 55,
                maxHp: 55,
                attack: 12,
                defense: 6,
                exp: 12,
                drops: []
            }
        ];
        return new Monster(monsters[Math.floor(Math.random() * monsters.length)]);
    }

    /**
     * 創建中等級怪物
     */
    static _createMediumLevelMonster() {
        const monsters = [
            {
                name: '獸人戰士',
                icon: '⚔️',
                level: 4,
                hp: 100,
                maxHp: 100,
                attack: 25,
                defense: 12,
                exp: 40,
                drops: []
            },
            {
                name: '暗影刺客',
                icon: '🗡️',
                level: 5,
                hp: 90,
                maxHp: 90,
                attack: 30,
                defense: 8,
                exp: 45,
                drops: []
            },
            {
                name: '石頭巨人',
                icon: '🗿',
                level: 5,
                hp: 140,
                maxHp: 140,
                attack: 20,
                defense: 18,
                exp: 50,
                drops: []
            }
        ];
        return new Monster(monsters[Math.floor(Math.random() * monsters.length)]);
    }

    /**
     * 創建高等級怪物
     */
    static _createHighLevelMonster() {
        const monsters = [
            {
                name: '火焰惡魔',
                icon: '🔥',
                level: 7,
                hp: 200,
                maxHp: 200,
                attack: 40,
                defense: 20,
                exp: 100,
                drops: []
            },
            {
                name: '冰霜巨龍',
                icon: '🐉',
                level: 8,
                hp: 250,
                maxHp: 250,
                attack: 50,
                defense: 25,
                exp: 120,
                drops: []
            },
            {
                name: '黑暗騎士',
                icon: '🛡️',
                level: 8,
                hp: 220,
                maxHp: 220,
                attack: 45,
                defense: 30,
                exp: 110,
                drops: []
            }
        ];
        return new Monster(monsters[Math.floor(Math.random() * monsters.length)]);
    }

    /**
     * 創建Boss怪物
     */
    static _createBossMonster() {
        const monsters = [
            {
                name: '邪惡魔王',
                icon: '👿',
                level: 10,
                hp: 500,
                maxHp: 500,
                attack: 80,
                defense: 40,
                exp: 500,
                drops: []
            },
            {
                name: '遠古龍王',
                icon: '🐲',
                level: 12,
                hp: 600,
                maxHp: 600,
                attack: 100,
                defense: 50,
                exp: 600,
                drops: []
            },
            {
                name: '毀滅之神',
                icon: '💀',
                level: 15,
                hp: 800,
                maxHp: 800,
                attack: 120,
                defense: 60,
                exp: 800,
                drops: []
            }
        ];
        return new Monster(monsters[Math.floor(Math.random() * monsters.length)]);
    }
}

/**
 * 怪物類別
 */
class Monster {
    constructor(template) {
        this.name = template.name;
        this.icon = template.icon;
        this.level = template.level;
        this.hp = template.hp;
        this.maxHp = template.maxHp;
        this.attack = template.attack;
        this.defense = template.defense;
        this.exp = template.exp || 0;
        this.drops = template.drops || [];
    }
    
    /**
     * 獲取掉落物品
     */
    getDrops() {
        const items = [];
        
        // 必定掉落金幣
        const gold = Math.floor(Math.random() * (this.level * 20 - this.level * 10 + 1)) + this.level * 10;
        
        // 30% 概率掉落裝備
        if (Math.random() < 0.3) {
            if (Math.random() < 0.6) {
                // 60% 是武器
                const rarityRoll = Math.random();
                let rarity, descPrefix, atkMultiplier;
                
                if (rarityRoll < 0.1) {
                    // 10% 傳說
                    rarity = ItemRarity.LEGENDARY;
                    descPrefix = '一把傳奇的';
                    atkMultiplier = 2;
                } else if (rarityRoll < 0.4) {
                    // 30% 稀有
                    rarity = ItemRarity.RARE;
                    descPrefix = '一把稀有的';
                    atkMultiplier = 1.5;
                } else {
                    // 60% 普通
                    rarity = ItemRarity.COMMON;
                    descPrefix = '一把普通的';
                    atkMultiplier = 1;
                }
                
                const weaponTypes = [
                    { name: '劍', icon: '⚔️' },
                    { name: '斧', icon: '🪓' },
                    { name: '槍', icon: '🔱' }
                ];
                const weaponType = weaponTypes[Math.floor(Math.random() * weaponTypes.length)];
                const attack = Math.floor((Math.random() * (this.level * 2 - this.level + 1) + this.level) * atkMultiplier);
                
                const rarityPrefix = {
                    [ItemRarity.COMMON]: '',
                    [ItemRarity.UNCOMMON]: '精良的',
                    [ItemRarity.RARE]: '稀有的',
                    [ItemRarity.EPIC]: '史詩的',
                    [ItemRarity.LEGENDARY]: '傳說的'
                };
                
                const price = Math.floor(attack * 10 * atkMultiplier);
                
                items.push(new Equipment(
                    `weapon_${Date.now()}_${Math.random()}`,
                    `${rarityPrefix[rarity]}${weaponType.name}`,
                    ItemType.WEAPON,
                    rarity,
                    weaponType.icon,
                    `${descPrefix}${weaponType.name}`,
                    price,
                    attack,
                    0
                ));
            } else {
                // 40% 是防具
                const armorTypes = [
                    { name: '盔甲', icon: '🛡️' },
                    { name: '護甲', icon: '🦺' },
                    { name: '皮甲', icon: '👔' }
                ];
                const armorType = armorTypes[Math.floor(Math.random() * armorTypes.length)];
                const defense = Math.floor(Math.random() * (this.level * 2 - this.level + 1)) + this.level;
                const price = Math.floor(defense * 8);
                
                items.push(new Equipment(
                    `armor_${Date.now()}_${Math.random()}`,
                    `精良的${armorType.name}`,
                    ItemType.ARMOR,
                    ItemRarity.UNCOMMON,
                    armorType.icon,
                    `一件品質不錯的${armorType.name}`,
                    price,
                    0,
                    defense
                ));
            }
        }
        
        // Boss 有機會掉落稀有物品
        if (this.level >= 10 && Math.random() < 0.5) {
            items.push(new Equipment(
                `magic_gem_${Date.now()}`,
                '魔法寶石',
                ItemType.ACCESSORY,
                ItemRarity.EPIC,
                '💎',
                '蘊含強大魔力的寶石',
                500,
                5,
                5
            ));
        }
        
        // 怪物專屬掉落
        for (const drop of this.drops) {
            if (Math.random() < drop.probability) {
                items.push(drop.item);
            }
        }
        
        return { items, gold };
    }
    
    /**
     * 受到傷害
     */
    takeDamage(damage) {
        const actualDamage = Math.max(1, damage - this.defense);
        this.hp = Math.max(0, this.hp - actualDamage);
        return actualDamage;
    }
    
    /**
     * 是否死亡
     */
    isDead() {
        return this.hp <= 0;
    }
}

/**
 * 世界地圖類別
 */
class WorldMap {
    constructor(player, gridSize = 60, rows = 20, cols = 30, screenWidth = 1000, screenHeight = 600) {
        this.player = player;
        this.gridSize = gridSize;
        this.rows = rows;
        this.cols = cols;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.mapWidth = cols * gridSize;
        this.mapHeight = rows * gridSize;
        
        // 玩家初始位置（地圖中央）
        this.playerPos = {
            x: Math.floor(cols / 2),
            y: Math.floor(rows / 2)
        };
        
        // 生成地圖
        this.mapData = this.generateMap();
        
        // 確保玩家出生在空地
        while (this.mapData[this.playerPos.y][this.playerPos.x].type !== 'empty') {
            this.playerPos.x = Math.floor(cols / 2) + Math.floor(Math.random() * 3) - 1;
            this.playerPos.y = Math.floor(rows / 2) + Math.floor(Math.random() * 3) - 1;
        }
        
        // 相機偏移
        this.cameraOffsetX = 0;
        this.cameraOffsetY = 0;
        
        // 當前遭遇的怪物
        this.currentMonster = null;
        
        // 更新相機位置
        this.updateCamera();
    }

    /**
     * 生成地圖資料
     */
    generateMap() {
        const lowMaxSq = 6 * 6;
        const mediumMaxSq = 9 * 9;
        const highMaxSq = 12 * 12;
        
        // 初始化地圖
        const data = [];
        for (let r = 0; r < this.rows; r++) {
            const row = [];
            for (let c = 0; c < this.cols; c++) {
                row.push({ type: 'empty', zone: 'low' });
            }
            data.push(row);
        }
        
        // 根據距離中心點的距離劃分區域
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const dx = c - this.playerPos.x;
                const dy = r - this.playerPos.y;
                const distanceSq = dx * dx + dy * dy;
                
                // 判斷危險區域
                let zone;
                if (distanceSq < lowMaxSq) {
                    zone = 'low';
                } else if (distanceSq < mediumMaxSq) {
                    zone = 'medium';
                } else if (distanceSq < highMaxSq) {
                    zone = 'high';
                } else {
                    zone = 'boss';
                }
                
                data[r][c].zone = zone;
                
                // 隨機生成地形
                const random = Math.random();
                let cellType;
                if (random < 0.2) {
                    cellType = 'wall';  // 20% 牆壁
                } else if (random < 0.35) {
                    cellType = 'monster';  // 15% 怪物
                } else {
                    cellType = 'empty';  // 65% 空地
                }
                
                data[r][c].type = cellType;
            }
        }
        
        // 確保出生點是空地
        data[this.playerPos.y][this.playerPos.x] = { type: 'empty', zone: 'low' };
        
        return data;
    }

    /**
     * 更新相機位置（使玩家保持在畫面中央）
     */
    updateCamera() {
        let x = this.playerPos.x * this.gridSize - this.screenWidth / 2 + this.gridSize / 2;
        let y = this.playerPos.y * this.gridSize - this.screenHeight / 2 + this.gridSize / 2;
        
        // 限制相機範圍
        this.cameraOffsetX = Math.max(0, Math.min(x, this.mapWidth - this.screenWidth));
        this.cameraOffsetY = Math.max(0, Math.min(y, this.mapHeight - this.screenHeight));
    }

    /**
     * 移動玩家
     */
    movePlayer(dx, dy) {
        const newX = Math.max(0, Math.min(this.cols - 1, this.playerPos.x + dx));
        const newY = Math.max(0, Math.min(this.rows - 1, this.playerPos.y + dy));
        
        // 檢查目標位置是否可移動
        if (this.mapData[newY][newX].type !== 'wall') {
            this.playerPos.x = newX;
            this.playerPos.y = newY;
            this.updateCamera();
            
            const cell = this.mapData[newY][newX];
            
            // 檢查是否遭遇怪物
            if (cell.type === 'monster') {
                this.currentMonster = MonsterFactory.createMonster(cell.zone);
                cell.type = 'empty';  // 移除地圖上的怪物
                return 'battle';
            }
        }
        
        return null;
    }

    /**
     * 獲取當前怪物
     */
    getCurrentMonster() {
        return this.currentMonster;
    }

    /**
     * 清除當前怪物
     */
    clearCurrentMonster() {
        this.currentMonster = null;
    }

    /**
     * 獲取玩家當前所在區域
     */
    getCurrentZone() {
        return this.mapData[this.playerPos.y][this.playerPos.x].zone;
    }

    /**
     * 獲取可見範圍內的地圖資料
     */
    getVisibleCells() {
        const visibleCells = [];
        const startCol = Math.floor(this.cameraOffsetX / this.gridSize);
        const endCol = Math.min(this.cols, Math.ceil((this.cameraOffsetX + this.screenWidth) / this.gridSize));
        const startRow = Math.floor(this.cameraOffsetY / this.gridSize);
        const endRow = Math.min(this.rows, Math.ceil((this.cameraOffsetY + this.screenHeight) / this.gridSize));
        
        for (let r = startRow; r < endRow; r++) {
            for (let c = startCol; c < endCol; c++) {
                visibleCells.push({
                    x: c,
                    y: r,
                    data: this.mapData[r][c]
                });
            }
        }
        
        return visibleCells;
    }
}
