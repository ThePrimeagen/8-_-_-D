const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');

// Single-letter variables as per requirements
const a = express();
const h = http.createServer(a);
const w = new WebSocketServer({ server: h });

// Game state with single-letter variables
let g = {
    b: Array(20).fill().map(() => Array(10).fill(0)), // board
    p: null,  // current piece
    s: 0,     // score
    v: [0, 0, 0, 0], // votes
    t: 0,     // tick
    a: true   // active
};

// p: pieces array (same as Rust implementation)
const p = [
    [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], // I
    [[1,1,0,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]], // O
    [[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]], // T
    [[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]], // S
    [[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]], // Z
    [[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]], // J
    [[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]  // L
];

// r: rotate piece
const r = (m) => {
    const n = Array(4).fill().map(() => Array(4).fill(0));
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            n[i][j] = m[3-j][i];
        }
    }
    return n;
};

// c: check collision
const c = (b, p, x, y) => {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (p[i][j]) {
                const nx = x + j;
                const ny = y + i;
                if (nx < 0 || nx >= 10 || ny < 0 || ny >= 20 || b[ny][nx] !== 0) {
                    return true;
                }
            }
        }
    }
    return false;
};

// m: move piece based on votes
const m = () => {
    if (!g.a) return;
    
    const d = g.v.indexOf(Math.max(...g.v));
    
    if (g.p) {
        const [x, y, t, r] = g.p;
        let piece = p[t];
        let rotated = piece;
        for (let i = 0; i < r; i++) rotated = r(rotated);
        
        const [nx, ny] = {
            0: [x-1, y],   // left
            1: [x+1, y],   // right
            2: [x, y+1],   // down
            3: [x, y]      // rotate
        }[d] || [x, y];
        
        if (!c(g.b, rotated, nx, ny)) {
            g.p = [nx, ny, t, d === 3 ? (r + 1) % 4 : r];
        } else if (d === 2) {
            l(); // lock piece
        }
    } else {
        n(); // spawn new piece using renamed function
    }
    
    g.v = [0, 0, 0, 0]; // reset votes
};

// l: lock piece
const l = () => {
    if (g.p) {
        const [x, y, t, r] = g.p;
        let piece = p[t];
        let rotated = piece;
        for (let i = 0; i < r; i++) rotated = r(rotated);
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (rotated[i][j]) {
                    const ny = y + i;
                    const nx = x + j;
                    if (ny < 20 && nx < 10) {
                        g.b[ny][nx] = t + 1;
                    }
                }
            }
        }
        
        g.p = null;
        clearLines();
    }
};

// n: spawn new piece (renamed from s to avoid conflict)
const n = () => {
    const t = Math.floor(Math.random() * 7);
    g.p = [3, 0, t, 0];
};

// Clear completed lines
const clearLines = () => {
    for (let y = 19; y >= 0; y--) {
        if (g.b[y].every(cell => cell !== 0)) {
            for (let ny = y; ny > 0; ny--) {
                g.b[ny] = [...g.b[ny-1]];
            }
            g.b[0] = Array(10).fill(0);
            g.s += 100;
            y++; // recheck same line
        }
    }
};

// Serve static files
a.use(express.static('static'));

// Game state endpoint (renamed from /s to /b for board)
a.get('/b', (q, r) => {
    let h = '';
    const display = g.b.map(row => [...row]);
    
    if (g.p) {
        const [x, y, t, rot] = g.p;
        let piece = p[t];
        let rotated = piece;
        for (let i = 0; i < rot; i++) rotated = r(rotated);
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (rotated[i][j] && y + i < 20 && x + j < 10) {
                    display[y + i][x + j] = t + 1;
                }
            }
        }
    }
    
    for (const row of display) {
        for (const cell of row) {
            const e = ['⬜','🟦','🟨','🟩','🟥','🟧','🟪','🟫'][cell];
            h += `<div class="c">${e}</div>`;
        }
    }
    
    r.send(h);
});

// Move endpoint
a.post('/m/:d', (q, r) => {
    const directions = { l: 0, r: 1, d: 2, t: 3 };
    g.v[directions[q.params.d]]++;
    m();
    r.send('ok');
});

// Score endpoint
a.get('/p', (q, r) => {
    r.send(`<div>Score: ${g.s}</div>`);
});

// WebSocket handling
w.on('connection', (ws) => {
    console.log('New WebSocket connection established');
    
    // Send initial game state
    ws.send(JSON.stringify(g));
    
    ws.on('message', (msg) => {
        try {
            const data = JSON.parse(msg);
            // Handle incoming votes
            if (data.type === 'vote') {
                g.v[data.direction]++;
                m();
                // Broadcast updated state
                w.clients.forEach(client => {
                    if (client.readyState === 1) {
                        client.send(JSON.stringify(g));
                    }
                });
            }
        } catch (e) {
            console.error('Error processing message:', e);
        }
    });
});

// Game tick
setInterval(() => {
    g.v[2]++; // Add downward vote each tick
    m();
    g.t++;
}, 1000);

const port = 3000;
h.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
