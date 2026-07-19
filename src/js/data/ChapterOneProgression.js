/**
 * Chapter 1 gameplay contract.
 *
 * StorySceneRegistry owns prose. This module owns the executable bridge between
 * investigation, combat, recovered materials, equipment preparation, and the
 * Forest Guardian route.
 */

export const ChapterOneProgressFlag = Object.freeze({
    GEAR_READY: 'story.ch1.gear_ready',
    GEAR_READY_SOURCE: 'story.ch1.gear_ready_source',
    CORE_MATERIALS_SECURED: 'story.ch1.core_craft_materials_secured',
    MANTIS_RECOVERY_CLAIMED: 'story.ch1.mantis_recovery_claimed',
    ROTROOT_COMPLETE: 'story.ch1.rotroot_trials_complete',
    ROTROOT_ELITE_CLEARED: 'story.ch1.rotroot_elite_cleared',
    ROTROOT_SALVAGE_CLAIMED: 'story.ch1.rotroot_salvage_claimed',
    HOME_RECOVERY_KNOWN: 'tutorial.adventure.homeRecoveryKnown',
    FIRST_REPORT_PENDING: 'story.ch1.first_report_pending',
    FIRST_REPORT_COMPLETE: 'story.ch1.first_report_complete'
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
            { itemId: 'iron_shard', quantity: 1, reason: '廢農具拆料' }
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
            { itemId: 'iron_shard', quantity: 1, reason: '營地殘件' }
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

export const ChapterOneOptionalRoutes = Object.freeze({
    rotroot_salvage: Object.freeze({
        id: 'rotroot_salvage',
        claimFlag: ChapterOneProgressFlag.ROTROOT_SALVAGE_CLAIMED,
        title: '被根脈抬起的舊補給袋',
        text: '腐根把一只舊補給袋頂出土面。凝膠封住了袋口，裡面的粗鐵仍能回爐。這些材料不足以再免費做完一整套裝備，但能縮短下一次狩獵。',
        guaranteedRewards: Object.freeze([
            { itemId: 'slime_jelly', quantity: 2, reason: '腐根岔路回收' },
            { itemId: 'iron_shard', quantity: 1, reason: '腐根岔路回收' }
        ])
    }),
    rootwatch_grove: Object.freeze({
        id: 'rootwatch_grove',
        monsterId: 'treant',
        clearFlag: ChapterOneProgressFlag.ROTROOT_ELITE_CLEARED,
        title: '根哨樹人',
        text: '一隻樹人停在偏離主路的根脈上，反覆把鬆土壓回原位。可以繞開，也可以靠近確認牠究竟在守護什麼。'
    })
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
        chapterOneGearReady: Boolean(readFlag(ChapterOneProgressFlag.GEAR_READY)),
        chapterOneRotrootTrialId: getNextChapterOneRotrootTrial(readFlag)?.id || null,
        chapterOneHomeRecoveryKnown: Boolean(readFlag(ChapterOneProgressFlag.HOME_RECOVERY_KNOWN)),
        chapterOneFirstReportPending: Boolean(readFlag(ChapterOneProgressFlag.FIRST_REPORT_PENDING)),
        chapterOneFirstReportComplete: Boolean(readFlag(ChapterOneProgressFlag.FIRST_REPORT_COMPLETE))
    });
}
