/**
 * DungeonScene.js
 * 副本場景控制器 - 棋盤式 UI
 */

import DungeonMap, { DungeonTileType, DungeonTileIcons } from '../utils/DungeonMap.js';
import { DungeonDatabase, DungeonEntranceConfig, generateFloorEvent } from '../managers/DungeonManager.js';
import GameManager from '../managers/GameManager.js';
import { getRewardEffectTotals } from '../managers/EquipmentEffectResolver.js';
import { rollRecipeBlueprintDrops } from '../managers/BlueprintManager.js';
import { markBlueprintKnown, markMonsterKnown } from '../managers/EncyclopediaManager.js';
import { questManager, ObjectiveType } from '../managers/QuestManager.js';
import { worldStoryManager } from '../managers/WorldStoryManager.js';
import { StoryEventTypes } from '../data/StoryProgressMap.js';
import { confirmAction, showGlobalToast } from '../utils/UIFeedback.js';
import { escapeHtml } from '../utils/ItemDisplay.js';
import { getGeneratedDungeonImage } from '../data/AssetManifest.js';
import {
    renderCombatMonster,
    renderCombatPlayer,
    renderCombatBuffIndicators,
    clearCombatActionCooldown,
    isCombatActionCooling,
    startCombatActionCooldown,
    showCombatDamageNumber,
    showCombatPlayerHitFeedback,
    showCombatKillFreeze
} from '../utils/CombatUI.js';

// Preload FightManager engine
let FightManager = null;
const FightManagerReady = import('../managers/FightManager.js')
    .then(mod => { FightManager = mod; return mod; })
    .catch(err => { console.error('Failed to preload FightManager:', err); return null; });

class DungeonSceneClass {
    constructor() {
        this.dungeonType = null;
        this.dungeonMap = null;
        this.currentFloor = 1;
        this.totalFloors = 3;
        
        // 戰鬥狀態
        this.isInCombat = false;
        this.currentMonster = null;
        this.stepCount = 0;
        this.mechanicState = this.createInitialMechanicState();
        
        // Canvas 相關
        this.canvas = null;
        this.ctx = null;
        this.container = null;
        
        // DOM 緩存
        this.dom = {};
        
        // 綁定的事件處理器
        this.boundKeyHandler = null;
    }
    
    // ==================== 初始化 ====================
    
    init(dungeonType) {
        
        this.dungeonType = dungeonType;
        this.container = document.getElementById('dungeon-container') || document.body;
        this.applyDungeonView(dungeonType);
        
        const dungeonData = DungeonDatabase[dungeonType];
        if (!dungeonData) {
            console.error('[DungeonScene] 找不到副本資料:', dungeonType);
            showGlobalToast('副本載入失敗', `找不到副本資料「${dungeonType}」。`, 'error');
            return;
        }
        
        this.totalFloors = dungeonData.bossFloor || dungeonData.floors || 4;
        this.currentFloor = 1;
        this.stepCount = 0;
        this.mechanicState = this.createInitialMechanicState();
        
        // 初始化地圖
        this.initDungeonMap();
        this.syncDungeonVision();
        
        // 緩存 DOM
        this.cacheElements();
        
        // 初始化 Canvas
        const canvasReady = this.initCanvas();
        if (!canvasReady) {
            console.error('[DungeonScene] Canvas 初始化失敗');
            showGlobalToast('畫面初始化失敗', '無法初始化副本遊戲畫面。', 'error');
            return;
        }
        
        // 綁定事件
        this.bindEvents();
        
        // 初始渲染
        this.updateUI();
        this.renderMap();
        
        // 顯示進入訊息
        this.addMessage(`📍 進入 ${dungeonData.name} 第 ${this.currentFloor} 層`);
        this.addMessage(`💡 ${dungeonData.environment?.ambiance || '小心前進...'}`);
        if (dungeonData.story?.pickup) {
            const pickup = dungeonData.story.pickup;
            this.addMessage(`📖 ${pickup.label}：${pickup.title}`, 'info');
            this.addMessage(`「${pickup.quote}」`, 'info');
        }
        if (dungeonData.story?.mechanicUnlock) {
            this.addMessage(`通關目標：${dungeonData.story.mechanicUnlock.title}`, 'reward');
        }
        questManager.updateProgress(ObjectiveType.DUNGEON_FLOOR, this.dungeonType, 1);
        
    }
    
    initDungeonMap() {
        const isBossFloor = this.currentFloor === this.totalFloors;
        
        this.dungeonMap = new DungeonMap(this.dungeonType, this.currentFloor, {
            isBossFloor,
            gridSize: 50,
            screenWidth: 800,
            screenHeight: 500
        });
        this.syncDungeonVision();
    }

    applyDungeonView(dungeonType) {
        const sceneEl = document.getElementById('dungeon-scene');
        if (sceneEl) {
            sceneEl.className = `dungeon-scene dungeon-${dungeonType}`;
            const dungeonImage = getGeneratedDungeonImage(dungeonType);
            sceneEl.classList.toggle('has-dungeon-image', Boolean(dungeonImage));
            if (dungeonImage) {
                sceneEl.style.setProperty('--dungeon-scene-image', `url('/${dungeonImage}')`);
            } else {
                sceneEl.style.removeProperty('--dungeon-scene-image');
            }
        }

        document.querySelectorAll('[data-dungeon-effect]').forEach(effectEl => {
            effectEl.classList.toggle('hidden', effectEl.dataset.dungeonEffect !== dungeonType);
        });
    }

    cacheElements() {
        // 使用統一的 ID 結構
        this.dom = {
            // 副本資訊
            dungeonName: document.getElementById('dungeon-name'),
            dungeonIcon: document.getElementById('dungeon-icon'),
            floorInfo: document.getElementById('floor-info'),
            
            // 玩家狀態
            playerLevel: document.getElementById('player-level'),
            playerHp: document.getElementById('player-hp'),
            playerHpBar: document.getElementById('player-hp-bar'),
            
            // 機制面板
            mechanicPanel: document.getElementById('mechanic-panel'),
            mechanicIcon: document.getElementById('mechanic-icon'),
            mechanicName: document.getElementById('mechanic-name'),
            mechanicStatus: document.getElementById('mechanic-status'),
            mechanicBar: document.getElementById('mechanic-bar'),
            
            // 地圖 Canvas - 統一使用 dungeon-canvas
            mapCanvas: document.getElementById('dungeon-canvas'),
            
            // 訊息日誌
            messageLog: document.getElementById('combat-log'),
            
            // 戰鬥 UI - 使用冒險戰鬥同一套 battle-* 結構
            combatOverlay: document.getElementById('combat-overlay'),
            monsterIcon: document.getElementById('battle-monster-icon'),
            monsterName: document.getElementById('battle-monster-name'),
            monsterLevel: document.getElementById('battle-monster-level'),
            monsterHp: document.getElementById('battle-monster-hp-text'),
            monsterHpBar: document.getElementById('battle-monster-hp-bar'),
            monsterAtk: document.getElementById('battle-monster-atk'),
            monsterDef: document.getElementById('battle-monster-def'),
            hudPlayerLevel: document.getElementById('hud-player-level'),
            hudPlayerName: document.getElementById('hud-player-name'),
            hudHpBar: document.getElementById('hud-hp-bar'),
            hudHpText: document.getElementById('hud-hp-text'),
            buffIndicators: document.getElementById('buff-indicators'),
            weaponIcon: document.getElementById('weapon-icon'),
            weaponName: document.getElementById('weapon-name'),
            weaponDamage: document.getElementById('weapon-damage'),
            potionQuantity: document.getElementById('potion-quantity'),
            
            // 行動按鈕
            btnAttack: document.getElementById('action-weapon') || document.getElementById('btn-attack'),
            btnItem: document.getElementById('action-potion') || document.getElementById('btn-item'),
            btnFlee: document.getElementById('action-flee') || document.getElementById('btn-flee'),
            btnExit: document.getElementById('btn-exit'),
            
            // 層級完成
            floorCompleteOverlay: document.getElementById('floor-complete-overlay'),
            floorCompleteText: document.getElementById('floor-complete-text'),
            btnNextFloor: document.getElementById('btn-next-floor'),
            btnStay: document.getElementById('btn-stay')
        };
        
        // 驗證必要元素
        if (!this.dom.mapCanvas) {
            console.error('[DungeonScene] 找不到 canvas 元素 #dungeon-canvas');
        }
        if (!this.dom.combatOverlay) {
            console.warn('[DungeonScene] 找不到戰鬥遮罩 #combat-overlay');
        }
    }
    
    initCanvas() {
        this.canvas = this.dom.mapCanvas;
        if (!this.canvas) {
            console.error('[DungeonScene] Canvas 元素不存在，無法初始化');
            return false;
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('[DungeonScene] 無法獲取 Canvas 2D Context');
            return false;
        }
        
        // 設置 Canvas 尺寸
        const container = this.canvas.parentElement;
        if (container) {
            // 使用固定尺寸或容器尺寸
            const width = container.clientWidth > 0 ? container.clientWidth : 800;
            const height = container.clientHeight > 0 ? container.clientHeight : 500;
            
            this.canvas.width = width;
            this.canvas.height = height;
            
            if (this.dungeonMap) {
                this.dungeonMap.screenWidth = width;
                this.dungeonMap.screenHeight = height;
            }
        } else {
            // 使用預設尺寸
            this.canvas.width = 800;
            this.canvas.height = 500;
        }
        
        return true;
    }
    
    bindEvents() {
        // 鍵盤移動
        this.boundKeyHandler = (e) => this.handleKeyPress(e);
        document.addEventListener('keydown', this.boundKeyHandler);
        
        // 戰鬥按鈕
        this.dom.btnAttack?.addEventListener('click', () => this.playerAttack());
        this.dom.btnItem?.addEventListener('click', () => this.playerUseItem());
        this.dom.btnFlee?.addEventListener('click', () => this.playerFlee());
        
        // 離開按鈕
        this.dom.btnExit?.addEventListener('click', () => this.exitDungeon());
        
        // 層級完成按鈕
        this.dom.btnNextFloor?.addEventListener('click', () => {
            this.hideFloorCompleteOverlay();
            this.advanceFloor();
        });
        this.dom.btnStay?.addEventListener('click', () => {
            this.hideFloorCompleteOverlay();
        });
    }
    
