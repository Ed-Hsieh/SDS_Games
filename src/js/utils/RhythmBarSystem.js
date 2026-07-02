/**
 * RhythmBarSystem
 *
 * Supports the original horizontal gauge and the combat-panel circular rhythm
 * ring. Offhand rings can be configured as a timed window: the ring only runs
 * after the main-hand attack opens it, and an expired window does not consume
 * durability or trigger cooldown.
 */
import audioManager from './AudioManager.js';
import { getWeaponCombatProfile } from './WeaponCombatProfile.js';

function readNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function clampRhythmPosition(value) {
    return Math.max(0, Math.min(100, readNumber(value, 0)));
}

function normalizeRhythmPosition(value) {
    const number = readNumber(value, 0);
    return ((number % 100) + 100) % 100;
}

function isWeapon(item) {
    return item && String(item.type || '').toLowerCase() === 'weapon';
}

class RhythmBarSystem {
    constructor(character, container, options = {}) {
        this.character = character;
        this.container = container;
        this.options = options;
        this.weaponSlot = options.weaponSlot || 'weapon';
        this.windowMode = Boolean(options.windowMode);
        this.windowCycles = this.windowMode
            ? Math.max(1, Math.min(4, Math.floor(readNumber(options.windowCycles, 1))))
            : 1;

        const prefix = options.prefix || '';
        this.barElement = options.barElement
            || container.querySelector(options.barSelector || `${prefix}#rhythm-bar, ${prefix}.rhythm-bar`);
        this.needleElement = options.needleElement
            || container.querySelector(options.needleSelector || `${prefix}#rhythm-needle, ${prefix}.rhythm-needle`);
        this.critZoneElement = options.critZoneElement
            || container.querySelector(options.critZoneSelector || `${prefix}#crit-zone, ${prefix}.crit-zone`);
        this.hitZoneElement = options.hitZoneElement
            || container.querySelector(options.hitZoneSelector || `${prefix}#hit-zone, ${prefix}.hit-zone`);
        this.attackBtn = options.attackButton
            || container.querySelector(options.attackSelector || `${prefix}#action-weapon, ${prefix}.weapon-card, ${prefix}#btn-attack, ${prefix}.btn-attack`);

        this.ringMode = Boolean(options.ringMode)
            || this.barElement?.dataset?.rhythmMode === 'ring'
            || this.barElement?.classList?.contains('rhythm-ring');

        this.barWidth = 100;
        this.needlePosition = 0;
        this.needleDirection = 1;
        this.battleAttackSpeedBonusPercent = 0;
        this.animationId = null;
        this.lastTime = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.isWindowActive = !this.windowMode;
        this.isOnCooldown = false;
        this.cooldownTimer = null;
        this.cooldownFrame = null;
        this.cooldownStartedAt = 0;
        this.cooldownDurationMs = 0;
        this.hitMarker = null;

        this.updateEquipmentStats();
        this.generateZones();
        this._applyVisualState();
        this._setNeedlePosition(0);
    }

    _getWeapon() {
        const item = this.character?.equipment?.[this.weaponSlot];
        return isWeapon(item) ? item : null;
    }

    _getProfileCharacter() {
        if (this.weaponSlot === 'weapon') return this.character;
        const weapon = this._getWeapon();
        return {
            ...(this.character || {}),
            equipment: {
                ...(this.character?.equipment || {}),
                weapon,
                armor: null
            }
        };
    }

    _getWeaponRarity() {
        return this._getWeapon()?.rarity || 'common';
    }

    _positionToAngle(position) {
        return normalizeRhythmPosition(position) * 3.6;
    }

    _zonePositionToAngle(position) {
        return clampRhythmPosition(position) * 3.6;
    }

    _getZoneBounds(zone) {
        if (!zone) return { start: 0, end: 0 };
        const start = clampRhythmPosition(zone.start);
        const end = Math.max(start, Math.min(100, start + Math.max(0, readNumber(zone.width, 0))));
        return { start, end };
    }

    _isWithinZone(position, zone) {
        const pos = this.ringMode ? normalizeRhythmPosition(position) : clampRhythmPosition(position);
        const { start, end } = this._getZoneBounds(zone);
        return pos >= start && pos <= end;
    }

    _getHitTypeForPosition(position) {
        if (this._isWithinZone(position, this.critZone)) return 'crit';
        if (this._isWithinZone(position, this.hitZone)) return 'hit';
        return 'miss';
    }

