const freezeRoom = room => Object.freeze({
    ...room,
    spawn: Object.freeze(room.spawn),
    enemySpawn: room.enemySpawn ? Object.freeze(room.enemySpawn) : null,
    interaction: room.interaction ? Object.freeze(room.interaction) : null,
    exits: Object.freeze((room.exits || []).map(exit => Object.freeze(exit)))
});

export const ChapterOneDemoRooms = Object.freeze({
    south_gate_camp: freezeRoom({
        id: 'south_gate_camp',
        name: '南門外營火',
        sceneId: 'ch1_s05_south_gate_introduction',
        theme: 'gate',
        spawn: { x: 0, z: 5.5, yaw: 0 },
        checkpoint: true,
        exits: [
            { id: 'to_farmland', target: 'south_gate_farmland', x: 0, z: -8.2, label: '前往南門農田' }
        ]
    }),
    south_gate_farmland: freezeRoom({
        id: 'south_gate_farmland',
        name: '南門農田',
        sceneId: 'ch1_s06_three_landmarks',
        checkpointId: 'south_gate_farmland',
        theme: 'farmland',
        spawn: { x: 0, z: 7.2, yaw: 0 },
        monsterId: 'wild_wolf',
        enemySpawn: { x: 0.8, z: -2.8 },
        interaction: {
            id: 'south_gate_farmland',
            x: -2.5,
            z: -5.4,
            label: '調查田埂上的靴印',
            evidenceType: 'record'
        },
        exits: [
            { id: 'to_gate', target: 'south_gate_camp', x: 0, z: 8.4, label: '返回南門' },
            {
                id: 'to_boardwalk',
                target: 'hunter_boardwalk',
                x: 8.2,
                z: -2.5,
                label: '前往獵人棧道',
                requiresEvidence: 'south_gate_farmland'
            },
            {
                id: 'shortcut_to_campfire',
                target: 'old_campfire_site',
                x: -8.2,
                z: -4.2,
                label: '沿捷徑返回舊營火',
                requiresShortcut: true,
                hiddenUntilShortcut: true
            }
        ]
    }),
    hunter_boardwalk: freezeRoom({
        id: 'hunter_boardwalk',
        name: '獵人棧道',
        sceneId: 'ch1_s06_three_landmarks',
        checkpointId: 'hunter_boardwalk',
        theme: 'boardwalk',
        spawn: { x: -7.2, z: 0, yaw: Math.PI / 2 },
        monsterId: 'poison_spider',
        enemySpawn: { x: 0.5, z: -0.8 },
        interaction: {
            id: 'hunter_boardwalk',
            x: 5.4,
            z: -2.1,
            label: '查看護欄間的銀線',
            evidenceType: 'item'
        },
        exits: [
            { id: 'to_farmland', target: 'south_gate_farmland', x: -8.4, z: 0, label: '返回農田' },
            {
                id: 'to_campfire',
                target: 'old_campfire_site',
                x: 8.3,
                z: 2.8,
                label: '前往舊營地',
                requiresEvidence: 'hunter_boardwalk'
            }
        ]
    }),
    old_campfire_site: freezeRoom({
        id: 'old_campfire_site',
        name: '舊營火遺址',
        sceneId: 'ch1_s06_three_landmarks',
        checkpointId: 'old_campfire_site',
        theme: 'campfire',
        spawn: { x: -6.8, z: 4.8, yaw: Math.PI / 2 },
        checkpoint: true,
        interaction: {
            id: 'old_campfire_site',
            x: 1.1,
            z: -1.6,
            label: '檢查冷灰下的黑根',
            evidenceType: 'item'
        },
        exits: [
            { id: 'to_boardwalk', target: 'hunter_boardwalk', x: -8.2, z: 4.8, label: '返回棧道' },
            {
                id: 'shortcut',
                target: 'south_gate_farmland',
                x: -6.8,
                z: -6.8,
                label: '打開回南門的木門',
                opensShortcut: true
            },
            {
                id: 'to_mantis',
                target: 'silver_snare_pass',
                x: 7.2,
                z: -5.8,
                label: '前往銀線伏擊地',
                requiresAllEvidence: true
            }
        ]
    }),
    silver_snare_pass: freezeRoom({
        id: 'silver_snare_pass',
        name: '銀線伏擊地',
        sceneId: 'ch1_s07_silver_snare',
        theme: 'snare',
        spawn: { x: 0, z: 7.4, yaw: 0 },
        monsterId: 'ambush_mantis',
        enemySpawn: { x: 0, z: -3.5 },
        boss: true,
        interaction: {
            id: 'ambush_mantis_recovery',
            x: 0,
            z: -3.5,
            label: '查看伏獵者前肢的銀線',
            evidenceType: 'record',
            afterBoss: true
        },
        exits: [
            {
                id: 'return_town',
                target: 'town_return',
                x: 0,
                z: 8.4,
                label: '返回城鎮',
                requiresBoss: true
            }
        ]
    })
});

export const ChapterOneEvidenceIds = Object.freeze([
    'south_gate_farmland',
    'hunter_boardwalk',
    'old_campfire_site'
]);

export function getChapterOneDemoRoom(roomId) {
    return ChapterOneDemoRooms[roomId] || null;
}

export function isExitAvailable(exit, session) {
    if (exit.requiresEvidence && !session.hasEvidence(exit.requiresEvidence)) return false;
    if (exit.requiresShortcut && !session.shortcutOpen) return false;
    if (exit.requiresAllEvidence
        && !ChapterOneEvidenceIds.every(id => session.hasEvidence(id))) return false;
    if (exit.requiresBoss && !session.readFlag('demo.boss.defeated')) return false;
    return true;
}
