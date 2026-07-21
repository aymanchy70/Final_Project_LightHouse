import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';

@Component({
  selector: 'app-physical-copy-shelve',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './physical-copy-shelve.html',
  styleUrl: './physical-copy-shelve.css'
})
export class PhysicalCopyShelveComponent implements OnInit {
  unshelvedCopies: any[] = [];
  selectedCopyIds = new Set<number>();

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
  targetShelfId: number | null = null;

  searchTerm = '';
  loading = false;
  submitting = false;
  error = '';
  success = '';

  constructor(
    private adminService: AdminService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadLocationData();
    this.loadUnshelved();
  }

  loadLocationData() {
    this.adminService.getFloors().subscribe({ next: (d: any) => { this.floors = d; this.cdr.markForCheck(); }, error: () => {} });
    this.adminService.getSections().subscribe({ next: (d: any) => { this.sections = d; this.cdr.markForCheck(); }, error: () => {} });
    this.adminService.getRacks().subscribe({ next: (d: any) => { this.racks = d; this.cdr.markForCheck(); }, error: () => {} });
    this.adminService.getShelves().subscribe({ next: (d: any) => { this.shelves = d; this.cdr.markForCheck(); }, error: () => {} });
  }

  loadUnshelved() {
    this.loading = true;
    this.adminService.getPhysicalCopies().subscribe({
      next: (d: any) => {
        this.unshelvedCopies = d.filter((c: any) => !c.shelfId);
        this.selectedCopyIds.clear();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Failed to load copies.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  get filteredCopies(): any[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.unshelvedCopies;
    return this.unshelvedCopies.filter(c =>
      (c.bookTitle || '').toLowerCase().includes(term) ||
      (c.barcode || '').toLowerCase().includes(term) ||
      (c.fullLibraryCode || '').toLowerCase().includes(term)
    );
  }

  onFloorChange() {
    this.filteredSections = this.selectedFloorId
      ? this.sections.filter(s => s.floorId === this.selectedFloorId)
      : this.sections;
    this.selectedSectionId = null;
    this.selectedRackId = null;
    this.targetShelfId = null;
    this.onSectionChange();
  }

  onSectionChange() {
    this.filteredRacks = this.selectedSectionId
      ? this.racks.filter(r => r.sectionId === this.selectedSectionId)
      : this.racks;
    this.selectedRackId = null;
    this.targetShelfId = null;
    this.onRackChange();
  }

  onRackChange() {
    this.filteredShelves = this.selectedRackId
      ? this.shelves.filter(s => s.rackId === this.selectedRackId)
      : this.shelves;
    this.targetShelfId = null;
  }

  toggleCopy(id: number) {
    if (this.selectedCopyIds.has(id)) this.selectedCopyIds.delete(id);
    else this.selectedCopyIds.add(id);
  }

  isSelected(id: number): boolean { return this.selectedCopyIds.has(id); }

  toggleSelectAll() {
    const ids = this.filteredCopies.map(c => c.physicalCopyId);
    const allSelected = ids.length > 0 && ids.every(id => this.selectedCopyIds.has(id));
    if (allSelected) ids.forEach(id => this.selectedCopyIds.delete(id));
    else ids.forEach(id => this.selectedCopyIds.add(id));
  }

  get allFilteredSelected(): boolean {
    const ids = this.filteredCopies.map(c => c.physicalCopyId);
    return ids.length > 0 && ids.every(id => this.selectedCopyIds.has(id));
  }

  submit() {
    this.error = '';
    this.success = '';
    const copyIds = Array.from(this.selectedCopyIds);
    if (!copyIds.length) {
      this.error = 'Select at least one copy to shelve.';
      return;
    }
    if (!this.targetShelfId) {
      this.error = 'Select a target shelf.';
      return;
    }
    if (!confirm(`Shelve ${copyIds.length} copy/copies on the selected shelf?`)) return;

    this.submitting = true;
    this.adminService.bulkShelve({ copyIds, shelfId: this.targetShelfId }).subscribe({
      next: (res: any) => {
        this.success = res?.message || `${copyIds.length} copies shelved successfully.`;
        this.submitting = false;
        this.loadUnshelved();
        this.cdr.markForCheck();
        setTimeout(() => this.router.navigate(['/admin/physical-copies']), 2000);
      },
      error: (err: any) => {
        this.error = err?.error?.message || err?.error || 'Bulk shelve failed.';
        this.submitting = false;
        this.cdr.markForCheck();
      }
    });
  }

  cancel() { this.router.navigate(['/admin/physical-copies']); }
}
