import { createContext } from 'react';

// Shared follow state for pets and crews
export interface FollowContextValue {
  followedPetIds: Set<string>;
  followedCrewIds: Set<string>;
  isFollowingPet: (petId: string) => boolean;
  toggleFollowPet: (petId: string) => void;
  isFollowingCrew: (crewId: string) => boolean;
  toggleFollowCrew: (crewId: string) => void;
}

export const FollowContext = createContext<FollowContextValue | null>(null);
