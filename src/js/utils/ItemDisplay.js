import { getItemDescription, normalizeItemType, readEquipmentStats, readItemStat, readNumber } from '../models/ItemSchema.js';

export const ITEM_TYPE_TEXT = {
    weapon: '武器',
    armor: '防具',
    accessory: '飾品',
    potion: '藥水',
    scroll: '卷軸',
    material: '材料',
    currency: '貨幣',
    key: '鑰匙',
    book: '書籍',
    quest: '任務道具'
};

export const ITEM_RARITY_TEXT = {
    common: '普通',
    uncommon: '優良',
    rare: '稀有',
    epic: '史詩',
    legendary: '傳說'
};

export const STAT_LABELS = {
    atk: '攻擊力',
    attack: '攻擊力',
    def: '防禦力',
    defense: '防禦力',
    hp: '生命',
    durability: '耐久度',
    critChance: '暴擊率',
    critDamage: '暴擊傷害',
    attackSpeed: '攻擊速度',
    attackSpeedBonus: '攻擊速度加成',
    weaponSpeed: '武器速度',
    lifesteal: '生命偷取',
    damageReduction: '傷害減免',
    hpRegen: '生命恢復',
    fireDamage: '火焰傷害',
    iceDamage: '冰霜傷害',
    thunderDamage: '雷電傷害',
    voidDamage: '虛空傷害',
    fire: '火屬性',
    ice: '冰屬性',
    thunder: '雷屬性',
    poison: '毒屬性',
    light: '光屬性',
    slowChance: '緩速機率',
    stunChance: '暈眩機率',
    dodgeChance: '閃避率',
    armorPenetration: '護甲穿透',
    bossBonus: 'Boss 傷害',
    allStats: '全屬性',
    double_strike: '雙重打擊',
    execute: '處決',
    damage_reflect: '反傷',
    gold_bonus: '金幣加成',
    exp_bonus: '經驗加成',
    drop_bonus: '掉落加成',
    revive: '復活',
    noDurabilityLoss: '不消耗耐久'
};

export const STAT_ICONS = {
    atk: '⚔️',
    def: '🛡️',
    hp: '❤️',
    durability: '🔧',
    critChance: '💥',
    critDamage: '🔥',
    attackSpeed: '⚡',
    attackSpeedBonus: '⚡',
    weaponSpeed: '⏱️'
};

export const PERCENT_STATS = new Set([
    'critChance',
    'critDamage',
    'attackSpeed',
    'attackSpeedBonus',
    'lifesteal',
    'damageReduction',
    'dodgeChance',
    'slowChance',
    'stunChance',
    'armorPenetration',
    'bossBonus',
    'allStats',
    'fireDamage',
    'iceDamage',
    'thunderDamage',
    'voidDamage',
    'fire',
    'ice',
    'thunder',
    'poison',
    'light',
    'double_strike',
    'execute',
    'damage_reflect',
    'gold_bonus',
    'exp_bonus',
    'drop_bonus',
    'revive'
]);

export function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function renderAtlasIconHtml(atlas, extraClass = '') {
    if (!atlas) return '';
    const row = Number(atlas.row) || 0;
    const col = Number(atlas.col) || 0;
    const className = ['item-atlas-icon', extraClass].filter(Boolean).join(' ');
    return `<span class="${escapeHtml(className)}" style="--atlas-row:${row}; --atlas-col:${col};" aria-hidden="true"></span>`;
}

export function getItemVisualHtml(item, fallbackIcon = '◆', extraClass = '') {
    if (item?.atlas) {
        return renderAtlasIconHtml(item.atlas, extraClass);
    }
    if (item?.image) {
        const classAttribute = extraClass ? ` class="${escapeHtml(extraClass)}"` : '';
        return `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name || '')}"${classAttribute}>`;
    }
    return escapeHtml(item?.icon || fallbackIcon);
}

function formatPlainNumber(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return value;
    return Math.abs(number % 1) > 0 ? number.toFixed(2).replace(/\.?0+$/, '') : String(number);
}

