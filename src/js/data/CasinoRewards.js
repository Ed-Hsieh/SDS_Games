import { AffixStat, EquipmentType, ItemRarity, ItemType } from '../models/Enums.js';
import { MaterialDatabase } from './Materials.js';
import { QuestRewardItems } from './Quests.js';
import { ShopData, SecretShopItems } from './Items.js';

export const CasinoRewardRarityText = {
    common: '普通',
    uncommon: '進階',
    rare: '稀有',
    epic: '超稀有',
    legendary: '大獎'
};

export const CasinoRewardTierOrder = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5
};

export const CasinoSpecialItems = {
    casino_chip_bundle: {
        id: 'casino_chip_bundle',
        name: '沉甸甸的籌碼袋',
        icon: '🪙',
        type: ItemType.CURRENCY,
        rarity: ItemRarity.UNCOMMON,
        price: 0,
        description: '裝著一把賭場籌碼的布袋。真正有價值的是袋口那股讓人想再押一次的重量。'
    },
    black_market_ticket: {
        id: 'black_market_ticket',
        name: '黑市籤',
        icon: '🎟️',
        type: ItemType.KEY,
        rarity: ItemRarity.RARE,
        price: 0,
        description: '用舊羊皮紙裁成的籤，背面有一行幾乎看不清的暗號。'
    },
    casino_prize_case: {
        id: 'casino_prize_case',
        name: '封蠟奇物匣',
        icon: '🎁',
        type: ItemType.KEY,
        rarity: ItemRarity.EPIC,
        price: 0,
        description: '匣蓋被暗紅封蠟鎖住，搖晃時會發出像骨骰碰撞的細響。'
    },
    blood_chip: {
        id: 'blood_chip',
        name: '血色籌碼',
        icon: '🔴',
        type: ItemType.KEY,
        rarity: ItemRarity.EPIC,
        price: 0,
        description: '紅得不太像染料的籌碼。帳房說最好不要問它是怎麼染上去的。'
    },
    relief_voucher: {
        id: 'relief_voucher',
        name: '避難補給券',
        icon: '🎫',
        type: ItemType.KEY,
        rarity: ItemRarity.RARE,
        price: 0,
        description: '賭場把一部分黑錢換成乾糧與藥品後留下的憑證。這可能是城裡最荒唐的善行。'
    },
    recipe_fragment: {
        id: 'recipe_fragment',
        name: '圖紙碎片',
        icon: '📜',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.UNCOMMON,
        price: 0,
        description: '從奇物櫃底層翻出的半張圖紙，邊角有酒漬和指印。'
    },
    forbidden_blueprint_fragment: {
        id: 'forbidden_blueprint_fragment',
        name: '禁售圖紙殘頁',
        icon: '📕',
        type: ItemType.MATERIAL,
        rarity: ItemRarity.EPIC,
        price: 0,
        description: '被撕掉署名的圖紙殘頁，黑市商人只承認它「曾經非常合法」。'
    }
};

const SHOP_ITEM_INDEX = Object.values(ShopData)
    .flatMap(shop => shop.items || [])
    .concat(SecretShopItems || [])
    .reduce((index, item) => {
        index[item.id] = item;
        return index;
    }, {});

export function resolveCasinoRewardItem(itemId) {
    return CasinoSpecialItems[itemId]
        || MaterialDatabase[itemId]
        || QuestRewardItems[itemId]
        || SHOP_ITEM_INDEX[itemId]
        || null;
}

