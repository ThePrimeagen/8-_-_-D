// Tetris game logic with single-letter variables
pub mod t {
    // p: pieces array
    pub const a: [[[bool; 4]; 4]; 7] = [
        // I piece
        [[false, false, false, false],
         [true, true, true, true],
         [false, false, false, false],
         [false, false, false, false]],
        // O piece
        [[true, true, false, false],
         [true, true, false, false],
         [false, false, false, false],
         [false, false, false, false]],
        // T piece
        [[false, true, false, false],
         [true, true, true, false],
         [false, false, false, false],
         [false, false, false, false]],
        // S piece
        [[false, true, true, false],
         [true, true, false, false],
         [false, false, false, false],
         [false, false, false, false]],
        // Z piece
        [[true, true, false, false],
         [false, true, true, false],
         [false, false, false, false],
         [false, false, false, false]],
        // J piece
        [[true, false, false, false],
         [true, true, true, false],
         [false, false, false, false],
         [false, false, false, false]],
        // L piece
        [[false, false, true, false],
         [true, true, true, false],
         [false, false, false, false],
         [false, false, false, false]],
    ];

    // r: rotate piece
    pub fn r(p: [[bool; 4]; 4]) -> [[bool; 4]; 4] {
        let mut n = [[false; 4]; 4];
        for i in 0..4 {
            for j in 0..4 {
                n[i][j] = p[3-j][i];
            }
        }
        n
    }

    // c: check collision
    pub fn c(b: &[Vec<u8>], p: [[bool; 4]; 4], x: i32, y: i32) -> bool {
        for i in 0..4 {
            for j in 0..4 {
                if p[i][j] {
                    let nx = x + j as i32;
                    let ny = y + i as i32;
                    if nx < 0 || nx >= 10 || ny < 0 || ny >= 20 || b[ny as usize][nx as usize] != 0 {
                        return true;
                    }
                }
            }
        }
        false
    }
}
