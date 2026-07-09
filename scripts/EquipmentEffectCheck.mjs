import {
    applyDamage,
    BattleController,
    computeMonsterAttack,
    computePlayerAttack,
    normalizeMonsterCombatStats
} from '../src/js/managers/FightManager.js';
import {
    getEquipmentEffectTotals,
    getRewardEffectTotals
} from '../src/js/managers/EquipmentEffectResolver.js';
import { EquipmentDatabase } from '../src/js/data/Equipment.js';

const problems = [];

function assert(condition, message) {
    if (!condition) problems.push(message);
}

function withFixedRandom(value, fn) {
    const original = Math.random;
    Math.random = () => value;
    try {
        return fn();
    } finally {
        Math.random = original;
    }
}

function makePlayer(equipment = {}, overrides = {}) {
    return {
        hp: overrides.hp ?? 80,
        maxHp: overrides.maxHp ?? 120,
        equipment: {
            weapon: equipment.weapon || null,
            armor: equipment.armor || null,
            accessory: equipment.accessory || null
        },
        getTotalAtk() { return overrides.atk ?? 20; },
        getTotalDef() { return overrides.def ?? 0; },
        getCritDamage() { return overrides.critDamage ?? 1.5; },
        getDamageReduction() { return overrides.damageReduction ?? 0; },
        getAttackSpeed() { return overrides.attackSpeed ?? 1; },
        getPassiveCombatBonus() { return 0; }
    };
}

function makeMonster(overrides = {}) {
    const hp = overrides.hp ?? 100;
    return {
        id: overrides.id || 'test_monster',
        name: overrides.name || '測試怪物',
        hp,
        currentHp: hp,
        maxHp: overrides.maxHp ?? hp,
        level: overrides.level ?? 1,
        attack: overrides.attack ?? 10,
        atk: overrides.attack ?? 10,
        defense: overrides.defense ?? 0,
        def: overrides.defense ?? 0,
        isBoss: Boolean(overrides.isBoss),
        isElite: Boolean(overrides.isElite)
    };
}

const custom = {
    bossCharm: {
        id: 'test_boss_charm',
        name: '測試首領護符',
        type: 'accessory',
        specialEffects: [{ type: 'bossBonus', value: 50 }]
    },
    dodgeCharm: {
        id: 'test_dodge_charm',
        name: '測試閃避護符',
        type: 'accessory',
        specialEffects: [{ type: 'dodgeChance', value: 100 }]
    },
    regenCharm: {
        id: 'test_regen_charm',
        name: '測試恢復護符',
        type: 'accessory',
        specialEffects: [{ type: 'hpRegen', value: 10 }]
    },
    rewardCharm: {
        id: 'test_reward_charm',
        name: '測試獎勵護符',
        type: 'accessory',
        specialEffects: [
            { type: 'gold_bonus', value: 20 },
            { type: 'exp_bonus', value: 15 },
            { type: 'drop_bonus', value: 10 }
        ]
    },
    thunderBlade: {
        id: 'test_thunder_blade',
        name: '測試雷刃',
        type: 'weapon',
        specialEffects: [{ type: 'thunder', value: 100 }]
    },
    iceBlade: {
        id: 'test_ice_blade',
        name: '測試冰刃',
        type: 'weapon',
        specialEffects: [{ type: 'ice', value: 25 }]
    },
    poisonBlade: {
        id: 'test_poison_blade',
        name: '測試毒刃',
        type: 'weapon',
        specialEffects: [{ type: 'poison', value: 5 }]
    },
    voidBlade: {
        id: 'test_void_blade',
        name: '測試虛空刃',
        type: 'weapon',
        specialEffects: [{ type: 'void', value: 25 }]
    }
};

const visibleDamageMonster = normalizeMonsterCombatStats(makeMonster({ level: 2, hp: 50, maxHp: 50, attack: 8, defense: 2 }));
const visibleDamagePlayer = makePlayer({}, { def: 2 });
const visibleDamageRes = computeMonsterAttack(visibleDamageMonster, visibleDamagePlayer);
assert(
    visibleDamageRes.damage === Math.max(1, visibleDamageMonster.attack - visibleDamagePlayer.getTotalDef()),
    '怪物顯示攻擊力與實際傷害計算應使用同一份正規化數值。'
);

const slimePlayer = makePlayer({ weapon: EquipmentDatabase.slime_sword }, { hp: 50, atk: 30 });
const slimeEffects = getEquipmentEffectTotals(slimePlayer);
assert(slimeEffects.lifesteal > 0, '史萊姆之劍應解析出吸血效果。');
const lifestealRes = applyDamage(slimePlayer, makeMonster({ hp: 80 }), { damage: 30, isCrit: false, breakdown: {} });
assert(lifestealRes.lifestealRecovered > 0 && slimePlayer.hp > 50, '吸血應在命中後恢復玩家生命。');

withFixedRandom(0, () => {
    const player = makePlayer({ weapon: EquipmentDatabase.wolf_fang_blade }, { atk: 20 });
    const controller = new BattleController(player, makeMonster({ hp: 100 }));
    const result = controller.playerAttack('hit');
    assert(result?.applyRes?.doubleStrike?.finalDamage > 0, '狼牙刀雙重打擊應追加傷害。');
});

const titanPlayer = makePlayer({ weapon: EquipmentDatabase.titan_hammer }, { atk: 20 });
const executeRes = applyDamage(titanPlayer, makeMonster({ hp: 40, maxHp: 100 }), { damage: 20, isCrit: false, breakdown: {} });
assert(executeRes.finalDamage > 20, '處決效果應在低血量目標上增加傷害。');

