export const ZoneProfiles = {
    low: {
        id: 'low',
        name: '村外近郊',
        dangerLabel: '低威脅',
        icon: '🌿',
        summary: '村莊外圍仍有人走動，獵徑、木牌與舊營火讓你能辨認回程方向。',
        hint: '適合收集基礎材料、觀察怪物痕跡，並開始第一批痕跡鏈。',
        effectIds: ['open_trail']
    },
    medium: {
        id: 'medium',
        name: '腐根溪谷',
        dangerLabel: '中威脅',
        icon: '🪵',
        summary: '潮濕的根系覆住舊路，怪物不再只是巡遊，而像是在守著某些東西。',
        hint: '補給壓力開始提高，菁英痕跡與特殊素材會更常出現。',
        effectIds: ['rot_mist']
    },
    high: {
        id: 'high',
        name: '霧碑丘陵',
        dangerLabel: '高威脅',
        icon: '🪨',
        summary: '霧把遠處的輪廓吞掉，石碑、爪痕與破碎盔甲像是刻意排成一條路。',
        hint: '這裡的痕跡會開始指向首領與古代封印，但撤退成本也明顯升高。',
        effectIds: ['thick_fog', 'old_seal']
    },
    death: {
        id: 'death',
        name: '黑焰邊境',
        dangerLabel: '極高威脅',
        icon: '🔥',
        summary: '地面像被高溫燒裂，空氣中有龍焰與深層封印混在一起的味道。',
        hint: '不會阻止你進入，但普通遭遇都可能接近首領戰壓力。',
        effectIds: ['scorched_air']
    }
};

export const TerrainEffects = {
    open_trail: {
        id: 'open_trail',
        name: '舊獵徑',
        type: 'navigation',
        summary: '回程容易辨認，適合初期探索與撤退。',
        gameplay: '未來可降低補給消耗或提高撤退成功率。'
    },
    rot_mist: {
        id: 'rot_mist',
        name: '腐根濕霧',
        type: 'attrition',
        summary: '濕霧會讓補給變得沉重，也讓毒性材料更容易出現。',
        gameplay: '未來可提高補給消耗，並增加毒系素材與毒系怪物遭遇。'
    },
    thick_fog: {
        id: 'thick_fog',
        name: '濃霧遮蔽',
        type: 'visibility',
        summary: '怪物不一定會直接現身，更多時候只會先留下剪影與痕跡。',
        gameplay: '未來可隱藏怪物種類，改以足跡、叫聲、爪痕提示。'
    },
    old_seal: {
        id: 'old_seal',
        name: '古代封印',
        type: 'story',
        summary: '石碑文字會隨拓片逐步可讀，部分首領需要解讀後才會露出路徑。',
        gameplay: '可作為特殊圖紙、首領追蹤與結局碎片的觸發條件。'
    },
    safe_camp: {
        id: 'safe_camp',
        name: '殘存營地',
        type: 'recovery',
        summary: '營地能暫時穩住探索節奏，但火光也可能引來伏擊。',
        gameplay: '未來可提供一次休息、整理背包或風險型事件。'
    },
    lair_pressure: {
        id: 'lair_pressure',
        name: '巢穴壓迫',
        type: 'boss',
        summary: '越靠近巢穴，撤退越困難，首領相關怪物出現率越高。',
        gameplay: '未來可提高逃跑失敗率與狼系/首領前哨遭遇。'
    },
    scorched_air: {
        id: 'scorched_air',
        name: '焦灼空氣',
        type: 'attrition',
        summary: '熱浪會消耗裝備與藥水，也會把龍系痕跡保存得更清楚。',
        gameplay: '未來可加速耐久消耗，並提高龍系痕跡與素材收益。'
    }
};

export const WorldEncounterProfiles = {
    south_gate_farmland: {
        id: 'south_gate_farmland',
        name: '南門農田',
        storyNodeId: 'south_gate_farmland',
        entries: [
            { id: 'slime', weight: 55 },
            { id: 'giant_rat', weight: 20 },
            { id: 'goblin', weight: 10 },
            { id: 'wild_wolf', weight: 8 },
            { id: 'poison_spider', weight: 7 }
        ]
    },
    south_gate_farmland_focus: {
        id: 'south_gate_farmland_focus',
        name: '史萊姆靠近農田',
        storyNodeId: 'south_gate_farmland',
        questIds: ['main_002'],
        ambientRates: { battle: 0.16, event: 0.025 },
        entries: [
            { id: 'slime', weight: 72 },
            { id: 'giant_rat', weight: 14 },
            { id: 'goblin', weight: 6 },
            { id: 'wild_wolf', weight: 5 },
            { id: 'poison_spider', weight: 3 }
        ]
    },
    rotroot_wolf_track: {
        id: 'rotroot_wolf_track',
        name: '腐根溪谷狼跡',
        storyNodeId: 'rotroot_ravine',
        entries: [
            { id: 'wild_wolf', weight: 38 },
            { id: 'poison_spider', weight: 22 },
            { id: 'goblin', weight: 16 },
            { id: 'giant_rat', weight: 14 },
            { id: 'slime', weight: 10 }
        ]
    },
    rotroot_wolf_track_focus: {
        id: 'rotroot_wolf_track_focus',
        name: '狼群靠近腐根溪谷',
        storyNodeId: 'rotroot_ravine',
        questIds: ['main_005'],
        ambientRates: { battle: 0.18, event: 0.035 },
        entries: [
            { id: 'wild_wolf', weight: 64 },
            { id: 'poison_spider', weight: 16 },
            { id: 'goblin', weight: 10 },
            { id: 'giant_rat', weight: 7 },
            { id: 'slime', weight: 3 }
        ]
    },
    blood_moon_track: {
        id: 'blood_moon_track',
        name: '月苔坡獸徑',
        storyNodeId: 'moon_moss_slope',
        entries: [
            { id: 'wild_wolf', weight: 34 },
            { id: 'poison_spider', weight: 22 },
            { id: 'goblin', weight: 18 },
            { id: 'giant_rat', weight: 16 },
            { id: 'slime', weight: 10 }
        ]
    },
    blood_moon_track_focus: {
        id: 'blood_moon_track_focus',
        name: '角鹿出沒前的月苔坡',
        storyNodeId: 'moon_moss_slope',
        questIds: ['main_006'],
        ambientRates: { battle: 0.17, event: 0.04 },
        entries: [
            { id: 'wild_wolf', weight: 48 },
            { id: 'poison_spider', weight: 20 },
            { id: 'goblin', weight: 16 },
            { id: 'giant_rat', weight: 11 },
            { id: 'slime', weight: 5 }
        ]
    },
    thorn_glasshouse_track: {
        id: 'thorn_glasshouse_track',
        name: '荊棘溫室外圍',
        storyNodeId: 'thorn_glasshouse_ruin',
        questIds: ['main_008'],
        ambientRates: { battle: 0.19, event: 0.045 },
        entries: [
            { id: 'poison_spider', weight: 32 },
            { id: 'treant', weight: 28 },
            { id: 'shadow_bat', weight: 18 },
            { id: 'orc_warrior', weight: 14 },
            { id: 'wild_wolf', weight: 8 }
        ]
    },
    drowned_coast_track: {
        id: 'drowned_coast_track',
        name: '沉鐘海岸潮線',
        storyNodeId: 'drowned_bell_coast',
        questIds: ['main_009'],
        ambientRates: { battle: 0.18, event: 0.05 },
        entries: [
            { id: 'ghost', weight: 30 },
            { id: 'ice_elemental', weight: 24 },
            { id: 'thunder_elemental', weight: 18 },
            { id: 'skeleton_warrior', weight: 16 },
            { id: 'shadow_bat', weight: 12 }
        ]
    },
    ancient_tomb_track: {
        id: 'ancient_tomb_track',
        name: '掘開古墓墓道',
        storyNodeId: 'opened_ancient_tomb',
        questIds: ['main_010'],
        ambientRates: { battle: 0.2, event: 0.04 },
        entries: [
            { id: 'skeleton_warrior', weight: 32 },
            { id: 'ghost', weight: 24 },
            { id: 'shadow_soldier', weight: 18 },
            { id: 'shadow_mage', weight: 14 },
            { id: 'stone_golem_mini', weight: 12 }
        ]
    },
    obsidian_keep_track: {
        id: 'obsidian_keep_track',
        name: '黑曜石要塞外圍',
        storyNodeId: 'obsidian_keep_gate',
        questIds: ['main_011'],
        ambientRates: { battle: 0.2, event: 0.04 },
        entries: [
            { id: 'shadow_soldier', weight: 28 },
            { id: 'shadow_archer', weight: 22 },
            { id: 'orc_warrior', weight: 18 },
            { id: 'fire_elemental', weight: 16 },
            { id: 'shadow_mage', weight: 16 }
        ]
    },
    northern_drake_track: {
        id: 'northern_drake_track',
        name: '北境龍哨風雪線',
        storyNodeId: 'northern_drake_watch',
        questIds: ['main_012', 'main_013'],
        ambientRates: { battle: 0.2, event: 0.035 },
        entries: [
            { id: 'wyvern', weight: 30 },
            { id: 'drake', weight: 24 },
            { id: 'ice_elemental', weight: 18 },
            { id: 'dragon_knight', weight: 16 },
            { id: 'thunder_elemental', weight: 12 }
        ]
    },
    abyssal_break_track: {
        id: 'abyssal_break_track',
        name: '深淵封印裂口',
        storyNodeId: 'abyssal_seal_break',
        questIds: ['main_014', 'main_015'],
        ambientRates: { battle: 0.22, event: 0.035 },
        entries: [
            { id: 'demon_soldier', weight: 32 },
            { id: 'fire_elemental', weight: 22 },
            { id: 'shadow_general', weight: 16 },
            { id: 'demon_general', weight: 14 },
            { id: 'shadow_mage', weight: 16 }
        ]
    }
};

