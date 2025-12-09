/**
 * ShopScene.js
 * Logic for the Shop/Marketplace scene.
 * Handles buying, selling, and secret shop unlocking.
 */
import GameManager from '../managers/GameManager.js';
import { ShopData, SecretShopItems } from '../data/Items.js';

export default class ShopScene {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.currentShopId = 'blacksmith';
        this.draggedItem = null;
        
        // Bind methods to preserve 'this'
        this.updateUI = this.updateUI.bind(this);
    }

    init() {
        console.log('Shop Scene Initialized');
        
        try {
            this.cacheDOM();
            this.bindEvents();
            this.setupDragAndDrop();
            
            // Subscribe to state changes
            GameManager.subscribe(this.updateUI);

            // Initial Render - Force update with current state
            this.updateUI(GameManager.state, 'all');
            this.selectShop('blacksmith'); // Default shop

            // Check if secret shop is already unlocked
            if (GameManager.getFlag('secretShopUnlocked')) {
                this.unlockSecretVisuals();
            }
        } catch (error) {
            console.error('Error initializing Shop Scene:', error);
        }
    }

    cleanup() {
        GameManager.unsubscribe(this.updateUI);
        console.log('Shop Scene Cleaned up');
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
            
            // Modal
            modal: this.container.querySelector('#item-modal'),
            modalClose: this.container.querySelector('#modal-close'),
            modalIcon: this.container.querySelector('#modal-item-icon'),
            modalName: this.container.querySelector('#modal-item-name'),
            modalRarity: this.container.querySelector('#modal-item-rarity'),
            modalStats: this.container.querySelector('#modal-item-stats'),
            modalDesc: this.container.querySelector('#modal-item-desc'),
            modalBtn: this.container.querySelector('#modal-action-btn')
        };
        
        // Debug: Check if critical elements exist
        const criticalElements = ['grid', 'shopInventory', 'playerInventory', 'modal'];
        criticalElements.forEach(key => {
            if (!this.dom[key]) {
                console.error(`Critical DOM element not found: ${key}`);
            }
        });
    }

    bindEvents() {
        // Grid Navigation
        this.dom.grid.addEventListener('click', (e) => {
            const tile = e.target.closest('.grid-tile');
            if (tile) {
                const shopId = tile.dataset.shop;
                if (shopId === 'exit') {
                    this.app.loadScene('lobby');
                } else if (!tile.classList.contains('locked')) {
                    this.movePlayerToken(tile);
                    this.selectShop(shopId);
                }
            }
        });

        // Modal Close
        if (this.dom.modalClose) {
            this.dom.modalClose.addEventListener('click', () => {
                this.dom.modal.style.display = 'none';
            });
        }

        // Close modal on outside click
        if (this.dom.modal) {
            this.dom.modal.addEventListener('click', (e) => {
                if (e.target === this.dom.modal) {
                    this.dom.modal.style.display = 'none';
                }
            });
        }
    }

    setupDragAndDrop() {
        const dropZone = this.dom.dropZone;

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            
            if (this.draggedItem) {
                this.handleItemDrop(this.draggedItem);
                this.draggedItem = null;
            }
        });
    }

    updateUI(state, type) {
        if (type === 'gold' || type === 'all') {
            this.dom.playerGold.textContent = `💰 ${state.character.gold}`;
        }
        if (type === 'inventory' || type === 'all') {
            this.renderPlayerInventory(state.inventory);
        }
        if (type === 'flags' && state.flags.secretShopUnlocked) {
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

        this.dom.playerToken.style.top = `${relativeTop}px`;
        // Use transform to move token for compositor-only animations
        if (this.dom.playerToken) {
            this.dom.playerToken.style.transform = `translateX(${relativeLeft}px)`;
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
                    npcPortrait: 'https://via.placeholder.com/400x500/000000/ffffff?text=Secret',
                    dialogue: '噓... 這裡只有最強大的裝備。',
                    items: SecretShopItems
                };
            } else {
                return; // Should be locked anyway
            }
        }

        if (!shopInfo) return;

        // Update NPC Panel
        this.dom.npcPortrait.src = shopInfo.npcPortrait;
        this.dom.npcDialogue.innerHTML = `<p>${shopInfo.dialogue}</p>`;

        // Render Shop Items
        this.dom.shopInventory.innerHTML = '';
        shopInfo.items.forEach(item => {
            const itemEl = this.createItemElement(item, 'buy');
            this.dom.shopInventory.appendChild(itemEl);
        });
    }

    renderPlayerInventory(inventory) {
        this.dom.playerInventory.innerHTML = '';
        inventory.forEach(item => {
            const itemEl = this.createItemElement(item, 'sell');
            
            // Make draggable
            itemEl.draggable = true;
            itemEl.addEventListener('dragstart', (e) => {
                this.draggedItem = item;
                e.dataTransfer.setData('text/plain', JSON.stringify(item));
                // Visual feedback
                itemEl.style.opacity = '0.5';
            });
            itemEl.addEventListener('dragend', () => {
                itemEl.style.opacity = '1';
            });

            this.dom.playerInventory.appendChild(itemEl);
        });
    }

    createItemElement(itemData, mode) {
        // Handle stack format
        const item = itemData.item || itemData;
        const quantity = itemData.quantity || 1;
        
        const el = document.createElement('div');
        el.className = `item-card rarity-${item.rarity}`;
        
        let iconHTML;
        if (item.image) {
            iconHTML = `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: contain;">`;
        } else {
            iconHTML = item.icon || '📦';
        }
        
        el.innerHTML = `
            <div class="item-icon">
                ${iconHTML}
                ${quantity > 1 ? `<span class="quantity-badge">x${quantity}</span>` : ''}
            </div>
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-price">💰 ${mode === 'buy' ? item.price : Math.floor(item.price * 0.5)}</div>
            </div>
        `;
        
        el.addEventListener('click', () => {
            this.openModal(item, mode);
        });

        return el;
    }

    openModal(item, mode) {
        if (!this.dom.modal || !this.dom.modalIcon) {
            console.error('Modal DOM elements not found');
            return;
        }
        
        if (item.image) {
            this.dom.modalIcon.innerHTML = `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: contain;">`;
        } else {
            this.dom.modalIcon.textContent = item.icon || '📦';
        }
        this.dom.modalName.textContent = item.name;
        this.dom.modalRarity.className = `modal-rarity-badge rarity-${item.rarity}`;
        this.dom.modalRarity.textContent = item.rarity.toUpperCase();
        this.dom.modalDesc.textContent = item.desc || item.description || '沒有描述';

        // Stats
        this.dom.modalStats.innerHTML = '';
        const stats = [
            { key: 'attack', label: '⚔️ 攻擊', suffix: '' },
            { key: 'atk', label: '⚔️ 攻擊', suffix: '' },
            { key: 'defense', label: '🛡️ 防禦', suffix: '' },
            { key: 'def', label: '🛡️ 防禦', suffix: '' },
            { key: 'hp', label: '❤️ 生命', suffix: '' },
            { key: 'mp', label: '💙 魔力', suffix: '' },
            { key: 'critChance', label: '💥 爆擊率', suffix: '%' }
        ];
        
        stats.forEach(stat => {
            if (item[stat.key]) {
                const statEl = document.createElement('div');
                statEl.className = 'modal-stat-row';
                const value = stat.suffix === '%' ? (item[stat.key] * 100).toFixed(0) : item[stat.key];
                statEl.innerHTML = `<span>${stat.label}</span> <span class="value">+${value}${stat.suffix}</span>`;
                this.dom.modalStats.appendChild(statEl);
            }
        });

        // Button
        const price = mode === 'buy' ? item.price : Math.floor(item.price * 0.5);
        const btnLabel = mode === 'buy' ? '購買' : '出售';
        
        this.dom.modalBtn.innerHTML = `
            <span class="btn-label">${btnLabel}</span>
            <span class="btn-price">💰 ${price}</span>
        `;

        // Clear previous listeners
        const newBtn = this.dom.modalBtn.cloneNode(true);
        this.dom.modalBtn.parentNode.replaceChild(newBtn, this.dom.modalBtn);
        this.dom.modalBtn = newBtn;

        this.dom.modalBtn.addEventListener('click', () => {
            if (mode === 'buy') {
                this.handleBuy(item);
            } else {
                this.handleSell(item);
            }
        });

        // Show modal - remove display: none and add active class
        this.dom.modal.style.display = 'flex';
        setTimeout(() => {
            this.dom.modal.classList.add('active');
        }, 10);
    }

    handleBuy(item) {
        if (GameManager.getGold() >= item.price) {
            if (GameManager.removeGold(item.price)) {
                GameManager.addToInventory(item);
                this.dom.modal.style.display = 'none';
                this.showFeedback('購買成功！', 'success');
            }
        } else {
            this.showFeedback('金幣不足！', 'error');
        }
    }

    handleSell(item) {
        // Use instanceId if available, otherwise fallback to ID (though ID might delete wrong duplicate)
        // GameManager's removeFromInventory uses ID currently, let's update it to use instanceId if possible
        // or just pass the ID for now as per current GameManager implementation.
        // Wait, I see removeItemByInstanceId in GameManager.
        
        let removed;
        if (item.instanceId) {
            removed = GameManager.removeItemByInstanceId(item.instanceId);
        } else {
            removed = GameManager.removeFromInventory(item.id);
        }

        if (removed) {
            const sellPrice = Math.floor(item.price * 0.5); // Or item.sellPrice if defined
            GameManager.addGold(sellPrice);
            this.dom.modal.style.display = 'none';
            this.showFeedback('出售成功！', 'success');
        }
    }

    handleItemDrop(item) {
        if (item.isSecretKey) {
            this.dom.npcDialogue.innerHTML = `<p class="highlight">哦？這是...古代的錢幣？你竟然有這種東西！</p>`;
            setTimeout(() => {
                this.dom.npcDialogue.innerHTML += `<p>看來你有資格進入那個地方...</p>`;
                GameManager.setFlag('secretShopUnlocked', true);
                this.showFeedback('隱藏商店已解鎖！', 'success');
            }, 1500);
        } else {
            this.dom.npcDialogue.innerHTML = `<p>我對這個不感興趣。</p>`;
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

    showFeedback(message, type) {
        // Simple alert or toast could go here
        // For now, let's just log or update dialogue temporarily
        const originalText = this.dom.npcDialogue.innerHTML;
        this.dom.npcDialogue.innerHTML = `<p style="color: ${type === 'error' ? 'red' : 'green'}">${message}</p>`;
        setTimeout(() => {
            this.dom.npcDialogue.innerHTML = originalText;
        }, 2000);
    }
}
