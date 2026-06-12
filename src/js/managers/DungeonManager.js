/**
 * DungeonManager.js
 * 副本系統 - 處理副本邏輯、狀態管理、特殊機制
 */

import {
    DungeonDatabase,
    DungeonType,
    DungeonState,
    DungeonSpawnConfig,
    DungeonEntranceConfig,
    generateDungeonMonster,
    generateDungeonBoss,
    generateFloorEvent
} from '../data/Dungeons.js';
import GameManager from './GameManager.js';

// 重新導出，供 Scenes 使用（避免 Scenes 直接引用 Database）
export { DungeonDatabase, DungeonType, DungeonState, DungeonEntranceConfig, generateFloorEvent };

class DungeonManagerClass {
    constructor() {
        // 當前副本狀態
        this.currentDungeon = null;
        this.currentFloor = 1;
        this.steps = 0;
        
        // 副本內部狀態
        this.dungeonState = {
            // 寒冷值 (雪山)
            coldLevel: 0,
            // 收集的路標 (叢林)
            markers: 0,
            // 已解決的謎題 (遺跡)
            puzzlesSolved: 0,
            // 特殊狀態
            buffs: [],
            debuffs: [],
            // 戰鬥統計
            monstersKilled: 0,
            treasuresFound: 0,
            damageDealt: 0,
            damageTaken: 0
        };
        
        // 副本完成記錄
        this.completionRecords = {};
        
        // 副本冷卻時間
        this.cooldowns = {};

        GameManager.registerSaveSystem('dungeon', this);
        
        this.init();
    }
    
    init() {
        this.loadProgress();
    }
    
    // ==================== 存檔/讀檔 ====================
    
    loadProgress() {
        return this.serialize();
    }
    
    saveProgress() {
        GameManager.markSaveDirty('dungeon');
    }

    serialize() {
        return {
            completionRecords: { ...this.completionRecords },
            cooldowns: { ...this.cooldowns }
        };
    }

    deserialize(data = {}) {
        this.completionRecords = data.completionRecords || {};
        this.cooldowns = data.cooldowns || {};
    }

    resetProgress() {
        this.currentDungeon = null;
        this.currentFloor = 1;
        this.steps = 0;
        this.completionRecords = {};
        this.cooldowns = {};
    }
    
    // ==================== 副本入口管理 ====================
    
    /**
     * 檢查副本是否可進入
     */
    isDungeonAvailable(dungeonType) {
        const cooldown = this.cooldowns[dungeonType];
        if (cooldown && Date.now() < cooldown) {
            return false;
        }
        return true;
    }
    
    /**
     * 獲取副本冷卻剩餘時間
     */
    getDungeonCooldown(dungeonType) {
        const cooldown = this.cooldowns[dungeonType];
        if (cooldown && Date.now() < cooldown) {
            return cooldown - Date.now();
        }
        return 0;
    }
    
    /**
     * 設置副本冷卻
     */
    setDungeonCooldown(dungeonType) {
        const cooldownTime = DungeonSpawnConfig.respawnCooldown[dungeonType] || 0;
        if (cooldownTime > 0) {
            this.cooldowns[dungeonType] = Date.now() + cooldownTime;
        }
    }
    
    /**
     * 獲取所有可用副本
     */
    getAvailableDungeons() {
        return Object.values(DungeonDatabase).filter(d => this.isDungeonAvailable(d.id));
    }
    
    // ==================== 副本進入/離開 ====================
    
