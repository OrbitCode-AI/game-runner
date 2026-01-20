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
    const W = canvas.width = 800;
    const H = canvas.height = 400;
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

    const update = () => {
      const game = gameRef.current!;
      if (!game.running) return;

      // Player physics
      game.player.vy += 0.8; // gravity
      game.player.y += game.player.vy;

      if (game.player.y >= GROUND - PLAYER_SIZE) {
        game.player.y = GROUND - PLAYER_SIZE;
        game.player.vy = 0;
        game.player.jumping = false;
      }

      // Spawn obstacles
      nextObstacle -= game.speed;
      if (nextObstacle <= 0) {
        const height = 30 + Math.random() * 40;
        game.obstacles.push({
          x: W,
          width: 30 + Math.random() * 20,
          height,
        });
        nextObstacle = 150 + Math.random() * 200;
      }

      // Update obstacles
      for (let i = game.obstacles.length - 1; i >= 0; i--) {
        game.obstacles[i].x -= game.speed;

        // Score when passed
        if (game.obstacles[i].x + game.obstacles[i].width < 60 && !game.obstacles[i].scored) {
          game.obstacles[i].scored = true;
          game.score += 10;
          onScore(game.score);
        }

        // Remove off-screen
        if (game.obstacles[i].x < -50) {
          game.obstacles.splice(i, 1);
        }

        // Collision detection
        const obs = game.obstacles[i];
        if (obs) {
          const playerBox = { x: 60, y: game.player.y, w: PLAYER_SIZE - 10, h: PLAYER_SIZE };
          const obsBox = { x: obs.x, y: GROUND - obs.height, w: obs.width, h: obs.height };

          if (
            playerBox.x < obsBox.x + obsBox.w &&
            playerBox.x + playerBox.w > obsBox.x &&
            playerBox.y < obsBox.y + obsBox.h &&
            playerBox.y + playerBox.h > obsBox.y
          ) {
            game.running = false;
            onGameOver(game.score);
            return;
          }
        }
      }

      // Increase speed over time
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
