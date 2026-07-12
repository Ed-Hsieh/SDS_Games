const TAU = Math.PI * 2;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (start, end, amount) => start + (end - start) * amount;
const easeOutCubic = value => 1 - Math.pow(1 - value, 3);
const easeInOutCubic = value => value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;

export const CombatElementPalettes = Object.freeze({
    neutral: Object.freeze({ primary: '#f3ead8', secondary: '#baa879', accent: '#ffffff', smoke: '#77766e' }),
    fire: Object.freeze({ primary: '#ff9b42', secondary: '#d94724', accent: '#ffe0a0', smoke: '#6d2d21' }),
    ice: Object.freeze({ primary: '#a9edff', secondary: '#4b9ec4', accent: '#f4fdff', smoke: '#3b6375' }),
    thunder: Object.freeze({ primary: '#ffe986', secondary: '#c99a36', accent: '#fffce2', smoke: '#665a35' }),
    poison: Object.freeze({ primary: '#a4dc69', secondary: '#548a43', accent: '#dfffb4', smoke: '#40563b' }),
    shadow: Object.freeze({ primary: '#ba8bc1', secondary: '#65466f', accent: '#e5c8e7', smoke: '#33273b' }),
    glimmer: Object.freeze({ primary: '#fff4c9', secondary: '#cfbe82', accent: '#ffffff', smoke: '#847d63' })
});

class CombatParticle {
    constructor(config) {
        Object.assign(this, {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            gravity: 0,
            drag: 0.985,
            life: 0.5,
            maxLife: 0.5,
            size: 4,
            endSize: 0,
            color: '#ffffff',
            alpha: 1,
            rotation: 0,
            spin: 0,
            shape: 'circle',
            glow: 0,
            blend: 'lighter',
            stretch: 1,
            layer: 'front'
        }, config);
        this.maxLife = this.life;
    }

    update(delta) {
        this.life -= delta;
        if (this.life <= 0) return false;
        this.vx *= Math.pow(this.drag, delta * 60);
        this.vy *= Math.pow(this.drag, delta * 60);
        this.vy += this.gravity * delta;
        this.x += this.vx * delta;
        this.y += this.vy * delta;
        this.rotation += this.spin * delta;
        return true;
    }

    draw(ctx) {
        const progress = 1 - this.life / this.maxLife;
        const alpha = this.alpha * Math.pow(1 - progress, 1.35);
        const size = lerp(this.size, this.endSize, progress);
        if (alpha <= 0.005 || size <= 0.05) return;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.globalCompositeOperation = this.blend;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        if (this.glow > 0) {
            ctx.shadowColor = this.color;
            ctx.shadowBlur = this.glow;
        }
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;

        if (this.shape === 'spark') {
            ctx.beginPath();
            ctx.moveTo(-size * this.stretch, 0);
            ctx.lineTo(size * this.stretch, 0);
            ctx.lineWidth = Math.max(0.8, size * 0.28);
            ctx.stroke();
        } else if (this.shape === 'shard') {
            ctx.beginPath();
            ctx.moveTo(0, -size * 1.35);
            ctx.lineTo(size * 0.48, size * 0.35);
            ctx.lineTo(0, size);
            ctx.lineTo(-size * 0.48, size * 0.35);
            ctx.closePath();
            ctx.fill();
        } else if (this.shape === 'square') {
            ctx.fillRect(-size / 2, -size / 2, size, size);
        } else {
            ctx.beginPath();
            ctx.arc(0, 0, size, 0, TAU);
            ctx.fill();
        }
        ctx.restore();
    }
}

export default class CombatVfxEngine {
    constructor({ rearCanvas, frontCanvas, stage, onFps = null }) {
        this.rearCanvas = rearCanvas;
        this.frontCanvas = frontCanvas;
        this.stage = stage;
        this.rearCtx = rearCanvas?.getContext('2d');
        this.frontCtx = frontCanvas?.getContext('2d');
        this.onFps = onFps;
        this.width = 0;
        this.height = 0;
        this.dpr = 1;
        this.element = 'neutral';
        this.intensity = 1;
        this.density = 1;
        this.effects = [];
        this.rearParticles = [];
        this.frontParticles = [];
        this.timers = new Set();
        this.running = true;
        this.lastFrameAt = performance.now();
        this.fpsSampleAt = this.lastFrameAt;
        this.fpsFrames = 0;
        this.resize = this.resize.bind(this);
        this.frame = this.frame.bind(this);
        this.resizeObserver = new ResizeObserver(this.resize);
        this.resizeObserver.observe(stage);
        this.resize();
        this.frameId = requestAnimationFrame(this.frame);
    }

    setElement(element) {
        if (CombatElementPalettes[element]) this.element = element;
    }

    setIntensity(value) {
        this.intensity = clamp(Number(value) || 1, 0.35, 1.8);
    }

    setDensity(value) {
        this.density = clamp(Number(value) || 1, 0.25, 2);
    }

    get palette() {
        return CombatElementPalettes[this.element] || CombatElementPalettes.neutral;
    }

    get enemyPoint() {
        return { x: this.width * 0.515, y: this.height * 0.465 };
    }

    get playerPoint() {
        return { x: this.width * 0.5, y: this.height * 0.84 };
    }

    resize() {
        const rect = this.stage.getBoundingClientRect();
        this.width = Math.max(1, rect.width);
        this.height = Math.max(1, rect.height);
        this.dpr = clamp(window.devicePixelRatio || 1, 1, 2);
        [
            [this.rearCanvas, this.rearCtx],
            [this.frontCanvas, this.frontCtx]
        ].forEach(([canvas, ctx]) => {
            if (!canvas || !ctx) return;
            canvas.width = Math.round(this.width * this.dpr);
            canvas.height = Math.round(this.height * this.dpr);
            ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        });
    }

