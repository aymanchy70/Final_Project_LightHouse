import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';
import { PaginationComponent } from '../../../shared/pagination/pagination';
import { applySearch, applySort, getPage, toggleSort, sortIcon, SortState } from '../../../shared/list-helper';

@Component({
  selector: 'app-item-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent],
  templateUrl: './item-category-list.html',
  styleUrl: './item-category-list.css'
})
export class ItemCategoryListComponent implements OnInit {
  allItems: any[] = [];
  filtered: any[] = [];
  paged: any[] = [];

  searchTerm = '';
  showInactive = false;
  sort: SortState = { column: 'itemCategoryId', direction: 'asc' };
  currentPage = 1;
  pageSize = 10;
  loading = false;
  error = '';
  successMessage = '';

  constructor(private adminService: AdminService, private router: Router, private cdr: ChangeDetectorRef) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.adminService.getItemCategories().subscribe({
      next: (d: any) => {
        this.allItems = Array.isArray(d) ? d : (d.data || d.items || d.result || []);
        this.refresh();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Failed to load.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  refresh() {
    let d = applySearch(this.allItems, this.searchTerm, ['categoryName', 'categoryDescription']);
    if (!this.showInactive) d = d.filter(i => i.isActive !== false);
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

  edit(id: number) { this.router.navigate(['/admin/item-categories/edit', id]); }
  details(id: number) { this.router.navigate(['/admin/item-categories/details', id]); }
  delete(id: number) {
    if (!confirm('Delete this category?')) return;
    this.adminService.deleteItemCategory(id).subscribe({
      next: () => {
        this.successMessage = 'Deleted!';
        this.allItems = this.allItems.filter(i => i.itemCategoryId !== id);
        this.refresh();
        this.cdr.markForCheck();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => { this.error = 'Failed to delete.'; this.cdr.markForCheck(); }
    });
  }
}