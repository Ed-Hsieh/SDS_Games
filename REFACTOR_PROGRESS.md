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
- [x] **1.2** 純化 `DataModel.js` class - 移除邏輯方法至 Manager ✅
- [x] **1.3** 建立 `managers/CharacterManager.js` - 從 DataModel 搬移 ✅

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

### 階段 5：依賴方向清理 ✅ (新增)

- [x] **5.1** 清理 Scenes 層直接引用 Database/Model 的違規 ✅
- [x] **5.2** 建立 Manager 重新匯出機制 ✅
- [x] **5.3** 刪除所有 stub 檔案 ✅
- [x] **5.4** 建立新的 Manager（RecipeManager, ShopManager）✅

---

## 執行記錄

### 2024-XX-XX - 階段 5 依賴方向清理完成

**刪除的 Stub 檔案：**
- ✅ scenes/CasinoSystem.js
- ✅ scenes/DungeonSystem.js
- ✅ scenes/EnhancementSystem.js
- ✅ scenes/QuestSystem.js
- ✅ scenes/TowerSystem.js
- ✅ scenes/EventSystem.js
- ✅ scenes/AffixSystem.js

**新增 Manager 檔案：**
- `managers/RecipeManager.js` - 配方查詢
- `managers/ShopManager.js` - 商店資料

**Manager 重新匯出機制：**
Scenes 不再直接引用 data/ 或 models/，改由 Manager 層提供重新匯出：

| Manager | 重新匯出的型別/資料 |
|---------|---------------------|
| GameManager | ItemType, ItemRarity, Weapon, Armor, Accessory, Consumable, Item, Equipment, CharacterManager |
| QuestManager | ObjectiveType, QuestStatus, QuestType, QuestRewardItems |
| EquipmentManager | SpecialEffectType, SetDatabase |
| DungeonManager | DungeonDatabase, DungeonType, DungeonState, DungeonEntranceConfig |
| TowerManager | getBossEquipment |
| MaterialManager | MaterialDatabase |
| RecipeManager | RecipeDatabase, getRecipe, getRecipesByType, canCraft, getMissingMaterials |
| ShopManager | ShopData, SecretShopItems |

**更新的 Scene 檔案：**
- AdventureScene.js - 改從 GameManager, EquipmentManager 匯入
- CasinoScene.js - 改從 QuestManager 匯入 ObjectiveType
- DungeonScene.js - 改從 DungeonManager 匯入
- ForgeScene.js - 改從 GameManager, QuestManager, RecipeManager, MaterialManager 匯入
- LobbyScene.js - 改從 EquipmentManager 匯入 SetDatabase
- QuestScene.js - 改從 QuestManager 匯入所有 Quest 相關型別
- ShopScene.js - 改從 ShopManager 匯入
- TowerScene.js - 改從 TowerManager 匯入 getBossEquipment

**更新的 Utils 檔案：**
- WorldMap.js - 改從 GameManager, DungeonManager 匯入

---

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

### 所有重構階段已完成 ✅

架構已符合：
```
index → View → Scenes → Manager → Database → Model
```

**已完成項目：**
- ✅ 階段 1：純資料拆分（Enums.js、CharacterManager 純化）
- ✅ 階段 2：資料庫層整理
- ✅ 階段 3：System → Manager 遷移
- ✅ 階段 4：Utils 整理
- ✅ 階段 5：依賴方向清理

---

## 注意事項

1. 每次只執行一項重構
2. 完成後確認專案可正常執行
3. 提交前測試基本功能
