export const ZoneProfiles = {
    low: {
        id: 'low',
        name: '村外近郊',
        dangerLabel: '低威脅',
        icon: '🌿',
        summary: '村莊外圍仍有人走動，獵徑、木牌與舊營火讓你能辨認回程方向。',
        hint: '適合收集基礎材料、觀察怪物痕跡，並開始第一批線索鏈。',
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
        hint: '這裡的線索會開始指向首領與古代封印，但撤退成本也明顯升高。',
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
        summary: '石碑文字會隨線索逐步可讀，部分首領需要解讀後才會露出路徑。',
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
        gameplay: '未來可加速耐久消耗，並提高龍系線索與素材收益。'
    }
};

export const WorldClues = {
    bloodied_arrow_pouch: {
        id: 'bloodied_arrow_pouch',
        title: '破碎箭袋',
        chainId: 'forest_guardian',
        source: '地標',
        text: '箭袋被撕成三段，箭羽上沾著灰白狼毛。獵人不是迷路，是被什麼東西逼進霧裡。',
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
        lead: '收集足夠線索後，古樹守衛的核心地會變得可追蹤。'
    },
    black_bark_sample: {
        id: 'black_bark_sample',
        title: '發黑樹皮',
        chainId: 'forest_guardian',
        source: '腐根溪谷',
        text: '樹皮內側像被火燒過，但外側仍潮濕。污染不是來自森林本身。',
        lead: '這個異常會在後期連到古龍與封印真相。'
    },
    carved_stone_shard: {
        id: 'carved_stone_shard',
        title: '刻痕石片',
        chainId: 'lich',
        source: '遺跡怪物',
        text: '石片上的字不是墓誌銘，而是一段封印計數。',
        lead: '找到更多石片，才能判斷巫妖是在破壞封印還是在維持封印。'
    },
    dragon_heat_trace: {
        id: 'dragon_heat_trace',
        title: '殘留龍焰',
        chainId: 'elder_dragon',
        source: '黑焰邊境',
        text: '龍焰沒有四散燃燒，而是沿著裂縫往北收束，像有什麼龐然之物把地脈熱流拖走。',
        lead: '這不是能談判的守護痕跡，而是更高威脅留下的方向。'
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
        lead: '謎題順序不是地圖順序，而是聽見水聲的順序。'
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
        text: '交易印不是通行證，而是一種承諾。若違反約定，荊棘會主動追上來。',
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
        lead: '製作誘餌後連續探索，可能讓牠主動現身。'
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
            { minClues: 3, text: '古樹守衛的位置逐漸明確，牠不是入侵者，而是失控的受害者。' }
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
            { minClues: 1, text: '龍焰痕跡像是拖拽地脈熱流的路線，不是普通怪物能留下的傷口。' },
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
            { minClues: 1, text: '線索指向牠會沿著林徑與溪谷交界移動。' },
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
            { minClues: 1, text: '石碑順序與聲音遠近有關，不是地圖距離。' },
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
            { minClues: 1, text: '交換珠證明這不是偷竊，而是一套交易規則。' },
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

const BossFlowDesigns = {
    forest_guardian: {
        archetype: '追蹤型',
        entries: ['怪物掉落', '地圖痕跡', '石碑線索', '藏寶圖定位'],
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
        finalTrigger: { id: 'boss_ambushes_player', label: '讓 BOSS 主動伏擊', type: '被伏擊', requiredClues: 2, requiredProgress: 2 }
    }
};

for (const [chainId, design] of Object.entries(BossFlowDesigns)) {
    if (WorldStoryChains[chainId]) {
        Object.assign(WorldStoryChains[chainId], design);
    }
}

export const WorldLandmarks = [
    {
        id: 'hunter_boardwalk',
        name: '獵人棧道',
        icon: '🪵',
        zones: ['low'],
        effectIds: ['open_trail'],
        visible: 'always',
        storyChainIds: ['ambush_mantis', 'forest_guardian'],
        clueIds: ['silk_tripwire'],
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
        storyChainIds: ['ambush_mantis'],
        clueIds: ['survivor_warning'],
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
        storyChainIds: ['ambush_mantis'],
        clueIds: ['snapped_bait_hook'],
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
        storyChainIds: ['ambush_mantis'],
        clueIds: [],
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
        storyChainIds: ['forest_guardian', 'blood_moon_stag'],
        clueIds: ['black_bark_sample'],
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
        storyChainIds: ['forest_guardian'],
        clueIds: ['black_bark_sample'],
        arrival: '腐爛根系把溪水染成深褐色，岸邊有被狼群踩亂的藥草叢。',
        repeat: '溪谷的濕霧仍在變厚，像是有什麼從地底往上滲。',
        mapHint: '毒性材料與狼群線索交會的地點。'
    },
    {
        id: 'mist_tablet_hill',
        name: '霧碑丘',
        icon: '🪨',
        zones: ['high'],
        effectIds: ['thick_fog', 'old_seal'],
        visible: 'always',
        storyChainIds: ['forest_guardian', 'lich'],
        clueIds: ['mist_tablet_rubbing'],
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
        storyChainIds: ['forest_guardian'],
        clueIds: [],
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
        storyChainIds: ['blood_moon_stag'],
        clueIds: [],
        arrival: '坡面苔蘚在陰影裡泛著暗紅色，像把鹿角撞擊的路線一段段染出來。',
        repeat: '月苔乾裂得更快，表示角鹿今晚可能又繞回這裡。',
        mapHint: '完成誘導標記後，可縮小血月角鹿狩獵範圍。'
    },
    {
        id: 'charred_obelisk',
        name: '焦黑方尖碑',
        icon: '🔥',
        zones: ['death'],
        effectIds: ['scorched_air', 'old_seal'],
        visible: 'always',
        storyChainIds: ['elder_dragon'],
        clueIds: ['dragon_heat_trace'],
        arrival: '方尖碑沒有被龍焰熔掉，反而像被龍焰固定住，裂縫下方傳出沉悶回響。',
        repeat: '碑面仍有熱度，但你已能分辨哪些痕跡是攻擊，哪些像是封印。',
        mapHint: '終局真相的早期伏筆，不要求玩家立刻完成。'
    }
];

export const MonsterClueTriggers = [
    {
        monsterIds: ['wild_wolf'],
        clueId: 'wolf_fang_marks',
        chance: 0.35,
        message: '你在野狼牙根附近發現不自然的黑色刻痕。'
    },
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
        monsterIds: ['wild_wolf', 'tower_alpha_wolf'],
        clueId: 'moon_moss_sample',
        chance: 0.18,
        message: '狼爪縫裡卡著一點會在月光下泛紅的苔蘚。'
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
    {
        monsterIds: ['poison_spider'],
        clueId: 'silk_tripwire',
        chance: 0.18,
        message: '蛛絲的固定方式不像捕食，更像在記錄你的回程路線。'
    }
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

export function getClue(clueId) {
    return WorldClues[clueId] || null;
}

export function getStoryChain(chainId) {
    return WorldStoryChains[chainId] || null;
}

export function getMonsterClueTriggers(monsterId) {
    return MonsterClueTriggers.filter(trigger => (trigger.monsterIds || []).includes(monsterId));
}
