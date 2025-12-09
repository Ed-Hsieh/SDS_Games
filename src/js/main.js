/**
 * main.js
 * Entry point for the SPA. Handles scene switching.
 */
import LobbyScene from './scenes/LobbyScene.js';
import ShopScene from './scenes/ShopScene.js';
import AdventureScene from './scenes/AdventureScene.js';
import CasinoScene from './scenes/CasinoScene.js';
import ForgeScene from './scenes/ForgeScene.js';
import QuestScene from './scenes/QuestScene.js';
import { DungeonScene } from './scenes/DungeonScene.js';
import towerScene from './scenes/TowerScene.js';
// 導入共用的節奏條系統
import './utils/RhythmBarSystem.js';
import './components/ItemDetailModal.js';

class App {
    constructor() {
        this.appContainer = document.getElementById('app');
        this.currentScene = null;
        this.htmlCache = {}; // Cache for HTML content
        
        // Simple router map
        this.routes = {
            'lobby': LobbyScene,
            'shop': ShopScene,
            'adventure': AdventureScene,
            'casino': CasinoScene,
            'forge': ForgeScene,
            'quest': QuestScene,
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

    async loadScene(sceneName) {
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
            if (this.htmlCache[sceneName]) {
                htmlContent = this.htmlCache[sceneName];
            } else {
                // Fetch from file
                const response = await fetch(`src/views/${sceneName}.html`);
                if (!response.ok) {
                    throw new Error(`Failed to load scene: ${sceneName} (${response.status})`);
                }
                htmlContent = await response.text();
                this.htmlCache[sceneName] = htmlContent;
            }

            // Inject HTML
            this.appContainer.innerHTML = htmlContent;

            // Wait for next frame to ensure DOM is fully updated
            await new Promise(resolve => requestAnimationFrame(resolve));

            // Initialize new scene logic
            const SceneClass = this.routes[sceneName];
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
        } catch (error) {
            console.error('Error loading scene:', error);
            this.appContainer.innerHTML = `<div style="color:red; padding:20px;">Error loading scene: ${error.message}</div>`;
        }
    }
    
    // 進入副本的便捷方法
    enterDungeon(dungeonType) {
        const routeName = `dungeon-${dungeonType}`;
        if (this.dungeonRoutes[routeName]) {
            window.location.hash = routeName;
        }
    }
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.gameApp = new App();
});
