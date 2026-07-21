import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';
import { GrnDraftService } from '../../../../services/grn-draft.service';

@Component({
  selector: 'app-grn-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './grn-create.html',
  styleUrl: './grn-create.css'
})
export class GRNCreateComponent implements OnInit {
  purchaseOrders: any[] = [];
  selectedPOId: number | null = null;
  selectedPO: any = null;

  // Location hierarchy
  floors: any[] = [];
  sections: any[] = [];
  racks: any[] = [];
  shelves: any[] = [];
  filteredShelves: any[] = [];
  allShelves: any[] = [];
  shelfSearchInput: string = '';

  selectedFloorId: number | null = null;
  selectedSectionId: number | null = null;
  selectedRackId: number | null = null;
  selectedShelfId: number | null = null;

  grn = {
    receivedDate:       new Date().toISOString().substring(0, 10),
    receivedBy:         '',
    vehicleNumber:      '',
    deliveryPersonName: '',
    notes:              ''
  };

  // Pending items from the selected PO
  pendingItems: {
    purchaseOrderItemId: number;
    bookTitle:           string;
    edition:             string;
    poNumber:            string;
    orderedQty:          number;
    alreadyReceived:     number;
    remaining:           number;
    receiveQty:          number;
    shelfId:             number | null;
  }[] = [];

  // ── PO Picker Modal ──────────────────────────────────────
  showPOModal      = false;
  poModalSearch    = '';
  filteredModalPOs: any[] = [];

  // Expand/collapse per PO row
  expandedPOId:      number | null = null;
  expandedPOItems:   any[] = [];
  expandedPOLoading  = false;

  submitting = false;
  error      = '';
  success    = '';

  constructor(
    private adminService: AdminService,
    private grnDraft:     GrnDraftService,
    private router:       Router,
    private cdr:          ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Load approved & partially received POs
    this.adminService.getPurchaseOrders().subscribe({
      next: (d: any) => {
        this.purchaseOrders    = d.filter((po: any) =>
          po.status === 'Approved' || po.status === 'PartiallyReceived'
        );
        this.filteredModalPOs  = [...this.purchaseOrders];
        this.cdr.markForCheck();
      }
    });

    // Load all location hierarchy data
    this.adminService.getFloors().subscribe({
      next: (d: any) => { this.floors = d; this.cdr.markForCheck(); }
    });

    this.adminService.getSections().subscribe({
      next: (d: any) => { this.sections = d; this.cdr.markForCheck(); }
    });

    this.adminService.getRacks().subscribe({
      next: (d: any) => { this.racks = d; this.cdr.markForCheck(); }
    });

    this.adminService.getShelves().subscribe({
      next: (d: any) => {
        this.shelves       = d;
        this.allShelves    = d;
        this.filteredShelves = d;
        this.cdr.markForCheck();
      }
    });
  }

  // ── Quick PO dropdown ────────────────────────────────────
  onQuickPOSelect(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    if (!value) return;
    const po = this.purchaseOrders.find(p => p.purchaseOrderId == +value);
    if (po) {
      this.selectedPOId = po.purchaseOrderId;
      this.closePOModal();
      this.loadPOItems(po.purchaseOrderId);
    }
  }

  // ── Modal open / close ───────────────────────────────────
  openPOModal() {
    this.poModalSearch   = '';
    this.filteredModalPOs = [...this.purchaseOrders];
    this.expandedPOId    = null;
    this.expandedPOItems = [];
    this.showPOModal     = true;
    this.cdr.markForCheck();
  }

  closePOModal() {
    this.showPOModal     = false;
    this.expandedPOId    = null;
    this.expandedPOItems = [];
    this.cdr.markForCheck();
  }

  // ── Modal search ─────────────────────────────────────────
  onPOModalSearch() {
    const term = this.poModalSearch.toLowerCase().trim();
    if (!term) {
      this.filteredModalPOs = [...this.purchaseOrders];
    } else {
      this.filteredModalPOs = this.purchaseOrders.filter(po => {
        const poNum    = (po.pO_Number || po.po_Number || '').toLowerCase();
        const supplier = (po.supplierName || '').toLowerCase();
        const status   = (po.status || '').toLowerCase();
        return poNum.includes(term) || supplier.includes(term) || status.includes(term);
      });
    }
    this.expandedPOId    = null;
    this.expandedPOItems = [];
    this.cdr.markForCheck();
  }

  clearPOModalSearch() {
    this.poModalSearch = '';
    this.onPOModalSearch();
  }

