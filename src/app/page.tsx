'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { IBM_Plex_Sans } from 'next/font/google';
import { motion } from 'framer-motion';

const ibmPlexSans = IBM_Plex_Sans({
  weight: ['100'],
  subsets: ['latin'],
});

const ANIMATION_CONFIG = {
  initial: { x: 0, y: 0, rotate: 0, scale: 1 },
  transition: {
    type: "spring",
    stiffness: 120,
    damping: 20,
    mass: 1.1,
    duration: 0.4
  }
} as const;

// Add these constants at the top
const ANIMATION_BOUNDS = {
  EDGE_PADDING: 100,
  MIN_DISTANCE: 150,
  MAX_DISTANCE_FACTOR: 0.25,
  SCALE_RANGE: { MIN: 0.2, MAX: 0.2 }
} as const;

// Update useRandomAnimation hook
const useRandomAnimation = () => {
  return useCallback((letter: string) => {
    if (letter === ' ') return ANIMATION_CONFIG.initial;

    // Calculate safe boundaries
    const safeWidth = window.innerWidth - (ANIMATION_BOUNDS.EDGE_PADDING * 2);
    const safeHeight = window.innerHeight - (ANIMATION_BOUNDS.EDGE_PADDING * 2);

    // Calculate constrained maximum distance
    const maxDistance = Math.min(safeWidth, safeHeight) * ANIMATION_BOUNDS.MAX_DISTANCE_FACTOR;

    // Generate random angle and constrained distance
    const angle = Math.random() * 2 * Math.PI;
    const distance = ANIMATION_BOUNDS.MIN_DISTANCE +
      (Math.random() * (maxDistance - ANIMATION_BOUNDS.MIN_DISTANCE));

    // Calculate position with padding offset
    const rawX = Math.cos(angle) * distance;
    const rawY = Math.sin(angle) * distance;

    // Constrain within bounds
    const x = Math.max(
      -safeWidth / 2,
      Math.min(safeWidth / 2, rawX)
    );
    const y = Math.max(
      -safeHeight / 2,
      Math.min(safeHeight / 2, rawY)
    );

    // Random scale between min and max
    const scale = ANIMATION_BOUNDS.SCALE_RANGE.MIN +
      Math.random() * (ANIMATION_BOUNDS.SCALE_RANGE.MAX - ANIMATION_BOUNDS.SCALE_RANGE.MIN);

    return {
      x,
      y,
      rotate: Math.random() * 360,
      scale,
    };
  }, []);
};
// Update the useLineDrawing hook
const useLineDrawing = (
  isHovered: boolean,
  isReturning: boolean,
  letterRefs: React.MutableRefObject<(HTMLSpanElement | null)[]>,
  originalLetters: string[]
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isHovered && !isReturning) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      let progress = 0;
      let animationFrameId: number;

      const drawLines = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const nonSpaceLetters = letterRefs.current.filter((_, index) => originalLetters[index] !== ' ');

        const connections: [number, number][] = [];
        nonSpaceLetters.forEach((ref, i) => {
          if (!ref) return;

          // Connect to next two letters
          for (let j = 1; j <= 2; j++) {
            if (i + j < nonSpaceLetters.length) {
              connections.push([i, i + j]);
            }
          }

          // Connect second half to first half
          if (i > nonSpaceLetters.length / 2) {
            let nearestIndex = 0;
            let minDistance = Infinity;

            for (let j = 0; j < nonSpaceLetters.length / 2; j++) {
              const otherRef = nonSpaceLetters[j];
              if (!otherRef) continue;

              const rect = ref.getBoundingClientRect();
              const otherRect = otherRef.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              const otherCenterX = otherRect.left + otherRect.width / 2;
              const otherCenterY = otherRect.top + otherRect.height / 2;

              const distance = Math.hypot(
                centerX - otherCenterX,
                centerY - otherCenterY
              );

              if (distance < minDistance) {
                minDistance = distance;
                nearestIndex = j;
              }
            }
            connections.push([nearestIndex, i]);
          }
        });

        ctx.lineWidth = 0.2;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';

        connections.forEach(([i, j]) => {
          const ref = nonSpaceLetters[i];
          const otherRef = nonSpaceLetters[j];
          if (!ref || !otherRef) return;

          const rect = ref.getBoundingClientRect();
          const otherRect = otherRef.getBoundingClientRect();

          // Calculate centers
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const otherCenterX = otherRect.left + otherRect.width / 2;
          const otherCenterY = otherRect.top + otherRect.height / 2;

          // Calculate angle and offset
          const angle = Math.atan2(otherCenterY - centerY, otherCenterX - centerX);
          const letterRadius = Math.min(rect.width, rect.height) / 2;
          const otherLetterRadius = Math.min(otherRect.width, otherRect.height) / 2;

          // Calculate adjusted start and end points
          const adjustedStart = {
            x: centerX + Math.cos(angle) * letterRadius,
            y: centerY + Math.sin(angle) * letterRadius
          };
          const adjustedEnd = {
            x: otherCenterX - Math.cos(angle) * otherLetterRadius,
            y: otherCenterY - Math.sin(angle) * otherLetterRadius
          };

          const startProgress = Math.max(0, progress - 0.05 * i);
          const lineProgress = Math.min(1, startProgress * 5);

          if (lineProgress > 0) {
            const currentEnd = {
              x: adjustedStart.x + (adjustedEnd.x - adjustedStart.x) * lineProgress,
              y: adjustedStart.y + (adjustedEnd.y - adjustedStart.y) * lineProgress
            };

            ctx.beginPath();
            ctx.moveTo(adjustedStart.x, adjustedStart.y);
            ctx.lineTo(currentEnd.x, currentEnd.y);
            ctx.stroke();
          }
        });

        progress += 0.02;
        if (progress < 1.1) {
          animationFrameId = requestAnimationFrame(drawLines);
        }
      };

      drawLines();
      return () => cancelAnimationFrame(animationFrameId);
    } else {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [isHovered, isReturning, letterRefs, originalLetters]);

  return canvasRef;
};

