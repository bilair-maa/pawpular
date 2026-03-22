import { describe, it, expect } from 'vitest';
import { filterPets, sortPets } from '../utils/filterPets';
import type { Pet } from '../types/pet';

function makePet(overrides: Partial<Pet> & Pick<Pet, 'id' | 'title'>): Pet {
  return {
    description: '',
    imageUrl: `https://example.com/${overrides.id}.jpg`,
    created: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

// Pets whose titles/descriptions trigger specific animal-type detection
const pets: Pet[] = [
  makePet({ id: '1', title: 'Whiskers', description: 'A curious cat' }),
  makePet({ id: '2', title: 'Rex', description: 'A friendly dog' }),
  makePet({ id: '3', title: 'Tweety', description: 'A small bird' }),
  makePet({ id: '4', title: 'Bunny', description: 'A fluffy rabbit' }),
];

const datedPets: Pet[] = [
  makePet({ id: 'a', title: 'Charlie', created: '2024-03-01T00:00:00Z' }),
  makePet({ id: 'b', title: 'Alpha',   created: '2024-01-01T00:00:00Z' }),
  makePet({ id: 'c', title: 'Zara',    created: '2024-02-01T00:00:00Z' }),
];

// ── filterPets ────────────────────────────────────────────────────────────────

describe('filterPets', () => {
  it('returns all pets when query is empty and no filters', () => {
    expect(filterPets(pets, '', new Set())).toHaveLength(pets.length);
  });

  it('filters by search query against title (case-insensitive)', () => {
    const result = filterPets(pets, 'WHISKERS', new Set());
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('filters by search query against description', () => {
    const result = filterPets(pets, 'dog', new Set());
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('returns empty array when query matches nothing', () => {
    expect(filterPets(pets, 'zzznomatch', new Set())).toHaveLength(0);
  });

  it('trims whitespace from search query', () => {
    const result = filterPets(pets, '  tweety  ', new Set());
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('filters by animal type', () => {
    const result = filterPets(pets, '', new Set(['cat']));
    expect(result.every(p => p.description.includes('cat'))).toBe(true);
  });

  it('applies both search and type filter together', () => {
    // "dog" in description + type filter for dog
    const result = filterPets(pets, 'friendly', new Set(['dog']));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });
});

// ── sortPets ──────────────────────────────────────────────────────────────────

describe('sortPets', () => {
  it('sorts name-asc alphabetically', () => {
    const result = sortPets(datedPets, 'name-asc');
    expect(result.map(p => p.title)).toEqual(['Alpha', 'Charlie', 'Zara']);
  });

  it('sorts name-desc reverse-alphabetically', () => {
    const result = sortPets(datedPets, 'name-desc');
    expect(result.map(p => p.title)).toEqual(['Zara', 'Charlie', 'Alpha']);
  });

  it('sorts date-newest first', () => {
    const result = sortPets(datedPets, 'date-newest');
    expect(result.map(p => p.id)).toEqual(['a', 'c', 'b']);
  });

  it('sorts date-oldest first', () => {
    const result = sortPets(datedPets, 'date-oldest');
    expect(result.map(p => p.id)).toEqual(['b', 'c', 'a']);
  });

  it('does not mutate the input array', () => {
    const input = [...datedPets];
    sortPets(input, 'name-asc');
    expect(input.map(p => p.id)).toEqual(['a', 'b', 'c']);
  });
});
