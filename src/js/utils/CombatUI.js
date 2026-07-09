import { escapeHtml, getItemVisualHtml } from './ItemDisplay.js';
import { getGeneratedCombatEffectImage, getGeneratedMonsterImage } from '../data/AssetManifest.js';
import { SetDatabase } from '../data/Equipment.js';
import { calculateActiveSetBonuses } from '../data/EquipmentBalance.js';
import audioManager from './AudioManager.js';

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
    el.innerHTML = getItemVisualHtml(item, fallback);
}

function setImageOrTextIcon(root, selectors, image, label, fallback = '') {
    const el = find(root, selectors);
    if (!el) return;
    if (image) {
        el.innerHTML = `<img src="${escapeHtml(image)}" alt="${escapeHtml(label || '')}">`;
        return;
    }
    el.textContent = fallback;
}

function isWeaponItem(item) {
    return item && String(item.type || '').toLowerCase() === 'weapon';
}

function getItemAttackValue(item) {
    const value = Number(item?.atk ?? item?.attack ?? item?.stats?.atk ?? item?.stats?.attack ?? 0);
    return Number.isFinite(value) ? value : 0;
}

function playCombatDamageSound(type, damage, options = {}) {
    const normalizedType = String(type || '').toLowerCase();
    const numericDamage = Number(damage) || 0;
    let sound = null;
    let throttleKey = `combat-damage-${normalizedType}`;

    if (options.isMiss || normalizedType === 'dodge' || normalizedType === 'miss') {
        sound = 'miss';
    } else if (options.isCrit || normalizedType === 'critical' || normalizedType === 'crit') {
        sound = 'crit';
    } else if (normalizedType === 'block' || numericDamage <= 0 && !normalizedType.startsWith('status')) {
        sound = 'block';
    } else if (normalizedType === 'heal' || normalizedType === 'lifesteal') {
        sound = 'heal';
    } else if (normalizedType === 'dot' || normalizedType === 'statuspoison') {
        sound = 'poison';
    } else if (normalizedType === 'revive') {
        sound = 'revive';
    } else if (normalizedType.startsWith('status')) {
        sound = 'status';
    } else if (normalizedType === 'doublestrike' || normalizedType === 'reflect') {
        sound = 'hit';
        throttleKey = `combat-${normalizedType}`;
    } else if (numericDamage > 0) {
        sound = 'hit';
    }

    if (sound) {
        audioManager.play(sound, {
            throttleKey,
            throttleMs: sound === 'hit' ? 55 : 90,
            intensity: numericDamage > 40 ? 'heavy' : 'light'
        });
    }
}

function getCombatEffectAssetId(effect = {}) {
    if (effect.assetId) return String(effect.assetId).toLowerCase();
    const raw = String(effect.type || effect.id || '').toLowerCase();
    const map = {
        poison: 'poison',
        poisoned: 'poison',
        burn: 'burn',
        burning: 'burn',
        bleed: 'bleed',
        bleeding: 'bleed',
        freeze: 'freeze',
        frozen: 'freeze',
        armor_break: 'armor_break',
        defense_down: 'armor_break',
        attack_speed_down: 'attack_speed_down',
        slow: 'attack_speed_down',
        attack_up: 'attack_up',
        atk_up: 'attack_up',
        defense_up: 'defense_up',
        def_up: 'defense_up',
        lifesteal: 'lifesteal',
        life_steal: 'lifesteal',
        counter: 'counter',
        double_strike: 'double_strike',
        poison_resist: 'poison_resist',
        cold_resist: 'cold_resist',
        dragon_burn: 'dragon_burn'
    };
    return map[raw] || raw;
}