    /**
     * 進入副本
     */
    enterDungeon(dungeonType, playerData) {
        const dungeon = DungeonDatabase[dungeonType];
        if (!dungeon) {
            return { success: false, message: '找不到該副本' };
        }
        
        if (!this.isDungeonAvailable(dungeonType)) {
            const remaining = this.getDungeonCooldown(dungeonType);
            const minutes = Math.ceil(remaining / 60000);
            return { success: false, message: `副本冷卻中，還需等待 ${minutes} 分鐘` };
        }
        
        // 檢查等級建議
        if (playerData.level < dungeon.recommendLevel - 3) {
            return { 
                success: false, 
                message: `你的等級太低了！建議等級: ${dungeon.recommendLevel}`,
                canForce: true  // 允許強制進入
            };
        }
        
        // 初始化副本狀態
        this.currentDungeon = dungeon;
        this.currentFloor = 1;
        this.steps = 0;
        this.dungeonState = {
            coldLevel: 0,
            markers: 0,
            puzzlesSolved: 0,
            buffs: [],
            debuffs: [],
            monstersKilled: 0,
            treasuresFound: 0,
            damageDealt: 0,
            damageTaken: 0
        };
        
        return {
            success: true,
            message: `進入 ${dungeon.name}`,
            dungeon: dungeon,
            floor: 1,
            event: this.getEntranceEvent()
        };
    }
    
    /**
     * 獲取入口事件
     */
    getEntranceEvent() {
        const dungeon = this.currentDungeon;
        if (!dungeon) return null;
        
        return {
            type: 'entrance',
            title: `歡迎來到 ${dungeon.name}`,
            description: dungeon.description,
            mechanic: dungeon.mechanic,
            ambiance: dungeon.environment.ambiance
        };
    }
    
    /**
     * 離開副本
     */
    exitDungeon(completed = false) {
        if (!this.currentDungeon) return null;
        
        const dungeon = this.currentDungeon;
        const result = {
            dungeonType: dungeon.id,
            dungeonName: dungeon.name,
            completed: completed,
            floor: this.currentFloor,
            stats: { ...this.dungeonState }
        };
        
        if (completed) {
            // 記錄完成
            if (!this.completionRecords[dungeon.id]) {
                this.completionRecords[dungeon.id] = {
                    firstClear: Date.now(),
                    clearCount: 0,
                    bestTime: null
                };
            }
            this.completionRecords[dungeon.id].clearCount++;
            
            // 設置冷卻
            this.setDungeonCooldown(dungeon.id);
        }
        
        this.saveProgress();
        
        // 清除當前狀態
        this.currentDungeon = null;
        this.currentFloor = 1;
        this.steps = 0;
        
        return result;
    }
    
    // ==================== 副本移動與機制 ====================
    
    /**
     * 在副本中移動一步
     */
    takeStep(playerData) {
        if (!this.currentDungeon) return null;
        
        this.steps++;
        const effects = [];
        
        // 處理副本特殊機制
        const mechanicEffect = this.processMechanic(playerData);
        if (mechanicEffect) {
            effects.push(mechanicEffect);
        }
        
        // 檢查事件觸發
        const event = generateFloorEvent(this.currentDungeon.id);
        if (event) {
            effects.push({ type: 'event', event: event });
        }
        
        // 檢查遭遇怪物
        if (Math.random() < 0.25) {  // 25% 機率遇怪
            const isElite = Math.random() < 0.1;  // 10% 機率是精英
            const monster = generateDungeonMonster(this.currentDungeon.id, this.currentFloor, isElite);
            effects.push({ type: 'combat', monster: monster, isElite: isElite });
        }
        
        return {
            steps: this.steps,
            floor: this.currentFloor,
            effects: effects,
            state: { ...this.dungeonState }
        };
    }
    
    /**
     * 處理副本特殊機制
     */
    processMechanic(playerData) {
        const dungeon = this.currentDungeon;
        if (!dungeon || !dungeon.mechanic) return null;
        
        const mechanic = dungeon.mechanic;
        
        switch (mechanic.type) {
            case 'darkness':
                return this.processDarkness(playerData);
            case 'cold':
                return this.processCold(playerData);
            case 'puzzle':
                return this.processPuzzle(playerData);
            case 'maze':
                return this.processMaze(playerData);
            case 'burn':
                return this.processBurn(playerData);
            default:
                return null;
        }
    }
    
