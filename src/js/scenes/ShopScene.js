/**
 * ShopScene.js
 * Market presentation: vendor shelves and player selling.
 */
import GameManager from '../managers/GameManager.js';
import { marketManager } from '../managers/MarketManager.js';
import { navigationIntentManager } from '../managers/NavigationIntentManager.js';
import {
    MarketSceneAssets,
    getAllMarketVendors,
    getMarketItem,
    getMarketVendor
} from '../data/MarketSupply.js';
import { getSellPrice } from '../models/ItemSchema.js';
import { buildItemModalOptions, escapeHtml, getItemDisplayDescription, getItemVisualHtml } from '../utils/ItemDisplay.js';
import { attachItemTooltip, closeItemTooltip } from '../utils/ItemTooltip.js';
import { showGlobalToast } from '../utils/UIFeedback.js';
import audioManager from '../utils/AudioManager.js';
import itemDetailModal from '../components/ItemDetailModal.js';

const MARKET_SCENE_TITLE = '市集邊棚';
const MARKET_HEADER_COPY = '左棚有藥草香，中央貨車堆著路線工具，布告角落永遠有人比公告欄更早知道麻煩。';
const MARKET_SCENE_COPY = '你站在帆布棚下。藥草、鐵片、路線拓片和低聲傳聞各自佔著一角，走近攤位後再開口。';

function cloneItemData(item) {
    if (!item) return item;
    if (typeof structuredClone === 'function') {
        try {
            return structuredClone(item);
        } catch (error) {
            // Fall through to JSON cloning for plain records.
        }
    }
    return JSON.parse(JSON.stringify(item));
}

