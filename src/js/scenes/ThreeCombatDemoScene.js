import * as THREE from '../../vendor/three/three.module.js';
import { GLTFLoader } from '../../vendor/three/addons/loaders/GLTFLoader.js';
import ChapterDemoSession from '../combat-demo/ChapterDemoSession.js';
import {
    getChapterOneDemoRoom,
    isExitAvailable
} from '../combat-demo/ChapterOneDemoRoute.js';
import {
    getDemoMonster,
    getDemoStoryBeats,
    getDemoStoryTitle,
    rollDemoDrops
} from '../combat-demo/DemoDataAdapter.js';
import DemoInputController from '../combat-demo/DemoInputController.js';
import DemoCombatController from '../combat-demo/DemoCombatController.js';
import DemoWorldBuilder from '../combat-demo/DemoWorldBuilder.js';
import DemoHud from '../combat-demo/DemoHud.js';

const FIXED_STEP = 1 / 60;
const MAX_FRAME_DELTA = 0.05;
const PLAYER_MODEL_PATH = 'src/assets/models/combat-demo/player.glb';
const MAP_KIT_PATH = 'src/assets/models/combat-demo/combat-demo-kit.glb';
const PLAYER_MODEL_FORWARD_OFFSET = Math.PI;

const clamp01 = value => Math.max(0, Math.min(1, value));
const smooth = value => {
    const t = clamp01(value);
    return t * t * (3 - 2 * t);
};
const shortestAngle = (target, source) => (
    Math.atan2(Math.sin(target - source), Math.cos(target - source))
);

function fitModelToHeight(model, targetHeight) {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    model.scale.setScalar(targetHeight / Math.max(size.y, 0.001));
    box.setFromObject(model);
    model.position.y -= box.min.y;
}

function setShadow(root, cast = true) {
    root.traverse(object => {
        if (!object.isMesh) return;
        object.castShadow = cast;
        object.receiveShadow = true;
    });
}

export default class ThreeCombatDemoScene {
    constructor(container, router) {
        this.container = container;
        this.router = router;
        this.loader = new GLTFLoader();
        this.clock = new THREE.Clock();
        this.session = new ChapterDemoSession({ capacity: 10 });
        this.room = null;
        this.running = false;
        this.accumulator = 0;
        this.cameraYaw = 0;
        this.cameraYawTarget = 0;
        this.lockedOn = false;
        this.damagePopups = [];
        this.activeLootObject = null;
        this.activeLootDrop = null;
        this.devMode = new URLSearchParams(window.location.search).has('dev');
        this.performance = {
            elapsed: 0,
            frames: 0,
            fps: 60,
            frameMs: 16.7,
            poorSamples: 0
        };
        this.qualityDowngraded = false;

        this.vForward = new THREE.Vector3();
        this.vRight = new THREE.Vector3();
        this.vMove = new THREE.Vector3();
        this.vDesired = new THREE.Vector3();
        this.vTarget = new THREE.Vector3();
        this.vEnemy = new THREE.Vector3();
        this.vPlayer = new THREE.Vector3();
        this.qTemp = new THREE.Quaternion();
        this.qTemp2 = new THREE.Quaternion();
    }

    async init() {
        this.root = this.container.querySelector('[data-combat-demo]');
        this.stage = this.root.querySelector('[data-combat-stage]');
        this.loading = this.root.querySelector('[data-demo-loading]');

        this.createRenderer();
        this.createScene();
        this.world = new DemoWorldBuilder(this.scene);
        this.hud = new DemoHud(this.root, {
            onLootTake: () => this.takeActiveLoot(),
            onCardClosed: () => this.resumeInput(),
            onCompleteExit: () => this.exitToTown()
        });
        this.input = new DemoInputController(this.renderer.domElement, {
            onLockChange: (locked, fallback) => this.hud.setLockState(locked, fallback)
        });
        this.combat = new DemoCombatController({
            onPlayerState: state => this.hud.updatePlayer(state),
            onEnemyState: state => {
                this.enemyState = state;
                this.hud.updateEnemy(state);
                if (this.enemyRoot) this.enemyRoot.visible = state.visible !== false;
            },
            onEnemyWindup: action => this.beginTelegraph(action),
            onEnemyVanish: () => {
                this.lockedOn = false;
                this.telegraph.visible = false;
            },
            onEnemyReappear: () => this.repositionEnemyForAmbush(),
            onAttackStart: (type, combo) => {
                this.faceCameraDirection(true);
                this.showAttackArc(type, combo);
            },
            onEnemyHit: (damage, heavy) => this.onEnemyHit(damage, heavy),
            onEnemyEvade: () => this.hud.showMessage('攻擊落空'),
            onPlayerHit: damage => this.onPlayerHit(damage),
            onPlayerEvade: () => this.hud.showMessage('閃避'),
            onHeal: amount => this.spawnDamagePopup(this.playerRoot.position, `+${amount}`, true),
            onEnemyDefeated: monster => this.onEnemyDefeated(monster),
            onPlayerDefeated: () => this.onPlayerDefeated()
        });

        this.bindUi();

        try {
            const [playerAsset, mapKitAsset] = await Promise.all([
                this.loadGltf(PLAYER_MODEL_PATH),
                this.loadGltf(MAP_KIT_PATH)
            ]);
            this.world.setKit(mapKitAsset.scene);
            this.createPlayer(playerAsset);
            this.createCombatEffects();
            this.loadRoom(this.session.roomId);
            this.loading.classList.add('is-hidden');
            this.running = true;
            this.clock.start();
            this.animate();
        } catch (error) {
            console.error('[ChapterOne3DDemo] Initialization failed.', error);
            this.loading.querySelector('strong').textContent = '3D 冒險切片載入失敗';
            this.loading.querySelector('span').textContent = error?.message || '無法讀取必要模型';
        }
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setPixelRatio(Math.max(1, Math.min(window.devicePixelRatio || 1, 1.2)));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.domElement.tabIndex = 0;
        this.stage.append(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(44, 1, 0.1, 72);
        this.resize();
        this.onResize = () => this.resize();
        window.addEventListener('resize', this.onResize);
    }

    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x151b18);
        this.scene.fog = new THREE.Fog(0x151b18, 18, 32);
        this.scene.add(new THREE.HemisphereLight(0xb8c5bd, 0x221b13, 2.15));

