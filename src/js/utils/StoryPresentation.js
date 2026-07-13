/**
 * Presentation-only helpers shared by town and field story readers.
 */

export function mergeConsecutiveNarration(lines = []) {
    const merged = [];

    for (const line of lines) {
        const previous = merged.at(-1);
        const canContinue = Boolean(
            line?.isNarration
            && previous?.isNarration
            && (line.viewpoint || null) === (previous.viewpoint || null)
            && (line.background || null) === (previous.background || null)
            && (line.visualMode || null) === (previous.visualMode || null)
        );

        if (!canContinue) {
            merged.push({ ...line });
            continue;
        }

        previous.text = `${previous.text}\n\n${line.text}`;
    }

    return merged;
}
