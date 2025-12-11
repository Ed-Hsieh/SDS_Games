/**
 * MonsterManager.js
 * 管理怪物相關的查詢與實例化行為（從 data 中拆分）
 */

import { MonsterDatabase } from '../data/Monsters.js';
import { MonsterType } from '../data/Monsters.js';

export function getMonster(monsterId) {
    return MonsterDatabase[monsterId] || null;
}

export function getMonstersByLevelRange(minLevel, maxLevel) {
    return Object.values(MonsterDatabase).filter(
        monster => monster.level >= minLevel && monster.level <= maxLevel
    );
}

export function getTowerMonster(floor) {
    return Object.values(MonsterDatabase).find(
        monster => monster.towerFloor === floor
    );
}

export function getAllTowerMonsters() {
    return Object.values(MonsterDatabase)
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
    const monsters = Object.values(MonsterDatabase);
    let candidates = [];
    switch (zoneType) {
        case 'low':
            candidates = monsters.filter(m => m.level <= 3 && m.type !== MonsterType.BOSS);
            break;
        case 'medium':
            candidates = monsters.filter(m => m.level >= 4 && m.level <= 6 && m.type !== MonsterType.BOSS);
            break;
        case 'high':
            candidates = monsters.filter(m => m.level >= 7 && m.level <= 11 && m.type !== MonsterType.BOSS);
            break;
        case 'boss':
            candidates = monsters.filter(m => m.type === MonsterType.BOSS || m.type === MonsterType.WORLD_BOSS);
            break;
        default:
            candidates = monsters.filter(m => m.level <= 3);
    }

    if (!candidates || candidates.length === 0) {
        candidates = monsters;
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
