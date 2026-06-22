/**
 * EquipmentBalanceCheck.js
 * Audits equipment data against the shared tuning table.
 */

async function main() {
    const [
        equipmentModule,
        balanceModule,
        monsterModule,
        recipeModule,
        questModule,
        blueprintModule
    ] = await Promise.all([
        import('../src/js/data/Equipment.js'),
        import('../src/js/data/EquipmentBalance.js'),
        import('../src/js/data/Monsters.js'),
        import('../src/js/data/Recipes.js'),
        import('../src/js/data/Quests.js'),
        import('../src/js/data/BlueprintDrops.js')
    ]);

    const { EquipmentDatabase, SetDatabase } = equipmentModule;
    const { getEquipmentBalanceGrade, getLevelBand, RARITY_BALANCE, normalizeEquipmentKind } = balanceModule;
    const { MonsterDatabase, TowerMonsterData } = monsterModule;
    const { RecipeDatabase } = recipeModule;
    const { QuestDatabase } = questModule;
    const { BlueprintDropDatabase } = blueprintModule;

    const items = Object.values(EquipmentDatabase);
    const sourceAudit = buildEquipmentSourceAudit({
        EquipmentDatabase,
        MonsterDatabase,
        TowerMonsterData,
        RecipeDatabase,
        QuestDatabase,
        BlueprintDropDatabase,
        getLevelBand
    });
    const rows = items.map(item => {
        const grade = getEquipmentBalanceGrade(item);
        const stats = item.stats || {};
        const sourceInfo = sourceAudit.sources.get(item.id) || [];
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
            severity: grade.severity,
            setId: item.setId || null,
            setName: item.setId ? SetDatabase[item.setId]?.name || item.setId : '',
            sources: sourceInfo.length
        };
    });

    const issues = [];
    const notes = [...(sourceAudit.notes || [])];
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
            const isSetDeviation = Boolean(row.setId);
            const entry = {
                severity: isSetDeviation ? 'set-piece' : row.severity,
                id: row.id,
                message: isSetDeviation
                    ? `${row.name} 單件 ${row.grade}，但屬於「${row.setName}」套裝；需用套裝啟用後表現判斷，分數 ${row.score}/${row.target}，倍率 ${row.ratio}`
                    : `${row.name} ${row.grade}，分數 ${row.score}/${row.target}，倍率 ${row.ratio}`
            };
            if (isSetDeviation) {
                notes.push(entry);
            } else {
                issues.push(entry);
            }
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

    for (const issue of sourceAudit.issues) issues.push(issue);

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
    console.log(`Notes: ${notes.length} (${notes.length > 0 ? 'set-piece deviations intentionally reviewed separately' : 'none'})`);
    console.log('');
    printTable('Highest ratios', strongest);
    console.log('');
    printTable('Lowest ratios', weakest);

    console.log('');
    console.log('Source coverage');
    console.log(`Equipment with known source: ${sourceAudit.coverage.withSource}/${items.length}`);
    console.log(`Monster drop links: ${sourceAudit.coverage.monsterDropLinks}`);
    console.log(`Crafted result links: ${sourceAudit.coverage.recipeResultLinks}`);
    console.log(`Quest reward links: ${sourceAudit.coverage.questRewardLinks}`);
    console.log(`Blueprint source links: ${sourceAudit.coverage.blueprintSourceLinks}`);

    if (issues.length > 0) {
        console.log('');
        console.log('Issues');
        for (const issue of issues) {
            console.log(`- [${issue.severity}] ${issue.id}: ${issue.message}`);
        }
    }

    if (notes.length > 0) {
        console.log('');
        console.log('Notes');
        for (const note of notes) {
            console.log(`- [${note.severity}] ${note.id}: ${note.message}`);
        }
    }
}

