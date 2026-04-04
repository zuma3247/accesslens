import { createContext } from 'react';
import type { ImpairmentKey } from '@/types/audit.types';

export interface EmulationContextValue {
  activeImpairment: ImpairmentKey;
  setActiveImpairment: (key: ImpairmentKey) => void;
}

export const EmulationContext = createContext<EmulationContextValue | undefined>(undefined);
