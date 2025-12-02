// ===== 市集控制器 - 戰術地圖 + 拖放秘密機制 =====

// 全局狀態
let currentShop = 'blacksmith';
let secretUnlocked = false;
let currentModalItem = null; // 當前模態視窗顯示的物品
let currentModalAction = null; // 'buy' or 'sell'

// 商店資料庫
const shopData = {
    blacksmith: {
        name: '鍛造師',
        npcPortrait: 'https://via.placeholder.com/400x500/2c3e50/ecf0f1?text=Blacksmith',
        dialogue: '需要武器或防具嗎？我的作品從不讓人失望。',
        items: [
            { id: 'iron_sword', name: '鐵劍', icon: '⚔️', type: 'weapon', rarity: 'common', attack: 10, price: 100, desc: '一把標準的鐵劍，守衛們的最愛。' },
            { id: 'steel_armor', name: '鋼鎧', icon: '🛡️', type: 'armor', rarity: 'uncommon', defense: 15, price: 200, desc: '堅固的鋼製鎧甲，能抵擋大部分攻擊。' },
            { id: 'mithril_blade', name: '秘銀劍', icon: '⚔️', type: 'weapon', rarity: 'rare', attack: 25, price: 500, desc: '輕盈而鋒利的秘銀劍，閃耀著銀光。' }
        ]
    },
    alchemist: {
        name: '煉金術士',
        npcPortrait: 'https://via.placeholder.com/400x500/16a085/ecf0f1?text=Alchemist',
        dialogue: '藥水、毒藥、還是變身藥劑？你想要什麼？',
        items: [
            { id: 'health_potion', name: '生命藥水', icon: '🧪', type: 'potion', rarity: 'common', hp: 50, price: 50, desc: '恢復少量生命值。' },
            { id: 'mana_potion', name: '魔力藥水', icon: '💙', type: 'potion', rarity: 'uncommon', mp: 30, price: 80, desc: '恢復少量魔力值。' },
            { id: 'elixir', name: '萬能藥', icon: '✨', type: 'potion', rarity: 'rare', hp: 100, mp: 50, price: 300, desc: '完全恢復狀態的神奇藥水。' }
        ]
    },
    merchant: {
        name: '旅行商人',
        npcPortrait: 'https://via.placeholder.com/400x500/d35400/ecf0f1?text=Merchant',
        dialogue: '稀有物品、寶石、還有一些...特別的東西。',
        items: [
            { id: 'ruby', name: '紅寶石', icon: '💎', type: 'gem', rarity: 'rare', price: 250, desc: '閃耀著紅色光芒的寶石。' },
            { id: 'ancient_coin', name: '古代錢幣', icon: '🪙', type: 'key', rarity: 'legendary', price: 1000, isSecretKey: true, desc: '一枚古老的錢幣，似乎隱藏著秘密。' },
            { id: 'map_fragment', name: '地圖碎片', icon: '🗺️', type: 'quest', rarity: 'uncommon', price: 150, desc: '一張破舊的地圖碎片。' }
        ]
    },
    scholar: {
        name: '學者',
        npcPortrait: 'https://via.placeholder.com/400x500/8e44ad/ecf0f1?text=Scholar',
        dialogue: '知識即力量。這些捲軸記載著失落的技藝。',
        items: [
            { id: 'fire_scroll', name: '火球術捲軸', icon: '🔥', type: 'scroll', rarity: 'uncommon', price: 120, desc: '記載著火球術的魔法捲軸。' },
            { id: 'ice_scroll', name: '冰霜術捲軸', icon: '❄️', type: 'scroll', rarity: 'uncommon', price: 120, desc: '記載著冰霜術的魔法捲軸。' },
            { id: 'ancient_tome', name: '古代典籍', icon: '📕', type: 'book', rarity: 'epic', price: 800, desc: '一本記載著古代歷史的厚重書籍。' }
        ]
    }
};

// 密寶商品 (僅在解鎖後顯示)
const secretShopItems = [
    { id: 'dragon_blade', name: '龍之劍', icon: '🐉', type: 'weapon', rarity: 'legendary', attack: 50, price: 5000, desc: '傳說中屠龍勇士使用的劍。' },
    { id: 'phoenix_armor', name: '鳳凰鎧', icon: '🔥', type: 'armor', rarity: 'legendary', defense: 40, price: 4500, desc: '浴火重生的鳳凰羽毛編織而成的鎧甲。' },
    { id: 'time_amulet', name: '時間護符', icon: '⏰', type: 'accessory', rarity: 'legendary', critChance: 0.3, price: 6000, desc: '可以操控時間的神秘護符。' }
];

