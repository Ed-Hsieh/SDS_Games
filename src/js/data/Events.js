/**
 * Events.js
 * 隨機事件資料庫 - Slay the Spire 風格的選擇事件
 */

// 事件類型
export const EventType = {
    BLESSING: 'blessing',      // 祝福 - 純獲益
    CURSE: 'curse',            // 詛咒 - 純損失
    GAMBLE: 'gamble',          // 賭博 - 風險與回報
    TRADE: 'trade',            // 交易 - 付出換取
    MYSTERY: 'mystery',        // 神秘 - 隨機結果
    ENCOUNTER: 'encounter'     // 遭遇 - 特殊NPC
};

// 事件結果類型
export const ResultType = {
    GOLD: 'gold',
    HEAL: 'heal',
    DAMAGE: 'damage',
    ITEM: 'item',
    BUFF: 'buff',
    DEBUFF: 'debuff',
    STAT: 'stat',
    EXP: 'exp',
    UNLOCK_QUEST: 'unlock_quest',
    WORLD_INTERACTION: 'world_interaction'
};

/**
 * 事件資料庫
 * 每個事件包含：
 * - id: 唯一識別符
 * - name: 事件名稱
 * - icon: 圖示
 * - type: 事件類型
 * - description: 事件描述
 * - choices: 選項陣列，每個選項有 text, results, chance(可選)
 */
