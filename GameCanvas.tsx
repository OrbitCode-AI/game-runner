import { useEffect, useRef, useCallback } from 'preact/hooks';
import './GameCanvas.css';

interface GameCanvasProps {
  onScore: (score: number) => void;
  onGameOver: (finalScore: number) => void;
}

function GameCanvas({ onScore, onGameOver }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<{
    running: boolean;
    player: { y: number; vy: number; jumping: boolean };
    obstacles: { x: number; width: number; height: number; scored?: boolean }[];
    score: number;
    speed: number;
  } | null>(null);

  const jump = useCallback(() => {
    const game = gameRef.current;
    if (game && !game.player.jumping) {
      game.player.vy = -15;
      game.player.jumping = true;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    canvas.width = 800;
    canvas.height = 400;
    const W = canvas.width;
    const H = canvas.height;
    const GROUND = H - 60;
    const PLAYER_SIZE = 40;

    gameRef.current = {
      running: true,
      player: { y: GROUND - PLAYER_SIZE, vy: 0, jumping: false },
      obstacles: [],
      score: 0,
      speed: 6,
    };

    let nextObstacle = 100;
    let animationId: number;

    // Update player gravity and ground collision
    const updatePlayerPhysics = (game: NonNullable<typeof gameRef.current>) => {
      game.player.vy += 0.8;
      game.player.y += game.player.vy;
      if (game.player.y >= GROUND - PLAYER_SIZE) {
        game.player.y = GROUND - PLAYER_SIZE;
        game.player.vy = 0;
        game.player.jumping = false;
      }
    };

    // Check AABB collision between player and obstacle
    const checkCollision = (playerY: number, obs: { x: number; width: number; height: number }) => {
      const px = 60, pw = PLAYER_SIZE - 10, ph = PLAYER_SIZE;
      const ox = obs.x, oy = GROUND - obs.height, ow = obs.width, oh = obs.height;
      return px < ox + ow && px + pw > ox && playerY < oy + oh && playerY + ph > oy;
    };

    // Score obstacle if it passed the player
    const scoreIfPassed = (game: NonNullable<typeof gameRef.current>, obs: typeof game.obstacles[0]) => {
      if (obs.x + obs.width < 60 && !obs.scored) {
        obs.scored = true;
        game.score += 10;
        onScore(game.score);
      }
    };

    // Move obstacles, score passed ones, remove off-screen, detect collisions
    const updateObstacles = (game: NonNullable<typeof gameRef.current>): boolean => {
      for (let i = game.obstacles.length - 1; i >= 0; i--) {
        const obs = game.obstacles[i];
        obs.x -= game.speed;
        scoreIfPassed(game, obs);
        if (obs.x < -50) { game.obstacles.splice(i, 1); continue; }
        if (checkCollision(game.player.y, obs)) return true;
      }
      return false;
    };

    const update = () => {
      const game = gameRef.current!;
      if (!game.running) return;

      updatePlayerPhysics(game);

      // Spawn obstacles
      nextObstacle -= game.speed;
      if (nextObstacle <= 0) {
        game.obstacles.push({
          x: W,
          width: 30 + Math.random() * 20,
          height: 30 + Math.random() * 40,
        });
        nextObstacle = 150 + Math.random() * 200;
      }

      if (updateObstacles(game)) {
        game.running = false;
        onGameOver(game.score);
        return;
      }

      game.speed = 6 + game.score / 100;
    };

    const draw = () => {
      const game = gameRef.current!;

      // Clear
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, W, H);

      // Ground
      ctx.fillStyle = '#16213e';
      ctx.fillRect(0, GROUND, W, H - GROUND);

      // Ground line
      ctx.strokeStyle = '#4fc3f7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, GROUND);
      ctx.lineTo(W, GROUND);
      ctx.stroke();

      // Player
      ctx.fillStyle = '#4fc3f7';
      ctx.fillRect(60, game.player.y, PLAYER_SIZE, PLAYER_SIZE);

      // Player eye
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(80, game.player.y + 10, 10, 10);

      // Obstacles
      ctx.fillStyle = '#ff6b6b';
      for (const obs of game.obstacles) {
        ctx.fillRect(obs.x, GROUND - obs.height, obs.width, obs.height);
      }
    };

    const gameLoop = () => {
      update();
      draw();
      if (gameRef.current?.running) {
        animationId = requestAnimationFrame(gameLoop);
      }
    };

    gameLoop();

    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };

    const handleClick = () => jump();

    window.addEventListener('keydown', handleKey);
    canvas.addEventListener('click', handleClick);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', handleKey);
      canvas.removeEventListener('click', handleClick);
      if (gameRef.current) gameRef.current.running = false;
    };
  }, [jump, onScore, onGameOver]);

  return <canvas ref={canvasRef} className="game-canvas" />;
}

// Default export renders component in isolation for preview
export default function GameCanvasPreview() {
  return (
    <div className="preview-container">
      <GameCanvas
        onScore={(s) => console.log('Score:', s)}
        onGameOver={(s) => console.log('Game Over:', s)}
      />
      <p className="preview-hint">Press SPACE or click to jump!</p>
    </div>
  );
}

export { GameCanvas };
