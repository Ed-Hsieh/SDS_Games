import GameManager from './GameManager.js';
import { questManager, ObjectiveType } from './QuestManager.js?v=dialogue-flow-20260712w';
import { calculateDrops } from './DropManager.js';
import { createMonsterInstance, getMonster } from './MonsterManager.js';
import { resolveItemById } from '../utils/ItemResolver.js';
import { getWeaponCombatProfile } from '../utils/WeaponCombatProfile.js';
import {
    getGeneratedItemImage,
    getGeneratedMonsterImage
} from '../data/AssetManifest.js';
import { markItemKnown } from './EncyclopediaManager.js';
import { buildMonsterCombatActions } from '../data/MonsterCombatProfiles.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const readNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

function scaleStat(value, levelDelta, growth, minimum = 1) {
    const delta = clamp(levelDelta, -12, 12);
    return Math.max(minimum, Math.round(readNumber(value, minimum) * Math.pow(growth, delta)));
}

function getItemAttack(item) {
    return readNumber(item?.stats?.attack ?? item?.stats?.atk ?? item?.attack ?? item?.atk, 0);
}

function getItemSpeed(item) {
    return Math.max(0.35, readNumber(item?.stats?.attackSpeed ?? item?.attackSpeed, 1));
}

function getWeaponEffect(item, fallback = 'sword') {
    if (!item) return fallback;
    return getWeaponCombatProfile({ equipment: { weapon: item } })?.id || fallback;
}

function buildWeaponEntry(item, character, monster, slot) {
    const isMain = slot === 'main';
    const enabled = isMain || Boolean(item);
    const attack = isMain
        ? Math.max(5, readNumber(character?.getTotalAtk?.(), character?.baseAtk || 5))
        : Math.max(4, readNumber(character?.baseAtk, 5) + getItemAttack(item));
    const defense = readNumber(monster?.defense ?? monster?.def, 0);
    const damage = Math.max(1, Math.round(attack - defense * (isMain ? 0.42 : 0.36)));
    const speed = item ? getItemSpeed(item) : 0.82;
    const effect = getWeaponEffect(item, isMain ? 'heavy' : 'dagger');
    const icon = item ? getGeneratedItemImage(item) : '';
    const element = String(item?.element || item?.affinity || '').toLowerCase();

    return {
        id: item?.id || (isMain ? 'unarmed' : 'empty_offhand'),
        name: item?.name || (isMain ? '徒手' : '未裝備'),
        icon,
        effect,
        damage,
        cooldown: Math.max(0.32, 1 / speed),
        windup: ['heavy', 'focus'].includes(effect) ? 0.2 : 0.09,
        critDamage: readNumber(character?.getCritDamage?.(), 1.5),
        enabled,
        triggerBuff: element ? {
            id: `${item.id}_${element}_weapon_effect`,
            name: `${item.name} · ${element}`,
            icon,
            duration: 6,
            modifiers: {}
        } : null
    };
}

export function createCombatEncounter(monster, options = {}) {
    if (!monster) return null;
    const character = GameManager.getCharacter();
    const armorSlot = character?.equipment?.armor;
    const offhand = String(armorSlot?.type || '').toLowerCase() === 'weapon' ? armorSlot : null;
    const loadout = {
        main: buildWeaponEntry(character?.equipment?.weapon, character, monster, 'main'),
        offhand: buildWeaponEntry(offhand, character, monster, 'offhand')
    };
    const playerDefense = Math.max(0, readNumber(character?.getTotalDef?.(), character?.baseDef || 0));

    return {
        monster,
        habitat: options.habitat || null,
        tile: options.tile || null,
        canFlee: options.canFlee ?? !monster.isBoss,
        fleeRejectedText: options.fleeRejectedText,
        victoryActionLabel: options.victoryActionLabel,
        defeatActionLabel: options.defeatActionLabel,
        escapeActionLabel: options.escapeActionLabel,
        visual: {
            id: monster.id,
            name: monster.name,
            className: options.className || `${monster.isElite ? '菁英' : '野外'} · ${options.areaName || '未知區域'}`,
            level: monster.level,
            maxHp: monster.maxHp,
            image: getGeneratedMonsterImage(monster.id),
            background: options.background || options.tile?.image || '',
            backgroundAlt: options.backgroundAlt || options.tile?.title || options.areaName || '',
            visualScale: options.visualScale || (monster.isElite ? '1.02' : '0.94'),
            feed: options.feed || `${monster.name}進入攻擊距離。`,
            initialDelay: 1.2,
            attacks: buildMonsterCombatActions(monster, playerDefense)
        },
        player: {
            name: character?.name || '玩家',
            maxHp: Math.max(1, readNumber(character?.maxHp, 120)),
            hp: Math.max(1, readNumber(character?.hp, 120)),
            potions: 0,
            potionHeal: 30,
            potionCooldown: 1.2,
            buffs: []
        },
        loadout,
        context: options.context || {}
    };
}

