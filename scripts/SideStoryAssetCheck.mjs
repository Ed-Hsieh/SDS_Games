import fs from 'node:fs';
import { getGeneratedLandmarkImage } from '../src/js/data/AssetManifest.js';
import { findChapterLocation } from '../src/js/data/ChapterRegionRegistry.js';
import {
    AllOptionalSideStories,
    OptionalSideStoryDerivedResources
} from '../src/js/data/OptionalSideStoryRegistry.js';
import { OverworldLandmarks } from '../src/js/data/OverworldMapRegistry.js';
import {
    StoryExpressionCoverage,
    StoryExpressionIds
} from '../src/js/data/StoryActors.js';
import { TownPlaceDatabase } from '../src/js/data/TownPlaces.js';

const townPlaces = new Map(TownPlaceDatabase.map(place => [place.id, place]));
const overworldLandmarks = new Map(OverworldLandmarks.map(landmark => [landmark.id, landmark]));

function resolveBackground(ownerId) {
    const townPlace = townPlaces.get(ownerId);
    if (townPlace?.sceneImage) return townPlace.sceneImage;

    const overworldLandmark = overworldLandmarks.get(ownerId);
    if (overworldLandmark?.image) return overworldLandmark.image;

    const chapterLocation = findChapterLocation(ownerId);
    if (!chapterLocation) return null;
    const mappedLandmark = overworldLandmarks.get(chapterLocation.legacyLandmarkId || chapterLocation.id);
    if (mappedLandmark?.image) return mappedLandmark.image;
    return getGeneratedLandmarkImage(chapterLocation.legacyLandmarkId || chapterLocation.id) || null;
}

const invalidExpressionIds = [];
const missingPhysicalExpressionLayers = [];
const missingRegisteredExpressionLayers = [];
for (const layerId of OptionalSideStoryDerivedResources.requiredExpressionLayerIds) {
    const [actorId, expressionId] = layerId.split(':');
    if (!StoryExpressionIds.includes(expressionId)) invalidExpressionIds.push(layerId);
    const path = `src/assets/images/art/characters/dialogue/${actorId}/${expressionId}-standing.webp`;
    if (!fs.existsSync(path)) missingPhysicalExpressionLayers.push(layerId);
    if (!(StoryExpressionCoverage[actorId] || []).includes(expressionId)) {
        missingRegisteredExpressionLayers.push(layerId);
    }
}

const backgroundResults = OptionalSideStoryDerivedResources.requiredBackgroundOwnerIds.map(ownerId => {
    const path = resolveBackground(ownerId);
    return {
        ownerId,
        path,
        physicalFile: Boolean(path && fs.existsSync(path))
    };
});
const missingBackgroundMappings = backgroundResults.filter(result => !result.path).map(result => result.ownerId);
const missingBackgroundFiles = backgroundResults
    .filter(result => result.path && !result.physicalFile)
    .map(result => ({ ownerId: result.ownerId, path: result.path }));

const missingNewIcons = OptionalSideStoryDerivedResources.newIconIds.filter(iconId => {
    const candidates = [
        `src/assets/images/art/items/equipment/${iconId}.webp`,
        `src/assets/images/art/items/consumables/${iconId}.webp`,
        `src/assets/images/art/items/blueprints/${iconId}.webp`,
        `src/assets/images/art/items/clues/${iconId}.webp`
    ];
    return !candidates.some(candidate => fs.existsSync(candidate));
});

const result = {
    ok: invalidExpressionIds.length === 0 && missingBackgroundFiles.length === 0,
    summary: {
        stories: AllOptionalSideStories.length,
        requiredExpressionLayers: OptionalSideStoryDerivedResources.requiredExpressionLayerIds.length,
        missingPhysicalExpressionLayers: missingPhysicalExpressionLayers.length,
        missingRegisteredExpressionLayers: missingRegisteredExpressionLayers.length,
        requiredBackgroundOwners: backgroundResults.length,
        missingBackgroundMappings: missingBackgroundMappings.length,
        missingBackgroundFiles: missingBackgroundFiles.length,
        plannedNewIcons: OptionalSideStoryDerivedResources.newIconIds.length,
        missingNewIcons: missingNewIcons.length
    },
    gaps: {
        invalidExpressionIds,
        missingPhysicalExpressionLayers,
        missingRegisteredExpressionLayers,
        missingBackgroundMappings,
        missingBackgroundFiles,
        missingNewIcons
    },
    backgroundResults
};

console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);