    clear() {
        this.timers.forEach(timer => window.clearTimeout(timer));
        this.timers.clear();
        this.effects.length = 0;
        this.rearParticles.length = 0;
        this.frontParticles.length = 0;
        this.rearCtx?.clearRect(0, 0, this.width, this.height);
        this.frontCtx?.clearRect(0, 0, this.width, this.height);
    }

    destroy() {
        this.running = false;
        cancelAnimationFrame(this.frameId);
        this.resizeObserver.disconnect();
        this.clear();
    }

    addParticle(config) {
        const particle = new CombatParticle(config);
        const list = particle.layer === 'rear' ? this.rearParticles : this.frontParticles;
        list.push(particle);
        return particle;
    }

    addEffect(type, config = {}) {
        const now = performance.now();
        this.effects.push({
            type,
            startAt: now + (config.delay || 0),
            duration: config.duration || 500,
            layer: config.layer || 'front',
            ...config
        });
    }

    schedule(callback, delay) {
        const timer = window.setTimeout(() => {
            this.timers.delete(timer);
            callback();
        }, delay);
        this.timers.add(timer);
        return timer;
    }

    emitBurst(point, options = {}) {
        const count = Math.round((options.count || 24) * this.density);
        const colors = options.colors || [this.palette.primary, this.palette.secondary, this.palette.accent];
        const speedMin = (options.speedMin || 90) * this.intensity;
        const speedMax = (options.speedMax || 330) * this.intensity;
        const angleStart = options.angleStart ?? 0;
        const angleEnd = options.angleEnd ?? TAU;
        for (let index = 0; index < count; index += 1) {
            const angle = lerp(angleStart, angleEnd, Math.random());
            const speed = lerp(speedMin, speedMax, Math.random());
            this.addParticle({
                x: point.x + (Math.random() - 0.5) * (options.spread || 10),
                y: point.y + (Math.random() - 0.5) * (options.spread || 10),
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                gravity: options.gravity ?? 130,
                drag: options.drag ?? 0.975,
                life: lerp(options.lifeMin || 0.24, options.lifeMax || 0.72, Math.random()),
                size: lerp(options.sizeMin || 1.4, options.sizeMax || 4.8, Math.random()) * this.intensity,
                endSize: options.endSize ?? 0,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: options.alpha ?? 1,
                rotation: angle,
                spin: (Math.random() - 0.5) * 10,
                shape: options.shape || (Math.random() > 0.45 ? 'spark' : 'circle'),
                glow: options.glow ?? 9,
                stretch: lerp(1, 2.8, Math.random()),
                blend: options.blend || 'lighter',
                layer: options.layer || 'front'
            });
        }
    }

    emitMotes(point, options = {}) {
        const count = Math.round((options.count || 20) * this.density);
        const colors = options.colors || [this.palette.primary, this.palette.secondary];
        for (let index = 0; index < count; index += 1) {
            this.addParticle({
                x: point.x + (Math.random() - 0.5) * (options.width || 180),
                y: point.y + (Math.random() - 0.5) * (options.height || 80),
                vx: (Math.random() - 0.5) * (options.drift || 30),
                vy: -lerp(options.speedMin || 35, options.speedMax || 115, Math.random()),
                gravity: options.gravity || 0,
                drag: 0.992,
                life: lerp(options.lifeMin || 0.65, options.lifeMax || 1.4, Math.random()),
                size: lerp(options.sizeMin || 1.5, options.sizeMax || 4.2, Math.random()) * this.intensity,
                endSize: options.endSize ?? 0.4,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: options.alpha ?? 0.82,
                shape: options.shape || 'circle',
                glow: options.glow ?? 11,
                blend: options.blend || 'lighter',
                layer: options.layer || 'front'
            });
        }
    }

    swordSlash({ mirrored = false, critical = false } = {}) {
        const point = this.enemyPoint;
        const angle = mirrored ? -2.75 : -0.35;
        this.addEffect('slash', {
            point,
            angle,
            radius: Math.min(this.width, this.height) * (critical ? 0.235 : 0.19),
            duration: critical ? 520 : 390,
            width: critical ? 25 : 17,
            color: critical ? '#ffd26c' : this.palette.primary,
            core: this.palette.accent
        });
        this.emitBurst(point, {
            count: critical ? 46 : 25,
            angleStart: mirrored ? -2.5 : -0.6,
            angleEnd: mirrored ? -0.3 : 2.2,
            speedMin: 105,
            speedMax: critical ? 430 : 310,
            gravity: 150,
            colors: critical
                ? ['#fff0ae', '#ffc759', '#ef7b3c']
                : [this.palette.accent, this.palette.primary, this.palette.secondary]
        });
        this.elementalImpact(point, { scale: critical ? 1.25 : 0.9 });
    }

    daggerChain() {
        const point = this.enemyPoint;
        const offsets = [
            { x: -36, y: 16, angle: -0.28 },
            { x: 22, y: -10, angle: -2.82 },
            { x: 4, y: 4, angle: -0.18 }
        ];
        offsets.forEach((offset, index) => {
            const hitPoint = { x: point.x + offset.x, y: point.y + offset.y };
            this.addEffect('slash', {
                point: hitPoint,
                angle: offset.angle,
                radius: Math.min(this.width, this.height) * 0.125,
                duration: 270,
                delay: index * 105,
                width: 10,
                color: this.palette.primary,
                core: this.palette.accent
            });
            this.schedule(() => {
                this.emitBurst(hitPoint, {
                    count: 13,
                    speedMin: 90,
                    speedMax: 245,
                    gravity: 80,
                    sizeMax: 3.2
                });
                if (index === offsets.length - 1) this.elementalImpact(point, { scale: 0.7 });
            }, index * 105 + 70);
        });
    }

