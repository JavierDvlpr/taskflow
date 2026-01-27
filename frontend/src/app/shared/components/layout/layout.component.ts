import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Componente de layout principal con sidebar de navegación.
 * Muestra diferentes opciones según el rol del usuario.
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="layout">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed()">
        <!-- Logo -->
        <div class="sidebar-header">
          <div class="logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <span class="logo-text" *ngIf="!sidebarCollapsed()">TaskFlow Pro</span>
        </div>

        <!-- Badge de rol -->
        <div class="role-badge" *ngIf="!sidebarCollapsed()">
          <span [class]="'badge badge-' + currentUser()?.role?.toLowerCase()">
            {{ getRoleName() }}
          </span>
        </div>

        <!-- Navegación principal -->
        <nav class="sidebar-nav">
          <!-- Dashboard - Todos -->
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span *ngIf="!sidebarCollapsed()">Dashboard</span>
          </a>

          <!-- ========== OPCIONES SOLO ADMIN ========== -->
          <ng-container *ngIf="isAdmin()">
            <div class="nav-section" *ngIf="!sidebarCollapsed()">ADMINISTRACIÓN</div>
            
            <a routerLink="/admin/users" routerLinkActive="active" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                <path d="M16 3.13a4 4 0 010 7.75"/>
              </svg>
              <span *ngIf="!sidebarCollapsed()">Usuarios</span>
            </a>

            <a routerLink="/admin/departments" routerLinkActive="active" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
              <span *ngIf="!sidebarCollapsed()">Departamentos</span>
            </a>

            <a routerLink="/admin/tasks" routerLinkActive="active" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
              <span *ngIf="!sidebarCollapsed()">Gestión Tareas</span>
            </a>

            <a routerLink="/admin/reports" routerLinkActive="active" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              <span *ngIf="!sidebarCollapsed()">Reportes</span>
            </a>
          </ng-container>

          <!-- ========== OPCIONES SOLO EMPLOYEE ========== -->
          <ng-container *ngIf="isEmployee()">
            <div class="nav-section" *ngIf="!sidebarCollapsed()">MI TRABAJO</div>
            
            <a routerLink="/my-tasks" routerLinkActive="active" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
              <span *ngIf="!sidebarCollapsed()">Mis Tareas</span>
            </a>

            <a routerLink="/time-tracking" routerLinkActive="active" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
              <span *ngIf="!sidebarCollapsed()">Control de Tiempo</span>
            </a>

            <a routerLink="/my-history" routerLinkActive="active" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
                <path d="M16.24 7.76l-1.42 1.42"/>
              </svg>
              <span *ngIf="!sidebarCollapsed()">Mi Historial</span>
            </a>
          </ng-container>
        </nav>

        <!-- Usuario y configuración -->
        <div class="sidebar-footer">
          <!-- Info del usuario -->
          <div class="user-info" *ngIf="currentUser()">
            <div class="user-avatar" [class]="'avatar-' + currentUser()?.role?.toLowerCase()">
              {{ userInitials() }}
            </div>
            <div class="user-details" *ngIf="!sidebarCollapsed()">
              <span class="user-name">{{ currentUser()?.firstName }} {{ currentUser()?.lastName }}</span>
              <span class="user-email">{{ currentUser()?.email }}</span>
            </div>
          </div>

          <!-- Botón de logout -->
          <button class="nav-item logout-btn" (click)="logout()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span *ngIf="!sidebarCollapsed()">Cerrar Sesión</span>
          </button>
        </div>

        <!-- Toggle sidebar -->
        <button class="sidebar-toggle" (click)="toggleSidebar()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline [attr.points]="sidebarCollapsed() ? '9,18 15,12 9,6' : '15,18 9,12 15,6'"/>
          </svg>
        </button>
      </aside>

      <!-- Main content -->
      <main class="main-content" [class.collapsed]="sidebarCollapsed()">
        <ng-content></ng-content>
      </main>
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      min-height: 100vh;
      background: #f3f4f6;
    }

    .sidebar {
      width: 260px;
      background: linear-gradient(180deg, #1f2937 0%, #111827 100%);
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease;
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      z-index: 100;
    }

    .sidebar.collapsed {
      width: 80px;
    }

    .sidebar-header {
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logo {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .logo-text {
      font-size: 1.25rem;
      font-weight: 700;
      color: white;
      white-space: nowrap;
    }

    .role-badge {
      padding: 0.5rem 1.5rem;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .badge-admin {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
    }

    .badge-manager {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      color: white;
    }

    .badge-employee {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }

    .nav-section {
      padding: 1rem 1rem 0.5rem;
      font-size: 0.65rem;
      font-weight: 700;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0.75rem;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      color: #9ca3af;
      text-decoration: none;
      border-radius: 0.75rem;
      margin-bottom: 0.25rem;
      transition: all 0.2s ease;
      cursor: pointer;
      border: none;
      background: none;
      width: 100%;
      font-size: 0.875rem;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .nav-item.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .sidebar-footer {
      padding: 1rem 0.75rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      margin: 0.5rem 0;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 0.625rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 0.875rem;
      flex-shrink: 0;
    }

    .avatar-admin {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }

    .avatar-manager {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    }

    .avatar-employee {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    .user-details {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .user-name {
      color: white;
      font-weight: 500;
      font-size: 0.875rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-email {
      color: #9ca3af;
      font-size: 0.75rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .logout-btn {
      color: #f87171 !important;
    }

    .logout-btn:hover {
      background: rgba(239, 68, 68, 0.1) !important;
    }

    .sidebar-toggle {
      position: absolute;
      right: -12px;
      top: 50%;
      transform: translateY(-50%);
      width: 24px;
      height: 24px;
      background: #667eea;
      border: none;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
      transition: transform 0.2s ease;
    }

    .sidebar-toggle:hover {
      transform: translateY(-50%) scale(1.1);
    }

    .main-content {
      flex: 1;
      margin-left: 260px;
      transition: margin-left 0.3s ease;
      min-height: 100vh;
    }

    .main-content.collapsed {
      margin-left: 80px;
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 80px;
      }
      .sidebar-header {
        justify-content: center;
      }
      .logo-text, .user-details, .nav-item span, .nav-section, .role-badge {
        display: none !important;
      }
      .main-content {
        margin-left: 80px;
      }
      .sidebar-toggle {
        display: none;
      }
    }
  `]
})
export class LayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  sidebarCollapsed = signal(false);
  currentUser = this.authService.currentUser;

  userInitials = computed(() => {
    const user = this.currentUser();
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    return 'U';
  });

  isAdmin(): boolean {
    return this.currentUser()?.role === 'ADMIN';
  }

  isEmployee(): boolean {
    return this.currentUser()?.role === 'EMPLOYEE';
  }

  isManager(): boolean {
    return this.currentUser()?.role === 'MANAGER';
  }

  getRoleName(): string {
    const role = this.currentUser()?.role;
    switch (role) {
      case 'ADMIN': return 'Administrador';
      case 'MANAGER': return 'Gerente';
      case 'EMPLOYEE': return 'Empleado';
      default: return role || '';
    }
  }

  toggleSidebar() {
    this.sidebarCollapsed.update(v => !v);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
