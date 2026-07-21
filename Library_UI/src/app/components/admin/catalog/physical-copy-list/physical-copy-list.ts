import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';
import { PaginationComponent } from '../../../shared/pagination/pagination';
import { applySearch, applySort, getPage, toggleSort, sortIcon, SortState } from '../../../shared/list-helper';

@Component({
  selector: 'app-physical-copy-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent],
  templateUrl: './physical-copy-list.html',
  styleUrl: './physical-copy-list.css'
})
export class PhysicalCopyListComponent implements OnInit {
  allItems: any[] = [];
  filtered: any[] = [];
  paged: any[] = [];

  searchTerm = '';
  statusFilter = 'All';
  sort: SortState = { column: 'physicalCopyId', direction: 'desc' };
  currentPage = 1;
  pageSize = 10;
  loading = false;
  error = '';
  successMessage = '';

  statusOptions = ['All', 'Available', 'Borrowed', 'Lost', 'Damaged', 'UnderRepair', 'Disposed'];

  constructor(
    private adminService: AdminService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.error = '';
    this.adminService.getPhysicalCopies().subscribe({
      next: (d: any) => {
        this.allItems = d;
        this.refresh();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Failed to load physical copies.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  refresh() {
    let d = applySearch(this.allItems, this.searchTerm, [
      'bookTitle', 'editionInfo', 'barcode', 'fullLibraryCode', 'shelfCode', 'status', 'currentCondition'
    ]);
    if (this.statusFilter !== 'All') {
      d = d.filter(i => i.status === this.statusFilter);
    }
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

  edit(id: number) { this.router.navigate(['/admin/physical-copies/edit', id]); }
  details(id: number) { this.router.navigate(['/admin/physical-copies/details', id]); }

  delete(id: number) {
    if (!confirm('Deactivate this physical copy?')) return;
    this.adminService.deletePhysicalCopy(id).subscribe({
      next: () => {
        this.successMessage = 'Copy deactivated.';
        this.allItems = this.allItems.filter(i => i.physicalCopyId !== id);
        this.refresh();
        this.cdr.markForCheck();
        setTimeout(() => { this.successMessage = ''; this.cdr.markForCheck(); }, 3000);
      },
      error: (err: any) => {
        this.error = err?.error?.message || err?.error || 'Failed to deactivate copy.';
        this.cdr.markForCheck();
      }
    });
  }

  statusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      Available: 'badge-available',
      Borrowed: 'badge-borrowed',
      Lost: 'badge-lost',
      Damaged: 'badge-damaged',
      UnderRepair: 'badge-repair',
      Disposed: 'badge-disposed'
    };
    return map[status] ?? 'badge-available';
  }
}
