/**
 * EquipmentManager.js
 * 管理與計算裝備相關的系統行為（從 data 中拆分出來）
 */

import { EquipmentDatabase, SetDatabase } from '../data/Equipment.js';

/**
 * 特殊效果說明函式
 * 將效果類型和數值轉換為可讀文字描述
 */
export const SpecialEffectDescriptions = {
    life_steal: (value) => `攻擊時回復 ${value}% 傷害的生命`,
    critical_boost: (value) => `暴擊傷害 +${value}%`,
    armor_pierce: (value) => `無視敵人 ${value}% 防禦`,
    double_strike: (value) => `${value}% 機率發動雙重打擊`,
    execute: (value) => `對低於 30% HP 的敵人造成額外 ${value}% 傷害`,
    
    // 火：額外傷害比例
    fire_damage: (value) => `攻擊時造成額外 ${value}% 傷害`,
    // 冰：凍結機率
    ice_damage: (value) => `${value}% 機率使敵人凍結（持續 2 秒）`,
    // 雷：降低防禦
    thunder_damage: (value) => `命中時降低敵人防禦 ${value}%（對此次攻擊生效）`,
    // 光：提高攻速
    light_damage: (value) => `命中時使攻速提高 ${value}%（持續 3 秒）`,
    // 毒：持續傷害
    poison_damage: (value) => `造成每回合 ${value} 點持續傷害，持續 3 回合`,
    
    damage_reflect: (value) => `反彈 ${value}% 受到的傷害`,
    shield_block: (value) => `${value}% 機率完全格擋攻擊`,
    hp_regen: (value) => `每回合回復 ${value} 點生命`,
    damage_reduce: (value) => `受到的傷害減少 ${value}%`,
    
    gold_bonus: (value) => `金幣獲取 +${value}%`,
    exp_bonus: (value) => `經驗獲取 +${value}%`,
    drop_bonus: (value) => `掉落率 +${value}%`,
    revive: (value) => `死亡時 ${value}% 機率復活並回復 30% HP`
};

export function getEquipment(equipmentId) {
    return EquipmentDatabase[equipmentId] || null;
}

export function getSet(setId) {
    return SetDatabase[setId] || null;
}

export function getEquipmentByRarity(rarity) {
    return Object.values(EquipmentDatabase).filter(e => e.rarity === rarity);
}

export function getEquipmentByType(type) {
    return Object.values(EquipmentDatabase).filter(e => e.type === type);
}

export function getEquipmentDropsForMonster(monsterId) {
    return Object.values(EquipmentDatabase).filter(
        e => e.dropFrom && e.dropFrom.includes(monsterId)
    );
}

export function getEquipmentEffectDescription(equipment) {
    if (!equipment.specialEffects || equipment.specialEffects.length === 0) {
        return '無特殊效果';
    }

    return equipment.specialEffects
        .map(effect => {
            const descFn = SpecialEffectDescriptions[effect.type];
            return descFn ? descFn(effect.value) : `${effect.type}: ${effect.value}`;
        })
        .join('\n');
}

export function calculateSetBonuses(equippedItems) {
    const setBonuses = [];
    const setPieceCounts = {};

    for (const item of equippedItems) {
        if (item && item.setId) {
            setPieceCounts[item.setId] = (setPieceCounts[item.setId] || 0) + 1;
        }
    }

    for (const [setId, count] of Object.entries(setPieceCounts)) {
        const set = getSet(setId);
        if (!set) continue;

        for (const bonus of set.bonuses) {
            if (count >= bonus.required) {
                setBonuses.push({
                    setId: setId,
                    setName: set.name,
                    bonusName: bonus.name,
                    description: bonus.description,
                    effects: bonus.effects,
                    piecesEquipped: count,
                    piecesRequired: bonus.required
                });
            }
        }
    }

    return setBonuses;
}
