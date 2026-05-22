import GameManager from './GameManager.js';
import {
    getClue,
    getLandmark,
    getMonsterClueTriggers,
    getStoryChain,
    getTerrainEffect,
    getZoneProfile,
    WorldClues,
    WorldLandmarks,
    WorldStoryChains
} from '../data/WorldStories.js';
import {
    StoryActionTypes,
    StoryEventTypes,
    getStoryEventRules
} from '../data/StoryProgressMap.js';
import { BossMonsterIds } from '../data/Monsters.js';

const BossTemplateIdSet = new Set(Array.isArray(BossMonsterIds) ? BossMonsterIds : []);

function clampStage(stages, clueCount) {
    if (!Array.isArray(stages) || stages.length === 0) return null;
    return stages.reduce((best, stage) => {
        if (clueCount >= (stage.minClues || 0)) return stage;
        return best;
    }, stages[0]);
}

class WorldStoryManager {
    getClueFlag(clueId) {
        return `world.clue.${clueId}`;
    }

    getLandmarkVisitedFlag(landmarkId) {
        return `world.landmark.${landmarkId}.visited`;
    }

    getMonsterDefeatedFlag(monsterId) {
        return `world.monster.${monsterId}.defeated`;
    }

    getStoryStageFlag(chainId) {
        return `world.story.${chainId}.stage`;
    }

    getStoryProgressFlag(chainId, progressId) {
        return `world.story.${chainId}.progress.${progressId}`;
    }

    getStoryFinalReadyFlag(chainId) {
        return `world.story.${chainId}.finalReady`;
    }

    getClueOrderFlag() {
        return 'world.clueOrder';
    }

    getClueMetaFlag(clueId) {
        return `world.clue.${clueId}.meta`;
    }

    getStoryEventCounterFlag(counterKey) {
        return `world.storyCounter.${counterKey}`;
    }

    hasStoryProgress(chainId, progressId) {
        return Boolean(GameManager.getFlag(this.getStoryProgressFlag(chainId, progressId)));
    }

    hasMonsterDefeated(monsterId) {
        return Boolean(GameManager.getFlag(this.getMonsterDefeatedFlag(monsterId)));
    }

    ruleRequirementsPassed(requires = [], payload = {}) {
        if (!Array.isArray(requires) || requires.length === 0) return true;

        return requires.every(requirement => {
            if (!requirement?.type) return true;

            switch (requirement.type) {
                case 'monsterDefeated':
                    return this.hasMonsterDefeated(requirement.monsterId);
                case 'flag':
                    return Boolean(GameManager.getFlag(requirement.flag)) === (requirement.value ?? true);
                case 'notFlag':
                    return !Boolean(GameManager.getFlag(requirement.flag));
                case 'clue':
                    return this.hasClue(requirement.clueId);
                case 'storyProgress':
                    return this.hasStoryProgress(requirement.chainId, requirement.progressId);
                case 'payload':
                    return payload[requirement.key] === requirement.value;
                default:
                    return true;
            }
        });
    }

    getRuleCounterKey(rule, payload = {}) {
        const rawKey = rule?.counter?.key || rule?.id || 'unknown';
        return String(rawKey).replace(/\{(\w+)\}/g, (_, key) => String(payload[key] ?? 'unknown'));
    }

    updateRuleCounter(rule, payload = {}) {
        if (!rule?.counter) {
            return { passed: true, count: null, required: null };
        }

        const key = this.getRuleCounterKey(rule, payload);
        const flag = this.getStoryEventCounterFlag(key);
        const previous = Number(GameManager.getFlag(flag)) || 0;
        const amount = Math.max(1, Number(payload.amount ?? rule.counter.amount ?? 1) || 1);
        const count = previous + amount;
        const required = Math.max(1, Number(rule.counter.required) || 1);

        GameManager.setFlag(flag, count);

        return {
            key,
            count,
            required,
            passed: count >= required
        };
    }

