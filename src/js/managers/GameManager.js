/**
 * GameManager.js
 * Singleton class for managing global game state.
 * Uses DataModel classes for robust state management.
 */
import { Character, Item, Equipment, Weapon, Armor, Accessory, Consumable, ItemType, ItemRarity } from '../models/DataModel.js';

class GameManager {
    constructor() {
        if (GameManager.instance) {
            return GameManager.instance;
        }
        this.listeners = [];
        
        this.state = {
            character: new Character(),
            inventory: [], // Array of stacked items: { item: Item, quantity: number }
            inventoryCapacity: 10,
            warehouse: [], // Array of stacked items (Unlimited capacity)
            flags: {
                secretShopUnlocked: false
            }
        };

        // Initialize with some items
        this.initInitialItems();

        GameManager.instance = this;
    }

    initInitialItems() {
        // Add initial items (using new stack system)
        const oldSword = new Weapon('old_sword', '舊劍', ItemRarity.COMMON, '🗡️', '一把生鏽的舊劍。', 30, 5, 0, 0.08, 1.5, 1.0, 1.0);
        const leatherArmor = new Armor('leather_armor', '皮甲', ItemRarity.COMMON, '🛡️', '普通的皮製護甲。', 50, 0, 8, 0.03, 1.2);
        
        // 直接裝備初始裝備
        this.state.character.equip(oldSword);
        this.state.character.equip(leatherArmor);
        
        this.addToInventory(new Consumable('health_potion_s', '小型生命藥水', ItemType.POTION, ItemRarity.COMMON, '🧪', '恢復少量生命值。', 20, { hp: 30 }), 3);
        
        const coin = new Item('ancient_coin', '古代錢幣', ItemType.KEY, ItemRarity.LEGENDARY, '🪙', '一枚古老的錢幣，似乎隱藏著秘密。', 500);
        coin.isSecretKey = true;
        this.addToInventory(coin);
        
        // Add some items to warehouse for testing
        this.addToWarehouse(new Consumable('mana_potion', '魔力藥水', ItemType.POTION, ItemRarity.UNCOMMON, '💙', '恢復魔力值。', 40, { mp: 50 }), 2);
        this.addToWarehouse(new Item('iron_ore', '鐵礦石', ItemType.MATERIAL, ItemRarity.COMMON, '⛏️', '用於鍛造的鐵礦石。', 10), 5);
        
        // === 測試材料：用於鍛造和套裝測試 ===
        this.addTestMaterials();
        
        // Debug: Log initial state
        console.log('GameManager initialized with state:', this.state);
    }
    
