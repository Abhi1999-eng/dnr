'use client';

import { ReactNode, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  scale?: number;
  once?: boolean;
};

export function Reveal({ children, className, delay = 0, y = 24, scale = 1, once = true }: RevealProps) {
  const prefersReducedMotion = useReducedMotion();

  const initial = useMemo(
    () =>
      prefersReducedMotion
        ? { opacity: 1, y: 0, scale: 1 }
        : {
            opacity: 0,
            y,
            scale,
          },
    [prefersReducedMotion, scale, y]
  );

  const animate = { opacity: 1, y: 0, scale: 1 };

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={animate}
      viewport={{ once, amount: 0.22, margin: '0px 0px -10% 0px' }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.62,
        delay: prefersReducedMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
