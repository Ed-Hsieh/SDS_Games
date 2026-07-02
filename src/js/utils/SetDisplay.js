import { EquipmentDatabase, SetDatabase } from '../data/Equipment.js';
import { getGeneratedCombatEffectImage } from '../data/AssetManifest.js';
import { escapeHtml, getItemVisualHtml } from './ItemDisplay.js';

function normalizeBonusEntries(setInfo) {
    if (!setInfo?.bonuses) return [];

    if (Array.isArray(setInfo.bonuses)) {
        return setInfo.bonuses
            .map(bonus => ({
                required: Number(bonus.required) || 0,
                name: bonus.name || '',
                description: bonus.description || ''
            }))
            .sort((a, b) => a.required - b.required);
    }

    return Object.entries(setInfo.bonuses)
        .map(([required, bonus]) => ({
            required: Number(required) || 0,
            name: bonus?.name || '',
            description: bonus?.description || ''
        }))
        .sort((a, b) => a.required - b.required);
}

function getStateSets(state = {}) {
    const equippedItems = Object.values(state?.character?.equipment || {}).filter(Boolean);
    const equippedIds = new Set(equippedItems.map(item => item?.id).filter(Boolean));
    const ownedIds = new Set(equippedIds);

    const collect = stack => {
        const item = stack?.item || stack;
        if (item?.id) ownedIds.add(item.id);
    };

    (state?.inventory || []).forEach(collect);
    (state?.warehouse || []).forEach(collect);

    return { equippedIds, ownedIds, equippedItems };
}

export function getSetProgress(setId, state = {}, currentItem = null) {
    const setInfo = SetDatabase[setId];
    if (!setInfo) return null;

    const { equippedIds, ownedIds } = getStateSets(state);
    if (currentItem?.id) ownedIds.add(currentItem.id);

    const pieces = (setInfo.pieces || []).map(pieceId => {
        const item = EquipmentDatabase[pieceId] || { id: pieceId, name: pieceId, icon: '◇' };
        return {
            id: pieceId,
            item,
            equipped: equippedIds.has(pieceId),
            owned: ownedIds.has(pieceId),
            current: currentItem?.id === pieceId
        };
    });

    const equippedCount = pieces.filter(piece => piece.equipped).length;
    const ownedCount = pieces.filter(piece => piece.owned).length;
    const bonuses = normalizeBonusEntries(setInfo).map(bonus => ({
        ...bonus,
        active: equippedCount >= bonus.required,
        missing: Math.max(0, bonus.required - equippedCount)
    }));

    return {
        set: setInfo,
        pieces,
        equippedCount,
        ownedCount,
        total: pieces.length,
        bonuses
    };
}

function buildPieceChips(progress, compact = false) {
    return `
        <div class="set-piece-chips${compact ? ' is-compact' : ''}">
            ${progress.pieces.map(piece => `
                <span class="set-piece-chip ${piece.equipped ? 'is-equipped' : ''} ${piece.owned ? 'is-owned' : 'is-missing'} ${piece.current ? 'is-current' : ''}"
                    data-item-name="${escapeHtml(piece.item.name || piece.id)}"
                    aria-label="${escapeHtml(piece.item.name || piece.id)}">
                    <span class="set-piece-tooltip" aria-hidden="true">
                        <span class="set-piece-tooltip-icon">${getItemVisualHtml(piece.item, '◆')}</span>
                        <span class="set-piece-tooltip-copy">
                            <strong>${escapeHtml(piece.item.name || piece.id)}</strong>
                            <small>${piece.equipped ? '已穿戴' : (piece.owned ? '已取得' : '尚未取得')}</small>
                        </span>
                    </span>
                    ${getItemVisualHtml(piece.item, '◇')}
                </span>
            `).join('')}
        </div>
    `;
}

export function getSetBuffIconId(setId, required = null) {
    const threshold = Number(required) || 0;
    return threshold > 0 ? `setbonus_${setId}_${threshold}` : `set_${setId}`;
}

