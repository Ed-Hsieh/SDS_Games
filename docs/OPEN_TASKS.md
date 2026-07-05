# 未完成事項追蹤

更新日期：2026-07-03

這份文件只記錄「仍需要設計、實作、驗證或取捨」的事項。已完成的流水帳不放在這裡，避免待辦清單失去判斷力。

## P0：近期優先

| 項目 | 目前狀態 | 下一步 |
| --- | --- | --- |
| 怪物 / 武器 / 副本資料補完接續 | 2026-07-05 已補進 10 隻計畫怪物、6 個素材、16 件裝備、`radiant_corridor` 光明副本；`DataConsistencyCheck` 已通過。仍缺圖片、藍圖掉落與部分 dungeon-scoped 掉落來源判定。 | 先讀 `docs/AGENT_SESSION_LOG.md` 的「2026-07-05 Checkpoint」。下一步先處理 dungeon-scoped drop source：決定補 dungeon monster `equipmentDrops`，或更新平衡檢查器支援 `cave:rock_golem` 這類來源；再補 `BlueprintDrops.js`。 |
| 商業版 UI 精修 | 百科、部分鍛造、物品詳細、戰術技能提示已進入收斂；旅行行囊、角色、背包、倉庫仍是主要弱點。 | 先重構旅行行囊的角色 / 背包 / 倉庫內容區，移除重複 TAB 語意，固定 icon 尺寸與資訊密度；不再處理手機版。 |
| 戰鬥面板重構 | 圓形節奏、主副手概念、裝備效果認知已開始；仍需要整體版面與狀態資訊區收斂。 | 整理玩家 / 怪物 BUFF、DEBUFF、裝備效果、套裝效果的顯示位置；修正戰鬥與戰利品擠壓；確認命中、暴擊、失誤顯示與判定一致。 |
| 鍛造強化 / 修復 / 詞綴 UI | 鍛造製作頁目前可接受；強化、修復、詞綴重鑄仍需要統一資訊結構。 | 保留製作頁邏輯，重構強化、修復、詞綴頁：材料需求、費用、成功率、結果預覽、裝備選擇與錯誤提示要一致且不跑版。 |
| 核心循環與難度曲線 | 已確認目標是「探索 -> 採集 -> 裝備構築 -> BOSS -> 新階層」，但第一章節體驗仍偏短，副本吸引力不足。 | 調整任務素材獎勵、經驗曲線、怪物掉落、裝備耐久與副本收益；讓前期有裝備壓力，中後期有構築與 BOSS 門檻。 |
| 探索成本與地圖節奏 | 疲勞方向已確定：初始 20，每級 +10；疲勞歸零進入虛弱。地圖探索與副本循環仍未完全收斂。 | 補齊疲勞死亡懲罰、地圖未探索黑幕、DEV 模式全開地圖、探索消耗與副本進章節循環的規則。 |
| 資料規格收斂 | 百科已拆成裝備 / 素材 / 圖紙 / 物品 / 怪物規格；仍有歷史資料與孤兒物品需要決策。 | 整理非裝備卻帶戰鬥 stats 的物品、賭場特殊物、成就型道具與孤兒素材；先討論 `補修零件包`、`可用碎料`、`craftsman_gouge`、`dungeon_master_badge` 的去留。 |

## P1：P0 穩定後處理

| 項目 | 目前狀態 | 下一步 |
| --- | --- | --- |
| DEV 測試工具 | 已多次提出需要更好測試效率；目前仍需要統一整理。 | DEV 加道具要中文化、分類、可搜尋；戰鬥模擬要記住選項，並支援目前裝備 / 指定武器防具飾品的快速模擬。 |
| 平衡驗證腳本 | 既有檢查腳本可用，但尚未對新循環做完整長測。 | 在調整掉落、耐久、經驗、疲勞與副本收益後，重新跑 1000 次早期流程模擬，檢查裝備空窗、修復壓力與死亡率。 |
| 成就系統正式化 | 書記小屋已有 placeholder；戰術技能已改成成就式解鎖。 | 設計正式成就分類、獎牌圖示、被動加成規則；把不適合當裝備的特殊物轉成成就或收藏。 |
| 場景走入式互動 | 市集邊棚與賭場目前先保留現有低成本表現；走入場景熱點式入口延後。 | 最後打磨時改成場景圖熱點：滑過反光、點擊聚焦攤位 / NPC、再開較大的對話與交易介面。 |
| 美術替換 | 主線 BOSS 風格保留；菁英、非主線 BOSS、圖紙歪斜與部分素材仍要逐批替換。 | 等 UI 框線與圖像規格穩定後，再重新生成菁英 / BOSS / 圖紙 / 系統外框素材，避免重複返工。 |

