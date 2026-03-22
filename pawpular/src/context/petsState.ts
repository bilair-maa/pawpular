import { createContext } from 'react';
import type { Pet } from '../types/pet';

// Shared pet-loading state from the /pets API
export interface PetsContextValue {
  pets: Pet[];
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  retry: () => void;
}

export const PetsContext = createContext<PetsContextValue | null>(null);
