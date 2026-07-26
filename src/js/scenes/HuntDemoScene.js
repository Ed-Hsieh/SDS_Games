import SouthGateMapPackage, {
    ExplorationSpriteAtlas,
    SouthGateMaterial
} from '../data/SouthGateMapPackage.js?v=hunt-canvas-south-20260726b';
import HuntDemoCombatAdapter from '../managers/HuntDemoCombatAdapter.js?v=hunt-canvas-south-20260726b';
import { CombatSessionPhase } from '../managers/RealtimeCombatSession.js';

const FIXED_STEP = 1 / 60;
const PLAYER_SPEED = 292;
const PLAYER_RADIUS = 26;
const MAX_COLLISION_STEP = 8;
const ROLL_SPEED = 520;
const ROLL_DURATION = 8 / 14;
const ROLL_COST = 28;
const ATLAS_DISPLAY_SCALE = 1.16;
const MASK_COLORS = Object.freeze({
    grass: [62, 122, 64],
    mud: [146, 82, 46],
    stone: [112, 118, 126]
});

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function length(x, y) {
    return Math.hypot(x, y);
}

function normalize(x, y) {
    const magnitude = length(x, y) || 1;
    return { x: x / magnitude, y: y / magnitude };
}

function pointInPolygon(point, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i];
        const [xj, yj] = polygon[j];
        const intersects = ((yi > point.y) !== (yj > point.y))
            && point.x < ((xj - xi) * (point.y - yi)) / ((yj - yi) || 0.0001) + xi;
        if (intersects) inside = !inside;
    }
    return inside;
}

