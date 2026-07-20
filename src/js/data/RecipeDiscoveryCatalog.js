/**
 * Canonical blueprint discovery records and Boss-clear recipe unlocks.
 */

export const DefaultKnownRecipeIds = Object.freeze(["leather_armor","health_potion_basic"]);

export const RecipeDiscoveryDatabase = {
    "wolf_fang_necklace": {
        "source": "第一章獵人委託",
        "clue": "整理野狼素材並完成獵人委託後，由工匠還原獸牙護符圖紙。",
        "interactionId": "chapter_1_hunter_commission"
    },

    "greater_health_potion": {
        "source": "待配置",
        "clue": "等待米婭的配方研究與市集藥品庫存連動定案。",
        "interactionId": null
    },

    "poison_dagger": {
        "source": "怪物掉落",
        "clue": "帶毒的怪物可能掉落薄刃匕首的破損圖紙。",
        "interactionId": "monster_blueprint_drop"
    },

    "silver_thread_hook": {
        "source": "銀鐮伏獵者掉落",
        "clue": "銀絲伏獵鉤圖紙會在銀鐮伏獵者戰利品中出現。",
        "interactionId": "monster_blueprint_drop"
    },

    "goblin_trickster_charm": {
        "source": "古代錢幣",
        "clue": "黑市暗號能換到哥布林護符的製作手記。",
        "interactionId": "merchant_ancient_coin"
    },

    "shadow_armor": {
        "source": "副本、菁英或首領掉落",
        "clue": "影縫甲圖紙需要挑戰副本、菁英或首領取得。",
        "interactionId": "strong_blueprint_drop"
    },

    "blood_moon_pendant": {
        "source": "血月角鹿掉落",
        "clue": "血月角墜圖紙只會在完成血月角鹿狩獵後掉落。",
        "interactionId": "strong_blueprint_drop"
    },

    "earthwarden_aegis": {
        "source": "遺跡副本：盲目的秩序",
        "clue": "遠古守衛者停機後，神殿防禦網絡的核心構造能拼出地脈守盾圖紙。",
        "interactionId": null
    },

    "bone_etched_lance": {
        "source": "骷髏戰士掉落",
        "clue": "骨甲接合處藏有長柄武器的骨紋配置。",
        "interactionId": "monster_blueprint_drop"
    },

    "curse_iron_warhammer": {
        "source": "暗影弓手掉落",
        "clue": "暗影部隊攜帶的咒鐵鍛造頁能將暗影碎片用於重鎚。",
        "interactionId": "monster_blueprint_drop"
    },

    "leyline_wedge_lance": {
        "source": "符文看守掉落",
        "clue": "看守者的地脈定位圖同時記錄了楔槍結構。",
        "interactionId": "strong_blueprint_drop"
    },

    "embercore_focus": {
        "source": "火元素掉落",
        "clue": "穩定燼核的法器框架藏在火元素殘留的結晶層中。",
        "interactionId": "monster_blueprint_drop"
    },

    "stormguide_focus": {
        "source": "雷元素掉落",
        "clue": "導引雷流的分叉結構可從雷元素核心紋路還原。",
        "interactionId": "monster_blueprint_drop"
    },

    "cliffscale_skinner": {
        "source": "崖鱗幼體掉落",
        "clue": "鱗片剝離痕跡提供了短刃的正確刃角。",
        "interactionId": "monster_blueprint_drop"
    },

    "sealstone_ram": {
        "source": "封石守衛掉落",
        "clue": "守衛內部的撞擊配重圖能重建封石重槌。",
        "interactionId": "monster_blueprint_drop"
    },

    "molten_core_maul": {
        "source": "熔岩魔像掉落",
        "clue": "熔核外殼保留了重鎚頭的耐熱分層。",
        "interactionId": "monster_blueprint_drop"
    },

    "soul_lantern_focus": {
        "source": "受難魂靈掉落",
        "clue": "殘缺燈架記錄了約束游離魂質的方法。",
        "interactionId": "monster_blueprint_drop"
    },

    "forge_forest_guardian_crown": {
        "source": "森林守護者擊破",
        "clue": "守護者倒下後，鐵匠能依枝杖結構還原枝冠。",
        "interactionId": "boss_clear_forest_guardian"
    },

    "forge_titan_gauntlet": {
        "source": "遠古泰坦擊破",
        "clue": "泰坦之心與護腕殘構共同解鎖巨神護手工藝。",
        "interactionId": "boss_clear_ancient_titan"
    },

    "forge_elemental_crown": {
        "source": "元素領主擊破",
        "clue": "穩定四象核心後，鐵匠能重建四象靜冠。",
        "interactionId": "boss_clear_elemental_lord"
    },

    "forge_elder_dragon_badge": {
        "source": "上古龍擊破",
        "clue": "龍心與完整古龍鱗能重建古龍牙墜。",
        "interactionId": "boss_clear_elder_dragon"
    },

    "forge_demon_lord_crown": {
        "source": "魔王擊破",
        "clue": "末焰核心穩定後，才能鍛成與末焰刃成套的心核。",
        "interactionId": "boss_clear_demon_lord_asariel"
    }
};

export const BossRecipeUnlocksByMonsterId = Object.freeze({
    "forest_guardian": [
        "forge_forest_guardian_crown"
    ],
    "ancient_titan": [
        "forge_titan_gauntlet"
    ],
    "elemental_lord": [
        "forge_elemental_crown"
    ],
    "elder_dragon": [
        "forge_elder_dragon_badge"
    ],
    "demon_lord_asariel": [
        "forge_demon_lord_crown"
    ]
});
