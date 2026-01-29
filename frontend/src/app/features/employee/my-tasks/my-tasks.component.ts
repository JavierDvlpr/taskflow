import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { LayoutComponent } from '../../../shared/components/layout/layout.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

interface MyTask {
  id: number;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  requesterName: string;
  departmentName: string;
  dueDate?: string;
  timeLogged: number;
  createdAt: string;
}

/**
 * Vista de Tareas del Empleado.
 * Solo ve SUS tareas. Descripción, solicitante, prioridad.
 * NO puede reasignar tareas.
 */
@Component({
  selector: 'app-my-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent, LoadingComponent],
  template: `
    <app-layout>
    <div class="my-tasks-page">
      <header class="page-header">
        <div>
          <h1>Mis Tareas</h1>
          <p>Gestiona y visualiza tus tareas asignadas</p>
        </div>
      </header>

      <!-- Stats Pills -->
      <div class="stats-pills">
        <button 
          class="pill" 
          [class.active]="filterStatus === ''"
          (click)="filterStatus = ''; filterTasks()">
          Todas ({{ tasks().length }})
        </button>
        <button 
          class="pill pending" 
          [class.active]="filterStatus === 'PENDING'"
          (click)="filterStatus = 'PENDING'; filterTasks()">
          Pendientes ({{ countByStatus('PENDING') }})
        </button>
        <button 
          class="pill in-progress" 
          [class.active]="filterStatus === 'IN_PROGRESS'"
          (click)="filterStatus = 'IN_PROGRESS'; filterTasks()">
          En Progreso ({{ countByStatus('IN_PROGRESS') }})
        </button>
        <button 
          class="pill completed" 
          [class.active]="filterStatus === 'COMPLETED'"
          (click)="filterStatus = 'COMPLETED'; filterTasks()">
          Completadas ({{ countByStatus('COMPLETED') }})
        </button>
      </div>

      <!-- Search -->
      <div class="search-bar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" placeholder="Buscar en mis tareas..." [(ngModel)]="searchTerm" (input)="filterTasks()">
      </div>

      <!-- Loading -->
      <app-loading *ngIf="loading()" message="Cargando mis tareas..."></app-loading>

      <!-- Tasks List -->
      <div class="tasks-container" *ngIf="!loading()">
        <div class="task-card" *ngFor="let task of filteredTasks()" (click)="selectTask(task)">
          <div class="task-header">
            <span class="priority-indicator" [class]="'priority-' + task.priority.toLowerCase()">
              {{ getPriorityName(task.priority) }}
            </span>
            <span class="status-badge" [class]="'status-' + task.status.toLowerCase().replace('_', '-')">
              {{ getStatusName(task.status) }}
            </span>
          </div>
          <h3 class="task-title">{{ task.title }}</h3>
          <p class="task-description">{{ task.description | slice:0:100 }}{{ task.description.length > 100 ? '...' : '' }}</p>
          <div class="task-meta">
            <div class="meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>{{ task.requesterName }}</span>
            </div>
            <div class="meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
              <span>{{ formatTime(task.timeLogged) }}</span>
            </div>
            <div class="meta-item" *ngIf="task.dueDate">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span [class.overdue]="isOverdue(task.dueDate)">{{ task.dueDate | date:'dd/MM/yyyy' }}</span>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="filteredTasks().length === 0">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="12" y1="18" x2="12" y2="12"/>
            <line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
          <p>No se encontraron tareas</p>
        </div>
      </div>

      <!-- Task Detail Modal -->
      <div class="modal-overlay" *ngIf="selectedTask()" (click)="closeDetail()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <span class="priority-tag" [class]="'priority-' + selectedTask()!.priority.toLowerCase()">
                {{ getPriorityName(selectedTask()!.priority) }}
              </span>
              <span class="status-tag" [class]="'status-' + selectedTask()!.status.toLowerCase().replace('_', '-')">
                {{ getStatusName(selectedTask()!.status) }}
              </span>
            </div>
            <button class="btn-close" (click)="closeDetail()">×</button>
          </div>
          
          <div class="modal-body">
            <h2>{{ selectedTask()!.title }}</h2>
            
            <div class="detail-section">
              <label>Descripción</label>
              <p>{{ selectedTask()!.description || 'Sin descripción' }}</p>
            </div>

            <div class="detail-grid">
              <div class="detail-item">
                <label>Solicitante</label>
                <p>{{ selectedTask()!.requesterName }}</p>
              </div>
              <div class="detail-item">
                <label>Departamento</label>
                <p>{{ selectedTask()!.departmentName }}</p>
              </div>
              <div class="detail-item">
                <label>Fecha de Creación</label>
                <p>{{ selectedTask()!.createdAt | date:'dd/MM/yyyy' }}</p>
              </div>
              <div class="detail-item">
                <label>Fecha Límite</label>
                <p [class.overdue]="selectedTask()!.dueDate && isOverdue(selectedTask()!.dueDate!)">
                  {{ selectedTask()!.dueDate ? (selectedTask()!.dueDate | date:'dd/MM/yyyy') : 'Sin fecha límite' }}
                </p>
              </div>
              <div class="detail-item highlight">
                <label>Tiempo Registrado</label>
                <p class="time-value">{{ formatTime(selectedTask()!.timeLogged) }}</p>
              </div>
            </div>

            <div class="info-box" *ngIf="selectedTask()!.status !== 'COMPLETED'">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <p>Para trabajar en esta tarea, ve a <strong>Control de Tiempo</strong> y selecciónala para iniciar el cronómetro.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </app-layout>
  `,
  styles: [`
    .my-tasks-page {
      padding: 2rem;
      max-width: 1200px;
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

    .stats-pills {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .pill {
      padding: 0.5rem 1rem;
      border: none;
      background: white;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
      color: #6b7280;
      cursor: pointer;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      transition: all 0.2s;
    }

    .pill:hover {
      background: #f3f4f6;
    }

    .pill.active {
      background: #111827;
      color: white;
    }

    .pill.pending.active { background: #f59e0b; }
    .pill.in-progress.active { background: #3b82f6; }
    .pill.completed.active { background: #10b981; }

    .search-bar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 0.75rem;
      padding: 0.75rem 1rem;
      margin-bottom: 1.5rem;
    }

    .search-bar svg { color: #9ca3af; }

    .search-bar input {
      border: none;
      outline: none;
      width: 100%;
      font-size: 0.875rem;
    }

    .tasks-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1rem;
    }

    .task-card {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: all 0.2s;
      border: 2px solid transparent;
    }

    .task-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      border-color: #10b981;
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .priority-indicator {
      font-size: 0.625rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
    }

    .priority-indicator.priority-low { background: #e5e7eb; color: #374151; }
    .priority-indicator.priority-medium { background: #fef3c7; color: #92400e; }
    .priority-indicator.priority-high { background: #fee2e2; color: #991b1b; }

    .status-badge {
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
    }

    .status-badge.status-pending { background: #fef3c7; color: #92400e; }
    .status-badge.status-in-progress { background: #dbeafe; color: #1e40af; }
    .status-badge.status-completed { background: #d1fae5; color: #065f46; }

    .task-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
      margin: 0 0 0.5rem;
    }

    .task-description {
      color: #6b7280;
      font-size: 0.875rem;
      margin: 0 0 1rem;
      line-height: 1.5;
    }

    .task-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.75rem;
      color: #6b7280;
    }

    .meta-item .overdue { color: #dc2626; font-weight: 500; }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 4rem 2rem;
      color: #9ca3af;
    }

    .empty-state svg { margin-bottom: 1rem; }

    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal {
      background: white;
      border-radius: 1rem;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header > div {
      display: flex;
      gap: 0.5rem;
    }

    .priority-tag, .status-tag {
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.25rem 0.75rem;
      border-radius: 0.25rem;
    }

    .priority-tag.priority-low { background: #e5e7eb; color: #374151; }
    .priority-tag.priority-medium { background: #fef3c7; color: #92400e; }
    .priority-tag.priority-high { background: #fee2e2; color: #991b1b; }

    .status-tag.status-pending { background: #fef3c7; color: #92400e; }
    .status-tag.status-in-progress { background: #dbeafe; color: #1e40af; }
    .status-tag.status-completed { background: #d1fae5; color: #065f46; }

    .btn-close {
      width: 32px;
      height: 32px;
      border: none;
      background: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #9ca3af;
      border-radius: 0.375rem;
    }

    .btn-close:hover { background: #f3f4f6; }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-body h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
      margin: 0 0 1.5rem;
    }

    .detail-section {
      margin-bottom: 1.5rem;
    }

    .detail-section label,
    .detail-item label {
      display: block;
      font-size: 0.75rem;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.25rem;
    }

    .detail-section p,
    .detail-item p {
      margin: 0;
      color: #111827;
      line-height: 1.6;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .detail-item.highlight {
      background: #f9fafb;
      padding: 1rem;
      border-radius: 0.5rem;
    }

    .time-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: #8b5cf6 !important;
    }

    .info-box {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 0.5rem;
      padding: 1rem;
      margin-top: 1.5rem;
    }

    .info-box svg { color: #3b82f6; flex-shrink: 0; margin-top: 2px; }

    .info-box p {
      margin: 0;
      font-size: 0.875rem;
      color: #1e40af;
    }

    .overdue { color: #dc2626 !important; }
  `]
})
export class MyTasksComponent implements OnInit {
  private http = inject(HttpClient);
  