    /**
     * 添加測試材料 - 用於鍛造、詞綴和套裝測試
     */
    addTestMaterials() {
        // 基礎材料
        this.addToWarehouse(new Item('slime_jelly', '史萊姆凝膠', ItemType.MATERIAL, ItemRarity.COMMON, '🟢', '史萊姆的身體凝膠。', 5), 20);
        this.addToWarehouse(new Item('beast_hide', '獸皮', ItemType.MATERIAL, ItemRarity.COMMON, '🟤', '野獸的皮毛。', 8), 15);
        this.addToWarehouse(new Item('iron_ore', '鐵礦石', ItemType.MATERIAL, ItemRarity.COMMON, '⛏️', '基礎鍛造材料。', 15), 30);
        this.addToWarehouse(new Item('bone_fragment', '骨頭碎片', ItemType.MATERIAL, ItemRarity.COMMON, '🦴', '骷髏的骨頭碎片。', 12), 20);
        
        // 優秀材料
        this.addToWarehouse(new Item('wolf_pelt', '狼皮', ItemType.MATERIAL, ItemRarity.UNCOMMON, '🐺', '品質優良的狼皮。', 25), 10);
        this.addToWarehouse(new Item('spider_silk', '蜘蛛絲', ItemType.MATERIAL, ItemRarity.UNCOMMON, '🕸️', '堅韌的蜘蛛絲。', 18), 12);
        this.addToWarehouse(new Item('ancient_gear', '古代齒輪', ItemType.MATERIAL, ItemRarity.UNCOMMON, '⚙️', '古代機械的零件。', 60), 8);
        
        // 稀有材料
        this.addToWarehouse(new Item('forest_essence', '森林精華', ItemType.MATERIAL, ItemRarity.RARE, '✨', '森林的純淨精華。', 200), 5);
        this.addToWarehouse(new Item('dark_crystal', '暗黑水晶', ItemType.MATERIAL, ItemRarity.RARE, '🔮', '充滿黑暗能量的水晶。', 150), 5);
        this.addToWarehouse(new Item('mithril_ore', '秘銀礦', ItemType.MATERIAL, ItemRarity.RARE, '🔘', '珍貴的秘銀礦石。', 200), 5);
        this.addToWarehouse(new Item('dragon_tooth', '龍牙', ItemType.MATERIAL, ItemRarity.RARE, '🦷', '龍的牙齒。', 250), 3);
        
        // 史詩材料
        this.addToWarehouse(new Item('lich_phylactery', '巫妖命匣', ItemType.MATERIAL, ItemRarity.EPIC, '💀', '巫妖靈魂的容器。', 500), 2);
        this.addToWarehouse(new Item('ancient_rune', '古代符文', ItemType.MATERIAL, ItemRarity.EPIC, '📜', '記載古代力量的符文。', 350), 3);
        this.addToWarehouse(new Item('commander_blade', '指揮官之劍', ItemType.MATERIAL, ItemRarity.EPIC, '⚔️', '暗影指揮官的配劍碎片。', 600), 2);
        
        // 傳說材料
        this.addToWarehouse(new Item('titan_heart', '泰坦之心', ItemType.MATERIAL, ItemRarity.LEGENDARY, '❤️', '泰坦的心臟，蘊含遠古之力。', 1000), 1);
        this.addToWarehouse(new Item('dragon_heart', '龍心', ItemType.MATERIAL, ItemRarity.LEGENDARY, '💜', '龍的心臟，蘊含龍之力。', 1500), 1);
        this.addToWarehouse(new Item('legendary_shard', '傳說碎片', ItemType.MATERIAL, ItemRarity.LEGENDARY, '✨', '可用於製作任何傳說裝備。', 1500), 2);
        
        // 元素材料
        this.addToWarehouse(new Item('fire_essence', '火焰精華', ItemType.MATERIAL, ItemRarity.UNCOMMON, '🔥', '純粹的火焰能量。', 80), 8);
        this.addToWarehouse(new Item('ice_essence', '冰霜精華', ItemType.MATERIAL, ItemRarity.UNCOMMON, '❄️', '純粹的冰霜能量。', 80), 8);
        this.addToWarehouse(new Item('thunder_essence', '雷電精華', ItemType.MATERIAL, ItemRarity.UNCOMMON, '⚡', '純粹的雷電能量。', 80), 8);
        
        // 測試用金幣
        this.state.character.gold = 50000;
        
        // 測試用 BOSS 裝備（套裝測試）
        this.addBossEquipmentForTesting();
        
        console.log('Test materials added for forging and set bonus testing.');
    }
    
