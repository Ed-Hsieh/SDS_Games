# 專案重構進度追蹤

## 目標架構

```
index → View → Scenes → Manager → Database → Model
```

### 各層職責

| 層級 | 職責 | 允許 | 禁止 |
|------|------|------|------|
| **Model** | 純資料結構 | enum, type, interface, class(僅屬性) | 邏輯/函式/計算 |
| **Database** | 靜態資料 | JSON/靜態物件 | 計算/流程邏輯 |
| **Manager** | 遊戲邏輯 | 讀取 Database、處理邏輯 | 使用 View/Scene |
| **Scenes** | 流程控制 | 呼叫 Manager、控制 UI 流程 | 直接讀取資料庫 |
| **Utils** | 工具函式 | 可重用方法 | 資料定義 |
| **Components** | 渲染組件 | 渲染邏輯 | 業務邏輯 |

---

## 重構清單

### 階段 1：純資料拆分

- [x] **1.1** 建立 `models/Enums.js` - 抽取 enum/type
- [ ] **1.2** 純化 `DataModel.js` class - 移除邏輯方法至 Manager
- [ ] **1.3** 建立 `managers/CharacterManager.js` - 從 DataModel 搬移

### 階段 2：資料庫層整理

- [x] **2.1** 純化 `Equipment.js` - 移除函式到 Manager ✅
- [x] **2.2** 統一 `DungeonEntranceConfig` - 移除 WorldMap.js 中的重複定義 ✅

### 階段 3：System → Manager 重命名/搬移

- [x] **3.1** `scenes/TowerSystem.js` → `managers/TowerManager.js` ✅
- [x] **3.2** `scenes/EventSystem.js` → 整合至 `managers/EventManager.js` ✅
- [x] **3.3** `scenes/DungeonSystem.js` → `managers/DungeonManager.js` ✅
- [x] **3.4** `scenes/QuestSystem.js` → `managers/QuestManager.js` ✅
- [x] **3.5** `scenes/CasinoSystem.js` → `managers/CasinoManager.js` ✅
- [x] **3.6** `scenes/AffixSystem.js` → `managers/AffixManager.js` ✅
- [x] **3.7** `scenes/EnhancementSystem.js` → `managers/EnhancementManager.js` ✅

### 階段 4：Utils 整理

- [x] **4.1** `WorldMap.js` 拆分 - 資料移至 Database ✅ (DungeonEntranceConfig 已移至 Dungeons.js)
- [x] **4.2** `DungeonMap.js` 純化 - 確保只含工具函式 ✅ (已確認無 Database 引用)

---

## 執行記錄

### 2024-XX-XX - 階段 3 System → Manager 遷移完成

**變更內容：**
- ✅ TowerSystem.js → managers/TowerManager.js
- ✅ EventSystem.js → 整合至 EventManager.js
- ✅ DungeonSystem.js → managers/DungeonManager.js  
- ✅ QuestSystem.js → managers/QuestManager.js
- ✅ CasinoSystem.js → managers/CasinoManager.js
- ✅ AffixSystem.js → managers/AffixManager.js
- ✅ EnhancementSystem.js → managers/EnhancementManager.js

**新增 Manager 檔案：**
- `managers/TowerManager.js` - 塔挑戰邏輯
- `managers/QuestManager.js` - 任務系統
- `managers/CasinoManager.js` - 賭場遊戲邏輯
- `managers/AffixManager.js` - 詞綴系統
- `managers/EnhancementManager.js` - 強化/寶石/套裝系統
- `managers/DungeonManager.js` - 副本邏輯

**舊檔案處理：**
- 所有 scenes/*System.js 已改為 stub（重新導出）保持向後相容

**已更新的 Scene 檔案：**
- TowerScene.js, AdventureScene.js, ForgeScene.js, CasinoScene.js, QuestScene.js, LobbyScene.js

---

### 2024-XX-XX - 1.1 建立 Enums.js

**變更內容：**
- 建立 `src/js/models/Enums.js`
- 從 `DataModel.js` 抽取 enum 常數
- 更新所有相關 import

**影響檔案：**
- `models/Enums.js` (新建)
- `models/DataModel.js` (修改)
- 其他引用檔案...

---

## 待完成工作

### 1.2 & 1.3 - CharacterManager 純化

**目標：** 將 `DataModel.js` 中的 `CharacterManager` 類別邏輯方法移至獨立的 Manager

**需移出的方法：**
- `getTotalAtk()`, `getTotalDef()` → 屬性計算
- `getCritChance()`, `getCritDamage()` → 暴擊計算
- `getLifesteal()`, `getDamageReduction()` → 特殊屬性
- `addBuff()`, `getBuffValue()`, `tickBuffs()` → Buff 系統
- `useSkill()`, `tickSkillCooldowns()` → 技能系統
- `equip()`, `unequip()` → 裝備管理
- `useItem()`, `checkLevelUp()`, `gainExp()` → 角色成長

**建議方案：**
1. 保留 CharacterManager 的屬性定義
2. 將邏輯方法移至 `managers/CharacterManager.js`（新建）
3. 或整合至現有的 `GameManager.js`

---

## 注意事項

1. 每次只執行一項重構
2. 完成後確認專案可正常執行
3. 提交前測試基本功能
