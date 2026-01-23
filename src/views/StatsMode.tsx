import { useEffect, useState } from 'react';
import { dbService } from '../services/dbService';
import type { Score } from '../models/types';
import { PunchyButton } from '../components/PunchyButton';

import './Views.css'

export const StatsMode = ({ onExit }: { onExit: () => void }) => {
  const [scores, setScores] = useState<Score[]>([]);

  useEffect(() => {
    const data = dbService.getScores();
    setScores(data);
  }, []);

  return (
    <div className="view-fade-in">
      <div className="game-header">
        <PunchyButton onClick={onExit} variant="secondary">VOLVER</PunchyButton>
        <div className="badge">HISTORIAL</div>
      </div>

      <div className="verb-card">
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>TOP SCORES</h2>

        {scores.length === 0 ? (
          <p style={{ textAlign: 'center', opacity: 0.6 }}>
            No hay récords aún. ¡Ponte a practicar!
          </p>
        ) : (
          <table className="score-table">
            <thead>
              <tr>
                <th>PLAYER</th>
                <th>SCORE</th>
                <th>DATE</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((s, i) => (
                <tr key={i}>
                  <td>{s.player}</td>
                  <td>{s.score}</td> 
                  <td>
                    {new Date(s.date).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};