export const WorldClues = {
    bloodied_arrow_pouch: {
        id: 'bloodied_arrow_pouch',
        title: '破碎箭袋',
        chainId: 'forest_guardian',
        source: '地標',
        text: '箭袋被撕成三段，箭羽上沾著灰白狼毛。獵人被什麼東西逼進霧裡，連回頭的路都沒能留下。',
        lead: '尋找狼群活動更密集的溪谷或舊巢。'
    },
    wolf_fang_marks: {
        id: 'wolf_fang_marks',
        title: '不尋常的狼牙痕',
        chainId: 'forest_guardian',
        source: '擊殺野狼',
        text: '這些咬痕太整齊，像是狼群被某個更高階的意志驅趕。',
        lead: '狼群痕跡會把你帶向霧碑丘。'
    },
    mist_tablet_rubbing: {
        id: 'mist_tablet_rubbing',
        title: '霧碑拓印',
        chainId: 'forest_guardian',
        source: '石碑',
        text: '拓印上出現古樹與守衛者的輪廓，狼群只是守門的第一層。',
        lead: '收集足夠痕跡後，古樹守衛的核心地會變得可追蹤。'
    },
    black_bark_sample: {
        id: 'black_bark_sample',
        title: '發黑樹皮',
        chainId: 'forest_guardian',
        source: '腐根溪谷',
        text: '樹皮內側像被火燒過，但外側仍潮濕。污染的源頭看起來來自森林之外。',
        lead: '這個異常會在後期連到古龍與封印真相。'
    },
    carved_stone_shard: {
        id: 'carved_stone_shard',
        title: '刻痕石片',
        chainId: 'lich',
        source: '遺跡怪物',
        text: '石片上的字排列得像封印計數，每一筆都冷得像還沒死透的規則。',
        lead: '找到更多石片，才能判斷巫妖是在破壞封印還是在維持封印。'
    },
    dragon_heat_trace: {
        id: 'dragon_heat_trace',
        title: '殘留龍焰',
        chainId: 'elder_dragon',
        source: '黑焰邊境',
        text: '龍焰沒有四散燃燒，火痕沿著裂縫往北收束，像有什麼龐然之物把地脈熱流拖走。',
        lead: '這道守護痕跡沒有談判餘地，只留下更高威脅離去的方向。'
    }
};

