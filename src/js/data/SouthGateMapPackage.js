const ROOT = 'src/assets/images/art/prototype/hunt-demo/south-gate';

const freezePoints = points => Object.freeze(
    points.map(([x, y]) => Object.freeze([x, y]))
);

const prop = ({
    id,
    type,
    x,
    y,
    label,
    image,
    completedImage = image,
    radius = 86,
    collisionRadius = 0,
    scale = 1,
    result
}) => Object.freeze({
    id,
    type,
    x,
    y,
    label,
    image: `${ROOT}/props/${image}`,
    completedImage: `${ROOT}/props/${completedImage}`,
    radius,
    collisionRadius,
    scale,
    result: Object.freeze(result)
});

export const ExplorationSpriteAtlas = Object.freeze({
    image: `${ROOT}/traveler/traveler-atlas-v2.webp`,
    metadata: `${ROOT}/traveler/traveler-atlas.json`
});

export const ExplorationMapPackage = Object.freeze({
    id: 'south_gate_canvas_slice',
    name: '南門農田',
    chapter: '第一章',
    worldSize: Object.freeze({ width: 4096, height: 2304 }),
    camera: Object.freeze({
        zoom: 0.72,
        anchorX: 0.5,
        anchorY: 0.61,
        smoothing: 0.13
    }),
    assets: Object.freeze({
        base: `${ROOT}/base.webp`,
        foreground: `${ROOT}/foreground.webp`,
        walkMask: `${ROOT}/walk-mask.png`,
        heightMask: `${ROOT}/height-mask.png`,
        materialMask: `${ROOT}/material-mask.png`
    }),
    spawn: Object.freeze({ x: 2050, y: 2030, direction: 'north' }),
    exits: Object.freeze([
        Object.freeze({
            id: 'forest_boundary',
            polygon: freezePoints([
                [1720, 0], [2420, 0], [2420, 150], [1720, 150]
            ]),
            label: '林地入口',
            lockedText: '林地區仍在重製中。南門區驗收完成後，這條路才會接上。'
        })
    ]),
    occluders: Object.freeze([
        Object.freeze({
            id: 'south-wall-west',
            sourceRect: Object.freeze({ x: 0, y: 2020, width: 1680, height: 284 }),
            sortY: 2170
        }),
        Object.freeze({
            id: 'south-wall-east',
            sourceRect: Object.freeze({ x: 2440, y: 1990, width: 1656, height: 314 }),
            sortY: 2150
        }),
        Object.freeze({
            id: 'west-fence',
            sourceRect: Object.freeze({ x: 1160, y: 1410, width: 540, height: 340 }),
            sortY: 1615
        }),
        Object.freeze({
            id: 'east-fence',
            sourceRect: Object.freeze({ x: 2580, y: 1320, width: 520, height: 370 }),
            sortY: 1540
        })
    ]),
    props: Object.freeze([
        prop({
            id: 'south_gate_rest',
            type: 'rest',
            x: 1940,
            y: 1920,
            label: '在南門火堆休息',
            image: 'rest-lit.png',
            completedImage: 'rest-lit.png',
            radius: 105,
            collisionRadius: 38,
            scale: 0.62,
            result: {
                title: '南門火堆',
                text: '火光壓住了濕冷。生命恢復，但外頭的危險也重新活躍。',
                effect: 'rest'
            }
        }),
        prop({
            id: 'farmland_tracks',
            type: 'evidence',
            x: 2070,
            y: 1270,
            label: '檢查泥地上的足跡',
            image: 'documents.png',
            completedImage: 'documents.png',
            radius: 90,
            scale: 0.34,
            result: {
                title: '突然轉向的獸跡',
                text: '獸爪印原本朝城鎮移動，接近黑根後卻全部改向。人類靴印仍往北走，附近沒有搏鬥或拖行痕跡。',
                effect: 'evidence',
                evidenceId: 'direction'
            }
        }),
        prop({
            id: 'farmland_herbs',
            type: 'gather',
            x: 760,
            y: 930,
            label: '採集圍籬旁的藥草',
            image: 'herb.png',
            completedImage: 'herb.png',
            radius: 86,
            scale: 0.52,
            result: {
                title: '仍可使用的藥草',
                text: '葉面沾滿泥水，根部卻沒有腐黑。米婭應該能判斷它是否還能入藥。',
                effect: 'loot',
                items: Object.freeze([
                    Object.freeze({ itemId: 'health_potion_s', quantity: 1 })
                ])
            }
        }),
        prop({
            id: 'gate_field_pack',
            type: 'secret',
            x: 3320,
            y: 870,
            label: '翻找被圍籬遮住的行囊',
            image: 'field-pack.png',
            completedImage: 'field-pack.png',
            radius: 92,
            collisionRadius: 32,
            scale: 0.52,
            result: {
                title: '失蹤旅人的行囊',
                text: '扣帶從內側割斷，乾糧仍在。旅人離開時很急，卻不是被拖走的。',
                effect: 'loot',
                items: Object.freeze([
                    Object.freeze({ itemId: 'iron_ore', quantity: 2 })
                ])
            }
        })
    ]),
    dangerZones: Object.freeze([
        Object.freeze({
            id: 'farmland_hedge_danger',
            polygon: freezePoints([
                [2510, 1210], [2790, 1090], [3030, 1190],
                [3070, 1430], [2860, 1580], [2580, 1500]
            ]),
            encounterTableId: 'ch1_road',
            monsters: Object.freeze(['giant_rat', 'goblin', 'slime']),
            returnBefore: Object.freeze({ x: 2470, y: 1470 }),
            returnAfter: Object.freeze({ x: 3060, y: 1260 }),
            resetOnRest: true,
            canRetreat: true
        })
    ])
});

export const SouthGateMaterial = Object.freeze({
    VOID: 0,
    GRASS: 1,
    MUD: 2,
    STONE: 3
});

export default ExplorationMapPackage;
