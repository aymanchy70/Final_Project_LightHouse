import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';

@Component({
  selector: 'app-location-tree',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './location-tree.html',
  styleUrl: './location-tree.css'
})
export class LocationTreeComponent implements OnInit {
  floors: any[] = [];
  loading = false;
  error = '';

  expandedFloors = new Set<number>();
  expandedSections = new Set<number>();
  expandedRacks = new Set<number>();

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadTree();
  }

  loadTree() {
    this.loading = true;
    this.adminService.getLocationTree().subscribe({
      next: (data: any) => {
        this.floors = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Failed to load location hierarchy.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  refresh() {
    this.loadTree();
  }

  toggleFloor(id: number) {
    if (this.expandedFloors.has(id)) {
      this.expandedFloors.delete(id);
    } else {
      this.expandedFloors.add(id);
    }
  }

  toggleSection(id: number) {
    if (this.expandedSections.has(id)) {
      this.expandedSections.delete(id);
    } else {
      this.expandedSections.add(id);
    }
  }

  toggleRack(id: number) {
    if (this.expandedRacks.has(id)) {
      this.expandedRacks.delete(id);
    } else {
      this.expandedRacks.add(id);
    }
  }

  isFloorExpanded(id: number) { return this.expandedFloors.has(id); }
  isSectionExpanded(id: number) { return this.expandedSections.has(id); }
  isRackExpanded(id: number) { return this.expandedRacks.has(id); }

  deleteFloor(id: number) {
    if (!confirm('Delete this floor? All sections, racks, and shelves inside will also be deleted.')) return;
    this.adminService.deleteFloor(id).subscribe({
      next: () => { this.refresh(); },
      error: () => { this.error = 'Failed to delete floor.'; }
    });
  }

  deleteSection(id: number) {
    if (!confirm('Delete this section? All racks and shelves inside will also be deleted.')) return;
    this.adminService.deleteSection(id).subscribe({
      next: () => { this.refresh(); },
      error: () => { this.error = 'Failed to delete section.'; }
    });
  }

  deleteRack(id: number) {
    if (!confirm('Delete this rack? All shelves inside will also be deleted.')) return;
    this.adminService.deleteRack(id).subscribe({
      next: () => { this.refresh(); },
      error: () => { this.error = 'Failed to delete rack.'; }
    });
  }
}