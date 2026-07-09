/**
 * MonsterBalanceCheck_v4.js
 * Raw monster data balance audit and optional one-shot DB tuner.
 *
 * Runtime combat never uses this file. The script reads Monsters.js, compares
 * raw DB stats against audit targets, and can optionally write suggested
 * hp/maxHp/attack/defense values back to Monsters.js with --write.
 */

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const MONSTER_DB_PATH = path.join(__dirname, '..', 'src', 'js', 'data', 'Monsters.js');

const PLAYER_CONFIG = {
    baseHp: 100,
    hpPerLevel: 20,
    baseAtk: 5,
    baseDef: 2,
    baseAttackSpeed: 1.0,
    unarmedAttackSpeed: 0.9,
    unarmedDamageMultiplier: 0.86,
    expectedGear: {
        normal: { atkPerLevel: 1.45, atkFlat: 4, defPerLevel: 0.36, defFlat: 1 },
        elite: { atkPerLevel: 1.7, atkFlat: 6, defPerLevel: 0.48, defFlat: 2 },
        boss: { atkPerLevel: 1.95, atkFlat: 8, defPerLevel: 0.58, defFlat: 3 }
    }
};

const CHALLENGE_TARGETS = {
    normal: {
        minRatio: 0.45,
        maxRatio: 1.15,
        targetRatio: 0.75,
        minTtk: 7,
        targetTtk: 10,
        targetTtd: 13
    },
    elite: {
        minRatio: 0.85,
        maxRatio: 1.75,
        targetRatio: 1.2,
        minTtk: 12,
        targetTtk: 16,
        targetTtd: 13
    },
    boss: {
        minRatio: 1.25,
        maxRatio: 3.0,
        targetRatio: 1.9,
        minTtk: 20,
        targetTtk: 28,
        targetTtd: 15
    }
};

const UNDERLEVEL_GATES = [
    {
        id: 'lv1_unarmed_vs_lv5_plus',
        label: 'Lv1 unarmed must not farm Lv5+ route monsters',
        monsterMinLevel: 5,
        monsterMaxLevel: 12,
        player: getUnarmedPlayerStats(1),
        minRatio: 2.0
    }
];

const MonsterDatabaseLocal = {
    slime: { id: 'slime', name: 'Fallback Slime', level: 1, hp: 40, maxHp: 40, attack: 5, defense: 0, attackSpeed: 1, type: 'normal' },
    goblin: { id: 'goblin', name: 'Fallback Goblin', level: 2, hp: 60, maxHp: 60, attack: 18, defense: 2, attackSpeed: 1, type: 'normal' },
    lich: { id: 'lich', name: 'Fallback Lich', level: 10, hp: 800, maxHp: 800, attack: 55, defense: 15, attackSpeed: 0.85, type: 'boss' },
    shadow_commander: { id: 'shadow_commander', name: 'Fallback Shadow Commander', level: 14, hp: 1200, maxHp: 1200, attack: 80, defense: 25, attackSpeed: 1, type: 'boss' },
    void_king: { id: 'void_king', name: 'Fallback Void King', level: 30, hp: 3500, maxHp: 3500, attack: 70, defense: 45, attackSpeed: 2.2, type: 'boss' },
    demon: { id: 'demon', name: 'Fallback Demon', level: 30, hp: 1200, maxHp: 1200, attack: 90, defense: 40, attackSpeed: 1, type: 'elite' }
};

function parseArgs(argv = process.argv.slice(2)) {
    const options = {
        json: false,
        write: false,
        reportOnly: false,
        ids: null,
        includeTooLethal: false
    };

    for (const arg of argv) {
        if (arg === '--json') options.json = true;
        else if (arg === '--write') options.write = true;
        else if (arg === '--report-only') options.reportOnly = true;
        else if (arg === '--include-too-lethal') options.includeTooLethal = true;
        else if (arg.startsWith('--ids=')) {
            options.ids = new Set(arg.slice('--ids='.length).split(',').map(id => id.trim()).filter(Boolean));
        }
    }

    return options;
}

function getMonsterRank(monster = {}) {
    const type = String(monster.type || monster.rank || monster.combatRank || '').toLowerCase();
    if (monster.isBoss || type === 'boss' || type === 'world_boss') return 'boss';
    if (monster.isElite || type === 'elite') return 'elite';
    return 'normal';
}

