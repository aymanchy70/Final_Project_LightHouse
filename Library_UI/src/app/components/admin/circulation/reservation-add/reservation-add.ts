import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';

@Component({
  selector: 'app-reservation-add',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reservation-add.html',
  styleUrl: './reservation-add.css'
})
export class ReservationAddComponent implements OnInit {
  members: any[] = [];
  bookEditions: any[] = [];

  form = {
    memberId:      null as number | null,
    bookEditionId: null as number | null
  };

  submitting = false;
  error = '';
  successMessage = '';

  constructor(
    private adminService: AdminService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.adminService.getMembers().subscribe({
      next: (m: any[]) => { this.members = m; this.cdr.markForCheck(); },
      error: () => { this.error = 'Failed to load members.'; this.cdr.markForCheck(); }
    });
    this.adminService.getBookEditions().subscribe({
      next: (e: any[]) => { this.bookEditions = e; this.cdr.markForCheck(); },
      error: () => { this.error = 'Failed to load book editions.'; this.cdr.markForCheck(); }
    });
  }

  submit() {
    if (!this.form.memberId || !this.form.bookEditionId) {
      this.error = 'Member and book edition are required.'; return;
    }
    this.submitting = true;
    this.error = '';
    this.adminService.createReservation(this.form).subscribe({
      next: () => {
        this.successMessage = 'Reservation created successfully!';
        this.submitting = false;
        this.cdr.markForCheck();
        setTimeout(() => this.router.navigate(['/admin/reservations']), 1500);
      },
      error: (err: any) => {
        this.error = err?.error ?? 'Failed to create reservation.';
        this.submitting = false;
        this.cdr.markForCheck();
      }
    });
  }

  goBack() { this.router.navigate(['/admin/reservations']); }
}
