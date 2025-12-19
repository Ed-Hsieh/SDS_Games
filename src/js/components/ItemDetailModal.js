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
                        <div class="item-detail-stats" style="padding:12px;border-radius:10px;background:linear-gradient(135deg,rgba(255,255,255,0.02),rgba(0,0,0,0.04));margin-bottom:8px;"></div>
                        <div class="item-detail-potion-effects" style="display:none;margin-bottom:8px;"></div>
                        <div class="item-detail-affixes" style="display:none;margin-bottom:8px;white-space:nowrap;padding:6px 4px;gap:8px;"></div>
                        <div class="item-detail-description"></div>
                </div>
                <div class="modal-footer">
                    <div class="item-detail-price" style="margin-right:auto;font-weight:800;color:#ffd166;"></div>
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

    open(item = {}, opts = {}) {
        // basic content
        if (item.image) {
            this.iconEl.innerHTML = `<img src="${item.image}" alt="${item.name}" style="width:100%;height:100%;object-fit:contain;">`;
        } else {
            this.iconEl.textContent = item.icon || '📦';
        }
        // name with rarity color class
        const rarity = (item.rarity || '').toLowerCase();
        this.nameEl.className = 'item-detail-name';
        if (rarity) this.nameEl.classList.add(`rarity-${rarity}`);
        this.nameEl.innerHTML = `<span class="item-title">${item.name || opts.title || '物品名稱'}</span>`;
        this.typeEl.textContent = opts.typeText || item.type || '';
        this.descEl.textContent = opts.description || item.desc || item.description || '';

        // stats: support structured `opts.stats` (array) OR `opts.statsHtml` (raw HTML)
        // We'll auto-build a structured view if item has stats or affixes, overriding statsHtml if needed.
        // This ensures the aggregated base + (+bonus) format is always shown.
        if (!Array.isArray(opts.stats) && item) {
            // Map of keys that should be displayed as percentages (and their Chinese labels)
            const percentKeyMap = {
                critChance: '爆擊率',
                critDamage: '暴擊傷害',
                lifesteal: '生命偷取',
                damageReduction: '傷害減免',
                allStats: '全屬性',
                fire: '火屬性',
                ice: '冰屬性',
                thunder: '雷屬性',
                poison: '毒屬性',
                light: '光屬性',
                dodgeChance: '閃避率',
                armorPenetration: '穿甲',
                double_strike: '雙重打擊',
                execute: '處決',
                damage_reflect: '反傷',
                gold_bonus: '金幣加成',
                exp_bonus: '經驗加成',
                drop_bonus: '掉落加成',
                revive: '復活'
            };
            const percentKeys = new Set(Object.keys(percentKeyMap));

            const labelMap = Object.assign({
                atk: '攻擊力', def: '防禦力', hp: '生命', mp: '魔力', durability: '耐久度',
                attackSpeed: '攻擊速度'
            }, percentKeyMap);

            // unified buff icon for percent/buff-style affixes
            const buffIcon = '✨';
            const iconMap = Object.assign({}, Object.fromEntries(Object.keys(percentKeyMap).map(k => [k, buffIcon])));

            // Compute affix contributions per-stat from `item.affixes` (preferred) or fallback to `item.affixBonuses`.
            const affixContribs = {};
            if (Array.isArray(item.affixes) && item.affixes.length > 0) {
                item.affixes.forEach(aff => {
                    if (!aff || !aff.stats) return;
                    for (const [k, v] of Object.entries(aff.stats)) {
                        if (v === undefined || v === null) continue;
                    const isPercent = percentKeys.has(k);
                    let raw = Number(v);
                    let disp = isPercent ? (Math.abs(raw) <= 1 ? raw * 100 : raw) : raw;
                    const display = isPercent ? ((Math.abs(disp % 1) > 0) ? disp.toFixed(2) : disp.toFixed(0)) + '%' : disp;
                        let num = Number(v);
                        let displayVal;
                        if (isPercent) {
                            displayVal = Math.abs(num) <= 1 ? num * 100 : num;
                        } else {
                            displayVal = num;
                        }
                        affixContribs[k] = (affixContribs[k] || 0) + displayVal;
                    }
                });
            }

            // If no individual affixes, but shorthand affixBonuses exist, use them as contributions
            if (Object.keys(affixContribs).length === 0 && item.affixBonuses) {
                for (const [k, v] of Object.entries(item.affixBonuses)) {
                    if (v === undefined || v === null || v === 0) continue;
                    let num = Number(v);
                    let displayVal = percentKeys.has(k) ? (Math.abs(num) <= 1 ? num * 100 : num) : Number(num);
                    affixContribs[k] = (affixContribs[k] || 0) + displayVal;
                }
            }

            // Merge specialEffects into affix contributions so they appear on the card
            // specialEffects format assumed: [{ type: 'lifesteal'|'fire'|..., value: number }, ...]
            if (Array.isArray(item.specialEffects) && item.specialEffects.length > 0) {
                item.specialEffects.forEach(eff => {
                    if (!eff || !eff.type) return;
                    const key = String(eff.type);
                    const raw = eff.value !== undefined && eff.value !== null ? eff.value : 0;
                    let num = Number(raw);
                    const displayVal = percentKeys.has(key) ? (Math.abs(num) <= 1 ? num * 100 : num) : Number(num);
                    affixContribs[key] = (affixContribs[key] || 0) + displayVal;
                });
            }

            // Check if item has any base stats or affix contributions
            const hasBaseStats = item.atk || item.attack || item.def || item.defense || item.hp || item.mp || item.durability || item.dur || item.durabilityMax || item.critChance || item.critDamage || item.attackSpeed;
            const hasAffixContribs = Object.keys(affixContribs).length > 0;

            // Build structured stats if we have base stats or affix contributions
            if (hasBaseStats || hasAffixContribs) {
                const built = [];
                const push = (key, icon, label, baseVal, isPercent) => {
                    const base = (baseVal !== undefined && baseVal !== null) ? (isPercent ? (Number(baseVal) * 100) : Number(baseVal)) : undefined;
                    const bonus = affixContribs[key] || 0;
                    // Only add row if base > 0 or bonus > 0
                    if ((base !== undefined && base !== 0) || bonus !== 0) {
                        // For attackSpeed we want to display seconds per attack instead of percent
                        const suffix = (key === 'attackSpeed') ? 's' : (isPercent ? '%' : '');
                        built.push({ key, icon, label, base: base || 0, bonus, suffix });
                    }
                };

                push('atk', '⚔️', '攻擊力', item.atk || item.attack, false);
                push('def', '🛡️', '防禦力', item.def || item.defense, false);
                push('durability', '🔧', '耐久度', item.durability || item.dur || item.durabilityMax, false);
                push('hp', '❤️', '生命', item.hp, false);
                push('mp', '💙', '魔力', item.mp, false);
                push('critChance', '💥', '爆擊率', item.critChance, true);
                push('critDamage', '🔥', '暴擊傷害', item.critDamage, true);
                push('attackSpeed', '⚡', '攻擊速度', item.attackSpeed, false);

                // Add any other affix-contributed keys not already included
                for (const [k, v] of Object.entries(affixContribs)) {
                    if (built.find(b => b.key === k)) continue;
                    if (!v || v === 0) continue;
                    built.push({ key: k, icon: iconMap[k] || '', label: labelMap[k] || k, base: 0, bonus: v, suffix: percentKeys.has(k) ? '%' : '' });
                }

                if (built.length > 0) {
                    opts.stats = built;
                }
            }
        }

        const highlightColor = '#4ade80';

        // helper to render effect objects (avoid [object Object])
        const renderEffectHtml = (eff) => {
            if (eff === undefined || eff === null) return '';
            if (typeof eff === 'string' || typeof eff === 'number') return String(eff);
            if (typeof eff === 'object') {
                const parts = [];
                if (eff.hp) parts.push(`<span style="font-weight:700;">❤️ 恢復 ${eff.hp} 生命</span>`);
                if (eff.mp) parts.push(`<span style="font-weight:700;">💙 恢復 ${eff.mp} 魔力</span>`);
                if (eff.exp) parts.push(`<span style="font-weight:700;">✨ 經驗 +${eff.exp}</span>`);
                if (eff.duration) parts.push(`<span style="font-weight:700;">⏳ 持續 ${eff.duration}s</span>`);
                // generic remaining keys
                for (const [k, v] of Object.entries(eff)) {
                    if (['hp','mp','exp','duration'].includes(k)) continue;
                    parts.push(`<span style="font-weight:700;">${k.replace(/([A-Z])/g, ' $1')}: ${v}</span>`);
                }
                return parts.join(' • ');
            }
            return String(eff);
        };

        if (Array.isArray(opts.stats)) {
            // build comparison rows with aligned label/value columns
            // helper to format numbers and percentages
            const formatValue = (val, suffix, baseValForDiff) => {
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
                const iconHtml = s.icon ? `<span class="stat-icon">${s.icon}</span>` : '';
                const labelHtml = `<div class="stat-left"><div class="stat-label">${iconHtml}<span>${s.label}</span></div></div>`;
                const baseVal = (s.base !== undefined && s.base !== null) ? Number(s.base) : 0;
                const bonusVal = (s.bonus !== undefined && s.bonus !== null) ? Number(s.bonus) : 0;
                const totalVal = baseVal + bonusVal;
                let totalPart;
                let bonusPart = '';
                if (s.suffix === 's') {
                    // show seconds per attack and delta in seconds
                    const baseSec = baseVal ? (baseVal === 0 ? Infinity : (1 / Number(baseVal))) : null;
                    const totalSec = totalVal === 0 ? Infinity : (1 / Number(totalVal));
                    totalPart = `<span class="stat-base" style="color:#ffffff;font-weight:700;">${formatValue(totalVal, s.suffix)}</span>`;
                    if (bonusVal !== 0) {
                        const diffSec = (baseSec !== null && isFinite(baseSec) && isFinite(totalSec)) ? (totalSec - baseSec) : 0;
                        const sign = diffSec < 0 ? '' : '+'; // negative means faster
                        const diffStr = (Math.abs(diffSec) % 1 > 0) ? Math.abs(diffSec).toFixed(2) : Math.abs(diffSec).toFixed(0);
                        bonusPart = `<span class="stat-bonus" style="color:${highlightColor};font-weight:800;margin-left:8px;">(${sign}${diffStr}s)</span>`;
                    }
                } else {
                    totalPart = `<span class="stat-base" style="color:#ffffff;font-weight:700;">${formatValue(totalVal, s.suffix)}</span>`;
                    bonusPart = (bonusVal !== 0)
                        ? `<span class="stat-bonus" style="color:${highlightColor};font-weight:800;margin-left:8px;">(+${formatValue(bonusVal, s.suffix)})</span>`
                        : '';
                }
                const valueHtml = `<div class="stat-right">${totalPart}${bonusPart}</div>`;
                return `<div class="stat-row">${labelHtml}${valueHtml}</div>`;
            }).join('');
            // prepend potion rows (if any) so consumable effects appear in the same place
            const isPotion = (item && (item.type === 'potion' || item.type === 'consumable')) || (opts && opts.typeText && String(opts.typeText).toLowerCase().includes('potion'));
            let potionRowsHtml = '';
            if (isPotion && (item.hp || item.mp || item.effect)) {
                if (item.hp) potionRowsHtml += `<div class="stat-row"><div class="stat-left"><div class="stat-label">❤️ <span>生命</span></div></div><div class="stat-right"><span class="stat-base" style="color:#ffffff;font-weight:700;">+${item.hp}</span></div></div>`;
                if (item.mp) potionRowsHtml += `<div class="stat-row"><div class="stat-left"><div class="stat-label">💙 <span>魔力</span></div></div><div class="stat-right"><span class="stat-base" style="color:#ffffff;font-weight:700;">+${item.mp}</span></div></div>`;
                if (item.effect) potionRowsHtml += `<div class="stat-row"><div class="stat-left"><div class="stat-label">✨ <span>效果</span></div></div><div class="stat-right"><span style="font-weight:700;color:${highlightColor};">${renderEffectHtml(item.effect)}</span></div></div>`;
            }

            this.statsEl.innerHTML = potionRowsHtml + `<div class="stats-compare">${rows}</div>`;
        } else if (opts.statsHtml !== undefined) {
            // If the caller provided raw stats HTML (shop does this for potions), make sure potion lines
            // are included at the top so the displayed position matches the shop layout.
            const isPotion = (item && (item.type === 'potion' || item.type === 'consumable')) || (opts && opts.typeText && String(opts.typeText).toLowerCase().includes('potion'));
            let potionHtml = '';
            if (isPotion && (item.hp || item.mp || item.effect)) {
                if (item.hp) potionHtml += `<div class="stat-row"><div class="stat-left"><div class="stat-label">❤️ <span>生命</span></div></div><div class="stat-right"><span class="stat-base" style="color:#ffffff;font-weight:700;">+${item.hp}</span></div></div>`;
                if (item.mp) potionHtml += `<div class="stat-row"><div class="stat-left"><div class="stat-label">💙 <span>魔力</span></div></div><div class="stat-right"><span class="stat-base" style="color:#ffffff;font-weight:700;">+${item.mp}</span></div></div>`;
                if (item.effect) potionHtml += `<div class="stat-row"><div class="stat-left"><div class="stat-label">✨ <span>效果</span></div></div><div class="stat-right"><span style="font-weight:700;color:${highlightColor};">${renderEffectHtml(item.effect)}</span></div></div>`;
            }

            this.statsEl.innerHTML = (potionHtml || '') + (opts.statsHtml || '');
        } else {
            this.statsEl.innerHTML = '';
        }

        // affixes / forge attributes area (show in body, horizontally). Accepts `opts.forgeAttrs` as array or HTML string
        const rarityColorMap = {
            common: { bg: 'rgba(158,158,158,0.08)', border: 'rgba(158,158,158,0.25)' },
            uncommon: { bg: 'rgba(30,255,0,0.06)', border: 'rgba(30,255,0,0.25)' },
            rare: { bg: 'rgba(0,112,221,0.06)', border: 'rgba(0,112,221,0.25)' },
            epic: { bg: 'rgba(163,53,238,0.06)', border: 'rgba(163,53,238,0.25)' },
            legendary: { bg: 'rgba(255,128,0,0.06)', border: 'rgba(255,128,0,0.25)' }
        };

        const renderAffixPill = (affix) => {
            const rarity = (affix.rarity || '').toLowerCase();
            const colors = rarityColorMap[rarity] || rarityColorMap.common;
            const stats = affix.stats ? Object.entries(affix.stats).map(([k,v]) => {
                // format percent values
                const isPercent = k.toLowerCase().includes('crit') || k.toLowerCase().includes('damage') || k.toLowerCase().includes('speed') || k.toLowerCase().includes('allstat') || k.toLowerCase().includes('lifesteal') || k.toLowerCase().includes('damageReduction');
                const display = isPercent ? (Number(v)).toFixed(isPercent && Math.abs(v) < 0.01 ? 2 : 0) + '%' : v;
                return `${k.replace(/([A-Z])/g, ' $1')}: ${display}`;
            }).join(' • '): '';

            return `
                <div class="affix-pill" style="display:inline-block;background:${colors.bg};border:1px solid ${colors.border};padding:8px 10px;border-radius:10px;margin-right:8px;vertical-align:middle;">
                    <div style="font-weight:700;margin-bottom:4px;">${affix.name}</div>
                    <div style="font-size:12px;color:rgba(255,255,255,0.8);">${stats}</div>
                </div>`;
        };

        // If explicit forgeAttrs provided, render them; else if item.affixes exists, render those horizontally.
        if (opts.forgeAttrs) {
            if (Array.isArray(opts.forgeAttrs)) {
                const html = opts.forgeAttrs.map(f => typeof f === 'string' ? `<div style="display:inline-block;margin-right:8px;">${f}</div>` : renderAffixPill(f)).join('');
                this.affixesEl.innerHTML = `<div>${html}</div>`;
                this.affixesEl.style.display = 'block';
            } else {
                this.affixesEl.innerHTML = `${opts.forgeAttrs}`;
                this.affixesEl.style.display = 'block';
            }
        } else if (item && Array.isArray(item.affixes) && item.affixes.length > 0) {
            const html = item.affixes.map(a => renderAffixPill(a)).join('');
            this.affixesEl.innerHTML = `<div>${html}</div>`;
            this.affixesEl.style.display = 'block';
        } else {
            this.affixesEl.style.display = 'none';
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
            : (item && typeof item.price === 'number' ? Math.floor(item.price / 2) : null);
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

                this.priceEl.innerHTML = `💰 ${priceToShow} <span style="font-weight:600;font-size:12px;margin-left:8px;color:rgba(255,255,255,0.7);">${priceLabel}</span>`;
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
