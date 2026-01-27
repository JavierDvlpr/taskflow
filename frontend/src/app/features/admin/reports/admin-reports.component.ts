import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { LayoutComponent } from '../../../shared/components/layout/layout.component';

interface UserReport {
  userId: number;
  userName: string;
  department: string;
  totalHours: number;
  tasksCompleted: number;
  tasksInProgress: number;
}

interface DepartmentReport {
  departmentId: number;
  departmentName: string;
  totalUsers: number;
  totalHours: number;
  tasksCompleted: number;
  avgHoursPerUser: number;
}

interface TaskReport {
  taskId: number;
  taskTitle: string;
  assignee: string;
  department: string;
  status: string;
  totalHours: number;
  priority: string;
}

/**
 * Reportes para Admin.
 * Ver horas por usuario, departamento, tarea.
 * Exportar a CSV.
 */
@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent],
  template: `
    <app-layout>
    <div class="reports-page">
      <!-- Header -->
      <header class="page-header">
        <div>
          <h1>Reportes y Análisis</h1>
          <p>Analiza el rendimiento y productividad de tu equipo</p>
        </div>
      </header>

      <!-- Report Tabs -->
      <div class="tabs">
        <button 
          class="tab" 
          [class.active]="activeTab() === 'users'"
          (click)="activeTab.set('users')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87"/>
            <path d="M16 3.13a4 4 0 010 7.75"/>
          </svg>
          Por Usuario
        </button>
        <button 
          class="tab" 
          [class.active]="activeTab() === 'departments'"
          (click)="activeTab.set('departments')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 21h18"/>
            <path d="M9 8h1"/>
            <path d="M9 12h1"/>
            <path d="M9 16h1"/>
            <path d="M14 8h1"/>
            <path d="M14 12h1"/>
            <path d="M14 16h1"/>
            <path d="M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"/>
          </svg>
          Por Departamento
        </button>
        <button 
          class="tab" 
          [class.active]="activeTab() === 'tasks'"
          (click)="activeTab.set('tasks')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
          Por Tarea
        </button>
      </div>

      <!-- Filters & Export -->
      <div class="controls-bar">
        <div class="filters">
          <div class="date-range">
            <label>Desde:</label>
            <input type="date" [(ngModel)]="dateFrom" (change)="loadReports()">
          </div>
          <div class="date-range">
            <label>Hasta:</label>
            <input type="date" [(ngModel)]="dateTo" (change)="loadReports()">
          </div>
        </div>
        <button class="btn btn-export" (click)="exportCSV()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Exportar CSV
        </button>
      </div>

      <!-- Users Report -->
      <div class="report-section" *ngIf="activeTab() === 'users'">
        <div class="summary-cards">
          <div class="summary-card">
            <div class="summary-icon users">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
            </div>
            <div class="summary-content">
              <span class="summary-value">{{ userReports().length }}</span>
              <span class="summary-label">Usuarios Activos</span>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon hours">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
            <div class="summary-content">
              <span class="summary-value">{{ getTotalHours('users') }}h</span>
              <span class="summary-label">Horas Totales</span>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon tasks">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
            </div>
            <div class="summary-content">
              <span class="summary-value">{{ getTotalCompleted('users') }}</span>
              <span class="summary-label">Tareas Completadas</span>
            </div>
          </div>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Departamento</th>
                <th>Horas Trabajadas</th>
                <th>Tareas Completadas</th>
                <th>En Progreso</th>
                <th>Productividad</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let report of userReports()">
                <td>
                  <div class="user-cell">
                    <div class="avatar">{{ report.userName.charAt(0) }}</div>
                    <span>{{ report.userName }}</span>
                  </div>
                </td>
                <td>{{ report.department }}</td>
                <td>
                  <div class="hours-bar">
                    <div class="hours-fill" [style.width.%]="getPercentage(report.totalHours, getMaxHours('users'))"></div>
                    <span>{{ report.totalHours }}h</span>
                  </div>
                </td>
                <td class="text-center">{{ report.tasksCompleted }}</td>
                <td class="text-center">{{ report.tasksInProgress }}</td>
                <td>
                  <span class="productivity-badge" [class]="getProductivityClass(report)">
                    {{ getProductivity(report) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Departments Report -->
      <div class="report-section" *ngIf="activeTab() === 'departments'">
        <div class="summary-cards">
          <div class="summary-card">
            <div class="summary-icon depts">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 21h18"/>
                <path d="M5 21V7l8-4v18"/>
                <path d="M19 21V11l-6-4"/>
              </svg>
            </div>
            <div class="summary-content">
              <span class="summary-value">{{ departmentReports().length }}</span>
              <span class="summary-label">Departamentos</span>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon hours">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
            <div class="summary-content">
              <span class="summary-value">{{ getTotalHours('departments') }}h</span>
              <span class="summary-label">Horas Totales</span>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon avg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </div>
            <div class="summary-content">
              <span class="summary-value">{{ getAvgHoursPerDept() }}h</span>
              <span class="summary-label">Promedio por Depto</span>
            </div>
          </div>
        </div>

        <div class="dept-grid">
          <div class="dept-card" *ngFor="let dept of departmentReports()">
            <div class="dept-header">
              <h3>{{ dept.departmentName }}</h3>
              <span class="dept-users">{{ dept.totalUsers }} usuarios</span>
            </div>
            <div class="dept-stats">
              <div class="dept-stat">
                <span class="stat-value">{{ dept.totalHours }}h</span>
                <span class="stat-label">Horas Totales</span>
              </div>
              <div class="dept-stat">
                <span class="stat-value">{{ dept.tasksCompleted }}</span>
                <span class="stat-label">Completadas</span>
              </div>
              <div class="dept-stat">
                <span class="stat-value">{{ dept.avgHoursPerUser }}h</span>
                <span class="stat-label">Promedio/Usuario</span>
              </div>
            </div>
            <div class="dept-bar">
              <div class="bar-fill" [style.width.%]="getPercentage(dept.totalHours, getMaxHours('departments'))"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tasks Report -->
      <div class="report-section" *ngIf="activeTab() === 'tasks'">
        <div class="summary-cards">
          <div class="summary-card">
            <div class="summary-icon tasks">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="9" y1="21" x2="9" y2="9"/>
              </svg>
            </div>
            <div class="summary-content">
              <span class="summary-value">{{ taskReports().length }}</span>
              <span class="summary-label">Total Tareas</span>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon hours">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
            <div class="summary-content">
              <span class="summary-value">{{ getTotalHours('tasks') }}h</span>
              <span class="summary-label">Horas Invertidas</span>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon avg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v4"/>
                <path d="M12 18v4"/>
                <path d="M4.93 4.93l2.83 2.83"/>
                <path d="M16.24 16.24l2.83 2.83"/>
                <path d="M2 12h4"/>
                <path d="M18 12h4"/>
              </svg>
            </div>
            <div class="summary-content">
              <span class="summary-value">{{ getAvgHoursPerTask() }}h</span>
              <span class="summary-label">Promedio por Tarea</span>
            </div>
          </div>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Tarea</th>
                <th>Responsable</th>
                <th>Departamento</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Tiempo Invertido</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let task of taskReports()">
                <td>
                  <span class="task-title">{{ task.taskTitle }}</span>
                </td>
                <td>{{ task.assignee }}</td>
                <td>{{ task.department }}</td>
                <td>
                  <span class="status-badge" [class]="'status-' + task.status.toLowerCase().replace('_', '-')">
                    {{ getStatusName(task.status) }}
                  </span>
                </td>
                <td>
                  <span class="priority-badge" [class]="'priority-' + task.priority.toLowerCase()">
                    {{ getPriorityName(task.priority) }}
                  </span>
                </td>
                <td>
                  <div class="hours-bar">
                    <div class="hours-fill" [style.width.%]="getPercentage(task.totalHours, getMaxHours('tasks'))"></div>
                    <span>{{ task.totalHours }}h</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </app-layout>
  `,
  styles: [`
    .reports-page {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 1.5rem;
    }

    .page-header h1 {
      font-size: 1.875rem;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }

    .page-header p {
      color: #6b7280;
      margin: 0.25rem 0 0;
    }

    .tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      background: white;
      padding: 0.5rem;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .tab {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      border: none;
      background: transparent;
      border-radius: 0.5rem;
      font-weight: 500;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.2s;
    }

    .tab:hover {
      background: #f3f4f6;
      color: #374151;
    }

    .tab.active {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }

    .controls-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .filters {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .date-range {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .date-range label {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .date-range input {
      padding: 0.5rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.375rem;
      font-size: 0.875rem;
    }

    .btn-export {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      background: #8b5cf6;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-export:hover {
      background: #7c3aed;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .summary-card {
      background: white;
      border-radius: 1rem;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .summary-icon {
      width: 48px;
      height: 48px;
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .summary-icon.users { background: #dbeafe; color: #2563eb; }
    .summary-icon.hours { background: #fef3c7; color: #d97706; }
    .summary-icon.tasks { background: #d1fae5; color: #059669; }
    .summary-icon.depts { background: #ede9fe; color: #7c3aed; }
    .summary-icon.avg { background: #fce7f3; color: #db2777; }

    .summary-content {
      display: flex;
      flex-direction: column;
    }

    .summary-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
    }

    .summary-label {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .table-container {
      background: white;
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table th,
    .data-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }

    .data-table th {
      background: #f9fafb;
      font-weight: 600;
      color: #374151;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .text-center { text-align: center; }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .avatar {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }

    .hours-bar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .hours-bar .hours-fill {
      height: 8px;
      background: linear-gradient(90deg, #10b981 0%, #059669 100%);
      border-radius: 4px;
      min-width: 4px;
      max-width: 100px;
    }

    .hours-bar span {
      font-weight: 600;
      color: #10b981;
      font-size: 0.875rem;
    }

    .productivity-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .productivity-high { background: #d1fae5; color: #065f46; }
    .productivity-medium { background: #fef3c7; color: #92400e; }
    .productivity-low { background: #fee2e2; color: #991b1b; }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-pending { background: #fef3c7; color: #92400e; }
    .status-in-progress { background: #dbeafe; color: #1e40af; }
    .status-completed { background: #d1fae5; color: #065f46; }

    .priority-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .priority-low { background: #e5e7eb; color: #374151; }
    .priority-medium { background: #fef3c7; color: #92400e; }
    .priority-high { background: #fee2e2; color: #991b1b; }

    .task-title {
      font-weight: 500;
      color: #111827;
    }

    /* Department Cards */
    .dept-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }

    .dept-card {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .dept-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .dept-header h3 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
    }

    .dept-users {
      font-size: 0.75rem;
      color: #6b7280;
      background: #f3f4f6;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
    }

    .dept-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .dept-stat {
      text-align: center;
    }

    .dept-stat .stat-value {
      display: block;
      font-size: 1.25rem;
      font-weight: 700;
      color: #111827;
    }

    .dept-stat .stat-label {
      font-size: 0.625rem;
      color: #6b7280;
      text-transform: uppercase;
    }

    .dept-bar {
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
    }

    .dept-bar .bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%);
      border-radius: 4px;
    }
  `]
})
export class AdminReportsComponent implements OnInit {
  private http = inject(HttpClient);
  
