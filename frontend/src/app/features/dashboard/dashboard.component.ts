import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/**
 * Componente Dashboard - Redirige al dashboard según el rol del usuario.
 * ADMIN -> /admin/dashboard
 * EMPLOYEE -> /employee/dashboard
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="redirect-container">
      <div class="spinner"></div>
      <p>Cargando tu espacio de trabajo...</p>
    </div>
  `,
  styles: [`
    .redirect-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      gap: 1rem;
      background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
    }
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #e5e7eb;
      border-top-color: #10b981;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    p { 
      color: #6b7280; 
      font-size: 1rem;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private auth = inject(AuthService);

  ngOnInit() {
    this.redirectBasedOnRole();
  }

  private redirectBasedOnRole() {
    const user = this.auth.currentUser();
    
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    // Redirigir según el rol
    if (user.role === 'ADMIN') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      // EMPLOYEE u otros roles
      this.router.navigate(['/employee/dashboard']);
    }
  }
}