export function normalizePercentValue(value) {
    const number = readNumber(value, 0);
    return Math.abs(number) <= 1 ? number * 100 : number;
}

export function normalizeMultiplierPercentValue(value) {
    const number = readNumber(value, 0);
    return Math.abs(number) <= 10 ? number * 100 : number;
}

function formatPercent(value) {
    return `${formatPlainNumber(normalizePercentValue(value))}%`;
}

function formatMultiplierPercent(value) {
    return `${formatPlainNumber(normalizeMultiplierPercentValue(value))}%`;
}

export function isPercentStat(key) {
    if (!key) return false;
    return PERCENT_STATS.has(key)
        || key.includes('Chance')
        || key.includes('Reduction')
        || key.toLowerCase().includes('steal');
}

export function getStatLabel(key) {
    return STAT_LABELS[key] || key;
}

export function getStatIcon(key) {
    return STAT_ICONS[key] || (isPercentStat(key) ? '✨' : '');
}

function normalizeStatKey(key) {
    if (!key) return key;

    const raw = String(key);
    const normalized = raw.toLowerCase();
    const aliases = {
        attack: 'atk',
        defense: 'def',
        critchance: 'critChance',
        crit_chance: 'critChance',
        critdamage: 'critDamage',
        crit_damage: 'critDamage',
        attackspeed: 'attackSpeed',
        attack_speed: 'attackSpeed',
        weaponspeed: 'weaponSpeed',
        weapon_speed: 'weaponSpeed',
        lifesteal: 'lifesteal',
        life_steal: 'lifesteal',
        damagereduction: 'damageReduction',
        damage_reduction: 'damageReduction',
        dodgechance: 'dodgeChance',
        dodge_chance: 'dodgeChance',
        armorpenetration: 'armorPenetration',
        armor_penetration: 'armorPenetration',
        allstats: 'allStats',
        all_stats: 'allStats',
        doublestrike: 'double_strike',
        double_strike: 'double_strike',
        damagereflect: 'damage_reflect',
        damage_reflect: 'damage_reflect',
        goldbonus: 'gold_bonus',
        gold_bonus: 'gold_bonus',
        expbonus: 'exp_bonus',
        exp_bonus: 'exp_bonus',
        dropbonus: 'drop_bonus',
        drop_bonus: 'drop_bonus',
        hpregen: 'hpRegen',
        hp_regen: 'hpRegen',
        slowchance: 'slowChance',
        slow_chance: 'slowChance',
        stunchance: 'stunChance',
        stun_chance: 'stunChance',
        bossbonus: 'bossBonus',
        boss_bonus: 'bossBonus',
        voiddamage: 'voidDamage',
        void_damage: 'voidDamage'
    };

    return aliases[normalized] || raw;
}

function statRow(key, value, options = {}) {
    if (value === undefined || value === null || value === 0) return '';

    const label = options.label || STAT_LABELS[key] || key;
    const icon = options.icon || STAT_ICONS[key] || '';
    const formatted = options.raw
        ? String(value)
        : options.format === 'multiplierPercent'
        ? formatMultiplierPercent(value)
        : options.format === 'percent'
        ? formatPercent(value)
        : options.suffix
            ? `${formatPlainNumber(value)}${options.suffix}`
            : `+${formatPlainNumber(value)}`;

    return `<div class="item-detail-stat"><span>${escapeHtml(`${icon ? `${icon} ` : ''}${label}`)}</span><span class="value">${escapeHtml(formatted)}</span></div>`;
}

function readDisplayStat(item, primaryKey, aliases = [], format = 'number', fallback = undefined) {
    const rawValue = readItemStat(item, primaryKey, aliases, fallback);
    if (rawValue === undefined || rawValue === null) return undefined;

    const number = Number(rawValue);
    if (!Number.isFinite(number)) return undefined;

    if (format === 'percent') return normalizePercentValue(number);
    if (format === 'multiplierPercent') return normalizeMultiplierPercentValue(number);
    return number;
}

