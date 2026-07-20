export const GuildTutorialFlag = Object.freeze({
    COMPLETE: 'story.prologue.guildTutorialComplete',
    MOVED: 'story.prologue.guildMoved',
    SPOKEN: 'story.prologue.guildSpoken',
    COMMISSION_ACCEPTED: 'story.prologue.guildCommissionAccepted',
    CLUE_READ: 'story.prologue.guildClueRead',
    MAIN_EQUIPPED: 'story.prologue.guildMainEquipped',
    OFFHAND_EQUIPPED: 'story.prologue.guildOffhandEquipped',
    ARMOR_CONFLICT_SEEN: 'story.prologue.guildArmorConflictSeen'
});

export const GuildTutorialItems = Object.freeze({
    main: Object.freeze({
        id: 'guild_training_blade',
        name: '公會訓練劍',
        icon: '⚔',
        type: 'weapon',
        weaponForm: 'sword',
        rarity: 'common',
        requiredLevel: 1,
        attack: 4,
        stats: Object.freeze({ attack: 4, attackSpeed: 1 }),
        durability: 30,
        maxDurability: 30,
        description: '只在工會教學使用的鈍刃訓練劍。'
    }),
    offhand: Object.freeze({
        id: 'guild_training_offhand',
        name: '公會訓練短刃',
        icon: '🗡',
        type: 'weapon',
        weaponForm: 'dagger',
        rarity: 'common',
        requiredLevel: 1,
        attack: 2,
        stats: Object.freeze({ attack: 2, attackSpeed: 1.2 }),
        durability: 24,
        maxDurability: 24,
        description: '用來示範副手攻擊與護甲欄位衝突的訓練短刃。'
    }),
    armor: Object.freeze({
        id: 'guild_training_armor',
        name: '公會訓練護衣',
        icon: '🛡',
        type: 'armor',
        rarity: 'common',
        requiredLevel: 1,
        defense: 2,
        stats: Object.freeze({ defense: 2 }),
        durability: 36,
        maxDurability: 36,
        description: '用來示範防具會占用副手欄位的訓練護衣。'
    })
});

export function isGuildTutorialComplete(readFlag) {
    return Boolean(readFlag?.(GuildTutorialFlag.COMPLETE));
}

