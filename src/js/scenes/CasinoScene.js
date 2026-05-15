/**
 * CasinoScene.js
 * 賭場場景控制器
 */
import GameManager from '../managers/GameManager.js';
import { casinoManager } from '../managers/CasinoManager.js';
import { questManager, ObjectiveType } from '../managers/QuestManager.js';

export default class CasinoScene {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.currentGame = 'slots';
        this.selectedBetType = 'color';
        this.selectedBetValue = 'red';
        this.selectedDiceBet = 'big';
        this.isSpinning = false;
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.updateUI();
        this.initRouletteOptions();
    }

    cleanup() {
        this.unbindEvents();
    }

    cacheDOM() {
        this.dom = {
            gold: this.container.querySelector('#casino-gold'),
            luck: this.container.querySelector('#casino-luck'),
            resultMessage: this.container.querySelector('#result-message'),
            
            // Tabs
            gameTabs: this.container.querySelectorAll('.game-tab'),
            gamePanels: this.container.querySelectorAll('.game-panel'),
            
            // Slots
            reels: [
                this.container.querySelector('#reel-1'),
                this.container.querySelector('#reel-2'),
                this.container.querySelector('#reel-3')
            ],
            slotsBet: this.container.querySelector('#slots-bet'),
            btnSpin: this.container.querySelector('#btn-spin'),
            betButtons: this.container.querySelectorAll('.bet-btn'),
            
            // Roulette
            rouletteWheel: this.container.querySelector('#roulette-wheel'),
            rouletteResult: this.container.querySelector('#roulette-result'),
            rouletteBet: this.container.querySelector('#roulette-bet'),
            btnRouletteSpin: this.container.querySelector('#btn-roulette-spin'),
            rouletteOptions: this.container.querySelector('#roulette-options'),
            betTypeBtns: this.container.querySelectorAll('.bet-type-btn'),
            
            // Dice
            diceDisplays: [
                this.container.querySelector('#dice-1'),
                this.container.querySelector('#dice-2'),
                this.container.querySelector('#dice-3')
            ],
            diceTotal: this.container.querySelector('#dice-total'),
            diceBet: this.container.querySelector('#dice-bet'),
            btnDiceRoll: this.container.querySelector('#btn-dice-roll'),
            diceBetBtns: this.container.querySelectorAll('.dice-bet-btn'),
            
            // Stats
            statTotalBet: this.container.querySelector('#stat-total-bet'),
            statTotalWin: this.container.querySelector('#stat-total-win'),
            statNet: this.container.querySelector('#stat-net'),
            statGames: this.container.querySelector('#stat-games'),
            
            // Buttons
            btnDailyBonus: this.container.querySelector('#btn-daily-bonus'),
            btnBackLobby: this.container.querySelector('#btn-back-lobby')
        };
    }

    bindEvents() {
        // Tab switching
        this.dom.gameTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchGame(tab.dataset.game));
        });

        // Slots
        this.dom.btnSpin?.addEventListener('click', () => this.playSlots());
        this.dom.betButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.dom.slotsBet.value = btn.dataset.amount;
            });
        });

        // Roulette
        this.dom.btnRouletteSpin?.addEventListener('click', () => this.playRoulette());
        this.dom.betTypeBtns.forEach(btn => {
            btn.addEventListener('click', () => this.selectBetType(btn.dataset.type));
        });

        // Dice
        this.dom.btnDiceRoll?.addEventListener('click', () => this.playDice());
        this.dom.diceBetBtns.forEach(btn => {
            btn.addEventListener('click', () => this.selectDiceBet(btn.dataset.type));
        });

        // Navigation
        this.dom.btnDailyBonus?.addEventListener('click', () => this.claimDailyBonus());
        this.dom.btnBackLobby?.addEventListener('click', () => this.app.loadScene('lobby'));
    }

    unbindEvents() {
        // Clean up if needed
    }

    updateUI() {
        const gold = GameManager.getGold() || 0;
        const char = GameManager.getCharacter();
        const luck = char?.getBuffValue?.('luck') || 0;

        if (this.dom.gold) this.dom.gold.textContent = gold;
        if (this.dom.luck) this.dom.luck.textContent = luck;

        this.updateStats();
    }

    updateStats() {
        const stats = casinoManager.getStats();
        if (this.dom.statTotalBet) this.dom.statTotalBet.textContent = stats.totalBet;
        if (this.dom.statTotalWin) this.dom.statTotalWin.textContent = stats.totalWin;
        if (this.dom.statNet) {
            const net = stats.netProfit;
            this.dom.statNet.textContent = (net >= 0 ? '+' : '') + net;
            this.dom.statNet.className = net >= 0 ? 'positive' : 'negative';
        }
        if (this.dom.statGames) this.dom.statGames.textContent = stats.gamesPlayed;
    }

    switchGame(game) {
        this.currentGame = game;
        
        this.dom.gameTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.game === game);
        });
        
        this.dom.gamePanels.forEach(panel => {
            panel.classList.toggle('active', panel.id === `game-${game}`);
        });
    }

    // ==================== 老虎機 ====================
    
    async playSlots() {
        if (this.isSpinning) return;
        
        const bet = parseInt(this.dom.slotsBet?.value) || 10;
        
        this.isSpinning = true;
        this.dom.btnSpin.disabled = true;
        
        // 動畫效果
        await this.animateSlots();
        
        // 執行遊戲
        const result = casinoManager.playSlots(bet);
        
        // 顯示結果
        if (result.success) {
            this.dom.reels[0].textContent = result.reels[0];
            this.dom.reels[1].textContent = result.reels[1];
            this.dom.reels[2].textContent = result.reels[2];
            
            this.showResult(result.message, result.winnings > 0);
            if (result.bonusMessage) {
                setTimeout(() => this.showResult(result.bonusMessage, true), 1500);
            }
            if (result.isJackpot) {
                this.showJackpot();
                // 任務系統：中頭獎
                questManager.updateStats('jackpot');
            }
            
            // 任務系統：賭博勝利/失敗
            if (result.winnings > 0) {
                questManager.updateProgress(ObjectiveType.GAMBLE_WIN, 'slots', 1);
                questManager.updateProgress(ObjectiveType.GAMBLE_PROFIT, 'any', result.winnings - bet);
                questManager.updateStats('gamble_win');
            } else {
                questManager.updateStats('gamble_loss');
            }
        } else {
            this.showResult(result.message, false);
        }
        
        this.updateUI();
        this.isSpinning = false;
        this.dom.btnSpin.disabled = false;
    }

    async animateSlots() {
        const symbols = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '7'];
        const duration = 2000;
        const interval = 100;
        const iterations = duration / interval;
        
        for (let i = 0; i < iterations; i++) {
            // 漸慢效果
            const delay = interval + (i * 5);
            
            if (i < iterations - 5) {
                this.dom.reels[0].textContent = symbols[Math.floor(Math.random() * symbols.length)];
            }
            if (i < iterations - 3) {
                this.dom.reels[1].textContent = symbols[Math.floor(Math.random() * symbols.length)];
            }
            if (i < iterations - 1) {
                this.dom.reels[2].textContent = symbols[Math.floor(Math.random() * symbols.length)];
            }
            
            await this.sleep(delay);
        }
    }

    showJackpot() {
        const jackpotEl = document.createElement('div');
        jackpotEl.className = 'jackpot-animation';
        jackpotEl.innerHTML = '🎉 JACKPOT! 🎉';
        this.container.appendChild(jackpotEl);
        
        setTimeout(() => jackpotEl.remove(), 3000);
    }

    // ==================== 輪盤 ====================
    
    initRouletteOptions() {
        this.updateRouletteOptions('color');
    }

    selectBetType(type) {
        this.selectedBetType = type;
        this.dom.betTypeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });
        this.updateRouletteOptions(type);
    }

    updateRouletteOptions(type) {
        if (!this.dom.rouletteOptions) return;
        
        let html = '';
        switch (type) {
            case 'color':
                html = `
                    <button class="option-btn active" data-value="red">🔴 紅色</button>
                    <button class="option-btn" data-value="black">⚫ 黑色</button>
                `;
                this.selectedBetValue = 'red';
                break;
            case 'oddeven':
                html = `
                    <button class="option-btn active" data-value="odd">奇數</button>
                    <button class="option-btn" data-value="even">偶數</button>
                `;
                this.selectedBetValue = 'odd';
                break;
            case 'half':
                html = `
                    <button class="option-btn active" data-value="first">1-18</button>
                    <button class="option-btn" data-value="second">19-36</button>
                `;
                this.selectedBetValue = 'first';
                break;
        }
        
        this.dom.rouletteOptions.innerHTML = html;
        
        // 綁定選項按鈕
        this.dom.rouletteOptions.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.dom.rouletteOptions.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedBetValue = btn.dataset.value;
            });
        });
    }

    async playRoulette() {
        if (this.isSpinning) return;
        
        const bet = parseInt(this.dom.rouletteBet?.value) || 10;
        
        this.isSpinning = true;
        this.dom.btnRouletteSpin.disabled = true;
        
        // 動畫
        await this.animateRoulette();
        
        // 執行遊戲
        const result = casinoManager.playRoulette(bet, this.selectedBetType, this.selectedBetValue);
        
        if (result.success) {
            this.dom.rouletteResult.textContent = `${result.result.num}`;
            this.dom.rouletteResult.className = `result-display ${result.result.color}`;
            this.showResult(result.message, result.isWin);
            
            // 任務系統：賭博勝利/失敗
            if (result.isWin) {
                questManager.updateProgress(ObjectiveType.GAMBLE_WIN, 'roulette', 1);
                questManager.updateProgress(ObjectiveType.GAMBLE_PROFIT, 'any', result.winnings - bet);
                questManager.updateStats('gamble_win');
            } else {
                questManager.updateStats('gamble_loss');
            }
        } else {
            this.showResult(result.message, false);
        }
        
        this.updateUI();
        this.isSpinning = false;
        this.dom.btnRouletteSpin.disabled = false;
    }

    async animateRoulette() {
        for (let i = 0; i < 20; i++) {
            const num = Math.floor(Math.random() * 37);
            this.dom.rouletteResult.textContent = num;
            await this.sleep(50 + i * 10);
        }
    }

    // ==================== 骰子 ====================
    
    selectDiceBet(type) {
        this.selectedDiceBet = type;
        this.dom.diceBetBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });
    }

    async playDice() {
        if (this.isSpinning) return;
        
        const bet = parseInt(this.dom.diceBet?.value) || 10;
        
        this.isSpinning = true;
        this.dom.btnDiceRoll.disabled = true;
        
        // 動畫
        await this.animateDice();
        
        // 執行遊戲
        const result = casinoManager.playDice(bet, this.selectedDiceBet);
        
        if (result.success) {
            const diceEmoji = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
            this.dom.diceDisplays[0].textContent = diceEmoji[result.dice[0] - 1];
            this.dom.diceDisplays[1].textContent = diceEmoji[result.dice[1] - 1];
            this.dom.diceDisplays[2].textContent = diceEmoji[result.dice[2] - 1];
            this.dom.diceTotal.textContent = result.total;
            
            this.showResult(result.message, result.isWin);
            
            if (result.isTriple) {
                this.dom.diceDisplays.forEach(d => d.classList.add('triple'));
                setTimeout(() => {
                    this.dom.diceDisplays.forEach(d => d.classList.remove('triple'));
                }, 2000);
            }
            
            // 任務系統：賭博勝利/失敗
            if (result.isWin) {
                questManager.updateProgress(ObjectiveType.GAMBLE_WIN, 'dice', 1);
                questManager.updateProgress(ObjectiveType.GAMBLE_PROFIT, 'any', result.winnings - bet);
                questManager.updateStats('gamble_win');
            } else {
                questManager.updateStats('gamble_loss');
            }
        } else {
            this.showResult(result.message, false);
        }
        
        this.updateUI();
        this.isSpinning = false;
        this.dom.btnDiceRoll.disabled = false;
    }

    async animateDice() {
        const diceEmoji = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        for (let i = 0; i < 15; i++) {
            this.dom.diceDisplays.forEach(d => {
                d.textContent = diceEmoji[Math.floor(Math.random() * 6)];
                d.classList.add('rolling');
            });
            await this.sleep(80);
        }
        this.dom.diceDisplays.forEach(d => d.classList.remove('rolling'));
    }

    // ==================== 通用 ====================
    
    showResult(message, isWin) {
        if (!this.dom.resultMessage) return;
        
        this.dom.resultMessage.textContent = message;
        this.dom.resultMessage.className = `result-message ${isWin ? 'win' : 'lose'} show`;
        
        setTimeout(() => {
            this.dom.resultMessage.classList.remove('show');
        }, 3000);
    }

    claimDailyBonus() {
        const result = casinoManager.claimDailyBonus();
        this.showResult(result.message, result.success);
        if (result.success) {
            this.updateUI();
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
