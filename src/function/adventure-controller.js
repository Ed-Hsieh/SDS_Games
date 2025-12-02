// ===== 冒險場景控制器 =====

/**
 * 全域遊戲狀態
 */
let adventureGameState = null;
let worldMap = null;
let canvas = null;
let ctx = null;

/**
 * 戰鬥系統狀態
 */
let currentBattle = null;
let rhythmSystem = null;

/**
 * 區域名稱對照
 */
const zoneNames = {
    'low': '安全區',
    'medium': '普通區',
    'high': '危險區',
    'boss': 'Boss區'
};

/**
 * 區域顏色對照
 */
const zoneColors = {
    'low': '#4caf50',      // 綠色
    'medium': '#ffc107',   // 黃色
    'high': '#ff9800',     // 橙色
    'boss': '#f44336'      // 紅色
};

/**
 * 地形圖標
 */
const terrainIcons = {
    'empty': '',
    'wall': '🧱',
    'monster': '👾',
    'player': '🧙'
};

/**
 * 初始化冒險場景
 */
function initAdventureScene(gameState) {
    adventureGameState = gameState;
    
    // 初始化 Canvas
    canvas = document.getElementById('world-map-canvas');
    if (!canvas) {
        console.error('找不到 world-map-canvas 元素');
        return;
    }
    
    ctx = canvas.getContext('2d');
    
    // 設定 Canvas 大小
    const containerWidth = Math.min(1000, window.innerWidth - 40);
    const containerHeight = Math.min(600, window.innerHeight - 200);
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    
    // 創建世界地圖
    worldMap = new WorldMap(
        gameState.character,
        60,  // gridSize
        20,  // rows
        30,  // cols
        containerWidth,
        containerHeight
    );
    
    // 更新玩家資訊顯示
    updatePlayerInfo();
    
    // 繪製地圖
    renderMap();
    
    // 綁定鍵盤事件
    bindKeyboardEvents();
    
    // 綁定背包按鈕
    const inventoryBtn = document.getElementById('btn-open-inventory');
    if (inventoryBtn) {
        inventoryBtn.addEventListener('click', openInventoryModal);
    } else {
        console.error('找不到背包按鈕');
    }
    
    console.log('冒險場景初始化完成');
}

/**
 * 更新玩家資訊顯示
 */
function updatePlayerInfo() {
    const char = adventureGameState.character;
    
    document.getElementById('adv-player-level').textContent = char.level;
    document.getElementById('adv-player-hp').textContent = `${char.hp}/${char.maxHp}`;
    document.getElementById('adv-player-gold').textContent = char.gold;
    
    // 更新當前區域顯示（只在 worldMap 已初始化時執行）
    if (worldMap) {
        const currentZone = worldMap.getCurrentZone();
        const zoneElement = document.getElementById('current-zone');
        zoneElement.textContent = zoneNames[currentZone];
        zoneElement.className = `info-value zone-indicator ${currentZone}`;
    }
}

/**
 * 繪製地圖
 */
