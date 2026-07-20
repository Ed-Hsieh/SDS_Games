import { BlueprintDropDatabase, BlueprintDropRate } from '../src/js/data/BlueprintDrops.js';
import { MaterialDatabase } from '../src/js/data/Materials.js';
import { FirstRunMonsterRosters } from '../src/js/data/MonsterEcology.js';
import { MonsterDatabase, MonsterType } from '../src/js/data/Monsters.js';
import { EquipmentDatabase } from '../src/js/data/Equipment.js';
import { RecipeDatabase } from '../src/js/data/Recipes.js';
import { BossRecipeUnlocksByMonsterId } from '../src/js/data/RecipeDiscoveries.js';
import { generateDropsFromSources } from '../src/js/managers/DropManager.js';
import { DropSourceType } from '../src/js/models/Enums.js';
import { FirstRunBandAllocationPlan } from '../src/js/data/FirstRunLootBalance.js';
import {
    BossRewardContract,
    EquipmentDropRateContract,
    MonsterSourceBudget,
    RegionSourceContract,
    WeaponBandAllocationContract
} from '../src/js/data/WeaponProgression.js';

const ids = [...new Set(Object.values(FirstRunMonsterRosters).flatMap(row => row.monsterIds))];
const mainBosses = new Set(Object.values(FirstRunMonsterRosters).map(row => row.mandatoryBossId));
const optionalBosses = new Set(Object.values(FirstRunMonsterRosters).flatMap(row => row.optionalBossIds));
const issues = [];
const materialSources = new Map();
const approvedDirectEquipment = new Set(Object.values(FirstRunBandAllocationPlan).flatMap(plan => plan.directEquipment));
const approvedBasicDirectEquipment = new Set(Object.values(FirstRunBandAllocationPlan).flatMap(plan => plan.basicDirectEquipment || []));
const approvedBaselineCraft = new Set(Object.values(FirstRunBandAllocationPlan).flatMap(plan => plan.baselineCraft));
const approvedBasicCraft = new Set(Object.values(FirstRunBandAllocationPlan).flatMap(plan => plan.basicCraft || []));
const approvedSpecialCraft = new Set(Object.values(FirstRunBandAllocationPlan).flatMap(plan => plan.specialCraft));
const approvedBossEquipment = new Set(Object.values(FirstRunBandAllocationPlan).flatMap(plan => plan.bossEquipment));
const blueprintEntries = Object.values(BlueprintDropDatabase).flatMap(entries => entries || []);
const migratedEquipmentRateChapters = new Set(EquipmentDropRateContract.migratedChapters);

if (BlueprintDropRate !== EquipmentDropRateContract.standardByRarity) {
    issues.push('blueprint drop rates must use the canonical equipment rarity rate table');
}

const authoredMonsterMaterialRoll = generateDropsFromSources([{
    type: DropSourceType.MonsterUnique,
    entries: [{ id: 'slime_jelly', chance: 0.5, quantity: 1 }],
    rolls: 1
}], { rng: () => 0.3 });
if (!authoredMonsterMaterialRoll.some(drop => drop.itemId === 'slime_jelly')) {
    issues.push('monster material chances are being reduced by a hidden global multiplier');
}

