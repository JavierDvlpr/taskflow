import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { LayoutComponent } from '../../../shared/components/layout/layout.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  departmentId?: number;
  departmentName?: string;
  active: boolean;
  createdAt?: string;
}

interface Department {
  id: number;
  name: string;
}

/**
 * Gestión de Usuarios para Admin.
 * CRUD completo de usuarios, asignación de roles y departamentos.
 */
@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent, LoadingComponent],
  template: `
    <app-layout>
    <div class="management-page">
      <!-- Header -->
      <header class="page-header">
        <div>
          <h1>Gestión de Usuarios</h1>
          <p>Administra los usuarios del sistema</p>
        </div>
        <button class="btn btn-primary" (click)="openModal()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo Usuario
        </button>
      </header>

      <!-- Filters -->
      <div class="filters-bar">
        <div class="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Buscar usuario..." [(ngModel)]="searchTerm" (input)="filterUsers()">
        </div>
        <select [(ngModel)]="filterRole" (change)="filterUsers()" class="filter-select">
          <option value="">Todos los roles</option>
          <option value="ADMIN">Administrador</option>
          <option value="MANAGER">Gerente</option>
          <option value="EMPLOYEE">Empleado</option>
        </select>
        <select [(ngModel)]="filterStatus" (change)="filterUsers()" class="filter-select">
          <option value="">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>

      <!-- Loading -->
      <app-loading *ngIf="loading()" message="Cargando usuarios..."></app-loading>

      <!-- Users Table -->
      <div class="table-container" *ngIf="!loading()">
        <table class="data-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Departamento</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of filteredUsers()" [class.inactive]="!user.active">
              <td>
                <div class="user-cell">
                  <div class="avatar" [class]="'avatar-' + user.role.toLowerCase()">
                    {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
                  </div>
                  <span>{{ user.firstName }} {{ user.lastName }}</span>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td>
                <span class="badge" [class]="'badge-' + user.role.toLowerCase()">
                  {{ getRoleName(user.role) }}
                </span>
              </td>
              <td>{{ user.departmentName || 'Sin asignar' }}</td>
              <td>
                <span class="status" [class.active]="user.active" [class.inactive]="!user.active">
                  {{ user.active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td>
                <div class="actions">
                  <button class="btn-icon" title="Editar" (click)="editUser(user)">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button class="btn-icon" [title]="user.active ? 'Desactivar' : 'Activar'" (click)="toggleUserStatus(user)">
                    <svg *ngIf="user.active" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                    <svg *ngIf="!user.active" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="filteredUsers().length === 0">
              <td colspan="6" class="empty-state">
                No se encontraron usuarios
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal -->
      <div class="modal-overlay" *ngIf="showModal()" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingUser() ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>
            <button class="btn-close" (click)="closeModal()">×</button>
          </div>
          <form (ngSubmit)="saveUser()" class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label>Nombre</label>
                <input type="text" [(ngModel)]="userForm.firstName" name="firstName" required>
              </div>
              <div class="form-group">
                <label>Apellido</label>
                <input type="text" [(ngModel)]="userForm.lastName" name="lastName" required>
              </div>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" [(ngModel)]="userForm.email" name="email" required>
            </div>
            <div class="form-group" *ngIf="!editingUser()">
              <label>Contraseña</label>
              <input type="password" [(ngModel)]="userForm.password" name="password" required placeholder="Mínimo 6 caracteres">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Rol</label>
                <select [(ngModel)]="userForm.role" name="role" required>
                  <option value="EMPLOYEE">Empleado</option>
                  <option value="MANAGER">Gerente</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <div class="form-group">
                <label>Departamento</label>
                <select [(ngModel)]="userForm.departmentId" name="departmentId">
                  <option [ngValue]="null">Sin asignar</option>
                  <option *ngFor="let dept of departments()" [ngValue]="dept.id">{{ dept.name }}</option>
                </select>
              </div>
            </div>
            <div class="form-group" *ngIf="editingUser()">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="userForm.active" name="active">
                Usuario activo
              </label>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary">
                {{ editingUser() ? 'Guardar Cambios' : 'Crear Usuario' }}
              </button>
            </div>
          </form>
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background: #e5e7eb;
      color: #374151;
    }

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
      min-width: 250px;
    }

    .search-box svg {
      color: #9ca3af;
    }

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

    .data-table tr.inactive {
      opacity: 0.6;
    }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 0.75rem;
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

    .badge {
      display: inline-block;
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

    .status {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status.active {
      background: #d1fae5;
      color: #065f46;
    }

    .status.inactive {
      background: #fee2e2;
      color: #991b1b;
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
    .form-group select {
      width: 100%;
      padding: 0.625rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 0.875rem;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .checkbox-label input {
      width: auto;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
      margin-top: 1rem;
    }
  `]
})
export class UsersManagementComponent implements OnInit {
  private http = inject(HttpClient);
  
  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  departments = signal<Department[]>([]);
  loading = signal(true);
  
