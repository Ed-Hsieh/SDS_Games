/**
 * LobbyScene.js
 * Logic for the Lobby scene (Hall).
 */
import GameManager from '../managers/GameManager.js';
import { getSellPrice } from '../models/ItemSchema.js';
import { buildItemModalOptions, escapeHtml } from '../utils/ItemDisplay.js';
import { attachItemTooltip, detachItemTooltip } from '../utils/ItemTooltip.js';
import { buildEquippedSetSummaryHtml } from '../utils/SetDisplay.js';
import { confirmAction, showGlobalToast } from '../utils/UIFeedback.js';
import { worldInteractionManager } from '../managers/WorldInteractionManager.js';
import { dialogueManager } from '../managers/DialogueManager.js';
import { getAllPassiveCombatEffects } from '../data/PassiveCombatEffects.js';

export default class LobbyScene {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.updateUI = this.updateUI.bind(this);
        this.handleWorldInteraction = this.handleWorldInteraction.bind(this);
        this.handleWorldRoute = this.handleWorldRoute.bind(this);
        this.handleTownNpc = this.handleTownNpc.bind(this);
        this.handleTownDialogueAdvance = this.handleTownDialogueAdvance.bind(this);
        this.closeTownDialogue = this.closeTownDialogue.bind(this);
        this.handleTownDialogueRoute = this.handleTownDialogueRoute.bind(this);
        this.handleSaveExport = this.handleSaveExport.bind(this);
        this.handleSaveImport = this.handleSaveImport.bind(this);
        this.handleSaveFileSelected = this.handleSaveFileSelected.bind(this);
        this.handleSaveReset = this.handleSaveReset.bind(this);
        this.handleGrantTestSets = this.handleGrantTestSets.bind(this);
        this.handlePassiveEffectKeydown = this.handlePassiveEffectKeydown.bind(this);
        this.handlePrepTabClick = this.handlePrepTabClick.bind(this);
        this.closePrepModal = this.closePrepModal.bind(this);
        
        // Warehouse filter state
        this.currentWarehouseFilter = 'all';
        this.currentWarehouseSort = 'time-desc';
        
        // Selected item for modal
        this.selectedItem = null;
        this.selectedItemSource = null; // 'warehouse' or 'inventory'
        this.selectedPassiveSlot = 0;
        this.activeTownDialogue = null;
        this.townDialogueTypeTimer = null;
        this.townDialogueAutoTimer = null;

        this.narrativeLines = [];
        this.ambientTimer = null;
        this.ambientIndex = 0;
        this.lastNarrativeAt = 0;
        this.lastNarrativeTone = null;
        this.renderedNarrativeCount = 0;
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
            townDialogueModal: this.container.querySelector('#town-dialogue-modal'),
            townDialogueCard: this.container.querySelector('.town-dialogue-card'),
            townDialogueClose: this.container.querySelector('#town-dialogue-close'),
            townDialogueDone: this.container.querySelector('#town-dialogue-done'),
            townDialogueRoute: this.container.querySelector('#town-dialogue-route'),
            townDialogueAvatar: this.container.querySelector('#town-dialogue-avatar'),
            townDialogueRole: this.container.querySelector('#town-dialogue-role'),
            townDialogueName: this.container.querySelector('#town-dialogue-name'),
            townDialogueLines: this.container.querySelector('#town-dialogue-lines'),
            townDialogueEffects: this.container.querySelector('#town-dialogue-effects'),
            saveExport: this.container.querySelector('#btn-save-export'),
            saveImport: this.container.querySelector('#btn-save-import'),
            saveReset: this.container.querySelector('#btn-save-reset'),
            grantTestSets: this.container.querySelector('#btn-grant-test-sets'),
            saveFileInput: this.container.querySelector('#save-file-input'),
            prepModal: this.container.querySelector('#lobby-prep-modal'),
            prepDialog: this.container.querySelector('.lobby-prep-dialog'),
            prepClose: this.container.querySelector('#lobby-prep-close'),
            prepTitle: this.container.querySelector('#lobby-prep-title'),
            
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

        this.container.querySelectorAll('[data-npc-id]').forEach(npc => {
            npc.addEventListener('click', this.handleTownNpc);
        });

