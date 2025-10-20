// 2048 Game Implementation

class Game2048 {
    constructor() {
        this.gridSize = 4;
        this.grid = [];
        this.score = 0;
        this.bestScore = localStorage.getItem('bestScore2048') || 0;
        this.gameOver = false;
        this.won = false;

        this.initDOM();
        this.setupEventListeners();
        this.newGame();
    }

    initDOM() {
        this.boardElement = document.getElementById('game-board');
        this.scoreElement = document.getElementById('score');
        this.bestScoreElement = document.getElementById('best-score');
        this.messageElement = document.getElementById('game-message');
        this.messageTextElement = document.getElementById('message-text');

        this.bestScoreElement.textContent = this.bestScore;

        // Create grid cells (background)
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.style.left = `${col * 117.5 + 10}px`;
                cell.style.top = `${row * 117.5 + 10}px`;
                this.boardElement.appendChild(cell);
            }
        }
    }

    setupEventListeners() {
        document.getElementById('new-game-btn').addEventListener('click', () => this.newGame());
        document.getElementById('try-again-btn').addEventListener('click', () => this.newGame());

        document.addEventListener('keydown', (e) => {
            if (this.gameOver && !this.won) return;

            const keyMap = {
                'ArrowUp': 'up',
                'ArrowDown': 'down',
                'ArrowLeft': 'left',
                'ArrowRight': 'right'
            };

            if (keyMap[e.key]) {
                e.preventDefault();
                this.move(keyMap[e.key]);
            }
        });
    }

    newGame() {
        // Clear grid
        this.grid = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(0));
        this.score = 0;
        this.gameOver = false;
        this.won = false;

        // Clear tiles
        const tiles = this.boardElement.querySelectorAll('.tile');
        tiles.forEach(tile => tile.remove());

        // Hide message
        this.messageElement.classList.add('hidden');

        // Add initial tiles
        this.addRandomTile();
        this.addRandomTile();

        this.updateScore();
        this.render();
    }

    addRandomTile() {
        const emptyCells = [];
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }

        if (emptyCells.length > 0) {
            const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[row][col] = Math.random() < 0.9 ? 2 : 4;
            return { row, col, value: this.grid[row][col] };
        }

        return null;
    }

    move(direction) {
        if (this.gameOver) return;

        let moved = false;
        const originalGrid = JSON.parse(JSON.stringify(this.grid));

        // Prepare grid based on direction
        if (direction === 'up') {
            moved = this.moveUp();
        } else if (direction === 'down') {
            moved = this.moveDown();
        } else if (direction === 'left') {
            moved = this.moveLeft();
        } else if (direction === 'right') {
            moved = this.moveRight();
        }

        if (moved) {
            const newTile = this.addRandomTile();
            this.render();

            if (newTile) {
                setTimeout(() => {
                    const tileElement = this.getTileElement(newTile.row, newTile.col);
                    if (tileElement) {
                        tileElement.classList.add('new');
                    }
                }, 150);
            }

            this.updateScore();
            this.checkGameState();
        }
    }

    moveLeft() {
        let moved = false;

        for (let row = 0; row < this.gridSize; row++) {
            const tiles = this.grid[row].filter(val => val !== 0);
            const merged = [];

            for (let i = 0; i < tiles.length; i++) {
                if (i < tiles.length - 1 && tiles[i] === tiles[i + 1]) {
                    merged.push(tiles[i] * 2);
                    this.score += tiles[i] * 2;
                    i++; // Skip next tile
                } else {
                    merged.push(tiles[i]);
                }
            }

            while (merged.length < this.gridSize) {
                merged.push(0);
            }

            if (JSON.stringify(this.grid[row]) !== JSON.stringify(merged)) {
                moved = true;
                this.grid[row] = merged;
            }
        }

        return moved;
    }

    moveRight() {
        let moved = false;

        for (let row = 0; row < this.gridSize; row++) {
            const tiles = this.grid[row].filter(val => val !== 0);
            const merged = [];

            for (let i = tiles.length - 1; i >= 0; i--) {
                if (i > 0 && tiles[i] === tiles[i - 1]) {
                    merged.unshift(tiles[i] * 2);
                    this.score += tiles[i] * 2;
                    i--; // Skip next tile
                } else {
                    merged.unshift(tiles[i]);
                }
            }

            while (merged.length < this.gridSize) {
                merged.unshift(0);
            }

            if (JSON.stringify(this.grid[row]) !== JSON.stringify(merged)) {
                moved = true;
                this.grid[row] = merged;
            }
        }

        return moved;
    }

    moveUp() {
        let moved = false;

        for (let col = 0; col < this.gridSize; col++) {
            const tiles = [];
            for (let row = 0; row < this.gridSize; row++) {
                if (this.grid[row][col] !== 0) {
                    tiles.push(this.grid[row][col]);
                }
            }

            const merged = [];
            for (let i = 0; i < tiles.length; i++) {
                if (i < tiles.length - 1 && tiles[i] === tiles[i + 1]) {
                    merged.push(tiles[i] * 2);
                    this.score += tiles[i] * 2;
                    i++; // Skip next tile
                } else {
                    merged.push(tiles[i]);
                }
            }

            while (merged.length < this.gridSize) {
                merged.push(0);
            }

            // Check if column changed
            let changed = false;
            for (let row = 0; row < this.gridSize; row++) {
                if (this.grid[row][col] !== merged[row]) {
                    changed = true;
                }
                this.grid[row][col] = merged[row];
            }

            if (changed) moved = true;
        }

        return moved;
    }

    moveDown() {
        let moved = false;

        for (let col = 0; col < this.gridSize; col++) {
            const tiles = [];
            for (let row = 0; row < this.gridSize; row++) {
                if (this.grid[row][col] !== 0) {
                    tiles.push(this.grid[row][col]);
                }
            }

            const merged = [];
            for (let i = tiles.length - 1; i >= 0; i--) {
                if (i > 0 && tiles[i] === tiles[i - 1]) {
                    merged.unshift(tiles[i] * 2);
                    this.score += tiles[i] * 2;
                    i--; // Skip next tile
                } else {
                    merged.unshift(tiles[i]);
                }
            }

            while (merged.length < this.gridSize) {
                merged.unshift(0);
            }

            // Check if column changed
            let changed = false;
            for (let row = 0; row < this.gridSize; row++) {
                if (this.grid[row][col] !== merged[row]) {
                    changed = true;
                }
                this.grid[row][col] = merged[row];
            }

            if (changed) moved = true;
        }

        return moved;
    }

    render() {
        // Remove all existing tiles
        const tiles = this.boardElement.querySelectorAll('.tile');
        tiles.forEach(tile => tile.remove());

        // Create new tiles
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const value = this.grid[row][col];
                if (value !== 0) {
                    const tile = document.createElement('div');
                    tile.className = 'tile';
                    tile.classList.add(`tile-${value > 2048 ? 'super' : value}`);
                    tile.textContent = value;
                    tile.style.left = `${col * 117.5 + 10}px`;
                    tile.style.top = `${row * 117.5 + 10}px`;
                    tile.dataset.row = row;
                    tile.dataset.col = col;
                    this.boardElement.appendChild(tile);
                }
            }
        }
    }

    getTileElement(row, col) {
        const tiles = this.boardElement.querySelectorAll('.tile');
        for (let tile of tiles) {
            if (parseInt(tile.dataset.row) === row && parseInt(tile.dataset.col) === col) {
                return tile;
            }
        }
        return null;
    }

    updateScore() {
        this.scoreElement.textContent = this.score;

        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.bestScoreElement.textContent = this.bestScore;
            localStorage.setItem('bestScore2048', this.bestScore);
        }
    }

    checkGameState() {
        // Check for 2048 tile (win condition)
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] === 2048 && !this.won) {
                    this.won = true;
                    this.showMessage('You Win!');
                    return;
                }
            }
        }

        // Check for available moves
        if (!this.hasAvailableMoves()) {
            this.gameOver = true;
            this.showMessage('Game Over!');
        }
    }

    hasAvailableMoves() {
        // Check for empty cells
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] === 0) {
                    return true;
                }
            }
        }

        // Check for possible merges
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const current = this.grid[row][col];

                // Check right
                if (col < this.gridSize - 1 && this.grid[row][col + 1] === current) {
                    return true;
                }

                // Check down
                if (row < this.gridSize - 1 && this.grid[row + 1][col] === current) {
                    return true;
                }
            }
        }

        return false;
    }

    showMessage(text) {
        this.messageTextElement.textContent = text;
        this.messageElement.classList.remove('hidden');
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