function collectBonusStats(item) {
    const bonusStats = {};

    const addContribution = (key, rawValue) => {
        if (rawValue === undefined || rawValue === null || rawValue === 0) return;

        const normalizedKey = normalizeStatKey(key);
        const number = Number(rawValue);
        if (!Number.isFinite(number)) return;

        const displayValue = isPercentStat(normalizedKey) ? normalizePercentValue(number) : number;
        if (displayValue === 0) return;

        const displayKey = normalizedKey === 'attackSpeed' ? 'attackSpeedBonus' : normalizedKey;
        bonusStats[displayKey] = (bonusStats[displayKey] || 0) + displayValue;
    };

    if (Array.isArray(item?.affixes) && item.affixes.length > 0) {
        item.affixes.forEach(affix => {
            if (!affix?.stats) return;
            for (const [key, value] of Object.entries(affix.stats)) {
                addContribution(key, value);
            }
        });
    } else if (item?.affixBonuses) {
        for (const [key, value] of Object.entries(item.affixBonuses)) {
            addContribution(key, value);
        }
    }

    if (item?.enhancementBonuses) {
        for (const [key, value] of Object.entries(item.enhancementBonuses)) {
            addContribution(key, value);
        }
    }

    if (Array.isArray(item?.specialEffects) && item.specialEffects.length > 0) {
        item.specialEffects.forEach(effect => {
            if (!effect?.type) return;
            addContribution(effect.type, effect.value);
        });
    }

    return bonusStats;
}

export function buildItemStatEntries(item, options = {}) {
    if (!item) return [];

    const normalizedType = normalizeItemType(item.type);
    const equipmentStats = isEquipmentType(normalizedType)
        ? readEquipmentStats(item, normalizedType)
        : null;
    const includePotionRecovery = options.includePotionRecovery !== false;
    const bonusStats = collectBonusStats(item);
    const entries = [];
    const hasExplicitStat = (primaryKey, aliases = []) => readItemStat(item, primaryKey, aliases, null) !== null;

    const push = (key, baseValue, entryOptions = {}) => {
        const normalizedKey = normalizeStatKey(key);
        const bonusKey = entryOptions.bonusKey || normalizedKey;
        const bonus = bonusStats[bonusKey] || 0;
        const base = baseValue ?? 0;

        if ((baseValue === undefined || baseValue === null || base === 0) && bonus === 0) return;

        entries.push({
            key: normalizedKey,
            icon: entryOptions.icon ?? getStatIcon(normalizedKey),
            label: entryOptions.label ?? getStatLabel(normalizedKey),
            base,
            bonus,
            suffix: entryOptions.suffix || '',
            max: entryOptions.max
        });
    };

    push('atk', equipmentStats ? equipmentStats.atk : readDisplayStat(item, 'atk', ['attack']));
    push('def', equipmentStats ? equipmentStats.def : readDisplayStat(item, 'def', ['defense']));

    if (equipmentStats && equipmentStats.durability !== null) {
        const durability = equipmentStats.durability;
        if (durability !== undefined && durability !== null) {
            push('durability', durability, { max: equipmentStats.maxDurability ?? durability });
        }
    }

    if (includePotionRecovery || normalizedType !== 'potion') {
        const hpLabel = normalizedType === 'potion' || normalizedType === 'consumable' ? '恢復生命' : getStatLabel('hp');
        push('hp', readDisplayStat(item, 'hp'), { label: hpLabel });
    }

    push('critChance', equipmentStats ? normalizePercentValue(equipmentStats.critChance) : readDisplayStat(item, 'critChance', ['crit_chance'], 'percent'), { suffix: '%' });
    push('critDamage', equipmentStats ? normalizeMultiplierPercentValue(equipmentStats.critDamage) : readDisplayStat(item, 'critDamage', ['crit_damage'], 'multiplierPercent'), { suffix: 'critMultiplier' });
    if (normalizedType === 'weapon' || hasExplicitStat('weaponSpeed', ['weapon_speed'])) {
        push('weaponSpeed', equipmentStats ? equipmentStats.weaponSpeed : readDisplayStat(item, 'weaponSpeed', ['weapon_speed']), { suffix: 'x' });
    }
    if (normalizedType === 'weapon' || hasExplicitStat('attackSpeed', ['attack_speed'])) {
        push('attackSpeed', equipmentStats ? equipmentStats.attackSpeed : readDisplayStat(item, 'attackSpeed', ['attack_speed']), { suffix: 's' });
    }

    for (const [key, value] of Object.entries(bonusStats)) {
        const normalizedKey = normalizeStatKey(key);
        if (!value || entries.some(entry => entry.key === normalizedKey)) continue;
        entries.push({
            key: normalizedKey,
            icon: getStatIcon(normalizedKey),
            label: getStatLabel(normalizedKey),
            base: 0,
            bonus: value,
            suffix: isPercentStat(normalizedKey) ? '%' : ''
        });
    }

    return entries;
}

