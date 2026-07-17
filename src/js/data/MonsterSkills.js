/**
 * MonsterSkills.js
 * Encyclopedia-facing monster skill metadata.
 *
 * The combat loop is real-time, so all durations here are shown in seconds.
 * String-based monster skills in data files do not have runtime formulas yet;
 * this table provides explicit design values for display and balancing.
 */

const DefaultSkillIcon = '✦';

const SkillNames = {
    abyss_strike: '深淵打擊',
    ambush: '伏擊',
    ancient_power: '遠古之力',
    ancient_roar: '遠古咆哮',
    annihilation: '湮滅',
    apocalypse: '末日降臨',
    backstab: '背刺',
    chain_lightning: '連鎖閃電',
    claw_strike: '爪擊',
    command: '指揮',
    commander_strike: '指揮官斬擊',
    crystal_strike: '水晶重擊',
    dark_aura: '黑暗靈氣',
    dark_bolt: '黑暗箭',
    dark_curse: '黑暗詛咒',
    dark_resurrection: '黑暗復甦',
    dark_shield: '黑暗護盾',
    dark_summon: '黑暗召喚',
    demon_slash: '惡魔斬',
    demon_summon: '惡魔召喚',
    demon_transformation: '惡魔化身',
    devour: '吞噬',
    dimension_shift: '次元轉移',
    dive_attack: '俯衝攻擊',
    dragon_charge: '龍之衝鋒',
    dragon_claw: '龍爪',
    dragon_fury: '龍怒',
    earth_wall: '土牆',
    earthquake: '地震',
    elemental_shift: '元素轉換',
    elemental_storm: '元素風暴',
    energy_beam: '能量光束',
    fear: '恐懼',
    fire_breath: '火焰吐息',
    fire_lance: '火焰長槍',
    fire_shield: '火焰護盾',
    fireball: '火球術',
    flame_burst: '烈焰爆發',
    flame_charge: '烈焰衝鋒',
    freeze: '凍結',
    goblin_rage: '哥布林狂怒',
    harden: '硬化',
    heat_aura: '熱能光環',
    heavy_strike: '重擊',
    hell_hound: '地獄獵犬',
    hellfire: '地獄火',
    hellfire_slash: '地獄火斬',
    howl: '嚎叫',
    ice_smash: '寒冰重砸',
    ice_spike: '冰刺',
    imp: '小惡魔',
    infernal_strike: '煉獄打擊',
    inferno_breath: '煉獄吐息',
    iron_defense: '鋼鐵防禦',
    lava_spit: '熔岩噴吐',
    life_drain: '生命汲取',
    lightning_bolt: '閃電箭',
    lightning_dive: '雷霆俯衝',
    focus_break: '專注破壞',
    multi_bite: '連環撕咬',
    multishot: '多重射擊',
    nature_wrath: '自然之怒',
    pack_attack: '狼群攻勢',
    phase_through: '相位穿透',
    poison_bite: '毒咬',
    poison_dagger: '毒匕首',
    poison_spore: '毒孢子',
    poison_spray: '毒液噴灑',
    primal_burst: '原初爆發',
    rally_troops: '鼓舞部隊',
    reality_tear: '現實撕裂',
    reflect: '反射',
    regen_head: '頭顱再生',
    regeneration: '再生',
    rock_throw: '投石',
    root_bind: '根鬚束縛',
    rune_blast: '符文爆破',
    rune_shield: '符文護盾',
    shadow_army: '暗影軍勢',
    shadow_bolt: '暗影箭',
    shadow_breath: '暗影吐息',
    shadow_domain: '暗影領域',
    shadow_shot: '暗影射擊',
    shadow_slash: '暗影斬',
    shadow_strike: '暗影打擊',
    shield: '護盾',
    shield_bash: '盾擊',
    sonic_screech: '音波尖嘯',
    soul_bolt: '靈魂箭',
    soul_drain: '靈魂汲取',
    soul_harvest: '靈魂收割',
    split: '分裂',
    steel_fist: '鋼拳',
    stone_fist: '石拳',
    stone_form: '石化形態',
    stone_skin: '石膚',
    stun: '暈眩',
    summon: '召喚',
    summon_goblins: '召喚哥布林',
    summon_skeleton: '召喚骷髏',
    sword_slash: '劍斬',
    tail_swipe: '尾擊',
    thunder_screech: '雷鳴尖嘯',
    titan_slam: '泰坦震擊',
    titan_smash: '泰坦粉碎',
    vanish: '藏匿',
    void_armor: '虛空護甲',
    void_rupture: '虛空破裂',
    void_slash: '虛空斬',
    war_cry: '戰吼'
};