for (const [chapter, plan] of Object.entries(FirstRunBandAllocationPlan)) {
    for (const equipmentId of plan.basicDirectEquipment || []) {
        const equipment = EquipmentDatabase[equipmentId];
        if (!equipment) issues.push(`chapter ${chapter}: missing basic direct equipment ${equipmentId}`);
        else if (equipment.rarity !== WeaponBandAllocationContract.basicMonsterEquipment.rarity) {
            issues.push(`chapter ${chapter}: basic direct equipment ${equipmentId} must be common`);
        } else if (!(equipment.dropFrom || []).length) {
            issues.push(`chapter ${chapter}: ${equipmentId} has no active monster source`);
        }
    }
    for (const recipeId of plan.basicCraft || []) {
        if (!RecipeDatabase[recipeId]) issues.push(`chapter ${chapter}: missing basic craft ${recipeId}`);
        else if (!blueprintEntries.some(entry => entry.recipeId === recipeId)) issues.push(`chapter ${chapter}: ${recipeId} has no active blueprint source`);
    }
    if (plan.baselineCraft.length !== WeaponBandAllocationContract.baselineCraft.finishedItemsPerBand) {
        issues.push(`chapter ${chapter}: baseline series has ${plan.baselineCraft.length} variants`);
    }
    if (plan.directEquipment.length < WeaponBandAllocationContract.normalEliteSpecialDrops.min
        || plan.directEquipment.length > WeaponBandAllocationContract.normalEliteSpecialDrops.max) {
        issues.push(`chapter ${chapter}: direct equipment quota is ${plan.directEquipment.length}`);
    }
    if (plan.specialCraft.length < WeaponBandAllocationContract.specialCraft.min
        || plan.specialCraft.length > WeaponBandAllocationContract.specialCraft.max) {
        issues.push(`chapter ${chapter}: special craft quota is ${plan.specialCraft.length}`);
    }
    if (plan.bossEquipment.length < WeaponBandAllocationContract.bossDungeonRepresentativeEquipment.min
        || plan.bossEquipment.length > WeaponBandAllocationContract.bossDungeonRepresentativeEquipment.max) {
        issues.push(`chapter ${chapter}: Boss equipment quota is ${plan.bossEquipment.length}`);
    }
    for (const equipmentId of plan.directEquipment) {
        if (!EquipmentDatabase[equipmentId]) issues.push(`chapter ${chapter}: missing direct equipment ${equipmentId}`);
        else if (!(EquipmentDatabase[equipmentId].dropFrom || []).length) issues.push(`chapter ${chapter}: ${equipmentId} has no active monster source`);
    }
    for (const recipeId of plan.baselineCraft) {
        const recipe = RecipeDatabase[recipeId];
        if (!recipe) issues.push(`chapter ${chapter}: missing baseline craft ${recipeId}`);
        else if (!['baseline', 'series'].includes(recipe.craftLine)) issues.push(`chapter ${chapter}: ${recipeId} is not baseline craft`);
    }
    const baselineForms = new Set(plan.baselineCraft.map(id => RecipeDatabase[id]?.result?.weaponForm).filter(Boolean));
    const baselineSeriesIds = new Set(plan.baselineCraft.map(id => RecipeDatabase[id]?.seriesId).filter(Boolean));
    for (const form of WeaponBandAllocationContract.baselineCraft.forms) {
        if (!baselineForms.has(form)) issues.push(`chapter ${chapter}: baseline series is missing ${form}`);
    }
    if (baselineSeriesIds.size !== WeaponBandAllocationContract.baselineCraft.seriesUnlocksPerBand) {
        issues.push(`chapter ${chapter}: baseline recipes span ${baselineSeriesIds.size} series unlocks`);
    }
    for (const recipeId of plan.specialCraft) {
        if (!RecipeDatabase[recipeId]) issues.push(`chapter ${chapter}: missing special craft ${recipeId}`);
        else if (!blueprintEntries.some(entry => entry.recipeId === recipeId)) issues.push(`chapter ${chapter}: ${recipeId} has no active blueprint source`);
    }
    for (const equipmentId of plan.bossEquipment) {
        if (!EquipmentDatabase[equipmentId]) issues.push(`chapter ${chapter}: missing Boss equipment ${equipmentId}`);
    }
    const forms = new Set([
        ...plan.directEquipment.map(id => EquipmentDatabase[id]?.weaponForm),
        ...plan.bossEquipment.map(id => EquipmentDatabase[id]?.weaponForm),
        ...plan.baselineCraft.map(id => RecipeDatabase[id]?.result?.weaponForm),
        ...plan.specialCraft.map(id => RecipeDatabase[id]?.result?.weaponForm)
    ].filter(Boolean));
    for (const form of WeaponBandAllocationContract.baselineCraft.forms) {
        if (!forms.has(form)) issues.push(`chapter ${chapter}: weapon form ${form} remains uncovered`);
    }
}