function getExpectedPlayerStats(level, rank = 'normal') {
    const safeLevel = Math.max(1, Number(level) || 1);
    const model = PLAYER_CONFIG.expectedGear[rank] || PLAYER_CONFIG.expectedGear.normal;

    return {
        label: `expected_${rank}_gear`,
        hp: Math.floor(PLAYER_CONFIG.baseHp + safeLevel * PLAYER_CONFIG.hpPerLevel),
        attack: Math.floor(PLAYER_CONFIG.baseAtk + model.atkFlat + safeLevel * model.atkPerLevel),
        defense: Math.floor(PLAYER_CONFIG.baseDef + model.defFlat + safeLevel * model.defPerLevel),
        attackSpeed: PLAYER_CONFIG.baseAttackSpeed
    };
}

function getUnarmedPlayerStats(level = 1) {
    const safeLevel = Math.max(1, Number(level) || 1);
    return {
        label: `lv${safeLevel}_unarmed`,
        hp: Math.floor(PLAYER_CONFIG.baseHp + safeLevel * PLAYER_CONFIG.hpPerLevel),
        attack: Math.max(1, Math.floor(PLAYER_CONFIG.baseAtk * PLAYER_CONFIG.unarmedDamageMultiplier)),
        defense: PLAYER_CONFIG.baseDef,
        attackSpeed: PLAYER_CONFIG.unarmedAttackSpeed
    };
}

function cloneMonster(monster = {}, id = '') {
    const maxHp = Number(monster.maxHp ?? monster.hp ?? monster.currentHp) || 1;
    const hp = Number(monster.hp ?? monster.currentHp ?? maxHp) || maxHp;
    const attack = Number(monster.attack ?? monster.atk) || 0;
    const defense = Number(monster.defense ?? monster.def) || 0;

    return {
        ...monster,
        id: monster.id || id,
        name: monster.name || monster.id || id || 'Unknown',
        level: Math.max(1, Number(monster.level) || 1),
        maxHp,
        hp,
        currentHp: hp,
        attack,
        atk: attack,
        defense,
        def: defense,
        attackSpeed: Number(monster.attackSpeed ?? monster.attack_speed) || 1,
        type: monster.type || monster.rank || (monster.isBoss ? 'boss' : monster.isElite ? 'elite' : 'normal')
    };
}

function prepareMonsterForAudit(monster, id) {
    const clone = cloneMonster(monster, id);
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

    let grade = 'B';
    if (powerRatio > 3) grade = 'SSS';
    else if (powerRatio > 2) grade = 'S';
    else if (powerRatio > 1.5) grade = 'A';
    else if (powerRatio > 0.8) grade = 'B';
    else if (powerRatio > 0.5) grade = 'C';
    else grade = 'D';

    return {
        playerHitDamage,
        monsterHitDamage,
        playerDps,
        monsterDps,
        timeToKill,
        timeToDie,
        powerRatio,
        grade
    };
}

function getAdvice(result, monster) {
    const rank = getMonsterRank(monster);
    const target = CHALLENGE_TARGETS[rank] || CHALLENGE_TARGETS.normal;

    if (result.powerRatio < target.minRatio) return `Too soft for ${rank}`;
    if (result.powerRatio > target.maxRatio) return `Too lethal for ${rank}`;
    if (result.timeToKill < target.minTtk) return 'Dies too quickly';
    if (result.timeToDie < 3) return 'Burst risk';
    if (result.timeToKill > 40) return 'May be spongey';
    return 'OK';
}

function recommendMonsterStats(monster, player, result, advice) {
    const rank = getMonsterRank(monster);
    const target = CHALLENGE_TARGETS[rank] || CHALLENGE_TARGETS.normal;
    const recommendation = {
        hp: monster.hp,
        maxHp: monster.maxHp,
        attack: monster.attack,
        defense: monster.defense
    };

    if (advice === 'OK') return recommendation;

    if (advice.includes('Too soft') || advice === 'Dies too quickly') {
        const targetHp = Math.ceil(result.playerDps * target.targetTtk);
        const targetMonsterDps = player.hp / Math.max(1, target.targetTtd);
        const targetAttack = Math.ceil(targetMonsterDps / Math.max(0.1, monster.attackSpeed) + player.defense);
        recommendation.hp = Math.max(monster.hp, targetHp);
        recommendation.maxHp = Math.max(monster.maxHp, recommendation.hp);
        recommendation.attack = Math.max(monster.attack, targetAttack);
        return recommendation;
    }

    if (advice.includes('Too lethal')) {
        const targetMonsterDps = player.hp / Math.max(1, target.targetTtd);
        const targetAttack = Math.max(1, Math.floor(targetMonsterDps / Math.max(0.1, monster.attackSpeed) + player.defense));
        recommendation.attack = Math.min(monster.attack, targetAttack);
        return recommendation;
    }

    return recommendation;
}

