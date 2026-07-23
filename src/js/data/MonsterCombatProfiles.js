import { normalizeMonsterSkill } from './MonsterSkills.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const numberOr = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

function requireNumber(value, label) {
    const number = Number(value);
    if (!Number.isFinite(number)) throw new Error(`${label} must be a finite number`);
    return number;
}

const BASIC_ATTACK_PROFILES = Object.freeze({
    slime: { name: '撞擊', effect: 'body' },
    goblin: { name: '揮砍', effect: 'slash' },
    giant_rat: { name: '撕咬', effect: 'bite' },
    wild_wolf: { name: '撲咬', effect: 'bite' },
    poison_spider: { name: '撕咬', effect: 'bite' },
    treant: { name: '枝幹揮擊', effect: 'crush' },
    cave_bat: { name: '俯衝抓擊', effect: 'claw' },
    orc_warrior: { name: '武器揮擊', effect: 'slash' },
    stone_golem_mini: { name: '石拳揮擊', effect: 'crush' },
    ambush_mantis: { name: '鐮足斬擊', effect: 'slash' },
    forest_guardian: { name: '巨枝揮擊', effect: 'crush' },
    skeleton: { name: '骨爪抓擊', effect: 'claw' },
    skeleton_warrior: { name: '鏽劍揮砍', effect: 'slash' },
    ghost: { name: '幽影觸碰', effect: 'curse' },
    glimmer_sprite: { name: '微光彈', effect: 'projectile' },
    rune_wisp: { name: '符文彈', effect: 'projectile' },
    stone_golem: { name: '石拳揮擊', effect: 'crush' },
    lich: { name: '杖擊', effect: 'slash' }
});

const SKILL_EFFECTS = Object.freeze({
    ambush: 'ambush',
    poison_bite: 'poison',
    vanish: 'vanish',
    nature_wrath: 'nature',
    root_bind: 'roots',
    regeneration: 'regeneration',
    heavy_strike: 'crush',
    stone_fist: 'crush',
    sonic_screech: 'sonic',
    sword_slash: 'slash',
    phase_through: 'phase',
    soul_drain: 'drain',
    lightning_bolt: 'lightning',
    harden: 'harden',
    dark_bolt: 'dark-projectile',
    summon_skeleton: 'summon',
    life_drain: 'drain'
});

function buildPlayerEffect(skill, rawAttack) {
    if (numberOr(skill.poisonDpsPercent) > 0) {
        return {
            id: `${skill.id}_poison`,
            name: '中毒',
            icon: '☠',
            tone: 'poison',
            duration: numberOr(skill.duration, 4),
            damagePerSecond: Math.max(1, Math.round(rawAttack * skill.poisonDpsPercent / 100))
        };
    }
    if (numberOr(skill.attackSpeedReductionPercent) > 0) {
        return {
            id: `${skill.id}_slow`,
            name: '節奏受阻',
            icon: '⌛',
            tone: 'control',
            duration: numberOr(skill.duration, 3),
            modifiers: { attackCooldown: 1 + skill.attackSpeedReductionPercent / 100 }
        };
    }
    if (skill.id === 'root_bind') {
        return {
            id: 'root_bind_control',
            name: '根鬚纏身',
            icon: '⌘',
            tone: 'control',
            duration: numberOr(skill.duration, 3),
            modifiers: { attackCooldown: 1.35 }
        };
    }
    if (numberOr(skill.attackReductionPercent) > 0) {
        return {
            id: `${skill.id}_weaken`,
            name: '攻勢衰弱',
            icon: '↓',
            tone: 'curse',
            duration: numberOr(skill.duration, 4),
            modifiers: { damage: 1 - skill.attackReductionPercent / 100 }
        };
    }
    return null;
}

