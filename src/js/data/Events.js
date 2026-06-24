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

export const EventRole = {
    RESOURCE: 'resource',
    RISK_REWARD: 'risk_reward',
    TRADE: 'trade',
    STORY_SEED: 'story_seed',
    SIDE_STORY: 'side_story',
    WORLD_LORE: 'world_lore',
    PRESSURE: 'pressure'
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
        name: '巡路小龕',
        icon: '🏛️',
        type: EventType.BLESSING,
        zones: ['low', 'medium', 'high'],
        weight: 1.1,
        description: '路旁有一座給巡守者留燈的小龕，龕前的灰裡還壓著半截新蠟。有人比你早一步經過，也有人希望下一個人能活著回來。',
        choices: [
            {
                text: '整理供桌',
                intent: '穩定恢復，適合繼續探索。',
                results: [
                    { type: ResultType.HEAL, value: 0.3, isPercent: true, message: '你整理灰燼與供燭，火光短暫穩住呼吸。' },
                    { type: ResultType.BUFF, buffType: 'def', value: 5, duration: 10, message: '龕上的巡守符號讓你暫時更沉得住腳步。' }
                ]
            },
            {
                text: '獻上金幣 (50G)',
                intent: '換取經驗與短暫直覺，偏向線索探索。',
                cost: { gold: 50 },
                results: [
                    { type: ResultType.EXP, value: 35, message: '你讀懂祭壇上的舊巡路記號，獲得一些經驗。' },
                    { type: ResultType.BUFF, buffType: 'luck', value: 6, duration: 12, message: '殘光暫時讓你的直覺變得敏銳。' }
                ]
            },
            {
                text: '離開',
                intent: '不消耗資源，保留目前狀態。',
                results: []
            }
        ]
    },
    {
        id: 'healing_spring',
        name: '回聲水窪',
        icon: '⛲',
        type: EventType.BLESSING,
        zones: ['low', 'medium'],
        weight: 1.2,
        description: '一灘清水積在石縫裡，水面倒映出的不是天空，而是城鎮南門的燈。地脈還沒完全壞死，至少這一小口水仍記得回家的方向。',
        choices: [
            {
                text: '飲用泉水',
                intent: '直接恢復生命。',
                results: [
                    { type: ResultType.HEAL, value: 0.35, isPercent: true, message: '清水帶著泥土與鐵味，卻確實讓傷口冷靜下來。' }
                ]
            },
            {
                text: '浸泡武器',
                intent: '犧牲恢復，換取短暫攻擊節奏。',
                results: [
                    { type: ResultType.BUFF, buffType: 'atk', value: 4, duration: 12, message: '武器帶上一層冷亮水痕，下一段路會更俐落。' }
                ]
            }
        ]
    },

    // ===== 詛咒事件 =====
    {
        id: 'cursed_chest',
        name: '男爵黑箱',
        icon: '📦',
        type: EventType.CURSE,
        zones: ['medium', 'high', 'death'],
        weight: 0.75,
        description: '一只黑鐵箱被丟在路邊，封條上壓著灰燼男爵的舊印。箱子沒有上鎖，只是用很禮貌的方式警告你：打開的人請自負後果。',
        choices: [
            {
                text: '強行打開',
                intent: '拿走金幣，但會留下防護壓力。',
                results: [
                    { type: ResultType.GOLD, value: 90, message: '你拿到一小袋來路不明的金幣。' },
                    { type: ResultType.DEBUFF, buffType: 'def', value: -2, duration: 18, message: '但箱內的黑霧暫時削弱了你的防護。' }
                ]
            },
            {
                text: '用金幣解咒 (70G)',
                intent: '花錢降低風險，換取穩定收益。',
                cost: { gold: 70 },
                results: [
                    { type: ResultType.GOLD, value: 120, message: '解咒後，你安全地取出箱底的財物。' },
                    { type: ResultType.ITEM, itemType: 'material_medium', message: '箱底還壓著一塊可用的材料。' }
                ]
            },
            {
                text: '不碰它',
                intent: '避開風險，但也放棄可能收益。',
                results: []
            }
        ]
    },
    {
        id: 'dark_spirit',
        name: '深淵影語',
        icon: '👻',
        type: EventType.CURSE,
        zones: ['high', 'death'],
        weight: 0.65,
        description: '影子從石縫裡站了起來，用很熟悉的聲音喊你的名字。你確定從沒告訴過它，但它講得像欠你錢很久。',
        choices: [
            {
                text: '獻出生命換取力量',
                intent: '危險但直接提升攻擊。',
                cost: { hp: 0.18, isPercent: true },
                results: [
                    { type: ResultType.BUFF, buffType: 'atk', value: 7, duration: 18, message: '黑霧纏上武器，力量只會停留一段時間。' }
                ]
            },
            {
                text: '交出一段記憶 (50G)',
                intent: '以金幣交換危險知識。',
                cost: { gold: 50 },
                results: [
                    { type: ResultType.EXP, value: 80, message: '你得到一段不屬於自己的危險知識。' }
                ]
            },
            {
                text: '拒絕交易',
                intent: '保住資源，但可能被反咬。',
                results: [
                    { type: ResultType.DAMAGE, value: 10, message: '精靈憤怒地攻擊了你！' }
                ]
            }
        ]
    },

    // ===== 賭博事件 =====
    {
        id: 'mysterious_merchant',
        name: '披斗篷的兜售者',
        icon: '🎭',
        type: EventType.GAMBLE,
        zones: ['low', 'medium', 'high'],
        weight: 0.85,
        description: '一個披斗篷的人把木箱擺在路中央，聲稱自己賣的是「災難折扣包」。他的笑容很誠懇，誠懇到你開始懷疑箱子裡是不是只有石頭。',
        choices: [
            {
                text: '花 45G 抽獎',
                intent: '低額風險，可能補回金幣。',
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
                intent: '高額風險，可能拿到鍛造材料。',
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
                intent: '不賭運氣，保留金幣。',
                results: []
            }
        ]
    },
    {
        id: 'dice_demon',
        name: '黑骰小販',
        icon: '🎲',
        type: EventType.GAMBLE,
        zones: ['medium', 'high', 'death'],
        weight: 0.8,
        description: '小惡魔蹲在倒塌路牌上，手裡的骰子刻著男爵黑市暗號。牠說這只是遊戲，但你注意到骰盅底下墊著一張失蹤工匠名單。',
        choices: [
            {
                text: '賭 30G',
                intent: '小額搏一把，失敗會受傷。',
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
                intent: '高風險高回報，適合資源充足時。',
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
                intent: '不參與賭局，避免受傷與損失。',
                results: []
            }
        ]
    },

    // ===== 交易事件 =====
    {
        id: 'wandering_blacksmith',
        name: '巡路補鍛匠',
        icon: '⚒️',
        type: EventType.TRADE,
        zones: ['low', 'medium', 'high'],
        weight: 1.1,
        description: '一名拖著小砧台的補鍛匠坐在路邊。他說自己本來只修農具，直到農夫們開始拿鋤頭敲怪物，他的職涯才突然變得很壯烈。',
        choices: [
            {
                text: '臨時打磨武器 (60G)',
                intent: '短時間提高攻擊。',
                cost: { gold: 60 },
                results: [
                    { type: ResultType.BUFF, buffType: 'atk', value: 6, duration: 18, message: '武器被打磨得更順手，至少在它再次鈍掉前是這樣。' }
                ]
            },
            {
                text: '修補護具 (60G)',
                intent: '短時間提高防禦。',
                cost: { gold: 60 },
                results: [
                    { type: ResultType.BUFF, buffType: 'def', value: 6, duration: 18, message: '護具被補上幾塊結實鐵片，醜但有用。' }
                ]
            },
            {
                text: '購買邊角料 (45G)',
                intent: '取得一份通用材料。',
                cost: { gold: 45 },
                results: [
                    { type: ResultType.ITEM, itemType: 'material_medium', message: '鐵匠翻出一包還能用的邊角料。' }
                ]
            },
            {
                text: '謝絕好意',
                intent: '保留金幣，維持目前裝備狀態。',
                results: []
            }
        ]
    },
    {
        id: 'fairy_deal',
        name: '迷路妖精',
        icon: '🧚',
        type: EventType.TRADE,
        zones: ['low', 'medium'],
        weight: 0.8,
        description: '一隻妖精在路標上打轉，堅稱自己不是迷路，只是「正在重新定義方向」。她願意用一點小魔法換路費，語氣聽起來像已經重新定義了三個小時。',
        choices: [
            {
                text: '購買攻擊祝福 (60G)',
                intent: '短時間提高攻擊。',
                cost: { gold: 60 },
                results: [
                    { type: ResultType.BUFF, buffType: 'atk', value: 5, duration: 16, message: '妖精的粉塵讓你的攻擊暫時更俐落。' }
                ]
            },
            {
                text: '購買防禦祝福 (60G)',
                intent: '短時間提高防禦。',
                cost: { gold: 60 },
                results: [
                    { type: ResultType.BUFF, buffType: 'def', value: 5, duration: 16, message: '一層薄光黏在護具上，看起來很脆弱，但它真的有用。' }
                ]
            },
            {
                text: '購買生命祝福 (80G)',
                intent: '恢復生命並提高運氣。',
                cost: { gold: 80 },
                results: [
                    { type: ResultType.HEAL, value: 0.45, isPercent: true, message: '妖精很努力地施法，雖然她中途打了個噴嚏。' },
                    { type: ResultType.BUFF, buffType: 'luck', value: 5, duration: 14, message: '你暫時覺得自己會有好運。這通常就是壞事的前奏。' }
                ]
            },
            {
                text: '離開',
                intent: '不花路費，讓妖精繼續重新定義方向。',
                results: []
            }
        ]
    },

    // ===== 神秘事件 =====
    {
        id: 'mysterious_statue',
        name: '霧碑殘像',
        icon: '🗿',
        type: EventType.MYSTERY,
        zones: ['medium', 'high', 'death'],
        weight: 0.9,
        description: '霧裡立著一座半身石像，臉被風磨平，只剩胸口刻著舊地脈符號。靠近時，石像的影子慢半拍才跟著你動。',
        choices: [
            {
                text: '觸摸雕像',
                intent: '結果不穩，可能獲益也可能受傷。',
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
                intent: '穩定換取經驗。',
                cost: { gold: 30 },
                results: [
                    { type: ResultType.EXP, value: 50, message: '雕像賜予你智慧！獲得經驗值！' }
                ]
            },
            {
                text: '繞道而行',
                intent: '避開未知效果，不承擔風險。',
                results: []
            }
        ]
    },
    {
        id: 'dimensional_rift',
        name: '深淵裂口',
        icon: '🌀',
        type: EventType.MYSTERY,
        zones: ['high', 'death'],
        weight: 0.65,
        description: '一道黑紅色裂口在地面張開，熱風從裡面往上吐，像世界底下有人把爐門踢開。裂口邊緣散著不該出現在地表的灰。',
        choices: [
            {
                text: '跳入裂縫',
                intent: '高波動結果，可能得到稀有回報。',
                isRandom: true,
                randomResults: [
                    { weight: 25, results: [{ type: ResultType.GOLD, value: 120, message: '你落在一個短暫存在的寶物角落，立刻抓了一把就跑。' }] },
                    { weight: 25, results: [{ type: ResultType.ITEM, itemType: 'random', message: '你撿到了一件奇異的物品！' }] },
                    { weight: 25, results: [{ type: ResultType.DAMAGE, value: 34, message: '裂縫不穩定，你被彈了出來！' }] },
                    { weight: 25, results: [
                        { type: ResultType.BUFF, buffType: 'atk', value: 5, duration: 18, message: '次元能量暫時強化了你。' },
                        { type: ResultType.BUFF, buffType: 'def', value: 5, duration: 18, message: '裂口邊緣的壓力也讓你短暫變得更能承受衝擊。' }
                    ]}
                ]
            },
            {
                text: '投擲金幣進去 (20G)',
                intent: '小額風險測試裂口穩定度。',
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
                intent: '遠離深淵壓力，保留生命與金幣。',
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
                intent: '恢復生命，不留下太多痕跡。',
                results: [
                    { type: ResultType.HEAL, value: 0.22, isPercent: true, message: '你吃掉一份乾糧，身體稍微恢復。' }
                ]
            },
            {
                text: '拿走材料',
                intent: '取得材料，但會承擔一點心理壓力。',
                results: [
                    { type: ResultType.ITEM, itemType: 'material_low', message: '你拿到一小包採集材料。' },
                    { type: ResultType.DEBUFF, buffType: 'luck', value: -3, duration: 10, message: '你有點擔心包主回來時會問候你的祖先。' }
                ]
            },
            {
                text: '留下記號後離開',
                intent: '不拿資源，換取路線經驗。',
                results: [
                    { type: ResultType.EXP, value: 28, message: '你記下採集者的路標，對附近路線更熟悉了。' },
                    { type: ResultType.BUFF, buffType: 'luck', value: 2, duration: 8, message: '你在袋口重新綁上草結。下一段路，像是有人替你留了暗號。' }
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
                intent: '取得魔力材料，但會承受割傷。',
                results: [
                    { type: ResultType.ITEM, itemType: 'material_medium', message: '你收集到一份帶有魔力殘響的材料。' },
                    { type: ResultType.DAMAGE, value: 10, message: '碎光割過指節，留下短暫刺痛。' }
                ]
            },
            {
                text: '觀察流向',
                intent: '不碰觸碎光，換取地脈知識。',
                results: [
                    { type: ResultType.EXP, value: 45, message: '你看出地脈正朝某個被破壞的核心回流。' }
                ]
            },
            {
                text: '遠離裂光',
                intent: '避免不穩定魔力，不取得回報。',
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
                intent: '整理危險區域情報，獲得經驗。',
                results: [
                    { type: ResultType.EXP, value: 65, message: '你整理出幾條危險區域的行進規律。' }
                ]
            },
            {
                text: '收集焦灰樣本',
                intent: '取得耐熱材料，但短暫降低防護。',
                results: [
                    { type: ResultType.ITEM, itemType: 'material_medium', message: '焦灰裡混著能耐高熱的礦粉。' },
                    { type: ResultType.DEBUFF, buffType: 'def', value: -2, duration: 12, message: '灰粉鑽進護具縫裡，短時間內很不舒服。' }
                ]
            },
            {
                text: '把報告壓回石縫',
                intent: '不碰戰場殘物，保留現況。',
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
        retireWhenFlags: ['foundBlueprintCache'],
        description: '路邊散著幾頁被雨水泡皺的鍛造筆記，內容不像完整圖紙，更像某個委託的前置線索。',
        choices: [
            {
                text: '整理筆記',
                intent: '觸發鍛造相關支線線索。',
                results: [
                    { type: ResultType.WORLD_INTERACTION, interactionId: 'field_blueprint_cache' }
                ]
            },
            {
                text: '先放回原處',
                intent: '暫時不追這條支線。',
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
        retireWhenFlags: ['readCrossroadsNoticeBoard', 'heardScholarSlimeRequest'],
        description: '道路旁立著一塊被風雨打磨的布告欄，上面釘著新的委託與懸賞。',
        choices: [
            {
                text: '閱讀布告',
                intent: '讀取城外委託與傳聞。',
                results: [
                    { type: ResultType.WORLD_INTERACTION, interactionId: 'crossroads_notice_board' }
                ]
            },
            {
                text: '先離開',
                intent: '先不接收新的傳聞。',
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
        retireWhenFlags: ['readSpecialBountyNotice', 'mapFragmentDelivered'],
        retireWhenQuestIds: ['bounty_elite_001'],
        description: '一張沒有署名的懸賞單被壓在石縫裡，內容指向比普通委託更危險的目標。',
        choices: [
            {
                text: '接下線索',
                intent: '開啟一條更危險的懸賞支線。',
                results: [
                    { type: ResultType.WORLD_INTERACTION, interactionId: 'special_bounty_notice' }
                ]
            },
            {
                text: '暫時不碰',
                intent: '等裝備更穩再回來處理。',
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
        retireWhenFlags: ['foundRuinTabletTrace'],
        retireWhenQuestIds: ['dungeon_cave_001'],
        description: '草叢裡露出一截舊石碑，刻痕像路線，也像某種警告。碑底有洞窟形狀的標記。',
        choices: [
            {
                text: '拓印刻痕',
                intent: '記錄通往洞窟與遺跡的路線線索。',
                results: [
                    { type: ResultType.WORLD_INTERACTION, interactionId: 'ruin_tablet_trace' }
                ]
            },
            {
                text: '不碰它',
                intent: '不碰未知石碑，避免牽動事件。',
                results: []
            }
        ]
    },

    // ===== 旅途短篇事件 =====
    {
        id: 'south_gate_patrol_marks',
        name: '南門巡路記號',
        icon: '🪧',
        type: EventType.ENCOUNTER,
        zones: ['low', 'medium'],
        weight: 1,
        description: '幾枚新釘上的木牌插在泥地裡，筆跡像村長的，旁邊還有守衛靴底踩出的深痕。這不是壯闊傳說，只是有人努力把「還能走的路」標出來。',
        choices: [
            {
                text: '校正路牌方向',
                intent: '取得路線經驗，適合主線初期。',
                results: [
                    { type: ResultType.EXP, value: 30, message: '你把歪掉的路牌扶正，南門外的路線在腦中清楚了一點。' },
                    { type: ResultType.BUFF, buffType: 'luck', value: 4, duration: 10, message: '清楚的路標讓你接下來比較不容易走冤枉路。' }
                ]
            },
            {
                text: '拔下鬆動鐵釘',
                intent: '拿走材料，但會弄傷手。',
                results: [
                    { type: ResultType.ITEM, itemType: 'material_low', message: '你收下一些還能用的鐵釘與木片。' },
                    { type: ResultType.DAMAGE, value: 6, message: '其中一枚鐵釘很有個性，狠狠劃過你的手掌。' }
                ]
            },
            {
                text: '記下位置後離開',
                intent: '安全但收益較低。',
                results: [
                    { type: ResultType.EXP, value: 15, message: '你把這段路記進旅途紀錄。至少下次不會在同一棵樹前懷疑人生。' }
                ]
            }
        ]
    },
    {
        id: 'hunter_tripwire_cache',
        name: '獵人絆線匣',
        icon: '🪤',
        type: EventType.MYSTERY,
        zones: ['low', 'medium'],
        weight: 0.85,
        description: '草叢裡藏著一只獵人匣，匣蓋被銀白絲線纏住。這看起來像補給，也像某種東西留給粗心人的笑話。',
        choices: [
            {
                text: '慢慢拆線',
                intent: '低風險取得材料與經驗。',
                results: [
                    { type: ResultType.ITEM, itemType: 'material_low', message: '你拆下一小束可用絆線與獵具零件。' },
                    { type: ResultType.EXP, value: 25, message: '絆線的打結方式讓你更確定，獵人棧道上有東西在學人類設陷阱。' }
                ]
            },
            {
                text: '直接割開',
                intent: '快速拿資源，但可能受傷。',
                results: [
                    { type: ResultType.ITEM, itemType: 'material_medium', message: '匣裡有一小包保存良好的金屬零件。' },
                    { type: ResultType.DAMAGE, value: 12, message: '銀絲彈回來割破護腕。它很細，也很記仇。' }
                ]
            },
            {
                text: '繞開它',
                intent: '避開風險。',
                results: []
            }
        ]
    },
    {
        id: 'muddy_supply_cart',
        name: '陷進泥裡的補給車',
        icon: '🛞',
        type: EventType.TRADE,
        zones: ['low', 'medium'],
        weight: 0.9,
        description: '一輛補給車卡在泥坑裡，車主正在用非常文雅的詞彙辱罵輪子。車上有藥草、鐵件，還有一鍋看起來正在思考人生的冷湯。',
        choices: [
            {
                text: '幫忙推車',
                intent: '消耗體力，換取金幣與經驗。',
                cost: { hp: 0.08, isPercent: true },
                results: [
                    { type: ResultType.GOLD, value: 55, message: '車主塞給你一點路費，並承認你的肩膀比他的輪子可靠。' },
                    { type: ResultType.EXP, value: 25, message: '你理解了泥地、車輪與髒話之間的力學關係。' },
                    { type: ResultType.ITEM, itemType: 'material_low', message: '車底滾出一小包備用零件，車主揮手說那本來就是要掉的。' }
                ]
            },
            {
                text: '買下破損零件 (40G)',
                intent: '用金幣換材料。',
                cost: { gold: 40 },
                results: [
                    { type: ResultType.ITEM, itemType: 'material_medium', message: '你買下一包車主原本打算丟掉的零件。鍛造師大概會說「還能救」。' }
                ]
            },
            {
                text: '指路後離開',
                intent: '保守取得少量運氣。',
                results: [
                    { type: ResultType.BUFF, buffType: 'luck', value: 3, duration: 10, message: '車主照著你的指示脫困，你也覺得今天可能沒那麼糟。' },
                    { type: ResultType.EXP, value: 18, message: '你把這條補給路線記進腦中，之後看地圖時少了一點陌生感。' }
                ]
            }
        ]
    },
    {
        id: 'thorn_toll_roots',
        name: '荊棘路稅',
        icon: '🌿',
        type: EventType.TRADE,
        zones: ['medium', 'high'],
        weight: 0.85,
        description: '路中央長出一圈荊棘，藤上掛著幾枚乾草結。它不像自然植物，倒像有人把收費站種進土裡。',
        choices: [
            {
                text: '照規矩留下金幣 (65G)',
                intent: '支付代價，換取恢復與線索感。',
                cost: { gold: 65 },
                results: [
                    { type: ResultType.HEAL, value: 0.28, isPercent: true, message: '荊棘收下金幣後讓出路，還吐出一滴帶藥味的露水。' },
                    { type: ResultType.EXP, value: 35, message: '你看懂藤刺排列的規則：女巫的交易不是混亂，而是殘酷地精準。' }
                ]
            },
            {
                text: '砍開荊棘',
                intent: '拿材料，但會承受反噬。',
                results: [
                    { type: ResultType.ITEM, itemType: 'material_medium', message: '你砍下一段仍在扭動的荊棘芯。' },
                    { type: ResultType.DAMAGE, value: 16, message: '斷藤回抽，在你手臂上留下一道像簽名的傷。' }
                ]
            },
            {
                text: '記下刺結形狀',
                intent: '安全取得經驗。',
                results: [
                    { type: ResultType.EXP, value: 45, message: '你記下刺結排列，之後看見類似符號時應該不會只覺得它長得很不友善。' }
                ]
            }
        ]
    },
    {
        id: 'drowned_lantern_line',
        name: '溺水燈線',
        icon: '🕯️',
        type: EventType.MYSTERY,
        zones: ['medium', 'high'],
        weight: 0.75,
        description: '幾盞防潮燈被繩子串在一起，燈焰明明沒有風卻同時偏向海岸。遠處傳來一聲悶鐘，像有人在海底敲桌子。',
        choices: [
            {
                text: '校正燈線',
                intent: '取得經驗與短暫幸運。',
                results: [
                    { type: ResultType.EXP, value: 55, message: '你把燈線調回正確節奏，沉鐘聲短暫變得可辨。' },
                    { type: ResultType.BUFF, buffType: 'luck', value: 5, duration: 12, message: '路邊的燈忽明忽暗，像是在替你避開下一個壞念頭。' }
                ]
            },
            {
                text: '收集燈油',
                intent: '取得材料，但會引來寒意。',
                results: [
                    { type: ResultType.ITEM, itemType: 'material_medium', message: '你收下一小瓶混著鹽味與靈質的燈油。' },
                    { type: ResultType.DEBUFF, buffType: 'def', value: -2, duration: 10, message: '濕冷黏在護具內側，短時間內很難受。' }
                ]
            },
            {
                text: '熄掉最亮那盞',
                intent: '保守避開亡魂注意。',
                results: [
                    { type: ResultType.HEAL, value: 0.12, isPercent: true, message: '燈滅後，周圍安靜了一點，你也跟著喘過氣。' }
                ]
            }
        ]
    },
    {
        id: 'obsidian_deserter_map',
        name: '逃兵的黑曜石地圖',
        icon: '🗺️',
        type: EventType.ENCOUNTER,
        zones: ['high'],
        weight: 0.75,
        description: '一名披著破斗篷的人把地圖塞進你手裡，說自己不是逃兵，只是「非常積極地離開錯誤方向」。地圖上畫著黑曜石要塞的地下運輸線。',
        choices: [
            {
                text: '聽他說完',
                intent: '取得大量經驗。',
                results: [
                    { type: ResultType.EXP, value: 85, message: '你記下黑鐵車隊的換班時間，以及他努力辯解自己不是逃兵的三個版本。' }
                ]
            },
            {
                text: '買下地圖 (80G)',
                intent: '花金幣換短暫戰鬥優勢。',
                cost: { gold: 80 },
                results: [
                    { type: ResultType.BUFF, buffType: 'atk', value: 6, duration: 16, message: '地圖上的伏擊點讓你接下來出手更果斷。' },
                    { type: ResultType.EXP, value: 50, message: '你看出男爵地宮不是避難工程，而是準備好的墳墓。' }
                ]
            },
            {
                text: '給他一條回城方向',
                intent: '不拿資源，換取運氣。',
                results: [
                    { type: ResultType.BUFF, buffType: 'luck', value: 6, duration: 12, message: '逃兵朝城鎮跑去，跑姿很丟臉，但方向終於對了。' }
                ]
            }
        ]
    },
    {
        id: 'refugee_cart_repair',
        name: '避難者的斷輪車',
        icon: '🧳',
        type: EventType.ENCOUNTER,
        zones: ['high', 'death'],
        weight: 0.9,
        description: '一群避難者推著斷輪車停在路邊。車上沒有寶物，只有鍋、毯子、幾封沒寄出的信，以及一個孩子緊緊抱著不會叫的木鳥。',
        choices: [
            {
                text: '修好車輪 (70G)',
                intent: '花金幣，換取恢復與經驗。',
                cost: { gold: 70 },
                results: [
                    { type: ResultType.HEAL, value: 0.25, isPercent: true, message: '避難者分給你一碗熱湯，味道很淡，但手心因此暖了起來。' },
                    { type: ResultType.EXP, value: 60, message: '你學會了在世界快裂開時，車輪其實也是一種防線。' },
                    { type: ResultType.BUFF, buffType: 'def', value: 3, duration: 10, message: '臨走前，有人把斷裂木板綁在你的護具外側。醜，但能擋一下。' }
                ]
            },
            {
                text: '收下壞掉的鐵件',
                intent: '拿材料，但降低運氣。',
                results: [
                    { type: ResultType.ITEM, itemType: 'material_medium', message: '你收下一些壞掉的鐵件，它們至少還能進爐。' },
                    { type: ResultType.DEBUFF, buffType: 'luck', value: -4, duration: 12, message: '那個抱木鳥的孩子一直看著你，這讓材料突然變得很重。' }
                ]
            },
            {
                text: '替他們標出回城路',
                intent: '安全取得防禦與少量經驗。',
                results: [
                    { type: ResultType.BUFF, buffType: 'def', value: 5, duration: 12, message: '你把可走路線標清楚，心裡某個地方也跟著站穩。' },
                    { type: ResultType.EXP, value: 30, message: '避難者記住你的方向，城鎮也會多幾個活人抵達。' }
                ]
            }
        ]
    },
    {
        id: 'dragon_heat_haze',
        name: '龍熱蜃影',
        icon: '🔥',
        type: EventType.CURSE,
        zones: ['high', 'death'],
        weight: 0.8,
        description: '前方空氣被熱浪折成波紋，遠處的樹影像燃燒中的手指。你聞到焦木味，卻沒有看見火。',
        choices: [
            {
                text: '衝過熱浪',
                intent: '受傷換取大量經驗。',
                results: [
                    { type: ResultType.DAMAGE, value: 22, message: '熱浪刮過皮膚，像被看不見的火舌舔了一下。' },
                    { type: ResultType.EXP, value: 90, message: '你抓到熱浪間歇的節奏，這對北境路線很有用。' }
                ]
            },
            {
                text: '用泥土覆住護具',
                intent: '用金幣補準備，換取防禦。',
                cost: { gold: 55 },
                results: [
                    { type: ResultType.BUFF, buffType: 'def', value: 7, duration: 16, message: '臨時隔熱層又髒又醜，但它確實讓你少被烤熟一點。' }
                ]
            },
            {
                text: '等熱浪退去',
                intent: '保守取得少量經驗。',
                results: [
                    { type: ResultType.EXP, value: 35, message: '你記下熱浪週期。它不像天氣，更像某種巨大生物的呼吸。' }
                ]
            }
        ]
    },
    {
        id: 'mist_tablet_cipher',
        name: '霧碑錯位文',
        icon: '🪨',
        type: EventType.MYSTERY,
        zones: ['high'],
        weight: 0.72,
        description: '霧碑上的文字在你靠近時慢慢錯位，幾段句子像被拆成碎骨後重新排好。你看不懂全部，但能辨認出「守衛」、「法杖」與「不要照原路回去」。',
        choices: [
            {
                text: '按霧的流向重排文字',
                intent: '安全解讀地脈與古墓線索，取得較多經驗。',
                results: [
                    { type: ResultType.EXP, value: 75 },
                    { type: ResultType.BUFF, buffType: 'luck', value: 5, duration: 12 }
                ]
            },
            {
                text: '刮下發亮的苔痕',
                intent: '拿走可用素材，但可能被封印反噬。',
                results: [
                    { type: ResultType.ITEM, itemType: 'material_medium' },
                    { type: ResultType.DAMAGE, value: 12 }
                ]
            },
            {
                text: '只畫下看得懂的三個字',
                intent: '保守記錄，不碰封印。',
                results: [
                    { type: ResultType.EXP, value: 35 }
                ]
            }
        ]
    },
    {
        id: 'coast_salvage_tide',
        name: '退潮殘貨',
        icon: '🌊',
        type: EventType.ENCOUNTER,
        zones: ['medium', 'high'],
        weight: 0.74,
        description: '潮水短暫退開，沙面露出一排被海藻纏住的木箱。箱上有王國貨印，也有被海水泡爛的祭壇符號。遠處的沉鐘聲每響一下，海水就往回爬一點。',
        choices: [
            {
                text: '趁退潮搬走貨箱',
                intent: '取得材料，但會承受潮水與寒意的代價。',
                results: [
                    { type: ResultType.ITEM, itemType: 'material_medium' },
                    { type: ResultType.DEBUFF, buffType: 'def', value: -2, duration: 12 }
                ]
            },
            {
                text: '等鐘聲對齊再下手',
                intent: '不急著拿貨，先讀懂沉鐘節奏。',
                results: [
                    { type: ResultType.EXP, value: 70 },
                    { type: ResultType.BUFF, buffType: 'luck', value: 4, duration: 12 }
                ]
            },
            {
                text: '只取漂來的錢袋',
                intent: '低風險拿一點金幣。',
                results: [
                    { type: ResultType.GOLD, value: 55 }
                ]
            }
        ]
    },
    {
        id: 'black_iron_checkpoint',
        name: '黑鐵臨檢哨',
        icon: '⛓️',
        type: EventType.ENCOUNTER,
        zones: ['high', 'death'],
        weight: 0.72,
        description: '黑曜石要塞外多了一處臨時哨卡，木牌上寫著「自願捐糧處」。牌子旁站著兩名疲憊士兵，看起來比你更不相信自願兩個字。',
        choices: [
            {
                text: '繞過哨卡',
                intent: '有機會避開衝突，失敗會受傷。',
                chance: 0.58,
                successResults: [
                    { type: ResultType.EXP, value: 65 },
                    { type: ResultType.BUFF, buffType: 'luck', value: 4, duration: 10 }
                ],
                failResults: [
                    { type: ResultType.DAMAGE, value: 18 },
                    { type: ResultType.DEBUFF, buffType: 'def', value: -2, duration: 10 }
                ]
            },
            {
                text: '塞錢買通士兵 (70G)',
                intent: '穩定通過，順便打聽要塞內部狀況。',
                cost: { gold: 70 },
                results: [
                    { type: ResultType.EXP, value: 75 },
                    { type: ResultType.BUFF, buffType: 'atk', value: 5, duration: 12 }
                ]
            },
            {
                text: '拆走廢棄鐵牌',
                intent: '取得材料，但讓自己暴露在哨兵視線裡。',
                results: [
                    { type: ResultType.ITEM, itemType: 'material_medium' },
                    { type: ResultType.DAMAGE, value: 10 }
                ]
            }
        ]
    },
    {
        id: 'northbound_whiteout_cache',
        name: '雪線補給旗',
        icon: '🚩',
        type: EventType.BLESSING,
        zones: ['high', 'death'],
        weight: 0.76,
        description: '雪地裡插著一支被燒黑半邊的補給旗，旗桿下埋著油布包。包內只有最基本的乾糧、火石與一張字條：往北走的人，不要相信安靜。',
        choices: [
            {
                text: '補充乾糧與火石',
                intent: '穩定恢復，適合進入北境前整理狀態。',
                results: [
                    { type: ResultType.HEAL, value: 0.28, isPercent: true }
                ]
            },
            {
                text: '把旗布纏上護具',
                intent: '提高防禦，準備承受龍焰與風雪。',
                results: [
                    { type: ResultType.BUFF, buffType: 'def', value: 7, duration: 16 },
                    { type: ResultType.EXP, value: 35 }
                ]
            },
            {
                text: '留下自己的補給記號',
                intent: '不拿太多，只整理路線。',
                results: [
                    { type: ResultType.BUFF, buffType: 'luck', value: 6, duration: 14 }
                ]
            }
        ]
    },
    {
        id: 'abyssal_name_echo',
        name: '深淵名諱回聲',
        icon: '🕳️',
        type: EventType.MYSTERY,
        zones: ['death'],
        weight: 0.68,
        description: '封印裂口下方傳來一串名字，聲音像從很遠的井底浮上來。你聽不清每一個字，卻確定其中有一個名字正在等你回答。',
        choices: [
            {
                text: '聽到最後一個音節',
                intent: '取得終局知識，但會承受深淵壓力。',
                results: [
                    { type: ResultType.EXP, value: 95 },
                    { type: ResultType.DEBUFF, buffType: 'luck', value: -5, duration: 14 }
                ]
            },
            {
                text: '刻下反制記號',
                intent: '受一點傷，換取防禦強化。',
                results: [
                    { type: ResultType.DAMAGE, value: 16 },
                    { type: ResultType.BUFF, buffType: 'def', value: 8, duration: 18 }
                ]
            },
            {
                text: '立刻離開裂口邊緣',
                intent: '不貪聽回聲，保留狀態。',
                results: [
                    { type: ResultType.EXP, value: 35 }
                ]
            }
        ]
    },
    {
        id: 'last_campfire_before_north',
        name: '北行前的最後營火',
        icon: '🔥',
        type: EventType.BLESSING,
        zones: ['death', 'boss'],
        weight: 0.85,
        description: '一處營火還沒熄，旁邊放著半塊硬麵包和一張被燒掉角落的留言：「如果你也要往北，至少坐一下。站著害怕很累。」',
        choices: [
            {
                text: '坐到火邊休息',
                intent: '大幅恢復生命。',
                results: [
                    { type: ResultType.HEAL, value: 0.45, isPercent: true, message: '火很小，但足夠讓你記得自己還是活人。' }
                ]
            },
            {
                text: '把留言燒成火種',
                intent: '換取攻擊與經驗。',
                results: [
                    { type: ResultType.BUFF, buffType: 'atk', value: 8, duration: 18, message: '火星黏在武器邊緣，像有人替你把猶豫燒掉。' },
                    { type: ResultType.EXP, value: 50, message: '你讀完留言殘句，知道上一個人也害怕，只是沒有停下。' }
                ]
            },
            {
                text: '留下自己的記號',
                intent: '提高運氣，讓旅途更像有人接力。',
                results: [
                    { type: ResultType.BUFF, buffType: 'luck', value: 8, duration: 16, message: '你留下一枚小記號。也許下一個人會看見，也許下一個人就是你自己。' }
                ]
            }
        ]
    },

    // ===== 遭遇事件 =====
    {
        id: 'injured_adventurer',
        name: '倒在路邊的斥候',
        icon: '🤕',
        type: EventType.ENCOUNTER,
        zones: ['low', 'medium', 'high'],
        weight: 1,
        description: '一名斥候靠在路邊，披風被劃成像破地圖一樣。他說自己只是「坐一下」，但血跡一路拖到他腳邊，這句話的可信度不高。',
        choices: [
            {
                text: '分享你的補給品',
                intent: '消耗生命，換取金幣與運氣。',
                cost: { hp: 0.1, isPercent: true },
                results: [
                    { type: ResultType.GOLD, value: 45, message: '冒險者把藏在靴底的金幣塞給你。你決定不問為什麼藏那裡。' },
                    { type: ResultType.BUFF, buffType: 'luck', value: 7, duration: 12, message: '好心有好報，幸運暫時提升。' }
                ]
            },
            {
                text: '搜刮他的物品',
                intent: '立刻獲得金幣，但會降低運氣。',
                results: [
                    { type: ResultType.GOLD, value: 35, message: '你找到了一些金幣...' },
                    { type: ResultType.DEBUFF, buffType: 'luck', value: -5, duration: 15, message: '但你感到一陣不安，幸運暫時下降。' }
                ]
            },
            {
                text: '無視他',
                intent: '保留資源，但錯過這段路上的人情。',
                results: []
            }
        ]
    },
    {
        id: 'ancient_guardian',
        name: '舊防衛機關',
        icon: '🗡️',
        type: EventType.ENCOUNTER,
        zones: ['medium', 'high', 'death'],
        weight: 0.75,
        description: '地面齒輪轉出一尊石甲守衛。它的眼光沒有惡意，只有過期很久的職業精神：所有活物都必須排隊接受檢查。',
        choices: [
            {
                text: '接受力量試煉',
                intent: '消耗生命，換取攻擊與經驗。',
                cost: { hp: 0.22, isPercent: true },
                results: [
                    { type: ResultType.BUFF, buffType: 'atk', value: 8, duration: 20, message: '你通過了試煉，守護者的刻印暫時提高攻擊。' },
                    { type: ResultType.EXP, value: 45, message: '你從試煉節奏中學到了一點戰鬥經驗。' }
                ]
            },
            {
                text: '接受生命試煉',
                intent: '支付金幣，換取恢復與防禦。',
                cost: { gold: 90 },
                results: [
                    { type: ResultType.HEAL, value: 0.5, isPercent: true, message: '守護者歸還一部分生命氣息。' },
                    { type: ResultType.BUFF, buffType: 'def', value: 8, duration: 20, message: '石像的護印暫時覆在你的裝備上。' }
                ]
            },
            {
                text: '恭敬地離開',
                intent: '保守選擇，得到少量恢復。',
                results: [
                    { type: ResultType.HEAL, value: 0.1, isPercent: true, message: '守護者讚許地點點頭，給予你一點恢復。' }
                ]
            }
        ]
    },
    {
        id: 'boss_shadow_column',
        name: '黑影方尖碑',
        icon: '🗿',
        type: EventType.MYSTERY,
        zones: ['boss'],
        weight: 1,
        eventRole: EventRole.WORLD_LORE,
        chapterRange: [3, 3],
        description: '一座焦黑方尖碑立在風裡，表面刻著被火刮過的龍語。你看不懂全部內容，但反覆出現的符號都指向同一件事：龍巢不是巢，是被搬空的大陸心臟。',
        choices: [
            {
                text: '拓下符號',
                intent: '取得經驗，並更理解終局地脈因果。',
                results: [
                    { type: ResultType.EXP, value: 80, message: '你把符號拓進手札。書記如果看見，大概會先尖叫再分類。' }
                ]
            },
            {
                text: '沿裂紋注入魔力',
                intent: '承受壓力，換取短暫攻擊提升。',
                cost: { hp: 0.12, isPercent: true },
                results: [
                    { type: ResultType.BUFF, buffType: 'atk', value: 10, duration: 18, message: '裂紋亮起黑紅色光，武器邊緣短暫變得灼熱。' }
                ]
            },
            {
                text: '不要久留',
                intent: '避免消耗，保留狀態。',
                results: []
            }
        ]
    },
    {
        id: 'boss_abyssal_march',
        name: '深淵行軍聲',
        icon: '⚠️',
        type: EventType.CURSE,
        zones: ['boss'],
        weight: 1.05,
        eventRole: EventRole.PRESSURE,
        chapterRange: [3, 3],
        description: '遠處傳來整齊到不近人情的踏步聲。那不是軍隊正在靠近，而像是某種東西正在提醒世界：封印已經沒有耐心了。',
        choices: [
            {
                text: '壓低呼吸等待聲音遠去',
                intent: '穩定生命，但失去一點推進節奏。',
                results: [
                    { type: ResultType.HEAL, value: 0.2, isPercent: true, message: '你等到踏步聲遠去，才發現自己剛才連眨眼都忘了。' }
                ]
            },
            {
                text: '迎著聲音校準武器',
                intent: '用壓力換取防禦與經驗。',
                cost: { hp: 0.1, isPercent: true },
                results: [
                    { type: ResultType.BUFF, buffType: 'def', value: 10, duration: 18, message: '恐懼沒有消失，但它被你壓進了握柄裡。' },
                    { type: ResultType.EXP, value: 60, message: '你記住了深淵軍勢的節奏。這不是好聽的旋律，但很有用。' }
                ]
            },
            {
                text: '立刻轉向',
                intent: '保守離開，不觸發額外效果。',
                results: []
            }
        ]
    },
    {
        id: 'boss_dragon_nest_spoil',
        name: '龍巢散落物',
        icon: '💎',
        type: EventType.ENCOUNTER,
        zones: ['boss'],
        weight: 0.9,
        eventRole: EventRole.RISK_REWARD,
        chapterRange: [3, 3],
        description: '裂石間卡著一塊從龍巢掉落的魔力殘片，像寶石，也像一隻正在裝死的眼睛。拿走它可能有用，也可能讓某些存在更快注意到你。',
        choices: [
            {
                text: '小心取下殘片',
                intent: '取得金幣與經驗，承擔少量傷害。',
                cost: { hp: 0.08, isPercent: true },
                results: [
                    { type: ResultType.GOLD, value: 120, message: '殘片很燙，你把它包進布裡時聽見像鱗片摩擦的聲音。' },
                    { type: ResultType.EXP, value: 70, message: '你辨認出這不是天然礦物，而是被龍巢壓縮過的地脈碎屑。' }
                ]
            },
            {
                text: '用它磨亮武器',
                intent: '不拿走殘片，換取攻擊提升。',
                results: [
                    { type: ResultType.BUFF, buffType: 'atk', value: 12, duration: 16, message: '武器劃過殘片表面，亮起一條像龍息餘燼的紅線。' }
                ]
            },
            {
                text: '把它留在原地',
                intent: '避開風險。',
                results: []
            }
        ]
    }
];

const EVENT_STORY_RULES = {
    ancient_shrine: { eventRole: EventRole.RESOURCE, chapterRange: [1, 3] },
    healing_spring: { eventRole: EventRole.RESOURCE, chapterRange: [1, 2] },
    cursed_chest: { eventRole: EventRole.RISK_REWARD, chapterRange: [2, 3] },
    dark_spirit: { eventRole: EventRole.RISK_REWARD, chapterRange: [2, 3] },
    mysterious_merchant: { eventRole: EventRole.TRADE, chapterRange: [1, 3] },
    dice_demon: { eventRole: EventRole.RISK_REWARD, chapterRange: [2, 3] },
    wandering_blacksmith: { eventRole: EventRole.TRADE, chapterRange: [1, 3] },
    fairy_deal: { eventRole: EventRole.RESOURCE, chapterRange: [1, 2] },
    mysterious_statue: { eventRole: EventRole.RISK_REWARD, chapterRange: [2, 3] },
    dimensional_rift: { eventRole: EventRole.PRESSURE, chapterRange: [3, 3] },
    foragers_emergency_stash: { eventRole: EventRole.RESOURCE, chapterRange: [1, 2] },
    leyline_splinter: { eventRole: EventRole.WORLD_LORE, chapterRange: [2, 3] },
    ash_scout_report: { eventRole: EventRole.WORLD_LORE, chapterRange: [2, 3] },
    abandoned_blueprint_cache: { eventRole: EventRole.SIDE_STORY, chapterRange: [1, 2] },
    field_notice_board: { eventRole: EventRole.STORY_SEED, chapterRange: [1, 1] },
    special_bounty_notice: { eventRole: EventRole.SIDE_STORY, chapterRange: [2, 3] },
    weathered_route_tablet: { eventRole: EventRole.WORLD_LORE, chapterRange: [1, 2] },
    south_gate_patrol_marks: { eventRole: EventRole.STORY_SEED, chapterRange: [1, 1] },
    hunter_tripwire_cache: { eventRole: EventRole.RISK_REWARD, chapterRange: [1, 2] },
    muddy_supply_cart: { eventRole: EventRole.RESOURCE, chapterRange: [1, 2] },
    thorn_toll_roots: { eventRole: EventRole.SIDE_STORY, chapterRange: [2, 2] },
    drowned_lantern_line: { eventRole: EventRole.WORLD_LORE, chapterRange: [2, 2] },
    obsidian_deserter_map: { eventRole: EventRole.WORLD_LORE, chapterRange: [2, 2] },
    refugee_cart_repair: { eventRole: EventRole.SIDE_STORY, chapterRange: [3, 3] },
    dragon_heat_haze: { eventRole: EventRole.PRESSURE, chapterRange: [3, 3] },
    mist_tablet_cipher: { eventRole: EventRole.WORLD_LORE, chapterRange: [2, 3] },
    coast_salvage_tide: { eventRole: EventRole.RISK_REWARD, chapterRange: [2, 2] },
    black_iron_checkpoint: { eventRole: EventRole.PRESSURE, chapterRange: [2, 3] },
    northbound_whiteout_cache: { eventRole: EventRole.RESOURCE, chapterRange: [3, 3] },
    abyssal_name_echo: { eventRole: EventRole.PRESSURE, chapterRange: [3, 3] },
    last_campfire_before_north: { eventRole: EventRole.RESOURCE, chapterRange: [3, 3] },
    boss_shadow_column: { eventRole: EventRole.WORLD_LORE, chapterRange: [3, 3] },
    boss_abyssal_march: { eventRole: EventRole.PRESSURE, chapterRange: [3, 3] },
    boss_dragon_nest_spoil: { eventRole: EventRole.RISK_REWARD, chapterRange: [3, 3] },
    injured_adventurer: { eventRole: EventRole.RESOURCE, chapterRange: [1, 3] },
    ancient_guardian: { eventRole: EventRole.RISK_REWARD, chapterRange: [2, 3] }
};

const EVENT_LOCATION_RULES = {
    ancient_shrine: {
        landmarkIds: ['mist_tablet_hill', 'opened_ancient_tomb', 'sunken_altar_reef', 'abyssal_seal_break'],
        locationWeightBoost: 1.3
    },
    healing_spring: {
        landmarkIds: ['south_gate_farmland', 'rotroot_ravine', 'moon_moss_slope', 'drowned_bell_coast'],
        locationWeightBoost: 1.4
    },
    cursed_chest: {
        landmarkIds: ['opened_ancient_tomb', 'black_iron_storehouse', 'abyssal_seal_break'],
        locationWeightBoost: 1.5
    },
    dark_spirit: {
        landmarkIds: ['mist_tablet_hill', 'opened_ancient_tomb', 'abyssal_seal_break'],
        locationWeightBoost: 1.5
    },
    mysterious_merchant: {
        landmarkIds: ['south_gate_farmland', 'hunter_boardwalk', 'drowned_bell_coast', 'obsidian_keep_gate'],
        locationWeightBoost: 1.25
    },
    dice_demon: {
        landmarkIds: ['hunter_boardwalk', 'mist_tablet_hill', 'black_iron_storehouse'],
        locationWeightBoost: 1.3
    },
    wandering_blacksmith: {
        landmarkIds: ['south_gate_farmland', 'broken_horn_camp', 'obsidian_keep_gate', 'northern_drake_watch'],
        locationWeightBoost: 1.35
    },
    fairy_deal: {
        landmarkIds: ['hunter_boardwalk', 'rotroot_ravine', 'moon_moss_slope', 'thorn_glasshouse_ruin'],
        locationWeightBoost: 1.35
    },
    mysterious_statue: {
        landmarkIds: ['mist_tablet_hill', 'opened_ancient_tomb', 'sunken_altar_reef', 'charred_obelisk'],
        locationWeightBoost: 1.35
    },
    dimensional_rift: {
        landmarkIds: ['dragon_heat_crag', 'abyssal_seal_break', 'charred_obelisk'],
        locationWeightBoost: 1.6
    },
    foragers_emergency_stash: {
        landmarkIds: ['south_gate_farmland', 'hunter_boardwalk', 'broken_horn_camp', 'rotroot_ravine'],
        locationWeightBoost: 1.35
    },
    leyline_splinter: {
        landmarkIds: ['rotroot_ravine', 'mist_tablet_hill', 'drowned_bell_coast', 'abyssal_seal_break'],
        locationWeightBoost: 1.45
    },
    ash_scout_report: {
        landmarkIds: ['obsidian_keep_gate', 'black_iron_storehouse', 'abyssal_seal_break'],
        locationWeightBoost: 1.5
    },
    abandoned_blueprint_cache: {
        landmarkIds: ['south_gate_farmland', 'hunter_boardwalk', 'rotroot_ravine', 'mist_tablet_hill'],
        locationWeightBoost: 1.5
    },
    field_notice_board: {
        landmarkIds: ['south_gate_farmland'],
        locationWeightBoost: 1.8
    },
    special_bounty_notice: {
        landmarkIds: ['broken_horn_camp', 'moon_moss_slope', 'obsidian_keep_gate'],
        locationWeightBoost: 1.8
    },
    weathered_route_tablet: {
        landmarkIds: ['mist_tablet_hill', 'opened_ancient_tomb', 'sunken_altar_reef'],
        locationWeightBoost: 1.8
    },
    south_gate_patrol_marks: {
        landmarkIds: ['south_gate_farmland', 'cut_roadsign'],
        locationWeightBoost: 2
    },
    hunter_tripwire_cache: {
        landmarkIds: ['hunter_boardwalk', 'old_campfire_site', 'cut_roadsign', 'silver_snare_pass'],
        locationWeightBoost: 2
    },
    muddy_supply_cart: {
        landmarkIds: ['south_gate_farmland', 'broken_horn_camp', 'rotroot_ravine'],
        locationWeightBoost: 1.4
    },
    thorn_toll_roots: {
        landmarkIds: ['thorn_glasshouse_ruin', 'rotroot_ravine'],
        locationWeightBoost: 1.8
    },
    drowned_lantern_line: {
        landmarkIds: ['drowned_bell_coast', 'sunken_altar_reef'],
        locationWeightBoost: 1.8
    },
    obsidian_deserter_map: {
        landmarkIds: ['obsidian_keep_gate', 'black_iron_storehouse'],
        locationWeightBoost: 1.8
    },
    refugee_cart_repair: {
        landmarkIds: ['obsidian_keep_gate', 'black_iron_storehouse', 'abyssal_seal_break'],
        locationWeightBoost: 1.5
    },
    dragon_heat_haze: {
        landmarkIds: ['northern_drake_watch', 'dragon_heat_crag', 'charred_obelisk', 'abyssal_seal_break'],
        locationWeightBoost: 1.8
    },
    mist_tablet_cipher: {
        landmarkIds: ['mist_tablet_hill', 'opened_ancient_tomb', 'charred_obelisk'],
        locationWeightBoost: 1.75
    },
    coast_salvage_tide: {
        landmarkIds: ['drowned_bell_coast', 'sunken_altar_reef'],
        locationWeightBoost: 1.7
    },
    black_iron_checkpoint: {
        landmarkIds: ['obsidian_keep_gate', 'black_iron_storehouse'],
        locationWeightBoost: 1.75
    },
    northbound_whiteout_cache: {
        landmarkIds: ['northern_drake_watch', 'dragon_heat_crag'],
        locationWeightBoost: 1.6
    },
    abyssal_name_echo: {
        landmarkIds: ['abyssal_seal_break', 'charred_obelisk'],
        locationWeightBoost: 1.75
    },
    last_campfire_before_north: {
        landmarkIds: ['northern_drake_watch', 'dragon_heat_crag', 'charred_obelisk'],
        locationWeightBoost: 1.5
    },
    boss_shadow_column: {
        landmarkIds: ['charred_obelisk', 'abyssal_seal_break', 'dragon_heat_crag'],
        locationWeightBoost: 1.6
    },
    boss_abyssal_march: {
        landmarkIds: ['abyssal_seal_break', 'charred_obelisk'],
        locationWeightBoost: 1.7
    },
    boss_dragon_nest_spoil: {
        landmarkIds: ['dragon_heat_crag', 'charred_obelisk'],
        locationWeightBoost: 1.6
    },
    injured_adventurer: {
        landmarkIds: ['hunter_boardwalk', 'old_wolf_den', 'broken_horn_camp', 'obsidian_keep_gate', 'northern_drake_watch'],
        locationWeightBoost: 1.4
    },
    ancient_guardian: {
        landmarkIds: ['mist_tablet_hill', 'opened_ancient_tomb', 'sunken_altar_reef'],
        locationWeightBoost: 1.5
    }
};

const EVENT_CONTENT_OVERRIDES = {
    ancient_shrine: {
        name: '路邊小神龕',
        icon: '🕯️',
        description: '一座被樹根托住的小神龕立在路邊，供燭早就熄了，灰裡卻還有一點溫度。',
        choices: [
            { text: '整理供燭', intent: '花點時間讓火光重新穩住，也讓自己喘口氣。' },
            { text: '投入金幣祈願', intent: '用一點代價換取路上的直覺與庇護。' },
            { text: '安靜離開', intent: '不打擾這座沉默的小神龕。' }
        ]
    },
    healing_spring: {
        name: '冷泉石盆',
        icon: '💧',
        description: '裂石中滲出一口冷泉，水面映著天空，偶爾浮起幾粒像灰燼的光點。',
        choices: [
            { text: '清洗傷口', intent: '泉水冰得刺骨，但或許能讓傷勢穩定。' },
            { text: '浸潤武器', intent: '把武器放進泉中，讓冷光短暫附著。' }
        ]
    },
    cursed_chest: {
        name: '黑鎖木箱',
        icon: '🧰',
        description: '一只木箱半埋在泥裡，鎖孔周圍有焦黑指痕。它看起來像獎勵，也像陷阱。',
        choices: [
            { text: '直接撬開', intent: '快一點，也粗暴一點。' },
            { text: '先解除黑鎖', intent: '多花點時間，試著避開箱上的詛咒。' },
            { text: '放著別碰', intent: '不是每個箱子都值得打開。' }
        ]
    },
    dark_spirit: {
        name: '低語黑影',
        icon: '🌑',
        description: '霧裡站著一道瘦長黑影，牠沒有臉，卻能準確叫出你的名字。',
        choices: [
            { text: '接受黑影的贈禮', intent: '力量會來得很快，代價也可能跟著來。' },
            { text: '逼問黑影來歷', intent: '把恐懼壓住，從牠的話裡挖出情報。' },
            { text: '拔腿離開', intent: '有些聲音不回答就會變小。' }
        ]
    },
    mysterious_merchant: {
        name: '披斗篷的行商',
        icon: '🧳',
        description: '行商推著小車從路旁冒出來，笑容熱情得很可疑。他說今天只賣「剛好派得上用場」的東西。',
        choices: [
            { text: '買一只封蠟小袋', intent: '袋子不透明，行商也不肯保證裡面不是石頭。' },
            { text: '挑一件補給', intent: '看起來至少不是完全沒用。' },
            { text: '謝絕推銷', intent: '錢包暫時比好奇心重要。' }
        ]
    },
    dice_demon: {
        name: '骰子惡魔',
        icon: '🎲',
        description: '一隻小惡魔坐在石頭上晃腿，手裡的骰子像會自己呼吸。牠邀你賭一把。',
        choices: [
            { text: '小賭一局', intent: '輸了不至於崩盤，贏了也足夠開心。' },
            { text: '押大一點', intent: '風險更高，回報也更亮眼。' },
            { text: '拒絕牠', intent: '惡魔的娛樂通常不是人的好事。' }
        ]
    },
    wandering_blacksmith: {
        name: '流浪補鐵匠',
        icon: '🔨',
        description: '一名背著小砧的鐵匠在路邊升起爐火。他說可以修，但先聲明「好看不在服務範圍內」。',
        choices: [
            { text: '打磨武器', intent: '讓武器短時間內更順手。' },
            { text: '修補護具', intent: '補上幾片不太對稱但很實用的鐵片。' },
            { text: '購買邊角料', intent: '把他挑剩的材料帶回去，也許鍛造師能救。' },
            { text: '只是借火休息', intent: '爐火至少比夜風友善。' }
        ]
    },
    fairy_deal: {
        name: '碎光妖精',
        icon: '✨',
        description: '一團碎光繞著你飛，聲音細得像銀針。牠願意幫忙，但牠的「幫忙」聽起來很即興。',
        choices: [
            { text: '請牠祝福武器', intent: '讓攻擊短暫變得輕快。' },
            { text: '請牠護住身體', intent: '換一層薄薄的防護光膜。' },
            { text: '請牠處理傷口', intent: '希望牠分得清治療和發光。' },
            { text: '揮手道別', intent: '禮貌離開，避免被當成玩具。' }
        ]
    },
    mysterious_statue: {
        name: '無名石像',
        icon: '🗿',
        description: '石像立在霧裡，臉被歲月磨平，只剩掌心刻著三道看不懂的線。',
        choices: [
            { text: '觸碰掌心刻線', intent: '讓石像決定給你什麼。' },
            { text: '解讀底座文字', intent: '嘗試從舊文字中找出規律。' },
            { text: '繞路離開', intent: '石像還是留給比較勇敢的人。' }
        ]
    },
    dimensional_rift: {
        name: '裂隙回聲',
        icon: '🌀',
        description: '空氣像布一樣裂開，裂口另一邊傳來熟悉又陌生的腳步聲。',
        choices: [
            { text: '伸手取物', intent: '趁裂隙還沒閉合，抓住裡面的東西。' },
            { text: '投入金幣測試', intent: '看看裂隙會吐回什麼。' },
            { text: '立刻退開', intent: '你的手暫時還想留在原本的世界。' }
        ]
    },
    foragers_emergency_stash: {
        name: '採集者急藏包',
        icon: '🎒',
        description: '樹根下藏著一只防水布包，旁邊壓著採集者的記號：急用可取，活著再還。',
        choices: [
            { text: '取走乾糧', intent: '先把命顧好，欠條以後再說。' },
            { text: '取走材料', intent: '挑出能鍛造或換補給的東西。' },
            { text: '只記下路標', intent: '不拿東西，但把採集者的路線記進腦中。' }
        ]
    },
    leyline_splinter: {
        name: '地脈碎光',
        icon: '💠',
        description: '地面裂縫裡浮出細小光片，像被扯斷的線還在努力記得原本連向哪裡。',
        choices: [
            { text: '收集碎光', intent: '能量不穩，但也許能成為素材。' },
            { text: '觀察流向', intent: '從光的方向判斷地脈正在往哪裡塌陷。' },
            { text: '離遠一點', intent: '別把手伸進正在壞掉的世界裡。' }
        ]
    },
    ash_scout_report: {
        name: '焦灰斥候報告',
        icon: '📜',
        description: '半張燒焦的斥候報告卡在石縫裡，字跡被灰吞掉一半，剩下的一半全是壞消息。',
        choices: [
            { text: '整理可讀內容', intent: '把危險區域與行軍規律記下。' },
            { text: '翻找焦灰', intent: '報告旁也許還有可用物資。' },
            { text: '收起殘頁', intent: '先帶走，回城後再找人讀。' }
        ]
    },
    abandoned_blueprint_cache: {
        name: '棄置圖紙匣',
        icon: '📐',
        description: '草叢裡露出一角防水木匣，鎖扣被泥封住，上面有鍛造師常用的記號。',
        choices: [
            { text: '撬開木匣', intent: '取得裡面的圖紙線索，並把它記進旅人手札。' },
            { text: '暫時不碰', intent: '把位置記住，先處理眼前的路。' }
        ]
    },
    field_notice_board: {
        name: '臨時公告牌',
        icon: '📌',
        description: '南門外插著一塊臨時公告牌，紙張被風扯得歪斜，墨水還沒完全乾。',
        choices: [
            { text: '讀完公告', intent: '把城鎮最新的委託與異常記錄下來。' },
            { text: '先不理會', intent: '現在的你只想確認路還能不能走。' }
        ]
    },
    special_bounty_notice: {
        name: '破角懸賞紙',
        icon: '📜',
        description: '一張懸賞紙被釘在木樁上，邊角有血乾後留下的硬褐色。內容沒有座標，只寫著破角與月光。',
        choices: [
            { text: '收下懸賞紙', intent: '把這則傳聞收進手札，之後找人比對。' },
            { text: '留在原處', intent: '現在還不是追這條線的時候。' }
        ]
    },
    weathered_route_tablet: {
        name: '風化路碑',
        icon: '🪨',
        description: '石碑被雨水磨得發白，只有幾個符號還很清楚：霧、骨、封印。',
        choices: [
            { text: '拓下碑文', intent: '收集文字碎片，等線索足夠時再解讀。' },
            { text: '只記下方位', intent: '先把路線記起來，不急著碰那些符號。' }
        ]
    },
    south_gate_patrol_marks: {
        name: '南門巡路痕',
        icon: '🚩',
        description: '地上有巡守留下的粉筆箭頭，幾處被泥踩亂，看起來有人匆忙改過路線。',
        choices: [
            { text: '扶正路標', intent: '整理可通行的路線，讓回城方向更清楚。' },
            { text: '拆下鬆動木片', intent: '取走還能用的材料，但可能被尖釘劃傷。' },
            { text: '記進旅途紀錄', intent: '不動現場，只把路線記下。' }
        ]
    },
    hunter_tripwire_cache: {
        name: '銀絲絆線',
        icon: '🪤',
        description: '兩棵樹之間有細到幾乎看不見的銀絲。旁邊的獵具匣被打開過，像有人故意留下邀請。',
        choices: [
            { text: '拆下絆線', intent: '安全取得材料，也確認這不是普通獵人的手法。' },
            { text: '翻找獵具匣', intent: '可能有更好的零件，也可能觸發殘留機關。' },
            { text: '原樣離開', intent: '別讓獵物變成自己。' }
        ]
    },
    muddy_supply_cart: {
        name: '陷泥補給車',
        icon: '🛞',
        description: '一輛補給車卡在泥地裡，車主正在和輪子講道理，聽起來雙方都不太服氣。',
        choices: [
            { text: '幫忙推車', intent: '花點體力換取報酬與路線經驗。' },
            { text: '買下壞掉零件', intent: '把看似沒用的零件帶回去鍛造。' },
            { text: '指路脫困', intent: '用觀察到的地形幫車主找出路。' }
        ]
    },
    thorn_toll_roots: {
        name: '荊棘過路根',
        icon: '🌿',
        description: '一排荊棘根攔在路上，刺上掛著小小露珠，像在等人付過路費。',
        choices: [
            { text: '支付過路費', intent: '用金幣換取安全通行，也看懂女巫的交易規則。' },
            { text: '砍開荊棘', intent: '強行取材，但荊棘會記仇。' },
            { text: '觀察刺結排列', intent: '不急著通過，先理解這些刺想表達什麼。' }
        ]
    },
    drowned_lantern_line: {
        name: '溺水燈線',
        icon: '🏮',
        description: '一串燈沿著濕地延伸，火光被水氣壓得很低，遠處隱約傳來沉鐘聲。',
        choices: [
            { text: '調整燈線節奏', intent: '把燈火與鐘聲對上，辨認海岸的方向。' },
            { text: '收集燈油', intent: '拿走可用材料，但濕冷會滲進護具。' },
            { text: '熄掉一盞燈', intent: '讓周圍安靜下來，換一點喘息。' }
        ]
    },
    obsidian_deserter_map: {
        name: '黑曜逃兵地圖',
        icon: '🗺️',
        description: '一名灰頭土臉的人躲在石後，反覆聲稱自己只是「提前離職」。他手裡攥著要塞地圖。',
        choices: [
            { text: '聽他說完', intent: '從混亂證詞中整理男爵要塞的資訊。' },
            { text: '買下地圖', intent: '用金幣換取伏擊點與地宮線索。' },
            { text: '指他回城', intent: '讓他離開荒野，也許城鎮會多一個證人。' }
        ]
    },
    refugee_cart_repair: {
        name: '避難者壞車',
        icon: '🧰',
        description: '一群避難者推著壞車停在路邊，孩子抱著木鳥，老人把剩下的湯分成太多份。',
        choices: [
            { text: '出錢修車', intent: '幫他們繼續往城鎮走，也換來一點補給。' },
            { text: '收下壞鐵件', intent: '取得材料，但這份材料拿起來很沉。' },
            { text: '標出撤退路線', intent: '不花金幣，用路線知識幫他們避開危險。' }
        ]
    },
    dragon_heat_haze: {
        name: '龍焰熱霾',
        icon: '🔥',
        description: '前方空氣被熱浪扭曲，岩石表面浮出焦黑鱗紋，像某種巨大生物剛剛呼吸過。',
        choices: [
            { text: '硬闖熱霾', intent: '承受灼傷，換取對龍焰週期的理解。' },
            { text: '臨時隔熱', intent: '花費金幣做一層簡陋防護。' },
            { text: '觀察熱浪節奏', intent: '先讀懂它，再決定怎麼走。' }
        ]
    },
    last_campfire_before_north: {
        name: '北境前的最後營火',
        icon: '🔥',
        description: '一堆很小的營火在風裡撐著，旁邊刻著幾行字：害怕可以，停下不行。',
        choices: [
            { text: '靠火休息', intent: '讓身體回溫，記得自己還活著。' },
            { text: '讀完留言', intent: '從前人的恐懼裡得到一點勇氣。' },
            { text: '留下自己的記號', intent: '也許下一個人會看到，也許那個人就是你。' }
        ]
    },
    injured_adventurer: {
        name: '受傷冒險者',
        icon: '🩹',
        description: '一名冒險者靠在石邊，傷口用布條亂綁。他努力裝得很從容，但臉色完全不同意。',
        choices: [
            { text: '幫他包紮', intent: '救人一命，也許會換來感謝。' },
            { text: '翻找散落物', intent: '他昏得很沉，這選項不太光彩。' },
            { text: '指出回城路', intent: '至少讓他知道該往哪裡走。' }
        ]
    },
    ancient_guardian: {
        name: '古代守衛試煉',
        icon: '🛡️',
        description: '一具古代守衛從石座上抬頭，眼中的光掃過你，像在判定你是不是該被清除。',
        choices: [
            { text: '接受攻擊試煉', intent: '用武器證明你不是污染源。' },
            { text: '接受防禦試煉', intent: '站穩腳步，承受守衛的壓力。' },
            { text: '低頭致意', intent: '用最不像威脅的方式通過。' }
        ]
    }
};

const CLEAN_EVENT_CONTENT_OVERRIDES = {
    ancient_shrine: {
        name: '半塌的路邊神龕',
        icon: '⛩️',
        description: '荒草裡露出一座傾斜神龕，供盤空著，石縫卻還有微光。也許有人在很久以前，把求生的願望塞進了這裡。',
        choices: [
            { text: '整理供盤', intent: '花一點時間修整神龕，換取短暫庇護。' },
            { text: '留下金幣祈願', intent: '用金幣換取經驗與幸運，風險很低。' },
            { text: '安靜離開', intent: '不打擾這處舊信仰。' }
        ]
    },
    healing_spring: {
        name: '微光泉眼',
        icon: '💧',
        description: '水從石縫裡滲出，帶著淡淡藥草味。附近沒有腳印，只有幾片被仔細洗淨的布條掛在枝上。',
        choices: [
            { text: '清洗傷口', intent: '恢復生命，適合長途探索前整理狀態。' },
            { text: '裝瓶帶走一點泉水', intent: '讓身體短時間變得更有力。' }
        ]
    },
    cursed_chest: {
        name: '鎖鏈舊箱',
        icon: '🧰',
        description: '箱蓋被黑色鎖鏈纏住，鏈節上刻著不屬於王國的文字。它不像寶箱，更像某人故意留下的試探。',
        choices: [
            { text: '直接撬開', intent: '可能取得金幣，但會招來詛咒。' },
            { text: '花錢解除鎖鏈', intent: '成本較高，回報也比較穩定。' },
            { text: '不要碰它', intent: '不是每個亮點都值得打開。' }
        ]
    },
    dark_spirit: {
        name: '低語黑影',
        icon: '🕯️',
        description: '你聽見有人在背後叫你的名字。回頭時，只有一團貼著地面的影子，像在等待你先承認自己害怕。',
        choices: [
            { text: '用疼痛換取力量', intent: '犧牲生命，換取攻擊強化。' },
            { text: '用金幣買下沉默', intent: '支付金幣，取得經驗。' },
            { text: '斬開影子', intent: '可能受傷，但能立刻結束糾纏。' }
        ]
    },
    mysterious_merchant: {
        name: '披斗篷的行商',
        icon: '🎒',
        description: '行商把包袱攤在路旁，所有瓶罐都沒有標籤。他說這不是賭博，只是「讓命運節省包裝成本」。',
        choices: [
            { text: '買小包裹', intent: '低成本嘗試，可能賺到金幣。' },
            { text: '買沉重包裹', intent: '花更多金幣，可能取得稀有材料。' },
            { text: '婉拒交易', intent: '保留資源，繼續上路。' }
        ]
    },
    dice_demon: {
        name: '笑面骰客',
        icon: '🎲',
        description: '一名旅人坐在斷石上擲骰，骰子每次落下都多一個面。他說輸了只會痛一下，贏了會痛快一點。',
        choices: [
            { text: '押一枚小注', intent: '小額賭局，可能得金幣或受傷。' },
            { text: '押一枚重注', intent: '風險更高，回報也更高。' },
            { text: '收起錢袋', intent: '今天不把人生交給骰子。' }
        ]
    },
    wandering_blacksmith: {
        name: '流動磨刃匠',
        icon: '🛠️',
        description: '一名背著磨石的匠人蹲在路邊，火星落在濕泥裡很快熄滅。他說只收現金，不收「打完首領再給」。',
        choices: [
            { text: '請他磨利武器', intent: '花金幣取得攻擊強化。' },
            { text: '請他補強護具', intent: '花金幣取得防禦強化。' },
            { text: '買一包邊角料', intent: '取得中階材料，適合鍛造缺口。' },
            { text: '道謝離開', intent: '不消耗資源。' }
        ]
    },
    fairy_deal: {
        name: '林間微光交易',
        icon: '✨',
        description: '一圈光點在樹根間轉動，像有人把夜色剪成碎片。它們願意交換祝福，但只接受很實際的金幣。',
        choices: [
            { text: '交換攻擊祝福', intent: '短時間提高攻擊。' },
            { text: '交換防禦祝福', intent: '短時間提高防禦。' },
            { text: '交換療癒祝福', intent: '恢復生命並獲得一點幸運。' },
            { text: '不伸手', intent: '避免被微光牽著走。' }
        ]
    },
    mysterious_statue: {
        name: '無名石像',
        icon: '🗿',
        description: '石像沒有臉，胸口卻有掌印般的凹痕。你靠近時，周圍的聲音像被什麼東西收走了。',
        choices: [
            { text: '按上掌印', intent: '隨機事件，可能獲益也可能受傷。' },
            { text: '投下金幣', intent: '以小額金幣換取經驗。' },
            { text: '記下形狀', intent: '保留這個不舒服的印象。' }
        ]
    },
    dimensional_rift: {
        name: '裂開的空氣',
        icon: '🌀',
        description: '半空出現一道薄薄裂痕，邊緣像被燒焦的紙。裂縫另一邊傳來很遠的鐘聲，也可能只是你的耳鳴。',
        choices: [
            { text: '伸手探入裂縫', intent: '高風險隨機事件，可能取得強力回報。' },
            { text: '丟入金幣測試', intent: '用少量金幣換取較低風險的結果。' },
            { text: '退後觀察', intent: '不碰深淵的便宜。' }
        ]
    },
    foragers_emergency_stash: {
        name: '採集者急藏包',
        icon: '🎒',
        description: '灌木下壓著一只防水布包，外側繫著採集者常用的紅線。它看起來像求救，也像陷阱。',
        choices: [
            { text: '只取急救物', intent: '恢復生命，留下大部分補給。' },
            { text: '翻找材料', intent: '取得材料，但可能留下壞名聲。' },
            { text: '重新藏好', intent: '不拿東西，獲得少量經驗。' }
        ]
    },
    leyline_splinter: {
        name: '地脈碎光',
        icon: '🔷',
        description: '泥土裡滲出細碎藍光，像大地正在漏血。你靠近時，手背上的汗毛全都立了起來。',
        choices: [
            { text: '收集碎光', intent: '可能取得素材，也可能承受地脈反噬。' },
            { text: '標記位置', intent: '取得經驗，替之後調查留下記錄。' },
            { text: '快速離開', intent: '避免被不穩定魔力捲入。' }
        ]
    },
    ash_scout_report: {
        name: '焦邊偵察紙',
        icon: '📄',
        description: '一張被火燎過的紙卡在石縫裡，上面有軍用記號與潦草箭頭。最後一行只有兩個字：別信。',
        choices: [
            { text: '讀完路線', intent: '取得世界情報與推進方向。' },
            { text: '撕下可用部分', intent: '可能取得材料。' },
            { text: '燒掉殘紙', intent: '避免被追蹤。' }
        ]
    },
    abandoned_blueprint_cache: {
        name: '廢棄圖紙匣',
        icon: '📦',
        description: '木匣卡在倒樹底下，裡面不是完整圖紙，而是幾張被雨水泡皺的鍛造註記。',
        choices: [
            { text: '仔細翻找', intent: '可能取得材料或鍛造線索。' },
            { text: '只記下標記', intent: '保留資訊，不冒著弄壞紙張的風險。' }
        ]
    },
    field_notice_board: {
        name: '野外告示牌',
        icon: '📌',
        description: '一塊臨時木牌插在路邊，紙條被雨打得捲曲。字跡很急，像是貼告示的人不敢在這裡久留。',
        choices: [
            { text: '讀完告示', intent: '取得附近傳聞，可能打開支線或首領痕跡。' },
            { text: '取下破紙角', intent: '留下物證，之後能回城比對。' }
        ]
    },
    special_bounty_notice: {
        name: '加急懸賞單',
        icon: '📜',
        description: '這張懸賞單蓋了三個不同單位的章，金額被反覆塗改。真正有價值的不是賞金，而是它提到的地名。',
        choices: [
            { text: '記下懸賞內容', intent: '取得委託與首領相關線索。' },
            { text: '觀察塗改處', intent: '可能看出被隱藏的目的。' }
        ]
    },
    weathered_route_tablet: {
        name: '風化路碑',
        icon: '🪧',
        description: '路碑上刻著舊時代的方向詞，一半被藤根吃進土裡。你得把殘字和附近地形對起來。',
        choices: [
            { text: '拓下碑文', intent: '取得世界見聞或首領謎題線索。' },
            { text: '按地形重排方向', intent: '可能推進地圖謎題。' }
        ]
    },
    south_gate_patrol_marks: {
        name: '南門巡守刻痕',
        icon: '🪧',
        description: '木樁上有巡守隊留下的短刻痕，深淺不一。看起來像記錄哪條路還能通，哪條路只是看起來能走。',
        choices: [
            { text: '比對刻痕方向', intent: '推進南門初期路線，讓探索更清楚。' },
            { text: '收起斷裂木片', intent: '取得材料，但不一定有用。' },
            { text: '照原樣放回', intent: '不破壞巡守留下的標記。' }
        ]
    },
    hunter_tripwire_cache: {
        name: '獵人絆線包',
        icon: '🪤',
        description: '幾捆細線藏在樹根間，旁邊有被切開的誘餌鉤。這不是普通獵具，更像有人在研究如何反制伏擊。',
        choices: [
            { text: '拆出可用絆線', intent: '可能取得材料，並理解伏獵者的路線。' },
            { text: '試著重組誘餌鉤', intent: '可能推進銀鐮伏獵者的觸發條件。' },
            { text: '保持現場', intent: '不改變陷阱狀態。' }
        ]
    },
    muddy_supply_cart: {
        name: '陷泥補給車',
        icon: '🛒',
        description: '一輛補給車斜陷在泥裡，車輪旁全是急促腳印。貨物還在，車主卻像突然被什麼聲音叫走。',
        choices: [
            { text: '扶正車輪', intent: '花時間換取恢復或友善回報。' },
            { text: '取走散落材料', intent: '取得材料，但可能承擔一點代價。' },
            { text: '留下路標', intent: '取得經驗，讓後來者避開泥坑。' }
        ]
    },
    thorn_toll_roots: {
        name: '荊棘收費根',
        icon: '🌿',
        description: '根鬚橫過小路，尖刺上掛著銅幣、藥草與一小片染血布料。女巫的規矩顯然比王國稅官還細。',
        choices: [
            { text: '照規矩交換', intent: '用資源換取女巫線索或捷徑。' },
            { text: '砍斷根鬚', intent: '可能遭到反噬，但能破壞規則。' },
            { text: '觀察交換物順序', intent: '推進荊棘女巫的謎題。' }
        ]
    },
    drowned_lantern_line: {
        name: '浮沉燈繩',
        icon: '🏮',
        description: '幾盞濕透的燈沿著潮線忽明忽暗，燈繩不是被綁住，而像被海水從另一端慢慢拉緊。',
        choices: [
            { text: '跟著燈繩走', intent: '靠近沉鐘線索，但可能遇到危險。' },
            { text: '撈起一盞燈', intent: '取得素材或水聲提示。' },
            { text: '聽它們的節奏', intent: '推進沉鐘神諭的謎題。' }
        ]
    },
    obsidian_deserter_map: {
        name: '逃兵黑曜地圖',
        icon: '🗺️',
        description: '地圖被折得很小，藏在石頭底下。上面標著補給線、黑鐵倉門，還有一句：男爵不會救任何人。',
        choices: [
            { text: '記下運貨路線', intent: '推進灰燼男爵情報。' },
            { text: '收下地圖碎片', intent: '取得世界見聞或材料。' },
            { text: '把地圖壓回原處', intent: '不留下你來過的痕跡。' }
        ]
    },
    refugee_cart_repair: {
        name: '難民破車',
        icon: '🧰',
        description: '破車旁坐著幾名沉默的人，行李少得不合理。車轅斷了，他們的耐心也快斷了。',
        choices: [
            { text: '幫忙修車', intent: '花時間換取支線或城鎮狀態變化。' },
            { text: '分一些材料', intent: '消耗物資，換取故事回饋。' },
            { text: '指一條安全路', intent: '取得經驗，讓他們離開危險區。' }
        ]
    },
    dragon_heat_haze: {
        name: '龍熱蜃影',
        icon: '🔥',
        description: '遠方空氣像玻璃一樣彎曲，熱浪裡短暫浮現爪痕與巨大陰影。它不在這裡，但它留下的溫度在追人。',
        choices: [
            { text: '收集熱痕', intent: '推進古龍追蹤，也可能損耗狀態。' },
            { text: '用布包住熱石', intent: '可能取得材料。' },
            { text: '繞開熱浪', intent: '避免被終局壓力拖住。' }
        ]
    },
    last_campfire_before_north: {
        name: '北行前的最後營火',
        icon: '🔥',
        description: '營火早就熄了，灰燼卻還溫熱。木牌上刻著很多名字，最後一行空著，像留給下一個人。',
        choices: [
            { text: '重新點火休整', intent: '恢復狀態，準備進入高壓區。' },
            { text: '讀完刻名', intent: '取得世界見聞。' },
            { text: '添上一段警語', intent: '留下紀錄，獲得少量經驗。' }
        ]
    },
    injured_adventurer: {
        name: '受傷冒險者',
        icon: '🩹',
        description: '一名冒險者靠著石頭喘氣，手裡抓著半張地圖。他一看見你，先確認你有沒有帶藥，再確認你是不是人。',
        choices: [
            { text: '替他包紮', intent: '可能恢復生命或換取情報。' },
            { text: '詢問前方情況', intent: '取得路線與危險提示。' },
            { text: '扶他回安全處', intent: '花時間換取經驗或城鎮回饋。' }
        ]
    },
    ancient_guardian: {
        name: '古代守衛殘像',
        icon: '🛡️',
        description: '一道半透明守衛投影擋在路中央，反覆執行已經失效的巡邏指令。它看不見你，只看見「污染源」。',
        choices: [
            { text: '正面通過', intent: '高風險，可能換取強化。' },
            { text: '模仿古代手勢', intent: '嘗試解謎，可能降低風險。' },
            { text: '繞路離開', intent: '保留狀態，不碰遺跡防衛。' }
        ]
    }
};

function describeCleanResult(result = {}) {
    switch (result.type) {
        case ResultType.GOLD:
            return result.value > 0 ? `獲得 ${result.value}G。` : '金幣沒有變化。';
        case ResultType.HEAL:
            return result.isPercent
                ? `恢復 ${Math.round((Number(result.value) || 0) * 100)}% 生命。`
                : `恢復 ${result.value} 生命。`;
        case ResultType.DAMAGE:
            return `受到 ${result.value} 點傷害。`;
        case ResultType.BUFF:
            return '短時間獲得戰鬥強化。';
        case ResultType.DEBUFF:
            return '短時間承受不利狀態。';
        case ResultType.STAT:
            return '能力值產生變化。';
        case ResultType.EXP:
            return `獲得 ${result.value} 經驗。`;
        case ResultType.ITEM:
            return '獲得一件可用物資。';
        case ResultType.UNLOCK_QUEST:
            return '新的委託或線索已被記錄。';
        case ResultType.WORLD_INTERACTION:
            return '世界狀態產生了新的變化。';
        default:
            return result.message || null;
    }
}

const BUFF_LABELS = {
    atk: '攻擊',
    def: '防禦',
    luck: '直覺'
};

function describeResult(result = {}) {
    switch (result.type) {
        case ResultType.GOLD:
            return result.value > 0 ? `獲得 ${result.value}G。` : '沒有找到可用金幣。';
        case ResultType.HEAL:
            return result.isPercent
                ? `恢復 ${Math.round((Number(result.value) || 0) * 100)}% 生命。`
                : `恢復 ${result.value} 生命。`;
        case ResultType.DAMAGE:
            return `受到 ${result.value} 點傷害。`;
        case ResultType.BUFF:
            return `${BUFF_LABELS[result.buffType] || '能力'}暫時提升。`;
        case ResultType.DEBUFF:
            return `${BUFF_LABELS[result.buffType] || '能力'}暫時下降。`;
        case ResultType.STAT:
            return '能力值發生變化。';
        case ResultType.EXP:
            return `獲得 ${result.value} 經驗。`;
        case ResultType.ITEM:
            return '取得一份可用物資。';
        case ResultType.UNLOCK_QUEST:
            return '新的委託已被記錄。';
        case ResultType.WORLD_INTERACTION:
            return '新的發現已記入旅人手札。';
        default:
            return result.message || null;
    }
}

function cleanResultMessages(results = []) {
    for (const result of results) {
        const message = describeCleanResult(result);
        if (message) result.message = message;
    }
}

function applyCleanEventText(event) {
    const override = CLEAN_EVENT_CONTENT_OVERRIDES[event.id] || EVENT_CONTENT_OVERRIDES[event.id];
    if (override) {
        for (const key of ['name', 'icon', 'description']) {
            if (override[key]) event[key] = override[key];
        }

        if (Array.isArray(override.choices) && Array.isArray(event.choices)) {
            event.choices = event.choices.map((choice, index) => ({
                ...choice,
                ...(override.choices[index] || {})
            }));
        }
    }

    if (Array.isArray(event.choices)) {
        for (const choice of event.choices) {
            cleanResultMessages(choice.results);
            cleanResultMessages(choice.successResults);
            cleanResultMessages(choice.failResults);
            if (Array.isArray(choice.randomResults)) {
                for (const option of choice.randomResults) {
                    cleanResultMessages(option.results);
                }
            }
        }
    }
}

function getDefaultRepeatPolicy(eventRole) {
    switch (eventRole) {
        case EventRole.STORY_SEED:
        case EventRole.SIDE_STORY:
            return 'one_time';
        case EventRole.WORLD_LORE:
            return 'chapter_once';
        default:
            return 'repeatable';
    }
}

function getDefaultCooldownSteps(eventRole) {
    switch (eventRole) {
        case EventRole.RESOURCE:
            return 9;
        case EventRole.RISK_REWARD:
        case EventRole.TRADE:
            return 12;
        case EventRole.PRESSURE:
            return 16;
        default:
            return 0;
    }
}

for (const event of EventDatabase) {
    Object.assign(event, {
        eventRole: EventRole.RESOURCE,
        chapterRange: [1, 3]
    }, EVENT_STORY_RULES[event.id] || {}, EVENT_LOCATION_RULES[event.id] || {});

    if (!event.repeatPolicy) {
        event.repeatPolicy = getDefaultRepeatPolicy(event.eventRole);
    }

    if (!Number.isFinite(Number(event.cooldownSteps))) {
        event.cooldownSteps = getDefaultCooldownSteps(event.eventRole);
    }

    if (!event.memoryKey) {
        event.memoryKey = event.id;
    }

    applyCleanEventText(event);
}

export function getEventChapterRange(event = {}) {
    const range = Array.isArray(event.chapterRange) ? event.chapterRange : [event.minChapter, event.maxChapter];
    const min = Number(range[0] ?? event.minChapter ?? 1);
    const max = Number(range[1] ?? event.maxChapter ?? 3);
    return {
        min: Number.isFinite(min) ? min : 1,
        max: Number.isFinite(max) ? max : 3
    };
}

export function isEventAllowedInChapter(event = {}, chapter = 1) {
    const numericChapter = Number(chapter);
    const activeChapter = Number.isFinite(numericChapter) ? numericChapter : 1;
    const { min, max } = getEventChapterRange(event);
    return activeChapter >= min && activeChapter <= max;
}

// 根據區域獲取適合的事件
function uniqueStrings(values = []) {
    return [...new Set(values.map(value => String(value || '').trim()).filter(Boolean))];
}

function getContextLandmarkIds(options = {}) {
    return uniqueStrings([
        options.landmarkId,
        options.currentLandmarkId,
        options.nearestLandmarkId,
        ...(Array.isArray(options.nearbyLandmarkIds) ? options.nearbyLandmarkIds : [])
    ]);
}

function isEventAllowedInLocation(event = {}, options = {}) {
    const requiredIds = Array.isArray(event.landmarkIds) ? uniqueStrings(event.landmarkIds) : [];
    if (requiredIds.length === 0) return true;

    const contextIds = getContextLandmarkIds(options);
    if (contextIds.length === 0) return false;
    return requiredIds.some(id => contextIds.includes(id));
}

export function getEventsForZone(zone, options = {}) {
    // 不同區域有不同的事件權重
    const zoneWeights = {
        low: {
            [EventType.BLESSING]: 38,
            [EventType.CURSE]: 8,
            [EventType.GAMBLE]: 8,
            [EventType.TRADE]: 18,
            [EventType.MYSTERY]: 12,
            [EventType.ENCOUNTER]: 16
        },
        medium: {
            [EventType.BLESSING]: 25,
            [EventType.CURSE]: 13,
            [EventType.GAMBLE]: 12,
            [EventType.TRADE]: 18,
            [EventType.MYSTERY]: 18,
            [EventType.ENCOUNTER]: 14
        },
        high: {
            [EventType.BLESSING]: 25,
            [EventType.CURSE]: 20,
            [EventType.GAMBLE]: 15,
            [EventType.TRADE]: 10,
            [EventType.MYSTERY]: 15,
            [EventType.ENCOUNTER]: 15
        },
        death: {
            [EventType.BLESSING]: 12,
            [EventType.CURSE]: 24,
            [EventType.GAMBLE]: 16,
            [EventType.TRADE]: 8,
            [EventType.MYSTERY]: 22,
            [EventType.ENCOUNTER]: 18
        },
        boss: {
            [EventType.BLESSING]: 35,
            [EventType.CURSE]: 25,
            [EventType.MYSTERY]: 20,
            [EventType.ENCOUNTER]: 20
        }
    };
    
    return EventDatabase.filter(event => {
        const weights = zoneWeights[zone] || zoneWeights['low'];
        const zones = Array.isArray(event.zones) ? event.zones : [];
        const chapterAllowed = options.chapter === undefined || isEventAllowedInChapter(event, options.chapter);
        return weights[event.type] !== undefined
            && chapterAllowed
            && isEventAllowedInLocation(event, options)
            && (zones.length === 0 || zones.includes(zone));
    });
}

// 根據權重隨機選擇事件
export function getRandomEvent(zone, options = {}) {
    const events = getEventsForZone(zone, options);
    if (events.length === 0) return null;
    
    return events[Math.floor(Math.random() * events.length)];
}
