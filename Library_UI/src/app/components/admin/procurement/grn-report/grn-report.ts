import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../../services/admin';

@Component({
  selector: 'app-grn-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './grn-report.html',
  styleUrl: './grn-report.css'
})
export class GrnReportComponent implements OnInit {
  grn: any = null;
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
      this.error = 'Invalid GRN ID.';
      this.loading = false;
      return;
    }

    this.adminService.getGRN(id).subscribe({
      next: (d: any) => {
        this.grn = d;
        this.loading = false;
        this.updateFilteredItems();
      },
      error: () => {
        this.error = 'Failed to load GRN report. Please try again.';
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
    if (!this.grn?.items) { this.filteredItems = []; return; }
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredItems = [...this.grn.items];
    } else {
      this.filteredItems = this.grn.items.filter((item: any) =>
        String(item[this.itemSearchType] ?? '').toLowerCase().includes(query)
      );
    }
  }

  onSearchChange(value: string) {
    this.searchQuery = value;
    this.updateFilteredItems();
  }

  // ── Computed totals ────────────────────────────────────────────
  // GRNItemResponseDto has no acceptedQuantity — quantity IS the accepted qty.
  // Rejected items are simply not included in the GRN.
  get totalQuantity(): number {
    return (this.grn?.items || []).reduce((s: number, i: any) => s + (i.quantity || 0), 0);
  }

  get totalAccepted(): number {
    return (this.grn?.items || []).reduce(
      (s: number, i: any) => s + (i.acceptedQuantity ?? i.quantity ?? 0), 0
    );
  }

  get totalRejected(): number {
    return this.totalQuantity - this.totalAccepted;
  }

  get acceptanceRate(): number {
    return this.totalQuantity
      ? Math.round((this.totalAccepted / this.totalQuantity) * 1000) / 10
      : 100;
  }

  // ── GRN number — resolves all C# JSON casing variants ─────────
  get grnNumber(): string {
    return this.grn?.gRN_Number
        || this.grn?.grn_Number
        || this.grn?.grnNumber
        || (this.grn?.grnId ? `GRN-${this.grn.grnId}` : 'GRN-???');
  }

  // ── PO number — GRN header may not carry it; derive from items ─
  get purchaseOrderNumber(): string {
    if (this.grn?.purchaseOrderNumber) return this.grn.purchaseOrderNumber;
    const first = (this.grn?.items || [])[0];
    return first?.pO_Number || first?.purchaseOrderNumber || '—';
  }

  // ── Isolated print into popup window ──────────────────────────
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
  <title>GRN Report — ${this.grnNumber}</title>
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