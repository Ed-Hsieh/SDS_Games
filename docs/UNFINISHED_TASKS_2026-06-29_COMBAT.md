# 2026-06-29 戰鬥續作清單

本文件整理昨天戰鬥調整後的接續狀態。2026-06-29 本輪已完成「驗證、UI 實測、資產覆蓋、檢查腳本同步 runtime 平衡」等收尾項目；較大的戰鬥重設計與長時間掉落/耐久 playtest 仍保留為後續工作。

## 本輪已完成

- 已重跑主要語法與資料檢查，確認目前沒有阻擋性錯誤。
- 已修正資產覆蓋檢查：
  - 為 26 個 casino special equipment 補上可用的 equipment asset alias。
  - `town-place` 若使用 `sceneImage`，改用 16:9 場景圖尺寸規則；只有 fallback generated icon 才要求方圖。
- 已完成冒險戰鬥 UI 瀏覽器驗收：
  - `#adventure` BOSS test panel 改為 fixed 定位，1280x631 viewport 不再水平溢出。
  - 戰鬥 modal、節奏/攻擊控制、補給卡顯示正常。
  - 補給不再顯示 `生命 +0`；沒有補血值的 consumable 會顯示 `可用`。
- 已完成副本戰鬥 UI 瀏覽器驗收：
  - `?dev=1` 時新增副本遭遇測試工具，可直接觸發普通/精英/Boss 戰。
  - `#dungeon` 戰鬥 overlay、行動卡、攻擊冷卻、戰鬥 log 在 1280x631 viewport 正常。
- 已完成怪物平衡檢查策略決策：
  - 保留 runtime `CombatBalance.js` 作為目前怪物戰鬥倍率來源。
  - `scripts/MonsterBalanceCheck_v4.js` 已改成 v4.1，直接載入 `Monsters.js` 與 `CombatBalance.js`，避免舊報表使用未套倍率資料。
- 已確認武器手感實作路徑仍在：
  - 史萊姆劍 flat lifesteal 3-5。
  - 劍系爆擊改成攻速節奏加成，不靠暴擊倍率秒怪。
  - 短刀連段、重武破甲、法杖緩速、長槍穿甲皆由 `WeaponCombatProfile` 與 `FightManager` 套用。
- 已更新前端 cache-bust 版本為 `combat-continuation-20260629`，避免瀏覽器沿用舊 bundle。

## 本輪驗證紀錄

- `node --check`
  - `src/js/main.js`
  - `src/js/scenes/DungeonScene.js`
  - `src/js/utils/CombatUI.js`
  - `src/js/data/AssetManifest.js`
  - `scripts/AssetCoverageCheck.mjs`
  - `scripts/MonsterBalanceCheck_v4.js`
- `node scripts/DataConsistencyCheck.mjs` 通過。
- `node scripts/StructureConsistencyCheck.mjs` 通過。
- `node scripts/ItemFlowCheck.mjs` 通過。
- `node scripts/AssetCoverageCheck.mjs` 通過，missing mappings/files/dimension warnings 皆為 0。
- `node scripts/EventPoolCheck.mjs` 通過，role rotation probe 無 repeated last role。
- `node scripts/SideStoryFlowCheck.mjs` 通過，檢查 29 個 side/hidden quests。
- `node scripts/ChapterStoryCompletenessCheck.mjs` 通過。
- `node scripts/EquipmentBalanceCheck.js` 通過，issues 0。
- `node scripts/GameExperienceAudit.mjs` 通過，issues 0。
- `node scripts/BetaConvergenceCheck.mjs` 通過，issues 0。
- `node scripts/FightMatchupCheck.js` 通過。
- `node scripts/MonsterBalanceCheck_v4.js` 通過並確認：
  - `Source: runtime`
  - `Runtime balance: on`
  - 43 monsters checked
  - 27 monsters flagged as follow-up tuning candidates

## 仍保留為後續項目

- 戰鬥大改版尚未進行：
  - 例如玩家職業/武器流派差異、怪物技能節奏、Boss 階段化、長期數值曲線重整。
- 掉落與耐久仍需要長時間 playtest：
  - 目前資料檢查與掉落鏈接已通過，但還沒有足夠長的實玩樣本判斷「掉落頻率、裝備替換速度、耐久消耗」是否舒服。
- 怪物手感仍需要人工調參：
  - v4.1 報表已能套 runtime 倍率，接下來可依 flagged list 分批調整。
  - 目前報表偏向把早期小怪標記為偏軟、部分 Boss 標記為偏致命；這是下一輪平衡調參的入口，不是程式錯誤。

## 本輪觸及檔案

- `index.html`
- `scripts/AssetCoverageCheck.mjs`
- `scripts/MonsterBalanceCheck_v4.js`
- `src/css/ui-foundation.css`
- `src/js/data/AssetManifest.js`
- `src/js/main.js`
- `src/js/scenes/DungeonScene.js`
- `src/js/utils/CombatUI.js`
- `src/style/adventure.css`