    applyStoryAction(action, context = {}) {
        if (!action?.type) return null;

        switch (action.type) {
            case StoryActionTypes.REVEAL_CLUE: {
                const clue = this.revealClue(action.clueId, context);
                return clue ? { type: action.type, clue } : null;
            }
            case StoryActionTypes.REVEAL_NEXT_CLUE: {
                const clue = this.revealNextClue(action.chainId, context);
                return clue ? { type: action.type, chainId: action.chainId, clue } : null;
            }
            case StoryActionTypes.RECORD_PROGRESS: {
                const alreadyCompleted = this.hasStoryProgress(action.chainId, action.progressId);
                const status = this.recordProgress(action.chainId, action.progressId, context);
                return !alreadyCompleted && status
                    ? { type: action.type, chainId: action.chainId, progressId: action.progressId, status }
                    : null;
            }
            case StoryActionTypes.MARK_FINAL_READY: {
                const alreadyReady = Boolean(GameManager.getFlag(this.getStoryFinalReadyFlag(action.chainId))?.ready);
                const status = this.markFinalReady(action.chainId, context);
                return !alreadyReady && status
                    ? { type: action.type, chainId: action.chainId, status }
                    : null;
            }
            default:
                return null;
        }
    }

    applyStoryEvent(eventType, payload = {}) {
        const rules = getStoryEventRules(eventType, payload);
        const outcome = {
            eventType,
            payload,
            appliedRules: [],
            newClues: [],
            progressUpdates: [],
            finalReady: []
        };

        for (const rule of rules) {
            if (!this.ruleRequirementsPassed(rule.requires, payload)) continue;

            const counter = this.updateRuleCounter(rule, payload);
            if (!counter.passed) {
                outcome.appliedRules.push({
                    id: rule.id,
                    pending: true,
                    counter
                });
                continue;
            }

            const effects = [];
            for (const action of rule.actions || []) {
                const effect = this.applyStoryAction(action, {
                    ...payload,
                    source: payload.source || eventType,
                    eventType,
                    ruleId: rule.id
                });
                if (!effect) continue;

                effects.push(effect);
                if (effect.clue) outcome.newClues.push(effect.clue);
                if (effect.type === StoryActionTypes.RECORD_PROGRESS) outcome.progressUpdates.push(effect);
                if (effect.type === StoryActionTypes.MARK_FINAL_READY) outcome.finalReady.push(effect);
            }

            if (effects.length > 0) {
                outcome.appliedRules.push({
                    id: rule.id,
                    counter,
                    effects
                });
            }
        }

        return outcome;
    }

    recordZoneExploration(zoneId, context = {}) {
        if (!zoneId) return { newClues: [] };
        return this.applyStoryEvent(StoryEventTypes.ZONE_EXPLORED, {
            ...context,
            zoneId,
            source: context.source || 'zone_explored'
        });
    }

    hasClue(clueId) {
        return Boolean(GameManager.getFlag(this.getClueFlag(clueId)));
    }

