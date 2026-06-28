/**
 * TowerScene.js
 * 無盡塔場景控制器
 */

import GameManager from '../managers/GameManager.js';
import * as FightManager from '../managers/FightManager.js';
import { towerManager, TowerState } from '../managers/TowerManager.js';
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
import { confirmAction, showGlobalToast } from '../utils/UIFeedback.js';
import audioManager from '../utils/AudioManager.js';
import { escapeHtml, getItemVisualHtml } from '../utils/ItemDisplay.js';
import { buildItemTooltipAttrs } from '../utils/ItemTooltip.js';
import { getGeneratedMonsterImage } from '../data/AssetManifest.js';

class TowerScene {
    constructor() {
        this.initialized = false;
        this.selectedFloor = 1;
        this.eventsBound = false;
        this.systemsSubscribed = false;
        this.handleTowerEvent = this.handleTowerEvent.bind(this);
        this.handleGameEvent = this.handleGameEvent.bind(this);
        this.handleBackLobbyClick = this.exitTower.bind(this);
        this.handleStartBattleClick = this.startBattle.bind(this);
        this.handleAttackButtonClick = this.handleAttackClick.bind(this);
        this.handleItemButtonClick = this.showItemMenu.bind(this);
        this.handleFleeButtonClick = this.fleeBattle.bind(this);
        this.handleNextFloorClick = this.goNextFloor.bind(this);
        this.handleRetryClick = this.retryBattle.bind(this);
        this.handleExitClick = this.exitTower.bind(this);
        this.app = null; // 由 main.js 設定
        this.rhythmSystem = null; // 節奏條系統
        this.battleEngine = null;
        this.finishingBattle = false;
    }

    renderMonsterIcon(monster = {}, fallback = '?') {
        const image = monster.image || getGeneratedMonsterImage(monster.id);
        if (image) {
            return `<img src="${escapeHtml(image)}" alt="${escapeHtml(monster.name || '')}">`;
        }
        return escapeHtml(monster.icon || fallback);
    }
    
    // 設定 app 參考
    setApp(app) {
        this.app = app;
    }

    init() {
        // 每次進入場景都需要重新快取元素和綁定事件（因為 DOM 會重新載入）
        this.cacheElements();
        this.bindEvents();
        
        if (!this.initialized) {
            this.subscribeToSystems();
            this.initialized = true;
        }

        this.renderFloorsList();
        this.updatePlayerStats();
        
        const status = towerManager.getStatus();
        if (status.state === TowerState.IN_BATTLE) {
            this.showBattleState();
            this.updateBattleUI();
            this.createBattleEngine(status.currentMonster);
            this.initRhythmSystem();
            this.startRhythmBar();
        } else {
            this.showIdleState();
            this.selectFloor(status.currentFloor || 1);
        }
    }

