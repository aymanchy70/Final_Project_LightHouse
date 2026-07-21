import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../../services/admin';

@Component({
  selector: 'app-payment-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-detail.html',
  styleUrl: './payment-detail.css'
})
export class PaymentDetailComponent implements OnInit {
  payment: any = null;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    // Try history state first (navigated from list with object)
    const state = history.state as { payment?: any };
    if (state?.payment && state.payment.paymentId === id) {
      this.payment = state.payment;
      this.cdr.markForCheck();
      return;
    }
    // Fallback: load member payments and scan
    if (id) this.loadById(id);
  }

  loadById(id: number) {
    this.loading = true;
    // No GET /api/Payment/{id} yet — load member payments by scanning
    // Once GET /api/Payment/{id} is added, replace this block with a direct call
    this.adminService.getMembers().subscribe({
      next: (members: any[]) => {
        const calls = members.map((m: any) =>
          this.adminService.getMemberPayments(m.memberId).toPromise().catch(() => [])
        );
        Promise.all(calls).then((results: any) => {
          const all: any[] = (results as any[][]).flat();
          this.payment = all.find((p: any) => p.paymentId === id) ?? null;
          if (!this.payment) this.error = 'Payment record not found.';
          this.loading = false;
          this.cdr.markForCheck();
        });
      },
      error: () => {
        this.error = 'Failed to load payment.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  goBack() { this.router.navigate(['/admin/payments']); }

  getTypeBadgeClass(type: string): string {
    return type === 'MembershipFee' ? 'badge-membership' : 'badge-fine';
  }
}
