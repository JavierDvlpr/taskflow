import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { LayoutComponent } from '../../../shared/components/layout/layout.component';

interface MyTask {
  id: number;
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  timeLogged: number;
  isActive: boolean;
}

interface DashboardStats {
  totalAssigned: number;
  pending: number;
  inProgress: number;
  completed: number;
  totalHoursToday: number;
  totalHoursWeek: number;
  activeTask: MyTask | null;
}

/**
 * Dashboard del Empleado.
 * Muestra: tareas asignadas, estado, tiempo acumulado, indicador de tarea activa.
 */
@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LayoutComponent],
  template: `
    <app-layout>
    <div class="dashboard">
      <!-- Welcome Header -->
      <header class="welcome-header">
        <div class="welcome-text">
          <h1>¡Hola, {{ userName() }}! </h1>
          <p>{{ getGreeting() }}</p>
        </div>
        <div class="date-display">
          <span class="day">{{ today | date:'EEEE' }}</span>
          <span class="date">{{ today | date:'d MMMM yyyy' }}</span>
        </div>
      </header>

      <!-- Active Task Alert -->
      <div class="active-task-banner" *ngIf="stats().activeTask">
        <div class="pulse-indicator"></div>
        <div class="active-info">
          <span class="active-label">Tarea en progreso:</span>
          <span class="active-title">{{ stats().activeTask!.title }}</span>
        </div>
        <a routerLink="/time-tracking" class="btn-continue">
          Continuar trabajando
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12,5 19,12 12,19"/>
          </svg>
        </a>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card assigned">
          <div class="stat-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-number">{{ stats().totalAssigned }}</span>
            <span class="stat-label">Tareas Asignadas</span>
          </div>
        </div>

        <div class="stat-card pending">
          <div class="stat-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-number">{{ stats().pending }}</span>
            <span class="stat-label">Pendientes</span>
          </div>
        </div>

        <div class="stat-card in-progress">
          <div class="stat-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v4"/>
              <path d="M12 18v4"/>
              <path d="M4.93 4.93l2.83 2.83"/>
              <path d="M16.24 16.24l2.83 2.83"/>
              <path d="M2 12h4"/>
              <path d="M18 12h4"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-number">{{ stats().inProgress }}</span>
            <span class="stat-label">En Progreso</span>
          </div>
        </div>

        <div class="stat-card completed">
          <div class="stat-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-number">{{ stats().completed }}</span>
            <span class="stat-label">Completadas</span>
          </div>
        </div>
      </div>

      <!-- Time Summary -->
      <div class="time-section">
        <h2>Tu Tiempo</h2>
        <div class="time-cards">
          <div class="time-card today">
            <div class="time-visual">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
            <div class="time-info">
              <span class="time-value">{{ formatTime(stats().totalHoursToday) }}</span>
              <span class="time-label">Horas Hoy</span>
            </div>
          </div>
          <div class="time-card week">
            <div class="time-visual">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div class="time-info">
              <span class="time-value">{{ formatTime(stats().totalHoursWeek) }}</span>
              <span class="time-label">Esta Semana</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Tasks -->
      <div class="tasks-section">
        <div class="section-header">
          <h2>Mis Tareas Recientes</h2>
          <a routerLink="/my-tasks" class="link-all">Ver todas →</a>
        </div>
        <div class="tasks-list">
          <div class="task-item" *ngFor="let task of recentTasks()" [class.active]="task.isActive">
            <div class="task-status-indicator" [class]="'status-' + task.status.toLowerCase().replace('_', '-')"></div>
            <div class="task-info">
              <span class="task-title">{{ task.title }}</span>
              <span class="task-meta">
                <span class="priority-dot" [class]="'priority-' + task.priority.toLowerCase()"></span>
                {{ getPriorityName(task.priority) }} • {{ formatTime(task.timeLogged) }} registradas
              </span>
            </div>
            <span class="status-badge" [class]="'badge-' + task.status.toLowerCase().replace('_', '-')">
              {{ getStatusName(task.status) }}
            </span>
          </div>
          <div class="empty-tasks" *ngIf="recentTasks().length === 0">
            <p>No tienes tareas asignadas aún</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>Acciones Rápidas</h2>
        <div class="actions-grid">
          <a routerLink="/time-tracking" class="action-card">
            <div class="action-icon time">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
            <span>Registrar Tiempo</span>
          </a>
          <a routerLink="/my-tasks" class="action-card">
            <div class="action-icon tasks">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
            </div>
            <span>Ver Mis Tareas</span>
          </a>
          <a routerLink="/my-history" class="action-card">
            <div class="action-icon history">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 3v5h5"/>
                <path d="M3.05 13A9 9 0 106 5.3L3 8"/>
                <path d="M12 7v5l4 2"/>
              </svg>
            </div>
            <span>Mi Historial</span>
          </a>
        </div>
      </div>
    </div>
    </app-layout>
  `,
  styles: [`
    .dashboard {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .welcome-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }

    .welcome-text h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: #111827;
      margin: 0 0 0.25rem;
    }

    .welcome-text p {
      color: #6b7280;
      margin: 0;
    }

    .date-display {
      text-align: right;
    }

    .date-display .day {
      display: block;
      font-size: 0.875rem;
      color: #6b7280;
      text-transform: capitalize;
    }

    .date-display .date {
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
    }

    /* Active Task Banner */
    .active-task-banner {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .pulse-indicator {
      width: 12px;
      height: 12px;
      background: white;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.1); }
    }

    .active-info {
      flex: 1;
    }

    .active-label {
      font-size: 0.75rem;
      opacity: 0.9;
      display: block;
    }

    .active-title {
      font-weight: 600;
      font-size: 1.125rem;
    }

    .btn-continue {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255,255,255,0.2);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      text-decoration: none;
      font-weight: 500;
      transition: background 0.2s;
    }

    .btn-continue:hover {
      background: rgba(255,255,255,0.3);
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border-left: 4px solid;
    }

    .stat-card.assigned { border-color: #6366f1; }
    .stat-card.pending { border-color: #f59e0b; }
    .stat-card.in-progress { border-color: #3b82f6; }
    .stat-card.completed { border-color: #10b981; }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-card.assigned .stat-icon { background: #eef2ff; color: #6366f1; }
    .stat-card.pending .stat-icon { background: #fef3c7; color: #f59e0b; }
    .stat-card.in-progress .stat-icon { background: #dbeafe; color: #3b82f6; }
    .stat-card.completed .stat-icon { background: #d1fae5; color: #10b981; }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: #111827;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #6b7280;
    }

    /* Time Section */
    .time-section h2,
    .tasks-section h2,
    .quick-actions h2 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
      margin: 0 0 1rem;
    }

    .time-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .time-card {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .time-card.today .time-visual { color: #8b5cf6; }
    .time-card.week .time-visual { color: #0ea5e9; }

    .time-info {
      display: flex;
      flex-direction: column;
    }

    .time-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
    }

    .time-label {
      font-size: 0.875rem;
      color: #6b7280;
    }

    /* Tasks Section */
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .section-header h2 { margin: 0; }

    .link-all {
      color: #10b981;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.875rem;
    }

    .link-all:hover { text-decoration: underline; }

    .tasks-list {
      background: white;
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .task-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .task-item:last-child { border-bottom: none; }

    .task-item.active {
      background: linear-gradient(90deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%);
    }

    .task-status-indicator {
      width: 4px;
      height: 40px;
      border-radius: 2px;
    }

    .task-status-indicator.status-pending { background: #f59e0b; }
    .task-status-indicator.status-in-progress { background: #3b82f6; }
    .task-status-indicator.status-completed { background: #10b981; }

    .task-info {
      flex: 1;
    }

    .task-title {
      display: block;
      font-weight: 500;
      color: #111827;
    }

    .task-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      color: #6b7280;
    }

    .priority-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .priority-dot.priority-low { background: #9ca3af; }
    .priority-dot.priority-medium { background: #f59e0b; }
    .priority-dot.priority-high { background: #ef4444; }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .badge-pending { background: #fef3c7; color: #92400e; }
    .badge-in-progress { background: #dbeafe; color: #1e40af; }
    .badge-completed { background: #d1fae5; color: #065f46; }

    .empty-tasks {
      padding: 2rem;
      text-align: center;
      color: #9ca3af;
    }

    /* Quick Actions */
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .action-card {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: #374151;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: all 0.2s;
    }

    .action-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .action-icon {
      width: 48px;
      height: 48px;
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .action-icon.time { background: #ede9fe; color: #7c3aed; }
    .action-icon.tasks { background: #d1fae5; color: #059669; }
    .action-icon.history { background: #dbeafe; color: #2563eb; }

    .action-card span {
      font-weight: 500;
      font-size: 0.875rem;
    }
  `]
})
export class EmployeeDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  
  today = new Date();
  
  stats = signal<DashboardStats>({
    totalAssigned: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    totalHoursToday: 0,
    totalHoursWeek: 0,
    activeTask: null
  });
  
  recentTasks = signal<MyTask[]>([]);
  
  userName = computed(() => {
    const user = this.auth.currentUser();
    return user ? user.firstName : 'Usuario';
  });

  ngOnInit() {
    this.checkBackendActiveSession();
    this.loadDashboard();
  }
  /**
   * Consulta al backend si hay una tarea activa o pausada y actualiza el banner
   */
  checkBackendActiveSession() {
    this.http.get<any>(`${environment.apiUrl}/time-logs/active`).subscribe({
      next: (data) => {
        if (data.active && data.timeLog && data.timeLog.task) {
          const t = data.timeLog.task;
          this.stats.set({
            ...this.stats(),
            activeTask: {
              id: t.id,
              title: t.title,
              status: t.status,
              priority: t.priority,
              timeLogged: (t.totalTimeLogged || 0) / 60,
              isActive: t.status === 'IN_PROGRESS'
            }
          });
        } else {
          this.stats.set({ ...this.stats(), activeTask: null });
        }
      },
      error: () => {
        this.stats.set({ ...this.stats(), activeTask: null });
      }
    });
  }

  loadDashboard() {
    // Cargar mis tareas
    this.http.get<any[]>(`${environment.apiUrl}/tasks/my-tasks`)
      .subscribe({
        next: (tasks) => {
          const pending = tasks.filter(t => t.status === 'PENDING').length;
          const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
          const completed = tasks.filter(t => t.status === 'COMPLETED').length;
          const activeTask = tasks.find(t => t.status === 'IN_PROGRESS');
          
          this.stats.set({
            totalAssigned: tasks.length,
            pending,
            inProgress,
            completed,
            totalHoursToday: 0,
            totalHoursWeek: 0,
            activeTask: activeTask ? {
              id: activeTask.id,
              title: activeTask.title,
              status: activeTask.status,
              priority: activeTask.priority,
              timeLogged: (activeTask.totalTimeLogged || 0) / 60, // Convertir minutos a horas
              isActive: true
            } : null
          });
          
          // Cargar las tareas recientes (últimas 5)
          const recentTasks = tasks.slice(0, 5).map(t => ({
            id: t.id,
            title: t.title,
            status: t.status,
            priority: t.priority,
            timeLogged: (t.totalTimeLogged || 0) / 60, // Convertir minutos a horas
            isActive: t.status === 'IN_PROGRESS'
          }));
          this.recentTasks.set(recentTasks);
        },
        error: (err) => {
          console.error('Error al cargar dashboard:', err);
        }
      });

    // Cargar estadísticas de tiempo
    this.http.get<any>(`${environment.apiUrl}/time-logs/my-stats`)
      .subscribe({
        next: (timeStats) => {
          const currentStats = this.stats();
          this.stats.set({
            ...currentStats,
            totalHoursToday: timeStats.todayHours || 0,
            totalHoursWeek: timeStats.weekHours || 0
          });
        },
        error: (err) => {
          console.error('Error al cargar estadísticas de tiempo:', err);
        }
      });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días. ¿Listo para ser productivo?';
    if (hour < 18) return 'Buenas tardes. Sigue con el buen trabajo.';
    return 'Buenas noches. Termina lo pendiente y descansa.';
  }

  formatTime(hours: number): string {
    if (hours === 0) return '0h';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  getStatusName(status: string): string {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'IN_PROGRESS': return 'En Progreso';
      case 'COMPLETED': return 'Completada';
      default: return status;
    }
  }

  getPriorityName(priority: string): string {
    switch (priority) {
      case 'LOW': return 'Baja';
      case 'MEDIUM': return 'Media';
      case 'HIGH': return 'Alta';
      default: return priority;
    }
  }
}
