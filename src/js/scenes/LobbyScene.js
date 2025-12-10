/**
 * LobbyScene.js
 * Logic for the Lobby scene (Hall).
 */
import GameManager from '../managers/GameManager.js';
import { enhancementSystem } from './EnhancementSystem.js';
import { SetDatabase } from '../data/Equipment.js';

export default class LobbyScene {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.updateUI = this.updateUI.bind(this);
        
        // Warehouse filter state
        this.currentWarehouseFilter = 'all';
        this.currentWarehouseSort = 'time-desc';
        
        // Selected item for modal
        this.selectedItem = null;
        this.selectedItemSource = null; // 'warehouse' or 'inventory'
    }

    init() {
        console.log('Lobby Scene Initialized');
        
        try {
            this.cacheDOM();
            this.bindEvents();
            
            // Subscribe to GameManager updates
            GameManager.subscribe(this.updateUI);
            
            // Force initial UI update with current state
            this.updateUI(GameManager.state, 'all');
        } catch (error) {
            console.error('Error initializing Lobby Scene:', error);
        }
    }

    cacheDOM() {
        this.dom = {
            // Navigation buttons
            btnGoShop: this.container.querySelector('#btn-go-shop'),
            btnGoForge: this.container.querySelector('#btn-go-forge'),
            btnGoGamble: this.container.querySelector('#btn-go-gamble'),
            btnGoQuest: this.container.querySelector('#btn-go-quest'),
            btnGoTower: this.container.querySelector('#btn-go-tower'),
            btnStartAdventure: this.container.querySelector('#btn-start-adventure'),
            
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
            
            // Modal is provided by centralized ItemDetailModal component
        };
    }

    bindEvents() {
        // Navigation
        if (this.dom.btnGoShop) {
            this.dom.btnGoShop.addEventListener('click', () => this.app.loadScene('shop'));
        }
        if (this.dom.btnGoForge) {
            this.dom.btnGoForge.addEventListener('click', () => this.app.loadScene('forge'));
        }
        if (this.dom.btnGoGamble) {
            this.dom.btnGoGamble.addEventListener('click', () => this.app.loadScene('casino'));
        }
        if (this.dom.btnGoQuest) {
            this.dom.btnGoQuest.addEventListener('click', () => this.app.loadScene('quest'));
        }
        if (this.dom.btnGoTower) {
            this.dom.btnGoTower.addEventListener('click', () => this.app.loadScene('tower'));
        }
        if (this.dom.btnStartAdventure) {
            this.dom.btnStartAdventure.addEventListener('click', () => this.app.loadScene('adventure'));
        }

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

        // Build statsHtml
        let statsHtml = '';
        if (item.atk || item.attack) statsHtml += `<div class="item-detail-stat"><span>⚔️ 攻擊力</span><span class="value">+${item.atk || item.attack}</span></div>`;
        if (item.def || item.defense) statsHtml += `<div class="item-detail-stat"><span>🛡️ 防禦力</span><span class="value">+${item.def || item.defense}</span></div>`;
        if (item.critChance) statsHtml += `<div class="item-detail-stat"><span>💥 爆擊率</span><span class="value">${(item.critChance * 100).toFixed(0)}%</span></div>`;
        if (item.critDamage) statsHtml += `<div class="item-detail-stat"><span>⚡ 爆擊傷害</span><span class="value">${(item.critDamage * 100).toFixed(0)}%</span></div>`;
        if (item.weaponSpeed) statsHtml += `<div class="item-detail-stat"><span>⏱️ 武器速度</span><span class="value">${(item.weaponSpeed || 0).toFixed ? item.weaponSpeed.toFixed(1) + 'x' : item.weaponSpeed}</span></div>`;
        if (item.attackSpeed) statsHtml += `<div class="item-detail-stat"><span>⚡ 攻擊速度</span><span class="value">${(item.attackSpeed || 0).toFixed ? item.attackSpeed.toFixed(1) + 'x' : item.attackSpeed}</span></div>`;
        if (item.hp) statsHtml += `<div class="item-detail-stat"><span>❤️ 恢復 HP</span><span class="value">+${item.hp}</span></div>`;
        if (item.mp) statsHtml += `<div class="item-detail-stat"><span>💙 恢復 MP</span><span class="value">+${item.mp}</span></div>`;

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
                buttons.push(this.createButton('✅ 裝備', 'btn-primary', () => this.equipItem(stack.instanceId, source)));
                buttons.push(this.createButton('✅ 放入背包', 'btn-success', () => this.moveToInventory(stack.instanceId)));
                buttons.push(this.createButton('✅ 販售', 'btn-warning', () => this.sellItem(stack.instanceId, source)));
            } else {
                if (isConsumable) buttons.push(this.createButton('✅ 使用', 'btn-info', () => this.useItem(stack.instanceId, source)));
                buttons.push(this.createButton('✅ 放入背包', 'btn-success', () => this.moveToInventory(stack.instanceId)));
                buttons.push(this.createButton('✅ 販售', 'btn-warning', () => this.sellItem(stack.instanceId, source)));
            }
        } else if (source === 'inventory') {
            if (isEquipment) {
                buttons.push(this.createButton('✅ 裝備', 'btn-primary', () => this.equipItem(stack.instanceId, source)));
                buttons.push(this.createButton('✅ 放入倉庫', 'btn-success', () => this.moveToWarehouse(stack.instanceId)));
                buttons.push(this.createButton('✅ 販售', 'btn-warning', () => this.sellItem(stack.instanceId, source)));
                buttons.push(this.createButton('✅ 丟棄', 'btn-danger', () => this.discardItem(stack.instanceId, source)));
            } else {
                if (isConsumable) buttons.push(this.createButton('✅ 使用', 'btn-info', () => this.useItem(stack.instanceId, source)));
                buttons.push(this.createButton('✅ 放入倉庫', 'btn-success', () => this.moveToWarehouse(stack.instanceId)));
                buttons.push(this.createButton('✅ 販售', 'btn-warning', () => this.sellItem(stack.instanceId, source)));
                buttons.push(this.createButton('✅ 丟棄', 'btn-danger', () => this.discardItem(stack.instanceId, source)));
            }
        }

        // Open centralized modal
        if (window.ItemDetailModal) {
            window.ItemDetailModal.open(item, {
                typeText: this.getItemTypeText ? this.getItemTypeText(item.type) : (item.type || ''),
                description: item.description || item.desc || '沒有描述',
                statsHtml: statsHtml,
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

            // Compute and render active set bonuses (if any)
            try {
                const setResult = enhancementSystem.calculateSetBonuses(state.character);
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

            // Render per-set status under CHARACTER (name: equipped/total — active effects)
            try {
                if (this.dom.characterSetStatus) {
                    const equippedIds = [];
                    if (state.character && state.character.equipment) {
                        for (const slot in state.character.equipment) {
                            const itm = state.character.equipment[slot];
                            if (itm && itm.id) equippedIds.push(itm.id);
                        }
                    }

                    const lines = [];
                    for (const setId of Object.keys(SetDatabase)) {
                        const setInfo = SetDatabase[setId];
                        if (!setInfo || !Array.isArray(setInfo.pieces)) continue;
                        const total = setInfo.pieces.length;
                        const count = setInfo.pieces.filter(pid => equippedIds.includes(pid)).length;
                        if (count === 0) continue; // only show sets with at least one piece equipped

                        // Title: 套裝名稱 (X/X)
                        const titleHtml = `<div class="set-line set-title">${setInfo.name} (${count}/${total})</div>`;

                        // Build bonuses (only show active ones). If none active, only show title.
                        const bonuses = Array.isArray(setInfo.bonuses) ? [...setInfo.bonuses].sort((a, b) => (a.required || 0) - (b.required || 0)) : [];
                        const activeBonuses = bonuses.filter(b => (b.required || 0) <= count);

                        if (activeBonuses.length > 0) {
                            const bonusHtml = activeBonuses.map(b => {
                                const req = b.required || 0;
                                const name = b.name || (req + '件');
                                const desc = b.description || b.name || (b.effects ? JSON.stringify(b.effects) : '');
                                return `<div class="set-bonus set-bonus-active">${name}: ${desc}</div>`;
                            }).join('');

                            lines.push(titleHtml + bonusHtml);
                        } else {
                            // only show the title to notify player they have partial set
                            lines.push(titleHtml);
                        }
                    }

                    this.dom.characterSetStatus.innerHTML = lines.length > 0 ? lines.join('') : '';
                }
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
            
            // Render inventory items using virtualization + DOM reuse
            if (this.dom.inventoryList) {
                const container = this.dom.inventoryList;
                const items = state.inventory || [];

                // Fixed item height (adjust to match CSS)
                const ITEM_HEIGHT = 84;

                // Ensure container styling
                container.style.position = 'relative';
                container.style.overflowY = 'auto';

                // Spacer controls full scroll height
                let spacer = container.querySelector('.inv-spacer');
                if (!spacer) {
                    spacer = document.createElement('div');
                    spacer.className = 'inv-spacer';
                    container.appendChild(spacer);
                }
                spacer.style.height = (items.length * ITEM_HEIGHT) + 'px';

                // Pool wrapper holds reused nodes
                let pool = container.querySelector('.inv-pool');
                if (!pool) {
                    pool = document.createElement('div');
                    pool.className = 'inv-pool';
                    pool.style.position = 'absolute';
                    pool.style.top = '0';
                    pool.style.left = '0';
                    pool.style.right = '0';
                    container.appendChild(pool);
                }

                if (!items || items.length === 0) {
                    pool.innerHTML = '';
                    spacer.style.height = '0px';
                    container.innerHTML = '<div class="empty-hint">背包空空如也...</div>';
                    return;
                }

                // Save for scroll updates
                this._lobbyInv = items;
                this._lobbyItemHeight = ITEM_HEIGHT;
                this._lobbyInvContainer = container;
                this._lobbyPoolWrapper = pool;

                // Determine pool size
                const viewportHeight = container.clientHeight || 400;
                const visibleCount = Math.ceil(viewportHeight / ITEM_HEIGHT);
                const buffer = 4;
                const poolSize = visibleCount + buffer * 2;

                if (!this._lobbyPool || this._lobbyPool.length !== poolSize) {
                    this._lobbyPool = [];
                    pool.innerHTML = '';
                    for (let i = 0; i < poolSize; i++) {
                        const node = document.createElement('div');
                        node.className = 'item-card inventory-item';
                        node.style.position = 'absolute';
                        node.style.left = '0';
                        node.style.right = '0';
                        node.style.height = ITEM_HEIGHT + 'px';
                        pool.appendChild(node);
                        this._lobbyPool.push(node);
                    }
                }

                // Initial render
                if (typeof this.updateVisibleInventoryItemsLobby === 'function') this.updateVisibleInventoryItemsLobby();
            }
        }
    }

    cleanup() {
        // Unsubscribe from GameManager
        GameManager.unsubscribe(this.updateUI);
        console.log('Lobby Scene Cleaned up');
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
        const container = this._lobbyInvContainer;
        const items = this._lobbyInv || [];
        const ITEM_HEIGHT = this._lobbyItemHeight || 84;
        const pool = this._lobbyPool || [];
        if (!container || pool.length === 0) return;

        const scrollTop = container.scrollTop || 0;
        const viewportHeight = container.clientHeight || 400;
        const firstIndex = Math.floor(scrollTop / ITEM_HEIGHT);
        const visibleCount = Math.ceil(viewportHeight / ITEM_HEIGHT);
        const buffer = Math.floor(pool.length - visibleCount > 0 ? (pool.length - visibleCount) / 2 : 2);
        const start = Math.max(0, firstIndex - buffer);

        for (let i = 0; i < pool.length; i++) {
            const dataIndex = start + i;
            const node = pool[i];
            if (dataIndex >= 0 && dataIndex < items.length) {
                const stack = items[dataIndex];
                const item = stack.item;
                node.style.display = '';
                node.dataset.instanceId = stack.instanceId;
                node.className = `item-card inventory-item rarity-${item.rarity}`;
                node.style.transform = `translateY(${dataIndex * ITEM_HEIGHT}px)`;

                let iconHTML = item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: contain;">` : (item.icon || '📦');
                node.innerHTML = `
                    <div class="item-icon">
                        ${iconHTML}
                        ${stack.quantity > 1 ? `<span class="quantity-badge">x${stack.quantity}</span>` : ''}
                    </div>
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                    </div>
                `;
            } else {
                node.style.display = 'none';
            }
        }
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
                itemEl.className = `item-card warehouse-item rarity-${item.rarity}`;

                let iconHTML;
                if (item.image) iconHTML = `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: contain;">`;
                else iconHTML = item.icon || '📦';

                itemEl.innerHTML = `
                    <div class="item-icon">${iconHTML}${stack.quantity > 1 ? `<span class="quantity-badge">x${stack.quantity}</span>` : ''}</div>
                    <div class="item-info"><div class="item-name">${item.name}</div></div>
                `;
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
                itemEl.className = `item-card warehouse-item rarity-${item.rarity}`;

                let iconHTML;
                if (item.image) iconHTML = `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: contain;">`;
                else iconHTML = item.icon || '📦';

                itemEl.innerHTML = `
                    <div class="item-icon">${iconHTML}${stack.quantity > 1 ? `<span class="quantity-badge">x${stack.quantity}</span>` : ''}</div>
                    <div class="item-info"><div class="item-name">${item.name}</div></div>
                `;
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
        // Build statsHtml for centralized modal
        let statsHtml = '';
        if (item.atk || item.attack) statsHtml += `<div class="item-detail-stat"><span>⚔️ 攻擊力</span><span class="value">+${item.atk || item.attack}</span></div>`;
        if (item.def || item.defense) statsHtml += `<div class="item-detail-stat"><span>🛡️ 防禦力</span><span class="value">+${item.def || item.defense}</span></div>`;
        if (item.critChance) statsHtml += `<div class="item-detail-stat"><span>💥 爆擊率</span><span class="value">${(item.critChance * 100).toFixed(0)}%</span></div>`;
        if (item.critDamage) statsHtml += `<div class="item-detail-stat"><span>⚡ 爆擊傷害</span><span class="value">${(item.critDamage * 100).toFixed(0)}%</span></div>`;
        if (item.weaponSpeed) statsHtml += `<div class="item-detail-stat"><span>⏱️ 武器速度</span><span class="value">${item.weaponSpeed.toFixed(1)}x</span></div>`;
        if (item.attackSpeed) statsHtml += `<div class="item-detail-stat"><span>⚡ 攻擊速度</span><span class="value">${item.attackSpeed.toFixed(1)}x</span></div>`;
        if (item.durability !== undefined) statsHtml += `<div class="item-detail-stat"><span>🔧 耐久度</span><span class="value">${item.durability}/${item.maxDurability || 50}</span></div>`;
        if (item.affixes && item.affixes.length > 0) {
            statsHtml += `<div class="item-affixes-section"><div class="affixes-title">✨ 詞綴</div>`;
            item.affixes.forEach(affix => {
                const affixDesc = this.formatAffixStats(affix.stats);
                statsHtml += `<div class="item-affix ${affix.rarity}"><span class="affix-name">${affix.name}</span><span class="affix-stats">${affixDesc}</span></div>`;
            });
            statsHtml += `</div>`;
        }

        const unequipBtn = this.createButton('🔓 卸下裝備', 'btn-warning', () => this.unequipItem(slotType));

        if (window.ItemDetailModal) {
            window.ItemDetailModal.open(item, {
                typeText: this.getItemTypeText(item.type),
                description: item.desc || item.description || '無描述',
                statsHtml: statsHtml,
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
            alert('無法使用該物品！');
        }
    }
    
    moveToWarehouse(instanceId) {
        const success = GameManager.moveToWarehouse(instanceId);
        if (success) {
            this.closeItemModal();
            if (window.ItemDetailModal && typeof window.ItemDetailModal.close === 'function') window.ItemDetailModal.close();
        } else {
            alert('無法移動至倉庫！');
        }
    }
    
    moveToInventory(instanceId) {
        const success = GameManager.moveToInventory(instanceId);
        if (success) {
            this.closeItemModal();
            if (window.ItemDetailModal && typeof window.ItemDetailModal.close === 'function') window.ItemDetailModal.close();
        } else {
            alert('背包已滿！');
        }
    }
    
    sellItem(instanceId, source) {
        const sourceArray = source === 'warehouse' ? GameManager.state.warehouse : GameManager.state.inventory;
        const stack = sourceArray.find(s => s.instanceId === instanceId);
        
        if (!stack) return;
        
        const sellPrice = Math.floor(stack.item.price * 0.5) * stack.quantity;
        const confirm = window.confirm(`確定要賣掉 ${stack.item.name} x${stack.quantity}？\n將獲得 ${sellPrice} 金幣。`);
        
        if (confirm) {
            const earnedGold = GameManager.sellItem(instanceId, source === 'warehouse');
            if (earnedGold !== false) {
                    this.closeItemModal();
                    if (window.ItemDetailModal && typeof window.ItemDetailModal.close === 'function') window.ItemDetailModal.close();
                alert(`賣出 ${stack.item.name}，獲得 ${earnedGold} 金幣！`);
            }
        }
    }
    
    discardItem(instanceId, source) {
        const sourceArray = source === 'warehouse' ? GameManager.state.warehouse : GameManager.state.inventory;
        const stack = sourceArray.find(s => s.instanceId === instanceId);
        
        if (!stack) return;
        
        const result = GameManager.discardItem(instanceId, source === 'warehouse');
        
        if (result === 'confirm') {
            const confirm = window.confirm(`「${stack.item.name}」是 ${stack.item.rarity} 稀有度物品！\n確定要丟棄嗎？`);
            if (confirm) {
                // Force discard
                const index = sourceArray.findIndex(s => s.instanceId === instanceId);
                if (index > -1) {
                    sourceArray.splice(index, 1);
                    GameManager.notify(source === 'warehouse' ? 'warehouse' : 'inventory');
                    this.closeItemModal();
                    if (window.ItemDetailModal && typeof window.ItemDetailModal.close === 'function') window.ItemDetailModal.close();
                }
            }
        } else if (result === true) {
            this.closeItemModal();
            if (window.ItemDetailModal && typeof window.ItemDetailModal.close === 'function') window.ItemDetailModal.close();
        }
    }
    
    unequipItem(slotType) {
        const item = GameManager.state.character.equipment[slotType];
        if (!item) return;
        
        // Check inventory capacity
        if (GameManager.state.inventory.length >= GameManager.state.inventoryCapacity) {
            alert('背包已滿！');
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
    
    getItemTypeText(type) {
        const typeMap = {
            weapon: '武器',
            armor: '防具',
            accessory: '飾品',
            potion: '藥水',
            scroll: '卷軸',
            material: '材料',
            quest: '任務物品',
            gem: '寶石',
            key: '鑰匙',
            book: '書籍'
        };
        return typeMap[type] || type;
    }
}
