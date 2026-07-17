import { readFileSync } from 'node:fs';
import { MonsterDatabase } from '../src/js/data/Monsters.js';
import { OverworldHabitats } from '../src/js/data/OverworldMapRegistry.js';
import {
    buildMonsterCombatActions,
    ChapterOneTwoCombatMonsterIds
} from '../src/js/data/MonsterCombatProfiles.js';
import RealtimeCombatSession, { CombatSessionPhase } from '../src/js/managers/RealtimeCombatSession.js';

const problems = [];
const runtimeEffectIds = new Set();
const expectedIds = new Set(
    OverworldHabitats
        .filter(habitat => habitat.chapter <= 2)
        .flatMap(habitat => habitat.monsterIds)
        .concat(['ambush_mantis', 'forest_guardian', 'lich'])
);

for (const id of expectedIds) {
    const monster = MonsterDatabase[id];
    if (!monster) {
        problems.push(`${id}: missing MonsterDatabase entry`);
        continue;
    }
    if (!ChapterOneTwoCombatMonsterIds.includes(id)) problems.push(`${id}: missing basic attack profile`);
    const actions = buildMonsterCombatActions(monster, 2);
    actions.forEach(action => {
        if (action.effect) runtimeEffectIds.add(action.effect);
    });
    const basic = actions.filter(action => !action.isSkill);
    const skills = actions.filter(action => action.isSkill);
    if (basic.length !== 1) problems.push(`${id}: expected exactly one basic attack, found ${basic.length}`);
    if (skills.length !== (monster.skills || []).length) {
        problems.push(`${id}: ${monster.skills?.length || 0} declared skills but ${skills.length} runtime skills`);
    }
    if ((monster.skills || []).length === 0 && actions.length !== 1) {
        problems.push(`${id}: skill-less monster gained an extra action`);
    }
}

const combatLabSource = readFileSync(new URL('../src/js/scenes/CombatVfxLab.js', import.meta.url), 'utf8');
const combatFlowSource = readFileSync(new URL('../src/js/managers/CombatFlowController.js', import.meta.url), 'utf8');
const adventureSource = readFileSync(new URL('../src/js/scenes/AdventureScene.js', import.meta.url), 'utf8');
const dungeonSource = readFileSync(new URL('../src/js/scenes/DungeonScene.js', import.meta.url), 'utf8');

for (const effectId of runtimeEffectIds) {
    if (!combatLabSource.includes(`effect === '${effectId}'`)) {
        problems.push(`${effectId}: runtime monster effect has no CombatVfxLab dispatcher`);
    }
}
if (!combatLabSource.includes("event.type === 'monster:attack-release'")
    || !combatLabSource.includes('this.playMonsterEffect(event.attack.effect)')) {
    problems.push('CombatVfxLab: monster release event is not connected to the VFX dispatcher');
}
if (!combatFlowSource.includes('new CombatVfxLab(')) {
    problems.push('CombatFlowController: production combat does not construct CombatVfxLab');
}
if (!adventureSource.includes('CombatFlowController') || !dungeonSource.includes('CombatFlowController')) {
    problems.push('Adventure/Dungeon: a production scene is missing CombatFlowController integration');
}

const poisonActions = buildMonsterCombatActions(MonsterDatabase.poison_spider, 0);
const poison = poisonActions.find(action => action.skillId === 'poison_bite');
const session = new RealtimeCombatSession({
    player: { maxHp: 100, hp: 100 },
    monster: { id: 'poison_spider', name: '毒蜘蛛', maxHp: 100, attacks: poisonActions },
    loadout: { main: { damage: 10 }, offhand: { enabled: false } }
});
session.phase = CombatSessionPhase.RUNNING;
session.pendingMonsterImpact = { attack: poison, total: 0, remaining: 0 };
session.resolveMonsterImpact();
if (!session.player.statuses.some(status => status.id === 'poison_bite_poison')) {
    problems.push('poison_bite: did not apply its poison status');
}
if (session.monster.statuses.some(status => status.id === 'poison_bite_poison')) {
    problems.push('poison_bite: incorrectly applied the player debuff to the monster');
}

const lichActions = buildMonsterCombatActions(MonsterDatabase.lich, 0);
const summon = lichActions.find(action => action.skillId === 'summon_skeleton');
session.monster.statuses.length = 0;
session.pendingMonsterImpact = { attack: summon, total: 0, remaining: 0 };
session.resolveMonsterImpact();
if (!session.monster.statuses.some(status => status.interceptHits === 1)) {
    problems.push('summon_skeleton: did not create an intercepting skeleton');
}
if (session.player.statuses.some(status => status.interceptHits === 1)) {
    problems.push('summon_skeleton: incorrectly applied the monster buff to the player');
}

const guardianActions = buildMonsterCombatActions(MonsterDatabase.forest_guardian, 0);
const regeneration = guardianActions.find(action => action.skillId === 'regeneration');
const guardianSession = new RealtimeCombatSession({
    player: { maxHp: 100, hp: 100 },
    monster: { id: 'forest_guardian', name: '古樹守衛', maxHp: 100, attacks: guardianActions },
    loadout: { main: { damage: 10 }, offhand: { enabled: false } }
});
guardianSession.phase = CombatSessionPhase.RUNNING;
guardianSession.pendingMonsterImpact = { attack: regeneration, total: 0, remaining: 0 };
guardianSession.resolveMonsterImpact();
if (!guardianSession.monster.statuses.some(status => status.id === 'regeneration_regen')) {
    problems.push('regeneration: did not apply its buff to the monster');
}
if (guardianSession.player.statuses.some(status => status.id === 'regeneration_regen')) {
    problems.push('regeneration: incorrectly applied the monster buff to the player');
}

const vanishActions = buildMonsterCombatActions(MonsterDatabase.ambush_mantis, 0);
const vanish = vanishActions.find(action => action.skillId === 'vanish');
if (vanish?.monsterEffect?.modifiers?.dodgeChance !== 0.5) {
    problems.push('vanish: expected 50% monster dodge chance');
}
if (vanish?.monsterEffect?.modifiers?.critChance !== 0.5) {
    problems.push('vanish: expected 50% monster critical chance');
}
const vanishSession = new RealtimeCombatSession({
    player: { maxHp: 100, hp: 100 },
    monster: { id: 'ambush_mantis', name: '伏擊螳螂', maxHp: 100, attacks: vanishActions },
    loadout: { main: { damage: 10 }, offhand: { enabled: false } }
});
vanishSession.phase = CombatSessionPhase.RUNNING;
vanishSession.pendingMonsterImpact = { attack: vanish, total: 0, remaining: 0 };
vanishSession.resolveMonsterImpact();
const basicMantisAttack = vanishActions.find(action => !action.isSkill);
let criticalHit = null;
vanishSession.subscribe(event => {
    if (event.type === 'monster:hit') criticalHit = event;
});
const originalRandom = Math.random;
try {
    Math.random = () => 0;
    vanishSession.pendingMonsterImpact = { attack: basicMantisAttack, total: 0, remaining: 0 };
    vanishSession.resolveMonsterImpact();
} finally {
    Math.random = originalRandom;
}
if (!criticalHit?.critical || criticalHit.damage !== Math.floor(basicMantisAttack.damage * 1.5)) {
    problems.push('vanish: monster critical chance is not applied to runtime damage');
}

if (problems.length > 0) {
    console.error(`Monster combat check failed (${problems.length})`);
    problems.forEach(problem => console.error(`- ${problem}`));
    process.exitCode = 1;
} else {
    console.log(`Monster combat check passed (${expectedIds.size} Chapter 1-2 monsters).`);
}