export const EventDatabase = [
    // ===== 祝福事件 =====
    {
        id: 'ancient_shrine',
        name: '古老神殿',
        icon: '🏛️',
        type: EventType.BLESSING,
        zones: ['low', 'medium', 'high'],
        weight: 1.1,
        description: '你發現了一座被遺忘的神殿，神像前的祭壇還閃爍著微弱的光芒...',
        choices: [
            {
                text: '虔誠祈禱',
                results: [
                    { type: ResultType.HEAL, value: 0.3, isPercent: true, message: '神明賜予你治癒之光！' },
                    { type: ResultType.BUFF, buffType: 'def', value: 5, duration: 10, message: '獲得神聖護盾！' }
                ]
            },
            {
                text: '獻上金幣 (50G)',
                cost: { gold: 50 },
                results: [
                    { type: ResultType.EXP, value: 35, message: '你讀懂祭壇上的舊巡路記號，獲得一些經驗。' },
                    { type: ResultType.BUFF, buffType: 'luck', value: 6, duration: 12, message: '殘光暫時讓你的直覺變得敏銳。' }
                ]
            },
            {
                text: '離開',
                results: []
            }
        ]
    },
    {
        id: 'healing_spring',
        name: '生命之泉',
        icon: '⛲',
        type: EventType.BLESSING,
        zones: ['low', 'medium'],
        weight: 1.2,
        description: '清澈的泉水從岩石間湧出，散發著淡淡的生命微光。',
        choices: [
            {
                text: '飲用泉水',
                results: [
                    { type: ResultType.HEAL, value: 0.35, isPercent: true, message: '泉水恢復了你的體力。' }
                ]
            },
            {
                text: '浸泡武器',
                results: [
                    { type: ResultType.BUFF, buffType: 'atk', value: 4, duration: 12, message: '武器暫時帶著清泉的寒意。' }
                ]
            }
        ]
    },

    // ===== 詛咒事件 =====
    {
        id: 'cursed_chest',
        name: '詛咒寶箱',
        icon: '📦',
        type: EventType.CURSE,
        zones: ['medium', 'high', 'death'],
        weight: 0.75,
        description: '一個散發著不祥氣息的寶箱出現在你面前，鎖上刻著詭異的符文...',
        choices: [
            {
                text: '強行打開',
                results: [
                    { type: ResultType.GOLD, value: 90, message: '你拿到一小袋來路不明的金幣。' },
                    { type: ResultType.DEBUFF, buffType: 'def', value: -2, duration: 18, message: '但箱內的黑霧暫時削弱了你的防護。' }
                ]
            },
            {
                text: '用金幣解咒 (70G)',
                cost: { gold: 70 },
                results: [
                    { type: ResultType.GOLD, value: 120, message: '解咒後，你安全地取出箱底的財物。' },
                    { type: ResultType.ITEM, itemType: 'material_medium', message: '箱底還壓著一塊可用的材料。' }
                ]
            },
            {
                text: '不碰它',
                results: []
            }
        ]
    },
    {
        id: 'dark_spirit',
        name: '黑暗精靈',
        icon: '👻',
        type: EventType.CURSE,
        zones: ['high', 'death'],
        weight: 0.65,
        description: '一個黑暗的精靈飄浮在你面前，它似乎想要交易...',
        choices: [
            {
                text: '獻出生命換取力量',
                cost: { hp: 0.18, isPercent: true },
                results: [
                    { type: ResultType.BUFF, buffType: 'atk', value: 7, duration: 18, message: '黑霧纏上武器，力量只會停留一段時間。' }
                ]
            },
            {
                text: '交出一段記憶 (50G)',
                cost: { gold: 50 },
                results: [
                    { type: ResultType.EXP, value: 80, message: '你得到一段不屬於自己的危險知識。' }
                ]
            },
            {
                text: '拒絕交易',
                results: [
                    { type: ResultType.DAMAGE, value: 10, message: '精靈憤怒地攻擊了你！' }
                ]
            }
        ]
    },

    // ===== 賭博事件 =====
    {
        id: 'mysterious_merchant',
        name: '神秘商人',
        icon: '🎭',
        type: EventType.GAMBLE,
        zones: ['low', 'medium', 'high'],
        weight: 0.85,
        description: '一個戴著面具的商人從陰影中走出：「想試試運氣嗎？」',
        choices: [
            {
                text: '花 45G 抽獎',
                cost: { gold: 45 },
                chance: 0.45,
                successResults: [
                    { type: ResultType.GOLD, value: 115, message: '商人攤開手帕，裡面真的有金幣。這次他沒騙你。' }
                ],
                failResults: [
                    { type: ResultType.GOLD, value: 0, message: '很遺憾，什麼都沒有...' }
                ]
            },
            {
                text: '花 90G 抽稀有獎',
                cost: { gold: 90 },
                chance: 0.3,
                successResults: [
                    { type: ResultType.GOLD, value: 160, message: '你抽到商人口中的「不算太糟大獎」。' },
                    { type: ResultType.ITEM, itemType: 'forge_material', message: '還獲得了一份稀有鍛造素材。' }
                ],
                failResults: [
                    { type: ResultType.GOLD, value: 20, message: '安慰獎，返還一點金幣。' }
                ]
            },
            {
                text: '離開',
                results: []
            }
        ]
    },
    {
        id: 'dice_demon',
        name: '骰子惡魔',
        icon: '🎲',
        type: EventType.GAMBLE,
        zones: ['medium', 'high', 'death'],
        weight: 0.8,
        description: '一個手持骰子的小惡魔出現：「來玩個遊戲吧～贏了給你雙倍，輸了...嘿嘿」',
        choices: [
            {
                text: '賭 30G',
                cost: { gold: 30 },
                chance: 0.5,
                successResults: [
                    { type: ResultType.GOLD, value: 60, message: '你贏了！金幣翻倍！' }
                ],
                failResults: [
                    { type: ResultType.DAMAGE, value: 15, message: '你輸了！惡魔咬了你一口！' }
                ]
            },
            {
                text: '賭 80G (高風險)',
                cost: { gold: 80 },
                chance: 0.38,
                successResults: [
                    { type: ResultType.GOLD, value: 180, message: '惡魔不情願地把錢推過來，嘴裡小聲說下次一定。' }
                ],
                failResults: [
                    { type: ResultType.DAMAGE, value: 24, message: '慘敗。惡魔用骰子砸你，還砸得很準。' }
                ]
            },
            {
                text: '拒絕',
                results: []
            }
        ]
    },

    // ===== 交易事件 =====
    {
        id: 'wandering_blacksmith',
        name: '流浪鐵匠',
        icon: '⚒️',
        type: EventType.TRADE,
        zones: ['low', 'medium', 'high'],
        weight: 1.1,
        description: '一個滿身煤灰的鐵匠攔住你：「我可以強化你的裝備，但需要一些材料費。」',
        choices: [
            {
                text: '臨時打磨武器 (60G)',
                cost: { gold: 60 },
                results: [
                    { type: ResultType.BUFF, buffType: 'atk', value: 6, duration: 18, message: '武器被打磨得更順手，至少在它再次鈍掉前是這樣。' }
                ]
            },
            {
                text: '修補護具 (60G)',
                cost: { gold: 60 },
                results: [
                    { type: ResultType.BUFF, buffType: 'def', value: 6, duration: 18, message: '護具被補上幾塊結實鐵片，醜但有用。' }
                ]
            },
            {
                text: '購買邊角料 (45G)',
                cost: { gold: 45 },
                results: [
                    { type: ResultType.ITEM, itemType: 'material_medium', message: '鐵匠翻出一包還能用的邊角料。' }
                ]
            },
            {
                text: '謝絕好意',
                results: []
            }
        ]
    },
    {
        id: 'fairy_deal',
        name: '妖精的交易',
        icon: '🧚',
        type: EventType.TRADE,
        zones: ['low', 'medium'],
        weight: 0.8,
        description: '一個小妖精飛到你面前：「用你的金幣換取魔法祝福吧～」',
        choices: [
            {
                text: '購買攻擊祝福 (60G)',
                cost: { gold: 60 },
                results: [
                    { type: ResultType.BUFF, buffType: 'atk', value: 5, duration: 16, message: '妖精的粉塵讓你的攻擊暫時更俐落。' }
                ]
            },
            {
                text: '購買防禦祝福 (60G)',
                cost: { gold: 60 },
                results: [
                    { type: ResultType.BUFF, buffType: 'def', value: 5, duration: 16, message: '一層薄光黏在護具上，看起來很脆弱，但它真的有用。' }
                ]
            },
            {
                text: '購買生命祝福 (80G)',
                cost: { gold: 80 },
                results: [
                    { type: ResultType.HEAL, value: 0.45, isPercent: true, message: '妖精很努力地施法，雖然她中途打了個噴嚏。' },
                    { type: ResultType.BUFF, buffType: 'luck', value: 5, duration: 14, message: '你暫時覺得自己會有好運。這通常就是壞事的前奏。' }
                ]
            },
            {
                text: '離開',
                results: []
            }
        ]
    },

    // ===== 神秘事件 =====
    {
        id: 'mysterious_statue',
        name: '神秘雕像',
        icon: '🗿',
        type: EventType.MYSTERY,
        zones: ['medium', 'high', 'death'],
        weight: 0.9,
        description: '一座古老的雕像矗立在前方，眼睛似乎在注視著你...',
        choices: [
            {
                text: '觸摸雕像',
                isRandom: true,
                randomResults: [
                    { weight: 30, results: [{ type: ResultType.HEAL, value: 0.4, isPercent: true, message: '雕像發出溫暖的光芒，傷口稍微收攏。' }] },
                    { weight: 25, results: [{ type: ResultType.GOLD, value: 70, message: '雕像底座掉出一把舊金幣。' }] },
                    { weight: 25, results: [{ type: ResultType.EXP, value: 45, message: '你理解了石面上幾段古老警句。' }] },
                    { weight: 20, results: [{ type: ResultType.DAMAGE, value: 22, message: '雕像釋放出詛咒能量！' }] }
                ]
            },
            {
                text: '獻上金幣 (30G)',
                cost: { gold: 30 },
                results: [
                    { type: ResultType.EXP, value: 50, message: '雕像賜予你智慧！獲得經驗值！' }
                ]
            },
            {
                text: '繞道而行',
                results: []
            }
        ]
    },
    {
        id: 'dimensional_rift',
        name: '次元裂縫',
        icon: '🌀',
        type: EventType.MYSTERY,
        zones: ['high', 'death'],
        weight: 0.65,
        description: '空間中出現了一道裂縫，裡面似乎通往某個地方...',
        choices: [
            {
                text: '跳入裂縫',
                isRandom: true,
                randomResults: [
                    { weight: 25, results: [{ type: ResultType.GOLD, value: 120, message: '你落在一個短暫存在的寶物角落，立刻抓了一把就跑。' }] },
                    { weight: 25, results: [{ type: ResultType.ITEM, itemType: 'random', message: '你撿到了一件奇異的物品！' }] },
                    { weight: 25, results: [{ type: ResultType.DAMAGE, value: 34, message: '裂縫不穩定，你被彈了出來！' }] },
                    { weight: 25, results: [
                        { type: ResultType.BUFF, buffType: 'atk', value: 5, duration: 18, message: '次元能量暫時強化了你。' },
                        { type: ResultType.BUFF, buffType: 'def', value: 5, duration: 18, message: '' }
                    ]}
                ]
            },
            {
                text: '投擲金幣進去 (20G)',
                cost: { gold: 20 },
                chance: 0.6,
                successResults: [
                    { type: ResultType.GOLD, value: 55, message: '金幣帶著奇怪的溫度回到你手上。' }
                ],
                failResults: [
                    { type: ResultType.GOLD, value: 0, message: '金幣消失在裂縫中...' }
                ]
            },
            {
                text: '忽略它',
                results: []
            }
        ]
    },

    {
        id: 'foragers_emergency_stash',
        name: '採集者的緊急袋',
        icon: '🎒',
        type: EventType.ENCOUNTER,
        zones: ['low', 'medium'],
        weight: 1,
        description: '你在樹根下找到一只防水布包，上面綁著採集者常用的繩結。看起來是留給回程時救急用的。',
        choices: [
            {
                text: '只取需要的補給',
                results: [
                    { type: ResultType.HEAL, value: 0.22, isPercent: true, message: '你吃掉一份乾糧，身體稍微恢復。' }
                ]
            },
            {
                text: '拿走材料',
                results: [
                    { type: ResultType.ITEM, itemType: 'material_low', message: '你拿到一小包採集材料。' },
                    { type: ResultType.DEBUFF, buffType: 'luck', value: -3, duration: 10, message: '你有點擔心包主回來時會問候你的祖先。' }
                ]
            },
            {
                text: '留下記號後離開',
                results: [
                    { type: ResultType.EXP, value: 20, message: '你記下採集者的路標，對附近路線更熟悉了。' }
                ]
            }
        ]
    },
    {
        id: 'leyline_splinter',
        name: '地脈碎光',
        icon: '✨',
        type: EventType.MYSTERY,
        zones: ['medium', 'high'],
        weight: 0.85,
        description: '一道細小光縫從泥土裡滲出，像地底有人把星星摔碎了。光很漂亮，也很不穩定。',
        choices: [
            {
                text: '採集碎光',
                results: [
                    { type: ResultType.ITEM, itemType: 'material_medium', message: '你收集到一份帶有魔力殘響的材料。' },
                    { type: ResultType.DAMAGE, value: 10, message: '碎光割過指節，留下短暫刺痛。' }
                ]
            },
            {
                text: '觀察流向',
                results: [
                    { type: ResultType.EXP, value: 45, message: '你看出地脈正朝某個被破壞的核心回流。' }
                ]
            },
            {
                text: '遠離裂光',
                results: []
            }
        ]
    },
    {
        id: 'ash_scout_report',
        name: '焦黑斥候報告',
        icon: '📄',
        type: EventType.MYSTERY,
        zones: ['high', 'death'],
        weight: 0.8,
        description: '一份被火燒去半邊的斥候報告卡在石縫裡。剩下的字提到龍焰、黑鐵車隊，以及「不要相信正常的熱風」。',
        choices: [
            {
                text: '讀完殘頁',
                results: [
                    { type: ResultType.EXP, value: 65, message: '你整理出幾條危險區域的行進規律。' }
                ]
            },
            {
                text: '收集焦灰樣本',
                results: [
                    { type: ResultType.ITEM, itemType: 'material_medium', message: '焦灰裡混著能耐高熱的礦粉。' },
                    { type: ResultType.DEBUFF, buffType: 'def', value: -2, duration: 12, message: '灰粉鑽進護具縫裡，短時間內很不舒服。' }
                ]
            },
            {
                text: '把報告壓回石縫',
                results: []
            }
        ]
    },

    {
        id: 'abandoned_blueprint_cache',
        name: '遺落鍛造筆記',
        icon: '📜',
        type: EventType.MYSTERY,
        zones: ['low', 'medium'],
        weight: 0.55,
        description: '路邊散著幾頁被雨水泡皺的鍛造筆記，內容不像完整圖紙，更像某個委託的前置線索。',
        choices: [
            {
                text: '整理筆記',
                results: [
                    { type: ResultType.WORLD_INTERACTION, interactionId: 'field_blueprint_cache' }
                ]
            },
            {
                text: '先放回原處',
                results: []
            }
        ]
    },

    {
        id: 'field_notice_board',
        name: '野外布告欄',
        icon: '📌',
        type: EventType.MYSTERY,
        zones: ['low', 'medium'],
        weight: 0.55,
        description: '道路旁立著一塊被風雨打磨的布告欄，上面釘著新的委託與懸賞。',
        choices: [
            {
                text: '閱讀布告',
                results: [
                    { type: ResultType.WORLD_INTERACTION, interactionId: 'crossroads_notice_board' }
                ]
            },
            {
                text: '先離開',
                results: []
            }
        ]
    },

    {
        id: 'special_bounty_notice',
        name: '特殊懸賞單',
        icon: '📜',
        type: EventType.MYSTERY,
        zones: ['medium', 'high'],
        weight: 0.5,
        description: '一張沒有署名的懸賞單被壓在石縫裡，內容指向比普通委託更危險的目標。',
        choices: [
            {
                text: '接下線索',
                results: [
                    { type: ResultType.WORLD_INTERACTION, interactionId: 'special_bounty_notice' }
                ]
            },
            {
                text: '暫時不碰',
                results: []
            }
        ]
    },

    {
        id: 'weathered_route_tablet',
        name: '風化路線石碑',
        icon: '🪨',
        type: EventType.MYSTERY,
        zones: ['medium', 'high', 'death'],
        weight: 0.5,
        description: '草叢裡露出一截舊石碑，刻痕像路線，也像某種警告。碑底有洞窟形狀的標記。',
        choices: [
            {
                text: '拓印刻痕',
                results: [
                    { type: ResultType.WORLD_INTERACTION, interactionId: 'ruin_tablet_trace' }
                ]
            },
            {
                text: '不碰它',
                results: []
            }
        ]
    },

    // ===== 遭遇事件 =====
    {
        id: 'injured_adventurer',
        name: '受傷的冒險者',
        icon: '🤕',
        type: EventType.ENCOUNTER,
        zones: ['low', 'medium', 'high'],
        weight: 1,
        description: '你發現一個受傷的冒險者靠在樹旁，他看起來很虛弱...',
        choices: [
            {
                text: '分享你的補給品',
                cost: { hp: 0.1, isPercent: true },
                results: [
                    { type: ResultType.GOLD, value: 45, message: '冒險者把藏在靴底的金幣塞給你。你決定不問為什麼藏那裡。' },
                    { type: ResultType.BUFF, buffType: 'luck', value: 7, duration: 12, message: '好心有好報，幸運暫時提升。' }
                ]
            },
            {
                text: '搜刮他的物品',
                results: [
                    { type: ResultType.GOLD, value: 35, message: '你找到了一些金幣...' },
                    { type: ResultType.DEBUFF, buffType: 'luck', value: -5, duration: 15, message: '但你感到一陣不安，幸運暫時下降。' }
                ]
            },
            {
                text: '無視他',
                results: []
            }
        ]
    },
    {
        id: 'ancient_guardian',
        name: '遠古守護者',
        icon: '🗡️',
        type: EventType.ENCOUNTER,
        zones: ['medium', 'high', 'death'],
        weight: 0.75,
        description: '一個沉睡的石像忽然睜開眼睛：「證明你的價值，或者離開。」',
        choices: [
            {
                text: '接受力量試煉',
                cost: { hp: 0.22, isPercent: true },
                results: [
                    { type: ResultType.BUFF, buffType: 'atk', value: 8, duration: 20, message: '你通過了試煉，守護者的刻印暫時提高攻擊。' },
                    { type: ResultType.EXP, value: 45, message: '你從試煉節奏中學到了一點戰鬥經驗。' }
                ]
            },
            {
                text: '接受生命試煉',
                cost: { gold: 90 },
                results: [
                    { type: ResultType.HEAL, value: 0.5, isPercent: true, message: '守護者歸還一部分生命氣息。' },
                    { type: ResultType.BUFF, buffType: 'def', value: 8, duration: 20, message: '石像的護印暫時覆在你的裝備上。' }
                ]
            },
            {
                text: '恭敬地離開',
                results: [
                    { type: ResultType.HEAL, value: 0.1, isPercent: true, message: '守護者讚許地點點頭，給予你一點恢復。' }
                ]
            }
        ]
    }
];

