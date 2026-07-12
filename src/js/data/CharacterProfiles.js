/**
 * CharacterProfiles.js
 * Runtime-facing character register synchronized with the accepted screenplay.
 * The mainline owns each core arc; optional side stories may only deepen it.
 */

const portrait = id => `src/assets/images/art/characters/portraits/${id}.webp`;
const sceneFlag = sceneId => `story.scene.${sceneId}.complete`;

export const CharacterProfileDatabase = {
    village_elder: {
        id: 'village_elder',
        name: '村長',
        title: '城鎮決策者與遠征倖存者',
        portrait: portrait('village_elder'),
        innerWorld: {
            fear: '再次因自己的判斷讓別人死去。',
            desire: '在自己還能承擔時，把城鎮交回可以共同決定的人手裡。',
            values: '責任必須具名，未知不能被英雄話語掩蓋。'
        },
        past: '二十年前參與處理失聯道路的遠征；隊伍誤傷龍族封痕，他帶著錯誤理解回到城鎮。',
        arc: '從把所有責任收進自己身上，走向願意被伊萊與主角攔住，也願意承認共同決策比犧牲更負責。',
        contradiction: '想保護所有人，卻因此總想一個人承擔最危險的決定。',
        external: '灰白髮、舊披肩、反覆壓平地圖角；疲倦時會用乾冷笑話縮短會議。',
        core: '務實、克制、記得人的名字，也會把自己的愧疚藏進行政語氣。',
        voice: {
            tone: '穩、短、帶乾冷幽默',
            rhythm: '先說可驗證的事，再交代責任與回程。',
            vocabulary: ['名單', '回程', '不知道', '先確認', '別替我寫得好看'],
            avoid: ['預言口吻', '英雄口號', '把犧牲美化成唯一答案']
        },
        stages: [
            { id: 'burden', label: '一個人扛住城鎮', mood: '平靜得過度用力' },
            { id: 'friendship_visible', label: '伊萊門外等他', fromFlag: sceneFlag('ch2_s07_names_return_to_town'), mood: '開始讓疲憊被朋友看見' },
            { id: 'scar_choice', label: '封痕前的選擇', fromFlag: sceneFlag('ch5_s10_before_dawn'), mood: '第一輪獨行，第二輪肯停下' }
        ],
        reportClosings: [
            '把不知道的部分也寫下。下一個人不該再替我們猜一次。',
            '先點回來的人，再談路上發生了什麼。',
            '別寫成我終於做對。寫有人攔住我，而我這次肯停。'
        ]
    },
    town_scholar: {
        id: 'town_scholar',
        name: '伊萊',
        title: '城鎮書記',
        portrait: portrait('town_scholar'),
        innerWorld: {
            fear: '自己的整理會把重要差異壓成一條害人的結論。',
            desire: '讓證據保留來源與範圍，足以真的讓人活著回來。',
            values: '紀錄的誠實比紀錄的整齊重要。'
        },
        past: '長年替村長整理道路與遠征殘頁；他知道老人會工作到天亮，也曾在門外等到紙頁終於闔上。',
        arc: '從相信整理就是控制，經歷米婭之死後理解壓縮上下文的代價；二周目主動重開原始資料並保留未知。',
        contradiction: '需要秩序才能面對恐懼，又必須接受真正的證據往往不整齊。',
        external: '蒼白、眼鏡、墨漬手指；焦慮時先對齊紙角，再承認某格沒有答案。',
        core: '聰明、神經質、願意對自己的結論負責，不是替劇情發答案的全知學者。',
        voice: {
            tone: '精準、緊張、偶爾自嘲',
            rhythm: '先說來源，再說可比對之處，最後保留未知。',
            vocabulary: ['來源', '範圍', '摘要', '原頁', '尚未證明'],
            avoid: ['神棍斷言', '把推測說成事實', '只用任務數字說話']
        },
        stages: [
            { id: 'cataloguer', label: '相信整理能保護人', mood: '急著把世界排好' },
            { id: 'context_failure', label: '二格摘要留下傷口', fromFlag: sceneFlag('ch5_s07_after_the_ratchet'), mood: '第一輪崩塌，第二輪重開來源' },
            { id: 'honest_archive', label: '讓紀錄保留麻煩', fromFlag: sceneFlag('ch7_s08_return_to_town'), mood: '不再讓一個人替所有人負責' }
        ],
        reportClosings: [
            '我會把來源和推測分開。兩者長得很像，害人的方式完全不同。',
            '這次先不寫結論。讓空格留在它該在的位置。',
            '我會寫得更麻煩一點：我們終於沒有讓一個人替所有人負責。'
        ]
    },
    herbalist: {
        id: 'herbalist',
        name: '米婭',
        title: '藥師與配方研究者',
        portrait: portrait('herbalist'),
        innerWorld: {
            fear: '只要自己停下照顧，重要的人就會像父母一樣來不及被救回。',
            desire: '讓受傷的人醒來，也讓自己有一天能重新活在工作以外的時間裡。',
            values: '照護要精準、溫柔，而且不能把病人變成欠債的人。'
        },
        past: '父母去世後，她把私人工作室維持在當年的樣子，時間像停在最後一次沒能救回家人的夜裡。',
        arc: '從只會為別人耗盡自己，到二周目願意測試、分工、讓別人扶住工具，也讓房間重新打開窗戶。',
        contradiction: '渴望和主角一起走向未來，卻用不顧自己的照護方式反覆放棄那個未來。',
        external: '約二十五歲，手指常帶藥草色；說「先坐」時會先把水推到對方碰得到的位置。',
        core: '溫柔、理想、浪漫但技術嚴謹；愛情透過照護、誠實回程與共同日常累積。',
        voice: {
            tone: '柔和、清楚、不替危險灑糖',
            rhythm: '先確認人，再描述症狀與處置。',
            vocabulary: ['先坐', '水', '反應', '別逞強', '我需要你說實話'],
            avoid: ['商店推銷', '聖女口吻', '把自我犧牲說成天生義務']
        },
        stages: [
            { id: 'opening_care', label: '把時間留給病人', mood: '溫柔而不肯休息' },
            { id: 'mutual_honesty', label: '要求彼此說出傷口', fromFlag: sceneFlag('ch3_s02_shadows_count_names'), mood: '關係不再只有單向照護' },
            { id: 'operation', label: '四象裂片手術', fromFlag: sceneFlag('ch5_s06_mia_operation'), mood: '第一輪停止，第二輪繼續活下去' }
        ],
        reportClosings: [
            '先喝水。事情可以晚一點說，你的身體不會。',
            '我可以處理傷口，但你得先承認它在。',
            '好了。你回來了。'
        ]
    },
    standard_bearer_frey: {
        id: 'standard_bearer_frey',
        name: '芙蕾',
        title: '巡線持旗者',
        portrait: portrait('standard_bearer_frey'),
        innerWorld: {
            fear: '方向從視野中消失後，自己會再次成為沒能帶人回家的孩子。',
            desire: '成為別人能看見的前標，也相信後方不需要由自己一併承擔。',
            values: '方向必須留在隊伍看得見的位置。'
        },
        past: '幼時曾靠一面巡線旗從災路回城，長大後把「看得見」當作比口號更實際的保護。',
        arc: '第一輪因替後標補位而死；二周目把後方交給塔維，學會信任並活著完成同一場撤離。',
        contradiction: '相信分工，危機時卻本能地想替害怕的人把責任一起拿走。',
        external: '普通巡線旗、繩結磨痕；緊張時會先確認旗影是否同時被前後兩隊看見。',
        core: '強硬、可靠、不是殉道者；她真正的成長是停止把犧牲當成可靠的證明。',
        voice: {
            tone: '直接、清楚、像道路口令',
            rhythm: '方向、次序、最後才是情緒。',
            vocabulary: ['看旗', '不要回頭', '最後一列', '位置'],
            avoid: ['長篇英雄演說', '預先接受死亡']
        },
        stages: [
            { id: 'front_marker', label: '把所有方向扛在身上', mood: '可靠得不留空位' },
            { id: 'gray_ridge', label: '灰脊兩個標記', fromFlag: sceneFlag('ch4_s06_flag_returns'), mood: '第一輪殞落，第二輪學會交付' }
        ],
        reportClosings: ['先看路，再看我。只要旗還在位置上，就別往回擠。']
    },
    lamplighter_tavi: {
        id: 'lamplighter_tavi',
        name: '塔維',
        title: '巡線點燈人',
        portrait: portrait('lamplighter_tavi'),
        innerWorld: {
            fear: '被留在視線最後方，也害怕自己的恐懼迫使芙蕾回頭送死。',
            desire: '即使害怕，也能守住只有自己能守的位置。',
            values: '勇敢不是靠近最危險處，而是讓需要的光留在正確位置。'
        },
        past: '長期負責回程燈位，熟悉每一盞燈的風向，卻一直把後方的孤獨藏在樂觀與工作笑話裡。',
        arc: '第一輪因沒有說出恐懼而失去芙蕾；二周目提前準備、明確承諾不離位，讓兩人共同完成撤離。',
        contradiction: '想證明自己不拖累別人，卻因隱瞞害怕讓別人無法正確分工。',
        external: '燈油味、反覆摸燈罩扣；越害怕越會用輕鬆語氣報數。',
        core: '樂觀來自個性，不是情境無痛；幽默能陪人走路，不能抹掉危機。',
        voice: {
            tone: '明亮、快，但危機時會收成精準報數',
            rhythm: '先用小玩笑穩住呼吸，再給燈號。',
            vocabulary: ['一、二、三', '我還在', '看燈', '別過來'],
            avoid: ['用玩笑否認創傷', '突然變成無畏英雄']
        },
        stages: [
            { id: 'rear_light', label: '笑著守後方', mood: '把害怕藏進報數' },
            { id: 'spoken_fear', label: '讓芙蕾知道真實狀態', fromFlag: sceneFlag('ch4_s05_body_locks'), mood: '害怕仍在，位置也仍在' }
        ],
        reportClosings: ['後面看我。燈沒有跑，人也沒有。這次兩個都算數。']
    },
    blacksmith: {
        id: 'blacksmith',
        name: '鐵匠',
        title: '城鎮鐵匠',
        portrait: portrait('blacksmith'),
        innerWorld: {
            fear: '能修好所有器物，卻只能看著沒回來的人留下空位。',
            desire: '讓鍛造重新服務於回家、工作與普通生活，而不只服務更大的傷害。',
            values: '工具的價值在於誰因此能活著回來。'
        },
        past: '長年替巡線人修旗扣、鍋底與護具；每件沒被取走的成品都讓他的玩笑少一層。',
        arc: '從用粗硬笑話遮住無能為力，到主動把民生修復排在武器前，也在二周目承認分工與未知工具測試的重要。',
        contradiction: '用實作照顧人，卻不願承認自己也需要別人分擔失敗。',
        external: '煤灰、皮圍裙、大嗓門；關心人時通常先罵裝備，再把需要的東西推過去。',
        core: '直白、可靠、手比嘴誠實；鍛造是城鎮生活與主線因果，不是純菜單。',
        voice: {
            tone: '粗硬、精準、帶火星的幽默',
            rhythm: '先指出物件問題，再說它會害到誰。',
            vocabulary: ['爐子', '受力', '別夾', '先修鍋', '回來再排'],
            avoid: ['只談數值', '把每個問題都解成更強武器']
        },
        stages: [
            { id: 'cold_forge', label: '冷爐重新生火', mood: '先修回城工具' },
            { id: 'civilian_first', label: '民生排在武器前', fromFlag: sceneFlag('ch4_s02_fourfold_countergear'), mood: '主動做出價值選擇' },
            { id: 'ordinary_queue', label: '普通麻煩重新排隊', fromFlag: sceneFlag('ch7_s08_return_to_town'), mood: '能開玩笑，也能讓別人幫忙' }
        ],
        reportClosings: [
            '裝備放下。你回來就好。',
            '今天先修能讓人回來的東西。爐子不是只替會打架的人燒。',
            '前面還有一只漏水的鍋。能排回這種東西，才算真的贏。'
        ]
    },
    street_beggar: {
        id: 'street_beggar',
        name: '乞丐',
        trueName: '艾洛',
        title: '尋找舊山路回音的人',
        portrait: portrait('street_beggar'),
        innerWorld: {
            fear: '妮露仍在約定地等待，而自己又一次走錯路。',
            desire: '回到花田完成只剩碎片的約定。',
            values: '殘破記憶裡，約定比自己的性命更真實。'
        },
        past: '魔王墜落毀滅山村時，妻子妮露把他推下山谷；頭部重創使記憶碎裂，只留下花、回聲與必須回去的執念。',
        arc: '第一輪偷走回聲哨、獨行並死在看不見的山路；二周目被理解意圖後同行，在回憶中重新聽見姓名與妮露要他活下去的意思。',
        contradiction: '想履行兩人一起看花的約定，卻把赴死誤認成完成約定。',
        external: '真正的垃圾與破布塞滿袋子；話語瘋癲，不是故弄玄虛，偶爾說出殘破但精確的真相。',
        core: '他不是線索販子。第一輪沒人聽懂，二周目才讓玩家理解那些句子一直都是真的。',
        voice: {
            tone: '碎裂、跳接、偶爾忽然清楚',
            rhythm: '物件、回音、她、錯誤方向反覆交疊。',
            vocabulary: ['兩聲停', '三聲轉', '她在等', '這朵不能染', '哨子'],
            avoid: ['黑市暗號腔', '刻意打啞謎', '預言者口吻']
        },
        stages: [
            { id: 'scraps', label: '只剩碎片', mood: '尋找沒人理解的工具' },
            { id: 'whistle', label: '聽見回聲哨', fromFlag: sceneFlag('ch5_s09_whistle_cache'), mood: '執念開始有具體方向' },
            { id: 'name_returned', label: '妮露叫回艾洛', fromFlag: sceneFlag('ch7_s03_echo_memory'), mood: '仍不完整，但不再獨自赴死' }
        ],
        reportClosings: ['兩聲停，三聲轉。她說這次不帶袋子。']
    },
    casino_owner: {
        id: 'casino_owner',
        name: '維斯珀',
        title: '賭場主人',
        portrait: portrait('casino_owner'),
        innerWorld: {
            fear: '失去控制，成為自己條款裡可被收走的抵押品。',
            desire: '把每個人的渴望、創傷與自救願望都換成由他掌控的債。',
            values: '只承認能被寫進契約、勝率與所有權的東西。'
        },
        past: '從黑市取得來歷不明的空白抵契後，發現它會把承諾轉成可收取的債；他選擇測試、擴大並用灌鉛骰子穩定收割。',
        arc: '沒有悔改弧線。第一輪逃走，二周目在完全相同的客方器具與親筆規則下輸掉自己，遭契約收取。',
        contradiction: '宣稱每個人自由下注，卻只有在自己無法退出時才開始談公平。',
        external: '昂貴紅黑衣裝、從容坐姿；先估價一個人，再決定展示哪個誘惑。',
        core: '單純邪惡且可憎，但行為有制度、來源與可追查因果，不靠無限神秘權力。',
        voice: {
            tone: '優雅、冷靜、令人厭惡',
            rhythm: '慢半拍，等對方自己說出缺口。',
            vocabulary: ['公平', '選擇', '抵押', '展示櫃', '再一局'],
            avoid: ['悲情辯解', '大吼威脅', '替自己尋求原諒']
        },
        stages: [
            { id: 'temptation', label: '把想要之物放上桌', mood: '禮貌地計算傷口' },
            { id: 'escape', label: '主人席空下', fromFlag: sceneFlag('ch6_s07_house_changes_seats'), mood: '第一輪逃跑，二周目被收取' }
        ],
        reportClosings: [
            '輸的人，總是比較會談公平。',
            '我從不逼人下注。我只是把他們真正想要的東西放到桌上。',
            '公平？當然公平。每個人都有輸光的權利。'
        ]
    },
    casino_dealer: {
        id: 'casino_dealer',
        name: '洛恩',
        title: '賭場荷官',
        portrait: portrait('casino_dealer'),
        innerWorld: {
            fear: '反抗會讓自己成為下一筆抵押，也害怕再用服從害死更多人。',
            desire: '活下來，並在不被赦免的前提下把證據與帳目交回公開視線。',
            values: '規則若不能被所有人看見，就只是替主人服務的武器。'
        },
        past: '長期替維斯珀配重、換骰、引導賭客；他既是被契約控制的人，也是實際參與者。',
        arc: '第一輪為保命與贖罪交出灌鉛骰子；二周目成為見證者，協助席位反轉，之後只得以受監督荷官身分清帳。',
        contradiction: '想救人，也想先救自己；他的遲疑造成真實傷害，不能用最後一次幫忙抹除。',
        external: '手指會在客方骰盒停一瞬；說真話時不直視受害者，也不要求原諒。',
        core: '有贖罪行動但沒有赦免、主人席、契約權限或所有權。',
        voice: {
            tone: '克制、低聲、技術性',
            rhythm: '先交代自己做過什麼，再說能提供的證據。',
            vocabulary: ['客方骰', '配重', '見證', '總帳', '不夠'],
            avoid: ['把所有罪推給維斯珀', '突然英雄化', '自我原諒']
        },
        stages: [
            { id: 'complicit', label: '桌邊共犯', mood: '用程序躲避責任' },
            { id: 'evidence', label: '交出灌鉛骰子', fromFlag: sceneFlag('ch6_s07_house_changes_seats'), mood: '承認不夠，仍開始清帳' }
        ],
        reportClosings: ['我知道它不夠。它什麼都還不了。但如果你還想追他，拿著。']
    },
    merchant: {
        id: 'merchant',
        name: '商人',
        title: '公開市集交易者',
        portrait: portrait('merchant'),
        innerWorld: {
            fear: '道路再次斷掉，貨架與城鎮一起只剩承諾。',
            desire: '讓每一件上架物都能說明從哪條路、哪份授權而來。',
            values: '公開價格與有限庫存比神奇補貨可信。'
        },
        past: '在道路逐段失聯後留在空棚清點箱印；他不是主要角色，但承擔公開交易的制度位置。',
        arc: '從只有空箱的市集，走向接受米婭配方授權並維持不依賴單一人物生死的基礎供應。',
        contradiction: '想讓貨架看起來充足，又不能再用沒有來源的承諾安慰城鎮。',
        external: '總先看封條再看商品；算成本時會用工作笑話掩飾焦慮。',
        core: '市集功能角色，份量由公共生活與道路恢復支撐，不搶主要角色弧線。',
        voice: {
            tone: '親切、精明、略帶自嘲',
            rhythm: '先說來源，再談數量與價格。',
            vocabulary: ['貨印', '路線', '授權', '只有這些', '明碼'],
            avoid: ['憑空補貨', '把米婭變成商店主人']
        }
    },
    black_market: {
        id: 'black_market',
        name: '黑市商人',
        title: '第三方來源交易者',
        portrait: portrait('black_market'),
        innerWorld: {
            fear: '不是道德清算，而是貨源失去可交易的距離。',
            desire: '在不持有後果的前提下，把危險來源換成價值。',
            values: '來源可以隱瞞，交易條件必須準確。'
        },
        past: '曾買到一張無法辨識來源的空白抵契，轉賣給維斯珀後便不再持有同類物。',
        arc: '維持冷漠的第三方位置；他提供因果證詞，不會突然協助正義，也不擁有第二張解法。',
        contradiction: '自稱不在乎買家如何使用貨物，卻非常在乎自己的來源責任被追到門口。',
        external: '對物件比對人更有禮；回答來源問題時先確認交易是否已經結束。',
        core: '有限、可追查、沒有無限禁貨庫存的黑市角色。',
        voice: {
            tone: '禮貌、疏離、精確',
            rhythm: '先界定自己知道到哪裡，再拒絕替空白處編故事。',
            vocabulary: ['來源不明', '只有一張', '已經賣出', '不替你保證'],
            avoid: ['全知陰謀販子', '免費提供主線解答']
        }
    }
};

