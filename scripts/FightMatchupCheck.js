/**
 * Tool_MatchupCheck.js
 * 實戰模擬與匹配驗證工具
 * 用途：輸入「怪物ID」與「裝備ID」，判斷穿這件裝備能不能打贏。
 */

// 模擬玩家與裝備合成
function equipPlayer(basePlayer, item) {
    let p = { ...basePlayer };
    const stats = item.stats || {};
    const effects = item.specialEffects || [];

    // 合併數值 (簡單加總)
    const merge = (key, val) => {
        if (!val) return;
        if (key === 'attack') p.attack += val;
        else if (key === 'defense') p.defense += val;
        else if (key === 'hp') p.hp += val;
        // 處理特殊屬性名稱
        else if (key === 'critChance' || key === 'critchance') p.critChance += (val <= 1 ? val * 100 : val);
        else if (key === 'critDamage' || key === 'critdamage') p.critDamage += (val <= 5 ? (val > 1 ? val - 1 : 0) : val / 100);
        else if (key === 'lifesteal' || key === 'life_steal') p.lifesteal += (val <= 1 ? val * 100 : val);
        else if (key === 'armorPenetration' || key === 'armor_pierce') p.armorPen += (val <= 1 ? val * 100 : val);
        else if (key === 'fire') p.firePercent += (val <= 1 ? val * 100 : val);
    };

    for (let k in stats) merge(k, stats[k]);
    effects.forEach(e => merge(e.type, e.value));

    return p;
}

// 模擬戰鬥 (單次模擬)
function simulateFight(player, monster) {
    // 怪物數據 (確保有數值)
    const monHp = Number(monster.hp || 0);
    const monAtk = Number(monster.attack || 0);
    const monDef = Number(monster.defense || 0);
    const monSpeed = Number(monster.attackSpeed || 1.0);

    // 給 player 屬性合理的預設值，避免未定義造成 NaN
    const p = {
        hp: Number(player.hp || 0),
        attack: Number(player.attack || 0),
        defense: Number(player.defense || 0),
        attackSpeed: Number(player.attackSpeed || 1.0),
        critChance: Number(player.critChance || 0), // 以百分比表示 (0-100)
        critDamage: Number(player.critDamage || 1.5), // 乘數，例如 1.5
        lifesteal: Number(player.lifesteal || 0), // 百分比 (0-100)
        armorPen: Number(player.armorPen || 0), // 百分比 (0-100)
        firePercent: Number(player.firePercent || 0) // 百分比
    };

    // 1. 玩家 DPS 計算
    const effMonDef = Math.max(0, monDef * (1 - (p.armorPen / 100))); // 穿甲
    const rawDmg = Math.max(1, p.attack - effMonDef);

    // 暴擊期望 (將 critChance 轉為 0-1 範圍)
    const cc = Math.min(1, p.critChance / 100);
    const avgHit = rawDmg * (1 - cc) + (rawDmg * p.critDamage * cc);

    // 元素增傷 (Fire)
    const finalHit = avgHit * (1 + (p.firePercent / 100));

    const playerDPS = finalHit * p.attackSpeed;
    const timeToKill = playerDPS > 0 ? (monHp / playerDPS) : Infinity;

    // 2. 怪物 DPS 計算
    const monHit = Math.max(1, monAtk - p.defense);
    const monDPS = monHit * monSpeed;

    // 3. 生存計算 (含吸血)
    const hps = playerDPS * (p.lifesteal / 100);
    const netDamageTaken = monDPS - hps; // 淨受傷

    let timeToDie = 0;
    if (netDamageTaken <= 0) timeToDie = Infinity; // 吸血 >= 傷害
    else timeToDie = p.hp / netDamageTaken;

    // 4. 結果
    const win = timeToDie > timeToKill;
    const difficulty = (timeToDie === Infinity) ? 0 : (timeToKill / timeToDie);

    return { win, timeToKill, timeToDie, difficulty, playerDPS, monDPS, hps, netDamageTaken };
}

// 測試執行
function runMatch(monster, item) {
    // 標準裸體玩家 (Lv30 為例)
    const BasePlayer = { 
        hp: 100 + (monster.level * 20), 
        attack: 5 + (monster.level * 4), 
        defense: Math.floor(monster.level * 1.5), 
        attackSpeed: 1.2, 
        critChance: 0, critDamage: 1.5, lifesteal: 0, armorPen: 0, firePercent: 0 
    };

    const pEquip = equipPlayer(BasePlayer, item);
    const res = simulateFight(pEquip, monster);

    console.log(`對戰: [${item.name}] vs [${monster.name}]`);
    console.log(`DPS: ${Math.floor(res.playerDPS)} | 殺怪: ${res.timeToKill.toFixed(1)}s`);
    console.log(`受傷: ${Math.floor(res.netDamageTaken)}/s | 存活: ${res.timeToDie === Infinity ? '∞' : res.timeToDie.toFixed(1)}s`);
    console.log(`結果: ${res.win ? '✅ 勝利' : '❌ 失敗'} (難度比 ${res.difficulty.toFixed(2)})`);
    console.log('-----------------------------------');
}

// 範例資料 (請替換)
const VoidKing = { name: '虛空之王', level: 30, hp: 3500, attack: 70, defense: 45, attackSpeed: 2.2 };
const VoidBlade = { 
    name: '虛空之刃', stats: { attack: 80, critChance: 0.25 }, 
    specialEffects: [{ type: 'lifesteal', value: 0.15 }, { type: 'armorPenetration', value: 0.3 }] 
};

runMatch(VoidKing, VoidBlade);