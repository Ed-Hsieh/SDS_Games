/**
 * DifficultyProgressionCheck.mjs
 * Validates the intended early/mid/late pressure curve with deterministic samples.
 */

import { MonsterDatabase } from '../src/js/data/Monsters.js';
import { EquipmentDatabase } from '../src/js/data/Equipment.js';
import { RecipeDatabase } from '../src/js/data/Recipes.js';
import { ObjectiveType, QuestDatabase } from '../src/js/data/Quests.js';
import { applyMonsterCombatBalance, getMonsterCombatRank } from '../src/js/data/CombatBalance.js';
import {
    calculateMaxExp,
    getAffixHpBonus,
    getAttackSpeed,
    getCritChance,
    getCritDamage,
    getTotalAtk,
    getTotalDef
} from '../src/js/models/CharacterLogic.js';
import { getEquipmentEffectTotals } from '../src/js/managers/EquipmentEffectResolver.js';
import { generateDrops } from '../src/js/managers/DropManager.js';

const RUNS = 1000;

const EARLY_MONSTER_POOL = [
    { id: 'slime', weight: 38 },
    { id: 'giant_rat', weight: 20 },
    { id: 'goblin', weight: 18 },
    { id: 'wild_wolf', weight: 16 },
    { id: 'poison_spider', weight: 8 }
];

const RARITY_SCORE = {
    common: 0,
    uncommon: 8,
    rare: 18,
    epic: 32,
    legendary: 55
};

const clone = value => JSON.parse(JSON.stringify(value));

function createRng(seed) {
    let state = seed >>> 0;
    return () => {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 2 ** 32;
    };
}

function pickWeighted(rng, entries) {
    const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
    let roll = rng() * total;
    for (const entry of entries) {
        roll -= entry.weight;
        if (roll <= 0) return entry.id;
    }
    return entries[entries.length - 1]?.id;
}

function ensureDurability(item) {
    item.maxDurability = item.maxDurability ?? item.durability ?? 18;
    item.durability = item.durability ?? item.maxDurability;
    return item;
}

function createEquipment(itemId) {
    const item = EquipmentDatabase[itemId];
    if (!item) throw new Error(`Unknown equipment: ${itemId}`);
    return ensureDurability(clone(item));
}

function createRecipeResult(recipeId) {
    const recipe = RecipeDatabase[recipeId];
    if (!recipe?.result) throw new Error(`Unknown recipe: ${recipeId}`);
    return ensureDurability({
        ...clone(recipe.result),
        id: recipe.result.id,
        recipeId,
        level: recipe.result.level || 1,
        requiredLevel: recipe.result.requiredLevel || recipe.result.level || 1
    });
}

function getEquipmentSlot(item) {
    const type = String(item?.type || '').toLowerCase();
    if (type === 'weapon') return 'weapon';
    if (type === 'accessory') return 'accessory';
    return 'armor';
}

function getEquipmentScore(item) {
    return (Number(item?.stats?.attack) || 0) * 2
        + (Number(item?.stats?.defense) || 0)
        + (Number(item?.stats?.hp) || 0) / 10
        + (RARITY_SCORE[item?.rarity] || 0);
}

function refreshPlayerHp(character, heal = true) {
    character.maxHp = 100 + character.level * 20 + getAffixHpBonus(character);
    if (heal) character.hp = character.maxHp;
}

function createPlayer(level = 1, equipmentIds = ['old_sword']) {
    const character = {
        level,
        baseAtk: 5,
        baseDef: 2,
        exp: 0,
        gold: 100,
        hp: 100 + level * 20,
        maxHp: 100 + level * 20,
        equipment: { weapon: null, armor: null, accessory: null },
        activeBuffs: [],
        unlockedPassiveEffectIds: [],
        equippedPassiveEffectIds: [],
        passiveEffectSlots: 1
    };

    for (const itemId of equipmentIds) {
        const item = createEquipment(itemId);
        character.equipment[getEquipmentSlot(item)] = item;
    }

    refreshPlayerHp(character);
    return character;
}

function applyLevelUps(character) {
    const maxExp = () => calculateMaxExp(character);
    while (character.exp >= maxExp()) {
        character.exp -= maxExp();
        character.level += 1;
        refreshPlayerHp(character);
    }
}

