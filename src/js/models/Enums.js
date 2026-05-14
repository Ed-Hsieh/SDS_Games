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
    CURRENCY: 'currency',
    KEY: 'key',
    GEM: 'gem',
    SOCKET_GEM: 'socket_gem',
    SCROLL: 'scroll',
    BOOK: 'book',
    QUEST: 'quest'
};

// ===== 詞綴屬性鍵（純列舉，僅提供關鍵字） =====
export const AffixStat = {
    //基本狀態
    ATK: 'atk',
    DEF: 'def',
    HP: 'hp',
    MP: 'mp',
    CRIT_CHANCE: 'critChance',
    CRIT_DAMAGE: 'critDamage',
    ATTACK_SPEED: 'attackSpeed',

    //特效
    LIFE_STEAL: 'lifesteal', // 吸血
    DAMAGE_REDUCTION: 'damageReduction', // 減傷
    DODGE_CHANCE: 'dodgeChance', // 閃避機率
    ARMOR_PENETRATION: 'armorPenetration', // 穿甲
    DOUBLE_STRIKE: 'double_strike', // 雙重打擊機率
    EXECUTE: 'execute', // 處決傷害加成
    DAMAGE_REFLECT: 'damage_reflect', // 反傷

    // 額外加成
    GOLD_BONUS: 'gold_bonus',
    EXP_BONUS: 'exp_bonus',
    DROP_BONUS: 'drop_bonus',
    REVIVE: 'revive',
    ALL_STATS: 'allStats', // 全屬性加成

    // 元素
    FIRE: 'fire',
    ICE: 'ice',
    THUNDER: 'thunder',
    LIGHT: 'light',
    POISON: 'poison',
};

export const SpecialEffectDescriptions = {
    life_steal: (value) => `攻擊時回復 ${value}% 傷害的生命`,
    damage_reduction: (value) => `受到的傷害減少 ${value}%`,
    dodge_chance: (value) => `${value}% 機率閃避敵人攻擊`,
    armor_penetration: (value) => `攻擊時無視敵人 ${value}% 防禦`,
    double_strike: (value) => `${value}% 機率發動雙重打擊`,
    execute: (value) => `對低於 50% HP 的敵人造成額外 ${value}% 傷害`,
    damage_reflect: (value) => `反彈 ${value}% 受到的傷害`,

    gold_bonus: (value) => `金幣獲取 +${value}%`,
    exp_bonus: (value) => `經驗獲取 +${value}%`,
    drop_bonus: (value) => `掉落率 +${value}%`,
    revive: (value) => `死亡時 ${value}% 機率復活並回復 30% HP`,
    
    // 火：額外傷害比例
    fire: (value) => `攻擊時造成額外 ${value}% 的傷害`,
    // 冰：減速效果
    ice: (value) => `攻擊命中後使敵人攻速降低 ${value}%`,
    // 雷：暈眩機率
    thunder: (value) => `命中敵人時有 ${value}% 機率使敵人暈眩`,
    // 光：提高攻速
    light: (value) => `每次攻擊命中時攻速提高 ${value}%，此增益可無限疊加`,
    // 毒：持續傷害
    poison: (value) => `造成傷害時使敵人中毒，每秒造成 ${value} 點持續傷害，持續 3 秒（總持續時間依武器攻擊次數分配，示例：每次持續時間 = 3 / 武器攻擊次數 秒）`,
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

// ===== 掉落來源類型 =====
export const DropSourceType = {
    MonsterUnique: 'monster_unique',
    MonsterEquipment: 'monster_equip',
    Zone: 'zone',
    Dungeon: 'dungeon'
};

// 裝備類型（簡化為三類）
export const EquipmentType = {
    WEAPON: 'weapon',
    ARMOR: 'armor',
    EQUIPMENT: 'equipment',
    ACCESSORY: 'accessory'
};

// 稀有度顏色
export const RarityColors = {
    common: '#9d9d9d',
    uncommon: '#1eff00',
    rare: '#0070dd',
    epic: '#a335ee',
    legendary: '#ff8000',
    mythic: '#e6cc80'
};
