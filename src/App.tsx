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
      <div className="relative z-10 w-full h-full md:w-[90%] md:h-[90%] max-w-6xl bg-[#111]/70 backdrop-blur-sm md:rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] md:border-[20px] border-[#222]/80 overflow-visible flex flex-col">
        
        {/* Screen Content Wrapper */}
        <div className="relative w-full h-full bg-black/20 overflow-hidden crt-flicker rounded-lg">
            
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
        <div className="absolute bottom-[-18px] left-1/2 transform -translate-x-1/2 text-[#444] font-retro-header text-[10px] md:text-xs tracking-[0.3em] z-20 pointer-events-none hidden md:flex items-center gap-2 opacity-80">
            {/* Commodore Logo SVG */}
            <svg width="14" height="14" viewBox="0 0 100 100" className="fill-[#444]">
               <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="12" />
               <path d="M 50 18 A 32 32 0 1 0 50 82 L 50 65 A 15 15 0 1 1 50 35 Z" fill="currentColor" stroke="none" />
               <rect x="45" y="42" width="50" height="16" fill="currentColor" />
            </svg>
            <span>COMMODORE 1084S</span>
        </div>
        
        {/* Power LED */}
        <div className="absolute bottom-[-14px] right-8 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_5px_#0f0] z-20 hidden md:block animate-pulse"></div>
      </div>
    </div>
  );
};

export default App;