// 玩家背包資料 (模擬)
let playerInventory = [
    { id: 'old_sword', name: '舊劍', icon: '🗡️', type: 'weapon', rarity: 'common', attack: 5, sellPrice: 30, desc: '一把生鏽的舊劍。' },
    { id: 'leather_armor', name: '皮甲', icon: '🛡️', type: 'armor', rarity: 'common', defense: 8, sellPrice: 50, desc: '普通的皮製護甲。' },
    { id: 'ancient_coin_owned', name: '古代錢幣', icon: '🪙', type: 'key', rarity: 'legendary', sellPrice: 500, isSecretKey: true, desc: '一枚古老的錢幣，似乎隱藏著秘密。' }
];

let playerGold = 1250;

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    initMarketplace();
    bindGridNavigation();
    initDragAndDrop();
    initModal();
});

/**
 * 初始化市集
 */
function initMarketplace() {
    // 設定初始商店
    movePlayerToken('blacksmith');
    loadShop('blacksmith');
    loadPlayerInventory();
}

/**
 * 綁定地圖格子點擊
 */
function bindGridNavigation() {
    const tiles = document.querySelectorAll('.grid-tile');
    
    tiles.forEach(tile => {
        tile.addEventListener('click', () => {
            if (tile.classList.contains('locked')) {
                console.log('此商店尚未解鎖');
                return;
            }
            
            const shopId = tile.dataset.shop;
            
            if (shopId === 'exit') {
                // 返回大廳
                window.location.href = 'hall.html';
                return;
            }
            
            movePlayerToken(shopId);
            loadShop(shopId);
        });
    });
}

/**
 * 移動玩家標記到目標格子
 */
function movePlayerToken(shopId) {
    const tiles = document.querySelectorAll('.grid-tile');
    const playerToken = document.getElementById('player-token');
    
    // 移除所有active狀態
    tiles.forEach(tile => tile.classList.remove('active'));
    
    // 找到目標格子
    const targetTile = document.querySelector(`[data-shop="${shopId}"]`);
    if (!targetTile) return;
    
    // 標記active
    targetTile.classList.add('active');
    
    // 計算目標格子的索引
    const tileIndex = Array.from(tiles).indexOf(targetTile);
    
    // 移動玩家標記 (每個格子 12.5% 寬度 + 間隙)
    const leftPosition = tileIndex * 12.5;
    playerToken.style.left = `calc(${leftPosition}% + ${tileIndex * 4}px + 8px)`;
    
    currentShop = shopId;
}

/**
 * 載入商店內容
 */
function loadShop(shopId) {
    const shop = shopData[shopId];
    if (!shop) return;
    
    // 更新NPC肖像
    const portrait = document.getElementById('npc-portrait');
    portrait.src = shop.npcPortrait;
    portrait.alt = shop.name;
    
    // 更新對話
    const dialogueBox = document.getElementById('dialogue-box');
    dialogueBox.innerHTML = `<p>${shop.dialogue}</p>`;
    
    // 更新商品列表
    updateShopInventory(shop.items);
}

/**
 * 更新商店物品顯示
 */
function updateShopInventory(items) {
    const container = document.getElementById('shop-inventory');
    // 清空內容但保留提示
    const hint = container.querySelector('.empty-hint');
    container.innerHTML = '';
    if (hint) container.appendChild(hint);
    
    items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = `shop-item ${item.rarity}`;
        
        const stats = getItemStats(item);
        
        itemDiv.innerHTML = `
            <div class="shop-item-icon">${item.icon}</div>
            <div class="shop-item-name">${item.name}</div>
            ${stats ? `<div class="shop-item-stats">${stats}</div>` : ''}
            <div class="shop-item-price">💰 ${item.price}</div>
        `;
        
        // 改為開啟模態視窗
        itemDiv.addEventListener('click', () => openItemModal(item, 'buy'));
        
        container.appendChild(itemDiv);
    });
}

/**
 * 獲取物品屬性字串
 */
