import axios from "axios";
import { tokenHelper } from "../utils/tokenHelper";
import type {
  MemberStatusResponse,
  MemberApplyRequest,
  MemberProfile,
} from "../types/member.types";

const BASE_URL = "http://localhost:5200";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = tokenHelper.getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── GET /api/Member/mystatus ──────────────────────────────────────────────
export const getMemberStatusApi = async (): Promise<MemberStatusResponse> => {
  const { data } = await api.get<MemberStatusResponse>("/api/Member/mystatus");
  return data;
};

// ─── POST /api/Member/apply ────────────────────────────────────────────────
export const applyMembershipApi = async (
  payload: MemberApplyRequest,
): Promise<void> => {
  await api.post("/api/Member/apply", payload);
};

// ─── PUT /api/Member/myprofile ─────────────────────────────────────────────
export const updateProfileApi = async (formData: FormData): Promise<void> => {
  await api.put("/api/Member/myprofile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ─── GET /api/MembershipType ───────────────────────────────────────────────
export const getMembershipTypesApi = async () => {
  const { data } = await axios.get(`${BASE_URL}/api/MembershipType`);
  return data;
};

// ─── POST /api/Member/join ─────────────────────────────────────────────────
export const joinMembershipApi = async (payload: {
  membershipTypeId: number;
  paymentMethod?: string;
}): Promise<void> => {
  await api.post("/api/Member/join", payload);
};

// ─── POST /api/Member/join (multipart form) ─────────────────────────────
export const joinMembershipApiForm = async (
  formData: FormData,
): Promise<void> => {
  await api.post("/api/Member/join", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// GET /api/Borrowing/myborrowings
export const getMyBorrowingsApi = async () => {
  const { data } = await api.get("/api/Borrowing/myborrowings");
  return data;
};
// ─── POST /api/Borrowing/return/{id} ──────────────────────────────
export const returnBookApi = async (borrowingId: number, notes?: string) => {
  const payload = notes ? { notes } : {};
  await api.post(`/api/Borrowing/return/${borrowingId}`, payload);
};

// ─── GET /api/Reservation/myreservations ──────────────────────────────
export const getMyReservationsApi = async () => {
  const { data } = await api.get("/api/Reservation/myreservations");
  return data;
};

// ─── POST /api/Reservation/cancel/{id} ──────────────────────────
export const cancelReservationApi = async (reservationId: number) => {
  await api.post(`/api/Reservation/cancel/${reservationId}`);
};

// ─── POST /api/Reservation/reserve‑self ─────────────────────────
export const reserveBookApi = async (bookEditionId: number) => {
  await api.post("/api/Reservation/reserve-self", bookEditionId);
};

// GET /api/Payment/member/{memberId}
export const getPaymentsByMemberApi = async (memberId: number) => {
  const { data } = await api.get(`/api/Payment/member/${memberId}`);
  return data;
};

// POST /api/Payment/pay (self‑service)
export const paySelfApi = async (payload: {
  amount: number;
  paymentMethod?: string;
  paymentType?: string;
  notes?: string;
}) => {
  await api.post("/api/Payment/pay", payload);
};

// ─── Hardcoded Membership Types (fallback, not used now) ───────────────────
export const getMembershipTypesLocal = () => [
  { id: 1, name: "Standard Membership" },
  { id: 2, name: "Premium Membership" },
];

// POST /api/Member/upgrade
export const upgradeMembershipApi = async (newMembershipTypeId: number) => {
  await api.post("/api/Member/upgrade", newMembershipTypeId);
};

// POST /api/Borrowing/lost-self/{id}
export const reportLostDamagedApi = async (
  borrowingId: number,
  lossType: string,
  lossReason: string,
) => {
  await api.post(`/api/Borrowing/lost-self/${borrowingId}`, {
    LossType: lossType, // PascalCase
    LossReason: lossReason, // PascalCase
  });
};
export const borrowDigitalBookApi = async (digitalCopyId: number) => {
  await api.post("/api/Borrowing/request-digital", { digitalCopyId });
};

// GET /api/Borrowing/my-active-bookids
export const getMyActiveBorrowedBookIdsApi = async (): Promise<number[]> => {
  const { data } = await api.get("/api/Borrowing/my-active-bookids");
  return data;
};
