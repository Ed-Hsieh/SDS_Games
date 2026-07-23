export const GuildTutorialFlag = Object.freeze({
    COMPLETE: 'story.prologue.guildTutorialComplete',
    EVENT_MARK_SEEN: 'story.prologue.guildEventMarkSeen',
    SPOKEN: 'story.prologue.guildSpoken',
    COMMISSION_BOARD_READ: 'story.prologue.guildCommissionBoardRead',
    MAIN_EQUIPPED: 'story.prologue.guildMainEquipped',
    OFFHAND_EQUIPPED: 'story.prologue.guildOffhandEquipped',
    ARMOR_CONFLICT_SEEN: 'story.prologue.guildArmorConflictSeen',
    BATTLE_OFFHAND_READY: 'story.prologue.guildBattleOffhandReady',
    FIRST_LOOT_DECISION_COMPLETE: 'tutorial.firstLootDecisionComplete',
    FIRST_QUEST_REPORT_GUIDANCE_SEEN: 'tutorial.firstQuestReportGuidanceSeen'
});

export const GuildTutorialSupply = Object.freeze({
    weaponRecipeIds: Object.freeze([
        'slime_series_sword',
        'slime_series_dagger',
        'slime_series_hammer',
        'slime_series_spear',
        'slime_series_staff'
    ]),
    armorRecipeId: 'leather_armor',
    claimFlagPrefix: 'story.prologue.guildSupplyClaimed.'
});

export function getGuildTutorialSupplyClaimFlag(itemId) {
    return `${GuildTutorialSupply.claimFlagPrefix}${itemId}`;
}

export function isGuildTutorialComplete(readFlag) {
    return Boolean(readFlag?.(GuildTutorialFlag.COMPLETE));
}
