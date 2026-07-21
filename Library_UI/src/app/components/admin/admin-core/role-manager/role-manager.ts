import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../../services/admin';
import { lastValueFrom } from 'rxjs';

export interface PermissionRow {
  resource: string;
  label: string;
  actions: string[];
}

@Component({
  selector: 'app-role-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './role-manager.html',
  styleUrl: './role-manager.css'
})
export class RoleManagerComponent implements OnInit {

  roles: any[] = [];
  users: any[] = [];
  newRoleName = '';

  permissionModalRole: string | null = null;
  currentPermissions: string[] = [];
  permissionsLoading = false;

  // True while a bulk operation (selectAll / deselectAll / toggleRow) is running.
  // Disables individual checkboxes during bulk to prevent race conditions.
  bulkRunning = false;

  // Per-key pending set for single-checkbox toggles
  pendingToggles = new Set<string>();

  readonly actionColumns = [
    'View', 'Create', 'Edit', 'Delete',
    'Approve', 'Reject', 'Return', 'Cancel',
    'Record', 'Shelve', 'Receive', 'Manage'
  ];

  readonly permissionMatrix: PermissionRow[] = [
    { resource: 'ItemCategory',   label: 'Item Categories',  actions: ['View', 'Create', 'Edit', 'Delete'] },
    { resource: 'SubCategory',    label: 'Sub Categories',   actions: ['View', 'Create', 'Edit', 'Delete'] },
    { resource: 'Author',         label: 'Authors',          actions: ['View', 'Create', 'Edit', 'Delete'] },
    { resource: 'Publisher',      label: 'Publishers',       actions: ['View', 'Create', 'Edit', 'Delete'] },
    { resource: 'Book',           label: 'Books',            actions: ['View', 'Create', 'Edit', 'Delete'] },
    { resource: 'BookEdition',    label: 'Book Editions',    actions: ['View', 'Create', 'Edit', 'Delete'] },
    { resource: 'MembershipType', label: 'Membership Types', actions: ['View', 'Create', 'Edit', 'Delete'] },
    { resource: 'FineRule',       label: 'Fine Rules',       actions: ['View', 'Create', 'Edit', 'Delete'] },
    { resource: 'Member',         label: 'Members',          actions: ['View', 'Create', 'Edit', 'Delete'] },
    { resource: 'Circulation',    label: 'Circulation',      actions: ['View', 'Approve', 'Reject', 'Return'] },
    { resource: 'Reservation',    label: 'Reservations',     actions: ['View', 'Create', 'Cancel'] },
    { resource: 'Payment',        label: 'Payments',         actions: ['View', 'Record'] },
    { resource: 'PhysicalCopy',   label: 'Physical Copies',  actions: ['View', 'Create', 'Edit', 'Delete', 'Shelve'] },
    { resource: 'Procurement',    label: 'Procurement',      actions: ['View', 'Approve', 'Receive'] },
    { resource: 'Dashboard',      label: 'Dashboard',        actions: ['View'] },
    { resource: 'Role',           label: 'Role Management',  actions: ['Manage'] },
  ];

