/**
 * Items.js
 * Static database of all game items and shops.
 */

export const ShopData = {
    blacksmith: {
        name: '鍛造師',
        npcPortrait: 'src/assets/images/鍛造師.jpg',
        dialogue: '需要武器或防具嗎？我的作品從不讓人失望。',
        items: [
            // 武器：有 atk, critChance, critDamage, weaponSpeed, attackSpeed
            { id: 'iron_sword', name: '鐵劍', icon: '⚔️', image: 'src/assets/images/鐵劍.jpg', type: 'weapon', rarity: 'common', attack: 10, defense: 0, critChance: 0.08, critDamage: 1.5, weaponSpeed: 1.0, attackSpeed: 1.0, price: 100, desc: '一把標準的鐵劍，守衛們的最愛。' },
            // 防具：只有 def, critChance, critDamage（無 weaponSpeed, attackSpeed）
            { id: 'steel_armor', name: '鋼鎧', icon: '🛡️', image: 'src/assets/images/鋼鎧.jpg', type: 'armor', rarity: 'uncommon', attack: 0, defense: 15, critChance: 0.03, critDamage: 1.2, price: 200, desc: '堅固的鋼製鎧甲，能抵擋大部分攻擊。' },
            // 武器：更高屬性
            { id: 'mithril_blade', name: '秘銀劍', icon: '⚔️', image: 'src/assets/images/秘銀劍.jpg', type: 'weapon', rarity: 'rare', attack: 25, defense: 0, critChance: 0.15, critDamage: 1.8, weaponSpeed: 1.2, attackSpeed: 1.3, price: 500, desc: '輕盈而鋒利的秘銀劍，閃耀著銀光。' }
        ]
    },
    alchemist: {
        name: '煉金術士',
        npcPortrait: 'src/assets/images/煉金術士.jpg',
        dialogue: '藥水、毒藥、還是變身藥劑？你想要什麼？',
        items: [
            { id: 'health_potion', name: '生命藥水', icon: '🧪', type: 'potion', rarity: 'common', hp: 50, price: 50, desc: '恢復少量生命值。' },
            { id: 'mana_potion', name: '魔力藥水', icon: '💙', type: 'potion', rarity: 'uncommon', mp: 30, price: 80, desc: '恢復少量魔力值。' },
            { id: 'elixir', name: '萬能藥', icon: '✨', type: 'potion', rarity: 'rare', hp: 100, mp: 50, price: 300, desc: '完全恢復狀態的神奇藥水。' }
        ]
    },
    merchant: {
        name: '旅行商人',
        npcPortrait: 'src/assets/images/旅行商人.jpg',
        dialogue: '稀有物品、寶石、還有一些...特別的東西。',
        items: [
            { id: 'ruby', name: '紅寶石', icon: '💎', type: 'gem', rarity: 'rare', price: 250, desc: '閃耀著紅色光芒的寶石。' },
            { id: 'ancient_coin', name: '古代錢幣', icon: '🪙', type: 'key', rarity: 'legendary', price: 1000, isSecretKey: true, desc: '一枚古老的錢幣，似乎隱藏著秘密。' },
            { id: 'map_fragment', name: '地圖碎片', icon: '🗺️', type: 'quest', rarity: 'uncommon', price: 150, desc: '一張破舊的地圖碎片。' }
        ]
    },
    scholar: {
        name: '學者',
        npcPortrait: 'src/assets/images/學者.jpg',
        dialogue: '知識即力量。這些捲軸記載著失落的技藝。',
        items: [
            { id: 'fire_scroll', name: '火球術捲軸', icon: '🔥', type: 'scroll', rarity: 'uncommon', price: 120, desc: '記載著火球術的魔法捲軸。' },
            { id: 'ice_scroll', name: '冰霜術捲軸', icon: '❄️', type: 'scroll', rarity: 'uncommon', price: 120, desc: '記載著冰霜術的魔法捲軸。' },
            { id: 'ancient_tome', name: '古代典籍', icon: '📕', type: 'book', rarity: 'epic', price: 800, desc: '一本記載著古代歷史的厚重書籍。' }
        ]
    }
};

export const SecretShopItems = [
    // 傳說武器：最高屬性的武器
    { id: 'dragon_blade', name: '龍之劍', icon: '🐉', type: 'weapon', rarity: 'legendary', attack: 50, defense: 0, critChance: 0.25, critDamage: 2.5, weaponSpeed: 1.5, attackSpeed: 1.8, price: 5000, desc: '傳說中屠龍勇士使用的劍。' },
    // 傳說防具：最高防禦
    { id: 'phoenix_armor', name: '鳳凰鎧', icon: '🔥', type: 'armor', rarity: 'legendary', attack: 0, defense: 40, critChance: 0.08, critDamage: 1.5, price: 4500, desc: '浴火重生的鳳凰羽毛編織而成的鎧甲。' },
    // 傳說飾品：高爆擊
    { id: 'time_amulet', name: '時間護符', icon: '⏰', type: 'accessory', rarity: 'legendary', attack: 5, defense: 5, critChance: 0.3, critDamage: 2.0, price: 6000, desc: '可以操控時間的神秘護符。' }
];