    _syncDebugState(lastJudgement = null) {
        if (!this.barElement) return;
        const pos = this.ringMode
            ? normalizeRhythmPosition(this.needlePosition)
            : clampRhythmPosition(this.needlePosition);
        const hitBounds = this._getZoneBounds(this.hitZone);
        const critBounds = this._getZoneBounds(this.critZone);

        this.barElement.dataset.rhythmPosition = pos.toFixed(2);
        this.barElement.dataset.rhythmAngle = this._positionToAngle(pos).toFixed(2);
        this.barElement.dataset.rhythmHitStart = hitBounds.start.toFixed(2);
        this.barElement.dataset.rhythmHitEnd = hitBounds.end.toFixed(2);
        this.barElement.dataset.rhythmCritStart = critBounds.start.toFixed(2);
        this.barElement.dataset.rhythmCritEnd = critBounds.end.toFixed(2);
        this.barElement.dataset.rhythmPreview = this._getHitTypeForPosition(pos);
        this.barElement.dataset.rhythmCycle = String(Math.min(
            this.windowCycles,
            Math.floor(Math.max(0, readNumber(this.needlePosition, 0)) / this.barWidth) + 1
        ));
        this.barElement.dataset.rhythmWindowCycles = String(this.windowCycles);
        if (lastJudgement) {
            this.barElement.dataset.rhythmJudgement = lastJudgement;
        }
    }

    _setNeedlePosition(position) {
        if (!this.needleElement) return;
        if (this.ringMode) {
            const angle = this._positionToAngle(position);
            this.needleElement.style.transform = `rotate(${angle}deg)`;
            this.barElement?.style?.setProperty('--needle-angle', `${angle}deg`);
            this._syncDebugState();
            return;
        }

        const parentWidth = this.barElement ? this.barElement.offsetWidth : 1;
        const translateX = (position / 100) * parentWidth;
        this.needleElement.style.transform = `translateX(${translateX}px)`;
        this._syncDebugState();
    }

    _applyZoneStyle(element, zone) {
        if (!element || !zone) return;
        if (this.ringMode) {
            const { start, end } = this._getZoneBounds(zone);
            element.style.removeProperty('transform');
            element.style.removeProperty('width');
            element.style.setProperty('--zone-start', `${start}%`);
            element.style.setProperty('--zone-end', `${end}%`);
            element.style.setProperty('--zone-start-angle', `${this._zonePositionToAngle(start)}deg`);
            element.style.setProperty('--zone-end-angle', `${this._zonePositionToAngle(end)}deg`);
            element.dataset.zoneStart = start.toFixed(3);
            element.dataset.zoneEnd = end.toFixed(3);
            return;
        }

        const parentWidth = this.barElement ? this.barElement.offsetWidth : 1;
        const translateX = (zone.start / 100) * parentWidth;
        element.style.transform = `translateX(${translateX}px)`;
        element.style.width = `${zone.width}%`;
        element.style.willChange = 'transform';
    }

    _applyVisualState() {
        if (!this.barElement) return;
        const hasWeapon = this.weaponSlot === 'weapon' || Boolean(this._getWeapon());
        this.barElement.classList.toggle('is-ring', this.ringMode);
        this.barElement.classList.toggle('is-window-mode', this.windowMode);
        this.barElement.classList.toggle('is-disabled', !hasWeapon);
        this.barElement.classList.toggle('is-ready', this.windowMode && hasWeapon && !this.isOnCooldown && !this.isWindowActive);
        this.barElement.classList.toggle('is-active', this.windowMode && this.isWindowActive && !this.isOnCooldown);
        this.barElement.classList.toggle('cooldown', this.isOnCooldown);
        this.barElement.style.setProperty('--rhythm-window-cycles', String(this.windowCycles));
        this.attackBtn?.classList?.toggle('disabled', !hasWeapon);
    }

    updateEquipmentStats() {
        const weapon = this._getWeapon();
        const profileCharacter = this._getProfileCharacter();
        this.weaponProfile = getWeaponCombatProfile(profileCharacter);

        if (this.weaponSlot === 'weapon') {
            this.weaponSpeed = this.character?.getWeaponSpeed?.() || 1.0;
            const baseAttackSpeed = this.character?.getAttackInterval?.()
                || (1 / Math.max(0.1, this.character?.getAttackSpeed?.() || 1.0));
            this.attackSpeedBase = baseAttackSpeed;
            this.critChance = this.character?.getCritChance?.() || 0.05;
            this.critDamage = this.character?.getCritDamage?.() || 1.5;
            this.attackPower = this.character?.getTotalAtk?.() || readNumber(weapon?.atk ?? weapon?.attack, 10);
        } else {
            this.weaponSpeed = readNumber(weapon?.weaponSpeed, 1.0) || 1.0;
            const attackSpeed = Math.max(0.1, readNumber(weapon?.attackSpeed, 1.0) || 1.0);
            this.attackSpeedBase = 1 / attackSpeed;
            const rawCritChance = readNumber(weapon?.critChance ?? weapon?.crit_chance, 0.05);
            this.critChance = Math.abs(rawCritChance) > 1 ? rawCritChance / 100 : rawCritChance;
            this.critDamage = readNumber(weapon?.critDamage ?? weapon?.crit_damage, 1.5) || 1.5;
            this.attackPower = readNumber(weapon?.atk ?? weapon?.attack, 8);
        }

        this.weaponSpeed *= Math.max(0.1, Number(this.weaponProfile.needleSpeedMultiplier) || 1);
        const profileCooldown = Math.max(0.1, Number(this.weaponProfile.cooldownMultiplier) || 1);
        const battleMultiplier = 1 + Math.max(0, Number(this.battleAttackSpeedBonusPercent) || 0) / 100;
        this.attackSpeed = Math.max(0.18, (this.attackSpeedBase * profileCooldown) / Math.max(0.1, battleMultiplier));
        this.weaponRarity = this._getWeaponRarity();
        this._applyVisualState();
    }

