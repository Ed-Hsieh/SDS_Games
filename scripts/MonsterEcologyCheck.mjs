import { MonsterDatabase, MonsterElement, MonsterType } from '../src/js/data/Monsters.js';
import {
    FirstRunMonsterRosters,
    RequiredFirstRunMonsterArtIds,
    SecondRunExternalMonsterIds,
    SecondRunMonsterCapacity,
    getMonsterEcologyProfile
} from '../src/js/data/MonsterEcology.js';
import {
    FocusElementContract,
    WeaponDistributionContract,
    WeaponBandAllocationContract,
    RegionSourceContract,
    WeaponLevelBands
} from '../src/js/data/WeaponProgression.js';

const problems = [];
const externalIds = new Set(SecondRunExternalMonsterIds);

for (const [chapterKey, roster] of Object.entries(FirstRunMonsterRosters)) {
    const chapter = Number(chapterKey);
    const ids = roster.monsterIds;
    if (ids.length < roster.targetMin || ids.length > roster.targetMax) {
        problems.push(`chapter ${chapter} has ${ids.length} first-run monsters; expected ${roster.targetMin}-${roster.targetMax}`);
    }
    if (new Set(ids).size !== ids.length) problems.push(`chapter ${chapter} contains duplicate monster ids`);
    if (!ids.includes(roster.mandatoryBossId)) problems.push(`chapter ${chapter} is missing mandatory Boss ${roster.mandatoryBossId}`);

    for (const monsterId of ids) {
        const monster = MonsterDatabase[monsterId];
        if (!monster) {
            problems.push(`chapter ${chapter} references missing monster ${monsterId}`);
            continue;
        }
        if (externalIds.has(monsterId)) problems.push(`chapter ${chapter} leaks external monster ${monsterId} into first-run roster`);
        if (!getMonsterEcologyProfile(monsterId).chapters.includes(chapter)) {
            problems.push(`${monsterId} has inconsistent chapter ownership for chapter ${chapter}`);
        }
    }

    const boss = MonsterDatabase[roster.mandatoryBossId];
    if (boss && ![MonsterType.BOSS, MonsterType.WORLD_BOSS].includes(boss.type)) {
        problems.push(`chapter ${chapter} mandatory Boss ${boss.id} is typed ${boss.type}`);
    }

    const capacity = SecondRunMonsterCapacity[chapter];
    if (!capacity || capacity.targetTotal !== 12 || capacity.externalBossSlots !== 1) {
        problems.push(`chapter ${chapter} second-run capacity must be 12 with exactly one external Boss slot`);
    } else if (capacity.additionalSlots !== 12 - ids.length) {
        problems.push(`chapter ${chapter} second-run additional slot count is inconsistent`);
    }
}

const chapterOne = FirstRunMonsterRosters[1];
if (chapterOne.monsterIds.length !== 9) problems.push('chapter 1 must contain exactly 9 first-run monsters');
if (MonsterDatabase.treant?.type !== MonsterType.ELITE) problems.push('treant must be the Chapter 1 elite');
if (MonsterDatabase.cave_bat?.element !== MonsterElement.NONE) problems.push('cave_bat must remain a neutral Chapter 2 creature');

for (const monsterId of RequiredFirstRunMonsterArtIds) {
    if (!MonsterDatabase[monsterId]) problems.push(`required-art monster ${monsterId} has no runtime record`);
    if (getMonsterEcologyProfile(monsterId).assetStatus !== 'required') problems.push(`${monsterId} art status is not required`);
}

for (let index = 0; index < WeaponLevelBands.length; index += 1) {
    const band = WeaponLevelBands[index];
    if (band.chapter !== index + 1 || band.minLevel !== index * 10 + 1 || band.maxLevel !== (index + 1) * 10) {
        problems.push(`weapon band ${band.id} is not the canonical chapter Lv10 interval`);
    }
    for (const form of band.missingForms) {
        if (!WeaponDistributionContract.allForms.includes(form)) problems.push(`weapon band ${band.id} uses unknown form ${form}`);
    }
}

if (WeaponDistributionContract.gapFillCount > 0
    && WeaponBandAllocationContract.baselineCraft.policy !== 'complete_five_form_series') {
    problems.push('formal first-run weapon gaps must be owned by baseline craft');
}
if (WeaponBandAllocationContract.bossDungeonRepresentativeEquipment.min !== 1
    || WeaponBandAllocationContract.bossDungeonRepresentativeEquipment.max !== 2) {
    problems.push('each ten-level band must reserve one or two Boss/dungeon representative items');
}
if (WeaponBandAllocationContract.specialCraft.min !== 1
    || WeaponBandAllocationContract.specialCraft.max !== 2) {
    problems.push('each ten-level band must define one or two special craft items');
}
if (WeaponBandAllocationContract.normalEliteSpecialDrops.min !== 2
    || WeaponBandAllocationContract.normalEliteSpecialDrops.max !== 3
    || !WeaponBandAllocationContract.normalEliteSpecialDrops.finishedDirectEquipmentOnly) {
    problems.push('each ten-level band must define two or three finished normal/elite special drops');
}
if (WeaponBandAllocationContract.questUniqueWeapon.fixedQuota !== false
    || WeaponBandAllocationContract.questUniqueWeapon.countsTowardOtherQuotas !== false) {
    problems.push('quest-unique weapons must remain story-driven and outside fixed quotas');
}
if (WeaponDistributionContract.unresolvedAllocationRules.length !== 0) {
    problems.push('weapon allocation contract still has unresolved definitions');
}
if (RegionSourceContract.minimumContributingMonsterSpecies !== 3) {
    problems.push('each region must require at least three contributing monster species');
}
if (FocusElementContract.resonanceElements.join(',') !== 'fire,ice,thunder,poison') {
    problems.push('focus resonance must be limited to fire, ice, thunder, and poison');
}

if (problems.length > 0) {
    console.error(`Monster ecology check found ${problems.length} issue(s):`);
    for (const problem of problems) console.error(`- ${problem}`);
    process.exitCode = 1;
} else {
    console.log('Monster ecology check passed.');
    console.log(`First-run chapter counts: ${Object.values(FirstRunMonsterRosters).map(entry => entry.monsterIds.length).join(', ')}`);
    console.log(`First-run monster art still required: ${RequiredFirstRunMonsterArtIds.length}`);
    console.log(`Formal weapon form-band gaps remaining: ${WeaponDistributionContract.gapFillCount}`);
}
