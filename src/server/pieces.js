// 🧩 Tetris Pieces
export const tetrisPieces = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: '#00f0f0'
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: '#f0f000'
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#a000f0'
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    color: '#00f000'
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    color: '#f00000'
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#0000f0'
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#f0a000'
  }
};

// 🎲 Get random piece
export const getRandomPiece = () => {
  const pieces = Object.keys(tetrisPieces);
  const piece = pieces[Math.floor(Math.random() * pieces.length)];
  return {
    ...tetrisPieces[piece],
    x: 3,
    y: 0,
    rotation: 0
  };
};

// 🔄 Rotate piece
export const rotatePiece = (piece) => {
  const { shape } = piece;
  const N = shape.length;
  const rotated = Array(N).fill().map(() => Array(N).fill(0));
  
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      rotated[x][N - 1 - y] = shape[y][x];
    }
  }
  
  return { ...piece, shape: rotated };
};

// 💥 Check collision
export const checkCollision = (board, piece, moveX = 0, moveY = 0) => {
  const { shape, x, y } = piece;
  
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const newX = x + col + moveX;
        const newY = y + row + moveY;
        
        if (
          newX < 0 || 
          newX >= board[0].length ||
          newY >= board.length ||
          (newY >= 0 && board[newY][newX])
        ) {
          return true;
        }
      }
    }
  }
  
  return false;
};