export const CasinoShowcaseItems = [
    {
        id: 'phoenix_feather_case',
        itemId: 'phoenix_feather',
        rarity: ItemRarity.LEGENDARY,
        cabinetTitle: '不死鳥羽封櫃',
        displayTag: '死亡保險',
        hookFlag: 'town.casino.showcase.phoenix_feather_case.seen',
        ownerLine: '玻璃內側沒有灰塵，像每天都有人擦拭。旁邊的小牌寫著：能買命的人，通常也買不起第二次。',
        routeBeat: '未來賭場老闆長支線可用它談「賭命」與「贖回」：玩家最後可在展示櫃獎勵中選它作為復活型大獎。',
        finalChoiceEligible: true
    },
    {
        id: 'demon_slayer_case',
        itemId: 'demon_slayer',
        rarity: ItemRarity.LEGENDARY,
        cabinetTitle: '弒魔者陳列台',
        displayTag: '終局武器',
        hookFlag: 'town.casino.showcase.demon_slayer_case.seen',
        ownerLine: '劍刃被鎖在三層黑鐵架上，架底刻著一排很小的名字。這不像拍賣品，更像戰利品清單。',
        routeBeat: '適合接到惡魔莊家、暗桌契約與深淵壓力，作為戰鬥取向玩家的最終展示櫃選項。',
        finalChoiceEligible: true
    },
    {
        id: 'transcend_stone_case',
        itemId: 'transcend_stone',
        rarity: ItemRarity.LEGENDARY,
        cabinetTitle: '超越之石保險箱',
        displayTag: '強化上限',
        hookFlag: 'town.casino.showcase.transcend_stone_case.seen',
        ownerLine: '石頭周圍的金屬框架有反覆修補痕跡，像它曾經把許多規則撐裂。',
        routeBeat: '適合給喜歡打造與養成的玩家，最後選取後可接裝備強化上限或戰鬥系統改版。',
        finalChoiceEligible: true
    },
    {
        id: 'legendary_weapon_box_case',
        itemId: 'legendary_weapon_box',
        rarity: ItemRarity.LEGENDARY,
        cabinetTitle: '封王武器匣',
        displayTag: '隨機傳說',
        hookFlag: 'town.casino.showcase.legendary_weapon_box_case.seen',
        ownerLine: '匣蓋上的封蠟被重新封過很多次。賭場老闆似乎更喜歡讓人想像裡面是什麼，而不是打開它。',
        routeBeat: '保留抽獎感的展示櫃終局選項，可把賭場的隨機誘惑收束到一次高張力選擇。',
        finalChoiceEligible: true
    },
    {
        id: 'lucky_charm_case',
        itemId: 'lucky_charm_7',
        rarity: ItemRarity.LEGENDARY,
        cabinetTitle: '七星護符吊櫃',
        displayTag: '機率加護',
        hookFlag: 'town.casino.showcase.lucky_charm_case.seen',
        ownerLine: '護符懸在紅線中央，沒有風卻微微晃動。牌子上只寫了一句：相信運氣的人最好也相信代價。',
        routeBeat: '適合把賭場老闆長支線收束成機率、代價與玩家慾望的主題獎勵。',
        finalChoiceEligible: true
    }
];

export function getCasinoShowcaseItems() {
    return CasinoShowcaseItems.map(entry => {
        const item = resolveCasinoRewardItem(entry.itemId);
        return {
            ...entry,
            item,
            name: item?.name || entry.itemId,
            icon: item?.icon || '◆',
            description: item?.description || ''
        };
    });
}