    destroy() {
        if (this.boundKeyHandler) {
            document.removeEventListener('keydown', this.boundKeyHandler);
            this.boundKeyHandler = null;
        }
        try {
            if (this._engine && typeof this._engine.stopAutoAttack === 'function') {
                this._engine.stopAutoAttack();
            }
        } catch (e) {
            console.warn('[DungeonScene] Failed to stop fight engine during destroy:', e);
        }
        this._engine = null;
        this.isInCombat = false;
        this.currentMonster = null;
    }

    cleanup() {
        this.destroy();
    }
    
    // ==================== 鍵盤控制 ====================
    
    handleKeyPress(e) {
        if (this.isInCombat) return;
        
        let dx = 0, dy = 0;
        
        switch (e.key.toLowerCase()) {
            case 'w': case 'arrowup': dy = -1; break;
            case 's': case 'arrowdown': dy = 1; break;
            case 'a': case 'arrowleft': dx = -1; break;
            case 'd': case 'arrowright': dx = 1; break;
            default: return;
        }
        
        if (dx !== 0 || dy !== 0) {
            e.preventDefault();
            this.movePlayer(dx, dy);
        }
    }
    
    // ==================== 玩家移動 ====================
    
    movePlayer(dx, dy) {
        if (!this.dungeonMap || this.isInCombat) return;

        if (this.mechanicState.bindSteps > 0) {
            this.mechanicState.bindSteps -= 1;
            this.addMessage(`藤蔓仍纏住你的腳步，還需要 ${this.mechanicState.bindSteps} 秒才能掙脫。`, 'warning');
            this.updateUI();
            return;
        }

        const before = {
            x: this.dungeonMap.playerPos.x,
            y: this.dungeonMap.playerPos.y
        };
        const result = this.dungeonMap.movePlayer(dx, dy);
        const moved = before.x !== this.dungeonMap.playerPos.x || before.y !== this.dungeonMap.playerPos.y;

        if (!moved) {
            if (result?.type === 'blocked') this.handleMoveResult(result);
            this.renderMap();
            return;
        }

        this.stepCount += 1;
        const canContinue = this.processDungeonStep();
        if (!canContinue) {
            this.renderMap();
            this.updateUI();
            return;
        }

        if (result) {
            this.handleMoveResult(result);
        } else {
            this.tryTriggerFloorEvent();
        }

        this.renderMap();
        this.updateUI();
        GameManager.markSaveDirty?.('dungeon-step');
    }
    
    handleMoveResult(result) {
        switch (result.type) {
            case 'blocked':
                this.addMessage(`🔒 ${result.message}`, 'warning');
                break;
            case 'battle':
                this.startBattle(result.monsterType);
                break;
            case 'treasure':
                this.showTreasure();
                break;
            case 'healing':
                this.useHealingSpring();
                break;
            case 'stairs':
                this.showStairsPrompt();
                break;
            case 'key':
                this.addMessage('🗝️ 獲得了鑰匙！', 'success');
                break;
            case 'pressure_plate':
                this.handleRuinsPressurePlate(result);
                this.renderMap();
                break;
            case 'portal':
                this.handleJunglePortal(result);
                break;
            case 'lava':
                this.applyDungeonDamage(result.damage, '岩漿灼燒', 'danger');
                this.updateUI();
                this.checkPlayerDeath();
                break;
        }
    }

    createInitialMechanicState() {
        return {
            cold: 0,
            supplyStress: 0,
            puzzleFragments: 0,
            tabletDecoded: false,
            markers: 0,
            lostCount: 0,
            bindSteps: 0,
            poisonSteps: 0,
            poisonDamage: 0,
            burn: 0,
            durabilityStress: 0,
            curseSteps: 0,
            curseAttack: 0,
            curseDefense: 0
        };
    }

    processDungeonStep() {
        if (!this.dungeonType || !this.dungeonMap) return true;

        this.syncDungeonVision();
        this.processOngoingAilments();

        switch (this.dungeonType) {
            case 'cave':
                this.processCaveStep();
                break;
            case 'snow':
                this.processSnowStep();
                break;
            case 'ruins':
                this.processRuinsStep();
                break;
            case 'jungle':
                this.processJungleStep();
                break;
            case 'hell':
                this.processHellStep();
                break;
            default:
                break;
        }

        GameManager.notify?.('all');
        this.checkPlayerDeath();
        return !this.isInCombat && (GameManager.getCharacter()?.hp || 0) > 0;
    }

    syncDungeonVision() {
        if (!this.dungeonMap) return;

        const dungeonData = DungeonDatabase[this.dungeonType];
        const mechanic = dungeonData?.mechanic;
        let vision = 4;

        if (mechanic?.type === 'darkness') {
            const base = mechanic.effect?.visionRange ?? 3;
            const bonus = this.hasCounterItem(mechanic.counterItem) ? (mechanic.effect?.torchBonus ?? 2) : 0;
            vision = base + bonus;
        } else if (mechanic?.type === 'maze') {
            const protectedByItem = this.hasCounterItem('jungle_compass') || this.hasEquipmentSpecial('mazeImmune');
            vision = protectedByItem || this.mechanicState.markers >= this.getMarkerRequired() ? 5 : 3;
        } else if (mechanic?.type === 'puzzle') {
            vision = this.mechanicState.tabletDecoded || this.hasEquipmentSpecial('revealHidden') ? 5 : 4;
        } else if (mechanic?.type === 'burn') {
            vision = 4;
        }

        this.dungeonMap.visionRange = vision;
        this.dungeonMap.updateExplored?.();
    }

    getPassiveCombatBonus(stat) {
        const char = GameManager.getCharacter();
        return typeof char?.getPassiveCombatBonus === 'function'
            ? Math.max(0, Number(char.getPassiveCombatBonus(stat)) || 0)
            : 0;
    }

    reduceByPassive(amount, stat, cap = 0.8) {
        const reduction = Math.min(cap, this.getPassiveCombatBonus(stat));
        return Math.max(1, Math.floor(amount * (1 - reduction)));
    }

    applyPassiveHealingBonus(amount) {
        const bonus = this.getPassiveCombatBonus('healingReceived');
        return Math.max(1, Math.floor(amount * (1 + bonus)));
    }

    getDungeonDamageMitigation(reason = '') {
        const text = String(reason);
        let reduction = this.getPassiveCombatBonus('hazardDamageReduction');

        if (/毒|沼|中毒/.test(text)) reduction += this.getPassiveCombatBonus('poisonMitigation');
        if (/寒|冰|雪|補給不足/.test(text)) reduction += this.getPassiveCombatBonus('coldMitigation');
        if (/火|炎|灼|岩漿|煉獄/.test(text)) reduction += this.getPassiveCombatBonus('burnMitigation');
        if (/陷阱|機關|突襲|錯誤/.test(text)) reduction += this.getPassiveCombatBonus('trapDamageReduction');

        return Math.min(0.8, reduction);
    }

    processCaveStep() {
        if (this.stepCount % 6 !== 0) return;

        if (this.hasCounterItem('torch')) {
            this.addMessage(`火把穩住了黑暗，視野提升到 ${this.dungeonMap.visionRange} 格。`, 'info');
        } else {
            this.addMessage('洞窟深處的黑暗壓縮視野，遠處只能看到模糊輪廓。', 'warning');
        }
    }

    processSnowStep() {
        const mechanic = DungeonDatabase[this.dungeonType]?.mechanic;
        const hasWarmth = this.hasCounterItem('warm_cloak') || this.hasCounterItem('heart_of_ice') || this.hasEquipmentSpecial('coldImmune');
        const maxCold = mechanic?.effect?.maxCold ?? 100;
        const baseColdGain = hasWarmth ? 1 : (mechanic?.effect?.coldPerStep ?? 2);
        const coldGain = this.reduceByPassive(baseColdGain, 'coldGainReduction', 0.75);

        this.mechanicState.cold = Math.min(maxCold, this.mechanicState.cold + coldGain);

        if (this.stepCount % 6 === 0) {
            this.consumeColdSupply(hasWarmth);
        }

        if (this.mechanicState.cold >= maxCold) {
            const char = GameManager.getCharacter();
            const damage = Math.max(1, Math.floor((char.maxHp || 100) * (mechanic?.effect?.damagePerStep ?? 0.05)));
            this.applyDungeonDamage(damage, '極寒侵蝕', 'danger');
            this.mechanicState.cold = hasWarmth ? Math.max(70, this.mechanicState.cold - 10) : this.mechanicState.cold;
        } else if (this.stepCount % 5 === 0) {
            this.addMessage(`寒冷累積 ${this.mechanicState.cold}/${maxCold}。雪地會持續消耗補給。`, 'warning');
        }
    }

    processRuinsStep() {
        const required = this.getPuzzleFragmentRequired();

        if (this.mechanicState.tabletDecoded) return;
        if (this.hasCounterItem('ancient_codex') || this.hasEquipmentSpecial('puzzleHint')) {
            this.mechanicState.puzzleFragments = Math.max(this.mechanicState.puzzleFragments, required);
            this.mechanicState.tabletDecoded = true;
            this.addMessage('古代典籍協助你辨認石碑文字。', 'success');
            return;
        }

        if (this.stepCount % 7 === 0 && this.mechanicState.puzzleFragments < required && Math.random() < 0.45) {
            this.mechanicState.puzzleFragments += 1;
            this.addMessage(`你拓下一段石碑文字：線索 ${this.mechanicState.puzzleFragments}/${required}。`, 'reward');
        }
    }

