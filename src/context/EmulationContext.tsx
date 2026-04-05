import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { ImpairmentKey } from '@/types/audit.types';
import { EmulationContext } from './emulation-context';
import { IMPAIRMENT_FILTERS } from '@/data/impairmentFilters';

interface EmulationProviderProps {
  children: ReactNode;
}

const APP_ROOT_ID = 'app-root';

export function EmulationProvider({ children }: EmulationProviderProps) {
  const [activeImpairment, setActiveImpairment] = useState<ImpairmentKey>('none');
  const ariaLiveRef = useRef<HTMLDivElement>(null);
  const isFirstRenderRef = useRef(true);

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

    // Announce changes only after mount; skip "Vision emulation disabled" on first paint when still 'none'
    if (ariaLiveRef.current) {
      if (isFirstRenderRef.current && activeImpairment === 'none') {
        isFirstRenderRef.current = false;
      } else {
        isFirstRenderRef.current = false;
        if (activeImpairment === 'none') {
          ariaLiveRef.current.textContent = 'Vision emulation disabled.';
        } else {
          const filter = IMPAIRMENT_FILTERS.find((f) => f.key === activeImpairment);
          const label = filter?.label ?? activeImpairment;
          const desc = filter?.description ? ` ${filter.description}` : '';
          ariaLiveRef.current.textContent = `Now simulating ${label}.${desc}`;
        }
      }
    }
  }, [activeImpairment]);

  return (
    <EmulationContext.Provider value={{ activeImpairment, setActiveImpairment }}>
      <div ref={ariaLiveRef} aria-live="polite" aria-atomic="true" className="sr-only" />
      {children}
    </EmulationContext.Provider>
  );
}
