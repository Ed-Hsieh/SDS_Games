/**
 * Tool_FixedScore.js
 * 修正版裝備評分工具
 * 修正：
 * 1. 解決特效名稱大小寫/底線不匹配導致的「保底分錯誤」。
 * 2. 確保面板類特效 (如暴傷) 正確套用等級縮放 (Level Scaling)。
 */

const CONFIG = {
    // A. 標準模型
    baseAtkPerLevel: 4.0, 
    baseDefPerLevel: 2.0,

    // B. 稀有度標準
    rarityStandard: {
        common: 1.0, uncommon: 1.3, rare: 1.6, 
        epic: 2.2, legendary: 3.0, mythic: 4.5
    },

    // C. 權重表
    weights: {
        attack: 1.0,
        defense: 2.5,
        hp: 0.2,
        
        // 百分比屬性
        critChance: 1.5,
        critDamage: 0.8,
        attackSpeed: 2.5,

        // 特效
        fire: 3.0,
        life_steal: 5.0,
        armor_pierce: 2.0,
        thunder: 1.5,
        ice: 1.2,
        poison: 1.5,
        light: 3.0,
        
        defaultEffect: 20 // 未知特效保底
    },

    // D. 名稱映射表 (修正你的問題核心)
    // 把各種寫法對應到 weights 裡的 key
    keyMap: {
        'crit_damage': 'critDamage',
        'critdamage': 'critDamage',
        'crit_chance': 'critChance',
        'critchance': 'critChance',
        'attack_speed': 'attackSpeed',
        'attackspeed': 'attackSpeed',
        'lifesteal': 'life_steal',
        'armor_penetration': 'armor_pierce'
    }
};

function evaluateItem(item) {
    const stats = item.stats || {};
    const effects = item.specialEffects || [];
    let score = 0;

    // --- 計算等級係數 ---
    // Lv3 的 1% 屬性，價值只有 Lv30 的 1/10
    const levelScale = Math.max(0.1, (item.level * CONFIG.baseAtkPerLevel) / 100);

    // 1. 基礎數值
    score += (stats.attack || 0) * CONFIG.weights.attack;
    score += (stats.defense || 0) * CONFIG.weights.defense;
    score += (stats.hp || 0) * CONFIG.weights.hp;

    // 2. 統計所有百分比加成 (含 stats 和 specialEffects)
    // 我們建立一個暫存物件來累加所有屬性
    let bonusStats = {
        critChance: 0,
        critDamage: 0,
        attackSpeed: 0,
        // 其他特效直接算
        otherScore: 0
    };

    // A. 處理 stats 裡的百分比
    if (stats.critChance) bonusStats.critChance += toPercent(stats.critChance);
    if (stats.critDamage) bonusStats.critDamage += toBonusPercent(stats.critDamage);
    if (stats.attackSpeed) bonusStats.attackSpeed += toBonusPercent(stats.attackSpeed);

    // B. 處理 specialEffects
    effects.forEach(eff => {
        let val = toPercent(eff.value || 0);
        let rawType = String(eff.type).toLowerCase();
        
        // 嘗試映射名稱 (例如 crit_damage -> critDamage)
        let type = CONFIG.keyMap[rawType] || rawType;

        if (type === 'critDamage') bonusStats.critDamage += val;
        else if (type === 'critChance') bonusStats.critChance += val;
        else if (type === 'attackSpeed') bonusStats.attackSpeed += val;
        else {
            // 非面板類特效 (如 fire, life_steal)
            if (CONFIG.weights[type]) {
                // 已知特效：乘權重 * 等級係數
                bonusStats.otherScore += val * CONFIG.weights[type] * levelScale;
            } else {
                // 未知特效：給保底分 (不乘係數，因為通常是機制類)
                // 這裡你要自己判斷是否要乘 levelScale，通常機制類(如復活)價值固定
                bonusStats.otherScore += CONFIG.weights.defaultEffect;
                // console.log(`未知特效: ${rawType}, 給予保底分`);
            }
        }
    });

    // 3. 結算分數
    score += bonusStats.critChance * CONFIG.weights.critChance * levelScale;
    score += bonusStats.critDamage * CONFIG.weights.critDamage * levelScale;
    score += bonusStats.attackSpeed * CONFIG.weights.attackSpeed * levelScale;
    score += bonusStats.otherScore;

    // 4. 及格線計算
    const rarity = (item.rarity || 'common').toLowerCase();
    const rarityMult = CONFIG.rarityStandard[rarity] || 1.0;
    
    let baseStandard = Math.max(5, item.level * CONFIG.baseAtkPerLevel);
    if (item.type !== 'weapon' && item.type !== 'WEAPON') {
        baseStandard = Math.max(5, item.level * CONFIG.baseDefPerLevel * CONFIG.weights.defense);
    }

    const targetScore = Math.floor(baseStandard * rarityMult);
    const ratio = (targetScore > 0) ? (score / targetScore) : 0;

    // 5. 評級
    let rank = "D";
    if (ratio >= 2.0) rank = "SSS (超模)";
    else if (ratio >= 1.5) rank = "S (優秀)";
    else if (ratio >= 1.1) rank = "A (強力)";
    else if (ratio >= 0.85) rank = "B (及格)";
    else if (ratio >= 0.6) rank = "C (偏弱)";
    else rank = "D (垃圾)";

    return { 
        score: parseFloat(score.toFixed(1)), 
        target: targetScore, 
        ratio: ratio.toFixed(2), 
        rank 
    };
}

// 輔助函數：統一轉成整數百分比 (0.1 -> 10, 10 -> 10)
function toPercent(val) {
    if (val > 0 && val <= 1) return val * 100;
    return val;
}

// 輔助函數：處理倍率 (1.5 -> 50, 0.5 -> 50, 50 -> 50)
function toBonusPercent(val) {
    if (val <= 0) return 0;
    if (val <= 5) return (val - 1) * 100; // 1.2 -> 20
    return val; // 20 -> 20
}

// ================= 測試區 =================
const goblin_dagger = {
    name: '哥布林短刀', level: 3, rarity: 'uncommon', type: 'weapon',
    stats: { attack: 6, critChance: 0.118, critDamage: 1.264, attackSpeed: 1.13 },
    specialEffects: [{ type: 'CRIT_DAMAGE', value: 10 }] 
};

const res = evaluateItem(goblin_dagger);
console.log(`測試結果: ${goblin_dagger.name}`);
console.log(`分數: ${res.score} / 及格分: ${res.target}`);
console.log(`倍率: ${res.ratio} -> 評級: ${res.rank}`);
