import fs from 'node:fs';

globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
};
globalThis.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
    innerWidth: 1920,
    innerHeight: 1080
};
globalThis.document = {
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({})
};
globalThis.CustomEvent = class CustomEvent {
    constructor(type, options = {}) {
        this.type = type;
        this.detail = options.detail;
    }
};
globalThis.requestAnimationFrame = callback => {
    callback?.(0);
    return 1;
};
globalThis.cancelAnimationFrame = () => {};

const { default: GameManager } = await import('../src/js/managers/GameManager.js');
const {
    mergeEncounterDrops,
    resolveEncounterDrop,
    settleEncounterVictory
} = await import('../src/js/managers/AdventureEncounterManager.js');
const {
    createRecipeBlueprintDisplayItems
} = await import('../src/js/managers/BlueprintManager.js');
const { MaterialDatabase } = await import('../src/js/data/Materials.js');
const { getGeneratedItemImage } = await import('../src/js/data/AssetManifest.js');

const failures = [];
const results = [];

function check(condition, message) {
    if (!condition) failures.push(message);
}

function record(name, details) {
    results.push({ name, ...details });
}

function resetInventory(capacity = 10) {
    GameManager.resetState();
    GameManager.state.inventoryCapacity = capacity;
    GameManager.state.warehouse = [];
}

function makeDrop(item, quantity = 1) {
    return {
        dropId: `settlement-check:${item.id}`,
        itemId: item.id,
        item,
        quantity,
        decision: 'pending',
        stored: null
    };
}

function makeFiller(index) {
    return {
        id: `settlement_filler_${index}`,
        name: `測試裝備 ${index}`,
        type: 'weapon',
        rarity: 'common',
        attack: 1,
        durability: 10,
        maxDurability: 10,
        stackable: false
    };
}

function fillInventory() {
    let index = 0;
    while (GameManager.getInventory().length < GameManager.getInventoryCapacity()) {
        check(GameManager.addToInventory(makeFiller(index), 1, { persist: false, notify: false }), 'Failed to prepare a full inventory');
        index += 1;
    }
}

// Free capacity: claiming moves the reward into the backpack and closes the decision.
resetInventory();
const freeDrop = makeDrop(MaterialDatabase.slime_jelly, 2);
const freeBefore = GameManager.getInventory().length;
resolveEncounterDrop(freeDrop, 'claim');
check(freeDrop.decision === 'claimed', 'Free-capacity reward did not become claimed');
check(freeDrop.stored === 'inventory', 'Free-capacity reward was not stored in the backpack');
check(GameManager.getInventory().length === freeBefore + 1, 'Free-capacity reward did not create an inventory stack');
record('free-capacity-claim', { decision: freeDrop.decision, stored: freeDrop.stored });

// Stackable drops from different reward sources become one settlement decision.
const mergedDrops = mergeEncounterDrops([
    makeDrop(MaterialDatabase.slime_jelly, 2),
    makeDrop(MaterialDatabase.slime_jelly, 3)
]);
check(mergedDrops.length === 1, 'Matching stackable drops were not merged');
check(mergedDrops[0]?.quantity === 5, 'Merged drop has the wrong quantity');
record('merge-matching-drops', { count: mergedDrops.length, quantity: mergedDrops[0]?.quantity });

// Full capacity: claiming stays pending and never falls back to the warehouse.
resetInventory(4);
fillInventory();
const warehouseBefore = GameManager.getWarehouse().length;
const fullDrop = makeDrop(MaterialDatabase.slime_jelly, 1);
const originalWarn = console.warn;
console.warn = () => {};
try {
    resolveEncounterDrop(fullDrop, 'claim');
} finally {
    console.warn = originalWarn;
}
check(fullDrop.decision === 'pending', 'Full-backpack reward stopped being pending');
check(fullDrop.stored === 'inventory-full', 'Full-backpack reward did not expose inventory-full status');
check(GameManager.getWarehouse().length === warehouseBefore, 'Full-backpack reward was silently moved to the warehouse');
record('full-capacity-block', { decision: fullDrop.decision, stored: fullDrop.stored });

// Discarding one owned stack creates capacity and allows the same pending reward to be claimed.
const discardedOwnedStack = GameManager.getInventory()[1];
check(Boolean(discardedOwnedStack), 'No owned stack was available for the discard test');
check(GameManager.discardItem(discardedOwnedStack?.instanceId, false, { force: true }) === true, 'Owned stack could not be discarded during settlement');
resolveEncounterDrop(fullDrop, 'claim');
check(fullDrop.decision === 'claimed', 'Pending reward could not be claimed after freeing a slot');
check(fullDrop.stored === 'inventory', 'Reward claimed after discard did not enter the backpack');
record('discard-owned-then-claim', { decision: fullDrop.decision, stored: fullDrop.stored });

