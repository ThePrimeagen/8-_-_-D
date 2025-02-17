// 🎮 Game Server
import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { getRandomPiece, checkCollision, rotatePiece } from './pieces.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🏗️ Server Setup
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// 📁 Serve static files with correct MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.wasm': 'application/wasm',
  '.svg': 'image/svg+xml'
};

app.use(express.static(path.join(__dirname, '../../public'), {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath);
    if (mimeTypes[ext]) {
      res.setHeader('Content-Type', mimeTypes[ext]);
    }
  }
}));

// 🎮 Game Logic
const updateGameState = (board, piece, movement) => {
  // Only update piece position, not board structure
  const newPiece = { ...piece, ...movement };
  return { board, piece: newPiece };
};

const broadcastGameState = () => {
  if (!Array.isArray(gameState.board) || !gameState.currentPiece) {
    console.error('Invalid game state:', gameState);
    return;
  }

  const gameStateUpdate = {
    board: gameState.board,
    currentPiece: gameState.currentPiece
  };

  gameState.players.forEach((player) => {
    player.socket.send(JSON.stringify({
      type: 'gameState',
      data: gameStateUpdate
    }));
  });
};

// 🎮 Handle player input
const handlePlayerInput = (playerId, type, data) => {
  const player = gameState.players.get(playerId);
  if (!player) return;

  switch (type) {
    case 'move':
      if (data.direction) {
        const moveX = data.direction === 'left' ? -1 : 1;
        if (!checkCollision(gameState.board, gameState.currentPiece, moveX, 0)) {
          gameState.currentPiece.x += moveX;
          broadcastGameState();
        }
      }
      break;
    case 'rotate':
      if (data.direction) {
        const rotated = rotatePiece(gameState.currentPiece);
        if (!checkCollision(gameState.board, rotated, 0, 0)) {
          gameState.currentPiece = rotated;
          broadcastGameState();
        }
      }
      break;
    case 'drop':
      if (!checkCollision(gameState.board, gameState.currentPiece, 0, 1)) {
        gameState.currentPiece.y++;
        broadcastGameState();
      }
      break;
  }
};

// 🎲 Game State
const gameState = {
  players: new Map(),
  board: Array(20).fill().map(() => Array(10).fill(0)),
  currentPiece: getRandomPiece(),
  gameLoop: null,
  dropInterval: 1000
};

// ⏰ Game Loop
const startGameLoop = () => {
  if (gameState.gameLoop) return;
  
  gameState.gameLoop = setInterval(() => {
    if (!checkCollision(gameState.board, gameState.currentPiece, 0, 1)) {
      gameState.currentPiece.y++;
      broadcastGameState();
    } else {
      // Lock piece in place
      mergePiece();
      // Clear completed lines
      clearLines();
      // Spawn new piece
      gameState.currentPiece = getRandomPiece();
      
      if (checkCollision(gameState.board, gameState.currentPiece)) {
        // Game Over
        clearInterval(gameState.gameLoop);
        gameState.gameLoop = null;
        broadcastGameOver();
      }
      
      broadcastGameState();
    }
  }, gameState.dropInterval);
};

// 🔒 Merge piece with board
const mergePiece = () => {
  const { shape, x, y, color } = gameState.currentPiece;
  shape.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      if (value) {
        const boardY = y + rowIndex;
        const boardX = x + colIndex;
        if (boardY >= 0 && boardY < gameState.board.length) {
          gameState.board[boardY][boardX] = color;
        }
      }
    });
  });
};

// ✨ Clear completed lines
const clearLines = () => {
  let linesCleared = 0;
  
  for (let y = gameState.board.length - 1; y >= 0; y--) {
    if (gameState.board[y].every(cell => cell !== 0)) {
      // Remove the line
      gameState.board.splice(y, 1);
      // Add new empty line at top
      gameState.board.unshift(Array(10).fill(0));
      linesCleared++;
      y++; // Check the same row again
    }
  }
  
  if (linesCleared > 0) {
    broadcastLinesClear(linesCleared);
  }
};

// 💀 Broadcast game over
const broadcastGameOver = () => {
  gameState.players.forEach((player) => {
    player.socket.send(JSON.stringify({
      type: 'gameOver',
      data: { score: player.score }
    }));
  });
};

// 🔄 WebSocket Connection Handler
wss.on('connection', (socket) => {
  console.log('🎮 Player connected');

  // 📝 Register Player
  const playerId = Date.now().toString();
  gameState.players.set(playerId, { socket, score: 0 });

  // Start game if first player
  if (gameState.players.size === 1) {
    startGameLoop();
  }

  // 📨 Message Handler
  socket.on('message', (msg) => {
    const { type, data } = JSON.parse(msg);
    handlePlayerInput(playerId, type, data);
  });

  // 👋 Disconnect Handler
  socket.on('close', () => {
    gameState.players.delete(playerId);
    console.log('👋 Player disconnected');
    
    // Stop game if no players left
    if (gameState.players.size === 0 && gameState.gameLoop) {
      clearInterval(gameState.gameLoop);
      gameState.gameLoop = null;
    }
  });
});

// 🎯 Start Server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`🎮 Game server running on port ${port}`);
});
