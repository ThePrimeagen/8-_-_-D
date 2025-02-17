// 🎮 Game Client
class Game_🎮 {
  constructor() {
    // 🏗️ Game Setup
    this.board_🎯 = document.getElementById('game-board');
    this.socket_🔌 = new WebSocket(`ws://${window.location.host}`);
    this.cells_📦 = [];
    this.score_🏆 = 0;
    this.gameOver_💀 = false;
    
    this.initBoard_🎨();
    this.initSocket_🎧();
    this.initControls_🎮();
  }

  // 🎨 Initialize Game Board
  initBoard_🎨() {
    this.board_🎯.innerHTML = '';
    this.cells_📦 = Array(20).fill().map(() => Array(10).fill(null));
    
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 10; x++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        this.board_🎯.appendChild(cell);
        this.cells_📦[y][x] = cell;
      }
    }
  }

  // 🎧 Setup WebSocket Listeners
  initSocket_🎧() {
    this.socket_🔌.onmessage = (msg) => {
      const { type, data } = JSON.parse(msg.data);
      this.handleServerMessage_📨(type, data);
    };
  }

  // 🎮 Initialize Controls
  initControls_🎮() {
    document.addEventListener('keydown', (event) => {
      if (this.gameOver_💀) return;
      
      switch(event.key) {
        case 'ArrowLeft':
          this.sendInput_📤('move', { direction: 'left' });
          break;
        case 'ArrowRight':
          this.sendInput_📤('move', { direction: 'right' });
          break;
        case 'ArrowDown':
          this.sendInput_📤('drop');
          break;
        case 'ArrowUp':
          this.sendInput_📤('rotate', { direction: 'right' });
          break;
        case 'z':
          this.sendInput_📤('rotate', { direction: 'left' });
          break;
      }
    });
  }

  // 📨 Handle Server Messages
  handleServerMessage_📨(type, data) {
    switch(type) {
      case 'gameState':
        this.updateBoard_🔄(data.board);
        break;
      case 'gameOver':
        this.handleGameOver_💀(data);
        break;
      case 'linesCleared':
        this.updateScore_🏆(data.lines);
        break;
    }
  }

  // 🔄 Update Board
  updateBoard_🔄(board) {
    board.forEach((row, y) => {
      row.forEach((cell, x) => {
        this.cells_📦[y][x].style.backgroundColor = cell || '';
        this.cells_📦[y][x].classList.toggle('filled', !!cell);
      });
    });
  }

  // 📤 Send Input to Server
  sendInput_📤(type, data = {}) {
    this.socket_🔌.send(JSON.stringify({ type, data }));
  }

  // 💀 Handle Game Over
  handleGameOver_💀(data) {
    this.gameOver_💀 = true;
    this.score_🏆 = data.score;
    alert(`Game Over! Score: ${this.score_🏆}`);
  }

  // 🏆 Update Score
  updateScore_🏆(lines) {
    const points = [0, 100, 300, 500, 800];
    this.score_🏆 += points[lines] || 0;
    // Update score display if we had one
  }
}

// 🎬 Start Game
window.onload = () => new Game_🎮();
