import { EquipmentDatabase } from '../src/js/data/Equipment.js';
import { RecipeDatabase } from '../src/js/data/Recipes.js';
import { BlueprintDropDatabase } from '../src/js/data/BlueprintDrops.js';
import { MonsterDatabase, TowerMonsterData } from '../src/js/data/Monsters.js';
import { DefaultKnownRecipeIds, getRecipeDiscovery } from '../src/js/data/RecipeDiscoveries.js';
import { getRecipeSeriesForRecipe } from '../src/js/data/RecipeSeries.js';

const FORMS = ['sword', 'dagger', 'heavy', 'lance', 'focus'];
const ELEMENTS = ['fire', 'ice', 'thunder', 'poison'];
const BANDS = [[1, 10], [11, 20], [21, 30], [31, 40], [41, 50], [51, 60], [61, 70]];
const monsters = { ...MonsterDatabase, ...TowerMonsterData };
const blueprintSources = collectBlueprintSources();
const records = collectWeapons();
const firstRun = records.filter(record => record.scope === 'first-run');

const report = {
    summary: {
        uniqueWeapons: records.length,
        firstRunWeapons: firstRun.length,
        fallbackSeriesWeapons: firstRun.filter(record => record.isFallback).length,
        specialWeapons: firstRun.filter(record => !record.isFallback).length,
        craftBlueprintGaps: firstRun.filter(record => record.blueprintAccess === 'missing').length,
        excluded: countBy(records.filter(record => record.scope !== 'first-run'), 'scope')
    },
    bands: BANDS.map(([min, max]) => summarizeBand(firstRun, min, max)),
    elementalFocus: Object.fromEntries(ELEMENTS.map(element => [
        element,
        firstRun.filter(record => record.form === 'focus' && record.elements.includes(element))
            .map(record => ({ id: record.id, level: record.level, sources: record.sources }))
    ])),
    unknownForms: firstRun.filter(record => !FORMS.includes(record.form)).map(record => record.id),
    craftBlueprintGaps: firstRun.filter(record => record.blueprintAccess === 'missing')
        .map(record => ({ id: record.id, recipeId: record.recipeId })),
    records
};

if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
else printReport(report);

function collectWeapons() {
    const byId = new Map();

    for (const item of Object.values(EquipmentDatabase)) {
        if (String(item.type).toLowerCase() !== 'weapon') continue;
        addRecord(byId, makeRecord(item, {
            sourceKind: 'drop',
            sources: item.dropFrom || (item.dropSource ? [item.dropSource] : [])
        }));
    }

    // RecipeDatabase is the final composed catalog, including the baseline series recipes.
    for (const recipe of Object.values(RecipeDatabase)) {
        if (String(recipe.result?.type || recipe.type).toLowerCase() !== 'weapon') continue;
        addRecord(byId, makeRecord(recipe.result, {
            sourceKind: ['series', 'baseline'].includes(recipe.craftLine) ? 'baseline-craft' : 'special-craft',
            sources: blueprintSources.get(recipe.id) || [],
            recipe,
            isFallback: ['series', 'baseline'].includes(recipe.craftLine) || recipe.strength === 'weak'
        }));
    }

    return [...byId.values()]
        .sort((a, b) => a.level - b.level || a.form.localeCompare(b.form) || a.id.localeCompare(b.id));
}

function makeRecord(item, context) {
    const allSources = [...new Set(context.sources || [])];
    const sources = item.id.startsWith('tower_')
        ? allSources
        : allSources.filter(source => !source.startsWith('tower_'));
    const level = Number(item.level || item.requiredLevel || context.recipe?.level || 1);
    const effects = item.specialEffects || [];
    return {
        id: item.id,
        level,
        form: String(item.weaponForm || context.recipe?.weaponForm || '').toLowerCase(),
        rarity: item.rarity || context.recipe?.rarity || 'unknown',
        sourceKind: context.sourceKind,
        recipeId: context.recipe?.id || null,
        sources,
        excludedSources: allSources.filter(source => !sources.includes(source)),
        sourceStrength: classifySourceStrength(sources),
        elements: ELEMENTS.filter(element =>
            effects.some(effect => String(effect.type).toLowerCase() === element)
        ),
        isFallback: Boolean(context.isFallback || item.balanceIntent === 'weak_fallback_series'),
        blueprintAccess: classifyBlueprintAccess(context.recipe, sources),
        scope: classifyScope(item.id, effects, sources)
    };
}

