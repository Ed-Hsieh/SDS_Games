import { ChapterOneEvidenceIds } from './ChapterOneDemoRoute.js';

const EVIDENCE_LABELS = Object.freeze({
    south_gate_farmland: '\u5357\u9580\u8fb2\u7530',
    hunter_boardwalk: '\u7375\u4eba\u68e7\u9053',
    old_campfire_site: '\u820a\u71df\u706b\u907a\u5740'
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
        this.writeText(
            'potions',
            this.nodes.potions,
            `\u61c9\u6025\u85e5\u5291 ${player.potions}`
        );
        const statusKey = (player.statuses || [])
            .map(status => `${status.id}:${Math.ceil(status.remaining)}`)
            .join('|');
        if (this.cache.get('player-statuses') !== statusKey) {
            this.cache.set('player-statuses', statusKey);
            this.nodes.playerStatuses.innerHTML = (player.statuses || [])
                .map(status => (
                    `<span title="${status.name}">\u25c6 ${status.name}`
                    + ` ${Math.ceil(status.remaining)}s</span>`
                ))
                .join('');
        }
    }

    updateEnemy(enemy) {
        this.nodes.enemyHud.hidden = !enemy;
        if (!enemy) return;
        this.writeText('enemy-name', this.nodes.enemyName, enemy.data.name);
        this.writeTransform(
            'enemy-health',
            this.nodes.enemyHealth,
            enemy.health / enemy.maxHealth
        );
        const actionName = enemy.state === 'windup'
            ? enemy.action?.name || '\u6e96\u5099\u653b\u64ca'
            : enemy.state === 'vanish'
                ? '\u85cf\u533f'
                : '';
        this.writeText('enemy-intent', this.nodes.enemyIntent, actionName);
    }

    updateEvidence(session) {
        const key = ChapterOneEvidenceIds
            .map(id => session.hasEvidence(id) ? '1' : '0')
            .join('');
        if (this.cache.get('evidence') === key) return;
        this.cache.set('evidence', key);
        this.nodes.evidence.innerHTML = ChapterOneEvidenceIds.map(id => (
            `<span class="${session.hasEvidence(id) ? 'is-complete' : ''}">`
            + `${session.hasEvidence(id) ? '\u2713' : '\u25cb'} ${EVIDENCE_LABELS[id]}</span>`
        )).join('');
    }

    updateInventory(session) {
        const key = JSON.stringify(
            session.inventory.map(entry => [entry.item.id, entry.quantity])
        );
        if (this.cache.get('inventory') === key) return;
        this.cache.set('inventory', key);
        this.nodes.inventoryCount.textContent = `${session.usedSlots} / ${session.capacity}`;
        this.nodes.inventory.innerHTML = session.inventory.map(entry => (
            `<article title="${entry.item.name}">`
            + `${entry.quantity > 1 ? `\u00d7${entry.quantity}` : '1'}</article>`
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
        this.nodes.lootDetail.textContent = `${drop.quantity} \u500b \u00b7 `
            + `${drop.item.description || drop.item.desc
                || '\u53ef\u5e36\u56de\u57ce\u93ae\u4f7f\u7528\u7684\u7269\u54c1'}`;
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
            this.nodes.lockHint.textContent =
                '\u6ed1\u9f20\u6307\u5411\u653b\u64ca\u65b9\u5411\uff1b\u756b\u9762\u908a\u7de3\u53ef\u65cb\u8f49\u93e1\u982d';
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
        ].join(' \u00b7 ');
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
