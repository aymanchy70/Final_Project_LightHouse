import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-payment-add',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './payment-add.html',
  styleUrl: './payment-add.css'
})
export class PaymentAddComponent implements OnInit {
  members: any[] = [];
  selectedMember: any = null;
  loadingMember = false;

  form = {
    memberId:      null as number | null,
    amount:        null as number | null,
    paymentType:   'Fine',
    paymentMethod: 'Cash',
    notes:         ''
  };

  submitting = false;
  error = '';

  constructor(
    private adminService: AdminService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['memberId']) {
        this.form.memberId = +params['memberId'];
        this.onMemberChange();
        this.form.paymentType = 'Fine';
      }
    });
    this.adminService.getMembers().subscribe({
      next: (m: any[]) => { this.members = m; this.cdr.markForCheck(); },
      error: () => { this.error = 'Failed to load members.'; this.cdr.markForCheck(); }
    });
  }

  onMemberChange() {
    if (!this.form.memberId) { this.selectedMember = null; return; }
    this.loadingMember = true;
    this.adminService.getMember(this.form.memberId).subscribe({
      next: (m: any) => { this.selectedMember = m; this.loadingMember = false; this.cdr.markForCheck(); },
      error: () => { this.selectedMember = null; this.loadingMember = false; this.cdr.markForCheck(); }
    });
  }

  submit() {
    if (!this.form.memberId || !this.form.amount || this.form.amount <= 0) {
      this.error = 'Member and a valid amount are required.'; return;
    }
    this.submitting = true;
    this.error = '';
    this.adminService.recordPayment(this.form).subscribe({
      next: () => {
        this.toast.success('Payment recorded successfully!');
        this.submitting = false;
        this.cdr.markForCheck();
        setTimeout(() => this.router.navigate(['/admin/payments']), 1500);
      },
      error: (err: any) => {
        this.toast.error(err?.error ?? 'Failed to record payment.');
        this.submitting = false;
        this.cdr.markForCheck();
      }
    });
  }

  goBack() { this.router.navigate(['/admin/payments']); }
}
