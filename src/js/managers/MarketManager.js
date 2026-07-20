import GameManager from './GameManager.js';

export class MarketManager {
    getGold() {
        return Number(GameManager.getGold()) || 0;
    }

    getItemCount(itemId) {
        return GameManager.getItemCountAcrossStorage?.(itemId) || 0;
    }

    buy({ item, quantity = 1, price = 0 } = {}) {
        if (!item?.id) return { success: false, code: 'invalid-item' };

        const safePrice = Math.max(0, Number(price) || 0);
        const safeQuantity = Math.max(1, Number(quantity) || 1);
        const itemName = item.name || '物品';

        if (item.passiveEffectId && GameManager.hasPassiveCombatEffectAchievement?.(item.passiveEffectId)) {
            return { success: false, code: 'already-unlocked', itemName };
        }
        if (this.getGold() < safePrice || !GameManager.removeGold(safePrice)) {
            return { success: false, code: 'gold', itemName, price: safePrice, currentGold: this.getGold() };
        }

        if (item.passiveEffectId) {
            const unlock = GameManager.unlockPassiveCombatEffectAchievement?.(item.passiveEffectId, item);
            if (!unlock?.success) {
                GameManager.addGold(safePrice);
                return { success: false, code: 'passive-effect', itemName };
            }

            return {
                success: true,
                code: 'passive-effect',
                itemName,
                price: safePrice,
                effectName: unlock.effect?.name || itemName,
                alreadyUnlocked: unlock.alreadyUnlocked
            };
        }

        if (!GameManager.addToInventory(item, safeQuantity)) {
            GameManager.addGold(safePrice);
            return { success: false, code: 'inventory-full', itemName };
        }

        const unlockedEffects = GameManager.consumePassiveCombatUnlocks?.() || [];
        return {
            success: true,
            code: 'bought',
            itemName,
            price: safePrice,
            quantity: safeQuantity,
            unlockedEffectNames: unlockedEffects.map(effect => effect.name).filter(Boolean)
        };
    }

    sell({ item, quantity = 1, instanceId = null } = {}) {
        if (!item?.id || !instanceId) {
            return { success: false, code: 'not-found', itemName: item?.name || '物品' };
        }

        const earnedGold = GameManager.sellItem(instanceId, false);
        if (earnedGold === false) {
            return { success: false, code: 'not-found', itemName: item.name || '物品' };
        }

        return {
            success: true,
            code: 'sold',
            itemName: item.name || '物品',
            quantity: Math.max(1, Number(quantity) || 1),
            earnedGold
        };
    }
}

export const marketManager = new MarketManager();
