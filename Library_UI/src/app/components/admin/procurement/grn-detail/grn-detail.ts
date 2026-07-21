import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-grn-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './grn-detail.html',
  styleUrl: './grn-detail.css'
})
export class GRNDetailComponent implements OnInit, OnDestroy {
  grnId!: number;
  grn: any = null;
  loading = false;
  error = '';
  private destroy$ = new Subject<void>();

  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.params.subscribe(p => {
      this.grnId = +p['id'];
      this.load();
    });

    // Auto-refresh every 3 seconds to ensure we catch status updates
    interval(3000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.grnId) {
          this.adminService.getGRN(this.grnId).subscribe({
            next: (d: any) => {
              this.grn = d;
              this.cdr.markForCheck();
            },
            error: () => {}
          });
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load() {
    this.loading = true;
    this.adminService.getGRN(this.grnId).subscribe({
      next: (d: any) => {
        this.grn = d;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Failed to load GRN.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  getTotalQuantity(): number {
    return (this.grn?.items || []).reduce((s: number, i: any) => s + i.quantity, 0);
  }

  goInspect() { this.router.navigate(['/admin/grn/inspect', this.grnId]); }
  goReport()  { this.router.navigate(['/admin/grn/report', this.grnId]); }
  back() { this.router.navigate(['/admin/grn']); }
}