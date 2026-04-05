import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
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
  const lastFocusedElement = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const activeFilter = IMPAIRMENT_FILTERS.find(f => f.key === activeImpairment);
  const isFilterActive = activeImpairment !== 'none';

  // Save the element that triggered the widget to open
  const handleOpen = () => {
    lastFocusedElement.current = document.activeElement as HTMLElement;
    setIsExpanded(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
    // Return focus to the trigger element
    setTimeout(() => {
      lastFocusedElement.current?.focus();
    }, 0);
  };

  // Focus trap helper
  const getFocusableElements = useCallback(() => {
    if (!widgetRef.current) return [];
    const focusable = widgetRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    return Array.from(focusable) as HTMLElement[];
  }, []);

  // Handle tab key for focus trap
  const handleTabKey = useCallback((e: KeyboardEvent) => {
    if (!isExpanded) return;
    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }, [isExpanded, getFocusableElements]);

  // Handle escape key to close widget and manage focus trap
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isExpanded) {
        handleClose();
      } else if (event.key === 'Tab' && isExpanded) {
        handleTabKey(event);
      }
    }

    if (isExpanded) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus first button when expanded
      setTimeout(() => {
        firstButtonRef.current?.focus();
      }, 50);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded, handleTabKey]);

  const handleImpairmentSelect = (key: string) => {
    setActiveImpairment(key as typeof activeImpairment);
  };

  return (
    <div
      ref={widgetRef}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6 z-[9999]"
    >
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="expanded"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.15, ease: 'easeOut' }}
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
                onClick={handleClose}
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
            transition={{ duration: shouldReduceMotion ? 0 : 0.12, ease: 'easeIn' }}
            onClick={handleOpen}
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
