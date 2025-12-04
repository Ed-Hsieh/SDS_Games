/**
 * TowerSystem.js
 * 無盡塔系統 - 20層挑戰模式
 */

import GameManager from '../managers/GameManager.js';
import { getTowerMonster, createMonsterInstance, calculateDrops } from '../data/Monsters.js';
import { getBossEquipment } from '../data/BossEquipment.js';
import { getMaterial } from '../data/Materials.js';

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
    // 每層休息點（可恢復部分HP/MP）
    restFloors: [5, 10, 15],
    restHealPercent: 0.3,  // 休息恢復 30% HP/MP
    // 通關獎勵倍率
    clearBonusMultiplier: {
        5: 1.5,
        10: 2.0,
        15: 2.5,
        20: 5.0
    }
};

/**
 * 無盡塔系統
 */
export default class TowerSystem {
    constructor() {
        this.currentFloor = 1;
        this.highestFloor = 0;  // 歷史最高層
        this.state = TowerState.IDLE;
        this.currentMonster = null;
        this.battleLog = [];
        this.collectedRewards = [];
        this.listeners = [];
        
        // 載入存檔
        this.loadProgress();
    }
    
    /**
     * 訂閱事件
     */
    subscribe(callback) {
        this.listeners.push(callback);
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
        
        this.currentMonster = createMonsterInstance(monsterData.id);
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
        character.tickSkillCooldowns();
        
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
        
        if (action.type === 'attack') {
            // 普通攻擊
            const atk = character.getTotalAtk();
            const def = monster.def || 0;
            
            // 計算傷害
            damage = Math.max(1, atk - def * 0.5);
            
            // 暴擊判定
            const critRoll = Math.random();
            const isCrit = critRoll < character.getCritChance();
            if (isCrit) {
                damage = Math.floor(damage * character.getCritDamage());
                message = `你發動暴擊，對 ${monster.name} 造成 ${damage} 點傷害！`;
            } else {
                damage = Math.floor(damage);
                message = `你攻擊 ${monster.name}，造成 ${damage} 點傷害。`;
            }
            
            // 生命偷取
            const lifesteal = character.equipment.weapon?.lifesteal || 0;
            if (lifesteal > 0) {
                const healAmount = Math.floor(damage * lifesteal);
                character.hp = Math.min(character.maxHp, character.hp + healAmount);
                message += ` 偷取 ${healAmount} 點生命。`;
            }
            
        } else if (action.type === 'skill') {
            // 使用技能
            const skillResult = character.useSkill(action.skillIndex, monster);
            if (skillResult) {
                damage = skillResult.damage || 0;
                message = skillResult.message;
                
                // 處理 Buff
                if (skillResult.buff) {
                    character.addBuff(skillResult.buff.type, skillResult.buff.value, skillResult.buff.duration);
                }
            } else {
                message = '技能使用失敗！';
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
        const monsterAtk = monster.atk || 10;
        const playerDef = character.getTotalDef();
        
        // 計算傷害
        let damage = Math.max(1, monsterAtk - playerDef * 0.5);
        damage = Math.floor(damage);
        
        // 傷害減免
        const damageReduction = character.equipment.armor?.damageReduction || 0;
        if (damageReduction > 0) {
            damage = Math.floor(damage * (1 - damageReduction));
        }
        
        // 應用傷害
        character.hp = Math.max(0, character.hp - damage);
        
        const message = `${monster.name} 攻擊你，造成 ${damage} 點傷害。`;
        
        return {
            actor: 'monster',
            action: 'attack',
            damage,
            message,
            targetHp: character.hp
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
        const rewards = {
            gold: monster.gold || 0,
            exp: monster.exp || 0,
            items: [],
            equipment: null
        };
        
        // BOSS 層獎勵加成
        if (isBoss) {
            const multiplier = TOWER_CONFIG.clearBonusMultiplier[this.currentFloor] || 1;
            rewards.gold = Math.floor(rewards.gold * multiplier);
            rewards.exp = Math.floor(rewards.exp * multiplier);
            
            // BOSS 掉落裝備
            const bossEquipment = getBossEquipment(monster.id);
            if (bossEquipment) {
                rewards.equipment = bossEquipment;
            }
        }
        
        // 計算掉落物品
        const drops = calculateDrops(monster);
        for (const drop of drops) {
            const material = getMaterial(drop.itemId);
            if (material) {
                rewards.items.push({
                    ...material,
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
        const mpAmount = Math.floor(character.maxMp * TOWER_CONFIG.restHealPercent);
        
        character.hp = Math.min(character.maxHp, character.hp + healAmount);
        character.mp = Math.min(character.maxMp, character.mp + mpAmount);
        
        this.notify('rest_heal', { healAmount, mpAmount });
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
        try {
            const saveData = {
                highestFloor: this.highestFloor
            };
            localStorage.setItem('towerProgress', JSON.stringify(saveData));
        } catch (e) {
            console.warn('無法儲存無盡塔進度:', e);
        }
    }
    
    /**
     * 載入進度
     */
    loadProgress() {
        try {
            const saveData = localStorage.getItem('towerProgress');
            if (saveData) {
                const data = JSON.parse(saveData);
                this.highestFloor = data.highestFloor || 0;
            }
        } catch (e) {
            console.warn('無法載入無盡塔進度:', e);
        }
    }
    
    /**
     * 重置進度
     */
    resetProgress() {
        this.highestFloor = 0;
        this.currentFloor = 1;
        this.state = TowerState.IDLE;
        localStorage.removeItem('towerProgress');
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
export const towerSystem = new TowerSystem();
