/**
 * TowerManager.js
 * 無盡塔管理器 - 20層挑戰模式邏輯處理
 * (從 scenes/TowerSystem.js 搬移而來)
 */

import GameManager from './GameManager.js';
import { getTowerMonster, createMonsterInstance } from './MonsterManager.js';
import { resolveDropSources, generateDropsFromSources } from './DropManager.js';
import { getEquipmentEffectTotals, getRewardEffectTotals } from './EquipmentEffectResolver.js';
import { markItemKnown, markMonsterKnown } from './EncyclopediaManager.js';
import { getBossEquipment } from '../data/BossEquipment.js';
import { resolveItemById } from '../utils/ItemResolver.js';

// 重新導出，供 Scenes 使用（避免 Scenes 直接引用 Database）
export { getBossEquipment };

// 無盡塔狀態
export const TowerState = {
    IDLE: 'idle',           // 待機
    IN_BATTLE: 'in_battle', // 戰鬥中
    VICTORY: 'victory',     // 勝利
    DEFEAT: 'defeat',       // 失敗
    FLOOR_CLEAR: 'floor_clear', // 層數通關
    TOWER_CLEAR: 'tower_clear'  // 全塔通關
};

// 無盡塔配置
const TOWER_CONFIG = {
    maxFloor: 20,
    bossFloors: [5, 10, 15, 20],
    // 每層休息點（可恢復部分 HP）
    restFloors: [5, 10, 15],
    restHealPercent: 0.3,  // 休息恢復 30% HP
    // 通關獎勵倍率
    clearBonusMultiplier: {
        5: 1.5,
        10: 2.0,
        15: 2.5,
        20: 5.0
    }
};

/**
 * 無盡塔管理器
 */
export default class TowerManager {
    constructor() {
        this.currentFloor = 1;
        this.highestFloor = 0;  // 歷史最高層
        this.state = TowerState.IDLE;
        this.currentMonster = null;
        this.battleLog = [];
        this.collectedRewards = [];
        this.listeners = [];
        
        // 載入存檔
        GameManager.registerSaveSystem('tower', this);
        this.loadProgress();
    }
    
    /**
     * 訂閱事件
     */
    subscribe(callback) {
        if (!this.listeners.includes(callback)) {
            this.listeners.push(callback);
        }
    }

    unsubscribe(callback) {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }
    
    /**
     * 通知訂閱者
     */
    notify(eventType, data = {}) {
        this.listeners.forEach(callback => callback(eventType, data));
    }
    
    /**
     * 開始挑戰
     */
    startChallenge(startFloor = 1) {
        // 驗證起始層
        if (startFloor > this.highestFloor + 1) {
            return { success: false, message: `只能從第 ${this.highestFloor + 1} 層開始！` };
        }
        
        this.currentFloor = startFloor;
        this.state = TowerState.IDLE;
        this.collectedRewards = [];
        this.battleLog = [];
        
        this.notify('challenge_start', { floor: this.currentFloor });
        
        return { success: true, message: `開始挑戰第 ${this.currentFloor} 層！` };
    }
    
    /**
     * 進入戰鬥
     */
    enterBattle() {
        if (this.state === TowerState.IN_BATTLE) {
            return { success: false, message: '已在戰鬥中！' };
        }
        
        // 獲取當前層怪物
        const monsterData = getTowerMonster(this.currentFloor);
        if (!monsterData) {
            return { success: false, message: '找不到此層的怪物！' };
        }
        
        // Create instance directly from tower monster template (some tower monsters
        // are defined in TowerMonsterData and may not exist in the general
        // MonsterDatabase). Pass the template object so createMonsterInstance
        // can initialize correctly.
        this.currentMonster = createMonsterInstance(monsterData);
        this.currentMonster.isBoss = this.isBossFloor(this.currentFloor);
        this.currentMonster.isElite = Boolean(this.currentMonster.isElite);
        this.currentMonster.maxHp = this.currentMonster.maxHp ?? this.currentMonster.hp ?? this.currentMonster.currentHp ?? 1;
        this.currentMonster.hp = this.currentMonster.hp ?? this.currentMonster.currentHp ?? this.currentMonster.maxHp;
        this.currentMonster.currentHp = this.currentMonster.currentHp ?? this.currentMonster.hp;
        this.state = TowerState.IN_BATTLE;
        this.battleLog = [];
        
        this.notify('battle_start', { 
            floor: this.currentFloor, 
            monster: this.currentMonster,
            isBoss: this.isBossFloor(this.currentFloor)
        });
        
        return { 
            success: true, 
            message: `遭遇 ${this.currentMonster.name}！`,
            monster: this.currentMonster
        };
    }
    
