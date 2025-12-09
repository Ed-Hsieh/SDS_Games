// ===== 大廳控制器 =====

/**
 * 全域遊戲狀態
 */
let gameState = null;

/**
 * 當前選中的物品
 */
let selectedItem = null;
let selectedItemSource = null; // 'warehouse', 'inventory', 'equipment'

/**
 * 當前倉庫篩選類型
 */
let currentWarehouseFilter = 'all'; // 'all', 'weapon', 'armor', 'accessory', 'potion', 'material'

/**
 * 當前倉庫排序方式
 */
let currentWarehouseSort = 'time-desc'; // 'time-desc', 'time-asc', 'rarity-desc', 'rarity-asc'

// ===== UI 更新函數 =====

/**
 * 更新角色資訊顯示
 */
function updateCharacterInfo() {
    const char = gameState.character;
    
    // 更新等級
    document.getElementById('character-level').textContent = char.level;
    
    // 更新金錢
    document.getElementById('character-gold').textContent = char.gold;
    
    // 更新 HP 進度條
    const hpPercent = (char.hp / char.maxHp) * 100;
    document.getElementById('hp-bar').style.width = `${hpPercent}%`;
    document.getElementById('hp-text').textContent = `${char.hp} / ${char.maxHp}`;
    
    // 更新 EXP 進度條
    const expPercent = (char.exp / char.maxExp) * 100;
    document.getElementById('exp-bar').style.width = `${expPercent}%`;
    document.getElementById('exp-text').textContent = `${char.exp} / ${char.maxExp}`;
    
    // 更新屬性
    document.getElementById('character-atk').textContent = char.getTotalAtk();
    document.getElementById('character-def').textContent = char.getTotalDef();
}

/**
 * 更新角色裝備顯示
 */
function updateCharacterEquipment() {
    const char = gameState.character;
    
    // 更新武器槽
    updateEquipmentSlot('weapon', char.equipment.weapon);
    
    // 更新防具槽
    updateEquipmentSlot('armor', char.equipment.armor);
    
    // 更新飾品槽
    updateEquipmentSlot('accessory', char.equipment.accessory);
}

/**
 * 更新單一裝備槽
 */
function updateEquipmentSlot(slotType, item) {
    const slotElement = document.getElementById(`slot-${slotType}`);
    const iconElement = slotElement.querySelector('.equipment-slot-icon');
    const nameElement = slotElement.querySelector('.equipment-slot-name');
    
    if (item) {
        slotElement.classList.remove('empty');
        slotElement.classList.add('equipped');
        iconElement.textContent = item.icon;
        nameElement.textContent = item.name;
        slotElement.onclick = () => showEquipmentDetail(slotType);
    } else {
        slotElement.classList.add('empty');
        slotElement.classList.remove('equipped');
        const slotLabels = {
            weapon: '武器',
            armor: '防具',
            accessory: '飾品'
        };
        const slotIcons = {
            weapon: '⚔️',
            armor: '🛡️',
            accessory: '💍'
        };
        iconElement.textContent = slotIcons[slotType];
        nameElement.textContent = '未裝備';
        slotElement.onclick = null;
    }
}

/**
 * 更新倉庫顯示
 */
function updateWarehouse() {
    const container = document.getElementById('warehouse-list');
    container.innerHTML = '';
    
    // 獲取所有物品
    let items = gameState.warehouse.items;
    
    // 根據篩選條件過濾
    if (currentWarehouseFilter !== 'all') {
        items = items.filter(item => item.type === currentWarehouseFilter);
    }
    
    // 排序物品
    items = sortWarehouseItems(items);
    
    // 渲染物品卡片
    items.forEach(item => {
        const card = createItemCard(item, 'warehouse');
        container.appendChild(card);
    });
    
    // 如果沒有物品，顯示空狀態
    if (items.length === 0) {
        container.innerHTML = '<div class="empty-state">暫無物品</div>';
    }
}

/**
 * 排序倉庫物品
 */
function sortWarehouseItems(items) {
    const rarityOrder = {
        'common': 1,
        'uncommon': 2,
        'rare': 3,
        'epic': 4,
        'legendary': 5
    };
    
    switch (currentWarehouseSort) {
        case 'time-desc':
            // 最新獲得 (時間戳記從大到小)
            return [...items].sort((a, b) => (b.acquiredTime || 0) - (a.acquiredTime || 0));
            
        case 'time-asc':
            // 最舊獲得 (時間戳記從小到大)
            return [...items].sort((a, b) => (a.acquiredTime || 0) - (b.acquiredTime || 0));
            
        case 'rarity-desc':
            // 稀有度從高到低
            return [...items].sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity]);
            
        case 'rarity-asc':
            // 稀有度從低到高
            return [...items].sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
            
        default:
            return items;
    }
}

