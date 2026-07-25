import { AffixStat } from '../models/Enums.js';

export const STAFF_ATTUNEMENT_SOURCE = 'staff_attunement';

export const StaffAttunementElements = Object.freeze({
    poison: Object.freeze({
        id: 'poison',
        label: '毒',
        effectType: AffixStat.POISON,
        effectValue: 8,
        materialId: 'poison_gland',
        unlockChapter: 1,
        sourceLabel: '南路毒蜘蛛'
    }),
    ice: Object.freeze({
        id: 'ice',
        label: '冰',
        effectType: AffixStat.ICE,
        effectValue: 8,
        materialId: 'frost_crystal',
        unlockChapter: 2,
        sourceLabel: '守名者墓室'
    }),
    thunder: Object.freeze({
        id: 'thunder',
        label: '雷',
        effectType: AffixStat.THUNDER,
        effectValue: 8,
        materialId: 'storm_crystal',
        unlockChapter: 3,
        sourceLabel: '溺聲海岸'
    }),
    fire: Object.freeze({
        id: 'fire',
        label: '火',
        effectType: AffixStat.FIRE,
        effectValue: 8,
        materialId: 'ember_stone',
        unlockChapter: 4,
        sourceLabel: '古代地脈遺跡'
    })
});

export const StaffAttunementContract = Object.freeze({
    weaponForm: 'focus',
    replaceableSlots: 1,
    materialQuantity: 1,
    goldCost: 80,
    randomOutcome: false,
    powerStatAdded: false,
    allowedElements: Object.freeze(Object.keys(StaffAttunementElements)),
    excludedAffinities: Object.freeze(['shadow', 'glimmer', 'light', 'void'])
});

export function getStaffAttunementElement(elementId) {
    return StaffAttunementElements[String(elementId || '').toLowerCase()] || null;
}

