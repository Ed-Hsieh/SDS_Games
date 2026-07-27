import { readFileSync } from 'node:fs';
import ChapterDemoSession from '../src/js/combat-demo/ChapterDemoSession.js';
import {
    ChapterOneDemoRooms,
    ChapterOneEvidenceIds,
    isExitAvailable
} from '../src/js/combat-demo/ChapterOneDemoRoute.js';
import {
    getDemoMonster,
    getDemoStoryBeats,
    rollDemoDrops
} from '../src/js/combat-demo/DemoDataAdapter.js';
import DemoCombatController from '../src/js/combat-demo/DemoCombatController.js';
import {
    DemoWeaponForms,
    DemoWeaponActionProfiles,
    intersectsDemoHitbox
} from '../src/js/combat-demo/DemoWeaponActions.js';

const problems = [];
const expectedRooms = [
    'south_gate_camp',
    'south_gate_farmland',
    'hunter_boardwalk',
    'old_campfire_site',
    'silver_snare_pass'
];
const expectedMonsters = ['wild_wolf', 'poison_spider', 'ambush_mantis'];

for (const roomId of expectedRooms) {
    if (!ChapterOneDemoRooms[roomId]) problems.push(`missing room: ${roomId}`);
}
if (Object.keys(ChapterOneDemoRooms).length !== expectedRooms.length) {
    problems.push('the demo route must contain exactly five approved rooms');
}
if (ChapterOneEvidenceIds.length !== 3) {
    problems.push('the Chapter 1 route must contain exactly three evidence records');
}

for (const monsterId of expectedMonsters) {
    const monster = getDemoMonster(monsterId, 8);
    if (!monster.actions.length) problems.push(`${monsterId}: no formal combat actions`);
    if (!Number.isFinite(monster.maxHp) || monster.maxHp <= 0) {
        problems.push(`${monsterId}: invalid formal health`);
    }
    const drops = rollDemoDrops(monster, { rng: () => 0 });
    for (const drop of drops) {
        if (!drop.item?.id) problems.push(`${monsterId}: unresolved drop ${drop.itemId}`);
    }
}

const mantis = getDemoMonster('ambush_mantis', 8);
const vanish = mantis.actions.find(action => action.skillId === 'vanish');
if (vanish?.monsterEffect?.modifiers?.critChance !== 0.5
    || vanish?.monsterEffect?.modifiers?.dodgeChance !== 0.5) {
    problems.push('ambush_mantis: vanish must use the formal 50% crit and evasion effect');
}
const poison = mantis.actions.find(action => action.skillId === 'poison_bite');
if (!poison?.playerEffect?.damagePerSecond) {
    problems.push('ambush_mantis: poison bite has no formal player damage-over-time effect');
}

for (const evidenceId of ChapterOneEvidenceIds) {
    if (!getDemoStoryBeats('ch1_s06_three_landmarks', evidenceId).length) {
        problems.push(`${evidenceId}: missing formal story checkpoint beats`);
    }
}
if (!getDemoStoryBeats('ch1_s07_silver_snare').length) {
    problems.push('silver snare: missing formal story beats');
}
if (!getDemoStoryBeats('ch1_s08_cold_forge_smoke').length) {
    problems.push('town return: missing formal continuation beats');
}

const session = new ChapterDemoSession({ capacity: 2 });
const bossExit = ChapterOneDemoRooms.old_campfire_site.exits
    .find(exit => exit.id === 'to_mantis');
const shortcutReturn = ChapterOneDemoRooms.south_gate_farmland.exits
    .find(exit => exit.id === 'shortcut_to_campfire');
if (!shortcutReturn || isExitAvailable(shortcutReturn, session)) {
    problems.push('the return shortcut must exist and remain closed before activation');
}
if (isExitAvailable(bossExit, session)) {
    problems.push('Boss route opened before all evidence was collected');
}
ChapterOneEvidenceIds.forEach(id => session.recordEvidence(id));
if (!isExitAvailable(bossExit, session)) {
    problems.push('Boss route remained closed after all evidence was collected');
}
session.shortcutOpen = true;
if (!isExitAvailable(shortcutReturn, session)) {
    problems.push('the return shortcut remained closed after activation');
}

session.setCheckpoint('old_campfire_site');
session.markRoomDefeated('south_gate_farmland');
session.markRoomDefeated('silver_snare_pass');
session.setRoomLoot('south_gate_farmland', [{
    id: 'test-drop',
    itemId: 'slime_gel',
    item: { id: 'slime_gel', name: '史萊姆凝膠', type: 'material' },
    quantity: 1
}]);
session.writeFlag('demo.boss.defeated', true);
if (session.getRoomLoot('south_gate_farmland').length !== 1) {
    problems.push('unclaimed world loot did not persist across room state');
}
session.clearCombatResets();
if (session.checkpointId !== 'old_campfire_site') {
    problems.push('death reset lost the active campfire');
}
if (session.defeatedRooms.size !== 0 || session.readFlag('demo.boss.defeated')) {
    problems.push('death reset did not restore ordinary enemies and the Boss');
}
if (session.roomLoot.size !== 0) {
    problems.push('death reset did not clear world loot with its respawned enemies');
}
if (!ChapterOneEvidenceIds.every(id => session.hasEvidence(id))) {
    problems.push('death reset incorrectly removed collected evidence');
}