/**
 * 創建物品卡片（橫向長條）
 */
function createItemCard(item, source) {
    const card = document.createElement('div');
    card.className = `item-card rarity-${item.rarity}`;
    card.onclick = () => showItemDetail(item, source);
    
    // 左側區域：圖標 + 名稱 + 稀有度
    const leftSection = document.createElement('div');
    leftSection.className = 'item-card-left';
    
    const icon = document.createElement('div');
    icon.className = 'item-card-icon';
    icon.textContent = item.icon;
    leftSection.appendChild(icon);
    
    const info = document.createElement('div');
    info.className = 'item-card-info';
    
    const name = document.createElement('div');
    name.className = 'item-card-name';
    name.textContent = item.name;
    info.appendChild(name);
    
    const typeRow = document.createElement('div');
    typeRow.className = 'item-card-type-row';
    
    const typeIcon = document.createElement('span');
    typeIcon.className = 'item-card-type-icon';
    typeIcon.textContent = getItemTypeIcon(item.type);
    typeRow.appendChild(typeIcon);
    
    const typeName = document.createElement('span');
    typeName.className = 'item-card-type-name';
    typeName.textContent = getItemTypeText(item.type);
    typeRow.appendChild(typeName);
    
    const rarityBadge = document.createElement('span');
    rarityBadge.className = `item-card-rarity rarity-${item.rarity}`;
    rarityBadge.textContent = getRarityText(item.rarity);
    typeRow.appendChild(rarityBadge);
    
    info.appendChild(typeRow);
    leftSection.appendChild(info);
    card.appendChild(leftSection);
    
    // 右側區域：屬性
    const rightSection = document.createElement('div');
    rightSection.className = 'item-card-right';
    
    if (item.isEquipment()) {
        if (item.atk > 0) {
            const atkStat = document.createElement('div');
            atkStat.className = 'item-card-stat';
            atkStat.innerHTML = `<span class="stat-label">⚔️ 攻擊力</span><span class="stat-value">+${item.atk}</span>`;
            rightSection.appendChild(atkStat);
        }
        if (item.def > 0) {
            const defStat = document.createElement('div');
            defStat.className = 'item-card-stat';
            defStat.innerHTML = `<span class="stat-label">🛡️ 防禦力</span><span class="stat-value">+${item.def}</span>`;
            rightSection.appendChild(defStat);
        }
    } else if (item.effect) {
        if (item.effect.hp) {
            const hpStat = document.createElement('div');
            hpStat.className = 'item-card-stat';
            hpStat.innerHTML = `<span class="stat-label">❤️ 恢復</span><span class="stat-value">+${item.effect.hp}</span>`;
            rightSection.appendChild(hpStat);
        }
        if (item.effect.exp) {
            const expStat = document.createElement('div');
            expStat.className = 'item-card-stat';
            expStat.innerHTML = `<span class="stat-label">✨ 經驗</span><span class="stat-value">+${item.effect.exp}</span>`;
            rightSection.appendChild(expStat);
        }
    }
    
    card.appendChild(rightSection);
    
    return card;
}

/**
 * 更新背包顯示
 */
function updateInventory() {
    const container = document.getElementById('inventory-list');
    container.innerHTML = '';
    
    // 更新背包容量顯示
    document.getElementById('inventory-used').textContent = gameState.inventory.getUsedSlots();
    document.getElementById('inventory-max').textContent = gameState.inventory.maxSlots;
    
    // 渲染物品卡片
    gameState.inventory.items.forEach(item => {
        const card = createItemCard(item, 'inventory');
        container.appendChild(card);
    });
    
    // 如果沒有物品，顯示空狀態
    if (gameState.inventory.items.length === 0) {
        container.innerHTML = '<div class="empty-state">背包是空的</div>';
    }
}

/**
 * 創建物品槽
 */
function createItemSlot(item, source) {
    const slot = document.createElement('div');
    slot.className = 'item-slot';
    slot.onclick = () => showItemDetail(item, source);
    
    // 稀有度標記
    const rarityDot = document.createElement('div');
    rarityDot.className = `item-rarity ${item.rarity}`;
    slot.appendChild(rarityDot);
    
    // 物品圖標
    const icon = document.createElement('div');
    icon.className = 'item-icon';
    icon.textContent = item.icon;
    slot.appendChild(icon);
    
    // 物品名稱
    const name = document.createElement('div');
    name.className = 'item-name';
    name.textContent = item.name;
    slot.appendChild(name);
    
    return slot;
}

