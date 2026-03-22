import { useMemo, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import type { Pet } from '../../types/pet';
import { PetCard } from './PetCard';
import { useSelection } from '../../context/useSelection';

// Returns how many columns to show based on the container's width
function getColumnCount(width: number, maxCols: number): number {
  if (width >= 900) return maxCols;
  if (width >= 540) return Math.min(2, maxCols);
  return 1;
}

// Watches the grid's width and updates the column count whenever it changes
function useColumnCount(maxCols: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(() =>
    getColumnCount(typeof window !== 'undefined' ? window.innerWidth : 1024, maxCols),
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width !== undefined) setCols(getColumnCount(width, maxCols));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [maxCols]);

  return [cols, ref] as const;
}

const MasonryGrid = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 22px;
`;

const MasonryColumn = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 22px;
`;

interface ImageGridProps {
  pets: Pet[];
  onOpenPet?: (pet: Pet) => void;
  maxColumns?: number;
  compact?: boolean;
}

// The main masonry grid — column count adjusts automatically as the page resizes
export function ImageGrid({ pets, onOpenPet, maxColumns = 4, compact = false }: ImageGridProps) {
  const { selectedPetIds, toggle } = useSelection();
  const [numCols, gridRef] = useColumnCount(maxColumns);

  // Splits the pet list across columns evenly so heights stay balanced
  const columns = useMemo<Pet[][]>(() => {
    const cols: Pet[][] = Array.from({ length: numCols }, () => []);
    pets.forEach((pet, i) => cols[i % numCols].push(pet));
    return cols;
  }, [pets, numCols]);

  return (
    <MasonryGrid ref={gridRef} role="group" aria-label="Pet gallery">
      {columns.map((column, colIndex) => (
        <MasonryColumn key={colIndex}>
          {column.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              isSelected={selectedPetIds.has(pet.id)}
              onToggle={toggle}
              onOpen={onOpenPet}
              compact={compact}
            />
          ))}
        </MasonryColumn>
      ))}
    </MasonryGrid>
  );
}
