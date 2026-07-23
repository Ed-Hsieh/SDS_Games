/**
 * Chapter 1 gameplay contract.
 *
 * StorySceneRegistry owns prose. This module owns the executable bridge between
 * investigation, combat, recovered materials, equipment preparation, and the
 * Forest Guardian route.
 */

export const ChapterOneProgressFlag = Object.freeze({
    MANTIS_RECOVERY_CLAIMED: 'story.ch1.mantis_recovery_claimed',
    HOME_RECOVERY_KNOWN: 'tutorial.adventure.homeRecoveryKnown',
    FIRST_REPORT_PENDING: 'story.ch1.first_report_pending',
    FIRST_REPORT_AUTO_START: 'story.ch1.first_report_auto_start',
    FIRST_REPORT_COMPLETE: 'story.ch1.first_report_complete',
    CLOSING_GATE_COMPLETE: 'story.ch1.closing.gate_complete',
    CLOSING_ARCHIVE_COMPLETE: 'story.ch1.closing.archive_complete',
    CLOSING_MIA_COMPLETE: 'story.ch1.closing.mia_complete',
    CLOSING_FORGE_COMPLETE: 'story.ch1.closing.forge_complete',
    CLOSING_CROSSROADS_COMPLETE: 'story.ch1.closing.crossroads_complete'
});

export const ChapterOneClosingReportStages = Object.freeze([
    Object.freeze({
        id: 'gate_return',
        flag: ChapterOneProgressFlag.CLOSING_GATE_COMPLETE,
        checkpointId: 'gate_return',
        placeId: 'gate',
        actorId: 'standard_bearer_frey',
        title: '先讓南門知道你回來了',
        text: '前往南門，讓芙蕾登記回程時間，也看看塔維重新點亮的回程燈。'
    }),
    Object.freeze({
        id: 'archive_report',
        flag: ChapterOneProgressFlag.CLOSING_ARCHIVE_COMPLETE,
        checkpointId: 'archive_report',
        placeId: 'handbook',
        actorId: 'town_scholar',
        title: '把守護者與源頭分開記錄',
        text: '前往檔案室，把森林守護者倒下後仍向北搏動的根脈交給伊萊與村長判讀。'
    }),
    Object.freeze({
        id: 'mia_check',
        flag: ChapterOneProgressFlag.CLOSING_MIA_COMPLETE,
        checkpointId: 'mia_check',
        placeId: 'mia_workroom',
        actorId: 'herbalist',
        title: '讓米婭完成回程檢查',
        text: '前往米婭的工作室，確認南路麻痺是否真的退去。'
    }),
    Object.freeze({
        id: 'forge_recovery',
        flag: ChapterOneProgressFlag.CLOSING_FORGE_COMPLETE,
        checkpointId: 'forge_recovery',
        placeId: 'forge',
        actorId: 'blacksmith',
        title: '去看重新升起的爐火',
        text: '前往鐵匠鋪。恢復的爐火正在處理城鎮第一批積欠的修繕。'
    }),
    Object.freeze({
        id: 'crossroads_hint',
        flag: ChapterOneProgressFlag.CLOSING_CROSSROADS_COMPLETE,
        checkpointId: 'crossroads_hint',
        placeId: 'crossroads',
        actorId: 'street_beggar',
        title: '回到路開始分岔的地方',
        text: '回到裂痕廣場。空箱與斷掉的運貨繩旁，乞丐似乎正看著與所有人不同的方向。'
    })
]);

export const ChapterOneRequirement = Object.freeze({
    QUALIFYING_GEAR_OWNED: 'chapter1.qualifying_gear_owned'
});

const investigation = config => Object.freeze({
    victoryFlag: `story.ch1.investigation.${config.id}.victory`,
    evidenceFlag: `story.ch1.investigation.${config.id}.evidence`,
    ...config,
    guaranteedRewards: Object.freeze(config.guaranteedRewards || [])
});

export const ChapterOneInvestigationOrder = Object.freeze([
    'south_gate_farmland',
    'hunter_boardwalk',
    'old_campfire_site'
]);

export const ChapterOneInvestigations = Object.freeze({
    south_gate_farmland: investigation({
        id: 'south_gate_farmland',
        previousId: null,
        monsterId: 'slime',
        routeHint: '前往南門入口東側的未知地標。',
        methodTitle: '泥裡有兩種方向',
        methodText: '史萊姆覆住了水溝邊的舊足跡。清開田埂後，看看人與野獸究竟往哪裡走。',
        guaranteedRewards: [
            { itemId: 'slime_jelly', quantity: 2, reason: '田埂回收' },
            { itemId: 'iron_ore', quantity: 1, reason: '廢農具拆料' }
        ]
    }),
    hunter_boardwalk: investigation({
        id: 'hunter_boardwalk',
        previousId: 'south_gate_farmland',
        monsterId: 'giant_rat',
        routeHint: '前往南門農田東北方的未知地標。',
        methodTitle: '銀線不再指向回程',
        methodText: '棧板下的動靜遮住了更細的聲音。先讓四周安靜，再沿回城方向查看被人碰過的銀線。',
        guaranteedRewards: [
            { itemId: 'slime_jelly', quantity: 1, reason: '舊獵具黏著物' }
        ]
    }),
    old_campfire_site: investigation({
        id: 'old_campfire_site',
        previousId: 'hunter_boardwalk',
        monsterId: 'wild_wolf',
        routeHint: '前往南門農田東南方的未知地標。',
        methodTitle: '熄滅的火留下了熱',
        methodText: '野狼守著營火坑，卻始終不肯踩近黑根。逼退牠後翻開冷灰，找出牠真正避開的東西。',
        guaranteedRewards: [
            { itemId: 'iron_ore', quantity: 1, reason: '營地殘件' }
        ]
    })
});