export default class ShopScene {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.currentVendorId = null;
        this.currentVendor = null;
        this.marketNarrativeLog = [];
        this.lastMarketNarrativeKey = '';
        this.entryIndex = new Map();
        this.currentShopItems = [];
        this.updateUI = this.updateUI.bind(this);
        this.handleVendorClick = this.handleVendorClick.bind(this);
        this.handlePanelClick = this.handlePanelClick.bind(this);
        this.handleExit = this.handleExit.bind(this);
        this.handleCloseStall = this.handleCloseStall.bind(this);
        this.eventsBound = false;
        this.subscribed = false;
    }

    init() {
        this.cacheDOM();
        this.bindEvents();

        try {
            if (!this.subscribed) {
                GameManager.subscribe(this.updateUI);
                this.subscribed = true;
            }
        } catch (error) {
            // GameManager is normally a pub/sub singleton; keep scene usable if not.
        }

        this.applySceneAssets();
        this.renderVendorHotspots();
        this.updateUI(null, 'all');
        this.renderMarketPrompt();
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
            stage: this.container.querySelector('#market-stage'),
            scene: this.container.classList?.contains('market-place-scene')
                ? this.container
                : this.container.querySelector('.market-place-scene'),
            grid: this.container.querySelector('#market-grid'),
            exit: this.container.querySelector('#btn-exit-shop'),
            closeStall: this.container.querySelector('#btn-close-stall'),
            panel: this.container.querySelector('#supply-panel'),
            playerInventory: this.container.querySelector('#player-inventory'),
            playerGold: this.container.querySelector('#player-gold'),
            npcPortrait: this.container.querySelector('#npc-portrait'),
            portraitFallback: this.container.querySelector('#vendor-portrait-fallback'),
            vendorPlace: this.container.querySelector('#vendor-place'),
            vendorName: this.container.querySelector('#vendor-name'),
            vendorRole: this.container.querySelector('#vendor-role'),
            vendorFunctionList: this.container.querySelector('#vendor-function-list'),
            npcDialogue: this.container.querySelector('#dialogue-box'),
            tradeStatus: this.container.querySelector('#trade-status'),
            tradeStatusIcon: this.container.querySelector('#trade-status-icon'),
            tradeStatusTitle: this.container.querySelector('#trade-status-title'),
            tradeStatusMessage: this.container.querySelector('#trade-status-message'),
            marketNarrativeTitle: this.container.querySelector('#market-narrative-title'),
            marketFeed: this.container.querySelector('#market-feed'),
            shopCurrentCopy: this.container.querySelector('#shop-current-copy')
        };

        ['grid', 'panel', 'playerInventory'].forEach(key => {
            if (!this.dom[key]) console.error(`Critical DOM element not found: ${key}`);
        });
    }

    bindEvents() {
        if (this.eventsBound) return;
        this.dom.grid?.addEventListener('click', this.handleVendorClick);
        this.dom.exit?.addEventListener('click', this.handleExit);
        this.dom.closeStall?.addEventListener('click', this.handleCloseStall);
        this.dom.panel?.addEventListener('click', this.handlePanelClick);
        this.eventsBound = true;
    }

    unbindEvents() {
        this.dom.grid?.removeEventListener('click', this.handleVendorClick);
        this.dom.exit?.removeEventListener('click', this.handleExit);
        this.dom.closeStall?.removeEventListener('click', this.handleCloseStall);
        this.dom.panel?.removeEventListener('click', this.handlePanelClick);
        this.eventsBound = false;
    }

    handleExit() {
        navigationIntentManager.setTownReturnPlace('market');

        if (typeof this.app?.navigateTo === 'function') {
            this.app.navigateTo('lobby');
        } else {
            this.app.loadScene('lobby');
        }
    }

    handleCloseStall() {
        this.currentVendorId = null;
        this.currentVendor = null;
        this.dom.scene?.classList.remove('is-trading');
        this.applySceneAssets();
        this.renderVendorHotspots();
        this.renderMarketPrompt();
    }

    applySceneAssets(vendor = null) {
        if (this.dom.stage) {
            const image = vendor?.sceneImage || MarketSceneAssets.background;
            const focus = vendor?.sceneFocus || MarketSceneAssets.focus || 'center';
            this.dom.stage.style.setProperty('--market-bg', `url("/${image}")`);
            this.dom.stage.style.setProperty('--market-bg-position', focus);
        }
        if (this.dom.shopCurrentCopy) {
            const copy = vendor?.sceneCaption || MARKET_HEADER_COPY;
            this.dom.shopCurrentCopy.textContent = copy;
            this.dom.shopCurrentCopy.hidden = false;
        }
    }

    updateUI(_state, type = 'all') {
        if (!this.dom) return;
        if (type === 'gold' || type === 'all') {
            this.dom.playerGold.textContent = `${GameManager.getCharacter()?.gold || 0}`;
            this.renderCurrentPanel();
        }
        if (type === 'inventory' || type === 'warehouse' || type === 'all') {
            this.renderPlayerInventory(GameManager.getInventory());
            this.renderCurrentPanel();
        }
        if (type === 'flags' || type === 'all') {
            this.renderVendorHotspots();
            this.renderCurrentPanel();
        }
    }

    handleVendorClick(event) {
        const button = event.target.closest('[data-vendor-id]');
        if (!button) return;
        this.selectVendor(button.dataset.vendorId);
    }

    handlePanelClick(event) {
        const button = event.target.closest('[data-supply-action]');
        if (!button || button.disabled) return;

        const action = button.dataset.supplyAction;
        if (action === 'prepare') {
            const vendorId = button.dataset.vendorId;
            if (vendorId) this.selectVendor(vendorId);
            return;
        }

        if (action === 'buy') {
            const entry = this.entryIndex.get(button.dataset.entryId);
            if (entry) this.openModal(this.getTradeEntry(entry.item, 'buy', entry.price), 'buy');
            return;
        }

    }

    renderVendorHotspots() {
        if (!this.dom.grid) return;
        this.dom.grid.innerHTML = getAllMarketVendors().map(vendor => {
            const locked = this.isVendorLocked(vendor);
            const active = vendor.id === this.currentVendorId;
            const position = vendor.position || { x: 50, y: 50 };
            const avatar = vendor.portrait && !locked
                ? `<img src="${escapeHtml(vendor.portrait)}" alt="${escapeHtml(vendor.name)}">`
                : escapeHtml(vendor.icon || '◆');
            const availableCount = (vendor.shelves || [])
                .filter(entry => this.meetsCondition(entry.condition)).length;
            return `
                <button
                    class="market-resident ${active ? 'active' : ''} ${locked ? 'is-locked' : ''}"
                    type="button"
                    data-vendor-id="${escapeHtml(vendor.id)}"
                    style="--x:${position.x}%; --y:${position.y}%"
                    aria-label="${escapeHtml(`${vendor.name}，${vendor.role}`)}"
                >
                    <span class="resident-avatar">${avatar}</span>
                    <span class="resident-copy">
                        <span>${escapeHtml(vendor.place || '市集')}</span>
                        <strong>${escapeHtml(vendor.name)}</strong>
                        <small>${escapeHtml(locked ? '尚未開張' : vendor.role)}</small>
                    </span>
                    <span class="resident-count">${locked ? '鎖' : availableCount}</span>
                </button>
            `;
        }).join('');
    }

    selectVendor(vendorId) {
        this.currentVendorId = vendorId;
        this.currentVendor = getMarketVendor(vendorId);
        this.dom.scene?.classList.add('is-trading');
        this.applySceneAssets(this.currentVendor);
        this.renderVendorHotspots();
        this.renderVendorCard();
        this.renderCurrentPanel();
    }

    renderVendorCard() {
        const vendor = this.currentVendor;
        if (!vendor) return;
        const locked = this.isVendorLocked(vendor);
        const summary = locked ? vendor.lockedSummary : vendor.summary;
        const dialogue = locked ? vendor.lockedSummary : vendor.dialogue;

        if (this.dom.npcPortrait) {
            if (vendor.portrait && !locked) {
                this.dom.npcPortrait.src = vendor.portrait;
                this.dom.npcPortrait.hidden = false;
            } else {
                this.dom.npcPortrait.removeAttribute('src');
                this.dom.npcPortrait.hidden = true;
            }
            this.dom.npcPortrait.alt = vendor.name;
        }
        if (this.dom.portraitFallback) {
            this.dom.portraitFallback.textContent = vendor.icon || vendor.name?.slice(0, 1) || '市';
            this.dom.portraitFallback.hidden = Boolean(vendor.portrait && !locked);
        }
        if (this.dom.vendorPlace) this.dom.vendorPlace.textContent = vendor.place || '市集';
        if (this.dom.vendorName) this.dom.vendorName.textContent = vendor.name;
        if (this.dom.vendorRole) this.dom.vendorRole.textContent = locked ? '尚未開張' : vendor.role;
        if (this.dom.shopCurrentCopy) {
            this.dom.shopCurrentCopy.textContent = vendor.sceneCaption || summary || MARKET_HEADER_COPY;
            this.dom.shopCurrentCopy.hidden = false;
        }
        this.renderVendorFunctionList(vendor, locked);
        this.renderNpcDialogue(dialogue || '');
        this.pushMarketNarrative(
            locked ? `${vendor.name}還沒開張` : `${vendor.name}的攤位`,
            locked ? (summary || '這條供應線還沒有打開。') : (summary || vendor.role || '攤位已展開。'),
            locked ? 'warning' : 'info'
        );
    }

    renderCurrentPanel() {
        if (!this.dom.panel) return;
        const vendor = this.currentVendor;
        if (!vendor) {
            this.renderMarketPrompt();
            return;
        }

        this.entryIndex.clear();
        if (this.isVendorLocked(vendor)) {
            this.dom.panel.innerHTML = this.renderLockedVendor(vendor);
            this.setTradeStatus(vendor.name, vendor.lockedSummary || '這條供應線還沒有打開。', 'warning');
            return;
        }

        this.dom.panel.innerHTML = this.renderShelf(vendor);
        this.setTradeStatus(
            `${vendor.name} · 貨架`,
            this.getPanelHint(vendor),
            'info'
        );
    }

    renderMarketPrompt() {
        if (this.dom.vendorPlace) this.dom.vendorPlace.textContent = '市集';
        if (this.dom.vendorName) this.dom.vendorName.textContent = '選擇攤位';
        if (this.dom.vendorRole) this.dom.vendorRole.textContent = '走近攤位後查看公開貨架。';
        this.applySceneAssets();
        if (this.dom.portraitFallback) {
            this.dom.portraitFallback.textContent = '市';
            this.dom.portraitFallback.hidden = false;
        }
        if (this.dom.npcPortrait) {
            this.dom.npcPortrait.removeAttribute('src');
            this.dom.npcPortrait.hidden = true;
        }
        this.renderVendorFunctionList(null);
        this.renderNpcDialogue('先在市集裡選一個攤位。');
        this.dom.panel.innerHTML = this.renderPreparationBoard();
        this.setTradeStatus(MARKET_SCENE_TITLE, MARKET_SCENE_COPY, 'info');
        this.pushMarketNarrative(MARKET_SCENE_TITLE, MARKET_SCENE_COPY, 'info', { initial: true });
    }

    renderPreparationBoard() {
        const cards = this.getPreparationCards();
        return `
            <div class="supply-empty-state market-prep-intro">
                <strong>公開庫存</strong>
                <p>來路、批次與數量都寫在貨架前。</p>
            </div>
            <div class="market-prep-grid">
                ${cards.map(card => this.renderPreparationCard(card)).join('')}
            </div>
        `;
    }

    getPreparationCards() {
        const potionCount = this.getItemCount('health_potion_s');
        return [
            {
                label: '基礎補給',
                title: potionCount >= 2 ? '藥水足夠目前路程' : '補足公開基礎藥品',
                copy: potionCount >= 2
                    ? `背包與倉庫共有 ${potionCount} 瓶小型生命藥水。`
                    : '市集維持公開基礎藥品供應，庫存不依附任何一位角色的存亡。',
                vendorId: 'merchant',
                tone: potionCount >= 2 ? 'ready' : 'warning'
            }
        ];
    }

    getQuestMaterialPrepCards() {
        return [];
    }

    renderPreparationCard(card = {}) {
        const vendor = card.vendorId ? getMarketVendor(card.vendorId) : null;
        const locked = vendor ? this.isVendorLocked(vendor) : false;
        const avatar = vendor?.portrait && !locked
            ? `<img src="${escapeHtml(vendor.portrait)}" alt="${escapeHtml(vendor.name)}">`
            : escapeHtml(vendor?.icon || '市');
        const functions = card.functions || vendor?.functionList || this.getVendorFunctionList(vendor);
        return `
            <article class="supply-card market-prep-card market-place-card is-${escapeHtml(card.tone || 'info')}">
                <div class="market-prep-avatar">${avatar}</div>
                <div class="supply-card-copy">
                    <span>${escapeHtml(`${card.label || '準備'} · ${vendor?.place || '市集'}`)}</span>
                    <h3>${escapeHtml(card.title || '確認攤位')}</h3>
                    <p>${escapeHtml(card.copy || '')}</p>
                    <div class="market-prep-functions">
                        ${functions.slice(0, 3).map(item => `<small>${escapeHtml(item)}</small>`).join('')}
                    </div>
                </div>
                <div class="supply-card-side">
                    <strong>${escapeHtml(vendor?.name || '市集')}</strong>
                    <button
                        type="button"
                        data-supply-action="prepare"
                        data-vendor-id="${escapeHtml(card.vendorId || '')}"
                    >前往</button>
                </div>
            </article>
        `;
    }

    getVendorFunctionList(vendor) {
        if (!vendor) return ['選擇攤位後查看功能'];
        const list = [];
        if ((vendor.shelves || []).length) list.push(`貨架：${vendor.shelves.length} 項`);
        return list.length ? list : ['目前沒有開放交易'];
    }

    renderVendorFunctionList(vendor, locked = false) {
        if (!this.dom.vendorFunctionList) return;
        const functions = locked
            ? [vendor?.lockedSummary || '尚未開放']
            : (vendor?.functionList || this.getVendorFunctionList(vendor));
        this.dom.vendorFunctionList.innerHTML = functions
            .slice(0, 4)
            .map(item => `<span>${escapeHtml(item)}</span>`)
            .join('');
    }

    renderLockedVendor(vendor) {
        return `
            <div class="supply-empty-state">
                <strong>${escapeHtml(vendor.name)}還沒有開門</strong>
                <p>${escapeHtml(vendor.lockedSummary || '這裡需要先透過故事或特殊物品解鎖。')}</p>
            </div>
        `;
    }

    getPanelHint(vendor) {
        return vendor.summary || '穩定供應會出現在這裡，強力裝備仍以掉落、圖紙與鍛造為主。';
    }

    renderShelf(vendor) {
        const entries = vendor.shelves || [];
        if (entries.length === 0) return this.renderEmpty('貨架暫時空著', '這個人物目前沒有穩定供應品。');
        return entries.map(entry => this.renderShelfCard(entry)).join('');
    }

    renderShelfCard(entry) {
        const item = this.resolveItem(entry.itemId);
        if (!item) return '';

        const id = `shelf:${entry.id}`;
        const conditionMet = this.meetsCondition(entry.condition);
        const canAfford = this.getPlayerGold() >= Number(entry.price || item.price || 0);
        const disabled = !conditionMet || !canAfford;
        this.entryIndex.set(id, {
            ...entry,
            id,
            item,
            price: Number(entry.price ?? item.price ?? 0)
        });

        return `
            <article class="supply-card ${conditionMet ? '' : 'is-locked'}">
                <div class="supply-card-main">
                    ${this.renderItemIcon(item, 'supply-card-icon')}
                    <div class="supply-card-copy">
                        <span>${escapeHtml(entry.stock || '供應品')}</span>
                        <h3>${escapeHtml(item.name || entry.itemId)}</h3>
                        <p>${escapeHtml(conditionMet ? (entry.note || item.marketUse || getItemDisplayDescription(item, '')) : entry.lockedReason || '條件尚未達成。')}</p>
                    </div>
                </div>
                <div class="supply-card-side">
                    <strong>${Number(entry.price ?? item.price ?? 0)}G</strong>
                    <button type="button" data-supply-action="buy" data-entry-id="${escapeHtml(id)}" ${disabled ? 'disabled' : ''}>
                        ${conditionMet ? (canAfford ? '購買' : '金幣不足') : '尚未供應'}
                    </button>
                </div>
            </article>
        `;
    }

    renderEmpty(title, copy) {
        return `
            <div class="supply-empty-state">
                <strong>${escapeHtml(title)}</strong>
                <p>${escapeHtml(copy)}</p>
            </div>
        `;
    }

    renderPlayerInventory(inventory) {
        const container = this.dom.playerInventory;
        if (!container) return;
        container.innerHTML = '';

        if (!Array.isArray(inventory) || inventory.length === 0) {
            container.innerHTML = `
                <div class="trade-empty-state compact-empty">
                    <div class="trade-empty-title">沒有可出售物品</div>
                </div>
            `;
            return;
        }

        inventory.forEach(stack => {
            const itemEl = this.createItemElement(stack, 'sell');
            container.appendChild(itemEl);
        });
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
        el.className = `item-card shop-flow-card rarity-frame rarity-${item.rarity || 'common'} mode-${mode}`;
        if (!canAfford) el.classList.add('is-unaffordable');
        el.setAttribute('role', 'button');
        el.setAttribute('aria-label', `${modeText}${item.name || '物品'}，價格 ${price} 金幣`);
        el.tabIndex = 0;
        el.innerHTML = `
            <div class="item-icon">
                ${this.renderItemIcon(item)}
                ${quantity > 1 ? `<span class="quantity-badge">x${quantity}</span>` : ''}
            </div>
            <div class="item-info">
                <div class="item-flow-row">
                    <span class="item-price-label">${modeText}</span>
                    <span class="item-price">${price}G</span>
                </div>
                <div class="item-name">${escapeHtml(item.name)}</div>
                <div class="item-action-hint">${hintText}</div>
            </div>
        `;
        attachItemTooltip(el, item, {
            quantity,
            price,
            priceLabel: mode === 'buy' ? '購買' : '出售',
            hint: mode === 'buy' ? '點擊確認購買' : '點擊確認出售'
        });

        el.addEventListener('click', () => this.openModal(trade, mode));
        el.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.openModal(trade, mode);
            }
        });

        return el;
    }

    renderItemIcon(item, extraClass = '') {
        return getItemVisualHtml(item, '◆', extraClass || 'shop-item-image');
    }

    resolveItem(itemId) {
        const item = getMarketItem(itemId);
        return item ? cloneItemData(item) : null;
    }

    getTradeEntry(itemData, mode, forcedPrice = null) {
        const raw = itemData?.item || itemData || {};
        const catalogItem = raw.id ? getMarketItem(raw.id) : null;
        const item = catalogItem
            ? { ...cloneItemData(catalogItem), ...raw }
            : raw;
        const quantity = Number(itemData?.quantity || raw.quantity || 1) || 1;
        const instanceId = itemData?.instanceId || raw.instanceId || null;
        const price = mode === 'buy'
            ? Number(forcedPrice ?? item.price ?? 0)
            : getSellPrice(item, quantity);

        return { item, quantity, instanceId, price };
    }

    openModal(itemData, mode) {
        closeItemTooltip();
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

        const flowDescription = mode === 'buy'
            ? `購買後會放入背包。目前持有 ${this.getPlayerGold()} 金幣。`
            : `出售 ${quantity > 1 ? `x${quantity} ` : ''}後會獲得 ${price} 金幣，物品會從背包移除。`;
        itemDetailModal.open(item, {
            ...buildItemModalOptions(item, { description: flowDescription }),
            action: mode,
            priceLabel: mode === 'buy' ? '購買價' : '出售價',
            actions: [actionBtn, cancelBtn]
        });
    }

    closeItemModal() {
        itemDetailModal.close();
    }

    handleBuy(trade) {
        const result = marketManager.buy(trade);
        this.closeItemModal();

        if (!result.success) {
            const feedback = {
                'already-unlocked': ['已解鎖', `「${result.itemName}」已轉為戰術成就，不需要重複購買。`, 'info'],
                gold: ['金幣不足', `無法購買「${result.itemName}」，目前持有 ${result.currentGold} 金幣。`, 'error'],
                'inventory-full': ['背包已滿', `「${result.itemName}」無法放入背包，金幣已退回。`, 'error'],
                'passive-effect': ['解鎖失敗', `「${result.itemName}」沒有對應的戰術成就。`, 'error']
            }[result.code] || ['購買失敗', '這筆交易無法完成。', 'error'];
            audioManager.play(feedback[2] === 'error' ? 'toast-error' : 'toast-warning', {
                throttleKey: `market-buy-${result.code || 'failed'}`,
                throttleMs: 180
            });
            this.showFeedback(...feedback);
            return;
        }

        if (result.code === 'passive-effect') {
            audioManager.play('reward', { throttleKey: 'market-passive-unlock', throttleMs: 180 });
            this.showFeedback(
                result.alreadyUnlocked ? '已解鎖' : '戰術成就解鎖',
                result.alreadyUnlocked
                    ? `「${result.itemName}」已經記入戰術欄。`
                    : `學會「${result.effectName}」，可在角色欄的戰術技能中查看。`,
                'success'
            );
            return;
        }

        audioManager.play('coin', { throttleKey: 'market-buy-success', throttleMs: 180 });
        const unlockText = result.unlockedEffectNames?.length
            ? ` 戰術技能解鎖：${result.unlockedEffectNames.join('、')}。可回大廳旅人卡片更換。`
            : '';
        this.showFeedback(
            '購買完成',
            `已購買「${result.itemName}」，花費 ${result.price} 金幣。${unlockText}`,
            'success'
        );
    }

    handleSell(trade) {
        const result = marketManager.sell(trade);
        if (!result.success) {
            audioManager.play('toast-error', { throttleKey: 'market-sell-failed', throttleMs: 180 });
            this.showFeedback('出售失敗', `找不到「${result.itemName}」，請重新整理背包後再試。`, 'error');
            return;
        }

        this.closeItemModal();
        audioManager.play('coin', { throttleKey: 'market-sell-success', throttleMs: 180 });
        this.showFeedback(
            '出售完成',
            `已出售「${result.itemName}」${result.quantity > 1 ? `x${result.quantity}` : ''}，獲得 ${result.earnedGold} 金幣。`,
            'success'
        );
    }

    isVendorLocked(vendor) {
        if (!vendor?.lockedUnless) return false;
        return !this.meetsCondition(vendor.lockedUnless);
    }

    meetsCondition(condition) {
        if (!condition) return true;
        if (condition.flag) {
            return Boolean(GameManager.getFlag(condition.flag)) === (condition.value ?? true);
        }
        if (condition.anyFlags) {
            return condition.anyFlags.some(flag => Boolean(GameManager.getFlag(flag)));
        }
        if (condition.allFlags) {
            return condition.allFlags.every(flag => Boolean(GameManager.getFlag(flag)));
        }
        if (condition.notFlag) {
            return !Boolean(GameManager.getFlag(condition.notFlag));
        }
        return true;
    }

    getItemCount(itemId) {
        return marketManager.getItemCount(itemId);
    }

    getPlayerGold() {
        return marketManager.getGold();
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
                success: '✓',
                error: '!',
                warning: '!',
                info: 'i'
            }[type] || 'i';
        }
        if (this.dom.tradeStatusTitle) this.dom.tradeStatusTitle.textContent = title;
        if (this.dom.tradeStatusMessage) this.dom.tradeStatusMessage.textContent = message;
    }

    pushMarketNarrative(title, message, type = 'info', options = {}) {
        if (!this.dom?.marketFeed) return;
        const key = `${title || ''}:${message || ''}:${type || ''}`;
        if (!options.initial && key === this.lastMarketNarrativeKey) return;
        if (options.initial && this.marketNarrativeLog.length > 0) return;

        this.lastMarketNarrativeKey = key;
        const tone = ['success', 'error', 'warning', 'info'].includes(type) ? type : 'info';
        const entry = {
            title: title || MARKET_SCENE_TITLE,
            message: message || MARKET_SCENE_COPY,
            tone
        };
        this.marketNarrativeLog.unshift(entry);
        this.marketNarrativeLog = this.marketNarrativeLog.slice(0, 8);
        this.renderMarketFeed();
    }

    renderMarketFeed() {
        if (!this.dom?.marketFeed) return;
        if (this.dom.marketNarrativeTitle) this.dom.marketNarrativeTitle.textContent = MARKET_SCENE_TITLE;
        const entries = this.marketNarrativeLog.length
            ? this.marketNarrativeLog
            : [{ title: MARKET_SCENE_TITLE, message: MARKET_SCENE_COPY, tone: 'info' }];
        this.dom.marketFeed.innerHTML = entries.map((entry, index) => `
            <article class="town-story-entry market-feed-card is-${entry.tone}${index === 0 ? ' is-new' : ''}">
                <span class="world-log-title">${escapeHtml(entry.title)}</span>
                <p class="world-log-message">${escapeHtml(entry.message)}</p>
            </article>
        `).join('');
    }

    showFeedback(title, message, type = 'info') {
        this.setTradeStatus(title, message, type);
        this.pushMarketNarrative(title, message, type);
        showGlobalToast(title, message, type);
        this.renderNpcDialogue(message, type);
    }
}
