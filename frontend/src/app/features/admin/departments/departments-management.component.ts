import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { LayoutComponent } from '../../../shared/components/layout/layout.component';

interface Department {
  id: number;
  name: string;
  description?: string;
  usersCount: number;
  createdAt?: string;
}

/**
 * Gestión de Departamentos para Admin.
 * CRUD de departamentos y visualización de usuarios por departamento.
 */
@Component({
  selector: 'app-departments-management',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent],
  template: `
    <app-layout>
    <div class="management-page">
      <!-- Header -->
      <header class="page-header">
        <div>
          <h1>Gestión de Departamentos</h1>
          <p>Administra la estructura organizacional</p>
        </div>
        <button class="btn btn-primary" (click)="openModal()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo Departamento
        </button>
      </header>

      <!-- Departments Grid -->
      <div class="departments-grid">
        <div class="department-card" *ngFor="let dept of departments()">
          <div class="card-header">
            <div class="dept-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
            </div>
            <div class="card-actions">
              <button class="btn-icon" title="Editar" (click)="editDepartment(dept)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button class="btn-icon delete" title="Eliminar" (click)="deleteDepartment(dept)" *ngIf="dept.usersCount === 0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3,6 5,6 21,6"/>
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                </svg>
              </button>
            </div>
          </div>
          <h3>{{ dept.name }}</h3>
          <p class="dept-description">{{ dept.description || 'Sin descripción' }}</p>
          <div class="dept-stats">
            <div class="stat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
              <span>{{ dept.usersCount }} usuarios</span>
            </div>
          </div>
          <button class="btn-view-users" (click)="viewDepartmentUsers(dept)">
            Ver usuarios
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9,18 15,12 9,6"/>
            </svg>
          </button>
        </div>

        <!-- Empty state -->
        <div class="empty-card" *ngIf="departments().length === 0">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
          <p>No hay departamentos creados</p>
          <button class="btn btn-primary" (click)="openModal()">Crear Departamento</button>
        </div>
      </div>

      <!-- Modal Crear/Editar -->
      <div class="modal-overlay" *ngIf="showModal()" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingDept() ? 'Editar Departamento' : 'Nuevo Departamento' }}</h2>
            <button class="btn-close" (click)="closeModal()">×</button>
          </div>
          <form (ngSubmit)="saveDepartment()" class="modal-body">
            <div class="form-group">
              <label>Nombre del departamento</label>
              <input type="text" [(ngModel)]="deptForm.name" name="name" required placeholder="Ej: Desarrollo">
            </div>
            <div class="form-group">
              <label>Descripción</label>
              <textarea [(ngModel)]="deptForm.description" name="description" rows="3" placeholder="Describe las funciones del departamento..."></textarea>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary">
                {{ editingDept() ? 'Guardar Cambios' : 'Crear Departamento' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Ver Usuarios -->
      <div class="modal-overlay" *ngIf="showUsersModal()" (click)="closeUsersModal()">
        <div class="modal modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Usuarios de {{ selectedDept()?.name }}</h2>
            <button class="btn-close" (click)="closeUsersModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="users-list" *ngIf="deptUsers().length > 0">
              <div class="user-item" *ngFor="let user of deptUsers()">
                <div class="user-avatar" [class]="'avatar-' + user.role.toLowerCase()">
                  {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
                </div>
                <div class="user-info">
                  <span class="user-name">{{ user.firstName }} {{ user.lastName }}</span>
                  <span class="user-email">{{ user.email }}</span>
                </div>
                <span class="badge" [class]="'badge-' + user.role.toLowerCase()">
                  {{ getRoleName(user.role) }}
                </span>
              </div>
            </div>
            <div class="empty-users" *ngIf="deptUsers().length === 0">
              <p>No hay usuarios asignados a este departamento</p>
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
      margin-bottom: 2rem;
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
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
    }

    .btn-secondary {
      background: #e5e7eb;
      color: #374151;
    }

    .departments-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .department-card {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .department-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .dept-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .card-actions {
      display: flex;
      gap: 0.25rem;
    }

    .btn-icon {
      width: 28px;
      height: 28px;
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

    .btn-icon.delete:hover {
      background: #fee2e2;
      color: #dc2626;
    }

    .department-card h3 {
      margin: 0 0 0.5rem;
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
    }

    .dept-description {
      color: #6b7280;
      font-size: 0.875rem;
      margin: 0 0 1rem;
      line-height: 1.5;
    }

    .dept-stats {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .dept-stats .stat {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .btn-view-users {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      background: white;
      color: #374151;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }

    .btn-view-users:hover {
      background: #f9fafb;
      border-color: #d1d5db;
    }

    .empty-card {
      background: white;
      border-radius: 1rem;
      padding: 3rem;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      grid-column: 1 / -1;
    }

    .empty-card svg {
      color: #d1d5db;
      margin-bottom: 1rem;
    }

    .empty-card p {
      color: #6b7280;
      margin-bottom: 1.5rem;
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
      max-width: 450px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal.modal-lg {
      max-width: 600px;
    }

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

    .btn-close:hover {
      background: #f3f4f6;
    }

    .modal-body {
      padding: 1.5rem;
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
    .form-group textarea {
      width: 100%;
      padding: 0.625rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-family: inherit;
    }

    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #f59e0b;
      box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
      margin-top: 1rem;
    }

    /* Users list */
    .users-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .user-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      background: #f9fafb;
      border-radius: 0.5rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 0.875rem;
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

    .user-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-weight: 500;
      color: #111827;
    }

    .user-email {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .badge-admin {
      background: #fef3c7;
      color: #92400e;
    }

    .badge-manager {
      background: #ede9fe;
      color: #5b21b6;
    }

    .badge-employee {
      background: #d1fae5;
      color: #065f46;
    }

    .empty-users {
      text-align: center;
      padding: 2rem;
      color: #6b7280;
    }
  `]
})
export class DepartmentsManagementComponent implements OnInit {
  private http = inject(HttpClient);
  
