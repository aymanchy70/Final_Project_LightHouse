import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BorrowingService } from '../../../../services/borrowing.service';
import { AdminService } from '../../../../services/admin';

@Component({
  selector: 'app-borrowing-request',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './borrowing-request.html',
  styleUrl: './borrowing-request.css'
})
export class BorrowingRequestComponent implements OnInit {
  members: any[] = [];
  memberId: number | null = null;
  physicalCopyId: number | null = null;

  loading = false;
  membersLoading = false;
  error = '';
  successMessage = '';
  fieldError = '';

  constructor(
    private borrowingService: BorrowingService,
    private adminService: AdminService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.loadMembers(); }

  loadMembers() {
    this.membersLoading = true;
    this.adminService.getMembers().subscribe({
      next: (data) => {
        this.members = data.filter((m: any) => m.membershipStatus === 'Approved' && !m.isBlocked);
        this.membersLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Failed to load members.';
        this.membersLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  submit() {
    this.error = '';
    this.fieldError = '';

    if (!this.memberId) { this.fieldError = 'Please select a member.'; return; }
    if (!this.physicalCopyId) { this.fieldError = 'Please enter a Physical Copy ID.'; return; }

    this.loading = true;
    this.borrowingService.requestBook({
      memberId: this.memberId,
      physicalCopyId: this.physicalCopyId
    }).subscribe({
      next: (result) => {
        this.successMessage = `✅ Borrowing request #${result.borrowingId} created for "${result.bookTitle}".`;
        this.loading = false;
        this.memberId = null;
        this.physicalCopyId = null;
        this.cdr.markForCheck();
        setTimeout(() => this.router.navigate(['/admin/circulation']), 2000);
      },
      error: (err) => {
        this.error = err?.error?.message ?? err?.error ?? 'Failed to create borrowing request.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  cancel() { this.router.navigate(['/admin/circulation']); }
}
