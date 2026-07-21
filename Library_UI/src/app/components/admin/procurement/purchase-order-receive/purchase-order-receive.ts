import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';

@Component({
  selector: 'app-purchase-order-receive',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './purchase-order-receive.html',
  styleUrl: './purchase-order-receive.css'
})
export class PurchaseOrderReceiveComponent implements OnInit {
  poId: number | null = null;
  po: any = null;          // full PO object from API

  shelves: any[] = [];
  receiveDate = new Date().toISOString().substring(0, 10);

  // Per row receive data
  receiveItems: {
    purchaseOrderItemId: number;
    bookTitle: string;
    edition: string;
    orderedQty: number;
    receivedQty: number;       // already received
    remainingQty: number;      // auto
    newReceiveQty: number;     // user input
    shelfId: number | null;    // user select
  }[] = [];

  submitting = false;
  error    = '';
  success  = '';

  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Load all available shelves for dropdown
    this.adminService.getShelves().subscribe({
      next: (d: any) => { this.shelves = d; this.cdr.markForCheck(); }
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.poId = +params['id'];
        this.loadPO();
      }
    });
  }

  loadPO() {
    this.adminService.getPurchaseOrder(this.poId!).subscribe({
      next: (data: any) => {
        this.po = data;
        this.receiveItems = data.items.map((item: any) => ({
          purchaseOrderItemId: item.purchaseOrderItemId,
          bookTitle:           item.bookTitle || '',
          edition:             item.edition || '',
          orderedQty:          item.orderedQuantity,
          receivedQty:         item.receivedQuantity,
          remainingQty:        item.remainingQuantity,
          newReceiveQty:       0,
          shelfId:             null
        }));
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Failed to load purchase order.';
        this.cdr.markForCheck();
      }
    });
  }

  get totalNewReceiveQty(): number {
    return this.receiveItems.reduce((s, i) => s + i.newReceiveQty, 0);
  }

  submit() {
    this.error = ''; this.success = '';

    if (this.totalNewReceiveQty === 0) {
      this.error = 'Enter at least one quantity to receive.';
      return;
    }

    // Build DTO
    const receivePayload = {
      receiveDate: this.receiveDate,
      items: this.receiveItems
        .filter(i => i.newReceiveQty > 0)
        .map(i => ({
          purchaseOrderItemId: i.purchaseOrderItemId,
          quantity:            i.newReceiveQty,
          shelfId:             +i.shelfId!
        }))
    };

    // Check all shelves selected for items being received
    const missingShelf = receivePayload.items.find(i => !i.shelfId);
    if (missingShelf) {
      this.error = 'Please select a shelf for every received item.';
      return;
    }

    this.submitting = true;
    this.adminService.receivePurchaseOrder(this.poId!, receivePayload).subscribe({
      next: () => {
        this.success = 'Items received successfully! Physical copies created.';
        this.submitting = false;
        this.cdr.markForCheck();
        setTimeout(() => this.router.navigate(['/admin/purchase-orders']), 1800);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to receive items.';
        this.submitting = false;
        this.cdr.markForCheck();
      }
    });
  }

  cancel() {
    this.router.navigate(['/admin/purchase-orders']);
  }
}