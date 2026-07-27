const DEFAULT_CAPACITY = 10;

function clone(value) {
    if (typeof structuredClone === 'function') return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
}

export default class ChapterDemoSession {
    constructor(options = {}) {
        this.capacity = Math.max(1, Number(options.capacity) || DEFAULT_CAPACITY);
        this.reset();
    }

    reset() {
        this.roomId = 'south_gate_camp';
        this.checkpointId = 'south_gate_camp';
        this.flags = new Map();
        this.evidence = new Set();
        this.inventory = [];
        this.roomLoot = new Map();
        this.defeatedRooms = new Set();
        this.shortcutOpen = false;
        this.completed = false;
    }

    readFlag(id) {
        return Boolean(this.flags.get(id));
    }

    writeFlag(id, value = true) {
        this.flags.set(id, Boolean(value));
    }

    recordEvidence(id) {
        this.evidence.add(id);
        this.writeFlag(`demo.evidence.${id}`, true);
    }

    hasEvidence(id) {
        return this.evidence.has(id);
    }

    setCheckpoint(roomId) {
        this.checkpointId = roomId;
        this.writeFlag(`demo.checkpoint.${roomId}`, true);
    }

    markRoomDefeated(roomId) {
        this.defeatedRooms.add(roomId);
    }

    isRoomDefeated(roomId) {
        return this.defeatedRooms.has(roomId);
    }

    clearCombatResets() {
        this.defeatedRooms.clear();
        this.roomLoot.clear();
        this.writeFlag('demo.boss.defeated', false);
    }

    setRoomLoot(roomId, drops) {
        this.roomLoot.set(roomId, clone(drops || []));
    }

    getRoomLoot(roomId) {
        return this.roomLoot.get(roomId) || [];
    }

    removeRoomLoot(roomId, dropId) {
        const drops = this.getRoomLoot(roomId);
        this.roomLoot.set(roomId, drops.filter(drop => drop.id !== dropId));
    }

    get usedSlots() {
        return this.inventory.length;
    }

    get freeSlots() {
        return Math.max(0, this.capacity - this.usedSlots);
    }

    addItem(item, quantity = 1) {
        if (!item?.id) return { ok: false, reason: 'invalid-item' };
        const safeQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
        const stackable = item.stackable !== false
            && !['weapon', 'armor', 'accessory', 'equipment'].includes(item.type);
        const existing = stackable
            ? this.inventory.find(entry => entry.item.id === item.id)
            : null;

        if (existing) {
            existing.quantity += safeQuantity;
            return { ok: true, stored: 'stacked', entry: existing };
        }
        if (this.freeSlots <= 0) return { ok: false, reason: 'inventory-full' };

        const entry = { item: clone(item), quantity: safeQuantity };
        this.inventory.push(entry);
        return { ok: true, stored: 'new-slot', entry };
    }

    snapshot() {
        return Object.freeze({
            roomId: this.roomId,
            checkpointId: this.checkpointId,
            flags: Object.fromEntries(this.flags),
            evidence: [...this.evidence],
            inventory: clone(this.inventory),
            roomLoot: clone(Object.fromEntries(this.roomLoot)),
            shortcutOpen: this.shortcutOpen,
            completed: this.completed
        });
    }
}