    heavyImpact() {
        const point = { x: this.enemyPoint.x, y: this.enemyPoint.y + this.height * 0.09 };
        this.addEffect('impact-flare', {
            point,
            duration: 520,
            radius: Math.min(this.width, this.height) * 0.23,
            color: '#d9c5a0'
        });
        this.addEffect('shockwave', {
            point,
            duration: 680,
            maxRadius: Math.min(this.width, this.height) * 0.245,
            color: '#b8a17b',
            width: 7
        });
        this.emitBurst(point, {
            count: 58,
            speedMin: 100,
            speedMax: 470,
            gravity: 480,
            drag: 0.97,
            lifeMax: 1.05,
            sizeMin: 2,
            sizeMax: 7,
            shape: 'shard',
            colors: ['#d6c9ae', '#8b7659', this.palette.primary],
            glow: 4,
            blend: 'source-over'
        });
        this.elementalImpact(point, { scale: 1.35 });
    }

    interruptBurst() {
        const point = { x: this.enemyPoint.x, y: this.enemyPoint.y - this.height * 0.015 };
        this.addEffect('impact-flare', {
            point,
            duration: 380,
            radius: Math.min(this.width, this.height) * 0.16,
            color: '#f0d486'
        });
        this.addEffect('shockwave', {
            point,
            duration: 560,
            maxRadius: Math.min(this.width, this.height) * 0.2,
            color: '#88d4ca',
            width: 6
        });
        this.emitBurst(point, {
            count: 42,
            speedMin: 90,
            speedMax: 380,
            gravity: 170,
            drag: 0.975,
            lifeMax: 0.82,
            sizeMin: 1.6,
            sizeMax: 5.2,
            shape: 'shard',
            colors: ['#f3df9d', '#a9e7dd', '#fff6cf'],
            glow: 8
        });
    }

    lanceThrust({ fromRight = false } = {}) {
        const end = this.enemyPoint;
        const start = {
            x: fromRight ? this.width * 0.92 : this.width * 0.08,
            y: this.height * 0.78
        };
        this.addEffect('thrust', {
            start,
            end,
            duration: 470,
            width: 18,
            color: this.palette.primary,
            core: this.palette.accent
        });
        this.schedule(() => {
            this.emitBurst(end, {
                count: 34,
                speedMin: 120,
                speedMax: 390,
                gravity: 90,
                sizeMax: 4,
                angleStart: -1.1,
                angleEnd: 1.1
            });
            this.addEffect('shockwave', {
                point: end,
                duration: 420,
                maxRadius: Math.min(this.width, this.height) * 0.14,
                color: this.palette.primary,
                width: 8
            });
            this.elementalImpact(end, { scale: 0.9 });
        }, 250);
    }

    focusResonance() {
        const point = this.enemyPoint;
        this.addEffect('glyph', {
            point,
            duration: 980,
            radius: Math.min(this.width, this.height) * 0.145,
            color: this.palette.primary,
            core: this.palette.accent
        });
        this.emitMotes(point, {
            count: 34,
            width: 250,
            height: 210,
            speedMin: 25,
            speedMax: 85,
            colors: [this.palette.primary, this.palette.secondary, this.palette.accent]
        });
        this.schedule(() => {
            this.addEffect('impact-flare', {
                point,
                duration: 520,
                radius: Math.min(this.width, this.height) * 0.22,
                color: this.palette.primary
            });
            this.emitBurst(point, {
                count: 54,
                speedMin: 85,
                speedMax: 420,
                gravity: 20,
                lifeMax: 0.95
            });
            this.elementalImpact(point, { scale: 1.45 });
        }, 560);
    }

    monsterClaw() {
        const center = { x: this.width * 0.5, y: this.height * 0.58 };
        [-54, 0, 54].forEach((offset, index) => {
            this.addEffect('claw', {
                point: { x: center.x + offset, y: center.y },
                duration: 520,
                delay: index * 55,
                color: '#e85d49',
                core: '#ffd1bd'
            });
        });
    }

    monsterCrush() {
        const point = { x: this.width * 0.5, y: this.height * 0.7 };
        this.addEffect('vertical-crush', {
            point,
            duration: 700,
            color: '#e07448',
            core: '#ffd29b'
        });
        this.addEffect('shockwave', {
            point,
            duration: 760,
            delay: 230,
            maxRadius: Math.min(this.width, this.height) * 0.44,
            color: '#d45b39',
            width: 22
        });
        this.schedule(() => {
            this.emitBurst(point, {
                count: 70,
                speedMin: 120,
                speedMax: 530,
                gravity: 560,
                lifeMax: 1.1,
                shape: 'shard',
                colors: ['#d7b589', '#7e4d35', '#d9623c'],
                blend: 'source-over',
                glow: 3
            });
        }, 270);
    }

    monsterProjectile() {
        const start = { x: this.width * 0.52, y: this.height * 0.38 };
        const end = { x: this.width * 0.5, y: this.height * 0.82 };
        this.addEffect('projectile', {
            start,
            end,
            duration: 900,
            color: '#dc5c49',
            core: '#ffd0a6'
        });
        return 760;
    }

    monsterBreath() {
        const start = { x: this.width * 0.52, y: this.height * 0.38 };
        const end = { x: this.width * 0.5, y: this.height * 0.91 };
        this.addEffect('breath', {
            start,
            end,
            duration: 1150,
            color: '#e15e34',
            core: '#ffd887'
        });
        for (let delay = 260; delay < 880; delay += 90) {
            this.schedule(() => {
                const progress = (delay - 260) / 620;
                const point = {
                    x: lerp(start.x, end.x, progress) + (Math.random() - 0.5) * 90,
                    y: lerp(start.y, end.y, progress) + (Math.random() - 0.5) * 40
                };
                this.emitBurst(point, {
                    count: 8,
                    speedMin: 30,
                    speedMax: 135,
                    gravity: -30,
                    drag: 0.96,
                    lifeMax: 0.62,
                    sizeMin: 2,
                    sizeMax: 6,
                    colors: ['#ffca66', '#ed6d32', '#9e3328']
                });
            }, delay);
        }
        return 840;
    }

