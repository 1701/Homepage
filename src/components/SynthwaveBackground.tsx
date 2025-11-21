import React from 'react';

const SynthwaveBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#09001f]">
      {/* Starry Sky */}
      <div className="absolute inset-0" 
           style={{ 
             backgroundImage: 'radial-gradient(white 1px, transparent 1px)', 
             backgroundSize: '50px 50px',
             opacity: 0.5
           }}>
      </div>
      
      {/* Deep Sky Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050010] via-[#180c2e] to-[#2a1b3d] opacity-80"></div>

      {/* The Sun */}
      <div className="absolute top-[10%] md:top-[5%] left-1/2 transform -translate-x-1/2 w-56 h-56 md:w-96 md:h-96 rounded-full bg-gradient-to-b from-[#ffd700] via-[#ff71ce] to-[#b967ff] shadow-[0_0_50px_rgba(255,0,128,0.6)] z-10">
        {/* Sun Cutout Stripes */}
        <div className="absolute inset-0 flex flex-col justify-end w-full h-full overflow-hidden rounded-full">
             {[...Array(12)].map((_, i) => (
                <div key={i} className="w-full bg-[#09001f] mb-1 opacity-90" style={{ height: `${(i * 0.1) + 0.2}%`, marginBottom: `${i * 3 + 4}px` }}></div>
             ))}
        </div>
      </div>

      {/* Mountains Layer 1 (Back) */}
      <div className="absolute bottom-[45vh] left-0 right-0 z-10 flex items-end justify-center overflow-hidden">
         <div className="w-[120%] -ml-[10%] h-32 md:h-48 bg-[#2a1b3d]" 
              style={{ 
                  clipPath: 'polygon(0% 100%, 15% 20%, 25% 60%, 35% 30%, 50% 80%, 60% 20%, 75% 60%, 85% 10%, 100% 100%)',
                  boxShadow: '0 0 20px #ff71ce' 
              }}>
         </div>
      </div>

      {/* Mountains Layer 2 (Front) */}
      <div className="absolute bottom-[45vh] left-0 right-0 z-20 flex items-end justify-center overflow-hidden">
         <div className="w-[120%] -ml-[10%] h-20 md:h-32 bg-[#09001f]" 
              style={{ clipPath: 'polygon(0% 100%, 10% 60%, 20% 90%, 30% 40%, 45% 80%, 55% 30%, 70% 90%, 80% 50%, 90% 80%, 100% 100%)' }}>
         </div>
      </div>

      {/* Horizon Glow */}
      <div className="absolute bottom-[45vh] left-0 right-0 h-40 bg-gradient-to-t from-[#ff71ce] via-[#b967ff] to-transparent opacity-40 blur-3xl z-20 pointer-events-none"></div>

      {/* 3D Grid Container */}
      <div className="absolute bottom-0 left-0 right-0 h-[45vh] overflow-hidden perspective-[50vh] z-30 bg-[#09001f]">
          <div className="absolute inset-0 origin-top transform rotate-x-[60deg]">
             {/* Vertical Lines */}
             <div className="absolute inset-0 w-[200%] -left-[50%]"
                  style={{
                      background: 'linear-gradient(90deg, rgba(255, 113, 206, 0.3) 1px, transparent 1px)',
                      backgroundSize: '60px 100%',
                      height: '200%', 
                      transform: 'perspective(500px) rotateX(60deg)',
                      boxShadow: 'inset 0 0 100px #09001f'
                  }}>
             </div>
             
             {/* Horizontal Moving Lines */}
             <div className="absolute inset-0 w-[200%] -left-[50%]"
                  style={{
                      background: 'linear-gradient(180deg, rgba(5, 217, 232, 0.4) 1px, transparent 1px)',
                      backgroundSize: '100% 60px',
                      height: '200%',
                      animation: 'gridMove 1.5s linear infinite',
                  }}>
             </div>
          </div>
          
          {/* Fading the grid into the distance/horizon */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#09001f] to-transparent z-40"></div>
      </div>
    </div>
  );
};

export default SynthwaveBackground;