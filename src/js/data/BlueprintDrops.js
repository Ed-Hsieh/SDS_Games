/**
 * BlueprintDrops.js
 * Direct per-monster recipe blueprint drop configuration.
 *
 * Drop chance is derived from the defeated source: normal 5%, elite 10%, Boss 15%.
 * Use "dungeonId:monsterId" when a dungeon monster id needs dungeon-specific drops.
 */

import { FirstRunBlueprintDropOverrides, FirstRunRetiredRecipeIds } from './FirstRunLootBalance.js';

export const BlueprintDropRate = Object.freeze({
    NORMAL: 0.05,
    ELITE: 0.10,
    BOSS: 0.15
});

export const BlueprintDropDatabase = {
    // Normal monster blueprints
    skeleton: [
        { recipeId: 'bone_blade' }
    ],
    skeleton_warrior: [
        { recipeId: 'bone_blade' }
    ],
    tower_skeleton_captain: [
        { recipeId: 'bone_blade' }
    ],
    poison_spider: [
        { recipeId: 'poison_dagger' }
    ],
    'cave:cave_spider': [
        { recipeId: 'poison_dagger' }
    ],
    'jungle:poison_frog': [
        { recipeId: 'poison_dagger' }
    ],

    // World elites and bosses
    ambush_mantis: [
        { recipeId: 'silver_thread_hook' }
    ],
    blood_moon_stag: [
        { recipeId: 'blood_moon_pendant' },
        { recipeId: 'nature_amulet' }
    ],
    lich: [
        { recipeId: 'glimmer_focus' },
        { recipeId: 'bone_soul_staff' }
    ],
    glimmer_sprite: [
        { recipeId: 'glimmer_focus' }
    ],
    rune_wisp: [
        { recipeId: 'glimmer_focus' },
        { recipeId: 'earthwarden_aegis' }
    ],
    shadow_soldier: [
        { recipeId: 'shadow_blade' },
        { recipeId: 'shadow_armor' }
    ],
    shadow_archer: [
        { recipeId: 'shadow_ring' }
    ],
    shadow_mage: [
        { recipeId: 'shadow_ring' }
    ],
    shadow_commander: [
        { recipeId: 'shadow_blade' },
        { recipeId: 'shadow_armor' }
    ],
    ancient_guardian: [
        { recipeId: 'mithril_sword' }
    ],
    rune_keeper: [
        { recipeId: 'mithril_sword' },
        { recipeId: 'earthwarden_aegis' },
        { recipeId: 'storm_spear' },
        { recipeId: 'glimmer_focus' }
    ],
    ancient_titan: [
        { recipeId: 'earthwarden_aegis' },
        { recipeId: 'titan_blade' },
        { recipeId: 'titan_armor' },
        { recipeId: 'titan_ring' }
    ],
    ice_elemental: [
        { recipeId: 'ice_sword' }
    ],
    thunder_elemental: [
        { recipeId: 'storm_spear' }
    ],
    stone_golem: [
        { recipeId: 'earthwarden_aegis' }
    ],
    elemental_lord: [
        { recipeId: 'storm_spear' }
    ],
    treant: [
        { recipeId: 'nature_amulet' }
    ],
    prism_wisp: [
        { recipeId: 'glimmer_focus' }
    ],
    starvein_lurker: [
        { recipeId: 'primal_focus' },
        { recipeId: 'nature_amulet' }
    ],
    wyvern: [
        { recipeId: 'wyvern_scale_mail' }
    ],
    drake: [
        { recipeId: 'dragon_scale_armor' }
    ],
    dragon_knight: [
        { recipeId: 'dragon_scale_armor' },
        { recipeId: 'dragon_amulet' },
        { recipeId: 'wyvern_scale_mail' }
    ],
    elder_dragon: [
        { recipeId: 'dragon_slayer' },
        { recipeId: 'dragon_scale_armor' },
        { recipeId: 'dragon_amulet' },
        { recipeId: 'dragon_overlord_crown' }
    ],
    shadow_assassin: [
        { recipeId: 'assassin_shadow_veil' }
    ],
    shadow_overlord: [
        { recipeId: 'assassin_shadow_veil' }
    ],
    demon_general: [
        { recipeId: 'demonwar_helm' }
    ],
    demon_lord_asariel: [
        { recipeId: 'demonwar_helm' }
    ],
    void_walker: [
        { recipeId: 'assassin_shadow_veil' }
    ],
    abyssal_seraph: [
        { recipeId: 'demonwar_helm' }
    ],
    dawn_sentinel: [
        { recipeId: 'glimmer_focus' }
    ],
    radiant_keeper: [
        { recipeId: 'glimmer_focus' },
        { recipeId: 'primal_focus' }
    ],
    mirror_seraph: [
        { recipeId: 'glimmer_focus' }
    ],
    aurora_archon: [
        { recipeId: 'glimmer_focus' },
        { recipeId: 'primal_focus' }
    ],

    // Dungeon-specific monsters
    'snow:ice_elemental': [
        { recipeId: 'ice_sword' },
        { recipeId: 'frostbound_scepter' }
    ],
    'snow:frost_giant': [
        { recipeId: 'ice_sword' },
        { recipeId: 'frostbound_scepter' }
    ],
    'snow:ice_dragon': [
        { recipeId: 'ice_sword' },
        { recipeId: 'frostbound_scepter' }
    ],
    'ruins:stone_guardian': [
        { recipeId: 'mithril_sword' },
        { recipeId: 'earthwarden_aegis' }
    ],
    'ruins:animated_armor': [
        { recipeId: 'shadow_armor' }
    ],
    'ruins:phantom': [
        { recipeId: 'shadow_blade' },
        { recipeId: 'shadow_ring' }
    ],
    'ruins:ancient_mage': [
        { recipeId: 'shadow_blade' },
        { recipeId: 'shadow_ring' },
        { recipeId: 'assassin_shadow_veil' }
    ],
    'ruins:ancient_guardian': [
        { recipeId: 'mithril_sword' },
        { recipeId: 'earthwarden_aegis' },
        { recipeId: 'shadow_armor' }
    ],
    'jungle:ancient_treant': [
        { recipeId: 'nature_amulet' },
        { recipeId: 'primal_focus' }
    ],
    'jungle:vine_beast': [
        { recipeId: 'nature_amulet' },
        { recipeId: 'primal_focus' }
    ],
    'jungle:jungle_hydra': [
        { recipeId: 'hydra_fang_dagger' },
        { recipeId: 'nature_amulet' },
        { recipeId: 'primal_focus' }
    ],
    'hell:pit_fiend': [
        { recipeId: 'demonwar_helm' }
    ],
    'hell:demon_king': [
        { recipeId: 'demonwar_helm' }
    ],
    'radiant_corridor:prism_wisp': [
        { recipeId: 'glimmer_focus' }
    ],
    'radiant_corridor:dawn_sentinel': [
        { recipeId: 'glimmer_focus' }
    ],
    'radiant_corridor:radiant_keeper': [
        { recipeId: 'glimmer_focus' },
        { recipeId: 'primal_focus' }
    ],
    'radiant_corridor:mirror_seraph': [
        { recipeId: 'glimmer_focus' }
    ],
    'radiant_corridor:aurora_archon': [
        { recipeId: 'glimmer_focus' },
        { recipeId: 'primal_focus' }
    ]
};

Object.assign(BlueprintDropDatabase, FirstRunBlueprintDropOverrides);
for (const [sourceId, entries] of Object.entries(BlueprintDropDatabase)) {
    if (Array.isArray(entries)) {
        BlueprintDropDatabase[sourceId] = entries.filter(entry => !FirstRunRetiredRecipeIds.includes(entry.recipeId));
    }
    if (Array.isArray(BlueprintDropDatabase[sourceId]) && BlueprintDropDatabase[sourceId].length === 0) {
        delete BlueprintDropDatabase[sourceId];
    }
}

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
    const drops = [];
    for (const [sourceKey, entries] of Object.entries(BlueprintDropDatabase)) {
        for (const entry of entries || []) {
            if (entry.recipeId === recipeId) {
                drops.push({ ...entry, sourceKey });
            }
        }
    }
    return drops;
}

export function getAllBlueprintDropEntries() {
    return Object.entries(BlueprintDropDatabase).flatMap(([sourceKey, entries]) =>
        (entries || []).map(entry => ({ ...entry, sourceKey }))
    );
}
