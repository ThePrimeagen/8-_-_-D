// 🎮 Game Client
class Game {
  constructor() {
    // 🏗️ Game Setup
    this.board = document.getElementById('game-board');
    this.socket = new WebSocket(`ws://${window.location.host}`);
    this.cells = [];
    this.score = 0;
    this.gameOver = false;
    
    this.initBoard();
    this.initSocket();
    this.initControls();
    this.initRestartButton();
  }
  
  // 🔄 Initialize Restart Button
  initRestartButton() {
    const restartButton = document.getElementById('restart-button');
    restartButton.addEventListener('click', () => {
      this.socket.send(JSON.stringify({ type: 'restart' }));
    });
  }

  // 🎨 Initialize Game Board
  initBoard() {
    this.board.innerHTML = '';
    this.cells = Array(20).fill().map(() => Array(10).fill(null));
    
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 10; x++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        this.board.appendChild(cell);
        this.cells[y][x] = cell;
      }
    }
  }

  // 🎧 Setup WebSocket Listeners
  initSocket() {
    this.socket.onmessage = (msg) => {
      const { type, data } = JSON.parse(msg.data);
      this.handleServerMessage(type, data);
    };
  }

  // 🎮 Initialize Controls
  initControls() {
    document.addEventListener('keydown', (event) => {
      if (this.gameOver) return;
      
      switch(event.key) {
        case 'ArrowLeft':
          this.sendInput('move', { direction: 'left' });
          break;
        case 'ArrowRight':
          this.sendInput('move', { direction: 'right' });
          break;
        case 'ArrowDown':
          this.sendInput('drop');
          break;
        case 'ArrowUp':
          this.sendInput('rotate', { direction: 'right' });
          break;
        case 'z':
          this.sendInput('rotate', { direction: 'left' });
          break;
      }
    });
  }

  // 📨 Handle Server Messages
  handleServerMessage(type, data) {
    switch(type) {
      case 'gameState':
        if (data && data.board) {
          this.updateBoard(data.board, data.currentPiece);
        } else {
          console.error('Invalid game state data received:', data);
        }
        break;
      case 'gameOver':
        this.handleGameOver(data);
        break;
      case 'linesCleared':
        this.updateScore(data.lines);
        break;
    }
  }

  // 🔄 Update Board
  updateBoard(board, currentPiece) {
    if (!Array.isArray(board)) {
      console.error('Invalid board data received:', board);
      return;
    }
    
    // Clear all cells first
    this.cells.forEach(row => {
      row.forEach(cell => {
        cell.style.backgroundColor = '';
        cell.classList.remove('filled');
      });
    });
    
    // Draw the board
    board.forEach((row, y) => {
      if (!Array.isArray(row)) {
        console.error('Invalid row data received:', row);
        return;
      }
      row.forEach((cell, x) => {
        if (this.cells[y] && this.cells[y][x] && cell) {
          this.cells[y][x].style.backgroundColor = cell;
          this.cells[y][x].classList.add('filled');
        }
      });
    });
    
    // Draw the current piece
    if (currentPiece && currentPiece.shape) {
      const { shape, x, y, color } = currentPiece;
      shape.forEach((row, pieceY) => {
        row.forEach((cell, pieceX) => {
          if (cell) {
            const boardY = y + pieceY;
            const boardX = x + pieceX;
            if (this.cells[boardY] && this.cells[boardY][boardX]) {
              this.cells[boardY][boardX].style.backgroundColor = color;
              this.cells[boardY][boardX].classList.add('filled');
            }
          }
        });
      });
    }
  }

  // 📤 Send Input to Server
  sendInput(type, data = {}) {
    this.socket.send(JSON.stringify({ type, data }));
  }

  // 💀 Handle Game Over
  handleGameOver(data) {
    this.gameOver = true;
    this.score = data.score;
    alert(`Game Over! Score: ${this.score}`);
  }

  // 🏆 Update Score
  updateScore(lines) {
    const points = [0, 100, 300, 500, 800];
    this.score += points[lines] || 0;
    document.getElementById('score').textContent = this.score;
    // Update score display if we had one
  }
}

// 🎬 Start Game
window.onload = () => new Game();
