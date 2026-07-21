import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';
import { PaginationComponent } from '../../../shared/pagination/pagination';
import { applySearch, applySort, getPage, toggleSort, sortIcon, SortState } from '../../../shared/list-helper';

@Component({
  selector: 'app-grn-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent],
  templateUrl: './grn-list.html',
  styleUrl: './grn-list.css'
})
export class GRNListComponent implements OnInit {
  allItems: any[] = [];
  filtered: any[] = [];
  paged: any[] = [];

  searchTerm = '';
  sort: SortState = { column: 'grnId', direction: 'desc' };
  currentPage = 1;
  pageSize = 10;
  loading = false;
  error = '';

  constructor(
    private adminService: AdminService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.adminService.getGRNs().subscribe({
      next: (d: any) => {
        this.allItems = d;
        this.refresh();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Failed to load GRNs.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  refresh() {
    let d = applySearch(this.allItems, this.searchTerm, ['gRN_Number', 'receivedBy', 'vehicleNumber', 'deliveryPersonName']);
    d = d.filter(i => i.isActive !== false);
    d = applySort(d, this.sort);
    this.filtered = d;
    this.currentPage = 1;
    this.updatePage();
  }

  updatePage() { this.paged = getPage(this.filtered, this.currentPage, this.pageSize); }
  onPageChanged(p: number) { this.currentPage = p; this.updatePage(); }
  onPageSizeChanged(s: number) { this.pageSize = s; this.currentPage = 1; this.updatePage(); }
  sortBy(col: string) { this.sort = toggleSort(this.sort, col); this.refresh(); }
  icon(col: string) { return sortIcon(this.sort, col); }

  addNew() { this.router.navigate(['/admin/grn/create']); }
  view(id: number) { this.router.navigate(['/admin/grn/details', id]); }
  inspect(id: number) { this.router.navigate(['/admin/grn/inspect', id]); }
}