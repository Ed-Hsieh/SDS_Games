import { ChapterRegionOrder, ChapterRegionRegistry } from '../src/js/data/ChapterRegionRegistry.js';
import { CharacterProfileDatabase } from '../src/js/data/CharacterProfiles.js';
import { OptionalSideStoryRegistry, OptionalSideStoryStatus } from '../src/js/data/OptionalSideStoryRegistry.js';
import { QuestDatabase } from '../src/js/data/Quests.js';
import { getQuestStory } from '../src/js/data/QuestStories.js';
import { MainlineCharacterContracts } from '../src/js/data/StoryActors.js';
import { StorySceneOrder, StorySceneRegistry } from '../src/js/data/StorySceneRegistry.js';
import { TownNPCDatabase } from '../src/js/data/NPCDialogues.js';
import { TownPlaceDatabase } from '../src/js/data/TownPlaces.js';

const issues = [];
const warnings = [];
const summary = {};
const addIssue = (message, details = {}) => issues.push({ message, ...details });
const addWarning = (message, details = {}) => warnings.push({ message, ...details });
const hasText = value => typeof value === 'string' && value.trim().length > 0;

function auditMainlineExperience() {
    const expectedChapterScenes = { 1: 11, 2: 8, 3: 9, 4: 9, 5: 11, 6: 9, 7: 9 };
    const stageCounts = {};

    if (StorySceneOrder.length !== 66) {
        addIssue('主劇本場景數不是鎖定的 66 場', { actual: StorySceneOrder.length });
    }
    for (const [chapterText, expected] of Object.entries(expectedChapterScenes)) {
        const chapter = Number(chapterText);
        const actual = StorySceneOrder.filter(sceneId => StorySceneRegistry[sceneId]?.chapter === chapter).length;
        if (actual !== expected) addIssue('章節場景數與主劇本不一致', { chapter, expected, actual });
    }

    for (const sceneId of StorySceneOrder) {
        const scene = StorySceneRegistry[sceneId];
        if (!scene) {
            addIssue('場景順序指向不存在的場景', { sceneId });
            continue;
        }
        stageCounts[scene.stageClass] = (stageCounts[scene.stageClass] || 0) + 1;
        for (const field of ['background', 'worldState', 'viewpoint', 'objective']) {
            if (!hasText(scene[field])) addIssue('主劇本場景缺少必要展示資訊', { sceneId, field });
        }
        if (!Array.isArray(scene.beats) || scene.beats.length === 0) {
            addIssue('主劇本場景沒有可播放的節拍', { sceneId });
        }
    }

    const main = QuestDatabase.main || [];
    if (main.length !== 7) addIssue('主線任務不是每章一筆', { actual: main.length });
    for (let chapter = 1; chapter <= 7; chapter += 1) {
        const quests = main.filter(quest => quest.chapter === chapter);
        if (quests.length !== 1) continue;
        const quest = quests[0];
        const story = getQuestStory(quest, { status: 'active' });
        if (!quest.autoProgress) addIssue('主線任務仍需手動接取或回報', { questId: quest.id });
        if (!quest.objectives?.[0]?.completionFlag?.startsWith('story.scene.')) {
            addIssue('主線任務沒有由場景旗標推進', { questId: quest.id });
        }
        if (Object.keys(quest.rewards || {}).length > 0) {
            addIssue('地圖功能未定案前主線已配置獎勵', { questId: quest.id });
        }
        for (const field of ['available', 'active', 'completed', 'finished', 'location']) {
            if (!hasText(story?.[field])) addIssue('章節任務缺少玩家可讀摘要', { questId: quest.id, field });
        }
    }

    summary.mainline = {
        scenes: StorySceneOrder.length,
        stageCounts,
        chapterQuests: main.length
    };
}