  activeTab = signal<'users' | 'departments' | 'tasks'>('users');
  
  userReports = signal<UserReport[]>([]);
  departmentReports = signal<DepartmentReport[]>([]);
  taskReports = signal<TaskReport[]>([]);
  
  dateFrom = '';
  dateTo = '';

  ngOnInit() {
    // Establecer fechas por defecto (último mes)
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    this.dateTo = today.toISOString().split('T')[0];
    this.dateFrom = lastMonth.toISOString().split('T')[0];
    
    this.loadReports();
  }

  loadReports() {
    this.loadUserReports();
    this.loadDepartmentReports();
    this.loadTaskReports();
  }

  loadUserReports() {
    // Cargar usuarios y sus estadísticas desde los endpoints reales
    this.http.get<any[]>(`${environment.apiUrl}/users`).subscribe({
      next: (users) => {
        const userReports = users
          .filter(u => u.role !== 'ADMIN')
          .map(u => ({
            userId: u.id,
            userName: `${u.firstName} ${u.lastName}`,
            department: u.department?.name || 'Sin departamento',
            totalHours: u.totalHoursWorked || 0,
            tasksCompleted: u.tasksCompleted || 0,
            tasksInProgress: u.tasksInProgress || 0
          }));
        this.userReports.set(userReports);
      },
      error: (err) => {
        console.error('Error al cargar reportes de usuarios:', err);
      }
    });
  }

