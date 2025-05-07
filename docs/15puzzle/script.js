document.addEventListener('DOMContentLoaded', () => {
    // DOM要素
    const puzzleContainer = document.getElementById('puzzle');
    const previewImage = document.getElementById('previewImage');
    const imageInput = document.getElementById('imageInput');
    const startButton = document.getElementById('startButton');
    const resetButton = document.getElementById('resetButton');
    const toggleNumbersButton = document.getElementById('toggleNumbersButton');
    const difficultySelect = document.getElementById('difficultySelect');
    const moveCountElement = document.getElementById('moveCount');
    const timerElement = document.getElementById('timer');
    const completeMessage = document.getElementById('completeMessage');
    const finalMoveCount = document.getElementById('finalMoveCount');
    const finalTime = document.getElementById('finalTime');
    const playAgainButton = document.getElementById('playAgainButton');

    // ゲーム状態
    let gameState = {
        size: 4,
        tiles: [],
        emptyTile: { row: 0, col: 0 },
        moves: 0,
        startTime: null,
        timerInterval: null,
        isPlaying: false,
        imageUrl: null,
        hasFocus: false,
        showNumbers: false,
        originalPositions: [] // タイルの元の位置を保存
    };

    // デフォルト画像
    const defaultImageUrl = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzNhOTljOSIvPjxjaXJjbGUgY3g9IjIwMCIgY3k9IjIwMCIgcj0iMTAwIiBmaWxsPSIjZmZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNHB4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZmlsbD0iIzMzMyI+MTXjg5Hjgrrjg6s8L3RleHQ+PC9zdmc+';

    // 初期化
    function init() {
        // イベントリスナーの設定
        imageInput.addEventListener('change', handleImageUpload);
        startButton.addEventListener('click', startGame);
        resetButton.addEventListener('click', resetGame);
        toggleNumbersButton.addEventListener('click', toggleNumbers);
        difficultySelect.addEventListener('change', () => {
            gameState.size = parseInt(difficultySelect.value);
            if (gameState.isPlaying) {
                resetGame();
                startGame();
            }
        });
        playAgainButton.addEventListener('click', () => {
            completeMessage.classList.add('hidden');
            resetGame();
        });

        // キーボード操作のイベントリスナーを追加（ページ全体で矢印キーを捕捉）
        document.addEventListener('keydown', handleKeyDown);
        
        // フォーカス管理（視覚的なフィードバック用）
        puzzleContainer.addEventListener('click', () => {
            gameState.hasFocus = true;
            puzzleContainer.classList.add('focused');
        });
        
        document.addEventListener('click', (e) => {
            // パズル以外をクリックしても、矢印キーは引き続き機能する
            // ただし、視覚的なフォーカス表示は消す
            if (!puzzleContainer.contains(e.target)) {
                gameState.hasFocus = false;
                puzzleContainer.classList.remove('focused');
            }
        });

        // デフォルト画像を設定
        setDefaultImage();
        
        // ページ読み込み時にフォーカスを設定
        window.addEventListener('load', () => {
            // ページ読み込み完了時にスタートボタンにフォーカス
            startButton.focus();
        });
    }

    // デフォルト画像を設定
    function setDefaultImage() {
        gameState.imageUrl = defaultImageUrl;
        previewImage.src = defaultImageUrl;
    }

    // 画像アップロード処理
    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                gameState.imageUrl = event.target.result;
                previewImage.src = gameState.imageUrl;
                
                // ゲーム中なら再起動
                if (gameState.isPlaying) {
                    resetGame();
                    startGame();
                }
            };
            reader.readAsDataURL(file);
        }
    }

    // 数字表示の切り替え
    function toggleNumbers() {
        gameState.showNumbers = !gameState.showNumbers;
        
        if (gameState.showNumbers) {
            puzzleContainer.classList.add('show-numbers');
            toggleNumbersButton.textContent = '数字表示: ON';
            toggleNumbersButton.classList.add('active');
        } else {
            puzzleContainer.classList.remove('show-numbers');
            toggleNumbersButton.textContent = '数字表示: OFF';
            toggleNumbersButton.classList.remove('active');
        }
    }

    // ゲーム開始
    function startGame() {
        if (!gameState.imageUrl) {
            alert('画像を選択してください');
            return;
        }

        gameState.isPlaying = true;
        gameState.moves = 0;
        moveCountElement.textContent = '0';
        
        // タイマー開始
        startTimer();
        
        // パズル生成
        createPuzzle();
        
        // ボタン状態更新
        startButton.disabled = true;
        difficultySelect.disabled = true;
        
        // パズルにフォーカスを当てる（少し遅延させて確実にフォーカスされるようにする）
        setTimeout(() => {
            gameState.hasFocus = true;
            puzzleContainer.classList.add('focused');
            puzzleContainer.focus();
            
            // スクロールしてパズルが見えるようにする
            puzzleContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }

    // パズル生成
    function createPuzzle() {
        // パズルコンテナをクリア
        puzzleContainer.innerHTML = '';
        
        // 数字表示の状態を反映
        if (gameState.showNumbers) {
            puzzleContainer.classList.add('show-numbers');
        } else {
            puzzleContainer.classList.remove('show-numbers');
        }
        
        const size = gameState.size;
        const tileSize = 400 / size;
        
        // タイル配列を初期化
        gameState.tiles = [];
        gameState.originalPositions = [];
        
        // 画像を読み込んでからタイルを作成
        const img = new Image();
        img.onload = function() {
            // タイルを作成
            for (let row = 0; row < size; row++) {
                gameState.tiles[row] = [];
                gameState.originalPositions[row] = [];
                for (let col = 0; col < size; col++) {
                    // 最後のタイルは空白にする
                    if (row === size - 1 && col === size - 1) {
                        gameState.emptyTile = { row, col };
                        gameState.tiles[row][col] = createTile(row, col, true);
                        gameState.originalPositions[row][col] = { row, col, isEmpty: true };
                    } else {
                        gameState.tiles[row][col] = createTile(row, col, false);
                        gameState.originalPositions[row][col] = { row, col, isEmpty: false };
                    }
                    puzzleContainer.appendChild(gameState.tiles[row][col]);
                }
            }
            
            // パズルをシャッフル
            shufflePuzzle();
        };
        img.src = gameState.imageUrl;
        
        // タイル作成関数
        function createTile(row, col, isEmpty) {
            const tile = document.createElement('div');
            tile.className = isEmpty ? 'tile empty' : 'tile';
            tile.style.width = `${tileSize}px`;
            tile.style.height = `${tileSize}px`;
            tile.style.transform = `translate(${col * tileSize}px, ${row * tileSize}px)`;
            
            if (!isEmpty) {
                // 背景画像の位置を調整
                tile.style.backgroundImage = `url(${gameState.imageUrl})`;
                tile.style.backgroundSize = `${size * tileSize}px ${size * tileSize}px`;
                tile.style.backgroundPosition = `-${col * tileSize}px -${row * tileSize}px`;
                
                // タイル番号を追加
                const tileNumber = document.createElement('div');
                tileNumber.className = 'tile-number';
                tileNumber.textContent = row * size + col + 1;
                tile.appendChild(tileNumber);
                
                // データ属性に元の位置を保存
                tile.dataset.originalRow = row;
                tile.dataset.originalCol = col;
                
                // アクセシビリティのための属性を追加
                tile.setAttribute('role', 'button');
                tile.setAttribute('aria-label', `タイル ${row * size + col + 1}`);
            } else {
                // 空白タイルにもアクセシビリティ情報を追加
                tile.setAttribute('aria-label', '空白タイル');
            }
            
            // クリックイベント
            tile.addEventListener('click', () => {
                if (gameState.isPlaying && !isEmpty) {
                    moveTile(row, col);
                    
                    // クリック時にフォーカス表示を更新
                    gameState.hasFocus = true;
                    puzzleContainer.classList.add('focused');
                }
            });
            
            return tile;
        }
    }

    // パズルをシャッフル
    function shufflePuzzle() {
        const size = gameState.size;
        const moves = size * size * 20; // シャッフルの回数
        
        // ランダムな方向に複数回移動させる
        for (let i = 0; i < moves; i++) {
            const { row, col } = gameState.emptyTile;
            const possibleMoves = [];
            
            // 上下左右の移動可能なタイルを確認
            if (row > 0) possibleMoves.push({ r: row - 1, c: col }); // 上
            if (row < size - 1) possibleMoves.push({ r: row + 1, c: col }); // 下
            if (col > 0) possibleMoves.push({ r: row, c: col - 1 }); // 左
            if (col < size - 1) possibleMoves.push({ r: row, c: col + 1 }); // 右
            
            // ランダムに選択して移動
            const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            swapTiles(move.r, move.c, row, col);
        }
        
        // シャッフル中のムーブはカウントしない
        gameState.moves = 0;
        moveCountElement.textContent = '0';
    }

    // タイルを移動
    function moveTile(row, col) {
        const { row: emptyRow, col: emptyCol } = gameState.emptyTile;
        
        // 空白タイルに隣接しているか確認
        if (
            (row === emptyRow && Math.abs(col - emptyCol) === 1) || 
            (col === emptyCol && Math.abs(row - emptyRow) === 1)
        ) {
            // タイルを交換
            swapTiles(row, col, emptyRow, emptyCol);
            
            // 移動回数を更新
            gameState.moves++;
            moveCountElement.textContent = gameState.moves;
            
            // クリアチェック
            checkCompletion();
        }
    }

    // タイルを交換
    function swapTiles(row1, col1, row2, col2) {
        const tile1 = gameState.tiles[row1][col1];
        const tile2 = gameState.tiles[row2][col2];
        const tileSize = 400 / gameState.size;
        
        // DOM要素の位置を更新
        tile1.style.transform = `translate(${col2 * tileSize}px, ${row2 * tileSize}px)`;
        tile2.style.transform = `translate(${col1 * tileSize}px, ${row1 * tileSize}px)`;
        
        // 配列内の参照を更新
        gameState.tiles[row1][col1] = tile2;
        gameState.tiles[row2][col2] = tile1;
        
        // 空白タイルの位置を更新
        if (row2 === gameState.emptyTile.row && col2 === gameState.emptyTile.col) {
            gameState.emptyTile = { row: row1, col: col1 };
        } else if (row1 === gameState.emptyTile.row && col1 === gameState.emptyTile.col) {
            gameState.emptyTile = { row: row2, col: col2 };
        }
    }

    // クリアチェック
    function checkCompletion() {
        const size = gameState.size;
        let isComplete = true;
        
        // すべてのタイルが正しい位置にあるか確認
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const tile = gameState.tiles[row][col];
                
                // 空白タイルは右下にあるべき
                if (row === size - 1 && col === size - 1) {
                    if (!tile.classList.contains('empty')) {
                        isComplete = false;
                        break;
                    }
                } else if (tile.classList.contains('empty')) {
                    // 空白タイルが右下以外にある場合
                    isComplete = false;
                    break;
                } else {
                    // タイルの元の位置を確認
                    const originalRow = parseInt(tile.dataset.originalRow);
                    const originalCol = parseInt(tile.dataset.originalCol);
                    
                    if (originalRow !== row || originalCol !== col) {
                        isComplete = false;
                        break;
                    }
                }
            }
            
            if (!isComplete) break;
        }
        
        // クリア判定
        if (isComplete) {
            gameCompleted();
        }
    }

    // ゲームクリア時の処理
    function gameCompleted() {
        gameState.isPlaying = false;
        clearInterval(gameState.timerInterval);
        
        // クリアエフェクトを表示
        showCompletionEffect();
        
        // クリアメッセージを表示（少し遅延させる）
        setTimeout(() => {
            finalMoveCount.textContent = gameState.moves;
            finalTime.textContent = timerElement.textContent;
            completeMessage.classList.remove('hidden');
            completeMessage.classList.add('celebration');
            
            // アニメーション終了後にクラスを削除
            setTimeout(() => {
                completeMessage.classList.remove('celebration');
            }, 500);
            
            // ボタン状態を更新
            startButton.disabled = false;
            difficultySelect.disabled = false;
        }, 1000);
    }

    // クリア時のエフェクト表示
    function showCompletionEffect() {
        // パズル全体を光らせる
        puzzleContainer.classList.add('celebration');
        setTimeout(() => {
            puzzleContainer.classList.remove('celebration');
        }, 500);
        
        // 紙吹雪エフェクト
        createConfetti();
    }

    // 紙吹雪エフェクトの作成
    function createConfetti() {
        const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', 
                       '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', 
                       '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
        
        // 紙吹雪の形状
        const shapes = [
            'circle', 'square', 'triangle'
        ];
        
        // 紙吹雪の数
        const confettiCount = 150;
        
        // 紙吹雪のコンテナを作成（パフォーマンス向上のため）
        const confettiContainer = document.createElement('div');
        confettiContainer.style.position = 'fixed';
        confettiContainer.style.top = '0';
        confettiContainer.style.left = '0';
        confettiContainer.style.width = '100%';
        confettiContainer.style.height = '100%';
        confettiContainer.style.pointerEvents = 'none';
        confettiContainer.style.zIndex = '90';
        document.body.appendChild(confettiContainer);
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            // ランダムな色を設定
            const color = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.backgroundColor = color;
            
            // ランダムな形状を設定
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            if (shape === 'circle') {
                confetti.style.borderRadius = '50%';
            } else if (shape === 'triangle') {
                confetti.style.width = '0';
                confetti.style.height = '0';
                confetti.style.backgroundColor = 'transparent';
                confetti.style.borderLeft = '5px solid transparent';
                confetti.style.borderRight = '5px solid transparent';
                confetti.style.borderBottom = `10px solid ${color}`;
            }
            
            // ランダムなサイズを設定（5px〜15px）
            const size = Math.random() * 10 + 5;
            confetti.style.width = `${size}px`;
            confetti.style.height = `${size}px`;
            
            // ランダムな位置を設定
            confetti.style.left = `${Math.random() * 100}%`;
            
            // ランダムなアニメーション時間と遅延を設定
            confetti.style.animationDuration = `${Math.random() * 3 + 2}s`; // 2-5秒
            confetti.style.animationDelay = `${Math.random() * 0.5}s`; // 0-0.5秒の遅延
            
            confettiContainer.appendChild(confetti);
        }
        
        // アニメーション終了後にコンテナごと削除（メモリリーク防止）
        setTimeout(() => {
            confettiContainer.remove();
        }, 6000);
    }

    // タイマー開始
    function startTimer() {
        // 既存のタイマーをクリア
        if (gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
        }
        
        gameState.startTime = new Date();
        timerElement.textContent = '00:00';
        
        gameState.timerInterval = setInterval(() => {
            const currentTime = new Date();
            const elapsedTime = Math.floor((currentTime - gameState.startTime) / 1000);
            
            const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
            const seconds = (elapsedTime % 60).toString().padStart(2, '0');
            
            timerElement.textContent = `${minutes}:${seconds}`;
        }, 1000);
    }

    // ゲームリセット
    function resetGame() {
        // タイマーをクリア
        if (gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
        }
        
        // ゲーム状態をリセット
        gameState.isPlaying = false;
        gameState.moves = 0;
        moveCountElement.textContent = '0';
        timerElement.textContent = '00:00';
        
        // ボタン状態を更新
        startButton.disabled = false;
        difficultySelect.disabled = false;
        
        // パズルコンテナをクリア
        puzzleContainer.innerHTML = '';
    }
    
    // キーボード操作の処理
    function handleKeyDown(e) {
        // ゲームが開始されていない場合は処理しない
        if (!gameState.isPlaying) return;
        
        // 矢印キーの場合は常に処理する（フォーカスに関係なく）
        if (e.key.startsWith('Arrow')) {
            const { row, col } = gameState.emptyTile;
            let tileToMove = null;
            
            switch (e.key) {
                case 'ArrowUp':
                    // 空白タイルの下にあるタイルを上に移動
                    if (row < gameState.size - 1) {
                        tileToMove = { row: row + 1, col: col };
                    }
                    break;
                case 'ArrowDown':
                    // 空白タイルの上にあるタイルを下に移動
                    if (row > 0) {
                        tileToMove = { row: row - 1, col: col };
                    }
                    break;
                case 'ArrowLeft':
                    // 空白タイルの右にあるタイルを左に移動
                    if (col < gameState.size - 1) {
                        tileToMove = { row: row, col: col + 1 };
                    }
                    break;
                case 'ArrowRight':
                    // 空白タイルの左にあるタイルを右に移動
                    if (col > 0) {
                        tileToMove = { row: row, col: col - 1 };
                    }
                    break;
            }
            
            // タイルを移動
            if (tileToMove) {
                e.preventDefault(); // ページのスクロールを防止
                
                // パズルにフォーカスを当てる（視覚的なフィードバック用）
                if (!gameState.hasFocus) {
                    gameState.hasFocus = true;
                    puzzleContainer.classList.add('focused');
                }
                
                moveTile(tileToMove.row, tileToMove.col);
            }
        }
    }

    // 初期化を実行
    init();
});