const EffectLabels = {
    bind: '束縛',
    curse: '詛咒',
    fear: '恐懼',
    field: '領域',
    freeze: '凍結',
    regen_head: '頭顱再生',
    shield: '護盾',
    stun: '暈眩',
    summon: '召喚'
};

const IconByCategory = {
    傷害: '⚔️',
    範圍傷害: '💥',
    控制: '⛓️',
    弱化: '📉',
    強化: '📈',
    防禦: '🛡️',
    恢復: '💚',
    吸收: '🩸',
    召喚: '💀',
    機動: '🌫️',
    反制: '↩️',
    領域: '🌘',
    終結: '☄️'
};

const ExplicitProfiles = {
    ambush: { category: '傷害', damagePercent: 135, critChancePercent: 20, cooldown: 5 },
    heavy_strike: { category: '傷害', damagePercent: 150, cooldown: 4 },
    sword_slash: { category: '傷害', damagePercent: 120, cooldown: 2.5 },
    claw_strike: { category: '傷害', damagePercent: 115, cooldown: 2.2 },
    stone_fist: { category: '傷害', damagePercent: 130, cooldown: 3 },
    steel_fist: { category: '傷害', damagePercent: 135, cooldown: 3 },
    crystal_strike: { category: '傷害', damagePercent: 145, cooldown: 3.5 },
    commander_strike: { category: '傷害', damagePercent: 140, cooldown: 3.5 },
    shadow_strike: { category: '傷害', damagePercent: 150, cooldown: 3.5 },
    abyss_strike: { category: '傷害', damagePercent: 175, armorReductionPercent: 20, duration: 3, cooldown: 6 },
    infernal_strike: { category: '傷害', damagePercent: 170, burnDpsPercent: 12, duration: 4, cooldown: 6 },
    backstab: { category: '傷害', damagePercent: 160, critChancePercent: 25, cooldown: 4 },
    demon_slash: { category: '傷害', damagePercent: 155, cooldown: 4 },
    shadow_slash: { category: '傷害', damagePercent: 145, cooldown: 3.5 },
    void_slash: { category: '傷害', damagePercent: 165, armorReductionPercent: 25, duration: 3, cooldown: 5.5 },
    hellfire_slash: { category: '傷害', damagePercent: 170, burnDpsPercent: 10, duration: 4, cooldown: 5.5 },
    multi_bite: { category: '傷害', damagePercent: 70, hits: 3, cooldown: 4 },
    dragon_claw: { category: '傷害', damagePercent: 165, cooldown: 4 },
    tail_swipe: { category: '範圍傷害', damagePercent: 115, target: '範圍', cooldown: 4 },
    titan_slam: { category: '範圍傷害', damagePercent: 175, slowPercent: 25, duration: 3, cooldown: 7 },
    titan_smash: { category: '範圍傷害', damagePercent: 190, stunSeconds: 1.2, cooldown: 8 },
    earthquake: { category: '範圍傷害', damagePercent: 135, target: '全體', slowPercent: 20, duration: 3, cooldown: 6 },
    apocalypse: { category: '終結', damagePercent: 240, target: '全體', burnDpsPercent: 15, duration: 5, cooldown: 12 },
    annihilation: { category: '終結', damagePercent: 260, target: '全體', armorReductionPercent: 30, duration: 4, cooldown: 14 },
    soul_harvest: { category: '終結', damagePercent: 210, healPercent: 20, cooldown: 10 },
    void_rupture: { category: '範圍傷害', damagePercent: 180, target: '範圍', armorReductionPercent: 20, duration: 4, cooldown: 8 },
    reality_tear: { category: '弱化', damagePercent: 120, damageTakenIncreasePercent: 20, duration: 5, cooldown: 8 },
    primal_burst: { category: '範圍傷害', damagePercent: 165, target: '範圍', cooldown: 7 },
    elemental_storm: { category: '範圍傷害', damagePercent: 150, target: '全體', slowPercent: 20, duration: 4, cooldown: 8 },
    flame_burst: { category: '範圍傷害', damagePercent: 140, burnDpsPercent: 10, duration: 4, cooldown: 6 },
    fireball: { category: '傷害', damagePercent: 125, burnDpsPercent: 6, duration: 3, cooldown: 3.5 },
    fire_breath: { category: '範圍傷害', damagePercent: 155, target: '前方範圍', burnDpsPercent: 12, duration: 4, cooldown: 6 },
    inferno_breath: { category: '範圍傷害', damagePercent: 210, target: '前方範圍', burnDpsPercent: 18, duration: 5, cooldown: 9 },
    fire_lance: { category: '傷害', damagePercent: 155, cooldown: 4.5 },
    hellfire: { category: '範圍傷害', damagePercent: 160, burnDpsPercent: 14, duration: 4, cooldown: 7 },
    lava_spit: { category: '傷害', damagePercent: 135, burnDpsPercent: 10, duration: 4, cooldown: 4.5 },
    lightning_bolt: { category: '傷害', damagePercent: 130, cooldown: 3.5 },
    chain_lightning: { category: '範圍傷害', damagePercent: 105, hits: 3, target: '連鎖', cooldown: 6 },
    lightning_dive: { category: '傷害', damagePercent: 160, stunSeconds: 1, cooldown: 5 },
    thunder_screech: { category: '控制', damagePercent: 90, silenceSeconds: 2, duration: 2, cooldown: 5 },
    ice_spike: { category: '傷害', damagePercent: 125, slowPercent: 20, duration: 3, cooldown: 3.5 },
    ice_smash: { category: '控制', damagePercent: 145, slowPercent: 35, duration: 3, cooldown: 5 },
    freeze: { category: '控制', damagePercent: 0, freezeSeconds: 2, cooldown: 6 },
    rock_throw: { category: '傷害', damagePercent: 115, cooldown: 3 },
    rune_blast: { category: '傷害', damagePercent: 145, cooldown: 4 },
    energy_beam: { category: '傷害', damagePercent: 160, cooldown: 5 },
    dark_bolt: { category: '傷害', damagePercent: 125, cooldown: 3.5 },
    shadow_bolt: { category: '傷害', damagePercent: 135, cooldown: 3.5 },
    shadow_shot: { category: '傷害', damagePercent: 120, cooldown: 3 },
    soul_bolt: { category: '傷害', damagePercent: 140, cooldown: 4 },
    shadow_breath: { category: '範圍傷害', damagePercent: 165, target: '前方範圍', damageTakenIncreasePercent: 15, duration: 4, cooldown: 7 },
    poison_bite: { category: '弱化', damagePercent: 85, poisonDpsPercent: 8, duration: 5, cooldown: 4 },
    poison_dagger: { category: '弱化', damagePercent: 95, poisonDpsPercent: 10, duration: 5, cooldown: 4 },
    poison_spray: { category: '弱化', damagePercent: 75, target: '範圍', poisonDpsPercent: 9, duration: 5, cooldown: 5 },
    poison_spore: { category: '弱化', damagePercent: 0, target: '範圍', poisonDpsPercent: 7, duration: 6, cooldown: 6 },
    sonic_screech: { category: '控制', damagePercent: 80, attackSpeedReductionPercent: 25, duration: 3, cooldown: 5 },
    shield_bash: { category: '控制', damagePercent: 95, stunSeconds: 1.5, cooldown: 5 },
    stun: { category: '控制', damagePercent: 0, stunSeconds: 1.5, cooldown: 5 },
    fear: { category: '控制', damagePercent: 0, attackReductionPercent: 20, duration: 3, cooldown: 6 },
    root_bind: { category: '控制', damagePercent: 70, moveReductionPercent: 70, duration: 3, cooldown: 5 },
    ancient_roar: { category: '控制', damagePercent: 80, attackReductionPercent: 25, duration: 4, cooldown: 8 },
    howl: { category: '強化', attackPercent: 15, duration: 5, cooldown: 8 },
    war_cry: { category: '強化', attackPercent: 25, duration: 5, cooldown: 8 },
    rally_troops: { category: '強化', attackPercent: 20, defensePercent: 15, duration: 6, cooldown: 10 },
    command: { category: '強化', attackSpeedPercent: 20, duration: 5, cooldown: 8 },
    goblin_rage: { category: '強化', attackPercent: 30, defenseReductionPercent: 10, duration: 5, cooldown: 7 },
    dragon_fury: { category: '強化', attackPercent: 35, attackSpeedPercent: 15, duration: 6, cooldown: 10 },
    ancient_power: { category: '強化', attackPercent: 30, defensePercent: 25, duration: 7, cooldown: 12 },
    demon_transformation: { category: '強化', attackPercent: 45, defensePercent: 20, duration: 8, cooldown: 14 },
    elemental_shift: { category: '強化', damageTakenReductionPercent: 15, attackPercent: 20, duration: 6, cooldown: 9 },
    harden: { category: '防禦', defensePercent: 35, duration: 5, cooldown: 7 },
    iron_defense: { category: '防禦', defensePercent: 40, damageTakenReductionPercent: 20, duration: 5, cooldown: 8 },
    stone_form: { category: '防禦', defensePercent: 45, attackSpeedReductionPercent: 20, duration: 5, cooldown: 8 },
    stone_skin: { category: '防禦', damageTakenReductionPercent: 30, duration: 6, cooldown: 9 },
    earth_wall: { category: '防禦', shieldPercent: 25, duration: 5, cooldown: 8 },
    fire_shield: { category: '防禦', shieldPercent: 20, reflectPercent: 10, duration: 5, cooldown: 8 },
    dark_shield: { category: '防禦', shieldPercent: 25, duration: 5, cooldown: 8 },
    rune_shield: { category: '防禦', shieldPercent: 30, duration: 5, cooldown: 8 },
    void_armor: { category: '防禦', damageTakenReductionPercent: 35, duration: 6, cooldown: 10 },
    shield: { category: '防禦', shieldPercent: 25, duration: 5, cooldown: 7 },
    reflect: { category: '反制', reflectPercent: 25, duration: 4, cooldown: 8 },
    dark_aura: { category: '弱化', attackReductionPercent: 15, defenseReductionPercent: 15, duration: 6, cooldown: 9 },
    dark_curse: { category: '弱化', attackReductionPercent: 25, defenseReductionPercent: 20, duration: 5, cooldown: 8 },
    shadow_domain: { category: '領域', damageTakenIncreasePercent: 20, attackReductionPercent: 15, duration: 6, cooldown: 10 },
    heat_aura: { category: '領域', burnDpsPercent: 8, target: '周圍', duration: 6, cooldown: 9 },
    focus_break: { category: '弱化', damagePercent: 80, attackSpeedReductionPercent: 20, duration: 4, cooldown: 6 },
    life_drain: { category: '吸收', damagePercent: 110, healPercent: 50, cooldown: 6 },
    soul_drain: { category: '吸收', damagePercent: 125, healPercent: 35, attackReductionPercent: 15, duration: 4, cooldown: 7 },
    devour: { category: '吸收', damagePercent: 140, healPercent: 30, cooldown: 7 },
    regeneration: { category: '恢復', regenPercent: 5, duration: 6, cooldown: 10 },
    regen_head: { category: '恢復', healPercent: 18, duration: 3, cooldown: 12 },
    phase_through: { category: '機動', dodgePercent: 45, duration: 2.5, cooldown: 7 },
    vanish: { category: '機動', dodgePercent: 50, critChancePercent: 50, duration: 2, cooldown: 8 },
    dimension_shift: { category: '機動', dodgePercent: 50, damageTakenReductionPercent: 20, duration: 3, cooldown: 9 },
    dive_attack: { category: '傷害', damagePercent: 135, cooldown: 4 },
    dragon_charge: { category: '傷害', damagePercent: 175, stunSeconds: 1.2, cooldown: 6 },
    flame_charge: { category: '傷害', damagePercent: 150, burnDpsPercent: 8, duration: 4, cooldown: 5 },
    pack_attack: { category: '強化', attackPercent: 12, attackSpeedPercent: 12, duration: 5, cooldown: 7 },
    multishot: { category: '範圍傷害', damagePercent: 65, hits: 3, cooldown: 5 },
    split: { category: '召喚', summonCount: 1, duration: 0, cooldown: 10 },
    summon: { category: '召喚', summonCount: 1, duration: 0, cooldown: 9 },
    summon_skeleton: { category: '召喚', summonCount: 1, duration: 0, cooldown: 9 },
    summon_goblins: { category: '召喚', summonCount: 2, duration: 0, cooldown: 10 },
    dark_summon: { category: '召喚', summonCount: 1, duration: 0, cooldown: 10 },
    demon_summon: { category: '召喚', summonCount: 1, duration: 0, cooldown: 11 },
    shadow_army: { category: '召喚', summonCount: 3, duration: 0, cooldown: 14 },
    dark_resurrection: { category: '召喚', summonCount: 1, healPercent: 25, duration: 0, cooldown: 14 },
    hell_hound: { category: '召喚', summonCount: 1, duration: 0, cooldown: 10 },
    imp: { category: '召喚', summonCount: 1, duration: 0, cooldown: 8 },
    nature_wrath: { category: '範圍傷害', damagePercent: 150, moveReductionPercent: 40, duration: 4, cooldown: 8 }
};

