import './Menu.css';

interface MenuProps {
  title: string;
  subtitle?: string;
  highScore?: number;
  onStart: () => void;
  buttonText?: string;
}

function Menu({ title, subtitle, highScore, onStart, buttonText = 'Start Game' }: MenuProps) {
  return (
    <div className="menu">
      <div className="menu-content">
        <h1 className="menu-title">{title}</h1>
        {subtitle && <p className="menu-subtitle">{subtitle}</p>}
        {highScore !== undefined && highScore > 0 && (
          <p className="menu-highscore">High Score: {highScore}</p>
        )}
        <button className="menu-button" onClick={onStart}>
          {buttonText}
        </button>
        <p className="menu-hint">Press SPACE or click to jump over obstacles</p>
      </div>
    </div>
  );
}

// Default export renders component in isolation for preview
export default function MenuPreview() {
  return (
    <Menu
      title="Pixel Runner"
      subtitle="Avoid the obstacles!"
      highScore={500}
      onStart={() => alert('Game starting!')}
    />
  );
}

export { Menu };