function prepareMonster(monsterId) {
    const monster = MonsterDatabase[monsterId];
    if (!monster) throw new Error(`Unknown monster: ${monsterId}`);
    const cloneMonster = clone(monster);
    applyMonsterCombatBalance(cloneMonster);
    return cloneMonster;
}

function tryEquip(state, item) {
    const slot = getEquipmentSlot(item);
    const current = state.character.equipment[slot];
    if (!current || getEquipmentScore(item) > getEquipmentScore(current)) {
        if (current) state.spares.push(current);
        state.character.equipment[slot] = item;
        state.spares = state.spares.filter(spare => spare !== item);
    }
}

function addDrop(state, drop) {
    if (EquipmentDatabase[drop.itemId]) {
        const item = createEquipment(drop.itemId);
        state.spares.push(item);
        state.equipmentDrops += 1;
        tryEquip(state, item);
        return;
    }

    state.materials[drop.itemId] = (state.materials[drop.itemId] || 0) + (drop.quantity || 1);
    state.dropMaterials += drop.quantity || 1;
}

function canCraft(state, recipeId) {
    const recipe = RecipeDatabase[recipeId];
    if (!recipe) return false;
    return state.character.gold >= recipe.cost
        && recipe.materials.every(material => (state.materials[material.id] || 0) >= material.quantity);
}

function craft(state, recipeId) {
    const recipe = RecipeDatabase[recipeId];
    if (!recipe || !canCraft(state, recipeId)) {
        state.craftBlocks += 1;
        return false;
    }

    state.character.gold -= recipe.cost;
    for (const material of recipe.materials) {
        state.materials[material.id] -= material.quantity;
    }

    const item = createRecipeResult(recipeId);
    state.spares.push(item);
    state.crafted += 1;
    tryEquip(state, item);
    return true;
}

function getRepairRequirement(item) {
    const missing = Math.max(0, (Number(item?.maxDurability) || 0) - (Number(item?.durability) || 0));
    if (missing <= 0) return null;

    const rarity = String(item.rarity || 'common').toLowerCase();
    const materialId = {
        common: 'iron_shard',
        uncommon: 'iron_shard',
        rare: 'high_ore',
        epic: 'forge_core',
        legendary: 'rare_metal'
    }[rarity] || 'iron_shard';
    const divisor = {
        common: 12,
        uncommon: 10,
        rare: 9,
        epic: 8,
        legendary: 7
    }[rarity] || 10;
    const goldMultiplier = rarity === 'common' || rarity === 'uncommon' ? 1.35 : 2;

    return {
        materialId,
        quantity: Math.max(1, Math.ceil(missing / divisor)),
        gold: Math.max(5, Math.ceil(missing * goldMultiplier))
    };
}

function maintainEarlyGear(state) {
    const weapon = state.character.equipment.weapon;
    if (!weapon || (weapon.durability || 0) <= 5) craft(state, 'iron_sword');

    for (const slot of ['weapon', 'armor']) {
        const item = state.character.equipment[slot];
        if (!item) continue;
        const repairAt = Math.ceil((item.maxDurability || 1) * 0.25);
        if ((item.durability || 0) > repairAt) continue;

        const requirement = getRepairRequirement(item);
        if (!requirement) continue;
        if ((state.materials[requirement.materialId] || 0) < requirement.quantity) {
            state.repairMaterialBlocks += 1;
            continue;
        }
        if (state.character.gold < requirement.gold) {
            state.repairGoldBlocks += 1;
            continue;
        }

        state.materials[requirement.materialId] -= requirement.quantity;
        state.character.gold -= requirement.gold;
        item.durability = item.maxDurability;
        state.repairSuccesses += 1;
    }
}

function replaceBrokenEquipment(state, slot) {
    const candidates = state.spares
        .filter(item => getEquipmentSlot(item) === slot && (item.durability || 0) > 0)
        .sort((a, b) => getEquipmentScore(b) - getEquipmentScore(a));
    const replacement = candidates[0] || null;
    state.character.equipment[slot] = replacement;
    if (replacement) state.spares = state.spares.filter(item => item !== replacement);
}

