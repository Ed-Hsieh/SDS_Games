/**
 * Optional quest runtime contracts.
 *
 * Mandatory chapter progression is owned by StorySceneRegistry and
 * StorySceneManager. It must not be copied into this database. Optional stories
 * enter this database only after dialogue, owner, interactions, rewards, and
 * runtime flags are approved and implemented.
 */

export const QuestType = Object.freeze({
    BOUNTY: 'bounty',
    COMMISSION: 'commission',
    HIDDEN: 'hidden'
});

export const QuestStatus = Object.freeze({
    LOCKED: 'locked',
    AVAILABLE: 'available',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    FINISHED: 'finished'
});

export const QuestCompletionMode = Object.freeze({
    REPORT: 'report',
    AUTO_ARCHIVE: 'auto_archive'
});

export const GuildTutorialCommissionId = 'guild_lost_town_investigation';

export const ObjectiveType = Object.freeze({
    KILL: 'kill',
    COLLECT: 'collect',
    GOLD: 'gold',
    CRAFT: 'craft',
    ENHANCE: 'enhance',
    GAMBLE_WIN: 'gamble_win',
    GAMBLE_PROFIT: 'gamble_profit',
    EXPLORE: 'explore',
    EVENT: 'event',
    TALK: 'talk',
    DUNGEON_CLEAR: 'dungeon_clear',
    DUNGEON_BOSS: 'dungeon_boss',
    DUNGEON_FLOOR: 'dungeon_floor',
    CUSTOM: 'custom'
});

const sceneFlag = sceneId => `story.scene.${sceneId}.complete`;

const GuildTutorialCommission = Object.freeze([
    commission({
        id: GuildTutorialCommissionId,
        name: '南境失聯調查',
        icon: '函',
        npc: 'guild_clerk',
        requiredLevel: 1,
        trigger: Object.freeze({ afterFlag: 'story.prologue.guildSpoken' }),
        completionMode: QuestCompletionMode.AUTO_ARCHIVE,
        description: '南境一座偏遠小鎮已一個月沒有送回稅簿，前後兩名信使也沒有回來。沿南路確認商路；若能抵達小鎮，先查明當地是否仍有人活動。',
        objectives: [{ type: ObjectiveType.EVENT, target: 'prologue_investigation_report', count: 1, description: '抵達南境失聯小鎮，確認當地狀況' }]
    })
]);

function commission(data) {
    return Object.freeze({
        type: QuestType.COMMISSION,
        repeatable: false,
        completionMode: QuestCompletionMode.REPORT,
        rewards: Object.freeze({ gold: 0, exp: 0, items: Object.freeze([]), materials: Object.freeze([]) }),
        objectives: Object.freeze([]),
        completionFlags: Object.freeze([]),
        ...data,
        objectives: Object.freeze((data.objectives || []).map(objective => Object.freeze(objective))),
        rewards: Object.freeze({
            gold: 0,
            exp: 0,
            ...(data.rewards || {}),
            items: Object.freeze(data.rewards?.items || []),
            materials: Object.freeze((data.rewards?.materials || []).map(entry => Object.freeze(entry)))
        }),
        completionFlags: Object.freeze(data.completionFlags || [])
    });
}

const ChapterOneCommissions = Object.freeze([
    commission({
        id: 'map_corners_never_lie',
        name: '地圖總是不平',
        icon: '圖',
        npc: 'village_elder',
        requiredLevel: 1,
        trigger: Object.freeze({ afterFlag: sceneFlag('ch1_s04_elder_to_scholar') }),
        description: '村長不肯用釘子壓住受潮地圖。先請伊萊辨認捲角下那段被遮住的回程記號。',
        objectives: [{ type: ObjectiveType.TALK, target: 'town_scholar:map_corners', count: 1, description: '請伊萊辨認捲角下的舊記號' }],
        rewards: { items: ['health_potion_s'] }
    }),
    commission({
        id: 'one_blank_too_many',
        name: '空格不是答案',
        icon: '錄',
        npc: 'town_scholar',
        requiredLevel: 1,
        trigger: Object.freeze({ afterFlag: sceneFlag('ch1_s04_elder_to_scholar') }),
        description: '伊萊手上有三份看似互相矛盾的回報。村長知道其中一份報告者實際走到哪裡。',
        objectives: [{ type: ObjectiveType.TALK, target: 'village_elder:blank_reports', count: 1, description: '向村長確認回報者實際走過的範圍' }],
        completionFlags: ['handbook.uncertainty_filter.unlocked']
    }),
    commission({
        id: 'patrol_soles',
        name: '巡線靴底',
        icon: '靴',
        npc: 'standard_bearer_frey',
        requiredLevel: 1,
        trigger: Object.freeze({ afterFlag: sceneFlag('ch1_s05_south_gate_introduction') }),
        description: '從返程者的視線重新確認兩段巡線，找出應該補回方向牌的位置。',
        objectives: [
            { type: ObjectiveType.EXPLORE, target: 'south_gate_farmland', count: 1, description: '從回城方向查看南門農田的路標' },
            { type: ObjectiveType.EXPLORE, target: 'hunter_boardwalk', count: 1, description: '從回城方向查看獵人棧道的路標' }
        ],
        rewards: { items: ['torch'] }
    }),
    commission({
        id: 'lamp_glass_for_every_door',
        name: '每扇門都嫌燈歪',
        icon: '燈',
        npc: 'lamplighter_tavi',
        requiredLevel: 1,
        trigger: Object.freeze({ afterFlag: sceneFlag('ch1_s05_south_gate_introduction') }),
        description: '塔維把自己的備用燈罩扣分給居民，現在連巡線燈也缺了固定件。',
        objectives: [{ type: ObjectiveType.EVENT, target: 'tavi_lamp_clasps', count: 1, description: '在南門整理三組被錯放的燈罩扣' }],
        rewards: { items: ['torch'] }
    }),
    commission({
        id: 'pot_lid_is_not_a_shield',
        name: '鍋蓋不是盾',
        icon: '鍛',
        npc: 'blacksmith',
        requiredLevel: 1,
        trigger: Object.freeze({ afterFlag: sceneFlag('ch1_s08_cold_forge_smoke') }),
        description: '一只替共用水桶擋過落石的鍋蓋回到爐邊。先辨認受力方向，才能把它修回鍋蓋。',
        objectives: [{ type: ObjectiveType.EVENT, target: 'blacksmith_pot_lid', count: 1, description: '在爐邊依受力順序整理鍋蓋' }],
        completionFlags: ['forge.one_free_repair.available']
    }),
    commission({
        id: 'vein_beneath_the_roots',
        name: '根下的斷脈',
        icon: '窟',
        npc: 'town_scholar',
        requiredLevel: 1,
        trigger: Object.freeze({ afterFlag: sceneFlag('ch1_s09_rotroot_approach') }),
        description: '腐根下方傳回空洞回聲。那不是森林守護者的根室，而是一條被地脈震裂的舊礦道。',
        objectives: [{ type: ObjectiveType.DUNGEON_CLEAR, target: 'cave', count: 1, description: '進入腐根側路的幽暗洞窟並完成探索' }],
        completionFlags: ['story.ch1.dungeon.cave.reported']
    })
]);

export const QuestDatabase = Object.freeze({
    bounty: Object.freeze([]),
    commission: Object.freeze([...GuildTutorialCommission, ...ChapterOneCommissions]),
    hidden: Object.freeze([])
});

export function getQuestById(questId) {
    if (!questId) return null;
    for (const category of Object.values(QuestDatabase)) {
        const quest = category.find(entry => entry.id === questId);
        if (quest) return quest;
    }
    return null;
}
