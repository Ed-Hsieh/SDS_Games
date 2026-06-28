/**
 * RhythmBarSystem - 共用節奏條系統
 * 用於 AdventureScene 和 TowerScene 的戰鬥節奏條
 */
import audioManager from './AudioManager.js';
import { getWeaponCombatProfile } from './WeaponCombatProfile.js';

class RhythmBarSystem {
    constructor(character, container, options = {}) {
        this.character = character;
        this.container = container;
        
        // 支援自定義選擇器前綴（用於不同場景）
        const prefix = options.prefix || '';
        
        this.barElement = container.querySelector(`${prefix}#rhythm-bar, ${prefix}.rhythm-bar`);
        this.needleElement = container.querySelector(`${prefix}#rhythm-needle, ${prefix}.rhythm-needle`);
        this.critZoneElement = container.querySelector(`${prefix}#crit-zone, ${prefix}.crit-zone`);
        this.hitZoneElement = container.querySelector(`${prefix}#hit-zone, ${prefix}.hit-zone`);
        this.attackBtn = container.querySelector(`${prefix}#action-weapon, ${prefix}.weapon-card, ${prefix}#btn-attack, ${prefix}.btn-attack`);
        
        // 節奏條總寬度（百分比）
        this.barWidth = 100;
        
        // 指針狀態
        this.needlePosition = 0;      // 當前位置 (0-100%)
        this.needleDirection = 1;      // 移動方向 (1=右, -1=左)
        
        // 從角色/武器獲取數據
        this.battleAttackSpeedBonusPercent = 0;
        this.updateEquipmentStats();
        
        // 動畫控制
        this.animationId = null;
        this.lastTime = 0;
        this.isRunning = false;
        this.isPaused = false;
        
        // 擊中標記
        this.hitMarker = null;
        
        // 生成判定區域
        this.generateZones();
    }

    /**
     * 從角色裝備更新節奏條參數
     */
    updateEquipmentStats() {
        // 取得武器速度（控制指針移動速度）
        // weaponSpeed 越高，指針移動越快
        this.weaponSpeed = this.character.getWeaponSpeed?.() || 1.0;
        this.weaponProfile = getWeaponCombatProfile(this.character);
        this.weaponSpeed *= Math.max(0.1, Number(this.weaponProfile.needleSpeedMultiplier) || 1);
        
        // 取得攻擊速度（控制冷卻時間）
        // attackSpeed is stored as attacks-per-second; cooldown needs seconds-per-attack.
        const baseAttackSpeed = this.character.getAttackInterval?.()
            || (1 / Math.max(0.1, this.character.getAttackSpeed?.() || 1.0));
        const profileCooldown = Math.max(0.1, Number(this.weaponProfile.cooldownMultiplier) || 1);
        const battleMultiplier = 1 + Math.max(0, Number(this.battleAttackSpeedBonusPercent) || 0) / 100;
        this.attackSpeed = Math.max(0.18, (baseAttackSpeed * profileCooldown) / Math.max(0.1, battleMultiplier));
        
        // 取得爆擊機率（決定 Crit Zone 寬度）
        this.critChance = this.character.getCritChance?.() || 0.05;
        
        // 取得爆擊傷害倍率
        this.critDamage = this.character.getCritDamage?.() || 1.5;
        
        // 取得攻擊力（使用 getTotalAtk 方法）
        this.attackPower = this.character.getTotalAtk?.() || 10;
        
        // 取得武器稀有度（決定 Hit Zone 寬度）
        this.weaponRarity = this._getWeaponRarity();
        
        // 冷卻系統
        this.isOnCooldown = false;
        this.cooldownTimer = null;
        this.cooldownFrame = null;
        this.cooldownStartedAt = 0;
        this.cooldownDurationMs = 0;
    }

    /**
     * 取得武器稀有度
     * @returns {string} 稀有度名稱
     */
    _getWeaponRarity() {
        const weapon = this.character.equipment?.weapon;
        if (weapon && weapon.rarity) {
            return weapon.rarity;
        }
        return 'common';
    }

    /**
     * 根據稀有度計算 Hit Zone 寬度
     * common: 20%, uncommon: 24%, rare: 28%, epic: 32%, legendary: 36%, mythic: 40%
     */
    _calculateHitZoneWidth() {
        const rarityWidths = {
            'common': 14,
            'uncommon': 16,
            'rare': 18,
            'epic': 20,
            'legendary': 22,
            'mythic': 24
        };
        const profileWidth = Math.max(0.5, Number(this.weaponProfile?.hitZoneMultiplier) || 1);
        return Math.max(8, Math.min(28, (rarityWidths[this.weaponRarity] || 14) * profileWidth));
    }