Object.assign(WorldClues, {
    hunter_board_notice: {
        id: 'hunter_board_notice',
        title: '撕下的獵人告示',
        chainId: 'blood_moon_stag',
        source: '公佈欄',
        text: '告示上記錄著三晚月色下相同的鹿角影子，牠總在不同林徑留下血色苔痕。',
        lead: '比較不同地形的苔痕方向，可以縮小牠今晚可能移動的範圍。'
    },
    moon_moss_sample: {
        id: 'moon_moss_sample',
        title: '月苔樣本',
        chainId: 'blood_moon_stag',
        source: '地圖痕跡',
        text: '苔蘚在月光下泛紅，越靠近溪谷越快乾裂，像是在指向某條遷徙路線。',
        lead: '沿著溪谷與林徑交界探索，可能找到牠下一個停留點。'
    },
    broken_horn_map: {
        id: 'broken_horn_map',
        title: '折角路線圖',
        chainId: 'blood_moon_stag',
        source: '藏寶圖',
        text: '路線圖用三個折角標記出獸群曾經停下的位置，最後一角指向霧碑丘側坡。',
        lead: '如果先從舊獵徑繞路，可以避開一段危險追蹤。'
    },
    drowned_bell_rubbing: {
        id: 'drowned_bell_rubbing',
        title: '沉鐘拓印',
        chainId: 'drowned_oracle',
        source: '石碑',
        text: '拓印顯示三座小碑必須按水聲遠近依序觸碰，否則鐘聲會把位置洗掉。',
        lead: '謎題順序跟地圖距離無關，要照水聲遠近去讀。'
    },
    wet_treasure_fragment: {
        id: 'wet_treasure_fragment',
        title: '濕透的藏寶圖碎片',
        chainId: 'drowned_oracle',
        source: '藏寶圖',
        text: '碎片上畫著被溪水切開的半座祭壇，缺口方向與腐根溪谷的水流相反。',
        lead: '倒著推回水流源頭，能找到第一座碑。'
    },
    oracle_shell: {
        id: 'oracle_shell',
        title: '會回聲的殼',
        chainId: 'drowned_oracle',
        source: '怪物掉落',
        text: '殼內傳出不屬於附近水流的回音，像是在重複某個碑文節奏。',
        lead: '把殼帶到石碑附近，能驗證順序是否正確。'
    },
    sealed_wax_contract: {
        id: 'sealed_wax_contract',
        title: '封蠟委託書',
        chainId: 'ash_baron',
        source: '村民',
        text: '委託書要求你尋回被火灰商隊帶走的帳冊，落款卻故意被燒掉。',
        lead: '先問村口的搬運工，再比對公佈欄上的舊懸賞。'
    },
    ash_ledger_page: {
        id: 'ash_ledger_page',
        title: '灰燼帳冊頁',
        chainId: 'ash_baron',
        source: '隱藏道具',
        text: '帳冊頁列出幾批被運往黑焰邊境的礦石，但每筆都少了一個收貨人。',
        lead: '把帳冊交給知道商隊暗號的人，可以換到真正的會面地點。'
    },
    smuggled_coal_token: {
        id: 'smuggled_coal_token',
        title: '走私煤印',
        chainId: 'ash_baron',
        source: '交易',
        text: '煤印能讓守門人相信你是買家，但印面裂痕會暴露你並非原主。',
        lead: '用煤印能走捷徑，但會跳過部分報酬。'
    },
    thorn_trade_bead: {
        id: 'thorn_trade_bead',
        title: '荊棘交換珠',
        chainId: 'thorn_witch',
        source: '特殊物品',
        text: '交換珠會吸收植物汁液，據說只有懂得交換規則的女巫願意回答問題。',
        lead: '不要直接戰鬥，先找能讓交換珠變色的素材。'
    },
    villager_herb_request: {
        id: 'villager_herb_request',
        title: '村民的草藥請求',
        chainId: 'thorn_witch',
        source: '村民',
        text: '村民說草藥每次都在同一片林地消失，但採藥籃從未被破壞。',
        lead: '交付指定草藥後，村民會透露女巫交換規則。'
    },
    green_bargain_mark: {
        id: 'green_bargain_mark',
        title: '翠色交易印',
        chainId: 'thorn_witch',
        source: 'NPC 對話',
        text: '交易印像一種承諾。若違反約定，荊棘會主動追上來。',
        lead: '接受交易可取得 BOSS 情報，也可能觸發伏筆。'
    },
    silk_tripwire: {
        id: 'silk_tripwire',
        title: '銀絲絆線',
        chainId: 'ambush_mantis',
        source: '地圖痕跡',
        text: '絆線細到幾乎看不見，卻只設在玩家常走的回程路上。',
        lead: '反覆穿越同一區域會讓伏擊條件逐步成立。'
    },
    snapped_bait_hook: {
        id: 'snapped_bait_hook',
        title: '斷裂誘餌鉤',
        chainId: 'ambush_mantis',
        source: '製作',
        text: '誘餌鉤被整齊切斷，切面太新，代表某種東西一直跟在你後面。',
        lead: '帶著銀絲誘餌前往銀絲最密的伏道，才能反設陷阱引牠現身。'
    },
    survivor_warning: {
        id: 'survivor_warning',
        title: '倖存者警告',
        chainId: 'ambush_mantis',
        source: '村民',
        text: '倖存者說不要在同一段路點燃第二次營火，牠會記得光的位置。',
        lead: '重複行為是觸發條件，也能用來設陷阱。'
    }
});

export const WorldStoryChains = {
    forest_guardian: {
        id: 'forest_guardian',
        title: '發黑樹皮與古樹守衛',
        bossId: 'forest_guardian',
        method: '追蹤型',
        premise: '腐根溪谷的千年神木被剝離核心樹皮，地脈反噬讓守衛者陷入無意識防衛。',
        clueIds: ['bloodied_arrow_pouch', 'wolf_fang_marks', 'mist_tablet_rubbing', 'black_bark_sample'],
        stages: [
            { minClues: 0, text: '溪谷方向偶爾有焦黑煙霧，但還看不出森林為何失控。' },
            { minClues: 1, text: '獵人遺物與狼群痕跡顯示，某條舊路正在被刻意清空。' },
            { minClues: 2, text: '霧碑與焦黑根系指向同一件事：神木核心曾被外力剝離。' },
            { minClues: 3, text: '古樹守衛的位置逐漸明確，牠更像被迫失控的受害者。' }
        ]
    },
    lich: {
        id: 'lich',
        title: '石片與墓下封印',
        bossId: 'lich',
        method: '封印型',
        premise: '遺跡怪物攜帶的石片能拼出巫妖所在，但石片也暗示牠可能在守住更深層的東西。',
        clueIds: ['carved_stone_shard'],
        stages: [
            { minClues: 0, text: '遺跡的石像仍沉默，地下封印的輪廓尚未浮現。' },
            { minClues: 1, text: '石片證明巫妖和封印有關，牠的敵意可能不是故事的全貌。' }
        ]
    },
    elder_dragon: {
        id: 'elder_dragon',
        title: '古龍與黑焰裂縫',
        bossId: 'elder_dragon',
        method: '先行傳說 / 終局伏筆',
        premise: '村莊傳說把古龍稱為災厄，邊境痕跡則顯示牠正把地脈精華拖往北方。',
        clueIds: ['dragon_heat_trace', 'black_bark_sample'],
        stages: [
            { minClues: 0, text: '所有人都說古龍造成異變，但還沒有人真正走到黑焰源頭。' },
            { minClues: 1, text: '龍焰痕跡像是拖拽地脈熱流的路線，普通怪物留不下這種傷口。' },
            { minClues: 2, text: '森林污染與龍焰裂縫連成同一條線，北方邊境正在聚集大量地脈精華。' }
        ]
    }
};

