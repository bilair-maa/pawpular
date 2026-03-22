import { createContext } from 'react';

// Minimal user info kept in app state after sign-in
export interface CurrentUser {
  username: string;
  userKey: string;
}

export interface UserContextValue {
  currentUser: CurrentUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const UserContext = createContext<UserContextValue | null>(null);

// Turns a username into a simple lowercase key used to identify the user in storage
export function createUserKey(username: string): string {
  const normalized = username.trim().toLocaleLowerCase();
  return normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'guest';
}
