/**
 * BalanceCheck_v4.js
 * 遊戲數值強度與難度評分工具
 * * 新增功能：
 * 1. 顯示詳細玩家機體數值 (HP/Atk/Def/Spd)
 * 2. 計算「怪物綜合強度評分」(Strength Ratio) 與評級 (Rank)
 */

// ==========================================
// 1. 設定：玩家成長模型
// ==========================================
const PLAYER_CONFIG = {
    baseHp: 100,
    hpPerLevel: 20,
    baseAtk: 5,
    atkPerLevel: 4,
    defMultiplier: 1.5,
    baseAtkSpeed: 1.2  // 玩家標準攻速
};

function getStandardPlayerStats(level) {
    return {
        hp: Math.floor(PLAYER_CONFIG.baseHp + (level * PLAYER_CONFIG.hpPerLevel)),
        attack: Math.floor(PLAYER_CONFIG.baseAtk + (level * PLAYER_CONFIG.atkPerLevel)),
        defense: Math.floor(level * PLAYER_CONFIG.defMultiplier),
        attackSpeed: PLAYER_CONFIG.baseAtkSpeed
    };
}

// ==========================================
// 2. 戰鬥模擬與評分邏輯
// ==========================================
function simulateBattle(player, monster) {
    const monSpeed = monster.attackSpeed || 1.0; 
    
    // --- 玩家輸出 (DPS) ---
    const playerHitDmg = Math.max(1, player.attack - monster.defense);
    const playerDPS = playerHitDmg * player.attackSpeed;
    const timeToKill = monster.hp / playerDPS;

    // --- 怪物輸出 (DPS) ---
    const monsterHitDmg = Math.max(1, monster.attack - player.defense);
    const monsterDPS = monsterHitDmg * monSpeed;
    const timeToDie = player.hp / monsterDPS;

    // --- 強度評分算法 ---
    // 強度比 = 殺怪時間 / 存活時間
    // 如果你要花 20秒殺怪，但只能活 10秒，強度比 = 2.0 (怪比你強2倍)
    const powerRatio = timeToKill / timeToDie;
    
    let rank = "B";
    if (powerRatio > 3.0) rank = "SSS (惡夢)";
    else if (powerRatio > 2.0) rank = "S (BOSS)";
    else if (powerRatio > 1.5) rank = "A (困難)";
    else if (powerRatio > 0.8) rank = "B (標準)";
    else if (powerRatio > 0.5) rank = "C (簡單)";
    else rank = "D (割草)";

    return {
        timeToKill: parseFloat(timeToKill.toFixed(1)),
        timeToDie: parseFloat(timeToDie.toFixed(1)),
        playerDPS: Math.floor(playerDPS),
        monsterDPS: Math.floor(monsterDPS),
        powerRatio: parseFloat(powerRatio.toFixed(2)),
        rank
    };
}

// ==========================================
// 3. 怪物資料庫 (嘗試從專案資料讀取，失敗則使用內建範例)
// ==========================================
const MonsterDatabaseLocal = {
    slime: { name: '史萊姆', level: 1, hp: 40, attack: 5, defense: 0, attackSpeed: 1.0 },
    goblin: { name: '哥布林', level: 2, hp: 60, attack: 18, defense: 2, attackSpeed: 1.0 },
    lich: { name: '巫妖(BOSS)', level: 10, hp: 800, attack: 55, defense: 15, attackSpeed: 0.85 },
    shadow_cmd: { name: '暗影指揮官', level: 14, hp: 1200, attack: 80, defense: 25, attackSpeed: 1.0 },

    // 你的設定：需要傳說裝備才打得贏的魔王
    void_king: {
        name: '虛空之王',
        level: 30,
        hp: 3500,
        attack: 70,
        defense: 45,
        attackSpeed: 2.2
    },

    // 對照組：Lv30 小怪
    demon: { name: '魔族士兵', level: 30, hp: 1200, attack: 90, defense: 40, attackSpeed: 1.0 }
};

