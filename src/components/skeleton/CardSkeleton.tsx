import { useEffect, useState } from 'react';

interface CardSkeletonProps {
  className?: string;
  count?: number;
}

export function CardSkeleton({ className = '', count = 3 }: CardSkeletonProps) {
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
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] rounded-lg overflow-hidden"
        >
          {/* Card header placeholder */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 flex-1">
              {/* Severity badge placeholder */}
              <div
                className={`w-20 h-6 rounded-full bg-[hsl(var(--color-border))] ${
                  !prefersReducedMotion ? 'skeleton-shimmer' : ''
                }`}
              />
              {/* Title placeholder */}
              <div className="flex-1 max-w-md">
                <div
                  className={`h-4 bg-[hsl(var(--color-border))] rounded ${
                    !prefersReducedMotion ? 'skeleton-shimmer' : ''
                  }`}
                />
              </div>
            </div>
            {/* Chevron placeholder */}
            <div
              className={`w-5 h-5 bg-[hsl(var(--color-border))] rounded ml-2 ${
                !prefersReducedMotion ? 'skeleton-shimmer' : ''
              }`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
