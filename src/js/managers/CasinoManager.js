/**
 * CasinoManager.js
 * 賭場管理器 - 輪盤、老虎機、骰子遊戲邏輯
 * (從 scenes/CasinoSystem.js 搬移而來)
 */
import GameManager from './GameManager.js';
import { Consumable, Item, ItemType, ItemRarity } from '../models/DataModel.js';

// 遊戲類型
export const CasinoGame = {
    SLOTS: 'slots',
    ROULETTE: 'roulette',
    DICE: 'dice',
    BLACKJACK: 'blackjack'
};

// 老虎機符號
const SLOT_SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '7️⃣'];
const SLOT_PAYOUTS = {
    '🍒🍒🍒': 3,
    '🍋🍋🍋': 5,
    '🍊🍊🍊': 8,
    '🍇🍇🍇': 12,
    '⭐⭐⭐': 20,
    '💎💎💎': 50,
    '7️⃣7️⃣7️⃣': 100
};

// 輪盤顏色
const ROULETTE_NUMBERS = [
    { num: 0, color: 'green' },
    { num: 1, color: 'red' }, { num: 2, color: 'black' },
    { num: 3, color: 'red' }, { num: 4, color: 'black' },
    { num: 5, color: 'red' }, { num: 6, color: 'black' },
    { num: 7, color: 'red' }, { num: 8, color: 'black' },
    { num: 9, color: 'red' }, { num: 10, color: 'black' },
    { num: 11, color: 'black' }, { num: 12, color: 'red' },
    { num: 13, color: 'black' }, { num: 14, color: 'red' },
    { num: 15, color: 'black' }, { num: 16, color: 'red' },
    { num: 17, color: 'black' }, { num: 18, color: 'red' },
    { num: 19, color: 'red' }, { num: 20, color: 'black' },
    { num: 21, color: 'red' }, { num: 22, color: 'black' },
    { num: 23, color: 'red' }, { num: 24, color: 'black' },
    { num: 25, color: 'red' }, { num: 26, color: 'black' },
    { num: 27, color: 'red' }, { num: 28, color: 'black' },
    { num: 29, color: 'black' }, { num: 30, color: 'red' },
    { num: 31, color: 'black' }, { num: 32, color: 'red' },
    { num: 33, color: 'black' }, { num: 34, color: 'red' },
    { num: 35, color: 'black' }, { num: 36, color: 'red' }
];

export default class CasinoManager {
    constructor() {
        this.stats = {
            totalBet: 0,
            totalWin: 0,
            gamesPlayed: 0,
            jackpots: 0
        };
        this.dailyBonus = null;
        this.luckyStreak = 0;
    }

    /**
     * 獲取玩家幸運值加成
     */
    getLuckBonus() {
        const char = GameManager.getCharacter();
        const luckBuff = char?.getBuffValue?.('luck') || 0;
        return 1 + (luckBuff / 100);
    }

    // ==================== 老虎機 ====================
    
    playSlots(bet) {
        const validation = this.validateBet(bet, 10, 1000);
        if (!validation.valid) {
            return { success: false, message: validation.message };
        }

        GameManager.removeGold(bet);
        this.stats.totalBet += bet;
        this.stats.gamesPlayed++;

        const reels = this.spinSlots();
        const result = reels.join('');
        
        let multiplier = 0;
        let isJackpot = false;

        if (reels[0] === reels[1] && reels[1] === reels[2]) {
            multiplier = SLOT_PAYOUTS[result] || 2;
            if (result === '7️⃣7️⃣7️⃣') {
                isJackpot = true;
                this.stats.jackpots++;
            }
        } else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
            multiplier = 0.5;
        }

        if (multiplier > 0) {
            multiplier *= this.getLuckBonus();
        }

        const winnings = Math.floor(bet * multiplier);
        if (winnings > 0) {
            GameManager.addGold(winnings);
            this.stats.totalWin += winnings;
            this.luckyStreak++;
        } else {
            this.luckyStreak = 0;
        }

        let bonusMessage = '';
        if (this.luckyStreak >= 3) {
            const streakBonus = Math.floor(bet * 0.2 * this.luckyStreak);
            GameManager.addGold(streakBonus);
            bonusMessage = `🔥 ${this.luckyStreak} 連勝！額外獲得 ${streakBonus}G！`;
        }