function runEarlyBattle(state, monsterId) {
    const character = state.character;
    refreshPlayerHp(character);
    maintainEarlyGear(state);
    if (!character.equipment.weapon) state.noWeaponBattles += 1;

    const monster = prepareMonster(monsterId);
    let monsterHp = monster.hp;
    let playerHp = character.maxHp;
    let playerNext = 0;
    let monsterNext = 0;
    let time = 0;

    while (monsterHp > 0 && playerHp > 0 && time < 180) {
        if (playerNext <= monsterNext) {
            const effects = getEquipmentEffectTotals(character);
            const attack = getTotalAtk(character);
            const attackSpeed = getAttackSpeed(character);
            const effectiveDefense = Math.max(0, monster.defense * (1 - (effects.armorPenetration || 0) / 100));
            let damage = Math.max(1, attack - effectiveDefense);
            if (state.rng() < getCritChance(character)) damage *= getCritDamage(character);
            damage *= 1 + (effects.fire || 0) / 100;
            const directDamage = Math.floor(damage);
            const voidTickDamage = Math.max(0, Number(effects.void) || 0) / Math.max(0.1, attackSpeed);
            const actualVoidDamage = Math.max(0, Math.min(monsterHp - directDamage, voidTickDamage));
            monsterHp -= directDamage + actualVoidDamage;
            if (actualVoidDamage > 0) playerHp = Math.min(character.maxHp, playerHp + actualVoidDamage);

            const weapon = character.equipment.weapon;
            if (weapon && !effects.noDurabilityLoss) {
                weapon.durability = Math.max(0, weapon.durability - 1);
                if (weapon.durability <= 0) {
                    state.brokenEquipment += 1;
                    character.equipment.weapon = null;
                    replaceBrokenEquipment(state, 'weapon');
                }
            }

            playerNext += 1 / Math.max(0.1, attackSpeed);
            time = playerNext;
        } else {
            const effects = getEquipmentEffectTotals(character);
            const defense = getTotalDef(character);
            let damage = Math.max(1, monster.attack - defense);
            damage = Math.max(1, Math.floor(damage * (1 - Math.min(0.75, (effects.damageReduction || 0) / 100))));
            playerHp -= damage;

            const armor = character.equipment.armor;
            if (armor && !effects.noDurabilityLoss) {
                armor.durability = Math.max(0, armor.durability - 1);
                if (armor.durability <= 0) {
                    state.brokenEquipment += 1;
                    character.equipment.armor = null;
                    replaceBrokenEquipment(state, 'armor');
                }
            }

            monsterNext += 1 / Math.max(0.1, monster.attackSpeed || 1);
            time = monsterNext;
        }
    }

    if (monsterHp <= 0) {
        state.wins += 1;
        character.exp += monster.exp || 10;
        character.gold += monster.gold || 0;
        applyLevelUps(character);
        for (const drop of generateDrops({ monster, zoneId: 'low', rng: state.rng })) {
            addDrop(state, drop);
        }
        maintainEarlyGear(state);
        return true;
    }

    state.losses += 1;
    return false;
}

function createEarlyState(seed) {
    return {
        rng: createRng(seed),
        character: createPlayer(1),
        materials: {},
        spares: [],
        wins: 0,
        losses: 0,
        noWeaponBattles: 0,
        repairSuccesses: 0,
        repairMaterialBlocks: 0,
        repairGoldBlocks: 0,
        equipmentDrops: 0,
        crafted: 0,
        craftBlocks: 0,
        brokenEquipment: 0,
        dropMaterials: 0,
        questMaterials: 0
    };
}

