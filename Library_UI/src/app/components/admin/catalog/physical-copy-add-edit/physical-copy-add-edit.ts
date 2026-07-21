import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';

@Component({
  selector: 'app-physical-copy-add-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './physical-copy-add-edit.html',
  styleUrl: './physical-copy-add-edit.css'
})
export class PhysicalCopyAddEditComponent implements OnInit {
  copyId: number | null = null;
  viewOnly = false;

  copy: any = {
    bookEditionId: null as number | null,
    baseLibraryCode: '',
    barcode: '',
    shelfId: null as number | null,
    status: 'Available',
    currentCondition: 'Good',
    acquiredDate: '',
    acquiredCost: null as number | null,
    supplierId: null as number | null,
    purchaseInvoice: '',
    isReference: false,
    notes: ''
  };

  editions: any[] = [];
  suppliers: any[] = [];
  floors: any[] = [];
  sections: any[] = [];
  racks: any[] = [];
  shelves: any[] = [];
  filteredSections: any[] = [];
  filteredRacks: any[] = [];
  filteredShelves: any[] = [];
  selectedFloorId: number | null = null;
  selectedSectionId: number | null = null;
  selectedRackId: number | null = null;

  statusOptions = ['Available', 'Borrowed', 'Lost', 'Damaged', 'UnderRepair', 'Disposed'];
  conditionOptions = ['New', 'Good', 'Worn', 'Damaged'];

