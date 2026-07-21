import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../../services/admin';

@Component({
  selector: 'app-item-category-add-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './item-category-add-edit.html',
  styleUrl: './item-category-add-edit.css'
})
export class ItemCategoryAddEditComponent implements OnInit {
  categoryId: number | null = null;
  viewOnly = false;
  category = { categoryName: '', categoryDescription: '', isActive: true, createdBy: '', updatedBy: '' };
  loading = false; submitting = false; error = ''; success = '';

  constructor(private adminService: AdminService, private route: ActivatedRoute, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.route.url.subscribe(urlSegments => {
      this.viewOnly = urlSegments.some(seg => seg.path === 'details');
    });
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.categoryId = +params['id'];
        this.loadCategory();
      } else {
        this.category.createdBy = localStorage.getItem('username') || '';
      }
    });
  }

  loadCategory() {
    this.loading = true;
    this.adminService.getItemCategory(this.categoryId!).subscribe({
      next: (data: any) => {
        this.category = {
          categoryName: data.categoryName || '',
          categoryDescription: data.categoryDescription || '',
          isActive: data.isActive ?? true,
          createdBy: data.createdBy || '',
          updatedBy: localStorage.getItem('username') || ''
        };
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.error = 'Failed to load category.'; this.loading = false; this.cdr.markForCheck(); }
    });
  }

  submit() {
    this.error = ''; this.success = '';
    if (!this.category.categoryName.trim()) { this.error = 'Category Name is required.'; return; }
    this.submitting = true;
    if (this.categoryId) {
      this.category.updatedBy = localStorage.getItem('username') || '';
      this.adminService.updateItemCategory(this.categoryId, this.category).subscribe({
        next: () => { this.success = 'Category updated!'; this.submitting = false; this.cdr.markForCheck(); setTimeout(() => this.router.navigate(['/admin/item-categories']), 1500); },
        error: () => { this.error = 'Failed to update.'; this.submitting = false; this.cdr.markForCheck(); }
      });
    } else {
      this.category.createdBy = localStorage.getItem('username') || '';
      this.adminService.createItemCategory(this.category).subscribe({
        next: () => { this.success = 'Category created!'; this.submitting = false; this.cdr.markForCheck(); setTimeout(() => this.router.navigate(['/admin/item-categories']), 1500); },
        error: () => { this.error = 'Failed to create.'; this.submitting = false; this.cdr.markForCheck(); }
      });
    }
  }

  cancel() { this.router.navigate(['/admin/item-categories']); }
}