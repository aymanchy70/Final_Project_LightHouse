import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';

@Component({
  selector: 'app-membership-type-add-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './membership-type-add-edit.html',
  styleUrl: './membership-type-add-edit.css'
})
export class MembershipTypeAddEditComponent implements OnInit {
  typeId: number | null = null;
  viewOnly = false;
  membershipType = {
    name: '', description: '',
    maxBooksCanBorrow: 5, loanPeriodDays: 14,
    maxBooksForInLibraryReading: 5, canBorrowRareBooks: false,
    yearlyFee: 0, maxOutstandingFine: 0,
    isActive: true
  };
  loading = false; submitting = false; error = ''; success = '';

  constructor(private adminService: AdminService, private route: ActivatedRoute, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.route.url.subscribe(urlSegments => {
      this.viewOnly = urlSegments.some(seg => seg.path === 'details');
    });
    this.route.params.subscribe(params => {
      if (params['id']) { this.typeId = +params['id']; this.load(); }
    });
  }

  load() {
    this.loading = true;
    this.adminService.getMembershipType(this.typeId!).subscribe({
      next: (d: any) => {
        this.membershipType = {
          name: d.name || '', description: d.description || '',
          maxBooksCanBorrow: d.maxBooksCanBorrow ?? 5,
          loanPeriodDays: d.loanPeriodDays ?? 14,
          maxBooksForInLibraryReading: d.maxBooksForInLibraryReading ?? 5,
          canBorrowRareBooks: d.canBorrowRareBooks ?? false,
          yearlyFee: d.yearlyFee ?? 0,
          maxOutstandingFine: d.maxOutstandingFine ?? 0,
          isActive: d.isActive ?? true
        };
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.error = 'Failed to load.'; this.loading = false; this.cdr.markForCheck(); }
    });
  }

  submit() {
    this.error = ''; this.success = '';
    if (!this.membershipType.name.trim()) { this.error = 'Name is required.'; return; }
    this.submitting = true;
    const call = this.typeId
      ? this.adminService.updateMembershipType(this.typeId, this.membershipType)
      : this.adminService.createMembershipType(this.membershipType);
    call.subscribe({
      next: () => { this.success = this.typeId ? 'Updated!' : 'Created!'; this.submitting = false; setTimeout(() => this.router.navigate(['/admin/membership-types']), 1500); },
      error: (err: any) => { this.error = err.error?.title || err.error?.message || 'Failed.'; this.submitting = false; }
    });
  }

  cancel() { this.router.navigate(['/admin/membership-types']); }
}