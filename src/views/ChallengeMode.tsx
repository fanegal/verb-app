import { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import type { Challenge } from '../models/types';
import { PunchyButton } from '../components/PunchyButton';
import { GameHeader } from '../components/GameHeader';
import { GameOverView } from '../components/GameOverView'; // Importar componente compartido
import { useGameLogic } from '../hooks/useGameLogic';    // Importar lógica compartida

export const ChallengeMode = ({ onExit }: { onExit: () => void }) => {
  const [data, setData] = useState<Challenge[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Inicializamos el Hook (5 vidas por defecto)
  const game = useGameLogic(5, onExit);

  useEffect(() => {
    const questions = dbService.getChallenges(100);
    setData(questions);
  }, []);

  const handleAnswer = (option: string) => {
    if (selectedOption || game.isGameOver) return;
    setSelectedOption(option);

    if (option === data[currentIdx].correct) {
      game.addScore(10); // Usar Hook para puntos
    } else {
      game.loseLife(1);  // Usar Hook para vidas
    }
  };

  const handleSkip = () => {
    if (selectedOption || game.lives <= 0) return;
    setSelectedOption(data[currentIdx].correct);
    game.loseLife(1); // Saltar cuesta una vida, usar Hook
  };

  const handleNext = () => {
    if (currentIdx + 1 >= data.length) {
      game.setIsGameOver(true);
    } else {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
    }
  };

  // 1. Pantalla de carga
  if (data.length === 0) return <div className="loading">Cargando retos...</div>;

  // 2. Pantalla de Game Over Reutilizable
  if (game.isGameOver) {
    return (
      <GameOverView 
        score={game.score} 
        lives={game.lives} 
        playerName={game.playerName} 
        setPlayerName={game.setPlayerName}
        onSave={game.saveFinalScore} 
        onExit={onExit} 
        hasSaved={game.hasSaved}
      />
    );
  }

  const current = data[currentIdx];

  return (
    <div className="view-fade-in challenge-layout">
      <GameHeader
        lives={game.lives}
        score={game.score}
        onExit={onExit}
      />

      <div className="card-question-main">
        <p className="spanish-text-header">"{current.spanish}"</p>

        <div className="drop-zone-challenge">
          <div className="sentence-container">
            <h2 className="english-sentence">
              {current.sentence.split('___').map((part, i, arr) => (
                <span key={i} className="sentence-part">
                  {part}
                  {i < arr.length - 1 && (
                    <span className="blank-line">
                      {selectedOption ? (
                        <span className="selected-word-display animate-pop">
                          {selectedOption}
                        </span>
                      ) : (
                        <span className="dots-placeholder">........</span>
                      )}
                    </span>
                  )}
                </span>
              ))}
            </h2>
          </div>
          <button className="help-btn-inline" onClick={handleSkip}>?</button>
        </div>
      </div>

      <div className="options-container-grid">
        {current.options.map((opt) => (
          <PunchyButton
            key={opt}
            variant={selectedOption ? (opt === current.correct ? "success" : opt === selectedOption ? "danger" : "secondary") : "primary"}
            onClick={() => handleAnswer(opt)}
          >
            {opt.toUpperCase()}
          </PunchyButton>
        ))}
      </div>

      <div className="action-footer">
        <PunchyButton
          onClick={selectedOption ? handleNext : () => { }}
          variant={selectedOption ? "dark" : "secondary"}
          className="btn-full-width"
        >
          {selectedOption ? "CONTINUAR →" : "VERIFICAR"}
        </PunchyButton>
      </div>
    </div>
  );
};