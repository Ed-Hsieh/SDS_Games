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
                        <div class="item-detail-affixes" style="display:none;margin-bottom:8px;overflow-x:auto;white-space:nowrap;padding:6px 4px;gap:8px;"></div>
                        <div class="item-detail-description"></div>
                </div>
                <div class="modal-footer">
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
        // If neither provided, but item has stats (atk/def/critChance) we'll auto-build a structured view
        if (!Array.isArray(opts.stats) && !opts.statsHtml && item) {
            const inferred = [];
            const bonuses = item.affixBonuses || {};

            // helper to push with a consistent shape and include key for merging
            const pushStat = (key, icon, label, baseVal, bonusVal, isPercent) => {
                const base = (baseVal !== undefined && baseVal !== null)
                    ? (isPercent ? (Number(baseVal) * 100) : baseVal)
                    : undefined;
                const bonus = (bonusVal !== undefined && bonusVal !== null)
                    ? (isPercent ? (Number(bonusVal) * 100) : bonusVal)
                    : 0;
                inferred.push({ key, icon, label, base, bonus, suffix: isPercent ? '%' : '' });
            };

            // Common stats
            if (item.atk || item.attack || bonuses.atk) pushStat('atk', '⚔️', '攻擊力', item.atk || item.attack || 0, bonuses.atk || 0, false);
            if (item.def || item.defense || bonuses.def) pushStat('def', '🛡️', '防禦力', item.def || item.defense || 0, bonuses.def || 0, false);
            if (item.hp || bonuses.hp) pushStat('hp', '❤️', '生命', item.hp || 0, bonuses.hp || 0, false);
            if (item.mp || bonuses.mp) pushStat('mp', '💙', '魔力', item.mp || 0, bonuses.mp || 0, false);

            // Percent-style stats
            if (item.critChance || bonuses.critChance) pushStat('critChance', '💥', '爆擊率', item.critChance || 0, bonuses.critChance || 0, true);
            if (item.critDamage || bonuses.critDamage) pushStat('critDamage', '🔥', '暴擊傷害', item.critDamage || 0, bonuses.critDamage || 0, true);
            if (item.attackSpeed || bonuses.attackSpeed) pushStat('attackSpeed', '⚡', '攻擊速度', item.attackSpeed || 0, bonuses.attackSpeed || 0, true);

            // If affixBonuses contain extra keys not in inferred, they'll be merged below
            if (inferred.length > 0) opts.stats = inferred;

            // Merge any remaining affixBonuses into the inferred stats (convert percent keys to display units)
            if (item.affixBonuses) {
                const percentKeys = new Set(['critChance', 'critDamage', 'attackSpeed', 'lifesteal', 'damageReduction', 'allStats']);
                const labelMap = { atk: '攻擊力', def: '防禦力', hp: '生命', mp: '魔力', critChance: '爆擊率', critDamage: '暴擊傷害', attackSpeed: '攻擊速度' };

                for (const [k, v] of Object.entries(item.affixBonuses)) {
                    if (!v || v === 0) continue;
                    const displayVal = percentKeys.has(k) ? (Number(v) * 100) : v;
                    const entry = (opts.stats || []).find(s => s.key === k);
                    if (entry) {
                        entry.bonus = (entry.bonus || 0) + displayVal;
                        if (percentKeys.has(k)) entry.suffix = '%';
                    } else {
                        // push a new stat row for this affix bonus
                        (opts.stats = opts.stats || []).push({ key: k, icon: '', label: labelMap[k] || k, base: undefined, bonus: displayVal, suffix: percentKeys.has(k) ? '%' : '' });
                    }
                }
            }
        }

        const highlightColor = '#4ade80';

        if (Array.isArray(opts.stats)) {
            // build comparison rows with aligned label/value columns
            // helper to format numbers and percentages
            const formatValue = (val, suffix) => {
                const v = (val === undefined || val === null) ? 0 : Number(val);
                if (suffix === '%') {
                    return (Math.abs(v % 1) > 0 ? v.toFixed(2) : v.toFixed(0)) + '%';
                }
                return (Math.abs(v % 1) > 0 ? v.toFixed(2) : v.toFixed(0));
            };

            const rows = opts.stats.map(s => {
                const iconHtml = s.icon ? `<span class="stat-icon">${s.icon}</span>` : '';
                const labelHtml = `<div class="stat-left"><div class="stat-label">${iconHtml}<span>${s.label}</span></div></div>`;
                const baseVal = (s.base !== undefined && s.base !== null) ? s.base : 0;
                const basePart = `<span class="stat-base">${formatValue(baseVal, s.suffix)}</span>`;
                const bonusPart = (s.bonus !== undefined && s.bonus !== 0)
                    ? `<span class="stat-bonus" style="color:${highlightColor};font-weight:800;margin-left:8px;">(+${formatValue(s.bonus, s.suffix)})</span>`
                    : '';
                const valueHtml = `<div class="stat-right">${basePart}${bonusPart}</div>`;
                return `<div class="stat-row">${labelHtml}${valueHtml}</div>`;
            }).join('');
            this.statsEl.innerHTML = `<div class="stats-compare">${rows}</div>`;
        } else if (opts.statsHtml !== undefined) {
            this.statsEl.innerHTML = opts.statsHtml || '';
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
                const display = isPercent ? (Number(v) * 100).toFixed(isPercent && Math.abs(v) < 0.01 ? 2 : 0) + '%' : v;
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
        }, 240);
    }

    isOpen() {
        return this.container.classList.contains('active');
    }
}

// expose singleton
window.ItemDetailModal = new ItemDetailModal();

export default window.ItemDetailModal;
