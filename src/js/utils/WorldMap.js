/**
 * WorldMap.js
 * Handles map generation, movement, monster encounters, and map events.
 */
import GameManager from '../managers/GameManager.js';
import EventManager, { eventManager } from '../managers/EventManager.js';
import MonsterManager from '../managers/MonsterManager.js';
import { questManager, QuestStatus } from '../managers/QuestManager.js';
import { BossMonsterIds } from '../data/Monsters.js';
import { DungeonEntranceConfig } from '../managers/DungeonManager.js';
import { getLandmark, getWorldEncounterProfile, getWorldLandmarks } from '../data/WorldStories.js';
import { worldStoryManager } from '../managers/WorldStoryManager.js';

const ManualTriggerBossIds = new Set(['ambush_mantis', 'forest_guardian', 'blood_moon_stag']);
const SlimeQuestId = 'main_002';

const StaticDungeonPlacements = {
    cave: { x: 7, y: 5 },
    jungle: { x: -25, y: 4 },
    ruins: { x: 14, y: -18 },
    snow: { x: 7, y: -24 },
    hell: { x: 27, y: 23 }
};

const StaticRiftPlacements = {
    low: { x: 6, y: -5 },
    medium: { x: 15, y: 10 },
    high: { x: -19, y: -15 },
    death: { x: 26, y: 20 }
};

function normalizePlacementZones(zones = []) {
    return zones.flatMap(zone => zone === 'boss' ? ['death'] : [zone]);
}

// NOTE: DungeonEntranceConfig 已移至 managers/DungeonManager.js
// 這裡重新導出以保持向後相容
export { DungeonEntranceConfig };

export class Monster {
    constructor(template) {
        this.id = template.id;
        this.name = template.name;
        this.icon = template.icon;
        this.level = template.level;
        this.hp = template.hp;
        this.maxHp = template.maxHp;
        this.attack = template.attack;
        this.defense = template.defense;
        this.exp = template.exp || 0;
        this.gold = template.gold || 0;
        this.drops = template.drops || [];
        this.equipmentDrops = template.equipmentDrops || [];
        this.element = template.element || null;
        this.type = template.type || 'normal';
        this.zoneId = template.zoneId || template.zone || null;
    }
    
    getDrops() {
        // 使用 DropManager 處理掉落
        // 這裡只返回基本金幣，物品掉落由 DropManager.calculateDrops 處理
        return { 
            items: [], 
            gold: this.gold 
        };
    }
    
    takeDamage(damage, defenseOverride) {
        const def = (typeof defenseOverride === 'number') ? defenseOverride : this.defense;
        const actualDamage = Math.max(1, damage - def);
        this.hp = Math.max(0, this.hp - actualDamage);
        return actualDamage;
    }
    
    isDead() {
        return this.hp <= 0;
    }
}

export default class WorldMap {
    constructor(player, gridSize = 60, rows = 20, cols = 30, screenWidth = 1000, screenHeight = 600) {
        this.player = player;
        this.gridSize = gridSize;
        this.rows = rows;
        this.cols = cols;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        // 每向外一個圓環增加的格數（固定為 10）
        this.ringIncrement = 10;
        // 確保地圖尺寸至少能容納三個向外圈（low/medium/high）
        const highRadius = this.ringIncrement * 3;
        const minSize = highRadius * 2 + 1;
        if (this.rows < minSize) this.rows = minSize;
        if (this.cols < minSize) this.cols = minSize;

        this.mapWidth = this.cols * gridSize;
        this.mapHeight = this.rows * gridSize;
        
        this.playerPos = { x: Math.floor(this.cols / 2), y: Math.floor(this.rows / 2) };
        
        // 玩家出生在家的位置（由 generateMap 設定）
        // homePos 在 generateMap 中被設定
        
        this.cameraOffsetX = 0;
        this.cameraOffsetY = 0;
        this.currentMonster = null;
        this.currentEvent = null;
        this.currentLandmark = null;
        this.currentDungeon = null; // 新增：當前副本入口
        this.travelStep = Number(GameManager.getFlag('map.travelStep')) || 0;
        this.hasLeftHome = false; // 新增：玩家是否已經離開過家（用於判斷是否觸發回家事件）
        this.currentRift = null; // 當前互動的裂縫
        this.rifts = [];
        this.landmarks = [];
        this.bossSites = [];
        this.exploredCells = new Set();
        // 記錄已解鎖的區域（玩家抵達過即視為解鎖）
        this.unlockedZones = new Set(['low']);

        // 嘗試從 GameManager 載入持久化的地圖狀態（rifts / unlockedZones）
        try {
            const persisted = GameManager.state?.mapState;
            if (persisted) {
                if (Array.isArray(persisted.unlockedZones)) {
                    this.unlockedZones = new Set(persisted.unlockedZones);
                }
                // 暫存已儲存的 rifts 供 generateMap 使用
                if (Array.isArray(persisted.rifts)) {
                    this._persistedRifts = persisted.rifts.slice();
                }
                if (Array.isArray(persisted.landmarks)) {
                    this._persistedLandmarks = persisted.landmarks.slice();
                }
                if (Array.isArray(persisted.exploredCells)) {
                    this.exploredCells = new Set(persisted.exploredCells);
                }
            }
        } catch (e) {
            console.warn('無法讀取 GameManager mapState:', e);
        }
        this.mapData = this.generateMap();
        this.revealAroundPlayer(1, { save: false });
        this._saveMapState();
        this.updateCamera();
    }