// ===== 倉庫篩選切換 =====

/**
 * 初始化倉庫篩選
 */
function initWarehouseTabs() {
    const filters = document.querySelectorAll('.warehouse-filter');
    filters.forEach(filter => {
        filter.addEventListener('click', () => {
            const filterType = filter.dataset.filter;
            switchWarehouseFilter(filterType);
        });
    });
    
    // 初始化排序選單
    const sortSelect = document.getElementById('warehouse-sort');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentWarehouseSort = e.target.value;
            updateWarehouse();
        });
    }
}

/**
 * 切換倉庫篩選
 */
function switchWarehouseFilter(filterType) {
    currentWarehouseFilter = filterType;
    
    // 更新篩選按鈕狀態
    document.querySelectorAll('.warehouse-filter').forEach(filter => {
        if (filter.dataset.filter === filterType) {
            filter.classList.add('active');
        } else {
            filter.classList.remove('active');
        }
    });
    
    // 更新倉庫顯示
    updateWarehouse();
}

/**
 * 獲取物品類型圖標
 */
function getItemTypeIcon(type) {
    const iconMap = {
        [ItemType.WEAPON]: '⚔️',
        [ItemType.ARMOR]: '🛡️',
        [ItemType.ACCESSORY]: '💍',
        [ItemType.POTION]: '🧪',
        [ItemType.MATERIAL]: '⛏️'
    };
    return iconMap[type] || '📦';
}

// ===== 物品詳情彈窗 =====

/**
 * 顯示物品詳情（支援傳入 stack 或直接傳入 Item 實例）
 */
function showItemDetail(entry, source) {
    // entry 可能是 { item, quantity } 的 stack，也可能是直接的 Item
    const item = (entry && entry.item) ? entry.item : entry;

    const btns = getItemActionButtons(item, source);

    const typeTextMap = {
        [ItemType.WEAPON]: '武器',
        [ItemType.ARMOR]: '防具',
        [ItemType.ACCESSORY]: '飾品',
        [ItemType.POTION]: '消耗品',
        [ItemType.MATERIAL]: '材料'
    };

    const typeText = typeTextMap[item.type] || (item.type || '');
    const description = item.description || item.desc || item.name || '沒有描述';

    if (window.ItemDetailModal) {
        window.ItemDetailModal.open(item, {
            typeText: typeText,
            description: description,
            actions: btns
        });
    } else {
        console.warn('ItemDetailModal not available to open item detail.');
    }
}

/**
 * 關閉物品詳情彈窗
 */
function closeItemModal() {
    if (window.ItemDetailModal) window.ItemDetailModal.close();
    selectedItem = null;
    selectedItemSource = null;
}

/**
 * 獲取物品操作按鈕
 */
function getItemActionButtons(item, source) {
    const buttons = [];
    const isInHall = gameState.isInHall();
    const isInAdventure = gameState.isInAdventure();
    
    // 倉庫中的物品
    if (source === 'warehouse') {
        if (item.isEquipment()) {
            // 裝備：裝備 / 放入背包 / 販售
            buttons.push(createButton('裝備', 'btn-primary', () => equipItemFromWarehouse(item)));
            buttons.push(createButton('放入背包', 'btn-success', () => moveToInventoryFromWarehouse(item)));
            buttons.push(createButton('販售', 'btn-warning', () => sellItem(item, source)));
        } else {
            // 道具：使用 / 放入背包 / 販售
            buttons.push(createButton('使用', 'btn-info', () => useItem(item, source)));
            buttons.push(createButton('放入背包', 'btn-success', () => moveToInventoryFromWarehouse(item)));
            buttons.push(createButton('販售', 'btn-warning', () => sellItem(item, source)));
        }
    }
    
    // 背包中的物品
    else if (source === 'inventory') {
        if (isInHall) {
            if (item.isEquipment()) {
                // 大廳-背包-裝備：裝備 / 放入倉庫 / 販售 / 丟棄
                buttons.push(createButton('裝備', 'btn-primary', () => equipItemFromInventory(item)));
                buttons.push(createButton('放入倉庫', 'btn-success', () => moveToWarehouseFromInventory(item)));
                buttons.push(createButton('販售', 'btn-warning', () => sellItem(item, source)));
                buttons.push(createButton('丟棄', 'btn-danger', () => discardItem(item, source)));
            } else {
                // 大廳-背包-道具：使用 / 放入倉庫 / 販售 / 丟棄
                buttons.push(createButton('使用', 'btn-info', () => useItem(item, source)));
                buttons.push(createButton('放入倉庫', 'btn-success', () => moveToWarehouseFromInventory(item)));
                buttons.push(createButton('販售', 'btn-warning', () => sellItem(item, source)));
                buttons.push(createButton('丟棄', 'btn-danger', () => discardItem(item, source)));
            }
        } else if (isInAdventure) {
            if (item.isEquipment()) {
                // 冒險-背包-裝備：裝備 / 放入倉庫(禁用) / 丟棄
                buttons.push(createButton('裝備', 'btn-primary', () => equipItemFromInventory(item)));
                buttons.push(createButton('放入倉庫', 'btn-secondary', null, true)); // 禁用
                buttons.push(createButton('丟棄', 'btn-danger', () => discardItem(item, source)));
            } else {
                // 冒險-背包-道具：使用 / 放入倉庫(禁用) / 丟棄
                buttons.push(createButton('使用', 'btn-info', () => useItem(item, source)));
                buttons.push(createButton('放入倉庫', 'btn-secondary', null, true)); // 禁用
                buttons.push(createButton('丟棄', 'btn-danger', () => discardItem(item, source)));
            }
        }
    }
    
    return buttons;
}

