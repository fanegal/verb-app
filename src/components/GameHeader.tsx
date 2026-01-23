interface GameHeaderProps {
  lives: number;
  score: number;
  onExit: () => void;
  onHelp?: () => void; // Opcional, por si algún modo no lleva ayuda
}

export const GameHeader = ({ lives, score, onExit, onHelp }: GameHeaderProps) => {
  return (
    <div className="game-header-new">
      <button className="btn-exit-top" onClick={onExit}>
        SALIR
      </button>

      <div className="stats-container-top">
        <div className="stat-box-life">
          <span className="heart-icon">❤️</span> {lives}
        </div>
        <div className="stat-box-score">
          <span className="star-icon">⭐</span> {score}
        </div>
      </div>

      {/* Solo mostramos el botón de ayuda si el modo lo requiere */}
      {onHelp && (
        <button className="help-btn-inline-top" onClick={onHelp}>
          ?
        </button>
      )}
    </div>
  );
};