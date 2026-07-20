import { DungeonDatabase } from '../data/Dungeons.js';
import { createRuntimeItem } from '../models/ItemFactory.js';
import { resolveItemById } from '../utils/ItemResolver.js';
import { markItemKnown } from './EncyclopediaManager.js';
import GameManager from './GameManager.js';
import { questManager } from './QuestManager.js';
import { ObjectiveType } from '../data/Quests.js';

const MATERIAL_TREASURE_CHANCE_MULTIPLIER = 0.58;
const REWARD_RESOLUTION_ORDER = ['material', 'equipment', 'shop', 'rewardItem', 'bossEquipment'];

class DungeonManager {
    getDungeon(dungeonType) {
        return DungeonDatabase[dungeonType] || null;
    }

    createMechanicState() {
        return {
            cold: 0,
            supplyStress: 0,
            puzzleFragments: 0,
            tabletDecoded: false,
            markers: 0,
            lostCount: 0,
            bindSteps: 0,
            poisonSteps: 0,
            poisonDamage: 0,
            burn: 0,
            durabilityStress: 0,
            curseSteps: 0,
            curseAttack: 0,
            curseDefense: 0
        };
    }

    getPassiveCombatBonus(stat) {
        const character = GameManager.getCharacter();
        return typeof character?.getPassiveCombatBonus === 'function'
            ? Math.max(0, Number(character.getPassiveCombatBonus(stat)) || 0)
            : 0;
    }

    hasCounterItem(itemId) {
        if (!itemId) return false;
        const equipment = GameManager.getCharacter()?.equipment || {};
        return Object.values(equipment).some(item => item?.id === itemId)
            || GameManager.getItemCountAcrossStorage(itemId) > 0;
    }

    hasEquipmentSpecial(key) {
        const equipment = GameManager.getCharacter()?.equipment || {};
        return Object.values(equipment).some(item => item?.special?.[key] || item?.specialEffects?.[key]);
    }

    getPuzzleFragmentRequired() {
        if (this.hasCounterItem('ancient_codex') || this.hasEquipmentSpecial('puzzleHint')) return 1;
        return Math.max(1, 2 - Math.floor(this.getPassiveCombatBonus('puzzleClueBonus')));
    }

    getMarkerRequired() {
        const baseRequired = DungeonDatabase.jungle?.mechanic?.effect?.markerRequired ?? 3;
        return Math.max(1, baseRequired - Math.floor(this.getPassiveCombatBonus('markerRequirementReduction')));
    }

    getMazeInterval() {
        return DungeonDatabase.jungle?.mechanic?.effect?.lostCheckInterval ?? 10;
    }

    getVisionRange(dungeonType, state) {
        const mechanic = this.getDungeon(dungeonType)?.mechanic;
        if (mechanic?.type === 'darkness') {
            const base = mechanic.effect?.visionRange ?? 3;
            return base + (this.hasCounterItem(mechanic.counterItem) ? (mechanic.effect?.torchBonus ?? 2) : 0);
        }
        if (mechanic?.type === 'maze') {
            const protectedByItem = this.hasCounterItem('jungle_compass') || this.hasEquipmentSpecial('mazeImmune');
            return protectedByItem || state.markers >= this.getMarkerRequired() ? 5 : 3;
        }
        if (mechanic?.type === 'puzzle') {
            return state.tabletDecoded || this.hasEquipmentSpecial('revealHidden') ? 5 : 4;
        }
        return 4;
    }

    consumeBindStep(state) {
        if ((state?.bindSteps || 0) <= 0) return null;
        state.bindSteps -= 1;
        return {
            blocked: true,
            message: `藤蔓仍纏住你的腳步，還需要 ${state.bindSteps} 秒才能掙脫。`
        };
    }

    reduceByPassive(amount, stat, cap = 0.8) {
        const reduction = Math.min(cap, this.getPassiveCombatBonus(stat));
        return Math.max(1, Math.floor(amount * (1 - reduction)));
    }

    applyHealingBonus(amount) {
        const bonus = this.getPassiveCombatBonus('healingReceived');
        return Math.max(1, Math.floor(amount * (1 + bonus)));
    }