for (const id of ids) {
    for (const drop of MonsterDatabase[id]?.drops || []) {
        if (!materialSources.has(drop.itemId)) materialSources.set(drop.itemId, new Set());
        materialSources.get(drop.itemId).add(id);
    }
}

for (const roster of Object.values(FirstRunMonsterRosters)) {
    if (!migratedEquipmentRateChapters.has(roster.chapter)) continue;
    for (const monsterId of roster.monsterIds) {
        const monster = MonsterDatabase[monsterId];
        for (const drop of monster?.equipmentDrops || []) {
            const equipment = EquipmentDatabase[drop.equipmentId];
            if (mainBosses.has(monsterId)) {
                const range = EquipmentDropRateContract.mainBossLegendaryRange;
                if (equipment?.rarity !== BossRewardContract.signatureRarity) {
                    issues.push(`${monsterId}: main Boss equipment ${drop.equipmentId} is not Legendary`);
                } else if (!Number.isFinite(drop.chance) || drop.chance < range[0] || drop.chance > range[1]) {
                    issues.push(`${monsterId}: ${drop.equipmentId} chance ${drop.chance} is outside main Boss range ${range[0]}-${range[1]}`);
                }
                continue;
            }

            const expectedChance = EquipmentDropRateContract.standardByRarity[equipment?.rarity];
            if (!Number.isFinite(expectedChance)) {
                issues.push(`${monsterId}: ${equipment?.rarity || 'unknown'} equipment is outside the four standard drop qualities`);
            } else if (drop.chance !== expectedChance) {
                issues.push(`${monsterId}: ${drop.equipmentId} chance ${drop.chance} must equal ${equipment.rarity} rate ${expectedChance}`);
            }
        }
    }
}

for (const id of ids) {
    const monster = MonsterDatabase[id];
    const equipment = monster?.equipmentDrops || [];
    const blueprints = BlueprintDropDatabase[id] || [];
    const materials = (monster?.drops || []).filter(drop => (
        MaterialDatabase[drop.itemId]?.type === 'material' && drop.sourceRole !== 'junk'
    ));

    if (!monster) issues.push(`${id}: missing monster record`);
    const maxEquipment = monster?.type === MonsterType.ELITE
        ? 1
        : MonsterSourceBudget.normal.maxDirectEquipment;
    if (equipment.length > maxEquipment) issues.push(`${id}: owns ${equipment.length} direct equipment drops`);
    if (blueprints.length > 1) issues.push(`${id}: owns ${blueprints.length} blueprint drops`);
    if (mainBosses.has(id) && blueprints.length > 0) issues.push(`${id}: main boss has a random blueprint`);
    if (monster?.type === MonsterType.ELITE && equipment.length > 0 && blueprints.length > 0) issues.push(`${id}: elite owns equipment and blueprint lanes`);
    for (const drop of equipment) {
        if (!approvedBasicDirectEquipment.has(drop.equipmentId)
            && !approvedDirectEquipment.has(drop.equipmentId)
            && !approvedBossEquipment.has(drop.equipmentId)) {
            issues.push(`${id}: unallocated direct equipment ${drop.equipmentId}`);
        }
    }
    for (const drop of blueprints) {
        if (drop.recipeId
            && !approvedBasicCraft.has(drop.recipeId)
            && !approvedSpecialCraft.has(drop.recipeId)) {
            issues.push(`${id}: unallocated blueprint craft ${drop.recipeId}`);
        }
    }
    const normalMaterialBudget = MonsterSourceBudget.normal.signatureMaterials + MonsterSourceBudget.normal.commonMaterials;
    if (!mainBosses.has(id) && !optionalBosses.has(id) && materials.length > normalMaterialBudget) issues.push(`${id}: owns ${materials.length} material sources`);
}

