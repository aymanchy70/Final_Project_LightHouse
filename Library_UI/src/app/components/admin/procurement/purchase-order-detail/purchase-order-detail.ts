import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';

@Component({
  selector: 'app-purchase-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './purchase-order-detail.html',
  styleUrl: './purchase-order-detail.css'
})
export class PurchaseOrderDetailComponent implements OnInit {
  orderId!: number;
  order: any = null;
  shelves: any[] = [];
  loading = false; error = ''; success = '';
  submitting = false;

  receiveMode = false;
  receiveDate = new Date().toISOString().substring(0, 10);
  receiveLines: { purchaseOrderItemId: number; bookTitle: string; edition: string; remaining: number; quantity: number; shelfId: number | null }[] = [];

  constructor(private adminService: AdminService, private route: ActivatedRoute, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.route.params.subscribe(p => { this.orderId = +p['id']; this.load(); });
    this.adminService.getShelves().subscribe({ next: (d: any) => { this.shelves = d; this.cdr.markForCheck(); } });
  }

  load() {
    this.loading = true;
    this.adminService.getPurchaseOrder(this.orderId).subscribe({
      next: (d: any) => { this.order = d; this.loading = false; this.cdr.markForCheck(); },
      error: () => { this.error = 'Failed to load order.'; this.loading = false; this.cdr.markForCheck(); }
    });
  }

  approve() {
    if (!confirm(`Approve order ${this.order.pO_Number}?`)) return;
    this.submitting = true; this.error = '';
    this.adminService.approvePurchaseOrder(this.orderId).subscribe({
      next: () => { this.success = 'Order approved!'; this.submitting = false; this.load(); },
      error: (err: any) => { this.error = err.error?.message || 'Failed to approve.'; this.submitting = false; this.cdr.markForCheck(); }
    });
  }

  startReceive() {
    this.receiveLines = (this.order.items || [])
      .filter((i: any) => i.remainingQuantity > 0)
      .map((i: any) => ({ purchaseOrderItemId: i.purchaseOrderItemId, bookTitle: i.bookTitle, edition: i.edition, remaining: i.remainingQuantity, quantity: i.remainingQuantity, shelfId: null }));
    this.receiveDate = new Date().toISOString().substring(0, 10);
    this.receiveMode = true; this.error = ''; this.success = '';
    this.cdr.markForCheck();
  }

  cancelReceive() { this.receiveMode = false; this.error = ''; }

  submitReceive() {
    this.error = '';
    for (const line of this.receiveLines) {
      if (!line.quantity || line.quantity < 1 || line.quantity > line.remaining) { this.error = `Invalid quantity for "${line.bookTitle}". Max remaining: ${line.remaining}`; return; }
      if (!line.shelfId) { this.error = `Please select a shelf for "${line.bookTitle}".`; return; }
    }
    this.submitting = true;
    const payload = { receiveDate: this.receiveDate, items: this.receiveLines.map(l => ({ purchaseOrderItemId: l.purchaseOrderItemId, quantity: l.quantity, shelfId: l.shelfId })) };
    this.adminService.receivePurchaseOrder(this.orderId, payload).subscribe({
      next: (d: any) => { this.success = d.message || 'Books received!'; this.submitting = false; this.receiveMode = false; this.load(); },
      error: (err: any) => { this.error = err.error?.message || err.error?.title || 'Receive failed.'; this.submitting = false; this.cdr.markForCheck(); }
    });
  }

  cancel() {
    if (!confirm(`Cancel order ${this.order.pO_Number}? This cannot be undone.`)) return;
    this.submitting = true;
    this.adminService.cancelPurchaseOrder(this.orderId).subscribe({
      next: () => { this.success = 'Order cancelled.'; this.submitting = false; this.load(); },
      error: (err: any) => { this.error = err.error?.message || 'Failed to cancel.'; this.submitting = false; this.cdr.markForCheck(); }
    });
  }

  get orderTotal(): number {
    if (!this.order?.items) return 0;
    return this.order.items.reduce((sum: number, i: any) => sum + ((i.unitCost || 0) * i.orderedQuantity), 0);
  }

  get grandTotal(): number {
    return this.orderTotal + (this.order?.additionalCharge || 0);
  }

  getTotalOrdered(): number  { return (this.order?.items || []).reduce((s: number, i: any) => s + i.orderedQuantity, 0); }
  getTotalReceived(): number { return (this.order?.items || []).reduce((s: number, i: any) => s + i.receivedQuantity, 0); }
  getTotalRemaining(): number { return (this.order?.items || []).reduce((s: number, i: any) => s + i.remainingQuantity, 0); }

  statusClass(status: string): string {
    return ({ 'PendingApproval': 'pending', 'Approved': 'approved', 'PartiallyReceived': 'partial', 'Completed': 'completed', 'Cancelled': 'cancelled' } as any)[status] || 'pending';
  }
  statusIcon(status: string): string {
    return ({ 'PendingApproval': '', 'Approved': '', 'PartiallyReceived': '📦', 'Completed': '🏁', 'Cancelled': '❌' } as any)[status] || '';
  }

  back() { this.router.navigate(['/admin/purchase-orders']); }
  goReport() { this.router.navigate(['/admin/purchase-orders/report', this.orderId]); }
}