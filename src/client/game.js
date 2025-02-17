// 🎮 Game Client
class Game {
  constructor() {
    // 🏗️ Game Setup
    this.board = document.getElementById('game-board');
    this.socket = new WebSocket(`ws://${window.location.host}`);
    this.pieces = [];
    this.initBoard();
    this.initSocket();
  }

  // 🎨 Initialize Game Board
  initBoard() {
    this.board.innerHTML = '';
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 10; x++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        this.board.appendChild(cell);
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

  // 🎯 Handle Server Messages
  handleServerMessage(type, data) {
    switch(type) {
      case 'board':
        this.updateBoard(data);
        break;
      case 'piece':
        this.updateCurrentPiece(data);
        break;
    }
  }
}

// 🎬 Start Game
window.onload = () => new Game();