  loadDepartmentReports() {
    this.http.get<any[]>(`${environment.apiUrl}/departments/stats`).subscribe({
      next: (data) => {
        const deptReports = data.map(d => ({
          departmentId: d.id,
          departmentName: d.name,
          totalUsers: d.usersCount || 0,
          totalHours: d.totalHours || 0,
          tasksCompleted: d.tasksCompleted || 0,
          avgHoursPerUser: d.usersCount ? Math.round((d.totalHours || 0) / d.usersCount * 10) / 10 : 0
        }));
        this.departmentReports.set(deptReports);
      },
      error: (err) => {
        console.error('Error al cargar reportes de departamentos:', err);
        // Fallback: cargar departamentos básicos
        this.http.get<any[]>(`${environment.apiUrl}/departments`).subscribe({
          next: (depts) => {
            const deptReports = depts.map(d => ({
              departmentId: d.id,
              departmentName: d.name,
              totalUsers: d.usersCount || 0,
              totalHours: 0,
              tasksCompleted: 0,
              avgHoursPerUser: 0
            }));
            this.departmentReports.set(deptReports);
          }
        });
      }
    });
  }

  loadTaskReports() {
    this.http.get<any[]>(`${environment.apiUrl}/tasks`).subscribe({
      next: (tasks) => {
        const taskReports = tasks.map(t => ({
          taskId: t.id,
          taskTitle: t.title,
          assignee: t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName}` : 'Sin asignar',
          department: t.department?.name || 'Sin departamento',
          status: t.status,
          totalHours: t.totalTimeLogged || 0,
          priority: t.priority
        }));
        this.taskReports.set(taskReports);
      },
      error: (err) => {
        console.error('Error al cargar reportes de tareas:', err);
      }
    });
  }

  getTotalHours(type: 'users' | 'departments' | 'tasks'): number {
    let total = 0;
    switch (type) {
      case 'users':
        total = this.userReports().reduce((sum, r) => sum + r.totalHours, 0);
        break;
      case 'departments':
        total = this.departmentReports().reduce((sum, r) => sum + r.totalHours, 0);
        break;
      case 'tasks':
        total = this.taskReports().reduce((sum, r) => sum + r.totalHours, 0);
        break;
    }
    return Math.round(total * 10) / 10;
  }

  getTotalCompleted(type: 'users' | 'departments'): number {
    if (type === 'users') {
      return this.userReports().reduce((sum, r) => sum + r.tasksCompleted, 0);
    }
    return this.departmentReports().reduce((sum, r) => sum + r.tasksCompleted, 0);
  }

  getMaxHours(type: 'users' | 'departments' | 'tasks'): number {
    let max = 0;
    switch (type) {
      case 'users':
        max = Math.max(...this.userReports().map(r => r.totalHours), 1);
        break;
      case 'departments':
        max = Math.max(...this.departmentReports().map(r => r.totalHours), 1);
        break;
      case 'tasks':
        max = Math.max(...this.taskReports().map(r => r.totalHours), 1);
        break;
    }
    return max;
  }

  getPercentage(value: number, max: number): number {
    return (value / max) * 100;
  }

  getAvgHoursPerDept(): number {
    const depts = this.departmentReports();
    if (depts.length === 0) return 0;
    const total = depts.reduce((sum, d) => sum + d.totalHours, 0);
    return Math.round((total / depts.length) * 10) / 10;
  }

  getAvgHoursPerTask(): number {
    const tasks = this.taskReports();
    if (tasks.length === 0) return 0;
    const total = tasks.reduce((sum, t) => sum + t.totalHours, 0);
    return Math.round((total / tasks.length) * 10) / 10;
  }

  getProductivity(report: UserReport): string {
    const ratio = report.tasksCompleted / Math.max(report.totalHours, 1) * 10;
    if (ratio >= 1.5) return 'Alta';
    if (ratio >= 1) return 'Media';
    return 'Baja';
  }

  getProductivityClass(report: UserReport): string {
    const prod = this.getProductivity(report);
    return 'productivity-' + prod.toLowerCase();
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

  exportCSV() {
    let csv = '';
    let filename = '';
    
    switch (this.activeTab()) {
      case 'users':
        csv = 'Usuario,Departamento,Horas Trabajadas,Tareas Completadas,En Progreso\n';
        this.userReports().forEach(r => {
          csv += `"${r.userName}","${r.department}",${r.totalHours},${r.tasksCompleted},${r.tasksInProgress}\n`;
        });
        filename = 'reporte_usuarios.csv';
        break;
        
      case 'departments':
        csv = 'Departamento,Usuarios,Horas Totales,Tareas Completadas,Promedio por Usuario\n';
        this.departmentReports().forEach(r => {
          csv += `"${r.departmentName}",${r.totalUsers},${r.totalHours},${r.tasksCompleted},${r.avgHoursPerUser}\n`;
        });
        filename = 'reporte_departamentos.csv';
        break;
        
      case 'tasks':
        csv = 'Tarea,Responsable,Departamento,Estado,Prioridad,Horas\n';
        this.taskReports().forEach(r => {
          csv += `"${r.taskTitle}","${r.assignee}","${r.department}","${this.getStatusName(r.status)}","${this.getPriorityName(r.priority)}",${r.totalHours}\n`;
        });
        filename = 'reporte_tareas.csv';
        break;
    }
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }
}
