# Art Asset Structure

更新日期：2026-07-04

本輪美術重建採用新根目錄 `src/assets/images/art/`。目標是移除舊 `art-v2/category/id.webp` 的扁平分類思維，改成能表達遊戲用途的結構。舊 `art-v2` 只作為過渡 fallback；當對應 ID 在 `art` 完成並驗收後，才切換到新圖。

## 不變規則

- 保留目前生成出的暗色寫實奇幻風格。
- 主線 BOSS 現行滿版大圖風格保留。
- 非主線 BOSS 與菁英怪物可以有場景粉飾，但不要比主線 BOSS 更華麗。
- 普通小怪可以沒有背景，優先透明或極簡暗底。
- 圖片不放文字、UI 框、按鈕、數字或浮水印。

## 新資料夾

| 類型 | 新路徑 |
| --- | --- |
| 素材 | `src/assets/images/art/items/materials/` |
| 裝備掉落 | `src/assets/images/art/items/equipment/` |
| 製作成品 | `src/assets/images/art/items/crafted-items/` |
| 圖紙 | `src/assets/images/art/items/blueprints/` |
| 商店物品 | `src/assets/images/art/items/shop-items/` |
| 線索 / 任務物 | `src/assets/images/art/items/clues/` |
| 故事遺物 | `src/assets/images/art/items/story-relics/` |
| 普通怪 | `src/assets/images/art/entities/monsters/normal/` |
| 菁英怪 | `src/assets/images/art/entities/monsters/elite/` |
| 支線 / 副本 BOSS | `src/assets/images/art/entities/monsters/boss-side/` |
| 主線 BOSS | `src/assets/images/art/entities/monsters/boss-main/` |
| NPC 立繪 | `src/assets/images/art/characters/portraits/` |
| 城鎮地點 | `src/assets/images/art/scenes/town/places/` |
| 地城卡圖 | `src/assets/images/art/scenes/dungeons/cards/` |
| 地城全圖 | `src/assets/images/art/scenes/dungeons/full/` |
| 世界地標卡圖 | `src/assets/images/art/scenes/world/landmarks/` |
| 世界地標全圖 | `src/assets/images/art/scenes/world/landmarks-full/` |
| 地圖物件 | `src/assets/images/art/scenes/world/props/` |
| 背景 | `src/assets/images/art/scenes/backgrounds/` |
| 戰鬥效果 | `src/assets/images/art/effects/combat/` |
| UI 皮膚 | `src/assets/images/art/ui/` |

## 接入策略

1. 新圖先放入 `art` 對應路徑。
2. 在 `AssetManifest.js` 的 `ART_READY` 對應分類加入 ID。
3. 跑 `node scripts/AssetCoverageCheck.mjs` 確認資料引用仍完整。
4. 確認 UI 中尺寸與裁切正常後，再處理下一批。
5. 所有必要資產覆蓋後，移除 `art-v2` fallback 與舊資料夾引用。

## 生成優先順序

1. 素材圖片全量重生。
2. 裝備掉落與製作成品重生。
3. 怪物依普通怪、菁英、非主線 BOSS、主線 BOSS 逐級重生或保留。
4. 場景、地標、UI、戰鬥效果補齊。
