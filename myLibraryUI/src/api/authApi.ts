import axios, { type InternalAxiosRequestConfig } from 'axios';
import { tokenHelper } from '../utils/tokenHelper';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  LogoutResponse,
  MeResponse,
} from '../types/auth.types';

const BASE_URL = "http://localhost:5200";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request automatically
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenHelper.getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Auth Endpoints ────────────────────────────────────────────────────

/**
 * POST /api/Auth/login
 */
export const loginApi = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const { data } = await api.post<LoginResponse>('/api/Auth/login', credentials);
  return data;
};

/**
 * POST /api/Auth/register
 */
export const registerApi = async (payload: RegisterRequest): Promise<RegisterResponse> => {
  const { data } = await api.post<RegisterResponse>('/api/Auth/register', payload);
  return data;
};

/**
 * POST /api/Auth/logout
 */
export const logoutApi = async (): Promise<LogoutResponse> => {
  const { data } = await api.post<LogoutResponse>('/api/Auth/logout');
  return data;
};

/**
 * GET /api/Auth/me  (requires Bearer token)
 */
export const getMeApi = async (): Promise<MeResponse> => {
  const { data } = await api.get<MeResponse>('/api/Auth/me');
  return data;
};

export default api;
