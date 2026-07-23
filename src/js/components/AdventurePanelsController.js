import GameManager from '../managers/GameManager.js';
import { questManager } from '../managers/QuestManager.js';
import { QuestStatus } from '../data/Quests.js';
import { getGeneratedItemImage } from '../data/AssetManifest.js';
import { buildItemModalOptions } from '../utils/ItemDisplay.js';
import { buildItemTooltipAttrs } from '../utils/ItemTooltip.js';
import { confirmAction, showGlobalToast } from '../utils/UIFeedback.js';
import { storyGuidanceManager } from '../managers/StoryGuidanceManager.js';
import itemDetailModal from './ItemDetailModal.js';

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
        itemDetailModal.close();
    }

    isOpen() {
        return Boolean(this.openDrawer);
    }

    handleGameState(_state, type) {
        if (type === 'all') {
            this.renderAll();
            return;
        }
        if (type === 'inventory') {
            this.renderInventory();
            return;
        }
        if (type === 'equipment') {
            this.renderInventory();
            return;
        }
        if (type === 'flags') {
            this.renderStoryGuidance();
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

        const itemCell = event.target.closest('[data-field-item]');
        if (!itemCell) return;
        this.selectedInstanceId = itemCell.dataset.instanceId;
        this.renderInventory();
        this.openInventoryItemModal(this.selectedInstanceId);
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
        this.options.onDrawerOpen?.(type);
    }

    closeDrawers() {
        this.openDrawer = null;
        if (this.questDrawer) this.questDrawer.hidden = true;
        if (this.inventoryDrawer) this.inventoryDrawer.hidden = true;
        this.root.querySelector('#btn-adventure-quests')?.classList.remove('is-active');
        this.root.querySelector('#btn-adventure-inventory')?.classList.remove('is-active');
        itemDetailModal.close();
        this.options.onOpenStateChange?.(false);
    }

    renderAll() {
        this.renderQuests();
        this.renderQuestTracker();
        this.renderInventory();
    }

    renderStoryGuidance() {
        this.renderQuests();
        this.renderQuestTracker();
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
        const directive = storyGuidanceManager.getCurrent(this.options.getStoryHintContext?.() || {});
        const active = questManager.getActiveQuests();
        const completed = questManager.getCompletedQuests();
        const quests = [...active, ...completed];
        if (!directive && !quests.length) {
            this.questList.innerHTML = '<p class="adventure-drawer-empty">目前沒有可顯示的任務紀錄。</p>';
            return;
        }

        const mainline = directive ? `
            <article class="adventure-quest-entry is-mainline">
                <header><strong>${escapeHtml(directive.title)}</strong><span>主線追蹤</span></header>
                <p>${escapeHtml(directive.text)}</p>
                <div class="adventure-quest-objective"><span>依手札線索推進</span><b>進行中</b></div>
            </article>` : '';
        this.questList.innerHTML = mainline + quests.map(quest => {
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
            this.inventoryCapacity.textContent = `${inventory.length} / ${GameManager.getInventoryCapacity() || inventory.length}`;
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
        const capacity = Math.max(5, GameManager.getInventoryCapacity() || inventory.length || 5);
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
    }

    openInventoryItemModal(instanceId) {
        const stack = (GameManager.getInventory() || []).find(entry => entry.instanceId === instanceId);
        if (!stack) return false;
        const item = stack.item || {};
        const actions = this.createAdventureItemActions(stack);
        itemDetailModal.open(item, {
            ...buildItemModalOptions(item),
            actions,
            price: null,
            context: 'adventure'
        });
        return true;
    }

    createAdventureItemActions(stack) {
        const item = stack?.item || {};
        const type = itemType(item);
        const actions = [];

        if (type === 'weapon') {
            actions.push(this.createModalButton('⚔️ 裝備主手', 'btn-primary', () => {
                this.equipInventoryItem(stack.instanceId, 'weapon');
            }));
            if (GameManager.getCharacter()?.equipment?.weapon && GameManager.canEquipItemToSlot(item, 'armor')) {
                actions.push(this.createModalButton('🗡️ 裝備副手', 'btn-primary', () => {
                    this.equipInventoryItem(stack.instanceId, 'armor');
                }));
            }
        } else if (type === 'armor' || type === 'accessory') {
            actions.push(this.createModalButton('⚔️ 裝備', 'btn-primary', () => {
                this.equipInventoryItem(stack.instanceId, type);
            }));
        }

        if (item.useContext === 'adventure_map' && item.useAction === 'return_to_town') {
            actions.push(this.createModalButton('🔥 點燃狼煙', 'btn-info', () => {
                if (this.options.onUseContextItem?.(stack)) itemDetailModal.close();
            }));
        } else if (item.effect || item.buff || type === 'potion' || type === 'scroll') {
            actions.push(this.createModalButton('🧪 使用', 'btn-info', () => {
                this.useInventoryItem(stack.instanceId);
            }));
        }

        if (item.tutorialLocked) {
            const locked = this.createModalButton('教學期間不可丟棄', 'btn-info', () => {});
            locked.disabled = true;
            actions.push(locked);
        } else {
            actions.push(this.createModalButton('丟棄', 'btn-danger', () => {
                this.discardInventoryItem(stack.instanceId);
            }));
        }
        return actions;
    }

    createModalButton(text, className, onClick) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `btn ${className}`;
        button.textContent = text;
        button.addEventListener('click', onClick);
        return button;
    }

    equipInventoryItem(instanceId, slot) {
        if (!GameManager.equipItemToSlot(instanceId, slot)) return false;
        itemDetailModal.close();
        this.renderInventory();
        this.options.onEquipmentChanged?.(slot);
        this.options.onPlayerStateChange?.();
        return true;
    }

    useInventoryItem(instanceId) {
        if (!GameManager.useConsumable(instanceId)) {
            showGlobalToast('無法使用物品', '這個物品目前不能使用。', 'error');
            return false;
        }
        itemDetailModal.close();
        this.renderInventory();
        this.options.onPlayerStateChange?.();
        return true;
    }

    async discardInventoryItem(instanceId) {
        const stack = (GameManager.getInventory() || []).find(entry => entry.instanceId === instanceId);
        if (!stack) return false;
        const itemName = stack.item?.name || '這項物品';
        const quantity = Math.max(1, Number(stack.quantity) || 1);
        const confirmed = await confirmAction({
            title: '確認丟棄',
            message: `丟棄「${itemName}」x${quantity} 後無法復原。`,
            confirmText: '丟棄',
            type: 'danger'
        });
        if (!confirmed) return false;
        if (!GameManager.discardItem(instanceId, false, { force: true })) return false;
        itemDetailModal.close();
        this.renderInventory();
        this.options.onPlayerStateChange?.();
        showGlobalToast('已丟棄', `「${itemName}」已從背包移除。`, 'info');
        return true;
    }
}