const Letter = ({
  letter,
  index,
  isHovered,
  getRandomAnimation,
  registerRef
}: {
  letter: string;
  index: number;
  isHovered: boolean;
  getRandomAnimation: (letter: string) => any;
  registerRef: (el: HTMLSpanElement | null) => void;
}) => (
  <motion.span
    key={index}
    ref={registerRef}
    initial={false}
    animate={isHovered ? getRandomAnimation(letter) : ANIMATION_CONFIG.initial}
    transition={ANIMATION_CONFIG.transition}
    style={{
      display: 'inline-block',
      marginLeft: letter === ' ' ? '0.25em' : undefined,
      willChange: 'transform',
    }}
  >
    {letter === ' ' ? '\u00A0' : letter}
  </motion.span>
);

// Add component for social icons
const SocialIcons = () => (
  <motion.div
    className="fixed bottom-8 flex gap-9 items-center"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 }}
  >
    <a
      href="https://warpcast.com/0xdrun"
      target="_blank"
      className="text-black hover:text-gray-600 transition-colors"
    >
      <svg height="24" width="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.247 6.16c-2.207.056-7.31.499-8.534 3.195a3.46 3.46 0 0 0-.19 2.364c.391 1.387 1.674 2.303 3.105 2.774a.56.56 0 0 1-.048 1.09c-2.089.332-2.62 2.097-2.737 2.782a2.461 2.461 0 0 0 1.067 2.651c1.162.825 2 .99 3.989.99 4.576 0 8.47-2.355 10.62-6.243 2.245-4.061 1.729-8.395-1.198-10.44C15.135 3.543 13.123 6.114 11.247 6.16z" />
      </svg>
    </a>
    <a
      href="https://github.com/fedemagnani"
      target="_blank"
      className="text-black hover:text-gray-600 transition-colors"
    >
      <svg height="24" width="24" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
      </svg>
    </a>
    <a
      href="https://x.com/0xdrun"
      target="_blank"
      className="text-black hover:text-gray-600 transition-colors"
    >
      <svg height="24" width="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    </a>
    <a
      href="https://linkedin.com/in/fede-magnani"
      target="_blank"
      className="text-black hover:text-gray-600 transition-colors"
    >
      <svg height="24" width="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
      </svg>
    </a>
  </motion.div>
);

export default function Home() {
  const [isHovered, setIsHovered] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const originalLetters = "Federico Magnani".split("");
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const getRandomAnimation = useRandomAnimation();
  const canvasRef = useLineDrawing(isHovered, isReturning, letterRefs, originalLetters);

  const letters = useMemo(() =>
    originalLetters.map((letter, index) => (
      <Letter
        key={index}
        letter={letter}
        index={index}
        isHovered={isHovered}
        getRandomAnimation={getRandomAnimation}
        registerRef={(el) => {
          letterRefs.current[index] = el;
        }}
      />
    )),
    [originalLetters, isHovered, getRandomAnimation]
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black ${ibmPlexSans.className}">
      <div
        className="relative"
        onMouseEnter={() => {
          setIsHovered(true);
          setIsReturning(false);
        }}
        onMouseLeave={() => {
          setIsReturning(true);
          setTimeout(() => setIsHovered(false), 200);
        }}
      >
        <motion.div
          className="text-6xl font-bold"
          style={{
            letterSpacing: '-0.05em',
            position: 'relative',
            zIndex: 1
          }}
        >
          {letters}
        </motion.div>
      </div>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      <SocialIcons />
    </div>
  );
}