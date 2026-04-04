import { useContext } from 'react';
import { EmulationContext } from '@/context/emulation-context';

export function useEmulation() {
  const context = useContext(EmulationContext);
  if (context === undefined) {
    throw new Error('useEmulation must be used within an EmulationProvider');
  }
  return context;
}
