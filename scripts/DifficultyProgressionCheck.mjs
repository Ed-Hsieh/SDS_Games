/**
 * Validates the fixed first-run monster curve against the current rhythm-combat
 * damage model and the real equipment available in each chapter.
 */

import { MonsterDatabase } from '../src/js/data/Monsters.js';
import { EquipmentDatabase } from '../src/js/data/Equipment.js';
import { RewardItemDatabase } from '../src/js/data/RewardItems.js';
import { RecipeDatabase } from '../src/js/data/Recipes.js';
import { SeriesRecipeDatabase } from '../src/js/data/RecipeSeries.js';
import {
    FirstRunMonsterFixedLevels,
    FirstRunMonsterRosters
} from '../src/js/data/MonsterEcology.js';
import {
    FirstRunMonsterCombatBalance,
    getLevelExperienceRequirement
} from '../src/js/data/MonsterProgressionBalance.js';
import { getMonsterCombatRank } from '../src/js/data/CombatBalance.js';
import { buildMonsterCombatActions } from '../src/js/data/MonsterCombatProfiles.js';
import {
    calculateMaxHp,
    getAttackSpeed,
    getTotalAtk,
    getTotalDef
} from '../src/js/models/CharacterLogic.js';

const failures = [];
const check = (condition, message) => {
    if (!condition) failures.push(message);
};

const mainBossIds = new Set(Object.values(FirstRunMonsterRosters).map(roster => roster.mandatoryBossId));
const routeBossIds = new Set(Object.values(FirstRunMonsterRosters).flatMap(roster => roster.optionalBossIds));
const formalIds = [...new Set(Object.values(FirstRunMonsterRosters).flatMap(roster => roster.monsterIds))];

function findItem(itemId) {
    if (!itemId) return null;
    if (EquipmentDatabase[itemId]) return EquipmentDatabase[itemId];
    if (RewardItemDatabase[itemId]) return RewardItemDatabase[itemId];
    const seriesResult = Object.values(SeriesRecipeDatabase).find(recipe => recipe.result?.id === itemId)?.result;
    if (seriesResult) return seriesResult;
    return Object.values(RecipeDatabase).find(recipe => recipe.result?.id === itemId)?.result || null;
}

function createPlayer(level, [weaponId = null, armorId = null, accessoryId = null]) {
    const character = {
        level,
        baseAtk: 5,
        baseDef: 2,
        equipment: {
            weapon: findItem(weaponId),
            armor: findItem(armorId),
            accessory: findItem(accessoryId)
        },
        activeBuffs: [],
        unlockedPassiveEffectIds: [],
        equippedPassiveEffectIds: []
    };
    check(!weaponId || Boolean(character.equipment.weapon), `Missing scenario weapon ${weaponId}`);
    check(!armorId || Boolean(character.equipment.armor), `Missing scenario armor ${armorId}`);
    check(!accessoryId || Boolean(character.equipment.accessory), `Missing scenario accessory ${accessoryId}`);
    return character;
}

const playerScenarios = Object.freeze({
    starter: createPlayer(1, ['starter_sword']),
    1: createPlayer(8, ['wolf_fang_blade', 'wolf_pelt_armor', 'crafted_goblin_trickster_charm']),
    2: createPlayer(18, ['crafted_bone_series_sword', 'forest_guardian_crown', 'crafted_blood_moon_pendant']),
    3: createPlayer(28, ['crafted_expedition_series_sword', 'shadow_armor_drop', 'shadow_badge']),
    4: createPlayer(38, ['crafted_runic_series_sword', 'crystal_shield', 'titan_gauntlet']),
    5: createPlayer(48, ['crafted_fourfold_series_sword', 'frostwolf_mantle', 'stormfeather_talisman']),
    6: createPlayer(58, ['crafted_sealstone_series_sword', 'dragonseal_patrol_plate', 'stormfeather_talisman']),
    7: createPlayer(68, ['crafted_helliron_series_sword', 'demon_lord_armor', 'elder_dragon_fang_badge'])
});

function estimateMatchup(character, monsterId) {
    const monster = MonsterDatabase[monsterId];
    const playerAttack = getTotalAtk(character);
    const playerDefense = getTotalDef(character);
    const playerHp = calculateMaxHp(character);
    const playerDamage = Math.max(1, Math.round(playerAttack - monster.defense * 0.42));
    const playerHits = Math.ceil(monster.maxHp / playerDamage);
    const timeToKill = playerHits / Math.max(0.1, getAttackSpeed(character));
    const basicAttack = buildMonsterCombatActions(monster, playerDefense)[0];
    const attackInterval = basicAttack.telegraph + basicAttack.impactDelay + basicAttack.recovery;
    const firstImpact = 1.2 + basicAttack.telegraph + basicAttack.impactDelay;
    const monsterHits = timeToKill < firstImpact
        ? 0
        : 1 + Math.floor((timeToKill - firstImpact) / attackInterval);
    const incomingDamage = monsterHits * basicAttack.damage;

    return {
        monsterId,
        playerAttack,
        playerDefense,
        playerHp,
        playerDamage,
        playerHits,
        timeToKill,
        monsterHitDamage: basicAttack.damage,
        monsterHits,
        incomingDamage,
        remainingHp: playerHp - incomingDamage
    };
}