Object.assign(WorldStoryChains, {
    blood_moon_stag: {
        id: 'blood_moon_stag',
        title: '血月角鹿',
        bossId: 'blood_moon_stag',
        method: '狩獵型',
        premise: '牠不守巢穴，而是在月色與地形之間移動。玩家必須用痕跡縮小狩獵範圍。',
        clueIds: ['hunter_board_notice', 'moon_moss_sample', 'broken_horn_map'],
        stages: [
            { minClues: 0, text: '你只知道有一頭角鹿在夜裡反覆出沒。' },
            { minClues: 1, text: '痕跡指向牠會沿著林徑與溪谷交界移動。' },
            { minClues: 2, text: '牠今晚的活動範圍已能被縮到兩個地點。' },
            { minClues: 3, text: '只要放置誘導標記，就能把牠逼向月苔坡。' }
        ]
    },
    drowned_oracle: {
        id: 'drowned_oracle',
        title: '沉鐘神諭',
        bossId: 'drowned_oracle',
        method: '解謎型',
        premise: '腐根溪谷的水聲藏著石碑順序，解錯會洗掉定位，解對才會浮出祭壇。',
        clueIds: ['drowned_bell_rubbing', 'wet_treasure_fragment', 'oracle_shell'],
        stages: [
            { minClues: 0, text: '溪谷裡偶爾傳來不像水流的鐘聲。' },
            { minClues: 1, text: '石碑順序與聲音遠近有關，地圖距離幫不上忙。' },
            { minClues: 2, text: '藏寶圖能定位第一座碑，回聲殼能驗證節奏。' },
            { minClues: 3, text: '三碑順序已完整，沉鐘祭壇可以被喚起。' }
        ]
    },
    ash_baron: {
        id: 'ash_baron',
        title: '灰燼男爵',
        bossId: 'ash_baron',
        method: '委託型',
        premise: '村民的委託牽出黑焰邊境的走私網，玩家可調查或交易換到會面位置。',
        clueIds: ['sealed_wax_contract', 'ash_ledger_page', 'smuggled_coal_token'],
        stages: [
            { minClues: 0, text: '公佈欄上有一張被人撕過的舊委託。' },
            { minClues: 1, text: '委託背後像是有人故意引你追查商隊。' },
            { minClues: 2, text: '帳冊缺頁能證明灰燼男爵在邊境收貨。' },
            { minClues: 3, text: '煤印足以換到會面情報，也能冒險偽裝成買家。' }
        ]
    },
    thorn_witch: {
        id: 'thorn_witch',
        title: '荊棘女巫',
        bossId: 'thorn_witch',
        method: '交易型',
        premise: '女巫不主動宣戰。玩家必須找到交換物、理解規則，再決定交易或背約。',
        clueIds: ['thorn_trade_bead', 'villager_herb_request', 'green_bargain_mark'],
        stages: [
            { minClues: 0, text: '林地裡有些物品會被拿走，卻會留下等值的東西。' },
            { minClues: 1, text: '交換珠證明現場有一套交易規則，遠比普通偷竊麻煩。' },
            { minClues: 2, text: '村民知道女巫要什麼，但不敢自己交付。' },
            { minClues: 3, text: '交易可換到 BOSS 情報，背約則會讓女巫主動現身。' }
        ]
    },
    ambush_mantis: {
        id: 'ambush_mantis',
        title: '銀鐮伏獵者',
        bossId: 'ambush_mantis',
        method: '伏擊型',
        premise: '牠會觀察玩家習慣。重複路線、營火與誘餌會讓伏擊條件逐步成立。',
        clueIds: ['silk_tripwire', 'snapped_bait_hook', 'survivor_warning'],
        stages: [
            { minClues: 0, text: '你偶爾覺得回程路被什麼東西量過。' },
            { minClues: 1, text: '銀絲不在前路，而在你可能回頭的位置。' },
            { minClues: 2, text: '誘餌能吸引牠，但也會讓你被反向追蹤。' },
            { minClues: 3, text: '只要重複指定行為，牠會主動把你拖入伏擊戰。' }
        ]
    }
});

Object.assign(WorldClues, {
    dragon_nest_resonance: {
        id: 'dragon_nest_resonance',
        title: '龍巢共鳴殘響',
        chainId: 'demon_lord_asariel',
        source: '龍巢殘骸',
        text: '古龍倒下後，巢穴裡堆疊的核心魔力沒有散去，而是被地底某個黑暗節奏牽引。',
        lead: '龍巢不是終點。跟著共鳴往黑焰邊境走，能找到真正吞噬魔力的源頭。'
    },
    abyss_vanguard_oath: {
        id: 'abyss_vanguard_oath',
        title: '深淵先鋒誓文',
        chainId: 'demon_lord_asariel',
        source: '怪物掉落',
        text: '誓文要求先鋒不要攻城，而是保護前往龍巢殘骸的黑焰道路。',
        lead: '阿薩謝爾的目標不是王都，而是古龍留下的集中魔力。'
    },
    cracked_crown_mark: {
        id: 'cracked_crown_mark',
        title: '裂冠黑印',
        chainId: 'demon_lord_asariel',
        source: '深淵裂口',
        text: '黑印像王冠，又像把世界釘住的裂痕。它每次閃爍，都讓龍巢方向的魔力少一點。',
        lead: '黑印穩定後，阿薩謝爾會親自越過封印裂口。'
    }
});

Object.assign(WorldStoryChains, {
    demon_lord_asariel: {
        id: 'demon_lord_asariel',
        title: '魔王阿薩謝爾',
        bossId: 'demon_lord_asariel',
        method: '終局型',
        premise: '魔王並非古龍盟友。牠要奪取龍巢集中魔力，把地脈崩毀變成終焉之戰。',
        clueIds: ['dragon_nest_resonance', 'abyss_vanguard_oath', 'cracked_crown_mark'],
        stages: [
            { minClues: 0, text: '深淵裂口仍像遠方傳聞，魔王的目標尚未完全顯露。' },
            { minClues: 1, text: '龍巢殘響被地下黑光牽引，古龍之死打開了更糟的道路。' },
            { minClues: 2, text: '深淵軍隊的目標不是王都，而是保護通往龍巢魔力源的路。' },
            { minClues: 3, text: '裂冠黑印穩定，阿薩謝爾即將從封印裂口親自現身。' }
        ]
    }
});

