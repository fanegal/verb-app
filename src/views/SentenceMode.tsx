import { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import type { Sentence } from '../models/types';
import { PunchyButton } from '../components/PunchyButton';
import { GameHeader } from '../components/GameHeader';
import { GameOverView } from '../components/GameOverView'; // Componente compartido
import { useGameLogic } from '../hooks/useGameLogic';    // Lógica compartida
import './Views.css';

interface SentenceState extends Sentence {
  selectedWords: string[];
  availableWords: string[];
  isCorrect: boolean | null;
  skipped: boolean;
}

export const SentenceMode = ({ onExit }: { onExit: () => void }) => {
  const [allSentences, setAllSentences] = useState<Sentence[]>([]);
  const [currentSentence, setCurrentSentence] = useState<SentenceState | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Implementamos nuestro Hook compartido
  const game = useGameLogic(5, onExit);

  useEffect(() => {
    const data = dbService.getSentences(100);
    if (data && data.length > 0) {
      setAllSentences(data);
      loadSentence(data[0]);
    }
  }, []);

  const loadSentence = (s: Sentence) => {
    if (!s.english) return;

    const realWords = s.english.split(' ');
    const distractorsPool = [
      'the', 'is', 'are', 'do', 'does', 'did', 'have', 'has', 'to', 'for',
      'with', 'at', 'on', 'in', 'of', 'and', 'but', 'not', 'very', 'more',
      'will', 'would', 'can', 'could', 'should', 'my', 'your', 'his', 'her'
    ];

    const extraWords = distractorsPool
      .filter(w => !realWords.includes(w))
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const allTiles = [...realWords, ...extraWords].sort(() => Math.random() - 0.5);

    setCurrentSentence({
      ...s,
      selectedWords: [],
      availableWords: allTiles,
      isCorrect: null,
      skipped: false
    });
  };

  const handleWordClick = (word: string, index: number) => {
    if (!currentSentence || currentSentence.isCorrect !== null) return;
    const newAvailable = [...currentSentence.availableWords];
    newAvailable.splice(index, 1);
    setCurrentSentence({
      ...currentSentence,
      selectedWords: [...currentSentence.selectedWords, word],
      availableWords: newAvailable
    });
  };

  const handleRemoveWord = (word: string, index: number) => {
    if (!currentSentence || currentSentence.isCorrect !== null) return;
    const newSelected = [...currentSentence.selectedWords];
    newSelected.splice(index, 1);
    setCurrentSentence({
      ...currentSentence,
      selectedWords: newSelected,
      availableWords: [...currentSentence.availableWords, word]
    });
  };

  const checkSentence = () => {
    if (!currentSentence) return;
    const userPhrase = currentSentence.selectedWords.join(' ');
    const isRight = userPhrase === currentSentence.english;

    setCurrentSentence({ ...currentSentence, isCorrect: isRight });

    if (isRight) {
      game.addScore(1); // Sumar puntos via Hook
    } else {
      game.loseLife(1); // Restar vidas via Hook
    }
  };

  const handleSkip = () => {
    if (!currentSentence || game.lives <= 0) return;
    setCurrentSentence({ ...currentSentence, skipped: true, isCorrect: false });
    game.loseLife(1); // Usar Hook
  };

  const handleNext = () => {
    const nextIdx = currentIndex + 1;
    if (nextIdx >= allSentences.length) {
      game.setIsGameOver(true);
    } else {
      setCurrentIndex(nextIdx);
      loadSentence(allSentences[nextIdx]);
    }
  };

  // 1. Pantalla de Game Over Reutilizada
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

  if (!currentSentence) return <div className="loading-screen">CARGANDO...</div>;

  return (
    <div className="view-fade-in">
      <GameHeader lives={game.lives} score={game.score} onExit={onExit} />

      <div className={`verb-card ${currentSentence.isCorrect === true ? 'correct' : currentSentence.isCorrect === false ? 'wrong' : ''}`}>
        <p className="spanish-text" style={{ width: '100%', textAlign: 'center', fontSize: '1.2rem', marginBottom: '20px' }}>
          "{currentSentence.spanish}"
        </p>

        <div className="dropzone">
          {currentSentence.selectedWords.map((word, i) => (
            <button key={i} className="btn-tile" onClick={() => handleRemoveWord(word, i)} disabled={currentSentence.isCorrect !== null}>
              {word}
            </button>
          ))}

        </div>

        {(currentSentence.isCorrect === false || currentSentence.skipped) && (
          <div className="wrong-feedback">
            <p className="wrong-text">LA FRASE ERA:</p>
            <p className="solution">{currentSentence.english}</p>
          </div>
        )}
      </div>

      {currentSentence.isCorrect === null && (
        <div className="tiles-grid">
          {currentSentence.availableWords.map((word, i) => (
            <button key={i} className="btn-tile" onClick={() => handleWordClick(word, i)}>
              {word}
            </button>
          ))}
        </div>
      )}
      <div>
        {currentSentence.isCorrect === null && (
          <PunchyButton onClick={handleSkip} variant="primary" className="w-full">
            ?
          </PunchyButton>
        )}
        <br/>
      </div>

      {currentSentence.isCorrect === null ? (
        <PunchyButton onClick={checkSentence} variant="primary" className="w-full" disabled={currentSentence.selectedWords.length === 0}>
          VERIFICAR
        </PunchyButton>
      ) : (
        <PunchyButton onClick={handleNext} variant="dark" className="w-full">
          SIGUIENTE FRASE ➔
        </PunchyButton>
      )}
    </div>
  );
};