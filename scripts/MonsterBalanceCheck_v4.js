/**
 * MonsterBalanceCheck_v4.js
 * Runtime-aware monster balance audit.
 *
 * This script intentionally mirrors the live combat entry path:
 * Monsters.js -> CombatBalance.js -> audit simulation.
 */

const path = require('path');
const { pathToFileURL } = require('url');

const PLAYER_CONFIG = {
    baseHp: 100,
    hpPerLevel: 20,
    baseAtk: 5,
    atkPerLevel: 4,
    defMultiplier: 1.5,
    baseAtkSpeed: 1.2
};

const MonsterDatabaseLocal = {
    slime: { id: 'slime', name: 'Fallback Slime', level: 1, hp: 40, maxHp: 40, attack: 5, defense: 0, attackSpeed: 1, type: 'normal' },
    goblin: { id: 'goblin', name: 'Fallback Goblin', level: 2, hp: 60, maxHp: 60, attack: 18, defense: 2, attackSpeed: 1, type: 'normal' },
    lich: { id: 'lich', name: 'Fallback Lich', level: 10, hp: 800, maxHp: 800, attack: 55, defense: 15, attackSpeed: 0.85, type: 'boss' },
    shadow_commander: { id: 'shadow_commander', name: 'Fallback Shadow Commander', level: 14, hp: 1200, maxHp: 1200, attack: 80, defense: 25, attackSpeed: 1, type: 'boss' },
    void_king: { id: 'void_king', name: 'Fallback Void King', level: 30, hp: 3500, maxHp: 3500, attack: 70, defense: 45, attackSpeed: 2.2, type: 'boss' },
    demon: { id: 'demon', name: 'Fallback Demon', level: 30, hp: 1200, maxHp: 1200, attack: 90, defense: 40, attackSpeed: 1, type: 'elite' }
};

function getStandardPlayerStats(level) {
    const safeLevel = Math.max(1, Number(level) || 1);
    return {
        hp: Math.floor(PLAYER_CONFIG.baseHp + (safeLevel * PLAYER_CONFIG.hpPerLevel)),
        attack: Math.floor(PLAYER_CONFIG.baseAtk + (safeLevel * PLAYER_CONFIG.atkPerLevel)),
        defense: Math.floor(safeLevel * PLAYER_CONFIG.defMultiplier),
        attackSpeed: PLAYER_CONFIG.baseAtkSpeed
    };
}

function getMonsterRank(monster = {}) {
    const type = String(monster.type || monster.rank || monster.combatRank || '').toLowerCase();
    if (monster.isBoss || type === 'boss' || type === 'world_boss') return 'boss';
    if (monster.isElite || type === 'elite') return 'elite';
    return 'normal';
}

function cloneMonster(monster = {}, id = '') {
    const maxHp = Number(monster.maxHp ?? monster.hp ?? monster.currentHp) || 1;
    const hp = Number(monster.hp ?? monster.currentHp ?? maxHp) || maxHp;
    return {
        ...monster,
        id: monster.id || id,
        name: monster.name || monster.id || id || 'Unknown',
        level: Math.max(1, Number(monster.level) || 1),
        maxHp,
        hp,
        currentHp: hp,
        attack: Number(monster.attack ?? monster.atk) || 0,
        atk: Number(monster.attack ?? monster.atk) || 0,
        defense: Number(monster.defense ?? monster.def) || 0,
        def: Number(monster.defense ?? monster.def) || 0,
        attackSpeed: Number(monster.attackSpeed ?? monster.attack_speed) || 1,
        type: monster.type || monster.rank || (monster.isBoss ? 'boss' : monster.isElite ? 'elite' : 'normal')
    };
}

function prepareMonsterForAudit(monster, id, applyMonsterCombatBalance) {
    const clone = cloneMonster(monster, id);
    if (typeof applyMonsterCombatBalance === 'function') {
        applyMonsterCombatBalance(clone);
    }
    clone.hp = Number(clone.hp ?? clone.currentHp ?? clone.maxHp) || 1;
    clone.maxHp = Number(clone.maxHp ?? clone.hp) || clone.hp;
    clone.attack = Number(clone.attack ?? clone.atk) || 0;
    clone.defense = Number(clone.defense ?? clone.def) || 0;
    clone.attackSpeed = Number(clone.attackSpeed ?? clone.attack_speed) || 1;
    return clone;
}

function simulateBattle(player, monster) {
    const playerHitDamage = Math.max(1, player.attack - monster.defense);
    const playerDps = playerHitDamage * player.attackSpeed;
    const timeToKill = monster.hp / playerDps;

    const monsterHitDamage = Math.max(1, monster.attack - player.defense);
    const monsterDps = monsterHitDamage * monster.attackSpeed;
    const timeToDie = player.hp / monsterDps;
    const powerRatio = timeToKill / timeToDie;

    let rank = 'B';
    if (powerRatio > 3) rank = 'SSS';
    else if (powerRatio > 2) rank = 'S';
    else if (powerRatio > 1.5) rank = 'A';
    else if (powerRatio > 0.8) rank = 'B';
    else if (powerRatio > 0.5) rank = 'C';
    else rank = 'D';

    return {
        playerHitDamage,
        monsterHitDamage,
        playerDps,
        monsterDps,
        timeToKill,
        timeToDie,
        powerRatio,
        rank
    };
}

