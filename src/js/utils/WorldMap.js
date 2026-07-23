import GameManager from '../managers/GameManager.js';
import { chapterOneProgressionManager } from '../managers/ChapterOneProgressionManager.js';
import {
    OverworldMapConfig,
    getOverworldHabitatAt,
    getOverworldTileAt,
    isPointInsideRect
} from '../data/OverworldMapRegistry.js';

const MAP_STATE_VERSION = 2;
// Radius 1 reveals the player's cell and its eight neighboring cells.
const DEFAULT_REVEAL_RADIUS = 1;

function cellKey(x, y) {
    return `${x},${y}`;
}

export function resetSavedOverworldPlayerToEntry() {
    const state = GameManager.getOverworldMapProgress();
    if (!state || state.version !== MAP_STATE_VERSION || state.worldId !== OverworldMapConfig.id) return false;
    state.playerPos = { ...OverworldMapConfig.startPosition };
    state.stepsSinceEncounter = 0;
    GameManager.saveOverworldMapProgress(state, 'overworld-departure-entry');
    return true;
}

export function preparePrologueOverworldDeparture() {
    const existing = GameManager.getOverworldMapProgress();
    const state = existing?.version === MAP_STATE_VERSION && existing?.worldId === OverworldMapConfig.id
        ? existing
        : {
            version: MAP_STATE_VERSION,
            worldId: OverworldMapConfig.id,
            travelStep: 0,
            exploredCells: [],
            discoveredLandmarks: []
        };
    state.playerPos = { ...OverworldMapConfig.prologueStartPosition };
    state.stepsSinceEncounter = 0;
    GameManager.saveOverworldMapProgress(state, 'guild-prologue-departure');
    return true;
}