// Discarding the pending reward is terminal and does not mutate either storage container.
resetInventory();
const discardDrop = makeDrop(MaterialDatabase.beast_hide, 1);
const inventoryBeforeDiscard = GameManager.getInventory().length;
const warehouseBeforeDiscard = GameManager.getWarehouse().length;
resolveEncounterDrop(discardDrop, 'discard');
check(discardDrop.decision === 'discarded', 'Discarded reward did not become terminal');
check(discardDrop.stored === 'discarded', 'Discarded reward has the wrong storage state');
check(GameManager.getInventory().length === inventoryBeforeDiscard, 'Discarding a pending reward changed the backpack');
check(GameManager.getWarehouse().length === warehouseBeforeDiscard, 'Discarding a pending reward changed the warehouse');
record('discard-pending-reward', { decision: discardDrop.decision, stored: discardDrop.stored });

// A discarded reward remains reclaimable until the settlement is closed.
resolveEncounterDrop(discardDrop, 'claim');
check(discardDrop.decision === 'claimed', 'Discarded reward could not be reclaimed');
check(discardDrop.stored === 'inventory', 'Reclaimed reward did not return to the backpack');
record('reclaim-discarded-reward', { decision: discardDrop.decision, stored: discardDrop.stored });

// A full backpack may still accept a stackable reward when the matching stack already exists.
resetInventory(4);
check(GameManager.addToInventory(MaterialDatabase.slime_jelly, 1, { persist: false, notify: false }), 'Could not prepare the matching stack');
fillInventory();
const stackDrop = makeDrop(MaterialDatabase.slime_jelly, 3);
resolveEncounterDrop(stackDrop, 'claim');
const jellyStack = GameManager.getInventory().find(stack => stack.item.id === 'slime_jelly');
check(stackDrop.decision === 'claimed', 'Matching stack was rejected only because the backpack was full');
check(jellyStack?.quantity === 4, 'Stackable reward quantity was not merged correctly');
record('full-capacity-stack-merge', { decision: stackDrop.decision, quantity: jellyStack?.quantity });

// Force a known battle blueprint source and confirm the settlement carries visible blueprint art.
resetInventory();
const originalRandom = Math.random;
Math.random = () => 0;
let blueprintSettlement;
try {
    blueprintSettlement = settleEncounterVictory({
        monster: {
            id: 'wild_wolf',
            name: '野狼',
            exp: 0,
            gold: 0,
            drops: [],
            equipmentDrops: []
        },
        context: {}
    });
} finally {
    Math.random = originalRandom;
}

const blueprintItems = createRecipeBlueprintDisplayItems(blueprintSettlement.blueprintUnlocks || []);
const wolfBlueprint = blueprintItems.find(item => item.recipeId === 'wolf_pelt_armor');
const blueprintImage = wolfBlueprint ? getGeneratedItemImage(wolfBlueprint) : '';
check(Boolean(wolfBlueprint), 'Forced wild-wolf victory did not expose its blueprint reward');
check(Boolean(blueprintImage), 'Blueprint reward did not resolve a visible image');
check(!blueprintImage || fs.existsSync(blueprintImage), `Blueprint image file is missing: ${blueprintImage}`);
record('blueprint-drop', {
    recipeId: wolfBlueprint?.recipeId || null,
    image: blueprintImage || null
});

// Keep the settlement UI contract tied to the tested decision states.
const combatFlowSource = fs.readFileSync(new URL('../src/js/managers/CombatFlowController.js', import.meta.url), 'utf8');
const chapterOneProgressionSource = fs.readFileSync(new URL('../src/js/managers/ChapterOneProgressionManager.js', import.meta.url), 'utf8');
check(combatFlowSource.includes('data-drop-decision="claim"'), 'Settlement UI has no claim action');
check(combatFlowSource.includes('data-drop-decision="discard"'), 'Settlement UI has no discard action');
check(combatFlowSource.includes('>放棄</button>'), 'Pending rewards do not use the approved 放棄 label');
check(combatFlowSource.includes('FIRST_LOOT_DECISION_COMPLETE'), 'First settlement guidance has no completion flag');
check(combatFlowSource.includes('data-settlement-discard'), 'Settlement UI cannot discard an owned backpack stack');
check(combatFlowSource.includes('origin: \'inventory\''), 'Owned backpack stacks do not return to the loot area');
check(combatFlowSource.includes('>拿回</button>'), 'Discarded settlement items cannot be reclaimed');
check(combatFlowSource.includes('action.disabled = pendingCount > 0'), 'Settlement can finish while rewards remain pending');
check(combatFlowSource.includes('createRecipeBlueprintDisplayItems'), 'Settlement UI no longer renders blueprint display items');
check(!chapterOneProgressionSource.includes('addToWarehouse'), 'Chapter 1 guaranteed drops still bypass the backpack through the warehouse');
check(!chapterOneProgressionSource.includes('固定回收'), 'Chapter 1 still renders the obsolete fixed-recovery row');

console.log(JSON.stringify({ results, failures }, null, 2));

if (failures.length > 0) {
    console.error(`Battle settlement check failed with ${failures.length} issue(s).`);
    process.exit(1);
}

console.log('Battle settlement check passed.');