function fallbackName(id) {
    return id ? id.replace(/_/g, ' ') : '技能';
}

function normalizeSkillId(skill) {
    if (typeof skill === 'string') return skill;
    return skill?.id || skill?.key || skill?.effect || skill?.name || 'skill';
}

function seconds(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return value;
    return `${number.toFixed(number % 1 === 0 ? 0 : 1)} 秒`;
}

function percent(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return `${value}%`;
    return `${number.toFixed(number % 1 === 0 ? 0 : 1)}%`;
}

function normalizeRealtimeText(text = '') {
    return String(text)
        .replace(/(\d+(?:\.\d+)?)\s*回合/g, '$1 秒')
        .replace(/回合/g, '秒')
        .replace(/([\u4e00-\u9fff])(\d+(?:\.\d+)? 秒)/g, '$1 $2');
}

function inferObjectCategory(skill) {
    if (skill.category) return skill.category;
    if (skill.effect === 'field') return '領域';
    if (skill.effect === 'shield') return '防禦';
    if (skill.effect === 'summon' || skill.effect === 'regen_head') return '召喚';
    if (['stun', 'freeze', 'fear', 'bind'].includes(skill.effect)) return '控制';
    if (skill.atkDebuff || skill.debuff) return '弱化';
    if (skill.heal || skill.selfHeal) return '恢復';
    if (skill.aoe) return '範圍傷害';
    if (skill.damage != null) return '傷害';
    return '特殊';
}

