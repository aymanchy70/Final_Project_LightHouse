import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AccountService } from '../../../services/account';
import { ToastComponent } from '../toast/toast';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastComponent],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class LayoutComponent {

  sections: Record<string, boolean> = {
    location:     true,
    catalog:      true,
    members:      true,
    circulation:  true,
    acquisitions: true,
    inventory:    true,
    reports:      true,
    system:       true,
  };

  toggle(section: string) {
    this.sections[section] = !this.sections[section];
  }

  constructor(public accountService: AccountService, private router: Router) {}

  get userEmail(): string { return this.accountService.getEmail(); }

  logout() {
    this.accountService.logout();
    this.router.navigate(['/login']);
  }
}