  // ── Expand / collapse PO row ─────────────────────────────
  toggleExpand(poId: number) {
    if (this.expandedPOId === poId) {
      this.expandedPOId    = null;
      this.expandedPOItems = [];
      this.cdr.markForCheck();
      return;
    }

    this.expandedPOId      = poId;
    this.expandedPOItems   = [];
    this.expandedPOLoading = true;
    this.cdr.markForCheck();

    this.adminService.getPurchaseOrder(poId).subscribe({
      next: (po: any) => {
        this.expandedPOItems   = po.items || [];
        this.expandedPOLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.expandedPOItems   = [];
        this.expandedPOLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ── Select a PO from modal ───────────────────────────────
  selectPOFromModal(po: any) {
    this.selectedPOId = po.purchaseOrderId;
    this.closePOModal();
    this.loadPOItems(po.purchaseOrderId);
  }

  // ── Load pending items for selected PO ───────────────────
  loadPOItems(poId: number) {
    this.pendingItems = [];
    this.selectedPO   = null;

    this.adminService.getPurchaseOrder(poId).subscribe({
      next: (po: any) => {
        this.selectedPO = po;
        if (po.items) {
          for (const item of po.items) {
            if (item.remainingQuantity > 0) {
              this.pendingItems.push({
                purchaseOrderItemId: item.purchaseOrderItemId,
                bookTitle:           item.bookTitle || 'Unknown',
                edition:             item.edition   || '—',
                poNumber:            po.pO_Number   || po.po_Number,
                orderedQty:          item.orderedQuantity,
                alreadyReceived:     item.receivedQuantity,
                remaining:           item.remainingQuantity,
                receiveQty:          item.remainingQuantity,
                shelfId:             null
              });
            }
          }
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Failed to load PO details.';
        this.cdr.markForCheck();
      }
    });
  }

  // kept for compatibility
  onPOChange() {
    if (this.selectedPOId) { this.loadPOItems(this.selectedPOId); }
  }

  onShelfSearchChange(searchInput: string): void {
    const searchTerm = (searchInput || this.shelfSearchInput || '').toLowerCase().trim();
    if (!searchTerm) {
      this.filteredShelves = [...this.allShelves];
    } else {
      this.filteredShelves = this.allShelves.filter((shelf: any) => {
        if (!shelf) return false;
        return (
          (shelf.shelfCode   || '').toLowerCase().includes(searchTerm) ||
          (shelf.floorCode   || '').toLowerCase().includes(searchTerm) ||
          (shelf.sectionCode || '').toLowerCase().includes(searchTerm) ||
          (shelf.rackCode    || '').toLowerCase().includes(searchTerm)
        );
      });
    }
    this.cdr.markForCheck();
  }

  onFloorChange(): void {
    this.selectedSectionId = null;
    this.selectedRackId    = null;
    this.filteredShelves   = this.shelves;
  }

  onSectionChange(): void {
    this.selectedRackId = null;
    if (this.selectedSectionId) {
      this.adminService.getRacksBySection(this.selectedSectionId).subscribe({
        next: (d: any) => { this.racks = d; this.cdr.markForCheck(); }
      });
    }
    this.filteredShelves = this.shelves;
  }

  onRackChange(): void {
    if (this.selectedRackId) {
      this.adminService.getShelvesByRack(this.selectedRackId).subscribe({
        next: (d: any) => { this.filteredShelves = d; this.cdr.markForCheck(); }
      });
    } else {
      this.filteredShelves = this.shelves;
    }
  }

  get totalReceiveQty(): number {
    return this.pendingItems.reduce((s, i) => s + i.receiveQty, 0);
  }

  // ── Submit — validate then store draft & go to inspect ───
  // NO API call here. API is called only when inspector clicks Approve.
  submit() {
    this.error   = '';
    this.success = '';

    if (!this.selectedPOId) {
      this.error = 'Select a Purchase Order.';
      return;
    }

    const itemsToReceive = this.pendingItems.filter(i => i.receiveQty > 0);
    if (itemsToReceive.length === 0) {
      this.error = 'Enter at least one quantity to receive.';
      return;
    }

    for (const item of itemsToReceive) {
      if (item.receiveQty > item.remaining) {
        this.error = `Quantity for "${item.bookTitle}" exceeds remaining (${item.remaining}).`;
        return;
      }
      if (!item.shelfId) {
        this.error = `Select a shelf for "${item.bookTitle}".`;
        return;
      }
    }

    // Build the API payload (will be sent on Approve)
    const payload = {
      receivedDate:       this.grn.receivedDate,
      receivedBy:         this.grn.receivedBy         || null,
      vehicleNumber:      this.grn.vehicleNumber       || null,
      deliveryPersonName: this.grn.deliveryPersonName  || null,
      notes:              this.grn.notes               || null,
      items: itemsToReceive.map(i => ({
        purchaseOrderItemId: i.purchaseOrderItemId,
        quantity:            i.receiveQty,
        shelfId:             +i.shelfId!
      }))
    };

    // Build display items for inspection page
    const displayItems = itemsToReceive.map(i => {
      const shelf = this.allShelves.find(s => s.shelfId === i.shelfId);
      return {
        purchaseOrderItemId: i.purchaseOrderItemId,
        bookTitle:  i.bookTitle,
        edition:    i.edition,
        poNumber:   i.poNumber,
        shelfId:    i.shelfId!,
        shelfCode:  shelf?.shelfCode || '',
        receiveQty: i.receiveQty
      };
    });

    // Build header info for inspection banner
    const header = {
      receivedDate:       this.grn.receivedDate,
      receivedBy:         this.grn.receivedBy         || '',
      vehicleNumber:      this.grn.vehicleNumber       || '',
      deliveryPersonName: this.grn.deliveryPersonName  || '',
      notes:              this.grn.notes               || '',
      supplierName:       this.selectedPO?.supplierName || '',
      poNumber:           this.selectedPO?.pO_Number   || this.selectedPO?.po_Number || ''
    };

    // Store in draft service — no API call yet
    this.grnDraft.store(payload, displayItems, header);

    // Navigate to inspection page
    this.router.navigate(['/admin/grn/inspect']);
  }

  cancel() { this.router.navigate(['/admin/grn']); }
}