/**
 * Enums.js
 * 遊戲核心列舉型別與常數
 * 此檔案只包含純資料定義，不含任何邏輯
 */

// ===== 物品稀有度 =====
export const ItemRarity = {
    COMMON: 'common',
    UNCOMMON: 'uncommon',
    RARE: 'rare',
    EPIC: 'epic',
    LEGENDARY: 'legendary'
};

// ===== 物品類型 =====
export const ItemType = {
    WEAPON: 'weapon',
    ARMOR: 'armor',
    ACCESSORY: 'accessory',
    POTION: 'potion',
    MATERIAL: 'material',
    KEY: 'key',
    GEM: 'gem',
    SOCKET_GEM: 'socket_gem',
    SCROLL: 'scroll',
    BOOK: 'book',
    QUEST: 'quest'
};

// ===== 物品分類 =====
export const ItemCategory = {
    EQUIPMENT: 'equipment',
    ITEMS: 'items'
};

// ===== 技能類型 =====
export const SkillType = {
    ATTACK: 'attack',      // 攻擊技能
    HEAL: 'heal',          // 治療技能
    BUFF: 'buff',          // 增益技能
    DEBUFF: 'debuff'       // 減益技能
};
