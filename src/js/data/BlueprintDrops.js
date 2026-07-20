import {
    BlueprintDropDatabase,
    BlueprintDropRate
} from './BlueprintDropCatalog.js';

export { BlueprintDropDatabase, BlueprintDropRate };

export function getBlueprintDropKey(monsterId, dungeonId = null) {
    return dungeonId ? `${dungeonId}:${monsterId}` : monsterId;
}

export function getBlueprintDropsForMonster(monsterId, { dungeonId = null } = {}) {
    if (!monsterId) return [];
    const scopedKey = getBlueprintDropKey(monsterId, dungeonId);
    if (dungeonId && BlueprintDropDatabase[scopedKey]) {
        return BlueprintDropDatabase[scopedKey];
    }
    return BlueprintDropDatabase[monsterId] || [];
}

export function getBlueprintDropsForRecipe(recipeId) {
    return Object.entries(BlueprintDropDatabase).flatMap(([sourceKey, entries]) =>
        (entries || [])
            .filter(entry => entry.recipeId === recipeId)
            .map(entry => ({ ...entry, sourceKey }))
    );
}

export function getAllBlueprintDropEntries() {
    return Object.entries(BlueprintDropDatabase).flatMap(([sourceKey, entries]) =>
        (entries || []).map(entry => ({ ...entry, sourceKey }))
    );
}
