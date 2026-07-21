import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(model: { email: string; password: string }) {
    return this.http.post<any>(`${this.apiUrl}/Auth/login`, model).pipe(
      map(response => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('email', response.email || '');
          localStorage.setItem('roles', JSON.stringify(response.roles || []));
          localStorage.setItem('userId', response.userId?.toString() || '');
        }
        return response;
      })
    );
  }

  logout() {
    // Call API logout (best-effort, then always clear local storage)
    this.http.post(`${this.apiUrl}/Auth/logout`, {}).subscribe({ error: () => {} });
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('roles');
    localStorage.removeItem('userId');
  }

  getToken() { return localStorage.getItem('token'); }
  isLoggedIn() { return !!this.getToken(); }
  // FIXED: was 'username' key — now reads 'email' which is what login() actually stores
  getEmail() { return localStorage.getItem('email') || ''; }
  getUserId() { return parseInt(localStorage.getItem('userId') || '0', 10); }
  getRoles(): string[] {
    const r = localStorage.getItem('roles');
    return r ? JSON.parse(r) : [];
  }
  isAdmin(): boolean { return this.getRoles().includes('Admin'); }

  // ==================== PERMISSION SYSTEM ====================
  getTokenClaims(): Record<string, string | string[]> {
    const token = this.getToken();
    if (!token) return {};
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch { return {}; }
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  hasPermission(permission: string): boolean {
    const roles = this.getRoles();
    if (roles.includes('Admin')) return true;  // Admin has all permissions
    // Map permissions to roles here:
    const permissionMap: Record<string, string[]> = {
      'Book.View':          ['Admin', 'Librarian', 'Staff'],
      'Book.Create':        ['Admin', 'Librarian'],
      'Book.Edit':          ['Admin', 'Librarian'],
      'Book.Delete':        ['Admin'],
      'Circulation.View':   ['Admin', 'Librarian', 'Staff'],
      'Circulation.Return': ['Admin', 'Librarian'],
      'Member.View':        ['Admin', 'Librarian'],
      'Member.Create':      ['Admin'],
      'Member.Delete':      ['Admin'],
      'Procurement.View':   ['Admin', 'Librarian'],
      'Procurement.Approve':['Admin'],
    };
    const allowed = permissionMap[permission] || [];
    return roles.some(r => allowed.includes(r));
  }
}