    /**
     * 執行戰鬥回合
     */
    executeBattleRound(playerAction) {
        if (this.state !== TowerState.IN_BATTLE || !this.currentMonster) {
            return { success: false, message: '不在戰鬥中！' };
        }
        
        const character = GameManager.getCharacter();
        const monster = this.currentMonster;
        const roundLog = [];
        
        // 玩家行動
        const playerResult = this.executePlayerAction(character, monster, playerAction);
        roundLog.push(playerResult);
        this.battleLog.push(playerResult);
        
        // 檢查怪物是否死亡
        if (monster.currentHp <= 0) {
            return this.handleVictory();
        }
        
        // 怪物行動
        const monsterResult = this.executeMonsterAction(monster, character);
        roundLog.push(monsterResult);
        this.battleLog.push(monsterResult);
        
        // 檢查玩家是否死亡
        if (character.hp <= 0) {
            return this.handleDefeat();
        }
        
        // 回合結束處理
        character.tickBuffs();
        
        this.notify('battle_round', { roundLog, monster, character });
        
        return {
            success: true,
            roundLog,
            monsterHp: monster.currentHp,
            playerHp: character.hp,
            continued: true
        };
    }
    
    /**
     * 執行玩家行動
     */
    executePlayerAction(character, monster, action) {
        let damage = 0;
        let message = '';
        let weaponDestroyed = null;
        
        if (action.type === 'attack') {
            const effects = getEquipmentEffectTotals(character);
            // 武器耐久度消耗
            weaponDestroyed = GameManager.reduceWeaponDurability();
            if (weaponDestroyed) {
                message = `💔 ${weaponDestroyed.name} 已損壞！\n`;
            }
            
            // 檢查是否有節奏條判定結果
            if (action.hitType && action.damage !== undefined) {
                // 使用節奏條判定的結果
                damage = action.damage;
                const def = monster.def ?? monster.defense ?? 0;
                
                // 根據判定類型生成訊息
                if (action.hitType === 'crit') {
                    // 暴擊：使用節奏條傳來的傷害，再扣除部分防禦
                    damage = Math.max(1, Math.floor(damage - def * 0.3));
                    message += `💥 暴擊！你對 ${monster.name} 造成 ${damage} 點傷害！`;
                } else if (action.hitType === 'hit') {
                    // 命中：正常傷害計算
                    damage = Math.max(1, Math.floor(damage - def * 0.5));
                    message += `⚔️ 你攻擊 ${monster.name}，造成 ${damage} 點傷害。`;
                } else {
                    // Miss：無傷害
                    damage = 0;
                    message += `❌ 攻擊落空！${monster.name} 躲開了攻擊。`;
                }
            } else {
                // 備用邏輯：沒有節奏條時使用原始計算
                const atk = character.getTotalAtk();
                const def = monster.def ?? monster.defense ?? 0;
                
                // 計算傷害
                damage = Math.max(1, atk - def * 0.5);
                
                // 暴擊判定
                const critRoll = Math.random();
                const isCrit = critRoll < character.getCritChance();
                if (isCrit) {
                    damage = Math.floor(damage * character.getCritDamage());
                    message += `你發動暴擊，對 ${monster.name} 造成 ${damage} 點傷害！`;
                } else {
                    damage = Math.floor(damage);
                    message += `你攻擊 ${monster.name}，造成 ${damage} 點傷害。`;
                }
            }

            if (damage > 0) {
                if ((monster.isBoss || monster.type === 'boss') && effects.bossBonus > 0) {
                    damage += Math.floor(damage * (effects.bossBonus / 100));
                }
                const maxMonsterHp = monster.maxHp || monster.hp || monster.currentHp || 0;
                if (effects.execute > 0 && maxMonsterHp > 0 && (monster.currentHp || monster.hp || 0) <= maxMonsterHp * 0.5) {
                    damage += Math.floor(damage * (effects.execute / 100));
                }
                if (effects.fire > 0) damage += Math.floor(damage * (effects.fire / 100));
                if (effects.voidDamage > 0) damage += Math.floor(damage * (effects.voidDamage / 100));
                if (effects.doubleStrike > 0 && Math.random() * 100 < effects.doubleStrike) {
                    const extraDamage = Math.max(1, Math.floor(damage * 0.5));
                    damage += extraDamage;
                    message += ` 觸發雙重打擊，追加 ${extraDamage} 點傷害。`;
                }
            }
            
            // 生命偷取（僅在造成傷害時觸發）
            if (damage > 0) {
                const lifesteal = effects.lifesteal;
                if (lifesteal > 0) {
                    const missingHp = Math.max(0, character.maxHp - character.hp);
                    const healAmount = missingHp > 0
                        ? Math.min(missingHp, Math.max(1, Math.floor(damage * (lifesteal / 100))))
                        : 0;
                    character.hp = Math.min(character.maxHp, character.hp + healAmount);
                    if (healAmount > 0) message += ` 偷取 ${healAmount} 點生命。`;
                }
            }
            
        } else if (action.type === 'item') {
            // 使用道具（這裡簡化處理）
            message = '使用了道具。';
        }
        
        // 應用傷害
        if (damage > 0) {
            monster.currentHp = Math.max(0, monster.currentHp - damage);
        }
        
        return {
            actor: 'player',
            action: action.type,
            damage,
            message,
            targetHp: monster.currentHp
        };
    }
    