        this.dom.townDialogueClose?.addEventListener('click', this.closeTownDialogue);
        this.dom.townDialogueDone?.addEventListener('click', this.closeTownDialogue);
        this.dom.townDialogueRoute?.addEventListener('click', this.handleTownDialogueRoute);
        this.dom.townDialogueCard?.addEventListener('click', this.handleTownDialogueAdvance);
        this.dom.townDialogueModal?.addEventListener('click', event => {
            if (event.target === this.dom.townDialogueModal) this.closeTownDialogue();
        });

        this.dom.saveExport?.addEventListener('click', this.handleSaveExport);
        this.dom.saveImport?.addEventListener('click', this.handleSaveImport);
        this.dom.saveReset?.addEventListener('click', this.handleSaveReset);
        this.dom.grantTestSets?.addEventListener('click', this.handleGrantTestSets);
        this.dom.saveFileInput?.addEventListener('change', this.handleSaveFileSelected);
        this.container.querySelectorAll('[data-prep-tab]').forEach(tabButton => {
            tabButton.addEventListener('click', this.handlePrepTabClick);
        });
        this.dom.prepClose?.addEventListener('click', this.closePrepModal);
        this.dom.prepModal?.addEventListener('click', event => {
            if (event.target === this.dom.prepModal) this.closePrepModal();
        });

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
                this.dom.hpText.textContent = `生命：${currentHP} / ${maxHP}`;
            }
            
            // EXP bar
            if (this.dom.expBar && this.dom.expText) {
                const currentEXP = state.character.exp || state.character.currentEXP || 0;
                const maxEXP = state.character.maxExp || state.character.maxEXP || 100;
                const expPercent = (currentEXP / maxEXP) * 100;
                this.dom.expBar.style.width = `${expPercent}%`;
                this.dom.expText.textContent = `經驗：${currentEXP} / ${maxEXP}`;
            }
            
            // Update equipment slots
            this.updateEquipmentSlots(state.character.equipment);
            this.renderPassiveCombatEffects(state.character);

            // Show equipped set hints inside the equipment card.
            try {
                if (this.dom.activeSetBonuses) {
                    this.dom.activeSetBonuses.innerHTML = buildEquippedSetSummaryHtml(state);
                }
            } catch (e) {
                console.warn('Failed to render set hints:', e);
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
            
            this.renderLobbyInventoryGrid(state.inventory || []);
        }

        if (type === 'all' || type === 'flags') {
            this.renderWorldStage();
        }

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

    handleTownNpc(event) {
        const npcId = event.currentTarget?.dataset?.npcId;
        if (!npcId) return;

        const outcome = dialogueManager.startDialogue(npcId, { source: 'lobby' });
        this.renderTownDialogueModal(outcome);

        this.renderWorldStage();
    }

    renderTownDialogueModal(outcome) {
        if (!this.dom?.townDialogueModal || !outcome?.npc) return;

        const { npc, lines = [], effectMessages = [], route = null, routeLabel = '前往' } = outcome;
        const visibleLines = lines.filter(line => line.speaker !== '冒險者');
        this.activeTownDialogue = {
            npc,
            lines: visibleLines.length > 0 ? visibleLines : [{
                speaker: npc.name || '居民',
                avatar: npc.avatar || '💬',
                text: '他暫時沒有新的話要說。'
            }],
            effectMessages,
            route,
            routeLabel,
            tone: outcome.tone || (outcome.success ? 'discovery' : 'ambient'),
            currentIndex: 0,
            currentText: '',
            isTyping: false,
            lineComplete: false,
            renderedIndexes: new Set(),
            loggedIndexes: new Set(),
            effectsLogged: false
        };

        if (this.dom.townDialogueAvatar) this.dom.townDialogueAvatar.textContent = npc.avatar || '💬';
        if (this.dom.townDialogueRole) this.dom.townDialogueRole.textContent = npc.role || npc.location || '城鎮居民';
        if (this.dom.townDialogueName) this.dom.townDialogueName.textContent = npc.name || '居民';
        if (this.dom.townDialogueLines) this.dom.townDialogueLines.innerHTML = '';
        if (this.dom.townDialogueEffects) this.dom.townDialogueEffects.innerHTML = '';
        if (this.dom.townDialogueRoute) this.dom.townDialogueRoute.hidden = true;
        if (this.dom.townDialogueDone) this.dom.townDialogueDone.hidden = true;

        this.dom.townDialogueModal.hidden = false;
        this.startTownDialogueLine();
        this.dom.townDialogueCard?.focus?.();
    }

    clearTownDialogueTimers() {
        if (this.townDialogueTypeTimer) {
            clearTimeout(this.townDialogueTypeTimer);
            this.townDialogueTypeTimer = null;
        }
        if (this.townDialogueAutoTimer) {
            clearTimeout(this.townDialogueAutoTimer);
            this.townDialogueAutoTimer = null;
        }
    }

    getCurrentTownDialogueLine() {
        const dialogue = this.activeTownDialogue;
        return dialogue?.lines?.[dialogue.currentIndex] || null;
    }

    startTownDialogueLine() {
        const dialogue = this.activeTownDialogue;
        const line = this.getCurrentTownDialogueLine();
        if (!dialogue || !line) return;

        this.clearTownDialogueTimers();
        dialogue.currentText = '';
        dialogue.isTyping = true;
        dialogue.lineComplete = false;
        this.renderTownDialogueLines();
        this.renderTownDialogueActions(false);

        const fullText = line.text || '';
        if (!fullText) {
            this.completeTownDialogueLine();
            return;
        }

        const typeNext = () => {
            if (this.activeTownDialogue !== dialogue || this.dom?.townDialogueModal?.hidden) return;
            const activeLine = this.getCurrentTownDialogueLine();
            const text = activeLine?.text || '';

            if (dialogue.currentText.length >= text.length) {
                this.completeTownDialogueLine();
                return;
            }

            const remaining = text.length - dialogue.currentText.length;
            const chunkSize = remaining > 24 ? 2 : 1;
            dialogue.currentText = text.slice(0, dialogue.currentText.length + chunkSize);
            this.renderTownDialogueLines();

            const lastChar = dialogue.currentText.at(-1) || '';
            const delay = /[，。！？、；：]/.test(lastChar) ? 110 : 28;
            this.townDialogueTypeTimer = setTimeout(typeNext, delay);
        };

        typeNext();
    }

    renderTownDialogueLines() {
        const dialogue = this.activeTownDialogue;
        if (!dialogue || !this.dom?.townDialogueLines) return;

        for (let index = 0; index <= dialogue.currentIndex; index += 1) {
            if (!dialogue.renderedIndexes.has(index)) {
                this.appendTownDialogueLine(index);
            }
        }

        this.updateTownDialogueLineState();
        this.dom.townDialogueLines.scrollTop = this.dom.townDialogueLines.scrollHeight;
    }

    appendTownDialogueLine(index) {
        const dialogue = this.activeTownDialogue;
        const line = dialogue?.lines?.[index];
        if (!dialogue || !line || !this.dom?.townDialogueLines) return;

        const article = document.createElement('article');
        article.className = 'town-dialogue-line is-new';
        article.dataset.lineIndex = String(index);

        const icon = document.createElement('div');
        icon.className = 'town-dialogue-line-icon';
        icon.textContent = line.avatar || '💬';

        const copy = document.createElement('div');
        copy.className = 'town-dialogue-line-copy';

        const speaker = document.createElement('strong');
        speaker.textContent = line.speaker || dialogue.npc.name || '居民';

        const paragraph = document.createElement('p');
        const text = document.createElement('span');
        text.className = 'town-dialogue-text';
        text.textContent = index === dialogue.currentIndex ? dialogue.currentText : (line.text || '');
        paragraph.appendChild(text);

        copy.appendChild(speaker);
        copy.appendChild(paragraph);
        article.appendChild(icon);
        article.appendChild(copy);
        this.dom.townDialogueLines.appendChild(article);
        dialogue.renderedIndexes.add(index);

        setTimeout(() => {
            article.classList.remove('is-new');
        }, 320);
    }

    updateTownDialogueLineState() {
        const dialogue = this.activeTownDialogue;
        if (!dialogue || !this.dom?.townDialogueLines) return;

        this.dom.townDialogueLines.querySelectorAll('.town-dialogue-line').forEach(article => {
            const index = Number(article.dataset.lineIndex);
            const line = dialogue.lines[index];
            const isCurrent = index === dialogue.currentIndex;
            const text = article.querySelector('.town-dialogue-text');
            const paragraph = article.querySelector('p');

            article.classList.toggle('is-typing', isCurrent && dialogue.isTyping);
            if (text) {
                text.textContent = isCurrent ? dialogue.currentText : (line?.text || '');
            }

            let cursor = article.querySelector('.town-dialogue-cursor');
            if (isCurrent && dialogue.isTyping) {
                if (!cursor && paragraph) {
                    cursor = document.createElement('span');
                    cursor.className = 'town-dialogue-cursor';
                    cursor.setAttribute('aria-hidden', 'true');
                    paragraph.appendChild(cursor);
                }
            } else {
                cursor?.remove();
            }
        });
    }

    completeTownDialogueLine(scheduleAuto = true) {
        const dialogue = this.activeTownDialogue;
        const line = this.getCurrentTownDialogueLine();
        if (!dialogue || !line) return;

        if (this.townDialogueTypeTimer) {
            clearTimeout(this.townDialogueTypeTimer);
            this.townDialogueTypeTimer = null;
        }

        dialogue.currentText = line.text || '';
        dialogue.isTyping = false;
        dialogue.lineComplete = true;
        this.renderTownDialogueLines();
        this.logTownDialogueLine(dialogue.currentIndex);

        const finished = dialogue.currentIndex >= dialogue.lines.length - 1;
        if (finished) {
            this.renderTownDialogueActions(true);
            return;
        }

        this.renderTownDialogueActions(false);
        if (scheduleAuto) {
            this.townDialogueAutoTimer = setTimeout(() => {
                this.advanceTownDialogueLine();
            }, 900);
        }
    }

    advanceTownDialogueLine() {
        const dialogue = this.activeTownDialogue;
        if (!dialogue || this.dom?.townDialogueModal?.hidden) return;

        this.clearTownDialogueTimers();
        const finished = dialogue.currentIndex >= dialogue.lines.length - 1;
        if (finished) {
            this.renderTownDialogueActions(true);
            return;
        }

        dialogue.currentIndex += 1;
        this.startTownDialogueLine();
    }

    logTownDialogueLine(index) {
        const dialogue = this.activeTownDialogue;
        const line = dialogue?.lines?.[index];
        if (!dialogue || !line || dialogue.loggedIndexes.has(index)) return;

        dialogue.loggedIndexes.add(index);
        this.pushTownNarrative(line.speaker, line.text, dialogue.tone);
    }

    renderTownDialogueActions(finished) {
        const dialogue = this.activeTownDialogue;
        if (!dialogue) return;

        if (this.dom.townDialogueEffects) {
            this.dom.townDialogueEffects.innerHTML = finished
                ? dialogue.effectMessages.map(message => (
                    `<div class="town-dialogue-effect">${escapeHtml(message)}</div>`
                )).join('')
                : '';
        }

        if (finished && !dialogue.effectsLogged) {
            for (const message of dialogue.effectMessages || []) {
                this.pushTownNarrative('線索更新', message, 'discovery');
            }
            dialogue.effectsLogged = true;
            this.scrollTownDialogueLinesToEnd();
        }

        if (this.dom.townDialogueRoute) {
            this.dom.townDialogueRoute.hidden = !finished || !dialogue.route;
            this.dom.townDialogueRoute.textContent = dialogue.routeLabel || '前往';
            this.dom.townDialogueRoute.dataset.route = dialogue.route || '';
        }
        if (this.dom.townDialogueDone) {
            this.dom.townDialogueDone.hidden = !finished;
        }

        if (finished) {
            this.scrollTownDialogueLinesToEnd();
        }
    }

    scrollTownDialogueLinesToEnd() {
        const lines = this.dom?.townDialogueLines;
        if (!lines) return;

        const scroll = () => {
            lines.scrollTop = lines.scrollHeight;
        };
        scroll();
        requestAnimationFrame(scroll);
    }

    handleTownDialogueAdvance(event) {
        if (event?.target?.closest?.('button')) return;
        const dialogue = this.activeTownDialogue;
        if (!dialogue || this.dom?.townDialogueModal?.hidden) return;

        if (dialogue.isTyping) {
            this.completeTownDialogueLine();
            return;
        }

        if (dialogue.lineComplete && dialogue.currentIndex < dialogue.lines.length - 1) {
            this.advanceTownDialogueLine();
        }
    }

    closeTownDialogue() {
        if (!this.dom?.townDialogueModal) return;
        this.clearTownDialogueTimers();
        this.dom.townDialogueModal.hidden = true;
        this.activeTownDialogue = null;
    }

    handleTownDialogueRoute() {
        const route = this.dom?.townDialogueRoute?.dataset?.route;
        if (!route) return;
        this.closeTownDialogue();
        if (typeof this.app?.navigateTo === 'function') {
            this.app.navigateTo(route);
        } else {
            this.app.loadScene(route);
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

    handleGrantTestSets() {
        if (typeof GameManager.grantSetEquipmentForTesting !== 'function') {
            showGlobalToast('測試套裝失敗', '目前版本沒有套裝測試入口。', 'warning');
            return;
        }

        const result = GameManager.grantSetEquipmentForTesting(['wolf_hunter', 'ancient_relic'], 'wolf_hunter');
        this.updateUI(GameManager.state, 'all');
        this.switchPrepTab('character');
        showGlobalToast(
            '已加入測試套裝',
            `已穿上狼獵套裝，遠古遺物套裝放入倉庫。新增 ${result.added.length} 件，穿上 ${result.equipped.length} 件。`,
            'success'
        );
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

        const narrativeState = GameManager.getTownNarrativeState();
        const shouldResetForAdventureReturn = Boolean(narrativeState.resetOnNextLobby);

        if (shouldResetForAdventureReturn) {
            GameManager.resetTownNarrativeState();
        }

        const activeNarrativeState = GameManager.getTownNarrativeState();
        this.narrativeLines = activeNarrativeState.lines;
        this.lastNarrativeAt = Number(activeNarrativeState.lastNarrativeAt) || 0;
        this.lastNarrativeTone = activeNarrativeState.lastNarrativeTone || null;

        if (this.dom.townNarrativeTitle) {
            this.dom.townNarrativeTitle.textContent = this.getTownTitle();
        }

        if (this.narrativeLines.length === 0) {
            this.pushTownNarrative(
                shouldResetForAdventureReturn ? '返城' : '抵達',
                this.getReturnNarrative(),
                'ambient'
            );
        } else {
            this.renderTownNarrative({ force: true });
        }

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
        if (flags.board) {
            return '公告欄上的新紙被風吹得沙沙作響，南門路標的拓印讓安全區外的異常變得更難忽略。';
        }

        return '你回到城鎮十字路。天空很藍，鐵匠鋪傳來規律的敲擊聲，公告欄上有幾張剛釘好的紙還沒有被人讀過。';
    }

    getTownTitle() {
        const flags = this.getTownFlags();
        if (flags.secretShop) return '十字路與暗巷';
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
        const narrativeState = GameManager.getTownNarrativeState();
        if (this.narrativeLines !== narrativeState.lines) {
            this.narrativeLines = narrativeState.lines;
        }

        this.narrativeLines.push({
            title: title || '城鎮片刻',
            message: message || '街道暫時安靜下來。',
            tone: safeTone,
            createdAt: Date.now()
        });
        this.lastNarrativeAt = Date.now();
        this.lastNarrativeTone = safeTone;
        narrativeState.lastNarrativeAt = this.lastNarrativeAt;
        narrativeState.lastNarrativeTone = this.lastNarrativeTone;

        const removedOldest = this.narrativeLines.length > 30;
        if (removedOldest) {
            this.narrativeLines.shift();
        }

        if (this.dom.townNarrativeTitle) {
            this.dom.townNarrativeTitle.textContent = this.getTownTitle();
        }
        this.renderTownNarrative({ animateNew: !removedOldest, removedOldest });
    }

    createTownNarrativeEntry(line, { isNew = false } = {}) {
        const article = document.createElement('article');
        article.className = `town-story-entry is-${line.tone || 'ambient'}${isNew ? ' is-new' : ''}`;

        const title = document.createElement('span');
        title.className = 'world-log-title';
        title.textContent = line.title || '城鎮片刻';

        const message = document.createElement('p');
        message.className = 'world-log-message';
        message.textContent = line.message || '街道暫時安靜下來。';

        article.appendChild(title);
        article.appendChild(message);

        if (isNew) {
            setTimeout(() => {
                article.classList.remove('is-new');
            }, 480);
        }

        return article;
    }

    renderTownNarrative({ animateNew = false, removedOldest = false, force = false } = {}) {
        if (!this.dom?.townDialogueStream) return;

        const latestLine = this.narrativeLines[this.narrativeLines.length - 1];
        if (!latestLine) return;

        const stream = this.dom.townDialogueStream;

        if (force) {
            stream.innerHTML = '';
            this.renderedNarrativeCount = 0;
        } else if (removedOldest) {
            stream.querySelector('.town-story-entry')?.remove();
            this.renderedNarrativeCount = Math.max(0, this.renderedNarrativeCount - 1);
        }

        if (this.renderedNarrativeCount > this.narrativeLines.length) {
            stream.innerHTML = '';
            this.renderedNarrativeCount = 0;
        }

        for (let index = this.renderedNarrativeCount; index < this.narrativeLines.length; index += 1) {
            const isNewest = index === this.narrativeLines.length - 1;
            stream.appendChild(this.createTownNarrativeEntry(this.narrativeLines[index], {
                isNew: animateNew && isNewest
            }));
        }

        this.renderedNarrativeCount = this.narrativeLines.length;

        stream.scrollTop = stream.scrollHeight;

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

        this.container.querySelectorAll('[data-npc-id]').forEach(hotspot => {
            const npcId = hotspot.dataset.npcId;
            hotspot.classList.toggle('is-ready', dialogueManager.hasFreshDialogue(npcId));
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
        this.clearTownDialogueTimers();
        document.removeEventListener('keydown', this.handlePassiveEffectKeydown);
    }

    handlePassiveEffectKeydown(event) {
        if (event.key === 'Escape' && this.dom?.townDialogueModal && !this.dom.townDialogueModal.hidden) {
            this.closeTownDialogue();
            return;
        }
        if (event.key === 'Escape' && this.dom?.prepModal?.classList.contains('active')) {
            this.closePrepModal();
            return;
        }
        if (event.key === 'Escape' && this.dom?.passiveEffectModal?.classList.contains('active')) {
            this.closePassiveEffectModal();
        }
    }

    handlePrepTabClick(event) {
        const tab = event.currentTarget?.dataset?.prepTab || 'character';
        if (this.dom?.prepModal?.classList.contains('active')) {
            this.switchPrepTab(tab);
            return;
        }
        this.openPrepModal(tab);
    }

    openPrepModal(tab = 'character') {
        if (!this.dom?.prepModal) return;
        this.switchPrepTab(tab);
        this.dom.prepModal.classList.add('active');
        this.dom.prepModal.setAttribute('aria-hidden', 'false');
        this.dom.prepClose?.focus?.();
    }

    closePrepModal() {
        if (!this.dom?.prepModal) return;
        this.dom.prepModal.classList.remove('active');
        this.dom.prepModal.setAttribute('aria-hidden', 'true');
        this.container.querySelectorAll('[data-prep-tab]').forEach(button => {
            button.classList.remove('is-active');
        });
    }

    switchPrepTab(tab = 'character') {
        const targetTab = tab || 'character';
        const titleMap = {
            character: '冒險者管理',
            inventory: '背包整理',
            warehouse: '倉庫整理',
            system: '存檔管理'
        };

        this.container.querySelectorAll('[data-prep-tab]').forEach(button => {
            const active = button.dataset.prepTab === targetTab;
            button.classList.toggle('is-active', active);
            if (button.classList.contains('lobby-prep-tab')) {
                button.setAttribute('aria-selected', active ? 'true' : 'false');
            }
        });

        this.container.querySelectorAll('[data-prep-pane]').forEach(pane => {
            const active = pane.dataset.prepPane === targetTab;
            pane.classList.toggle('is-active', active);
            pane.hidden = !active;
        });

        if (this.dom?.prepTitle) {
            this.dom.prepTitle.textContent = titleMap[targetTab] || titleMap.character;
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
    
    updateEquipmentSlots(equipment = {}) {
        this.updateEquipmentSlot(this.dom.slotWeapon, equipment.weapon, {
            label: '武器',
            icon: '⚔️',
            emptyName: '未裝備武器'
        });
        this.updateEquipmentSlot(this.dom.slotArmor, equipment.armor, {
            label: '防具',
            icon: '🛡️',
            emptyName: '未裝備防具'
        });
        this.updateEquipmentSlot(this.dom.slotAccessory, equipment.accessory, {
            label: '飾品',
            icon: '💍',
            emptyName: '未裝備飾品'
        });
    }

    updateEquipmentSlot(slotEl, item, fallback) {
        if (!slotEl) return;

        const iconEl = slotEl.querySelector('.equipment-slot-icon');
        const nameEl = slotEl.querySelector('.equipment-slot-name');
        const rarityClasses = ['common', 'uncommon', 'rare', 'epic', 'legendary']
            .flatMap(rarity => [`rarity-${rarity}`, rarity]);

        slotEl.classList.remove('rarity-frame', ...rarityClasses);

        if (item) {
            const rarity = item.rarity || 'common';
            slotEl.classList.remove('empty');
            slotEl.classList.add('rarity-frame', `rarity-${rarity}`);
            slotEl.setAttribute('aria-label', `${fallback.label}：${item.name || '未知裝備'}，點擊開啟操作`);

            if (iconEl) {
                iconEl.innerHTML = item.image
                    ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name || '')}">`
                    : escapeHtml(item.icon || fallback.icon);
            }
            if (nameEl) nameEl.textContent = item.name || '未知裝備';
            attachItemTooltip(slotEl, item, { hint: '點擊開啟操作' });
            return;
        }

        slotEl.classList.add('empty');
        slotEl.setAttribute('aria-label', fallback.emptyName);
        if (iconEl) iconEl.innerHTML = fallback.icon;
        if (nameEl) nameEl.textContent = '未裝備';
        detachItemTooltip(slotEl);
    }

    // Update visible inventory items for Lobby virtualization
    updateVisibleInventoryItemsLobby() {
        // Lobby inventory is rendered as a compact icon grid.
    }

    renderLobbyInventoryGrid(inventory = []) {
        if (!this.dom.inventoryList) return;

        const container = this.dom.inventoryList;
        container.innerHTML = '';

        if (!inventory.length) {
            container.innerHTML = '<div class="empty-hint inventory-grid-empty">背包空空如也...</div>';
            return;
        }

        inventory.forEach(stack => {
            const item = stack.item || {};
            const quantity = Math.max(1, Number(stack.quantity) || 1);
            const rarity = item.rarity || 'common';
            const itemEl = document.createElement('button');
            itemEl.type = 'button';
            itemEl.className = `item-card inventory-item lobby-inventory-cell rarity-frame rarity-${rarity}`;
            itemEl.dataset.instanceId = stack.instanceId || '';
            itemEl.setAttribute('aria-label', `${item.name || '未知物品'}，點擊開啟操作`);

            const iconHTML = item.image
                ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name || '')}">`
                : escapeHtml(item.icon || '📦');

            itemEl.innerHTML = `
                <div class="item-icon">${iconHTML}</div>
                ${quantity > 1 ? `<span class="quantity-badge">x${quantity}</span>` : ''}
                <div class="item-name">${escapeHtml(item.name || '未知')}</div>
            `;

            attachItemTooltip(itemEl, item, { quantity, hint: '點擊開啟操作' });
            container.appendChild(itemEl);
        });
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
            container.innerHTML = '<div class="empty-hint inventory-grid-empty">倉庫空空如也...</div>';
            return;
        }

        // Use processInChunks to avoid long main-thread tasks
        if (window.PerformanceUtils && typeof window.PerformanceUtils.processInChunks === 'function') {
            window.PerformanceUtils.processInChunks(filteredItems, (stack) => {
                container.appendChild(this.createWarehouseItemElement(stack));
            }, {chunkSize: 40}).then(() => {
                // done
            });
        } else {
            // Fallback synchronous render
            filteredItems.forEach(stack => {
                container.appendChild(this.createWarehouseItemElement(stack));
            });
        }
    }

    createWarehouseItemElement(stack) {
        const item = stack.item || {};
        const quantity = Math.max(1, Number(stack.quantity) || 1);
        const rarity = item.rarity || 'common';
        const itemEl = document.createElement('button');
        itemEl.type = 'button';
        itemEl.className = `item-card warehouse-item lobby-inventory-cell rarity-frame rarity-${rarity}`;
        itemEl.setAttribute('aria-label', `${item.name || '未知物品'}，點擊開啟操作`);

        const iconHTML = item.image
            ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name || '')}">`
            : escapeHtml(item.icon || '📦');

        itemEl.innerHTML = `
            <div class="item-icon">${iconHTML}</div>
            ${quantity > 1 ? `<span class="quantity-badge">x${quantity}</span>` : ''}
            <div class="item-name">${escapeHtml(item.name || '未知')}</div>
        `;

        attachItemTooltip(itemEl, item, { quantity, hint: '點擊開啟操作' });
        itemEl.addEventListener('click', () => this.showItemModal(stack, 'warehouse'));
        return itemEl;
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