function getAdvice(result, monster) {
    const rank = getMonsterRank(monster);
    if (rank === 'boss' && result.powerRatio < 0.8) return 'Boss feels too soft';
    if (rank === 'elite' && result.powerRatio < 0.55) return 'Elite feels too soft';
    if (rank === 'normal' && result.powerRatio < 0.35) return 'Normal mob may be too soft';
    if (result.powerRatio > 2.5) return 'May be too lethal';
    if (result.timeToDie < 3) return 'Burst risk';
    if (result.timeToKill > 35) return 'May be spongey';
    return 'OK';
}

function pad(value, width) {
    return String(value).padEnd(width);
}

function formatNumber(value, digits = 1) {
    return Number(value).toFixed(digits);
}

async function loadRuntimeModules() {
    const monstersUrl = pathToFileURL(path.join(__dirname, '..', 'src', 'js', 'data', 'Monsters.js')).href;
    const balanceUrl = pathToFileURL(path.join(__dirname, '..', 'src', 'js', 'data', 'CombatBalance.js')).href;

    try {
        const [monsterModule, balanceModule] = await Promise.all([
            import(monstersUrl),
            import(balanceUrl)
        ]);

        if (!monsterModule.MonsterDatabase) {
            throw new Error('MonsterDatabase export not found');
        }

        return {
            source: 'runtime',
            monsterDatabase: monsterModule.MonsterDatabase,
            applyMonsterCombatBalance: balanceModule.applyMonsterCombatBalance
        };
    } catch (error) {
        console.warn(`[warn] Runtime combat modules unavailable; using fallback sample data. ${error.message}`);
        return {
            source: 'fallback',
            monsterDatabase: MonsterDatabaseLocal,
            applyMonsterCombatBalance: null
        };
    }
}

function runBalanceCheck(monsterDatabase, options = {}) {
    const entries = Object.entries(monsterDatabase || {});
    const applyMonsterCombatBalance = options.applyMonsterCombatBalance;
    const rows = [];
    const flagged = [];

    console.log('='.repeat(140));
    console.log('Monster Balance Check v4.1 - runtime CombatBalance aware');
    console.log(`Source: ${options.source || 'unknown'} | Monsters: ${entries.length} | Runtime balance: ${typeof applyMonsterCombatBalance === 'function' ? 'on' : 'off'}`);
    console.log('='.repeat(140));
    console.log([
        pad('Lv', 3),
        pad('Rank', 6),
        pad('Monster', 28),
        pad('M HP', 7),
        pad('M Atk/Def', 10),
        pad('P HP', 6),
        pad('P Atk/Def', 10),
        pad('DPS P/M', 13),
        pad('TTK', 6),
        pad('TTD', 6),
        pad('Ratio', 7),
        'Advice'
    ].join(' | '));
    console.log('-'.repeat(140));

    for (const [id, monsterData] of entries) {
        const monster = prepareMonsterForAudit(monsterData, id, applyMonsterCombatBalance);
        const player = getStandardPlayerStats(monster.level);
        const result = simulateBattle(player, monster);
        const advice = getAdvice(result, monster);
        const row = {
            id,
            monster,
            player,
            result,
            advice
        };
        rows.push(row);
        if (advice !== 'OK') flagged.push(row);

        console.log([
            pad(monster.level, 3),
            pad(getMonsterRank(monster), 6),
            pad(String(monster.name).slice(0, 28), 28),
            pad(monster.hp, 7),
            pad(`${monster.attack}/${monster.defense}`, 10),
            pad(player.hp, 6),
            pad(`${player.attack}/${player.defense}`, 10),
            pad(`${Math.floor(result.playerDps)}/${Math.floor(result.monsterDps)}`, 13),
            pad(formatNumber(result.timeToKill), 6),
            pad(formatNumber(result.timeToDie), 6),
            pad(`${result.rank} ${formatNumber(result.powerRatio, 2)}`, 7),
            advice
        ].join(' | '));
    }

    console.log('-'.repeat(140));
    console.log(`Flagged: ${flagged.length}/${rows.length}`);
    if (flagged.length > 0) {
        console.log('Top follow-ups:');
        for (const row of flagged.slice(0, 12)) {
            console.log(`- ${row.monster.id}: ${row.advice} (ratio ${formatNumber(row.result.powerRatio, 2)}, TTK ${formatNumber(row.result.timeToKill)}s, TTD ${formatNumber(row.result.timeToDie)}s)`);
        }
    }
    console.log('='.repeat(140));
    return { rows, flagged };
}

async function main() {
    const modules = await loadRuntimeModules();
    runBalanceCheck(modules.monsterDatabase, modules);
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