/**
 * 創建按鈕
 */
function createButton(text, className, onClick, disabled = false) {
    const btn = document.createElement('button');
    btn.className = `btn ${className}`;
    btn.textContent = text;
    btn.disabled = disabled;
    if (onClick) {
        btn.onclick = onClick;
    }
    return btn;
}

// ===== 物品操作函數 =====

/**
 * 從倉庫裝備物品
 */
function equipItemFromWarehouse(item) {
    if (!item.isEquipment()) return;
    
    const slotType = item.type;
    const oldItem = gameState.character.equipment[slotType];
    
    // 卸下舊裝備（如果有）
    if (oldItem) {
        gameState.warehouse.addItem(oldItem);
    }
    
    // 從倉庫移除並裝備
    gameState.warehouse.removeItem(item.id);
    gameState.character.equip(item);
    
    gameState.save(); // 保存狀態
    updateAll();
    closeItemModal();
    showNotification(`已裝備 ${item.name}`);
}

/**
 * 從背包裝備物品
 */
function equipItemFromInventory(item) {
    if (!item.isEquipment()) return;
    
    const slotType = item.type;
    const oldItem = gameState.character.equipment[slotType];
    
    // 卸下舊裝備並放回背包（如果有空間）
    if (oldItem) {
        if (!gameState.inventory.addItem(oldItem)) {
            // 背包滿了，放入倉庫
            gameState.warehouse.addItem(oldItem);
        }
    }
    
    // 從背包移除並裝備
    gameState.inventory.removeItem(item.id);
    gameState.character.equip(item);
    
    gameState.save(); // 保存狀態
    updateAll();
    closeItemModal();
    showNotification(`已裝備 ${item.name}`);
}

/**
 * 從倉庫移動到背包
 */
function moveToInventoryFromWarehouse(item) {
    if (gameState.inventory.isFull()) {
        showNotification('背包已滿！', 'error');
        return;
    }
    
    gameState.warehouse.removeItem(item.id);
    gameState.inventory.addItem(item);
    
    gameState.save(); // 保存狀態
    updateAll();
    closeItemModal();
    showNotification(`${item.name} 已放入背包`);
}

/**
 * 從背包移動到倉庫
 */
function moveToWarehouseFromInventory(item) {
    gameState.inventory.removeItem(item.id);
    gameState.warehouse.addItem(item);
    
    gameState.save(); // 保存狀態
    updateAll();
    closeItemModal();
    showNotification(`${item.name} 已放入倉庫`);
}

/**
 * 使用道具
 */
function useItem(item, source) {
    if (item.isEquipment()) return;
    
    // 使用道具效果
    gameState.character.useItem(item);
    
    // 從來源移除
    if (source === 'warehouse') {
        gameState.warehouse.removeItem(item.id);
    } else if (source === 'inventory') {
        gameState.inventory.removeItem(item.id);
    }
    
    gameState.save(); // 保存狀態
    updateAll();
    closeItemModal();
    showNotification(`已使用 ${item.name}`);
}

/**
 * 販售物品
 */
function sellItem(item, source) {
    // 從來源移除
    if (source === 'warehouse') {
        gameState.warehouse.removeItem(item.id);
    } else if (source === 'inventory') {
        gameState.inventory.removeItem(item.id);
    }
    
    // 獲得金幣
    gameState.character.addGold(item.price);
    
    gameState.save(); // 保存狀態
    updateAll();
    closeItemModal();
    console.log(`已販售 ${item.name}，獲得 ${item.price} 金幣`);
}

