const BALANCE_MARKER = '__combatBalanceApplied';

export const MonsterCombatScale = {
    normal: { hp: 1.55, attack: 1.18, defense: 1.18 },
    elite: { hp: 1.68, attack: 1.24, defense: 1.22 },
    boss: { hp: 1.82, attack: 1.28, defense: 1.25 }
};

export function getMonsterCombatRank(monster = {}) {
    const type = String(monster.type || monster.rank || '').toLowerCase();
    if (monster.isBoss || type === 'boss' || type === 'world_boss') return 'boss';
    if (monster.isElite || type === 'elite') return 'elite';
    return 'normal';
}

function scaleStat(value, multiplier, minimum = 0) {
    const number = Number(value) || 0;
    if (number <= 0) return Math.max(minimum, number);
    return Math.max(minimum, Math.floor(number * multiplier));
}

export function applyMonsterCombatBalance(monster) {
    if (!monster || monster[BALANCE_MARKER]) return monster;

    const rank = getMonsterCombatRank(monster);
    const scale = MonsterCombatScale[rank] || MonsterCombatScale.normal;
    const baseMaxHp = monster.maxHp ?? monster.hp ?? monster.currentHp ?? 1;
    const baseHp = monster.hp ?? monster.currentHp ?? baseMaxHp;
    const hpRatio = baseMaxHp > 0 ? Math.max(0, Math.min(1, baseHp / baseMaxHp)) : 1;
    const attack = monster.attack ?? monster.atk ?? 0;
    const defense = monster.defense ?? monster.def ?? 0;

    const scaledMaxHp = scaleStat(baseMaxHp, scale.hp, 1);
    const scaledHp = Math.max(1, Math.floor(scaledMaxHp * hpRatio));
    const scaledAttack = scaleStat(attack, scale.attack, 1);
    const scaledDefense = scaleStat(defense, scale.defense, 0);

    monster.maxHp = scaledMaxHp;
    monster.hp = scaledHp;
    monster.currentHp = scaledHp;
    monster.attack = scaledAttack;
    monster.atk = scaledAttack;
    monster.defense = scaledDefense;
    monster.def = scaledDefense;
    monster.combatRank = rank;
    monster[BALANCE_MARKER] = true;

    return monster;
}

export default {
    MonsterCombatScale,
    getMonsterCombatRank,
    applyMonsterCombatBalance
};
