import * as THREE from '../../vendor/three/three.module.js';

const THEMES = Object.freeze({
    gate: { ground: 0x29302b, accent: 0x8f7441, fog: 0x151b18 },
    farmland: { ground: 0x303328, accent: 0x6e6238, fog: 0x19201b },
    boardwalk: { ground: 0x222a25, accent: 0x796045, fog: 0x111917 },
    campfire: { ground: 0x2c2c25, accent: 0xb16c35, fog: 0x171916 },
    snare: { ground: 0x252b27, accent: 0xa7a18a, fog: 0x101614 }
});

function material(color, roughness = 0.9, emissive = 0x000000) {
    return new THREE.MeshStandardMaterial({ color, roughness, emissive });
}

function mesh(geometry, mat, x, y, z, parent) {
    const object = new THREE.Mesh(geometry, mat);
    object.position.set(x, y, z);
    object.receiveShadow = true;
    parent.add(object);
    return object;
}

export default class DemoWorldBuilder {
    constructor(scene) {
        this.scene = scene;
        this.root = new THREE.Group();
        this.root.name = 'ChapterOneDemoRoom';
        this.scene.add(this.root);
        this.colliders = [];
        this.interactables = [];
        this.portals = [];
        this.animated = [];
        this.kit = null;
    }

    setKit(scene) {
        this.kit = scene;
    }

    cloneKit(name, position, rotationY = 0, scale = 1) {
        const source = this.kit?.getObjectByName(name);
        if (!source) return null;
        const clone = source.clone(true);
        clone.traverse(object => {
            if (!object.isMesh) return;
            object.geometry = object.geometry.clone();
            object.material = Array.isArray(object.material)
                ? object.material.map(entry => entry.clone())
                : object.material.clone();
            object.castShadow = true;
            object.receiveShadow = true;
        });
        clone.position.set(position.x, position.y || 0, position.z);
        clone.rotation.y = rotationY;
        clone.scale.setScalar(scale);
        this.root.add(clone);
        return clone;
    }

    clear() {
        this.root.traverse(object => {
            if (!object.isMesh) return;
            object.geometry?.dispose?.();
            if (Array.isArray(object.material)) object.material.forEach(entry => entry.dispose?.());
            else object.material?.dispose?.();
        });
        this.scene.remove(this.root);
        this.root = new THREE.Group();
        this.root.name = 'ChapterOneDemoRoom';
        this.scene.add(this.root);
        this.colliders = [];
        this.interactables = [];
        this.portals = [];
        this.animated = [];
    }

    build(room, session) {
        this.clear();
        const theme = THEMES[room.theme] || THEMES.gate;
        this.scene.background.setHex(theme.fog);
        this.scene.fog.color.setHex(theme.fog);

        const tileGeometry = new THREE.BoxGeometry(3.9, 0.18, 3.9);
        const tileMaterial = material(theme.ground, 0.98);
        const tiles = new THREE.InstancedMesh(tileGeometry, tileMaterial, 25);
        const transform = new THREE.Object3D();
        let index = 0;
        for (let z = -8; z <= 8; z += 4) {
            for (let x = -8; x <= 8; x += 4) {
                transform.position.set(x, -0.1, z);
                transform.rotation.y = ((index + room.id.length) % 4) * Math.PI / 2;
                transform.updateMatrix();
                tiles.setMatrixAt(index, transform.matrix);
                index += 1;
            }
        }
        tiles.receiveShadow = true;
        this.root.add(tiles);

        this.buildBounds(theme);
        this.buildTheme(room.theme, theme);

        if (room.checkpoint) this.createCampfire(room.id === 'south_gate_camp' ? 0 : -1.5, 0.4);
        const interactionResolved = room.interaction?.id === 'ambush_mantis_recovery'
            ? session.completed
            : room.interaction && session.hasEvidence(room.interaction.id);
        if (room.interaction
            && !interactionResolved
            && (!room.interaction.afterBoss || session.readFlag('demo.boss.defeated'))) {
            this.createInteraction(room.interaction);
        }
        for (const exit of room.exits) {
            if (exit.hiddenUntilShortcut && !session.shortcutOpen) continue;
            this.createPortal(exit);
        }
    }

