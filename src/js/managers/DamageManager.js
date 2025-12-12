/**
 * DamageManager.js
 * 集中化的傷害計算邏輯：
 * - 將攻擊、暴擊、元素加成、穿甲、暈眩等計算集中到一個模組
 * - 自動正規化百分比欄位（支援 0.06 或 6 的表示法）
 */

import GameManager from './GameManager.js';
import { normalizeStatKey, normalizeEffectToStat } from '../models/AffixUtils.js';
import AffixConstants, { AffixStat } from '../models/AffixConstants.js';

function toPercentValue(raw) {
    const n = Number(raw || 0);
    if (n === 0) return 0;
    // 如果數值小於或等於 1，視為小數（例如 0.06 -> 6%）
    if (Math.abs(n) <= 1) return n * 100;
    // 否則視為已是百分比數值（例如 6 -> 6%）
    return n;
}

/**
 * 從裝備讀取指定屬性（支援 specialEffects, affixBonuses, affixes）並回傳百分比合計（unit: percent）
 */
function sumPercentFromEquipment(equipmentSlots, keys) {
    let total = 0;
    for (const item of equipmentSlots) {
        if (!item) continue;

        // specialEffects 支援多種命名
        if (item.specialEffects && Array.isArray(item.specialEffects)) {
            for (const eff of item.specialEffects) {
                if (!eff || !eff.type) continue;
                const mapped = normalizeEffectToStat(eff.type);
                const v = Number(eff.value || 0);
                if (mapped && keys.includes(mapped)) total += toPercentValue(v);
            }
        }
        // affixBonuses: iterate keys present and normalize
        if (item.affixBonuses) {
            for (const prop of Object.keys(item.affixBonuses)) {
                const norm = normalizeStatKey(prop);
                if (norm && keys.includes(norm)) total += toPercentValue(item.affixBonuses[prop]);
            }
        }

        if (item.affixes && Array.isArray(item.affixes)) {
            for (const a of item.affixes) {
                if (!a || !a.stats) continue;
                for (const prop of Object.keys(a.stats)) {
                    const norm = normalizeStatKey(prop);
                    if (norm && keys.includes(norm)) total += toPercentValue(a.stats[prop]);
                }
            }
        }
    }
    return total;
}

export function computeAttackDamage(player, hitType) {
    // 返回物件 { damage, isCrit, thunderBuffPercent }
    if (!player) return { damage: 0, isCrit: false, thunderBuffPercent: 0 };

    const playerAtk = player.getTotalAtk ? player.getTotalAtk() : (player.atk || 0);
    let damage = 0;
    let isCrit = false;

    if (hitType === 'miss') return { damage: 0, isCrit: false, thunderBuffPercent: 0 };

    if (hitType === 'crit') {
        damage = Math.floor(playerAtk * (player.getCritDamage ? player.getCritDamage() : 1.5));
        isCrit = true;
    } else {
        damage = Math.floor(playerAtk);
    }

    // 元素百分比（使用 canonical keys from AffixStat）
    const equipmentSlots = Object.values(player.equipment || {});
    const firePercent = sumPercentFromEquipment(equipmentSlots, [AffixStat.FIRE_DAMAGE]);
    const icePercent = sumPercentFromEquipment(equipmentSlots, [AffixStat.ICE_DAMAGE]);
    const thunderPercent = sumPercentFromEquipment(equipmentSlots, [AffixStat.THUNDER_DAMAGE]);
    const voidPercent = sumPercentFromEquipment(equipmentSlots, [AffixStat.VOID_DAMAGE]);

    const elementalPercentTotal = firePercent + icePercent + thunderPercent + voidPercent;
    if (elementalPercentTotal > 0 && damage > 0) {
        const extra = Math.floor(damage * (elementalPercentTotal / 100));
        damage += extra;
    }

    // thunder 作為短暫攻速 buff 的來源（回傳百分比，unit: percent）
    const thunderBuffPercent = thunderPercent;

    return { damage, isCrit, thunderBuffPercent };
}

export function computeMonsterAttackDamage(monster, player) {
    if (!monster || !player) return 1;
    const def = player.getTotalDef ? player.getTotalDef() : (player.def || 0);
    return Math.max(1, (monster.attack || 0) - def);
}

export default {
    computeAttackDamage,
    computeMonsterAttackDamage,
    // for tests
    _toPercentValue: toPercentValue,
    _sumPercentFromEquipment: sumPercentFromEquipment
};
