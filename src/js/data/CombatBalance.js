const BALANCE_MARKER = '__combatBalanceApplied';

export const MonsterCombatScale = {
    normal: { hp: 1.55, attack: 1.18, defense: 1.18 },
    elite: { hp: 1.68, attack: 1.24, defense: 1.22 },
    boss: { hp: 1.82, attack: 1.28, defense: 1.25 }
};

export const MonsterLevelBandCombatScale = {
    normal: [
        { maxLevel: 5, hp: 1.08, attack: 0.58, defense: 0.85 },
        { maxLevel: 12, hp: 1.28, attack: 0.98, defense: 1.08 },
        { maxLevel: 20, hp: 1.48, attack: 1.12, defense: 1.15 },
        { maxLevel: Infinity, hp: 1.62, attack: 1.25, defense: 1.22 }
    ],
    elite: [
        { maxLevel: 5, hp: 1.28, attack: 0.95, defense: 1.02 },
        { maxLevel: 12, hp: 1.58, attack: 1.18, defense: 1.18 },
        { maxLevel: 20, hp: 1.82, attack: 1.34, defense: 1.28 },
        { maxLevel: Infinity, hp: 2.02, attack: 1.48, defense: 1.36 }
    ],
    boss: [
        { maxLevel: 5, hp: 1.48, attack: 1.08, defense: 1.08 },
        { maxLevel: 12, hp: 1.90, attack: 1.34, defense: 1.25 },
        { maxLevel: 20, hp: 2.20, attack: 1.54, defense: 1.36 },
        { maxLevel: Infinity, hp: 2.50, attack: 1.72, defense: 1.46 }
    ]
};

export function getMonsterCombatRank(monster = {}) {
    const type = String(monster.type || monster.rank || '').toLowerCase();
    if (monster.isBoss || type === 'boss' || type === 'world_boss') return 'boss';
    if (monster.isElite || type === 'elite') return 'elite';
    return 'normal';
}

export function getMonsterCombatScale(monster = {}) {
    const rank = getMonsterCombatRank(monster);
    const level = Math.max(1, Number(monster.level) || 1);
    const scaleTable = MonsterLevelBandCombatScale[rank] || MonsterLevelBandCombatScale.normal;
    return scaleTable.find(entry => level <= entry.maxLevel) || MonsterCombatScale[rank] || MonsterCombatScale.normal;
}

function scaleStat(value, multiplier, minimum = 0) {
    const number = Number(value) || 0;
    if (number <= 0) return Math.max(minimum, number);
    return Math.max(minimum, Math.floor(number * multiplier));
}

export function applyMonsterCombatBalance(monster) {
    if (!monster || monster[BALANCE_MARKER]) return monster;

    const rank = getMonsterCombatRank(monster);
    const scale = getMonsterCombatScale(monster);
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
    MonsterLevelBandCombatScale,
    getMonsterCombatScale,
    getMonsterCombatRank,
    applyMonsterCombatBalance
};
