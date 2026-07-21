import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';
import { PaginationComponent } from '../../../shared/pagination/pagination';
import { applySearch, applySort, getPage, toggleSort, sortIcon, SortState } from '../../../shared/list-helper';

@Component({
  selector: 'app-book-edition-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent],
  templateUrl: './book-edition-list.html',
  styleUrl: './book-edition-list.css'
})
export class BookEditionListComponent implements OnInit {
  allItems: any[] = [];
  filtered: any[] = [];
  paged: any[] = [];

  searchTerm = '';
  filterSoftCopy = '';
  sort: SortState = { column: 'bookEditionId', direction: 'asc' };
  currentPage = 1;
  pageSize = 10;
  loading = false;
  error = '';
  successMessage = '';

  constructor(private adminService: AdminService, private router: Router, private cdr: ChangeDetectorRef) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.adminService.getBookEditions().subscribe({
      next: (d: any) => { this.allItems = d; this.refresh(); this.loading = false; this.cdr.markForCheck(); },
      error: () => { this.error = 'Failed to load editions.'; this.loading = false; this.cdr.markForCheck(); }
    });
  }

  refresh() {
    let d = applySearch(this.allItems, this.searchTerm, ['bookTitle', 'isbn', 'edition', 'language']);
    if (this.filterSoftCopy === 'yes') d = d.filter(i => i.hasSoftCopy);
    if (this.filterSoftCopy === 'no') d = d.filter(i => !i.hasSoftCopy);
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

  edit(id: number) { this.router.navigate(['/admin/book-editions/edit', id]); }
  details(id: number) { this.router.navigate(['/admin/book-editions/details', id]); }
  delete(id: number) {
    if (!confirm('Delete this edition?')) return;
    this.adminService.deleteBookEdition(id).subscribe({
      next: () => {
        this.successMessage = 'Deleted!';
        this.allItems = this.allItems.filter(i => i.bookEditionId !== id);
        this.refresh();
        this.cdr.markForCheck();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => { this.error = 'Failed to delete.'; this.cdr.markForCheck(); }
    });
  }
}