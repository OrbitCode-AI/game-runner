# Game Runner (Pixel Runner) - Agent Guide

## Architecture

- **App.tsx** — Entry point. Manages game state machine (`menu | playing | gameover`), `score`, and `highScore` via `useVar` from `orbitcode`. Renders `Menu` (for both menu and game-over screens), or `GameCanvas` + `HUD` during play.
- **GameCanvas.tsx** — Canvas-based auto-scrolling runner (800x400). Runs a `requestAnimationFrame` loop. Player is fixed at x=60 with gravity physics; jumps via Space/ArrowUp/click. Obstacles spawn at random intervals from the right edge. AABB collision detection ends the game. Speed increases with score (`6 + score/100`). Uses `useRef` for mutable game state to avoid re-renders.
- **HUD.tsx** — Overlay displaying current score and control hints.
- **Menu.tsx** — Reusable menu screen with configurable `title`, `subtitle`, `highScore`, and `buttonText` props. Used for both the start menu and game-over screen.
- **styles.css** — Global styles. Each component also imports its own CSS file.

Data flow: `App` owns persistent state and passes `onScore` (setter) and `onGameOver` to `GameCanvas`. `GameCanvas` manages all internal game state (player position/velocity, obstacles, speed) via a `useRef` object — not component state — to avoid re-renders during the game loop.

## Styling

- Separate `.css` files per component: `GameCanvas.css`, `HUD.css`, `Menu.css`, plus `styles.css` for globals.
- Plain CSS class selectors (e.g., `.game-container`, `.hud-score`). Not CSS modules.
- Dark theme: `#1a1a2e` background, `#4fc3f7` player/ground-line, `#ff6b6b` obstacles.

## Extension Points

- Add new obstacle types (varying shapes, moving obstacles) by extending the obstacle object in `GameCanvas.tsx` with a `type` field and branching in the draw/collision logic.
- Add power-ups (shield, slow-motion) by creating a new entity array in the game loop following the obstacle pattern.
- Add visual polish (parallax backgrounds, particle effects) in the `draw` function without changing game logic.

## Constraints

- Game state lives in a `useRef`, not `useState`, so mutating it does not trigger re-renders. The `onScore` and `onGameOver` callbacks bridge internal state to the Preact component tree.
