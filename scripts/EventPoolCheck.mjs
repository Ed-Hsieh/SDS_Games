import { EventDatabase, EventRole, getEventChapterRange, getEventsForZone } from '../src/js/data/Events.js';
import { WorldLandmarks, ZoneProfiles } from '../src/js/data/WorldStories.js';

const problems = [];
const warnings = [];

const landmarkById = new Map(WorldLandmarks.map(landmark => [landmark.id, landmark]));
const zoneIds = Object.keys(ZoneProfiles);
const locationBoundRoles = new Set([
    EventRole.STORY_SEED,
    EventRole.SIDE_STORY,
    EventRole.WORLD_LORE,
    EventRole.PRESSURE,
    EventRole.RISK_REWARD,
    EventRole.TRADE
]);
const limitedRepeatRoles = new Set([
    EventRole.STORY_SEED,
    EventRole.SIDE_STORY,
    EventRole.WORLD_LORE
]);

function push(list, section, message) {
    list.push({ section, message });
}

function unique(values = []) {
    return [...new Set(values.filter(Boolean))];
}

function hasText(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function validateEventShape(event) {
    const label = `${event.id || '(missing id)'} (${event.name || '未命名'})`;

    if (!hasText(event.id)) push(problems, 'event-id', `${label} is missing id`);
    if (!hasText(event.name)) push(problems, 'event-name', `${label} is missing name`);
    if (!hasText(event.description)) push(problems, 'event-description', `${label} is missing description`);

    const choices = Array.isArray(event.choices) ? event.choices : [];
    if (choices.length === 0) {
        push(problems, 'event-choice', `${label} has no choices`);
    }

    choices.forEach((choice, index) => {
        if (!hasText(choice.text)) push(problems, 'choice-text', `${label} choice ${index + 1} is missing text`);
        if (!hasText(choice.intent)) push(warnings, 'choice-intent', `${label} choice ${index + 1} is missing player-facing intent`);
    });

    const chapterRange = getEventChapterRange(event);
    if (chapterRange.min > chapterRange.max) {
        push(problems, 'chapter-range', `${label} has invalid chapter range ${chapterRange.min}-${chapterRange.max}`);
    }

    const zones = Array.isArray(event.zones) ? event.zones : [];
    const invalidZones = zones.filter(zone => !zoneIds.includes(zone) && zone !== 'boss');
    if (invalidZones.length > 0) {
        push(problems, 'zone-reference', `${label} references unknown zone(s): ${invalidZones.join(', ')}`);
    }

    const landmarkIds = Array.isArray(event.landmarkIds) ? unique(event.landmarkIds) : [];
    if (locationBoundRoles.has(event.eventRole) && landmarkIds.length === 0) {
        push(problems, 'location-gate', `${label} role ${event.eventRole} should be tied to at least one landmark`);
    }

    const missingLandmarks = landmarkIds.filter(id => !landmarkById.has(id));
    if (missingLandmarks.length > 0) {
        push(problems, 'landmark-reference', `${label} references unknown landmark(s): ${missingLandmarks.join(', ')}`);
    }

    if (limitedRepeatRoles.has(event.eventRole) && event.repeatPolicy === 'repeatable') {
        push(problems, 'repeat-policy', `${label} is ${event.eventRole} but repeatable`);
    }

    if (event.eventRole === EventRole.RESOURCE && Number(event.cooldownSteps || 0) < 4) {
        push(warnings, 'cooldown', `${label} is a resource event with a very short cooldown`);
    }
}

function getLandmarkContext(landmark) {
    return {
        landmarkId: landmark.id,
        currentLandmarkId: landmark.id,
        nearestLandmarkId: landmark.id,
        nearbyLandmarkIds: [landmark.id],
        landmarkTags: [
            ...(landmark.effectIds || []),
            ...(landmark.storyChainIds || []),
            ...(landmark.questIds || [])
        ]
    };
}

for (const event of EventDatabase) {
    validateEventShape(event);
}

const chapterZoneCoverage = [];
for (const chapter of [1, 2, 3]) {
    for (const zone of zoneIds) {
        const landmarks = WorldLandmarks.filter(landmark => {
            const zones = Array.isArray(landmark.zones) ? landmark.zones : [];
            return zones.includes(zone) && Number(landmark.chapter || 1) <= chapter;
        });

        const eventIds = new Set();
        const eventRoles = new Map();
        for (const landmark of landmarks) {
            for (const event of getEventsForZone(zone, { chapter, ...getLandmarkContext(landmark) })) {
                eventIds.add(event.id);
                eventRoles.set(event.id, event.eventRole || 'unknown');
            }
        }

        const roleCounts = {};
        for (const role of eventRoles.values()) {
            roleCounts[role] = (roleCounts[role] || 0) + 1;
        }

        chapterZoneCoverage.push({
            chapter,
            zone,
            landmarks: landmarks.length,
            events: eventIds.size,
            roles: roleCounts
        });

        if (landmarks.length > 0 && eventIds.size < 3) {
            push(warnings, 'pool-depth', `chapter ${chapter} zone ${zone} only has ${eventIds.size} eligible event(s) near known landmarks`);
        }
    }
}

if (problems.length > 0) {
    console.error(`Event pool check found ${problems.length} issue(s):`);
    for (const problem of problems) {
        console.error(`- [${problem.section}] ${problem.message}`);
    }
    process.exit(1);
}

const report = {
    events: EventDatabase.length,
    warnings,
    chapterZoneCoverage
};

console.log(JSON.stringify(report, null, 2));
