import { MonsterDatabase } from '../src/js/data/Monsters.js';
import { OverworldHabitats } from '../src/js/data/OverworldMapRegistry.js';
import {
    buildMonsterCombatActions,
    ChapterOneTwoCombatMonsterIds
} from '../src/js/data/MonsterCombatProfiles.js';
import RealtimeCombatSession, { CombatSessionPhase } from '../src/js/managers/RealtimeCombatSession.js';

const problems = [];
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

if (problems.length > 0) {
    console.error(`Monster combat check failed (${problems.length})`);
    problems.forEach(problem => console.error(`- ${problem}`));
    process.exitCode = 1;
} else {
    console.log(`Monster combat check passed (${expectedIds.size} Chapter 1-2 monsters).`);
}