function manhattan(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export default class WorldMap {
    constructor(player, screenWidth = 1280, screenHeight = 720) {
        this.player = player;
        this.config = OverworldMapConfig;
        this.gridSize = this.config.cellSize;
        this.cols = this.config.cols;
        this.rows = this.config.rows;
        this.mapWidth = this.cols * this.gridSize;
        this.mapHeight = this.rows * this.gridSize;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.cameraOffsetX = 0;
        this.cameraOffsetY = 0;
        this.playerFacing = { x: 1, y: 0 };
        this.playerPos = { ...this.config.startPosition };
        this.exploredCells = new Set();
        this.discoveredLandmarks = new Set();
        this.travelStep = 0;
        this.stepsSinceEncounter = 0;

        this.restoreState();
        this.revealAroundPlayer(DEFAULT_REVEAL_RADIUS, { save: false });
        this.updateCamera();
        this.saveState();
    }

    restoreState() {
        const state = GameManager.getOverworldMapProgress();
        if (!state || state.version !== MAP_STATE_VERSION || state.worldId !== this.config.id) return;

        const { x, y } = state.playerPos || {};
        if (Number.isInteger(x) && Number.isInteger(y) && this.isCellTraversable(x, y)) {
            this.playerPos = { x, y };
        }
        if (Array.isArray(state.exploredCells)) {
            this.exploredCells = new Set(state.exploredCells);
        }
        if (Array.isArray(state.discoveredLandmarks)) {
            this.discoveredLandmarks = new Set(state.discoveredLandmarks);
        }
        this.travelStep = Math.max(0, Number(state.travelStep) || 0);
        this.stepsSinceEncounter = Math.max(0, Number(state.stepsSinceEncounter) || 0);
    }

    saveState() {
        GameManager.saveOverworldMapProgress({
            version: MAP_STATE_VERSION,
            worldId: this.config.id,
            playerPos: { ...this.playerPos },
            travelStep: this.travelStep,
            stepsSinceEncounter: this.stepsSinceEncounter,
            exploredCells: [...this.exploredCells],
            discoveredLandmarks: [...this.discoveredLandmarks]
        });
    }

    setViewport(width, height) {
        this.screenWidth = Math.max(1, Number(width) || this.screenWidth);
        this.screenHeight = Math.max(1, Number(height) || this.screenHeight);
        this.updateCamera();
    }

    updateCamera() {
        const targetX = this.playerPos.x * this.gridSize + this.gridSize / 2 - this.screenWidth / 2;
        const targetY = this.playerPos.y * this.gridSize + this.gridSize / 2 - this.screenHeight / 2;
        this.cameraOffsetX = Math.max(0, Math.min(targetX, Math.max(0, this.mapWidth - this.screenWidth)));
        this.cameraOffsetY = Math.max(0, Math.min(targetY, Math.max(0, this.mapHeight - this.screenHeight)));
    }

    isInsideWorld(x, y) {
        return Number.isInteger(x)
            && Number.isInteger(y)
            && x >= 0
            && y >= 0
            && x < this.cols
            && y < this.rows
            && Boolean(getOverworldTileAt(x, y));
    }

    isGateOpen(gate) {
        return Boolean(gate?.openFlag && GameManager.getFlag(gate.openFlag));
    }

    getBlockingGateAt(x, y) {
        return this.config.routeGates.find(gate => {
            if (!isPointInsideRect(gate.blockedRect, x, y)) return false;
            if (!this.isGateOpen(gate)) return true;
            return !isPointInsideRect(gate.passageRect, x, y);
        }) || null;
    }

    isCellTraversable(x, y) {
        return this.isInsideWorld(x, y) && !this.getBlockingGateAt(x, y);
    }

    isCellBlocked(x, y) {
        return this.isInsideWorld(x, y) && !this.isCellTraversable(x, y);
    }

    isCellExplored(x, y) {
        return this.exploredCells.has(cellKey(x, y));
    }

    revealAroundPlayer(radius = DEFAULT_REVEAL_RADIUS, options = {}) {
        const safeRadius = Math.max(0, Math.floor(Number(radius) || 0));
        let changed = false;
        for (let y = this.playerPos.y - safeRadius; y <= this.playerPos.y + safeRadius; y += 1) {
            for (let x = this.playerPos.x - safeRadius; x <= this.playerPos.x + safeRadius; x += 1) {
                if (!this.isInsideWorld(x, y)) continue;
                const dx = x - this.playerPos.x;
                const dy = y - this.playerPos.y;
                if (dx * dx + dy * dy > safeRadius * safeRadius + 1) continue;
                const key = cellKey(x, y);
                if (!this.exploredCells.has(key)) {
                    this.exploredCells.add(key);
                    changed = true;
                }
            }
        }
        if (changed && options.save !== false) this.saveState();
        return changed;
    }

    revealAll() {
        for (let y = 0; y < this.rows; y += 1) {
            for (let x = 0; x < this.cols; x += 1) {
                if (this.isInsideWorld(x, y)) this.exploredCells.add(cellKey(x, y));
            }
        }
        this.saveState();
    }

    resetFog() {
        this.exploredCells.clear();
        this.revealAroundPlayer(DEFAULT_REVEAL_RADIUS, { save: false });
        this.saveState();
    }

    returnPlayerToEntry() {
        this.playerPos = { ...this.config.startPosition };
        this.playerFacing = { x: 1, y: 0 };
        this.stepsSinceEncounter = 0;
        this.revealAroundPlayer(DEFAULT_REVEAL_RADIUS, { save: false });
        this.updateCamera();
        this.saveState();
        return { ...this.playerPos };
    }

    movePlayer(dx, dy) {
        const stepX = Math.sign(Number(dx) || 0);
        const stepY = Math.sign(Number(dy) || 0);
        if (!stepX && !stepY) return { type: 'idle' };

        const target = {
            x: this.playerPos.x + stepX,
            y: this.playerPos.y + stepY
        };
        if (!this.isCellTraversable(target.x, target.y)) {
            return {
                type: 'blocked',
                gate: this.getBlockingGateAt(target.x, target.y),
                target
            };
        }

        const previousHabitat = this.getCurrentHabitat();
        this.playerPos = target;
        this.playerFacing = { x: stepX, y: stepY };
        this.travelStep += 1;
        this.stepsSinceEncounter += 1;
        this.revealAroundPlayer(DEFAULT_REVEAL_RADIUS, { save: false });
        this.updateCamera();
        this.saveState();

        const habitat = this.getCurrentHabitat();
        const tile = this.getCurrentTile();
        return {
            type: 'moved',
            habitat,
            tile,
            enteredHabitat: previousHabitat?.id !== habitat?.id,
            interaction: this.getNearbyInteraction()
        };
    }

    getCurrentTile() {
        return getOverworldTileAt(this.playerPos.x, this.playerPos.y);
    }

    getCurrentHabitat() {
        return getOverworldHabitatAt(this.playerPos.x, this.playerPos.y);
    }

    isLandmarkAvailable(entry) {
        if (entry.progressionRequirement) {
            return chapterOneProgressionManager.meetsRequirement(entry.progressionRequirement);
        }
        return !entry.storyFlag || Boolean(GameManager.getFlag(entry.storyFlag));
    }

    getActiveLandmarks() {
        return this.config.landmarks.filter(entry => this.isLandmarkAvailable(entry));
    }

    getTownReturn() {
        return this.config.townReturn || null;
    }

    getVisibleRouteGates() {
        return this.config.routeGates.filter(gate => !this.isGateOpen(gate));
    }

    getNearbyInteraction() {
        const candidates = [
            ...(this.getTownReturn() ? [this.getTownReturn()] : []),
            ...this.getVisibleRouteGates(),
            ...this.getActiveLandmarks()
        ]
            .filter(entry => manhattan(this.playerPos, entry) <= (entry.interactionRadius || 1))
            .sort((a, b) => manhattan(this.playerPos, a) - manhattan(this.playerPos, b));
        return candidates[0] || null;
    }

    discoverLandmark(entry) {
        if (!entry?.id) return false;
        const wasDiscovered = this.discoveredLandmarks.has(entry.id)
            || Boolean(entry.discoveryFlag && GameManager.getFlag(entry.discoveryFlag));
        this.discoveredLandmarks.add(entry.id);
        if (entry.discoveryFlag) GameManager.setFlag(entry.discoveryFlag, true);
        this.saveState();
        return !wasDiscovered;
    }

    isLandmarkDiscovered(entry) {
        return Boolean(entry?.id) && (
            entry.kind === 'town_return'
            ||
            this.discoveredLandmarks.has(entry.id)
            || Boolean(entry.discoveryFlag && GameManager.getFlag(entry.discoveryFlag))
        );
    }

    setGateOpen(gateId, open) {
        const gate = this.config.routeGates.find(entry => entry.id === gateId);
        if (!gate) return null;
        GameManager.setFlag(gate.openFlag, Boolean(open));
        if (open) {
            this.discoveredLandmarks.delete(gate.id);
        }
        this.saveState();
        return gate;
    }

    resetGate(gateId) {
        const gate = this.config.routeGates.find(entry => entry.id === gateId);
        if (!gate) return null;
        GameManager.setFlag(gate.openFlag, false);
        if (gate.discoveryFlag) GameManager.setFlag(gate.discoveryFlag, false);
        this.discoveredLandmarks.delete(gate.id);
        this.saveState();
        return gate;
    }

    sampleCurrentMonster(rng = Math.random) {
        const habitat = this.getCurrentHabitat();
        const pool = habitat?.monsterIds || [];
        if (!pool.length) return null;
        const roll = Math.max(0, Math.min(0.999999, Number(rng()) || 0));
        return {
            habitat,
            monsterId: pool[Math.floor(roll * pool.length)]
        };
    }

    rollEncounter(rng = Math.random, options = {}) {
        const habitat = this.getCurrentHabitat();
        if (!habitat?.monsterIds?.length) return null;
        const safeSteps = Math.max(0, Number(habitat.safeSteps) || 0);
        if (!options.force && this.stepsSinceEncounter < safeSteps) return null;

        const rate = Math.max(0, Math.min(1, Number(habitat.encounterRate) || 0));
        if (!options.force && rng() > rate) return null;

        const encounter = this.sampleCurrentMonster(rng);
        if (!encounter) return null;
        this.stepsSinceEncounter = 0;
        this.saveState();
        return encounter;
    }

    suppressEncounters(steps = 4) {
        const safeSteps = Math.max(0, Math.floor(Number(steps) || 0));
        this.stepsSinceEncounter = -safeSteps;
        this.saveState();
    }

    teleportTo(x, y) {
        const targetX = Math.round(Number(x));
        const targetY = Math.round(Number(y));
        if (!this.isCellTraversable(targetX, targetY)) return false;
        this.playerPos = { x: targetX, y: targetY };
        this.revealAroundPlayer(DEFAULT_REVEAL_RADIUS, { save: false });
        this.updateCamera();
        this.saveState();
        return true;
    }

    getVisibleCellBounds() {
        return {
            startX: Math.max(0, Math.floor(this.cameraOffsetX / this.gridSize) - 1),
            endX: Math.min(this.cols - 1, Math.ceil((this.cameraOffsetX + this.screenWidth) / this.gridSize) + 1),
            startY: Math.max(0, Math.floor(this.cameraOffsetY / this.gridSize) - 1),
            endY: Math.min(this.rows - 1, Math.ceil((this.cameraOffsetY + this.screenHeight) / this.gridSize) + 1)
        };
    }
}
