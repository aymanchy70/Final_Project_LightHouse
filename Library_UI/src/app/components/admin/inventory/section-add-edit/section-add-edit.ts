import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';

@Component({
  selector: 'app-section-add-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './section-add-edit.html',
  styleUrl: './section-add-edit.css'
})
export class SectionAddEditComponent implements OnInit {
  sectionId: number | null = null;
  viewOnly = false;

  floors: any[] = [];

  section = {
    floorId: 0,
    sectionCode: '',
    sectionName: '',
    ddcRangeStart: '',
    ddcRangeEnd: '',
    isSpecial: false
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
    
    this.loadFloors();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.sectionId = +params['id'];
        this.loadSection();
      }
      // Check for pre-selected floorId from query params (when coming from tree)
      this.route.queryParams.subscribe(qParams => {
        if (qParams['floorId']) {
          this.section.floorId = +qParams['floorId'];
        }
      });
    });
  }

  loadFloors() {
    this.adminService.getFloors().subscribe({
      next: (data: any) => {
        this.floors = data;
        this.cdr.markForCheck();
      },
      error: () => {}
    });
  }

  loadSection() {
    this.loading = true;
    this.error = '';
    this.adminService.getSection(this.sectionId!).subscribe({
      next: (data: any) => {
        this.section = {
          floorId: data.floorId || 0,
          sectionCode: data.sectionCode || '',
          sectionName: data.sectionName || '',
          ddcRangeStart: data.ddcRangeStart || '',
          ddcRangeEnd: data.ddcRangeEnd || '',
          isSpecial: data.isSpecial || false
        };
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load section.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  submit() {
    this.error = '';
    this.success = '';

    if (!this.section.floorId || this.section.floorId === 0) {
      this.error = 'Please select a parent Floor.';
      return;
    }
    if (!this.section.sectionCode || !this.section.sectionCode.trim()) {
      this.error = 'Section Code is required.';
      return;
    }
    if (!this.section.sectionName || !this.section.sectionName.trim()) {
      this.error = 'Section Name is required.';
      return;
    }

    this.submitting = true;

    const payload = {
      floorId: this.section.floorId,
      sectionCode: this.section.sectionCode.trim(),
      sectionName: this.section.sectionName.trim(),
      ddcRangeStart: this.section.ddcRangeStart?.trim() || null,
      ddcRangeEnd: this.section.ddcRangeEnd?.trim() || null,
      isSpecial: this.section.isSpecial
    };

    const call = this.sectionId
      ? this.adminService.updateSection(this.sectionId, payload)
      : this.adminService.createSection(payload);

    call.subscribe({
      next: () => {
        this.success = this.sectionId ? 'Section updated successfully!' : 'Section created successfully!';
        this.submitting = false;
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/admin/location/sections']), 1500);
      },
      error: (err: any) => {
        let msg = 'Failed to save section.';
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
    this.router.navigate(['/admin/location/sections']);
  }
}