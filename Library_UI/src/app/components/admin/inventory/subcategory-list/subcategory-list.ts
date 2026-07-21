import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';
import { PaginationComponent } from '../../../shared/pagination/pagination';
import { applySearch, applySort, getPage, toggleSort, sortIcon, SortState } from '../../../shared/list-helper';

@Component({
  selector: 'app-subcategory-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent],
  templateUrl: './subcategory-list.html',
  styleUrl: './subcategory-list.css'
})
export class SubcategoryListComponent implements OnInit {
  allItems: any[] = [];
  filtered: any[] = [];
  paged: any[] = [];
  categories: any[] = [];

  searchTerm = '';
  filterCategoryId = 0;
  sort: SortState = { column: 'subCategoryId', direction: 'asc' };
  currentPage = 1;
  pageSize = 10;
  loading = false;
  error = '';
  successMessage = '';

  constructor(private adminService: AdminService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Load categories for the filter dropdown AND to resolve category names
    this.adminService.getItemCategories().subscribe({
      next: (d: any) => { this.categories = d; this.load(); },
      error: () => { this.load(); }
    });
  }

  load() {
    this.loading = true;
    this.adminService.getSubCategories().subscribe({
      next: (data: any) => {
        // Fix: attach categoryName from loaded categories
        this.allItems = data.map((item: any) => ({
          ...item,
          categoryName: this.categories.find(c => c.itemCategoryId === item.categoryId)?.categoryName || '—'
        }));
        this.refresh();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.error = 'Failed to load.'; this.loading = false; this.cdr.markForCheck(); }
    });
  }

  refresh() {
    let d = applySearch(this.allItems, this.searchTerm, ['name', 'description', 'categoryName']);
    if (this.filterCategoryId) d = d.filter(i => i.categoryId == this.filterCategoryId);
    d = d.filter(i => i.isActive !== false);
    d = applySort(d, this.sort);
    this.filtered = d;
    this.currentPage = 1;
    this.updatePage();
  }

  updatePage() { this.paged = getPage(this.filtered, this.currentPage, this.pageSize); }
  onPageChanged(p: number) { this.currentPage = p; this.updatePage(); }
  onPageSizeChanged(s: number) { this.pageSize = s; this.currentPage = 1; this.updatePage(); }
  sortBy(col: string) { this.sort = toggleSort(this.sort, col); this.refresh(); }
  icon(col: string) { return sortIcon(this.sort, col); }

  edit(id: number) { this.router.navigate(['/admin/sub-categories/edit', id]); }
  details(id: number) { this.router.navigate(['/admin/sub-categories/details', id]); }
  delete(id: number) {
    if (!confirm('Delete?')) return;
    this.adminService.deleteSubCategory(id).subscribe({
      next: () => {
        this.successMessage = 'Deleted!';
        this.allItems = this.allItems.filter(i => i.subCategoryId !== id);
        this.refresh();
        this.cdr.markForCheck();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => { this.error = 'Failed to delete.'; this.cdr.markForCheck(); }
    });
  }
}