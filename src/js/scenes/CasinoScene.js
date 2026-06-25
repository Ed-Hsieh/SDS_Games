/**
 * CasinoScene.js
 * 賭場場景控制器
 */
import GameManager from '../managers/GameManager.js';
import { casinoManager } from '../managers/CasinoManager.js';
import { questManager, ObjectiveType } from '../managers/QuestManager.js';
import { attachItemTooltip } from '../utils/ItemTooltip.js';
import { escapeHtml, getItemVisualHtml } from '../utils/ItemDisplay.js';

export default class CasinoScene {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.currentGame = 'dice';
        this.selectedBetType = 'color';
        this.selectedBetValue = 'red';
        this.selectedDiceBet = 'big';
        this.selectedPrizePool = 'daily_curios';
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
            chips: this.container.querySelector('#casino-chips'),
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

            // Dark table
            darkBet: this.container.querySelector('#dark-table-bet'),
            btnDarkTable: this.container.querySelector('#btn-dark-table'),
            darkTableState: this.container.querySelector('#dark-table-state'),
            
            // Stats
            statTotalBet: this.container.querySelector('#stat-total-bet'),
            statTotalWin: this.container.querySelector('#stat-total-win'),
            statNet: this.container.querySelector('#stat-net'),
            statGames: this.container.querySelector('#stat-games'),
            statPrizeDraws: this.container.querySelector('#stat-prize-draws'),
            statHouseAttention: this.container.querySelector('#stat-house-attention'),
            attentionFill: this.container.querySelector('#casino-attention-fill'),
            pressureTitle: this.container.querySelector('#casino-pressure-title'),
            playerRole: this.container.querySelector('#casino-player-role'),
            darkEvent: this.container.querySelector('#casino-dark-event'),

            // Prize pools
            poolList: this.container.querySelector('#casino-pool-list'),
            prizePreview: this.container.querySelector('#casino-prize-preview'),
            btnDrawPrize: this.container.querySelector('#btn-draw-prize'),

            // Cashier
            exchangeButtons: this.container.querySelectorAll('.chip-exchange-btn'),
            ledgerText: this.container.querySelector('#casino-ledger-text'),
            
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

