/**
 * StoryJournalManager.js
 * Single current-run owner for story discoveries used by the handbook and codex.
 */

import GameManager from './GameManager.js';
import {
    getLocationDiscoveries,
    getSceneDiscoveries,
    getStoryDiscovery,
    getStoryDiscoveryCatalog
} from '../data/StoryDiscoveries.js';
import {
    ChapterRegionOrder,
    ChapterRegionRegistry,
    findChapterLocation,
    getChapterRegion
} from '../data/ChapterRegionRegistry.js';
import { MonsterDatabase } from '../data/Monsters.js';
import { getAllCharacterProfiles } from '../data/CharacterProfiles.js';
import { MainlineCharacterContracts } from '../data/StoryActors.js';
import { getResolvedTownPlaces } from './TownStateResolver.js';

const StoryKindLabels = Object.freeze({
    clue: '現場線索',
    boss: '強敵紀錄',
    relationship: '人物片段',
    town: '城鎮變化',
    conclusion: '章節結論',
    event: '事件紀錄'
});

function isFlagSet(flag) {
    return Boolean(flag && GameManager.getFlag?.(flag));
}

function isSceneComplete(sceneId) {
    return isFlagSet(`story.scene.${sceneId}.complete`);
}

function getUnlockedCharacterStages(profile = {}) {
    return (profile.stages || []).filter(stage => !stage.fromFlag || isFlagSet(stage.fromFlag));
}

function getStageMood(stage, runNumber = 1) {
    if (!stage) return '';
    const runKey = runNumber >= 2 ? 'second_run' : 'first_run';
    return stage.moodByRun?.[runKey] || stage.mood || '';
}

class StoryJournalManager {
    constructor() {
        this.discoveryIds = [];
        this.discoveryMeta = {};
        this.runNumber = 1;
        GameManager.registerSaveSystem?.('storyJournal', this);
    }

    getRunNumber() {
        return Math.max(1, Number(GameManager.getFlag?.('story.run')) || this.runNumber || 1);
    }

    hasDiscovery(id) {
        return this.discoveryIds.includes(id);
    }

    recordDiscovery(id, context = {}) {
        const entry = getStoryDiscovery(id);
        if (!entry || this.hasDiscovery(id)) return null;

        this.discoveryIds.push(id);
        this.discoveryMeta[id] = {
            run: this.getRunNumber(),
            source: context.source || (entry.sceneId ? 'scene' : 'location'),
            sceneId: context.sceneId || entry.sceneId || null,
            locationId: context.locationId || entry.locationId || null,
            discoveredAt: Date.now()
        };
        GameManager.markSaveDirty?.('story-discovery');
        GameManager.notify?.('story-journal');
        return this.getRecord(id);
    }

    recordSceneDiscoveries(sceneId, context = {}) {
        return getSceneDiscoveries(sceneId)
            .map(entry => this.recordDiscovery(entry.id, { ...context, source: 'scene', sceneId }))
            .filter(Boolean);
    }

    recordLocationDiscoveries(locationId, context = {}) {
        return getLocationDiscoveries(locationId)
            .map(entry => this.recordDiscovery(entry.id, { ...context, source: 'location', locationId }))
            .filter(Boolean);
    }

    getRecord(id) {
        const entry = getStoryDiscovery(id);
        if (!entry || !this.hasDiscovery(id)) return null;
        return {
            ...entry,
            known: true,
            notebookIndex: this.discoveryIds.indexOf(id) + 1,
            meta: { ...(this.discoveryMeta[id] || {}) }
        };
    }

    getRecords(options = {}) {
        this.syncCompletedSceneDiscoveries();
        return this.discoveryIds
            .map(id => this.getRecord(id))
            .filter(Boolean)
            .filter(entry => options.chapter == null || entry.chapter === Number(options.chapter))
            .filter(entry => !options.kind || entry.kind === options.kind);
    }

    getCatalogEntries() {
        const known = new Set(this.discoveryIds);
        return getStoryDiscoveryCatalog()
            .filter(entry => known.has(entry.id))
            .map(entry => ({
                ...entry,
                entryId: entry.id,
                name: entry.title,
                type: entry.kind,
                sourceType: 'storyDiscovery',
                known: true,
                meta: { ...(this.discoveryMeta[entry.id] || {}) }
            }));
    }

