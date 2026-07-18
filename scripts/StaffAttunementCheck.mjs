import assert from 'node:assert/strict';

import { AffixStat } from '../src/js/models/Enums.js';
import GameManager from '../src/js/managers/GameManager.js';
import { staffAttunementManager } from '../src/js/managers/StaffAttunementManager.js';

const originals = Object.fromEntries([
    'getFlag',
    'getItemCountAcrossStorage',
    'getGold',
    'removeGold',
    'removeMaterial',
    'addGold',
    'markSaveDirty',
    'notify'
].map(key => [key, GameManager[key]]));

let gold = 200;
const materials = new Map([
    ['poison_gland', 2],
    ['frost_crystal', 1]
]);

try {
    GameManager.getFlag = key => key === 'story.chapter' ? 1 : null;
    GameManager.getItemCountAcrossStorage = id => materials.get(id) || 0;
    GameManager.getGold = () => gold;
    GameManager.removeGold = amount => {
        if (gold < amount) return false;
        gold -= amount;
        return true;
    };
    GameManager.addGold = amount => { gold += amount; };
    GameManager.removeMaterial = (id, amount) => {
        const owned = materials.get(id) || 0;
        if (owned < amount) return false;
        materials.set(id, owned - amount);
        return true;
    };
    GameManager.markSaveDirty = () => {};
    GameManager.notify = () => {};

    const baselineFocus = {
        id: 'crafted_slime_series_staff',
        name: '青凝枝杖',
        weaponForm: 'focus',
        canElementAttune: true,
        specialEffects: []
    };

    const poisonPreview = staffAttunementManager.getElementPreview(baselineFocus, 'poison');
    assert.equal(poisonPreview.available, true, 'Chapter 1 poison attunement must be available');
    assert.equal(staffAttunementManager.getElementPreview(baselineFocus, 'ice').unlocked, false, 'Ice must remain Chapter 2 locked');

    const result = staffAttunementManager.attune(baselineFocus, 'poison');
    assert.equal(result.success, true);
    assert.equal(gold, 120);
    assert.equal(materials.get('poison_gland'), 1);
    assert.deepEqual(baselineFocus.elementAttunement, { element: 'poison', source: 'staff_attunement' });
    assert.equal(baselineFocus.specialEffects.length, 1);
    assert.equal(baselineFocus.specialEffects[0].type, AffixStat.POISON);

    const fixedFocus = {
        id: 'fixed_fire_focus',
        weaponForm: 'focus',
        canElementAttune: true,
        specialEffects: [{ type: AffixStat.FIRE, value: 10 }]
    };
    assert.equal(staffAttunementManager.canAttune(fixedFocus), false, 'Fixed-element focuses must reject ordinary attunement');

    console.log('Staff attunement check passed.');
} finally {
    for (const [key, value] of Object.entries(originals)) {
        GameManager[key] = value;
    }
}
