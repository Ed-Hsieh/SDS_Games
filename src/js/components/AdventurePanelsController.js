import GameManager from '../managers/GameManager.js';
import { questManager, QuestStatus } from '../managers/QuestManager.js?v=dialogue-flow-20260712w';
import { getGeneratedItemImage } from '../data/AssetManifest.js';
import { buildItemTooltipAttrs } from '../utils/ItemTooltip.js';
import { storyGuidanceManager } from '../managers/StoryGuidanceManager.js';

const SLOT_LABELS = Object.freeze({
    weapon: '主武器',
    armor: '防具 / 副武器',
    accessory: '飾品'
});

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function itemType(item) {
    return String(item?.type || '').toLowerCase();
}

function getActionButtons(stack) {
    const type = itemType(stack?.item);
    if (type === 'weapon') {
        return `
            <div class="adventure-inventory-actions">
                <button type="button" data-inventory-action="equip" data-slot="weapon" data-instance-id="${escapeHtml(stack.instanceId)}">主手</button>
                <button type="button" data-inventory-action="equip" data-slot="armor" data-instance-id="${escapeHtml(stack.instanceId)}">副手</button>
            </div>`;
    }
    if (type === 'armor' || type === 'accessory') {
        return `<button type="button" data-inventory-action="equip" data-slot="${type}" data-instance-id="${escapeHtml(stack.instanceId)}">裝備</button>`;
    }
    if (stack?.item?.effect || stack?.item?.buff) {
        return `<button type="button" data-inventory-action="use" data-instance-id="${escapeHtml(stack.instanceId)}">使用</button>`;
    }
    return '';
}