const bossPlayer = makePlayer({ accessory: custom.bossCharm }, { atk: 20 });
const bossRes = applyDamage(bossPlayer, makeMonster({ hp: 100, isBoss: true }), { damage: 20, isCrit: false, breakdown: {} });
assert(bossRes.finalDamage > 20, 'Boss 傷害加成應提高對首領造成的傷害。');

const voidPlayer = makePlayer({ weapon: custom.voidBlade }, { hp: 40, maxHp: 120, atk: 20 });
const voidController = new BattleController(voidPlayer, makeMonster({ hp: 100 }));
const voidAttack = voidController.playerAttack('hit');
assert(voidAttack?.applyRes?.statusEvents?.some(effect => effect.type === 'void'), '虛空屬性應能套用虛空吞噬狀態。');
const voidHpBeforeTick = voidController.monster.hp;
const voidPlayerHpBeforeTick = voidPlayer.hp;
const voidTicks = voidController.tickStatusEffects(Date.now() + 1500);
const voidTick = voidTicks.find(event => event.type === 'void');
assert(voidTick?.damage > 0 && voidController.monster.hp < voidHpBeforeTick, '虛空吞噬 tick 應造成虛空傷害。');
assert(voidTick?.healAmount > 0 && voidPlayer.hp > voidPlayerHpBeforeTick, '虛空吞噬造成傷害時應回復生命。');

withFixedRandom(0, () => {
    const player = makePlayer({ accessory: custom.dodgeCharm }, { hp: 80 });
    const controller = new BattleController(player, makeMonster({ attack: 50 }));
    const result = controller.monsterAttack();
    assert(result?.dodged && player.hp === 80, '閃避成功時應免除怪物傷害。');
});

const reflectPlayer = makePlayer({ armor: EquipmentDatabase.crystal_shield }, { hp: 120, def: 0 });
const reflectMonster = makeMonster({ hp: 100, attack: 40 });
const reflectController = new BattleController(reflectPlayer, reflectMonster);
const reflectRes = reflectController.monsterAttack();
assert(reflectRes?.reflectedDamage > 0 && reflectMonster.hp < reflectMonster.maxHp, '反傷應在玩家受擊後回敬怪物傷害。');

withFixedRandom(0, () => {
    const player = makePlayer({ accessory: EquipmentDatabase.demon_lord_crown }, { hp: 10, maxHp: 120, def: 0 });
    const controller = new BattleController(player, makeMonster({ attack: 999 }));
    const result = controller.monsterAttack();
    assert(result?.revived && player.hp > 0, '復活效果應在致死傷害後保留玩家生命。');
});

const regenPlayer = makePlayer({ accessory: custom.regenCharm }, { hp: 60, maxHp: 120 });
const regenController = new BattleController(regenPlayer, makeMonster({ hp: 100 }));
const regenEvents = regenController.tickStatusEffects(Date.now() + 1000);
assert(regenEvents.some(event => event.type === 'hpRegen') && regenPlayer.hp > 60, '生命恢復應在戰鬥 tick 中生效。');

withFixedRandom(0, () => {
    const thunderPlayer = makePlayer({ weapon: custom.thunderBlade }, { atk: 20 });
    const res = applyDamage(thunderPlayer, makeMonster({ hp: 100 }), computePlayerAttack(thunderPlayer, 'hit'));
    assert(res.appliedEffects.some(effect => effect.type === 'stun'), '雷屬性應能套用暈眩狀態。');
});

const icePlayer = makePlayer({ weapon: custom.iceBlade }, { atk: 20 });
const iceRes = applyDamage(icePlayer, makeMonster({ hp: 100 }), computePlayerAttack(icePlayer, 'hit'));
assert(iceRes.appliedEffects.some(effect => effect.type === 'slow'), '冰屬性應能套用攻擊頻率下降。');

const poisonPlayer = makePlayer({ weapon: custom.poisonBlade }, { atk: 20 });
const poisonController = new BattleController(poisonPlayer, makeMonster({ hp: 100 }));
const poisonAttack = poisonController.playerAttack('hit');
const poisonHpBeforeTick = poisonController.monster.hp;
assert(poisonAttack?.applyRes?.statusEvents?.some(effect => effect.type === 'poison'), '毒屬性應能套用毒素累積狀態。');
const poisonTicks = poisonController.tickStatusEffects(Date.now() + 1500);
const poisonTick = poisonTicks.find(event => event.type === 'poison');
assert(poisonTick?.accumulated > 0 && poisonController.monster.hp === poisonHpBeforeTick, '毒素 tick 應只累積處決壓力，不應直接扣血。');
assert(poisonTicks.some(event => event.type === 'poison'), '毒屬性應在戰鬥 tick 中累積毒素。');

const poisonExecuteTarget = makeMonster({ hp: 25, maxHp: 100 });
poisonExecuteTarget.statusEffects = [{ type: 'poison', source: 'poison', accumulated: 10 }];
const poisonExecuteRes = applyDamage(makePlayer({}, { atk: 20 }), poisonExecuteTarget, { damage: 15, isCrit: false, breakdown: {} });
assert(poisonExecuteRes.poisonExecuted && poisonExecuteTarget.hp === 0, '攻擊傷害加上累積毒素達到剩餘生命時應直接處決。');

const rewardEffects = getRewardEffectTotals(makePlayer({ accessory: custom.rewardCharm }));
assert(rewardEffects.goldBonus === 20 && rewardEffects.expBonus === 15 && rewardEffects.dropBonus === 10, '金幣、經驗、掉落加成應由共用解析器回傳。');

if (problems.length > 0) {
    console.error('EquipmentEffectCheck failed:');
    for (const problem of problems) console.error(`- ${problem}`);
    process.exit(1);
}

console.log('EquipmentEffectCheck passed.');
