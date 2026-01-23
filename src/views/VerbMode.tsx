import { useState, useEffect, useRef } from 'react';
import { dbService } from '../services/dbService';
import type { Verb } from '../models/types';
import { PunchyButton } from '../components/PunchyButton';
import { GameHeader } from '../components/GameHeader';
import { GameOverView } from './GameOverView'; // Nuevo
import { useGameLogic } from '../hooks/useGameLogic'; // Nuevo
import './Views.css';

interface VerbState extends Verb {
    userAnswer: string;
    isCorrect: boolean | null;
    skipped: boolean;
}

export const VerbMode = ({ onExit }: { onExit: () => void }) => {
    const [allVerbs, setAllVerbs] = useState<Verb[]>([]);
    const [currentGroup, setCurrentGroup] = useState<VerbState[]>([]);
    const [groupIndex, setGroupIndex] = useState(0);
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    // USAMOS EL HOOK PARA TODA LA LÓGICA DE PUNTOS Y VIDAS
    const game = useGameLogic(5, onExit);

    useEffect(() => {
        const data = dbService.getVerbs(100);
        if (data && data.length > 0) {
            setAllVerbs(data);
            loadNextGroup(data, 0);
        }
    }, []);

    const loadNextGroup = (data: Verb[], index: number) => {
        const nextFive = data.slice(index, index + 5).map(v => ({
            ...v,
            userAnswer: '',
            isCorrect: null,
            skipped: false
        }));
        setCurrentGroup(nextFive);
        setTimeout(() => inputsRef.current[0]?.focus(), 100);
    };

    const checkGroup = () => {
        let errors = 0;
        const updatedGroup = currentGroup.map(verb => {
            if (verb.skipped) return verb;
            const isRight = verb.userAnswer.trim().toLowerCase() === verb.english.toLowerCase();
            if (!isRight) errors++;
            else game.addScore(1); // Sumar puntos via Hook
            return { ...verb, isCorrect: isRight };
        });

        setCurrentGroup(updatedGroup);
        if (errors > 0) game.loseLife(errors); // Restar vidas via Hook
    };

    const handleSkipVerb = (index: number) => {
        if (game.lives <= 0) return;
        const newGroup = [...currentGroup];
        newGroup[index] = { ...newGroup[index], skipped: true, isCorrect: false, userAnswer: "???" };
        setCurrentGroup(newGroup);
        
        game.loseLife(1); // Restar vida via Hook

        if (index < currentGroup.length - 1) {
            setTimeout(() => inputsRef.current[index + 1]?.focus(), 10);
        }
    };

    const handleNextGroup = () => {
        const nextIndex = groupIndex + 5;
        if (nextIndex >= allVerbs.length) game.setIsGameOver(true);
        else {
            setGroupIndex(nextIndex);
            loadNextGroup(allVerbs, nextIndex);
        }
    };

    // PANTALLA DE GAME OVER (REUTILIZADA)
    if (game.isGameOver) {
        return (
            <GameOverView 
                score={game.score} lives={game.lives} 
                playerName={game.playerName} setPlayerName={game.setPlayerName}
                onSave={game.saveFinalScore} onExit={onExit} hasSaved={game.hasSaved}
            />
        );
    }

    if (currentGroup.length === 0) return <div className="loading-screen">CARGANDO...</div>;

    return (
        <div className="view-fade-in">
            <GameHeader lives={game.lives} score={game.score} onExit={onExit} />

            <div className="group-container">
                {currentGroup.map((verb, index) => (
                    <div key={verb.id} className={`verb-card ${verb.isCorrect === true ? 'correct' : (verb.isCorrect === false || verb.skipped) ? 'wrong' : ''}`} style={{ padding: '12px', marginBottom: '8px' }}>
                        <div className="verb-row">
                            <span className="spanish-text" style={{ fontSize: '0.9rem' }}>{verb.spanish}</span>
                            <div style={{ display: 'flex', gap: '5px', flex: 1 }}>
                                <input
                                    ref={(el) => { inputsRef.current[index] = el; }}
                                    className="game-input"
                                    style={{ padding: '6px', fontSize: '1rem' }}
                                    value={verb.userAnswer}
                                    disabled={verb.isCorrect !== null || verb.skipped}
                                    onChange={e => {
                                        const newGroup = [...currentGroup];
                                        newGroup[index].userAnswer = e.target.value;
                                        setCurrentGroup(newGroup);
                                    }}
                                />
                                {verb.isCorrect === null && !verb.skipped && (
                                    <button className="btn-tile" onClick={() => handleSkipVerb(index)} tabIndex={-1}>?</button>
                                )}
                            </div>
                        </div>
                        {(verb.isCorrect === false || verb.skipped) && (
                            <p className="wrong-text" style={{ margin: '5px 0 0 0', fontSize: '0.8rem' }}>ERA: {verb.english.toUpperCase()}</p>
                        )}
                    </div>
                ))}
            </div>

            {currentGroup.every(v => v.isCorrect !== null) ? (
                <PunchyButton onClick={handleNextGroup} variant="dark" className="w-full">SIGUIENTES 5 ➔</PunchyButton>
            ) : (
                <PunchyButton onClick={checkGroup} variant="primary" className="w-full">VERIFICAR BLOQUE</PunchyButton>
            )}
        </div>
    );
};