function pad(value, width) {
    return String(value).padEnd(width);
}

function formatNumber(value, digits = 1) {
    return Number(value).toFixed(digits);
}

async function loadRuntimeModules() {
    const monstersUrl = pathToFileURL(MONSTER_DB_PATH).href;

    try {
        const monsterModule = await import(monstersUrl);

        if (!monsterModule.MonsterDatabase) {
            throw new Error('MonsterDatabase export not found');
        }

        return {
            source: 'runtime',
            monsterDatabase: monsterModule.MonsterDatabase
        };
    } catch (error) {
        console.warn(`[warn] Runtime combat modules unavailable; using fallback sample data. ${error.message}`);
        return {
            source: 'fallback',
            monsterDatabase: MonsterDatabaseLocal
        };
    }
}

function runUnderlevelGateChecks(rows) {
    const issues = [];

    for (const gate of UNDERLEVEL_GATES) {
        for (const row of rows) {
            const monster = row.monster;
            if (getMonsterRank(monster) !== 'normal') continue;
            if (monster.level < gate.monsterMinLevel || monster.level > gate.monsterMaxLevel) continue;

            const result = simulateBattle(gate.player, monster);
            const passed = result.powerRatio >= gate.minRatio;
            if (!passed) {
                issues.push({
                    gateId: gate.id,
                    label: gate.label,
                    monsterId: monster.id,
                    monsterName: monster.name,
                    monsterLevel: monster.level,
                    ratio: result.powerRatio,
                    expectedMinRatio: gate.minRatio,
                    player: gate.player,
                    result
                });
            }
        }
    }

    return issues;
}

function runBalanceCheck(monsterDatabase, options = {}) {
    const entries = Object.entries(monsterDatabase || {});
    const rows = [];
    const flagged = [];

    for (const [id, monsterData] of entries) {
        const monster = prepareMonsterForAudit(monsterData, id);
        const rank = getMonsterRank(monster);
        const player = getExpectedPlayerStats(monster.level, rank);
        const result = simulateBattle(player, monster);
        const advice = getAdvice(result, monster);
        const recommendation = recommendMonsterStats(monster, player, result, advice);
        const row = {
            id,
            monster,
            rank,
            player,
            result,
            advice,
            recommendation
        };
        rows.push(row);
        if (advice !== 'OK') flagged.push(row);
    }

    const underlevelIssues = runUnderlevelGateChecks(rows);

    if (!options.json) {
        printReport(rows, flagged, underlevelIssues, options);
    }

    return { rows, flagged, underlevelIssues };
}

function printReport(rows, flagged, underlevelIssues, options = {}) {
    console.log('='.repeat(150));
    console.log('Monster Balance Check v4.2 - DB-only audit');
    console.log(`Source: ${options.source || 'unknown'} | Monsters: ${rows.length} | Runtime balance: off | Write mode: ${options.write ? 'on' : 'off'}`);
    console.log('='.repeat(150));
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
        pad('Advice', 20),
        'Suggested DB'
    ].join(' | '));
    console.log('-'.repeat(150));

    for (const row of rows) {
        const { monster, player, result, recommendation } = row;
        const suggested = row.advice === 'OK'
            ? '-'
            : `hp ${monster.hp}->${recommendation.hp}, atk ${monster.attack}->${recommendation.attack}, def ${monster.defense}->${recommendation.defense}`;
        console.log([
            pad(monster.level, 3),
            pad(row.rank, 6),
            pad(String(monster.name).slice(0, 28), 28),
            pad(monster.hp, 7),
            pad(`${monster.attack}/${monster.defense}`, 10),
            pad(player.hp, 6),
            pad(`${player.attack}/${player.defense}`, 10),
            pad(`${Math.floor(result.playerDps)}/${Math.floor(result.monsterDps)}`, 13),
            pad(formatNumber(result.timeToKill), 6),
            pad(formatNumber(result.timeToDie), 6),
            pad(`${result.grade} ${formatNumber(result.powerRatio, 2)}`, 7),
            pad(row.advice, 20),
            suggested
        ].join(' | '));
    }

    console.log('-'.repeat(150));
    console.log(`Flagged: ${flagged.length}/${rows.length}`);
    if (underlevelIssues.length > 0) {
        console.log('');
        console.log('Underlevel hard gate issues:');
        for (const issue of underlevelIssues) {
            console.log(`- ${issue.monsterId}: ${issue.label}; ratio ${formatNumber(issue.ratio, 2)} < ${issue.expectedMinRatio}`);
        }
    } else {
        console.log('Underlevel hard gates: OK');
    }

    if (flagged.length > 0) {
        console.log('');
        console.log('Top DB follow-ups:');
        for (const row of flagged.slice(0, 12)) {
            const rec = row.recommendation;
            console.log(`- ${row.monster.id}: ${row.advice}; ratio ${formatNumber(row.result.powerRatio, 2)}, DB hp ${row.monster.hp}->${rec.hp}, atk ${row.monster.attack}->${rec.attack}`);
        }
    }
    console.log('='.repeat(150));
}

