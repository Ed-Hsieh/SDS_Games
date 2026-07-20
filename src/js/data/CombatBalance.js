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

export default {
    getMonsterCombatRank
};
