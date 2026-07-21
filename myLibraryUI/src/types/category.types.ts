// ─── Backend response shape ────────────────────────────────────────────────────
export interface ItemCategoryResponse {
  itemCategoryId: number;
  categoryName: string;
  icon: string;
  isActive: boolean;
  createdDate: string;
  categoryDescription?: string;
}

// ─── Frontend mapped shape ─────────────────────────────────────────────────────
export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}
