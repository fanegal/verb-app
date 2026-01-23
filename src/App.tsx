import { useEffect, useState } from 'react';
import { dbService } from './services/dbService';

import { VerbMode } from './views/VerbMode';
import { SentenceMode } from './views/SentenceMode';
import { StatsMode } from './views/StatsMode';
import { ChallengeMode } from './views/ChallengeMode'; // Importar el nuevo modo

import { PunchyButton } from './components/PunchyButton';
import './App.css';

// Agregamos 'challenges' a los tipos de vista
type View = 'menu' | 'verbs' | 'sentences' | 'challenges' | 'stats';

export default function App() {
  const [view, setView] = useState<View>('menu');
  const [isReady, setIsReady] = useState(false);

  // Inicialización única con todas las tablas
useEffect(() => {
  const setup = async () => {
    try {
      await dbService.init();
      // Ahora sí, llamamos a los inits uno por uno
      dbService.initVerbs();
      dbService.initSentences();
      dbService.initChallenges();
      
      setIsReady(true);
    } catch (error) {
      console.error("Error inicializando base de datos:", error);
    }
  };
  setup();
}, []);

  if (!isReady) {
    return (
      <div className="loading-screen">
        <h1 className="bounce">LOADING ENGINE...</h1>
      </div>
    );
  }

  return (
    <div className="app-main">
      {/* RENDERIZADO CONDICIONAL SEGÚN EL ESTADO 'view' */}

      {view === 'menu' && (
        <div className="menu-view">
          <h1 className="hero-title">SpeakUp English</h1>

          <div className="menu-stack">
            <PunchyButton onClick={() => setView('verbs')}>
              PRACTICE VERBS
            </PunchyButton>

            <PunchyButton onClick={() => setView('sentences')} variant="secondary">
              BUILD SENTENCES
            </PunchyButton>

            {/* NUEVO BOTÓN: GRAMMAR CHALLENGE */}
            <PunchyButton onClick={() => setView('challenges')} variant="success">
              GRAMMAR CHALLENGE
            </PunchyButton>

            <PunchyButton onClick={() => setView('stats')} variant="dark">
              VIEW RECORDS
            </PunchyButton>
          </div>
        </div>
      )}

      {view === 'verbs' && (
        <VerbMode onExit={() => setView('menu')} />
      )}

      {view === 'sentences' && (
        <SentenceMode onExit={() => setView('menu')} />
      )}

      {/* NUEVA VISTA: CHALLENGE MODE */}
      {view === 'challenges' && (
        <ChallengeMode onExit={() => setView('menu')} />
      )}

      {/* VISTA: HISTORIAL Y RÉCORDS */}
      {view === 'stats' && (
        <StatsMode onExit={() => setView('menu')} />
      )}
    </div>
  );
}