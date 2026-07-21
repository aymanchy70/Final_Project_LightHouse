import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../../services/admin';

@Component({
  selector: 'app-publisher-add-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './publisher-add-edit.html',
  styleUrl: './publisher-add-edit.css'
})
export class PublisherAddEditComponent implements OnInit {
  publisherId: number | null = null;
  viewOnly = false;
  publisher = { name: '', address: '', phone: '', email: '', website: '', isActive: true, createdBy: '', updatedBy: '' };
  loading = false; submitting = false; error = ''; success = '';

  constructor(private adminService: AdminService, private route: ActivatedRoute, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.route.url.subscribe(urlSegments => {
      this.viewOnly = urlSegments.some(seg => seg.path === 'details');
    });
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.publisherId = +params['id'];
        this.loadPublisher();
      } else {
        this.publisher.createdBy = localStorage.getItem('username') || '';
      }
    });
  }

  loadPublisher() {
    this.loading = true;
    this.adminService.getPublisher(this.publisherId!).subscribe({
      next: (data: any) => {
        this.publisher = {
          name: data.name || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          website: data.website || '',
          isActive: data.isActive ?? true,
          createdBy: data.createdBy || '',
          updatedBy: localStorage.getItem('username') || ''
        };
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.error = 'Failed to load publisher.'; this.loading = false; this.cdr.markForCheck(); }
    });
  }

  submit() {
    this.error = ''; this.success = '';
    if (!this.publisher.name.trim()) { this.error = 'Name is required.'; return; }
    this.submitting = true;
    if (this.publisherId) {
      this.publisher.updatedBy = localStorage.getItem('username') || '';
      this.adminService.updatePublisher(this.publisherId, this.publisher).subscribe({
        next: () => { this.success = 'Publisher updated!'; this.submitting = false; setTimeout(() => this.router.navigate(['/admin/publishers']), 1500); },
        error: () => { this.error = 'Failed to update.'; this.submitting = false; }
      });
    } else {
      this.publisher.createdBy = localStorage.getItem('username') || '';
      this.adminService.createPublisher(this.publisher).subscribe({
        next: () => { this.success = 'Publisher created!'; this.submitting = false; setTimeout(() => this.router.navigate(['/admin/publishers']), 1500); },
        error: () => { this.error = 'Failed to create.'; this.submitting = false; }
      });
    }
  }

  cancel() { this.router.navigate(['/admin/publishers']); }
}