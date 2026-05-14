import { getSellPrice } from '../models/ItemSchema.js';
import {
    formatAffixStats,
    escapeHtml,
    getItemDisplayDescription,
    getItemTypeText,
    getStatIcon,
    getStatLabel,
    isPercentStat,
    normalizeMultiplierPercentValue,
    normalizePercentValue
} from '../utils/ItemDisplay.js';

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
                        <div class="item-detail-stats"></div>
                        <div class="item-detail-potion-effects is-hidden"></div>
                        <div class="item-detail-affixes is-hidden"></div>
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

        if (!isPotion || !(item.hp || item.mp || item.effect)) return '';

        const rows = [];
        if (item.hp) {
            rows.push(`<div class="stat-row"><div class="stat-left"><div class="stat-label">❤️ <span>生命</span></div></div><div class="stat-right"><span class="stat-base">+${escapeHtml(item.hp)}</span></div></div>`);
        }
        if (item.mp) {
            rows.push(`<div class="stat-row"><div class="stat-left"><div class="stat-label">💙 <span>魔力</span></div></div><div class="stat-right"><span class="stat-base">+${escapeHtml(item.mp)}</span></div></div>`);
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

        // stats: support structured `opts.stats` (array) OR `opts.statsHtml` (raw HTML)
        // We'll auto-build a structured view if item has stats or affixes, overriding statsHtml if needed.
        // This ensures the aggregated base + (+bonus) format is always shown.
        if (!Array.isArray(opts.stats) && item) {
            const affixContribs = {};
            const addContribution = (key, rawValue) => {
                if (rawValue === undefined || rawValue === null || rawValue === 0) return;

                const number = Number(rawValue);
                if (!Number.isFinite(number)) return;

                const displayValue = isPercentStat(key) ? normalizePercentValue(number) : number;
                if (displayValue === 0) return;

                const displayKey = key === 'attackSpeed' ? 'attackSpeedBonus' : key;
                affixContribs[displayKey] = (affixContribs[displayKey] || 0) + displayValue;
            };

            if (Array.isArray(item.affixes) && item.affixes.length > 0) {
                item.affixes.forEach(aff => {
                    if (!aff || !aff.stats) return;
                    for (const [key, value] of Object.entries(aff.stats)) {
                        addContribution(key, value);
                    }
                });
            }

            if (Object.keys(affixContribs).length === 0 && item.affixBonuses) {
                for (const [key, value] of Object.entries(item.affixBonuses)) {
                    addContribution(key, value);
                }
            }

            if (Array.isArray(item.specialEffects) && item.specialEffects.length > 0) {
                item.specialEffects.forEach(eff => {
                    if (!eff || !eff.type) return;
                    addContribution(String(eff.type), eff.value);
                });
            }

            const hasBaseStats = item.atk || item.attack || item.def || item.defense || item.hp || item.mp || item.durability || item.dur || item.durabilityMax || item.critChance || item.critDamage || item.attackSpeed;
            const hasAffixContribs = Object.keys(affixContribs).length > 0;

            if (hasBaseStats || hasAffixContribs) {
                const built = [];
                const readBase = (baseVal, format = 'number') => {
                    if (baseVal === undefined || baseVal === null) return undefined;

                    const number = Number(baseVal);
                    if (!Number.isFinite(number)) return undefined;

                    if (format === 'percent') return normalizePercentValue(number);
                    if (format === 'multiplierPercent') return normalizeMultiplierPercentValue(number);
                    return number;
                };
                const push = (key, icon, label, baseVal, format = 'number') => {
                    const base = readBase(baseVal, format);
                    const bonus = affixContribs[key] || 0;
                    if ((base !== undefined && base !== 0) || bonus !== 0) {
                        const suffix = (key === 'attackSpeed') ? 's' : (format === 'percent' || format === 'multiplierPercent' ? '%' : '');
                        built.push({ key, icon, label, base: base || 0, bonus, suffix });
                    }
                };

                push('atk', getStatIcon('atk'), getStatLabel('atk'), item.atk ?? item.attack);
                push('def', getStatIcon('def'), getStatLabel('def'), item.def ?? item.defense);
                push('durability', getStatIcon('durability'), getStatLabel('durability'), item.durability ?? item.dur ?? item.durabilityMax);
                push('hp', getStatIcon('hp'), getStatLabel('hp'), item.hp);
                push('mp', getStatIcon('mp'), getStatLabel('mp'), item.mp);
                push('critChance', getStatIcon('critChance'), getStatLabel('critChance'), item.critChance, 'percent');
                push('critDamage', getStatIcon('critDamage'), getStatLabel('critDamage'), item.critDamage, 'multiplierPercent');
                push('attackSpeed', getStatIcon('attackSpeed'), getStatLabel('attackSpeed'), item.attackSpeed);

                for (const [k, v] of Object.entries(affixContribs)) {
                    if (built.find(b => b.key === k)) continue;
                    if (!v || v === 0) continue;
                    built.push({ key: k, icon: getStatIcon(k), label: getStatLabel(k), base: 0, bonus: v, suffix: isPercentStat(k) ? '%' : '' });
                }

                if (built.length > 0) {
                    opts.stats = built;
                }
            }
        }

        // helper to render effect objects (avoid [object Object])
        const renderEffectHtml = (eff) => {
            if (eff === undefined || eff === null) return '';
            if (typeof eff === 'string' || typeof eff === 'number') return String(eff);
            if (typeof eff === 'object') {
                const parts = [];
                if (eff.hp) parts.push(`<span class="item-effect-part">❤️ 恢復 ${escapeHtml(eff.hp)} 生命</span>`);
                if (eff.mp) parts.push(`<span class="item-effect-part">💙 恢復 ${escapeHtml(eff.mp)} 魔力</span>`);
                if (eff.exp) parts.push(`<span class="item-effect-part">✨ 經驗 +${escapeHtml(eff.exp)}</span>`);
                if (eff.duration) parts.push(`<span class="item-effect-part">⏳ 持續 ${escapeHtml(eff.duration)}s</span>`);
                // generic remaining keys
                for (const [k, v] of Object.entries(eff)) {
                    if (['hp','mp','exp','duration'].includes(k)) continue;
                    parts.push(`<span class="item-effect-part">${escapeHtml(k.replace(/([A-Z])/g, ' $1'))}: ${escapeHtml(v)}</span>`);
                }
                return parts.join(' • ');
            }
            return String(eff);
        };

        if (Array.isArray(opts.stats)) {
            // build comparison rows with aligned label/value columns
            // helper to format numbers and percentages
            const formatValue = (val, suffix) => {
                const v = (val === undefined || val === null) ? 0 : Number(val);
                if (suffix === '%') {
                    return (Math.abs(v % 1) > 0 ? v.toFixed(2) : v.toFixed(0)) + '%';
                }
                if (suffix === 's') {
                    // val is attacks per second -> convert to seconds per attack
                    if (v <= 0) return '—';
                    const sec = 1 / v;
                    return (Math.abs(sec % 1) > 0 ? sec.toFixed(2) : sec.toFixed(0)) + ' Sec/Hit';
                }
                return (Math.abs(v % 1) > 0 ? v.toFixed(2) : v.toFixed(0));
            };

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
                    totalPart = `<span class="stat-base">${formatValue(totalVal, s.suffix)}</span>`;
                    if (bonusVal !== 0) {
                        const diffSec = (baseSec !== null && isFinite(baseSec) && isFinite(totalSec)) ? (totalSec - baseSec) : 0;
                        const sign = diffSec < 0 ? '' : '+'; // negative means faster
                        const diffStr = (Math.abs(diffSec) % 1 > 0) ? Math.abs(diffSec).toFixed(2) : Math.abs(diffSec).toFixed(0);
                        bonusPart = `<span class="stat-bonus">(${sign}${diffStr}s)</span>`;
                    }
                } else {
                    totalPart = `<span class="stat-base">${formatValue(totalVal, s.suffix)}</span>`;
                    bonusPart = (bonusVal !== 0)
                        ? `<span class="stat-bonus">(+${formatValue(bonusVal, s.suffix)})</span>`
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
        }, 240);
    }

    isOpen() {
        return this.container.classList.contains('active');
    }
}

// expose singleton
window.ItemDetailModal = new ItemDetailModal();

export default window.ItemDetailModal;
