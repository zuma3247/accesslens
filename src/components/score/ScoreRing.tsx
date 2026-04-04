import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { WcagLevel } from '@/types/audit.types';

interface ScoreRingProps {
  score: number;
  grade: WcagLevel | 'Fail';
}

const RADIUS = 100;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScoreRing({ score, grade }: ScoreRingProps) {
  const shouldReduceMotion = useReducedMotion();
  const [animatedScore, setAnimatedScore] = useState(shouldReduceMotion ? score : 0);

  // Calculate stroke dash offset based on score
  const strokeDashoffset = CIRCUMFERENCE * (1 - score / 100);

  // Determine color based on score thresholds
  const getScoreColor = () => {
    if (score >= 90) return 'hsl(var(--score-high))';
    if (score >= 60) return 'hsl(var(--score-mid))';
    return 'hsl(var(--score-low))';
  };

  // Animate score counter
  useEffect(() => {
    if (shouldReduceMotion) {
      setAnimatedScore(score);
      return;
    }

    const duration = 600;
    const startTime = performance.now();
    const startValue = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + (score - startValue) * easeOut);
      
      setAnimatedScore(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score, shouldReduceMotion]);

  const ariaLabel = `Accessibility compliance score: ${score} percent, grade ${grade}`;

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 240 240"
        className="w-48 h-48"
        role="img"
        aria-label={ariaLabel}
      >
        <title>{ariaLabel}</title>
        
        {/* Track circle */}
        <circle
          cx="120"
          cy="120"
          r={RADIUS}
          fill="none"
          stroke="hsl(var(--score-track))"
          strokeWidth="16"
          strokeLinecap="butt"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx="120"
          cy="120"
          r={RADIUS}
          fill="none"
          stroke={getScoreColor()}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          initial={{ strokeDashoffset: CIRCUMFERENCE }}
          animate={{ strokeDashoffset: shouldReduceMotion ? strokeDashoffset : strokeDashoffset }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8, ease: 'easeOut' }}
          transform="rotate(-90 120 120)"
        />
        
        {/* Center score text */}
        <text
          x="120"
          y="115"
          textAnchor="middle"
          className="text-4xl font-semibold"
          fill="hsl(var(--color-text-primary))"
        >
          {animatedScore}%
        </text>
        
        {/* Grade label */}
        <text
          x="120"
          y="138"
          textAnchor="middle"
          className="text-sm font-medium"
          fill="hsl(var(--color-text-secondary))"
        >
          {grade === 'Fail' ? 'Fail' : grade}
        </text>
      </svg>
      
      {/* Target label */}
      <p className="mt-2 text-xs text-[hsl(var(--color-text-secondary))] tracking-wide uppercase">
        WCAG 2.2 Target: AA
      </p>
    </div>
  );
}