function getActiveSetBuffEntries(character) {
    const setData = calculateActiveSetBonuses(character, SetDatabase);
    const latestBySet = new Map();

    (setData.active || []).forEach(entry => {
        const previous = latestBySet.get(entry.setId);
        const required = Number(entry.required) || 0;
        const previousRequired = Number(previous?.required) || 0;

        if (!previous || required >= previousRequired) {
            latestBySet.set(entry.setId, entry);
        }
    });

    return [...latestBySet.values()].map(entry => ({
        effect: {
            id: `setbonus_${entry.setId}_${entry.required}`,
            type: `setbonus_${entry.setId}_${entry.required}`,
            source: 'setBonus',
            name: entry.name || entry.setName || '套裝效果',
            icon: '◆',
            description: `${entry.setName || '套裝'} ${entry.required}件：${entry.description || entry.name || '已啟用'}`
        },
        options: {
            key: `set:${entry.setId}:latest`,
            passive: true,
            polarity: 'positive',
            durationText: ''
        }
    }));
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
    const battleModal = root?.matches?.('.battle-modal')
        ? root
        : root?.querySelector?.('.battle-modal');
    const battleModalVisible = battleModal
        && !battleModal.hidden
        && battleModal.style?.display !== 'none'
        && !battleModal.classList?.contains('battle-result-mode');
    if (battleModalVisible) {
        return find(battleModal, '.combat-panel-bottom .player-info-bar, .tower-player-battle-panel .player-info-bar, .player-info-bar, .combat-panel-bottom');
    }

    return find(root, '.tower-player-battle-panel .player-info-bar, .combat-panel-bottom .player-info-bar, .player-info-bar, .tower-player-battle-panel, .combat-panel-bottom, .battle-content');
}

export function showCombatPlayerDamageNumber(root, damage, options = {}) {
    if (!root) return;

    const numericDamage = Math.max(0, Number(damage) || 0);
    if (numericDamage <= 0) return;

    const anchor = getPlayerDamageAnchor(root);
    if (!anchor) return;

    const damageEl = document.createElement('div');
    const heavyThreshold = Number(options.heavyThreshold ?? 20) || 20;
    const type = options.type || 'hit';
    const isHeal = type === 'heal' || type === 'lifesteal';
    const typeClass = isHeal ? 'damage-player-heal damage-lifesteal' : 'damage-player-hit';
    damageEl.className = `damage-number player-damage-number ${typeClass}${!isHeal && numericDamage >= heavyThreshold ? ' damage-player-heavy' : ''}`;
    damageEl.textContent = options.label || (isHeal ? `+${numericDamage}` : `-${numericDamage}`);

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
    updateStatusIcon(el, effect, options);
    return el;
}

function getStatusIconKey(effect, options = {}, index = 0) {
    if (options.key) return options.key;
    const id = effect.id || effect.type || effect.name || 'effect';
    const source = effect.source || options.source || '';
    const mode = options.passive ? 'passive' : options.polarity || 'status';
    return `${mode}:${id}:${source}:${index}`;
}

function updateStatusIcon(el, effect, options = {}) {
    const polarity = options.polarity || 'positive';
    const isPassive = Boolean(options.passive);
    el.className = `buff-indicator status-${polarity}${isPassive ? ' passive' : ''}`;
    el.dataset.effectType = effect.type || effect.id || '';

    let iconEl = el.querySelector('.buff-icon');
    if (!iconEl) {
        iconEl = document.createElement('span');
        iconEl.className = 'buff-icon';
        el.appendChild(iconEl);
    }

    let durationEl = el.querySelector('.buff-duration');
    if (!durationEl) {
        durationEl = document.createElement('span');
        durationEl.className = 'buff-duration';
        el.appendChild(durationEl);
    }

    const effectImage = getGeneratedCombatEffectImage(getCombatEffectAssetId(effect));
    if (effectImage) {
        iconEl.innerHTML = `<img src="${escapeHtml(effectImage)}" alt="${escapeHtml(effect.name || effect.type || '')}">`;
    } else {
        iconEl.textContent = effect.icon || options.icon || '◆';
    }
    durationEl.textContent = options.durationText ?? formatDuration(effect.duration, isPassive ? '∞' : '');
    el.dataset.tooltipTitle = effect.name || effect.type || '狀態';
    el.dataset.tooltipBody = effect.description || options.description || '';
    el.setAttribute('aria-label', `${el.dataset.tooltipTitle}${el.dataset.tooltipBody ? `，${el.dataset.tooltipBody}` : ''}`);
}