    generateMap() {
        this.bossSites = [];
        // 使用 ringIncrement 決定各圈半徑
        const lowRadius = this.ringIncrement * 1;
        const mediumRadius = this.ringIncrement * 2;
        const highRadius = this.ringIncrement * 3;
        const lowMaxSq = lowRadius * lowRadius;
        const mediumMaxSq = mediumRadius * mediumRadius;
        const highMaxSq = highRadius * highRadius;

        const rows = this.rows;
        const cols = this.cols;
        const px = this.playerPos.x;
        const py = this.playerPos.y;

        // 準備資料與各 zone 的候選清單（用於放置副本和 BOSS）
        const data = new Array(rows);
        const zoneCandidates = { low: [], medium: [], high: [], death: [] };

        for (let r = 0; r < rows; r++) {
            const row = new Array(cols);
            for (let c = 0; c < cols; c++) {
                const dx = c - px;
                const dy = r - py;
                const distanceSq = dx * dx + dy * dy;

                let zone;
                if (distanceSq < lowMaxSq) zone = 'low';
                else if (distanceSq < mediumMaxSq) zone = 'medium';
                else if (distanceSq < highMaxSq) zone = 'high';
                else zone = 'death';

                const cell = { type: 'empty', zone };
                row[c] = cell;

                // 若不在玩家起點附近，加入 zone 候選（供副本放置）
                if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
                    zoneCandidates[zone].push({ r, c });
                }
            }
            data[r] = row;
        }

        // 生成副本入口（每種副本只生成一個）
        this._placeLandmarks(data, zoneCandidates);

        const dungeonTypes = Object.keys(DungeonEntranceConfig);
        for (const dungeonType of dungeonTypes) {
            const config = DungeonEntranceConfig[dungeonType];
            const placementZones = normalizePlacementZones(config.zones || []);
            const anchor = this.homePos || this.playerPos;
            const offset = StaticDungeonPlacements[dungeonType] || { x: 0, y: 0 };
            const targetPos = {
                x: anchor.x + offset.x,
                y: anchor.y + offset.y
            };
            const cellPos = this._findNearestEmptyCell(data, placementZones, targetPos, { searchRadius: 10 });

            if (cellPos) {
                const target = data[cellPos.r][cellPos.c];
                target.type = 'dungeon';
                target.dungeonType = dungeonType;
                target.dungeonData = config;
            }
        }

        // 生成 BOSS（每種 BOSS 只生成一個），依照怪物等級優先放置到相對應區域
        // level -> zone 映射，參考 data 等級群組
        function zonesFromLevel(level) {
            if (typeof level !== 'number') return ['medium'];
            if (level <= 5) return ['low'];
            if (level <= 12) return ['medium'];
            if (level <= 20) return ['high'];
            return ['death'];
        }

        const allBossIds = Array.isArray(BossMonsterIds) ? BossMonsterIds.slice() : [];
        const allZonesOrder = ['low', 'medium', 'high', 'death'];

        for (const bossId of allBossIds) {
            if (ManualTriggerBossIds.has(bossId)) continue;

            const bossTemplate = MonsterManager.getMonster ? MonsterManager.getMonster(bossId) : null;
            if (!bossTemplate) continue;

            const preferred = zonesFromLevel(bossTemplate.level || 0);
            // 建立以 preferred 為首的 zone 排序
            const orderedZones = [];
            for (const z of preferred) orderedZones.push(z);
            for (const z of allZonesOrder) if (!orderedZones.includes(z)) orderedZones.push(z);

            let placed = false;
            for (const z of orderedZones) {
                const list = zoneCandidates[z] || [];
                const candidates = [];
                for (let i = 0; i < list.length; i++) {
                    const pos = list[i];
                    const cell = data[pos.r][pos.c];
                    if (cell.type === 'empty') candidates.push(pos);
                }

                if (candidates.length > 0) {
                    const idx = Math.floor(Math.random() * candidates.length);
                    const pos = candidates[idx];
                    const target = data[pos.r][pos.c];
                    target.bossSiteId = bossTemplate.id;
                    target.bossSiteRank = bossTemplate.type || 'boss';
                    this.bossSites.push({ x: pos.c, y: pos.r, bossId: bossTemplate.id });
                    placed = true;
                    break;
                }
            }
            // 若所有區域都沒有空位則跳過（通常不會發生，除非地圖太小）
            if (!placed) {
                // do nothing
            }
        }

