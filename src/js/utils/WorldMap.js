/**
 * WorldMap.js
 * Handles map generation, movement, monster encounters, and map events.
 */
import { Equipment, Weapon, Armor, Accessory, Consumable, Item, ItemType, ItemRarity } from '../models/DataModel.js';

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

// ===== 怪物工廠 =====
export class MonsterFactory {
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
                        item: new Weapon('goblin_sword_' + Date.now(), '破舊短劍', ItemRarity.COMMON, '🗡️', '哥布林使用的破舊短劍', 15, 8, 0, 0.05, 1.3, 0.9, 1.1), 
                        probability: 0.4 
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
                drops: [
                    {
                        item: new Item('wolf_fang_' + Date.now(), '狼牙', ItemType.MATERIAL, ItemRarity.COMMON, '🦷', '鋒利的狼牙，可用於製作', 15),
                        probability: 0.5
                    },
                    {
                        item: new Armor('wolf_pelt_' + Date.now(), '狼皮護甲', ItemRarity.COMMON, '🧥', '用狼皮製成的輕便護甲', 25, 0, 6, 0.02, 1.1),
                        probability: 0.2
                    }
                ]
            },
            {
                name: '骷髏兵',
                icon: '💀',
                level: 3,
                hp: 70,
                maxHp: 70,
                attack: 18,
                defense: 10,
                exp: 18,
                drops: [
                    {
                        item: new Item('bone_fragment_' + Date.now(), '骨頭碎片', ItemType.MATERIAL, ItemRarity.COMMON, '🦴', '骷髏的骨頭碎片', 8),
                        probability: 0.6
                    },
                    {
                        item: new Weapon('bone_sword_' + Date.now(), '白骨劍', ItemRarity.UNCOMMON, '⚔️', '用骨頭打造的劍', 40, 12, 0, 0.08, 1.4, 1.0, 1.0),
                        probability: 0.15
                    }
                ]
            }
        ];
        return new Monster(monsters[Math.floor(Math.random() * monsters.length)]);
    }

    static _createMediumLevelMonster() {
        const monsters = [
            { 
                name: '獸人戰士', 
                icon: '👹', 
                level: 4, 
                hp: 100, 
                maxHp: 100, 
                attack: 25, 
                defense: 12, 
                exp: 40, 
                drops: [
                    {
                        item: new Weapon('orc_axe_' + Date.now(), '獸人戰斧', ItemRarity.UNCOMMON, '🪓', '獸人使用的沉重戰斧', 80, 20, 0, 0.1, 1.6, 0.8, 0.8),
                        probability: 0.25
                    },
                    {
                        item: new Armor('orc_armor_' + Date.now(), '獸人鎧甲', ItemRarity.UNCOMMON, '🛡️', '粗獷但堅固的鎧甲', 100, 0, 15, 0.03, 1.2),
                        probability: 0.2
                    }
                ]
            },
            { 
                name: '暗影刺客', 
                icon: '🥷', 
                level: 5, 
                hp: 90, 
                maxHp: 90, 
                attack: 30, 
                defense: 8, 
                exp: 45, 
                drops: [
                    {
                        item: new Weapon('shadow_dagger_' + Date.now(), '暗影匕首', ItemRarity.RARE, '🗡️', '能隱於暗影中的匕首', 150, 18, 0, 0.2, 2.0, 1.5, 1.5),
                        probability: 0.15
                    },
                    {
                        item: new Accessory('shadow_cloak_' + Date.now(), '暗影披風', ItemRarity.RARE, '🧣', '增加隱匿能力的披風', 120, 5, 8, 0.12, 1.5),
                        probability: 0.1
                    }
                ]
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
                drops: [
                    {
                        item: new Item('stone_core_' + Date.now(), '石核', ItemType.MATERIAL, ItemRarity.UNCOMMON, '💎', '石頭巨人的核心', 60),
                        probability: 0.4
                    },
                    {
                        item: new Armor('stone_shield_' + Date.now(), '岩石護盾', ItemRarity.RARE, '🛡️', '堅固如山的護盾', 200, 0, 25, 0.02, 1.1),
                        probability: 0.1
                    }
                ]
            },
            {
                name: '毒蜘蛛',
                icon: '🕷️',
                level: 4,
                hp: 80,
                maxHp: 80,
                attack: 22,
                defense: 6,
                exp: 35,
                drops: [
                    {
                        item: new Item('spider_silk_' + Date.now(), '蜘蛛絲', ItemType.MATERIAL, ItemRarity.UNCOMMON, '🕸️', '堅韌的蜘蛛絲', 30),
                        probability: 0.5
                    },
                    {
                        item: new Consumable('antidote_' + Date.now(), '解毒劑', ItemType.POTION, ItemRarity.UNCOMMON, '💊', '解除毒素的藥劑', 40, { hp: 10 }),
                        probability: 0.3
                    }
                ]
            }
        ];
        return new Monster(monsters[Math.floor(Math.random() * monsters.length)]);
    }

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
                drops: [
                    {
                        item: new Weapon('flame_sword_' + Date.now(), '烈焰之劍', ItemRarity.EPIC, '🗡️', '燃燒著永恆火焰的魔劍', 500, 35, 0, 0.15, 1.8, 1.1, 1.2),
                        probability: 0.1
                    },
                    {
                        item: new Item('demon_core_' + Date.now(), '惡魔核心', ItemType.MATERIAL, ItemRarity.EPIC, '❤️‍🔥', '蘊含惡魔力量的核心', 200),
                        probability: 0.2
                    }
                ]
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
                drops: [
                    {
                        item: new Weapon('frost_fang_' + Date.now(), '霜牙之刃', ItemRarity.EPIC, '❄️', '由龍牙打造的冰寒武器', 600, 40, 5, 0.18, 2.0, 1.0, 1.1),
                        probability: 0.08
                    },
                    {
                        item: new Item('dragon_scale_' + Date.now(), '龍鱗', ItemType.MATERIAL, ItemRarity.EPIC, '🐲', '堅硬的龍鱗', 300),
                        probability: 0.25
                    }
                ]
            },
            { 
                name: '黑暗騎士', 
                icon: '🖤', 
                level: 8, 
                hp: 220, 
                maxHp: 220, 
                attack: 45, 
                defense: 30, 
                exp: 110, 
                drops: [
                    {
                        item: new Armor('dark_armor_' + Date.now(), '黑暗鎧甲', ItemRarity.EPIC, '🛡️', '被黑暗力量浸染的鎧甲', 550, 10, 35, 0.05, 1.3),
                        probability: 0.1
                    },
                    {
                        item: new Weapon('cursed_blade_' + Date.now(), '詛咒之劍', ItemRarity.EPIC, '⚔️', '帶有詛咒的黑暗之劍', 480, 38, 0, 0.2, 1.9, 1.0, 1.0),
                        probability: 0.08
                    }
                ]
            },
            {
                name: '死靈法師',
                icon: '🧙‍♂️',
                level: 7,
                hp: 180,
                maxHp: 180,
                attack: 55,
                defense: 15,
                exp: 95,
                drops: [
                    {
                        item: new Accessory('necro_amulet_' + Date.now(), '亡靈護符', ItemRarity.EPIC, '📿', '增強黑暗魔法的護符', 400, 15, 5, 0.1, 1.6),
                        probability: 0.12
                    },
                    {
                        item: new Item('soul_essence_' + Date.now(), '靈魂精華', ItemType.MATERIAL, ItemRarity.EPIC, '👻', '濃縮的靈魂能量', 250),
                        probability: 0.2
                    }
                ]
            }
        ];
        return new Monster(monsters[Math.floor(Math.random() * monsters.length)]);
    }

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
                drops: [
                    {
                        item: new Weapon('demon_king_sword_' + Date.now(), '魔王之劍', ItemRarity.LEGENDARY, '⚔️', '魔王使用的至高武器', 2000, 60, 10, 0.25, 2.5, 1.2, 1.3),
                        probability: 0.2
                    },
                    {
                        item: new Armor('demon_king_armor_' + Date.now(), '魔王鎧甲', ItemRarity.LEGENDARY, '🛡️', '魔王的專屬鎧甲', 2500, 15, 50, 0.08, 1.5),
                        probability: 0.15
                    }
                ]
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
                drops: [
                    {
                        item: new Weapon('dragon_slayer_' + Date.now(), '屠龍者', ItemRarity.LEGENDARY, '🗡️', '傳說中屠龍勇者的神劍', 3000, 70, 5, 0.3, 3.0, 1.3, 1.4),
                        probability: 0.15
                    },
                    {
                        item: new Accessory('dragon_heart_' + Date.now(), '龍心寶石', ItemRarity.LEGENDARY, '💎', '蘊含龍之力量的寶石', 2800, 20, 20, 0.2, 2.0),
                        probability: 0.1
                    }
                ]
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
                drops: [
                    {
                        item: new Weapon('godslayer_' + Date.now(), '弒神者', ItemRarity.LEGENDARY, '⚡', '能夠斬殺神明的終極武器', 5000, 100, 10, 0.35, 3.5, 1.5, 1.5),
                        probability: 0.1
                    },
                    {
                        item: new Armor('god_armor_' + Date.now(), '神聖鎧甲', ItemRarity.LEGENDARY, '✨', '神明遺留的鎧甲', 4500, 20, 70, 0.1, 1.8),
                        probability: 0.08
                    },
                    {
                        item: new Accessory('god_ring_' + Date.now(), '神之戒指', ItemRarity.LEGENDARY, '💍', '蘊含神力的戒指', 4000, 25, 25, 0.25, 2.2),
                        probability: 0.05
                    }
                ]
            }
        ];
        return new Monster(monsters[Math.floor(Math.random() * monsters.length)]);
    }
}