    getMainlineRecord(directive) {
        if (!directive) return null;
        const region = getChapterRegion(directive.chapter);
        const fieldTarget = directive.targetId
            ? findChapterLocation(directive.targetId, directive.chapter)
            : null;
        const destination = directive.placeId
            ? (getResolvedTownPlaces().find(place => place.id === directive.placeId)?.name || '城鎮')
            : (fieldTarget?.name || region?.title || '未知區域');

        return {
            key: `mainline:${directive.sceneId}`,
            kind: 'mainline',
            icon: String(directive.chapter),
            title: directive.title,
            typeLabel: `第 ${directive.chapter} 章`,
            statusText: '目前追查',
            statusTone: 'active',
            summaryMode: 'compact',
            summaryLabel: region?.title || `第 ${directive.chapter} 章`,
            summaryHint: destination,
            current: directive.text,
            listMeta: [destination, directive.targetType === 'town' ? '城鎮' : '野外'],
            sections: [{ title: '目前目的', lines: [directive.text] }],
            route: directive.route,
            routeLabel: directive.targetType === 'town' ? `前往${destination}` : '前往冒險區',
            routeDescription: directive.text,
            npcId: directive.actorId || ''
        };
    }

    getBossTraceRecords() {
        const visited = new Set(this.getRecords()
            .map(record => record.locationId || record.meta?.locationId)
            .filter(Boolean));

        return ChapterRegionOrder.flatMap(regionId => {
            const region = ChapterRegionRegistry[regionId];
            return (region?.locationNodes || []).flatMap(node => {
                if (!node.bossId) return [];
                const sceneId = node.sceneIds?.[0] || null;
                const complete = Boolean(sceneId && isSceneComplete(sceneId));
                if (!visited.has(node.id) && !complete) return [];

                const monster = MonsterDatabase[node.bossId] || {};
                return [{
                    key: `boss:${region.regionId}:${node.id}`,
                    kind: 'boss',
                    icon: monster.icon || '!',
                    image: monster.image || null,
                    title: monster.name || node.name,
                    typeLabel: node.optional ? '額外強敵' : '關鍵強敵',
                    hideSummaryMeta: true,
                    summaryLabel: '遭遇區域',
                    summaryHint: region.title,
                    statusIcon: complete ? '✓' : '!',
                    statusText: complete ? '已擊破' : '已發現',
                    statusTone: complete ? 'finished' : 'active',
                    listMeta: [`第 ${region.chapter} 章`, region.title, node.name],
                    current: complete
                        ? `${node.name}的威脅已經解除。`
                        : (node.arrival || node.mapHint || '這裡留有強敵活動的痕跡。'),
                    sections: [{
                        title: complete ? '戰鬥結果' : '現場痕跡',
                        lines: [complete ? '這場遭遇已經結束。' : (node.mapHint || '強敵仍在這一帶活動。')]
                    }],
                    route: 'adventure',
                    routeLabel: complete ? '返回冒險區' : '前往遭遇區'
                }];
            });
        });
    }

    getWorldNoteRecords() {
        return this.getRecords().map(record => {
            const isFieldRecord = Boolean(record.locationId || record.meta?.locationId);
            const typeLabel = StoryKindLabels[record.kind] || '旅途紀錄';
            return {
                key: `story-discovery:${record.id}`,
                kind: 'world',
                icon: record.icon || '?',
                title: record.title,
                typeLabel,
                summaryMode: 'compact',
                hideSummaryMeta: true,
                summaryLabel: `第 ${record.chapter} 章`,
                summaryHint: record.sourceLabel,
                statusIcon: '✓',
                statusText: `紀錄 ${record.notebookIndex}`,
                statusTone: ['boss', 'conclusion'].includes(record.kind) ? 'finished' : 'active',
                listMeta: [`第 ${record.chapter} 章`, record.sourceLabel, typeLabel],
                current: record.observation,
                thoughtTitle: '目前能得到的判斷',
                thoughtText: record.inference,
                sections: [
                    { title: '觀察所得', lines: [record.observation] },
                    { title: '暫時推論', lines: [record.inference || '目前還不能得到完整結論。'] }
                ],
                route: isFieldRecord ? 'adventure' : 'lobby',
                routeLabel: isFieldRecord ? '返回冒險區' : '返回城鎮'
            };
        });
    }