function runEarlyEconomySimulation(fights) {
    const totals = {
        survived: 0,
        wins: 0,
        losses: 0,
        finalNoWeapon: 0,
        noWeaponBattles: 0,
        repairSuccesses: 0,
        repairMaterialBlocks: 0,
        equipmentDrops: 0,
        crafted: 0,
        craftBlocks: 0,
        brokenEquipment: 0,
        level: 0,
        ironShardLeft: 0
    };

    for (let i = 0; i < RUNS; i += 1) {
        const state = createEarlyState(1000 + i);
        for (let fight = 0; fight < fights; fight += 1) {
            const monsterId = pickWeighted(state.rng, EARLY_MONSTER_POOL);
            runEarlyBattle(state, monsterId);
            if (state.losses > 0) break;
        }

        totals.survived += state.losses === 0 ? 1 : 0;
        totals.wins += state.wins;
        totals.losses += state.losses;
        totals.finalNoWeapon += state.character.equipment.weapon ? 0 : 1;
        totals.noWeaponBattles += state.noWeaponBattles;
        totals.repairSuccesses += state.repairSuccesses;
        totals.repairMaterialBlocks += state.repairMaterialBlocks;
        totals.equipmentDrops += state.equipmentDrops;
        totals.crafted += state.crafted;
        totals.craftBlocks += state.craftBlocks;
        totals.brokenEquipment += state.brokenEquipment;
        totals.level += state.character.level;
        totals.ironShardLeft += state.materials.iron_shard || 0;
    }

    return {
        runs: RUNS,
        fights,
        survivalRate: totals.survived / RUNS,
        deathRate: totals.losses / RUNS,
        avgWins: totals.wins / RUNS,
        finalNoWeaponRate: totals.finalNoWeapon / RUNS,
        avgNoWeaponBattles: totals.noWeaponBattles / RUNS,
        avgRepairSuccesses: totals.repairSuccesses / RUNS,
        avgRepairMaterialBlocks: totals.repairMaterialBlocks / RUNS,
        avgEquipmentDrops: totals.equipmentDrops / RUNS,
        avgCrafted: totals.crafted / RUNS,
        avgCraftBlocks: totals.craftBlocks / RUNS,
        avgBrokenEquipment: totals.brokenEquipment / RUNS,
        avgLevel: totals.level / RUNS,
        avgIronShardLeft: totals.ironShardLeft / RUNS
    };
}

function createScenarioPlayer(label, level, equipmentIds) {
    return {
        label,
        character: createPlayer(level, equipmentIds)
    };
}

function runMatchup(playerScenario, monsterId) {
    const character = playerScenario.character;
    const monster = prepareMonster(monsterId);
    const effects = getEquipmentEffectTotals(character);
    const rank = getMonsterCombatRank(monster);
    const effectiveDefense = Math.max(0, monster.defense * (1 - (effects.armorPenetration || 0) / 100));
    let averageHit = Math.max(1, getTotalAtk(character) - effectiveDefense);
    averageHit *= 1 + getCritChance(character) * (getCritDamage(character) - 1);
    averageHit *= 1 + (effects.fire || 0) / 100;
    if (rank === 'boss') averageHit *= 1 + (effects.bossBonus || 0) / 100;
    averageHit *= 1 + ((effects.doubleStrike || 0) / 100) * 0.5;

    const playerDps = averageHit * getAttackSpeed(character) + (effects.void || 0);
    const rawMonsterDps = Math.max(1, monster.attack - getTotalDef(character)) * (monster.attackSpeed || 1);
    const monsterDps = Math.max(
        1,
        rawMonsterDps * (1 - Math.min(0.75, (effects.damageReduction || 0) / 100))
            - playerDps * ((effects.lifesteal || 0) / 100)
    );
    const timeToKill = monster.hp / playerDps;
    const timeToDie = character.maxHp / monsterDps;
    const ratio = timeToKill / timeToDie;

    return {
        scenario: playerScenario.label,
        monsterId,
        rank,
        player: {
            level: character.level,
            hp: character.maxHp,
            attack: getTotalAtk(character),
            defense: getTotalDef(character)
        },
        monster: {
            level: monster.level,
            hp: monster.hp,
            attack: monster.attack,
            defense: monster.defense
        },
        playerDps,
        monsterDps,
        timeToKill,
        timeToDie,
        ratio,
        expectedWinner: ratio < 1 ? 'player' : 'monster'
    };
}

