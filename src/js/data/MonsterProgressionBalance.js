/**
 * Shared progression targets and character level requirements.
 * Final monster combat values belong directly to Monsters.js.
 */

export const MONSTER_PROGRESSION_VERSION = 'first-run-20260720';

export const MonsterBalanceTargets = Object.freeze({
    normal: Object.freeze({ expectedHits: [3, 8], rewardWeight: 1 }),
    elite: Object.freeze({ expectedHits: [9, 16], rewardWeight: 2.1 }),
    routeBoss: Object.freeze({ expectedHits: [10, 20], rewardWeight: 3.2 }),
    mainBoss: Object.freeze({ expectedHits: [16, 36], rewardWeight: 5 })
});

export function getLevelExperienceRequirement(level = 1) {
    const fixedLevel = Math.max(1, Math.floor(Number(level) || 1));
    return Math.floor(90 + fixedLevel * 18 + fixedLevel * fixedLevel * 4);
}