    processJungleStep() {
        if (this.mechanicState.poisonSteps > 0) {
            this.mechanicState.poisonSteps -= 1;
            this.applyDungeonDamage(this.mechanicState.poisonDamage, '毒沼殘毒', 'warning');
            if (this.mechanicState.poisonSteps <= 0) {
                this.mechanicState.poisonDamage = 0;
                this.addMessage('毒性逐漸退去。', 'success');
            }
        }

        const required = this.getMarkerRequired();
        const protectedByItem = this.hasCounterItem('jungle_compass') || this.hasEquipmentSpecial('mazeImmune');
        if (this.mechanicState.markers >= required || this.stepCount % this.getMazeInterval() !== 0) return;

        let chance = DungeonDatabase[this.dungeonType]?.mechanic?.effect?.lostChance ?? 0.3;
        chance -= this.mechanicState.markers * 0.07;
        chance -= this.getPassiveCombatBonus('lostChanceReduction');
        if (protectedByItem) chance *= 0.5;
        chance = Math.max(0.05, chance);

        if (Math.random() < chance) {
            this.mechanicState.lostCount += 1;
            this.returnToDungeonEntrance();
            this.addMessage('迷霧讓路徑扭曲，你被帶回本層入口附近。收集路標可以降低風險。', 'danger');
        } else {
            this.addMessage(`迷霧干擾方向，當前路標 ${this.mechanicState.markers}/${required}。`, 'info');
        }
    }

    processHellStep() {
        const immune = this.hasCounterItem('flame_amulet') || this.hasCounterItem('crown_of_hell') || this.hasEquipmentSpecial('burnImmune');
        if (immune) {
            if (this.stepCount % 8 === 0) this.addMessage('烈焰護符隔開了煉獄灼熱。', 'success');
            return;
        }

        const mechanic = DungeonDatabase[this.dungeonType]?.mechanic;
        const char = GameManager.getCharacter();
        const burnDamage = Math.max(1, Math.floor((char.maxHp || 100) * (mechanic?.effect?.damagePerStep ?? 0.02)));
        this.mechanicState.burn = Math.min(100, this.mechanicState.burn + 6);
        this.applyDungeonDamage(burnDamage, '煉獄烈焰', 'danger');

        if (this.stepCount % 3 === 0) {
            this.applyHellDurabilityPressure();
        }
    }

    processOngoingAilments() {
        if (this.mechanicState.curseSteps > 0) {
            this.mechanicState.curseSteps -= 1;
            if (this.mechanicState.curseSteps === 0) {
                this.mechanicState.curseAttack = 0;
                this.mechanicState.curseDefense = 0;
                this.addMessage('詛咒領域的壓制消散了。', 'success');
            }
        }
    }

    handleRuinsPressurePlate(result) {
        if (this.dungeonType !== 'ruins') {
            this.addMessage('踩到壓力板，遠處傳來門打開的聲音。', 'info');
            return;
        }

        const required = this.getPuzzleFragmentRequired();
        const canReadTablet = this.mechanicState.tabletDecoded
            || this.mechanicState.puzzleFragments >= required
            || this.hasCounterItem('ancient_codex')
            || this.hasEquipmentSpecial('puzzleHint');

        if (canReadTablet) {
            this.mechanicState.tabletDecoded = true;
            this.mechanicState.puzzleFragments = Math.max(this.mechanicState.puzzleFragments, required);
            this.dungeonMap.doorsOpened.add(result.doorId);
            this.addMessage('你讀懂石碑順序，壓力板正確啟動，石門打開了。', 'success');
            return;
        }

        this.dungeonMap.doorsOpened.delete(result.doorId);
        this.dungeonMap.pressurePlatesActivated?.delete(result.doorId);
        const penalty = DungeonDatabase.ruins?.mechanic?.effect?.wrongPenalty ?? 30;
        this.applyDungeonDamage(penalty, '錯誤機關', 'danger');
        this.addMessage(`石碑文字尚未辨認，需要線索 ${this.mechanicState.puzzleFragments}/${required} 才能正確啟動。`, 'warning');
    }

    handleJunglePortal(result) {
        if (this.dungeonType !== 'jungle') {
            this.addMessage('傳送到了新位置。', 'info');
            return;
        }

        const protectedByItem = this.hasCounterItem('jungle_compass') || this.hasEquipmentSpecial('mazeImmune');
        const message = protectedByItem
            ? '指南針穩住方向，迷霧傳送後仍能辨認路徑。'
            : '迷霧傳送改變了位置，周圍路徑變得難以判斷。';
        this.addMessage(message, protectedByItem ? 'success' : 'warning');
    }

    consumeColdSupply(hasWarmth = false) {
        const stack = this.findConsumableStack();
        if (stack && !hasWarmth) {
            const savedSupply = Math.random() < Math.min(0.8, this.getPassiveCombatBonus('snowSupplySaving'));
            if (savedSupply) {
                this.mechanicState.supplyStress += 1;
                this.addMessage('雪行節拍讓這次補給消耗被保留下來。', 'success');
                return true;
            }

            stack.quantity = Number(stack.quantity ?? 1) - 1;
            if (stack.quantity <= 0) {
                const inventory = GameManager.state.inventory || [];
                const index = inventory.findIndex(itemStack => itemStack.instanceId === stack.instanceId);
                if (index >= 0) inventory.splice(index, 1);
            }
            this.mechanicState.supplyStress += 1;
            this.addMessage(`寒地補給消耗：消耗 ${stack.item?.name || '補給品'} 維持體溫。`, 'warning');
            GameManager.notify?.('all');
            return true;
        }

        if (!hasWarmth) {
            const char = GameManager.getCharacter();
            const damage = Math.max(1, Math.floor((char.maxHp || 100) * 0.04));
            this.applyDungeonDamage(damage, '補給不足', 'danger');
            this.addMessage('沒有可用補給，寒冷直接侵蝕生命。', 'danger');
            return false;
        }

        this.mechanicState.cold = Math.max(0, this.mechanicState.cold - 5);
        this.addMessage('保暖裝備降低補給壓力，寒意稍微退去。', 'success');
        return true;
    }

    applyHellDurabilityPressure() {
        this.mechanicState.durabilityStress += 1;
        const destroyed = [];
        const savedDurability = Math.random() < Math.min(0.8, this.getPassiveCombatBonus('durabilityLossReduction'));
        if (savedDurability) {
            this.addMessage('餘燼淬身讓裝備避開了這次高溫磨耗。', 'success');
            return;
        }

        const weaponDestroyed = GameManager.reduceWeaponDurability?.();
        if (weaponDestroyed) destroyed.push(weaponDestroyed.name || '武器');

        const armorDestroyed = GameManager.reduceArmorDurability?.();
        if (armorDestroyed) destroyed.push(armorDestroyed.name || '防具');

        if (destroyed.length > 0) {
            this.addMessage(`煉獄高溫熔毀了 ${destroyed.join('、')}。`, 'danger');
        } else {
            this.addMessage('煉獄高溫磨耗裝備耐久。', 'warning');
        }

        GameManager.notify?.('all');
    }

    applyDungeonDamage(amount, reason, type = 'danger') {
        const char = GameManager.getCharacter();
        if (!char || amount <= 0) return 0;

        const baseAmount = Math.max(1, Math.floor(amount));
        const mitigation = this.getDungeonDamageMitigation(reason);
        const finalAmount = Math.max(1, Math.floor(baseAmount * (1 - mitigation)));
        const mitigatedText = finalAmount < baseAmount ? `（技能減免 ${baseAmount - finalAmount}）` : '';
        char.hp = Math.max(0, (char.hp || 0) - finalAmount);
        this.addMessage(`${reason}：受到 ${finalAmount} 點傷害${mitigatedText}。`, type);
        GameManager.markSaveDirty?.('dungeon-damage');
        return finalAmount;
    }

    findConsumableStack() {
        return (GameManager.state.inventory || []).find(stack => {
            const item = stack?.item;
            const quantity = Number(stack?.quantity ?? 1);
            return quantity > 0 && (item?.type === 'potion' || Boolean(item?.effect?.hp) || Boolean(item?.buff));
        }) || null;
    }

    hasCounterItem(itemId) {
        if (!itemId) return false;
        const char = GameManager.getCharacter();
        const equipment = char?.equipment || {};
        if (Object.values(equipment).some(item => item?.id === itemId)) return true;

        return (GameManager.state.inventory || []).some(stack => stack?.item?.id === itemId && (Number(stack.quantity) || 0) > 0);
    }

    hasEquipmentSpecial(key) {
        const char = GameManager.getCharacter();
        const equipment = char?.equipment || {};
        return Object.values(equipment).some(item => item?.special?.[key] || item?.specialEffects?.[key]);
    }

    getPuzzleFragmentRequired() {
        if (this.hasCounterItem('ancient_codex') || this.hasEquipmentSpecial('puzzleHint')) return 1;
        return Math.max(1, 2 - Math.floor(this.getPassiveCombatBonus('puzzleClueBonus')));
    }

    getMarkerRequired() {
        const baseRequired = DungeonDatabase.jungle?.mechanic?.effect?.markerRequired ?? 3;
        return Math.max(1, baseRequired - Math.floor(this.getPassiveCombatBonus('markerRequirementReduction')));
    }

    getMazeInterval() {
        return DungeonDatabase.jungle?.mechanic?.effect?.lostCheckInterval ?? 10;
    }

    returnToDungeonEntrance() {
        if (!this.dungeonMap) return;

        const entrance = this.findDungeonTile(DungeonTileType.ENTRANCE) || { x: 1, y: 1 };
        this.dungeonMap.playerPos.x = entrance.x;
        this.dungeonMap.playerPos.y = entrance.y;
        this.dungeonMap.updateCamera?.();
        this.dungeonMap.updateExplored?.();
    }

    findDungeonTile(tileType) {
        const mapData = this.dungeonMap?.mapData || [];
        for (let y = 0; y < mapData.length; y += 1) {
            for (let x = 0; x < mapData[y].length; x += 1) {
                if (mapData[y][x]?.type === tileType) return { x, y };
            }
        }
        return null;
    }

