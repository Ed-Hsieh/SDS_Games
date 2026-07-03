/**
 * Items.js
 * Static database of all game items and shops.
 */

export const ShopData = {
    blacksmith: {
        name: '鍛造師',
        npcPortrait: '',
        dialogue: '需要武器或防具嗎？我的作品從不讓人失望。',
        items: [
            // 武器：有 atk, critChance, critDamage, weaponSpeed, attackSpeed
            { id: 'iron_sword', name: '鐵劍', icon: '⚔️', type: 'weapon', rarity: 'common', attack: 10, defense: 0, critChance: 0.08, critDamage: 1.5, weaponSpeed: 1.0, attackSpeed: 1.0, price: 100, desc: '一把標準的鐵劍，守衛們的最愛。' },
            // 防具：只有 def, critChance, critDamage（無 weaponSpeed, attackSpeed）
            { id: 'steel_armor', name: '鋼鎧', icon: '🛡️', type: 'armor', rarity: 'uncommon', attack: 0, defense: 15, critChance: 0.03, critDamage: 1.2, price: 200, desc: '堅固的鋼製鎧甲，能抵擋大部分攻擊。' },
            // 武器：更高屬性
            { id: 'mithril_blade', name: '秘銀劍', icon: '⚔️', type: 'weapon', rarity: 'rare', attack: 25, defense: 0, critChance: 0.15, critDamage: 1.8, weaponSpeed: 1.2, attackSpeed: 1.3, price: 500, desc: '輕盈而鋒利的秘銀劍，閃耀著銀光。' }
        ]
    },
    alchemist: {
        name: '煉金術士',
        npcPortrait: '',
        dialogue: '藥水、毒藥、還是變身藥劑？你想要什麼？',
        items: [
            // 基礎恢復藥水
            { id: 'health_potion', name: '生命藥水', icon: '🧪', type: 'potion', rarity: 'common', hp: 50, price: 50, desc: '恢復少量生命值。' },
            { id: 'first_aid_potion', name: '急救藥水', icon: '🩹', type: 'potion', rarity: 'uncommon', hp: 80, price: 80, desc: '恢復中量生命值。' },
            { id: 'elixir', name: '萬能藥', icon: '✨', type: 'potion', rarity: 'rare', hp: 160, price: 300, desc: '大幅恢復生命狀態的神奇藥水。' },
            // 新增：增益藥水
            { id: 'strength_potion', name: '力量藥水', icon: '💪', type: 'potion', rarity: 'uncommon', buff: { type: 'atk', value: 15, duration: 5 }, price: 120, desc: '暫時提升攻擊力 +15，約5秒。' },
            { id: 'defense_potion', name: '防禦藥水', icon: '🛡️', type: 'potion', rarity: 'uncommon', buff: { type: 'def', value: 10, duration: 5 }, price: 100, desc: '暫時提升防禦力 +10，約5秒。' },
            { id: 'lucky_potion', name: '幸運藥水', icon: '🍀', type: 'potion', rarity: 'rare', buff: { type: 'critChance', value: 0.15, duration: 5 }, price: 200, desc: '暫時提升爆擊率 +15%，約5秒。' },
            // 新增：大型恢復藥水
            { id: 'greater_health_potion', name: '大型生命藥水', icon: '❤️', type: 'potion', rarity: 'uncommon', hp: 100, price: 120, desc: '恢復大量生命值。' },
            { id: 'emergency_potion', name: '緊急生命藥水', icon: '💎', type: 'potion', rarity: 'rare', hp: 180, price: 150, desc: '在危急時快速恢復大量生命值。' }
        ]
    },
    merchant: {
        name: '旅行商人',
        npcPortrait: '',
        dialogue: '稀有物品、鍛造素材、還有一些...特別的東西。',
        items: [
            { id: 'ancient_coin', name: '古代錢幣', icon: '🪙', type: 'key', rarity: 'legendary', price: 1000, isSecretKey: true, desc: '一枚古老的錢幣，似乎隱藏著秘密。' },
            { id: 'map_fragment', name: '地圖碎片', icon: '🗺️', type: 'quest', rarity: 'uncommon', price: 150, desc: '一張破舊的地圖碎片。' },
            { id: 'silver_thread_bait', name: '銀絲誘餌', icon: '🪝', type: 'quest', rarity: 'uncommon', price: 90, sellPrice: 20, stackable: true, maxStack: 9, desc: '纏著細銀絲的小鉤，只有在銀絲最密的伏道設下，才可能把潛伏者引出來。' },
            // 新增：飾品
            { id: 'silver_ring', name: '銀戒指', icon: '💍', type: 'accessory', rarity: 'uncommon', attack: 3, defense: 3, critChance: 0.05, critDamage: 1.3, price: 180, desc: '簡單但精緻的銀戒指。' },
            { id: 'lucky_charm', name: '幸運符', icon: '🧿', type: 'accessory', rarity: 'rare', attack: 0, defense: 0, critChance: 0.12, critDamage: 1.6, price: 350, desc: '帶來好運的神秘符咒。' },
            // 鍛造用素材
            { id: 'iron_shard', name: '鐵片', icon: '⛓️', type: 'material', rarity: 'common', price: 80, desc: '可作為低階鍛造與重鑄的補充材料。' },
            { id: 'forge_core', name: '鍛造核心', icon: '🔥', type: 'material', rarity: 'rare', price: 360, desc: '蘊含鍛造能量的核心，可用於高階鍛造規劃。' }
        ]
    },
    scholar: {
        name: '學者',
        npcPortrait: '',
        dialogue: '知識即力量。這些捲軸記載著失落的技藝。',
        items: [
            { id: 'sharp_focus_manual', name: '銳利專注手記', icon: '🎯', type: 'book', rarity: 'uncommon', passiveEffectId: 'sharp_focus', price: 120, desc: '記錄提高爆擊判讀的戰鬥心得。' },
            { id: 'guard_memory_manual', name: '守勢記憶手記', icon: '🛡️', type: 'book', rarity: 'uncommon', passiveEffectId: 'guard_memory', price: 120, desc: '記錄穩定防守姿態的戰鬥心得。' },
            { id: 'ancient_tome', name: '古代典籍', icon: '📕', type: 'book', rarity: 'epic', price: 800, desc: '一本記載著古代歷史的厚重書籍。' },
            // 新增：戰鬥效果手記
            { id: 'quick_rhythm_manual', name: '迅捷節奏手記', icon: '⚡', type: 'book', rarity: 'rare', passiveEffectId: 'quick_rhythm', price: 250, desc: '記錄提高攻擊頻率的戰鬥心得。' },
            { id: 'fatal_reading_manual', name: '致命判讀手記', icon: '💥', type: 'book', rarity: 'rare', passiveEffectId: 'fatal_reading', price: 150, desc: '記錄提高爆擊傷害的戰鬥心得。' }
        ]
    }
};