  showModal = signal(false);
  editingUser = signal<User | null>(null);
  
  searchTerm = '';
  filterRole = '';
  filterStatus = '';
  
  userForm = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'EMPLOYEE' as 'ADMIN' | 'MANAGER' | 'EMPLOYEE',
    departmentId: null as number | null,
    active: true
  };

  ngOnInit() {
    this.loadUsers();
    this.loadDepartments();
  }

  loadUsers() {
    this.loading.set(true);
    this.http.get<User[]>(`${environment.apiUrl}/users`)
      .subscribe({
        next: (data) => {
          // Transformar datos del backend al formato del frontend
          const users = data.map(u => ({
            id: u.id,
            email: u.email,
            firstName: u.firstName,
            lastName: u.lastName,
            role: u.role,
            active: u.active,
            departmentId: (u as any).department?.id,
            departmentName: (u as any).department?.name || 'Sin asignar'
          }));
          this.users.set(users);
          this.filterUsers();
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error cargando usuarios:', err);
          this.users.set([]);
          this.filterUsers();
          this.loading.set(false);
        }
      });
  }

  loadDepartments() {
    this.http.get<Department[]>(`${environment.apiUrl}/departments`)
      .subscribe({
        next: (data) => this.departments.set(data),
        error: (err) => {
          console.error('Error cargando departamentos:', err);
          this.departments.set([]);
        }
      });
  }

  filterUsers() {
    let result = this.users();
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(u => 
        u.firstName.toLowerCase().includes(term) ||
        u.lastName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      );
    }
    
    if (this.filterRole) {
      result = result.filter(u => u.role === this.filterRole);
    }
    
    if (this.filterStatus) {
      result = result.filter(u => 
        this.filterStatus === 'active' ? u.active : !u.active
      );
    }
    
    this.filteredUsers.set(result);
  }

  getRoleName(role: string): string {
    switch (role) {
      case 'ADMIN': return 'Administrador';
      case 'MANAGER': return 'Gerente';
      case 'EMPLOYEE': return 'Empleado';
      default: return role;
    }
  }

  openModal() {
    this.editingUser.set(null);
    this.userForm = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'EMPLOYEE',
      departmentId: null,
      active: true
    };
    this.showModal.set(true);
  }

  editUser(user: User) {
    this.editingUser.set(user);
    this.userForm = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      role: user.role,
      departmentId: user.departmentId || null,
      active: user.active
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingUser.set(null);
  }

  saveUser() {
    const payload: any = {
      firstName: this.userForm.firstName,
      lastName: this.userForm.lastName,
      email: this.userForm.email,
      role: this.userForm.role,
      active: this.userForm.active,
      department: this.userForm.departmentId ? { id: this.userForm.departmentId } : null
    };

    if (this.userForm.password) {
      payload.password = this.userForm.password;
    }

    if (this.editingUser()) {
      // Actualizar usuario existente
      this.http.put(`${environment.apiUrl}/users/${this.editingUser()!.id}`, payload)
        .subscribe({
          next: () => {
            this.loadUsers();
            this.closeModal();
          },
          error: (err) => {
            console.error('Error actualizando usuario:', err);
            alert(err.error?.error || 'Error al actualizar usuario');
          }
        });
    } else {
      // Crear nuevo usuario
      if (!this.userForm.password) {
        alert('La contraseña es requerida para nuevos usuarios');
        return;
      }
      this.http.post(`${environment.apiUrl}/users`, payload)
        .subscribe({
          next: () => {
            this.loadUsers();
            this.closeModal();
          },
          error: (err) => {
            console.error('Error creando usuario:', err);
            alert(err.error?.error || 'Error al crear usuario');
          }
        });
    }
  }

  toggleUserStatus(user: User) {
    this.http.patch(`${environment.apiUrl}/users/${user.id}/toggle-status`, {})
      .subscribe({
        next: () => this.loadUsers(),
        error: (err) => {
          console.error('Error cambiando estado:', err);
          alert('Error al cambiar el estado del usuario');
        }
      });
  }
}
