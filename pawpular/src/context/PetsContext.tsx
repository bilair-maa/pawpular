import { usePetsData } from '../hooks/usePets';
import { PetsContext } from './petsState';

export function PetsProvider({ children }: { children: React.ReactNode }) {
  const value = usePetsData();

  return (
    <PetsContext.Provider value={value}>
      {children}
    </PetsContext.Provider>
  );
}
