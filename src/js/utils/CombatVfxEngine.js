const TAU = Math.PI * 2;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (start, end, amount) => start + (end - start) * amount;
const easeOutCubic = value => 1 - Math.pow(1 - value, 3);
const easeInOutCubic = value => value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;

export const CombatElementPalettes = Object.freeze({
    neutral: Object.freeze({ primary: '#cbc8c0', secondary: '#8d8a84', accent: '#f1eee7', smoke: '#6f6d69' }),
    light: Object.freeze({ primary: '#f3ead8', secondary: '#baa879', accent: '#ffffff', smoke: '#77766e' }),
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
        return { x: this.width * 0.515, y: this.height * 0.43 };
    }

    get playerPoint() {
        return { x: this.width * 0.5, y: this.height * 0.79 };
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

    emitInwardMotes(point, options = {}) {
        const count = Math.round((options.count || 20) * this.density);
        const colors = options.colors || [this.palette.primary, this.palette.secondary];
        const minRadius = options.minRadius || 55;
        const maxRadius = options.maxRadius || 125;
        for (let index = 0; index < count; index += 1) {
            const angle = Math.random() * TAU;
            const radius = lerp(minRadius, maxRadius, Math.random());
            const speed = lerp(options.speedMin || 55, options.speedMax || 135, Math.random());
            this.addParticle({
                x: point.x + Math.cos(angle) * radius,
                y: point.y + Math.sin(angle) * radius * 0.78,
                vx: -Math.cos(angle) * speed,
                vy: -Math.sin(angle) * speed * 0.78,
                drag: 0.995,
                life: lerp(options.lifeMin || 0.55, options.lifeMax || 0.95, Math.random()),
                size: lerp(options.sizeMin || 1.8, options.sizeMax || 4.4, Math.random()) * this.intensity,
                endSize: 0.35,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: options.alpha ?? 0.72,
                shape: 'circle',
                glow: options.glow ?? 6,
                blend: options.blend || 'source-over',
                layer: options.layer || 'front'
            });
        }
    }

    swordSlash({ mirrored = false, critical = false } = {}) {
        const point = this.enemyPoint;
        this.addEffect('clean-slash', {
            point,
            angle: mirrored ? -2.48 : -0.66,
            length: Math.min(this.width, this.height) * (critical ? 0.58 : 0.52),
            curve: critical ? 0.09 : 0.07,
            duration: critical ? 250 : 210,
            width: critical ? 12 : 9,
            tapered: true,
            color: critical ? '#e7c56f' : '#d8d4c8',
            core: critical ? '#fff1bd' : '#f6f3ea'
        });
    }

    daggerChain() {
        const point = this.enemyPoint;
        const offsets = [
            { x: -18, y: 8, angle: -0.52, delay: 0 },
            { x: 18, y: 5, angle: -2.62, delay: 58 }
        ];
        offsets.forEach(offset => {
            const hitPoint = { x: point.x + offset.x, y: point.y + offset.y };
            this.addEffect('clean-slash', {
                point: hitPoint,
                angle: offset.angle,
                length: Math.min(this.width, this.height) * 0.2,
                curve: 0.035,
                duration: 165,
                delay: offset.delay,
                width: 6.5,
                tapered: true,
                color: '#c9c7bf',
                core: '#f4f1e8'
            });
        });
    }

    heavyImpact() {
        const point = { x: this.enemyPoint.x, y: this.enemyPoint.y + this.height * 0.045 };
        this.addEffect('hammer-impact', {
            point,
            duration: 360,
            radius: Math.min(this.width, this.height) * 0.075,
            color: '#8f877a',
            core: '#e5dfd4',
            rim: '#c7bca8'
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
            duration: 300,
            width: 9,
            color: '#c9c7bf',
            core: '#f4f1e8'
        });
    }

    focusResonance() {
        const point = this.enemyPoint;
        const usesLightParticles = this.element === 'light';
        this.addEffect('glyph', {
            point,
            duration: 980,
            radius: Math.min(this.width, this.height) * 0.145,
            color: this.palette.primary,
            core: this.palette.accent
        });
        if (usesLightParticles) {
            this.emitMotes(point, {
                count: 14,
                width: 250,
                height: 210,
                speedMin: 25,
                speedMax: 85,
                sizeMin: 2.2,
                sizeMax: 5.2,
                glow: 7,
                colors: [this.palette.primary, this.palette.secondary, this.palette.accent]
            });
        }
        this.schedule(() => {
            this.addEffect('impact-flare', {
                point,
                duration: 520,
                radius: Math.min(this.width, this.height) * 0.22,
                color: this.palette.primary
            });
            if (usesLightParticles) {
                this.emitBurst(point, {
                    count: 18,
                    speedMin: 85,
                    speedMax: 420,
                    gravity: 20,
                    lifeMax: 0.95,
                    sizeMin: 2.2,
                    sizeMax: 6,
                    glow: 7
                });
            } else if (this.element !== 'neutral') {
                this.elementalImpact(point, { scale: 1.45, particleScale: 0.12 });
            }
        }, 560);
    }

    monsterClaw() {
        const center = this.playerPoint;
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
        const point = this.playerPoint;
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
        const start = this.enemyPoint;
        const end = this.playerPoint;
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
        const start = this.enemyPoint;
        const end = this.playerPoint;
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

    monsterBodyImpact() {
        const point = this.playerPoint;
        this.addEffect('impact-flare', { point, duration: 420, radius: 52, color: '#9aa87d', core: '#e4e8c8' });
        this.addEffect('shockwave', { point, duration: 520, maxRadius: 115, color: '#788269', width: 9 });
        return 240;
    }

    monsterSlash() {
        const center = this.playerPoint;
        this.addEffect('claw', { point: center, duration: 500, color: '#d9d4c6', core: '#fff4d8' });
        return 250;
    }

    monsterBite({ poison = false } = {}) {
        const point = this.playerPoint;
        this.addEffect('impact-flare', {
            point,
            duration: 480,
            radius: 62,
            color: poison ? '#6da850' : '#ba5f4f',
            core: poison ? '#d9f2a2' : '#ffd0bd'
        });
        this.emitBurst(point, {
            count: 28,
            speedMin: 75,
            speedMax: 240,
            lifeMax: 0.7,
            colors: poison ? ['#b7dc72', '#557a3d', '#d8e7a0'] : ['#d88a72', '#7d3f39', '#f2c5a7']
        });
        return 260;
    }

    monsterSonic() {
        const point = this.enemyPoint;
        [0, 90, 180].forEach((delay, index) => this.addEffect('shockwave', {
            point,
            delay,
            duration: 760,
            maxRadius: Math.min(this.width, this.height) * (0.22 + index * 0.08),
            color: '#9a8fc7',
            width: 8
        }));
        return 620;
    }

    monsterRoots() {
        const point = this.playerPoint;
        this.addEffect('curse', { point, duration: 1050, radius: 120, color: '#7c6a3d', core: '#b6b276' });
        this.emitMotes(point, { count: 32, width: 220, height: 90, speedMin: 25, speedMax: 85, colors: ['#75613d', '#9b8b57', '#3f5639'] });
        return 650;
    }

    monsterVanish() {
        const point = this.enemyPoint;
        this.addEffect('curse', { point, duration: 900, radius: 105, color: '#6e7180', core: '#bbc0ca' });
        this.emitMotes(point, { count: 48, width: 250, height: 260, speedMin: 35, speedMax: 135, colors: ['#c4c7cd', '#737783', '#30343b'], layer: 'front' });
        return 300;
    }

    monsterNatureWrath() {
        const point = this.playerPoint;
        this.addEffect('vertical-crush', { point, duration: 760, color: '#71864d', core: '#d7dc8c' });
        this.addEffect('shockwave', { point, delay: 210, duration: 760, maxRadius: 210, color: '#6b7745', width: 18 });
        return 520;
    }

    monsterLightning() {
        const start = this.enemyPoint;
        const end = this.playerPoint;
        this.addEffect('projectile', { start, end, duration: 760, color: '#7fbbe7', core: '#f4f5b0' });
        this.schedule(() => this.addEffect('impact-flare', { point: end, duration: 430, radius: 75, color: '#8bc8ef', core: '#fff8bb' }), 570);
        return 590;
    }

    monsterDarkProjectile() {
        const start = this.enemyPoint;
        const end = this.playerPoint;
        this.addEffect('projectile', { start, end, duration: 860, color: '#675087', core: '#c59cda' });
        return 680;
    }

    monsterDrain() {
        const start = this.playerPoint;
        const end = this.enemyPoint;
        this.addEffect('projectile', { start, end, duration: 900, color: '#9a405d', core: '#ef9faf' });
        return 680;
    }

    monsterHarden() {
        const point = this.enemyPoint;
        this.addEffect('shockwave', { point, duration: 760, maxRadius: 135, color: '#98958b', width: 14, layer: 'rear' });
        this.emitBurst(point, { count: 34, speedMin: 45, speedMax: 190, gravity: 360, lifeMax: 0.9, shape: 'shard', colors: ['#b7b1a3', '#706d67', '#d2c7ad'] });
        return 420;
    }

    monsterSummon() {
        const point = this.enemyPoint;
        this.addEffect('curse', { point, duration: 1200, radius: 145, color: '#75688b', core: '#d7ccdb', layer: 'rear' });
        this.emitMotes(point, { count: 58, width: 300, height: 290, speedMin: 45, speedMax: 140, colors: ['#d8d2c8', '#827891', '#51485e'], layer: 'front' });
        return 620;
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

    elementalImpact(point, { scale = 1, particleScale = 1 } = {}) {
        if (this.element === 'neutral') return;
        const particleCount = count => count * scale * particleScale;
        if (this.element === 'fire') {
            this.addEffect('element-fire', {
                point,
                duration: 620,
                radius: 90 * scale,
                color: this.palette.primary,
                core: this.palette.accent
            });
            this.emitBurst(point, {
                count: particleCount(30),
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
                count: particleCount(34),
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
            this.emitBurst(point, {
                count: particleCount(18),
                speedMin: 100,
                speedMax: 320,
                gravity: 35,
                lifeMin: 0.28,
                lifeMax: 0.58,
                shape: 'spark',
                colors: [this.palette.primary, this.palette.accent],
                sizeMin: 1.2,
                sizeMax: 3.2,
                glow: 7
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
                count: particleCount(24),
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
                core: this.palette.accent,
                shade: this.palette.secondary
            });
            this.emitInwardMotes(point, {
                count: particleCount(30),
                minRadius: 55 * scale,
                maxRadius: 125 * scale,
                speedMin: 60,
                speedMax: 145,
                colors: [this.palette.primary, this.palette.secondary],
                glow: 6,
                blend: 'source-over'
            });
        } else if (this.element === 'glimmer') {
            this.addEffect('element-glimmer', {
                point,
                duration: 780,
                radius: 125 * scale,
                color: this.palette.primary,
                core: this.palette.accent
            });
            this.emitMotes(point, {
                count: particleCount(32),
                width: 145 * scale,
                height: 80 * scale,
                speedMin: 55,
                speedMax: 125,
                colors: [this.palette.primary, this.palette.secondary, this.palette.accent],
                shape: 'spark',
                sizeMin: 1.2,
                sizeMax: 3.2,
                glow: 8
            });
        } else if (this.element === 'light') {
            this.addEffect('impact-flare', {
                point,
                duration: 620,
                radius: 105 * scale,
                color: this.palette.primary
            });
            this.emitBurst(point, {
                count: particleCount(32),
                speedMin: 55,
                speedMax: 280,
                gravity: -35,
                colors: [this.palette.primary, this.palette.secondary, this.palette.accent],
                shape: 'spark',
                sizeMax: 4.2,
                glow: 8
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
        if (effect.type === 'clean-slash') this.drawCleanSlash(ctx, effect, progress, fade);
        else if (effect.type === 'hammer-impact') this.drawHammerImpact(ctx, effect, progress, fade);
        else if (effect.type === 'slash') this.drawSlash(ctx, effect, progress, fade);
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

    drawCleanSlash(ctx, effect, progress, fade) {
        const reveal = easeOutCubic(clamp(progress * 1.5, 0, 1));
        const halfLength = effect.length * 0.5;
        const direction = { x: Math.cos(effect.angle), y: Math.sin(effect.angle) };
        const normal = { x: -direction.y, y: direction.x };
        const start = { x: -direction.x * halfLength, y: -direction.y * halfLength };
        const control = {
            x: normal.x * effect.length * effect.curve,
            y: normal.y * effect.length * effect.curve
        };
        const end = { x: direction.x * halfLength, y: direction.y * halfLength };
        const first = {
            x: lerp(start.x, control.x, reveal),
            y: lerp(start.y, control.y, reveal)
        };
        const second = {
            x: lerp(control.x, end.x, reveal),
            y: lerp(control.y, end.y, reveal)
        };
        const tip = {
            x: lerp(first.x, second.x, reveal),
            y: lerp(first.y, second.y, reveal)
        };

        if (effect.tapered) {
            this.drawTaperedSlash(ctx, effect, reveal, fade, start, control, end);
            return;
        }

        ctx.save();
        ctx.translate(effect.point.x, effect.point.y);
        ctx.lineCap = 'round';
        ctx.globalAlpha = fade * 0.72;
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = effect.width * this.intensity;
        ctx.shadowColor = effect.color;
        ctx.shadowBlur = 4 * fade;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.quadraticCurveTo(first.x, first.y, tip.x, tip.y);
        ctx.stroke();

        ctx.globalAlpha = fade * 0.9;
        ctx.strokeStyle = effect.core;
        ctx.lineWidth = Math.max(1, effect.width * 0.28 * this.intensity);
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.quadraticCurveTo(first.x, first.y, tip.x, tip.y);
        ctx.stroke();
        ctx.restore();
    }

    drawHammerImpact(ctx, effect, progress, fade) {
        const scale = lerp(0.72, 1, easeOutCubic(clamp(progress * 2.2, 0, 1)));
        const radius = effect.radius * scale * this.intensity;
        ctx.save();
        ctx.translate(effect.point.x, effect.point.y);
        ctx.globalAlpha = fade * 0.36;
        ctx.fillStyle = effect.color;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, TAU);
        ctx.fill();

        ctx.globalAlpha = fade * 0.95;
        ctx.strokeStyle = effect.rim;
        ctx.lineWidth = 4 * this.intensity;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, TAU);
        ctx.stroke();

        ctx.globalAlpha = fade * 0.72;
        ctx.strokeStyle = effect.core;
        ctx.lineWidth = 2.5 * this.intensity;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.58, 0, TAU);
        ctx.stroke();

        ctx.globalAlpha = fade * 0.8;
        ctx.fillStyle = effect.core;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.15, 0, TAU);
        ctx.fill();
        ctx.restore();
    }

    drawTaperedSlash(ctx, effect, reveal, fade, start, control, end) {
        const steps = 14;
        const outer = [];
        const inner = [];
        const coreOuter = [];
        const coreInner = [];

        for (let index = 0; index <= steps; index += 1) {
            const localT = index / steps;
            const t = reveal * localT;
            const inverse = 1 - t;
            const point = {
                x: inverse * inverse * start.x + 2 * inverse * t * control.x + t * t * end.x,
                y: inverse * inverse * start.y + 2 * inverse * t * control.y + t * t * end.y
            };
            const tangent = {
                x: 2 * inverse * (control.x - start.x) + 2 * t * (end.x - control.x),
                y: 2 * inverse * (control.y - start.y) + 2 * t * (end.y - control.y)
            };
            const magnitude = Math.hypot(tangent.x, tangent.y) || 1;
            const normal = { x: -tangent.y / magnitude, y: tangent.x / magnitude };
            const taper = Math.sin(Math.PI * localT);
            const halfWidth = effect.width * this.intensity * taper * 0.5;
            const coreHalfWidth = Math.max(0.45, halfWidth * 0.28) * taper;

            outer.push({ x: point.x + normal.x * halfWidth, y: point.y + normal.y * halfWidth });
            inner.push({ x: point.x - normal.x * halfWidth, y: point.y - normal.y * halfWidth });
            coreOuter.push({ x: point.x + normal.x * coreHalfWidth, y: point.y + normal.y * coreHalfWidth });
            coreInner.push({ x: point.x - normal.x * coreHalfWidth, y: point.y - normal.y * coreHalfWidth });
        }

        const fillRibbon = (left, right) => {
            ctx.beginPath();
            ctx.moveTo(left[0].x, left[0].y);
            left.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
            right.slice().reverse().forEach(point => ctx.lineTo(point.x, point.y));
            ctx.closePath();
            ctx.fill();
        };

        ctx.save();
        ctx.translate(effect.point.x, effect.point.y);
        ctx.globalAlpha = fade * 0.72;
        ctx.fillStyle = effect.color;
        ctx.shadowColor = effect.color;
        ctx.shadowBlur = 4 * fade;
        fillRibbon(outer, inner);

        ctx.globalAlpha = fade * 0.9;
        ctx.fillStyle = effect.core;
        ctx.shadowBlur = 0;
        fillRibbon(coreOuter, coreInner);
        ctx.restore();
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
        const tailProgress = clamp(travel - 0.2, 0, 1);
        const tail = {
            x: lerp(effect.start.x, effect.end.x, tailProgress),
            y: lerp(effect.start.y, effect.end.y, tailProgress)
        };
        const direction = { x: head.x - tail.x, y: head.y - tail.y };
        const magnitude = Math.hypot(direction.x, direction.y) || 1;
        const normal = { x: -direction.y / magnitude, y: direction.x / magnitude };
        const steps = 10;

        const drawSpearTrace = widthScale => {
            const left = [];
            const right = [];
            for (let index = 0; index <= steps; index += 1) {
                const amount = index / steps;
                const point = {
                    x: lerp(tail.x, head.x, amount),
                    y: lerp(tail.y, head.y, amount)
                };
                const taper = Math.sin(Math.PI * amount);
                const halfWidth = effect.width * this.intensity * widthScale * taper * 0.5;
                left.push({ x: point.x + normal.x * halfWidth, y: point.y + normal.y * halfWidth });
                right.push({ x: point.x - normal.x * halfWidth, y: point.y - normal.y * halfWidth });
            }
            ctx.beginPath();
            ctx.moveTo(left[0].x, left[0].y);
            for (let index = 1; index < left.length; index += 1) ctx.lineTo(left[index].x, left[index].y);
            for (let index = right.length - 1; index >= 0; index -= 1) ctx.lineTo(right[index].x, right[index].y);
            ctx.closePath();
            ctx.fill();
        };

        ctx.save();
        ctx.shadowColor = effect.color;
        ctx.shadowBlur = 4 * fade;
        ctx.globalAlpha = fade * 0.72;
        ctx.fillStyle = effect.color;
        drawSpearTrace(1);

        ctx.shadowBlur = 0;
        ctx.globalAlpha = fade * 0.9;
        ctx.fillStyle = effect.core;
        drawSpearTrace(0.28);
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
        for (let index = 0; index < 5; index += 1) {
            const angle = index * 2 / 5 * TAU - Math.PI / 2;
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
        ctx.translate(effect.point.x, effect.point.y + radius * 0.24);
        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowColor = effect.color;
        ctx.shadowBlur = 8;
        const colors = ['#d94724', effect.color, '#ffd083'];
        for (let index = 0; index < 5; index += 1) {
            const offset = (index - 2) * radius * 0.22;
            const tongueHeight = radius * (0.58 + (index % 3) * 0.18);
            const tongueWidth = radius * (0.16 + (index % 2) * 0.035);
            const sway = Math.sin(index * 1.9 + progress * 3.8) * radius * 0.08;
            ctx.fillStyle = colors[index % colors.length];
            ctx.globalAlpha = fade * (0.36 + (index % 3) * 0.1);
            ctx.beginPath();
            ctx.moveTo(offset - tongueWidth, radius * 0.2);
            ctx.bezierCurveTo(
                offset - tongueWidth * 0.9,
                -tongueHeight * 0.34,
                offset + sway - tongueWidth * 0.24,
                -tongueHeight * 0.7,
                offset + sway,
                -tongueHeight
            );
            ctx.bezierCurveTo(
                offset + sway + tongueWidth * 0.3,
                -tongueHeight * 0.64,
                offset + tongueWidth,
                -tongueHeight * 0.24,
                offset + tongueWidth,
                radius * 0.2
            );
            ctx.closePath();
            ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = fade * 0.7;
        ctx.fillStyle = '#ffe0a0';
        ctx.beginPath();
        ctx.ellipse(0, radius * 0.17, radius * 0.62, radius * 0.12, 0, 0, TAU);
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
        const radius = effect.radius * easeOutCubic(clamp(progress * 1.8, 0, 1));
        const drawBolt = (start, end, segments, phase) => {
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const magnitude = Math.hypot(dx, dy) || 1;
            const normal = { x: -dy / magnitude, y: dx / magnitude };
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            for (let segment = 1; segment <= segments; segment += 1) {
                const amount = segment / segments;
                const edgeFade = Math.sin(Math.PI * amount);
                const jitter = Math.sin(now * 0.025 + phase + segment * 4.3) * radius * 0.075 * edgeFade;
                ctx.lineTo(
                    lerp(start.x, end.x, amount) + normal.x * jitter,
                    lerp(start.y, end.y, amount) + normal.y * jitter
                );
            }
            ctx.stroke();
        };
        const center = effect.point;
        const source = { x: center.x - radius * 0.18, y: center.y - radius * 1.35 };
        const branchEnds = [
            { x: center.x - radius * 0.72, y: center.y + radius * 0.34 },
            { x: center.x + radius * 0.78, y: center.y + radius * 0.26 },
            { x: center.x + radius * 0.14, y: center.y + radius * 0.68 }
        ];

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowColor = effect.color;
        ctx.shadowBlur = 12;
        ctx.globalAlpha = fade * 0.42;
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = 7 * this.intensity;
        drawBolt(source, center, 9, 0);
        branchEnds.forEach((end, index) => drawBolt(center, end, 5, index * 1.7));

        ctx.shadowBlur = 0;
        ctx.globalAlpha = fade;
        ctx.strokeStyle = effect.core;
        ctx.lineWidth = 2.2 * this.intensity;
        drawBolt(source, center, 9, 0);
        branchEnds.forEach((end, index) => drawBolt(center, end, 5, index * 1.7));
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
        const rotation = -now * 0.00032;
        ctx.save();
        ctx.translate(effect.point.x, effect.point.y);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = fade * 0.62;
        ctx.strokeStyle = effect.shade;
        ctx.shadowColor = effect.core;
        ctx.shadowBlur = 8;
        ctx.lineCap = 'round';
        for (let index = 0; index < 6; index += 1) {
            const angle = index / 6 * TAU + rotation;
            const outer = {
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius * 0.78
            };
            const innerAngle = angle + 0.92;
            const inner = {
                x: Math.cos(innerAngle) * radius * 0.13,
                y: Math.sin(innerAngle) * radius * 0.1
            };
            ctx.lineWidth = (5 - index % 2) * this.intensity;
            ctx.beginPath();
            ctx.moveTo(outer.x, outer.y);
            ctx.bezierCurveTo(
                Math.cos(angle + 0.25) * radius * 0.76,
                Math.sin(angle + 0.25) * radius * 0.58,
                Math.cos(angle + 0.72) * radius * 0.38,
                Math.sin(angle + 0.72) * radius * 0.28,
                inner.x,
                inner.y
            );
            ctx.stroke();
        }
        ctx.restore();
    }

    drawElementGlimmer(ctx, effect, progress, fade) {
        const radius = effect.radius * easeOutCubic(progress);
        const glints = [
            { x: -0.34, y: -0.2, size: 0.23, phase: 0 },
            { x: 0.18, y: -0.38, size: 0.3, phase: 0.18 },
            { x: 0.38, y: 0.06, size: 0.18, phase: 0.34 },
            { x: -0.08, y: 0.28, size: 0.16, phase: 0.48 }
        ];
        ctx.save();
        ctx.translate(effect.point.x, effect.point.y);
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = effect.core;
        ctx.shadowColor = effect.color;
        ctx.shadowBlur = 7;
        ctx.lineCap = 'round';
        glints.forEach(glint => {
            const local = clamp((progress - glint.phase) / 0.42, 0, 1);
            const glintFade = Math.sin(local * Math.PI);
            if (glintFade <= 0) return;
            const x = glint.x * radius;
            const y = glint.y * radius;
            const size = glint.size * radius * easeOutCubic(local);
            ctx.globalAlpha = fade * glintFade * 0.88;
            ctx.lineWidth = 1.8 * this.intensity;
            ctx.beginPath();
            ctx.moveTo(x, y - size);
            ctx.lineTo(x, y + size);
            ctx.moveTo(x - size * 0.55, y);
            ctx.lineTo(x + size * 0.55, y);
            ctx.stroke();
        });
        ctx.restore();
    }
}