export const SecretShopItems = [
    // 傳說武器：最高屬性的武器
    { id: 'dragon_blade', name: '龍息長刃', icon: '🐉', type: 'weapon', rarity: 'legendary', attack: 50, defense: 0, critChance: 0.25, critDamage: 2.5, weaponSpeed: 1.5, attackSpeed: 1.8, price: 5000, desc: '傳說中屠龍勇士使用的劍。' },
    // 傳說防具：最高防禦
    { id: 'phoenix_armor', name: '不熄羽甲', icon: '🔥', type: 'armor', rarity: 'legendary', attack: 0, defense: 40, critChance: 0.08, critDamage: 1.5, price: 4500, desc: '浴火重生的鳳凰羽毛編織而成的鎧甲。' },
    // 傳說飾品：高爆擊
    { id: 'time_amulet', name: '停鐘護符', icon: '⏰', type: 'accessory', rarity: 'legendary', attack: 5, defense: 5, critChance: 0.3, critDamage: 2.0, price: 6000, desc: '可以操控時間的神秘護符。' },
    // 新增：傳說藥水
    { id: 'immortal_elixir', name: '不死藥劑', icon: '⭐', type: 'potion', rarity: 'legendary', hp: 999, price: 3000, desc: '傳說中的不死藥劑，完全恢復生命。' },
    { id: 'berserker_potion', name: '狂戰士藥劑', icon: '😈', type: 'potion', rarity: 'legendary', buff: { type: 'atk', value: 50, duration: 3 }, price: 2000, desc: '使你暫時化身為狂戰士，攻擊力短時間大幅提升！' },
    // 高級鍛造素材
    { id: 'high_ore', name: '高級礦石', icon: '⛏️', type: 'material', rarity: 'rare', price: 450, desc: '高階裝備製作與重鑄常用的礦物。' },
    { id: 'rare_metal', name: '稀有金屬', icon: '🔧', type: 'material', rarity: 'rare', price: 650, desc: '可用於特殊裝備與高階鍛造。' },
    { id: 'forge_core', name: '鍛造核心', icon: '🔥', type: 'material', rarity: 'rare', price: 900, desc: '蘊含鍛造能量的核心。' }
];