const WORLD_EVENT_NARRATORS_BY_ROLE = {
    resource: 'merchant',
    pressure: 'standard_bearer_frey',
    story_seed: 'town_scholar',
    relationship: 'herbalist',
    risk: 'black_market'
};

const WORLD_EVENT_REFLECTIONS_BY_CHARACTER = {
    town_scholar: {
        default: ['先記來源。感覺可以留下，但不要讓感覺替證據簽名。']
    },
    herbalist: {
        default: ['先確認你有沒有受傷，再決定這件事值不值得寫得漂亮。']
    },
    standard_bearer_frey: {
        default: ['如果它改變方向，就標在路上；別只記成運氣。']
    },
    merchant: {
        default: ['有來源才算補給。沒有來源的好東西，通常只是晚一點收帳。']
    },
    black_market: {
        default: ['代價沒有出現在眼前，不表示交易沒有寫下它。']
    }
};

function pickStableLine(lines = [], seed = '') {
    if (!Array.isArray(lines) || lines.length === 0) return null;
    const basis = String(seed || lines.join('|'));
    const index = [...basis].reduce((sum, char) => sum + char.charCodeAt(0), 0) % lines.length;
    return lines[index];
}

export function getCharacterProfile(characterId) {
    return CharacterProfileDatabase[characterId] || null;
}