    /**
     * 添加帶詞綴的測試裝備 - 每種詞綴各一個
     */
    addBossEquipmentForTesting() {
        // ========== 普通詞綴測試裝備 ==========
        const commonSword = new Weapon(
            'common_affix_sword', '普通測試劍', ItemRarity.COMMON, '🗡️',
            '帶有普通詞綴的測試劍。', 50, 8, 0, 0.05, 1.5, 1.0, 1.0
        );
        commonSword.durability = 50;
        commonSword.maxDurability = 50;
        // 手動添加普通詞綴：鋒利的（+atk）
        commonSword.affixes = [{
            id: 'sharp', name: '鋒利的', type: 'prefix', rarity: 'common',
            stats: { atk: 4 }
        }];
        commonSword.affixBonuses = { atk: 4, def: 0, hp: 0, mp: 0, critChance: 0, critDamage: 0, attackSpeed: 0, lifesteal: 0, damageReduction: 0 };
        commonSword.name = '鋒利的普通測試劍';
        this.addToWarehouse(commonSword);
        
        // ========== 優秀詞綴測試裝備 ==========
        const uncommonSword = new Weapon(
            'uncommon_affix_sword', '優秀測試劍', ItemRarity.UNCOMMON, '⚔️',
            '帶有優秀詞綴的測試劍。', 150, 12, 0, 0.08, 1.6, 1.0, 1.1
        );
        uncommonSword.durability = 50;
        uncommonSword.maxDurability = 50;
        // 手動添加優秀詞綴：銳利的（+atk +暴擊率）、之烈焰（+火傷 +暴擊率）
        uncommonSword.affixes = [
            { id: 'keen', name: '銳利的', type: 'prefix', rarity: 'uncommon', stats: { atk: 8, critChance: 0.03 } },
            { id: 'of_fire', name: '之烈焰', type: 'suffix', rarity: 'uncommon', stats: { atk: 6, critChance: 0.07 } }
        ];
        uncommonSword.affixBonuses = { atk: 14, def: 0, hp: 0, mp: 0, critChance: 0.10, critDamage: 0, attackSpeed: 0, lifesteal: 0, damageReduction: 0 };
        uncommonSword.name = '銳利的優秀測試劍之烈焰';
        this.addToWarehouse(uncommonSword);
        
        // ========== 稀有詞綴測試裝備 ==========
        const rareSword = new Weapon(
            'rare_affix_sword', '稀有測試劍', ItemRarity.RARE, '⚔️',
            '帶有稀有詞綴的測試劍。', 400, 18, 0, 0.10, 1.8, 1.1, 1.2
        );
        rareSword.durability = 50;
        rareSword.maxDurability = 50;
        // 手動添加稀有詞綴：兇猛的（+atk +暴擊傷害）、之狂怒（+暴擊率 +攻速）
        rareSword.affixes = [
            { id: 'vicious', name: '兇猛的', type: 'prefix', rarity: 'rare', stats: { atk: 15, critDamage: 0.15 } },
            { id: 'of_fury', name: '之狂怒', type: 'suffix', rarity: 'rare', stats: { critChance: 0.07, attackSpeed: 0.08 } }
        ];
        rareSword.affixBonuses = { atk: 15, def: 0, hp: 0, mp: 0, critChance: 0.07, critDamage: 0.15, attackSpeed: 0.08, lifesteal: 0, damageReduction: 0 };
        rareSword.name = '兇猛的稀有測試劍之狂怒';
        this.addToWarehouse(rareSword);
        
        // 稀有防具：嗜血的（+吸血）
        const rareArmor = new Armor(
            'rare_affix_armor', '稀有測試甲', ItemRarity.RARE, '🛡️',
            '帶有稀有詞綴的測試甲。', 350, 5, 20, 0.06, 1.4
        );
        rareArmor.durability = 50;
        rareArmor.maxDurability = 50;
        rareArmor.affixes = [
            { id: 'guardian', name: '守護的', type: 'prefix', rarity: 'rare', stats: { def: 14, hp: 40 } },
            { id: 'of_the_titan', name: '之泰坦', type: 'suffix', rarity: 'rare', stats: { hp: 55, def: 12 } }
        ];
        rareArmor.affixBonuses = { atk: 0, def: 26, hp: 95, mp: 0, critChance: 0, critDamage: 0, attackSpeed: 0, lifesteal: 0, damageReduction: 0 };
        rareArmor.name = '守護的稀有測試甲之泰坦';
        this.addToWarehouse(rareArmor);
        
        // ========== 史詩詞綴測試裝備 ==========
        const epicSword = new Weapon(
            'epic_affix_sword', '史詩測試劍', ItemRarity.EPIC, '⚔️',
            '帶有史詩詞綴的測試劍。', 1000, 28, 0, 0.12, 2.0, 1.15, 1.25
        );
        epicSword.durability = 50;
        epicSword.maxDurability = 50;
        // 手動添加史詩詞綴：殘暴的（+atk +暴擊率 +暴擊傷害）、之毀滅（+暴擊傷害 +atk）
        epicSword.affixes = [
            { id: 'brutal', name: '殘暴的', type: 'prefix', rarity: 'epic', stats: { atk: 25, critChance: 0.08, critDamage: 0.20 } },
            { id: 'of_annihilation', name: '之毀滅', type: 'suffix', rarity: 'epic', stats: { critDamage: 0.28, atk: 15 } }
        ];
        epicSword.affixBonuses = { atk: 40, def: 0, hp: 0, mp: 0, critChance: 0.08, critDamage: 0.48, attackSpeed: 0, lifesteal: 0, damageReduction: 0 };
        epicSword.name = '殘暴的史詩測試劍之毀滅';
        this.addToWarehouse(epicSword);
        
        // 史詩防具：堅不可摧的 + 之巨龍
        const epicArmor = new Armor(
            'epic_affix_armor', '史詩測試甲', ItemRarity.EPIC, '🛡️',
            '帶有史詩詞綴的測試甲。', 900, 10, 30, 0.08, 1.5
        );
        epicArmor.durability = 50;
        epicArmor.maxDurability = 50;
        epicArmor.affixes = [
            { id: 'impenetrable', name: '堅不可摧的', type: 'prefix', rarity: 'epic', stats: { def: 28, hp: 80, damageReduction: 0.05 } },
            { id: 'of_the_dragon', name: '之巨龍', type: 'suffix', rarity: 'epic', stats: { atk: 15, hp: 65, def: 14 } }
        ];
        epicArmor.affixBonuses = { atk: 15, def: 42, hp: 145, mp: 0, critChance: 0, critDamage: 0, attackSpeed: 0, lifesteal: 0, damageReduction: 0.05 };
        epicArmor.name = '堅不可摧的史詩測試甲之巨龍';
        this.addToWarehouse(epicArmor);
        
        // ========== 傳說詞綴測試裝備 ==========
        const legendarySword = new Weapon(
            'legendary_affix_sword', '傳說測試劍', ItemRarity.LEGENDARY, '⚔️',
            '帶有傳說詞綴的測試劍。', 3000, 40, 0, 0.15, 2.2, 1.2, 1.3
        );
        legendarySword.durability = 50;
        legendarySword.maxDurability = 50;
        // 手動添加傳說詞綴：弒神的 + 之虛空
        legendarySword.affixes = [
            { id: 'godslayer', name: '弒神的', type: 'prefix', rarity: 'legendary', stats: { atk: 42, critChance: 0.12, critDamage: 0.35, bossBonus: 0.15 } },
            { id: 'of_the_void', name: '之虛空', type: 'suffix', rarity: 'legendary', stats: { atk: 22, armorPenetration: 0.14, critChance: 0.10 } }
        ];
        legendarySword.affixBonuses = { atk: 64, def: 0, hp: 0, mp: 0, critChance: 0.22, critDamage: 0.35, attackSpeed: 0, lifesteal: 0, damageReduction: 0, armorPenetration: 0.14, bossBonus: 0.15 };
        legendarySword.name = '弒神的傳說測試劍之虛空';
        this.addToWarehouse(legendarySword);
        
        // 傳說防具：不朽的 + 之永恆
        const legendaryArmor = new Armor(
            'legendary_affix_armor', '傳說測試甲', ItemRarity.LEGENDARY, '🛡️',
            '帶有傳說詞綴的測試甲。', 2800, 15, 45, 0.10, 1.6
        );
        legendaryArmor.durability = 50;
        legendaryArmor.maxDurability = 50;
        legendaryArmor.affixes = [
            { id: 'immortal', name: '不朽的', type: 'prefix', rarity: 'legendary', stats: { def: 45, hp: 125, hpRegen: 0.03, damageReduction: 0.08 } },
            { id: 'of_eternity', name: '之永恆', type: 'suffix', rarity: 'legendary', stats: { hp: 100, def: 32, hpRegen: 0.04, damageReduction: 0.06 } }
        ];
        legendaryArmor.affixBonuses = { atk: 0, def: 77, hp: 225, mp: 0, critChance: 0, critDamage: 0, attackSpeed: 0, lifesteal: 0, damageReduction: 0.14, hpRegen: 0.07 };
        legendaryArmor.name = '不朽的傳說測試甲之永恆';
        this.addToWarehouse(legendaryArmor);
        
        // ========== 特殊詞綴測試：完美無瑕（不損耐久）==========
        const perfectSword = new Weapon(
            'perfect_sword', '完美之劍', ItemRarity.LEGENDARY, '✨',
            '帶有完美無瑕詞綴的武器，不會損耗耐久度。', 5000, 35, 0, 0.12, 2.0, 1.1, 1.2
        );
        perfectSword.durability = 50;
        perfectSword.maxDurability = 50;
        perfectSword.affixes = [
            { id: 'primordial', name: '原始的', type: 'prefix', rarity: 'legendary', stats: { atk: 28, def: 28, hp: 65, allStats: 0.08 } },
            { id: 'indestructible', name: '之不朽', type: 'suffix', rarity: 'legendary', stats: { def: 15, hp: 40, noDurabilityLoss: 1 } }
        ];
        perfectSword.affixBonuses = { atk: 28, def: 43, hp: 105, mp: 0, critChance: 0, critDamage: 0, attackSpeed: 0, lifesteal: 0, damageReduction: 0, allStats: 0.08, noDurabilityLoss: 1 };
        perfectSword.name = '原始的完美之劍之不朽';
        this.addToWarehouse(perfectSword);
        
        // ========== 吸血測試裝備 ==========
        const vampiricSword = new Weapon(
            'vampiric_sword', '嗜血之劍', ItemRarity.RARE, '🩸',
            '帶有生命偷取詞綴的武器。', 600, 20, 0, 0.10, 1.8, 1.0, 1.1
        );
        vampiricSword.durability = 50;
        vampiricSword.maxDurability = 50;
        vampiricSword.affixes = [
            { id: 'vampiric', name: '嗜血的', type: 'prefix', rarity: 'rare', stats: { lifesteal: 0.05 } },
            { id: 'sanguine', name: '鮮血的', type: 'prefix', rarity: 'epic', stats: { lifesteal: 0.08, atk: 12 } }
        ];
        vampiricSword.affixBonuses = { atk: 12, def: 0, hp: 0, mp: 0, critChance: 0, critDamage: 0, attackSpeed: 0, lifesteal: 0.13, damageReduction: 0 };
        vampiricSword.name = '嗜血的鮮血之劍';
        this.addToWarehouse(vampiricSword);
        
        console.log('測試裝備已添加：每種詞綴稀有度各一個');
    }

