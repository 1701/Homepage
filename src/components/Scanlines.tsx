import React from 'react';

const Scanlines: React.FC = () => {
  return (
    <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden rounded-lg mix-blend-hard-light">
      {/* Moving Scanline Bar */}
      <div 
        className="absolute top-0 left-0 right-0 w-full h-[20%] bg-gradient-to-b from-transparent via-[rgba(255,255,255,0.15)] to-transparent"
        style={{ animation: 'scanline 6s linear infinite' }}
      />
      
      {/* Static Horizontal Lines - Darker to cut through bright backgrounds */}
      <div 
        className="absolute inset-0 z-10"
        style={{
            backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.4))',
            backgroundSize: '100% 4px'
        }}
      />

      {/* RGB Subpixel/Phosphor Mask */}
      <div 
        className="absolute inset-0 z-20 opacity-30"
        style={{
            backgroundImage: 'linear-gradient(90deg, rgba(255,0,0,0.3), rgba(0,255,0,0.3), rgba(0,0,255,0.3))',
            backgroundSize: '3px 100%'
        }}
      />

      {/* Vignette / Tube Curve Illusion */}
      <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] rounded-lg z-30"></div>
    </div>
  );
};

export default Scanlines;