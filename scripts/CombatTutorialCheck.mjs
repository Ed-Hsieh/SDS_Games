import RealtimeCombatSession, { CombatSessionPhase } from '../src/js/managers/RealtimeCombatSession.js';
import { getWeaponCombatProfile } from '../src/js/utils/WeaponCombatProfile.js';
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
const combatLabView = fs.readFileSync(new URL('../combat-vfx-lab.html', import.meta.url), 'utf8');
const sharedCombatView = fs.readFileSync(new URL('../src/js/components/CombatStageView.js', import.meta.url), 'utf8');
const combatFlowSource = fs.readFileSync(new URL('../src/js/managers/CombatFlowController.js', import.meta.url), 'utf8');
const combatLabSource = fs.readFileSync(new URL('../src/js/scenes/CombatVfxLab.js', import.meta.url), 'utf8');
const gameManagerSource = fs.readFileSync(new URL('../src/js/managers/GameManager.js', import.meta.url), 'utf8');
const audioSource = fs.readFileSync(new URL('../src/js/utils/AudioManager.js', import.meta.url), 'utf8');
check(!adventureView.includes('data-combat-stage'), 'Adventure view still embeds a second combat stage');
check(
    combatLabSource.includes('mountSharedCombatPreview(root)')
        && sharedCombatView.includes('export function mountSharedCombatPreview'),
    'Combat lab and adventure do not mount the same combat-stage view'
);
for (const requiredId of ['player-buff-list', 'player-debuff-list', 'monster-status-row']) {
    check(sharedCombatView.includes(`id="${requiredId}"`), `Shared combat stage is missing #${requiredId}`);
}
check(
    combatFlowSource.includes('applyEffect: false')
        && combatFlowSource.includes('notifyType: false')
        && gameManagerSource.includes('if (options.notifyType !== false)'),
    'Combat potion use still applies duplicate character effects or redraws the full adventure UI'
);
for (const durabilityId of ['main-weapon-durability', 'offhand-weapon-durability']) {
    check(sharedCombatView.includes(`id="${durabilityId}"`), `Combat HUD is missing #${durabilityId}`);
    check(combatLabView.includes(`id="${durabilityId}"`), `Combat lab HUD is missing #${durabilityId}`);
}
check(
    combatFlowSource.includes("audioManager.play('weapon-break'")
        && audioSource.includes("'weapon-break': this.sfxWeaponBreak")
        && combatFlowSource.includes("event.weapon?.effect !== 'unarmed'"),
    'Weapon destruction has no dedicated break sound'
);
check(
    gameManagerSource.includes("slotType === 'armor' && itemType === 'weapon'")
        && gameManagerSource.includes('Boolean(this.state.character.equipment?.weapon)'),
    'Offhand weapon equipment is not gated by an equipped main weapon'
);

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

const unarmedMain = session.equipUnarmed('main');
const unarmedOffhand = session.equipUnarmed('offhand');
check(unarmedMain?.enabled && unarmedMain.effect === 'unarmed', 'Broken main weapon did not switch to an enabled fist attack');
check(unarmedOffhand?.enabled && unarmedOffhand.effect === 'unarmed', 'Offhand did not switch to an enabled fist attack');
check(session.playerAttack('main', 'hit'), 'Main-hand fist could not attack after weapon breakage');
check(session.playerAttack('offhand', 'hit'), 'Offhand fist could not attack after main weapon breakage');
check(
    combatLabSource.includes("if (normalizedSlot === 'main') replaceSlot('offhand')")
        && combatLabSource.includes("else if (effect === 'unarmed') this.engine.unarmedStrike()"),
    'Combat presentation does not preserve both fist controls and unarmed impact VFX after main weapon breakage'
);

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

const failedEscapeEvents = [];
const failedEscapeSession = new RealtimeCombatSession({
    player: { maxHp: 100, hp: 100, potions: 0 },
    monster: { maxHp: 100, attacks: [{ id: 'normal', damage: 1, telegraph: 1 }] },
    fleeChance: 0.35,
    fleeCooldown: 2,
    random: () => 0.9
});
failedEscapeSession.subscribe(event => failedEscapeEvents.push(event));
failedEscapeSession.start();
check(failedEscapeSession.flee(), 'Probability escape attempt was rejected');
check(failedEscapeSession.getSnapshot().phase === CombatSessionPhase.RUNNING, 'Failed escape ended combat');
check(failedEscapeEvents.some(event => event.type === 'player:flee-failed'), 'Failed escape event was not emitted');
check(!failedEscapeSession.flee(), 'Escape ignored its retry cooldown');
failedEscapeSession.destroy();

const successfulEscapeSession = new RealtimeCombatSession({
    player: { maxHp: 100, hp: 100, potions: 0 },
    monster: { maxHp: 100, attacks: [{ id: 'normal', damage: 1, telegraph: 1 }] },
    fleeChance: 0.35,
    random: () => 0.1
});
successfulEscapeSession.start();
check(successfulEscapeSession.flee(), 'Successful probability escape was rejected');
check(successfulEscapeSession.getSnapshot().phase === CombatSessionPhase.ESCAPED, 'Successful escape did not end combat');
successfulEscapeSession.destroy();

function createWeaponProfileSession(form, options = {}) {
    const profile = getWeaponCombatProfile({ equipment: { weapon: { weaponForm: form } } });
    const profileEvents = [];
    const profileSession = new RealtimeCombatSession({
        player: { maxHp: 200, hp: 200, potions: 0 },
        monster: { maxHp: 2000, attacks: [{ id: 'normal', damage: 1, telegraph: 10 }] },
        loadout: {
            main: {
                id: `${form}_test`,
                name: form,
                effect: form,
                icon: '/weapon.webp',
                damage: 100,
                profile,
                element: options.element || '',
                hasArmor: options.hasArmor ?? true,
                monsterDefense: options.monsterDefense ?? 0,
                enabled: true
            },
            offhand: { enabled: false }
        }
    });
    profileSession.subscribe(event => profileEvents.push(event));
    profileSession.start();
    return { profileSession, profileEvents };
}

for (const weaponCase of [
    { form: 'sword', hits: 1, trigger: 'steadyStance', buff: 'steady-stance' },
    { form: 'dagger', hits: 2, trigger: 'quickChain' },
    { form: 'heavy', hits: 1, trigger: 'bulwarkGuard', buff: 'bulwark-guard' },
    { form: 'focus', hits: 2, trigger: 'magicBolt' },
    { form: 'lance', hits: 1, trigger: 'piercingLine', buff: 'piercing-line', monsterDefense: 12 }
]) {
    const { profileSession, profileEvents } = createWeaponProfileSession(weaponCase.form, weaponCase);
    for (let hit = 0; hit < weaponCase.hits; hit += 1) {
        profileSession.resolvePlayerHit({ slot: 'main', hitType: 'hit', weapon: profileSession.loadout.main });
    }
    check(
        profileEvents.some(event => event.type === 'player:weapon-trigger' && event.triggerType === weaponCase.trigger),
        `${weaponCase.form} weapon profile did not emit ${weaponCase.trigger}`
    );
    if (weaponCase.buff) {
        check(
            profileSession.getSnapshot().player.buffs.some(buff => buff.id.includes(weaponCase.buff)),
            `${weaponCase.form} weapon profile did not expose its combat buff`
        );
    }
    profileSession.destroy();
}

if (failures.length) {
    console.error(`Combat tutorial check found ${failures.length} failure(s):`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
}

console.log('Combat tutorial check passed.');
