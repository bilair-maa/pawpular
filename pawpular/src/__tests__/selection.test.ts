import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { SelectionProvider } from '../context/SelectionContext';
import { useSelection } from '../context/useSelection';
import type { Pet } from '../types/pet';

function makePet(id: string, fileSize?: number): Pet {
  return { id, title: id, description: '', imageUrl: `https://example.com/${id}.jpg`, created: '2024-01-01T00:00:00Z', fileSize };
}

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(SelectionProvider, null, children);

describe('SelectionContext', () => {
  it('starts with no selection', () => {
    const { result } = renderHook(() => useSelection(), { wrapper });
    expect(result.current.selectedCount).toBe(0);
    expect(result.current.selectedPetIds.size).toBe(0);
  });

  it('toggle adds a pet', () => {
    const { result } = renderHook(() => useSelection(), { wrapper });
    const pet = makePet('cat');
    act(() => result.current.toggle(pet));
    expect(result.current.selectedPetIds.has('cat')).toBe(true);
    expect(result.current.selectedCount).toBe(1);
  });

  it('toggle removes a pet that is already selected', () => {
    const { result } = renderHook(() => useSelection(), { wrapper });
    const pet = makePet('dog');
    act(() => result.current.toggle(pet));
    act(() => result.current.toggle(pet));
    expect(result.current.selectedPetIds.has('dog')).toBe(false);
    expect(result.current.selectedCount).toBe(0);
  });

  it('selectAll selects every provided pet', () => {
    const { result } = renderHook(() => useSelection(), { wrapper });
    const pets = [makePet('a'), makePet('b'), makePet('c')];
    act(() => result.current.selectAll(pets));
    expect(result.current.selectedCount).toBe(3);
    pets.forEach(p => expect(result.current.selectedPetIds.has(p.id)).toBe(true));
  });

  it('clearSelection empties the set', () => {
    const { result } = renderHook(() => useSelection(), { wrapper });
    act(() => result.current.selectAll([makePet('a'), makePet('b')]));
    act(() => result.current.clearSelection());
    expect(result.current.selectedCount).toBe(0);
  });

  it('estimatedTotalBytes sums known file sizes', () => {
    const { result } = renderHook(() => useSelection(), { wrapper });
    act(() => result.current.selectAll([makePet('a', 1024), makePet('b', 2048)]));
    expect(result.current.estimatedTotalBytes).toBe(3072);
  });

  it('falls back to 300 KB for pets without a known file size', () => {
    const { result } = renderHook(() => useSelection(), { wrapper });
    act(() => result.current.toggle(makePet('unknown')));
    expect(result.current.estimatedTotalBytes).toBe(300 * 1024);
  });

  it('uses file size recorded on first toggle, not on a second toggle', () => {
    const { result } = renderHook(() => useSelection(), { wrapper });
    const pet = makePet('x', 512);
    act(() => result.current.toggle(pet));
    act(() => result.current.toggle(pet));     // deselect
    act(() => result.current.toggle({ ...pet, fileSize: 99999 })); // re-select with different size
    // Size should still be 512 since the id was already cached on first toggle
    expect(result.current.estimatedTotalBytes).toBe(512);
  });
});