function auditCharacterWeight() {
    for (const [actorId, contract] of Object.entries(MainlineCharacterContracts)) {
        const profile = CharacterProfileDatabase[actorId];
        const npc = TownNPCDatabase[actorId];
        if (!profile) addIssue('長線角色缺少執行層設定', { actorId });
        if (!npc) addIssue('城鎮長線角色缺少互動入口', { actorId });
        if (!profile) continue;

        const requiredProfileFields = ['past', 'arc', 'contradiction', 'external', 'core', 'voice'];
        for (const field of requiredProfileFields) {
            if (!profile[field]) addIssue('角色無法在主線中完整成立', { actorId, field });
        }
        for (const field of ['fear', 'desire', 'values']) {
            if (!hasText(profile.innerWorld?.[field])) addIssue('角色內在世界不完整', { actorId, field });
        }

        const actorScenes = StorySceneOrder.filter(sceneId =>
            StorySceneRegistry[sceneId]?.beats?.some(beat => beat.actorId === actorId)
        );
        const chapters = new Set(actorScenes.map(sceneId => StorySceneRegistry[sceneId].chapter));
        if (chapters.size < 4) addIssue('核心角色沒有形成跨章長線', { actorId, chapters: [...chapters] });

        for (const [runCondition, sceneId] of Object.entries(contract.endpointSceneIds || {})) {
            const hasEndpointBeat = StorySceneRegistry[sceneId]?.beats?.some(beat =>
                beat.actorId === actorId && ['any', runCondition].includes(beat.condition)
            );
            if (!hasEndpointBeat) addIssue('角色缺少當輪可見的終點演出', { actorId, runCondition, sceneId });
        }
    }

    summary.characters = {
        coreContracts: Object.keys(MainlineCharacterContracts).length,
        activeProfiles: Object.keys(CharacterProfileDatabase).length
    };
}

function auditMapFoundation() {
    if (ChapterRegionOrder.length !== 7) addIssue('手工章節地圖不是七張', { actual: ChapterRegionOrder.length });
    const mapSceneIds = StorySceneOrder.filter(sceneId =>
        ['regional_canvas', 'location_scene'].includes(StorySceneRegistry[sceneId]?.stageClass)
    );
    const boundSceneIds = [];

    for (const regionId of ChapterRegionOrder) {
        const region = ChapterRegionRegistry[regionId];
        if (!region) {
            addIssue('章節地圖順序指向不存在的區域', { regionId });
            continue;
        }
        if (!region.entryNodes?.length || !region.exitNodes?.length) addIssue('地圖缺少固定出入口', { regionId });
        if (!region.routeSegments?.some(segment => segment.optional)) addIssue('地圖缺少可選探索路線', { regionId });
        if (!region.bossConvergence?.locationId) addIssue('地圖缺少固定 Boss 收束點', { regionId });
        if (region.fogMask?.undiscoveredMarker !== 'black_question_square') {
            addIssue('未探索地點不再使用黑色問號方塊', { regionId });
        }
        boundSceneIds.push(...(region.sceneBindings || []).map(binding => binding.sceneId));
    }

    for (const sceneId of mapSceneIds) {
        const count = boundSceneIds.filter(id => id === sceneId).length;
        if (count !== 1) addIssue('地圖場景沒有唯一固定觸發點', { sceneId, count });
    }

    summary.map = {
        regions: ChapterRegionOrder.length,
        boundMapScenes: boundSceneIds.length
    };
}

function auditSideStoryGate() {
    const activeOptional = [...(QuestDatabase.commission || []), ...(QuestDatabase.hidden || [])];
    if (activeOptional.length > 0) {
        addIssue('支線在地圖擁有者定案前已進入執行層', { questIds: activeOptional.map(quest => quest.id) });
    }
    for (const story of OptionalSideStoryRegistry) {
        if (story.status !== OptionalSideStoryStatus.DEFERRED) addIssue('支線過早啟用', { sideStoryId: story.id });
        if (story.rewardBinding !== null) addIssue('支線過早綁定獎勵', { sideStoryId: story.id });
        if (!hasText(story.mainlineBoundary)) addIssue('支線沒有跳過安全邊界', { sideStoryId: story.id });
    }
    if (OptionalSideStoryRegistry.length < 7) {
        addWarning('核心角色的支線深化預留偏少', { count: OptionalSideStoryRegistry.length });
    }

    summary.sideStories = {
        deferredConcepts: OptionalSideStoryRegistry.length,
        activeOptionalQuests: activeOptional.length,
        rewardBindings: OptionalSideStoryRegistry.filter(story => story.rewardBinding !== null).length
    };
}

function auditTownFoundation() {
    const ids = new Set();
    for (const place of TownPlaceDatabase) {
        if (ids.has(place.id)) addIssue('城鎮地點 ID 重複', { placeId: place.id });
        ids.add(place.id);
        if (!place.when) addIssue('城鎮地點沒有劇情狀態條件', { placeId: place.id });
    }
    for (const removedId of ['tower', 'apothecary', 'supply_depot']) {
        if (ids.has(removedId)) addIssue('過時城鎮核心仍在活躍地點中', { placeId: removedId });
    }
    summary.town = { places: TownPlaceDatabase.length };
}

auditMainlineExperience();
auditCharacterWeight();
auditMapFoundation();
auditSideStoryGate();
auditTownFoundation();

const result = { ok: issues.length === 0, issues, warnings, summary };
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);
