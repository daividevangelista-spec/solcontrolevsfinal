import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export const SolarBackground: React.FC = () => {
  // Generate random movement paths for solar flares - made more intense
  const blobs = useMemo(() => [
    { id: 1, color: 'bg-primary/40', size: 'w-[90%] h-[90%]', initial: { x: '-10%', y: '-30%' } },
    { id: 2, color: 'bg-amber-600/30', size: 'w-[75%] h-[75%]', initial: { x: '50%', y: '30%' } },
    { id: 3, color: 'bg-orange-500/25', size: 'w-[85%] h-[85%]', initial: { x: '-30%', y: '50%' } },
  ], []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background pointer-events-none transition-colors duration-1000">
      {/* Dynamic Energy Mesh */}
      <div className="absolute inset-0 bg-mesh opacity-30 dark:opacity-50" />

      {/* Extreme Solar Flares (Moving) */}
      {blobs.map((blob) => (
        <motion.div
          key={blob.id}
          initial={blob.initial}
          animate={{
            x: [blob.initial.x, `${parseInt(blob.initial.x) + 20}%`, blob.initial.x],
            y: [blob.initial.y, `${parseInt(blob.initial.y) - 20}%`, blob.initial.y],
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 15 + blob.id * 5,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
          className={`absolute rounded-full ${blob.color} ${blob.size} blur-[120px] mix-blend-screen opacity-50`}
        />
      ))}

      {/* High-Intensity Sun Core Pulse - Optimized */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] bg-primary/20 rounded-full blur-[100px] mix-blend-soft-light"
      />

      {/* Scanline / Grid Effect */}
      <div 
        className="absolute inset-0 opacity-[0.1] dark:opacity-[0.15]" 
        style={{ 
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: '100px 100px'
        }} 
      />

      {/* Particle Dust Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07]" 
        style={{ 
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: '40px 40px' 
        }}
      />

      {/* Radial Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.7)_100%)]" />
    </div>
  );
};
