/**
 * MonsterManager.js
 * 管理怪物相關的查詢與實例化行為（從 data 中拆分）
 */

import { LowLevelMonster, MediumLevelMonster, HighLevelMonster, AllMonsters } from '../data/Monsters.js';
import { MonsterType } from '../data/Monsters.js';

export function getMonster(monsterId) {
    return AllMonsters.find(m => m.id === monsterId) || null;
}

export function getMonstersByLevelRange(minLevel, maxLevel) {
    return AllMonsters.filter(monster => monster.level >= minLevel && monster.level <= maxLevel);
}

export function getTowerMonster(floor) {
    return AllMonsters.find(monster => monster.towerFloor === floor);
}

export function getAllTowerMonsters() {
    return AllMonsters
        .filter(monster => monster.towerFloor)
        .sort((a, b) => a.towerFloor - b.towerFloor);
}

export function createMonsterInstance(monsterId) {
    const template = getMonster(monsterId);
    if (!template) return null;

    return {
        ...template,
        currentHp: template.hp,
        buffs: [],
        debuffs: []
    };
}

export function createRandomMonsterForZone(zoneType, rng = Math.random) {
    let candidates = [];
    switch (zoneType) {
        case 'low':
            candidates = LowLevelMonster.slice();
            break;
        case 'medium':
            candidates = MediumLevelMonster.slice();
            break;
        case 'high':
            candidates = HighLevelMonster.slice();
            break;
        case 'boss':
            candidates = AllMonsters.filter(m => m.type === MonsterType.BOSS || m.type === MonsterType.WORLD_BOSS);
            break;
        default:
            candidates = LowLevelMonster.slice();
    }

    if (!candidates || candidates.length === 0) {
        candidates = AllMonsters.slice();
    }

    const idx = Math.floor(rng() * candidates.length);
    const chosen = candidates[idx];
    // Return the raw template so callers (e.g., WorldMap) can instantiate their Monster class
    return chosen;
}

export default {
    getMonster,
    getMonstersByLevelRange,
    getTowerMonster,
    getAllTowerMonsters,
    createMonsterInstance,
    createRandomMonsterForZone
};
