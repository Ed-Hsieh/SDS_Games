import { EquipmentDatabase } from '../data/Equipment.js';

const freezeAttack = attack => Object.freeze({
    ...attack,
    hitbox: Object.freeze({ ...attack.hitbox })
});

const freezeProfile = profile => Object.freeze({
    ...profile,
    lightCombo: Object.freeze(profile.lightCombo.map(freezeAttack)),
    heavy: freezeAttack(profile.heavy)
});

export const DemoWeaponForms = Object.freeze([
    'sword',
    'dagger',
    'heavy',
    'lance',
    'focus'
]);

export const DemoWeaponActionProfiles = Object.freeze({
    sword: freezeProfile({
        form: 'sword',
        label: '\u9577\u528d',
        item: EquipmentDatabase.slime_sword,
        lightCost: 16,
        heavyCost: 34,
        moveScale: 1,
        trailColor: 0xd8d2bb,
        lightCombo: [
            {
                id: 'sword-slash-left',
                duration: 0.56,
                activeStart: 0.28,
                activeEnd: 0.48,
                multiplier: 1,
                pose: 'sword-slash',
                direction: 1,
                hitbox: {
                    kind: 'arc',
                    reach: 2.45,
                    inner: 0.35,
                    halfAngle: 0.82,
                    height: 1.3
                }
            },
            {
                id: 'sword-slash-right',
                duration: 0.6,
                activeStart: 0.3,
                activeEnd: 0.52,
                multiplier: 1.15,
                pose: 'sword-slash',
                direction: -1,
                hitbox: {
                    kind: 'arc',
                    reach: 2.5,
                    inner: 0.3,
                    halfAngle: 0.86,
                    height: 1.3
                }
            },
            {
                id: 'sword-finisher',
                duration: 0.74,
                activeStart: 0.4,
                activeEnd: 0.61,
                multiplier: 1.4,
                pose: 'sword-finisher',
                direction: 1,
                hitbox: {
                    kind: 'arc',
                    reach: 2.65,
                    inner: 0.2,
                    halfAngle: 0.98,
                    height: 1.45
                }
            }
        ],
        heavy: {
            id: 'sword-heavy',
            duration: 0.9,
            activeStart: 0.43,
            activeEnd: 0.62,
            multiplier: 1.82,
            pose: 'sword-heavy',
            direction: 1,
            hitbox: {
                kind: 'arc',
                reach: 2.85,
                inner: 0.2,
                halfAngle: 0.72,
                height: 1.5
            }
        }
    }),
    dagger: freezeProfile({
        form: 'dagger',
        label: '\u5315\u9996',
        item: EquipmentDatabase.goblin_dagger,
        lightCost: 11,
        heavyCost: 25,
        moveScale: 1.05,
        trailColor: 0x9dd8d2,
        lightCombo: [
            {
                id: 'dagger-cut',
                duration: 0.34,
                activeStart: 0.22,
                activeEnd: 0.42,
                multiplier: 0.82,
                pose: 'dagger-cut',
                direction: 1,
                hitbox: {
                    kind: 'arc',
                    reach: 1.72,
                    inner: 0.2,
                    halfAngle: 0.66,
                    height: 1.15
                }
            },
            {
                id: 'dagger-backcut',
                duration: 0.36,
                activeStart: 0.2,
                activeEnd: 0.43,
                multiplier: 0.9,
                pose: 'dagger-cut',
                direction: -1,
                hitbox: {
                    kind: 'arc',
                    reach: 1.78,
                    inner: 0.15,
                    halfAngle: 0.72,
                    height: 1.15
                }
            },
            {
                id: 'dagger-lunge',
                duration: 0.48,
                activeStart: 0.28,
                activeEnd: 0.5,
                multiplier: 1.28,
                pose: 'dagger-thrust',
                direction: 1,
                hitbox: {
                    kind: 'thrust',
                    reach: 2.15,
                    start: 0.35,
                    width: 0.42,
                    height: 1.1
                }
            }
        ],
        heavy: {
            id: 'dagger-heavy',
            duration: 0.62,
            activeStart: 0.38,
            activeEnd: 0.56,
            multiplier: 1.65,
            pose: 'dagger-thrust',
            direction: 1,
            hitbox: {
                kind: 'thrust',
                reach: 2.35,
                start: 0.25,
                width: 0.46,
                height: 1.1
            }
        }
    }),
    heavy: freezeProfile({
        form: 'heavy',
        label: '\u91cd\u6b66\u5668',
        item: EquipmentDatabase.miners_pickhammer,
        lightCost: 24,
        heavyCost: 42,
        moveScale: 0.88,
        trailColor: 0xe0a767,
        lightCombo: [
            {
                id: 'heavy-sweep',
                duration: 0.86,
                activeStart: 0.46,
                activeEnd: 0.68,
                multiplier: 1.25,
                pose: 'heavy-sweep',
                direction: 1,
                hitbox: {
                    kind: 'arc',
                    reach: 2.85,
                    inner: 0.25,
                    halfAngle: 1.02,
                    height: 1.55
                }
            },
            {
                id: 'heavy-return',
                duration: 0.9,
                activeStart: 0.48,
                activeEnd: 0.7,
                multiplier: 1.4,
                pose: 'heavy-sweep',
                direction: -1,
                hitbox: {
                    kind: 'arc',
                    reach: 2.9,
                    inner: 0.25,
                    halfAngle: 1.04,
                    height: 1.55
                }
            }
        ],
        heavy: {
            id: 'heavy-overhead',
            duration: 1.18,
            activeStart: 0.55,
            activeEnd: 0.72,
            multiplier: 2.35,
            pose: 'heavy-overhead',
            direction: 1,
            hitbox: {
                kind: 'impact',
                reach: 2.45,
                radius: 1.15,
                height: 1.8
            }
        }
    }),
    lance: freezeProfile({
        form: 'lance',
        label: '\u9577\u69cd',
        item: EquipmentDatabase.wyvern_lance,
        lightCost: 15,
        heavyCost: 33,
        moveScale: 0.96,
        trailColor: 0xb4c7d9,
        lightCombo: [
            {
                id: 'lance-thrust',
                duration: 0.54,
                activeStart: 0.31,
                activeEnd: 0.5,
                multiplier: 1,
                pose: 'lance-thrust',
                direction: 1,
                hitbox: {
                    kind: 'thrust',
                    reach: 3.6,
                    start: 0.45,
                    width: 0.38,
                    height: 1.25
                }
            },
            {
                id: 'lance-retract-thrust',
                duration: 0.58,
                activeStart: 0.32,
                activeEnd: 0.52,
                multiplier: 1.12,
                pose: 'lance-thrust',
                direction: -1,
                hitbox: {
                    kind: 'thrust',
                    reach: 3.75,
                    start: 0.4,
                    width: 0.4,
                    height: 1.25
                }
            },
            {
                id: 'lance-sweep',
                duration: 0.76,
                activeStart: 0.42,
                activeEnd: 0.62,
                multiplier: 1.35,
                pose: 'lance-sweep',
                direction: 1,
                hitbox: {
                    kind: 'arc',
                    reach: 3.15,
                    inner: 0.7,
                    halfAngle: 0.84,
                    height: 1.35
                }
            }
        ],
        heavy: {
            id: 'lance-charge',
            duration: 0.94,
            activeStart: 0.46,
            activeEnd: 0.67,
            multiplier: 2.05,
            pose: 'lance-charge',
            direction: 1,
            hitbox: {
                kind: 'thrust',
                reach: 4.25,
                start: 0.35,
                width: 0.5,
                height: 1.3
            }
        }
    }),
    focus: freezeProfile({
        form: 'focus',
        label: '\u6cd5\u6756',
        item: EquipmentDatabase.forest_guardian_staff,
        lightCost: 18,
        heavyCost: 36,
        moveScale: 0.94,
        trailColor: 0x82c8a1,
        lightCombo: [
            {
                id: 'focus-bolt',
                duration: 0.68,
                activeStart: 0.46,
                activeEnd: 0.58,
                multiplier: 1,
                pose: 'focus-cast',
                direction: 1,
                hitbox: {
                    kind: 'projectile',
                    reach: 5.8,
                    start: 0.5,
                    width: 0.72,
                    height: 1.45
                }
            },
            {
                id: 'focus-crosscast',
                duration: 0.72,
                activeStart: 0.48,
                activeEnd: 0.61,
                multiplier: 1.12,
                pose: 'focus-cast',
                direction: -1,
                hitbox: {
                    kind: 'projectile',
                    reach: 6.1,
                    start: 0.5,
                    width: 0.78,
                    height: 1.45
                }
            }
        ],
        heavy: {
            id: 'focus-burst',
            duration: 1.06,
            activeStart: 0.58,
            activeEnd: 0.72,
            multiplier: 2.15,
            pose: 'focus-burst',
            direction: 1,
            hitbox: {
                kind: 'impact',
                reach: 3.3,
                radius: 1.45,
                height: 2
            }
        }
    })
});