    getDamageMitigation(reason = '') {
        const text = String(reason);
        let reduction = this.getPassiveCombatBonus('hazardDamageReduction');
        if (/毒|沼|中毒/.test(text)) reduction += this.getPassiveCombatBonus('poisonMitigation');
        if (/寒|冰|雪|補給不足/.test(text)) reduction += this.getPassiveCombatBonus('coldMitigation');
        if (/火|炎|灼|岩漿|煉獄/.test(text)) reduction += this.getPassiveCombatBonus('burnMitigation');
        if (/陷阱|機關|突襲|錯誤/.test(text)) reduction += this.getPassiveCombatBonus('trapDamageReduction');
        return Math.min(0.8, reduction);
    }

    applyHazardDamage(amount, reason) {
        const baseAmount = Math.max(1, Math.floor(Number(amount) || 0));
        const finalAmount = Math.max(1, Math.floor(baseAmount * (1 - this.getDamageMitigation(reason))));
        const damage = this.damageCharacter(finalAmount, { reason: 'dungeon-damage' });
        return { baseAmount, damage, mitigated: Math.max(0, baseAmount - damage), reason };
    }

    resolveDungeonStep(dungeonType, stepCount, state, random = Math.random) {
        const dungeon = this.getDungeon(dungeonType);
        const character = GameManager.getCharacter();
        const events = [];
        const actions = [];
        if (!dungeon || !character) return { events, actions, alive: false };

        const add = (text, type = 'normal', meta = {}) => events.push({ text, type, ...meta });
        const damage = (amount, reason, type = 'danger') => {
            const result = this.applyHazardDamage(amount, reason);
            const mitigationText = result.mitigated > 0 ? `（技能減免 ${result.mitigated}）` : '';
            add(`${reason}：受到 ${result.damage} 點傷害${mitigationText}。`, type, { audio: 'player-hit', damage: result.damage });
            return result;
        };

        if (state.curseSteps > 0) {
            state.curseSteps -= 1;
            if (state.curseSteps === 0) {
                state.curseAttack = 0;
                state.curseDefense = 0;
                add('詛咒領域的壓制消散了。', 'success');
            }
        }

        if (dungeonType === 'cave' && stepCount % 6 === 0) {
            add(this.hasCounterItem('torch')
                ? `火把穩住了黑暗，視野提升到 ${this.getVisionRange(dungeonType, state)} 格。`
                : '洞窟深處的黑暗壓縮視野，遠處只能看到模糊輪廓。',
            this.hasCounterItem('torch') ? 'info' : 'warning');
        }

        if (dungeonType === 'snow') {
            const mechanic = dungeon.mechanic;
            const hasWarmth = this.hasCounterItem('warm_cloak') || this.hasCounterItem('heart_of_ice');
            const maxCold = mechanic?.effect?.maxCold ?? 100;
            const baseColdGain = hasWarmth ? 1 : (mechanic?.effect?.coldPerStep ?? 2);
            state.cold = Math.min(maxCold, state.cold + this.reduceByPassive(baseColdGain, 'coldGainReduction', 0.75));

            if (stepCount % 6 === 0) {
                if (this.hasConsumableSupply() && !hasWarmth) {
                    const saved = random() < Math.min(0.8, this.getPassiveCombatBonus('snowSupplySaving'));
                    state.supplyStress += 1;
                    if (saved) {
                        add('補給沒有被寒風消耗，裝備效果保住了這一份。', 'success');
                    } else {
                        const consumed = this.consumeFirstSupply();
                        add(`寒冷迫使你消耗補給：${consumed?.item?.name || '補給品'} 已被使用。`, 'warning');
                    }
                } else if (!hasWarmth) {
                    damage(Math.max(1, Math.floor((character.maxHp || 100) * 0.04)), '補給不足');
                    add('沒有可用補給，寒冷直接侵蝕生命。', 'danger');
                } else {
                    state.cold = Math.max(0, state.cold - 5);
                    add('保暖裝備穩住寒冷，補給沒有被消耗。', 'success');
                }
            }

            if (state.cold >= maxCold) {
                damage(Math.max(1, Math.floor((character.maxHp || 100) * (mechanic?.effect?.damagePerStep ?? 0.05))), '極寒侵蝕');
                if (hasWarmth) state.cold = Math.max(70, state.cold - 10);
            } else if (stepCount % 5 === 0) {
                add(`寒冷累積 ${state.cold}/${maxCold}。雪地會持續消耗補給。`, 'warning');
            }
        }

        if (dungeonType === 'ruins' && !state.tabletDecoded) {
            const required = this.getPuzzleFragmentRequired();
            if (this.hasCounterItem('ancient_codex') || this.hasEquipmentSpecial('puzzleHint')) {
                state.puzzleFragments = Math.max(state.puzzleFragments, required);
                state.tabletDecoded = true;
                add('古代典籍協助你辨認石碑文字。', 'success');
            } else if (stepCount % 7 === 0 && state.puzzleFragments < required && random() < 0.45) {
                state.puzzleFragments += 1;
                add(`你拓下一段石碑文字：線索 ${state.puzzleFragments}/${required}。`, 'reward');
            }
        }

        if (dungeonType === 'jungle') {
            if (state.poisonSteps > 0) {
                state.poisonSteps -= 1;
                damage(state.poisonDamage, '毒沼殘毒', 'warning');
                if (state.poisonSteps <= 0) {
                    state.poisonDamage = 0;
                    add('毒性逐漸退去。', 'success');
                }
            }

            const required = this.getMarkerRequired();
            const protectedByItem = this.hasCounterItem('jungle_compass') || this.hasEquipmentSpecial('mazeImmune');
            if (state.markers < required && stepCount % this.getMazeInterval() === 0) {
                let chance = dungeon.mechanic?.effect?.lostChance ?? 0.3;
                chance -= state.markers * 0.07;
                chance -= this.getPassiveCombatBonus('lostChanceReduction');
                if (protectedByItem) chance *= 0.5;
                chance = Math.max(0.05, chance);
                if (random() < chance) {
                    state.lostCount += 1;
                    actions.push({ type: 'return-to-entrance' });
                    add('迷霧讓路徑扭曲，你被帶回本層入口附近。收集路標可以降低風險。', 'danger');
                } else {
                    add(`迷霧干擾方向，當前路標 ${state.markers}/${required}。`, 'info');
                }
            }
        }

        if (dungeonType === 'hell') {
            const immune = this.hasCounterItem('flame_amulet')
                || this.hasCounterItem('crown_of_hell')
                || this.hasEquipmentSpecial('burnImmune');
            if (immune) {
                if (stepCount % 8 === 0) add('烈焰護符隔開了煉獄灼熱。', 'success');
            } else {
                const burnDamage = Math.max(1, Math.floor((character.maxHp || 100) * (dungeon.mechanic?.effect?.damagePerStep ?? 0.02)));
                state.burn = Math.min(100, state.burn + 6);
                damage(burnDamage, '煉獄烈焰');
                if (stepCount % 3 === 0) {
                    state.durabilityStress += 1;
                    const saved = random() < Math.min(0.8, this.getPassiveCombatBonus('durabilityLossReduction'));
                    if (saved) {
                        add('裝備效果抵消了這次高溫耐久磨耗。', 'success');
                    } else {
                        const destroyed = [GameManager.reduceWeaponDurability?.(), GameManager.reduceArmorDurability?.()]
                            .filter(Boolean)
                            .map(item => item.name || '裝備');
                        add(destroyed.length > 0
                            ? `煉獄高溫熔毀了 ${destroyed.join('、')}。`
                            : '煉獄高溫磨耗裝備耐久。', destroyed.length > 0 ? 'danger' : 'warning');
                    }
                }
            }
        }

        return { events, actions, alive: (GameManager.getCharacter()?.hp || 0) > 0 };
    }

