/**
 * TowerScene.js
 * 無盡塔場景控制器
 */

import GameManager from '../managers/GameManager.js';
import { towerSystem, TowerState } from './TowerSystem.js';
import { getTowerMonster } from '../data/Monsters.js';
import { getBossEquipment } from '../data/BossEquipment.js';

class TowerScene {
    constructor() {
        this.initialized = false;
        this.selectedFloor = 1;
        this.app = null; // 由 main.js 設定
        this.rhythmSystem = null; // 節奏條系統
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
            console.log('TowerScene initialized');
        }

        this.renderFloorsList();
        this.updatePlayerStats();
        
        const status = towerSystem.getStatus();
        if (status.state === TowerState.IN_BATTLE) {
            this.showBattleState();
            this.updateBattleUI();
        } else {
            this.showIdleState();
            this.selectFloor(status.currentFloor || 1);
        }
    }

    cacheElements() {
        // 頂部資訊
        this.highestFloorEl = document.getElementById('highest-floor');
        this.currentFloorEl = document.getElementById('current-floor');

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
        this.playerHpFillEl = document.getElementById('player-hp-fill');
        this.playerHpTextEl = document.getElementById('player-hp-text');
        this.playerMpFillEl = document.getElementById('player-mp-fill');
        this.playerMpTextEl = document.getElementById('player-mp-text');
        this.monsterNameEl = document.getElementById('monster-name');
        this.monsterIconEl = document.getElementById('monster-icon');
        this.monsterLevelEl = document.getElementById('monster-level');
        this.monsterAtkEl = document.getElementById('monster-atk');
        this.monsterDefEl = document.getElementById('monster-def');
        this.monsterHpFillEl = document.getElementById('monster-hp-fill');
        this.monsterHpTextEl = document.getElementById('monster-hp-text');
        this.battleLogEl = null; // battle log removed
        this.battlePlayerLevelEl = document.getElementById('battle-player-level');

        // 戰鬥按鈕
        this.btnAttack = document.getElementById('btn-attack');
        this.btnSkill = document.getElementById('btn-skill');
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
        this.playerStatMpEl = document.getElementById('player-stat-mp');
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
        // 返回大廳按鈕
        const btnBackLobby = document.getElementById('btn-back-lobby');
        btnBackLobby?.addEventListener('click', () => this.exitTower());
        
        // 開始戰鬥
        this.btnStartBattle?.addEventListener('click', () => this.startBattle());

        // 戰鬥操作 - 使用節奏條系統
        this.btnAttack?.addEventListener('click', () => this.handleAttackClick());
        // Skill UI removed: skill button no longer opens a skill menu
        this.btnItem?.addEventListener('click', () => this.showItemMenu());
        this.btnFlee?.addEventListener('click', () => this.fleeBattle());

        // 結果操作
        this.btnNextFloor?.addEventListener('click', () => this.goNextFloor());
        this.btnRetry?.addEventListener('click', () => this.retryBattle());
        this.btnExit?.addEventListener('click', () => this.exitTower());
    }
    
    /**
     * 處理攻擊按鈕點擊 - 使用節奏條判定
     */
    handleAttackClick() {
        const status = towerSystem.getStatus();
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
        
        console.log('[TowerScene] Rhythm system initialized');
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
        // 訂閱無盡塔系統事件
        towerSystem.subscribe((eventType, data) => {
            this.handleTowerEvent(eventType, data);
        });

        // 訂閱遊戲狀態變化
        GameManager.subscribe((state, eventType) => {
            if (eventType === 'all' || eventType === 'gold') {
                this.updatePlayerStats();
            }
        });
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

        const status = towerSystem.getStatus();
        const floors = towerSystem.getAllFloorsInfo();

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
                    <span class="floor-monster">${floor.monster?.icon || '?'}</span>
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
        const floorInfo = towerSystem.getFloorInfo(floor);
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
                <div class="monster-icon ${floorInfo.isBoss ? 'boss' : ''}">${monster.icon}</div>
                <div class="monster-name">${monster.name}</div>
                <div class="monster-level">Lv.${monster.level}</div>
                <div class="monster-stats">
                    <span>❤️ ${monster.hp}</span>
                    <span>⚔️ ${monster.atk}</span>
                    <span>🛡️ ${monster.def}</span>
                </div>
                ${floorInfo.isBoss ? '<div class="boss-badge">⭐ BOSS</div>' : ''}
            `;
        }

        if (this.floorRewardsEl) {
            const rewards = [];
            rewards.push(`💰 ${floorInfo.monster.gold} G`);
            rewards.push(`✨ ${floorInfo.monster.exp} EXP`);

            if (floorInfo.bossEquipment) {
                rewards.push(`🎁 ${floorInfo.bossEquipment.name}`);
            }

            this.floorRewardsEl.innerHTML = `
                <h3>通關獎勵</h3>
                <div class="rewards-list">${rewards.join('<br>')}</div>
            `;
        }

        // 更新開始按鈕
        if (this.btnStartBattle) {
            const status = towerSystem.getStatus();
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
        if (this.playerStatMpEl) this.playerStatMpEl.textContent = `${char.mp}/${char.maxMp}`;
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
            <div class="quick-item" onclick="towerScene.useItem('${stack.instanceId}')">
                <span class="item-icon">${stack.item.icon}</span>
                <span class="item-count">x${stack.quantity}</span>
            </div>
        `).join('') || '<div class="no-items">無可用道具</div>';
    }

    // ===== 戰鬥控制 =====

    startBattle() {
        const status = towerSystem.getStatus();

        // 如果不在挑戰中，先開始挑戰
        if (status.state === TowerState.IDLE) {
            const startResult = towerSystem.startChallenge(this.selectedFloor);
            if (!startResult.success) {
                this.showMessage(startResult.message);
                return;
            }
        }

        // 進入戰鬥
        const battleResult = towerSystem.enterBattle();
        if (!battleResult.success) {
            this.showMessage(battleResult.message);
            return;
        }
    }

    executeAction(action) {
        const result = towerSystem.executeBattleRound(action);
        if (!result.success && result.message) {
            this.showMessage(result.message);
        }
    }

    // Skill usage via TowerScene removed; towerSystem still processes skill actions if invoked programmatically

    useItem(instanceId) {
        const result = GameManager.useConsumable(instanceId);
        if (result) {
            this.updatePlayerStats();
            this.updateBattleUI();
            this.addBattleLog('使用了道具恢復狀態！');
        }
    }

    // Skill menu UI removed for Tower scene

    showItemMenu() {
        const inventory = GameManager.getInventory();
        const potions = inventory.filter(stack => stack.item.type === 'potion');

        const itemsHtml = potions.map(stack =>
            `<button class="item-btn" 
                     onclick="towerScene.useItem('${stack.instanceId}'); this.parentElement.parentElement.remove();">
                ${stack.item.icon} ${stack.item.name} x${stack.quantity}
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

    fleeBattle() {
        if (confirm('確定要逃跑嗎？進度將會重置。')) {
            this.stopRhythmBar();
            towerSystem.abandonChallenge();
            this.showIdleState();
            this.renderFloorsList();
        }
    }

    goNextFloor() {
        const result = towerSystem.nextFloor();
        if (result.success) {
            this.showIdleState();
            this.renderFloorsList();
            this.selectFloor(towerSystem.getStatus().currentFloor);
        } else {
            this.showMessage(result.message);
        }
    }

    retryBattle() {
        const status = towerSystem.getStatus();
        towerSystem.startChallenge(status.currentFloor);
        this.showIdleState();
    }

    exitTower() {
        this.stopRhythmBar();
        towerSystem.abandonChallenge();
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
        this.showBattleState();
        this.updateBattleUI();

        if (this.battleFloorEl) {
            this.battleFloorEl.textContent = data.floor;
        }

        if (this.monsterNameEl) {
            this.monsterNameEl.textContent = data.monster.name;
        }

        if (this.monsterIconEl) {
            this.monsterIconEl.textContent = data.monster.icon;
        }
        
        // 新增：更新怪物等級和屬性
        if (this.monsterLevelEl) {
            this.monsterLevelEl.textContent = data.monster.level || data.floor;
        }
        
        if (this.monsterAtkEl) {
            this.monsterAtkEl.textContent = data.monster.atk;
        }
        
        if (this.monsterDefEl) {
            this.monsterDefEl.textContent = data.monster.def;
        }
        
        // 更新戰鬥中的玩家等級
        const char = GameManager.getCharacter();
        if (this.battlePlayerLevelEl) {
            this.battlePlayerLevelEl.textContent = char.level;
        }
        
        // 初始化並啟動節奏條系統
        this.initRhythmSystem();
        this.startRhythmBar();

        this.clearBattleLog();
        this.addBattleLog(`遭遇了 ${data.monster.name}！`);
    }

    onBattleRound(data) {
        for (const log of data.roundLog) {
            this.addBattleLog(log.message);
        }
        this.updateBattleUI();
    }

    onBattleVictory(data) {
        this.stopRhythmBar();
        this.showResultState(true, data);
    }

    onBattleDefeat(data) {
        this.stopRhythmBar();
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
        this.updatePlayerStats();
    }

    // ===== UI 狀態切換 =====

    showIdleState() {
        this.idleStateEl?.classList.remove('hidden');
        this.battleStateEl?.classList.add('hidden');
        this.resultStateEl?.classList.add('hidden');
    }

    showBattleState() {
        this.idleStateEl?.classList.add('hidden');
        this.battleStateEl?.classList.remove('hidden');
        this.resultStateEl?.classList.add('hidden');
    }

    showResultState(isVictory, data) {
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
            html += `<p>💰 ${rewards.gold} G</p>`;
            html += `<p>✨ ${rewards.exp} EXP</p>`;

            if (rewards.items && rewards.items.length > 0) {
                html += '<p>🎁 道具：</p><ul>';
                for (const item of rewards.items) {
                    html += `<li>${item.icon || '📦'} ${item.name} x${item.quantity}</li>`;
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
            const canContinue = isVictory && towerSystem.getStatus().currentFloor < 20;
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
        const status = towerSystem.getStatus();
        const monster = status.currentMonster;

        // 更新玩家血量
        if (this.playerHpFillEl && this.playerHpTextEl) {
            const hpPercent = (char.hp / char.maxHp) * 100;
            this.playerHpFillEl.style.width = `${hpPercent}%`;
            this.playerHpTextEl.textContent = `${char.hp}/${char.maxHp}`;
        }

        // 更新玩家魔力
        if (this.playerMpFillEl && this.playerMpTextEl) {
            const mpPercent = (char.mp / char.maxMp) * 100;
            this.playerMpFillEl.style.width = `${mpPercent}%`;
            this.playerMpTextEl.textContent = `${char.mp}/${char.maxMp}`;
        }

        // 更新怪物血量
        if (monster && this.monsterHpFillEl && this.monsterHpTextEl) {
            const hpPercent = (monster.currentHp / monster.hp) * 100;
            this.monsterHpFillEl.style.width = `${hpPercent}%`;
            this.monsterHpTextEl.textContent = `${monster.currentHp}/${monster.hp}`;
        }

        // 更新右側面板
        this.updatePlayerStats();
    }

    addBattleLog(message) {
        // battle log UI removed
    }

    clearBattleLog() {
        // battle log UI removed
    }

    showMessage(message) {
        // 簡易提示
        alert(message);
    }

    refresh() {
        this.renderFloorsList();
        this.updatePlayerStats();
        const status = towerSystem.getStatus();

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
