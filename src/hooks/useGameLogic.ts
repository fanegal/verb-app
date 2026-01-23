import { useState, useCallback } from 'react';
import { dbService } from '../services/dbService';

export const useGameLogic = (initialLives: number = 5, onExit: () => void) => {
  const [lives, setLives] = useState(initialLives);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [hasSaved, setHasSaved] = useState(false);

  // Reducir vidas y activar Game Over si llega a 0
  const loseLife = useCallback((amount: number = 1) => {
    setLives((prev) => {
      const updated = Math.max(0, prev - amount);
      if (updated <= 0) {
        // Pequeño delay para que el usuario vea el error antes del Game Over
        setTimeout(() => setIsGameOver(true), 900);
      }
      return updated;
    });
  }, []);

  const addScore = useCallback((amount: number = 10) => {
    setScore((prev) => prev + amount);
  }, []);

  const saveFinalScore = async () => {
    if (playerName.trim()) {
      await dbService.saveScore(playerName.trim(), score);
      setHasSaved(true);
      setTimeout(onExit, 1500);
    }
  };

  return {
    lives,
    score,
    isGameOver,
    setIsGameOver,
    playerName,
    setPlayerName,
    hasSaved,
    loseLife,
    addScore,
    saveFinalScore
  };
};