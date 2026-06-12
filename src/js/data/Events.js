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
                    { type: ResultType.EXP, value: 25, message: '你理解了泥地、車輪與髒話之間的力學關係。' }
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
                    { type: ResultType.BUFF, buffType: 'luck', value: 3, duration: 10, message: '車主照著你的指示脫困，你也覺得今天可能沒那麼糟。' }
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
                    { type: ResultType.EXP, value: 35, message: '你看出男爵地宮不是避難工程，而是準備好的墳墓。' }
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
                    { type: ResultType.EXP, value: 60, message: '你學會了在世界快裂開時，車輪其實也是一種防線。' }
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
    last_campfire_before_north: { eventRole: EventRole.RESOURCE, chapterRange: [3, 3] },
    injured_adventurer: { eventRole: EventRole.RESOURCE, chapterRange: [1, 3] },
    ancient_guardian: { eventRole: EventRole.RISK_REWARD, chapterRange: [2, 3] }
};

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
            return 7;
        case EventRole.RISK_REWARD:
        case EventRole.TRADE:
        case EventRole.PRESSURE:
            return 10;
        default:
            return 0;
    }
}

for (const event of EventDatabase) {
    Object.assign(event, {
        eventRole: EventRole.RESOURCE,
        chapterRange: [1, 3]
    }, EVENT_STORY_RULES[event.id] || {});

    if (!event.repeatPolicy) {
        event.repeatPolicy = getDefaultRepeatPolicy(event.eventRole);
    }

    if (!Number.isFinite(Number(event.cooldownSteps))) {
        event.cooldownSteps = getDefaultCooldownSteps(event.eventRole);
    }

    if (!event.memoryKey) {
        event.memoryKey = event.id;
    }
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
export function getEventsForZone(zone, options = {}) {
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
        const chapterAllowed = options.chapter === undefined || isEventAllowedInChapter(event, options.chapter);
        return weights[event.type] !== undefined && chapterAllowed && (zones.length === 0 || zones.includes(zone));
    });
}

// 根據權重隨機選擇事件
export function getRandomEvent(zone, options = {}) {
    const events = getEventsForZone(zone, options);
    if (events.length === 0) return null;
    
    return events[Math.floor(Math.random() * events.length)];
}
