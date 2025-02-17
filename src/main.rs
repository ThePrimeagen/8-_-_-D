mod tetris;
use axum::{
    extract::{State, WebSocketUpgrade, ws::{WebSocket, Message}},
    response::Html,
    routing::{get, post},
    Router,
    response::IntoResponse,
};
use tetris::t;
use futures::{sink::SinkExt, stream::StreamExt};
use serde::{Deserialize, Serialize};
use std::{sync::Arc, net::SocketAddr};
use tokio::sync::{broadcast, Mutex};
use tower_http::services::ServeDir;

// AppState with single-letter fields
#[derive(Clone)]
struct S {
    g: Arc<Mutex<G>>,  // game
    t: broadcast::Sender<M>,  // tx
}

// Single-letter type aliases for brevity
type B = Vec<Vec<u8>>; // Board
type P = (usize, usize, u8, u8); // Position (x, y, type, rotation)
type V = Vec<u8>; // Votes
type M = (usize, u8); // Move (player_id, direction)

#[derive(Clone, Serialize, Deserialize)]
struct G {
    b: B,         // board
    p: Option<P>, // current piece
    s: u32,       // score
    v: V,         // votes
    t: u64,       // tick
    a: bool,      // active game
}

impl G {
    fn n() -> Self {
        G {
            b: vec![vec![0; 10]; 20],
            p: None,
            s: 0,
            v: vec![0; 4],
            t: 0,
            a: true,
        }
    }

    // m: move piece based on votes
    fn m(&mut self) {
        if !self.a { return; }
        
        let d = self.v.iter().enumerate()
            .max_by_key(|(_, &c)| c)
            .map(|(i, _)| i)
            .unwrap_or(2); // default down
        
        if let Some((x, y, t, r)) = self.p {
            let p = t::a[t as usize];
            let rotated = if r > 0 {
                let mut tmp = p;
                for _ in 0..r { tmp = t::r(tmp); }
                tmp
            } else { p };
            
            let (nx, ny) = match d {
                0 => (x.saturating_sub(1), y), // left
                1 => (x + 1, y),               // right
                2 => (x, y + 1),               // down
                3 => (x, y),                   // rotate
                _ => (x, y),
            };
            
            if !t::c(&self.b, rotated, nx as i32, ny as i32) {
                self.p = Some((nx, ny, t, if d == 3 { (r + 1) % 4 } else { r }));
            } else if d == 2 {
                // Lock piece and spawn new one
                self.l();
            }
        } else {
            // Spawn new piece
            self.s();
        }
        
        // Reset votes
        self.v = vec![0; 4];
    }
    
    // l: lock piece
    fn l(&mut self) {
        if let Some((x, y, t, r)) = self.p {
            let p = t::a[t as usize];
            let rotated = if r > 0 {
                let mut tmp = p;
                for _ in 0..r { tmp = t::r(tmp); }
                tmp
            } else { p };
            
            for i in 0..4 {
                for j in 0..4 {
                    if rotated[i][j] {
                        let ny = y + i;
                        let nx = x + j;
                        if ny < 20 && nx < 10 {
                            self.b[ny][nx] = t as u8 + 1;
                        }
                    }
                }
            }
            
            self.p = None;
            self.c(); // Check for completed lines
        }
    }
    
    // s: spawn new piece
    fn s(&mut self) {
        use rand::Rng;
        let mut rng = rand::thread_rng();
        let t = rng.gen_range(0..7);
        self.p = Some((3, 0, t, 0));
    }
    
    // c: clear completed lines
    fn c(&mut self) {
        let mut y = 19;
        while y >= 0 {
            if self.b[y].iter().all(|&c| c != 0) {
                for ny in (1..=y).rev() {
                    self.b[ny] = self.b[ny-1].clone();
                }
                self.b[0] = vec![0; 10];
                self.s += 100;
            } else {
                y -= 1;
            }
        }
    }
}

#[tokio::main]
async fn main() {
    let g = Arc::new(Mutex::new(G::n()));
    let (t, _) = broadcast::channel::<M>(100);
    let s = S { g, t };
    
    let a = Router::new()
        .route("/s", get(g_state))
        .route("/m/:d", post(m))
        .route("/p", get(p))
        .route("/ws", get(w))
        .nest_service("/", ServeDir::new("static"))
        .with_state(s);

    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    println!("Server running on http://localhost:3000");
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    println!("Server running on http://localhost:3000");
    
    axum::serve(listener, a).await.unwrap();
}

#[axum::debug_handler]
async fn g_state(State(s): State<S>) -> Html<String> {
    let g = s.g.lock().await;
    let mut h = String::new();
    
    for r in &g.b {
        for &c in r {
            let e = match c {
                0 => "⬜",
                1 => "🟦",
                2 => "🟨",
                3 => "🟩",
                4 => "🟥",
                5 => "🟧",
                6 => "🟪",
                _ => "🟫",
            };
            h.push_str(&format!("<div class=\"c\">{}</div>", e));
        }
    }
    
    Html(h)
}

#[axum::debug_handler]
async fn m(State(s): State<S>) -> &'static str {
    let mut g = s.g.lock().await;
    g.m();
    "ok"
}

#[axum::debug_handler]
async fn p(State(s): State<S>) -> Html<String> {
    let g = s.g.lock().await;
    Html(format!("<div>Score: {}</div>", g.s))
}

#[axum::debug_handler]
async fn w(ws: WebSocketUpgrade, State(s): State<S>) -> impl IntoResponse {
    ws.on_upgrade(|ws| handle_ws(ws, s))
}

async fn handle_ws(ws: WebSocket, s: S) {
    let mut r = s.t.subscribe();
    
    let (mut tx, mut rx) = ws.split();
    
    tokio::spawn(async move {
        while let Ok(msg) = r.recv().await {
            if tx.send(Message::Text(serde_json::to_string(&msg).unwrap())).await.is_err() {
                break;
            }
        }
    });
    
    while let Some(Ok(msg)) = rx.next().await {
        if let Message::Text(t) = msg {
            if let Ok(m) = serde_json::from_str::<M>(&t) {
                let _ = s.t.send(m);
            }
        }
    }
}
