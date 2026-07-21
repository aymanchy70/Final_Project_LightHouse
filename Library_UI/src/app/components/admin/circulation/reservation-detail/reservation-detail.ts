import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../../services/admin';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-reservation-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './reservation-detail.html',
  styleUrl: './reservation-detail.css'
})
export class ReservationDetailComponent implements OnInit {
  reservation: any = null;
  loading = false;
  error = '';
  actionLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const state = history.state as { reservation?: any };
    if (state?.reservation && state.reservation.reservationId === id) {
      this.reservation = state.reservation;
      this.cdr.markForCheck();
      return;
    }
    this.loadById(id);
  }

  loadById(id: number) {
    this.error = 'Please navigate to this reservation from the Reservations list.';
    this.loading = false;
    this.cdr.markForCheck();
  }

  convertToBorrowing() {
    if (!this.reservation) return;
    const physicalCopyId = this.reservation.physicalCopyId;
    if (!physicalCopyId) {
      this.error = 'No physical copy linked to this reservation. Select a copy in Borrowing > New Request.';
      return;
    }
    this.router.navigate(['/admin/circulation/request'], {
      queryParams: { memberId: this.reservation.memberId, bookEditionId: this.reservation.bookEditionId }
    });
  }

  cancel() {
    if (!this.reservation) return;
    if (!confirm('Cancel this reservation?')) return;
    this.actionLoading = true;
    this.adminService.cancelReservation(this.reservation.reservationId).subscribe({
      next: () => {
        this.reservation.status = 'Cancelled';
        this.toast.success('Reservation cancelled.');
        this.actionLoading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.error = err?.error ?? 'Failed to cancel.';
        this.toast.error(this.error);
        this.actionLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  goBack() { this.router.navigate(['/admin/reservations']); }

  getStatusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      'Pending': 'badge-pending', 'Fulfilled': 'badge-fulfilled', 'Cancelled': 'badge-cancelled'
    };
    return map[status] ?? 'badge-cancelled';
  }

  canCancel() { return this.reservation?.status === 'Pending'; }
}