// 根據區域獲取適合的事件
export function getEventsForZone(zone) {
    // 不同區域有不同的事件權重
    const zoneWeights = {
        'low': { [EventType.BLESSING]: 35, [EventType.TRADE]: 25, [EventType.ENCOUNTER]: 20, [EventType.GAMBLE]: 10, [EventType.MYSTERY]: 10 },
        'medium': { [EventType.TRADE]: 30, [EventType.GAMBLE]: 25, [EventType.MYSTERY]: 25, [EventType.ENCOUNTER]: 20 },
        'high': { [EventType.CURSE]: 25, [EventType.GAMBLE]: 25, [EventType.MYSTERY]: 30, [EventType.ENCOUNTER]: 20 },
        'death': { [EventType.CURSE]: 25, [EventType.GAMBLE]: 18, [EventType.MYSTERY]: 28, [EventType.ENCOUNTER]: 20, [EventType.BLESSING]: 9 },
        'boss': { [EventType.CURSE]: 30, [EventType.MYSTERY]: 40, [EventType.BLESSING]: 30 }
    };
    
    return EventDatabase.filter(event => {
        const weights = zoneWeights[zone] || zoneWeights['low'];
        const zones = Array.isArray(event.zones) ? event.zones : [];
        return weights[event.type] !== undefined && (zones.length === 0 || zones.includes(zone));
    });
}

// 根據權重隨機選擇事件
export function getRandomEvent(zone) {
    const events = getEventsForZone(zone);
    if (events.length === 0) return null;
    
    return events[Math.floor(Math.random() * events.length)];
}