if (DemoWeaponForms.length !== 5) {
    problems.push('the player action set must contain exactly five weapon forms');
}
for (const form of DemoWeaponForms) {
    const profile = DemoWeaponActionProfiles[form];
    if (!profile?.item?.id) {
        problems.push(`${form}: missing formal equipment record`);
        continue;
    }
    if (profile.item.weaponForm !== form) {
        problems.push(`${form}: formal equipment uses ${profile.item.weaponForm || 'no form'}`);
    }
    const attacks = [...profile.lightCombo, profile.heavy];
    if (!profile.lightCombo.length || !profile.heavy) {
        problems.push(`${form}: incomplete light or heavy action set`);
    }
    for (const attack of attacks) {
        if (!(attack.duration > 0)
            || !(attack.activeStart >= 0)
            || !(attack.activeEnd > attack.activeStart)
            || !(attack.activeEnd < 1)) {
            problems.push(`${form}/${attack.id}: invalid attack timing`);
        }
        if (!['arc', 'thrust', 'projectile', 'impact'].includes(attack.hitbox?.kind)) {
            problems.push(`${form}/${attack.id}: invalid hitbox kind`);
        }
        if (!(attack.hitbox?.reach > 0)) {
            problems.push(`${form}/${attack.id}: missing hitbox reach`);
        }
    }

    const controller = new DemoCombatController();
    if (!controller.setWeaponForm(form) || controller.weaponForm !== form) {
        problems.push(`${form}: controller cannot select the weapon form`);
    }
    if (!controller.tryLightAttack() || controller.getCurrentAttack()?.id !== profile.lightCombo[0].id) {
        problems.push(`${form}: controller does not begin the formal light action`);
    }
}

const hitboxCases = [
    {
        label: 'arc',
        hitbox: { kind: 'arc', reach: 2.5, inner: 0.2, halfAngle: 0.75 },
        hit: { distance: 1.8, forward: 1.8, lateral: 0, radius: 0.4 },
        miss: { distance: 1.8, forward: -1.8, lateral: 0, radius: 0.4 }
    },
    {
        label: 'thrust',
        hitbox: { kind: 'thrust', reach: 3.5, start: 0.4, width: 0.35 },
        hit: { distance: 2, forward: 2, lateral: 0.2, radius: 0.35 },
        miss: { distance: 2, forward: 2, lateral: 1.4, radius: 0.35 }
    },
    {
        label: 'projectile',
        hitbox: { kind: 'projectile', reach: 6, start: 0.5, width: 0.7 },
        hit: { distance: 4, forward: 4, lateral: 0.4, radius: 0.35 },
        miss: { distance: 6.8, forward: 6.8, lateral: 0, radius: 0.35 }
    },
    {
        label: 'impact',
        hitbox: { kind: 'impact', reach: 2.5, radius: 1 },
        hit: { distance: 2.5, forward: 2.5, lateral: 0.5, radius: 0.4 },
        miss: { distance: 2.5, forward: 2.5, lateral: 2, radius: 0.4 }
    }
];
for (const test of hitboxCases) {
    if (!intersectsDemoHitbox(test.hitbox, test.hit)) {
        problems.push(`${test.label}: expected hit was rejected`);
    }
    if (intersectsDemoHitbox(test.hitbox, test.miss)) {
        problems.push(`${test.label}: expected miss was accepted`);
    }
}

const sceneSource = readFileSync(
    new URL('../src/js/scenes/ThreeCombatDemoScene.js', import.meta.url),
    'utf8'
);
const adapterSource = readFileSync(
    new URL('../src/js/combat-demo/DemoDataAdapter.js', import.meta.url),
    'utf8'
);
const worldSource = readFileSync(
    new URL('../src/js/combat-demo/DemoWorldBuilder.js', import.meta.url),
    'utf8'
);
const forbiddenPersistence = [
    'GameManager.addToInventory',
    'localStorage.setItem',
    'saveGame(',
    'saveState('
];
for (const token of forbiddenPersistence) {
    if (sceneSource.includes(token) || adapterSource.includes(token)) {
        problems.push(`memory-only contract violated by: ${token}`);
    }
}
if (!adapterSource.includes('calculateDrops(') || !adapterSource.includes('resolveItemById(')) {
    problems.push('drop adapter does not use the formal drop and item resolvers');
}
if (!adapterSource.includes('buildMonsterCombatActions(')) {
    problems.push('monster adapter does not use formal combat profiles');
}
if (!worldSource.includes('session.hasEvidence(room.interaction.id)')) {
    problems.push('collected evidence markers can respawn after a room reload');
}
for (const token of [
    'applyWeaponPose(',
    'Bone.011',
    'Bone.013',
    'facePointerDirection(',
    'aimRaycaster.ray.intersectPlane(',
    'playerModelBaseY',
    'beginPoseBlend(',
    'finishPoseBlend(',
    'kineticChannel(',
    'applyHitReaction(',
    'playerHitReaction',
    'updateHitboxPreview(',
    'hitStopRemaining',
    'Digit${index + 1}'
]) {
    if (!sceneSource.includes(token)) {
        problems.push(`player action presentation is missing: ${token}`);
    }
}
if (!worldSource.includes('wood, false')) {
    problems.push('boardwalk floor planks are still registered as blocking colliders');
}

if (problems.length) {
    console.error(`Chapter 1 3D demo check failed (${problems.length})`);
    problems.forEach(problem => console.error(`- ${problem}`));
    process.exit(1);
}

console.log('Chapter 1 3D demo check passed');
console.log(`Rooms: ${expectedRooms.length}`);
console.log(`Evidence: ${ChapterOneEvidenceIds.length}`);
console.log(`Formal monsters: ${expectedMonsters.join(', ')}`);
console.log(`Weapon forms: ${DemoWeaponForms.join(', ')}`);
