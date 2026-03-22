import { useCallback, useMemo, useState } from 'react';
import { FollowContext, type FollowContextValue } from './followState';
import { useUser } from './useUser';

const FOLLOW_KEY = 'pawpular.followsByUser'; // localStorage key for each user's followed pets and crews

interface StoredUserFollows {
  petIds: string[];
  crewIds: string[];
}

type FollowsByUser = Record<string, StoredUserFollows>;

function readFollows(): FollowsByUser {
  try {
    const value = window.localStorage.getItem(FOLLOW_KEY);
    const parsed: unknown = value ? JSON.parse(value) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as FollowsByUser)
      : {};
  } catch {
    return {};
  }
}

function writeFollows(data: FollowsByUser) {
  window.localStorage.setItem(FOLLOW_KEY, JSON.stringify(data));
}

function getUserFollows(data: FollowsByUser, userKey: string): StoredUserFollows {
  return data[userKey] ?? { petIds: [], crewIds: [] };
}

export function FollowProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useUser();
  const userKey = currentUser?.userKey ?? '';
  const [followsByUser, setFollowsByUser] = useState<FollowsByUser>(readFollows);

  const userFollows = getUserFollows(followsByUser, userKey);
  const followedPetIds = useMemo(() => new Set(userFollows.petIds), [userFollows.petIds]);
  const followedCrewIds = useMemo(() => new Set(userFollows.crewIds), [userFollows.crewIds]);

  // Updates the current user's follow lists and saves to localStorage
  const update = useCallback(
    (updater: (current: StoredUserFollows) => StoredUserFollows) => {
      setFollowsByUser(prev => {
        const current = getUserFollows(prev, userKey);
        const next = { ...prev, [userKey]: updater(current) };
        writeFollows(next);
        return next;
      });
    },
    [userKey],
  );

  const isFollowingPet = useCallback(
    (id: string) => followedPetIds.has(id),
    [followedPetIds],
  );

  const isFollowingCrew = useCallback(
    (id: string) => followedCrewIds.has(id),
    [followedCrewIds],
  );

  // Follows or unfollows a pet
  const toggleFollowPet = useCallback(
    (id: string) => {
      if (!userKey) return;
      update(cur => {
        const next = new Set(cur.petIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return { ...cur, petIds: [...next] };
      });
    },
    [update, userKey],
  );

  // Follows or unfollows a crew
  const toggleFollowCrew = useCallback(
    (id: string) => {
      if (!userKey) return;
      update(cur => {
        const next = new Set(cur.crewIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return { ...cur, crewIds: [...next] };
      });
    },
    [update, userKey],
  );

  const value = useMemo<FollowContextValue>(
    () => ({
      followedPetIds,
      followedCrewIds,
      isFollowingPet,
      toggleFollowPet,
      isFollowingCrew,
      toggleFollowCrew,
    }),
    [
      followedPetIds,
      followedCrewIds,
      isFollowingPet,
      toggleFollowPet,
      isFollowingCrew,
      toggleFollowCrew,
    ],
  );

  return <FollowContext.Provider value={value}>{children}</FollowContext.Provider>;
}