export function getDemoWeaponProfile(form) {
    return DemoWeaponActionProfiles[form] || DemoWeaponActionProfiles.sword;
}

export function getAttackWindow(profile, type, comboIndex = 0) {
    if (type === 'heavy') return profile.heavy;
    return profile.lightCombo[Math.min(comboIndex, profile.lightCombo.length - 1)];
}

export function intersectsDemoHitbox(hitbox, target) {
    const distance = Number(target.distance) || 0;
    const forward = Number(target.forward) || 0;
    const lateral = Math.abs(Number(target.lateral) || 0);
    const radius = Math.max(0, Number(target.radius) || 0);

    if (hitbox.kind === 'arc') {
        if (distance < hitbox.inner - radius || distance > hitbox.reach + radius) {
            return false;
        }
        const angleCos = distance > 0.001 ? forward / distance : 1;
        return angleCos >= Math.cos(hitbox.halfAngle)
            - radius / Math.max(distance, 0.5);
    }
    if (hitbox.kind === 'thrust' || hitbox.kind === 'projectile') {
        return forward >= hitbox.start - radius
            && forward <= hitbox.reach + radius
            && lateral <= hitbox.width + radius;
    }
    if (hitbox.kind === 'impact') {
        const centerDistance = Math.abs(hitbox.reach - forward);
        return centerDistance <= hitbox.radius + radius
            && lateral <= hitbox.radius + radius;
    }
    return false;
}

export default {
    forms: DemoWeaponForms,
    profiles: DemoWeaponActionProfiles,
    getProfile: getDemoWeaponProfile,
    getAttackWindow,
    intersectsHitbox: intersectsDemoHitbox
};