    resolvePressurePlate(dungeonType, state) {
        const events = [];
        if (dungeonType !== 'ruins') {
            return {
                openDoor: true,
                events: [{ text: '踩到壓力板，遠處傳來門打開的聲音。', type: 'info' }]
            };
        }

        const required = this.getPuzzleFragmentRequired();
        const canReadTablet = state.tabletDecoded
            || state.puzzleFragments >= required
            || this.hasCounterItem('ancient_codex')
            || this.hasEquipmentSpecial('puzzleHint');
        if (canReadTablet) {
            state.tabletDecoded = true;
            state.puzzleFragments = Math.max(state.puzzleFragments, required);
            events.push({ text: '你讀懂石碑順序，壓力板正確啟動，石門打開了。', type: 'success' });
            return { openDoor: true, events };
        }

        const penalty = DungeonDatabase.ruins?.mechanic?.effect?.wrongPenalty ?? 30;
        const damage = this.applyHazardDamage(penalty, '錯誤機關');
        const mitigationText = damage.mitigated > 0 ? `（技能減免 ${damage.mitigated}）` : '';
        events.push({
            text: `錯誤機關：受到 ${damage.damage} 點傷害${mitigationText}。`,
            type: 'danger',
            audio: 'player-hit',
            damage: damage.damage
        });
        events.push({
            text: `石碑文字尚未辨認，需要線索 ${state.puzzleFragments}/${required} 才能正確啟動。`,
            type: 'warning'
        });
        return { openDoor: false, events };
    }