function renderMap() {
    if (!ctx || !worldMap) {
        console.error('renderMap: ctx 或 worldMap 未初始化');
        return;
    }
    
    // 清空畫布
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const gridSize = worldMap.gridSize;
    const cameraX = worldMap.cameraOffsetX;
    const cameraY = worldMap.cameraOffsetY;
    
    // 繪製可見範圍內的地圖格子
    const visibleCells = worldMap.getVisibleCells();
    
    visibleCells.forEach(cell => {
        const x = cell.x * gridSize - cameraX;
        const y = cell.y * gridSize - cameraY;
        
        // 根據區域繪製底色
        const zone = cell.data.zone;
        ctx.fillStyle = zoneColors[zone] + '20';  // 添加透明度
        ctx.fillRect(x, y, gridSize, gridSize);
        
        // 繪製邊框
        ctx.strokeStyle = zoneColors[zone] + '40';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, gridSize, gridSize);
        
        // 繪製地形
        const cellType = cell.data.type;
        if (cellType === 'wall') {
            ctx.fillStyle = '#555';
            ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
        } else if (cellType === 'monster') {
            // 繪製怪物圖標
            ctx.font = `${gridSize * 0.6}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(terrainIcons.monster, x + gridSize / 2, y + gridSize / 2);
        }
    });
    
    // 繪製玩家
    const playerX = worldMap.playerPos.x * gridSize - cameraX;
    const playerY = worldMap.playerPos.y * gridSize - cameraY;
    
    // 玩家底色高亮
    ctx.fillStyle = 'rgba(79, 172, 254, 0.3)';
    ctx.fillRect(playerX, playerY, gridSize, gridSize);
    
    // 玩家邊框
    ctx.strokeStyle = '#4facfe';
    ctx.lineWidth = 3;
    ctx.strokeRect(playerX, playerY, gridSize, gridSize);
    
    // 玩家圖標
    ctx.font = `${gridSize * 0.7}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(terrainIcons.player, playerX + gridSize / 2, playerY + gridSize / 2);
}

/**
 * 綁定鍵盤事件
 */
function bindKeyboardEvents() {
    document.addEventListener('keydown', handleKeyPress);
}

/**
 * 解除鍵盤事件綁定
 */
function unbindKeyboardEvents() {
    document.removeEventListener('keydown', handleKeyPress);
}

/**
 * 處理鍵盤按鍵
 */
function handleKeyPress(event) {
    let dx = 0;
    let dy = 0;
    
    switch(event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            dy = -1;
            event.preventDefault();
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            dy = 1;
            event.preventDefault();
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            dx = -1;
            event.preventDefault();
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            dx = 1;
            event.preventDefault();
            break;
        default:
            return;
    }
    
    // 移動玩家
    if (dx !== 0 || dy !== 0) {
        const result = worldMap.movePlayer(dx, dy);
        
        // 重新繪製地圖
        renderMap();
        
        // 更新玩家資訊
        updatePlayerInfo();
        
        // 檢查是否遭遇戰鬥
        if (result === 'battle') {
            handleBattle();
        }
    }
}

/**
 * 處理戰鬥
 */
function handleBattle() {
    const monster = worldMap.getCurrentMonster();
    
    if (monster) {
        console.log('遭遇怪物:', monster);
        
        // 創建戰鬥實例
        currentBattle = new BattleController(adventureGameState.character, monster);
        
        // 顯示戰鬥彈窗
        showBattleModal();
    }
}

/**
 * 顯示戰鬥彈窗
 */
function showBattleModal() {
    const modal = document.getElementById('battle-modal');
    if (!modal) {
        console.error('找不到 battle-modal 元素');
        return;
    }
    
    modal.style.display = 'flex';
    
    // 更新怪物資訊
    updateMonsterDisplay();
    
    // 初始化節奏條系統
    rhythmSystem = new RhythmBarSystem(adventureGameState.character);
    rhythmSystem.start();
    
    // 綁定戰鬥事件
    bindBattleEvents();
    
    // 添加初始戰鬥日誌
    addBattleLog(`遇到 ${currentBattle.monster.icon} ${currentBattle.monster.name}！`, '');
}

/**
 * 關閉戰鬥彈窗
 */
function closeBattleModal() {
    const modal = document.getElementById('battle-modal');
    modal.style.display = 'none';
    
    // 停止節奏條
    if (rhythmSystem) {
        rhythmSystem.stop();
        rhythmSystem = null;
    }
    
    // 解除戰鬥事件
    unbindBattleEvents();
    
    // 清除當前怪物
    worldMap.clearCurrentMonster();
    currentBattle = null;
    
    // 清空戰鬥日誌
    document.getElementById('battle-log').innerHTML = '';
}

/**
 * 返回大廳
 */
function returnToHall() {
    // 解除鍵盤事件
    unbindKeyboardEvents();
    
    // 切換場景
    adventureGameState.setScene(GameScene.HALL);
    
    // 跳轉回大廳頁面
    window.location.href = 'hall.html';
}

/**
 * 視窗大小調整
 */
window.addEventListener('resize', () => {
    if (canvas && worldMap) {
        const containerWidth = Math.min(1000, window.innerWidth - 40);
        const containerHeight = Math.min(600, window.innerHeight - 200);
        canvas.width = containerWidth;
        canvas.height = containerHeight;
        
        worldMap.screenWidth = containerWidth;
        worldMap.screenHeight = containerHeight;
        worldMap.updateCamera();
        renderMap();
    }
});


// ===== 戰鬥系統 =====

/**
 * 戰鬥控制器
 */
class BattleController {
    constructor(player, monster) {
        this.player = player;
        this.monster = monster;
        this.isPlayerTurn = true;
        this.battleEnded = false;
        this.attackCooldown = false; // 攻擊冷卻狀態
        this.cooldownTimer = null;   // 冷卻計時器
    }
    
    /**
     * 檢查是否可以攻擊
     */
    canAttack() {
        return !this.attackCooldown && !this.battleEnded;
    }
    
    /**
     * 啟動攻擊冷卻
     */
    startAttackCooldown() {
        this.attackCooldown = true;
        const interval = this.player.getAttackInterval();
        
        // 暫停節奏條並顯示冷卻動畫
        if (rhythmSystem) {
            rhythmSystem.pause();
        }
        
        // 顯示冷卻提示
        const attackBtn = document.getElementById('btn-attack');
        attackBtn.disabled = true;
        
        // 更新按鈕內容
        const btnContent = attackBtn.querySelector('.btn-combat-content');
        if (btnContent) {
            btnContent.querySelector('.btn-text').textContent = '冷卻中';
            btnContent.querySelector('.btn-hotkey').textContent = `${interval.toFixed(1)}s`;
        }
        
        // 設定冷卻計時器
        this.cooldownTimer = setTimeout(() => {
            this.attackCooldown = false;
            attackBtn.disabled = false;
            
            // 恢復按鈕
            if (btnContent) {
                btnContent.querySelector('.btn-text').textContent = 'ATTACK';
                btnContent.querySelector('.btn-hotkey').textContent = 'PRESS SPACE';
            }
            
            // 恢復節奏條
            if (rhythmSystem) {
                rhythmSystem.resume();
            }
        }, interval * 1000);
    }
    
    /**
     * 玩家攻擊
     */
    playerAttack(hitType) {
        if (!this.canAttack()) {
            addBattleLog('攻擊冷卻中，請稍候...', 'miss');
            return;
        }
        
        const playerAtk = this.player.getTotalAtk();
        const critChance = this.player.getCritChance();
        const critDamage = this.player.getCritDamage();
        
        let damage = 0;
        let isCrit = false;
        let message = '';
        let logClass = 'player-action';
        
        if (hitType === 'miss') {
            message = '攻擊落空！';
            logClass = 'miss';
        } else if (hitType === 'crit') {
            damage = Math.floor(playerAtk * critDamage);
            isCrit = true;
            message = `暴擊！造成 ${damage} 點傷害！`;
            logClass = 'crit';
        } else {
            // 普通攻擊
            damage = playerAtk;
            message = `攻擊命中，造成 ${damage} 點傷害`;
        }
        
        // 怪物受傷
        if (damage > 0) {
            const actualDamage = this.monster.takeDamage(damage);
            updateMonsterDisplay();
            
            // 檢查怪物是否死亡 - 如果死亡，直接結束戰鬥，不進入冷卻
            if (this.monster.isDead()) {
                addBattleLog(message, logClass);
                this.handleVictory();
                return;
            }
        }
        
        addBattleLog(message, logClass);
        
        // 怪物存活才啟動攻擊冷卻
        this.startAttackCooldown();
        
        // 怪物回合
        setTimeout(() => this.monsterAttack(), 1000);
    }
    
    /**
     * 怪物攻擊
     */
    monsterAttack() {
        if (this.battleEnded) return;
        
        const damage = Math.max(1, this.monster.attack - this.player.getTotalDef());
        this.player.hp = Math.max(0, this.player.hp - damage);
        
        addBattleLog(`${this.monster.name} 攻擊造成 ${damage} 點傷害！`, 'monster-action');
        updatePlayerInfo();
        
        // 檢查玩家是否死亡
        if (this.player.hp <= 0) {
            this.handleDefeat();
        }
    }
    
    /**
     * 處理勝利
     */
    handleVictory() {
        this.battleEnded = true;
        addBattleLog(`擊敗了 ${this.monster.name}！`, 'player-action');
        
        // 清除冷卻計時器
        if (this.cooldownTimer) {
            clearTimeout(this.cooldownTimer);
            this.cooldownTimer = null;
        }
        
        // 停止節奏條
        if (rhythmSystem) {
            rhythmSystem.stop();
        }
        
        // 獲取掉落
        const drops = this.monster.getDrops();
        
        // 獲得經驗值和金幣
        this.player.exp += this.monster.exp;
        this.player.checkLevelUp();
        this.player.addGold(drops.gold);
        
        updatePlayerInfo();
        
        // 顯示戰利品
        setTimeout(() => {
            closeBattleModal();
            showLootModal(this.monster.exp, drops.gold, drops.items);
        }, 1500);
    }
    
    /**
     * 處理失敗
     */
    handleDefeat() {
        this.battleEnded = true;
        addBattleLog('你被擊敗了...', 'monster-action');
        
        // 清除冷卻計時器
        if (this.cooldownTimer) {
            clearTimeout(this.cooldownTimer);
            this.cooldownTimer = null;
        }
        
        // 停止節奏條
        if (rhythmSystem) {
            rhythmSystem.stop();
        }
        
        // 扣除金幣懲罰
        const penalty = Math.floor(this.player.gold * 0.1);
        this.player.removeGold(penalty);
        
        // 回復部分HP
        this.player.hp = Math.floor(this.player.maxHp * 0.3);
        
        updatePlayerInfo();
        
        setTimeout(() => {
            closeBattleModal();
            addBattleLog(`你失去了 ${penalty} 金幣...`, 'monster-action');
        }, 1500);
    }
    
    /**
     * 逃跑
     */
    flee() {
        if (this.battleEnded) return;
        
        // 50% 逃跑成功率
        if (Math.random() < 0.5) {
            this.battleEnded = true;
            addBattleLog('成功逃跑！', 'player-action');
            
            setTimeout(() => {
                closeBattleModal();
            }, 1000);
        } else {
            addBattleLog('逃跑失敗！', 'miss');
            // 怪物反擊
            setTimeout(() => this.monsterAttack(), 1000);
        }
    }
}

/**
 * 節奏條系統
 */
class RhythmBarSystem {
    constructor(character) {
        this.character = character;
        this.barElement = document.getElementById('rhythm-bar');
        this.needleElement = document.getElementById('rhythm-needle');
        this.critZoneElement = document.getElementById('crit-zone');
        this.hitZoneElement = document.getElementById('hit-zone');
        
        this.isPaused = false; // 暫停狀態
        
        this.barWidth = 100; // 百分比
        this.needlePosition = 0;
        this.needleDirection = 1; // 1 = 向右, -1 = 向左
        this.baseSpeed = 1.0; // 基礎速度：1秒走完
        this.weaponSpeed = character.getWeaponSpeed();
        this.animationId = null;
        this.lastTime = 0;
        
        // 區域設定
        this.critChance = character.getCritChance();
        this.critZone = { start: 0, width: 0 };
        this.hitZone = { start: 0, width: 0 };
        
        this.generateZones();
    }
    
    /**
     * 生成爆擊區域和有效區域
     */
    generateZones() {
        // 固定配置：CRIT區域在中央，HIT區域在兩側，確保不重疊
        const critStart = 45; // 中央位置
        const critWidth = 10;
        const hitWidth = 25;
        
        this.critZone = {
            start: critStart,
            width: critWidth
        };
        
        // HIT區域在CRIT左側或右側隨機選擇
        const hitOnLeft = Math.random() > 0.5;
        this.hitZone = {
            start: hitOnLeft ? (critStart - hitWidth - 2) : (critStart + critWidth + 2),
            width: hitWidth
        };
        
        // 更新DOM元素位置
        this.critZoneElement.style.left = this.critZone.start + '%';
        this.critZoneElement.style.width = this.critZone.width + '%';
        
        this.hitZoneElement.style.left = this.hitZone.start + '%';
        this.hitZoneElement.style.width = this.hitZone.width + '%';
    }
    
    /**
     * 暫停節奏條
     */
    pause() {
        this.isPaused = true;
        this.barElement.classList.add('cooldown');
    }
    
    /**
     * 恢復節奏條
     */
    resume() {
        this.isPaused = false;
        this.barElement.classList.remove('cooldown');
        this.lastTime = performance.now(); // 重置時間以避免跳躍
    }
    
    /**
     * 開始節奏條動畫
     */
    start() {
        this.lastTime = performance.now();
        this.animate();
    }
    
    /**
     * 停止節奏條動畫
     */
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    /**
     * 動畫循環
     */
    animate() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000; // 轉換為秒
        this.lastTime = currentTime;
        
        // 如果暫停，不更新位置
        if (!this.isPaused) {
            // 計算移動速度（pointer_speed = base_length / wep_speed）
            const speed = (this.barWidth / this.weaponSpeed) * deltaTime;
            
            // 更新指針位置
            this.needlePosition += speed * this.needleDirection;
            
            // 邊界檢查並反轉方向
            if (this.needlePosition >= this.barWidth) {
                this.needlePosition = this.barWidth;
                this.needleDirection = -1;
            } else if (this.needlePosition <= 0) {
                this.needlePosition = 0;
                this.needleDirection = 1;
            }
            
            // 更新DOM
            this.needleElement.style.left = this.needlePosition + '%';
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    /**
     * 判定攻擊結果
     */
    judgeHit() {
        const pos = this.needlePosition;
        
        // 檢查爆擊區域
        if (pos >= this.critZone.start && pos <= this.critZone.start + this.critZone.width) {
            return 'crit';
        }
        
        // 檢查有效攻擊區域
        if (pos >= this.hitZone.start && pos <= this.hitZone.start + this.hitZone.width) {
            return 'hit';
        }
        
        // Miss
        return 'miss';
    }
}

/**
 * 更新怪物顯示
 */
function updateMonsterDisplay() {
    const monster = currentBattle.monster;
    
    document.getElementById('battle-monster-icon').textContent = monster.icon;
    document.getElementById('battle-monster-name').textContent = monster.name;
    document.getElementById('battle-monster-level').textContent = monster.level;
    document.getElementById('battle-monster-hp-text').textContent = `${monster.hp}/${monster.maxHp}`;
    document.getElementById('battle-monster-atk').textContent = monster.attack;
    document.getElementById('battle-monster-def').textContent = monster.defense;
    
    // 更新HP條
    const hpPercent = (monster.hp / monster.maxHp) * 100;
    document.getElementById('battle-monster-hp-bar').style.width = hpPercent + '%';
}

/**
 * 添加戰鬥日誌
 */
function addBattleLog(message, className = '') {
    const log = document.getElementById('battle-log');
    const entry = document.createElement('div');
    entry.className = 'log-entry ' + className;
    entry.textContent = message;
    log.appendChild(entry);
    
    // 自動滾動到底部
    log.scrollTop = log.scrollHeight;
}

/**
 * 綁定戰鬥事件
 */
function bindBattleEvents() {
    // 攻擊按鈕
    const attackBtn = document.getElementById('btn-attack');
    if (attackBtn) {
        attackBtn.addEventListener('click', handleAttackClick);
    } else {
        console.error('找不到攻擊按鈕 #btn-attack');
    }
    
    // 逃跑按鈕
    const fleeBtn = document.getElementById('btn-flee');
    if (fleeBtn) {
        fleeBtn.addEventListener('click', handleFleeClick);
    } else {
        console.error('找不到逃跑按鈕 #btn-flee');
    }
    
    // 空白鍵攻擊
    document.addEventListener('keydown', handleBattleKeyPress);
}

/**
 * 解除戰鬥事件
 */
function unbindBattleEvents() {
    document.removeEventListener('keydown', handleBattleKeyPress);
}
/**
 * 處理攻擊點擊
 */
function handleAttackClick() {
    if (!currentBattle || currentBattle.battleEnded) {
        console.log('戰鬥未進行或已結束');
        return;
    }
    
    if (!rhythmSystem) {
        console.error('rhythmSystem 未初始化！');
        return;
    }
    
    const hitType = rhythmSystem.judgeHit();
    currentBattle.playerAttack(hitType);
    
    // 重新生成區域
    rhythmSystem.generateZones();
}

/**
 * 處理逃跑點擊
 */
function handleFleeClick() {
    if (!currentBattle || currentBattle.battleEnded) return;
    currentBattle.flee();
}

/**
 * 處理戰鬥按鍵
 */
function handleBattleKeyPress(event) {
    if (event.code === 'Space') {
        event.preventDefault();
        handleAttackClick();
    }
}

/**
 * 工具函數：生成裝備數值HTML
 */
function getStatsHTML(item) {
    let statsHtml = '';
    if (item.type === 'weapon') {
        statsHtml = `<div class="item-stat-value">⚔️ ATK <span class="stat-num">${item.attack || 0}</span></div>`;
    } else if (item.type === 'armor') {
        statsHtml = `<div class="item-stat-value">🛡️ DEF <span class="stat-num">${item.defense || 0}</span></div>`;
    } else if (item.type === 'accessory') {
        const stats = [];
        if (item.hp) stats.push(`<span class="stat-num">HP+${item.hp}</span>`);
        if (item.attack) stats.push(`<span class="stat-num">ATK+${item.attack}</span>`);
        if (item.defense) stats.push(`<span class="stat-num">DEF+${item.defense}</span>`);
        if (item.critChance) stats.push(`<span class="stat-num">CRIT+${(item.critChance * 100).toFixed(0)}%</span>`);
        if (stats.length > 0) statsHtml = `<div class="item-stat-value">✨ ${stats.join(' ')}</div>`;
    }
    return statsHtml;
}

/**
 * 顯示戰利品彈窗（重新設計：雙向交換系統）
 */
function showLootModal(exp, gold, items) {
    const modal = document.getElementById('loot-modal');
    modal.style.display = 'flex';
    
    // 更新經驗值和金幣
    document.getElementById('exp-gained').textContent = `+${exp} EXP`;
    document.getElementById('gold-gained').textContent = `+${gold}`;
    
    // 戰利品池（右側）
    let lootPool = [...items];
    
    // 更新左側：玩家背包
    function updatePlayerInventory() {
        const container = document.getElementById('loot-current-inventory');
        const capacity = document.getElementById('loot-inventory-capacity');
        const inventory = adventureGameState.inventory;
        
        capacity.textContent = `${inventory.getUsedSlots()}/${inventory.maxSlots}`;
        container.innerHTML = '';
        
        if (inventory.items.length === 0) {
            container.innerHTML = '<div class="empty-state">背包是空的<br><span class="hint-arrow">←</span> 點擊右側戰利品拾取</div>';
        } else {
            inventory.items.forEach(item => {
                const slot = document.createElement('div');
                slot.className = `loot-slot ${item.rarity}`;
                slot.innerHTML = `
                    <div class="slot-icon">${item.icon}</div>
                    <div class="slot-info">
                        <div class="slot-name">${item.name}</div>
                        <div class="slot-type">${item.type}</div>
                        ${getStatsHTML(item)}
                    </div>
                    <div class="slot-action">
                        <div class="action-icon">→</div>
                    </div>
                `;
                slot.onclick = () => {
                    // 從背包移回戰利品池
                    inventory.removeItem(item.id);
                    lootPool.push(item);
                    updatePlayerInventory();
                    updateLootPool();
                };
                container.appendChild(slot);
            });
        }
    }
    
    // 更新右側：戰利品池
    function updateLootPool() {
        const container = document.getElementById('loot-items');
        const count = document.getElementById('loot-count');
        
        count.textContent = `${lootPool.length} items`;
        container.innerHTML = '';
        
        if (lootPool.length === 0) {
            container.innerHTML = '<div class="empty-state">沒有戰利品</div>';
        } else {
            lootPool.forEach((item, index) => {
                const slot = document.createElement('div');
                slot.className = `loot-slot ${item.rarity}`;
                slot.innerHTML = `
                    <div class="slot-action">
                        <div class="action-icon">←</div>
                    </div>
                    <div class="slot-info">
                        <div class="slot-name">${item.name}</div>
                        <div class="slot-type">${item.type}</div>
                        ${getStatsHTML(item)}
                    </div>
                    <div class="slot-icon">${item.icon}</div>
                `;
                slot.onclick = () => {
                    // 從戰利品池移到背包
                    const inventory = adventureGameState.inventory;
                    if (inventory.isFull()) {
                        alert('背包已滿！請先將左側物品移回右側');
                        return;
                    }
                    
                    inventory.addItem(item);
                    lootPool.splice(index, 1);
                    updatePlayerInventory();
                    updateLootPool();
                };
                container.appendChild(slot);
            });
        }
    }
    
    // 初始化顯示
    updatePlayerInventory();
    updateLootPool();
    
    // 完成按鈕（始終可用）
    document.getElementById('btn-close-loot').onclick = () => {
        // 將未拾取的戰利品自動送入倉庫
        lootPool.forEach(item => {
            adventureGameState.warehouse.addItem(item);
        });
        
        adventureGameState.save();
        modal.style.display = 'none';
    };
}

// ===== 背包相關功能 =====

/**
 * 開啟背包彈窗
 */
function openInventoryModal() {
    const modal = document.getElementById('inventory-modal');
    if (!modal) {
        console.error('找不到 inventory-modal 元素');
        return;
    }
    
    modal.style.display = 'flex';
    
    updateInventoryModal();
    
    // 綁定關閉按鈕
    const closeBtn = document.getElementById('btn-close-inventory');
    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };
    }
}

/**
 * 更新背包彈窗內容
 */
function updateInventoryModal() {
    const list = document.getElementById('adventure-inventory-list');
    const capacity = document.getElementById('inventory-capacity');
    
    const inventory = adventureGameState.inventory;
    capacity.textContent = `${inventory.getUsedSlots()}/${inventory.maxSlots}`;
    
    list.innerHTML = '';
    
    if (inventory.items.length === 0) {
        list.innerHTML = '<p style="color: #aaa; text-align: center; padding: 40px 0;">背包是空的</p>';
        return;
    }
    
    inventory.items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = `adventure-inventory-item ${item.rarity}`;
        
        // 使用 getStatsHTML 生成數值顯示
        const statsHTML = getStatsHTML(item);
        
        itemDiv.innerHTML = `
            <div class="item-icon-medium">${item.icon}</div>
            <div class="item-info-medium">
                <div class="item-name-medium">${item.name}</div>
                <div class="item-type-medium">${item.type}</div>
                ${statsHTML}
            </div>
        `;
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'item-actions';
        
        // 如果是消耗品，顯示使用按鈕
        if (!item.isEquipment()) {
            const useBtn = document.createElement('button');
            useBtn.className = 'btn btn-primary btn-small';
            useBtn.textContent = '使用';
            useBtn.onclick = (e) => {
                e.stopPropagation();
                useItemInAdventure(item);
            };
            actionsDiv.appendChild(useBtn);
        }
        
        // 丟棄按鈕
        const discardBtn = document.createElement('button');
        discardBtn.className = 'btn btn-danger btn-small';
        discardBtn.textContent = '丟棄';
        discardBtn.onclick = (e) => {
            e.stopPropagation();
            discardItemInAdventure(item);
        };
        actionsDiv.appendChild(discardBtn);
        
        itemDiv.appendChild(actionsDiv);
        list.appendChild(itemDiv);
    });
}

/**
 * 在冒險中使用道具
 */
function useItemInAdventure(item) {
    adventureGameState.character.useItem(item);
    adventureGameState.inventory.removeItem(item.id);
    adventureGameState.save();
    
    updatePlayerInfo();
    updateInventoryModal();
    
    console.log(`使用了 ${item.name}`);
}

/**
 * 在冒險中丟棄物品
 */
function discardItemInAdventure(item) {
    adventureGameState.inventory.removeItem(item.id);
    adventureGameState.save();
    
    updateInventoryModal();
    
    console.log(`丟棄了 ${item.name}`);
}

/**
 * 在冒險中使用道具
 */
function useItemInAdventure(item) {
    adventureGameState.character.useItem(item);
    adventureGameState.inventory.removeItem(item.id);
    adventureGameState.save();
    
    updatePlayerInfo();
    updateInventoryModal();
    
    console.log(`使用了 ${item.name}`);
}

/**
 * 在冒險中丟棄物品
 */
function discardItemInAdventure(item) {
    adventureGameState.inventory.removeItem(item.id);
    adventureGameState.save();
    
    updateInventoryModal();
    
    console.log(`丟棄了 ${item.name}`);
}