function buildMonsterEffect(skill, monsterMaxHp, rawAttack) {
    if (numberOr(skill.regenPercent) > 0) {
        return {
            id: `${skill.id}_regen`,
            name: '再生',
            icon: '+',
            tone: 'heal',
            duration: numberOr(skill.duration, 6),
            healPerSecond: Math.max(1, Math.round(monsterMaxHp * skill.regenPercent / 100))
        };
    }
    if (numberOr(skill.defensePercent) > 0 || numberOr(skill.damageTakenReductionPercent) > 0) {
        const reduction = numberOr(skill.damageTakenReductionPercent, skill.defensePercent * 0.5);
        return {
            id: `${skill.id}_guard`,
            name: '硬化',
            icon: '◆',
            tone: 'guard',
            duration: numberOr(skill.duration, 5),
            modifiers: { incomingDamage: clamp(1 - reduction / 100, 0.5, 1) }
        };
    }
    if (numberOr(skill.dodgePercent) > 0) {
        return {
            id: `${skill.id}_evasion`,
            name: skill.id === 'vanish' ? '藏匿' : '相位偏移',
            icon: '◇',
            tone: 'evasion',
            duration: numberOr(skill.duration, 2.5),
            modifiers: {
                dodgeChance: clamp(skill.dodgePercent / 100, 0, 0.75),
                critChance: clamp(numberOr(skill.critChancePercent) / 100, 0, 0.75)
            }
        };
    }
    if (numberOr(skill.summonCount) > 0) {
        return {
            id: `${skill.id}_summon`,
            name: '骷髏侍從',
            icon: '♙',
            tone: 'summon',
            duration: 12,
            interceptHits: numberOr(skill.summonCount, 1),
            attackInterval: 3,
            summonDamage: Math.max(1, Math.round(rawAttack * 0.45))
        };
    }
    return null;
}

export function buildMonsterCombatActions(monster, playerDefense = 0) {
    const rawAttack = requireNumber(monster?.attack, `Monster ${monster?.id || '(unknown)'}.attack`);
    const defense = requireNumber(playerDefense, 'Player defense');
    const baseDamage = Math.max(1, Math.round(rawAttack - defense));
    const speed = requireNumber(monster?.attackSpeed, `Monster ${monster?.id || '(unknown)'}.attackSpeed`);
    if (speed <= 0) throw new Error(`Monster ${monster?.id || '(unknown)'}.attackSpeed must be greater than zero`);
    const telegraphScale = clamp(1.15 / speed, 0.62, 1.45);
    const basic = BASIC_ATTACK_PROFILES[monster?.id] || { name: '普通攻擊', effect: 'claw' };
    const actions = [{
        id: `${monster.id}_basic`,
        name: basic.name,
        effect: basic.effect,
        isSkill: false,
        damage: baseDamage,
        telegraph: 0.92 * telegraphScale,
        impactDelay: ['projectile', 'dark-projectile'].includes(basic.effect) ? 0.68 : 0.24,
        recovery: 1.05 * telegraphScale,
        cooldown: 0
    }];

    for (const rawSkill of monster?.skills || []) {
        const skill = normalizeMonsterSkill(rawSkill);
        if (!SKILL_EFFECTS[skill.id]) continue;
        const damagePercent = numberOr(skill.damagePercent, 0);
        actions.push({
            id: `${monster.id}_${skill.id}`,
            skillId: skill.id,
            name: skill.name,
            effect: SKILL_EFFECTS[skill.id],
            isSkill: true,
            damage: damagePercent > 0 ? Math.max(1, Math.round(baseDamage * damagePercent / 100)) : 0,
            telegraph: (skill.category === '傷害' ? 1.18 : 1.42) * telegraphScale,
            impactDelay: ['projectile', 'dark-projectile', 'lightning', 'drain'].includes(SKILL_EFFECTS[skill.id]) ? 0.68 : 0.28,
            recovery: Math.max(0.8, numberOr(skill.cooldown, 4) * 0.32),
            cooldown: Math.max(1, numberOr(skill.cooldown, 4)),
            playerEffect: buildPlayerEffect(skill, rawAttack),
            monsterEffect: buildMonsterEffect(skill, monster.maxHp, rawAttack),
            healFromDamagePercent: numberOr(skill.healPercent, 0)
        });
    }
    return actions;
}

export const ChapterOneTwoCombatMonsterIds = Object.freeze(Object.keys(BASIC_ATTACK_PROFILES));
