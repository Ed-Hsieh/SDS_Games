/**
 * Canonical travel-event records.
 *
 * Every event is defined exactly once in this catalog. Pure eligibility and
 * selection helpers live in Events.js. Reward execution is intentionally absent
 * until the travel-event feature is connected to the authored map flow.
 */

export const EventDatabase = [
    {
        "id": "ancient_shrine",
        "name": "半塌的路邊神龕",
        "icon": "⛩️",
        "type": "blessing",
        "zones": [
            "low",
            "medium",
            "high"
        ],
        "weight": 1.1,
        "description": "荒草裡露出一座傾斜神龕，供盤空著，石縫卻還有微光。也許有人在很久以前，把求生的願望塞進了這裡。",
        "choices": [
            {
                "text": "整理供盤",
                "intent": "花一點時間修整神龕，換取短暫庇護。",
                "results": [
                    {
                        "type": "heal",
                        "value": 0.3,
                        "isPercent": true,
                        "message": "恢復 30% 生命。"
                    },
                    {
                        "type": "buff",
                        "buffType": "def",
                        "value": 5,
                        "duration": 10,
                        "message": "短時間獲得戰鬥強化。"
                    }
                ]
            },
            {
                "text": "留下金幣祈願",
                "intent": "用金幣換取經驗與幸運，風險很低。",
                "cost": {
                    "gold": 50
                },
                "results": [
                    {
                        "type": "exp",
                        "value": 35,
                        "message": "獲得 35 經驗。"
                    },
                    {
                        "type": "buff",
                        "buffType": "luck",
                        "value": 6,
                        "duration": 12,
                        "message": "短時間獲得戰鬥強化。"
                    }
                ]
            },
            {
                "text": "安靜離開",
                "intent": "不打擾這處舊信仰。",
                "results": []
            }
        ],
        "eventRole": "resource",
        "chapterRange": [
            1,
            3
        ],
        "landmarkIds": [
            "mist_tablet_hill",
            "opened_ancient_tomb",
            "sunken_altar_reef"
        ],
        "locationWeightBoost": 1.3,
        "repeatPolicy": "repeatable",
        "cooldownSteps": 9,
        "memoryKey": "ancient_shrine"
    },
    {
        "id": "healing_spring",
        "name": "微光泉眼",
        "icon": "💧",
        "type": "blessing",
        "zones": [
            "low",
            "medium"
        ],
        "weight": 1.2,
        "description": "水從石縫裡滲出，帶著淡淡藥草味。附近沒有腳印，只有幾片被仔細洗淨的布條掛在枝上。",
        "choices": [
            {
                "text": "清洗傷口",
                "intent": "恢復生命，適合長途探索前整理狀態。",
                "results": [
                    {
                        "type": "heal",
                        "value": 0.35,
                        "isPercent": true,
                        "message": "恢復 35% 生命。"
                    }
                ]
            },
            {
                "text": "裝瓶帶走一點泉水",
                "intent": "讓身體短時間變得更有力。",
                "results": [
                    {
                        "type": "buff",
                        "buffType": "atk",
                        "value": 4,
                        "duration": 12,
                        "message": "短時間獲得戰鬥強化。"
                    }
                ]
            }
        ],
        "eventRole": "resource",
        "chapterRange": [
            1,
            2
        ],
        "landmarkIds": [
            "south_gate_farmland",
            "rotroot_ravine",
            "moon_moss_slope"
        ],
        "locationWeightBoost": 1.4,
        "repeatPolicy": "repeatable",
        "cooldownSteps": 9,
        "memoryKey": "healing_spring"
    },
    {
        "id": "cursed_chest",
        "name": "鎖鏈舊箱",
        "icon": "🧰",
        "type": "curse",
        "zones": [
            "medium",
            "high",
            "death"
        ],
        "weight": 0.75,
        "description": "箱蓋被黑色鎖鏈纏住，鏈節上刻著不屬於王國的文字。它不像寶箱，更像某人故意留下的試探。",
        "choices": [
            {
                "text": "直接撬開",
                "intent": "可能取得金幣，但會招來詛咒。",
                "results": [
                    {
                        "type": "gold",
                        "value": 90,
                        "message": "獲得 90G。"
                    },
                    {
                        "type": "debuff",
                        "buffType": "def",
                        "value": -2,
                        "duration": 18,
                        "message": "短時間承受不利狀態。"
                    }
                ]
            },
            {
                "text": "花錢解除鎖鏈",
                "intent": "成本較高，回報也比較穩定。",
                "cost": {
                    "gold": 70
                },
                "results": [
                    {
                        "type": "gold",
                        "value": 120,
                        "message": "獲得 120G。"
                    },
                    {
                        "type": "item",
                        "itemType": "material_medium",
                        "message": "獲得一件可用物資。"
                    }
                ]
            },
            {
                "text": "不要碰它",
                "intent": "不是每個亮點都值得打開。",
                "results": []
            }
        ],
        "eventRole": "risk_reward",
        "chapterRange": [
            2,
            3
        ],
        "landmarkIds": [
            "opened_ancient_tomb"
        ],
        "locationWeightBoost": 1.5,
        "repeatPolicy": "repeatable",
        "cooldownSteps": 12,
        "memoryKey": "cursed_chest"
    },
    {
        "id": "dark_spirit",
        "name": "低語黑影",
        "icon": "🕯️",
        "type": "curse",
        "zones": [
            "high",
            "death"
        ],
        "weight": 0.65,
        "description": "你聽見有人在背後叫你的名字。回頭時，只有一團貼著地面的影子，像在等待你先承認自己害怕。",
        "choices": [
            {
                "text": "用疼痛換取力量",
                "intent": "犧牲生命，換取攻擊強化。",
                "cost": {
                    "hp": 0.18,
                    "isPercent": true
                },
                "results": [
                    {
                        "type": "buff",
                        "buffType": "atk",
                        "value": 7,
                        "duration": 18,
                        "message": "短時間獲得戰鬥強化。"
                    }
                ]
            },
            {
                "text": "用金幣買下沉默",
                "intent": "支付金幣，取得經驗。",
                "cost": {
                    "gold": 50
                },
                "results": [
                    {
                        "type": "exp",
                        "value": 80,
                        "message": "獲得 80 經驗。"
                    }
                ]
            },
            {
                "text": "斬開影子",
                "intent": "可能受傷，但能立刻結束糾纏。",
                "results": [
                    {
                        "type": "damage",
                        "value": 10,
                        "message": "受到 10 點傷害。"
                    }
                ]
            }
        ],
        "eventRole": "risk_reward",
        "chapterRange": [
            2,
            3
        ],
        "landmarkIds": [
            "mist_tablet_hill",
            "opened_ancient_tomb"
        ],
        "locationWeightBoost": 1.5,
        "repeatPolicy": "repeatable",
        "cooldownSteps": 12,
        "memoryKey": "dark_spirit"
    },
    {
        "id": "mysterious_merchant",
        "name": "披斗篷的行商",
        "icon": "🎒",
        "type": "gamble",
        "zones": [
            "low",
            "medium",
            "high"
        ],
        "weight": 0.85,
        "description": "行商把包袱攤在路旁，所有瓶罐都沒有標籤。他說這不是賭博，只是「讓命運節省包裝成本」。",
        "choices": [
            {
                "text": "買小包裹",
                "intent": "低成本嘗試，可能賺到金幣。",
                "cost": {
                    "gold": 45
                },
                "chance": 0.45,
                "successResults": [
                    {
                        "type": "gold",
                        "value": 115,
                        "message": "獲得 115G。"
                    }
                ],
                "failResults": [
                    {
                        "type": "gold",
                        "value": 0,
                        "message": "金幣沒有變化。"
                    }
                ]
            },
            {
                "text": "買沉重包裹",
                "intent": "花更多金幣，可能取得稀有材料。",
                "cost": {
                    "gold": 90
                },
                "chance": 0.3,
                "successResults": [
                    {
                        "type": "gold",
                        "value": 160,
                        "message": "獲得 160G。"
                    },
                    {
                        "type": "item",
                        "itemType": "forge_material",
                        "message": "獲得一件可用物資。"
                    }
                ],
                "failResults": [
                    {
                        "type": "gold",
                        "value": 20,
                        "message": "獲得 20G。"
                    }
                ]
            },
            {
                "text": "婉拒交易",
                "intent": "保留資源，繼續上路。",
                "results": []
            }
        ],
        "eventRole": "trade",
        "chapterRange": [
            1,
            3
        ],
        "landmarkIds": [
            "south_gate_farmland",
            "hunter_boardwalk"
        ],
        "locationWeightBoost": 1.25,
        "repeatPolicy": "repeatable",
        "cooldownSteps": 12,
        "memoryKey": "mysterious_merchant"
    },
    {
        "id": "dice_demon",
        "name": "笑面骰客",
        "icon": "🎲",
        "type": "gamble",
        "zones": [
            "medium",
            "high",
            "death"
        ],
        "weight": 0.8,
        "description": "一名旅人坐在斷石上擲骰，骰子每次落下都多一個面。他說輸了只會痛一下，贏了會痛快一點。",
        "choices": [
            {
                "text": "押一枚小注",
                "intent": "小額賭局，可能得金幣或受傷。",
                "cost": {
                    "gold": 30
                },
                "chance": 0.5,
                "successResults": [
                    {
                        "type": "gold",
                        "value": 60,
                        "message": "獲得 60G。"
                    }
                ],
                "failResults": [
                    {
                        "type": "damage",
                        "value": 15,
                        "message": "受到 15 點傷害。"
                    }
                ]
            },
            {
                "text": "押一枚重注",
                "intent": "風險更高，回報也更高。",
                "cost": {
                    "gold": 80
                },
                "chance": 0.38,
                "successResults": [
                    {
                        "type": "gold",
                        "value": 180,
                        "message": "獲得 180G。"
                    }
                ],
                "failResults": [
                    {
                        "type": "damage",
                        "value": 24,
                        "message": "受到 24 點傷害。"
                    }
                ]
            },
            {
                "text": "收起錢袋",
                "intent": "今天不把人生交給骰子。",
                "results": []
            }
        ],
        "eventRole": "risk_reward",
        "chapterRange": [
            2,
            3
        ],
        "landmarkIds": [
            "hunter_boardwalk",
            "mist_tablet_hill"
        ],
        "locationWeightBoost": 1.3,
        "repeatPolicy": "repeatable",
        "cooldownSteps": 12,
        "memoryKey": "dice_demon"
    },
    {
        "id": "wandering_blacksmith",
        "name": "流動磨刃匠",
        "icon": "🛠️",
        "type": "trade",
        "zones": [
            "low",
            "medium",
            "high"
        ],
        "weight": 1.1,
        "description": "一名背著磨石的匠人蹲在路邊，火星落在濕泥裡很快熄滅。他說只收現金，不收「打完首領再給」。",
        "choices": [
            {
                "text": "請他磨利武器",
                "intent": "花金幣取得攻擊強化。",
                "cost": {
                    "gold": 60
                },
                "results": [
                    {
                        "type": "buff",
                        "buffType": "atk",
                        "value": 6,
                        "duration": 18,
                        "message": "短時間獲得戰鬥強化。"
                    }
                ]
            },
            {
                "text": "請他補強護具",
                "intent": "花金幣取得防禦強化。",
                "cost": {
                    "gold": 60
                },
                "results": [
                    {
                        "type": "buff",
                        "buffType": "def",
                        "value": 6,
                        "duration": 18,
                        "message": "短時間獲得戰鬥強化。"
                    }
                ]
            },
            {
                "text": "買一包邊角料",
                "intent": "取得中階材料，適合鍛造缺口。",
                "cost": {
                    "gold": 45
                },
                "results": [
                    {
                        "type": "item",
                        "itemType": "material_medium",
                        "message": "獲得一件可用物資。"
                    }
                ]
            },
            {
                "text": "道謝離開",
                "intent": "不消耗資源。",
                "results": []
            }
        ],
        "eventRole": "trade",
        "chapterRange": [
            1,
            3
        ],
        "landmarkIds": [
            "south_gate_farmland",
            "northern_drake_watch"
        ],
        "locationWeightBoost": 1.35,
        "repeatPolicy": "repeatable",
        "cooldownSteps": 12,
        "memoryKey": "wandering_blacksmith"
    },
    {
        "id": "fairy_deal",
        "name": "林間微光交易",
        "icon": "✨",
        "type": "trade",
        "zones": [
            "low",
            "medium"
        ],
        "weight": 0.8,
        "description": "一圈光點在樹根間轉動，像有人把夜色剪成碎片。它們願意交換祝福，但只接受很實際的金幣。",
        "choices": [
            {
                "text": "交換攻擊祝福",
                "intent": "短時間提高攻擊。",
                "cost": {
                    "gold": 60
                },
                "results": [
                    {
                        "type": "buff",
                        "buffType": "atk",
                        "value": 5,
                        "duration": 16,
                        "message": "短時間獲得戰鬥強化。"
                    }
                ]
            },
            {
                "text": "交換防禦祝福",
                "intent": "短時間提高防禦。",
                "cost": {
                    "gold": 60
                },
                "results": [
                    {
                        "type": "buff",
                        "buffType": "def",
                        "value": 5,
                        "duration": 16,
                        "message": "短時間獲得戰鬥強化。"
                    }
                ]
            },
            {
                "text": "交換療癒祝福",
                "intent": "恢復生命並獲得一點幸運。",
                "cost": {
                    "gold": 80
                },
                "results": [
                    {
                        "type": "heal",
                        "value": 0.45,
                        "isPercent": true,
                        "message": "恢復 45% 生命。"
                    },
                    {
                        "type": "buff",
                        "buffType": "luck",
                        "value": 5,
                        "duration": 14,
                        "message": "短時間獲得戰鬥強化。"
                    }
                ]
            },
            {
                "text": "不伸手",
                "intent": "避免被微光牽著走。",
                "results": []
            }
        ],
        "eventRole": "resource",
        "chapterRange": [
            1,
            2
        ],
        "landmarkIds": [
            "hunter_boardwalk",
            "rotroot_ravine",
            "moon_moss_slope",
            "thorn_glasshouse_ruin"
        ],
        "locationWeightBoost": 1.35,
        "repeatPolicy": "repeatable",
        "cooldownSteps": 9,
        "memoryKey": "fairy_deal"
    },
    {
        "id": "mysterious_statue",
        "name": "無名石像",
        "icon": "🗿",
        "type": "mystery",
        "zones": [
            "medium",
            "high",
            "death"
        ],
        "weight": 0.9,
        "description": "石像沒有臉，胸口卻有掌印般的凹痕。你靠近時，周圍的聲音像被什麼東西收走了。",
        "choices": [
            {
                "text": "按上掌印",
                "intent": "隨機事件，可能獲益也可能受傷。",
                "isRandom": true,
                "randomResults": [
                    {
                        "weight": 30,
                        "results": [
                            {
                                "type": "heal",
                                "value": 0.4,
                                "isPercent": true,
                                "message": "恢復 40% 生命。"
                            }
                        ]
                    },
                    {
                        "weight": 25,
                        "results": [
                            {
                                "type": "gold",
                                "value": 70,
                                "message": "獲得 70G。"
                            }
                        ]
                    },
                    {
                        "weight": 25,
                        "results": [
                            {
                                "type": "exp",
                                "value": 45,
                                "message": "獲得 45 經驗。"
                            }
                        ]
                    },
                    {
                        "weight": 20,
                        "results": [
                            {
                                "type": "damage",
                                "value": 22,
                                "message": "受到 22 點傷害。"
                            }
                        ]
                    }
                ]
            },
            {
                "text": "投下金幣",
                "intent": "以小額金幣換取經驗。",
                "cost": {
                    "gold": 30
                },
                "results": [
                    {
                        "type": "exp",
                        "value": 50,
                        "message": "獲得 50 經驗。"
                    }
                ]
            },
            {
                "text": "記下形狀",
                "intent": "保留這個不舒服的印象。",
                "results": []
            }
        ],
        "eventRole": "risk_reward",
        "chapterRange": [
            2,
            3
        ],
        "landmarkIds": [
            "mist_tablet_hill",
            "opened_ancient_tomb",
            "sunken_altar_reef"
        ],
        "locationWeightBoost": 1.35,
        "repeatPolicy": "repeatable",
        "cooldownSteps": 12,
        "memoryKey": "mysterious_statue"
    },
    {
        "id": "dimensional_rift",
        "name": "裂開的空氣",
        "icon": "🌀",
        "type": "mystery",
        "zones": [
            "high",
            "death"
        ],
        "weight": 0.65,
        "description": "半空出現一道薄薄裂痕，邊緣像被燒焦的紙。裂縫另一邊傳來很遠的鐘聲，也可能只是你的耳鳴。",
        "choices": [
            {
                "text": "伸手探入裂縫",
                "intent": "高風險隨機事件，可能取得強力回報。",
                "isRandom": true,
                "randomResults": [
                    {
                        "weight": 25,
                        "results": [
                            {
                                "type": "gold",
                                "value": 120,
                                "message": "獲得 120G。"
                            }
                        ]
                    },
                    {
                        "weight": 25,
                        "results": [
                            {
                                "type": "item",
                                "itemType": "random",
                                "message": "獲得一件可用物資。"
                            }
                        ]
                    },
                    {
                        "weight": 25,
                        "results": [
                            {
                                "type": "damage",
                                "value": 34,
                                "message": "受到 34 點傷害。"
                            }
                        ]
                    },
                    {
                        "weight": 25,
                        "results": [
                            {
                                "type": "buff",
                                "buffType": "atk",
                                "value": 5,
                                "duration": 18,
                                "message": "短時間獲得戰鬥強化。"
                            },
                            {
                                "type": "buff",
                                "buffType": "def",
                                "value": 5,
                                "duration": 18,
                                "message": "短時間獲得戰鬥強化。"
                            }
                        ]
                    }
                ]
            },
            {
                "text": "丟入金幣測試",
                "intent": "用少量金幣換取較低風險的結果。",
                "cost": {
                    "gold": 20
                },
                "chance": 0.6,
                "successResults": [
                    {
                        "type": "gold",
                        "value": 55,
                        "message": "獲得 55G。"
                    }
                ],
                "failResults": [
                    {
                        "type": "gold",
                        "value": 0,
                        "message": "金幣沒有變化。"
                    }
                ]
            },
            {
                "text": "退後觀察",
                "intent": "不碰深淵的便宜。",
                "results": []
            }
        ],
        "eventRole": "pressure",
        "chapterRange": [
            3,
            3
        ],
        "landmarkIds": [
            "dragon_heat_crag"
        ],
        "locationWeightBoost": 1.6,
        "repeatPolicy": "repeatable",
        "cooldownSteps": 16,
        "memoryKey": "dimensional_rift"
    },
    {
        "id": "foragers_emergency_stash",
        "name": "採集者急藏包",
        "icon": "🎒",
        "type": "encounter",
        "zones": [
            "low",
            "medium"
        ],
        "weight": 1,
        "description": "灌木下壓著一只防水布包，外側繫著採集者常用的紅線。它看起來像求救，也像陷阱。",
        "choices": [
            {
                "text": "只取急救物",
                "intent": "恢復生命，留下大部分補給。",
                "results": [
                    {
                        "type": "heal",
                        "value": 0.22,
                        "isPercent": true,
                        "message": "恢復 22% 生命。"
                    }
                ]
            },
            {
                "text": "翻找材料",
                "intent": "取得材料，但可能留下壞名聲。",
                "results": [
                    {
                        "type": "item",
                        "itemType": "material_low",
                        "message": "獲得一件可用物資。"
                    },
                    {
                        "type": "debuff",
                        "buffType": "luck",
                        "value": -3,
                        "duration": 10,
                        "message": "短時間承受不利狀態。"
                    }
                ]
            },
            {
                "text": "重新藏好",
                "intent": "不拿東西，獲得少量經驗。",
                "results": [
                    {
                        "type": "exp",
                        "value": 28,
                        "message": "獲得 28 經驗。"
                    },
                    {
                        "type": "buff",
                        "buffType": "luck",
                        "value": 2,
                        "duration": 8,
                        "message": "短時間獲得戰鬥強化。"
                    }
                ]
            }
        ],
        "eventRole": "resource",
        "chapterRange": [
            1,
            2
        ],
        "landmarkIds": [
            "south_gate_farmland",
            "hunter_boardwalk",
            "rotroot_ravine"
        ],
        "locationWeightBoost": 1.35,
        "repeatPolicy": "repeatable",
        "cooldownSteps": 9,
        "memoryKey": "foragers_emergency_stash"
    },
    {
        "id": "leyline_splinter",
        "name": "地脈碎光",
        "icon": "🔷",
        "type": "mystery",
        "zones": [
            "medium",
            "high"
        ],
        "weight": 0.85,
        "description": "泥土裡滲出細碎藍光，像大地正在漏血。你靠近時，手背上的汗毛全都立了起來。",
        "choices": [
            {
                "text": "收集碎光",
                "intent": "可能取得素材，也可能承受地脈反噬。",
                "results": [
                    {
                        "type": "item",
                        "itemType": "material_medium",
                        "message": "獲得一件可用物資。"
                    },
                    {
                        "type": "damage",
                        "value": 10,
                        "message": "受到 10 點傷害。"
                    }
                ]
            },
            {
                "text": "標記位置",
                "intent": "取得經驗，替之後調查留下記錄。",
                "results": [
                    {
                        "type": "exp",
                        "value": 45,
                        "message": "獲得 45 經驗。"
                    }
                ]
            },
            {
                "text": "快速離開",
                "intent": "避免被不穩定魔力捲入。",
                "results": []
            }
        ],
        "eventRole": "world_lore",
        "chapterRange": [
            2,
            3
        ],
        "landmarkIds": [
            "rotroot_ravine",
            "mist_tablet_hill"
        ],
        "locationWeightBoost": 1.45,
        "repeatPolicy": "chapter_once",
        "cooldownSteps": 0,
        "memoryKey": "leyline_splinter"
    },
    {
        "id": "abandoned_blueprint_cache",
        "name": "廢棄圖紙匣",
        "icon": "📦",
        "type": "mystery",
        "zones": [
            "low",
            "medium"
        ],
        "weight": 0.55,
        "retireWhenFlags": [
            "foundBlueprintCache"
        ],
        "description": "木匣卡在倒樹底下，裡面不是完整圖紙，而是幾張被雨水泡皺的鍛造註記。",
        "choices": [
            {
                "text": "仔細翻找",
                "intent": "可能取得材料或鍛造線索。",
                "results": [
                    {
                        "type": "world_interaction",
                        "interactionId": "field_blueprint_cache",
                        "message": "世界狀態產生了新的變化。"
                    }
                ]
            },
            {
                "text": "只記下標記",
                "intent": "保留資訊，不冒著弄壞紙張的風險。",
                "results": []
            }
        ],
        "eventRole": "side_story",
        "chapterRange": [
            1,
            2
        ],
        "landmarkIds": [
            "south_gate_farmland",
            "hunter_boardwalk",
            "rotroot_ravine",
            "mist_tablet_hill"
        ],
        "locationWeightBoost": 1.5,
        "repeatPolicy": "one_time",
        "cooldownSteps": 0,
        "memoryKey": "abandoned_blueprint_cache"
    },
    {
        "id": "field_notice_board",
        "name": "野外告示牌",
        "icon": "📌",
        "type": "mystery",
        "zones": [
            "low",
            "medium"
        ],
        "weight": 0.55,
        "retireWhenFlags": [
            "readCrossroadsNoticeBoard",
            "heardScholarSlimeRequest"
        ],
        "description": "一塊臨時木牌插在路邊，紙條被雨打得捲曲。字跡很急，像是貼告示的人不敢在這裡久留。",
        "choices": [
            {
                "text": "讀完告示",
                "intent": "取得附近傳聞，可能打開支線或首領痕跡。",
                "results": [
                    {
                        "type": "world_interaction",
                        "interactionId": "crossroads_notice_board",
                        "message": "世界狀態產生了新的變化。"
                    }
                ]
            },
            {
                "text": "取下破紙角",
                "intent": "留下物證，之後能回城比對。",
                "results": []
            }
        ],
        "eventRole": "story_seed",
        "chapterRange": [
            1,
            1
        ],
        "landmarkIds": [
            "south_gate_farmland"
        ],
        "locationWeightBoost": 1.8,
        "repeatPolicy": "one_time",
        "cooldownSteps": 0,
        "memoryKey": "field_notice_board"
    },
    {
        "id": "special_bounty_notice",
        "name": "加急懸賞單",
        "icon": "📜",
        "type": "mystery",
        "zones": [
            "medium",
            "high"
        ],
        "weight": 0.5,
        "retireWhenFlags": [
            "readSpecialBountyNotice",
            "mapFragmentDelivered"
        ],
        "description": "這張懸賞單蓋了三個不同單位的章，金額被反覆塗改。真正有價值的不是賞金，而是它提到的地名。",
        "choices": [
            {
                "text": "記下懸賞內容",
                "intent": "取得委託與首領相關線索。",
                "results": [
                    {
                        "type": "world_interaction",
                        "interactionId": "special_bounty_notice",
                        "message": "世界狀態產生了新的變化。"
                    }
                ]
            },
            {
                "text": "觀察塗改處",
                "intent": "可能看出被隱藏的目的。",
                "results": []
            }
        ],
        "eventRole": "side_story",
        "chapterRange": [
            2,
            3
        ],
        "landmarkIds": [
            "moon_moss_slope"
        ],
        "locationWeightBoost": 1.8,
        "repeatPolicy": "one_time",
        "cooldownSteps": 0,
        "memoryKey": "special_bounty_notice"
    },
    {
        "id": "weathered_route_tablet",
        "name": "風化路碑",
        "icon": "🪧",
        "type": "mystery",
        "zones": [
            "medium",
            "high",
            "death"
        ],
        "weight": 0.5,
        "retireWhenFlags": [
            "foundRuinTabletTrace"
        ],
        "description": "路碑上刻著舊時代的方向詞，一半被藤根吃進土裡。你得把殘字和附近地形對起來。",
        "choices": [
            {
                "text": "拓下碑文",
                "intent": "取得世界見聞或首領謎題線索。",
                "results": [
                    {
                        "type": "world_interaction",
                        "interactionId": "ruin_tablet_trace",
                        "message": "世界狀態產生了新的變化。"
                    }
                ]
            },
            {
                "text": "按地形重排方向",
                "intent": "可能推進地圖謎題。",
                "results": []
            }
        ],
        "eventRole": "world_lore",
        "chapterRange": [
            1,
            2
        ],
        "landmarkIds": [
            "mist_tablet_hill",
            "opened_ancient_tomb",
            "sunken_altar_reef"
        ],
        "locationWeightBoost": 1.8,
        "repeatPolicy": "chapter_once",
        "cooldownSteps": 0,
        "memoryKey": "weathered_route_tablet"
    },
    {
        "id": "south_gate_patrol_marks",
        "name": "南門巡守刻痕",
        "icon": "🪧",
        "type": "encounter",
        "zones": [
            "low",
            "medium"
        ],
        "weight": 1,
        "description": "木樁上有巡守隊留下的短刻痕，深淺不一。看起來像記錄哪條路還能通，哪條路只是看起來能走。",
        "choices": [
            {
                "text": "比對刻痕方向",
                "intent": "推進南門初期路線，讓探索更清楚。",
                "results": [
                    {
                        "type": "exp",
                        "value": 30,
                        "message": "獲得 30 經驗。"
                    },
                    {
                        "type": "buff",
                        "buffType": "luck",
                        "value": 4,
                        "duration": 10,
                        "message": "短時間獲得戰鬥強化。"
                    }
                ]
            },
            {
                "text": "收起斷裂木片",
                "intent": "取得材料，但不一定有用。",
                "results": [
                    {
                        "type": "item",
                        "itemType": "material_low",
                        "message": "獲得一件可用物資。"
                    },
                    {
                        "type": "damage",
                        "value": 6,
                        "message": "受到 6 點傷害。"
                    }
                ]
            },
            {
                "text": "照原樣放回",
                "intent": "不破壞巡守留下的標記。",
                "results": [
                    {
                        "type": "exp",
                        "value": 15,
                        "message": "獲得 15 經驗。"
                    }
                ]
            }
        ],
        "eventRole": "story_seed",
        "chapterRange": [
            1,
            1
        ],
        "landmarkIds": [
            "south_gate_farmland"
        ],
        "locationWeightBoost": 2,
        "repeatPolicy": "one_time",
        "cooldownSteps": 0,
        "memoryKey": "south_gate_patrol_marks"
    },
    {
        "id": "hunter_tripwire_cache",
        "name": "獵人絆線包",
        "icon": "🪤",
        "type": "mystery",
        "zones": [
            "low",
            "medium"
        ],
        "weight": 0.85,
        "description": "幾捆細線藏在樹根間，旁邊有被切開的誘餌鉤。這不是普通獵具，更像有人在研究如何反制伏擊。",
        "choices": [
            {
                "text": "拆出可用絆線",
                "intent": "可能取得材料，並理解伏獵者的路線。",
                "results": [
                    {
                        "type": "item",
                        "itemType": "material_low",
                        "message": "獲得一件可用物資。"
                    },
                    {
                        "type": "exp",
                        "value": 25,
                        "message": "獲得 25 經驗。"
                    }
                ]
            },
            {
                "text": "試著重組誘餌鉤",
                "intent": "可能推進銀鐮伏獵者的觸發條件。",
                "results": [
                    {
                        "type": "item",
                        "itemType": "material_medium",
                        "message": "獲得一件可用物資。"
                    },
                    {
                        "type": "damage",
                        "value": 12,
                        "message": "受到 12 點傷害。"
                    }
                ]
            },
            {
                "text": "保持現場",
                "intent": "不改變陷阱狀態。",
                "results": []
            }
        ],
        "eventRole": "risk_reward",
        "chapterRange": [
            1,
            2
        ],
        "landmarkIds": [
            "hunter_boardwalk",
            "old_campfire_site",
            "silver_snare_pass"
        ],
        "locationWeightBoost": 2,
        "repeatPolicy": "repeatable",
        "cooldownSteps": 12,
        "memoryKey": "hunter_tripwire_cache"
    },
    {
        "id": "silver_thread_pattern",
        "name": "回程銀絲痕",
        "icon": "🧭",
        "type": "mystery",
        "zones": [
            "low",
            "medium"
        ],
        "weight": 0.8,
        "description": "樹皮上有幾道很淺的銀白割痕，方向全都指向你剛剛走來的路。這些線不像在阻止人前進，更像在等人回頭。",
        "choices": [
            {
                "text": "順著割痕比對路線",
                "intent": "取得銀絲伏擊的觀察經驗，偏向線索理解。",
                "results": [
                    {
                        "type": "exp",
                        "value": 35,
                        "message": "獲得 35 經驗。"
                    },
                    {
                        "type": "buff",
                        "buffType": "luck",
                        "value": 4,
                        "duration": 10,
                        "message": "短時間獲得戰鬥強化。"
                    }
                ]
            },
            {
                "text": "用炭灰標出安全線",
                "intent": "不拿材料，換取短暫防護與穩定感。",
                "results": [
                    {
                        "type": "buff",
                        "buffType": "def",
                        "value": 3,
                        "duration": 12,
                        "message": "短時間獲得戰鬥強化。"
                    }
                ]
            },
            {
                "text": "不改動現場",
                "intent": "保留痕跡，避免驚動設陷者。",
                "results": [
                    {
                        "type": "exp",
                        "value": 12,
                        "message": "獲得 12 經驗。"
                    }
                ]
            }
        ],
        "eventRole": "world_lore",
        "chapterRange": [
            1,
            2
        ],
        "landmarkIds": [
            "hunter_boardwalk",
            "old_campfire_site",
            "silver_snare_pass"
        ],
        "locationWeightBoost": 1.9,
        "repeatPolicy": "chapter_once",
        "cooldownSteps": 0,
        "memoryKey": "silver_thread_pattern"
    },
    {
        "id": "snare_salvage_pouch",
        "name": "獵人殘補袋",
        "icon": "🎒",
        "type": "mystery",
        "zones": [
            "low",
            "medium"
        ],
        "weight": 0.85,
        "description": "一只破補袋掛在木樁後方，裡面有乾硬肉條、斷線軸與一張皺紙。紙上寫著：「不要貪，拿完快走。」",
        "choices": [
            {
                "text": "只拿乾糧與藥布",
                "intent": "保守取得恢復，適合繼續探索。",
                "results": [
                    {
                        "type": "heal",
                        "value": 0.18,
                        "isPercent": true,
                        "message": "恢復 18% 生命。"
                    },
                    {
                        "type": "exp",
                        "value": 15,
                        "message": "獲得 15 經驗。"
                    }
                ]
            },
            {
                "text": "翻出線軸與零件",
                "intent": "取得材料，但可能牽動殘留機關。",
                "results": [
                    {
                        "type": "item",
                        "itemType": "material_low",
                        "message": "獲得一件可用物資。"
                    },
                    {
                        "type": "damage",
                        "value": 8,
                        "message": "受到 8 點傷害。"
                    }
                ]
            },
            {
                "text": "把補袋重新掛好",
                "intent": "不拿走資源，換取少量經驗。",
                "results": [
                    {
                        "type": "exp",
                        "value": 18,
                        "message": "獲得 18 經驗。"
                    }
                ]
            }
        ],
        "eventRole": "resource",
        "chapterRange": [
            1,
            2
        ],
        "landmarkIds": [
            "hunter_boardwalk",
            "old_campfire_site",
            "silver_snare_pass"
        ],
        "locationWeightBoost": 1.8,
        "repeatPolicy": "repeatable",
        "cooldownSteps": 9,
        "memoryKey": "snare_salvage_pouch"
    },
    {
        "id": "muddy_supply_cart",
        "name": "陷泥補給車",
        "icon": "🛒",
        "type": "trade",
        "zones": [
            "low",
            "medium"
        ],
        "weight": 0.9,
        "description": "一輛補給車斜陷在泥裡，車輪旁全是急促腳印。貨物還在，車主卻像突然被什麼聲音叫走。",
        "choices": [
            {
                "text": "扶正車輪",
                "intent": "花時間換取恢復或友善回報。",
                "cost": {
                    "hp": 0.08,
                    "isPercent": true
                },
                "results": [
                    {
                        "type": "gold",
                        "value": 55,
                        "message": "獲得 55G。"
                    },
                    {
                        "type": "exp",
                        "value": 25,
                        "message": "獲得 25 經驗。"
                    },
                    {
                        "type": "item",
                        "itemType": "material_low",
                        "message": "獲得一件可用物資。"
                    }
                ]
            },
            {
                "text": "取走散落材料",
                "intent": "取得材料，但可能承擔一點代價。",
                "cost": {
                    "gold": 40
                },
                "results": [
                    {
                        "type": "item",
                        "itemType": "material_medium",
                        "message": "獲得一件可用物資。"
                    }
                ]
            },
            {
                "text": "留下路標",
                "intent": "取得經驗，讓後來者避開泥坑。",
                "results": [
                    {
                        "type": "buff",
                        "buffType": "luck",
                        "value": 3,
                        "duration": 10,
                        "message": "短時間獲得戰鬥強化。"
                    },
                    {
                        "type": "exp",
                        "value": 18,
                        "message": "獲得 18 經驗。"
                    }
                ]
            }
        ],
        "eventRole": "resource",
        "chapterRange": [
            1,
            2
        ],
        "landmarkIds": [
            "south_gate_farmland",
            "rotroot_ravine"
        ],
        "locationWeightBoost": 1.4,
        "repeatPolicy": "repeatable",
        "cooldownSteps": 9,
        "memoryKey": "muddy_supply_cart"
    },
    {
        "id": "thorn_toll_roots",
        "name": "荊棘收費根",
        "icon": "🌿",
        "type": "trade",
        "zones": [
            "medium",
            "high"
        ],
        "weight": 0.85,
        "description": "根鬚橫過小路，尖刺上掛著銅幣、藥草與一小片染血布料。女巫的規矩顯然比王國稅官還細。",
        "choices": [
            {
                "text": "照規矩交換",
                "intent": "用資源換取女巫線索或捷徑。",
                "cost": {
                    "gold": 65
                },
                "results": [
                    {
                        "type": "heal",
                        "value": 0.28,
                        "isPercent": true,
                        "message": "恢復 28% 生命。"
                    },
                    {
                        "type": "exp",
                        "value": 35,
                        "message": "獲得 35 經驗。"
                    }
                ]
            },
            {
                "text": "砍斷根鬚",
                "intent": "可能遭到反噬，但能破壞規則。",
                "results": [
                    {
                        "type": "item",
                        "itemType": "material_medium",
                        "message": "獲得一件可用物資。"
                    },
                    {
                        "type": "damage",
                        "value": 16,
                        "message": "受到 16 點傷害。"
                    }
                ]
            },
            {
                "text": "觀察交換物順序",
                "intent": "推進荊棘女巫的謎題。",
                "results": [
                    {
                        "type": "exp",
                        "value": 45,
                        "message": "獲得 45 經驗。"
                    }
                ]
            }
        ],
        "eventRole": "side_story",
        "chapterRange": [
            2,
            2
        ],
        "landmarkIds": [
            "thorn_glasshouse_ruin",
            "rotroot_ravine"
        ],
        "locationWeightBoost": 1.8,
        "repeatPolicy": "one_time",
        "cooldownSteps": 0,
        "memoryKey": "thorn_toll_roots"
    },
    {
        "id": "drowned_lantern_line",
        "name": "浮沉燈繩",
        "icon": "🏮",
        "type": "mystery",
        "zones": [
            "medium",
            "high"
        ],
        "weight": 0.75,
        "description": "幾盞濕透的燈沿著潮線忽明忽暗，燈繩不是被綁住，而像被海水從另一端慢慢拉緊。",
        "choices": [
            {
                "text": "跟著燈繩走",
                "intent": "靠近沉鐘線索，但可能遇到危險。",
                "results": [
                    {
                        "type": "exp",
                        "value": 55,
                        "message": "獲得 55 經驗。"
                    },
                    {
                        "type": "buff",
                        "buffType": "luck",
                        "value": 5,
                        "duration": 12,
                        "message": "短時間獲得戰鬥強化。"
                    }
                ]
            },
            {
                "text": "撈起一盞燈",
                "intent": "取得素材或水聲提示。",
                "results": [
                    {
                        "type": "item",
                        "itemType": "material_medium",
                        "message": "獲得一件可用物資。"
                    },
                    {
                        "type": "debuff",
                        "buffType": "def",
                        "value": -2,
                        "duration": 10,
                        "message": "短時間承受不利狀態。"
                    }
                ]
            },
            {
                "text": "聽它們的節奏",
                "intent": "推進沉鐘神諭的謎題。",
                "results": [
                    {
                        "type": "heal",
                        "value": 0.12,
                        "isPercent": true,
                        "message": "恢復 12% 生命。"
                    }
                ]
            }
        ],
        "eventRole": "world_lore",
        "chapterRange": [
            2,
            2
        ],
        "landmarkIds": [
            "sunken_altar_reef"
        ],
        "locationWeightBoost": 1.8,
        "repeatPolicy": "chapter_once",
        "cooldownSteps": 0,
        "memoryKey": "drowned_lantern_line"
    },
    {
        "id": "dragon_heat_haze",
        "name": "龍熱蜃影",
        "icon": "🔥",
        "type": "curse",
        "zones": [
            "high",
            "death"
        ],
        "weight": 0.8,
        "description": "遠方空氣像玻璃一樣彎曲，熱浪裡短暫浮現爪痕與巨大陰影。它不在這裡，但它留下的溫度在追人。",
        "choices": [
            {
                "text": "收集熱痕",
                "intent": "推進古龍追蹤，也可能損耗狀態。",
                "results": [
                    {
                        "type": "damage",
                        "value": 22,
                        "message": "受到 22 點傷害。"
                    },
                    {
                        "type": "exp",
                        "value": 90,
                        "message": "獲得 90 經驗。"
                    }
                ]
            },
            {
                "text": "用布包住熱石",
                "intent": "可能取得材料。",
                "cost": {
                    "gold": 55
                },
                "results": [
                    {
                        "type": "buff",
                        "buffType": "def",
                        "value": 7,
                        "duration": 16,
                        "message": "短時間獲得戰鬥強化。"
                    }
                ]
            },
            {
                "text": "繞開熱浪",
                "intent": "避免被終局壓力拖住。",
                "results": [
                    {
                        "type": "exp",
                        "value": 35,
                        "message": "獲得 35 經驗。"
                    }
                ]
            }
        ],
        "eventRole": "pressure",
        "chapterRange": [
            3,
            3
        ],
        "landmarkIds": [
            "northern_drake_watch",
            "dragon_heat_crag"
        ],
        "locationWeightBoost": 1.8,
        "repeatPolicy": "repeatable",
        "cooldownSteps": 16,
        "memoryKey": "dragon_heat_haze"
    },
    {
        "id": "mist_tablet_cipher",
        "name": "霧碑錯位文",
        "icon": "🪨",
        "type": "mystery",
        "zones": [
            "high"
        ],
        "weight": 0.72,
        "description": "霧碑上的文字在你靠近時慢慢錯位，幾段句子像被拆成碎骨後重新排好。你看不懂全部，但能辨認出「守衛」、「法杖」與「不要照原路回去」。",
        "choices": [
            {
                "text": "按霧的流向重排文字",
                "intent": "安全解讀地脈與古墓線索，取得較多經驗。",
                "results": [
                    {
                        "type": "exp",
                        "value": 75,
                        "message": "獲得 75 經驗。"
                    },
                    {
                        "type": "buff",
                        "buffType": "luck",
                        "value": 5,
                        "duration": 12,
                        "message": "短時間獲得戰鬥強化。"
                    }
                ]
            },
            {
                "text": "刮下發亮的苔痕",
                "intent": "拿走可用素材，但可能被封印反噬。",
                "results": [
                    {
                        "type": "item",
                        "itemType": "material_medium",
                        "message": "獲得一件可用物資。"
                    },
                    {
                        "type": "damage",
                        "value": 12,
                        "message": "受到 12 點傷害。"
                    }
                ]
            },
            {
                "text": "只畫下看得懂的三個字",
                "intent": "保守記錄，不碰封印。",
                "results": [
                    {
                        "type": "exp",
                        "value": 35,
                        "message": "獲得 35 經驗。"
                    }
                ]
            }
        ],
        "eventRole": "world_lore",
        "chapterRange": [
            2,
            3
        ],
        "landmarkIds": [
            "mist_tablet_hill",
            "opened_ancient_tomb"
        ],
        "locationWeightBoost": 1.75,
        "repeatPolicy": "chapter_once",
        "cooldownSteps": 0,
        "memoryKey": "mist_tablet_cipher"
    },
    {
        "id": "coast_salvage_tide",
        "name": "退潮殘貨",
        "icon": "🌊",
        "type": "encounter",
        "zones": [
            "medium",
            "high"
        ],
        "weight": 0.74,
        "description": "潮水短暫退開，沙面露出一排被海藻纏住的木箱。箱上有王國貨印，也有被海水泡爛的祭壇符號。遠處的沉鐘聲每響一下，海水就往回爬一點。",
        "choices": [
            {
                "text": "趁退潮搬走貨箱",
                "intent": "取得材料，但會承受潮水與寒意的代價。",
                "results": [
                    {
                        "type": "item",
                        "itemType": "material_medium",
                        "message": "獲得一件可用物資。"
                    },
                    {
                        "type": "debuff",
                        "buffType": "def",
                        "value": -2,
                        "duration": 12,
                        "message": "短時間承受不利狀態。"
                    }
                ]
            },
            {
                "text": "等鐘聲對齊再下手",
                "intent": "不急著拿貨，先讀懂沉鐘節奏。",
                "results": [
                    {
                        "type": "exp",
                        "value": 70,
                        "message": "獲得 70 經驗。"
                    },
                    {
                        "type": "buff",
                        "buffType": "luck",
                        "value": 4,
                        "duration": 12,
                        "message": "短時間獲得戰鬥強化。"
                    }
                ]
            },
            {
                "text": "只取漂來的錢袋",
                "intent": "低風險拿一點金幣。",
                "results": [
                    {
                        "type": "gold",
                        "value": 55,
                        "message": "獲得 55G。"
                    }
                ]
            }
        ],
        "eventRole": "risk_reward",
        "chapterRange": [
            2,
            2
        ],
        "landmarkIds": [
            "sunken_altar_reef"
        ],
        "locationWeightBoost": 1.7,
        "repeatPolicy": "repeatable",
        "cooldownSteps": 12,
        "memoryKey": "coast_salvage_tide"
    },
    {
        "id": "northbound_whiteout_cache",
        "name": "雪線補給旗",
        "icon": "🚩",
        "type": "blessing",
        "zones": [
            "high",
            "death"
        ],
        "weight": 0.76,
        "description": "雪地裡插著一支被燒黑半邊的補給旗，旗桿下埋著油布包。包內只有最基本的乾糧、火石與一張字條：往北走的人，不要相信安靜。",
        "choices": [
            {
                "text": "補充乾糧與火石",
                "intent": "穩定恢復，適合進入北境前整理狀態。",
                "results": [
                    {
                        "type": "heal",
                        "value": 0.28,
                        "isPercent": true,
                        "message": "恢復 28% 生命。"
                    }
                ]
            },
            {
                "text": "把旗布纏上護具",
                "intent": "提高防禦，準備承受龍焰與風雪。",
                "results": [
                    {
                        "type": "buff",
                        "buffType": "def",
                        "value": 7,
                        "duration": 16,
                        "message": "短時間獲得戰鬥強化。"
                    },
                    {
                        "type": "exp",
                        "value": 35,
                        "message": "獲得 35 經驗。"
                    }
                ]
            },
            {
                "text": "留下自己的補給記號",
                "intent": "不拿太多，只整理路線。",
                "results": [
                    {
                        "type": "buff",
                        "buffType": "luck",
                        "value": 6,
                        "duration": 14,
                        "message": "短時間獲得戰鬥強化。"
                    }
                ]
            }
        ],
        "eventRole": "resource",
        "chapterRange": [
            3,
            3
        ],
        "landmarkIds": [
            "northern_drake_watch",
            "dragon_heat_crag"
        ],
        "locationWeightBoost": 1.6,
        "repeatPolicy": "repeatable",
        "cooldownSteps": 9,
        "memoryKey": "northbound_whiteout_cache"
    },
    {
        "id": "last_campfire_before_north",
        "name": "北行前的最後營火",
        "icon": "🔥",
        "type": "blessing",
        "zones": [
            "death",
            "boss"
        ],
        "weight": 0.85,
        "description": "營火早就熄了，灰燼卻還溫熱。木牌上刻著很多名字，最後一行空著，像留給下一個人。",
        "choices": [
            {
                "text": "重新點火休整",
                "intent": "恢復狀態，準備進入高壓區。",
                "results": [
                    {
                        "type": "heal",
                        "value": 0.45,
                        "isPercent": true,
                        "message": "恢復 45% 生命。"
                    }
                ]
            },
            {
                "text": "讀完刻名",
                "intent": "取得世界見聞。",
                "results": [
                    {
                        "type": "buff",
                        "buffType": "atk",
                        "value": 8,
                        "duration": 18,
                        "message": "短時間獲得戰鬥強化。"
                    },
                    {
                        "type": "exp",
                        "value": 50,
                        "message": "獲得 50 經驗。"
                    }
                ]
            },
            {
                "text": "添上一段警語",
                "intent": "留下紀錄，獲得少量經驗。",
                "results": [
                    {
                        "type": "buff",
                        "buffType": "luck",
                        "value": 8,
                        "duration": 16,
                        "message": "短時間獲得戰鬥強化。"
                    }
                ]
            }
        ],
        "eventRole": "resource",
        "chapterRange": [
            3,
            3
        ],
        "landmarkIds": [
            "northern_drake_watch",
            "dragon_heat_crag"
        ],
        "locationWeightBoost": 1.5,
        "repeatPolicy": "repeatable",
        "cooldownSteps": 9,
        "memoryKey": "last_campfire_before_north"
    },
    {
        "id": "injured_adventurer",
        "name": "受傷冒險者",
        "icon": "🩹",
        "type": "encounter",
        "zones": [
            "low",
            "medium",
            "high"
        ],
        "weight": 1,
        "description": "一名冒險者靠著石頭喘氣，手裡抓著半張地圖。他一看見你，先確認你有沒有帶藥，再確認你是不是人。",
        "choices": [
            {
                "text": "替他包紮",
                "intent": "可能恢復生命或換取情報。",
                "cost": {
                    "hp": 0.1,
                    "isPercent": true
                },
                "results": [
                    {
                        "type": "gold",
                        "value": 45,
                        "message": "獲得 45G。"
                    },
                    {
                        "type": "buff",
                        "buffType": "luck",
                        "value": 7,
                        "duration": 12,
                        "message": "短時間獲得戰鬥強化。"
                    }
                ]
            },
            {
                "text": "詢問前方情況",
                "intent": "取得路線與危險提示。",
                "results": [
                    {
                        "type": "gold",
                        "value": 35,
                        "message": "獲得 35G。"
                    },
                    {
                        "type": "debuff",
                        "buffType": "luck",
                        "value": -5,
                        "duration": 15,
                        "message": "短時間承受不利狀態。"
                    }
                ]
            },
            {
                "text": "扶他回安全處",
                "intent": "花時間換取經驗或城鎮回饋。",
                "results": []
            }
        ],
        "eventRole": "resource",
        "chapterRange": [
            1,
            3
        ],
        "landmarkIds": [
            "hunter_boardwalk",
            "old_wolf_den",
            "northern_drake_watch"
        ],
        "locationWeightBoost": 1.4,
        "repeatPolicy": "repeatable",
        "cooldownSteps": 9,
        "memoryKey": "injured_adventurer"
    },
    {
        "id": "ancient_guardian",
        "name": "古代守衛殘像",
        "icon": "🛡️",
        "type": "encounter",
        "zones": [
            "medium",
            "high",
            "death"
        ],
        "weight": 0.75,
        "description": "一道半透明守衛投影擋在路中央，反覆執行已經失效的巡邏指令。它看不見你，只看見「污染源」。",
        "choices": [
            {
                "text": "正面通過",
                "intent": "高風險，可能換取強化。",
                "cost": {
                    "hp": 0.22,
                    "isPercent": true
                },
                "results": [
                    {
                        "type": "buff",
                        "buffType": "atk",
                        "value": 8,
                        "duration": 20,
                        "message": "短時間獲得戰鬥強化。"
                    },
                    {
                        "type": "exp",
                        "value": 45,
                        "message": "獲得 45 經驗。"
                    }
                ]
            },
            {
                "text": "模仿古代手勢",
                "intent": "嘗試解謎，可能降低風險。",
                "cost": {
                    "gold": 90
                },
                "results": [
                    {
                        "type": "heal",
                        "value": 0.5,
                        "isPercent": true,
                        "message": "恢復 50% 生命。"
                    },
                    {
                        "type": "buff",
                        "buffType": "def",
                        "value": 8,
                        "duration": 20,
                        "message": "短時間獲得戰鬥強化。"
                    }
                ]
            },
            {
                "text": "繞路離開",
                "intent": "保留狀態，不碰遺跡防衛。",
                "results": [
                    {
                        "type": "heal",
                        "value": 0.1,
                        "isPercent": true,
                        "message": "恢復 10% 生命。"
                    }
                ]
            }
        ],
        "eventRole": "risk_reward",
        "chapterRange": [
            2,
            3
        ],
        "landmarkIds": [
            "mist_tablet_hill",
            "opened_ancient_tomb",
            "sunken_altar_reef"
        ],
        "locationWeightBoost": 1.5,
        "repeatPolicy": "repeatable",
        "cooldownSteps": 12,
        "memoryKey": "ancient_guardian"
    },
    {
        "id": "boss_shadow_column",
        "name": "黑影方尖碑",
        "icon": "🗿",
        "type": "mystery",
        "zones": [
            "boss"
        ],
        "weight": 1,
        "eventRole": "world_lore",
        "chapterRange": [
            3,
            3
        ],
        "description": "一座焦黑方尖碑立在風裡，表面刻著被火刮過的龍語。你看不懂全部內容，但反覆出現的符號都指向同一件事：龍巢不是巢，是被搬空的大陸心臟。",
        "choices": [
            {
                "text": "拓下符號",
                "intent": "取得經驗，並更理解終局地脈因果。",
                "results": [
                    {
                        "type": "exp",
                        "value": 80,
                        "message": "獲得 80 經驗。"
                    }
                ]
            },
            {
                "text": "沿裂紋注入魔力",
                "intent": "承受壓力，換取短暫攻擊提升。",
                "cost": {
                    "hp": 0.12,
                    "isPercent": true
                },
                "results": [
                    {
                        "type": "buff",
                        "buffType": "atk",
                        "value": 10,
                        "duration": 18,
                        "message": "短時間獲得戰鬥強化。"
                    }
                ]
            },
            {
                "text": "不要久留",
                "intent": "避免消耗，保留狀態。",
                "results": []
            }
        ],
        "landmarkIds": [
            "dragon_heat_crag"
        ],
        "locationWeightBoost": 1.6,
        "repeatPolicy": "chapter_once",
        "cooldownSteps": 0,
        "memoryKey": "boss_shadow_column"
    },
    {
        "id": "boss_dragon_nest_spoil",
        "name": "龍巢散落物",
        "icon": "💎",
        "type": "encounter",
        "zones": [
            "boss"
        ],
        "weight": 0.9,
        "eventRole": "risk_reward",
        "chapterRange": [
            3,
            3
        ],
        "description": "裂石間卡著一塊從龍巢掉落的魔力殘片，像寶石，也像一隻正在裝死的眼睛。拿走它可能有用，也可能讓某些存在更快注意到你。",
        "choices": [
            {
                "text": "小心取下殘片",
                "intent": "取得金幣與經驗，承擔少量傷害。",
                "cost": {
                    "hp": 0.08,
                    "isPercent": true
                },
                "results": [
                    {
                        "type": "gold",
                        "value": 120,
                        "message": "獲得 120G。"
                    },
                    {
                        "type": "exp",
                        "value": 70,
                        "message": "獲得 70 經驗。"
                    }
                ]
            },
            {
                "text": "用它磨亮武器",
                "intent": "不拿走殘片，換取攻擊提升。",
                "results": [
                    {
                        "type": "buff",
                        "buffType": "atk",
                        "value": 12,
                        "duration": 16,
                        "message": "短時間獲得戰鬥強化。"
                    }
                ]
            },
            {
                "text": "把它留在原地",
                "intent": "避開風險。",
                "results": []
            }
        ],
        "landmarkIds": [
            "dragon_heat_crag"
        ],
        "locationWeightBoost": 1.6,
        "repeatPolicy": "repeatable",
        "cooldownSteps": 12,
        "memoryKey": "boss_dragon_nest_spoil"
    }
];
