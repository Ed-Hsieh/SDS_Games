/**
 * AdventureScene.js
 * Logic for the Adventure scene (Map, Battle, etc.)
 */
import GameManager from '../managers/GameManager.js';
import WorldMap from '../utils/WorldMap.js';

export default class AdventureScene {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.worldMap = null;
        this.canvas = null;
        this.ctx = null;
        this.currentBattle = null;
        this.rhythmSystem = null;
        this.animationFrameId = null;
        
        // Bindings
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.updateUI = this.updateUI.bind(this);
    }

    init() {
        console.log('Adventure Scene Initialized');
        
        // Set global reference for adventure item actions
        window.currentAdventureScene = this;
        
        try {
            this.cacheDOM();
            
            // Initialize Canvas
            this.initCanvas();
            
            // Create World Map
            const char = GameManager.getCharacter();
            this.worldMap = new WorldMap(
                char,
                60, 20, 30,
                this.canvas.width, this.canvas.height
            );

            this.updateUI();
            this.renderMap();
            this.bindEvents();
        } catch (error) {
            console.error('Error initializing Adventure Scene:', error);
        }
    }

    cleanup() {
        // Cancel any running animation frames
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        // Stop rhythm system if active
        if (this.rhythmSystem) {
            this.rhythmSystem.stop();
            this.rhythmSystem = null;
        }
        
        // Clean up battle
        if (this.currentBattle) {
            this.currentBattle.battleEnded = true;
            this.currentBattle = null;
        }
        
        this.unbindEvents();
        console.log('Adventure Scene Cleaned up');
    }

    cacheDOM() {
        this.dom = {
            canvas: this.container.querySelector('#world-map-canvas'),
            playerLevel: this.container.querySelector('#adv-player-level'),
            playerHp: this.container.querySelector('#adv-player-hp'),
            playerGold: this.container.querySelector('#adv-player-gold'),
            currentZone: this.container.querySelector('#current-zone'),
            
            // Battle Modal
            battleModal: this.container.querySelector('#battle-modal'),
            battleLog: this.container.querySelector('#battle-log'),
            attackBtn: this.container.querySelector('#btn-attack'),
            fleeBtn: this.container.querySelector('#btn-flee'),
            
            // Loot Modal
            lootModal: this.container.querySelector('#loot-modal'),
            lootItems: this.container.querySelector('#loot-items'),
            lootCloseBtn: this.container.querySelector('#btn-close-loot'),
            
            // Inventory Modal
            btnOpenInventory: this.container.querySelector('#btn-open-inventory'),
            inventoryModal: this.container.querySelector('#inventory-modal'),
            inventoryList: this.container.querySelector('#adventure-inventory-list'),
            inventoryCapacity: this.container.querySelector('#inventory-capacity'),
            btnCloseInventory: this.container.querySelector('#btn-close-inventory'),
            
            // Item Detail Modal (for equipment interaction in inventory)
            itemModal: this.container.querySelector('#item-detail-modal')
        };
        
        if (!this.dom.canvas) {
            throw new Error('Canvas element not found in Adventure Scene');
        }
        
        this.canvas = this.dom.canvas;
        this.ctx = this.canvas.getContext('2d');
    }

    initCanvas() {
        const containerWidth = Math.min(1000, window.innerWidth - 40);
        const containerHeight = Math.min(600, window.innerHeight - 200);
        this.canvas.width = containerWidth;
        this.canvas.height = containerHeight;
    }

    bindEvents() {
        document.addEventListener('keydown', this.handleKeyPress);
        window.addEventListener('resize', this.handleResize);
        
        // Inventory button
        if (this.dom.btnOpenInventory) {
            this.dom.btnOpenInventory.addEventListener('click', () => {
                this.openInventoryModal();
            });
        }
        
        if (this.dom.btnCloseInventory) {
            this.dom.btnCloseInventory.addEventListener('click', () => {
                this.closeInventoryModal();
            });
        }
        
        if (this.dom.attackBtn) this.dom.attackBtn.addEventListener('click', () => this.handleAttackClick());
        
        const returnBtn = this.container.querySelector('#btn-return-to-lobby');
        if (returnBtn) returnBtn.addEventListener('click', () => this.app.loadScene('lobby'));
        
        if (this.dom.fleeBtn) this.dom.fleeBtn.addEventListener('click', () => this.handleFleeClick());
        if (this.dom.lootCloseBtn) this.dom.lootCloseBtn.addEventListener('click', () => {
            this.dom.lootModal.style.display = 'none';
        });
    }

    unbindEvents() {
        document.removeEventListener('keydown', this.handleKeyPress);
        window.removeEventListener('resize', this.handleResize);
    }

    handleResize() {
        if (this.canvas && this.worldMap) {
            const containerWidth = Math.min(1000, window.innerWidth - 40);
            const containerHeight = Math.min(600, window.innerHeight - 200);
            this.canvas.width = containerWidth;
            this.canvas.height = containerHeight;
            
            this.worldMap.screenWidth = containerWidth;
            this.worldMap.screenHeight = containerHeight;
            this.worldMap.updateCamera();
            this.renderMap();
        }
    }

    handleKeyPress(event) {
        // If modal is open, handle battle keys or ignore
        if (this.dom.battleModal.style.display === 'flex') {
            if (event.code === 'Space') {
                event.preventDefault();
                this.handleAttackClick();
            }
            return;
        }

        let dx = 0;
        let dy = 0;
        
        switch(event.key) {
            case 'ArrowUp': case 'w': case 'W': dy = -1; break;
            case 'ArrowDown': case 's': case 'S': dy = 1; break;
            case 'ArrowLeft': case 'a': case 'A': dx = -1; break;
            case 'ArrowRight': case 'd': case 'D': dx = 1; break;
            default: return;
        }
        
        if (dx !== 0 || dy !== 0) {
            event.preventDefault();
            const result = this.worldMap.movePlayer(dx, dy);
            this.renderMap();
            this.updateUI();
            
            if (result === 'battle') {
                this.startBattle();
            }
        }
    }

    updateUI() {
        const char = GameManager.getCharacter();
        if (!char) {
            console.error('Character not found in GameManager');
            return;
        }
        
        if (this.dom.playerLevel) {
            this.dom.playerLevel.textContent = char.level || 1;
        }
        if (this.dom.playerHp) {
            const currentHP = char.hp || char.currentHP || 100;
            const maxHP = char.maxHp || 100;
            this.dom.playerHp.textContent = `${currentHP}/${maxHP}`;
        }
        if (this.dom.playerGold) {
            this.dom.playerGold.textContent = char.gold || 0;
        }
        
        if (this.worldMap && this.dom.currentZone) {
            const zone = this.worldMap.getCurrentZone();
            const zoneNames = { 'low': '安全區', 'medium': '普通區', 'high': '危險區', 'boss': 'Boss區' };
            this.dom.currentZone.textContent = zoneNames[zone] || '未知區域';
            this.dom.currentZone.className = `info-value zone-indicator ${zone}`;
        }
    }

    renderMap() {
        if (!this.ctx || !this.worldMap) return;
        
        const ctx = this.ctx;
        const canvas = this.canvas;
        const gridSize = this.worldMap.gridSize;
        const cameraX = this.worldMap.cameraOffsetX;
        const cameraY = this.worldMap.cameraOffsetY;
        
        // Clear
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const zoneColors = { 'low': '#4caf50', 'medium': '#ffc107', 'high': '#ff9800', 'boss': '#f44336' };
        const terrainIcons = { 'monster': '👾', 'player': '🧙' };

        const visibleCells = this.worldMap.getVisibleCells();
        
        visibleCells.forEach(cell => {
            const x = cell.x * gridSize - cameraX;
            const y = cell.y * gridSize - cameraY;
            
            const zone = cell.data.zone;
            ctx.fillStyle = zoneColors[zone] + '20';
            ctx.fillRect(x, y, gridSize, gridSize);
            
            ctx.strokeStyle = zoneColors[zone] + '40';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, gridSize, gridSize);
            
            if (cell.data.type === 'wall') {
                ctx.fillStyle = '#555';
                ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
            } else if (cell.data.type === 'monster') {
                ctx.font = `${gridSize * 0.6}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#fff';
                ctx.fillText(terrainIcons.monster, x + gridSize / 2, y + gridSize / 2);
            }
        });
        
        // Player
        const playerX = this.worldMap.playerPos.x * gridSize - cameraX;
        const playerY = this.worldMap.playerPos.y * gridSize - cameraY;
        
        ctx.fillStyle = 'rgba(79, 172, 254, 0.3)';
        ctx.fillRect(playerX, playerY, gridSize, gridSize);
        ctx.strokeStyle = '#4facfe';
        ctx.lineWidth = 3;
        ctx.strokeRect(playerX, playerY, gridSize, gridSize);
        
        ctx.font = `${gridSize * 0.7}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.fillText(terrainIcons.player, playerX + gridSize / 2, playerY + gridSize / 2);
    }

    // ===== Battle Logic =====

    startBattle() {
        const monster = this.worldMap.getCurrentMonster();
        console.log('Encounter:', monster);
        
        this.currentBattle = new BattleController(GameManager.getCharacter(), monster, this);
        this.dom.battleModal.style.display = 'flex';
        this.dom.battleLog.innerHTML = '';
        
        this.updateMonsterDisplay();
        this.addBattleLog(`遇到 ${monster.icon} ${monster.name}！`);
        
        this.rhythmSystem = new RhythmBarSystem(GameManager.getCharacter(), this.container);
        this.rhythmSystem.start();
    }

    endBattle(victory) {
        this.dom.battleModal.style.display = 'none';
        if (this.rhythmSystem) {
            this.rhythmSystem.stop();
            this.rhythmSystem = null;
        }
        this.worldMap.clearCurrentMonster();
        this.currentBattle = null;
        this.updateUI();
    }

    handleAttackClick() {
        if (!this.currentBattle || this.currentBattle.battleEnded) return;
        if (!this.rhythmSystem) return;
        
        const hitType = this.rhythmSystem.judgeHit();
        this.currentBattle.playerAttack(hitType);
        // 不在這裡生成新區域，等冷卻結束後才生成
    }

    handleFleeClick() {
        if (!this.currentBattle || this.currentBattle.battleEnded) return;
        this.currentBattle.flee();
    }

    updateMonsterDisplay() {
        if (!this.currentBattle) return;
        const monster = this.currentBattle.monster;
        
        this.container.querySelector('#battle-monster-icon').textContent = monster.icon;
        this.container.querySelector('#battle-monster-name').textContent = monster.name;
        this.container.querySelector('#battle-monster-level').textContent = monster.level;
        this.container.querySelector('#battle-monster-hp-text').textContent = `${monster.hp}/${monster.maxHp}`;
        this.container.querySelector('#battle-monster-atk').textContent = monster.attack;
        this.container.querySelector('#battle-monster-def').textContent = monster.defense;
        
        const hpPercent = (monster.hp / monster.maxHp) * 100;
        this.container.querySelector('#battle-monster-hp-bar').style.width = hpPercent + '%';
    }

    addBattleLog(msg, className = '') {
        const entry = document.createElement('div');
        entry.className = 'log-entry ' + className;
        entry.textContent = msg;
        this.dom.battleLog.appendChild(entry);
        this.dom.battleLog.scrollTop = this.dom.battleLog.scrollHeight;
    }

    showLoot(exp, gold, items) {
        this.dom.lootModal.style.display = 'flex';
        this.container.querySelector('#exp-gained').textContent = `+${exp} EXP`;
        this.container.querySelector('#gold-gained').textContent = `+${gold}`;
        
        const lootContainer = this.dom.lootItems;
        lootContainer.innerHTML = '';
        
        if (items.length === 0) {
            lootContainer.innerHTML = '<div class="empty-state">沒有戰利品</div>';
        } else {
            items.forEach(item => {
                const el = document.createElement('div');
                el.className = `loot-slot ${item.rarity}`;
                el.innerHTML = `
                    <div class="slot-icon">${item.icon}</div>
                    <div class="slot-info">
                        <div class="slot-name">${item.name}</div>
                    </div>
                `;
                el.onclick = () => {
                    GameManager.addToInventory(item);
                    el.remove();
                    if (lootContainer.children.length === 0) {
                        lootContainer.innerHTML = '<div class="empty-state">已全部拾取</div>';
                    }
                };
                lootContainer.appendChild(el);
            });
        }
    }
}

class BattleController {
    constructor(player, monster, scene) {
        this.player = player;
        this.monster = monster;
        this.scene = scene;
        this.battleEnded = false;
        this.attackCooldown = false;
    }

    playerAttack(hitType) {
        if (this.attackCooldown || this.battleEnded) return;

        const playerAtk = this.player.getTotalAtk();
        let damage = 0;
        let msg = '';
        
        if (hitType === 'miss') {
            msg = '攻擊落空！';
        } else if (hitType === 'crit') {
            damage = Math.floor(playerAtk * this.player.getCritDamage());
            msg = `暴擊！造成 ${damage} 點傷害！`;
        } else {
            damage = playerAtk;
            msg = `攻擊命中，造成 ${damage} 點傷害`;
        }

        if (damage > 0) {
            this.monster.takeDamage(damage);
            this.scene.updateMonsterDisplay();
            if (this.monster.isDead()) {
                this.scene.addBattleLog(msg, 'crit');
                this.handleVictory();
                return;
            }
        }
        
        this.scene.addBattleLog(msg, hitType === 'miss' ? 'miss' : 'player-action');
        
        // 開始冷卻倒數
        const cooldownTime = this.player.getAttackInterval(); // 秒數
        this.startCooldown(cooldownTime);
        
        // 怪物反擊延遲
        setTimeout(() => this.monsterAttack(), 1000);
    }
    
    startCooldown(duration) {
        this.attackCooldown = true;
        const attackBtn = this.scene.container.querySelector('#btn-attack');
        
        // 禁用按鈕
        attackBtn.disabled = true;
        attackBtn.style.opacity = '0.5';
        
        // 創建冷卻圈
        let cooldownCircle = attackBtn.querySelector('.cooldown-circle');
        if (!cooldownCircle) {
            cooldownCircle = document.createElement('div');
            cooldownCircle.className = 'cooldown-circle';
            cooldownCircle.innerHTML = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45"></circle></svg><span class="cooldown-timer"></span>';
            attackBtn.appendChild(cooldownCircle);
        }
        
        const circle = cooldownCircle.querySelector('circle');
        const timer = cooldownCircle.querySelector('.cooldown-timer');
        const circumference = 2 * Math.PI * 45;
        
        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = '0';
        cooldownCircle.style.display = 'flex';
        
        const startTime = Date.now();
        const updateCooldown = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            const remaining = Math.max(0, duration - elapsed);
            const progress = remaining / duration;
            
            // 更新圓圈
            circle.style.strokeDashoffset = circumference * (1 - progress);
            
            // 更新數字
            timer.textContent = remaining.toFixed(1);
            
            if (remaining > 0) {
                requestAnimationFrame(updateCooldown);
            } else {
                // 冷卻結束：恢復按鈕、恢復節奏條、生成新區域
                cooldownCircle.style.display = 'none';
                attackBtn.disabled = false;
                attackBtn.style.opacity = '1';
                this.attackCooldown = false;
                
                // 恢復節奏條並生成新的隨機區域
                if (this.scene.rhythmSystem) {
                    this.scene.rhythmSystem.resume();
                    this.scene.rhythmSystem.generateZones();
                }
            }
        };
        
        requestAnimationFrame(updateCooldown);
    }

    monsterAttack() {
        if (this.battleEnded) return;
        const damage = Math.max(1, this.monster.attack - this.player.getTotalDef());
        this.player.hp = Math.max(0, this.player.hp - damage);
        this.scene.addBattleLog(`${this.monster.name} 攻擊造成 ${damage} 點傷害！`, 'monster-action');
        this.scene.updateUI();
        
        if (this.player.hp <= 0) {
            this.handleDefeat();
        }
    }

    handleVictory() {
        this.battleEnded = true;
        this.scene.addBattleLog(`擊敗了 ${this.monster.name}！`, 'player-action');
        
        const drops = this.monster.getDrops();
        this.player.exp += this.monster.exp;
        this.player.checkLevelUp();
        GameManager.addGold(drops.gold);
        
        setTimeout(() => {
            this.scene.endBattle(true);
            this.scene.showLoot(this.monster.exp, drops.gold, drops.items);
        }, 1500);
    }

    handleDefeat() {
        this.battleEnded = true;
        this.scene.addBattleLog('你被擊敗了...', 'monster-action');
        const penalty = Math.floor(this.player.gold * 0.1);
        GameManager.removeGold(penalty);
        this.player.hp = Math.floor(this.player.maxHp * 0.3);
        
        setTimeout(() => {
            this.scene.endBattle(false);
            alert(`你被擊敗了，損失了 ${penalty} 金幣。`);
        }, 1500);
    }

    flee() {
        if (Math.random() < 0.5) {
            this.battleEnded = true;
            this.scene.addBattleLog('成功逃跑！');
            setTimeout(() => this.scene.endBattle(false), 1000);
        } else {
            this.scene.addBattleLog('逃跑失敗！');
            setTimeout(() => this.monsterAttack(), 1000);
        }
    }
}

