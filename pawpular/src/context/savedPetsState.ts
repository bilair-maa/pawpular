import { createContext } from 'react';
import type { Pet } from '../types/pet';

// Shared favorites and download history for the signed-in user
export interface SavedPetsContextValue {
  favoritePetIds: Set<string>;
  downloadedPetIds: Set<string>;
  isFavorite: (petId: string) => boolean;
  toggleFavorite: (petId: string) => void;
  recordDownloadedPets: (pets: Pet[]) => void;
}

export const SavedPetsContext = createContext<SavedPetsContextValue | null>(null);
