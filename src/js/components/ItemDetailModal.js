import { getSellPrice } from '../models/ItemSchema.js';
import GameManager from '../managers/GameManager.js';
import {
    buildItemStatEntries,
    formatAffixStats,
    escapeHtml,
    formatItemStatEntryValue,
    getItemDisplayDescription,
    getItemTypeText
} from '../utils/ItemDisplay.js';
import { buildItemSetInfoHtml } from '../utils/SetDisplay.js';

class ItemDetailModal {
    constructor() {
        this._build();
        this._bindEvents();
    }

    _build() {
        this.container = document.createElement('div');
        this.container.className = 'modal component-item-detail-modal';
        this.container.style.display = 'none';

        this.container.innerHTML = `
            <div class="modal-content">
                <div class="modal-header"><div class="modal-title">物品詳情</div></div>
                <div class="modal-body">
                    <div class="item-detail-header">
                        <div class="item-detail-icon"></div>
                        <div class="item-detail-title">
                            <div class="item-detail-name"></div>
                            <div class="item-detail-type"></div>
                        </div>
                    </div>
                    <div class="item-detail-main-grid">
                        <div class="item-detail-stats"></div>
                        <div class="item-detail-side">
                            <div class="item-detail-set is-hidden"></div>
                            <div class="item-detail-affixes is-hidden"></div>
                        </div>
                    </div>
                        <div class="item-detail-potion-effects is-hidden"></div>
                        <div class="item-detail-description"></div>
                </div>
                <div class="modal-footer">
                    <div class="item-detail-price"></div>
                    <div class="item-detail-actions"></div>
                    <button class="btn btn-secondary modal-close-btn">關閉</button>
                </div>
            </div>`;

        document.body.appendChild(this.container);

        this.iconEl = this.container.querySelector('.item-detail-icon');
        this.nameEl = this.container.querySelector('.item-detail-name');
        this.typeEl = this.container.querySelector('.item-detail-type');
        this.statsEl = this.container.querySelector('.item-detail-stats');
        this.setEl = this.container.querySelector('.item-detail-set');
        this.affixesEl = this.container.querySelector('.item-detail-affixes');
        this.priceEl = this.container.querySelector('.item-detail-price');
        this.descEl = this.container.querySelector('.item-detail-description');
        this.actionsEl = this.container.querySelector('.item-detail-actions');
        this.closeBtn = this.container.querySelector('.modal-close-btn');
    }

