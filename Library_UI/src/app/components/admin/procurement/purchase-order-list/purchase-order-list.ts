import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';
import { PaginationComponent } from '../../../shared/pagination/pagination';
import { applySearch, applySort, getPage, toggleSort, sortIcon, SortState } from '../../../shared/list-helper';

@Component({
  selector: 'app-purchase-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent],
  templateUrl: './purchase-order-list.html',
  styleUrl: './purchase-order-list.css'
})
export class PurchaseOrderListComponent implements OnInit {
  allItems: any[] = [];
  filtered: any[] = [];
  paged: any[] = [];

  searchTerm = '';
  filterStatus = '';
  sort: SortState = { column: 'purchaseOrderId', direction: 'desc' };
  currentPage = 1;
  pageSize = 10;
  loading = false;
  error = '';
  successMessage = '';

  constructor(
    private adminService: AdminService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.adminService.getPurchaseOrders().subscribe({
      next: (d: any) => {
        this.allItems = d;
        this.refresh();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Failed to load purchase orders.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  refresh() {
    let d = applySearch(this.allItems, this.searchTerm, ['pO_Number', 'supplierName', 'status', 'notes']);
    if (this.filterStatus) d = d.filter(i => i.status === this.filterStatus);
    d = d.filter(i => i.isActive !== false);
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

  addNew() { this.router.navigate(['/admin/purchase-orders/create']); }
  view(id: number) { this.router.navigate(['/admin/purchase-orders/details', id]); }
  receive(id: number) { this.router.navigate(['/admin/purchase-orders/receive', id]); }

  approve(id: number) {
    if (!confirm('Approve this purchase order?')) return;
    this.adminService.approvePurchaseOrder(id).subscribe({
      next: () => {
        this.successMessage = 'PO approved!';
        this.load();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Approval failed.';
        this.cdr.markForCheck();
      }
    });
  }

  cancel(id: number) {
    if (!confirm('Cancel this purchase order?')) return;
    this.adminService.cancelPurchaseOrder(id).subscribe({
      next: () => {
        this.successMessage = 'PO cancelled.';
        this.load();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Cancel failed.';
        this.cdr.markForCheck();
      }
    });
  }

  statusClass(status: string): string {
    switch (status) {
      case 'PendingApproval': return 'chip-pending';
      case 'Approved': return 'chip-approved';
      case 'PartiallyReceived': return 'chip-partial';
      case 'Completed': return 'chip-completed';
      case 'Cancelled': return 'chip-cancelled';
      default: return '';
    }
  }
}