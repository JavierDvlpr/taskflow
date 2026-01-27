import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { LayoutComponent } from '../../../shared/components/layout/layout.component';

interface DashboardStats {
  totalUsers: number;
  totalDepartments: number;
  totalTasks: number;
  totalHoursLogged: number;
}

/**
 * Dashboard para Administrador.
 * Muestra estadísticas globales: usuarios, departamentos, tareas, horas totales.
 */
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LayoutComponent],
  template: `
    <app-layout>
    <div class="dashboard">
      <!-- Header -->
      <header class="dashboard-header">
        <div>
          <h1>Panel de Administración</h1>
          <p>Vista general del sistema TaskFlow Pro</p>
        </div>
      </header>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <!-- Total Usuarios -->
        <div class="stat-card users">
          <div class="stat-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats().totalUsers }}</span>
            <span class="stat-label">Total Usuarios</span>
          </div>
        </div>

        <!-- Total Departamentos -->
        <div class="stat-card departments">
          <div class="stat-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats().totalDepartments }}</span>
            <span class="stat-label">Departamentos</span>
          </div>
        </div>

        <!-- Total Tareas -->
        <div class="stat-card tasks">
          <div class="stat-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats().totalTasks }}</span>
            <span class="stat-label">Total Tareas</span>
          </div>
        </div>

        <!-- Horas Totales -->
        <div class="stat-card hours">
          <div class="stat-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ formatHours(stats().totalHoursLogged) }}</span>
            <span class="stat-label">Horas Registradas</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <section class="quick-actions">
        <h2>Acciones Rápidas</h2>
        <div class="actions-grid">
          <a routerLink="/admin/users" class="action-card">
            <div class="action-icon users">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
            </div>
            <span>Crear Usuario</span>
          </a>
          <a routerLink="/admin/departments" class="action-card">
            <div class="action-icon departments">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <line x1="12" y1="22" x2="12" y2="12"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
            </div>
            <span>Crear Departamento</span>
          </a>
          <a routerLink="/admin/tasks" class="action-card">
            <div class="action-icon tasks">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
            </div>
            <span>Crear Tarea</span>
          </a>
          <a routerLink="/admin/reports" class="action-card">
            <div class="action-icon reports">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </div>
            <span>Exportar Reportes</span>
          </a>
        </div>
      </section>

      <!-- Info Panel -->
      <section class="info-panel">
        <div class="info-card">
          <h3>🔒 Rol: Administrador</h3>
          <p>Como administrador, tienes acceso completo para gestionar:</p>
          <ul>
            <li>✅ Usuarios (crear, editar, activar/desactivar)</li>
            <li>✅ Departamentos (crear, editar, asignar)</li>
            <li>✅ Tareas (ver todas, filtrar, supervisar)</li>
            <li>✅ Reportes (ver estadísticas, exportar CSV)</li>
          </ul>
          <p class="note">
            <strong>Nota:</strong> Los administradores no ejecutan tareas ni registran tiempo. 
            Eso es responsabilidad de los empleados.
          </p>
        </div>
      </section>
    </div>
    </app-layout>
  `,
  styles: [`
    .dashboard {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header {
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      font-size: 1.875rem;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }

    .dashboard-header p {
      color: #6b7280;
      margin: 0.25rem 0 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .stat-card.users .stat-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .stat-card.departments .stat-icon {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }

    .stat-card.tasks .stat-icon {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    .stat-card.hours .stat-icon {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.875rem;
      font-weight: 700;
      color: #111827;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .quick-actions {
      margin-bottom: 2rem;
    }

    .quick-actions h2 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
      margin-bottom: 1rem;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
    }

    .action-card {
      background: white;
      border-radius: 0.75rem;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: #374151;
      font-weight: 500;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: all 0.2s;
      border: 2px solid transparent;
    }

    .action-card:hover {
      border-color: #667eea;
      transform: translateY(-2px);
    }

    .action-icon {
      width: 48px;
      height: 48px;
      border-radius: 0.625rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .action-icon.users {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .action-icon.departments {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }

    .action-icon.tasks {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    .action-icon.reports {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    }

    .info-panel {
      margin-top: 2rem;
    }

    .info-card {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-radius: 1rem;
      padding: 1.5rem;
      border-left: 4px solid #f59e0b;
    }

    .info-card h3 {
      margin: 0 0 0.75rem;
      color: #92400e;
    }

    .info-card p {
      color: #78350f;
      margin: 0 0 0.75rem;
    }

    .info-card ul {
      margin: 0 0 1rem;
      padding-left: 1.25rem;
      color: #78350f;
    }

    .info-card li {
      margin-bottom: 0.25rem;
    }

    .info-card .note {
      font-size: 0.875rem;
      background: rgba(255, 255, 255, 0.5);
      padding: 0.75rem;
      border-radius: 0.5rem;
      margin: 0;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  
  stats = signal<DashboardStats>({
    totalUsers: 0,
    totalDepartments: 0,
    totalTasks: 0,
    totalHoursLogged: 0
  });

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    // Cargar estadísticas combinando múltiples endpoints
    const stats: DashboardStats = {
      totalUsers: 0,
      totalDepartments: 0,
      totalTasks: 0,
      totalHoursLogged: 0
    };

    // Cargar usuarios
    this.http.get<any[]>(`${environment.apiUrl}/users`).subscribe({
      next: (users) => {
        stats.totalUsers = users.length;
        this.stats.set({ ...stats });
      },
      error: (err) => console.error('Error cargando usuarios:', err)
    });

    // Cargar departamentos
    this.http.get<any[]>(`${environment.apiUrl}/departments`).subscribe({
      next: (depts) => {
        stats.totalDepartments = depts.length;
        this.stats.set({ ...stats });
      },
      error: (err) => console.error('Error cargando departamentos:', err)
    });

    // Cargar tareas con estadísticas
    this.http.get<any>(`${environment.apiUrl}/tasks/stats`).subscribe({
      next: (taskStats) => {
        stats.totalTasks = taskStats.total || 0;
        stats.totalHoursLogged = taskStats.totalHours || 0;
        this.stats.set({ ...stats });
      },
      error: () => {
        // Fallback: contar tareas directamente
        this.http.get<any[]>(`${environment.apiUrl}/tasks`).subscribe({
          next: (tasks) => {
            stats.totalTasks = tasks.length;
            stats.totalHoursLogged = tasks.reduce((sum, t) => sum + (t.totalTimeLogged || 0), 0);
            this.stats.set({ ...stats });
          },
          error: (err) => console.error('Error cargando tareas:', err)
        });
      }
    });
  }

  formatHours(hours: number): string {
    return hours.toFixed(1) + 'h';
  }
}