    resolvePortal(dungeonType) {
        if (dungeonType !== 'jungle') {
            return { events: [{ text: '傳送到了新位置。', type: 'info' }] };
        }
        const protectedByItem = this.hasCounterItem('jungle_compass') || this.hasEquipmentSpecial('mazeImmune');
        return {
            events: [{
                text: protectedByItem
                    ? '指南針穩住方向，迷霧傳送後仍能辨認路徑。'
                    : '迷霧傳送改變了位置，周圍路徑變得難以判斷。',
                type: protectedByItem ? 'success' : 'warning'
            }]
        };
    }

    applyTreasureDiscoveryBonus(dungeonType, state, sourceName = '寶箱') {
        const events = [];
        if (dungeonType === 'snow') {
            const before = state.cold;
            state.cold = Math.max(0, before - 15);
            if (before !== state.cold) events.push({ text: `${sourceName}裡的乾燥絨布讓寒意退去一些。`, type: 'success' });
        }
        if (dungeonType === 'ruins') {
            const required = this.getPuzzleFragmentRequired();
            if (!state.tabletDecoded && state.puzzleFragments < required) {
                state.puzzleFragments += 1;
                events.push({ text: `你在${sourceName}內找到一片拓文：線索 ${state.puzzleFragments}/${required}。`, type: 'reward' });
            }
        }
        if (dungeonType === 'jungle') {
            const required = this.getMarkerRequired();
            if (state.markers < required) {
                state.markers += 1;
                events.push({ text: `${sourceName}留下的繩結可以當路標：${state.markers}/${required}。`, type: 'info' });
            }
        }
        if (dungeonType === 'hell') {
            const before = state.burn;
            state.burn = Math.max(0, state.burn - 12);
            if (before !== state.burn) events.push({ text: `${sourceName}的封蠟壓住灼熱，煉獄壓力短暫下降。`, type: 'success' });
        }
        return { events };
    }