    cacheElements() {
        // 頂部資訊
        this.highestFloorEl = document.getElementById('highest-floor');
        this.currentFloorEl = document.getElementById('current-floor');
        this.btnBackLobby = document.getElementById('btn-back-lobby');

        // 塔層列表
        this.floorsListEl = document.getElementById('floors-list');

        // 待機狀態
        this.idleStateEl = document.getElementById('idle-state');
        this.monsterPreviewEl = document.getElementById('monster-preview');
        this.floorRewardsEl = document.getElementById('floor-rewards');
        this.btnStartBattle = document.getElementById('btn-start-battle');

        // 戰鬥狀態
        this.battleStateEl = document.getElementById('battle-state');
        this.battleFloorEl = document.getElementById('battle-floor');
        this.playerHpFillEl = document.getElementById('hud-hp-bar') || document.getElementById('player-hp-fill');
        this.playerHpTextEl = document.getElementById('hud-hp-text') || document.getElementById('player-hp-text');
        this.buffIndicatorsEl = document.getElementById('buff-indicators') || document.getElementById('tower-buff-indicators');
        this.monsterNameEl = document.getElementById('battle-monster-name') || document.getElementById('monster-name');
        this.monsterIconEl = document.getElementById('battle-monster-icon') || document.getElementById('monster-icon');
        this.monsterLevelEl = document.getElementById('battle-monster-level') || document.getElementById('monster-level');
        this.monsterAtkEl = document.getElementById('battle-monster-atk') || document.getElementById('monster-atk');
        this.monsterDefEl = document.getElementById('battle-monster-def') || document.getElementById('monster-def');
        this.monsterHpFillEl = document.getElementById('battle-monster-hp-bar') || document.getElementById('monster-hp-fill');
        this.monsterHpTextEl = document.getElementById('battle-monster-hp-text') || document.getElementById('monster-hp-text');
        this.battlePlayerLevelEl = document.getElementById('hud-player-level') || document.getElementById('battle-player-level');

        // 戰鬥按鈕
        this.btnAttack = document.getElementById('btn-attack');
        this.btnItem = document.getElementById('btn-item');
        this.btnFlee = document.getElementById('btn-flee');

        // 結果狀態
        this.resultStateEl = document.getElementById('result-state');
        this.resultIconEl = document.getElementById('result-icon');
        this.resultTitleEl = document.getElementById('result-title');
        this.resultRewardsEl = document.getElementById('result-rewards');
        this.btnNextFloor = document.getElementById('btn-next-floor');
        this.btnRetry = document.getElementById('btn-retry');
        this.btnExit = document.getElementById('btn-exit');

        // 玩家狀態面板
        this.playerLevelEl = document.getElementById('player-level');
        this.playerStatHpEl = document.getElementById('player-stat-hp');
        this.playerStatAtkEl = document.getElementById('player-stat-atk');
        this.playerStatDefEl = document.getElementById('player-stat-def');
        this.playerStatGoldEl = document.getElementById('player-stat-gold');
        this.quickItemsEl = document.getElementById('quick-items');
        
        // 節奏條元素
        this.rhythmBarContainer = document.getElementById('tower-rhythm-bar-container');
        this.rhythmBarEl = document.getElementById('tower-rhythm-bar');
        this.rhythmNeedleEl = document.getElementById('tower-rhythm-needle');
        this.critZoneEl = document.getElementById('tower-crit-zone');
        this.hitZoneEl = document.getElementById('tower-hit-zone');
    }

    bindEvents() {
        if (this.eventsBound) return;
        // 返回大廳按鈕
        this.btnBackLobby?.addEventListener('click', this.handleBackLobbyClick);
        
        // 開始戰鬥
        this.btnStartBattle?.addEventListener('click', this.handleStartBattleClick);

        // 戰鬥操作 - 使用節奏條系統
        this.btnAttack?.addEventListener('click', this.handleAttackButtonClick);
        this.btnItem?.addEventListener('click', this.handleItemButtonClick);
        this.btnFlee?.addEventListener('click', this.handleFleeButtonClick);

        // 結果操作
        this.btnNextFloor?.addEventListener('click', this.handleNextFloorClick);
        this.btnRetry?.addEventListener('click', this.handleRetryClick);
        this.btnExit?.addEventListener('click', this.handleExitClick);
        this.eventsBound = true;
    }

    unbindEvents() {
        this.btnBackLobby?.removeEventListener('click', this.handleBackLobbyClick);
        this.btnStartBattle?.removeEventListener('click', this.handleStartBattleClick);
        this.btnAttack?.removeEventListener('click', this.handleAttackButtonClick);
        this.btnItem?.removeEventListener('click', this.handleItemButtonClick);
        this.btnFlee?.removeEventListener('click', this.handleFleeButtonClick);
        this.btnNextFloor?.removeEventListener('click', this.handleNextFloorClick);
        this.btnRetry?.removeEventListener('click', this.handleRetryClick);
        this.btnExit?.removeEventListener('click', this.handleExitClick);
        this.eventsBound = false;
    }

    cleanup() {
        this.unbindEvents();
        this.stopRhythmBar();
        this.destroyBattleEngine();
        if (this.systemsSubscribed) {
            towerManager.unsubscribe(this.handleTowerEvent);
            GameManager.unsubscribe(this.handleGameEvent);
            this.systemsSubscribed = false;
        }
        this.initialized = false;
    }
    
