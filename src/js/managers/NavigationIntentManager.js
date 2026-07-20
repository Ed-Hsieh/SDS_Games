import GameManager from './GameManager.js';

class NavigationIntentManager {
    constructor() {
        this.reset();
        GameManager.registerSaveSystem('navigationIntents', this);
    }

    reset() {
        this.returnTownPlaceId = null;
        this.handbookRouteIntent = null;
    }

    setTownReturnPlace(placeId) {
        const normalizedPlaceId = String(placeId || '').trim();
        if (!normalizedPlaceId) return null;

        this.returnTownPlaceId = normalizedPlaceId;
        GameManager.markSaveDirty('town-return-place');
        return normalizedPlaceId;
    }

    consumeTownReturnPlace() {
        const placeId = typeof this.returnTownPlaceId === 'string'
            ? this.returnTownPlaceId.trim()
            : '';

        if (this.returnTownPlaceId !== null) {
            this.returnTownPlaceId = null;
            GameManager.markSaveDirty('town-return-place-consumed');
        }

        return placeId || null;
    }

    setHandbookRouteIntent(intent = {}) {
        const route = String(intent.route || '').trim();
        if (!route) return null;

        const normalizedIntent = {
            route,
            label: String(intent.label || ''),
            title: String(intent.title || ''),
            kind: String(intent.kind || 'quest'),
            reportToName: String(intent.reportToName || ''),
            npcId: String(intent.npcId || ''),
            description: String(intent.description || ''),
            createdAt: Date.now()
        };

        this.handbookRouteIntent = normalizedIntent;
        GameManager.markSaveDirty('handbook-route-intent');
        return normalizedIntent;
    }

    consumeHandbookRouteIntent() {
        const intent = this.handbookRouteIntent;

        if (intent !== null) {
            this.handbookRouteIntent = null;
            GameManager.markSaveDirty('handbook-route-intent-consumed');
        }

        return intent && typeof intent === 'object' ? { ...intent } : null;
    }

    serialize() {
        return {
            returnTownPlaceId: this.returnTownPlaceId,
            handbookRouteIntent: this.handbookRouteIntent ? { ...this.handbookRouteIntent } : null
        };
    }

    deserialize(data = {}) {
        const returnTownPlaceId = typeof data.returnTownPlaceId === 'string'
            ? data.returnTownPlaceId.trim()
            : '';
        this.returnTownPlaceId = returnTownPlaceId || null;
        this.handbookRouteIntent = data.handbookRouteIntent && typeof data.handbookRouteIntent === 'object'
            ? { ...data.handbookRouteIntent }
            : null;
    }
}

export const navigationIntentManager = new NavigationIntentManager();