const BossFlowDesigns = {
    forest_guardian: {
        archetype: '追蹤型',
        entries: ['怪物掉落', '地圖痕跡', '石碑拓片', '藏寶圖定位'],
        infoSources: ['怪物掉落', '地圖痕跡', '石碑', '藏寶圖'],
        progressMethods: [
            { id: 'kill_wolves', label: '擊殺狼群並比對牙痕', type: '擊殺' },
            { id: 'track_mist_marks', label: '探索霧碑與溪谷痕跡', type: '追蹤' },
            { id: 'solve_tablet_hint', label: '解讀霧碑拓印', type: '解謎' }
        ],
        revealMethods: ['模糊方向', '新地標', '地圖標記'],
        mapPuzzle: { id: 'mist_fang_route', label: '依牙痕、箭袋、碑文排列出古樹根心方向' },
        shortcut: { id: 'hunter_cut', label: '修復獵人棧道，跳過一段高危追蹤' },
        finalTrigger: { id: 'enter_root_heart', label: '進入古樹根心', type: '進入巢穴', requiredClues: 3, requiredProgress: 2 }
    },
    lich: {
        archetype: '封印型',
        entries: ['石碑', '怪物掉落', '地標謎題'],
        infoSources: ['石碑', '怪物掉落', '地圖痕跡'],
        progressMethods: [
            { id: 'collect_rune_shards', label: '收集刻紋石片', type: '探索' },
            { id: 'cleanse_tablets', label: '解除霧碑丘封印', type: '解謎' },
            { id: 'survive_curse', label: '在詛咒區域生存一段時間', type: '生存' }
        ],
        revealMethods: ['新地標', '特殊事件', '模糊方向'],
        mapPuzzle: { id: 'seal_order', label: '依石碑裂痕順序解除三處封印' },
        shortcut: { id: 'silver_salt', label: '製作銀鹽粉，直接穩定其中一處封印' },
        finalTrigger: { id: 'break_last_seal', label: '解開最後封印', type: '解開封印', requiredClues: 1, requiredProgress: 2 }
    },
    elder_dragon: {
        archetype: '召喚型',
        entries: ['公佈欄', '龍焰痕跡', '黑焰石碑', '怪物掉落'],
        infoSources: ['公佈欄', '怪物掉落', '地圖痕跡', '石碑'],
        progressMethods: [
            { id: 'collect_heat_traces', label: '收集龍焰熱痕', type: '追蹤' },
            { id: 'craft_dragon_lure', label: '製作龍焰誘餌', type: '製作' },
            { id: 'survive_black_flame', label: '在黑焰邊境生存', type: '生存' }
        ],
        revealMethods: ['模糊方向', '特殊事件', '地圖標記'],
        mapPuzzle: { id: 'obelisk_heat_path', label: '依黑焰方尖碑的熱痕定位召喚圓' },
        shortcut: { id: 'ancient_scale', label: '交出古龍鱗片，跳過誘餌製作' },
        finalTrigger: { id: 'summon_at_obelisk', label: '在焦黑方尖碑完成召喚', type: '召喚', requiredClues: 2, requiredProgress: 2 }
    },
    demon_lord_asariel: {
        archetype: '終局型',
        entries: ['龍巢殘骸', '深淵先鋒掉落', '黑焰裂口', '村長回報'],
        infoSources: ['怪物掉落', '地圖痕跡', '地標事件', 'NPC 對話'],
        progressMethods: [
            { id: 'read_nest_resonance', label: '讀懂龍巢共鳴殘響', type: '探索' },
            { id: 'break_vanguard_oath', label: '擊退深淵先鋒並取得誓文', type: '擊殺' },
            { id: 'stabilize_crown_mark', label: '在深淵裂口穩定裂冠黑印', type: '解謎' }
        ],
        revealMethods: ['特殊事件', '模糊方向', '地圖標記'],
        mapPuzzle: { id: 'crown_resonance_order', label: '依龍巢殘響、先鋒誓文、裂冠黑印判斷魔王現身順序' },
        shortcut: { id: 'world_shard_anchor', label: '交出世界碎片，直接穩定一段黑印' },
        finalTrigger: { id: 'enter_abyssal_breach', label: '進入深淵封印裂口', type: '進入巢穴', requiredClues: 3, requiredProgress: 2 }
    },
    blood_moon_stag: {
        archetype: '狩獵型',
        entries: ['公佈欄', '地圖痕跡', '藏寶圖', '怪物掉落'],
        infoSources: ['公佈欄', '地圖痕跡', '藏寶圖'],
        progressMethods: [
            { id: 'mark_moon_moss', label: '標記月苔痕跡', type: '追蹤' },
            { id: 'compare_migration', label: '比對遷徙路線', type: '探索' },
            { id: 'set_hunt_marker', label: '設置狩獵標記', type: '製作' }
        ],
        revealMethods: ['模糊方向', '地圖標記', '新地標'],
        mapPuzzle: { id: 'three_horn_marks', label: '用三個折角標記推回今晚移動路線' },
        shortcut: { id: 'old_ranger_path', label: '走舊巡守小徑，少一次追蹤檢定' },
        finalTrigger: { id: 'complete_bait', label: '完成月苔誘導標記', type: '完成誘餌', requiredClues: 2, requiredProgress: 2 }
    },
    drowned_oracle: {
        archetype: '解謎型',
        entries: ['石碑', '藏寶圖', '怪物掉落', '地圖痕跡'],
        infoSources: ['石碑', '藏寶圖', '怪物掉落'],
        progressMethods: [
            { id: 'find_first_bell', label: '定位第一座沉鐘碑', type: '探索' },
            { id: 'solve_water_order', label: '解出水聲順序', type: '解謎' },
            { id: 'use_echo_shell', label: '用回聲殼驗證節奏', type: '交付' }
        ],
        revealMethods: ['新地標', '特殊事件', '地圖標記'],
        mapPuzzle: { id: 'bell_sequence', label: '依水聲遠近觸碰三座小碑' },
        shortcut: { id: 'broken_channel', label: '疏通斷水道，直接確認第二座碑' },
        finalTrigger: { id: 'raise_sunken_altar', label: '讓沉鐘祭壇浮出', type: '召喚', requiredClues: 2, requiredProgress: 2 }
    },
    ash_baron: {
        archetype: '委託型',
        entries: ['村民', '公佈欄', '隱藏道具', '交易'],
        infoSources: ['村民', '公佈欄', '隱藏道具', '交易'],
        progressMethods: [
            { id: 'accept_contract', label: '接受封蠟委託', type: '交付' },
            { id: 'recover_ledger', label: '找回灰燼帳冊頁', type: '探索' },
            { id: 'trade_coal_token', label: '用煤印換取會面地點', type: '交付' }
        ],
        revealMethods: ['NPC 對話', '特殊事件', '地圖標記'],
        mapPuzzle: { id: 'ledger_route', label: '用帳冊運貨順序定位黑焰倉門' },
        shortcut: { id: 'fake_buyer', label: '偽裝買家，直接進入會面事件' },
        finalTrigger: { id: 'enter_smuggler_meeting', label: '進入走私會面', type: '進入巢穴', requiredClues: 2, requiredProgress: 2 }
    },
    thorn_witch: {
        archetype: '交易型',
        entries: ['特殊物品', '村民', 'NPC 對話', '地圖痕跡'],
        infoSources: ['特殊物品', '村民', 'NPC 對話', '隱藏道具'],
        progressMethods: [
            { id: 'color_trade_bead', label: '讓交換珠變色', type: '製作' },
            { id: 'deliver_herbs', label: '交付村民草藥', type: '交付' },
            { id: 'choose_bargain', label: '接受或破壞交易規則', type: '交付' }
        ],
        revealMethods: ['NPC 對話', '特殊事件', '模糊方向'],
        mapPuzzle: { id: 'thorn_value_rule', label: '依交換物價值找出女巫藏身林地' },
        shortcut: { id: 'honest_bargain', label: '誠實交易可直接換取 BOSS 情報' },
        finalTrigger: { id: 'break_or_complete_bargain', label: '完成或背棄交易', type: '完成誘餌', requiredClues: 2, requiredProgress: 2 }
    },
    ambush_mantis: {
        archetype: '伏擊型',
        entries: ['地圖痕跡', '製作', '村民', '生存紀錄'],
        infoSources: ['地圖痕跡', '村民', '隱藏道具'],
        progressMethods: [
            { id: 'repeat_route', label: '重複穿越同一條路', type: '探索' },
            { id: 'craft_bait_hook', label: '製作誘餌鉤', type: '製作' },
            { id: 'survive_second_campfire', label: '第二次營火後生存', type: '生存' }
        ],
        revealMethods: ['特殊事件', '模糊方向', 'NPC 對話'],
        mapPuzzle: { id: 'ambush_loop', label: '找出哪段回程路會讓銀絲收束' },
        shortcut: { id: 'reverse_trap', label: '用誘餌鉤反設陷阱，提早觸發伏擊' },
        finalTrigger: {
            id: 'boss_ambushes_player',
            label: '在銀絲伏道設置銀絲誘餌',
            type: '被伏擊',
            requiredClues: 2,
            requiredClueIds: ['silk_tripwire', 'snapped_bait_hook'],
            requiredProgress: 2,
            requiredProgressIds: ['repeat_route', 'craft_bait_hook']
        }
    }
};

