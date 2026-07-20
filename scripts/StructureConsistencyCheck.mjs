import fs from 'node:fs';
import path from 'node:path';
import { createRuntimeItem } from '../src/js/models/ItemFactory.js';
import { createMonsterInstance } from '../src/js/managers/MonsterManager.js';
import { DefaultKnownRecipeIds } from '../src/js/data/RecipeDiscoveries.js';
import { RecipeDiscoveryDatabase } from '../src/js/data/RecipeDiscoveries.js';
import { RecipeSeriesDatabase } from '../src/js/data/RecipeSeries.js';
import { RecipeDatabase } from '../src/js/data/Recipes.js';
import { BlueprintDropDatabase } from '../src/js/data/BlueprintDrops.js';
import { EquipmentDatabase } from '../src/js/data/Equipment.js';

const root = process.cwd();
const problems = [];

function push(section, message) {
    problems.push({ section, message });
}

function walk(dir, predicate = () => true) {
    const result = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            result.push(...walk(fullPath, predicate));
        } else if (predicate(fullPath)) {
            result.push(fullPath);
        }
    }
    return result;
}

function rel(file) {
    return path.relative(root, file).replace(/\\/g, '/');
}

function read(file) {
    return fs.readFileSync(file, 'utf8');
}

const jsFiles = walk(path.join(root, 'src/js'), file => file.endsWith('.js'));

const encounterSource = read(path.join(root, 'src/js/managers/AdventureEncounterManager.js'));
if (!encounterSource.includes('getWeaponCombatElement(item)')) {
    push('combat-vfx', 'adventure encounters must derive weapon VFX elements through the canonical resolver');
}

const combatVfxSource = read(path.join(root, 'src/js/scenes/CombatVfxLab.js'));
if (!combatVfxSource.includes('syncWeaponElement(event.weapon)')) {
    push('combat-vfx', 'runtime attacks must synchronize equipped weapon elements before rendering VFX');
}