    /**
     * 洞窟：黑暗機制
     */
    processDarkness(playerData) {
        const hasTorch = this.checkCounterItem('torch', playerData);
        const visionRange = hasTorch ? 5 : 3;
        
        return {
            type: 'mechanic',
            mechanicType: 'darkness',
            message: hasTorch ? '火把照亮了周圍...' : '黑暗中只能看到模糊的輪廓...',
            effect: { visionRange: visionRange }
        };
    }
    
    /**
     * 雪山：寒冷機制
     */
    processCold(playerData) {
        const hasWarmth = this.checkCounterItem('warm_cloak', playerData) || 
                          this.checkCounterItem('heart_of_ice', playerData);
        
        if (hasWarmth) {
            return {
                type: 'mechanic',
                mechanicType: 'cold',
                message: '保暖裝備保護著你免受寒冷侵襲',
                effect: { coldLevel: this.dungeonState.coldLevel }
            };
        }
        
        // 增加寒冷值
        this.dungeonState.coldLevel += 2;
        
        let damage = 0;
        let message = `寒冷值: ${this.dungeonState.coldLevel}/100`;
        
        if (this.dungeonState.coldLevel >= 100) {
            // 滿寒冷時受傷
            damage = Math.floor(playerData.maxHp * 0.05);
            message = `極度寒冷！你受到了 ${damage} 點傷害！`;
        }
        
        return {
            type: 'mechanic',
            mechanicType: 'cold',
            message: message,
            effect: { 
                coldLevel: this.dungeonState.coldLevel,
                damage: damage
            }
        };
    }
    
    /**
     * 遺跡：謎題機制
     */
    processPuzzle(playerData) {
        // 謎題只在特定步數觸發
        if (this.steps % 20 !== 0) return null;
        
        return {
            type: 'mechanic',
            mechanicType: 'puzzle',
            message: '你發現了一個機關謎題...',
            effect: { 
                puzzleRequired: true,
                puzzleType: this.generatePuzzle()
            }
        };
    }
    
    /**
     * 生成謎題
     */
    generatePuzzle() {
        const puzzleTypes = ['sequence', 'symbol', 'riddle'];
        const type = puzzleTypes[Math.floor(Math.random() * puzzleTypes.length)];
        
        switch (type) {
            case 'sequence':
                // 記憶序列謎題
                const sequence = [];
                const length = 4 + this.currentFloor;
                for (let i = 0; i < length; i++) {
                    sequence.push(Math.floor(Math.random() * 4));  // 0-3
                }
                return {
                    type: 'sequence',
                    name: '符文序列',
                    description: '記住並重現符文的順序',
                    sequence: sequence,
                    symbols: ['🔴', '🔵', '🟢', '🟡']
                };
                
            case 'symbol':
                // 符號配對謎題
                const symbols = ['⚔️', '🛡️', '🔮', '💎', '🗝️', '📜'];
                const target = symbols[Math.floor(Math.random() * symbols.length)];
                return {
                    type: 'symbol',
                    name: '符號識別',
                    description: `找出與壁畫相同的符號: ${target}`,
                    target: target,
                    options: this.shuffleArray([...symbols])
                };
                
            case 'riddle':
                // 謎語
                const riddles = [
                    { question: '什麼東西越洗越髒？', answer: 0, options: ['水', '手', '衣服', '地板'] },
                    { question: '什麼東西有頭無腳？', answer: 1, options: ['蛇', '蒜', '魚', '蟲'] },
                    { question: '什麼橋不能走？', answer: 2, options: ['石橋', '木橋', '鼻梁', '拱橋'] },
                    { question: '什麼船不能載物？', answer: 0, options: ['宇宙飛船', '輪船', '木船', '鐵船'] }
                ];
                return {
                    type: 'riddle',
                    name: '古老謎語',
                    ...riddles[Math.floor(Math.random() * riddles.length)]
                };
        }
    }
    