function getItemStats(item) {
    const stats = [];
    if (item.attack) stats.push(`⚔️ ${item.attack}`);
    if (item.defense) stats.push(`🛡️ ${item.defense}`);
    if (item.hp) stats.push(`❤️ +${item.hp}`);
    if (item.mp) stats.push(`💙 +${item.mp}`);
    if (item.critChance) stats.push(`💥 ${(item.critChance * 100).toFixed(0)}%`);
    return stats.join(' ');
}

/**
 * 載入玩家背包
 */
function loadPlayerInventory() {
    const container = document.getElementById('player-inventory');
    updateGoldDisplay();
    
    container.innerHTML = '';
    
    playerInventory.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = `player-item ${item.rarity}`;
        itemDiv.draggable = true; // 僅用於秘密觸發
        itemDiv.dataset.itemId = item.id;
        
        const stats = getItemStats(item);
        
        itemDiv.innerHTML = `
            <div class="player-item-icon">${item.icon}</div>
            <div class="player-item-info">
                <div class="player-item-name">${item.name}</div>
                ${stats ? `<div class="player-item-stats">${stats}</div>` : ''}
            </div>
            <div class="player-item-price">💰 ${item.sellPrice}</div>
        `;
        
        // 點擊開啟模態視窗 (出售)
        itemDiv.addEventListener('click', () => openItemModal(item, 'sell'));
        
        // 綁定拖曳事件 (僅用於秘密)
        itemDiv.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.id);
            e.dataTransfer.effectAllowed = 'move';
            
            // 儲存物品資料供拖放檢查
            itemDiv.dataset.isSecretKey = item.isSecretKey || false;
        });
        
        container.appendChild(itemDiv);
    });
}

function updateGoldDisplay() {
    const goldDisplay = document.getElementById('player-gold');
    goldDisplay.textContent = `💰 ${playerGold}`;
    
    // 如果模態視窗開啟中，更新按鈕狀態
    if (document.getElementById('item-modal').classList.contains('active') && currentModalAction === 'buy') {
        updateModalButtonState();
    }
}

// ===== 模態視窗邏輯 =====

function initModal() {
    const modal = document.getElementById('item-modal');
    const closeBtn = document.getElementById('modal-close');
    const actionBtn = document.getElementById('modal-action-btn');
    
    // 關閉按鈕
    closeBtn.addEventListener('click', closeModal);
    
    // 點擊背景關閉
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // 動作按鈕
    actionBtn.addEventListener('click', executeTransaction);
}

function openItemModal(item, action) {
    currentModalItem = item;
    currentModalAction = action;
    
    const modal = document.getElementById('item-modal');
    const card = modal.querySelector('.modal-card');
    
    // 填充資料
    document.getElementById('modal-item-icon').textContent = item.icon;
    document.getElementById('modal-item-name').textContent = item.name;
    document.getElementById('modal-item-rarity').textContent = item.rarity;
    document.getElementById('modal-item-desc').textContent = item.desc || '沒有描述。';
    
    // 設定稀有度顏色
    card.dataset.rarity = item.rarity;
    
    // 填充屬性
    const statsContainer = document.getElementById('modal-item-stats');
    statsContainer.innerHTML = '';
    
    const stats = [
        { label: '攻擊', value: item.attack, icon: '⚔️' },
        { label: '防禦', value: item.defense, icon: '🛡️' },
        { label: '生命', value: item.hp, icon: '❤️' },
        { label: '魔力', value: item.mp, icon: '💙' },
        { label: '爆擊', value: item.critChance ? (item.critChance * 100) + '%' : null, icon: '💥' }
    ];
    
    stats.forEach(stat => {
        if (stat.value) {
            const div = document.createElement('div');
            div.className = 'stat-row';
            div.innerHTML = `${stat.icon} ${stat.label} <span style="float:right; font-weight:bold;">+${stat.value}</span>`;
            statsContainer.appendChild(div);
        }
    });
    
    // 設定按鈕
    const btn = document.getElementById('modal-action-btn');
    const btnLabel = btn.querySelector('.btn-label');
    const btnPrice = btn.querySelector('.btn-price');
    
    btn.className = 'action-btn'; // Reset classes
    
    if (action === 'buy') {
        btn.classList.add('buy-btn');
        btnLabel.textContent = '購買';
        btnPrice.textContent = `💰 ${item.price}`;
        updateModalButtonState();
    } else {
        btn.classList.add('sell-btn');
        btnLabel.textContent = '出售';
        btnPrice.textContent = `💰 ${item.sellPrice}`;
        btn.disabled = false;
    }
    
    // 顯示模態視窗
    modal.style.display = 'flex';
    // 強制重繪以觸發 transition
    requestAnimationFrame(() => {
        modal.classList.add('active');
    });
}

