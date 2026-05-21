import { EquipmentDatabase, SetDatabase } from '../data/Equipment.js';
import { escapeHtml } from './ItemDisplay.js';

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
                    title="${escapeHtml(piece.item.name || piece.id)}"
                    aria-label="${escapeHtml(piece.item.name || piece.id)}">
                    ${escapeHtml(piece.item.icon || '◇')}
                </span>
            `).join('')}
        </div>
    `;
}

function buildBonusRows(progress, limit = Infinity) {
    return `
        <div class="set-bonus-rows">
            ${progress.bonuses.slice(0, limit).map(bonus => {
                const status = bonus.active ? '已啟用' : `缺 ${bonus.missing} 件`;
                const statusLabel = bonus.active ? '已啟用' : `尚未啟用，還缺 ${bonus.missing} 件`;

                return `
                <div class="set-bonus-row ${bonus.active ? 'is-active' : 'is-locked'}" aria-label="${escapeHtml(statusLabel)}">
                    <span class="set-bonus-threshold">${bonus.required}件</span>
                    <strong>${escapeHtml(bonus.name || bonus.description || '套裝效果')}</strong>
                    <small>${escapeHtml(bonus.description || (bonus.active ? '已啟動' : `再穿 ${bonus.missing} 件啟動`))}</small>
                    <em>${escapeHtml(status)}</em>
                </div>
            `;
            }).join('')}
        </div>
    `;
}

export function buildItemSetInfoHtml(item, state = {}, options = {}) {
    if (!item?.setId) return '';

    const progress = getSetProgress(item.setId, state, item);
    if (!progress) return '';

    const compact = Boolean(options.compact);
    const bonusLimit = compact ? 2 : Infinity;
    const nextBonus = progress.bonuses.find(bonus => !bonus.active);
    const activeCount = progress.bonuses.filter(bonus => bonus.active).length;
    const status = activeCount > 0
        ? `已啟動 ${activeCount} 個效果`
        : nextBonus
            ? `再穿 ${nextBonus.missing} 件啟動`
            : '套裝效果待確認';

    return `
        <section class="item-set-panel ${compact ? 'is-compact' : ''}">
            <div class="item-set-head">
                <span class="item-set-icon">${escapeHtml(progress.set.icon || '◆')}</span>
                <div>
                    <strong>${escapeHtml(progress.set.name || progress.set.id)}</strong>
                    <small>${progress.equippedCount}/${progress.total} 已穿戴 · ${escapeHtml(status)}</small>
                </div>
            </div>
            ${buildPieceChips(progress, compact)}
            ${buildBonusRows(progress, bonusLimit)}
        </section>
    `;
}

export function buildEquippedSetSummaryHtml(state = {}) {
    const { equippedItems } = getStateSets(state);
    const setIds = [...new Set(equippedItems.map(item => item?.setId).filter(Boolean))];
    if (setIds.length === 0) return '';

    return `
        <div class="equipment-set-summary">
            ${setIds.map(setId => {
                const progress = getSetProgress(setId, state);
                if (!progress) return '';

                return `
                    <section class="equipment-set-card">
                        <div class="equipment-set-card-head">
                            <span>${escapeHtml(progress.set.icon || '◆')}</span>
                            <div>
                                <strong>${escapeHtml(progress.set.name || progress.set.id)}</strong>
                                <small>${progress.equippedCount}/${progress.total} 已穿戴</small>
                            </div>
                        </div>
                        ${buildPieceChips(progress, true)}
                        ${buildBonusRows(progress)}
                    </section>
                `;
            }).join('')}
        </div>
    `;
}
