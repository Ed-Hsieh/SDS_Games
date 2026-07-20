import { ItemRarity, ItemType, EquipmentType, AffixStat, WeaponForm } from '../models/Enums.js';

/**
 * Shared reward records used by active gameplay systems.
 * Quest definitions and mandatory story progression do not belong here.
 */
export const RewardItemDatabase = {
    // 主線獎勵
    starter_sword: {
        id: 'starter_sword',
        name: '行路者短劍',
        icon: '🗡️',
        type: EquipmentType.WEAPON,
        weaponForm: WeaponForm.SWORD,
        rarity: ItemRarity.UNCOMMON,
        level: 1,
        requiredLevel: 1,
        stats: {
            attack: 12,
            critChance: 0.08,
            critDamage: 1.5,
            weaponSpeed: 1.0,
            attackSpeed: 1.0
        },
        description: '每個英雄旅程的起點。',
    },
    legendary_weapon_box: {
        id: 'legendary_weapon_box',
        name: '傳說武器寶箱',
        icon: '👑',
        type: ItemType.KEY,
        rarity: ItemRarity.LEGENDARY,
        description: '開啟獲得隨機傳說武器！',
    },
    silver_thread_hook: {
        id: 'silver_thread_hook',
        name: '銀絲反鉤',
        icon: '🪝',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.RARE,
        stats: {
            attack: 4,
            critChance: 0.06
        },
        description: '用銀鐮伏獵者的陷絲反製成的鉤飾。它提醒你，讀懂陷阱的人也能把陷阱變成武器。',
        specialEffects: [
            { type: AffixStat.DODGE_CHANCE, value: 0.04 }
        ],
    },
    blood_moon_pendant: {
        id: 'blood_moon_pendant',
        name: '血月折角墜',
        icon: '🌙',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.EPIC,
        stats: {
            attack: 7,
            critChance: 0.07
        },
        description: '血月角鹿斷角磨成的墜飾。它不像戰利品，更像把失控痛覺繫在胸口的提醒。',
        specialEffects: [
            { type: AffixStat.LIFESTEAL, value: 0.02 }
        ],
    },
    mist_tablet_rubbing: {
        id: 'mist_tablet_rubbing',
        name: '霧碑拓片',
        icon: '🪨',
        type: ItemType.KEY,
        rarity: ItemRarity.RARE,
        description: '從霧碑丘陵拓下的石紋。它無法替你打贏戰鬥，卻能讓高威脅區的路線少一點盲走。',
        specialEffects: [
            { type: 'mapScout', value: 1 },
            { type: 'eventClueBonus', value: 0.08 }
        ],
    },
    thorn_trade_bead: {
        id: 'thorn_trade_bead',
        name: '荊棘交換珠',
        icon: '🌿',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.RARE,
        stats: {
            defense: 4
        },
        description: '女巫交易網裡流通的綠色珠子。握著它時，毒霧像認得你一樣退開半步。',
        specialEffects: [
            { type: 'poisonMitigation', value: 0.18 }
        ],
    },
    ash_ledger_page: {
        id: 'ash_ledger_page',
        name: '灰燼帳冊頁',
        icon: '📒',
        type: ItemType.KEY,
        rarity: ItemRarity.RARE,
        description: '灰燼男爵地宮裡撕下的帳頁。黑市商人討厭它，因為它知道太多價格的真相。',
        specialEffects: [
            { type: 'blackMarketPriceReduction', value: 0.08 },
            { type: 'casinoOddsReveal', value: true }
        ],
    },
    dragon_nest_resonance: {
        id: 'dragon_nest_resonance',
        name: '龍巢共鳴石',
        icon: '🐉',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.EPIC,
        stats: {
            attack: 5,
            defense: 5
        },
        description: '追上龍巢之路後留下的熱痕石。面對菁英與首領時，它會先替你穩住呼吸。',
        specialEffects: [
            { type: 'bossDamageReduction', value: 0.04 }
        ],
    },
    abyss_vanguard_oath: {
        id: 'abyss_vanguard_oath',
        name: '深淵先鋒印',
        icon: '😈',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.EPIC,
        stats: {
            attack: 6,
            defense: 10
        },
        description: '從深淵先鋒身上剝下的誓痕。它像一塊戰前警告，提醒你終局不是單純更大的怪物。',
        specialEffects: [
            { type: 'demonMitigation', value: 0.12 },
            { type: 'bossDamageReduction', value: 0.05 }
        ],
    },

    // 懸賞獎勵
    enhance_scroll: {
        id: 'enhance_scroll',
        name: '強化秘卷',
        icon: '📜',
        type: ItemType.SCROLL,
        rarity: ItemRarity.RARE,
        description: '使用後，下次強化必定成功！',
        specialEffects: [
            { type: 'guaranteeEnhance', value: true }
        ],
    },
    vip_card: {
        id: 'vip_card',
        name: '賭場 VIP 卡',
        icon: '💳',
        type: ItemType.KEY,
        rarity: ItemRarity.RARE,
        codexHidden: true,
        description: '在賭場享有特殊待遇。',
        specialEffects: [],
    },
    loaded_dice: {
        id: 'loaded_dice',
        name: '幸運骰子',
        icon: '🎲',
        type: ItemType.KEY,
        rarity: ItemRarity.EPIC,
        codexHidden: true,
        description: '「這骰子好像有點重...」骰子遊戲勝率 +5%。',
        specialEffects: [
            { type: 'diceBonus', value: 0.05 }
        ],
    },
    field_medic_notes: {
        id: 'field_medic_notes',
        name: '野戰醫術手記',
        icon: '📗',
        type: ItemType.BOOK,
        rarity: ItemRarity.RARE,
        passiveEffectId: 'field_medic',
        description: '藥師把採藥籃與毒霧症狀整理成手記。取得後可解鎖野戰醫術戰術。',
        specialEffects: [
            { type: 'healingReceived', value: 0.08 }
        ],
    },
    julian_margin_notes: {
        id: 'julian_margin_notes',
        name: '朱利安邊註',
        icon: '📖',
        type: ItemType.BOOK,
        rarity: ItemRarity.RARE,
        passiveEffectId: 'ruin_literacy',
        description: '朱利安在書頁邊緣留下的遺跡讀法。取得後可解鎖碑文識讀戰術。',
        specialEffects: [
            { type: 'trapDamageReduction', value: 0.1 }
        ],
    },
    last_soup_ladle: {
        id: 'last_soup_ladle',
        name: '最後一鍋湯杓',
        icon: '🥄',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.UNCOMMON,
        stats: {
            defense: 2
        },
        passiveEffectId: 'field_medic',
        description: '救濟廚房留下的湯杓。它很普通，但普通到足以提醒你治療不是奇蹟，而是有人願意多煮一鍋。',
        specialEffects: [
            { type: 'healingReceived', value: 0.1 }
        ],
    },
    retreat_rollcall: {
        id: 'retreat_rollcall',
        name: '撤退點名冊',
        icon: '📋',
        type: ItemType.BOOK,
        rarity: ItemRarity.RARE,
        passiveEffectId: 'boss_composure',
        description: '弗雷隊伍撤退時的點名冊。每一個名字都讓下一次面對強敵時更穩一點。',
        specialEffects: [
            { type: 'bossDamageReduction', value: 0.04 }
        ],
    },
    living_index: {
        id: 'living_index',
        name: '活索引',
        icon: '📚',
        type: ItemType.BOOK,
        rarity: ItemRarity.EPIC,
        passiveEffectId: 'boss_composure',
        description: '書記把最後索引裝訂回活人的順序裡。取得後可解鎖王敵定心戰術。',
        specialEffects: [
            { type: 'bossDamageReduction', value: 0.06 },
            { type: 'puzzleClueBonus', value: 1 }
        ],
    },
    phoenix_feather: {
        id: 'phoenix_feather',
        name: '不熄羽',
        icon: '🪶',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.LEGENDARY,
        codexHidden: true,
        description: '死亡時自動復活一次，生命恢復 30%。每場戰鬥只能觸發一次。',
        specialEffects: [
            { type: 'autoRevive', value: true },
            { type: 'reviveHp', value: 0.3 }
        ],
    },
    gamblers_fallacy: {
        id: 'gamblers_fallacy',
        name: '賭徒謬誤',
        icon: '🃏',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.EPIC,
        codexHidden: true,
        description: '「連輸這麼多次，下次一定會贏！」連敗後勝率大幅提升。',
        specialEffects: [
            { type: 'lossStreakBonus', value: true }
        ],
    },
    demon_contract: {
        id: 'demon_contract',
        name: '黑焰契卷',
        icon: '📋',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.LEGENDARY,
        codexHidden: true,
        stats: {
            attack: 15,
            defense: 15
        },
        description: '攻擊力、防禦力 +15。但每場戰鬥開始時損失 5% 生命。',
        specialEffects: [
            { type: 'battleHpCost', value: 0.05 }
        ],
    },
    lucky_charm_7: {
        id: 'lucky_charm_7',
        name: '七星護符',
        icon: '⭐',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.LEGENDARY,
        codexHidden: true,
        description: '幸運之神的眷顧。所有機率判定 +7%。',
        specialEffects: [
            { type: 'luckBonus', value: 0.07 }
        ],
    },
    transcend_stone: {
        id: 'transcend_stone',
        name: '超越之石',
        icon: '💠',
        type: ItemType.KEY,
        rarity: ItemRarity.LEGENDARY,
        description: '使用後，突破裝備的強化上限 (+10 → +15)。',
        specialEffects: [
            { type: 'transcendEnhance', value: true }
        ],
    },

    // ==================== 副本任務獎勵 ====================
    
    // 幽暗洞窟獎勵
    torch: {
        id: 'torch',
        name: '永恆火炬',
        icon: '🔥',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.UNCOMMON,
        description: '在黑暗副本中提供額外視野，降低被突襲機率。',
        specialEffects: [
            { type: 'darkVision', value: 0.3 }
        ],
    },
    bat_wing_cloak: {
        id: 'bat_wing_cloak',
        name: '蝙蝠翼披風',
        icon: '🦇',
        type: EquipmentType.EQUIPMENT,
        rarity: ItemRarity.RARE,
        stats: {
            defense: 8,
            critChance: 0.1
        },
        description: '由洞窟蝙蝠王的翅膀製成，在黑暗中更加敏捷。',
        specialEffects: [
            { type: AffixStat.DODGE_CHANCE, value: 0.05 },
            { type: 'darkBonus', value: 0.15 }
        ],
    },
    
    // 冰封雪峰獎勵
    compass: {
        id: 'compass',
        name: '迷途指南針',
        icon: '🧭',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.RARE,
        description: '在迷霧叢林中不會迷路，總是指向正確的方向。',
        specialEffects: [
            { type: 'mazeNavigate', value: true }
        ],
    },
    fire_resist_potion: {
        id: 'fire_resist_potion',
        name: '抗火藥劑',
        icon: '🧪',
        type: ItemType.POTION,
        rarity: ItemRarity.RARE,
        stackable: true,
        maxStack: 10,
        description: '使用後減少灼燒傷害 50%，持續整個副本。',
        specialEffects: [
            { type: 'fireResist', value: 0.5 }
        ],
    },
    demon_slayer: {
        id: 'demon_slayer',
        name: '斷焰刃',
        icon: '⚔️',
        type: EquipmentType.WEAPON,
        weaponForm: WeaponForm.SWORD,
        rarity: ItemRarity.LEGENDARY,
        level: 70,
        requiredLevel: 70,
        stats: {
            attack: 35,
            critChance: 0.2,
            critDamage: 2.5,
            weaponSpeed: 1.2,
            attackSpeed: 1.1
        },
        description: '傳說中能夠斬殺惡魔的神劍。對惡魔類敵人傷害 +50%。',
        specialEffects: [
            { type: 'demonSlayer', value: 0.5 },
            { type: 'burnImmune', value: true }
        ],
    },
    
    // 每週挑戰獎勵
};
