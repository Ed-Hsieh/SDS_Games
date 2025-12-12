// ===== 主程式入口 =====

/**
 * 初始化遊戲
 */
function initGame() {
    console.log('遊戲初始化中...');
    
    // 創建遊戲狀態
    const gameState = new GameState();
    
    // 嘗試載入保存的遊戲狀態
    const loaded = gameState.load();
    
    if (!loaded) {
        // 如果沒有保存數據，載入測試資料
        console.log('載入測試資料...');
        initTestData(gameState);
    }
    
    // 初始化大廳場景
    initHallScene(gameState);
    
    // 設定自動保存（每30秒保存一次）
    setInterval(() => {
        gameState.save();
    }, 30000);
    
    // 頁面關閉前保存
    window.addEventListener('beforeunload', () => {
        gameState.save();
    });
    
    console.log('遊戲初始化完成！');
    console.log('遊戲狀態:', gameState);
    
    // 測試場景切換功能（供調試使用）
    window.testSwitchToAdventure = function() {
        gameState.setScene(GameScene.ADVENTURE);
        gameState.save();
        updateAll();
        console.log('已切換到冒險場景');
    };
    
    window.testSwitchToHall = function() {
        gameState.setScene(GameScene.HALL);
        gameState.save();
        updateAll();
        console.log('已切換到大廳場景');
    };
    
    // 測試角色升級功能
    window.testLevelUp = function() {
        gameState.character.exp += 100;
        gameState.character.checkLevelUp();
        gameState.save();
        updateAll();
        console.log('經驗值已增加，檢查升級');
    };
    
    // 測試角色受傷功能
    window.testTakeDamage = function(damage = 30) {
        gameState.character.hp = Math.max(0, gameState.character.hp - damage);
        gameState.save();
        updateAll();
        console.log(`角色受到 ${damage} 點傷害`);
    };
    
    // 清除保存數據（測試用）
    window.testClearSave = function() {
        localStorage.removeItem('sds_game_state');
        console.log('保存數據已清除，請重新整理頁面');
    };
    
    // 將 gameState 暴露到全域以便調試
    window.gameState = gameState;
}

/**
 * 頁面載入完成後初始化
 */
window.addEventListener('DOMContentLoaded', () => {
    initGame();
});

// ===== 鍵盤快捷鍵（可選功能）=====
document.addEventListener('keydown', (e) => {
    // ESC 鍵關閉彈窗
    if (e.key === 'Escape') {
        closeItemModal();
    }
});
