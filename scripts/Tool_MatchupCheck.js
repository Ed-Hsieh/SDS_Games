/**
 * Tool_MatchupCheck.js
 * 實戰模擬工具
 * 用途：直接模擬戰鬥，計算 TTK (殺怪時間) 與 TTD (存活時間)。
 */

// ================= 模擬核心 (簡化版 FightManager) =================
function simulateFight(playerStats, monster, equipment) {
    // 1. 整合玩家面板 (基礎 + 裝備)
    let p = { ...playerStats };
    const stats = equipment.stats || {};
    const effects = equipment.specialEffects || [];

    p.attack += (stats.attack || 0);
    p.defense += (stats.defense || 0);
    p.critChance += (stats.critChance || 0);
    // Normalize critDamage from equipment into a delta multiplier (e.g. +50% -> 0.5)
    function critDamagePercent(value){
        const v = Number(value);
        if(!Number.isFinite(v)) return 0;
        // If user provided a large number (>10) treat as percentage (e.g. 150 -> 150%)
        if(v > 10) return v; // already percent
        // If provided as multiplier >= 1.1 (e.g. 1.5 or 3.0), convert to percent increase
        if(v >= 1.1) return (v - 1) * 100;
        // If provided as decimal between 0 and 1 (e.g. 0.5), treat as +50%
        if(v > 0 && v < 1.1) return v * 100;
        return 0;
    }
    if(stats.critDamage){
        const pct = critDamagePercent(stats.critDamage); // e.g. 50
        const deltaMul = pct / 100; // 0.5
        p.critDamage = (p.critDamage || 1) + deltaMul;
    }
    
    // 處理特效
    let firePct = 0, lifestealPct = 0, penPct = 0;
    effects.forEach(e => {
        let v = e.value || 0; 
        // if(v <= 1) v *= 100; // 視你的資料格式而定
        if(e.type === 'fire') firePct += v;
        if(e.type === 'life_steal') lifestealPct += v;
        if(e.type === 'armor_pierce') penPct += v;
    });

    // 2. 戰鬥模擬
    // --- 玩家輸出 ---
    const monDef = Math.max(0, monster.defense * (1 - penPct/100));
    const rawDmg = Math.max(1, p.attack - monDef);
    // 暴擊期望值
    const cc = Math.min(1, p.critChance / 100);
    const avgHit = rawDmg * (1 - cc) + (rawDmg * p.critDamage * cc);
    // 屬性增傷 (Fire is multiplier)
    const finalHit = avgHit * (1 + firePct/100);
    const playerDPS = finalHit * p.attackSpeed;

    // --- 怪物輸出 ---
    const monDmg = Math.max(1, monster.attack - p.defense);
    const monSpeed = monster.attackSpeed || 1.0;
    const monDPS = monDmg * monSpeed;

    // --- 生存判定 (含吸血) ---
    const hps = playerDPS * (lifestealPct / 100); // 每秒回血
    const netDamageTaken = monDPS - hps; // 淨受傷

    // 3. 結果計算
    const timeToKill = monster.hp / playerDPS;
    const timeToDie = (netDamageTaken <= 0) ? Infinity : (p.hp / netDamageTaken);
    
    // 難度係數 (殺怪時間 / 存活時間)
    // 0 = 無敵, <1 = 簡單, >1 = 會輸
    const difficulty = (timeToDie === Infinity) ? 0 : (timeToKill / timeToDie);

    return { timeToKill, timeToDie, difficulty, playerDPS, monDPS, hps };
}

// ================= 測試區 (填入怪物與裝備) =================
// 標準玩家 (Lv 30)
const BasePlayer = { hp: 700, attack: 125, defense: 45, attackSpeed: 1.2, critChance: 0, critDamage: 1.5 };

const TheMonster = { 
    name: '虛空之王', hp: 3500, attack: 70, defense: 45, attackSpeed: 2.2 
};

const TheEquip = {
    name: '虛空之刃', 
    stats: { attack: 80, critChance: 25, critDamage: 3.0 },
    specialEffects: [{ type: 'armor_pierce', value: 30 }, { type: 'life_steal', value: 15 }]
};

// 執行
const res = simulateFight(BasePlayer, TheMonster, TheEquip);

console.log(`戰鬥模擬: [${TheEquip.name}] vs [${TheMonster.name}]`);
console.log(`------------------------------------------------`);
console.log(`玩家 DPS: ${Math.floor(res.playerDPS)} (每秒回血: ${Math.floor(res.hps)})`);
console.log(`怪物 DPS: ${Math.floor(res.monDPS)}`);
console.log(`殺怪時間: ${res.timeToKill.toFixed(1)} 秒`);
console.log(`存活時間: ${res.timeToDie === Infinity ? '∞ (不死)' : res.timeToDie.toFixed(1) + ' 秒'}`);
console.log(`------------------------------------------------`);
console.log(`結論: ${res.difficulty === 0 ? '👑 輾壓 (吸血>受傷)' : (res.difficulty > 1 ? '💀 挑戰失敗' : '✅ 挑戰成功')}`);