for (const bossId of mainBosses) {
    const equipmentDrops = MonsterDatabase[bossId]?.equipmentDrops || [];
    if (equipmentDrops.length !== BossRewardContract.signatureEquipmentPerMainBoss) {
        issues.push(`${bossId}: expected exactly one signature equipment drop`);
        continue;
    }
    const signature = EquipmentDatabase[equipmentDrops[0].equipmentId];
    if (!signature) {
        issues.push(`${bossId}: signature equipment is missing`);
        continue;
    }
    if (signature.rarity !== BossRewardContract.signatureRarity) issues.push(`${bossId}: signature is not Legendary`);
    if (signature.rewardRole !== 'boss_signature') issues.push(`${bossId}: signature reward role is not locked`);
    if (signature.dropFrom?.length !== 1 || signature.dropFrom[0] !== bossId) issues.push(`${bossId}: signature source is not exclusive`);

    for (const recipeId of BossRecipeUnlocksByMonsterId[bossId] || []) {
        const recipe = RecipeDatabase[recipeId];
        if (!recipe) {
            issues.push(`${bossId}: missing Boss craft ${recipeId}`);
            continue;
        }
        if (!recipe.canonicalResult || recipe.result?.id !== recipe.resultId) issues.push(`${recipeId}: does not return its canonical equipment id`);
        if (!EquipmentDatabase[recipe.resultId]) issues.push(`${recipeId}: canonical equipment ${recipe.resultId} is missing`);
        if (recipe.resultId?.startsWith('crafted_')) issues.push(`${recipeId}: creates a duplicate crafted result id`);
        const bossDropIds = new Set((MonsterDatabase[bossId]?.drops || []).map(drop => drop.itemId));
        const bossMaterialCount = recipe.materials.filter(material => bossDropIds.has(material.id)).length;
        if (bossMaterialCount < 1) issues.push(`${recipeId}: does not consume a material from ${bossId}`);
    }
}

for (const roster of Object.values(FirstRunMonsterRosters)) {
    const contributors = roster.monsterIds.filter(id => {
        const monster = MonsterDatabase[id];
        return (monster?.drops || []).some(drop => MaterialDatabase[drop.itemId]?.type === 'material')
            || (monster?.equipmentDrops || []).length > 0
            || (BlueprintDropDatabase[id] || []).length > 0;
    });
    if (contributors.length < RegionSourceContract.minimumContributingMonsterSpecies) {
        issues.push(`chapter ${roster.chapter}: only ${contributors.length} contributing monster species`);
    }
}

const sourceLockedSpecialCrafts = Object.values(RecipeDatabase)
    .filter(recipe => recipe.result?.balanceStatus === 'source_locked_stats_provisional');

for (const recipe of sourceLockedSpecialCrafts) {
    const blueprintSources = ids.filter(id => (BlueprintDropDatabase[id] || []).some(drop => drop.recipeId === recipe.id));
    for (const material of recipe.materials) {
        const sourceCount = materialSources.get(material.id)?.size || 0;
        if (sourceCount < 2) issues.push(`${recipe.id}: ${material.id} has only ${sourceCount} first-run source(s)`);
    }
    for (const sourceId of blueprintSources) {
        const owned = new Set((MonsterDatabase[sourceId]?.drops || []).map(drop => drop.itemId));
        if (recipe.materials.every(material => owned.has(material.id))) {
            issues.push(`${recipe.id}: ${sourceId} owns the blueprint and every recipe material`);
        }
    }
}

if (issues.length) {
    console.error(`First-run loot check found ${issues.length} issue(s):`);
    issues.forEach(issue => console.error(`- ${issue}`));
    process.exitCode = 1;
} else {
    console.log(`First-run loot check passed for ${ids.length} monsters.`);
}