export const CasinoPrizePools = {
    daily_curios: {
        id: 'daily_curios',
        name: '日常奇物櫃',
        subtitle: '小賭客也碰得到的桌邊雜貨',
        minChapter: 1,
        cost: 12,
        description: '消耗獎券抽取補給、基礎素材、戰術手記與少量功能物。每抽都是獨立隨機，沒有保底。',
        atmosphere: '骨骰在木桌上跳了兩下，帳房沒有抬頭，只用指尖把籌碼推回光裡。',
        rewards: [
            { id: 'daily_copper_luck_ring', kind: 'item', itemId: 'casino_copper_luck_ring', rarity: ItemRarity.COMMON, quantity: 1, weight: 22 },
            { id: 'daily_green_felt_gloves', kind: 'item', itemId: 'casino_green_felt_gloves', rarity: ItemRarity.COMMON, quantity: 1, weight: 18 },
            { id: 'daily_house_runner_boots', kind: 'item', itemId: 'casino_house_runner_boots', rarity: ItemRarity.COMMON, quantity: 1, weight: 12 },
            { id: 'daily_chips', kind: 'chips', rarity: ItemRarity.COMMON, name: '籌碼回流', icon: '🪙', amount: [40, 90], weight: 8 },
            { id: 'daily_red_chip_bracer', kind: 'item', itemId: 'casino_red_chip_bracer', rarity: ItemRarity.UNCOMMON, quantity: 1, weight: 14 },
            { id: 'daily_weighted_dice_belt', kind: 'item', itemId: 'casino_weighted_dice_belt', rarity: ItemRarity.UNCOMMON, quantity: 1, weight: 8 },
            { id: 'daily_fragment', kind: 'item', itemId: 'recipe_fragment', rarity: ItemRarity.UNCOMMON, quantity: [1, 2], weight: 3 },
            { id: 'daily_loaded_dice_charm', kind: 'item', itemId: 'casino_loaded_dice_charm', rarity: ItemRarity.RARE, quantity: 1, weight: 6 },
            { id: 'daily_marlo_balance_chain', kind: 'item', itemId: 'casino_marlo_balance_chain', rarity: ItemRarity.RARE, quantity: 1, weight: 3 },
            { id: 'daily_field_medic', kind: 'item', itemId: 'field_medic_notes', rarity: ItemRarity.RARE, quantity: 1, weight: 1 },
            { id: 'daily_black_lamp_coat', kind: 'item', itemId: 'casino_black_lamp_coat', rarity: ItemRarity.EPIC, quantity: 1, weight: 3 },
            { id: 'daily_prize_case', kind: 'item', itemId: 'casino_prize_case', rarity: ItemRarity.EPIC, quantity: 1, weight: 1 },
            { id: 'daily_seventh_bell_crown', kind: 'item', itemId: 'casino_seventh_bell_crown', rarity: ItemRarity.LEGENDARY, quantity: 1, weight: 1 }
        ]
    },
    black_market_curios: {
        id: 'black_market_curios',
        name: '黑市奇物櫃',
        subtitle: '勝率表背後的暗格',
        minChapter: 2,
        unlockFlag: 'town.casino.false_odds_exposed',
        cost: 36,
        description: '稀有素材、戰術手記、黑市籤與賭場限定裝備。瑪洛說這不是保證收益，是把髒錢變成可追蹤的誘惑。',
        atmosphere: '櫃門打開時有股焚香和鐵鏽味，角落有人笑了一聲，又立刻安靜下來。',
        rewards: [
            { id: 'black_table_cutter', kind: 'item', itemId: 'casino_table_cutter', rarity: ItemRarity.COMMON, quantity: 1, weight: 20 },
            { id: 'black_cashier_lantern', kind: 'item', itemId: 'casino_cashier_lantern', rarity: ItemRarity.COMMON, quantity: 1, weight: 14 },
            { id: 'black_rare_metal', kind: 'item', itemId: 'rare_metal', rarity: ItemRarity.COMMON, quantity: [1, 2], weight: 10 },
            { id: 'black_forge_core', kind: 'item', itemId: 'forge_core', rarity: ItemRarity.COMMON, quantity: 1, weight: 8 },
            { id: 'black_ticket', kind: 'item', itemId: 'black_market_ticket', rarity: ItemRarity.COMMON, quantity: 1, weight: 8 },
            { id: 'black_moon_slot_blade', kind: 'item', itemId: 'casino_moon_slot_blade', rarity: ItemRarity.UNCOMMON, quantity: 1, weight: 12 },
            { id: 'black_velvet_dealer_vest', kind: 'item', itemId: 'casino_velvet_dealer_vest', rarity: ItemRarity.UNCOMMON, quantity: 1, weight: 9 },
            { id: 'black_enhance_scroll', kind: 'item', itemId: 'enhance_scroll', rarity: ItemRarity.UNCOMMON, quantity: 1, weight: 4 },
            { id: 'black_jackpot_revolver', kind: 'item', itemId: 'casino_jackpot_revolver', rarity: ItemRarity.RARE, quantity: 1, weight: 5 },
            { id: 'black_showcase_glass_key', kind: 'item', itemId: 'casino_showcase_glass_key', rarity: ItemRarity.RARE, quantity: 1, weight: 3 },
            { id: 'black_vip_card', kind: 'item', itemId: 'vip_card', rarity: ItemRarity.RARE, quantity: 1, weight: 2 },
            { id: 'black_house_edge_ring', kind: 'item', itemId: 'casino_house_edge_ring', rarity: ItemRarity.EPIC, quantity: 1, weight: 2 },
            { id: 'black_glass_case_keyblade', kind: 'item', itemId: 'casino_glass_case_keyblade', rarity: ItemRarity.EPIC, quantity: 1, weight: 1 },
            { id: 'black_blood_chip_cuirass', kind: 'item', itemId: 'casino_blood_chip_cuirass', rarity: ItemRarity.EPIC, quantity: 1, weight: 1 },
            { id: 'black_owner_contract_ring', kind: 'item', itemId: 'casino_owner_contract_ring', rarity: ItemRarity.LEGENDARY, quantity: 1, weight: 1 }
        ]
    },
    last_lamp_jackpot: {
        id: 'last_lamp_jackpot',
        name: '最後燈火獎池',
        subtitle: '末日前仍亮著的金色誘惑',
        minChapter: 3,
        unlockFlag: 'town.casino.relief_fund_counted',
        cost: 95,
        description: '第三章才開放的高額獎券池。它會吐出終局材料、賭場限定飾品與少量傳說獎；每抽獨立隨機，沒有進度條。',
        atmosphere: '惡魔莊家的影子貼在牆上，像是有人在低聲提醒：再押一次，也許這次就是奇蹟。',
        rewards: [
            { id: 'lamp_last_lamp_token', kind: 'item', itemId: 'casino_last_lamp_token', rarity: ItemRarity.COMMON, quantity: 1, weight: 24 },
            { id: 'lamp_cashier_lantern', kind: 'item', itemId: 'casino_cashier_lantern', rarity: ItemRarity.COMMON, quantity: 1, weight: 14 },
            { id: 'lamp_world_shard', kind: 'item', itemId: 'world_shard', rarity: ItemRarity.COMMON, quantity: 1, weight: 12 },
            { id: 'lamp_forbidden_page', kind: 'item', itemId: 'forbidden_blueprint_fragment', rarity: ItemRarity.COMMON, quantity: 1, weight: 10 },
            { id: 'lamp_oddskeeper_goggles', kind: 'item', itemId: 'casino_oddskeeper_goggles', rarity: ItemRarity.UNCOMMON, quantity: 1, weight: 13 },
            { id: 'lamp_velvet_dealer_vest', kind: 'item', itemId: 'casino_velvet_dealer_vest', rarity: ItemRarity.UNCOMMON, quantity: 1, weight: 7 },
            { id: 'lamp_relief_voucher', kind: 'item', itemId: 'relief_voucher', rarity: ItemRarity.UNCOMMON, quantity: [1, 2], weight: 5 },
            { id: 'lamp_silver_odds_mask', kind: 'item', itemId: 'casino_silver_odds_mask', rarity: ItemRarity.RARE, quantity: 1, weight: 5 },
            { id: 'lamp_loaded_dice_charm', kind: 'item', itemId: 'casino_loaded_dice_charm', rarity: ItemRarity.RARE, quantity: 1, weight: 3 },
            { id: 'lamp_legendary_shard', kind: 'item', itemId: 'legendary_shard', rarity: ItemRarity.RARE, quantity: [1, 2], weight: 2 },
            { id: 'lamp_false_odds_orb', kind: 'item', itemId: 'casino_false_odds_orb', rarity: ItemRarity.EPIC, quantity: 1, weight: 2 },
            { id: 'lamp_blood_chip_cuirass', kind: 'item', itemId: 'casino_blood_chip_cuirass', rarity: ItemRarity.EPIC, quantity: 1, weight: 1 },
            { id: 'lamp_gamblers_fallacy', kind: 'item', itemId: 'gamblers_fallacy', rarity: ItemRarity.EPIC, quantity: 1, weight: 1 },
            { id: 'lamp_last_lamp_blade', kind: 'item', itemId: 'casino_last_lamp_blade', rarity: ItemRarity.LEGENDARY, quantity: 1, weight: 0.5 },
            { id: 'lamp_zero_number_dice', kind: 'item', itemId: 'casino_zero_number_dice', rarity: ItemRarity.LEGENDARY, quantity: 1, weight: 0.3 },
            { id: 'lamp_starlit_jackpot_armor', kind: 'item', itemId: 'casino_starlit_jackpot_armor', rarity: ItemRarity.LEGENDARY, quantity: 1, weight: 0.2 }
        ]
    }
};