    /**
     * 生成判定區域位置
     * Crit Zone 和 Hit Zone 隨機放置，但不可重疊
     */
    generateZones() {
        // ===== 計算區域寬度 =====
        // Crit Zone 寬度 = critChance * 100%（例：12% 暴擊率 = 12% 寬度）
        const profileCritWidth = Math.max(0.4, Number(this.weaponProfile?.critZoneMultiplier) || 1);
        const critWidth = Math.max(3, Math.min(14, this.critChance * 100 * 0.55 * profileCritWidth));
        
        // Hit Zone 寬度根據武器稀有度（20% ~ 40%）
        const hitWidth = this._calculateHitZoneWidth();
        
        // 安全間距，確保區域不重疊
        const safeGap = 3;
        
        // 可用範圍（留出兩端邊距）
        const marginLeft = 3;
        const marginRight = 3;
        const availableWidth = 100 - marginLeft - marginRight;
        
        // ===== 隨機決定區域位置 =====
        // 隨機決定哪個區域在左邊
        const critOnLeft = Math.random() > 0.5;
        
        let critStart, hitStart;
        
        if (critOnLeft) {
            // Crit 在左，Hit 在右
            const maxCritStart = availableWidth - critWidth - safeGap - hitWidth;
            critStart = marginLeft + Math.random() * Math.max(0, maxCritStart);
            
            // Hit 區域在 Crit 區域右側
            const hitMinStart = critStart + critWidth + safeGap;
            const hitMaxStart = 100 - marginRight - hitWidth;
            hitStart = hitMinStart + Math.random() * Math.max(0, hitMaxStart - hitMinStart);
        } else {
            // Hit 在左，Crit 在右
            const maxHitStart = availableWidth - hitWidth - safeGap - critWidth;
            hitStart = marginLeft + Math.random() * Math.max(0, maxHitStart);
            
            // Crit 區域在 Hit 區域右側
            const critMinStart = hitStart + hitWidth + safeGap;
            const critMaxStart = 100 - marginRight - critWidth;
            critStart = critMinStart + Math.random() * Math.max(0, critMaxStart - critMinStart);
        }
        
        // 保存區域資料
        this.critZone = { start: critStart, width: critWidth };
        this.hitZone = { start: hitStart, width: hitWidth };
        
        // 更新 DOM - 使用 transform 以避免觸發重排
        const parentWidth = this.barElement ? this.barElement.offsetWidth : 1;
        if (this.critZoneElement) {
            const critTranslate = (this.critZone.start / 100) * parentWidth;
            this.critZoneElement.style.transform = `translateX(${critTranslate}px)`;
            this.critZoneElement.style.width = this.critZone.width + '%';
            this.critZoneElement.style.willChange = 'transform';
        }
        if (this.hitZoneElement) {
            const hitTranslate = (this.hitZone.start / 100) * parentWidth;
            this.hitZoneElement.style.transform = `translateX(${hitTranslate}px)`;
            this.hitZoneElement.style.width = this.hitZone.width + '%';
            this.hitZoneElement.style.willChange = 'transform';
        }
        
        // Debug log
    }

    /**
     * 開始節奏條動畫
     */
    start() {
        if (this.isRunning) return;
        
        // 更新裝備參數
        this.updateEquipmentStats();
        
        this.isRunning = true;
        this.isPaused = false;
        this.lastTime = performance.now();
        this.animate();
        
    }

