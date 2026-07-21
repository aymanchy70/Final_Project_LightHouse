import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';
import { PaginationComponent } from '../../../shared/pagination/pagination';
import { applySearch, applySort, getPage, toggleSort, sortIcon, SortState } from '../../../shared/list-helper';

@Component({
  selector: 'app-shelf-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent],
  templateUrl: './shelf-list.html',
  styleUrl: './shelf-list.css'
})
export class ShelfListComponent implements OnInit {
  allItems: any[] = [];
  filtered: any[] = [];
  paged: any[] = [];

  searchTerm = '';
  showInactive = false;
  sort: SortState = { column: 'shelfId', direction: 'asc' };
  currentPage = 1;
  pageSize = 10;
  loading = false;
  error = '';
  successMessage = '';

  constructor(private adminService: AdminService, private router: Router, private cdr: ChangeDetectorRef) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.adminService.getShelves().subscribe({
      next: (d: any) => { 
        this.allItems = d; 
        this.refresh(); 
        this.loading = false; 
        this.cdr.markForCheck(); 
      },
      error: () => { 
        this.error = 'Failed to load shelves.'; 
        this.loading = false; 
        this.cdr.markForCheck(); 
      }
    });
  }

  refresh() {
    let d = applySearch(this.allItems, this.searchTerm, ['shelfCode', 'shelfLabel', 'rackCode', 'sectionCode', 'floorCode']);
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

  edit(id: number) { this.router.navigate(['/admin/location/shelves/edit', id]); }
  details(id: number) { this.router.navigate(['/admin/location/shelves/details', id]); }
  delete(id: number) {
    if (!confirm('Delete this shelf? Physical copies on this shelf will need to be reassigned.')) return;
    this.adminService.deleteShelf(id).subscribe({
      next: () => {
        this.successMessage = 'Shelf deleted successfully!';
        this.allItems = this.allItems.filter(i => i.shelfId !== id);
        this.refresh();
        this.cdr.markForCheck();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => { this.error = 'Failed to delete shelf.'; this.cdr.markForCheck(); }
    });
  }
}