    resolveFloorEvent(dungeonType, state, event, options = {}) {
        const character = GameManager.getCharacter();
        const events = [];
        const grants = [];
        const eventName = event?.name || '未知事件';
        if (!event || !character) return { events, grants };

        const add = (text, type = 'normal', meta = {}) => events.push({ text, type, ...meta });
        const damage = (amount, reason, type = 'danger') => {
            const result = this.applyHazardDamage(amount, reason);
            const mitigationText = result.mitigated > 0 ? `（技能減免 ${result.mitigated}）` : '';
            add(`${reason}：受到 ${result.damage} 點傷害${mitigationText}。`, type, {
                audio: 'player-hit',
                damage: result.damage
            });
            return result;
        };
        const heal = percent => {
            const amount = this.applyHealingBonus(Math.max(1, Math.floor((character.maxHp || 100) * percent)));
            const healed = this.healCharacter(amount, 'dungeon-event');
            add(`💚 ${eventName}：恢復 ${healed} 生命`, 'success');
            return healed;
        };

        switch (event.type) {
            case 'trap':
                if (event.monsterType) {
                    add(`⚔️ ${eventName}：敵人從暗處突襲！`, 'danger');
                    return { events, grants, battle: event.monsterType };
                }
                if (event.damage) damage(event.damage, eventName);
                if (event.poison) {
                    state.poisonSteps = Math.max(state.poisonSteps, event.poison.duration || 3);
                    state.poisonDamage = Math.max(state.poisonDamage, event.poison.damage || 1);
                    add(`☠️ 中毒：每秒 ${event.poison.damage}，持續 ${event.poison.duration} 秒`, 'warning');
                }
                if (event.effect === 'bind') {
                    state.bindSteps = Math.max(state.bindSteps, event.duration || 1);
                    add(`🌿 束縛：行動受限 ${event.duration || 1} 秒`, 'warning');
                }
                break;
            case 'lava':
                damage(event.damage || 0, eventName);
                break;
            case 'treasure': {
                const gold = this.grantGoldRange(event.goldRange, 'dungeon-event');
                add(`🏺 ${eventName}：獲得 ${gold} 金幣`, 'reward');
                grants.push({ result: this.rollRandomItem(dungeonType, event.itemChance ?? 0.2), label: `${eventName}中找到` });
                events.push(...this.applyTreasureDiscoveryBonus(dungeonType, state, eventName).events);
                break;
            }
            case 'rest':
            case 'campfire':
            case 'herb':
            case 'soul_well':
                heal(event.healPercent || 0.15);
                if (event.coldReset) {
                    state.cold = 0;
                    state.supplyStress = Math.max(0, state.supplyStress - 2);
                    add('🔥 寒意被驅散。', 'success');
                }
                if (event.removePoisaon || event.removePoison) {
                    state.poisonSteps = 0;
                    state.poisonDamage = 0;
                    add('☠️ 毒性被草藥壓下。', 'success');
                }
                if (event.type === 'herb' && dungeonType === 'jungle') {
                    state.lostCount = Math.max(0, state.lostCount - 1);
                    add('草藥味掩住濕霧，回程方向變得清楚一些。', 'info');
                }
                if (event.type === 'soul_well') {
                    state.burn = Math.max(0, state.burn - 25);
                    state.curseSteps = Math.max(0, state.curseSteps - 4);
                    add('靈魂之井暫時壓下灼熱與詛咒。', 'success');
                }
                break;
            case 'blizzard': {
                const increase = this.reduceByPassive(event.coldIncrease || 0, 'coldGainReduction', 0.75);
                state.cold = Math.min(100, state.cold + increase);
                add(`❄️ ${eventName}：寒意上升 ${increase}`, 'warning');
                break;
            }
            case 'puzzle_bonus':
                state.puzzleFragments = Math.min(this.getPuzzleFragmentRequired(), state.puzzleFragments + 1);
                add(`🔎 ${eventName}：你解開隱藏機關，下一份獎勵會更豐厚。`, 'success');
                break;
            case 'lore':
                this.grantExperience(event.expBonus || 0, 'dungeon-event');
                state.puzzleFragments = Math.min(this.getPuzzleFragmentRequired(), state.puzzleFragments + 1);
                add(`📜 ${eventName}：獲得 ${event.expBonus || 0} 經驗`, 'reward');
                break;
            case 'marker':
                state.markers = Math.min(this.getMarkerRequired(), state.markers + (event.markerCount || 1));
                add(`🧭 ${eventName}：地圖方向變得更清楚。路標 ${state.markers}/${this.getMarkerRequired()}`, 'info');
                break;
            case 'ambush':
                add(`⚔️ ${eventName}：菁英怪物突襲！`, 'danger');
                return { events, grants, battle: event.monsterType || 'elite' };
            case 'curse':
                state.curseSteps = Math.max(state.curseSteps, event.duration || 0);
                state.curseAttack = event.debuff?.attack || 0;
                state.curseDefense = event.debuff?.defense || 0;
                add(`🩸 ${eventName}：攻擊與防禦受到詛咒壓制 ${event.duration || 0} 秒`, 'warning');
                break;
            case 'contract':
                if (options.contractAccepted === undefined) {
                    return { events, grants, requiresContractDecision: true };
                }
                if (!options.contractAccepted) {
                    add('你拒絕了契約，低語聲逐漸退去。', 'info');
                    break;
                }
                {
                    const result = this.acceptContract(dungeonType, {
                        healthRate: 0.15,
                        gold: 250,
                        itemChance: event.itemChance ?? 0.45
                    });
                    add(`🩸 契約成立：失去 ${result.damage} 生命，獲得 ${result.gold} 金幣`, 'reward');
                    grants.push({ result: result.reward, label: '契約回贈', curseOnFailure: true });
                    if (!result.reward?.success) {
                        state.curseSteps = Math.max(state.curseSteps, 4);
                        state.curseAttack = Math.min(state.curseAttack, -4);
                        state.curseDefense = Math.min(state.curseDefense, -4);
                        add('契約沒有吐出寶物，只在皮膚上留下發燙的字。', 'warning');
                    }
                }
                break;
            default:
                add(`✨ ${eventName}`, 'info');
        }

        return { events, grants, alive: (GameManager.getCharacter()?.hp || 0) > 0 };
    }

