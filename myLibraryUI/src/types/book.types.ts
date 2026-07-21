// ─── Author ───────────────────────────────────────────────────────────────────
export interface AuthorBriefDto {
  authorId: number;
  fullName: string;
}

// ─── Book Response (BookResponseDto এর সাথে exact match) ─────────────────────
export interface BookResponseDto {
  bookId: number;
  title: string;
  subtitle?: string;
  description?: string;
  itemCategoryId?: number;
  categoryName?: string;
  subCategoryId?: number;
  subCategoryName?: string;
  masterISBN?: string;
  language?: string;
  publicationYear?: number;
  pageCount?: number;
  coverImageUrl?: string;
  isRareBook: boolean;
  requiresSecurityDeposit: boolean;
  securityDepositAmount?: number;
  publisherId?: number;
  publisherName?: string;
  ddcNumber?: string;
  cutterNumber?: string;
  callNumber?: string;
  baseLibraryCode?: string;
  isActive: boolean;
  createdDate: string;
  updatedDate?: string;
  authors: AuthorBriefDto[];
}
export interface PhysicalCopy {
  physicalCopyId: number;
  bookEditionId: number;
  barcode: string;
  status: string;
}