    monsterCurse() {
        const player = this.playerPoint;
        this.addEffect('curse', {
            point: player,
            duration: 1280,
            radius: Math.min(this.width, this.height) * 0.25,
            color: '#9b6ca9',
            core: '#e0b6df'
        });
        this.emitMotes(player, {
            count: 46,
            width: this.width * 0.62,
            height: 160,
            speedMin: 45,
            speedMax: 145,
            colors: ['#b17bb8', '#684774', '#34263d'],
            glow: 13,
            layer: 'front'
        });
        return 780;
    }

    bossPhase() {
        const point = this.enemyPoint;
        [0, 180, 360].forEach((delay, index) => {
            this.addEffect('shockwave', {
                point,
                duration: 1200,
                delay,
                maxRadius: Math.min(this.width, this.height) * (0.28 + index * 0.08),
                color: index === 1 ? '#e27145' : '#8d3430',
                width: 18,
                layer: 'rear'
            });
        });
        this.addEffect('phase-rays', {
            point,
            duration: 1900,
            color: '#dc6244',
            core: '#ffbf73',
            layer: 'rear'
        });
        this.emitMotes(point, {
            count: 80,
            width: Math.min(this.width * 0.7, 720),
            height: 430,
            speedMin: 25,
            speedMax: 150,
            colors: ['#f07b48', '#b73f32', '#6c2629'],
            lifeMin: 0.8,
            lifeMax: 2.1,
            layer: 'rear'
        });
    }

    heal({ target = 'player' } = {}) {
        const point = target === 'enemy' ? this.enemyPoint : this.playerPoint;
        this.addEffect('heal-ring', {
            point,
            duration: 850,
            maxRadius: Math.min(this.width, this.height) * (target === 'enemy' ? 0.18 : 0.12),
            color: '#72bf8d',
            core: '#d8ffe0'
        });
        this.emitMotes(point, {
            count: 44,
            width: target === 'enemy' ? 260 : 340,
            height: target === 'enemy' ? 230 : 100,
            speedMin: 60,
            speedMax: 175,
            colors: ['#d9f6c8', '#85ca94', '#d7c87d'],
            lifeMin: 0.55,
            lifeMax: 1.25,
            sizeMax: 5.2,
            glow: 14
        });
    }

    elementalImpact(point, { scale = 1 } = {}) {
        if (this.element === 'neutral') return;
        if (this.element === 'fire') {
            this.addEffect('element-fire', {
                point,
                duration: 620,
                radius: 90 * scale,
                color: this.palette.primary,
                core: this.palette.accent
            });
            this.emitBurst(point, {
                count: 30 * scale,
                speedMin: 70,
                speedMax: 290,
                gravity: -110,
                angleStart: -Math.PI * 0.94,
                angleEnd: -Math.PI * 0.06,
                colors: [this.palette.primary, this.palette.secondary, this.palette.accent],
                sizeMin: 1.1,
                sizeMax: 4.2
            });
        } else if (this.element === 'ice') {
            this.addEffect('element-ice', {
                point,
                duration: 700,
                radius: 105 * scale,
                color: this.palette.primary,
                core: this.palette.accent
            });
            this.emitBurst(point, {
                count: 34 * scale,
                speedMin: 95,
                speedMax: 330,
                gravity: 210,
                shape: 'shard',
                colors: [this.palette.primary, this.palette.secondary, this.palette.accent],
                sizeMin: 2,
                sizeMax: 7,
                glow: 8
            });
        } else if (this.element === 'thunder') {
            this.addEffect('lightning', {
                point,
                duration: 520,
                radius: 125 * scale,
                color: this.palette.primary,
                core: this.palette.accent
            });
        } else if (this.element === 'poison') {
            this.addEffect('element-poison', {
                point,
                duration: 900,
                radius: 110 * scale,
                color: this.palette.primary,
                core: this.palette.accent
            });
            this.emitMotes(point, {
                count: 24 * scale,
                width: 170 * scale,
                height: 110 * scale,
                speedMin: 20,
                speedMax: 65,
                colors: [this.palette.primary, this.palette.secondary],
                blend: 'source-over',
                alpha: 0.68
            });
        } else if (this.element === 'shadow') {
            this.addEffect('element-shadow', {
                point,
                duration: 820,
                radius: 120 * scale,
                color: this.palette.primary,
                core: this.palette.accent
            });
            this.emitMotes(point, {
                count: 30 * scale,
                width: 210 * scale,
                height: 180 * scale,
                speedMin: 35,
                speedMax: 120,
                colors: [this.palette.primary, this.palette.secondary],
                glow: 15
            });
        } else if (this.element === 'glimmer') {
            this.addEffect('element-glimmer', {
                point,
                duration: 780,
                radius: 125 * scale,
                color: this.palette.primary,
                core: this.palette.accent
            });
            this.emitBurst(point, {
                count: 32 * scale,
                speedMin: 55,
                speedMax: 260,
                gravity: -35,
                colors: [this.palette.primary, this.palette.secondary, this.palette.accent],
                shape: 'spark',
                sizeMax: 3.4,
                glow: 14
            });
        }
    }

    frame(now) {
        if (!this.running) return;
        const delta = clamp((now - this.lastFrameAt) / 1000, 0, 0.05);
        this.lastFrameAt = now;
        this.fpsFrames += 1;
        if (now - this.fpsSampleAt >= 700) {
            const fps = Math.round((this.fpsFrames * 1000) / (now - this.fpsSampleAt));
            this.onFps?.(fps);
            this.fpsFrames = 0;
            this.fpsSampleAt = now;
        }

        this.updateParticles(this.rearParticles, delta);
        this.updateParticles(this.frontParticles, delta);
        this.effects = this.effects.filter(effect => now < effect.startAt + effect.duration);
        this.drawLayer(this.rearCtx, 'rear', now, this.rearParticles);
        this.drawLayer(this.frontCtx, 'front', now, this.frontParticles);
        this.frameId = requestAnimationFrame(this.frame);
    }

