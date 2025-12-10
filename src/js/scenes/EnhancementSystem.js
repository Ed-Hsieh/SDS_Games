/**
 * EnhancementSystem.js
 * 裝備強化系統 - 強化、寶石鑲嵌、套裝效果
 */
import GameManager from '../managers/GameManager.js';
import { ItemRarity } from '../models/DataModel.js';

// 強化等級上限
const MAX_ENHANCEMENT_LEVEL = 10;

// 強化成功率表 (等級 -> 成功率)
const ENHANCEMENT_SUCCESS_RATES = {
    0: 1.00,  // +0 -> +1: 100%
    1: 0.90,  // +1 -> +2: 90%
    2: 0.80,  // +2 -> +3: 80%
    3: 0.70,  // +3 -> +4: 70%
    4: 0.60,  // +4 -> +5: 60%
    5: 0.50,  // +5 -> +6: 50%
    6: 0.40,  // +6 -> +7: 40%
    7: 0.30,  // +7 -> +8: 30%
    8: 0.20,  // +8 -> +9: 20%
    9: 0.10   // +9 -> +10: 10%
};

// 強化費用表
const ENHANCEMENT_COSTS = {
    0: 50,
    1: 80,
    2: 120,
    3: 180,
    4: 250,
    5: 350,
    6: 500,
    7: 700,
    8: 1000,
    9: 1500
};

// 寶石類型
export const GemType = {
    RUBY: 'ruby',           // 紅寶石 - 攻擊
    SAPPHIRE: 'sapphire',   // 藍寶石 - 防禦
    EMERALD: 'emerald',     // 綠寶石 - 生命
    TOPAZ: 'topaz',         // 黃寶石 - 暴擊
    AMETHYST: 'amethyst',   // 紫寶石 - 魔力
    DIAMOND: 'diamond'      // 鑽石 - 全屬性
};

// 寶石屬性加成
const GEM_BONUSES = {
    [GemType.RUBY]: { stat: 'atk', value: 5, icon: '🔴', name: '紅寶石' },
    [GemType.SAPPHIRE]: { stat: 'def', value: 5, icon: '🔵', name: '藍寶石' },
    [GemType.EMERALD]: { stat: 'hp', value: 30, icon: '🟢', name: '綠寶石' },
    [GemType.TOPAZ]: { stat: 'critChance', value: 0.05, icon: '🟡', name: '黃寶石' },
    [GemType.AMETHYST]: { stat: 'mp', value: 20, icon: '🟣', name: '紫寶石' },
    [GemType.DIAMOND]: { stat: 'all', value: 3, icon: '💎', name: '鑽石' }
};

// 套裝資料
export const SetBonuses = {
    'warrior_set': {
        name: '戰士套裝',
        pieces: ['warrior_sword', 'warrior_armor', 'warrior_ring'],
        bonuses: {
            2: { atk: 5, def: 3, description: '攻擊+5, 防禦+3' },
            3: { atk: 15, def: 8, hp: 50, description: '攻擊+15, 防禦+8, 生命+50' }
        }
    },
    'mage_set': {
        name: '法師套裝',
        pieces: ['mage_staff', 'mage_robe', 'mage_amulet'],
        bonuses: {
            2: { mp: 30, critDamage: 0.1, description: '魔力+30, 暴擊傷害+10%' },
            3: { mp: 60, critDamage: 0.25, atk: 10, description: '魔力+60, 暴擊傷害+25%, 攻擊+10' }
        }
    },
    'shadow_set': {
        name: '暗影套裝',
        pieces: ['shadow_blade', 'shadow_cloak', 'shadow_boots'],
        bonuses: {
            2: { critChance: 0.1, description: '暴擊率+10%' },
            3: { critChance: 0.2, critDamage: 0.3, description: '暴擊率+20%, 暴擊傷害+30%' }
        }
    }
};

export default class EnhancementSystem {
    constructor() {
        this.enhancementHistory = [];
    }

