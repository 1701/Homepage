import React, { useState, useEffect } from 'react';
import SynthwaveBackground from './components/SynthwaveBackground';
import Scanlines from './components/Scanlines';
import BootSequence from './components/BootSequence';
import ScummInterface from './components/ScummInterface';
import ImprintModal from './components/ImprintModal';
import { AppState } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.BOOTING);
  const [showImprint, setShowImprint] = useState(false);

  // Mobile height fix
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVh();
    window.addEventListener('resize', setVh);
    return () => window.removeEventListener('resize', setVh);
  }, []);

  const handleBootComplete = () => {
    setAppState(AppState.RUNNING);
  };

  return (
    <div 
      className="relative w-full bg-black text-white overflow-hidden flex items-center justify-center font-sans"
      style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
    >
      {/* 1. Background */}
      <SynthwaveBackground />

      {/* 2. The Monitor Container */}
      <div className="relative z-10 w-full h-full md:w-[90%] md:h-[90%] max-w-6xl bg-[#111] md:rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] md:border-[20px] border-[#222] overflow-hidden flex flex-col">
        
        {/* Screen Content Wrapper */}
        <div className="relative w-full h-full bg-black overflow-hidden crt-flicker rounded-lg">
            
            {/* Scanlines Overlay (Always on top of screen content) */}
            <Scanlines />

            {/* Content Rendering */}
            <div className="relative z-30 w-full h-full">
                {appState === AppState.BOOTING && (
                    <BootSequence onComplete={handleBootComplete} />
                )}

                {appState === AppState.RUNNING && (
                    <>
                        <ScummInterface onShowImprint={() => setShowImprint(true)} />
                        {showImprint && (
                            <ImprintModal onClose={() => setShowImprint(false)} />
                        )}
                    </>
                )}
            </div>
        </div>

        {/* Monitor Brand Label */}
        <div className="absolute bottom-[-15px] left-1/2 transform -translate-x-1/2 text-[#444] font-retro-header text-[10px] md:text-xs tracking-[0.3em] z-20 pointer-events-none hidden md:block">
            COMMODORE 1084S
        </div>
        
        {/* Power LED */}
        <div className="absolute bottom-[-12px] right-8 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_5px_#0f0] z-20 hidden md:block animate-pulse"></div>
      </div>
    </div>
  );
};

export default App;