// 嘗試載入外部 Monster 資料庫（`src/js/data/Monsters.js`）
function loadExternalMonsterDatabase() {
    // 1) 如果在瀏覽器中並且全域變數已被載入（例如你在頁面中引入了 Monsters.js），直接使用
    if (typeof window !== 'undefined' && window.MonsterDatabase) {
        return window.MonsterDatabase;
    }

    // 2) 在 Node 環境中嘗試用幾種方法載入
    try {
        // 嘗試直接 require（若該 module 已轉為 CommonJS）
        if (typeof require === 'function') {
            try {
                const candidate = require('../src/js/data/Monsters.js');
                if (candidate) {
                    // 模組可能 export named or default
                    if (candidate.MonsterDatabase) return candidate.MonsterDatabase;
                    if (candidate.default && candidate.default.MonsterDatabase) return candidate.default.MonsterDatabase;
                    // Or the module itself could be the DB
                    if (candidate.MonsterDatabase === undefined && typeof candidate === 'object') {
                        // fallthrough
                    }
                }
            } catch (e) {
                // ignore require error and fallback to fs read
            }

            // 嘗試用 fs + vm 直接解析 ES module 檔案（若為 ES module，直接 require 可能失敗）
            const fs = require('fs');
            const path = require('path');
            const vm = require('vm');
            const abs = path.join(__dirname, '..', 'src', 'js', 'data', 'Monsters.js');
            if (fs.existsSync(abs)) {
                const raw = fs.readFileSync(abs, 'utf8');
                // 移除 export 關鍵字，讓檔案可以在 vm 中執行並取得 MonsterDatabase
                const transformed = raw
                    .replace(/export\s+const\s+MonsterDatabase\s*=\s*/, 'const MonsterDatabase = ')
                    .replace(/export\s+\{[^}]*\};?/g, '')
                    .replace(/export\s+default\s+/g, '')
                    .replace(/module\.exports\s*=\s*/g, '');

                const context = {};
                try {
                    vm.createContext(context);
                    const script = new vm.Script(transformed + '\n;MonsterDatabase');
                    const result = script.runInContext(context);
                    if (result && typeof result === 'object') return result;
                } catch (e) {
                    // failed to parse/eval
                }
            }
        }
    } catch (e) {
        // ignore and fallback
    }

    // 3) 無法載入外部資料庫，回傳 null
    return null;
}

const MonsterDatabaseExternal = loadExternalMonsterDatabase();
const MonsterDatabase = MonsterDatabaseExternal || MonsterDatabaseLocal;

// ==========================================
// 4. 輸出報表
// ==========================================
function runBalanceCheck() {
    console.log("=================================================================================================================================================");
    console.log("🛡️  遊戲數值詳細檢核表 v4.0");
    console.log("=================================================================================================================================================");
    
    // 定義標題格式
    const headers = [
        "Lv".padEnd(3),
        "怪物名稱".padEnd(12),
        "玩家HP".padEnd(7),
        "攻/防".padEnd(8),
        "攻速".padEnd(5),
        "DPS(人vs怪)".padEnd(14),
        "殺怪秒".padEnd(8),
        "存活秒".padEnd(8),
        "強度評分 (比值)".padEnd(18),
        "評價建議"
    ];
    console.log(headers.join(" | "));
    console.log("-".repeat(165));

    for (const key in MonsterDatabase) {
        const monster = MonsterDatabase[key];
        const p = getStandardPlayerStats(monster.level);
        const result = simulateBattle(p, monster);

        // --- 評價建議生成 ---
        let advice = "✅ 數值平衡";
        if (result.powerRatio > 2.5) advice = "⚠️ 需神裝/技術";
        else if (result.powerRatio > 1.5) advice = "⚠️ 需喝水/走位";
        else if (result.powerRatio < 0.4) advice = "💤 太弱 (需增強)";
        else if (result.timeToKill > 30) advice = "🛑 血太厚 (作業感)";
        else if (result.timeToDie < 3) advice = "💀 攻擊太高 (秒殺)";

        // 格式化欄位
        const lv = String(monster.level).padEnd(3);
        const name = monster.name.padEnd(12); // 中文對齊需注意，此處簡易處理
        const pHp = String(p.hp).padEnd(7);
        const pAtkDef = `${p.attack}/${p.defense}`.padEnd(8);
        const pSpd = String(p.attackSpeed).padEnd(5);
        const dps = `${result.playerDPS} vs ${result.monsterDPS}`.padEnd(14);
        const kill = String(result.timeToKill).padEnd(8);
        const die = String(result.timeToDie).padEnd(8);
        const score = `${result.rank} (${result.powerRatio})`.padEnd(18);

        console.log(`${lv} | ${name} | ${pHp} | ${pAtkDef} | ${pSpd} | ${dps} | ${kill} | ${die} | ${score} | ${advice}`);
    }
    console.log("=================================================================================================================================================");
}

runBalanceCheck();

