import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Componente de inicio de sesión con diseño moderno.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card animate-fade-in">
        <!-- Logo y título -->
        <div class="auth-header">
          <div class="logo">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
          </div>
          <h1>TaskFlow Pro</h1>
          <p>Gestión inteligente de tareas y tiempo</p>
        </div>

        <!-- Formulario de login -->
        <form (ngSubmit)="onLogin()" #loginForm="ngForm" class="auth-form">
          <div class="form-group">
            <label class="form-label">Correo electrónico</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input 
                type="email" 
                class="form-input with-icon"
                [(ngModel)]="credentials.email" 
                name="email" 
                placeholder="tu@email.com"
                required
                email>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Contraseña</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <input 
                [type]="showPassword ? 'text' : 'password'" 
                class="form-input with-icon"
                [(ngModel)]="credentials.password" 
                name="password" 
                placeholder="••••••••"
                required
                minlength="6">
              <button type="button" class="toggle-password" (click)="showPassword = !showPassword">
                <svg *ngIf="!showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg *ngIf="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Mensaje de error -->
          <div *ngIf="errorMessage" class="error-message animate-fade-in">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Botón de login -->
          <button 
            type="submit" 
            class="btn btn-primary btn-block"
            [disabled]="!loginForm.form.valid || isLoading">
            <span *ngIf="!isLoading">Iniciar Sesión</span>
            <span *ngIf="isLoading" class="loading-spinner"></span>
          </button>
        </form>

        <!-- Info para obtener acceso -->
        <div class="auth-footer">
          <p class="access-info">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            Contacta al administrador para obtener tus credenciales
          </p>
        </div>
      </div>

      <!-- Decoración de fondo -->
      <div class="auth-decoration">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      position: relative;
      overflow: hidden;
    }

    .auth-card {
      background: white;
      border-radius: 1.5rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      padding: 2.5rem;
      width: 100%;
      max-width: 420px;
      position: relative;
      z-index: 10;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border-radius: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      color: white;
    }

    .auth-header h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }

    .auth-header p {
      color: #6b7280;
      font-size: 0.875rem;
    }

    .auth-form {
      margin-bottom: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    .input-wrapper {
      position: relative;
    }

    .input-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #9ca3af;
    }

    .form-input {
      width: 100%;
      padding: 0.875rem 1rem;
      font-size: 0.875rem;
      border: 2px solid #e5e7eb;
      border-radius: 0.75rem;
      background: #f9fafb;
      transition: all 0.2s ease;
      outline: none;
    }

    .form-input.with-icon {
      padding-left: 2.75rem;
      padding-right: 2.75rem;
    }

    .form-input:focus {
      border-color: #6366f1;
      background: white;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .toggle-password {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: #9ca3af;
      padding: 0;
    }

    .toggle-password:hover {
      color: #6366f1;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 1rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 0.75rem;
      color: #dc2626;
      font-size: 0.875rem;
      margin-bottom: 1.25rem;
    }

    .btn-block {
      width: 100%;
      padding: 1rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 0.75rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .loading-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .auth-footer {
      text-align: center;
      padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }

    .auth-footer p {
      color: #6b7280;
      font-size: 0.875rem;
    }

    .auth-footer .access-info {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      color: #6b7280;
      font-size: 0.8rem;
      background: #f3f4f6;
      padding: 0.75rem 1rem;
      border-radius: 8px;
    }

    .auth-footer .access-info svg {
      color: #9ca3af;
      flex-shrink: 0;
    }

    /* Decoración de fondo */
    .auth-decoration {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
    }

    .circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
    }

    .circle-1 {
      width: 400px;
      height: 400px;
      top: -200px;
      right: -100px;
    }

    .circle-2 {
      width: 300px;
      height: 300px;
      bottom: -150px;
      left: -100px;
    }

    .circle-3 {
      width: 200px;
      height: 200px;
      top: 50%;
      left: 10%;
    }

    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials = { email: '', password: '' };
  errorMessage = '';
  isLoading = false;
  showPassword = false;

  onLogin() {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
      }
    });
  }
}