function buildSkillDescription(skill, category) {
    if (skill.description) return normalizeRealtimeText(skill.description);
    switch (category) {
        case '傷害':
        case '範圍傷害':
        case '終結':
            return '造成即時傷害，數值依怪物攻擊力換算。';
        case '控制':
            return '限制玩家行動或攻擊節奏。';
        case '弱化':
            return '降低玩家能力或讓玩家承受更多傷害。';
        case '強化':
            return '短時間提升怪物戰鬥能力。';
        case '防禦':
            return '短時間提高怪物生存能力。';
        case '恢復':
        case '吸收':
            return '造成壓力並回復怪物生命。';
        case '召喚':
            return '呼叫額外敵人加入戰鬥。';
        default:
            return '怪物使用的特殊技能。';
    }
}

function getBaseSkill(id) {
    const profile = ExplicitProfiles[id] || {};
    const category = profile.category || '特殊';
    return {
        id,
        name: SkillNames[id] || fallbackName(id),
        category,
        icon: profile.icon || IconByCategory[category] || DefaultSkillIcon,
        rarity: profile.rarity || (category === '終結' ? 'legendary' : category === '範圍傷害' ? 'epic' : 'rare'),
        ...profile
    };
}

export const MonsterSkillDatabase = Object.fromEntries(
    Object.keys(SkillNames).map(id => {
        const skill = getBaseSkill(id);
        return [id, { ...skill, description: buildSkillDescription(skill, skill.category) }];
    })
);

