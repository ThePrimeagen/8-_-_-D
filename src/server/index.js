// 🎮 Game Server
import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🏗️ Server Setup
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// 📁 Serve static files
app.use(express.static(path.join(__dirname, '../../public')));

// 🎮 Game Logic
const updateGameState = (board, piece, movement) => {
  // Update game state based on movement
  return { ...board, piece: { ...piece, ...movement } };
};

const broadcastGameState = () => {
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
        gameState.board = updateGameState(
          gameState.board,
          gameState.currentPiece,
          { x: data.direction === 'left' ? -1 : 1 }
        );
        broadcastGameState();
      }
      break;
    case 'rotate':
      if (data.direction) {
        gameState.board = updateGameState(
          gameState.board,
          gameState.currentPiece,
          { rotation: data.direction === 'left' ? -90 : 90 }
        );
        broadcastGameState();
      }
      break;
    case 'drop':
      gameState.board = updateGameState(
        gameState.board,
        gameState.currentPiece,
        { y: 1 }
      );
      broadcastGameState();
      break;
  }
};
      break;
  }
};

// 🎲 Game State
const gameState = {
  players: new Map(),
  board: Array(20).fill().map(() => Array(10).fill(0)),
  currentPiece: null
};

// 🔄 WebSocket Connection Handler
wss.on('connection', (socket) => {
  console.log('🎮 Player connected');

  // 📝 Register Player
  const playerId = Date.now().toString();
  gameState.players.set(playerId, { socket, score: 0 });

  // 📨 Message Handler
  socket.on('message', (msg) => {
    const { type, data } = JSON.parse(msg);
    handlePlayerInput(playerId, type, data);
  });

  // 👋 Disconnect Handler
  socket.on('close', () => {
    gameState.players.delete(playerId);
    console.log('👋 Player disconnected');
  });
});

// 🎯 Start Server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`🎮 Game server running on port ${port}`);
});