/**
 * 丟棄物品
 */
function discardItem(item, source) {
    // 從來源移除
    if (source === 'warehouse') {
        gameState.warehouse.removeItem(item.id);
    } else if (source === 'inventory') {
        gameState.inventory.removeItem(item.id);
    }
    
    gameState.save(); // 保存狀態
    updateAll();
    closeItemModal();
    console.log(`已丟棄 ${item.name}`);
}

/**
 * 顯示裝備詳情（已裝備的物品）
 */
function showEquipmentDetail(slotType) {
    const item = gameState.character.equipment[slotType];
    if (!item) return;
    
    selectedItem = item;
    selectedItemSource = 'equipment';
    // Build stats HTML
    let statsHtml = '';
    if (item.atk > 0) statsHtml += `<div class="item-detail-stat"><span>⚔️ 攻擊力</span><span class="value">+${item.atk}</span></div>`;
    if (item.def > 0) statsHtml += `<div class="item-detail-stat"><span>🛡️ 防禦力</span><span class="value">+${item.def}</span></div>`;
    statsHtml += `<div class="item-detail-stat"><span>✨ 稀有度</span><span class="value">${getRarityText(item.rarity)}</span></div>`;

    const unequipBtn = createButton('卸下', 'btn-warning', () => {
        unequipItem(slotType);
    });

    if (window.ItemDetailModal) {
        window.ItemDetailModal.open(item, {
            typeText: getItemTypeText(item.type),
            description: item.description || '',
            statsHtml: statsHtml,
            actions: [unequipBtn]
        });
    }
}

/**
 * 卸下裝備
 */
function unequipItem(slotType) {
    const item = gameState.character.unequip(slotType);
    if (!item) return;
    
    // 嘗試放入背包，如果滿了則放入倉庫
    if (!gameState.inventory.addItem(item)) {
        gameState.warehouse.addItem(item);
        showNotification(`背包已滿，${item.name} 已放入倉庫`);
    } else {
        showNotification(`已卸下 ${item.name}`);
    }
    
    updateAll();
    closeItemModal();
}

// ===== 輔助函數 =====

/**
 * 獲取物品類型文字
 */
function getItemTypeText(type) {
    const typeMap = {
        [ItemType.WEAPON]: '武器',
        [ItemType.ARMOR]: '防具',
        [ItemType.ACCESSORY]: '飾品',
        [ItemType.POTION]: '藥水',
        [ItemType.MATERIAL]: '材料'
    };
    return typeMap[type] || '未知';
}

/**
 * 獲取稀有度文字
 */
function getRarityText(rarity) {
    const rarityMap = {
        [ItemRarity.COMMON]: '普通',
        [ItemRarity.UNCOMMON]: '優良',
        [ItemRarity.RARE]: '稀有',
        [ItemRarity.EPIC]: '史詩',
        [ItemRarity.LEGENDARY]: '傳說'
    };
    return rarityMap[rarity] || '未知';
}

/**
 * 更新所有 UI
 */
function updateAll() {
    updateCharacterInfo();
    updateCharacterEquipment();
    updateWarehouse();
    updateInventory();
}

/**
 * 顯示通知（預留給未來實作）
 */
function showNotification(message, type = 'success') {
    // 未來將實作自訂通知系統
    console.log(`[${type}] ${message}`);
}

/**
 * 初始化大廳場景
 */
function initHallScene(state) {
    gameState = state;
    
    // 初始化倉庫標籤
    initWarehouseTabs();
    
    // 更新所有 UI
    updateAll();
}

// ===== 功能按鈕處理 =====

/**
 * 開啟商店
 */
function openShop() {
    showNotification('商店功能開發中...');
    window.location.href = 'marketplace.html';
    console.log('開啟商店');
}

/**
 * 開啟鑄造
 */
function openForge() {
    showNotification('鑄造功能開發中...');
    console.log('開啟鑄造');
}

/**
 * 開啟賭博
 */
function openGamble() {
    showNotification('賭博功能開發中...');
    console.log('開啟賭博');
}

/**
 * 開啟任務
 */
function openQuest() {
    showNotification('任務功能開發中...');
    console.log('開啟任務');
}

/**
 * 開始冒險
 */
function startAdventure() {
    gameState.setScene(GameScene.ADVENTURE);
    console.log('開始冒險');
    
    // 跳轉到冒險場景頁面
    window.location.href = 'adventure.html';
}
