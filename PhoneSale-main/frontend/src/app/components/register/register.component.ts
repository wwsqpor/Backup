import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  username = ''; email = ''; password = ''; password2 = '';
  error = ''; loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onRegister(): void {
    if (!this.username || !this.email || !this.password || !this.password2) { this.error = 'All fields are required.'; return; }
    if (this.password !== this.password2) { this.error = 'Passwords do not match.'; return; }
    this.loading = true; this.error = '';
    this.authService.register({ username: this.username, email: this.email, password: this.password, password2: this.password2 }).subscribe({
      next: () => this.router.navigate(['/phones']),
      error: err => {
        const errs = err.error;
        this.error = errs?.username?.[0] || errs?.email?.[0] || errs?.password?.[0] || errs?.non_field_errors?.[0] || 'Registration failed.';
        this.loading = false;
      }
    });
  }
}