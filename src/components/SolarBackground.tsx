import React from 'react';

export const SolarBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background pointer-events-none transition-colors duration-700">
      {/* Dynamic Energy Mesh */}
      <div className="absolute inset-0 bg-mesh opacity-60" />

      {/* Main Solar Flare (Top Right) */}
      <div 
        className="absolute -top-[20%] -right-[10%] w-[80%] h-[80%] rounded-full bg-primary/20 blur-[120px] animate-pulse" 
        style={{ animationDuration: '8s' }}
      />
      
      {/* Secondary Orbital Light */}
      <div 
        className="absolute top-[20%] left-[10%] w-[40%] h-[40%] rounded-full bg-amber-500/10 blur-[100px] animate-orbit" 
      />
      
      {/* Deep Warm Glow (Bottom Left) */}
      <div 
        className="absolute -bottom-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-orange-600/10 blur-[130px] animate-float" 
        style={{ animationDuration: '15s' }}
      />

      {/* Energy Particles Grid */}
      <div 
        className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08]" 
        style={{ 
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: '48px 48px' 
        }}
      />

      {/* Overlay Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20" />
    </div>
  );
};
