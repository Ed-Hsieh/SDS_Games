# 2026-06-29 戰鬥改版接續紀錄

狀態：本文件紀錄目前工作樹中「已改但尚未提交」與「尚未完成」的戰鬥改版。下次接續時不要重置這批檔案。

使用者偏好：之後專注電腦版，不再額外開發手機版介面。

## 這輪已經完成但尚未提交

- 戰鬥畫面：塔戰鬥已改成獨立中央 fixed 彈窗，背景遮罩已在瀏覽器確認生效；冒險/副本原本已有 modal，底部控制區已弱化「下方切分卡片」感。
- 戰鬥節奏：新增 `src/js/utils/WeaponCombatProfile.js`，讓武器類型有不同節奏與效果。
  - 劍類：平衡型，爆擊後給有限攻速感。
  - 短刀：較快、命中區較窄，每 3 次命中追加追擊。
  - 重武器：較慢、傷害較高，附破甲。
  - 法杖/魔導：附緩速。
  - 長柄：附穿甲。
  - 史萊姆之劍：保留吸血定位，補上每次命中約 3-5 的吸血下限。
- 怪物強度：新增 `src/js/data/CombatBalance.js`，世界/塔/副本 runtime 怪物會套用三圍倍率，讓戰鬥有時間跑出武器機制。
- 暴擊降溫：降低基礎暴擊、暴擊上限、預設被動 `sharp_focus`，並縮小節奏條 Crit Zone。
- 冷卻修正：節奏條與副本攻擊冷卻改用 `getAttackInterval()`，避免把攻速倍率誤當秒數。
- 掉落與耐久：素材掉落機率下修；新裝備/舊裝備 fallback 耐久基準從 50 降到 35，裝備生成耐久曲線也下修。
- 升級回血：修正升級扣經驗順序，升級改為部分回血且不再出現回復 0 的狀況。

## 已跑過的驗證

- `node --check` 已通過：`FightManager.js`、`RhythmBarSystem.js`、`WeaponCombatProfile.js`、`CombatBalance.js`、`DropManager.js`、`MonsterManager.js`、`Dungeons.js`、`CharacterLogic.js`、`AdventureScene.js`、`DungeonScene.js`、`TowerScene.js`、`ForgeScene.js`、`GameManager.js`、`DataModel.js`、`ItemSchema.js`、`EquipmentBalance.js`。
- `scripts/GameExperienceAudit.mjs`：通過，issues 0。
- `scripts/BetaConvergenceCheck.mjs`：通過，issues 0。
- `scripts/FightMatchupCheck.js`：通過。
- `scripts/MonsterBalanceCheck_v4.js`：可跑，但它看起來仍用舊資料/舊模型評估一般怪偏弱，未必吃到 runtime `CombatBalance`。
- 瀏覽器實測：`#tower` 開始戰鬥後，`#battle-state` 為 `position: fixed`、寬 980、高約 612、遮罩生效、console error 0。

## 尚未完成，下一次優先處理

- 重新跑一次所有檢查：最後有再提高 `CombatBalance` 的怪物倍率，這個微調後尚未重跑全套驗證。
- 實際遊玩驗證冒險與副本戰鬥畫面：塔已確認彈窗，冒險/副本還需要用瀏覽器進戰鬥看底部控制區是否仍有違和感。
- 戰鬥手感微調：
  - 確認史萊姆之劍吸血是否穩定落在約 3-5，且不會過強。
  - 確認暴擊頻率是否不再容易秒怪。
  - 確認短刀追擊、重武器破甲、法杖緩速、長柄穿甲在 UI 浮字與戰鬥結果上都有明確感受。
- 怪物數值策略需要決定：
  - 若 runtime `CombatBalance` 手感好，可以保留 helper。
  - 若希望稽核腳本與資料完全一致，下一步要把倍率回寫到怪物資料或更新 `MonsterBalanceCheck_v4.js` 讀取 runtime balance。
- 戰鬥系統大改仍未完成：
  - 目前只是先做武器差異化與節奏修正，還不是完整「主動判斷怪物招式 / 玩家節奏反應 / 技能選擇」系統。
  - 下一階段應設計怪物攻擊預告、玩家防禦/閃避窗口、不同武器的主動節奏玩法，而不是只等讀取條。
- 掉落與耐久需要 playtest：
  - 素材掉落已下修，但還沒用一段冒險流程確認資源壓力是否舒服。
  - 耐久基準已降低，但修理/替換裝備的經濟壓力還要確認。

## 目前這輪主要異動檔案

- `src/css/ui-foundation.css`
- `src/js/data/CombatBalance.js`
- `src/js/utils/WeaponCombatProfile.js`
- `src/js/managers/FightManager.js`
- `src/js/utils/RhythmBarSystem.js`
- `src/js/models/CharacterLogic.js`
- `src/js/managers/DropManager.js`
- `src/js/data/Dungeons.js`
- `src/js/managers/MonsterManager.js`
- `src/js/scenes/AdventureScene.js`
- `src/js/scenes/DungeonScene.js`
- `src/js/scenes/TowerScene.js`
- `src/js/data/EquipmentBalance.js`
- `src/js/models/ItemSchema.js`
- `src/js/models/DataModel.js`
- `src/js/managers/GameManager.js`
- `src/js/scenes/ForgeScene.js`
- `src/js/data/PassiveCombatEffects.js`