for (const monsterId of formalIds) {
    const monster = MonsterDatabase[monsterId];
    const balance = FirstRunMonsterCombatBalance[monsterId];
    check(Boolean(monster), `Missing formal monster ${monsterId}`);
    check(Boolean(balance), `Missing combat balance for ${monsterId}`);
    if (!monster || !balance) continue;
    check(monster.level === FirstRunMonsterFixedLevels[monsterId], `${monsterId} lost its fixed level`);
    for (const key of ['maxHp', 'attack', 'defense', 'attackSpeed', 'exp', 'gold']) {
        check(monster[key] === balance[key], `${monsterId}.${key} does not match the authoritative balance table`);
    }
    check(monster.hp === monster.maxHp, `${monsterId} does not start at full health`);

    const requirement = getLevelExperienceRequirement(monster.level);
    const ratio = monster.exp / requirement;
    const rank = getMonsterCombatRank(monster);
    if (rank === 'normal') check(ratio >= 0.10 && ratio <= 0.22, `${monsterId} normal EXP ratio ${ratio.toFixed(2)} is outside 0.10..0.22`);
    if (rank === 'elite') check(ratio >= 0.24 && ratio <= 0.40, `${monsterId} elite EXP ratio ${ratio.toFixed(2)} is outside 0.24..0.40`);
    if (routeBossIds.has(monsterId)) check(ratio >= 0.40 && ratio <= 0.60, `${monsterId} route Boss EXP ratio ${ratio.toFixed(2)} is outside 0.40..0.60`);
    if (mainBossIds.has(monsterId)) check(ratio >= 0.60 && ratio <= 0.90, `${monsterId} main Boss EXP ratio ${ratio.toFixed(2)} is outside 0.60..0.90`);
}

let previousRequirement = 0;
for (let level = 1; level <= 70; level += 1) {
    const requirement = getLevelExperienceRequirement(level);
    check(requirement > previousRequirement, `Level ${level} EXP requirement is not increasing`);
    previousRequirement = requirement;
}
check(getLevelExperienceRequirement(1) === 112, 'Level 1 EXP requirement drifted');
check(getLevelExperienceRequirement(70) <= 22000, 'Level 70 EXP requirement returned to an unreachable exponential value');

for (const monsterId of ['slime', 'goblin', 'giant_rat', 'wild_wolf']) {
    const result = estimateMatchup(playerScenarios.starter, monsterId);
    check(result.playerHits <= 3, `Starter weapon takes ${result.playerHits} hits against ${monsterId}`);
    check(result.incomingDamage <= 20, `${monsterId} deals too much damage during opening preparation`);
}

for (const monsterId of ['poison_spider', 'stone_golem_mini', 'treant', 'ambush_mantis']) {
    const result = estimateMatchup(playerScenarios[1], monsterId);
    check(result.remainingHp > result.playerHp * 0.45, `${monsterId} is too punishing for Chapter 1 preparation gear`);
}

const bossRows = [];
let previousChapterAverage = null;
for (let chapter = 1; chapter <= 7; chapter += 1) {
    const bossId = FirstRunMonsterRosters[chapter].mandatoryBossId;
    const result = estimateMatchup(playerScenarios[chapter], bossId);
    bossRows.push({ chapter, ...result });
    check(result.playerHits >= 12 && result.playerHits <= 38, `Chapter ${chapter} Boss requires ${result.playerHits} clean hits`);
    check(result.remainingHp > 0, `Chapter ${chapter} baseline gear cannot survive the Boss basic pattern`);
    if (chapter >= 2) {
        check(result.remainingHp <= result.playerHp * 0.60, `Chapter ${chapter} Boss basic pattern leaves too much health pressure-free`);
    }
}

for (let chapter = 1; chapter <= 7; chapter += 1) {
    const roster = FirstRunMonsterRosters[chapter];
    const nativeNormals = roster.monsterIds
        .map(monsterId => MonsterDatabase[monsterId])
        .filter(monster => monster.level >= roster.levelBand[0]
            && monster.level <= roster.levelBand[1]
            && getMonsterCombatRank(monster) === 'normal');
    check(nativeNormals.length >= 2, `Chapter ${chapter} has too few native normal monsters for curve validation`);
    const averageHp = nativeNormals.reduce((sum, monster) => sum + monster.maxHp, 0) / nativeNormals.length;
    const averageAttack = nativeNormals.reduce((sum, monster) => sum + monster.attack, 0) / nativeNormals.length;
    if (previousChapterAverage) {
        check(averageHp > previousChapterAverage.hp, `Chapter ${chapter} normal HP average does not exceed Chapter ${chapter - 1}`);
        check(averageAttack > previousChapterAverage.attack, `Chapter ${chapter} normal attack average does not exceed Chapter ${chapter - 1}`);
    }
    previousChapterAverage = { hp: averageHp, attack: averageAttack };
}

if (failures.length) {
    console.error(`Difficulty progression check found ${failures.length} failure(s):`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
}

console.log('Difficulty progression check passed.');
console.log(`Formal monsters checked: ${formalIds.length}`);
console.log(`EXP requirement: Lv1 ${getLevelExperienceRequirement(1)} -> Lv70 ${getLevelExperienceRequirement(70)}`);
for (const row of bossRows) {
    console.log(`Chapter ${row.chapter} Boss ${row.monsterId}: ${row.playerHits} clean hits, ${row.remainingHp}/${row.playerHp} HP after basic pressure`);
}