    /**
     * 處理攻擊按鈕點擊 - 使用節奏條判定
     */
    handleAttackClick() {
        const status = towerManager.getStatus();
        if (status.state !== TowerState.IN_BATTLE) {
            return;
        }
        
        // 使用節奏條系統判定攻擊
        if (this.rhythmSystem) {
            const result = this.rhythmSystem.judgeHit();
            
            // 冷卻中不執行攻擊
            if (result.type === 'cooldown') {
                return;
            }
            
            // 根據判定結果執行攻擊
            this.executeAction({
                type: 'attack',
                hitType: result.type,
                damage: result.damage
            });
        } else {
            // 備用方案：沒有節奏條時使用原始邏輯
            this.executeAction({ type: 'attack' });
        }
    }
    
    /**
     * 初始化節奏條系統
     */
    initRhythmSystem() {
        // 檢查節奏條元素是否存在
        if (!this.rhythmBarEl || !window.RhythmBarSystem) {
            console.warn('[TowerScene] Rhythm bar elements or system not available');
            return;
        }
        
        const char = GameManager.getCharacter();
        
        // 創建一個包裝容器對象，提供正確的元素選擇
        const containerWrapper = {
            querySelector: (selector) => {
                // 將標準選擇器映射到 tower 專用的 ID
                if (selector.includes('rhythm-bar') && !selector.includes('tower')) {
                    return this.rhythmBarEl;
                }
                if (selector.includes('rhythm-needle') && !selector.includes('tower')) {
                    return this.rhythmNeedleEl;
                }
                if (selector.includes('crit-zone') && !selector.includes('tower')) {
                    return this.critZoneEl;
                }
                if (selector.includes('hit-zone') && !selector.includes('tower')) {
                    return this.hitZoneEl;
                }
                if (selector.includes('btn-attack')) {
                    return this.btnAttack;
                }
                // 直接嘗試查詢
                return this.battleStateEl?.querySelector(selector);
            }
        };
        
        // 創建節奏條系統實例
        this.rhythmSystem = new window.RhythmBarSystem(char, containerWrapper);
        
    }
    
    /**
     * 啟動節奏條
     */
    startRhythmBar() {
        if (this.rhythmSystem) {
            this.rhythmSystem.start();
        }
    }
    
    /**
     * 停止節奏條
     */
    stopRhythmBar() {
        if (this.rhythmSystem) {
            this.rhythmSystem.stop();
        }
    }

    subscribeToSystems() {
        if (this.systemsSubscribed) return;
        // 訂閱無盡塔系統事件
        towerManager.subscribe(this.handleTowerEvent);

        // 訂閱遊戲狀態變化
        GameManager.subscribe(this.handleGameEvent);
        this.systemsSubscribed = true;
    }

    handleGameEvent(state, eventType) {
        if (eventType === 'all' || eventType === 'gold') {
            this.updatePlayerStats();
        }
    }

    handleTowerEvent(eventType, data) {
        switch (eventType) {
            case 'challenge_start':
                this.onChallengeStart(data);
                break;
            case 'battle_start':
                this.onBattleStart(data);
                break;
            case 'battle_round':
                this.onBattleRound(data);
                break;
            case 'battle_victory':
                this.onBattleVictory(data);
                break;
            case 'battle_defeat':
                this.onBattleDefeat(data);
                break;
            case 'floor_advance':
                this.onFloorAdvance(data);
                break;
            case 'tower_clear':
                this.onTowerClear(data);
                break;
            case 'rest_heal':
                this.onRestHeal(data);
                break;
        }
    }

    // ===== 渲染方法 =====

    renderFloorsList() {
        if (!this.floorsListEl) return;

        const status = towerManager.getStatus();
        const floors = towerManager.getAllFloorsInfo();

        this.floorsListEl.innerHTML = floors.map(floor => {
            const isUnlocked = floor.isUnlocked;
            const isBoss = floor.isBoss;
            const isCleared = floor.floor <= status.highestFloor;
            const isCurrent = floor.floor === status.currentFloor;

            let className = 'floor-item';
            if (isBoss) className += ' boss';
            if (isCleared) className += ' cleared';
            if (isCurrent) className += ' current';
            if (!isUnlocked) className += ' locked';

            return `
                <div class="${className}" 
                     data-floor="${floor.floor}"
                     onclick="towerScene.selectFloor(${floor.floor})">
                    <span class="floor-number">${floor.floor}</span>
                    <span class="floor-monster">${this.renderMonsterIcon(floor.monster, '?')}</span>
                    <span class="floor-status">
                        ${isCleared ? '✓' : (isUnlocked ? '' : '🔒')}
                    </span>
                </div>
            `;
        }).join('');

        // 更新頂部資訊
        if (this.highestFloorEl) {
            this.highestFloorEl.textContent = status.highestFloor;
        }
        if (this.currentFloorEl) {
            this.currentFloorEl.textContent = status.currentFloor;
        }
    }