    static getInstance() {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }
    
    // ===== Helper Methods =====
    
    isStackable(item) {
        const stackableTypes = [ItemType.POTION, ItemType.SCROLL, ItemType.MATERIAL];
        return stackableTypes.includes(item.type);
    }
    
    isHighRarity(item) {
        return [ItemRarity.RARE, ItemRarity.EPIC, ItemRarity.LEGENDARY].includes(item.rarity);
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    unsubscribe(callback) {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }

    notify(eventType) {
        this.listeners.forEach(listener => listener(this.state, eventType));
    }

    // ===== State Modifiers =====

    getGold() {
        return this.state.character.gold;
    }

    addGold(amount) {
        this.state.character.gold += amount;
        this.notify('gold');
    }

    removeGold(amount) {
        if (this.state.character.gold >= amount) {
            this.state.character.gold -= amount;
            this.notify('gold');
            return true;
        }
        return false;
    }

    getInventory() {
        return this.state.inventory;
    }

    addToInventory(itemData, quantity = 1) {
        // Check inventory capacity
        if (this.state.inventory.length >= this.state.inventoryCapacity) {
            console.warn('Inventory is full!');
            return false;
        }
        
        let item;
        // Check if it's already an instance of Item
        if (itemData instanceof Item) {
            item = itemData;
        } else {
            // Convert plain object to Item instance
            if (itemData.type === ItemType.WEAPON) {
                // 武器：包含所有屬性
                item = new Weapon(
                    itemData.id, itemData.name, itemData.rarity, itemData.icon, 
                    itemData.desc || itemData.description, itemData.price, 
                    itemData.attack || itemData.atk || 0, 
                    itemData.defense || itemData.def || 0,
                    itemData.critChance || 0.08, 
                    itemData.critDamage || 1.5, 
                    itemData.weaponSpeed || 1.0, 
                    itemData.attackSpeed || 1.0
                );
                // 保留圖片路徑
                if (itemData.image) item.image = itemData.image;
            } else if (itemData.type === ItemType.ARMOR) {
                // 防具：無 weaponSpeed 和 attackSpeed
                item = new Armor(
                    itemData.id, itemData.name, itemData.rarity, itemData.icon, 
                    itemData.desc || itemData.description, itemData.price, 
                    itemData.attack || itemData.atk || 0, 
                    itemData.defense || itemData.def || 0,
                    itemData.critChance || 0.03, 
                    itemData.critDamage || 1.2
                );
                if (itemData.image) item.image = itemData.image;
            } else if (itemData.type === ItemType.ACCESSORY) {
                // 飾品：無 weaponSpeed 和 attackSpeed
                item = new Accessory(
                    itemData.id, itemData.name, itemData.rarity, itemData.icon, 
                    itemData.desc || itemData.description, itemData.price, 
                    itemData.attack || itemData.atk || 0, 
                    itemData.defense || itemData.def || 0,
                    itemData.critChance || 0.05, 
                    itemData.critDamage || 1.3
                );
                if (itemData.image) item.image = itemData.image;
            } else if (itemData.type === ItemType.POTION) {
                item = new Consumable(
                    itemData.id, itemData.name, itemData.type, itemData.rarity, itemData.icon, 
                    itemData.desc || itemData.description, itemData.price, 
                    { hp: itemData.hp, mp: itemData.mp, exp: itemData.exp }
                );
            } else {
                item = new Item(
                    itemData.id, itemData.name, itemData.type, itemData.rarity, itemData.icon, 
                    itemData.desc || itemData.description, itemData.price
                );
            }
            
            // Preserve special flags
            if (itemData.isSecretKey) item.isSecretKey = true;
        }

        // Ensure unique instance ID
        if (!item.instanceId) {
             item.instanceId = Date.now() + Math.random().toString(36).substr(2, 9);
        }

        // Check if stackable
        if (this.isStackable(item)) {
            // Try to find existing stack
            const existingStack = this.state.inventory.find(stack => 
                stack.item.id === item.id && stack.item.rarity === item.rarity
            );
            
            if (existingStack) {
                existingStack.quantity += quantity;
                this.notify('inventory');
                return true;
            }
        }
        
        // Add as new stack (or non-stackable item)
        this.state.inventory.push({
            item: item,
            quantity: this.isStackable(item) ? quantity : 1,
            instanceId: item.instanceId
        });
        
        this.notify('inventory');
        return true;
    }

    addToWarehouse(itemData, quantity = 1) {
        let item;
        if (itemData instanceof Item) {
            item = itemData;
        } else {
            // Convert plain object to Item instance (same logic as inventory)
            if (itemData.type === ItemType.WEAPON) {
                item = new Weapon(
                    itemData.id, itemData.name, itemData.rarity, itemData.icon, 
                    itemData.desc || itemData.description, itemData.price, 
                    itemData.attack || itemData.atk || 0, 
                    itemData.defense || itemData.def || 0,
                    itemData.critChance || 0.08, 
                    itemData.critDamage || 1.5, 
                    itemData.weaponSpeed || 1.0, 
                    itemData.attackSpeed || 1.0
                );
                if (itemData.image) item.image = itemData.image;
            } else if (itemData.type === ItemType.ARMOR) {
                item = new Armor(
                    itemData.id, itemData.name, itemData.rarity, itemData.icon, 
                    itemData.desc || itemData.description, itemData.price, 
                    itemData.attack || itemData.atk || 0, 
                    itemData.defense || itemData.def || 0,
                    itemData.critChance || 0.03, 
                    itemData.critDamage || 1.2
                );
                if (itemData.image) item.image = itemData.image;
            } else if (itemData.type === ItemType.ACCESSORY) {
                item = new Accessory(
                    itemData.id, itemData.name, itemData.rarity, itemData.icon, 
                    itemData.desc || itemData.description, itemData.price, 
                    itemData.attack || itemData.atk || 0, 
                    itemData.defense || itemData.def || 0,
                    itemData.critChance || 0.05, 
                    itemData.critDamage || 1.3
                );
                if (itemData.image) item.image = itemData.image;
            } else if (itemData.type === ItemType.POTION) {
                item = new Consumable(
                    itemData.id, itemData.name, itemData.type, itemData.rarity, itemData.icon, 
                    itemData.desc || itemData.description, itemData.price, 
                    { hp: itemData.hp, mp: itemData.mp, exp: itemData.exp }
                );
            } else {
                item = new Item(
                    itemData.id, itemData.name, itemData.type, itemData.rarity, itemData.icon, 
                    itemData.desc || itemData.description, itemData.price
                );
            }
            if (itemData.isSecretKey) item.isSecretKey = true;
        }
        
        if (!item.instanceId) {
             item.instanceId = Date.now() + Math.random().toString(36).substr(2, 9);
        }
        
        // Check if stackable and merge with existing
        if (this.isStackable(item)) {
            const existingStack = this.state.warehouse.find(stack => 
                stack.item.id === item.id && stack.item.rarity === item.rarity
            );
            
            if (existingStack) {
                existingStack.quantity += quantity;
                this.notify('warehouse');
                return true;
            }
        }
        
        // Add as new stack
        this.state.warehouse.push({
            item: item,
            quantity: this.isStackable(item) ? quantity : 1,
            instanceId: item.instanceId
        });
        
        this.notify('warehouse');
        return true;
    }
    
    removeFromInventory(itemId) {
        const index = this.state.inventory.findIndex(stack => stack.item.id === itemId);
        if (index > -1) {
            const removedStack = this.state.inventory.splice(index, 1)[0];
            this.notify('inventory');
            return removedStack.item;
        }
        return null;
    }
    
    removeItemByInstanceId(instanceId, fromWarehouse = false) {
        const source = fromWarehouse ? this.state.warehouse : this.state.inventory;
        const index = source.findIndex(stack => stack.instanceId === instanceId);
        
        if (index > -1) {
            const removedStack = source.splice(index, 1)[0];
            this.notify(fromWarehouse ? 'warehouse' : 'inventory');
            return removedStack.item;
        }
        return null;
    }
    
    // Use consumable (decrements quantity)
    useConsumable(instanceId, fromWarehouse = false) {
        const source = fromWarehouse ? this.state.warehouse : this.state.inventory;
        const stack = source.find(s => s.instanceId === instanceId);
        
        if (!stack || !stack.item.effect) {
            return false;
        }
        
        // Apply effect (no HP/MP check required)
        const char = this.state.character;
        if (stack.item.effect.hp) {
            char.hp = Math.min(char.maxHp, char.hp + stack.item.effect.hp);
        }
        if (stack.item.effect.mp) {
            char.mp = Math.min(char.maxMp, char.mp + stack.item.effect.mp);
        }
        if (stack.item.effect.exp) {
            char.exp += stack.item.effect.exp;
            char.checkLevelUp();
        }
        
        // Decrement quantity
        stack.quantity -= 1;
        
        // Remove if empty
        if (stack.quantity <= 0) {
            const index = source.findIndex(s => s.instanceId === instanceId);
            source.splice(index, 1);
        }
        
        this.notify('all');
        return true;
    }

    setFlag(flag, value) {
        this.state.flags[flag] = value;
        this.notify('flags');
    }

    getFlag(flag) {
        return this.state.flags[flag];
    }
    
    // ===== Item Transfer Methods =====
    
    moveToWarehouse(instanceId) {
        const index = this.state.inventory.findIndex(stack => stack.instanceId === instanceId);
        if (index === -1) return false;
        
        const stack = this.state.inventory[index];
        
        // Remove from inventory
        this.state.inventory.splice(index, 1);
        
        // Add to warehouse (will merge if stackable)
        if (this.isStackable(stack.item)) {
            const existingStack = this.state.warehouse.find(s => 
                s.item.id === stack.item.id && s.item.rarity === stack.item.rarity
            );
            
            if (existingStack) {
                existingStack.quantity += stack.quantity;
            } else {
                this.state.warehouse.push(stack);
            }
        } else {
            this.state.warehouse.push(stack);
        }
        
        this.notify('all');
        return true;
    }
    
    moveToInventory(instanceId) {
        const index = this.state.warehouse.findIndex(stack => stack.instanceId === instanceId);
        if (index === -1) return false;
        
        // Check capacity
        if (this.state.inventory.length >= this.state.inventoryCapacity) {
            console.warn('Inventory is full!');
            return false;
        }
        
        const stack = this.state.warehouse[index];
        
        // Remove from warehouse
        this.state.warehouse.splice(index, 1);
        
        // Add to inventory (will merge if stackable)
        if (this.isStackable(stack.item)) {
            const existingStack = this.state.inventory.find(s => 
                s.item.id === stack.item.id && s.item.rarity === stack.item.rarity
            );
            
            if (existingStack) {
                existingStack.quantity += stack.quantity;
            } else {
                this.state.inventory.push(stack);
            }
        } else {
            this.state.inventory.push(stack);
        }
        
        this.notify('all');
        return true;
    }
    
    sellItem(instanceId, fromWarehouse = false) {
        const source = fromWarehouse ? this.state.warehouse : this.state.inventory;
        const index = source.findIndex(stack => stack.instanceId === instanceId);
        
        if (index === -1) return false;
        
        const stack = source[index];
        const sellPrice = Math.floor(stack.item.price * 0.5) * stack.quantity;
        
        // Remove item
        source.splice(index, 1);
        
        // Add gold
        this.state.character.gold += sellPrice;
        
        this.notify('all');
        return sellPrice;
    }
    
    /**
     * 添加物品到背包（通用方法，用於鍛造等系統）
     */
    addItem(itemData, quantity = 1) {
        return this.addToInventory(itemData, quantity);
    }
    
    /**
     * 移除指定數量的材料（從背包和倉庫中）
     * @param {string} materialId - 材料ID
     * @param {number} quantity - 數量
     * @returns {boolean} 是否成功移除
     */
    removeMaterial(materialId, quantity) {
        let remaining = quantity;
        
        // 先從背包移除
        for (let i = this.state.inventory.length - 1; i >= 0 && remaining > 0; i--) {
            const stack = this.state.inventory[i];
            if (stack.item.id === materialId) {
                if (stack.quantity <= remaining) {
                    remaining -= stack.quantity;
                    this.state.inventory.splice(i, 1);
                } else {
                    stack.quantity -= remaining;
                    remaining = 0;
                }
            }
        }
        
        // 如果背包不夠，從倉庫移除
        for (let i = this.state.warehouse.length - 1; i >= 0 && remaining > 0; i--) {
            const stack = this.state.warehouse[i];
            if (stack.item.id === materialId) {
                if (stack.quantity <= remaining) {
                    remaining -= stack.quantity;
                    this.state.warehouse.splice(i, 1);
                } else {
                    stack.quantity -= remaining;
                    remaining = 0;
                }
            }
        }
        
        if (remaining === 0) {
            this.notify('all');
            return true;
        }
        
        return false;
    }
    
    discardItem(instanceId, fromWarehouse = false) {
        const source = fromWarehouse ? this.state.warehouse : this.state.inventory;
        const stack = source.find(s => s.instanceId === instanceId);
        
        if (!stack) return false;
        
        // Check rarity for confirmation
        if (this.isHighRarity(stack.item)) {
            // Return false to trigger UI confirmation
            return 'confirm';
        }
        
        // Remove item
        const index = source.findIndex(s => s.instanceId === instanceId);
        source.splice(index, 1);
        
        this.notify(fromWarehouse ? 'warehouse' : 'inventory');
        return true;
    }
    
    equipItem(instanceId, fromWarehouse = false) {
        const source = fromWarehouse ? this.state.warehouse : this.state.inventory;
        const stack = source.find(s => s.instanceId === instanceId);
        
        if (!stack || !stack.item.isEquipment()) return false;
        
        const item = stack.item;
        const slotType = item.type;
        const oldItem = this.state.character.equipment[slotType];
        
        // Remove from source
        const index = source.findIndex(s => s.instanceId === instanceId);
        source.splice(index, 1);
        
        // Equip new item
        this.state.character.equip(item);
        
        // Return old item to source
        if (oldItem) {
            source.push({
                item: oldItem,
                quantity: 1,
                instanceId: oldItem.instanceId
            });
        }
        
        this.notify('all');
        return true;
    }
    
    /**
     * 卸下裝備並放入背包或倉庫
     * @param {string} slotType - 裝備槽位類型 (weapon, armor, accessory)
     * @param {boolean} toWarehouse - 是否放入倉庫（預設放入背包）
     * @returns {boolean} 是否成功卸下
     */
    unequipItem(slotType, toWarehouse = false) {
        const item = this.state.character.equipment[slotType];
        if (!item) return false;
        
        const target = toWarehouse ? this.state.warehouse : this.state.inventory;
        
        // 檢查背包容量（倉庫無限）
        if (!toWarehouse && this.state.inventory.length >= this.state.inventoryCapacity) {
            console.warn('背包已滿，無法卸下裝備');
            return false;
        }
        
        // 卸下裝備
        this.state.character.equipment[slotType] = null;
        
        // 放入目標位置
        target.push({
            item: item,
            quantity: 1,
            instanceId: item.instanceId || `unequipped_${Date.now()}`
        });
        
        this.notify('all');
        return true;
    }
    
    // ===== 耐久度系統 =====
    
    /**
     * 檢查裝備是否有「完美無瑕」詞綴（不會損失耐久度）
     */
    hasNoDurabilityLossAffix(equipment) {
        if (!equipment) return false;
        
        // 檢查 affixBonuses
        if (equipment.affixBonuses && equipment.affixBonuses.noDurabilityLoss) {
            return true;
        }
        
        // 檢查 affixes 數組
        if (equipment.affixes) {
            return equipment.affixes.some(affix => 
                affix.stats && (affix.stats.noDurabilityLoss === 1 || affix.stats.noDurabilityLoss === true || affix.stats.noDurabilityLoss >= 1)
            );
        }
        
        return false;
    }
    
    /**
     * 減少武器耐久度（攻擊時調用）
     * @returns {Object|null} 如果裝備損壞返回裝備資訊，否則返回 null
     */
    reduceWeaponDurability() {
        const weapon = this.state.character.equipment.weapon;
        if (!weapon) return null;
        
        // 檢查是否有「完美無瑕」詞綴
        if (this.hasNoDurabilityLossAffix(weapon)) {
            return null;
        }
        
        // 如果沒有耐久度屬性，初始化
        if (weapon.durability === undefined) {
            weapon.durability = 50;
            weapon.maxDurability = 50;
        }
        
        weapon.durability = Math.max(0, weapon.durability - 1);
        
        // 耐久度歸零，裝備消失
        if (weapon.durability <= 0) {
            const destroyedWeapon = { ...weapon };
            this.state.character.equipment.weapon = null;
            this.notify('equipment');
            return destroyedWeapon;
        }
        
        return null;
    }
    
    /**
     * 減少防具耐久度（被攻擊時調用）
     * @returns {Object|null} 如果裝備損壞返回裝備資訊，否則返回 null
     */
    reduceArmorDurability() {
        const armor = this.state.character.equipment.armor;
        if (!armor) return null;
        
        // 檢查是否有「完美無瑕」詞綴
        if (this.hasNoDurabilityLossAffix(armor)) {
            return null;
        }
        
        // 如果沒有耐久度屬性，初始化
        if (armor.durability === undefined) {
            armor.durability = 50;
            armor.maxDurability = 50;
        }
        
        armor.durability = Math.max(0, armor.durability - 1);
        
        // 耐久度歸零，裝備消失
        if (armor.durability <= 0) {
            const destroyedArmor = { ...armor };
            this.state.character.equipment.armor = null;
            this.notify('equipment');
            return destroyedArmor;
        }
        
        return null;
    }
    
    /**
     * 獲取裝備耐久度資訊
     */
    getEquipmentDurability(slotType) {
        const equipment = this.state.character.equipment[slotType];
        if (!equipment) return null;
        
        return {
            current: equipment.durability ?? 50,
            max: equipment.maxDurability ?? 50
        };
    }
    
    // Character methods
    getCharacter() {
        return this.state.character;
    }
}

export default GameManager.getInstance();