        // Regular monsters and random events are no longer exposed as fixed map cells.
        // The map shows terrain objects; encounters are rolled as the player explores.
        
        // 設置出生點為「家」
        data[this.playerPos.y][this.playerPos.x] = { 
            type: 'home', 
            zone: 'low',
            homeData: {
                name: '溫暖的家',
                icon: '🏠',
                description: '回到大廳並完全恢復所有狀態'
            }
        };
        
        // 記錄家的位置（玩家出生點）
        this.homePos = { x: this.playerPos.x, y: this.playerPos.y };

        // 生成裂縫（每個 Layer 一個），避免覆蓋副本或出生點
        this._generateRifts(data);
        this._saveMapState();
        
        return data;
    }

    _placeLandmarks(data, zoneCandidates) {
        this.landmarks = [];

        const placedIds = new Set();
        const landmarks = getWorldLandmarks();
        const hasFixedPlacement = landmark => Number.isFinite(landmark?.mapOffset?.x)
            && Number.isFinite(landmark?.mapOffset?.y);
        const isAllowedZone = (landmark, cell) => {
            const zones = landmark.zones || ['low'];
            return zones.includes(cell?.zone);
        };
        const canPlace = (landmark, pos) => {
            if (!landmark || !pos) return false;
            if (pos.x < 0 || pos.x >= this.cols || pos.y < 0 || pos.y >= this.rows) return false;
            const cell = data[pos.y]?.[pos.x];
            return Boolean(cell && cell.type === 'empty' && isAllowedZone(landmark, cell));
        };
        const findNearestPlacement = (landmark, target) => {
            if (canPlace(landmark, target)) return target;

            const searchRadius = Math.max(1, Number(landmark.mapOffset?.searchRadius) || 5);
            for (let radius = 1; radius <= searchRadius; radius += 1) {
                const candidates = [];
                for (let dy = -radius; dy <= radius; dy += 1) {
                    for (let dx = -radius; dx <= radius; dx += 1) {
                        if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius) continue;
                        const pos = { x: target.x + dx, y: target.y + dy };
                        if (canPlace(landmark, pos)) candidates.push(pos);
                    }
                }
                if (candidates.length > 0) {
                    candidates.sort((a, b) => {
                        const da = Math.abs(a.x - target.x) + Math.abs(a.y - target.y);
                        const db = Math.abs(b.x - target.x) + Math.abs(b.y - target.y);
                        return da - db || a.y - b.y || a.x - b.x;
                    });
                    return candidates[0];
                }
            }

            return null;
        };
        const getFixedPosition = (landmark) => {
            if (!hasFixedPlacement(landmark)) return null;
            const anchor = this.homePos || this.playerPos || {
                x: Math.floor(this.cols / 2),
                y: Math.floor(this.rows / 2)
            };
            return {
                x: anchor.x + landmark.mapOffset.x,
                y: anchor.y + landmark.mapOffset.y
            };
        };
        const place = (landmark, pos) => {
            if (!landmark || !pos) return false;
            if (pos.x < 0 || pos.x >= this.cols || pos.y < 0 || pos.y >= this.rows) return false;
            const cell = data[pos.y]?.[pos.x];
            if (!cell || cell.type !== 'empty' || !isAllowedZone(landmark, cell)) return false;

            cell.type = 'landmark';
            cell.landmarkId = landmark.id;
            cell.landmarkData = landmark;
            this.landmarks.push({ x: pos.x, y: pos.y, landmarkId: landmark.id });
            placedIds.add(landmark.id);
            return true;
        };

        for (const landmark of landmarks) {
            if (!hasFixedPlacement(landmark)) continue;
            const target = getFixedPosition(landmark);
            const pos = findNearestPlacement(landmark, target);
            if (pos) place(landmark, pos);
        }

        if (Array.isArray(this._persistedLandmarks) && this._persistedLandmarks.length > 0) {
            for (const saved of this._persistedLandmarks) {
                const landmark = getLandmark(saved.landmarkId);
                if (landmark && !placedIds.has(landmark.id) && !hasFixedPlacement(landmark)) {
                    place(landmark, saved);
                }
            }
        }

        for (const landmark of landmarks) {
            if (placedIds.has(landmark.id)) continue;

            const validCells = [];
            for (const zone of landmark.zones || ['low']) {
                for (const pos of zoneCandidates[zone] || []) {
                    const cell = data[pos.r]?.[pos.c];
                    if (cell?.type === 'empty') validCells.push(pos);
                }
            }

            if (validCells.length === 0) continue;
            const chosen = validCells[Math.floor(Math.random() * validCells.length)];
            place(landmark, { x: chosen.c, y: chosen.r });
        }
    }

    _findNearestEmptyCell(data, zones = [], target = {}, options = {}) {
        const allowedZones = new Set(normalizePlacementZones(zones.length ? zones : ['low']));
        const searchRadius = Math.max(1, Number(options.searchRadius) || 8);
        const minHomeDistance = Math.max(0, Number(options.minHomeDistance) || 3);
        const anchor = this.homePos || this.playerPos || { x: Math.floor(this.cols / 2), y: Math.floor(this.rows / 2) };
        const canUse = (x, y) => {
            if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return false;
            const cell = data[y]?.[x];
            if (!cell || cell.type !== 'empty' || cell.bossSiteId) return false;
            if (!allowedZones.has(cell.zone)) return false;
            const dx = x - anchor.x;
            const dy = y - anchor.y;
            return Math.max(Math.abs(dx), Math.abs(dy)) > minHomeDistance;
        };

        const targetX = Math.max(0, Math.min(this.cols - 1, Math.round(Number(target.x) || anchor.x)));
        const targetY = Math.max(0, Math.min(this.rows - 1, Math.round(Number(target.y) || anchor.y)));

        if (canUse(targetX, targetY)) {
            return { r: targetY, c: targetX };
        }

        for (let radius = 1; radius <= searchRadius; radius += 1) {
            const candidates = [];
            for (let dy = -radius; dy <= radius; dy += 1) {
                for (let dx = -radius; dx <= radius; dx += 1) {
                    if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius) continue;
                    const x = targetX + dx;
                    const y = targetY + dy;
                    if (canUse(x, y)) candidates.push({ r: y, c: x });
                }
            }

            if (candidates.length > 0) {
                candidates.sort((a, b) => {
                    const da = Math.hypot(a.c - targetX, a.r - targetY);
                    const db = Math.hypot(b.c - targetX, b.r - targetY);
                    return da - db || a.r - b.r || a.c - b.c;
                });
                return candidates[0];
            }
        }

        const fallback = [];
        for (let r = 0; r < this.rows; r += 1) {
            for (let c = 0; c < this.cols; c += 1) {
                if (canUse(c, r)) fallback.push({ r, c });
            }
        }
        fallback.sort((a, b) => {
            const da = Math.hypot(a.c - targetX, a.r - targetY);
            const db = Math.hypot(b.c - targetX, b.r - targetY);
            return da - db || a.r - b.r || a.c - b.c;
        });
        return fallback[0] || null;
    }

    _generateRifts(data) {
        this.rifts = [];
        const zoneLayers = ['low', 'medium', 'high', 'death'];

        for (const zone of zoneLayers) {
            const offset = StaticRiftPlacements[zone] || { x: 0, y: 0 };
            const anchor = this.homePos || this.playerPos;
            const targetPos = {
                x: anchor.x + offset.x,
                y: anchor.y + offset.y
            };
            const cell = this._findNearestEmptyCell(data, [zone], targetPos, { searchRadius: 10 });
            if (!cell) continue;
            data[cell.r][cell.c].type = 'rift';
            data[cell.r][cell.c].riftData = { zone };
            this.rifts.push({ x: cell.c, y: cell.r, zone });
        }

        this._saveMapState();
    }

    _saveMapState() {
        try {
            GameManager.state.mapState = {
                rifts: this.rifts.slice(),
                landmarks: this.landmarks.slice(),
                unlockedZones: Array.from(this.unlockedZones),
                exploredCells: Array.from(this.exploredCells)
            };
            GameManager.notify('mapState');
        } catch (e) {
            console.warn('無法儲存 mapState 到 GameManager:', e);
        }
    }

    _cellKey(x, y) {
        return `${x},${y}`;
    }

    isCellExplored(x, y) {
        return this.exploredCells.has(this._cellKey(x, y));
    }

    revealAroundPlayer(radius = 1, options = {}) {
        const { save = true } = options;
        let changed = false;
        const centerX = this.playerPos.x;
        const centerY = this.playerPos.y;
        for (let dy = -radius; dy <= radius; dy += 1) {
            for (let dx = -radius; dx <= radius; dx += 1) {
                const x = centerX + dx;
                const y = centerY + dy;
                if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) continue;
                const key = this._cellKey(x, y);
                if (this.exploredCells.has(key)) continue;
                this.exploredCells.add(key);
                changed = true;
            }
        }
        if (changed && save) {
            this._saveMapState();
            GameManager.markSaveDirty?.('map-explored-cells');
        }
        return changed;
    }

    updateCamera() {
        let x = this.playerPos.x * this.gridSize - this.screenWidth / 2 + this.gridSize / 2;
        let y = this.playerPos.y * this.gridSize - this.screenHeight / 2 + this.gridSize / 2;
        this.cameraOffsetX = Math.max(0, Math.min(x, this.mapWidth - this.screenWidth));
        this.cameraOffsetY = Math.max(0, Math.min(y, this.mapHeight - this.screenHeight));
    }

    isSlimeQuestActive() {
        try {
            return questManager.getQuestState(SlimeQuestId)?.status === QuestStatus.ACTIVE;
        } catch (error) {
            return false;
        }
    }

    isQuestActiveForEncounter(questIds = []) {
        return questIds.some(questId => {
            try {
                return questManager.getQuestState(questId)?.status === QuestStatus.ACTIVE;
            } catch (error) {
                return false;
            }
        });
    }

    getLandmarkEncounterProfile(zone, context = {}) {
        const x = Number.isFinite(context.x) ? context.x : this.playerPos.x;
        const y = Number.isFinite(context.y) ? context.y : this.playerPos.y;
        const matches = [];

        for (const landmark of getWorldLandmarks()) {
            if (!landmark?.encounterProfileId) continue;

            const allowedZones = Array.isArray(landmark.encounterZones)
                ? landmark.encounterZones
                : landmark.zones;
            if (Array.isArray(allowedZones) && allowedZones.length > 0 && !allowedZones.includes(zone)) {
                continue;
            }

            const site = this.findLandmarkSite?.(landmark.id);
            if (!site) continue;

            const radius = Number(landmark.encounterRadius) || 4;
            const distance = Math.abs(x - site.x) + Math.abs(y - site.y);
            if (distance > radius) continue;

            const focusProfile = getWorldEncounterProfile(landmark.focusEncounterProfileId);
            const focusQuestIds = Array.isArray(landmark.focusQuestIds)
                ? landmark.focusQuestIds
                : (focusProfile?.questIds || []);
            const isFocus = Boolean(landmark.focusEncounterProfileId)
                && this.isQuestActiveForEncounter(focusQuestIds);

            matches.push({
                profileId: isFocus ? landmark.focusEncounterProfileId : landmark.encounterProfileId,
                distance,
                isFocus
            });
        }

        matches.sort((a, b) => {
            if (a.isFocus !== b.isFocus) return a.isFocus ? -1 : 1;
            return a.distance - b.distance;
        });

        return matches[0]?.profileId || null;
    }

    getLocalEncounterProfile(zone, context = {}) {
        const landmarkProfileId = this.getLandmarkEncounterProfile(zone, context);
        if (landmarkProfileId) return landmarkProfileId;

        if (zone !== 'low') return null;

        const x = Number.isFinite(context.x) ? context.x : this.playerPos.x;
        const y = Number.isFinite(context.y) ? context.y : this.playerPos.y;
        const home = this.homePos || {
            x: Math.floor(this.cols / 2),
            y: Math.floor(this.rows / 2)
        };
        const isSouthGateFarmland = y >= home.y + 2 && Math.abs(x - home.x) <= this.ringIncrement;

        if (!isSouthGateFarmland) return null;
        return this.isSlimeQuestActive() ? 'south_gate_farmland_focus' : 'south_gate_farmland';
    }

    pickWeightedMonster(profileId) {
        const entries = getWorldEncounterProfile(profileId)?.entries;
        if (!Array.isArray(entries) || entries.length === 0) return null;

        const totalWeight = entries.reduce((sum, entry) => sum + Math.max(0, Number(entry.weight) || 0), 0);
        if (totalWeight <= 0) return null;

        let roll = Math.random() * totalWeight;
        for (const entry of entries) {
            roll -= Math.max(0, Number(entry.weight) || 0);
            if (roll <= 0) {
                return MonsterManager.getMonster?.(entry.id) || null;
            }
        }

        return MonsterManager.getMonster?.(entries[0].id) || null;
    }

    getSlimeQuestPityFlag() {
        return 'encounter.pity.main_002.slime';
    }

    setSlimeQuestPity(count) {
        const flag = this.getSlimeQuestPityFlag();
        const nextCount = Math.max(0, Number(count) || 0);
        const currentCount = Number(GameManager.getFlag(flag)) || 0;
        if (currentCount !== nextCount) {
            GameManager.setFlag(flag, nextCount);
        }
    }

    selectMonsterForEncounter(zone, context = {}) {
        const profileId = this.getLocalEncounterProfile(zone, context);
        const slimeQuestActive = this.isSlimeQuestActive();

        if (profileId) {
            const pityFlag = this.getSlimeQuestPityFlag();
            const pityCount = Number(GameManager.getFlag(pityFlag)) || 0;
            const forceSlime = slimeQuestActive && profileId === 'south_gate_farmland_focus' && pityCount >= 2;
            const raw = forceSlime
                ? MonsterManager.getMonster?.('slime')
                : this.pickWeightedMonster(profileId);

            if (raw) {
                if (slimeQuestActive && profileId === 'south_gate_farmland_focus') {
                    this.setSlimeQuestPity(raw.id === 'slime' ? 0 : pityCount + 1);
                }
                return raw;
            }
        }

        if (slimeQuestActive) {
            this.setSlimeQuestPity(0);
        }
        return MonsterManager.createRandomMonsterForZone(zone);
    }

    getAmbientEncounterRates(zone, context = {}) {
        const base = this.getAmbientEncounterRatesBase(zone);
        const profileId = this.getLocalEncounterProfile(zone, context);
        const profileRates = getWorldEncounterProfile(profileId)?.ambientRates;

        if (profileRates) {
            return profileRates;
        }

        return base;
    }

    getAmbientEncounterRatesBase(zone) {
        const rates = {
            low: { battle: 0.10, event: 0.035 },
            medium: { battle: 0.14, event: 0.045 },
            high: { battle: 0.17, event: 0.055 },
            death: { battle: 0.21, event: 0.045 }
        };
        return rates[zone] || rates.low;
    }

    createRandomMonsterEncounter(zone, context = {}) {
        const raw = this.selectMonsterForEncounter(zone, context);
        const template = MonsterManager.createMonsterInstance
            ? MonsterManager.createMonsterInstance(raw)
            : raw;

        if (!template) return false;
        this.currentMonster = new Monster(template);
        this.currentMonster.zoneId = zone;
        return true;
    }

    createBossEncounter(bossId, zone) {
        const template = MonsterManager.createMonsterInstance
            ? MonsterManager.createMonsterInstance(bossId)
            : MonsterManager.getMonster?.(bossId);

        if (!template) return false;
        this.currentMonster = new Monster(template);
        this.currentMonster.zoneId = zone;
        this.currentMonster.isBossEncounter = true;
        return true;
    }

    findBossSite(bossId) {
        if (ManualTriggerBossIds.has(bossId)) return null;
        return this.bossSites.find(site => site.bossId === bossId) || null;
    }

    teleportToBossSite(bossId) {
        const site = this.findBossSite(bossId);
        if (!site) return null;
        this.playerPos.x = site.x;
        this.playerPos.y = site.y;
        this.updateCamera();
        this.revealAroundPlayer(1);
        return site;
    }

    findLandmarkSite(landmarkId) {
        if (!landmarkId) return null;
        return this.landmarks.find(site => site.landmarkId === landmarkId) || null;
    }

    teleportToLandmark(landmarkId) {
        const site = this.findLandmarkSite(landmarkId);
        if (!site) return null;

        this.playerPos.x = site.x;
        this.playerPos.y = site.y;
        const cell = this.mapData?.[site.y]?.[site.x];
        this.currentLandmark = {
            id: landmarkId,
            data: cell?.landmarkData || getLandmark(landmarkId),
            zone: cell?.zone || 'low'
        };
        this.updateCamera();
        this.revealAroundPlayer(1);

        return {
            ...site,
            zone: cell?.zone || 'low',
            data: cell?.landmarkData || null
        };
    }

    findDungeonSite(dungeonType) {
        for (let y = 0; y < this.rows; y += 1) {
            for (let x = 0; x < this.cols; x += 1) {
                const cell = this.mapData[y]?.[x];
                if (cell?.type === 'dungeon' && (!dungeonType || cell.dungeonType === dungeonType)) {
                    return { x, y, dungeonType: cell.dungeonType, data: cell.dungeonData };
                }
            }
        }
        return null;
    }

    teleportToDungeon(dungeonType) {
        const site = this.findDungeonSite(dungeonType);
        if (!site) return null;
        this.playerPos.x = site.x;
        this.playerPos.y = site.y;
        this.currentDungeon = {
            type: site.dungeonType,
            data: site.data
        };
        this.updateCamera();
        this.revealAroundPlayer(1);
        return site;
    }

    getNearbyLandmarkContext(context = {}) {
        const x = Number.isFinite(context.x) ? context.x : this.playerPos.x;
        const y = Number.isFinite(context.y) ? context.y : this.playerPos.y;
        const cell = this.mapData?.[y]?.[x] || null;
        const currentLandmark = cell?.type === 'landmark'
            ? (cell.landmarkData || getLandmark(cell.landmarkId))
            : null;

        const candidates = (Array.isArray(this.landmarks) ? this.landmarks : [])
            .map(site => {
                const landmark = this.mapData?.[site.y]?.[site.x]?.landmarkData || getLandmark(site.landmarkId);
                if (!landmark) return null;
                const distance = Math.abs(site.x - x) + Math.abs(site.y - y);
                const radius = Number.isFinite(landmark.eventRadius)
                    ? Math.max(1, landmark.eventRadius)
                    : Math.max(2, Math.ceil(Number(landmark.regionRadius) || 2));
                if (distance > radius) return null;
                return { site, landmark, distance };
            })
            .filter(Boolean)
            .sort((a, b) => a.distance - b.distance || a.site.y - b.site.y || a.site.x - b.site.x);

        const nearbyLandmarkIds = candidates.map(entry => entry.landmark.id).filter(Boolean);
        const primaryLandmark = currentLandmark || candidates[0]?.landmark || null;
        const landmarkTags = [
            ...(primaryLandmark?.effectIds || []),
            ...(primaryLandmark?.storyChainIds || []),
            ...(primaryLandmark?.questIds || [])
        ].filter(Boolean);

        return {
            landmarkId: primaryLandmark?.id || null,
            currentLandmarkId: currentLandmark?.id || null,
            nearestLandmarkId: candidates[0]?.landmark?.id || null,
            nearbyLandmarkIds,
            landmarkTags
        };
    }

    getEventContext(extra = {}) {
        const landmarkContext = this.getNearbyLandmarkContext(extra);
        const explicitLandmarkIds = [
            extra.landmarkId,
            ...(Array.isArray(extra.nearbyLandmarkIds) ? extra.nearbyLandmarkIds : [])
        ].filter(Boolean);
        const nearbyLandmarkIds = [...new Set([
            ...explicitLandmarkIds,
            ...landmarkContext.nearbyLandmarkIds
        ])];

        return {
            ...extra,
            ...landmarkContext,
            landmarkId: extra.landmarkId || landmarkContext.landmarkId,
            nearbyLandmarkIds,
            stepCount: this.travelStep
        };
    }

    createRandomMapEvent(zone, options = {}) {
        try {
            const event = eventManager.triggerMapQuestionEvent
                ? eventManager.triggerMapQuestionEvent(zone, this.getEventContext(options))
                : eventManager.triggerRandomEvent(zone, this.getEventContext(options));
            this.currentEvent = event;
            return Boolean(event);
        } catch (e) {
            try {
                const fallbackEvent = EventManager.getEventForZone(zone);
                this.currentEvent = fallbackEvent;
                if (eventManager) eventManager.currentEvent = fallbackEvent;
                return Boolean(fallbackEvent);
            } catch (err) {
                console.error('Failed to generate event for zone:', zone, err);
                this.currentEvent = null;
                return false;
            }
        }
    }

    rollAmbientEncounter(cell, context = {}) {
        if (!cell || cell.type !== 'empty') return null;
        if (GameManager.getFlag('debug.noAmbientEncounters')) return null;

        const forcedEncounter = GameManager.getFlag('debug.forceNextEncounter');
        if (forcedEncounter) {
            GameManager.setFlag('debug.forceNextEncounter', null);
            if (forcedEncounter === 'event') {
                return this.createRandomMapEvent(cell.zone, context) ? 'event' : null;
            }
            if (forcedEncounter === 'battle' && !GameManager.getFlag('debug.noBattles')) {
                return this.createRandomMonsterEncounter(cell.zone, context) ? 'battle' : null;
            }
            return null;
        }

        const rates = this.getAmbientEncounterRates(cell.zone, context);
        const roll = Math.random();

        if (roll < rates.event) {
            return this.createRandomMapEvent(cell.zone, context) ? 'event' : null;
        }
        if (!GameManager.getFlag('debug.noBattles') && roll < rates.event + rates.battle) {
            return this.createRandomMonsterEncounter(cell.zone, context) ? 'battle' : null;
        }
        return null;
    }

    movePlayer(dx, dy) {
        // 如果沒有移動，直接返回
        if (dx === 0 && dy === 0) return null;
        const newX = Math.max(0, Math.min(this.cols - 1, this.playerPos.x + dx));
        const newY = Math.max(0, Math.min(this.rows - 1, this.playerPos.y + dy));
        
        this.playerPos.x = newX;
        this.playerPos.y = newY;
        this.travelStep += 1;
        if (!GameManager.state.flags || typeof GameManager.state.flags !== 'object') {
            GameManager.state.flags = {};
        }
        GameManager.state.flags['map.travelStep'] = this.travelStep;
        GameManager.markSaveDirty?.('map-travel-step');
        this.updateCamera();
        this.revealAroundPlayer(1);
            // 抵達任何區域視為解鎖（避免重新進入冒險時被重置）
            try {
                const arrivedZone = this.mapData[newY][newX].zone;
                if (arrivedZone && !this.unlockedZones.has(arrivedZone)) {
                    this.unlockedZones.add(arrivedZone);
                    this._saveMapState();
                }
            } catch (e) {
                // ignore
            }
            
            const cell = this.mapData[newY][newX];

            if (cell.bossSiteId && !ManualTriggerBossIds.has(cell.bossSiteId) && worldStoryManager.isBossLairVisible(cell.bossSiteId)) {
                if (GameManager.getFlag('debug.noBattles')) {
                    return null;
                }
                return this.createBossEncounter(cell.bossSiteId, cell.zone) ? 'battle' : null;
            }
            
            if (cell.type === 'monster') {
                if (GameManager.getFlag('debug.noAmbientEncounters') || GameManager.getFlag('debug.noBattles')) {
                    return null;
                }

                // Prefer an explicit template id (used for BOSS or pre-placed monsters).
                // If none, fall back to random generation for the zone.
                let template = null;
                try {
                    if (cell.monsterTemplateId) {
                        // createMonsterInstance accepts either id or template and normalizes fields
                        template = MonsterManager.createMonsterInstance(cell.monsterTemplateId);
                    }
                } catch (e) {
                    // ignore and fallback to random
                    template = null;
                }

                if (!template) {
                    const raw = MonsterManager.createRandomMonsterForZone(cell.zone);
                    // Normalize via createMonsterInstance when possible
                    template = MonsterManager.createMonsterInstance ? MonsterManager.createMonsterInstance(raw) : raw;
                }

                if (template) {
                    this.currentMonster = new Monster(template);
                    this.currentMonster.zoneId = cell.zone;
                } else {
                    console.error('No monster template found for zone:', cell.zone);
                    return null;
                }

                cell.type = 'empty';
                return 'battle';
            }
            
            if (cell.type === 'event') {
                // Generate the event at encounter time via the EventManager singleton
                try {
                    const ev = eventManager.triggerMapQuestionEvent
                        ? eventManager.triggerMapQuestionEvent(cell.zone, this.getEventContext({ fixedCell: true }))
                        : eventManager.triggerRandomEvent(cell.zone, this.getEventContext({ fixedCell: true }));
                    this.currentEvent = ev;
                } catch (e) {
                    // fallback to stateless getter if triggerRandomEvent isn't available
                    try {
                        const ev2 = EventManager.getEventForZone(cell.zone);
                        this.currentEvent = ev2;
                        // also set singleton currentEvent if possible
                        if (eventManager) eventManager.currentEvent = ev2;
                    } catch (err) {
                        console.error('Failed to generate event for zone:', cell.zone, err);
                        this.currentEvent = null;
                    }
                }

                cell.type = 'empty';
                return 'event';
            }

            if (cell.type === 'landmark') {
                this.currentLandmark = {
                    id: cell.landmarkId,
                    data: cell.landmarkData,
                    zone: cell.zone
                };
                return 'landmark';
            }
            
            if (cell.type === 'dungeon') {
                this.currentDungeon = {
                    type: cell.dungeonType,
                    data: cell.dungeonData
                };
                // 副本入口不會消失，可以重複進入
                return 'dungeon';
            }

            // 裂縫互動
            if (cell.type === 'rift') {
                this.currentRift = cell.riftData || { zone: cell.zone };
                // 當玩家抵達該區域，也視為已解鎖
                if (this.currentRift && this.currentRift.zone) {
                    this.unlockedZones.add(this.currentRift.zone);
                    this._saveMapState();
                }
                return 'rift';
            }
            
            // 回到家 - 只有離開過家之後再回來才觸發
            if (cell.type === 'home') {
                if (this.hasLeftHome) {
                    return 'home';
                }
                // 如果還沒離開過家，不觸發事件
                return null;
            }
            
            // 檢查是否離開了家（用於之後回家觸發事件）
            if (this.homePos && (newX !== this.homePos.x || newY !== this.homePos.y)) {
                this.hasLeftHome = true;
            }
        return this.rollAmbientEncounter(cell, { x: newX, y: newY });
    }

    getCurrentMonster() { return this.currentMonster; }
    clearCurrentMonster() { this.currentMonster = null; }
    getCurrentEvent() { return this.currentEvent; }
    clearCurrentEvent() { this.currentEvent = null; }
    getCurrentLandmark() { return this.currentLandmark; }
    clearCurrentLandmark() { this.currentLandmark = null; }
    getCurrentDungeon() { return this.currentDungeon; }
    clearCurrentDungeon() { this.currentDungeon = null; }
    getCurrentZone() { return this.mapData[this.playerPos.y][this.playerPos.x].zone; }
    getCurrentCell() { return this.mapData[this.playerPos.y][this.playerPos.x]; }

    // 裂縫相關 API
    getCurrentRift() { return this.currentRift; }
    clearCurrentRift() { this.currentRift = null; }
    // 回傳玩家可以傳送到的已解鎖區域（排除當前區域）
    getRiftOptions() {
        const current = this.getCurrentZone();
        return Array.from(this.unlockedZones).filter(z => z !== current);
    }
    getUnlockedZones() { return Array.from(this.unlockedZones); }

    getVisibleCells() {
        const visibleCells = [];
        const gs = this.gridSize;
        const startCol = Math.floor(this.cameraOffsetX / gs);
        const endCol = Math.min(this.cols, Math.ceil((this.cameraOffsetX + this.screenWidth) / gs));
        const startRow = Math.floor(this.cameraOffsetY / gs);
        const endRow = Math.min(this.rows, Math.ceil((this.cameraOffsetY + this.screenHeight) / gs));

        for (let r = startRow; r < endRow; r++) {
            if (r < 0 || r >= this.rows) continue;
            const row = this.mapData[r];
            for (let c = startCol; c < endCol; c++) {
                if (c < 0 || c >= this.cols) continue;
                visibleCells.push({
                    x: c,
                    y: r,
                    data: row[c],
                    explored: this.isCellExplored(c, r),
                    nearPlayer: Math.abs(c - this.playerPos.x) <= 1 && Math.abs(r - this.playerPos.y) <= 1
                });
            }
        }
        return visibleCells;
    }
}