function syncStatusIcons(container, entries) {
    if (!container) return;

    Array.from(container.children)
        .filter(child => !child.dataset?.statusKey)
        .forEach(child => child.remove());

    const existing = new Map(
        Array.from(container.children)
            .filter(child => child.dataset?.statusKey)
            .map(child => [child.dataset.statusKey, child])
    );
    const orderedNodes = [];

    entries.forEach((entry, index) => {
        const key = getStatusIconKey(entry.effect, entry.options, index);
        const el = existing.get(key) || createStatusIcon(entry.effect, entry.options);
        el.dataset.statusKey = key;
        updateStatusIcon(el, entry.effect, entry.options);
        orderedNodes.push(el);
        existing.delete(key);
    });

    existing.forEach(el => el.remove());
    orderedNodes.forEach((el, index) => {
        const currentNode = container.children[index] || null;
        if (currentNode !== el) {
            container.insertBefore(el, currentNode);
        }
    });
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

    syncStatusIcons(row, effects.map((effect, index) => ({
        effect,
        options: {
            key: `monster:${effect.type || effect.id}:${effect.source || ''}:${index}`,
            polarity: 'negative',
            durationText: formatDuration(effect.duration),
            description: effect.description || ''
        }
    })));
}

function getMonsterPoisonAccumulated(monster) {
    const now = Date.now();
    return (monster?.statusEffects || [])
        .filter(effect => effect?.type === 'poison' && (!effect.expiresAt || effect.expiresAt > now))
        .reduce((sum, effect) => sum + (Number(effect.accumulated) || 0), 0);
}

function renderMonsterPoisonAccumulator(root, monster, maxHp) {
    const hpBar = find(root, '#battle-monster-hp-bar, #monster-hp-fill');
    const track = hpBar?.parentElement;
    if (!track) return;

    let poisonFill = track.querySelector('.poison-execute-fill');
    const accumulated = getMonsterPoisonAccumulated(monster);

    if (accumulated <= 0 || maxHp <= 0) {
        poisonFill?.remove();
        return;
    }

    if (!poisonFill) {
        poisonFill = document.createElement('div');
        poisonFill.className = 'poison-execute-fill';
        track.appendChild(poisonFill);
    }

    const poisonPercent = clampPercent((accumulated / maxHp) * 100);
    poisonFill.style.width = `${poisonPercent}%`;
    poisonFill.dataset.tooltipTitle = '累積毒素';
    poisonFill.dataset.tooltipBody = `已累積 ${Math.floor(accumulated)}，攻擊傷害加上毒素足以覆蓋剩餘生命時會處決。`;
}