    selectFloor(floor) {
        const floorInfo = towerManager.getFloorInfo(floor);
        if (!floorInfo.isUnlocked) {
            this.showMessage('此層尚未解鎖！');
            return;
        }

        this.selectedFloor = floor;

        // 更新選中狀態
        document.querySelectorAll('.floor-item').forEach(el => {
            el.classList.remove('selected');
            if (parseInt(el.dataset.floor) === floor) {
                el.classList.add('selected');
            }
        });

        // 更新預覽
        this.updateFloorPreview(floorInfo);
    }

    updateFloorPreview(floorInfo) {
        if (!floorInfo.monster) return;

        if (this.monsterPreviewEl) {
            const monster = floorInfo.monster;
            
            this.monsterPreviewEl.innerHTML = `
                <div class="monster-icon ${floorInfo.isBoss ? 'boss' : ''}">${this.renderMonsterIcon(monster, '?')}</div>
                <div class="monster-name">${monster.name}</div>
                <div class="monster-level">等級 ${monster.level}</div>
                <div class="monster-stats">
                    <span>生命 ${monster.hp}</span>
                    <span>攻擊 ${monster.attack}</span>
                    <span>防禦 ${monster.defense}</span>
                </div>
                ${floorInfo.isBoss ? '<div class="boss-badge">⭐ BOSS</div>' : ''}
            `;
        }

        if (this.floorRewardsEl) {
            const rewards = [];
            rewards.push(`💰 ${floorInfo.monster.gold} 金幣`);
            rewards.push(`✨ ${floorInfo.monster.exp} 經驗`);

            if (floorInfo.bossEquipment) {
                rewards.push(`🎁 ${floorInfo.bossEquipment.name}`);
            }

            this.floorRewardsEl.innerHTML = `
                <h3>通關獎勵</h3>
                <div class="rewards-list">${rewards.map(reward => `<span class="reward-chip">${reward}</span>`).join('')}</div>
            `;
        }

        // 更新開始按鈕
        if (this.btnStartBattle) {
            const status = towerManager.getStatus();
            if (status.state === TowerState.IN_BATTLE) {
                this.btnStartBattle.textContent = '繼續戰鬥';
            } else {
                this.btnStartBattle.textContent = '開始戰鬥';
            }
        }
    }

    updatePlayerStats() {
        const char = GameManager.getCharacter();

        if (this.playerLevelEl) this.playerLevelEl.textContent = char.level;
        if (this.playerStatHpEl) this.playerStatHpEl.textContent = `${char.hp}/${char.maxHp}`;
        if (this.playerStatAtkEl) this.playerStatAtkEl.textContent = char.getTotalAtk();
        if (this.playerStatDefEl) this.playerStatDefEl.textContent = char.getTotalDef();
        if (this.playerStatGoldEl) this.playerStatGoldEl.textContent = GameManager.getGold();

        // 技能列表已移除

        // 更新快速道具
        this.renderQuickItems();
    }

    // Skills list UI removed for Tower scene

    renderQuickItems() {
        if (!this.quickItemsEl) return;

        const inventory = GameManager.getInventory();
        const potions = inventory.filter(stack => 
            stack.item.type === 'potion' && stack.quantity > 0
        );

        this.quickItemsEl.innerHTML = potions.slice(0, 4).map(stack => `
            <div class="quick-item" onclick="towerScene.useItem('${stack.instanceId}')"${buildItemTooltipAttrs(stack.item, { quantity: stack.quantity })}>
                <span class="item-icon">${getItemVisualHtml(stack.item, '🧪')}</span>
                <span class="item-count">x${stack.quantity}</span>
            </div>
        `).join('') || '<div class="no-items">無可用道具</div>';
    }

    // ===== 戰鬥控制 =====

