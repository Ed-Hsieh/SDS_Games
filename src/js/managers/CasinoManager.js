/**
 * CasinoManager.js
 * 賭場管理器 - 輪盤、老虎機、骰子遊戲邏輯
 * (從 scenes/CasinoSystem.js 搬移而來)
 */
import GameManager from './GameManager.js';
import { markItemKnown } from './EncyclopediaManager.js';
import { questManager } from './QuestManager.js';
import { ObjectiveType } from '../data/Quests.js';
import {
    CasinoRewardRarityText,
    CasinoRewardTierOrder,
    getCasinoPrizePool,
    getCasinoPrizePools,
    getCasinoShowcaseItems,
    resolveCasinoRewardItem
} from '../data/CasinoRewards.js';

// 遊戲類型
export const CasinoGame = {
    SLOTS: 'slots',
    ROULETTE: 'roulette',
    DICE: 'dice',
    BLACKJACK: 'blackjack',
    DARK_TABLE: 'dark_table'
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

const CASINO_EVENT_LOG_LIMIT = 6;

const CASINO_PRESSURE_BANDS = [
    { min: 85, key: 'invited', title: '暗桌邀請', tone: 'danger', description: '惡魔莊家的影子貼近桌邊，帳房開始把你的名字寫得很慢。' },
    { min: 60, key: 'watched', title: '被盯上的贏家', tone: 'warning', description: '守衛記得你的臉，籌碼滑動時旁邊會安靜半拍。' },
    { min: 25, key: 'known', title: '被記住的客人', tone: 'notice', description: '你不再只是路過的人，帳冊邊緣已經留下一條細線。' },
    { min: 0, key: 'stranger', title: '散客', tone: 'calm', description: '燈火還很漂亮，賭場暫時只把你當成普通客人。' }
];

export default class CasinoManager {
    constructor() {
        this.stats = {
            totalBet: 0,
            totalWin: 0,
            gamesPlayed: 0,
            jackpots: 0,
            chipsBought: 0,
            chipsWon: 0,
            chipsSpent: 0,
            ticketsWon: 0,
            ticketsSpent: 0,
            prizeDraws: 0,
            legendaryPrizes: 0,
            houseAttention: 0,
            lossStreak: 0,
            winStreak: 0,
            deepEvents: 0,
            darkRoomInvites: 0,
            darkTableWins: 0,
            darkTableLosses: 0,
            darkTableBloodPaid: 0,
            showcaseViews: 0
        };
        this.chips = 0;
        this.tickets = 0;
        this.poolState = {};
        this.dailyBonus = null;
        this.luckyStreak = 0;
        this.eventLog = [];
        this.deepEventFlags = {};
        this.lastDeepEvent = null;
        GameManager.registerSaveSystem('casino', this);
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

        if (!this.spendChips(bet)) {
            return { success: false, message: '籌碼不足，請先到帳房兌換。' };
        }
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
            this.addChips(winnings, 'payout');
            this.stats.totalWin += winnings;
            this.luckyStreak++;
        } else {
            this.luckyStreak = 0;
        }

        const outcome = this.recordGameOutcome({
            bet,
            winnings,
            isJackpot,
            game: CasinoGame.SLOTS
        });
        const chipReward = outcome.chipReward;
        const ticketReward = outcome.ticketReward;

        let bonusMessage = '';
        if (this.luckyStreak >= 3) {
            const streakBonus = Math.floor(bet * 0.2 * this.luckyStreak);
            this.addChips(streakBonus, 'payout');
            bonusMessage = `🔥 ${this.luckyStreak} 連勝！額外獲得 ${streakBonus} 枚籌碼！`;
        }

        return {
            success: true,
            reels,
            bet,
            multiplier,
            winnings,
            chipReward,
            ticketReward,
            deepEvent: outcome.deepEvent,
            pressure: this.getPressureState(),
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
        if (isJackpot) return `🎰 JACKPOT！！！ 獲得 ${winnings} 枚籌碼！`;
        if (winnings > 0) return `🎰 恭喜獲勝！獲得 ${winnings} 枚籌碼`;
        return '🎰 很遺憾，再試一次！';
    }

    // ==================== 輪盤 ====================
    
    playRoulette(bet, betType, betValue) {
        const validation = this.validateBet(bet, 10, 500);
        if (!validation.valid) {
            return { success: false, message: validation.message };
        }

        if (!this.spendChips(bet)) {
            return { success: false, message: '籌碼不足，請先到帳房兌換。' };
        }
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
            this.addChips(winnings, 'payout');
            this.stats.totalWin += winnings;
        }

        const outcome = this.recordGameOutcome({
            bet,
            winnings,
            game: CasinoGame.ROULETTE
        });
        const chipReward = outcome.chipReward;
        const ticketReward = outcome.ticketReward;

        return {
            success: true,
            result,
            bet,
            betType,
            betValue,
            isWin,
            winnings,
            chipReward,
            ticketReward,
            deepEvent: outcome.deepEvent,
            pressure: this.getPressureState(),
            netGain: winnings - bet,
            message: isWin 
                ? `🎡 ${result.num} (${this.getColorEmoji(result.color)})！恭喜贏得 ${winnings} 枚籌碼！`
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

        if (!this.spendChips(bet)) {
            return { success: false, message: '籌碼不足，請先到帳房兌換。' };
        }
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
            this.addChips(winnings, 'payout');
            this.stats.totalWin += winnings;
        }

        const outcome = this.recordGameOutcome({
            bet,
            winnings,
            isJackpot: isTriple && isWin,
            game: CasinoGame.DICE
        });
        const chipReward = outcome.chipReward;
        const ticketReward = outcome.ticketReward;

        return {
            success: true,
            dice,
            total,
            isTriple,
            bet,
            betType,
            isWin,
            winnings,
            chipReward,
            ticketReward,
            deepEvent: outcome.deepEvent,
            pressure: this.getPressureState(),
            netGain: winnings - bet,
            message: this.getDiceMessage(dice, total, isTriple, isWin, winnings)
        };
    }

    getDiceMessage(dice, total, isTriple, isWin, winnings) {
        const diceStr = dice.map(d => this.getDiceEmoji(d)).join(' ');
        if (isTriple) {
            return isWin 
                ? `🎲 ${diceStr} = 三豹！！大獎 ${winnings} 枚籌碼！`
                : `🎲 ${diceStr} = 三豹！但你沒下注...`;
        }
        return isWin
            ? `🎲 ${diceStr} = ${total}，恭喜贏得 ${winnings} 枚籌碼！`
            : `🎲 ${diceStr} = ${total}，很遺憾...`;
    }

    getDiceEmoji(num) {
        return ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][num - 1] || num;
    }

    // ==================== 暗桌 ====================

    isDarkTableUnlocked() {
        const pressure = this.getPressureState();
        return pressure.attention >= 60
            || (this.stats.darkRoomInvites || 0) > 0
            || GameManager.getFlag?.('town.casino.demon_dealer_invited')
            || this.hasStoredItem('blood_chip');
    }

    hasStoredItem(itemId) {
        return GameManager.getItemCountAcrossStorage(itemId) > 0;
    }

    getDarkTableRiskSnapshot(bet = 80) {
        const safeBet = Math.max(80, Math.min(800, Math.floor(Number(bet) || 80)));
        const character = GameManager.getCharacter?.();
        const numericMaxHp = Number(character?.maxHp);
        const maxHp = Math.max(1, Math.floor(Number.isFinite(numericMaxHp) ? numericMaxHp : 120));
        const numericHp = Number(character?.hp);
        const rawHp = Math.floor(Number.isFinite(numericHp) ? numericHp : maxHp);
        const hp = Math.max(0, Math.min(maxHp, rawHp));
        const damage = Math.min(Math.max(8, Math.floor(maxHp * 0.16)), Math.max(0, hp - 1));
        const luckLift = Math.max(0, this.getLuckBonus() - 1);
        const winChance = Math.min(0.58, 0.38 + luckLift * 0.45);

        return {
            bet: safeBet,
            hp,
            maxHp,
            damage,
            projectedHp: Math.max(1, hp - damage),
            canPayBloodPrice: hp > 1,
            winChance,
            winChancePercent: Math.round(winChance * 100),
            attentionOnWin: 12,
            attentionOnLoss: 8,
            lowHp: hp > 1 && hp - damage <= Math.ceil(maxHp * 0.25)
        };
    }

    pickDarkTableReward() {
        const roll = Math.random();

        if (roll < 0.28) {
            return {
                itemId: 'black_market_ticket',
                quantity: 1,
                title: '黑市入場券',
                attentionDelta: 5
            };
        }

        if (roll < 0.46) {
            return {
                itemId: 'casino_prize_case',
                quantity: 1,
                title: '封蠟獎箱',
                attentionDelta: 3
            };
        }

        return null;
    }

    playDarkTable(bet) {
        if (!this.isDarkTableUnlocked()) {
            return {
                success: false,
                message: '櫃台後的暗門還沒為你打開。先在賭場留下足夠多的痕跡。'
            };
        }

        const validation = this.validateBet(bet, 80, 800);
        if (!validation.valid) {
            return { success: false, message: validation.message };
        }

        const risk = this.getDarkTableRiskSnapshot(bet);
        if (!risk.canPayBloodPrice) {
            return { success: false, message: '你的生命值太低，暗桌不收沒有血價的人。先離開這裡。' };
        }

        if (!this.spendChips(bet)) {
            return { success: false, message: '籌碼不夠。暗桌不接受口頭承諾。' };
        }

        this.stats.totalBet += bet;
        this.stats.gamesPlayed += 1;

        const isWin = Math.random() < risk.winChance;
        let winnings = 0;
        let damage = 0;
        let hpBefore = risk.hp;
        let hpAfter = risk.hp;
        const maxHp = risk.maxHp;

        if (isWin) {
            this.stats.darkTableWins = (this.stats.darkTableWins || 0) + 1;
            const multiplier = 2.6 + Math.random() * 0.8;
            winnings = Math.floor(bet * multiplier);
            this.addChips(winnings, 'payout');
            this.stats.totalWin += winnings;
            this.stats.houseAttention = Math.min(100, (this.stats.houseAttention || 0) + 12);
        } else {
            this.stats.darkTableLosses = (this.stats.darkTableLosses || 0) + 1;
            this.stats.houseAttention = Math.min(100, (this.stats.houseAttention || 0) + 6);
            const character = GameManager.getCharacter?.();
            const numericHp = Number(character?.hp);
            const currentHp = Number.isFinite(numericHp) ? numericHp : maxHp;
            hpBefore = Math.max(0, Math.min(maxHp, Math.floor(currentHp)));
            damage = Math.min(risk.damage, Math.max(0, hpBefore - 1));
            this.stats.darkTableBloodPaid = (this.stats.darkTableBloodPaid || 0) + damage;
            hpAfter = Math.max(1, hpBefore - damage);
            if (character && damage > 0) {
                GameManager.setCharacterHealth(hpAfter, { reason: 'casino-dark-table' });
            }
        }

        const outcome = this.recordGameOutcome({
            bet,
            winnings,
            isJackpot: isWin && winnings >= bet * 3,
            game: CasinoGame.DARK_TABLE
        });

        let deepEvent = outcome.deepEvent;
        let bonusReward = null;
        if (isWin) {
            bonusReward = this.pickDarkTableReward();
            if (bonusReward) {
                deepEvent = this.createDeepEvent('dark_table_prize', {
                    game: CasinoGame.DARK_TABLE,
                    title: bonusReward.title,
                    message: `惡魔莊家把${bonusReward.title}推到你面前，指甲敲在桌面上，像在替你記帳。`,
                    itemId: bonusReward.itemId,
                    quantity: bonusReward.quantity,
                    tone: 'danger',
                    attentionDelta: bonusReward.attentionDelta
                });
            }
        } else {
            deepEvent = this.createDeepEvent('dark_table_blood_price', {
                game: CasinoGame.DARK_TABLE,
                title: '血籌碼落桌',
                message: `骨製骰子停住，桌邊的燭火忽然變暗。你失去 ${damage} 生命，但莊家仍微笑著等你下一手。`,
                tone: 'danger',
                attentionDelta: 2
            });
        }

        GameManager.markSaveDirty?.('casino-dark-table');

        return {
            success: true,
            game: CasinoGame.DARK_TABLE,
            bet,
            isWin,
            winnings,
            damage,
            hpBefore,
            hpAfter,
            maxHp,
            chipReward: outcome.chipReward,
            ticketReward: outcome.ticketReward,
            bonusReward,
            deepEvent,
            pressure: this.getPressureState(),
            netGain: winnings - bet,
            message: isWin
                ? `暗桌贏局。你收回 ${winnings} 籌碼，桌下有人倒抽一口氣。`
                : `暗桌敗局。你失去 ${damage} 生命，籌碼被拖進桌縫裡。`
        };
    }

    // ==================== 通用 ====================

    getStoryChapter() {
        if (GameManager.getFlag?.('town.casino.relief_fund_counted')) return 3;
        if (
            GameManager.getFlag?.('town.casino.false_odds_exposed')
            || GameManager.getFlag?.('town.market.black_deal_seen')
            || GameManager.getFlag?.('secretShopUnlocked')
        ) {
            return 2;
        }
        return 1;
    }

    getChips() {
        return Math.max(0, Math.floor(Number(this.chips) || 0));
    }

    addChips(amount, reason = 'casino') {
        const safeAmount = Math.max(0, Math.floor(Number(amount) || 0));
        if (safeAmount <= 0) return 0;
        this.chips = this.getChips() + safeAmount;
        if (reason === 'win' || reason === 'payout') this.stats.chipsWon += safeAmount;
        GameManager.markSaveDirty?.(`casino-${reason}`);
        return safeAmount;
    }

    spendChips(amount) {
        const safeAmount = Math.max(0, Math.floor(Number(amount) || 0));
        if (safeAmount <= 0 || this.getChips() < safeAmount) return false;
        this.chips = this.getChips() - safeAmount;
        this.stats.chipsSpent += safeAmount;
        GameManager.markSaveDirty?.('casino-spend-chips');
        return true;
    }

    getTickets() {
        return Math.max(0, Math.floor(Number(this.tickets) || 0));
    }

    addTickets(amount, reason = 'casino') {
        const safeAmount = Math.max(0, Math.floor(Number(amount) || 0));
        if (safeAmount <= 0) return 0;
        this.tickets = this.getTickets() + safeAmount;
        if (reason !== 'refund') {
            this.stats.ticketsWon = (this.stats.ticketsWon || 0) + safeAmount;
        }
        GameManager.markSaveDirty?.(`casino-tickets-${reason}`);
        return safeAmount;
    }

    spendTickets(amount) {
        const safeAmount = Math.max(0, Math.floor(Number(amount) || 0));
        if (safeAmount <= 0 || this.getTickets() < safeAmount) return false;
        this.tickets = this.getTickets() - safeAmount;
        this.stats.ticketsSpent = (this.stats.ticketsSpent || 0) + safeAmount;
        GameManager.markSaveDirty?.('casino-spend-tickets');
        return true;
    }

    exchangeGoldForChips(goldAmount) {
        const amount = Math.max(0, Math.floor(Number(goldAmount) || 0));
        if (amount <= 0) {
            return { success: false, message: '請選擇要兌換的金額。' };
        }

        if (!GameManager.removeGold(amount)) {
            return { success: false, message: '金幣不足，帳房把籌碼推了回來。' };
        }

        const bonusRate = this.getStoryChapter() >= 3 ? 0.1 : 0;
        const chips = Math.floor(amount * (1 + bonusRate));
        this.addChips(chips, 'exchange');
        this.stats.chipsBought += chips;

        return {
            success: true,
            gold: amount,
            chips,
            message: `瑪洛收下 ${amount}G，換給你 ${chips} 枚籌碼。`
        };
    }

    recordGameOutcome({ bet = 0, winnings = 0, isJackpot = false, game = 'unknown' } = {}) {
        const safeBet = Math.max(0, Number(bet) || 0);
        const safeWinnings = Math.max(0, Number(winnings) || 0);
        const netGain = safeWinnings - safeBet;
        let chipReward = 0;
        let ticketReward = 0;
        let deepEvent = null;
        const baseTickets = safeBet > 0 ? Math.max(1, Math.floor(safeBet / 50)) : 0;

        if (safeWinnings > 0) {
            this.stats.lossStreak = 0;
            this.stats.winStreak = (this.stats.winStreak || 0) + 1;
            chipReward = Math.max(6, Math.floor(safeWinnings * (isJackpot ? 0.16 : 0.08)));
            ticketReward = baseTickets + Math.max(1, Math.floor(Math.max(0, netGain) / 120));
            if (isJackpot) ticketReward += Math.max(8, baseTickets * 3);
            if (netGain >= safeBet * 3 || isJackpot) {
                this.stats.houseAttention = Math.min(100, this.stats.houseAttention + (isJackpot ? 12 : 5));
            }

            if (isJackpot) {
                deepEvent = this.createDeepEvent('jackpot_whisper', {
                    game,
                    title: '鈴聲停下後的低語',
                    message: '老虎機的鈴聲停得太整齊。暗處有人笑了一聲，像是在確認你是不是值得邀請。',
                    attentionDelta: 8
                });
            } else if ((this.stats.winStreak || 0) >= 4 && this.stats.houseAttention >= 45) {
                deepEvent = this.createDeepEvent('win_streak_guard', {
                    game,
                    title: '守衛換了站位',
                    message: '你連續把籌碼推回自己面前。守衛沒有靠近，只是把手放在腰側，位置剛好擋住出口。',
                    attentionDelta: 5
                });
            } else if (netGain >= Math.max(80, safeBet * 2)) {
                deepEvent = this.createDeepEvent('clean_big_win', {
                    game,
                    title: '乾淨得過分的勝利',
                    message: '這一局贏得太乾淨。瑪洛在帳冊旁畫了一個小圈，像在替你保留座位。',
                    attentionDelta: 3
                });
            }
        } else {
            this.stats.lossStreak += 1;
            this.stats.winStreak = 0;
            ticketReward = Math.max(1, Math.ceil(baseTickets / 2));
            if (this.stats.lossStreak > 0 && this.stats.lossStreak % 4 === 0) {
                chipReward = 12;
                deepEvent = this.createDeepEvent('ruined_gambler_tip', {
                    game,
                    title: '落魄賭徒的杯底話',
                    message: '桌邊有人把一杯劣酒推過來，杯底壓著幾枚籌碼。他說：「輸到第四次時，才看得見桌腳下面的暗號。」',
                    chips: chipReward,
                    attentionDelta: -2
                });
            }
        }

        const pressureEvent = this.tryCreatePressureEvent(game);
        if (pressureEvent) deepEvent = pressureEvent;

        if (chipReward > 0) this.addChips(chipReward, 'win');
        if (ticketReward > 0) this.addTickets(ticketReward, 'game');
        if (isJackpot && game === CasinoGame.SLOTS) questManager.updateStats('jackpot');
        if (safeWinnings > 0) {
            questManager.updateProgress(ObjectiveType.GAMBLE_WIN, game, 1);
            questManager.updateProgress(ObjectiveType.GAMBLE_PROFIT, 'any', netGain);
            questManager.updateStats('gamble_win');
            if (game === CasinoGame.DARK_TABLE) questManager.updateStats('dark_table_win');
        } else {
            questManager.updateStats('gamble_loss');
            if (game === CasinoGame.DARK_TABLE) questManager.updateStats('dark_table_loss');
        }
        GameManager.markSaveDirty?.('casino-game-outcome');
        return {
            chipReward,
            ticketReward,
            deepEvent
        };
    }

    getPressureState() {
        const attention = Math.max(0, Math.min(100, Math.floor(Number(this.stats.houseAttention) || 0)));
        const band = CASINO_PRESSURE_BANDS.find(entry => attention >= entry.min) || CASINO_PRESSURE_BANDS[CASINO_PRESSURE_BANDS.length - 1];
        const netProfit = this.stats.totalWin - this.stats.totalBet;
        let role = '普通客人';
        if (GameManager.getFlag?.('town.casino.relief_fund_counted')) {
            role = '補給籌款人';
        } else if (GameManager.getFlag?.('town.casino.false_odds_exposed')) {
            role = '黑市常客';
        } else if ((this.stats.prizeDraws || 0) > 0) {
            role = '奇物追逐者';
        } else if (netProfit < -300 || (this.stats.lossStreak || 0) >= 4) {
            role = '落魄賭客';
        } else if (netProfit > 250 || (this.stats.winStreak || 0) >= 3) {
            role = '被記帳的贏家';
        }

        return {
            ...band,
            role,
            attention,
            lossStreak: this.stats.lossStreak || 0,
            winStreak: this.stats.winStreak || 0,
            darkTable: {
                wins: this.stats.darkTableWins || 0,
                losses: this.stats.darkTableLosses || 0,
                bloodPaid: this.stats.darkTableBloodPaid || 0
            },
            lastEvent: this.lastDeepEvent,
            eventLog: this.eventLog.slice()
        };
    }

    createDeepEvent(eventId, options = {}) {
        const attentionDelta = Number(options.attentionDelta) || 0;
        if (attentionDelta !== 0) {
            this.stats.houseAttention = Math.max(0, Math.min(100, (this.stats.houseAttention || 0) + attentionDelta));
        }

        const grants = [];
        const chips = Math.max(0, Math.floor(Number(options.chips) || 0));
        if (options.itemId) {
            const granted = this.grantDeepEventItem(options.itemId, options.quantity || 1);
            if (granted) grants.push(granted);
        }
        if (chips > 0) {
            grants.push({ kind: 'chips', amount: chips, name: '籌碼' });
        }

        const event = {
            id: eventId,
            title: options.title || '賭場暗流',
            message: options.message || '',
            tone: options.tone || (attentionDelta > 0 ? 'warning' : 'notice'),
            game: options.game || 'casino',
            attention: Math.max(0, Math.min(100, Math.floor(Number(this.stats.houseAttention) || 0))),
            grants,
            at: Date.now()
        };

        this.lastDeepEvent = event;
        this.eventLog = [event, ...(this.eventLog || [])].slice(0, CASINO_EVENT_LOG_LIMIT);
        this.stats.deepEvents = (this.stats.deepEvents || 0) + 1;
        GameManager.markSaveDirty?.('casino-deep-event');
        return event;
    }

    tryCreatePressureEvent(game) {
        const attention = Math.max(0, Math.min(100, Number(this.stats.houseAttention) || 0));
        if (attention >= 85 && !this.deepEventFlags.demonDealerInvite) {
            this.deepEventFlags.demonDealerInvite = true;
            this.stats.darkRoomInvites = (this.stats.darkRoomInvites || 0) + 1;
            GameManager.setFlag?.('town.casino.demon_dealer_invited', true);
            return this.createDeepEvent('demon_dealer_invite', {
                game,
                title: '暗桌後方有人叫你',
                message: '一枚血色籌碼從桌面另一端滑來。莊家的聲音很低：「再往前一步，輸贏就不只是金幣了。」',
                itemId: 'blood_chip',
                quantity: 1,
                tone: 'danger',
                attentionDelta: 0
            });
        }

        if (attention >= 65 && !this.deepEventFlags.guardWarning) {
            this.deepEventFlags.guardWarning = true;
            return this.createDeepEvent('guard_warning', {
                game,
                title: '守衛記住了你的臉',
                message: '你起身時，守衛比你早一步看向出口。賭場還在歡迎你，只是歡迎得很有重量。',
                tone: 'warning',
                attentionDelta: 0
            });
        }

        if ((this.stats.lossStreak || 0) >= 8 && !this.deepEventFlags.blackMarketTicket) {
            this.deepEventFlags.blackMarketTicket = true;
            return this.createDeepEvent('black_market_ticket_under_table', {
                game,
                title: '桌腳下的黑市籤',
                message: '你低頭撿起掉落的籌碼，才發現桌腳下卡著一張黑市籤。有人把輸家的視線也算進交易裡。',
                itemId: 'black_market_ticket',
                quantity: 1,
                tone: 'notice',
                attentionDelta: 4
            });
        }

        return null;
    }

    grantDeepEventItem(itemId, quantity = 1) {
        const item = resolveCasinoRewardItem(itemId);
        if (!item) return null;
        const safeQuantity = this.rollQuantity(quantity);
        const addedToInventory = GameManager.addToInventory(item, safeQuantity);
        const addedToWarehouse = addedToInventory ? false : GameManager.addToWarehouse(item, safeQuantity);
        markItemKnown(item.id);
        return {
            kind: 'item',
            item,
            quantity: safeQuantity,
            storage: addedToInventory ? 'inventory' : (addedToWarehouse ? 'warehouse' : 'lost'),
            name: item.name
        };
    }

    isPoolUnlocked(pool = {}) {
        const chapter = this.getStoryChapter();
        if (chapter < (pool.minChapter || 1)) return false;
        if (pool.unlockFlag && !GameManager.getFlag?.(pool.unlockFlag)) return false;
        return true;
    }

    getPoolState(poolId) {
        if (!this.poolState[poolId] || typeof this.poolState[poolId] !== 'object') {
            this.poolState[poolId] = { draws: 0, claimed: {} };
        }
        if (!this.poolState[poolId].claimed || typeof this.poolState[poolId].claimed !== 'object') {
            this.poolState[poolId].claimed = {};
        }
        return this.poolState[poolId];
    }

    getPrizePools() {
        const chapter = this.getStoryChapter();
        return getCasinoPrizePools().map(pool => {
            const state = this.getPoolState(pool.id);
            return {
                ...pool,
                chapter,
                unlocked: this.isPoolUnlocked(pool),
                draws: state.draws || 0,
                claimed: { ...(state.claimed || {}) },
                oddsSummary: this.getPoolOddsSummary(pool),
                rewards: this.getVisibleRewards(pool.id)
            };
        });
    }

    getPoolOddsSummary(pool) {
        if (!pool) return null;
        const state = this.getPoolState(pool.id);
        const unlocked = this.isPoolUnlocked(pool);
        const chapter = this.getStoryChapter();
        const rewards = unlocked
            ? this.getEligibleRewards(pool)
            : (pool.rewards || []).filter(reward => {
                if (reward.limit && (state.claimed?.[reward.id] || 0) >= reward.limit) return false;
                return true;
            });
        const totalWeight = rewards.reduce((sum, reward) => sum + Math.max(0, Number(reward.weight) || 0), 0);
        const tiers = Object.entries(CasinoRewardTierOrder)
            .map(([rarity, tier]) => {
                const weight = rewards
                    .filter(reward => reward.rarity === rarity)
                    .reduce((sum, reward) => sum + Math.max(0, Number(reward.weight) || 0), 0);
                return {
                    rarity,
                    tier,
                    text: CasinoRewardRarityText[rarity] || rarity,
                    weight,
                    percent: totalWeight > 0 ? Math.round((weight / totalWeight) * 100) : 0
                };
            })
            .filter(entry => entry.weight > 0)
            .sort((a, b) => a.tier - b.tier);

        const bestTier = tiers.reduce((best, tier) => tier.tier > (best?.tier || 0) ? tier : best, null);
        const limitedRemaining = rewards.filter(reward => reward.limit).reduce((sum, reward) => {
            const claimed = Number(state.claimed?.[reward.id]) || 0;
            return sum + Math.max(0, Number(reward.limit) - claimed);
        }, 0);

        return {
            unlocked,
            minChapter: pool.minChapter || 1,
            chapter,
            unlockFlag: pool.unlockFlag || '',
            lockedByChapter: chapter < (pool.minChapter || 1),
            lockedByFlag: Boolean(pool.unlockFlag && !GameManager.getFlag?.(pool.unlockFlag)),
            totalWeight,
            tiers,
            bestRarity: bestTier?.rarity || null,
            bestRarityText: bestTier?.text || '',
            limitedRemaining,
            drawCost: Number(pool.cost) || 0,
            costCurrency: 'tickets',
            noPity: true
        };
    }

    getShowcaseItems() {
        return getCasinoShowcaseItems().map(entry => ({
            ...entry,
            seen: Boolean(GameManager.getFlag?.(entry.hookFlag))
        }));
    }

    getShowcaseRouteState() {
        const items = this.getShowcaseItems();
        const examinedCount = items.filter(item => item.seen).length;
        const finalChoiceUnlocked = Boolean(GameManager.getFlag?.('town.casino.showcase_final_choice_unlocked'));
        return {
            seenShowcase: Boolean(GameManager.getFlag?.('town.casino.showcase_seen')),
            examinedCount,
            total: items.length,
            futureRouteId: 'vesper_showcase_route',
            questHookReady: examinedCount >= 2,
            finalChoiceUnlocked,
            finalChoiceClaimed: Boolean(GameManager.getFlag?.('town.casino.showcase_final_choice_claimed'))
        };
    }

    inspectShowcaseItem(showcaseId) {
        const showcase = this.getShowcaseItems().find(entry => entry.id === showcaseId);
        if (!showcase) {
            return { success: false, message: '展示櫃裡沒有這件展品。' };
        }

        const wasSeen = Boolean(GameManager.getFlag?.(showcase.hookFlag));
        GameManager.setFlag?.('town.casino.showcase_seen', true);
        GameManager.setFlag?.(showcase.hookFlag, true);

        let deepEvent = null;
        if (!wasSeen) {
            this.stats.showcaseViews = (this.stats.showcaseViews || 0) + 1;
            if ((this.stats.showcaseViews || 0) === 1) {
                this.stats.houseAttention = Math.min(100, (this.stats.houseAttention || 0) + 4);
                deepEvent = this.createDeepEvent('showcase_owner_attention', {
                    game: 'showcase',
                    title: '展示櫃後的視線',
                    message: '你停在展示櫃前太久。二樓帷幕後有人把酒杯放下，像終於確認你看見了真正的賭注。',
                    tone: 'warning',
                    attentionDelta: 0
                });
            }
        }

        GameManager.markSaveDirty?.('casino-showcase-inspect');
        return {
            success: true,
            showcase,
            state: this.getShowcaseRouteState(),
            deepEvent,
            message: wasSeen
                ? `${showcase.cabinetTitle}：你再次看向 ${showcase.name}。賭場老闆像是早知道你會回頭。`
                : `${showcase.cabinetTitle}：你看見 ${showcase.name}。展示牌背面似乎藏著賭場老闆的私人標記。`
        };
    }

    getVisibleRewards(poolId) {
        const pool = getCasinoPrizePool(poolId);
        if (!pool) return [];
        const chapter = this.getStoryChapter();
        const state = this.getPoolState(pool.id);
        const eligibleRewards = this.getEligibleRewards(pool);
        const totalEligibleWeight = eligibleRewards.reduce((sum, reward) => sum + Math.max(0, Number(reward.weight) || 0), 0);
        return (pool.rewards || []).map(reward => {
            const item = reward.itemId ? resolveCasinoRewardItem(reward.itemId) : null;
            const claimed = state.claimed?.[reward.id] || 0;
            const locked = chapter < (reward.minChapter || pool.minChapter || 1);
            const exhausted = reward.limit && claimed >= reward.limit;
            const odds = !locked && !exhausted && totalEligibleWeight > 0
                ? (Math.max(0, Number(reward.weight) || 0) / totalEligibleWeight) * 100
                : 0;
            return {
                ...reward,
                item,
                name: reward.name || item?.name || '未知奇物',
                icon: reward.icon || item?.icon || '◆',
                claimed,
                locked,
                exhausted,
                oddsPercent: this.formatOddsPercent(odds),
                rarityText: CasinoRewardRarityText[reward.rarity] || reward.rarity
            };
        });
    }

    formatOddsPercent(percent) {
        if (!Number.isFinite(percent) || percent <= 0) return '0%';
        if (percent < 1) return `${percent.toFixed(2)}%`;
        if (percent < 10) return `${percent.toFixed(1)}%`;
        return `${Math.round(percent)}%`;
    }

    getEligibleRewards(pool) {
        const chapter = this.getStoryChapter();
        const state = this.getPoolState(pool.id);
        return (pool.rewards || []).filter(reward => {
            if (chapter < (reward.minChapter || pool.minChapter || 1)) return false;
            if (reward.limit && (state.claimed?.[reward.id] || 0) >= reward.limit) return false;
            return true;
        });
    }

    drawPrize(poolId) {
        const pool = getCasinoPrizePool(poolId);
        if (!pool) return { success: false, message: '找不到這個獎池。' };
        if (!this.isPoolUnlocked(pool)) {
            return { success: false, message: `${pool.name} 還沒開櫃。` };
        }
        if (!this.spendTickets(pool.cost)) {
            return { success: false, message: `獎券不足，需要 ${pool.cost} 張獎券。先玩賭局累積獎券。` };
        }

        const reward = this.pickReward(pool);
        if (!reward) {
            this.addTickets(pool.cost, 'refund');
            return { success: false, message: '這個獎池暫時沒有可抽取的獎品。' };
        }

        const state = this.getPoolState(pool.id);
        state.draws = (state.draws || 0) + 1;
        state.claimed[reward.id] = (state.claimed[reward.id] || 0) + 1;
        this.stats.prizeDraws += 1;

        const granted = this.grantReward(reward);
        const rewardTier = CasinoRewardTierOrder[reward.rarity] || 1;
        if (reward.rarity === 'legendary') {
            this.stats.legendaryPrizes += 1;
            this.stats.houseAttention = Math.min(100, this.stats.houseAttention + 18);
        } else if ((CasinoRewardTierOrder[reward.rarity] || 1) >= CasinoRewardTierOrder.epic) {
            this.stats.houseAttention = Math.min(100, this.stats.houseAttention + 7);
        }

        const deepEvent = this.recordPrizeOutcome(pool, reward, granted);
        questManager.updateStats('casino_prize_draw');
        if (reward.rarity === 'legendary') questManager.updateStats('jackpot');

        GameManager.markSaveDirty?.('casino-prize-draw');

        return {
            success: true,
            pool,
            reward,
            granted,
            deepEvent,
            pressure: this.getPressureState(),
            state: { ...state, claimed: { ...state.claimed } },
            message: this.getPrizeMessage(pool, reward, granted)
        };
    }

    recordPrizeOutcome(pool, reward, granted) {
        const tier = CasinoRewardTierOrder[reward.rarity] || 1;
        const poolId = pool?.id || 'unknown';

        if (reward.itemId === 'demon_contract' || reward.rarity === 'legendary') {
            return this.createDeepEvent('legendary_prize_whisper', {
                game: poolId,
                title: '奇物櫃裡傳出呼吸聲',
                message: `你抽出 ${granted?.name || reward.name || '傳說奇物'} 時，牆上的影子慢了半拍。這不是獎品，這像是一份回信。`,
                tone: 'danger',
                attentionDelta: 7
            });
        }

        if (tier >= CasinoRewardTierOrder.epic) {
            return this.createDeepEvent('sealed_case_opened', {
                game: poolId,
                title: '封蠟被撬開',
                message: `奇物櫃開出 ${granted?.name || reward.name || '稀有物品'}。瑪洛沒有恭喜你，只把那筆帳往後翻了一頁。`,
                tone: 'warning',
                attentionDelta: 2
            });
        }

        if (reward.itemId === 'relief_voucher') {
            return this.createDeepEvent('relief_voucher_counted', {
                game: poolId,
                title: '補給券被放進木箱',
                message: '那張補給券沒有金幣閃亮，卻讓角落裡的人短暫安靜下來。',
                tone: 'notice',
                attentionDelta: -2
            });
        }

        return this.tryCreatePressureEvent(poolId);
    }

    pickReward(pool) {
        const rewards = this.getEligibleRewards(pool);
        const totalWeight = rewards.reduce((sum, reward) => sum + Math.max(0, Number(reward.weight) || 0), 0);
        if (!rewards.length || totalWeight <= 0) return null;

        let roll = Math.random() * totalWeight;
        for (const reward of rewards) {
            roll -= Math.max(0, Number(reward.weight) || 0);
            if (roll <= 0) return reward;
        }
        return rewards[rewards.length - 1];
    }

    rollQuantity(quantity) {
        if (Array.isArray(quantity)) {
            const min = Math.floor(Number(quantity[0]) || 1);
            const max = Math.max(min, Math.floor(Number(quantity[1]) || min));
            return min + Math.floor(Math.random() * (max - min + 1));
        }
        return Math.max(1, Math.floor(Number(quantity) || 1));
    }

    grantReward(reward) {
        if (reward.kind === 'gold') {
            const amount = this.rollQuantity(reward.amount);
            GameManager.addGold(amount);
            return { kind: 'gold', amount, name: reward.name || '金幣' };
        }

        if (reward.kind === 'chips') {
            const amount = this.rollQuantity(reward.amount);
            this.addChips(amount, 'prize');
            return { kind: 'chips', amount, name: reward.name || '籌碼' };
        }

        if (reward.kind === 'item') {
            const item = resolveCasinoRewardItem(reward.itemId);
            if (!item) return { kind: 'item', failed: true, name: reward.itemId || '未知物品' };
            const quantity = this.rollQuantity(reward.quantity);
            const addedToInventory = GameManager.addToInventory(item, quantity);
            const addedToWarehouse = addedToInventory ? false : GameManager.addToWarehouse(item, quantity);
            markItemKnown(item.id);
            return {
                kind: 'item',
                item,
                quantity,
                storage: addedToInventory ? 'inventory' : (addedToWarehouse ? 'warehouse' : 'lost'),
                name: item.name
            };
        }

        return { kind: reward.kind || 'unknown', name: reward.name || '未知獎品' };
    }

    getPrizeMessage(pool, reward, granted) {
        const rarityText = CasinoRewardRarityText[reward.rarity] || reward.rarity;
        if (granted.kind === 'gold') {
            return `${pool.name} 開出 ${rarityText} 獎：${granted.amount}G。`;
        }
        if (granted.kind === 'chips') {
            return `${pool.name} 開出 ${rarityText} 獎：${granted.amount} 枚籌碼。`;
        }
        if (granted.kind === 'item') {
            const suffix = granted.storage === 'warehouse' ? '背包已滿，已送入倉庫。' : '已放入背包。';
            return `${pool.name} 開出 ${rarityText} 獎：${granted.name} x${granted.quantity}。${suffix}`;
        }
        return `${pool.name} 開出 ${rarityText} 獎：${reward.name || granted.name}。`;
    }

    validateBet(bet, min, max) {
        if (typeof bet !== 'number' || isNaN(bet)) {
            return { valid: false, message: '請輸入有效的金額' };
        }
        if (bet < min) {
            return { valid: false, message: `最小下注籌碼為 ${min}` };
        }
        if (bet > max) {
            return { valid: false, message: `最大下注籌碼為 ${max}` };
        }
        if (this.getChips() < bet) {
            return { valid: false, message: '籌碼不足，請先到帳房兌換。' };
        }
        return { valid: true };
    }

    getStats() {
        return {
            ...this.stats,
            chips: this.getChips(),
            tickets: this.getTickets(),
            storyChapter: this.getStoryChapter(),
            netProfit: this.stats.totalWin - this.stats.totalBet,
            winRate: this.stats.gamesPlayed > 0 
                ? Math.floor((this.stats.totalWin / this.stats.totalBet) * 100) 
                : 0,
            pressure: this.getPressureState()
        };
    }

    claimDailyBonus() {
        const today = new Date().toDateString();
        if (this.dailyBonus === today) {
            return { success: false, message: '今天已經領取過了！' };
        }

        this.dailyBonus = today;
        const bonus = 50 + Math.floor(Math.random() * 51);
        const chips = 35 + Math.floor(Math.random() * 26);
        const tickets = 3 + Math.floor(Math.random() * 3);
        GameManager.addGold(bonus);
        this.addChips(chips, 'daily');
        this.addTickets(tickets, 'daily');

        return {
            success: true,
            bonus,
            chips,
            tickets,
            message: `帳房把今日開桌分紅推給你：${bonus}G / ${chips} 枚籌碼 / ${tickets} 張獎券。`
        };
    }

    resetStats() {
        this.stats = {
            totalBet: 0,
            totalWin: 0,
            gamesPlayed: 0,
            jackpots: 0,
            chipsBought: 0,
            chipsWon: 0,
            chipsSpent: 0,
            ticketsWon: 0,
            ticketsSpent: 0,
            prizeDraws: 0,
            legendaryPrizes: 0,
            houseAttention: 0,
            lossStreak: 0,
            winStreak: 0,
            deepEvents: 0,
            darkRoomInvites: 0,
            darkTableWins: 0,
            darkTableLosses: 0,
            darkTableBloodPaid: 0,
            showcaseViews: 0
        };
        this.chips = 0;
        this.tickets = 0;
        this.poolState = {};
        this.dailyBonus = null;
        this.luckyStreak = 0;
        this.eventLog = [];
        this.deepEventFlags = {};
        this.lastDeepEvent = null;
    }

    serialize() {
        return {
            stats: { ...this.stats },
            chips: this.getChips(),
            tickets: this.getTickets(),
            poolState: JSON.parse(JSON.stringify(this.poolState || {})),
            dailyBonus: this.dailyBonus,
            luckyStreak: this.luckyStreak,
            eventLog: JSON.parse(JSON.stringify(this.eventLog || [])),
            deepEventFlags: { ...(this.deepEventFlags || {}) },
            lastDeepEvent: this.lastDeepEvent ? { ...this.lastDeepEvent } : null
        };
    }

    deserialize(data = {}) {
        this.stats = {
            totalBet: 0,
            totalWin: 0,
            gamesPlayed: 0,
            jackpots: 0,
            chipsBought: 0,
            chipsWon: 0,
            chipsSpent: 0,
            ticketsWon: 0,
            ticketsSpent: 0,
            prizeDraws: 0,
            legendaryPrizes: 0,
            houseAttention: 0,
            lossStreak: 0,
            winStreak: 0,
            deepEvents: 0,
            darkRoomInvites: 0,
            darkTableWins: 0,
            darkTableLosses: 0,
            darkTableBloodPaid: 0,
            showcaseViews: 0,
            ...(data.stats || {})
        };
        this.chips = Math.max(0, Math.floor(Number(data.chips) || 0));
        this.tickets = Math.max(0, Math.floor(Number(data.tickets) || 0));
        this.poolState = data.poolState && typeof data.poolState === 'object'
            ? data.poolState
            : {};
        this.dailyBonus = data.dailyBonus || null;
        this.luckyStreak = Math.max(0, Number(data.luckyStreak) || 0);
        this.eventLog = Array.isArray(data.eventLog)
            ? data.eventLog.slice(0, CASINO_EVENT_LOG_LIMIT)
            : [];
        this.deepEventFlags = data.deepEventFlags && typeof data.deepEventFlags === 'object'
            ? { ...data.deepEventFlags }
            : {};
        this.lastDeepEvent = data.lastDeepEvent || this.eventLog[0] || null;
    }

    resetProgress() {
        this.resetStats();
    }
}

// 單例
export const casinoManager = new CasinoManager();