    _calculateHitZoneWidth() {
        const rarityWidths = {
            common: 14,
            uncommon: 16,
            rare: 18,
            epic: 20,
            legendary: 22,
            mythic: 24
        };
        const profileWidth = Math.max(0.5, Number(this.weaponProfile?.hitZoneMultiplier) || 1);
        return Math.max(8, Math.min(28, (rarityWidths[this.weaponRarity] || 14) * profileWidth));
    }

    generateZones() {
        const profileCritWidth = Math.max(0.4, Number(this.weaponProfile?.critZoneMultiplier) || 1);
        const critWidth = Math.max(3, Math.min(14, this.critChance * 100 * 0.55 * profileCritWidth));
        const hitWidth = this._calculateHitZoneWidth();
        const safeGap = 3;
        const marginLeft = 3;
        const marginRight = 3;
        const availableWidth = 100 - marginLeft - marginRight;
        const critOnLeft = Math.random() > 0.5;
        let critStart;
        let hitStart;

        if (critOnLeft) {
            const maxCritStart = availableWidth - critWidth - safeGap - hitWidth;
            critStart = marginLeft + Math.random() * Math.max(0, maxCritStart);
            const hitMinStart = critStart + critWidth + safeGap;
            const hitMaxStart = 100 - marginRight - hitWidth;
            hitStart = hitMinStart + Math.random() * Math.max(0, hitMaxStart - hitMinStart);
        } else {
            const maxHitStart = availableWidth - hitWidth - safeGap - critWidth;
            hitStart = marginLeft + Math.random() * Math.max(0, maxHitStart);
            const critMinStart = hitStart + hitWidth + safeGap;
            const critMaxStart = 100 - marginRight - critWidth;
            critStart = critMinStart + Math.random() * Math.max(0, critMaxStart - critMinStart);
        }

        this.critZone = { start: critStart, width: critWidth };
        this.hitZone = { start: hitStart, width: hitWidth };
        this._applyZoneStyle(this.critZoneElement, this.critZone);
        this._applyZoneStyle(this.hitZoneElement, this.hitZone);
        this._syncDebugState();
    }

    start() {
        if (this.isRunning) return;
        this.updateEquipmentStats();
        this.generateZones();
        if (this.windowMode) {
            this.isRunning = false;
            this.isWindowActive = false;
            this._setNeedlePosition(0);
            this._applyVisualState();
            return;
        }

        this.isRunning = true;
        this.isPaused = false;
        this.lastTime = performance.now();
        this.animate();
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.cancelCooldown();
    }

    activateWindow() {
        if (!this.windowMode) return false;
        if (this.isOnCooldown || !this._getWeapon()) {
            this._applyVisualState();
            return false;
        }

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.updateEquipmentStats();
        this.generateZones();
        this.needlePosition = 0;
        this.needleDirection = 1;
        this.isWindowActive = true;
        this.isRunning = true;
        this.isPaused = false;
        this.lastTime = performance.now();
        this._setNeedlePosition(0);
        this._applyVisualState();
        this.animate();
        return true;
    }

    expireWindow() {
        if (!this.windowMode) return;
        this.isRunning = false;
        this.isWindowActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.needlePosition = 0;
        this._setNeedlePosition(0);
        this.barElement?.classList?.add('is-window-expired');
        window.setTimeout(() => this.barElement?.classList?.remove('is-window-expired'), 260);
        this._applyVisualState();
    }