export class Monster {
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
    
    getDrops() {
        const items = [];
        const gold = Math.floor(Math.random() * (this.level * 20 - this.level * 10 + 1)) + this.level * 10;
        
        // 從怪物定義的掉落表中獲取物品
        for (const drop of this.drops) {
            if (Math.random() < drop.probability) {
                // 重新生成 instanceId 以避免重複
                const newItem = Object.assign(Object.create(Object.getPrototypeOf(drop.item)), drop.item);
                newItem.instanceId = Date.now() + Math.random().toString(36).substr(2, 9);
                items.push(newItem);
            }
        }
        
        return { items, gold };
    }
    
    takeDamage(damage) {
        const actualDamage = Math.max(1, damage - this.defense);
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
        this.mapWidth = cols * gridSize;
        this.mapHeight = rows * gridSize;
        
        this.playerPos = { x: Math.floor(cols / 2), y: Math.floor(rows / 2) };
        this.mapData = this.generateMap();
        
        while (this.mapData[this.playerPos.y][this.playerPos.x].type !== 'empty') {
            this.playerPos.x = Math.floor(cols / 2) + Math.floor(Math.random() * 3) - 1;
            this.playerPos.y = Math.floor(rows / 2) + Math.floor(Math.random() * 3) - 1;
        }
        
        this.cameraOffsetX = 0;
        this.cameraOffsetY = 0;
        this.currentMonster = null;
        this.currentEvent = null; // 新增：當前事件
        this.updateCamera();
    }

