import { ChapterOneEvidenceIds } from './ChapterOneDemoRoute.js';

const EVIDENCE_LABELS = Object.freeze({
    south_gate_farmland: '南門農田',
    hunter_boardwalk: '獵人棧道',
    old_campfire_site: '舊營火遺址'
});

export default class DemoHud {
    constructor(root, handlers = {}) {
        this.root = root;
        this.handlers = handlers;
        this.cache = new Map();
        this.findNodes();
        this.bind();
    }

    findNodes() {
        const find = selector => this.root.querySelector(selector);
        this.nodes = {
            roomName: find('[data-room-name]'),
            playerHealth: find('[data-player-health]'),
            playerStamina: find('[data-player-stamina]'),
            potions: find('[data-potion-count]'),
            playerStatuses: find('[data-player-statuses]'),
            enemyHud: find('[data-enemy-hud]'),
            enemyName: find('[data-enemy-name]'),
            enemyHealth: find('[data-enemy-health]'),
            enemyIntent: find('[data-enemy-intent]'),
            evidence: find('[data-evidence-list]'),
            interaction: find('[data-interaction]'),
            interactionLabel: find('[data-interaction-label]'),
            message: find('[data-combat-message]'),
            lockHint: find('[data-pointer-lock-hint]'),
            inventoryCount: find('[data-inventory-count]'),
            inventory: find('[data-inventory-list]'),
            storyCard: find('[data-story-card]'),
            storyTitle: find('[data-story-title]'),
            storyCopy: find('[data-story-copy]'),
            lootCard: find('[data-loot-card]'),
            lootName: find('[data-loot-name]'),
            lootDetail: find('[data-loot-detail]'),
            completeCard: find('[data-complete-card]'),
            completeCopy: find('[data-complete-copy]'),
            performance: find('[data-performance]')
        };
    }

    bind() {
        this.root.querySelector('[data-story-close]').addEventListener('click', () => {
            this.hideStory();
            this.handlers.onCardClosed?.();
        });
        this.root.querySelector('[data-loot-take]').addEventListener('click', () => {
            this.handlers.onLootTake?.();
        });
        this.root.querySelector('[data-loot-leave]').addEventListener('click', () => {
            this.hideLoot();
            this.handlers.onCardClosed?.();
        });
        this.root.querySelector('[data-complete-exit]').addEventListener('click', () => {
            this.handlers.onCompleteExit?.();
        });
    }

    setRoom(name) {
        this.writeText('room', this.nodes.roomName, name);
    }

    updatePlayer(player) {
        this.writeTransform(
            'player-health',
            this.nodes.playerHealth,
            player.health / player.maxHealth
        );
        this.writeTransform(
            'player-stamina',
            this.nodes.playerStamina,
            player.stamina / player.maxStamina
        );
        this.writeText('potions', this.nodes.potions, `應急藥劑 ${player.potions}`);
        const statusKey = (player.statuses || [])
            .map(status => `${status.id}:${Math.ceil(status.remaining)}`)
            .join('|');
        if (this.cache.get('player-statuses') !== statusKey) {
            this.cache.set('player-statuses', statusKey);
            this.nodes.playerStatuses.innerHTML = (player.statuses || [])
                .map(status => (
                    `<span title="${status.name}">${status.icon || '◆'} ${status.name}`
                    + ` ${Math.ceil(status.remaining)}s</span>`
                ))
                .join('');
        }
    }

    updateEnemy(enemy) {
        this.nodes.enemyHud.hidden = !enemy;
        if (!enemy) return;
        this.writeText('enemy-name', this.nodes.enemyName, enemy.data.name);
        this.writeTransform('enemy-health', this.nodes.enemyHealth, enemy.health / enemy.maxHealth);
        const actionName = enemy.state === 'windup'
            ? enemy.action?.name || '準備攻擊'
            : enemy.state === 'vanish'
                ? '藏匿'
                : '';
        this.writeText('enemy-intent', this.nodes.enemyIntent, actionName);
    }

