// ===== 冒險模式主程式 =====

/**
 * 初始化遊戲
 */
function initAdventureGame() {
    console.log('冒險模式初始化中...');
    
    // 載入保存的遊戲狀態
    const gameState = new GameState();
    const loaded = gameState.load();
    
    if (!loaded) {
        console.log('沒有保存數據，初始化測試資料');
        initTestData(gameState);
    }
    
    // 設定場景為冒險模式
    gameState.setScene(GameScene.ADVENTURE);
    
    // 初始化冒險場景
    initAdventureScene(gameState);
    
    // 設定自動保存
    setInterval(() => {
        gameState.save();
    }, 30000);
    
    // 頁面關閉前保存
    window.addEventListener('beforeunload', () => {
        gameState.save();
    });
    
    console.log('冒險模式初始化完成！');
    console.log('遊戲狀態:', gameState);
    
    // 暴露到全域
    window.gameState = gameState;
}

/**
 * 頁面載入完成後初始化
 */
window.addEventListener('DOMContentLoaded', () => {
    initAdventureGame();
});
