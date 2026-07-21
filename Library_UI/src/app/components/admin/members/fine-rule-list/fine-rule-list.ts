import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';
import { PaginationComponent } from '../../../shared/pagination/pagination';
import { applySearch, applySort, getPage, toggleSort, sortIcon, SortState } from '../../../shared/list-helper';

@Component({
  selector: 'app-fine-rule-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent],
  templateUrl: './fine-rule-list.html',
  styleUrl: './fine-rule-list.css'
})
export class FineRuleListComponent implements OnInit {
  allItems: any[] = []; filtered: any[] = []; paged: any[] = [];
  searchTerm = ''; sort: SortState = { column: 'fineRuleId', direction: 'asc' };
  currentPage = 1; pageSize = 10; loading = false; error = ''; successMessage = '';

  constructor(private adminService: AdminService, private router: Router, private cdr: ChangeDetectorRef) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.adminService.getFineRules().subscribe({
      next: (d: any) => { this.allItems = d; this.refresh(); this.loading = false; this.cdr.markForCheck(); },
      error: () => { this.error = 'Failed to load fine rules.'; this.loading = false; this.cdr.markForCheck(); }
    });
  }

  refresh() {
    let d = applySearch(this.allItems, this.searchTerm, ['ruleName', 'fineType']);
    d = d.filter(i => i.isActive !== false);
    d = applySort(d, this.sort);
    this.filtered = d; this.currentPage = 1; this.updatePage();
  }

  updatePage() { this.paged = getPage(this.filtered, this.currentPage, this.pageSize); }
  onPageChanged(p: number) { this.currentPage = p; this.updatePage(); }
  onPageSizeChanged(s: number) { this.pageSize = s; this.currentPage = 1; this.updatePage(); }
  sortBy(col: string) { this.sort = toggleSort(this.sort, col); this.refresh(); }
  icon(col: string) { return sortIcon(this.sort, col); }
  edit(id: number) { this.router.navigate(['/admin/fine-rules/edit', id]); }
  details(id: number) { this.router.navigate(['/admin/fine-rules/details', id]); }
  delete(id: number) {
    if (!confirm('Delete this fine rule?')) return;
    this.adminService.deleteFineRule(id).subscribe({
      next: () => {
        this.successMessage = 'Deleted!';
        this.allItems = this.allItems.filter(i => i.fineRuleId !== id);
        this.refresh();
        this.cdr.markForCheck();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => { this.error = 'Failed to delete.'; this.cdr.markForCheck(); }
    });
  }

  toggleActive(item: any) {
    const updated = {
      ruleName: item.ruleName,
      fineType: item.fineType,
      fineAmount: item.fineAmount,
      finePerDay: item.finePerDay,
      percentageOfBookPrice: item.percentageOfBookPrice,
      maxFineAmount: item.maxFineAmount,
      gracePeriodDays: item.gracePeriodDays,
      isActive: !item.isActive
    };
    this.adminService.updateFineRule(item.fineRuleId, updated).subscribe({
      next: () => {
        item.isActive = !item.isActive;
        this.successMessage = item.isActive ? 'Activated!' : 'Deactivated!';
        this.cdr.markForCheck();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => { this.error = 'Toggle failed.'; this.cdr.markForCheck(); }
    });
  }
}