## 2026-07-05 資料補完後的明確缺口

| 項目 | 目前狀態 | 下一步 |
| --- | --- | --- |
| 新素材圖片 | 新增 `vine_core`、`demon_core`、`radiant_thread`、`light_essence`、`radiant_shard`、`radiant_core` 後，這 6 張 runtime WebP 還不存在。 | 生成並放入 `src/assets/images/art/items/materials/`，再更新 ready 狀態。 |
| 新武器 / 裝備圖片 | 新增 16 件裝備資料，但尚未生成對應圖片。 | 先確認裝備清單與風格，再批次生成武器、焦點、防具圖片。 |
| 新怪物圖片 | 新增 10 隻怪物資料，但尚未生成對應圖片。 | 依規則生成：普通怪少背景，菁英可有輕場景，`aurora_archon` 是非主線 Boss，不可比主線 Boss 更華麗。 |
| 光明副本場景圖 | `radiant_corridor` 已加入副本 DB 與 AssetManifest，但 `dungeon_radiant_corridor` 圖片尚未生成。 | 補副本圖卡 / 全圖場景後再跑 `AssetCoverageCheck.mjs`。 |
| 藍圖掉落 | 新怪物與新特殊裝備已存在，但 `BlueprintDrops.js` 還沒補。 | 補光明、深淵、叢林、微光、暗影新增裝備的圖紙或掉落來源。 |
| 平衡檢查警告 | `EquipmentBalanceCheck` 與 `MonsterBalanceCheck_v4` 已跑出非阻斷警告。 | 後續調整戰鬥大改時再處理：舊普通怪偏軟、`aurora_archon` 偏致命、新套裝單件分數偏弱但可能可接受。 |

## 暫緩或明確不做

- 手機版打磨：目前不開發手機模式，後續 UI 驗收以桌面為準。
- 塔 BOSS 圖片重做：已明確暫緩。
- 大規模場景熱點改造：等核心 UI 與循環穩定後再做。
- 雙武器以外的盾牌姿態 / 防禦姿態大改：先完成目前主副手操作代價與戰鬥版面。

## 驗收基準

- 桌面優先尺寸：`1280x631`。
- 每次 UI 改動至少檢查：大廳、旅行行囊、百科、鍛造、冒險戰鬥、戰利品結算。
- 每次平衡改動至少檢查：初期 1 到 3 級、第一個 BOSS 前、第一章結束前的裝備耐久、藥水、修復素材與死亡率。

## 2026-07-05 Clean Checkpoint

Completed in the latest continuation:

- Data consistency still passes.
- New dungeon-scoped equipment drops and blueprint source links are connected.
- New special equipment stats were tuned back into OK range.
- New material art gaps are closed:
  `vine_core`, `demon_core`, `radiant_thread`, `light_essence`,
  `radiant_shard`, `radiant_core`.
- All 16 new content-rebuild equipment images are generated, converted to WebP,
  and ready in `AssetManifest.js`.
- All 10 new content-rebuild monster images are generated, converted to WebP,
  and ready in `AssetManifest.js`.

Current remaining asset work:

- 36 legacy/live equipment images still need new `src/assets/images/art/`
  replacements.
- 33 legacy/live monster images still need new `src/assets/images/art/`
  replacements.
- Radiant dungeon scene/card/full image still needs generation and linking.

Current validation snapshot:

```text
DataConsistencyCheck.mjs: passed
EquipmentBalanceCheck.js --json: ran successfully
MonsterBalanceCheck_v4.js: ran successfully, flagged 36/53
Equipment issues: 19 old/legacy issues remain
New rebuild equipment ready: 16/16
New rebuild monsters ready: 10/10
Materials ready: 101/101 database materials
```

## 2026-07-05 Legacy Replacement Pass 1

Completed old monster replacements:

```text
slime, goblin, wild_wolf, skeleton, giant_rat,
orc_warrior, shadow_bat, poison_spider, stone_golem_mini, treant
```

Completed old equipment replacements:

```text
old_sword, old_armor, slime_sword, goblin_dagger, wolf_fang_blade,
wolf_pelt_armor, spider_silk_gloves, forest_guardian_staff,
forest_guardian_crown, bone_sword
```

Updated asset counts:

```text
Equipment art in new folder: 26/62
Monster art in new folder: 20/53
Remaining equipment gaps: 36
Remaining monster gaps: 33
```