export function renderCombatMonster(root, monster, options = {}) {
    if (!root || !monster) return;

    const currentHp = getMonsterCurrentHp(monster);
    const maxHp = getMonsterMaxHp(monster);
    const hpPercent = clampPercent((currentHp / maxHp) * 100);

    setImageOrTextIcon(
        root,
        '#battle-monster-icon, #monster-icon',
        monster.image || getGeneratedMonsterImage(monster.id),
        monster.name,
        monster.icon || options.fallbackIcon || '?'
    );
    setText(root, '#battle-monster-name, #monster-name', monster.name || options.fallbackName || '敵人');
    setText(root, '#battle-monster-level, #monster-level', monster.level ?? options.level ?? '?');
    setText(root, '#battle-monster-hp-text, #monster-hp-text', `${currentHp}/${maxHp}`);
    setText(root, '#battle-monster-atk, #monster-atk', getMonsterAttack(monster));
    setText(root, '#battle-monster-def, #monster-def', getMonsterDefense(monster));

    const hpBar = find(root, '#battle-monster-hp-bar, #monster-hp-fill');
    if (hpBar) hpBar.style.width = `${hpPercent}%`;
    renderMonsterPoisonAccumulator(root, monster, maxHp);
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
    const armorSlot = character.equipment?.armor || null;
    const offhandWeapon = isWeaponItem(armorSlot) ? armorSlot : null;
    setIcon(root, '#weapon-icon', weapon, '⚔️');
    setIcon(root, '#main-rhythm-icon', weapon, '⚔');
    setText(root, '#weapon-name', weapon?.name || options.unarmedName || '徒手攻擊');
    setText(root, '#main-rhythm-name', weapon?.name || options.unarmedName || '徒手');
    setText(root, '#weapon-damage', getTotalAttack(character));

    const weaponCard = find(root, '#action-weapon, #btn-attack');
    weaponCard?.querySelector('.weapon-trigger-condition')?.remove();

    const offhandCard = find(root, '#action-offhand');
    const offhandRing = find(root, '#offhand-rhythm-ring');
    if (offhandWeapon) {
        setIcon(root, '#offhand-icon', offhandWeapon, '⚔');
        setIcon(root, '#offhand-rhythm-icon', offhandWeapon, '⚔');
        setText(root, '#offhand-name', offhandWeapon.name || '副手武器');
        setText(root, '#offhand-rhythm-name', offhandWeapon.name || '副手');
        setText(root, '#offhand-damage', getItemAttackValue(offhandWeapon) || '--');
        offhandCard?.classList.remove('disabled');
        offhandRing?.classList.remove('is-disabled');
    } else {
        const shieldText = armorSlot ? '護具防守中' : '未裝副手';
        setIcon(root, '#offhand-icon', armorSlot, armorSlot ? '🛡' : '—');
        setIcon(root, '#offhand-rhythm-icon', null, '🛡');
        setText(root, '#offhand-name', shieldText);
        setText(root, '#offhand-rhythm-name', '未裝副手');
        setText(root, '#offhand-damage', '--');
        offhandCard?.classList.add('disabled');
        offhandRing?.classList.add('is-disabled');
    }

    const stack = getFirstConsumableStack(options.inventory || []);
    const potion = stack?.item || null;
    const quantity = Number(stack?.quantity ?? 0) || 0;
    const potionHeal = Number(potion?.effect?.hp) || 0;
    setIcon(root, '#potion-icon', potion, '🧪');
    setText(root, '#potion-name', potion?.name || options.emptyPotionName || '沒有補給');
    setText(root, '#potion-heal', potion ? (potionHeal > 0 ? `+${potionHeal}` : '可用') : '無');
    setText(root, '#potion-quantity', quantity > 0 ? `x${quantity}` : '無');

    const potionCard = find(root, '#action-potion, #btn-item');
    potionCard?.classList.toggle('disabled', !stack);
}

export function isCombatActionCooling(card) {
    return Boolean(card?.classList?.contains('is-cooling'));
}

export function clearCombatActionCooldown(card) {
    if (!card) return;
    if (card._combatCooldownFrame) {
        cancelAnimationFrame(card._combatCooldownFrame);
        card._combatCooldownFrame = null;
    }
    card.classList.remove('is-cooling');
    card.removeAttribute('aria-disabled');
    card.style.removeProperty('--cooldown-progress');
}

export function startCombatActionCooldown(card, durationSeconds = 1) {
    if (!card || isCombatActionCooling(card)) return false;

    const totalMs = Math.max(1, Number(durationSeconds) * 1000 || 1000);
    let ring = card.querySelector('.action-cooldown-ring');
    if (!ring) {
        ring = document.createElement('span');
        ring.className = 'action-cooldown-ring';
        ring.setAttribute('aria-hidden', 'true');
        ring.innerHTML = '<span class="action-cooldown-value">0</span>';
        card.appendChild(ring);
    }

    const startedAt = performance.now();
    card.classList.add('is-cooling');
    card.setAttribute('aria-disabled', 'true');
    card.style.setProperty('--cooldown-progress', '0%');

    const tick = () => {
        const elapsedRatio = Math.min(1, Math.max(0, (performance.now() - startedAt) / totalMs));
        card.style.setProperty('--cooldown-progress', `${elapsedRatio * 100}%`);
        if (elapsedRatio < 1) {
            card._combatCooldownFrame = requestAnimationFrame(tick);
        } else {
            clearCombatActionCooldown(card);
        }
    };
    card._combatCooldownFrame = requestAnimationFrame(tick);
    return true;
}

