import { escapeHtml } from './ItemDisplay.js';

function find(root, selectors) {
    if (!root) return null;
    for (const selector of selectors.split(',')) {
        const el = root.querySelector(selector.trim());
        if (el) return el;
    }
    return null;
}

function setText(root, selectors, value) {
    const el = find(root, selectors);
    if (el) el.textContent = value ?? '';
}

function setIcon(root, selectors, item, fallback = '') {
    const el = find(root, selectors);
    if (!el) return;
    if (item?.image) {
        el.innerHTML = `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name || '')}" style="width: 100%; height: 100%; object-fit: contain;">`;
    } else {
        el.textContent = item?.icon || fallback;
    }
}

function clampPercent(value) {
    return Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
}

function getMonsterCurrentHp(monster) {
    return Number(monster?.currentHp ?? monster?.hp ?? 0) || 0;
}

function getMonsterMaxHp(monster) {
    return Number(monster?.maxHp ?? monster?.hp ?? monster?.currentHp ?? 1) || 1;
}

function getMonsterAttack(monster) {
    return monster?.attack ?? monster?.atk ?? 0;
}

function getMonsterDefense(monster) {
    return monster?.defense ?? monster?.def ?? 0;
}

function getCharacterHp(character) {
    return Number(character?.hp ?? character?.getHP?.() ?? 0) || 0;
}

function getCharacterMaxHp(character) {
    return Number(character?.maxHp ?? character?.getMaxHP?.() ?? 1) || 1;
}

function getTotalAttack(character) {
    return typeof character?.getTotalAtk === 'function'
        ? character.getTotalAtk()
        : Number(character?.atk ?? character?.attack ?? character?.baseAtk ?? 0) || 0;
}

function getFirstConsumableStack(inventory = []) {
    return inventory.find(stack => {
        const item = stack?.item;
        return Number(stack?.quantity ?? 0) > 0 && (item?.type === 'potion' || item?.effect?.hp || item?.buff);
    }) || null;
}

function getCombatSurface(root) {
    if (!root) return null;
    if (root.nodeType === 9) return root.body || null;
    return root;
}

function getMonsterRank(monster) {
    const type = String(monster?.type || '').toLowerCase();
    if (monster?.isBoss || type === 'boss' || type === 'world_boss') return 'boss';
    if (monster?.isElite || type === 'elite') return 'elite';
    return 'normal';
}

function getBossPhase(monster) {
    if (getMonsterRank(monster) !== 'boss') return 1;
    const maxHp = getMonsterMaxHp(monster);
    const ratio = maxHp > 0 ? getMonsterCurrentHp(monster) / maxHp : 1;
    if (ratio <= 0.25) return 3;
    if (ratio <= 0.5) return 2;
    return 1;
}

function applyMonsterFrame(root, monster) {
    const header = find(root, '.battle-header, .tower-monster-card');
    const display = find(root, '.monster-display, .tower-monster-card');
    const rank = getMonsterRank(monster);
    const phase = getBossPhase(monster);
    const targets = [header, display].filter(Boolean);

    for (const el of targets) {
        el.classList.remove(
            'combat-rank-normal',
            'combat-rank-elite',
            'combat-rank-boss',
            'combat-boss-phase-1',
            'combat-boss-phase-2',
            'combat-boss-phase-3'
        );
        el.classList.add(`combat-rank-${rank}`, `combat-boss-phase-${phase}`);
        el.dataset.combatRank = rank;
        el.dataset.combatPhase = String(phase);
    }

    const nameBar = find(root, '.monster-name-bar');
    if (nameBar) {
        let badge = nameBar.querySelector('.combat-rank-badge');
        if (rank === 'normal') {
            badge?.remove();
        } else {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'combat-rank-badge';
                nameBar.appendChild(badge);
            }
            badge.className = `combat-rank-badge combat-rank-badge-${rank}`;
            badge.textContent = rank === 'boss' ? `BOSS P${phase}` : '菁英';
        }
    }

    if (rank === 'boss') {
        const previousPhase = Number(monster._combatUiPhase || 0);
        if (previousPhase > 0 && phase > previousPhase) {
            showCombatPhaseWarning(root, monster, phase);
        }
        monster._combatUiPhase = phase;
    }
}

