import './HUD.css';

interface HUDProps {
  score: number;
}

function HUD({ score }: HUDProps) {
  return (
    <div className="hud">
      <div className="hud-score">
        <span className="hud-label">SCORE</span>
        <span className="hud-value">{score}</span>
      </div>
      <div className="hud-controls">
        <span>SPACE / Click to Jump</span>
      </div>
    </div>
  );
}

// Default export renders component in isolation for preview
export default function HUDPreview() {
  return (
    <div className="preview-container">
      <HUD score={1250} />
    </div>
  );
}

export { HUD };
