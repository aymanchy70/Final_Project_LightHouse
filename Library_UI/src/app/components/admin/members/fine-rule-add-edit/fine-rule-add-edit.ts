import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';

@Component({
  selector: 'app-fine-rule-add-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './fine-rule-add-edit.html',
  styleUrl: './fine-rule-add-edit.css'
})
export class FineRuleAddEditComponent implements OnInit {
  ruleId: number | null = null;
  viewOnly = false;
  rule = {
    ruleName: '', fineType: 'PerDay',
    fineAmount: null as number | null,
    finePerDay: null as number | null,
    percentageOfBookPrice: null as number | null,
    maxFineAmount: null as number | null,
    gracePeriodDays: 0, isActive: true
  };
  fineTypes = ['Fixed', 'PerDay', 'Percentage'];
  loading = false; submitting = false; error = ''; success = '';

  constructor(private adminService: AdminService, private route: ActivatedRoute, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.route.url.subscribe(urlSegments => {
      this.viewOnly = urlSegments.some(seg => seg.path === 'details');
    });
    this.route.params.subscribe(params => {
      if (params['id']) { this.ruleId = +params['id']; this.load(); }
    });
  }

  load() {
    this.loading = true;
    this.adminService.getFineRule(this.ruleId!).subscribe({
      next: (d: any) => {
        this.rule = {
          ruleName: d.ruleName || '', fineType: d.fineType || 'PerDay',
          fineAmount: d.fineAmount ?? null, finePerDay: d.finePerDay ?? null,
          percentageOfBookPrice: d.percentageOfBookPrice ?? null,
          maxFineAmount: d.maxFineAmount ?? null,
          gracePeriodDays: d.gracePeriodDays ?? 0, isActive: d.isActive ?? true
        };
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.error = 'Failed to load.'; this.loading = false; this.cdr.markForCheck(); }
    });
  }

  submit() {
    this.error = ''; this.success = '';
    if (!this.rule.ruleName.trim()) { this.error = 'Rule Name is required.'; return; }
    this.submitting = true;
    const call = this.ruleId
      ? this.adminService.updateFineRule(this.ruleId, this.rule)
      : this.adminService.createFineRule(this.rule);
    call.subscribe({
      next: () => { this.success = this.ruleId ? 'Updated!' : 'Created!'; this.submitting = false; setTimeout(() => this.router.navigate(['/admin/fine-rules']), 1500); },
      error: (err: any) => { this.error = err.error?.title || JSON.stringify(err.error) || 'Failed.'; this.submitting = false; }
    });
  }

  cancel() { this.router.navigate(['/admin/fine-rules']); }
}