function buildEquipmentSourceAudit(context) {
    const {
        EquipmentDatabase,
        MonsterDatabase,
        TowerMonsterData,
        RecipeDatabase,
        QuestDatabase,
        BlueprintDropDatabase,
        getLevelBand
    } = context;

    const allMonsters = {
        ...MonsterDatabase,
        ...TowerMonsterData
    };
    const sources = new Map();
    const issues = [];
    const notes = [];
    const monsterDropLinks = [];
    const recipeResultLinks = [];
    const questRewardLinks = [];
    const blueprintSourceLinks = [];
    const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

    const addSource = (itemId, source) => {
        if (!itemId || !EquipmentDatabase[itemId]) return;
        if (!sources.has(itemId)) sources.set(itemId, []);
        sources.get(itemId).push(source);
    };

    const addIssue = (severity, id, message) => {
        issues.push({ severity, id, message });
    };

    const addNote = (severity, id, message) => {
        notes.push({ severity, id, message });
    };

    const allQuestList = Object.values(QuestDatabase || {}).flatMap(group => Array.isArray(group) ? group : []);

    for (const [monsterId, monster] of Object.entries(allMonsters)) {
        for (const drop of monster.equipmentDrops || []) {
            if (!EquipmentDatabase[drop.equipmentId]) {
                addIssue('high', monsterId, `怪物裝備掉落指向不存在裝備：${drop.equipmentId}`);
                continue;
            }
            const source = {
                kind: 'monster',
                id: monsterId,
                name: monster.name,
                level: Number(monster.level) || 1,
                chance: drop.chance ?? null
            };
            addSource(drop.equipmentId, source);
            monsterDropLinks.push({ equipmentId: drop.equipmentId, ...source });
        }

        for (const drop of monster.drops || []) {
            if (!EquipmentDatabase[drop.itemId]) continue;
            const source = {
                kind: 'monster-item-drop',
                id: monsterId,
                name: monster.name,
                level: Number(monster.level) || 1,
                chance: drop.chance ?? null
            };
            addSource(drop.itemId, source);
            monsterDropLinks.push({ equipmentId: drop.itemId, ...source });
        }
    }

    for (const [recipeId, recipe] of Object.entries(RecipeDatabase || {})) {
        const resultId = recipe.result?.id;
        if (!resultId) continue;
        if (isEquipmentType(recipe.type)) {
            recipeResultLinks.push({
                equipmentId: resultId,
                kind: 'recipe',
                id: recipeId,
                name: recipe.name,
                rarity: recipe.rarity,
                level: recipe.result?.level || recipe.result?.requiredLevel || recipe.level || null
            });
        }
        if (EquipmentDatabase[resultId]) {
            const source = { kind: 'recipe', id: recipeId, name: recipe.name, rarity: recipe.rarity };
            addSource(resultId, source);
        }

        if (isEquipmentType(recipe.type) && !recipe.result?.level && !recipe.result?.requiredLevel) {
            addIssue('design', recipeId, `${recipe.name} 的製作結果缺少 level/requiredLevel，平衡工具會落到等級 1`);
        }
    }

    for (const quest of allQuestList) {
        for (const itemId of quest.rewards?.items || []) {
            if (!EquipmentDatabase[itemId]) continue;
            const source = { kind: 'quest', id: quest.id, name: quest.name, chapter: quest.chapter || null };
            addSource(itemId, source);
            questRewardLinks.push({ equipmentId: itemId, ...source });
        }
    }

    for (const [sourceKey, drops] of Object.entries(BlueprintDropDatabase || {})) {
        const monsterKey = sourceKey.includes(':') ? sourceKey.split(':').pop() : sourceKey;
        const monster = allMonsters[monsterKey];
        for (const drop of drops || []) {
            const recipe = RecipeDatabase[drop.recipeId];
            const resultId = recipe?.result?.id;
            if (!resultId || !isEquipmentType(recipe?.type)) continue;
            const source = {
                kind: 'blueprint-source',
                id: sourceKey,
                name: monster?.name || sourceKey,
                level: Number(monster?.level) || null,
                chance: drop.chance ?? null
            };
            if (EquipmentDatabase[resultId]) addSource(resultId, source);
            blueprintSourceLinks.push({ equipmentId: resultId, recipeId: drop.recipeId, ...source });
        }
    }

    for (const item of Object.values(EquipmentDatabase)) {
        const level = Number(item.level || item.requiredLevel) || 1;
        const band = getLevelBand(level);
        const rarityIndex = rarityOrder.indexOf(item.rarity);
        const expected = band.expectedRarities || [];
        const expectedIndexes = expected.map(rarity => rarityOrder.indexOf(rarity)).filter(index => index >= 0);

        if (expectedIndexes.length > 0 && rarityIndex >= 0) {
            const minExpected = Math.min(...expectedIndexes);
            const maxExpected = Math.max(...expectedIndexes);
            if (rarityIndex > maxExpected + 1) {
                const message = `${item.name} 在 ${band.label} 等級帶稀有度偏高：${item.rarity}`;
                if (hasBalanceIntent(item, 'early_chase_unique')) {
                    addNote('early-chase', item.id, `${message}；已標記為早期低機率追逐掉落。`);
                } else {
                    addIssue('design', item.id, message);
                }
            } else if (rarityIndex < minExpected - 1) {
                addIssue('design', item.id, `${item.name} 在 ${band.label} 等級帶稀有度偏低：${item.rarity}`);
            }
        }

        for (const sourceId of item.dropFrom || []) {
            const monster = allMonsters[sourceId];
            if (!monster) {
                addIssue('medium', item.id, `${item.name} 的 dropFrom 指向不存在怪物：${sourceId}`);
                continue;
            }

            const backLinked = (monster.equipmentDrops || []).some(drop => drop.equipmentId === item.id)
                || (monster.drops || []).some(drop => drop.itemId === item.id);
            if (!backLinked) {
                addIssue('design', item.id, `${item.name} 宣告由 ${monster.name} 掉落，但怪物掉落表未反向列出`);
            }

            addSource(item.id, {
                kind: 'dropFrom',
                id: sourceId,
                name: monster.name,
                level: Number(monster.level) || 1
            });
        }

        const itemSources = sources.get(item.id) || [];
        if (itemSources.length === 0) {
            addIssue('design', item.id, `${item.name} 目前沒有可追蹤來源，需確認是否為起始、商店或測試裝備`);
        }

        for (const source of itemSources.filter(source => Number.isFinite(source.level))) {
            const gap = level - source.level;
            if (gap >= 6) {
                addIssue('design', item.id, `${item.name} 等級 ${level} 可能太早從 Lv.${source.level} 的 ${source.name} 取得`);
            } else if (gap <= -8) {
                addIssue('design', item.id, `${item.name} 等級 ${level} 對 Lv.${source.level} 的 ${source.name} 來說可能太晚或太弱`);
            }
        }
    }

    return {
        sources,
        notes,
        issues,
        coverage: {
            withSource: Object.values(EquipmentDatabase).filter(item => (sources.get(item.id) || []).length > 0).length,
            monsterDropLinks: monsterDropLinks.length,
            recipeResultLinks: recipeResultLinks.length,
            questRewardLinks: questRewardLinks.length,
            blueprintSourceLinks: blueprintSourceLinks.length
        }
    };
}

function hasBalanceIntent(item, intent) {
    const intents = Array.isArray(item?.balanceIntent) ? item.balanceIntent : [item?.balanceIntent];
    return intents.includes(intent);
}

function isEquipmentType(type) {
    return ['weapon', 'armor', 'equipment', 'accessory'].includes(String(type || '').toLowerCase());
}

function printTable(title, rows) {
    console.log(title);
    console.log('id | lv | rarity | type | score/target | ratio | grade | set | sources');
    console.log('--- | ---: | --- | --- | ---: | ---: | --- | --- | ---:');
    for (const row of rows) {
        console.log(`${row.id} | ${row.level} | ${row.rarity} | ${row.type} | ${row.score}/${row.target} | ${row.ratio} | ${row.grade} | ${row.setName || '-'} | ${row.sources}`);
    }
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
