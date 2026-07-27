import { MonsterDatabase } from '../data/Monsters.js';
import { buildMonsterCombatActions } from '../data/MonsterCombatProfiles.js';
import { calculateDrops } from '../managers/DropManager.js';
import { resolveItemById } from '../utils/ItemResolver.js';
import { StorySceneRegistry } from '../data/StorySceneRegistry.js';

const ITEM_ORDER = Object.freeze([
    'material',
    'equipment',
    'shop',
    'bossEquipment',
    'rewardItem'
]);

export function getDemoMonster(monsterId, playerDefense = 0) {
    const source = MonsterDatabase[monsterId];
    if (!source) throw new Error(`Unknown formal monster id: ${monsterId}`);
    return {
        ...source,
        hp: Number(source.hp ?? source.maxHp),
        maxHp: Number(source.maxHp ?? source.hp),
        actions: buildMonsterCombatActions(source, playerDefense)
    };
}

export function rollDemoDrops(monster, options = {}) {
    return calculateDrops(monster, options).map((drop, index) => {
        const item = resolveItemById(drop.itemId, { order: ITEM_ORDER });
        return {
            id: `${monster.id}:${drop.itemId}:${index}`,
            itemId: drop.itemId,
            item,
            quantity: Math.max(1, Number(drop.quantity) || 1),
            source: drop.source
        };
    }).filter(drop => drop.item);
}

export function getDemoStoryBeats(sceneId, checkpointId = null) {
    const scene = StorySceneRegistry[sceneId];
    if (!scene) return [];
    const source = checkpointId
        ? scene.checkpoints?.[checkpointId]?.beats
        : scene.beats;
    return Array.isArray(source)
        ? source.map(beat => ({ ...beat }))
        : [];
}

export function getDemoStoryTitle(sceneId, checkpointId = null) {
    const scene = StorySceneRegistry[sceneId];
    return checkpointId
        ? scene?.checkpoints?.[checkpointId]?.title || scene?.title || ''
        : scene?.title || '';
}
