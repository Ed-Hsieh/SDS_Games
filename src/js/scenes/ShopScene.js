/**
 * ShopScene.js
 * Logic for the Shop/Marketplace scene.
 * Handles buying, selling, and secret shop unlocking.
 */
import GameManager from '../managers/GameManager.js';
import { ShopData, SecretShopItems } from '../managers/ShopManager.js';
import { worldInteractionManager } from '../managers/WorldInteractionManager.js';
import { getSellPrice } from '../models/ItemSchema.js';
import { buildItemModalOptions, escapeHtml } from '../utils/ItemDisplay.js';
import { showGlobalToast } from '../utils/UIFeedback.js';

export default class ShopScene {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.currentShopId = 'blacksmith';
        this.currentShopItems = [];
        this.draggedItem = null;

        // Bind methods to preserve 'this'
        this.updateUI = this.updateUI.bind(this);
        this.handleGridClick = this.handleGridClick.bind(this);
        this.handleDropZoneDragOver = this.handleDropZoneDragOver.bind(this);
        this.handleDropZoneDragLeave = this.handleDropZoneDragLeave.bind(this);
        this.handleDropZoneDrop = this.handleDropZoneDrop.bind(this);
        this.eventsBound = false;
        this.subscribed = false;
        this.dragDropBound = false;
    }

    init() {
        // Cache DOM and bind
        this.cacheDOM();
        this.bindEvents();

        // Subscribe to game state updates
        try {
            if (!this.subscribed) {
                GameManager.subscribe(this.updateUI);
                this.subscribed = true;
            }
        } catch (e) {
            // safe fallback if GameManager is not a pub/sub here
        }

        // Initial render
        if (GameManager && GameManager.state) this.updateUI(GameManager.state, 'all');
        this.selectShop(this.currentShopId);
    }

    cleanup() {
        this.unbindEvents();
        if (this.subscribed) {
            GameManager.unsubscribe(this.updateUI);
            this.subscribed = false;
        }
        this.closeItemModal();
    }

    cacheDOM() {
        this.dom = {
            grid: this.container.querySelector('#market-grid'),
            playerToken: this.container.querySelector('#player-token'),
            npcPortrait: this.container.querySelector('#npc-portrait'),
            npcDialogue: this.container.querySelector('#dialogue-box'),
            shopInventory: this.container.querySelector('#shop-inventory'),
            playerInventory: this.container.querySelector('#player-inventory'),
            playerGold: this.container.querySelector('#player-gold'),
            dropZone: this.container.querySelector('#npc-drop-zone'),
            tradeStatus: this.container.querySelector('#trade-status'),
            tradeStatusIcon: this.container.querySelector('#trade-status-icon'),
            tradeStatusTitle: this.container.querySelector('#trade-status-title'),
            tradeStatusMessage: this.container.querySelector('#trade-status-message')
        };

        // Quick debug check
        const criticalElements = ['grid', 'shopInventory', 'playerInventory'];
        criticalElements.forEach(key => {
            if (!this.dom[key]) console.error(`Critical DOM element not found: ${key}`);
        });
    }

    bindEvents() {
        if (this.eventsBound) return;
        if (this.dom.grid) this.dom.grid.addEventListener('click', this.handleGridClick);
        if (this.dom.dropZone) this.setupDragAndDrop();
        this.eventsBound = true;
    }

    unbindEvents() {
        if (this.dom?.grid) this.dom.grid.removeEventListener('click', this.handleGridClick);
        if (this.dom?.dropZone && this.dragDropBound) {
            this.dom.dropZone.removeEventListener('dragover', this.handleDropZoneDragOver);
            this.dom.dropZone.removeEventListener('dragleave', this.handleDropZoneDragLeave);
            this.dom.dropZone.removeEventListener('drop', this.handleDropZoneDrop);
            this.dragDropBound = false;
        }
        this.eventsBound = false;
    }

    handleGridClick(e) {
        const tile = e.target.closest('.grid-tile');
        if (!tile) return;

        const shopId = tile.dataset.shop;
        if (shopId === 'exit') {
            this.app.loadScene('lobby');
        } else if (!tile.classList.contains('locked')) {
            this.movePlayerToken(tile);
            this.selectShop(shopId);
        }
    }

    setupDragAndDrop() {
        if (this.dragDropBound || !this.dom.dropZone) return;
        this.dom.dropZone.addEventListener('dragover', this.handleDropZoneDragOver);
        this.dom.dropZone.addEventListener('dragleave', this.handleDropZoneDragLeave);
        this.dom.dropZone.addEventListener('drop', this.handleDropZoneDrop);
        this.dragDropBound = true;
    }

    handleDropZoneDragOver(e) {
        e.preventDefault();
        this.dom.dropZone.classList.add('drag-over');
    }

    handleDropZoneDragLeave() {
        this.dom.dropZone.classList.remove('drag-over');
    }

    handleDropZoneDrop(e) {
        e.preventDefault();
        this.dom.dropZone.classList.remove('drag-over');

        if (this.draggedItem) {
            this.handleItemDrop(this.draggedItem);
            this.draggedItem = null;
        }
    }

    updateUI(state, type) {
        if (!this.dom || !state) return;
        if (type === 'gold' || type === 'all') {
            this.dom.playerGold.textContent = `💰 ${state.character.gold}`;
            if (this.currentShopItems.length > 0) {
                this.renderShopInventory(this.currentShopItems);
            }
        }
        if (type === 'inventory' || type === 'all') {
            this.renderPlayerInventory(state.inventory || []);
        }
        if ((type === 'flags' || type === 'all') && state.flags?.secretShopUnlocked) {
            this.unlockSecretVisuals();
        }
    }

    movePlayerToken(targetTile) {
        // Simple visual move - append token to the tile to center it, 
        // or use absolute positioning if the CSS is set up for that.
        // Based on the template, #player-token is a direct child of #market-grid.
        // We'll calculate position based on the tile's position relative to grid.
        
        // Actually, a simpler way for this grid layout is to just append the token to the tile
        // BUT the HTML structure has token as sibling. Let's use offsetTop/Left.
        
        const gridRect = this.dom.grid.getBoundingClientRect();
        const tileRect = targetTile.getBoundingClientRect();

        const relativeTop = tileRect.top - gridRect.top + (tileRect.height / 2) - 20; // -20 for half token size
        const relativeLeft = tileRect.left - gridRect.left + (tileRect.width / 2) - 20;

        // Use transform to move token for compositor-only animations (x,y)
        if (this.dom.playerToken) {
            this.dom.playerToken.style.transform = `translate(${relativeLeft}px, ${relativeTop}px)`;
        }
    }

    selectShop(shopId) {
        this.currentShopId = shopId;
        let shopInfo = ShopData[shopId];

        // Handle Secret Shops (mystery1, mystery2, etc mapped to specific logic if needed)
        // For now, let's assume mystery1 is the Secret Shop if unlocked
        if (shopId.startsWith('mystery')) {
            if (GameManager.getFlag('secretShopUnlocked')) {
                shopInfo = {
                    name: '黑市商人',
                    npcPortrait: '',
                    dialogue: '噓... 這裡只有最強大的裝備。',
                    items: SecretShopItems
                };
            } else {
                return; // Should be locked anyway
            }
        }

        if (!shopInfo) return;

        this.dom.grid?.querySelectorAll('.grid-tile').forEach(tile => {
            tile.classList.toggle('active', tile.dataset.shop === shopId);
        });
        const activeTile = this.dom.grid?.querySelector(`.grid-tile[data-shop="${shopId}"]`);
        if (activeTile) this.movePlayerToken(activeTile);

        // Update NPC Panel
        if (this.dom.npcPortrait) {
            const portrait = shopInfo.npcPortrait || '';
            if (portrait) {
                this.dom.npcPortrait.src = portrait;
                this.dom.npcPortrait.hidden = false;
                this.dom.dropZone?.classList.remove('no-portrait');
            } else {
                this.dom.npcPortrait.removeAttribute('src');
                this.dom.npcPortrait.hidden = true;
                this.dom.dropZone?.classList.add('no-portrait');
            }
            this.dom.npcPortrait.alt = shopInfo.name || '商店 NPC';
        }
        this.renderNpcDialogue();
        this.setTradeStatus(shopInfo.name || '店鋪', '貨架已更新。', 'info');

        this.renderShopInventory(shopInfo.items);
    }

    renderShopInventory(items = []) {
        const container = this.dom.shopInventory;
        if (!container) return;

        this.currentShopItems = items;
        container.innerHTML = '';

        items.forEach(item => {
            const itemEl = this.createItemElement(item, 'buy');
            container.appendChild(itemEl);
        });
    }

    renderPlayerInventory(inventory) {
        const container = this.dom.playerInventory;
        if (!container) return;
        container.innerHTML = '';

        if (!Array.isArray(inventory) || inventory.length === 0) {
            container.innerHTML = `
                <div class="trade-empty-state">
                    <div class="trade-empty-title">背包沒有可出售物品</div>
                    <div class="trade-empty-copy">冒險取得裝備或素材後，會在這裡顯示出售價。</div>
                </div>
            `;
            return;
        }

        if (window.PerformanceUtils && typeof window.PerformanceUtils.processInChunks === 'function') {
            window.PerformanceUtils.processInChunks(inventory, (item) => {
                const itemEl = this.createItemElement(item, 'sell');
                itemEl.draggable = true;
                itemEl.addEventListener('dragstart', (e) => {
                    this.draggedItem = item;
                    e.dataTransfer.setData('text/plain', JSON.stringify(item));
                    itemEl.style.opacity = '0.5';
                });
                itemEl.addEventListener('dragend', () => { itemEl.style.opacity = '1'; });
                container.appendChild(itemEl);
            }, {chunkSize: 40});
        } else {
            inventory.forEach(item => {
                const itemEl = this.createItemElement(item, 'sell');
                itemEl.draggable = true;
                itemEl.addEventListener('dragstart', (e) => {
                    this.draggedItem = item;
                    e.dataTransfer.setData('text/plain', JSON.stringify(item));
                    itemEl.style.opacity = '0.5';
                });
                itemEl.addEventListener('dragend', () => { itemEl.style.opacity = '1'; });
                container.appendChild(itemEl);
            });
        }
    }

    createItemElement(itemData, mode) {
        const trade = this.getTradeEntry(itemData, mode);
        const { item, quantity, price } = trade;
        const playerGold = this.getPlayerGold();
        const canAfford = mode !== 'buy' || playerGold >= price;
        const modeText = mode === 'buy' ? '購買' : '出售';
        const hintText = mode === 'buy'
            ? (canAfford ? '點擊購買' : '金幣不足')
            : '點擊出售';
        
        const el = document.createElement('div');
        el.className = `item-card shop-flow-card rarity-${item.rarity || 'common'} mode-${mode}`;
        if (!canAfford) el.classList.add('is-unaffordable');
        el.setAttribute('role', 'button');
        el.tabIndex = 0;
        
        let iconHTML;
        if (item.image) {
            iconHTML = `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" class="shop-item-image">`;
        } else {
            iconHTML = escapeHtml(item.icon || '📦');
        }
        
        el.innerHTML = `
            <div class="item-icon">
                ${iconHTML}
                ${quantity > 1 ? `<span class="quantity-badge">x${quantity}</span>` : ''}
            </div>
            <div class="item-info">
                <div class="item-flow-row">
                    <span class="item-price-label">${modeText}</span>
                    <span class="item-price">💰 ${price}</span>
                </div>
                <div class="item-name">${escapeHtml(item.name)}</div>
                <div class="item-action-hint">${hintText}</div>
            </div>
        `;
        
        el.addEventListener('click', () => {
            this.openModal(trade, mode);
        });
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.openModal(trade, mode);
            }
        });

        return el;
    }

    getTradeEntry(itemData, mode) {
        const item = itemData?.item || itemData || {};
        const quantity = Number(itemData?.quantity || item.quantity || 1) || 1;
        const instanceId = itemData?.instanceId || item.instanceId || null;
        const price = mode === 'buy'
            ? (Number(item.price) || 0)
            : getSellPrice(item, quantity);

        return {
            item,
            quantity,
            instanceId,
            price
        };
    }

    openModal(itemData, mode) {
        const trade = itemData?.item ? itemData : this.getTradeEntry(itemData, mode);
        const { item, quantity, price } = trade;
        const canAfford = mode !== 'buy' || this.getPlayerGold() >= price;

        const actionBtn = document.createElement('button');
        actionBtn.className = `btn ${mode === 'buy' ? 'btn-primary' : 'btn-warning'} shop-confirm-btn mode-${mode}`;
        actionBtn.disabled = !canAfford;
        actionBtn.textContent = mode === 'buy'
            ? (canAfford ? `確認購買 · ${price} 金幣` : `金幣不足 · ${price} 金幣`)
            : `確認出售 · ${price} 金幣`;
        actionBtn.addEventListener('click', () => {
            if (!canAfford) {
                this.showFeedback('金幣不足', `還需要 ${Math.max(0, price - this.getPlayerGold())} 金幣。`, 'error');
                return;
            }
            if (mode === 'buy') this.handleBuy(trade);
            else this.handleSell(trade);
        });

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-secondary shop-cancel-btn';
        cancelBtn.textContent = '取消';
        cancelBtn.addEventListener('click', () => this.closeItemModal());

        // Open centralized modal
        if (window.ItemDetailModal) {
            const flowDescription = mode === 'buy'
                ? `購買後會放入你的背包。目前持有 ${this.getPlayerGold()} 金幣。`
                : `出售 ${quantity > 1 ? `x${quantity} ` : ''}後會獲得 ${price} 金幣，物品會從背包移除。`;
            window.ItemDetailModal.open(item, {
                ...buildItemModalOptions(item, { description: flowDescription }),
                action: mode,
                priceLabel: mode === 'buy' ? '購買價' : '出售價',
                actions: [actionBtn, cancelBtn]
            });
        } else {
            console.error('ItemDetailModal not available');
        }
    }

    getPlayerGold() {
        if (typeof GameManager.getGold === 'function') return Number(GameManager.getGold()) || 0;
        return Number(GameManager.state?.character?.gold) || 0;
    }

    closeItemModal() {
        if (window.ItemDetailModal && typeof window.ItemDetailModal.close === 'function') {
            window.ItemDetailModal.close();
        }
    }

    handleBuy(trade) {
        const { item, price } = trade;
        const itemName = item.name || '物品';

        if (this.getPlayerGold() < price || !GameManager.removeGold(price)) {
            this.showFeedback('金幣不足', `無法購買「${itemName}」，目前持有 ${this.getPlayerGold()} 金幣。`, 'error');
            return;
        }

        const added = GameManager.addToInventory(item);
        if (!added) {
            GameManager.addGold(price);
            this.showFeedback('背包已滿', `「${itemName}」無法放入背包，金幣已退回。`, 'error');
            return;
        }

        this.closeItemModal();
        this.showFeedback('購買完成', `已購買「${itemName}」，花費 ${price} 金幣。`, 'success');
    }

    handleSell(trade) {
        const { item, quantity, instanceId, price } = trade;
        const itemName = item.name || '物品';
        let earnedGold = false;

        if (instanceId && typeof GameManager.sellItem === 'function') {
            earnedGold = GameManager.sellItem(instanceId, false);
        } else {
            const removed = GameManager.removeFromInventory(item.id);
            if (removed) {
                GameManager.addGold(price);
                earnedGold = price;
            }
        }

        if (earnedGold === false) {
            this.showFeedback('出售失敗', `找不到「${itemName}」，請重新整理背包後再試。`, 'error');
            return;
        }

        this.closeItemModal();
        this.showFeedback('出售完成', `已出售「${itemName}」${quantity > 1 ? `x${quantity}` : ''}，獲得 ${earnedGold} 金幣。`, 'success');
    }

    handleItemDrop(item) {
        if (item.isSecretKey) {
            const outcome = worldInteractionManager.trigger('merchant_ancient_coin', {
                source: 'vendor',
                shopId: this.currentShopId,
                toast: false
            });

            if (GameManager.getFlag('secretShopUnlocked')) {
                this.unlockSecretVisuals();
            }

            const message = outcome.messages?.join(' ') || '黑市入口已經開啟。';
            this.showFeedback(outcome.success ? '線索觸發' : '沒有新的反應', message, outcome.success ? 'success' : 'info');
        } else {
            this.showFeedback('沒有新的反應', '這件物品沒有觸發新的線索。', 'info');
        }
    }

    unlockSecretVisuals() {
        const mysteryTiles = this.container.querySelectorAll('[data-shop^="mystery"]');
        mysteryTiles.forEach(tile => {
            tile.classList.remove('locked');
            tile.querySelector('.shop-label').textContent = '黑市';
            tile.querySelector('.shop-icon').textContent = '🕵️';
        });
    }

    renderNpcDialogue(message = '', type = 'idle') {
        if (!this.dom?.npcDialogue) return;

        const text = String(message || '').trim();
        this.dom.npcDialogue.classList.toggle('is-quiet', !text);

        if (!text) {
            this.dom.npcDialogue.innerHTML = '<p class="trade-dialogue-idle" aria-hidden="true"></p>';
            return;
        }

        const lines = text.split('\n').filter(Boolean);
        this.dom.npcDialogue.innerHTML = lines.map(line => (
            `<p class="trade-dialogue-feedback ${type}">${escapeHtml(line)}</p>`
        )).join('');
    }

    setTradeStatus(title, message, type = 'info') {
        if (!this.dom?.tradeStatus) return;

        this.dom.tradeStatus.className = `trade-status-panel is-${type}`;
        if (this.dom.tradeStatusIcon) {
            this.dom.tradeStatusIcon.textContent = {
                success: '✅',
                error: '❌',
                warning: '⚠️',
                info: 'ℹ️'
            }[type] || 'ℹ️';
        }
        if (this.dom.tradeStatusTitle) this.dom.tradeStatusTitle.textContent = title;
        if (this.dom.tradeStatusMessage) this.dom.tradeStatusMessage.textContent = message;
    }

    showFeedback(title, message, type = 'info') {
        if (message === 'success' || message === 'error' || message === 'warning' || message === 'info') {
            type = message;
            message = title;
            title = type === 'success' ? '交易完成' : '交易提示';
        }

        this.setTradeStatus(title, message, type);
        showGlobalToast(title, message, type);

        this.renderNpcDialogue(message, type);
    }
}