  loading = false;
  submitting = false;
  error = '';
  success = '';

  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.url.subscribe(segments => {
      this.viewOnly = segments.some(s => s.path === 'details');
    });
    this.loadDropdowns();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.copyId = +params['id'];
        this.loadCopy();
      }
    });
  }

  loadDropdowns() {
    this.adminService.getBookEditions().subscribe({
      next: (d: any) => { this.editions = d; this.cdr.markForCheck(); },
      error: () => {}
    });
    this.adminService.getSuppliers().subscribe({
      next: (d: any) => { this.suppliers = d as any[]; this.cdr.markForCheck(); },
      error: () => {}
    });
    this.adminService.getFloors().subscribe({
      next: (d: any) => { this.floors = d; this.cdr.markForCheck(); },
      error: () => {}
    });
    this.adminService.getSections().subscribe({
      next: (d: any) => { this.sections = d; this.filteredSections = d; this.cdr.markForCheck(); },
      error: () => {}
    });
    this.adminService.getRacks().subscribe({
      next: (d: any) => { this.racks = d; this.filteredRacks = d; this.cdr.markForCheck(); },
      error: () => {}
    });
    this.adminService.getShelves().subscribe({
      next: (d: any) => { this.shelves = d; this.filteredShelves = d; this.cdr.markForCheck(); },
      error: () => {}
    });
  }

  editionLabel(e: any): string {
    const title = e.bookTitle || e.title || 'Book';
    return `${title} — ${e.edition || 'Edition'} (${e.isbn || 'no ISBN'})`;
  }

  onFloorChange() {
    this.filteredSections = this.selectedFloorId
      ? this.sections.filter(s => s.floorId === this.selectedFloorId)
      : this.sections;
    this.selectedSectionId = null;
    this.selectedRackId = null;
    this.copy.shelfId = null;
    this.onSectionChange();
  }

  onSectionChange() {
    this.filteredRacks = this.selectedSectionId
      ? this.racks.filter(r => r.sectionId === this.selectedSectionId)
      : this.racks;
    this.selectedRackId = null;
    this.copy.shelfId = null;
    this.onRackChange();
  }

  onRackChange() {
    this.filteredShelves = this.selectedRackId
      ? this.shelves.filter(s => s.rackId === this.selectedRackId)
      : this.shelves;
    this.copy.shelfId = null;
  }

  private resolveLocationFromShelf(shelfId: number | null) {
    if (!shelfId) return;
    const shelf = this.shelves.find(s => s.shelfId === shelfId);
    if (!shelf) return;
    const rack = this.racks.find(r => r.rackId === shelf.rackId);
    if (!rack) return;
    const section = this.sections.find(s => s.sectionId === rack.sectionId);
    if (!section) return;

    this.selectedFloorId = section.floorId;
    this.filteredSections = this.selectedFloorId
      ? this.sections.filter(s => s.floorId === this.selectedFloorId)
      : this.sections;
    this.selectedSectionId = section.sectionId;
    this.filteredRacks = this.racks.filter(r => r.sectionId === this.selectedSectionId);
    this.selectedRackId = rack.rackId;
    this.filteredShelves = this.shelves.filter(s => s.rackId === this.selectedRackId);
    this.copy.shelfId = shelfId;
  }

  loadCopy() {
    this.loading = true;
    this.adminService.getPhysicalCopy(this.copyId!).subscribe({
      next: (d: any) => {
        this.copy = {
          bookEditionId: d.bookEditionId,
          baseLibraryCode: d.baseLibraryCode || '',
          barcode: d.barcode || '',
          shelfId: d.shelfId || null,
          status: d.status || 'Available',
          currentCondition: d.currentCondition || 'Good',
          acquiredDate: d.acquiredDate ? d.acquiredDate.substring(0, 10) : '',
          acquiredCost: d.acquiredCost ?? null,
          supplierId: d.supplierId ?? null,
          purchaseInvoice: d.purchaseInvoice || '',
          isReference: d.isReference ?? false,
          notes: d.notes || ''
        };
        setTimeout(() => this.resolveLocationFromShelf(d.shelfId), 0);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Failed to load physical copy.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  buildPayload() {
    return {
      bookEditionId: this.copy.bookEditionId,
      baseLibraryCode: this.copy.baseLibraryCode?.trim() || '',
      barcode: this.copy.barcode?.trim() || '',
      shelfId: this.copy.shelfId || null,
      status: this.copy.status,
      currentCondition: this.copy.currentCondition || null,
      acquiredDate: this.copy.acquiredDate || null,
      acquiredCost: this.copy.acquiredCost ?? null,
      supplierId: this.copy.supplierId || null,
      purchaseInvoice: this.copy.purchaseInvoice?.trim() || null,
      isReference: this.copy.isReference,
      notes: this.copy.notes?.trim() || null
    };
  }

  submit() {
    this.error = '';
    this.success = '';
    if (!this.copy.bookEditionId) {
      this.error = 'Please select a book edition.';
      return;
    }
    this.submitting = true;
    const payload = this.buildPayload();
    const call = this.copyId
      ? this.adminService.updatePhysicalCopy(this.copyId, payload)
      : this.adminService.createPhysicalCopy(payload);

    call.subscribe({
      next: () => {
        this.success = this.copyId ? 'Physical copy updated!' : 'Physical copy registered!';
        this.submitting = false;
        setTimeout(() => this.router.navigate(['/admin/physical-copies']), 1500);
      },
      error: (err: any) => {
        this.error = err?.error?.message || err?.error || err?.error?.title || 'Failed to save.';
        this.submitting = false;
        this.cdr.markForCheck();
      }
    });
  }

  cancel() { this.router.navigate(['/admin/physical-copies']); }

  // ────── BARCODE PREVIEW ──────
  @ViewChild('barcodeCanvas') barcodeCanvas!: ElementRef<HTMLCanvasElement>;

  renderBarcode(value: string) {
    if (!value || !this.barcodeCanvas) return;
    try {
      // Note: bwip-js must be installed first: npm install bwip-js
      // Uncomment the import below after installing the package
      // import * as bwipjs from 'bwip-js';
      // bwipjs.toCanvas(this.barcodeCanvas.nativeElement, {
      //   bcid: 'code128',
      //   text: value,
      //   scale: 2,
      //   height: 10,
      //   includetext: true,
      // });
    } catch(e) { console.error('Barcode render error:', e); }
  }

  onBarcodeChange(val: string) {
    if (val) {
      setTimeout(() => this.renderBarcode(val), 100);
    }
  }
}