    tryTriggerFloorEvent() {
        if (this.isInCombat || !this.dungeonType) return false;
        const event = generateFloorEvent(this.dungeonType);
        if (!event) return false;
        this.resolveDungeonFloorEvent(event);
        return true;
    }

    async resolveDungeonFloorEvent(event) {
        if (!event) return;

        const char = GameManager.getCharacter();
        const eventName = event.name || '未知事件';
        const healPlayer = percent => {
            const baseAmount = Math.max(1, Math.floor((char.maxHp || 100) * percent));
            const amount = this.applyPassiveHealingBonus(baseAmount);
            char.hp = Math.min(char.maxHp || 100, (char.hp || 0) + amount);
            this.addMessage(`💚 ${eventName}：恢復 ${amount} 生命`, 'success');
            return amount;
        };
        const rollGold = range => {
            const [min, max] = Array.isArray(range) ? range : [20, 50];
            return min + Math.floor(Math.random() * (max - min + 1));
        };

        switch (event.type) {
            case 'trap':
                if (event.monsterType) {
                    this.addMessage(`⚔️ ${eventName}：敵人從暗處突襲！`, 'danger');
                    this.startBattle(event.monsterType);
                    return;
                }
                if (event.damage) {
                    this.applyDungeonDamage(event.damage, eventName, 'danger');
                }
                if (event.poison) {
                    this.mechanicState.poisonSteps = Math.max(this.mechanicState.poisonSteps, event.poison.duration || 3);
                    this.mechanicState.poisonDamage = Math.max(this.mechanicState.poisonDamage, event.poison.damage || 1);
                    this.addMessage(`☠️ 中毒：每秒 ${event.poison.damage}，持續 ${event.poison.duration} 秒`, 'warning');
                }
                if (event.effect === 'bind') {
                    this.mechanicState.bindSteps = Math.max(this.mechanicState.bindSteps, event.duration || 1);
                    this.addMessage(`🌿 束縛：行動受限 ${event.duration || 1} 秒`, 'warning');
                }
                break;
            case 'lava':
                this.applyDungeonDamage(event.damage || 0, eventName, 'danger');
                break;
            case 'treasure': {
                const gold = rollGold(event.goldRange);
                GameManager.addGold(gold);
                this.addMessage(`🏺 ${eventName}：獲得 ${gold} 金幣`, 'reward');
                if (event.itemChance) this.addMessage(`✨ 你找到可疑遺物，後續可接上副本掉落。`, 'info');
                break;
            }
            case 'rest':
            case 'campfire':
            case 'herb':
            case 'soul_well':
                healPlayer(event.healPercent || 0.15);
                if (event.coldReset) {
                    this.mechanicState.cold = 0;
                    this.addMessage('🔥 寒意被驅散。', 'success');
                }
                if (event.removePoisaon || event.removePoison) {
                    this.mechanicState.poisonSteps = 0;
                    this.mechanicState.poisonDamage = 0;
                    this.addMessage('☠️ 毒性被草藥壓下。', 'success');
                }
                break;
            case 'blizzard':
                const coldIncrease = this.reduceByPassive(event.coldIncrease || 0, 'coldGainReduction', 0.75);
                this.mechanicState.cold = Math.min(100, this.mechanicState.cold + coldIncrease);
                this.addMessage(`❄️ ${eventName}：寒意上升 ${coldIncrease}`, 'warning');
                break;
            case 'puzzle_bonus':
                this.mechanicState.puzzleFragments = Math.min(
                    this.getPuzzleFragmentRequired(),
                    this.mechanicState.puzzleFragments + 1
                );
                this.addMessage(`🔎 ${eventName}：你解開隱藏機關，下一份獎勵會更豐厚。`, 'success');
                break;
            case 'lore':
                char.exp = (char.exp || 0) + (event.expBonus || 0);
                this.mechanicState.puzzleFragments = Math.min(
                    this.getPuzzleFragmentRequired(),
                    this.mechanicState.puzzleFragments + 1
                );
                this.addMessage(`📜 ${eventName}：獲得 ${event.expBonus || 0} 經驗`, 'reward');
                break;
            case 'marker':
                this.mechanicState.markers = Math.min(
                    this.getMarkerRequired(),
                    this.mechanicState.markers + (event.markerCount || 1)
                );
                this.addMessage(`🧭 ${eventName}：地圖方向變得更清楚。路標 ${this.mechanicState.markers}/${this.getMarkerRequired()}`, 'info');
                break;
            case 'ambush':
                this.addMessage(`⚔️ ${eventName}：菁英怪物突襲！`, 'danger');
                this.startBattle(event.monsterType || 'elite');
                return;
            case 'curse':
                this.mechanicState.curseSteps = Math.max(this.mechanicState.curseSteps, event.duration || 0);
                this.mechanicState.curseAttack = event.debuff?.attack || 0;
                this.mechanicState.curseDefense = event.debuff?.defense || 0;
                this.addMessage(`🩸 ${eventName}：攻擊與防禦受到詛咒壓制 ${event.duration || 0} 秒`, 'warning');
                break;
            case 'contract': {
                const accepted = await confirmAction({
                    title: eventName,
                    message: '你要簽下副本中的危險契約嗎？',
                    details: ['立即失去 15% 生命', '獲得 250 金幣，之後可接上特殊獎勵'],
                    confirmText: '簽訂',
                    cancelText: '拒絕',
                    type: 'warning'
                });
                if (accepted) {
                    const damage = Math.max(1, Math.floor((char.maxHp || 100) * 0.15));
                    char.hp = Math.max(1, (char.hp || 1) - damage);
                    GameManager.addGold(250);
                    this.addMessage(`🩸 契約成立：失去 ${damage} 生命，獲得 250 金幣`, 'reward');
                } else {
                    this.addMessage('你拒絕了契約，低語聲逐漸退去。', 'info');
                }
                break;
            }
            default:
                this.addMessage(`✨ ${eventName}`, 'info');
        }

        GameManager.markSaveDirty?.('dungeon-event');
        this.updateUI();
        this.checkPlayerDeath();
    }
    
    // ==================== 戰鬥系統 ====================
    
    startBattle(monsterType) {
        const dungeonData = DungeonDatabase[this.dungeonType];
        let monster;
        
        switch (monsterType) {
            case 'elite':
                const elites = dungeonData.monsters.elite;
                monster = { ...elites[Math.floor(Math.random() * elites.length)], isElite: true };
                break;
            case 'boss':
                monster = { ...dungeonData.monsters.boss, isBoss: true };
                break;
            default:
                const commons = dungeonData.monsters.common;
                monster = { ...commons[Math.floor(Math.random() * commons.length)] };
        }
        
        // 樓層加成
        const floorBonus = 1 + (this.currentFloor - 1) * 0.15;
        const baseAttack = monster.attack ?? monster.atk ?? 0;
        const baseDefense = monster.defense ?? monster.def ?? 0;

        monster.hp = Math.floor(monster.hp * floorBonus);
        monster.maxHp = monster.hp;
        monster.attack = Math.floor(baseAttack * floorBonus);
        monster.defense = Math.floor(baseDefense * floorBonus);
        monster.atk = monster.attack;
        monster.def = monster.defense;
        
        this.currentMonster = monster;
        this.isInCombat = true;
        
        this.showBattleModal();

        const prefix = monster.isBoss ? '👑 Boss: ' : monster.isElite ? '⭐ 精英: ' : '';
        this.addMessage(`⚔️ 遭遇 ${prefix}${monster.name}！`, 'combat');
        
        if (monster.special) {
            this.addMessage(`💡 ${monster.special}`, 'info');
        }

        // Initialize FightManager engine and start monster auto-attack
        try {
            // Disable attack button until engine ready
            try { if (this.dom && this.dom.btnAttack) this.dom.btnAttack.disabled = true; } catch (e) {}
            if (FightManager && FightManager.BattleController) {
                this._engine = new FightManager.BattleController(GameManager.getCharacter(), this.currentMonster);
                    if (typeof this._engine.startAutoAttack === 'function') this._engine.startAutoAttack();
                    try { if (this.dom && this.dom.btnAttack) this.dom.btnAttack.disabled = false; } catch (e) {}
                    try { if (this._engine && typeof this._engine.beginBattle === 'function') this._engine.beginBattle(); } catch (e) {}
                    this.configureFightEngineCallbacks(this._engine);
            } else {
                FightManagerReady.then(mod => {
                    if (mod && mod.BattleController) {
                        this._engine = new mod.BattleController(GameManager.getCharacter(), this.currentMonster);
                            if (typeof this._engine.startAutoAttack === 'function') this._engine.startAutoAttack();
                            try { if (this.dom && this.dom.btnAttack) this.dom.btnAttack.disabled = false; } catch (e) {}
                            try { if (this._engine && typeof this._engine.beginBattle === 'function') this._engine.beginBattle(); } catch (e) {}
                            this.configureFightEngineCallbacks(this._engine);
                    }
                }).catch(err => console.warn('Failed to initialize FightManager engine for dungeon:', err));
            }
        } catch (e) {
            console.warn('Error initializing dungeon fight engine:', e);
        }
    }