    prunePrematureClueUnlocks() {
        const prematureClues = [
            {
                clueId: 'survivor_warning',
                chainId: 'ambush_mantis',
                requiredLandmarkId: 'old_campfire_site',
                sources: ['dialogue:village_elder', 'world_object', 'world_interaction']
            },
            {
                clueId: 'hunter_board_notice',
                chainId: 'blood_moon_stag',
                requiredMonsterDefeated: 'forest_guardian',
                exemptSources: ['boss_test_panel']
            },
            {
                clueId: 'moon_moss_sample',
                chainId: 'blood_moon_stag',
                requiredMonsterDefeated: 'forest_guardian',
                exemptSources: ['boss_test_panel']
            },
            {
                clueId: 'broken_horn_map',
                chainId: 'blood_moon_stag',
                requiredMonsterDefeated: 'forest_guardian',
                exemptSources: ['boss_test_panel']
            },
            {
                clueId: 'thorn_trade_bead',
                chainId: 'thorn_witch',
                requiredProgress: { chainId: 'thorn_witch', progressId: 'deliver_herbs' },
                exemptSources: ['boss_test_panel']
            },
            {
                clueId: 'villager_herb_request',
                chainId: 'thorn_witch',
                requiredProgress: { chainId: 'thorn_witch', progressId: 'deliver_herbs' },
                exemptSources: ['boss_test_panel']
            },
            {
                clueId: 'green_bargain_mark',
                chainId: 'thorn_witch',
                requiredProgress: { chainId: 'thorn_witch', progressId: 'deliver_herbs' },
                exemptSources: ['boss_test_panel']
            }
        ];

        let changed = false;
        for (const entry of prematureClues) {
            if (!GameManager.getFlag(this.getClueFlag(entry.clueId))) continue;

            const metaFlag = this.getClueMetaFlag(entry.clueId);
            const meta = GameManager.getFlag(metaFlag) || {};
            const reachedRequiredPlace = Boolean(GameManager.getFlag(this.getLandmarkVisitedFlag(entry.requiredLandmarkId)))
                || meta.landmarkId === entry.requiredLandmarkId;
            const defeatedRequiredMonster = entry.requiredMonsterDefeated
                ? this.hasMonsterDefeated(entry.requiredMonsterDefeated)
                : true;
            const progressRequirementMet = entry.requiredProgress
                ? this.hasStoryProgress(entry.requiredProgress.chainId, entry.requiredProgress.progressId)
                : true;
            const placeRequirementMet = entry.requiredLandmarkId ? reachedRequiredPlace : true;
            if (placeRequirementMet && defeatedRequiredMonster && progressRequirementMet) continue;

            const source = String(meta.source || '');
            const sourceIsExempt = (entry.exemptSources || []).some(prefix => source === prefix || source.startsWith(`${prefix}:`));
            if (sourceIsExempt) continue;

            const sourceLooksPremature = !entry.sources?.length
                || !source
                || entry.sources.some(prefix => source === prefix || source.startsWith(`${prefix}:`));
            if (!sourceLooksPremature) continue;

            delete GameManager.state.flags[this.getClueFlag(entry.clueId)];
            delete GameManager.state.flags[metaFlag];

            const orderFlag = this.getClueOrderFlag();
            const order = Array.isArray(GameManager.getFlag(orderFlag))
                ? GameManager.getFlag(orderFlag).filter(clueId => clueId !== entry.clueId)
                : [];
            if (order.length > 0) GameManager.setFlag(orderFlag, order);
            else delete GameManager.state.flags[orderFlag];

            changed = true;
            this.updateStoryStage(entry.chainId);
        }

        if (changed) GameManager.markSaveDirty?.('world-story-clue-prune');
        return changed;
    }

    revealClue(clueId, context = {}) {
        const clue = getClue(clueId);
        if (!clue || this.hasClue(clueId)) return null;

        const orderFlag = this.getClueOrderFlag();
        const order = Array.isArray(GameManager.getFlag(orderFlag))
            ? GameManager.getFlag(orderFlag).slice()
            : [];
        if (!order.includes(clueId)) {
            order.push(clueId);
            GameManager.setFlag(orderFlag, order);
        }
        GameManager.setFlag(this.getClueMetaFlag(clueId), {
            order: order.indexOf(clueId) + 1,
            source: context.source || clue.source || null,
            landmarkId: context.landmarkId || null,
            monsterId: context.monsterId || null,
            zoneId: context.zoneId || null,
            discoveredAt: Date.now()
        });
        GameManager.setFlag(this.getClueFlag(clueId), true);
        this.updateStoryStage(clue.chainId);

        return {
            ...clue,
            context,
            newlyDiscovered: true
        };
    }

    getStoryClueCount(chainId) {
        this.prunePrematureClueUnlocks();
        const chain = getStoryChain(chainId);
        if (!chain) return 0;
        return (chain.clueIds || []).filter(clueId => this.hasClue(clueId)).length;
    }

    updateStoryStage(chainId) {
        const chain = getStoryChain(chainId);
        if (!chain) return null;

        const clueCount = this.getStoryClueCount(chainId);
        const stages = chain.stages || [];
        let stageIndex = 0;
        for (let index = 0; index < stages.length; index += 1) {
            if (clueCount >= (stages[index].minClues || 0)) stageIndex = index;
        }
        GameManager.setFlag(this.getStoryStageFlag(chainId), stageIndex);
        return stages[stageIndex] || null;
    }

