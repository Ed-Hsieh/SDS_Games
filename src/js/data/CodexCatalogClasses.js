import { EquipmentType, ItemType } from '../models/Enums.js';

export const CodexCategoryId = {
    EQUIPMENT: 'equipment',
    MATERIALS: 'materials',
    BLUEPRINTS: 'blueprints',
    ITEMS: 'items',
    MONSTERS: 'monsters'
};

export const CodexRarityRank = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5
};

export const CodexRarityText = {
    common: '普通',
    uncommon: '優良',
    rare: '稀有',
    epic: '史詩',
    legendary: '傳說'
};

export const CodexTypeText = {
    item: '物品',
    [EquipmentType.WEAPON]: '武器',
    [EquipmentType.ARMOR]: '防具',
    [EquipmentType.EQUIPMENT]: '防具',
    [EquipmentType.ACCESSORY]: '飾品',
    [ItemType.POTION]: '藥水',
    [ItemType.MATERIAL]: '素材',
    [ItemType.CURRENCY]: '貨幣',
    [ItemType.KEY]: '關鍵物',
    [ItemType.SCROLL]: '卷軸',
    [ItemType.BOOK]: '手記',
    [ItemType.QUEST]: '任務品',
    blueprint: '圖紙',
    consumable: '消耗品',
    achievement: '成就',
    casino: '賭場',
    rewardItem: '特殊物品',
    material: '素材',
    equipment: '裝備',
    none: '無',
    normal: '普通怪物',
    elite: '精英怪物',
    boss: '首領',
    world_boss: '世界首領',
    clue: '線索',
    relationship: '人物紀錄',
    town: '城鎮變化',
    event: '劇情事件',
    conclusion: '章節結論'
};

const EquipmentTypes = new Set([
    EquipmentType.WEAPON,
    EquipmentType.ARMOR,
    EquipmentType.EQUIPMENT,
    EquipmentType.ACCESSORY
]);

const SOURCE_TEXT = {
    equipment: '裝備資料',
    material: '素材資料',
    rewardItem: '特殊物品',
    casino: '賭場',
    shop: '市集',
    monster: '怪物掉落',
    recipe: '鍛造圖紙',
    storyDiscovery: '劇情發現'
};

function normalizeType(type) {
    return String(type || '').trim();
}

function normalizeNumber(value, fallback = null) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function compareNumber(a, b, direction) {
    const av = normalizeNumber(a, null);
    const bv = normalizeNumber(b, null);
    const aMissing = av === null ? 1 : 0;
    const bMissing = bv === null ? 1 : 0;
    if (aMissing !== bMissing) return aMissing - bMissing;
    return ((av || 0) - (bv || 0)) * direction;
}

function compareText(a, b, direction) {
    return String(a || '').localeCompare(String(b || ''), 'zh-Hant') * direction;
}

function getResultLevel(entry) {
    return normalizeNumber(entry?.result?.level ?? entry?.level, null);
}

export function getReadableCodexType(type) {
    return CodexTypeText[normalizeType(type)] || type || '未知';
}

export function getReadableCodexRarity(rarity) {
    return CodexRarityText[String(rarity || 'common')] || rarity || '普通';
}

export function getReadableSourceType(type) {
    return SOURCE_TEXT[type] || getReadableCodexType(type);
}

export function isEquipmentCodexEntry(entry = {}) {
    return EquipmentTypes.has(normalizeType(entry.type));
}

export function isMaterialCodexEntry(entry = {}) {
    return normalizeType(entry.type) === ItemType.MATERIAL || entry.sourceType === 'material';
}

export function getCodexItemCategory(entry = {}) {
    if (isEquipmentCodexEntry(entry)) return CodexCategoryId.EQUIPMENT;
    if (isMaterialCodexEntry(entry)) return CodexCategoryId.MATERIALS;
    return CodexCategoryId.ITEMS;
}

class BaseCodexClass {
    static id = '';
    static label = '';
    static prefix = 'CDX';
    static defaultSort = 'catalog';
    static filters = [['all', '全部']];
    static sorts = [['catalog', '預設']];