    configureFightEngineCallbacks(engine) {
        if (!engine) return;

        engine._onAutoAttack = (res) => {
            if (!res) return;
            try {
                if (res.stunned) {
                    this.addMessage(`⚡ ${this.currentMonster.name} 被暈眩，這次無法行動。`, 'info');
                    this.updateMonsterDisplay();
                } else if (res.dodged) {
                    this.addMessage(`${this.currentMonster.name} 攻擊落空。`, 'info');
                } else if (typeof res.damage === 'number') {
                    this.addMessage(`💥 ${this.currentMonster.name} 造成 ${res.damage} 點傷害`, 'enemy-action');
                    this.showPlayerHitFeedback(res.damage || 0);
                }
                if (res.reflectedDamage > 0) {
                    this.addMessage(`🛡 反傷造成 ${res.reflectedDamage} 點傷害`, 'player-action');
                    this.showMonsterDamageNumber(res.reflectedDamage, false, 'reflect', `🛡 反傷 -${res.reflectedDamage}`);
                    this.updateMonsterDisplay();
                }
                if (res.revived) {
                    this.showMonsterDamageNumber(0, false, 'revive', '✨ 復甦');
                    this.updateBattlePlayerDisplay();
                }
                this.updateUI();
                this.updateBattlePlayerDisplay();
                if (res.playerHp !== undefined && res.playerHp <= 0 && !res.revived) this.handlePlayerDeath();
                if (this.isCurrentMonsterDefeated()) this.endBattle(true);
            } catch (e) {
                console.warn('Dungeon auto-attack UI handler failed:', e);
            }
        };

        engine._onStatusApplied = (events = []) => {
            events.forEach(event => this.addCombatStatusMessage(event));
            this.updateMonsterDisplay();
        };

        engine._onStatusTick = (events = []) => {
            events.forEach(event => {
                if (event.type === 'poison') {
                    this.addMessage(`☠️ 毒素造成 ${event.damage} 點傷害`, 'player-action');
                    this.showMonsterDamageNumber(event.damage, false, 'dot');
                } else if (event.type === 'hpRegen') {
                    this.addMessage(`💚 裝備效果恢復 ${event.amount} 生命`, 'success');
                    this.showMonsterDamageNumber(event.amount, false, 'lifesteal', `💚 回復 +${event.amount}`);
                    this.updateUI();
                    this.updateBattlePlayerDisplay();
                }
                this.updateMonsterDisplay();
                if (event.targetDefeated) this.endBattle(true);
            });
        };
    }

    addCombatStatusMessage(effect) {
        if (!effect) return;
        const monsterName = this.currentMonster?.name || '敵人';
        const messages = {
            stun: `⚡ ${monsterName} 陷入暈眩，短時間無法行動。`,
            slow: `❄️ ${monsterName} 被冰霜拖慢，攻擊頻率降低 ${Math.round(effect.percent || 0)}%。`,
            poison: `☠️ ${monsterName} 中毒，每秒受到 ${effect.dps || 0} 傷害。`,
            attackSpeed: `✨ 你的攻擊節奏加快，目前攻速提升 ${Math.round(effect.totalPercent || effect.percent || 0)}%。`,
            hpRegen: `💚 裝備效果正在恢復生命。`
        };
        const typeMap = { stun: 'statusStun', slow: 'statusSlow', poison: 'statusPoison', attackSpeed: 'statusBuff', hpRegen: 'lifesteal' };
        const labelMap = {
            stun: '⚡ 暈眩',
            slow: `❄️ 緩速 ${Math.round(effect.percent || 0)}%`,
            poison: `☠️ 中毒 ${effect.dps || 0}/秒`,
            attackSpeed: `✨ 攻速 +${Math.round(effect.totalPercent || effect.percent || 0)}%`,
            hpRegen: '💚 回復'
        };
        this.showMonsterDamageNumber(0, false, typeMap[effect.type] || 'status', labelMap[effect.type] || '狀態');
        this.addMessage(messages[effect.type] || `${monsterName} 受到狀態影響。`, 'player-action');
    }
    
    showBattleModal() {
        // 統一使用 combat-overlay
        if (this.dom.combatOverlay) {
            this.clearActionCooldowns();
            if (this.dom.messageLog) this.dom.messageLog.innerHTML = '';
            this.dom.combatOverlay.classList.remove('hidden');
        } else {
            console.warn('[DungeonScene] 找不到戰鬥遮罩元素');
        }
        this.updateMonsterDisplay();
        this.updateBattlePlayerDisplay();
    }
    
    hideBattleModal() {
        this.clearActionCooldowns();
        if (this.dom.combatOverlay) {
            this.dom.combatOverlay.classList.add('hidden');
        }
    }

    clearActionCooldowns() {
        [this.dom.btnAttack, this.dom.btnItem, this.dom.btnFlee]
            .filter(Boolean)
            .forEach(card => clearCombatActionCooldown(card));
    }
    
    updateMonsterDisplay() {
        if (!this.currentMonster) return;
        renderCombatMonster(this.dom.combatOverlay || document, this.currentMonster);
    }

    isCurrentMonsterDefeated() {
        if (!this.currentMonster) return false;
        const hp = this.currentMonster.hp ?? this.currentMonster.currentHp ?? 0;
        return hp <= 0;
    }

    updateBattlePlayerDisplay() {
        const char = GameManager.getCharacter();
        if (!char) return;

        renderCombatPlayer(this.dom.combatOverlay || document, char, {
            inventory: GameManager.state.inventory,
            fallbackName: '冒險者'
        });
    }

    renderBuffIndicators(char) {
        renderCombatBuffIndicators(this.dom.buffIndicators, char);
    }
    
    playerAttack() {
        if (!this.isInCombat || !this.currentMonster) return;
        if (isCombatActionCooling(this.dom.btnAttack)) return;

        if (!this._engine) {
            console.error('Fight engine not initialized; cannot perform player attack.');
            return;
        }

        // For dungeon simple action, treat as a normal hit
        const res = this._engine.playerAttack('hit');
        if (!res) return;
        const attackCooldown = this._engine.getPlayerActionCooldownSeconds?.(GameManager.getCharacter()?.getAttackSpeed?.() || 1)
            || GameManager.getCharacter()?.getAttackSpeed?.()
            || 1;
        startCombatActionCooldown(this.dom.btnAttack, attackCooldown);

        const applyRes = res.applyRes || {};
        if (res.destroyedWeapon) this.addMessage('⚠️ 你的武器被破壞了！', 'warning');

        if (applyRes && typeof applyRes.finalDamage === 'number') {
            const doubleStrikeDamage = Math.max(0, Number(applyRes.doubleStrike?.finalDamage) || 0);
            const primaryDamage = Math.max(0, applyRes.finalDamage - doubleStrikeDamage);
            this.addMessage(`⚔️ 造成 ${applyRes.finalDamage} 點傷害`, 'player-action');
            this.showMonsterDamageNumber(primaryDamage || applyRes.finalDamage, Boolean(res.computeRes?.isCrit));
            if (doubleStrikeDamage > 0) {
                this.addMessage(`⚡ 雙重打擊追加 ${doubleStrikeDamage} 點傷害`, 'player-action');
                this.showMonsterDamageNumber(doubleStrikeDamage, false, 'doubleStrike', `⚡ 連擊 -${doubleStrikeDamage}`);
            }
            this.updateMonsterDisplay();
        }

        if (applyRes && applyRes.lifestealRecovered > 0) {
            this.addMessage(`💚 吸取 ${applyRes.lifestealRecovered} 生命`, 'success');
            this.showMonsterDamageNumber(applyRes.lifestealRecovered, false, 'lifesteal', `❤ 吸血 +${applyRes.lifestealRecovered}`);
            this.updateUI();
            this.updateBattlePlayerDisplay();
        }

        // Check monster death
        if (this.currentMonster.hp <= 0) {
            // Stop engine auto-attack and end battle
            try { if (this._engine && typeof this._engine.stopAutoAttack === 'function') this._engine.stopAutoAttack(); } catch (e) {}
            this.endBattle(true);
            return;
        }
    }
    
    playerUseItem() {
        if (!this.isInCombat) return;
        if (isCombatActionCooling(this.dom.btnItem)) return;

        const stack = this.findConsumableStack();
        if (!stack) {
            this.addMessage('背包中沒有可用補給。', 'warning');
            return;
        }

        const itemName = stack.item?.name || '補給品';
        const success = GameManager.useConsumable(stack.instanceId, false);
        if (!success) {
            this.addMessage('這個道具目前無法在戰鬥中使用。', 'warning');
            return;
        }

        this.addMessage(`使用 ${itemName}，角色狀態已更新。`, 'success');
        startCombatActionCooldown(this.dom.btnItem, 1);
        this.updateUI();
        this.updateBattlePlayerDisplay();
        GameManager.markSaveDirty?.('dungeon-use-item');
    }
    
    playerFlee() {
        if (!this.isInCombat) return;
        if (isCombatActionCooling(this.dom.btnFlee)) return;
        
        if (this.currentMonster.isBoss) {
            this.addMessage('👑 無法從 Boss 戰中逃跑！', 'danger');
            return;
        }

        startCombatActionCooldown(this.dom.btnFlee, 1);
        const fleeChance = this.getDungeonFleeChance();
        if (Math.random() < fleeChance) {
            this.applyDungeonRetreatCost();
            this.addMessage(`成功撤退。當前撤退成功率 ${Math.round(fleeChance * 100)}%。`, 'success');
            try { if (this._engine && typeof this._engine.stopAutoAttack === 'function') this._engine.stopAutoAttack(); } catch (e) {}
            this.endBattle(false, true);
        } else {
            this.addMessage(`撤退失敗。當前撤退成功率 ${Math.round(fleeChance * 100)}%。`, 'danger');
            if (this._engine && typeof this._engine.monsterAttack === 'function') {
                const res = this._engine.monsterAttack();
                if (res?.stunned) {
                    this.addMessage(`⚡ ${this.currentMonster.name} 被暈眩，這次無法追擊。`, 'info');
                    this.updateMonsterDisplay();
                } else if (res && typeof res.damage === 'number') {
                    this.addMessage(`💥 ${this.currentMonster.name} 造成 ${res.damage} 點傷害`, 'enemy-action');
                    this.showPlayerHitFeedback(res.damage || 0);
                }
                if (res?.reflectedDamage > 0) {
                    this.addMessage(`🛡 反傷造成 ${res.reflectedDamage} 點傷害`, 'player-action');
                    this.showMonsterDamageNumber(res.reflectedDamage, false, 'reflect', `🛡 反傷 -${res.reflectedDamage}`);
                    this.updateMonsterDisplay();
                }
                if (res?.revived) {
                    this.showMonsterDamageNumber(0, false, 'revive', '✨ 復甦');
                    this.updateBattlePlayerDisplay();
                }
                this.updateUI();
                this.updateBattlePlayerDisplay();
                if (res && res.playerHp <= 0 && !res.revived) this.handlePlayerDeath();
                if (this.isCurrentMonsterDefeated()) this.endBattle(true);
            } else {
                // Engine not present — log error
                console.error('Fight engine not initialized; cannot perform monster attack after failed flee.');
            }
        }
    }

