import { useEffect, useRef, useCallback } from 'react';
import { X, ClipboardCopy } from 'lucide-react';

interface BatchPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptText: string;
}

export function BatchPromptModal({ isOpen, onClose, promptText }: BatchPromptModalProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap helper
  const getFocusableElements = useCallback(() => {
    if (!modalRef.current) return [];
    const focusable = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    return Array.from(focusable) as HTMLElement[];
  }, []);

  // Handle tab key for focus trap
  const handleTabKey = useCallback((e: KeyboardEvent) => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift+Tab - move backward
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab - move forward
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }, [getFocusableElements]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      // Auto-focus and select when modal opens
      const timeoutId = setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      } else if (e.key === 'Tab' && isOpen) {
        handleTabKey(e);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleTabKey]);

  const handleRetryCopy = () => {
    if (textareaRef.current) {
      textareaRef.current.select();
      navigator.clipboard.writeText(promptText).catch(() => {
        // Still failing
      });
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="w-full max-w-2xl mx-4 bg-[hsl(var(--color-bg-elevated))] rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--color-border))]">
          <h2 id="modal-title" className="text-lg font-semibold text-[hsl(var(--color-text-primary))]">
            Your Critical Fixes Prompt
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="p-1.5 text-[hsl(var(--color-text-secondary))] hover:text-[hsl(var(--color-text-primary))] hover:bg-[hsl(var(--color-bg-surface))] rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))]"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div role="alert" className="flex items-start gap-2 text-sm text-[hsl(var(--severity-serious-text))]">
            <span>⚠</span>
            <span>
              Clipboard access was blocked. Copy the prompt below manually:
            </span>
          </div>

          <div className="relative">
            <textarea
              ref={textareaRef}
              readOnly
              value={promptText}
              rows={15}
              className="w-full p-4 pr-12 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-lg text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-[hsl(var(--indigo-400))]"
            />
            <button
              type="button"
              onClick={handleRetryCopy}
              className="absolute top-3 right-3 p-2 text-[hsl(var(--color-text-secondary))] hover:text-[hsl(var(--color-text-primary))] bg-[hsl(var(--color-bg-elevated))] border border-[hsl(var(--color-border))] rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))]"
              aria-label="Retry copy to clipboard"
            >
              <ClipboardCopy className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-[hsl(var(--color-border))]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[hsl(var(--color-text-primary))] hover:bg-[hsl(var(--color-bg-surface))] rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
