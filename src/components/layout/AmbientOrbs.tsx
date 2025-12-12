// src/components/layout/AmbientOrbs.tsx

import React from 'react';
import { motion } from 'framer-motion';

interface AmbientOrbsProps {
  density?: 'low' | 'medium';
}

const ORB_CONFIG = {
  low: 12,
  medium: 20,
};

export const AmbientOrbs: React.FC<AmbientOrbsProps> = ({ density = 'medium' }) => {
  const count = ORB_CONFIG[density];

  const orbs = Array.from({ length: count }).map((_, index) => {
    const delay = index * 0.6;
    const duration = 18 + index * 0.3;
    const size = 4 + (index % 6);
    const opacity = 0.12 + (index % 5) * 0.03;

    return (
      <motion.span
        key={index}
        className="pointer-events-none absolute rounded-full bg-amber-100/80"
        style={{
          width: size,
          height: size,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          filter: 'blur(3px)',
          opacity,
        }}
        animate={{
          y: ['0%', '-6%', '0%'],
          x: ['0%', '3%', '-2%', '0%'],
        }}
        transition={{
          duration,
          ease: 'easeInOut',
          repeat: Infinity,
          delay,
        }}
      />
    );
  });

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {orbs}
    </div>
  );
};