    visitLandmark(landmarkId, context = {}) {
        const landmark = getLandmark(landmarkId);
        if (!landmark) {
            return {
                success: false,
                title: '未知地點',
                icon: '？',
                description: '你抵達一處尚未記錄的地點。',
                messages: []
            };
        }

        const visitedFlag = this.getLandmarkVisitedFlag(landmarkId);
        const firstVisit = !GameManager.getFlag(visitedFlag);
        GameManager.setFlag(visitedFlag, true);

        const newClues = [];
        for (const clueId of landmark.clueIds || []) {
            const clue = this.revealClue(clueId, {
                source: 'landmark',
                landmarkId,
                zoneId: context.zoneId
            });
            if (clue) newClues.push(clue);
        }

        const storyEventOutcome = this.applyStoryEvent(StoryEventTypes.LANDMARK_VISITED, {
            ...context,
            landmarkId,
            zoneId: context.zoneId,
            firstVisit,
            source: context.source || 'landmark'
        });
        if (storyEventOutcome.newClues?.length) {
            newClues.push(...storyEventOutcome.newClues);
        }

        const effects = (landmark.effectIds || []).map(getTerrainEffect).filter(Boolean);
        const relatedStories = (landmark.storyChainIds || [])
            .map(chainId => this.getStorySummary(chainId))
            .filter(Boolean);

        return {
            success: true,
            landmark,
            icon: landmark.icon,
            title: landmark.name,
            firstVisit,
            description: firstVisit ? landmark.arrival : landmark.repeat,
            messages: newClues.map(clue => clue.text),
            newClues,
            storyEvents: storyEventOutcome,
            effects,
            relatedStories
        };
    }

    recordMonsterKill(monster, context = {}) {
        const monsterId = typeof monster === 'string' ? monster : monster?.id;
        if (!monsterId) return { newClues: [] };

        const defeatedFlag = this.getMonsterDefeatedFlag(monsterId);
        const previousDefeat = GameManager.getFlag(defeatedFlag);
        const previousCount = typeof previousDefeat === 'object'
            ? Number(previousDefeat.count) || 0
            : (previousDefeat ? 1 : 0);
        GameManager.setFlag(defeatedFlag, {
            defeated: true,
            count: previousCount + 1,
            updatedAt: Date.now()
        });

        const newClues = [];
        for (const trigger of getMonsterClueTriggers(monsterId)) {
            if (this.hasClue(trigger.clueId)) continue;
            const chance = Number(trigger.chance);
            const roll = typeof context.rng === 'function' ? context.rng() : Math.random();
            if (Number.isFinite(chance) && roll > chance) continue;

            const clue = this.revealClue(trigger.clueId, {
                source: 'monster_kill',
                monsterId,
                zoneId: context.zoneId
            });
            if (clue) {
                newClues.push({
                    ...clue,
                    triggerMessage: trigger.message
                });
            }
        }

        const storyEventOutcome = this.applyStoryEvent(StoryEventTypes.MONSTER_KILL, {
            ...context,
            monsterId,
            source: context.source || 'monster_kill'
        });
        if (storyEventOutcome.newClues?.length) {
            newClues.push(...storyEventOutcome.newClues);
        }

        return { newClues, storyEvents: storyEventOutcome };
    }

    recordProgress(chainId, progressId, context = {}) {
        const chain = getStoryChain(chainId);
        const progress = (chain?.progressMethods || []).find(item => item.id === progressId);
        if (!chain || !progress) return null;

        GameManager.setFlag(this.getStoryProgressFlag(chainId, progressId), {
            completed: true,
            type: progress.type,
            label: progress.label,
            source: context.source || 'debug_panel',
            updatedAt: Date.now()
        });
        return this.getBossFlowStatus(chainId);
    }

    revealNextClue(chainId, context = {}) {
        const chain = getStoryChain(chainId);
        if (!chain) return null;
        const nextClueId = (chain.clueIds || []).find(clueId => !this.hasClue(clueId));
        return nextClueId ? this.revealClue(nextClueId, context) : null;
    }

    revealAllClues(chainId, context = {}) {
        const chain = getStoryChain(chainId);
        if (!chain) return [];
        return (chain.clueIds || [])
            .map(clueId => this.revealClue(clueId, context))
            .filter(Boolean);
    }

    markFinalReady(chainId, context = {}) {
        const chain = getStoryChain(chainId);
        if (!chain) return null;
        GameManager.setFlag(this.getStoryFinalReadyFlag(chainId), {
            ready: true,
            source: context.source || 'debug_panel',
            updatedAt: Date.now()
        });
        return this.getBossFlowStatus(chainId);
    }

