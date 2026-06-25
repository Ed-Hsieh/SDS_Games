# Beta 收斂稽核

這份文件用來固定「先收斂共通協作系統，再拿回新開發事項」的節奏。之後新增支線、BOSS、圖片或玩法前，先跑這裡的檢查，避免核心流程被內容更新拖散。

## 固定檢查入口

```bash
node scripts/BetaConvergenceCheck.mjs
```

這支檢查不是取代細部驗收，而是確認 Beta 不能鬆掉的共通層仍然存在：

- 驗收腳本入口完整。
- 共用物品 UI、Tooltip、詳情彈窗、戰鬥 UI、存檔、任務、事件、副本、賭場、裝備效果解析器都存在。
- 旅人手札正式分頁存在：委託、首領痕跡、世界見聞、鍛造備忘、城鎮記憶。
- 三章主線骨架維持 6 / 5 / 4。
- 支線密度維持目前 Beta 水準：第一章 10、第二章 11、第三章 8。
- 跨章節敘事線與支線敘事分類仍有資料可對齊。
- 地圖事件角色涵蓋資源、交易、支線、故事種子、風險報酬、世界見聞、壓力事件。
- 五個副本都有獨特機制與獎勵定位。
- 賭場獎池有章節成本、獎勵可解析，技能書與特殊物品能接回物品系統。
- 戰術技能維持單槽，且大部分技能由任務、旗標或道具解鎖。
- 城鎮場所至少有居民或可互動行為。

## 目前結果

2026-06-25 的資料層驗收結果：

- `BetaConvergenceCheck`：通過，0 issues / 0 warnings。
- `GameExperienceAudit`：通過，0 issues / 0 warnings。
- `EventPoolCheck`：通過，0 warnings。
- `EquipmentBalanceCheck --json`：0 issues，15 notes。
- `CrossChapterStoryArcsCheck`：通過，8 條跨章節線。
- `SideStoryNarrativeTaxonomyCheck`：通過，22 條章節委託分類完成。

2026-06-25 的 1280x631 畫面 smoke test：

- 測試場景：大廳、旅人手札、市集、鍛造、百科、冒險地圖、幽暗洞窟副本、賭場。
- 結果：未發現水平爆版。
- 結果：未發現場景載入 JavaScript error。
- 修正：鍛造配方列表的 icon 未固定尺寸，導致配方名稱被壓到 16px；已固定配方列表圖示為 44px。
- 觀察：市集側欄小物品格的 `x3` 徽章在自動量測中有 3px 誤差，但未造成整頁爆版，暫不調整。

## 非阻塞調整

這些不是 Beta 主循環阻塞，但之後仍可精修：

- 裝備平衡有 15 筆 notes，多數是套裝單件偏強或偏弱；目前不當作錯誤，後續看實際手感再調。
- 事件池沒有硬錯，且近期角色避讓已補強；`EventPoolCheck` 的重複最後類型探針目前為 0/44。
- 1280x631 已做第一輪主場景 smoke test；之後改 UI 時仍要重跑，資料層通過不代表互動狀態都不跑版。

## 新開發拿回順序

1. 先做 1280x631 的主流程 smoke test：大廳、旅人手札、城鎮場所、市集、冒險、戰鬥、結算、副本、賭場。
2. 修掉 smoke test 看到的版型或流程阻塞。
3. 再調裝備 notes 與事件重複感。
4. 最後才拿回獨立內容：新支線、新 BOSS、關係線、第三章終局分歧、更多賭場玩法與新增美術。

## 暫緩原則

只要某個項目能獨立依附在現有系統上，就先不要急著做。例如新增支線、新人形 BOSS、新關係線、新城鎮區域、新賭場小遊戲，都應等共通流程穩定後再逐步接回。

## 2026-06-25 Interactive Smoke Update

- Tested at the target desktop viewport `1280x631` on `http://127.0.0.1:5178`.
- Routes checked: lobby, quest, shop, forge, encyclopedia, adventure, dungeon-cave, casino.
- Result: no horizontal overflow and no JavaScript errors on the tested routes.
- Shop interaction verified: NPC stall opens the dialogue-trade panel, purchase confirmation spends gold and adds the item to the backpack.
- Casino interaction verified: cashier converts gold to chips, dice table resolves a roll and updates casino records without runtime errors.
- Forge and traveler journal accessibility tightened: recipe cards and journal records now expose button semantics / keyboard-friendly selection instead of mouse-only div cards.
- World event rotation tightened: event selection now prefers roles that have not appeared in recent events. Silver Snare Pass also gained two local events, reducing the role-rotation probe from 10 repeated last-role picks to 0 out of 44.

## 2026-06-25 Keyboard Control Update

- 冒險探索已接上 `WASD / 方向鍵` 移動、`F` 調查、`J` 手札、`I/B` 背包、`Esc` 關閉覆蓋介面。
- 冒險與副本戰鬥已統一為 `A` 攻擊、`D` 道具、`F` 撤退。
- 雙武器、副手與盾牌姿態先隱藏並列為後續戰鬥改版；目前不新增入口、不擴充裝備欄、不調整詞條結構。
