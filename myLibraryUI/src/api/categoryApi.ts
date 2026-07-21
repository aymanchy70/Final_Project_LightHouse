import axios from 'axios';
import type { ItemCategoryResponse, Category } from '../types/category.types';

const BASE_URL = 'http://localhost:5200';

// ─── Color palette — id দিয়ে assign হবে ──────────────────────────────────────
const CATEGORY_COLORS: string[] = [
  '#2C3E50',
  '#34495E',
  '#3D566E',
  '#4A6A7E',
  '#1A252F',
  '#2E4057',
];

const getCategoryColor = (id: number): string =>
  CATEGORY_COLORS[(id - 1) % CATEGORY_COLORS.length];

// ─── Map backend → frontend ────────────────────────────────────────────────────
const mapToCategory = (item: ItemCategoryResponse): Category => ({
  id:    item.itemCategoryId,
  name:  item.categoryName,
  icon:  item.icon || '📚',
  color: getCategoryColor(item.itemCategoryId),
});

// ─── API call ──────────────────────────────────────────────────────────────────

/**
 * GET /api/ItemCategory
 * শুধু isActive = true গুলো return করে
 */
export const getCategoriesApi = async (): Promise<Category[]> => {
  const { data } = await axios.get<ItemCategoryResponse[]>(
    `${BASE_URL}/api/ItemCategory`
  );

  return data
    .filter(item => item.isActive)
    .map(mapToCategory);
};
