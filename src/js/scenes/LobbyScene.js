/**
 * LobbyScene.js
 * Logic for the Lobby scene (Hall).
 */
import GameManager from '../managers/GameManager.js';

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
            
            // Inventory and warehouse
            warehouseList: this.container.querySelector('#warehouse-list'),
            inventoryList: this.container.querySelector('#inventory-list'),
            inventoryUsed: this.container.querySelector('#inventory-used'),
            inventoryMax: this.container.querySelector('#inventory-max'),
            
            // Equipment slots
            slotWeapon: this.container.querySelector('#slot-weapon'),
            slotArmor: this.container.querySelector('#slot-armor'),
            slotAccessory: this.container.querySelector('#slot-accessory'),
            
            // Modal
            itemModal: this.container.querySelector('#item-detail-modal'),
            btnCloseModal: this.container.querySelector('#btn-close-item-modal')
        };
    }

    bindEvents() {
        // Navigation
        if (this.dom.btnGoShop) {
            this.dom.btnGoShop.addEventListener('click', () => {
                this.app.loadScene('shop');
            });
        }
        
        if (this.dom.btnGoForge) {
            this.dom.btnGoForge.addEventListener('click', () => {
                this.app.loadScene('forge');
            });
        }
        
        if (this.dom.btnGoGamble) {
            this.dom.btnGoGamble.addEventListener('click', () => {
                this.app.loadScene('casino');
            });
        }
        
        if (this.dom.btnGoQuest) {
            this.dom.btnGoQuest.addEventListener('click', () => {
                this.app.loadScene('quest');
            });
        }
        
        if (this.dom.btnGoTower) {
            this.dom.btnGoTower.addEventListener('click', () => {
                this.app.loadScene('tower');
            });
        }
        
        if (this.dom.btnStartAdventure) {
            this.dom.btnStartAdventure.addEventListener('click', () => {
                this.app.loadScene('adventure');
            });
        }
        
        // Modal close
        if (this.dom.btnCloseModal) {
            this.dom.btnCloseModal.addEventListener('click', () => {
                this.closeItemModal();
            });
        }
        
        // Warehouse filters
        const warehouseFilters = this.container.querySelectorAll('.warehouse-filter');
        warehouseFilters.forEach(filter => {
            filter.addEventListener('click', () => {
                this.switchWarehouseFilter(filter.dataset.filter);
            });
        });
        
        // Warehouse sort
        const warehouseSort = this.container.querySelector('#warehouse-sort');
        if (warehouseSort) {
            warehouseSort.addEventListener('change', (e) => {
                this.currentWarehouseSort = e.target.value;
                this.renderWarehouse();
            });
        }
        
        // Equipment slot click events
        if (this.dom.slotWeapon) {
            this.dom.slotWeapon.addEventListener('click', () => {
                const weapon = GameManager.state.character.equipment.weapon;
                if (weapon) {
                    this.showEquipmentModal(weapon, 'weapon');
                }
            });
        }
        if (this.dom.slotArmor) {
            this.dom.slotArmor.addEventListener('click', () => {
                const armor = GameManager.state.character.equipment.armor;
                if (armor) {
                    this.showEquipmentModal(armor, 'armor');
                }
            });
        }
        if (this.dom.slotAccessory) {
            this.dom.slotAccessory.addEventListener('click', () => {
                const accessory = GameManager.state.character.equipment.accessory;
                if (accessory) {
                    this.showEquipmentModal(accessory, 'accessory');
                }
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
            
            // Render inventory items with click handlers and quantity badges
            if (this.dom.inventoryList) {
                this.dom.inventoryList.innerHTML = '';
                if (state.inventory && state.inventory.length > 0) {
                    state.inventory.forEach(stack => {
                        const item = stack.item;
                        const itemEl = document.createElement('div');
                        itemEl.className = `item-card inventory-item rarity-${item.rarity}`;
                        
                        let iconHTML;
                        if (item.image) {
                            iconHTML = `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: contain;">`;
                        } else {
                            iconHTML = item.icon || '📦';
                        }
                        
                        itemEl.innerHTML = `
                            <div class="item-icon">
                                ${iconHTML}
                                ${stack.quantity > 1 ? `<span class="quantity-badge">x${stack.quantity}</span>` : ''}
                            </div>
                            <div class="item-info">
                                <div class="item-name">${item.name}</div>
                            </div>
                        `;
                        itemEl.addEventListener('click', () => {
                            this.showItemModal(stack, 'inventory');
                        });
                        this.dom.inventoryList.appendChild(itemEl);
                    });
                } else {
                    this.dom.inventoryList.innerHTML = '<div class="empty-hint">背包空空如也...</div>';
                }
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
    
    // ===== Warehouse Methods =====
    
    renderWarehouse() {
        const state = GameManager.state;
        if (!this.dom.warehouseList || !state.warehouse) return;
        
        let filteredItems = [...state.warehouse];
        
        // Apply filter
        if (this.currentWarehouseFilter !== 'all') {
            filteredItems = filteredItems.filter(stack => {
                const item = stack.item;
                return item.type === this.currentWarehouseFilter;
            });
        }
        
        // Apply sort
        filteredItems.sort((a, b) => {
            if (this.currentWarehouseSort === 'time-desc') {
                return b.item.instanceId.localeCompare(a.item.instanceId);
            } else if (this.currentWarehouseSort === 'time-asc') {
                return a.item.instanceId.localeCompare(b.item.instanceId);
            } else if (this.currentWarehouseSort === 'rarity-desc') {
                const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
                return (rarityOrder[b.item.rarity] || 0) - (rarityOrder[a.item.rarity] || 0);
            } else if (this.currentWarehouseSort === 'rarity-asc') {
                const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
                return (rarityOrder[a.item.rarity] || 0) - (rarityOrder[b.item.rarity] || 0);
            }
            return 0;
        });
        
        // Render
        this.dom.warehouseList.innerHTML = '';
        if (filteredItems.length > 0) {
            filteredItems.forEach(stack => {
                const item = stack.item;
                const itemEl = document.createElement('div');
                itemEl.className = `item-card warehouse-item rarity-${item.rarity}`;
                
                let iconHTML;
                if (item.image) {
                    iconHTML = `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: contain;">`;
                } else {
                    iconHTML = item.icon || '📦';
                }
                
                itemEl.innerHTML = `
                    <div class="item-icon">
                        ${iconHTML}
                        ${stack.quantity > 1 ? `<span class="quantity-badge">x${stack.quantity}</span>` : ''}
                    </div>
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                    </div>
                `;
                itemEl.addEventListener('click', () => {
                    this.showItemModal(stack, 'warehouse');
                });
                this.dom.warehouseList.appendChild(itemEl);
            });
        } else {
            this.dom.warehouseList.innerHTML = '<div class="empty-hint">倉庫空空如也...</div>';
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
        const modal = this.dom.itemModal;
        if (!modal) return;
        
        // Update modal content - 使用與背包一致的元素ID
        const modalIcon = this.container.querySelector('#modal-item-icon');
        const modalName = this.container.querySelector('#modal-item-name');
        const modalType = this.container.querySelector('#modal-item-type');
        const modalDesc = this.container.querySelector('#modal-item-description');
        const modalStats = this.container.querySelector('#modal-item-stats');
        const modalActions = this.container.querySelector('#modal-item-actions');
        
        if (modalIcon) {
            if (item.image) {
                modalIcon.innerHTML = `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: contain;z-index: 1;">`;
            } else {
                modalIcon.textContent = item.icon || '📦';
            }
        }
        if (modalName) modalName.textContent = item.name;
        if (modalType) modalType.textContent = this.getItemTypeText(item.type);
        if (modalDesc) modalDesc.textContent = item.desc || item.description || '無描述';
        
        // Render stats - 使用與背包一致的格式
        if (modalStats) {
            modalStats.innerHTML = '';
            
            if (item.atk || item.attack) {
                const atk = item.atk || item.attack;
                modalStats.innerHTML += `<div class="item-detail-stat"><span>⚔️ 攻擊力</span><span class="value">+${atk}</span></div>`;
            }
            if (item.def || item.defense) {
                const def = item.def || item.defense;
                modalStats.innerHTML += `<div class="item-detail-stat"><span>🛡️ 防禦力</span><span class="value">+${def}</span></div>`;
            }
            if (item.critChance) {
                modalStats.innerHTML += `<div class="item-detail-stat"><span>💥 爆擊率</span><span class="value">${(item.critChance * 100).toFixed(0)}%</span></div>`;
            }
            if (item.critDamage) {
                modalStats.innerHTML += `<div class="item-detail-stat"><span>⚡ 爆擊傷害</span><span class="value">${(item.critDamage * 100).toFixed(0)}%</span></div>`;
            }
            if (item.weaponSpeed) {
                modalStats.innerHTML += `<div class="item-detail-stat"><span>⏱️ 武器速度</span><span class="value">${item.weaponSpeed.toFixed(1)}x</span></div>`;
            }
            if (item.attackSpeed) {
                modalStats.innerHTML += `<div class="item-detail-stat"><span>⚡ 攻擊速度</span><span class="value">${item.attackSpeed.toFixed(1)}x</span></div>`;
            }
        }
        
        // Render unequip button - 使用與背包一致的按鈕樣式
        if (modalActions) {
            modalActions.innerHTML = '';
            const unequipBtn = this.createButton('🔓 卸下裝備', 'btn-warning', () => this.unequipItem(slotType));
            modalActions.appendChild(unequipBtn);
        }
        
        modal.classList.add('active');
    }
    
    showItemModal(stack, source) {
        this.selectedItem = stack;
        this.selectedItemSource = source;
        
        const item = stack.item;
        const modal = this.dom.itemModal;
        if (!modal) return;
        
        // Update modal content
        const modalIcon = this.container.querySelector('#modal-item-icon');
        const modalName = this.container.querySelector('#modal-item-name');
        const modalType = this.container.querySelector('#modal-item-type');
        const modalDesc = this.container.querySelector('#modal-item-description');
        const modalStats = this.container.querySelector('#modal-item-stats');
        const modalActions = this.container.querySelector('#modal-item-actions');
        
        if (modalIcon) modalIcon.textContent = item.icon || '📦';
        if (modalName) modalName.textContent = item.name;
        if (modalType) modalType.textContent = this.getItemTypeText(item.type);
        if (modalDesc) modalDesc.textContent = item.description || item.desc || '沒有描述';
        
        // Render stats
        if (modalStats) {
            modalStats.innerHTML = '';
            
            if (item.atk || item.attack) {
                const atk = item.atk || item.attack;
                modalStats.innerHTML += `<div class="item-detail-stat"><span>⚔️ 攻擊力</span><span class="value">+${atk}</span></div>`;
            }
            if (item.def || item.defense) {
                const def = item.def || item.defense;
                modalStats.innerHTML += `<div class="item-detail-stat"><span>🛡️ 防禦力</span><span class="value">+${def}</span></div>`;
            }
            if (item.hp) {
                modalStats.innerHTML += `<div class="item-detail-stat"><span>❤️ 恢復 HP</span><span class="value">+${item.hp}</span></div>`;
            }
            if (item.mp) {
                modalStats.innerHTML += `<div class="item-detail-stat"><span>💙 恢復 MP</span><span class="value">+${item.mp}</span></div>`;
            }
            if (item.critChance) {
                modalStats.innerHTML += `<div class="item-detail-stat"><span>💥 爆擊率</span><span class="value">${(item.critChance * 100).toFixed(0)}%</span></div>`;
            }
            if (item.price) {
                modalStats.innerHTML += `<div class="item-detail-stat"><span>💰 售價</span><span class="value">${item.price}</span></div>`;
            }
        }
        
        // Render action buttons
        if (modalActions) {
            modalActions.innerHTML = '';
            const buttons = this.getItemActionButtons(stack, source);
            buttons.forEach(btn => modalActions.appendChild(btn));
        }
        
        // Show modal
        this.dom.itemModal.classList.add('active');
    }
    
    getItemTypeText(type) {
        const typeMap = {
            'weapon': '武器',
            'armor': '防具',
            'accessory': '飾品',
            'potion': '藥水',
            'material': '材料',
            'key': '鑰匙',
            'gem': '寶石',
            'scroll': '捲軸',
            'book': '書籍',
            'quest': '任務物品'
        };
        return typeMap[type] || '道具';
    }
    
    getItemActionButtons(stack, source) {
        const item = stack.item;
        const buttons = [];
        const isEquipment = item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory';
        const isConsumable = item.type === 'potion' || item.type === 'scroll';
        
        if (source === 'warehouse') {
            if (isEquipment) {
                // 倉庫-裝備：裝備 / 放入背包 / 販售
                buttons.push(this.createButton('✅ 裝備', 'btn-primary', () => this.equipItem(stack.instanceId, source)));
                buttons.push(this.createButton('✅ 放入背包', 'btn-success', () => this.moveToInventory(stack.instanceId)));
                buttons.push(this.createButton('✅ 販售', 'btn-warning', () => this.sellItem(stack.instanceId, source)));
            } else {
                // 倉庫-道具：使用(僅消耗品) / 放入背包 / 販售
                if (isConsumable) {
                    buttons.push(this.createButton('✅ 使用', 'btn-info', () => this.useItem(stack.instanceId, source)));
                }
                buttons.push(this.createButton('✅ 放入背包', 'btn-success', () => this.moveToInventory(stack.instanceId)));
                buttons.push(this.createButton('✅ 販售', 'btn-warning', () => this.sellItem(stack.instanceId, source)));
            }
        } else if (source === 'inventory') {
            if (isEquipment) {
                // 背包-裝備：裝備 / 放入倉庫 / 販售 / 丟棄
                buttons.push(this.createButton('✅ 裝備', 'btn-primary', () => this.equipItem(stack.instanceId, source)));
                buttons.push(this.createButton('✅ 放入倉庫', 'btn-success', () => this.moveToWarehouse(stack.instanceId)));
                buttons.push(this.createButton('✅ 販售', 'btn-warning', () => this.sellItem(stack.instanceId, source)));
                buttons.push(this.createButton('✅ 丟棄', 'btn-danger', () => this.discardItem(stack.instanceId, source)));
            } else {
                // 背包-道具：使用(僅消耗品) / 放入倉庫 / 販售 / 丟棄
                if (isConsumable) {
                    buttons.push(this.createButton('✅ 使用', 'btn-info', () => this.useItem(stack.instanceId, source)));
                }
                buttons.push(this.createButton('✅ 放入倉庫', 'btn-success', () => this.moveToWarehouse(stack.instanceId)));
                buttons.push(this.createButton('✅ 販售', 'btn-warning', () => this.sellItem(stack.instanceId, source)));
                buttons.push(this.createButton('✅ 丟棄', 'btn-danger', () => this.discardItem(stack.instanceId, source)));
            }
        }
        
        return buttons;
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
        }
    }
    
    useItem(instanceId, source) {
        const success = GameManager.useConsumable(instanceId, source === 'warehouse');
        if (success) {
            this.closeItemModal();
        } else {
            alert('無法使用該物品！');
        }
    }
    
    moveToWarehouse(instanceId) {
        const success = GameManager.moveToWarehouse(instanceId);
        if (success) {
            this.closeItemModal();
        } else {
            alert('無法移動至倉庫！');
        }
    }
    
    moveToInventory(instanceId) {
        const success = GameManager.moveToInventory(instanceId);
        if (success) {
            this.closeItemModal();
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
                }
            }
        } else if (result === true) {
            this.closeItemModal();
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
        
        this.closeItemModal();
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