function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findObjectBlock(source, id) {
    const pattern = new RegExp(`(^|\\n)(\\s*)${escapeRegExp(id)}\\s*:\\s*{`);
    const match = pattern.exec(source);
    if (!match) return null;

    const openIndex = source.indexOf('{', match.index);
    let depth = 0;
    for (let index = openIndex; index < source.length; index += 1) {
        const char = source[index];
        if (char === '{') depth += 1;
        else if (char === '}') {
            depth -= 1;
            if (depth === 0) {
                return {
                    start: match.index + (match[1] ? match[1].length : 0),
                    end: index + 1,
                    text: source.slice(match.index + (match[1] ? match[1].length : 0), index + 1)
                };
            }
        }
    }

    return null;
}

function replaceNumberProperty(block, key, value) {
    const number = Math.max(0, Math.round(Number(value) || 0));
    const pattern = new RegExp(`(${key}\\s*:\\s*)\\d+`);
    if (!pattern.test(block)) return block;
    return block.replace(pattern, `$1${number}`);
}

function applyDbRecommendations(rows, options = {}) {
    const ids = options.ids;
    const source = fs.readFileSync(MONSTER_DB_PATH, 'utf8');
    let updated = source;
    const applied = [];
    const skipped = [];

    for (const row of rows) {
        if (row.advice === 'OK') continue;
        if (!options.includeTooLethal && row.advice.includes('Too lethal')) continue;
        if (ids && !ids.has(row.id)) continue;

        const block = findObjectBlock(updated, row.id);
        if (!block) {
            skipped.push({ id: row.id, reason: 'block not found' });
            continue;
        }

        let replacement = block.text;
        replacement = replaceNumberProperty(replacement, 'hp', row.recommendation.hp);
        replacement = replaceNumberProperty(replacement, 'maxHp', row.recommendation.maxHp);
        replacement = replaceNumberProperty(replacement, 'attack', row.recommendation.attack);
        replacement = replaceNumberProperty(replacement, 'defense', row.recommendation.defense);

        if (replacement === block.text) {
            skipped.push({ id: row.id, reason: 'no numeric property changed' });
            continue;
        }

        updated = updated.slice(0, block.start) + replacement + updated.slice(block.end);
        applied.push({
            id: row.id,
            advice: row.advice,
            before: {
                hp: row.monster.hp,
                attack: row.monster.attack,
                defense: row.monster.defense
            },
            after: row.recommendation
        });
    }

    if (applied.length > 0) fs.writeFileSync(MONSTER_DB_PATH, updated, 'utf8');
    return { applied, skipped };
}

async function main() {
    const options = parseArgs();
    const modules = await loadRuntimeModules();
    const report = runBalanceCheck(modules.monsterDatabase, { ...modules, ...options });

    let writeResult = null;
    if (options.write) {
        writeResult = applyDbRecommendations(report.rows, options);
        if (!options.json) {
            console.log(`DB write applied: ${writeResult.applied.length}`);
            for (const row of writeResult.applied.slice(0, 20)) {
                console.log(`- ${row.id}: hp ${row.before.hp}->${row.after.hp}, atk ${row.before.attack}->${row.after.attack}, def ${row.before.defense}->${row.after.defense}`);
            }
            if (writeResult.skipped.length > 0) console.log(`Skipped: ${writeResult.skipped.length}`);
        }
    }

    if (options.json) {
        console.log(JSON.stringify({
            source: modules.source,
            summary: {
                monsters: report.rows.length,
                flagged: report.flagged.length,
                underlevelIssues: report.underlevelIssues.length,
                passed: report.flagged.length === 0 && report.underlevelIssues.length === 0
            },
            flagged: report.flagged,
            underlevelIssues: report.underlevelIssues,
            writeResult
        }, null, 2));
    }

    const hasValidationIssues = report.flagged.length > 0 || report.underlevelIssues.length > 0;
    if (hasValidationIssues && !options.reportOnly) process.exitCode = 1;
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