    getMechanicStatus(dungeonType, state, visionRange = 4) {
        const mechanic = this.getDungeon(dungeonType)?.mechanic;
        if (!mechanic) return '';
        if (dungeonType === 'cave') {
            return `黑暗籠罩｜視野 ${visionRange}｜${this.hasCounterItem('torch') ? '火把已生效' : '缺少火把'}`;
        }
        if (dungeonType === 'snow') return `極寒環境｜寒冷 ${state.cold}/100｜補給消耗 ${state.supplyStress}`;
        if (dungeonType === 'ruins') return `遺跡機關｜石碑線索 ${state.puzzleFragments}/${this.getPuzzleFragmentRequired()}｜${state.tabletDecoded ? '已辨認' : '未辨認'}`;
        if (dungeonType === 'jungle') return `迷霧迷宮｜路標 ${state.markers}/${this.getMarkerRequired()}｜迷失 ${state.lostCount} 次`;
        if (dungeonType === 'hell') return `煉獄烈焰｜灼熱 ${state.burn}/100｜耐久壓力 ${state.durabilityStress}`;
        return mechanic.name;
    }

    resolveRewardItem(reward) {
        if (!reward) return null;
        if (!reward.itemId) return reward;

        const itemData = resolveItemById(reward.itemId, { order: REWARD_RESOLUTION_ORDER });
        return itemData ? createRuntimeItem(itemData) : null;
    }

    grantItem(reward, quantity = 1) {
        const item = this.resolveRewardItem(reward);
        if (!item) return { success: false, reason: 'missing-item', item: null, quantity: 0 };

        const safeQuantity = Math.max(1, Number(quantity) || 1);
        if (GameManager.addToInventory(item, safeQuantity)) {
            markItemKnown(item.id);
            return { success: true, destination: 'inventory', item, quantity: safeQuantity };
        }

        if (GameManager.addToWarehouse(item, safeQuantity)) {
            markItemKnown(item.id);
            return { success: true, destination: 'warehouse', item, quantity: safeQuantity };
        }

        return { success: false, reason: 'storage-full', item, quantity: safeQuantity };
    }

    rollRandomItem(dungeonType, chance = 0) {
        const dungeon = this.getDungeon(dungeonType);
        const pool = Array.isArray(dungeon?.treasures?.random) ? dungeon.treasures.random : [];
        const safeChance = Math.max(0, Math.min(1, Number(chance) || 0));
        if (pool.length === 0 || safeChance <= 0) return { rolled: false, reason: 'empty-pool' };

        const reward = pool[Math.floor(Math.random() * pool.length)];
        const item = this.resolveRewardItem(reward);
        if (!item) return { rolled: false, reason: 'missing-item' };

        const adjustedChance = String(item.type || '').toLowerCase() === 'material'
            ? safeChance * MATERIAL_TREASURE_CHANCE_MULTIPLIER
            : safeChance;
        if (Math.random() >= adjustedChance) return { rolled: false, reason: 'chance' };

        const quantity = String(item.type || '').toLowerCase() === 'material' && Math.random() < 0.2 ? 2 : 1;
        return { rolled: true, ...this.grantItem(item, quantity) };
    }

    grantGold(amount, reason = 'dungeon-gold') {
        const safeAmount = Math.max(0, Math.floor(Number(amount) || 0));
        if (safeAmount <= 0) return 0;
        GameManager.addGold(safeAmount, { reason });
        return safeAmount;
    }

    grantGoldRange(range, reason = 'dungeon-gold') {
        const [rawMin, rawMax] = Array.isArray(range) ? range : [20, 50];
        const min = Math.max(0, Math.floor(Number(rawMin) || 0));
        const max = Math.max(min, Math.floor(Number(rawMax) || min));
        return this.grantGold(min + Math.floor(Math.random() * (max - min + 1)), reason);
    }

    grantExperience(amount, reason = 'dungeon-experience') {
        const safeAmount = Math.max(0, Math.floor(Number(amount) || 0));
        return GameManager.addCharacterExperience(safeAmount, { reason }).added;
    }

    healCharacter(amount, reason = 'dungeon-healing') {
        const health = GameManager.changeCharacterHealth(Math.max(0, Math.floor(Number(amount) || 0)), { reason });
        return Math.max(0, health?.delta || 0);
    }