    createBattleEngine(monster) {
        if (!monster) return;

        this.destroyBattleEngine();
        this.finishingBattle = false;
        this.battleEngine = new FightManager.BattleController(GameManager.getCharacter(), monster);
        this.battleEngine._onAutoAttack = (res) => {
            if (!res || this.finishingBattle) return;
            if (res.destroyedArmor) this.updatePlayerStats();
            if (res.stunned) {
                showCombatDamageNumber(this.battleStateEl, 0, { type: 'statusStun', label: '⚡ 暈眩' });
            } else if (res.damage > 0) {
                showCombatPlayerHitFeedback(this.battleStateEl, GameManager.getCharacter(), res.damage || 0);
            }
            if (res.reflectedDamage > 0) {
                showCombatDamageNumber(this.battleStateEl, res.reflectedDamage, {
                    type: 'reflect',
                    label: `🛡 反傷 -${res.reflectedDamage}`
                });
            }
            if (res.revived) {
                showCombatDamageNumber(this.battleStateEl, 0, {
                    type: 'revive',
                    label: '✨ 復甦'
                });
            }
            this.updateBattleUI();

            if ((monster.hp ?? monster.currentHp ?? 0) <= 0) {
                this.finishBattleVictory();
            } else if (res.playerHp <= 0 && !res.revived) {
                this.finishBattleDefeat();
            }
        };
        this.battleEngine._onStatusApplied = (events = []) => {
            if (this.finishingBattle) return;
            events.forEach(event => {
                const labels = {
                    stun: '⚡ 暈眩',
                    slow: `❄️ 緩速 ${Math.round(event.percent || 0)}%`,
                    poison: `☠️ 中毒 ${event.dps || 0}/秒`,
                    attackSpeed: `✨ 攻速 +${Math.round(event.totalPercent || event.percent || 0)}%`,
                    hpRegen: '💚 回復'
                };
                const types = {
                    stun: 'statusStun',
                    slow: 'statusSlow',
                    poison: 'statusPoison',
                    attackSpeed: 'statusBuff',
                    hpRegen: 'lifesteal'
                };
                showCombatDamageNumber(this.battleStateEl, 0, {
                    type: types[event.type] || 'status',
                    label: labels[event.type] || '狀態'
                });
            });
            this.updateBattleUI();
        };
        this.battleEngine._onStatusTick = (events = []) => {
            if (this.finishingBattle) return;
            events.forEach(event => {
                if (event.type === 'poison') {
                    showCombatDamageNumber(this.battleStateEl, event.damage || 0, {
                        type: 'dot',
                        label: `☠️ -${event.damage || 0}`
                    });
                } else if (event.type === 'hpRegen') {
                    showCombatDamageNumber(this.battleStateEl, event.amount || 0, {
                        type: 'lifesteal',
                        label: `💚 回復 +${event.amount || 0}`
                    });
                }
                if (event.targetDefeated) this.finishBattleVictory();
            });
            this.updateBattleUI();
        };

        this.battleEngine.beginBattle();
        this.battleEngine.startAutoAttack();
    }

    destroyBattleEngine() {
        if (!this.battleEngine) return;
        try {
            this.battleEngine.endBattle?.();
        } catch (error) {
            console.warn('[TowerScene] Failed to stop battle engine:', error);
        }
        this.battleEngine = null;
    }

    startBattle() {
        const status = towerManager.getStatus();

        // 如果不在挑戰中，先開始挑戰
        if (status.state === TowerState.IDLE) {
            const startResult = towerManager.startChallenge(this.selectedFloor);
            if (!startResult.success) {
                this.showMessage(startResult.message);
                return;
            }
        }

        // 進入戰鬥
        const battleResult = towerManager.enterBattle();
        if (!battleResult.success) {
            this.showMessage(battleResult.message);
            return;
        }
    }

