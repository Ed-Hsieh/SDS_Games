/**
 * LobbyScene.js
 * Logic for the Lobby scene (Hall).
 */
import GameManager from '../managers/GameManager.js';
import { enhancementManager } from '../managers/EnhancementManager.js';
import { EquipmentDatabase, SetDatabase } from '../data/Equipment.js';
import { getSellPrice } from '../models/ItemSchema.js';
import { buildItemModalOptions, escapeHtml } from '../utils/ItemDisplay.js';
import { renderVirtualInventoryList, updateVirtualInventoryList } from '../utils/VirtualInventoryList.js';
import { attachItemTooltip } from '../utils/ItemTooltip.js';
import { confirmAction, showGlobalToast } from '../utils/UIFeedback.js';
import { worldInteractionManager } from '../managers/WorldInteractionManager.js';
import { getAllPassiveCombatEffects } from '../data/PassiveCombatEffects.js';

export default class LobbyScene {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.updateUI = this.updateUI.bind(this);
        this.handleWorldInteraction = this.handleWorldInteraction.bind(this);
        this.handleWorldRoute = this.handleWorldRoute.bind(this);
        this.handleSaveExport = this.handleSaveExport.bind(this);
        this.handleSaveImport = this.handleSaveImport.bind(this);
        this.handleSaveFileSelected = this.handleSaveFileSelected.bind(this);
        this.handleSaveReset = this.handleSaveReset.bind(this);
        this.handlePassiveEffectKeydown = this.handlePassiveEffectKeydown.bind(this);
        
        // Warehouse filter state
        this.currentWarehouseFilter = 'all';
        this.currentWarehouseSort = 'time-desc';
        
        // Selected item for modal
        this.selectedItem = null;
        this.selectedItemSource = null; // 'warehouse' or 'inventory'
        this.selectedPassiveSlot = 0;