export function createLocationEncounter(sample, tile) {
    const template = getMonster(sample?.monsterId);
    if (!template || !sample?.habitat) return null;

    const monster = createMonsterInstance(template);
    const targetLevel = Math.max(1, Math.round(readNumber(sample.targetLevel, template.level || 1)));
    const levelDelta = targetLevel - Math.max(1, readNumber(template.level, targetLevel));
    monster.level = targetLevel;
    monster.hp = scaleStat(monster.hp, levelDelta, 1.14, 8);
    monster.maxHp = monster.hp;
    monster.currentHp = monster.hp;
    monster.attack = scaleStat(monster.attack, levelDelta, 1.085, 2);
    monster.atk = monster.attack;
    monster.defense = scaleStat(monster.defense, levelDelta, 1.075, 0);
    monster.def = monster.defense;
    monster.exp = scaleStat(monster.exp, levelDelta, 1.08, 1);
    monster.gold = scaleStat(monster.gold, levelDelta, 1.06, 0);
    monster.encounter = {
        habitatId: sample.habitat.id,
        habitatName: sample.habitat.name,
        chapter: sample.habitat.chapter,
        threat: sample.habitat.threat,
        targetLevel
    };

    return createCombatEncounter(monster, {
        habitat: sample.habitat,
        tile,
        areaName: sample.habitat.name,
        className: `${monster.isElite ? '菁英' : '野外'} · ${sample.habitat.name}`,
        feed: `${monster.name}從${sample.habitat.name}的遮蔽物後逼近。`,
        victoryActionLabel: '收下戰利品並返回地圖',
        escapeActionLabel: '返回地圖'
    });
}

export function settleEncounterVictory(encounter) {
    const monster = encounter.monster;
    const character = GameManager.getCharacter();
    const drops = calculateDrops(monster).map((drop, index) => {
        const item = resolveItemById(drop.itemId, {
            order: ['material', 'equipment', 'shop', 'bossEquipment', 'questReward']
        });
        return {
            ...drop,
            dropId: `${encounter.monster.id}:${index}:${drop.itemId}`,
            item,
            decision: item ? 'pending' : 'unavailable',
            stored: item ? null : 'missing'
        };
    });

    character.exp += Math.max(0, readNumber(monster.exp, 0));
    character.checkLevelUp?.();
    GameManager.addGold(Math.max(0, readNumber(monster.gold, 0)));
    questManager.updateProgress(ObjectiveType.KILL, monster.id, 1);
    GameManager.notify('all');

    return {
        exp: Math.max(0, readNumber(monster.exp, 0)),
        gold: Math.max(0, readNumber(monster.gold, 0)),
        drops
    };
}

export function resolveEncounterDrop(drop, decision) {
    if (!drop || drop.decision !== 'pending') return drop;
    if (decision === 'discard') {
        drop.decision = 'discarded';
        drop.stored = 'discarded';
        return drop;
    }

    const item = drop.item;
    if (!item) {
        drop.decision = 'unavailable';
        drop.stored = 'missing';
        return drop;
    }
    const quantity = Math.max(1, Number(drop.quantity) || 1);
    const added = GameManager.addToInventory(item, quantity);
    const stored = added
        ? 'inventory'
        : (GameManager.addToWarehouse(item, quantity) ? 'warehouse' : 'missing');
    drop.stored = stored;
    drop.decision = stored === 'missing' ? 'pending' : 'claimed';
    if (drop.decision === 'claimed') markItemKnown(item.id);
    GameManager.notify('all');
    return drop;
}