    getDungeonFleeChance() {
        let chance = 0.5;
        if (this.dungeonType === 'jungle') {
            chance = this.mechanicState.markers >= this.getMarkerRequired() ? 0.55 : 0.35;
        } else if (this.dungeonType === 'hell') {
            chance = 0.38;
        } else if (this.dungeonType === 'snow' && this.mechanicState.cold >= 60) {
            chance = 0.42;
        } else if (this.dungeonType === 'ruins' && !this.mechanicState.tabletDecoded) {
            chance = 0.44;
        }

        chance += this.getPassiveCombatBonus('fleeChanceBonus');
        if (this.hasEquipmentSpecial('moveSpeed')) chance += 0.1;
        return Math.max(0.15, Math.min(0.8, chance));
    }

    applyDungeonRetreatCost() {
        if (this.dungeonType !== 'jungle') return;

        const char = GameManager.getCharacter();
        const reduction = Math.min(0.8, this.getPassiveCombatBonus('retreatCostReduction'));
        const damage = Math.max(1, Math.floor((char.maxHp || 100) * 0.08 * (1 - reduction)));
        this.applyDungeonDamage(damage, '毒沼撤退成本', 'warning');
        this.addMessage('毒沼地形讓撤退變得沉重。', 'warning');
    }
    
    monsterAttack() {
        if (!this.isInCombat || !this.currentMonster) return;

        if (!this._engine) {
            console.error('Fight engine not initialized; cannot perform monster attack.');
            return;
        }

        const res = this._engine.monsterAttack();
        if (!res) return;

        if (res.stunned) {
            this.addMessage(`⚡ ${this.currentMonster.name} 被暈眩，這次無法行動。`, 'info');
            this.updateMonsterDisplay();
        } else if (res && typeof res.damage === 'number') {
            this.addMessage(`💥 ${this.currentMonster.name} 造成 ${res.damage} 點傷害`, 'enemy-action');
            this.showPlayerHitFeedback(res.damage);
        }
        if (res.reflectedDamage > 0) {
            this.addMessage(`🛡 反傷造成 ${res.reflectedDamage} 點傷害`, 'player-action');
            this.showMonsterDamageNumber(res.reflectedDamage, false, 'reflect', `🛡 反傷 -${res.reflectedDamage}`);
            this.updateMonsterDisplay();
        }
        if (res.revived) {
            this.showMonsterDamageNumber(0, false, 'revive', '✨ 復甦');
            this.updateBattlePlayerDisplay();
        }

        if (res && res.playerHp !== undefined) {
            this.updateUI();
            this.updateBattlePlayerDisplay();
            if (res.playerHp <= 0 && !res.revived) this.handlePlayerDeath();
            if (this.isCurrentMonsterDefeated()) this.endBattle(true);
        }
    }

    showMonsterDamageNumber(damage, isCrit = false, type = null, label = null) {
        showCombatDamageNumber(this.dom.combatOverlay, damage, {
            type: type || (damage <= 0 ? 'block' : isCrit ? 'critical' : 'normal'),
            isCrit,
            label
        });
    }

    showPlayerHitFeedback(damage = 0) {
        showCombatPlayerHitFeedback(this.dom.combatOverlay, GameManager.getCharacter(), damage);
    }
    
    endBattle(victory, fled = false) {
        if (victory) {
            const m = this.currentMonster;
            const gold = Array.isArray(m.gold)
                ? m.gold[0] + Math.floor(Math.random() * (m.gold[1] - m.gold[0]))
                : Number(m.gold) || 0;
            const char = GameManager.getCharacter();
            const rewardEffects = getRewardEffectTotals(char);
            const finalGold = Math.floor(gold * (1 + (rewardEffects.goldBonus || 0) / 100));
            const exp = Math.floor((m.exp || 0) * (1 + (rewardEffects.expBonus || 0) / 100));
            
            this.addMessage(`🎉 擊敗 ${m.name}！`, 'success');
            this.addMessage(`💰 +${finalGold} 金幣  ⭐ +${exp} 經驗`, 'reward');
            
            GameManager.addGold(finalGold);
            char.exp += exp;
            char.checkLevelUp();
            markMonsterKnown(m, { dungeonId: this.dungeonType });

            const blueprintUnlocks = rollRecipeBlueprintDrops({
                monster: m,
                dungeonId: this.dungeonType
            });
            blueprintUnlocks.forEach(unlock => markBlueprintKnown(unlock.recipeId));
            if (blueprintUnlocks.length > 0) {
                for (const unlock of blueprintUnlocks) {
                    this.addMessage(`📜 取得製作圖：${unlock.recipe.name}`, 'reward');
                }
                showGlobalToast('取得製作圖', blueprintUnlocks.map(unlock => unlock.recipe.name).join('、'), 'success');
            }

            GameManager.markSaveDirty?.('dungeon-battle-victory');
            GameManager.notify?.('all');
            
            this.dungeonMap.clearMonster();
            
            if (m.isBoss) {
                this.handleBossVictory();
            }
        }
        
        // Stop engine auto-attack if running
        try {
            if (this._engine && typeof this._engine.stopAutoAttack === 'function') this._engine.stopAutoAttack();
        } catch (e) {
            console.warn('Error stopping dungeon engine auto-attack:', e);
        }

        this.isInCombat = false;
        try { if (this.dom && this.dom.btnAttack) this.dom.btnAttack.disabled = true; } catch (e) {}

        const finishBattleCleanup = () => {
            this.currentMonster = null;
            this.hideBattleModal();
            this.renderMap();
            this.updateUI();
        };

        if (victory && !fled) {
            showCombatKillFreeze(this.dom.combatOverlay);
            setTimeout(finishBattleCleanup, 360);
        } else {
            finishBattleCleanup();
        }
    }
    
    handleBossVictory() {
        const dungeonData = DungeonDatabase[this.dungeonType];
        questManager.updateProgress(ObjectiveType.DUNGEON_BOSS, `${this.dungeonType}_boss`, 1);
        questManager.updateProgress(ObjectiveType.DUNGEON_CLEAR, this.dungeonType, 1);
        const bossId = `${this.dungeonType}_boss`;
        const clearStoryOutcome = worldStoryManager.applyStoryEvent(StoryEventTypes.DUNGEON_COMPLETED, {
            dungeonId: this.dungeonType,
            dungeon: dungeonData,
            source: 'dungeon_clear'
        });
        const bossStoryOutcome = worldStoryManager.applyStoryEvent(StoryEventTypes.DUNGEON_BOSS_DEFEATED, {
            dungeonId: this.dungeonType,
            bossId,
            monsterId: dungeonData?.monsters?.boss?.id || bossId,
            source: 'dungeon_boss'
        });
        const newStoryClues = [
            ...(clearStoryOutcome.newClues || []),
            ...(bossStoryOutcome.newClues || [])
        ];
        if (newStoryClues.length > 0) {
            this.addMessage(`新痕跡：${newStoryClues[0].title}`, 'info');
        }
        this.awardDungeonBossTreasures(dungeonData);
        this.addMessage(`🏆 通關 ${dungeonData.name}！`, 'legendary');
        
        setTimeout(() => {
            showGlobalToast('副本通關', `恭喜通關 ${dungeonData.name}！`, 'success');
            this.exitDungeon();
        }, 2000);
    }

    awardDungeonBossTreasures(dungeonData) {
        const treasures = dungeonData?.treasures;
        if (!treasures) return;

        const rewards = [];
        if (treasures.guaranteed) rewards.push(treasures.guaranteed);

        const randomPool = Array.isArray(treasures.random) ? [...treasures.random] : [];
        if (randomPool.length > 0) {
            const randomReward = randomPool[Math.floor(Math.random() * randomPool.length)];
            rewards.push(randomReward);
        }

        rewards.forEach(item => {
            const added = GameManager.addToInventory?.(item, 1);
            if (!added) {
                GameManager.addToWarehouse?.(item, 1);
                this.addMessage(`背包已滿，${item.name} 已送入倉庫。`, 'warning');
            } else {
                this.addMessage(`獲得副本寶物：${item.name}`, 'reward');
            }
        });

        GameManager.markSaveDirty?.('dungeon-boss-reward');
        GameManager.notify?.('all');
    }
    
    handlePlayerDeath() {
        this.addMessage('💀 你被擊敗了...', 'danger');
        this.isInCombat = false;
        this.hideBattleModal();
        
        setTimeout(() => {
            const dungeonData = DungeonDatabase[this.dungeonType];
            
            const char = GameManager.getCharacter();
            char.hp = Math.floor(char.maxHp * 0.3);
            const currentGold = GameManager.getGold?.() ?? GameManager.state?.character?.gold ?? 0;
            const penalty = Math.floor(currentGold * 0.1);
            GameManager.removeGold(penalty);
            GameManager.markSaveDirty?.('dungeon-death');
            GameManager.notify?.('all');
            showGlobalToast(
                '副本失敗',
                `你在 ${dungeonData.name} 第 ${this.currentFloor} 層被擊敗，損失 ${penalty} 金幣。`,
                'warning'
            );
            
            this.exitDungeon();
        }, 1500);
    }
    
    checkPlayerDeath() {
        const char = GameManager.getCharacter();
        if (char.hp <= 0) this.handlePlayerDeath();
    }
    
    // ==================== 互動事件 ====================
    
