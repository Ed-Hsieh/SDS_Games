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
                    { type: ResultType.STAT, stat: 'maxHp', value: 10, message: '最大生命值永久提升！' }
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
        description: '清澈的泉水從岩石間湧出，散發著淡淡的魔力光芒。',
        choices: [
            {
                text: '飲用泉水',
                results: [
                    { type: ResultType.HEAL, value: 0.5, isPercent: true, message: '泉水恢復了你的體力！' }
                ]
            },
            {
                text: '浸泡武器',
                results: [
                    { type: ResultType.BUFF, buffType: 'atk', value: 8, duration: 5, message: '武器獲得水之祝福！' }
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
        description: '一個散發著不祥氣息的寶箱出現在你面前，鎖上刻著詭異的符文...',
        choices: [
            {
                text: '強行打開',
                results: [
                    { type: ResultType.GOLD, value: 200, message: '獲得大量金幣！' },
                    { type: ResultType.DEBUFF, buffType: 'def', value: -3, duration: 20, message: '但你被詛咒了，防禦下降！' }
                ]
            },
            {
                text: '用金幣解咒 (100G)',
                cost: { gold: 100 },
                results: [
                    { type: ResultType.GOLD, value: 300, message: '安全地獲得寶箱中的財寶！' }
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
        description: '一個黑暗的精靈飄浮在你面前，它似乎想要交易...',
        choices: [
            {
                text: '獻出生命換取力量',
                cost: { hp: 0.2, isPercent: true },
                results: [
                    { type: ResultType.STAT, stat: 'baseAtk', value: 5, message: '基礎攻擊力永久提升！' }
                ]
            },
            {
                text: '獻出力量換取生命',
                cost: { atk: 3 },
                results: [
                    { type: ResultType.STAT, stat: 'maxHp', value: 30, message: '最大生命值永久提升！' }
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
        description: '一個戴著面具的商人從陰影中走出：「想試試運氣嗎？」',
        choices: [
            {
                text: '花 50G 抽獎',
                cost: { gold: 50 },
                chance: 0.4,
                successResults: [
                    { type: ResultType.GOLD, value: 200, message: '恭喜！你贏得了大獎！' }
                ],
                failResults: [
                    { type: ResultType.GOLD, value: 0, message: '很遺憾，什麼都沒有...' }
                ]
            },
            {
                text: '花 100G 抽稀有獎',
                cost: { gold: 100 },
                chance: 0.25,
                successResults: [
                    { type: ResultType.GOLD, value: 500, message: '大獎！你獲得了豐厚獎勵！' },
                    { type: ResultType.ITEM, itemType: 'forge_material', message: '還獲得了一份稀有鍛造素材！' }
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
                text: '賭 100G (高風險)',
                cost: { gold: 100 },
                chance: 0.35,
                successResults: [
                    { type: ResultType.GOLD, value: 300, message: '大贏！三倍獎勵！' }
                ],
                failResults: [
                    { type: ResultType.DAMAGE, value: 30, message: '慘敗！惡魔狠狠教訓了你！' }
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
        description: '一個滿身煤灰的鐵匠攔住你：「我可以強化你的裝備，但需要一些材料費。」',
        choices: [
            {
                text: '強化武器 (80G)',
                cost: { gold: 80 },
                results: [
                    { type: ResultType.BUFF, buffType: 'atk', value: 10, duration: 15, message: '武器被強化了！' }
                ]
            },
            {
                text: '強化防具 (80G)',
                cost: { gold: 80 },
                results: [
                    { type: ResultType.BUFF, buffType: 'def', value: 10, duration: 15, message: '防具被強化了！' }
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
        description: '一個小妖精飛到你面前：「用你的金幣換取魔法祝福吧～」',
        choices: [
            {
                text: '購買攻擊祝福 (60G)',
                cost: { gold: 60 },
                results: [
                    { type: ResultType.STAT, stat: 'baseAtk', value: 2, message: '攻擊力永久+2！' }
                ]
            },
            {
                text: '購買防禦祝福 (60G)',
                cost: { gold: 60 },
                results: [
                    { type: ResultType.STAT, stat: 'baseDef', value: 2, message: '防禦力永久+2！' }
                ]
            },
            {
                text: '購買生命祝福 (100G)',
                cost: { gold: 100 },
                results: [
                    { type: ResultType.STAT, stat: 'maxHp', value: 15, message: '最大生命+15！' },
                    { type: ResultType.HEAL, value: 1.0, isPercent: true, message: '並且完全恢復！' }
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
        description: '一座古老的雕像矗立在前方，眼睛似乎在注視著你...',
        choices: [
            {
                text: '觸摸雕像',
                isRandom: true,
                randomResults: [
                    { weight: 30, results: [{ type: ResultType.HEAL, value: 1.0, isPercent: true, message: '雕像發出溫暖的光芒，你完全恢復了！' }] },
                    { weight: 30, results: [{ type: ResultType.GOLD, value: 150, message: '雕像中掉出了金幣！' }] },
                    { weight: 20, results: [{ type: ResultType.STAT, stat: 'maxHp', value: 5, message: '你感受到生命力的提升！' }] },
                    { weight: 20, results: [{ type: ResultType.DAMAGE, value: 25, message: '雕像釋放出詛咒能量！' }] }
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
        description: '空間中出現了一道裂縫，裡面似乎通往某個地方...',
        choices: [
            {
                text: '跳入裂縫',
                isRandom: true,
                randomResults: [
                    { weight: 25, results: [{ type: ResultType.GOLD, value: 300, message: '你來到了一個充滿寶藏的空間！' }] },
                    { weight: 25, results: [{ type: ResultType.ITEM, itemType: 'random', message: '你撿到了一件奇異的物品！' }] },
                    { weight: 25, results: [{ type: ResultType.DAMAGE, value: 40, message: '裂縫不穩定，你被彈了出來！' }] },
                    { weight: 25, results: [
                        { type: ResultType.STAT, stat: 'baseAtk', value: 3, message: '次元能量強化了你！' },
                        { type: ResultType.STAT, stat: 'baseDef', value: 3, message: '' }
                    ]}
                ]
            },
            {
                text: '投擲金幣進去 (20G)',
                cost: { gold: 20 },
                chance: 0.6,
                successResults: [
                    { type: ResultType.GOLD, value: 100, message: '金幣加倍返回了！' }
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
        id: 'abandoned_blueprint_cache',
        name: '殘破製作圖匣',
        icon: '📜',
        type: EventType.MYSTERY,
        description: '路邊的碎木匣裡夾著幾張被雨水泡皺的圖紙。紙面上的標記像是某種鍛造記錄。',
        choices: [
            {
                text: '整理圖紙',
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
        id: 'weathered_route_tablet',
        name: '風化路線石碑',
        icon: '🪨',
        type: EventType.MYSTERY,
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
        description: '你發現一個受傷的冒險者靠在樹旁，他看起來很虛弱...',
        choices: [
            {
                text: '分享你的補給品',
                cost: { hp: 0.1, isPercent: true },
                results: [
                    { type: ResultType.GOLD, value: 80, message: '冒險者感激地給了你他的積蓄！' },
                    { type: ResultType.BUFF, buffType: 'luck', value: 10, duration: 10, message: '好心有好報，幸運提升！' }
                ]
            },
            {
                text: '搜刮他的物品',
                results: [
                    { type: ResultType.GOLD, value: 50, message: '你找到了一些金幣...' },
                    { type: ResultType.DEBUFF, buffType: 'luck', value: -5, duration: 15, message: '但你感到一陣不安，幸運下降。' }
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
        description: '一個沉睡的石像忽然睜開眼睛：「證明你的價值，或者離開。」',
        choices: [
            {
                text: '接受力量試煉',
                cost: { hp: 0.3, isPercent: true },
                results: [
                    { type: ResultType.STAT, stat: 'baseAtk', value: 5, message: '你通過了試煉！攻擊力大幅提升！' }
                ]
            },
            {
                text: '接受耐力試煉',
                cost: { gold: 150 },
                results: [
                    { type: ResultType.STAT, stat: 'maxHp', value: 25, message: '你通過了試煉！生命值大幅提升！' }
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
        'boss': { [EventType.CURSE]: 30, [EventType.MYSTERY]: 40, [EventType.BLESSING]: 30 }
    };
    
    return EventDatabase.filter(event => {
        const weights = zoneWeights[zone] || zoneWeights['low'];
        return weights[event.type] !== undefined;
    });
}

// 根據權重隨機選擇事件
export function getRandomEvent(zone) {
    const events = getEventsForZone(zone);
    if (events.length === 0) return null;
    
    return events[Math.floor(Math.random() * events.length)];
}