    resetStoryChain(chainId) {
        const chain = getStoryChain(chainId);
        if (!chain) return false;

        for (const clueId of chain.clueIds || []) {
            delete GameManager.state.flags[this.getClueFlag(clueId)];
            delete GameManager.state.flags[this.getClueMetaFlag(clueId)];
        }
        for (const progress of chain.progressMethods || []) {
            delete GameManager.state.flags[this.getStoryProgressFlag(chainId, progress.id)];
        }
        delete GameManager.state.flags[this.getStoryStageFlag(chainId)];
        delete GameManager.state.flags[this.getStoryFinalReadyFlag(chainId)];

        const order = Array.isArray(GameManager.getFlag(this.getClueOrderFlag()))
            ? GameManager.getFlag(this.getClueOrderFlag()).filter(clueId => !(chain.clueIds || []).includes(clueId))
            : [];
        if (order.length > 0) GameManager.setFlag(this.getClueOrderFlag(), order);
        else delete GameManager.state.flags[this.getClueOrderFlag()];

        GameManager.notify('flags');
        return true;
    }

    resetWorldStoryProgress() {
        for (const key of Object.keys(GameManager.state.flags || {})) {
            if (key.startsWith('world.')) delete GameManager.state.flags[key];
        }
        GameManager.notify('flags');
    }

    getStorySummary(chainId) {
        const chain = getStoryChain(chainId);
        if (!chain) return null;

        const clueCount = this.getStoryClueCount(chainId);
        const stage = clampStage(chain.stages, clueCount);
        return {
            id: chain.id,
            title: chain.title,
            method: chain.method,
            bossId: chain.bossId,
            clueCount,
            totalClues: chain.clueIds?.length || 0,
            text: stage?.text || chain.premise
        };
    }

    getActiveStorySummaries(limit = 3) {
        return Object.keys(WorldStoryChains)
            .map(chainId => this.getStorySummary(chainId))
            .filter(Boolean)
            .sort((a, b) => b.clueCount - a.clueCount)
            .slice(0, limit);
    }

    getDiscoveredClues(chainId = null) {
        this.prunePrematureClueUnlocks();
        const order = Array.isArray(GameManager.getFlag(this.getClueOrderFlag()))
            ? GameManager.getFlag(this.getClueOrderFlag())
            : [];
        const orderedIds = [
            ...order,
            ...Object.keys(WorldClues).filter(clueId => !order.includes(clueId))
        ];

        let fallbackIndex = 0;
        return orderedIds
            .map(clueId => WorldClues[clueId])
            .filter(clue => clue && (!chainId || clue.chainId === chainId) && this.hasClue(clue.id))
            .map(clue => {
                const orderIndex = order.indexOf(clue.id);
                const notebookIndex = orderIndex >= 0 ? orderIndex + 1 : order.length + (++fallbackIndex);
                return {
                    ...clue,
                    notebookIndex,
                    meta: GameManager.getFlag(this.getClueMetaFlag(clue.id)) || null
                };
            });
    }

    getVisitedLandmarks() {
        return WorldLandmarks
            .filter(landmark => GameManager.getFlag(this.getLandmarkVisitedFlag(landmark.id)))
            .map(landmark => ({ ...landmark }));
    }

    getNotebookData() {
        const chains = Object.keys(WorldStoryChains)
            .map(chainId => {
                const summary = this.getStorySummary(chainId);
                const chain = getStoryChain(chainId);
                const clues = this.getDiscoveredClues(chainId);
                return {
                    ...summary,
                    clues,
                    totalClues: chain?.clueIds?.length || summary?.totalClues || 0
                };
            })
            .filter(chain => chain && chain.clues.length > 0);

        return {
            chains,
            clues: this.getDiscoveredClues(),
            landmarks: this.getVisitedLandmarks()
        };
    }

    getStoryProgress(chainId) {
        const chain = getStoryChain(chainId);
        return (chain?.progressMethods || []).map(progress => ({
            ...progress,
            completed: Boolean(GameManager.getFlag(this.getStoryProgressFlag(chainId, progress.id)))
        }));
    }