for (const [chainId, design] of Object.entries(BossFlowDesigns)) {
    if (WorldStoryChains[chainId]) {
        Object.assign(WorldStoryChains[chainId], design);
    }
}

export const WorldLandmarks = [
    {
        id: 'south_gate_farmland',
        name: '南門農田',
        icon: '🌾',
        zones: ['low'],
        effectIds: ['open_trail'],
        visible: 'always',
        chapter: 1,
        questIds: ['main_001', 'main_002'],
        storyChainIds: ['ambush_mantis'],
        clueIds: [],
        encounterProfileId: 'south_gate_farmland',
        focusEncounterProfileId: 'south_gate_farmland_focus',
        encounterRadius: 4,
        regionRadius: 3.2,
        mapOffset: { x: 0, y: 4 },
        arrival: '南門外的田埂被黏液拖出亮痕，村民說昨晚水溝邊一直傳來濕答答的聲音。',
        repeat: '田埂上的黏液又新了一層，史萊姆似乎更常沿著水溝靠近城鎮。',
        mapHint: '村長要你確認的近郊路線，也是書記提到史萊姆增生的位置。'
    },
    {
        id: 'hunter_boardwalk',
        name: '獵人棧道',
        icon: '🪵',
        zones: ['low'],
        effectIds: ['open_trail'],
        visible: 'always',
        chapter: 1,
        questIds: ['main_004'],
        storyChainIds: ['ambush_mantis', 'forest_guardian'],
        clueIds: [],
        regionRadius: 2.2,
        mapOffset: { x: -5, y: 2 },
        arrival: '木板路邊沒有腳印，只有幾條銀色細線橫在回程方向。',
        repeat: '銀絲被你撥開後又出現在相近的位置，像有人重新量過這條路。',
        mapHint: '獵人舊路，適合開始調查銀絲伏擊。'
    },
    {
        id: 'old_campfire_site',
        name: '舊營火點',
        icon: '🔥',
        zones: ['low'],
        effectIds: ['safe_camp'],
        visible: 'always',
        chapter: 1,
        questIds: ['main_004'],
        storyChainIds: ['ambush_mantis'],
        clueIds: [],
        regionRadius: 1.8,
        mapOffset: { x: -8, y: 0 },
        arrival: '灰燼裡插著半截木牌，上面只剩一句話：不要在同一段路點第二次火。',
        repeat: '營火灰燼被撥成細長弧線，像是在標出某種伏擊距離。',
        mapHint: '倖存者留下警告的營地。'
    },
    {
        id: 'cut_roadsign',
        name: '被割裂的木牌',
        icon: '🪧',
        zones: ['low'],
        effectIds: ['open_trail'],
        visible: 'always',
        chapter: 1,
        questIds: ['main_003', 'main_004'],
        storyChainIds: ['ambush_mantis'],
        clueIds: [],
        regionRadius: 1.6,
        mapOffset: { x: -7, y: -4 },
        arrival: '路牌被整齊切成兩半，斷面旁掛著一枚折斷的誘餌鉤。',
        repeat: '你能看見木牌切口旁的新鮮細痕，像是刀鋒剛擦過。',
        mapHint: '可確認誘餌鉤與銀絲伏擊的關聯。'
    },
    {
        id: 'silver_snare_pass',
        name: '銀絲伏道',
        icon: '🕸️',
        zones: ['low', 'medium'],
        effectIds: ['lair_pressure'],
        visible: 'always',
        chapter: 1,
        questIds: ['main_004'],
        storyChainIds: ['ambush_mantis'],
        clueIds: [],
        regionRadius: 2,
        mapOffset: { x: -11, y: -5 },
        arrival: '這段小路太安靜，安靜到每一步都像踩在看不見的線上。',
        repeat: '銀絲伏道沒有首領裸露等待，只有越來越明顯的被觀察感。',
        mapHint: '銀鐮伏獵者的最終伏擊敘事地標。'
    },
    {
        id: 'broken_horn_camp',
        name: '斷角營地',
        icon: '⛺',
        zones: ['low', 'medium'],
        effectIds: ['safe_camp'],
        visible: 'always',
        chapter: 1,
        questIds: ['main_005'],
        storyChainIds: ['forest_guardian', 'blood_moon_stag'],
        clueIds: [],
        encounterProfileId: 'rotroot_wolf_track',
        focusEncounterProfileId: 'rotroot_wolf_track_focus',
        focusQuestIds: ['main_005'],
        encounterRadius: 4,
        regionRadius: 2.2,
        mapOffset: { x: -13, y: -2 },
        arrival: '營火早已熄滅，木樁上掛著半截獸角與發黑的樹皮。',
        repeat: '營地仍能短暫避風，但周圍的狼嚎比上次更靠近。',
        mapHint: '可作為探索節奏的停靠點，也可能藏著支線物證。'
    },
    {
        id: 'rotroot_ravine',
        name: '腐根溪谷',
        icon: '☣',
        zones: ['medium'],
        effectIds: ['rot_mist'],
        visible: 'always',
        chapter: 1,
        questIds: ['main_005'],
        storyChainIds: ['forest_guardian'],
        clueIds: [],
        encounterProfileId: 'rotroot_wolf_track',
        focusEncounterProfileId: 'rotroot_wolf_track_focus',
        focusQuestIds: ['main_005'],
        encounterRadius: 5,
        regionRadius: 3,
        mapOffset: { x: -17, y: -5 },
        arrival: '腐爛根系把溪水染成深褐色，岸邊有被狼群踩亂的藥草叢。',
        repeat: '溪谷的濕霧仍在變厚，像是有什麼從地底往上滲。',
        mapHint: '毒性材料與狼群痕跡交會的地點。'
    },
    {
        id: 'mist_tablet_hill',
        name: '霧碑丘',
        icon: '🪨',
        zones: ['high'],
        effectIds: ['thick_fog', 'old_seal'],
        visible: 'always',
        chapter: 1,
        questIds: ['main_005', 'main_007'],
        storyChainIds: ['forest_guardian', 'lich'],
        clueIds: [],
        encounterProfileId: 'rotroot_wolf_track',
        focusEncounterProfileId: 'rotroot_wolf_track_focus',
        focusQuestIds: ['main_005'],
        encounterRadius: 4,
        regionRadius: 2.4,
        mapOffset: { x: -21, y: -8 },
        arrival: '石碑被霧包住，表面的刻痕在你靠近後才像露水一樣浮出。',
        repeat: '拓印邊緣多出幾道你之前看不懂的線，像是指向森林更深處。',
        mapHint: '石碑、古代文字與首領追蹤的重要節點。'
    },
    {
        id: 'old_wolf_den',
        name: '古樹根心',
        icon: '🐺',
        zones: ['high'],
        effectIds: ['lair_pressure'],
        visible: 'always',
        chapter: 1,
        questIds: ['main_005'],
        storyChainIds: ['forest_guardian'],
        clueIds: [],
        encounterProfileId: 'rotroot_wolf_track',
        focusEncounterProfileId: 'rotroot_wolf_track_focus',
        focusQuestIds: ['main_005'],
        encounterRadius: 4,
        regionRadius: 2.6,
        mapOffset: { x: -25, y: -11 },
        arrival: '根鬚從岩縫裡伸出，像一顆被迫裸露在地表下方的心臟。',
        repeat: '焦黑根鬚仍在緩慢收縮，守衛者的痛苦沒有完全平息。',
        mapHint: '古樹守衛者的核心追蹤地標。'
    },
    {
        id: 'moon_moss_slope',
        name: '月苔坡',
        icon: '🌙',
        zones: ['medium'],
        effectIds: ['rot_mist'],
        visible: 'always',
        chapter: 1,
        questIds: ['main_006'],
        storyChainIds: ['blood_moon_stag'],
        clueIds: [],
        encounterProfileId: 'blood_moon_track',
        focusEncounterProfileId: 'blood_moon_track_focus',
        focusQuestIds: ['main_006'],
        encounterRadius: 5,
        regionRadius: 2.8,
        mapOffset: { x: -16, y: -11 },
        arrival: '坡面苔蘚在陰影裡泛著暗紅色，像把鹿角撞擊的路線一段段染出來。',
        repeat: '月苔乾裂得更快，表示角鹿今晚可能又繞回這裡。',
        mapHint: '完成誘導標記後，可縮小血月角鹿狩獵範圍。'
    },
    {
        id: 'thorn_glasshouse_ruin',
        name: '荊棘溫室遺址',
        icon: '🌿',
        zones: ['high'],
        effectIds: ['rot_mist', 'lair_pressure'],
        visible: 'always',
        chapter: 2,
        questIds: ['main_008'],
        storyChainIds: ['thorn_witch'],
        clueIds: [],
        encounterProfileId: 'thorn_glasshouse_track',
        encounterRadius: 5,
        regionRadius: 2.8,
        mapOffset: { x: -26, y: 1 },
        arrival: '藤蔓像被燒斷的神經一樣爬滿碎玻璃。越靠近溫室，空氣裡越像有人把草藥和壞脾氣一起煮乾。',
        repeat: '溫室外仍有細小荊棘在地面試探，像是在替某個失去耐心的主人量你的腳步。',
        mapHint: '西方叢林深處有被荊棘封住的玻璃殘牆，村民說那裡以前種著能救命的草。'
    },
    {
        id: 'drowned_bell_coast',
        name: '沉鐘海岸',
        icon: '🌊',
        zones: ['medium', 'high'],
        effectIds: ['thick_fog', 'old_seal'],
        visible: 'always',
        chapter: 2,
        questIds: ['main_009'],
        storyChainIds: ['drowned_oracle'],
        clueIds: [],
        encounterProfileId: 'drowned_coast_track',
        encounterRadius: 5,
        regionRadius: 3,
        mapOffset: { x: 18, y: 6 },
        arrival: '海岸的鐘聲不是從鐘裡傳來，而是從浪底浮上來。每一下都像在提醒你，海不該記得這麼多事。',
        repeat: '潮水退下又湧回，沙面上短暫露出古老祭壇的刻痕，很快又被泡沫藏起來。',
        mapHint: '東方海岸偶爾傳來沉鐘聲，越靠近聲音，潮水越像在往陸地爬。'
    },
    {
        id: 'sunken_altar_reef',
        name: '浮出祭壇',
        icon: '🔔',
        zones: ['high'],
        effectIds: ['old_seal', 'lair_pressure'],
        visible: 'always',
        chapter: 2,
        questIds: ['main_009'],
        storyChainIds: ['drowned_oracle'],
        clueIds: [],
        encounterProfileId: 'drowned_coast_track',
        encounterRadius: 4,
        regionRadius: 2.5,
        mapOffset: { x: 24, y: 8 },
        arrival: '礁石間浮著不該見光的石階，濕滑階面上全是被海水磨平的祈禱文字。',
        repeat: '祭壇每隔一段時間就低沉震動，像海底有什麼東西還在逼它下沉。',
        mapHint: '沉鐘聲的盡頭不是港口，而是一座從海裡浮起來的祭壇。'
    },
    {
        id: 'opened_ancient_tomb',
        name: '掘開古墓',
        icon: '⚰️',
        zones: ['high'],
        effectIds: ['old_seal', 'lair_pressure'],
        visible: 'always',
        chapter: 2,
        questIds: ['main_010'],
        storyChainIds: ['lich'],
        clueIds: [],
        encounterProfileId: 'ancient_tomb_track',
        encounterRadius: 5,
        regionRadius: 2.8,
        mapOffset: { x: 13, y: -17 },
        arrival: '古墓入口被粗暴鑿開，石棺蓋像被嫌礙事的門板一樣丟在路旁。這種盜墓手法很有效，也很欠揍。',
        repeat: '墓道裡有細碎的骨頭摩擦聲，像一支不太整齊、但非常努力的軍隊正在集合。',
        mapHint: '東北方丘陵有座被外力挖開的古墓，附近開始出現不該走路的骷髏。'
    },
    {
        id: 'obsidian_keep_gate',
        name: '黑曜石要塞',
        icon: '🏰',
        zones: ['high'],
        effectIds: ['scorched_air', 'lair_pressure'],
        visible: 'always',
        chapter: 2,
        questIds: ['main_011'],
        storyChainIds: ['ash_baron'],
        clueIds: [],
        encounterProfileId: 'obsidian_keep_track',
        encounterRadius: 5,
        regionRadius: 3,
        mapOffset: { x: 22, y: 12 },
        arrival: '要塞城門被新鑄的黑鐵封住，外牆還貼著徵收告示。字跡很工整，內容很不做人。',
        repeat: '城牆內偶爾傳出鐵鎚聲與哭喊聲，兩者節奏一致得令人不舒服。',
        mapHint: '東南方的黑曜石要塞正在囤積糧食與鐵器，附近村落的炊煙一天天少下去。'
    },
    {
        id: 'black_iron_storehouse',
        name: '黑鐵倉門',
        icon: '⛓️',
        zones: ['death'],
        effectIds: ['scorched_air', 'old_seal'],
        visible: 'always',
        chapter: 2,
        questIds: ['main_011'],
        storyChainIds: ['ash_baron'],
        clueIds: [],
        encounterProfileId: 'obsidian_keep_track',
        encounterRadius: 4,
        regionRadius: 2.4,
        mapOffset: { x: 27, y: 17 },
        arrival: '巨大的倉門後方傳來拖行鐵器的聲音。灰燼男爵把末日當成帳本，而所有人都被寫在支出欄。',
        repeat: '倉門縫隙飄出鉛灰色粉塵，落在手套上像不願離開的灰。',
        mapHint: '黑曜石要塞深處有黑鐵倉門，男爵真正害怕的東西可能藏在門後。'
    },
    {
        id: 'northern_drake_watch',
        name: '北境龍哨',
        icon: '🐉',
        zones: ['high'],
        effectIds: ['thick_fog', 'scorched_air'],
        visible: 'always',
        chapter: 3,
        questIds: ['main_012'],
        storyChainIds: ['elder_dragon'],
        clueIds: [],
        encounterProfileId: 'northern_drake_track',
        encounterRadius: 5,
        regionRadius: 3,
        mapOffset: { x: 0, y: -24 },
        arrival: '北境風雪裡插著被燒黑的哨旗。旗面沒有敵人的徽記，只有龍息燙穿的洞。',
        repeat: '遠方偶爾有影子掠過雪幕，太大、太安靜，讓人很難假裝那只是鳥。',
        mapHint: '北方邊境的哨站失去聯絡，雪地上有被高熱融穿又重新結冰的足跡。'
    },
    {
        id: 'dragon_heat_crag',
        name: '龍焰裂脊',
        icon: '🔥',
        zones: ['high', 'death'],
        effectIds: ['scorched_air', 'lair_pressure'],
        visible: 'always',
        chapter: 3,
        questIds: ['main_012', 'main_013'],
        storyChainIds: ['elder_dragon'],
        clueIds: [],
        encounterProfileId: 'northern_drake_track',
        encounterRadius: 5,
        regionRadius: 2.8,
        mapOffset: { x: 9, y: -28 },
        arrival: '山脊被龍焰劈成黑紅色裂口，雪還沒落地就化成蒸氣。你開始理解為什麼有人會把冬眠修成災難。',
        repeat: '裂脊下方傳出低沉呼吸，像整座山正在夢見火。',
        mapHint: '北方更深處有一道被龍焰燒開的山脊，所有熱痕都指向同一個巢。'
    },
    {
        id: 'abyssal_seal_break',
        name: '深淵封印裂口',
        icon: '🕳️',
        zones: ['death'],
        effectIds: ['scorched_air', 'old_seal'],
        visible: 'always',
        chapter: 3,
        questIds: ['main_014', 'main_015'],
        storyChainIds: ['elder_dragon', 'demon_lord_asariel'],
        clueIds: [],
        encounterProfileId: 'abyssal_break_track',
        encounterRadius: 5,
        regionRadius: 3,
        mapOffset: { x: 28, y: 22 },
        arrival: '地面裂開的縫隙裡沒有風，只有像心跳一樣的黑光。魔王不是從遠方來的，他一直在下面等。',
        repeat: '裂口邊緣偶爾落下一點碎石，卻聽不到落地聲。',
        mapHint: '東南方的深淵封印正在崩裂，龍巢的魔力與地下的黑光開始互相牽引。'
    },
    {
        id: 'charred_obelisk',
        name: '焦黑方尖碑',
        icon: '🔥',
        zones: ['death'],
        effectIds: ['scorched_air', 'old_seal'],
        visible: 'always',
        chapter: 3,
        questIds: ['main_013'],
        storyChainIds: ['elder_dragon'],
        clueIds: [],
        encounterProfileId: 'northern_drake_track',
        encounterRadius: 4,
        regionRadius: 3.2,
        mapOffset: { x: 4, y: -30 },
        arrival: '方尖碑沒有被龍焰熔掉，反而像被龍焰固定住，裂縫下方傳出沉悶回響。',
        repeat: '碑面仍有熱度，但你已能分辨哪些痕跡是攻擊，哪些像是封印。',
        mapHint: '終局真相的早期伏筆，不要求玩家立刻完成。'
    }
];