    /**
     * 強化裝備
     * @param {Object} equipment - 要強化的裝備
     * @param {boolean} useProtection - 是否使用保護符（失敗不降級）
     * @returns {Object} 強化結果
     */
    enhance(equipment, useProtection = false) {
        // 驗證裝備
        if (!equipment) {
            return { success: false, message: '無效的裝備' };
        }

        // 初始化強化等級
        if (equipment.enhanceLevel === undefined) {
            equipment.enhanceLevel = 0;
        }

        // 檢查是否達到上限
        if (equipment.enhanceLevel >= MAX_ENHANCEMENT_LEVEL) {
            return { success: false, message: '裝備已達到最高強化等級！' };
        }

        // 計算費用
        const cost = this.getEnhancementCost(equipment);
        if (GameManager.getGold() < cost) {
            return { success: false, message: `金幣不足！需要 ${cost}G` };
        }

        // 扣除費用
        GameManager.removeGold(cost);

        // 計算成功率
        const successRate = this.getSuccessRate(equipment);
        const roll = Math.random();
        const isSuccess = roll < successRate;

        if (isSuccess) {
            equipment.enhanceLevel++;
            this.applyEnhancementBonus(equipment);
            
            this.enhancementHistory.push({
                equipment: equipment.name,
                level: equipment.enhanceLevel,
                success: true,
                timestamp: Date.now()
            });

            return {
                success: true,
                newLevel: equipment.enhanceLevel,
                message: `強化成功！${equipment.name} +${equipment.enhanceLevel}`,
                isCritical: roll < successRate * 0.1 // 10% 機率大成功
            };
        } else {
            // 失敗處理
            let message = '強化失敗！';
            
            if (!useProtection && equipment.enhanceLevel > 0 && equipment.enhanceLevel >= 5) {
                // +5 以上失敗會降級
                equipment.enhanceLevel--;
                this.applyEnhancementBonus(equipment);
                message = `強化失敗！${equipment.name} 降級為 +${equipment.enhanceLevel}`;
            }

            this.enhancementHistory.push({
                equipment: equipment.name,
                level: equipment.enhanceLevel,
                success: false,
                timestamp: Date.now()
            });

            return {
                success: false,
                newLevel: equipment.enhanceLevel,
                message
            };
        }
    }

    /**
     * 獲取強化費用
     */
    getEnhancementCost(equipment) {
        const baseLevel = equipment.enhanceLevel || 0;
        const baseCost = ENHANCEMENT_COSTS[baseLevel] || 50;
        
        // 根據稀有度調整費用
        const rarityMultiplier = {
            [ItemRarity.COMMON]: 1,
            [ItemRarity.UNCOMMON]: 1.2,
            [ItemRarity.RARE]: 1.5,
            [ItemRarity.EPIC]: 2,
            [ItemRarity.LEGENDARY]: 3
        };
        
        return Math.floor(baseCost * (rarityMultiplier[equipment.rarity] || 1));
    }

    /**
     * 獲取成功率
     */
    getSuccessRate(equipment) {
        const level = equipment.enhanceLevel || 0;
        return ENHANCEMENT_SUCCESS_RATES[level] || 0.1;
    }

    /**
     * 應用強化加成到裝備
     */
    applyEnhancementBonus(equipment) {
        const level = equipment.enhanceLevel || 0;
        
        // 基礎屬性提升 (每級 +5%)
        const bonusMultiplier = 1 + (level * 0.05);
        
        // 存儲原始數值（如果還沒存）
        if (equipment._baseAtk === undefined && equipment.atk) {
            equipment._baseAtk = equipment.atk;
        }
        if (equipment._baseDef === undefined && equipment.def) {
            equipment._baseDef = equipment.def;
        }
        
        // 應用加成
        if (equipment._baseAtk) {
            equipment.atk = Math.floor(equipment._baseAtk * bonusMultiplier);
        }
        if (equipment._baseDef) {
            equipment.def = Math.floor(equipment._baseDef * bonusMultiplier);
        }
    }

    /**
     * 鑲嵌寶石
     * @param {Object} equipment - 裝備
     * @param {Object} gem - 寶石物品
     * @param {number} slotIndex - 槽位索引
     */
    socketGem(equipment, gem, slotIndex = 0) {
        if (!equipment || !gem) {
            return { success: false, message: '無效的裝備或寶石' };
        }

        // 初始化寶石槽
        if (!equipment.gemSlots) {
            equipment.gemSlots = this.getGemSlotCount(equipment);
        }
        if (!equipment.socketedGems) {
            equipment.socketedGems = [];
        }

        // 檢查槽位
        const maxSlots = equipment.gemSlots;
        if (slotIndex >= maxSlots) {
            return { success: false, message: '沒有可用的寶石槽位' };
        }

        // 檢查是否已有寶石
        if (equipment.socketedGems[slotIndex]) {
            return { success: false, message: '此槽位已鑲嵌寶石，請先拆除' };
        }

        // 鑲嵌寶石
        const gemInfo = GEM_BONUSES[gem.gemType] || gem.effect;
        if (!gemInfo) {
            return { success: false, message: '無效的寶石類型' };
        }

        equipment.socketedGems[slotIndex] = {
            type: gem.gemType || gem.id,
            ...gemInfo
        };

        // 從背包移除寶石
        GameManager.removeFromInventory(gem.id);

        return {
            success: true,
            message: `成功將 ${gemInfo.name || gem.name} 鑲嵌到 ${equipment.name}！`
        };
    }

