import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BorrowingService, BorrowingResponse } from '../../../../services/borrowing.service';
import { ToastService } from '../../../../services/toast.service';
import { PaginationComponent } from '../../../shared/pagination/pagination';
import { applySearch, applySort, getPage, toggleSort, sortIcon, SortState } from '../../../shared/list-helper';

@Component({
  selector: 'app-borrowing-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent],
  templateUrl: './borrowing-list.html',
  styleUrl: './borrowing-list.css'
})
export class BorrowingListComponent implements OnInit {
  allItems: BorrowingResponse[] = [];
  filtered: BorrowingResponse[] = [];
  paged: BorrowingResponse[] = [];

  searchTerm = '';
  statusFilter = 'Pending';
  sort: SortState = { column: 'borrowingId', direction: 'desc' };
  currentPage = 1;
  pageSize = 10;
  loading = false;
  error = '';
  updatingOverdue = false;

  statusOptions = ['All', 'Pending', 'Borrowed', 'Returned', 'Overdue', 'Lost', 'Damaged', 'Rejected'];

  constructor(
    private borrowingService: BorrowingService,
    private router: Router,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.error = '';

    // Merge both endpoints and deduplicate — workaround until
    // GetAllActiveBorrowingsAsync() includes Pending in the repository
    forkJoin([
      this.borrowingService.getPendingRequests(),
      this.borrowingService.getAllActiveBorrowings()
    ]).subscribe({
      next: ([pending, active]) => {
        const map = new Map<number, BorrowingResponse>();
        [...active, ...pending].forEach(b => map.set(b.borrowingId, b));
        this.allItems = Array.from(map.values());
        this.refresh();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.toast.error('Failed to load borrowing requests.');
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  refresh() {
    let d = applySearch(this.allItems, this.searchTerm, ['memberName', 'bookTitle', 'barcode', 'status']);
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

  // Pass the full item as navigation state so detail page loads instantly
  viewDetail(id: number) {
    const item = this.allItems.find(i => i.borrowingId === id);
    this.router.navigate(['/admin/circulation/details', id], {
      state: { borrowing: item }
    });
  }

  approve(item: BorrowingResponse) {
    if (!confirm(`Approve borrow request for "${item.bookTitle}" by ${item.memberName}?`)) return;
    this.borrowingService.approveBorrowing(item.borrowingId).subscribe({
      next: () => {
        this.toast.success(`Borrowing #${item.borrowingId} approved.`);
        this.load();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.toast.error(err?.error?.message ?? err?.error ?? 'Failed to approve.');
        this.cdr.markForCheck();
      }
    });
  }

  reject(item: BorrowingResponse) {
    if (!confirm(`Reject borrow request for "${item.bookTitle}" by ${item.memberName}?`)) return;
    this.borrowingService.rejectBorrowing(item.borrowingId).subscribe({
      next: () => {
        this.toast.success(`Borrowing #${item.borrowingId} rejected.`);
        this.load();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.toast.error(err?.error?.message ?? err?.error ?? 'Failed to reject.');
        this.cdr.markForCheck();
      }
    });
  }

  triggerUpdateOverdue() {
    if (!confirm('Update overdue statuses for all active borrowings?')) return;
    this.updatingOverdue = true;
    this.borrowingService.updateOverdue().subscribe({
      next: () => {
        this.toast.success('Overdue statuses updated successfully.');
        this.updatingOverdue = false;
        this.load();
        this.cdr.markForCheck();
      },
      error: () => {
        this.toast.error('Failed to update overdue statuses.');
        this.updatingOverdue = false;
        this.cdr.markForCheck();
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      'Pending': 'badge-pending',
      'Borrowed': 'badge-borrowed',
      'Returned': 'badge-returned',
      'Overdue': 'badge-overdue',
      'Lost': 'badge-lost',
      'Damaged': 'badge-damaged',
      'Rejected': 'badge-rejected'
    };
    return map[status] ?? 'badge-pending';
  }
}