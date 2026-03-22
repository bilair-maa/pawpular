import { useContext } from 'react';
import { SavedPetsContext, type SavedPetsContextValue } from './savedPetsState';

export function useSavedPets(): SavedPetsContextValue {
  const ctx = useContext(SavedPetsContext);
  if (!ctx) throw new Error('useSavedPets must be used within SavedPetsProvider');
  return ctx;
}