    showTreasure() {
        const goldMin = 20 + this.currentFloor * 10;
        const goldMax = 50 + this.currentFloor * 20;
        const gold = goldMin + Math.floor(Math.random() * (goldMax - goldMin));
        
        this.addMessage(`🏺 寶箱！+${gold} 金幣`, 'success');
        GameManager.addGold(gold);
        GameManager.markSaveDirty?.('dungeon-treasure');
        
        this.dungeonMap.clearTreasure();
        this.renderMap();
    }
    
    useHealingSpring() {
        const char = GameManager.getCharacter();
        const healAmount = this.applyPassiveHealingBonus(Math.floor(char.maxHp * 0.3));
        char.hp = Math.min(char.maxHp, char.hp + healAmount);
        
        this.addMessage(`⛲ 恢復 ${healAmount} 生命`, 'success');
        GameManager.markSaveDirty?.('dungeon-healing');
        GameManager.notify?.('all');
        
        this.dungeonMap.clearHealing();
        this.updateUI();
        this.renderMap();
    }
    
    async showStairsPrompt() {
        const nextFloor = this.currentFloor + 1;
        const isBossFloor = nextFloor === this.totalFloors;
        
        // 使用 floor-complete-overlay
        if (this.dom.floorCompleteOverlay) {
            if (this.dom.floorCompleteText) {
                this.dom.floorCompleteText.textContent = isBossFloor 
                    ? '前方是 Boss 房間，準備好了嗎？' 
                    : `是否前往第 ${nextFloor} 層？`;
            }
            this.dom.floorCompleteOverlay.classList.remove('hidden');
            return;
        }
        
        const confirmed = await confirmAction({
            title: isBossFloor ? '前往 Boss 房間？' : `前往第 ${nextFloor} 層？`,
            message: isBossFloor
                ? '前方是 Boss 房間，進入後會面對更高強度戰鬥。'
                : '進入下一層會刷新地圖與事件。',
            confirmText: isBossFloor ? '挑戰 Boss' : '前往下一層',
            type: isBossFloor ? 'danger' : 'warning'
        });

        if (confirmed) {
            this.advanceFloor();
        }
    }
    
    hideFloorCompleteOverlay() {
        if (this.dom.floorCompleteOverlay) {
            this.dom.floorCompleteOverlay.classList.add('hidden');
        }
    }
    
    advanceFloor() {
        this.currentFloor++;
        
        if (this.currentFloor > this.totalFloors) {
            this.exitDungeon();
            return;
        }
        
        this.initDungeonMap();
        this.renderMap();
        this.updateUI();
        questManager.updateProgress(ObjectiveType.DUNGEON_FLOOR, this.dungeonType, 1);
        GameManager.markSaveDirty?.('dungeon-floor');
        
        const isBossFloor = this.currentFloor === this.totalFloors;
        
        if (isBossFloor) {
            const dungeonData = DungeonDatabase[this.dungeonType];
            this.addMessage('⚠️ Boss 層！', 'warning');
            this.addMessage(`👑 ${dungeonData.monsters.boss.name} 在等待...`, 'boss');
        } else {
            this.addMessage(`📍 第 ${this.currentFloor} 層`, 'info');
        }
    }
    
    exitDungeon() {
        this.destroy();
        window.location.hash = '#adventure';
    }
    
    // ==================== 渲染 ====================
    
