import { PunchyButton } from './PunchyButton';

interface GameOverProps {
  score: number;
  lives: number;
  playerName: string;
  setPlayerName: (name: string) => void;
  onSave: () => void;
  onExit: () => void;
  hasSaved: boolean;
}

export const GameOverView = ({ score, lives, playerName, setPlayerName, onSave, onExit, hasSaved }: GameOverProps) => (
  <div className="view-fade-in">
    <h1 className="hero-title">{lives > 0 ? '¡CAMPEÓN!' : 'GAME OVER'}</h1>
    <div className="verb-card" style={{ textAlign: 'center' }}>
      <h2 style={{ fontSize: '2.5rem' }}>{score} PUNTOS</h2>
      {!hasSaved ? (
        <div style={{ marginTop: '20px' }}>
          <input 
            className="game-input" 
            placeholder="TU NOMBRE..." 
            value={playerName} 
            onChange={e => setPlayerName(e.target.value)} 
            style={{ width: '100%', marginBottom: '15px' }} 
          />
          <PunchyButton onClick={onSave} variant="success" className="w-full" disabled={!playerName.trim()}>
            REGISTRAR RÉCORD
          </PunchyButton>
        </div>
      ) : <p style={{ color: 'var(--success)', fontWeight: 'bold' }}>¡GUARDADO!</p>}
    </div>
    <PunchyButton onClick={onExit} variant="secondary" className="w-full" style={{ marginTop: '10px' }}>
      VOLVER AL MENÚ
    </PunchyButton>
  </div>
);