  departments = signal<Department[]>([]);
  showModal = signal(false);
  showUsersModal = signal(false);
  editingDept = signal<Department | null>(null);
  selectedDept = signal<Department | null>(null);
  deptUsers = signal<any[]>([]);
  
  deptForm = {
    name: '',
    description: ''
  };

  ngOnInit() {
    this.loadDepartments();
  }

  loadDepartments() {
    this.http.get<any[]>(`${environment.apiUrl}/departments`)
      .subscribe({
        next: (data) => {
          const departments = data.map(d => ({
            id: d.id,
            name: d.name,
            description: d.description || '',
            usersCount: d.usersCount || d.users?.length || 0
          }));
          this.departments.set(departments);
        },
        error: (err) => {
          console.error('Error al cargar departamentos:', err);
          alert('Error al cargar los departamentos');
        }
      });
  }

  openModal() {
    this.editingDept.set(null);
    this.deptForm = { name: '', description: '' };
    this.showModal.set(true);
  }

  editDepartment(dept: Department) {
    this.editingDept.set(dept);
    this.deptForm = {
      name: dept.name,
      description: dept.description || ''
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingDept.set(null);
  }

  saveDepartment() {
    if (this.editingDept()) {
      this.http.put(`${environment.apiUrl}/departments/${this.editingDept()!.id}`, this.deptForm)
        .subscribe({
          next: () => {
            this.loadDepartments();
            this.closeModal();
          },
          error: (err) => {
            console.error('Error al actualizar departamento:', err);
            alert('Error al actualizar el departamento');
          }
        });
    } else {
      this.http.post(`${environment.apiUrl}/departments`, this.deptForm)
        .subscribe({
          next: () => {
            this.loadDepartments();
            this.closeModal();
          },
          error: (err) => {
            console.error('Error al crear departamento:', err);
            alert('Error al crear el departamento');
          }
        });
    }
  }

  deleteDepartment(dept: Department) {
    if (confirm(`¿Estás seguro de eliminar el departamento "${dept.name}"?`)) {
      this.http.delete(`${environment.apiUrl}/departments/${dept.id}`)
        .subscribe({
          next: () => this.loadDepartments(),
          error: (err) => {
            console.error('Error al eliminar departamento:', err);
            alert('Error al eliminar el departamento. Puede que tenga usuarios asignados.');
          }
        });
    }
  }

  viewDepartmentUsers(dept: Department) {
    this.selectedDept.set(dept);
    this.http.get<any[]>(`${environment.apiUrl}/departments/${dept.id}/users`)
      .subscribe({
        next: (users) => {
          this.deptUsers.set(users);
          this.showUsersModal.set(true);
        },
        error: (err) => {
          console.error('Error al cargar usuarios del departamento:', err);
          alert('Error al cargar los usuarios del departamento');
        }
      });
  }

  closeUsersModal() {
    this.showUsersModal.set(false);
    this.selectedDept.set(null);
  }

  getRoleName(role: string): string {
    switch (role) {
      case 'ADMIN': return 'Admin';
      case 'MANAGER': return 'Gerente';
      case 'EMPLOYEE': return 'Empleado';
      default: return role;
    }
  }
}