export function normalizeMonsterSkill(skill) {
    const id = normalizeSkillId(skill);
    const base = MonsterSkillDatabase[id] || getBaseSkill(id);

    if (typeof skill === 'string') return base;

    const category = inferObjectCategory(skill || {});
    return {
        ...skill,
        id,
        category,
        name: skill?.name || base.name,
        icon: skill?.icon || base.icon || IconByCategory[category] || DefaultSkillIcon,
        rarity: skill?.rarity || base.rarity || 'rare',
        durationSeconds: skill?.durationSeconds ?? skill?.duration ?? base.duration,
        description: buildSkillDescription({ ...base, ...skill }, category)
    };
}

export function getMonsterSkillRows(skill) {
    const rows = [];
    rows.push(['分類', skill.category || '特殊']);

    if (skill.damage != null) rows.push(['固定傷害', skill.damage]);
    if (skill.damagePercent != null && skill.damagePercent > 0) rows.push(['傷害倍率', `${percent(skill.damagePercent)} 攻擊`]);
    if (skill.hits != null) rows.push(['連擊', `${skill.hits} 次`]);
    if (skill.target || skill.aoe) rows.push(['影響範圍', skill.target || '全體']);
    if (skill.effect) rows.push(['效果', EffectLabels[skill.effect] || skill.effect]);
    if (skill.durationSeconds != null && skill.durationSeconds > 0) rows.push(['持續時間', seconds(skill.durationSeconds)]);
    else if (skill.duration != null && skill.duration > 0) rows.push(['持續時間', seconds(skill.duration)]);
    if (skill.cooldown != null) rows.push(['冷卻', seconds(skill.cooldown)]);
    if (skill.stunSeconds != null) rows.push(['暈眩', seconds(skill.stunSeconds)]);
    if (skill.freezeSeconds != null) rows.push(['凍結', seconds(skill.freezeSeconds)]);
    if (skill.silenceSeconds != null) rows.push(['封鎖技能', seconds(skill.silenceSeconds)]);
    if (skill.poisonDpsPercent != null) rows.push(['中毒傷害', `每秒 ${percent(skill.poisonDpsPercent)} 攻擊`]);
    if (skill.burnDpsPercent != null) rows.push(['燃燒傷害', `每秒 ${percent(skill.burnDpsPercent)} 攻擊`]);
    if (skill.poison?.damage != null) rows.push(['中毒固定傷害', `每秒 ${skill.poison.damage}`]);
    if (skill.poison?.duration != null) rows.push(['中毒時間', seconds(skill.poison.duration)]);
    if (skill.attackPercent != null) rows.push(['攻擊提升', `+${percent(skill.attackPercent)}`]);
    if (skill.defensePercent != null) rows.push(['防禦提升', `+${percent(skill.defensePercent)}`]);
    if (skill.attackSpeedPercent != null) rows.push(['攻擊頻率提升', `+${percent(skill.attackSpeedPercent)}`]);
    if (skill.attackReductionPercent != null) rows.push(['攻擊降低', `-${percent(skill.attackReductionPercent)}`]);
    if (skill.defenseReductionPercent != null) rows.push(['防禦降低', `-${percent(skill.defenseReductionPercent)}`]);
    if (skill.defenseReductionPercent != null && skill.defenseReductionPercent < 0) rows.push(['防禦變化', `${percent(skill.defenseReductionPercent)}`]);
    if (skill.armorReductionPercent != null) rows.push(['護甲削弱', `-${percent(skill.armorReductionPercent)}`]);
    if (skill.attackSpeedReductionPercent != null) rows.push(['攻擊頻率降低', `-${percent(skill.attackSpeedReductionPercent)}`]);
    if (skill.moveReductionPercent != null) rows.push(['移動降低', `-${percent(skill.moveReductionPercent)}`]);
    if (skill.slowPercent != null) rows.push(['緩速', `-${percent(skill.slowPercent)}`]);
    if (skill.damageTakenIncreasePercent != null) rows.push(['承受傷害增加', `+${percent(skill.damageTakenIncreasePercent)}`]);
    if (skill.damageTakenReductionPercent != null) rows.push(['承受傷害降低', `-${percent(skill.damageTakenReductionPercent)}`]);
    if (skill.shieldPercent != null) rows.push(['護盾', `${percent(skill.shieldPercent)} 最大生命`]);
    if (skill.reflectPercent != null) rows.push(['反射', `${percent(skill.reflectPercent)} 承受傷害`]);
    if (skill.dodgePercent != null) rows.push(['迴避提升', `+${percent(skill.dodgePercent)}`]);
    if (skill.critChancePercent != null) rows.push(['爆擊提升', `+${percent(skill.critChancePercent)}`]);
    if (skill.healPercent != null) rows.push(['生命回復', `${percent(skill.healPercent)} 造成傷害`]);
    if (skill.regenPercent != null) rows.push(['持續回復', `每秒 ${percent(skill.regenPercent)} 最大生命`]);
    if (skill.heal != null) rows.push(['固定治療', skill.heal]);
    if (skill.selfHeal != null) rows.push(['固定回復', skill.selfHeal]);
    if (skill.value != null) rows.push(['強度', skill.value]);
    if (skill.count != null) rows.push(['數量', skill.count]);
    if (skill.summonCount != null) rows.push(['召喚數量', `${skill.summonCount} 名`]);
    if (skill.selfDamage != null) rows.push(['反噬', skill.selfDamage]);
    if (skill.coldIncrease != null) rows.push(['寒冷增加', skill.coldIncrease]);
    if (skill.atkDebuff != null) {
        const debuff = Number(skill.atkDebuff) <= 1
            ? Math.round((1 - Number(skill.atkDebuff)) * 100)
            : Number(skill.atkDebuff);
        rows.push(['攻擊降低', `-${percent(debuff)}`]);
    }
    if (skill.burnDamageBoost != null) {
        const boost = Number(skill.burnDamageBoost) <= 10
            ? Math.round((Number(skill.burnDamageBoost) - 1) * 100)
            : Number(skill.burnDamageBoost);
        rows.push(['燃燒強化', `+${percent(boost)}`]);
    }
    if (skill.cooldownIncreasePercent != null) rows.push(['行動節奏干擾', `+${percent(skill.cooldownIncreasePercent)}`]);

    return rows;
}