    buildBounds(theme) {
        const wallMaterial = material(0x343a35, 0.96);
        const wallGeometryX = new THREE.BoxGeometry(4, 1.8, 0.55);
        const wallGeometryZ = new THREE.BoxGeometry(0.55, 1.8, 4);
        for (let value = -8; value <= 8; value += 4) {
            const north = mesh(wallGeometryX.clone(), wallMaterial.clone(), value, 0.85, -10, this.root);
            const south = mesh(wallGeometryX.clone(), wallMaterial.clone(), value, 0.85, 10, this.root);
            const west = mesh(wallGeometryZ.clone(), wallMaterial.clone(), -10, 0.85, value, this.root);
            const east = mesh(wallGeometryZ.clone(), wallMaterial.clone(), 10, 0.85, value, this.root);
            for (const wall of [north, south, west, east]) wall.castShadow = false;
        }
    }

    buildTheme(themeId, theme) {
        const wood = material(0x3f2d1d, 0.94);
        const stone = material(0x444944, 1);
        const accent = material(theme.accent, 0.75);
        const box = new THREE.BoxGeometry(1, 1, 1);

        const place = (x, z, sx, sy, sz, mat = stone, solid = true) => {
            const object = mesh(box.clone(), mat.clone(), x, sy / 2, z, this.root);
            object.scale.set(sx, sy, sz);
            object.castShadow = sy > 1.4;
            if (solid) this.colliders.push({ x, z, w: sx, d: sz });
            return object;
        };
        const kit = (name, x, z, rotation = 0, scale = 1) => (
            this.cloneKit(name, { x, y: 0, z }, rotation, scale)
        );

        if (themeId === 'farmland') {
            for (const x of [-6, -2, 2, 6]) {
                place(x, -1.5, 2.5, 0.25, 0.55, wood);
                place(x, 2.2, 2.5, 0.25, 0.55, wood);
            }
            place(-5.8, -6, 2.2, 1.3, 1.4, wood);
            kit('RockCluster', 5.8, -6.2, 0.4, 1.15);
            kit('WallStraight', -5.8, 6.6, 0, 0.85);
        } else if (themeId === 'boardwalk') {
            // The planks are walkable floor dressing, not seven overlapping walls.
            for (let x = -6; x <= 6; x += 2) place(x, 0, 1.75, 0.06, 3.2, wood, false);
            place(0, -4.8, 7.5, 1.1, 0.35, wood);
            kit('BrokenArch', 5.9, 5.4, -0.35, 0.88);
            kit('RockCluster', -5.8, -5.2, 0.8, 1.25);
        } else if (themeId === 'campfire') {
            place(-5.6, -3.8, 3.5, 1.7, 1.2, wood);
            place(5.4, 3.9, 2.4, 2.2, 1.1, stone);
            place(0.8, -1.4, 1.6, 0.35, 1.6, accent);
            kit('Pillar', 5.6, -4.8, 0.2, 0.85);
            kit('RockCluster', -5.5, 4.8, 0.3, 1.1);
        } else if (themeId === 'snare') {
            place(-5.2, -1.2, 0.45, 2.8, 5.5, wood);
            place(5.2, 1.2, 0.45, 2.8, 5.5, wood);
            for (const z of [-5, -2, 1, 4]) {
                const line = mesh(new THREE.CylinderGeometry(0.018, 0.018, 9, 6), accent.clone(), 0, 0.55, z, this.root);
                line.rotation.z = Math.PI / 2;
            }
            kit('BrokenArch', 0, -7.2, 0, 1.15);
            kit('Pillar', -6.8, 5.7, 0, 0.85);
            kit('Pillar', 6.8, 5.7, 0, 0.85);
        } else {
            place(-5.8, -4.5, 2.5, 2.3, 1, stone);
            place(5.8, -4.5, 2.5, 2.3, 1, stone);
            place(0, -6.2, 2.8, 1.4, 0.8, wood);
            kit('WallCorner', -6.5, -6.5, Math.PI / 2, 0.9);
            kit('BrokenArch', 0, -7.2, 0, 1);
            kit('RockCluster', 5.8, 4.8, 0.4, 1.05);
        }
    }

