import { useMemo } from 'react';
import { usePets } from './usePets';
import { buildCrews, type Crew } from '../utils/buildCrews';

// Combines generated crews with the same loading/error state as pets
interface UseCrewsResult {
  crews: Crew[];
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  retry: () => void;
}

export function useCrews(): UseCrewsResult {
  const { pets, loading, error, retry } = usePets();
  const crews = useMemo(() => buildCrews(pets), [pets]);
  return { crews, loading, error, isEmpty: !loading && !error && crews.length === 0, retry };
}
