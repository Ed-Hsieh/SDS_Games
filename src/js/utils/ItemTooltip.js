/**
 * ItemTooltip.js
 * Shared hover preview for item-like UI cards.
 */

import {
    buildItemStatsHtml,
    escapeHtml,
    getItemDisplayDescription,
    getItemRarityText,
    getItemTypeText
} from './ItemDisplay.js';
import { getSellPrice } from '../models/ItemSchema.js';

let tooltipEl = null;
let activeTarget = null;
let lastPointer = { x: 0, y: 0 };
let rafId = null;

function ensureTooltip() {
    if (tooltipEl) return tooltipEl;

    tooltipEl = document.createElement('div');
    tooltipEl.className = 'game-item-tooltip';
    tooltipEl.setAttribute('role', 'tooltip');
    tooltipEl.hidden = true;
    document.body.appendChild(tooltipEl);
    return tooltipEl;
}

function getIconHtml(item) {
    if (item?.image) {
        return `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name || '')}">`;
    }
    return escapeHtml(item?.icon || '◆');
}

function getFooterRows(item, options = {}) {
    const rows = [];

    if (options.quantity && Number(options.quantity) > 1) {
        rows.push(['數量', `x${options.quantity}`]);
    }

    if (options.price != null) {
        rows.push([options.priceLabel || '價格', `${options.price}G`]);
    } else {
        const sellPrice = getSellPrice(item, options.quantity || 1);
        if (sellPrice > 0) rows.push(['售價', `${sellPrice}G`]);
    }

    if (Array.isArray(options.footerRows)) {
        for (const row of options.footerRows) {
            if (!Array.isArray(row) || row.length < 2) continue;
            rows.push([row[0], row[1]]);
        }
    }

    return rows;
}

function renderTooltip(payload) {
    const item = payload?.item || {};
    const options = payload?.options || {};
    const rarity = item.rarity || options.rarity || 'common';
    const typeText = options.typeText ?? getItemTypeText(item.type);
    const rarityText = options.rarityText ?? getItemRarityText(rarity);
    const description = options.description ?? getItemDisplayDescription(item, '');
    const statsHtml = options.statsHtml ?? buildItemStatsHtml(item, { includeAffixes: true });
    const footerRows = getFooterRows(item, options);

    return `
        <div class="item-tooltip-card rarity-frame rarity-${escapeHtml(rarity)}">
            <div class="item-tooltip-header">
                <div class="item-tooltip-icon">${getIconHtml(item)}</div>
                <div class="item-tooltip-title">
                    <strong class="rarity-text rarity-${escapeHtml(rarity)}">${escapeHtml(item.name || '未知物品')}</strong>
                    <span>${escapeHtml(typeText)} / ${escapeHtml(rarityText)}</span>
                </div>
            </div>
            ${description ? `<div class="item-tooltip-desc">${escapeHtml(description)}</div>` : ''}
            ${statsHtml ? `<div class="item-tooltip-stats">${statsHtml}</div>` : ''}
            ${footerRows.length > 0 ? `
                <div class="item-tooltip-footer">
                    ${footerRows.map(([label, value]) => `
                        <div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>
                    `).join('')}
                </div>
            ` : ''}
            ${options.hint ? `<div class="item-tooltip-hint">${escapeHtml(options.hint)}</div>` : ''}
        </div>
    `;
}

function positionTooltip() {
    if (!tooltipEl || tooltipEl.hidden) return;

    const margin = 12;
    const gap = 16;
    const rect = tooltipEl.getBoundingClientRect();
    let left = lastPointer.x + gap;
    let top = lastPointer.y + gap;

    if (left + rect.width + margin > window.innerWidth) {
        left = Math.max(margin, lastPointer.x - rect.width - gap);
    }

    if (top + rect.height + margin > window.innerHeight) {
        top = Math.max(margin, window.innerHeight - rect.height - margin);
    }

    tooltipEl.style.left = `${left}px`;
    tooltipEl.style.top = `${top}px`;
}

function schedulePosition() {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
        rafId = null;
        positionTooltip();
    });
}

function showTooltip(target, event) {
    const payload = target?.__itemTooltipPayload;
    if (!payload?.item) return;

    activeTarget = target;
    lastPointer = { x: event.clientX, y: event.clientY };

    const tooltip = ensureTooltip();
    tooltip.innerHTML = renderTooltip(payload);
    tooltip.hidden = false;
    tooltip.classList.add('is-visible');
    schedulePosition();
}

function hideTooltip() {
    activeTarget = null;
    if (!tooltipEl) return;
    tooltipEl.hidden = true;
    tooltipEl.classList.remove('is-visible');
}

function findTooltipTarget(node) {
    return node?.closest?.('[data-item-tooltip="true"]') || null;
}

if (typeof document !== 'undefined') {
    document.addEventListener('pointerover', event => {
        if (event.pointerType === 'touch') return;
        const target = findTooltipTarget(event.target);
        if (!target || target === activeTarget) return;
        showTooltip(target, event);
    });

    document.addEventListener('pointermove', event => {
        if (!activeTarget || event.pointerType === 'touch') return;
        lastPointer = { x: event.clientX, y: event.clientY };
        schedulePosition();
    });

    document.addEventListener('pointerout', event => {
        if (!activeTarget) return;
        const nextTarget = event.relatedTarget;
        if (nextTarget && activeTarget.contains(nextTarget)) return;
        hideTooltip();
    });

    document.addEventListener('pointerdown', hideTooltip, true);
}

if (typeof window !== 'undefined') {
    window.addEventListener('scroll', hideTooltip, true);
    window.addEventListener('blur', hideTooltip);
}

export function attachItemTooltip(element, item, options = {}) {
    if (!element || !item) return element;
    element.dataset.itemTooltip = 'true';
    element.__itemTooltipPayload = { item, options };
    return element;
}

export function detachItemTooltip(element) {
    if (!element) return;
    delete element.dataset.itemTooltip;
    delete element.__itemTooltipPayload;
}

export function closeItemTooltip() {
    hideTooltip();
}
