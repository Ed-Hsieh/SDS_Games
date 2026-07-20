/**
 * DungeonScene.js
 * 副本場景控制器 - 棋盤式 UI
 */

import DungeonMap, { DungeonTileType, DungeonTileIcons } from '../utils/DungeonMap.js';
import {
    DungeonDatabase,
    DungeonEntranceConfig,
    generateDungeonMonster,
    generateDungeonBoss,
    generateFloorEvent
} from '../data/Dungeons.js';
import { dungeonManager } from '../managers/DungeonManager.js';
import GameManager from '../managers/GameManager.js';
import { confirmAction, showGlobalToast } from '../utils/UIFeedback.js';
import audioManager from '../utils/AudioManager.js';
import { escapeHtml } from '../utils/ItemDisplay.js';
import { getGeneratedDungeonImage } from '../data/AssetManifest.js';
import { isDevModeEnabled } from '../utils/DevMode.js';
import CombatFlowController from '../managers/CombatFlowController.js';
import {
    createCombatEncounter,
    resolveEncounterDrop,
    settleEncounterVictory
} from '../managers/AdventureEncounterManager.js';
import { ensureCombatStage } from '../components/CombatStageView.js';

class DungeonSceneClass {
    constructor() {
        this.dungeonType = null;
        this.dungeonMap = null;
        this.currentFloor = 1;
        this.totalFloors = 3;
        
        // 戰鬥狀態
        this.isInCombat = false;
        this.currentMonster = null;
        this.combatFlow = null;
        this.stepCount = 0;
        this.mechanicState = dungeonManager.createMechanicState();
        
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
        this.mechanicState = dungeonManager.createMechanicState();
        
        // 初始化地圖
        this.initDungeonMap();
        this.syncDungeonVision();
        
        // 緩存 DOM
        this.cacheElements();
        ensureCombatStage(this.container);
        this.combatFlow = new CombatFlowController(this.container, {
            scene: { type: 'dungeon', id: dungeonType },
            settleVictory: encounter => this.settleDungeonVictory(encounter),
            resolveDrop: (drop, decision) => resolveEncounterDrop(drop, decision),
            isSceneComplete: encounter => Boolean(encounter?.monster?.isBoss),
            exitOnSceneComplete: true,
            onReturnToScene: () => this.finishDungeonCombatReturn(),
            onSceneComplete: () => this.finishDungeonScene(),
            onDefeat: () => this.finishDungeonDefeat()
        });
        
        // 初始化 Canvas
        const canvasReady = this.initCanvas();
        if (!canvasReady) {
            console.error('[DungeonScene] Canvas 初始化失敗');
            showGlobalToast('畫面初始化失敗', '無法初始化副本遊戲畫面。', 'error');
            return;
        }
        
        // 綁定事件
        this.bindEvents();
        this.installDevCombatControls();
        
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
        this.emitDungeonChallengeBrief(dungeonData);
        dungeonManager.recordFloorReached(this.dungeonType, this.currentFloor);
        
    }

    emitDungeonChallengeBrief(dungeonData) {
        const challenge = dungeonData?.challenge;
        if (!challenge) return;

        if (challenge.playstyle) this.addMessage(`玩法：${challenge.playstyle}`, 'info');
        if (challenge.riskBrief) this.addMessage(`風險：${challenge.riskBrief}`, 'warning');
        if (challenge.rewardBrief) this.addMessage(`獎勵方向：${challenge.rewardBrief}`, 'reward');
        if (Array.isArray(challenge.preparation) && challenge.preparation.length > 0) {
            this.addMessage(`準備：${challenge.preparation.slice(0, 2).join('／')}`, 'info');
        }
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
            messageLog: document.getElementById('dungeon-message-log'),
            btnExit: document.getElementById('btn-exit'),
            
            // 層級完成
            floorCompleteOverlay: document.getElementById('floor-complete-overlay'),
            floorCompleteText: document.getElementById('floor-complete-text'),
            btnNextFloor: document.getElementById('btn-next-floor'),
            btnStay: document.getElementById('btn-stay'),

            // 開發驗收工具
            devCombatControls: null
        };
        
