import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';

@Component({
  selector: 'app-supplier-add-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './supplier-add-edit.html',
  styleUrl: './supplier-add-edit.css'
})
export class SupplierAddEditComponent implements OnInit {
  supplierId: number | null = null;
  viewOnly = false;
  supplier = { name: '', email: '', phone: '', address: '' };
  loading = false; submitting = false; error = ''; success = '';

  constructor(private adminService: AdminService, private route: ActivatedRoute, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.route.url.subscribe(segs => { this.viewOnly = segs.some(s => s.path === 'details'); });
    this.route.params.subscribe(params => {
      if (params['id']) { this.supplierId = +params['id']; this.load(); }
    });
  }

  load() {
    this.loading = true;
    this.adminService.getSupplier(this.supplierId!).subscribe({
      next: (d: any) => {
        this.supplier = { name: d.name || '', email: d.email || '', phone: d.phone || '', address: d.address || '' };
        this.loading = false; this.cdr.markForCheck();
      },
      error: () => { this.error = 'Failed to load.'; this.loading = false; this.cdr.markForCheck(); }
    });
  }

  submit() {
    this.error = ''; this.success = '';
    if (!this.supplier.name.trim()) { this.error = 'Supplier name is required.'; return; }
    this.submitting = true;
    const payload = { name: this.supplier.name.trim(), email: this.supplier.email || null, phone: this.supplier.phone || null, address: this.supplier.address || null };
    const call = this.supplierId ? this.adminService.updateSupplier(this.supplierId, payload) : this.adminService.createSupplier(payload);
    call.subscribe({
      next: () => { this.success = this.supplierId ? 'Updated!' : 'Created!'; this.submitting = false; setTimeout(() => this.router.navigate(['/admin/suppliers']), 1500); },
      error: (err: any) => { this.error = err.error?.message || err.error?.title || 'Failed.'; this.submitting = false; }
    });
  }

  cancel() { this.router.navigate(['/admin/suppliers']); }
}