function getPlayerDamageAnchor(root) {
    return find(root, '.player-info-bar, .tower-player-battle-panel, .combat-panel-bottom, .battle-content');
}

export function showCombatPlayerDamageNumber(root, damage, options = {}) {
    if (!root) return;

    const numericDamage = Math.max(0, Number(damage) || 0);
    if (numericDamage <= 0) return;

    const anchor = getPlayerDamageAnchor(root);
    if (!anchor) return;

    const damageEl = document.createElement('div');
    const heavyThreshold = Number(options.heavyThreshold ?? 20) || 20;
    damageEl.className = `damage-number player-damage-number damage-player-hit${numericDamage >= heavyThreshold ? ' damage-player-heavy' : ''}`;
    damageEl.textContent = options.label || `-${numericDamage}`;

    const hpTarget = anchor.querySelector('.info-vital-bars, .vital-row, .vital-bar-track, #player-hp-fill, #hud-hp-bar') || anchor;
    const anchorRect = anchor.getBoundingClientRect();
    const targetRect = hpTarget.getBoundingClientRect();
    const left = targetRect.left - anchorRect.left + (targetRect.width * 0.72);
    const top = targetRect.top - anchorRect.top + (targetRect.height * 0.35);

    damageEl.style.left = `${Math.max(28, left)}px`;
    damageEl.style.top = `${Math.max(12, top)}px`;

    anchor.appendChild(damageEl);
    setTimeout(() => damageEl.remove(), 950);
}

function formatDuration(value, fallback = '') {
    if (value === undefined || value === null || value === '') return fallback;
    const seconds = Number(value);
    if (!Number.isFinite(seconds)) return String(value);
    if (seconds <= 0) return '';
    return `${Math.ceil(seconds)}s`;
}

function createStatusIcon(effect, options = {}) {
    const el = document.createElement('div');
    const polarity = options.polarity || 'positive';
    const isPassive = Boolean(options.passive);
    el.className = `buff-indicator status-${polarity}${isPassive ? ' passive' : ''}`;
    el.dataset.effectType = effect.type || effect.id || '';
    el.innerHTML = `
        <span class="buff-icon">${escapeHtml(effect.icon || options.icon || '◆')}</span>
        <span class="buff-duration">${escapeHtml(options.durationText ?? formatDuration(effect.duration, isPassive ? '∞' : ''))}</span>
    `;
    el.dataset.tooltipTitle = effect.name || effect.type || '狀態';
    el.dataset.tooltipBody = effect.description || options.description || '';
    el.setAttribute('aria-label', `${el.dataset.tooltipTitle}${el.dataset.tooltipBody ? `，${el.dataset.tooltipBody}` : ''}`);
    return el;
}

function getMonsterStatusEffects(monster) {
    const now = Date.now();
    return (monster?.statusEffects || [])
        .filter(effect => !effect.expiresAt || effect.expiresAt > now)
        .map(effect => ({
            ...effect,
            duration: effect.expiresAt ? Math.max(0, (effect.expiresAt - now) / 1000) : effect.duration
        }));
}

function renderMonsterStatusIndicators(root, monster) {
    const host = find(root, '.monster-info, .tower-monster-card');
    if (!host) return;

    let row = host.querySelector('.monster-status-effects');
    const effects = getMonsterStatusEffects(monster);

    if (effects.length === 0) {
        row?.remove();
        return;
    }

    if (!row) {
        row = document.createElement('div');
        row.className = 'monster-status-effects';
        host.appendChild(row);
    }

    row.innerHTML = '';
    effects.forEach(effect => {
        row.appendChild(createStatusIcon(effect, {
            polarity: 'negative',
            durationText: formatDuration(effect.duration),
            description: effect.description || ''
        }));
    });
}