export default class AdventurePanelsController {
    constructor(root, options = {}) {
        this.root = root;
        this.options = options;
        this.openDrawer = null;
        this.handleGameState = this.handleGameState.bind(this);
        this.handleQuestState = this.handleQuestState.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    init() {
        this.questDrawer = this.root.querySelector('#adventure-quest-drawer');
        this.inventoryDrawer = this.root.querySelector('#adventure-inventory-drawer');
        this.questList = this.root.querySelector('#adventure-quest-list');
        this.inventoryList = this.root.querySelector('#adventure-inventory-list');
        this.inventoryDetail = this.root.querySelector('#adventure-inventory-detail');
        this.equipmentSummary = this.root.querySelector('#adventure-equipment-summary');
        this.inventoryCapacity = this.root.querySelector('#adventure-inventory-capacity');
        this.trackerName = this.root.querySelector('#adventure-quest-tracker-name');
        this.trackerProgress = this.root.querySelector('#adventure-quest-tracker-progress');

        this.root.addEventListener('click', this.handleClick);
        GameManager.subscribe(this.handleGameState);
        questManager.subscribe(this.handleQuestState);
        this.renderAll();
    }

    destroy() {
        this.root.removeEventListener('click', this.handleClick);
        GameManager.unsubscribe(this.handleGameState);
        questManager.unsubscribe(this.handleQuestState);
    }

    isOpen() {
        return Boolean(this.openDrawer);
    }

    handleGameState(_state, type) {
        if (['all', 'inventory', 'equipment', 'flags'].includes(type)) {
            this.renderInventory();
            this.renderQuestTracker();
        }
    }

    handleQuestState() {
        this.renderQuests();
        this.renderQuestTracker();
    }

    handleClick(event) {
        if (event.target.closest('#btn-adventure-quests')) {
            this.toggleDrawer('quest');
            return;
        }
        if (event.target.closest('#btn-adventure-inventory')) {
            this.toggleDrawer('inventory');
            return;
        }
        if (event.target.closest('[data-close-adventure-drawer]')) {
            this.closeDrawers();
            return;
        }

        const unequip = event.target.closest('[data-unequip-slot]');
        if (unequip) {
            GameManager.unequipItem(unequip.dataset.unequipSlot);
            this.renderInventory();
            return;
        }

        const action = event.target.closest('[data-inventory-action]');
        if (!action) {
            const itemCell = event.target.closest('[data-field-item]');
            if (itemCell) {
                this.selectedInstanceId = itemCell.dataset.instanceId;
                this.renderInventory();
            }
            return;
        }
        const instanceId = action.dataset.instanceId;
        if (action.dataset.inventoryAction === 'equip') {
            GameManager.equipItemToSlot(instanceId, action.dataset.slot);
        } else if (action.dataset.inventoryAction === 'use') {
            GameManager.useConsumable(instanceId);
        }
        this.renderInventory();
        this.options.onPlayerStateChange?.();
    }

    toggleDrawer(type) {
        if (this.openDrawer === type) {
            this.closeDrawers();
            return;
        }
        this.openDrawer = type;
        this.questDrawer.hidden = type !== 'quest';
        this.inventoryDrawer.hidden = type !== 'inventory';
        this.root.querySelector('#btn-adventure-quests')?.classList.toggle('is-active', type === 'quest');
        this.root.querySelector('#btn-adventure-inventory')?.classList.toggle('is-active', type === 'inventory');
        if (type === 'quest') this.renderQuests();
        else this.renderInventory();
        this.options.onOpenStateChange?.(true);
    }

    closeDrawers() {
        this.openDrawer = null;
        if (this.questDrawer) this.questDrawer.hidden = true;
        if (this.inventoryDrawer) this.inventoryDrawer.hidden = true;
        this.root.querySelector('#btn-adventure-quests')?.classList.remove('is-active');
        this.root.querySelector('#btn-adventure-inventory')?.classList.remove('is-active');
        this.options.onOpenStateChange?.(false);
    }

    renderAll() {
        this.renderQuests();
        this.renderQuestTracker();
        this.renderInventory();
    }

    renderQuestTracker() {
        if (!this.trackerName || !this.trackerProgress) return;
        const directive = storyGuidanceManager.getCurrent(this.options.getStoryHintContext?.() || {});
        if (directive) {
            this.trackerName.textContent = directive.title;
            this.trackerProgress.textContent = directive.text;
            return;
        }

        const activeQuests = questManager.getActiveQuests();
        const active = activeQuests[0];
        if (!active) {
            this.trackerName.textContent = '目前沒有追蹤任務';
            this.trackerProgress.textContent = '探索地圖並調查地標。';
            return;
        }
        const progress = active.state?.progress?.[0];
        this.trackerName.textContent = active.name;
        this.trackerProgress.textContent = progress
            ? `${progress.current} / ${progress.required} · ${active.description || '依照任務紀錄繼續行動。'}`
            : (active.description || '依照任務紀錄繼續行動。');
    }

    renderQuests() {
        if (!this.questList) return;
        const active = questManager.getActiveQuests();
        const completed = questManager.getCompletedQuests();
        const quests = [...active, ...completed];
        if (!quests.length) {
            this.questList.innerHTML = '<p class="adventure-drawer-empty">目前沒有可顯示的任務紀錄。</p>';
            return;
        }

        this.questList.innerHTML = quests.map(quest => {
            const ready = quest.state?.status === QuestStatus.COMPLETED;
            const objectives = (quest.state?.progress || []).map((progress, index) => {
                const objective = quest.objectives?.[index];
                return `<div class="adventure-quest-objective"><span>${escapeHtml(objective?.description || objective?.target || '任務目標')}</span><b>${progress.current} / ${progress.required}</b></div>`;
            }).join('');
            return `
                <article class="adventure-quest-entry">
                    <header><strong>${escapeHtml(quest.name || quest.id || '未命名任務')}</strong><span>${ready ? '待回報' : '進行中'}</span></header>
                    <p>${escapeHtml(quest.description || '')}</p>
                    ${objectives}
                </article>`;
        }).join('');
    }

    renderInventory() {
        const inventory = GameManager.getInventory() || [];
        const character = GameManager.getCharacter();
        if (this.inventoryCapacity) {
            this.inventoryCapacity.textContent = `${inventory.length} / ${GameManager.state.inventoryCapacity || inventory.length}`;
        }

        if (this.equipmentSummary) {
            this.equipmentSummary.innerHTML = Object.entries(SLOT_LABELS).map(([slot, label]) => {
                const item = character?.equipment?.[slot];
                const image = item ? getGeneratedItemImage(item) : '';
                return `
                    <button class="adventure-equipment-slot" type="button" data-unequip-slot="${slot}" ${item ? buildItemTooltipAttrs(item, { hint: '點擊卸下裝備' }) : 'disabled'}>
                        ${image ? `<img src="${escapeHtml(image)}" alt="">` : '<span></span>'}
                        <span>${label}<strong>${escapeHtml(item?.name || '未裝備')}</strong></span>
                    </button>`;
            }).join('');
        }

        if (!this.inventoryList) return;
        if (!inventory.some(stack => stack.instanceId === this.selectedInstanceId)) {
            this.selectedInstanceId = inventory[0]?.instanceId || null;
        }
        const capacity = Math.max(5, Number(GameManager.state.inventoryCapacity) || inventory.length || 5);
        const slotCount = Math.ceil(Math.max(capacity, inventory.length) / 5) * 5;
        const slots = Array.from({ length: slotCount }, (_, index) => inventory[index] || null);
        this.inventoryList.innerHTML = slots.map(stack => {
            if (!stack) return '<button class="field-item-cell is-empty" type="button" disabled aria-label="空白欄位"></button>';
            const item = stack.item || {};
            const image = getGeneratedItemImage(item);
            return `
                <button class="field-item-cell rarity-${escapeHtml(item.rarity || 'common')} ${stack.instanceId === this.selectedInstanceId ? 'is-selected' : ''}" type="button" data-field-item data-instance-id="${escapeHtml(stack.instanceId)}" aria-label="${escapeHtml(item.name || item.id)}"${buildItemTooltipAttrs(item, { quantity: stack.quantity, hint: '點擊查看與操作' })}>
                    <span class="item-icon">${image ? `<img src="${escapeHtml(image)}" alt="">` : escapeHtml(item.icon || '')}</span>
                    ${Number(stack.quantity) > 1 ? `<span class="quantity-badge">${Math.max(1, Number(stack.quantity) || 1)}</span>` : ''}
                </button>`;
        }).join('');
        this.renderInventoryDetail(inventory);
    }

    renderInventoryDetail(inventory) {
        if (!this.inventoryDetail) return;
        const stack = inventory.find(entry => entry.instanceId === this.selectedInstanceId);
        if (!stack) {
            this.inventoryDetail.hidden = true;
            this.inventoryDetail.innerHTML = '';
            return;
        }
        const item = stack.item || {};
        const image = getGeneratedItemImage(item);
        this.inventoryDetail.hidden = false;
        this.inventoryDetail.innerHTML = `
            <div class="adventure-inventory-detail-icon">${image ? `<img src="${escapeHtml(image)}" alt="">` : escapeHtml(item.icon || '')}</div>
            <div class="adventure-inventory-detail-copy">
                <strong>${escapeHtml(item.name || item.id)}</strong>
                <span>${escapeHtml(itemType(item))} · ${Math.max(1, Number(stack.quantity) || 1)} 個</span>
                <p>${escapeHtml(item.description || '沒有額外說明。')}</p>
            </div>
            ${getActionButtons(stack)}`;
    }
}
