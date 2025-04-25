document.addEventListener('DOMContentLoaded', function() {
    // DOM元素
    const startButton = document.getElementById('start-game');
    const pauseButton = document.getElementById('pause-game');
    const scoreDisplay = document.getElementById('score');
    const gameCanvas = document.getElementById('game-canvas');
    const gameIframe = gameCanvas.querySelector('iframe');
    
    // 游戏状态
    let gameStarted = false;
    let gamePaused = false;
    let score = 0;
    
    // 初始化游戏
    function initGame() {
        // 游戏已经通过iframe加载，不需要显示开始准备信息
        startButton && startButton.addEventListener('click', startGame);
        pauseButton && pauseButton.addEventListener('click', togglePause);
        pauseButton && (pauseButton.disabled = true); // 游戏开始前禁用暂停按钮
    }
    
    // 开始游戏
    function startGame() {
        if (gameStarted && !gamePaused) return;
        
        if (!gameStarted) {
            gameStarted = true;
            // 向iframe发送开始游戏消息（如果iframe游戏支持）
            try {
                gameIframe.contentWindow.postMessage('start', '*');
            } catch (e) {
                console.log('Failed to send start message to iframe');
            }
            pauseButton.disabled = false;
            startButton.textContent = 'Restart';
        } else if (gamePaused) {
            gamePaused = false;
            // 向iframe发送恢复游戏消息（如果iframe游戏支持）
            try {
                gameIframe.contentWindow.postMessage('resume', '*');
            } catch (e) {
                console.log('Failed to send resume message to iframe');
            }
            pauseButton.textContent = 'Pause';
        }
        
        // 模拟游戏进行中的得分增加
        startScoreIncrement();
    }
    
    // 暂停/恢复游戏
    function togglePause() {
        if (!gameStarted) return;
        
        gamePaused = !gamePaused;
        
        if (gamePaused) {
            pauseButton.textContent = 'Resume';
            // 向iframe发送暂停游戏消息（如果iframe游戏支持）
            try {
                gameIframe.contentWindow.postMessage('pause', '*');
            } catch (e) {
                console.log('Failed to send pause message to iframe');
            }
            // 添加暂停覆盖层
            const pauseOverlay = document.createElement('div');
            pauseOverlay.className = 'pause-overlay';
            pauseOverlay.innerHTML = '<p>Game Paused</p>';
            gameCanvas.appendChild(pauseOverlay);
            stopScoreIncrement();
        } else {
            pauseButton.textContent = 'Pause';
            const overlay = gameCanvas.querySelector('.pause-overlay');
            if (overlay) gameCanvas.removeChild(overlay);
            startGame();
        }
    }
    
    // 得分系统 - 这里可能需要与iframe游戏进行消息通信来获取实际分数
    let scoreInterval;
    
    function startScoreIncrement() {
        stopScoreIncrement();
        scoreInterval = setInterval(function() {
            score++;
            updateScore();
        }, 1000);
    }
    
    function stopScoreIncrement() {
        if (scoreInterval) {
            clearInterval(scoreInterval);
            scoreInterval = null;
        }
    }
    
    function updateScore() {
        if (scoreDisplay) {
            scoreDisplay.textContent = score;
        }
    }
    
    // 重置游戏
    function resetGame() {
        gameStarted = false;
        gamePaused = false;
        score = 0;
        updateScore();
        stopScoreIncrement();
        // 向iframe发送重置游戏消息（如果iframe游戏支持）
        try {
            gameIframe.contentWindow.postMessage('reset', '*');
        } catch (e) {
            console.log('Failed to send reset message to iframe');
        }
        // 重新加载iframe
        gameIframe.src = gameIframe.src;
        initGame();
    }
    
    // 监听来自iframe的消息
    window.addEventListener('message', function(event) {
        // 处理来自iframe游戏的消息，例如分数更新
        try {
            const data = event.data;
            if (data.type === 'score') {
                score = data.score;
                updateScore();
            }
        } catch (e) {
            console.log('Failed to process message from iframe', e);
        }
    });
    
    // 初始化游戏
    initGame();
    
    // 添加一些测试功能，仅用于演示
    window.testGame = {
        addScore: function(points) {
            score += points;
            updateScore();
            console.log(`Added ${points} points. New score: ${score}`);
        },
        reset: resetGame
    };
    
    // 回到顶部按钮功能
    const backToTopButton = document.getElementById('back-to-top');
    
    // 当滚动超过300px时显示按钮
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    // 点击按钮回到顶部
    backToTopButton.addEventListener('click', function(e) {
        e.preventDefault();
        // 平滑滚动回顶部
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}); 