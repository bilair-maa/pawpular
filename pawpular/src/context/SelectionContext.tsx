import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Pet } from '../types/pet';
import { SelectionContext, type SelectionContextValue } from './selectionState';

const FALLBACK_BYTES = 300 * 1024; // 300 KB estimate used when a pet's actual file size isn't known

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedPetIds, setSelectedPetIds] = useState<Set<string>>(new Set());
  // Tracks each pet's file size without causing re-renders
  const fileSizeRef = useRef<Map<string, number>>(new Map());

  const recordSize = useCallback((pet: Pet) => {
    if (!fileSizeRef.current.has(pet.id)) {
      fileSizeRef.current.set(pet.id, pet.fileSize ?? FALLBACK_BYTES);
    }
  }, []);

  // Checks or unchecks a pet in the selection
  const toggle = useCallback((pet: Pet) => {
    recordSize(pet);
    setSelectedPetIds(prev => {
      const next = new Set(prev);
      if (next.has(pet.id)) next.delete(pet.id);
      else next.add(pet.id);
      return next;
    });
  }, [recordSize]);

  const selectAll = useCallback((pets: Pet[]) => {
    pets.forEach(recordSize);
    setSelectedPetIds(new Set(pets.map(pet => pet.id)));
  }, [recordSize]);

  const clearSelection = useCallback(() => {
    setSelectedPetIds(new Set());
  }, []);

  // Running total of selected file sizes, shown in the download bar
  const estimatedTotalBytes = useMemo(() => {
    let total = 0;
    for (const petId of selectedPetIds) {
      total += fileSizeRef.current.get(petId) ?? FALLBACK_BYTES;
    }
    return total;
  }, [selectedPetIds]);

  const value = useMemo<SelectionContextValue>(() => ({
    selectedPetIds,
    toggle,
    selectAll,
    clearSelection,
    selectedCount: selectedPetIds.size,
    estimatedTotalBytes,
  }), [selectedPetIds, toggle, selectAll, clearSelection, estimatedTotalBytes]);

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}