function formatEntryNumber(value) {
    return formatPlainNumber(value);
}

export function formatItemStatEntryValue(entry, value, options = {}) {
    const prefix = options.prefix ?? '+';

    if (entry.suffix === 's') {
        const speed = Number(value);
        if (!Number.isFinite(speed) || speed <= 0) return '—';
        const seconds = 1 / speed;
        return `${formatEntryNumber(seconds)} Sec/Hit`;
    }

    if (entry.suffix === 'critMultiplier') {
        const multiplier = Number(value) / 100;
        if (!Number.isFinite(multiplier)) return '—';
        return `x${formatEntryNumber(multiplier)}`;
    }

    if (entry.suffix === '%') return `${prefix}${formatEntryNumber(value)}%`;
    if (entry.suffix === 'x') return `${formatEntryNumber(value)}x`;
    if (entry.key === 'durability' && options.includeMax && entry.max !== undefined && entry.max !== null) {
        return `${formatEntryNumber(value)}/${formatEntryNumber(entry.max)}`;
    }
    return `${prefix}${formatEntryNumber(value)}`;
}

export function formatItemStatEntryTotal(entry, options = {}) {
    const total = Number(entry?.base || 0) + Number(entry?.bonus || 0);
    const prefix = options.prefix ?? (
        entry?.key === 'durability' || entry?.suffix === 'x' || entry?.suffix === 'critMultiplier'
            ? ''
            : '+'
    );

    return formatItemStatEntryValue(entry, total, {
        includeMax: options.includeMax !== false,
        prefix
    });
}

export function buildItemStatChipsHtml(item, options = {}) {
    const entries = buildItemStatEntries(item, options);
    const limit = Number.isFinite(Number(options.limit)) ? Number(options.limit) : entries.length;
    const visibleEntries = entries.slice(0, Math.max(0, limit));
    const chipClass = options.chipClass || 'item-stat-chip';

    if (visibleEntries.length === 0) {
        return options.emptyText
            ? `<span class="${escapeHtml(chipClass)} is-empty">${escapeHtml(options.emptyText)}</span>`
            : '';
    }

    const html = visibleEntries.map(entry => `
        <span class="${escapeHtml(chipClass)}">
            <span>${escapeHtml(`${entry.icon ? `${entry.icon} ` : ''}${entry.label}`)}</span>
            <strong>${escapeHtml(formatItemStatEntryTotal(entry))}</strong>
        </span>
    `).join('');

    const hiddenCount = entries.length - visibleEntries.length;
    if (hiddenCount > 0 && options.showMore !== false) {
        return `${html}<span class="${escapeHtml(chipClass)} is-more">+${hiddenCount}</span>`;
    }

    return html;
}

function statEntryRow(entry) {
    const base = Number(entry.base || 0);
    const bonus = Number(entry.bonus || 0);
    const total = base + bonus;

    if (!Number.isFinite(total) || total === 0) return '';

    const label = entry.label || getStatLabel(entry.key);
    const icon = entry.icon || getStatIcon(entry.key);
    const value = formatItemStatEntryTotal(entry);
    const bonusSign = bonus > 0 ? '+' : '-';
    const bonusText = bonus !== 0
        ? ` (${bonusSign}${formatItemStatEntryValue(entry, Math.abs(bonus), { prefix: '' })})`
        : '';

    return `<div class="item-detail-stat"><span>${escapeHtml(`${icon ? `${icon} ` : ''}${label}`)}</span><span class="value">${escapeHtml(`${value}${bonusText}`)}</span></div>`;
}

