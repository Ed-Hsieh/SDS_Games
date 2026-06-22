# Asset Requests

This document records image assets that are useful for the next world-building phase. Some assets already have usable in-project images connected; keep this file as the style and replacement checklist for future higher-polish art passes.

## Scene Backgrounds

| Key | Purpose | Notes |
| --- | --- | --- |
| `scene.lobby_crossroads` | 大廳主場景 | Must clearly show paths to forge, market, adventure gate, tower, and dungeon access. |
| `scene.forge_workshop` | 鍛造/強化/詞條重鑄 | Needs readable anvil, furnace, material shelves, and room for UI overlays. |
| `scene.market_stalls` | 市集/黑市 | Normal stalls plus a visually discoverable hidden-market entrance. |
| `scene.adventure_lowlands` | 低階冒險區 | Warm lowland road with a central path and small ruins. |
| `scene.adventure_ruins` | 中高階冒險區 | Ancient ruins with clear interaction points. |
| `scene.endless_tower` | 無盡塔 | Vertical tower interior, glyphs, and combat-readable composition. |
| `scene.dungeon_cave` | 幽暗洞窟 | Dark cave entrance, readable path, cool torchlight, UI-friendly composition. |
| `scene.dungeon_jungle` | 迷霧叢林副本 | Toxic mist, overgrown paths, ruined weaver village hints, clear foreground path for UI. |
| `scene.dungeon_ruins` | 遠古遺跡副本 | Golden mechanism temple, readable pressure plates, arcane defense machinery. |
| `scene.dungeon_snow` | 冰封雪峰副本 | Frozen ridge, buried forge traces, harsh wind, high contrast for cold UI overlays. |
| `scene.dungeon_hell` | 煉獄深淵副本 | Black flame border, lava fissures, abyssal depth, readable combat-safe composition. |
| `scene.casino_hall` | 賭場主場景 | 金色燈火、紅絨桌、帳房桌、黑市門縫與暗處人群。表面華麗，底層腐敗，但不可干擾 UI 閱讀。 |
| `scene.casino_game_table` | 賭場遊戲介面背景 | 骨骰、舊羊皮紙、鐵鏽色桌毯、籌碼、蠟燭與酒痕；中央必須乾淨，方便放互動控件。 |
| `scene.casino_prize_wall` | 賭場奇物獎池 | 鎖住的傳說剪影、稀有素材展示、暗金標籤與腐敗華麗感，用於抽獎/兌換介面。 |

## World Objects

| Key | Purpose |
| --- | --- |
| `world.blueprint_cache` | 地圖事件：遺落鍛造筆記，觸發鍛造委託線索。 |
| `world.notice_board` | 大廳世界物件：冒險公告欄，觸發懸賞與城鎮委託線索。 |
| `world.ruin_tablet` | 遺跡石碑，未來可觸發探索/支線。 |
| `world.cave_route_tablet` | 指向幽暗洞窟的路線石碑，可沿用或延伸 `world.ruin_tablet`。 |
| `world.tower_glyph` | 無盡塔符文，未來可觸發高階裝備規則或套裝線索。 |
| `world.ancient_forge_core` | 副本中的遠古爐心，連接重鑄/鍛造系統。 |
| `world.black_market_door` | 黑市入口/特殊交易解鎖視覺。 |
| `world.casino_ledger` | 賭場帳房瑪洛、假勝率與黑錢暗號支線用帳冊。 |
| `world.casino_relief_box` | 第三章賭場籌碼轉成避難補給基金的視覺物件。 |
| `world.casino_prize_wall` | 賭場奇物獎池場景物件，顯示傳說剪影與限量獎品。 |
| `world.casino_whisper_contract` | 高風險賭局或惡魔莊家低語事件用契約。 |

## Item Icons

| Key | Purpose |
| --- | --- |
| `item.blueprint_scroll` | 製作圖、配方碎片、任務線索圖示。 |
| `item.weapon_blueprint` | 武器製作圖，用於鍛造配方解鎖。 |
| `item.armor_blueprint` | 防具製作圖，用於鍛造配方解鎖。 |
| `item.ancient_coin` | 特殊物品：古代錢幣，開啟黑市與商人委託。 |
| `item.recipe_fragment` | 通用配方碎片，用於未來圖紙收集。 |
| `item.quest_token` | 任務物品通用圖示。 |
| `item.reforge_seal` | 詞條重鑄消耗或任務道具。 |
| `item.casino_chip` | 賭場籌碼、任務盈利與避難基金。 |
| `item.loaded_dice` | 假勝率、黑市暗號、作弊線索。 |
| `item.slot_reel` | 老虎機玩法或賭場戰利品結算。 |
| `item.casino_voucher` | 補給券，賭場金流轉為避難資源。 |
| `item.bone_dice` | 骨製骰子，高風險賭局核心道具。 |
| `item.black_market_ticket` | 黑市籤，進入特殊獎池或情報交易。 |
| `item.casino_prize_case` | 大獎演出與戰利品匣。 |
| `item.blood_chip` | 血色籌碼，用於高風險賭局與腐敗賭場支線。 |
| `item.relief_voucher` | 救濟券，第三章賭場資源轉換與避難補給。 |

## NPC Portraits

| Key | Purpose |
| --- | --- |
| `npc.blacksmith` | 只在鍛造師任務、鍛造關鍵互動時顯示。 |
| `npc.secret_vendor` | 黑市或特殊交易事件顯示。 |
| `npc.scholar` | 遺跡、配方、世界規則線索。 |
| `npc.marlow` | 賭場帳房瑪洛，負責假勝率與避難補給基金支線。 |
| `npc.demon_dealer` | 惡魔莊家，高風險賭局、低語契約與後期賭場壓力事件。 |
| `npc.ruined_gambler` | 落魄賭徒，用於連敗、救濟或賭場支線。 |
| `npc.casino_guard` | 賭場守衛，用於玩家贏太多後的注意與威脅事件。 |

## Gameplay Asset Notes

- 副本背景目前已有可用圖並接入場景。後續如果替換成正式美術，每張仍要能容納副本 HUD、戰鬥提示與機制說明。
- 賭場素材已有大廳、賭桌、獎池牆與七個特殊物件圖示可用。後續高風險賭局、惡魔莊家、守衛與落魄賭徒仍可依此規格補正式演出素材。
- 賭場視覺關鍵字：金碧輝煌、貪婪、腐敗、衰敗、狂熱、誘惑、絕望。可以有骨骰落桌、惡魔低語、突兀狂笑、暗處抽泣、焚香、鐵鏽血味、劣質烈酒與舊羊皮紙霉味的畫面暗示。
- 賭場獎品素材要支援「金幣不再是唯一回饋」：籌碼、黑市籤、稀有素材、圖紙碎片、戰術技能書、賭場限定裝備與章節鎖定傳說獎池。
- 副本背景生成後必須實機檢查戰鬥 UI、入口風險提示、戰利品格子與旅人手札紀錄，不能只檢查圖片有沒有載入。

## Rule

Vendor portraits and dialogue should appear only when the interaction is meaningful. Repeated generic greetings should not be treated as content.
