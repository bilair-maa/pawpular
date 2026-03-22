import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Pet } from '../types/pet';
import { photoSizes } from '../data/photoSizes';
import { PetsContext, type PetsContextValue } from '../context/petsState';

// The raw shape from the API — only used inside this file before it's mapped to Pet
interface ApiPet {
  title: string;
  description: string;
  url: string;
  created: string;
}

// Generates a stable ID from title + created date so the ID survives server-side URL changes
function createPetId(title: string, created: string): string {
  const key = `${title}\0${created}`;
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < key.length; i++) {
    const ch = key.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 0x9e3779b9) >>> 0;
    h2 = Math.imul(h2 ^ ch, 0x5f4a417d) >>> 0;
  }
  h1 ^= h2 >>> 15; h1 = Math.imul(h1, 0x735a2d97) >>> 0;
  h2 ^= h1 >>> 15; h2 = Math.imul(h2, 0xcaf649a9) >>> 0;
  return `${h1.toString(36)}${h2.toString(36)}`;
}

// Converts a raw API item into the internal Pet shape
function mapApiPet(item: ApiPet): Pet {
  const filename = item.url.split('/').pop()?.split('?')[0] ?? '';
  return {
    id: createPetId(item.title, item.created),
    title: item.title,
    description: item.description,
    imageUrl: item.url,
    created: item.created,
    fileSize: photoSizes[filename],
  };
}

export function usePetsData(): PetsContextValue {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestKey, setRequestKey] = useState(0); // Incrementing this number re-runs the fetch

  useEffect(() => {
    const controller = new AbortController();

    fetch('/pets', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json() as Promise<ApiPet[]>;
      })
      .then((data) => {
        setPets(data.map(mapApiPet));
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Failed to load pets.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [requestKey]);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    setRequestKey(key => key + 1);
  }, []);

  return useMemo<PetsContextValue>(() => ({
    pets,
    loading,
    error,
    isEmpty: !loading && !error && pets.length === 0,
    retry,
  }), [pets, loading, error, retry]);
}

// Hook for reading the pet list from anywhere in the app
export function usePets(): PetsContextValue {
  const ctx = useContext(PetsContext);
  if (!ctx) throw new Error('usePets must be used within PetsProvider');
  return ctx;
}
