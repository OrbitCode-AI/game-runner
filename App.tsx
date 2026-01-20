import { useVar } from 'orbitcode';
import { GameCanvas } from './GameCanvas';
import { HUD } from './HUD';
import { Menu } from './Menu';
import './styles.css';

export default function App() {
  const [gameState, setGameState] = useVar<'menu' | 'playing' | 'gameover'>('runnerState', 'menu');
  const [score, setScore] = useVar('runnerScore', 0);
  const [highScore, setHighScore] = useVar('runnerHighScore', 0);

  const handleStart = () => {
    setScore(0);
    setGameState('playing');
  };

  const handleGameOver = (finalScore: number) => {
    if (finalScore > highScore) {
      setHighScore(finalScore);
    }
    setGameState('gameover');
  };

  return (
    <div className="game-container">
      {gameState === 'menu' && (
        <Menu
          title="Pixel Runner"
          subtitle="Avoid the obstacles!"
          highScore={highScore}
          onStart={handleStart}
        />
      )}
      {gameState === 'playing' && (
        <>
          <GameCanvas onScore={setScore} onGameOver={handleGameOver} />
          <HUD score={score} />
        </>
      )}
      {gameState === 'gameover' && (
        <Menu
          title="Game Over!"
          subtitle={`Score: ${score}`}
          highScore={highScore}
          onStart={handleStart}
          buttonText="Play Again"
        />
      )}
    </div>
  );
}
