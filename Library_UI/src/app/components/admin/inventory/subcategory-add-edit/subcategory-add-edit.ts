import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';

@Component({
  selector: 'app-subcategory-add-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './subcategory-add-edit.html',
  styleUrl: './subcategory-add-edit.css'
})
export class SubcategoryAddEditComponent implements OnInit {
  subcategoryId: number | null = null;
  viewOnly = false;
  subcategory = {
    name: '',
    description: '',
    categoryId: 0,
    isActive: true,
    createdBy: '',
    updatedBy: ''
  };
  categories: any[] = [];
  loading = false;
  submitting = false;
  error = '';
  success = '';

  constructor(private adminService: AdminService, private route: ActivatedRoute, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadCategories();
    this.route.url.subscribe(urlSegments => {
      this.viewOnly = urlSegments.some(seg => seg.path === 'details');
    });
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.subcategoryId = +params['id'];
        this.loadSubcategory();
      } else {
        this.subcategory.createdBy = localStorage.getItem('username') || '';
      }
    });
  }

  loadCategories() {
    this.adminService.getItemCategories().subscribe({ next: (d: any) => this.categories = d, error: () => {} });
  }

  loadSubcategory() {
    this.loading = true;
    this.adminService.getSubCategory(this.subcategoryId!).subscribe({
      next: (data: any) => {
        this.subcategory = {
          name: data.name || '',
          description: data.description || '',
          categoryId: data.categoryId || 0,
          isActive: data.isActive ?? true,
          createdBy: data.createdBy || '',
          updatedBy: localStorage.getItem('username') || ''
        };
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.error = 'Failed to load.'; this.loading = false; this.cdr.markForCheck(); }
    });
  }

  submit() {
    this.error = ''; this.success = '';
    if (!this.subcategory.name.trim()) { this.error = 'Name is required.'; return; }
    if (!this.subcategory.categoryId) { this.error = 'Please select a category.'; return; }
    this.submitting = true;

    if (this.subcategoryId) {
      this.subcategory.updatedBy = localStorage.getItem('username') || '';
      this.adminService.updateSubCategory(this.subcategoryId, this.subcategory).subscribe({
        next: () => { this.success = 'Updated!'; this.submitting = false; setTimeout(() => this.router.navigate(['/admin/sub-categories']), 1500); },
        error: () => { this.error = 'Failed to update.'; this.submitting = false; }
      });
    } else {
      this.subcategory.createdBy = localStorage.getItem('username') || '';
      this.adminService.createSubCategory(this.subcategory).subscribe({
        next: () => { this.success = 'Created!'; this.submitting = false; setTimeout(() => this.router.navigate(['/admin/sub-categories']), 1500); },
        error: () => { this.error = 'Failed to create.'; this.submitting = false; }
      });
    }
  }

  cancel() { this.router.navigate(['/admin/sub-categories']); }
}