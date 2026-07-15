export function ensureCombatStage(root) {
    const existing = root?.querySelector?.('[data-combat-stage]');
    if (existing) return existing;
    if (!root) return null;

    const stage = document.createElement('div');
    stage.className = 'adventure-combat-overlay scene-combat-overlay';
    stage.id = 'adventure-combat-overlay';
    stage.dataset.combatStage = '';
    stage.hidden = true;
    stage.innerHTML = `
        <div class="vfx-lab adventure-combat-shell" id="adventure-combat-root" data-combat-root data-lab-mode="combat">
            <section class="battle-preview" id="battle-preview" aria-label="戰鬥" tabindex="0">
                <img class="battle-background" id="battle-background" alt="">
                <div class="battle-grade" aria-hidden="true"></div>
                <canvas class="vfx-canvas vfx-canvas-rear" id="vfx-canvas-rear" aria-hidden="true"></canvas>
                <header class="enemy-hud" aria-label="敵人狀態">
                    <div class="enemy-identity"><span class="enemy-class" id="enemy-class">遭遇</span><h1 id="enemy-name">敵人</h1></div>
                    <div class="enemy-vitals"><div class="enemy-level">LV. <strong id="enemy-level">1</strong></div><div class="health-track enemy-health-track"><div class="health-loss" id="enemy-health-loss"></div><div class="health-fill" id="enemy-health-fill"></div></div><div class="health-value"><span id="enemy-hp">0</span> / <span id="enemy-max-hp">0</span></div></div>
                </header>
                <div class="enemy-intent" id="enemy-intent" hidden>
                    <div class="intent-head"><span id="intent-state">蓄勢</span><strong id="intent-name">攻擊</strong><time id="intent-time">0.00s</time></div>
                    <div class="intent-track"><div class="intent-fill" id="intent-fill"></div></div>
                    <div class="break-head"><span>破勢</span><strong id="break-value">0 / 0</strong></div>
                    <div class="break-track"><div class="break-fill" id="break-fill"></div></div>
                </div>
                <div class="enemy-stage" id="enemy-stage"><div class="enemy-aura" id="enemy-aura" aria-hidden="true"></div><img class="enemy-visual" id="enemy-visual" alt=""></div>
                <canvas class="vfx-canvas vfx-canvas-front" id="vfx-canvas-front" aria-hidden="true"></canvas>
                <div class="screen-flash" id="screen-flash" aria-hidden="true"></div><div class="damage-vignette" id="damage-vignette" aria-hidden="true"></div>
                <div class="skill-banner" id="skill-banner" aria-live="polite"><span id="skill-source">MONSTER</span><strong id="skill-name">攻擊</strong></div>
                <div class="float-layer" id="float-layer" aria-live="polite"></div>
                <div class="combat-result" id="combat-result" hidden><span id="combat-result-kicker">BATTLE COMPLETE</span><strong id="combat-result-title">勝利</strong><div class="adventure-combat-rewards" id="adventure-combat-rewards"></div><button id="combat-result-restart" type="button">繼續</button></div>
                <div class="combat-status-dock" aria-label="戰鬥狀態效果"><div class="status-lane player-status-strip"><span class="status-label">BUFF</span><div class="buff-list" id="player-buff-list"></div></div><div class="status-lane enemy-status-strip"><span class="status-label">DEBUFF</span><div class="enemy-status-row" id="enemy-status-row"></div></div></div>
                <footer class="player-hud" aria-label="玩家戰鬥狀態">
                    <section class="rhythm-control rhythm-control-main" aria-label="主武器節奏環"><header class="rhythm-control-head"><span>主武器</span><kbd>LMB</kbd></header><div class="combat-rhythm-ring rhythm-ring" id="lab-main-rhythm-ring" data-rhythm-mode="ring"><div class="zone-miss"></div><div class="hit-zone" id="lab-main-hit-zone"></div><div class="crit-zone" id="lab-main-crit-zone"></div><div class="rhythm-needle" id="lab-main-rhythm-needle"><i class="needle-beam"></i><i class="needle-tip"></i></div><div class="rhythm-ring-core"><img id="lab-main-rhythm-icon" alt="" hidden><strong id="lab-main-rhythm-name">徒手</strong><span id="lab-main-rhythm-state">READY</span></div></div></section>
                    <div class="player-vitals"><div class="player-vitals-head"><span>生命</span><strong><span id="player-hp">0</span> / <span id="player-max-hp">0</span></strong></div><div class="health-track player-health-track"><div class="health-loss" id="player-health-loss"></div><div class="health-fill" id="player-health-fill"></div></div><div class="quick-actions"><button class="quick-action potion-action" id="use-potion" type="button"><span class="control-key">SPACE</span><span class="combat-item-icon quick-item-icon"><img id="adventure-combat-potion-icon" src="src/assets/images/art/items/consumables/health_potion_s.webp" alt="生命藥水"><i class="cooldown-mask" id="potion-cooldown-mask"></i></span><span id="adventure-combat-potion-name">生命藥水</span><strong id="potion-count">0</strong></button><button class="quick-action quick-action-danger" id="flee-battle" type="button"><span class="control-key">F</span><span class="quick-action-symbol flee-symbol">↗</span><span>撤離</span></button></div></div>
                    <section class="rhythm-control rhythm-control-offhand" aria-label="副武器節奏環"><header class="rhythm-control-head"><span>副武器</span><kbd>RMB</kbd></header><div class="combat-rhythm-ring rhythm-ring offhand-rhythm-ring" id="lab-offhand-rhythm-ring" data-rhythm-mode="ring"><div class="zone-miss"></div><div class="hit-zone" id="lab-offhand-hit-zone"></div><div class="crit-zone" id="lab-offhand-crit-zone"></div><div class="rhythm-needle" id="lab-offhand-rhythm-needle"><i class="needle-beam"></i><i class="needle-tip"></i></div><div class="rhythm-ring-core"><img id="lab-offhand-rhythm-icon" alt="" hidden><strong id="lab-offhand-rhythm-name">未裝備</strong><span id="lab-offhand-rhythm-state">WAIT</span></div></div></section>
                </footer>
            </section>
        </div>`;
    root.appendChild(stage);
    return stage;
}
