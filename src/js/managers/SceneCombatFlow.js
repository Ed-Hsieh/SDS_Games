export const SceneCombatPhase = Object.freeze({
    SCENE: 'scene',
    ENCOUNTER: 'encounter',
    COMBAT: 'combat',
    SETTLEMENT: 'settlement',
    SCENE_COMPLETE: 'scene_complete'
});

const ALLOWED_TRANSITIONS = Object.freeze({
    [SceneCombatPhase.SCENE]: new Set([SceneCombatPhase.ENCOUNTER]),
    [SceneCombatPhase.ENCOUNTER]: new Set([SceneCombatPhase.COMBAT, SceneCombatPhase.SCENE]),
    [SceneCombatPhase.COMBAT]: new Set([SceneCombatPhase.SETTLEMENT]),
    [SceneCombatPhase.SETTLEMENT]: new Set([SceneCombatPhase.SCENE, SceneCombatPhase.SCENE_COMPLETE]),
    [SceneCombatPhase.SCENE_COMPLETE]: new Set([SceneCombatPhase.SCENE])
});

export default class SceneCombatFlow {
    constructor(scene = {}) {
        this.listeners = new Set();
        this.reset(scene);
    }

    reset(scene = this.scene || {}) {
        this.scene = { ...scene };
        this.phase = SceneCombatPhase.SCENE;
        this.encounter = null;
        this.combatResult = null;
        this.settlement = null;
        this.emit('flow:reset');
    }

    subscribe(listener) {
        if (typeof listener !== 'function') return () => {};
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    getSnapshot() {
        return {
            phase: this.phase,
            scene: { ...this.scene },
            encounter: this.encounter,
            combatResult: this.combatResult,
            settlement: this.settlement
        };
    }

    transition(nextPhase, payload = {}) {
        if (!ALLOWED_TRANSITIONS[this.phase]?.has(nextPhase)) {
            throw new Error(`Invalid scene combat transition: ${this.phase} -> ${nextPhase}`);
        }
        const previousPhase = this.phase;
        this.phase = nextPhase;
        Object.assign(this, payload);
        this.emit('flow:transition', { previousPhase, nextPhase });
        return this.getSnapshot();
    }

    beginEncounter(encounter) {
        return this.transition(SceneCombatPhase.ENCOUNTER, {
            encounter,
            combatResult: null,
            settlement: null
        });
    }

    beginCombat() {
        return this.transition(SceneCombatPhase.COMBAT);
    }

    beginSettlement(combatResult, settlement = null) {
        return this.transition(SceneCombatPhase.SETTLEMENT, { combatResult, settlement });
    }

    finishSettlement({ sceneComplete = false, settlement = this.settlement } = {}) {
        return this.transition(
            sceneComplete ? SceneCombatPhase.SCENE_COMPLETE : SceneCombatPhase.SCENE,
            {
                encounter: sceneComplete ? this.encounter : null,
                settlement,
                combatResult: this.combatResult
            }
        );
    }

    resumeScene() {
        return this.transition(SceneCombatPhase.SCENE, {
            encounter: null,
            combatResult: null,
            settlement: null
        });
    }

    emit(type, detail = {}) {
        const event = { type, ...detail, snapshot: this.getSnapshot() };
        this.listeners.forEach(listener => listener(event));
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('sds:scene-combat-flow', { detail: event }));
        }
        return event;
    }
}
