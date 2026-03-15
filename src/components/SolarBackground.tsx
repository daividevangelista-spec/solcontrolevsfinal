import React from 'react';

export const SolarBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background pointer-events-none transition-colors duration-1000">
      {/* Dynamic Energy Mesh */}
      <div className="absolute inset-0 bg-mesh opacity-40 dark:opacity-60" />

      {/* Diagonal Solar Grid (Mockup Style) */}
      <div className="absolute inset-0 bg-solar-grid opacity-20 dark:opacity-30" />

      {/* Extreme Solar Flare (Top Right) */}
      <div 
        className="absolute -top-[30%] -right-[15%] w-[100%] h-[100%] rounded-full bg-primary/20 blur-[150px] animate-pulse" 
        style={{ animationDuration: '6s' }}
      />
      
      {/* Orbital Energy Core */}
      <div 
        className="absolute top-[10%] left-[5%] w-[50%] h-[50%] rounded-full bg-amber-500/10 blur-[120px] animate-orbit opacity-50" 
      />
      
      {/* Deep Atmosphere Glow */}
      <div 
        className="absolute -bottom-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-orange-600/15 blur-[140px] animate-float opacity-40" 
        style={{ animationDuration: '20s' }}
      />

      {/* Particle Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
        style={{ 
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: '32px 32px' 
        }}
      />

      {/* Dark Vignette for Premium Look */}
      <div className="absolute inset-0 bg-gradient-to-tr from-background/40 via-transparent to-transparent" />
    </div>
  );
};
