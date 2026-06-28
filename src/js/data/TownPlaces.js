export const TownPlaceDatabase = [
    {
        id: 'crossroads',
        name: '城鎮十字路',
        icon: '🏘️',
        tag: '中心',
        mapClass: 'town-place-crossroads',
        cardImage: 'src/assets/images/art-v2/town-places/crossroads.webp',
        sceneImage: 'src/assets/images/art-v2/town-places-full/crossroads.webp',
        description: '你走進廣場中央，石板路被來往腳步磨得發亮。村長站在旗繩旁，公告欄上的新紙還帶著墨味，城門外的風聲最早吹到這裡。',
        residents: [
            { npcId: 'village_elder', label: '村長', role: '城鎮管理者', icon: '🏘️', portrait: 'src/assets/images/art-v2/portraits/village_elder.webp', position: { x: 30, y: 58 } }
        ],
        actions: [
            { type: 'interaction', id: 'crossroads_notice_board', label: '查看公告欄', shortLabel: '公告欄', icon: '📌', description: '傳聞、委託與城鎮異常會先釘在這裡。', position: { x: 55, y: 60 } }
        ],
        states: [
            { flag: 'town.south_gate.guard_route_ready', title: '南門巡路恢復', text: '南門守衛重新站穩，城外近路的紀錄開始穩定更新。' },
            { flag: 'town.notice_board.missing_workers_named', title: '失蹤名單公開', text: '公告欄上多了一排工匠名字，廣場變得比平常安靜。' },
            { flag: 'town.notice_board.worker_marks_mapped', title: '工匠刻痕貼上公告欄', text: '舊工具柄的刻痕被拓在名單旁，黑曜石地宮第一次有了能被指認的方向。' },
            { flag: 'town.refugees.northern_letters', title: '北境來信入冊', text: '焦邊家書被收進紀錄，北方不再只是地圖上的危險方向。' },
            { flag: 'town.refugees.unsent_reply_archived', title: '未寄回信歸檔', text: '那封送不出去的回信被放在焦邊家書旁，城鎮終於承認自己聽見了北方。' },
            { flag: 'town.gate.broken_standard_raised', title: '斷旗掛上城門', text: '斷旗被重新掛起，撤退線不再被讀成潰敗。' },
            { flag: 'town.gate.retreat_names_called', title: '撤退名單點過', text: '旗影下新增一張尋人榜。芙蕾每晚會重新念一次名字，像在確認城門還記得誰沒有回來。' },
            { flag: 'town.ending.named_tomorrow', title: '有名字的明天', text: '終戰後，廣場沒有立刻歡呼。村長、書記與芙蕾先清點名冊，湯鍋旁有人排隊，城門下有人回答自己的名字。世界還破著，但明天終於有了能被叫出的形狀。' },
            { flag: 'town.ending.wounded_dawn', title: '帶傷的黎明', text: '阿薩謝爾倒下後，廣場上的人先看彼此有沒有站著，再慢慢整理缺口。這不是完整勝利，卻足以讓城鎮把殘旗重新綁緊。' },
            { flag: 'town.ending.thin_tomorrow', title: '單薄的明天', text: '終焉退後了，廣場卻安靜得像怕驚動它。勝利被小心捧著，因為太多名冊、補給與道路還來不及補上。明天存在，只是很薄。' }
        ]
    },
    {
        id: 'market',
        name: '市集邊棚',
        icon: '🌿',
        tag: '補給',
        mapClass: 'town-place-market',
        cardImage: 'src/assets/images/art-v2/town-places/market.webp',
        sceneImage: 'src/assets/images/art-v2/town-places-full/market.webp',
        description: '你掀開帆布棚的陰影，乾燥藥草、空瓶和湯鍋的氣味混在一起。這裡很窄，卻決定了城鎮明天還能不能有人排隊。',
        residents: [
            { npcId: 'herbalist', label: '藥師蓮娜', role: '補給與藥水', icon: '🌿', portrait: 'src/assets/images/art-v2/portraits/herbalist.webp', position: { x: 31, y: 58 } }
        ],
        actions: [
            { type: 'route', route: 'shop', label: '打開市集', shortLabel: '市集', icon: '🛒', description: '購買藥水與基礎補給。', position: { x: 67, y: 62 } }
        ],
        states: [
            { flag: 'town.apothecary.stock_basic_potion', title: '基礎藥水補上', text: '藥架重新整理，下一個受傷的人不用等空瓶晾乾。' },
            { flag: 'town.apothecary.understands_thorn_trade', title: '荊棘交易被辨認', text: '藥師終於看懂那只採藥籃：籃柄上的荊棘像女巫留下的價格標籤。' },
            { flag: 'town.apothecary.remembers_lost_gatherer', title: '採藥人的名字掛上藥棚', text: '一塊小木牌釘在藥棚邊，上面沒有英雄稱號，只有把警告送回來的名字。' },
            { flag: 'town.refugees.soup_kitchen_warm', title: '避難者廚房升火', text: '棚下多了幾只湯碗。藥師把藥水往裡推，掌廚把熱湯往外端；這裡不再只是補給攤，而是城鎮撐住夜晚的胃。' }
        ]
    },
    {
        id: 'forge',
        name: '鍛造鋪',
        icon: '⚒️',
        tag: '裝備',
        mapClass: 'town-place-forge',
        cardImage: 'src/assets/images/art-v2/town-places/forge.webp',
        sceneImage: 'src/assets/images/art-v2/town-places-full/forge.webp',
        description: '你推開鍛造鋪的木門，熱浪先一步迎面撞來。爐火、白煙和敲擊聲把外面的怪物都敲進鐵裡，讓抵抗有了可以握住的重量。',
        residents: [
            { npcId: 'blacksmith', label: '鍛造師', role: '鍛造與圖紙', icon: '⚒️', portrait: 'src/assets/images/art-v2/portraits/blacksmith.webp', position: { x: 32, y: 60 } }
        ],
        actions: [
            { type: 'route', route: 'forge', label: '開始鍛造', shortLabel: '鍛造', icon: '🔨', description: '製作裝備、查看圖紙與材料需求。', position: { x: 68, y: 60 } }
        ],
        states: [
            { flag: 'town.blacksmith.forge_open', title: '爐火穩定', text: '白煙終於往上升，鍛造鋪重新像個能工作的地方。' },
            { flag: 'town.blacksmith.neelu_blueprint_named', title: '妮露圖紙入冊', text: '圖紙邊角的名字被重新刻下，鍛造鋪多了一份等待歸來的紀錄。' },
            { flag: 'town.blacksmith.mithril_route_ready', title: '秘銀路線整理完成', text: '妮露圖紙與奧倫筆記被釘在爐旁。鍛造師不再只說材料缺口，他開始替終局裝備排工序，像替城鎮排一條還能反擊的路。' }
        ]
    },
    {
        id: 'handbook',
        name: '書記小屋',
        icon: '📚',
        tag: '紀錄',
        mapClass: 'town-place-handbook',
        cardImage: 'src/assets/images/art-v2/town-places/handbook.webp',
        sceneImage: 'src/assets/images/art-v2/town-places-full/handbook.webp',
        description: '你走進小屋，紙張與乾墨的味道壓過木屑。怪物紀錄、地圖拓片與尚未歸檔的名字堆滿書桌，像有人用筆尖替世界留住呼吸。',
        residents: [
            { npcId: 'town_scholar', label: '書記', role: '旅人手札與百科', icon: '📚', portrait: 'src/assets/images/art-v2/portraits/town_scholar.webp', position: { x: 33, y: 58 } }
        ],
        actions: [
            { type: 'route', route: 'quest', label: '翻閱旅人手札', shortLabel: '手札', icon: '📔', description: '查看任務、線索與故事紀錄。', position: { x: 58, y: 60 } },
            { type: 'route', route: 'encyclopedia', label: '查看百科', shortLabel: '百科', icon: '📖', description: '檢視怪物、圖紙與收集資訊。', position: { x: 80, y: 72 } }
        ],
        states: [
            { flag: 'town.scholar.records_drowned_bell_rhythm', title: '沉鐘節奏入冊', text: '海岸鐘聲被寫進地脈紀錄，失眠者的耳語終於有了能對照的節奏。' },
            { flag: 'town.scholar.records_lich_name', title: '古代學者名字補回', text: '巫妖旁邊多了一個名字，怪物紀錄不再只有分類。' },
            { flag: 'town.scholar.julian_margin_read', title: '朱利安邊註抄入遺跡紀錄', text: '書記在遠古遺跡頁邊補上一句：盾牌沒有慈悲，握盾的人才必須有。' },
            { flag: 'town.coast_refugee_lamp_lit', title: '海岸燈號校正', text: '守燈人塔維仍然怕黑，但那盞燈終於不再把亡魂引回岸邊。' },
            { flag: 'town.scholar.last_index_bound', title: '最後索引裝訂完成', text: '書記把活人名字重新排好，空白頁留給明天。那本索引沒有刀刃，卻讓城鎮在終局前先確定自己不是一堆無名數字。' }
        ]
    },
    {
        id: 'alley',
        name: '暗巷',
        icon: '🧥',
        tag: '暗流',
        mapClass: 'town-place-alley',
        cardImage: 'src/assets/images/art-v2/town-places/alley.webp',
        sceneImage: 'src/assets/images/art-v2/town-places-full/alley.webp',
        description: '你拐進狹窄暗巷，屋簷把日光切成很薄的線。流浪者靠在牆邊，黑市標籤與賭場帳冊的耳語都會在這裡沉下來。',
        residents: [
            { npcId: 'street_beggar', label: '巷口流浪者', role: '黑市與城中暗流', icon: '🧥', portrait: 'src/assets/images/art-v2/portraits/street_beggar.webp', position: { x: 32, y: 63 } }
        ],
        actions: [
            { type: 'interaction', id: 'merchant_ancient_coin', label: '交出古代錢幣', shortLabel: '古代錢幣', icon: '🪙', description: '如果你帶著真正的古代錢幣，暗巷會打開另一扇門。', position: { x: 68, y: 60 } }
        ],
        states: [
            { flag: 'secretShopUnlocked', title: '黑市入口打開', text: '巷尾的門縫亮起微光，裡面的人終於承認自己在等你。' },
            { flag: 'town.black_market.ledger_tags_read', title: '黑市標籤被讀出', text: '收藏家伊文辨認出灰燼男爵的貨號，暗巷開始像情報站。' }
        ]
    },
    {
        id: 'casino',
        name: '賭場',
        icon: '🎲',
        tag: '金流',
        mapClass: 'town-place-casino',
        cardImage: 'src/assets/images/art-v2/town-places/casino.webp',
        sceneImage: 'src/assets/images/art-v2/town-places-full/casino.webp',
        description: '你推門走進賭場，骰子聲、笑聲和壓低的咒罵一起滾過桌面。瑪洛相信數字一旦被人動過，就會在勝率裡留下傷痕。',
        actions: [
            { type: 'route', route: 'casino', label: '進入賭場', shortLabel: '賭場', icon: '🎰', description: '遊玩賭場，也可能追查異常勝率。', position: { x: 63, y: 62 } }
        ],
        states: [
            { flag: 'town.casino.showcase_seen', title: '展示櫃被注意', text: '賭場深處的玻璃櫃陳列著不像獎品的獎品。二樓帷幕後的人似乎已經注意到誰在看。' },
            { flag: 'town.casino.false_odds_exposed', title: '假勝率被揭穿', text: '勝率的曲線露出破綻，灰燼男爵的貨號藏在那些過分規律的輸贏裡。' },
            { flag: 'town.casino.relief_fund_counted', title: '籌碼換成補給', text: '最後一夜的籌碼被換成乾糧。賭場仍然有笑聲和謊話，但瑪洛把帳冊最後一欄改成避難補給，讓貪婪短暫替人做了件正事。' },
            { flag: 'town.casino.dark_contract_sealed', title: '暗桌規則被記下', text: '巷口流浪者收起惡魔莊家的契約，賭場暗門後的笑聲短暫收斂。' }
        ]
    },
    {
        id: 'tower',
        name: '無盡塔',
        icon: '🗼',
        tag: '挑戰',
        mapClass: 'town-place-tower',
        cardImage: 'src/assets/images/art-v2/town-places/tower.webp',
        sceneImage: 'src/assets/images/art-v2/town-places-full/tower.webp',
        description: '你來到城鎮邊緣，塔影像一把黑尺壓在地上。風穿過高處的裂縫，聲音像某種不肯停止的測驗。',
        actions: [
            { type: 'route', route: 'tower', label: '挑戰無盡塔', shortLabel: '無盡塔', icon: '🗼', description: '進入塔層挑戰，測試裝備與戰鬥狀態。', position: { x: 62, y: 62 } }
        ],
        states: []
    },
    {
        id: 'gate',
        name: '城門防線',
        icon: '⚔️',
        tag: '出城',
        mapClass: 'town-place-gate',
        cardImage: 'src/assets/images/art-v2/town-places/gate.webp',
        sceneImage: 'src/assets/images/art-v2/town-places-full/gate.webp',
        description: '你站到城門底下，鐵釘、旗繩與刮花的門板都帶著城外的塵。出去的人會帶回線索、傷口、戰利品，偶爾也帶回一個不該被壓低的消息。',
        actions: [
            { type: 'route', route: 'adventure', label: '出城冒險', shortLabel: '出城', icon: '🧭', description: '前往世界地圖探索、戰鬥與推進線索。', position: { x: 66, y: 62 } }
        ],
        states: [
            { flag: 'town.south_gate.guard_route_ready', title: '巡查路線穩定', text: '南門守衛的靴底修好了，門外路線不再只靠猜。' },
            { flag: 'town.gate.broken_standard_raised', title: '斷旗立起', text: '城門上多了一面修補過的旗，風裡有前線留下的灰。' },
            { flag: 'town.gate.retreat_names_called', title: '撤退名單掛在門內', text: '芙蕾的名單被壓在城門內側，守門的人會照著它等下一批歸來者。' }
        ]
    }
];

export function getTownPlaces() {
    return TownPlaceDatabase;
}

export function getTownPlace(placeId) {
    return TownPlaceDatabase.find(place => place.id === placeId) || null;
}
