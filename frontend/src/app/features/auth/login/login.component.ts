import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <form (ngSubmit)="onLogin()" #loginForm="ngForm">
        <h2>TaskFlow Pro - Login</h2>
        <div class="form-group">
          <label>Email</label>
          <input type="email" [(ngModel)]="credentials.email" name="email" required>
        </div>
        <div class="form-group">
          <label>Contraseña</label>
          <input type="password" [(ngModel)]="credentials.password" name="password" required>
        </div>
        <button type="submit" [disabled]="!loginForm.form.valid">Iniciar Sesión</button>
        <p *ngIf="errorMessage" class="error">{{ errorMessage }}</p>
      </form>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f4f7f6;
    }
    form {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }
    .form-group { margin-bottom: 1rem; }
    input { width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; }
    button { width: 100%; padding: 0.75rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
    button:disabled { background: #ccc; }
    .error { color: red; margin-top: 1rem; text-align: center; }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials = { email: '', password: '' };
  errorMessage = '';

  onLogin() {
    this.authService.login(this.credentials).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => this.errorMessage = 'Credenciales incorrectas'
    });
  }
}
