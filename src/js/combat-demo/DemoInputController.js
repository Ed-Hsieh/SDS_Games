export default class DemoInputController {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.keys = new Set();
        this.actions = new Set();
        this.pointerLocked = false;
        this.pointerX = 0.5;
        this.yawDelta = 0;
        this.edgeTurn = 0;
        this.enabled = true;
        this.disposers = [];
        this.onLockChange = options.onLockChange || (() => {});
        this.bind();
    }

    bind() {
        const keyDown = event => {
            if (!this.enabled) return;
            this.keys.add(event.code);
            if (!event.repeat) this.actions.add(event.code);
            if (['Space', 'KeyF', 'KeyQ', 'KeyR'].includes(event.code)) event.preventDefault();
        };
        const keyUp = event => this.keys.delete(event.code);
        const pointerMove = event => {
            const rect = this.canvas.getBoundingClientRect();
            this.pointerX = rect.width > 0
                ? Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
                : 0.5;
            if (this.pointerLocked) {
                this.yawDelta += (Number(event.movementX) || 0) * 0.0026;
                return;
            }
            if (event.target === this.canvas) {
                this.yawDelta += (Number(event.movementX) || 0) * 0.0015;
            }
        };
        const pointerDown = event => {
            if (!this.enabled || event.target !== this.canvas) return;
            this.canvas.focus({ preventScroll: true });
            if (event.button === 0) {
                if (!this.pointerLocked) {
                    try {
                        const request = this.canvas.requestPointerLock?.();
                        request?.catch?.(() => this.onLockChange(false, true));
                    } catch {
                        this.onLockChange(false, true);
                    }
                }
                this.actions.add('MouseLeft');
            }
            if (event.button === 2) {
                this.actions.add('MouseRightDown');
                this.keys.add('MouseRight');
            }
        };
        const pointerUp = event => {
            if (event.button === 2) {
                this.keys.delete('MouseRight');
                this.actions.add('MouseRightUp');
            }
        };
        const lockChange = () => {
            this.pointerLocked = document.pointerLockElement === this.canvas;
            this.onLockChange(this.pointerLocked, false);
        };
        const contextMenu = event => event.preventDefault();

        window.addEventListener('keydown', keyDown);
        window.addEventListener('keyup', keyUp);
        document.addEventListener('pointermove', pointerMove);
        document.addEventListener('pointerup', pointerUp);
        document.addEventListener('pointerlockchange', lockChange);
        this.canvas.addEventListener('pointerdown', pointerDown);
        this.canvas.addEventListener('contextmenu', contextMenu);

        this.disposers.push(
            () => window.removeEventListener('keydown', keyDown),
            () => window.removeEventListener('keyup', keyUp),
            () => document.removeEventListener('pointermove', pointerMove),
            () => document.removeEventListener('pointerup', pointerUp),
            () => document.removeEventListener('pointerlockchange', lockChange),
            () => this.canvas.removeEventListener('pointerdown', pointerDown),
            () => this.canvas.removeEventListener('contextmenu', contextMenu)
        );
    }

    update(delta) {
        if (!this.pointerLocked) {
            const edge = 0.035;
            if (this.pointerX <= edge) this.edgeTurn = -1;
            else if (this.pointerX >= 1 - edge) this.edgeTurn = 1;
            else this.edgeTurn = 0;
            this.yawDelta += this.edgeTurn * delta * 1.85;
        }
    }

    consume(action) {
        if (!this.actions.has(action)) return false;
        this.actions.delete(action);
        return true;
    }

    consumeYaw() {
        const value = this.yawDelta;
        this.yawDelta = 0;
        return value;
    }

    get moveX() {
        return (this.keys.has('KeyD') ? 1 : 0) - (this.keys.has('KeyA') ? 1 : 0);
    }

    get moveZ() {
        return (this.keys.has('KeyW') ? 1 : 0) - (this.keys.has('KeyS') ? 1 : 0);
    }

    destroy() {
        this.disposers.splice(0).forEach(dispose => dispose());
    }
}