export function getItemTypeText(type) {
    const normalized = normalizeItemType(type);
    return ITEM_TYPE_TEXT[normalized] || normalized || '未知類型';
}

export function getItemRarityText(rarity) {
    const normalized = String(rarity || 'common').toLowerCase();
    return ITEM_RARITY_TEXT[normalized] || rarity || '普通';
}

export function buildItemDisplayModel(item, options = {}) {
    const rarity = item?.rarity || options.rarity || 'common';
    return {
        id: item?.id || options.id || '',
        name: item?.name || options.name || '未知物品',
        icon: item?.icon || options.icon || '◆',
        image: item?.image || options.image || '',
        atlas: item?.atlas || options.atlas || null,
        type: item?.type || options.type || '',
        rarity,
        typeText: options.typeText ?? getItemTypeText(item?.type || options.type),
        rarityText: options.rarityText ?? getItemRarityText(rarity),
        description: options.description ?? getItemDisplayDescription(item, ''),
        stats: buildItemStatEntries(item, options)
    };
}

export function isEquipmentType(type) {
    const normalized = normalizeItemType(type);
    return normalized === 'weapon' || normalized === 'armor' || normalized === 'accessory';
}

export function shouldDisplayDurability(item) {
    return Boolean(item && isEquipmentType(item.type));
}

export function getItemDisplayDescription(item, fallback = '沒有描述') {
    return getItemDescription(item) || fallback;
}

export function formatAffixStats(stats) {
    if (!stats) return '';

    const parts = [];
    for (const [key, value] of Object.entries(stats)) {
        const label = STAT_LABELS[key] || key;
        if (key === 'noDurabilityLoss') {
            parts.push(label);
        } else if (isPercentStat(key)) {
            parts.push(`${label}+${formatPercent(value)}`);
        } else {
            parts.push(`${label}+${formatPlainNumber(value)}`);
        }
    }

    return parts.join(', ');
}

export function buildItemStatsHtml(item, options = {}) {
    if (!item) return '';

    const rows = buildItemStatEntries(item, options).map(statEntryRow);
    let html = rows.filter(Boolean).join('');
    if (options.includeAffixes !== false && Array.isArray(item.affixes) && item.affixes.length > 0) {
        const affixes = item.affixes.map(affix => {
            const name = escapeHtml(affix.name || '詞綴');
            const rarity = escapeHtml(affix.rarity || '');
            const stats = escapeHtml(formatAffixStats(affix.stats));
            return `<div class="item-affix ${rarity}"><span class="affix-name">${name}</span><span class="affix-stats">${stats}</span></div>`;
        }).join('');
        html += `<div class="item-affixes-section"><div class="affixes-title">✨ 詞綴</div>${affixes}</div>`;
    }

    const enhancementMarks = Object.values(item.enhancementMarks || {})
        .sort((a, b) => (a.milestone || 0) - (b.milestone || 0));
    if (enhancementMarks.length > 0) {
        const marks = enhancementMarks.map(mark => {
            const rarity = escapeHtml(mark.rarity || 'rare');
            const name = escapeHtml(mark.label || `+${mark.milestone} 強化印記`);
            const stats = escapeHtml(mark.stats ? formatAffixStats(mark.stats) : formatAffixStats({ [mark.stat]: mark.value }));
            return `<div class="item-affix ${rarity}"><span class="affix-name">+${mark.milestone} ${name}</span><span class="affix-stats">${stats}</span></div>`;
        }).join('');
        html += `<div class="item-affixes-section"><div class="affixes-title">⚒️ 強化印記</div>${marks}</div>`;
    }

    return html;
}

export function buildItemModalOptions(item, options = {}) {
    return {
        typeText: options.typeText ?? getItemTypeText(item?.type),
        description: options.description ?? getItemDisplayDescription(item),
        statsHtml: options.statsHtml ?? buildItemStatsHtml(item, options)
    };
}