    updateParticles(list, delta) {
        for (let index = list.length - 1; index >= 0; index -= 1) {
            if (!list[index].update(delta)) list.splice(index, 1);
        }
    }

    drawLayer(ctx, layer, now, particles) {
        if (!ctx) return;
        ctx.clearRect(0, 0, this.width, this.height);
        this.effects.forEach(effect => {
            if (effect.layer !== layer || now < effect.startAt) return;
            const progress = clamp((now - effect.startAt) / effect.duration, 0, 1);
            this.drawEffect(ctx, effect, progress, now);
        });
        particles.forEach(particle => particle.draw(ctx));
    }

    drawEffect(ctx, effect, progress, now) {
        const fade = Math.sin(progress * Math.PI);
        if (effect.type === 'slash') this.drawSlash(ctx, effect, progress, fade);
        else if (effect.type === 'claw') this.drawClaw(ctx, effect, progress, fade);
        else if (effect.type === 'shockwave') this.drawShockwave(ctx, effect, progress, fade);
        else if (effect.type === 'impact-flare') this.drawImpactFlare(ctx, effect, progress, fade);
        else if (effect.type === 'thrust') this.drawThrust(ctx, effect, progress, fade);
        else if (effect.type === 'glyph') this.drawGlyph(ctx, effect, progress, fade);
        else if (effect.type === 'vertical-crush') this.drawVerticalCrush(ctx, effect, progress, fade);
        else if (effect.type === 'projectile') this.drawProjectile(ctx, effect, progress, fade);
        else if (effect.type === 'breath') this.drawBreath(ctx, effect, progress, fade);
        else if (effect.type === 'curse') this.drawCurse(ctx, effect, progress, fade, now);
        else if (effect.type === 'phase-rays') this.drawPhaseRays(ctx, effect, progress, fade);
        else if (effect.type === 'heal-ring') this.drawHealRing(ctx, effect, progress, fade);
        else if (effect.type === 'element-fire') this.drawElementFire(ctx, effect, progress, fade);
        else if (effect.type === 'element-ice') this.drawElementIce(ctx, effect, progress, fade);
        else if (effect.type === 'lightning') this.drawLightning(ctx, effect, progress, fade, now);
        else if (effect.type === 'element-poison') this.drawElementPoison(ctx, effect, progress, fade);
        else if (effect.type === 'element-shadow') this.drawElementShadow(ctx, effect, progress, fade, now);
        else if (effect.type === 'element-glimmer') this.drawElementGlimmer(ctx, effect, progress, fade);
    }

    drawSlash(ctx, effect, progress, fade) {
        const reveal = easeOutCubic(clamp(progress * 1.65, 0, 1));
        const direction = Math.cos(effect.angle) >= 0 ? 1 : -1;
        const radius = effect.radius;
        const p0 = { x: -direction * radius * 0.96, y: radius * 0.7 };
        const p1 = { x: -direction * radius * 0.48, y: radius * 0.42 };
        const p2 = { x: direction * radius * 0.3, y: -radius * 0.58 };
        const p3 = { x: direction * radius, y: -radius * 0.72 };
        const pointAt = amount => {
            const inverse = 1 - amount;
            return {
                x: inverse ** 3 * p0.x + 3 * inverse ** 2 * amount * p1.x + 3 * inverse * amount ** 2 * p2.x + amount ** 3 * p3.x,
                y: inverse ** 3 * p0.y + 3 * inverse ** 2 * amount * p1.y + 3 * inverse * amount ** 2 * p2.y + amount ** 3 * p3.y
            };
        };
        const segments = 30;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.translate(effect.point.x, effect.point.y);
        ctx.lineCap = 'round';
        ctx.shadowColor = effect.color;
        ctx.shadowBlur = 22 * fade * this.intensity;
        const drawRibbon = (color, alpha, widthScale, taperBias = 0) => {
            ctx.strokeStyle = color;
            ctx.globalAlpha = fade * alpha;
            for (let index = 1; index <= segments; index += 1) {
                const previousAmount = (index - 1) / segments;
                const amount = Math.min(reveal, index / segments);
                if (amount <= previousAmount) break;
                const previous = pointAt(previousAmount);
                const current = pointAt(amount);
                const taper = Math.sin(amount * Math.PI);
                ctx.lineWidth = Math.max(1, (effect.width * widthScale * taper + taperBias) * this.intensity);
                ctx.beginPath();
                ctx.moveTo(previous.x, previous.y);
                ctx.lineTo(current.x, current.y);
                ctx.stroke();
                if (amount >= reveal) break;
            }
        };
        drawRibbon(effect.color, 0.24, 1.3, -3.5 * direction);
        drawRibbon(effect.color, 0.52, 0.72, 0);
        ctx.shadowBlur = 12 * fade;
        drawRibbon(effect.core, 0.96, 0.16, 0);
        ctx.restore();
    }

    drawClaw(ctx, effect, progress, fade) {
        const length = Math.min(this.width, this.height) * 0.56;
        const reveal = easeOutCubic(clamp(progress * 1.65, 0, 1));
        const x1 = effect.point.x - length * 0.5;
        const y1 = effect.point.y - length * 0.38;
        const x2 = lerp(x1, effect.point.x + length * 0.5, reveal);
        const y2 = lerp(y1, effect.point.y + length * 0.38, reveal);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        ctx.shadowColor = effect.color;
        ctx.shadowBlur = 26;
        ctx.globalAlpha = fade * 0.48;
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = 19 * this.intensity;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(effect.point.x, effect.point.y - 32, x2, y2);
        ctx.stroke();
        ctx.globalAlpha = fade;
        ctx.strokeStyle = effect.core;
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(effect.point.x, effect.point.y - 32, x2, y2);
        ctx.stroke();
        ctx.restore();
    }

