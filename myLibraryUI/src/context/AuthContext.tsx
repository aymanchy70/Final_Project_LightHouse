import {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import axios from "axios";
import { loginApi, registerApi, logoutApi, getMeApi } from "../api/authApi";
import { getMemberStatusApi } from "../api/memberApi";
import { tokenHelper } from "../utils/tokenHelper";
import type {
  AuthUser,
  AuthContextType,
  AuthResult,
  LoginRequest,
  RegisterRequest,
} from "../types/auth.types";
import type { MemberStatus } from "../types/member.types";

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(tokenHelper.getUser());
  const [token, setToken] = useState<string | null>(tokenHelper.getToken());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [memberStatus, setMemberStatus] = useState<MemberStatus>(null);
  const [memberStatusLoading, setMemberStatusLoading] =
    useState<boolean>(false);

  // ─── Check member status ────────────────────────────────────────────────────
  const checkMemberStatus = useCallback(async (): Promise<void> => {
    const storedToken = tokenHelper.getToken();
    if (!storedToken) return;
    setMemberStatusLoading(true);
    try {
      const res = await getMemberStatusApi();
      setMemberStatus(res.membershipStatus);
    } catch {
      setMemberStatus(null);
    } finally {
      setMemberStatusLoading(false);
    }
  }, []);

  // ─── Verify token on app load ───────────────────────────────────────────────
  useEffect(() => {
    const verifyToken = async (): Promise<void> => {
      const storedToken = tokenHelper.getToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const me = await getMeApi();
        const userData: AuthUser = { id: me.id, email: me.email, roles: [] };
        setUser(userData);
        tokenHelper.setUser(userData);
        await checkMemberStatus();
      } catch {
        tokenHelper.clear();
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, [checkMemberStatus]);

  // ─── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(
    async ({ email, password }: LoginRequest): Promise<AuthResult> => {
      setError(null);
      try {
        const data = await loginApi({ email, password });
        tokenHelper.setToken(data.token);
        const userData: AuthUser = {
          id: data.userId,
          email: data.email,
          roles: data.roles,
        };
        tokenHelper.setUser(userData);
        setToken(data.token);
        setUser(userData);
        // Check member status right after login
        await checkMemberStatus();
        return { success: true };
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? ((err.response?.data?.message as string | undefined) ??
            "Login failed. Please try again.")
          : "Login failed. Please try again.";
        setError(message);
        return { success: false, message };
      }
    },
    [checkMemberStatus],
  );

  // ─── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(
    async ({
      email,
      password,
      confirmPassword,
    }: RegisterRequest): Promise<AuthResult> => {
      setError(null);
      try {
        const data = await registerApi({ email, password, confirmPassword });
        return { success: true, message: data.message };
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? ((err.response?.data?.message as string | undefined) ??
            "Registration failed. Please try again.")
          : "Registration failed. Please try again.";
        setError(message);
        return { success: false, message };
      }
    },
    [],
  );

  // ─── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async (): Promise<void> => {
    try {
      await logoutApi();
    } catch {
      /* ignore */
    }
    tokenHelper.clear();
    setUser(null);
    setToken(null);
    setError(null);
    setMemberStatus(null);
  }, []);

  const clearError = useCallback((): void => setError(null), []);

  const isAuthenticated: boolean = !!token && !!user;
  const isAdmin: boolean = user?.roles?.includes("Admin") ?? false;
  const isMember: boolean = memberStatus === "Approved";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isAuthenticated,
        isAdmin,
        memberStatus,
        isMember,
        memberStatusLoading,
        checkMemberStatus,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