    damageCharacter(amount, options = {}) {
        const safeAmount = Math.max(0, Math.floor(Number(amount) || 0));
        const health = GameManager.changeCharacterHealth(-safeAmount, {
            minimumHp: options.minimumHp,
            reason: options.reason || 'dungeon-damage'
        });
        return Math.max(0, -(health?.delta || 0));
    }

    consumeFirstSupply() {
        const inventory = GameManager.getInventory() || [];
        const stack = inventory.find(entry => {
            const item = entry?.item;
            const quantity = Number(entry?.quantity ?? 1);
            return quantity > 0 && (item?.type === 'potion' || Boolean(item?.effect?.hp) || Boolean(item?.buff));
        });
        if (!stack) return null;

        const consumed = GameManager.useConsumable(stack.instanceId, false, {
            applyEffect: false,
            notifyType: 'inventory'
        });
        if (!consumed) return null;
        return { item: stack.item, instanceId: stack.instanceId };
    }

    hasConsumableSupply() {
        return Boolean((GameManager.getInventory() || []).find(entry => {
            const item = entry?.item;
            return Number(entry?.quantity ?? 1) > 0
                && (item?.type === 'potion' || Boolean(item?.effect?.hp) || Boolean(item?.buff));
        }));
    }

    acceptContract(dungeonType, options = {}) {
        const character = GameManager.getCharacter();
        if (!character) return { success: false, damage: 0, gold: 0, reward: null };

        const healthRate = Math.max(0, Math.min(1, Number(options.healthRate) || 0.15));
        const healthCost = Math.max(1, Math.floor((character.maxHp || 100) * healthRate));
        const damage = this.damageCharacter(healthCost, { minimumHp: 1, reason: 'dungeon-contract' });
        const gold = this.grantGold(options.gold ?? 250, 'dungeon-contract');
        const reward = this.rollRandomItem(dungeonType, options.itemChance ?? 0.45);
        return { success: true, damage, gold, reward };
    }

    openTreasure(dungeonType, floor) {
        const safeFloor = Math.max(1, Math.floor(Number(floor) || 1));
        const gold = this.grantGoldRange(
            [20 + safeFloor * 10, 50 + safeFloor * 20],
            'dungeon-treasure'
        );
        const reward = this.rollRandomItem(dungeonType, Math.min(0.55, 0.22 + safeFloor * 0.04));
        return { gold, reward };
    }

    recordFloorReached(dungeonType, floor) {
        const dungeon = this.getDungeon(dungeonType);
        const safeFloor = Math.max(1, Math.floor(Number(floor) || 1));
        if (!dungeon || safeFloor > (dungeon.bossFloor || dungeon.floors || 1)) {
            return { success: false, dungeon, floor: safeFloor };
        }

        questManager.updateProgress(ObjectiveType.DUNGEON_FLOOR, dungeonType, 1);
        return { success: true, dungeon, floor: safeFloor };
    }

    completeDungeon(dungeonType) {
        const dungeon = this.getDungeon(dungeonType);
        if (!dungeon) return { success: false, dungeon: null, rewards: [] };

        questManager.updateProgress(ObjectiveType.DUNGEON_BOSS, `${dungeonType}_boss`, 1);
        questManager.updateProgress(ObjectiveType.DUNGEON_CLEAR, dungeonType, 1);
        GameManager.setFlag(`dungeon.${dungeonType}.cleared`, true);

        const rewards = [];
        if (dungeon.treasures?.guaranteed) rewards.push(this.grantItem(dungeon.treasures.guaranteed, 1));
        const randomPool = Array.isArray(dungeon.treasures?.random) ? dungeon.treasures.random : [];
        if (randomPool.length > 0) {
            rewards.push(this.grantItem(randomPool[Math.floor(Math.random() * randomPool.length)], 1));
        }

        GameManager.markSaveDirty('dungeon-complete');
        GameManager.notify('all');
        return { success: true, dungeon, rewards };
    }

    resolveDefeat(dungeonType) {
        const dungeon = this.getDungeon(dungeonType);
        const character = GameManager.getCharacter();
        const health = GameManager.setCharacterHealth(Math.max(1, Math.floor((character?.maxHp || 1) * 0.3)), {
            reason: 'dungeon-death-return'
        });
        GameManager.setFlag('death.pendingPenalty', true);
        GameManager.setFlag('death.lastReason', 'dungeon-death');
        return { dungeon, hp: health?.hp || 1 };
    }
}

export const dungeonManager = new DungeonManager();
