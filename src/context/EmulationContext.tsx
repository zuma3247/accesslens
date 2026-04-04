import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { ImpairmentKey } from '@/types/audit.types';
import { EmulationContext } from './emulation-context';

interface EmulationProviderProps {
  children: ReactNode;
}

const APP_ROOT_ID = 'app-root';

export function EmulationProvider({ children }: EmulationProviderProps) {
  const [activeImpairment, setActiveImpairment] = useState<ImpairmentKey>('none');
  const ariaLiveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const appRoot = document.getElementById(APP_ROOT_ID);
    if (!appRoot) return;

    // Clear all emulation classes and filters
    appRoot.classList.remove('emulate-macular');
    appRoot.style.filter = '';

    if (activeImpairment === 'macular') {
      appRoot.classList.add('emulate-macular');
    } else if (activeImpairment !== 'none') {
      appRoot.style.filter = `url(#filter-${activeImpairment})`;
    }

    // Announce change to screen readers
    if (ariaLiveRef.current) {
      ariaLiveRef.current.textContent = 
        activeImpairment === 'none' 
          ? 'Vision emulation disabled.' 
          : `Now simulating ${activeImpairment}.`;
    }
  }, [activeImpairment]);

  return (
    <EmulationContext.Provider value={{ activeImpairment, setActiveImpairment }}>
      <div ref={ariaLiveRef} aria-live="polite" aria-atomic="true" className="sr-only" />
      {children}
    </EmulationContext.Provider>
  );
}