    /**
     * 解答謎題
     */
    solvePuzzle(answer) {
        if (!this.currentDungeon) return { success: false };
        
        const hasCodex = this.checkCounterItem('ancient_codex');
        const correctAnswer = this.dungeonState.currentPuzzle?.answer;
        
        const isCorrect = answer === correctAnswer || (hasCodex && Math.random() < 0.5);
        
        if (isCorrect) {
            this.dungeonState.puzzlesSolved++;
            return {
                success: true,
                message: '謎題解開了！前方的門緩緩開啟...',
                reward: {
                    exp: 50 * this.currentFloor,
                    gold: 30 * this.currentFloor
                }
            };
        } else {
            const damage = 30;
            return {
                success: false,
                message: `答案錯誤！陷阱觸發，你受到了 ${damage} 點傷害！`,
                damage: damage
            };
        }
    }
    
    /**
     * 叢林：迷路機制
     */
    processMaze(playerData) {
        const hasBoots = this.checkCounterItem('pathfinder_boots', playerData);
        const hasCompass = this.checkCounterItem('jungle_compass', playerData);
        
        if (hasBoots) {
            return {
                type: 'mechanic',
                mechanicType: 'maze',
                message: '尋路者之靴指引著你的方向...',
                effect: { markers: this.dungeonState.markers }
            };
        }
        
        // 每10步檢查一次迷路
        if (this.steps % 10 === 0 && this.dungeonState.markers < 3) {
            let lostChance = 0.3;
            if (hasCompass) lostChance *= 0.5;
            
            if (Math.random() < lostChance) {
                return {
                    type: 'mechanic',
                    mechanicType: 'maze',
                    message: '你在迷霧中迷失了方向，回到了本層起點！',
                    effect: { 
                        lost: true,
                        markers: this.dungeonState.markers
                    }
                };
            }
        }
        
        return {
            type: 'mechanic',
            mechanicType: 'maze',
            message: `路標收集: ${this.dungeonState.markers}/3`,
            effect: { markers: this.dungeonState.markers }
        };
    }
    
    /**
     * 收集路標
     */
    collectMarker() {
        this.dungeonState.markers++;
        if (this.dungeonState.markers >= 3) {
            return {
                success: true,
                message: '你收集了足夠的路標，迷霧不再能迷惑你了！'
            };
        }
        return {
            success: true,
            message: `收集路標 ${this.dungeonState.markers}/3`
        };
    }
    
    /**
     * 地獄：灼燒機制
     */
    processBurn(playerData) {
        const hasAmulet = this.checkCounterItem('flame_amulet', playerData) ||
                         this.checkCounterItem('crown_of_hell', playerData);
        
        if (hasAmulet) {
            return {
                type: 'mechanic',
                mechanicType: 'burn',
                message: '烈焰護符保護你免受煉獄烈焰的侵蝕',
                effect: { damage: 0 }
            };
        }
        
        const damage = Math.floor(playerData.maxHp * 0.02);
        
        return {
            type: 'mechanic',
            mechanicType: 'burn',
            message: `煉獄烈焰灼燒著你，損失 ${damage} HP！`,
            effect: { damage: damage }
        };
    }
    
    /**
     * 檢查是否擁有對抗道具
     */
    checkCounterItem(itemId, playerData = null) {
        if (!itemId) return false;

        const character = playerData || GameManager.getCharacter?.() || {};
        const equipment = character.equipment || GameManager.getCharacter?.()?.equipment || {};
        const inventory = Array.isArray(character.inventory)
            ? character.inventory
            : (GameManager.getInventory?.() || GameManager.state?.inventory || []);
        const warehouse = Array.isArray(character.warehouse)
            ? character.warehouse
            : (GameManager.state?.warehouse || []);

        const matches = entry => {
            if (!entry) return false;
            const item = entry.item || entry;
            const quantity = Number(entry.quantity ?? 1);
            return quantity > 0 && (entry.id === itemId || item.id === itemId);
        };

        if (Object.values(equipment).some(matches)) return true;
        return [...inventory, ...warehouse].some(matches);
    }
    
