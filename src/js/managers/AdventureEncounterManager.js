import GameManager from './GameManager.js';
import { questManager } from './QuestManager.js';
import { ObjectiveType } from '../data/Quests.js';
import { calculateDrops } from './DropManager.js';
import { createMonsterInstance, getMonster } from './MonsterManager.js';
import { resolveItemById } from '../utils/ItemResolver.js';
import {
    getWeaponCombatElement,
    getWeaponCombatProfile
} from '../utils/WeaponCombatProfile.js';
import {
    getGeneratedItemImage,
    getGeneratedMonsterImage
} from '../data/AssetManifest.js';
import { markItemKnown } from './EncyclopediaManager.js';
import { resolveBattleBlueprintUnlocks } from './BlueprintManager.js';
import {
    getEquipmentEffectTotals,
    getRewardEffectTotals
} from './EquipmentEffectResolver.js';
import { buildMonsterCombatActions } from '../data/MonsterCombatProfiles.js';

const readNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

function getItemAttack(item) {
    return readNumber(item?.attack, 0);
}

function getItemSpeed(item) {
    return Math.max(0.35, readNumber(item?.attackSpeed, 1));
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
    const defense = readNumber(monster?.defense, 0);
    const damage = Math.max(1, Math.round(attack - defense * (isMain ? 0.42 : 0.36)));
    const speed = item ? getItemSpeed(item) : 0.82;
    const profile = getWeaponCombatProfile({ equipment: { weapon: item } });
    const effect = profile?.id || getWeaponEffect(item, isMain ? 'heavy' : 'dagger');
    const icon = item ? getGeneratedItemImage(item) : '';
    const element = getWeaponCombatElement(item);
    const combatEffects = item
        ? getEquipmentEffectTotals({ equipment: { weapon: item } }, {
            includeSetBonuses: false,
            includePassiveEffects: false
        })
        : null;

    return {
        id: item?.id || (isMain ? 'unarmed' : 'empty_offhand'),
        name: item?.name || (isMain ? '徒手' : '未裝備'),
        icon,
        effect,
        profile,
        element,
        hasArmor: Boolean(character?.equipment?.armor && String(character.equipment.armor.type || '').toLowerCase() !== 'weapon'),
        monsterDefense: defense,
        damage,
        cooldown: Math.max(0.32, 1 / speed),
        windup: ['heavy', 'focus'].includes(effect) ? 0.2 : 0.09,
        critDamage: readNumber(character?.getCritDamage?.(), 1.5),
        lifesteal: Math.max(0, readNumber(combatEffects?.lifesteal, 0)),
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
    const mainWeapon = character?.equipment?.weapon || null;
    const armorSlot = character?.equipment?.armor;
    const offhand = mainWeapon && String(armorSlot?.type || '').toLowerCase() === 'weapon' ? armorSlot : null;
    const loadout = {
        main: buildWeaponEntry(mainWeapon, character, monster, 'main'),
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
    const fixedLevel = Math.max(1, Math.round(readNumber(template.level, 1)));
    monster.level = fixedLevel;
    monster.encounter = {
        habitatId: sample.habitat.id,
        habitatName: sample.habitat.name,
        chapter: sample.habitat.chapter,
        threat: sample.habitat.threat,
        fixedLevel
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
    const rewardEffects = getRewardEffectTotals(character);
    const dungeonId = encounter?.context?.dungeonId || encounter?.context?.dungeonType || null;
    const baseGold = Array.isArray(monster.gold)
        ? monster.gold[0] + Math.floor(Math.random() * (monster.gold[1] - monster.gold[0] + 1))
        : Math.max(0, readNumber(monster.gold, 0));
    const gold = Math.floor(baseGold * (1 + (rewardEffects.goldBonus || 0) / 100));
    const exp = Math.floor(Math.max(0, readNumber(monster.exp, 0)) * (1 + (rewardEffects.expBonus || 0) / 100));
    const drops = calculateDrops(monster, {
        dungeonId,
        dropBonus: rewardEffects.dropBonus || 0
    }).map((drop, index) => {
        const item = resolveItemById(drop.itemId, {
            order: ['material', 'equipment', 'shop', 'bossEquipment', 'rewardItem']
        });
        return {
            ...drop,
            dropId: `${encounter.monster.id}:${index}:${drop.itemId}`,
            item,
            decision: item ? 'pending' : 'unavailable',
            stored: item ? null : 'missing'
        };
    });
    const blueprintUnlocks = resolveBattleBlueprintUnlocks({
        monster,
        dungeonId
    });

    GameManager.addCharacterExperience(exp, { reason: 'combat-victory', notify: false });
    GameManager.addGold(gold);
    questManager.updateProgress(ObjectiveType.KILL, monster.id, 1);
    GameManager.markSaveDirty?.('combat-victory');
    GameManager.notify('all');

    return {
        exp,
        gold,
        rows: blueprintUnlocks.map(unlock => ({
            label: unlock.seriesId ? '工藝系列' : '製作藍圖',
            value: unlock.series?.name || unlock.recipe?.name || unlock.recipeId
        })),
        blueprintUnlocks,
        drops
    };
}

export function createPrologueTutorialEncounter(habitat, tile) {
    const encounter = createLocationEncounter({
        monsterId: 'blood_moon_stag',
        habitat
    }, tile);
    if (!encounter) return null;

    encounter.canFlee = false;
    encounter.defeatActionLabel = '失去意識';
    encounter.victoryActionLabel = '繼續前進';
    encounter.visual = {
        ...encounter.visual,
        name: '迷霧中的巨影',
        className: '未知巨獸 · 異常個體',
        level: '??',
        maxHp: 1200,
        background: 'src/assets/images/art/scenes/world/landmarks/south-road-broken.webp',
        backgroundAlt: '黑根蔓延的南路斷坡',
        visualScale: '1.08',
        concealIdentity: true,
        feed: '霧裡的巨角壓低了。牠沒有退路，也沒有理智。',
        initialDelay: 2.2,
        attacks: [
            {
                id: 'prologue_stag_rake',
                name: '裂土踏擊',
                effect: 'crush',
                damage: 14,
                telegraph: 1.45,
                impactDelay: 0.3,
                recovery: 1.7
            },
            {
                id: 'prologue_stag_sweep',
                name: '亂角橫掃',
                effect: 'claw',
                damage: 18,
                telegraph: 1.65,
                impactDelay: 0.28,
                recovery: 1.8
            },
            {
                id: 'prologue_stag_charge',
                name: '斷坡衝撞',
                effect: 'crush',
                damage: 999,
                telegraph: 2.1,
                impactDelay: 0.42,
                recovery: 2
            }
        ]
    };
    encounter.player = {
        ...encounter.player,
        hp: Math.min(encounter.player.maxHp, 72),
        potions: 1,
        potionHeal: 30
    };
    encounter.loadout = {
        ...encounter.loadout,
        main: {
            ...encounter.loadout.main,
            id: 'prologue_hunter_blade',
            name: '公會制式獵刀',
            damage: 9,
            cooldown: 0.9,
            windup: 0.09,
            critDamage: 1.5,
            enabled: true,
            triggerBuff: null
        },
        offhand: {
            ...encounter.loadout.offhand,
            id: 'prologue_hunter_knife',
            name: '公會副手獵刀',
            effect: 'dagger',
            damage: 6,
            cooldown: 0.72,
            enabled: true,
            triggerBuff: null
        }
    };
    encounter.context = {
        ...(encounter.context || {}),
        prologueTutorial: true,
        prologueIssuedGear: Object.freeze({
            weapon: '公會制式獵刀',
            armor: '公會外勤皮甲'
        })
    };
    encounter.monster.exp = 0;
    encounter.monster.gold = 0;
    encounter.monster.drops = [];
    encounter.monster.equipmentDrops = [];
    return encounter;
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
    const stored = added ? 'inventory' : 'inventory-full';
    drop.stored = stored;
    drop.decision = stored === 'inventory-full' ? 'pending' : 'claimed';
    if (drop.decision === 'claimed') markItemKnown(item.id);
    return drop;
}
