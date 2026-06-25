export function weightedPick(items, rng = Math.random) {
    const total = items.reduce((sum, item) => sum + (item.weight || 0), 0);
    if (total <= 0) return null;

    let roll = rng() * total;
    for (const item of items) {
        roll -= item.weight || 0;
        if (roll <= 0) return item;
    }

    return items[items.length - 1] || null;
}