    drawShockwave(ctx, effect, progress, fade) {
        const radius = effect.maxRadius * easeOutCubic(progress);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = fade * 0.75;
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = lerp(effect.width || 12, 1, progress) * this.intensity;
        ctx.shadowColor = effect.color;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.ellipse(effect.point.x, effect.point.y, radius, radius * 0.42, 0, 0, TAU);
        ctx.stroke();
        ctx.restore();
    }

    drawImpactFlare(ctx, effect, progress, fade) {
        const radius = effect.radius * easeOutCubic(progress);
        const gradient = ctx.createRadialGradient(effect.point.x, effect.point.y, 0, effect.point.x, effect.point.y, radius);
        gradient.addColorStop(0, effect.color);
        gradient.addColorStop(0.18, `${effect.color}cc`);
        gradient.addColorStop(1, `${effect.color}00`);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = fade * 0.9;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(effect.point.x, effect.point.y, radius, 0, TAU);
        ctx.fill();
        ctx.restore();
    }

    drawThrust(ctx, effect, progress, fade) {
        const travel = easeInOutCubic(clamp(progress * 1.25, 0, 1));
        const head = {
            x: lerp(effect.start.x, effect.end.x, travel),
            y: lerp(effect.start.y, effect.end.y, travel)
        };
        const tailProgress = clamp(travel - 0.26, 0, 1);
        const tail = {
            x: lerp(effect.start.x, effect.end.x, tailProgress),
            y: lerp(effect.start.y, effect.end.y, tailProgress)
        };
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        ctx.shadowColor = effect.color;
        ctx.shadowBlur = 28;
        ctx.globalAlpha = fade * 0.5;
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = effect.width * this.intensity;
        ctx.beginPath();
        ctx.moveTo(tail.x, tail.y);
        ctx.lineTo(head.x, head.y);
        ctx.stroke();
        ctx.globalAlpha = fade;
        ctx.strokeStyle = effect.core;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(tail.x, tail.y);
        ctx.lineTo(head.x, head.y);
        ctx.stroke();
        ctx.restore();
    }