    getRelationshipRecords() {
        const runNumber = this.getRunNumber();
        return getAllCharacterProfiles()
            .flatMap(profile => {
                const contract = MainlineCharacterContracts[profile.id];
                if (!contract || !isSceneComplete(contract.introductionSceneId)) return [];

                const stages = getUnlockedCharacterStages(profile);
                const currentStage = stages.at(-1) || null;
                const eventStages = stages.filter(stage => stage.fromFlag);
                const stageLines = stages.map(stage => [
                    stage.label,
                    getStageMood(stage, runNumber)
                ].filter(Boolean).join('：'));
                return [{
                    key: `relationship:${profile.id}`,
                    kind: 'relationship',
                    icon: '人',
                    image: profile.portrait || null,
                    title: profile.name,
                    typeLabel: profile.title || '城鎮人物',
                    summaryLabel: profile.name,
                    summaryHint: currentStage?.label || '已相識',
                    statusText: currentStage?.label || '已相識',
                    statusTone: eventStages.length > 0 ? 'active' : 'available',
                    listMeta: [profile.title, currentStage?.label].filter(Boolean),
                    current: getStageMood(currentStage, runNumber) || profile.external || profile.title,
                    sections: [
                        {
                            title: '留下的印象',
                            lines: [profile.external || profile.title].filter(Boolean)
                        },
                        {
                            title: '已發生的事',
                            lines: stageLines.length > 0 ? stageLines : ['尚未留下更多紀錄。']
                        }
                    ],
                    relationship: {
                        profile,
                        npcId: profile.id,
                        stage: currentStage,
                        stages,
                        statusText: currentStage?.label || '已相識'
                    }
                }];
            })
            .sort((a, b) => String(a.title).localeCompare(String(b.title), 'zh-Hant'));
    }

    getTownMemoryRecords() {
        const records = getResolvedTownPlaces().flatMap(place => (place.states || []).map(state => ({
            key: `town:${place.id}:${state.id || state.flag || state.title}`,
            kind: 'town',
            icon: place.icon || '#',
            title: state.title,
            typeLabel: '城鎮紀錄',
            summaryMode: 'compact',
            hideSummaryMeta: true,
            summaryLabel: '發生地點',
            summaryHint: place.name,
            statusIcon: '✓',
            statusText: place.name,
            statusTone: 'finished',
            listMeta: [place.name, place.tag, '已發生'].filter(Boolean),
            current: state.text || place.description,
            sections: [{ title: '城鎮變化', lines: [state.text || place.description].filter(Boolean) }],
            route: 'lobby',
            routeLabel: '返回城鎮'
        })));

        const finale = GameManager.getFlag?.('world.ending.outcome');
        if (!finale?.id) return records;
        const lines = Array.isArray(finale.sceneLines) && finale.sceneLines.length > 0
            ? finale.sceneLines.filter(Boolean)
            : [finale.summary].filter(Boolean);
        return [{
            key: `town:ending:${finale.id}`,
            kind: 'town',
            icon: '終',
            title: finale.title || '旅途終點',
            typeLabel: '結局紀錄',
            summaryMode: 'compact',
            hideSummaryMeta: true,
            summaryLabel: '最後一頁',
            summaryHint: '城鎮收尾',
            statusIcon: '✓',
            statusText: finale.townEcho || '旅途已留下結果',
            statusTone: 'finished',
            listMeta: ['旅途終點', finale.townEcho || finale.summary].filter(Boolean),
            current: lines[0] || finale.summary,
            sections: [{
                title: '城鎮回聲',
                lines: [...lines, finale.townEcho].filter(Boolean)
            }],
            route: 'lobby',
            routeLabel: '返回城鎮'
        }, ...records];
    }

    syncCompletedSceneDiscoveries() {
        let changed = false;
        for (const entry of getStoryDiscoveryCatalog()) {
            if (!entry.sceneId || this.hasDiscovery(entry.id)) continue;
            if (!GameManager.getFlag?.(`story.scene.${entry.sceneId}.complete`)) continue;
            this.discoveryIds.push(entry.id);
            this.discoveryMeta[entry.id] = {
                run: this.getRunNumber(),
                source: 'scene',
                sceneId: entry.sceneId,
                locationId: entry.locationId || null,
                discoveredAt: Date.now()
            };
            changed = true;
        }
        if (changed) GameManager.markSaveDirty?.('story-discovery-sync');
    }

    resetForRun(runNumber = 1) {
        this.discoveryIds = [];
        this.discoveryMeta = {};
        this.runNumber = Math.max(1, Number(runNumber) || 1);
        GameManager.markSaveDirty?.('story-journal-reset');
        GameManager.notify?.('story-journal');
    }

    serialize() {
        return {
            runNumber: this.getRunNumber(),
            discoveryIds: [...this.discoveryIds],
            discoveryMeta: { ...this.discoveryMeta }
        };
    }

    deserialize(data = {}) {
        this.runNumber = Math.max(1, Number(data.runNumber) || 1);
        this.discoveryIds = Array.isArray(data.discoveryIds)
            ? data.discoveryIds.filter(id => Boolean(getStoryDiscovery(id)))
            : [];
        this.discoveryMeta = data.discoveryMeta && typeof data.discoveryMeta === 'object'
            ? { ...data.discoveryMeta }
            : {};
        this.syncCompletedSceneDiscoveries();
    }

    resetProgress() {
        this.resetForRun(1);
    }
}

export const storyJournalManager = new StoryJournalManager();
export default StoryJournalManager;