    /**
     * 拆除寶石
     */
    unsocketGem(equipment, slotIndex) {
        if (!equipment?.socketedGems?.[slotIndex]) {
            return { success: false, message: '此槽位沒有寶石' };
        }

        const cost = 100; // 拆除費用
        if (GameManager.getGold() < cost) {
            return { success: false, message: `金幣不足！拆除需要 ${cost}G` };
        }

        GameManager.removeGold(cost);
        const gem = equipment.socketedGems[slotIndex];
        equipment.socketedGems[slotIndex] = null;

        // 返還寶石到背包（以物品形式）
        // 這裡簡化處理，實際應創建對應的寶石物品

        return {
            success: true,
            message: `成功拆除 ${gem.name}！`
        };
    }

    /**
     * 根據裝備稀有度獲取寶石槽數量
     */
    getGemSlotCount(equipment) {
        const slots = {
            [ItemRarity.COMMON]: 0,
            [ItemRarity.UNCOMMON]: 1,
            [ItemRarity.RARE]: 1,
            [ItemRarity.EPIC]: 2,
            [ItemRarity.LEGENDARY]: 3
        };
        return slots[equipment.rarity] || 0;
    }

    /**
     * 計算裝備的總寶石加成
     */
    getGemBonuses(equipment) {
        const bonuses = { atk: 0, def: 0, hp: 0, mp: 0, critChance: 0, critDamage: 0 };
        
        if (!equipment?.socketedGems) return bonuses;

        for (const gem of equipment.socketedGems) {
            if (!gem) continue;
            
            if (gem.stat === 'all') {
                bonuses.atk += gem.value;
                bonuses.def += gem.value;
            } else if (bonuses[gem.stat] !== undefined) {
                bonuses[gem.stat] += gem.value;
            }
        }

        return bonuses;
    }

    /**
     * 計算套裝效果
     * @param {Object} character - 角色
     * @returns {Object} 套裝加成
     */
    calculateSetBonuses(character) {
        const bonuses = { atk: 0, def: 0, hp: 0, mp: 0, critChance: 0, critDamage: 0 };
        const activeSetDescriptions = [];
        
        // 獲取已裝備的物品 ID（用來比對套裝 pieces 中的裝備 id）
        const equippedItemIds = [];
        if (character.equipment) {
            for (const slot in character.equipment) {
                const item = character.equipment[slot];
                if (item?.id) {
                    equippedItemIds.push(item.id);
                }
            }
        }

        // 檢查每個套裝
        for (const setId in SetBonuses) {
            const setInfo = SetBonuses[setId];
            const equippedPieces = setInfo.pieces.filter(pieceId =>
                equippedItemIds.includes(pieceId)
            ).length;

            // 應用套裝加成
            for (const pieceCount in setInfo.bonuses) {
                if (equippedPieces >= parseInt(pieceCount)) {
                    const bonus = setInfo.bonuses[pieceCount];
                    for (const stat in bonus) {
                        if (stat !== 'description' && bonuses[stat] !== undefined) {
                            bonuses[stat] += bonus[stat];
                        }
                    }
                    activeSetDescriptions.push(`${setInfo.name} (${pieceCount}件): ${bonus.description}`);
                }
            }
        }

        return {
            bonuses,
            descriptions: activeSetDescriptions
        };
    }

    /**
     * 獲取裝備顯示名稱（包含強化等級）
     */
    getDisplayName(equipment) {
        if (!equipment) return '';
        const level = equipment.enhanceLevel || 0;
        const levelStr = level > 0 ? ` +${level}` : '';
        return `${equipment.name}${levelStr}`;
    }

    /**
     * 獲取強化預覽
     */
    getEnhancementPreview(equipment) {
        const currentLevel = equipment.enhanceLevel || 0;
        const nextLevel = currentLevel + 1;
        
        return {
            currentLevel,
            nextLevel: nextLevel <= MAX_ENHANCEMENT_LEVEL ? nextLevel : null,
            cost: this.getEnhancementCost(equipment),
            successRate: Math.floor(this.getSuccessRate(equipment) * 100),
            canEnhance: currentLevel < MAX_ENHANCEMENT_LEVEL
        };
    }
}

// 單例
export const enhancementSystem = new EnhancementSystem();