    drawGlyph(ctx, effect, progress, fade) {
        const radius = effect.radius * easeOutCubic(clamp(progress * 1.4, 0, 1));
        const rotation = progress * Math.PI * 1.6;
        ctx.save();
        ctx.translate(effect.point.x, effect.point.y);
        ctx.rotate(rotation);
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = fade * 0.82;
        ctx.strokeStyle = effect.color;
        ctx.shadowColor = effect.color;
        ctx.shadowBlur = 18;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, TAU);
        ctx.stroke();
        ctx.rotate(-rotation * 1.7);
        ctx.beginPath();
        for (let index = 0; index < 6; index += 1) {
            const angle = index / 6 * TAU - Math.PI / 2;
            const x = Math.cos(angle) * radius * 0.72;
            const y = Math.sin(angle) * radius * 0.72;
            if (index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = effect.core;
        ctx.stroke();
        ctx.restore();
    }

    drawVerticalCrush(ctx, effect, progress, fade) {
        const reveal = easeInOutCubic(clamp(progress * 1.45, 0, 1));
        const top = -this.height * 0.1;
        const endY = lerp(top, effect.point.y, reveal);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        ctx.shadowColor = effect.color;
        ctx.shadowBlur = 34;
        ctx.globalAlpha = fade * 0.5;
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = 42 * this.intensity;
        ctx.beginPath();
        ctx.moveTo(effect.point.x, top);
        ctx.lineTo(effect.point.x, endY);
        ctx.stroke();
        ctx.globalAlpha = fade;
        ctx.strokeStyle = effect.core;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(effect.point.x, top);
        ctx.lineTo(effect.point.x, endY);
        ctx.stroke();
        ctx.restore();
    }

    drawProjectile(ctx, effect, progress, fade) {
        const travel = easeInOutCubic(progress);
        const control = { x: effect.start.x + this.width * 0.17, y: effect.start.y + this.height * 0.18 };
        const pointAt = amount => ({
            x: Math.pow(1 - amount, 2) * effect.start.x + 2 * (1 - amount) * amount * control.x + amount * amount * effect.end.x,
            y: Math.pow(1 - amount, 2) * effect.start.y + 2 * (1 - amount) * amount * control.y + amount * amount * effect.end.y
        });
        const point = pointAt(travel);
        const x = point.x;
        const y = point.y;
        const radius = (18 + Math.sin(progress * Math.PI) * 17) * this.intensity;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.3);
        gradient.addColorStop(0, effect.core);
        gradient.addColorStop(0.25, effect.color);
        gradient.addColorStop(1, `${effect.color}00`);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        const tailStart = Math.max(0, travel - 0.34);
        const tailSegments = 15;
        let previous = pointAt(tailStart);
        for (let index = 1; index <= tailSegments; index += 1) {
            const amount = lerp(tailStart, travel, index / tailSegments);
            const current = pointAt(amount);
            const tailProgress = index / tailSegments;
            ctx.globalAlpha = fade * tailProgress * 0.5;
            ctx.strokeStyle = index > tailSegments * 0.74 ? effect.core : effect.color;
            ctx.lineWidth = Math.max(1, radius * tailProgress * 0.42);
            ctx.shadowColor = effect.color;
            ctx.shadowBlur = 22;
            ctx.beginPath();
            ctx.moveTo(previous.x, previous.y);
            ctx.lineTo(current.x, current.y);
            ctx.stroke();
            previous = current;
        }
        ctx.globalAlpha = clamp(fade * 1.5, 0, 1);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius * 2.3, 0, TAU);
        ctx.fill();
        ctx.restore();
    }

    drawBreath(ctx, effect, progress, fade) {
        const reveal = easeOutCubic(clamp(progress * 1.75, 0, 1));
        const endX = lerp(effect.start.x, effect.end.x, reveal);
        const endY = lerp(effect.start.y, effect.end.y, reveal);
        const dx = endX - effect.start.x;
        const dy = endY - effect.start.y;
        const length = Math.max(1, Math.hypot(dx, dy));
        const normalX = -dy / length;
        const normalY = dx / length;
        const endWidth = Math.min(130, this.width * 0.14) * reveal * this.intensity;
        const startWidth = 7 * this.intensity;
        const gradient = ctx.createLinearGradient(effect.start.x, effect.start.y, endX, endY);
        gradient.addColorStop(0, `${effect.core}8c`);
        gradient.addColorStop(0.35, `${effect.color}64`);
        gradient.addColorStop(1, `${effect.color}10`);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = fade * 0.5;
        ctx.fillStyle = gradient;
        ctx.shadowColor = effect.color;
        ctx.shadowBlur = 24;
        ctx.beginPath();
        ctx.moveTo(effect.start.x + normalX * startWidth, effect.start.y + normalY * startWidth);
        ctx.bezierCurveTo(
            effect.start.x + dx * 0.38 + normalX * endWidth * 0.28,
            effect.start.y + dy * 0.38 + normalY * endWidth * 0.28,
            effect.start.x + dx * 0.72 + normalX * endWidth * 0.7,
            effect.start.y + dy * 0.72 + normalY * endWidth * 0.7,
            endX + normalX * endWidth,
            endY + normalY * endWidth
        );
        ctx.lineTo(endX - normalX * endWidth, endY - normalY * endWidth);
        ctx.bezierCurveTo(
            effect.start.x + dx * 0.72 - normalX * endWidth * 0.7,
            effect.start.y + dy * 0.72 - normalY * endWidth * 0.7,
            effect.start.x + dx * 0.38 - normalX * endWidth * 0.28,
            effect.start.y + dy * 0.38 - normalY * endWidth * 0.28,
            effect.start.x - normalX * startWidth,
            effect.start.y - normalY * startWidth
        );
        ctx.closePath();
        ctx.fill();

        ctx.lineCap = 'round';
        for (let index = 0; index < 7; index += 1) {
            const offsetRatio = (index - 3) / 3;
            const wave = Math.sin(progress * 7 + index * 1.9) * endWidth * 0.12;
            ctx.globalAlpha = fade * (0.18 + (index % 3) * 0.08);
            ctx.strokeStyle = index % 3 === 0 ? effect.core : effect.color;
            ctx.lineWidth = (index % 3 === 0 ? 3.4 : 1.7) * this.intensity;
            ctx.shadowBlur = index % 3 === 0 ? 20 : 10;
            ctx.beginPath();
            ctx.moveTo(
                effect.start.x + normalX * offsetRatio * startWidth,
                effect.start.y + normalY * offsetRatio * startWidth
            );
            ctx.bezierCurveTo(
                effect.start.x + dx * 0.34 + normalX * (offsetRatio * endWidth * 0.24 + wave),
                effect.start.y + dy * 0.34 + normalY * (offsetRatio * endWidth * 0.24 + wave),
                effect.start.x + dx * 0.7 + normalX * (offsetRatio * endWidth * 0.68 - wave),
                effect.start.y + dy * 0.7 + normalY * (offsetRatio * endWidth * 0.68 - wave),
                endX + normalX * offsetRatio * endWidth * 0.9,
                endY + normalY * offsetRatio * endWidth * 0.9
            );
            ctx.stroke();
        }
        ctx.restore();
    }

    drawCurse(ctx, effect, progress, fade, now) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = fade * 0.7;
        ctx.strokeStyle = effect.color;
        ctx.shadowColor = effect.color;
        ctx.shadowBlur = 20;
        ctx.lineWidth = 3;
        for (let index = 0; index < 9; index += 1) {
            const angle = index / 9 * TAU + now * 0.00045;
            const inner = effect.radius * (0.22 + progress * 0.18);
            const outer = effect.radius * (0.64 + Math.sin(now * 0.003 + index) * 0.16);
            const x1 = effect.point.x + Math.cos(angle) * inner;
            const y1 = effect.point.y + Math.sin(angle) * inner * 0.45;
            const x2 = effect.point.x + Math.cos(angle + 0.42) * outer;
            const y2 = effect.point.y + Math.sin(angle + 0.42) * outer * 0.62;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.quadraticCurveTo(effect.point.x + Math.cos(angle) * outer * 0.7, effect.point.y - outer * 0.24, x2, y2);
            ctx.stroke();
        }
        ctx.restore();
    }

    drawPhaseRays(ctx, effect, progress, fade) {
        ctx.save();
        ctx.translate(effect.point.x, effect.point.y);
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = fade * 0.36;
        ctx.strokeStyle = effect.color;
        ctx.shadowColor = effect.core;
        ctx.shadowBlur = 24;
        for (let index = 0; index < 18; index += 1) {
            const angle = index / 18 * TAU + progress * 0.7;
            const inner = 42;
            const outer = lerp(80, Math.max(this.width, this.height) * 0.72, easeOutCubic(progress));
            ctx.lineWidth = index % 3 === 0 ? 4 : 1.5;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
            ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
            ctx.stroke();
        }
        ctx.restore();
    }

    drawHealRing(ctx, effect, progress, fade) {
        const radius = effect.maxRadius * easeOutCubic(progress);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = fade * 0.82;
        ctx.strokeStyle = effect.color;
        ctx.shadowColor = effect.core;
        ctx.shadowBlur = 18;
        ctx.lineWidth = lerp(10, 1, progress);
        ctx.beginPath();
        ctx.ellipse(effect.point.x, effect.point.y, radius, radius * 0.34, 0, 0, TAU);
        ctx.stroke();
        ctx.restore();
    }

    drawElementFire(ctx, effect, progress, fade) {
        const radius = effect.radius * easeOutCubic(progress);
        ctx.save();
        ctx.translate(effect.point.x, effect.point.y + radius * 0.18);
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = fade * 0.52;
        ctx.shadowColor = effect.core;
        ctx.shadowBlur = 16;
        ctx.lineCap = 'round';
        const colors = [effect.color, '#e66b39', '#ffd083'];
        for (let index = 0; index < 7; index += 1) {
            const offset = (index - 3) * radius * 0.16;
            const tongueHeight = radius * (0.34 + ((index * 29) % 4) * 0.12);
            const sway = Math.sin(index * 2.1 + progress * 4.2) * radius * 0.13;
            ctx.strokeStyle = colors[index % colors.length];
            ctx.globalAlpha = fade * (0.2 + (index % 3) * 0.08);
            ctx.lineWidth = Math.max(1.4, radius * (0.022 + (index % 2) * 0.014));
            ctx.beginPath();
            ctx.moveTo(offset, radius * 0.28);
            ctx.bezierCurveTo(
                offset - sway * 0.55,
                -tongueHeight * 0.08,
                offset + sway,
                -tongueHeight * 0.58,
                offset + sway * 0.32,
                -tongueHeight
            );
            ctx.stroke();
        }
        const glow = ctx.createRadialGradient(0, radius * 0.12, 0, 0, radius * 0.12, radius * 0.92);
        glow.addColorStop(0, 'rgba(255, 211, 112, 0.32)');
        glow.addColorStop(0.42, 'rgba(226, 82, 37, 0.13)');
        glow.addColorStop(1, 'rgba(160, 38, 24, 0)');
        ctx.globalAlpha = fade * 0.62;
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, radius * 0.12, radius * 0.92, 0, TAU);
        ctx.fill();
        ctx.restore();
    }

    drawElementIce(ctx, effect, progress, fade) {
        const radius = effect.radius * easeOutCubic(progress);
        ctx.save();
        ctx.translate(effect.point.x, effect.point.y);
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = fade * 0.78;
        ctx.fillStyle = effect.color;
        ctx.strokeStyle = effect.core;
        ctx.shadowColor = effect.color;
        ctx.shadowBlur = 18;
        for (let index = 0; index < 9; index += 1) {
            const angle = index / 9 * TAU;
            const length = radius * (0.48 + (index % 3) * 0.16);
            ctx.save();
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(0, -4);
            ctx.lineTo(length, 0);
            ctx.lineTo(0, 4);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
    }

    drawLightning(ctx, effect, progress, fade, now) {
        const branches = 5;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = fade;
        ctx.strokeStyle = effect.core;
        ctx.shadowColor = effect.color;
        ctx.shadowBlur = 25;
        ctx.lineWidth = 2.4;
        for (let branch = 0; branch < branches; branch += 1) {
            const angle = branch / branches * TAU + now * 0.0008;
            const end = {
                x: effect.point.x + Math.cos(angle) * effect.radius,
                y: effect.point.y + Math.sin(angle) * effect.radius
            };
            ctx.beginPath();
            ctx.moveTo(effect.point.x, effect.point.y);
            const segments = 8;
            for (let segment = 1; segment <= segments; segment += 1) {
                const amount = segment / segments;
                const jitter = Math.sin(now * 0.02 + segment * 4.7 + branch) * 10 * (1 - amount * 0.5);
                const normalX = -Math.sin(angle);
                const normalY = Math.cos(angle);
                ctx.lineTo(
                    lerp(effect.point.x, end.x, amount) + normalX * jitter,
                    lerp(effect.point.y, end.y, amount) + normalY * jitter
                );
            }
            ctx.stroke();
        }
        ctx.restore();
    }

    drawElementPoison(ctx, effect, progress, fade) {
        const radius = effect.radius * easeOutCubic(progress);
        const gradient = ctx.createRadialGradient(effect.point.x, effect.point.y, radius * 0.1, effect.point.x, effect.point.y, radius);
        gradient.addColorStop(0, `${effect.core}c0`);
        gradient.addColorStop(0.45, `${effect.color}78`);
        gradient.addColorStop(1, `${effect.color}00`);
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = fade * 0.65;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(effect.point.x, effect.point.y, radius, radius * 0.72, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
    }

    drawElementShadow(ctx, effect, progress, fade, now) {
        const radius = effect.radius * easeOutCubic(progress);
        ctx.save();
        ctx.translate(effect.point.x, effect.point.y);
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = fade * 0.72;
        ctx.strokeStyle = effect.color;
        ctx.shadowColor = effect.core;
        ctx.shadowBlur = 20;
        for (let index = 0; index < 8; index += 1) {
            const angle = index / 8 * TAU - now * 0.00055;
            ctx.lineWidth = 2 + (index % 2);
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * radius * 0.12, Math.sin(angle) * radius * 0.12);
            ctx.quadraticCurveTo(
                Math.cos(angle + 0.7) * radius * 0.66,
                Math.sin(angle + 0.7) * radius * 0.66,
                Math.cos(angle + 0.2) * radius,
                Math.sin(angle + 0.2) * radius
            );
            ctx.stroke();
        }
        ctx.restore();
    }

    drawElementGlimmer(ctx, effect, progress, fade) {
        const radius = effect.radius * easeOutCubic(progress);
        ctx.save();
        ctx.translate(effect.point.x, effect.point.y);
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = fade * 0.88;
        ctx.strokeStyle = effect.core;
        ctx.shadowColor = effect.color;
        ctx.shadowBlur = 22;
        for (let index = 0; index < 12; index += 1) {
            const angle = index / 12 * TAU;
            const inner = radius * (index % 2 ? 0.18 : 0.36);
            ctx.lineWidth = index % 2 ? 1.2 : 2.4;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
            ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
            ctx.stroke();
        }
        ctx.restore();
    }
}
