class BubbleGame {
    constructor() {
        this.board = document.getElementById('gameBoard');
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.messageElement = document.getElementById('message');
        this.bubbles = [];
        this.selectedBubbles = [];
        this.score = 0;
        this.colors = ['color1', 'color2', 'color3', 'color4', 'color5'];
        this.gameRunning = false;
        this.dropInterval = null;
        this.gameSpeed = 10000; // 初期速度を10秒に変更
        this.level = 1;
        this.bombCount = 3;
        this.bombCountElement = document.getElementById('bombCount');
        this.bombItemButton = document.getElementById('bombItem');
        this.floatingCheckInterval = null;
        this.removalTimer = null;
        this.timerDuration = 1000; // 1秒の猶予時間
        
        // レスポンシブ対応のための設定
        this.dimensions = this.getBoardDimensions();
        this.setupResponsiveHandlers();
    }

    getBoardDimensions() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const isMobile = screenWidth <= 768;
        const isSmallMobile = screenWidth <= 480;
        const isLandscape = screenWidth > screenHeight;
        
        let config;
        
        if (isSmallMobile) {
            // 小さなモバイル画面
            config = {
                boardWidth: Math.min(320, screenWidth - 40),
                boardHeight: Math.min(400, screenHeight * 0.5),
                bubbleSize: 28,
                spacing: 35,
                adjacentDistance: 60
            };
        } else if (isMobile && !isLandscape) {
            // モバイル縦画面
            config = {
                boardWidth: Math.min(400, screenWidth - 40),
                boardHeight: Math.min(450, screenHeight * 0.55),
                bubbleSize: 32,
                spacing: 40,
                adjacentDistance: 70
            };
        } else if (isMobile && isLandscape) {
            // モバイル横画面
            config = {
                boardWidth: Math.min(500, screenWidth * 0.7),
                boardHeight: Math.min(350, screenHeight - 200),
                bubbleSize: 30,
                spacing: 38,
                adjacentDistance: 65
            };
        } else {
            // デスクトップ
            config = {
                boardWidth: 570,
                boardHeight: 500,
                bubbleSize: 40,
                spacing: 55,
                adjacentDistance: 80
            };
        }
        
        // 列数を計算
        config.bubblesPerRow = Math.floor((config.boardWidth - 20) / config.spacing);
        
