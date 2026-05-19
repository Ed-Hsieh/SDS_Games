import { attachItemTooltip, detachItemTooltip } from './ItemTooltip.js';

const DEFAULT_ITEM_HEIGHT = 84;
const DEFAULT_EMPTY_HTML = '<div class="empty-hint">背包空空如也...</div>';

function defaultRenderInventoryItem(node, stack) {
    const item = stack.item || {};
    const iconHtml = item.image
        ? `<img src="${item.image}" alt="${item.name || ''}" style="width: 100%; height: 100%; object-fit: contain;">`
        : (item.icon || '📦');

    node.innerHTML = `
        <div class="item-icon">
            ${iconHtml}
            ${stack.quantity > 1 ? `<span class="quantity-badge">x${stack.quantity}</span>` : ''}
        </div>
        <div class="item-info">
            <div class="item-name">${item.name || ''}</div>
        </div>
    `;
}

export function renderVirtualInventoryList(owner, container, items = [], options = {}) {
    if (!owner || !container) return;

    const stateKey = options.stateKey || '_virtualInventoryList';
    const itemHeight = options.itemHeight || DEFAULT_ITEM_HEIGHT;
    const emptyHtml = options.emptyHtml || DEFAULT_EMPTY_HTML;
    const renderItem = options.renderItem || defaultRenderInventoryItem;
    const enableTooltip = options.tooltip !== false;
    const tooltipOptions = options.tooltipOptions || null;

    container.style.position = 'relative';
    container.style.overflowY = 'auto';

    let spacer = container.querySelector('.inv-spacer');
    let poolWrapper = container.querySelector('.inv-pool');

    if (!items || items.length === 0) {
        container.innerHTML = emptyHtml;
        owner[stateKey] = {
            container,
            items: [],
            itemHeight,
            pool: [],
            renderItem,
            enableTooltip,
            tooltipOptions
        };
        return;
    }

    if (!spacer) {
        spacer = document.createElement('div');
        spacer.className = 'inv-spacer';
        container.appendChild(spacer);
    }

    if (!poolWrapper) {
        poolWrapper = document.createElement('div');
        poolWrapper.className = 'inv-pool';
        poolWrapper.style.position = 'absolute';
        poolWrapper.style.top = '0';
        poolWrapper.style.left = '0';
        poolWrapper.style.right = '0';
        container.appendChild(poolWrapper);
    }

    spacer.style.height = `${items.length * itemHeight}px`;

    const viewportHeight = container.clientHeight || 400;
    const visibleCount = Math.ceil(viewportHeight / itemHeight);
    const buffer = options.buffer ?? 4;
    const poolSize = visibleCount + buffer * 2;
    const currentState = owner[stateKey] || {};
    let pool = currentState.pool || [];

    if (pool.length !== poolSize || currentState.poolWrapper !== poolWrapper) {
        pool = [];
        poolWrapper.innerHTML = '';
        for (let index = 0; index < poolSize; index += 1) {
            const node = document.createElement('div');
            node.className = 'item-card inventory-item rarity-frame';
            node.style.position = 'absolute';
            node.style.left = '0';
            node.style.right = '0';
            node.style.height = `${itemHeight}px`;
            poolWrapper.appendChild(node);
            pool.push(node);
        }
    }

    owner[stateKey] = {
        container,
        items,
        itemHeight,
        pool,
        poolWrapper,
        renderItem,
        enableTooltip,
        tooltipOptions
    };

    updateVirtualInventoryList(owner, stateKey);
}

export function updateVirtualInventoryList(owner, stateKey = '_virtualInventoryList') {
    const state = owner?.[stateKey];
    if (!state || !state.container || !state.pool || state.pool.length === 0) return;

    const { container, items, itemHeight, pool, renderItem, enableTooltip, tooltipOptions } = state;
    const scrollTop = container.scrollTop || 0;
    const viewportHeight = container.clientHeight || 400;
    const firstIndex = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(viewportHeight / itemHeight);
    const buffer = Math.floor(pool.length - visibleCount > 0 ? (pool.length - visibleCount) / 2 : 2);
    const start = Math.max(0, firstIndex - buffer);

    for (let poolIndex = 0; poolIndex < pool.length; poolIndex += 1) {
        const dataIndex = start + poolIndex;
        const node = pool[poolIndex];

        if (dataIndex >= 0 && dataIndex < items.length) {
            const stack = items[dataIndex];
            const item = stack.item || {};

            node.style.display = '';
            node.dataset.instanceId = stack.instanceId || '';
            node.className = `item-card inventory-item rarity-frame rarity-${item.rarity || 'common'}`;
            node.style.transform = `translateY(${dataIndex * itemHeight}px)`;
            renderItem(node, stack, dataIndex);
            if (enableTooltip) {
                attachItemTooltip(node, item, {
                    quantity: stack.quantity || 1,
                    hint: '點擊開啟操作',
                    ...(tooltipOptions || {})
                });
            } else {
                detachItemTooltip(node);
            }
        } else {
            node.style.display = 'none';
            node.dataset.instanceId = '';
            detachItemTooltip(node);
        }
    }
}