    executeAction(action) {
        const status = towerManager.getStatus();
        const monster = status.currentMonster;
        if (status.state !== TowerState.IN_BATTLE || !monster) {
            this.showMessage('目前不在戰鬥中。');
            return;
        }

        if (!this.battleEngine) {
            this.createBattleEngine(monster);
        }

        if (action.type !== 'attack') return;

        const hitType = action.hitType || 'hit';
        const res = this.battleEngine?.playerAttack(hitType);
        if (!res) return;
        this.rhythmSystem?.setBattleAttackSpeedBonus?.(
            this.battleEngine.getPlayerAttackSpeedBonusPercent?.() || 0
        );

        if (res.destroyedWeapon) {
            this.showMessage(`${res.destroyedWeapon.name} 已損壞。`, 'warning');
        }

        const applyRes = res.applyRes || {};
        const damage = applyRes.finalDamage ?? 0;
        const doubleStrikeDamage = Math.max(0, Number(applyRes.doubleStrike?.finalDamage) || 0);
        const profileStrikeDamage = Math.max(0, Number(applyRes.profileStrike?.finalDamage) || 0);
        const primaryDamage = Math.max(0, damage - doubleStrikeDamage - profileStrikeDamage);
        showCombatDamageNumber(this.battleStateEl, primaryDamage || damage, {
            type: hitType === 'miss' ? 'dodge' : damage <= 0 ? 'block' : res.computeRes?.isCrit ? 'critical' : 'normal',
            isCrit: Boolean(res.computeRes?.isCrit),
            isMiss: hitType === 'miss'
        });
        if (profileStrikeDamage > 0) {
            showCombatDamageNumber(this.battleStateEl, profileStrikeDamage, {
                type: 'doubleStrike',
                label: `${applyRes.profileStrike?.label || '武器追擊'} -${profileStrikeDamage}`
            });
        }
        if (doubleStrikeDamage > 0) {
            showCombatDamageNumber(this.battleStateEl, doubleStrikeDamage, {
                type: 'doubleStrike',
                label: `⚡ 連擊 -${doubleStrikeDamage}`
            });
        }
        if (applyRes.lifestealRecovered > 0) {
            showCombatDamageNumber(this.battleStateEl, applyRes.lifestealRecovered, {
                type: 'lifesteal',
                label: `❤ 吸血 +${applyRes.lifestealRecovered}`
            });
        }
        this.updateBattleUI();

        if ((monster.hp ?? monster.currentHp ?? 0) <= 0) {
            this.finishBattleVictory();
        }
    }

    finishBattleVictory() {
        if (this.finishingBattle || towerManager.getStatus().state !== TowerState.IN_BATTLE) return;
        this.finishingBattle = true;
        this.stopRhythmBar();
        this.destroyBattleEngine();
        showCombatKillFreeze(this.battleStateEl);
        setTimeout(() => {
            towerManager.handleVictory();
            this.finishingBattle = false;
        }, 360);
    }

    finishBattleDefeat() {
        if (this.finishingBattle || towerManager.getStatus().state !== TowerState.IN_BATTLE) return;
        this.finishingBattle = true;
        this.stopRhythmBar();
        this.destroyBattleEngine();
        towerManager.handleDefeat();
        this.finishingBattle = false;
    }

    useItem(instanceId) {
        const result = GameManager.useConsumable(instanceId);
        if (result) {
            audioManager.play('heal', { throttleKey: 'tower-use-item', throttleMs: 180 });
            this.updatePlayerStats();
            this.updateBattleUI();
        }
    }

    // Skill menu UI removed for Tower scene

    showItemMenu() {
        if (isCombatActionCooling(this.btnItem)) return;
        const inventory = GameManager.getInventory();
        const potions = inventory.filter(stack => stack.item.type === 'potion');
        if (potions.length > 0) {
            startCombatActionCooldown(this.btnItem, 1);
        }

        const itemsHtml = potions.map(stack =>
            `<button class="item-btn"
                     onclick="towerScene.useItem('${stack.instanceId}'); this.parentElement.parentElement.remove();"${buildItemTooltipAttrs(stack.item, { quantity: stack.quantity })}>
                <span class="item-icon">${getItemVisualHtml(stack.item, '🧪')}</span>
                <span>${escapeHtml(stack.item.name)} x${stack.quantity}</span>
            </button>`
        ).join('') || '<p>沒有可用的道具</p>';

        const menu = document.createElement('div');
        menu.className = 'item-menu-popup';
        menu.innerHTML = `
            <div class="popup-content">
                <h3>選擇道具</h3>
                ${itemsHtml}
                <button onclick="this.parentElement.parentElement.remove()">取消</button>
            </div>
        `;
        document.body.appendChild(menu);
    }