  assignUserId: number | null = null;
  assignRoleName = '';
  listUserId: number | null = null;
  listedUserRoles: string[] = [];
  listedUserEmail = '';
  removeUserId: number | null = null;
  removeRoleName = '';
  msg: { text: string; type: 'success' | 'error' } | null = null;

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadRoles();
    this.loadUsers();
  }

  // ── Normalization ─────────────────────────────────────────────

  private normalizeRole(r: any): any {
    return {
      id:          r.id          ?? r.Id,
      name:        r.name        ?? r.Name        ?? '',
      permissions: this._normalizePermissions(r.permissions ?? r.Permissions ?? [])
    };
  }

  private _normalizePermissions(raw: string[]): string[] {
    if (!Array.isArray(raw)) return [];
    return raw.map(p => this._canonicalizePermKey(p)).filter(Boolean) as string[];
  }

  private _canonicalizePermKey(raw: string): string | null {
    if (!raw) return null;
    if (!raw.includes('.')) return raw;
    const [res, act] = raw.split('.');
    const matchedRow = this.permissionMatrix.find(
      r => r.resource.toLowerCase() === res.toLowerCase()
    );
    if (!matchedRow) return raw;
    const matchedAction = matchedRow.actions.find(
      a => a.toLowerCase() === act.toLowerCase()
    );
    if (!matchedAction) return raw;
    return this.permKey(matchedRow.resource, matchedAction);
  }

  private normalizeUser(u: any): any {
    return {
      id:    u.id    ?? u.Id,
      email: u.email ?? u.Email ?? '',
      roles: u.roles ?? u.Roles ?? []
    };
  }

  // ── Data loading ──────────────────────────────────────────────

  loadRoles() {
    this.adminService.getRoles().subscribe({
      next: (d) => {
        this.roles = d.map((r: any) => this.normalizeRole(r));
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: () => this.showMsg('Failed to load roles.', 'error')
    });
  }

  loadUsers() {
    this.adminService.getUsers().subscribe({
      next: (d) => {
        this.users = d.map((u: any) => this.normalizeUser(u));
        this.cdr.markForCheck();
      },
      error: () => {}
    });
  }

  createRole() {
    if (!this.newRoleName.trim()) return;
    this.adminService.createRole(this.newRoleName.trim()).subscribe({
      next: (res: any) => {
        this.showMsg(res.message || 'Role created!', 'success');
        this.newRoleName = '';
        this.loadRoles();
      },
      error: (err: any) => this.showMsg(err.error?.message || 'Failed to create role.', 'error')
    });
  }

  deleteRole(roleName: string) {
    if (!confirm(`Delete role "${roleName}"? This will remove it from all users.`)) return;
    this.adminService.deleteRole(roleName).subscribe({
      next: (res: any) => { this.showMsg(res.message || 'Deleted!', 'success'); this.loadRoles(); },
      error: (err: any) => this.showMsg(err.error?.message || 'Failed to delete.', 'error')
    });
  }

  // ── Permission Modal ──────────────────────────────────────────

  openPermissionModal(roleName: string) {
    setTimeout(() => {
      this.permissionModalRole = roleName;
      this.permissionsLoading = true;
      this.currentPermissions = [];
      this.pendingToggles.clear();
      this.bulkRunning = false;
      this.cdr.markForCheck();

      const cachedRole = this.roles.find(
        r => r.name?.toLowerCase() === roleName?.toLowerCase()
      );

      if (cachedRole) {
        this.currentPermissions = [...(cachedRole.permissions ?? [])];
        this.permissionsLoading = false;
        this.cdr.markForCheck();
      } else {
        this.adminService.getRoles().subscribe({
          next: (roles) => {
            const normalized = roles.map((r: any) => this.normalizeRole(r));
            const role = normalized.find(
              (r: any) => r.name?.toLowerCase() === roleName?.toLowerCase()
            );
            if (!role) {
              this.showMsg(`Role "${roleName}" not found.`, 'error');
              this.permissionsLoading = false;
              this.cdr.markForCheck();
              return;
            }
            this.currentPermissions = [...(role.permissions ?? [])];
            this.permissionsLoading = false;
            this.cdr.markForCheck();
          },
          error: (err: any) => {
            this.permissionsLoading = false;
            this.showMsg(`Could not load permissions (HTTP ${err?.status ?? '?'}).`, 'error');
            this.cdr.markForCheck();
          }
        });
      }
    }, 0);
  }

  closePermissionModal() {
    this.permissionModalRole = null;
    this.currentPermissions = [];
    this.pendingToggles.clear();
    this.bulkRunning = false;
    this.cdr.markForCheck();
    this.loadRoles();
  }

  permKey(resource: string, action: string): string {
    return `${resource}.${action}`;
  }

  actionApplies(row: PermissionRow, action: string): boolean {
    return row.actions.includes(action);
  }

  hasPermission(resource: string, action: string): boolean {
    return this.currentPermissions.includes(this.permKey(resource, action));
  }

  isKeyPending(key: string): boolean {
    return this.pendingToggles.has(key);
  }

  // ── Row select-all ────────────────────────────────────────────

  isRowFullyChecked(row: PermissionRow): boolean {
    return row.actions.every(a => this.hasPermission(row.resource, a));
  }

  isRowIndeterminate(row: PermissionRow): boolean {
    const n = row.actions.filter(a => this.hasPermission(row.resource, a)).length;
    return n > 0 && n < row.actions.length;
  }

  // ── Core sequential bulk helper ───────────────────────────────
  //
  // ROOT CAUSE OF ALL 400 ConcurrencyFailure ERRORS:
  // EF Core uses a concurrency token on the role's security stamp. When 55
  // parallel POST/DELETE requests all hit the DB at the same moment, the first
  // write updates the stamp; every other request was reading the OLD stamp and
  // now fails with "Optimistic concurrency failure, object has been modified."
  //
  // THE ONLY FIX: fire API calls one at a time (sequential), waiting for each
  // response before sending the next. This is what _runSequential() does.
  // It also updates the UI after EACH call so the user sees live progress.
  //
  private async _runSequential(
    roleName: string,
    keys: string[],
    adding: boolean
  ): Promise<void> {
    this.bulkRunning = true;
    this.cdr.markForCheck();

    for (const key of keys) {
      if (!this.permissionModalRole) break; // modal was closed mid-run

      try {
        const api$ = adding
          ? this.adminService.addPermission(roleName, key)
          : this.adminService.removePermission(roleName, key);

        await lastValueFrom(api$);

        // Update UI live after each successful call
        if (adding && !this.currentPermissions.includes(key)) {
          this.currentPermissions = [...this.currentPermissions, key];
        } else if (!adding) {
          this.currentPermissions = this.currentPermissions.filter(x => x !== key);
        }
        this._syncCachedRolePermissions(roleName, this.currentPermissions);
        this.cdr.markForCheck();

      } catch (err: any) {
        // "Already exists" (400 + code contains DuplicateRoleName or similar)
        // — treat as success so the checkbox stays checked
        const isConcurrency = err?.error?.[0]?.code === 'ConcurrencyFailure'
          || err?.error?.code === 'ConcurrencyFailure'
          || JSON.stringify(err?.error ?? '').includes('ConcurrencyFailure');

        const isDuplicate = adding && err?.status === 400 && !isConcurrency;

        if (isDuplicate) {
          // Permission already in DB — optimistic state is correct, continue
          if (!this.currentPermissions.includes(key)) {
            this.currentPermissions = [...this.currentPermissions, key];
          }
          this._syncCachedRolePermissions(roleName, this.currentPermissions);
          this.cdr.markForCheck();
          continue;
        }

        if (isConcurrency) {
          // ConcurrencyFailure despite sequential calls — wait 200ms and retry once
          await this._delay(200);
          try {
            const retry$ = adding
              ? this.adminService.addPermission(roleName, key)
              : this.adminService.removePermission(roleName, key);
            await lastValueFrom(retry$);

            if (adding && !this.currentPermissions.includes(key)) {
              this.currentPermissions = [...this.currentPermissions, key];
            } else if (!adding) {
              this.currentPermissions = this.currentPermissions.filter(x => x !== key);
            }
            this._syncCachedRolePermissions(roleName, this.currentPermissions);
            this.cdr.markForCheck();
          } catch {
            // Retry also failed — roll back this key and show error
            if (adding) {
              this.currentPermissions = this.currentPermissions.filter(x => x !== key);
            } else {
              this.currentPermissions = [...this.currentPermissions, key];
            }
            this._syncCachedRolePermissions(roleName, this.currentPermissions);
            this.showMsg(`Failed to ${adding ? 'grant' : 'revoke'} "${key}". Please try again.`, 'error');
            this.cdr.markForCheck();
          }
          continue;
        }

        // Any other error — roll back and report
        if (adding) {
          this.currentPermissions = this.currentPermissions.filter(x => x !== key);
        } else {
          this.currentPermissions = [...this.currentPermissions, key];
        }
        this._syncCachedRolePermissions(roleName, this.currentPermissions);
        this.showMsg(err?.error?.message || `Failed to update "${key}".`, 'error');
        this.cdr.markForCheck();
      }
    }

    this.bulkRunning = false;
    this.cdr.markForCheck();
  }

  private _delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ── Row toggle (Grant All per row) ────────────────────────────

  async toggleRow(row: PermissionRow) {
    if (!this.permissionModalRole || this.bulkRunning) return;
    const shouldCheck = !this.isRowFullyChecked(row);

    // Snapshot before mutation
    const keysToChange = row.actions
      .filter(a => shouldCheck !== this.hasPermission(row.resource, a))
      .map(a => this.permKey(row.resource, a));

    if (keysToChange.length === 0) return;

    // Optimistic UI update immediately so user sees the intent
    if (shouldCheck) {
      this.currentPermissions = [
        ...this.currentPermissions,
        ...keysToChange.filter(k => !this.currentPermissions.includes(k))
      ];
    } else {
      this.currentPermissions = this.currentPermissions.filter(k => !keysToChange.includes(k));
    }
    this._syncCachedRolePermissions(this.permissionModalRole, this.currentPermissions);
    this.cdr.markForCheck();

    // Sequential API calls — no concurrency
    await this._runSequential(this.permissionModalRole, keysToChange, shouldCheck);
  }

  // ── Global select-all ─────────────────────────────────────────

  get allPermissionKeys(): string[] {
    return this.permissionMatrix.flatMap(row =>
      row.actions.map(a => this.permKey(row.resource, a))
    );
  }

  get isAllSelected(): boolean {
    return this.allPermissionKeys.every(k => this.currentPermissions.includes(k));
  }

  async selectAll() {
    if (!this.permissionModalRole || this.bulkRunning) return;

    const keysToAdd = this.allPermissionKeys.filter(
      k => !this.currentPermissions.includes(k)
    );
    if (keysToAdd.length === 0) return;

    // Optimistic: show all checked immediately
    this.currentPermissions = [...this.currentPermissions, ...keysToAdd];
    this._syncCachedRolePermissions(this.permissionModalRole, this.currentPermissions);
    this.cdr.markForCheck();

    // Sequential: one call at a time
    await this._runSequential(this.permissionModalRole, keysToAdd, true);
  }

  async deselectAll() {
    if (!this.permissionModalRole || this.bulkRunning) return;

    const keysToRemove = [...this.currentPermissions];
    if (keysToRemove.length === 0) return;

    // Optimistic: show all unchecked immediately
    this.currentPermissions = [];
    this._syncCachedRolePermissions(this.permissionModalRole, this.currentPermissions);
    this.cdr.markForCheck();

    // Sequential: one call at a time
    await this._runSequential(this.permissionModalRole, keysToRemove, false);
  }

  // ── Single checkbox toggle ────────────────────────────────────

  toggleMatrixPermission(row: PermissionRow, action: string) {
    if (!this.permissionModalRole || !this.actionApplies(row, action) || this.bulkRunning) return;
    this.togglePermission(this.permKey(row.resource, action));
  }

  togglePermission(key: string) {
    if (!this.permissionModalRole || this.pendingToggles.has(key) || this.bulkRunning) return;

    const roleName = this.permissionModalRole;
    const wasChecked = this.currentPermissions.includes(key);

    // Optimistic update
    this.currentPermissions = wasChecked
      ? this.currentPermissions.filter(x => x !== key)
      : [...this.currentPermissions, key];

    this._syncCachedRolePermissions(roleName, this.currentPermissions);
    this.pendingToggles.add(key);
    this.cdr.markForCheck();

    const api$ = wasChecked
      ? this.adminService.removePermission(roleName, key)
      : this.adminService.addPermission(roleName, key);

    api$.subscribe({
      next: () => { this.pendingToggles.delete(key); this.cdr.markForCheck(); },
      error: (err: any) => {
        // "Already exists" on add — not a real error, keep optimistic state
        const isConcurrency = JSON.stringify(err?.error ?? '').includes('ConcurrencyFailure');
        if (!wasChecked && err?.status === 400 && !isConcurrency) {
          this.pendingToggles.delete(key);
          this.cdr.markForCheck();
          return;
        }
        // Real error or concurrency — roll back
        this.currentPermissions = wasChecked
          ? [...this.currentPermissions, key]
          : this.currentPermissions.filter(x => x !== key);
        this._syncCachedRolePermissions(roleName, this.currentPermissions);
        this.pendingToggles.delete(key);
        this.showMsg(err?.error?.message || 'Failed to update permission. Please try again.', 'error');
        this.cdr.markForCheck();
      }
    });
  }

  private _syncCachedRolePermissions(roleName: string, perms: string[]) {
    const idx = this.roles.findIndex(
      r => r.name?.toLowerCase() === roleName?.toLowerCase()
    );
    if (idx !== -1) {
      this.roles[idx] = { ...this.roles[idx], permissions: [...perms] };
    }
  }

  // ── User-Role Assignment ──────────────────────────────────────

  assignRole() {
    if (!this.assignUserId || !this.assignRoleName) {
      this.showMsg('Select both user and role.', 'error'); return;
    }
    this.adminService.assignRoleToUser(this.assignUserId, this.assignRoleName).subscribe({
      next: (res: any) => {
        this.showMsg(res.message || 'Role assigned!', 'success');
        this.assignUserId = null;
        this.assignRoleName = '';
        this.loadUsers();
      },
      error: (err: any) => this.showMsg(err.error?.message || 'Failed to assign.', 'error')
    });
  }

  listUserRoles() {
    if (!this.listUserId) { this.showMsg('Select a user.', 'error'); return; }
    const user = this.users.find(u => u.id === this.listUserId);
    if (!user) { this.showMsg('User not found.', 'error'); return; }
    this.listedUserRoles = user.roles || [];
    this.listedUserEmail = user.email || '';
  }

  removeRoleFromUser() {
    if (!this.removeUserId || !this.removeRoleName) {
      this.showMsg('Select both user and role.', 'error'); return;
    }
    this.adminService.removeRoleFromUser(this.removeUserId, this.removeRoleName).subscribe({
      next: (res: any) => {
        this.showMsg(res.message || 'Role removed!', 'success');
        this.removeUserId = null;
        this.removeRoleName = '';
        this.listedUserRoles = [];
        this.loadUsers();
      },
      error: (err: any) => this.showMsg(err.error?.message || 'Failed to remove.', 'error')
    });
  }

  showMsg(text: string, type: 'success' | 'error') {
    this.msg = { text, type };
    setTimeout(() => { this.msg = null; this.cdr.markForCheck(); }, 4000);
  }

  isAdminRole(roleName: string): boolean {
    return roleName?.toLowerCase() === 'admin';
  }

  permissionCount(role: any): number {
    const p = role?.permissions;
    return Array.isArray(p) ? p.length : 0;
  }
}