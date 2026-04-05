import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';
import type { Issue } from '@/types/audit.types';
import { getDemoContent, type ContrastDemoProps, type AltTextDemoProps, type TouchTargetDemoProps } from '@/lib/beforeAfterContent';
import { ContrastDemo } from './ContrastDemo';
import { AltTextDemo } from './AltTextDemo';
import { TouchTargetDemo } from './TouchTargetDemo';

interface BeforeAfterPanelProps {
  issue: Issue;
  isOpen: boolean;
  onClose: () => void;
}

export function BeforeAfterPanel({ issue, isOpen, onClose }: BeforeAfterPanelProps) {
  const demoContent = getDemoContent(issue);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const relativeX = moveEvent.clientX - containerRect.left;
      const percentage = (relativeX / containerRect.width) * 100;
      
      // Clamp between 10% and 90% per spec
      const clampedPercentage = Math.max(10, Math.min(90, percentage));
      setLeftPanelWidth(clampedPercentage);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  // Handle keyboard navigation for drag handle
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setLeftPanelWidth(prev => Math.max(10, prev - 5));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setLeftPanelWidth(prev => Math.min(90, prev + 5));
    }
    // Note: Enter/Space intentionally not handled - arrow keys are the proper
    // keyboard interaction for resizing, Enter/Space would incorrectly trigger mouse mode
  }, []);

  // Handle Escape key to close panel
  const handlePanelKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }, [onClose]);

  if (!demoContent) {
    return null;
  }

  const renderDemo = (isBefore: boolean) => {
    switch (issue.beforeAfterType) {
      case 'contrast':
        return <ContrastDemo content={demoContent as ContrastDemoProps} isBefore={isBefore} />;
      case 'alt-text':
        return <AltTextDemo content={demoContent as AltTextDemoProps} isBefore={isBefore} />;
      case 'touch-target':
        return <TouchTargetDemo content={demoContent as TouchTargetDemoProps} isBefore={isBefore} />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ 
            duration: prefersReducedMotion ? 0 : 0.25, 
            ease: 'easeInOut' 
          }}
          className="fixed inset-x-0 bottom-0 top-0 md:top-[60px] bg-[hsl(var(--color-bg-surface))] border-t border-[hsl(var(--color-border))] z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="before-after-title"
          onKeyDown={handlePanelKeyDown}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-[hsl(var(--color-border))]">
            <h2 id="before-after-title" className="text-base md:text-lg font-semibold text-[hsl(var(--color-text-primary))]">
              Before/After: {issue.wcagCriterion} {issue.wcagCriterionName}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-md hover:bg-[hsl(var(--color-bg-elevated))] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))]"
              aria-label="Close before/after panel"
            >
              <X className="w-5 h-5 text-[hsl(var(--color-text-secondary))]" aria-hidden="true" />
            </button>
          </div>

          {/* Content Area */}
          <div ref={containerRef} className="flex h-full relative">
            {/* Left Panel - Before */}
            <div 
              style={{ width: `${leftPanelWidth}%` }}
              className="p-6 border-r border-[hsl(var(--color-border))] transition-all duration-150"
            >
              <h3 className="text-sm font-medium uppercase tracking-[0.08em] text-[hsl(var(--color-text-secondary))] mb-4">
                Current
              </h3>
              <div className="bg-[hsl(var(--color-bg-elevated))] rounded-lg p-4">
                {renderDemo(true)}
              </div>
            </div>

            {/* Drag Handle */}
            <div
              ref={dragHandleRef}
              role="separator"
              aria-orientation="vertical"
              aria-valuenow={leftPanelWidth}
              aria-valuemin={10}
              aria-valuemax={90}
              aria-label="Drag to compare before and after. Use arrow keys to resize."
              tabIndex={0}
              onMouseDown={handleMouseDown}
              onKeyDown={handleKeyDown}
              className={`w-2 bg-[hsl(var(--color-border))] hover:bg-[hsl(var(--color-border-strong))] cursor-col-resize transition-colors ${
                isDragging ? 'bg-[hsl(var(--indigo-500))]' : ''
              }`}
            />

            {/* Right Panel - After */}
            <div 
              style={{ width: `${100 - leftPanelWidth}%` }}
              className="p-6 transition-all duration-150"
            >
              <h3 className="text-sm font-medium uppercase tracking-[0.08em] text-[hsl(var(--color-text-secondary))] mb-4">
                Accessible
              </h3>
              <div className="bg-[hsl(var(--color-bg-elevated))] rounded-lg p-4">
                {renderDemo(false)}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}