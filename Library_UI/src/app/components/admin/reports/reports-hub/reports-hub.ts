import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';
import { PaginationComponent } from '../../../shared/pagination/pagination';
import { getPage } from '../../../shared/list-helper';

export type ReportKind = 'po' | 'grn';

export interface SearchFieldOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-reports-hub',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent],
  templateUrl: './reports-hub.html',
  styleUrl: './reports-hub.css'
})
export class ReportsHubComponent implements OnInit {
  reportKind: ReportKind = 'po';
  searchField = 'pO_Number';
  searchQuery = '';
  statusFilter = '';

  poList: any[] = [];
  grnList: any[] = [];
  filtered: any[] = [];
  paged: any[] = [];

  currentPage = 1;
  pageSize = 10;
  // FIX 1: Start loading as true — data hasn't arrived yet
  loading = true;
  error = '';

  readonly poSearchFields: SearchFieldOption[] = [
    { value: 'pO_Number', label: 'PO Number' },
    { value: 'supplierName', label: 'Supplier Name' },
    { value: 'status', label: 'Status' }
  ];

  readonly grnSearchFields: SearchFieldOption[] = [
    // FIX 2: C# GRN_Number → camelCase JSON = gRN_Number. Also support grnNumber fallback.
    { value: 'gRN_Number', label: 'GRN Number' },
    { value: 'pO_Number', label: 'PO Number' },
    { value: 'receivedBy', label: 'Received By' }
  ];

  readonly poStatusOptions = [
    '', 'Draft', 'PendingApproval', 'Approved', 'PartiallyReceived', 'Received', 'Completed', 'Cancelled'
  ];

  constructor(private adminService: AdminService, private router: Router) {}

  ngOnInit() {
    this.loadData();
  }

  get searchFields(): SearchFieldOption[] {
    return this.reportKind === 'po' ? this.poSearchFields : this.grnSearchFields;
  }

  onReportKindChange() {
    this.searchField = this.searchFields[0].value;
    this.searchQuery = '';
    this.statusFilter = '';
    this.refresh();
  }

  loadData() {
    this.loading = true;
    this.error = '';

    // FIX 3: Use forkJoin-style sequential load; don't leave loading=true if PO fails
    this.adminService.getPurchaseOrders().subscribe({
      next: (po: any) => {
        this.poList = po || [];
        this.adminService.getGRNs().subscribe({
          next: (grn: any) => {
            // FIX 4: C# IsActive → JSON isActive (camelCase). Filter correctly.
            this.grnList = (grn || []).filter((g: any) => g.isActive !== false);
            this.loading = false;
            this.refresh();
          },
          error: () => {
            this.error = 'Failed to load GRN list.';
            this.loading = false;
            this.refresh(); // still show POs
          }
        });
      },
      error: () => {
        this.error = 'Failed to load purchase orders.';
        this.loading = false;
        this.refresh(); // show empty state, not forever-loading
      }
    });
  }

  refresh() {
    const source = this.reportKind === 'po' ? this.poList : this.grnList;
    const q = this.searchQuery.trim().toLowerCase();

    this.filtered = source.filter((item: any) => {
      if (this.reportKind === 'po' && this.statusFilter && item.status !== this.statusFilter) {
        return false;
      }
      if (!q) return true;
      return this.itemMatchesSearch(item, q);
    });

    this.currentPage = 1;
    this.updatePage();
  }

  private itemMatchesSearch(item: any, q: string): boolean {
    // FIX 5: GRN PO-Number search — look at items[].pO_Number (C# PO_Number → pO_Number)
    if (this.searchField === 'pO_Number' && this.reportKind === 'grn') {
      const headerPo = (item.pO_Number || item.purchaseOrderNumber || '').toLowerCase();
      if (headerPo.includes(q)) return true;
      return (item.items || []).some((line: any) =>
        String(line.pO_Number || line.purchaseOrderNumber || '').toLowerCase().includes(q)
      );
    }

    const raw = this.getFieldValue(item, this.searchField);
    return String(raw ?? '').toLowerCase().includes(q);
  }

  private getFieldValue(item: any, field: string): string {
    // FIX 6: Resolve GRN number across all possible casing variants from C# JSON
    if (field === 'gRN_Number') {
      return item.gRN_Number || item.grn_Number || item.grnNumber || `GRN-${item.grnId}`;
    }
    return item[field] ?? '';
  }

  updatePage() {
    this.paged = getPage(this.filtered, this.currentPage, this.pageSize);
  }

  onPageChanged(p: number) {
    this.currentPage = p;
    this.updatePage();
  }

  onPageSizeChanged(s: number) {
    this.pageSize = s;
    this.currentPage = 1;
    this.updatePage();
  }

  openReport(item: any) {
    if (this.reportKind === 'po') {
      // FIX 7: Use correct route path and correct ID field (purchaseOrderId, camelCase)
      this.router.navigate(['/admin/purchase-orders/report', item.purchaseOrderId]);
    } else {
      // FIX 8: grnId is correct camelCase from C# GRNId
      this.router.navigate(['/admin/grn/report', item.grnId]);
    }
  }

  displayNumber(item: any): string {
    if (this.reportKind === 'po') return item.pO_Number || `PO-${item.purchaseOrderId}`;
    // FIX 9: Resolve all GRN number casing variants
    return item.gRN_Number || item.grn_Number || item.grnNumber || `GRN-${item.grnId}`;
  }

  displaySubtitle(item: any): string {
    if (this.reportKind === 'po') {
      return item.supplierName || '—';
    }
    // FIX 10: GRN has no supplierName in DTO — derive from items[0].pO_Number
    const po = item.pO_Number || item.items?.[0]?.pO_Number;
    return po ? `PO: ${po}` : (item.receivedBy || '—');
  }

  statusLabel(status: string): string {
    if (!status) return '—';
    return status.replace(/([A-Z])/g, ' $1').trim();
  }
}