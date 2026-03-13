import React from 'react';

export const SolarBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background pointer-events-none">
      {/* Primary Solar Flare */}
      <div 
        className="absolute -top-[10%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary/30 blur-[140px] animate-pulse-slow" 
        style={{ animationDuration: '12s' }}
      />
      
      {/* Secondary Warm Glow */}
      <div 
        className="absolute top-[30%] -left-[10%] w-[60%] h-[60%] rounded-full bg-secondary/15 blur-[120px] animate-float" 
        style={{ animationDuration: '18s' }}
      />
      
      {/* Center Accent Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full bg-primary/5 blur-[150px] animate-pulse-slow" 
        style={{ animationDuration: '20s' }}
      />
      
      {/* Bottom Accent */}
      <div 
        className="absolute -bottom-[20%] right-[10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[140px] animate-float" 
        style={{ animationDuration: '22s' }}
      />

      {/* Subtle Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: '40px 40px' 
        }}
      />
    </div>
  );
};
