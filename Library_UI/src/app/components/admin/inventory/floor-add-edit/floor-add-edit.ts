import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';

@Component({
  selector: 'app-floor-add-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './floor-add-edit.html',
  styleUrl: './floor-add-edit.css'
})
export class FloorAddEditComponent implements OnInit {
  floorId: number | null = null;
  viewOnly = false;

  floor = {
    floorCode: '',
    floorName: '',
    description: ''
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
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.floorId = +params['id'];
        this.loadFloor();
      }
    });
  }

  loadFloor() {
    this.loading = true;
    this.error = '';
    this.adminService.getFloor(this.floorId!).subscribe({
      next: (data: any) => {
        this.floor = {
          floorCode: data.floorCode || '',
          floorName: data.floorName || '',
          description: data.description || ''
        };
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load floor.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  submit() {
    this.error = '';
    this.success = '';

    if (!this.floor.floorCode || !this.floor.floorCode.trim()) {
      this.error = 'Floor Code is required.';
      return;
    }
    if (!this.floor.floorName || !this.floor.floorName.trim()) {
      this.error = 'Floor Name is required.';
      return;
    }

    this.submitting = true;

    const payload = {
      floorCode: this.floor.floorCode.trim(),
      floorName: this.floor.floorName.trim(),
      description: this.floor.description?.trim() || null
    };

    const call = this.floorId
      ? this.adminService.updateFloor(this.floorId, payload)
      : this.adminService.createFloor(payload);

    call.subscribe({
      next: () => {
        this.success = this.floorId ? 'Floor updated successfully!' : 'Floor created successfully!';
        this.submitting = false;
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/admin/location/floors']), 1500);
      },
      error: (err: any) => {
        let msg = 'Failed to save floor.';
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
    this.router.navigate(['/admin/location/floors']);
  }
}