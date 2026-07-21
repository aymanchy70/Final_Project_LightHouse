import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';

@Component({
  selector: 'app-member-add-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './member-add-edit.html',
  styleUrl: './member-add-edit.css'
})
export class MemberAddEditComponent implements OnInit {
  memberId: number | null = null;
  viewOnly = false;
  member = {
    userId: null as number | null,
    fullName: '',
    address: '',
    phone: '',
    membershipTypeId: null as number | null,
    membershipExpiryDate: '',
    profilePictureFile: null as File | null,
    membershipStatus: 'PendingApproval',
    paymentStatus: 'Pending'
  };
  memberDetail: any = null;
  payments: any[] = [];
  paymentsLoading = false;
  paymentForm = {
    amount: null as number | null,
    paymentType: 'Fine',
    paymentMethod: 'Cash',
    notes: ''
  };
  paymentSubmitting = false;
  paymentError = '';
  paymentSuccess = '';

  membershipTypes: any[] = [];
  users: any[] = [];
  loading = false; submitting = false; error = ''; success = '';

  constructor(private adminService: AdminService, private route: ActivatedRoute, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.route.url.subscribe(urlSegments => {
      this.viewOnly = urlSegments.some(seg => seg.path === 'details');
    });
    this.adminService.getMembershipTypes().subscribe({ next: (d: any) => this.membershipTypes = d, error: () => {} });
    this.adminService.getUsers().subscribe({ next: (d: any) => this.users = d, error: () => {} });
    this.route.params.subscribe(params => {
      if (params['id']) { this.memberId = +params['id']; this.load(); }
    });
  }

  load() {
    this.loading = true;
    this.adminService.getMember(this.memberId!).subscribe({
      next: (d: any) => {
        this.memberDetail = d;
        this.member = {
          userId: d.userId,
          fullName: d.fullName || '',
          address: d.address || '',
          phone: d.phone || '',
          membershipTypeId: d.membershipTypeId || null,
          membershipExpiryDate: d.membershipExpiryDate ? d.membershipExpiryDate.substring(0, 10) : '',
          profilePictureFile: null,
          membershipStatus: d.membershipStatus || 'PendingApproval',
          paymentStatus: d.paymentStatus || 'Pending'
        };
        this.loading = false;
        this.loadPayments();
        this.cdr.markForCheck();
      },
      error: () => { this.error = 'Failed to load.'; this.loading = false; this.cdr.markForCheck(); }
    });
  }

  loadPayments() {
    if (!this.memberId) return;
    this.paymentsLoading = true;
    this.adminService.getMemberPayments(this.memberId).subscribe({
      next: (d: any) => {
        this.payments = d;
        this.paymentsLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.payments = [];
        this.paymentsLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  submit() {
    this.error = ''; this.success = '';
    if (!this.member.fullName.trim()) { this.error = 'Full Name is required.'; return; }
    if (!this.member.membershipTypeId) { this.error = 'Please select a Membership Type.'; return; }
    if (!this.memberId && !this.member.userId) { this.error = 'User is required for new members.'; return; }
    this.submitting = true;

    const formData = new FormData();
    if (this.member.userId != null) formData.append('userId', this.member.userId.toString());
    formData.append('fullName', this.member.fullName.trim());
    if (this.member.address) formData.append('address', this.member.address);
    if (this.member.phone) formData.append('phone', this.member.phone);
    formData.append('membershipTypeId', this.member.membershipTypeId!.toString());
    if (this.member.membershipExpiryDate) {
      formData.append('membershipExpiryDate', this.member.membershipExpiryDate);
    }
    if (this.member.profilePictureFile) {
      formData.append('profilePictureFile', this.member.profilePictureFile);
    }
    formData.append('membershipStatus', this.member.membershipStatus);
    formData.append('paymentStatus', this.member.paymentStatus);

    const call = this.memberId
      ? this.adminService.updateMember(this.memberId, formData)
      : this.adminService.createMember(formData);
    call.subscribe({
      next: () => { this.success = this.memberId ? 'Updated!' : 'Created!'; this.submitting = false; setTimeout(() => this.router.navigate(['/admin/members']), 1500); },
      error: (err: any) => { this.error = err.error?.message || err.error?.title || 'Failed.'; this.submitting = false; }
    });
  }

  recordPayment() {
    if (!this.memberId) return;
    this.paymentError = '';
    this.paymentSuccess = '';
    if (!this.paymentForm.amount || this.paymentForm.amount <= 0) {
      this.paymentError = 'Enter a valid amount.';
      return;
    }
    this.paymentSubmitting = true;
    this.adminService.recordPayment({
      memberId: this.memberId,
      amount: this.paymentForm.amount,
      paymentType: this.paymentForm.paymentType,
      paymentMethod: this.paymentForm.paymentMethod,
      notes: this.paymentForm.notes || null
    }).subscribe({
      next: () => {
        this.paymentSuccess = 'Payment recorded.';
        this.paymentForm = { amount: null, paymentType: 'Fine', paymentMethod: 'Cash', notes: '' };
        this.paymentSubmitting = false;
        this.adminService.getMember(this.memberId!).subscribe({
          next: (d: any) => { this.memberDetail = d; this.loadPayments(); this.cdr.markForCheck(); }
        });
      },
      error: (err: any) => {
        this.paymentError = err?.error?.message || err?.error || 'Failed to record payment.';
        this.paymentSubmitting = false;
        this.cdr.markForCheck();
      }
    });
  }

  onProfilePictureSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.member.profilePictureFile = input.files[0];
    }
  }

  cancel() { this.router.navigate(['/admin/members']); }
}
