import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../../services/admin';

@Component({
  selector: 'app-po-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './po-report.html',
  styleUrl: './po-report.css'
})
export class PoReportComponent implements OnInit {
  order: any = null;
  loading = true;
  error = '';
  today = new Date();
  viewMode: 'detail' | 'preview' | 'list' = 'detail';
  searchQuery = '';
  itemSearchType: 'bookTitle' | 'edition' = 'bookTitle';
  filteredItems: any[] = [];

  readonly itemSearchOptions = [
    { value: 'bookTitle', label: 'Book Title' },
    { value: 'edition',   label: 'Edition'     }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    if (!id || isNaN(id)) {
      this.error = 'Invalid Purchase Order ID.';
      this.loading = false;
      return;
    }

    this.adminService.getPurchaseOrder(id).subscribe({
      next: (d: any) => {
        this.order = d;
        this.loading = false;
        this.updateFilteredItems();
      },
      error: () => {
        this.error = 'Failed to load Purchase Order report. Please try again.';
        this.loading = false;
      }
    });
  }

  print() { this.printReport(); }

  back() { this.router.navigate(['/admin/reports']); }

  setViewMode(mode: 'detail' | 'preview' | 'list') {
    this.viewMode = mode;
  }

  updateFilteredItems() {
    if (!this.order?.items) { this.filteredItems = []; return; }
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredItems = [...this.order.items];
    } else {
      this.filteredItems = this.order.items.filter((item: any) =>
        String(item[this.itemSearchType] ?? '').toLowerCase().includes(query)
      );
    }
  }

  onSearchChange(value: string) {
    this.searchQuery = value;
    this.updateFilteredItems();
  }

  // ── Computed totals ────────────────────────────────────────────
  get orderTotal(): number {
    return (this.order?.items || []).reduce(
      (s: number, i: any) => s + (i.unitCost || 0) * (i.orderedQuantity || 0), 0
    );
  }

  get grandTotal(): number {
    return this.orderTotal + (this.order?.additionalCharge || 0);
  }

  get totalOrdered(): number {
    return (this.order?.items || []).reduce((s: number, i: any) => s + (i.orderedQuantity || 0), 0);
  }

  get totalReceived(): number {
    return (this.order?.items || []).reduce((s: number, i: any) => s + (i.receivedQuantity || 0), 0);
  }

  get totalRemaining(): number {
    return (this.order?.items || []).reduce((s: number, i: any) => s + (i.remainingQuantity || 0), 0);
  }

  get fulfillmentRate(): number {
    return this.totalOrdered
      ? Math.round((this.totalReceived / this.totalOrdered) * 1000) / 10
      : 0;
  }

  // ── Status helpers ─────────────────────────────────────────────
  statusClass(status: string): string {
    const map: Record<string, string> = {
      'Draft':             'draft',
      'PendingApproval':   'pending',
      'Approved':          'approved',
      'PartiallyReceived': 'partial',
      'Received':          'received',
      'Completed':         'completed',
      'Cancelled':         'cancelled'
    };
    return map[status] || 'pending';
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      'Draft':             'Draft',
      'PendingApproval':   'Pending Approval',
      'Approved':          'Approved',
      'PartiallyReceived': 'Partially Received',
      'Received':          'Received',
      'Completed':         'Completed',
      'Cancelled':         'Cancelled'
    };
    return map[status] || status;
  }

  // ── Isolated print into popup window ──────────────────────────
  // Opens only the .report-page element — prevents app chrome from printing.
  printReport() {
    const reportEl = document.querySelector('.report-page') as HTMLElement;
    if (!reportEl) { window.print(); return; }

    const styleLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .map((l: any) => `<link rel="stylesheet" href="${l.href}">`)
      .join('\n');
    const styleBlocks = Array.from(document.querySelectorAll('style'))
      .map((s: any) => `<style>${s.innerHTML}</style>`)
      .join('\n');

    const printWin = window.open('', '_blank', 'width=900,height=700');
    if (!printWin) { window.print(); return; }

    printWin.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>PO Report — ${this.order?.pO_Number || ''}</title>
  ${styleLinks}
  ${styleBlocks}
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; background: white; font-family: 'Segoe UI', sans-serif; }
    .report-page { box-shadow: none !important; border-radius: 0 !important; max-width: 100% !important; }
    @page { size: A4 portrait; margin: 12mm 14mm; }
    @media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }
  </style>
</head>
<body>
  ${reportEl.outerHTML}
  <script>
    window.onload = function() { setTimeout(function() { window.print(); window.close(); }, 400); };
  <\/script>
</body>
</html>`);
    printWin.document.close();
  }
}