export function renderCombatMonster(root, monster, options = {}) {
    if (!root || !monster) return;

    const currentHp = getMonsterCurrentHp(monster);
    const maxHp = getMonsterMaxHp(monster);
    const hpPercent = clampPercent((currentHp / maxHp) * 100);

    setText(root, '#battle-monster-icon, #monster-icon', monster.icon || options.fallbackIcon || '?');
    setText(root, '#battle-monster-name, #monster-name', monster.name || options.fallbackName || '敵人');
    setText(root, '#battle-monster-level, #monster-level', monster.level ?? options.level ?? '?');
    setText(root, '#battle-monster-hp-text, #monster-hp-text', `${currentHp}/${maxHp}`);
    setText(root, '#battle-monster-atk, #monster-atk', getMonsterAttack(monster));
    setText(root, '#battle-monster-def, #monster-def', getMonsterDefense(monster));

    const hpBar = find(root, '#battle-monster-hp-bar, #monster-hp-fill');
    if (hpBar) hpBar.style.width = `${hpPercent}%`;
    applyMonsterFrame(root, monster);
    renderMonsterStatusIndicators(root, monster);
}

export function renderCombatPlayer(root, character, options = {}) {
    if (!root || !character) return;

    const hp = getCharacterHp(character);
    const maxHp = getCharacterMaxHp(character);
    const hpPercent = clampPercent((hp / maxHp) * 100);

    setText(root, '#hud-player-level, #battle-player-level', character.level || 1);
    setText(root, '#hud-player-name, .info-name', character.name || options.fallbackName || '冒險者');
    setText(root, '#hud-hp-text, #player-hp-text', `${hp}/${maxHp}`);

    const hpBar = find(root, '#hud-hp-bar, #player-hp-fill');
    if (hpBar) hpBar.style.width = `${hpPercent}%`;

    const buffContainer = find(root, '#buff-indicators, #tower-buff-indicators');
    renderCombatBuffIndicators(buffContainer, character);
    renderCombatActionDeck(root, character, options);
}

export function renderCombatActionDeck(root, character, options = {}) {
    if (!root || !character) return;

    const weapon = character.equipment?.weapon || null;
    setIcon(root, '#weapon-icon', weapon, '⚔️');
    setText(root, '#weapon-name', weapon?.name || options.unarmedName || '徒手攻擊');
    setText(root, '#weapon-damage', getTotalAttack(character));

    const stack = getFirstConsumableStack(options.inventory || []);
    const potion = stack?.item || null;
    const quantity = Number(stack?.quantity ?? 0) || 0;
    setIcon(root, '#potion-icon', potion, '🧪');
    setText(root, '#potion-name', potion?.name || options.emptyPotionName || '沒有補給');
    setText(root, '#potion-heal', potion ? `+${potion.effect?.hp || 0}` : '+0');
    setText(root, '#potion-quantity', quantity > 0 ? `x${quantity}` : '無');

    const potionCard = find(root, '#action-potion, #btn-item');
    potionCard?.classList.toggle('disabled', !stack);
}

export function renderCombatBuffIndicators(container, character) {
    if (!container || !character) return;
    container.innerHTML = '';

    const passiveEffects = typeof character.getActivePassiveCombatEffects === 'function'
        ? character.getActivePassiveCombatEffects()
        : [];

    for (const effect of passiveEffects) {
        container.appendChild(createStatusIcon(effect, {
            passive: true,
            polarity: 'positive',
            durationText: '∞',
            description: '常駐戰術技能'
        }));
    }

    const buffIcons = {
        atk: '⚔️',
        def: '🛡️',
        critChance: '🎯',
        critDamage: '💥',
        attackSpeed: '⚡',
        armorBreak: '🧨',
        poison: '☠️',
        burn: '🔥',
        bleed: '🩸',
        frozen: '❄️',
        slow: '🧊'
    };

    for (const buff of character.activeBuffs || []) {
        container.appendChild(createStatusIcon({
            ...buff,
            icon: buff.icon || buffIcons[buff.type] || '✨',
            description: `+${buff.value ?? 0}`
        }, { polarity: 'positive' }));
    }

    for (const debuff of character.debuffs || []) {
        container.appendChild(createStatusIcon({
            ...debuff,
            icon: debuff.icon || buffIcons[debuff.type] || '◆',
            description: debuff.description || `-${debuff.value ?? 0}`
        }, { polarity: 'negative' }));
    }
}