    /**
     * 執行怪物行動
     */
    executeMonsterAction(monster, character) {
        const monsterAtk = monster.atk ?? monster.attack ?? 10;
        const playerDef = character.getTotalDef();
        const effects = getEquipmentEffectTotals(character);
        
        // 計算傷害
        let damage = Math.max(1, monsterAtk - playerDef * 0.5);
        damage = Math.floor(damage);

        if (effects.dodgeChance > 0 && Math.random() * 100 < effects.dodgeChance) {
            return {
                actor: 'monster',
                action: 'attack',
                damage: 0,
                message: `${monster.name} 攻擊落空，你閃避了這次攻擊。`,
                targetHp: character.hp,
                dodged: true
            };
        }
        
        // 傷害減免
        const damageReduction = typeof character.getDamageReduction === 'function'
            ? character.getDamageReduction()
            : (character.equipment.armor?.damageReduction || 0);
        const normalizedReduction = Math.abs(damageReduction) > 1 ? damageReduction / 100 : damageReduction;
        if (normalizedReduction > 0) {
            damage = Math.floor(damage * (1 - Math.min(normalizedReduction, 0.75)));
        }

        const passiveReduction = typeof character.getPassiveCombatBonus === 'function'
            ? (monster.isBoss ? Number(character.getPassiveCombatBonus('bossDamageReduction')) || 0 : 0)
                + (monster.isElite ? Number(character.getPassiveCombatBonus('eliteDamageReduction')) || 0 : 0)
                + (Number(character.getPassiveCombatBonus('monsterDamageReduction')) || 0)
            : 0;
        if (passiveReduction > 0) {
            damage = Math.max(1, Math.floor(damage * (1 - Math.min(passiveReduction, 0.75))));
        }
        
        // 應用傷害
        character.hp = Math.max(0, character.hp - damage);
        
        let message = `${monster.name} 攻擊你，造成 ${damage} 點傷害。`;

        let reflectedDamage = 0;
        if (damage > 0 && effects.damageReflect > 0) {
            reflectedDamage = Math.max(1, Math.floor(damage * (effects.damageReflect / 100)));
            monster.currentHp = Math.max(0, (monster.currentHp ?? monster.hp ?? 0) - reflectedDamage);
            message += ` 反彈 ${reflectedDamage} 點傷害。`;
        }

        let revived = false;
        if (character.hp <= 0 && effects.revive > 0 && Math.random() * 100 < effects.revive) {
            character.hp = Math.max(1, Math.floor(character.maxHp * 0.3));
            revived = true;
            message += ` 你觸發復活，勉強站了起來。`;
        }
        
        // 防具耐久度消耗
        const armorDestroyed = GameManager.reduceArmorDurability();
        if (armorDestroyed) {
            message += `\n💔 ${armorDestroyed.name} 已損壞！`;
        }
        
        return {
            actor: 'monster',
            action: 'attack',
            damage,
            message,
            targetHp: character.hp,
            armorDestroyed: armorDestroyed,
            reflectedDamage,
            revived
        };
    }
    
