import type { AuthUser } from '../types/auth.types';

const TOKEN_KEY = 'auth_token' as const;
const USER_KEY  = 'auth_user'  as const;

export const tokenHelper = {
  // ─── Token ───────────────────────────────────────
  setToken: (token: string): void =>
    localStorage.setItem(TOKEN_KEY, token),

  getToken: (): string | null =>
    localStorage.getItem(TOKEN_KEY),

  removeToken: (): void =>
    localStorage.removeItem(TOKEN_KEY),

  // ─── User ────────────────────────────────────────
  setUser: (user: AuthUser): void =>
    localStorage.setItem(USER_KEY, JSON.stringify(user)),

  getUser: (): AuthUser | null => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  },

  removeUser: (): void =>
    localStorage.removeItem(USER_KEY),

  // ─── Clear everything ────────────────────────────
  clear: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // ─── Auth header helper ──────────────────────────
  getAuthHeader: (): Record<string, string> => {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};
