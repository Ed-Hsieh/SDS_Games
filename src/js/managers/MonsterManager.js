/**
 * MonsterManager.js
 * 管理怪物相關的查詢與實例化行為（從 data 中拆分）
 */

import {
    AllMonsters,
    TowerMonsters,
    MonsterType
} from '../data/Monsters.js';
import { isMonsterAvailableInRun } from '../data/MonsterEcology.js';

export function getMonster(monsterId) {
    return AllMonsters.find(m => m.id === monsterId) || null;
}

export function getMonstersByLevelRange(minLevel, maxLevel) {
    return AllMonsters.filter(monster => monster.level >= minLevel && monster.level <= maxLevel);
}

export function getTowerMonster(floor) {
    return TowerMonsters.find(monster => monster.towerFloor === floor);
}

export function getAllTowerMonsters() {
    return TowerMonsters
        .filter(monster => monster.towerFloor)
        .sort((a, b) => a.towerFloor - b.towerFloor);
}

export function createMonsterInstance(monsterOrId) {
    // Accept either a monster id (string) or a monster template object.
    if (!monsterOrId) return null;

    let template = null;
    if (typeof monsterOrId === 'object') {
        template = monsterOrId;
    } else {
        template = getMonster(monsterOrId);
    }

    if (!template) return null;

    // Normalize fields because data may use different keys (attack vs atk, defense vs def, hp vs maxHp)
    const hpBase = template.hp ?? template.maxHp ?? 0;
    const maxHp = template.maxHp ?? template.hp ?? hpBase;
    const atk = template.atk ?? template.attack ?? 0;
    const def = template.def ?? template.defense ?? 0;

    return {
        ...template,

        // base identity
        id: template.id,
        name: template.name,
        icon: template.icon,
        type: template.type,
        element: template.element,
        level: template.level,

        // normalized combat stats (keeps both names for compatibility)
        hp: hpBase,
        maxHp: maxHp,
        currentHp: hpBase,
        atk: atk,
        def: def,
        attack: atk,
        defense: def,

        // rewards & misc
        exp: template.exp || 0,
        gold: template.gold || 0,
        drops: template.drops || [],
        equipmentDrops: template.equipmentDrops || [],
        skills: template.skills || [],
        attackSpeed: template.attackSpeed ?? template.attack_speed ?? 1,
        description: template.description || '',
        special: template.special,
        isElite: Boolean(template.isElite || template.type === MonsterType.ELITE),
        isBoss: Boolean(template.isBoss || template.type === MonsterType.BOSS || template.type === MonsterType.WORLD_BOSS),

        // keep original template for debugging
        _template: template,

        buffs: [],
        debuffs: []
    };
}

export function createRandomMonsterForLevelRange(levelRange = [1, 10], rng = Math.random, options = {}) {
    const [rawMin, rawMax] = Array.isArray(levelRange) ? levelRange : [1, 10];
    const minLevel = Math.max(1, Number(rawMin) || 1);
    const maxLevel = Math.max(minLevel, Number(rawMax) || minLevel);
    let candidates = getMonstersByLevelRange(minLevel, maxLevel)
        .filter(monster => monster.type !== MonsterType.BOSS
            && monster.type !== MonsterType.WORLD_BOSS
            && !monster.towerFloor
            && isMonsterAvailableInRun(monster.id, options));

    if (candidates.length === 0) {
        candidates = AllMonsters.filter(monster => monster.type !== MonsterType.BOSS
            && monster.type !== MonsterType.WORLD_BOSS
            && !monster.towerFloor
            && isMonsterAvailableInRun(monster.id, options));
    }
    if (candidates.length === 0) return null;

    const index = Math.min(candidates.length - 1, Math.floor(rng() * candidates.length));
    return candidates[index] || null;
}

export default {
    getMonster,
    getMonstersByLevelRange,
    getTowerMonster,
    getAllTowerMonsters,
    createMonsterInstance,
    createRandomMonsterForLevelRange
};