export const MonsterClueTriggers = [
    {
        monsterIds: ['stone_golem', 'stone_golem_mini', 'ancient_guardian', 'rune_keeper'],
        clueId: 'carved_stone_shard',
        chance: 0.25,
        message: '碎裂石片上有一段像封印計數的刻痕。'
    },
    {
        monsterIds: ['wyvern', 'drake', 'dragon_knight', 'elder_dragon'],
        clueId: 'dragon_heat_trace',
        chance: 0.2,
        message: '龍焰殘留沒有擴散，而是沿著裂縫被壓成一條線。'
    },
    {
        monsterIds: ['demon_soldier', 'demon_general'],
        clueId: 'abyss_vanguard_oath',
        chance: 0.18,
        message: '你在深淵先鋒身上找到一段燒焦誓文，內容指向龍巢殘骸。'
    },
    {
        monsterIds: ['slime', 'poison_spider'],
        clueId: 'oracle_shell',
        chance: 0.16,
        message: '黏液裡裹著一片會傳出回聲的破殼。'
    },
    {
        monsterIds: ['skeleton', 'skeleton_warrior', 'tower_skeleton_captain'],
        clueId: 'ash_ledger_page',
        chance: 0.14,
        message: '骸骨胸袋裡有一頁被灰燼燒出洞的帳冊。'
    },
];

export function getZoneProfile(zoneId) {
    return ZoneProfiles[zoneId] || ZoneProfiles.low;
}

export function getTerrainEffect(effectId) {
    return TerrainEffects[effectId] || null;
}

export function getLandmark(landmarkId) {
    return WorldLandmarks.find(landmark => landmark.id === landmarkId) || null;
}

export function getLandmarksForZone(zoneId) {
    return WorldLandmarks.filter(landmark => (landmark.zones || []).includes(zoneId));
}

export function getWorldLandmarks() {
    return [...WorldLandmarks];
}

export function getWorldEncounterProfile(profileId) {
    return WorldEncounterProfiles[profileId] || null;
}

export function getClue(clueId) {
    return WorldClues[clueId] || null;
}

export function getStoryChain(chainId) {
    return WorldStoryChains[chainId] || null;
}

export function getMonsterClueTriggers(monsterId) {
    return MonsterClueTriggers.filter(trigger => (trigger.monsterIds || []).includes(monsterId));
}
