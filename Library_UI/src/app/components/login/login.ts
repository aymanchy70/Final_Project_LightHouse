import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '../../services/account';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  loading = false;

  constructor(private accountService: AccountService, private router: Router) {}

  login() {
    this.errorMessage = '';
    this.loading = true;
    this.accountService.login({ email: this.email, password: this.password }).subscribe({
      next: () => { this.router.navigate(['/admin/dashboard']); },
      error: (err) => {
        this.errorMessage = err.error?.message || err.error || 'Login failed. Check credentials.';
        this.loading = false;
      }
    });
  }
}