    async fleeBattle() {
        if (isCombatActionCooling(this.btnFlee)) return;
        const confirmed = await confirmAction({
            title: '確認逃跑',
            message: '逃跑會重置目前的無盡塔挑戰進度。',
            details: ['已通過但尚未結算到下一次挑戰的進度會中斷。', '角色狀態會保留，之後可以重新挑戰。'],
            confirmText: '逃跑',
            type: 'danger'
        });

        if (!confirmed) return;

        startCombatActionCooldown(this.btnFlee, 1);
        audioManager.play('flee', { throttleKey: 'tower-flee', throttleMs: 180 });
        this.stopRhythmBar();
        this.destroyBattleEngine();
        towerManager.abandonChallenge();
        this.showIdleState();
        this.renderFloorsList();
        showGlobalToast('已離開戰鬥', '無盡塔挑戰進度已重置。', 'warning');
    }

    goNextFloor() {
        this.destroyBattleEngine();
        const result = towerManager.nextFloor();
        if (result.success) {
            this.showIdleState();
            this.renderFloorsList();
            this.selectFloor(towerManager.getStatus().currentFloor);
        } else {
            this.showMessage(result.message);
        }
    }

    retryBattle() {
        this.destroyBattleEngine();
        const status = towerManager.getStatus();
        towerManager.startChallenge(status.currentFloor);
        this.showIdleState();
    }

    exitTower() {
        this.stopRhythmBar();
        this.destroyBattleEngine();
        towerManager.abandonChallenge();
        if (this.app) {
            this.app.loadScene('lobby');
        } else {
            window.location.hash = '#lobby';
        }
    }

    // ===== 事件處理 =====

    onChallengeStart(data) {
        this.renderFloorsList();
        this.selectFloor(data.floor);
    }

    onBattleStart(data) {
        audioManager.play('combat-start', { throttleKey: 'tower-combat-start', throttleMs: 650 });
        audioManager.playBgm('combat');
        this.showBattleState();
        this.updateBattleUI();
        this.createBattleEngine(data.monster);
        
        if (this.battleFloorEl) {
            this.battleFloorEl.textContent = data.floor;
        }

        if (this.monsterNameEl) {
            this.monsterNameEl.textContent = data.monster.name;
        }

        if (this.monsterIconEl) {
            this.monsterIconEl.innerHTML = this.renderMonsterIcon(data.monster, '?');
        }
        
        // 新增：更新怪物等級和屬性
        if (this.monsterLevelEl) {
            this.monsterLevelEl.textContent = data.monster.level || data.floor;
        }
        
        if (this.monsterAtkEl) {
            this.monsterAtkEl.textContent = data.monster.atk ?? data.monster.attack ?? 0;
        }
        
        if (this.monsterDefEl) {
            this.monsterDefEl.textContent = data.monster.def ?? data.monster.defense ?? 0;
        }
        
        // 更新戰鬥中的玩家等級
        const char = GameManager.getCharacter();
        if (this.battlePlayerLevelEl) {
            this.battlePlayerLevelEl.textContent = char.level;
        }
        
        // 初始化並啟動節奏條系統
        this.initRhythmSystem();
        this.startRhythmBar();
    }

    onBattleRound() {
        this.updateBattleUI();
    }

    onBattleVictory(data) {
        this.stopRhythmBar();
        this.destroyBattleEngine();
        audioManager.restoreSceneBgm();
        this.showResultState(true, data);
    }

    onBattleDefeat(data) {
        this.stopRhythmBar();
        this.destroyBattleEngine();
        audioManager.play('defeat', { throttleKey: 'tower-defeat', throttleMs: 600 });
        audioManager.restoreSceneBgm();
        this.showResultState(false, data);
    }

    onFloorAdvance(data) {
        this.renderFloorsList();
        this.selectFloor(data.floor);

        if (data.isRestFloor) {
            this.showMessage('在休息點恢復了體力！');
        }
    }

    onTowerClear(data) {
        this.showMessage('🎉 恭喜！你征服了無盡塔！');
    }

    onRestHeal(data) {
        audioManager.play('heal', { throttleKey: 'tower-rest-heal', throttleMs: 220 });
        this.updatePlayerStats();
    }

    // ===== UI 狀態切換 =====

    showIdleState() {
        this.destroyBattleEngine();
        audioManager.restoreSceneBgm();
        this.clearActionCooldowns();
        this.idleStateEl?.classList.remove('hidden');
        this.battleStateEl?.classList.add('hidden');
        this.resultStateEl?.classList.add('hidden');
    }