    /**
     * 處理勝利
     */
    handleVictory() {
        this.state = TowerState.VICTORY;
        
        const monster = this.currentMonster;
        const character = GameManager.getCharacter();
        const isBoss = this.isBossFloor(this.currentFloor);
        
        // 計算獎勵
        const rewards = this.calculateRewards(monster, isBoss);
        
        // 發放獎勵
        this.grantRewards(rewards);
        
        // 更新最高層記錄
        if (this.currentFloor > this.highestFloor) {
            this.highestFloor = this.currentFloor;
            this.saveProgress();
        }
        
        // 經驗值
        const leveledUp = character.gainExp(rewards.exp);
        
        this.notify('battle_victory', {
            floor: this.currentFloor,
            monster: monster,
            rewards: rewards,
            leveledUp,
            isBoss
        });
        
        // 檢查是否全塔通關
        if (this.currentFloor >= TOWER_CONFIG.maxFloor) {
            this.state = TowerState.TOWER_CLEAR;
            this.notify('tower_clear', { rewards });
        } else {
            this.state = TowerState.FLOOR_CLEAR;
        }
        
        return {
            success: true,
            message: `擊敗了 ${monster.name}！`,
            rewards,
            leveledUp,
            canContinue: this.currentFloor < TOWER_CONFIG.maxFloor
        };
    }
    
    /**
     * 處理失敗
     */
    handleDefeat() {
        this.state = TowerState.DEFEAT;
        
        this.notify('battle_defeat', {
            floor: this.currentFloor,
            monster: this.currentMonster
        });
        
        return {
            success: false,
            message: `你被 ${this.currentMonster.name} 擊敗了...`,
            floor: this.currentFloor
        };
    }
    
    /**
     * 計算獎勵
     */
    calculateRewards(monster, isBoss) {
        markMonsterKnown(monster, { towerFloor: this.currentFloor });

        const rewards = {
            gold: monster.gold || 0,
            exp: monster.exp || 0,
            items: [],
            equipment: null
        };
        const rewardEffects = getRewardEffectTotals(GameManager.getCharacter());
        
        // BOSS 層獎勵加成
        if (isBoss) {
            const multiplier = TOWER_CONFIG.clearBonusMultiplier[this.currentFloor] || 1;
            rewards.gold = Math.floor(rewards.gold * multiplier);
            rewards.exp = Math.floor(rewards.exp * multiplier);
            
            // BOSS 掉落裝備
            const bossEquipment = getBossEquipment(monster.id);
            if (bossEquipment) {
                rewards.equipment = bossEquipment;
                markItemKnown(bossEquipment.id);
            }
        }

        rewards.gold = Math.floor(rewards.gold * (1 + (rewardEffects.goldBonus || 0) / 100));
        rewards.exp = Math.floor(rewards.exp * (1 + (rewardEffects.expBonus || 0) / 100));
        
        // 計算掉落物品（使用 resolve + generate）
        const sources = resolveDropSources({ monster });
        const drops = generateDropsFromSources(sources, {
            rng: Math.random,
            dropBonus: rewardEffects.dropBonus
        });
        for (const drop of drops) {
            const item = resolveItemById(drop.itemId, { preferBossEquipment: true });
            if (item && item.id !== rewards.equipment?.id) {
                markItemKnown(drop.itemId);
                rewards.items.push({
                    ...item,
                    quantity: drop.quantity
                });
            }
        }
        
        return rewards;
    }
    