export function renderCombatBuffIndicators(container, character) {
    if (!container || !character) return;

    const passiveEffects = typeof character.getActivePassiveCombatEffects === 'function'
        ? character.getActivePassiveCombatEffects()
        : [];
    const entries = [];

    passiveEffects.forEach((effect, index) => {
        entries.push({
            effect,
            options: {
                key: `passive:${effect.id || effect.type || index}`,
                passive: true,
                polarity: 'positive',
                durationText: '∞',
                description: '常駐戰術技能'
            }
        });
    });

    getActiveSetBuffEntries(character).forEach(entry => entries.push(entry));

    const buffIcons = {
        atk: '⚔️',
        def: '🛡️',
        critChance: '🎯',
        critDamage: '💥',
        attackSpeed: '⚡',
        weaponTrigger: '⚔️',
        armorBreak: '🧨',
        poison: '☠️',
        burn: '🔥',
        bleed: '🩸',
        frozen: '❄️',
        slow: '🧊'
    };

    (character.activeBuffs || []).forEach((buff, index) => {
        entries.push({
            effect: {
                ...buff,
                icon: buff.icon || buffIcons[buff.type] || '✨',
                description: buff.description || (buff.value != null ? `+${buff.value}` : '')
            },
            options: {
                key: `buff:${buff.id || buff.type || index}:${index}`,
                polarity: 'positive',
                durationText: buff.durationText
            }
        });
    });

    (character.debuffs || []).forEach((debuff, index) => {
        entries.push({
            effect: {
                ...debuff,
                icon: debuff.icon || buffIcons[debuff.type] || '◆',
                description: debuff.description || `-${debuff.value ?? 0}`
            },
            options: {
                key: `debuff:${debuff.id || debuff.type || index}:${index}`,
                polarity: 'negative'
            }
        });
    });

    syncStatusIcons(container, entries);
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
        statusBuff: { text: options.label || '強化', className: 'damage-status damage-status-buff' },
        statusStun: { text: options.label || '暈眩', className: 'damage-status damage-status-stun' },
        statusSlow: { text: options.label || '緩速', className: 'damage-status damage-status-slow' },
        statusPoison: { text: options.label || '中毒', className: 'damage-status damage-status-poison' }
    }[type] || { text: `-${numericDamage}`, className: 'damage-normal' };

    playCombatDamageSound(type, numericDamage, options);

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
    // Normal hits rely on the damage number only. Repeated full-screen flashes made
    // real-time combat feel like the whole interface was flickering.
    if (type === 'critical' || type === 'crit') {
        triggerCombatImpact(root, { intensity: 'critical', flash: 'crit', slowMotion: true });
    }
    if (type === 'armorBreak' || type === 'armor_break') {
        triggerCombatImpact(root, { intensity: 'medium', flash: 'armorBreak' });
    }
    if (type === 'doubleStrike') {
        triggerCombatImpact(root, { intensity: 'combo' });
    }
    if (type === 'reflect') {
        triggerCombatImpact(root, { intensity: 'medium' });
    }
    if (type === 'revive') {
        triggerCombatImpact(root, { intensity: 'phase', flash: 'revive', slowMotion: true });
    }
    if (type === 'statusStun') {
        triggerCombatImpact(root, { intensity: 'medium', flash: 'thunder' });
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
    audioManager.play('victory', { throttleKey: 'combat-kill-freeze', throttleMs: 420 });
    surface.classList.add('combat-kill-freeze');
    triggerCombatImpact(surface, { intensity: 'medium', slowMotion: true });
    setTimeout(() => surface.classList.remove('combat-kill-freeze'), 420);
}

export function showCombatPhaseWarning(root, monster, phase = 2) {
    const surface = getCombatSurface(root);
    if (!surface) return;
    audioManager.play('boss-phase', { throttleKey: 'combat-boss-phase', throttleMs: 1200 });
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
    audioManager.play('player-hit', {
        throttleKey: 'combat-player-hit',
        throttleMs: 90,
        intensity: damagePercent > 15 ? 'heavy' : 'light'
    });
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
    if (damagePercent > 15) {
        triggerCombatImpact(root, { intensity: 'medium' });
    }
    setTimeout(() => battleContent.classList.remove(shakeClass), 400);
}
