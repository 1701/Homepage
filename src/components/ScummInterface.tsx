
import React, { useState } from 'react';
import type { LinkItem } from '../types';

interface ScummInterfaceProps {
  onShowImprint: () => void;
}

const ScummInterface: React.FC<ScummInterfaceProps> = ({ onShowImprint }) => {
  const [hoveredVerb, setHoveredVerb] = useState<string>('');
  
  const commands: LinkItem[] = [
    { label: 'LINKEDIN', type: 'external', url: 'https://www.linkedin.com/in/markus-steireif-37a18487/' },
    { label: 'GITHUB', type: 'external', url: 'https://github.com/1701/' },
    { label: 'IMPRINT', type: 'internal', action: onShowImprint },
  ];

  const handleAction = (cmd: LinkItem) => {
    if (cmd.type === 'external' && cmd.url) {
      window.open(cmd.url, '_blank');
    } else if (cmd.type === 'internal' && cmd.action) {
      cmd.action();
    }
  };

  return (
    <div className="flex flex-col h-full text-white relative backdrop-blur-[2px]">
      {/* Top Bar - Transparent / Minimal */}
      <div className="bg-black/40 text-cyan-300 px-2 py-1 flex justify-between items-center font-retro-body text-lg border-b-2 border-cyan-900/50">
        <span className="text-shadow-sm">SYSTEM: ONLINE</span>
        <span className="animate-pulse text-pink-500">1987 Mode</span>
      </div>

      {/* Main Visual Area (The "Scene") */}
      {/* We use bg-black/20 to darken slightly for readability but keep background visible */}
      <div className="flex-grow relative p-4 overflow-hidden flex flex-col md:flex-row items-center justify-center gap-8 bg-black/20">
        
        {/* Avatar / Character Frame */}
        <div className="relative w-48 h-48 md:w-64 md:h-64 border-4 border-pink-500/50 shadow-[0_0_20px_rgba(255,0,128,0.4)] flex items-center justify-center group bg-black/60 backdrop-blur-sm transition-all hover:scale-105 hover:border-cyan-400">
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(80,80,80,0.2)_1px,transparent_1px)] bg-[length:4px_4px]"></div>
            
            {/* Custom Pixel Art Avatar */}
            <div className="z-10 flex flex-col items-center">
                <svg viewBox="0 0 32 32" className="w-32 h-32 md:w-40 md:h-40 drop-shadow-[4px_4px_0_rgba(0,0,0,1)]" shapeRendering="crispEdges">
                    {/* Hair (Back) */}
                    <rect x="9" y="6" width="14" height="8" fill="#1a1a1a" />
                    <rect x="8" y="8" width="1" height="5" fill="#1a1a1a" />
                    <rect x="23" y="8" width="1" height="5" fill="#1a1a1a" />
                    
                    {/* Face / Skin */}
                    <rect x="9" y="9" width="14" height="11" fill="#f5cba7" />
                    <rect x="10" y="20" width="12" height="2" fill="#f5cba7" />
                    
                    {/* Hair (Front/Bangs) */}
                    <rect x="9" y="6" width="14" height="3" fill="#1a1a1a" />
                    <rect x="21" y="9" width="2" height="1" fill="#1a1a1a" />
                    <rect x="9" y="9" width="2" height="2" fill="#1a1a1a" />
                    
                    {/* Eyes */}
                    <rect x="12" y="13" width="2" height="2" fill="#000000" />
                    <rect x="19" y="13" width="2" height="2" fill="#000000" />
                    
                    {/* Nose Shadow */}
                    <rect x="16" y="15" width="1" height="2" fill="#dcb08a" />

                    {/* Mouth / Smile */}
                    <rect x="13" y="18" width="1" height="1" fill="#dcb08a" />
                    <rect x="19" y="18" width="1" height="1" fill="#dcb08a" />
                    <rect x="14" y="19" width="5" height="1" fill="#ce8e66" />

                    {/* Sweater Body (Dark Blue) */}
                    <rect x="8" y="22" width="16" height="10" fill="#1e3a8a" />
                    {/* Shoulders */}
                    <rect x="6" y="23" width="2" height="9" fill="#1e3a8a" />
                    <rect x="24" y="23" width="2" height="9" fill="#1e3a8a" />
                    
                    {/* Sweater Patterns (Retro Style) */}
                    {/* Red Accents */}
                    <rect x="11" y="25" width="2" height="2" fill="#ef4444" />
                    <rect x="19" y="25" width="2" height="2" fill="#ef4444" />
                    <rect x="15" y="28" width="2" height="2" fill="#ef4444" />
                    
                    {/* White Stripes/Details */}
                    <rect x="10" y="23" width="12" height="1" fill="#ffffff" opacity="0.8" />
                    <rect x="14" y="26" width="4" height="1" fill="#ffffff" opacity="0.8" />
                    
                    {/* Collar */}
                    <rect x="12" y="22" width="8" height="1" fill="#111827" opacity="0.3" />
                </svg>
                <span className="font-retro-header text-yellow-400 text-xs md:text-sm text-center mt-2 bg-black/80 px-2 border border-yellow-400/30">MARKUS.EXE</span>
            </div>
            
            {/* Hover Speech Bubble */}
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white text-black p-2 rounded border-2 border-black font-retro-body w-40 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 shadow-[4px_4px_0_rgba(255,0,255,1)]">
                Insert Coin
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
            </div>
        </div>

        {/* Description Text */}
        <div className="font-retro-body text-xl md:text-2xl max-w-md leading-relaxed text-center md:text-left bg-black/40 p-6 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-md">
          <p className="mb-4 text-cyan-300 drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">WELCOME TO THE GRID.</p>
          <p className="drop-shadow-md">I AM <span className="text-pink-500 font-bold text-shadow-glow">MARKUS STEIREIF</span>.</p>
          <p className="drop-shadow-md text-gray-300">PRODUCT GUY, BORN IN THE 80s & RETRO ENTHUSIAST.</p>
          <p className="mt-4 text-yellow-300 text-sm md:text-lg blink-caret"> CHOOSE YOUR DESTINY_</p>
        </div>

      </div>

      {/* SCUMM Verb Interface (Bottom) */}
      <div className="bg-[#121212]/95 border-t-4 border-gray-600 p-4 h-auto md:h-48 flex flex-col shadow-[0_-4px_10px_rgba(0,0,0,0.5)] relative z-20">
        {/* Sentence Line */}
        <div className="h-8 mb-2 text-center font-retro-body text-green-400 text-xl tracking-widest uppercase drop-shadow-[0_0_5px_rgba(0,255,0,0.5)]">
             {hoveredVerb ? `> ${hoveredVerb}` : '> READY'} <span className="animate-pulse">_</span>
        </div>

        {/* Verbs Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 font-retro-header text-sm md:text-lg h-full">
            {commands.map((cmd) => (
                <button
                    key={cmd.label}
                    onMouseEnter={() => setHoveredVerb(`EXECUTE ${cmd.label}`)}
                    onMouseLeave={() => setHoveredVerb('')}
                    onClick={() => handleAction(cmd)}
                    className="text-gray-400 hover:text-yellow-300 hover:bg-white/10 text-left px-4 py-2 transition-all border-2 border-transparent hover:border-yellow-300 hover:shadow-[0_0_10px_rgba(255,255,0,0.3)] active:border-red-500 active:text-red-500"
                >
                    {cmd.label}
                </button>
            ))}
            {/* Filler verbs for aesthetics */}
            <button className="text-gray-700 cursor-not-allowed text-left px-4 py-2" disabled>MAILBOX</button>
            <button className="text-gray-700 cursor-not-allowed text-left px-4 py-2" disabled>IRC</button>
            <button className="text-gray-700 cursor-not-allowed text-left px-4 py-2" disabled>USENET</button>
        </div>
      </div>
    </div>
  );
};

export default ScummInterface;