    _bindEvents() {
        this.closeBtn.addEventListener('click', () => this.close());
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container) this.close();
        });
    }

    _renderPotionRows(item, opts, renderEffectHtml) {
        const isPotion = (
            item &&
            (item.type === 'potion' || item.type === 'consumable')
        ) || (
            opts &&
            opts.typeText &&
            String(opts.typeText).toLowerCase().includes('potion')
        );

        if (!isPotion || !(item.hp || item.effect)) return '';

        const rows = [];
        if (item.hp) {
            rows.push(`<div class="stat-row"><div class="stat-left"><div class="stat-label">❤️ <span>生命</span></div></div><div class="stat-right"><span class="stat-base">+${escapeHtml(item.hp)}</span></div></div>`);
        }
        if (item.effect) {
            rows.push(`<div class="stat-row"><div class="stat-left"><div class="stat-label">✨ <span>效果</span></div></div><div class="stat-right"><span class="stat-effect-value">${renderEffectHtml(item.effect)}</span></div></div>`);
        }

        return rows.join('');
    }

    open(item = {}, opts = {}) {
        // basic content
        this.iconEl.innerHTML = '';
        if (item.image) {
            const image = document.createElement('img');
            image.className = 'item-detail-image';
            image.src = item.image;
            image.alt = item.name || opts.title || '物品圖片';
            this.iconEl.appendChild(image);
        } else {
            this.iconEl.textContent = item.icon || '📦';
        }
        // name with rarity color class
        const rarity = (item.rarity || '').toLowerCase();
        this.nameEl.className = 'item-detail-name';
        if (rarity) this.nameEl.classList.add(`rarity-${rarity}`);
        this.nameEl.textContent = item.name || opts.title || '物品名稱';
        this.typeEl.textContent = opts.typeText || getItemTypeText(item.type);
        this.descEl.textContent = opts.description || getItemDisplayDescription(item, '');

        // stats: support structured `opts.stats` (array) OR `opts.statsHtml` (raw HTML).
        // Equipment stat rows are centralized in ItemDisplay so hover cards and detail modals stay aligned.
        if (!Array.isArray(opts.stats) && item) {
            const built = buildItemStatEntries(item, { includePotionRecovery: false });
            if (built.length > 0) opts.stats = built;
        }

        // helper to render effect objects (avoid [object Object])
        const renderEffectHtml = (eff) => {
            if (eff === undefined || eff === null) return '';
            if (typeof eff === 'string' || typeof eff === 'number') return String(eff);
            if (typeof eff === 'object') {
                const parts = [];
                if (eff.hp) parts.push(`<span class="item-effect-part">❤️ 恢復 ${escapeHtml(eff.hp)} 生命</span>`);
                if (eff.exp) parts.push(`<span class="item-effect-part">✨ 經驗 +${escapeHtml(eff.exp)}</span>`);
                if (eff.duration) parts.push(`<span class="item-effect-part">⏳ 持續 ${escapeHtml(eff.duration)}s</span>`);
                // generic remaining keys
                for (const [k, v] of Object.entries(eff)) {
                    if (['hp','exp','duration'].includes(k)) continue;
                    parts.push(`<span class="item-effect-part">${escapeHtml(k.replace(/([A-Z])/g, ' $1'))}: ${escapeHtml(v)}</span>`);
                }
                return parts.join(' • ');
            }
            return String(eff);
        };

        if (Array.isArray(opts.stats)) {
            // build comparison rows with aligned label/value columns
            // helper to format numbers and percentages
            const formatValue = (val, stat = null, prefix = '') => formatItemStatEntryValue(stat || {}, val, {
                includeMax: true,
                prefix
            });

            const rows = opts.stats.map(s => {
                const iconHtml = s.icon ? `<span class="stat-icon">${escapeHtml(s.icon)}</span>` : '';
                const labelHtml = `<div class="stat-left"><div class="stat-label">${iconHtml}<span>${escapeHtml(s.label)}</span></div></div>`;
                const baseVal = (s.base !== undefined && s.base !== null) ? Number(s.base) : 0;
                const bonusVal = (s.bonus !== undefined && s.bonus !== null) ? Number(s.bonus) : 0;
                const totalVal = baseVal + bonusVal;
                let totalPart;
                let bonusPart = '';
                if (s.suffix === 's') {
                    // show seconds per attack and delta in seconds
                    const baseSec = baseVal ? (baseVal === 0 ? Infinity : (1 / Number(baseVal))) : null;
                    const totalSec = totalVal === 0 ? Infinity : (1 / Number(totalVal));
                    totalPart = `<span class="stat-base">${formatValue(totalVal, s, '')}</span>`;
                    if (bonusVal !== 0) {
                        const diffSec = (baseSec !== null && isFinite(baseSec) && isFinite(totalSec)) ? (totalSec - baseSec) : 0;
                        const sign = diffSec < 0 ? '' : '+'; // negative means faster
                        const diffStr = (Math.abs(diffSec) % 1 > 0) ? Math.abs(diffSec).toFixed(2) : Math.abs(diffSec).toFixed(0);
                        bonusPart = `<span class="stat-bonus">(${sign}${diffStr}s)</span>`;
                    }
                } else {
                    const totalPrefix = s.key === 'durability' || s.suffix === 'x' || s.suffix === 'critMultiplier' ? '' : '+';
                    totalPart = `<span class="stat-base">${formatValue(totalVal, s, totalPrefix)}</span>`;
                    const bonusSign = bonusVal > 0 ? '+' : '-';
                    bonusPart = (bonusVal !== 0)
                        ? `<span class="stat-bonus">(${bonusSign}${formatValue(Math.abs(bonusVal), s, '')})</span>`
                        : '';
                }
                const valueHtml = `<div class="stat-right">${totalPart}${bonusPart}</div>`;
                return `<div class="stat-row">${labelHtml}${valueHtml}</div>`;
            }).join('');
            const potionRowsHtml = this._renderPotionRows(item, opts, renderEffectHtml);

            this.statsEl.innerHTML = potionRowsHtml + `<div class="stats-compare">${rows}</div>`;
        } else if (opts.statsHtml !== undefined) {
            // If the caller provided raw stats HTML (shop does this for potions), make sure potion lines
            // are included at the top so the displayed position matches the shop layout.
            const potionHtml = this._renderPotionRows(item, opts, renderEffectHtml);

            this.statsEl.innerHTML = (potionHtml || '') + (opts.statsHtml || '');
        } else {
            this.statsEl.innerHTML = '';
        }

        const setHtml = opts.setHtml ?? buildItemSetInfoHtml(item, GameManager.state, { compact: false });
        if (setHtml) {
            this.setEl.innerHTML = setHtml;
            this.setEl.classList.remove('is-hidden');
        } else {
            this.setEl.innerHTML = '';
            this.setEl.classList.add('is-hidden');
        }

        // affixes / forge attributes area (show in body, horizontally). Accepts `opts.forgeAttrs` as array or HTML string
        const renderAffixPill = (affix) => {
            const rawRarity = (affix.rarity || '').toLowerCase();
            const rarity = ['common', 'uncommon', 'rare', 'epic', 'legendary'].includes(rawRarity) ? rawRarity : 'common';
            const stats = affix.stats ? formatAffixStats(affix.stats) : '';

            return `
                <div class="affix-pill rarity-${rarity}">
                    <div class="affix-pill-name">${escapeHtml(affix.name || '詞綴')}</div>
                    <div class="affix-pill-stats">${escapeHtml(stats)}</div>
                </div>`;
        };

        // If explicit forgeAttrs provided, render them; else if item.affixes exists, render those horizontally.
        if (opts.forgeAttrs) {
            if (Array.isArray(opts.forgeAttrs)) {
                const html = opts.forgeAttrs.map(f => typeof f === 'string' ? `<div class="forge-attr-pill">${f}</div>` : renderAffixPill(f)).join('');
                this.affixesEl.innerHTML = `<div class="affix-list">${html}</div>`;
                this.affixesEl.classList.remove('is-hidden');
            } else {
                this.affixesEl.innerHTML = `${opts.forgeAttrs}`;
                this.affixesEl.classList.remove('is-hidden');
            }
        } else if (item && Array.isArray(item.affixes) && item.affixes.length > 0) {
            const html = item.affixes.map(a => renderAffixPill(a)).join('');
            this.affixesEl.innerHTML = `<div class="affix-list">${html}</div>`;
            this.affixesEl.classList.remove('is-hidden');
        } else {
            this.affixesEl.classList.add('is-hidden');
            this.affixesEl.innerHTML = '';
        }

        this.container.classList.toggle(
            'has-detail-side',
            !this.setEl.classList.contains('is-hidden') || !this.affixesEl.classList.contains('is-hidden')
        );

        // Note: forge/affix bonuses are now merged into `opts.stats` above so there's no separate forge block.

        // actions: accept DOM elements array
        this.actionsEl.innerHTML = '';
        if (Array.isArray(opts.actions)) {
            opts.actions.forEach(a => {
                if (a instanceof HTMLElement) this.actionsEl.appendChild(a);
            });
        }

        // Price logic:
        // - compute canonical sellPrice (item.sellPrice or floor(item.price/2))
        // - if opts.action === 'sell' -> show sellPrice
        // - else if opts.action === 'buy' -> show item.price
        // - else if opts.price provided -> show opts.price
        // - otherwise default to sellPrice (prioritize showing sell price)
        const canonicalSellPrice = (item && typeof item.sellPrice === 'number')
            ? item.sellPrice
            : (item && typeof item.price === 'number' ? getSellPrice(item) : null);
        const canonicalBuyPrice = (item && typeof item.price === 'number') ? item.price : null;

        let priceToShow = null;
        if (opts && opts.action === 'sell') {
            priceToShow = canonicalSellPrice;
        } else if (opts && opts.action === 'buy') {
            priceToShow = canonicalBuyPrice;
        } else if (opts && opts.price !== undefined) {
            priceToShow = opts.price;
        } else {
            priceToShow = canonicalSellPrice;
        }

        if (this.priceEl) {
            if (priceToShow !== null && priceToShow !== undefined) {
                // Determine label
                let priceLabel = '價格';
                if (opts && opts.priceLabel) priceLabel = opts.priceLabel;
                else if (opts && opts.action === 'sell') priceLabel = '出售';
                else if (opts && opts.action === 'buy') priceLabel = '購買';
                else priceLabel = (item && item.sellPrice !== undefined) ? '價值' : '價格';

                this.priceEl.innerHTML = `<span class="item-detail-price-icon">💰</span> ${escapeHtml(priceToShow)} <span class="item-detail-price-label">${escapeHtml(priceLabel)}</span>`;
            } else {
                this.priceEl.innerHTML = '';
            }
        }

        // show
        this.container.style.display = 'flex';
        requestAnimationFrame(() => this.container.classList.add('active'));
    }

    close() {
        this.container.classList.remove('active');
        setTimeout(() => {
            this.container.style.display = 'none';
            // clear content to avoid stale handlers
            this.actionsEl.innerHTML = '';
            if (this.priceEl) this.priceEl.innerHTML = '';
            this.container.classList.remove('has-detail-side');
        }, 240);
    }

    isOpen() {
        return this.container.classList.contains('active');
    }
}

// expose singleton
window.ItemDetailModal = new ItemDetailModal();

export default window.ItemDetailModal;