Object.assign(CasinoSpecialItems, {
    casino_copper_luck_ring: {
        id: 'casino_copper_luck_ring',
        name: '銅輪幸運戒',
        icon: '◉',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.COMMON,
        level: 1,
        stats: { attack: 1, defense: 1, critChance: 0.02 },
        specialEffects: [{ type: 'casinoTicketBonus', value: 0.02 }],
        description: '用退役籌碼打薄後捲成的戒指。它不會讓你變強太多，但會讓你更想再抽一次。',
        isCasinoUnique: true,
        source: 'casino_prize_pool'
    },
    casino_green_felt_gloves: {
        id: 'casino_green_felt_gloves',
        name: '綠氈藏牌手套',
        icon: '▣',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.COMMON,
        level: 2,
        stats: { attack: 3, defense: 1, critChance: 0.03 },
        specialEffects: [{ type: AffixStat.DODGE_CHANCE, value: 0.02 }],
        description: '指縫縫著細碎綠氈，適合把一枚硬幣、半張牌或一次不太光彩的勝利藏起來。',
        isCasinoUnique: true,
        source: 'casino_prize_pool'
    },
    casino_table_cutter: {
        id: 'casino_table_cutter',
        name: '桌邊割牌刀',
        icon: '⌁',
        type: EquipmentType.WEAPON,
        rarity: ItemRarity.COMMON,
        level: 3,
        stats: { attack: 8, defense: 0, critChance: 0.05, critDamage: 1.45, attackSpeed: 1.08 },
        specialEffects: [{ type: AffixStat.CRIT_DAMAGE, value: 0.08 }],
        description: '原本只是拆封牌盒的小刀，刀背卻被磨出適合近身反擊的角度。',
        isCasinoUnique: true,
        source: 'casino_prize_pool'
    },
    casino_house_runner_boots: {
        id: 'casino_house_runner_boots',
        name: '巡燈跑堂靴',
        icon: '⌂',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.COMMON,
        level: 5,
        stats: { attack: 2, defense: 5, critChance: 0.02 },
        specialEffects: [{ type: AffixStat.DODGE_CHANCE, value: 0.03 }],
        description: '鞋底很安靜，適合穿過賭桌、暗巷與那些不該被聽見的對話。',
        isCasinoUnique: true,
        source: 'casino_prize_pool'
    },
    casino_cashier_lantern: {
        id: 'casino_cashier_lantern',
        name: '帳房提燈',
        icon: '⌑',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.COMMON,
        level: 8,
        stats: { attack: 4, defense: 6, critChance: 0.03 },
        specialEffects: [{ type: AffixStat.GOLD_BONUS, value: 0.06 }],
        description: '燈芯用舊帳冊紙捲成。照亮金幣時，影子會自己把數字重新算一遍。',
        isCasinoUnique: true,
        source: 'casino_prize_pool'
    },
    casino_last_lamp_token: {
        id: 'casino_last_lamp_token',
        name: '末燈客籌',
        icon: '◎',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.COMMON,
        level: 12,
        stats: { attack: 6, defense: 8, critChance: 0.04 },
        specialEffects: [{ type: 'casinoTicketBonus', value: 0.04 }],
        description: '最後一盞燈熄滅前發出的客籌。拿著它的人通常已經不知道自己是贏家還是欠債者。',
        isCasinoUnique: true,
        source: 'casino_prize_pool'
    },
    casino_red_chip_bracer: {
        id: 'casino_red_chip_bracer',
        name: '紅籌護腕',
        icon: '◇',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.UNCOMMON,
        level: 4,
        stats: { attack: 5, defense: 5, critChance: 0.04 },
        specialEffects: [{ type: 'casinoTicketBonus', value: 0.05 }],
        description: '護腕內側嵌著紅籌碎片。每次格擋都像把賭注壓回桌面。',
        isCasinoUnique: true,
        source: 'casino_prize_pool'
    },
    casino_weighted_dice_belt: {
        id: 'casino_weighted_dice_belt',
        name: '灌鉛骰帶',
        icon: '▥',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.UNCOMMON,
        level: 6,
        stats: { attack: 7, defense: 4, critChance: 0.06 },
        specialEffects: [{ type: AffixStat.ARMOR_PENETRATION, value: 0.05 }],
        description: '腰帶上的骰子比看起來更重。它提醒你：公平只是沒被拆穿的重量差。',
        isCasinoUnique: true,
        source: 'casino_prize_pool'
    },
    casino_velvet_dealer_vest: {
        id: 'casino_velvet_dealer_vest',
        name: '暗紅莊家背心',
        icon: '▤',
        type: EquipmentType.EQUIPMENT,
        rarity: ItemRarity.UNCOMMON,
        level: 7,
        stats: { attack: 3, defense: 15, critChance: 0.03 },
        specialEffects: [{ type: AffixStat.DAMAGE_REDUCTION, value: 0.04 }],
        description: '背心的口袋很多，但沒有一個口袋會把東西放回原位。',
        isCasinoUnique: true,
        source: 'casino_prize_pool'
    },
    casino_moon_slot_blade: {
        id: 'casino_moon_slot_blade',
        name: '月槽拉桿刃',
        icon: '☾',
        type: EquipmentType.WEAPON,
        rarity: ItemRarity.UNCOMMON,
        level: 9,
        stats: { attack: 22, defense: 0, critChance: 0.08, critDamage: 1.7, attackSpeed: 1.16 },
        specialEffects: [{ type: AffixStat.DOUBLE_STRIKE, value: 0.05 }],
        description: '由老虎機拉桿改成的彎刃。揮下去時會聽見三格符號還在轉。',
        isCasinoUnique: true,
        source: 'casino_prize_pool'
    },
    casino_oddskeeper_goggles: {
        id: 'casino_oddskeeper_goggles',
        name: '算率員護目鏡',
        icon: '⊚',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.UNCOMMON,
        level: 13,
        stats: { attack: 8, defense: 9, critChance: 0.07 },
        specialEffects: [{ type: AffixStat.DROP_BONUS, value: 0.06 }],
        description: '鏡片上刻著密密麻麻的勝率表。戴上後，你會開始懷疑每一次閃避都是預先寫好的。',
        isCasinoUnique: true,
        source: 'casino_prize_pool'
    },
    casino_loaded_dice_charm: {
        id: 'casino_loaded_dice_charm',
        name: '作弊骰護符',
        icon: '◈',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.RARE,
        level: 6,
        stats: { attack: 7, defense: 6, critChance: 0.06 },
        specialEffects: [
            { type: 'casinoTicketBonus', value: 0.05 },
            { type: AffixStat.DODGE_CHANCE, value: 0.02 }
        ],
        description: '骰點永遠停在對你有利的一面，直到你開始相信那不是作弊。',
        isCasinoUnique: true,
        source: 'casino_prize_pool'
    },
    casino_jackpot_revolver: {
        id: 'casino_jackpot_revolver',
        name: '頭獎轉輪銃',
        icon: '✦',
        type: EquipmentType.WEAPON,
        rarity: ItemRarity.RARE,
        level: 11,
        stats: { attack: 32, defense: 0, critChance: 0.12, critDamage: 1.85, attackSpeed: 1.05 },
        specialEffects: [{ type: AffixStat.DOUBLE_STRIKE, value: 0.08 }],
        description: '彈巢像小型輪盤，扣下扳機時沒有人知道指針會停在哪一格。',
        isCasinoUnique: true,
        source: 'casino_prize_pool'
    },
    casino_marlo_balance_chain: {
        id: 'casino_marlo_balance_chain',
        name: '瑪洛平帳鏈',
        icon: '∞',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.RARE,
        level: 7,
        stats: { attack: 6, defense: 9, critChance: 0.05 },
        specialEffects: [{ type: AffixStat.GOLD_BONUS, value: 0.08 }],
        description: '帳房瑪洛用來固定帳冊的鏈子。它不保證你賺錢，只保證你知道自己輸在哪。',
        isCasinoUnique: true,
        source: 'casino_prize_pool'
    },
    casino_showcase_glass_key: {
        id: 'casino_showcase_glass_key',
        name: '展示櫃玻璃鑰',
        icon: '⌘',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.RARE,
        level: 12,
        stats: { attack: 12, defense: 10, critChance: 0.09 },
        specialEffects: [{ type: AffixStat.CRIT_DAMAGE, value: 0.16 }],
        description: '它開不了展示櫃，卻會讓展示櫃裡的東西反過來看你。',
        isCasinoUnique: true,
        source: 'casino_prize_pool'
    },
    casino_silver_odds_mask: {
        id: 'casino_silver_odds_mask',
        name: '銀率半面具',
        icon: '◐',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.RARE,
        level: 15,
        stats: { attack: 15, defense: 12, critChance: 0.1 },
        specialEffects: [{ type: AffixStat.DODGE_CHANCE, value: 0.05 }],
        description: '半張臉留給表情，半張臉留給算計。戴上後，敵人的破綻會像賠率表一樣浮現。',
        isCasinoUnique: true,
        source: 'casino_prize_pool'
    },
    casino_black_lamp_coat: {
        id: 'casino_black_lamp_coat',
        name: '黑燈莊家外套',
        icon: '◆',
        type: EquipmentType.EQUIPMENT,
        rarity: ItemRarity.EPIC,
        level: 7,
        stats: { attack: 5, defense: 20, hp: 45, critChance: 0.03 },
        specialEffects: [{ type: AffixStat.DAMAGE_REDUCTION, value: 0.03 }],
        description: '外套裡側有一排暗袋，像每一個都藏著不同版本的規則。',
        isCasinoUnique: true,
        source: 'casino_prize_pool'
    },
    casino_house_edge_ring: {
        id: 'casino_house_edge_ring',
        name: '莊家優勢戒',
        icon: '⬖',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.EPIC,
        level: 14,
        stats: { attack: 18, defense: 16, critChance: 0.12 },
        specialEffects: [
            { type: 'casinoTicketBonus', value: 0.12 },
            { type: AffixStat.CRIT_DAMAGE, value: 0.2 }
        ],
        description: '戒面看似平滑，其實刻著一道極小的斜角。所有不公平都從那一點開始。',
        isCasinoUnique: true,
        source: 'casino_prize_pool'
    },
    casino_glass_case_keyblade: {
        id: 'casino_glass_case_keyblade',
        name: '玻璃櫃鑰刃',
        icon: '✧',
        type: EquipmentType.WEAPON,
        rarity: ItemRarity.EPIC,
        level: 15,
        stats: { attack: 42, defense: 0, critChance: 0.14, critDamage: 1.95, attackSpeed: 1.12 },
        specialEffects: [{ type: AffixStat.ARMOR_PENETRATION, value: 0.10 }],
        description: '劍身像鑰匙，鑰齒像裂痕。它不是用來開門，是用來讓門後的東西再也關不回去。',
        isCasinoUnique: true,
        source: 'casino_prize_pool'
    },
    casino_blood_chip_cuirass: {
        id: 'casino_blood_chip_cuirass',
        name: '血籌胸甲',
        icon: '◼',
        type: EquipmentType.EQUIPMENT,
        rarity: ItemRarity.EPIC,
        level: 16,
        stats: { attack: 9, defense: 38, hp: 110, critChance: 0.04 },
        specialEffects: [{ type: AffixStat.LIFESTEAL, value: 0.02 }],
        description: '胸甲上的紅籌不是裝飾。它們會在受擊時微微發熱，像是在替你記帳。',
        isCasinoUnique: true,
        source: 'casino_prize_pool'
    },
    casino_false_odds_orb: {
        id: 'casino_false_odds_orb',
        name: '假賠率星球儀',
        icon: '◌',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.EPIC,
        level: 18,
        stats: { attack: 18, defense: 16, hp: 70, critChance: 0.09 },
        specialEffects: [{ type: AffixStat.ALL_STATS, value: 0.05 }],
        description: '小小星球儀上畫著不可能成立的賠率。盯久了，連命運都像能被改寫。',
        isCasinoUnique: true,
        source: 'casino_prize_pool'
    },
    casino_seventh_bell_crown: {
        id: 'casino_seventh_bell_crown',
        name: '第七鐘王冠',
        icon: '♛',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.LEGENDARY,
        level: 8,
        stats: { attack: 12, defense: 12, hp: 60, critChance: 0.08 },
        specialEffects: [
            { type: AffixStat.ALL_STATS, value: 0.03 },
            { type: 'casinoTicketBonus', value: 0.10 }
        ],
        description: '據說只有在第七次鐘聲後仍不離桌的人，才會被它承認。',
        isCasinoUnique: true,
        source: 'casino_prize_pool'
    },
    casino_last_lamp_blade: {
        id: 'casino_last_lamp_blade',
        name: '最後燈火刃',
        icon: '♜',
        type: EquipmentType.WEAPON,
        rarity: ItemRarity.LEGENDARY,
        level: 22,
        stats: { attack: 58, defense: 0, hp: 80, critChance: 0.16, critDamage: 2.05, attackSpeed: 1.15 },
        specialEffects: [
            { type: AffixStat.LIFESTEAL, value: 0.03 },
            { type: AffixStat.ARMOR_PENETRATION, value: 0.12 }
        ],
        description: '刀身裡封著最後一盞沒有熄滅的賭場燈。每一次揮砍都像替某個輸家翻案。',
        isCasinoUnique: true,
        source: 'casino_prize_pool'
    },
    casino_owner_contract_ring: {
        id: 'casino_owner_contract_ring',
        name: '老闆契約戒',
        icon: '♚',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.LEGENDARY,
        level: 16,
        stats: { attack: 22, defense: 22, hp: 110, critChance: 0.10 },
        specialEffects: [
            { type: 'casinoTicketBonus', value: 0.14 },
            { type: AffixStat.GOLD_BONUS, value: 0.12 }
        ],
        description: '戒內刻著一行小字：你可以贏走東西，但不一定能離開那張桌。',
        isCasinoUnique: true,
        source: 'casino_prize_pool'
    },
    casino_starlit_jackpot_armor: {
        id: 'casino_starlit_jackpot_armor',
        name: '星燈頭獎禮裝',
        icon: '♢',
        type: EquipmentType.EQUIPMENT,
        rarity: ItemRarity.LEGENDARY,
        level: 23,
        stats: { attack: 18, defense: 54, hp: 180, critChance: 0.08 },
        specialEffects: [
            { type: AffixStat.DAMAGE_REDUCTION, value: 0.06 },
            { type: AffixStat.DODGE_CHANCE, value: 0.04 }
        ],
        description: '只有頭獎燈全亮時才會顯出星紋的禮裝。遠看像勝利，近看像債務。',
        isCasinoUnique: true,
        source: 'casino_prize_pool'
    },
    casino_zero_number_dice: {
        id: 'casino_zero_number_dice',
        name: '零號骨骰',
        icon: '⚂',
        type: EquipmentType.ACCESSORY,
        rarity: ItemRarity.LEGENDARY,
        level: 22,
        stats: { attack: 30, defense: 24, hp: 120, critChance: 0.16 },
        specialEffects: [
            { type: AffixStat.CRIT_DAMAGE, value: 0.20 },
            { type: AffixStat.ALL_STATS, value: 0.05 }
        ],
        description: '六面骰上有第七個面，刻著「零」。它代表沒有發生，也代表一切重新開始。',
        isCasinoUnique: true,
        source: 'casino_prize_pool'
    }
});

export function getCasinoPrizePools() {
    return Object.values(CasinoPrizePools);
}

export function getCasinoPrizePool(poolId) {
    return CasinoPrizePools[poolId] || null;
}
