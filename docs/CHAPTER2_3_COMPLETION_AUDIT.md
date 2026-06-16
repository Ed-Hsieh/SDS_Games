# 第二、三章補齊紀錄

本文件記錄第二章「丘陵的執念」與第三章「諸神黃昏」目前已落地的故事、支線與城鎮狀態，用來避免章節內容只散落在資料表與對話中。

## 補齊原則

- 第二章負責把第一章的邊境災害擴大成多方向後果：交易、潮汐、亡靈、暴政、黑市與賭場金流。
- 第三章負責把終局壓力拉回城鎮：北境消息、避難者、終局裝備、撤退名單、最後索引與補給基金。
- 支線不是額外雜務，而是主線沒有篇幅說完的小人物短篇。
- 支線完成後至少要改變一個城鎮或地點狀態，讓玩家感覺世界記得這件事。

## 第二章：丘陵的執念

主線配置：

- `main_007` 丘陵的執念
- `main_008` 荊棘交換珠
- `main_009` 沉鐘浮聲
- `main_010` 被掘開的古墓
- `main_011` 灰燼男爵的地宮

支線配置：

| 支線 | 核心角色 | 章節功能 | 城鎮狀態 |
| --- | --- | --- | --- |
| `commission_forge_001` 圖紙邊角的名字 | 妮露 / 鍛造師 | 把圖紙與丘陵礦材路線連起來 | `town.blacksmith.neelu_blueprint_named` |
| `commission_herb_basket` 採藥籃不會說謊 | 失蹤採藥人 / 藥師 | 補足荊棘女巫交易規則靠近城鎮 | `town.apothecary.understands_thorn_trade` |
| `commission_herb_basket_002` 籃底縫著的名字 | 失蹤採藥人 | 讓採藥籃從怪事變成求救 | `town.apothecary.remembers_lost_gatherer` |
| `commission_drowned_bell_insomnia` 沉鐘下的失眠人 | 失眠居民 / 書記 | 讓沉鐘神諭影響城鎮夜晚 | `town.scholar.records_drowned_bell_rhythm` |
| `commission_coast_lamplighter` 守燈人的油壺 | 守燈人塔維 | 補上海岸災後小人物 | `town.coast_refugee_lamp_lit` |
| `commission_grave_bookmark` 墓園書籤 | 古代學者 / 書記 | 讓巫妖不只是怪物分類 | `town.scholar.records_lich_name` |
| `commission_grave_bookmark_002` 朱利安的邊註 | 大御術師朱利安 | 連到遠古遺跡與盲目秩序 | `town.scholar.julian_margin_read` |
| `commission_ash_ledger_names` 帳冊上的名字 | 失蹤工匠們 / 村長 | 讓灰燼男爵暴政先壓到城鎮 | `town.notice_board.missing_workers_named` |
| `commission_ash_ledger_names_002` 工匠最後的刻痕 | 失蹤工匠們 | 讓工匠留下地宮方向 | `town.notice_board.worker_marks_mapped` |
| `commission_casino_001` 帳房瑪洛的假勝率 | 瑪洛 | 讓賭場接上灰燼男爵金流 | `town.casino.false_odds_exposed` |
| `commission_merchant_001` 黑市收藏家的標籤 | 伊文 | 讓黑市從商店變情報來源 | `town.black_market.ledger_tags_read` |

第二章目前符合成長規格：5 段主線、11 條支線、6 個以上城鎮狀態、5 條以上裝備或圖紙連動。

## 第三章：諸神黃昏

主線配置：

- `main_012` 龍巢之路
- `main_013` 古龍之巢
- `main_014` 封印碎裂
- `main_015` 終焉之戰：阿薩謝爾

支線配置：

| 支線 | 核心角色 | 章節功能 | 城鎮狀態 |
| --- | --- | --- | --- |
| `commission_forge_002` 秘銀不是傳說 | 逃匠奧倫 / 鍛造師 | 讓終局裝備路線接上妮露圖紙 | `town.blacksmith.mithril_route_ready` |
| `commission_northern_letter` 北境來信 | 北境信使 | 把北方從高階地圖拉回普通生活 | `town.refugees.northern_letters` |
| `commission_northern_letter_002` 沒有寄出的回信 | 等待回信的人 / 村長 | 讓城鎮承認自己聽見北方 | `town.refugees.unsent_reply_archived` |
| `commission_last_soup` 最後一鍋湯 | 藥師 / 避難者 | 讓終局壓力落在補給與日常 | `town.refugees.soup_kitchen_warm` |
| `commission_broken_standard` 斷旗手芙蕾 | 芙蕾 | 讓撤退被重新理解成秩序 | `town.gate.broken_standard_raised` |
| `commission_broken_standard_002` 旗影下的點名 | 芙蕾 / 失散者 | 把旗幟象徵推進到尋人名單 | `town.gate.retreat_names_called` |
| `commission_scholar_last_index` 書記的最後索引 | 書記 | 讓旅人手札從工具變成城鎮記憶 | `town.scholar.last_index_bound` |
| `commission_casino_002` 最後一夜的籌碼 | 瑪洛 | 讓賭場轉成避難補給基金 | `town.casino.relief_fund_counted` |

第三章目前符合成長規格：4 段主線、8 條支線、8 個以上城鎮狀態、6 條以上裝備或圖紙連動。

## 本輪補上的資料斷點

以下旗標原本會被對話設定，但城鎮場所沒有顯示狀態，本輪已補上：

- `town.notice_board.worker_marks_mapped`
- `town.refugees.unsent_reply_archived`
- `town.gate.retreat_names_called`
- `town.apothecary.remembers_lost_gatherer`
- `town.scholar.julian_margin_read`

`metTownScholarForRoute` 是第一章教學流程內部旗標，不需要顯示成城鎮狀態。

## 驗收方式

新增檢查腳本：

```bash
node scripts/ChapterStoryCompletenessCheck.mjs
```

此腳本會檢查：

- 第二、三章主線與支線數量是否達到規格。
- 第二、三章支線是否都有 `QuestStories` 故事資料與角色側寫。
- 支線故事引用的 `townState` 是否有城鎮場所能顯示。
- NPC 對話設定的世界旗標是否有對應場所狀態。
