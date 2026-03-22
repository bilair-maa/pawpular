import {
  useCallback,
  useMemo,
  useState,
} from 'react';
import type { Pet } from '../types/pet';
import { SavedPetsContext, type SavedPetsContextValue } from './savedPetsState';
import { useUser } from './useUser';

const SAVED_PETS_KEY = 'pawpular.savedPetsByUser'; // localStorage key for all users' favorites and download history

interface StoredUserPets {
  favoritePetIds: string[];
  downloadedPetIds: string[];
}

type SavedPetsByUser = Record<string, StoredUserPets>;

// Reads favorites and downloads from localStorage; returns empty data if nothing is saved yet
function readSavedPetsByUser(): SavedPetsByUser {
  try {
    const value = window.localStorage.getItem(SAVED_PETS_KEY);
    const parsed: unknown = value ? JSON.parse(value) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as SavedPetsByUser : {};
  } catch {
    return {};
  }
}

function writeSavedPetsByUser(savedPetsByUser: SavedPetsByUser) {
  window.localStorage.setItem(SAVED_PETS_KEY, JSON.stringify(savedPetsByUser));
}

function getUserPets(savedPetsByUser: SavedPetsByUser, userKey: string): StoredUserPets {
  return savedPetsByUser[userKey] ?? { favoritePetIds: [], downloadedPetIds: [] };
}

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids)];
}

export function SavedPetsProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useUser();
  const userKey = currentUser?.userKey ?? '';
  const [savedPetsByUser, setSavedPetsByUser] = useState<SavedPetsByUser>(readSavedPetsByUser);

  const userPets = getUserPets(savedPetsByUser, userKey);
  const favoritePetIds = useMemo(() => new Set(userPets.favoritePetIds), [userPets.favoritePetIds]);
  const downloadedPetIds = useMemo(() => new Set(userPets.downloadedPetIds), [userPets.downloadedPetIds]);

  const updateUserPets = useCallback((updater: (current: StoredUserPets) => StoredUserPets) => {
    setSavedPetsByUser(prev => {
      const current = getUserPets(prev, userKey);
      const next = {
        ...prev,
        [userKey]: updater(current),
      };
      writeSavedPetsByUser(next);
      return next;
    });
  }, [userKey]);

  const isFavorite = useCallback((petId: string) => favoritePetIds.has(petId), [favoritePetIds]);

  // Adds or removes a pet from the user's favorites
  const toggleFavorite = useCallback((petId: string) => {
    if (!userKey) return;
    updateUserPets(current => {
      const next = new Set(current.favoritePetIds);
      if (next.has(petId)) {
        next.delete(petId);
      } else {
        next.add(petId);
      }
      return {
        ...current,
        favoritePetIds: [...next],
      };
    });
  }, [updateUserPets, userKey]);

  // Adds downloaded pets to the user's history, ignoring duplicates
  const recordDownloadedPets = useCallback((pets: Pet[]) => {
    if (!userKey) return;
    updateUserPets(current => ({
      ...current,
      downloadedPetIds: uniqueIds([
        ...current.downloadedPetIds,
        ...pets.map(pet => pet.id),
      ]),
    }));
  }, [updateUserPets, userKey]);

  const value = useMemo<SavedPetsContextValue>(() => ({
    favoritePetIds,
    downloadedPetIds,
    isFavorite,
    toggleFavorite,
    recordDownloadedPets,
  }), [favoritePetIds, downloadedPetIds, isFavorite, toggleFavorite, recordDownloadedPets]);

  return (
    <SavedPetsContext.Provider value={value}>
      {children}
    </SavedPetsContext.Provider>
  );
}