    validateBossFlow(chainId) {
        const chain = getStoryChain(chainId);
        if (!chain) return null;

        const checks = [
            {
                id: 'entries',
                label: '3 個以上入口',
                passed: (chain.entries || []).length >= 3,
                value: (chain.entries || []).length
            },
            {
                id: 'progress',
                label: '2 種以上推進方式',
                passed: new Set((chain.progressMethods || []).map(item => item.type)).size >= 2,
                value: new Set((chain.progressMethods || []).map(item => item.type)).size
            },
            {
                id: 'puzzle',
                label: '1 個專屬地圖謎題',
                passed: Boolean(chain.mapPuzzle?.id),
                value: chain.mapPuzzle?.label || ''
            },
            {
                id: 'shortcut',
                label: '1 個可選捷徑',
                passed: Boolean(chain.shortcut?.id),
                value: chain.shortcut?.label || ''
            },
            {
                id: 'final',
                label: '1 個獨特最終觸發方式',
                passed: Boolean(chain.finalTrigger?.id && chain.finalTrigger?.type),
                value: chain.finalTrigger?.type || ''
            }
        ];

        return {
            passed: checks.every(check => check.passed),
            checks
        };
    }

    getBossFlowStatus(chainId) {
        const chain = getStoryChain(chainId);
        if (!chain) return null;

        const discoveredClues = this.getDiscoveredClues(chainId);
        const progress = this.getStoryProgress(chainId);
        const completedProgress = progress.filter(item => item.completed).length;
        const finalTrigger = chain.finalTrigger || {};
        const requiredClues = Number(finalTrigger.requiredClues) || Math.min(2, chain.clueIds?.length || 0);
        const requiredProgress = Number(finalTrigger.requiredProgress) || 1;
        const finalReadyFlag = GameManager.getFlag(this.getStoryFinalReadyFlag(chainId));
        const readyByProgress = discoveredClues.length >= requiredClues && completedProgress >= requiredProgress;

        return {
            ...this.getStorySummary(chainId),
            archetype: chain.archetype || chain.method,
            bossId: chain.bossId || chainId,
            battleTemplateLinked: BossTemplateIdSet.has(chain.bossId || chainId),
            entries: chain.entries || [],
            infoSources: chain.infoSources || [],
            progressMethods: progress,
            revealMethods: chain.revealMethods || [],
            mapPuzzle: chain.mapPuzzle || null,
            shortcut: chain.shortcut || null,
            finalTrigger,
            discoveredClues,
            requiredClues,
            completedProgress,
            requiredProgress,
            finalReady: Boolean(finalReadyFlag?.ready || readyByProgress),
            validation: this.validateBossFlow(chainId)
        };
    }

    getStoryChainByBossId(bossId) {
        if (!bossId) return null;
        return Object.values(WorldStoryChains).find(chain => chain.bossId === bossId) || null;
    }

    getBossLairStatus(bossId) {
        const chain = this.getStoryChainByBossId(bossId);
        if (!chain) {
            return {
                bossId,
                hasStory: false,
                visible: false,
                finalReady: false,
                battleTemplateLinked: BossTemplateIdSet.has(bossId)
            };
        }

        const status = this.getBossFlowStatus(chain.id);
        return {
            bossId,
            chainId: chain.id,
            title: chain.title,
            hasStory: true,
            visible: Boolean(status?.finalReady && status?.battleTemplateLinked),
            finalReady: Boolean(status?.finalReady),
            battleTemplateLinked: Boolean(status?.battleTemplateLinked),
            requiredClues: status?.requiredClues || 0,
            discoveredClues: status?.discoveredClues?.length || 0,
            requiredProgress: status?.requiredProgress || 0,
            completedProgress: status?.completedProgress || 0
        };
    }

    isBossLairVisible(bossId) {
        return this.getBossLairStatus(bossId).visible;
    }

    getBossTestData() {
        return Object.keys(WorldStoryChains)
            .map(chainId => this.getBossFlowStatus(chainId))
            .filter(Boolean);
    }

    getNarrative(context = {}) {
        const zone = getZoneProfile(context.zoneId);
        const landmark = context.landmarkId ? getLandmark(context.landmarkId) : null;
        const effects = [
            ...(zone.effectIds || []),
            ...(landmark?.effectIds || [])
        ].map(getTerrainEffect).filter(Boolean);
        const stories = landmark?.storyChainIds?.length
            ? landmark.storyChainIds.map(chainId => this.getStorySummary(chainId)).filter(Boolean)
            : this.getActiveStorySummaries(2);

        return {
            title: landmark?.name || zone.name,
            subtitle: landmark ? landmark.mapHint : `${zone.dangerLabel}｜${zone.hint}`,
            description: landmark?.arrival || zone.summary,
            zone,
            landmark,
            effects,
            stories
        };
    }
}

export const worldStoryManager = new WorldStoryManager();
export default WorldStoryManager;