    // ==================== 樓層管理 ====================
    
    /**
     * 前進到下一層
     */
    advanceFloor() {
        if (!this.currentDungeon) return null;
        
        this.currentFloor++;
        this.steps = 0;
        
        // 檢查是否到達 Boss 層
        if (this.currentFloor >= this.currentDungeon.bossFloor) {
            return {
                type: 'boss',
                floor: this.currentFloor,
                message: `你到達了最深處... ${this.currentDungeon.monsters.boss.name} 正等待著你！`,
                boss: generateDungeonBoss(this.currentDungeon.id)
            };
        }
        
        return {
            type: 'floor',
            floor: this.currentFloor,
            message: `進入第 ${this.currentFloor} 層`,
            event: generateFloorEvent(this.currentDungeon.id)
        };
    }
    
    /**
     * 獲取當前樓層資訊
     */
    getCurrentFloorInfo() {
        if (!this.currentDungeon) return null;
        
        return {
            dungeonName: this.currentDungeon.name,
            floor: this.currentFloor,
            totalFloors: this.currentDungeon.floors,
            bossFloor: this.currentDungeon.bossFloor,
            steps: this.steps,
            state: { ...this.dungeonState },
            mechanic: this.currentDungeon.mechanic
        };
    }
    
    // ==================== 戰鬥相關 ====================
    
    /**
     * 記錄戰鬥結果
     */
    recordCombat(result) {
        if (!this.currentDungeon) return;
        
        this.dungeonState.monstersKilled += result.victory ? 1 : 0;
        this.dungeonState.damageDealt += result.damageDealt || 0;
        this.dungeonState.damageTaken += result.damageTaken || 0;
    }
    
    /**
     * Boss 戰鬥完成
     */
    completeBossFight(victory, playerData) {
        if (!this.currentDungeon || !victory) {
            return this.exitDungeon(false);
        }
        
        // 獲取 Boss 寶物
        const treasures = this.generateBossRewards();
        
        // 完成副本
        const result = this.exitDungeon(true);
        result.rewards = treasures;
        
        return result;
    }
    
    /**
     * 生成 Boss 獎勵
     */
    generateBossRewards() {
        if (!this.currentDungeon) return null;
        
        const treasures = this.currentDungeon.treasures;
        const rewards = {
            guaranteed: treasures.guaranteed,
            random: []
        };
        
        // 隨機掉落 1-2 個額外物品
        const dropCount = 1 + (Math.random() < 0.3 ? 1 : 0);
        const shuffled = this.shuffleArray([...treasures.random]);
        rewards.random = shuffled.slice(0, dropCount);
        
        // 金幣獎勵
        const boss = this.currentDungeon.monsters.boss;
        rewards.gold = boss.gold[0] + Math.floor(Math.random() * (boss.gold[1] - boss.gold[0]));
        rewards.exp = boss.exp;
        
        return rewards;
    }
    
    // ==================== 工具函數 ====================
    
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    
    /**
     * 格式化時間
     */
    formatTime(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // ==================== 統計數據 ====================
    
    /**
     * 獲取副本統計
     */
    getDungeonStats(dungeonType) {
        return this.completionRecords[dungeonType] || {
            firstClear: null,
            clearCount: 0,
            bestTime: null
        };
    }
    
    /**
     * 獲取所有副本統計
     */
    getAllStats() {
        const stats = {};
        for (const type of Object.values(DungeonType)) {
            stats[type] = this.getDungeonStats(type);
        }
        return stats;
    }
}

// 單例導出
export const dungeonManager = new DungeonManagerClass();

// 向後兼容
export { DungeonManagerClass as DungeonSystemClass };
export const DungeonSystem = dungeonManager;
export default DungeonManagerClass;
