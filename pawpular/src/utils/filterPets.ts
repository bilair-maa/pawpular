import type { Pet } from '../types/pet';
import { type AnimalType, getAnimalType } from './animalType';

export type SortOption = 'name-asc' | 'name-desc' | 'date-newest' | 'date-oldest';

// Filters pets by animal type and search text
export function filterPets(
  pets: Pet[],
  searchQuery: string,
  activeFilters: Set<AnimalType>,
): Pet[] {
  const query = searchQuery.trim().toLocaleLowerCase();
  const byType = activeFilters.size === 0
    ? pets
    : pets.filter(pet => activeFilters.has(getAnimalType(pet)));
  if (!query) return byType;
  return byType.filter(
    pet =>
      pet.title.toLocaleLowerCase().includes(query) ||
      pet.description.toLocaleLowerCase().includes(query),
  );
}

// Returns a sorted copy of the pet list — doesn't change the original
export function sortPets(pets: Pet[], sortOption: SortOption): Pet[] {
  const copy = [...pets];
  switch (sortOption) {
    case 'name-asc':    return copy.sort((a, b) => a.title.localeCompare(b.title));
    case 'name-desc':   return copy.sort((a, b) => b.title.localeCompare(a.title));
    case 'date-newest': return copy.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
    case 'date-oldest': return copy.sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime());
  }
}