    generateMap() {
        const lowMaxSq = 6 * 6;
        const mediumMaxSq = 9 * 9;
        const highMaxSq = 12 * 12;
        
        const data = [];
        for (let r = 0; r < this.rows; r++) {
            const row = [];
            for (let c = 0; c < this.cols; c++) {
                row.push({ type: 'empty', zone: 'low' });
            }
            data.push(row);
        }
        
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
                
                const random = Math.random();
                let cellType;
                if (random < 0.15) cellType = 'wall';
                else if (random < 0.30) cellType = 'monster';
                else if (random < 0.38) cellType = 'event'; // 新增：事件格子
                else cellType = 'empty';
                
                data[r][c].type = cellType;
                
                // 為事件格子生成具體事件
                if (cellType === 'event') {
                    data[r][c].eventData = MapEventFactory.createEvent(zone);
                }
            }
        }
        
        data[this.playerPos.y][this.playerPos.x] = { type: 'empty', zone: 'low' };
        return data;
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
            
            const cell = this.mapData[newY][newX];
            
            if (cell.type === 'monster') {
                this.currentMonster = MonsterFactory.createMonster(cell.zone);
                cell.type = 'empty';
                return 'battle';
            }
            
            if (cell.type === 'event') {
                this.currentEvent = cell.eventData;
                cell.type = 'empty';
                return 'event';
            }
        }
        return null;
    }

    getCurrentMonster() { return this.currentMonster; }
    clearCurrentMonster() { this.currentMonster = null; }
    getCurrentEvent() { return this.currentEvent; }
    clearCurrentEvent() { this.currentEvent = null; }
    getCurrentZone() { return this.mapData[this.playerPos.y][this.playerPos.x].zone; }

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