export function showCombatDamageNumber(root, damage, options = {}) {
    const battleHeader = find(root, '.battle-header, .tower-monster-card');
    if (!battleHeader) return;

    const numericDamage = Math.max(0, Number(damage) || 0);
    const type = options.type
        || (options.isMiss ? 'dodge' : numericDamage <= 0 ? 'block' : options.isCrit ? 'critical' : 'normal');
    const config = {
        normal: { text: `-${numericDamage}`, className: 'damage-normal' },
        hit: { text: `-${numericDamage}`, className: 'damage-normal' },
        critical: { text: `-${numericDamage}!!`, className: 'damage-critical' },
        crit: { text: `-${numericDamage}!!`, className: 'damage-critical' },
        block: { text: '格擋', className: 'damage-block' },
        dodge: { text: '閃避', className: 'damage-dodge' },
        miss: { text: '閃避', className: 'damage-dodge' },
        armorBreak: { text: '破防', className: 'damage-armor-break' },
        armor_break: { text: '破防', className: 'damage-armor-break' },
        dot: { text: `-${numericDamage}`, className: 'damage-dot' },
        heal: { text: `+${numericDamage}`, className: 'damage-heal' },
        lifesteal: { text: options.label || `吸血 +${numericDamage}`, className: 'damage-heal damage-lifesteal' },
        doubleStrike: { text: options.label || `連擊 -${numericDamage}`, className: 'damage-double-strike' },
        reflect: { text: options.label || `反傷 -${numericDamage}`, className: 'damage-reflect' },
        revive: { text: options.label || '復活', className: 'damage-revive' },
        status: { text: options.label || '狀態', className: 'damage-status' },
        statusStun: { text: options.label || '暈眩', className: 'damage-status damage-status-stun' },
        statusSlow: { text: options.label || '緩速', className: 'damage-status damage-status-slow' },
        statusPoison: { text: options.label || '中毒', className: 'damage-status damage-status-poison' }
    }[type] || { text: `-${numericDamage}`, className: 'damage-normal' };

    const damageEl = document.createElement('div');
    damageEl.className = `damage-number ${config.className}`;
    damageEl.textContent = options.label || config.text;

    const hpContainer = battleHeader.querySelector('.monster-hp-container');
    if (hpContainer) {
        const rect = hpContainer.getBoundingClientRect();
        const headerRect = battleHeader.getBoundingClientRect();
        const dx = rect.left - headerRect.left + rect.width / 2;
        const dy = rect.top - headerRect.top - 10;
        damageEl.style.left = `${dx}px`;
        damageEl.style.top = `${dy}px`;
    }

    battleHeader.appendChild(damageEl);
    if ((type === 'normal' || type === 'hit') && numericDamage > 0) {
        triggerCombatImpact(root, { intensity: 'normal', flash: 'hit' });
    }
    if (type === 'critical' || type === 'crit') {
        triggerCombatImpact(root, { intensity: 'critical', flash: 'crit', slowMotion: true });
    }
    if (type === 'armorBreak' || type === 'armor_break') {
        triggerCombatImpact(root, { intensity: 'medium', flash: 'armorBreak' });
    }
    if (type === 'doubleStrike') {
        triggerCombatImpact(root, { intensity: 'combo', flash: 'doubleStrike' });
    }
    if (type === 'reflect') {
        triggerCombatImpact(root, { intensity: 'medium', flash: 'reflect' });
    }
    if (type === 'revive') {
        triggerCombatImpact(root, { intensity: 'phase', flash: 'revive', slowMotion: true });
    }
    if (type === 'lifesteal' || type === 'heal') {
        triggerCombatImpact(root, { intensity: 'soft', flash: 'heal' });
    }
    if (type === 'statusStun') {
        triggerCombatImpact(root, { intensity: 'medium', flash: 'thunder' });
    }
    if (type === 'statusSlow') {
        triggerCombatImpact(root, { intensity: 'soft', flash: 'ice' });
    }
    if (type === 'statusPoison') {
        triggerCombatImpact(root, { intensity: 'soft', flash: 'poison' });
    }
    setTimeout(() => damageEl.remove(), 800);
}