class RhythmBarSystem {
    constructor(character, container) {
        this.character = character;
        this.container = container;
        this.barElement = container.querySelector('#rhythm-bar');
        this.needleElement = container.querySelector('#rhythm-needle');
        this.critZoneElement = container.querySelector('#crit-zone');
        this.hitZoneElement = container.querySelector('#hit-zone');
        this.attackBtn = container.querySelector('#btn-attack');
        
        this.barWidth = 100;
        this.needlePosition = 0;
        this.needleDirection = 1;
        this.weaponSpeed = character.getWeaponSpeed();
        this.animationId = null;
        this.lastTime = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.hitMarker = null;
        
        this.generateZones();
    }

    generateZones() {
        // 爆擊區域大小受 critChance 影響（5% ~ 30% critChance → 8% ~ 20% 寬度）
        const critChance = this.character.getCritChance();
        const critWidth = Math.max(8, Math.min(20, critChance * 60)); // 8-20%寬度
        
        // Hit區域固定寬度
        const hitWidth = 25;
        const safeGap = 5; // 安全間距，確保不重疊
        
        // 隨機決定左右順序
        const critOnLeft = Math.random() > 0.5;
        let critStart, hitStart;
        
        if (critOnLeft) {
            // Crit在左，Hit在右
            // Crit區域：5% ~ (75% - critWidth)
            const critMaxStart = 75 - critWidth;
            critStart = 5 + Math.random() * Math.max(0, critMaxStart - 5);
            
            // Hit區域：Crit結束後 + 安全間距
            const hitMinStart = critStart + critWidth + safeGap;
            const hitMaxStart = Math.min(90 - hitWidth, hitMinStart + 30);
            hitStart = hitMinStart + Math.random() * Math.max(0, hitMaxStart - hitMinStart);
        } else {
            // Hit在左，Crit在右
            // Hit區域：5% ~ (65% - hitWidth)
            const hitMaxStart = 65 - hitWidth;
            hitStart = 5 + Math.random() * Math.max(0, hitMaxStart - 5);
            
            // Crit區域：Hit結束後 + 安全間距
            const critMinStart = hitStart + hitWidth + safeGap;
            const critMaxStart = Math.min(90 - critWidth, critMinStart + 30);
            critStart = critMinStart + Math.random() * Math.max(0, critMaxStart - critMinStart);
        }
        
        this.critZone = { start: critStart, width: critWidth };
        this.hitZone = { start: hitStart, width: hitWidth };
        
        this.critZoneElement.style.left = this.critZone.start + '%';
        this.critZoneElement.style.width = this.critZone.width + '%';
        this.hitZoneElement.style.left = this.hitZone.start + '%';
        this.hitZoneElement.style.width = this.hitZone.width + '%';
    }