export function getSetBuffIconImage(setId, required = null) {
    return getGeneratedCombatEffectImage(getSetBuffIconId(setId, required))
        || getGeneratedCombatEffectImage(getSetBuffIconId(setId));
}

function buildSetBuffIconHtml(setId, label = '', fallback = '◆', required = null) {
    const image = getSetBuffIconImage(setId, required);
    if (!image) return escapeHtml(fallback);
    return `<img src="${escapeHtml(image)}" alt="${escapeHtml(label)}">`;
}

function buildBonusRows(progress, limit = Infinity) {
    return `
        <div class="set-bonus-rows">
            ${progress.bonuses.slice(0, limit).map(bonus => {
                const title = bonus.name || bonus.description || '套裝效果';
                const statusLabel = bonus.active ? `${title} 已啟用` : `${title} 尚未啟用`;

                return `
                <div class="set-bonus-row ${bonus.active ? 'is-active' : 'is-locked'}" aria-label="${escapeHtml(statusLabel)}">
                    <span class="set-bonus-mark">${buildSetBuffIconHtml(progress.set.id, title, '◆', bonus.required)}</span>
                    <span class="set-bonus-copy">
                        <strong>${escapeHtml(title)} <em>${bonus.required}件</em></strong>
                        <small>${escapeHtml(bonus.description || '套裝效果已記錄。')}</small>
                    </span>
                </div>
            `;
            }).join('')}
        </div>
    `;
}

function buildSetOverviewHtml(progress, options = {}) {
    const compact = Boolean(options.compact);
    const bonusLimit = Number.isFinite(Number(options.bonusLimit)) ? Number(options.bonusLimit) : Infinity;
    const activeBonuses = progress.bonuses.filter(bonus => bonus.active);
    const displayBonus = activeBonuses[activeBonuses.length - 1] || progress.bonuses[0] || null;
    const iconLabel = displayBonus?.name || progress.set.name || progress.set.id;
    const activeClass = activeBonuses.length > 0 ? 'has-active-bonus' : 'is-inactive';

    return `
        <div class="set-overview ${compact ? 'is-compact' : ''} ${activeClass}">
            ${buildPieceChips(progress, true)}
            <div class="set-overview-card">
                <span class="set-overview-icon">
                    ${displayBonus ? buildSetBuffIconHtml(progress.set.id, iconLabel, progress.set.icon || '◆', displayBonus.required) : escapeHtml(progress.set.icon || '◆')}
                </span>
                <span class="set-overview-copy">
                    <span class="set-overview-title">
                        <strong>${escapeHtml(progress.set.name || progress.set.id)}</strong>
                        <em>${progress.equippedCount}/${progress.total}穿戴</em>
                    </span>
                    ${buildBonusRows(progress, bonusLimit)}
                </span>
            </div>
        </div>
    `;
}

export function buildItemSetInfoHtml(item, state = {}, options = {}) {
    if (!item?.setId) return '';

    const progress = getSetProgress(item.setId, state, item);
    if (!progress) return '';

    const compact = Boolean(options.compact);
    const bonusLimit = compact ? 2 : Infinity;

    return `
        <section class="item-set-panel ${compact ? 'is-compact' : ''}">
            ${buildSetOverviewHtml(progress, { compact, bonusLimit })}
        </section>
    `;
}

export function buildEquippedSetSummaryHtml(state = {}) {
    const { equippedItems } = getStateSets(state);
    const setIds = [...new Set(equippedItems.map(item => item?.setId).filter(Boolean))];
    if (setIds.length === 0) {
        return '<div class="equipment-set-empty">尚未形成套裝。穿上同系列裝備後，這裡會顯示啟用效果。</div>';
    }

    return `
        <div class="equipment-set-summary">
            ${setIds.map(setId => {
                const progress = getSetProgress(setId, state);
                if (!progress) return '';

                return `
                    <section class="equipment-set-card">
                        ${buildSetOverviewHtml(progress, { compact: true })}
                    </section>
                `;
            }).join('')}
        </div>
    `;
}
