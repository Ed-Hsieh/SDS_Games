/**
 * EquipmentBalanceCheck.js
 * Audits equipment data against the shared tuning table.
 */

async function main() {
    const [
        equipmentModule,
        balanceModule
    ] = await Promise.all([
        import('../src/js/data/Equipment.js'),
        import('../src/js/data/EquipmentBalance.js')
    ]);

    const { EquipmentDatabase, SetDatabase } = equipmentModule;
    const { getEquipmentBalanceGrade, getLevelBand, RARITY_BALANCE, normalizeEquipmentKind } = balanceModule;

    const items = Object.values(EquipmentDatabase);
    const rows = items.map(item => {
        const grade = getEquipmentBalanceGrade(item);
        const stats = item.stats || {};
        return {
            id: item.id,
            name: item.name,
            type: normalizeEquipmentKind(item.type),
            level: Number(item.level || item.requiredLevel) || 1,
            band: getLevelBand(item.level || item.requiredLevel).label,
            rarity: item.rarity,
            atk: Number(item.attack ?? item.atk ?? stats.attack ?? stats.atk ?? 0) || 0,
            def: Number(item.defense ?? item.def ?? stats.defense ?? stats.def ?? 0) || 0,
            score: grade.score,
            target: grade.targetScore,
            ratio: grade.ratio,
            grade: grade.grade,
            severity: grade.severity
        };
    });

    const issues = [];
    const seenIds = new Set();

    for (const item of items) {
        if (!item.id) {
            issues.push({ severity: 'high', id: '(missing-id)', message: `${item.name || '(unnamed)'} 缺少 id` });
            continue;
        }

        if (seenIds.has(item.id)) {
            issues.push({ severity: 'high', id: item.id, message: `裝備 id 重複：${item.id}` });
        }
        seenIds.add(item.id);

        if (!RARITY_BALANCE[item.rarity]) {
            issues.push({ severity: 'high', id: item.id, message: `未知稀有度：${item.rarity}` });
        }

        if (!item.level && !item.requiredLevel) {
            issues.push({ severity: 'medium', id: item.id, message: '缺少 level/requiredLevel，會落到等級 1' });
        }

        if (!item.stats && (item.attack === undefined && item.defense === undefined && item.atk === undefined && item.def === undefined)) {
            issues.push({ severity: 'high', id: item.id, message: '缺少 stats 或基礎攻防欄位' });
        }
    }

    for (const row of rows) {
        if (row.severity !== 'normal') {
            issues.push({
                severity: row.severity,
                id: row.id,
                message: `${row.name} ${row.grade}，分數 ${row.score}/${row.target}，倍率 ${row.ratio}`
            });
        }
    }

    for (const setInfo of Object.values(SetDatabase)) {
        const missingPieces = (setInfo.pieces || []).filter(pieceId => !EquipmentDatabase[pieceId]);
        if (missingPieces.length > 0) {
            issues.push({
                severity: 'medium',
                id: setInfo.id,
                message: `${setInfo.name} 套裝缺少資料庫裝備：${missingPieces.join(', ')}`
            });
        }
    }

    const bySeverity = issues.reduce((acc, issue) => {
        acc[issue.severity] = (acc[issue.severity] || 0) + 1;
        return acc;
    }, {});

    const sortedRows = [...rows].sort((a, b) => b.ratio - a.ratio);
    const strongest = sortedRows.slice(0, 8);
    const weakest = sortedRows.slice(-8).reverse();

    console.log('Equipment balance audit');
    console.log(`Items: ${items.length}`);
    console.log(`Issues: ${issues.length} (${Object.entries(bySeverity).map(([k, v]) => `${k}:${v}`).join(', ') || 'none'})`);
    console.log('');
    printTable('Highest ratios', strongest);
    console.log('');
    printTable('Lowest ratios', weakest);

    if (issues.length > 0) {
        console.log('');
        console.log('Issues');
        for (const issue of issues) {
            console.log(`- [${issue.severity}] ${issue.id}: ${issue.message}`);
        }
    }
}

function printTable(title, rows) {
    console.log(title);
    console.log('id | lv | rarity | type | score/target | ratio | grade');
    console.log('--- | ---: | --- | --- | ---: | ---: | ---');
    for (const row of rows) {
        console.log(`${row.id} | ${row.level} | ${row.rarity} | ${row.type} | ${row.score}/${row.target} | ${row.ratio} | ${row.grade}`);
    }
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
