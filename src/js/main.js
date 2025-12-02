/**
 * main.js
 * Entry point for the SPA. Handles scene switching.
 */
import LobbyScene from './scenes/LobbyScene.js';
import ShopScene from './scenes/ShopScene.js';
import AdventureScene from './scenes/AdventureScene.js';

class App {
    constructor() {
        this.appContainer = document.getElementById('app');
        this.currentScene = null;
        this.htmlCache = {}; // Cache for HTML content
        
        // Simple router map
        this.routes = {
            'lobby': LobbyScene,
            'shop': ShopScene,
            'adventure': AdventureScene
        };

        // Initialize
        this.loadScene('lobby');
    }

    async loadScene(sceneName) {
        // Cleanup current scene if it has a cleanup method
        if (this.currentScene && typeof this.currentScene.cleanup === 'function') {
            this.currentScene.cleanup();
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
            }
        } catch (error) {
            console.error('Error loading scene:', error);
            this.appContainer.innerHTML = `<div style="color:red; padding:20px;">Error loading scene: ${error.message}</div>`;
        }
    }
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.gameApp = new App();
});