function runGateChecks() {
    const players = {
        earlyJunk: createScenarioPlayer('early_rusty_no_armor', 1, ['old_sword']),
        earlyUncommon: createScenarioPlayer('early_uncommon', 5, ['wolf_fang_blade', 'wolf_pelt_armor']),
        midWeak: createScenarioPlayer('mid_weak', 12, ['bone_sword', 'ghost_cloak', 'shadow_badge']),
        midGood: createScenarioPlayer('mid_good', 14, ['shadow_commander_blade', 'shadow_armor_drop', 'titan_gauntlet']),
        lateEpic: createScenarioPlayer('late_epic', 30, ['demon_blade', 'demon_general_armor', 'elemental_orb']),
        lateLegendary: createScenarioPlayer('late_legendary', 30, ['demon_lord_sword', 'demon_lord_armor', 'demon_lord_crown'])
    };

    return [
        runMatchup(players.earlyJunk, 'poison_spider'),
        runMatchup(players.earlyUncommon, 'forest_guardian'),
        runMatchup(players.midWeak, 'shadow_mage'),
        runMatchup(players.midGood, 'shadow_commander'),
        runMatchup(players.lateEpic, 'demon_general'),
        runMatchup(players.lateEpic, 'demon_lord_asariel'),
        runMatchup(players.lateLegendary, 'demon_general'),
        runMatchup(players.lateLegendary, 'demon_lord_asariel')
    ];
}

function addQuestRewardsToState(state, questId) {
    const quest = Object.values(QuestDatabase)
        .flat()
        .find(entry => entry.id === questId);
    if (!quest) throw new Error(`Unknown quest: ${questId}`);

    const rewards = quest.rewards || {};
    state.character.gold += Number(rewards.gold) || 0;
    state.character.exp += Number(rewards.exp) || 0;
    applyLevelUps(state.character);

    for (const material of rewards.materials || []) {
        const quantity = Math.max(1, Number(material.quantity) || 1);
        state.materials[material.id] = (state.materials[material.id] || 0) + quantity;
        state.questMaterials += quantity;
    }

    for (const itemId of rewards.items || []) {
        if (!EquipmentDatabase[itemId]) continue;
        tryEquip(state, createEquipment(itemId));
    }
}

function runGuidedEarlyQuestSimulation() {
    const totals = {
        survived: 0,
        wins: 0,
        losses: 0,
        level: 0,
        equipmentDrops: 0,
        crafted: 0,
        dropMaterials: 0,
        questMaterials: 0,
        upgradedWeapon: 0,
        hasArmor: 0,
        noWeaponBattles: 0
    };

    const steps = [
        { questId: 'main_001' },
        { questId: 'main_002', fights: Array(5).fill('slime') },
        { questId: 'bounty_001', fights: Array(5).fill('slime') },
        { questId: 'bounty_002', fights: Array(8).fill('goblin') },
        { questId: 'main_003' }
    ];

    for (let i = 0; i < RUNS; i += 1) {
        const state = createEarlyState(5000 + i);
        state.character.equipment.weapon = null;

        for (const step of steps) {
            for (const monsterId of step.fights || []) {
                runEarlyBattle(state, monsterId);
                if (state.losses > 0) break;
            }
            if (state.losses > 0) break;
            addQuestRewardsToState(state, step.questId);
        }

        const weapon = state.character.equipment.weapon;
        totals.survived += state.losses === 0 ? 1 : 0;
        totals.wins += state.wins;
        totals.losses += state.losses;
        totals.level += state.character.level;
        totals.equipmentDrops += state.equipmentDrops;
        totals.crafted += state.crafted;
        totals.dropMaterials += state.dropMaterials;
        totals.questMaterials += state.questMaterials;
        totals.upgradedWeapon += weapon && weapon.id !== 'old_sword' ? 1 : 0;
        totals.hasArmor += state.character.equipment.armor ? 1 : 0;
        totals.noWeaponBattles += state.noWeaponBattles;
    }

    const materialTotal = totals.dropMaterials + totals.questMaterials;
    return {
        runs: RUNS,
        survivalRate: totals.survived / RUNS,
        avgWins: totals.wins / RUNS,
        avgLosses: totals.losses / RUNS,
        avgLevel: totals.level / RUNS,
        avgEquipmentDrops: totals.equipmentDrops / RUNS,
        avgCrafted: totals.crafted / RUNS,
        upgradedWeaponRate: totals.upgradedWeapon / RUNS,
        armorRate: totals.hasArmor / RUNS,
        avgDropMaterials: totals.dropMaterials / RUNS,
        avgQuestMaterials: totals.questMaterials / RUNS,
        questMaterialShare: materialTotal > 0 ? totals.questMaterials / materialTotal : 0,
        avgNoWeaponBattles: totals.noWeaponBattles / RUNS
    };
}

