import GameManager from './GameManager.js';
import {
    STAFF_ATTUNEMENT_SOURCE,
    StaffAttunementContract,
    StaffAttunementElements,
    getStaffAttunementElement
} from '../data/StaffAttunement.js';

const FORMAL_ELEMENT_TYPES = new Set(
    Object.values(StaffAttunementElements).map(element => element.effectType)
);

function getStoryChapter() {
    return Math.max(1, Number(GameManager.getFlag?.('story.chapter')) || 1);
}

function getItemCount(itemId) {
    return GameManager.getItemCountAcrossStorage(itemId);
}

export class StaffAttunementManager {
    isFocus(item) {
        return String(item?.weaponForm || '').toLowerCase() === StaffAttunementContract.weaponForm;
    }

    getCurrentAttunement(item) {
        const element = getStaffAttunementElement(item?.elementAttunement?.element);
        return element ? { ...item.elementAttunement, ...element } : null;
    }

    getFixedElement(item) {
        const effect = (item?.specialEffects || []).find(candidate => (
            FORMAL_ELEMENT_TYPES.has(candidate?.type)
            && candidate?.source !== STAFF_ATTUNEMENT_SOURCE
        ));
        if (!effect) return null;
        return Object.values(StaffAttunementElements)
            .find(element => element.effectType === effect.type) || null;
    }

    canAttune(item) {
        if (!this.isFocus(item)) return false;
        if (item?.canElementAttune !== true) return false;
        if (item?.elementAttunementLocked === true) return false;
        return !this.getFixedElement(item);
    }

    getElementPreview(item, elementId) {
        const element = getStaffAttunementElement(elementId);
        if (!element) return { available: false, reason: 'unknown_element' };

        const chapter = getStoryChapter();
        const owned = getItemCount(element.materialId);
        const unlocked = chapter >= element.unlockChapter;
        const enoughMaterial = owned >= StaffAttunementContract.materialQuantity;
        const enoughGold = GameManager.getGold() >= StaffAttunementContract.goldCost;

        return {
            element,
            chapter,
            unlocked,
            owned,
            enoughMaterial,
            enoughGold,
            eligible: this.canAttune(item),
            available: this.canAttune(item) && unlocked && enoughMaterial && enoughGold,
            materialQuantity: StaffAttunementContract.materialQuantity,
            goldCost: StaffAttunementContract.goldCost,
            alreadyActive: this.getCurrentAttunement(item)?.element === element.id
        };
    }

    attune(item, elementId) {
        const preview = this.getElementPreview(item, elementId);
        if (!preview.element) return { success: false, reason: 'unknown_element' };
        if (!preview.eligible) return { success: false, reason: 'ineligible' };
        if (!preview.unlocked) return { success: false, reason: 'chapter_locked', preview };
        if (!preview.enoughMaterial) return { success: false, reason: 'materials', preview };
        if (!preview.enoughGold) return { success: false, reason: 'gold', preview };
        if (preview.alreadyActive) return { success: false, reason: 'already_active', preview };

        if (!GameManager.removeGold(StaffAttunementContract.goldCost)) {
            return { success: false, reason: 'gold', preview };
        }
        if (!GameManager.removeMaterial(preview.element.materialId, StaffAttunementContract.materialQuantity)) {
            GameManager.addGold(StaffAttunementContract.goldCost);
            return { success: false, reason: 'materials', preview };
        }

        item.specialEffects = (item.specialEffects || [])
            .filter(effect => effect?.source !== STAFF_ATTUNEMENT_SOURCE);
        item.specialEffects.push({
            type: preview.element.effectType,
            value: preview.element.effectValue,
            source: STAFF_ATTUNEMENT_SOURCE
        });
        item.elementAttunement = {
            element: preview.element.id,
            source: STAFF_ATTUNEMENT_SOURCE
        };

        GameManager.markSaveDirty?.('staff-attunement');
        GameManager.notify?.('all');
        return {
            success: true,
            element: preview.element,
            message: `${item.name || '法杖'}已調律為${preview.element.label}元素。`
        };
    }
}

export const staffAttunementManager = new StaffAttunementManager();

export default StaffAttunementManager;
