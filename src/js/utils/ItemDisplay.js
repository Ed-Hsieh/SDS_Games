import { getItemDescription, normalizeItemType, readItemStat, readNumber } from '../models/ItemSchema.js';

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

export function getItemTypeText(type) {
    const normalized = normalizeItemType(type);
    return ITEM_TYPE_TEXT[normalized] || normalized || '未知類型';
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

    const rows = [];
    rows.push(statRow('atk', readItemStat(item, 'atk', ['attack'], 0)));
    rows.push(statRow('def', readItemStat(item, 'def', ['defense'], 0)));

    const durability = readItemStat(item, 'durability', ['dur'], undefined);
    if (durability !== undefined && durability !== null) {
        rows.push(statRow('durability', `${durability}/${item.maxDurability ?? 50}`, { label: '耐久度', raw: true }));
    }

    rows.push(statRow('hp', readItemStat(item, 'hp', [], 0), { label: item.type === 'potion' ? '恢復生命' : '生命' }));
    rows.push(statRow('critChance', readItemStat(item, 'critChance', ['crit_chance'], 0), { format: 'percent' }));
    rows.push(statRow('critDamage', readItemStat(item, 'critDamage', ['crit_damage'], 0), { format: 'multiplierPercent' }));
    rows.push(statRow('weaponSpeed', readItemStat(item, 'weaponSpeed', ['weapon_speed'], 0), { suffix: 'x' }));
    rows.push(statRow('attackSpeed', readItemStat(item, 'attackSpeed', ['attack_speed'], 0), { suffix: 'x' }));

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