for (const file of jsFiles) {
    const source = read(file);
    if (/from\s+['"][^'"]+\?v=|import\s*\(\s*['"][^'"]+\?v=/.test(source)) {
        push('module-identity', `${rel(file)} imports a JavaScript module through a versioned URL`);
    }
}

for (const obsoleteWindowGlobal of [
    ['src/js/utils/AudioManager.js', 'window.audioManager'],
    ['src/js/utils/DevPanel.js', 'window.devPanel'],
    ['src/js/scenes/CombatVfxLab.js', 'window.combatVfxLab'],
    ['src/js/scenes/AdventureScene.js', 'window.currentAdventureScene'],
    ['src/js/main.js', 'window.gameApp']
]) {
    const [ownerPath, token] = obsoleteWindowGlobal;
    if (read(path.join(root, ownerPath)).includes(token)) {
        push('window-global', `${ownerPath} must not restore unused global ${token}`);
    }
}

for (const uiPath of [
    'src/js/scenes/QuestScene.js',
    'src/js/utils/DevPanel.js'
]) {
    if (read(path.join(root, uiPath)).includes('questManager.questStates')) {
        push('quest-boundary', `${uiPath} must use QuestManager projections and commands instead of questStates`);
    }
}

const equipmentProbe = createRuntimeItem({
    id: 'structure_probe',
    name: 'Structure Probe',
    type: 'weapon',
    rarity: 'common',
    attack: 3,
    defense: 1,
    critChance: 0.05,
    critDamage: 1.5
});
if (equipmentProbe.attack !== 3 || equipmentProbe.defense !== 1) {
    push('equipment-schema', 'runtime equipment should preserve canonical attack/defense stats');
}
if (Object.hasOwn(equipmentProbe, 'atk') || Object.hasOwn(equipmentProbe, 'def')) {
    push('equipment-schema', 'runtime equipment should not materialize atk/def aliases');
}

const monsterProbe = createMonsterInstance({
    id: 'structure_monster_probe',
    name: 'Structure Monster Probe',
    type: 'normal',
    level: 1,
    maxHp: 12,
    attack: 4,
    defense: 2
});
if (monsterProbe.hp !== 12 || monsterProbe.maxHp !== 12 || monsterProbe.attack !== 4 || monsterProbe.defense !== 2) {
    push('monster-schema', 'runtime monsters should preserve canonical hp/maxHp/attack/defense stats');
}
if (['currentHp', 'atk', 'def'].some(key => Object.hasOwn(monsterProbe, key))) {
    push('monster-schema', 'runtime monsters should not materialize currentHp/atk/def aliases');
}

const defaultKnownSeries = Object.values(RecipeSeriesDatabase)
    .filter(series => series.defaultKnown)
    .map(series => series.id);
if (defaultKnownSeries.length > 0) {
    push('blueprint-gating', `craft series should not be default-known: ${defaultKnownSeries.join(', ')}`);
}
const expectedDefaultKnownRecipes = ['health_potion_basic', 'leather_armor'];
const actualDefaultKnownRecipes = [...DefaultKnownRecipeIds].sort();
if (JSON.stringify(actualDefaultKnownRecipes) !== JSON.stringify(expectedDefaultKnownRecipes)) {
    push('blueprint-gating', `default-known recipes changed: ${actualDefaultKnownRecipes.join(', ')}`);
}
for (const [sourceId, entries] of Object.entries(BlueprintDropDatabase)) {
    if (!Array.isArray(entries)) {
        push('blueprint-catalog', `${sourceId} blueprint drops must be an array`);
    }
}

for (const [equipmentId, equipment] of Object.entries(EquipmentDatabase)) {
    if (equipment.requiredLevel !== undefined || equipment.balanceTier !== undefined || equipment.powerBudget !== undefined) {
        push('equipment-catalog', `${equipmentId} still stores derived progression metadata`);
    }
    if (equipment.stats?.maxDurability !== undefined || equipment.stats?.durability !== undefined) {
        push('equipment-catalog', `${equipmentId} duplicates durability inside stats`);
    }
}

if (fs.existsSync(path.join(root, 'src/js/managers/CharacterManager.js'))) {
    push('obsolete-facade', 'src/js/managers/CharacterManager.js is an unused CharacterLogic compatibility facade');
}
if (fs.existsSync(path.join(root, 'src/js/managers/MaterialManager.js'))) {
    push('obsolete-facade', 'src/js/managers/MaterialManager.js duplicates material lookup already owned by Materials.js');
}
const questManagerSource = read(path.join(root, 'src/js/managers/QuestManager.js'));
if (/export\s*\{[^}]*\b(?:QuestStatus|QuestType|ObjectiveType)\b/s.test(questManagerSource)) {
    push('obsolete-facade', 'QuestManager must not re-export quest definition enums owned by Quests.js');
}

for (const legacyStoryPath of [
    'src/js/managers/WorldStoryManager.js',
    'src/js/data/WorldStories.js',
    'src/js/data/StoryProgressMap.js'
]) {
    if (fs.existsSync(path.join(root, legacyStoryPath))) {
        push('legacy-story-system', `${legacyStoryPath} must not coexist with StorySceneManager and StoryJournalManager`);
    }
}

if (fs.existsSync(path.join(root, 'src/js/managers/EventManager.js'))) {
    push('obsolete-event-manager', 'EventManager.js must not restore the disconnected event execution, journal, or reward layers');
}

if (fs.existsSync(path.join(root, 'src/js/managers/ShopManager.js'))) {
    push('obsolete-shop-facade', 'ShopManager.js must not re-export shop data already owned by Items.js and MarketSupply.js');
}

for (const unusedUtilityPath of [
    'src/js/utils/VirtualInventoryList.js',
    'src/js/utils/PerformanceUtils.js'
]) {
    if (fs.existsSync(path.join(root, unusedUtilityPath))) {
        push('obsolete-utility', `${unusedUtilityPath} is a disconnected legacy utility and must not return`);
    }
}

for (const obsoletePlanningModule of [
    'src/js/data/ChapterQuestFramework.js',
    'src/js/data/CasinoRouteFramework.js'
]) {
    if (fs.existsSync(path.join(root, obsoletePlanningModule))) {
        push('obsolete-planning-module', `${obsoletePlanningModule} duplicates documentation and executable runtime authorities`);
    }
}

for (const file of jsFiles) {
    const source = read(file);
    const lines = source.split(/\r?\n/);

    lines.forEach((line, index) => {
        if (line.includes('console.log')) {
            push('debug-log', `${rel(file)}:${index + 1} contains console.log`);
        }
        if (rel(file) === 'src/js/components/ItemDetailModal.js' && /\sstyle=/.test(line)) {
            push('component-inline-style', `${rel(file)}:${index + 1} keeps modal CSS inline; use scoped CSS`);
        }
        if (/from\s+['"][^'"]*DataModel\.js['"]/.test(line) && /\bItem(Type|Rarity|Category)\b|\bSkillType\b/.test(line)) {
            push('enum-import', `${rel(file)}:${index + 1} imports enums from DataModel.js; use Enums.js`);
        }
    });

    const importSources = lines
        .filter(line => /^import\s/.test(line.trim()))
        .map(line => line.match(/from\s+['"]([^'"]+)['"]/)?.[1])
        .filter(Boolean);
    const seenSources = new Set();
    for (const sourcePath of importSources) {
        if (seenSources.has(sourcePath)) {
            push('duplicate-import', `${rel(file)} imports ${sourcePath} more than once`);
        }
        seenSources.add(sourcePath);
    }
}

const lobbyScene = read(path.join(root, 'src/js/scenes/LobbyScene.js'));
if (lobbyScene.includes('legacyFlagVisible')) {
    push('legacy-town-state', 'LobbyScene still bypasses TownStateResolver with legacy flag visibility');
}

const storyGuidanceManager = read(path.join(root, 'src/js/managers/StoryGuidanceManager.js'));
for (const lobbyOwnedStoryRule of [
    'MIA_EMERGENCY_POTION_LIMIT',
    "npcId === 'standard_bearer_frey'",
    "npcId === 'herbalist'",
    'shouldStartFirstReport('
]) {
    if (lobbyScene.includes(lobbyOwnedStoryRule)) {
        push('story-guidance-boundary', `LobbyScene must delegate town story decisions instead of owning ${lobbyOwnedStoryRule}`);
    }
}
for (const requiredGuidanceOwner of [
    'getTownNpcAction(',
    'getInitialTownAction('
]) {
    if (!storyGuidanceManager.includes(requiredGuidanceOwner)) {
        push('story-guidance-boundary', `StoryGuidanceManager is missing ${requiredGuidanceOwner}`);
    }
}

const persistentCharacterMutationPattern = /\b(?:character|char)\.(?:hp|exp|level)\s*(?:[+\-]?=|\+\+|--)/;
for (const stateClient of [
    'src/js/managers/AdventureEncounterManager.js',
    'src/js/managers/CasinoManager.js',
    'src/js/managers/CombatFlowController.js',
    'src/js/managers/DungeonManager.js',
    'src/js/managers/QuestManager.js',
    'src/js/managers/StorySceneManager.js',
    'src/js/utils/DevPanel.js'
]) {
    if (persistentCharacterMutationPattern.test(read(path.join(root, stateClient)))) {
        push('character-state-boundary', `${stateClient} must submit character health and experience commands through GameManager`);
    }
}
const characterStateAuthoritySource = read(path.join(root, 'src/js/managers/GameManager.js'));
for (const requiredCharacterAuthority of [
    'setCharacterHealth(',
    'changeCharacterHealth(',
    'addCharacterExperience(',
    'setCharacterProgress('
]) {
    if (!characterStateAuthoritySource.includes(requiredCharacterAuthority)) {
        push('character-state-boundary', `GameManager is missing ${requiredCharacterAuthority}`);
    }
}

const eventCatalog = [
    read(path.join(root, 'src/js/data/Events.js')),
    read(path.join(root, 'src/js/data/EventCatalog.js'))
].join('\n');
for (const obsoleteEventLayer of [
    'EVENT_CONTENT_OVERRIDES',
    'CLEAN_EVENT_CONTENT_OVERRIDES',
    'EVENT_STORY_RULES',
    'EVENT_LOCATION_RULES',
    'applyCleanEventText'
]) {
    if (eventCatalog.includes(obsoleteEventLayer)) {
        push('event-catalog', `Events.js still contains post-definition layer ${obsoleteEventLayer}`);
    }
}
if (/Object\.assign\s*\(\s*event\b/.test(eventCatalog)) {
    push('event-catalog', 'The event catalog still mutates event records after their definitions');
}

const casinoCatalog = read(path.join(root, 'src/js/data/CasinoRewards.js'));
if (/Object\.assign\s*\(\s*CasinoSpecialItems\b/.test(casinoCatalog)) {
    push('casino-catalog', 'casino rewards must be declared in one catalog instead of appended after definition');
}

const monsterCatalog = [
    read(path.join(root, 'src/js/data/Monsters.js')),
    read(path.join(root, 'src/js/data/MonsterProgressionBalance.js'))
].join('\n');
for (const obsoleteMonsterLayer of [
    'FirstRunMonsterCombatBalance',
    'applyFirstRunMonsterCombatBalance'
]) {
    if (monsterCatalog.includes(obsoleteMonsterLayer)) {
        push('monster-catalog', `monster values still depend on post-definition layer ${obsoleteMonsterLayer}`);
    }
}
if (/Object\.assign\s*\(\s*monster\s*,\s*balance\b/.test(monsterCatalog)) {
    push('monster-catalog', 'monster values are still overwritten by a second balance catalog');
}

const equipmentCatalog = [
    read(path.join(root, 'src/js/data/Equipment.js')),
    read(path.join(root, 'src/js/data/EquipmentCatalog.js')),
    read(path.join(root, 'src/js/data/FirstRunLootBalance.js'))
].join('\n');
for (const obsoleteEquipmentLayer of [
    'FirstRunEquipmentAdditions',
    'FirstRunBossSignatureOverrides',
    'FirstRunEquipmentSourceOverrides'
]) {
    if (equipmentCatalog.includes(obsoleteEquipmentLayer)) {
        push('equipment-catalog', `equipment data still contains post-definition layer ${obsoleteEquipmentLayer}`);
    }
}
if (/Object\.assign\s*\(\s*EquipmentDatabase\b/.test(equipmentCatalog)) {
    push('equipment-catalog', 'equipment data still mutates EquipmentDatabase after its definition');
}

const recipeCatalog = [
    read(path.join(root, 'src/js/data/Recipes.js')),
    read(path.join(root, 'src/js/data/RecipeCatalog.js')),
    read(path.join(root, 'src/js/data/RecipeDiscoveries.js')),
    read(path.join(root, 'src/js/data/RecipeDiscoveryCatalog.js')),
    read(path.join(root, 'src/js/data/BlueprintDrops.js')),
    read(path.join(root, 'src/js/data/BlueprintDropCatalog.js')),
    read(path.join(root, 'src/js/data/FirstRunLootBalance.js'))
].join('\n');
for (const obsoleteRecipeLayer of [
    'FirstRunBlueprintDropOverrides',
    'FirstRunRetiredRecipeIds',
    'FirstRunRecipeLevels',
    'FirstRunRecipeDiscoveryAdditions',
    'FirstRunBossRecipeAdditions',
    'FirstRunBossRecipeDiscoveries',
    'FirstRunBossCraftUnlocks',
    'FirstRunRecipeAdditions'
]) {
    if (recipeCatalog.includes(obsoleteRecipeLayer)) {
        push('recipe-catalog', `recipe data still contains post-definition layer ${obsoleteRecipeLayer}`);
    }
}
for (const databaseName of ['RecipeDatabase', 'RecipeDiscoveryDatabase', 'BlueprintDropDatabase']) {
    if (new RegExp(`Object\\.assign\\s*\\(\\s*${databaseName}\\b`).test(recipeCatalog)) {
        push('recipe-catalog', `recipe data still mutates ${databaseName} after its definition`);
    }
}
if (Object.keys(RecipeDatabase).length !== 61) {
    push('recipe-catalog', `expected 61 final recipes, found ${Object.keys(RecipeDatabase).length}`);
}
if (Object.keys(RecipeDiscoveryDatabase).length !== 23) {
    push('recipe-catalog', `expected 23 explicit discovery records, found ${Object.keys(RecipeDiscoveryDatabase).length}`);
}
const encyclopediaManager = read(path.join(root, 'src/js/managers/EncyclopediaManager.js'));
if (encyclopediaManager.includes('encyclopedia.blueprint.')) {
    push('blueprint-gating', 'encyclopedia data must read the canonical recipe blueprint flags');
}
for (const obsoleteEncyclopediaMutation of [
    'GameManager.state',
    'setFlagSilently(',
    'GameManager.markSaveDirty',
    'notifyFlags('
]) {
    if (encyclopediaManager.includes(obsoleteEncyclopediaMutation)) {
        push('encyclopedia-boundary', `EncyclopediaManager bypasses canonical flag transactions: ${obsoleteEncyclopediaMutation}`);
    }
}
for (const requiredFlagAuthority of [
    'updateFlags(values = {}, options = {})',
    "getFlagsByPrefix(prefix = '')"
]) {
    if (!read(path.join(root, 'src/js/managers/GameManager.js')).includes(requiredFlagAuthority)) {
        push('flag-boundary', `GameManager is missing canonical flag authority: ${requiredFlagAuthority}`);
    }
}

const dropManager = read(path.join(root, 'src/js/managers/DropManager.js'));
for (const obsoleteApi of ['registerZonePool', 'registerDungeonPool', 'rollFromPool', 'export function generateDrops(']) {
    if (dropManager.includes(obsoleteApi)) {
        push('obsolete-drop-api', `DropManager still exposes unused API ${obsoleteApi}`);
    }
}

const forgeScene = read(path.join(root, 'src/js/scenes/ForgeScene.js'));
for (const sceneOwnedCraftMutation of [
    'GameManager.addGold(-recipe.cost)',
    'instanceId: `crafted_${Date.now()}`',
    'this.affixManager.generateAffixes(newItem',
    'GameManager.state',
    'questManager.updateProgress',
    'this.enhanceHistory',
    'this.rerollHistory',
    'getMaterialCount(materialId',
    'isEquipmentItem(item)',
    'getEquipmentSources()'
]) {
    if (forgeScene.includes(sceneOwnedCraftMutation)) {
        push('forge-boundary', `ForgeScene still owns crafting transaction logic: ${sceneOwnedCraftMutation}`);
    }
}
for (const requiredForgeAuthority of [
    'GameManager.getEquipmentEntries(',
    'GameManager.getRepairStatus(',
    'affixManager.getRerollStatus(',
    'enhancementManager.getEnhancementPreview('
]) {
    if (!forgeScene.includes(requiredForgeAuthority)) {
        push('forge-boundary', `ForgeScene must consume canonical forge authority: ${requiredForgeAuthority}`);
    }
}

const recipeManager = read(path.join(root, 'src/js/managers/RecipeManager.js'));
for (const requiredCraftTransaction of [
    "markSaveDirty?.('craft-recipe')",
    'questManager.updateProgress(ObjectiveType.CRAFT'
]) {
    if (!recipeManager.includes(requiredCraftTransaction)) {
        push('forge-boundary', `RecipeManager must own craft transaction side effect: ${requiredCraftTransaction}`);
    }
}

const enhancementManager = read(path.join(root, 'src/js/managers/EnhancementManager.js'));
for (const requiredEnhancementTransaction of [
    "markSaveDirty?.('enhance-equipment')",
    'questManager.updateProgress(ObjectiveType.ENHANCE',
    'getEnhancementHistory(limit = 10)'
]) {
    if (!enhancementManager.includes(requiredEnhancementTransaction)) {
        push('forge-boundary', `EnhancementManager must own enhancement transaction side effect: ${requiredEnhancementTransaction}`);
    }
}

const affixManager = read(path.join(root, 'src/js/managers/AffixManager.js'));
if (!affixManager.includes('getRerollHistory(limit = 10)')) {
    push('forge-boundary', 'AffixManager must own reroll history');
}

const casinoScene = read(path.join(root, 'src/js/scenes/CasinoScene.js'));
for (const sceneOwnedCasinoProgress of [
    "from '../managers/QuestManager.js'",
    'questManager.updateProgress(',
    'questManager.updateStats('
]) {
    if (casinoScene.includes(sceneOwnedCasinoProgress)) {
        push('casino-boundary', `CasinoScene still owns casino progression: ${sceneOwnedCasinoProgress}`);
    }
}

const casinoManager = read(path.join(root, 'src/js/managers/CasinoManager.js'));
for (const requiredCasinoProgress of [
    'questManager.updateProgress(ObjectiveType.GAMBLE_WIN',
    "questManager.updateStats('casino_prize_draw')",
    "questManager.updateStats('dark_table_win')",
    "questManager.updateStats('dark_table_loss')"
]) {
    if (!casinoManager.includes(requiredCasinoProgress)) {
        push('casino-boundary', `CasinoManager must own casino progression: ${requiredCasinoProgress}`);
    }
}
if (casinoManager.includes('GameManager.state')) {
    push('casino-boundary', 'CasinoManager must use GameManager storage APIs instead of reading raw state');
}

const dungeonScene = read(path.join(root, 'src/js/scenes/DungeonScene.js'));
for (const sceneOwnedDungeonMutation of [
    "from '../managers/QuestManager.js'",
    'questManager.updateProgress(',
    'GameManager.state',
    'GameManager.markSaveDirty',
    'GameManager.notify',
    'renderIntegratedMap(',
    "cave: { floor: '#3d3d3d'"
]) {
    if (dungeonScene.includes(sceneOwnedDungeonMutation)) {
        push('dungeon-boundary', `DungeonScene still owns global dungeon mutation: ${sceneOwnedDungeonMutation}`);
    }
}
if (dungeonScene.includes('Math.random(')) {
    push('dungeon-boundary', 'DungeonScene must not roll dungeon outcomes; DungeonManager owns dungeon randomness');
}

const adventureScene = read(path.join(root, 'src/js/scenes/AdventureScene.js'));
if (adventureScene.includes('LANDMARK_STORY_SCENES')) {
    push('adventure-boundary', 'AdventureScene must use chapter location sceneIds instead of a duplicate landmark-story table');
}
for (const chapterOneUiLeak of [
    "from '../data/ChapterOneProgression.js'",
    'GameManager.getFlag('
]) {
    if (adventureScene.includes(chapterOneUiLeak)) {
        push('adventure-boundary', `AdventureScene must delegate Chapter 1 progression decisions: ${chapterOneUiLeak}`);
    }
}
const chapterOneProgressionManager = read(path.join(root, 'src/js/managers/ChapterOneProgressionManager.js'));
if (!chapterOneProgressionManager.includes('getLandmarkAction(entryId)')) {
    push('adventure-boundary', 'ChapterOneProgressionManager must own Chapter 1 landmark action selection');
}
if (/this\.mechanicState\.[A-Za-z][A-Za-z0-9_]*\s*(?:=|\+=|-=|\+\+|--)/.test(dungeonScene)) {
    push('dungeon-boundary', 'DungeonScene must not mutate dungeon mechanic state directly');
}

const dungeonManager = read(path.join(root, 'src/js/managers/DungeonManager.js'));
for (const requiredDungeonAuthority of [
    'recordFloorReached(dungeonType, floor)',
    'questManager.updateProgress(ObjectiveType.DUNGEON_FLOOR',
    'GameManager.useConsumable(stack.instanceId',
    'resolveDungeonStep(dungeonType, stepCount, state',
    'resolveFloorEvent(dungeonType, state, event',
    'resolvePressurePlate(dungeonType, state)',
    'applyTreasureDiscoveryBonus(dungeonType, state'
]) {
    if (!dungeonManager.includes(requiredDungeonAuthority)) {
        push('dungeon-boundary', `DungeonManager must own dungeon progression: ${requiredDungeonAuthority}`);
    }
}

const marketManagerPath = path.join(root, 'src/js/managers/MarketManager.js');
if (!fs.existsSync(marketManagerPath)) {
    push('market-boundary', 'MarketManager must own public buy and sell transactions');
} else {
    const shopScene = read(path.join(root, 'src/js/scenes/ShopScene.js'));
    if (!shopScene.includes("from '../managers/MarketManager.js'")) {
        push('market-boundary', 'ShopScene must delegate transactions to MarketManager');
    }
    for (const sceneOwnedMarketMutation of [
        'GameManager.removeGold(',
        'GameManager.addGold(',
        'GameManager.addToInventory(',
        'GameManager.addToWarehouse(',
        'GameManager.removeMaterial(',
        'completeSupplyEntry(',
        'renderSupplyEntryCard(',
        'worldInteractionManager'
    ]) {
        if (shopScene.includes(sceneOwnedMarketMutation)) {
            push('market-boundary', `ShopScene still owns deferred or transactional market logic: ${sceneOwnedMarketMutation}`);
        }
    }
}

const navigationIntentManagerPath = path.join(root, 'src/js/managers/NavigationIntentManager.js');
if (!fs.existsSync(navigationIntentManagerPath)) {
    push('navigation-boundary', 'NavigationIntentManager must own cross-scene return and handbook route intents');
} else {
    const navigationIntentManagerSource = read(navigationIntentManagerPath);
    if (navigationIntentManagerSource.includes('GameManager.state')) {
        push('navigation-boundary', 'NavigationIntentManager must own and serialize its intent state instead of storing it in GameManager.state');
    }
    if (!navigationIntentManagerSource.includes("registerSaveSystem('navigationIntents', this)")) {
        push('navigation-boundary', 'NavigationIntentManager must register its own save system');
    }
    for (const scenePath of [
        'src/js/scenes/LobbyScene.js',
        'src/js/scenes/QuestScene.js',
        'src/js/scenes/ShopScene.js'
    ]) {
        const scene = read(path.join(root, scenePath));
        if (/GameManager\.state(?:\?\.)?\.ui/.test(scene)) {
            push('navigation-boundary', `${scenePath} directly mutates or reads shared UI navigation state`);
        }
    }

    const gameManagerSource = read(path.join(root, 'src/js/managers/GameManager.js'));
    if (gameManagerSource.includes('setTownReturnPlace(')) {
        push('navigation-boundary', 'GameManager still exposes the obsolete town-return navigation helper');
    }
}

const lobbySceneSource = read(path.join(root, 'src/js/scenes/LobbyScene.js'));

for (const uiStateBoundaryPath of [
    'src/js/scenes/LobbyScene.js',
    'src/js/scenes/ShopScene.js',
    'src/js/components/AdventurePanelsController.js',
    'src/js/components/ItemDetailModal.js'
]) {
    const uiSource = read(path.join(root, uiStateBoundaryPath));
    if (uiSource.includes('GameManager.state')) {
        push('ui-state-boundary', `${uiStateBoundaryPath} must use focused GameManager read APIs instead of the full mutable state`);
    }
}
for (const itemModalOwnerPath of [
    'src/js/components/ItemDetailModal.js',
    'src/js/scenes/LobbyScene.js',
    'src/js/scenes/ShopScene.js'
]) {
    if (read(path.join(root, itemModalOwnerPath)).includes('window.ItemDetailModal')) {
        push('item-modal-boundary', `${itemModalOwnerPath} must use the imported item-detail singleton instead of a window global`);
    }
}
if (read(path.join(root, 'src/js/main.js')).includes("import './components/ItemDetailModal.js'")) {
    push('item-modal-boundary', 'main.js must not duplicate the item-detail singleton side-effect import');
}

for (const mapStateBoundaryPath of [
    'src/js/utils/WorldMap.js',
    'src/js/utils/DevPanel.js'
]) {
    const mapSource = read(path.join(root, mapStateBoundaryPath));
    if (mapSource.includes('GameManager.state')) {
        push('map-state-boundary', `${mapStateBoundaryPath} must use canonical overworld progress APIs instead of the save container`);
    }
}
for (const sceneOwnedInventoryMutation of [
    'sourceArray.splice(',
    'GameManager.state.character.equipment[slotType] = null',
    'getItemActionButtons',
    'updateVisibleInventoryItemsLobby',
    'canRepairItem(',
    'repairItem(item)',
    'getSellPrice('
]) {
    if (lobbySceneSource.includes(sceneOwnedInventoryMutation)) {
        push('inventory-boundary', `LobbyScene still mutates inventory or equipment directly: ${sceneOwnedInventoryMutation}`);
    }
}

const gameManagerSource = read(path.join(root, 'src/js/managers/GameManager.js'));
for (const persistedPrimitiveMutation of [
    "commitStateMutation(options.reason || 'gold-change', 'gold', options)",
    "commitStateMutation('inventory-add', 'inventory', options)",
    "commitStateMutation('warehouse-add', 'warehouse', options)",
    "commitStateMutation('material-remove', 'all')"
]) {
    if (!gameManagerSource.includes(persistedPrimitiveMutation)) {
        push('state-mutation-boundary', `GameManager primitive mutation does not own persistence: ${persistedPrimitiveMutation}`);
    }
}
for (const requiredMapProgressApi of [
    'getOverworldMapProgress()',
    "saveOverworldMapProgress(progress, reason = 'overworld-map')"
]) {
    if (!gameManagerSource.includes(requiredMapProgressApi)) {
        push('map-state-boundary', `GameManager is missing overworld progress persistence API: ${requiredMapProgressApi}`);
    }
}
if (!gameManagerSource.includes('getStoredItemTransactionPreview(instanceId, fromWarehouse = false)')) {
    push('inventory-boundary', 'GameManager must own item transaction previews used by confirmation UI');
}
for (const persistedItemTransaction of [
    "markSaveDirty('move-to-warehouse')",
    "markSaveDirty('move-to-inventory')",
    "markSaveDirty('sell-item')",
    "markSaveDirty('discard-item')",
    "markSaveDirty('equip-item')",
    "markSaveDirty('unequip-item')"
]) {
    if (!gameManagerSource.includes(persistedItemTransaction)) {
        push('inventory-boundary', `GameManager item transaction does not mark persistence: ${persistedItemTransaction}`);
    }
}
for (const passiveAuthorityMethod of [
    'getPassiveCombatEffectLoadout()',
    'equipPassiveCombatEffect(effectId, slotIndex = 0)'
]) {
    if (!gameManagerSource.includes(passiveAuthorityMethod)) {
        push('passive-effect-boundary', `GameManager is missing the passive-effect authority method: ${passiveAuthorityMethod}`);
    }
}
for (const sceneOwnedPassiveLogic of [
    'unlockedPassiveEffectIds',
    'equippedPassiveEffectIds',
    'syncPassiveCombatEffectUnlocks',
    "markSaveDirty?.('passive-combat-effect')",
    "markSaveDirty('passive-combat-effect')"
]) {
    if (lobbySceneSource.includes(sceneOwnedPassiveLogic)) {
        push('passive-effect-boundary', `LobbyScene still owns passive-effect state or persistence: ${sceneOwnedPassiveLogic}`);
    }
}
for (const passiveDelegation of [
    'GameManager.getPassiveCombatEffectLoadout()',
    'GameManager.equipPassiveCombatEffect(effectId, this.selectedPassiveSlot)'
]) {
    if (!lobbySceneSource.includes(passiveDelegation)) {
        push('passive-effect-boundary', `LobbyScene must delegate through ${passiveDelegation}`);
    }
}

for (const obsoleteTownNarrativeState of [
    'getTownNarrativeState(',
    'resetTownNarrativeState(',
    'requestTownNarrativeReset(',
    'resetOnNextLobby',
    'lastNarrativeAt',
    'lastNarrativeTone'
]) {
    for (const file of jsFiles) {
        if (read(file).includes(obsoleteTownNarrativeState)) {
            push('town-narrative-boundary', `${rel(file)} persists or coordinates presentation-only town narrative state through ${obsoleteTownNarrativeState}`);
        }
    }
}
if (gameManagerSource.includes('townNarrative')) {
    push('town-narrative-boundary', 'GameManager must not own the Lobby town narrative presentation log');
}
for (const staleLobbyTownFlag of [
    'getTownFlags()',
    'town.chapter1.south_route_recorded',
    'town.chapter1.slime_anomaly_named',
    'town.forge.problem_named',
    'town.chapter1.boardwalk_reopened',
    'town.chapter1.forest_wound_named',
    'town.chapter1.blood_moon_settled'
]) {
    if (lobbySceneSource.includes(staleLobbyTownFlag)) {
        push('town-state-boundary', `LobbyScene still owns a stale town-state projection: ${staleLobbyTownFlag}`);
    }
}
const townStateResolverSource = read(path.join(root, 'src/js/managers/TownStateResolver.js'));
for (const overviewField of ['title:', 'arrivalText:']) {
    if (!townStateResolverSource.includes(overviewField)) {
        push('town-state-boundary', `TownStateResolver overview is missing ${overviewField}`);
    }
}

for (const obsoleteOverlay of [
    'FirstRunMonsterLootOverrides'
]) {
    for (const file of jsFiles) {
        if (read(file).includes(obsoleteOverlay)) {
            push('data-overlay', `${rel(file)} still uses obsolete overlay ${obsoleteOverlay}`);
        }
    }
}

for (const file of jsFiles) {
    if (read(file).includes('legacyLandmarkId')) {
        push('legacy-landmark-id', `${rel(file)} still uses legacyLandmarkId instead of imageId`);
    }
}

for (const file of jsFiles) {
    if (rel(file) === 'src/js/managers/SaveManager.js') continue;
    const source = read(file);
    for (const alias of ['currentHP', 'currentEXP', 'maxEXP', 'maxHP']) {
        if (source.includes(alias)) {
            push('legacy-character-field', `${rel(file)} still uses ${alias}`);
        }
    }
}

const saveManager = read(path.join(root, 'src/js/managers/SaveManager.js'));
for (const obsoleteSaveBridge of [
    'SaveMigrations',
    'runSaveMigrations',
    'obsoleteMainIds',
    'adventureFatigue',
    'main_016'
]) {
    if (saveManager.includes(obsoleteSaveBridge)) {
        push('save-schema-boundary', `SaveManager still carries obsolete save compatibility: ${obsoleteSaveBridge}`);
    }
}

const gameManager = read(path.join(root, 'src/js/managers/GameManager.js'));
for (const obsoleteGameBridge of [
    'ensureWolfSmokeTestGrant',
    'WOLF_SMOKE_TEST_GRANT_FLAG',
    'migratePassiveEffectItemsToAchievements',
    'passiveEffects.sourceLocked',
    'addTest()',
    'addEquipmentById(',
    'addSetToWarehouse(',
    'grantSetEquipmentForTesting('
]) {
    if (gameManager.includes(obsoleteGameBridge)) {
        push('game-state-boundary', `GameManager still carries obsolete runtime compatibility: ${obsoleteGameBridge}`);
    }
}
if (/export\s*\{[^}]*\b(?:Item|Equipment|Weapon|Armor|Accessory|Consumable|ItemType|ItemRarity)\b[^}]*\}/s.test(gameManager)) {
    push('game-state-boundary', 'GameManager re-exports data-model types instead of owning only game-state behavior');
}

const lobbyView = read(path.join(root, 'src/views/lobby.html'));
if (lobbyView.includes('btn-grant-test-sets') || lobbySceneSource.includes('handleGrantTestSets')) {
    push('dev-boundary', 'Lobby still exposes the duplicate developer equipment-set grant');
}
const devPanel = read(path.join(root, 'src/js/utils/DevPanel.js'));
if (devPanel.includes('GameManager.grantSetEquipmentForTesting')) {
    push('dev-boundary', 'DevPanel delegates developer-only set grants back into GameManager');
}
const devModeSource = read(path.join(root, 'src/js/utils/DevMode.js'));
for (const implicitDevModeSource of ['import.meta.env', 'window.location.hostname', 'localDevMode', 'buildDevMode']) {
    if (devModeSource.includes(implicitDevModeSource)) {
        push('dev-boundary', `DevMode enables tools implicitly through ${implicitDevModeSource}; require an explicit dev URL parameter`);
    }
}

const questSceneSource = read(path.join(root, 'src/js/scenes/QuestScene.js'));
const storyJournalManagerSource = read(path.join(root, 'src/js/managers/StoryJournalManager.js'));
for (const journalProjection of [
    'getMainlineRecord(',
    'getBossTraceRecords(',
    'getWorldNoteRecords(',
    'getRelationshipRecords(',
    'getTownMemoryRecords('
]) {
    if (!storyJournalManagerSource.includes(journalProjection)) {
        push('journal-boundary', `StoryJournalManager is missing the canonical projection ${journalProjection}`);
    }
}
for (const sceneOwnedJournalLogic of [
    'getNpcTalkCount',
    'talkCount',
    'getRelationshipDepth(',
    'getUnlockedRelationshipStages(',
    'buildTownMemoryStory(',
    'getBossTraceRecords() {'
]) {
    if (questSceneSource.includes(sceneOwnedJournalLogic)) {
        push('journal-boundary', `QuestScene still owns journal progression or synthetic story logic: ${sceneOwnedJournalLogic}`);
    }
}
if (!storyJournalManagerSource.includes('MainlineCharacterContracts')) {
    push('journal-boundary', 'Relationship records must use accepted mainline introduction contracts');
}
if (!questSceneSource.includes('storyJournalManager.getRelationshipRecords()')) {
    push('journal-boundary', 'QuestScene must render relationship records supplied by StoryJournalManager');
}

const adventureSceneSource = read(path.join(root, 'src/js/scenes/AdventureScene.js'));
const adventureEncounterSource = read(path.join(root, 'src/js/managers/AdventureEncounterManager.js'));
const storySceneManagerSource = read(path.join(root, 'src/js/managers/StorySceneManager.js'));
const chapterOneProgressionManagerSource = read(path.join(root, 'src/js/managers/ChapterOneProgressionManager.js'));
if (!adventureSceneSource.includes('createPrologueTutorialEncounter')) {
    push('adventure-boundary', 'AdventureScene must delegate prologue combat construction to AdventureEncounterManager');
}
if (!adventureEncounterSource.includes('export function createPrologueTutorialEncounter')) {
    push('adventure-boundary', 'AdventureEncounterManager must own the prologue combat contract');
}
for (const requiredStoryTransition of [
    'resolvePrologueTutorial(',
    'completePrologueRescue(',
    'consumePrologueWakeDialogue('
]) {
    if (!storySceneManagerSource.includes(requiredStoryTransition)) {
        push('adventure-boundary', `StorySceneManager is missing the prologue transition ${requiredStoryTransition}`);
    }
}
for (const sceneOwnedAdventureMutation of [
    'GameManager.setFlag(',
    'PROLOGUE_TUTORIAL_',
    'PROLOGUE_WAKE_DIALOGUE_',
    'ADVENTURE_ONBOARDING_FLAGS',
    'encounter.visual.name =',
    'encounter.player.hp =',
    'encounter.loadout.main =',
    'encounter.monster.exp ='
]) {
    if (adventureSceneSource.includes(sceneOwnedAdventureMutation)) {
        push('adventure-boundary', `AdventureScene still owns shared progression or encounter state: ${sceneOwnedAdventureMutation}`);
    }
}
for (const lobbyOwnedPrologueMutation of [
    'PROLOGUE_TUTORIAL_RESOLVED_FLAG',
    'PROLOGUE_WAKE_DIALOGUE_PENDING_FLAG'
]) {
    if (lobbySceneSource.includes(lobbyOwnedPrologueMutation)) {
        push('adventure-boundary', `LobbyScene still owns prologue state through ${lobbyOwnedPrologueMutation}`);
    }
}

for (const file of jsFiles) {
    const source = read(file);
    if (/\.currentHp\b|\bcurrentHp\s*:/.test(source)) {
        push('legacy-monster-field', `${rel(file)} still materializes the currentHp monster alias`);
    }
}

for (const file of jsFiles) {
    if (!read(file).includes('FightManager.js')) continue;
    if (rel(file) !== 'src/js/scenes/TowerScene.js') {
        push('legacy-combat-core', `${rel(file)} imports the tower-only FightManager core`);
    }
}

const dungeonManagerPath = path.join(root, 'src/js/managers/DungeonManager.js');
const dungeonScenePath = path.join(root, 'src/js/scenes/DungeonScene.js');
if (!fs.existsSync(dungeonManagerPath)) {
    push('dungeon-boundary', 'DungeonManager must own dungeon rewards, supplies, health changes, completion, and defeat settlement');
} else if (fs.existsSync(dungeonScenePath)) {
    const dungeonManagerSource = read(dungeonManagerPath);
    const dungeonSceneSource = read(dungeonScenePath);

    if (!dungeonSceneSource.includes("from '../data/Dungeons.js'")) {
        push('dungeon-boundary', 'DungeonScene must read dungeon definitions directly from Dungeons.js');
    }
    if (!dungeonSceneSource.includes("from '../managers/DungeonManager.js'")) {
        push('dungeon-boundary', 'DungeonScene must delegate dungeon transactions and settlement to DungeonManager');
    }
    if (/import\s*\{[^}]*Dungeon(?:Database|EntranceConfig)[^}]*\}\s*from\s*['"]\.\.\/managers\/DungeonManager\.js['"]/s.test(dungeonSceneSource)) {
        push('dungeon-boundary', 'DungeonManager must not act as a facade for dungeon definitions');
    }

    for (const sceneOwnedDungeonMutation of [
        'GameManager.addGold(',
        'GameManager.addToInventory(',
        'GameManager.addToWarehouse(',
        'GameManager.setFlag(',
        'GameManager.requestTownNarrativeReset(',
        'awardDungeonBossTreasures(',
        'pickDungeonTreasureItem(',
        'resolveDungeonTreasureItem(',
        'getDungeonTreasureQuantity('
    ]) {
        if (dungeonSceneSource.includes(sceneOwnedDungeonMutation)) {
            push('dungeon-boundary', `DungeonScene still owns dungeon transaction or settlement logic: ${sceneOwnedDungeonMutation}`);
        }
    }

    for (const obsoleteDungeonRuntime of [
        'enterDungeon(',
        'exitDungeon(',
        'processMechanic(',
        'processDarkness(',
        'processCold(',
        'processPuzzle(',
        'processMaze(',
        'processBurn(',
        'completionRecords',
        'cooldowns',
        "registerSaveSystem('dungeon'",
        'export default DungeonManagerClass'
    ]) {
        if (dungeonManagerSource.includes(obsoleteDungeonRuntime)) {
            push('dungeon-boundary', `DungeonManager restored obsolete parallel runtime state: ${obsoleteDungeonRuntime}`);
        }
    }
}

const viewFiles = fs.readdirSync(path.join(root, 'src/views'));
for (const file of viewFiles) {
    if (/^dungeon-(cave|snow|ruins|jungle|hell)\.html$/.test(file)) {
        push('dungeon-view', `src/views/${file} should use shared dungeon.html instead`);
    }
}

const globalCss = path.join(root, 'src/css/global.css');
if (fs.existsSync(globalCss)) {
    const lines = read(globalCss).split(/\r?\n/);
    const unscopedSelectors = [
        /^\s*\.item-detail-/,
        /^\s*\.stat-row\b/,
        /^\s*\.stat-left\b/,
        /^\s*\.stat-label\b/,
        /^\s*\.stat-right\b/,
        /^\s*\.stats-compare\b/,
        /^\s*\.affix-pill\b/,
        /^\s*\.modal-footer\b/,
        /^\s*\.modal-close-btn\b/
    ];

    lines.forEach((line, index) => {
        if (unscopedSelectors.some(pattern => pattern.test(line))) {
            push('global-css-scope', `${rel(globalCss)}:${index + 1} has unscoped component selector`);
        }
    });
}

for (const file of [
    path.join(root, 'src/css/global.css'),
    path.join(root, 'src/css/scenes.css'),
    path.join(root, 'src/css/ui-foundation.css'),
    path.join(root, 'src/style/hall.css'),
    path.join(root, 'src/style/marketplace.css'),
    path.join(root, 'src/style/quest-handbook.css'),
    path.join(root, 'src/style/encyclopedia.css'),
    path.join(root, 'src/style/inventory-grid.css'),
    path.join(root, 'src/style/story-dialogue.css')
]) {
    if (!fs.existsSync(file)) continue;
    const source = read(file).replace(/\/\*[\s\S]*?\*\//g, '');
    let depth = 0;
    let minDepth = 0;
    for (const char of source) {
        if (char === '{') depth += 1;
        if (char === '}') depth -= 1;
        minDepth = Math.min(minDepth, depth);
    }
    if (depth !== 0 || minDepth < 0) {
        push('css-braces', `${rel(file)} has unbalanced CSS braces`);
    }
}

const indexHtml = path.join(root, 'index.html');
if (fs.existsSync(indexHtml)) {
    const cssLinks = [...read(indexHtml).matchAll(/<link\s+rel="stylesheet"\s+href="([^"]+)"/g)].map(match => match[1]);
    const normalizedCssLinks = cssLinks.map(link => link.split('?')[0]);
    const foundationPath = 'src/css/ui-foundation.css';
    const foundationIndex = normalizedCssLinks.indexOf(foundationPath);
    if (foundationIndex < 0) {
        push('ui-foundation', 'index.html should load src/css/ui-foundation.css');
    } else {
        const scopedOwners = [
            'src/style/quest-handbook.css',
            'src/style/encyclopedia.css',
            'src/style/inventory-grid.css',
            'src/style/story-dialogue.css'
        ];
        for (const ownerPath of scopedOwners) {
            const ownerIndex = normalizedCssLinks.indexOf(ownerPath);
            if (ownerIndex < 0) {
                push('scoped-css-owner', `index.html should load ${ownerPath}`);
            } else if (ownerIndex < foundationIndex) {
                push('scoped-css-owner', `${ownerPath} should load after ${foundationPath}`);
            }
            if (normalizedCssLinks.lastIndexOf(ownerPath) !== ownerIndex) {
                push('scoped-css-owner', `${ownerPath} should be loaded exactly once`);
            }
        }
    }
}

if (problems.length === 0) {
    console.log('Structure consistency check passed.');
} else {
    console.error(`Structure consistency check found ${problems.length} issue(s):`);
    for (const problem of problems) console.error(`- [${problem.section}] ${problem.message}`);
    process.exitCode = 1;
}