const rotrootTrial = config => Object.freeze({
    victoryFlag: `story.ch1.rotroot.${config.id}.victory`,
    ...config,
    guaranteedRewards: Object.freeze(config.guaranteedRewards || [])
});

export const ChapterOneRotrootTrials = Object.freeze([
    rotrootTrial({
        id: 'webbed_margin',
        monsterId: 'poison_spider',
        title: '腐根外緣：蛛網封口',
        text: '蛛網沿著黑根交錯，黏住的獸毛全朝林外。穿過這裡，才能繼續追上向北收縮的根脈。',
        guaranteedRewards: [{ itemId: 'spider_silk', quantity: 1, reason: '腐根外緣回收' }]
    }),
    rotrootTrial({
        id: 'stone_pressure',
        monsterId: 'stone_golem_mini',
        title: '腐根內緣：被抬起的石殼',
        text: '碎石被根脈從下方推成活動的外殼。打散它，才能看清地下壓力越過岩層的方向。',
        guaranteedRewards: [{ itemId: 'stone_fragment', quantity: 1, reason: '受壓石殼' }]
    })
]);

export const ChapterOneMantisRecovery = Object.freeze({
    id: 'ambush_mantis_recovery',
    victoryFlag: ChapterOneProgressFlag.MANTIS_RECOVERY_CLAIMED,
    guaranteedRewards: Object.freeze([
        { itemId: 'spider_silk', quantity: 2, reason: '伏道回收銀絲' }
    ])
});

export const ChapterOneSpecialGearIds = Object.freeze([
    'slime_sword',
    'wolf_fang_blade',
    'spider_silk_gloves'
]);

export function getChapterOneInvestigation(id) {
    return ChapterOneInvestigations[id] || null;
}

export function getChapterOneInvestigationState(id, readFlag) {
    const entry = getChapterOneInvestigation(id);
    if (!entry) return null;
    return Object.freeze({
        id,
        victory: Boolean(readFlag(entry.victoryFlag)),
        evidence: Boolean(readFlag(entry.evidenceFlag))
    });
}

export function areChapterOneInvestigationsComplete(readFlag) {
    return ChapterOneInvestigationOrder.every(id => (
        Boolean(readFlag(ChapterOneInvestigations[id].evidenceFlag))
    ));
}

export function getNextChapterOneRotrootTrial(readFlag) {
    return ChapterOneRotrootTrials.find(entry => !readFlag(entry.victoryFlag)) || null;
}

export function getChapterOneGearQualification(item = {}) {
    if (!item?.id) return null;
    if (item.seriesId === 'slime_series' || String(item.id).startsWith('crafted_slime_series_')) {
        return Object.freeze({ source: 'crafted_slime_series', itemId: item.id });
    }
    if (ChapterOneSpecialGearIds.includes(item.id)) {
        return Object.freeze({ source: 'special_drop', itemId: item.id });
    }
    return null;
}

export function getEquippedChapterOneGearQualification(character = {}) {
    for (const item of Object.values(character.equipment || {})) {
        const qualification = getChapterOneGearQualification(item);
        if (qualification) return qualification;
    }
    return null;
}

export function readChapterOneObjectiveContext(readFlag) {
    return Object.freeze({
        chapterOneInvestigations: Object.fromEntries(
            ChapterOneInvestigationOrder.map(id => [id, getChapterOneInvestigationState(id, readFlag)])
        ),
        chapterOneRotrootTrialId: getNextChapterOneRotrootTrial(readFlag)?.id || null,
        chapterOneHomeRecoveryKnown: Boolean(readFlag(ChapterOneProgressFlag.HOME_RECOVERY_KNOWN)),
        chapterOneFirstReportPending: Boolean(readFlag(ChapterOneProgressFlag.FIRST_REPORT_PENDING)),
        chapterOneFirstReportAutoStart: Boolean(readFlag(ChapterOneProgressFlag.FIRST_REPORT_AUTO_START)),
        chapterOneFirstReportComplete: Boolean(readFlag(ChapterOneProgressFlag.FIRST_REPORT_COMPLETE)),
        chapterOneClosingReportStage: ChapterOneClosingReportStages.find(stage => !readFlag(stage.flag)) || null
    });
}