    createCampfire(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        const logMaterial = material(0x26150d, 0.96);
        for (const rotation of [-0.62, 0.62]) {
            const log = mesh(
                new THREE.CylinderGeometry(0.09, 0.11, 0.92, 7),
                logMaterial.clone(),
                0,
                0.13,
                0,
                group
            );
            log.rotation.z = Math.PI / 2;
            log.rotation.y = rotation;
        }
        const ember = mesh(
            new THREE.ConeGeometry(0.2, 0.5, 7),
            new THREE.MeshBasicMaterial({
                color: 0xff9a45,
                transparent: true,
                opacity: 0.78,
                depthWrite: false
            }),
            0,
            0.42,
            0,
            group
        );
        const light = new THREE.PointLight(0xff8738, 1.8, 5.5, 2);
        light.position.set(0, 0.9, 0);
        group.add(light);
        this.root.add(group);
        this.animated.push({ type: 'fire', object: ember, light });
    }

    createInteraction(config) {
        const marker = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.24, 0),
            new THREE.MeshStandardMaterial({
                color: 0xd7c178,
                emissive: 0x6d5522,
                roughness: 0.55
            })
        );
        marker.position.set(config.x, 0.55, config.z);
        marker.userData = { kind: 'evidence', config };
        marker.castShadow = true;
        this.root.add(marker);
        this.interactables.push(marker);
        this.animated.push({ type: 'hover', object: marker, baseY: marker.position.y });
    }

    createPortal(exit) {
        const marker = new THREE.Mesh(
            new THREE.TorusGeometry(0.5, 0.075, 8, 24),
            new THREE.MeshBasicMaterial({ color: 0x8fb9ad, transparent: true, opacity: 0.7 })
        );
        marker.position.set(exit.x, 0.6, exit.z);
        marker.rotation.x = Math.PI / 2;
        marker.userData = { kind: 'portal', exit };
        this.root.add(marker);
        this.interactables.push(marker);
        this.portals.push(marker);
        this.animated.push({ type: 'portal', object: marker });
    }

    createLoot(drop, position, slot) {
        const group = new THREE.Group();
        group.position.set(position.x + slot * 0.45, 0, position.z + slot * 0.2);
        const beam = mesh(
            new THREE.CylinderGeometry(0.035, 0.12, 2.8, 8),
            new THREE.MeshBasicMaterial({
                color: 0xd8bd69,
                transparent: true,
                opacity: 0.54,
                depthWrite: false
            }),
            0,
            1.45,
            0,
            group
        );
        const core = mesh(
            new THREE.OctahedronGeometry(0.18, 0),
            material(0xd8bd69, 0.5, 0x6f541a),
            0,
            0.28,
            0,
            group
        );
        group.userData = { kind: 'loot', drop };
        this.root.add(group);
        this.interactables.push(group);
        this.animated.push({ type: 'loot', object: group, beam, core });
        return group;
    }

    removeInteractable(object) {
        this.interactables = this.interactables.filter(entry => entry !== object);
        this.animated = this.animated.filter(entry => entry.object !== object);
        object.removeFromParent();
    }

    update(time) {
        for (const entry of this.animated) {
            if (entry.type === 'fire') {
                const pulse = 0.88 + Math.sin(time * 8.2) * 0.12;
                entry.object.scale.set(1, pulse, 1);
                entry.light.intensity = 2.5 + Math.sin(time * 6.6) * 0.35;
            } else if (entry.type === 'hover') {
                entry.object.position.y = entry.baseY + Math.sin(time * 2.4) * 0.12;
                entry.object.rotation.y = time * 0.7;
            } else if (entry.type === 'portal') {
                entry.object.rotation.z = time * 0.35;
            } else if (entry.type === 'loot') {
                entry.core.rotation.y = time * 1.2;
                entry.beam.material.opacity = 0.42 + Math.sin(time * 3.5) * 0.12;
            }
        }
    }

    nearestInteractable(position, radius = 2) {
        let nearest = null;
        let distance = radius;
        for (const object of this.interactables) {
            const value = object.position.distanceTo(position);
            if (value < distance) {
                nearest = object;
                distance = value;
            }
        }
        return nearest;
    }

    canMove(position, radius = 0.42) {
        if (Math.abs(position.x) > 9.25 || Math.abs(position.z) > 9.25) return false;
        return !this.colliders.some(box => {
            const closestX = THREE.MathUtils.clamp(position.x, box.x - box.w / 2, box.x + box.w / 2);
            const closestZ = THREE.MathUtils.clamp(position.z, box.z - box.d / 2, box.z + box.d / 2);
            const dx = position.x - closestX;
            const dz = position.z - closestZ;
            return dx * dx + dz * dz < radius * radius;
        });
    }

    destroy() {
        this.clear();
        this.scene.remove(this.root);
    }
}
