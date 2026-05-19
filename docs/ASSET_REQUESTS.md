# Asset Requests

This document records image assets that are useful for the next world-building phase. Generate these later as one batch, then map them back to `src/js/data/WorldInteractions.js` through `imageKeys`.

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

## NPC Portraits

| Key | Purpose |
| --- | --- |
| `npc.blacksmith` | 只在鍛造師任務、鍛造關鍵互動時顯示。 |
| `npc.secret_vendor` | 黑市或特殊交易事件顯示。 |
| `npc.scholar` | 遺跡、配方、世界規則線索。 |

## Rule

Vendor portraits and dialogue should appear only when the interaction is meaningful. Repeated generic greetings should not be treated as content.
