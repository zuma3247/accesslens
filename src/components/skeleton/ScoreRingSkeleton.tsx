import { useEffect, useState } from 'react';

interface ScoreRingSkeletonProps {
  className?: string;
}

export function ScoreRingSkeleton({ className = '' }: ScoreRingSkeletonProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Score Ring Placeholder */}
      <div className="relative w-48 h-48">
        {/* Outer track */}
        <div className="absolute inset-0 rounded-full border-8 border-[hsl(var(--color-border))]" />
        {/* Shimmer overlay */}
        {!prefersReducedMotion && (
          <div className="absolute inset-0 rounded-full skeleton-shimmer" />
        )}
        {/* Center content placeholder */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-20 h-10 bg-[hsl(var(--color-border))] rounded skeleton-shimmer-static" />
          <div className="w-12 h-4 bg-[hsl(var(--color-border))] rounded mt-2 skeleton-shimmer-static" />
        </div>
      </div>
      {/* Grade label placeholder */}
      <div className="mt-4 w-24 h-6 bg-[hsl(var(--color-border))] rounded skeleton-shimmer-static" />
    </div>
  );
}
