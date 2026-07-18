import RealtimeCombatSession, { CombatSessionPhase } from '../src/js/managers/RealtimeCombatSession.js';
import fs from 'node:fs';

globalThis.requestAnimationFrame = () => 1;
globalThis.cancelAnimationFrame = () => {};
globalThis.document = {
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {}
};

const { default: CombatFlowController } = await import('../src/js/managers/CombatFlowController.js');

const failures = [];
const check = (condition, message) => {
    if (!condition) failures.push(message);
};

const adventureView = fs.readFileSync(new URL('../src/views/adventure.html', import.meta.url), 'utf8');
const sharedCombatView = fs.readFileSync(new URL('../src/js/components/CombatStageView.js', import.meta.url), 'utf8');
check(!adventureView.includes('data-combat-stage'), 'Adventure view still embeds a second combat stage');
for (const requiredId of ['player-buff-list', 'player-debuff-list', 'monster-status-row']) {
    check(sharedCombatView.includes(`id="${requiredId}"`), `Shared combat stage is missing #${requiredId}`);
}

const events = [];
const session = new RealtimeCombatSession({
    player: { maxHp: 100, hp: 50, potions: 1, potionHeal: 30 },
    monster: {
        maxHp: 500,
        initialDelay: 0.5,
        attacks: [
            { id: 'normal', damage: 10, telegraph: 0.5 },
            { id: 'prologue_stag_charge', damage: 999, telegraph: 1 }
        ]
    },
    loadout: {
        main: { damage: 10, windup: 0.01, cooldown: 0.5, enabled: true },
        offhand: { enabled: false }
    }
});
session.subscribe(event => events.push(event));
session.start();
session.setMonsterFlowPaused(true);

const actionDelay = session.getSnapshot().nextMonsterActionIn;
session.tick(performance.now() + 1000);
check(session.getSnapshot().nextMonsterActionIn === actionDelay, 'Paused monster timer advanced');
check(session.getSnapshot().phase === CombatSessionPhase.RUNNING, 'Enemy-only pause stopped the whole battle');

session.playerAttack('main', 'hit');
session.tick(performance.now() + 1100);
check(events.some(event => event.type === 'player:hit'), 'Player could not attack while monster flow was paused');
check(!events.some(event => event.type === 'monster:telegraph'), 'Monster started an attack during the tutorial lock');

check(session.usePotion(), 'Potion could not be used while monster flow was paused');
check(events.some(event => event.type === 'player:potion'), 'Potion event was not emitted');

check(session.forceMonsterAttack('prologue_stag_charge'), 'Scripted charge could not be forced');
const forcedSnapshot = session.getSnapshot();
check(!forcedSnapshot.monsterFlowPaused, 'Forced charge did not release the monster lock');
check(forcedSnapshot.monsterIntent?.attack?.id === 'prologue_stag_charge', 'Wrong attack was queued after tutorial completion');

const tutorial = Object.create(CombatFlowController.prototype);
tutorial.tutorialState = { stage: 'attack', complete: false };
tutorial.setTutorialPrompt = () => {};
let forcedChargeCount = 0;
tutorial.lab = { forceMonsterAttack: id => {
    if (id === 'prologue_stag_charge') forcedChargeCount += 1;
    return true;
} };

tutorial.updateTutorial({ type: 'player:miss' });
check(tutorial.tutorialState.stage === 'attack', 'Miss incorrectly completed the attack lesson');
check(tutorial.handleTutorialPotionAttempt(), 'Early potion input was not intercepted');
check(tutorial.tutorialState.stage === 'attack', 'Early potion input advanced the tutorial');
check(tutorial.handleTutorialFleeAttempt(), 'Early flee input was not intercepted');
check(tutorial.tutorialState.stage === 'attack', 'Early flee input advanced the tutorial');

tutorial.updateTutorial({ type: 'player:hit', critical: true });
check(tutorial.tutorialState.stage === 'potion', 'Hit or critical did not advance to the potion lesson');
check(tutorial.handleTutorialWeaponAttempt(), 'Weapon input was not locked after the attack lesson');
check(tutorial.handleTutorialPotionAttempt() === false, 'Potion was blocked during the potion lesson');
tutorial.updateTutorial({ type: 'player:potion' });
check(tutorial.tutorialState.stage === 'flee', 'Potion did not advance to the flee lesson');
check(tutorial.handleTutorialFleeAttempt(), 'Tutorial flee attempt was not handled');
check(tutorial.tutorialState.stage === 'complete', 'Flee attempt did not complete the tutorial');
check(forcedChargeCount === 1, 'Tutorial completion did not queue exactly one scripted charge');

session.destroy();

if (failures.length) {
    console.error(`Combat tutorial check found ${failures.length} failure(s):`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
}

console.log('Combat tutorial check passed.');