function addRecord(byId, record) {
    const existing = byId.get(record.id);
    if (!existing) {
        byId.set(record.id, record);
        return;
    }
    existing.sources = [...new Set([...existing.sources, ...record.sources])];
    existing.sourceKind = `${existing.sourceKind}+${record.sourceKind}`;
}

function collectBlueprintSources() {
    const sources = new Map();
    const add = (recipeId, sourceId) => {
        if (!sources.has(recipeId)) sources.set(recipeId, []);
        sources.get(recipeId).push(sourceId);
    };

    for (const [sourceId, drops] of Object.entries(BlueprintDropDatabase)) {
        for (const drop of drops || []) {
            if (drop.recipeId) add(drop.recipeId, sourceId);
            if (!drop.seriesId) continue;
            for (const recipe of Object.values(RecipeDatabase)) {
                if (recipe.seriesId === drop.seriesId) add(recipe.id, sourceId);
            }
        }
    }
    return sources;
}

function classifyScope(id, effects, sources) {
    if (id.startsWith('casino_')) return 'casino';
    if (id.startsWith('tower_')
        || (sources.length > 0 && sources.every(source => source.startsWith('tower_')))) {
        return 'tower';
    }
    const affinities = effects.map(effect => String(effect.type).toLowerCase());
    if (affinities.includes('light') || affinities.includes('void')) return 'external-light-void';
    return 'first-run';
}

function classifyBlueprintAccess(recipe, sources) {
    if (!recipe) return 'not-applicable';
    if (DefaultKnownRecipeIds.includes(recipe.id)) return 'default-known';
    if (getRecipeSeriesForRecipe(recipe.id)?.unlockSceneId) return 'scene-unlock';
    if (getRecipeDiscovery(recipe.id)?.interactionId) return 'discovery';
    return sources.length > 0 ? 'drop' : 'missing';
}

function classifySourceStrength(sources) {
    let result = 'none';
    for (const source of sources) {
        const monsterId = source.includes(':') ? source.split(':').at(-1) : source;
        const type = String(monsters[monsterId]?.type || '').toLowerCase();
        if (type === 'boss' || type === 'world_boss') return 'boss';
        if (type === 'elite') result = 'elite';
        else if (result === 'none') result = 'normal';
    }
    return result;
}

function summarizeBand(items, min, max) {
    const bandItems = items.filter(item => item.level >= min && item.level <= max);
    const special = bandItems.filter(item => !item.isFallback);
    return {
        band: `${min}-${max}`,
        total: bandItems.length,
        special: special.length,
        fallback: bandItems.length - special.length,
        forms: Object.fromEntries(FORMS.map(form => [form, bandItems.filter(item => item.form === form).length])),
        specialForms: Object.fromEntries(FORMS.map(form => [form, special.filter(item => item.form === form).length])),
        sources: countBy(bandItems, 'sourceKind'),
        ids: bandItems.map(item => item.id)
    };
}

function countBy(items, field) {
    return items.reduce((counts, item) => {
        counts[item[field]] = (counts[item[field]] || 0) + 1;
        return counts;
    }, {});
}

function printReport(data) {
    console.log('Formal weapon catalog audit');
    console.log(JSON.stringify(data.summary));
    console.log('');
    console.log('Band     total special fallback | sword dagger heavy lance focus | special forms');
    for (const band of data.bands) {
        const forms = FORMS.map(form => String(band.forms[form]).padStart(2)).join(' ');
        const specialForms = FORMS.map(form => String(band.specialForms[form]).padStart(2)).join(' ');
        console.log(`${band.band.padEnd(8)} ${String(band.total).padStart(2)}    ${String(band.special).padStart(2)}      ${String(band.fallback).padStart(2)}   | ${forms} | ${specialForms}`);
    }
    console.log('');
    console.log('Elemental focus coverage');
    for (const element of ELEMENTS) {
        const rows = data.elementalFocus[element];
        console.log(`${element}: ${rows.length ? rows.map(row => `${row.id}@${row.level}`).join(', ') : 'MISSING'}`);
    }
    console.log('');
    console.log(`Unknown forms: ${data.unknownForms.join(', ') || 'none'}`);
    console.log(`Craft blueprint gaps: ${data.craftBlueprintGaps.map(row => row.recipeId).join(', ') || 'none'}`);
}
