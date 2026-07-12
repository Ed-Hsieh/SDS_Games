import GameManager from '../src/js/managers/GameManager.js';
import { DeferredMarketBindings, MarketVendors } from '../src/js/data/MarketSupply.js';
import { TownPlaceDatabase } from '../src/js/data/TownPlaces.js';
import {
    getTownRuntimeSummary,
    TownRuntimeStage
} from '../src/js/managers/TownStateResolver.js';

const errors = [];
const originalFlags = GameManager.state.flags;

function expectVisible(summary, ids, label) {
    const visible = new Set(summary.visiblePlaces.map(place => place.id));
    for (const id of ids) if (!visible.has(id)) errors.push(`${label}: expected ${id}`);
}

function expectHidden(summary, ids, label) {
    const visible = new Set(summary.visiblePlaces.map(place => place.id));
    for (const id of ids) if (visible.has(id)) errors.push(`${label}: unexpected ${id}`);
}

GameManager.state.flags = { 'story.run': 1, 'story.chapter': 1 };
let summary = getTownRuntimeSummary();
expectVisible(summary, ['crossroads'], 'opening');
expectHidden(summary, ['mia_workroom', 'handbook', 'gate', 'forge', 'market', 'casino', 'alley'], 'opening');
if (summary.stage !== TownRuntimeStage.BROKEN_TOWN) errors.push(`opening stage: ${summary.stage}`);

for (const sceneId of [
    'ch1_s01_road_collapse',
    'ch1_s03_broken_crossroads',
    'ch1_s04_elder_to_scholar',
    'ch1_s05_south_gate_introduction',
    'ch1_s07_silver_snare',
    'ch1_s08_cold_forge_smoke',
    'ch1_s11_roads_breathe_again'
]) {
    GameManager.state.flags[`story.scene.${sceneId}.complete`] = true;
}
summary = getTownRuntimeSummary();
expectVisible(summary, ['crossroads', 'mia_workroom', 'handbook', 'gate', 'forge', 'market'], 'chapter-one-return');
expectHidden(summary, ['casino', 'alley'], 'chapter-one-return');

GameManager.state.flags['story.chapter'] = 3;
GameManager.state.flags['story.scene.ch3_s04_showcase_glass.complete'] = true;
summary = getTownRuntimeSummary();
expectVisible(summary, ['casino', 'alley'], 'chapter-three');
if (summary.stage !== TownRuntimeStage.RECOVERY_NETWORK) errors.push(`chapter-three stage: ${summary.stage}`);

const residentIds = TownPlaceDatabase.flatMap(place => place.residents || []).map(entry => entry.npcId);
for (const id of ['supply_captain', 'rumor_broker', 'old_miner_bran', 'tinker', 'accountant_marlo', 'tower_warden']) {
    if (residentIds.includes(id)) errors.push(`obsolete resident remains: ${id}`);
}
if (TownPlaceDatabase.some(place => place.id === 'tower')) errors.push('tower remains active');

if (MarketVendors.length !== 1 || MarketVendors[0]?.id !== 'merchant') {
    errors.push(`public market vendors are not converged: ${MarketVendors.map(vendor => vendor.id).join(',')}`);
}
if ((MarketVendors[0]?.orders || []).length || (MarketVendors[0]?.exchanges || []).length) {
    errors.push('map-dependent market orders or exchanges were assigned before the reward pass');
}
if (DeferredMarketBindings.status !== 'deferred_until_map_function_and_reward_allocation') {
    errors.push(`unexpected market binding status: ${DeferredMarketBindings.status}`);
}

GameManager.state.flags = originalFlags;

if (errors.length > 0) {
    console.error(`Town runtime check found ${errors.length} error(s):`);
    for (const message of errors) console.error(`- ${message}`);
    process.exit(1);
}

console.log('Town runtime check passed.');