    renderIntegratedMap(ctx, canvas, gridSize, cameraX, cameraY) {
        const themeColors = {
            cave: { base: 'rgba(7, 10, 9, 0.62)', unknown: 'rgba(4, 6, 6, 0.86)', floor: 'rgba(24, 40, 32, 0.76)', explored: 'rgba(24, 40, 32, 0.36)', wall: 'rgba(16, 22, 20, 0.88)', wallEdge: 'rgba(163, 139, 93, 0.18)', grid: 'rgba(119, 143, 111, 0.16)', accent: '#d0a85e', detail: 'rgba(194, 175, 128, 0.46)' },
            snow: { base: 'rgba(7, 16, 24, 0.58)', unknown: 'rgba(4, 10, 15, 0.84)', floor: 'rgba(29, 52, 66, 0.74)', explored: 'rgba(29, 52, 66, 0.36)', wall: 'rgba(18, 33, 42, 0.86)', wallEdge: 'rgba(174, 219, 236, 0.2)', grid: 'rgba(176, 214, 232, 0.15)', accent: '#8bd3f7', detail: 'rgba(208, 236, 248, 0.44)' },
            ruins: { base: 'rgba(11, 11, 8, 0.6)', unknown: 'rgba(5, 5, 4, 0.86)', floor: 'rgba(39, 39, 24, 0.74)', explored: 'rgba(39, 39, 24, 0.34)', wall: 'rgba(23, 23, 14, 0.88)', wallEdge: 'rgba(221, 190, 104, 0.22)', grid: 'rgba(211, 185, 115, 0.14)', accent: '#dfbd68', detail: 'rgba(211, 185, 115, 0.4)' },
            jungle: { base: 'rgba(6, 16, 9, 0.58)', unknown: 'rgba(3, 8, 5, 0.84)', floor: 'rgba(20, 51, 31, 0.74)', explored: 'rgba(20, 51, 31, 0.36)', wall: 'rgba(13, 31, 20, 0.86)', wallEdge: 'rgba(127, 202, 111, 0.18)', grid: 'rgba(142, 193, 126, 0.14)', accent: '#75d37b', detail: 'rgba(170, 214, 128, 0.4)' },
            hell: { base: 'rgba(13, 7, 7, 0.62)', unknown: 'rgba(7, 3, 3, 0.86)', floor: 'rgba(53, 26, 24, 0.76)', explored: 'rgba(53, 26, 24, 0.36)', wall: 'rgba(30, 13, 13, 0.88)', wallEdge: 'rgba(255, 120, 71, 0.18)', grid: 'rgba(245, 131, 77, 0.14)', accent: '#ff784d', detail: 'rgba(245, 131, 77, 0.42)' }
        };
        const theme = themeColors[this.dungeonType] || themeColors.cave;
        const visibleCells = this.dungeonMap.getVisibleCells();
        const center = (x, y) => ({ cx: x + gridSize / 2, cy: y + gridSize / 2 });
        const drawTerrainDetail = (cell, x, y) => {
            if (cell.data.type === DungeonTileType.WALL) return;
            const { cx, cy } = center(x, y);
            const seed = ((cell.x + 5) * 41 + (cell.y + 9) * 29) % 17;
            if (seed > 7) return;

            ctx.save();
            ctx.strokeStyle = theme.detail;
            ctx.fillStyle = theme.detail;
            ctx.lineWidth = 2;

            if (seed % 4 === 0) {
                ctx.beginPath();
                ctx.moveTo(cx - gridSize * 0.22, cy + gridSize * 0.12);
                ctx.bezierCurveTo(cx - gridSize * 0.08, cy - gridSize * 0.02, cx + gridSize * 0.1, cy + gridSize * 0.22, cx + gridSize * 0.24, cy + gridSize * 0.04);
                ctx.stroke();
            } else if (seed % 4 === 1) {
                ctx.beginPath();
                ctx.ellipse(cx - gridSize * 0.08, cy + gridSize * 0.08, gridSize * 0.07, gridSize * 0.045, -0.35, 0, Math.PI * 2);
                ctx.ellipse(cx + gridSize * 0.1, cy - gridSize * 0.03, gridSize * 0.055, gridSize * 0.04, -0.25, 0, Math.PI * 2);
                ctx.fill();
            } else if (seed % 4 === 2) {
                for (let i = 0; i < 3; i += 1) {
                    const ox = (i - 1) * gridSize * 0.08;
                    ctx.beginPath();
                    ctx.moveTo(cx + ox, cy + gridSize * 0.18);
                    ctx.quadraticCurveTo(cx + ox * 0.4, cy, cx + ox * 1.4, cy - gridSize * 0.15);
                    ctx.stroke();
                }
            } else {
                ctx.globalAlpha = 0.65;
                ctx.fillRect(cx - gridSize * 0.16, cy - gridSize * 0.08, gridSize * 0.32, gridSize * 0.16);
            }
            ctx.restore();
        };

        ctx.fillStyle = theme.base;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        visibleCells.forEach(cell => {
            const x = cell.x * gridSize - cameraX;
            const y = cell.y * gridSize - cameraY;

            if (!cell.explored) {
                ctx.fillStyle = theme.unknown;
                ctx.fillRect(x, y, gridSize, gridSize);
                return;
            }

            if (!cell.visible) {
                ctx.fillStyle = theme.explored;
                ctx.fillRect(x, y, gridSize, gridSize);
                if (cell.data.type === DungeonTileType.WALL) {
                    ctx.save();
                    ctx.globalAlpha = 0.45;
                    ctx.fillStyle = theme.wall;
                    ctx.fillRect(x + 1, y + 1, gridSize - 2, gridSize - 2);
                    ctx.restore();
                }
                return;
            }

            ctx.fillStyle = theme.floor;
            ctx.fillRect(x, y, gridSize, gridSize);
            ctx.strokeStyle = theme.grid;
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, gridSize, gridSize);
            drawTerrainDetail(cell, x, y);

            if (cell.data.decoration === DungeonTileType.ICE) {
                ctx.fillStyle = 'rgba(139, 211, 247, 0.22)';
                ctx.fillRect(x, y, gridSize, gridSize);
            }

            const tileType = cell.data.type;
            if (tileType === DungeonTileType.WALL) {
                ctx.fillStyle = theme.wall;
                ctx.fillRect(x + 1, y + 1, gridSize - 2, gridSize - 2);
                ctx.strokeStyle = theme.wallEdge;
                ctx.strokeRect(x + 3, y + 3, gridSize - 6, gridSize - 6);
            } else if (tileType === DungeonTileType.LOCKED_DOOR) {
                const isOpen = this.dungeonMap.doorsOpened.has(cell.data.doorId);
                const { cx, cy } = center(x, y);
                ctx.strokeStyle = theme.accent;
                ctx.lineWidth = 2;
                ctx.beginPath();
                if (isOpen) {
                    ctx.moveTo(cx - gridSize * 0.18, cy + gridSize * 0.2);
                    ctx.lineTo(cx + gridSize * 0.18, cy - gridSize * 0.2);
                } else {
                    ctx.roundRect(cx - gridSize * 0.16, cy - gridSize * 0.18, gridSize * 0.32, gridSize * 0.36, 4);
                }
                ctx.stroke();
            } else if (tileType === DungeonTileType.LAVA) {
                const lavaGradient = ctx.createRadialGradient(x + gridSize / 2, y + gridSize / 2, 2, x + gridSize / 2, y + gridSize / 2, gridSize * 0.42);
                lavaGradient.addColorStop(0, 'rgba(255, 176, 69, 0.95)');
                lavaGradient.addColorStop(1, 'rgba(184, 42, 27, 0.72)');
                ctx.fillStyle = lavaGradient;
                ctx.fillRect(x + 3, y + 3, gridSize - 6, gridSize - 6);
            } else if (tileType !== DungeonTileType.EMPTY && tileType !== DungeonTileType.ENTRANCE) {
                const icon = DungeonTileIcons[tileType] || '?';
                ctx.save();
                ctx.font = `${gridSize * 0.58}px "Segoe UI Emoji", Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
                ctx.shadowBlur = 8;
                ctx.fillStyle = '#f8fafc';
                ctx.fillText(icon, x + gridSize / 2, y + gridSize / 2);
                ctx.restore();
            }
        });

        const playerX = this.dungeonMap.playerPos.x * gridSize - cameraX;
        const playerY = this.dungeonMap.playerPos.y * gridSize - cameraY;
        const { cx: pcx, cy: pcy } = center(playerX, playerY);
        ctx.save();
        ctx.shadowColor = 'rgba(125, 211, 252, 0.72)';
        ctx.shadowBlur = 16;
        ctx.fillStyle = 'rgba(37, 99, 130, 0.86)';
        ctx.strokeStyle = 'rgba(191, 219, 254, 0.95)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pcx, pcy, gridSize * 0.23, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'rgba(236, 253, 245, 0.96)';
        ctx.beginPath();
        ctx.moveTo(pcx, pcy - gridSize * 0.17);
        ctx.lineTo(pcx + gridSize * 0.08, pcy + gridSize * 0.08);
        ctx.lineTo(pcx, pcy + gridSize * 0.04);
        ctx.lineTo(pcx - gridSize * 0.08, pcy + gridSize * 0.08);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        return true;
    }

    renderMap() {
        if (!this.ctx || !this.dungeonMap) {
            console.warn('[DungeonScene] renderMap: ctx 或 dungeonMap 不存在');
            return;
        }
        
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        if (!canvas || !canvas.width || !canvas.height) {
            console.warn('[DungeonScene] renderMap: canvas 尺寸無效');
            return;
        }
        
        const gridSize = this.dungeonMap.gridSize || 50;
        const cameraX = this.dungeonMap.cameraOffsetX || 0;
        const cameraY = this.dungeonMap.cameraOffsetY || 0;
        if (this.renderIntegratedMap(ctx, canvas, gridSize, cameraX, cameraY)) return;
        
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const themeColors = {
            cave: { floor: '#3d3d3d', wall: '#1a1a1a', accent: '#8b7355' },
            snow: { floor: '#e8f4f8', wall: '#b0c4de', accent: '#87ceeb' },
            ruins: { floor: '#4a4a3a', wall: '#2a2a20', accent: '#daa520' },
            jungle: { floor: '#2d4a2d', wall: '#1a2e1a', accent: '#228b22' },
            hell: { floor: '#4a2020', wall: '#2a1010', accent: '#dc143c' }
        };
        const theme = themeColors[this.dungeonType] || themeColors.cave;
        
        const visibleCells = this.dungeonMap.getVisibleCells();
        
        visibleCells.forEach(cell => {
            const x = cell.x * gridSize - cameraX;
            const y = cell.y * gridSize - cameraY;
            
            // 迷霧戰爭
            if (!cell.explored) {
                ctx.fillStyle = '#000';
                ctx.fillRect(x, y, gridSize, gridSize);
                return;
            }
            
            if (!cell.visible) {
                ctx.fillStyle = theme.floor + '40';
                ctx.fillRect(x, y, gridSize, gridSize);
                if (cell.data.type === DungeonTileType.WALL) {
                    ctx.fillStyle = theme.wall + '60';
                    ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
                }
                return;
            }
            
            // 地板
            ctx.fillStyle = theme.floor;
            ctx.fillRect(x, y, gridSize, gridSize);
            
            // 格線
            ctx.strokeStyle = theme.accent + '30';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, gridSize, gridSize);
            
            // 冰面裝飾
            if (cell.data.decoration === DungeonTileType.ICE) {
                ctx.fillStyle = 'rgba(135, 206, 235, 0.3)';
                ctx.fillRect(x, y, gridSize, gridSize);
            }
            
            const tileType = cell.data.type;
            
            if (tileType === DungeonTileType.WALL) {
                ctx.fillStyle = theme.wall;
                ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
            } else if (tileType === DungeonTileType.LOCKED_DOOR) {
                const isOpen = this.dungeonMap.doorsOpened.has(cell.data.doorId);
                if (isOpen) {
                    ctx.font = `${gridSize * 0.5}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#666';
                    ctx.fillText('🚪', x + gridSize / 2, y + gridSize / 2);
                } else {
                    ctx.fillStyle = theme.wall;
                    ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
                    ctx.font = `${gridSize * 0.5}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('🔒', x + gridSize / 2, y + gridSize / 2);
                }
            } else if (tileType === DungeonTileType.LAVA) {
                ctx.fillStyle = '#ff4500';
                ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
                ctx.font = `${gridSize * 0.4}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('🔥', x + gridSize / 2, y + gridSize / 2);
            } else if (tileType !== DungeonTileType.EMPTY && tileType !== DungeonTileType.ENTRANCE) {
                const icon = DungeonTileIcons[tileType] || '❓';
                ctx.font = `${gridSize * 0.6}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#fff';
                ctx.fillText(icon, x + gridSize / 2, y + gridSize / 2);
            }
        });
        
        // 玩家
        const playerX = this.dungeonMap.playerPos.x * gridSize - cameraX;
        const playerY = this.dungeonMap.playerPos.y * gridSize - cameraY;
        
        ctx.fillStyle = `${theme.accent}40`;
        ctx.fillRect(playerX, playerY, gridSize, gridSize);
        ctx.strokeStyle = theme.accent;
        ctx.lineWidth = 3;
        ctx.strokeRect(playerX, playerY, gridSize, gridSize);
        
        ctx.font = `${gridSize * 0.7}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.fillText('🧙', playerX + gridSize / 2, playerY + gridSize / 2);
    }
    
    updateUI() {
        const char = GameManager.getCharacter();
        if (!char) {
            console.warn('[DungeonScene] GameManager.getCharacter() 返回 null');
            return;
        }
        
        const dungeonData = DungeonDatabase[this.dungeonType];
        
        if (this.dom.dungeonName) this.dom.dungeonName.textContent = dungeonData?.name || '未知副本';
        if (this.dom.dungeonIcon) {
            this.dom.dungeonIcon.textContent = dungeonData?.icon || '🏰';
        }
        if (this.dom.floorInfo) {
            this.dom.floorInfo.textContent = `第 ${this.currentFloor}/${this.totalFloors} 層`;
        }
        
        // 玩家狀態
        if (this.dom.playerLevel) this.dom.playerLevel.textContent = char.level || 1;
        if (this.dom.playerHp) this.dom.playerHp.textContent = `${char.hp || 0}/${char.maxHp || 100}`;
        if (this.dom.playerHpBar) this.dom.playerHpBar.style.width = `${((char.hp || 0) / (char.maxHp || 100)) * 100}%`;
        this.updateBattlePlayerDisplay();
        
        this.updateMechanicPanel();
    }
    
    updateMechanicPanel() {
        const dungeonData = DungeonDatabase[this.dungeonType];
        if (!dungeonData?.mechanic) return;
        
        const mechanic = dungeonData.mechanic;
        
        if (this.dom.mechanicIcon) this.dom.mechanicIcon.textContent = mechanic.icon;
        
        const statusEl = this.dom.mechanicStatus;
        
        if (!statusEl) return;

        const state = this.mechanicState || this.createInitialMechanicState();
        let statusText = mechanic.name;

        switch (this.dungeonType) {
            case 'cave':
                statusText = `黑暗籠罩｜視野 ${this.dungeonMap?.visionRange || 3}｜${this.hasCounterItem('torch') ? '火把已生效' : '缺少火把'}`;
                break;
            case 'snow':
                statusText = `極寒環境｜寒冷 ${state.cold}/100｜補給消耗 ${state.supplyStress}`;
                break;
            case 'ruins':
                statusText = `遺跡機關｜石碑線索 ${state.puzzleFragments}/${this.getPuzzleFragmentRequired()}｜${state.tabletDecoded ? '已辨認' : '未辨認'}`;
                break;
            case 'jungle':
                statusText = `迷霧迷宮｜路標 ${state.markers}/${this.getMarkerRequired()}｜迷失 ${state.lostCount} 次`;
                break;
            case 'hell':
                statusText = `煉獄烈焰｜灼熱 ${state.burn}/100｜耐久壓力 ${state.durabilityStress}`;
                break;
            default:
                statusText = mechanic.name;
        }

        statusEl.textContent = statusText;
        statusEl.title = mechanic.description || statusText;
    }
    
    addMessage(text, type = 'normal') {
        // 嘗試使用 combat-log
        const logEl = this.dom.messageLog;
        if (!logEl) {
            return;
        }
        
        const msg = document.createElement('div');
        msg.className = `message message-${type}`;
        msg.innerHTML = text;
        
        logEl.appendChild(msg);
        logEl.scrollTop = logEl.scrollHeight;
        
        // 限制訊息數量
        while (logEl.children.length > 50) {
            logEl.removeChild(logEl.firstChild);
        }
    }
}

export const DungeonScene = new DungeonSceneClass();