        // 驗證必要元素
        if (!this.dom.mapCanvas) {
            console.error('[DungeonScene] 找不到 canvas 元素 #dungeon-canvas');
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

    installDevCombatControls() {
        if (!isDevModeEnabled() || this.dom.devCombatControls || !this.container) return;

        const controls = document.createElement('div');
        controls.className = 'dungeon-dev-combat-tools';
        controls.innerHTML = `
            <span>遭遇測試</span>
            <button type="button" data-dungeon-dev-battle="normal">普通</button>
            <button type="button" data-dungeon-dev-battle="elite">精英</button>
            <button type="button" data-dungeon-dev-battle="boss">Boss</button>
        `;
        controls.addEventListener('click', event => {
            const button = event.target.closest?.('[data-dungeon-dev-battle]');
            if (!button || this.isInCombat) return;
            this.startBattle(button.dataset.dungeonDevBattle || 'normal');
        });

        this.container.appendChild(controls);
        this.dom.devCombatControls = controls;
    }
    
    destroy() {
        if (this.boundKeyHandler) {
            document.removeEventListener('keydown', this.boundKeyHandler);
            this.boundKeyHandler = null;
        }
        this.combatFlow?.destroy?.();
        this.combatFlow = null;
        this.isInCombat = false;
        this.currentMonster = null;
        this.dom.devCombatControls?.remove?.();
        this.dom.devCombatControls = null;
    }

    cleanup() {
        this.destroy();
    }
    
    // ==================== 鍵盤控制 ====================
    
    handleKeyPress(e) {
        if (e.target?.closest?.('input, textarea, select, [contenteditable="true"], [role="textbox"]')) return;

        const key = e.key.toLowerCase();

        if (this.isInCombat) {
            return;
        }
        
        let dx = 0, dy = 0;
        
        switch (key) {
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

        const bindResult = dungeonManager.consumeBindStep(this.mechanicState);
        if (bindResult?.blocked) {
            this.addMessage(bindResult.message, 'warning');
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

    processDungeonStep() {
        if (!this.dungeonType || !this.dungeonMap) return true;
        const outcome = dungeonManager.resolveDungeonStep(
            this.dungeonType,
            this.stepCount,
            this.mechanicState
        );
        this.applyDungeonOutcome(outcome);
        this.syncDungeonVision();
        if (!outcome.alive) this.checkPlayerDeath();
        return !this.isInCombat && outcome.alive;
    }

    syncDungeonVision() {
        if (!this.dungeonMap) return;
        this.dungeonMap.visionRange = dungeonManager.getVisionRange(this.dungeonType, this.mechanicState);
        this.dungeonMap.updateExplored?.();
    }

    applyDungeonOutcome(outcome = {}) {
        for (const event of outcome.events || []) {
            if (event.audio === 'player-hit') {
                audioManager.play('player-hit', {
                    throttleKey: 'dungeon-hazard-damage',
                    throttleMs: 220,
                    intensity: event.damage > 25 ? 'heavy' : 'light'
                });
            }
            this.addMessage(event.text, event.type);
        }
        for (const action of outcome.actions || []) {
            if (action.type === 'return-to-entrance') this.returnToDungeonEntrance();
        }
    }

    handleRuinsPressurePlate(result) {
        const outcome = dungeonManager.resolvePressurePlate(this.dungeonType, this.mechanicState);
        if (outcome.openDoor) {
            this.dungeonMap.doorsOpened.add(result.doorId);
        } else {
            this.dungeonMap.doorsOpened.delete(result.doorId);
            this.dungeonMap.pressurePlatesActivated?.delete(result.doorId);
        }
        this.applyDungeonOutcome(outcome);
        this.checkPlayerDeath();
    }

    handleJunglePortal(_result) {
        this.applyDungeonOutcome(dungeonManager.resolvePortal(this.dungeonType));
    }

    applyDungeonDamage(amount, reason, type = 'danger') {
        const result = dungeonManager.applyHazardDamage(amount, reason);
        const mitigatedText = result.mitigated > 0 ? `（技能減免 ${result.mitigated}）` : '';
        audioManager.play('player-hit', {
            throttleKey: 'dungeon-hazard-damage',
            throttleMs: 220,
            intensity: result.damage > 25 ? 'heavy' : 'light'
        });
        this.addMessage(`${reason}：受到 ${result.damage} 點傷害${mitigatedText}。`, type);
        return result.damage;
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
        let outcome = dungeonManager.resolveFloorEvent(this.dungeonType, this.mechanicState, event);
        if (outcome.requiresContractDecision) {
            const accepted = await confirmAction({
                title: event.name || '危險契約',
                message: '你要簽下副本中的危險契約嗎？',
                details: ['立即失去 15% 生命', '獲得 250 金幣', '有機會得到煉獄寶物；失敗時會留下短暫詛咒'],
                confirmText: '簽訂',
                cancelText: '拒絕',
                type: 'warning'
            });
            outcome = dungeonManager.resolveFloorEvent(this.dungeonType, this.mechanicState, event, {
                contractAccepted: accepted
            });
        }

        this.applyDungeonOutcome(outcome);
        for (const grant of outcome.grants || []) {
            this.describeDungeonGrant(grant.result, grant.label);
        }
        if (outcome.battle) {
            this.startBattle(outcome.battle);
            return;
        }
        this.updateUI();
        this.checkPlayerDeath();
    }

    describeDungeonGrant(result, label = '獲得副本物資') {
        if (!result || result.rolled === false) return false;
        if (!result.item) {
            this.addMessage('副本物資資料不存在，未取得獎勵。', 'danger');
            return false;
        }

        const quantityText = result.quantity > 1 ? ` x${result.quantity}` : '';
        if (result.success && result.destination === 'inventory') {
            this.addMessage(`${label}：${result.item.name}${quantityText}`, 'reward');
            return true;
        }

        if (result.success && result.destination === 'warehouse') {
            this.addMessage(`背包已滿，${result.item.name}${quantityText} 已送入倉庫。`, 'warning');
            return true;
        }

        this.addMessage(`${result.item.name || '副本物資'} 無法放入背包或倉庫。`, 'danger');
        return false;
    }

    // ==================== 戰鬥系統 ====================
    
    startBattle(monsterType) {
        let monster;
        audioManager.play('combat-start', { throttleKey: 'dungeon-combat-start', throttleMs: 650 });
        audioManager.playBgm('combat');
        
        switch (monsterType) {
            case 'elite':
                monster = generateDungeonMonster(this.dungeonType, this.currentFloor, true);
                break;
            case 'boss':
                monster = generateDungeonBoss(this.dungeonType, this.currentFloor);
                break;
            default:
                monster = generateDungeonMonster(this.dungeonType, this.currentFloor, false);
        }
        
        // 樓層加成
        if (!monster) {
            this.addMessage('副本戰鬥資料缺失，無法開始戰鬥。', 'error');
            return;
        }

        this.currentMonster = monster;
        this.isInCombat = true;
        const prefix = monster.isBoss ? '👑 Boss: ' : monster.isElite ? '⭐ 精英: ' : '';
        this.addMessage(`⚔️ 遭遇 ${prefix}${monster.name}！`, 'combat');
        if (monster.special) {
            this.addMessage(`💡 ${monster.special}`, 'info');
        }

        const dungeonData = DungeonDatabase[this.dungeonType];
        const encounter = createCombatEncounter(monster, {
            areaName: dungeonData.name,
            background: getGeneratedDungeonImage(this.dungeonType),
            backgroundAlt: dungeonData.name,
            className: `${monster.isBoss ? 'Boss' : monster.isElite ? '菁英' : '副本遭遇'} · ${dungeonData.name}`,
            feed: `${monster.name}封住了第 ${this.currentFloor} 層的前路。`,
            canFlee: !monster.isBoss,
            fleeRejectedText: 'Boss 戰無法撤離。',
            victoryActionLabel: monster.isBoss ? '完成副本並返回大廳' : '收下戰利品並返回副本',
            escapeActionLabel: '返回副本',
            context: {
                dungeonType: this.dungeonType,
                floor: this.currentFloor,
                monsterType
            }
        });
        if (!this.combatFlow?.start(encounter)) {
            this.isInCombat = false;
            this.currentMonster = null;
            audioManager.restoreSceneBgm();
            this.addMessage('戰鬥介面無法啟動。', 'error');
        }
    }

    settleDungeonVictory(encounter) {
        const monster = encounter.monster;
        const rewards = settleEncounterVictory(encounter);

        this.dungeonMap.clearMonster();
        this.addMessage(`擊敗 ${monster.name}，取得 ${rewards.gold} 金幣與 ${rewards.exp} 經驗。`, 'reward');
        return rewards;
    }

    finishDungeonCombatReturn() {
        this.isInCombat = false;
        this.currentMonster = null;
        audioManager.restoreSceneBgm();
        this.renderMap();
        this.updateUI();
    }

    finishDungeonScene() {
        this.isInCombat = false;
        this.handleBossVictory();
        this.currentMonster = null;
        audioManager.restoreSceneBgm();
        this.exitDungeon();
    }

    finishDungeonDefeat() {
        const result = dungeonManager.resolveDefeat(this.dungeonType);
        showGlobalToast('戰敗回城', `你倒在 ${result.dungeon?.name || '副本'}，已被送回大廳。`, 'warning');
        this.destroy();
        window.location.hash = '#lobby';
    }

    handleBossVictory() {
        const result = dungeonManager.completeDungeon(this.dungeonType);
        if (!result.success) {
            this.addMessage('副本通關資料不存在，無法完成結算。', 'danger');
            return;
        }

        const dungeonData = result.dungeon;
        result.rewards.forEach(reward => this.describeDungeonGrant(reward, '獲得副本寶物'));
        this.addMessage(`🏆 通關 ${dungeonData.name}！`, 'legendary');
        if (dungeonData.challenge?.completion) {
            this.addMessage(dungeonData.challenge.completion, 'reward');
        }
        
        showGlobalToast('副本通關', `恭喜通關 ${dungeonData.name}！`, 'success');
    }
    
    handlePlayerDeath() {
        this.addMessage('💀 你被擊敗了...', 'danger');
        audioManager.play('defeat', { throttleKey: 'dungeon-defeat', throttleMs: 600 });
        this.finishDungeonDefeat();
    }
    
    checkPlayerDeath() {
        const char = GameManager.getCharacter();
        if (char.hp <= 0) this.handlePlayerDeath();
    }
    
    // ==================== 互動事件 ====================
    
    showTreasure() {
        audioManager.play('loot', { throttleKey: 'dungeon-treasure', throttleMs: 220 });
        const result = dungeonManager.openTreasure(this.dungeonType, this.currentFloor);
        
        this.addMessage(`🏺 寶箱！+${result.gold} 金幣`, 'success');
        this.describeDungeonGrant(result.reward, '寶箱中找到');
        this.applyDungeonOutcome(dungeonManager.applyTreasureDiscoveryBonus(
            this.dungeonType,
            this.mechanicState,
            '寶箱'
        ));
        
        this.dungeonMap.clearTreasure();
        this.updateUI();
        this.renderMap();
    }
    
    useHealingSpring() {
        const char = GameManager.getCharacter();
        const healAmount = dungeonManager.applyHealingBonus(Math.floor(char.maxHp * 0.3));
        const healed = dungeonManager.healCharacter(healAmount, 'dungeon-healing');
        audioManager.play('heal', { throttleKey: 'dungeon-healing-spring', throttleMs: 220 });
        
        this.addMessage(`⛲ 恢復 ${healed} 生命`, 'success');
        
        this.dungeonMap.clearHealing();
        this.updateUI();
        this.renderMap();
    }
    
    async showStairsPrompt() {
        const nextFloor = this.currentFloor + 1;
        const isBossFloor = nextFloor === this.totalFloors;
        const dungeonData = DungeonDatabase[this.dungeonType];
        const challenge = dungeonData?.challenge || {};
        const nextFloorMessage = isBossFloor
            ? (challenge.bossWarning || '前方是 Boss 房間，準備好了嗎？')
            : `是否前往第 ${nextFloor} 層？${challenge.playstyle ? ` ${challenge.playstyle}` : ''}`;
        
        // 使用 floor-complete-overlay
        if (this.dom.floorCompleteOverlay) {
            if (this.dom.floorCompleteText) {
                this.dom.floorCompleteText.textContent = nextFloorMessage;
            }
            this.dom.floorCompleteOverlay.classList.remove('hidden');
            return;
        }
        
        const confirmed = await confirmAction({
            title: isBossFloor ? '前往 Boss 房間？' : `前往第 ${nextFloor} 層？`,
            message: isBossFloor
                ? (challenge.bossWarning || '前方是 Boss 房間，進入後會面對更高強度戰鬥。')
                : `${challenge.riskBrief || '進入下一層會刷新地圖與事件。'} ${challenge.rewardBrief ? `獎勵方向：${challenge.rewardBrief}` : ''}`.trim(),
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
        dungeonManager.recordFloorReached(this.dungeonType, this.currentFloor);
        
        const isBossFloor = this.currentFloor === this.totalFloors;
        
        if (isBossFloor) {
            const dungeonData = DungeonDatabase[this.dungeonType];
            this.addMessage('⚠️ Boss 層！', 'warning');
            this.addMessage(`👑 ${dungeonData.monsters.boss.name} 在等待...`, 'boss');
            if (dungeonData.challenge?.bossWarning) {
                this.addMessage(dungeonData.challenge.bossWarning, 'warning');
            }
        } else {
            this.addMessage(`📍 第 ${this.currentFloor} 層`, 'info');
        }
    }
    
    exitDungeon() {
        this.destroy();
        window.location.hash = '#adventure';
    }
    
    // ==================== 渲染 ====================
    
    renderDungeonMap(ctx, canvas, gridSize, cameraX, cameraY) {
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
        this.renderDungeonMap(ctx, canvas, gridSize, cameraX, cameraY);
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
        
        this.updateMechanicPanel();
    }
    
    updateMechanicPanel() {
        const dungeonData = DungeonDatabase[this.dungeonType];
        if (!dungeonData?.mechanic) return;
        
        const mechanic = dungeonData.mechanic;
        
        if (this.dom.mechanicIcon) this.dom.mechanicIcon.textContent = mechanic.icon;
        
        const statusEl = this.dom.mechanicStatus;
        
        if (!statusEl) return;

        const statusText = dungeonManager.getMechanicStatus(
            this.dungeonType,
            this.mechanicState,
            this.dungeonMap?.visionRange || 3
        );

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