        const sun = new THREE.DirectionalLight(0xffddb0, 2.9);
        sun.position.set(-7, 13, 6);
        sun.castShadow = true;
        sun.shadow.mapSize.set(1024, 1024);
        sun.shadow.camera.left = -13;
        sun.shadow.camera.right = 13;
        sun.shadow.camera.top = 13;
        sun.shadow.camera.bottom = -13;
        sun.shadow.bias = -0.0005;
        this.scene.add(sun);
        this.sun = sun;
    }

    loadGltf(path) {
        return new Promise((resolve, reject) => (
            this.loader.load(path, resolve, undefined, reject)
        ));
    }

    createPlayer(asset) {
        this.playerRoot = new THREE.Group();
        this.playerRoot.name = 'DemoPlayer';
        this.playerModel = asset.scene;
        fitModelToHeight(this.playerModel, 2.05);
        setShadow(this.playerModel, true);
        this.playerRoot.add(this.playerModel);
        this.scene.add(this.playerRoot);

        const bones = [];
        this.playerModel.traverse(object => {
            if (object.isBone) bones.push(object);
        });
        const boneByName = new Map(bones.map(bone => [
            bone.name.replace(/_/g, '.').replace(/^Bone(\d{3})$/, 'Bone.$1'),
            bone
        ]));
        this.playerBones = Object.fromEntries(
            [
                'Bone',
                'Bone.002',
                'Bone.004',
                'Bone.005',
                'Bone.006',
                'Bone.007',
                'Bone.008',
                'Bone.009'
            ]
                .map(name => [name, boneByName.get(name)])
                .filter(([, bone]) => bone)
        );
        this.rightHandBone = this.playerBones['Bone.007'];

        this.sword = new THREE.Group();
        const steel = new THREE.MeshStandardMaterial({
            color: 0x98a09e,
            metalness: 0.72,
            roughness: 0.34
        });
        const leather = new THREE.MeshStandardMaterial({ color: 0x3c2115, roughness: 0.86 });
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.045, 1.46), steel);
        blade.position.z = 0.73;
        const guard = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.1, 0.1), steel);
        const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.48, 8), leather);
        grip.rotation.x = Math.PI / 2;
        grip.position.z = -0.3;
        this.sword.add(blade, guard, grip);
        setShadow(this.sword, true);
        this.playerRoot.add(this.sword);

        this.playerFacing = new THREE.Vector3(0, 0, -1);
        this.dodgeDirection = new THREE.Vector3(0, 0, -1);
        this.applyPlayerPose(0);
        this.updateSword();
    }

    createCombatEffects() {
        this.telegraph = new THREE.Mesh(
            new THREE.RingGeometry(1.2, 1.38, 32),
            new THREE.MeshBasicMaterial({
                color: 0xd65f4e,
                transparent: true,
                opacity: 0.7,
                depthWrite: false,
                side: THREE.DoubleSide
            })
        );
        this.telegraph.rotation.x = -Math.PI / 2;
        this.telegraph.position.y = 0.06;
        this.telegraph.visible = false;
        this.scene.add(this.telegraph);

        this.attackArc = new THREE.Mesh(
            new THREE.TorusGeometry(1.5, 0.045, 6, 28, Math.PI * 0.82),
            new THREE.MeshBasicMaterial({
                color: 0xd8d2bb,
                transparent: true,
                opacity: 0,
                depthWrite: false
            })
        );
        this.attackArc.rotation.x = -Math.PI / 2;
        this.attackArc.visible = false;
        this.attackArcLife = 0;
        this.scene.add(this.attackArc);
    }

    bindUi() {
        this.root.querySelector('[data-demo-reset]').addEventListener('click', () => {
            this.session.reset();
            this.combat.resetPlayer();
            this.loadRoom(this.session.roomId);
        });
        this.root.querySelector('[data-demo-exit]').addEventListener('click', () => this.exitToTown());
    }

    loadRoom(roomId, options = {}) {
        const room = getChapterOneDemoRoom(roomId);
        if (!room) throw new Error(`Unknown Chapter 1 demo room: ${roomId}`);

        this.room = room;
        this.session.roomId = room.id;
        this.clearEnemy();
        this.world.build(room, this.session);
        this.hud.setRoom(room.name);
        this.hud.updateEvidence(this.session);
        this.hud.updateInventory(this.session);
        this.hud.hideInteraction();
        this.telegraph.visible = false;
        this.lockedOn = false;

        this.playerRoot.position.set(room.spawn.x, 0, room.spawn.z);
        this.cameraYaw = room.spawn.yaw || 0;
        this.cameraYawTarget = this.cameraYaw;
        this.playerFacing.set(Math.sin(this.cameraYaw), 0, -Math.cos(this.cameraYaw));
        this.playerRoot.rotation.y = Math.atan2(this.playerFacing.x, this.playerFacing.z);

        if (room.checkpoint && options.activateCheckpoint !== false) {
            this.session.setCheckpoint(room.id);
            this.combat.rest();
            this.hud.showMessage('營火已點亮');
        }

        if (room.monsterId && !this.session.isRoomDefeated(room.id)) {
            const monster = getDemoMonster(room.monsterId, this.combat.playerDefense);
            this.combat.setEnemy(monster);
            this.createEnemyVisual(monster.id);
            this.enemyRoot.position.set(room.enemySpawn.x, 0, room.enemySpawn.z);
            this.enemyRoot.rotation.y = Math.PI;
        } else {
            this.combat.clearEnemy();
            this.enemyState = null;
            this.hud.updateEnemy(null);
        }
        this.session.getRoomLoot(room.id).forEach((drop, index, drops) => {
            this.world.createLoot(drop, room.enemySpawn || room.spawn, index - (drops.length - 1) / 2);
        });
        this.updateCamera(1);
    }

    createEnemyVisual(monsterId) {
        this.clearEnemy();
        const root = new THREE.Group();
        root.name = `DemoEnemy:${monsterId}`;
        const dark = new THREE.MeshStandardMaterial({ color: 0x2f2925, roughness: 0.92 });
        const hide = new THREE.MeshStandardMaterial({ color: 0x5b3d2e, roughness: 0.86 });
        const poison = new THREE.MeshStandardMaterial({
            color: 0x293a25,
            emissive: 0x11220d,
            roughness: 0.82
        });
        const bone = new THREE.MeshStandardMaterial({ color: 0xaaa082, roughness: 0.72 });
        const eye = new THREE.MeshStandardMaterial({
            color: 0xff6b34,
            emissive: 0x6a1608,
            roughness: 0.3
        });
        const add = (geometry, mat, position, rotation = null, scale = null) => {
            const object = new THREE.Mesh(geometry, mat);
            object.position.set(...position);
            if (rotation) object.rotation.set(...rotation);
            if (scale) object.scale.set(...scale);
            object.castShadow = true;
            object.receiveShadow = true;
            root.add(object);
            return object;
        };

        if (monsterId === 'wild_wolf') {
            add(new THREE.CapsuleGeometry(0.42, 1.05, 4, 8), hide, [0, 0.95, 0], [Math.PI / 2, 0, 0]);
            add(new THREE.BoxGeometry(0.62, 0.52, 0.72), dark, [0, 1.08, -0.82]);
            for (const x of [-0.27, 0.27]) {
                for (const z of [-0.45, 0.45]) {
                    add(new THREE.CylinderGeometry(0.09, 0.075, 0.82, 7), dark, [x, 0.43, z]);
                }
            }
            add(new THREE.ConeGeometry(0.12, 0.42, 5), bone, [-0.2, 1.48, -0.9], [0.2, 0, -0.12]);
            add(new THREE.ConeGeometry(0.12, 0.42, 5), bone, [0.2, 1.48, -0.9], [0.2, 0, 0.12]);
        } else if (monsterId === 'poison_spider') {
            add(new THREE.SphereGeometry(0.68, 10, 8), poison, [0, 0.68, 0.15], null, [1, 0.72, 1.25]);
            add(new THREE.SphereGeometry(0.43, 10, 8), dark, [0, 0.65, -0.65]);
            for (const side of [-1, 1]) {
                for (let i = 0; i < 4; i += 1) {
                    const z = -0.55 + i * 0.38;
                    add(
                        new THREE.CylinderGeometry(0.055, 0.075, 1.5, 6),
                        dark,
                        [side * 0.75, 0.52, z],
                        [0.15, 0, side * (0.65 + i * 0.06)]
                    );
                }
            }
        } else {
            add(new THREE.CapsuleGeometry(0.35, 1.25, 4, 8), poison, [0, 1.15, 0]);
            add(new THREE.SphereGeometry(0.38, 10, 8), dark, [0, 2.05, -0.08]);
            add(new THREE.SphereGeometry(0.055, 7, 6), eye, [-0.14, 2.12, -0.34]);
            add(new THREE.SphereGeometry(0.055, 7, 6), eye, [0.14, 2.12, -0.34]);
            for (const side of [-1, 1]) {
                add(
                    new THREE.CapsuleGeometry(0.1, 0.95, 4, 7),
                    hide,
                    [side * 0.52, 1.35, -0.28],
                    [0, 0, side * 0.72]
                );
                add(
                    new THREE.ConeGeometry(0.18, 1.25, 6),
                    bone,
                    [side * 0.9, 1.08, -0.55],
                    [0.35, 0, side * 0.45]
                );
                for (const z of [-0.35, 0.38]) {
                    add(
                        new THREE.CylinderGeometry(0.07, 0.09, 1.15, 6),
                        dark,
                        [side * 0.44, 0.54, z],
                        [0.1, 0, side * 0.38]
                    );
                }
            }
        }

        this.enemyRoot = root;
        this.scene.add(root);
    }

    clearEnemy() {
        if (!this.enemyRoot) return;
        this.enemyRoot.traverse(object => {
            if (!object.isMesh) return;
            object.geometry.dispose();
            object.material.dispose();
        });
        this.enemyRoot.removeFromParent();
        this.enemyRoot = null;
    }

    fixedUpdate(delta) {
        if (!this.playerRoot || this.hud.isModalOpen()) return;
        this.input.update(delta);
        this.cameraYawTarget += this.input.consumeYaw();

        if (this.input.consume('KeyQ') && this.enemyRoot && this.enemyState?.health > 0) {
            this.lockedOn = !this.lockedOn;
            this.hud.showMessage(this.lockedOn ? '鎖定目標' : '解除鎖定', 0.8);
        }
        if (this.input.consume('MouseLeft')) {
            this.faceCameraDirection(true);
            this.combat.tryLightAttack();
        }
        if (this.input.consume('MouseRightDown')) {
            this.faceCameraDirection(true);
            this.combat.beginHeavyCharge();
        }
        if (this.input.consume('MouseRightUp')) this.combat.releaseHeavy();
        if (this.input.consume('Space')) {
            const hasMoveInput = Math.abs(this.input.moveX) + Math.abs(this.input.moveZ) > 0;
            if (!hasMoveInput) this.faceCameraDirection(true);
            if (this.combat.tryDodge()) this.dodgeDirection.copy(this.getMoveDirection());
        }
        if (this.input.consume('KeyR')) this.combat.tryPotion();
        if (this.input.consume('KeyF')) this.interact();

        this.updatePlayerMovement(delta);
        this.updateEnemyMovement(delta);

        const enemyDistance = this.enemyRoot
            ? this.playerRoot.position.distanceTo(this.enemyRoot.position)
            : Infinity;
        this.combat.updatePlayer(delta, enemyDistance);
        this.combat.updateEnemy(delta, enemyDistance);
        this.updatePlayerVisual();
        this.updateEnemyVisual();
        this.updateNearbyInteraction();
    }

    getMoveDirection() {
        this.vForward.set(Math.sin(this.cameraYaw), 0, -Math.cos(this.cameraYaw));
        this.vRight.set(-this.vForward.z, 0, this.vForward.x);
        this.vMove.copy(this.vForward)
            .multiplyScalar(this.input.moveZ)
            .addScaledVector(this.vRight, this.input.moveX);
        if (this.vMove.lengthSq() > 0.001) this.vMove.normalize();
        else this.vMove.copy(this.playerFacing);
        return this.vMove;
    }

    faceCameraDirection(snap = false) {
        if (!this.playerRoot || this.lockedOn) return;
        this.playerFacing.set(Math.sin(this.cameraYaw), 0, -Math.cos(this.cameraYaw));
        if (!snap) return;
        this.playerRoot.rotation.y = Math.atan2(this.playerFacing.x, this.playerFacing.z);
    }

    updatePlayerMovement(delta) {
        const state = this.combat.player.state;
        const move = this.getMoveDirection();
        const hasMoveInput = Math.abs(this.input.moveX) + Math.abs(this.input.moveZ) > 0;
        if (state === 'dodge') move.copy(this.dodgeDirection);
        const speed = this.combat.getMoveSpeed();
        if (speed > 0 && (state === 'dodge' || hasMoveInput)) {
            this.vDesired.copy(this.playerRoot.position).addScaledVector(move, speed * delta);
            if (this.world.canMove(this.vDesired)) this.playerRoot.position.copy(this.vDesired);
        }

        if (this.lockedOn && this.enemyRoot && this.enemyState?.health > 0) {
            this.vEnemy.copy(this.enemyRoot.position).sub(this.playerRoot.position).setY(0).normalize();
            this.playerFacing.copy(this.vEnemy);
            const targetYaw = Math.atan2(this.vEnemy.x, -this.vEnemy.z);
            this.cameraYawTarget += shortestAngle(targetYaw, this.cameraYawTarget) * 0.08;
        } else if (hasMoveInput) {
            this.playerFacing.copy(move);
        } else if (state === 'free' || state === 'heavy-charge') {
            this.faceCameraDirection();
        }
        const desiredRotation = Math.atan2(this.playerFacing.x, this.playerFacing.z);
        this.playerRoot.rotation.y += shortestAngle(desiredRotation, this.playerRoot.rotation.y) * 0.22;
    }

    updateEnemyMovement(delta) {
        if (!this.enemyRoot || !this.enemyState || this.enemyState.health <= 0) return;
        this.vPlayer.copy(this.playerRoot.position).sub(this.enemyRoot.position).setY(0);
        const distance = this.vPlayer.length();
        if (distance > 0.001) this.vPlayer.multiplyScalar(1 / distance);
        const desiredRotation = Math.atan2(this.vPlayer.x, this.vPlayer.z);
        this.enemyRoot.rotation.y += shortestAngle(desiredRotation, this.enemyRoot.rotation.y) * 0.16;

        let speed = 0;
        if (this.enemyState.state === 'chase' && distance > 1.9) {
            speed = Number(this.enemyState.data.speed) || (Number(this.enemyState.data.attackSpeed) || 1) * 2;
        } else if (this.enemyState.state === 'active') {
            speed = 5.8;
        }
        if (speed > 0) {
            this.vDesired.copy(this.enemyRoot.position).addScaledVector(this.vPlayer, speed * delta);
            if (this.world.canMove(this.vDesired, 0.55)) this.enemyRoot.position.copy(this.vDesired);
        }
    }

    updatePlayerVisual() {
        const player = this.combat.player;
        let progress = 0;
        if (player.state === 'attack') {
            const durations = [0.56, 0.6, 0.72];
            progress = player.timer / durations[player.comboIndex];
        } else if (player.state === 'heavy-charge') {
            progress = -clamp01(player.timer / 1.15);
        } else if (player.state === 'heavy') {
            progress = 1 + clamp01(player.timer / 0.86);
        } else if (player.state === 'dodge') {
            this.playerRoot.rotation.z = Math.sin(clamp01(player.timer / 0.46) * Math.PI) * -0.24;
        } else {
            this.playerRoot.rotation.z *= 0.7;
        }
        this.applyPlayerPose(progress);
        this.updateSword();
    }

    applyPlayerPose(progress) {
        const attacking = progress !== 0;
        const phase = Math.abs(progress);
        const swing = progress < 0
            ? -0.7 * smooth(phase)
            : progress > 1
                ? -0.7 + 1.9 * smooth(progress - 1)
                : -0.55 + 1.5 * smooth(phase);
        this.playerModel.rotation.y = PLAYER_MODEL_FORWARD_OFFSET
            + (attacking ? swing * 0.38 : 0);
        this.playerModel.rotation.x = progress < 0 ? -0.08 * phase : 0;

        const rightUpper = this.playerBones['Bone.005'];
        const rightForearm = this.playerBones['Bone.006'];
        const rightHand = this.playerBones['Bone.007'];
        const leftUpper = this.playerBones['Bone.004'];
        const leftForearm = this.playerBones['Bone.008'];
        const leftHand = this.playerBones['Bone.009'];
        leftUpper?.rotation.set(0.05, -0.12, Math.PI - 0.12);
        leftForearm?.rotation.set(0.08, 0, 0.08);
        leftHand?.rotation.set(0, 0, 0);
        if (rightUpper) {
            const attackLift = attacking ? 0.88 + swing * 0.48 : 0;
            rightUpper.rotation.set(
                attacking ? -0.55 + swing * 0.3 : 0.05,
                attacking ? 0.35 : 0.12,
                -Math.PI + 0.16 + attackLift
            );
            rightForearm?.rotation.set(
                attacking ? -0.45 : 0.08,
                attacking ? 0.18 : 0,
                attacking ? 0.5 : -0.08
            );
            rightHand?.rotation.set(
                attacking ? -0.22 : 0,
                0,
                attacking ? -0.28 : 0
            );
        }
    }

    updateSword() {
        if (!this.rightHandBone) {
            this.sword.position.set(0.65, 1.1, -0.35);
            this.sword.rotation.x = -0.5;
            return;
        }
        this.playerRoot.updateMatrixWorld(true);
        this.rightHandBone.updateMatrixWorld(true);
        this.rightHandBone.getWorldPosition(this.vDesired);
        this.vForward.set(0, 1, 0).transformDirection(this.rightHandBone.matrixWorld).normalize();
        this.qTemp.setFromUnitVectors(this.vTarget.set(0, 0, 1), this.vForward);
        this.playerRoot.getWorldQuaternion(this.qTemp2);
        this.sword.quaternion.copy(this.qTemp2.invert().multiply(this.qTemp));
        this.vDesired.addScaledVector(this.vForward, 0.23);
        this.playerRoot.worldToLocal(this.vDesired);
        this.sword.position.copy(this.vDesired);
    }

    updateEnemyVisual() {
        if (!this.enemyRoot || !this.enemyState) return;
        const state = this.enemyState.state;
        if (state === 'windup') {
            const duration = Math.max(0.1, this.enemyState.action?.telegraph || 1);
            const progress = clamp01(this.enemyState.timer / duration);
            this.enemyRoot.scale.set(1 + progress * 0.1, 1 - progress * 0.12, 1 + progress * 0.1);
            this.telegraph.position.x = this.enemyRoot.position.x;
            this.telegraph.position.z = this.enemyRoot.position.z;
            this.telegraph.scale.setScalar(0.85 + progress * 0.15);
            this.telegraph.material.opacity = 0.25 + progress * 0.55;
        } else if (state === 'active') {
            this.enemyRoot.rotation.x = -0.2;
        } else {
            this.enemyRoot.scale.lerp(this.vDesired.set(1, 1, 1), 0.18);
            this.enemyRoot.rotation.x *= 0.75;
            if (state !== 'windup') this.telegraph.visible = false;
        }
    }

    beginTelegraph() {
        if (!this.enemyRoot) return;
        this.telegraph.visible = true;
        this.telegraph.position.set(this.enemyRoot.position.x, 0.06, this.enemyRoot.position.z);
    }

    showAttackArc(type, combo) {
        const heavy = type === 'heavy';
        this.attackArcLife = heavy ? 0.42 : 0.24;
        this.attackArcMaxLife = this.attackArcLife;
        this.attackArc.visible = true;
        this.attackArc.scale.setScalar(heavy ? 1.25 : 0.92 + combo * 0.08);
        this.attackArc.rotation.z = -0.42 + combo * 0.14;
        this.attackArc.material.color.setHex(heavy ? 0xe2bd71 : 0xd8d2bb);
    }

    updateAttackArc(delta) {
        if (this.attackArcLife <= 0 || !this.attackArc) return;
        this.attackArcLife = Math.max(0, this.attackArcLife - delta);
        this.attackArc.position.copy(this.playerRoot.position);
        this.attackArc.position.y = 0.2;
        this.attackArc.rotation.y = this.playerRoot.rotation.y;
        this.attackArc.material.opacity = 0.58 * (this.attackArcLife / this.attackArcMaxLife);
        if (this.attackArcLife <= 0) this.attackArc.visible = false;
    }

    repositionEnemyForAmbush() {
        if (!this.enemyRoot) return;
        const angle = this.cameraYaw + Math.PI + (Math.random() - 0.5) * 1.2;
        this.enemyRoot.position.set(
            this.playerRoot.position.x + Math.sin(angle) * 3.2,
            0,
            this.playerRoot.position.z - Math.cos(angle) * 3.2
        );
    }

    onEnemyHit(damage, heavy) {
        if (!this.enemyRoot) return;
        this.spawnDamagePopup(this.enemyRoot.position, `-${damage}`);
        this.enemyRoot.scale.set(heavy ? 1.22 : 1.12, heavy ? 0.78 : 0.9, heavy ? 1.22 : 1.12);
        this.cameraShake = heavy ? 0.2 : 0.1;
    }

    onPlayerHit(damage) {
        this.spawnDamagePopup(this.playerRoot.position, `-${damage}`);
        this.cameraShake = 0.16;
    }

    onEnemyDefeated(monster) {
        this.telegraph.visible = false;
        this.lockedOn = false;
        this.session.markRoomDefeated(this.room.id);
        if (this.room.boss) {
            this.session.writeFlag('demo.boss.defeated', true);
            if (this.room.interaction && !this.session.completed) {
                this.world.createInteraction(this.room.interaction);
            }
        }
        const drops = rollDemoDrops(monster);
        this.session.setRoomLoot(this.room.id, drops);
        drops.forEach((drop, index) => (
            this.world.createLoot(drop, this.enemyRoot.position, index - (drops.length - 1) / 2)
        ));
        this.hud.showMessage(drops.length ? '戰利品落在地面' : '敵人已倒下');
    }

    onPlayerDefeated() {
        this.lockedOn = false;
        this.hud.showMessage('你倒下了', 1.2);
        clearTimeout(this.respawnTimer);
        this.respawnTimer = setTimeout(() => this.respawnAtCampfire(), 1250);
    }

    respawnAtCampfire() {
        this.session.clearCombatResets();
        this.combat.rest();
        this.loadRoom(this.session.checkpointId, { activateCheckpoint: false });
        this.hud.showMessage('你在營火旁醒來');
    }

    updateNearbyInteraction() {
        const target = this.world.nearestInteractable(this.playerRoot.position, 2.05);
        this.nearbyInteractable = target;
        if (!target) {
            this.hud.hideInteraction();
            return;
        }
        const data = target.userData;
        if (data.kind === 'loot') {
            this.hud.showInteraction(`拾取 ${data.drop.item.name}`);
        } else if (data.kind === 'evidence') {
            const blocked = this.room.monsterId
                && !this.session.isRoomDefeated(this.room.id)
                && !data.config.afterBoss;
            this.hud.showInteraction(blocked ? '附近仍有威脅' : data.config.label);
        } else if (data.kind === 'portal') {
            const available = isExitAvailable(data.exit, this.session);
            this.hud.showInteraction(available ? data.exit.label : '道路尚未釐清');
        }
    }

    interact() {
        const target = this.nearbyInteractable;
        if (!target) return;
        const data = target.userData;
        if (data.kind === 'loot') {
            this.activeLootObject = target;
            this.activeLootDrop = data.drop;
            this.pauseInput();
            this.hud.showLoot(data.drop);
            return;
        }
        if (data.kind === 'evidence') {
            const blocked = this.room.monsterId && !this.session.isRoomDefeated(this.room.id);
            if (blocked && !data.config.afterBoss) {
                this.hud.showMessage('先處理附近的威脅');
                return;
            }
            this.recordEvidence(target, data.config);
            return;
        }
        if (data.kind === 'portal') this.useExit(data.exit);
    }

    recordEvidence(target, config) {
        const checkpointId = config.id === 'ambush_mantis_recovery' ? null : config.id;
        const sceneId = config.id === 'ambush_mantis_recovery'
            ? 'ch1_s07_silver_snare'
            : this.room.sceneId;
        const beats = getDemoStoryBeats(sceneId, checkpointId);
        const title = getDemoStoryTitle(sceneId, checkpointId);
        if (config.id === 'ambush_mantis_recovery') {
            this.session.completed = true;
        } else {
            this.session.recordEvidence(config.id);
        }
        this.world.removeInteractable(target);
        this.hud.updateEvidence(this.session);
        this.pauseInput();
        this.hud.showStory(title, beats);
    }

    useExit(exit) {
        if (!isExitAvailable(exit, this.session)) {
            this.hud.showMessage('還缺少能確認道路的紀錄');
            return;
        }
        if (exit.opensShortcut) {
            this.session.shortcutOpen = true;
            this.hud.showMessage('回南門的木門已打開');
        }
        if (exit.target === 'town_return') {
            if (!this.session.completed) {
                this.hud.showMessage('先查看伏獵者留下的銀線');
                return;
            }
            this.pauseInput();
            this.hud.showComplete(getDemoStoryBeats('ch1_s08_cold_forge_smoke'));
            return;
        }
        this.loadRoom(exit.target);
    }

    takeActiveLoot() {
        if (!this.activeLootDrop || !this.activeLootObject) return;
        const result = this.session.addItem(this.activeLootDrop.item, this.activeLootDrop.quantity);
        if (!result.ok) {
            this.hud.showMessage('行囊已滿，物品留在原地');
            return;
        }
        this.world.removeInteractable(this.activeLootObject);
        this.session.removeRoomLoot(this.room.id, this.activeLootDrop.id);
        this.activeLootObject = null;
        this.activeLootDrop = null;
        this.hud.hideLoot();
        this.hud.updateInventory(this.session);
        this.resumeInput();
    }

    pauseInput() {
        this.input.enabled = false;
    }

    resumeInput() {
        this.input.enabled = true;
    }

    spawnDamagePopup(position, text, healing = false) {
        let popup = this.damagePopups.find(entry => entry.life <= 0);
        if (!popup) {
            const node = document.createElement('strong');
            node.className = 'combat-demo-damage';
            this.root.append(node);
            popup = { node, position: new THREE.Vector3(), life: 0 };
            this.damagePopups.push(popup);
        }
        popup.node.textContent = text;
        popup.node.style.color = healing ? '#83d6a5' : '';
        popup.node.hidden = false;
        popup.position.copy(position).add(this.vTarget.set(0, 1.8, 0));
        popup.life = 0.72;
    }

    updateDamagePopups(delta) {
        for (const popup of this.damagePopups) {
            if (popup.life <= 0) continue;
            popup.life -= delta;
            popup.position.y += delta * 0.75;
            this.vDesired.copy(popup.position).project(this.camera);
            popup.node.style.left = `${(this.vDesired.x * 0.5 + 0.5) * this.stage.clientWidth}px`;
            popup.node.style.top = `${(-this.vDesired.y * 0.5 + 0.5) * this.stage.clientHeight}px`;
            popup.node.style.opacity = String(clamp01(popup.life / 0.72));
            if (popup.life <= 0) popup.node.hidden = true;
        }
    }

    updateCamera(delta) {
        this.cameraYaw += shortestAngle(this.cameraYawTarget, this.cameraYaw)
            * (1 - Math.pow(0.002, delta));
        this.vForward.set(Math.sin(this.cameraYaw), 0, -Math.cos(this.cameraYaw));
        this.vRight.set(-this.vForward.z, 0, this.vForward.x);
        this.vTarget.copy(this.playerRoot.position).setY(1.15).addScaledVector(this.vForward, 1.1);
        this.vDesired.copy(this.playerRoot.position)
            .addScaledVector(this.vForward, -7.4)
            .addScaledVector(this.vRight, 0.65);
        this.vDesired.y += 5.6;
        if (this.cameraShake > 0) {
            this.vDesired.x += (Math.random() - 0.5) * this.cameraShake;
            this.vDesired.y += (Math.random() - 0.5) * this.cameraShake * 0.4;
            this.cameraShake = Math.max(0, this.cameraShake - delta * 2.5);
        }
        this.camera.position.lerp(this.vDesired, 1 - Math.pow(0.0015, delta));
        this.camera.lookAt(this.vTarget);
    }

    updatePerformance(delta) {
        const perf = this.performance;
        perf.elapsed += delta;
        perf.frames += 1;
        if (perf.elapsed < 0.5) return;
        perf.fps = perf.frames / perf.elapsed;
        perf.frameMs = 1000 / Math.max(perf.fps, 1);
        perf.poorSamples = perf.fps < 45 ? perf.poorSamples + 1 : 0;
        if (!this.qualityDowngraded && perf.poorSamples >= 3) {
            this.qualityDowngraded = true;
            this.renderer.setPixelRatio(1);
            this.renderer.shadowMap.enabled = false;
            this.sun.castShadow = false;
            this.resize();
            this.hud.showMessage('已切換效能優先模式', 1.2);
        }
        perf.elapsed = 0;
        perf.frames = 0;
        this.hud.updatePerformance({
            ...perf,
            calls: this.renderer.info.render.calls,
            triangles: this.renderer.info.render.triangles
        }, this.devMode);
    }

    animate = () => {
        if (!this.running) return;
        this.animationFrame = requestAnimationFrame(this.animate);
        const delta = Math.min(this.clock.getDelta(), MAX_FRAME_DELTA);
        this.accumulator = Math.min(this.accumulator + delta, FIXED_STEP * 3);
        while (this.accumulator >= FIXED_STEP) {
            this.fixedUpdate(FIXED_STEP);
            this.accumulator -= FIXED_STEP;
        }
        this.world.update(this.clock.elapsedTime);
        this.updateAttackArc(delta);
        this.updateCamera(delta);
        this.updateDamagePopups(delta);
        this.updatePerformance(delta);
        this.renderer.render(this.scene, this.camera);
    };

    resize() {
        if (!this.renderer || !this.camera || !this.stage) return;
        const width = Math.max(1, this.stage.clientWidth);
        const height = Math.max(1, this.stage.clientHeight);
        this.renderer.setSize(width, height, false);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    exitToTown() {
        window.location.hash = '#lobby';
    }

    destroy() {
        this.running = false;
        cancelAnimationFrame(this.animationFrame);
        clearTimeout(this.respawnTimer);
        window.removeEventListener('resize', this.onResize);
        if (document.pointerLockElement === this.renderer?.domElement) document.exitPointerLock?.();
        this.input?.destroy();
        this.hud?.destroy();
        this.world?.destroy();
        this.clearEnemy();
        this.playerRoot?.removeFromParent();
        this.telegraph?.removeFromParent();
        this.attackArc?.geometry?.dispose();
        this.attackArc?.material?.dispose();
        this.attackArc?.removeFromParent();
        this.renderer?.dispose();
        this.renderer?.domElement?.remove();
        this.damagePopups.forEach(popup => popup.node.remove());
        this.damagePopups = [];
        this.session.reset();
    }
}