    showBattleState() {
        this.clearActionCooldowns();
        this.idleStateEl?.classList.add('hidden');
        this.battleStateEl?.classList.remove('hidden');
        this.resultStateEl?.classList.add('hidden');
    }

    showResultState(isVictory, data) {
        this.clearActionCooldowns();
        this.idleStateEl?.classList.add('hidden');
        this.battleStateEl?.classList.add('hidden');
        this.resultStateEl?.classList.remove('hidden');

        if (this.resultIconEl) {
            this.resultIconEl.textContent = isVictory ? '🎉' : '💀';
        }

        if (this.resultTitleEl) {
            this.resultTitleEl.textContent = isVictory ? '勝利！' : '失敗...';
            this.resultTitleEl.className = `result-title ${isVictory ? 'victory' : 'defeat'}`;
        }

        if (this.resultRewardsEl && data.rewards) {
            const rewards = data.rewards;
            let html = '<h3>獲得獎勵</h3><div class="rewards-detail">';
            html += `<p>💰 ${rewards.gold} 金幣</p>`;
            html += `<p>✨ ${rewards.exp} 經驗</p>`;

            if (rewards.items && rewards.items.length > 0) {
                html += '<p>🎁 道具：</p><ul>';
                for (const item of rewards.items) {
                    html += `<li${buildItemTooltipAttrs(item, { quantity: item.quantity })}><span class="item-icon">${getItemVisualHtml(item, '📦')}</span> ${escapeHtml(item.name)} x${item.quantity}</li>`;
                }
                html += '</ul>';
            }

            if (rewards.equipment) {
                html += `<p>⚔️ 裝備：${rewards.equipment.name}</p>`;
            }

            if (data.leveledUp) {
                html += '<p class="level-up">🆙 等級提升！</p>';
            }

            html += '</div>';
            this.resultRewardsEl.innerHTML = html;
        }

        // 顯示/隱藏按鈕
        if (this.btnNextFloor) {
            const canContinue = isVictory && towerManager.getStatus().currentFloor < 20;
            this.btnNextFloor.classList.toggle('hidden', !canContinue);
        }

        if (this.btnRetry) {
            this.btnRetry.classList.toggle('hidden', isVictory);
        }

        this.updatePlayerStats();
        this.renderFloorsList();
    }

    updateBattleUI() {
        const char = GameManager.getCharacter();
        const status = towerManager.getStatus();
        const monster = status.currentMonster;

        renderCombatPlayer(this.battleStateEl, char, {
            inventory: GameManager.getInventory(),
            fallbackName: '冒險者'
        });
        if (monster) {
            renderCombatMonster(this.battleStateEl, monster, { level: monster.level || status.currentFloor });
        }

        // 更新右側面板
        this.updatePlayerStats();
    }

    clearActionCooldowns() {
        [this.btnAttack, this.btnItem, this.btnFlee]
            .filter(Boolean)
            .forEach(card => clearCombatActionCooldown(card));
    }

    renderBuffIndicators(char) {
        renderCombatBuffIndicators(this.buffIndicatorsEl, char);
    }

    showMessage(message, type = 'info') {
        const text = String(message || '');
        let resolvedType = type;

        if (resolvedType === 'info') {
            if (text.includes('恭喜') || text.includes('恢復')) {
                resolvedType = 'success';
            } else if (text.includes('尚未') || text.includes('失敗') || text.includes('無法')) {
                resolvedType = 'warning';
            }
        }

        const titleMap = {
            success: '無盡塔進度',
            warning: '無盡塔提示',
            error: '無盡塔錯誤',
            info: '無盡塔'
        };

        showGlobalToast(titleMap[resolvedType] || '無盡塔', text, resolvedType);
    }

    refresh() {
        this.renderFloorsList();
        this.updatePlayerStats();
        const status = towerManager.getStatus();

        if (status.state === TowerState.IN_BATTLE) {
            this.showBattleState();
            this.updateBattleUI();
        } else {
            this.showIdleState();
            this.selectFloor(status.currentFloor || 1);
        }
    }
}

// 建立全域實例
const towerScene = new TowerScene();
window.towerScene = towerScene;

export default towerScene;