        return config;
    }

    setupResponsiveHandlers() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const newDimensions = this.getBoardDimensions();
                if (JSON.stringify(newDimensions) !== JSON.stringify(this.dimensions)) {
                    this.dimensions = newDimensions;
                    this.updateBoardSize();
                    if (this.gameRunning) {
                        this.repositionBubbles();
                    }
                }
            }, 250);
        });
    }

    updateBoardSize() {
        this.board.style.width = this.dimensions.boardWidth + 'px';
        this.board.style.height = this.dimensions.boardHeight + 'px';
        
        // CSS変数を更新
        document.documentElement.style.setProperty('--bubble-size', this.dimensions.bubbleSize + 'px');
        document.documentElement.style.setProperty('--board-width', this.dimensions.boardWidth + 'px');
        document.documentElement.style.setProperty('--board-height', this.dimensions.boardHeight + 'px');
    }

    startGame() {
        this.score = 0;
        this.level = 1;
        this.gameSpeed = 10000; // 初期速度を10秒に変更
        this.bubbles = [];
        this.selectedBubbles = [];
        this.gameRunning = true;
        this.bombCount = 3;
        this.updateScore();
        this.updateLevel();
        this.updateBombCount();
        this.clearBoard();
        this.updateBoardSize(); // ボードサイズを更新
        this.generateInitialBubbles();
        this.startBubbleDrop();
        this.startFloatingBubbleCheck();
        this.showMessage('ゲーム開始！底からライン全体で湧き出るバブルを消そう！');
    }

    clearBoard() {
        this.board.innerHTML = '';
        this.bubbles = [];
        this.selectedBubbles = [];
    }

    generateInitialBubbles() {
        const { bubbleSize, boardWidth, boardHeight, spacing, bubblesPerRow } = this.dimensions;
        const rows = 4;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < bubblesPerRow; col++) {
                const bubble = this.createBubble();
                const x = 10 + col * spacing;
                const y = boardHeight - bubbleSize - 10 - (row * spacing);
                
                bubble.style.left = x + 'px';
                bubble.style.top = y + 'px';
                bubble.dataset.falling = 'false';
                
                this.board.appendChild(bubble);
                this.bubbles.push(bubble);
            }
        }
    }

    createBubble() {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        bubble.classList.add(color);
        bubble.dataset.color = color;
        
        // レスポンシブサイズを適用
        bubble.style.width = this.dimensions.bubbleSize + 'px';
        bubble.style.height = this.dimensions.bubbleSize + 'px';
        
        bubble.addEventListener('click', (e) => this.handleBubbleClick(e, bubble));
        
        return bubble;
    }

    repositionBubbles() {
        // 既存のバブルを新しいグリッドに再配置
        const { spacing, boardHeight, bubbleSize, bubblesPerRow } = this.dimensions;
        
        // バブルを底から上に向かって再配置
        const sortedBubbles = [...this.bubbles].sort((a, b) => {
            const aY = parseFloat(a.style.top);
            const bY = parseFloat(b.style.top);
            return bY - aY; // 下から上へ
        });
        
        let currentRow = 0;
        let currentCol = 0;
        
        sortedBubbles.forEach(bubble => {
            const x = 10 + currentCol * spacing;
            const y = boardHeight - bubbleSize - 10 - (currentRow * spacing);
            
            bubble.style.left = x + 'px';
            bubble.style.top = y + 'px';
            bubble.style.width = this.dimensions.bubbleSize + 'px';
            bubble.style.height = this.dimensions.bubbleSize + 'px';
            
            currentCol++;
            if (currentCol >= bubblesPerRow) {
                currentCol = 0;
                currentRow++;
            }
        });
    }

    handleBubbleClick(e, bubble) {
        e.stopPropagation();
        
        if (!this.gameRunning || bubble.dataset.falling === 'true') return;
        
        if (this.selectedBubbles.includes(bubble)) {
            this.deselectBubble(bubble);
            this.cancelRemovalTimer();
        } else {
            if (this.selectedBubbles.length === 0) {
                this.selectBubble(bubble);
            } else {
                const firstColor = this.selectedBubbles[0].dataset.color;
                const isAdjacentResult = this.isAdjacent(bubble);
                
                if (bubble.dataset.color === firstColor && isAdjacentResult) {
                    this.selectBubble(bubble);
                    if (this.selectedBubbles.length >= 3) {
                        this.startRemovalTimer();
                    }
                } else {
                    // 異なる色または隣接していない場合、即座に消去して新しい選択開始
                    if (this.selectedBubbles.length >= 3) {
                        this.cancelRemovalTimer();
                        this.removeBubbles();
                        setTimeout(() => {
                            this.selectBubble(bubble);
                        }, 100);
                    } else {
                        this.clearSelection();
                        this.selectBubble(bubble);
                    }
                }
            }
        }
    }

    isAdjacent(newBubble) {
        if (this.selectedBubbles.length === 0) return true;
        
        const newX = parseFloat(newBubble.style.left);
        const newY = parseFloat(newBubble.style.top);
        
        for (let selectedBubble of this.selectedBubbles) {
            const selectedX = parseFloat(selectedBubble.style.left);
            const selectedY = parseFloat(selectedBubble.style.top);
            const distance = Math.sqrt((newX - selectedX) ** 2 + (newY - selectedY) ** 2);
            
            if (distance <= this.dimensions.adjacentDistance) {
                return true;
            }
        }
        return false;
    }

    selectBubble(bubble) {
        bubble.classList.add('selected');
        this.selectedBubbles.push(bubble);
    }

    deselectBubble(bubble) {
        bubble.classList.remove('selected');
        this.selectedBubbles = this.selectedBubbles.filter(b => b !== bubble);
    }

    clearSelection() {
        this.selectedBubbles.forEach(bubble => {
            bubble.classList.remove('selected');
        });
        this.selectedBubbles = [];
        this.cancelRemovalTimer();
    }

    startRemovalTimer() {
        this.cancelRemovalTimer();
        
        // 視覚的なフィードバック
        this.showTimerMessage();
        
        this.removalTimer = setTimeout(() => {
            if (this.selectedBubbles.length >= 3) {
                this.removeBubbles();
            }
        }, this.timerDuration);
    }

    cancelRemovalTimer() {
        if (this.removalTimer) {
            clearTimeout(this.removalTimer);
            this.removalTimer = null;
        }
    }

    showTimerMessage() {
        const count = this.selectedBubbles.length;
        this.messageElement.textContent = `${count}個選択中... 追加選択可能！`;
        this.messageElement.className = 'message timer';
    }

    removeBubbles() {
        if (this.selectedBubbles.length < 3) return;
        
        const count = this.selectedBubbles.length;
        const basePoints = 10;
        const bonusPoints = (count - 3) * 5;
        const totalPoints = (basePoints + bonusPoints) * count;
        
        this.score += totalPoints;
        this.updateScore();
        
        this.selectedBubbles.forEach((bubble, index) => {
            setTimeout(() => {
                bubble.classList.add('popping');
                setTimeout(() => {
                    if (bubble.parentNode) {
                        bubble.parentNode.removeChild(bubble);
                    }
                }, 400);
            }, index * 50);
        });
        
        this.bubbles = this.bubbles.filter(bubble => !this.selectedBubbles.includes(bubble));
        
        this.showComboMessage(count, totalPoints);
        this.checkLevelUp();
        
        this.selectedBubbles = [];
        
        setTimeout(() => {
            this.applyGravity();
            setTimeout(() => {
                this.forceFloatingBubbleCheck();
            }, 800);
        }, 400);
    }

    showComboMessage(count, points) {
        this.messageElement.textContent = `${count}個消去！ +${points}点！`;
        this.messageElement.className = 'message combo';
    }

    updateBombCount() {
        this.bombCountElement.textContent = this.bombCount;
        this.bombItemButton.disabled = this.bombCount <= 0 || !this.gameRunning;
    }

    useBombItem() {
        if (!this.gameRunning || this.bombCount <= 0 || this.selectedBubbles.length === 0) {
            if (this.selectedBubbles.length === 0) {
                this.showMessage('爆弾を使用するには、まずバブルを1つ選択してください！');
            }
            return;
        }

        const centerBubble = this.selectedBubbles[0];
        const centerX = parseFloat(centerBubble.style.left);
        const centerY = parseFloat(centerBubble.style.top);

        const bubblesInRange = [];
        const explosionRadius = 100;

        for (let bubble of this.bubbles) {
            const bubbleX = parseFloat(bubble.style.left);
            const bubbleY = parseFloat(bubble.style.top);
            const distance = Math.sqrt((bubbleX - centerX) ** 2 + (bubbleY - centerY) ** 2);

            if (distance <= explosionRadius) {
                bubblesInRange.push(bubble);
            }
        }

        this.bombCount--;
        this.updateBombCount();

        const points = bubblesInRange.length * 15;
        this.score += points;
        this.updateScore();

        this.explodeBubbles(bubblesInRange, centerX, centerY);
        this.clearSelection();
        this.showMessage(`💥 爆弾で${bubblesInRange.length}個消去！ +${points}点！`);
        this.checkLevelUp();

        setTimeout(() => {
            this.applyGravity();
            setTimeout(() => {
                this.forceFloatingBubbleCheck();
            }, 800);
        }, 400);
    }

    explodeBubbles(bubblesToExplode, centerX, centerY) {
        const explosion = document.createElement('div');
        explosion.style.cssText = `
            position: absolute;
            left: ${centerX - 50}px;
            top: ${centerY - 50}px;
            width: 100px;
            height: 100px;
            background: radial-gradient(circle, rgba(255,255,0,0.8) 0%, rgba(255,100,0,0.6) 50%, transparent 100%);
            border-radius: 50%;
            z-index: 100;
            animation: explode 0.6s ease-out forwards;
        `;

        this.board.appendChild(explosion);

        bubblesToExplode.forEach((bubble, index) => {
            setTimeout(() => {
                bubble.classList.add('popping');
                setTimeout(() => {
                    if (bubble.parentNode) {
                        bubble.parentNode.removeChild(bubble);
                    }
                }, 400);
            }, index * 30);
        });

        this.bubbles = this.bubbles.filter(bubble => !bubblesToExplode.includes(bubble));

        setTimeout(() => {
            if (explosion.parentNode) {
                explosion.parentNode.removeChild(explosion);
            }
        }, 600);
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
    }

    updateLevel() {
        this.levelElement.textContent = this.level;
    }

    checkLevelUp() {
        const newLevel = Math.floor(this.score / 300) + 1; // 300点ごとにレベルアップ
        if (newLevel > this.level) {
            this.level = newLevel;
            this.updateLevel();
            this.gameSpeed = Math.max(3000, this.gameSpeed - 500);
            this.showMessage(`レベルアップ！レベル ${this.level}！`);
            
            if (this.dropInterval) {
                clearInterval(this.dropInterval);
                this.startBubbleDrop();
            }
        }
    }

    showMessage(text) {
        this.messageElement.textContent = text;
        this.messageElement.className = 'message';
    }

    startBubbleDrop() {
        if (this.dropInterval) {
            clearInterval(this.dropInterval);
        }
        
        this.dropInterval = setInterval(() => {
            if (this.gameRunning) {
                this.bubbleLineFromBottom();
            }
        }, this.gameSpeed);
    }

    bubbleLineFromBottom() {
        const { bubbleSize, boardWidth, boardHeight, spacing, bubblesPerRow } = this.dimensions;
        
        if (this.bubbles.length > 80) {
            return;
        }
        
        const fallingBubbles = this.bubbles.filter(bubble => bubble.dataset.falling === 'true');
        if (fallingBubbles.length > 3) {
            setTimeout(() => {
                this.bubbleLineFromBottom();
            }, 300);
            return;
        }
        
        this.pushAllBubblesUpSimple(spacing);
        
        setTimeout(() => {
            const newLineBubbles = [];
            for (let i = 0; i < bubblesPerRow; i++) {
                const bubble = this.createBubble();
                const x = 10 + i * spacing;
                const y = boardHeight - bubbleSize - 10;
                
                bubble.style.left = x + 'px';
                bubble.style.top = y + 'px';
                bubble.dataset.falling = 'false';
                
                bubble.style.transform = 'scale(0)';
                bubble.style.opacity = '0.5';
                
                this.board.appendChild(bubble);
                this.bubbles.push(bubble);
                newLineBubbles.push(bubble);
            }
            
            newLineBubbles.forEach((bubble, index) => {
                setTimeout(() => {
                    bubble.style.transform = 'scale(1)';
                    bubble.style.opacity = '1';
                }, index * 30);
            });
            
            setTimeout(() => {
                if (this.gameRunning) {
                    this.applyGravity();
                    this.checkGameOverCondition();
                }
            }, 100);
        }, 100);
    }

    pushAllBubblesUpSimple(spacing) {
        for (let bubble of this.bubbles) {
            if (bubble.dataset.falling === 'true') continue;
            
            const currentTop = parseFloat(bubble.style.top);
            const newTop = currentTop - spacing;
            bubble.style.top = newTop + 'px';
        }
    }

    applyGravity() {
        const bubblesToFall = [];
        
        for (let bubble of this.bubbles) {
            if (bubble.dataset.falling === 'true') continue;
            
            const bubbleX = parseFloat(bubble.style.left);
            const bubbleY = parseFloat(bubble.style.top);
            
            const supportInfo = this.hasSupport(bubbleX, bubbleY, bubble);
            
            if (!supportInfo.hasSupport) {
                bubblesToFall.push({
                    bubble: bubble,
                    x: bubbleX,
                    y: bubbleY
                });
            }
        }
        
        if (bubblesToFall.length > 0) {
            bubblesToFall.forEach((item, index) => {
                setTimeout(() => {
                    if (item.bubble.parentNode && item.bubble.dataset.falling !== 'true') {
                        item.bubble.dataset.falling = 'true';
                        this.animateBubbleFall(item.bubble);
                    }
                }, index * 20);
            });
            
            setTimeout(() => {
                this.applyGravity();
            }, 500);
        } else {
            this.adjustAllBubblesToGrid();
            
            setTimeout(() => {
                this.applyGravity();
            }, 1200);
        }
    }

    adjustAllBubblesToGrid() {
        for (let bubble of this.bubbles) {
            if (bubble.dataset.falling === 'true') continue;
            this.snapToGrid(bubble);
        }
    }

    animateBubbleFall(bubble) {
        const fallSpeed = 6;
        const { bubbleSize, boardHeight, spacing } = this.dimensions;
        
        const fallInterval = setInterval(() => {
            if (!bubble.parentNode) {
                clearInterval(fallInterval);
                return;
            }
            
            const currentTop = parseFloat(bubble.style.top);
            const currentLeft = parseFloat(bubble.style.left);
            const newTop = currentTop + fallSpeed;
            
            if (newTop >= boardHeight - bubbleSize - 10) {
                bubble.style.top = (boardHeight - bubbleSize - 10) + 'px';
                bubble.dataset.falling = 'false';
                clearInterval(fallInterval);
                setTimeout(() => this.snapToGrid(bubble), 50);
                return;
            }
            
            let collision = false;
            let landingY = null;
            
            for (let otherBubble of this.bubbles) {
                if (otherBubble === bubble || otherBubble.dataset.falling === 'true') continue;
                
                const otherX = parseFloat(otherBubble.style.left);
                const otherY = parseFloat(otherBubble.style.top);
                
                const horizontalDistance = Math.abs(currentLeft - otherX);
                
                if (horizontalDistance < bubbleSize * 0.8) {
                    if (newTop + bubbleSize > otherY && currentTop + bubbleSize <= otherY) {
                        landingY = otherY - spacing;
                        collision = true;
                        break;
                    }
                }
            }
            
            if (collision && landingY !== null) {
                bubble.style.top = landingY + 'px';
                bubble.dataset.falling = 'false';
                clearInterval(fallInterval);
                setTimeout(() => this.snapToGrid(bubble), 50);
            } else if (!collision) {
                bubble.style.top = newTop + 'px';
            } else {
                bubble.dataset.falling = 'false';
                clearInterval(fallInterval);
                setTimeout(() => this.snapToGrid(bubble), 50);
            }
        }, 50);
    }

    snapToGrid(bubble) {
        const { bubbleSize, boardHeight, boardWidth, spacing } = this.dimensions;
        const currentX = parseFloat(bubble.style.left);
        const currentY = parseFloat(bubble.style.top);
        
        let gridX = Math.round((currentX - 10) / spacing) * spacing + 10;
        gridX = Math.max(10, Math.min(gridX, boardWidth - bubbleSize - 10));
        
        const bottomY = boardHeight - bubbleSize - 10;
        const gridY = Math.round((bottomY - currentY) / spacing) * spacing;
        const adjustedY = bottomY - gridY;
        
        bubble.style.left = gridX + 'px';
        bubble.style.top = adjustedY + 'px';
    }

    hasSupport(x, y, currentBubble) {
        const { bubbleSize, boardHeight, spacing } = this.dimensions;
        
        if (y >= boardHeight - bubbleSize - 15) {
            return { hasSupport: true, slideDirection: null };
        }
        
        for (let bubble of this.bubbles) {
            if (bubble === currentBubble || bubble.dataset.falling === 'true') continue;
            
            const bubbleX = parseFloat(bubble.style.left);
            const bubbleY = parseFloat(bubble.style.top);
            
            const verticalDistance = bubbleY - y;
            
            if (verticalDistance > (spacing - 10) && verticalDistance <= (spacing + 10)) {
                const horizontalDistance = Math.abs(x - bubbleX);
                if (horizontalDistance < bubbleSize * 0.9) {
                    return { hasSupport: true, slideDirection: null };
                }
            }
        }
        
        return { hasSupport: false, slideDirection: null };
    }

    startFloatingBubbleCheck() {
        if (this.floatingCheckInterval) {
            clearInterval(this.floatingCheckInterval);
        }
        
        this.floatingCheckInterval = setInterval(() => {
            if (!this.gameRunning) return;
            
            const floatingBubbles = [];
            
            for (let bubble of this.bubbles) {
                if (bubble.dataset.falling === 'true') continue;
                
                const bubbleX = parseFloat(bubble.style.left);
                const bubbleY = parseFloat(bubble.style.top);
                
                if (bubbleY < 400) {
                    const supportInfo = this.hasSupport(bubbleX, bubbleY, bubble);
                    if (!supportInfo.hasSupport) {
                        floatingBubbles.push({
                            bubble: bubble,
                            x: bubbleX,
                            y: bubbleY
                        });
                    }
                }
            }
            
            if (floatingBubbles.length > 0) {
                floatingBubbles.forEach((item, index) => {
                    setTimeout(() => {
                        if (item.bubble.parentNode && item.bubble.dataset.falling !== 'true') {
                            item.bubble.dataset.falling = 'true';
                            this.animateBubbleFall(item.bubble);
                        }
                    }, index * 10);
                });
            }
        }, 8000);
    }

    forceFloatingBubbleCheck() {
        const floatingBubbles = [];
        
        for (let bubble of this.bubbles) {
            if (bubble.dataset.falling === 'true') continue;
            
            const bubbleX = parseFloat(bubble.style.left);
            const bubbleY = parseFloat(bubble.style.top);
            
            if (bubbleY < 460) {
                const supportInfo = this.hasSupport(bubbleX, bubbleY, bubble);
                if (!supportInfo.hasSupport) {
                    floatingBubbles.push({
                        bubble: bubble,
                        x: bubbleX,
                        y: bubbleY
                    });
                }
            }
        }
        
        if (floatingBubbles.length > 0) {
            floatingBubbles.forEach((item, index) => {
                setTimeout(() => {
                    if (item.bubble.parentNode && item.bubble.dataset.falling !== 'true') {
                        item.bubble.dataset.falling = 'true';
                        this.animateBubbleFall(item.bubble);
                    }
                }, index * 5);
            });
        }
    }

    checkGameOverCondition() {
        const gameOverLine = Math.min(60, this.dimensions.boardHeight * 0.12); // 動的なゲームオーバーライン
        
        for (let bubble of this.bubbles) {
            const bubbleTop = parseFloat(bubble.style.top);
            if (bubbleTop <= gameOverLine && bubble.dataset.falling === 'false') {
                this.gameRunning = false;
                if (this.dropInterval) {
                    clearInterval(this.dropInterval);
                }
                if (this.floatingCheckInterval) {
                    clearInterval(this.floatingCheckInterval);
                }
                setTimeout(() => {
                    this.showMessage(`ゲームオーバー！最終スコア: ${this.score}点`);
                }, 500);
                return true;
            }
        }
        return false;
    }
}

// ゲームインスタンス作成
const game = new BubbleGame();

// グローバル関数
function startGame() {
    game.startGame();
}

function clearSelection() {
    game.clearSelection();
}

function useBombItem() {
    game.useBombItem();
}

// ページ読み込み完了時の初期化
document.addEventListener('DOMContentLoaded', () => {
    game.updateBombCount();
    game.updateBoardSize(); // 初期ボードサイズを設定
    
    // ビューポート設定を確認・調整
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
});