function directionFromVector(x, y, fallback = 'south') {
    if (Math.abs(x) + Math.abs(y) < 0.01) return fallback;
    const octant = Math.round(Math.atan2(y, x) / (Math.PI / 4));
    return {
        '-4': 'west',
        '-3': 'northwest',
        '-2': 'north',
        '-1': 'northeast',
        0: 'east',
        1: 'southeast',
        2: 'south',
        3: 'southwest',
        4: 'west'
    }[octant] || fallback;
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Unable to load exploration asset: ${src}`));
        image.src = src;
    });
}

function toImageData(image) {
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(image, 0, 0);
    return context.getImageData(0, 0, canvas.width, canvas.height);
}

function mergeHaul(haul, drops) {
    drops.forEach(drop => {
        if (!drop?.itemId) return;
        const quantity = Math.max(1, Number(drop.quantity) || 1);
        const current = haul.find(entry => entry.itemId === drop.itemId);
        if (current) current.quantity += quantity;
        else haul.push({ itemId: drop.itemId, quantity });
    });
}

export default class HuntDemoScene {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.package = SouthGateMapPackage;
        this.keys = new Set();
        this.fixedAccumulator = 0;
        this.lastFrameTime = 0;
        this.frameId = null;
        this.running = false;
        this.combatActive = false;
        this.debugVisible = false;
        this.nearbyProp = null;
        this.boundaryCooldown = 0;
        this.effects = [];
        this.assetImages = new Map();
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.loop = this.loop.bind(this);
        this.resize = this.resize.bind(this);
    }

    async init() {
        const response = await fetch('src/views/hunt-demo.html?v=hunt-canvas-south-20260726b');
        if (!response.ok) throw new Error('Unable to load South Gate exploration view');
        this.container.innerHTML = await response.text();
        this.root = this.container.querySelector('[data-hunt-demo]');
        this.root.querySelector('[data-hunt-action="debug"]').hidden = (
            new URLSearchParams(window.location.search).get('dev') !== '1'
        );
        this.canvas = this.root.querySelector('[data-hunt-canvas]');
        this.context = this.canvas.getContext('2d', { alpha: false });
        this.debugCanvas = this.root.querySelector('[data-hunt-debug-canvas]');
        this.debugContext = this.debugCanvas.getContext('2d');
        this.resetState();
        await this.loadAssets();
        this.combat = new HuntDemoCombatAdapter(
            this.root.querySelector('[data-hunt-combat-host]'),
            this.state,
            { onActiveChange: active => { this.combatActive = active; } }
        );
        this.root.addEventListener('click', this.handleClick);
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('resize', this.resize);
        this.resize();
        this.updateHud();
        this.running = true;
        this.frameId = requestAnimationFrame(this.loop);
    }

    resetState() {
        const spawn = this.package.spawn;
        this.state = {
            hp: 120,
            maxHp: 120,
            potions: 3,
            stamina: 100,
            haul: [],
            evidence: new Set(),
            usedProps: new Set(),
            clearedDangers: new Set(),
            flags: {},
            loadout: null
        };
        this.player = {
            x: spawn.x,
            y: spawn.y,
            previousX: spawn.x,
            previousY: spawn.y,
            direction: spawn.direction,
            animation: 'idle',
            animationTime: 0,
            stridePhase: 0,
            stoppingTime: 0,
            rollTime: 0,
            rollVector: { x: 0, y: -1 }
        };
        this.camera = { x: spawn.x, y: spawn.y, ready: false };
        this.effects = [];
    }

    async loadAssets() {
        const entries = Object.entries({
            ...this.package.assets,
            traveler: ExplorationSpriteAtlas.image
        });
        const loaded = await Promise.all(entries.map(async ([key, src]) => [key, await loadImage(src)]));
        loaded.forEach(([key, image]) => this.assetImages.set(key, image));
        this.walkPixels = toImageData(this.assetImages.get('walkMask'));
        this.heightPixels = toImageData(this.assetImages.get('heightMask'));
        this.materialPixels = toImageData(this.assetImages.get('materialMask'));
        this.atlasMetadata = await fetch(ExplorationSpriteAtlas.metadata).then(result => result.json());
        const propSources = new Set();
        this.package.props.forEach(prop => {
            propSources.add(prop.image);
            propSources.add(prop.completedImage);
        });
        const propImages = await Promise.all(
            [...propSources].map(async src => [src, await loadImage(src)])
        );
        propImages.forEach(([src, image]) => this.assetImages.set(src, image));
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const width = Math.max(1, Math.round(rect.width * dpr));
        const height = Math.max(1, Math.round(rect.height * dpr));
        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
            this.debugCanvas.width = width;
            this.debugCanvas.height = height;
        }
        this.viewport = {
            width: rect.width,
            height: rect.height,
            dpr,
            zoom: this.package.camera.zoom
        };
    }

    handleKeyDown(event) {
        if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'ShiftRight', 'KeyE'].includes(event.code)) {
            event.preventDefault();
        }
        if (event.repeat && ['ShiftLeft', 'ShiftRight', 'KeyE'].includes(event.code)) return;
        this.keys.add(event.code);
        if ((event.code === 'ShiftLeft' || event.code === 'ShiftRight')) this.tryRoll();
        if (event.code === 'KeyE') this.interact();
    }

    handleKeyUp(event) {
        this.keys.delete(event.code);
    }

    handleClick(event) {
        const action = event.target.closest('[data-hunt-action]')?.dataset.huntAction;
        if (!action) return;
        if (action === 'start') {
            this.root.querySelector('[data-hunt-start]').hidden = true;
            this.canvas.focus({ preventScroll: true });
        } else if (action === 'notice-close') {
            this.root.querySelector('[data-hunt-notice]').hidden = true;
            this.canvas.focus({ preventScroll: true });
        } else if (action === 'debug') {
            this.debugVisible = !this.debugVisible;
            event.target.setAttribute('aria-pressed', String(this.debugVisible));
            event.target.textContent = this.debugVisible ? '關閉校正' : '校正';
        } else if (action === 'reset') {
            this.resetState();
            this.combat?.destroy();
            this.combat = new HuntDemoCombatAdapter(
                this.root.querySelector('[data-hunt-combat-host]'),
                this.state,
                { onActiveChange: active => { this.combatActive = active; } }
            );
            this.root.querySelector('[data-hunt-death]').hidden = true;
            this.updateHud();
        } else if (action === 'revive') {
            this.state.hp = this.state.maxHp;
            this.player.x = this.package.spawn.x;
            this.player.y = this.package.spawn.y;
            this.root.querySelector('[data-hunt-death]').hidden = true;
            this.updateHud();
        } else if (action === 'exit') {
            window.location.hash = 'lobby';
        }
    }

    isInputLocked() {
        return this.combatActive
            || !this.root.querySelector('[data-hunt-start]').hidden
            || !this.root.querySelector('[data-hunt-notice]').hidden
            || !this.root.querySelector('[data-hunt-death]').hidden;
    }

    loop(timestamp) {
        if (!this.running) return;
        const delta = this.lastFrameTime
            ? Math.min(0.1, (timestamp - this.lastFrameTime) / 1000)
            : 0;
        this.lastFrameTime = timestamp;
        this.fixedAccumulator += delta;
        while (this.fixedAccumulator >= FIXED_STEP) {
            this.fixedUpdate(FIXED_STEP);
            this.fixedAccumulator -= FIXED_STEP;
        }
        this.render(this.fixedAccumulator / FIXED_STEP);
        this.frameId = requestAnimationFrame(this.loop);
    }

    fixedUpdate(dt) {
        this.boundaryCooldown = Math.max(0, this.boundaryCooldown - dt);
        this.player.previousX = this.player.x;
        this.player.previousY = this.player.y;
        this.updateEffects(dt);
        if (this.isInputLocked()) return;

        if (this.player.animation === 'roll') {
            this.player.rollTime += dt;
            this.player.animationTime += dt;
            this.movePlayer(
                this.player.rollVector.x * ROLL_SPEED * dt,
                this.player.rollVector.y * ROLL_SPEED * dt
            );
            if (this.player.rollTime >= ROLL_DURATION) {
                this.player.animation = 'idle';
                this.player.animationTime = 0;
                this.player.rollTime = 0;
            }
        } else {
            const inputX = (this.keys.has('KeyD') ? 1 : 0) - (this.keys.has('KeyA') ? 1 : 0);
            const inputY = (this.keys.has('KeyS') ? 1 : 0) - (this.keys.has('KeyW') ? 1 : 0);
            if (inputX || inputY) {
                const vector = normalize(inputX, inputY);
                this.player.direction = directionFromVector(vector.x, vector.y, this.player.direction);
                this.player.animation = 'walk';
                this.player.stoppingTime = 0;
                const material = this.materialAt(this.player.x, this.player.y);
                const modifier = material === SouthGateMaterial.MUD ? 0.88 : 1;
                const moved = this.movePlayer(
                    vector.x * PLAYER_SPEED * modifier * dt,
                    vector.y * PLAYER_SPEED * modifier * dt
                );
                this.player.stridePhase = (this.player.stridePhase + moved / 76) % 1;
                this.player.animationTime += dt;
                this.emitGroundEffect(material, dt);
            } else if (this.player.animation === 'walk') {
                this.player.stoppingTime += dt;
                const target = Math.round(this.player.stridePhase * 2) / 2;
                this.player.stridePhase += (target - this.player.stridePhase) * Math.min(1, dt * 18);
                if (this.player.stoppingTime >= 0.09) {
                    this.player.animation = 'idle';
                    this.player.animationTime = 0;
                }
            } else {
                this.player.animationTime += dt;
            }
        }

        this.state.stamina = Math.min(100, this.state.stamina + 23 * dt);
        this.updateInteraction();
        this.checkDangerZones();
        this.checkExits();
        this.updateCamera(dt);
        this.updateHud();
    }

    tryRoll() {
        if (this.isInputLocked() || this.player.animation === 'roll' || this.state.stamina < ROLL_COST) return;
        const inputX = (this.keys.has('KeyD') ? 1 : 0) - (this.keys.has('KeyA') ? 1 : 0);
        const inputY = (this.keys.has('KeyS') ? 1 : 0) - (this.keys.has('KeyW') ? 1 : 0);
        const facing = this.directionVector(this.player.direction);
        this.player.rollVector = normalize(inputX || facing.x, inputY || facing.y);
        this.player.direction = directionFromVector(
            this.player.rollVector.x,
            this.player.rollVector.y,
            this.player.direction
        );
        this.player.animation = 'roll';
        this.player.animationTime = 0;
        this.player.rollTime = 0;
        this.state.stamina -= ROLL_COST;
    }

    directionVector(direction) {
        return {
            north: { x: 0, y: -1 },
            northeast: { x: 0.707, y: -0.707 },
            east: { x: 1, y: 0 },
            southeast: { x: 0.707, y: 0.707 },
            south: { x: 0, y: 1 },
            southwest: { x: -0.707, y: 0.707 },
            west: { x: -1, y: 0 },
            northwest: { x: -0.707, y: -0.707 }
        }[direction] || { x: 0, y: 1 };
    }

    movePlayer(dx, dy) {
        const total = length(dx, dy);
        if (!total) return 0;
        const steps = Math.max(1, Math.ceil(total / MAX_COLLISION_STEP));
        const stepX = dx / steps;
        const stepY = dy / steps;
        let moved = 0;
        for (let index = 0; index < steps; index += 1) {
            const startX = this.player.x;
            const startY = this.player.y;
            const candidates = this.slideCandidates(stepX, stepY);
            for (const candidate of candidates) {
                const x = startX + candidate.x;
                const y = startY + candidate.y;
                if (this.canOccupy(x, y)) {
                    this.player.x = x;
                    this.player.y = y;
                    moved += length(candidate.x, candidate.y);
                    break;
                }
            }
        }
        return moved;
    }

    slideCandidates(dx, dy) {
        const gradientX = this.walkValue(this.player.x + PLAYER_RADIUS, this.player.y)
            - this.walkValue(this.player.x - PLAYER_RADIUS, this.player.y);
        const gradientY = this.walkValue(this.player.x, this.player.y + PLAYER_RADIUS)
            - this.walkValue(this.player.x, this.player.y - PLAYER_RADIUS);
        const normal = normalize(gradientX, gradientY);
        const tangent = { x: -normal.y, y: normal.x };
        const projection = dx * tangent.x + dy * tangent.y;
        const alongEdge = { x: tangent.x * projection, y: tangent.y * projection };
        return [
            { x: dx, y: dy },
            alongEdge,
            { x: dx * 0.72, y: dy * 0.2 },
            { x: dx * 0.2, y: dy * 0.72 },
            { x: dx, y: 0 },
            { x: 0, y: dy }
        ].sort((a, b) => (b.x * dx + b.y * dy) - (a.x * dx + a.y * dy));
    }

    canOccupy(x, y) {
        const samples = 16;
        if (this.walkValue(x, y) < 128) return false;
        for (let index = 0; index < samples; index += 1) {
            const angle = index / samples * Math.PI * 2;
            if (this.walkValue(
                x + Math.cos(angle) * PLAYER_RADIUS,
                y + Math.sin(angle) * PLAYER_RADIUS
            ) < 128) return false;
        }
        return !this.package.props.some(prop => (
            prop.collisionRadius > 0
            && length(x - prop.x, y - prop.y) < PLAYER_RADIUS + prop.collisionRadius
        ));
    }

    pixelAt(imageData, x, y) {
        const px = clamp(Math.round(x), 0, imageData.width - 1);
        const py = clamp(Math.round(y), 0, imageData.height - 1);
        const offset = (py * imageData.width + px) * 4;
        return [
            imageData.data[offset],
            imageData.data[offset + 1],
            imageData.data[offset + 2],
            imageData.data[offset + 3]
        ];
    }

    walkValue(x, y) {
        return this.pixelAt(this.walkPixels, x, y)[0];
    }

    heightAt(x, y) {
        return this.pixelAt(this.heightPixels, x, y)[0];
    }

    materialAt(x, y) {
        const [r, g, b] = this.pixelAt(this.materialPixels, x, y);
        const distanceTo = color => Math.hypot(r - color[0], g - color[1], b - color[2]);
        const matches = [
            [SouthGateMaterial.GRASS, distanceTo(MASK_COLORS.grass)],
            [SouthGateMaterial.MUD, distanceTo(MASK_COLORS.mud)],
            [SouthGateMaterial.STONE, distanceTo(MASK_COLORS.stone)]
        ].sort((a, b2) => a[1] - b2[1]);
        return matches[0][1] < 80 ? matches[0][0] : SouthGateMaterial.VOID;
    }

    emitGroundEffect(material, dt) {
        const phase = Math.floor(this.player.stridePhase * 8);
        if (phase !== 1 && phase !== 5) return;
        const recent = this.effects[this.effects.length - 1];
        if (recent && length(recent.x - this.player.x, recent.y - this.player.y) < 42) return;
        if (material === SouthGateMaterial.MUD) {
            this.effects.push({
                type: 'footprint',
                x: this.player.x,
                y: this.player.y + 5,
                direction: this.player.direction,
                life: 3.8,
                maxLife: 3.8
            });
        } else if (material === SouthGateMaterial.GRASS) {
            this.effects.push({
                type: 'grass',
                x: this.player.x,
                y: this.player.y + 8,
                life: 0.75,
                maxLife: 0.75
            });
        }
    }

    updateEffects(dt) {
        this.effects.forEach(effect => { effect.life -= dt; });
        this.effects = this.effects.filter(effect => effect.life > 0);
    }

    updateCamera(dt) {
        const { width, height, zoom } = this.viewport;
        const halfWidth = width / zoom / 2;
        const topSpace = height / zoom * this.package.camera.anchorY;
        const bottomSpace = height / zoom - topSpace;
        const targetX = clamp(
            this.player.x,
            halfWidth,
            this.package.worldSize.width - halfWidth
        );
        const targetY = clamp(
            this.player.y,
            topSpace,
            this.package.worldSize.height - bottomSpace
        );
        if (!this.camera.ready) {
            this.camera.x = targetX;
            this.camera.y = targetY;
            this.camera.ready = true;
            return;
        }
        const blend = 1 - Math.pow(1 - this.package.camera.smoothing, dt * 60);
        this.camera.x += (targetX - this.camera.x) * blend;
        this.camera.y += (targetY - this.camera.y) * blend;
    }

    updateInteraction() {
        const available = this.package.props
            .map(prop => ({ prop, distance: length(prop.x - this.player.x, prop.y - this.player.y) }))
            .filter(entry => entry.distance <= entry.prop.radius)
            .sort((a, b) => a.distance - b.distance);
        this.nearbyProp = available[0]?.prop || null;
        const prompt = this.root.querySelector('[data-hunt-interaction]');
        prompt.hidden = !this.nearbyProp;
        if (this.nearbyProp) {
            const used = this.state.usedProps.has(this.nearbyProp.id);
            prompt.querySelector('[data-hunt-interaction-text]').textContent = used
                ? '再次查看'
                : this.nearbyProp.label;
        }
    }

    interact() {
        if (this.isInputLocked() || !this.nearbyProp) return;
        const prop = this.nearbyProp;
        const used = this.state.usedProps.has(prop.id);
        if (!used) {
            this.state.usedProps.add(prop.id);
            const result = prop.result;
            if (result.effect === 'rest') {
                this.state.hp = this.state.maxHp;
                this.state.clearedDangers.clear();
                this.state.stamina = 100;
            } else if (result.effect === 'evidence') {
                this.state.evidence.add(result.evidenceId);
            } else if (result.effect === 'loot') {
                mergeHaul(this.state.haul, result.items || []);
            }
        }
        const repeatText = used
            ? prop.type === 'rest'
                ? '火堆仍在燃燒。現在可以再次休息。'
                : '這裡已經沒有新的東西。'
            : prop.result.text;
        this.showNotice(prop.result.title, repeatText, used ? '再次查看' : '互動結果');
        this.updateHud();
    }

    async checkDangerZones() {
        if (this.combatActive || this.pendingDanger) return;
        const zone = this.package.dangerZones.find(candidate => (
            !this.state.clearedDangers.has(candidate.id)
            && pointInPolygon(this.player, candidate.polygon)
        ));
        if (!zone) return;
        this.pendingDanger = zone.id;
        const monsterId = zone.monsters[
            Math.floor(Math.random() * zone.monsters.length)
        ];
        const result = await this.combat.start({
            monsterId,
            encounterInstanceId: zone.id,
            openingState: 'neutral',
            canRetreat: zone.canRetreat,
            roomName: this.package.name
        });
        this.pendingDanger = null;
        if (!result) return;
        this.state.hp = result.hp;
        this.state.potions = result.potions;
        if (result.phase === CombatSessionPhase.VICTORY) {
            this.state.clearedDangers.add(zone.id);
            mergeHaul(this.state.haul, result.drops || []);
            this.player.x = zone.returnAfter.x;
            this.player.y = zone.returnAfter.y;
        } else if (result.phase === CombatSessionPhase.ESCAPED) {
            this.player.x = zone.returnBefore.x;
            this.player.y = zone.returnBefore.y;
        } else {
            this.root.querySelector('[data-hunt-death]').hidden = false;
        }
        this.updateHud();
    }

    checkExits() {
        if (this.boundaryCooldown > 0) return;
        const exit = this.package.exits.find(candidate => pointInPolygon(this.player, candidate.polygon));
        if (!exit) return;
        this.boundaryCooldown = 2;
        this.player.y = 175;
        this.showNotice(exit.label, exit.lockedText, '試作邊界');
    }

    showNotice(title, text, kicker = '探索') {
        const notice = this.root.querySelector('[data-hunt-notice]');
        notice.querySelector('[data-hunt-notice-kicker]').textContent = kicker;
        notice.querySelector('[data-hunt-notice-title]').textContent = title;
        notice.querySelector('[data-hunt-notice-text]').textContent = text;
        notice.hidden = false;
    }

    updateHud() {
        if (!this.root) return;
        this.root.querySelector('[data-hunt-hp]').textContent = Math.ceil(this.state.hp);
        this.root.querySelector('[data-hunt-max-hp]').textContent = this.state.maxHp;
        this.root.querySelector('[data-hunt-hp-fill]').style.width = `${this.state.hp / this.state.maxHp * 100}%`;
        this.root.querySelector('[data-hunt-stamina]').textContent = Math.floor(this.state.stamina);
        this.root.querySelector('[data-hunt-stamina-fill]').style.width = `${this.state.stamina}%`;
        this.root.querySelector('[data-hunt-potions]').textContent = this.state.potions;
        this.root.querySelector('[data-hunt-haul]').textContent = this.state.haul.reduce(
            (total, entry) => total + entry.quantity,
            0
        );
        this.root.querySelector('[data-hunt-evidence]').textContent = this.state.evidence.size;
    }

    render(interpolation) {
        if (!this.viewport || !this.assetImages.size) return;
        const { width, height, dpr, zoom } = this.viewport;
        const ctx = this.context;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);
        ctx.save();
        ctx.translate(width * 0.5, height * this.package.camera.anchorY);
        ctx.scale(zoom, zoom);
        ctx.translate(-this.camera.x, -this.camera.y);
        ctx.drawImage(this.assetImages.get('base'), 0, 0);
        this.drawEffects(ctx);

        const renderables = [];
        this.package.props.forEach(prop => {
            renderables.push({
                sortY: prop.y + this.heightAt(prop.x, prop.y) * 0.02,
                draw: () => this.drawProp(ctx, prop)
            });
        });
        renderables.push({
            sortY: this.player.y + this.heightAt(this.player.x, this.player.y) * 0.02,
            draw: () => this.drawPlayer(ctx, interpolation)
        });
        this.package.occluders.forEach(occluder => {
            renderables.push({
                sortY: occluder.sortY,
                draw: () => this.drawOccluder(ctx, occluder)
            });
        });
        renderables.sort((a, b) => a.sortY - b.sortY).forEach(entry => entry.draw());
        ctx.restore();
        this.renderDebug();
    }

    drawEffects(ctx) {
        this.effects.forEach(effect => {
            const alpha = clamp(effect.life / effect.maxLife, 0, 1);
            ctx.save();
            ctx.translate(effect.x, effect.y);
            if (effect.type === 'footprint') {
                const facing = this.directionVector(effect.direction);
                ctx.rotate(Math.atan2(facing.y, facing.x) + Math.PI / 2);
                ctx.fillStyle = `rgba(20, 14, 11, ${0.32 * alpha})`;
                ctx.beginPath();
                ctx.ellipse(-7, 0, 5, 14, -0.08, 0, Math.PI * 2);
                ctx.ellipse(7, 7, 5, 14, 0.08, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.strokeStyle = `rgba(78, 105, 61, ${0.65 * alpha})`;
                ctx.lineWidth = 3;
                [-14, -6, 5, 14].forEach((offset, index) => {
                    ctx.beginPath();
                    ctx.moveTo(offset, 8);
                    ctx.quadraticCurveTo(offset + (index % 2 ? 8 : -8), -3, offset + 2, -18);
                    ctx.stroke();
                });
            }
            ctx.restore();
        });
    }

    drawProp(ctx, prop) {
        const used = this.state.usedProps.has(prop.id);
        const source = used ? prop.completedImage : prop.image;
        const image = this.assetImages.get(source);
        if (!image) return;
        const width = image.naturalWidth * prop.scale;
        const flatDecal = prop.type === 'evidence';
        const height = image.naturalHeight * prop.scale * (flatDecal ? 0.42 : 1);
        ctx.save();
        ctx.translate(prop.x, prop.y);
        if (!flatDecal) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
            ctx.beginPath();
            ctx.ellipse(0, 3, width * 0.32, Math.max(9, height * 0.08), 0, 0, Math.PI * 2);
            ctx.fill();
        }
        if (this.nearbyProp?.id === prop.id) {
            ctx.shadowColor = 'rgba(226, 188, 95, 0.9)';
            ctx.shadowBlur = 18;
        }
        ctx.globalAlpha = used && prop.type !== 'rest' ? 0.62 : 1;
        ctx.drawImage(image, -width / 2, flatDecal ? -height / 2 : -height + 10, width, height);
        ctx.restore();
    }

    drawPlayer(ctx, interpolation) {
        const x = this.player.previousX + (this.player.x - this.player.previousX) * interpolation;
        const y = this.player.previousY + (this.player.y - this.player.previousY) * interpolation;
        const atlas = this.assetImages.get('traveler');
        const animation = this.atlasMetadata.animations[this.player.animation];
        const directionRow = animation.rows[this.player.direction];
        let frameIndex;
        if (this.player.animation === 'walk') {
            frameIndex = Math.floor(this.player.stridePhase * animation.frameCount) % animation.frameCount;
        } else {
            frameIndex = Math.min(
                animation.frameCount - 1,
                Math.floor(this.player.animationTime * animation.fps)
            );
            if (animation.loop) frameIndex %= animation.frameCount;
        }
        const frameWidth = this.atlasMetadata.frameSize.width;
        const frameHeight = this.atlasMetadata.frameSize.height;
        const pivot = this.atlasMetadata.pivot;
        const displayWidth = frameWidth * ATLAS_DISPLAY_SCALE;
        const displayHeight = frameHeight * ATLAS_DISPLAY_SCALE;
        const material = this.materialAt(x, y);
        const shadowOpacity = material === SouthGateMaterial.STONE ? 0.32 : 0.46;
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = `rgba(0, 0, 0, ${shadowOpacity})`;
        ctx.beginPath();
        ctx.ellipse(0, 4, 43, 13, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.filter = material === SouthGateMaterial.GRASS
            ? 'brightness(0.94) saturate(0.88)'
            : material === SouthGateMaterial.MUD
                ? 'brightness(0.91) sepia(0.08)'
                : 'brightness(0.98)';
        ctx.drawImage(
            atlas,
            frameIndex * frameWidth,
            directionRow * frameHeight,
            frameWidth,
            frameHeight,
            -pivot.x * ATLAS_DISPLAY_SCALE,
            -pivot.y * ATLAS_DISPLAY_SCALE,
            displayWidth,
            displayHeight
        );
        ctx.restore();
    }

    drawOccluder(ctx, occluder) {
        const foreground = this.assetImages.get('foreground');
        const rect = occluder.sourceRect;
        ctx.drawImage(
            foreground,
            rect.x,
            rect.y,
            rect.width,
            rect.height,
            rect.x,
            rect.y,
            rect.width,
            rect.height
        );
    }

    renderDebug() {
        const ctx = this.debugContext;
        const { width, height, dpr, zoom } = this.viewport;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);
        if (!this.debugVisible) return;
        ctx.save();
        ctx.translate(width * 0.5, height * this.package.camera.anchorY);
        ctx.scale(zoom, zoom);
        ctx.translate(-this.camera.x, -this.camera.y);
        ctx.globalAlpha = 0.36;
        ctx.drawImage(this.assetImages.get('materialMask'), 0, 0);
        ctx.globalAlpha = 0.8;
        ctx.strokeStyle = '#ffe074';
        ctx.lineWidth = 3 / zoom;
        ctx.beginPath();
        ctx.arc(this.player.x, this.player.y, PLAYER_RADIUS, 0, Math.PI * 2);
        ctx.stroke();
        this.package.dangerZones.forEach(zone => {
            ctx.strokeStyle = '#d35f54';
            ctx.beginPath();
            zone.polygon.forEach(([x, y], index) => (
                index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
            ));
            ctx.closePath();
            ctx.stroke();
        });
        ctx.restore();
    }

    destroy() {
        this.running = false;
        if (this.frameId) cancelAnimationFrame(this.frameId);
        this.combat?.destroy();
        this.root?.removeEventListener('click', this.handleClick);
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('resize', this.resize);
        this.container.innerHTML = '';
    }
}
