import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { LayoutComponent } from '../../../shared/components/layout/layout.component';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assigneeName: string;
  assigneeId: number;
  departmentName: string;
  departmentId: number;
  totalTimeLogged: number;
  createdAt: string;
  dueDate?: string;
}

interface Department {
  id: number;
  name: string;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
}

/**
 * Gestión de Tareas para Admin.
 * Ver todas las tareas, filtrar, ver tiempo invertido.
 * Admin NO ejecuta tareas, solo las supervisa.
 */
@Component({
  selector: 'app-admin-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent],
  template: `
    <app-layout>
    <div class="management-page">
      <!-- Header -->
      <header class="page-header">
        <div>
          <h1>Gestión de Tareas</h1>
          <p>Supervisa y administra todas las tareas del sistema</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nueva Tarea
        </button>
      </header>

      <!-- Stats Summary -->
      <div class="stats-row">
        <div class="mini-stat">
          <span class="stat-number">{{ taskStats().total }}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="mini-stat pending">
          <span class="stat-number">{{ taskStats().pending }}</span>
          <span class="stat-label">Pendientes</span>
        </div>
        <div class="mini-stat in-progress">
          <span class="stat-number">{{ taskStats().inProgress }}</span>
          <span class="stat-label">En Progreso</span>
        </div>
        <div class="mini-stat completed">
          <span class="stat-number">{{ taskStats().completed }}</span>
          <span class="stat-label">Completadas</span>
        </div>
        <div class="mini-stat hours">
          <span class="stat-number">{{ taskStats().totalHours }}h</span>
          <span class="stat-label">Horas Totales</span>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <div class="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Buscar tarea..." [(ngModel)]="searchTerm" (input)="filterTasks()">
        </div>
        <select [(ngModel)]="filterStatus" (change)="filterTasks()" class="filter-select">
          <option value="">Todos los estados</option>
          <option value="PENDING">Pendiente</option>
          <option value="IN_PROGRESS">En Progreso</option>
          <option value="COMPLETED">Completada</option>
        </select>
        <select [(ngModel)]="filterDepartment" (change)="filterTasks()" class="filter-select">
          <option value="">Todos los departamentos</option>
          <option *ngFor="let dept of departments()" [value]="dept.id">{{ dept.name }}</option>
        </select>
        <select [(ngModel)]="filterPriority" (change)="filterTasks()" class="filter-select">
          <option value="">Todas las prioridades</option>
          <option value="HIGH">Alta</option>
          <option value="MEDIUM">Media</option>
          <option value="LOW">Baja</option>
        </select>
      </div>

      <!-- Tasks Table -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Tarea</th>
              <th>Responsable</th>
              <th>Departamento</th>
              <th>Estado</th>
              <th>Prioridad</th>
              <th>Tiempo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let task of filteredTasks()">
              <td>
                <div class="task-cell">
                  <span class="task-title">{{ task.title }}</span>
                  <span class="task-desc">{{ task.description | slice:0:50 }}{{ task.description.length > 50 ? '...' : '' }}</span>
                </div>
              </td>
              <td>{{ task.assigneeName }}</td>
              <td>{{ task.departmentName }}</td>
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
                <span class="time-logged">{{ formatTime(task.totalTimeLogged) }}</span>
              </td>
              <td>
                <div class="actions">
                  <button class="btn-icon" title="Ver detalle" (click)="viewTask(task)">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                  <button class="btn-icon" title="Editar" (click)="editTask(task)">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="filteredTasks().length === 0">
              <td colspan="7" class="empty-state">
                No se encontraron tareas
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal Crear/Editar Tarea -->
      <div class="modal-overlay" *ngIf="showModal()" (click)="closeModal()">
        <div class="modal modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingTask() ? 'Editar Tarea' : 'Nueva Tarea' }}</h2>
            <button class="btn-close" (click)="closeModal()">×</button>
          </div>
          <form (ngSubmit)="saveTask()" class="modal-body">
            <div class="form-group">
              <label>Título</label>
              <input type="text" [(ngModel)]="taskForm.title" name="title" required placeholder="Título de la tarea">
            </div>
            <div class="form-group">
              <label>Descripción</label>
              <textarea [(ngModel)]="taskForm.description" name="description" rows="3" placeholder="Descripción detallada..."></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Responsable</label>
                <select [(ngModel)]="taskForm.assigneeId" name="assigneeId" required>
                  <option [ngValue]="null">Seleccionar...</option>
                  <option *ngFor="let user of employees()" [ngValue]="user.id">
                    {{ user.firstName }} {{ user.lastName }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Departamento</label>
                <select [(ngModel)]="taskForm.departmentId" name="departmentId" required>
                  <option [ngValue]="null">Seleccionar...</option>
                  <option *ngFor="let dept of departments()" [ngValue]="dept.id">{{ dept.name }}</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Prioridad</label>
                <select [(ngModel)]="taskForm.priority" name="priority" required>
                  <option value="LOW">Baja</option>
                  <option value="MEDIUM">Media</option>
                  <option value="HIGH">Alta</option>
                </select>
              </div>
              <div class="form-group">
                <label>Fecha límite</label>
                <input type="date" [(ngModel)]="taskForm.dueDate" name="dueDate">
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary">
                {{ editingTask() ? 'Guardar Cambios' : 'Crear Tarea' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Ver Detalle -->
      <div class="modal-overlay" *ngIf="showDetailModal()" (click)="closeDetailModal()">
        <div class="modal modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Detalle de Tarea</h2>
            <button class="btn-close" (click)="closeDetailModal()">×</button>
          </div>
          <div class="modal-body" *ngIf="selectedTask()">
            <div class="detail-grid">
              <div class="detail-item full">
                <label>Título</label>
                <p class="detail-title">{{ selectedTask()!.title }}</p>
              </div>
              <div class="detail-item full">
                <label>Descripción</label>
                <p>{{ selectedTask()!.description || 'Sin descripción' }}</p>
              </div>
              <div class="detail-item">
                <label>Responsable</label>
                <p>{{ selectedTask()!.assigneeName }}</p>
              </div>
              <div class="detail-item">
                <label>Departamento</label>
                <p>{{ selectedTask()!.departmentName }}</p>
              </div>
              <div class="detail-item">
                <label>Estado</label>
                <span class="status-badge" [class]="'status-' + selectedTask()!.status.toLowerCase().replace('_', '-')">
                  {{ getStatusName(selectedTask()!.status) }}
                </span>
              </div>
              <div class="detail-item">
                <label>Prioridad</label>
                <span class="priority-badge" [class]="'priority-' + selectedTask()!.priority.toLowerCase()">
                  {{ getPriorityName(selectedTask()!.priority) }}
                </span>
              </div>
              <div class="detail-item">
                <label>Tiempo Total Invertido</label>
                <p class="time-highlight">{{ formatTime(selectedTask()!.totalTimeLogged) }}</p>
              </div>
              <div class="detail-item">
                <label>Fecha Límite</label>
                <p>{{ selectedTask()!.dueDate || 'Sin fecha límite' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </app-layout>
  `,
  styles: [`
    .management-page {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
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

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      border-radius: 0.5rem;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .btn-primary {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }

    .btn-secondary {
      background: #e5e7eb;
      color: #374151;
    }

    .stats-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .mini-stat {
      background: white;
      border-radius: 0.75rem;
      padding: 1rem 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      min-width: 120px;
    }

    .mini-stat .stat-number {
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
    }

    .mini-stat .stat-label {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .mini-stat.pending .stat-number { color: #f59e0b; }
    .mini-stat.in-progress .stat-number { color: #3b82f6; }
    .mini-stat.completed .stat-number { color: #10b981; }
    .mini-stat.hours .stat-number { color: #8b5cf6; }

    .filters-bar {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 0.5rem 1rem;
      flex: 1;
      min-width: 200px;
    }

    .search-box svg { color: #9ca3af; }
    .search-box input {
      border: none;
      outline: none;
      width: 100%;
      font-size: 0.875rem;
    }

    .filter-select {
      padding: 0.625rem 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      background: white;
      font-size: 0.875rem;
      cursor: pointer;
    }

    .table-container {
      background: white;
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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

    .task-cell {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .task-title {
      font-weight: 500;
      color: #111827;
    }

    .task-desc {
      font-size: 0.75rem;
      color: #6b7280;
    }

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

    .time-logged {
      font-weight: 600;
      color: #8b5cf6;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-icon {
      width: 32px;
      height: 32px;
      border: none;
      background: #f3f4f6;
      border-radius: 0.375rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #6b7280;
      transition: all 0.2s;
    }

    .btn-icon:hover {
      background: #e5e7eb;
      color: #374151;
    }

    .empty-state {
      text-align: center;
      color: #9ca3af;
      padding: 3rem !important;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal {
      background: white;
      border-radius: 1rem;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal.modal-lg { max-width: 600px; }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

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

    .modal-body { padding: 1.5rem; }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #374151;
      font-size: 0.875rem;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 0.625rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-family: inherit;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
      margin-top: 1rem;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .detail-item.full {
      grid-column: 1 / -1;
    }

    .detail-item label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .detail-item p {
      margin: 0;
      color: #111827;
    }

    .detail-title {
      font-size: 1.125rem;
      font-weight: 600;
    }

    .time-highlight {
      font-size: 1.25rem;
      font-weight: 700;
      color: #8b5cf6;
    }
  `]
})
export class AdminTasksComponent implements OnInit {
  private http = inject(HttpClient);
  
