/**
 * ShopScene.js
 * Market supply-line scene: shelves, NPC orders, exchanges, and selling.
 */
import GameManager from '../managers/GameManager.js';
import { questManager, ObjectiveType } from '../managers/QuestManager.js';
import { worldInteractionManager } from '../managers/WorldInteractionManager.js';
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

const PANEL_LABELS = {
    shelf: '貨架',
    orders: '委託訂單',
    exchange: '交換'
};

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

function stackQuantity(stack) {
    return Math.max(1, Number(stack?.quantity) || 1);
}

export default class ShopScene {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.currentVendorId = null;
        this.currentPanel = 'shelf';
        this.currentVendor = null;
        this.marketNarrativeLog = [];
        this.lastMarketNarrativeKey = '';
        this.entryIndex = new Map();
        this.currentShopItems = [];
        this.updateUI = this.updateUI.bind(this);
        this.handleVendorClick = this.handleVendorClick.bind(this);
        this.handleTabClick = this.handleTabClick.bind(this);
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
        if (GameManager?.state) this.updateUI(GameManager.state, 'all');
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
            tabs: this.container.querySelectorAll('.supply-tab'),
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
        this.dom.tabs?.forEach(tab => tab.addEventListener('click', this.handleTabClick));
        this.dom.panel?.addEventListener('click', this.handlePanelClick);
        this.eventsBound = true;
    }

    unbindEvents() {
        this.dom.grid?.removeEventListener('click', this.handleVendorClick);
        this.dom.exit?.removeEventListener('click', this.handleExit);
        this.dom.closeStall?.removeEventListener('click', this.handleCloseStall);
        this.dom.tabs?.forEach(tab => tab.removeEventListener('click', this.handleTabClick));
        this.dom.panel?.removeEventListener('click', this.handlePanelClick);
        this.eventsBound = false;
    }

    handleExit() {
        if (!GameManager.state.ui || typeof GameManager.state.ui !== 'object') {
            GameManager.state.ui = {};
        }
        GameManager.state.ui.returnTownPlaceId = 'market';
        GameManager.markSaveDirty?.('market-return');

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

    updateUI(state, type) {
        if (!this.dom || !state) return;
        if (type === 'gold' || type === 'all') {
            this.dom.playerGold.textContent = `${state.character.gold}`;
            this.renderCurrentPanel();
        }
        if (type === 'inventory' || type === 'warehouse' || type === 'all') {
            this.renderPlayerInventory(state.inventory || []);
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

    handleTabClick(event) {
        const panel = event.currentTarget.dataset.panel;
        if (!panel || panel === this.currentPanel) return;
        this.currentPanel = panel;
        this.dom.tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.panel === panel));
        this.renderCurrentPanel();
    }

    handlePanelClick(event) {
        const button = event.target.closest('[data-supply-action]');
        if (!button || button.disabled) return;

        const action = button.dataset.supplyAction;
        if (action === 'prepare') {
            const vendorId = button.dataset.vendorId;
            const panel = button.dataset.panel || 'shelf';
            if (vendorId) {
                this.currentPanel = panel;
                this.dom.tabs?.forEach(tab => tab.classList.toggle('active', tab.dataset.panel === panel));
                this.selectVendor(vendorId);
            }
            return;
        }

        if (action === 'buy') {
            const entry = this.entryIndex.get(button.dataset.entryId);
            if (entry) this.openModal(this.getTradeEntry(entry.item, 'buy', entry.price), 'buy');
            return;
        }

        if (action === 'upgrade-backpack') {
            this.handleBackpackUpgrade();
            return;
        }

        if (action === 'complete') {
            const entry = this.entryIndex.get(button.dataset.entryId);
            if (entry) this.completeSupplyEntry(entry);
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
            const availableCount = [
                ...(vendor.shelves || []),
                ...(vendor.orders || []),
                ...(vendor.exchanges || [])
            ].filter(entry => this.meetsCondition(entry.condition)).length;
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

        const renderers = {
            shelf: () => this.renderShelf(vendor),
            orders: () => this.renderOrders(vendor),
            exchange: () => this.renderExchanges(vendor)
        };
        this.dom.panel.innerHTML = renderers[this.currentPanel]?.() || '';
        this.setTradeStatus(
            `${vendor.name} · ${PANEL_LABELS[this.currentPanel]}`,
            this.getPanelHint(vendor, this.currentPanel),
            'info'
        );
    }

    renderMarketPrompt() {
        if (this.dom.vendorPlace) this.dom.vendorPlace.textContent = '市集';
        if (this.dom.vendorName) this.dom.vendorName.textContent = '選擇攤位';
        if (this.dom.vendorRole) this.dom.vendorRole.textContent = '走近攤位後再查看貨架、訂單與交換。';
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
                <strong>出門前先看一眼</strong>
                <p>市集不只賣東西。它會把你目前可能缺的補給、誘餌、情報與材料缺口攤開，避免走到半路才想起來少帶一件麻煩。</p>
            </div>
            <div class="market-prep-grid">
                ${cards.map(card => this.renderPreparationCard(card)).join('')}
            </div>
        `;
    }

    getPreparationCards() {
        const flags = GameManager.state?.flags || {};
        const count = itemId => this.getItemCount(itemId);
        const cards = [];

        cards.push({
            label: '基礎補給',
            title: count('health_potion_s') >= 2 ? '藥水還夠撐一段路' : '先補兩瓶小型生命藥水',
            copy: count('health_potion_s') >= 2
                ? `背包與倉庫共有 ${count('health_potion_s')} 瓶小型生命藥水。要深入前可以再檢查一次。`
                : '近郊任務、初階副本與地圖事件都會消耗續航，先去藥棚補齊最實在。',
            vendorId: 'apothecary_assistant',
            panel: 'shelf',
            tone: count('health_potion_s') >= 2 ? 'ready' : 'warning'
        });

        cards.push(...this.getQuestMaterialPrepCards().slice(0, 2));

        if (
            flags['world.clue.silk_tripwire']
            || flags['world.clue.snapped_bait_hook']
            || flags['world.story.ambush_mantis.progress.craft_bait_hook']
            || flags['market.merchant.silver_thread_supply']
        ) {
            cards.push({
                label: '首領準備',
                title: count('silver_thread_bait') > 0 ? '銀絲誘餌已備妥' : '銀鐮伏獵者需要誘餌',
                copy: count('silver_thread_bait') > 0
                    ? '只要到銀絲最密的伏道設下誘餌，就能把那東西從暗處拉出來。'
                    : '奧托能用蜘蛛絲與鐵片試作誘餌，讓 BOSS 觸發從隨機危險變成可控行動。',
                vendorId: 'merchant',
                panel: count('silver_thread_bait') > 0 ? 'shelf' : 'orders',
                tone: count('silver_thread_bait') > 0 ? 'ready' : 'warning'
            });
        }

        if (
            flags['town.apothecary.understands_thorn_trade']
            || flags['world.story.thorn_witch.progress.deliver_herbs']
            || flags['dungeon.jungle.cleared']
        ) {
            cards.push({
                label: '毒霧對策',
                title: count('antidote') > 0 ? '解毒劑可上路' : '叢林與毒蛛線需要解毒劑',
                copy: count('antidote') > 0
                    ? `目前有 ${count('antidote')} 份解毒劑，適合處理迷霧叢林、毒蛛與荊棘相關路線。`
                    : '藥棚已能處理荊棘與毒霧規律，可以直接購買或用毒腺調配。',
                vendorId: 'apothecary_assistant',
                panel: count('poison_gland') > 0 ? 'exchange' : 'shelf',
                tone: count('antidote') > 0 ? 'ready' : 'warning'
            });
        }

        cards.push({
            label: '材料整理',
            title: '把多餘材料轉成可用缺口',
            copy: '柏恩能把鐵礦石拆成鐵片，也能整理南門修補料。這不會取代鍛造，但能救缺一兩個材料的尷尬。',
            vendorId: 'tinker',
            panel: count('iron_ore') > 0 ? 'exchange' : 'orders',
            tone: 'info'
        });

        cards.push({
            label: '情報與戰術',
            title: flags['town.casino.false_odds_exposed'] ? '進階戰術手記已流入市集' : '先整理剪報，情報才會變成商品',
            copy: flags['town.casino.false_odds_exposed']
                ? '米菈手上開始有攻擊節奏與致命判讀手記，適合在第二章後調整戰鬥手感。'
                : '材料索引、路線註記與手札情報會讓市集逐步長出更有用的貨架。',
            vendorId: 'rumor_broker',
            panel: flags['town.casino.false_odds_exposed'] ? 'shelf' : 'orders',
            tone: flags['town.casino.false_odds_exposed'] ? 'ready' : 'info'
        });

        if (flags.secretShopUnlocked || flags['world.clue.ash_ledger_page'] || flags['market.black_market.coal_token_traded']) {
            cards.push({
                label: '黑市捷徑',
                title: flags['market.black_market.coal_token_traded'] ? '煤印已經到手' : '灰燼帳冊可換成走私煤印',
                copy: flags['market.black_market.coal_token_traded']
                    ? '煤印會讓灰燼男爵線少走一段彎路，但代價已被記在暗巷裡。'
                    : '如果你已讀到灰燼帳冊缺頁，門縫掌櫃會賣出一枚不該存在的煤印。',
                vendorId: 'black_market',
                panel: 'exchange',
                tone: flags['market.black_market.coal_token_traded'] ? 'ready' : 'warning'
            });
        }

        return cards.slice(0, 6);
    }

    getQuestMaterialPrepCards() {
        const activeQuests = questManager.getActiveQuests?.() || [];
        const needsByItem = new Map();
        const marketGuides = {
            slime_jelly: {
                vendorId: 'apothecary_assistant',
                panel: 'shelf',
                title: '藥師要凝膠，先補藥再出門',
                copy: missing => `這個任務還缺 ${missing} 份史萊姆凝膠。凝膠要去南門外找史萊姆，出門前先把生命藥水補齊。`
            },
            beast_hide: {
                vendorId: 'tinker',
                panel: 'orders',
                title: '獸皮正在被委託需要',
                copy: missing => `這個任務還缺 ${missing} 張獸皮。先別把獸皮拿去賣掉；柏恩也能提醒哪些皮料該留給南門。`
            },
            iron_ore: {
                vendorId: 'tinker',
                panel: 'orders',
                title: '鐵礦石先別急著拆成鐵片',
                copy: missing => `這個任務還缺 ${missing} 個鐵礦石。若要拆成鐵片，先確認任務數量已經夠了。`
            },
            poison_gland: {
                vendorId: 'apothecary_assistant',
                panel: 'exchange',
                title: '毒腺任務進行中，也該備解毒劑',
                copy: missing => `這個任務還缺 ${missing} 份毒腺。叢林線容易把補給拖乾，藥棚能把多餘毒腺調成解毒劑。`
            },
            spider_silk: {
                vendorId: 'merchant',
                panel: 'orders',
                title: '蜘蛛絲能做成銀絲誘餌',
                copy: missing => `這個任務還缺 ${missing} 份蜘蛛絲。如果銀鐮伏獵者線也在推進，奧托能把蜘蛛絲變成可控誘餌。`
            },
            map_fragment: {
                vendorId: 'rumor_broker',
                panel: 'exchange',
                title: '地圖碎片可以換成路線註記',
                copy: missing => `這個任務還缺 ${missing} 張地圖碎片。米菈能把多餘碎片整理成更明確的路線註記。`
            }
        };

        activeQuests.forEach(quest => {
            (quest.objectives || []).forEach((objective, index) => {
                if (objective.type !== ObjectiveType.COLLECT) return;
                const target = objective.target;
                const guide = marketGuides[target];
                if (!target || !guide) return;

                const progress = quest.state?.progress?.[index] || {};
                const required = Number(progress.required ?? objective.count) || 0;
                const current = Number(progress.current) || 0;
                const missing = Math.max(0, required - current);
                if (missing <= 0) return;

                const item = getMarketItem(target);
                const existing = needsByItem.get(target) || {
                    target,
                    item,
                    guide,
                    missing: 0,
                    owned: this.getItemCount(target),
                    questNames: []
                };
                existing.missing += missing;
                if (!existing.questNames.includes(quest.name)) existing.questNames.push(quest.name);
                needsByItem.set(target, existing);
            });
        });

        return [...needsByItem.values()]
            .map(need => ({
                ...need,
                realShortage: Math.max(0, need.missing - need.owned)
            }))
            .sort((a, b) => {
                if (b.realShortage !== a.realShortage) return b.realShortage - a.realShortage;
                if (b.missing !== a.missing) return b.missing - a.missing;
                return a.target.localeCompare(b.target);
            })
            .map(need => {
                const inventoryText = need.realShortage > 0
                    ? `目前只有 ${need.owned}/${need.missing}，還差 ${need.realShortage}。`
                    : `目前已有 ${need.owned}/${need.missing}，重點是別誤賣或誤拆。`;
                const actionText = need.realShortage > 0
                    ? need.guide.copy(need.realShortage)
                    : `${need.item?.name || need.target} 已能滿足任務需求，回報前先保留在背包或倉庫。`;
                return {
                    label: need.realShortage > 0 ? '任務缺口' : '材料保留',
                    title: need.realShortage > 0 ? need.guide.title : `${need.item?.name || need.target} 已夠，先別亂用`,
                    copy: `${inventoryText}${actionText} 目前關聯：${need.questNames.slice(0, 2).join('、')}。`,
                    vendorId: need.guide.vendorId,
                    panel: need.guide.panel,
                    tone: need.realShortage > 0 ? 'warning' : 'ready'
                };
            });
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
                        data-panel="${escapeHtml(card.panel || 'shelf')}"
                    >前往</button>
                </div>
            </article>
        `;
    }

    getVendorFunctionList(vendor) {
        if (!vendor) return ['選擇攤位後查看功能'];
        const list = [];
        if ((vendor.shelves || []).length) list.push(`貨架：${vendor.shelves.length} 項`);
        if ((vendor.orders || []).length) list.push(`訂單：${vendor.orders.length} 項`);
        if ((vendor.exchanges || []).length) list.push(`交換：${vendor.exchanges.length} 項`);
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

    getPanelHint(vendor, panel) {
        if (panel === 'shelf') return '穩定供應會出現在這裡，強力裝備仍以掉落、圖紙與鍛造為主。';
        if (panel === 'orders') return '把冒險帶回來的材料交給需要的人，城鎮狀態與庫存會因此改變。';
        if (panel === 'exchange') return '多餘素材可以換成補給、路線工具或情報，不必只拿去賣掉。';
        return vendor.summary || '';
    }

    renderShelf(vendor) {
        const entries = vendor.shelves || [];
        if (entries.length === 0) return this.renderEmpty('貨架暫時空著', '這個人物目前沒有穩定供應品。');
        return entries.map(entry => this.renderShelfCard(entry)).join('');
    }

    renderOrders(vendor) {
        const entries = vendor.orders || [];
        const cards = entries.map(entry => this.renderSupplyEntryCard(entry, 'order'));
        if (vendor.id === 'tinker') cards.unshift(this.renderBackpackUpgradeCard());
        if (cards.length === 0) return this.renderEmpty('沒有新的訂單', '這條供應線目前沒有需要你處理的委託。');
        return cards.join('');
    }

    renderExchanges(vendor) {
        const entries = vendor.exchanges || [];
        if (entries.length === 0) return this.renderEmpty('沒有交換項目', '這個人物目前沒有開出材料交換。');
        return entries.map(entry => this.renderSupplyEntryCard(entry, 'exchange')).join('');
    }

    renderBackpackUpgradeCard() {
        const status = GameManager.getInventoryUpgradeStatus?.();
        if (!status) return '';

        const { current, next, requirements, canUpgrade } = status;
        const capacity = GameManager.state.inventoryCapacity || current?.capacity || 10;
        const blockedLabel = next ? '材料不足' : '已達最大';
        return `
            <article class="supply-card supply-contract backpack-upgrade-section ${!next ? 'is-completed' : ''}">
                <div class="supply-card-copy contract-copy">
                    <span>修補匠委託</span>
                    <h3>背包擴充</h3>
                    <p>讓修補匠把目前的${escapeHtml(current?.label || '行囊')}加固改造。背包限制外出拾取量，倉庫仍保留城鎮素材。</p>
                    <div class="contract-flow">
                        <div>
                            <b>需要</b>
                            ${this.renderBackpackRequirementList(requirements, next)}
                        </div>
                        <div>
                            <b>回饋</b>
                            <span class="contract-token is-reward">
                                <span class="contract-token-icon">＋</span>
                                ${next ? `容量 ${capacity} → ${next.capacity}` : `容量 ${capacity}`}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="supply-card-side">
                    <strong>${escapeHtml(current?.label || '行囊')}</strong>
                    <button type="button" data-supply-action="upgrade-backpack" ${next && canUpgrade ? '' : 'disabled'}>
                        ${next && canUpgrade ? '委託擴充' : blockedLabel}
                    </button>
                </div>
            </article>
        `;
    }

    renderBackpackRequirementList(requirements = [], next = null) {
        if (!next) return '<span class="contract-token is-ready">已擴充到最大</span>';
        if (!requirements.length) return '<span class="contract-token is-ready">無</span>';

        return requirements.map(requirement => {
            const item = this.resolveItem(requirement.id);
            const owned = Math.max(0, Number(requirement.owned) || 0);
            const need = Math.max(1, Number(requirement.quantity) || 1);
            return `
                <span class="contract-token ${owned >= need ? 'is-ready' : 'is-missing'}">
                    ${this.renderItemIcon(item, 'contract-token-icon')}
                    ${escapeHtml(item?.name || requirement.id)} ${owned}/${need}
                </span>
            `;
        }).join('');
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

    renderSupplyEntryCard(entry, type) {
        const id = `${type}:${entry.id}`;
        const completed = this.isEntryCompleted(type, entry);
        const conditionMet = this.meetsCondition(entry.condition);
        const canComplete = conditionMet && !completed && this.canPayEntry(entry);
        this.entryIndex.set(id, { ...entry, entryKey: entry.id, actionId: id, entryType: type });

        return `
            <article class="supply-card supply-contract ${completed ? 'is-completed' : ''} ${conditionMet ? '' : 'is-locked'}">
                <div class="supply-card-copy contract-copy">
                    <span>${escapeHtml(type === 'order' ? '供應訂單' : '材料交換')}</span>
                    <h3>${escapeHtml(entry.title)}</h3>
                    <p>${escapeHtml(conditionMet ? entry.story : entry.lockedReason || '條件尚未達成。')}</p>
                    <div class="contract-flow">
                        <div>
                            <b>需要</b>
                            ${this.renderRequirementList(entry)}
                        </div>
                        <div>
                            <b>回饋</b>
                            ${this.renderRewardList(entry)}
                        </div>
                    </div>
                </div>
                <div class="supply-card-side">
                    <button type="button" data-supply-action="complete" data-entry-id="${escapeHtml(id)}" ${canComplete ? '' : 'disabled'}>
                        ${completed ? '已完成' : canComplete ? '交付' : this.getBlockedEntryLabel(entry)}
                    </button>
                </div>
            </article>
        `;
    }

    renderRequirementList(entry) {
        const rows = [];
        for (const requirement of entry.requirements || []) {
            const item = this.resolveItem(requirement.itemId);
            const have = this.getItemCount(requirement.itemId);
            const need = Math.max(1, Number(requirement.quantity) || 1);
            rows.push(`
                <span class="contract-token ${have >= need ? 'is-ready' : 'is-missing'}">
                    ${this.renderItemIcon(item, 'contract-token-icon')}
                    ${escapeHtml(item?.name || requirement.itemId)} ${have}/${need}
                </span>
            `);
        }
        if (entry.goldCost) {
            const gold = this.getPlayerGold();
            rows.push(`
                <span class="contract-token ${gold >= entry.goldCost ? 'is-ready' : 'is-missing'}">
                    <span class="contract-token-icon">G</span> 金幣 ${gold}/${entry.goldCost}
                </span>
            `);
        }
        return rows.length ? rows.join('') : '<span class="contract-token is-ready">無</span>';
    }

    renderRewardList(entry) {
        const rewards = entry.rewards || {};
        const rows = [];
        for (const reward of rewards.items || []) {
            const item = this.resolveItem(reward.itemId);
            rows.push(`
                <span class="contract-token is-reward">
                    ${this.renderItemIcon(item, 'contract-token-icon')}
                    ${escapeHtml(item?.name || reward.itemId)} x${Math.max(1, Number(reward.quantity) || 1)}
                </span>
            `);
        }
        if (rewards.gold) {
            rows.push(`<span class="contract-token is-reward"><span class="contract-token-icon">G</span> 金幣 ${rewards.gold}</span>`);
        }
        if (rewards.flags?.length) {
            rows.push('<span class="contract-token is-reward">城鎮狀態更新</span>');
        }
        if (rewards.interactionId) {
            rows.push('<span class="contract-token is-reward">特殊事件觸發</span>');
        }
        return rows.length ? rows.join('') : '<span class="contract-token is-reward">供應線更新</span>';
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

        if (window.ItemDetailModal) {
            const flowDescription = mode === 'buy'
                ? `購買後會放入背包。目前持有 ${this.getPlayerGold()} 金幣。`
                : `出售 ${quantity > 1 ? `x${quantity} ` : ''}後會獲得 ${price} 金幣，物品會從背包移除。`;
            window.ItemDetailModal.open(item, {
                ...buildItemModalOptions(item, { description: flowDescription }),
                action: mode,
                priceLabel: mode === 'buy' ? '購買價' : '出售價',
                actions: [actionBtn, cancelBtn]
            });
        }
    }

    closeItemModal() {
        if (window.ItemDetailModal && typeof window.ItemDetailModal.close === 'function') {
            window.ItemDetailModal.close();
        }
    }

    consumePassiveUnlockText() {
        const unlockedEffects = GameManager.consumePassiveCombatUnlocks?.() || [];
        if (unlockedEffects.length === 0) return '';
        const names = unlockedEffects.map(effect => effect.name).join('、');
        return `戰術技能解鎖：${names}。可回大廳旅人卡片更換。`;
    }

    handleBuy(trade) {
        const { item, quantity, price } = trade;
        const itemName = item.name || '物品';

        if (item?.passiveEffectId && GameManager.hasPassiveCombatEffectAchievement?.(item.passiveEffectId)) {
            this.closeItemModal();
            this.showFeedback('已解鎖', `「${itemName}」已轉為戰術成就，不需要重複購買。`, 'info');
            return;
        }

        if (this.getPlayerGold() < price || !GameManager.removeGold(price)) {
            audioManager.play('toast-error', { throttleKey: 'market-buy-failed', throttleMs: 180 });
            this.showFeedback('金幣不足', `無法購買「${itemName}」，目前持有 ${this.getPlayerGold()} 金幣。`, 'error');
            return;
        }

        const purchasedItem = cloneItemData(item);
        if (purchasedItem?.passiveEffectId) {
            const unlockResult = GameManager.unlockPassiveCombatEffectAchievement?.(purchasedItem.passiveEffectId, purchasedItem);
            if (!unlockResult?.success) {
                GameManager.addGold(price);
                this.showFeedback('解鎖失敗', `「${itemName}」沒有對應的戰術成就。`, 'error');
                return;
            }

            GameManager.markSaveDirty?.('market-passive-achievement');
            this.closeItemModal();
            audioManager.play('reward', { throttleKey: 'market-passive-unlock', throttleMs: 180 });
            this.showFeedback(
                unlockResult.alreadyUnlocked ? '已解鎖' : '戰術成就解鎖',
                unlockResult.alreadyUnlocked
                    ? `「${itemName}」已經記入戰術欄。`
                    : `學會「${unlockResult.effect?.name || itemName}」，可在角色欄的戰術技能中查看。`,
                'success'
            );
            return;
        }

        const added = GameManager.addToInventory(purchasedItem, quantity);
        if (!added) {
            GameManager.addGold(price);
            audioManager.play('toast-error', { throttleKey: 'market-buy-full', throttleMs: 180 });
            this.showFeedback('背包已滿', `「${itemName}」無法放入背包，金幣已退回。`, 'error');
            return;
        }

        GameManager.markSaveDirty?.('market-buy');
        this.closeItemModal();
        audioManager.play('coin', { throttleKey: 'market-buy-success', throttleMs: 180 });
        const unlockText = this.consumePassiveUnlockText();
        this.showFeedback(
            '購買完成',
            `已購買「${itemName}」，花費 ${price} 金幣。${unlockText ? ` ${unlockText}` : ''}`,
            'success'
        );
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
            audioManager.play('toast-error', { throttleKey: 'market-sell-failed', throttleMs: 180 });
            this.showFeedback('出售失敗', `找不到「${itemName}」，請重新整理背包後再試。`, 'error');
            return;
        }

        GameManager.markSaveDirty?.('market-sell');
        this.closeItemModal();
        audioManager.play('coin', { throttleKey: 'market-sell-success', throttleMs: 180 });
        this.showFeedback('出售完成', `已出售「${itemName}」${quantity > 1 ? `x${quantity}` : ''}，獲得 ${earnedGold} 金幣。`, 'success');
    }

    handleBackpackUpgrade() {
        const status = GameManager.getInventoryUpgradeStatus?.();
        if (!status?.next) {
            audioManager.play('toast-warning', { throttleKey: 'market-backpack-max', throttleMs: 180 });
            this.showFeedback('背包已滿階', '目前行囊容量已擴充到最大。', 'info');
            return;
        }

        if (!status.canUpgrade) {
            audioManager.play('toast-warning', { throttleKey: 'market-backpack-materials', throttleMs: 180 });
            this.showFeedback('材料不足', '先收集需要的素材，再回市集找修補匠擴充。', 'warning');
            return;
        }

        const success = GameManager.upgradeInventoryCapacity?.();
        if (!success) {
            audioManager.play('toast-error', { throttleKey: 'market-backpack-failed', throttleMs: 180 });
            this.showFeedback('擴充失敗', '材料狀態剛剛改變，請重新確認委託需求。', 'error');
            this.renderCurrentPanel();
            return;
        }

        audioManager.play('reward', { throttleKey: 'market-backpack-success', throttleMs: 180 });
        this.showFeedback('背包已擴充', `容量提升到 ${GameManager.state.inventoryCapacity} 格。`, 'success');
        this.renderCurrentPanel();
        this.renderPlayerInventory(GameManager.state.inventory || []);
    }

    completeSupplyEntry(entry) {
        if (!entry || this.isEntryCompleted(entry.entryType, entry) || !this.canPayEntry(entry)) return;

        if (entry.rewards?.interactionId) {
            const outcome = worldInteractionManager.trigger(entry.rewards.interactionId, {
                source: 'market_exchange',
                shopId: this.currentVendorId,
                toast: false
            });
            const message = outcome.messages?.join(' ') || '供應線有了新的反應。';
            if (outcome.success) this.markEntryCompleted(entry.entryType, entry);
            audioManager.play(outcome.success ? 'reward' : 'toast-warning', {
                throttleKey: 'market-interaction-exchange',
                throttleMs: 180
            });
            this.showFeedback(outcome.success ? '交換完成' : '交換失敗', message, outcome.success ? 'success' : 'warning');
            this.renderCurrentPanel();
            return;
        }

        if (!this.consumeEntryCost(entry)) {
            audioManager.play('toast-warning', { throttleKey: 'market-exchange-failed', throttleMs: 180 });
            this.showFeedback('材料不足', '你身上的材料或金幣不足。', 'warning');
            return;
        }

        const rewards = entry.rewards || {};
        const rewardTexts = [];
        if (rewards.gold) {
            GameManager.addGold(rewards.gold);
            rewardTexts.push(`${rewards.gold} 金幣`);
        }
        for (const reward of rewards.items || []) {
            const item = this.resolveItem(reward.itemId);
            const quantity = Math.max(1, Number(reward.quantity) || 1);
            if (item) {
                const addedToInventory = GameManager.addToInventory(item, quantity);
                const addedToWarehouse = !addedToInventory && typeof GameManager.addToWarehouse === 'function'
                    ? GameManager.addToWarehouse(item, quantity)
                    : false;
                if (addedToInventory || addedToWarehouse) {
                    rewardTexts.push(`${item.name} x${quantity}${addedToWarehouse ? '（倉庫）' : ''}`);
                }
            }
        }
        for (const flag of rewards.flags || []) {
            GameManager.setFlag(flag, true);
        }

        this.markEntryCompleted(entry.entryType, entry);
        GameManager.markSaveDirty?.('market-supply-entry');
        audioManager.play('reward', { throttleKey: 'market-exchange-success', throttleMs: 180 });
        const unlockText = this.consumePassiveUnlockText();
        this.showFeedback(
            entry.entryType === 'order' ? '訂單完成' : '交換完成',
            `${rewardTexts.length ? `取得 ${rewardTexts.join('、')}。` : '城鎮供應線已更新。'}${unlockText ? ` ${unlockText}` : ''}`,
            'success'
        );
        this.renderCurrentPanel();
    }

    canPayEntry(entry) {
        if ((entry.goldCost || 0) > this.getPlayerGold()) return false;
        return (entry.requirements || []).every(requirement => {
            const need = Math.max(1, Number(requirement.quantity) || 1);
            return this.getItemCount(requirement.itemId) >= need;
        });
    }

    consumeEntryCost(entry) {
        if ((entry.goldCost || 0) > 0 && !GameManager.removeGold(entry.goldCost)) return false;
        for (const requirement of entry.requirements || []) {
            const quantity = Math.max(1, Number(requirement.quantity) || 1);
            if (!GameManager.removeMaterial(requirement.itemId, quantity)) return false;
        }
        return true;
    }

    getBlockedEntryLabel(entry) {
        if (!this.meetsCondition(entry.condition)) return '尚未開放';
        if ((entry.goldCost || 0) > this.getPlayerGold()) return '金幣不足';
        return '材料不足';
    }

    isEntryCompleted(type, entry) {
        if (entry.repeatable) return false;
        return Boolean(GameManager.getFlag(this.getEntryCompletedFlag(type, entry.entryKey || entry.id || entry.entryId)));
    }

    markEntryCompleted(type, entry) {
        if (entry.repeatable) return;
        GameManager.setFlag(this.getEntryCompletedFlag(type, entry.entryKey || entry.id || entry.entryId), true);
    }

    getEntryCompletedFlag(type, entryId) {
        return `market.${type}.${entryId}.completed`;
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
        const countIn = stacks => (stacks || [])
            .filter(stack => stack?.item?.id === itemId)
            .reduce((sum, stack) => sum + stackQuantity(stack), 0);
        return countIn(GameManager.state?.inventory) + countIn(GameManager.state?.warehouse);
    }

    getPlayerGold() {
        if (typeof GameManager.getGold === 'function') return Number(GameManager.getGold()) || 0;
        return Number(GameManager.state?.character?.gold) || 0;
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