    /**
     * 停止節奏條動畫
     */
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.cancelCooldown();
    }

    /**
     * 動畫循環 - 更新指針位置
     */
    animate() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000; // 轉換為秒
        this.lastTime = currentTime;
        
        // 暫停或冷卻中不更新位置
        if (!this.isPaused && !this.isOnCooldown) {
            // 計算指針移動速度
            // 公式：指針速度 = (barWidth * weaponSpeed) per second
            // weaponSpeed = 1.0 表示 1 秒走完整個條
            // weaponSpeed = 2.0 表示 0.5 秒走完
            // weaponSpeed = 0.5 表示 2 秒走完
            const pixelsPerSecond = this.barWidth * this.weaponSpeed;
            const movement = pixelsPerSecond * deltaTime;
            
            this.needlePosition += movement * this.needleDirection;
            
            // 邊界反彈
            if (this.needlePosition >= this.barWidth) {
                this.needlePosition = this.barWidth;
                this.needleDirection = -1;
            } else if (this.needlePosition <= 0) {
                this.needlePosition = 0;
                this.needleDirection = 1;
            }
            
            // 更新指針 DOM - 使用 transform 實現 GPU 加速（避免改動 left）
            if (this.needleElement) {
                const parentWidth = this.barElement ? this.barElement.offsetWidth : 1;
                // needlePosition 是百分比（0-100）
                const translateX = (this.needlePosition / 100) * parentWidth;
                this.needleElement.style.transform = `translateX(${translateX}px)`;
            }
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    /**
     * 判定攻擊結果
     * @returns {object} { type: 'crit'|'hit'|'miss', damage: number }
     */
    judgeHit() {
        // 冷卻中無法攻擊
        if (this.isOnCooldown) {
            return { type: 'cooldown', damage: 0 };
        }
        
        audioManager.play('attack-swing', { throttleKey: 'rhythm-attack-swing', throttleMs: 80 });
        const pos = this.needlePosition;
        let hitType = 'miss';
        let damage = 0;
        
        // ===== 判定邏輯（Crit 優先） =====
        // Condition A: Crit - 游標在 Crit Zone 內
        if (pos >= this.critZone.start && pos <= this.critZone.start + this.critZone.width) {
            hitType = 'crit';
            damage = Math.floor(this.attackPower * this.critDamage);
        }
        // Condition B: Hit - 游標在 Hit Zone 內（且不在 Crit 內）
        else if (pos >= this.hitZone.start && pos <= this.hitZone.start + this.hitZone.width) {
            hitType = 'hit';
            damage = this.attackPower;
        }
        // Condition C: Miss - 其他區域
        else {
            hitType = 'miss';
            damage = 0;
        }
        
        // 顯示擊中標記
        this.showHitMarker(pos, hitType);
        
        // 顯示判定文字特效
        this.showJudgmentText(hitType, damage);
        
        // 啟動冷卻
        this.startCooldown();
        
        
        return { type: hitType, damage: damage };
    }
    
    /**
     * 顯示擊中位置標記
     */
    showHitMarker(position, hitType) {
        // 移除舊標記
        if (this.hitMarker) {
            this.hitMarker.remove();
        }
        
        // 創建新標記
        this.hitMarker = document.createElement('div');
        this.hitMarker.className = `hit-marker hit-marker-${hitType}`;
        // 使用 transform 以避免重排
        const parentWidth = this.barElement ? this.barElement.offsetWidth : 1;
        const translateX = (position / 100) * parentWidth;
        this.hitMarker.style.transform = `translateX(${translateX}px)`;
        this.hitMarker.innerHTML = '<div class="marker-pulse"></div>';
        
        if (this.barElement) {
            this.barElement.appendChild(this.hitMarker);
        }
        
        // 特效播放完後移除
        setTimeout(() => {
            if (this.hitMarker) {
                this.hitMarker.remove();
                this.hitMarker = null;
            }
        }, 800);
    }
    
    /**
     * 顯示判定文字特效
     */
    showJudgmentText(hitType, damage) {
        const textConfig = {
            'crit': { text: '暴擊', color: '#4caf50', size: '28px' },
            'hit': { text: '命中', color: '#ffd700', size: '22px' },
            'miss': { text: '失誤', color: '#ff4444', size: '20px' }
        };
        
        const config = textConfig[hitType];
        if (!config) return;
        
        const textEl = document.createElement('div');
        textEl.className = `judgment-text judgment-${hitType}`;
        textEl.textContent = config.text;
        textEl.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: ${config.size};
            font-weight: 900;
            color: ${config.color};
            text-shadow: 0 0 20px ${config.color}, 0 0 40px ${config.color};
            z-index: 100;
            pointer-events: none;
            animation: judgmentPop 0.8s ease-out forwards;
        `;
        
        if (this.barElement) {
            this.barElement.appendChild(textEl);
        }
        
        // 動畫結束後移除
        setTimeout(() => textEl.remove(), 800);
    }

    /**
     * 啟動冷卻系統
     */
    startCooldown() {
        if (this.isOnCooldown) return;
        
        this.isOnCooldown = true;

        // 節奏條只暫停判定；冷卻視覺改由下方行動卡的小圓圈呈現。
        if (this.barElement) {
            this.barElement.classList.add('cooldown');
        }
        
        // 冷卻時間結束後恢復
        const cooldownDuration = this.attackSpeed * 1000; // 轉換為毫秒
        this.cooldownStartedAt = performance.now();
        this.cooldownDurationMs = cooldownDuration;
        this.updateActionCooldown(cooldownDuration / 1000, cooldownDuration / 1000);
        this.tickActionCooldown();
        
        this.cooldownTimer = setTimeout(() => {
            this.endCooldown();
        }, cooldownDuration);
    }

    ensureActionCooldownRing() {
        if (!this.attackBtn) return null;
        let ring = this.attackBtn.querySelector('.action-cooldown-ring');
        if (!ring) {
            ring = document.createElement('span');
            ring.className = 'action-cooldown-ring';
            ring.innerHTML = '<span class="action-cooldown-value">0</span>';
            this.attackBtn.appendChild(ring);
        }
        return ring;
    }

    updateActionCooldown(remainingSeconds, totalSeconds) {
        if (!this.attackBtn) return;
        const ring = this.ensureActionCooldownRing();
        const value = ring?.querySelector('.action-cooldown-value');
        const ratio = totalSeconds > 0 ? Math.max(0, Math.min(1, remainingSeconds / totalSeconds)) : 0;
        const elapsedRatio = 1 - ratio;
        this.attackBtn.classList.add('is-cooling');
        this.attackBtn.setAttribute('aria-disabled', 'true');
        this.attackBtn.style.setProperty('--cooldown-progress', `${elapsedRatio * 100}%`);
        if (value) {
            value.textContent = remainingSeconds >= 1
                ? String(Math.ceil(remainingSeconds))
                : remainingSeconds.toFixed(1);
        }
    }

    tickActionCooldown() {
        if (!this.isOnCooldown) return;
        const elapsedMs = performance.now() - this.cooldownStartedAt;
        const remainingMs = Math.max(0, this.cooldownDurationMs - elapsedMs);
        const totalSeconds = this.cooldownDurationMs / 1000;
        this.updateActionCooldown(remainingMs / 1000, totalSeconds);
        if (remainingMs > 0) {
            this.cooldownFrame = requestAnimationFrame(() => this.tickActionCooldown());
        }
    }

    clearActionCooldown() {
        if (this.cooldownFrame) {
            cancelAnimationFrame(this.cooldownFrame);
            this.cooldownFrame = null;
        }
        if (!this.attackBtn) return;
        this.attackBtn.classList.remove('is-cooling');
        this.attackBtn.removeAttribute('aria-disabled');
        this.attackBtn.style.removeProperty('--cooldown-progress');
        const value = this.attackBtn.querySelector('.action-cooldown-value');
        if (value) value.textContent = '0';
    }

    cancelCooldown() {
        this.isOnCooldown = false;
        if (this.cooldownTimer) {
            clearTimeout(this.cooldownTimer);
            this.cooldownTimer = null;
        }
        if (this.barElement) {
            this.barElement.classList.remove('cooldown');
        }
        this.clearActionCooldown();
    }

    /**
     * 結束冷卻
     */
    endCooldown() {
        this.isOnCooldown = false;
        
        // 移除冷卻樣式
        if (this.barElement) {
            this.barElement.classList.remove('cooldown');
        }
        this.clearActionCooldown();
        
        // 重新隨機化區域位置
        this.generateZones();
        
        // 取消冷卻計時器
        if (this.cooldownTimer) {
            clearTimeout(this.cooldownTimer);
            this.cooldownTimer = null;
        }
        
    }
    
    /**
     * 暫停節奏條
     */
    pause() {
        this.isPaused = true;
    }
    
    /**
     * 恢復節奏條
     */
    resume() {
        this.isPaused = false;
    }
    
    /**
     * 重置節奏條
     */
    reset() {
        this.needlePosition = 0;
        this.needleDirection = 1;
        this.isPaused = false;
        this.cancelCooldown();
        
        if (this.barElement) {
            this.barElement.classList.remove('cooldown');
        }
        
        if (this.needleElement) {
            this.needleElement.style.transform = 'translateX(0)';
        }
        
        this.generateZones();
    }
    
    /**
     * 更新角色參考（切換角色時使用）
     */
    updateCharacter(character) {
        this.character = character;
        this.updateEquipmentStats();
        this.generateZones();
    }

    setBattleAttackSpeedBonus(percent = 0) {
        this.battleAttackSpeedBonusPercent = Math.max(0, Number(percent) || 0);
        this.updateEquipmentStats();
    }
    
    /**
     * 銷毀節奏條系統
     */
    destroy() {
        this.stop();
        if (this.hitMarker) {
            this.hitMarker.remove();
        }
    }
}

// 導出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RhythmBarSystem;
}

// 全域變數（供非模組化使用）
if (typeof window !== 'undefined') {
    window.RhythmBarSystem = RhythmBarSystem;
}

export default RhythmBarSystem;
