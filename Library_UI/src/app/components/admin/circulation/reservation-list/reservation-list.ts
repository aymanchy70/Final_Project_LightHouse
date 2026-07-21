import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';
import { PaginationComponent } from '../../../shared/pagination/pagination';
import { applySearch, applySort, getPage, toggleSort, sortIcon, SortState } from '../../../shared/list-helper';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent],
  templateUrl: './reservation-list.html',
  styleUrl: './reservation-list.css'
})
export class ReservationListComponent implements OnInit {
  allItems: any[] = [];
  filtered: any[] = [];
  paged: any[] = [];

  searchTerm = '';
  statusFilter = 'All';
  sort: SortState = { column: 'reservationDate', direction: 'desc' };
  currentPage = 1;
  pageSize = 10;
  loading = false;
  error = '';
  successMessage = '';

  statusOptions = ['All', 'Pending', 'Fulfilled', 'Cancelled'];

  constructor(
    private adminService: AdminService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.error = '';
    // Try GET /api/Reservation (all) first — falls back to fan-out if not yet added to API
    this.adminService.getAllReservations().subscribe({
      next: (data: any[]) => {
        this.allItems = data;
        this.refresh();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        // Fallback: fan-out per member
        this.adminService.getMembers().subscribe({
          next: (members: any[]) => {
            const calls = members.map((m: any) =>
              this.adminService.getMemberReservations(m.memberId).toPromise().catch(() => [])
            );
            Promise.all(calls).then((results) => {
              this.allItems = (results as any[][]).flat();
              this.refresh();
              this.loading = false;
              this.cdr.markForCheck();
            });
          },
          error: () => {
            this.error = 'Failed to load reservations.';
            this.loading = false;
            this.cdr.markForCheck();
          }
        });
      }
    });
  }

  refresh() {
    let d = applySearch(this.allItems, this.searchTerm, ['memberName', 'bookTitle', 'edition', 'status']);
    if (this.statusFilter !== 'All') d = d.filter((i: any) => i.status === this.statusFilter);
    d = applySort(d, this.sort);
    this.filtered = d;
    this.currentPage = 1;
    this.updatePage();
  }

  updatePage() { this.paged = getPage(this.filtered, this.currentPage, this.pageSize); }
  onPageChanged(p: number)  { this.currentPage = p; this.updatePage(); }
  onPageSizeChanged(s: number) { this.pageSize = s; this.currentPage = 1; this.updatePage(); }
  sortBy(col: string) { this.sort = toggleSort(this.sort, col); this.refresh(); }
  icon(col: string)   { return sortIcon(this.sort, col); }

  viewDetail(item: any) {
    this.router.navigate(['/admin/reservations/details', item.reservationId], { state: { reservation: item } });
  }

  newReservation() { this.router.navigate(['/admin/reservations/add']); }

  cancel(item: any) {
    if (!confirm(`Cancel reservation for "${item.bookTitle}" by ${item.memberName}?`)) return;
    this.adminService.cancelReservation(item.reservationId).subscribe({
      next: () => {
        item.status = 'Cancelled';
        this.refresh();
        this.successMessage = '✅ Reservation cancelled.';
        this.cdr.markForCheck();
        setTimeout(() => { this.successMessage = ''; this.cdr.markForCheck(); }, 3000);
      },
      error: (err: any) => {
        this.error = err?.error ?? 'Failed to cancel reservation.';
        this.cdr.markForCheck();
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      'Pending':   'badge-pending',
      'Fulfilled': 'badge-fulfilled',
      'Cancelled': 'badge-cancelled'
    };
    return map[status] ?? 'badge-cancelled';
  }

  get pendingCount()   { return this.allItems.filter((r: any) => r.status === 'Pending').length; }
  get fulfilledCount() { return this.allItems.filter((r: any) => r.status === 'Fulfilled').length; }
  get cancelledCount() { return this.allItems.filter((r: any) => r.status === 'Cancelled').length; }
}