  tasks = signal<Task[]>([]);
  filteredTasks = signal<Task[]>([]);
  departments = signal<Department[]>([]);
  employees = signal<User[]>([]);
  
  showModal = signal(false);
  showDetailModal = signal(false);
  editingTask = signal<Task | null>(null);
  selectedTask = signal<Task | null>(null);
  
  searchTerm = '';
  filterStatus = '';
  filterDepartment = '';
  filterPriority = '';
  
  taskForm = {
    title: '',
    description: '',
    assigneeId: null as number | null,
    departmentId: null as number | null,
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    dueDate: ''
  };

  taskStats = signal({ total: 0, pending: 0, inProgress: 0, completed: 0, totalHours: 0 });

  ngOnInit() {
    this.loadTasks();
    this.loadDepartments();
    this.loadEmployees();
  }

  loadTasks() {
    this.http.get<any[]>(`${environment.apiUrl}/tasks`)
      .subscribe({
        next: (data) => {
          const tasks = data.map(t => ({
            id: t.id,
            title: t.title,
            description: t.description || '',
            status: t.status,
            priority: t.priority,
            assigneeName: t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName}` : 'Sin asignar',
            assigneeId: t.assignee?.id || 0,
            departmentName: t.department?.name || 'Sin departamento',
            departmentId: t.department?.id || 0,
            totalTimeLogged: t.totalTimeLogged || 0,
            createdAt: t.createdAt,
            dueDate: t.dueDate
          }));
          this.tasks.set(tasks);
          this.filterTasks();
          this.calculateStats();
        },
        error: (err) => {
          console.error('Error al cargar tareas:', err);
          alert('Error al cargar las tareas');
        }
      });
  }

  loadDepartments() {
    this.http.get<Department[]>(`${environment.apiUrl}/departments`)
      .subscribe({
        next: (data) => this.departments.set(data),
        error: (err) => {
          console.error('Error al cargar departamentos:', err);
        }
      });
  }

  loadEmployees() {
    this.http.get<any[]>(`${environment.apiUrl}/users`)
      .subscribe({
        next: (data) => {
          const employees = data
            .filter(u => u.role === 'EMPLOYEE' || u.role === 'MANAGER')
            .map(u => ({
              id: u.id,
              firstName: u.firstName,
              lastName: u.lastName
            }));
          this.employees.set(employees);
        },
        error: (err) => {
          console.error('Error al cargar empleados:', err);
        }
      });
  }

  calculateStats() {
    const tasks = this.tasks();
    this.taskStats.set({
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'PENDING').length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      completed: tasks.filter(t => t.status === 'COMPLETED').length,
      totalHours: Math.round(tasks.reduce((sum, t) => sum + t.totalTimeLogged, 0) * 10) / 10
    });
  }

  filterTasks() {
    let result = this.tasks();
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(term) ||
        t.description.toLowerCase().includes(term) ||
        t.assigneeName.toLowerCase().includes(term)
      );
    }
    
    if (this.filterStatus) {
      result = result.filter(t => t.status === this.filterStatus);
    }
    
    if (this.filterDepartment) {
      result = result.filter(t => t.departmentId === +this.filterDepartment);
    }
    
    if (this.filterPriority) {
      result = result.filter(t => t.priority === this.filterPriority);
    }
    
    this.filteredTasks.set(result);
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

  formatTime(hours: number): string {
    if (hours === 0) return '0h';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  openCreateModal() {
    this.editingTask.set(null);
    this.taskForm = {
      title: '',
      description: '',
      assigneeId: null,
      departmentId: null,
      priority: 'MEDIUM',
      dueDate: ''
    };
    this.showModal.set(true);
  }

  editTask(task: Task) {
    this.editingTask.set(task);
    this.taskForm = {
      title: task.title,
      description: task.description,
      assigneeId: task.assigneeId,
      departmentId: task.departmentId,
      priority: task.priority,
      dueDate: task.dueDate || ''
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingTask.set(null);
  }

  saveTask() {
    const payload = {
      title: this.taskForm.title,
      description: this.taskForm.description,
      priority: this.taskForm.priority,
      dueDate: this.taskForm.dueDate || null,
      assignee: this.taskForm.assigneeId ? { id: this.taskForm.assigneeId } : null,
      department: this.taskForm.departmentId ? { id: this.taskForm.departmentId } : null
    };

    if (this.editingTask()) {
      this.http.put(`${environment.apiUrl}/tasks/${this.editingTask()!.id}`, payload)
        .subscribe({
          next: () => {
            this.loadTasks();
            this.closeModal();
          },
          error: (err) => {
            console.error('Error al actualizar tarea:', err);
            alert('Error al actualizar la tarea');
          }
        });
    } else {
      this.http.post(`${environment.apiUrl}/tasks`, payload)
        .subscribe({
          next: () => {
            this.loadTasks();
            this.closeModal();
          },
          error: (err) => {
            console.error('Error al crear tarea:', err);
            alert('Error al crear la tarea');
          }
        });
    }
  }

  viewTask(task: Task) {
    this.selectedTask.set(task);
    this.showDetailModal.set(true);
  }

  closeDetailModal() {
    this.showDetailModal.set(false);
    this.selectedTask.set(null);
  }
}
