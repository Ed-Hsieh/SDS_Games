/**
 * CombatBalance.js
 *
 * Runtime combat must read monster stats directly from data files. This module
 * only keeps shared rank/field helpers so balance audits and combat code agree
 * on labels without applying a second layer of hidden stat scaling.
 */

export function getMonsterCombatRank(monster = {}) {
    const type = String(monster.type || monster.rank || monster.combatRank || '').toLowerCase();
    if (monster.isBoss || type === 'boss' || type === 'world_boss') return 'boss';
    if (monster.isElite || type === 'elite') return 'elite';
    return 'normal';
}

export function normalizeMonsterCombatStats(monster) {
    if (!monster) return monster;

    const attack = monster.attack ?? monster.atk ?? 0;
    const defense = monster.defense ?? monster.def ?? 0;
    const hp = monster.hp ?? monster.currentHp ?? monster.maxHp ?? 0;
    const maxHp = monster.maxHp ?? monster.hp ?? hp;

    monster.attack = attack;
    monster.atk = attack;
    monster.defense = defense;
    monster.def = defense;
    monster.hp = hp;
    monster.maxHp = maxHp;
    if (monster.currentHp === undefined) monster.currentHp = hp;
    monster.combatRank = getMonsterCombatRank(monster);

    return monster;
}

export default {
    getMonsterCombatRank,
    normalizeMonsterCombatStats
};
