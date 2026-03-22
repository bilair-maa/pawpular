import { useCallback, useMemo, useState } from 'react';
import {
  UserContext,
  createUserKey,
  type CurrentUser,
  type UserContextValue,
} from './userState';

const USERS_KEY = 'pawpular.users'; // localStorage key for all registered accounts
const SESSION_KEY = 'pawpular.currentUserKey'; // localStorage key for the currently signed-in user

interface StoredUser {
  username: string;
  userKey: string;
  passwordHash: string;
}

// Converts a password to a SHA-256 hash — passwords are never stored in plain text
async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function readUsers(): StoredUser[] {
  try {
    const value = window.localStorage.getItem(USERS_KEY);
    const parsed: unknown = value ? JSON.parse(value) : [];
    return Array.isArray(parsed)
      ? parsed.filter((user): user is StoredUser => (
        user &&
        typeof user === 'object' &&
        'username' in user &&
        'userKey' in user &&
        'passwordHash' in user &&
        typeof user.username === 'string' &&
        typeof user.userKey === 'string' &&
        typeof user.passwordHash === 'string'
      ))
      : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Checks localStorage for a saved session and returns the matching user
function readCurrentUser(users: StoredUser[]): CurrentUser | null {
  const userKey = window.localStorage.getItem(SESSION_KEY);
  const user = users.find(item => item.userKey === userKey);
  return user ? { username: user.username, userKey: user.userKey } : null;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<StoredUser[]>(readUsers);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => readCurrentUser(readUsers()));

  // Hashes the password and checks it against the stored hash
  const login = useCallback(async (username: string, password: string) => {
    const userKey = createUserKey(username);
    const passwordHash = await hashPassword(password);
    const user = users.find(item => item.userKey === userKey && item.passwordHash === passwordHash);
    if (!user) return false;

    const nextUser = { username: user.username, userKey: user.userKey };
    window.localStorage.setItem(SESSION_KEY, user.userKey);
    setCurrentUser(nextUser);
    return true;
  }, [users]);

  // Creates a new account if the username isn't taken, then signs in automatically
  const register = useCallback(async (username: string, password: string) => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    if (!trimmedUsername || !trimmedPassword) return false;

    const userKey = createUserKey(trimmedUsername);
    if (users.some(user => user.userKey === userKey)) return false;

    const passwordHash = await hashPassword(trimmedPassword);
    const user = { username: trimmedUsername, userKey, passwordHash };
    const nextUsers = [...users, user];
    writeUsers(nextUsers);
    setUsers(nextUsers);
    window.localStorage.setItem(SESSION_KEY, userKey);
    setCurrentUser({ username: user.username, userKey: user.userKey });
    return true;
  }, [users]);

  const logout = useCallback(() => {
    window.localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  }, []);

  const value = useMemo<UserContextValue>(() => ({
    currentUser,
    isAuthenticated: Boolean(currentUser),
    login,
    register,
    logout,
  }), [currentUser, login, register, logout]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