function runMainQuestExpProgression() {
    const character = {
        level: 1,
        exp: 0,
        hp: 120,
        maxHp: 120,
        equipment: {},
        activeBuffs: [],
        unlockedPassiveEffectIds: [],
        equippedPassiveEffectIds: [],
        passiveEffectSlots: 1
    };
    const rows = [];

    const grantExp = amount => {
        character.exp += Math.max(0, Number(amount) || 0);
        applyLevelUps(character);
    };

    for (const quest of QuestDatabase.main) {
        const startLevel = character.level;
        const startExp = character.exp;
        let objectiveExp = 0;
        let bossLevel = quest.requiredLevel || 1;

        for (const objective of quest.objectives || []) {
            if (objective.type !== ObjectiveType.KILL) continue;
            const monster = MonsterDatabase[objective.target];
            if (!monster) continue;
            objectiveExp += (Number(monster.exp) || 0) * Math.max(1, Number(objective.count) || 1);
            bossLevel = Math.max(bossLevel, Number(monster.level) || bossLevel);
        }

        grantExp(objectiveExp);
        const afterObjectiveLevel = character.level;
        grantExp(quest.rewards?.exp || 0);

        rows.push({
            questId: quest.id,
            chapter: quest.chapter || 1,
            requiredLevel: quest.requiredLevel || 1,
            bossLevel,
            startLevel,
            startExp,
            objectiveExp,
            rewardExp: quest.rewards?.exp || 0,
            afterObjectiveLevel,
            afterRewardLevel: character.level,
            remainingExp: character.exp,
            nextExp: calculateMaxExp(character)
        });
    }

    return rows;
}

function assertRange(issues, label, value, min, max) {
    if (value < min || value > max) {
        issues.push(`${label}: expected ${min}..${max}, got ${value.toFixed(3)}`);
    }
}

function assertAtLeast(issues, label, value, min) {
    if (value < min) issues.push(`${label}: expected >= ${min}, got ${value.toFixed(3)}`);
}

function assertAtMost(issues, label, value, max) {
    if (value > max) issues.push(`${label}: expected <= ${max}, got ${value.toFixed(3)}`);
}

function validateReport(report) {
    const issues = [];
    const session = report.earlyEconomy.session12;
    const farm = report.earlyEconomy.farm30;
    const guided = report.guidedEarlyQuest;
    const byKey = Object.fromEntries(report.gates.map(row => [`${row.scenario}:${row.monsterId}`, row]));
    const mainById = Object.fromEntries(report.mainQuestProgression.map(row => [row.questId, row]));

    assertAtLeast(issues, 'early session survival', session.survivalRate, 0.55);
    assertRange(issues, 'early session no-weapon battles', session.avgNoWeaponBattles, 0.8, 4.5);
    assertAtLeast(issues, 'early session crafted replacements', session.avgCrafted, 0.8);
    assertAtLeast(issues, 'farm survival', farm.survivalRate, 0.38);
    assertRange(issues, 'farm repair material blocks', farm.avgRepairMaterialBlocks, 2.0, 9.0);
    assertRange(issues, 'farm broken equipment', farm.avgBrokenEquipment, 2.0, 5.5);
    assertAtLeast(issues, 'guided early quest survival', guided.survivalRate, 0.60);
    assertAtLeast(issues, 'guided early quest upgraded weapon rate', guided.upgradedWeaponRate, 0.35);
    assertAtMost(issues, 'guided early quest material share from quests', guided.questMaterialShare, 0.30);

    assertAtLeast(issues, 'early rusty no armor vs poison spider ratio', byKey['early_rusty_no_armor:poison_spider'].ratio, 1.05);
    assertAtLeast(issues, 'early uncommon vs forest guardian ratio', byKey['early_uncommon:forest_guardian'].ratio, 2.5);
    assertAtLeast(issues, 'mid weak vs shadow mage ratio', byKey['mid_weak:shadow_mage'].ratio, 1.1);
    assertRange(issues, 'mid good vs shadow commander ratio', byKey['mid_good:shadow_commander'].ratio, 0.65, 1.2);
    assertAtLeast(issues, 'late epic vs demon general ratio', byKey['late_epic:demon_general'].ratio, 1.0);
    assertAtLeast(issues, 'late epic vs demon lord ratio', byKey['late_epic:demon_lord_asariel'].ratio, 6.0);
    assertAtMost(issues, 'late legendary vs demon general ratio', byKey['late_legendary:demon_general'].ratio, 0.55);
    assertRange(issues, 'late legendary vs demon lord ratio', byKey['late_legendary:demon_lord_asariel'].ratio, 1.0, 2.2);

    assertAtMost(issues, 'main_005 start level before forest guardian', mainById.main_005.startLevel, 5);
    assertAtMost(issues, 'main_006 start level before blood moon stag', mainById.main_006.startLevel, 7);
    assertAtMost(issues, 'main_007 start level before chapter 2 gate', mainById.main_007.startLevel, 7);
    assertRange(issues, 'main_008 main-only sidequest gap', mainById.main_008.requiredLevel - mainById.main_008.startLevel, 1, 4);
    for (const row of report.mainQuestProgression.filter(entry => entry.requiredLevel >= 8)) {
        assertAtMost(issues, `${row.questId} main-only level before required gate`, row.startLevel, row.requiredLevel - 1);
    }

    return issues;
}

