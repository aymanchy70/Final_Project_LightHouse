import axios from "axios";
import { tokenHelper } from "../utils/tokenHelper"; // <-- added
import type { BookResponseDto } from "../types/book.types";

const BASE_URL = "http://localhost:5200";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  // <-- added interceptor
  const token = tokenHelper.getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── GET /api/Book ─────────────────────────────────────────────
export const getBooksApi = async (): Promise<BookResponseDto[]> => {
  const { data } = await api.get<BookResponseDto[]>("/api/Book");
  return data;
};

// ─── GET /api/Book/:id ────────────────────────────────────────
export const getBookByIdApi = async (id: number): Promise<BookResponseDto> => {
  const { data } = await api.get<BookResponseDto>(`/api/Book/${id}`);
  return data;
};

// ─── GET /api/BookEdition/byBook/{bookId} ─────────────────────
export const getBookEditionsByBookApi = async (
  bookId: number,
): Promise<any[]> => {
  const { data } = await api.get(`/api/BookEdition/byBook/${bookId}`);
  return data;
};

// ─── GET /api/PhysicalCopy/byEdition/{editionId} ──────────────
export const getPhysicalCopiesByEditionApi = async (
  editionId: number,
): Promise<any[]> => {
  const { data } = await api.get(`/api/PhysicalCopy/byEdition/${editionId}`);
  return data;
};

// ─── POST /api/Borrowing/borrow (self‑service) ────────────────
export const borrowBookApi = async (physicalCopyId: number) => {
  await api.post("/api/Borrowing/borrow", physicalCopyId);
};

export const getDigitalCopyForEditionApi = async (editionId: number) => {
  const { data } = await api.get(`/api/BookEdition/${editionId}/digitalcopy`);
  return data; // returns the digital copy object (or null)
};
export const getDigitalCopyByEditionApi = async (editionId: number) => {
  const { data } = await api.get(`/api/BookEdition/${editionId}/digitalcopy`);
  return data;
};
