import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';
import { PaginationComponent } from '../../../shared/pagination/pagination';
import { applySearch, applySort, getPage, toggleSort, sortIcon, SortState } from '../../../shared/list-helper';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent],
  templateUrl: './payment-list.html',
  styleUrl: './payment-list.css'
})
export class PaymentListComponent implements OnInit {
  allItems: any[] = [];
  filtered: any[] = [];
  paged: any[] = [];

  searchTerm = '';
  typeFilter = 'All';
  sort: SortState = { column: 'paymentDate', direction: 'desc' };
  currentPage = 1;
  pageSize = 10;
  loading = false;
  error = '';
  successMessage = '';

  typeOptions = ['All', 'Fine', 'MembershipFee'];

  constructor(
    private adminService: AdminService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.error = '';
    // Fan-out per member until GET /api/Payment (all) is added to the API
    this.adminService.getMembers().subscribe({
      next: (members: any[]) => {
        const calls = members.map((m: any) =>
          this.adminService.getMemberPayments(m.memberId).toPromise().catch(() => [])
        );
        Promise.all(calls).then((results) => {
          this.allItems = (results as any[][]).flat();
          this.refresh();
          this.loading = false;
          this.cdr.markForCheck();
        });
      },
      error: () => {
        this.error = 'Failed to load payments.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  refresh() {
    let d = applySearch(this.allItems, this.searchTerm, ['memberName', 'paymentType', 'paymentMethod', 'notes']);
    if (this.typeFilter !== 'All') d = d.filter((i: any) => i.paymentType === this.typeFilter);
    d = applySort(d, this.sort);
    this.filtered = d;
    this.currentPage = 1;
    this.updatePage();
  }

  updatePage() { this.paged = getPage(this.filtered, this.currentPage, this.pageSize); }
  onPageChanged(p: number) { this.currentPage = p; this.updatePage(); }
  onPageSizeChanged(s: number) { this.pageSize = s; this.currentPage = 1; this.updatePage(); }
  sortBy(col: string) { this.sort = toggleSort(this.sort, col); this.refresh(); }
  icon(col: string) { return sortIcon(this.sort, col); }

  viewDetail(id: number) {
    this.router.navigate(['/admin/payments/details', id]);
  }

  addPayment() {
    this.router.navigate(['/admin/payments/add']);
  }

  getTypeBadgeClass(type: string): string {
    return type === 'MembershipFee' ? 'badge-membership' : 'badge-fine';
  }

  get totalFine()       { return this.allItems.filter((i: any) => i.paymentType === 'Fine').reduce((s: number, i: any) => s + i.amount, 0); }
  get totalMembership() { return this.allItems.filter((i: any) => i.paymentType === 'MembershipFee').reduce((s: number, i: any) => s + i.amount, 0); }
  get totalAll()        { return this.allItems.reduce((s: number, i: any) => s + i.amount, 0); }
}
