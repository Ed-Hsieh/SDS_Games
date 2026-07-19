/**
 * First-run monster combat progression.
 *
 * Migration table for chapters whose combat values have not yet been moved
 * into Monsters.js. Chapter 1 is canonical in Monsters.js and must not return
 * to this load-time override table.
 */

export const MONSTER_BALANCE_VERSION = 'first-run-20260719';

export const MonsterBalanceTargets = Object.freeze({
    normal: Object.freeze({ expectedHits: [3, 8], rewardWeight: 1 }),
    elite: Object.freeze({ expectedHits: [9, 16], rewardWeight: 2.1 }),
    routeBoss: Object.freeze({ expectedHits: [10, 20], rewardWeight: 3.2 }),
    mainBoss: Object.freeze({ expectedHits: [16, 36], rewardWeight: 5 })
});

const stats = (maxHp, attack, defense, attackSpeed, exp, gold) => Object.freeze({
    maxHp,
    attack,
    defense,
    attackSpeed,
    exp,
    gold
});

export const FirstRunMonsterCombatBalance = Object.freeze({
    skeleton: stats(75, 16, 5, 1.00, 125, 19),
    cave_bat: stats(60, 17, 4, 1.35, 140, 20),
    skeleton_warrior: stats(95, 20, 7, 1.00, 155, 22),
    ghost: stats(80, 24, 5, 1.20, 190, 24),
    stone_golem: stats(155, 22, 13, 0.80, 230, 27),
    glimmer_sprite: stats(90, 27, 6, 1.30, 255, 28),
    rune_wisp: stats(115, 29, 8, 1.20, 275, 30),
    lich: stats(525, 39, 13, 1.10, 1500, 155),

    shadow_soldier: stats(155, 30, 10, 1.00, 325, 32),
    shadow_archer: stats(135, 35, 8, 1.25, 375, 35),
    shadow_halberdier: stats(200, 35, 13, 0.90, 405, 36),
    shadow_mage: stats(275, 46, 11, 1.18, 975, 78),
    drowned_oracle: stats(505, 49, 14, 1.08, 1680, 125),
    shadow_commander: stats(910, 58, 21, 1.10, 2960, 223),

    ancient_guardian: stats(280, 40, 18, 0.90, 625, 46),
    crystal_golem: stats(315, 40, 23, 0.82, 700, 49),
    earth_elemental: stats(315, 47, 20, 0.90, 775, 51),
    rune_keeper: stats(470, 61, 20, 1.15, 1795, 108),
    thorn_witch: stats(710, 68, 18, 1.15, 2870, 166),
    ancient_titan: stats(1530, 70, 32, 0.85, 4920, 290),

    fire_elemental: stats(315, 58, 15, 1.15, 1030, 59),
    ember_beast: stats(390, 58, 19, 0.98, 1075, 61),
    ice_elemental: stats(395, 54, 23, 0.90, 1120, 62),
    frost_wolf: stats(340, 62, 15, 1.25, 1170, 63),
    thunder_elemental: stats(325, 68, 15, 1.25, 1220, 65),
    storm_raptor: stats(330, 67, 15, 1.35, 1265, 66),
    poison_frog: stats(405, 58, 18, 1.05, 1320, 67),
    vine_beast: stats(500, 59, 26, 0.90, 1370, 69),
    starvein_lurker: stats(765, 82, 27, 1.18, 2985, 140),
    elemental_lord: stats(1800, 94, 31, 1.12, 7380, 358),

    cliffscale_hatchling: stats(430, 68, 20, 1.15, 1530, 73),
    wyvern: stats(440, 73, 19, 1.25, 1585, 74),
    sealstone_guardian: stats(595, 63, 34, 0.85, 1645, 76),
    drake: stats(540, 73, 25, 1.00, 1700, 77),
    dragon_seal_sentinel: stats(610, 72, 31, 0.95, 1820, 80),
    dragon_seal_adept: stats(900, 93, 28, 1.18, 3950, 162),
    dragon_knight: stats(1080, 94, 37, 1.05, 4210, 167),
    elder_dragon: stats(2555, 110, 41, 1.05, 10340, 425),

    shadow_assassin: stats(795, 105, 21, 1.40, 4480, 173),
    hell_hound: stats(570, 88, 22, 1.28, 2200, 88),
    tormented_soul: stats(530, 91, 20, 1.20, 2265, 89),
    lava_golem: stats(830, 76, 43, 0.82, 2335, 90),
    demon_soldier: stats(730, 89, 31, 1.00, 2470, 93),
    shadow_general: stats(1265, 110, 37, 1.12, 5340, 189),
    demon_general: stats(1450, 117, 42, 1.05, 5640, 194),
    demon_lord_asariel: stats(3275, 132, 48, 1.08, 13800, 493)
});

export function applyFirstRunMonsterCombatBalance(monsterDatabase) {
    for (const [monsterId, balance] of Object.entries(FirstRunMonsterCombatBalance)) {
        const monster = monsterDatabase[monsterId];
        if (!monster) continue;
        Object.assign(monster, balance, {
            hp: balance.maxHp,
            maxHp: balance.maxHp,
            currentHp: balance.maxHp
        });
    }
    return monsterDatabase;
}

export function getLevelExperienceRequirement(level = 1) {
    const fixedLevel = Math.max(1, Math.floor(Number(level) || 1));
    return Math.floor(90 + fixedLevel * 18 + fixedLevel * fixedLevel * 4);
}
