import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';
import { ToastService } from '../../../../services/toast.service';
import { PaginationComponent } from '../../../shared/pagination/pagination';
import { applySearch, applySort, getPage, toggleSort, sortIcon, SortState } from '../../../shared/list-helper';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent],
  templateUrl: './member-list.html',
  styleUrl: './member-list.css'
})
export class MemberListComponent implements OnInit {
  allItems: any[] = []; filtered: any[] = []; paged: any[] = [];
  searchTerm = '';
  listTab: 'Active' | 'Pending' = 'Active';
  sort: SortState = { column: 'memberId', direction: 'asc' };
  currentPage = 1; pageSize = 10; loading = false; error = '';
  processingId: number | null = null;

  constructor(private adminService: AdminService, private router: Router, private route: ActivatedRoute, private toast: ToastService, private cdr: ChangeDetectorRef) {}
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'Pending') {
        this.setTab('Pending');
      }
    });
    this.load();
  }

  load() {
    this.loading = true;
    this.adminService.getMembers().subscribe({
      next: (d: any) => { this.allItems = d; this.refresh(); this.loading = false; this.cdr.markForCheck(); },
      error: () => { this.toast.error('Failed to load members.'); this.loading = false; this.cdr.markForCheck(); }
    });
  }

  setTab(tab: 'Active' | 'Pending') {
    this.listTab = tab;
    this.refresh();
  }

  refresh() {
    let d = applySearch(this.allItems, this.searchTerm, ['fullName', 'phone', 'membershipTypeName']);
    if (this.listTab === 'Active') {
      // FIX #3: exclude PendingApproval members from Active tab to prevent dual-tab appearance
      d = d.filter(i => i.isActive !== false && i.membershipStatus !== 'PendingApproval');
    } else {
      d = d.filter(i => i.membershipStatus === 'PendingApproval');
    }
    d = applySort(d, this.sort);
    this.filtered = d; this.currentPage = 1; this.updatePage();
  }

  updatePage() { this.paged = getPage(this.filtered, this.currentPage, this.pageSize); }
  onPageChanged(p: number) { this.currentPage = p; this.updatePage(); }
  onPageSizeChanged(s: number) { this.pageSize = s; this.currentPage = 1; this.updatePage(); }
  sortBy(col: string) { this.sort = toggleSort(this.sort, col); this.refresh(); }
  icon(col: string) { return sortIcon(this.sort, col); }
  edit(id: number) { this.router.navigate(['/admin/members/edit', id]); }
  details(id: number) { this.router.navigate(['/admin/members/details', id]); }

  approve(id: number) {
    if (!confirm('Approve this membership application?')) return;
    this.processingId = id;
    this.adminService.approveMember(id).subscribe({
      next: () => {
        this.toast.success('Member approved.');
        // FIX #1: update both isActive and membershipStatus so member leaves Pending tab immediately
        this.allItems = this.allItems.map(m =>
          m.memberId === id ? { ...m, isActive: true, membershipStatus: 'Approved' } : m
        );
        this.refresh();
        this.processingId = null;
        this.cdr.markForCheck();
      },
      error: () => {
        this.toast.error('Failed to approve member.');
        this.processingId = null;
        this.cdr.markForCheck();
      }
    });
  }

  reject(id: number) {
    if (!confirm('Reject this membership application?')) return;
    this.processingId = id;
    this.adminService.rejectMember(id).subscribe({
      next: () => {
        this.toast.success('Application rejected.');
        // FIX #2: update status instead of removing, so the record stays auditable and tab filter handles visibility
        this.allItems = this.allItems.map(m =>
          m.memberId === id ? { ...m, membershipStatus: 'Rejected', isActive: false } : m
        );
        this.refresh();
        this.processingId = null;
        this.cdr.markForCheck();
      },
      error: () => {
        this.toast.error('Failed to reject member.');
        this.processingId = null;
        this.cdr.markForCheck();
      }
    });
  }

  delete(id: number) {
    if (!confirm('Delete this member?')) return;
    this.adminService.deleteMember(id).subscribe({
      next: () => {
        this.toast.success('Deleted!');
        this.allItems = this.allItems.filter(i => i.memberId !== id);
        this.refresh();
        this.cdr.markForCheck();
      },
      error: () => { this.toast.error('Failed to delete.'); this.cdr.markForCheck(); }
    });
  }

  // FIX #5 & #6: block / unblock wired to new AdminService methods
  block(id: number) {
    const reason = prompt('Reason for blocking (optional):') ?? 'Blocked by admin';
    if (reason === null) return; // user cancelled prompt
    this.processingId = id;
    this.adminService.blockMember(id, reason).subscribe({
      next: () => {
        this.toast.success('Member blocked.');
        this.allItems = this.allItems.map(m =>
          m.memberId === id ? { ...m, isBlocked: true, blockReason: reason } : m
        );
        this.refresh();
        this.processingId = null;
        this.cdr.markForCheck();
      },
      error: () => {
        this.toast.error('Failed to block member.');
        this.processingId = null;
        this.cdr.markForCheck();
      }
    });
  }

  unblock(id: number) {
    if (!confirm('Unblock this member?')) return;
    this.processingId = id;
    this.adminService.unblockMember(id).subscribe({
      next: () => {
        this.toast.success('Member unblocked.');
        this.allItems = this.allItems.map(m =>
          m.memberId === id ? { ...m, isBlocked: false, blockReason: null } : m
        );
        this.refresh();
        this.processingId = null;
        this.cdr.markForCheck();
      },
      error: () => {
        this.toast.error('Failed to unblock member.');
        this.processingId = null;
        this.cdr.markForCheck();
      }
    });
  }
}