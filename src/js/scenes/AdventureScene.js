import GameManager from '../managers/GameManager.js';
import MonsterManager from '../managers/MonsterManager.js';
import WorldMap from '../utils/WorldMap.js';
import {
    OverworldMapConfig,
    SecondRunOvercapBossReserves
} from '../data/OverworldMapRegistry.js';
import { getGeneratedMonsterImage } from '../data/AssetManifest.js';

const MOVE_REPEAT_MS = 80;

function loadImage(src) {
    if (!src) return Promise.resolve(null);
    return new Promise(resolve => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => resolve(null);
        image.src = src;
    });
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export default class AdventureScene {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.canvas = null;
        this.context = null;
        this.worldMap = null;
        this.images = new Map();
        this.animationFrame = 0;
        this.lastMoveAt = 0;
        this.regionToastTimer = 0;
        this.modalOpen = false;
        this.showOvercapReserves = false;
        this.devMode = new URLSearchParams(window.location.search).has('map-test');

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.renderFrame = this.renderFrame.bind(this);
    }

    async init() {
        this.cacheDom();
        if (!this.canvas || !this.context) {
            throw new Error('Adventure map canvas is missing');
        }

        this.worldMap = new WorldMap(GameManager.getCharacter(), 1280, 720);
        window.currentAdventureScene = this;
        this.bindEvents();
        this.handleResize();
        this.renderPlayerStats();
        this.renderBossReserveList();
        await this.loadMapAssets();
        this.updateLocationUi({ forceToast: true });
        this.requestRender();
    }

    cacheDom() {
        this.canvas = this.container.querySelector('#world-map-canvas');
        this.context = this.canvas?.getContext('2d') || null;
        this.regionTitle = this.container.querySelector('#adventure-region-title');
        this.regionSubtitle = this.container.querySelector('#adventure-region-subtitle');
        this.habitatName = this.container.querySelector('#adventure-habitat-name');
        this.playerLevel = this.container.querySelector('#adv-player-level');
        this.playerHp = this.container.querySelector('#adv-player-hp');
        this.playerGold = this.container.querySelector('#adv-player-gold');
        this.locationHint = this.container.querySelector('#map-location-hint');
        this.locationHintTitle = this.container.querySelector('#map-location-hint-title');
        this.locationHintText = this.container.querySelector('#map-location-hint-text');
        this.regionToast = this.container.querySelector('#map-region-toast');
        this.regionToastTitle = this.container.querySelector('#map-region-toast-title');
        this.regionToastText = this.container.querySelector('#map-region-toast-text');
        this.modal = this.container.querySelector('#map-landmark-modal');
        this.modalImage = this.container.querySelector('#map-landmark-image');
        this.modalKicker = this.container.querySelector('#map-landmark-kicker');
        this.modalTitle = this.container.querySelector('#map-landmark-title');
        this.modalText = this.container.querySelector('#map-landmark-text');
        this.devPanel = this.container.querySelector('#map-test-panel');
        this.devBossList = this.container.querySelector('#map-test-boss-list');
        this.devSample = this.container.querySelector('#map-test-sample');

        if (this.devPanel) this.devPanel.hidden = !this.devMode;
    }

    bindEvents() {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('resize', this.handleResize);

        this.container.querySelector('#btn-return-to-lobby')?.addEventListener('click', () => {
            this.app?.navigateTo?.('lobby');
        });
        this.container.querySelector('#map-landmark-close')?.addEventListener('click', () => this.closeModal());
        this.container.querySelector('#map-landmark-confirm')?.addEventListener('click', () => this.closeModal());
        this.modal?.addEventListener('click', event => {
            if (event.target === this.modal) this.closeModal();
        });

        this.devPanel?.addEventListener('click', event => {
            const button = event.target.closest('[data-map-test-action]');
            if (!button) return;
            this.handleDevAction(button.dataset.mapTestAction);
        });
    }

    cleanup() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('resize', this.handleResize);
        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
        if (this.regionToastTimer) window.clearTimeout(this.regionToastTimer);
        if (window.currentAdventureScene === this) delete window.currentAdventureScene;
    }

    async loadMapAssets() {
        const assetEntries = [];
        for (const tile of OverworldMapConfig.tiles) {
            assetEntries.push([`tile:${tile.id}`, tile.image]);
        }
        for (const landmark of OverworldMapConfig.landmarks) {
            assetEntries.push([`landmark:${landmark.id}`, landmark.image]);
        }
        for (const gate of OverworldMapConfig.routeGates) {
            assetEntries.push([`gate-blocked:${gate.id}`, gate.blockedImage]);
            assetEntries.push([`gate-repaired:${gate.id}`, gate.repairedImage]);
        }

        await Promise.all(assetEntries.map(async ([key, src]) => {
            const image = await loadImage(src);
            if (image) this.images.set(key, image);
        }));
    }

    handleResize() {
        if (!this.canvas || !this.worldMap) return;
        const bounds = this.canvas.getBoundingClientRect();
        const width = Math.max(1, Math.round(bounds.width));
        const height = Math.max(1, Math.round(bounds.height));
        const pixelRatio = clamp(window.devicePixelRatio || 1, 1, 2);
        this.canvas.width = Math.round(width * pixelRatio);
        this.canvas.height = Math.round(height * pixelRatio);
        this.worldMap.setViewport(width, height);
        this.requestRender();
    }

    handleKeyDown(event) {
        if (event.defaultPrevented) return;
        const tagName = event.target?.tagName?.toLowerCase();
        if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') return;

        if (event.key === 'Escape' && this.modalOpen) {
            event.preventDefault();
            this.closeModal();
            return;
        }
        if (this.modalOpen) return;

        if (event.key.toLowerCase() === 'f' || event.key === 'Enter') {
            event.preventDefault();
            this.interact();
            return;
        }

        const directions = {
            ArrowUp: [0, -1],
            ArrowDown: [0, 1],
            ArrowLeft: [-1, 0],
            ArrowRight: [1, 0],
            w: [0, -1],
            s: [0, 1],
            a: [-1, 0],
            d: [1, 0]
        };
        const direction = directions[event.key] || directions[event.key.toLowerCase()];
        if (!direction) return;

        const now = performance.now();
        if (event.repeat && now - this.lastMoveAt < MOVE_REPEAT_MS) return;
        this.lastMoveAt = now;
        event.preventDefault();
        this.move(...direction);
    }

    move(dx, dy) {
        const result = this.worldMap.movePlayer(dx, dy);
        if (result.type === 'blocked' && result.gate) {
            this.showInteractionHint(result.gate, '前方道路中斷，靠近後調查。');
            this.requestRender();
            return;
        }
        if (result.type !== 'moved') return;

        if (result.enteredHabitat) this.showRegionToast(result.habitat);
        this.updateLocationUi();
        this.requestRender();
    }

    interact() {
        const entry = this.worldMap.getNearbyInteraction();
        if (!entry) return;
        const firstDiscovery = this.worldMap.discoverLandmark(entry);

        if (entry.kind === 'route_gate') {
            this.openModal({
                kicker: firstDiscovery ? '道路障礙已發現' : '道路仍然中斷',
                title: entry.name,
                text: firstDiscovery ? entry.blockedText : entry.repeatText,
                image: this.images.get(`gate-blocked:${entry.id}`)
            });
        } else {
            this.openModal({
                kicker: entry.bossId ? '劇情交會地' : '地標已記錄',
                title: entry.name,
                text: firstDiscovery ? entry.firstText : (entry.repeatText || entry.firstText),
                image: this.images.get(`landmark:${entry.id}`)
            });
        }
        this.updateLocationUi();
        this.requestRender();
    }

    openModal({ kicker, title, text, image }) {
        if (!this.modal) return;
        this.modalKicker.textContent = kicker || '地標';
        this.modalTitle.textContent = title || '';
        this.modalText.textContent = text || '';
        if (image?.src) {
            this.modalImage.style.backgroundImage = `url("${image.src}")`;
            this.modalImage.classList.add('has-image');
        } else {
            this.modalImage.style.backgroundImage = '';
            this.modalImage.classList.remove('has-image');
        }
        this.modal.hidden = false;
        this.modalOpen = true;
        this.container.querySelector('#map-landmark-confirm')?.focus();
    }

    closeModal() {
        if (!this.modal) return;
        this.modal.hidden = true;
        this.modalOpen = false;
        this.canvas?.focus();
    }

    showInteractionHint(entry, overrideText = '') {
        if (!this.locationHint) return;
        this.locationHintTitle.textContent = this.worldMap.isLandmarkDiscovered(entry)
            ? entry.name
            : '未知地點';
        this.locationHintText.textContent = overrideText || '靠近後調查。';
        this.locationHint.classList.add('is-visible');
    }

    hideInteractionHint() {
        this.locationHint?.classList.remove('is-visible');
    }

    updateLocationUi(options = {}) {
        const tile = this.worldMap.getCurrentTile();
        const habitat = this.worldMap.getCurrentHabitat();
        if (this.regionTitle) this.regionTitle.textContent = tile?.title || '未知區域';
        if (this.regionSubtitle) this.regionSubtitle.textContent = tile?.subtitle || '';
        if (this.habitatName) this.habitatName.textContent = habitat?.name || '區域邊界';

        const interaction = this.worldMap.getNearbyInteraction();
        if (interaction) this.showInteractionHint(interaction);
        else this.hideInteractionHint();

        if (options.forceToast) this.showRegionToast(habitat);
    }

    showRegionToast(habitat) {
        if (!this.regionToast || !habitat) return;
        this.regionToastTitle.textContent = habitat.name;
        this.regionToastText.textContent = `當地遭遇將從「${habitat.name}」的怪物群落抽樣。`;
        this.regionToast.classList.add('is-visible');
        if (this.regionToastTimer) window.clearTimeout(this.regionToastTimer);
        this.regionToastTimer = window.setTimeout(() => {
            this.regionToast?.classList.remove('is-visible');
        }, 2200);
    }

    renderPlayerStats() {
        const character = GameManager.getCharacter();
        if (this.playerLevel) this.playerLevel.textContent = character?.level ?? 1;
        if (this.playerHp) this.playerHp.textContent = `${character?.hp ?? 0}/${character?.maxHp ?? 0}`;
        if (this.playerGold) this.playerGold.textContent = character?.gold ?? 0;
    }

    handleDevAction(action) {
        const gate = OverworldMapConfig.routeGates[0];
        switch (action) {
            case 'goto-start':
                this.worldMap.teleportTo(6, 16);
                this.setDevStatus('已移動到第一區起點');
                break;
            case 'goto-gate':
                this.worldMap.teleportTo(46, 16);
                this.setDevStatus('已移動到腐根斷橋前');
                break;
            case 'goto-chapter-two':
                if (!this.worldMap.isGateOpen(gate)) this.worldMap.setGateOpen(gate.id, true);
                this.worldMap.teleportTo(53, 16);
                this.setDevStatus('已移動到第二區起點');
                break;
            case 'repair-gate':
                this.worldMap.discoverLandmark(gate);
                this.worldMap.setGateOpen(gate.id, true);
                this.openModal({
                    kicker: '道路已恢復',
                    title: gate.name,
                    text: gate.resolvedText,
                    image: this.images.get(`gate-repaired:${gate.id}`)
                });
                this.setDevStatus('腐根斷橋已修復，中央通路開放');
                break;
            case 'reset-gate':
                this.worldMap.setGateOpen(gate.id, false);
                this.worldMap.discoveredLandmarks.delete(gate.id);
                GameManager.setFlag(gate.discoveryFlag, false);
                this.worldMap.teleportTo(46, 16);
                this.worldMap.saveState();
                this.setDevStatus('腐根斷橋已重置');
                break;
            case 'reveal-all':
                this.worldMap.revealAll();
                this.setDevStatus(`迷霧已揭開：${this.worldMap.exploredCells.size} 格`);
                break;
            case 'reset-fog':
                this.worldMap.resetFog();
                this.setDevStatus(`迷霧已重置：${this.worldMap.exploredCells.size} 格可見`);
                break;
            case 'sample-monster':
                this.sampleMonsterForTest();
                break;
            case 'toggle-reserves':
                this.showOvercapReserves = !this.showOvercapReserves;
                this.setDevStatus(this.showOvercapReserves ? '顯示目前已定位的預留點' : '隱藏預留點');
                break;
            default:
                return;
        }
        this.updateLocationUi();
        this.requestRender();
    }

    setDevStatus(text) {
        if (this.devSample) this.devSample.textContent = text;
    }

    async sampleMonsterForTest() {
        const result = this.worldMap.sampleCurrentMonster();
        if (!result) return;
        const monster = MonsterManager.getMonster(result.monsterId);
        const image = await loadImage(getGeneratedMonsterImage(result.monsterId));
        if (this.devSample) {
            this.devSample.textContent = `${result.habitat.name}：${monster?.name || result.monsterId}`;
        }
        this.openModal({
            kicker: '當地怪物抽樣',
            title: monster?.name || result.monsterId,
            text: `這次抽樣只使用「${result.habitat.name}」的怪物池，不會從整個章節混抽。`,
            image
        });
    }

    renderBossReserveList() {
        if (!this.devBossList) return;
        this.devBossList.innerHTML = SecondRunOvercapBossReserves.map(entry => (
            `<li><b>第 ${entry.chapter} 章</b><span>${entry.workingName}</span><small>${entry.anchor}</small></li>`
        )).join('');
    }

    requestRender() {
        if (this.animationFrame) return;
        this.animationFrame = requestAnimationFrame(this.renderFrame);
    }

    renderFrame(time) {
        this.animationFrame = 0;
        this.renderMap(time);
    }

    renderMap(time) {
        const ctx = this.context;
        const canvas = this.canvas;
        if (!ctx || !canvas || !this.worldMap) return;

        const pixelRatio = clamp(window.devicePixelRatio || 1, 1, 2);
        const width = canvas.width / pixelRatio;
        const height = canvas.height / pixelRatio;
        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#070b0b';
        ctx.fillRect(0, 0, width, height);

        this.renderTiles(ctx);
        this.renderBlockedCells(ctx);
        this.renderFog(ctx);
        this.renderLandmarks(ctx, time);
        if (this.devMode && this.showOvercapReserves) this.renderReserveMarkers(ctx, time);
        this.renderPlayer(ctx, time);
    }

    renderTiles(ctx) {
        const cellSize = this.worldMap.gridSize;
        for (const tile of OverworldMapConfig.tiles) {
            const image = this.images.get(`tile:${tile.id}`);
            const x = tile.x * cellSize - this.worldMap.cameraOffsetX;
            const y = tile.y * cellSize - this.worldMap.cameraOffsetY;
            const width = tile.cols * cellSize;
            const height = tile.rows * cellSize;
            if (image) {
                ctx.drawImage(image, x, y, width, height);
            } else {
                ctx.fillStyle = tile.chapter === 1 ? '#293126' : '#2c302b';
                ctx.fillRect(x, y, width, height);
            }
        }
    }

    renderBlockedCells(ctx) {
        const cellSize = this.worldMap.gridSize;
        const bounds = this.worldMap.getVisibleCellBounds();
        ctx.lineWidth = 1;
        for (let y = bounds.startY; y <= bounds.endY; y += 1) {
            for (let x = bounds.startX; x <= bounds.endX; x += 1) {
                if (!this.worldMap.isCellBlocked(x, y)) continue;
                const drawX = x * cellSize - this.worldMap.cameraOffsetX;
                const drawY = y * cellSize - this.worldMap.cameraOffsetY;
                ctx.fillStyle = 'rgba(42, 45, 45, 0.62)';
                ctx.fillRect(drawX, drawY, cellSize, cellSize);
                ctx.strokeStyle = 'rgba(176, 185, 181, 0.2)';
                ctx.strokeRect(drawX + 0.5, drawY + 0.5, cellSize - 1, cellSize - 1);
            }
        }
    }

    renderFog(ctx) {
        const cellSize = this.worldMap.gridSize;
        const bounds = this.worldMap.getVisibleCellBounds();
        for (let y = bounds.startY; y <= bounds.endY; y += 1) {
            for (let x = bounds.startX; x <= bounds.endX; x += 1) {
                if (!this.worldMap.isInsideWorld(x, y) || this.worldMap.isCellExplored(x, y)) continue;
                const drawX = x * cellSize - this.worldMap.cameraOffsetX;
                const drawY = y * cellSize - this.worldMap.cameraOffsetY;
                ctx.fillStyle = 'rgba(3, 5, 6, 0.9)';
                ctx.fillRect(drawX, drawY, cellSize + 1, cellSize + 1);
            }
        }
    }

    renderLandmarks(ctx, time) {
        const entries = [
            ...this.worldMap.getActiveLandmarks(),
            ...this.worldMap.getVisibleRouteGates()
        ];
        for (const entry of entries) {
            if (!this.worldMap.isCellExplored(entry.x, entry.y)) continue;
            this.renderLandmarkMarker(ctx, entry, time);
        }
    }

    renderLandmarkMarker(ctx, entry, time) {
        const cellSize = this.worldMap.gridSize;
        const centerX = entry.x * cellSize + cellSize / 2 - this.worldMap.cameraOffsetX;
        const centerY = entry.y * cellSize + cellSize / 2 - this.worldMap.cameraOffsetY;
        const discovered = this.worldMap.isLandmarkDiscovered(entry);
        const size = discovered ? 48 : 38;
        const pulse = 1 + Math.sin(time / 320) * 0.04;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(pulse, pulse);
        ctx.shadowColor = discovered ? 'rgba(229, 195, 112, 0.65)' : 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = discovered ? 14 : 8;

        if (!discovered) {
            ctx.fillStyle = '#050606';
            ctx.fillRect(-size / 2, -size / 2, size, size);
            ctx.strokeStyle = '#9ca3a0';
            ctx.lineWidth = 2;
            ctx.strokeRect(-size / 2 + 1, -size / 2 + 1, size - 2, size - 2);
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#f3f4ef';
            ctx.font = '700 24px Georgia, serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('?', 0, 1);
        } else {
            const imageKey = entry.kind === 'route_gate'
                ? `gate-blocked:${entry.id}`
                : `landmark:${entry.id}`;
            const image = this.images.get(imageKey);
            ctx.beginPath();
            ctx.rect(-size / 2, -size / 2, size, size);
            ctx.clip();
            if (image) ctx.drawImage(image, -size / 2, -size / 2, size, size);
            else {
                ctx.fillStyle = '#433c2a';
                ctx.fillRect(-size / 2, -size / 2, size, size);
            }
            ctx.restore();
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.strokeStyle = '#e5c370';
            ctx.lineWidth = 2;
            ctx.strokeRect(-size / 2, -size / 2, size, size);
        }
        ctx.restore();
    }

    renderReserveMarkers(ctx, time) {
        const prototypePositions = [
            { chapter: 1, x: 8, y: 28 },
            { chapter: 2, x: 90, y: 5 }
        ];
        for (const position of prototypePositions) {
            const entry = SecondRunOvercapBossReserves.find(candidate => candidate.chapter === position.chapter);
            if (!entry) continue;
            const x = position.x * this.worldMap.gridSize + 16 - this.worldMap.cameraOffsetX;
            const y = position.y * this.worldMap.gridSize + 16 - this.worldMap.cameraOffsetY;
            const radius = 11 + Math.sin(time / 260) * 2;
            ctx.save();
            ctx.fillStyle = 'rgba(135, 29, 25, 0.9)';
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#f0b36a';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#fff5df';
            ctx.font = '700 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`EX${entry.chapter}`, x, y - 18);
            ctx.restore();
        }
    }

    renderPlayer(ctx, time) {
        const cellSize = this.worldMap.gridSize;
        const centerX = this.worldMap.playerPos.x * cellSize + cellSize / 2 - this.worldMap.cameraOffsetX;
        const centerY = this.worldMap.playerPos.y * cellSize + cellSize / 2 - this.worldMap.cameraOffsetY;
        const bob = Math.sin(time / 180) * 1.5;
        const facing = this.worldMap.playerFacing;

        ctx.save();
        ctx.translate(centerX, centerY + bob);
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#e7d18a';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#18201e';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#8f3f32';
        ctx.beginPath();
        ctx.moveTo(facing.x * 14, facing.y * 14);
        ctx.lineTo(-facing.y * 5, facing.x * 5);
        ctx.lineTo(facing.y * 5, -facing.x * 5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}
