import fs from 'node:fs';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
globalThis.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    innerWidth: 1920,
    innerHeight: 1080
};
globalThis.document = {
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelector: () => null,
    querySelectorAll: () => []
};
globalThis.requestAnimationFrame = () => 1;
globalThis.cancelAnimationFrame = () => {};

const { default: GameManager } = await import('../src/js/managers/GameManager.js');
const { default: AdventureScene } = await import('../src/js/scenes/AdventureScene.js');
const { default: WorldMap } = await import('../src/js/utils/WorldMap.js');
const { createLocationEncounter } = await import('../src/js/managers/AdventureEncounterManager.js');
const { MonsterDatabase } = await import('../src/js/data/Monsters.js');
const { OverworldHabitats } = await import('../src/js/data/OverworldMapRegistry.js');
const { getStoryObjectiveHint } = await import('../src/js/data/StoryObjectiveHints.js');

const failures = [];
const check = (condition, message) => {
    if (!condition) failures.push(message);
};

const adventureSource = fs.readFileSync(new URL('../src/js/scenes/AdventureScene.js', import.meta.url), 'utf8');
const adventureView = fs.readFileSync(new URL('../src/views/adventure.html', import.meta.url), 'utf8');
check(!adventureSource.includes('ArrowUp') && !adventureSource.includes('ArrowDown'), 'Arrow-key map movement returned');
check(adventureView.includes('id="adventure-onboarding"'), 'Adventure onboarding surface is missing');
for (const flag of ['wasdMoved', 'questOpened', 'inventoryOpened', 'weaponEquipped']) {
    check(adventureSource.includes(flag), `Onboarding step ${flag} is missing`);
}

const originalFlags = GameManager.state.flags;
const originalMapState = GameManager.state.mapState;
GameManager.state.flags = { 'story.run': 1 };
GameManager.state.mapState = null;

const map = new WorldMap(GameManager.getCharacter(), 1000, 600);
const sample = map.sampleCurrentMonster(() => 0);
check(sample?.monsterId === 'slime', 'Chapter 1 start habitat no longer begins with its fixed pool');
check(!Object.hasOwn(sample || {}, 'targetLevel'), 'World map still rerolls a monster target level');
const encounter = createLocationEncounter({ ...sample, targetLevel: 9 }, map.getCurrentTile());
check(encounter?.monster?.level === MonsterDatabase.slime.level, 'Encounter rescaled a fixed-level monster');
check(encounter?.monster?.maxHp === MonsterDatabase.slime.maxHp, 'Encounter rescaled monster combat stats before balance work');

for (const habitat of OverworldHabitats) {
    for (const monsterId of habitat.monsterIds) {
        const monster = MonsterDatabase[monsterId];
        check(Boolean(monster), `${habitat.id} references missing ${monsterId}`);
        check(
            monster && monster.level >= habitat.levelRange[0] && monster.level <= habitat.levelRange[1],
            `${monsterId} is outside ${habitat.id}'s declared fixed range`
        );
    }
}

const scene = Object.create(AdventureScene.prototype);
scene.worldMap = {
    discoveredLandmarks: new Set(),
    isLandmarkDiscovered: entry => scene.worldMap.discoveredLandmarks.has(entry.id)
};
GameManager.state.flags['story.ch1.fieldVictories'] = 0;
check(Boolean(scene.getChapterOneSurveyBlock({ id: 'south_gate_farmland' })), 'Farmland opens before the first preparation battles');
GameManager.state.flags['story.ch1.fieldVictories'] = 2;
check(scene.getChapterOneSurveyBlock({ id: 'south_gate_farmland' }) === '', 'Farmland did not open after two victories');
check(Boolean(scene.getChapterOneSurveyBlock({ id: 'hunter_boardwalk' })), 'Boardwalk does not require the previous clue');
scene.worldMap.discoveredLandmarks.add('south_gate_farmland');
GameManager.state.flags['story.ch1.fieldVictories'] = 4;
check(Boolean(scene.getChapterOneSurveyBlock({ id: 'hunter_boardwalk' })), 'Boardwalk opens before five victories');
GameManager.state.flags['story.ch1.fieldVictories'] = 5;
check(scene.getChapterOneSurveyBlock({ id: 'hunter_boardwalk' }) === '', 'Boardwalk did not open after five victories');
scene.worldMap.discoveredLandmarks.add('hunter_boardwalk');
GameManager.state.flags['story.ch1.fieldVictories'] = 6;
check(Boolean(scene.getChapterOneSurveyBlock({ id: 'old_campfire_site' })), 'Campfire opens before seven victories');
GameManager.state.flags['story.ch1.fieldVictories'] = 7;
check(scene.getChapterOneSurveyBlock({ id: 'old_campfire_site' }) === '', 'Campfire did not open after seven victories');

const openingHint = getStoryObjectiveHint('ch1_s06_three_landmarks', {
    discoveredLandmarkIds: [],
    chapterOneFieldVictories: 0
});
const finalSurveyHint = getStoryObjectiveHint('ch1_s06_three_landmarks', {
    discoveredLandmarkIds: ['south_gate_farmland', 'hunter_boardwalk'],
    chapterOneFieldVictories: 7
});
check(openingHint?.text.includes('0/2'), 'Chapter 1 tracker does not teach the first preparation battles');
check(finalSurveyHint?.text && !finalSurveyHint.text.includes('/7'), 'Chapter 1 tracker does not advance to the final clue');

GameManager.state.flags = originalFlags;
GameManager.state.mapState = originalMapState;

if (failures.length) {
    console.error(`Chapter 1 gameplay check found ${failures.length} failure(s):`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
}

console.log('Chapter 1 gameplay check passed.');
