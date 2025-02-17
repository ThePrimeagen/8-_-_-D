## Project Creation Prompt Response
Alright, you magnificent chaos enthusiasts, buckle up because we're about to embark on a journey of unhinged creativity. After sifting through the delightful madness, the most recurring theme is... 🏴‍☠️ Pirate Tetris with a Bussy Twist 🏴‍☠️. This project is guaranteed to make your boss proud and possibly question your sanity, but hey, that's the point!

**Project Title: Bussy Pirate Tetris Extravaganza**

**Project Description:**
Set sail on a high-seas adventure with \"Bussy Pirate Tetris Extravaganza,\" a web-based game that combines the strategic block-stacking of Tetris with the swashbuckling antics of pirate life. Players will navigate the treacherous waters of a pirate-themed grid, strategically placing bussy-shaped blocks to clear lines and score points. Each successful line clearance triggers an explosion of bananas, adding to the nautical chaos. The game features an upbeat pirate soundtrack and cheeky commentary from our beloved pirate gorilla mascot, Captain Bananabeard.

**Key Features:**
- **Pirate-Themed Graphics:** Immerse yourself in a world of pirate ships, treasure maps, and bussy-shaped Tetris blocks.
- **Interactive Multiplayer Mode:** Collaborate or compete with fellow pirate enthusiasts online to claim the title of Bussy Tetris Champion.
- **Banana Explosions:** Every cleared line results in a satisfying burst of bananas, because why not?
- **Gorilla Pirate Mascot:** Captain Bananabeard guides you through the game with witty pirate banter and gorilla analogies.
- **MonoToneMoe's GitHub Credit:** Acknowledging the source of inspiration by crediting MonoToneMoe's GitHub in the README, because it's VERY IMPORTANT.

**Technical Requirements:**
- Developed using HTMX for dynamic interactions without relying on React.
- WebSocket integration for real-time multiplayer functionality.
- Ensures random failures to keep players on their toes, because unpredictability is the spice of life.

**Catchphrase:**
\"Hello prime. I can put anything I want here.\" This catchphrase will be emblazoned across the game in bold red letters, ensuring our legal safety while adding a touch of mystery.

So, grab your eye patches and banana peels, and let's create a masterpiece that will leave everyone questioning their reality. Remember, credit MonoToneMoe's GitHub, and let the bussy pirate adventure begin! 🏴‍☠️🍌

## Build Instructions

### Prerequisites
- Node.js v18+ (recommended v18.19.1)
- npm or yarn

### Setup and Run
1. Clone the repository:
```bash
git clone https://github.com/ThePrimeagen/8-_-_-D.git
cd 8-_-_-D
```

2. Install dependencies:
```bash
npm install
```

3. Build the client bundle:
```bash
# Build the client-side JavaScript bundle
npm run build:client

# Watch for changes during development (optional)
npm run build:client -- --watch
```

4. Start the server:
```bash
npm start
```

4. Open in browser:
- Multiplayer Tetris: http://localhost:3000
- ASCII Art Viewer: http://localhost:3000/wasm.html

### WASM ASCII Art Build (Optional)
If you want to rebuild the WASM component:

1. Install Emscripten:
```bash
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
```

2. Build WASM:
```bash
cd src/wasm
emcc handsome.c -o handsome.html -s NO_EXIT_RUNTIME=1 -s "EXPORTED_RUNTIME_METHODS=['ccall']"
```

## ASCII Art Gallery
```
    /\___/\   🧀
   (  o o  )  
   (  =^=  ) 
    (______)  
  
   Cheese Hunter
```

## Maintainers
- **cyber_absolution** - Core Maintainer
- **PirateSoftware** - Core Maintainer

## Credits
Special thanks to:
- **MonoToneMoe** - For providing the inspiration for this project through their GitHub work
- **cyber_absolution** - For maintaining and enhancing the project

