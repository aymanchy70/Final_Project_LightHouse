import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';
import { PaginationComponent } from '../../../shared/pagination/pagination';
import { applySearch, applySort, getPage, toggleSort, sortIcon, SortState } from '../../../shared/list-helper';

@Component({
  selector: 'app-rack-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent],
  templateUrl: './rack-list.html',
  styleUrl: './rack-list.css'
})
export class RackListComponent implements OnInit {
  allItems: any[] = [];
  filtered: any[] = [];
  paged: any[] = [];

  searchTerm = '';
  showInactive = false;
  sort: SortState = { column: 'rackId', direction: 'asc' };
  currentPage = 1;
  pageSize = 10;
  loading = false;
  error = '';
  successMessage = '';

  constructor(private adminService: AdminService, private router: Router, private cdr: ChangeDetectorRef) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.adminService.getRacks().subscribe({
      next: (d: any) => { this.allItems = d; this.refresh(); this.loading = false; this.cdr.markForCheck(); },
      error: () => { this.error = 'Failed to load racks.'; this.loading = false; this.cdr.markForCheck(); }
    });
  }

  refresh() {
    let d = applySearch(this.allItems, this.searchTerm, ['rackCode', 'rackName', 'sectionCode', 'floorCode']);
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

  edit(id: number) { this.router.navigate(['/admin/location/racks/edit', id]); }
  details(id: number) { this.router.navigate(['/admin/location/racks/details', id]); }
  delete(id: number) {
    if (!confirm('Delete this rack? All shelves inside will also be deleted.')) return;
    this.adminService.deleteRack(id).subscribe({
      next: () => {
        this.successMessage = 'Rack deleted successfully!';
        this.allItems = this.allItems.filter(i => i.rackId !== id);
        this.refresh();
        this.cdr.markForCheck();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => { this.error = 'Failed to delete rack.'; this.cdr.markForCheck(); }
    });
  }
}