    updateEvidence(session) {
        const key = ChapterOneEvidenceIds.map(id => session.hasEvidence(id) ? '1' : '0').join('');
        if (this.cache.get('evidence') === key) return;
        this.cache.set('evidence', key);
        this.nodes.evidence.innerHTML = ChapterOneEvidenceIds.map(id => (
            `<span class="${session.hasEvidence(id) ? 'is-complete' : ''}">`
            + `${session.hasEvidence(id) ? '✓' : '○'} ${EVIDENCE_LABELS[id]}</span>`
        )).join('');
    }

    updateInventory(session) {
        const key = JSON.stringify(session.inventory.map(entry => [entry.item.id, entry.quantity]));
        if (this.cache.get('inventory') === key) return;
        this.cache.set('inventory', key);
        this.nodes.inventoryCount.textContent = `${session.usedSlots} / ${session.capacity}`;
        this.nodes.inventory.innerHTML = session.inventory.map(entry => (
            `<article title="${entry.item.name}">${entry.quantity > 1 ? `×${entry.quantity}` : '1'}</article>`
        )).join('');
    }

    showInteraction(label) {
        this.nodes.interaction.hidden = false;
        this.writeText('interaction', this.nodes.interactionLabel, label);
    }

    hideInteraction() {
        this.nodes.interaction.hidden = true;
    }

    showMessage(text, duration = 1.8) {
        clearTimeout(this.messageTimer);
        this.nodes.message.textContent = text;
        this.nodes.message.hidden = false;
        this.messageTimer = setTimeout(() => {
            this.nodes.message.hidden = true;
        }, duration * 1000);
    }

    showStory(title, beats) {
        this.nodes.storyTitle.textContent = title;
        this.nodes.storyCopy.innerHTML = beats
            .filter(beat => beat.text && !['enter', 'exit'].includes(beat.beat))
            .map(beat => `<p>${beat.text}</p>`)
            .join('');
        this.nodes.storyCard.hidden = false;
    }

    hideStory() {
        this.nodes.storyCard.hidden = true;
    }

    showLoot(drop) {
        this.nodes.lootName.textContent = drop.item.name;
        this.nodes.lootDetail.textContent = `${drop.quantity} 個 · ${drop.item.description || drop.item.desc || '可帶回城鎮使用的物品'}`;
        this.nodes.lootCard.hidden = false;
    }

    hideLoot() {
        this.nodes.lootCard.hidden = true;
    }

    showComplete(beats) {
        this.nodes.completeCopy.innerHTML = beats
            .filter(beat => beat.text && !['enter', 'exit'].includes(beat.beat))
            .map(beat => `<p>${beat.text}</p>`)
            .join('');
        this.nodes.completeCard.hidden = false;
    }

    setLockState(locked, fallback = false) {
        this.nodes.lockHint.hidden = locked;
        if (fallback) {
            this.nodes.lockHint.textContent = '內建瀏覽器使用畫面邊緣持續轉向';
        }
    }

    updatePerformance(stats, visible) {
        this.nodes.performance.hidden = !visible;
        if (!visible) return;
        this.nodes.performance.textContent = [
            `${stats.fps.toFixed(0)} FPS`,
            `${stats.frameMs.toFixed(1)} ms`,
            `${stats.calls} calls`,
            `${stats.triangles} tris`
        ].join(' · ');
    }

    isModalOpen() {
        return !this.nodes.storyCard.hidden
            || !this.nodes.lootCard.hidden
            || !this.nodes.completeCard.hidden;
    }

    writeText(key, node, value) {
        if (this.cache.get(key) === value) return;
        this.cache.set(key, value);
        node.textContent = value;
    }

    writeTransform(key, node, ratio) {
        const value = Math.max(0, Math.min(1, ratio)).toFixed(3);
        if (this.cache.get(key) === value) return;
        this.cache.set(key, value);
        node.style.transform = `scaleX(${value})`;
    }

    destroy() {
        clearTimeout(this.messageTimer);
    }
}