export function attachCharacterProfile(entity = {}) {
    const profile = getCharacterProfile(entity.id || entity.npcId || entity.vendorId);
    if (!profile) return entity;
    return {
        ...entity,
        name: entity.name || profile.name,
        role: entity.role || profile.title,
        portrait: entity.portrait || profile.portrait,
        characterProfile: profile,
        voiceProfile: profile.voice,
        characterCore: profile.core
    };
}

export function getCharacterReportClosing(characterId, seed = '') {
    return pickStableLine(getCharacterProfile(characterId)?.reportClosings || [], seed || characterId);
}

export function getEventNarratorForRole(eventRole) {
    return WORLD_EVENT_NARRATORS_BY_ROLE[eventRole] || null;
}

export function getCharacterWorldEventReflection(characterId, eventRole, seed = '') {
    const linesByRole = WORLD_EVENT_REFLECTIONS_BY_CHARACTER[characterId] || {};
    return pickStableLine(linesByRole[eventRole] || linesByRole.default || [], `${seed}:${eventRole}:${characterId}`);
}

export function getWorldEventReflectionByRole(eventRole, seed = '') {
    const narratorId = getEventNarratorForRole(eventRole);
    return getCharacterWorldEventReflection(narratorId, eventRole, seed);
}

export function getAllCharacterProfiles() {
    return Object.values(CharacterProfileDatabase);
}