        this.narrativeLines = [];
        this.ambientTimer = null;
        this.ambientIndex = 0;
        this.lastNarrativeAt = 0;
        this.lastNarrativeTone = null;
    }

    init() {
        try {
            this.cacheDOM();
            this.bindEvents();
            
            // Subscribe to GameManager updates
            GameManager.subscribe(this.updateUI);

            this.initializeTownNarrative();

            // Force initial UI update with current state
            this.updateUI(GameManager.state, 'all');
        } catch (error) {
            console.error('Error initializing Lobby Scene:', error);
        }
    }

    cacheDOM() {
        this.dom = {
            townNarrative: this.container.querySelector('#town-narrative'),
            townNarrativeTitle: this.container.querySelector('#town-narrative-title'),
            townDialogueStream: this.container.querySelector('#town-dialogue-stream'),
            worldStage: this.container.querySelector('#world-stage'),
            worldStoryLog: this.container.querySelector('#world-story-log'),
            saveExport: this.container.querySelector('#btn-save-export'),
            saveImport: this.container.querySelector('#btn-save-import'),
            saveReset: this.container.querySelector('#btn-save-reset'),
            saveFileInput: this.container.querySelector('#save-file-input'),
            
            // Character info
            characterLevel: this.container.querySelector('#character-level'),
            characterGold: this.container.querySelector('#character-gold'),
            characterAtk: this.container.querySelector('#character-atk'),
            characterDef: this.container.querySelector('#character-def'),
            hpBar: this.container.querySelector('#hp-bar'),
            hpText: this.container.querySelector('#hp-text'),
            expBar: this.container.querySelector('#exp-bar'),
            expText: this.container.querySelector('#exp-text'),
            // Character set status
            characterSetStatus: this.container.querySelector('#character-set-status'),
            
            // Inventory and warehouse
            warehouseList: this.container.querySelector('#warehouse-list'),
            inventoryList: this.container.querySelector('#inventory-list'),
            inventoryUsed: this.container.querySelector('#inventory-used'),
            inventoryMax: this.container.querySelector('#inventory-max'),
            
            // Equipment slots
            slotWeapon: this.container.querySelector('#slot-weapon'),
            slotArmor: this.container.querySelector('#slot-armor'),
            slotAccessory: this.container.querySelector('#slot-accessory'),
            // Active set bonuses display
            activeSetBonuses: this.container.querySelector('#active-set-bonuses'),
            passiveEffectSlots: this.container.querySelector('#passive-effect-slots'),
            passiveEffectLibrary: this.container.querySelector('#passive-effect-library'),
            passiveEffectModal: this.container.querySelector('#passive-effect-modal'),
            passiveEffectClose: this.container.querySelector('#passive-effect-close'),
            
            // Modal is provided by centralized ItemDetailModal component
        };
    }

    bindEvents() {
        this.container.querySelectorAll('[data-interaction-id]').forEach(hotspot => {
            hotspot.addEventListener('click', this.handleWorldInteraction);
        });

        this.container.querySelectorAll('[data-route]').forEach(route => {
            route.addEventListener('click', this.handleWorldRoute);
        });

        this.dom.saveExport?.addEventListener('click', this.handleSaveExport);
        this.dom.saveImport?.addEventListener('click', this.handleSaveImport);
        this.dom.saveReset?.addEventListener('click', this.handleSaveReset);
        this.dom.saveFileInput?.addEventListener('change', this.handleSaveFileSelected);

        this.dom.passiveEffectSlots?.addEventListener('click', (event) => {
            const slotEl = event.target.closest?.('[data-passive-slot]');
            if (!slotEl) return;
            this.selectedPassiveSlot = Number(slotEl.dataset.passiveSlot) || 0;
            this.renderPassiveCombatEffects(GameManager.state.character);
            this.openPassiveEffectModal();
        });

        this.dom.passiveEffectLibrary?.addEventListener('click', (event) => {
            const effectEl = event.target.closest?.('[data-passive-effect-id]');
            if (!effectEl) return;
            this.equipPassiveCombatEffect(effectEl.dataset.passiveEffectId);
        });
        this.dom.passiveEffectClose?.addEventListener('click', () => this.closePassiveEffectModal());
        this.dom.passiveEffectModal?.addEventListener('click', (event) => {
            if (event.target === this.dom.passiveEffectModal) this.closePassiveEffectModal();
        });
        document.addEventListener('keydown', this.handlePassiveEffectKeydown);

        // Warehouse filters
        const warehouseFilters = this.container.querySelectorAll('.warehouse-filter');
        warehouseFilters.forEach(filter => {
            filter.addEventListener('click', () => this.switchWarehouseFilter(filter.dataset.filter));
        });

        // Warehouse sort
        const warehouseSort = this.container.querySelector('#warehouse-sort');
        if (warehouseSort) warehouseSort.addEventListener('change', (e) => {
            this.currentWarehouseSort = e.target.value;
            this.renderWarehouse();
        });

        // Equipment slot click events
        if (this.dom.slotWeapon) {
            this.dom.slotWeapon.addEventListener('click', () => {
                const weapon = GameManager.state.character.equipment.weapon;
                if (weapon) this.showEquipmentModal(weapon, 'weapon');
            });
        }
        if (this.dom.slotArmor) {
            this.dom.slotArmor.addEventListener('click', () => {
                const armor = GameManager.state.character.equipment.armor;
                if (armor) this.showEquipmentModal(armor, 'armor');
            });
        }
        if (this.dom.slotAccessory) {
            this.dom.slotAccessory.addEventListener('click', () => {
                const accessory = GameManager.state.character.equipment.accessory;
                if (accessory) this.showEquipmentModal(accessory, 'accessory');
            });
        }

        // Inventory event delegation: single click handler for performance
        if (this.dom.inventoryList) {
            this.dom.inventoryList.addEventListener('click', (e) => this.onInventoryClick(e));
            // virtualization: update visible items on scroll
            this.dom.inventoryList.addEventListener('scroll', () => {
                if (this._invUpdateRAF) return;
                this._invUpdateRAF = requestAnimationFrame(() => {
                    this._invUpdateRAF = null;
                    if (typeof this.updateVisibleInventoryItemsLobby === 'function') this.updateVisibleInventoryItemsLobby();
                });
            });
        }
    }

    onInventoryClick(e) {
        const target = e.target;
        const itemEl = target.closest && target.closest('.inventory-item');
        if (!itemEl) return;
        const instanceId = itemEl.dataset.instanceId;
        if (!instanceId) return;

        // Find the stack in GameManager state
        const stack = GameManager.state.inventory.find(s => s.instanceId === instanceId);
        if (stack) this.showItemModal(stack, 'inventory');
    }

    showItemModal(stack, source) {
        this.selectedItem = stack;
        this.selectedItemSource = source;

        const item = stack.item;
        const isEquipment = item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory';
        const isConsumable = item.type === 'potion' || item.type === 'scroll';
        // Initial action buttons from shared helper (global) if available
        let buttons = [];
        try {
            if (typeof getItemActionButtons === 'function') buttons = getItemActionButtons(stack, source) || [];
        } catch (e) {
            buttons = [];
        }

        // Add source-specific actions
        if (source === 'warehouse') {
            if (isEquipment) {
                buttons.push(this.createButton('⚔️ 裝備', 'btn-primary', () => this.equipItem(stack.instanceId, source)));
                buttons.push(this.createButton('🎒 放入背包', 'btn-success', () => this.moveToInventory(stack.instanceId)));
                buttons.push(this.createButton('💰 販售', 'btn-warning', () => this.sellItem(stack.instanceId, source)));
            } else {
                if (isConsumable) buttons.push(this.createButton('🧪 使用', 'btn-info', () => this.useItem(stack.instanceId, source)));
                buttons.push(this.createButton('🎒 放入背包', 'btn-success', () => this.moveToInventory(stack.instanceId)));
                buttons.push(this.createButton('💰 販售', 'btn-warning', () => this.sellItem(stack.instanceId, source)));
            }
        } else if (source === 'inventory') {
            if (isEquipment) {
                buttons.push(this.createButton('⚔️ 裝備', 'btn-primary', () => this.equipItem(stack.instanceId, source)));
                buttons.push(this.createButton('🏦 放入倉庫', 'btn-success', () => this.moveToWarehouse(stack.instanceId)));
                buttons.push(this.createButton('💰 販售', 'btn-warning', () => this.sellItem(stack.instanceId, source)));
                buttons.push(this.createButton('🗑️ 回收', 'btn-danger', () => this.discardItem(stack.instanceId, source)));
            } else {
                if (isConsumable) buttons.push(this.createButton('🧪 使用', 'btn-info', () => this.useItem(stack.instanceId, source)));
                buttons.push(this.createButton('🏦 放入倉庫', 'btn-success', () => this.moveToWarehouse(stack.instanceId)));
                buttons.push(this.createButton('💰 販售', 'btn-warning', () => this.sellItem(stack.instanceId, source)));
                buttons.push(this.createButton('🗑️ 回收', 'btn-danger', () => this.discardItem(stack.instanceId, source)));
            }
        }

        // Open centralized modal
        if (window.ItemDetailModal) {
            window.ItemDetailModal.open(item, {
                ...buildItemModalOptions(item),
                actions: buttons
            });
        }
    }

    updateUI(state, type) {
        if (!state || !state.character) {
            console.error('Invalid state in LobbyScene.updateUI:', state);
            return;
        }
        
        if (type === 'all' || type === 'character') {
            // Update character display
            if (this.dom.characterLevel) {
                this.dom.characterLevel.textContent = state.character.level || 1;
            }
            if (this.dom.characterGold) {
                this.dom.characterGold.textContent = state.character.gold || 0;
            }
            
            // Sync attack/defense
            const totalAtk = state.character.getTotalAtk ? state.character.getTotalAtk() : (state.character.attack || state.character.baseAtk || 10);
            const totalDef = state.character.getTotalDef ? state.character.getTotalDef() : (state.character.defense || state.character.baseDef || 5);
            
            if (this.dom.characterAtk) {
                this.dom.characterAtk.textContent = totalAtk;
            }
            if (this.dom.characterDef) {
                this.dom.characterDef.textContent = totalDef;
            }
            
            // HP bar
            if (this.dom.hpBar && this.dom.hpText) {
                const currentHP = state.character.hp || state.character.currentHP || 100;
                const maxHP = state.character.maxHp || 100;
                const hpPercent = (currentHP / maxHP) * 100;
                this.dom.hpBar.style.width = `${hpPercent}%`;
                this.dom.hpText.textContent = `${currentHP} / ${maxHP}`;
            }
            
            // EXP bar
            if (this.dom.expBar && this.dom.expText) {
                const currentEXP = state.character.exp || state.character.currentEXP || 0;
                const maxEXP = state.character.maxExp || state.character.maxEXP || 100;
                const expPercent = (currentEXP / maxEXP) * 100;
                this.dom.expBar.style.width = `${expPercent}%`;
                this.dom.expText.textContent = `${currentEXP} / ${maxEXP}`;
            }
            
            // Update equipment slots
            this.updateEquipmentSlots(state.character.equipment);
            this.renderPassiveCombatEffects(state.character);

            // Compute and render active set bonuses (if any)
            try {
                const setResult = enhancementManager.calculateSetBonuses(state.character);
                if (this.dom.activeSetBonuses) {
                    if (setResult.descriptions && setResult.descriptions.length > 0) {
                        this.dom.activeSetBonuses.innerHTML = setResult.descriptions.map(d => `<div class="set-desc">${d}</div>`).join('');
                    } else {
                        this.dom.activeSetBonuses.innerHTML = '';
                    }
                }
            } catch (e) {
                console.warn('Failed to calculate/render set bonuses:', e);
            }

            // Render owned/equipped set goals so set hunting has a visible target.
            try {
                this.renderSetCollectionGoals(state);
            } catch (e) {
                console.warn('Failed to render character set status:', e);
            }
        }
        
        if (type === 'all' || type === 'gold') {
            if (this.dom.characterGold) {
                this.dom.characterGold.textContent = state.character.gold || 0;
            }
        }
        
        if (type === 'all' || type === 'warehouse') {
            this.renderWarehouse();
        }
        
        if (type === 'all' || type === 'inventory') {
            // Update inventory display
            if (this.dom.inventoryUsed && this.dom.inventoryMax) {
                this.dom.inventoryUsed.textContent = state.inventory.length;
                this.dom.inventoryMax.textContent = state.inventoryCapacity || 10;
            }
            
            // Render inventory items using shared virtualization + DOM reuse
            if (this.dom.inventoryList) {
                renderVirtualInventoryList(this, this.dom.inventoryList, state.inventory || [], {
                    stateKey: '_lobbyInventoryList'
                });
            }
        }

        if (type === 'all' || type === 'flags') {
            this.renderWorldStage();
        }

    }

    renderSetCollectionGoals(state) {
        const target = this.dom.characterSetStatus;
        if (!target) return;

        const ownedIds = new Set();
        const equippedIds = new Set();
        const collectFrom = stack => {
            const item = stack?.item || stack;
            if (item?.id) ownedIds.add(item.id);
        };

        Object.values(state?.character?.equipment || {}).forEach(item => {
            if (item?.id) {
                ownedIds.add(item.id);
                equippedIds.add(item.id);
            }
        });
        (state?.inventory || []).forEach(collectFrom);
        (state?.warehouse || []).forEach(collectFrom);

        const goals = Object.values(SetDatabase)
            .filter(setInfo => setInfo && Array.isArray(setInfo.pieces) && setInfo.pieces.length > 0)
            .map(setInfo => {
                const pieces = setInfo.pieces.map(pieceId => {
                    const item = EquipmentDatabase[pieceId] || { id: pieceId, name: pieceId, icon: '◇' };
                    return {
                        id: pieceId,
                        item,
                        owned: ownedIds.has(pieceId),
                        equipped: equippedIds.has(pieceId)
                    };
                });
                const ownedCount = pieces.filter(piece => piece.owned).length;
                const equippedCount = pieces.filter(piece => piece.equipped).length;
                const nextBonus = (setInfo.bonuses || [])
                    .slice()
                    .sort((a, b) => (a.required || 0) - (b.required || 0))
                    .find(bonus => (bonus.required || 0) > equippedCount);
                return {
                    ...setInfo,
                    pieces,
                    ownedCount,
                    equippedCount,
                    total: pieces.length,
                    nextBonus
                };
            })
            .sort((a, b) => {
                if (b.ownedCount !== a.ownedCount) return b.ownedCount - a.ownedCount;
                if (b.equippedCount !== a.equippedCount) return b.equippedCount - a.equippedCount;
                return a.total - b.total;
            });

        const activeGoals = goals.filter(goal => goal.ownedCount > 0);
        const visibleGoals = (activeGoals.length > 0 ? activeGoals : goals).slice(0, 5);
        const completedCount = goals.filter(goal => goal.ownedCount >= goal.total).length;
        const collectingCount = activeGoals.length;

        target.innerHTML = `
            <div class="set-goal-board">
                <div class="set-goal-head">
                    <span>套裝收集</span>
                    <strong>${completedCount}/${goals.length} 完整</strong>
                </div>
                <div class="set-goal-list">
                    ${visibleGoals.map(goal => this.renderSetGoalCard(goal)).join('')}
                </div>
                ${collectingCount === 0
                    ? '<p class="set-goal-note">尚未取得套裝部件。擊敗菁英、BOSS 或副本首領後，相關套裝會在這裡開始追蹤。</p>'
                    : ''}
            </div>
        `;
    }

    renderSetGoalCard(goal) {
        const percent = Math.round((goal.ownedCount / Math.max(1, goal.total)) * 100);
        const missingPieces = goal.pieces.filter(piece => !piece.owned).slice(0, 2);
        const nextText = goal.nextBonus
            ? `${goal.nextBonus.required} 件效果：${goal.nextBonus.name || goal.nextBonus.description || '套裝效果'}`
            : '套裝已收集完整';
        const missingText = missingPieces.length > 0
            ? `缺少 ${missingPieces.map(piece => piece.item.name).join('、')}`
            : '所有部件已取得';

        return `
            <article class="set-goal-card ${goal.ownedCount >= goal.total ? 'is-complete' : ''}">
                <div class="set-goal-title">
                    <span class="set-goal-icon">${goal.icon || '◆'}</span>
                    <strong>${escapeHtml(goal.name || goal.id)}</strong>
                    <span>${goal.ownedCount}/${goal.total}</span>
                </div>
                <div class="set-goal-meter" aria-label="${escapeHtml(goal.name || goal.id)} 收集進度">
                    <div class="set-goal-meter-fill" style="width:${percent}%"></div>
                </div>
                <div class="set-piece-row">
                    ${goal.pieces.map(piece => `
                        <span class="set-piece-chip ${piece.owned ? 'is-owned' : 'is-missing'} ${piece.equipped ? 'is-equipped' : ''}"
                            aria-label="${escapeHtml(piece.item.name || piece.id)}">
                            ${escapeHtml(piece.item.icon || '◇')}
                        </span>
                    `).join('')}
                </div>
                <div class="set-goal-copy">
                    <span>${escapeHtml(nextText)}</span>
                    <small>${escapeHtml(missingText)}</small>
                </div>
            </article>
        `;
    }

    handleWorldInteraction(event) {
        const hotspot = event.currentTarget;
        const interactionId = hotspot?.dataset?.interactionId;
        if (!interactionId) return;

        const outcome = worldInteractionManager.trigger(interactionId, {
            source: 'lobby',
            toast: false
        });
        const title = outcome.interaction?.title || '線索';
        const message = outcome.messages?.join(' ') || '這裡暫時沒有新的變化。';

        this.pushTownNarrative(title, message, outcome.success ? 'discovery' : 'ambient');
        this.renderWorldStage();
    }

    handleWorldRoute(event) {
        const route = event.currentTarget?.dataset?.route;
        if (route) {
            if (typeof this.app?.navigateTo === 'function') {
                this.app.navigateTo(route);
            } else {
                this.app.loadScene(route);
            }
        }
    }

    async handleSaveExport() {
        try {
            const result = await GameManager.writeSaveFile();
            const actionText = result?.mode === 'file-system' ? '已寫入 JSON 存檔' : '已下載 JSON 存檔';
            this.pushTownNarrative('存檔', `${actionText}：${result?.filename || 'sds-save.json'}`, 'discovery');
        } catch (error) {
            if (error?.name === 'AbortError') return;
            console.warn('Save export failed:', error);
            this.pushTownNarrative('存檔失敗', error?.message || '無法匯出存檔。', 'warning');
        }
    }

    handleSaveImport() {
        this.dom.saveFileInput?.click();
    }

    async handleSaveFileSelected(event) {
        const file = event.target?.files?.[0];
        if (!file) return;

        const confirmed = await confirmAction({
            title: '讀取存檔',
            message: '這會覆蓋目前進度，請先確認已經匯出備份。',
            confirmText: '讀取',
            cancelText: '取消',
            type: 'warning'
        });

        if (!confirmed) {
            event.target.value = '';
            return;
        }

        try {
            const saveData = await GameManager.importSaveFile(file);
            this.updateUI(GameManager.state, 'all');
            this.pushTownNarrative('讀取存檔', `已讀取 ${file.name}，版本 ${saveData.schemaVersion || 1}。`, 'discovery');
        } catch (error) {
            console.warn('Save import failed:', error);
            this.pushTownNarrative('讀取失敗', error?.message || '存檔 JSON 格式不正確。', 'warning');
        } finally {
            event.target.value = '';
        }
    }

    async handleSaveReset() {
        const confirmed = await confirmAction({
            title: '重置進度',
            message: '這會清空角色、背包、倉庫、任務、塔與副本進度。',
            confirmText: '重置',
            cancelText: '取消',
            type: 'danger'
        });

        if (!confirmed) return;

        GameManager.resetSaveData();
        this.updateUI(GameManager.state, 'all');
        this.pushTownNarrative('進度重置', '已重置為新遊戲狀態。需要保留時請再匯出 JSON 存檔。', 'warning');
    }

    initializeTownNarrative() {
        if (this.ambientTimer) {
            clearInterval(this.ambientTimer);
            this.ambientTimer = null;
        }

        this.narrativeLines = [];
        if (this.dom.townNarrativeTitle) {
            this.dom.townNarrativeTitle.textContent = this.getTownTitle();
        }
        this.pushTownNarrative('抵達', this.getReturnNarrative(), 'ambient');

        this.ambientTimer = setInterval(() => {
            const recentDiscovery = this.lastNarrativeTone === 'discovery'
                && Date.now() - this.lastNarrativeAt < 30000;
            if (recentDiscovery) return;
            this.pushTownNarrative('片刻', this.getAmbientNarrative(), 'ambient');
        }, 22000);
    }

    getTownFlags() {
        return {
            board: Boolean(GameManager.getFlag('readCrossroadsNoticeBoard')),
            blueprintCache: Boolean(GameManager.getFlag('foundBlueprintCache')),
            ruinTablet: Boolean(GameManager.getFlag('foundRuinTabletTrace')),
            towerGlyph: Boolean(GameManager.getFlag('foundTowerGlyphMemory')),
            dungeonForge: Boolean(GameManager.getFlag('foundDungeonForgeRelic')),
            secretShop: Boolean(GameManager.getFlag('secretShopUnlocked'))
        };
    }

    getReturnNarrative() {
        const flags = this.getTownFlags();

        if (flags.secretShop) {
            return '你從街角回到廣場，市集的燈影裡多了一條不在地圖上的窄路。有人把古代錢幣的符號刻在門框內側。';
        }
        if (flags.ruinTablet) {
            return '拓印紙還帶著石粉，城鎮邊緣的舊路線逐漸連成形狀。鍛造鋪那邊有人在低聲討論洞窟裡的爐火。';
        }
        if (flags.blueprintCache) {
            return '殘破圖紙被攤在桌上晾乾，墨線雖然斷裂，仍能看出幾種可行的鍛造方式。';
        }
        if (flags.board) {
            return '公告欄上的新紙被風吹得沙沙作響，南門路標的拓印讓安全區外的異常變得更難忽略。';
        }

        return '你回到城鎮十字路。天空很藍，鐵匠鋪傳來規律的敲擊聲，公告欄上有幾張剛釘好的紙還沒有被人讀過。';
    }

    getTownTitle() {
        const flags = this.getTownFlags();
        if (flags.secretShop) return '十字路與暗巷';
        if (flags.ruinTablet) return '十字路與舊碑';
        if (flags.blueprintCache) return '十字路與鍛造鋪';
        return '城鎮十字路';
    }

    getAmbientNarrative() {
        const flags = this.getTownFlags();
        const state = GameManager.state;
        const lines = [
            '廣場邊的旗繩輕輕晃動，巡守的人把城門外的塵土掃回石階下。',
            '鍛造鋪的煙囪冒出一縷白煙，爐火忽明忽暗，像是在等新的材料被送進去。',
            '天空很藍，適合把倉庫裡的戰利品重新整理一遍，也適合把下一段路想清楚。',
            '市集那邊傳來收攤前的木箱聲，有人提到城外的道路比昨天安靜太多。'
        ];

        if (flags.board) {
            lines.push('公告欄旁有人停下腳步，又很快離開。那份路標拓印仍指向南門外。');
        }
        if (flags.blueprintCache) {
            lines.push('圖匣碎片被壓在桌角，幾道鍛造線條在燈下變得比白天更清楚。');
        }
        if (flags.ruinTablet) {
            lines.push('石碑拓印乾得很慢，紙面上的刻痕像一條藏在地底的路。');
        }
        if (flags.secretShop) {
            lines.push('市集深處的燈籠沒有掛招牌，卻總有人避開守衛往那裡走。');
        }
        if ((state?.warehouse?.length || 0) > 0) {
            lines.push('倉庫管理員把新到的物品記在薄冊上，空白欄位正好留給下一批戰利品。');
        }

        const line = lines[this.ambientIndex % lines.length];
        this.ambientIndex += 1;
        return line;
    }

    pushTownNarrative(title, message, tone = 'ambient') {
        if (!this.dom?.townDialogueStream) return;

        const allowedTones = new Set(['ambient', 'discovery', 'warning']);
        const safeTone = allowedTones.has(tone) ? tone : 'ambient';

        this.narrativeLines.push({
            title: title || '城鎮片刻',
            message: message || '街道暫時安靜下來。',
            tone: safeTone
        });
        this.lastNarrativeAt = Date.now();
        this.lastNarrativeTone = safeTone;

        if (this.narrativeLines.length > 30) {
            this.narrativeLines.shift();
        }

        if (this.dom.townNarrativeTitle) {
            this.dom.townNarrativeTitle.textContent = this.getTownTitle();
        }
        this.renderTownNarrative();
    }

    renderTownNarrative() {
        if (!this.dom?.townDialogueStream) return;

        const latestLine = this.narrativeLines[this.narrativeLines.length - 1];
        if (!latestLine) return;

        this.dom.townDialogueStream.innerHTML = this.narrativeLines.map(line => `
            <article class="town-story-entry is-${line.tone}">
                <span class="world-log-title">${escapeHtml(line.title)}</span>
                <p class="world-log-message">${escapeHtml(line.message)}</p>
            </article>
        `).join('');

        this.dom.townDialogueStream.scrollTop = this.dom.townDialogueStream.scrollHeight;

        if (this.dom.worldStoryLog) {
            this.dom.worldStoryLog.classList.toggle('is-discovery', latestLine.tone === 'discovery');
            this.dom.worldStoryLog.classList.toggle('is-warning', latestLine.tone === 'warning');
        }
    }

    renderWorldStage() {
        if (!this.dom?.worldStage) return;

        this.container.querySelectorAll('[data-interaction-id]').forEach(hotspot => {
            const interactionId = hotspot.dataset.interactionId;
            hotspot.classList.toggle('is-resolved', worldInteractionManager.hasResolved(interactionId));
        });
    }

    cleanup() {
        // Unsubscribe from GameManager
        GameManager.unsubscribe(this.updateUI);
        if (this._invUpdateRAF) {
            cancelAnimationFrame(this._invUpdateRAF);
            this._invUpdateRAF = null;
        }
        if (this.ambientTimer) {
            clearInterval(this.ambientTimer);
            this.ambientTimer = null;
        }
        document.removeEventListener('keydown', this.handlePassiveEffectKeydown);
    }

    handlePassiveEffectKeydown(event) {
        if (event.key === 'Escape' && this.dom?.passiveEffectModal?.classList.contains('active')) {
            this.closePassiveEffectModal();
        }
    }

    openPassiveEffectModal() {
        if (!this.dom?.passiveEffectModal) return;
        this.dom.passiveEffectModal.classList.add('active');
        this.dom.passiveEffectModal.setAttribute('aria-hidden', 'false');
        this.dom.passiveEffectLibrary?.querySelector('.passive-effect-choice.is-equipped')?.focus?.();
    }

    closePassiveEffectModal() {
        if (!this.dom?.passiveEffectModal) return;
        this.dom.passiveEffectModal.classList.remove('active');
        this.dom.passiveEffectModal.setAttribute('aria-hidden', 'true');
    }

    formatPassiveBonusText(effect) {
        const bonuses = effect?.bonuses || {};
        const percent = (value) => `+${Math.round(Number(value || 0) * 100)}%`;
        const reduction = (value) => `-${Math.round(Number(value || 0) * 100)}%`;
        const rows = [];
        if (bonuses.critChance) rows.push(`爆擊率 ${percent(bonuses.critChance)}`);
        if (bonuses.critDamage) rows.push(`爆擊傷害 ${percent(bonuses.critDamage)}`);
        if (bonuses.attackSpeed) rows.push(`攻擊頻率 ${percent(bonuses.attackSpeed)}`);
        if (bonuses.atkPercent) rows.push(`攻擊 ${percent(bonuses.atkPercent)}`);
        if (bonuses.defPercent) rows.push(`防禦 ${percent(bonuses.defPercent)}`);
        if (bonuses.atk) rows.push(`攻擊 +${bonuses.atk}`);
        if (bonuses.def) rows.push(`防禦 +${bonuses.def}`);
        if (bonuses.poisonMitigation) rows.push(`中毒傷害 ${reduction(bonuses.poisonMitigation)}`);
        if (bonuses.coldGainReduction) rows.push(`寒冷累積 ${reduction(bonuses.coldGainReduction)}`);
        if (bonuses.coldMitigation) rows.push(`冰雪傷害 ${reduction(bonuses.coldMitigation)}`);
        if (bonuses.snowSupplySaving) rows.push(`補給節省 ${Math.round(Number(bonuses.snowSupplySaving || 0) * 100)}%`);
        if (bonuses.burnMitigation) rows.push(`灼熱傷害 ${reduction(bonuses.burnMitigation)}`);
        if (bonuses.durabilityLossReduction) rows.push(`耐久磨耗 ${reduction(bonuses.durabilityLossReduction)}`);
        if (bonuses.lostChanceReduction) rows.push(`迷路機率 ${reduction(bonuses.lostChanceReduction)}`);
        if (bonuses.markerRequirementReduction) rows.push(`路標需求 -${bonuses.markerRequirementReduction}`);
        if (bonuses.retreatCostReduction) rows.push(`撤退代價 ${reduction(bonuses.retreatCostReduction)}`);
        if (bonuses.fleeChanceBonus) rows.push(`撤退成功 ${percent(bonuses.fleeChanceBonus)}`);
        if (bonuses.puzzleClueBonus) rows.push(`石碑判讀 +${bonuses.puzzleClueBonus}`);
        if (bonuses.trapDamageReduction) rows.push(`陷阱傷害 ${reduction(bonuses.trapDamageReduction)}`);
        if (bonuses.healingReceived) rows.push(`恢復量 ${percent(bonuses.healingReceived)}`);
        if (bonuses.bossDamageReduction) rows.push(`Boss 傷害 ${reduction(bonuses.bossDamageReduction)}`);
        if (bonuses.eliteDamageReduction) rows.push(`菁英傷害 ${reduction(bonuses.eliteDamageReduction)}`);
        return rows.join(' / ') || '無效果';
    }

    renderPassiveCombatEffects(character) {
        if (!this.dom?.passiveEffectSlots || !this.dom?.passiveEffectLibrary || !character) return;

        const slotCount = Math.max(1, Number(character.passiveEffectSlots) || 1);
        this.selectedPassiveSlot = Math.max(0, Math.min(slotCount - 1, this.selectedPassiveSlot || 0));

        const equippedIds = Array.isArray(character.equippedPassiveEffectIds)
            ? character.equippedPassiveEffectIds
            : (character.getActivePassiveCombatEffects?.() || []).map(effect => effect.id);
        const unlockedIds = new Set(Array.isArray(character.unlockedPassiveEffectIds) ? character.unlockedPassiveEffectIds : []);
        const effects = getAllPassiveCombatEffects();

        this.dom.passiveEffectSlots.innerHTML = Array.from({ length: slotCount }, (_, index) => {
            const effectId = equippedIds[index];
            const effect = effects.find(item => item.id === effectId);
            const selectedClass = '';
            if (!effect) {
                return `
                    <button class="passive-effect-slot is-empty${selectedClass}" type="button" data-passive-slot="${index}" aria-haspopup="dialog">
                        <span class="passive-effect-slot-index">${index + 1}</span>
                        <span class="passive-effect-copy">
                            <strong>未裝備技能</strong>
                            <small>選擇一個常駐效果</small>
                        </span>
                        <span class="passive-effect-action">選擇</span>
                    </button>
                `;
            }

            return `
                <button class="passive-effect-slot rarity-frame rarity-${escapeHtml(effect.rarity || 'common')}${selectedClass}" type="button" data-passive-slot="${index}" aria-haspopup="dialog">
                    <span class="passive-effect-icon">${escapeHtml(effect.icon || '◆')}</span>
                    <span class="passive-effect-copy">
                        <strong>${escapeHtml(effect.name)}</strong>
                        <small>${escapeHtml(this.formatPassiveBonusText(effect))}</small>
                    </span>
                    <span class="passive-effect-action">更換</span>
                </button>
            `;
        }).join('');

        this.dom.passiveEffectLibrary.innerHTML = effects.map(effect => {
            const unlocked = unlockedIds.has(effect.id);
            const equipped = equippedIds.includes(effect.id);
            const disabledClass = unlocked ? '' : ' is-locked';
            const equippedClass = equipped ? ' is-equipped' : '';
            return `
                <button class="passive-effect-choice rarity-frame rarity-${escapeHtml(effect.rarity || 'common')}${disabledClass}${equippedClass}"
                    type="button"
                    data-passive-effect-id="${escapeHtml(effect.id)}"
                    ${unlocked ? '' : 'disabled'}>
                    <span class="passive-effect-icon">${escapeHtml(effect.icon || '◆')}</span>
                    <span class="passive-effect-choice-copy">
                        <strong>${escapeHtml(effect.name)}</strong>
                        <small>${escapeHtml(this.formatPassiveBonusText(effect))}</small>
                    </span>
                    <span class="passive-effect-state">${equipped ? '已裝備' : (unlocked ? '可替換' : '未解鎖')}</span>
                </button>
            `;
        }).join('');
    }

    equipPassiveCombatEffect(effectId) {
        const character = GameManager.state.character;
        if (!character?.equipPassiveCombatEffect) return;

        const ok = character.equipPassiveCombatEffect(effectId, this.selectedPassiveSlot);
        if (!ok) {
            showGlobalToast('無法替換', '這個戰術技能尚未解鎖。', 'warning');
            return;
        }

        GameManager.markSaveDirty?.('passive-combat-effect');
        GameManager.notify('all');
        this.renderPassiveCombatEffects(character);
        this.closePassiveEffectModal();
        showGlobalToast('戰術技能已替換', '新的常駐效果會直接套用在接下來的探索與戰鬥。', 'success');
    }
    
    updateEquipmentSlots(equipment) {
        // Update weapon slot
        if (this.dom.slotWeapon) {
            const weapon = equipment.weapon;
            if (weapon) {
                this.dom.slotWeapon.classList.remove('empty');
                const iconEl = this.dom.slotWeapon.querySelector('.equipment-slot-icon');
                if (weapon.image) {
                    iconEl.innerHTML = `<img src="${weapon.image}" alt="${weapon.name}" style="width: 100%; height: 100%; object-fit: contain;">`;
                } else {
                    iconEl.innerHTML = weapon.icon || '⚔️';
                }
                this.dom.slotWeapon.querySelector('.equipment-slot-name').textContent = weapon.name;
            } else {
                this.dom.slotWeapon.classList.add('empty');
                this.dom.slotWeapon.querySelector('.equipment-slot-icon').innerHTML = '⚔️';
                this.dom.slotWeapon.querySelector('.equipment-slot-name').textContent = '未裝備';
            }
        }
        
        // Update armor slot
        if (this.dom.slotArmor) {
            const armor = equipment.armor;
            if (armor) {
                this.dom.slotArmor.classList.remove('empty');
                const iconEl = this.dom.slotArmor.querySelector('.equipment-slot-icon');
                if (armor.image) {
                    iconEl.innerHTML = `<img src="${armor.image}" alt="${armor.name}" style="width: 100%; height: 100%; object-fit: contain;">`;
                } else {
                    iconEl.innerHTML = armor.icon || '🛡️';
                }
                this.dom.slotArmor.querySelector('.equipment-slot-name').textContent = armor.name;
            } else {
                this.dom.slotArmor.classList.add('empty');
                this.dom.slotArmor.querySelector('.equipment-slot-icon').innerHTML = '🛡️';
                this.dom.slotArmor.querySelector('.equipment-slot-name').textContent = '未裝備';
            }
        }
        
        // Update accessory slot
        if (this.dom.slotAccessory) {
            const accessory = equipment.accessory;
            if (accessory) {
                this.dom.slotAccessory.classList.remove('empty');
                const iconEl = this.dom.slotAccessory.querySelector('.equipment-slot-icon');
                if (accessory.image) {
                    iconEl.innerHTML = `<img src="${accessory.image}" alt="${accessory.name}" style="width: 100%; height: 100%; object-fit: contain;">`;
                } else {
                    iconEl.innerHTML = accessory.icon || '💍';
                }
                this.dom.slotAccessory.querySelector('.equipment-slot-name').textContent = accessory.name;
            } else {
                this.dom.slotAccessory.classList.add('empty');
                this.dom.slotAccessory.querySelector('.equipment-slot-icon').innerHTML = '💍';
                this.dom.slotAccessory.querySelector('.equipment-slot-name').textContent = '未裝備';
            }
        }
    }

    // Update visible inventory items for Lobby virtualization
    updateVisibleInventoryItemsLobby() {
        updateVirtualInventoryList(this, '_lobbyInventoryList');
    }
    
    // ===== Warehouse Methods =====
    
    renderWarehouse() {
        const state = GameManager.state;
        if (!this.dom.warehouseList || !state.warehouse) return;
        let filteredItems = [...state.warehouse];

        // Apply filter
        if (this.currentWarehouseFilter !== 'all') {
            filteredItems = filteredItems.filter(stack => stack.item.type === this.currentWarehouseFilter);
        }

        // Apply sort
        const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
        filteredItems.sort((a, b) => {
            switch (this.currentWarehouseSort) {
                case 'time-desc': return (b.item.acquiredTime || 0) - (a.item.acquiredTime || 0);
                case 'time-asc': return (a.item.acquiredTime || 0) - (b.item.acquiredTime || 0);
                case 'rarity-desc': return (rarityOrder[b.item.rarity] || 0) - (rarityOrder[a.item.rarity] || 0);
                case 'rarity-asc': return (rarityOrder[a.item.rarity] || 0) - (rarityOrder[b.item.rarity] || 0);
                default: return 0;
            }
        });

        // Chunked rendering using PerformanceUtils
        const container = this.dom.warehouseList;
        container.innerHTML = '';
        if (!filteredItems || filteredItems.length === 0) {
            container.innerHTML = '<div class="empty-hint">倉庫空空如也...</div>';
            return;
        }

        // Use processInChunks to avoid long main-thread tasks
        if (window.PerformanceUtils && typeof window.PerformanceUtils.processInChunks === 'function') {
            window.PerformanceUtils.processInChunks(filteredItems, (stack) => {
                const item = stack.item;
                const itemEl = document.createElement('div');
                itemEl.className = `item-card warehouse-item rarity-frame rarity-${item.rarity || 'common'}`;

                let iconHTML;
                if (item.image) iconHTML = `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: contain;">`;
                else iconHTML = item.icon || '📦';

                itemEl.innerHTML = `
                    <div class="item-icon">${iconHTML}${stack.quantity > 1 ? `<span class="quantity-badge">x${stack.quantity}</span>` : ''}</div>
                    <div class="item-info"><div class="item-name">${item.name}</div></div>
                `;
                attachItemTooltip(itemEl, item, { quantity: stack.quantity || 1, hint: '點擊開啟操作' });
                itemEl.addEventListener('click', () => this.showItemModal(stack, 'warehouse'));
                container.appendChild(itemEl);
            }, {chunkSize: 40}).then(() => {
                // done
            });
        } else {
            // Fallback synchronous render
            filteredItems.forEach(stack => {
                const item = stack.item;
                const itemEl = document.createElement('div');
                itemEl.className = `item-card warehouse-item rarity-frame rarity-${item.rarity || 'common'}`;

                let iconHTML;
                if (item.image) iconHTML = `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: contain;">`;
                else iconHTML = item.icon || '📦';

                itemEl.innerHTML = `
                    <div class="item-icon">${iconHTML}${stack.quantity > 1 ? `<span class="quantity-badge">x${stack.quantity}</span>` : ''}</div>
                    <div class="item-info"><div class="item-name">${item.name}</div></div>
                `;
                attachItemTooltip(itemEl, item, { quantity: stack.quantity || 1, hint: '點擊開啟操作' });
                itemEl.addEventListener('click', () => this.showItemModal(stack, 'warehouse'));
                container.appendChild(itemEl);
            });
        }
    }
    
    switchWarehouseFilter(filter) {
        this.currentWarehouseFilter = filter;
        
        // Update active state
        const filters = this.container.querySelectorAll('.warehouse-filter');
        filters.forEach(f => {
            if (f.dataset.filter === filter) {
                f.classList.add('active');
            } else {
                f.classList.remove('active');
            }
        });
        
        this.renderWarehouse();
    }
    
    showEquipmentModal(item, slotType) {
        const unequipBtn = this.createButton('🔓 卸下裝備', 'btn-warning', () => this.unequipItem(slotType));

        if (window.ItemDetailModal) {
            window.ItemDetailModal.open(item, {
                ...buildItemModalOptions(item),
                actions: [unequipBtn]
            });
        }
    }
    
    createButton(text, className, onClick) {
        const btn = document.createElement('button');
        btn.className = `btn ${className}`;
        btn.textContent = text;
        btn.addEventListener('click', onClick);
        return btn;
    }
    
    closeItemModal() {
        if (this.dom.itemModal) {
            this.dom.itemModal.classList.remove('active');
        }
        this.selectedItem = null;
        this.selectedItemSource = null;
    }
    
    // ===== Item Actions =====
    
    equipItem(instanceId, source) {
        const success = GameManager.equipItem(instanceId, source === 'warehouse');
        if (success) {
            this.closeItemModal();
            if (window.ItemDetailModal && typeof window.ItemDetailModal.close === 'function') window.ItemDetailModal.close();
        }
    }
    
    useItem(instanceId, source) {
        const success = GameManager.useConsumable(instanceId, source === 'warehouse');
        if (success) {
            this.closeItemModal();
            if (window.ItemDetailModal && typeof window.ItemDetailModal.close === 'function') window.ItemDetailModal.close();
        } else {
            showGlobalToast('無法使用物品', '這個物品目前不能使用。', 'error');
        }
    }
    
    moveToWarehouse(instanceId) {
        const success = GameManager.moveToWarehouse(instanceId);
        if (success) {
            this.closeItemModal();
            if (window.ItemDetailModal && typeof window.ItemDetailModal.close === 'function') window.ItemDetailModal.close();
        } else {
            showGlobalToast('移動失敗', '無法將物品放入倉庫。', 'error');
        }
    }
    
    moveToInventory(instanceId) {
        const success = GameManager.moveToInventory(instanceId);
        if (success) {
            this.closeItemModal();
            if (window.ItemDetailModal && typeof window.ItemDetailModal.close === 'function') window.ItemDetailModal.close();
        } else {
            showGlobalToast('背包已滿', '請先整理背包或移動物品到倉庫。', 'warning');
        }
    }
    
    async sellItem(instanceId, source) {
        const sourceArray = source === 'warehouse' ? GameManager.state.warehouse : GameManager.state.inventory;
        const stack = sourceArray.find(s => s.instanceId === instanceId);
        
        if (!stack) return;
        
        const sellPrice = getSellPrice(stack.item, stack.quantity);
        const confirmed = await confirmAction({
            title: '確認出售',
            message: `出售「${stack.item.name}」x${stack.quantity} 後會從${source === 'warehouse' ? '倉庫' : '背包'}移除。`,
            details: [`可獲得 ${sellPrice} 金幣`],
            confirmText: '出售',
            type: 'warning'
        });
        
        if (confirmed) {
            const earnedGold = GameManager.sellItem(instanceId, source === 'warehouse');
            if (earnedGold !== false) {
                this.closeItemModal();
                if (window.ItemDetailModal && typeof window.ItemDetailModal.close === 'function') window.ItemDetailModal.close();
                showGlobalToast('出售完成', `已出售「${stack.item.name}」，獲得 ${earnedGold} 金幣。`, 'success');
            }
        }
    }
    
    async discardItem(instanceId, source) {
        const sourceArray = source === 'warehouse' ? GameManager.state.warehouse : GameManager.state.inventory;
        const stack = sourceArray.find(s => s.instanceId === instanceId);
        
        if (!stack) return;
        
        const result = GameManager.discardItem(instanceId, source === 'warehouse');
        
        if (result === 'confirm') {
            const confirmed = await confirmAction({
                title: '確認回收稀有物品',
                message: `「${stack.item.name}」是 ${stack.item.rarity} 稀有度物品，回收後會永久移除。`,
                confirmText: '回收',
                type: 'danger'
            });
            if (confirmed) {
                // Force discard
                const index = sourceArray.findIndex(s => s.instanceId === instanceId);
                if (index > -1) {
                    sourceArray.splice(index, 1);
                    GameManager.notify(source === 'warehouse' ? 'warehouse' : 'inventory');
                    this.closeItemModal();
                    if (window.ItemDetailModal && typeof window.ItemDetailModal.close === 'function') window.ItemDetailModal.close();
                    showGlobalToast('已回收物品', `「${stack.item.name}」已移除。`, 'info');
                }
            }
        } else if (result === true) {
            this.closeItemModal();
            if (window.ItemDetailModal && typeof window.ItemDetailModal.close === 'function') window.ItemDetailModal.close();
            showGlobalToast('已回收物品', `「${stack.item.name}」已移除。`, 'info');
        }
    }
    
    unequipItem(slotType) {
        const item = GameManager.state.character.equipment[slotType];
        if (!item) return;
        
        // Check inventory capacity
        if (GameManager.state.inventory.length >= GameManager.state.inventoryCapacity) {
            showGlobalToast('背包已滿', '請先整理背包再卸下裝備。', 'warning');
            return;
        }
        
        // Unequip and add to inventory
        GameManager.state.character.equipment[slotType] = null;
        GameManager.addToInventory(item, 1);
        
        // 通知 UI 更新
        GameManager.notify('all');
        
        this.closeItemModal();
        if (window.ItemDetailModal && typeof window.ItemDetailModal.close === 'function') window.ItemDetailModal.close();
        this.updateUI(GameManager.state, 'all');
    }
    
}
