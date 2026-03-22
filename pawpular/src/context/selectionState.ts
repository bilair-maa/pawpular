import { createContext } from 'react';
import type { Pet } from '../types/pet';

// Shared bulk-selection state for gallery downloads
export interface SelectionContextValue {
  selectedPetIds: Set<string>;
  toggle: (pet: Pet) => void;
  selectAll: (pets: Pet[]) => void;
  clearSelection: () => void;
  selectedCount: number;
  estimatedTotalBytes: number;
}

export const SelectionContext = createContext<SelectionContextValue | null>(null);