function closeModal() {
    const modal = document.getElementById('item-modal');
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
        currentModalItem = null;
        currentModalAction = null;
    }, 300);
}

function updateModalButtonState() {
    if (currentModalAction !== 'buy' || !currentModalItem) return;
    
    const btn = document.getElementById('modal-action-btn');
    if (playerGold >= currentModalItem.price) {
        btn.disabled = false;
    } else {
        btn.disabled = true;
    }
}

function executeTransaction() {
    if (!currentModalItem || !currentModalAction) return;
    
    const dialogueBox = document.getElementById('dialogue-box');
    
    if (currentModalAction === 'buy') {
        if (playerGold >= currentModalItem.price) {
            // 扣款
            playerGold -= currentModalItem.price;
            
            // 加入背包 (模擬：產生新ID)
            const newItem = { 
                ...currentModalItem, 
                id: currentModalItem.id + '_' + Date.now(), 
                sellPrice: Math.floor(currentModalItem.price / 2) 
            };
            playerInventory.push(newItem);
            
            // 更新UI
            updateGoldDisplay();
            loadPlayerInventory();
            
            dialogueBox.innerHTML = `<p>你購買了 ${currentModalItem.icon} ${currentModalItem.name}！</p>`;
            closeModal();
        }
    } else if (currentModalAction === 'sell') {
        // 找到物品索引
        const index = playerInventory.findIndex(i => i.id === currentModalItem.id);
        if (index > -1) {
            // 加錢
            playerGold += currentModalItem.sellPrice;
            
            // 移除物品
            playerInventory.splice(index, 1);
            
            // 更新UI
            updateGoldDisplay();
            loadPlayerInventory();
            
            dialogueBox.innerHTML = `<p>你出售了 ${currentModalItem.icon} ${currentModalItem.name}，獲得 💰${currentModalItem.sellPrice}。</p>`;
            closeModal();
        }
    }
}

// ===== 拖放機制 (僅限秘密) =====

function initDragAndDrop() {
    // 1. 秘密觸發區 (NPC Portrait)
    const npcDropZone = document.getElementById('npc-drop-zone');
    
    npcDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        // 視覺回饋
        npcDropZone.classList.add('drag-over-valid');
    });
    
    npcDropZone.addEventListener('dragleave', () => {
        npcDropZone.classList.remove('drag-over-valid', 'drag-over-invalid');
    });
    
    npcDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        const itemId = e.dataTransfer.getData('text/plain');
        handleSecretDrop(itemId, npcDropZone);
    });
    
    // 移除舊的出售拖放區邏輯
}

function handleSecretDrop(itemId, dropZone) {
    const item = playerInventory.find(i => i.id === itemId);
    const dialogueBox = document.getElementById('dialogue-box');
    
    if (item) {
        if (item.isSecretKey) {
            unlockSecretShop();
        } else {
            // 普通物品 - NPC 拒絕
            dialogueBox.innerHTML = `<p>NPC: "我不需要這個 ${item.name}。"</p>`;
        }
    }
    
    dropZone.classList.remove('drag-over-valid', 'drag-over-invalid');
}

/**
 * 解鎖密寶商店
 */
function unlockSecretShop() {
    if (secretUnlocked) return;
    
    secretUnlocked = true;
    
    // 更新對話
    const dialogueBox = document.getElementById('dialogue-box');
    dialogueBox.innerHTML = '<p style="color: #ffd700;">你找到了正確的鑰匙...歡迎來到真正的寶庫。</p>';
    
    // 將商店內容替換為密寶
    updateShopInventory(secretShopItems);
    
    // 視覺回饋
    const shopContainer = document.getElementById('shop-inventory');
    shopContainer.style.background = 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(0, 0, 0, 0.5))';
    
    console.log('密寶商店已解鎖！');
}
