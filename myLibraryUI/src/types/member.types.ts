// ─── Member Status ────────────────────────────────────────────────────────────
export type MemberStatus = "Approved" | "PendingApproval" | "Rejected" | null;

// ─── Member Status Response ───────────────────────────────────────────────────
export interface MemberStatusResponse {
  membershipStatus: MemberStatus;
  memberId: number;
  userId: number;
  fullName: string;
  phone?: string;
  address?: string;
  membershipTypeId?: number;
  membershipTypeName?: string;
  outstandingFine?: number;
  isBlocked?: boolean;
  membershipExpiryDate?: string;
  profilePictureUrl?: string;
}
// ─── Membership Type ──────────────────────────────────────────────────────────
export interface MembershipType {
  id: number;
  name: string;
}

// ─── Apply for Membership ─────────────────────────────────────────────────────
export interface MemberApplyRequest {
  membershipTypeId: number;
  fullName: string;
  phone?: string;
  address?: string;
}

// ─── Member Profile ───────────────────────────────────────────────────────────
export interface MemberProfile {
  userId: number;
  fullName: string;
  phone?: string;
  address?: string;
  profilePhotoUrl?: string;
  membershipStatus: MemberStatus;
  membershipTypeId?: number;
}
