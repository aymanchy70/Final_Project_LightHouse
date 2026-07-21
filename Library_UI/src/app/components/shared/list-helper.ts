export interface SortState {
  column: string;
  direction: 'asc' | 'desc';
}

export function applySearch(data: any[], term: string, fields: string[]): any[] {
  if (!term.trim()) return data;
  const t = term.toLowerCase();
  return data.filter(item =>
    fields.some(f => item[f]?.toString().toLowerCase().includes(t))
  );
}

export function applySort(data: any[], sort: SortState): any[] {
  return [...data].sort((a, b) => {
    const valA = a[sort.column] ?? '';
    const valB = b[sort.column] ?? '';
    const cmp = typeof valA === 'string' ? valA.localeCompare(valB) : valA - valB;
    return sort.direction === 'asc' ? cmp : -cmp;
  });
}

export function getPage(data: any[], page: number, size: number): any[] {
  const start = (page - 1) * size;
  return data.slice(start, start + size);
}

export function toggleSort(current: SortState, column: string): SortState {
  if (current.column === column) {
    return { column, direction: current.direction === 'asc' ? 'desc' : 'asc' };
  }
  return { column, direction: 'asc' };
}

export function sortIcon(sort: SortState, column: string): string {
  if (sort.column !== column) return '↕';
  return sort.direction === 'asc' ? '↑' : '↓';
}