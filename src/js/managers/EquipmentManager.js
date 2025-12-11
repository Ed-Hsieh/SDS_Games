/**
 * EquipmentManager.js
 * 管理與計算裝備相關的系統行為（從 data 中拆分出來）
 */

import { EquipmentDatabase, SetDatabase, SpecialEffectDescriptions } from '../data/Equipment.js';

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
