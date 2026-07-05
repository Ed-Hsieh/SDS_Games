# Art Asset Queue

更新日期：2026-07-04

這份清單由 `node scripts/BuildArtQueue.mjs` 產生，作為素材、裝備、怪物與場景圖片重生的執行隊列。

## Counts

| Category | Count |
| --- | ---: |
| blueprints | 49 |
| craftedItems | 49 |
| dungeon-zone-scenes-full | 5 |
| equipment | 79 |
| materials | 95 |
| monsters | 63 |
| shopItems | 14 |
| town-places | 8 |

## First Priority

- `materials`: 先全量重生素材圖片。
- `equipment` / `craftedItems`: 第二批重生掉落裝備與製作成品。
- `monsters`: 依普通怪、菁英、支線 BOSS、主線 BOSS 規格分批處理。

完整 prompt 與輸出路徑見 `docs/generated/art-asset-queue.json`。