    animate() {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        if (!this.isPaused && !this.isOnCooldown) {
            const movement = this.barWidth * this.weaponSpeed * deltaTime;
            if (this.ringMode) {
                this.needlePosition += movement;
                if (this.windowMode) {
                    if (this.needlePosition >= this.barWidth * this.windowCycles) {
                        this.expireWindow();
                        return;
                    }
                } else if (this.needlePosition >= this.barWidth) {
                    this.needlePosition %= this.barWidth;
                }
            } else {
                this.needlePosition += movement * this.needleDirection;
                if (this.needlePosition >= this.barWidth) {
                    this.needlePosition = this.barWidth;
                    this.needleDirection = -1;
                } else if (this.needlePosition <= 0) {
                    this.needlePosition = 0;
                    this.needleDirection = 1;
                }
            }
            this._setNeedlePosition(this.needlePosition);
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    judgeHit() {
        if (this.isOnCooldown) {
            this._syncDebugState('cooldown');
            return { type: 'cooldown', damage: 0 };
        }
        if (this.windowMode && !this.isWindowActive) {
            this._syncDebugState('inactive');
            return { type: 'inactive', damage: 0 };
        }
        if (this.weaponSlot !== 'weapon' && !this._getWeapon()) {
            this._syncDebugState('inactive');
            return { type: 'inactive', damage: 0 };
        }

        audioManager.play('attack-swing', { throttleKey: `rhythm-attack-swing:${this.weaponSlot}`, throttleMs: 80 });
        const pos = this.ringMode
            ? normalizeRhythmPosition(this.needlePosition)
            : clampRhythmPosition(this.needlePosition);
        const hitType = this._getHitTypeForPosition(pos);
        let damage = 0;

        if (hitType === 'crit') {
            damage = Math.floor(this.attackPower * this.critDamage);
        } else if (hitType === 'hit') {
            damage = this.attackPower;
        }

        this._syncDebugState(hitType);
        this.showHitMarker(pos, hitType);
        this.showJudgmentText(hitType, damage);
        if (this.windowMode) {
            this.isWindowActive = false;
            this.isRunning = false;
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        }
        this.startCooldown();

        return { type: hitType, damage };
    }

    showHitMarker(position, hitType) {
        if (this.hitMarker) this.hitMarker.remove();
        this.hitMarker = document.createElement('div');
        this.hitMarker.className = `hit-marker hit-marker-${hitType}`;
        if (this.ringMode) {
            this.hitMarker.style.transform = `rotate(${this._positionToAngle(position)}deg)`;
        } else {
            const parentWidth = this.barElement ? this.barElement.offsetWidth : 1;
            const translateX = (position / 100) * parentWidth;
            this.hitMarker.style.transform = `translateX(${translateX}px)`;
        }
        this.hitMarker.innerHTML = '<div class="marker-pulse"></div>';
        this.barElement?.appendChild(this.hitMarker);

        setTimeout(() => {
            if (this.hitMarker) {
                this.hitMarker.remove();
                this.hitMarker = null;
            }
        }, 800);
    }

    showJudgmentText(hitType, damage) {
        const textConfig = {
            crit: { text: '暴擊', color: '#4caf50', size: '28px' },
            hit: { text: '命中', color: '#ffd700', size: '22px' },
            miss: { text: '失誤', color: '#ff4444', size: '20px' }
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
        this.barElement?.appendChild(textEl);
        setTimeout(() => textEl.remove(), 800);
    }

    startCooldown() {
        if (this.isOnCooldown) return;
        this.isOnCooldown = true;
        this._applyVisualState();

        const cooldownDuration = this.attackSpeed * 1000;
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
        this.clearActionCooldown();
        this._applyVisualState();
    }

    endCooldown() {
        this.isOnCooldown = false;
        this.clearActionCooldown();
        this.updateEquipmentStats();
        this.generateZones();
        if (this.cooldownTimer) {
            clearTimeout(this.cooldownTimer);
            this.cooldownTimer = null;
        }
        if (this.windowMode) {
            this.isRunning = false;
            this.isWindowActive = false;
            this.needlePosition = 0;
            this._setNeedlePosition(0);
        }
        this._applyVisualState();
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    reset() {
        this.needlePosition = 0;
        this.needleDirection = 1;
        this.isPaused = false;
        this.isWindowActive = !this.windowMode;
        this.cancelCooldown();
        this._setNeedlePosition(0);
        this.generateZones();
    }

    updateCharacter(character) {
        this.character = character;
        this.updateEquipmentStats();
        this.generateZones();
        this._applyVisualState();
    }

    setBattleAttackSpeedBonus(percent = 0) {
        this.battleAttackSpeedBonusPercent = Math.max(0, Number(percent) || 0);
        this.updateEquipmentStats();
    }

    destroy() {
        this.stop();
        if (this.hitMarker) this.hitMarker.remove();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RhythmBarSystem;
}

if (typeof window !== 'undefined') {
    window.RhythmBarSystem = RhythmBarSystem;
}

export default RhythmBarSystem;
