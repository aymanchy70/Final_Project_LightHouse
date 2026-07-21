import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BorrowingService, BorrowingResponse } from '../../../../services/borrowing.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-borrowing-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './borrowing-detail.html',
  styleUrl: './borrowing-detail.css'
})
export class BorrowingDetailComponent implements OnInit {
  borrowing: BorrowingResponse | null = null;
  loading = false;
  error = '';
  actionLoading = false;

  // Return modal state
  showReturnModal = false;
  returnNotes = '';

  // Lost/Damaged modal state
  showLostModal = false;
  lossType: 'Lost' | 'Damaged' = 'Lost';
  lossReason = '';

  // Pickup reserved modal
  showPickupModal = false;
  pickupMemberId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private borrowingService: BorrowingService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.loadById(id);
  }

  loadById(id: number) {
    // Fast path: use navigation state if available (coming from the list)
    const state = history.state as { borrowing?: BorrowingResponse };
    if (state?.borrowing && state.borrowing.borrowingId === id) {
      this.borrowing = state.borrowing;
      this.cdr.markForCheck();
      return;
    }

    // Fallback: call GET /api/borrowing/{id} directly — works for ANY status
    this.loading = true;
    this.borrowingService.getBorrowingById(id).subscribe({
      next: (borrowing) => {
        this.borrowing = borrowing;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Borrowing record not found.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ── Approve ───────────────────────────────────────────────────
  approve() {
    if (!this.borrowing) return;
    if (!confirm(`Approve this borrowing request?`)) return;
    this.actionLoading = true;
    this.borrowingService.approveBorrowing(this.borrowing.borrowingId).subscribe({
      next: (updated) => {
        this.borrowing = updated;
        this.toast.success('Borrowing approved. Book issued.');
        this.actionLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err?.error?.message ?? err?.error ?? 'Failed to approve.';
        this.actionLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ── Reject ────────────────────────────────────────────────────
  reject() {
    if (!this.borrowing) return;
    if (!confirm(`Reject this borrowing request?`)) return;
    this.actionLoading = true;
    this.borrowingService.rejectBorrowing(this.borrowing.borrowingId).subscribe({
      next: () => {
        if (this.borrowing) this.borrowing.status = 'Rejected';
        this.toast.success('Borrowing rejected.');
        this.actionLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err?.error?.message ?? err?.error ?? 'Failed to reject.';
        this.toast.error(this.error);
        this.actionLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ── Return modal ──────────────────────────────────────────────
  openReturnModal() { this.returnNotes = ''; this.showReturnModal = true; }
  closeReturnModal() { this.showReturnModal = false; }

  confirmReturn() {
    if (!this.borrowing) return;
    this.actionLoading = true;
    this.borrowingService.returnBook(this.borrowing.borrowingId, { notes: this.returnNotes }).subscribe({
      next: (updated) => {
        this.borrowing = updated;
        this.showReturnModal = false;
        this.toast.success(`Book returned.${updated.fineAmount && updated.fineAmount > 0 ? ' Fine: ৳' + updated.fineAmount.toFixed(2) : ''}`);
        this.actionLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err?.error?.message ?? err?.error ?? 'Failed to process return.';
        this.actionLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ── Lost/Damaged modal ────────────────────────────────────────
  openLostModal() { this.lossType = 'Lost'; this.lossReason = ''; this.showLostModal = true; }
  closeLostModal() { this.showLostModal = false; }

  confirmLost() {
    if (!this.borrowing) return;
    this.actionLoading = true;
    this.borrowingService.markLostOrDamaged(this.borrowing.borrowingId, {
      lossType: this.lossType,
      lossReason: this.lossReason
    }).subscribe({
      next: (updated) => {
        this.borrowing = updated;
        this.showLostModal = false;
        this.toast.success(`Marked as ${this.lossType}. Fine: ৳${updated.fineAmount?.toFixed(2) ?? '0.00'}`);
        this.actionLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err?.error?.message ?? err?.error ?? 'Failed to mark lost/damaged.';
        this.actionLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ── Pickup Reserved modal ─────────────────────────────────────
  openPickupModal() { this.pickupMemberId = null; this.showPickupModal = true; }
  closePickupModal() { this.showPickupModal = false; }

  confirmPickup() {
    if (!this.borrowing || !this.pickupMemberId) return;
    this.actionLoading = true;
    this.borrowingService.pickupReserved(this.borrowing.physicalCopyId, this.pickupMemberId).subscribe({
      next: (updated) => {
        this.borrowing = updated;
        this.showPickupModal = false;
        this.toast.success('Reserved copy issued to member.');
        this.actionLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err?.error?.message ?? err?.error ?? 'Failed to process pickup.';
        this.actionLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  goBack() { this.router.navigate(['/admin/circulation']); }

  getStatusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      'Pending': 'badge-pending', 'Borrowed': 'badge-borrowed',
      'Returned': 'badge-returned', 'Overdue': 'badge-overdue',
      'Lost': 'badge-lost', 'Damaged': 'badge-lost', 'Rejected': 'badge-rejected'
    };
    return map[status] ?? 'badge-pending';
  }

  canApprove()  { return this.borrowing?.status === 'Pending'; }
  canReject()   { return this.borrowing?.status === 'Pending'; }
  canReturn()   { return this.borrowing?.status === 'Borrowed' || this.borrowing?.status === 'Overdue'; }
  canMarkLost() { return this.borrowing?.status === 'Borrowed' || this.borrowing?.status === 'Overdue'; }
}