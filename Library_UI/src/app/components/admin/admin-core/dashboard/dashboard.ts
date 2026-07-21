import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  stats = {
    floors: 0,
    sections: 0,
    racks: 0,
    shelves: 0,
    categories: 0,
    subCategories: 0,
    authors: 0,
    publishers: 0,
    books: 0,
    bookEditions: 0,
    availableCopies: 0,
    members: 0,
    pendingMembershipRequests: 0,
    pendingRequests: 0,
    activeBorrowings: 0,
    overdueBorrowings: 0,
    pendingReservations: 0,
    outstandingFines: 0
  };
  memberStats: any = null;
  loading = true;

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading = true;
    this.adminService.getDashboardStats().subscribe({
      next: (d: any) => {
        this.stats = {
          floors: d.floors ?? 0,
          sections: d.sections ?? 0,
          racks: d.racks ?? 0,
          shelves: d.shelves ?? 0,
          categories: d.categories ?? 0,
          subCategories: d.subCategories ?? 0,
          authors: d.authors ?? 0,
          publishers: d.publishers ?? 0,
          books: d.totalBooks ?? 0,
          bookEditions: d.bookEditions ?? 0,
          availableCopies: d.availableCopies ?? 0,
          members: d.totalMembers ?? 0,
          pendingMembershipRequests: d.pendingMembershipRequests ?? 0,
          pendingRequests: d.pendingBookRequests ?? 0,
          activeBorrowings: d.activeBorrowings ?? 0,
          overdueBorrowings: d.overdueBorrowings ?? 0,
          pendingReservations: d.pendingReservations ?? 0,
          outstandingFines: d.outstandingFines ?? 0
        };
        this.loadMemberStats();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  loadMemberStats() {
    this.adminService.getMemberDashboardStats().subscribe({
      next: (d) => { this.memberStats = d; this.cdr.markForCheck(); },
      error: () => {}
    });
  }
}
