const ACTIVE_IDS_KEY = "lighthouse_active_borrowed_ids";
const STATUS_MAP_KEY = "lighthouse_book_status_map";

export const getCachedActiveIds = (): Set<number> => {
  try {
    const raw = localStorage.getItem(ACTIVE_IDS_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
};

export const setCachedActiveIds = (ids: Set<number>) => {
  localStorage.setItem(ACTIVE_IDS_KEY, JSON.stringify([...ids]));
};

export const getCachedStatusMap = (): Record<
  number,
  "Pending" | "Borrowed" | "Overdue"
> => {
  try {
    const raw = localStorage.getItem(STATUS_MAP_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
};

export const setCachedStatusMap = (
  map: Record<number, "Pending" | "Borrowed" | "Overdue">,
) => {
  localStorage.setItem(STATUS_MAP_KEY, JSON.stringify(map));
};
