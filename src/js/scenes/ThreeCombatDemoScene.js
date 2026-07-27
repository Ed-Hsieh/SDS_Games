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
import {
    DemoWeaponForms,
    getDemoWeaponProfile,
    intersectsDemoHitbox
} from '../combat-demo/DemoWeaponActions.js';

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
const easeOut = value => 1 - Math.pow(1 - clamp01(value), 3);
const pulse = (value, start, peak, end) => {
    if (value <= start || value >= end) return 0;
    if (value < peak) return smooth((value - start) / Math.max(0.001, peak - start));
    return 1 - smooth((value - peak) / Math.max(0.001, end - peak));
};
const kineticChannel = (progress, attack, delay = 0, inertia = 0.2) => {
    if (progress < 0) return -smooth(Math.abs(progress));
    const impact = (attack.activeStart + attack.activeEnd) * 0.5;
    const strikeStart = Math.max(0.02, attack.activeStart + delay);
    const followEnd = Math.min(0.94, attack.activeEnd + inertia);
    if (progress < strikeStart) {
        return -smooth(progress / strikeStart);
    }
    if (progress < impact) {
        return -1 + easeOut(
            (progress - strikeStart) / Math.max(0.01, impact - strikeStart)
        ) * 2;
    }
    if (progress < followEnd) {
        return 1 + Math.sin(
            ((progress - impact) / Math.max(0.01, followEnd - impact)) * Math.PI / 2
        ) * inertia;
    }
    return (1 + inertia) * (
        1 - smooth((progress - followEnd) / Math.max(0.01, 1 - followEnd))
    );
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
        this.locomotionTime = 0;
        this.locomotionBlend = 0;
        this.hitStopRemaining = 0;
        this.weaponForm = 'sword';
        this.activeAttack = null;
        this.attackWindowActive = false;
        this.playerHitReaction = 0;
        this.playerHitSide = 1;
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
        this.vAimPoint = new THREE.Vector3();
        this.vAimDirection = new THREE.Vector3();
        this.qTemp = new THREE.Quaternion();
        this.qTemp2 = new THREE.Quaternion();
        this.aimRaycaster = new THREE.Raycaster();
        this.aimGroundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
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
            onAttackStart: (type, combo, attack, profile) => {
                this.facePointerDirection(true);
                this.activeAttack = { type, combo, attack, profile };
                this.showAttackArc(type, combo, attack, profile);
            },
            resolvePlayerHit: (attack, progress) => this.resolvePlayerHit(attack, progress),
            onEnemyHit: (damage, heavy, attack) => this.onEnemyHit(damage, heavy, attack),
            onEnemyEvade: () => this.hud.showMessage('攻擊落空'),
            onPlayerHit: (damage, action) => this.onPlayerHit(damage, action),
            onPlayerEvade: () => this.hud.showMessage('閃避'),
            onHeal: amount => this.spawnDamagePopup(this.playerRoot.position, `+${amount}`, true),
            onEnemyDefeated: monster => this.onEnemyDefeated(monster),
            onPlayerDefeated: () => this.onPlayerDefeated(),
            onWeaponChanged: profile => this.onWeaponChanged(profile)
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
        this.playerModelBaseY = this.playerModel.position.y;
        setShadow(this.playerModel, true);
        this.playerMaterials = [];
        this.playerModel.traverse(object => {
            if (!object.isMesh) return;
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            for (const entry of materials) {
                if (!entry || this.playerMaterials.some(record => record.material === entry)) continue;
                this.playerMaterials.push({
                    material: entry,
                    emissive: entry.emissive?.clone?.() || null,
                    emissiveIntensity: Number(entry.emissiveIntensity) || 0
                });
            }
        });
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
        this.playerBones = Object.fromEntries([...boneByName.entries()]);
        this.poseBones = bones;
        for (const bone of this.poseBones) {
            bone.userData.demoPosePrevious = new THREE.Quaternion();
            bone.userData.demoPoseTarget = new THREE.Quaternion();
        }
        this.playerModel.userData.demoPosePrevious = new THREE.Quaternion();
        this.playerModel.userData.demoPoseTarget = new THREE.Quaternion();
        this.playerModel.userData.demoPositionPrevious = new THREE.Vector3();
        this.playerModel.userData.demoPositionTarget = new THREE.Vector3();
        this.rightHandBone = this.playerBones['Bone.007'];

        this.weaponRoot = new THREE.Group();
        this.weaponRoot.name = 'PlayerWeapon';
        this.playerRoot.add(this.weaponRoot);
        this.weaponModels = this.createWeaponModels();

        this.playerFacing = new THREE.Vector3(0, 0, -1);
        this.aimDirection = new THREE.Vector3(0, 0, -1);
        this.dodgeDirection = new THREE.Vector3(0, 0, -1);
        this.applyPlayerPose(0, false, 0);
        this.onWeaponChanged(getDemoWeaponProfile(this.weaponForm));
        this.updateWeapon();
    }

    createWeaponModels() {
        const models = {};
        const steel = new THREE.MeshStandardMaterial({
            color: 0x9ca6a3,
            metalness: 0.76,
            roughness: 0.3
        });
        const darkSteel = new THREE.MeshStandardMaterial({
            color: 0x4c5553,
            metalness: 0.7,
            roughness: 0.42
        });
        const leather = new THREE.MeshStandardMaterial({ color: 0x3c2115, roughness: 0.86 });
        const wood = new THREE.MeshStandardMaterial({ color: 0x4d301b, roughness: 0.9 });
        const focusGlow = new THREE.MeshStandardMaterial({
            color: 0x72b88c,
            emissive: 0x1f5937,
            emissiveIntensity: 1.8,
            roughness: 0.32
        });
        const add = (group, geometry, weaponMaterial, position, rotation = null) => {
            const object = new THREE.Mesh(geometry, weaponMaterial);
            object.position.set(...position);
            if (rotation) object.rotation.set(...rotation);
            object.castShadow = true;
            group.add(object);
            return object;
        };
        const grip = (group, length = 0.5, z = -0.28, radius = 0.065) => (
            add(
                group,
                new THREE.CylinderGeometry(radius, radius, length, 9),
                leather,
                [0, 0, z],
                [Math.PI / 2, 0, 0]
            )
        );

        const sword = new THREE.Group();
        add(sword, new THREE.BoxGeometry(0.11, 0.045, 1.58), steel, [0, 0, 0.8]);
        add(sword, new THREE.ConeGeometry(0.09, 0.2, 4), steel, [0, 0, 1.68], [Math.PI / 2, 0, Math.PI / 4]);
        add(sword, new THREE.BoxGeometry(0.58, 0.1, 0.1), darkSteel, [0, 0, -0.02]);
        grip(sword);
        models.sword = sword;

        const dagger = new THREE.Group();
        add(dagger, new THREE.BoxGeometry(0.12, 0.04, 0.82), steel, [0, 0, 0.42]);
        add(dagger, new THREE.ConeGeometry(0.09, 0.18, 4), steel, [0, 0, 0.92], [Math.PI / 2, 0, Math.PI / 4]);
        add(dagger, new THREE.BoxGeometry(0.34, 0.08, 0.08), darkSteel, [0, 0, -0.02]);
        grip(dagger, 0.42, -0.24, 0.055);
        models.dagger = dagger;

        const heavy = new THREE.Group();
        add(heavy, new THREE.CylinderGeometry(0.075, 0.09, 2.15, 10), wood, [0, 0, 0.55], [Math.PI / 2, 0, 0]);
        add(heavy, new THREE.BoxGeometry(0.95, 0.5, 0.52), darkSteel, [0, 0, 1.72]);
        add(heavy, new THREE.BoxGeometry(1.15, 0.28, 0.68), steel, [0, 0, 1.72]);
        grip(heavy, 0.62, -0.37, 0.085);
        models.heavy = heavy;

        const lance = new THREE.Group();
        add(lance, new THREE.CylinderGeometry(0.055, 0.075, 3.25, 10), wood, [0, 0, 1.2], [Math.PI / 2, 0, 0]);
        add(lance, new THREE.ConeGeometry(0.19, 0.72, 6), steel, [0, 0, 3.18], [Math.PI / 2, 0, 0]);
        add(lance, new THREE.CylinderGeometry(0.16, 0.1, 0.22, 8), darkSteel, [0, 0, 2.73], [Math.PI / 2, 0, 0]);
        grip(lance, 0.62, -0.5, 0.07);
        models.lance = lance;

        const focus = new THREE.Group();
        add(focus, new THREE.CylinderGeometry(0.06, 0.085, 2.65, 10), wood, [0, 0, 0.95], [Math.PI / 2, 0, 0]);
        add(focus, new THREE.TorusGeometry(0.34, 0.07, 8, 18), darkSteel, [0, 0, 2.45], [Math.PI / 2, 0, 0]);
        add(focus, new THREE.OctahedronGeometry(0.22, 0), focusGlow, [0, 0, 2.45]);
        grip(focus, 0.58, -0.46, 0.07);
        models.focus = focus;

        for (const [form, model] of Object.entries(models)) {
            model.name = `Weapon:${form}`;
            model.visible = false;
            setShadow(model, true);
            this.weaponRoot.add(model);
        }
        return models;
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

        this.hitboxPreview = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshBasicMaterial({
                color: 0xffb85c,
                transparent: true,
                opacity: 0.16,
                depthWrite: false,
                wireframe: true
            })
        );
        this.hitboxPreview.visible = false;
        this.scene.add(this.hitboxPreview);

        this.impactEffects = [];
    }

    bindUi() {
        this.root.querySelector('[data-demo-reset]').addEventListener('click', () => {
            this.session.reset();
            this.combat.resetPlayer();
            this.loadRoom(this.session.roomId);
        });
        this.root.querySelector('[data-demo-exit]').addEventListener('click', () => this.exitToTown());
        this.root.querySelectorAll('[data-weapon-form]').forEach(button => {
            button.addEventListener('click', () => this.selectWeapon(button.dataset.weaponForm));
        });
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
        if (this.hitStopRemaining > 0) {
            this.hitStopRemaining = Math.max(0, this.hitStopRemaining - delta);
            return;
        }

        DemoWeaponForms.forEach((form, index) => {
            if (this.input.consume(`Digit${index + 1}`)) this.selectWeapon(form);
        });

        if (this.input.consume('KeyQ') && this.enemyRoot && this.enemyState?.health > 0) {
            this.lockedOn = !this.lockedOn;
            this.hud.showMessage(this.lockedOn ? '鎖定目標' : '解除鎖定', 0.8);
        }
        if (this.input.consume('MouseLeft')) {
            this.facePointerDirection(true);
            this.combat.tryLightAttack();
        }
        if (this.input.consume('MouseRightDown')) {
            this.facePointerDirection(true);
            this.combat.beginHeavyCharge();
        }
        if (this.input.consume('MouseRightUp')) {
            this.facePointerDirection(true);
            this.combat.releaseHeavy();
        }
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
        this.updatePlayerVisual(delta);
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

    facePointerDirection(snap = false) {
        if (!this.playerRoot || this.lockedOn) return false;
        this.aimRaycaster.setFromCamera({
            x: this.input.pointerNdcX,
            y: this.input.pointerNdcY
        }, this.camera);
        this.aimGroundPlane.constant = -this.playerRoot.position.y;
        if (!this.aimRaycaster.ray.intersectPlane(this.aimGroundPlane, this.vAimPoint)) {
            this.faceCameraDirection(snap);
            return false;
        }
        this.vAimDirection.copy(this.vAimPoint)
            .sub(this.playerRoot.position)
            .setY(0);
        if (this.vAimDirection.lengthSq() < 0.04) return false;
        this.aimDirection.copy(this.vAimDirection.normalize());
        this.playerFacing.copy(this.aimDirection);
        if (snap) {
            this.playerRoot.rotation.y = Math.atan2(this.playerFacing.x, this.playerFacing.z);
        }
        return true;
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
        } else if (state === 'heavy-charge') {
            this.facePointerDirection();
        } else if (hasMoveInput) {
            this.playerFacing.copy(move);
        } else if (state === 'free') {
            this.facePointerDirection();
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

    updatePlayerVisual(delta) {
        const player = this.combat.player;
        const moving = Math.abs(this.input.moveX) + Math.abs(this.input.moveZ) > 0
            && this.combat.getMoveSpeed() > 0;
        const locomotionTarget = moving ? 1 : 0;
        this.locomotionBlend += (locomotionTarget - this.locomotionBlend)
            * Math.min(1, delta * 10);
        if (moving) {
            this.locomotionTime += delta * 7.8 * this.combat.weaponProfile.moveScale;
        } else if (this.locomotionBlend > 0.01) {
            const plantedPhase = Math.round(this.locomotionTime / Math.PI) * Math.PI;
            this.locomotionTime += (plantedPhase - this.locomotionTime)
                * Math.min(1, delta * 13);
        }

        let attackProgress = 0;
        const attack = this.combat.getCurrentAttack();
        if (attack) attackProgress = clamp01(player.timer / attack.duration);
        const dodgeProgress = player.state === 'dodge'
            ? clamp01(player.timer / 0.46)
            : 0;

        this.playerHitReaction = Math.max(0, this.playerHitReaction - delta / 0.38);
        this.applyPlayerPose(attackProgress, moving, dodgeProgress, delta);
        const hitFlash = smooth(clamp01((this.playerHitReaction - 0.42) / 0.58));
        for (const record of this.playerMaterials || []) {
            const { material, emissive, emissiveIntensity } = record;
            if (!material.emissive || !emissive) continue;
            material.emissive.copy(emissive).lerp(new THREE.Color(0x7d1008), hitFlash * 0.72);
            material.emissiveIntensity = emissiveIntensity + hitFlash * 1.65;
        }
        this.updateWeapon();
        this.updateHitboxPreview(attack, attackProgress);
    }

    beginPoseBlend() {
        this.playerModel.userData.demoPosePrevious.copy(this.playerModel.quaternion);
        this.playerModel.userData.demoPositionPrevious.copy(this.playerModel.position);
        for (const bone of this.poseBones) {
            bone.userData.demoPosePrevious.copy(bone.quaternion);
        }
    }

    finishPoseBlend(delta = 1 / 60, directModel = false) {
        const state = this.combat.player.state;
        const speed = ['attack', 'heavy', 'heavy-charge'].includes(state)
            ? 34
            : state === 'dodge' ? 48 : 18;
        const frameDelta = Number.isFinite(delta) ? delta : 1 / 60;
        const blend = 1 - Math.exp(-speed * frameDelta);
        for (const bone of this.poseBones) {
            bone.userData.demoPoseTarget.copy(bone.quaternion);
            bone.quaternion.copy(bone.userData.demoPosePrevious)
                .slerp(bone.userData.demoPoseTarget, blend);
        }
        if (directModel) return;
        this.playerModel.userData.demoPoseTarget.copy(this.playerModel.quaternion);
        this.playerModel.userData.demoPositionTarget.copy(this.playerModel.position);
        this.playerModel.quaternion.copy(this.playerModel.userData.demoPosePrevious)
            .slerp(this.playerModel.userData.demoPoseTarget, blend);
        this.playerModel.position.copy(this.playerModel.userData.demoPositionPrevious)
            .lerp(this.playerModel.userData.demoPositionTarget, blend);
    }

    applyPlayerPose(attackProgress, moving, dodgeProgress, delta = 1 / 60) {
        const player = this.combat.player;
        const attack = this.combat.getCurrentAttack();
        const phase = this.locomotionTime;
        const locomotionWeight = player.state === 'free' ? this.locomotionBlend : 0;
        const stride = Math.sin(phase) * locomotionWeight;
        const strideCross = Math.cos(phase) * locomotionWeight;
        const stepLift = Math.pow(Math.abs(Math.sin(phase)), 1.35) * locomotionWeight;
        const breathing = Math.sin(performance.now() * 0.0021);
        const rightUpper = this.playerBones['Bone.005'];
        const rightForearm = this.playerBones['Bone.006'];
        const rightHand = this.playerBones['Bone.007'];
        const leftUpper = this.playerBones['Bone.004'];
        const leftForearm = this.playerBones['Bone.008'];
        const leftHand = this.playerBones['Bone.009'];
        const leftThigh = this.playerBones['Bone.011'];
        const leftShin = this.playerBones['Bone.012'];
        const leftFoot = this.playerBones['Bone.015'];
        const rightThigh = this.playerBones['Bone.013'];
        const rightShin = this.playerBones['Bone.014'];
        const rightFoot = this.playerBones['Bone.016'];

        this.beginPoseBlend();
        this.playerModel.rotation.set(0, PLAYER_MODEL_FORWARD_OFFSET, 0);
        this.playerModel.position.set(
            0,
            this.playerModelBaseY + (locomotionWeight > 0.01
                ? 0.012 + stepLift * 0.042
                : breathing * 0.009),
            0
        );
        this.playerModel.rotation.x = locomotionWeight * (-0.045 - stepLift * 0.018);
        this.playerModel.rotation.z = strideCross * 0.018;

        rightUpper?.rotation.set(0.035 + stride * 0.48, 0.12, -Math.PI + 0.16);
        rightForearm?.rotation.set(0.08 + Math.max(0, stride) * 0.18, 0, -0.08);
        rightHand?.rotation.set(-strideCross * 0.035, 0, 0);
        leftUpper?.rotation.set(0.035 - stride * 0.48, -0.12, Math.PI - 0.12);
        leftForearm?.rotation.set(0.08 + Math.max(0, -stride) * 0.18, 0, 0.08);
        leftHand?.rotation.set(strideCross * 0.035, 0, 0);
        leftThigh?.rotation.set(stride * 0.66, 0, -strideCross * 0.025);
        rightThigh?.rotation.set(-stride * 0.66, 0, strideCross * 0.025);
        leftShin?.rotation.set(Math.max(0, -stride) * 0.82, 0, 0);
        rightShin?.rotation.set(Math.max(0, stride) * 0.82, 0, 0);
        leftFoot?.rotation.set(-Math.max(0, -stride) * 0.42 + Math.max(0, stride) * 0.09, 0, 0);
        rightFoot?.rotation.set(-Math.max(0, stride) * 0.42 + Math.max(0, -stride) * 0.09, 0, 0);

        if (dodgeProgress > 0) {
            const anticipation = smooth(clamp01(dodgeProgress / 0.14));
            const rollProgress = smooth(clamp01((dodgeProgress - 0.12) / 0.64));
            const recovery = smooth(clamp01((dodgeProgress - 0.76) / 0.24));
            this.playerModel.rotation.x = -Math.PI * 2 * rollProgress
                - anticipation * 0.16 + recovery * 0.16;
            this.playerModel.position.y += Math.sin(rollProgress * Math.PI) * 0.16
                - anticipation * (1 - recovery) * 0.08;
            this.playerModel.position.z = anticipation * 0.08 - recovery * 0.08;
            rightUpper?.rotation.set(-0.82, 0.3, -Math.PI + 0.58);
            rightForearm?.rotation.set(-0.62, 0.08, 0.36);
            leftUpper?.rotation.set(-0.82, -0.3, Math.PI - 0.58);
            leftForearm?.rotation.set(-0.62, -0.08, -0.36);
            leftThigh?.rotation.set(-0.62 + recovery * 0.48, 0, -0.1);
            rightThigh?.rotation.set(-0.62 + recovery * 0.48, 0, 0.1);
            leftShin?.rotation.set(1.12 - recovery * 0.9, 0, 0);
            rightShin?.rotation.set(1.12 - recovery * 0.9, 0, 0);
            leftFoot?.rotation.set(-0.45 + recovery * 0.45, 0, 0);
            rightFoot?.rotation.set(-0.45 + recovery * 0.45, 0, 0);
        } else if (player.state === 'heavy-charge') {
            this.applyWeaponPose(this.combat.weaponProfile.heavy, -clamp01(player.charge));
        } else if (attack) {
            this.applyWeaponPose(attack, attackProgress);
        } else if (player.state === 'drink') {
            const drink = Math.sin(clamp01(player.timer / 0.72) * Math.PI);
            rightUpper?.rotation.set(-0.9 * drink, 0.3, -Math.PI + 0.6 * drink);
            rightForearm?.rotation.set(-0.8 * drink, 0, 0.45 * drink);
        } else if (player.state === 'dead') {
            const fall = smooth(clamp01(player.timer / 0.72));
            this.playerModel.rotation.z = -fall * 1.35;
            this.playerModel.rotation.x = fall * 0.18;
            this.playerModel.position.y -= fall * 0.42;
            rightUpper?.rotation.set(-0.42, 0.2, -Math.PI + 0.48);
            leftUpper?.rotation.set(-0.28, -0.18, Math.PI - 0.35);
            leftThigh?.rotation.set(-0.35, 0, 0.18);
            rightThigh?.rotation.set(0.22, 0, -0.12);
        } else {
            this.applyWeaponReadyPose();
        }

        this.applyHitReaction();
        this.finishPoseBlend(delta, dodgeProgress > 0);
    }

    applyWeaponReadyPose() {
        const form = this.weaponForm;
        const rightUpper = this.playerBones['Bone.005'];
        const rightForearm = this.playerBones['Bone.006'];
        const leftUpper = this.playerBones['Bone.004'];
        const leftForearm = this.playerBones['Bone.008'];
        const leftThigh = this.playerBones['Bone.011'];
        const rightThigh = this.playerBones['Bone.013'];
        const breathe = Math.sin(performance.now() * 0.0021);
        const gait = Math.sin(this.locomotionTime) * this.locomotionBlend;
        if (form === 'sword') {
            this.playerModel.rotation.y += 0.035 + breathe * 0.008;
            rightUpper?.rotation.set(-0.24 + gait * 0.08, 0.28, -Math.PI + 0.4);
            rightForearm?.rotation.set(-0.34, 0.04, 0.24);
            leftUpper?.rotation.set(0.02 - gait * 0.16, -0.18, Math.PI - 0.2);
            if (leftThigh) leftThigh.rotation.x -= 0.055;
            if (rightThigh) rightThigh.rotation.x += 0.055;
        } else if (form === 'dagger') {
            this.playerModel.rotation.x -= 0.055;
            this.playerModel.position.y -= 0.025;
            rightUpper?.rotation.set(-0.48 + gait * 0.1, 0.38, -Math.PI + 0.54);
            rightForearm?.rotation.set(-0.68, 0.08, 0.42);
            leftUpper?.rotation.set(-0.08 - gait * 0.14, -0.22, Math.PI - 0.28);
            leftForearm?.rotation.set(-0.24, 0, -0.16);
            if (leftThigh) leftThigh.rotation.x -= 0.1;
            if (rightThigh) rightThigh.rotation.x += 0.08;
        } else if (form === 'heavy') {
            this.playerModel.position.y -= 0.035;
            this.playerModel.rotation.y += gait * 0.018;
            rightUpper?.rotation.set(-0.32 + gait * 0.035, 0.32, -Math.PI + 0.58);
            rightForearm?.rotation.set(-0.5, 0, 0.44);
            leftUpper?.rotation.set(-0.28 - gait * 0.035, -0.3, Math.PI - 0.62);
            leftForearm?.rotation.set(-0.46, 0, -0.36);
            if (leftThigh) leftThigh.rotation.x -= 0.12;
            if (rightThigh) rightThigh.rotation.x += 0.12;
        } else if (form === 'lance') {
            this.playerModel.rotation.x -= 0.035;
            rightUpper?.rotation.set(-0.62 + gait * 0.04, 0.32, -Math.PI + 0.46);
            rightForearm?.rotation.set(-0.42, 0, 0.24);
            leftUpper?.rotation.set(-0.54 - gait * 0.04, -0.3, Math.PI - 0.56);
            leftForearm?.rotation.set(-0.38, 0, -0.18);
            if (leftThigh) leftThigh.rotation.x -= 0.14;
            if (rightThigh) rightThigh.rotation.x += 0.1;
        } else if (form === 'focus') {
            rightUpper?.rotation.set(-0.28 + gait * 0.06, 0.3, -Math.PI + 0.38);
            rightForearm?.rotation.set(-0.38, 0, 0.18);
            leftUpper?.rotation.set(-0.32 + breathe * 0.025 - gait * 0.08, -0.24, Math.PI - 0.44);
            leftForearm?.rotation.set(-0.28, 0, -0.18);
        }
    }

    applyWeaponPose(attack, progress) {
        const rightUpper = this.playerBones['Bone.005'];
        const rightForearm = this.playerBones['Bone.006'];
        const rightHand = this.playerBones['Bone.007'];
        const leftUpper = this.playerBones['Bone.004'];
        const leftForearm = this.playerBones['Bone.008'];
        const leftThigh = this.playerBones['Bone.011'];
        const leftShin = this.playerBones['Bone.012'];
        const rightThigh = this.playerBones['Bone.013'];
        const rightShin = this.playerBones['Bone.014'];
        const windup = progress < 0
            ? smooth(Math.abs(progress))
            : smooth(clamp01(progress / Math.max(attack.activeStart, 0.01)));
        const impact = progress < 0 ? 0 : pulse(
            progress,
            Math.max(0, attack.activeStart - 0.04),
            (attack.activeStart + attack.activeEnd) * 0.5,
            Math.min(1, attack.activeEnd + 0.09)
        );
        const direction = attack.direction || 1;
        const weaponInertia = attack.pose?.startsWith('heavy-')
            ? 0.34
            : attack.pose?.startsWith('dagger-') ? 0.1
                : attack.pose?.startsWith('lance-') ? 0.14
                    : attack.pose?.startsWith('focus-') ? 0.08 : 0.2;
        const hipDrive = kineticChannel(progress, attack, -0.09, weaponInertia * 0.42);
        const torsoDrive = kineticChannel(progress, attack, -0.045, weaponInertia * 0.62);
        const shoulderDrive = kineticChannel(progress, attack, 0, weaponInertia * 0.82);
        const elbowDrive = kineticChannel(progress, attack, 0.025, weaponInertia * 0.92);
        const handDrive = kineticChannel(progress, attack, 0.05, weaponInertia);

        if (attack.pose === 'dagger-cut' || attack.pose === 'sword-slash') {
            const dagger = attack.pose === 'dagger-cut';
            this.playerModel.rotation.y += hipDrive * direction * (dagger ? 0.28 : 0.42);
            this.playerModel.rotation.x += impact * (dagger ? 0.04 : 0.09);
            this.playerModel.position.z -= impact * (dagger ? 0.06 : 0.1);
            rightUpper?.rotation.set(
                (dagger ? -0.58 : -0.48) + impact * 0.22,
                0.36,
                -Math.PI + 0.42 + shoulderDrive * direction * (dagger ? 0.88 : 1.0)
            );
            rightForearm?.rotation.set(
                -0.48 + impact * 0.2,
                0.15,
                0.36 + elbowDrive * direction * 0.42
            );
            rightHand?.rotation.set(-0.2, impact * 0.08, -handDrive * direction * 0.28);
            leftUpper?.rotation.set(
                -0.12 - impact * 0.18,
                -0.24,
                Math.PI - 0.3 - torsoDrive * direction * 0.18
            );
            leftForearm?.rotation.set(-0.28, 0, -0.18);
            if (leftThigh) {
                leftThigh.rotation.x -= Math.max(0, -hipDrive) * 0.16 - impact * 0.24;
            }
            if (rightThigh) {
                rightThigh.rotation.x += Math.max(0, -hipDrive) * 0.12 - impact * 0.16;
            }
        } else if (attack.pose === 'sword-finisher' || attack.pose === 'sword-heavy') {
            this.playerModel.rotation.y += hipDrive * direction * 0.5;
            this.playerModel.rotation.x += -0.18 * windup + 0.24 * impact;
            this.playerModel.position.y -= windup * 0.055;
            this.playerModel.position.z -= impact * 0.16;
            rightUpper?.rotation.set(
                -0.9 + impact * 0.62,
                0.32,
                -Math.PI + 0.76 + shoulderDrive * direction
            );
            rightForearm?.rotation.set(
                -0.72 + impact * 0.24,
                0.1,
                0.62 + elbowDrive * direction * 0.3
            );
            rightHand?.rotation.set(-0.12, 0, -handDrive * direction * 0.22);
            leftUpper?.rotation.set(
                -0.5 + impact * 0.25,
                -0.28,
                Math.PI - 0.68 + torsoDrive * direction * 0.55
            );
            leftForearm?.rotation.set(-0.58 + impact * 0.18, 0, -0.38);
            leftThigh?.rotation.set(-windup * 0.28 + impact * 0.34, 0, -0.08);
            rightThigh?.rotation.set(windup * 0.18 - impact * 0.2, 0, 0.08);
            if (leftShin) leftShin.rotation.x = windup * 0.24;
        } else if (attack.pose === 'dagger-thrust') {
            const thrust = handDrive;
            this.playerModel.position.z -= thrust * 0.22;
            this.playerModel.rotation.x += torsoDrive * 0.09 + impact * 0.07;
            rightUpper?.rotation.set(-1.18 + shoulderDrive * 0.24, 0.18, -Math.PI + 0.74);
            rightForearm?.rotation.set(-0.98 + elbowDrive * 0.3, 0, 0.16);
            rightHand?.rotation.set(-0.25 + handDrive * 0.08, 0, 0);
            leftUpper?.rotation.set(-0.28, -0.25, Math.PI - 0.38);
            if (leftThigh) leftThigh.rotation.x -= windup * 0.22 - impact * 0.42;
            if (rightThigh) rightThigh.rotation.x += windup * 0.16 - impact * 0.28;
            if (rightShin) rightShin.rotation.x = impact * 0.18;
        } else if (attack.pose === 'heavy-sweep') {
            this.playerModel.rotation.y += hipDrive * direction * 0.64;
            this.playerModel.rotation.x += -windup * 0.12 + impact * 0.17;
            this.playerModel.position.y -= windup * 0.09;
            rightUpper?.rotation.set(
                -0.62,
                0.4,
                -Math.PI + 0.72 + shoulderDrive * direction * 0.94
            );
            rightForearm?.rotation.set(
                -0.68 + impact * 0.18,
                0,
                0.5 + elbowDrive * direction * 0.34
            );
            rightHand?.rotation.set(-0.08, 0, -handDrive * direction * 0.18);
            leftUpper?.rotation.set(
                -0.6,
                -0.36,
                Math.PI - 0.76 + torsoDrive * direction * 0.72
            );
            leftForearm?.rotation.set(
                -0.64 + impact * 0.14,
                0,
                -0.46 + elbowDrive * direction * 0.22
            );
            leftThigh?.rotation.set(-windup * 0.34 + impact * 0.26, 0, -0.12);
            rightThigh?.rotation.set(windup * 0.28 - impact * 0.18, 0, 0.12);
            if (leftShin) leftShin.rotation.x = windup * 0.34;
            if (rightShin) rightShin.rotation.x = windup * 0.26;
        } else if (attack.pose === 'heavy-overhead') {
            const drop = Math.max(0, handDrive);
            const lift = Math.max(0, -shoulderDrive);
            this.playerModel.rotation.x += torsoDrive * 0.24 + impact * 0.1;
            this.playerModel.position.y -= windup * 0.13 - impact * 0.05;
            this.playerModel.position.z -= impact * 0.12;
            rightUpper?.rotation.set(
                -1.34 - lift * 0.16 + drop * 0.86,
                0.24,
                -Math.PI + 1.12 - shoulderDrive * 0.9
            );
            rightForearm?.rotation.set(-1.04 - lift * 0.1 + elbowDrive * 0.58, 0, 0.56);
            rightHand?.rotation.set(-handDrive * 0.18, 0, 0);
            leftUpper?.rotation.set(
                -1.28 - lift * 0.14 + drop * 0.82,
                -0.24,
                Math.PI - 1.08 + shoulderDrive * 0.84
            );
            leftForearm?.rotation.set(-0.96 - lift * 0.08 + elbowDrive * 0.54, 0, -0.52);
            if (leftThigh) leftThigh.rotation.x = -windup * 0.42 + impact * 0.28;
            if (rightThigh) rightThigh.rotation.x = -windup * 0.32 + impact * 0.22;
            if (leftShin) leftShin.rotation.x = windup * 0.62 - impact * 0.28;
            if (rightShin) rightShin.rotation.x = windup * 0.54 - impact * 0.24;
        } else if (attack.pose?.startsWith('lance-')) {
            const thrust = handDrive;
            this.playerModel.position.z -= thrust * (attack.pose === 'lance-charge' ? 0.3 : 0.22);
            this.playerModel.rotation.x += torsoDrive * 0.08 + impact * 0.04;
            rightUpper?.rotation.set(-1.08 + shoulderDrive * 0.18, 0.2, -Math.PI + 0.68);
            rightForearm?.rotation.set(-0.9 + elbowDrive * 0.24, 0, 0.16);
            rightHand?.rotation.set(-handDrive * 0.08, 0, 0);
            leftUpper?.rotation.set(-0.86 + torsoDrive * 0.14, -0.2, Math.PI - 0.66);
            leftForearm?.rotation.set(-0.7 + elbowDrive * 0.2, 0, -0.14);
            if (leftThigh) leftThigh.rotation.x -= windup * 0.28 - impact * 0.42;
            if (rightThigh) rightThigh.rotation.x += windup * 0.22 - impact * 0.3;
            if (attack.pose === 'lance-sweep') {
                this.playerModel.rotation.y += hipDrive * direction * 0.54;
                leftUpper.rotation.z += shoulderDrive * direction * 0.38;
            }
        } else if (attack.pose?.startsWith('focus-')) {
            const cast = Math.sin(clamp01(Math.max(0, progress)) * Math.PI);
            const burst = attack.pose === 'focus-burst';
            this.playerModel.rotation.x += -0.1 * windup + impact * 0.08;
            this.playerModel.rotation.y += direction * torsoDrive * 0.13;
            rightUpper?.rotation.set(-0.96 + shoulderDrive * 0.28, 0.28, -Math.PI + 0.9);
            rightForearm?.rotation.set(-0.8 + elbowDrive * 0.16, 0, 0.26);
            rightHand?.rotation.set(-handDrive * 0.08, 0, 0);
            leftUpper?.rotation.set(-0.84 - windup * (burst ? 0.28 : 0.08), -0.28, Math.PI - 0.82);
            leftForearm?.rotation.set(-0.66 - windup * 0.14, 0, -0.24);
            this.playerModel.position.y += cast * (burst ? 0.075 : 0.045);
            if (leftThigh) leftThigh.rotation.x -= windup * 0.12;
            if (rightThigh) rightThigh.rotation.x += windup * 0.1;
        }
    }

    applyHitReaction() {
        if (this.playerHitReaction <= 0) return;
        const progress = 1 - this.playerHitReaction;
        const recoil = pulse(progress, 0, 0.2, 1);
        const sharp = 1 - smooth(clamp01(progress / 0.28));
        const rightUpper = this.playerBones['Bone.005'];
        const rightForearm = this.playerBones['Bone.006'];
        const leftUpper = this.playerBones['Bone.004'];
        const leftForearm = this.playerBones['Bone.008'];
        const leftThigh = this.playerBones['Bone.011'];
        const rightThigh = this.playerBones['Bone.013'];
        this.playerModel.rotation.x += recoil * 0.22;
        this.playerModel.rotation.z += this.playerHitSide * recoil * 0.18;
        this.playerModel.position.z += sharp * 0.11;
        this.playerModel.position.y -= recoil * 0.035;
        if (rightUpper) rightUpper.rotation.x += recoil * 0.38;
        if (rightForearm) rightForearm.rotation.z += this.playerHitSide * recoil * 0.22;
        if (leftUpper) leftUpper.rotation.x += recoil * 0.3;
        if (leftForearm) leftForearm.rotation.z += this.playerHitSide * recoil * 0.18;
        if (leftThigh) leftThigh.rotation.x -= recoil * 0.18;
        if (rightThigh) rightThigh.rotation.x -= recoil * 0.14;
    }

    updateWeapon() {
        if (!this.rightHandBone || !this.weaponRoot) return;
        this.playerRoot.updateMatrixWorld(true);
        this.rightHandBone.updateMatrixWorld(true);
        this.rightHandBone.getWorldPosition(this.vDesired);
        this.vForward.set(0, 1, 0).transformDirection(this.rightHandBone.matrixWorld).normalize();
        this.qTemp.setFromUnitVectors(this.vTarget.set(0, 0, 1), this.vForward);
        this.playerRoot.getWorldQuaternion(this.qTemp2);
        this.weaponRoot.quaternion.copy(this.qTemp2.invert().multiply(this.qTemp));
        this.vDesired.addScaledVector(this.vForward, 0.23);
        this.playerRoot.worldToLocal(this.vDesired);
        this.weaponRoot.position.copy(this.vDesired);
    }

    selectWeapon(form) {
        if (!this.combat?.setWeaponForm(form)) {
            if (this.combat?.player?.state !== 'free') {
                this.hud.showMessage('動作結束後才能切換武器。', 0.8);
            }
            return;
        }
        this.weaponForm = form;
    }

    onWeaponChanged(profile) {
        this.weaponForm = profile.form;
        for (const [form, model] of Object.entries(this.weaponModels || {})) {
            model.visible = form === profile.form;
        }
        this.root.querySelectorAll('[data-weapon-form]').forEach(button => {
            const active = button.dataset.weaponForm === profile.form;
            button.classList.toggle('is-active', active);
            button.setAttribute('aria-pressed', String(active));
        });
        this.hud?.showMessage?.(`已切換：${profile.label}`, 0.75);
    }

    resolvePlayerHit(attack) {
        if (!this.enemyRoot || !this.enemyState || this.enemyState.health <= 0) return false;
        this.vEnemy.copy(this.enemyRoot.position).sub(this.playerRoot.position).setY(0);
        const distance = this.vEnemy.length();
        const forward = this.vEnemy.dot(this.playerFacing);
        this.vRight.set(-this.playerFacing.z, 0, this.playerFacing.x);
        const lateral = Math.abs(this.vEnemy.dot(this.vRight));
        const enemyRadius = this.enemyState.data.id === 'ambush_mantis' ? 0.85 : 0.68;
        return intersectsDemoHitbox(attack.hitbox, {
            distance,
            forward,
            lateral,
            radius: enemyRadius
        });
    }

    updateHitboxPreview(attack, progress) {
        if (!this.hitboxPreview) return;
        const active = Boolean(
            attack
            && progress >= attack.activeStart
            && progress <= attack.activeEnd
        );
        this.attackWindowActive = active;
        this.hitboxPreview.visible = active;
        if (!active) return;

        const hitbox = attack.hitbox;
        const reach = hitbox.reach || 2;
        let width = (hitbox.width || reach * Math.sin(hitbox.halfAngle || 0.7)) * 2;
        let depth = Math.max(0.4, reach - (hitbox.start || hitbox.inner || 0));
        let forwardOffset = (hitbox.start || hitbox.inner || 0) + depth * 0.5;
        if (hitbox.kind === 'impact') {
            width = hitbox.radius * 2;
            depth = hitbox.radius * 2;
            forwardOffset = hitbox.reach;
        }
        this.hitboxPreview.scale.set(width, hitbox.height || 1.2, depth);
        this.hitboxPreview.position.copy(this.playerRoot.position)
            .addScaledVector(this.playerFacing, forwardOffset);
        this.hitboxPreview.position.y = (hitbox.height || 1.2) * 0.5;
        this.hitboxPreview.rotation.y = Math.atan2(this.playerFacing.x, this.playerFacing.z);
        this.hitboxPreview.material.opacity = this.devMode ? 0.22 : 0.07;
    }

    spawnImpactEffect(position, heavy = false, attack = null) {
        const profile = getDemoWeaponProfile(this.weaponForm);
        const color = attack?.pose?.startsWith('focus-') ? 0x78d6a0 : profile.trailColor;
        const root = new THREE.Group();
        root.position.copy(position).add(this.vTarget.set(0, 1.15, 0));
        const count = heavy ? 12 : 7;
        const particles = [];
        for (let index = 0; index < count; index += 1) {
            const particle = new THREE.Mesh(
                new THREE.IcosahedronGeometry(heavy ? 0.075 : 0.052, 0),
                new THREE.MeshBasicMaterial({
                    color,
                    transparent: true,
                    opacity: 0.95,
                    depthWrite: false
                })
            );
            const angle = (index / count) * Math.PI * 2;
            const speed = (heavy ? 2.5 : 1.8) * (0.72 + (index % 3) * 0.16);
            particle.userData.velocity = new THREE.Vector3(
                Math.cos(angle) * speed,
                1.1 + (index % 2) * 0.7,
                Math.sin(angle) * speed
            );
            root.add(particle);
            particles.push(particle);
        }
        this.scene.add(root);
        this.impactEffects.push({ root, particles, life: heavy ? 0.42 : 0.3 });
    }

    updateImpactEffects(delta) {
        for (const effect of this.impactEffects) {
            effect.life -= delta;
            for (const particle of effect.particles) {
                particle.position.addScaledVector(particle.userData.velocity, delta);
                particle.userData.velocity.y -= 5.5 * delta;
                particle.material.opacity = clamp01(effect.life / 0.3);
            }
        }
        const expired = this.impactEffects.filter(effect => effect.life <= 0);
        this.impactEffects = this.impactEffects.filter(effect => effect.life > 0);
        for (const effect of expired) {
            effect.root.traverse(object => {
                object.geometry?.dispose?.();
                object.material?.dispose?.();
            });
            effect.root.removeFromParent();
        }
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

    showAttackArc(type, combo, attack, profile) {
        const heavy = type === 'heavy';
        this.attackArcLife = Math.max(0.2, attack?.duration * 0.52 || (heavy ? 0.42 : 0.24));
        this.attackArcMaxLife = this.attackArcLife;
        this.attackArc.visible = true;
        this.attackArcHeight = attack?.pose?.startsWith('focus-')
            ? 1.32
            : attack?.pose?.startsWith('dagger-') ? 0.92 : 1.08;
        const reach = attack?.hitbox?.reach || 2.4;
        this.attackArc.scale.setScalar(reach / 2.4);
        this.attackArc.rotation.z = -0.42 + combo * 0.14 * (attack?.direction || 1);
        this.attackArc.material.color.setHex(profile?.trailColor || (heavy ? 0xe2bd71 : 0xd8d2bb));
    }

    updateAttackArc(delta) {
        if (this.attackArcLife <= 0 || !this.attackArc) return;
        this.attackArcLife = Math.max(0, this.attackArcLife - delta);
        this.attackArc.position.copy(this.playerRoot.position);
        this.attackArc.position.y = this.attackArcHeight || 1.08;
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

    onEnemyHit(damage, heavy, attack) {
        if (!this.enemyRoot) return;
        this.spawnDamagePopup(this.enemyRoot.position, `-${damage}`);
        this.spawnImpactEffect(this.enemyRoot.position, heavy, attack);
        this.enemyRoot.scale.set(heavy ? 1.22 : 1.12, heavy ? 0.78 : 0.9, heavy ? 1.22 : 1.12);
        this.cameraShake = heavy ? 0.2 : 0.1;
        this.hitStopRemaining = heavy ? 0.095 : 0.052;
    }

    onPlayerHit(damage, action = null) {
        this.spawnDamagePopup(this.playerRoot.position, `-${damage}`);
        this.cameraShake = 0.16;
        if (!action?.isStatus) {
            this.playerHitReaction = 1;
            if (this.enemyRoot) {
                this.vEnemy.copy(this.enemyRoot.position).sub(this.playerRoot.position).setY(0);
                this.vRight.set(-this.playerFacing.z, 0, this.playerFacing.x);
                const side = this.vEnemy.dot(this.vRight);
                this.playerHitSide = Math.abs(side) > 0.05 ? Math.sign(side) : -1;
            }
        }
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
        this.updateImpactEffects(delta);
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
        this.hitboxPreview?.geometry?.dispose();
        this.hitboxPreview?.material?.dispose();
        this.hitboxPreview?.removeFromParent();
        this.attackArc?.geometry?.dispose();
        this.attackArc?.material?.dispose();
        this.attackArc?.removeFromParent();
        this.renderer?.dispose();
        this.renderer?.domElement?.remove();
        this.damagePopups.forEach(popup => popup.node.remove());
        this.damagePopups = [];
        this.impactEffects.forEach(effect => {
            effect.root.traverse(object => {
                object.geometry?.dispose?.();
                object.material?.dispose?.();
            });
            effect.root.removeFromParent();
        });
        this.impactEffects = [];
        this.session.reset();
    }
}
