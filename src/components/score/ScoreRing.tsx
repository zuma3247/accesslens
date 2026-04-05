import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { WcagLevel, LevelBreakdown } from '@/types/audit.types';

interface ScoreRingProps {
  score: number;
  grade: WcagLevel | 'Fail';
  isFallback?: boolean | undefined;
  levelBreakdown?: LevelBreakdown;
}

const RADIUS = 100;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScoreRing({ score, grade, isFallback, levelBreakdown }: ScoreRingProps) {
  const shouldReduceMotion = useReducedMotion();
  const [animatedScore, setAnimatedScore] = useState(shouldReduceMotion ? score : 0);
  const [showTooltip, setShowTooltip] = useState(false);

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

    const duration = 750;
    const startTime = performance.now();
    const startValue = 0;
    let rafId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Quartic ease-out for more deliberate feel (fast start, slow settle)
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.round(startValue + (score - startValue) * easeOut);

      setAnimatedScore(currentValue);

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafId);
  }, [score, shouldReduceMotion]);

  const ariaLabel = `Accessibility compliance score: ${score} percent, grade ${grade}`;

  const tooltipText = levelBreakdown
    ? `Level A: ${levelBreakdown.A.passing}/${levelBreakdown.A.total} passing · Level AA: ${levelBreakdown.AA.passing}/${levelBreakdown.AA.total} · Level AAA: ${levelBreakdown.AAA.passing}/${levelBreakdown.AAA.total}`
    : undefined;

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        tabIndex={0}
        role="group"
      >
        {showTooltip && tooltipText && (
          <div
            role="tooltip"
            className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 text-xs font-medium text-[hsl(var(--color-text-inverse))] bg-[hsl(var(--slate-800))] dark:bg-[hsl(var(--slate-200))] dark:text-[hsl(var(--slate-900))] rounded-md shadow-md z-10"
          >
            {tooltipText}
          </div>
        )}
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
          animate={{ strokeDashoffset: strokeDashoffset }}
          transition={shouldReduceMotion ? { duration: 0 } : { 
            duration: 0.9, 
            ease: [0.22, 1, 0.36, 1]
          }}
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
      </div>

      {/* Target label */}
      <p className="mt-2 text-xs text-[hsl(var(--color-text-secondary))] tracking-[0.08em] uppercase">
        WCAG 2.2 Target: AA
      </p>
      
      {/* Demo data notice for URL scans using representative data */}
      {isFallback && (
        <p className="mt-2 text-xs text-[hsl(var(--color-text-secondary))] text-center max-w-[200px]">
          This representative page has violations for demonstration. Use HTML Snippet mode for real analysis.
        </p>
      )}
    </div>
  );
}