        // Prize pools and cashier
        this.dom.btnDrawPrize?.addEventListener('click', () => this.drawPrize());
        this.dom.exchangeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.exchangeChips(btn.dataset.gold));
        });
        this.dom.btnDarkTable?.addEventListener('click', () => this.playDarkTable());
        this.dom.darkBet?.addEventListener('input', () => this.updateDarkTable());

        // Navigation
        this.dom.btnDailyBonus?.addEventListener('click', () => this.claimDailyBonus());
        this.dom.btnBackLobby?.addEventListener('click', () => this.app.loadScene('lobby'));
    }

    unbindEvents() {
        // Clean up if needed
    }

    updateUI() {
        const gold = GameManager.getGold() || 0;
        const chips = casinoManager.getChips();
        const char = GameManager.getCharacter();
        const luck = char?.getBuffValue?.('luck') || 0;

        if (this.dom.gold) this.dom.gold.textContent = gold;
        if (this.dom.chips) this.dom.chips.textContent = chips;
        if (this.dom.luck) this.dom.luck.textContent = luck;

        this.updateStats();
        this.updateDarkFlow();
        this.updateDarkTable();
        this.renderPrizePools();
        this.updateLedger();
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
        if (this.dom.statPrizeDraws) this.dom.statPrizeDraws.textContent = stats.prizeDraws || 0;
        if (this.dom.statHouseAttention) this.dom.statHouseAttention.textContent = stats.houseAttention || 0;
    }

    updateDarkFlow(eventOverride = null) {
        const pressure = casinoManager.getPressureState?.() || casinoManager.getStats()?.pressure || {};
        const attention = Math.max(0, Math.min(100, Number(pressure.attention) || 0));
        const event = eventOverride || pressure.lastEvent || null;

        if (this.dom.attentionFill) {
            this.dom.attentionFill.style.width = `${attention}%`;
            this.dom.attentionFill.dataset.tone = pressure.tone || 'calm';
        }
        if (this.dom.pressureTitle) {
            this.dom.pressureTitle.textContent = pressure.title || '散客';
            this.dom.pressureTitle.dataset.tone = pressure.tone || 'calm';
        }
        if (this.dom.playerRole) {
            const streakNote = pressure.lossStreak > 0
                ? `連敗 ${pressure.lossStreak}`
                : (pressure.winStreak > 0 ? `連勝 ${pressure.winStreak}` : '局勢平穩');
            const darkTable = pressure.darkTable || {};
            const bloodPaid = Number(darkTable.bloodPaid) || 0;
            const darkNote = bloodPaid > 0
                ? ` / 暗桌血價 ${bloodPaid}`
                : ((Number(darkTable.wins) || 0) > 0 ? ` / 暗桌勝 ${darkTable.wins}` : '');
            this.dom.playerRole.textContent = `${pressure.role || '普通客人'} / ${streakNote}${darkNote}`;
        }
        if (this.dom.darkEvent) {
            const defaultText = pressure.description || '燈火還很漂亮，賭場暫時只把你當成普通客人。';
            this.dom.darkEvent.textContent = event?.message || defaultText;
            this.dom.darkEvent.dataset.tone = event?.tone || pressure.tone || 'calm';
        }
    }

    switchGame(game) {
        this.currentGame = game;
        
        this.dom.gameTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.game === game);
        });
        
        this.dom.gamePanels.forEach(panel => {
            panel.classList.toggle('active', panel.id === `game-${game}`);
        });

        if (game === 'prize') this.renderPrizePools();
        if (game === 'cashier') this.updateLedger();
        if (game === 'dark') this.updateDarkTable();
    }

    renderPrizePools() {
        if (!this.dom.poolList || !this.dom.prizePreview) return;

        const pools = casinoManager.getPrizePools();
        if (!pools.some(pool => pool.id === this.selectedPrizePool)) {
            this.selectedPrizePool = pools[0]?.id || 'daily_curios';
        }

        this.dom.poolList.innerHTML = pools.map(pool => {
            const lockedText = pool.unlocked ? '' : `<span class="casino-pool-lock">第 ${pool.minChapter || 1} 章</span>`;
            return `
                <button class="casino-pool-card ${pool.id === this.selectedPrizePool ? 'active' : ''} ${pool.unlocked ? '' : 'locked'}"
                    data-pool-id="${escapeHtml(pool.id)}">
                    <span>${escapeHtml(pool.subtitle || '')}</span>
                    <strong>${escapeHtml(pool.name)}</strong>
                    <em>${pool.cost} 籌碼 / 保底 ${pool.pity || 0}/${pool.pityAfter || '-'}</em>
                    ${lockedText}
                </button>
            `;
        }).join('');

        this.dom.poolList.querySelectorAll('.casino-pool-card').forEach(button => {
            button.addEventListener('click', () => {
                this.selectedPrizePool = button.dataset.poolId;
                this.renderPrizePools();
            });
        });

        const selectedPool = pools.find(pool => pool.id === this.selectedPrizePool) || pools[0];
        this.renderPrizePreview(selectedPool);
    }

    renderPrizePreview(pool) {
        if (!this.dom.prizePreview) return;
        if (!pool) {
            this.dom.prizePreview.innerHTML = '<div class="casino-empty-note">目前沒有可查看的獎池。</div>';
            if (this.dom.btnDrawPrize) this.dom.btnDrawPrize.disabled = true;
            return;
        }

        const chips = casinoManager.getChips();
        const disabled = !pool.unlocked || chips < pool.cost;
        if (this.dom.btnDrawPrize) {
            this.dom.btnDrawPrize.disabled = disabled;
            this.dom.btnDrawPrize.textContent = pool.unlocked
                ? `抽取奇物（${pool.cost} 籌碼）`
                : '獎池尚未開放';
        }

        const rewardsHtml = (pool.rewards || []).map(reward => {
            const item = reward.item || {
                id: reward.id,
                name: reward.name,
                icon: reward.icon,
                rarity: reward.rarity,
                type: reward.kind === 'gold' ? 'currency' : 'key',
                description: reward.locked ? '章節尚未開放。' : '賭場獎池中的可能獎品。'
            };
            const amountText = reward.amount
                ? this.formatRange(reward.amount)
                : (reward.quantity ? `x${this.formatRange(reward.quantity)}` : '');
            const limitedText = reward.limit ? `${reward.claimed || 0}/${reward.limit}` : '';
            const lockedText = reward.locked ? '<small>未開放</small>' : '';
            return `
                <div class="casino-prize-token rarity-frame rarity-${escapeHtml(reward.rarity || 'common')} ${reward.locked ? 'locked' : ''}" data-reward-id="${escapeHtml(reward.id)}">
                    <span class="casino-prize-icon">${getItemVisualHtml(item, reward.icon || '◆')}</span>
                    <span class="casino-prize-name">${escapeHtml(reward.name || item.name || '未知奇物')}</span>
                    <span class="casino-prize-meta">${escapeHtml(reward.rarityText || reward.rarity || '')} ${escapeHtml(amountText)}</span>
                    ${limitedText ? `<span class="casino-prize-limit">${escapeHtml(limitedText)}</span>` : ''}
                    ${lockedText}
                </div>
            `;
        }).join('');

        this.dom.prizePreview.innerHTML = `
            <div class="casino-prize-heading">
                <span>${escapeHtml(pool.subtitle || '')}</span>
                <h3>${escapeHtml(pool.name)}</h3>
                <p>${escapeHtml(pool.description || '')}</p>
            </div>
            ${this.renderPrizePoolSummary(pool)}
            <div class="casino-prize-atmosphere">${escapeHtml(pool.atmosphere || '')}</div>
            <div class="casino-prize-grid">${rewardsHtml}</div>
        `;

        this.dom.prizePreview.querySelectorAll('.casino-prize-token').forEach(element => {
            const reward = (pool.rewards || []).find(entry => entry.id === element.dataset.rewardId);
            if (!reward) return;
            const item = reward.item || {
                id: reward.id,
                name: reward.name,
                icon: reward.icon,
                rarity: reward.rarity,
                type: reward.kind === 'gold' ? 'currency' : 'key',
                description: reward.locked ? '章節尚未開放。' : '賭場獎池中的可能獎品。'
            };
            attachItemTooltip(element, item, {
                quantity: reward.quantity ? this.formatRange(reward.quantity) : undefined,
                hint: reward.locked ? '章節尚未開放' : `${pool.name} 可能獎品`
            });
        });
    }

    renderPrizePoolSummary(pool = {}) {
        const summary = pool.oddsSummary;
        if (!summary) return '';
        const tierText = (summary.tiers || [])
            .map(tier => `${tier.text} ${tier.percent}%`)
            .join(' / ');
        const lockedReason = this.getPrizePoolLockedReason(pool, summary);
        const pityText = lockedReason || (summary.pityRemaining === null
            ? '無保底'
            : (summary.pityRemaining <= 0
                ? `本抽觸發 ${summary.pityMinRarityText || '稀有'} 保底`
                : `${summary.pityRemaining} 抽後 ${summary.pityMinRarityText || '稀有'} 保底`));
        const limitedText = summary.limitedRemaining > 0
            ? `限量獎剩 ${summary.limitedRemaining}`
            : '限量獎已取完或無限量';

        return `
            <div class="casino-prize-summary ${summary.unlocked ? '' : 'is-locked'}" aria-label="獎池概況">
                <span>${escapeHtml(`${summary.unlocked ? '' : '預覽：'}${tierText || '目前沒有可抽取獎品'}`)}</span>
                <strong>${escapeHtml(pityText)}</strong>
                <em>${escapeHtml(limitedText)}</em>
            </div>
        `;
    }

    getPrizePoolLockedReason(pool = {}, summary = {}) {
        if (summary.unlocked) return '';
        if (summary.lockedByChapter) {
            return `第 ${summary.minChapter || pool.minChapter || 1} 章後開放`;
        }
        if (summary.lockedByFlag) {
            if (pool.id === 'black_market_curios') return '揭穿賭場假勝率後開放';
            if (pool.id === 'last_lamp_jackpot') return '完成賭場補給籌款後開放';
            return '完成相關賭場事件後開放';
        }
        return '尚未開放';
    }

    formatRange(value) {
        if (Array.isArray(value)) return `${value[0]}-${value[1]}`;
        return String(value ?? 1);
    }

    drawPrize() {
        const result = casinoManager.drawPrize(this.selectedPrizePool);
        this.showResult(result.message, result.success);
        if (result.success) {
            const name = result.granted?.name || result.reward?.name || '奇物';
            const unlockedEffects = GameManager.consumePassiveCombatUnlocks?.() || [];
            setTimeout(() => this.showResult('櫃後傳來一聲很輕的笑。', true), 650);
            if (unlockedEffects.length > 0) {
                const effectNames = unlockedEffects.map(effect => effect.name).join('、');
                setTimeout(() => this.showResult(`戰術技能解鎖：${effectNames}。可回大廳旅人卡片更換。`, true), 1350);
            }
            questManager.updateStats?.('casino_prize_draw');
            if (result.reward?.rarity === 'legendary') {
                questManager.updateStats?.('jackpot');
            }
            if (name) this.flashPrize(name, result.reward?.rarity);
            this.updateDarkFlow(result.deepEvent);
        }
        this.updateUI();
    }

    exchangeChips(goldAmount) {
        const result = casinoManager.exchangeGoldForChips(goldAmount);
        this.showResult(result.message, result.success);
        this.updateUI();
    }

    updateLedger() {
        if (!this.dom.ledgerText) return;
        const stats = casinoManager.getStats();
        const attention = stats.houseAttention || 0;
        const chapter = stats.storyChapter || 1;
        const net = stats.netProfit || 0;

        if (attention >= 70) {
            this.dom.ledgerText.textContent = '你的名字被寫在帳冊邊緣，墨水還沒乾。守衛開始記得你的臉。';
        } else if (chapter >= 3) {
            this.dom.ledgerText.textContent = '瑪洛把一部分籌碼換成補給券。賭場還在笑，但笑聲下面多了避難者的腳步聲。';
        } else if (chapter >= 2) {
            this.dom.ledgerText.textContent = '勝率表的曲線不太自然。瑪洛說，如果數字看起來太乖，通常代表有人抓著它的脖子。';
        } else if (net < -300) {
            this.dom.ledgerText.textContent = '你輸掉不少籌碼，桌邊有人遞來一杯劣酒，像是在恭喜你正式成為這裡的一部分。';
        } else {
            this.dom.ledgerText.textContent = '賭場的燈還很亮，帳冊上目前沒有太多值得害怕的曲線。';
        }
    }

    flashPrize(name, rarity = 'common') {
        const badge = document.createElement('div');
        badge.className = `casino-prize-flash rarity-${rarity}`;
        badge.textContent = name;
        this.container.appendChild(badge);
        setTimeout(() => badge.remove(), 1600);
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
            if (result.chipReward > 0) {
                setTimeout(() => this.showResult(`桌邊籌碼滑回你面前：+${result.chipReward} 籌碼。`, true), 700);
            }
            if (result.bonusMessage) {
                setTimeout(() => this.showResult(result.bonusMessage, true), 1500);
            }
            if (result.isJackpot) {
                this.showJackpot();
                // 任務系統：中頭獎
                questManager.updateStats('jackpot');
            }
            this.updateDarkFlow(result.deepEvent);
            
            // 任務系統：賭博勝利/失敗
            if (result.winnings > 0) {
                questManager.updateProgress(ObjectiveType.GAMBLE_WIN, 'slots', 1);
                questManager.updateProgress(ObjectiveType.GAMBLE_PROFIT, 'any', result.winnings - bet);
                questManager.updateStats('gamble_win');
            } else {
                questManager.updateStats('gamble_loss');
            }
            this.updateDarkFlow(result.deepEvent);
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
            if (result.chipReward > 0) {
                setTimeout(() => this.showResult(`帳房記下一筆籌碼回流：+${result.chipReward} 籌碼。`, true), 700);
            }
            
            // 任務系統：賭博勝利/失敗
            if (result.isWin) {
                questManager.updateProgress(ObjectiveType.GAMBLE_WIN, 'roulette', 1);
                questManager.updateProgress(ObjectiveType.GAMBLE_PROFIT, 'any', result.winnings - bet);
                questManager.updateStats('gamble_win');
            } else {
                questManager.updateStats('gamble_loss');
            }
            this.updateDarkFlow(result.deepEvent);
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
            if (result.chipReward > 0) {
                setTimeout(() => this.showResult(`骨骰停住後，莊家推回 +${result.chipReward} 籌碼。`, true), 700);
            }
            
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

    // ==================== 暗桌 ====================

    updateDarkTable() {
        if (!this.dom.btnDarkTable || !this.dom.darkTableState) return;

        const unlocked = casinoManager.isDarkTableUnlocked?.() || false;
        const chips = casinoManager.getChips();
        const bet = parseInt(this.dom.darkBet?.value) || 80;
        const setDarkState = (message, tone = 'neutral') => {
            this.dom.darkTableState.textContent = message;
            this.dom.darkTableState.dataset.tone = tone;
        };

        if (!unlocked) {
            this.dom.btnDarkTable.disabled = true;
            setDarkState('莊家還沒讓你靠近暗桌。當賭場開始記住你，暗門才會打開。', 'locked');
            return;
        }

        if (chips < bet) {
            this.dom.btnDarkTable.disabled = true;
            setDarkState(`籌碼不足。暗桌至少需要 ${bet} 籌碼。`, 'warning');
            return;
        }

        const risk = casinoManager.getDarkTableRiskSnapshot?.(bet);
        if (risk && !risk.canPayBloodPrice) {
            this.dom.btnDarkTable.disabled = true;
            setDarkState(`生命值 ${risk.hp}/${risk.maxHp}。暗桌不收沒有血價的人。`, 'danger');
            return;
        }

        this.dom.btnDarkTable.disabled = false;
        if (risk) {
            setDarkState(
                `勝率約 ${risk.winChancePercent}%。失敗損失 ${risk.damage} 生命（${risk.hp}/${risk.maxHp} → ${risk.projectedHp}/${risk.maxHp}），注視 +${risk.attentionOnLoss}。`,
                risk.lowHp ? 'danger' : 'ready'
            );
        } else {
            setDarkState('暗桌已開。勝利可能換來稀有物，也可能讓莊家盯上你。', 'ready');
        }
    }

    playDarkTable() {
        if (this.isSpinning) return;

        const bet = parseInt(this.dom.darkBet?.value) || 80;
        const result = casinoManager.playDarkTable(bet);
        this.showResult(result.message, result.success && result.isWin);

        if (result.success) {
            if (result.isWin) {
                questManager.updateProgress(ObjectiveType.GAMBLE_WIN, 'dark_table', 1);
                questManager.updateProgress(ObjectiveType.GAMBLE_PROFIT, 'any', result.winnings - bet);
                questManager.updateStats('gamble_win');
                questManager.updateStats('dark_table_win');
                if (result.bonusReward?.title) {
                    this.flashPrize(result.bonusReward.title, 'epic');
                }
            } else {
                questManager.updateStats('gamble_loss');
                questManager.updateStats('dark_table_loss');
            }
            const followUpNotices = [];
            if (!result.isWin && result.damage > 0) {
                followUpNotices.push({
                    message: `生命值 ${result.hpBefore}/${result.maxHp} → ${result.hpAfter}/${result.maxHp}。`,
                    isWin: false
                });
            }
            if (result.isWin && result.bonusReward?.title) {
                followUpNotices.push({
                    message: `暗桌吐出 ${result.bonusReward.title}。`,
                    isWin: true
                });
            }
            if (result.chipReward > 0) {
                followUpNotices.push({
                    message: `暗處有人推回一小疊籌碼：+${result.chipReward}。`,
                    isWin: true
                });
            }
            followUpNotices.forEach((notice, index) => {
                setTimeout(() => this.showResult(notice.message, notice.isWin), 700 + index * 700);
            });
            this.updateDarkFlow(result.deepEvent);
        }

        this.updateUI();
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