        return {
            success: true,
            reels,
            bet,
            multiplier,
            winnings,
            isJackpot,
            netGain: winnings - bet,
            message: this.getSlotsMessage(reels, winnings, isJackpot),
            bonusMessage,
            luckyStreak: this.luckyStreak
        };
    }

    spinSlots() {
        return [
            SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
            SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
            SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]
        ];
    }

    getSlotsMessage(reels, winnings, isJackpot) {
        if (isJackpot) return `🎰 JACKPOT！！！ 獲得 ${winnings}G！`;
        if (winnings > 0) return `🎰 恭喜獲勝！獲得 ${winnings}G`;
        return '🎰 很遺憾，再試一次！';
    }

    // ==================== 輪盤 ====================
    
    playRoulette(bet, betType, betValue) {
        const validation = this.validateBet(bet, 10, 500);
        if (!validation.valid) {
            return { success: false, message: validation.message };
        }

        GameManager.removeGold(bet);
        this.stats.totalBet += bet;
        this.stats.gamesPlayed++;

        const resultIndex = Math.floor(Math.random() * ROULETTE_NUMBERS.length);
        const result = ROULETTE_NUMBERS[resultIndex];

        let isWin = false;
        let multiplier = 0;

        switch (betType) {
            case 'number':
                if (parseInt(betValue) === result.num) {
                    isWin = true;
                    multiplier = 36;
                }
                break;
            case 'color':
                if (betValue === result.color && result.color !== 'green') {
                    isWin = true;
                    multiplier = 2;
                }
                break;
            case 'oddeven':
                if (result.num !== 0) {
                    const isOdd = result.num % 2 === 1;
                    if ((betValue === 'odd' && isOdd) || (betValue === 'even' && !isOdd)) {
                        isWin = true;
                        multiplier = 2;
                    }
                }
                break;
            case 'half':
                if (result.num !== 0) {
                    const isFirstHalf = result.num <= 18;
                    if ((betValue === 'first' && isFirstHalf) || (betValue === 'second' && !isFirstHalf)) {
                        isWin = true;
                        multiplier = 2;
                    }
                }
                break;
        }

        multiplier *= this.getLuckBonus();

        const winnings = isWin ? Math.floor(bet * multiplier) : 0;
        if (winnings > 0) {
            GameManager.addGold(winnings);
            this.stats.totalWin += winnings;
        }

        return {
            success: true,
            result,
            bet,
            betType,
            betValue,
            isWin,
            winnings,
            netGain: winnings - bet,
            message: isWin 
                ? `🎡 ${result.num} (${this.getColorEmoji(result.color)})！恭喜贏得 ${winnings}G！`
                : `🎡 ${result.num} (${this.getColorEmoji(result.color)})。很遺憾...`
        };
    }

    getColorEmoji(color) {
        return { red: '🔴', black: '⚫', green: '🟢' }[color] || color;
    }

    // ==================== 骰子 ====================
    
    playDice(bet, betType) {
        const validation = this.validateBet(bet, 10, 500);
        if (!validation.valid) {
            return { success: false, message: validation.message };
        }

        GameManager.removeGold(bet);
        this.stats.totalBet += bet;
        this.stats.gamesPlayed++;

        const dice = [
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1
        ];
        const total = dice.reduce((a, b) => a + b, 0);
        const isTriple = dice[0] === dice[1] && dice[1] === dice[2];

        let isWin = false;
        let multiplier = 0;

        switch (betType) {
            case 'big':
                if (total >= 11 && total <= 18 && !isTriple) {
                    isWin = true;
                    multiplier = 2;
                }
                break;
            case 'small':
                if (total >= 3 && total <= 10 && !isTriple) {
                    isWin = true;
                    multiplier = 2;
                }
                break;
            case 'triple':
                if (isTriple) {
                    isWin = true;
                    multiplier = 31;
                }
                break;
        }

        multiplier *= this.getLuckBonus();

        const winnings = isWin ? Math.floor(bet * multiplier) : 0;
        if (winnings > 0) {
            GameManager.addGold(winnings);
            this.stats.totalWin += winnings;
        }

        return {
            success: true,
            dice,
            total,
            isTriple,
            bet,
            betType,
            isWin,
            winnings,
            netGain: winnings - bet,
            message: this.getDiceMessage(dice, total, isTriple, isWin, winnings)
        };
    }

    getDiceMessage(dice, total, isTriple, isWin, winnings) {
        const diceStr = dice.map(d => this.getDiceEmoji(d)).join(' ');
        if (isTriple) {
            return isWin 
                ? `🎲 ${diceStr} = 三豹！！大獎 ${winnings}G！`
                : `🎲 ${diceStr} = 三豹！但你沒下注...`;
        }
        return isWin
            ? `🎲 ${diceStr} = ${total}，恭喜贏得 ${winnings}G！`
            : `🎲 ${diceStr} = ${total}，很遺憾...`;
    }

    getDiceEmoji(num) {
        return ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][num - 1] || num;
    }

    // ==================== 通用 ====================

    validateBet(bet, min, max) {
        if (typeof bet !== 'number' || isNaN(bet)) {
            return { valid: false, message: '請輸入有效的金額' };
        }
        if (bet < min) {
            return { valid: false, message: `最小下注金額為 ${min}G` };
        }
        if (bet > max) {
            return { valid: false, message: `最大下注金額為 ${max}G` };
        }
        if (GameManager.getGold() < bet) {
            return { valid: false, message: '金幣不足！' };
        }
        return { valid: true };
    }

    getStats() {
        return {
            ...this.stats,
            netProfit: this.stats.totalWin - this.stats.totalBet,
            winRate: this.stats.gamesPlayed > 0 
                ? Math.floor((this.stats.totalWin / this.stats.totalBet) * 100) 
                : 0
        };
    }

    claimDailyBonus() {
        const today = new Date().toDateString();
        if (this.dailyBonus === today) {
            return { success: false, message: '今天已經領取過了！' };
        }

        this.dailyBonus = today;
        const bonus = 50 + Math.floor(Math.random() * 51);
        GameManager.addGold(bonus);

        return {
            success: true,
            bonus,
            message: `🎁 每日簽到獎勵：${bonus}G！`
        };
    }

    resetStats() {
        this.stats = {
            totalBet: 0,
            totalWin: 0,
            gamesPlayed: 0,
            jackpots: 0
        };
    }
}

// 單例
export const casinoManager = new CasinoManager();