    static accepts() {
        return false;
    }

    static normalize(entry, index = 0) {
        const serial = String(index + 1).padStart(4, '0');
        return {
            ...entry,
            catalogCategory: this.id,
            catalogNo: entry.catalogNo || `${this.prefix}-${serial}`,
            catalogIndex: index + 1
        };
    }

    static getListMeta(entry) {
        return '';
    }

    static getSubtitle(entry) {
        return getReadableCodexType(entry.type);
    }

    static compare(a, b, sortKey, direction = 1) {
        switch (sortKey) {
            case 'level':
                return compareNumber(a.level, b.level, direction);
            case 'chapter':
                return compareNumber(a.chapter, b.chapter, direction);
            case 'rarity':
                return compareNumber(CodexRarityRank[a.rarity] || 0, CodexRarityRank[b.rarity] || 0, direction);
            case 'type':
                return compareText(getReadableCodexType(a.type), getReadableCodexType(b.type), direction);
            case 'resultLevel':
                return compareNumber(getResultLevel(a), getResultLevel(b), direction);
            case 'catalog':
            default:
                return compareNumber(a.catalogIndex, b.catalogIndex, direction);
        }
    }
}

export class EquipmentCodexClass extends BaseCodexClass {
    static id = CodexCategoryId.EQUIPMENT;
    static label = '裝備';
    static prefix = 'EQ';
    static defaultSort = 'catalog';
    static filters = [
        ['all', '全部'],
        [EquipmentType.WEAPON, '武器'],
        [EquipmentType.ARMOR, '防具'],
        [EquipmentType.EQUIPMENT, '防具'],
        [EquipmentType.ACCESSORY, '飾品'],
        ['common', '普通'],
        ['uncommon', '優良'],
        ['rare', '稀有'],
        ['epic', '史詩'],
        ['legendary', '傳說']
    ];
    static sorts = [
        ['catalog', '預設'],
        ['level', '等級'],
        ['chapter', '章節'],
        ['rarity', '稀有度']
    ];

    static accepts(entry) {
        return isEquipmentCodexEntry(entry);
    }

    static getListMeta(entry) {
        return entry.level != null ? `Lv.${entry.level}` : '';
    }

    static getSubtitle(entry) {
        return `${getReadableCodexType(entry.type)} / ${getReadableCodexRarity(entry.rarity)}`;
    }
}

export class MaterialCodexClass extends BaseCodexClass {
    static id = CodexCategoryId.MATERIALS;
    static label = '素材';
    static prefix = 'MAT';
    static defaultSort = 'catalog';
    static filters = [
        ['all', '全部'],
        ['common', '普通'],
        ['uncommon', '優良'],
        ['rare', '稀有'],
        ['epic', '史詩'],
        ['legendary', '傳說']
    ];
    static sorts = [
        ['catalog', '預設'],
        ['chapter', '章節'],
        ['rarity', '稀有度']
    ];

    static accepts(entry) {
        return isMaterialCodexEntry(entry);
    }

    static getListMeta(entry) {
        return '';
    }

    static getSubtitle(entry) {
        const usageCount = Array.isArray(entry.usageRefs) ? entry.usageRefs.length : 0;
        return usageCount > 0 ? `${getReadableCodexRarity(entry.rarity)} / ${usageCount} 種用途` : getReadableCodexRarity(entry.rarity);
    }
}

export class BlueprintCodexClass extends BaseCodexClass {
    static id = CodexCategoryId.BLUEPRINTS;
    static label = '圖紙';
    static prefix = 'BP';
    static defaultSort = 'catalog';
    static filters = [
        ['all', '全部'],
        [EquipmentType.WEAPON, '武器'],
        [EquipmentType.ARMOR, '防具'],
        [EquipmentType.EQUIPMENT, '防具'],
        [EquipmentType.ACCESSORY, '飾品'],
        [ItemType.POTION, '藥水'],
        ['uncommon', '優良'],
        ['rare', '稀有'],
        ['epic', '史詩'],
        ['legendary', '傳說']
    ];
    static sorts = [
        ['catalog', '預設'],
        ['resultLevel', '成品等級'],
        ['chapter', '章節'],
        ['rarity', '稀有度']
    ];