    start() {
        if (this.isRunning) return; // Prevent multiple loops
        this.isRunning = true;
        this.lastTime = performance.now();
        this.animate();
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    animate() {
        if (!this.isRunning) return; // Exit if stopped
        
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // 暫停時不更新位置
        if (!this.isPaused) {
            // Correct formula: pointer_speed = base_length / wep_speed
            // wep_speed 1.0 = 1 second for full bar
            // wep_speed 2.0 = 0.5 second for full bar
            // wep_speed 0.5 = 2 seconds for full bar
            const pixelsPerSecond = this.barWidth / this.weaponSpeed;
            const speed = pixelsPerSecond * deltaTime;
            this.needlePosition += speed * this.needleDirection;
            
            if (this.needlePosition >= this.barWidth) {
                this.needlePosition = this.barWidth;
                this.needleDirection = -1;
            } else if (this.needlePosition <= 0) {
                this.needlePosition = 0;
                this.needleDirection = 1;
            }
            
            if (this.needleElement) {
                this.needleElement.style.left = this.needlePosition + '%';
            }
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    judgeHit() {
        // 暫停節奏條
        this.isPaused = true;
        
        const pos = this.needlePosition;
        let hitType = 'miss';
        
        // 精準判定：指針位置必須在區域內
        if (pos >= this.critZone.start && pos <= this.critZone.start + this.critZone.width) {
            hitType = 'crit';
        } else if (pos >= this.hitZone.start && pos <= this.hitZone.start + this.hitZone.width) {
            hitType = 'hit';
        }
        
        // 顯示按下位置標記
        this.showHitMarker(pos, hitType);
        
        return hitType;
    }
    
    showHitMarker(position, hitType) {
        // 移除舊標記
        if (this.hitMarker) {
            this.hitMarker.remove();
        }
        
        // 創建新標記（只顯示短暫特效）
        this.hitMarker = document.createElement('div');
        this.hitMarker.className = `hit-marker hit-marker-${hitType}`;
        this.hitMarker.style.left = position + '%';
        this.hitMarker.innerHTML = '<div class="marker-pulse"></div>';
        this.barElement.appendChild(this.hitMarker);
        
        // 特效播放完後移除（脈衝動畫0.8秒）
        setTimeout(() => {
            if (this.hitMarker) {
                this.hitMarker.remove();
                this.hitMarker = null;
            }
        }, 800);
    }
    
    resume() {
        // 恢復節奏條運行
        this.isPaused = false;
    }
}

// Export AdventureScene with inventory management methods
AdventureScene.prototype.openInventoryModal = function() {
    if (!this.dom.inventoryModal) return;
    
    this.renderInventory();
    this.dom.inventoryModal.style.display = 'flex';
    setTimeout(() => {
        this.dom.inventoryModal.classList.add('active');
    }, 10);
};

AdventureScene.prototype.closeInventoryModal = function() {
    if (!this.dom.inventoryModal) return;
    
    this.dom.inventoryModal.classList.remove('active');
    setTimeout(() => {
        this.dom.inventoryModal.style.display = 'none';
    }, 300);
};

AdventureScene.prototype.renderInventory = function() {
    if (!this.dom.inventoryList) return;
    
    const state = GameManager.state;
    
    // Update capacity
    if (this.dom.inventoryCapacity) {
        this.dom.inventoryCapacity.textContent = `${state.inventory.length}/${state.inventoryCapacity}`;
    }
    
    // Render items
    this.dom.inventoryList.innerHTML = '';
    if (state.inventory && state.inventory.length > 0) {
        state.inventory.forEach(stack => {
            const item = stack.item;
            const itemEl = document.createElement('div');
            itemEl.className = `item-card inventory-item rarity-${item.rarity}`;
            
            let iconHTML;
            if (item.image) {
                iconHTML = `<img src=\"${item.image}\" alt=\"${item.name}\" style=\"width: 100%; height: 100%; object-fit: contain;\">`;
            } else {
                iconHTML = item.icon || '\ud83d\udce6';
            }
            
            itemEl.innerHTML = `
                <div class=\"item-icon\">
                    ${iconHTML}
                    ${stack.quantity > 1 ? `<span class=\"quantity-badge\">x${stack.quantity}</span>` : ''}
                </div>
                <div class=\"item-info\">
                    <div class=\"item-name\">${item.name}</div>
                </div>
            `;
            
            itemEl.addEventListener('click', () => {
                this.showInventoryItemModal(stack);
            });
            
            this.dom.inventoryList.appendChild(itemEl);
        });
    } else {
        this.dom.inventoryList.innerHTML = '<div class=\"empty-hint\">\u80cc\u5305\u7a7a\u7a7a\u5982\u4e5f...</div>';
    }
};

AdventureScene.prototype.showInventoryItemModal = function(stack) {
    // Create a temporary modal for adventure scene
    const item = stack.item;
    const isEquipment = item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory';
    const isConsumable = item.type === 'potion' || item.type === 'scroll';
    
    let actions = '';
    
    if (isEquipment) {
        actions += `<button class=\"btn btn-primary\" onclick=\"window.adventureEquipItem('${stack.instanceId}')\">✅ 裝備</button>`;
    }
    
    if (isConsumable) {
        actions += `<button class=\"btn btn-info\" onclick=\"window.adventureUseItem('${stack.instanceId}')\">✅ 使用</button>`;
    }
    
    // In adventure, can't move to warehouse, only sell or discard
    actions += `<button class=\"btn btn-warning\" onclick=\"window.adventureSellItem('${stack.instanceId}')\">✅ 販售</button>`;
    actions += `<button class=\"btn btn-danger\" onclick=\"window.adventureDiscardItem('${stack.instanceId}')\">✅ 丟棄</button>`;
    
    // Simple modal display
    const modalHTML = `
        <div class=\"adventure-item-modal\" id=\"temp-item-modal\" style=\"position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 10000;\">
            <div class=\"modal-card\" style=\"background: #1a1f2e; padding: 20px; border-radius: 12px; max-width: 400px; width: 90%;\">
                <h3 style=\"text-align: center;\">${item.name}</h3>
                <p style=\"text-align: center; color: #888;\">${item.desc || item.description || ''}</p>
                <div style=\"margin: 20px 0; display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;\">
                    ${actions}
                </div>
                <button class=\"btn btn-secondary\" onclick=\"document.getElementById('temp-item-modal').remove(); window.adventureRefreshInventory();\">關閉</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
};

// Global functions for adventure item actions
window.adventureEquipItem = function(instanceId) {
    GameManager.equipItem(instanceId, false);
    document.getElementById('temp-item-modal').remove();
    window.adventureRefreshInventory();
};

window.adventureUseItem = function(instanceId) {
    GameManager.useConsumable(instanceId, false);
    document.getElementById('temp-item-modal').remove();
    window.adventureRefreshInventory();
};

window.adventureSellItem = function(instanceId) {
    const stack = GameManager.state.inventory.find(s => s.instanceId === instanceId);
    if (!stack) return;
    
    const sellPrice = Math.floor(stack.item.price * 0.5) * stack.quantity;
    if (confirm(`確定要賣掉 ${stack.item.name} x${stack.quantity}？\n將獲得 ${sellPrice} 金幣。`)) {
        GameManager.sellItem(instanceId, false);
        document.getElementById('temp-item-modal').remove();
        window.adventureRefreshInventory();
    }
};

window.adventureDiscardItem = function(instanceId) {
    const stack = GameManager.state.inventory.find(s => s.instanceId === instanceId);
    if (!stack) return;
    
    const result = GameManager.discardItem(instanceId, false);
    if (result === 'confirm') {
        if (confirm(`「${stack.item.name}」是 ${stack.item.rarity} 稀有度物品！\n確定要丟棄嗎？`)) {
            const index = GameManager.state.inventory.findIndex(s => s.instanceId === instanceId);
            if (index > -1) {
                GameManager.state.inventory.splice(index, 1);
                GameManager.notify('inventory');
            }
        }
    }
    document.getElementById('temp-item-modal').remove();
    window.adventureRefreshInventory();
};

window.adventureRefreshInventory = function() {
    // Find adventure scene instance and refresh
    const adventureScene = window.currentAdventureScene;
    if (adventureScene && adventureScene.renderInventory) {
        adventureScene.renderInventory();
    }
};