  tasks = signal<MyTask[]>([]);
  filteredTasks = signal<MyTask[]>([]);
  selectedTask = signal<MyTask | null>(null);
  loading = signal(true);
  
  searchTerm = '';
  filterStatus = '';

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.loading.set(true);
    this.http.get<any[]>(`${environment.apiUrl}/tasks/my-tasks`)
      .subscribe({
        next: (data) => {
          const tasks = data.map(t => ({
            id: t.id,
            title: t.title,
            description: t.description || '',
            status: t.status,
            priority: t.priority,
            requesterName: t.requesterFirstName ? `${t.requesterFirstName} ${t.requesterLastName}` : 'Admin',
            departmentName: t.departmentName || 'Sin departamento',
            dueDate: t.dueDate,
            timeLogged: (t.totalTimeLogged || 0) / 60, // Convertir minutos a horas
            createdAt: t.createdAt
          }));
          this.tasks.set(tasks);
          this.filterTasks();
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error al cargar mis tareas:', err);
          alert('Error al cargar las tareas');
          this.loading.set(false);
        }
      });
  }

  filterTasks() {
    let result = this.tasks();
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(term) ||
        t.description.toLowerCase().includes(term)
      );
    }
    
    if (this.filterStatus) {
      result = result.filter(t => t.status === this.filterStatus);
    }
    
    this.filteredTasks.set(result);
  }

  countByStatus(status: string): number {
    return this.tasks().filter(t => t.status === status).length;
  }

  selectTask(task: MyTask) {
    this.selectedTask.set(task);
  }

  closeDetail() {
    this.selectedTask.set(null);
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

  isOverdue(dateStr: string): boolean {
    return new Date(dateStr) < new Date();
  }
}