    static accepts() {
        return true;
    }

    static getListMeta(entry) {
        const level = getResultLevel(entry);
        return level != null ? `Lv.${level}` : '';
    }

    static getSubtitle(entry) {
        return `${getReadableCodexType(entry.result?.type || entry.type)} / ${getReadableCodexRarity(entry.rarity)}`;
    }
}

export class ItemCodexClass extends BaseCodexClass {
    static id = CodexCategoryId.ITEMS;
    static label = '物品';
    static prefix = 'ITM';
    static defaultSort = 'catalog';
    static filters = [
        ['all', '全部'],
        [ItemType.POTION, '藥水'],
        [ItemType.CURRENCY, '貨幣'],
        [ItemType.KEY, '關鍵物'],
        [ItemType.SCROLL, '卷軸'],
        [ItemType.BOOK, '手記'],
        [ItemType.QUEST, '任務品'],
        ['casino', '賭場'],
        ['rewardItem', '特殊物品'],
        ['common', '普通'],
        ['uncommon', '優良'],
        ['rare', '稀有'],
        ['epic', '史詩'],
        ['legendary', '傳說']
    ];
    static sorts = [
        ['catalog', '預設'],
        ['chapter', '章節'],
        ['rarity', '稀有度'],
        ['type', '類型']
    ];

    static accepts(entry) {
        return getCodexItemCategory(entry) === CodexCategoryId.ITEMS;
    }

    static getSubtitle(entry) {
        return `${getReadableCodexType(entry.type)} / ${getReadableCodexRarity(entry.rarity)}`;
    }
}

export class MonsterCodexClass extends BaseCodexClass {
    static id = CodexCategoryId.MONSTERS;
    static label = '怪物';
    static prefix = 'MON';
    static defaultSort = 'catalog';
    static filters = [
        ['all', '全部'],
        ['normal', '普通'],
        ['elite', '菁英'],
        ['boss', '首領'],
        ['world_boss', '世界首領']
    ];
    static sorts = [
        ['catalog', '預設'],
        ['level', '等級'],
        ['type', '類型']
    ];

    static accepts() {
        return true;
    }

    static getListMeta(entry) {
        return entry.level != null ? `Lv.${entry.level}` : '';
    }

    static getSubtitle(entry) {
        return `${getReadableCodexType(entry.rank || entry.type)} / ${entry.sourceLabel || '未知地點'}`;
    }

    static compare(a, b, sortKey, direction = 1) {
        if (sortKey === 'type') {
            return compareText(getReadableCodexType(a.rank || a.type), getReadableCodexType(b.rank || b.type), direction);
        }
        return super.compare(a, b, sortKey, direction);
    }
}

export const CodexCategoryClasses = {
    [CodexCategoryId.EQUIPMENT]: EquipmentCodexClass,
    [CodexCategoryId.MATERIALS]: MaterialCodexClass,
    [CodexCategoryId.BLUEPRINTS]: BlueprintCodexClass,
    [CodexCategoryId.ITEMS]: ItemCodexClass,
    [CodexCategoryId.MONSTERS]: MonsterCodexClass
};

export function getCodexClass(categoryId) {
    return CodexCategoryClasses[categoryId] || ItemCodexClass;
}

export function applyCodexClass(categoryId, entries = []) {
    const CodexClass = getCodexClass(categoryId);
    return entries.map((entry, index) => CodexClass.normalize(entry, index));
}

export function compareCodexEntries(categoryId, sortKey, direction, a, b) {
    const CodexClass = getCodexClass(categoryId);
    const primary = CodexClass.compare(a, b, sortKey, direction);
    if (primary !== 0) return primary;
    return compareNumber(a.catalogIndex, b.catalogIndex, 1)
        || compareText(a.name || a.id, b.name || b.id, 1);
}
