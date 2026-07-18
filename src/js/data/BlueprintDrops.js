/**
 * BlueprintDrops.js
 * Direct per-monster recipe blueprint drop configuration.
 *
 * chance is a decimal probability: 0.08 = 8%.
 * Use "dungeonId:monsterId" when a dungeon monster id needs dungeon-specific drops.
 */

import { getSeriesRecipeIds } from './RecipeSeries.js';
import { FirstRunBlueprintDropOverrides, FirstRunRetiredRecipeIds } from './FirstRunLootBalance.js';

export const BlueprintDropDatabase = {
    // Normal monster blueprints
    skeleton: [
        { seriesId: 'bone_series', chance: 0.08 },
        { recipeId: 'bone_blade', chance: 0.04 }
    ],
    skeleton_warrior: [
        { seriesId: 'bone_series', chance: 0.12 },
        { recipeId: 'bone_blade', chance: 0.06 }
    ],
    tower_skeleton_captain: [
        { seriesId: 'bone_series', chance: 0.16 },
        { recipeId: 'bone_blade', chance: 0.08 }
    ],
    wild_wolf: [
        { recipeId: 'wolf_cloak', chance: 0.08 },
        { recipeId: 'wolf_fang_necklace', chance: 0.06 }
    ],
    poison_spider: [
        { recipeId: 'poison_dagger', chance: 0.08 }
    ],
    'cave:cave_spider': [
        { recipeId: 'poison_dagger', chance: 0.05 }
    ],
    'jungle:poison_frog': [
        { recipeId: 'poison_dagger', chance: 0.07 }
    ],

    // World elites and bosses
    slime: [
        { recipeId: 'slime_crown_ring', chance: 0.01 }
    ],
    forest_guardian: [
        { recipeId: 'guardian_armor', chance: 0.16 },
        { recipeId: 'nature_amulet', chance: 0.12 }
    ],
    ambush_mantis: [
        { recipeId: 'silver_thread_hook', chance: 0.18 },
        { recipeId: 'poison_dagger', chance: 0.10 }
    ],
    blood_moon_stag: [
        { recipeId: 'blood_moon_pendant', chance: 0.18 },
        { recipeId: 'nature_amulet', chance: 0.10 }
    ],
    lich: [
        { recipeId: 'glimmer_focus', chance: 0.10 },
        { recipeId: 'bone_soul_staff', chance: 0.10 }
    ],
    glimmer_sprite: [
        { recipeId: 'glimmer_focus', chance: 0.06 }
    ],
    rune_wisp: [
        { recipeId: 'glimmer_focus', chance: 0.08 },
        { recipeId: 'earthwarden_aegis', chance: 0.04 }
    ],
    shadow_soldier: [
        { recipeId: 'shadow_blade', chance: 0.05 },
        { recipeId: 'shadow_armor', chance: 0.04 }
    ],
    shadow_archer: [
        { recipeId: 'shadow_ring', chance: 0.04 }
    ],
    shadow_mage: [
        { recipeId: 'shadow_ring', chance: 0.08 }
    ],
    shadow_commander: [
        { recipeId: 'shadow_blade', chance: 0.16 },
        { recipeId: 'shadow_armor', chance: 0.14 }
    ],
    ancient_guardian: [
        { recipeId: 'mithril_sword', chance: 0.05 }
    ],
    rune_keeper: [
        { recipeId: 'mithril_sword', chance: 0.08 },
        { recipeId: 'earthwarden_aegis', chance: 0.08 },
        { recipeId: 'storm_spear', chance: 0.07 },
        { recipeId: 'glimmer_focus', chance: 0.10 }
    ],
    ancient_titan: [
        { recipeId: 'earthwarden_aegis', chance: 0.10 },
        { recipeId: 'titan_blade', chance: 0.12 },
        { recipeId: 'titan_armor', chance: 0.12 },
        { recipeId: 'titan_ring', chance: 0.10 }
    ],
    ice_elemental: [
        { recipeId: 'ice_sword', chance: 0.06 }
    ],
    thunder_elemental: [
        { recipeId: 'storm_spear', chance: 0.06 }
    ],
    stone_golem: [
        { recipeId: 'earthwarden_aegis', chance: 0.05 }
    ],
    elemental_lord: [
        { recipeId: 'storm_spear', chance: 0.10 }
    ],
    treant: [
        { recipeId: 'nature_amulet', chance: 0.04 }
    ],
    prism_wisp: [
        { recipeId: 'glimmer_focus', chance: 0.05 }
    ],
    starvein_lurker: [
        { recipeId: 'primal_focus', chance: 0.07 },
        { recipeId: 'nature_amulet', chance: 0.06 }
    ],
    wyvern: [
        { recipeId: 'wyvern_scale_mail', chance: 0.06 }
    ],
    drake: [
        { recipeId: 'dragon_scale_armor', chance: 0.04 }
    ],
    dragon_knight: [
        { recipeId: 'dragon_scale_armor', chance: 0.08 },
        { recipeId: 'dragon_amulet', chance: 0.07 },
        { recipeId: 'wyvern_scale_mail', chance: 0.08 }
    ],
    elder_dragon: [
        { recipeId: 'dragon_slayer', chance: 0.12 },
        { recipeId: 'dragon_scale_armor', chance: 0.14 },
        { recipeId: 'dragon_amulet', chance: 0.12 },
        { recipeId: 'dragon_overlord_crown', chance: 0.06 }
    ],
    shadow_assassin: [
        { recipeId: 'assassin_shadow_veil', chance: 0.08 }
    ],
    shadow_overlord: [
        { recipeId: 'assassin_shadow_veil', chance: 0.10 }
    ],
    demon_general: [
        { recipeId: 'demonwar_helm', chance: 0.08 }
    ],
    demon_lord_asariel: [
        { recipeId: 'demonwar_helm', chance: 0.14 }
    ],
    void_walker: [
        { recipeId: 'assassin_shadow_veil', chance: 0.05 }
    ],
    abyssal_seraph: [
        { recipeId: 'demonwar_helm', chance: 0.08 }
    ],
    dawn_sentinel: [
        { recipeId: 'glimmer_focus', chance: 0.05 }
    ],
    radiant_keeper: [
        { recipeId: 'glimmer_focus', chance: 0.08 },
        { recipeId: 'primal_focus', chance: 0.04 }
    ],
    mirror_seraph: [
        { recipeId: 'glimmer_focus', chance: 0.08 }
    ],
    aurora_archon: [
        { recipeId: 'glimmer_focus', chance: 0.16 },
        { recipeId: 'primal_focus', chance: 0.08 }
    ],

    // Dungeon-specific monsters
    'snow:ice_elemental': [
        { recipeId: 'ice_sword', chance: 0.05 },
        { recipeId: 'frostbound_scepter', chance: 0.03 }
    ],
    'snow:frost_giant': [
        { recipeId: 'ice_sword', chance: 0.10 },
        { recipeId: 'frostbound_scepter', chance: 0.08 }
    ],
    'snow:ice_dragon': [
        { recipeId: 'ice_sword', chance: 0.14 },
        { recipeId: 'frostbound_scepter', chance: 0.12 }
    ],
    'ruins:stone_guardian': [
        { recipeId: 'mithril_sword', chance: 0.04 },
        { recipeId: 'earthwarden_aegis', chance: 0.05 }
    ],
    'ruins:animated_armor': [
        { recipeId: 'shadow_armor', chance: 0.05 }
    ],
    'ruins:phantom': [
        { recipeId: 'shadow_blade', chance: 0.05 },
        { recipeId: 'shadow_ring', chance: 0.05 }
    ],
    'ruins:ancient_mage': [
        { recipeId: 'shadow_blade', chance: 0.08 },
        { recipeId: 'shadow_ring', chance: 0.07 },
        { recipeId: 'assassin_shadow_veil', chance: 0.06 }
    ],
    'ruins:ancient_guardian': [
        { recipeId: 'mithril_sword', chance: 0.12 },
        { recipeId: 'earthwarden_aegis', chance: 0.10 },
        { recipeId: 'shadow_armor', chance: 0.14 }
    ],
    'jungle:ancient_treant': [
        { recipeId: 'nature_amulet', chance: 0.10 },
        { recipeId: 'primal_focus', chance: 0.06 }
    ],
    'jungle:vine_beast': [
        { recipeId: 'nature_amulet', chance: 0.06 },
        { recipeId: 'primal_focus', chance: 0.03 }
    ],
    'jungle:jungle_hydra': [
        { recipeId: 'hydra_fang_dagger', chance: 0.14 },
        { recipeId: 'nature_amulet', chance: 0.12 },
        { recipeId: 'primal_focus', chance: 0.08 }
    ],
    'hell:pit_fiend': [
        { recipeId: 'demonwar_helm', chance: 0.08 }
    ],
    'hell:demon_king': [
        { recipeId: 'demonwar_helm', chance: 0.14 }
    ],
    'radiant_corridor:prism_wisp': [
        { recipeId: 'glimmer_focus', chance: 0.08 }
    ],
    'radiant_corridor:dawn_sentinel': [
        { recipeId: 'glimmer_focus', chance: 0.08 }
    ],
    'radiant_corridor:radiant_keeper': [
        { recipeId: 'glimmer_focus', chance: 0.14 },
        { recipeId: 'primal_focus', chance: 0.08 }
    ],
    'radiant_corridor:mirror_seraph': [
        { recipeId: 'glimmer_focus', chance: 0.14 }
    ],
    'radiant_corridor:aurora_archon': [
        { recipeId: 'glimmer_focus', chance: 0.22 },
        { recipeId: 'primal_focus', chance: 0.12 }
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
                continue;
            }
            if (entry.seriesId && getSeriesRecipeIds(entry.seriesId).includes(recipeId)) {
                drops.push({ ...entry, recipeId, sourceKey });
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
