import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';

@Component({
  selector: 'app-shelf-add-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './shelf-add-edit.html',
  styleUrl: './shelf-add-edit.css'
})
export class ShelfAddEditComponent implements OnInit {
  shelfId: number | null = null;
  viewOnly = false;

  sections: any[] = [];
  racks: any[] = [];
  filteredRacks: any[] = [];
  selectedSectionId: number | null = null;

  shelf = {
    rackId: 0,
    shelfCode: '',
    shelfLevel: 1,
    shelfLabel: '',
    maxCapacity: 80,
    ddcRangeStart: '',
    ddcRangeEnd: ''
  };

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
    this.route.url.subscribe(urlSegments => {
      this.viewOnly = urlSegments.some(seg => seg.path === 'details');
    });
    
    this.loadLocations();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.shelfId = +params['id'];
        this.loadShelf();
      }
      this.route.queryParams.subscribe(qParams => {
        if (qParams['rackId']) {
          this.shelf.rackId = +qParams['rackId'];
        }
      });
    });
  }

  loadLocations() {
    this.adminService.getSections().subscribe({
      next: (data: any) => {
        this.sections = data;
        this.cdr.markForCheck();
      },
      error: () => {}
    });
    this.adminService.getRacks().subscribe({
      next: (data: any) => {
        this.racks = data;
        this.filteredRacks = data;
        this.cdr.markForCheck();
      },
      error: () => {}
    });
  }

  onSectionChange(): void {
    if (this.selectedSectionId) {
      this.filteredRacks = this.racks.filter(r => r.sectionId === this.selectedSectionId);
    } else {
      this.filteredRacks = this.racks;
    }
    this.shelf.rackId = 0;
  }

  loadShelf() {
    this.loading = true;
    this.error = '';
    this.adminService.getShelf(this.shelfId!).subscribe({
      next: (data: any) => {
        this.shelf = {
          rackId: data.rackId || 0,
          shelfCode: data.shelfCode || '',
          shelfLevel: data.shelfLevel || 1,
          shelfLabel: data.shelfLabel || '',
          maxCapacity: data.maxCapacity || 80,
          ddcRangeStart: data.ddcRangeStart || '',
          ddcRangeEnd: data.ddcRangeEnd || ''
        };
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load shelf.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  submit() {
    this.error = '';
    this.success = '';

    if (!this.shelf.rackId || this.shelf.rackId === 0) {
      this.error = 'Please select a parent Rack.';
      return;
    }
    if (!this.shelf.shelfCode || !this.shelf.shelfCode.trim()) {
      this.error = 'Shelf Code is required.';
      return;
    }
    if (this.shelf.shelfLevel < 1 || this.shelf.shelfLevel > 20) {
      this.error = 'Shelf Level must be between 1 and 20.';
      return;
    }
    if (this.shelf.maxCapacity < 1 || this.shelf.maxCapacity > 200) {
      this.error = 'Max Capacity must be between 1 and 200.';
      return;
    }

    this.submitting = true;

    const payload = {
      rackId: this.shelf.rackId,
      shelfCode: this.shelf.shelfCode.trim(),
      shelfLevel: this.shelf.shelfLevel,
      shelfLabel: this.shelf.shelfLabel?.trim() || '',
      maxCapacity: this.shelf.maxCapacity,
      ddcRangeStart: this.shelf.ddcRangeStart?.trim() || null,
      ddcRangeEnd: this.shelf.ddcRangeEnd?.trim() || null
    };

    const call = this.shelfId
      ? this.adminService.updateShelf(this.shelfId, payload)
      : this.adminService.createShelf(payload);

    call.subscribe({
      next: () => {
        this.success = this.shelfId ? 'Shelf updated successfully!' : 'Shelf created successfully!';
        this.submitting = false;
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/admin/location/shelves']), 1500);
      },
      error: (err: any) => {
        let msg = 'Failed to save shelf.';
        if (err?.error?.errors) {
          msg = Object.values(err.error.errors).flat().join(', ');
        } else if (err?.error?.message) {
          msg = err.error.message;
        } else if (err?.error?.title) {
          msg = err.error.title;
        }
        this.error = msg;
        this.submitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancel() {
    this.router.navigate(['/admin/location/shelves']);
  }
}