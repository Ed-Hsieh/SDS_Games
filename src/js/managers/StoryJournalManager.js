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
