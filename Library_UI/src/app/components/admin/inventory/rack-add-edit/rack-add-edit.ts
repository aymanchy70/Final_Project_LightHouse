import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';

@Component({
  selector: 'app-rack-add-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './rack-add-edit.html',
  styleUrl: './rack-add-edit.css'
})
export class RackAddEditComponent implements OnInit {
  rackId: number | null = null;
  viewOnly = false;

  floors: any[] = [];
  sections: any[] = [];
  filteredSections: any[] = [];
  selectedFloorId: number | null = null;

  rack = {
    sectionId: 0,
    rackCode: '',
    rackName: '',
    totalShelves: 6,
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
        this.rackId = +params['id'];
        this.loadRack();
      }
      this.route.queryParams.subscribe(qParams => {
        if (qParams['sectionId']) {
          this.rack.sectionId = +qParams['sectionId'];
        }
      });
    });
  }

  loadLocations() {
    this.adminService.getFloors().subscribe({
      next: (data: any) => {
        this.floors = data;
        this.cdr.markForCheck();
      },
      error: () => {}
    });
    this.adminService.getSections().subscribe({
      next: (data: any) => {
        this.sections = data;
        this.filteredSections = data;
        this.cdr.markForCheck();
      },
      error: () => {}
    });
  }

  onFloorChange(): void {
    if (this.selectedFloorId) {
      this.filteredSections = this.sections.filter(s => s.floorId === this.selectedFloorId);
    } else {
      this.filteredSections = this.sections;
    }
    this.rack.sectionId = 0;
  }

  loadRack() {
    this.loading = true;
    this.error = '';
    this.adminService.getRack(this.rackId!).subscribe({
      next: (data: any) => {
        this.rack = {
          sectionId: data.sectionId || 0,
          rackCode: data.rackCode || '',
          rackName: data.rackName || '',
          totalShelves: data.totalShelves || 6,
          ddcRangeStart: data.ddcRangeStart || '',
          ddcRangeEnd: data.ddcRangeEnd || ''
        };
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load rack.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  submit() {
    this.error = '';
    this.success = '';

    if (!this.rack.sectionId || this.rack.sectionId === 0) {
      this.error = 'Please select a parent Section.';
      return;
    }
    if (!this.rack.rackCode || !this.rack.rackCode.trim()) {
      this.error = 'Rack Code is required.';
      return;
    }
    if (this.rack.totalShelves < 1 || this.rack.totalShelves > 20) {
      this.error = 'Total Shelves must be between 1 and 20.';
      return;
    }

    this.submitting = true;

    const payload = {
      sectionId: this.rack.sectionId,
      rackCode: this.rack.rackCode.trim(),
      rackName: this.rack.rackName?.trim() || null,
      totalShelves: this.rack.totalShelves,
      ddcRangeStart: this.rack.ddcRangeStart?.trim() || null,
      ddcRangeEnd: this.rack.ddcRangeEnd?.trim() || null
    };

    const call = this.rackId
      ? this.adminService.updateRack(this.rackId, payload)
      : this.adminService.createRack(payload);

    call.subscribe({
      next: () => {
        this.success = this.rackId ? 'Rack updated successfully!' : 'Rack created successfully!';
        this.submitting = false;
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/admin/location/racks']), 1500);
      },
      error: (err: any) => {
        let msg = 'Failed to save rack.';
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
    this.router.navigate(['/admin/location/racks']);
  }
}