export function triggerCombatImpact(root, options = {}) {
    const surface = getCombatSurface(root);
    if (!surface) return;

    const intensity = options.intensity || 'normal';
    const impactClass = `combat-impact-${intensity}`;
    surface.classList.remove(impactClass);
    // Force a reflow so repeated hits of the same type replay the animation.
    void surface.offsetWidth;
    surface.classList.add(impactClass);
    setTimeout(() => surface.classList.remove(impactClass), 380);

    if (options.flash) {
        let flashEl = surface.querySelector('.combat-screen-flash');
        if (!flashEl) {
            flashEl = document.createElement('div');
            flashEl.className = 'combat-screen-flash';
            surface.appendChild(flashEl);
        }
        flashEl.className = `combat-screen-flash active flash-${options.flash}`;
        setTimeout(() => flashEl.classList.remove('active'), 180);
    }

    if (options.slowMotion) {
        surface.classList.add('combat-slow-motion');
        setTimeout(() => surface.classList.remove('combat-slow-motion'), 260);
    }
}

export function showCombatKillFreeze(root) {
    const surface = getCombatSurface(root);
    if (!surface) return;
    surface.classList.add('combat-kill-freeze');
    triggerCombatImpact(surface, { intensity: 'critical', flash: 'kill', slowMotion: true });
    setTimeout(() => surface.classList.remove('combat-kill-freeze'), 420);
}

export function showCombatPhaseWarning(root, monster, phase = 2) {
    const surface = getCombatSurface(root);
    if (!surface) return;
    const warning = document.createElement('div');
    warning.className = `combat-phase-warning combat-phase-warning-${phase}`;
    warning.innerHTML = `
        <span class="phase-kicker">BOSS 階段轉換</span>
        <strong>${escapeHtml(monster?.name || 'BOSS')} 進入第 ${phase} 階段</strong>
    `;
    surface.appendChild(warning);
    triggerCombatImpact(surface, { intensity: 'phase', flash: 'phase', slowMotion: true });
    setTimeout(() => warning.remove(), 1400);
}

export function showCombatPlayerHitFeedback(root, character, damage = 0) {
    if (!root || !character) return;

    const maxHp = getCharacterMaxHp(character);
    const hpPercent = (getCharacterHp(character) / maxHp) * 100;
    const damagePercent = (Number(damage) || 0) / maxHp * 100;
    showCombatPlayerDamageNumber(root, damage, { heavyThreshold: maxHp * 0.16 });

    let vignetteEl = root.querySelector('.hit-vignette');
    if (!vignetteEl) {
        vignetteEl = document.createElement('div');
        vignetteEl.className = 'hit-vignette';
        root.appendChild(vignetteEl);
    }

    vignetteEl.className = `hit-vignette active ${hpPercent < 30 ? 'high' : 'normal'}`;
    setTimeout(() => vignetteEl.classList.remove('active'), 120);

    const battleContent = root.querySelector('.battle-content') || root;
    let shakeClass = 'shake-small';
    if (damagePercent > 40) shakeClass = 'shake-large';
    else if (damagePercent > 15) shakeClass = 'shake-medium';
    battleContent.classList.add(shakeClass);
    triggerCombatImpact(root, { intensity: damagePercent > 15 ? 'medium' : 'normal', flash: 'hit' });
    setTimeout(() => battleContent.classList.remove(shakeClass), 400);
}
