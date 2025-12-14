/**
 * Tool_EquipmentScore.js
 * 裝備靜態評分工具
 * 用途：檢查裝備數值是否崩壞，或稀有度是否名不符實。
 */

// ================= 設定區 =================
const CONFIG = {
    // 1. 標準模型：Lv1 白裝應有的基礎數值
    baseAtkPerLevel: 4.5, 
    baseDefPerLevel: 2.0,

    // 2. 稀有度倍率：該稀有度的裝備，總分必須是白裝的幾倍才及格？
    rarityStandard: {
        common: 1.0,      // 白裝 (基準)
        uncommon: 1.3,    // 綠裝 (需強 1.3倍)
        rare: 1.6,        // 藍裝
        epic: 2.2,        // 紫裝
        legendary: 3.0,   // 金裝 (標準降低一點，讓特效去補分)
        mythic: 4.5       // 神話
    },

    // 3. 屬性權重 (基於你的戰鬥公式修正)
    weights: {
        attack: 1.0,      // 基準分
        defense: 2.5,     // 防禦在減法公式很重要
        hp: 0.2,          // 血量容錯
        
        // 進階屬性 (假設 1 = 1%)
        critChance: 1.5,  // 暴擊率
        critDamage: 0.5,  // 暴傷 (依賴暴擊率，權重稍低)
        attackSpeed: 2.5, // 攻速直接乘算 DPS，權重高

        // 特效權重 (關鍵修正！)
        fire: 3.0,        // 火傷是獨立乘區，極強
        life_steal: 5.0,  // 吸血是續航核心，給最高分
        armor_pierce: 2.0,// 穿透
        thunder: 1.5,     // 暈眩控場
        ice: 1.2,         // 緩速
        poison: 1.5,      // 額外 DOT
        defaultEffect: 20 // 未知特效保底分
    }
};

// ================= 計算邏輯 =================
function calculateScore(item) {
    const stats = item.stats || {};
    const effects = item.specialEffects || [];
    let score = 0;

    // 1. 面板分數
    score += (stats.attack || 0) * CONFIG.weights.attack;
    score += (stats.defense || 0) * CONFIG.weights.defense;
    score += (stats.hp || 0) * CONFIG.weights.hp;
    
    // 2. 百分比屬性分數 (自動判斷小數點)
    let cc = stats.critChance || 0; if(cc > 0 && cc <= 1) cc *= 100;
    score += cc * CONFIG.weights.critChance;

    let cd = stats.critDamage || 0; 
        // crit damage handling: normalize to percent (+50% => 50)
        function critDamagePercent(value){
            const v = Number(value);
            if(!Number.isFinite(v)) return 0;
            if(v > 10) return v; // already percent, e.g. 150
            if(v >= 1.1) return (v - 1) * 100; // multiplier like 1.5 -> 50
            if(v > 0 && v < 1.1) return v * 100; // decimal like 0.5 -> 50
            return 0;
        }
        if(cd > 0){
            const bonus = Math.max(0, critDamagePercent(cd));
            score += bonus * CONFIG.weights.critDamage;
        }

    let as = stats.attackSpeed || 0; // 攻速通常是 1.2
    if(as > 1) score += (as - 1) * 100 * CONFIG.weights.attackSpeed;

    // 3. 特效分數
    effects.forEach(eff => {
        let val = eff.value || 0;
        if(val > 0 && val <= 1) val *= 100; // 統一轉成整數百分比
        const type = String(eff.type).toLowerCase();
        const weight = CONFIG.weights[type] || CONFIG.weights.defaultEffect;
        score += val * weight;
    });

    // 4. 計算及格線
    const level = item.level || 1;
    const rarity = (item.rarity || 'common').toLowerCase();
    
    let baseStd = 0;
    if (item.type === 'weapon') baseStd = Math.max(10, level * CONFIG.baseAtkPerLevel);
    else baseStd = Math.max(10, level * CONFIG.baseDefPerLevel * CONFIG.weights.defense);
    
    const targetScore = Math.floor(baseStd * CONFIG.rarityStandard[rarity]);
    const ratio = score / targetScore;

    // 5. 評級
    let rank = "B";
    if (ratio >= 2.0) rank = "SSS (超模)";
    else if (ratio >= 1.5) rank = "S (優秀)";
    else if (ratio >= 1.1) rank = "A (強力)";
    else if (ratio >= 0.9) rank = "B (及格)";
    else if (ratio >= 0.6) rank = "C (偏弱)";
    else rank = "D (垃圾)";

    return { score: Math.floor(score), target: targetScore, ratio: ratio.toFixed(2), rank };
}

// ================= 測試區 (把你的裝備貼在這裡) =================
const MyEquipment = [
    {
        name: '虛空之刃', type: 'weapon', level: 30, rarity: 'legendary',
        stats: { attack: 80, critChance: 25, critDamage: 3.0 },
        specialEffects: [{ type: 'armor_pierce', value: 30 }, { type: 'life_steal', value: 15 }]
    },
    {
        name: '史萊姆劍', type: 'weapon', level: 1, rarity: 'uncommon',
        stats: { attack: 12, critChance: 5 },
        specialEffects: [{ type: 'life_steal', value: 3 }]
    }
];

console.log(`| 裝備名稱       | 分數/及格分 | 倍率   | 評級         |`);
console.log(`|----------------|-------------|--------|--------------|`);
MyEquipment.forEach(item => {
    const res = calculateScore(item);
    console.log(`| ${item.name.padEnd(14)} | ${res.score}/${res.target}     | ${res.ratio}   | ${res.rank}`);
});