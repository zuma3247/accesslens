import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X } from 'lucide-react';
import { useEmulation } from '@/hooks/useEmulation';
import { IMPAIRMENT_FILTERS } from '@/data/impairmentFilters';
import { ImpairmentButton } from './ImpairmentButton';
import { EmulationStatusBanner } from './EmulationStatusBanner';

export function EmulationWidget() {
  const { activeImpairment, setActiveImpairment } = useEmulation();
  const [isExpanded, setIsExpanded] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  const activeFilter = IMPAIRMENT_FILTERS.find(f => f.key === activeImpairment);
  const isFilterActive = activeImpairment !== 'none';

  // Handle escape key to close widget
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    }

    if (isExpanded) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus first button when expanded
      firstButtonRef.current?.focus();
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  const handleImpairmentSelect = (key: string) => {
    setActiveImpairment(key as typeof activeImpairment);
  };

  return (
    <div
      ref={widgetRef}
      className="fixed bottom-6 right-6 z-[9999]"
      style={{ position: 'fixed', bottom: '24px', right: '24px' }}
    >
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="expanded"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="w-[280px] bg-[hsl(var(--color-bg-elevated))] backdrop-blur-xl border border-[hsl(var(--color-border))] rounded-xl shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--color-border))]">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[hsl(var(--color-text-secondary))]" aria-hidden="true" />
                <span className="text-sm font-medium text-[hsl(var(--color-text-primary))]">
                  Vision Emulation
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                aria-label="Close vision emulation panel"
                className="p-1 rounded-md hover:bg-[hsl(var(--color-bg-surface))] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))]"
              >
                <X className="w-4 h-4 text-[hsl(var(--color-text-secondary))]" aria-hidden="true" />
              </button>
            </div>

            {/* Button Grid */}
            <div className="p-3 grid grid-cols-2 gap-2">
              {IMPAIRMENT_FILTERS.map((filter, index) => (
                <ImpairmentButton
                  key={filter.key}
                  ref={index === 0 ? firstButtonRef : undefined}
                  label={filter.label}
                  onClick={() => handleImpairmentSelect(filter.key)}
                  active={activeImpairment === filter.key}
                  ariaPressed={activeImpairment === filter.key}
                />
              ))}
            </div>

            {/* Status Banner */}
            {activeFilter && activeFilter.key !== 'none' && (
              <div className="px-3 pb-3">
                <EmulationStatusBanner
                  description={activeFilter.description}
                  prevalence={activeFilter.prevalence}
                />
              </div>
            )}
          </motion.div>
        ) : (
          <motion.button
            key="collapsed"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.12, ease: 'easeIn' }}
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--color-bg-elevated))] border border-[hsl(var(--color-border))] rounded-full shadow-md hover:shadow-lg transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))]"
            aria-label="Open vision emulation panel"
          >
            <Eye className="w-4 h-4 text-[hsl(var(--color-text-secondary))]" aria-hidden="true" />
            <span className="text-sm font-medium text-[hsl(var(--color-text-primary))]">
              Vision Emulation
            </span>
            {isFilterActive && (
              <span
                className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--indigo-600))]"
                aria-hidden="true"
              />
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