function formatPercent(value) {
    return `${(value * 100).toFixed(1)}%`;
}

function printTextReport(report) {
    console.log('Difficulty progression check');
    console.log('');
    for (const [label, row] of Object.entries(report.earlyEconomy)) {
        console.log(`${label}: survival ${formatPercent(row.survivalRate)}, death ${formatPercent(row.deathRate)}, wins ${row.avgWins.toFixed(1)}, no-weapon battles ${row.avgNoWeaponBattles.toFixed(1)}, crafted ${row.avgCrafted.toFixed(1)}, repairs ${row.avgRepairSuccesses.toFixed(1)}, repair blocks ${row.avgRepairMaterialBlocks.toFixed(1)}, broken ${row.avgBrokenEquipment.toFixed(1)}`);
    }
    console.log('');
    for (const row of report.gates) {
        console.log(`${row.scenario} vs ${row.monsterId}: ratio ${row.ratio.toFixed(2)}, TTK ${row.timeToKill.toFixed(1)}s, TTD ${row.timeToDie.toFixed(1)}s, ${row.expectedWinner}`);
    }
    console.log('');
    console.log(`guided early quest: survival ${formatPercent(report.guidedEarlyQuest.survivalRate)}, level ${report.guidedEarlyQuest.avgLevel.toFixed(1)}, equipment drops ${report.guidedEarlyQuest.avgEquipmentDrops.toFixed(1)}, upgraded weapon ${formatPercent(report.guidedEarlyQuest.upgradedWeaponRate)}, armor ${formatPercent(report.guidedEarlyQuest.armorRate)}, quest material share ${formatPercent(report.guidedEarlyQuest.questMaterialShare)}`);
    console.log('');
    console.log('Main quest EXP pacing');
    for (const row of report.mainQuestProgression) {
        const gate = row.requiredLevel >= 8 ? ` req ${row.requiredLevel}` : '';
        const boss = row.bossLevel > 1 ? ` boss ${row.bossLevel}` : '';
        console.log(`${row.questId}:${gate}${boss} start L${row.startLevel}, objective L${row.afterObjectiveLevel}, reward L${row.afterRewardLevel}, exp ${row.remainingExp}/${row.nextExp}`);
    }
}

const report = {
    earlyEconomy: {
        session12: runEarlyEconomySimulation(12),
        farm30: runEarlyEconomySimulation(30)
    },
    gates: runGateChecks(),
    guidedEarlyQuest: runGuidedEarlyQuestSimulation(),
    mainQuestProgression: runMainQuestExpProgression()
};

const issues = validateReport(report);
report.summary = {
    passed: issues.length === 0,
    issues
};

if (process.argv.includes('--json')) {
    console.log(JSON.stringify(report, null, 2));
} else {
    printTextReport(report);
    if (issues.length > 0) {
        console.log('');
        console.log('Issues');
        for (const issue of issues) console.log(`- ${issue}`);
    }
}

if (issues.length > 0) {
    process.exitCode = 1;
}
