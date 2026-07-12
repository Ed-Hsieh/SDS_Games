/**
 * main.js
 * Entry point for the SPA. Handles scene switching.
 */
import LobbyScene from './scenes/LobbyScene.js?v=ui-convergence-20260712y';
import ShopScene from './scenes/ShopScene.js?v=scene-assets-20260629c';
import CasinoScene from './scenes/CasinoScene.js?v=scene-assets-20260629c';
import ForgeScene from './scenes/ForgeScene.js?v=beta-convergence-20260625d';
import QuestScene from './scenes/QuestScene.js?v=mia-layer-test-20260712x';
import EncyclopediaScene from './scenes/EncyclopediaScene.js?v=ui-convergence-20260712y';
import { DungeonScene } from './scenes/DungeonScene.js?v=dialogue-flow-20260712w';
import towerScene from './scenes/TowerScene.js';
import GameManager from './managers/GameManager.js';
// 導入共用的節奏條系統
import './utils/RhythmBarSystem.js';
import './utils/ItemTooltip.js';
import './components/ItemDetailModal.js';
import audioManager from './utils/AudioManager.js';
import { showGlobalToast } from './utils/UIFeedback.js';
import { initDevPanel } from './utils/DevPanel.js';

const APP_ASSET_VERSION = 'ui-convergence-20260712y';

class App {
    constructor() {
        this.appContainer = document.getElementById('app');
        this.currentScene = null;
        this.htmlCache = {}; // Cache for HTML content
        this.sceneLoadToken = 0;
        
        // Simple router map
        this.routes = {
            'lobby': LobbyScene,
            'shop': ShopScene,
            'adventure': null,
            'casino': CasinoScene,
            'forge': ForgeScene,
            'quest': QuestScene,
            'encyclopedia': EncyclopediaScene,
            'tower': null,  // 無盡塔 - 使用 towerScene 單例處理
            // 副本場景 - 使用 DungeonScene 處理
            'dungeon-cave': null,
            'dungeon-snow': null,
            'dungeon-ruins': null,
            'dungeon-jungle': null,
            'dungeon-hell': null
        };
        
        // 副本場景映射 (dungeonType)
        this.dungeonRoutes = {
            'dungeon-cave': 'cave',
            'dungeon-snow': 'snow',
            'dungeon-ruins': 'ruins',
            'dungeon-jungle': 'jungle',
            'dungeon-hell': 'hell'
        };

        // 監聽 hash 變化
        window.addEventListener('hashchange', () => this.handleHashChange());
        
        // Initialize
        this.handleHashChange() || this.loadScene('lobby');
    }
    
    handleHashChange() {
        const hash = window.location.hash.slice(1); // 移除 #
        if (hash && this.routes.hasOwnProperty(hash)) {
            this.loadScene(hash);
            return true;
        }
        return false;
    }

    navigateTo(sceneName) {
        if (!sceneName || !this.routes.hasOwnProperty(sceneName)) return;

        if (window.location.hash.slice(1) === sceneName) {
            this.loadScene(sceneName);
            return;
        }

        window.location.hash = sceneName;
    }

    async loadScene(sceneName) {
        const loadToken = ++this.sceneLoadToken;
        const viewName = this.dungeonRoutes[sceneName] ? 'dungeon' : sceneName;
        const previousSceneName = this.currentSceneName || null;

        if (
            sceneName === 'lobby'
            && (
                previousSceneName === 'adventure'
                || this.dungeonRoutes[previousSceneName]
            )
        ) {
            GameManager.requestTownNarrativeReset('adventure_return');
        }

        // Cleanup current scene if it has a cleanup method
        if (this.currentScene && typeof this.currentScene.cleanup === 'function') {
            this.currentScene.cleanup();
        }

        
        // 清理副本場景
        if (this.dungeonRoutes[sceneName] === undefined && DungeonScene) {
            DungeonScene.destroy();
        }

        // Clear container
        this.appContainer.innerHTML = '';

        try {
            let htmlContent;

            // Check cache
            if (this.htmlCache[viewName]) {
                htmlContent = this.htmlCache[viewName];
            } else {
                // Fetch from file
                const response = await fetch(`src/views/${viewName}.html?v=${APP_ASSET_VERSION}`);
                if (!response.ok) {
                    throw new Error(`Failed to load scene: ${sceneName} (${response.status})`);
                }
                htmlContent = await response.text();
                this.htmlCache[viewName] = htmlContent;
            }

            if (loadToken !== this.sceneLoadToken) return;

            // Inject HTML
            this.appContainer.innerHTML = htmlContent;

            // Wait briefly so injected DOM is available even when requestAnimationFrame is throttled.
            await this.nextDomTick();
            if (loadToken !== this.sceneLoadToken) return;

            // Initialize new scene logic
            let SceneClass = this.routes[sceneName];
            if (sceneName === 'adventure') {
                const module = await import(`./scenes/AdventureScene.js?v=${APP_ASSET_VERSION}`);
                SceneClass = module.default;
                this.routes.adventure = SceneClass;
            }
            if (SceneClass) {
                this.currentScene = new SceneClass(this.appContainer, this);
                this.currentScene.init();
            } else if (sceneName === 'tower') {
                // 無盡塔場景：使用 towerScene 單例初始化
                this.currentScene = towerScene;
                towerScene.setApp(this); // 傳遞 app 參考
                towerScene.init();
            } else if (this.dungeonRoutes[sceneName]) {
                // 副本場景：使用 DungeonScene 單例初始化
                const dungeonType = this.dungeonRoutes[sceneName];
                this.currentScene = DungeonScene;
                DungeonScene.init(dungeonType);
            }
            this.currentSceneName = sceneName;
            audioManager.setScene(sceneName);

        } catch (error) {
            console.error('Error loading scene:', error);
            this.appContainer.innerHTML = '<div class="scene-load-error">場景載入失敗，請重新整理或回到大廳。</div>';
            showGlobalToast('場景載入失敗', '目前畫面無法正確開啟，請重新整理或返回大廳。', 'error');
        }
    }

    nextDomTick() {
        return new Promise(resolve => {
            let done = false;
            const finish = () => {
                if (done) return;
                done = true;
                resolve();
            };

            if (typeof requestAnimationFrame === 'function') {
                requestAnimationFrame(finish);
            }

            setTimeout(finish, 0);
        });
    }

    // 進入副本的便捷方法
    enterDungeon(dungeonType) {
        const routeName = `dungeon-${dungeonType}`;
        if (this.dungeonRoutes[routeName]) {
            this.navigateTo(routeName);
        }
    }
}

// Start the app when DOM is ready. Module scripts can finish after DOMContentLoaded
// when cache-busted imports are slow, so bootstrap immediately if the DOM is ready.
function bootstrapApp() {
    if (window.gameApp) return;

    audioManager.installGlobalHooks();

    // 先還原本機存檔再進場景；主檔損壞時自動回退備份。
    const restore = GameManager.loadFromLocalStorage();
    if (restore?.source === 'backup') {
        showGlobalToast('存檔回復', '主存檔損壞，已自動回復上一份備份存檔。', 'warning', { duration: 8000 });
    } else if (restore?.errors?.length && !restore.loaded) {
        showGlobalToast('存檔讀取失敗', '本機存檔無法讀取，已以新進度開始。壞檔已保留。', 'error', { duration: 8000 });
    }
    GameManager.startAutosave();

    window.gameApp = new App();
    initDevPanel(window.gameApp);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapApp, { once: true });
} else {
    bootstrapApp();
}
