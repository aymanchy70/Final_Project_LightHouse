import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AdminService } from '../../../../services/admin';
import { GrnDraftService } from '../../../../services/grn-draft.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-grn-inspect',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './grn-inspect.html',
  styleUrl: './grn-inspect.css'
})
export class GRNInspectComponent implements OnInit {

  // Draft data from GrnDraftService
  grn: any = null;          // mimics the GRN shape the HTML expects
  submitting = false;
  error      = '';
  success    = '';
  loading    = false;
  grnId: number | null = null;
  isExistingGRN = false;

  // Inspector header fields
  inspection = {
    inspectedBy:     '',
    inspectionDate:  new Date().toISOString().substring(0, 10),
    decision:        '' as 'Approved' | 'Rejected' | '',
    inspectionNotes: ''
  };

  // Per-item inspection rows — built from draft display items
  inspectionItems: {
    purchaseOrderItemId: number;
    bookTitle:   string;
    edition:     string;
    pO_Number:   string;
    shelfCode:   string;
    shelfId:     number;
    quantity:    number;          // qty to receive (from create form)
    condition:   'Good' | 'Damaged' | 'Rejected';
    acceptedQty: number;
    itemNotes:   string;
  }[] = [];

  constructor(
    private adminService: AdminService,
    private grnDraft:     GrnDraftService,
    private router:       Router,
    private route:        ActivatedRoute,
    private cdr:          ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Check if we have a route parameter for an existing GRN
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.grnId = +params['id'];
        this.isExistingGRN = true;
        this.loadExistingGRN();
      } else {
        this.loadDraftGRN();
      }
    });
  }

  // Load existing GRN from database
  private loadExistingGRN() {
    if (!this.grnId) return;
    
    this.loading = true;
    this.adminService.getGRN(this.grnId).subscribe({
      next: (grnData: any) => {
        this.grn = grnData;
        // Build inspection items from existing GRN with shelf information
        this.buildInspectionItemsFromExistingGRN(grnData);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = 'Failed to load GRN. Please try again.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Build inspection items from existing GRN (with shelf codes)
  private buildInspectionItemsFromExistingGRN(grnData: any) {
    this.inspectionItems = (grnData.items || []).map((item: any) => ({
      purchaseOrderItemId: item.purchaseOrderItemId,
      bookTitle:   item.bookTitle || item.title || '—',
      edition:     item.edition || '—',
      pO_Number:   item.poNumber || item.pO_Number || '—',
      shelfCode:   item.shelfCode || item.shelf || '—',  // Ensure shelf is populated
      shelfId:     item.shelfId || 0,
      quantity:    item.quantity || 0,
      condition:   'Good' as const,
      acceptedQty: item.quantity || 0,   // default: all accepted
      itemNotes:   ''
    }));
  }

  // Load draft GRN
  private loadDraftGRN() {
    // Guard: if no draft exists, go back to create
    if (!this.grnDraft.hasDraft) {
      this.router.navigate(['/admin/grn/create']);
      return;
    }

    const header = this.grnDraft.grnHeader;

    // Build a grn-like object matching what the HTML template expects
    this.grn = {
      grn_Number:         'DRAFT — Not yet saved',
      receivedDate:       header?.receivedDate       || '',
      receivedBy:         header?.receivedBy         || '',
      vehicleNumber:      header?.vehicleNumber       || '',
      deliveryPersonName: header?.deliveryPersonName  || '',
      notes:              header?.notes               || '',
      supplierName:       header?.supplierName        || '',
      poNumber:           header?.poNumber            || '',
      status:             'Pending',
      items:              this.grnDraft.displayItems
    };

    // Build per-item inspection rows from draft display items
    this.inspectionItems = this.grnDraft.displayItems.map(item => ({
      purchaseOrderItemId: item.purchaseOrderItemId,
      bookTitle:   item.bookTitle,
      edition:     item.edition,
      pO_Number:   item.poNumber,
      shelfCode:   item.shelfCode,
      shelfId:     item.shelfId,
      quantity:    item.receiveQty,
      condition:   'Good' as const,
      acceptedQty: item.receiveQty,   // default: all accepted
      itemNotes:   ''
    }));

    this.cdr.markForCheck();
  }

  // ── Condition toggle — auto-adjusts acceptedQty ──────────
  setCondition(item: any, condition: 'Good' | 'Damaged' | 'Rejected') {
    item.condition = condition;
    if (condition === 'Rejected') {
      item.acceptedQty = 0;
    } else if (condition === 'Good') {
      item.acceptedQty = item.quantity;
    }
    // Damaged: user sets acceptedQty manually
    this.cdr.markForCheck();
  }

  // ── Computed totals ──────────────────────────────────────
  getTotalReceived(): number {
    return this.inspectionItems.reduce((s, i) => s + i.quantity, 0);
  }

  getTotalAccepted(): number {
    return this.inspectionItems.reduce((s, i) => s + (i.acceptedQty || 0), 0);
  }

  get acceptanceRate(): number {
    const total = this.getTotalReceived();
    if (!total) return 100;
    return (this.getTotalAccepted() / total) * 100;
  }

  // ── Validation ───────────────────────────────────────────
  validateInspection(): boolean {
    if (!this.inspection.inspectedBy.trim()) {
      this.error = 'Inspector name is required.';
      return false;
    }
    if (!this.inspection.inspectionDate) {
      this.error = 'Inspection date is required.';
      return false;
    }
    if (!this.inspection.decision) {
      this.error = 'Please select a decision: Approve or Reject.';
      return false;
    }
    for (const item of this.inspectionItems) {
      if (item.acceptedQty < 0) {
        this.error = `Accepted quantity for "${item.bookTitle}" cannot be negative.`;
        return false;
      }
      if (item.acceptedQty > item.quantity) {
        this.error = `Accepted quantity for "${item.bookTitle}" cannot exceed received quantity (${item.quantity}).`;
        return false;
      }
    }
    return true;
  }

  // ── Submit inspection ────────────────────────────────────
  submitInspection() {
    this.error   = '';
    this.success = '';

    if (!this.validateInspection()) {
      this.cdr.markForCheck();
      return;
    }

    // ── REJECTED — discard draft, go back to list ─────────
    if (this.inspection.decision === 'Rejected') {
      if (!this.isExistingGRN) {
        this.grnDraft.clear();
      }
      this.success = 'GRN rejected. No data has been saved.';
      this.cdr.markForCheck();
      setTimeout(() => this.router.navigate(['/admin/grn']), 1600);
      return;
    }

    // ── APPROVED ─────────────────────────────────────────────
    this.submitting = true;
    this.cdr.markForCheck();

    if (this.isExistingGRN && this.grnId) {
      // Existing GRN: use inspectGRN endpoint
      this.approveExistingGRN();
    } else {
      // Draft GRN: use createGRN endpoint
      this.approveDraftGRN();
    }
  }

  // Approve draft GRN (create new)
  private approveDraftGRN() {
    const draft = this.grnDraft.payload;

    const approvedItems = this.inspectionItems
      .filter(i => i.acceptedQty > 0)
      .map(i => ({
        purchaseOrderItemId: i.purchaseOrderItemId,
        quantity:            i.acceptedQty,
        shelfId:             i.shelfId
      }));

    if (approvedItems.length === 0) {
      this.error = 'No items have an accepted quantity greater than 0.';
      this.submitting = false;
      this.cdr.markForCheck();
      return;
    }

    const finalPayload = {
      receivedDate:       draft.receivedDate,
      receivedBy:         draft.receivedBy,
      vehicleNumber:      draft.vehicleNumber,
      deliveryPersonName: draft.deliveryPersonName,
      notes:              draft.notes,
      items:              approvedItems
    };

    this.adminService.createGRN(finalPayload).subscribe({
      next: (d: any) => {
        this.grnDraft.clear();
        this.success    = `GRN ${d.grn_Number || d.gRN_Number || ''} created & approved successfully! Stock has been updated.`;
        this.submitting = false;
        this.cdr.markForCheck();
        setTimeout(() => this.router.navigate(['/admin/grn/details', d.grnId || d.id]), 1800);
      },
      error: (err: any) => {
        this.error      = err.error?.message || err.error?.title || 'Failed to create GRN. Please go back and check your data.';
        this.submitting = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Approve existing GRN (inspect)
  private approveExistingGRN() {
    if (!this.grnId) return;

    const approvedItems = this.inspectionItems
      .filter(i => i.acceptedQty > 0)
      .map(i => ({
        purchaseOrderItemId: i.purchaseOrderItemId,
        quantity:            i.acceptedQty,
        shelfId:             i.shelfId
      }));

    if (approvedItems.length === 0) {
      this.error = 'No items have an accepted quantity greater than 0.';
      this.submitting = false;
      this.cdr.markForCheck();
      return;
    }

    const inspectionPayload = {
      inspectedBy:      this.inspection.inspectedBy,
      inspectionDate:   this.inspection.inspectionDate,
      inspectionNotes:  this.inspection.inspectionNotes,
      items:            approvedItems
    };

    this.adminService.inspectGRN(this.grnId, inspectionPayload).subscribe({
      next: (d: any) => {
        this.success    = 'GRN inspected and approved successfully! Stock has been updated.';
        this.submitting = false;
        this.cdr.markForCheck();
        // Reload detail page which will fetch updated status from API
        setTimeout(() => this.router.navigate(['/admin/grn/details', this.grnId]), 1800);
      },
      error: (err: any) => {
        this.error      = err.error?.message || err.error?.title || 'Failed to approve GRN. Please try again.';
        this.submitting = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ── Back — cancel inspection ─────────────────────────────
  back() {
    if (this.isExistingGRN && this.grnId) {
      this.router.navigate(['/admin/grn/details', this.grnId]);
    } else {
      this.router.navigate(['/admin/grn/create']);
    }
  }
}