    /**
     * 發放獎勵
     */
    grantRewards(rewards) {
        // 金幣
        if (rewards.gold > 0) {
            GameManager.addGold(rewards.gold);
        }
        
        // 物品
        for (const item of rewards.items) {
            GameManager.addToInventory(item, item.quantity);
        }
        
        // 裝備
        if (rewards.equipment) {
            GameManager.addToInventory(rewards.equipment);
        }
        
        this.collectedRewards.push(rewards);
    }
    
    /**
     * 進入下一層
     */
    nextFloor() {
        if (this.state !== TowerState.FLOOR_CLEAR && this.state !== TowerState.VICTORY) {
            return { success: false, message: '尚未通關當前層！' };
        }
        
        if (this.currentFloor >= TOWER_CONFIG.maxFloor) {
            return { success: false, message: '已達最高層！' };
        }
        
        this.currentFloor++;
        this.state = TowerState.IDLE;
        this.currentMonster = null;
        
        // 檢查是否為休息點
        const isRestFloor = TOWER_CONFIG.restFloors.includes(this.currentFloor - 1);
        if (isRestFloor) {
            this.restHeal();
        }
        
        this.notify('floor_advance', { 
            floor: this.currentFloor,
            isRestFloor
        });
        
        return { 
            success: true, 
            message: `進入第 ${this.currentFloor} 層`,
            floor: this.currentFloor
        };
    }
    
    /**
     * 休息恢復
     */
    restHeal() {
        const character = GameManager.getCharacter();
        const healAmount = Math.floor(character.maxHp * TOWER_CONFIG.restHealPercent);
        
        character.hp = Math.min(character.maxHp, character.hp + healAmount);
        
        this.notify('rest_heal', { healAmount });
    }
    
    /**
     * 放棄挑戰
     */
    abandonChallenge() {
        this.state = TowerState.IDLE;
        this.currentFloor = 1;
        this.currentMonster = null;
        
        this.notify('challenge_abandon');
        
        return { success: true, message: '已放棄挑戰' };
    }
    
    /**
     * 判斷是否為 BOSS 層
     */
    isBossFloor(floor) {
        return TOWER_CONFIG.bossFloors.includes(floor);
    }
    
    /**
     * 獲取層級資訊
     */
    getFloorInfo(floor = this.currentFloor) {
        const monster = getTowerMonster(floor);
        const isBoss = this.isBossFloor(floor);
        const bossEquipment = isBoss ? getBossEquipment(monster?.id) : null;
        
        return {
            floor,
            monster,
            isBoss,
            bossEquipment,
            recommendedLevel: Math.ceil(floor * 1.5),
            isUnlocked: floor <= this.highestFloor + 1
        };
    }
    
    /**
     * 獲取所有層級資訊
     */
    getAllFloorsInfo() {
        const floors = [];
        for (let i = 1; i <= TOWER_CONFIG.maxFloor; i++) {
            floors.push(this.getFloorInfo(i));
        }
        return floors;
    }
    
    /**
     * 儲存進度
     */
    saveProgress() {
        GameManager.markSaveDirty('tower');
    }
    
    /**
     * 載入進度
     */
    loadProgress() {
        return this.serialize();
    }
    
    /**
     * 重置進度
     */
    resetProgress() {
        this.highestFloor = 0;
        this.currentFloor = 1;
        this.state = TowerState.IDLE;
        this.currentMonster = null;
        this.battleLog = [];
        this.collectedRewards = [];
        this.notify('progress_reset', { highestFloor: this.highestFloor });
    }

    serialize() {
        return {
            highestFloor: this.highestFloor
        };
    }

    deserialize(data = {}) {
        this.highestFloor = Math.max(0, Number(data.highestFloor) || 0);
        this.currentFloor = 1;
        this.state = TowerState.IDLE;
        this.currentMonster = null;
        this.battleLog = [];
        this.collectedRewards = [];
        this.notify('progress_loaded', { highestFloor: this.highestFloor });
    }
    
    /**
     * 獲取當前狀態摘要
     */
    getStatus() {
        return {
            currentFloor: this.currentFloor,
            highestFloor: this.highestFloor,
            maxFloor: TOWER_CONFIG.maxFloor,
            state: this.state,
            currentMonster: this.currentMonster,
            collectedRewards: this.collectedRewards
        };
    }
}

// 單例導出
export const towerManager = new TowerManager();
