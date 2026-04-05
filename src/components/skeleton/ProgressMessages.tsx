import { useEffect, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

interface ProgressMessagesProps {
  className?: string;
}

const MESSAGES = [
  'Analyzing accessibility...',
  'Checking contrast ratios...',
  'Validating semantic HTML...',
  'Scanning keyboard navigation...',
  'Evaluating ARIA usage...',
  'Testing touch target sizes...',
  'Processing results...',
];

const SR_STATUS_MESSAGE = 'Accessibility scan in progress. Please wait.';

export function ProgressMessages({ className = '' }: ProgressMessagesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
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

  const cycleMessage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % MESSAGES.length);
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(cycleMessage, 400);
    return () => window.clearInterval(intervalId);
  }, [cycleMessage]);

  return (
    <div className={className}>
      <div
        className="flex items-center justify-center gap-3 text-[hsl(var(--color-text-secondary))]"
        aria-hidden="true"
      >
        <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
        <span
          className={`text-sm font-medium ${
            prefersReducedMotion ? '' : 'transition-opacity duration-300'
          }`}
          key={currentIndex}
        >
          {MESSAGES[currentIndex]}
        </span>
      </div>
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {SR_STATUS_MESSAGE}
      </span>
    </div>
  );
}
